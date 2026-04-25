/**
 * src/routes/events.js — agenda (Outlook + manuels).
 *
 *   GET    /api/events                  filtres: from, to, project, source_type
 *   GET    /api/events/today
 *   GET    /api/events/week             (7 jours à partir de date|aujourd'hui)
 *   POST   /api/events                  (event manuel)
 *   GET    /api/events/:id
 *   PATCH  /api/events/:id              (refuse de patcher events Outlook)
 *   DELETE /api/events/:id              (idem)
 */
const express = require('express');
const { getDb, crud } = require('../db');

const events = crud('events', { jsonFields: ['attendees'] });
const router = express.Router();

function isoDay(d) {
  return new Date(d).toISOString().slice(0, 10);
}

router.get('/', (req, res) => {
  try {
    const { from, to, project, source_type, limit, offset } = req.query;
    const filters = {};
    if (project !== undefined) filters.project_id = project;
    if (source_type) filters.source_type = source_type;
    const opts = {
      orderBy: 'starts_at ASC',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    const wheres = [];
    if (from) wheres.push(`starts_at >= '${String(from).replace(/'/g, "''")}'`);
    if (to) wheres.push(`starts_at <= '${String(to).replace(/'/g, "''")}'`);
    if (wheres.length) opts.where = wheres.join(' AND ');
    const rows = events.list(filters, opts);
    res.json({ events: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/today', (req, res) => {
  try {
    const day = req.query.date || isoDay(new Date());
    const rows = events.list({}, {
      orderBy: 'starts_at ASC',
      where: `starts_at >= '${day}T00:00:00' AND starts_at <= '${day}T23:59:59'`,
    });
    res.json({ date: day, events: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/week', (req, res) => {
  try {
    const start = new Date(req.query.from || new Date());
    const end = new Date(start.getTime() + 7 * 86400000);
    const fromIso = start.toISOString();
    const toIso = end.toISOString();
    const rows = events.list({}, {
      orderBy: 'starts_at ASC',
      where: `starts_at >= '${fromIso}' AND starts_at < '${toIso}'`,
    });
    res.json({ from: fromIso, to: toIso, events: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.starts_at) {
      return res.status(400).json({ error: 'title et starts_at requis' });
    }
    const data = {
      title: String(body.title).trim(),
      project_id: body.project_id ?? null,
      starts_at: body.starts_at,
      ends_at: body.ends_at ?? null,
      duration_min: body.duration_min ?? null,
      location: body.location ?? null,
      attendees: body.attendees ?? null,
      notes: body.notes ?? null,
      source_type: body.source_type || 'manuel',
      source_id: body.source_id ?? null,
    };
    const created = events.insert(data);
    res.status(201).json({ event: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const ev = events.get(req.params.id);
  if (!ev) return res.status(404).json({ error: 'événement introuvable' });
  res.json({ event: ev });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = events.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'événement introuvable' });
    if (existing.source_type === 'outlook') {
      return res.status(409).json({ error: 'événement Outlook lecture-seule (notes/project_id seuls modifiables)' });
    }
    const allowed = ['title', 'project_id', 'starts_at', 'ends_at', 'duration_min', 'location', 'attendees', 'notes'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ event: existing });
    const updated = events.update(req.params.id, patch);
    res.json({ event: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Permettre annotations partielles sur événements Outlook
router.patch('/:id/annotate', (req, res) => {
  try {
    const existing = events.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'événement introuvable' });
    const allowed = ['notes', 'project_id'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ event: existing });
    const updated = events.update(req.params.id, patch);
    res.json({ event: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = events.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'événement introuvable' });
    if (existing.source_type === 'outlook') {
      return res.status(409).json({ error: 'événement Outlook non supprimable (re-synchroniser depuis Outlook)' });
    }
    events.remove(req.params.id);
    res.json({ ok: true, removed: existing.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
