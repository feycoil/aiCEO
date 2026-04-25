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

module.exports = router;
module.exports.getLastSyncStatus = getLastSyncStatus;
module.exports.THRESHOLD_WARN_MIN = THRESHOLD_WARN_MIN;
module.exports.THRESHOLD_CRITICAL_MIN = THRESHOLD_CRITICAL_MIN;
