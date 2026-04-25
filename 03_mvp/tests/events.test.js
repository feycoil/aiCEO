/**
 * tests/events.test.js — S3.01 extension GET /api/events/week?with_tasks=true.
 * 1 test : payload contient events[] et tasks[] dans la fenetre ISO week.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-events.db');
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
app.use('/api/events', require('../src/routes/events'));
app.use('/api/tasks', require('../src/routes/tasks'));

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

test('GET /api/events/week?week=YYYY-Www&with_tasks=true — payload events[] + tasks[]', async () => {
  // Seed 1 event et 1 task dans la semaine 2026-W23 (lundi 01/06 -> dimanche 07/06)
  const evCreate = await rq('POST', '/api/events', {
    title: 'COPIL S3 demo intermediaire',
    starts_at: '2026-06-05T16:00:00.000Z',
    ends_at: '2026-06-05T17:00:00.000Z',
  });
  assert.equal(evCreate.status, 201);

  const tkCreate = await rq('POST', '/api/tasks', {
    title: 'Préparer slides demo S3',
    due_at: '2026-06-05T10:00:00.000Z',
    priority: 'P0',
  });
  assert.equal(tkCreate.status, 201);

  // Seed 1 task hors de la semaine (semaine W22)
  const tkOut = await rq('POST', '/api/tasks', {
    title: 'Hors fenetre semaine',
    due_at: '2026-05-25T10:00:00.000Z',
  });
  assert.equal(tkOut.status, 201);

  const r = await rq('GET', '/api/events/week?week=2026-W23&with_tasks=true');
  assert.equal(r.status, 200);
  assert.equal(r.body.week, '2026-W23');
  assert.equal(r.body.from, '2026-06-01T00:00:00.000Z');
  assert.equal(r.body.to, '2026-06-08T00:00:00.000Z');
  assert.ok(Array.isArray(r.body.events));
  assert.ok(Array.isArray(r.body.tasks));
  assert.equal(r.body.events.length, 1);
  assert.equal(r.body.events[0].title, 'COPIL S3 demo intermediaire');
  assert.equal(r.body.tasks.length, 1, 'seule la tache de la semaine W23 doit apparaitre');
  assert.equal(r.body.tasks[0].title, 'Préparer slides demo S3');
  assert.equal(r.body.tasks_count, 1);
});
