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

module.exports = router;
module.exports.getLastSyncStatus = getLastSyncStatus;
module.exports.THRESHOLD_WARN_MIN = THRESHOLD_WARN_MIN;
module.exports.THRESHOLD_CRITICAL_MIN = THRESHOLD_CRITICAL_MIN;
