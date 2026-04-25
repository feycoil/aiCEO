/**
 * tests/weekly-reviews.test.js — S3.01 routes /api/weekly-reviews.
 * 3 tests : POST insert, POST upsert (idempotent), GET week not found.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-weekly-reviews.db');
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

after(() => {
  dbModule.close();
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch { /* swallow */ }
    }
  }
});

const app = express();
app.use(express.json());
app.use('/api/weekly-reviews', require('../src/routes/weekly-reviews'));

let server;
let port;
before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

function rq(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1', port, path: urlPath, method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
    }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ============================================================
// Suite : weekly-reviews CRUD
// ============================================================

test('POST /api/weekly-reviews — creation pour une nouvelle semaine', async () => {
  const r = await rq('POST', '/api/weekly-reviews', {
    week: '2026-W23',
    intention: 'Livrer S3 en avance',
    bilan: 'Top semaine, S3.01 fini en 1 jour',
    mood: 'bien',
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.upserted, 'insert');
  assert.equal(r.body.review.week_id, '2026-W23');
  assert.equal(r.body.review.intention, 'Livrer S3 en avance');
  assert.ok(r.body.review.id);
});

test('POST /api/weekly-reviews — upsert idempotent sur meme semaine', async () => {
  const r = await rq('POST', '/api/weekly-reviews', {
    week: '2026-W23',
    bilan: 'Bilan mis a jour apres revue',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.upserted, 'update');
  assert.equal(r.body.review.week_id, '2026-W23');
  assert.equal(r.body.review.bilan, 'Bilan mis a jour apres revue');
  // L'intention initiale est preservee si non re-fournie
  assert.equal(r.body.review.intention, 'Livrer S3 en avance');
});

test('GET /api/weekly-reviews?week=YYYY-Www — 404 si pas de revue pour la semaine', async () => {
  const r = await rq('GET', '/api/weekly-reviews?week=2026-W42');
  assert.equal(r.status, 404);
  assert.equal(r.body.week, '2026-W42');
});
