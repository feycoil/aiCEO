// assistant-store.js — chat live SSE v07 (S6.22 Lot 11 + S6.31 markdown)
// Refonte complete : sidebar fils + zone chat + streaming SSE via fetch+ReadableStream

import { mdToHtml } from '../shared/markdown-mini.js';

const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime = ts => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  } catch (e) { return ''; }
};

const state = {
  conversations: [],
  activeConvId: null,
  messages: [],
  streaming: false,
  contextFromUrl: null  // si arrive via assistant.html?context=decision:UUID
};

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { console.warn('[assistant] fetch fail', url, e); return null; }
}

// === SIDEBAR : liste des fils ===
async function loadConvs() {
  const data = await safeFetch('/api/assistant/conversations');
  state.conversations = (data?.conversations || data || []).slice().sort((a,b) => {
    const da = a.updated_at || a.created_at || '';
    const db = b.updated_at || b.created_at || '';
    return db.localeCompare(da);
  });
  renderConvList();
}

function renderConvList() {
  const host = document.querySelector('[data-region="as-conv-list"]');
  const count = document.querySelector('[data-region="as-conv-count"]');
  if (!host) return;
  if (count) count.textContent = state.conversations.length ? `Fils (${state.conversations.length})` : 'Fils';

  if (!state.conversations.length) {
    host.innerHTML = '<div class="as-sidebar-empty">Aucun fil. Posez une question pour creer le premier.</div>';
    return;
  }

  host.innerHTML = state.conversations.map(c => `
    <div class="as-conv-item ${c.id === state.activeConvId ? 'is-active' : ''}" data-conv-id="${escHtml(c.id)}">
      <div class="as-conv-title">${escHtml(c.title || 'Sans titre')}</div>
      <div class="as-conv-meta">${escHtml(fmtTime(c.updated_at || c.created_at))}</div>
    </div>
  `).join('');

  host.querySelectorAll('[data-conv-id]').forEach(el => {
    el.addEventListener('click', () => selectConv(el.dataset.convId));
  });
}

// === Selectionner un fil ===
async function selectConv(id) {
  state.activeConvId = id;
  state.messages = [];
  renderConvList();

  const titleEl = document.querySelector('[data-region="as-chat-title"]');
  const conv = state.conversations.find(c => c.id === id);
  if (titleEl) titleEl.textContent = conv?.title || 'Conversation';

  const data = await safeFetch(`/api/assistant/conversations/${id}`);
  if (!data) {
    setStatus('Erreur chargement fil', 'error');
    return;
  }
  state.messages = data.messages || data.conversation?.messages || [];
  renderMessages();
  setStatus('pret');
}

// === Render bulles messages ===
function renderMessages() {
  const host = document.querySelector('[data-region="as-messages"]');
  if (!host) return;

  if (!state.messages.length && !state.streaming) {
    host.innerHTML = `
      <div class="as-empty">
        <svg class="as-empty-icon"><use href="#i-sparkle"/></svg>
        <p><strong>Cette conversation est vide</strong></p>
        <p style="font-size:12px">Posez votre question ci-dessous.</p>
      </div>
    `;
    return;
  }

  host.innerHTML = state.messages.map(m => `
    <div class="as-bubble ${m.role === 'user' ? 'user' : 'assistant'}" data-msg-id="${escHtml(m.id || '')}">
      ${m.role === 'assistant' ? mdToHtml(m.content || '') : escHtml(m.content || '')}
      ${m.ts ? `<div class="as-bubble-meta">${escHtml(fmtTime(m.ts))}</div>` : ''}
    </div>
  `).join('');

  // Scroll to bottom
  host.scrollTop = host.scrollHeight;
}

// === Status indicator ===
function setStatus(text, kind) {
  const el = document.querySelector('[data-region="as-chat-status"]');
  if (!el) return;
  el.textContent = text;
  el.className = 'as-chat-status' + (kind === 'streaming' ? ' is-streaming' : '') + (kind === 'error' ? ' is-error' : '');
}

