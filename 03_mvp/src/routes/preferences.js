/**
 * src/routes/preferences.js — Préférences utilisateur (table key/value).
 *
 * Endpoints :
 *   GET    /api/preferences           → toutes les prefs en {key: value}
 *   GET    /api/preferences/:key      → 1 pref
 *   PUT    /api/preferences           → bulk update body { "key1": value1, ... }
 *   PUT    /api/preferences/:key      → set 1 pref { "value": ... }
 *   DELETE /api/preferences/:key      → reset défaut
 *
 * value = JSON.parse(value_text). En PUT, value est sérialisée automatiquement.
 *
 * Conforme ADR S2.00 : zéro localStorage applicatif, source de vérité = SQLite.
 */
const express = require('express');
const { getDb, now } = require('../db');

const router = express.Router();

// ── GET all ───────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM user_preferences').all();
    const result = {};
    for (const r of rows) {
      try { result[r.key] = JSON.parse(r.value); }
      catch { result[r.key] = r.value; }
    }
    res.json({ preferences: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET one ───────────────────────────────────────────────
router.get('/:key', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM user_preferences WHERE key = ?').get(req.params.key);
    if (!row) return res.status(404).json({ error: 'pref introuvable' });
    let value;
    try { value = JSON.parse(row.value); }
    catch { value = row.value; }
    res.json({ key: req.params.key, value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT bulk (toutes les prefs en 1 call) ─────────────────
router.put('/', (req, res) => {
  try {
    const body = req.body || {};
    if (typeof body !== 'object') return res.status(400).json({ error: 'objet requis' });
    const db = getDb();
    const stmt = db.prepare('INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at');
    const tsNow = now();
    let count = 0;
    db.exec('BEGIN');
    try {
      for (const [k, v] of Object.entries(body)) {
        stmt.run(String(k), JSON.stringify(v), tsNow);
        count++;
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    res.json({ updated: count, ts: tsNow });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT one ───────────────────────────────────────────────
router.put('/:key', (req, res) => {
  try {
    const value = req.body?.value;
    if (value === undefined) return res.status(400).json({ error: 'champ value requis' });
    const db = getDb();
    db.prepare('INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
      .run(req.params.key, JSON.stringify(value), now());
    res.json({ key: req.params.key, value, ts: now() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE ────────────────────────────────────────────────
router.delete('/:key', (req, res) => {
  try {
    const db = getDb();
    const r = db.prepare('DELETE FROM user_preferences WHERE key = ?').run(req.params.key);
    res.json({ deleted: r.changes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
