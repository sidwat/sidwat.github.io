import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

// QA harness (docs/04-qa-plan.md §3–§4). Tests run against a static export, never
// `next dev`:
//   pnpm build                                  # or: node tests/scripts/build-matrix.mjs B1
//   QA_BUILD=B0 pnpm test:e2e                   # serves ./out on :4173
//   QA_BUILD=B1 QA_OUT_DIR=node_modules/.cache/qa/out-B1 pnpm test:e2e
// QA_BUILD tells specs which build they are looking at (B0 B1 B1X B2 B4), so
// build-specific cases skip themselves elsewhere.
//
// Artifacts go under node_modules/.cache/qa (already git-ignored) unless
// QA_ARTIFACTS is set, so a local run leaves the working tree clean.

const port = Number(process.env.QA_PORT ?? 4173);
const outDir = process.env.QA_OUT_DIR ?? "out";
const artifacts = path.resolve(process.env.QA_ARTIFACTS ?? "node_modules/.cache/qa");
const ci = !!process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: path.join(artifacts, "test-results"),
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: path.join(artifacts, "playwright-report"), open: "never" }],
    ["json", { outputFile: path.join(artifacts, "playwright-results.json") }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node tests/scripts/serve-out.mjs ${JSON.stringify(outDir)} ${port}`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !ci,
    timeout: 30_000,
  },
  // 04 §4: three engines on desktop plus three emulated devices. Emulation is not a
  // real-device result; real devices are manual cases in docs/qa/test-log.md.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "iphone-13", use: { ...devices["iPhone 13"] } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
    { name: "ipad", use: { ...devices["iPad (gen 7)"] } },
  ],
});
