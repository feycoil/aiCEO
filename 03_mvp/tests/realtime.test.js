/**
 * tests/realtime.test.js — tests S2.10 pour le spike SSE.
 *
 * Couvre :
 *   - emitChange() pousse bien sur le bus avec type + payload
 *   - GET /api/cockpit/stream envoie un event 'hello' à la connexion
 *   - GET /api/cockpit/stream relaie un event après bus.emit('change', ...)
 *
 * Note : on parse le flux SSE manuellement (pas d'EventSource côté Node).
 */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-realtime.db');
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
const cockpitRouter = require('../src/routes/cockpit');
const { bus, emitChange } = require('../src/realtime');

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
app.use('/api/cockpit', cockpitRouter);
const server = app.listen(0);
const PORT = server.address().port;
after(() => server.close());

// --- Test 1 : emitChange pousse bien sur le bus -------------------

test('emitChange — relaie type + payload + ts sur le bus', () => {
  const received = [];
  const handler = (e) => received.push(e);
  bus.on('change', handler);
  try {
    emitChange('task.updated', { id: 'abc', done: true });
    assert.equal(received.length, 1);
    assert.equal(received[0].type, 'task.updated');
    assert.equal(received[0].payload.id, 'abc');
    assert.equal(received[0].payload.done, true);
    assert.ok(received[0].ts);
  } finally {
    bus.off('change', handler);
  }
});

// --- Test 2 + 3 : SSE endpoint reçoit hello + relaie events --------

function openSseStream(timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = http.request({
      method: 'GET',
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/cockpit/stream',
      headers: { Accept: 'text/event-stream' },
    });

    req.on('response', (res) => {
      res.on('data', (c) => {
        chunks.push(c.toString('utf8'));
      });
    });

    req.on('error', reject);
    req.end();

    setTimeout(() => {
      req.destroy();
      resolve(chunks.join(''));
    }, timeoutMs);
  });
}

test('GET /stream — envoie un event hello à la connexion', async () => {
  const stream = await openSseStream(400);
  assert.match(stream, /event: hello/);
  assert.match(stream, /data: \{"ts":"/);
});

test('GET /stream — relaie les emitChange en SSE', async () => {
  // On ouvre la connexion, attend ~150 ms puis émet.
  const promise = openSseStream(700);
  setTimeout(() => emitChange('cockpit.refresh', { reason: 'spike-test' }), 150);
  const stream = await promise;
  assert.match(stream, /event: cockpit.refresh/);
  assert.match(stream, /"reason":"spike-test"/);
});
