#!/usr/bin/env node
/**
 * scripts/check-migration.js — verifie que la base SQLite reflete fidelement
 * `01_app-web/assets/data.js` apres execution de `migrate-from-appweb.js`.
 *
 * Methodologie :
 *   1. Reevalue data.js dans une sandbox VM (meme procede que migrate-from-appweb.js)
 *   2. Compte par table (groups/projects/tasks/decisions/contacts/events)
 *   3. Verifie pour chaque ID source qu'il existe en base (no orphan)
 *   4. Compare 3 champs canoniques par entite (title/name + un champ specifique)
 *   5. Sortie JSON detaillant ecarts ; exit code 0 si OK, 1 si discrepance
 *
 * Usage :
 *   node scripts/check-migration.js
 *   node scripts/check-migration.js --json    (sortie JSON brute)
 *   node scripts/check-migration.js --source <chemin/data.js>
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getDb } = require('../src/db');

const args = process.argv.slice(2);
const jsonOnly = args.includes('--json');
const srcIdx = args.indexOf('--source');
const SOURCE = srcIdx >= 0
  ? path.resolve(args[srcIdx + 1])
  : path.resolve(__dirname, '..', '..', '01_app-web', 'assets', 'data.js');

if (!fs.existsSync(SOURCE)) {
  console.error(`[check-migration] source introuvable : ${SOURCE}`);
  process.exit(2);
}

// ----- 1. Charger data.js -----
const code = fs.readFileSync(SOURCE, 'utf8');
const sandbox = { window: {}, AICEO: null };
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { filename: 'data.js' });
} catch (e) {
  console.error(`[check-migration] erreur evaluation data.js : ${e.message}`);
  process.exit(2);
}
const A = sandbox.window.AICEO || {};
const sources = {
  groups: A.GROUPS || [],
  projects: A.PROJECTS || [],
  tasks: A.TASKS || [],
  decisions: A.DECISIONS || [],
  contacts: A.CONTACTS || [],
  events: A.EVENTS || [],
};

// ----- 2. Comparer aux comptes SQLite -----
const db = getDb();
const dbCounts = {
  groups: db.prepare('SELECT COUNT(*) AS n FROM groups').get().n,
  projects: db.prepare('SELECT COUNT(*) AS n FROM projects').get().n,
  tasks: db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n,
  decisions: db.prepare('SELECT COUNT(*) AS n FROM decisions').get().n,
  contacts: db.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,
  events: db.prepare('SELECT COUNT(*) AS n FROM events').get().n,
};
const srcCounts = Object.fromEntries(
  Object.entries(sources).map(([k, v]) => [k, v.length])
);

// ----- 3. ID coverage : every source ID exists in DB -----
const missing = {};
function checkIds(table, srcArr) {
  const missingHere = [];
  for (const item of srcArr) {
    const row = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(item.id);
    if (!row) missingHere.push(item.id);
  }
  if (missingHere.length) missing[table] = missingHere;
}
checkIds('groups', sources.groups);
checkIds('projects', sources.projects);
checkIds('tasks', sources.tasks);
checkIds('decisions', sources.decisions);
checkIds('contacts', sources.contacts);
checkIds('events', sources.events);

// ----- 4. Field-level checks per entity (title/name + 1 specifique) -----
const fieldErrors = [];
function fieldCheck(table, srcArr, fields) {
  for (const item of srcArr) {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(item.id);
    if (!row) continue; // already in missing
    for (const [srcKey, dbKey] of fields) {
      const srcVal = item[srcKey];
      const dbVal = row[dbKey];
      const eq = (srcVal == null && dbVal == null) || String(srcVal ?? '') === String(dbVal ?? '');
      if (!eq) {
        fieldErrors.push({ table, id: item.id, field: dbKey, source: srcVal, db: dbVal });
      }
    }
  }
}
fieldCheck('groups', sources.groups, [['name', 'name'], ['tagline', 'tagline']]);
fieldCheck('projects', sources.projects, [['name', 'name'], ['group', 'group_id']]);
fieldCheck('tasks', sources.tasks, [['title', 'title']]);
fieldCheck('decisions', sources.decisions, [['title', 'title']]);
fieldCheck('contacts', sources.contacts, [['name', 'name'], ['email', 'email']]);
fieldCheck('events', sources.events, [['title', 'title']]);

// ----- 5. contacts_projects link integrity -----
const linkErrors = [];
let expectedLinks = 0;
for (const c of sources.contacts) {
  for (const projId of c.projects || []) {
    expectedLinks += 1;
    const row = db
      .prepare(`SELECT 1 FROM contacts_projects WHERE contact_id = ? AND project_id = ?`)
      .get(c.id, projId);
    if (!row) linkErrors.push({ contact: c.id, project: projId });
  }
}

// ----- 6. Verdict -----
const countMismatches = Object.keys(srcCounts).filter(
  (k) => srcCounts[k] !== dbCounts[k]
);
const ok =
  countMismatches.length === 0 &&
  Object.keys(missing).length === 0 &&
  fieldErrors.length === 0 &&
  linkErrors.length === 0;

const report = {
  ok,
  source: SOURCE,
  counts: { source: srcCounts, db: dbCounts },
  count_mismatches: countMismatches,
  missing_ids: missing,
  field_errors: fieldErrors,
  link_errors: { expected: expectedLinks, missing: linkErrors },
};

if (jsonOnly) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  console.log('[check-migration] source :', SOURCE);
  console.log('[check-migration] comptes source :', srcCounts);
  console.log('[check-migration] comptes base   :', dbCounts);
  if (countMismatches.length) {
    console.log('[check-migration] >> ECARTS DE COMPTAGE :', countMismatches.join(', '));
  }
  if (Object.keys(missing).length) {
    console.log('[check-migration] >> IDs absents en base :');
    for (const [t, ids] of Object.entries(missing)) {
      console.log(`   ${t} (${ids.length}) : ${ids.slice(0, 8).join(', ')}${ids.length > 8 ? '...' : ''}`);
    }
  }
  if (fieldErrors.length) {
    console.log(`[check-migration] >> ${fieldErrors.length} ecarts de champs (premiers 5) :`);
    fieldErrors.slice(0, 5).forEach((e) =>
      console.log(`   ${e.table}/${e.id}.${e.field} : "${e.source}" -> "${e.db}"`)
    );
  }
  if (linkErrors.length) {
    console.log(`[check-migration] >> ${linkErrors.length}/${expectedLinks} liens contacts_projects manquants`);
  }
  console.log(ok ? '[check-migration] OK -> 100% reconciliation' : '[check-migration] KO -> ecarts detectes');
}

process.exit(ok ? 0 : 1);
