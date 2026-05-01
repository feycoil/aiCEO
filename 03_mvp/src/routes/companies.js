/**
 * src/routes/companies.js — S6.36 — Catalogue sociétés / entités juridiques.
 *
 *   GET    /api/companies
 *   POST   /api/companies         { name, slug?, color?, icon?, description?, parent_id? }
 *   GET    /api/companies/:id     + counts projets actifs/total + sous-sociétés
 *   PATCH  /api/companies/:id
 *   DELETE /api/companies/:id     (DELETE SET NULL côté projects.company_id et children.parent_id)
 *
 * Architecture validée 1/5 : Company est un AXE orthogonal à Domain sur les projets.
 * parent_id permet hiérarchie holding > filiale (max 1 niveau visé en V1).
 */
const express = require('express');
const { getDb, crud } = require('../db');

const companies = crud('companies');
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
    const rows = companies.list({}, { orderBy: 'display_order ASC, name ASC' });
    const db = getDb();
    const enriched = rows.map((c) => {
      let count = 0;
      let childCount = 0;
      try {
        count = db.prepare("SELECT COUNT(*) AS n FROM projects WHERE company_id = ?").get(c.id).n;
        childCount = db.prepare("SELECT COUNT(*) AS n FROM companies WHERE parent_id = ?").get(c.id).n;
      } catch (e) {}
      return Object.assign({}, c, { projects_count: count, children_count: childCount });
    });
    res.json({ companies: enriched, count: enriched.length });
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
      parent_id: body.parent_id || null,
      display_order: typeof body.display_order === 'number' ? body.display_order : 50,
    };
    const created = companies.insert(data);
    res.status(201).json({ company: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const c = companies.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'société introuvable' });
  const db = getDb();
  let counts = { projects_total: 0, projects_active: 0 };
  let children = [];
  let parent = null;
  try {
    counts.projects_total = db.prepare("SELECT COUNT(*) AS n FROM projects WHERE company_id = ?").get(req.params.id).n;
    counts.projects_active = db.prepare("SELECT COUNT(*) AS n FROM projects WHERE company_id = ? AND status IN ('active','hot','new')").get(req.params.id).n;
    children = db.prepare("SELECT id, name, slug, icon, color FROM companies WHERE parent_id = ? ORDER BY display_order ASC, name ASC").all(req.params.id);
    if (c.parent_id) parent = db.prepare("SELECT id, name FROM companies WHERE id = ?").get(c.parent_id);
  } catch (e) {}
  res.json({ company: Object.assign({}, c, { counts, parent, children }) });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = companies.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'société introuvable' });
    const allowed = ['name', 'slug', 'color', 'icon', 'description', 'parent_id', 'display_order'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ company: existing });
    const updated = companies.update(req.params.id, patch);
    res.json({ company: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = companies.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'société introuvable' });
    companies.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
