import { Page } from "@playwright/test";

export const DEMO_EMAIL = "demo@kanban.dev";
export const DEMO_PASSWORD = "password123";
export const DEMO_BOARD = "Demo Board";

export async function login(page: Page, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/boards");
}

export async function openDemoBoard(page: Page) {
  await login(page);
  await page.getByText(DEMO_BOARD).click();
  await page.waitForURL(/\/boards\/.+/);
}
