// tests-e2e/v07-trajectoire.spec.js — S6.14 Phase 1C
// Test E2E page Trajectoire (S6.18)

const { test, expect } = require('@playwright/test');
const BASE_URL = process.env.AICEO_BASE_URL || 'http://localhost:4747';

test.describe('v07 Trajectoire (S6.18)', () => {
  test('hero greeting + 4 stats summary', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/trajectoire.html');
    await expect(page.locator('h1.tj-title')).toBeVisible();
    const stats = page.locator('[data-stat]');
    await expect(stats).toHaveCount(4);
  });

  test('6 filtres temporels presents', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/trajectoire.html');
    const btns = page.locator('.tj-period-btn');
    await expect(btns).toHaveCount(6);
    // 30j actif par defaut
    await expect(page.locator('.tj-period-btn[data-period="30"].is-active')).toBeVisible();
  });

  test('toggle filtre 7j -> recalcul markers', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/trajectoire.html');
    await page.waitForTimeout(1500);
    const initialEyebrow = await page.locator('[data-region="tj-eyebrow"]').textContent();
    await page.click('.tj-period-btn[data-period="7"]');
    await page.waitForTimeout(300);
    const newEyebrow = await page.locator('[data-region="tj-eyebrow"]').textContent();
    expect(newEyebrow).toContain('7 DERNIERS JOURS');
  });

  test('legend kinds 3 markers visibles', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/trajectoire.html');
    const legendItems = page.locator('.tj-leg-item');
    await expect(legendItems).toHaveCount(3);
  });
});
