import { test, expect } from "@playwright/test";
import { login, DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

test.describe("Authentication", () => {
  test("redirects unauthenticated users from /boards to /login", async ({ page }) => {
    await page.goto("/boards");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated users from a board URL to /login", async ({ page }) => {
    await page.goto("/boards/fake-board-id");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows the login form with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows a link to sign up from the login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("shows an error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("redirects to /boards after successful login", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/boards");
  });

  test("shows user's boards after login", async ({ page }) => {
    await login(page);
    await expect(page.getByText("Demo Board")).toBeVisible();
  });

  test("shows the sign up form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("shows an error when signing up with an existing email", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/already|exists|taken/i)).toBeVisible();
  });

  test("signs out and redirects to /login", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("cannot access /boards after signing out", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/boards");
    await expect(page).toHaveURL(/\/login/);
  });
});
