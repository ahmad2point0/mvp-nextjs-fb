import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("login form validates required fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("login form validates email format", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("not-an-email");
    await page.getByPlaceholder("Password").fill("123456");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
  });

  test("login form validates password length", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Password").fill("123");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(
      page.getByText("Password must be at least 6 characters")
    ).toBeVisible();
  });

  test("register form validates all fields", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /register/i }).click();
    await expect(page.getByText("Please select a role")).toBeVisible();
  });

  test("register form validates password match", async ({ page }) => {
    await page.goto("/register");
    await page.locator("select").selectOption("donor");
    await page.getByPlaceholder("Full Name").fill("Test User");
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Password", { exact: true }).fill("password123");
    await page.getByPlaceholder("Confirm Password").fill("password456");
    await page.getByRole("button", { name: /register/i }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("unauthenticated users are redirected from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("logout page shows confirmation", async ({ page }) => {
    await page.goto("/logout");
    await expect(page.getByText("Log Out")).toBeVisible();
    await expect(page.getByText("Yes, Log Out")).toBeVisible();
  });
});
