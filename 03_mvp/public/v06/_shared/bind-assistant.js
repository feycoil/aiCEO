/* bind-assistant.js v3 — chat IA streaming SSE */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  async function tryJson(url, opts){
    try {
      const r = await fetch(url, Object.assign({headers:{Accept:'application/json'}}, opts||{}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch(e) { return null; }
  }

  let currentConvId = null;

  // Charge la liste des conversations
  async function loadConversations() {
    const data = await tryJson('/api/assistant/conversations?limit=10');
    if (!data || !data.conversations) return;
    const list = $('.as-conv-list');
    if (!list || data.conversations.length === 0) return;
    list.innerHTML = data.conversations.map(c => {
      const isActive = c.id === currentConvId;
      const updated = c.updated_at ? new Date(c.updated_at).toLocaleDateString('fr-FR') : '';
      return [
        '<button class="as-conv ' + (isActive?'is-active':'') + '" data-conv-id="' + escHtml(c.id) + '">',
          '<div class="as-conv-title">' + escHtml(c.title || 'Sans titre') + '</div>',
          '<div class="as-conv-meta">' + updated + '</div>',
        '</button>'
      ].join('');
    }).join('');
  }

  // Append un message dans la zone messages
  function appendMessage(role, content) {
    const list = $('.msg-list, .as-messages');
    if (!list) return;
    const msg = document.createElement('div');
    msg.className = 'msg msg-' + role;
    msg.style.cssText = 'padding:12px 16px;margin-bottom:8px;border-radius:12px;' +
      (role === 'user' ? 'background:var(--brand-50,#f0f0f0);align-self:flex-end' : 'background:var(--surface-2,#fff);border:1px solid var(--border)');
    msg.innerHTML = '<div class="msg-content">' + escHtml(content).replace(/\n/g, '<br>') + '</div>';
    list.appendChild(msg);
    list.scrollTop = list.scrollHeight;
    return msg;
  }

  // Envoie un message et stream la réponse SSE
  async function sendMessage(content) {
    appendMessage('user', content);
    const assistantMsg = appendMessage('assistant', '');
    const contentDiv = assistantMsg.querySelector('.msg-content');
    let acc = '';

    try {
      const r = await fetch('/api/assistant/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'text/event-stream'},
        body: JSON.stringify({ conversation_id: currentConvId, content })
      });
      if (!r.ok) {
        contentDiv.innerHTML = '<em>Erreur serveur (' + r.status + ')</em>';
        return;
      }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        // Parse SSE events séparés par \n\n
        const events = buf.split('\n\n');
        buf = events.pop() || '';
        for (const evt of events) {
          const lines = evt.split('\n');
          let eventType = 'message';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            if (line.startsWith('data:'))  dataStr  = line.slice(5).trim();
          }
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            if (eventType === 'text' && data.delta) {
              acc += data.delta;
              contentDiv.innerHTML = escHtml(acc).replace(/\n/g, '<br>');
            }
            if (eventType === 'done') {
              if (data.conversation_id) currentConvId = data.conversation_id;
              loadConversations();
            }
          } catch(e) {}
        }
      }
    } catch(e) {
      contentDiv.innerHTML = '<em>Connexion perdue : ' + escHtml(e.message) + '</em>';
    }
  }

  function bindComposer() {
    const composer = $('.as-composer');
    if (!composer) return;
    const input = composer.querySelector('textarea');
    const sendBtn = composer.querySelector('.btn.primary, button[type="submit"]');
    if (!input) return;

    const send = () => {
      const content = input.value.trim();
      if (!content) return;
      input.value = '';
      sendMessage(content);
    };

    if (sendBtn) sendBtn.addEventListener('click', (e) => { e.preventDefault(); send(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
    });
  }

  function bindConvSelect() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.as-conv');
      if (!btn) return;
      const id = btn.dataset.convId;
      if (!id) return;
      currentConvId = id;
      $$('.as-conv').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      // Charger les messages
      const data = await tryJson('/api/assistant/conversations/' + encodeURIComponent(id));
      if (data && data.messages) {
        const list = $('.msg-list, .as-messages');
        if (list) {
          list.innerHTML = '';
          data.messages.forEach(m => appendMessage(m.role, m.content));
        }
      }
    });
  }

  async function init() {
    await loadConversations();
    bindComposer();
    bindConvSelect();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
