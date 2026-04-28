/* command-palette.js — Cmd+K palette
 * Recherche : projets / tâches / contacts / décisions
 * Commandes : navigation, créations, actions
 */
(function () {
  'use strict';

  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (v == null) return;
      if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function injectCSS() {
    if (document.getElementById('aiceo-cmdk-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-cmdk-css';
    s.textContent = `
      .aiceo-cmdk-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 11000; display: flex; align-items: flex-start; justify-content: center; padding: 80px 20px 20px; animation: aiceo-cmdk-fade .15s ease-out; }
      .aiceo-cmdk { background: var(--surface-2,#fff); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.30); width: 100%; max-width: 600px; max-height: 70vh; display: flex; flex-direction: column; overflow: hidden; animation: aiceo-cmdk-slide .18s ease-out; }
      .aiceo-cmdk-input { padding: 18px 24px; font-size: 16px; border: 0; border-bottom: 1px solid var(--border,#eee); background: transparent; color: var(--text,#111); width: 100%; outline: none; font-family: inherit; }
      .aiceo-cmdk-list { flex: 1; overflow-y: auto; padding: 8px; }
      .aiceo-cmdk-section { padding: 8px 12px 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-3,#888); letter-spacing: 0.05em; }
      .aiceo-cmdk-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; display: flex; gap: 12px; align-items: center; transition: background .1s; color: var(--text,#111); text-decoration: none; }
      .aiceo-cmdk-item:hover, .aiceo-cmdk-item.is-selected { background: var(--surface-3,#eee); }
      .aiceo-cmdk-item-icon { width: 18px; height: 18px; color: var(--text-3,#888); flex-shrink: 0; }
      .aiceo-cmdk-item-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .aiceo-cmdk-item-meta { font-size: 11px; color: var(--text-3,#888); }
      .aiceo-cmdk-empty { padding: 32px; text-align: center; color: var(--text-3,#888); font-size: 14px; }
      .aiceo-cmdk-foot { padding: 8px 16px; border-top: 1px solid var(--border,#eee); font-size: 11px; color: var(--text-3,#888); display: flex; gap: 16px; justify-content: flex-end; }
      .aiceo-cmdk-foot kbd { background: var(--surface-3,#eee); padding: 2px 6px; border-radius: 4px; font-family: ui-monospace,monospace; font-size: 10px; }
      @keyframes aiceo-cmdk-fade { from { opacity:0; } to { opacity:1; } }
      @keyframes aiceo-cmdk-slide { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
    `;
    document.head.appendChild(s);
  }

  // Catalogue commandes statiques
  const COMMANDS = [
    { type: 'cmd', label: 'Aller au cockpit',     url: '/v06/index.html', icon: 'i-home' },
    { type: 'cmd', label: 'Ouvrir l\'arbitrage', url: '/v06/arbitrage.html', icon: 'i-arbitrage' },
    { type: 'cmd', label: 'Boucle du soir',       url: '/v06/evening.html', icon: 'i-evening' },
    { type: 'cmd', label: 'Voir mes projets',     url: '/v06/projets.html', icon: 'i-projects' },
    { type: 'cmd', label: 'Voir mes tâches',      url: '/v06/taches.html', icon: 'i-actions' },
    { type: 'cmd', label: 'Voir mon agenda',      url: '/v06/agenda.html', icon: 'i-calendar' },
    { type: 'cmd', label: 'Voir mes décisions',   url: '/v06/decisions.html', icon: 'i-target' },
    { type: 'cmd', label: 'Voir mon équipe',      url: '/v06/equipe.html', icon: 'i-people' },
    { type: 'cmd', label: 'Revues hebdo',         url: '/v06/revues.html', icon: 'i-folder' },
    { type: 'cmd', label: 'Assistant IA',         url: '/v06/assistant.html', icon: 'i-sparkle' },
    { type: 'cmd', label: 'Réglages',             url: '/v06/settings.html', icon: 'i-settings' },
    { type: 'action', label: '+ Nouveau projet',  entity: 'project', icon: 'i-plus' },
    { type: 'action', label: '+ Nouvelle tâche',  entity: 'task', icon: 'i-plus' },
    { type: 'action', label: '+ Nouvelle décision', entity: 'decision', icon: 'i-plus' },
    { type: 'action', label: '+ Nouveau contact', entity: 'contact', icon: 'i-plus' },
  ];

  let entityCache = null;
  async function loadEntities() {
    if (entityCache) return entityCache;
    const [tasks, projects, contacts, decisions] = await Promise.all([
      fetch('/api/tasks?limit=100').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/projects?limit=100').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/contacts?limit=100').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/decisions?limit=100').then(r => r.ok ? r.json() : null).catch(() => null)
    ]);
    entityCache = [];
    (tasks?.tasks || []).forEach(t => entityCache.push({ type: 'task', label: t.title, id: t.id, url: '/v06/taches.html#' + t.id, icon: 'i-actions', meta: t.priority || '' }));
    (projects?.projects || []).forEach(p => entityCache.push({ type: 'project', label: p.name, id: p.id, url: '/v06/projet.html?id=' + p.id, icon: 'i-projects', meta: p.status || '' }));
    (contacts?.contacts || []).forEach(c => entityCache.push({ type: 'contact', label: c.name, id: c.id, url: '/v06/equipe.html#' + c.id, icon: 'i-people', meta: c.role || '' }));
    (decisions?.decisions || []).forEach(d => entityCache.push({ type: 'decision', label: d.title, id: d.id, url: '/v06/decisions.html#' + d.id, icon: 'i-target', meta: d.status || '' }));
    return entityCache;
  }

  function fuzzyMatch(query, text) {
    if (!query) return true;
    return text.toLowerCase().includes(query.toLowerCase());
  }

  let modalEl = null;
  let listEl = null;
  let inputEl = null;
  let allItems = [];
  let visibleItems = [];
  let selectedIdx = 0;

  async function open() {
    if (modalEl) return;
    injectCSS();
    const backdrop = el('div', { class: 'aiceo-cmdk-backdrop' });
    const modal = el('div', { class: 'aiceo-cmdk' });
    inputEl = el('input', { class: 'aiceo-cmdk-input', placeholder: 'Recherche projets, tâches, décisions, contacts… ou tapez une commande', autocomplete: 'off' });
    modal.appendChild(inputEl);
    listEl = el('div', { class: 'aiceo-cmdk-list' });
    modal.appendChild(listEl);
    const foot = el('div', { class: 'aiceo-cmdk-foot' }, '<span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span> <span><kbd>↵</kbd> ouvrir</span> <span><kbd>esc</kbd> fermer</span>');
    modal.appendChild(foot);
    backdrop.appendChild(modal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.body.appendChild(backdrop);
    modalEl = backdrop;
    inputEl.focus();
    inputEl.addEventListener('input', refresh);
    inputEl.addEventListener('keydown', onKey);
    document.addEventListener('keydown', escHandler);

    // Charger les entités async
    listEl.innerHTML = '<div class="aiceo-cmdk-empty">Chargement…</div>';
    const entities = await loadEntities();
    allItems = COMMANDS.concat(entities);
    refresh();
  }

  function close() {
    if (!modalEl) return;
    document.removeEventListener('keydown', escHandler);
    modalEl.remove();
    modalEl = null;
  }

  function escHandler(e) { if (e.key === 'Escape') close(); }

  function onKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(visibleItems.length - 1, selectedIdx + 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(0, selectedIdx - 1);
      render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = visibleItems[selectedIdx];
      if (item) activate(item);
    }
  }

  function activate(item) {
    close();
    if (item.type === 'action' && window.AICEOCrud) {
      window.AICEOCrud.open(item.entity);
    } else if (item.url) {
      window.location.href = item.url;
    }
  }

  function refresh() {
    const q = inputEl.value.trim();
    visibleItems = allItems.filter(it => fuzzyMatch(q, it.label));
    selectedIdx = 0;
    render();
  }

  function render() {
    listEl.innerHTML = '';
    if (visibleItems.length === 0) {
      listEl.innerHTML = '<div class="aiceo-cmdk-empty">Aucun résultat</div>';
      return;
    }
    // Grouper par type
    const groups = {};
    visibleItems.forEach((it, idx) => {
      const k = it.type;
      if (!groups[k]) groups[k] = [];
      groups[k].push({ ...it, idx });
    });
    const order = ['cmd','action','task','project','decision','contact'];
    const labels = { cmd: 'Navigation', action: 'Créer', task: 'Tâches', project: 'Projets', decision: 'Décisions', contact: 'Contacts' };
    order.forEach(k => {
      if (!groups[k]) return;
      const sec = el('div', { class: 'aiceo-cmdk-section' }, labels[k] || k);
      listEl.appendChild(sec);
      groups[k].forEach(it => {
        const row = el('div', {
          class: 'aiceo-cmdk-item' + (it.idx === selectedIdx ? ' is-selected' : ''),
          'data-idx': it.idx,
          onclick: () => activate(it)
        });
        const icon = el('svg', { class: 'aiceo-cmdk-item-icon' });
        icon.innerHTML = '<use href="#' + (it.icon || 'i-search') + '"/>';
        row.appendChild(icon);
        row.appendChild(el('span', { class: 'aiceo-cmdk-item-label' }, it.label));
        if (it.meta) row.appendChild(el('span', { class: 'aiceo-cmdk-item-meta' }, it.meta));
        listEl.appendChild(row);
      });
    });
  }

  // Bind global Cmd+K (override le toast de shell.js)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      e.stopPropagation();
      open();
    }
  }, true);

  window.AICEOCmdK = { open, close };
})();
