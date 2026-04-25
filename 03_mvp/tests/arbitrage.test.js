/**
 * tests/arbitrage.test.js — tests S2.03 pour les routes /api/arbitrage/*.
 *
 * Couvre :
 *  - proposeBuckets (rule-based) : top 3 faire, top 2 deleguer (ai_capable), reste reporter
 *  - POST /start : crée une session, retourne hydrated {faire,deleguer,reporter}
 *  - POST /start idempotent : 2e appel même date renvoie la session existante
 *  - POST /commit : applique sur tasks (type updated, due_at pour reporter)
 *  - POST /commit : 400 si decisions manquant, 404 si pas de session
 *  - GET /today : 204 sur base vide, 200 sinon
 *  - GET /history : retourne liste avec counts
 *
 * Cible 7 tests verts.
 */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-arbitrage.db');
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
const arbitrageRouter = require('../src/routes/arbitrage');
const { proposeBuckets, todayIso } = arbitrageRouter;

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
app.use('/api/arbitrage', arbitrageRouter);
const server = app.listen(0);
const PORT = server.address().port;

after(() => server.close());

function rq(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        method,
        hostname: '127.0.0.1',
        port: PORT,
        path: urlPath,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data ? Buffer.byteLength(data) : 0,
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : null }); }
          catch { resolve({ status: res.statusCode, body: buf }); }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const { getDb, uuid7, now } = dbModule;

function reset() {
  const db = getDb();
  for (const t of ['task_events', 'tasks', 'arbitrage_sessions']) {
    db.prepare(`DELETE FROM ${t}`).run();
  }
}

function seedTasks(specs) {
  const db = getDb();
  const ids = [];
  for (const s of specs) {
    const id = uuid7();
    ids.push(id);
    db.prepare(
      `INSERT INTO tasks (id, title, type, priority, ai_capable, done, created_at, updated_at)
       VALUES (?,?,?,?,?,0,?,?)`
    ).run(
      id,
      s.title,
      s.type || 'do',
      s.priority || 'P2',
      s.ai_capable ? 1 : 0,
      now(),
      now()
    );
  }
  return ids;
}

// --- Tests ---------------------------------------------------------

test('proposeBuckets — top 3 priorités → faire ; ai_capable → deleguer ; reste → reporter', () => {
  const tasks = [
    { id: 'a', title: 'A', priority: 'P0', ai_capable: 0, type: 'do' },
    { id: 'b', title: 'B', priority: 'P1', ai_capable: 0, type: 'do' },
    { id: 'c', title: 'C', priority: 'P2', ai_capable: 0, type: 'do' },
    { id: 'd', title: 'D', priority: 'P2', ai_capable: 1, type: 'do' },
    { id: 'e', title: 'E', priority: 'P3', ai_capable: 1, type: 'do' },
    { id: 'f', title: 'F', priority: 'P3', ai_capable: 0, type: 'do' },
  ];
  const r = proposeBuckets(tasks);
  assert.equal(r.faire.length, 3);
  assert.deepEqual(r.faire, ['a', 'b', 'c']); // 3 plus prioritaires non-deleguables
  assert.deepEqual(r.deleguer, ['d', 'e']);   // 2 ai_capable
  assert.deepEqual(r.reporter, ['f']);
});

test('POST /start — crée une session vide et la persiste (idempotent)', async () => {
  reset();
  seedTasks([
    { title: 'Task1', priority: 'P0' },
    { title: 'Task2', priority: 'P1' },
  ]);

  const r1 = await rq('POST', '/api/arbitrage/start', {});
  assert.equal(r1.status, 200);
  assert.equal(r1.body.date, todayIso());
  assert.equal(r1.body.proposals.faire.length, 2);
  assert.ok(r1.body.id);

  const r2 = await rq('POST', '/api/arbitrage/start', {});
  assert.equal(r2.status, 200);
  // Idempotent : même session id renvoyée.
  assert.equal(r2.body.id, r1.body.id);
});

test('POST /commit — applique les buckets sur tasks + insère task_events', async () => {
  reset();
  const ids = seedTasks([
    { title: 'A faire', priority: 'P0' },
    { title: 'A déléguer', priority: 'P2', ai_capable: true },
    { title: 'À reporter', priority: 'P3' },
  ]);
  await rq('POST', '/api/arbitrage/start', {});

  const r = await rq('POST', '/api/arbitrage/commit', {
    decisions: { faire: [ids[0]], deleguer: [ids[1]], reporter: [ids[2]] },
  });
  assert.equal(r.status, 200);
  assert.ok(r.body.user_decisions);

  const db = getDb();
  const t0 = db.prepare('SELECT type FROM tasks WHERE id=?').get(ids[0]);
  const t1 = db.prepare('SELECT type FROM tasks WHERE id=?').get(ids[1]);
  const t2 = db.prepare('SELECT type, due_at FROM tasks WHERE id=?').get(ids[2]);
  assert.equal(t0.type, 'do');
  assert.equal(t1.type, 'delegate');
  assert.equal(t2.type, 'defer');
  assert.ok(t2.due_at, 'reporter doit avoir un due_at');

  const evCount = db.prepare(`SELECT COUNT(*) AS n FROM task_events WHERE event_type='arbitraged'`).get().n;
  assert.equal(evCount, 3);
});

test('POST /commit — 400 si decisions absent', async () => {
  reset();
  const r = await rq('POST', '/api/arbitrage/commit', {});
  assert.equal(r.status, 400);
});

test('POST /commit — 404 si pas de session démarrée', async () => {
  reset();
  const r = await rq('POST', '/api/arbitrage/commit', { decisions: { faire: [], deleguer: [], reporter: [] } });
  assert.equal(r.status, 404);
});

test('GET /today — 204 sur base vide, 200 sinon', async () => {
  reset();
  const r0 = await rq('GET', '/api/arbitrage/today');
  assert.equal(r0.status, 204);

  seedTasks([{ title: 'X', priority: 'P0' }]);
  await rq('POST', '/api/arbitrage/start', {});
  const r1 = await rq('GET', '/api/arbitrage/today');
  assert.equal(r1.status, 200);
  assert.equal(r1.body.date, todayIso());
});

test('GET /history — retourne liste descendante avec counts si committed', async () => {
  reset();
  const ids = seedTasks([
    { title: 'P0 task', priority: 'P0' },
    { title: 'P3 task', priority: 'P3' },
  ]);
  await rq('POST', '/api/arbitrage/start', {});
  await rq('POST', '/api/arbitrage/commit', {
    decisions: { faire: [ids[0]], deleguer: [], reporter: [ids[1]] },
  });

  const r = await rq('GET', '/api/arbitrage/history');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.items));
  assert.equal(r.body.items.length >= 1, true);
  const item = r.body.items[0];
  assert.equal(item.committed, true);
  assert.equal(item.counts.faire, 1);
  assert.equal(item.counts.reporter, 1);
});
