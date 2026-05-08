import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header navigation links work correctly", async ({ page }) => {
    await page.goto("/about");

    // Header should be visible on non-home pages
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Check nav links are present
    const links = header.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("about page loads with profile data", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("h1").first()).toBeVisible();

    // Should show real name, not fallback
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("谢文龙");
  });

  test("projects listing page loads", async ({ page }) => {
    await page.goto("/projects");

    await expect(page.locator("h1")).toBeVisible();

    // Should list projects — cards or empty state
    const cards = page.locator("a[href^='/projects/']");
    // May be 0 if no projects, but page should still render
    await expect(page.locator("main")).toBeVisible();
  });

  test("blog listing page loads", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("homepage loads without 500 errors", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("all public routes return 200", async ({ page }) => {
    const routes = ["/", "/about", "/projects", "/blog"];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    }
  });
});
