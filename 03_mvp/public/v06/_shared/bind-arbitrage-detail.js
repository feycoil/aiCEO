/* bind-arbitrage-detail.js v1 (S6.8.2) — Modal detail arbitrage avec 5 verdicts Eisenhower
 * Click sur un item de la file -> ouvre modal avec :
 *   - Email contenu complet
 *   - Suggestion aiCEO (LLM via /api/arbitrage/suggest-action)
 *   - 5 boutons verdict : Faire / Deleguer / Decaler / Archiver / Decliner
 *   - Raccourcis clavier 1-5 + ESC
 * Ne touche pas au focus mode existant. Ajout side-by-side.
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'arbitrage') return;

  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  async function tryJson(url, opts) {
    try {
      var r = await fetch(url, Object.assign({ headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }, opts || {}));
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  // Map verdict -> color + endpoint to call when accepted
  var VERDICT_MAP = {
    faire: { lbl: 'Faire', shortcut: '1', color: '#0a7d3e', bg: 'var(--emerald-50,#d6f3e6)', desc: 'Action immediate ou cette semaine' },
    deleguer: { lbl: 'Deleguer', shortcut: '2', color: '#5b3eaa', bg: 'var(--violet-50,#ece7f0)', desc: 'Un membre de l\'equipe peut traiter' },
    decaler: { lbl: 'Decaler', shortcut: '3', color: '#92400e', bg: 'var(--amber-50,#fef3c7)', desc: 'Pas urgent, reporter plus tard' },
    archiver: { lbl: 'Archiver', shortcut: '4', color: '#555', bg: 'var(--surface-3,#ebe7df)', desc: 'Reference, aucune action requise' },
    decliner: { lbl: 'Decliner', shortcut: '5', color: '#9c2920', bg: 'var(--rose-50,#fde6e3)', desc: 'Refus, ne pas donner suite' }
  };

  function buildModal(item, suggestion) {
    var existing = document.querySelector('.aiceo-arb-modal-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'aiceo-arb-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,18,16,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;animation:aiceoFadeIn .2s';

    var verdictsHtml = Object.keys(VERDICT_MAP).map(function (key) {
      var v = VERDICT_MAP[key];
      var isSuggested = suggestion && suggestion.verdict === key;
      return '<button type="button" data-bound="1" data-verdict="' + key + '" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 16px;background:' + (isSuggested ? v.bg : 'var(--surface-2,#fff)') + ';border:' + (isSuggested ? '2px solid ' + v.color : '1px solid var(--border,#eee)') + ';border-radius:10px;cursor:pointer;flex:1;min-width:140px;transition:all .15s;font-family:inherit;text-align:left" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.08)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'">' +
        '<div style="display:flex;align-items:center;gap:8px;width:100%"><span style="font-size:11px;font-weight:700;color:' + v.color + ';letter-spacing:.04em;text-transform:uppercase;flex:1">' + v.lbl + '</span><span style="background:var(--surface-3,#ebe7df);color:var(--text-2,#555);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;font-family:monospace">' + v.shortcut + '</span></div>' +
        '<span style="font-size:11px;color:var(--text-3,#888);font-weight:400;line-height:1.3">' + escHtml(v.desc) + '</span>' +
        (isSuggested ? '<span style="font-size:9px;font-weight:700;color:' + v.color + ';margin-top:2px;letter-spacing:.05em;text-transform:uppercase">aiCEO suggere</span>' : '') +
      '</button>';
    }).join('');

    var suggestionHtml = '';
    if (suggestion) {
      var v = VERDICT_MAP[suggestion.verdict] || VERDICT_MAP.faire;
      var conf = Math.round((suggestion.confidence || 0.6) * 100);
      var src = suggestion.source === 'llm' ? 'Claude' : 'rule-based';
      suggestionHtml = '<div style="margin-bottom:18px;padding:14px 16px;background:var(--violet-50,#ece7f0);border-left:3px solid var(--violet-800,#463a54);border-radius:8px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:11px;font-weight:700;color:var(--violet-800,#463a54);letter-spacing:.04em;text-transform:uppercase">+ Suggestion aiCEO</span><span style="font-size:10px;color:var(--text-3,#888)">confiance ' + conf + '% · ' + src + '</span></div>' +
        '<div style="font-size:14px;font-weight:600;color:var(--text,#111);line-height:1.4;margin-bottom:4px">Verdict suggere : <span style="color:' + v.color + '">' + v.lbl + '</span>' + (suggestion.suggested_delegate ? ' &rarr; ' + escHtml(suggestion.suggested_delegate) : '') + (suggestion.suggested_schedule ? ' (' + escHtml(suggestion.suggested_schedule) + ')' : '') + '</div>' +
        (suggestion.reason ? '<p style="margin:0;font-size:13px;color:var(--text-2,#555);line-height:1.5">' + escHtml(suggestion.reason) + '</p>' : '') +
      '</div>';
    }

    overlay.innerHTML = [
      '<div style="background:var(--surface-1,#fafaf7);border-radius:16px;width:720px;max-width:94vw;max-height:90vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.18);animation:aiceoSlideUp .25s">',
        '<div style="position:sticky;top:0;background:var(--surface-1,#fafaf7);padding:24px 28px 12px;border-bottom:1px solid var(--border,#eee);z-index:1">',
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">',
            '<div style="flex:1">',
              '<div style="font-size:11px;color:var(--text-3,#888);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Mail entrant · ' + escHtml(item.from || '') + '</div>',
              '<h2 style="margin:0;font-size:18px;font-weight:600;color:var(--text,#111);line-height:1.35">' + escHtml(item.title || '(sans objet)') + '</h2>',
            '</div>',
            '<button type="button" class="arb-modal-close" data-bound="1" style="background:transparent;border:0;cursor:pointer;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3,#888);transition:all .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
          '</div>',
        '</div>',
        '<div style="padding:18px 28px 28px">',
          (item.excerpt ? '<div style="margin-bottom:18px;padding:14px 16px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:10px;font-size:13px;color:var(--text-2,#555);line-height:1.55;white-space:pre-line">' + escHtml(item.excerpt) + '</div>' : ''),
          suggestionHtml,
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-3,#888);margin-bottom:10px">Verdict en un geste &middot; ou clavier 1-5</div>',
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + verdictsHtml + '</div>',
          '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border,#f0eee9);display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-3,#888)">',
            '<span>&uarr; &darr; naviguer &middot; ESC fermer</span>',
            '<button type="button" class="arb-modal-skip" data-bound="1" style="background:transparent;border:0;color:var(--text-3,#888);font-size:12px;cursor:pointer;padding:4px 8px">Passer pour l\'instant</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    if (!document.getElementById('aiceo-arb-modal-anim')) {
      var style = document.createElement('style');
      style.id = 'aiceo-arb-modal-anim';
      style.textContent = '@keyframes aiceoFadeIn{from{opacity:0}to{opacity:1}}@keyframes aiceoSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(style);
    }
    return overlay;
  }

  async function applyVerdict(item, verdict) {
    // Map verdict -> action serveur
    if (verdict === 'faire') {
      return fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: item.title, description: item.excerpt, priority: item.proposed_priority || 'P1' }) });
    }
    if (verdict === 'deleguer') {
      var who = prompt('Deleguer a qui ? (ex: Lamiae)') || 'equipe';
      return fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: '[Delegation a ' + who + '] ' + item.title, description: item.excerpt, priority: 'P1' }) });
    }
    if (verdict === 'decaler') {
      return fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: '[Reporte] ' + item.title, description: item.excerpt, priority: 'P2' }) });
    }
    if (verdict === 'archiver') {
      // Just close, no action
      return Promise.resolve({ ok: true });
    }
    if (verdict === 'decliner') {
      // Could mark email as declined in future; for now just close
      return Promise.resolve({ ok: true });
    }
  }

  async function openDetail(itemId, queue) {
    var item = queue.find(function (q) { return q.id === itemId; });
    if (!item) return;
    var overlay = buildModal(item, null);
    function close() {
      overlay.remove();
      document.removeEventListener('keydown', keyHandler);
    }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.arb-modal-close').addEventListener('click', close);
    overlay.querySelector('.arb-modal-skip').addEventListener('click', close);

    // Bind verdict buttons
    overlay.addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-verdict]');
      if (!btn) return;
      var verdict = btn.dataset.verdict;
      btn.disabled = true;
      btn.style.opacity = '0.6';
      try {
        await applyVerdict(item, verdict);
        // Marker la row dans la file comme traitee
        var row = document.querySelector('[data-arb-accept="' + item.id + '"]');
        if (row) {
          var parentRow = row.closest('div[style*="surface"]') || row.closest('.arb-queue-item');
          if (parentRow) parentRow.style.opacity = '0.4';
        }
        if (window.AICEOShell) window.AICEOShell.showToast('Verdict ' + VERDICT_MAP[verdict].lbl + ' applique', 'success');
        close();
      } catch (err) {
        alert('Erreur : ' + err.message);
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    });

    // Raccourcis clavier 1-5 + ESC
    function keyHandler(ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
      var verdictByShortcut = { '1': 'faire', '2': 'deleguer', '3': 'decaler', '4': 'archiver', '5': 'decliner' };
      var v = verdictByShortcut[ev.key];
      if (v) {
        ev.preventDefault();
        var btn = overlay.querySelector('[data-verdict="' + v + '"]');
        if (btn && !btn.disabled) btn.click();
      }
    }
    document.addEventListener('keydown', keyHandler);

    // Charge la suggestion aiCEO async
    var suggestion = await tryJson('/api/arbitrage/suggest-action', {
      method: 'POST',
      body: JSON.stringify({ email_id: item.source_id })
    });
    if (suggestion && !suggestion.error) {
      // Re-build modal with suggestion populated
      overlay.remove();
      document.removeEventListener('keydown', keyHandler);
      var overlay2 = buildModal(item, suggestion);
      function close2() {
        overlay2.remove();
        document.removeEventListener('keydown', keyHandler2);
      }
      overlay2.addEventListener('click', function (e) { if (e.target === overlay2) close2(); });
      overlay2.querySelector('.arb-modal-close').addEventListener('click', close2);
      overlay2.querySelector('.arb-modal-skip').addEventListener('click', close2);
      overlay2.addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-verdict]');
        if (!btn) return;
        var verdict = btn.dataset.verdict;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        try {
          await applyVerdict(item, verdict);
          var row = document.querySelector('[data-arb-accept="' + item.id + '"]');
          if (row) {
            var parentRow = row.closest('div[style*="surface"]');
            if (parentRow) parentRow.style.opacity = '0.4';
          }
          if (window.AICEOShell) window.AICEOShell.showToast('Verdict ' + VERDICT_MAP[verdict].lbl + ' applique', 'success');
          close2();
        } catch (err) {
          alert('Erreur : ' + err.message);
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      });
      function keyHandler2(ev) {
        if (ev.key === 'Escape') { ev.preventDefault(); close2(); return; }
        var verdictByShortcut = { '1': 'faire', '2': 'deleguer', '3': 'decaler', '4': 'archiver', '5': 'decliner' };
        var v = verdictByShortcut[ev.key];
        if (v) {
          ev.preventDefault();
          var btn = overlay2.querySelector('[data-verdict="' + v + '"]');
          if (btn && !btn.disabled) btn.click();
        }
      }
      document.addEventListener('keydown', keyHandler2);
    }
  }

  // Bind click sur les rows de la file d'arbitrage
  function bindRowClicks() {
    document.addEventListener('click', function (e) {
      // Si click sur un row item (mais pas sur les boutons accept/ignore/cycle)
      if (e.target.closest('[data-arb-accept], [data-arb-ignore], [data-arb-cycle]')) return;
      var row = e.target.closest('[title]');
      if (!row) return;
      // Check si on est dans l'arbitrage queue section
      var section = row.closest('section, .arb-queue, [data-arbitrage-queue]');
      if (!section) return;
      var titleAttr = row.getAttribute('title');
      if (!titleAttr) return;
      // Find the item in window queue (set by bind-arbitrage-queue.js)
      if (!window.aiceoArbQueue) return;
      var matching = window.aiceoArbQueue.filter(function (q) { return (q.excerpt || '').slice(0, 300) === titleAttr; });
      if (matching.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      openDetail(matching[0].id, window.aiceoArbQueue);
    }, true);
  }

  bindRowClicks();
})();
