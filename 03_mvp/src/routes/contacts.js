/**
 * src/routes/contacts.js — annuaire + liaison projects.
 *
 *   GET    /api/contacts                  (q, trust_level, company)
 *   POST   /api/contacts
 *   GET    /api/contacts/:id              + projets liés
 *   PATCH  /api/contacts/:id
 *   DELETE /api/contacts/:id
 *   POST   /api/contacts/:id/link-project { project_id, role }
 *   DELETE /api/contacts/:id/link-project/:project_id
 *   GET    /api/contacts/search?q=...     recherche full-name/email/company
 */
const express = require('express');
const { getDb, crud } = require('../db');

const contacts = crud('contacts');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { q, trust_level, company, limit, offset } = req.query;
    const filters = {};
    if (trust_level) filters.trust_level = trust_level;
    if (company) filters.company = company;
    const opts = {
      orderBy: 'name ASC',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    if (q) {
      const safe = String(q).replace(/'/g, "''");
      opts.where = `(name LIKE '%${safe}%' OR email LIKE '%${safe}%' OR company LIKE '%${safe}%' OR role LIKE '%${safe}%')`;
    }
    const rows = contacts.list(filters, opts);
    res.json({ contacts: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/search', (req, res) => {
  const q = req.query.q || '';
  if (!q) return res.json({ contacts: [] });
  const safe = String(q).replace(/'/g, "''");
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM contacts
       WHERE name LIKE '%${safe}%' OR email LIKE '%${safe}%' OR company LIKE '%${safe}%' OR role LIKE '%${safe}%'
       ORDER BY name ASC LIMIT 25`
    )
    .all();
  res.json({ contacts: rows, count: rows.length });
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !String(body.name).trim()) return res.status(400).json({ error: 'name requis' });
    const data = {
      name: String(body.name).trim(),
      role: body.role ?? null,
      company: body.company ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      trust_level: body.trust_level || 'moyenne',
      notes: body.notes ?? null,
      last_seen_at: body.last_seen_at ?? null,
    };
    const created = contacts.insert(data);
    res.status(201).json({ contact: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const c = contacts.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'contact introuvable' });
  const db = getDb();
  const projects = db
    .prepare(
      `SELECT p.id, p.name, p.status, cp.role
       FROM contacts_projects cp
       JOIN projects p ON p.id = cp.project_id
       WHERE cp.contact_id = ?`
    )
    .all(req.params.id);
  res.json({ contact: { ...c, projects } });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = contacts.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'contact introuvable' });
    const allowed = ['name', 'role', 'company', 'email', 'phone', 'trust_level', 'notes', 'last_seen_at'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ contact: existing });
    const updated = contacts.update(req.params.id, patch);
    res.json({ contact: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = contacts.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'contact introuvable' });
    contacts.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/link-project', (req, res) => {
  try {
    const { project_id, role } = req.body || {};
    if (!project_id) return res.status(400).json({ error: 'project_id requis' });
    const c = contacts.get(req.params.id);
    if (!c) return res.status(404).json({ error: 'contact introuvable' });
    const db = getDb();
    db.prepare(
      `INSERT OR REPLACE INTO contacts_projects (contact_id, project_id, role) VALUES (?, ?, ?)`
    ).run(req.params.id, project_id, role || null);
    res.json({ ok: true, contact_id: req.params.id, project_id, role: role || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/link-project/:project_id', (req, res) => {
  try {
    const db = getDb();
    const r = db
      .prepare(`DELETE FROM contacts_projects WHERE contact_id = ? AND project_id = ?`)
      .run(req.params.id, req.params.project_id);
    res.json({ ok: r.changes > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
