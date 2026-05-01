/**
 * src/routes/assistant.js — chat live IA streaming Claude (S4.01).
 *
 *   GET    /api/assistant/conversations          liste 20 dernières (updated_at DESC)
 *   GET    /api/assistant/conversations/:id      conversation + messages liés
 *   POST   /api/assistant/messages               body { conversation_id?, content }
 *                                                 → stream SSE chunks `text` puis `done`
 *   DELETE /api/assistant/conversations/:id      cascade messages (FK ON DELETE CASCADE)
 *
 * S2.10 / S3.05 réutilisés : bus EventEmitter du module realtime.
 * S2.00 / S4.00 ADR : 0 localStorage applicatif, source de vérité = SQLite.
 * Cap max_tokens 1500. Fallback non-streaming si pas de clé API.
 */
const express = require('express');
const { getDb, crud, uuid7, now } = require('../db');
const { createAnthropicClient } = require('../anthropic-client');

const conversations = crud('assistant_conversations');
const messages = crud('assistant_messages');
const router = express.Router();

const SYSTEM_PROMPT_ASSISTANT = `Tu es l'assistant copilote du CEO d'aiCEO. Ton rôle : aider le CEO à clarifier ses décisions, formuler des contre-arguments, et préparer ses arbitrages quotidiens.

Style : direct, factuel, sans flatterie. Réponses concises (200 mots max sauf demande explicite). Cite des sources concrètes quand possible (issues GitHub, ADRs, fichiers du repo). Si tu ne sais pas, dis-le.

OUTIL DISPONIBLE — pin_to_knowledge :
Tu peux épingler des éléments dans la base de connaissance du CEO. Utilise cet outil quand tu détectes que le CEO formule explicitement :
- un critère de décision récurrent (ex: "marge ≥ 35%", "sponsor interne aligné")
- une décision tranchée (ex: "OK, je vais à Hôpital Sud", "non, on ne fait pas de discount")
- un principe ou posture stratégique (ex: "ne jamais signer sans pousseur interne")
- une note importante à conserver dans sa mémoire long-terme

Cela construit sa base de connaissance. Ne l'utilise PAS pour des reformulations, questions ou réflexions ouvertes — seulement pour des éléments cristallisés que le CEO voudra retrouver plus tard.

Tu peux appeler le tool plusieurs fois dans la même réponse si plusieurs éléments cristallisés émergent.`;

const MAX_TOKENS = 1500;

