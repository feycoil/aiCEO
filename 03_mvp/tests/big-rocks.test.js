/**
 * tests/big-rocks.test.js — S3.01 routes /api/big-rocks.
 * 3 tests : POST 1er, POST 4eme rejette 400 (contrainte max 3), GET liste par semaine.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-big-rocks.db');
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
app.use('/api/big-rocks', require('../src/routes/big-rocks'));

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
// Suite : big-rocks CRUD + contrainte max 3
// ============================================================

test('POST /api/big-rocks — creation 3 big rocks pour 2026-W23', async () => {
  for (let i = 1; i <= 3; i++) {
    const r = await rq('POST', '/api/big-rocks', {
      week: '2026-W23',
      title: `Big Rock ${i} — semaine S3 demo`,
      status: 'defini',
    });
    assert.equal(r.status, 201, `creation rock ${i} doit reussir`);
    assert.equal(r.body.big_rock.week_id, '2026-W23');
    assert.equal(r.body.big_rock.ordre, i);
    assert.equal(r.body.big_rock.status, 'defini');
  }
});

test('POST /api/big-rocks — 4eme big rock meme semaine -> 400 (contrainte max 3)', async () => {
  const r = await rq('POST', '/api/big-rocks', {
    week: '2026-W23',
    title: 'Big Rock 4 — refuse',
  });
  assert.equal(r.status, 400);
  assert.match(r.body.error, /max 3/i);
  assert.equal(r.body.week, '2026-W23');
  assert.equal(r.body.current, 3);
  assert.equal(r.body.max, 3);
});

test('GET /api/big-rocks?week=YYYY-Www — liste ordonnee par ordre ASC', async () => {
  const r = await rq('GET', '/api/big-rocks?week=2026-W23');
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 3);
  assert.equal(r.body.big_rocks[0].ordre, 1);
  assert.equal(r.body.big_rocks[2].ordre, 3);
});
