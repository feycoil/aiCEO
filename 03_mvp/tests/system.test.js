/**
 * tests/system.test.js — S3.06/S3.08 last-sync + cockpit alert injection.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-system.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;

for (const ext of ['', '-wal', '-shm']) {
  const f = TEST_DB + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

const initDb = new Database(TEST_DB);
initDb.pragma('foreign_keys = ON');
initDb.pragma('journal_mode = WAL');
const sql = fs.readFileSync(
  path.resolve(__dirname, '..', 'data', 'migrations', '2026-04-25-init-schema.sql'),
  'utf8'
);
initDb.exec(sql);
initDb.close();

const dbModule = require('../src/db');
const { getLastSyncStatus, THRESHOLD_WARN_MIN, THRESHOLD_CRITICAL_MIN } = require('../src/routes/system');

after(() => {
  dbModule.close();
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch { /* swallow */ }
    }
  }
});

// ============================================================
// last-sync helper : 3 cas (ok, warn, critical)
// ============================================================

test('getLastSyncStatus — fichier absent => level=critical', () => {
  const r = getLastSyncStatus({ summaryPath: '/tmp/inexistant-aiceo-' + Date.now() + '.json' });
  assert.equal(r.level, 'critical');
  assert.equal(r.lastSyncAt, null);
  assert.equal(r.ok, false);
});

test('getLastSyncStatus — fichier recent (< 4h) => level=ok', () => {
  const tmp = path.join(os.tmpdir(), 'aiceo-test-sync-ok-' + Date.now() + '.json');
  fs.writeFileSync(tmp, '{"ok":true}');
  const r = getLastSyncStatus({ summaryPath: tmp });
  assert.equal(r.level, 'ok');
  assert.ok(r.lastSyncAgeMin < 240);
  assert.ok(r.lastSyncAt);
  fs.unlinkSync(tmp);
});

test('getLastSyncStatus — fichier vieux > 4h => level=warn', () => {
  const tmp = path.join(os.tmpdir(), 'aiceo-test-sync-warn-' + Date.now() + '.json');
  fs.writeFileSync(tmp, '{}');
  // Forcer mtime > 4h
  const fiveHoursAgo = (Date.now() - 5 * 3600 * 1000) / 1000;
  fs.utimesSync(tmp, fiveHoursAgo, fiveHoursAgo);
  const r = getLastSyncStatus({ summaryPath: tmp });
  assert.equal(r.level, 'warn');
  assert.ok(r.lastSyncAgeMin > 240);
  assert.ok(r.lastSyncAgeMin < 1440);
  fs.unlinkSync(tmp);
});
