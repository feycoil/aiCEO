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
      { label: 'Decisions tranchees',         value: kpis.decided,  tone: 'success' },
      { label: "En attente d'effet",          value: kpis.pending,  tone: 'warning' },
      { label: 'Infirmees retrospectivement', value: kpis.infirmed, tone: 'danger' },
      { label: 'A revisiter sous 30 j',       value: kpis.revisit,  tone: 'neutral' }
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

// S6.31 : handler global "Recommander avec Claude" sur cards decision ouvertes
document.addEventListener('click', async function (ev) {
  var trigger = ev.target.closest('[data-action="recommend-decision"]');
  if (!trigger) return;
  ev.preventDefault();
  var decId = trigger.dataset.decisionId;
  if (!decId) return;
  showRecommendModal(decId, trigger);
});

async function showRecommendModal(decisionId, anchorEl) {
  // Modal overlay
  var overlay = document.createElement('div');
  overlay.className = 'rec-overlay';
  overlay.innerHTML = ''
    + '<div class="rec-modal is-llm-output">'
    + '<header class="rec-head"><h3>&#x2726; Recommandation Claude</h3>'
    + '<button class="rec-close" data-action="rec-close">&times;</button></header>'
    + '<div class="rec-body" data-region="rec-body">'
    + '<div class="thinking-pulse"><span class="thinking-spinner"></span><span>Claude analyse la decision...</span></div>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (ev) {
    if (ev.target === overlay || ev.target.dataset.action === 'rec-close') overlay.remove();
  });
  // Fetch
  try {
    var r = await fetch('/api/assistant/decision-recommend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision_id: decisionId })
    });
    var data = await r.json();
    var body = overlay.querySelector('[data-region="rec-body"]');
    if (!body) return;
    if (!r.ok || data.error) {
      body.innerHTML = '<p style="color:var(--danger-700,#991b1b)">Erreur : ' + (data.error || 'serveur') + '</p>';
      return;
    }
    body.innerHTML = renderRecommendHtml(data, decisionId);
  } catch (e) {
    var body2 = overlay.querySelector('[data-region="rec-body"]');
    if (body2) body2.innerHTML = '<p style="color:var(--danger-700,#991b1b)">Erreur reseau : ' + e.message + '</p>';
  }
}

function renderRecommendHtml(data, decisionId) {
  var opts = data.options || data.recommendations || [];
  var rationale = data.rationale || data.reasoning || '';
  var modeBadge = data.mode === 'live' ? '&#x2726; Claude live' : 'Mode rule-based';
  var html = '<div class="rec-mode">' + modeBadge + '</div>';
  if (opts.length) {
    html += '<div class="rec-options">';
    opts.forEach(function (o, i) {
      var letter = String.fromCharCode(65 + i);
      html += '<div class="rec-option">'
        + '<div class="rec-option-head"><span class="rec-letter">' + letter + '</span>'
        + '<strong>' + escapeHtml(o.label || o.title || ('Option ' + letter)) + '</strong></div>';
      if (o.rationale || o.detail) html += '<p class="rec-option-detail">' + escapeHtml(o.rationale || o.detail) + '</p>';
      html += '<button class="rec-pick" data-action="rec-pick" data-decision-id="' + escapeHtml(decisionId) + '" data-choice="' + letter + '">Trancher selon ' + letter + ' &rarr;</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (rationale) html += '<div class="rec-rationale"><strong>Pourquoi :</strong> ' + escapeHtml(rationale) + '</div>';
  return html;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]); });
}

export default store;
