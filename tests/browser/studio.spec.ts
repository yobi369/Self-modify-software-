import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const tabs = [
  "architecture",
  "live_sandbox",
  "hex_inspector",
  "metamorphic_engine",
  "reality_verification",
  "security_defense",
  "ai_architect",
  "evidence_suite",
];

test("research studio loads with accessible primary landmarks", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Self-Modifying Software Studio/);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.locator("#tab-architecture")).toHaveAttribute("aria-pressed", "true");
});

test("all primary research sections can be opened without browser exceptions", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");

  for (const tab of tabs) {
    const button = page.locator(`#tab-${tab}`);
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("main")).not.toBeEmpty();
  }

  expect(pageErrors).toEqual([]);
});


test("keyboard users can skip directly to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("primary navigation supports keyboard activation", async ({ page }) => {
  await page.goto("/");
  const target = page.locator("#tab-live_sandbox");
  await target.focus();
  await page.keyboard.press("Enter");
  await expect(target).toHaveAttribute("aria-pressed", "true");
});

test("mobile layout keeps the page within the viewport and navigation scrollable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  const navDimensions = await navigation.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(navDimensions.scrollWidth).toBeGreaterThan(navDimensions.clientWidth);
});

for (const tab of tabs) {
  test(`research module ${tab} meets WCAG 2.1 A/AA accessibility checks`, async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium-desktop", "Run axe checks on desktop Chromium; all browser projects retain navigation and responsive E2E coverage.");
    await page.goto("/");
    const button = page.locator(`#tab-${tab}`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("main h1").first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations,
      `${tab}: ${results.violations
        .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
        .join("\n")}`,
    ).toEqual([]);
  });
}

test("AI analysis and mutation endpoints remain disabled in the browser-served app", async ({ request }) => {
  for (const route of ["/api/ai/analyze", "/api/ai/mutate"]) {
    const response = await request.post(route, {
      data: { code: "int main(void) { return 0; }", language: "c" },
    });
    expect(response.status()).toBe(503);
    expect(await response.json()).toMatchObject({ code: "AI_API_DISABLED" });
  }
});
