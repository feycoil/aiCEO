/**
 * src/routes/domains.js — S6.36 — Catalogue thématiques entrepreneuriales.
 *
 *   GET    /api/domains
 *   POST   /api/domains          { name, slug?, color?, icon?, description?, display_order? }
 *   GET    /api/domains/:id      + counts (projects par status)
 *   PATCH  /api/domains/:id
 *   DELETE /api/domains/:id      (DELETE SET NULL côté projects.domain_id)
 *
 * Architecture validée 1/5 : Domain est un AXE orthogonal à Company sur les projets.
 */
const express = require('express');
const { getDb, crud } = require('../db');

const domains = crud('domains');
const router = express.Router();

function slugify(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

router.get('/', (req, res) => {
  try {
    const rows = domains.list({}, { orderBy: 'display_order ASC, name ASC' });
    // enrichi avec counts projets par domaine
    const db = getDb();
    const enriched = rows.map((d) => {
      let count = 0;
      try {
        count = db.prepare("SELECT COUNT(*) AS n FROM projects WHERE domain_id = ?").get(d.id).n;
      } catch (e) {}
      return Object.assign({}, d, { projects_count: count });
    });
    res.json({ domains: enriched, count: enriched.length });
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
      slug: body.slug || slugify(body.name),
      color: body.color || null,
      icon: body.icon || null,
      description: body.description || null,
      display_order: typeof body.display_order === 'number' ? body.display_order : 50,
    };
    const created = domains.insert(data);
    res.status(201).json({ domain: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const d = domains.get(req.params.id);
  if (!d) return res.status(404).json({ error: 'domaine introuvable' });
  const db = getDb();
  let projectsByStatus = {};
  try {
    const rows = db.prepare("SELECT status, COUNT(*) AS n FROM projects WHERE domain_id = ? GROUP BY status").all(req.params.id);
    rows.forEach((r) => { projectsByStatus[r.status || 'active'] = r.n; });
  } catch (e) {}
  res.json({ domain: Object.assign({}, d, { projects_by_status: projectsByStatus }) });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = domains.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'domaine introuvable' });
    const allowed = ['name', 'slug', 'color', 'icon', 'description', 'display_order'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ domain: existing });
    const updated = domains.update(req.params.id, patch);
    res.json({ domain: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = domains.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'domaine introuvable' });
    domains.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
