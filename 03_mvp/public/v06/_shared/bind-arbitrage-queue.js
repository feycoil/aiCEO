/* bind-arbitrage-queue.js v3 — Affiche file emails compacte (repliee par defaut) */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'arbitrage') return;

  let queue = [];
  try { queue = JSON.parse(sessionStorage.getItem('aiCEO.arbitrage.queue') || '[]'); } catch(e) {}

  if (!Array.isArray(queue) || queue.length === 0) {
    return;
  }

  function renderQueue() {
    const main = document.querySelector('main, .app-main');
    if (!main) return;
    if (document.getElementById('aiceo-arb-queue')) return;

    const sec = document.createElement('section');
    sec.id = 'aiceo-arb-queue';
    sec.className = 'card';
    sec.style.cssText = 'padding:18px 22px;margin-bottom:20px';
    sec.innerHTML =
      '<header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0;gap:12px">' +
        '<div>' +
          '<h2 style="margin:0;font-size:15px;font-weight:600">\uD83D\uDCE7 ' + queue.length + ' propositions depuis vos emails</h2>' +
          '<p style="margin:2px 0 0;color:var(--text-3,#888);font-size:12px">Acceptez ou ignorez pour alimenter Actions / Decisions / Projets.</p>' +
        '</div>' +
        '<button type="button" id="aiceo-arb-toggle" class="btn ghost sm" style="font-size:11px" onclick="return window.aiceoArbToggleQueue && window.aiceoArbToggleQueue(event)">Deplier \u25BE</button>' +
      '</header>';

    const list = document.createElement('div');
    list.id = 'aiceo-arb-list';
    // Mode compact par defaut : liste repliee
    list.style.cssText = 'display:none;flex-direction:column;gap:6px;max-height:360px;overflow-y:auto;padding-right:4px;margin-top:12px';
    queue.forEach(function (item) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface,#faf8f3);border-radius:8px;font-size:13px';
      row.title = (item.excerpt || '').slice(0, 300);
      const kindColor = item.kind === 'decision' ? 'var(--rose-50,#fde6e3)' : item.kind === 'project' ? 'var(--emerald-50,#d6f3e6)' : 'var(--surface-3,#ebe7df)';
      row.innerHTML = [
        '<span style="background:' + kindColor + ';color:var(--text-2,#555);font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;text-transform:uppercase;flex-shrink:0;letter-spacing:0.04em">' + (item.kind || 'task') + '</span>',
        '<div style="flex:1;min-width:0">',
          '<div style="font-weight:500;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(item.title || '') + '</div>',
          item.from ? '<div style="font-size:11px;color:var(--text-3,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(item.from) + '</div>' : '',
        '</div>',
        '<div style="display:flex;gap:4px;flex-shrink:0">',
          '<button type="button" class="btn primary" style="font-size:11px;padding:4px 10px;height:auto" data-arb-accept="' + escapeHtml(item.id) + '" onclick="return window.aiceoArbAccept && window.aiceoArbAccept(event, \'' + escapeHtml(item.id) + '\')">Accepter</button>',
          '<button type="button" class="btn ghost" style="font-size:11px;padding:4px 8px;height:auto" data-arb-ignore="' + escapeHtml(item.id) + '" onclick="return window.aiceoArbIgnore && window.aiceoArbIgnore(event, \'' + escapeHtml(item.id) + '\')">\u00D7</button>',
        '</div>'
      ].join('');
      list.appendChild(row);
    });
    sec.appendChild(list);

    main.insertBefore(sec, main.firstChild);

    // Toggle bouton : gere via onclick inline + window.aiceoArbToggleQueue (defini en tete du fichier)

    // Bind accept / ignore
    sec.addEventListener('click', async function (e) {
      const acceptBtn = e.target.closest('[data-arb-accept]');
      const ignoreBtn = e.target.closest('[data-arb-ignore]');
      if (acceptBtn) {
        const id = acceptBtn.dataset.arbAccept;
        const item = queue.find(function (q) { return q.id === id; });
        if (!item) return;
        const endpoint = item.kind === 'project' ? '/api/projects' :
                        item.kind === 'decision' ? '/api/decisions' : '/api/tasks';
        const payload = item.kind === 'project' ? { name: item.title, description: item.excerpt } :
                       item.kind === 'decision' ? { title: item.title, context: item.excerpt } :
                       { title: item.title, description: item.excerpt, priority: item.proposed_priority || 'P1' };
        try {
          const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (r.ok) {
            const row = acceptBtn.closest('div[style*="surface"]');
            if (row) row.style.opacity = '0.4';
            acceptBtn.disabled = true;
            if (ignoreBtn) ignoreBtn.disabled = true;
            // v0.7 — auto-link email -> project si on vient de creer un projet
            if (item.kind === 'project' && item.source_id) {
              try {
                const created = await r.clone().json();
                const projId = created && created.project && created.project.id;
                if (projId) {
                  await fetch('/api/emails/' + encodeURIComponent(item.source_id) + '/link-project', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: projId })
                  });
                }
              } catch (e) { /* silent */ }
            }
            if (window.AICEOShell) window.AICEOShell.showToast('Ajoute', 'success');
          }
        } catch (err) {
          alert('Erreur : ' + err.message);
        }
      } else if (ignoreBtn) {
        const row = ignoreBtn.closest('div[style*="surface"]');
        if (row) row.style.display = 'none';
      }
    });
  }

  function escapeHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderQueue);
  else renderQueue();
})();
