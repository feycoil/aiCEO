/* workflow.js — Palier 2 : drag-drop, filtres, notifications */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  async function api(method, url, body) {
    try {
      const r = await fetch(url, {
        method, headers: {'Content-Type':'application/json', Accept:'application/json'},
        body: body ? JSON.stringify(body) : undefined
      });
      if (!r.ok) return null;
      if (r.status === 204) return {};
      return await r.json();
    } catch(e) { return null; }
  }

  // ──────────────────────────────────────────────────────────────
  // 1. Drag & drop natif HTML5 sur arbitrage
  // ──────────────────────────────────────────────────────────────
  function bindArbitrageDragDrop() {
    if (document.body.dataset.route !== 'arbitrage') return;
    const cols = $$('.board-col, .kanban-col, [data-bucket]');
    if (cols.length === 0) return;

    // Rendre les cartes draggables
    function makeCardsDraggable() {
      $$('.task-card, .arb-card, [data-task-id]').forEach(card => {
        if (card.dataset.dragBound) return;
        card.dataset.dragBound = '1';
        card.draggable = true;
        card.style.cursor = 'grab';
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', card.dataset.taskId || card.id || '');
          card.style.opacity = '0.4';
        });
        card.addEventListener('dragend', () => { card.style.opacity = ''; });
      });
    }

    // Rendre les colonnes drop targets
    cols.forEach(col => {
      if (col.dataset.dropBound) return;
      col.dataset.dropBound = '1';
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.style.background = 'var(--surface-3, #eee)';
      });
      col.addEventListener('dragleave', () => { col.style.background = ''; });
      col.addEventListener('drop', async (e) => {
        e.preventDefault();
        col.style.background = '';
        const taskId = e.dataTransfer.getData('text/plain');
        if (!taskId) return;
        // Identifier le bucket cible
        const colName = (col.querySelector('.board-col-name, h3, h2') || {}).textContent || '';
        let bucket = 'faire';
        if (/délég|deleguer/i.test(colName)) bucket = 'deleguer';
        else if (/reporter|plus tard/i.test(colName)) bucket = 'reporter';
        else if (/gel/i.test(colName)) bucket = 'frozen';
        // Déplacer visuellement
        const list = col.querySelector('.kanban-list, .board-col-body, .o-stack') || col;
        const card = $('[data-task-id="' + taskId + '"]');
        if (card) list.appendChild(card);
        // Update count headers
        cols.forEach(c => {
          const cnt = c.querySelector('.board-col-count, .col-count');
          if (cnt) cnt.textContent = c.querySelectorAll('[data-task-id]').length;
        });
        if (window.AICEOShell) window.AICEOShell.showToast('Carte → ' + (bucket === 'frozen' ? 'gelé' : bucket), 'info');
      });
    });

    makeCardsDraggable();
    // Reaffinage à chaque mutation (au cas où le binding ajoute des cards)
    new MutationObserver(makeCardsDraggable).observe(document.body, { childList: true, subtree: true });
  }

  // ──────────────────────────────────────────────────────────────
  // 2. Filtres chips (par maison, par santé, par statut)
  // ──────────────────────────────────────────────────────────────
  function bindFilterChips() {
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip[data-filter], .filter-chip, .chip-toggle');
      if (!chip) return;
      e.preventDefault();
      // Toggle is-active
      const group = chip.parentElement;
      const isMulti = group.dataset.multi === '1';
      if (!isMulti) {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      }
      chip.classList.toggle('is-active');
      applyFilters();
    });
    // Filter chips pour barre par maison/santé sur projets/taches/equipe
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip:not([data-filter])');
      if (!chip || !chip.parentElement.classList.contains('filter-chips')) return;
      e.preventDefault();
      chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilters();
    });
  }

  function applyFilters() {
    // Lit toutes les chips actives et applique data-filter sur les items visibles
    const route = document.body.dataset.route || '';
    const activeChips = $$('.chip.is-active, .filter-chip.is-active');
    const filters = activeChips.map(c => ({ key: c.dataset.filter, value: c.dataset.filterValue || (c.textContent || '').trim().toLowerCase() }))
      .filter(f => f.value && f.value !== 'tous' && f.value !== 'toutes' && f.value !== 'all');

    // Pour chaque item visible (task-row, proj-card, contact-card, dec-card)
    $$('.task-row, .proj-card, .contact-card, .dec-card, .revue-row').forEach(item => {
      const house = item.dataset.house || '';
      const status = item.dataset.status || '';
      let visible = true;
      filters.forEach(f => {
        if (!f.value) return;
        const lc = f.value.toLowerCase();
        if (lc === house.toLowerCase()) return;
        if (lc === status.toLowerCase()) return;
        // Match texte dans l'item (best effort)
        const txt = item.textContent.toLowerCase();
        if (txt.includes(lc)) return;
        visible = false;
      });
      item.style.display = visible ? '' : 'none';
    });
  }

  // ──────────────────────────────────────────────────────────────
  // 3. Form Soirée complet (textareas + Capter pensée)
  // ──────────────────────────────────────────────────────────────
  function injectEveningForm() {
    if (document.body.dataset.route !== 'evening') return;
    if (document.getElementById('evening-form-injected')) return;

    // Cherche un endroit où injecter (après hero ou à la fin du main)
    const main = $('main, .app-main, .page-main');
    if (!main) return;

    const form = document.createElement('form');
    form.id = 'evening-form-injected';
    form.style.cssText = 'background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px;padding:24px;margin:24px 0;display:flex;flex-direction:column;gap:16px;';
    form.innerHTML = `
      <h3 style="margin:0;font-size:18px;font-weight:700">Bilan de la journée</h3>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-2,#555)">Ce qui s'est vraiment fait</label>
        <textarea name="fait" rows="2" style="padding:10px;border:1px solid var(--border,#ddd);border-radius:8px;font-family:inherit;font-size:14px;resize:vertical" placeholder="Les vraies victoires du jour..."></textarea>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-2,#555)">Ce qui glisse</label>
        <textarea name="partiel" rows="2" style="padding:10px;border:1px solid var(--border,#ddd);border-radius:8px;font-family:inherit;font-size:14px;resize:vertical" placeholder="Partiel, en cours, pas terminé..."></textarea>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-2,#555)">Ce qui n'a pas été touché</label>
        <textarea name="pas_fait" rows="2" style="padding:10px;border:1px solid var(--border,#ddd);border-radius:8px;font-family:inherit;font-size:14px;resize:vertical" placeholder="Pas grave, demain..."></textarea>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-2,#555)">Top-3 demain</label>
        <textarea name="tomorrow" rows="3" style="padding:10px;border:1px solid var(--border,#ddd);border-radius:8px;font-family:inherit;font-size:14px;resize:vertical" placeholder="3 priorités pour demain matin..."></textarea>
      </div>
      <button type="submit" style="padding:12px 20px;border-radius:10px;background:var(--text,#111);color:#fff;border:0;font-size:15px;font-weight:600;cursor:pointer">Clôturer la journée</button>
    `;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const bilan = {
        fait:     data.get('fait') || '',
        partiel:  data.get('partiel') || '',
        pas_fait: data.get('pas_fait') || ''
      };
      const tomorrow_prep = data.get('tomorrow') || '';
      // Humeur depuis sélection mood (data-mood.is-selected)
      const moodEl = $('[data-mood].is-selected, [data-mood].is-active');
      const humeurMap = { calm: 'tres-bien', good: 'bien', neutre: 'neutre', tendu: 'tendu', dur: 'difficile' };
      const humeur = moodEl ? (humeurMap[moodEl.dataset.mood] || moodEl.dataset.mood || 'neutre') : 'neutre';
      const energie = 3;

      const r = await api('POST', '/api/evening/commit', { bilan, humeur, energie, tomorrow_prep });
      if (r) {
        if (window.AICEOShell) window.AICEOShell.showToast('Soirée enregistrée 🌙', 'success');
        setTimeout(() => location.href = '/v06/index.html', 1200);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    });
    main.appendChild(form);
  }

  // ──────────────────────────────────────────────────────────────
  // 4. Notifications cloche (badge + dropdown)
  // ──────────────────────────────────────────────────────────────
  async function loadNotifications() {
    const data = await api('GET', '/api/cockpit/today');
    if (!data || !data.alerts) return;
    const alerts = data.alerts || [];
    const badge = $('.notif-badge, .topbar-bell + .badge, [data-bind="notif-count"]');
    const bell = $('.topbar-bell, button[aria-label*="otification"]');
    if (bell) {
      let dot = bell.querySelector('.notif-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'notif-dot';
        dot.style.cssText = 'position:absolute;top:6px;right:6px;width:8px;height:8px;background:var(--rose,#d96d3e);border-radius:50%;';
        bell.style.position = 'relative';
        bell.appendChild(dot);
      }
      dot.style.display = alerts.length > 0 ? 'block' : 'none';
      bell.title = alerts.length + ' alerte(s)';
      // Click pour afficher la liste
      if (!bell.dataset.bound) {
        bell.dataset.bound = '1';
        bell.addEventListener('click', () => {
          if (alerts.length === 0) {
            window.AICEOShell?.showToast('Aucune alerte', 'info');
            return;
          }
          const lines = alerts.map(a => '• ' + (a.message || a.kind || 'alerte')).join('\n');
          window.AICEOShell?.showToast(lines, 'info');
        });
      }
    }
    if (badge && alerts.length > 0) badge.textContent = alerts.length;
  }

  // ──────────────────────────────────────────────────────────────
  // Bootstrap
  // ──────────────────────────────────────────────────────────────
  function init() {
    bindArbitrageDragDrop();
    bindFilterChips();
    injectEveningForm();
    loadNotifications();
    // Refresh notifications toutes les 60s
    setInterval(loadNotifications, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
