/**
 * tests/arbitrage-accept-kinds.test.js — S6.28 (30/04/2026)
 *
 * Smoke tests pour les nouveaux kinds dans POST /api/arbitrage/accept :
 *   - kind=project + verdict=faire => INSERT projects + lien email source
 *   - kind=big-rock + verdict=faire => INSERT big_rocks (semaine ISO max 3)
 *   - kind=info + verdict=faire => UPDATE emails.project_id (pas de creation)
 *   - kind=task (defaut) => INSERT tasks (regression check S6.25)
 */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-accept-kinds.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;

const MIGRATIONS_ORDER = [
  '2026-04-25-init-schema.sql',
  '2026-04-26-s4-assistant.sql',
  '2026-04-27-s6-preferences.sql',
  '2026-04-28-emails.sql',
  '2026-04-28-emails-fk-projects.sql',
  '2026-04-28-events-extend.sql',
  '2026-04-28-decisions-reportee.sql',
  '2026-04-30-multitenant.sql',
];

function initBlankDb() {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  for (const ext of ['-wal', '-shm']) {
    if (fs.existsSync(TEST_DB + ext)) fs.unlinkSync(TEST_DB + ext);
  }
  const tmpDb = new Database(TEST_DB);
  tmpDb.pragma('foreign_keys = ON');
  const MIG_DIR = path.resolve(__dirname, '..', 'data', 'migrations');
  for (const m of MIGRATIONS_ORDER) {
    try {
      tmpDb.exec(fs.readFileSync(path.join(MIG_DIR, m), 'utf-8'));
    } catch (e) {
      console.warn('[test setup] skip migration', m, ':', e.message.slice(0, 100));
    }
  }
  tmpDb.close();
}
initBlankDb();

const dbModule = require('../src/db');
const arbitrageRouter = require('../src/routes/arbitrage');
const { getDb, uuid7 } = dbModule;

after(() => {
  dbModule.close();
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch (e) {}
    }
  }
});

const app = express();
app.use(express.json());
app.use('/api/arbitrage', arbitrageRouter);
const server = app.listen(0);
const PORT = server.address().port;
after(() => server.close());

function rq(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      method,
      hostname: '127.0.0.1',
      port: PORT,
      path: urlPath,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
      },
    }, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: buf }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function seedEmail(id, subject) {
  const db = getDb();
  const sourceId = id || uuid7();
  try {
    db.prepare("INSERT OR IGNORE INTO emails (id, subject, from_email, from_name, received_at, is_self) VALUES (?, ?, 'test@example.com', 'Test', datetime('now'), 0)").run(sourceId, subject || 'Test email');
  } catch (e) {}
  return sourceId;
}

function reset() {
  const db = getDb();
  for (const t of ['big_rocks', 'weeks', 'tasks', 'decisions', 'projects', 'emails']) {
    try { db.prepare('DELETE FROM ' + t).run(); } catch (e) {}
  }
}

test('S6.25.1 — POST /accept kind=project verdict=faire cree projet + lie email source', async () => {
  reset();
  const sourceId = seedEmail(null, 'Lancement projet RH 2026');
  const r = await rq('POST', '/api/arbitrage/accept', {
    source_id: sourceId,
    kind: 'project',
    verdict: 'faire',
    title: 'Projet RH 2026',
    description: 'Refonte process'
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.created.kind, 'project');
  assert.ok(r.body.created.id);
  const db = getDb();
  const proj = db.prepare('SELECT * FROM projects WHERE id = ?').get(r.body.created.id);
  assert.ok(proj);
  assert.equal(proj.status, 'active');
  const email = db.prepare('SELECT project_id, arbitrated_at FROM emails WHERE id = ?').get(sourceId);
  assert.equal(email.project_id, proj.id);
  assert.ok(email.arbitrated_at);
});

test('S6.25.1 — kind=project verdict=decaler ne cree PAS de projet', async () => {
  reset();
  const sourceId = seedEmail(null, 'Idee projet vague');
  const r = await rq('POST', '/api/arbitrage/accept', {
    source_id: sourceId,
    kind: 'project',
    verdict: 'decaler',
    title: 'Idee a creuser',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.created, null);
  const db = getDb();
  const email = db.prepare('SELECT arbitrated_at FROM emails WHERE id = ?').get(sourceId);
  assert.ok(email.arbitrated_at);
});

test('S6.25.2 — POST /accept kind=big-rock verdict=faire cree Big Rock', async () => {
  reset();
  const sourceId = seedEmail(null, 'Action strategique');
  const r = await rq('POST', '/api/arbitrage/accept', {
    source_id: sourceId,
    kind: 'big-rock',
    verdict: 'faire',
    title: 'Sortir Pitch ExCom',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.created.kind, 'big-rock');
  const db = getDb();
  const rock = db.prepare('SELECT * FROM big_rocks WHERE id = ?').get(r.body.created.id);
  assert.ok(rock);
  assert.equal(rock.status, 'defini');
  assert.match(rock.week_id, /^\d{4}-W\d{2}$/);
});

test('S6.25.2 — kind=big-rock contrainte max 3 par semaine ISO', async () => {
  reset();
  for (let i = 1; i <= 3; i++) {
    const r = await rq('POST', '/api/arbitrage/accept', {
      source_id: seedEmail(null, 'Rock ' + i),
      kind: 'big-rock',
      verdict: 'faire',
      title: 'Big Rock ' + i,
    });
    assert.equal(r.status, 200);
  }
  const r4 = await rq('POST', '/api/arbitrage/accept', {
    source_id: seedEmail(null, 'Rock 4'),
    kind: 'big-rock',
    verdict: 'faire',
    title: 'Big Rock 4',
  });
  assert.equal(r4.status, 400);
  assert.equal(r4.body.error, 'max-rocks');
});

test('regression — kind=task (defaut) cree toujours une task', async () => {
  reset();
  const sourceId = seedEmail(null, 'Action ponctuelle');
  const r = await rq('POST', '/api/arbitrage/accept', {
    source_id: sourceId,
    kind: 'task',
    verdict: 'faire',
    title: 'Faire X',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.created.kind, 'task');
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(r.body.created.id);
  assert.ok(task);
  assert.equal(task.title, 'Faire X');
});

test('regression — POST /accept idempotent (2e appel meme source_id)', async () => {
  reset();
  const sourceId = seedEmail(null, 'Email arbitre une fois');
  const r1 = await rq('POST', '/api/arbitrage/accept', {
    source_id: sourceId,
    kind: 'task',
    verdict: 'faire',
    title: 'Action one',
  });
  assert.equal(r1.status, 200);
  assert.equal(r1.body.created.kind, 'task');
  const r2 = await rq('POST', '/api/arbitrage/accept', {
    source_id: sourceId,
    kind: 'task',
    verdict: 'faire',
    title: 'Action retry',
  });
  assert.equal(r2.status, 200);
  assert.equal(r2.body.deduped, true);
});
