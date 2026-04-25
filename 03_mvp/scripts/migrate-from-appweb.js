#!/usr/bin/env node
/**
 * scripts/migrate-from-appweb.js — extrait `01_app-web/assets/data.js` → SQLite.
 *
 * Évalue le fichier data.js dans un faux DOM (`window`) puis insère :
 *   - groups, projects, tasks, decisions, contacts, contacts_projects, events
 *
 * Idempotent par ID stable : utilise `INSERT OR REPLACE` sur les IDs slug
 * existants (mhssn, t1, c12, e3, d6...). Les colonnes `created_at` sont
 * préservées si déjà présentes.
 *
 * Usage :
 *   node scripts/migrate-from-appweb.js
 *   node scripts/migrate-from-appweb.js --reset   (drop + re-insert all)
 *   node scripts/migrate-from-appweb.js --source ../01_app-web/assets/data.js
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getDb, now, asJsonOrNull } = require('../src/db');

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const srcIdx = args.indexOf('--source');
const SOURCE = srcIdx >= 0 ? path.resolve(args[srcIdx + 1]) : path.resolve(__dirname, '..', '..', '01_app-web', 'assets', 'data.js');

if (!fs.existsSync(SOURCE)) {
  console.error(`[migrate-appweb] source introuvable : ${SOURCE}`);
  process.exit(1);
}

console.log(`[migrate-appweb] source : ${SOURCE}`);

// 1. Évaluer data.js dans un sandbox avec un faux `window`
const code = fs.readFileSync(SOURCE, 'utf8');
const sandbox = { window: {}, AICEO: null };
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { filename: 'data.js' });
} catch (e) {
  console.error(`[migrate-appweb] erreur d'évaluation data.js : ${e.message}`);
  process.exit(1);
}
const A = sandbox.window.AICEO || {};
const groups    = A.GROUPS    || [];
const projects  = A.PROJECTS  || [];
const tasks     = A.TASKS     || [];
const decisions = A.DECISIONS || [];
const contacts  = A.CONTACTS  || [];
const events    = A.EVENTS    || [];

console.log(`[migrate-appweb] extracted : ${groups.length} groups, ${projects.length} projects, ${tasks.length} tasks, ${decisions.length} decisions, ${contacts.length} contacts, ${events.length} events`);

const db = getDb();

if (reset) {
  console.log('[migrate-appweb] --reset : purge des tables');
  db.exec(`
    DELETE FROM contacts_projects;
    DELETE FROM task_events;
    DELETE FROM events;
    DELETE FROM contacts;
    DELETE FROM tasks;
    DELETE FROM decisions;
    DELETE FROM projects;
    DELETE FROM groups;
  `);
}

// ----- Helpers de mapping -----
const PRIORITY_MAP = { critical: 'P0', high: 'P1', medium: 'P2', low: 'P3' };
const TYPE_MAP = { do: 'do', plan: 'plan', delegate: 'delegate', defer: 'defer' };
const TRUST_FROM_TAGS = (tags = []) =>
  tags.includes('priorité') ? 'haute' : tags.includes('famille') ? 'haute' : 'moyenne';

function eisenhowerOf(t) {
  // U: starred OU due ≤ 2 jours; I: priority critical/high
  const today = new Date();
  let urgent = !!t.starred;
  if (t.due) {
    const dueDate = new Date(t.due);
    const days = (dueDate - today) / 86400000;
    if (days <= 2) urgent = true;
  }
  const important = t.priority === 'critical' || t.priority === 'high';
  return urgent && important ? 'UI' : urgent && !important ? 'U-' : !urgent && important ? '-I' : '--';
}

function mapDecisionStatus(s) {
  const m = { 'to-execute': 'decidee', 'executed': 'executee', 'open': 'ouverte', 'abandoned': 'abandonnee' };
  return m[s] || 'decidee';
}

function durationToEnds(starts, durMin) {
  if (!starts || !durMin) return null;
  const d = new Date(starts);
  return new Date(d.getTime() + durMin * 60000).toISOString();
}

// ----- Insert / upsert helpers -----
function upsertGroup(g) {
  db.prepare(
    `INSERT INTO groups (id, name, tagline, description, color, icon, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM groups WHERE id = ?), ?), ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, tagline = excluded.tagline, description = excluded.description,
       color = excluded.color, icon = excluded.icon, updated_at = excluded.updated_at`
  ).run(g.id, g.name, g.tagline || null, g.description || null, g.color || null, g.icon || null, g.id, now(), now());
}

function upsertProject(p) {
  db.prepare(
    `INSERT INTO projects (id, group_id, name, tagline, status, description, color, icon, progress, companies, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM projects WHERE id = ?), ?), ?)
     ON CONFLICT(id) DO UPDATE SET
       group_id = excluded.group_id, name = excluded.name, tagline = excluded.tagline,
       status = excluded.status, description = excluded.description, color = excluded.color,
       icon = excluded.icon, progress = excluded.progress, companies = excluded.companies,
       updated_at = excluded.updated_at`
  ).run(
    p.id, p.group || null, p.name, p.tagline || null, p.status || 'active',
    p.description || null, p.color || null, p.icon || null,
    typeof p.progress === 'number' ? p.progress : 0,
    asJsonOrNull(p.companies || null),
    p.id, now(), now()
  );
}

function upsertTask(t) {
  db.prepare(
    `INSERT INTO tasks (id, project_id, title, description, type, priority, eisenhower, starred, done,
                        due_at, estimated_min, energy, ai_capable, ai_proposal, context,
                        source_type, source_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
             COALESCE((SELECT created_at FROM tasks WHERE id = ?), ?), ?)
     ON CONFLICT(id) DO UPDATE SET
       project_id = excluded.project_id, title = excluded.title, description = excluded.description,
       type = excluded.type, priority = excluded.priority, eisenhower = excluded.eisenhower,
       starred = excluded.starred, done = excluded.done, due_at = excluded.due_at,
       estimated_min = excluded.estimated_min, energy = excluded.energy,
       ai_capable = excluded.ai_capable, ai_proposal = excluded.ai_proposal,
       context = excluded.context, source_type = excluded.source_type, source_id = excluded.source_id,
       updated_at = excluded.updated_at`
  ).run(
    t.id, t.project || null, t.title, t.description || null,
    TYPE_MAP[t.type] || 'do',
    PRIORITY_MAP[t.priority] || 'P2',
    eisenhowerOf(t),
    t.starred ? 1 : 0, t.done ? 1 : 0,
    t.due || null,
    typeof t.estimatedMin === 'number' ? t.estimatedMin : null,
    t.energy || null,
    t.aiCapable ? 1 : 0,
    t.aiProposal || null,
    t.context || null,
    t.source ? (t.source.startsWith('mail:') ? 'mail' : t.source.startsWith('event:') ? 'event' : 'auto-detect') : 'manuel',
    t.source || null,
    t.id, now(), now()
  );
}

function upsertDecision(d) {
  db.prepare(
    `INSERT INTO decisions (id, project_id, title, context, decision, owner, status, decided_at, deadline, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM decisions WHERE id = ?), ?), ?)
     ON CONFLICT(id) DO UPDATE SET
       project_id = excluded.project_id, title = excluded.title, context = excluded.context,
       decision = excluded.decision, owner = excluded.owner, status = excluded.status,
       decided_at = excluded.decided_at, deadline = excluded.deadline, updated_at = excluded.updated_at`
  ).run(
    d.id, d.project || null, d.title,
    d.rationale || null,
    d.outcome || null,
    d.owner || null,
    mapDecisionStatus(d.status),
    d.date || null,
    d.deadline || null,
    d.id, now(), now()
  );
}

function upsertContact(c) {
  db.prepare(
    `INSERT INTO contacts (id, name, role, company, email, phone, trust_level, notes, last_seen_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM contacts WHERE id = ?), ?), ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, role = excluded.role, company = excluded.company, email = excluded.email,
       phone = excluded.phone, trust_level = excluded.trust_level, notes = excluded.notes,
       last_seen_at = excluded.last_seen_at, updated_at = excluded.updated_at`
  ).run(
    c.id, c.name, c.role || null, c.org || null, c.email || null, c.phone || null,
    TRUST_FROM_TAGS(c.tags),
    c.tags ? c.tags.join(', ') : null,
    null,
    c.id, now(), now()
  );

  // contacts_projects
  for (const projId of c.projects || []) {
    db.prepare(
      `INSERT OR REPLACE INTO contacts_projects (contact_id, project_id, role) VALUES (?, ?, ?)`
    ).run(c.id, projId, c.role || null);
  }
}

function upsertEvent(e) {
  db.prepare(
    `INSERT INTO events (id, project_id, title, starts_at, ends_at, duration_min, location, attendees, notes, source_type, source_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM events WHERE id = ?), ?), ?)
     ON CONFLICT(id) DO UPDATE SET
       project_id = excluded.project_id, title = excluded.title, starts_at = excluded.starts_at,
       ends_at = excluded.ends_at, duration_min = excluded.duration_min, location = excluded.location,
       attendees = excluded.attendees, notes = excluded.notes,
       source_type = excluded.source_type, source_id = excluded.source_id,
       updated_at = excluded.updated_at`
  ).run(
    e.id, e.project || null, e.title,
    e.date || null,
    durationToEnds(e.date, e.duration_min),
    e.duration_min || null,
    e.location || null,
    asJsonOrNull(e.attendees || null),
    null,
    'manuel',
    e.id,
    e.id, now(), now()
  );
}

// ----- Run all in single transaction -----
const tx = db.transaction(() => {
  groups.forEach(upsertGroup);
  projects.forEach(upsertProject);
  contacts.forEach(upsertContact);
  tasks.forEach(upsertTask);
  decisions.forEach(upsertDecision);
  events.forEach(upsertEvent);
});

tx();

// ----- Stats finales -----
const stats = {
  groups:    db.prepare('SELECT COUNT(*) AS n FROM groups').get().n,
  projects:  db.prepare('SELECT COUNT(*) AS n FROM projects').get().n,
  tasks:     db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n,
  decisions: db.prepare('SELECT COUNT(*) AS n FROM decisions').get().n,
  contacts:  db.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,
  links:     db.prepare('SELECT COUNT(*) AS n FROM contacts_projects').get().n,
  events:    db.prepare('SELECT COUNT(*) AS n FROM events').get().n,
};
console.log('[migrate-appweb] base après migration :', stats);
console.log('[migrate-appweb] OK');
