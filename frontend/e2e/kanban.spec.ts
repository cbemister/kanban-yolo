import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with dummy data and shows 5 column headers', async ({ page }) => {
    await expect(page.getByText(/backlog/i).first()).toBeVisible();
    await expect(page.getByText(/in progress/i).first()).toBeVisible();
    await expect(page.getByText(/in review/i).first()).toBeVisible();
    await expect(page.getByText(/testing/i).first()).toBeVisible();
    await expect(page.getByText(/done/i).first()).toBeVisible();
  });

  test('can add a card to the first column', async ({ page }) => {
    const addButtons = page.getByRole('button', { name: /\+ add card/i });
    await addButtons.first().click();

    const titleInput = page.getByPlaceholder('Card title');
    await titleInput.fill('E2E Test Card');

    const submitButton = page.locator('form').getByRole('button', { name: /add card/i });
    await submitButton.click();

    await expect(page.getByText('E2E Test Card')).toBeVisible();
  });

  test('can delete a card', async ({ page }) => {
    const firstCard = page.locator('.group').first();
    const cardTitle = await firstCard.locator('h3').textContent();

    await firstCard.hover();
    const deleteButton = firstCard.getByLabel('Delete card');
    await deleteButton.click();

    if (cardTitle) {
      await expect(page.getByText(cardTitle)).not.toBeVisible();
    }
  });

  test('can rename a column', async ({ page }) => {
    const columnHeader = page.locator('h2').first();
    await columnHeader.dblclick();

    const input = page.locator('input[class*="uppercase"]').first();
    await input.selectText();
    await input.fill('Renamed Column');
    await input.press('Enter');

    await expect(page.getByText(/renamed column/i)).toBeVisible();
  });

  test('can view card details in a modal', async ({ page }) => {
    const firstCard = page.locator('.group').first();
    const cardTitle = await firstCard.locator('h3').textContent();
    await firstCard.click();

    // Modal should appear
    const modal = page.locator('[class*="fixed"]').filter({ hasText: cardTitle ?? '' });
    await expect(modal).toBeVisible();
  });
});
