#!/usr/bin/env node
/**
 * scripts/init-db.js — initialise/migre la base SQLite aiCEO.
 *
 * Usage :
 *   node scripts/init-db.js          # applique les migrations manquantes
 *   node scripts/init-db.js --reset  # supprime data/aiceo.db puis applique tout
 *
 * Les migrations vivent dans data/migrations/*.sql, triées alphabétiquement.
 * Chaque migration est appliquée une fois (table schema_migrations en garde la trace).
 */
const fs = require('node:fs');
const path = require('node:path');
const Database = require('../src/db-driver');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'aiceo.db');
const MIGRATIONS_DIR = path.join(ROOT, 'data', 'migrations');

const args = process.argv.slice(2);
const reset = args.includes('--reset');

if (reset && fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  // Nettoie les fichiers WAL/SHM associés.
  for (const ext of ['-wal', '-shm']) {
    const f = DB_PATH + ext;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  console.log(`[init-db] base supprimée : ${DB_PATH}`);
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Table de tracking des migrations.
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const applied = new Set(
  db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version)
);

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

let count = 0;
let warned = 0;
// S6.42 : erreurs SQLite tolerees (DBs existantes ou re-application benigne)
const TOLERABLE_PATTERNS = [
  /duplicate column name/i,
  /table .* already exists/i,
  /index .* already exists/i,
];
function isTolerable(err) {
  const msg = String(err && err.message || err);
  return TOLERABLE_PATTERNS.some((p) => p.test(msg));
}

for (const file of files) {
  const version = file.replace(/\.sql$/, '');
  if (applied.has(version)) continue;
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  try {
    const tx = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(version);
    });
    tx();
    count++;
    console.log(`[init-db] migration appliquée : ${version}`);
  } catch (e) {
    if (isTolerable(e)) {
      // Marque la migration comme appliquee (skip benin)
      try { db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(version); } catch (e2) {}
      warned++;
      console.warn(`[init-db] migration toleree (skip benin) : ${version} -> ${e.message}`);
    } else {
      console.error(`[init-db] ECHEC migration ${version}:`);
      console.error(`         ${e.message}`);
      throw e;
    }
  }
}

if (count === 0 && warned === 0) {
  console.log(`[init-db] base à jour (${files.length} migrations connues).`);
} else {
  console.log(`[init-db] ${count} migration(s) appliquée(s)${warned ? `, ${warned} toleree(s)` : ''}. Base : ${DB_PATH}`);
}

db.close();
