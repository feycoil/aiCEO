/**
 * src/routes/weekly-reviews.js — revues hebdo (S3.01).
 *
 *   GET    /api/weekly-reviews?week=YYYY-Www         revue de la semaine (ou 404 si pas de revue)
 *   GET    /api/weekly-reviews                       liste les dernieres revues (limit=12 par defaut)
 *   POST   /api/weekly-reviews                       upsert sur week_id (creation ou mise a jour)
 *   GET    /api/weekly-reviews/:id                   revue par id direct
 *   DELETE /api/weekly-reviews/:id
 *
 * Schema (cf. data/migrations/2026-04-25-init-schema.sql) :
 *   weekly_reviews(id, week_id, intention, big_rocks_done, bilan, cap_prochaine,
 *                  mood, notes, draft_by_llm, created_at, updated_at)
 *   UNIQUE(week_id) — une seule revue par semaine.
 *
 * S3.00 ADR : zero localStorage applicatif, payload entierement piloté serveur.
 */
const express = require('express');
const { getDb, crud, uuid7, now } = require('../db');

const reviews = crud('weekly_reviews', { jsonFields: ['big_rocks_done'] });
const router = express.Router();

const WEEK_RE = /^(\d{4})-W(\d{2})$/;

// Calcule lundi/dimanche d'une semaine ISO YYYY-Www
function isoWeekDates(weekId) {
  const m = String(weekId).match(WEEK_RE);
  if (!m) return null;
  const year = Number(m[1]);
  const wk = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Dow - 1) * 86400000);
  const monday = new Date(week1Monday.getTime() + (wk - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  return {
    starts_on: monday.toISOString().slice(0, 10),
    ends_on: sunday.toISOString().slice(0, 10),
    year,
    week_number: wk,
  };
}

// Garantit l'existence d'une ligne dans weeks (FK weekly_reviews.week_id)
function ensureWeek(weekId) {
  const db = getDb();
  const row = db.prepare('SELECT id FROM weeks WHERE id = ?').get(weekId);
  if (row) return row;
  const dates = isoWeekDates(weekId);
  if (!dates) throw new Error(`week_id invalide: ${weekId}`);
  db.prepare(
    'INSERT INTO weeks (id, year, week_number, starts_on, ends_on) VALUES (?, ?, ?, ?, ?)'
  ).run(weekId, dates.year, dates.week_number, dates.starts_on, dates.ends_on);
  return { id: weekId };
}

router.get('/', (req, res) => {
  try {
    const { week, limit } = req.query;
    if (week) {
      if (!WEEK_RE.test(week)) {
        return res.status(400).json({ error: 'parametre week invalide (attendu: YYYY-Www)' });
      }
      const rows = reviews.list({ week_id: week });
      if (!rows.length) return res.status(404).json({ error: 'aucune revue pour cette semaine', week });
      return res.json({ review: rows[0] });
    }
    const rows = reviews.list({}, {
      orderBy: 'week_id DESC',
      limit: limit ? Number(limit) : 12,
    });
    res.json({ reviews: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const r = reviews.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'revue introuvable' });
  res.json({ review: r });
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    const week = body.week || body.week_id;
    if (!week || !WEEK_RE.test(week)) {
      return res.status(400).json({ error: 'champ week obligatoire (format YYYY-Www)' });
    }
    ensureWeek(week);

    const allowed = ['intention', 'big_rocks_done', 'bilan', 'cap_prochaine', 'mood', 'notes', 'draft_by_llm'];
    const data = { week_id: week };
    for (const k of allowed) if (k in body) data[k] = body[k];
    if ('draft_by_llm' in data) data.draft_by_llm = data.draft_by_llm ? 1 : 0;
    else data.draft_by_llm = 0;

    const existing = reviews.list({ week_id: week });
    if (existing.length) {
      const updated = reviews.update(existing[0].id, data);
      return res.json({ review: updated, upserted: 'update' });
    }
    data.created_at = now();
    data.updated_at = now();
    const created = reviews.insert(data);
    res.status(201).json({ review: created, upserted: 'insert' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = reviews.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'revue introuvable' });
    reviews.remove(req.params.id);
    res.json({ ok: true, removed: existing.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
