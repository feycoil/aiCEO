// p2-soir.spec.js — Parcours P2 : soir (evening → bilan → streak)
const { test, expect } = require('@playwright/test');

test.describe('P2 — Soir', () => {

  test('page evening accessible', async ({ page }) => {
    await page.goto('/evening');
    await expect(page).toHaveTitle(/aiCEO/i);
    // Doit présenter au moins un controle pour humeur ou energie
    const controls = page.locator('[data-mood], [data-energy], input[type="range"], button[data-mood], select');
    await expect(controls.first()).toBeVisible({ timeout: 10000 });
  });

  test('zéro localStorage applicatif sur /evening', async ({ page }) => {
    await page.goto('/evening');
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    const appKeys = localStorageKeys.filter(k => !k.startsWith('aiCEO.uiPrefs'));
    expect(appKeys, `localStorage applicatif détecté: ${appKeys.join(', ')}`).toEqual([]);
  });
});
