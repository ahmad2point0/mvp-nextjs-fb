import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("home page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CSEAS/);
    await expect(
      page.getByRole("heading", { name: /Empowering Education/i })
    ).toBeVisible();
    await expect(page.getByText("Get Started")).toBeVisible();
  });

  test("home page has all sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("System Modules")).toBeVisible();
    await expect(page.getByText("How It Works")).toBeVisible();
    await expect(page.getByText("Volunteer Jobs Offered")).toBeVisible();
    await expect(page.getByText("Donation Needs")).toBeVisible();
    await expect(page.getByText("What People Say")).toBeVisible();
    await expect(page.getByText("Frequently Asked Questions")).toBeVisible();
    await expect(page.getByText("About CSEAS")).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText("About CSEAS")).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText("Contact Us")).toBeVisible();
  });

  test("login page loads with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
  });

  test("register page loads with form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Create Account")).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about/);

    await page.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact/);
  });
});
