/**
 * tests/migration.test.js — tests S2.06 pour migrate-from-appweb.js + check-migration.js.
 *
 * Couvre :
 *   - migrate-from-appweb sur fixture data.js minimale -> 0 perte
 *   - check-migration retourne exit 0 sur base coherente
 *   - check-migration retourne exit 1 + diagnostic apres tampering
 *
 * Cible 3 tests verts.
 */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const Database = require('../src/db-driver');

const ROOT = path.resolve(__dirname, '..');
const TEST_DB = path.resolve(ROOT, 'data', 'aiceo-test-migration.db');
const FIXTURE_DIR = path.resolve(ROOT, 'data', 'tmp-migration-fixture');
const FIXTURE = path.resolve(FIXTURE_DIR, 'data.js');

process.env.AICEO_DB_OVERRIDE = TEST_DB;

// ----- Setup -----
for (const ext of ['', '-wal', '-shm']) {
  const f = TEST_DB + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
fs.mkdirSync(FIXTURE_DIR, { recursive: true });

// Mini fixture data.js avec 1 group + 2 projects + 3 tasks + 1 decision + 2 contacts + 1 event.
const fixtureCode = `
window.AICEO = {
  GROUPS: [
    { id: 'g1', name: 'Groupe Test', tagline: 'fixture', color: '#FFAA00', icon: 'X' },
  ],
  PROJECTS: [
    { id: 'p1', group: 'g1', name: 'Projet Alpha', status: 'active', progress: 30 },
    { id: 'p2', group: 'g1', name: 'Projet Beta',  status: 'active', progress: 10 },
  ],
  TASKS: [
    { id: 'tk1', project: 'p1', title: 'Tache 1', priority: 'high', starred: true,  type: 'do' },
    { id: 'tk2', project: 'p1', title: 'Tache 2', priority: 'medium', type: 'do' },
    { id: 'tk3', project: 'p2', title: 'Tache 3', priority: 'low',    type: 'do', aiCapable: true },
  ],
  DECISIONS: [
    { id: 'd1', project: 'p1', title: 'Decision A', status: 'to-execute', date: '2026-04-25' },
  ],
  CONTACTS: [
    { id: 'c1', name: 'Alice Martin', role: 'CEO', email: 'alice@test.fr', projects: ['p1'], tags: ['priorité'] },
    { id: 'c2', name: 'Bob Dupont',   role: 'CTO', email: 'bob@test.fr',   projects: ['p2'], tags: [] },
  ],
  EVENTS: [
    { id: 'e1', project: 'p1', title: 'Reunion fixture', date: '2026-04-26T10:00:00Z', duration_min: 60 },
  ],
};
`;
fs.writeFileSync(FIXTURE, fixtureCode);

// ----- Cleanup global -----
const dbModule = require('../src/db');
const initDb = new Database(TEST_DB);
initDb.pragma('foreign_keys = ON');
initDb.pragma('journal_mode = WAL');
const sql = fs.readFileSync(
  path.resolve(ROOT, 'data', 'migrations', '2026-04-25-init-schema.sql'),
  'utf8'
);
initDb.exec(sql);
initDb.close();

after(() => {
  try { dbModule.close(); } catch { /* swallow */ }
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch { /* swallow */ }
    }
  }
  try {
    if (fs.existsSync(FIXTURE)) fs.unlinkSync(FIXTURE);
    if (fs.existsSync(FIXTURE_DIR)) fs.rmdirSync(FIXTURE_DIR);
  } catch { /* swallow */ }
});

function runScript(scriptName, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [path.resolve(ROOT, 'scripts', scriptName), '--source', FIXTURE, ...extraArgs],
    {
      cwd: ROOT,
      env: { ...process.env, AICEO_DB_OVERRIDE: TEST_DB },
      encoding: 'utf8',
    }
  );
}

// --- Tests ---------------------------------------------------------

test('migrate-from-appweb — applique fixture sans perte', () => {
  const r = runScript('migrate-from-appweb.js', ['--reset']);
  assert.equal(r.status, 0, `migration KO: ${r.stderr || r.stdout}`);

  // Reload module to read the migrated DB.
  delete require.cache[require.resolve('../src/db')];
  const db2 = require('../src/db').getDb();
  const counts = {
    groups: db2.prepare('SELECT COUNT(*) AS n FROM groups').get().n,
    projects: db2.prepare('SELECT COUNT(*) AS n FROM projects').get().n,
    tasks: db2.prepare('SELECT COUNT(*) AS n FROM tasks').get().n,
    decisions: db2.prepare('SELECT COUNT(*) AS n FROM decisions').get().n,
    contacts: db2.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,
    events: db2.prepare('SELECT COUNT(*) AS n FROM events').get().n,
  };
  assert.deepEqual(counts, { groups: 1, projects: 2, tasks: 3, decisions: 1, contacts: 2, events: 1 });
});

test('check-migration — exit 0 sur base coherente', () => {
  const r = runScript('check-migration.js');
  assert.equal(r.status, 0, `check KO: ${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout, /OK ->|100% reconciliation/);
});

test('check-migration — exit 1 apres tampering', () => {
  // Tamper : modifie un title en base.
  delete require.cache[require.resolve('../src/db')];
  const db3 = require('../src/db').getDb();
  db3.prepare("UPDATE tasks SET title = 'TAMPERED' WHERE id = 'tk1'").run();

  const r = runScript('check-migration.js');
  assert.equal(r.status, 1, 'exit doit etre 1 apres tampering');
  assert.match(r.stdout, /ecarts? de champs|TAMPERED/i);
});
