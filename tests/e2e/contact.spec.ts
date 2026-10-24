// CON-* (04 §5.3). The provider is ALWAYS stubbed with page.route: builds B0–B2 point
// NEXT_PUBLIC_CONTACT_ENDPOINT at a non-routable stub origin (build-matrix.mjs), and
// any other cross-origin POST is aborted and counted, so no test can reach a real
// provider. Cases mark themselves fixme until F-3 builds /contact/.

import { expect, test, type Page, type Request } from "@playwright/test";

import { BUILD, needs, onlyOn, STUB_ENDPOINT, STUB_PATTERN, watchConsole } from "./helpers";

type Stub = { status?: number; body?: string; delayMs?: number; abort?: boolean };

/** Route the stub provider; returns the list of captured provider requests. */
async function stubProvider(page: Page, stub: Stub = {}) {
  const requests: Request[] = [];
  await page.route(STUB_PATTERN, async (route) => {
    requests.push(route.request());
    if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
    if (stub.abort) return route.abort("failed");
    await route.fulfill({
      status: stub.status ?? 200,
      contentType: "application/json",
      body: stub.body ?? JSON.stringify({ success: true, message: "Email sent successfully!" }),
    });
  });
  // Safety net: no other third-party POST may leave the browser.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost).*/, (route) =>
    new URL(route.request().url()).origin === new URL(STUB_ENDPOINT).origin
      ? route.fallback() // Let the stub registered above handle its own test origin.
      : route.request().method() === "POST" ? (requests.push(route.request()), route.abort()) : route.continue(),
  );
  return requests;
}

const field = {
  name: (p: Page) => p.getByLabel(/^Name/),
  email: (p: Page) => p.getByLabel(/^Email/),
  subject: (p: Page) => p.getByLabel(/^Subject/),
  message: (p: Page) => p.getByRole("textbox", { name: "Message", exact: true }),
};

async function fillValid(page: Page, over: Partial<Record<keyof typeof field, string>> = {}) {
  await field.name(page).fill(over.name ?? "QA Tester");
  await field.email(page).fill(over.email ?? "qa+tag@sub.example.co");
  await field.subject(page).fill(over.subject ?? "QA subject");
  await field.message(page).fill(over.message ?? "This is a QA test message, long enough.");
}

/** Wait past the 3 s time-trap so a submit counts as human. */
async function openForm(page: Page, wait = true) {
  await page.goto("/contact/", { waitUntil: "networkidle" });
  if (wait) await page.waitForTimeout(3_100);
}

test.beforeEach(() => {
  needs("contact", "F-3");
});

test("CON-01 page, labelled fields, honeypot hidden from users and AT, fallback present", async ({ page }) => {
  const messages = watchConsole(page);
  await stubProvider(page);
  await openForm(page, false);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByTestId("contact-form")).toBeVisible();
  for (const f of Object.values(field)) await expect(f(page)).toBeVisible();
  const honeypot = page.locator('[name="botcheck"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).not.toBeInViewport();
  await expect(honeypot.locator("..")).toHaveAttribute("aria-hidden", "true");
  expect(await honeypot.getAttribute("tabindex")).toBe("-1");
  const snapshot = await page.locator("form").ariaSnapshot();
  expect(snapshot).not.toMatch(/botcheck/i);
  await expect(page.locator('a[href^="mailto:"]').first()).toBeAttached();
  expect(messages, messages.join("\n")).toEqual([]);
});

test("CON-02 empty submit: focused summary, aria-invalid + describedby, no request", async ({ page }) => {
  const requests = await stubProvider(page);
  await openForm(page);
  await page.getByTestId("contact-submit").click();
  const summary = page.getByTestId("contact-error-summary");
  await expect(summary).toBeVisible();
  await expect(summary.locator(":focus").or(summary.and(page.locator(":focus")))).toHaveCount(1);
  for (const f of [field.name, field.email, field.message]) {
    await expect(f(page)).toHaveAttribute("aria-invalid", "true");
    await expect(f(page)).toHaveAttribute("aria-describedby", /.+/);
  }
  await summary.getByRole("link").first().click();
  await expect(field.name(page)).toBeFocused();
  expect(requests).toHaveLength(0);
});

