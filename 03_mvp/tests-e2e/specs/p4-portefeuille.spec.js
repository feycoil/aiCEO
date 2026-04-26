// p4-portefeuille.spec.js — Parcours P4 : portefeuille (groupes → projets → projet → contacts → décisions)
const { test, expect } = require('@playwright/test');

test.describe('P4 — Portefeuille', () => {

  test('groupes affiche cards portefeuille (S4.03)', async ({ page }) => {
    await page.goto('/groupes');
    await expect(page).toHaveTitle(/aiCEO/i);
    await expect(page.locator('text=/Portefeuille|Groupe|portefeuille/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('projets liste cross-groupe avec filtres (S4.04)', async ({ page }) => {
    await page.goto('/projets');
    await expect(page).toHaveTitle(/aiCEO/i);
    // Doit présenter les chips de filtre groupe
    await expect(page.locator('.chip, [data-group], .filter').first()).toBeVisible({ timeout: 5000 });
  });

  test('contacts cards + recherche (S4.06)', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page).toHaveTitle(/aiCEO/i);
    const searchInput = page.locator('input[type="search"], input[placeholder*="echerch"]');
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  });

  test('decisions registre filtrable + bouton IA recommend (S4.07)', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page).toHaveTitle(/aiCEO/i);
    // Bouton recommandation IA présent dans le HTML
    const html = await page.content();
    expect(html.toLowerCase()).toContain('recommander');
  });

  test('zéro localStorage applicatif sur les 4 pages portefeuille', async ({ page }) => {
    for (const url of ['/groupes', '/projets', '/contacts', '/decisions']) {
      await page.goto(url);
      const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
      const appKeys = localStorageKeys.filter(k => !k.startsWith('aiCEO.uiPrefs'));
      expect(appKeys, `${url} : localStorage applicatif détecté: ${appKeys.join(', ')}`).toEqual([]);
    }
  });
});
