/**
 * src/routes/knowledge.js — Sprint v0.7-S6.7
 * Endpoints pour épinglage decisions/critères/principes (page connaissance.html).
 *
 *   GET    /api/knowledge                 → liste pins non archivés
 *   POST   /api/knowledge                 → créer un pin
 *   PATCH  /api/knowledge/:id             → modifier
 *   DELETE /api/knowledge/:id             → archiver (soft delete)
 *   POST   /api/knowledge/from-decision/:decId → créer pin depuis une décision
 */
const express = require('express');
const { getDb, uuid7 } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { kind, archived } = req.query;
    const where = [];
    const params = [];
    if (kind) { where.push("kind = ?"); params.push(kind); }
    if (archived !== "true") where.push("archived_at IS NULL");
    const sql = "SELECT * FROM knowledge_pins" +
      (where.length ? " WHERE " + where.join(" AND ") : "") +
      " ORDER BY pinned_at DESC LIMIT 200";
    const rows = db.prepare(sql).all(...params);
    res.json({ pins: rows, count: rows.length });
  } catch (e) {
    if (/no such table/i.test(e.message)) {
      return res.status(200).json({ pins: [], count: 0, warning: "Table knowledge_pins absente. Lancez node scripts/init-db.js" });
    }
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};
    if (!body.title) return res.status(400).json({ error: "title requis" });
    const id = uuid7();
    db.prepare(`
      INSERT INTO knowledge_pins (id, kind, title, content, source_type, source_id, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id,
      body.kind || 'note',
      body.title,
      body.content || null,
      body.source_type || 'manuel',
      body.source_id || null,
      body.tags ? JSON.stringify(body.tags) : null
    );
    const pin = db.prepare("SELECT * FROM knowledge_pins WHERE id = ?").get(id);
    res.status(201).json({ pin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const allowed = ['kind', 'title', 'content', 'tags', 'archived_at'];
    const sets = [];
    const params = [];
    for (const f of allowed) {
      if (f in req.body) {
        sets.push(f + " = ?");
        params.push(f === 'tags' && req.body[f] ? JSON.stringify(req.body[f]) : req.body[f]);
      }
    }
    if (!sets.length) return res.status(400).json({ error: "rien à modifier" });
    sets.push("updated_at = datetime('now')");
    params.push(id);
    db.prepare("UPDATE knowledge_pins SET " + sets.join(", ") + " WHERE id = ?").run(...params);
    const pin = db.prepare("SELECT * FROM knowledge_pins WHERE id = ?").get(id);
    if (!pin) return res.status(404).json({ error: "pin introuvable" });
    res.json({ pin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    db.prepare("UPDATE knowledge_pins SET archived_at = datetime('now') WHERE id = ?").run(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/from-decision/:decId', (req, res) => {
  try {
    const db = getDb();
    const { decId } = req.params;
    const dec = db.prepare("SELECT * FROM decisions WHERE id = ?").get(decId);
    if (!dec) return res.status(404).json({ error: "decision introuvable" });
    const id = uuid7();
    db.prepare(`
      INSERT INTO knowledge_pins (id, kind, title, content, source_type, source_id, created_at, updated_at)
      VALUES (?, 'decision', ?, ?, 'decision', ?, datetime('now'), datetime('now'))
    `).run(id, dec.title, dec.context || dec.decision || "", decId);
    const pin = db.prepare("SELECT * FROM knowledge_pins WHERE id = ?").get(id);
    res.status(201).json({ pin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
