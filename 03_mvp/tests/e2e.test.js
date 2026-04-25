/**
 * tests/e2e.test.js — tests S2.07 : 3 parcours e2e (HTTP flow).
 *
 * NOTE technique : Playwright nécessite Chromium + display server, infaisable
 *   dans un environnement CI sandbox sans privilèges. On adopte ici une
 *   approche e2e "boundary-test" : on monte un serveur Express réel avec
 *   tous les routers (comme `node server.js`), on tape l'API HTTP et on
 *   valide les invariants métier au fur et à mesure. Couvre les 3 parcours
 *   du DOSSIER-SPRINT-S2 §2 :
 *
 *     P1. Matin   : cockpit → arbitrage start → commit → cockpit refresh
 *     P2. Journée : task quick-add → toggle done → Eisenhower drag-drop
 *                   (PATCH eisenhower) → check counters
 *     P3. Soir    : evening start → commit (bilan + humeur + énergie + top3)
 *                   → streak cohérent
 *
 * Quand un binaire Playwright sera disponible (S3+), un test browser réel
 * pourra coexister. La couverture HTTP ici garantit déjà que le contrat
 * API est respecté de bout en bout.
 *
 * Cible : 3 tests verts (1 par parcours).
 */
const { test, after, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-e2e.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;

for (const ext of ['', '-wal', '-shm']) {
  const f = TEST_DB + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

const initDb = new Database(TEST_DB);
initDb.pragma('foreign_keys = ON');
initDb.pragma('journal_mode = WAL');
initDb.exec(
  fs.readFileSync(
    path.resolve(__dirname, '..', 'data', 'migrations', '2026-04-25-init-schema.sql'),
    'utf8'
  )
);
initDb.close();

const dbModule = require('../src/db');
const tasksRouter     = require('../src/routes/tasks');
const decisionsRouter = require('../src/routes/decisions');
const cockpitRouter   = require('../src/routes/cockpit');
const arbitrageRouter = require('../src/routes/arbitrage');
const eveningRouter   = require('../src/routes/evening');

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
app.use('/api/tasks',     tasksRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/cockpit',   cockpitRouter);
app.use('/api/arbitrage', arbitrageRouter);
app.use('/api/evening',   eveningRouter);
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

const { getDb } = dbModule;

function reset() {
  const db = getDb();
  for (const t of [
    'task_events', 'tasks',
    'arbitrage_sessions', 'evening_sessions',
    'decisions', 'settings',
  ]) {
    db.prepare(`DELETE FROM ${t}`).run();
  }
}

// --- Parcours 1 : cockpit matin → arbitrage → commit -----------------

test('e2e P1 — matin : cockpit → arbitrage start → commit → counters MAJ', async () => {
  reset();

  // Seed : 4 tâches ouvertes de priorités variées.
  await rq('POST', '/api/tasks', { title: 'Préparer board', priority: 'P0' });
  await rq('POST', '/api/tasks', { title: 'Relancer client X', priority: 'P1' });
  await rq('POST', '/api/tasks', { title: 'Reporting mensuel', priority: 'P2', ai_capable: true });
  await rq('POST', '/api/tasks', { title: 'Veille tech', priority: 'P3' });

  // 1) Le CEO ouvre le cockpit matin.
  const c0 = await rq('GET', '/api/cockpit/today');
  assert.equal(c0.status, 200);
  assert.equal(c0.body.counters.tasks.open, 4);
  assert.equal(c0.body.counters.tasks.done_today, 0);

  // 2) Il lance l'arbitrage : la session se crée avec proposals.
  const start = await rq('POST', '/api/arbitrage/start', {});
  assert.equal(start.status, 200);
  assert.ok(start.body.id, 'arbitrage session doit avoir un id');
  const props = start.body.proposals;
  assert.equal(props.faire.length, 3, 'top 3 priorités → faire');
  assert.equal(props.deleguer.length, 1, '1 ai_capable → deleguer');

  // 3) Il valide les propositions (commit).
  const commit = await rq('POST', '/api/arbitrage/commit', {
    decisions: {
      faire: props.faire,
      deleguer: props.deleguer,
      reporter: props.reporter,
    },
  });
  assert.equal(commit.status, 200);

  // 4) Cockpit refresh : les types tâches sont affectés (do/delegate/defer).
  const db = getDb();
  const counts = db.prepare(`
    SELECT type, COUNT(*) AS n FROM tasks GROUP BY type
  `).all().reduce((acc, r) => ({ ...acc, [r.type]: r.n }), {});
  assert.equal(counts.do, 3);
  assert.equal(counts.delegate, 1);

  // 5) GET /today renvoie 200 (session existe).
  const today = await rq('GET', '/api/arbitrage/today');
  assert.equal(today.status, 200);
});

// --- Parcours 2 : journée tâches Eisenhower --------------------------

test('e2e P2 — journée : quick-add → toggle done → drag-drop Eisenhower', async () => {
  reset();

  // 1) Quick-add depuis taches.html.
  const create = await rq('POST', '/api/tasks', {
    title: 'Préparer kickoff S3 P1',
    priority: 'P1',
    eisenhower: '--',
  });
  assert.equal(create.status, 201);
  const tid = create.body.task.id;

  // 2) CEO drag-drop la tâche dans le quadrant Urgent+Important.
  const move = await rq('PATCH', `/api/tasks/${tid}`, { eisenhower: 'UI' });
  assert.equal(move.status, 200);
  assert.equal(move.body.task.eisenhower, 'UI');

  // 3) Filtre Eisenhower=UI : la tâche apparaît.
  const list = await rq('GET', '/api/tasks?eisenhower=UI&done=false');
  assert.equal(list.status, 200);
  assert.ok(list.body.tasks.some((t) => t.id === tid));

  // 4) Toggle done.
  const toggle = await rq('POST', `/api/tasks/${tid}/toggle`, {});
  assert.equal(toggle.status, 200);
  assert.equal(toggle.body.task.done, 1);

  // 5) Cockpit reflète done_today=1.
  const c = await rq('GET', '/api/cockpit/today');
  assert.equal(c.status, 200);
  assert.equal(c.body.counters.tasks.done_today, 1);

  // 6) L'event sourcing a tracé toutes les étapes (created → edited → done).
  const events = await rq('GET', `/api/tasks/${tid}/events`);
  // route /events n'expose pas via le router e2e direct — on vérifie via SQL.
  const db = getDb();
  const rows = db.prepare(
    `SELECT event_type FROM task_events WHERE task_id = ? ORDER BY occurred_at ASC`
  ).all(tid);
  const types = rows.map((r) => r.event_type);
  assert.deepEqual(
    types.slice(0, 3),
    ['created', 'edited', 'done'],
    'event sourcing doit capter created/edited/done dans l\'ordre'
  );
});

// --- Parcours 3 : soir bilan → streak --------------------------------

test('e2e P3 — soir : evening start → commit avec bilan + humeur + énergie + top3 → streak', async () => {
  reset();

  // 1) Le CEO ouvre /evening : pas de session → 204.
  const empty = await rq('GET', '/api/evening/today');
  assert.equal(empty.status, 204);

  // 2) Il lance la session.
  const start = await rq('POST', '/api/evening/start', {});
  assert.equal(start.status, 200);
  assert.equal(start.body.session.committed, false);
  assert.equal(start.body.streak.current, 0, 'streak vide au départ');

  // 3) Il remplit le bilan + humeur + énergie + top 3 demain.
  const commit = await rq('POST', '/api/evening/commit', {
    bilan: {
      fait: ['cockpit live', 'arbitrage commit'],
      partiel: ['spike WS'],
      pas_fait: [],
    },
    humeur: 'bien',
    energie: 4,
    tomorrow_prep: ['push origin', 'CEO pair', 'kickoff S3'],
    duration_sec: 165,
  });
  assert.equal(commit.status, 200);
  assert.equal(commit.body.session.committed, true);
  assert.equal(commit.body.session.humeur, 'bien');
  assert.equal(commit.body.session.energie, 4);
  assert.deepEqual(commit.body.session.tomorrow_prep, [
    'push origin', 'CEO pair', 'kickoff S3',
  ]);
  assert.equal(commit.body.streak.current, 1, 'streak passe à 1 après commit');

  // 4) GET /today renvoie 200 maintenant.
  const today = await rq('GET', '/api/evening/today');
  assert.equal(today.status, 200);
  assert.equal(today.body.session.committed, true);

  // 5) Streak persisté dans settings.
  const db = getDb();
  const setting = db.prepare(`SELECT value FROM settings WHERE key='evening.longest_streak'`).get();
  assert.ok(setting && parseInt(setting.value, 10) >= 1);

  // 6) Une humeur invalide est rejetée (validation préservée en e2e).
  const bad = await rq('POST', '/api/evening/commit', {
    bilan: { fait: [] },
    humeur: 'euphorique',
  });
  assert.equal(bad.status, 400);
});
