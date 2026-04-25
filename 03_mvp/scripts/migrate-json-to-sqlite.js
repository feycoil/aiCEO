#!/usr/bin/env node
/**
 * scripts/migrate-json-to-sqlite.js — migre les JSON applicatifs existants
 * (data/decisions.json, data/evenings.json, data/drafts.json) vers SQLite :
 *   - decisions.json   → arbitrage_sessions
 *   - evenings.json    → evening_sessions
 *   - drafts.json      → delegations
 *
 * Idempotent : utilise des hash stables pour les IDs (date+saved_at).
 *
 * Usage : node scripts/migrate-json-to-sqlite.js
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { getDb, asJsonOrNull, uuid7, now } = require('../src/db');

const DATA = path.resolve(__dirname, '..', 'data');

function readJson(name) {
  const p = path.join(DATA, name);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, 'utf8').replace(/\u0000+$/g, ''); // strip NUL padding OneDrive
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[migrate-json] ignore ${name} : ${e.message}`);
    return null;
  }
}

function stableId(prefix, ...parts) {
  const h = crypto.createHash('sha1').update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 24);
  return `${prefix}-${h}`;
}

const db = getDb();

// ----- 1. arbitrage_sessions ← decisions.json -----
const decisions = readJson('decisions.json') || [];
let arbCount = 0;
for (const d of decisions) {
  if (!d || (!d.date && !d.saved_at)) continue;
  const date = d.date || (d.saved_at || '').slice(0, 10);
  if (!date) continue;
  const id = stableId('arb', date, d.saved_at || '');
  const proposals = { faire: d.faire || [], deleguer: d.deleguer || [], reporter: d.reporter || [] };
  db.prepare(
    `INSERT OR REPLACE INTO arbitrage_sessions (id, date, raw_emails, raw_events, proposals, user_decisions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, date, null, null,
    asJsonOrNull(proposals),
    asJsonOrNull(d),
    d.saved_at || now()
  );
  arbCount++;
}

// ----- 2. evening_sessions ← evenings.json -----
const evenings = readJson('evenings.json') || [];
let evCount = 0;
for (const e of evenings) {
  if (!e || !e.date) continue;
  const id = stableId('ev', e.date, e.saved_at || '');
  const bilan = {
    faire_done: e.faire_done || [],
    faire_pushed: e.faire_pushed || [],
    deleguer_sent: e.deleguer_sent || [],
    notes: e.notes || null,
    summary: e.summary || null,
  };
  // mood mapping (free-text → enum approximatif)
  const moodMap = { 'tres-bien': 'tres-bien', 'bien': 'bien', 'satisfait': 'bien', 'neutre': 'neutre', 'tendu': 'tendu', 'difficile': 'difficile' };
  const humeur = moodMap[(e.mood || '').toLowerCase()] || 'neutre';
  db.prepare(
    `INSERT OR REPLACE INTO evening_sessions (id, date, bilan, humeur, energie, tomorrow_prep, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, e.date,
    asJsonOrNull(bilan),
    humeur,
    typeof e.energy === 'number' ? e.energy : null,
    asJsonOrNull(e.summary?.tomorrow_candidates || null),
    e.saved_at || now()
  );
  evCount++;
}

// ----- 3. delegations ← drafts.json -----
const drafts = readJson('drafts.json') || [];
let dgCount = 0;
for (const d of drafts) {
  if (!d) continue;
  const id = stableId('dg', d.task_id || '', d.saved_at || '');
  db.prepare(
    `INSERT OR REPLACE INTO delegations (id, task_id, contact_id, subject, draft_content, sent_status, sent_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    d.task_id || null,
    null, // contact_id non disponible dans drafts.json (on a juste le `to` email)
    d.subject || null,
    JSON.stringify({ to: d.to || null, body: d.body || null }),
    'draft',
    null,
    d.saved_at || now(),
    d.saved_at || now()
  );
  dgCount++;
}

console.log(`[migrate-json] arbitrage_sessions : ${arbCount} insérées/màj`);
console.log(`[migrate-json] evening_sessions   : ${evCount} insérées/màj`);
console.log(`[migrate-json] delegations        : ${dgCount} insérées/màj`);
console.log('[migrate-json] OK');
