// projets-store.js — page-clone du pattern decisions (S6.11-EE)
import { Store } from '../shared/store.js';
import { ComponentLoader } from '../shared/component-loader.js';

class PageStore extends Store {
  constructor() {
    // S6.38 : viewMode = 'company' (defaut) | 'domain' | 'to-triage'
    super({ items: [], loading: false, error: null, statusFilter: 'all', viewMode: 'company', domains: [], companies: [] });
  }
  async load() {
    this.setState({ loading: true, error: null });
    try {
      const [pRes, dRes, cRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/domains').catch(() => null),
        fetch('/api/companies').catch(() => null)
      ]);
      if (!pRes.ok) throw new Error('HTTP ' + pRes.status);
      const data = await pRes.json();
      const items = Array.isArray(data) ? data : (data['projects'] || data.items || []);
      let domains = [];
      let companies = [];
      try { if (dRes && dRes.ok) { const dj = await dRes.json(); domains = dj.domains || []; } } catch (e) {}
      try { if (cRes && cRes.ok) { const cj = await cRes.json(); companies = cj.companies || []; } } catch (e) {}
      this.setState({ items, domains, companies, loading: false });
    } catch (e) {
      console.error('[projets-store] load failed', e);
      this.setState({ loading: false, error: e.message });
    }
  }
  setStatusFilter(s) { this.setState({ statusFilter: s }); }
  setViewMode(v) { this.setState({ viewMode: v }); }
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

// S6.38 : toggle vue (Societe / Domaine / A traiter)
function renderViewToggle() {
  const host = document.querySelector('[data-region="filter-view"]');
  if (!host || host.dataset.bound) return;
  host.innerHTML = '<button class="seg-btn is-active" data-view="company">Par societe</button>' +
                   '<button class="seg-btn" data-view="domain">Par domaine</button>' +
                   '<button class="seg-btn" data-view="to-triage">A traiter</button>';
  host.dataset.bound = '1';
  host.addEventListener('click', function (ev) {
    const btn = ev.target.closest('[data-view]');
    if (!btn) return;
    host.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    store.setViewMode(btn.dataset.view);
  });
}

function groupProjectsByAxis(items, axis, refList) {
  // axis = 'domain' or 'company'. refList = state.domains / state.companies
  const fkey = axis === 'domain' ? 'domain_id' : 'company_id';
  const labelByRef = {};
  refList.forEach(r => { labelByRef[r.id] = { name: r.name, icon: r.icon, color: r.color }; });
  const groups = new Map();
  items.forEach(p => {
    const key = p[fkey] || '__unassigned__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });
  // ordre : refList puis __unassigned__ a la fin
  const ordered = [];
  refList.forEach(r => { if (groups.has(r.id)) ordered.push({ key: r.id, label: r.name, icon: r.icon || '', color: r.color || '', items: groups.get(r.id) }); });
  if (groups.has('__unassigned__')) ordered.push({ key: '__unassigned__', label: 'Sans ' + (axis === 'domain' ? 'domaine' : 'societe'), icon: '◯', color: '#94A3B8', items: groups.get('__unassigned__') });
  return ordered;
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

  // S6.32 + S6.38 : KPIs + filtres + toggle vue
  renderKpis(state.items);
  renderFilters();
  renderViewToggle();
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
      // S6.38 : render par vue
      const view = state.viewMode || 'company';
      const renderCard = (item, i) => {
        const data = {
          kind: 'project',
          id: item.id || ('item-' + i),
          title: item.title || item.name || item.subject || ('Element ' + (i+1)),
          context: item.description || item.context || item.summary || '',
          status: item.status || 'active',
          created_at: item.created_at || item.updated_at || item.date || new Date().toISOString(),
          project_name: item.project_name || item.project || item.house_name,
          type: item.type,
          _raw: item
        };
        const delay = Math.min(i * 30, 600);
        return '<div data-component="card-decision" data-props=' + "'" + escapeJsonAttr(JSON.stringify(data)) + "'" + ' style="animation-delay:' + delay + 'ms"></div>';
      };
      if (view === 'to-triage') {
        // Vue 'A traiter' : projets sans domain_id ET sans company_id, ou avec status hot/alerte
        const toTriage = filteredItems.filter(p => (!p.domain_id || !p.company_id) || ['hot','alerte'].includes((p.status||'').toLowerCase()));
        timeline.innerHTML = toTriage.length === 0
          ? '<div class="empty-state-v2"><div class="empty-state-v2-title">Tout est rattache</div><div class="empty-state-v2-desc">Aucun projet ne demande d arbitrage actuellement.</div></div>'
          : '<div class="proj-section-title" style="margin-bottom:12px">A traiter (' + toTriage.length + ')</div>' + toTriage.slice(0, 50).map(renderCard).join('');
      } else {
        // Vues 'company' ou 'domain' : grouper par axe
        const refList = view === 'domain' ? (state.domains || []) : (state.companies || []);
        const groups = groupProjectsByAxis(filteredItems, view, refList);
        if (groups.length === 0) {
          timeline.innerHTML = '<div class="empty-state-v2"><div class="empty-state-v2-title">Aucun projet</div></div>';
        } else {
          let i = 0;
          timeline.innerHTML = groups.map(g => {
            const head = '<div class="proj-group-header" style="display:flex;align-items:center;gap:8px;margin:20px 0 10px;padding:8px 12px;border-left:3px solid ' + (g.color || '#94A3B8') + ';font-weight:600">' + (g.icon ? '<span style="font-size:18px">' + g.icon + '</span>' : '') + '<span>' + g.label + '</span><span style="color:var(--ink-500);font-weight:400">(' + g.items.length + ')</span></div>';
            const cards = g.items.slice(0, 30).map((it) => { const html = renderCard(it, i); i++; return html; }).join('');
            return head + cards;
          }).join('');
        }
      }
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
