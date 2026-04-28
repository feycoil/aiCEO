#!/usr/bin/env node
/**
 * ingest-emails.js
 * Rattrapage : ingere data/emails.json (deja produit par normalize-emails.js)
 * dans la table SQLite `emails`. Utile quand on a un emails.json mais que la
 * table emails n'existe pas encore (ou est vide) sans relancer Outlook.
 *
 * Usage : node scripts/ingest-emails.js
 *
 * Idempotent : INSERT OR REPLACE sur PK id.
 */
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const EMAILS_JSON = path.join(__dirname, "..", "data", "emails.json");
const DB_PATH = process.env.AICEO_DB_OVERRIDE || path.join(__dirname, "..", "data", "aiceo.db");

if (!fs.existsSync(EMAILS_JSON)) {
  console.error("✗ " + EMAILS_JSON + " introuvable. Lancez d'abord scripts/sync-outlook.ps1.");
  process.exit(1);
}
if (!fs.existsSync(DB_PATH)) {
  console.error("✗ DB " + DB_PATH + " absente. Lancez d'abord npm run db:init.");
  process.exit(1);
}

const emails = JSON.parse(fs.readFileSync(EMAILS_JSON, "utf-8"));
if (!Array.isArray(emails)) {
  console.error("✗ emails.json n'est pas un tableau.");
  process.exit(1);
}
console.log("Lu " + emails.length + " emails depuis " + EMAILS_JSON);

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");

// Verifier presence table
const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='emails'")
  .get();
if (!hasTable) {
  console.error("✗ Table `emails` absente. Lancez d'abord :");
  console.error("    node scripts/init-db.js");
  process.exit(2);
}

const stmt = db.prepare(
  "INSERT OR REPLACE INTO emails " +
  "(id, account, folder, subject, from_name, from_email, to_addrs, " +
  " received_at, unread, flagged, has_attach, preview, inferred_project, is_self, ingested_at) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
);

const tx = db.prepare("BEGIN");
const co = db.prepare("COMMIT");
tx.run();

let n = 0;
let skipped = 0;
for (const m of emails) {
  try {
    if (!m.id) {
      skipped++;
      continue;
    }
    stmt.run(
      m.id,
      m.account || null,
      m.folder || null,
      m.subject || null,
      m.from_name || null,
      m.from_email || null,
      m.to || null,
      m.received_at || null,
      m.unread ? 1 : 0,
      m.flagged ? 1 : 0,
      m.has_attach ? 1 : 0,
      (m.preview || "").slice(0, 500),
      m.inferred_project || null,
      m.is_self ? 1 : 0
    );
    n++;
  } catch (e) {
    skipped++;
  }
}
co.run();

const total = db.prepare("SELECT COUNT(*) AS c FROM emails").get().c;
const unread = db.prepare("SELECT COUNT(*) AS c FROM emails WHERE unread = 1").get().c;
const flagged = db.prepare("SELECT COUNT(*) AS c FROM emails WHERE flagged = 1").get().c;
const recent = db
  .prepare("SELECT COUNT(*) AS c FROM emails WHERE received_at >= datetime('now', '-7 days')")
  .get().c;

console.log("✓ Ingere : " + n + " emails (skipped " + skipped + ")");
console.log("  Total table emails : " + total);
console.log("  Non lus            : " + unread);
console.log("  Flagges            : " + flagged);
console.log("  Recus < 7j         : " + recent);

db.close();
