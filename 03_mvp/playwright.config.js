// playwright.config.js - S6.14 config minimal
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests-e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.AICEO_BASE_URL || 'http://localhost:4747',
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
  reporter: [['list']]
});
