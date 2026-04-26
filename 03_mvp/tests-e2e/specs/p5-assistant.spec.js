// p5-assistant.spec.js — Parcours P5 : assistant chat live SSE (S4.02)
const { test, expect } = require('@playwright/test');

test.describe('P5 — Assistant', () => {

  test('page assistant.html avec sidebar + chat input', async ({ page }) => {
    await page.goto('/assistant');
    await expect(page).toHaveTitle(/aiCEO.*Assistant/i);
    // Sidebar conversations
    const sidebar = page.locator('aside.sidebar, nav, .sidebar');
    await expect(sidebar.first()).toBeVisible({ timeout: 5000 });
    // Input chat
    const input = page.locator('textarea, input[type="text"]');
    await expect(input.first()).toBeVisible({ timeout: 5000 });
  });

  test('streaming SSE — envoi message + chunks reçus', async ({ page }) => {
    await page.goto('/assistant');
    const input = page.locator('textarea').first();
    await input.fill('Quels sont mes 3 chantiers prioritaires ?');
    await input.press('Control+Enter');
    // Attendre qu'une bulle assistant apparaisse avec du texte streamé
    const assistantBubble = page.locator('[data-role="assistant"], .msg-assistant, .bubble-assistant');
    // Tolère timeout 15s pour le streaming complet (mode démo = ~2s, mode Claude = ~5-10s)
    await expect(assistantBubble.first()).toBeVisible({ timeout: 15000 });
  });

  test('zéro localStorage applicatif sur /assistant', async ({ page }) => {
    await page.goto('/assistant');
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    const appKeys = localStorageKeys.filter(k => !k.startsWith('aiCEO.uiPrefs'));
    expect(appKeys, `localStorage applicatif détecté: ${appKeys.join(', ')}`).toEqual([]);
  });
});
