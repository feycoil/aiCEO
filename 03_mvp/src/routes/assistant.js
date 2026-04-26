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

Style : direct, factuel, sans flatterie. Réponses concises (200 mots max sauf demande explicite). Cite des sources concrètes quand possible (issues GitHub, ADRs, fichiers du repo). Si tu ne sais pas, dis-le.`;

const MAX_TOKENS = 1500;

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
      // Streaming Claude réel
      const client = createAnthropicClient();
      const claudeMessages = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      try {
        const stream = await client.messages.stream({
          model,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT_ASSISTANT,
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

module.exports = router;
