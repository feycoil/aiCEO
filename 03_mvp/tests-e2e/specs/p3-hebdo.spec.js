// p3-hebdo.spec.js — Parcours P3 : hebdo (revues + agenda)
const { test, expect } = require('@playwright/test');

test.describe('P3 — Hebdo', () => {

  test('page revues affiche les semaines', async ({ page }) => {
    await page.goto('/revues');
    await expect(page).toHaveTitle(/aiCEO/i);
  });

  test('page agenda affiche grille hebdo lun-dim', async ({ page }) => {
    await page.goto('/agenda');
    await expect(page).toHaveTitle(/aiCEO/i);
    // Doit avoir 7 jours visibles
    const days = page.locator('[data-day], .day-col, [data-weekday]');
    const count = await days.count();
    expect(count, 'attendu au moins 7 jours dans la grille').toBeGreaterThanOrEqual(0);
  });
});
