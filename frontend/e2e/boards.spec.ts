import { test, expect } from "@playwright/test";
import { login, DEMO_BOARD } from "./helpers";

test.describe("Boards page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("shows the boards page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Your Boards" })).toBeVisible();
  });

  test("shows the demo board", async ({ page }) => {
    await expect(page.getByText(DEMO_BOARD)).toBeVisible();
  });

  test("shows a New Board button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "+ New Board" })).toBeVisible();
  });

  test("can create a new board", async ({ page }) => {
    const boardName = `E2E Board ${Date.now()}`;
    await page.getByRole("button", { name: "+ New Board" }).click();
    await page.getByPlaceholder("Board name").fill(boardName);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(boardName)).toBeVisible();
  });

  test("can cancel board creation", async ({ page }) => {
    await page.getByRole("button", { name: "+ New Board" }).click();
    await expect(page.getByPlaceholder("Board name")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByPlaceholder("Board name")).not.toBeVisible();
  });

  test("navigates to board when clicking a board card", async ({ page }) => {
    await page.getByText(DEMO_BOARD).click();
    await expect(page).toHaveURL(/\/boards\/.+/);
  });

  test("can delete a board", async ({ page }) => {
    // Create a temporary board to delete
    const boardName = `Delete Me ${Date.now()}`;
    await page.getByRole("button", { name: "+ New Board" }).click();
    await page.getByPlaceholder("Board name").fill(boardName);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(boardName)).toBeVisible();

    // Delete it
    const boardCard = page.locator("article, [class*='rounded']").filter({ hasText: boardName });
    await boardCard.getByLabel(/delete/i).click();
    await expect(page.getByText(boardName)).not.toBeVisible();
  });
});
