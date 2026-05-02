/**
 * src/routes/system.js — endpoints meta systeme (S3.06).
 *
 *   GET /api/system/last-sync     fraicheur derniere sync Outlook
 *   GET /api/system/health        ping detaille (db ok, disk space, etc.)
 *
 * Source de la fraicheur : mtime de data/emails-summary.json (cible du
 * fetch-outlook.ps1 + autosync schtasks 2 h).
 *
 * Alerte cockpit : si lastSyncAgeMin > THRESHOLD_WARN_MIN (240 = 4 h)
 * -> alert level=warn dans /api/cockpit/today (cf. cockpit.js patch S3.06).
 */
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const router = express.Router();

const SUMMARY_PATH = path.resolve(__dirname, '..', '..', 'data', 'emails-summary.json');
const THRESHOLD_WARN_MIN = 240;     // 4 h
const THRESHOLD_CRITICAL_MIN = 1440; // 24 h

function getLastSyncStatus(opts = {}) {
  const summaryPath = opts.summaryPath || SUMMARY_PATH;
  if (!fs.existsSync(summaryPath)) {
    return {
      ok: false,
      source: 'emails-summary.json',
      reason: 'fichier absent',
      lastSyncAt: null,
      lastSyncAgeMin: null,
      level: 'critical',
    };
  }
  const stat = fs.statSync(summaryPath);
  const mtime = stat.mtime;
  const ageMs = Date.now() - mtime.getTime();
  const ageMin = Math.round(ageMs / 60000);

  let level = 'ok';
  if (ageMin > THRESHOLD_CRITICAL_MIN) level = 'critical';
  else if (ageMin > THRESHOLD_WARN_MIN) level = 'warn';

  return {
    ok: level === 'ok',
    source: 'emails-summary.json',
    summaryPath,
    lastSyncAt: mtime.toISOString(),
    lastSyncAgeMin: ageMin,
    level,
    threshold: {
      warn_min: THRESHOLD_WARN_MIN,
      critical_min: THRESHOLD_CRITICAL_MIN,
    },
  };
}