test("CON-03 email validation", async ({ page }) => {
  const requests = await stubProvider(page);
  await openForm(page);
  for (const bad of ["a", "a@b", "a b@c.d", `${"a".repeat(290)}@example.com`]) {
    await fillValid(page, { email: bad });
    await page.getByTestId("contact-submit").click();
    await expect(field.email(page), bad).toHaveAttribute("aria-invalid", "true");
  }
  expect(requests).toHaveLength(0);
  await fillValid(page, { email: "a+tag@sub.example.co" });
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-success")).toBeVisible();
});

test("CON-04 message length boundaries", async ({ page }) => {
  await stubProvider(page);
  await openForm(page);
  await fillValid(page, { message: "x".repeat(9) });
  await page.getByTestId("contact-submit").click();
  await expect(field.message(page)).toHaveAttribute("aria-invalid", "true");
  await fillValid(page, { message: "x".repeat(10) });
  await expect(field.message(page)).not.toHaveAttribute("aria-invalid", "true");
  // maxlength normally stops 5001; the counter appears past 80%.
  await field.message(page).fill("x".repeat(4_100));
  await expect(page.getByText(/\/ 5,000/)).toBeVisible();
  await field.message(page).fill("x".repeat(5_001));
  expect((await field.message(page).inputValue()).length).toBeLessThanOrEqual(5_000);
});

test("CON-05 valid submit: pending state, success focus, allowed body keys", async ({ page }) => {
  const requests = await stubProvider(page, { delayMs: 800 });
  await openForm(page);
  await fillValid(page);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-submit")).toHaveText(/Sending/);
  const success = page.getByTestId("contact-success");
  await expect(success).toBeVisible();
  await expect(success).toBeFocused();
  await expect(page.locator("#main")).not.toContainText("This is a QA test message");
  expect(requests).toHaveLength(1);
  const body = requests[0].postDataJSON() as Record<string, unknown>;
  expect(body.botcheck ?? "").toBe("");
  expect(Object.keys(body).sort()).toEqual(expect.arrayContaining(["email", "message", "name"]));
});

test("CON-06 double click sends exactly one request", async ({ page }) => {
  const requests = await stubProvider(page, { delayMs: 500 });
  await openForm(page);
  await fillValid(page);
  await page.getByTestId("contact-submit").dblclick();
  await expect(page.getByTestId("contact-success")).toBeVisible();
  expect(requests).toHaveLength(1);
});

const failures: [string, Stub, RegExp][] = [
  ["CON-07 429 rate limited", { status: 429, body: JSON.stringify({ success: false, message: "Too many requests" }) }, /Too many messages/],
  ["CON-08 400 validation", { status: 400, body: JSON.stringify({ success: false, message: "Invalid" }) }, /rejected something/],
  ["CON-08 500 provider", { status: 500, body: "oops" }, /had a problem/],
  ["CON-08 malformed JSON", { status: 200, body: "{not json" }, /had a problem|Could not reach/],
  ["CON-08 network abort", { abort: true }, /Could not reach/],
];
for (const [name, stub, copy] of failures) {
  test(`${name}: failure panel, fallback, values preserved`, async ({ page }) => {
    await stubProvider(page, stub);
    await openForm(page);
    await fillValid(page);
    await page.getByTestId("contact-submit").click();
    await expect(page.getByText(copy)).toBeVisible();
    await expect(page.getByTestId("contact-fallback")).toBeVisible();
    await expect(field.message(page)).toHaveValue("This is a QA test message, long enough.");
  });
}

test("CON-08 slow provider: 'Still sending' at 8 s, timeout at 15 s", async ({ page }) => {
  test.setTimeout(60_000);
  await stubProvider(page, { delayMs: 20_000 });
  await openForm(page);
  await fillValid(page);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByText(/Still sending/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Could not reach|had a problem/)).toBeVisible({ timeout: 10_000 });
});

