/**
 * src/routes/connectors.js — S6.41 — Catalogue connecteurs sources de donnees.
 *
 *   GET    /api/connectors              liste catalogue + statuts
 *   GET    /api/connectors/:kind        detail + last_sync + 5 derniers logs
 *   PATCH  /api/connectors/:kind        update config_json / status / label
 *   POST   /api/connectors/:kind/sync   declenche une sync (ce qu'on sait faire = outlook)
 *
 * Extensible : Gmail, Google Agenda, Teams, Slack viendront en V1.x.
 */
const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { getDb, crud, uuid7 } = require('../db');

const connectors = crud('connectors');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const rows = connectors.list({}, { orderBy: "CASE status WHEN 'connected' THEN 0 WHEN 'available' THEN 1 WHEN 'error' THEN 2 ELSE 9 END, label ASC" });
    const db = getDb();
    const enriched = rows.map((c) => {
      let lastSync = null;
      try {
        lastSync = db.prepare("SELECT started_at, ended_at, status, items_count, items_new FROM sync_log WHERE connector_kind = ? ORDER BY started_at DESC LIMIT 1").get(c.kind);
      } catch (e) {}
      return Object.assign({}, c, { last_sync: lastSync });
    });
    res.json({ connectors: enriched, count: enriched.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:kind', (req, res) => {
  try {
    const db = getDb();
    const c = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    if (!c) return res.status(404).json({ error: 'connecteur inconnu' });
    let logs = [];
    try {
      logs = db.prepare("SELECT * FROM sync_log WHERE connector_kind = ? ORDER BY started_at DESC LIMIT 10").all(c.kind);
    } catch (e) {}
    res.json({ connector: c, logs: logs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:kind', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    if (!existing) return res.status(404).json({ error: 'connecteur inconnu' });
    const allowed = ['label', 'icon', 'status', 'config_json', 'last_error'];
    const sets = [];
    const params = [];
    for (const k of allowed) {
      if (k in req.body) {
        sets.push(k + ' = ?');
        params.push(req.body[k]);
      }
    }
    if (!sets.length) return res.json({ connector: existing });
    params.push(req.params.kind);
    db.prepare("UPDATE connectors SET " + sets.join(', ') + ", updated_at = datetime('now') WHERE kind = ?").run(...params);
    const updated = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    res.json({ connector: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === POST /api/connectors — ajouter un nouveau connecteur custom ===
router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.kind || !body.label) return res.status(400).json({ error: 'kind et label requis' });
    const data = {
      kind: String(body.kind).trim(),
      label: String(body.label).trim(),
      icon: body.icon || '🔌',
      status: body.status || 'available',
      config_json: body.config_json ? (typeof body.config_json === 'string' ? body.config_json : JSON.stringify(body.config_json)) : null
    };
    const created = connectors.insert(data);
    res.status(201).json({ connector: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === DELETE /api/connectors/:kind ===
router.delete('/:kind', (req, res) => {
  try {
    const db = getDb();
    const c = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    if (!c) return res.status(404).json({ error: 'connecteur inconnu' });
    db.prepare("DELETE FROM connectors WHERE kind = ?").run(req.params.kind);
    res.json({ ok: true, removed: c.kind });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === POST /api/connectors/:kind/test — teste la connexion sans synchroniser ===
router.post('/:kind/test', async (req, res) => {
  try {
    const db = getDb();
    const c = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    if (!c) return res.status(404).json({ error: 'connecteur inconnu' });
    if (c.status === 'coming_soon') {
      return res.json({ ok: false, message: 'Connecteur pas encore disponible (V1.x)', status: 'coming_soon' });
    }
    if (c.kind === 'outlook-desktop') {
      // Test : verifier que le script PowerShell existe
      const scriptPath = path.resolve(__dirname, '..', '..', 'scripts', 'sync-outlook.ps1');
      const exists = fs.existsSync(scriptPath);
      const lastSync = db.prepare("SELECT MAX(started_at) AS ts FROM sync_log WHERE connector_kind = ? AND status = 'success'").get(c.kind);
      return res.json({
        ok: exists,
        message: exists ? 'Script de sync trouve. Outlook Desktop doit etre lance pour la sync reelle.' : 'Script sync-outlook.ps1 manquant',
        script_path: scriptPath,
        last_success: lastSync ? lastSync.ts : null
      });
    }
    res.json({ ok: false, message: 'Test non implemente pour ce kind', kind: c.kind });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === GET /api/connectors/:kind/stats — stats agregees d'un connecteur ===
router.get('/:kind/stats', (req, res) => {
  try {
    const db = getDb();
    const c = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    if (!c) return res.status(404).json({ error: 'connecteur inconnu' });
    let stats = {};
    try {
      stats = {
        total_runs: db.prepare("SELECT COUNT(*) AS n FROM sync_log WHERE connector_kind = ?").get(c.kind).n,
        success_runs: db.prepare("SELECT COUNT(*) AS n FROM sync_log WHERE connector_kind = ? AND status = 'success'").get(c.kind).n,
        error_runs: db.prepare("SELECT COUNT(*) AS n FROM sync_log WHERE connector_kind = ? AND status = 'error'").get(c.kind).n,
        avg_duration_ms: db.prepare("SELECT AVG(duration_ms) AS avg FROM sync_log WHERE connector_kind = ? AND status = 'success'").get(c.kind).avg || 0,
        last_7d: db.prepare("SELECT COUNT(*) AS n FROM sync_log WHERE connector_kind = ? AND started_at >= datetime('now','-7 days')").get(c.kind).n
      };
    } catch (e) {}
    // Total items pour outlook = COUNT(emails)
    if (c.kind === 'outlook-desktop') {
      try { stats.items_total = db.prepare("SELECT COUNT(*) AS n FROM emails").get().n; } catch (e) {}
      try { stats.items_30d = db.prepare("SELECT COUNT(*) AS n FROM emails WHERE received_at >= datetime('now','-30 days')").get().n; } catch (e) {}
    }
    res.json({ connector: c.kind, stats: stats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === POST /api/connectors/:kind/sync — declenche une synchronisation ===
router.post('/:kind/sync', async (req, res) => {
  try {
    const db = getDb();
    const c = db.prepare("SELECT * FROM connectors WHERE kind = ?").get(req.params.kind);
    if (!c) return res.status(404).json({ error: 'connecteur inconnu' });
    if (c.status === 'coming_soon') {
      return res.status(400).json({ error: 'Connecteur pas encore disponible (V1.x)', kind: c.kind, label: c.label });
    }

    // Ne supporte que outlook-desktop pour l'instant
    if (c.kind !== 'outlook-desktop') {
      return res.status(501).json({ error: 'Sync non implementee pour ce connecteur', kind: c.kind });
    }

    // Cree une entree sync_log immediatement
    const logId = uuid7();
    const startedAt = new Date().toISOString();
    db.prepare("INSERT INTO sync_log (id, connector_kind, started_at, status) VALUES (?, ?, ?, 'running')")
      .run(logId, c.kind, startedAt);

    // Lance le script PowerShell de sync (asynchrone, non-bloquant)
    const repoRoot = path.resolve(__dirname, '..', '..');
    const syncScript = path.join(repoRoot, 'scripts', 'sync-outlook.ps1');
    const exists = fs.existsSync(syncScript);

    if (!exists) {
      // Fallback : juste tenter normalize-emails sur emails.json existant
      db.prepare("UPDATE sync_log SET status='error', error_message=?, ended_at=datetime('now') WHERE id=?")
        .run('script sync-outlook.ps1 absent (' + syncScript + ')', logId);
      return res.status(500).json({ error: 'Script sync-outlook.ps1 absent', expected: syncScript });
    }

    // Reponse immediate (ne pas bloquer le HTTP). Le client polleera /sync-log.
    res.json({
      ok: true,
      sync_id: logId,
      connector: c.kind,
      started_at: startedAt,
      message: 'Sync lancee en arriere-plan. Suivre via GET /api/system/sync-log?connector=outlook-desktop'
    });

    // Spawn PowerShell en arriere-plan
    try {
      const child = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-NoProfile', '-File', syncScript], {
        cwd: repoRoot,
        windowsHide: true,
        detached: false
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });
      child.on('close', (code) => {
        const tStart = new Date(startedAt).getTime();
        const duration = Date.now() - tStart;
        try {
          // Compter les emails apres sync
          const total = db.prepare("SELECT COUNT(*) AS n FROM emails").get().n;
          // Difference depuis last_sync_at du connector ?
          const itemsNew = total; // approx, on reaffinera plus tard
          db.prepare("UPDATE sync_log SET status=?, ended_at=datetime('now'), items_count=?, duration_ms=?, summary_json=?, error_message=? WHERE id=?")
            .run(
              code === 0 ? 'success' : 'error',
              total,
              duration,
              JSON.stringify({ exit_code: code, stdout: stdout.slice(-2000), stderr: stderr.slice(-1000) }),
              code === 0 ? null : (stderr || 'exit code ' + code).slice(0, 500),
              logId
            );
          db.prepare("UPDATE connectors SET last_sync_at=datetime('now'), status=?, last_error=? WHERE kind=?")
            .run(code === 0 ? 'connected' : 'error', code === 0 ? null : stderr.slice(0, 500), c.kind);
        } catch (e) {
          console.warn('[connectors:sync] log update failed:', e.message);
        }
      });
    } catch (spawnErr) {
      db.prepare("UPDATE sync_log SET status='error', ended_at=datetime('now'), error_message=? WHERE id=?")
        .run('spawn failed: ' + spawnErr.message, logId);
    }
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});

module.exports = router;
