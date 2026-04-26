/**
 * tests/assistant.test.js — S4.01 routes /api/assistant.
 * 3 tests : POST stream chunks, GET history, DELETE cascade.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-assistant.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;
delete process.env.ANTHROPIC_API_KEY;  // Force fallback offline pour tests

for (const ext of ['', '-wal', '-shm']) {
  const f = TEST_DB + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

const initDb = new Database(TEST_DB);
initDb.pragma('foreign_keys = ON');
initDb.pragma('journal_mode = WAL');
const baseSql = fs.readFileSync(
  path.resolve(__dirname, '..', 'data', 'migrations', '2026-04-25-init-schema.sql'),
  'utf8'
);
initDb.exec(baseSql);
const s4Sql = fs.readFileSync(
  path.resolve(__dirname, '..', 'data', 'migrations', '2026-04-26-s4-assistant.sql'),
  'utf8'
);
initDb.exec(s4Sql);
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
app.use('/api/assistant', require('../src/routes/assistant'));

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
        try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null, raw }); }
        catch { resolve({ status: res.statusCode, body: raw, raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// SSE-aware request : récupère le flux complet sans parser JSON
function rqSSE(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1', port, path: urlPath, method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
    }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => resolve({ status: res.statusCode, raw, headers: res.headers }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

let convId = null;

// ============================================================
// Suite : assistant chat
// ============================================================

test('POST /api/assistant/messages — stream SSE fallback (sans cle API)', async () => {
  const r = await rqSSE('POST', '/api/assistant/messages', {
    content: 'Quelle est la capitale de la France ?',
  });
  assert.equal(r.status, 200);
  assert.match(r.headers['content-type'] || '', /event-stream/);

  // Vérifie les events SSE
  assert.match(r.raw, /event: conversation/);
  assert.match(r.raw, /event: text/);
  assert.match(r.raw, /event: done/);

  // Récupère le conversation_id depuis l'event conversation
  const m = r.raw.match(/event: conversation\ndata: (\{[^}]+\})/);
  assert.ok(m);
  const convData = JSON.parse(m[1]);
  assert.ok(convData.id);
  convId = convData.id;

  // Vérifie qu'on a bien des chunks text. Le streaming envoie chunk-par-chunk (mots).
  // On extrait tous les data text et on les agrège.
  const textChunks = r.raw.match(/event: text\ndata: ({"text":"[^"]*"})/g) || [];
  const allText = textChunks.map(c => {
    const m = c.match(/{"text":"([^"]*)"}/);
    return m ? m[1] : '';
  }).join('');
  assert.match(allText, /Mode fallback/, `agreged streamed text should contain "Mode fallback", got: ${allText.slice(0,200)}`);
});

test('GET /api/assistant/conversations/:id — history avec messages user + assistant', async () => {
  assert.ok(convId, 'conversation_id récupéré du test précédent');
  const r = await rq('GET', '/api/assistant/conversations/' + convId);
  assert.equal(r.status, 200);
  assert.equal(r.body.conversation.id, convId);
  assert.equal(r.body.messages.length, 2);  // user + assistant
  assert.equal(r.body.messages[0].role, 'user');
  assert.equal(r.body.messages[0].content, 'Quelle est la capitale de la France ?');
  assert.equal(r.body.messages[1].role, 'assistant');
  assert.match(r.body.messages[1].content, /Mode fallback/);
});

test('DELETE /api/assistant/conversations/:id — cascade messages', async () => {
  assert.ok(convId);
  const r = await rq('DELETE', '/api/assistant/conversations/' + convId);
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);

  // Vérifie que la conversation est supprimée
  const check = await rq('GET', '/api/assistant/conversations/' + convId);
  assert.equal(check.status, 404);

  // Vérifie que les messages ont été cascadés (FK ON DELETE CASCADE)
  const dbModule = require('../src/db');
  const db = dbModule.getDb();
  const remaining = db.prepare('SELECT COUNT(*) AS n FROM assistant_messages WHERE conversation_id = ?').get(convId);
  assert.equal(remaining.n, 0);
});
