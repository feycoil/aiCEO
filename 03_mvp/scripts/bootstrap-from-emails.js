#!/usr/bin/env node
/**
 * bootstrap-from-emails.js
 * Auto-population des tables `projects` et `contacts` a partir
 * des emails ingeres en SQLite.
 *
 * Strategie :
 *   - projects : 1 projet par valeur distincte de emails.inferred_project
 *     (skip si name deja present, case-insensitive).
 *     status='active', tagline='Auto-cree depuis sync Outlook', sans group_id.
 *   - contacts : 1 contact par from_email recu >= 3 fois (is_self=0).
 *     trust_level='moyenne', last_seen_at = MAX(received_at).
 *     skip si email deja present.
 *
 * Idempotent : peut etre relance sans creer de doublons.
 * Usage : node scripts/bootstrap-from-emails.js
 */
const path = require("path");
const crypto = require("crypto");
const Database = require("../src/db-driver");

const DB_PATH = process.env.AICEO_DB_OVERRIDE || path.join(__dirname, "..", "data", "aiceo.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

function uuid() {
  return crypto.randomUUID();
}

// --- 1. Projets ---------------------------------------------------
const distinctProjects = db
  .prepare(`
    SELECT inferred_project AS slug, COUNT(*) AS n,
           MIN(received_at) AS first_seen, MAX(received_at) AS last_seen
    FROM emails
    WHERE inferred_project IS NOT NULL
      AND inferred_project != ''
      AND is_self = 0
    GROUP BY inferred_project
    ORDER BY n DESC
  `)
  .all();

console.log("Projets candidats : " + distinctProjects.length);

const checkProj = db.prepare("SELECT id FROM projects WHERE LOWER(name) = LOWER(?)");
const insProj = db.prepare(`
  INSERT INTO projects (id, name, tagline, status, description, progress, created_at, updated_at)
  VALUES (?, ?, ?, 'active', ?, 0, datetime('now'), datetime('now'))
`);

let projCreated = 0;
let projSkipped = 0;
for (const p of distinctProjects) {
  if (checkProj.get(p.slug)) {
    projSkipped++;
    continue;
  }
  insProj.run(
    uuid(),
    p.slug,
    "Auto-cree depuis sync Outlook",
    p.n + " email(s) sur 30 jours (premier " + (p.first_seen || "?").slice(0, 10) +
      ", dernier " + (p.last_seen || "?").slice(0, 10) + ")"
  );
  projCreated++;
}
console.log("  Projets crees : " + projCreated + " (skipped " + projSkipped + ")");

// --- 2. Contacts --------------------------------------------------
// Pour chaque expediteur recurrent : on prend le from_name le plus frequent
const senders = db
  .prepare(`
    SELECT from_email, COUNT(*) AS n, MAX(received_at) AS last_seen
    FROM emails
    WHERE is_self = 0
      AND from_email IS NOT NULL
      AND from_email != ''
    GROUP BY from_email
    HAVING n >= 3
    ORDER BY n DESC
  `)
  .all();

console.log("Contacts candidats : " + senders.length);

const pickName = db.prepare(`
  SELECT from_name, COUNT(*) AS n FROM emails
  WHERE from_email = ? AND from_name IS NOT NULL AND from_name != ''
  GROUP BY from_name ORDER BY n DESC LIMIT 1
`);
const checkCon = db.prepare("SELECT id FROM contacts WHERE LOWER(email) = LOWER(?)");
const insCon = db.prepare(`
  INSERT INTO contacts (id, name, email, trust_level, notes, last_seen_at, created_at, updated_at)
  VALUES (?, ?, ?, 'moyenne', ?, ?, datetime('now'), datetime('now'))
`);

let conCreated = 0;
let conSkipped = 0;
for (const s of senders) {
  if (checkCon.get(s.from_email)) {
    conSkipped++;
    continue;
  }
  const nameRow = pickName.get(s.from_email);
  const name = (nameRow && nameRow.from_name) || s.from_email.split("@")[0];
  insCon.run(
    uuid(),
    name,
    s.from_email,
    s.n + " email(s) recu(s) sur 30 jours",
    s.last_seen
  );
  conCreated++;
}
console.log("  Contacts crees : " + conCreated + " (skipped " + conSkipped + ")");

// --- 3. Stats finales ---------------------------------------------
const totalProj = db.prepare("SELECT COUNT(*) AS c FROM projects").get().c;
const totalCon = db.prepare("SELECT COUNT(*) AS c FROM contacts").get().c;
console.log("");
console.log("Etat final :");
console.log("  Total projects : " + totalProj);
console.log("  Total contacts : " + totalCon);

db.close();
