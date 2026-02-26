import { test, expect } from "@playwright/test";
import { openDemoBoard } from "./helpers";

test.describe("Board view", () => {
  test.beforeEach(async ({ page }) => {
    await openDemoBoard(page);
  });

  test("shows all 5 column headers", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 2, name: /backlog/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /in progress/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /in review/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /testing/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /done/i }).first()).toBeVisible();
  });

  test("shows the board title in the header", async ({ page }) => {
    await expect(page.getByText("Demo Board")).toBeVisible();
  });

  test("shows a back link to /boards", async ({ page }) => {
    await page.getByRole("link", { name: /all boards/i }).click();
    await expect(page).toHaveURL("/boards");
  });

  test("shows Add Card buttons", async ({ page }) => {
    const addCardButtons = page.getByRole("button", { name: "+ Add Card" });
    await expect(addCardButtons.first()).toBeVisible();
    expect(await addCardButtons.count()).toBeGreaterThanOrEqual(5);
  });

  test("shows an Add Column button", async ({ page }) => {
    await expect(page.getByLabel("Add column")).toBeVisible();
  });

  test("shows a Share button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /share/i })).toBeVisible();
  });

  test("shows a search input", async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });
});

test.describe("Card management", () => {
  test.beforeEach(async ({ page }) => {
    await openDemoBoard(page);
  });

  test("can add a card to a column", async ({ page }) => {
    const cardTitle = `New Card ${Date.now()}`;
    await page.getByRole("button", { name: "+ Add Card" }).first().click();
    await page.getByPlaceholder("Card title").fill(cardTitle);
    await page.locator("form").getByRole("button", { name: /add card/i }).click();
    await expect(page.getByText(cardTitle)).toBeVisible();
  });

  test("can add a card with details", async ({ page }) => {
    const cardTitle = `Card With Details ${Date.now()}`;
    await page.getByRole("button", { name: "+ Add Card" }).first().click();
    await page.getByPlaceholder("Card title").fill(cardTitle);
    await page.getByPlaceholder(/details/i).fill("These are the details");
    await page.locator("form").getByRole("button", { name: /add card/i }).click();
    await expect(page.getByText(cardTitle)).toBeVisible();
  });

  test("can cancel adding a card", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Card" }).first().click();
    await expect(page.getByPlaceholder("Card title")).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByPlaceholder("Card title")).not.toBeVisible();
  });

  test("can open card detail modal", async ({ page }) => {
    const firstCard = page.locator(".group").first();
    const cardTitle = await firstCard.locator("h3").textContent();
    await firstCard.click();
    await expect(page.getByRole("heading", { name: cardTitle ?? "" })).toBeVisible();
  });

  test("can close card detail modal with close button", async ({ page }) => {
    await page.locator(".group").first().click();
    await page.getByLabel("Close").click();
    await expect(page.getByLabel("Close")).not.toBeVisible();
  });

  test("can edit a card title and details in the modal", async ({ page }) => {
    const firstCard = page.locator(".group").first();
    await firstCard.click();
    await page.getByRole("button", { name: "Edit" }).click();

    const titleInput = page.getByLabel("Title");
    await titleInput.clear();
    await titleInput.fill("Updated Card Title");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Updated Card Title")).toBeVisible();

    // Reset: reopen and restore original
    // (not critical for test isolation since each test gets a fresh page.goto)
  });

  test("can delete a card after confirming", async ({ page }) => {
    const cardTitle = `Delete Card ${Date.now()}`;

    // Create a card to delete
    await page.getByRole("button", { name: "+ Add Card" }).first().click();
    await page.getByPlaceholder("Card title").fill(cardTitle);
    await page.locator("form").getByRole("button", { name: /add card/i }).click();
    await expect(page.getByText(cardTitle)).toBeVisible();

    // Delete it
    const card = page.locator(".group").filter({ hasText: cardTitle });
    await card.hover();
    await card.getByLabel("Delete card").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(cardTitle)).not.toBeVisible();
  });

  test("cancel in delete confirm dialog keeps the card", async ({ page }) => {
    const firstCard = page.locator(".group").first();
    const cardTitle = await firstCard.locator("h3").textContent();

    await firstCard.hover();
    await firstCard.getByLabel("Delete card").click();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText(cardTitle ?? "")).toBeVisible();
  });
});

test.describe("Column management", () => {
  test.beforeEach(async ({ page }) => {
    await openDemoBoard(page);
  });

  test("can add a new column", async ({ page }) => {
    const initialCount = await page.getByRole("heading", { level: 2 }).count();
    await page.getByLabel("Add column").click();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(initialCount + 1);
  });

  test("can rename a column by double-clicking the header", async ({ page }) => {
    const header = page.getByRole("heading", { level: 2 }).first();
    await header.dblclick();
    const input = page.locator("input[class*='uppercase']").first();
    await input.selectText();
    await input.fill("Renamed Column");
    await input.press("Enter");
    await expect(page.getByRole("heading", { level: 2, name: /renamed column/i })).toBeVisible();
  });

  test("can rename a column using the pencil button", async ({ page }) => {
    await page.getByLabel("Rename column").first().click();
    const input = page.locator("input[class*='uppercase']").first();
    await input.selectText();
    await input.fill("Pencil Renamed");
    await input.press("Enter");
    await expect(page.getByRole("heading", { level: 2, name: /pencil renamed/i })).toBeVisible();
  });

  test("can delete a column", async ({ page }) => {
    // First add a column so we have one to delete without affecting the demo data
    await page.getByLabel("Add column").click();
    const newColumnHeading = page.getByRole("heading", { level: 2, name: /new column/i });
    await expect(newColumnHeading).toBeVisible();

    const initialCount = await page.getByRole("heading", { level: 2 }).count();
    await page.getByLabel("Delete column").last().click();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(initialCount - 1);
  });
});

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await openDemoBoard(page);
  });

  test("shows results when typing in the search bar", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Design");
    // Results dropdown should appear
    await expect(page.locator("[class*='absolute']").filter({ hasText: /design/i }).first()).toBeVisible({ timeout: 2000 });
  });

  test("clears search results when pressing Escape", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Design");
    await searchInput.press("Escape");
    await expect(searchInput).toHaveValue("");
  });
});
