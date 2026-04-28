/**


 * src/routes/cockpit.js — agrégat cockpit du jour (S2.01).


 *


 * Endpoint: GET /api/cockpit/today


 *


 * Retourne :


 *   {


 *     date:        'YYYY-MM-DD',


 *     week_id:     'YYYY-Www',


 *     intention:   string | null,           // weekly_review.intention de la semaine courante


 *     big_rocks:   [{id, ordre, title, description, status}],


 *     counters: {


 *       tasks:     { open, done_today, total },


 *       decisions: { open, decided_today },


 *       events:    { today, upcoming_24h }


 *     },


 *     alerts:      [{level, kind, message, ref?}]    // 'info' | 'warn' | 'critical'


 *   }


 *


 * Les compteurs sont calculés en SQL (pas en JS) pour rester


 * performants même quand la base grossit. La règle d'or : zéro


 * accès `localStorage` côté front pour cette page (cf. ADR S2.00 +


 * critères d'acceptance §2 du DOSSIER-SPRINT-S2).


 */


const express = require('express');


const { createAnthropicClient } = require('../anthropic-client');
const { getDb, now } = require('../db');


const { getLastSyncStatus } = require('./system');





const router = express.Router();





// --- Helpers calendrier (ISO 8601, lundi = jour 1) -----------------





function todayIso() {


  return new Date().toISOString().slice(0, 10);


}





/**


 * isoWeekId(d) → 'YYYY-Www' (ex: '2026-W21').


 * Implémente l'algorithme ISO 8601 : la semaine 1 contient le 1er jeudi de l'année.


 */


function isoWeekId(d = new Date()) {


  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));


  const dayNum = date.getUTCDay() || 7;


  date.setUTCDate(date.getUTCDate() + 4 - dayNum);


  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));


  const weekNum = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);


  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;


}





// --- Aggregator ----------------------------------------------------





