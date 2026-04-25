/**
 * src/routes/evening.js — boucle du soir (S2.04).
 *
 * Endpoints :
 *   POST /api/evening/start    — initialise / lit la session du jour (idempotent)
 *   POST /api/evening/commit   — persiste bilan + humeur + énergie + top 3 demain
 *   GET  /api/evening/today    — session du jour (200 ou 204 si aucune)
 *   GET  /api/evening/history  — N dernières sessions
 *   GET  /api/evening/streak   — streak actuel + record + total sessions
 *
 * Streak engine :
 *   - On considère qu'un jour "compte" si une session evening_sessions est validée (bilan != null).
 *   - current_streak  = nombre de jours consécutifs incluant aujourd'hui (ou hier si pas encore commit aujourd'hui).
 *   - longest_streak  = persisté dans settings (`evening.longest_streak`), mis à jour au commit.
 *   - total_sessions  = COUNT(*) sur evening_sessions où bilan != null.
 */
const express = require('express');
const { getDb, uuid7, now } = require('../db');

const router = express.Router();

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function shiftIso(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function loadSession(date) {
  const db = getDb();
  return db.prepare(`SELECT * FROM evening_sessions WHERE date = ?`).get(date) || null;
}

function rowToPayload(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    bilan: row.bilan ? JSON.parse(row.bilan) : null,
    humeur: row.humeur,
    energie: row.energie,
    tomorrow_prep: row.tomorrow_prep ? JSON.parse(row.tomorrow_prep) : null,
    duration_sec: row.duration_sec,
    committed: row.bilan != null,
    created_at: row.created_at,
  };
}

function getSetting(key) {
  const db = getDb();
  const r = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key);
  return r ? r.value : null;
}

function setSetting(key, value) {
  const db = getDb();
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, String(value), now());
}

/**
 * Calcule le streak courant.
 *
 * Règle :
 *   - On part du jour de référence (today par défaut).
 *   - Si pas de session committée pour today, on essaie hier comme point de départ
 *     (le CEO n'a peut-être pas encore commit ce soir → l'historique reste valable).
 *   - On remonte tant que chaque jour précédent a une session committée.
 */
function computeCurrentStreak(refDate) {
  const db = getDb();
  const ref = refDate || todayIso();

  // Récupère toutes les dates avec bilan committé, descendant.
  const rows = db
    .prepare(
      `SELECT date FROM evening_sessions WHERE bilan IS NOT NULL ORDER BY date DESC`
    )
    .all();
  const set = new Set(rows.map((r) => r.date));
  if (set.size === 0) return 0;

  // Point de départ : aujourd'hui s'il est dans le set, sinon hier (tolérance).
  let cursor = ref;
  if (!set.has(cursor)) {
    const yesterday = shiftIso(ref, -1);
    if (!set.has(yesterday)) return 0;
    cursor = yesterday;
  }

  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftIso(cursor, -1);
  }
  return streak;
}

function streakSummary() {
  const db = getDb();
  const current = computeCurrentStreak();
  const stored = parseInt(getSetting('evening.longest_streak') || '0', 10);
  const longest = Math.max(stored, current);
  const total = db
    .prepare(`SELECT COUNT(*) AS n FROM evening_sessions WHERE bilan IS NOT NULL`)
    .get().n;
  return { current, longest, total };
}

// --- POST /start ---------------------------------------------------

router.post('/start', (req, res) => {
  try {
    const db = getDb();
    const date = req.body?.date || todayIso();
    let row = loadSession(date);
    if (!row) {
      const id = uuid7();
      db.prepare(
        `INSERT INTO evening_sessions (id, date, created_at) VALUES (?, ?, ?)`
      ).run(id, date, now());
      row = loadSession(date);
    }
    res.json({ session: rowToPayload(row), streak: streakSummary() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /commit --------------------------------------------------

router.post('/commit', (req, res) => {
  try {
    const db = getDb();
    const date = req.body?.date || todayIso();
    const { bilan, humeur, energie, tomorrow_prep, duration_sec } = req.body || {};

    if (!bilan || typeof bilan !== 'object') {
      return res.status(400).json({ error: 'bilan {fait,partiel,pas_fait} requis' });
    }
    const allowedHumeur = new Set(['tres-bien', 'bien', 'neutre', 'tendu', 'difficile']);
    if (humeur && !allowedHumeur.has(humeur)) {
      return res.status(400).json({ error: `humeur invalide : ${humeur}` });
    }
    if (energie != null && (typeof energie !== 'number' || energie < 1 || energie > 5)) {
      return res.status(400).json({ error: 'energie doit être un entier 1..5' });
    }

    let row = loadSession(date);
    if (!row) {
      const id = uuid7();
      db.prepare(
        `INSERT INTO evening_sessions (id, date, created_at) VALUES (?, ?, ?)`
      ).run(id, date, now());
      row = loadSession(date);
    }

    db.prepare(
      `UPDATE evening_sessions
          SET bilan = ?, humeur = ?, energie = ?, tomorrow_prep = ?, duration_sec = ?
        WHERE id = ?`
    ).run(
      JSON.stringify(bilan),
      humeur || null,
      energie || null,
      tomorrow_prep ? JSON.stringify(tomorrow_prep) : null,
      duration_sec || null,
      row.id
    );

    // Met à jour le record si dépassé.
    const summary = streakSummary();
    setSetting('evening.longest_streak', summary.longest);

    const fresh = loadSession(date);
    res.json({ session: rowToPayload(fresh), streak: streakSummary() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /today ----------------------------------------------------

router.get('/today', (req, res) => {
  try {
    const row = loadSession(todayIso());
    if (!row) return res.status(204).send();
    res.json({ session: rowToPayload(row), streak: streakSummary() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /history --------------------------------------------------

router.get('/history', (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || '14', 10), 60);
    const rows = db
      .prepare(
        `SELECT * FROM evening_sessions ORDER BY date DESC LIMIT ?`
      )
      .all(limit);
    res.json({ items: rows.map(rowToPayload) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /streak ---------------------------------------------------

router.get('/streak', (req, res) => {
  try {
    res.json(streakSummary());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
module.exports.computeCurrentStreak = computeCurrentStreak;
module.exports.streakSummary = streakSummary;
module.exports.todayIso = todayIso;
module.exports.shiftIso = shiftIso;
