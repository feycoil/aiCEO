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

// --- GET /triage-history (S6.22 Lot 23) ---
// Renvoie l'historique des triages emails effectues (jour par jour).
// Au lieu de /history qui renvoie les sessions arbitrage_sessions (ancien systeme tasks),
// celui-ci agrege les emails ayant arbitrated_at != NULL.
// Joint avec tasks et decisions pour montrer ce qui a ete CREE depuis le triage.
router.get('/triage-history', (req, res) => {
  try {
    const db = getDb();
    const days = Math.min(parseInt(req.query.days || '7', 10), 30);

    // Verifier table emails
    const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='emails'").get();
    if (!has) return res.json({ history: [], days });

    const rows = db.prepare(`
      SELECT date(arbitrated_at) AS day,
             COUNT(*) AS total
      FROM emails
      WHERE arbitrated_at IS NOT NULL
      GROUP BY date(arbitrated_at)
      ORDER BY day DESC
      LIMIT ?
    `).all(days);

    // Pour chaque jour, compter les tasks et decisions creees ce jour-la depuis emails
    const enriched = rows.map(r => {
      const dayStart = r.day + ' 00:00:00';
      const dayEnd   = r.day + ' 23:59:59';
      let tasksCreated = 0, decisionsCreated = 0;
      try {
        const t = db.prepare(`
          SELECT COUNT(*) AS n FROM tasks
          WHERE source_type = 'email'
            AND created_at BETWEEN ? AND ?
        `).get(dayStart, dayEnd);
        tasksCreated = t?.n || 0;

        // Decisions liees email : on cherche dans context [source-email:...]
        const d = db.prepare(`
          SELECT COUNT(*) AS n FROM decisions
          WHERE context LIKE '%[source-email:%'
            AND created_at BETWEEN ? AND ?
        `).get(dayStart, dayEnd);
        decisionsCreated = d?.n || 0;
      } catch (e) { /* swallow */ }

      return {
        day: r.day,
        total_arbitrated: r.total,
        tasks_created: tasksCreated,
        decisions_created: decisionsCreated,
        skipped: Math.max(0, r.total - tasksCreated - decisionsCreated)
      };
    });

    res.json({ history: enriched, days });
  } catch (e) {
    console.error('[/api/arbitrage/triage-history] error:', e);
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


// S6.22 Lot 28 : detection destinataire direct vs CC vs autre
function loadMyEmails(db) {
  try {
    const row = db.prepare("SELECT value FROM user_preferences WHERE key = 'user.email_addresses'").get();
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed)) return parsed.map(e => String(e).toLowerCase());
    }
  } catch (e) { /* swallow */ }
  return [];
}

function detectRecipientFlag(toAddrs, myEmails) {
  if (!myEmails || !myEmails.length) return 'unknown';
  if (!toAddrs) return 'unknown';
  const lower = String(toAddrs).toLowerCase();
  for (const e of myEmails) {
    if (lower.includes(e)) return 'direct';
  }
  // Pas dans TO direct (CC potentiel ou liste de distribution)
  return 'cc';
}

// --- POST /analyze-emails ----------------------------
// Source : table SQLite `emails` (alimentee par scripts/normalize-emails.js
// apres sync Outlook, ou par scripts/ingest-emails.js en rattrapage).
// Ne lit plus le JSON : la DB est la source de verite.

