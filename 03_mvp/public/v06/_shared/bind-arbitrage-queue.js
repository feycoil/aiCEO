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
          '<p style="margin:2px 0 0;color:var(--text-3,#888);font-size:12px">Acceptez ou ignorez pour alimenter Actions / Decisions / Projets. <span data-arb-queue-counter data-processed="0" data-total="' + queue.length + '" style="margin-left:10px;padding:2px 8px;background:var(--surface-3,#ebe7df);border-radius:99px;font-size:11px;font-weight:600;color:var(--text-2,#555)">0/' + queue.length + ' traitees</span></p>' +
        '</div>' +
        '<button type="button" id="aiceo-arb-toggle" class="btn ghost sm" style="font-size:11px" onclick="return window.aiceoArbToggleQueue && window.aiceoArbToggleQueue(event)">Deplier \u25BE</button>' +
      '</header>';

    const list = document.createElement('div');
    list.id = 'aiceo-arb-list';
    // Mode compact par defaut : liste repliee
    list.style.cssText = 'display:none;flex-direction:column;gap:6px;max-height:360px;overflow-y:auto;padding-right:4px;margin-top:12px';
    // S6.8.2 — expose queue pour bind-arbitrage-detail.js
    window.aiceoArbQueue = queue;
    queue.forEach(function (item) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface,#faf8f3);border-radius:8px;font-size:13px';
      row.title = (item.excerpt || '').slice(0, 300);
      const kindColor = item.kind === 'decision' ? 'var(--rose-50,#fde6e3)' : item.kind === 'project' ? 'var(--emerald-50,#d6f3e6)' : 'var(--surface-3,#ebe7df)';
      // S6.8.1 — Restauration du flow original : badge kind PROPOSE par le serveur (heuristique kindFor)
      // + bouton Accepter unique qui respecte item.kind. User peut cliquer le badge pour
      // cycler entre task/decision/project si l'heuristique serveur s'est trompee.
      var kindLabels = { task: 'Tache', decision: 'Decision', project: 'Projet' };
      var kindColors = {
        task:     { bg: 'var(--surface-3,#ebe7df)', fg: 'var(--text-2,#555)' },
        decision: { bg: 'var(--rose-50,#fde6e3)', fg: 'var(--rose-700,#9c2920)' },
        project:  { bg: 'var(--emerald-50,#d6f3e6)', fg: 'var(--emerald-700,#115e3c)' }
      };
      var k = item.kind || 'task';
      var kc = kindColors[k] || kindColors.task;
      row.innerHTML = [
        '<button type="button" data-bound="1" data-arb-cycle="' + escapeHtml(item.id) + '" title="Cliquer pour changer le type" style="background:' + kc.bg + ';color:' + kc.fg + ';font-size:9px;font-weight:700;padding:4px 9px;border-radius:99px;border:0;text-transform:uppercase;flex-shrink:0;letter-spacing:0.04em;cursor:pointer;font-family:inherit;transition:all .15s" onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'">' + (kindLabels[k] || k) + '</button>',
        '<div style="flex:1;min-width:0">',
          '<div style="font-weight:500;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(item.title || '') + '</div>',
          item.from ? '<div style="font-size:11px;color:var(--text-3,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(item.from) + (item.inferred_project ? ' · ' + escapeHtml(item.inferred_project) : '') + '</div>' : '',
        '</div>',
        '<div style="display:flex;gap:4px;flex-shrink:0">',
          '<button type="button" class="btn primary" data-bound="1" style="font-size:11px;padding:5px 14px;height:auto;border-radius:6px" data-arb-accept="' + escapeHtml(item.id) + '" title="Accepter comme ' + (kindLabels[k] || k).toLowerCase() + '">Accepter</button>',
          '<button type="button" class="btn ghost" data-bound="1" style="font-size:11px;padding:5px 8px;height:auto;color:var(--text-3,#888)" data-arb-ignore="' + escapeHtml(item.id) + '" title="Ignorer cette proposition">\u00D7</button>',
        '</div>'
      ].join('');
      list.appendChild(row);
    });
    sec.appendChild(list);

    main.insertBefore(sec, main.firstChild);

    // Toggle bouton : gere via onclick inline + window.aiceoArbToggleQueue (defini en tete du fichier)

    // Bind accept / cycle / ignore
    sec.addEventListener('click', async function (e) {
      // S6.8.1 — Click sur badge type : cycle task -> decision -> project -> task
      const cycleBtn = e.target.closest('[data-arb-cycle]');
      if (cycleBtn) {
        var id = cycleBtn.dataset.arbCycle;
        var item = queue.find(function (q) { return q.id === id; });
        if (!item) return;
        var order = ['task', 'decision', 'project'];
        var cur = order.indexOf(item.kind || 'task');
        item.kind = order[(cur + 1) % order.length];
        renderQueue();
        return;
      }
      const acceptBtn = e.target.closest('[data-arb-accept]');
      const ignoreBtn = e.target.closest('[data-arb-ignore]');
      if (acceptBtn) {
        const id = acceptBtn.dataset.arbAccept;
        const item = queue.find(function (q) { return q.id === id; });
        if (!item) return;
        const acceptAs = item.kind || 'task';
        const endpoint = acceptAs === 'project' ? '/api/projects' :
                        acceptAs === 'decision' ? '/api/decisions' : '/api/tasks';
        const payload = acceptAs === 'project' ? { name: item.title, description: item.excerpt } :
                       acceptAs === 'decision' ? { title: item.title, context: item.excerpt } :
                       { title: item.title, description: item.excerpt, priority: item.proposed_priority || 'P1' };
        try {
          const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (r.ok) {
            // S6.8.5 — Animation slide-out + fade
            const row = acceptBtn.closest('div[style*="surface"]');
            if (row) {
              row.style.transition = 'all .35s cubic-bezier(.4,0,.2,1)';
              row.style.transform = 'translateX(40px)';
              row.style.opacity = '0';
              setTimeout(function () {
                row.style.maxHeight = row.offsetHeight + 'px';
                row.style.transition = 'all .25s cubic-bezier(.4,0,.2,1)';
                row.style.maxHeight = '0';
                row.style.marginTop = '0';
                row.style.marginBottom = '0';
                row.style.paddingTop = '0';
                row.style.paddingBottom = '0';
              }, 200);
              setTimeout(function () { if (row.parentElement) row.style.display = 'none'; }, 500);
            }
            acceptBtn.disabled = true;
            if (ignoreBtn) ignoreBtn.disabled = true;
            // Update compteur file (X/Y propose) si present
            var counter = document.querySelector('[data-arb-queue-counter]');
            if (counter) {
              var current = parseInt(counter.dataset.processed || '0', 10) + 1;
              counter.dataset.processed = String(current);
              var total = parseInt(counter.dataset.total || '0', 10);
              counter.textContent = current + '/' + total + ' traitee' + (current > 1 ? 's' : '');
            }
            // v0.7 — auto-link email -> project si on vient de creer un projet
            if (acceptAs === 'project' && item.source_id) {
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
        if (row) {
          row.style.transition = 'all .25s cubic-bezier(.4,0,.2,1)';
          row.style.transform = 'translateX(-30px)';
          row.style.opacity = '0';
          setTimeout(function () { row.style.display = 'none'; }, 250);
        }
        var counter = document.querySelector('[data-arb-queue-counter]');
        if (counter) {
          var c = parseInt(counter.dataset.processed || '0', 10) + 1;
          counter.dataset.processed = String(c);
          var t = parseInt(counter.dataset.total || '0', 10);
          counter.textContent = c + '/' + t + ' traitee' + (c > 1 ? 's' : '');
        }
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
