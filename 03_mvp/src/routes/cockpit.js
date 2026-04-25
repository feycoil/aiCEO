/**
 * src/routes/cockpit.js — agrégat cockpit du jour (S2.01).
 *
 * Endpoint: GET /api/cockpit/today
 *
 * Retourne :
 *   {
 *     date:        'YYYY-MM-DD',
 *     week_id:     'YYYY-Www',
 *     intention:   string | null,           // weekly_review.intention de la semaine courante
 *     big_rocks:   [{id, ordre, title, description, status}],
 *     counters: {
 *       tasks:     { open, done_today, total },
 *       decisions: { open, decided_today },
 *       events:    { today, upcoming_24h }
 *     },
 *     alerts:      [{level, kind, message, ref?}]    // 'info' | 'warn' | 'critical'
 *   }
 *
 * Les compteurs sont calculés en SQL (pas en JS) pour rester
 * performants même quand la base grossit. La règle d'or : zéro
 * accès `localStorage` côté front pour cette page (cf. ADR S2.00 +
 * critères d'acceptance §2 du DOSSIER-SPRINT-S2).
 */
const express = require('express');
const { getDb, now } = require('../db');

const router = express.Router();

// --- Helpers calendrier (ISO 8601, lundi = jour 1) -----------------

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * isoWeekId(d) → 'YYYY-Www' (ex: '2026-W21').
 * Implémente l'algorithme ISO 8601 : la semaine 1 contient le 1er jeudi de l'année.
 */
function isoWeekId(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// --- Aggregator ----------------------------------------------------

function buildCockpit() {
  const db = getDb();
  const date = todayIso();
  const week = isoWeekId();

  // Intention de semaine (weekly_reviews) — peut ne pas exister.
  const wr = db.prepare(
    `SELECT intention FROM weekly_reviews WHERE week_id = ? LIMIT 1`
  ).get(week);
  const intention = wr ? wr.intention : null;

  // Big Rocks de la semaine, triées par ordre.
  const bigRocks = db.prepare(
    `SELECT id, ordre, title, description, status
       FROM big_rocks
      WHERE week_id = ?
      ORDER BY ordre ASC`
  ).all(week);

  // Compteurs tâches.
  const tasksOpen = db.prepare(
    `SELECT COUNT(*) AS n FROM tasks WHERE done = 0`
  ).get().n;
  const tasksDoneToday = db.prepare(
    `SELECT COUNT(*) AS n
       FROM tasks
      WHERE done = 1 AND substr(updated_at, 1, 10) = ?`
  ).get(date).n;
  const tasksTotal = db.prepare(`SELECT COUNT(*) AS n FROM tasks`).get().n;

  // Compteurs décisions.
  const decisionsOpen = db.prepare(
    `SELECT COUNT(*) AS n FROM decisions WHERE status = 'ouverte'`
  ).get().n;
  const decisionsToday = db.prepare(
    `SELECT COUNT(*) AS n
       FROM decisions
      WHERE status = 'decidee' AND substr(decided_at, 1, 10) = ?`
  ).get(date).n;

  // Compteurs events.
  const eventsToday = db.prepare(
    `SELECT COUNT(*) AS n FROM events WHERE substr(starts_at, 1, 10) = ?`
  ).get(date).n;
  const eventsUpcoming = db.prepare(
    `SELECT COUNT(*) AS n
       FROM events
      WHERE starts_at >= ?
        AND starts_at < datetime(?, '+24 hours')`
  ).get(now(), now()).n;

  // Alertes.
  const alerts = [];

  // Tâches en retard (due_at dépassée, pas done).
  const overdue = db.prepare(
    `SELECT id, title, due_at FROM tasks
      WHERE done = 0 AND due_at IS NOT NULL AND due_at < ?
      ORDER BY due_at ASC LIMIT 5`
  ).all(now());
  for (const t of overdue) {
    alerts.push({
      level: 'warn',
      kind: 'task_overdue',
      message: `« ${t.title} » en retard depuis ${t.due_at.slice(0, 10)}`,
      ref: { type: 'task', id: t.id }
    });
  }

  // Décisions ouvertes depuis > 7 jours.
  const stale = db.prepare(
    `SELECT id, title, created_at FROM decisions
      WHERE status = 'ouverte' AND created_at < datetime(?, '-7 days')
      ORDER BY created_at ASC LIMIT 3`
  ).all(now());
  for (const d of stale) {
    alerts.push({
      level: 'warn',
      kind: 'decision_stale',
      message: `Décision « ${d.title} » ouverte depuis plus de 7 jours`,
      ref: { type: 'decision', id: d.id }
    });
  }

  // Big rocks définis mais aucun acquittement (pas de tâche done liée).
  if (bigRocks.length === 0 && week) {
    alerts.push({
      level: 'info',
      kind: 'big_rocks_missing',
      message: `Aucun Big Rock défini pour la semaine ${week}`
    });
  }

  return {
    date,
    week_id: week,
    intention,
    big_rocks: bigRocks,
    counters: {
      tasks: {
        open: tasksOpen,
        done_today: tasksDoneToday,
        total: tasksTotal
      },
      decisions: {
        open: decisionsOpen,
        decided_today: decisionsToday
      },
      events: {
        today: eventsToday,
        upcoming_24h: eventsUpcoming
      }
    },
    alerts
  };
}

// --- Route ---------------------------------------------------------

router.get('/today', (req, res) => {
  try {
    res.json(buildCockpit());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
module.exports.buildCockpit = buildCockpit;
module.exports.isoWeekId = isoWeekId;