router.post("/analyze-emails", async (req, res) => {
  try {
    const db = getDb();
    const _myEmails_heur = loadMyEmails(db);

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
      const s = (subject || "").toLowerCase();
      // S6.22 Lot 18 : heuristique elargie pour produire min 3 decisions
      if (/[?]\s*$/.test(s)) return "decision";
      if (/(valider|trancher|decider|choix|approuver|gate|go\/no.go|arbitrer|confirmer|signer)/i.test(s)) return "decision";
      if (/(urgent|asap|prioritaire|critique)/i.test(s) && Math.random() < 0.4) return "decision";  // un peu de variete
      if (/(projet|launch|kickoff|lancement|sprint)/i.test(s)) return "project";
      if (/^(re|fwd|tr)\s*:/i.test(s)) return "task";
      return "task";
    };

    // S6.22 Lot 22 : retrait du forcage 3 decisions (biais reconnu CEO)
    // Remplace par : scoring "decisionnabilite" sur TOUT le pool (pas juste top 8)
    // + indicateur confiance pour chaque kind
    function decisionabilityScore(row) {
      const text = ((row.subject || '') + ' ' + (row.preview || '')).toLowerCase();
      let s = 0;
      if (text.match(/[?]/)) s += 30;
      if (text.match(/(valider|trancher|decider|choix|approuver|gate|go\/no\.go|arbitrer|confirmer|signer|decision)/)) s += 40;
      if (text.match(/(urgent|asap|prioritaire|critique|deadline|delai)/)) s += 15;
      if (text.match(/(propose|propos[ée])/)) s += 10;
      if (row.flagged) s += 10;
      return s;
    }
    function kindConfidence(row, kind) {
      const text = ((row.subject || '') + ' ' + (row.preview || '')).toLowerCase();
      if (kind === 'decision') {
        const score = decisionabilityScore(row);
        if (score >= 50) return 'high';
        if (score >= 25) return 'medium';
        return 'low';
      }
      if (kind === 'project') {
        if (text.match(/(launch|kickoff|projet|sprint)/)) return 'high';
        return 'medium';
      }
      return 'medium'; // task par defaut
    }

    // 1. Scanner TOUS les emails non-arbitres pour trouver les plus decisionnels
    const allCandidates = db.prepare(`
      SELECT id, subject, from_name, from_email, received_at,
             unread, flagged, has_attach, preview, inferred_project, is_self,
             (flagged * 100 + unread * 30 + has_attach * 5) AS score
      FROM emails
      WHERE is_self = 0 AND arbitrated_at IS NULL
      ORDER BY received_at DESC
      LIMIT 100
    `).all();
    // Top 3 decisionnels (peuvent etre hors du top 8 score)
    const ranked = allCandidates
      .map(r => ({ ...r, decScore: decisionabilityScore(r) }))
      .filter(r => r.decScore >= 25)
      .sort((a, b) => b.decScore - a.decScore)
      .slice(0, 3);

    // 2. Top 5 par score classique (priorite/recence) hors decisions deja selectionnees
    const usedIds = new Set(ranked.map(r => r.id));
    const others = candidates.filter(r => !usedIds.has(r.id)).slice(0, 5);
    const allItems = [...ranked, ...others];

    const proposals = allItems.map((r, i) => {
      const kind = ranked.includes(r) ? 'decision' : kindFor(r.subject);
      return {
      id: "arb-" + (i + 1),
      source_id: r.id,
      kind: kind,
      title: r.subject || "(sans objet)",
      from: r.from_name || r.from_email || "",
      from_email: r.from_email || "",
      to_addrs: r.to_addrs || "",
      recipient_flag: detectRecipientFlag(r.to_addrs, _myEmails_heur),
      excerpt: (r.preview || "").slice(0, 220).trim(),
      proposed_priority: r.score >= 100 ? "P0" : r.score >= 50 ? "P1" : "P2",
      inferred_project: r.inferred_project || null,
      received_at: r.received_at,
      flagged: !!r.flagged,
      unread: !!r.unread,
      score: r.score,
      kind_confidence: kindConfidence(r, kind),
      created_from: "email"
    };
    });

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

// --- POST /analyze-emails-llm ----------------------------
// S6.22 Lot 17 : Triage Claude-aware reel (analyse LLM batch)
// Pour chaque email candidat, demande a Claude :
//   skip, kind, summary, suggested_action, priority, rationale
// Renvoie proposals (actionnables) + skipped (noise filtre par Claude).
router.post("/analyze-emails-llm", async (req, res) => {
  try {
    const db = getDb();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // S6.22 Lot 20 : recupere les adresses email perso pour scorer relevance
    let myEmails = [];
    try {
      const eaRow = db.prepare("SELECT value FROM user_preferences WHERE key = 'user.email_addresses'").get();
      if (eaRow && eaRow.value) {
        const parsed = JSON.parse(eaRow.value);
        if (Array.isArray(parsed)) myEmails = parsed.map(e => String(e).toLowerCase());
      }
    } catch (e) { /* swallow */ }

    if (!apiKey) {
      return res.status(503).json({
        error: "LLM non disponible",
        fallback_route: "/api/arbitrage/analyze-emails",
        message: "ANTHROPIC_API_KEY absente. Activez la cle dans Settings > Coaching IA."
      });
    }

    // 1. Verifier table emails
    const hasTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='emails'").get();
    if (!hasTable) return res.json({ proposals: [], skipped: [], total: 0, message: "Table emails absente." });

    // 2. Recupere 30 candidats SQL non-arbitres puis diversifie a 12 (S6.22 Lot 21 G + Lot 26)
    const rawRows = db.prepare(`
      SELECT id, account, subject, from_name, from_email, to_addrs, received_at,
             unread, flagged, has_attach, preview, inferred_project,
             (flagged * 100 + unread * 30 + has_attach * 5
              + CASE WHEN julianday('now') - julianday(received_at) < 1 THEN 20
                     WHEN julianday('now') - julianday(received_at) < 3 THEN 10 ELSE 0 END
              + CASE WHEN inferred_project IS NOT NULL AND inferred_project != '' THEN 8 ELSE 0 END
             ) AS score
      FROM emails
      WHERE is_self = 0 AND arbitrated_at IS NULL
      ORDER BY score DESC, received_at DESC
      LIMIT 30
    `).all();

    // S6.22 Lot 26 : detection redondance/relance (emails similaires non arbitres)
    // Pour chaque candidat, compte combien d emails non arbitres ont un sujet similaire
    // (3 premiers mots du subject ou meme inferred_project depuis meme expediteur)
    function getSubjectKey(s) {
      return (s || '').toLowerCase()
        .replace(/^(re|fwd|tr|fw)\s*:\s*/i, '')  // retire prefixes
        .split(/\s+/).slice(0, 3).join(' ')
        .replace(/[^a-z0-9 ]/g, '');
    }
    const allEmailsForRedundancy = db.prepare(`
      SELECT id, subject, from_email, inferred_project
      FROM emails
      WHERE is_self = 0 AND arbitrated_at IS NULL
    `).all();
    const subjectKeyToIds = new Map();
    allEmailsForRedundancy.forEach(e => {
      const key = getSubjectKey(e.subject);
      if (!key) return;
      if (!subjectKeyToIds.has(key)) subjectKeyToIds.set(key, []);
      subjectKeyToIds.get(key).push(e.id);
    });
    // Enrichir rawRows avec related_count + boost score
    rawRows.forEach(r => {
      const key = getSubjectKey(r.subject);
      const related = subjectKeyToIds.get(key) || [];
      r.related_count = related.length;
      r.related_ids = related.filter(id => id !== r.id);
      // Boost si redondance (signal de relance/insistance)
      if (related.length >= 3) r.score += 25;
      else if (related.length >= 2) r.score += 12;
    });

    // Diversification : max 2 par expediteur, equilibrage projet
    const rows = [];
    const senderCount = new Map();
    const projectCount = new Map();
    const TARGET = 12;
    const MAX_PER_SENDER = 2;
    const MAX_PER_PROJECT = 4;

    // Pass 1 : haute priorite (flagged ou score >= 50), respecte les caps
    for (const r of rawRows) {
      if (rows.length >= TARGET) break;
      const sk = (r.from_email || 'unknown').toLowerCase();
      const pk = r.inferred_project || '__none__';
      if ((senderCount.get(sk) || 0) >= MAX_PER_SENDER) continue;
      if ((projectCount.get(pk) || 0) >= MAX_PER_PROJECT) continue;
      rows.push(r);
      senderCount.set(sk, (senderCount.get(sk) || 0) + 1);
      projectCount.set(pk, (projectCount.get(pk) || 0) + 1);
    }
    // Pass 2 : remplir si pas assez (assouplit caps)
    if (rows.length < TARGET) {
      for (const r of rawRows) {
        if (rows.length >= TARGET) break;
        if (rows.includes(r)) continue;
        rows.push(r);
      }
    }

    if (rows.length === 0) {
      return res.json({ proposals: [], skipped: [], total: 0, ready: false, message: "Rien a arbitrer ce matin." });
    }

    // 3. Construire payload batch pour Claude
    const emailsForLlm = rows.map(r => ({
      id: r.id.slice(-12),  // raccourci pour le LLM (full id reconnect cote serveur)
      from: ((r.from_name || '') + ' <' + (r.from_email || '') + '>').trim(),
      subject: (r.subject || '(sans objet)').slice(0, 200),
      preview: (r.preview || '').slice(0, 300),
      received: r.received_at ? r.received_at.slice(0, 10) : '',
      flags: [r.unread ? 'unread' : '', r.flagged ? 'flagged' : '', r.has_attach ? 'has_attach' : ''].filter(Boolean),
      project_hint: r.inferred_project || null
    }));

    const myEmailsBlock = myEmails.length
      ? `\n\nLES ADRESSES EMAIL DU CEO (utilisez-les pour scorer relevance) :\n${myEmails.map(e => '- ' + e).join('\n')}\n\nRelevance values :\n- "direct" : CEO est dans TO (destinataire direct, prioritaire)\n- "cc" : CEO est en CC (informatif, moins prioritaire)\n- "mentioned" : CEO mentionne dans le contenu (cite mais pas destinataire)\n- "not_concerned" : ne concerne pas le CEO (newsletter, FYI generique, distribution liste).`
      : '\n\nAUCUNE ADRESSE EMAIL CONFIGUREE pour scorer relevance. Set relevance="unknown".';

    // S6.22 Lot 25 : charger patterns appris (feedback CEO) pour ameliorer la pertinence
    let patternsBlock = '';
    try {
      const fbRows = db.prepare(`
        SELECT ef.verdict, ef.rationale, ef.metadata,
               e.from_email, e.subject, e.inferred_project
        FROM email_feedback ef
        LEFT JOIN emails e ON e.id = ef.email_id
        WHERE ef.learned_at >= datetime('now', '-30 days')
        ORDER BY ef.learned_at DESC LIMIT 30
      `).all();
      if (fbRows.length) {
        const patterns = fbRows.slice(0, 15).map(f => {
          const parts = [];
          if (f.verdict) parts.push('verdict=' + f.verdict);
          if (f.from_email) parts.push('from=' + f.from_email);
          if (f.subject) parts.push('subject="' + (f.subject || '').slice(0, 60) + '"');
          if (f.inferred_project) parts.push('projet=' + f.inferred_project);
          if (f.rationale) parts.push('reason="' + f.rationale.slice(0, 80) + '"');
          return '- ' + parts.join(' | ');
        }).join('\n');
        patternsBlock = '\n\nPATTERNS APPRIS DU CEO (30 derniers jours, RESPECTEZ-LES en priorite) :\n' + patterns + '\n\nSi un nouvel email matche un pattern (meme expediteur, sujet similaire, projet), applique le meme verdict.';
      }
    } catch (e) { /* swallow si table absente */ }


    const SYSTEM = `Tu es un assistant de triage executive pour un CEO de PME francaise. Pour chaque email fourni, decide :

1. skip (boolean) : true si c'est du noise (newsletter, notif auto, FYI sans demande, ou relevance=not_concerned). false si actionnable pour le CEO.

2. kind (string) parmi :
   - "task" : action ponctuelle a faire
   - "decision" : choix strategique a trancher
   - "project" : sujet structurant qui merite un projet
   - "info" : information contextuelle a lier a un projet existant (pas d'action requise mais utile pour le contexte)
   - "delegate" : peut etre delegue a quelqu'un d'autre
   - "read" : a lire mais pas d'action immediate

3. summary (string ≤120 chars) : 1 phrase resumant le contenu et ce que l'expediteur attend.

4. suggested_action (string ≤150 chars) : si actionnable, propose une action CONCRETE au CEO. Format imperatif. Ex: "Repondre OUI sur le contrat ITSM avant vendredi". Si skip=true, mettre "".

5. priority parmi P0 (urgent+important), P1 (important), P2 (normal), P3 (low).

6. rationale (string ≤80 chars) : pourquoi ce kind/priority.

7. relevance (string) : "direct" | "cc" | "mentioned" | "not_concerned" | "unknown" — si CEO est concerne directement.${myEmailsBlock}${patternsBlock}

Reponds UNIQUEMENT avec un JSON array, un objet par email :
{"id": "...", "skip": bool, "kind": "...", "summary": "...", "suggested_action": "...", "priority": "...", "rationale": "...", "relevance": "..."}

Pas de markdown, pas de prose, juste le JSON array brut.`;

    const USER = `Voici ${emailsForLlm.length} emails a trier (format JSON) :\n\n` + JSON.stringify(emailsForLlm, null, 2) + `\n\nReponds avec le JSON array directement.`;

    // 4. Appel Claude
    const client = createAnthropicClient();
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

    const response = await client.messages.create({
      model,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: USER }]
    });

    // 5. Extraire le texte de la reponse
    let textRaw = '';
    for (const block of (response.content || [])) {
      if (block.type === 'text') textRaw += block.text;
    }

    // 6. Strip markdown fences si Claude en a mis malgre l'instruction
    let jsonText = textRaw.trim();
    const fenceMatch = jsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
    if (fenceMatch) jsonText = fenceMatch[1];

    let llmResults;
    try {
      llmResults = JSON.parse(jsonText);
      if (!Array.isArray(llmResults)) throw new Error("response not an array");
    } catch (e) {
      console.error('[analyze-emails-llm] JSON parse failed:', e.message, '\nRaw:', textRaw.slice(0, 300));
      return res.status(500).json({
        error: 'Claude reponse non parsable',
        raw_excerpt: textRaw.slice(0, 500)
      });
    }

    // 7. Jointure SQL <- LLM par id court
    const bySlug = {};
    rows.forEach(r => { bySlug[r.id.slice(-12)] = r; });

    const proposals = [];
    const skipped = [];
    for (const r of llmResults) {
      const sqlRow = bySlug[r.id];
      if (!sqlRow) continue;
      const enriched = {
        id: 'arb-' + r.id,
        source_id: sqlRow.id,
        kind: r.kind || 'task',
        title: sqlRow.subject || '(sans objet)',
        from: sqlRow.from_name || sqlRow.from_email || '',
        from_email: sqlRow.from_email || '',
        to_addrs: sqlRow.to_addrs || '',
        recipient_flag: detectRecipientFlag(sqlRow.to_addrs, myEmails),
        excerpt: (sqlRow.preview || '').slice(0, 220),
        received_at: sqlRow.received_at,
        flagged: !!sqlRow.flagged,
        unread: !!sqlRow.unread,
        inferred_project: sqlRow.inferred_project,
        related_count: sqlRow.related_count || 1,
        related_ids: sqlRow.related_ids || [],
        proposed_priority: r.priority || 'P2',
        // Champs LLM enrichis
        summary: r.summary || '',
        suggested_action: r.suggested_action || '',
        rationale: r.rationale || '',
        relevance: r.relevance || 'unknown',
        skip: !!r.skip,
        created_from: 'email-llm'
      };
      // S6.22 Lot 20 : si relevance="not_concerned" -> auto-skip meme si Claude a dit skip=false
      if (r.skip || r.relevance === 'not_concerned') skipped.push(enriched);
      else proposals.push(enriched);
    }

    res.json({
      proposals,
      skipped,
      total: rows.length,
      kept: proposals.length,
      filtered: skipped.length,
      ready: true,
      llm_used: true,
      model,
      message: `Claude a analyse ${rows.length} emails : ${proposals.length} actionnables, ${skipped.length} filtres en noise.`
    });
  } catch (e) {
    console.error('[/api/arbitrage/analyze-emails-llm] error:', e);
    res.status(500).json({ error: e.message });
  }
});