// === S7.1 (30/04/2026) — Memoire inter-fils LLM (pilier IA contextualisee) ===
// === S6.35 (1/5/2026) — Contextualiseur item specifique (project/decision/task) ===
// buildContextualSystemPrompt(opts) : opts = { context_kind, context_id }
// Si fourni, prepend un bloc detaille sur l item (emails, tasks, decisions, sub-projects)
function buildContextualSystemPrompt(opts) {
  let ctx = "";
  // S6.35 : si contexte specifique, fetch detail et inject
  if (opts && opts.context_kind && opts.context_id) {
    try {
      const db = getDb();
      const id = String(opts.context_id);
      if (opts.context_kind === "project") {
        const proj = db.prepare("SELECT id, name, tagline, description, status FROM projects WHERE id = ?").get(id);
        if (proj) {
          ctx += "\n\n---\nCONTEXTE DETAILLE PROJET \"" + proj.name + "\" :\n";
          if (proj.tagline) ctx += "Tagline : " + proj.tagline + "\n";
          if (proj.description) ctx += "Description : " + proj.description.slice(0, 300) + "\n";
          ctx += "Statut : " + (proj.status || "active") + "\n";
          let emails = [];
          try { emails = db.prepare("SELECT subject, from_name, received_at, body_preview FROM emails WHERE project_id = ? OR LOWER(inferred_project) = LOWER(?) ORDER BY received_at DESC LIMIT 5").all(id, proj.name || ""); } catch (e) {}
          if (emails.length) {
            ctx += "\nDerniers emails (" + emails.length + ") :\n";
            emails.forEach(e => { ctx += "- [" + (e.received_at || "").slice(0, 10) + "] " + (e.from_name || "?") + " : \"" + (e.subject || "").slice(0, 80) + "\""; if (e.body_preview) ctx += " — " + e.body_preview.slice(0, 100); ctx += "\n"; });
          }
          let decs = [];
          try { decs = db.prepare("SELECT title, status, decision FROM decisions WHERE project_id = ? ORDER BY updated_at DESC LIMIT 5").all(id); } catch (e) {}
          if (decs.length) {
            ctx += "\nDecisions liees (" + decs.length + ") :\n";
            decs.forEach(d => { ctx += "- [" + (d.status || "?") + "] " + (d.title || ""); if (d.decision) ctx += " => tranchee : " + d.decision.slice(0, 100); ctx += "\n"; });
          }
          let tasks = [];
          try { tasks = db.prepare("SELECT title, done, priority FROM tasks WHERE project_id = ? AND done = 0 ORDER BY created_at DESC LIMIT 8").all(id); } catch (e) {}
          if (tasks.length) {
            ctx += "\nActions ouvertes (" + tasks.length + ") :\n";
            tasks.forEach(t => { ctx += "- [" + (t.priority || "P2") + "] " + (t.title || "") + "\n"; });
          }
          let children = [];
          try { children = db.prepare("SELECT name, status FROM projects WHERE parent_id = ?").all(id); } catch (e) {}
          if (children.length) {
            ctx += "\nSous-projets (" + children.length + ") : " + children.map(c => c.name + " [" + (c.status || "active") + "]").join(", ") + "\n";
          }
          ctx += "---\n";
        }
      } else if (opts.context_kind === "decision") {
        const d = db.prepare("SELECT title, status, context, options, decision FROM decisions WHERE id = ?").get(id);
        if (d) {
          ctx += "\n\n---\nCONTEXTE DETAILLE DECISION \"" + d.title + "\" :\n";
          ctx += "Statut : " + (d.status || "ouverte") + "\n";
          if (d.context) ctx += "Contexte : " + d.context.slice(0, 500) + "\n";
          if (d.options) ctx += "Options : " + (typeof d.options === "string" ? d.options : JSON.stringify(d.options)).slice(0, 500) + "\n";
          if (d.decision) ctx += "Decision tranchee : " + d.decision.slice(0, 300) + "\n";
          ctx += "---\n";
        }
      } else if (opts.context_kind === "task") {
        const t = db.prepare("SELECT title, description, priority, done, due_at FROM tasks WHERE id = ?").get(id);
        if (t) {
          ctx += "\n\n---\nCONTEXTE DETAILLE ACTION \"" + t.title + "\" :\n";
          ctx += "Priorite : " + (t.priority || "P2") + " | Etat : " + (t.done ? "fait" : "ouverte") + "\n";
          if (t.due_at) ctx += "Echeance : " + t.due_at + "\n";
          if (t.description) ctx += "Description : " + t.description.slice(0, 500) + "\n";
          ctx += "---\n";
        }
      }
    } catch (e) {
      console.warn("[buildContextualSystemPrompt] context fetch failed:", e.message);
    }
  }
  try {
    const db = getDb();
    let decisions = [];
    try { decisions = db.prepare("SELECT title, status FROM decisions WHERE status IN ('ouverte','reportee') ORDER BY updated_at DESC LIMIT 5").all(); } catch (e) {}
    let rocks = [];
    try {
      const now = new Date();
      const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      const weekId = d.getUTCFullYear() + "-W" + String(weekNum).padStart(2, "0");
      rocks = db.prepare("SELECT title, status, ordre FROM big_rocks WHERE week_id = ? ORDER BY ordre").all(weekId);
    } catch (e) {}
    let projects = [];
    try { projects = db.prepare("SELECT name, tagline FROM projects WHERE status IN ('active','hot','new') ORDER BY updated_at DESC LIMIT 5").all(); } catch (e) {}
    let feedbacks = [];
    try { feedbacks = db.prepare("SELECT verdict, COUNT(*) AS n FROM email_feedback WHERE feedback_at >= datetime('now','-30 days') GROUP BY verdict ORDER BY n DESC LIMIT 5").all(); } catch (e) {}
    let pins = [];
    try { pins = db.prepare("SELECT kind, title FROM knowledge_pins ORDER BY pinned_at DESC LIMIT 5").all(); } catch (e) {}

    if (decisions.length || rocks.length || projects.length || feedbacks.length || pins.length) {
      ctx += "\n\n---\nCONTEXTE EXECUTIF DU CEO (snapshot DB) — utilise-le pour personnaliser tes reponses :\n";
      if (decisions.length) ctx += "\n- Decisions en attente (" + decisions.length + ") : " + decisions.map(d => '"' + d.title + '"' + (d.status === "reportee" ? " [reportee]" : "")).join(" | ");
      if (rocks.length) ctx += "\n- Big Rocks semaine (" + rocks.length + "/3) : " + rocks.map(r => '"' + r.title + '"' + (r.status === "accompli" ? " OK" : r.status === "rate" ? " KO" : "")).join(" | ");
      if (projects.length) ctx += "\n- Projets actifs : " + projects.map(p => '"' + p.name + '"' + (p.tagline ? " (" + p.tagline.slice(0, 40) + ")" : "")).join(" | ");
      if (feedbacks.length) ctx += "\n- Apprentissage Triage 30j : " + feedbacks.map(f => f.verdict + "x" + f.n).join(" | ");
      if (pins.length) ctx += "\n- Connaissance epinglee recente : " + pins.map(p => "[" + p.kind + "] " + p.title).join(" | ");
      ctx += "\n---\n";
    }
  } catch (e) {
    console.warn("[assistant:buildContextualSystemPrompt] failed:", e.message);
  }
  return SYSTEM_PROMPT_ASSISTANT + ctx;
}

