/**
 * src/routes/tasks.js — API REST tasks (CRUD + toggle/defer + historique).
 *
 * Endpoints :
 *   GET    /api/tasks                 (filtres: project, done, eisenhower, priority, starred, q)
 *   POST   /api/tasks                 crée une tâche
 *   GET    /api/tasks/:id             tâche + events
 *   PATCH  /api/tasks/:id             édite (event 'edited')
 *   DELETE /api/tasks/:id             supprime
 *   POST   /api/tasks/:id/toggle      bascule done/undone (event 'done'|'undone')
 *   POST   /api/tasks/:id/defer       reporte (due_at) (event 'deferred')
 *   GET    /api/tasks/:id/events      historique brut
 *
 * Event sourcing léger : chaque mutation insère un task_events.
 */
const express = require('express');
const { getDb, crud, uuid7, now } = require('../db');
const { emitChange } = require('../realtime');

const tasks = crud('tasks');

function logEvent(taskId, eventType, payload = {}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO task_events (id, task_id, event_type, payload, occurred_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(uuid7(), taskId, eventType, JSON.stringify(payload), now());
}

function getTaskWithEvents(id) {
  const t = tasks.get(id);
  if (!t) return null;
  const db = getDb();
  const events = db
    .prepare(`SELECT * FROM task_events WHERE task_id = ? ORDER BY occurred_at ASC`)
    .all(id)
    .map((e) => ({ ...e, payload: e.payload ? JSON.parse(e.payload) : null }));
  return { ...t, events };
}

const router = express.Router();

// ------------------------------------------------------------
// GET /api/tasks
// ------------------------------------------------------------
router.get('/', (req, res) => {
  try {
    const { project, done, eisenhower, priority, starred, q, type, limit, offset } = req.query;
    const filters = {};
    if (project !== undefined) filters.project_id = project;
    if (done !== undefined) filters.done = done === 'true' || done === '1' ? 1 : 0;
    if (eisenhower) filters.eisenhower = eisenhower;
    if (priority) filters.priority = priority;
    if (starred !== undefined) filters.starred = starred === 'true' || starred === '1' ? 1 : 0;
    if (type) filters.type = type;

    const opts = {
      orderBy: 'starred DESC, priority ASC, due_at ASC, created_at DESC',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    if (q) {
      opts.where = `(title LIKE '%${String(q).replace(/'/g, "''")}%' OR description LIKE '%${String(q).replace(/'/g, "''")}%')`;
    }
    const rows = tasks.list(filters, opts);
    res.json({ tasks: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------------------------------------
// POST /api/tasks
// ------------------------------------------------------------
router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({ error: 'title requis' });
    }
    const data = {
      title: String(body.title).trim(),
      description: body.description ?? null,
      project_id: body.project_id ?? null,
      type: body.type || 'do',
      priority: body.priority || 'P2',
      eisenhower: body.eisenhower || '--',
      starred: body.starred ? 1 : 0,
      done: body.done ? 1 : 0,
      due_at: body.due_at ?? null,
      estimated_min: body.estimated_min ?? null,
      energy: body.energy ?? null,
      ai_capable: body.ai_capable ? 1 : 0,
      ai_proposal: body.ai_proposal ?? null,
      context: body.context ?? null,
      source_type: body.source_type || 'manuel',
      source_id: body.source_id ?? null,
    };
    const created = tasks.insert(data);
    logEvent(created.id, 'created', { source: data.source_type });
    emitChange('task.created', { id: created.id });
    res.status(201).json({ task: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------------------------------------
// GET /api/tasks/:id
// ------------------------------------------------------------
router.get('/:id', (req, res) => {
  const full = getTaskWithEvents(req.params.id);
  if (!full) return res.status(404).json({ error: 'tâche introuvable' });
  res.json({ task: full });
});

// ------------------------------------------------------------
// PATCH /api/tasks/:id
// ------------------------------------------------------------
router.patch('/:id', (req, res) => {
  try {
    const existing = tasks.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'tâche introuvable' });
    const allowed = [
      'title', 'description', 'project_id', 'type', 'priority', 'eisenhower',
      'starred', 'done', 'due_at', 'estimated_min', 'energy',
      'ai_capable', 'ai_proposal', 'context', 'source_type', 'source_id',
    ];
    const patch = {};
    for (const k of allowed) {
      if (k in req.body) {
        if (k === 'starred' || k === 'done' || k === 'ai_capable') {
          patch[k] = req.body[k] ? 1 : 0;
        } else {
          patch[k] = req.body[k];
        }
      }
    }
    if (!Object.keys(patch).length) return res.json({ task: existing });
    const updated = tasks.update(req.params.id, patch);
    logEvent(req.params.id, 'edited', { fields: Object.keys(patch) });
    emitChange('task.updated', { id: updated.id, done: updated.done });
    res.json({ task: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------------------------------------
// DELETE /api/tasks/:id
// ------------------------------------------------------------
router.delete('/:id', (req, res) => {
  try {
    const existed = tasks.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'tâche introuvable' });
    tasks.remove(req.params.id);
    emitChange('task.deleted', { id: existed.id });
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------------------------------------
// POST /api/tasks/:id/toggle
// ------------------------------------------------------------
router.post('/:id/toggle', (req, res) => {
  try {
    const t = tasks.get(req.params.id);
    if (!t) return res.status(404).json({ error: 'tâche introuvable' });
    const newDone = t.done ? 0 : 1;
    const updated = tasks.update(req.params.id, { done: newDone });
    logEvent(req.params.id, newDone ? 'done' : 'undone', {});
    emitChange('task.updated', { id: updated.id, done: updated.done });
    res.json({ task: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------------------------------------
// POST /api/tasks/:id/defer
// ------------------------------------------------------------
router.post('/:id/defer', (req, res) => {
  try {
    const { due_at, reason } = req.body || {};
    if (!due_at) return res.status(400).json({ error: 'due_at requis' });
    const t = tasks.get(req.params.id);
    if (!t) return res.status(404).json({ error: 'tâche introuvable' });
    const updated = tasks.update(req.params.id, { due_at, type: 'defer' });
    logEvent(req.params.id, 'deferred', { due_at, reason: reason || null });
    res.json({ task: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------------------------------------
// GET /api/tasks/:id/events
// ------------------------------------------------------------
router.get('/:id/events', (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'tâche introuvable' });
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM task_events WHERE task_id = ? ORDER BY occurred_at ASC`)
    .all(req.params.id)
    .map((e) => ({ ...e, payload: e.payload ? JSON.parse(e.payload) : null }));
  res.json({ events: rows });
});

module.exports = router;
