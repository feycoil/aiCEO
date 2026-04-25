/**
 * src/routes/big-rocks.js — top 3 priorites hebdo (S3.01).
 *
 *   GET    /api/big-rocks?week=YYYY-Www       liste les big rocks de la semaine (1..3)
 *   POST   /api/big-rocks                     creation OU upsert si id fourni
 *                                             contrainte applicative : MAX 3 par semaine -> 400
 *   GET    /api/big-rocks/:id
 *   PATCH  /api/big-rocks/:id                 mise a jour partielle (title, status, ordre)
 *   DELETE /api/big-rocks/:id
 *
 * Schema (cf. data/migrations/2026-04-25-init-schema.sql) :
 *   big_rocks(id, week_id, ordre, title, description, status, created_at)
 *   FK week_id REFERENCES weeks(id) ON DELETE CASCADE
 *
 * S3.00 ADR : zero localStorage applicatif, contrainte max 3 verifiee serveur.
 */
const express = require('express');
const { getDb, crud, uuid7, now } = require('../db');

const rocks = crud('big_rocks');
const router = express.Router();

const WEEK_RE = /^(\d{4})-W(\d{2})$/;
const MAX_ROCKS_PER_WEEK = 3;

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

function countRocksForWeek(weekId) {
  const db = getDb();
  return db.prepare('SELECT COUNT(*) AS n FROM big_rocks WHERE week_id = ?').get(weekId).n;
}

function nextOrdre(weekId) {
  const db = getDb();
  const row = db.prepare('SELECT MAX(ordre) AS m FROM big_rocks WHERE week_id = ?').get(weekId);
  return (row && row.m ? Number(row.m) : 0) + 1;
}

router.get('/', (req, res) => {
  try {
    const { week } = req.query;
    if (!week) {
      const rows = rocks.list({}, { orderBy: 'week_id DESC, ordre ASC', limit: 50 });
      return res.json({ big_rocks: rows, count: rows.length });
    }
    if (!WEEK_RE.test(week)) {
      return res.status(400).json({ error: 'parametre week invalide (attendu: YYYY-Www)' });
    }
    const rows = rocks.list({ week_id: week }, { orderBy: 'ordre ASC' });
    res.json({ week, big_rocks: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const r = rocks.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'big rock introuvable' });
  res.json({ big_rock: r });
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    const week = body.week || body.week_id;
    if (!week || !WEEK_RE.test(week)) {
      return res.status(400).json({ error: 'champ week obligatoire (format YYYY-Www)' });
    }
    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({ error: 'champ title obligatoire' });
    }
    ensureWeek(week);

    // Cas upsert : si id fourni et deja existant, on update sans verifier la contrainte max 3
    if (body.id) {
      const existing = rocks.get(body.id);
      if (existing) {
        const allowed = ['title', 'description', 'status', 'ordre'];
        const patch = {};
        for (const k of allowed) if (k in body) patch[k] = body[k];
        const updated = rocks.update(body.id, patch);
        return res.json({ big_rock: updated, upserted: 'update' });
      }
    }

    // Creation : verifier contrainte max 3 par semaine
    const current = countRocksForWeek(week);
    if (current >= MAX_ROCKS_PER_WEEK) {
      return res.status(400).json({
        error: `contrainte max ${MAX_ROCKS_PER_WEEK} big rocks par semaine atteinte`,
        week,
        current,
        max: MAX_ROCKS_PER_WEEK,
      });
    }

    const data = {
      week_id: week,
      title: String(body.title).trim(),
      description: body.description ?? null,
      status: body.status || 'defini',
      ordre: body.ordre || nextOrdre(week),
      created_at: now(),
    };
    const created = rocks.insert(data);
    res.status(201).json({ big_rock: created, upserted: 'insert' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const existing = rocks.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'big rock introuvable' });
    const allowed = ['title', 'description', 'status', 'ordre'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ big_rock: existing });
    const updated = rocks.update(req.params.id, patch);
    res.json({ big_rock: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = rocks.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'big rock introuvable' });
    rocks.remove(req.params.id);
    res.json({ ok: true, removed: existing.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
