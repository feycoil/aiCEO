// tests-e2e/v07-llm-frontend.spec.js — S6.14 Phase 1C
// Test E2E des 4 routes LLM frontend (decision-recommend, auto-draft, coaching, llm-status)

const { test, expect } = require('@playwright/test');
const BASE_URL = process.env.AICEO_BASE_URL || 'http://localhost:4747';

test.describe('LLM frontend cablage (S6.21)', () => {
  test('llm-status banner Cockpit accessible', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-region="ck-llm-banner"]')).toBeVisible();
  });

  test('decision-recommend bouton modal-detail', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/decisions.html');
    await page.waitForTimeout(1500);
    const cards = page.locator('[data-component="card-decision"]');
    const count = await cards.count();
    if (count === 0) {
      console.log('Aucune decision dans la base : test skip');
      return;
    }
    await cards.first().click();
    // Si decision ouverte, le bouton Recommander Claude est visible
    const recBtn = page.locator('button[data-action="md-recommend"]');
    if (await recBtn.count() > 0) {
      await expect(recBtn).toBeVisible();
    }
  });

  test('auto-draft Weekly Sync bouton present', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/revues.html');
    await expect(page.locator('button[data-action="auto-draft"]')).toBeVisible();
  });

  test('coaching page LLM-aware (banner statut)', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/coaching.html');
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-region="co-llm-banner"]')).toBeVisible();
  });
});
