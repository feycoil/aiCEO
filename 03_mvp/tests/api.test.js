/**
 * tests/api.test.js — tests d'intégration des endpoints REST SQLite (Sprint S1).
 *
 * Stratégie : monte une instance Express avec uniquement les routers SQLite,
 * sur une base temporaire (data/aiceo-test.db) recréée pour chaque suite.
 * 1 test par endpoint clé (CRUD + transitions + recherches + relations).
 *
 * Lance avec : npm test
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Database = require('../src/db-driver');
const express = require('express');

// ----- Setup base de test isolee -----
// Strategie : on force AICEO_DB_OVERRIDE AVANT de require('../src/db') pour que
// la base aiceo.db de prod ne soit jamais touchee. Plus de backup/restore.
const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;

// Nettoyage complet de la base de test (au cas ou un run precedent l'a laissee sale).
for (const ext of ['', '-wal', '-shm']) {
  const f = TEST_DB + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

// Cree la base de test depuis la migration.
const initDb = new Database(TEST_DB);
initDb.pragma('foreign_keys = ON');
initDb.pragma('journal_mode = WAL');
const sql = fs.readFileSync(
  path.resolve(__dirname, '..', 'data', 'migrations', '2026-04-25-init-schema.sql'),
  'utf8'
);
initDb.exec(sql);
initDb.close();

// Module db.js : importe APRES avoir defini AICEO_DB_OVERRIDE.
const dbModule = require('../src/db');

after(() => {
  dbModule.close();
  // Nettoie les fichiers de test (optionnel, mais propre).
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch { /* swallow */ }
    }
  }
});

// ----- Mini Express app pour tests -----
const app = express();
app.use(express.json());
app.use('/api/tasks',     require('../src/routes/tasks'));
app.use('/api/decisions', require('../src/routes/decisions'));
app.use('/api/contacts',  require('../src/routes/contacts'));
app.use('/api/projects',  require('../src/routes/projects'));
app.use('/api/groups',    require('../src/routes/groups'));
app.use('/api/events',    require('../src/routes/events'));

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

// ----- HTTP helper -----
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
// Suite 1 — groups + projects (relation hiérarchique)
// ============================================================

test('POST /api/groups — création groupe', async () => {
  const r = await rq('POST', '/api/groups', { id: 'amani', name: 'Groupe AMANI', tagline: 'Hôtel & Spa', color: 'rose', icon: '🌴' });
  assert.equal(r.status, 201);
  assert.equal(r.body.group.id, 'amani');
  assert.equal(r.body.group.name, 'Groupe AMANI');
});

test('GET /api/groups — liste avec counts', async () => {
  const r = await rq('GET', '/api/groups');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.groups));
  assert.equal(r.body.groups[0].counts.projects_total, 0);
});

test('POST /api/projects — projet attaché à amani', async () => {
  const r = await rq('POST', '/api/projects', {
    id: 'amani-credit', name: 'Crédits CA Bretagne', group_id: 'amani', status: 'hot', progress: 62,
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.project.group_id, 'amani');
  assert.equal(r.body.project.status, 'hot');
});

test('GET /api/projects/:id — counts agrégés', async () => {
  const r = await rq('GET', '/api/projects/amani-credit');
  assert.equal(r.status, 200);
  assert.equal(r.body.project.counts.tasks_open, 0);
  assert.equal(r.body.project.counts.decisions_open, 0);
});

// ============================================================
// Suite 2 — tasks (CRUD + toggle + defer + events)
// ============================================================

let createdTaskId;

test('POST /api/tasks — création', async () => {
  const r = await rq('POST', '/api/tasks', {
    title: 'Renvoyer Attestation Emprunteur signée',
    project_id: 'amani-credit',
    priority: 'P0',
    starred: true,
    due_at: '2026-04-26T10:00:00Z',
  });
  assert.equal(r.status, 201);
  assert.ok(r.body.task.id);
  assert.equal(r.body.task.title, 'Renvoyer Attestation Emprunteur signée');
  assert.equal(r.body.task.starred, 1);
  createdTaskId = r.body.task.id;
});

test('GET /api/tasks?project=amani-credit — filtre par projet', async () => {
  const r = await rq('GET', '/api/tasks?project=amani-credit');
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 1);
  assert.equal(r.body.tasks[0].id, createdTaskId);
});

