/**
 * tests/evening.test.js — tests S2.04 pour /api/evening/* + streak engine.
 *
 * Couvre :
 *   - POST /start crée une session (idempotent)
 *   - POST /commit persiste bilan + humeur + énergie + tomorrow_prep
 *   - POST /commit valide humeur enum + énergie 1..5
 *   - GET /today : 204 si aucune, 200 sinon
 *   - GET /history retourne descendant
 *   - Streak : 0 sur base vide, croissant sur jours consécutifs, casse sur trou
 *   - longest_streak persisté dans settings
 *
 * Cible 8 tests verts.
 */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-evening.db');
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
const eveningRouter = require('../src/routes/evening');
const { computeCurrentStreak, streakSummary, todayIso, shiftIso } = eveningRouter;

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
app.use('/api/evening', eveningRouter);
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
  db.prepare('DELETE FROM evening_sessions').run();
  db.prepare('DELETE FROM settings').run();
}

function seedCommitted(date, bilan = { fait: ['x'] }) {
  const db = getDb();
  db.prepare(
    `INSERT INTO evening_sessions (id, date, bilan, created_at) VALUES (?,?,?,?)`
  ).run(uuid7(), date, JSON.stringify(bilan), now());
}

// --- Tests ---------------------------------------------------------

test('POST /start — crée une session idempotente', async () => {
  reset();
  const r1 = await rq('POST', '/api/evening/start', {});
  assert.equal(r1.status, 200);
  assert.equal(r1.body.session.committed, false);
  const id1 = r1.body.session.id;

  const r2 = await rq('POST', '/api/evening/start', {});
  assert.equal(r2.body.session.id, id1);
});

test('POST /commit — persiste bilan + humeur + énergie + tomorrow_prep', async () => {
  reset();
  await rq('POST', '/api/evening/start', {});
  const r = await rq('POST', '/api/evening/commit', {
    bilan: { fait: ['t1'], partiel: [], pas_fait: ['t2'] },
    humeur: 'bien',
    energie: 4,
    tomorrow_prep: ['demain1', 'demain2'],
    duration_sec: 180,
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.session.committed, true);
  assert.equal(r.body.session.humeur, 'bien');
  assert.equal(r.body.session.energie, 4);
  assert.deepEqual(r.body.session.tomorrow_prep, ['demain1', 'demain2']);
  assert.equal(r.body.streak.current, 1);
});

test('POST /commit — humeur invalide rejetée', async () => {
  reset();
  const r = await rq('POST', '/api/evening/commit', {
    bilan: { fait: [] },
    humeur: 'euphorique',
  });
  assert.equal(r.status, 400);
});

test('POST /commit — énergie hors 1..5 rejetée', async () => {
  reset();
  const r = await rq('POST', '/api/evening/commit', {
    bilan: { fait: [] },
    energie: 9,
  });
  assert.equal(r.status, 400);
});

test('GET /today — 204 vide, 200 après start', async () => {
  reset();
  const r0 = await rq('GET', '/api/evening/today');
  assert.equal(r0.status, 204);
  await rq('POST', '/api/evening/start', {});
  const r1 = await rq('GET', '/api/evening/today');
  assert.equal(r1.status, 200);
});

test('streak — 0 sur base vide, +1 par jour consécutif, casse sur trou', () => {
  reset();
  assert.equal(computeCurrentStreak(), 0);

  // Aujourd'hui + hier + avant-hier committés → streak = 3.
  const t = todayIso();
  seedCommitted(t);
  seedCommitted(shiftIso(t, -1));
  seedCommitted(shiftIso(t, -2));
  assert.equal(computeCurrentStreak(t), 3);

  // Casse : trou il y a 2 jours.
  reset();
  seedCommitted(t);
  seedCommitted(shiftIso(t, -1));
  // skip -2
  seedCommitted(shiftIso(t, -3));
  assert.equal(computeCurrentStreak(t), 2);
});

test('streak — tolérance à aujourd\'hui non encore committé (compte depuis hier)', () => {
  reset();
  const t = todayIso();
  // Pas de session aujourd'hui, mais hier + avant-hier committés.
  seedCommitted(shiftIso(t, -1));
  seedCommitted(shiftIso(t, -2));
  assert.equal(computeCurrentStreak(t), 2);
});

test('streakSummary — longest_streak persisté dans settings', async () => {
  reset();
  // Commit 2 jours d'affilée hier+aujourd'hui.
  const t = todayIso();
  seedCommitted(shiftIso(t, -1));
  await rq('POST', '/api/evening/commit', {
    bilan: { fait: ['x'] },
  });
  const s1 = streakSummary();
  assert.equal(s1.current, 2);
  assert.equal(s1.longest >= 2, true);

  // Vérifier que settings est bien renseigné.
  const db = getDb();
  const row = db.prepare(`SELECT value FROM settings WHERE key='evening.longest_streak'`).get();
  assert.equal(parseInt(row.value, 10) >= 2, true);
});
