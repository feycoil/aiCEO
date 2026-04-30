// tests-e2e/v07-smoke-pages.spec.js — S6.14 Phase 1C
// Smoke test : les 19 pages v07 chargent sans erreur

const { test, expect } = require('@playwright/test');
const BASE_URL = process.env.AICEO_BASE_URL || 'http://localhost:4747';

const PAGES = [
  'index.html', 'arbitrage.html', 'evening.html',
  'projets.html', 'taches.html', 'agenda.html', 'assistant.html', 'equipe.html',
  'trajectoire.html', 'connaissance.html', 'coaching.html', 'revues.html', 'decisions.html',
  'aide.html', 'settings.html',
  'projet.html', 'hub.html', 'onboarding.html', 'components.html'
];

test.describe('v07 smoke pages (19/19)', () => {
  for (const p of PAGES) {
    test(`${p} charge sans erreur`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(BASE_URL + '/v07/pages/' + p);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
      // Tolerer les erreurs reseau API qui ne sont pas critiques
      const criticalErrors = errors.filter(e => !e.includes('fetch') && !e.includes('NetworkError'));
      expect(criticalErrors).toEqual([]);
    });
  }
});
