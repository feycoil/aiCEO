/**
 * tests/pages.test.js — S4.10 smoke HTTP boundary sur les pages frontend.
 * Verifie que chaque route page retourne HTTP 200 + content-type text/html
 * + un marker DOCTYPE. Au moins 6 nouvelles pages S4.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-pages.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;

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
const PUBLIC = path.resolve(__dirname, '..', 'public');
app.use(express.static(PUBLIC));
const pages = {
  '/assistant':  'assistant.html',
  '/groupes':    'groupes.html',
  '/projets':    'projets.html',
  '/projet':     'projet.html',
  '/contacts':   'contacts.html',
  '/decisions':  'decisions.html',
};
for (const route of Object.keys(pages)) {
  app.get(route, (req, res) => res.sendFile(path.join(PUBLIC, pages[route])));
}

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

function getPage(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path: urlPath, method: 'GET',
    }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'] || '',
        body: raw,
      }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('GET /assistant — page assistant.html livree (S4.02)', async () => {
  const r = await getPage('/assistant');
  assert.equal(r.status, 200);
  assert.match(r.contentType, /text\/html/);
  assert.match(r.body, /<!doctype html>/i);
  assert.match(r.body, /aiCEO.*Assistant/i);
});

test('GET /groupes — page groupes.html livree (S4.03)', async () => {
  const r = await getPage('/groupes');
  assert.equal(r.status, 200);
  assert.match(r.contentType, /text\/html/);
  assert.match(r.body, /<!doctype html>/i);
  assert.match(r.body, /Portefeuille/i);
});

test('GET /projets — page projets.html livree (S4.04)', async () => {
  const r = await getPage('/projets');
  assert.equal(r.status, 200);
  assert.match(r.contentType, /text\/html/);
  assert.match(r.body, /<!doctype html>/i);
  assert.match(r.body, /Projets/i);
});

test('GET /projet — page projet.html livree (S4.05)', async () => {
  const r = await getPage('/projet');
  assert.equal(r.status, 200);
  assert.match(r.contentType, /text\/html/);
  assert.match(r.body, /<!doctype html>/i);
  assert.match(r.body, /breadcrumb/i);
});

test('GET /contacts — page contacts.html livree (S4.06)', async () => {
  const r = await getPage('/contacts');
  assert.equal(r.status, 200);
  assert.match(r.contentType, /text\/html/);
  assert.match(r.body, /<!doctype html>/i);
  assert.match(r.body, /Contacts/);
});

test('GET /decisions — page decisions.html livree (S4.07)', async () => {
  const r = await getPage('/decisions');
  assert.equal(r.status, 200);
  assert.match(r.contentType, /text\/html/);
  assert.match(r.body, /<!doctype html>/i);
  assert.match(r.body, /D[ée]cisions/);
  assert.match(r.body, /Recommander|recommend/i);
});

test('Pages — aucune utilisation applicative de localStorage (ADR S2.00)', async () => {
  const usePattern = /localStorage\s*\.\s*(setItem|getItem|removeItem|clear|key|length)/g;
  const newPages = ['/assistant', '/groupes', '/projets', '/projet', '/contacts', '/decisions'];
  for (const url of newPages) {
    const r = await getPage(url);
    const uses = (r.body.match(usePattern) || []).length;
    assert.equal(uses, 0, url + ' a ' + uses + ' usages applicatifs de localStorage');
  }
});
