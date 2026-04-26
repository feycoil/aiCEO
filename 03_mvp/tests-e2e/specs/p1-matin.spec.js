// p1-matin.spec.js — Parcours P1 : matin (cockpit → arbitrage → commit)
const { test, expect } = require('@playwright/test');

test.describe('P1 — Matin', () => {

  test('cockpit accessible + sidebar nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/aiCEO/i);
    // Sidebar doit contenir les liens cockpit
    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar).toBeVisible();
  });

  test('arbitrage matinal — 3 colonnes drag-drop', async ({ page }) => {
    await page.goto('/arbitrage');
    await expect(page).toHaveTitle(/aiCEO/i);
    // Au moins une zone de drop visible (faire / déléguer / reporter)
    const dropZones = page.locator('[data-bucket], [data-droppable], .bucket, .col-faire, .col-deleguer, .col-reporter');
    await expect(dropZones.first()).toBeVisible({ timeout: 10000 });
  });

  test('zéro localStorage applicatif (ADR S2.00)', async ({ page }) => {
    await page.goto('/');
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    // Tolère les clés UI préférences réservées (cf. ADR S2.00)
    const appKeys = localStorageKeys.filter(k => !k.startsWith('aiCEO.uiPrefs'));
    expect(appKeys, `localStorage applicatif détecté: ${appKeys.join(', ')}`).toEqual([]);
  });
});