test("CON-09 offline: network-error state, no uncaught exception", async ({ page, context }) => {
  const messages = watchConsole(page);
  await stubProvider(page, { abort: true });
  await openForm(page);
  await fillValid(page);
  await context.setOffline(true);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByText(/Could not reach/)).toBeVisible();
  expect(messages.filter((m) => m.startsWith("pageerror"))).toEqual([]);
});

test("CON-10 honeypot filled: no request, designed spam behaviour", async ({ page }) => {
  const requests = await stubProvider(page);
  await openForm(page);
  await fillValid(page);
  await page.locator('[name="botcheck"]').evaluate((el: HTMLInputElement) => {
    el.value = "bot";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-success")).toBeVisible(); // D-2: honeypot = silent success
  expect(requests).toHaveLength(0);
});

test("CON-11 submit under 3 s is held as spam; 3.1 s succeeds", async ({ page }) => {
  const requests = await stubProvider(page);
  await openForm(page, false);
  await fillValid(page);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByText(/spam filter held/)).toBeVisible();
  expect(requests).toHaveLength(0);
});

test("CON-12 CR/LF header injection is not sent verbatim", async ({ page }) => {
  const requests = await stubProvider(page);
  await openForm(page);
  await fillValid(page, { name: "x\r\nBcc: a@b.c", subject: "s\r\nBcc: a@b.c" });
  await page.getByTestId("contact-submit").click();
  await page.waitForTimeout(500);
  for (const r of requests) expect(r.postData() ?? "").not.toMatch(/\r\nBcc:|\\r\\nBcc:/);
});

test("CON-13 HTML payloads are never rendered as HTML", async ({ page }) => {
  await stubProvider(page, { status: 400, body: JSON.stringify({ success: false, message: "<img src=x onerror=window.__qaPwned=1>" }) });
  await openForm(page);
  await fillValid(page, { name: "<b>bold</b>", message: "<img src=x onerror=window.__qaPwned=1> long enough" });
  await page.getByTestId("contact-submit").click();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { __qaPwned?: number }).__qaPwned)).toBeUndefined();
  await expect(page.locator("#main b", { hasText: "bold" })).toHaveCount(0);
});

test("CON-14 B4 (no config): neutral email fallback, no false failure", async ({ page }) => {
  onlyOn("B4");
  const messages = watchConsole(page);
  await openForm(page, false);
  await expect(page.getByTestId("contact-unconfigured")).toBeVisible();
  await expect(page.getByText("Message not sent", {exact:true})).toHaveCount(0);
  await expect(page.getByTestId("contact-form")).toHaveCount(0);
  await expect(page.locator('#main a[href^="mailto:"]')).toBeVisible();
  expect(messages.filter((m) => m.startsWith("pageerror"))).toEqual([]);
});

test("CON-15 Send another resets the form and focuses Name", async ({ page }) => {
  await stubProvider(page);
  await openForm(page);
  await fillValid(page);
  await page.getByTestId("contact-submit").click();
  await page.getByRole("button", { name: "Send another" }).click();
  await expect(field.name(page)).toBeFocused();
  await expect(field.message(page)).toHaveValue("");
});

test("CON-16 keyboard-only: tab order reaches submit, no trap", async ({ page }) => {
  await stubProvider(page);
  await openForm(page);
  const order: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() => document.activeElement?.getAttribute("name") ?? document.activeElement?.getAttribute("data-testid") ?? document.activeElement?.tagName);
    order.push(String(id));
    if (id === "contact-submit") break;
  }
  expect(order).not.toContain("botcheck");
  expect(order).toContain("contact-submit");
});

test("CON-22 consent line matches copy.md", async ({ page }) => {
  await openForm(page, false);
  await expect(page.getByText("Messages go through a third-party form service to my inbox")).toBeVisible();
});

test("contact stub sanity: build is configured with the stub endpoint", async ({ page }) => {
  test.skip(BUILD === "B4", "B4 is unconfigured by design");
  const requests = await stubProvider(page);
  await openForm(page);
  await fillValid(page);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-success")).toBeVisible();
  expect(requests[0]?.url()).toMatch(/contact-stub\.qa\.invalid/);
});
