/**
 * src/routes/projects.js — projets attachés à un groupe.
 *
 *   GET    /api/projects                  (filtres: group, status, q)
 *   POST   /api/projects
 *   GET    /api/projects/:id              + counts (tasks ouvertes, decisions ouvertes, contacts liés)
 *   PATCH  /api/projects/:id
 *   DELETE /api/projects/:id
 *   POST   /api/projects/:id/progress     { progress: 0-100 }
 */
const express = require('express');
const { getDb, crud } = require('../db');

const projects = crud('projects', { jsonFields: ['companies'] });
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { group, status, q, limit, offset } = req.query;
    const filters = {};
    if (group !== undefined) filters.group_id = group;
    if (status) filters.status = status;
    const opts = {
      orderBy: "CASE status WHEN 'hot' THEN 0 WHEN 'active' THEN 1 WHEN 'new' THEN 2 ELSE 9 END, name ASC",
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    if (q) {
      const safe = String(q).replace(/'/g, "''");
      opts.where = `(name LIKE '%${safe}%' OR tagline LIKE '%${safe}%' OR description LIKE '%${safe}%')`;
    }
    const rows = projects.list(filters, opts);
    res.json({ projects: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !String(body.name).trim()) return res.status(400).json({ error: 'name requis' });
    const data = {
      id: body.id || undefined, // permettre slug perso
      name: String(body.name).trim(),
      group_id: body.group_id ?? null,
      tagline: body.tagline ?? null,
      status: body.status || 'active',
      description: body.description ?? null,
      color: body.color ?? null,
      icon: body.icon ?? null,
      progress: typeof body.progress === 'number' ? body.progress : 0,
      companies: body.companies ?? null,
    };
    const created = projects.insert(data);
    res.status(201).json({ project: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const p = projects.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'projet introuvable' });
  const db = getDb();
  const id = req.params.id;
  const counts = {
    tasks_open: db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE project_id = ? AND done = 0").get(id).n,
    tasks_total: db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE project_id = ?").get(id).n,
    tasks_done_30d: db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE project_id = ? AND done = 1 AND updated_at >= datetime('now','-30 days')").get(id).n,
    decisions_open: db.prepare("SELECT COUNT(*) AS n FROM decisions WHERE project_id = ? AND status = 'ouverte'").get(id).n,
    decisions_total: db.prepare("SELECT COUNT(*) AS n FROM decisions WHERE project_id = ?").get(id).n,
    contacts: db.prepare("SELECT COUNT(*) AS n FROM contacts_projects WHERE project_id = ?").get(id).n,
    events_upcoming: db.prepare("SELECT COUNT(*) AS n FROM events WHERE project_id = ? AND starts_at >= datetime('now')").get(id).n
  };
  let children = [];
  let parent = null;
  try {
    children = db.prepare("SELECT id, name, status, tagline, progress FROM projects WHERE parent_id = ? ORDER BY updated_at DESC").all(id);
    if (p.parent_id) parent = db.prepare("SELECT id, name FROM projects WHERE id = ?").get(p.parent_id);
  } catch (e) {}
  const recentTasks = db.prepare("SELECT id, title, done, priority, type, updated_at FROM tasks WHERE project_id = ? ORDER BY updated_at DESC LIMIT 10").all(id);
  const recentDecisions = db.prepare("SELECT id, title, status, updated_at FROM decisions WHERE project_id = ? ORDER BY updated_at DESC LIMIT 5").all(id);
  const velocity = counts.tasks_total > 0 ? Math.round((counts.tasks_total - counts.tasks_open) / counts.tasks_total * 100) : 0;
  res.json({ project: Object.assign({}, p, { counts: counts, parent: parent, children: children, recent_tasks: recentTasks, recent_decisions: recentDecisions, velocity_pct: velocity }) });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = projects.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'projet introuvable' });
    const allowed = ['name', 'group_id', 'tagline', 'status', 'description', 'color', 'icon', 'progress', 'companies', 'parent_id', 'effort_done_days', 'effort_remaining_days'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ project: existing });
    const updated = projects.update(req.params.id, patch);
    res.json({ project: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = projects.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'projet introuvable' });
    projects.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/progress', (req, res) => {
  try {
    const { progress } = req.body || {};
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'progress doit être un nombre entre 0 et 100' });
    }
    const p = projects.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'projet introuvable' });
    const updated = projects.update(req.params.id, { progress });
    res.json({ project: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.get('/:id/emails', (req, res) => {
  try {
    const db = getDb();
    const proj = projects.get(req.params.id);
    if (!proj) return res.status(404).json({ error: 'projet introuvable' });
    // Tolerant si colonne emails.project_id absente
    let rows = [];
    try {
      rows = db.prepare(`
        SELECT id, subject, from_name, from_email, received_at, arbitrated_at, is_read, has_attach, inferred_project
        FROM emails
        WHERE project_id = ? OR LOWER(inferred_project) = LOWER(?)
        ORDER BY received_at DESC
        LIMIT 50
      `).all(req.params.id, proj.name || '');
    } catch (e) {
      // fallback : pas de colonne project_id
      rows = db.prepare(`
        SELECT id, subject, from_name, from_email, received_at, arbitrated_at, is_read, has_attach, inferred_project
        FROM emails
        WHERE LOWER(inferred_project) = LOWER(?)
        ORDER BY received_at DESC
        LIMIT 50
      `).all(proj.name || '');
    }
    res.json({ project_id: proj.id, project_name: proj.name, emails: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
