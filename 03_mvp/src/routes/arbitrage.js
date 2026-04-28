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
const { createAnthropicClient } = require('../anthropic-client');
const { getDb, uuid7, now } = require('../db');
const { loadEmails } = require('../emails-context');

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

// --- POST /analyze-emails ----------------------------
// Source : table SQLite `emails` (alimentee par scripts/normalize-emails.js
// apres sync Outlook, ou par scripts/ingest-emails.js en rattrapage).
// Ne lit plus le JSON : la DB est la source de verite.

router.post("/analyze-emails", async (req, res) => {
  try {
    const db = getDb();

    // Verifier presence table emails (tolerant si migration pas encore lancee)
    const hasTable = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='emails'")
      .get();
    if (!hasTable) {
      return res.status(200).json({
        proposals: [],
        ready: false,
        reason: "no-table",
        message:
          "La table emails n'existe pas encore. Lancez : npm run db:init puis scripts/sync-outlook.ps1.",
      });
    }

    const total = db.prepare("SELECT COUNT(*) AS c FROM emails").get().c;
    if (total === 0) {
      return res.status(200).json({
        proposals: [],
        ready: false,
        reason: "no-sync",
        message:
          "Aucun email synchronise pour le moment. Lancez d'abord la sync Outlook (scripts/sync-outlook.ps1), puis revenez ici.",
      });
    }

    // Heuristique de scoring SQL :
    //   flagged*100 + unread*30 + has_attach*5 + (project!=null)*10
    //   + bonus recence (CASE sur diff jours)
    // On ignore is_self et les emails deja arbitres (arbitrated_at NOT NULL).
    const rows = db.prepare(`
      SELECT
        id, account, folder, subject, from_name, from_email, to_addrs,
        received_at, unread, flagged, has_attach, preview,
        inferred_project, is_self,
        (
          (flagged * 100)
          + (unread * 30)
          + (has_attach * 5)
          + (CASE WHEN inferred_project IS NOT NULL AND inferred_project != '' THEN 10 ELSE 0 END)
          + (CASE
              WHEN julianday('now') - julianday(received_at) < 1 THEN 20
              WHEN julianday('now') - julianday(received_at) < 3 THEN 10
              WHEN julianday('now') - julianday(received_at) < 7 THEN 5
              ELSE 0
            END)
        ) AS score
      FROM emails
      WHERE is_self = 0
        AND arbitrated_at IS NULL
      ORDER BY score DESC, received_at DESC
      LIMIT 8
    `).all();

    const candidates = rows.filter((r) => r.score > 0);

    // Stats globales pour info CEO
    const stats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN unread = 1 THEN 1 ELSE 0 END) AS unread,
        SUM(CASE WHEN flagged = 1 THEN 1 ELSE 0 END) AS flagged,
        SUM(CASE WHEN arbitrated_at IS NOT NULL THEN 1 ELSE 0 END) AS arbitrated,
        MAX(ingested_at) AS last_ingest
      FROM emails
    `).get();

    if (candidates.length === 0) {
      return res.status(200).json({
        proposals: [],
        ready: false,
        reason: "no-actionable",
        totals: stats,
        message:
          "Sync trouvee (" + total + " emails) mais aucun n'est non-lu, flagge ou recent. Rien a arbitrer ce matin.",
      });
    }

    // Mapping kind heuristique (subject -> task / decision / project)
    const kindFor = (subject) => {
      const s = (subject || "");
      if (/[?]\s*$/.test(s)) return "decision";
      if (/^(re|fwd|tr)\s*:/i.test(s)) return "task";
      if (/(projet|launch|kickoff|lancement)/i.test(s)) return "project";
      return "task";
    };

    const proposals = candidates.map((r, i) => ({
      id: "arb-" + (i + 1),
      source_id: r.id,
      kind: kindFor(r.subject),
      title: r.subject || "(sans objet)",
      from: r.from_name || r.from_email || "",
      from_email: r.from_email || "",
      excerpt: (r.preview || "").slice(0, 220).trim(),
      proposed_priority: r.score >= 100 ? "P0" : r.score >= 50 ? "P1" : "P2",
      inferred_project: r.inferred_project || null,
      received_at: r.received_at,
      flagged: !!r.flagged,
      unread: !!r.unread,
      score: r.score,
      created_from: "email",
    }));

    res.json({
      proposals,
      total: proposals.length,
      ready: true,
      totals: stats,
      message:
        "Analyse terminee - " + proposals.length + " action(s) proposee(s) a arbitrer.",
    });
  } catch (e) {
    console.error("[/api/arbitrage/analyze-emails] error:", e);
    res.status(500).json({ error: e.message });
  }
});

// --- POST /bootstrap-from-emails -------------------------
// Auto-cree projets distincts (depuis emails.inferred_project)
// et contacts recurrents (>= 3 emails) en table SQLite.
// Idempotent : skip si name/email deja present.
router.post("/bootstrap-from-emails", async (req, res) => {
  try {
    const db = getDb();
    const crypto = require("crypto");
    const uuid = () => crypto.randomUUID();

    // Verif table emails
    const hasEmails = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='emails'"
    ).get();
    if (!hasEmails) {
      return res.status(200).json({
        ok: false,
        reason: "no-table",
        message: "Table emails absente. Lancez node scripts/init-db.js puis ingest-emails.js.",
      });
    }

    // 1. Projets
    const distinctProjects = db.prepare(`
      SELECT inferred_project AS slug, COUNT(*) AS n,
             MIN(received_at) AS first_seen, MAX(received_at) AS last_seen
      FROM emails
      WHERE inferred_project IS NOT NULL AND inferred_project != '' AND is_self = 0
      GROUP BY inferred_project
      ORDER BY n DESC
    `).all();

    const checkProj = db.prepare("SELECT id FROM projects WHERE LOWER(name) = LOWER(?)");
    const insProj = db.prepare(
      "INSERT INTO projects (id, name, tagline, status, description, progress, created_at, updated_at) " +
      "VALUES (?, ?, ?, 'active', ?, 0, datetime('now'), datetime('now'))"
    );

    let projCreated = 0, projSkipped = 0;
    const projNames = [];
    for (const p of distinctProjects) {
      if (checkProj.get(p.slug)) { projSkipped++; continue; }
      insProj.run(
        uuid(),
        p.slug,
        "Auto-cree depuis sync Outlook",
        p.n + " email(s) sur 30 jours (premier " + (p.first_seen || "?").slice(0, 10) +
          ", dernier " + (p.last_seen || "?").slice(0, 10) + ")"
      );
      projCreated++;
      projNames.push(p.slug);
    }

    // 2. Contacts
    const senders = db.prepare(`
      SELECT from_email, COUNT(*) AS n, MAX(received_at) AS last_seen
      FROM emails
      WHERE is_self = 0 AND from_email IS NOT NULL AND from_email != ''
      GROUP BY from_email
      HAVING n >= 3
      ORDER BY n DESC
    `).all();

    const pickName = db.prepare(
      "SELECT from_name, COUNT(*) AS n FROM emails " +
      "WHERE from_email = ? AND from_name IS NOT NULL AND from_name != '' " +
      "GROUP BY from_name ORDER BY n DESC LIMIT 1"
    );
    const checkCon = db.prepare("SELECT id FROM contacts WHERE LOWER(email) = LOWER(?)");
    const insCon = db.prepare(
      "INSERT INTO contacts (id, name, email, trust_level, notes, last_seen_at, created_at, updated_at) " +
      "VALUES (?, ?, ?, 'moyenne', ?, ?, datetime('now'), datetime('now'))"
    );

    let conCreated = 0, conSkipped = 0;
    const conNames = [];
    for (const s of senders) {
      if (checkCon.get(s.from_email)) { conSkipped++; continue; }
      const nameRow = pickName.get(s.from_email);
      const name = (nameRow && nameRow.from_name) || s.from_email.split("@")[0];
      insCon.run(
        uuid(),
        name,
        s.from_email,
        s.n + " email(s) recu(s) sur 30 jours",
        s.last_seen
      );
      conCreated++;
      conNames.push(name);
    }

    res.json({
      ok: true,
      projects: { created: projCreated, skipped: projSkipped, names: projNames },
      contacts: { created: conCreated, skipped: conSkipped, names: conNames },
      totals: {
        projects: db.prepare("SELECT COUNT(*) AS c FROM projects").get().c,
        contacts: db.prepare("SELECT COUNT(*) AS c FROM contacts").get().c,
      },
      message:
        projCreated + " projet(s) + " + conCreated + " contact(s) crees " +
        "(skipped " + projSkipped + "/" + conSkipped + ").",
    });
  } catch (e) {
    console.error("[/api/arbitrage/bootstrap-from-emails] error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- POST /api/emails/:id/link-project --------------------------
// Permet de rattacher un email à un projet (FK emails.project_id).
// (Migration 2026-04-28-emails-fk-projects.sql doit être appliquée.)
router.post("/emails/:id/link-project", (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { project_id } = req.body || {};
    if (!project_id) return res.status(400).json({ error: "project_id requis" });

    // Verif email existe
    const email = db.prepare("SELECT id FROM emails WHERE id = ?").get(id);
    if (!email) return res.status(404).json({ error: "email introuvable" });

    // Verif projet existe
    const proj = db.prepare("SELECT id, name FROM projects WHERE id = ?").get(project_id);
    if (!proj) return res.status(404).json({ error: "projet introuvable" });

    db.prepare("UPDATE emails SET project_id = ? WHERE id = ?").run(project_id, id);
    res.json({ ok: true, email_id: id, project: proj });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /api/emails/suggest-project?email_id=X -------------------
// Suggère un projet pour rattachement basé sur emails.inferred_project (slug).
// Heuristique : match sur projects.name (case-insensitive) ou sur les emails du même expéditeur déjà rattachés.
router.get("/emails/suggest-project", (req, res) => {
  try {
    const db = getDb();
    const { email_id } = req.query;
    if (!email_id) return res.status(400).json({ error: "email_id requis" });

    const email = db.prepare("SELECT * FROM emails WHERE id = ?").get(email_id);
    if (!email) return res.status(404).json({ error: "email introuvable" });

    const candidates = [];

    // 1. Match exact sur inferred_project ↔ project name
    if (email.inferred_project) {
      const direct = db
        .prepare("SELECT * FROM projects WHERE LOWER(name) = LOWER(?) LIMIT 1")
        .get(email.inferred_project);
      if (direct) candidates.push({ project: direct, confidence: 0.95, reason: "inferred_project match exact" });
    }

    // 2. Projets déjà rattachés à des emails du même expéditeur
    if (email.from_email) {
      const sibling = db.prepare(`
        SELECT p.*, COUNT(*) AS n
        FROM emails e
        JOIN projects p ON p.id = e.project_id
        WHERE e.from_email = ? AND e.id != ? AND e.project_id IS NOT NULL
        GROUP BY p.id ORDER BY n DESC LIMIT 1
      `).get(email.from_email, email_id);
      if (sibling && (!candidates.length || sibling.id !== candidates[0].project.id)) {
        candidates.push({ project: sibling, confidence: 0.7, reason: sibling.n + " emails du meme expediteur deja rattaches" });
      }
    }

    // 3. Match keywords subject ↔ project name (fuzzy)
    const subj = (email.subject || "").toLowerCase();
    if (subj.length > 0) {
      const allProj = db.prepare("SELECT * FROM projects").all();
      for (const p of allProj) {
        const slug = (p.name || "").toLowerCase();
        if (slug.length < 3) continue;
        if (subj.indexOf(slug) !== -1 && !candidates.find(c => c.project.id === p.id)) {
          candidates.push({ project: p, confidence: 0.5, reason: "nom projet present dans le sujet" });
        }
      }
    }

    res.json({
      email_id: email_id,
      suggestions: candidates.slice(0, 3),
      ready: candidates.length > 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// S6.8.2 — POST /suggest-action : suggestion verdict riche pour un email d'arbitrage
//   Body : { email_id: string, kind?: 'task'|'decision'|'project' }
//   Retour : { verdict, title, suggested_delegate, suggested_schedule, confidence, reason, source: 'llm'|'rule' }
router.post('/suggest-action', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.email_id) return res.status(400).json({ error: 'email_id requis' });
    const db = getDb();
    let email;
    try {
      email = db.prepare("SELECT id, subject, from_name, from_email, preview, received_at, inferred_project FROM emails WHERE id = ?").get(body.email_id);
    } catch (e) { return res.status(500).json({ error: e.message }); }
    if (!email) return res.status(404).json({ error: 'email introuvable' });

    const subject = (email.subject || '').toLowerCase();
    const preview = (email.preview || '').slice(0, 600);
    let verdict = 'faire';
    let suggested_delegate = null;
    let suggested_schedule = null;
    let reason = '';
    let confidence = 0.6;
    let source = 'rule';

    // Heuristique fallback (si pas de LLM)
    if (/d[ée]l[ée]guer|charge|lamiae|karim|na[iî]ma|envoyer\s+a/i.test(subject + preview)) {
      verdict = 'deleguer';
      suggested_delegate = 'Lamiae';
      reason = "Tache operationnelle qui peut etre traitee par un membre de l'equipe.";
    } else if (/^(re|fwd|tr)\s*:|reportee?|reporter|decaler|repousser|recaler/i.test(subject)) {
      verdict = 'decaler';
      reason = "Pas urgent. Pourra etre traite plus tard cette semaine.";
    } else if (/newsletter|spam|courriel|marketing|promo/i.test(subject + email.from_email)) {
      verdict = 'decliner';
      reason = "Communication non strategique. A archiver.";
    } else if (/[?]\s*$/.test(subject) || /(decider|trancher|valider|aval|approbation)/i.test(subject)) {
      verdict = 'faire';
      reason = "Demande explicite : trancher cette semaine.";
      confidence = 0.75;
    }

    // LLM enrichi si dispo (Claude prompte avec contexte)
    if (process.env.ANTHROPIC_API_KEY && process.env.DEMO_MODE !== '1') {
      try {
        const client = createAnthropicClient();
        const sys = "Tu es l'assistant d'arbitrage du CEO. Pour chaque email, tu dois suggerer un verdict parmi : faire (P0/P1, action immediate), deleguer (un membre equipe pourrait s'en charger), decaler (pas urgent, reporter), archiver (reference, pas d'action), decliner (refus poli). Tu retournes UNIQUEMENT du JSON strict {verdict, title, suggested_delegate, suggested_schedule, confidence (0-1), reason (1 phrase courte)}.";
        const userMsg = `Email recu de ${email.from_name || email.from_email}, sujet: "${email.subject}".\nProjet infere: ${email.inferred_project || '(aucun)'}.\nExtrait: ${preview}\n\nQuel verdict suggeres-tu ?`;
        const resp = await client.messages.create({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens: 400,
          system: sys,
          messages: [{ role: 'user', content: userMsg }]
        });
        const txt = (resp.content && resp.content[0] && resp.content[0].text) || '';
        const m = txt.match(/\{[\s\S]*\}/);
        if (m) {
          const llmObj = JSON.parse(m[0]);
          if (['faire','deleguer','decaler','archiver','decliner'].includes(llmObj.verdict)) {
            verdict = llmObj.verdict;
            suggested_delegate = llmObj.suggested_delegate || suggested_delegate;
            suggested_schedule = llmObj.suggested_schedule || suggested_schedule;
            reason = llmObj.reason || reason;
            confidence = typeof llmObj.confidence === 'number' ? llmObj.confidence : 0.85;
            source = 'llm';
          }
        }
      } catch (e) {
        // LLM echec : on garde l'heuristique fallback
      }
    }

    res.json({
      email_id: email.id,
      verdict,
      title: email.subject,
      suggested_delegate,
      suggested_schedule,
      confidence,
      reason,
      source,
      inferred_project: email.inferred_project || null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// S6.8.3 — POST /analyze-emails-grouped : meme logique que /analyze-emails
//   mais regroupe les propositions par inferred_project (macro-scenarios).
//   Retour : { blocks: [{ project: '...', count, proposals: [...] }], orphans: [...] }
router.post('/analyze-emails-grouped', async (req, res) => {
  try {
    // Reuse /analyze-emails internally via fetch local : trop complique en sandbox
    // Plus simple : appel direct au meme code SQL inline.
    const db = getDb();
    let candidates = [];
    try {
      candidates = db.prepare(`
        SELECT
          id, subject, from_name, from_email, preview, received_at,
          inferred_project, is_self,
          (CASE WHEN unread = 1 THEN 30 ELSE 0 END
            + CASE WHEN flagged = 1 THEN 50 ELSE 0 END
            + CASE WHEN inferred_project IS NOT NULL AND inferred_project != '' THEN 10 ELSE 0 END
            + (CASE WHEN received_at >= datetime('now', '-3 day') THEN 20 ELSE 0 END)
            + (CASE WHEN received_at >= datetime('now', '-7 day') THEN 10 ELSE 0 END)
            + CASE WHEN subject LIKE '%RFP%' OR subject LIKE '%urgent%' OR subject LIKE '%?' OR subject LIKE '%decider%' THEN 25 ELSE 0 END) AS score,
          unread, flagged
        FROM emails
        WHERE arbitrated_at IS NULL AND is_self = 0
        ORDER BY score DESC, received_at DESC
        LIMIT 30
      `).all();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    const kindFor = (subject) => {
      const sub = (subject || "");
      if (/[?]\s*$/.test(sub)) return "decision";
      if (/^(re|fwd|tr)\s*:/i.test(sub)) return "task";
      if (/(projet|launch|kickoff|lancement)/i.test(sub)) return "project";
      return "task";
    };

    const proposalsAll = candidates.map((r, i) => ({
      id: "arb-grp-" + (i + 1),
      source_id: r.id,
      kind: kindFor(r.subject),
      title: r.subject || "(sans objet)",
      from: r.from_name || r.from_email || "",
      from_email: r.from_email || "",
      excerpt: (r.preview || "").slice(0, 220).trim(),
      proposed_priority: r.score >= 100 ? "P0" : r.score >= 50 ? "P1" : "P2",
      inferred_project: r.inferred_project || null,
      received_at: r.received_at,
      score: r.score
    }));

    // Groupage par inferred_project
    const byProject = {};
    const orphans = [];
    proposalsAll.forEach((p) => {
      if (p.inferred_project) {
        if (!byProject[p.inferred_project]) byProject[p.inferred_project] = [];
        byProject[p.inferred_project].push(p);
      } else {
        orphans.push(p);
      }
    });

    const blocks = Object.keys(byProject).map((projSlug) => {
      const props = byProject[projSlug];
      const counts = { task: 0, decision: 0, project: 0 };
      props.forEach((p) => { counts[p.kind] = (counts[p.kind] || 0) + 1; });
      return {
        project: projSlug,
        count: props.length,
        kinds: counts,
        proposals: props,
        // Score moyen pour priorite tri
        avg_score: Math.round(props.reduce((s, p) => s + p.score, 0) / props.length)
      };
    }).sort((a, b) => b.avg_score - a.avg_score);

    res.json({
      blocks,
      orphans,
      total: proposalsAll.length,
      total_blocks: blocks.length,
      total_orphans: orphans.length,
      ready: true,
      message: blocks.length + ' macro-scenario(s) detecte(s) + ' + orphans.length + ' orphelin(s).'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
