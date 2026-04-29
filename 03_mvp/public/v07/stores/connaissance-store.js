// connaissance-store.js — CRUD pins (S6.11-EE-2 L3.2)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = { pins: [], filter: 'Tous' };

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

async function loadPins() {
  const data = await safeFetch('/api/knowledge/pins');
  state.pins = data?.pins || data || [];
  render();
}

function render() {
  const grid = document.querySelector('[data-region="kn-grid"]');
  const empty = document.querySelector('[data-region="kn-empty"]');
  const meta = document.querySelector('[data-region="kn-meta"]');
  if (!grid) return;

  const filtered = state.filter === 'Tous'
    ? state.pins
    : state.pins.filter(p => p.type === state.filter);

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
      if (!title) { alert('Le titre est requis.'); return; }
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
        alert('Erreur creation.');
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

document.addEventListener('DOMContentLoaded', () => {
  bindForm();
  bindFilters();
  loadPins();
});