// --- S6.22 Lot 25 : Apprentissage actif (email_feedback) ---
// Cree la table email_feedback si absente (idempotent au boot du serveur)
function ensureEmailFeedbackTable() {
  try {
    const db = getDb();
    // A6 Multi-tenant : tenant_id ajoute des creation pour les nouvelles instances.
    db.exec(`
      CREATE TABLE IF NOT EXISTS email_feedback (
        id           TEXT PRIMARY KEY,
        email_id     TEXT NOT NULL,
        verdict      TEXT NOT NULL,
        metadata     TEXT,
        rationale    TEXT,
        learned_at   TEXT NOT NULL DEFAULT (datetime('now')),
        tenant_id    TEXT NOT NULL DEFAULT 'default'
      );
      CREATE INDEX IF NOT EXISTS idx_email_feedback_email   ON email_feedback(email_id);
      CREATE INDEX IF NOT EXISTS idx_email_feedback_verdict ON email_feedback(verdict);
      CREATE INDEX IF NOT EXISTS idx_email_feedback_learned ON email_feedback(learned_at DESC);
      CREATE INDEX IF NOT EXISTS idx_email_feedback_tenant  ON email_feedback(tenant_id, learned_at DESC);
    `);
    // Idempotent : si la table existait deja sans tenant_id, ALTER l'ajoute.
    try { db.exec("ALTER TABLE email_feedback ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default'"); } catch (e) { /* deja present */ }
  } catch (e) { console.error('[ensureEmailFeedbackTable]', e.message); }
}
ensureEmailFeedbackTable();

