import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { appendFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const directory = path.resolve(root, "node_modules/.cache/release-qa");
const smokeOnly = process.argv.includes("--smoke");
if (process.argv.slice(2).some(arg => arg !== "--smoke")) throw new Error("Usage: release-qa.mjs [--smoke]");
await mkdir(directory, { recursive: true });
await rm(path.join(directory, "browser/playwright-results.json"), { force: true });
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const report = {
  startedAt: new Date().toISOString(), commit: git("rev-parse", "HEAD"),
  dirty: Boolean(git("status", "--porcelain")), mode: smokeOnly ? "existing export" : "fresh export",
  theme: JSON.parse(await readFile("lib/visual-theme.json", "utf8")).active,
  verdict: "BLOCKED", steps: [], browser: { passed: 0, failed: 0, skipped: 0, flaky: 0 }, notes: [],
};
async function digestFiles(files) {
  const hash = createHash("sha256");
  for (const file of [...files].sort()) {
    hash.update(file + "\0");
    try { for await (const chunk of createReadStream(file)) hash.update(chunk); }
    catch (error) { if (error.code === "ENOENT") hash.update("deleted"); else throw error; }
  }
  return hash.digest("hex");
}
async function sourceDigest() {
  const files = git("ls-files", "--cached", "--others", "--exclude-standard").split("\n")
    .filter(f => /^(app\/|components\/|lib\/|content\/|public\/|tests\/|scripts\/|package\.json$|pnpm-lock\.yaml$|next\.config\.|postcss\.config\.|tsconfig\.json$|playwright\.config\.)/.test(f));
  const hash = createHash("sha256").update(await digestFiles([...files, ".env", ".env.local", ".env.production", ".env.production.local"]));
  // Record a digest, never the values, of build-time provider settings.
  for (const key of ["NEXT_PUBLIC_CONTACT_ENDPOINT", "NEXT_PUBLIC_CONTACT_ACCESS_KEY", "BLOG_INCLUDE_DRAFTS"]) hash.update(key + "=" + (process.env[key] ?? ""));
  return hash.digest("hex");
}
async function exportDigest(dir = "out") {
  const files = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file); else if (entry.isFile()) files.push(file);
    }
  }
  await walk(dir);
  return digestFiles(files);
}
async function run(name, args, env = process.env) {
  const log = path.join(directory, name + ".log");
  await writeFile(log, "");
  const started = Date.now();
  const result = await new Promise(resolve => {
    const child = spawn("pnpm", args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    for (const stream of [child.stdout, child.stderr]) stream.on("data", chunk => { output += chunk; process.stdout.write(chunk); });
    child.on("error", error => resolve({ code: 1, output: output + "\n" + error.message }));
    child.on("close", code => resolve({ code: code ?? 1, output }));
  });
  await writeFile(log, result.output);
  report.steps.push({ name, status: result.code === 0 ? "PASS" : "FAIL", exitCode: result.code, seconds: Math.round((Date.now() - started) / 1000), log });
  if (result.code !== 0) throw new Error(`${name} failed; see ${log}`);
}
function summarize(suite) {
  for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) {
    const status = test.results?.at(-1)?.status;
    if (status === "passed") report.browser.passed++;
    else if (status === "skipped") report.browser.skipped++;
    else report.browser.failed++;
    if (test.status === "flaky") report.browser.flaky++;
    for (const annotation of test.annotations ?? []) if (annotation.type === "skip") report.notes.push(`${spec.title}: ${annotation.description ?? "skipped"}`);
  }
  for (const child of suite.suites ?? []) summarize(child);
}
try {
  const source = await sourceDigest();
  const manifestFile = path.join(directory, "build.json");
  if (!smokeOnly) {
    await run("lint", ["lint"]);
    await run("types", ["exec", "tsc", "--noEmit"]);
    await run("build", ["run", "build:webpack"]);
    await writeFile(manifestFile, JSON.stringify({ source, export: await exportDigest(), builtAt: new Date().toISOString(), commit: report.commit }, null, 2));
  }
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  if (manifest.source !== await sourceDigest() || manifest.export !== await exportDigest()) throw new Error("Export is stale or does not match this candidate. Run pnpm qa:release to build and test it together.");
  report.artifact = manifest;
  await run("smoke", ["exec", "playwright", "test", "release-smoke.spec.ts", "--project=chromium", "--workers=2"], {
    ...process.env, CI: "1", QA_PORT: process.env.QA_PORT ?? "4193", QA_OUT_DIR: "out", QA_ARTIFACTS: path.join(directory, "browser"),
  });
  if (await sourceDigest() !== manifest.source || await exportDigest() !== manifest.export) throw new Error("Candidate changed during QA; rerun for the final files.");
  report.verdict = "PASS";
} catch (error) {
  report.error = error.message;
} finally {
  try { summarize(JSON.parse(await readFile(path.join(directory, "browser/playwright-results.json"), "utf8"))); }
  catch { report.notes.push("Browser results unavailable; inspect the failed or unrun step."); }
  if (!report.steps.some(step => step.name === "smoke")) report.notes.push("Browser checks NOT RUN because an earlier prerequisite failed.");
  if (report.verdict === "PASS" && report.browser.passed === 0) { report.verdict = "BLOCKED"; report.error = "No successful browser checks were recorded."; }
  if (report.browser.flaky) report.notes.push(`${report.browser.flaky} browser check(s) passed only after retry.`);
  report.notes.push("Contact submissions are simulated. Real inbox delivery, external destination availability, editorial accuracy and physical-device behavior are not certified by this basic gate.");
  report.finishedAt = new Date().toISOString();
  const markdown = `# Website release QA: ${report.verdict}\n\nCandidate: ${report.commit}${report.dirty ? " (dirty checkout; artifact/source digests recorded)" : ""}\n\nTheme: ${report.theme}; ${report.mode}.\n\n` +
    report.steps.map(s => `- ${s.status}: ${s.name} (${s.seconds}s), log: ${path.relative(root, s.log)}`).join("\n") +
    `\n\nBrowser: ${report.browser.passed} passed, ${report.browser.failed} failed, ${report.browser.skipped} skipped.\n\n` +
    (report.error ? `Blocker: ${report.error}\n\n` : "") + report.notes.map(note => `- ${note}`).join("\n") + "\n";
  await writeFile(path.join(directory, "report.json"), JSON.stringify(report, null, 2) + "\n");
  await writeFile(path.join(directory, "report.md"), markdown);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  console.log(`\n${report.verdict}: ${path.join(directory, "report.md")}`);
}
process.exitCode = report.verdict === "PASS" ? 0 : 1;
