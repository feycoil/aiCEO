// decisions-store.js — store unique pour la page Décisions
// Pattern Atomic Templates · S6.10-bis-LIGHT
import { Store } from '../shared/store.js';
import { ComponentLoader } from '../shared/component-loader.js';

class DecisionsStore extends Store {
  constructor() {
    super({
      decisions: [],
      filter: 'Toutes',
      query: '',
      loading: false,
      error: null
    });
  }

  async load() {
    this.setState({ loading: true, error: null });
    try {
      const r = await fetch('/api/decisions?limit=200');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const decisions = Array.isArray(data) ? data : (data.decisions || data.items || []);
      this.setState({ decisions, loading: false });
    } catch (e) {
      console.error('[decisions-store] load failed', e);
      this.setState({ loading: false, error: e.message });
    }
  }

  setFilter(f) { this.setState({ filter: f }); }
  setQuery(q) { this.setState({ query: q }); }

  // Décisions filtrées
  visible() {
    const { decisions, filter, query } = this.state;
    let list = decisions;
    if (filter && filter !== 'Toutes') {
      const map = {
        'À trancher': d => /^(open|pending|à_trancher|a_trancher)$/i.test(d.status || ''),
        'Tranchées':  d => /^(decided|tranch|done|fait)/i.test(d.status || ''),
        'Reportées':  d => /^(reportee|reportée|deferred)$/i.test(d.status || ''),
        'Gelées':     d => /^(frozen|gelee|gelée)$/i.test(d.status || '')
      };
      const fn = map[filter];
      if (fn) list = list.filter(fn);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.context || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  computeKpis() {
    const all = this.state.decisions;
    const isOpen = d => /^(open|pending)$/i.test(d.status || '');
    const isDone = d => /^(decided|tranch|done)/i.test(d.status || '');
    const isFrozen = d => /^(frozen|gelee|gelée)$/i.test(d.status || '');
    const isReported = d => /^(reportee|reportée|deferred)$/i.test(d.status || '');
    return {
      total: all.length,
      open: all.filter(isOpen).length,
      done: all.filter(isDone).length,
      frozen: all.filter(isFrozen).length + all.filter(isReported).length
    };
  }
}

const store = new DecisionsStore();

// Render orchestré
function escapeJson(s) { return String(s).replace(/'/g, '&#39;'); }

async function render(state) {
  // KPIs
  const kpis = store.computeKpis();
  const kpiRegion = document.querySelector('[data-region="kpis"]');
  if (kpiRegion) {
    kpiRegion.innerHTML = [
      { label: 'Total', value: kpis.total, tone: '' },
      { label: 'À trancher', value: kpis.open, tone: 'warning' },
      { label: 'Tranchées', value: kpis.done, tone: 'success' },
      { label: 'Gelées / reportées', value: kpis.frozen, tone: '' }
    ].map(k => `<div data-component="kpi-tile" data-props='${escapeJson(JSON.stringify(k))}'></div>`).join('');
    await ComponentLoader.refresh(kpiRegion);
  }

  // Timeline
  const timeline = document.querySelector('[data-region="timeline"]');
  const empty = document.querySelector('[data-region="empty"]');
  const list = store.visible();

  if (timeline) {
    if (state.loading) {
      timeline.innerHTML = `<div class="loading-state">Chargement…</div>`;
    } else if (state.error) {
      timeline.innerHTML = `<div class="error-state">Erreur : ${state.error}</div>`;
    } else if (list.length === 0) {
      timeline.innerHTML = '';
    } else {
      timeline.innerHTML = list.map(d =>
        `<div data-component="card-decision" data-props='${escapeJson(JSON.stringify(d))}'></div>`
      ).join('');
      await ComponentLoader.refresh(timeline);
    }
  }
  if (empty) {
    empty.hidden = list.length > 0 || state.loading;
  }
}

store.on('change', render);

// Wiring événements globaux (filter + search)
document.addEventListener('seg:change', (e) => {
  if (e.detail && e.detail.id === 'type') store.setFilter(e.detail.value);
});
document.addEventListener('search:change', (e) => {
  store.setQuery((e.detail && e.detail.query) || '');
});

// Lance le chargement après le mount des composants
window.addEventListener('load', () => store.load());

export default store;