// POST /email-feedback : enregistre un feedback CEO sur un email
// Body : { email_id, verdict ('not_concerned' | 'info' | 'wrong_kind' | 'wrong_priority' | 'good'), metadata?, rationale? }
router.post('/email-feedback', (req, res) => {
  try {
    const db = getDb();
    const crypto = require('crypto');
    const { email_id, verdict, metadata, rationale } = req.body || {};
    if (!email_id || !verdict) {
      return res.status(400).json({ error: 'email_id et verdict obligatoires' });
    }
    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO email_feedback (id, email_id, verdict, metadata, rationale, learned_at) " +
      "VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).run(id, email_id, verdict, metadata ? JSON.stringify(metadata) : null, rationale || null);
    res.status(201).json({ ok: true, id, message: 'Feedback enregistre - Claude apprendra de ce choix.' });
  } catch (e) {
    console.error('[POST /email-feedback]', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /email-feedback : retourne les N derniers feedbacks (pour le LLM en contexte)
router.get('/email-feedback', (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const rows = db.prepare(
      "SELECT id, email_id, verdict, metadata, rationale, learned_at " +
      "FROM email_feedback ORDER BY learned_at DESC LIMIT ?"
    ).all(limit);
    res.json({ feedback: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- S6.24 : routes apprentissage ---
// GET /learning-stats : agreger les feedbacks par verdict + par mois
router.get('/learning-stats', (req, res) => {
  try {
    const db = getDb();
    // Verifier table existence (CREATE TABLE au boot dans ensureEmailFeedbackTable)
    const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='email_feedback'").get();
    if (!has) return res.json({ total: 0, byVerdict: {}, monthly: [], recent: [] });

    const totalRow = db.prepare("SELECT COUNT(*) AS n FROM email_feedback").get();
    const byVerdict = {};
    db.prepare("SELECT verdict, COUNT(*) AS n FROM email_feedback GROUP BY verdict").all()
      .forEach(r => { byVerdict[r.verdict] = r.n; });

    const monthly = db.prepare(`
      SELECT strftime('%Y-%m', learned_at) AS month, COUNT(*) AS n
      FROM email_feedback
      WHERE learned_at >= datetime('now', '-6 months')
      GROUP BY month ORDER BY month DESC
    `).all();

    // Estimer "evites auto" : nb d'emails dans la queue actuelle qui matchent un pattern (best effort)
    let auto_filtered = 0;
    try {
      const fbRows = db.prepare(`
        SELECT DISTINCT e.from_email
        FROM email_feedback ef
        JOIN emails e ON e.id = ef.email_id
        WHERE ef.verdict = 'not_concerned' AND e.from_email IS NOT NULL
      `).all();
      const senders = new Set(fbRows.map(r => r.from_email).filter(Boolean));
      if (senders.size > 0) {
        const placeholders = Array.from(senders).map(() => '?').join(',');
        const r = db.prepare(`SELECT COUNT(*) AS n FROM emails WHERE from_email IN (${placeholders}) AND arbitrated_at IS NOT NULL`).get(...senders);
        auto_filtered = r?.n || 0;
      }
    } catch (e) { /* swallow */ }

    const recent = db.prepare(`
      SELECT ef.id, ef.verdict, ef.rationale, ef.learned_at,
             e.from_email, e.subject
      FROM email_feedback ef
      LEFT JOIN emails e ON e.id = ef.email_id
      ORDER BY ef.learned_at DESC LIMIT 30
    `).all();

    res.json({
      total: totalRow.n,
      byVerdict,
      monthly,
      auto_filtered_estimate: auto_filtered,
      recent
    });
  } catch (e) {
    console.error('[learning-stats]', e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE /email-feedback/:id : retirer un feedback (correction CEO)
router.delete('/email-feedback/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const r = db.prepare("DELETE FROM email_feedback WHERE id = ?").run(id);
    res.json({ ok: true, deleted: r.changes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /accept ----------------------------
// S6.22 Lot 5 : fix bug doublons + dispatch IA partiel.
// Verdict du CEO sur une proposition d'arbitrage :
//   verdict = faire | deleguer | decaler | archiver | decliner
//   kind    = task | decision | project (heuristique de /analyze-emails)
// Effets :
//   - cree dans la bonne table selon kind (tasks par defaut, decisions si kind=decision)
//   - UPDATE emails SET arbitrated_at=now() WHERE id=source_id (= dedupe)
//   - check existant par email_id pour eviter doublons memes en cas de retry frontend
router.post("/accept", (req, res) => {
  try {
    const db = getDb();
    const crypto = require("crypto");
    const { source_id, kind = "task", verdict = "faire", title, description, priority, delegate_to } = req.body || {};

    if (!title) return res.status(400).json({ ok: false, error: "title manquant" });

    // 1. Check email arbitre par avance (defense en profondeur)
    if (source_id) {
      const existing = db.prepare("SELECT arbitrated_at FROM emails WHERE id = ?").get(source_id);
      if (existing && existing.arbitrated_at) {
        return res.json({
          ok: true,
          deduped: true,
          message: "Email deja arbitre le " + existing.arbitrated_at + ". Aucune nouvelle action creee."
        });
      }
    }

    // 2. Skip creation si verdict = archiver / decliner (juste marquer arbitre)
    let createdId = null;
    let createdKind = null;

    if (verdict === "archiver" || verdict === "decliner") {
      // Pas de creation, juste marquer arbitre
    } else {
      // 3. Determiner table cible selon kind + verdict
      const useDecisions = (kind === "decision");
      const finalTitle = (verdict === "deleguer" ? "[Delegation a " + (delegate_to || "equipe") + "] " : "") +
                         (verdict === "decaler" ? "[Reporte] " : "") + title;
      const finalPriority = (verdict === "decaler") ? "P2" : (priority || "P1");

      // S6.25.1 : kind=project => auto-create projet (verdict=faire) ou skip
      if (kind === "project") {
        if (verdict === "faire") {
          const projId = crypto.randomUUID();
          const projName = (title || "Projet sans nom").slice(0, 80);
          const projTagline = (description || "").slice(0, 200) || null;
          db.prepare(
            "INSERT INTO projects (id, name, tagline, status, description, progress, created_at, updated_at) " +
            "VALUES (?, ?, ?, 'active', ?, 0, datetime('now'), datetime('now'))"
          ).run(projId, projName, projTagline, description || null);
          // Lier l email source au projet cree
          if (source_id) {
            try { db.prepare("UPDATE emails SET project_id = ? WHERE id = ?").run(projId, source_id); }
            catch (e) { /* swallow si colonne absente */ }
          }
          createdId = projId;
          createdKind = "project";
        } else {
          // verdict decaler / archiver / decliner sur kind=project => juste marquer arbitre
        }
      } else if (kind === "big-rock") {
        // S6.25.2 : promotion en Big Rock (semaine courante ISO)
        if (verdict === "faire") {
          const now = new Date();
          // Compute ISO week YYYY-Www
          const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
          const weekId = d.getUTCFullYear() + "-W" + String(weekNum).padStart(2, "0");
          // Ensure week exists (avec year/week_number/starts_on/ends_on requis par le schema)
          try {
            const monday = new Date(d);
            monday.setUTCDate(monday.getUTCDate() - 3);
            const sunday = new Date(monday);
            sunday.setUTCDate(sunday.getUTCDate() + 6);
            const fmt = (dt) => dt.getUTCFullYear() + "-" + String(dt.getUTCMonth() + 1).padStart(2, "0") + "-" + String(dt.getUTCDate()).padStart(2, "0");
            db.prepare("INSERT OR IGNORE INTO weeks (id, year, week_number, starts_on, ends_on) VALUES (?, ?, ?, ?, ?)").run(weekId, d.getUTCFullYear(), weekNum, fmt(monday), fmt(sunday));
          } catch (e) { /* swallow */ }
          // Check current count
          const countRow = db.prepare("SELECT COUNT(*) AS n FROM big_rocks WHERE week_id = ?").get(weekId);
          if (countRow && countRow.n >= 3) {
            return res.status(400).json({
              ok: false,
              error: "max-rocks",
              message: "Semaine " + weekId + " a deja 3 Big Rocks. Annulez en un dans /revues avant d en ajouter un nouveau."
            });
          }
          const rockId = crypto.randomUUID();
          db.prepare(
            "INSERT INTO big_rocks (id, week_id, title, description, status, ordre, created_at) " +
            "VALUES (?, ?, ?, ?, 'defini', ?, datetime('now'))"
          ).run(rockId, weekId, (title || "Big Rock").slice(0, 120), description || null, (countRow ? countRow.n : 0) + 1);
          createdId = rockId;
          createdKind = "big-rock";
        }
      } else if (kind === "info") {
        // Si project_id ou inferred_project, on lie l'email au projet
        let targetProjectId = req.body.project_id || null;
        if (!targetProjectId && source_id) {
          const inferredProj = db.prepare("SELECT inferred_project FROM emails WHERE id = ?").get(source_id);
          if (inferredProj && inferredProj.inferred_project) {
            const proj = db.prepare("SELECT id FROM projects WHERE LOWER(name) = LOWER(?) LIMIT 1").get(inferredProj.inferred_project);
            if (proj) targetProjectId = proj.id;
          }
        }
        if (source_id && targetProjectId) {
          try {
            db.prepare("UPDATE emails SET project_id = ? WHERE id = ?").run(targetProjectId, source_id);
          } catch (e) { /* swallow si colonne project_id absente */ }
        }
        createdId = source_id || null;
        createdKind = "info";
      } else if (useDecisions) {
        // Schema decisions : id, title, context, status('ouverte'|...), pas de source_email_id colonne.
        // On stocke la trace de l'email source dans context (preserve description)
        const id = crypto.randomUUID();
        const ctx = (description || "") + (source_id ? "\n\n[source-email:" + source_id + "]" : "");
        db.prepare(
          "INSERT INTO decisions (id, title, context, status, created_at, updated_at) " +
          "VALUES (?, ?, ?, 'ouverte', datetime('now'), datetime('now'))"
        ).run(id, finalTitle, ctx || null);
        createdId = id;
        createdKind = "decision";
      } else {
        // Schema tasks : pas de status, mais done(0/1) + type('do'|'plan'|'delegate'|'defer') + source_type/source_id.
        const taskType = verdict === "deleguer" ? "delegate" : verdict === "decaler" ? "defer" : "do";
        const id = crypto.randomUUID();
        db.prepare(
          "INSERT INTO tasks (id, title, description, priority, type, source_type, source_id, created_at, updated_at) " +
          "VALUES (?, ?, ?, ?, ?, 'email', ?, datetime('now'), datetime('now'))"
        ).run(id, finalTitle, description || null, finalPriority, taskType, source_id || null);
        createdId = id;
        createdKind = "task";
      }
    }

    // 4. Marquer email arbitre (= dedupe pour les futures relances /analyze-emails)
    if (source_id) {
      db.prepare("UPDATE emails SET arbitrated_at = datetime('now') WHERE id = ?").run(source_id);
    }

    res.json({
      ok: true,
      created: createdId ? { id: createdId, kind: createdKind } : null,
      arbitrated: !!source_id,
      message: createdKind ? (createdKind + " creee + email marque arbitre") : "email marque arbitre (verdict " + verdict + ")"
    });
  } catch (e) {
    console.error("[/api/arbitrage/accept] error:", e);
    res.status(500).json({ ok: false, error: e.message });
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

// --- GET /api/arbitrage/emails/:id (S6.22 Lot 22) ---
// Renvoie un email complet par id (utilise par "Voir le mail original" dans Focus Decision)
router.get('/emails/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const row = db.prepare(
      "SELECT id, account, folder, subject, from_name, from_email, to_addrs, " +
      "received_at, unread, flagged, has_attach, preview, inferred_project, arbitrated_at " +
      "FROM emails WHERE id = ?"
    ).get(id);
    if (!row) return res.status(404).json({ error: 'email introuvable' });
    res.json({ email: row });
  } catch (e) {
    res.status(500).json({ error: e.message });
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
