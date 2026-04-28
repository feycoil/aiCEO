/* bind-assistant.js v5 (S6.8.1 - 28/04 PM late) — refactor complet
 * - Charge conversations + messages + contexte + effets propages depuis API
 * - Empty state propre quand pas de conversation
 * - Composer SSE streaming (deja ok dans v4)
 * - Bouton "Nouvelle conversation" + click sur conv pour switcher
 * - Title dynamique, sidebar contexte cablee dynamiquement
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'assistant') return;

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
  let llmAvailable = false;

  function formatRelativeDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var diffMs = Date.now() - d.getTime();
    var diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "a l'instant";
    if (diffMin < 60) return "il y a " + diffMin + " min";
    var diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return "il y a " + diffH + "h";
    var diffJ = Math.floor(diffH / 24);
    if (diffJ === 1) return "hier";
    if (diffJ < 7) return "il y a " + diffJ + "j";
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  // ─────────── Empty state quand pas de conversation
  function renderEmptyState() {
    var msgs = $('#as-thread-messages');
    if (!msgs) return;
    msgs.innerHTML = '<div class="aiceo-as-empty" style="text-align:center;padding:80px 24px;color:var(--text-3,#888);max-width:560px;margin:0 auto">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="color:var(--violet-800,#463a54);margin-bottom:18px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<h3 style="margin:0 0 10px;font-size:17px;font-weight:600;color:var(--text,#111);line-height:1.35">Demarrez une conversation</h3>' +
      '<p style="margin:0 0 24px;font-size:13px;line-height:1.5">L\'assistant repond avec votre contexte (decisions, taches, projets) et propage les effets dans votre base de connaissance.</p>' +
    '</div>';
    var ctx = $('#as-thread-context');
    if (ctx) ctx.style.display = 'none';
  }

  // ─────────── Title topbar dynamique
  function setTitle(text) {
    var t = $('#as-title');
    if (t) t.textContent = text || 'Assistant';
  }

  // ─────────── Sidebar conversations recentes
  async function loadConversations() {
    var data = await tryJson('/api/assistant/conversations?limit=20');
    var list = $('#as-conv-list');
    if (!list) return [];
    var convs = (data && data.conversations) || [];
    if (convs.length === 0) {
      list.innerHTML = '<li class="u-text-3 small" style="padding:10px;text-align:center">Aucune conversation pour le moment.</li>';
      return [];
    }
    list.innerHTML = convs.map(function (cv) {
      var isActive = cv.id === currentConvId;
      var when = formatRelativeDate(cv.updated_at || cv.created_at);
      var msgCount = cv.message_count || 0;
      return '<li>' +
        '<button class="as-conv ' + (isActive ? 'is-active' : '') + '" data-conv-id="' + escHtml(cv.id) + '" style="display:block;width:100%;text-align:left;padding:8px 10px;border-radius:8px;background:' + (isActive ? 'var(--surface-3,#f0eee9)' : 'transparent') + ';border:0;cursor:pointer;font-family:inherit">' +
          '<span class="as-conv-title" style="display:block;font-size:13px;font-weight:600;color:var(--text,#111);line-height:1.3">' + escHtml(cv.title || 'Sans titre') + '</span>' +
          '<span class="as-conv-meta" style="display:block;font-size:11px;color:var(--text-3,#888);margin-top:2px">' + when + (msgCount ? ' · ' + msgCount + ' msg' : '') + '</span>' +
        '</button>' +
      '</li>';
    }).join('');
    return convs;
  }

  // ─────────── Charge messages d'une conversation + bind contexte/effets
  async function loadConversation(id) {
    currentConvId = id;
    var data = await tryJson('/api/assistant/conversations/' + encodeURIComponent(id));
    if (!data) {
      renderEmptyState();
      return;
    }
    setTitle(data.title || data.conversation && data.conversation.title || 'Conversation');
    var msgs = (data.messages || []);
    var msgsEl = $('#as-thread-messages');
    if (msgsEl) {
      if (msgs.length === 0) {
        msgsEl.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-3,#888);font-size:13px">Posez votre premiere question.</div>';
      } else {
        msgsEl.innerHTML = msgs.map(renderMessage).join('');
      }
    }
    // Active la bonne conv dans la sidebar
    $$('.as-conv').forEach(function (b) { b.classList.remove('is-active'); });
    var btn = $('[data-conv-id="' + id + '"]');
    if (btn) {
      btn.classList.add('is-active');
      btn.style.background = 'var(--surface-3,#f0eee9)';
    }
    // Charge contexte + effets en parallele (best-effort, routes optionnelles)
    loadContext(id);
    loadEffects(id);
  }

  function renderMessage(m) {
    var role = m.role || 'assistant';
    var content = m.content || '';
    var when = m.ts || m.created_at;
    // S6.8.1 — outer shadow sur les bulles (vs inner sur le composer)
    var bubbleStyle = role === 'user'
      ? 'background:var(--violet-50,#ece7f0);align-self:flex-end;max-width:75%;margin-left:auto;border-radius:16px 16px 4px 16px;padding:12px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(70,58,84,0.08)'
      : 'background:var(--surface-2,#fff);align-self:flex-start;max-width:90%;border-radius:16px 16px 16px 4px;padding:12px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)';
    return '<article class="msg msg-' + role + '" style="display:flex;flex-direction:column;margin-bottom:14px">' +
      '<div class="msg-bubble" style="' + bubbleStyle + '">' +
        '<p style="margin:0;font-size:14px;line-height:1.55;color:var(--text,#111)">' + escHtml(content).replace(/\n/g, '<br>') + '</p>' +
      '</div>' +
      (when ? '<span class="msg-meta" style="font-size:11px;color:var(--text-3,#888);margin-top:4px;' + (role === 'user' ? 'align-self:flex-end' : 'align-self:flex-start') + '">' + formatRelativeDate(when) + '</span>' : '') +
    '</article>';
  }

  // ─────────── Sidebar contexte (best-effort, route optionnelle)
  async function loadContext(convId) {
    var ctxEl = $('#as-context-list');
    if (!ctxEl) return;
    var data = await tryJson('/api/assistant/conversations/' + encodeURIComponent(convId) + '/context');
    var items = (data && data.context) || [];
    if (items.length === 0) {
      ctxEl.innerHTML = '<li class="u-text-3 small" style="padding:8px;text-align:center">Aucun contexte attache pour le moment.</li>';
      return;
    }
    ctxEl.innerHTML = items.map(function (it) {
      var icon = it.kind === 'decision' ? 'i-target'
               : it.kind === 'knowledge' ? 'i-knowledge'
               : it.kind === 'contact' ? 'i-people'
               : 'i-folder';
      return '<li class="as-context-item" style="display:flex;gap:10px;align-items:flex-start;padding:8px 0">' +
        '<svg class="ico" width="14" height="14" style="color:var(--text-3,#888);flex-shrink:0;margin-top:2px"><use href="#' + icon + '"/></svg>' +
        '<div style="flex:1;min-width:0">' +
          '<span class="as-context-title" style="display:block;font-size:13px;font-weight:600;color:var(--text,#111)">' + escHtml(it.title || '') + '</span>' +
          '<span class="as-context-meta" style="display:block;font-size:11px;color:var(--text-3,#888)">' + escHtml(it.meta || '') + '</span>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  // ─────────── Sidebar effets propages (best-effort)
  async function loadEffects(convId) {
    var listEl = $('#as-effects-list');
    var countEl = $('#as-effects-count');
    if (!listEl) return;
    var data = await tryJson('/api/assistant/conversations/' + encodeURIComponent(convId) + '/effects');
    var effects = (data && data.effects) || [];
    if (countEl) countEl.textContent = effects.length === 0 ? '' : (effects.length + ' effet' + (effects.length > 1 ? 's' : '') + ' propage' + (effects.length > 1 ? 's' : ''));
    if (effects.length === 0) {
      listEl.innerHTML = '<li class="u-text-3 small" style="padding:8px;text-align:center">Aucun effet propage.</li>';
      return;
    }
    listEl.innerHTML = effects.map(function (e) {
      return '<li class="as-effect" style="display:flex;gap:10px;align-items:flex-start;padding:8px 0">' +
        '<span class="as-effect-marker" style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:var(--emerald-50,#d6f3e6);color:var(--emerald-800,#1e6e3a);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + escHtml(e.marker || '+') + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<span class="as-effect-title" style="display:block;font-size:13px;font-weight:600;color:var(--text,#111)">' + escHtml(e.title || '') + '</span>' +
          '<span class="as-effect-meta" style="display:block;font-size:11px;color:var(--text-3,#888)">' + escHtml(e.meta || '') + '</span>' +
        '</div>' +
        '<button class="as-effect-undo" data-effect-id="' + escHtml(e.id || '') + '" style="background:transparent;border:0;color:var(--rose-700,#9c2920);font-size:11px;cursor:pointer">Annuler</button>' +
      '</li>';
    }).join('');
  }

  // ─────────── Composer (envoi + SSE streaming)
  function appendStreamingMessage(role, initial) {
    var msgsEl = $('#as-thread-messages');
    if (!msgsEl) return null;
    // Si empty state present, le retirer
    var empty = msgsEl.querySelector('.aiceo-as-empty');
    if (empty) empty.remove();
    var article = document.createElement('article');
    article.className = 'msg msg-' + role;
    article.style.cssText = 'display:flex;flex-direction:column;margin-bottom:14px';
    var bubbleStyle = role === 'user'
      ? 'background:var(--violet-50,#ece7f0);align-self:flex-end;max-width:75%;margin-left:auto;border-radius:16px 16px 4px 16px;padding:12px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(70,58,84,0.08)'
      : 'background:var(--surface-2,#fff);align-self:flex-start;max-width:90%;border-radius:16px 16px 16px 4px;padding:12px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)';
    article.innerHTML = '<div class="msg-bubble" style="' + bubbleStyle + '"><p class="msg-content" style="margin:0;font-size:14px;line-height:1.55;color:var(--text,#111)">' + escHtml(initial || '') + '</p></div>';
    msgsEl.appendChild(article);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return article.querySelector('.msg-content');
  }

  async function sendMessage(content) {
    appendStreamingMessage('user', content);
    var contentDiv = appendStreamingMessage('assistant', '');
    var acc = '';
    try {
      var r = await fetch('/api/assistant/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'text/event-stream'},
        body: JSON.stringify({ conversation_id: currentConvId, content: content })
      });
      if (!r.ok) {
        if (contentDiv) contentDiv.innerHTML = '<em>Erreur serveur (' + r.status + ')</em>';
        return;
      }
      var reader = r.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      while (true) {
        var read = await reader.read();
        if (read.done) break;
        buf += decoder.decode(read.value, { stream: true });
        var events = buf.split('\n\n');
        buf = events.pop() || '';
        for (var i = 0; i < events.length; i++) {
          var lines = events[i].split('\n');
          var eventType = 'message';
          var dataStr = '';
          for (var j = 0; j < lines.length; j++) {
            if (lines[j].startsWith('event:')) eventType = lines[j].slice(6).trim();
            if (lines[j].startsWith('data:'))  dataStr  = lines[j].slice(5).trim();
          }
          if (!dataStr) continue;
          try {
            var data = JSON.parse(dataStr);
            if (eventType === 'text' && (data.text || data.delta)) {
              acc += (data.text || data.delta);
              if (contentDiv) contentDiv.innerHTML = escHtml(acc).replace(/\n/g, '<br>');
            }
            if (eventType === 'knowledge-created') {
              // S6.8.1 — pin_to_knowledge tool a cree un pin, on l'affiche inline dans le chat
              appendKnowledgeCard(data);
            }
            if (eventType === 'done') {
              if (data.conversation_id) currentConvId = data.conversation_id;
              loadConversations();
              loadContext(currentConvId);
              loadEffects(currentConvId);
            }
          } catch(e) {}
        }
      }
    } catch(e) {
      if (contentDiv) contentDiv.innerHTML = '<em>Connexion perdue : ' + escHtml(e.message) + '</em>';
    }
  }

  function bindComposer() {
    var input = $('#as-composer-input');
    var sendBtn = $('#as-send-btn');
    if (!input) return;
    var send = function () {
      var content = input.value.trim();
      if (!content) return;
      input.value = '';
      sendMessage(content);
    };
    if (sendBtn) sendBtn.addEventListener('click', function (e) { e.preventDefault(); send(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
    });
  }

  function bindHeaderButtons() {
    var newBtn = $('header.topbar .btn.primary');
    if (newBtn && !newBtn.dataset.asBound) {
      newBtn.dataset.asBound = '1';
      newBtn.addEventListener('click', function () {
        currentConvId = null;
        setTitle('Nouvelle conversation');
        renderEmptyState();
        $$('.as-conv').forEach(function (b) { b.classList.remove('is-active'); });
        var ctxEl = $('#as-context-list');
        if (ctxEl) ctxEl.innerHTML = '<li class="u-text-3 small" style="padding:8px;text-align:center">Aucun contexte pour le moment.</li>';
        var effEl = $('#as-effects-list');
        if (effEl) effEl.innerHTML = '<li class="u-text-3 small" style="padding:8px;text-align:center">Aucun effet propage.</li>';
        var input = $('#as-composer-input');
        if (input) input.focus();
      });
    }
    // Bouton Historique : pour l'instant rien, ferme/ouvre la sidebar (deja visible)
    var histBtn = $('header.topbar .btn.ghost');
    if (histBtn && !histBtn.dataset.asBound) {
      histBtn.dataset.asBound = '1';
      histBtn.addEventListener('click', showHistoryModal);
    }
  }

  // S6.8.1 — Pre-fill contexte selon ?context=<source>
  // Sources supportees : decision:<id>, coaching-posture, arbitrage:<id>
  async function applyContext(ctxStr) {
    currentConvId = null;
    setTitle('Nouvelle conversation');
    var msgsEl = $('#as-thread-messages');
    if (!msgsEl) return;

    var ctxBadge = '';
    var prefillMsg = '';
    var ctxItems = [];

    if (ctxStr.startsWith('decision:')) {
      var decId = ctxStr.slice('decision:'.length);
      var dec = await tryJson('/api/decisions/' + encodeURIComponent(decId));
      var d = (dec && (dec.decision || dec)) || null;
      if (d && d.title) {
        ctxBadge = 'Decision : ' + d.title;
        prefillMsg = "Aide-moi a trancher cette decision : \"" + d.title + "\".";
        if (d.context) prefillMsg += " Contexte : " + d.context.slice(0, 200);
        ctxItems.push({ kind: 'decision', title: d.title, meta: 'Statut : ' + (d.status || 'ouverte') });
      } else {
        ctxBadge = 'Decision (introuvable)';
      }
    } else if (ctxStr === 'coaching-posture') {
      ctxBadge = 'Coaching · Posture du moment';
      prefillMsg = "Aide-moi a discuter ma posture du moment. Qu'est-ce que tu observes dans mes decisions recentes et comment je peux ajuster ?";
      ctxItems.push({ kind: 'coaching', title: 'Posture du moment', meta: 'Lecture coaching basee sur 14j' });
    } else if (ctxStr.startsWith('arbitrage:')) {
      var aId = ctxStr.slice('arbitrage:'.length);
      ctxBadge = 'Arbitrage : ' + aId.slice(0, 8);
      prefillMsg = "Aide-moi sur l'arbitrage en cours.";
    } else {
      ctxBadge = 'Contexte : ' + ctxStr;
    }

    // Affiche un badge contexte au-dessus des messages
    var ctxEl = $('#as-thread-context');
    var ctxText = $('#as-thread-context-text');
    if (ctxEl) ctxEl.style.display = '';
    if (ctxText) ctxText.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;background:var(--violet-50,#ece7f0);color:var(--violet-800,#463a54);font-size:11px;font-weight:600"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.39 4.84L20 8l-4 3.91.94 5.5L12 14.77l-4.94 2.64L8 11.91 4 8l5.61-1.16z"/></svg>' + escHtml(ctxBadge) + '</span>';

    // Empty state mais avec sidebar visible
    msgsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-3,#888);font-size:13px">Demarrez la conversation. Le contexte sera transmis a l\'assistant.</div>';

    // Pre-fill sidebar contexte
    var ctxList = $('#as-context-list');
    if (ctxList && ctxItems.length > 0) {
      ctxList.innerHTML = ctxItems.map(function (it) {
        var icon = it.kind === 'decision' ? 'i-target' : it.kind === 'coaching' ? 'i-knowledge' : 'i-folder';
        return '<li class="as-context-item" style="display:flex;gap:10px;align-items:flex-start;padding:8px 0">' +
          '<svg class="ico" width="14" height="14" style="color:var(--text-3,#888);flex-shrink:0;margin-top:2px"><use href="#' + icon + '"/></svg>' +
          '<div style="flex:1;min-width:0">' +
            '<span style="display:block;font-size:13px;font-weight:600;color:var(--text,#111)">' + escHtml(it.title) + '</span>' +
            '<span style="display:block;font-size:11px;color:var(--text-3,#888)">' + escHtml(it.meta) + '</span>' +
          '</div>' +
        '</li>';
      }).join('');
    }

    // Pre-remplir le composer
    var input = $('#as-composer-input');
    if (input && prefillMsg) {
      input.value = prefillMsg;
      setTimeout(function () { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }, 100);
    }
  }

  function bindConvSelect() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.as-conv');
      if (!btn) return;
      var id = btn.dataset.convId;
      if (!id) return;
      loadConversation(id);
    });
  }

  // S6.8.1 — Card inline quand l'assistant epingle dans la connaissance
  function appendKnowledgeCard(data) {
    var msgsEl = $('#as-thread-messages');
    if (!msgsEl) return;
    var KIND_LABEL = { decision: 'Decision', criterion: 'Critere', principle: 'Principe', note: 'Note' };
    var KIND_COLOR = {
      decision: { bg: 'var(--rose-50,#fde6e3)', fg: 'var(--rose-700,#9c2920)' },
      criterion: { bg: 'var(--amber-50,#fef3c7)', fg: 'var(--amber-800,#92400e)' },
      principle: { bg: 'var(--emerald-50,#d6f3e6)', fg: 'var(--emerald-700,#115e3c)' },
      note: { bg: 'var(--surface-3,#ebe7df)', fg: 'var(--text-2,#555)' }
    };
    var kind = data.kind || 'note';
    var c = KIND_COLOR[kind] || KIND_COLOR.note;
    var label = KIND_LABEL[kind] || 'Note';
    var card = document.createElement('article');
    card.className = 'msg msg-knowledge';
    card.dataset.pinId = data.pin_id || '';
    card.style.cssText = 'display:flex;flex-direction:column;margin-bottom:14px;align-self:flex-start;max-width:90%;animation:aiceoKnPulse .4s ease-out';
    card.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--violet-800,#463a54);font-weight:600;margin-bottom:6px">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.39 4.84L20 8l-4 3.91.94 5.5L12 14.77l-4.94 2.64L8 11.91 4 8l5.61-1.16z"/></svg>',
        'Epingle dans Connaissance',
      '</div>',
      '<div style="background:var(--surface-2,#fff);border:1px solid var(--violet-50,#ece7f0);border-left:3px solid var(--violet-800,#463a54);border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:8px">',
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">',
          '<span style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + c.bg + ';color:' + c.fg + ';letter-spacing:.05em;text-transform:uppercase">' + label + '</span>',
          '<h4 style="margin:0;font-size:14px;font-weight:600;color:var(--text,#111);line-height:1.35;flex:1">' + escHtml(data.title || '(sans titre)') + '</h4>',
        '</div>',
        (data.content ? '<p style="margin:0;font-size:13px;color:var(--text-2,#555);line-height:1.5">' + escHtml(data.content) + '</p>' : ''),
        (data.reason ? '<p style="margin:0;font-size:11px;color:var(--text-3,#888);line-height:1.4;font-style:italic">' + escHtml(data.reason) + '</p>' : ''),
        '<div style="display:flex;gap:6px;margin-top:4px">',
          '<a href="connaissance.html" data-bound="1" style="font-size:11px;color:var(--accent,#e35a3a);text-decoration:none;cursor:pointer;padding:4px 8px;border-radius:6px;transition:background .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'">Voir dans Connaissance &rarr;</a>',
          '<button type="button" data-pin-undo="' + escHtml(data.pin_id || '') + '" data-bound="1" style="font-size:11px;color:var(--text-3,#888);background:transparent;border:0;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .15s" onmouseover="this.style.background=\'var(--rose-50,#fde6e3)\';this.style.color=\'var(--rose-700,#9c2920)\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--text-3,#888)\'">Annuler l\'epingle</button>',
        '</div>',
      '</div>'
    ].join('');
    msgsEl.appendChild(card);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    // Animation keyframes injectee une fois
    if (!document.getElementById('aiceo-kn-pulse-anim')) {
      var s = document.createElement('style');
      s.id = 'aiceo-kn-pulse-anim';
      s.textContent = '@keyframes aiceoKnPulse{0%{opacity:0;transform:translateY(8px)}50%{transform:translateY(-2px)}100%{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }
  }

  // Bind annulation epingle (delegation)
  function bindKnowledgeUndo() {
    var msgsEl = $('#as-thread-messages');
    if (!msgsEl || msgsEl.dataset.knUndoBound) return;
    msgsEl.dataset.knUndoBound = '1';
    msgsEl.addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-pin-undo]');
      if (!btn) return;
      var pinId = btn.dataset.pinUndo;
      if (!pinId) return;
      if (!confirm('Annuler cette epingle dans la base de connaissance ?')) return;
      var r = await fetch('/api/knowledge/' + encodeURIComponent(pinId), { method: 'DELETE' });
      if (r.ok) {
        var card = btn.closest('article.msg-knowledge');
        if (card) {
          card.style.transition = 'opacity .25s';
          card.style.opacity = '0.4';
          var note = document.createElement('div');
          note.style.cssText = 'font-size:11px;color:var(--text-3,#888);font-style:italic;padding:4px 0';
          note.textContent = '(epingle annulee)';
          card.appendChild(note);
        }
      }
    });
  }

  // S6.8.1 — Modal historique complet de toutes les conversations
  async function showHistoryModal() {
    var existing = $('.aiceo-as-history-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'aiceo-as-history-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,18,16,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;animation:aiceoFadeIn .2s';
    overlay.innerHTML = [
      '<div style="background:var(--surface-1,#fafaf7);border-radius:16px;padding:24px 28px;width:560px;max-width:92vw;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,0.18);animation:aiceoSlideUp .25s">',
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">',
          '<div>',
            '<h3 style="margin:0 0 4px;font-size:18px;font-weight:600;color:var(--text,#111)">Historique des conversations</h3>',
            '<p style="margin:0;font-size:12px;color:var(--text-3,#888)" id="as-history-count">Chargement...</p>',
          '</div>',
          '<button type="button" class="as-hist-close" data-bound="1" aria-label="Fermer" style="background:transparent;border:0;cursor:pointer;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3,#888);transition:all .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
        '</div>',
        '<input type="search" id="as-hist-search" data-bound="1" placeholder="Rechercher dans l\'historique..." style="padding:10px 14px;font-size:13px;border:1px solid var(--border,#eee);border-radius:8px;background:var(--surface-2,#fff);outline:none;font-family:inherit;margin-bottom:12px;transition:border-color .15s" onfocus="this.style.borderColor=\'var(--violet-800,#463a54)\'" onblur="this.style.borderColor=\'var(--border,#eee)\'">',
        '<ul id="as-hist-list" style="list-style:none;padding:0;margin:0;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:6px"></ul>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    if (!document.getElementById('aiceo-modal-anim')) {
      var s = document.createElement('style');
      s.id = 'aiceo-modal-anim';
      s.textContent = '@keyframes aiceoFadeIn{from{opacity:0}to{opacity:1}}@keyframes aiceoSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }

    function close() { overlay.remove(); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.as-hist-close').addEventListener('click', close);
    document.addEventListener('keydown', function escH(ev) { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escH); } });

    var data = await tryJson('/api/assistant/conversations?limit=200');
    var convs = (data && data.conversations) || [];
    var countEl = overlay.querySelector('#as-history-count');
    if (countEl) countEl.textContent = convs.length + ' conversation' + (convs.length > 1 ? 's' : '');

    var listEl = overlay.querySelector('#as-hist-list');
    function renderList(arr) {
      if (arr.length === 0) {
        listEl.innerHTML = '<li style="padding:32px;text-align:center;color:var(--text-3,#888);font-size:13px">Aucune conversation.</li>';
        return;
      }
      listEl.innerHTML = arr.map(function (cv) {
        var when = formatRelativeDate(cv.updated_at || cv.created_at);
        return '<li><button class="as-hist-item" data-bound="1" data-conv-id="' + escHtml(cv.id) + '" style="display:flex;flex-direction:column;width:100%;padding:10px 12px;border:0;border-radius:8px;background:transparent;text-align:left;cursor:pointer;transition:background .15s;font-family:inherit" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'">' +
          '<span style="font-size:13px;font-weight:600;color:var(--text,#111);line-height:1.3;margin-bottom:2px">' + escHtml(cv.title || 'Sans titre') + '</span>' +
          '<span style="font-size:11px;color:var(--text-3,#888)">' + when + '</span>' +
        '</button></li>';
      }).join('');
    }
    renderList(convs);

    overlay.querySelector('#as-hist-search').addEventListener('input', function (ev) {
      var q = ev.target.value.trim().toLowerCase();
      if (!q) renderList(convs);
      else renderList(convs.filter(function (c) { return (c.title || '').toLowerCase().includes(q); }));
    });

    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.as-hist-item');
      if (!btn) return;
      var id = btn.dataset.convId;
      close();
      loadConversation(id);
    });
  }

  // v0.7 — bandeau mode LLM (live ou rule-based fallback)
  async function showLlmStatus() {
    var s = await tryJson('/api/assistant/llm-status');
    if (!s) return;
    llmAvailable = !!s.available;
    var main = $('main, .app-main');
    if (!main) return;
    if (document.getElementById('aiceo-llm-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'aiceo-llm-banner';
    if (llmAvailable) {
      banner.style.cssText = 'padding:8px 14px;background:var(--emerald-50,#d6f3e6);color:var(--emerald-700,#115e3c);border-radius:8px;font-size:12px;margin-bottom:12px;display:flex;align-items:center;gap:8px';
      banner.innerHTML = '<span style="font-weight:700">&#9679; Claude live</span> &mdash; chat streaming actif via Anthropic API.';
    } else {
      banner.style.cssText = 'padding:8px 14px;background:var(--amber-50,#fef3c7);color:var(--amber-800,#92400e);border-radius:8px;font-size:12px;margin-bottom:12px;display:flex;align-items:center;gap:8px';
      banner.innerHTML = '<span style="font-weight:700">&#9675; Mode degrade</span> &mdash; ANTHROPIC_API_KEY absente. Reponses heuristiques rule-based.';
    }
    main.insertBefore(banner, main.firstChild);
  }

  async function init() {
    setTitle('Assistant');
    renderEmptyState();
    await Promise.all([loadConversations(), showLlmStatus()]);

    // S6.8.1 — Lecture des query params : ?conv=<id> OU ?context=<source>
    var urlParams = new URLSearchParams(window.location.search);
    var requestedConvId = urlParams.get('conv');
    var requestedContext = urlParams.get('context');

    if (requestedConvId) {
      await loadConversation(requestedConvId);
    } else if (requestedContext) {
      // Nouvelle conversation avec contexte pre-fill
      await applyContext(requestedContext);
    } else {
      // Sinon : charge la conv la plus recente automatiquement (si existe)
      var convs = await tryJson('/api/assistant/conversations?limit=1');
      if (convs && convs.conversations && convs.conversations.length > 0) {
        await loadConversation(convs.conversations[0].id);
      }
    }
    bindComposer();
    bindHeaderButtons();
    bindConvSelect();
    bindKnowledgeUndo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
