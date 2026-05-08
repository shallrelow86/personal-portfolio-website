import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads without errors and shows hero section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#hero")).toBeVisible();

    // Hero should have a non-empty h1 (real data or fallback)
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.length).toBeGreaterThan(0);

    // Key UI elements visible
    await expect(page.getByText("Available for hire")).toBeVisible();
    await expect(page.getByRole("link", { name: "关于" })).toBeVisible();
    await expect(page.getByRole("button", { name: "项目" })).toBeVisible();
    await expect(page.getByRole("button", { name: "博客" })).toBeVisible();
    await expect(page.getByRole("button", { name: "查看我的作品" })).toBeVisible();
  });

  test("scroll buttons cause the main container to scroll down", async ({ page }) => {
    await page.goto("/");

    const mainEl = page.locator("main.snap-y");
    const initialScroll = await mainEl.evaluate((el) => el.scrollTop);

    // Click CTA button
    await page.getByRole("button", { name: "查看我的作品" }).click();
    await page.waitForTimeout(1000);

    const newScroll = await mainEl.evaluate((el) => el.scrollTop);
    // Scroll position should have changed (scrolling down)
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test("project cards exist and have valid hrefs when projects are loaded", async ({ page }) => {
    await page.goto("/");

    // Check if projects section exists
    const projectsSection = page.locator("#projects");
    const hasProjects = (await projectsSection.count()) > 0;

    if (hasProjects) {
      const links = page.locator("#projects a[href^='/projects/']");
      const linkCount = await links.count();
      if (linkCount > 0) {
        const href = await links.first().getAttribute("href");
        expect(href).toMatch(/\/projects\/.+/);
      }
    }
  });

  test("blog post links exist and have valid hrefs when posts are loaded", async ({ page }) => {
    await page.goto("/");

    const blogSection = page.locator("#blog");
    const hasBlog = (await blogSection.count()) > 0;

    if (hasBlog) {
      const links = page.locator("#blog a[href^='/blog/']");
      const linkCount = await links.count();
      if (linkCount > 0) {
        const href = await links.first().getAttribute("href");
        expect(href).toMatch(/\/blog\/.+/);
      }
    }
  });

  test("can navigate from homepage to project detail by clicking card", async ({ page }) => {
    await page.goto("/");

    // Check if projects are rendered
    const projectLinks = page.locator("#projects a[href^='/projects/']");
    if ((await projectLinks.count()) === 0) {
      test.skip(true, "No project cards found — Sanity data may be empty");
      return;
    }

    const href = await projectLinks.first().getAttribute("href");
    await projectLinks.first().click();

    await expect(page).toHaveURL(href!);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("can navigate from homepage to blog post by clicking link", async ({ page }) => {
    await page.goto("/");

    const blogLinks = page.locator("#blog a[href^='/blog/']");
    if ((await blogLinks.count()) === 0) {
      test.skip(true, "No blog links found — Sanity data may be empty");
      return;
    }

    const href = await blogLinks.first().getAttribute("href");
    await blogLinks.first().click();

    await expect(page).toHaveURL(href!);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("'关于' link navigates to about page", async ({ page }) => {
    await page.goto("/");

    // Use page.click on the native anchor
    await page.click('a[href="/about"]');

    await expect(page).toHaveURL("/about");
  });
});
