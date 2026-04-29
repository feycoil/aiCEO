// arbitrage-store.js — page-clone du pattern decisions (S6.11-EE)
import { Store } from '../shared/store.js';
import { ComponentLoader } from '../shared/component-loader.js';

class PageStore extends Store {
  constructor() { super({ items: [], loading: false, error: null }); }
  async load() {
    this.setState({ loading: true, error: null });
    try {
      const r = await fetch('/api/arbitrage/queue');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const items = Array.isArray(data) ? data : (data['queue'] || data.items || []);
      this.setState({ items, loading: false });
    } catch (e) {
      console.error('[arbitrage-store] load failed', e);
      this.setState({ loading: false, error: e.message });
    }
  }
}

const store = new PageStore();
function escapeJsonAttr(s) { return String(s).replace(/'/g, '&#39;'); }

let renderSeq = 0;
let renderTimer = null;
function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(doRender, 30);
}

async function doRender() {
  const mySeq = ++renderSeq;
  const state = store.state;

  const meta = document.querySelector('[data-region="filter-meta"]');
  if (meta) {
    const n = state.items.length;
    meta.innerHTML = state.loading ? 'Chargement...' : ('<strong>' + n + '</strong> element' + (n > 1 ? 's' : ''));
  }

  const timeline = document.querySelector('[data-region="timeline"]');
  const empty = document.querySelector('[data-region="empty"]');
  if (timeline) {
    if (state.error) {
      timeline.innerHTML = '<div class="error-state">Erreur : ' + state.error + '</div>';
    } else if (state.items.length === 0 && state.loading) {
      timeline.innerHTML = '<div class="loading-state">Chargement...</div>';
    } else if (state.items.length === 0) {
      timeline.innerHTML = '';
    } else {
      timeline.innerHTML = state.items.slice(0, 50).map((item, i) => {
        const data = {
          id: item.id || ('item-' + i),
          title: item.title || item.name || item.subject || ('Element ' + (i+1)),
          context: item.description || item.context || item.summary || '',
          status: item.status || 'active',
          created_at: item.created_at || item.updated_at || item.date || new Date().toISOString(),
          project_name: item.project_name || item.project || item.house_name,
          type: item.type
        };
        const delay = Math.min(i * 30, 600);
        return '<div data-component="card-decision" data-props=' + "'" + escapeJsonAttr(JSON.stringify(data)) + "'" + ' style="animation-delay:' + delay + 'ms"></div>';
      }).join('');
      await ComponentLoader.refresh(timeline);
      if (mySeq !== renderSeq) return;
    }
  }
  if (empty) empty.hidden = state.items.length > 0 || state.loading;
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
