/**
 * tests/cockpit.test.js — tests S2.01 pour GET /api/cockpit/today.
 *
 * Couvre :
 *  - shape de la réponse (date, week_id, intention, big_rocks, counters, alerts)
 *  - calcul ISO week (isoWeekId)
 *  - compteurs tasks open / done_today / total
 *  - compteurs decisions open / decided_today
 *  - compteurs events today / upcoming_24h
 *  - alertes : task_overdue, decision_stale, big_rocks_missing
 *  - intention agrégée depuis weekly_reviews
 *
 * Cible 8 tests verts. Base isolée /data/aiceo-test-cockpit.db, recréée avant suite.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

// --- Setup base isolée ---------------------------------------------
const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-cockpit.db');
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

// Modules à charger APRÈS AICEO_DB_OVERRIDE.
const dbModule = require('../src/db');
const cockpitRouter = require('../src/routes/cockpit');
const { buildCockpit, isoWeekId } = cockpitRouter;

after(() => {
  dbModule.close();
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch { /* swallow */ }
    }
  }
});

// --- Mini Express app pour test HTTP --------------------------------
const app = express();
app.use(express.json());
app.use('/api/cockpit', cockpitRouter);
const server = app.listen(0);
const PORT = server.address().port;

after(() => { server.close(); });

