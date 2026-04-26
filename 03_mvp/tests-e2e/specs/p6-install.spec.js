// p6-install.spec.js — Parcours P6 : install smoke (12 pages HTTP 200 + /api/health)
const { test, expect, request } = require('@playwright/test');

const PAGES = [
  '/', '/evening', '/arbitrage', '/taches', '/agenda', '/revues',
  '/groupes', '/projets', '/projet', '/contacts', '/decisions', '/assistant'
];

test.describe('P6 — Install smoke', () => {

  for (const url of PAGES) {
    test(`HTTP 200 + text/html sur ${url}`, async ({ request }) => {
      const r = await request.get(url);
      expect(r.status(), `${url} a retourné HTTP ${r.status()}`).toBe(200);
      const ct = r.headers()['content-type'] || '';
      expect(ct, `${url} content-type=${ct}`).toMatch(/text\/html/);
    });
  }

  test('/api/health enrichi v0.5 (S5.03)', async ({ request }) => {
    const r = await request.get('/api/health');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.ok).toBe(true);
    expect(body.version).toBe('v0.5');
    expect(typeof body.uptime_s).toBe('number');
    expect(body.memory).toBeDefined();
    expect(body.counts).toBeDefined();
    expect(body.counts.tasks).toBeGreaterThanOrEqual(0);
  });

  test('/api/system/last-sync retourne level', async ({ request }) => {
    const r = await request.get('/api/system/last-sync');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(['ok', 'warn', 'critical']).toContain(body.level);
  });

  test('/api/groups + /api/projects + /api/contacts + /api/decisions', async ({ request }) => {
    for (const ep of ['/api/groups', '/api/projects', '/api/contacts', '/api/decisions']) {
      const r = await request.get(ep);
      expect(r.status(), `${ep} HTTP ${r.status()}`).toBe(200);
    }
  });
});
