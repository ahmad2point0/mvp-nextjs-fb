import { test, expect } from "@playwright/test";

test.describe("Dashboard (unauthenticated)", () => {
  test("redirects to login for /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("redirects to login for /dashboard/donations", async ({ page }) => {
    await page.goto("/dashboard/donations");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("redirects to login for /dashboard/admin", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("redirect includes return path", async ({ page }) => {
    await page.goto("/dashboard/aid-requests");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("redirect=%2Fdashboard%2Faid-requests");
  });
});
