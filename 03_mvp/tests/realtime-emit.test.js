/**
 * tests/realtime-emit.test.js — S3.05/S3.08 verifie que tasks emet sur le bus.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-realtime-emit.db');
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
const { bus } = require('../src/realtime');

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
// Verifie que POST/PATCH/DELETE emettent sur le bus
// ============================================================

test('POST /api/tasks emet task.created sur le bus', async () => {
  const events = [];
  const onChange = (e) => events.push(e);
  bus.on('change', onChange);
  try {
    const r = await rq('POST', '/api/tasks', { title: 'SSE emit test' });
    assert.equal(r.status, 201);
    // Laisser le temps a l'event de se propager
    await new Promise((res) => setTimeout(res, 20));
    assert.ok(events.some((e) => e.type === 'task.created' && e.payload.id === r.body.task.id));
  } finally {
    bus.off('change', onChange);
  }
});

test('PATCH /api/tasks/:id emet task.updated sur le bus', async () => {
  const created = await rq('POST', '/api/tasks', { title: 'pour PATCH' });
  const id = created.body.task.id;

  const events = [];
  const onChange = (e) => events.push(e);
  bus.on('change', onChange);
  try {
    const r = await rq('PATCH', '/api/tasks/' + id, { done: true });
    assert.equal(r.status, 200);
    await new Promise((res) => setTimeout(res, 20));
    assert.ok(events.some((e) => e.type === 'task.updated' && e.payload.id === id));
  } finally {
    bus.off('change', onChange);
  }
});
