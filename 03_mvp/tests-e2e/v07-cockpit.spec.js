// tests-e2e/v07-cockpit.spec.js — S6.14 Phase 1C
// Test E2E Cockpit refondu (chronotype, anneau, KPIs, North Star, Top 3)
// Run : npx playwright test tests-e2e/v07-cockpit.spec.js

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.AICEO_BASE_URL || 'http://localhost:4747';

test.describe('v07 Cockpit refondu (S6.17)', () => {
  test('homepage redirect vers v07 Cockpit', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page).toHaveURL(/\/v07\/pages\/index\.html/);
    await expect(page.locator('[data-route="cockpit"]')).toBeVisible();
  });

  test('hero greeting Aubrielle present', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await expect(page.locator('[data-region="ck-greeting"]')).toBeVisible();
    const greeting = await page.locator('[data-region="ck-greeting"]').textContent();
    expect(greeting).toMatch(/Bonjour|Bon midi|Bon apres-midi|Bonsoir|Encore/);
  });

  test('chronotype data-attribute set', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    const chrono = await page.locator('html').getAttribute('data-chronotype');
    expect(['morning', 'day', 'evening', 'night']).toContain(chrono);
  });

  test('banner LLM live ou degrade affiche', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.waitForTimeout(1500); // attend le fetch /api/llm-status
    const banner = page.locator('[data-region="ck-llm-banner"]');
    await expect(banner).toBeVisible();
    const cls = await banner.getAttribute('class');
    expect(cls).toMatch(/is-live|is-degraded/);
  });

  test('anneau journee SVG 3 segments', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.waitForTimeout(1500);
    const svg = page.locator('[data-region="ck-day-ring-svg"]');
    await expect(svg).toBeVisible();
    const circles = svg.locator('circle');
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(6); // 3 background + 3 filled
  });

  test('KPI row 4 tiles presentes', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.waitForTimeout(1500);
    const tiles = page.locator('[data-region="kpis"] .kpi-tile');
    await expect(tiles).toHaveCount(4);
  });

  test('Trajectoire mini 7j heatmap', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.waitForTimeout(1500);
    const days = page.locator('[data-region="ck-traj-grid"] .ck-traj-day');
    await expect(days).toHaveCount(7);
  });

  test('CTA Triage navigue vers arbitrage', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.click('a.ck-cta-triage');
    await expect(page).toHaveURL(/arbitrage\.html/);
  });

  test('Lien CTA Trajectoire complete fonctionne', async ({ page }) => {
    await page.goto(BASE_URL + '/v07/pages/index.html');
    await page.click('a.ck-traj-cta');
    await expect(page).toHaveURL(/trajectoire\.html/);
  });
});
