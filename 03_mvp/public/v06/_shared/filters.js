/* filters.js — Filtres cumulables + tri + recherche locale
 * Persistance localStorage par route (aiCEO.uiPrefs.filters.<route>)
 */
(function () {
  'use strict';
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const $  = (s, r=document) => r.querySelector(s);
  const route = (document.body && document.body.dataset && document.body.dataset.route) || '';

  // ── État persistant ────────────────────────────────────────────
  function getState() {
    try {
      const raw = localStorage.getItem('aiCEO.uiPrefs.filters.' + route);
      return raw ? JSON.parse(raw) : { houses: [], statuses: [], search: '', sortBy: '' };
    } catch { return { houses: [], statuses: [], search: '', sortBy: '' }; }
  }
  function saveState(s) {
    try { localStorage.setItem('aiCEO.uiPrefs.filters.' + route, JSON.stringify(s)); } catch {}
  }

  let state = getState();

  // ── Items concernés (selon route) ──────────────────────────────
  function getItems() {
    return $$('.task-row, .proj-card, .dec-card, .contact-card, .revue-row, .agenda-block');
  }

  // ── Application des filtres ────────────────────────────────────
  function applyFilters() {
    const items = getItems();
    items.forEach(item => {
      let visible = true;
      // Filtre maison (cumulable)
      if (state.houses.length > 0) {
        const h = (item.dataset.house || '').toLowerCase();
        if (!state.houses.some(s => s.toLowerCase() === h)) visible = false;
      }
      // Filtre status (cumulable)
      if (state.statuses.length > 0 && visible) {
        const s = (item.dataset.status || '').toLowerCase();
        if (!state.statuses.some(x => x.toLowerCase() === s)) visible = false;
      }
      // Recherche locale (texte)
      if (state.search && visible) {
        const txt = (item.textContent || '').toLowerCase();
        if (!txt.includes(state.search.toLowerCase())) visible = false;
      }
      item.style.display = visible ? '' : 'none';
    });
    // Affichage compteur
    updateCount(items.filter(i => i.style.display !== 'none').length, items.length);
    // Tri
    if (state.sortBy) applySort();
  }

  function updateCount(visible, total) {
    let counter = $('#aiceo-filter-count');
    if (visible === total) {
      if (counter) counter.remove();
      return;
    }
    if (!counter) {
      counter = document.createElement('div');
      counter.id = 'aiceo-filter-count';
      counter.style.cssText = 'padding:8px 16px;background:var(--cream-50,#faf7f1);border-bottom:1px solid var(--border,#eee);font-size:13px;color:var(--text-2,#555);display:flex;align-items:center;justify-content:space-between;gap:12px';
      const main = $('.app-main, main') || document.body;
      main.insertBefore(counter, main.firstChild);
    }
    counter.innerHTML = `<span><strong>${visible}</strong> / ${total} affichés</span><button class="aiceo-empty-cta" type="button" id="aiceo-clear-filters" style="background:var(--text,#111);color:#fff;padding:5px 12px;font-size:12px">Réinitialiser filtres</button>`;
    const btn = counter.querySelector('#aiceo-clear-filters');
    btn.addEventListener('click', () => {
      state = { houses: [], statuses: [], search: '', sortBy: '' };
      saveState(state);
      // Désactiver tous les chips
      $$('.chip.is-active, .filter-chip.is-active').forEach(c => c.classList.remove('is-active'));
      const inp = $('#aiceo-search-input'); if (inp) inp.value = '';
      applyFilters();
    });
  }

  // ── Tri par colonne ────────────────────────────────────────────
  function applySort() {
    const sortBy = state.sortBy;
    const direction = state.sortDir || 'asc';
    const items = getItems();
    if (items.length < 2) return;
    const parent = items[0].parentElement;
    if (!parent) return;
    const sorted = [...items].sort((a, b) => {
      let va = (a.dataset[sortBy] || a.querySelector('.task-title, .proj-card-title, .dec-card-title, .contact-card-name, .revue-row-title')?.textContent || '').toLowerCase();
      let vb = (b.dataset[sortBy] || b.querySelector('.task-title, .proj-card-title, .dec-card-title, .contact-card-name, .revue-row-title')?.textContent || '').toLowerCase();
      if (va < vb) return direction === 'asc' ? -1 : 1;
      if (va > vb) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    sorted.forEach(it => parent.appendChild(it));
  }

  // ── Bind chips multi-select ────────────────────────────────────
  function bindChips() {
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip:not(.chip-count):not(.chip-sep), .filter-chip');
      if (!chip || !chip.parentElement.classList.contains('filter-chips')) return;
      e.preventDefault();

      const txt = (chip.textContent || '').trim().toLowerCase();
      // Détermine si c'est un filtre maison ou statut
      const isHouse = /northwind|solstice|helix|toutes?|tous/.test(txt);
      const isStatus = /sain|alerte|surveiller|actif|gel|tension|cadence|émergence/.test(txt);
      const isAllReset = /tous|toutes|all/.test(txt);

      chip.classList.toggle('is-active');
      if (isAllReset && chip.classList.contains('is-active')) {
        // "Tous" exclusif : désélectionne les autres
        chip.parentElement.querySelectorAll('.chip').forEach(c => {
          if (c !== chip) c.classList.remove('is-active');
        });
        state.houses = [];
        state.statuses = [];
      } else {
        if (isHouse && !isAllReset) {
          if (chip.classList.contains('is-active')) {
            if (!state.houses.includes(txt)) state.houses.push(txt);
          } else {
            state.houses = state.houses.filter(h => h !== txt);
          }
        } else if (isStatus) {
          if (chip.classList.contains('is-active')) {
            if (!state.statuses.includes(txt)) state.statuses.push(txt);
          } else {
            state.statuses = state.statuses.filter(s => s !== txt);
          }
        }
      }
      saveState(state);
      applyFilters();
    });
  }

  // ── Recherche locale (input topbar) ────────────────────────────
  function injectSearchInput() {
    // Skip si input existe ou page n'est pas une liste
    if ($('#aiceo-search-input')) return;
    const PAGES_WITH_SEARCH = ['taches', 'projets', 'equipe', 'decisions', 'revues'];
    if (!PAGES_WITH_SEARCH.includes(route)) return;

    const topbar = $('.topbar, header.topbar, header.app-header');
    if (!topbar) return;
    const searchPill = document.createElement('div');
    searchPill.className = 'aiceo-search-pill';
    searchPill.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--surface-3,#eee);border-radius:99px;flex:1;max-width:320px;margin-left:auto';
    searchPill.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="aiceo-search-input" type="search" placeholder="Rechercher dans cette page…" style="flex:1;border:0;background:transparent;outline:0;font-family:inherit;font-size:13px;color:var(--text,#111)" value="${escHtml(state.search)}">
    `;
    topbar.appendChild(searchPill);

    const input = $('#aiceo-search-input');
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.search = input.value.trim();
        saveState(state);
        applyFilters();
      }, 200);
    });
  }

  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  // ── Restaurer chips actifs au load (selon state) ──────────────
  function restoreChips() {
    $$('.chip').forEach(chip => {
      const txt = (chip.textContent || '').trim().toLowerCase();
      if (state.houses.includes(txt) || state.statuses.includes(txt)) {
        chip.classList.add('is-active');
      }
    });
  }

  function init() {
    bindChips();
    injectSearchInput();
    // Délai pour laisser bind-X.js render les items d'abord
    setTimeout(() => {
      restoreChips();
      applyFilters();
    }, 800);
    new MutationObserver(applyFilters).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
