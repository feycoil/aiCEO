// playwright.config.js — S5.01
// Tests E2E sur le serveur aiCEO local (port 4747 par defaut).
// Usage : npm test (depuis tests-e2e/)
//
// Pre-requis : le serveur aiCEO doit tourner avant lancement (npm start dans 03_mvp/).

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './specs',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: false,           // serveur SQLite mono-instance, eviter conflits
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,                     // serial pour eviter race conditions DB
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.AICEO_E2E_BASE || 'http://localhost:4747',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
