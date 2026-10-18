// Runs after `next build` (see the `build` scripts in package.json).
//
// With zero visible posts, app/blog/[slug] is prerendered for one placeholder
// param (EMPTY_SLUG_PARAM in lib/blog/index.ts) because `output: "export"`
// refuses a dynamic route with no params at all. That page is the 404, but it
// still lands in out/blog/<param>/. Delete it, so a build with no published
// posts contains no post directory (02 §6 AC-2).

import { existsSync, rmSync } from "node:fs";
import path from "node:path";

// Keep in sync with EMPTY_SLUG_PARAM in lib/blog/index.ts.
const EMPTY_SLUG_PARAM = "__no-posts";

const dir = path.join(process.cwd(), "out", "blog", EMPTY_SLUG_PARAM);
if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`[blog] no published posts: removed placeholder out/blog/${EMPTY_SLUG_PARAM}/`);
}