// === Envoyer un message (avec streaming SSE) ===
async function sendMessage(content) {
  if (!content || state.streaming) return;
  state.streaming = true;
  setStatus('Envoi...', 'streaming');

  // 1. Append user message immediatement
  state.messages.push({ role: 'user', content, ts: new Date().toISOString() });
  renderMessages();

  // 2. Bulle assistant vide qui va recevoir le stream
  const assistantMsg = { role: 'assistant', content: '', ts: new Date().toISOString(), streaming: true };
  state.messages.push(assistantMsg);
  renderStreamingBubble(assistantMsg);

  // 3. POST /api/assistant/messages (SSE stream)
  let convCreated = null;
  try {
    const r = await fetch('/api/assistant/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({
        content,
        conversation_id: state.activeConvId || undefined
      })
    });

    if (!r.ok) throw new Error('HTTP ' + r.status);

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    setStatus('Claude reflechit...', 'streaming');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Parse SSE chunks (separes par \n\n)
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        const lines = chunk.split('\n');
        let event = null, data = null;
        for (const line of lines) {
          if (line.startsWith('event: ')) event = line.slice(7).trim();
          else if (line.startsWith('data: ')) data = line.slice(6);
        }
        if (!data) continue;

        // event: conversation -> persiste convId
        if (event === 'conversation') {
          try {
            const parsed = JSON.parse(data);
            convCreated = parsed.id;
            if (!state.activeConvId) state.activeConvId = parsed.id;
          } catch (e) {}
          continue;
        }

        // event: done -> fin de stream
        if (event === 'done' || event === 'end') {
          break;
        }

        // Anthropic chunk : text delta
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.delta?.text || parsed.text || parsed.content || '';
          if (delta) {
            assistantMsg.content += delta;
            updateStreamingBubble(assistantMsg);
          }
        } catch (e) {
          // Format inattendu, append raw
          if (data && data !== '[DONE]') {
            assistantMsg.content += data;
            updateStreamingBubble(assistantMsg);
          }
        }
      }
    }

    assistantMsg.streaming = false;
    setStatus('pret');

    // Recharge sidebar (nouvelle conversation creee ou updated_at maj)
    await loadConvs();
    if (convCreated && !state.activeConvId) {
      state.activeConvId = convCreated;
      renderConvList();
    }
  } catch (e) {
    console.error('[assistant] send failed', e);
    assistantMsg.content = (assistantMsg.content || '') + '\n\n[Erreur : ' + e.message + ']';
    assistantMsg.streaming = false;
    setStatus('Erreur', 'error');
  } finally {
    state.streaming = false;
    renderMessages();
  }
}

function renderStreamingBubble(msg) {
  const host = document.querySelector('[data-region="as-messages"]');
  if (!host) return;
  // Si empty state present, le retirer
  const empty = host.querySelector('.as-empty');
  if (empty) empty.remove();

  const div = document.createElement('div');
  div.className = 'as-bubble assistant is-streaming';
  div.dataset.streaming = '1';
  div.textContent = '';
  host.appendChild(div);
  host.scrollTop = host.scrollHeight;
}

function updateStreamingBubble(msg) {
  const host = document.querySelector('[data-region="as-messages"]');
  if (!host) return;
  const div = host.querySelector('.as-bubble.assistant.is-streaming');
  if (div) {
    // S6.31 : markdown rendu live pendant streaming
    div.innerHTML = mdToHtml(msg.content);
    host.scrollTop = host.scrollHeight;
  }
}

// === Nouveau fil ===
function newThread() {
  state.activeConvId = null;
  state.messages = [];
  renderConvList();
  renderMessages();
  const titleEl = document.querySelector('[data-region="as-chat-title"]');
  if (titleEl) titleEl.textContent = 'Nouvelle conversation';
  setStatus('pret');
  document.querySelector('[data-region="as-composer-input"]')?.focus();
}

// === Capture du context URL (?context=decision:UUID) ===
function captureUrlContext() {
  const params = new URLSearchParams(window.location.search);
  const ctx = params.get('context');
  if (!ctx) return null;
  state.contextFromUrl = ctx;
  // Pre-remplit le composer avec une question contextuelle
  const input = document.querySelector('[data-region="as-composer-input"]');
  if (input && ctx.startsWith('decision:')) {
    input.value = 'Aide-moi a trancher cette decision (id: ' + ctx.split(':')[1] + ')';
    input.focus();
  }
}

// === Composer events ===
function bindComposer() {
  const form = document.querySelector('[data-region="as-composer-form"]');
  const input = document.querySelector('[data-region="as-composer-input"]');
  const sendBtn = document.querySelector('[data-region="as-composer-send"]');
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    sendMessage(content);
  });

  // Ctrl+Entree / Cmd+Entree pour envoyer
  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
}

// === Init ===
document.addEventListener('DOMContentLoaded', async () => {
  bindComposer();
  document.querySelector('[data-action="new-thread"]')?.addEventListener('click', newThread);
  await loadConvs();
  captureUrlContext();
  console.info('[assistant] chat v07 ready', { convs: state.conversations.length });
});