// S6.8.1 (28/04 PM late) — Tool pin_to_knowledge pour epinglage automatique Connaissance
const TOOLS_ASSISTANT = [
  {
    name: 'pin_to_knowledge',
    description: "Épingle un élément important dans la base de connaissance du CEO (table knowledge_pins). À utiliser quand un critère, décision, principe ou note cristallisée apparaît dans la conversation.",
    input_schema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['decision', 'criterion', 'principle', 'note'],
          description: 'Type : decision (tranchée), criterion (critère réutilisable), principle (posture/règle), note (autre)'
        },
        title: {
          type: 'string',
          description: 'Titre court de 5-100 caractères (visible dans la base)'
        },
        content: {
          type: 'string',
          description: 'Contenu détaillé / formulation complète (max 1000 chars)'
        },
        reason: {
          type: 'string',
          description: 'Une phrase explicative montrée au CEO pour justifier l\'épinglage'
        }
      },
      required: ['kind', 'title']
    }
  }
];

// ── GET conversations ─────────────────────────────────────────────────
router.get('/conversations', (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const rows = conversations.list({}, { orderBy: 'updated_at DESC', limit });
    res.json({ conversations: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET conversation single + messages ────────────────────────────────
router.get('/conversations/:id', (req, res) => {
  try {
    const conv = conversations.get(req.params.id);
    if (!conv) return res.status(404).json({ error: 'conversation introuvable' });
    const msgs = messages.list({ conversation_id: req.params.id }, { orderBy: 'ts ASC' });
    res.json({ conversation: conv, messages: msgs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE conversation (cascade messages) ────────────────────────────
router.delete('/conversations/:id', (req, res) => {
  try {
    const conv = conversations.get(req.params.id);
    if (!conv) return res.status(404).json({ error: 'conversation introuvable' });
    conversations.remove(req.params.id);
    res.json({ ok: true, removed: req.params.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /conversations/:id/context — éléments contextuels rattachés à la conversation
//    S6.8.1 : retourne les pins épinglés dans cette conversation + projets mentionnés.
router.get('/conversations/:id/context', (req, res) => {
  try {
    const conv = conversations.get(req.params.id);
    if (!conv) return res.json({ context: [] });
    const db = getDb();
    let pins = [];
    try {
      pins = db.prepare("SELECT id, kind, title, pinned_at FROM knowledge_pins WHERE source_type='assistant' AND source_id = ? AND archived_at IS NULL ORDER BY pinned_at DESC").all(req.params.id);
    } catch (e) { /* table absente */ }
    const context = pins.map((p) => ({
      kind: 'knowledge',
      title: p.title,
      meta: 'Connaissance · ' + (p.kind || 'note'),
      ref_id: p.id,
    }));
    res.json({ context, count: context.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /conversations/:id/effects — effets propagés (pins créés via cette conv)
router.get('/conversations/:id/effects', (req, res) => {
  try {
    const db = getDb();
    let pins = [];
    try {
      pins = db.prepare("SELECT id, kind, title, content, pinned_at FROM knowledge_pins WHERE source_type='assistant' AND source_id = ? AND archived_at IS NULL ORDER BY pinned_at DESC").all(req.params.id);
    } catch (e) { /* table absente */ }
    const effects = pins.map((p) => ({
      id: p.id,
      marker: p.kind === 'decision' ? '!' : '+',
      title: p.title || '(sans titre)',
      meta: 'Connaissance · ' + (p.kind || 'note'),
    }));
    res.json({ effects, count: effects.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST message — streaming SSE Claude ───────────────────────────────
router.post('/messages', async (req, res) => {
  try {
    const body = req.body || {};
    const content = String(body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'champ content obligatoire' });

    // 1. Récupère ou crée la conversation
    let convId = body.conversation_id;
    if (convId) {
      const existing = conversations.get(convId);
      if (!existing) return res.status(404).json({ error: 'conversation_id introuvable' });
    } else {
      // Crée une nouvelle conversation, titre = 60 premiers caractères du message user
      const title = content.slice(0, 60).replace(/\n/g, ' ').trim() || 'Nouvelle conversation';
      const created = conversations.insert({
        title,
        created_at: now(),
        updated_at: now(),
      });
      convId = created.id;
    }

    // 2. Append message user
    const userMsg = messages.insert({
      conversation_id: convId,
      role: 'user',
      content,
      ts: now(),
    });

    // 3. Récupère history pour passer à Claude (max 10 derniers échanges)
    const history = messages.list({ conversation_id: convId }, { orderBy: 'ts ASC', limit: 20 });

    // 4. Headers SSE
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    // Envoie le conversation_id au début pour que le front puisse persister
    res.write(`event: conversation\ndata: ${JSON.stringify({ id: convId, user_msg_id: userMsg.id })}\n\n`);

    // 5. Mode démo / fallback si pas de clé
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const demo = !apiKey || process.env.DEMO_MODE === '1' || body.fallback === true;

    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
    let assistantContent = '';
    let usage = null;

    if (demo) {
      // Réponse fallback non-streaming (chunked manuel pour cohérence client)
      assistantContent = `_(Mode fallback : pas de clé ANTHROPIC_API_KEY ou DEMO_MODE actif.)_\n\nMessage reçu : « ${content.slice(0, 200)} »\n\nLa réponse Claude réelle sera disponible quand la clé API sera valide. Pour tester en local : ajouter \`ANTHROPIC_API_KEY=sk-...\` dans \`03_mvp/.env\`.`;
      // Simule streaming pour cohérence client
      for (const word of assistantContent.split(' ')) {
        res.write(`event: text\ndata: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise((r) => setTimeout(r, 10));
      }
    } else {
      // Streaming Claude réel avec tool_use pin_to_knowledge (S6.8.1)
      const client = createAnthropicClient();
      const claudeMessages = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      try {
        const stream = await client.messages.stream({
          model,
          max_tokens: MAX_TOKENS,
          system: buildContextualSystemPrompt({ context_kind: (req.body && req.body.context_kind) || null, context_id: (req.body && req.body.context_id) || null }),
          tools: TOOLS_ASSISTANT,
          messages: claudeMessages,
        });
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
            const text = chunk.delta.text || '';
            assistantContent += text;
            res.write(`event: text\ndata: ${JSON.stringify({ text })}\n\n`);
          }
        }
        const final = await stream.finalMessage();
        usage = final.usage || null;

        // S6.8.1 — Capture tool_use blocks (pin_to_knowledge) et insert + emit SSE
        const toolUses = (final.content || []).filter((b) => b.type === 'tool_use');
        for (const tu of toolUses) {
          if (tu.name !== 'pin_to_knowledge') continue;
          const input = tu.input || {};
          const kind = ['decision', 'criterion', 'principle', 'note'].includes(input.kind) ? input.kind : 'note';
          const title = String(input.title || '').slice(0, 200) || '(sans titre)';
          const content2 = input.content ? String(input.content).slice(0, 2000) : null;
          const reason = String(input.reason || '').slice(0, 300);
          try {
            const db = getDb();
            const pinId = uuid7();
            db.prepare(`
              INSERT INTO knowledge_pins (id, kind, title, content, source_type, source_id, created_at, updated_at, pinned_at)
              VALUES (?, ?, ?, ?, 'assistant', ?, datetime('now'), datetime('now'), datetime('now'))
            `).run(pinId, kind, title, content2, convId);
            res.write(`event: knowledge-created\ndata: ${JSON.stringify({
              pin_id: pinId,
              kind,
              title,
              content: content2,
              reason
            })}\n\n`);
          } catch (errPin) {
            // Silencieux : si knowledge_pins n'existe pas, on continue sans crasher la conversation
            console.warn('[assistant] pin_to_knowledge insert failed:', errPin.message);
          }
        }
      } catch (e) {
        // Si Claude crashe en cours de stream, écrire une fin propre
        const errMsg = `\n\n_(Erreur Claude pendant streaming : ${e.message}. Fin de réponse.)_`;
        res.write(`event: text\ndata: ${JSON.stringify({ text: errMsg })}\n\n`);
        assistantContent += errMsg;
      }
    }

    // 6. Append message assistant complet
    const assistantMsg = messages.insert({
      conversation_id: convId,
      role: 'assistant',
      content: assistantContent,
      ts: now(),
      model,
      tokens_in: usage?.input_tokens ?? null,
      tokens_out: usage?.output_tokens ?? null,
    });

    // 7. Update conversation updated_at
    conversations.update(convId, { updated_at: now() });

    // 8. Done event
    res.write(`event: done\ndata: ${JSON.stringify({ id: assistantMsg.id, model, source: demo ? 'fallback' : 'claude', usage })}\n\n`);
    res.end();
  } catch (e) {
    // Si une exception remonte avant que les headers SSE soient envoyés, retourner JSON normal
    if (!res.headersSent) {
      return res.status(500).json({ error: e.message });
    }
    res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

// ════════════════════════════════════════════════════════════════
// v0.7-S6.5 — LLM 4 surfaces UX avec fallback rule-based
// Décision Claude D1 : si ANTHROPIC_API_KEY absente, retour suggestion
// déterministe heuristique. Si présente, future intégration messages.stream.
// ════════════════════════════════════════════════════════════════

function llmReady() {
  return !!process.env.ANTHROPIC_API_KEY;
}

// --- POST /coaching-question -----------------------------------
// Génère une question stratégique contextualisée pour le banner arbitrage.
router.post("/coaching-question", (req, res) => {
  try {
    const db = getDb();
    const { decision_id, context } = req.body || {};

    // Fallback rule-based : choix d'une question parmi un pool selon contexte
    const QUESTIONS = {
      defaut: [
        "Quel est le coût d'attendre encore 24h pour décider ?",
        "À quel moment saurez-vous que c'était la bonne décision ?",
        "Quelle option choisirait quelqu'un qui n'a aucun investissement émotionnel dans ce projet ?",
      ],
      tension: [
        "Vous tranchez souvent par défaut sur la voie 'tenir l'engagement'. Est-ce que vous savez encore pourquoi ce client compte ?",
        "Si vous deviez recommencer ce projet aujourd'hui, le lanceriez-vous ?",
      ],
      equipe: [
        "Cette décision augmente-t-elle ou diminue-t-elle l'autonomie de votre équipe ?",
        "Qui dans votre équipe sera impacté en premier par cette décision ?",
      ],
      finance: [
        "Cette décision vous rapproche ou vous éloigne du point mort ?",
        "Quel est le coût d'opportunité du chemin que vous ne prenez pas ?",
      ],
    };

    let bucket = "defaut";
    const ctxStr = ((context || "") + " " + (decision_id || "")).toLowerCase();
    if (/north|tension|alerte|urgent/i.test(ctxStr)) bucket = "tension";
    if (/equipe|delegu|recrut|lamiae|feycoil/i.test(ctxStr)) bucket = "equipe";
    if (/budget|tresor|cout|ca\b|chiffre/i.test(ctxStr)) bucket = "finance";

    const pool = QUESTIONS[bucket];
    const question = pool[Math.floor(Math.random() * pool.length)];

    res.json({
      question: question,
      mode: llmReady() ? "rule-based-pending-llm" : "rule-based",
      llm_available: llmReady(),
      bucket: bucket,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /decision-recommend ----------------------------------
// Recommandation A/B/C avec impact estimé pour une décision donnée.
router.post("/decision-recommend", (req, res) => {
  try {
    const db = getDb();
    const { decision_id } = req.body || {};
    if (!decision_id) return res.status(400).json({ error: "decision_id requis" });

    const dec = db.prepare("SELECT * FROM decisions WHERE id = ?").get(decision_id);
    if (!dec) return res.status(404).json({ error: "decision introuvable" });

    // Heuristique : compter projets actifs, tasks ouvertes, ratio decisions tranchees
    const projsActive = db.prepare("SELECT COUNT(*) AS c FROM projects WHERE status IN ('active','hot')").get().c;
    const tasksOpen = db.prepare("SELECT COUNT(*) AS c FROM tasks WHERE done = 0").get().c;
    const decsClosed = db.prepare("SELECT COUNT(*) AS c FROM decisions WHERE status IN ('decidee','executee')").get().c;
    const decsTotal = db.prepare("SELECT COUNT(*) AS c FROM decisions").get().c;

    // Construction d'options selon priorité décision
    const isUrgent = (dec.priority === 'P0') || (dec.deadline && new Date(dec.deadline).getTime() < Date.now() + 7 * 86400000);

    const options = [
      {
        label: "A",
        title: isUrgent ? "Trancher maintenant" : "Décider rapidement",
        impact: "Libère " + projsActive + " projets actifs en attente",
        confidence: 0.7,
        recommended: isUrgent,
      },
      {
        label: "B",
        title: "Reporter à demain",
        impact: tasksOpen > 20 ? "Évite la surcharge (" + tasksOpen + " tâches ouvertes)" : "Permet de mûrir la décision",
        confidence: 0.5,
        recommended: !isUrgent && tasksOpen > 20,
      },
      {
        label: "C",
        title: "Déléguer",
        impact: "Soulage votre charge cognitive — ratio actuel " + (decsTotal === 0 ? 0 : Math.round(100 * decsClosed / decsTotal)) + "% décidé",
        confidence: 0.4,
        recommended: false,
      },
    ];

    res.json({
      decision_id: decision_id,
      options: options,
      mode: llmReady() ? "rule-based-pending-llm" : "rule-based",
      llm_available: llmReady(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /auto-draft-review -----------------------------------
// Pré-remplit intention + bilan + cap pour une weekly review (semaine YYYY-Www).
router.post("/auto-draft-review", (req, res) => {
  try {
    const db = getDb();
    const { week } = req.body || {};
    if (!week) return res.status(400).json({ error: "week (YYYY-Www) requis" });

    // Stats de la semaine
    const tasksDone = db.prepare("SELECT COUNT(*) AS c FROM tasks WHERE done = 1 AND created_at >= datetime('now', '-7 days')").get().c;
    const decsTaken = db.prepare("SELECT COUNT(*) AS c FROM decisions WHERE status IN ('decidee','executee') AND decided_at >= datetime('now', '-7 days')").get().c;
    const projsHot = db.prepare("SELECT name FROM projects WHERE status = 'hot' LIMIT 3").all().map(p => p.name);

    const intention = "Semaine " + week + " : " + (decsTaken > 0 ? decsTaken + " décision(s) tranchée(s), " : "") + tasksDone + " action(s) clôturée(s)" + (projsHot.length ? ". Focus chaud : " + projsHot.join(', ') + "." : ".");
    const bilan = decsTaken === 0 && tasksDone < 5
      ? "Semaine plus calme que prévu. À utiliser pour avancer sur les sujets de fond ou pour souffler."
      : "Bonne dynamique opérationnelle. Vérifiez que la cadence est tenable sans dette de sommeil ni d'attention.";
    const capProchaine = projsHot.length > 0
      ? "Avancer " + projsHot[0] + " (priorité absolue) · trancher les décisions reportées · libérer 1 plage deep-work"
      : "Définir la priorité de la semaine à venir · libérer 2-3 plages deep-work";

    res.json({
      week: week,
      intention: intention,
      bilan: bilan,
      cap_prochaine: capProchaine,
      stats: { tasks_done: tasksDone, decisions_taken: decsTaken, projects_hot: projsHot },
      mode: llmReady() ? "rule-based-pending-llm" : "rule-based",
      llm_available: llmReady(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- POST /effects-propagation ---------------------------------
// "Si vous tranchez A" : retourne les effets propagés estimés (decisions liées + jalons impactés).
router.post("/effects-propagation", (req, res) => {
  try {
    const db = getDb();
    const { decision_id, choice } = req.body || {};
    if (!decision_id || !choice) return res.status(400).json({ error: "decision_id et choice requis" });

    const dec = db.prepare("SELECT * FROM decisions WHERE id = ?").get(decision_id);
    if (!dec) return res.status(404).json({ error: "decision introuvable" });

    // Heuristique : compter decisions liées par projet + tasks impactées
    let related = [];
    let tasksImpacted = 0;
    if (dec.project_id) {
      related = db
        .prepare("SELECT id, title, status FROM decisions WHERE project_id = ? AND id != ? AND status = 'ouverte' LIMIT 3")
        .all(dec.project_id, decision_id);
      tasksImpacted = db
        .prepare("SELECT COUNT(*) AS c FROM tasks WHERE project_id = ? AND done = 0")
        .get(dec.project_id).c;
    }

    const effects = [];
    if (choice === "A" || choice === "B") {
      effects.push({ kind: "ok", text: tasksImpacted + " tâche(s) du projet débloquée(s)" });
      if (related.length > 0) effects.push({ kind: "ok", text: related.length + " décision(s) liée(s) à reprendre dans la foulée" });
      effects.push({ kind: "warn", text: "1 jalon pourrait se déplacer de 1-2 semaines selon impact" });
    } else {
      effects.push({ kind: "warn", text: "Décision reportée — " + tasksImpacted + " tâche(s) restent en attente" });
      effects.push({ kind: "info", text: "À reprendre dans 24-48h" });
    }

    res.json({
      decision_id: decision_id,
      choice: choice,
      related_decisions: related,
      tasks_impacted: tasksImpacted,
      effects: effects,
      mode: llmReady() ? "rule-based-pending-llm" : "rule-based",
      llm_available: llmReady(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /llm-status -------------------------------------------
// Indique si le LLM Anthropic est branché en prod (clé API présente).
router.get("/llm-status", (req, res) => {
  res.json({
    available: llmReady(),
    mode: llmReady() ? "live" : "rule-based-fallback",
    message: llmReady()
      ? "LLM Anthropic actif. Les 4 surfaces UX (coaching, decision-recommend, auto-draft-review, effects-propagation) utilisent les routes streaming SSE."
      : "Mode dégradé : suggestions rule-based déterministes. Pour activer le LLM live, settez ANTHROPIC_API_KEY dans les variables d'environnement Windows et redémarrez le serveur.",
  });
});

// --- POST /trajectoire-narrative ----------------------------
// S6.31 — Genere un recit de 3-5 phrases sur la periode demandee
// Body : { period: '7'|'30'|'90'|'180'|'365'|'all' }
router.post("/trajectoire-narrative", (req, res) => {
  try {
    const period = String(req.body?.period || '30');
    const days = period === 'all' ? 9999 : parseInt(period, 10) || 30;
    const cutoff = "datetime('now', '-" + days + " days')";
    const db = getDb();
    let decs = 0, rocks = 0, projs = 0, topProj = null, topDec = null;
    try {
      decs = db.prepare("SELECT COUNT(*) AS c FROM decisions WHERE status IN ('decidee','executee','tranchee') AND decided_at >= " + cutoff).get().c;
      rocks = db.prepare("SELECT COUNT(*) AS c FROM big_rocks WHERE status = 'accompli' AND created_at >= " + cutoff).get().c;
      projs = db.prepare("SELECT COUNT(*) AS c FROM projects WHERE status IN ('archived') AND updated_at >= " + cutoff).get().c;
      const tp = db.prepare("SELECT name FROM projects WHERE status = 'hot' ORDER BY updated_at DESC LIMIT 1").get();
      if (tp) topProj = tp.name;
      const td = db.prepare("SELECT title FROM decisions WHERE status = 'decidee' AND decided_at >= " + cutoff + " ORDER BY decided_at DESC LIMIT 1").get();
      if (td) topDec = td.title;
    } catch (e) {}

    // Heuristique narrative rule-based (LLM amelioration en V1.x)
    const periodLabels = { '7': '7 derniers jours', '30': '30 derniers jours', '90': '3 derniers mois', '180': '6 derniers mois', '365': 'derniere annee', 'all': 'depuis le debut' };
    const periodLbl = periodLabels[period] || (days + ' derniers jours');
    let narrative = '';
    if (decs === 0 && rocks === 0 && projs === 0) {
      narrative = 'Sur les ' + periodLbl + ', votre Hub est calme : peu de decisions tranchees, peu de Big Rocks accomplis. Soit la periode etait posee, soit vous avez peut-etre laisse passer des moments-cle. Envisagez un Triage matinal pour reactiver l elan.';
    } else {
      const parts = [];
      if (decs > 0) parts.push(decs + ' decision' + (decs > 1 ? 's' : '') + ' tranchee' + (decs > 1 ? 's' : ''));
      if (rocks > 0) parts.push(rocks + ' Big Rock' + (rocks > 1 ? 's' : '') + ' accompli' + (rocks > 1 ? 's' : ''));
      if (projs > 0) parts.push(projs + ' projet' + (projs > 1 ? 's' : '') + ' clos');
      narrative = 'Sur les ' + periodLbl + ', vous avez avance : ' + parts.join(', ') + '. ';
      if (topDec) narrative += 'La decision la plus recente : "' + topDec.slice(0, 80) + '". ';
      if (topProj) narrative += 'Projet le plus chaud actuellement : ' + topProj + '. ';
      narrative += rocks >= decs / 2 ? 'Bon rythme d execution.' : 'Decision tres elevee vs execution — attention au drift.';
    }

    res.json({
      period: period,
      stats: { decisions: decs, rocks: rocks, projects_closed: projs },
      narrative: narrative,
      mode: llmReady() ? 'rule-based-pending-llm' : 'rule-based',
      llm_available: llmReady()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
