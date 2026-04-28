#!/usr/bin/env node
/**
 * normalize-events.js — Sprint v0.7-S6.6
 * Lit data/events-raw.json (produit par fetch-outlook-events.ps1),
 * filtre les événements vides/cancelled, ingère table SQLite events.
 *
 * Usage : node scripts/normalize-events.js
 */
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const RAW = path.join(__dirname, "..", "data", "events-raw.json");
const DB_PATH = process.env.AICEO_DB_OVERRIDE || path.join(__dirname, "..", "data", "aiceo.db");

if (!fs.existsSync(RAW)) {
  console.error("✗ " + RAW + " introuvable. Lancez d'abord scripts/fetch-outlook-events.ps1");
  process.exit(1);
}
if (!fs.existsSync(DB_PATH)) {
  console.error("✗ DB " + DB_PATH + " absente. Lancez d'abord npm run db:init.");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(RAW, "utf-8"));
const items = (raw && raw.items) || [];
console.log("Lu " + items.length + " events depuis " + RAW);

// Filtrer : exclure cancelled + sans subject
const clean = items.filter(function (e) {
  return e.status !== "cancelled" && e.subject && e.subject.trim().length > 0;
});
console.log("  Filtre : " + clean.length + " events utiles (skip " + (items.length - clean.length) + ")");

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='events'")
  .get();
if (!hasTable) {
  console.error("✗ Table events absente. Lancez : node scripts/init-db.js");
  process.exit(2);
}

// Vérifier si les colonnes étendues existent (migration 2026-04-28-events-extend.sql)
const cols = db.prepare("PRAGMA table_info(events)").all();
const hasOrganizer = cols.some(c => c.name === "organizer");
const hasIngestedAt = cols.some(c => c.name === "ingested_at");
const hasStatus = cols.some(c => c.name === "status");

if (!hasOrganizer || !hasIngestedAt) {
  console.warn("⚠ Migration 2026-04-28-events-extend.sql pas appliquee. Lancez : node scripts/init-db.js");
}

// Préparer INSERT OR REPLACE selon les colonnes disponibles
const baseCols = ["id", "title", "starts_at", "ends_at", "duration_min", "location", "attendees", "notes", "source_type", "source_id"];
const extCols = [];
if (hasOrganizer) extCols.push("organizer");
if (hasStatus) extCols.push("status");
if (cols.some(c => c.name === "body_preview")) extCols.push("body_preview");
if (hasIngestedAt) extCols.push("ingested_at");
const allCols = baseCols.concat(extCols);
const placeholders = allCols.map(function () { return "?"; }).join(", ");
const stmt = db.prepare(
  "INSERT OR REPLACE INTO events (" + allCols.join(", ") + ") VALUES (" + placeholders + ")"
);

const tx = db.prepare("BEGIN");
const co = db.prepare("COMMIT");
tx.run();

let n = 0, skipped = 0;
for (const e of clean) {
  try {
    if (!e.id) { skipped++; continue; }
    const values = [
      e.id,
      e.subject || "(sans titre)",
      e.starts_at || null,
      e.ends_at || null,
      e.duration_min || null,
      e.location || null,
      e.attendees || null,
      null,                         // notes
      "outlook",                    // source_type
      e.id                          // source_id (entry_id Outlook)
    ];
    if (hasOrganizer) values.push(e.organizer || null);
    if (hasStatus) values.push(e.status || "confirmed");
    if (cols.some(c => c.name === "body_preview")) values.push((e.body_preview || "").slice(0, 500));
    if (hasIngestedAt) values.push(new Date().toISOString());
    stmt.run(...values);
    n++;
  } catch (err) {
    skipped++;
    if (process.env.DEBUG) console.warn("Skip:", err.message);
  }
}
co.run();

const total = db.prepare("SELECT COUNT(*) AS c FROM events").get().c;
const recent = db
  .prepare("SELECT COUNT(*) AS c FROM events WHERE starts_at >= datetime('now', '-7 days') AND starts_at <= datetime('now', '+7 days')")
  .get().c;

console.log("✓ Ingere : " + n + " events (skipped " + skipped + ")");
console.log("  Total table events : " + total);
console.log("  Sur 14j (J-7 a J+7) : " + recent);

db.close();
