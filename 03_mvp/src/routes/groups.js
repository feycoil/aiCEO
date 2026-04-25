/**
 * src/routes/groups.js — portefeuille groupes (3-4 holding).
 *
 *   GET    /api/groups                 + counts projets ouverts
 *   POST   /api/groups
 *   GET    /api/groups/:id             + projets attachés
 *   PATCH  /api/groups/:id
 *   DELETE /api/groups/:id
 */
const express = require('express');
const { getDb, crud } = require('../db');

const groups = crud('groups');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const rows = groups.list({}, { orderBy: 'name ASC' });
    const db = getDb();
    const enriched = rows.map((g) => {
      const counts = {
        projects_total: db.prepare(`SELECT COUNT(*) AS n FROM projects WHERE group_id = ?`).get(g.id).n,
        projects_active: db.prepare(`SELECT COUNT(*) AS n FROM projects WHERE group_id = ? AND status IN ('active','hot','new')`).get(g.id).n,
      };
      return { ...g, counts };
    });
    res.json({ groups: enriched, count: enriched.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !String(body.name).trim()) return res.status(400).json({ error: 'name requis' });
    const data = {
      id: body.id || undefined,
      name: String(body.name).trim(),
      tagline: body.tagline ?? null,
      description: body.description ?? null,
      color: body.color ?? null,
      icon: body.icon ?? null,
    };
    const created = groups.insert(data);
    res.status(201).json({ group: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const g = groups.get(req.params.id);
  if (!g) return res.status(404).json({ error: 'groupe introuvable' });
  const db = getDb();
  const projects = db
    .prepare(`SELECT id, name, status, progress, tagline FROM projects WHERE group_id = ? ORDER BY name ASC`)
    .all(req.params.id);
  res.json({ group: { ...g, projects } });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = groups.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'groupe introuvable' });
    const allowed = ['name', 'tagline', 'description', 'color', 'icon'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ group: existing });
    const updated = groups.update(req.params.id, patch);
    res.json({ group: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = groups.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'groupe introuvable' });
    groups.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
