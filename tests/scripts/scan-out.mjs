#!/usr/bin/env node
// SEC-01 / SEC-02: scan a static export (and optionally a git diff) for secrets and
// unsafe leftovers. Reports the LOCATION of each finding, never the matched value.
//
//   node tests/scripts/scan-out.mjs [dir=out]
//   node tests/scripts/scan-out.mjs --git [base=origin/master]   # scans `git log -p base..HEAD`
//
// Allowed: the two documented public values NEXT_PUBLIC_CONTACT_ENDPOINT and
// NEXT_PUBLIC_CONTACT_ACCESS_KEY (whatever they are set to in the environment).
// Exit 1 when anything is found.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const RULES = [
  { rule: "github-token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/g },
  { rule: "github-fine-grained-pat", re: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/g },
  { rule: "notion-secret", re: /\b(?:secret_[A-Za-z0-9]{30,}|ntn_[A-Za-z0-9]{30,})\b/g },
  { rule: "stripe-like-sk", re: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g },
  { rule: "openai-like-sk", re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/g },
  { rule: "private-key", re: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g },
  { rule: "notion-token-name", re: /\bNOTION_TOKEN\b/g },
  { rule: "aws-access-key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { rule: "slack-token", re: /\bxox[abpors]-[A-Za-z0-9-]{10,}\b/g },
  { rule: "absolute-local-path", re: /(?:\/Users\/[A-Za-z0-9._-]+\/|\/home\/(?!runner\/work\/_temp)[A-Za-z0-9._-]+\/|[A-Z]:\\\\Users\\\\)/g },
  { rule: "localhost-url", re: /\bhttps?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?/g },
];

const TEXT_EXT = new Set([".html", ".txt", ".js", ".mjs", ".css", ".json", ".xml", ".map", ".svg", ".yml", ".yaml", ".md", ".webmanifest"]);

/** Values from local .env* files that must not appear in out/ (except the public contact pair). */
function envValues() {
  const allowedKeys = new Set(["NEXT_PUBLIC_CONTACT_ENDPOINT", "NEXT_PUBLIC_CONTACT_ACCESS_KEY"]);
  const values = [];
  for (const name of existsSync(repo) ? readdirSync(repo) : []) {
    if (!name.startsWith(".env") || name === ".env.example") continue;
    for (const line of readFileSync(path.join(repo, name), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (m && !allowedKeys.has(m[1]) && m[2].length >= 8) values.push({ key: m[1], value: m[2], file: name });
    }
  }
  return values;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function scanText(text, where, env, findings) {
  const allowed = [process.env.NEXT_PUBLIC_CONTACT_ENDPOINT, process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY].filter(Boolean);
  for (const { rule, re } of RULES) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      if (allowed.some((a) => m[0].includes(a) || a.includes(m[0]))) continue;
      findings.push({ rule, location: `${where}:${lineOf(text, m.index)}` });
    }
  }
  for (const e of env) {
    const i = text.indexOf(e.value);
    if (i >= 0) findings.push({ rule: `env-value:${e.key} (from ${e.file})`, location: `${where}:${lineOf(text, i)}` });
  }
  // The machine's home directory, whatever the user name.
  const home = os.homedir();
  if (home && home.length > 3) {
    const i = text.indexOf(home);
    if (i >= 0) findings.push({ rule: "home-directory", location: `${where}:${lineOf(text, i)}` });
  }
}

export function scan(dir) {
  const root = path.resolve(dir);
  const env = envValues();
  const findings = [];
  for (const file of walk(root)) {
    if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;
    if (statSync(file).size > 20 * 1024 * 1024) continue;
    scanText(readFileSync(file, "utf8"), path.relative(process.cwd(), file), env, findings);
  }
  return findings;
}

export function scanGit(base = "origin/master") {
  const r = spawnSync("git", ["log", "-p", "--no-color", `${base}..HEAD`], { cwd: repo, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git log failed: ${r.stderr}`);
  const findings = [];
  // Scan added lines only, attributed to commit + file.
  let commit = "?";
  let file = "?";
  const added = [];
  for (const line of r.stdout.split("\n")) {
    if (line.startsWith("commit ")) commit = line.slice(7, 19);
    else if (line.startsWith("+++ b/")) file = line.slice(6);
    else if (line.startsWith("+") && !line.startsWith("+++")) added.push({ where: `${commit}:${file}`, text: line.slice(1) });
  }
  const env = envValues();
  // Docs and tests legitimately mention token prefixes, NOTION_TOKEN, localhost and
  // example paths, so in git history only full-length secret shapes, private keys,
  // .env values and this machine's home directory count.
  const docOnly = new Set(["absolute-local-path", "localhost-url", "notion-token-name"]);
  for (const a of added) scanText(a.text, a.where, env, findings);
  return findings.filter((f) => !docOnly.has(f.rule));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let findings;
  let label;
  if (args[0] === "--git") {
    label = `git ${args[1] ?? "origin/master"}..HEAD`;
    findings = scanGit(args[1]);
  } else {
    const dir = args[0] ?? "out";
    if (!existsSync(dir)) {
      console.error(`scan-out: ${dir} does not exist`);
      process.exit(2);
    }
    label = dir;
    findings = scan(dir);
  }
  for (const f of findings) console.log(`FINDING ${f.rule} at ${f.location}`);
  console.log(`scan-out: ${findings.length} finding(s) in ${label}`);
  process.exit(findings.length ? 1 : 0);
}