test('GET /api/tasks/:id — détail + events (created)', async () => {
  const r = await rq('GET', `/api/tasks/${createdTaskId}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.task.id, createdTaskId);
  assert.equal(r.body.task.events.length, 1);
  assert.equal(r.body.task.events[0].event_type, 'created');
});

test('PATCH /api/tasks/:id — édite priority', async () => {
  const r = await rq('PATCH', `/api/tasks/${createdTaskId}`, { priority: 'P1', context: 'email' });
  assert.equal(r.status, 200);
  assert.equal(r.body.task.priority, 'P1');
  assert.equal(r.body.task.context, 'email');
});

test('POST /api/tasks/:id/toggle — bascule done', async () => {
  const r = await rq('POST', `/api/tasks/${createdTaskId}/toggle`);
  assert.equal(r.status, 200);
  assert.equal(r.body.task.done, 1);
  const r2 = await rq('POST', `/api/tasks/${createdTaskId}/toggle`);
  assert.equal(r2.body.task.done, 0);
});

test('POST /api/tasks/:id/defer — reporte', async () => {
  const r = await rq('POST', `/api/tasks/${createdTaskId}/defer`, {
    due_at: '2026-04-29T10:00:00Z',
    reason: 'mission Mayotte décalée',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.task.due_at, '2026-04-29T10:00:00Z');
  assert.equal(r.body.task.type, 'defer');
});

test('GET /api/tasks/:id/events — historique complet', async () => {
  const r = await rq('GET', `/api/tasks/${createdTaskId}/events`);
  assert.equal(r.status, 200);
  const types = r.body.events.map((e) => e.event_type);
  assert.deepEqual(types, ['created', 'edited', 'done', 'undone', 'deferred']);
});

// ============================================================
// Suite 3 — decisions (CRUD + transitions)
// ============================================================

let decisionId;

test('POST /api/decisions — création', async () => {
  const r = await rq('POST', '/api/decisions', {
    title: 'Tirage Avance AMANI — CPs',
    project_id: 'amani-credit',
    context: 'CPs partiellement levés',
    owner: 'Feyçoil',
    deadline: '2026-04-26',
  });
  assert.equal(r.status, 201);
  decisionId = r.body.decision.id;
  assert.equal(r.body.decision.status, 'ouverte');
});

test('POST /api/decisions/:id/decide — transition decidee + decided_at', async () => {
  const r = await rq('POST', `/api/decisions/${decisionId}/decide`, { decision: 'GO conditionnel' });
  assert.equal(r.status, 200);
  assert.equal(r.body.decision.status, 'decidee');
  assert.ok(r.body.decision.decided_at);
  assert.equal(r.body.decision.decision, 'GO conditionnel');
});

test('POST /api/decisions/:id/execute — transition executee', async () => {
  const r = await rq('POST', `/api/decisions/${decisionId}/execute`);
  assert.equal(r.status, 200);
  assert.equal(r.body.decision.status, 'executee');
});

test('GET /api/decisions?status=executee — filtre', async () => {
  const r = await rq('GET', '/api/decisions?status=executee');
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 1);
});

// ============================================================
// Suite 4 — contacts (CRUD + recherche + liaison projets)
// ============================================================

let contactId;

test('POST /api/contacts — création', async () => {
  const r = await rq('POST', '/api/contacts', {
    name: 'Marie Ansquer',
    role: 'Chargée d\'affaires',
    company: 'CA Bretagne',
    email: 'marie.ansquer@ca-bretagne.fr',
    trust_level: 'haute',
  });
  assert.equal(r.status, 201);
  contactId = r.body.contact.id;
  assert.equal(r.body.contact.trust_level, 'haute');
});

test('GET /api/contacts/search?q=Ansquer — recherche', async () => {
  const r = await rq('GET', '/api/contacts/search?q=Ansquer');
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 1);
  assert.equal(r.body.contacts[0].name, 'Marie Ansquer');
});

test('POST /api/contacts/:id/link-project — lien N:N', async () => {
  const r = await rq('POST', `/api/contacts/${contactId}/link-project`, {
    project_id: 'amani-credit', role: 'banquier',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.project_id, 'amani-credit');
});

test('GET /api/contacts/:id — récupère projets liés', async () => {
  const r = await rq('GET', `/api/contacts/${contactId}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.contact.projects.length, 1);
  assert.equal(r.body.contact.projects[0].id, 'amani-credit');
});

// ============================================================
// Suite 5 — events (CRUD + filtres temporels)
// ============================================================

test('POST /api/events — création manuelle', async () => {
  const r = await rq('POST', '/api/events', {
    title: 'RDV notaire LGoA',
    starts_at: '2026-04-26T10:00:00Z',
    ends_at: '2026-04-26T10:45:00Z',
    duration_min: 45,
    location: 'Étude LGoA',
    attendees: ['Feyçoil', 'Maeva Ferrere'],
    project_id: 'amani-credit',
    source_type: 'manuel',
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.event.title, 'RDV notaire LGoA');
  assert.deepEqual(r.body.event.attendees, ['Feyçoil', 'Maeva Ferrere']);
});

test('GET /api/events?from=...&to=... — filtre date range', async () => {
  const r = await rq('GET', '/api/events?from=2026-04-26T00:00:00Z&to=2026-04-26T23:59:59Z');
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 1);
});

// ============================================================
// Suite 6 — counts d'agrégation (intégration cross-tables)
// ============================================================

test('GET /api/projects/:id — counts à jour après création tâche+décision+event', async () => {
  const r = await rq('GET', '/api/projects/amani-credit');
  assert.equal(r.status, 200);
  assert.equal(r.body.project.counts.tasks_total, 1);
  assert.equal(r.body.project.counts.decisions_total, 1);
  assert.equal(r.body.project.counts.contacts, 1);
});

test('DELETE /api/tasks/:id — suppression', async () => {
  const r = await rq('DELETE', `/api/tasks/${createdTaskId}`);
  assert.equal(r.status, 200);
  assert.ok(r.body.ok);
  const r2 = await rq('GET', `/api/tasks/${createdTaskId}`);
  assert.equal(r2.status, 404);
});
