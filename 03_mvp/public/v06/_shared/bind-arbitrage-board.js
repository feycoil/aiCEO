/* bind-arbitrage-board.js — Cable mode TABLEAU sur vraies decisions DB
 *
 * Mapping bin <-> status decision :
 *   todo   <-> ouverte
 *   done   <-> decidee | executee
 *   later  <-> (pas de status DB ; cache localement en sessionStorage)
 *   frozen <-> abandonnee
 *
 * Drag&drop natif HTML5 + PATCH /api/decisions/:id pour persister.
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'arbitrage') return;

  const $  = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  async function tryJson(url, opts) {
    try {
      const r = await fetch(url, Object.assign({ headers: { Accept: 'application/json' } }, opts || {}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  // v0.7-S6.6 : status 'reportee' persiste en DB (migration 2026-04-28-decisions-reportee.sql)
  function statusToBin(d) {
    const s = (d.status || 'ouverte').toLowerCase();
    if (s === 'decidee' || s === 'executee') return 'done';
    if (s === 'abandonnee') return 'frozen';
    if (s === 'reportee') return 'later';
    return 'todo';
  }

  function binToStatus(bin) {
    if (bin === 'done') return 'decidee';
    if (bin === 'frozen') return 'abandonnee';
    if (bin === 'todo') return 'ouverte';
    if (bin === 'later') return 'reportee';
    return null;
  }

  function priorityFor(d) {
    if (d.priority) return d.priority.toUpperCase();
    if (d.deadline) {
      const days = Math.floor((new Date(d.deadline).getTime() - Date.now()) / 86400000);
      if (days < 7) return 'P0';
      if (days < 30) return 'P1';
    }
    return 'P2';
  }

  function renderCard(d, bin) {
    const p = priorityFor(d);
    const isDone = bin === 'done';
    const dateLabel = bin === 'done' && d.decided_at ?
      'Tranche ' + new Date(d.decided_at).toLocaleDateString('fr-FR', {weekday:'short'}) :
      (d.deadline ? 'J' + Math.floor((new Date(d.deadline).getTime() - Date.now()) / 86400000) : '');

    return '<article class="mini-card' + (isDone ? ' is-done' : '') + '" draggable="true" data-id="' + escHtml(d.id) + '" data-bin="' + bin + '" style="cursor:grab">' +
      '<div class="mini-card-head">' +
        '<span class="pill house"><span class="dot"></span>—</span>' +
        '<span class="pill priority ' + p.toLowerCase() + ' sm">' + p + '</span>' +
        '<button class="grip-handle" aria-label="Deplacer" tabindex="-1"><svg class="ico" width="12" height="12"><use href="#i-grip"/></svg></button>' +
      '</div>' +
      '<h4 class="mini-card-title">' + escHtml(d.title || '(decision sans titre)') + '</h4>' +
      (dateLabel || (d.context && d.context.length > 0) ? '<footer class="mini-card-foot">' + escHtml(dateLabel || (d.context || '').slice(0, 80)) + '</footer>' : '') +
    '</article>';
  }

  let allDecisions = [];

  function distribute() {
    const bins = { todo: [], done: [], later: [], frozen: [] };
    allDecisions.forEach(function (d) {
      const b = statusToBin(d);
      bins[b].push(d);
    });

    Object.keys(bins).forEach(function (bin) {
      const col = document.querySelector('.board-col[data-bin="' + bin + '"]');
      if (!col) return;
      const body = col.querySelector('.board-col-body');
      if (body) {
        body.innerHTML = bins[bin].map(function (d) { return renderCard(d, bin); }).join('') ||
          '<div style="padding:18px 12px;font-size:11px;color:var(--text-3,#888);text-align:center;font-style:italic">' +
          (bin === 'todo' ? '\u2014' : 'Aucune') + '</div>';
      }
      const count = col.querySelector('.board-col-count');
      if (count) count.textContent = bins[bin].length;
    });
  }

  function bindDragDrop() {
    const cols = $$('.board-col[data-dropzone="true"]');

    document.body.addEventListener('dragstart', function (e) {
      const card = e.target.closest('.mini-card[draggable="true"]');
      if (!card) return;
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      card.style.opacity = '0.4';
    });
    document.body.addEventListener('dragend', function (e) {
      const card = e.target.closest('.mini-card[draggable="true"]');
      if (card) card.style.opacity = '';
    });

    cols.forEach(function (col) {
      col.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('is-drop-hover');
        col.style.background = 'var(--surface-3,#ebe7df)';
      });
      col.addEventListener('dragleave', function (e) {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('is-drop-hover');
          col.style.background = '';
        }
      });
      col.addEventListener('drop', async function (e) {
        e.preventDefault();
        col.classList.remove('is-drop-hover');
        col.style.background = '';
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const bin = col.dataset.bin;
        const decision = allDecisions.find(function (d) { return d.id === id; });
        if (!decision) return;

        // Update local
        const oldBin = statusToBin(decision);
        if (oldBin === bin) return;

        // Persister via PATCH (status 'reportee' supporté depuis v0.7)
        const newStatus = binToStatus(bin);

        if (newStatus) {
          const patch = { status: newStatus };
          if (newStatus === 'decidee' && !decision.decided_at) patch.decided_at = new Date().toISOString();
          const r = await tryJson('/api/decisions/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch)
          });
          if (r && r.decision) {
            // Mettre a jour le local
            Object.assign(decision, r.decision);
          } else {
            console.warn('[aiCEO board] PATCH failed for', id);
            if (window.AICEOShell) window.AICEOShell.showToast('Erreur de sauvegarde', 'error');
          }
        }

        // Re-render
        distribute();
        if (window.AICEOShell && window.AICEOShell.showToast) {
          const labels = { todo: '\u00C0 trancher', done: 'Tranche', later: 'Reporte', frozen: 'Gele' };
          window.AICEOShell.showToast('Deplace vers ' + (labels[bin] || bin), 'success');
        }
      });
    });
  }

  async function init() {
    const data = await tryJson('/api/decisions?limit=200');
    allDecisions = (data && data.decisions) || [];
    distribute();
    bindDragDrop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
