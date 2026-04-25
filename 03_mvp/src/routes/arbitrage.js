/**
 * src/routes/arbitrage.js — sessions d'arbitrage matin (S2.03).
 *
 * Endpoints :
 *   POST /api/arbitrage/start    — propose 3 buckets (faire/deleguer/reporter) + crée la session
 *   POST /api/arbitrage/commit   — applique les décisions CEO sur les tâches + persiste
 *   GET  /api/arbitrage/today    — retourne la session du jour (200 ou 204 si aucune)
 *   GET  /api/arbitrage/history  — N dernières sessions (défaut 10)
 *
 * Modèle :
 *   - Une session par jour (UNIQUE arbitrage_sessions.date).
 *   - `proposals` : JSON {faire:[task_id], deleguer:[task_id], reporter:[task_id]}.
 *   - `user_decisions` : JSON même shape, mis à jour au commit.
 *   - Au commit : update tasks.type / tasks.due_at + insert task_events.
 *
 * Bucketing par défaut (rule-based, sans LLM) :
 *   - FAIRE      : top 3 tâches ouvertes triées par (priority asc, due_at asc, starred desc)
 *   - DELEGUER   : top 2 tâches `ai_capable=1` ou `type='delegate'`
 *   - REPORTER   : reste, plafonné à 5
 *
 * Note : l'orchestrateur LLM legacy (src/arbitrage.js) reste dispo pour un mode "rich"
 * branché plus tard ; ici on garantit un fallback déterministe + testable.
 */
const express = require('express');
const { getDb, uuid7, now } = require('../db');

const router = express.Router();

// --- Helpers --------------------------------------------------------

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10) + 'T09:00:00Z';
}

function priorityRank(p) {
  return ({ P0: 0, P1: 1, P2: 2, P3: 3 })[p] ?? 4;
}

function fetchOpenTasks() {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, title, description, type, priority, eisenhower, starred,
              done, due_at, estimated_min, ai_capable, project_id
         FROM tasks
        WHERE done = 0
        ORDER BY due_at ASC NULLS LAST, created_at ASC`
    )
    .all();
}

/**
 * Bucketing déterministe — sans LLM.
 * Retourne {faire:[], deleguer:[], reporter:[]} de task ids, plafonnés.
 */
function proposeBuckets(tasks) {
  const sorted = [...tasks].sort((a, b) => {
    const pa = priorityRank(a.priority);
    const pb = priorityRank(b.priority);
    if (pa !== pb) return pa - pb;
    const da = a.due_at || '9999';
    const db = b.due_at || '9999';
    if (da !== db) return da < db ? -1 : 1;
    return (b.starred || 0) - (a.starred || 0);
  });

  const used = new Set();
  const faire = [];
  for (const t of sorted) {
    if (faire.length >= 3) break;
    if (t.ai_capable === 1 && t.priority !== 'P0') continue; // garde pour deleguer
    faire.push(t.id);
    used.add(t.id);
  }

  const deleguer = [];
  for (const t of sorted) {
    if (used.has(t.id)) continue;
    if (deleguer.length >= 2) break;
    if (t.ai_capable === 1 || t.type === 'delegate') {
      deleguer.push(t.id);
      used.add(t.id);
    }
  }

  const reporter = [];
  for (const t of sorted) {
    if (used.has(t.id)) continue;
    if (reporter.length >= 5) break;
    reporter.push(t.id);
    used.add(t.id);
  }

  return { faire, deleguer, reporter };
}

function hydrate(buckets, byId) {
  const pick = (arr) => (arr || []).map((id) => byId[id]).filter(Boolean);
  return {
    faire: pick(buckets.faire),
    deleguer: pick(buckets.deleguer),
    reporter: pick(buckets.reporter),
  };
}

function loadSession(date) {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM arbitrage_sessions WHERE date = ?`)
    .get(date);
  return row || null;
}

function rowToPayload(row, byId) {
  const proposals = row.proposals ? JSON.parse(row.proposals) : { faire: [], deleguer: [], reporter: [] };
  const user_decisions = row.user_decisions ? JSON.parse(row.user_decisions) : null;
  return {
    id: row.id,
    date: row.date,
    proposals,
    user_decisions,
    hydrated: hydrate(user_decisions || proposals, byId),
    committed_at: user_decisions ? row.created_at : null,
    duration_sec: row.duration_sec,
    tokens_in: row.tokens_in,
    tokens_out: row.tokens_out,
    cost_eur: row.cost_eur,
  };
}