router.get('/last-sync', (req, res) => {
  try {
    res.json(getLastSyncStatus());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/health', (req, res) => {
  try {
    res.json({
      ok: true,
      ts: new Date().toISOString(),
      pid: process.pid,
      uptime_s: Math.round(process.uptime()),
      memory_mb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      node_version: process.version,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /regenerate-pilotage --------------------------------
// Lance node scripts/generate-pilotage.js pour régénérer 04_docs/00-pilotage-projet.html
// Sprint S6.11-bis-LIGHT (28/04/2026 soir) — bouton Régénérer manuel.
router.post('/regenerate-pilotage', (req, res) => {
  const { spawn } = require('node:child_process');
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const scriptPath = path.join(repoRoot, 'scripts', 'generate-pilotage.js');

  if (!fs.existsSync(scriptPath)) {
    return res.status(500).json({
      error: 'script_not_found',
      message: `generate-pilotage.js introuvable à ${scriptPath}`
    });
  }

  const startedAt = Date.now();
  const child = spawn('node', [scriptPath], {
    cwd: repoRoot,
    env: { ...process.env, AICEO_REGEN_TRIGGER: 'pilotage-button' }
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

  // Timeout 30s
  const timeout = setTimeout(() => {
    child.kill('SIGTERM');
  }, 30000);

  child.on('close', (code) => {
    clearTimeout(timeout);
    const elapsed_ms = Date.now() - startedAt;
    if (code === 0) {
      res.json({
        ok: true,
        elapsed_ms,
        stdout: stdout.split('\n').slice(-10).join('\n'),
        regenerated_at: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        ok: false,
        error: 'regen_failed',
        exit_code: code,
        elapsed_ms,
        stderr: stderr.split('\n').slice(-20).join('\n'),
        stdout: stdout.split('\n').slice(-10).join('\n')
      });
    }
  });

  child.on('error', (e) => {
    clearTimeout(timeout);
    res.status(500).json({ error: e.message });
  });
});

router.post('/sync-outlook', (req, res) => {
  // Stub : la sync Outlook réelle se fait via scripts/sync-outlook.ps1 (Windows)
  // Pour l'instant on retourne une réponse explicite que l'UI peut consommer
  res.status(501).json({
    error: 'not_implemented',
    message: 'La synchronisation Outlook automatique arrive bientôt. En attendant, lancez manuellement scripts/sync-outlook.ps1 depuis PowerShell.',
    manual_command: 'pwsh -File scripts/sync-outlook.ps1'
  });
});

// --- GET /logs --------------------------------------------------
// Liste les fichiers de log disponibles + retourne le tail des derniers
// (max 200 lignes) avec metadata (name, size, mtime, description).
router.get("/logs", (req, res) => {
  try {
    const dataDir = path.resolve(__dirname, "..", "..", "data");
    const LOG_FILES = [
      { name: "aiCEO-server.log",     desc: "Logs du serveur Node.js (Express + SQLite)", source: "backend" },
      { name: "sync-outlook.log",     desc: "Sync Outlook (fetch + normalize) - une entree par run schtasks", source: "powershell" },
    ];
    const files = LOG_FILES.map(function (f) {
      const p = path.join(dataDir, f.name);
      let meta = { name: f.name, desc: f.desc, source: f.source, exists: false };
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        meta.exists = true;
        meta.size = stat.size;
        meta.mtime = stat.mtime.toISOString();
        meta.ageMin = Math.round((Date.now() - stat.mtimeMs) / 60000);
        // Lire les 200 dernieres lignes
        try {
          const content = fs.readFileSync(p, "utf-8");
          const lines = content.split(/\r?\n/).filter(Boolean);
          meta.lines = lines.slice(-200);
          meta.totalLines = lines.length;
        } catch (e) {
          meta.lines = [];
          meta.error = e.message;
        }
      }
      return meta;
    });
    res.json({ logs: files, generated_at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /releases ----------------------------------------------
// Retourne la liste des releases livrees + a venir (planifiees roadmap).
// Source : statique (sera enrichi par git tags + roadmap-map.html futur).
router.get("/releases", (req, res) => {
  const released = [
    {
      version: "v0.5",
      date: "2026-04-26",
      title: "v0.5 internalisée",
      summary: "5 sprints livrés. SQLite mono-instance. 12 pages frontend. Sync Outlook 2h. Assistant chat live SSE.",
      features: [
        "Cockpit + arbitrage matin + bilan soir",
        "Portefeuille (groupes/projets/contacts/decisions)",
        "Revues hebdo + Big Rocks max 3",
        "Assistant chat live SSE Anthropic",
        "Outlook autosync 2h via schtasks",
        "Variante D autostart Windows + raccourci Bureau",
      ],
      tag: "v0.5",
    },
    {
      version: "v0.5-s4",
      date: "2026-04-26",
      title: "Sprint S4 — Assistant + portefeuille",
      summary: "Assistant chat SSE + 5 pages back-office (groupes/projets/contacts/decisions/projet template).",
      features: [
        "Tables assistant_conversations + assistant_messages",
        "messages.stream Anthropic SDK",
        "5 pages back-office migrees API",
        "Polish service Windows (raccourci Bureau + rotation logs)",
      ],
      tag: "v0.5-s4",
    },
    {
      version: "v0.6-s6.1",
      date: "2026-04-26",
      title: "Sprint S6.1 — DS atomic livre archive",
      summary: "Design System BEM strict + ITCSS 7 couches + 27 composants (atoms/molecules/organisms). Archive reference V2/V3.",
      features: [
        "Tokens CSS 3 niveaux (primitive/semantic/component)",
        "11 atoms + 9 molecules + 7 organisms",
        "Components gallery /components-atomic.html",
        "SVG sprite Lucide 30 icones",
      ],
      tag: "v0.6-s6.1",
    },
    {
      version: "v0.6-s6.4",
      date: "2026-04-28",
      title: "Sprint S6.4 — Câblage v0.6 réel",
      summary: "Backend SQLite étendu + 13/17 pages frontend câblées API + sync emails Outlook + bootstrap projets/contacts.",
      features: [
        "Migration emails JSON -> SQLite (table emails 15 cols)",
        "Bootstrap auto 13 projets + 77 contacts depuis emails",
        "Route /analyze-emails reecrite SQL (scoring flagged*100 + unread*30 + recence)",
        "13 pages frontend cablees (cockpit, arbitrage, projets, equipe, decisions, taches, revues, evening, settings, onboarding, projet, hub, components)",
        "Pattern globals theme.js (onclick inline) + flag data-arb-ready (CSS strict)",
      ],
      tag: "v0.6-s6.4",
      current: true,
    },
  ];

  const upcoming = [
    {
      version: "v0.7",
      eta: "Mai 2026",
      title: "LLM Anthropic + sync events Outlook + status reportee",
      features: [
        "Brancher LLM 4 surfaces UX (coaching banner, decision-recommend, auto-draft-review, 'Si vous tranchez A')",
        "Script fetch-outlook-events.ps1 (calendrier Outlook olFolderCalendar)",
        "Ingestion table events + page agenda peuplee",
        "Migration : status decision 'reportee' (kanban col Reporte non volatile)",
        "FK emails -> projects + UI rattachement maison/projet",
        "Pages assistant.html / connaissance.html / coaching.html cablees",
        "Validation ANTHROPIC_API_KEY en prod + budget tokens",
      ],
      effort: "3-4 sessions binôme (~12h chrono)",
    },
    {
      version: "V1",
      eta: "Été 2026",
      title: "SaaS multi-tenant + équipes + mobile",
      features: [
        "Multi-tenant Supabase + RLS + auth Microsoft Entra (~80k)",
        "Equipes : invitations + permissions + delegations (~50k)",
        "Integrations etendues (Gmail, Calendar Google, Slack) (~60k)",
        "App mobile React Native (iOS + Android, ~70k)",
        "Backup auto SQLite (~20k)",
        "Logs structures winston (~20k)",
      ],
      effort: "6 mois binôme, 46k€ budget",
      blocked: ["GO ExCom 04/05", "GO post-recette v0.6"],
    },
    {
      version: "V2",
      eta: "2027",
      title: "Commercial international + i18n + SOC 2",
      features: [
        "Multi-langue complet (FR / EN / AR / ES)",
        "Compliance SOC 2 + ISO 27001",
        "Marketing + success/sales (80k+40k+50k+85k = 254k€ realloue v0.5)",
        "Pen-testing externe sortie V1 (~15k)",
      ],
      effort: "12 mois, ~800k€",
    },
    {
      version: "V3",
      eta: "2028",
      title: "Coach IA + offline + multi-CEO",
      features: [
        "Coaching IA proactif (sessions hebdo dimanche soir)",
        "Mode offline complet (sync différée)",
        "Multi-CEO : portefeuille pour fonds / portfolio managers",
        "API publique partenaires",
      ],
      effort: "18 mois, ~600k€",
    },
  ];

  res.json({ released, upcoming, generated_at: new Date().toISOString() });
});

// S6.33 — Apprentissage actif generique : table interaction_feedback
function ensureInteractionFeedbackTable() {
  try {
    const { getDb } = require('../db');
    const db = getDb();
    db.exec("CREATE TABLE IF NOT EXISTS interaction_feedback (id TEXT PRIMARY KEY, kind TEXT NOT NULL, item_id TEXT, action TEXT NOT NULL, metadata TEXT, ts TEXT NOT NULL DEFAULT (datetime('now')), tenant_id TEXT NOT NULL DEFAULT 'default')");
    db.exec("CREATE INDEX IF NOT EXISTS idx_iaf_kind ON interaction_feedback(kind, ts DESC)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_iaf_action ON interaction_feedback(action, ts DESC)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_iaf_tenant ON interaction_feedback(tenant_id, ts DESC)");
  } catch (e) { console.error('[ensureInteractionFeedbackTable]', e.message); }
}
ensureInteractionFeedbackTable();

router.post('/interaction-feedback', (req, res) => {
  try {
    const { getDb, uuid7 } = require('../db');
    const db = getDb();
    const { kind, item_id, action, metadata } = req.body || {};
    if (!kind || !action) return res.status(400).json({ error: 'kind + action requis' });
    const id = uuid7();
    db.prepare("INSERT INTO interaction_feedback (id, kind, item_id, action, metadata) VALUES (?, ?, ?, ?, ?)").run(id, String(kind).slice(0, 50), item_id ? String(item_id).slice(0, 100) : null, String(action).slice(0, 100), metadata ? JSON.stringify(metadata).slice(0, 1000) : null);
    res.json({ ok: true, id: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/interaction-feedback/stats', (req, res) => {
  try {
    const { getDb } = require('../db');
    const db = getDb();
    const total = db.prepare("SELECT COUNT(*) AS c FROM interaction_feedback").get().c;
    const byKind = db.prepare("SELECT kind, COUNT(*) AS c FROM interaction_feedback GROUP BY kind ORDER BY c DESC").all();
    const byAction = db.prepare("SELECT action, COUNT(*) AS c FROM interaction_feedback GROUP BY action ORDER BY c DESC LIMIT 10").all();
    const recent7d = db.prepare("SELECT COUNT(*) AS c FROM interaction_feedback WHERE ts >= datetime('now','-7 days')").get().c;
    res.json({ total: total, recent_7d: recent7d, by_kind: byKind, by_action: byAction });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === S6.42 — Restart server + status server ===
// GET /api/system/server-status -> uptime, memoire, port, version, db_size
router.get('/server-status', (req, res) => {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const dbPath = process.env.AICEO_DB_OVERRIDE || path.resolve(__dirname, '..', '..', 'data', 'aiceo.db');
    const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    res.json({
      pid: process.pid,
      uptime_s: Math.round(process.uptime()),
      uptime_human: humanDuration(process.uptime()),
      memory: {
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heap_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      node_version: process.version,
      port: Number(process.env.PORT) || 3001,
      db_path: path.basename(dbPath),
      db_size_kb: Math.round(dbSize / 1024),
      llm_ready: !!process.env.ANTHROPIC_API_KEY,
      env: process.env.NODE_ENV || 'production',
      started_at: new Date(Date.now() - process.uptime() * 1000).toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function humanDuration(seconds) {
  if (seconds < 60) return Math.round(seconds) + 's';
  if (seconds < 3600) return Math.round(seconds / 60) + 'min';
  if (seconds < 86400) return Math.round(seconds / 3600 * 10) / 10 + 'h';
  return Math.round(seconds / 86400 * 10) / 10 + 'j';
}

// POST /api/system/restart -> exit graceful (le wrapper Variante D le relance auto au logon)
// Header obligatoire X-Confirm-Restart: yes-i-am-sure
// Sans wrapper actif, le serveur ne se relancera PAS automatiquement.
router.post('/restart', (req, res) => {
  if (req.get('X-Confirm-Restart') !== 'yes-i-am-sure') {
    return res.status(400).json({ error: 'Header X-Confirm-Restart: yes-i-am-sure obligatoire' });
  }
  res.json({
    ok: true,
    message: 'Serveur va s arreter dans 1s. Si Variante D (raccourci logon) actif : redemarrage auto. Sinon : relancer manuellement npm start.',
    pid: process.pid
  });
  // Laisser le temps au res de partir avant exit
  setTimeout(() => {
    console.log('[system] redemarrage demande via API. Exit en cours.');
    process.exit(0);
  }, 1000);
});

// === S6.41 — Sync Log + Sync Status ===
// GET /api/system/sync-log?connector=outlook-desktop&limit=20
//   -> historique chronologique des syncs avec details (start, end, items, status)
router.get('/sync-log', (req, res) => {
  try {
    const { getDb } = require('../db');
    const db = getDb();
    const connector = req.query.connector || null;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    let rows = [];
    try {
      if (connector) {
        rows = db.prepare("SELECT * FROM sync_log WHERE connector_kind = ? ORDER BY started_at DESC LIMIT ?").all(connector, limit);
      } else {
        rows = db.prepare("SELECT * FROM sync_log ORDER BY started_at DESC LIMIT ?").all(limit);
      }
    } catch (e) { /* table absente */ }
    res.json({ logs: rows, count: rows.length, connector: connector });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/system/sync-status -> synthese globale (dernieres syncs par connecteur + counts)
router.get('/sync-status', (req, res) => {
  try {
    const { getDb } = require('../db');
    const db = getDb();
    let conns = [];
    try {
      conns = db.prepare("SELECT kind, label, icon, status, last_sync_at, last_error FROM connectors").all();
    } catch (e) { /* table absente */ }
    const byConnector = conns.map((c) => {
      let last = null;
      try {
        last = db.prepare("SELECT started_at, ended_at, status, items_count, items_new, duration_ms, error_message FROM sync_log WHERE connector_kind = ? ORDER BY started_at DESC LIMIT 1").get(c.kind);
      } catch (e) {}
      return Object.assign({}, c, { last_run: last });
    });
    let counts = {};
    try {
      counts = {
        emails: db.prepare("SELECT COUNT(*) AS n FROM emails").get().n,
        events: db.prepare("SELECT COUNT(*) AS n FROM events").get().n,
        contacts: db.prepare("SELECT COUNT(*) AS n FROM contacts").get().n
      };
    } catch (e) {}
    res.json({ connectors: byConnector, counts: counts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === S6.41 — Reset complet de l application (zone sensible) ===
// POST /api/system/wipe-data
//   Header obligatoire : X-Confirm-Wipe: yes-i-am-sure
//   Body : { keep_seeds: true|false }  (default true : preserve les 8 domaines + 1 societe seed)
//
// Vide TOUTES les tables metier (tasks, decisions, projects, contacts, emails, ...)
// puis reimporte les seeds initial schema (domains/companies) si keep_seeds=true.
//
// L appli est utilisable immediatement apres : redirection /onboarding au prochain load.
router.post('/wipe-data', (req, res) => {
  try {
    if (req.get('X-Confirm-Wipe') !== 'yes-i-am-sure') {
      return res.status(400).json({ error: 'Header X-Confirm-Wipe: yes-i-am-sure obligatoire' });
    }
    const keepSeeds = (req.body && req.body.keep_seeds !== false);
    const { getDb } = require('../db');
    const db = getDb();

    // Liste des tables metier a vider (ordre = inverse des FK)
    const TABLES_METIER = [
      'arbitrage_sessions', 'evening_sessions', 'big_rocks', 'weekly_reviews', 'weeks',
      'task_events', 'contacts_projects', 'delegations',
      'assistant_messages', 'assistant_conversations',
      'knowledge_pins', 'interaction_feedback', 'email_feedback',
      'tasks', 'decisions', 'events', 'emails',
      'projects', 'contacts', 'groups',
      'user_preferences', 'settings'
    ];
    const TABLES_AXES = ['domains', 'companies'];

    const wiped = [];
    const skipped = [];
    db.exec('PRAGMA foreign_keys = OFF');
    try {
      for (const t of TABLES_METIER) {
        try {
          const before = db.prepare('SELECT COUNT(*) AS c FROM ' + t).get().c;
          db.exec('DELETE FROM ' + t);
          wiped.push({ table: t, deleted: before });
        } catch (e) {
          skipped.push({ table: t, reason: e.message });
        }
      }
      // Axes : reset si keep_seeds=false, sinon preserve
      if (!keepSeeds) {
        for (const t of TABLES_AXES) {
          try {
            const before = db.prepare('SELECT COUNT(*) AS c FROM ' + t).get().c;
            db.exec('DELETE FROM ' + t);
            wiped.push({ table: t, deleted: before });
          } catch (e) {}
        }
        // Re-seed minimal (8 domaines + 1 societe par defaut)
        try {
          db.exec(require('node:fs').readFileSync(
            require('node:path').resolve(__dirname, '..', '..', 'data', 'migrations', '2026-05-01-domains-companies.sql'),
            'utf8'
          ));
        } catch (e) {
          skipped.push({ table: 'reseed', reason: e.message });
        }
      }
    } finally {
      db.exec('PRAGMA foreign_keys = ON');
    }

    // Bonus : supprimer les caches Outlook sur disque (si keep_seeds=false on va vraiment loin)
    const fs = require('node:fs');
    const path = require('node:path');
    const dataDir = path.resolve(__dirname, '..', '..', 'data');
    const cacheFiles = ['emails.json', 'emails-summary.json', 'events.json',
                        'arbitrage-history.json', 'evening-history.json'];
    const removedFiles = [];
    for (const f of cacheFiles) {
      const p = path.join(dataDir, f);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); removedFiles.push(f); } catch (e) {}
      }
    }

    res.json({
      ok: true,
      mode: keepSeeds ? 'wipe-keep-seeds' : 'wipe-full',
      wiped: wiped,
      skipped: skipped,
      cache_files_removed: removedFiles,
      next_step: 'Recharger /v07/pages/onboarding.html pour reconfigurer.'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
module.exports.getLastSyncStatus = getLastSyncStatus;
module.exports.THRESHOLD_WARN_MIN = THRESHOLD_WARN_MIN;
module.exports.THRESHOLD_CRITICAL_MIN = THRESHOLD_CRITICAL_MIN;
