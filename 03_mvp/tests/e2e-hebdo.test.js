/**
 * tests/e2e-hebdo.test.js — S3.07 parcours hebdo P4 (HTTP-boundary).
 *
 * Parcours teste end-to-end sur l'API REST :
 *   1. Drag-drop simule : creation tache sans due_at -> PATCH due_at = lundi semaine
 *   2. GET /api/events/week?week=...&with_tasks=true voit la tache dans la fenetre
 *   3. Big rocks : POST 3 -> 4eme refuse 400
 *   4. POST /api/weekly-reviews/:week/draft (fallback) -> markdown 4 sections
 *   5. POST /api/weekly-reviews avec le bilan -> upsert ok
 *   6. GET /api/weekly-reviews?week=... -> review presente
 *   7. GET /api/system/last-sync -> reponse structuree
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-e2e-hebdo.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;
delete process.env.ANTHROPIC_API_KEY;

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
app.use('/api/tasks', require('../src/routes/tasks'));
app.use('/api/events', require('../src/routes/events'));
app.use('/api/weekly-reviews', require('../src/routes/weekly-reviews'));
app.use('/api/big-rocks', require('../src/routes/big-rocks'));
app.use('/api/system', require('../src/routes/system'));

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

const WEEK = '2026-W23';

// ============================================================
// E2E parcours hebdo P4 — un test par jalon
// ============================================================

test('e2e — drag-drop : POST tache sans due_at puis PATCH due_at lundi semaine', async () => {
  const t = await rq('POST', '/api/tasks', { title: 'Préparer COPIL S3', priority: 'P0' });
  assert.equal(t.status, 201);
  assert.equal(t.body.task.due_at, null);
  const r = await rq('PATCH', '/api/tasks/' + t.body.task.id, { due_at: '2026-06-02T09:00:00.000Z' });
  assert.equal(r.status, 200);
  assert.equal(r.body.task.due_at, '2026-06-02T09:00:00.000Z');
});

test('e2e — agenda hebdo : GET /api/events/week with_tasks voit la tache deplacee', async () => {
  const r = await rq('GET', `/api/events/week?week=${WEEK}&with_tasks=true`);
  assert.equal(r.status, 200);
  assert.equal(r.body.week, WEEK);
  assert.ok(r.body.tasks_count >= 1);
  assert.ok(r.body.tasks.some((t) => t.title === 'Préparer COPIL S3'));
});

test('e2e — big rocks : POST 3 OK puis 4 refuse 400', async () => {
  for (let i = 1; i <= 3; i++) {
    const r = await rq('POST', '/api/big-rocks', { week: WEEK, title: `Big Rock ${i}` });
    assert.equal(r.status, 201, `creation rock ${i}`);
  }
  const r4 = await rq('POST', '/api/big-rocks', { week: WEEK, title: 'Big Rock 4' });
  assert.equal(r4.status, 400);
  assert.match(r4.body.error, /max 3/i);
});

test('e2e — auto-draft : POST /:week/draft (fallback) genere markdown structure', async () => {
  const r = await rq('POST', `/api/weekly-reviews/${WEEK}/draft?fallback=true`);
  assert.equal(r.status, 200);
  assert.equal(r.body.source, 'fallback');
  assert.match(r.body.markdown, /## Focus/);
  assert.match(r.body.markdown, /## Faits saillants/);
  assert.match(r.body.markdown, /## Top 3 demain/);
});

test('e2e — commit revue : POST /api/weekly-reviews insere puis GET la retrouve', async () => {
  const post = await rq('POST', '/api/weekly-reviews', {
    week: WEEK,
    bilan: '## Focus\nLivraison en avance.\n\n## Faits saillants\n- Test',
    intention: 'Livrer S3 propre',
  });
  assert.equal(post.status, 201);
  assert.equal(post.body.upserted, 'insert');

  const get = await rq('GET', `/api/weekly-reviews?week=${WEEK}`);
  assert.equal(get.status, 200);
  assert.equal(get.body.review.week_id, WEEK);
  assert.match(get.body.review.bilan, /Livraison en avance/);
});

test('e2e — last-sync : GET /api/system/last-sync renvoie structure attendue', async () => {
  const r = await rq('GET', '/api/system/last-sync');
  assert.equal(r.status, 200);
  // 'ok' (sync recente) ou 'critical' (fichier absent dans test) ou 'warn'
  assert.ok(['ok', 'warn', 'critical'].includes(r.body.level));
  assert.ok('threshold' in r.body);
  assert.equal(r.body.threshold.warn_min, 240);
});
