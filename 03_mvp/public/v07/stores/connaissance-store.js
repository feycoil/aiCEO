import { showToast } from '../shared/toast.js';

// connaissance-store.js — CRUD pins (S6.11-EE-2 L3.2)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = { pins: [], filter: 'Tous', search: '' };

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

async function loadPins() {
  const data = await safeFetch('/api/knowledge/pins');
  state.pins = data?.pins || data || [];
  render();
}

function computeKnKpis(pins) {
  return {
    total: pins.length,
    decisions: pins.filter(p => p.type === 'decision').length,
    criteres: pins.filter(p => p.type === 'critere' || p.type === 'criterion').length,
    regles: pins.filter(p => p.type === 'regle' || p.type === 'principle').length
  };
}

function renderKnKpis(pins) {
  const host = document.querySelector('[data-region="kn-kpis"]');
  if (!host) return;
  const k = computeKnKpis(pins);
  host.innerHTML = ''
    + '<div class="kpi-tile" data-tone="neutral"><div class="kpi-tile-label">Total</div><div class="kpi-tile-value">' + k.total + '</div></div>'
    + '<div class="kpi-tile" data-tone="success"><div class="kpi-tile-label">Decisions</div><div class="kpi-tile-value">' + k.decisions + '</div></div>'
    + '<div class="kpi-tile" data-tone="warning"><div class="kpi-tile-label">Criteres</div><div class="kpi-tile-value">' + k.criteres + '</div></div>'
    + '<div class="kpi-tile" data-tone="danger"><div class="kpi-tile-label">Regles</div><div class="kpi-tile-value">' + k.regles + '</div></div>';
}

function render() {
  const grid = document.querySelector('[data-region="kn-grid"]');
  const empty = document.querySelector('[data-region="kn-empty"]');
  const meta = document.querySelector('[data-region="kn-meta"]');
  if (!grid) return;

  // S6.32 : KPIs
  renderKnKpis(state.pins);

  let filtered = state.filter === 'Tous'
    ? state.pins
    : state.pins.filter(p => p.type === state.filter);
  // S6.32 : search
  if (state.search) {
    const q = state.search.toLowerCase();
    filtered = filtered.filter(p => (p.title || '').toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q));
  }

  if (meta) meta.textContent = `${filtered.length} pin${filtered.length > 1 ? 's' : ''}`;

  if (!filtered.length) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  grid.innerHTML = filtered.map(p => `
    <div class="kn-pin" data-pin-id="${p.id}">
      <button class="kn-pin-del" data-action="delete" data-id="${p.id}" title="Supprimer">×</button>
      <div class="kn-pin-type">${escHtml(p.type || 'pin')}</div>
      <div class="kn-pin-title">${escHtml(p.title || '')}</div>
      ${p.content ? `<div class="kn-pin-content">${escHtml(p.content)}</div>` : ''}
      <div class="kn-pin-meta">
        <span>${(p.created_at || '').slice(0, 10)}</span>
        ${p.source_decision_id ? `<a href="decisions.html#dec-${p.source_decision_id}" style="color:var(--primary-700);text-decoration:none">Decision liee →</a>` : ''}
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Supprimer ce pin ?')) return;
      const id = btn.dataset.id;
      await safeFetch(`/api/knowledge/pins/${id}`, { method: 'DELETE' });
      loadPins();
    });
  });
}

function bindForm() {
  const form = document.getElementById('kn-form');
  const newBtn = document.querySelector('[data-action="new"]');
  const cancelBtn = document.querySelector('[data-action="cancel"]');

  if (newBtn) newBtn.addEventListener('click', (e) => { e.preventDefault(); form?.classList.add('is-open'); document.getElementById('kn-title')?.focus(); });
  if (cancelBtn) cancelBtn.addEventListener('click', () => { form?.classList.remove('is-open'); form?.reset(); });

  // Empty state CTA
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cta-action="new"]')) {
      form?.classList.add('is-open');
      document.getElementById('kn-title')?.focus();
    }
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('kn-type').value;
      const title = document.getElementById('kn-title').value.trim();
      const content = document.getElementById('kn-content').value.trim();
      if (!title) { showToast('Le titre est requis.', 'warning'); return; }
      const r = await safeFetch('/api/knowledge/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, content })
      });
      if (r) {
        form.classList.remove('is-open');
        form.reset();
        loadPins();
      } else {
        showToast('Erreur creation.', 'warning');
      }
    });
  }
}

function bindFilters() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-component="seg-filter"] button, [data-component="seg-filter"] .seg-option');
    if (!btn) return;
    const label = btn.textContent.trim();
    state.filter = label;
    render();
  });
}

// S6.32 : bind search input
function bindSearch() {
  const inp = document.querySelector('[data-region="kn-search"]');
  if (!inp) return;
  let timer = null;
  inp.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.search = inp.value || '';
      render();
    }, 200);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindForm();
  bindFilters();
  bindSearch();
  loadPins();
});