function buildCockpit() {


  const db = getDb();


  const date = todayIso();


  const week = isoWeekId();





  // Intention de semaine (weekly_reviews) — peut ne pas exister.


  const wr = db.prepare(


    `SELECT intention FROM weekly_reviews WHERE week_id = ? LIMIT 1`


  ).get(week);


  const intention = wr ? wr.intention : null;





  // Big Rocks de la semaine, triées par ordre.


  const bigRocks = db.prepare(


    `SELECT id, ordre, title, description, status


       FROM big_rocks


      WHERE week_id = ?


      ORDER BY ordre ASC`


  ).all(week);





  // Compteurs tâches.


  const tasksOpen = db.prepare(


    `SELECT COUNT(*) AS n FROM tasks WHERE done = 0`


  ).get().n;


  const tasksDoneToday = db.prepare(


    `SELECT COUNT(*) AS n


       FROM tasks


      WHERE done = 1 AND substr(updated_at, 1, 10) = ?`


  ).get(date).n;


  const tasksTotal = db.prepare(`SELECT COUNT(*) AS n FROM tasks`).get().n;





  // Compteurs décisions.


  const decisionsOpen = db.prepare(


    `SELECT COUNT(*) AS n FROM decisions WHERE status = 'ouverte'`


  ).get().n;


  const decisionsToday = db.prepare(


    `SELECT COUNT(*) AS n


       FROM decisions


      WHERE status = 'decidee' AND substr(decided_at, 1, 10) = ?`


  ).get(date).n;





  // Compteurs events.


  const eventsToday = db.prepare(


    `SELECT COUNT(*) AS n FROM events WHERE substr(starts_at, 1, 10) = ?`


  ).get(date).n;


  const eventsUpcoming = db.prepare(


    `SELECT COUNT(*) AS n


       FROM events


      WHERE starts_at >= ?


        AND starts_at < datetime(?, '+24 hours')`


  ).get(now(), now()).n;





  // Alertes.


  const alerts = [];





  // Tâches en retard (due_at dépassée, pas done).


  const overdue = db.prepare(


    `SELECT id, title, due_at FROM tasks


      WHERE done = 0 AND due_at IS NOT NULL AND due_at < ?


      ORDER BY due_at ASC LIMIT 5`


  ).all(now());


  for (const t of overdue) {


    alerts.push({


      level: 'warn',


      kind: 'task_overdue',


      message: `« ${t.title} » en retard depuis ${t.due_at.slice(0, 10)}`,


      ref: { type: 'task', id: t.id }


    });


  }





  // Décisions ouvertes depuis > 7 jours.


  const stale = db.prepare(


    `SELECT id, title, created_at FROM decisions


      WHERE status = 'ouverte' AND created_at < datetime(?, '-7 days')


      ORDER BY created_at ASC LIMIT 3`


  ).all(now());


  for (const d of stale) {


    alerts.push({


      level: 'warn',


      kind: 'decision_stale',


      message: `Décision « ${d.title} » ouverte depuis plus de 7 jours`,


      ref: { type: 'decision', id: d.id }


    });


  }





  // Big rocks définis mais aucun acquittement (pas de tâche done liée).


  if (bigRocks.length === 0 && week) {


    alerts.push({


      level: 'info',


      kind: 'big_rocks_missing',


      message: `Aucun Big Rock défini pour la semaine ${week}`


    });


  }





  // S3.06 — Alerte fraicheur Outlook autosync (lastSync > 4h => warn, > 24h => critical)


  try {


    const sync = getLastSyncStatus();


    if (sync.level === 'warn' || sync.level === 'critical') {


      const ageH = sync.lastSyncAgeMin != null ? Math.round(sync.lastSyncAgeMin / 60) : '?';


      alerts.push({


        level: sync.level,


        kind: 'outlook_stale',


        message: sync.lastSyncAt


          ? `Sync Outlook ancienne (${ageH} h). Verifier autosync schtasks.`


          : `emails-summary.json absent. Lancer fetch-outlook.ps1.`,


        ref: { type: 'system', id: 'last-sync' },


      });


    }


  } catch (e) {


    // tolerant : pas d'alerte si fichier introuvable / permissions


  }





  return {


    date,


    week_id: week,


    intention,


    big_rocks: bigRocks,


    counters: {


      tasks: {


        open: tasksOpen,


        done_today: tasksDoneToday,


        total: tasksTotal


      },


      decisions: {


        open: decisionsOpen,


        decided_today: decisionsToday


      },


      events: {


        today: eventsToday,


        upcoming_24h: eventsUpcoming


      }


    },


    alerts


  };


}





// --- Route ---------------------------------------------------------





router.get('/today', (req, res) => {


  try {


    res.json(buildCockpit());


  } catch (e) {


    res.status(500).json({ error: e.message });


  }


});





// --- SSE stream (Spike S2.10) -------------------------------------


// Push temps réel pour le cockpit. Voir docs/SPIKE-WEBSOCKET.md pour la décision


// (SSE retenu plutôt que WebSocket — zéro dépendance, mono-directionnel suffisant).





const { bus } = require('../realtime');





router.get('/stream', (req, res) => {


  res.set({


    'Content-Type': 'text/event-stream',


    'Cache-Control': 'no-cache, no-transform',


    Connection: 'keep-alive',


    'X-Accel-Buffering': 'no',


  });


  if (typeof res.flushHeaders === 'function') res.flushHeaders();





  // Hello + horodatage initial pour confirmer la connexion.


  res.write(`event: hello\ndata: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`);





  const onChange = (e) => {


    res.write(`event: ${e.type}\ndata: ${JSON.stringify({ ...e.payload, ts: e.ts })}\n\n`);


  };


  bus.on('change', onChange);





  // Heartbeat toutes les 25 s pour traverser les proxies (Zscaler timeout 60 s).


  const heartbeat = setInterval(() => {


    res.write(`: ping ${Date.now()}\n\n`);


  }, 25000);





  req.on('close', () => {


    clearInterval(heartbeat);


    bus.off('change', onChange);


  });


});





