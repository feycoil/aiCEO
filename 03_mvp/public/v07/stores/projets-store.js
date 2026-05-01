// projets-store.js — page-clone du pattern decisions (S6.11-EE)
import { Store } from '../shared/store.js';
import { ComponentLoader } from '../shared/component-loader.js';

class PageStore extends Store {
  constructor() { super({ items: [], loading: false, error: null, statusFilter: 'all' }); }
  async load() {
    this.setState({ loading: true, error: null });
    try {
      const r = await fetch('/api/projects');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const items = Array.isArray(data) ? data : (data['projects'] || data.items || []);
      this.setState({ items, loading: false });
    } catch (e) {
      console.error('[projets-store] load failed', e);
      this.setState({ loading: false, error: e.message });
    }
  }
  setStatusFilter(s) { this.setState({ statusFilter: s }); }
}

const store = new PageStore();
function escapeJsonAttr(s) { return String(s).replace(/'/g, '&#39;'); }

let renderSeq = 0;
let renderTimer = null;
function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(doRender, 30);
}

// S6.32 : KPI helpers + filter
function computeProjectKpis(items) {
  return {
    total: items.length,
    alerte: items.filter(p => { const s = (p.status || '').toLowerCase(); return s === 'alerte' || s === 'hot'; }).length,
    surveiller: items.filter(p => { const s = (p.status || '').toLowerCase(); return s === 'a_surveiller' || s === 'pending'; }).length,
    sain: items.filter(p => { const s = (p.status || '').toLowerCase(); return s === 'sain' || s === 'active' || s === 'new'; }).length
  };
}

function kpiTile(label, value, tone) {
  return '<div class="kpi-tile" data-tone="' + tone + '"><div class="kpi-tile-label">' + label + '</div><div class="kpi-tile-value">' + value + '</div></div>';
}

function renderKpis(items) {
  const host = document.querySelector('[data-region="kpis"]');
  if (!host) return;
  const k = computeProjectKpis(items);
  host.innerHTML = kpiTile('Total', k.total, 'neutral') + kpiTile('Alerte', k.alerte, 'danger') + kpiTile('A surveiller', k.surveiller, 'warning') + kpiTile('Sains', k.sain, 'success');
}

function renderFilters() {
  const host = document.querySelector('[data-region="filter-status"]');
  if (!host || host.dataset.bound) return;
  host.innerHTML = '<button class="seg-btn is-active" data-status="all">Tous</button><button class="seg-btn" data-status="alerte">Alerte</button><button class="seg-btn" data-status="surveiller">A surveiller</button><button class="seg-btn" data-status="sain">Sains</button>';
  host.dataset.bound = '1';
  host.addEventListener('click', function (ev) {
    const btn = ev.target.closest('[data-status]');
    if (!btn) return;
    host.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    store.setStatusFilter(btn.dataset.status);
  });
}

function applyStatusFilter(items, filter) {
  if (filter === 'all') return items;
  return items.filter(function (p) {
    const s = (p.status || '').toLowerCase();
    if (filter === 'alerte') return s === 'alerte' || s === 'hot';
    if (filter === 'surveiller') return s === 'a_surveiller' || s === 'pending';
    if (filter === 'sain') return s === 'sain' || s === 'active' || s === 'new';
    return true;
  });
}

async function doRender() {
  const mySeq = ++renderSeq;
  const state = store.state;

  // S6.32 : KPIs + filtres + subtitle dynamique
  renderKpis(state.items);
  renderFilters();
  const filteredItems = applyStatusFilter(state.items, state.statusFilter || 'all');
  const k = computeProjectKpis(state.items);
  const subtitleEl = document.querySelector('.ht-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = '' + k.total + ' projets actifs - ' + k.alerte + ' en alerte - ' + k.surveiller + ' a surveiller';
  }

  const meta = document.querySelector('[data-region="filter-meta"]');
  if (meta) {
    const n = filteredItems.length;
    const total = state.items.length;
    meta.innerHTML = state.loading ? 'Chargement...' : ('<strong>' + n + '</strong> sur ' + total + ' projet' + (total > 1 ? 's' : ''));
  }

  const timeline = document.querySelector('[data-region="timeline"]');
  const empty = document.querySelector('[data-region="empty"]');
  if (timeline) {
    if (state.error) {
      timeline.innerHTML = '<div class="error-state">Erreur : ' + state.error + '</div>';
    } else if (filteredItems.length === 0 && state.loading) {
      timeline.innerHTML = '<div class="loading-state">Chargement...</div>';
    } else if (filteredItems.length === 0) {
      timeline.innerHTML = '';
    } else {
      timeline.innerHTML = filteredItems.slice(0, 50).map((item, i) => {
        const data = {
          kind: 'project',
          id: item.id || ('item-' + i),
          title: item.title || item.name || item.subject || ('Element ' + (i+1)),
          context: item.description || item.context || item.summary || '',
          status: item.status || 'active',
          created_at: item.created_at || item.updated_at || item.date || new Date().toISOString(),
          project_name: item.project_name || item.project || item.house_name,
          type: item.type,
          // S6.12 : payload complet pour modal-detail (related items fetch via id)
          _raw: item
        };
        const delay = Math.min(i * 30, 600);
        return '<div data-component="card-decision" data-props=' + "'" + escapeJsonAttr(JSON.stringify(data)) + "'" + ' style="animation-delay:' + delay + 'ms"></div>';
      }).join('');
      await ComponentLoader.refresh(timeline);
      if (mySeq !== renderSeq) return;
    }
  }
  if (empty) empty.hidden = state.items.length > 0 || state.loading;
  if (empty && (state.statusFilter || 'all') !== 'all' && state.items.length > 0 && filteredItems.length === 0) {
    empty.hidden = false;
  }
}

store.on('change', scheduleRender);

function startLoad() {
  setTimeout(() => {
    store.load();
    setTimeout(() => {
      const tl = document.querySelector('[data-region="timeline"]');
      if (tl && tl.innerHTML.trim() === '' && store.state.items.length > 0) {
        scheduleRender();
      }
    }, 1000);
  }, 50);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startLoad();
} else {
  document.addEventListener('DOMContentLoaded', startLoad);
}

export default store;
