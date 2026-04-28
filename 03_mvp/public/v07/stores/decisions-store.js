// decisions-store.js — store Decisions (S6.10-EE-FIX5 anti-race)
import { Store } from '../shared/store.js';
import { ComponentLoader } from '../shared/component-loader.js';

class DecisionsStore extends Store {
  constructor() {
    super({
      decisions: [], filter: 'Toutes', horizon: 'all', query: '',
      loading: false, error: null
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
  setHorizon(h) { this.setState({ horizon: h }); }
  setQuery(q) { this.setState({ query: q }); }

  visible() {
    const { decisions, filter, query, horizon } = this.state;
    let list = decisions;
    if (filter && filter !== 'Toutes') {
      const map = {
        'Strategiques':   d => /strateg/i.test(d.type || ''),
        'Operationnelles':d => /operation/i.test(d.type || ''),
        'Posture':        d => /posture/i.test(d.type || '')
      };
      const fn = map[filter];
      if (fn) list = list.filter(fn);
    }
    if (horizon && horizon !== 'all') {
      const days = parseInt(horizon, 10);
      if (!isNaN(days) && days > 0) {
        const cutoff = Date.now() - days * 86400000;
        list = list.filter(d => {
          const t = d.created_at || d.updated_at || d.date;
          if (!t) return true;
          const ts = new Date(t).getTime();
          return !isNaN(ts) && ts >= cutoff;
        });
      }
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.context || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q) ||
        (d.project_name || d.project || '').toLowerCase().includes(q)
      );
    }
    list = list.slice().sort((a, b) => {
      const ta = new Date(a.created_at || a.updated_at || 0).getTime();
      const tb = new Date(b.created_at || b.updated_at || 0).getTime();
      return tb - ta;
    });
    return list;
  }
  computeKpis() {
    const all = this.state.decisions;
    const isOpen = d => /^(open|pending|active)$/i.test(d.status || '');
    const isDecided = d => /^(decided|tranch|done|validated)/i.test(d.status || '');
    const isInfirmed = d => Boolean(d.infirmed) || /^(infirmee|infirmed)$/i.test(d.status || '');
    const now = Date.now();
    const sixtyDaysAgo = now - 60 * 86400000;
    const toRevisit = d => {
      const t = new Date(d.created_at || d.updated_at || 0).getTime();
      return isOpen(d) && (d.review_when || (t > 0 && t < sixtyDaysAgo));
    };
    return {
      total: all.length,
      decided: all.filter(isDecided).length,
      pending: all.filter(isOpen).length,
      infirmed: all.filter(isInfirmed).length,
      revisit: all.filter(toRevisit).length
    };
  }
}

const store = new DecisionsStore();
function escapeJsonAttr(s) { return String(s).replace(/'/g, '&#39;'); }

// === Anti-race : seq number + debounce ===
let renderSeq = 0;
let renderTimer = null;

function scheduleRender() {
  // Debounce 30ms : si plusieurs setState arrivent rapprochés, on n agit qu une fois
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(doRender, 30);
}

async function doRender() {
  const mySeq = ++renderSeq;
  const state = store.state;

  // KPIs : toujours rendu (synchrone simple, pas de race)
  const kpis = store.computeKpis();
  const kpiRegion = document.querySelector('[data-region="kpis"]');
  if (kpiRegion) {
    kpiRegion.innerHTML = [
      { label: 'Decisions tranchees',         value: kpis.decided,  tone: '' },
      { label: "En attente d'effet",          value: kpis.pending,  tone: 'warning' },
      { label: 'Infirmees retrospectivement', value: kpis.infirmed, tone: '' },
      { label: 'A revisiter sous 30 j',       value: kpis.revisit,  tone: '' }
    ].map(k => `<div data-component="kpi-tile" data-props='${escapeJsonAttr(JSON.stringify(k))}'></div>`).join('');
    await ComponentLoader.refresh(kpiRegion);
    if (mySeq !== renderSeq) return; // abandonne si depasse
  }

  const timeline = document.querySelector('[data-region="timeline"]');
  const empty = document.querySelector('[data-region="empty"]');
  const meta = document.querySelector('[data-region="filter-meta"]');
  const list = store.visible();

  if (meta) {
    meta.innerHTML = `<strong>${list.length}</strong> resultat${list.length > 1 ? 's' : ''} - les plus recentes en haut`;
  }

  if (timeline) {
    if (state.error) {
      timeline.innerHTML = `<div class="error-state">Erreur : ${state.error}</div>`;
    } else if (list.length === 0 && state.loading) {
      timeline.innerHTML = `<div class="loading-state">Chargement des decisions...</div>`;
    } else if (list.length === 0) {
      timeline.innerHTML = '';
    } else {
      timeline.innerHTML = list.map((d, i) => {
        const delay = Math.min(i * 30, 600);
        return `<div data-component="card-decision" data-props='${escapeJsonAttr(JSON.stringify(d))}' style="animation-delay:${delay}ms"></div>`;
      }).join('');
      await ComponentLoader.refresh(timeline);
      if (mySeq !== renderSeq) return;
    }
  }
  if (empty) empty.hidden = list.length > 0 || state.loading;
}

store.on('change', scheduleRender);

document.addEventListener('seg:change', (e) => {
  if (e.detail && e.detail.id === 'type') store.setFilter(e.detail.value);
});
document.addEventListener('time:change', (e) => {
  if (e.detail && e.detail.id === 'horizon') store.setHorizon(e.detail.value);
});
document.addEventListener('search:change', (e) => {
  store.setQuery((e.detail && e.detail.query) || '');
});

// === Demarrage robuste avec retry ===
function startLoad() {
  // Premier load apres 50ms (laisse component-loader.js initial finir)
  setTimeout(() => {
    store.load();
    // Safety net : si timeline reste vide apres 1s, force un re-render
    setTimeout(() => {
      const tl = document.querySelector('[data-region="timeline"]');
      if (tl && tl.innerHTML.trim() === '' && store.state.decisions.length > 0) {
        console.log('[store] safety net : forced re-render');
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