function indexById(tasks) {
  return Object.fromEntries(tasks.map((t) => [t.id, t]));
}

// --- POST /start ---------------------------------------------------

router.post('/start', (req, res) => {
  try {
    const db = getDb();
    const date = req.body?.date || todayIso();
    const t0 = Date.now();

    let row = loadSession(date);
    const tasks = fetchOpenTasks();
    const byId = indexById(tasks);

    if (!row) {
      const proposals = proposeBuckets(tasks);
      const id = uuid7();
      const stmt = db.prepare(
        `INSERT INTO arbitrage_sessions (id, date, proposals, duration_sec, created_at)
         VALUES (?, ?, ?, ?, ?)`
      );
      stmt.run(id, date, JSON.stringify(proposals), Math.round((Date.now() - t0) / 1000), now());
      row = loadSession(date);
    }

    res.json(rowToPayload(row, byId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /commit --------------------------------------------------

router.post('/commit', (req, res) => {
  try {
    const db = getDb();
    const date = req.body?.date || todayIso();
    const decisions = req.body?.decisions;

    if (!decisions || typeof decisions !== 'object') {
      return res.status(400).json({ error: 'decisions {faire,deleguer,reporter} requis' });
    }

    const row = loadSession(date);
    if (!row) {
      return res.status(404).json({ error: `aucune session pour ${date} — appeler /start d'abord` });
    }

    const buckets = {
      faire: Array.isArray(decisions.faire) ? decisions.faire : [],
      deleguer: Array.isArray(decisions.deleguer) ? decisions.deleguer : [],
      reporter: Array.isArray(decisions.reporter) ? decisions.reporter : [],
    };

    const tx = db.transaction(() => {
      // Persist user_decisions sur la session.
      db.prepare(
        `UPDATE arbitrage_sessions SET user_decisions = ? WHERE id = ?`
      ).run(JSON.stringify(buckets), row.id);

      // Applique sur tasks + event sourcing.
      const updateTask = db.prepare(
        `UPDATE tasks SET type = ?, due_at = COALESCE(?, due_at), updated_at = ? WHERE id = ?`
      );
      const insertEvent = db.prepare(
        `INSERT INTO task_events (id, task_id, event_type, payload, occurred_at) VALUES (?, ?, ?, ?, ?)`
      );

      const apply = (ids, kind, dueAtOverride) => {
        for (const tid of ids) {
          updateTask.run(kind, dueAtOverride || null, now(), tid);
          insertEvent.run(uuid7(), tid, 'arbitraged', JSON.stringify({ bucket: kind, session: row.id }), now());
        }
      };

      apply(buckets.faire, 'do', null);
      apply(buckets.deleguer, 'delegate', null);
      apply(buckets.reporter, 'defer', tomorrowIso());
    });
    tx();

    const tasks = fetchOpenTasks();
    const byId = indexById(tasks);
    const fresh = loadSession(date);
    res.json(rowToPayload(fresh, byId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /today ----------------------------------------------------

router.get('/today', (req, res) => {
  try {
    const date = todayIso();
    const row = loadSession(date);
    if (!row) return res.status(204).send();
    const byId = indexById(fetchOpenTasks());
    res.json(rowToPayload(row, byId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /history --------------------------------------------------

router.get('/history', (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const rows = db
      .prepare(
        `SELECT id, date, proposals, user_decisions, duration_sec, created_at
           FROM arbitrage_sessions
          ORDER BY date DESC
          LIMIT ?`
      )
      .all(limit);
    const items = rows.map((r) => ({
      id: r.id,
      date: r.date,
      committed: r.user_decisions ? true : false,
      counts: r.user_decisions
        ? (() => {
            const u = JSON.parse(r.user_decisions);
            return {
              faire: (u.faire || []).length,
              deleguer: (u.deleguer || []).length,
              reporter: (u.reporter || []).length,
            };
          })()
        : null,
      duration_sec: r.duration_sec,
      created_at: r.created_at,
    }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
module.exports.proposeBuckets = proposeBuckets;
module.exports.todayIso = todayIso;