// S6.8.4 — Cockpit narratif : intention + alertes matin + suggestions LLM

// GET /api/cockpit/intention : synthese 1 phrase de l'intention de la semaine
router.get('/intention', async (req, res) => {
  try {
    const db = getDb();
    let weekRow;
    try { weekRow = db.prepare("SELECT * FROM weeks ORDER BY id DESC LIMIT 1").get(); } catch (e) {}
    let bigRocks = [];
    try { bigRocks = db.prepare("SELECT title, status FROM big_rocks WHERE week_id = ? ORDER BY ordre ASC").all(weekRow ? weekRow.id : ''); } catch (e) {}
    let openDecs = [];
    try { openDecs = db.prepare("SELECT title FROM decisions WHERE status = 'ouverte' ORDER BY created_at DESC LIMIT 5").all(); } catch (e) {}

    let intention = '';
    let source = 'rule';

    if (bigRocks.length > 0) {
      const verbs = bigRocks.map((b, i) => {
        const t = (b.title || '').trim();
        if (i === 0) return t.charAt(0).toLowerCase() + t.slice(1);
        return t.charAt(0).toLowerCase() + t.slice(1);
      });
      intention = verbs.length === 1 ? verbs[0]
                : verbs.length === 2 ? verbs[0] + ', ' + verbs[1]
                : verbs.slice(0, -1).join(', ') + ' — ' + verbs[verbs.length - 1];
      intention = intention.charAt(0).toUpperCase() + intention.slice(1);
    } else if (openDecs.length > 0) {
      intention = 'Trancher : ' + openDecs.slice(0, 3).map(d => d.title).join(' · ');
    } else {
      intention = 'Aucun cap defini cette semaine. Posez 3 Big Rocks via la revue hebdo.';
    }

    // LLM enrichi si dispo
    if (process.env.ANTHROPIC_API_KEY && process.env.DEMO_MODE !== '1' && bigRocks.length > 0) {
      try {
        const client = createAnthropicClient();
        const ctx = bigRocks.map((b, i) => (i+1) + '. ' + (b.title || '')).join('\n');
        const sys = "Tu es l'assistant cockpit. Synthese ULTRA-CONCISE (max 12 mots, format verbe-action -- objet) des 3 Big Rocks de la semaine. Pas de phrase complete : juste 3 verbes-actions concatenes par virgules. Exemple : 'Solder Affejee, securiser Pamandzi, decaler le tirage Bretagne'. Aucune ponctuation finale, aucune explication.";
        const resp = await client.messages.create({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens: 80,
          system: sys,
          messages: [{ role: 'user', content: ctx }]
        });
        const txt = (resp.content && resp.content[0] && resp.content[0].text) || '';
        if (txt.trim()) {
          intention = txt.trim().replace(/^["']|["']$/g, '');
          source = 'llm';
        }
      } catch (e) { /* keep fallback */ }
    }

    res.json({ intention, source, big_rocks: bigRocks, week_id: weekRow ? weekRow.id : null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/cockpit/morning-alerts : agreges les points a regler avant arbitrage
router.get('/morning-alerts', (req, res) => {
  try {
    const db = getDb();
    const alerts = [];
    // 1. Taches en retard
    try {
      const overdue = db.prepare("SELECT COUNT(*) AS c FROM tasks WHERE done = 0 AND due_at IS NOT NULL AND due_at < datetime('now')").get();
      if (overdue.c > 0) alerts.push({ kind: 'overdue', severity: 'high', message: overdue.c + ' tache' + (overdue.c > 1 ? 's' : '') + ' en retard', cta: '/v06/taches.html' });
    } catch (e) {}
    // 2. Big rocks sans tache associee (week courante)
    try {
      const weekRow = db.prepare("SELECT id FROM weeks ORDER BY id DESC LIMIT 1").get();
      if (weekRow) {
        const orphans = db.prepare("SELECT COUNT(*) AS c FROM big_rocks WHERE week_id = ? AND status = 'defini'").get(weekRow.id);
        if (orphans.c > 0) alerts.push({ kind: 'big_rock_unstarted', severity: 'medium', message: orphans.c + ' Big Rock' + (orphans.c > 1 ? 's' : '') + ' sans action lancee', cta: '/v06/revues.html' });
      }
    } catch (e) {}
    // 3. Sync Outlook stale (dernier email > 4h)
    try {
      const lastEmail = db.prepare("SELECT received_at FROM emails ORDER BY received_at DESC LIMIT 1").get();
      if (lastEmail) {
        const ageMs = Date.now() - new Date(lastEmail.received_at).getTime();
        const ageH = Math.floor(ageMs / 3600000);
        if (ageH > 4) alerts.push({ kind: 'sync_stale', severity: 'low', message: 'Synchro Outlook vieille de ' + ageH + 'h', cta: null });
      }
    } catch (e) {}
    // 4. Decisions ouvertes depuis > 7j
    try {
      const stale = db.prepare("SELECT COUNT(*) AS c FROM decisions WHERE status = 'ouverte' AND created_at < datetime('now', '-7 days')").get();
      if (stale.c > 0) alerts.push({ kind: 'decision_stale', severity: 'high', message: stale.c + ' decision' + (stale.c > 1 ? 's' : '') + ' ouverte' + (stale.c > 1 ? 's' : '') + ' depuis > 7 jours', cta: '/v06/decisions.html' });
    } catch (e) {}

    res.json({ alerts, count: alerts.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/cockpit/llm-suggestions : 3 cards (delegation / recadrage / reprise)
router.get('/llm-suggestions', async (req, res) => {
  try {
    const db = getDb();
    let suggestions = [];
    // Heuristiques de fallback rule-based
    try {
      const taches = db.prepare("SELECT title, priority FROM tasks WHERE done = 0 AND priority = 'P2' ORDER BY created_at DESC LIMIT 3").all();
      if (taches.length > 0) {
        suggestions.push({
          kind: 'delegation',
          title: 'Deleguer "' + taches[0].title.slice(0, 50) + '"',
          body: 'Tache P2 qui pourrait etre traitee par un membre de l equipe.',
          actions: [{ label: 'Deleguer', href: '/v06/taches.html' }]
        });
      }
    } catch (e) {}
    try {
      const stale = db.prepare("SELECT title, id FROM decisions WHERE status = 'ouverte' AND created_at < datetime('now', '-5 days') ORDER BY created_at ASC LIMIT 1").get();
      if (stale) {
        suggestions.push({
          kind: 'recadrage',
          title: 'Decision dormante : ' + stale.title.slice(0, 50),
          body: 'Ouverte depuis plus de 5 jours. Trancher ou abandonner.',
          actions: [{ label: 'Trancher', href: '/v06/decisions.html' }, { label: 'Discuter', href: '/v06/assistant.html?context=decision:' + stale.id }]
        });
      }
    } catch (e) {}
    try {
      const reportee = db.prepare("SELECT title, id FROM decisions WHERE status = 'reportee' ORDER BY created_at DESC LIMIT 1").get();
      if (reportee) {
        suggestions.push({
          kind: 'reprise',
          title: 'Reprendre : ' + reportee.title.slice(0, 50),
          body: 'Decision reportee. C est peut-etre le moment de la reactiver.',
          actions: [{ label: 'Voir', href: '/v06/decisions.html' }]
        });
      }
    } catch (e) {}

    res.json({ suggestions, count: suggestions.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


module.exports.buildCockpit = buildCockpit;


module.exports.isoWeekId = isoWeekId;