function rq(method, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { method, hostname: '127.0.0.1', port: PORT, path: urlPath, headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

// --- Helpers seed --------------------------------------------------
const { getDb, uuid7, now } = dbModule;

function reset() {
  const db = getDb();
  for (const t of ['task_events', 'tasks', 'decisions', 'events', 'big_rocks', 'weekly_reviews', 'weeks']) {
    db.prepare(`DELETE FROM ${t}`).run();
  }
}

function seedWeek(weekId) {
  const db = getDb();
  // Insert tolère le doublon via INSERT OR IGNORE (week peut déjà exister).
  db.prepare(
    `INSERT OR IGNORE INTO weeks (id, year, week_number, starts_on, ends_on)
     VALUES (?, ?, ?, ?, ?)`
  ).run(weekId, 2026, 17, '2026-04-20', '2026-04-26');
}

// --- Tests ---------------------------------------------------------

test('isoWeekId — 2026-04-25 est en W17 ISO', () => {
  assert.equal(isoWeekId(new Date('2026-04-25T12:00:00Z')), '2026-W17');
});

test('isoWeekId — 2026-12-31 (jeudi) est en W53', () => {
  // 2026-12-31 est un jeudi → semaine 53 (année 53 semaines).
  assert.equal(isoWeekId(new Date('2026-12-31T12:00:00Z')), '2026-W53');
});

test('GET /api/cockpit/today — shape complète sur base vide', async () => {
  reset();
  const r = await rq('GET', '/api/cockpit/today');
  assert.equal(r.status, 200);
  assert.ok(typeof r.body.date === 'string');
  assert.match(r.body.week_id, /^\d{4}-W\d{2}$/);
  assert.equal(r.body.intention, null);
  assert.deepEqual(r.body.big_rocks, []);
  assert.deepEqual(r.body.counters.tasks, { open: 0, done_today: 0, total: 0 });
  assert.deepEqual(r.body.counters.decisions, { open: 0, decided_today: 0 });
  assert.deepEqual(r.body.counters.events, { today: 0, upcoming_24h: 0 });
  // Alerte big_rocks_missing attendue (semaine sans Big Rocks).
  assert.equal(r.body.alerts.length >= 1, true);
  assert.equal(r.body.alerts.some((a) => a.kind === 'big_rocks_missing'), true);
});

test('counters.tasks — distingue open / done_today / total', async () => {
  reset();
  const db = getDb();
  // 2 tâches ouvertes, 1 done aujourd'hui, 1 done hier (ne compte pas done_today).
  db.prepare('INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES (?,?,?,?,?)')
    .run(uuid7(), 'A', 0, now(), now());
  db.prepare('INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES (?,?,?,?,?)')
    .run(uuid7(), 'B', 0, now(), now());
  db.prepare('INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES (?,?,?,?,?)')
    .run(uuid7(), 'C done aujourdhui', 1, now(), now());
  db.prepare('INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES (?,?,?,?,?)')
    .run(uuid7(), 'D done hier', 1, '2026-04-24T10:00:00Z', '2026-04-24T18:00:00Z');

  const r = await rq('GET', '/api/cockpit/today');
  assert.equal(r.body.counters.tasks.open, 2);
  assert.equal(r.body.counters.tasks.total, 4);
  // done_today dépend du jour d'exécution — on vérifie ≥ 1 (au moins la tâche C
  // updated maintenant). Si le test tourne sur une autre date, done_today peut être 0
  // pour D mais 1 pour C qui a updated_at = now().
  assert.ok(r.body.counters.tasks.done_today >= 1, `done_today=${r.body.counters.tasks.done_today}`);
});

test('counters.decisions — open vs decided_today', async () => {
  reset();
  const db = getDb();
  db.prepare('INSERT INTO decisions (id, title, status, created_at) VALUES (?,?,?,?)')
    .run(uuid7(), 'D ouverte', 'ouverte', now());
  const todayIso = new Date().toISOString();
  db.prepare('INSERT INTO decisions (id, title, status, decided_at, created_at) VALUES (?,?,?,?,?)')
    .run(uuid7(), 'D decidee aujourd hui', 'decidee', todayIso, now());

  const r = await rq('GET', '/api/cockpit/today');
  assert.equal(r.body.counters.decisions.open, 1);
  assert.equal(r.body.counters.decisions.decided_today, 1);
});

test('alerts — task_overdue déclenchée par due_at passée', async () => {
  reset();
  const db = getDb();
  db.prepare('INSERT INTO tasks (id, title, done, due_at, created_at, updated_at) VALUES (?,?,?,?,?,?)')
    .run(uuid7(), 'En retard', 0, '2020-01-01T00:00:00Z', now(), now());

  const r = await rq('GET', '/api/cockpit/today');
  const overdue = r.body.alerts.find((a) => a.kind === 'task_overdue');
  assert.ok(overdue, 'attendu une alerte task_overdue');
  assert.equal(overdue.level, 'warn');
  assert.match(overdue.message, /En retard/);
  assert.equal(overdue.ref.type, 'task');
});

test('alerts — decision_stale > 7j', async () => {
  reset();
  const db = getDb();
  // Décision créée il y a longtemps, toujours ouverte.
  db.prepare('INSERT INTO decisions (id, title, status, created_at) VALUES (?,?,?,?)')
    .run(uuid7(), 'Vieille décision', 'ouverte', '2020-01-01T00:00:00Z');

  const r = await rq('GET', '/api/cockpit/today');
  const stale = r.body.alerts.find((a) => a.kind === 'decision_stale');
  assert.ok(stale, 'attendu une alerte decision_stale');
  assert.match(stale.message, /Vieille décision/);
});

test('intention + big_rocks lus depuis week courante', async () => {
  reset();
  const db = getDb();
  const week = isoWeekId();
  seedWeek(week);
  db.prepare('INSERT INTO weekly_reviews (id, week_id, intention, created_at) VALUES (?,?,?,?)')
    .run(uuid7(), week, 'Cap sur S2.01', now());
  db.prepare('INSERT INTO big_rocks (id, week_id, ordre, title, status, created_at) VALUES (?,?,?,?,?,?)')
    .run(uuid7(), week, 2, 'Rock 2', 'defini', now());
  db.prepare('INSERT INTO big_rocks (id, week_id, ordre, title, status, created_at) VALUES (?,?,?,?,?,?)')
    .run(uuid7(), week, 1, 'Rock 1', 'en-cours', now());

  const r = await rq('GET', '/api/cockpit/today');
  assert.equal(r.body.intention, 'Cap sur S2.01');
  assert.equal(r.body.big_rocks.length, 2);
  // Triées par ordre ASC : Rock 1 puis Rock 2.
  assert.equal(r.body.big_rocks[0].ordre, 1);
  assert.equal(r.body.big_rocks[0].title, 'Rock 1');
  assert.equal(r.body.big_rocks[1].ordre, 2);
  // Plus d'alerte big_rocks_missing puisqu'il y en a.
  assert.equal(r.body.alerts.some((a) => a.kind === 'big_rocks_missing'), false);
});
