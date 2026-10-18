// A11Y-01 / A11Y-08 (04 §5.8): axe-core, WCAG 2.2 A/AA rules, both grounds.
// Target: 0 critical/serious on the new pages. Existing pages are scanned too so a
// regression shows; their pre-existing findings are filed in docs/qa-report.md.

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { EXISTING_PAGES, expectNoSkippedLevels, GROUNDS, has, headingLevels, useGround } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Pre-existing findings on origin/master, filed in docs/qa-report.md. Matching nodes
// are reported as annotations instead of failures so that only NEW violations fail.
// Remove an entry once its bug is fixed-verified.
// BUG-002 is only tolerated on the old nav: F-4 rebuilds the nav with 28/44px hit
// areas (docs/design/contact.md §8), so the new nav must pass target-size outright.
const KNOWN: { bug: string; rule: string; target: RegExp; active?: () => boolean }[] = [
  { bug: "BUG-001", rule: "color-contrast", target: /text-muted\\?\/(60|80)/ },
  { bug: "BUG-002", rule: "target-size", target: /eyebrow|aria-current|href\$="(experience|publications|projects|teaching|blog|gallery)\/"/, active: () => !has.newNav() },
];

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const out: string[] = [];
  for (const v of results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")) {
    const fresh = v.nodes.filter((n) => {
      const target = n.target.join(" ");
      const known = KNOWN.find((k) => k.rule === v.id && k.target.test(target) && (k.active?.() ?? true));
      if (known) test.info().annotations.push({ type: known.bug, description: `${v.id}: ${target}` });
      return !known;
    });
    if (fresh.length) out.push(`${v.id} (${v.impact}): ${fresh.map((n) => n.target.join(" ")).slice(0, 5).join(" | ")}`);
  }
  return out;
}

// Full motion, so content hidden under reduced motion (e.g. the home hover hint) is
// scanned too; wait for entrance animations to settle before analysing.
test.use({ reducedMotion: "no-preference" });
const SETTLE_MS = 1_500;

const NEW_PAGES: [string, () => boolean, string][] = [
  ["/blog/", has.blog, "F-2"],
  ["/contact/", has.contact, "F-3"],
  ["/admin/", has.admin, "I-2"],
];

for (const ground of GROUNDS) {
  for (const [path, present, task] of NEW_PAGES) {
    test(`A11Y-01 ${path} (${ground}): no critical/serious axe violations`, async ({ page }) => {
      test.fixme(!present(), `pending ${task}`);
      await useGround(page, ground);
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(SETTLE_MS);
      const v = await seriousViolations(page);
      expect(v, v.join("\n")).toEqual([]);
    });
  }

  for (const path of EXISTING_PAGES) {
    test(`A11Y-01 existing ${path} (${ground}): no critical/serious axe violations`, async ({ page }) => {
      await useGround(page, ground);
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(SETTLE_MS);
      const v = await seriousViolations(page);
      expect(v, v.join("\n")).toEqual([]);
    });
  }
}

test("A11Y-08 heading outline on new pages", async ({ page }) => {
  test.fixme(!has.blog() || !has.contact(), "pending F-2/F-3");
  for (const path of ["/blog/", "/contact/"]) {
    await page.goto(path);
    expectNoSkippedLevels(await headingLevels(page));
  }
});

test("A11Y main landmark present (Tech Lead ruling: <main id=main>)", async ({ page }) => {
  await page.goto("/");
  test.fixme((await page.locator("main#main").count()) === 0, "pending Frontend: layout still uses <div id=main> (STATUS Requests R-4)");
  await expect(page.getByRole("main")).toHaveCount(1);
});
