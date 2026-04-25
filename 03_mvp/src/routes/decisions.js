/**
 * src/routes/decisions.js — registre décisions.
 *
 *   GET    /api/decisions                 (filtres: project, status, owner, q)
 *   POST   /api/decisions                 crée
 *   GET    /api/decisions/:id             détail + tasks liées (via source_id == decision id)
 *   PATCH  /api/decisions/:id
 *   DELETE /api/decisions/:id
 *   POST   /api/decisions/:id/decide      transition decidee + decided_at
 *   POST   /api/decisions/:id/execute     transition executee
 *   POST   /api/decisions/:id/abandon     transition abandonnee
 */
const express = require('express');
const { getDb, crud, now } = require('../db');

const decisions = crud('decisions');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { project, status, owner, q, limit, offset } = req.query;
    const filters = {};
    if (project !== undefined) filters.project_id = project;
    if (status) filters.status = status;
    if (owner) filters.owner = owner;
    const opts = {
      orderBy: 'created_at DESC',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    if (q) {
      const safe = String(q).replace(/'/g, "''");
      opts.where = `(title LIKE '%${safe}%' OR context LIKE '%${safe}%' OR decision LIKE '%${safe}%')`;
    }
    const rows = decisions.list(filters, opts);
    res.json({ decisions: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({ error: 'title requis' });
    }
    const data = {
      title: String(body.title).trim(),
      project_id: body.project_id ?? null,
      context: body.context ?? null,
      decision: body.decision ?? null,
      owner: body.owner ?? null,
      status: body.status || 'ouverte',
      decided_at: body.decided_at ?? null,
      deadline: body.deadline ?? null,
    };
    const created = decisions.insert(data);
    res.status(201).json({ decision: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const d = decisions.get(req.params.id);
  if (!d) return res.status(404).json({ error: 'décision introuvable' });
  // Tâches liées : convention source_type='decision' & source_id=decision.id
  const db = getDb();
  const linkedTasks = db
    .prepare(`SELECT id, title, done, type, priority FROM tasks WHERE source_type = 'decision' AND source_id = ?`)
    .all(req.params.id);
  res.json({ decision: { ...d, linked_tasks: linkedTasks } });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = decisions.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'décision introuvable' });
    const allowed = ['title', 'project_id', 'context', 'decision', 'owner', 'status', 'decided_at', 'deadline'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ decision: existing });
    const updated = decisions.update(req.params.id, patch);
    res.json({ decision: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = decisions.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'décision introuvable' });
    decisions.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function transition(targetStatus, opts = {}) {
  return (req, res) => {
    try {
      const d = decisions.get(req.params.id);
      if (!d) return res.status(404).json({ error: 'décision introuvable' });
      const patch = { status: targetStatus };
      if (opts.setDecidedAt) patch.decided_at = now();
      if (req.body?.decision !== undefined) patch.decision = req.body.decision;
      if (req.body?.owner !== undefined) patch.owner = req.body.owner;
      const updated = decisions.update(req.params.id, patch);
      res.json({ decision: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
}

router.post('/:id/decide', transition('decidee', { setDecidedAt: true }));
router.post('/:id/execute', transition('executee'));
router.post('/:id/abandon', transition('abandonnee'));

module.exports = router;
