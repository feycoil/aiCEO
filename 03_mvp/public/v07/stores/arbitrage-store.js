// arbitrage-store.js — 2 modes : queue emails + focus decisions (S6.11-EE-2 L4.1)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { mode: 'queue', queue: [], focusList: [], focusIdx: 0 };

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.ar-mode-tab').forEach(t => t.classList.toggle('is-active', t.dataset.mode === mode));
  document.querySelector('[data-region="ar-queue-mode"]').hidden = mode !== 'queue';
  document.querySelector('[data-region="ar-focus-mode"]').hidden = mode !== 'focus';
  if (mode === 'focus') loadFocus();
}

// === Mode QUEUE ===
async function analyzeEmails() {
  const btn = document.querySelector('[data-action="analyze"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Analyse...'; }
  const r = await safeFetch('/api/arbitrage/analyze-emails', { method: 'POST' });
  if (btn) { btn.disabled = false; btn.textContent = 'Analyser les emails'; }
  if (!r) { alert('Erreur analyse. Le serveur tourne-t-il ?'); return; }
  state.queue = r.proposals || r.emails || [];
  renderQueue();
}

async function bootstrapProjects() {
  if (!confirm('Auto-creer projets et contacts a partir des emails ?')) return;
  const r = await safeFetch('/api/arbitrage/bootstrap-from-emails', { method: 'POST' });
  if (r) alert(`✓ ${r.projects_created || 0} projets et ${r.contacts_created || 0} contacts crees.`);
}

function renderQueue() {
  const host = document.querySelector('[data-region="ar-queue"]');
  const stat = document.querySelector('[data-region="ar-queue-stat"]');
  if (!host) return;

  if (stat) stat.innerHTML = `<strong>${state.queue.length}</strong> emails proposes par scoring SQL`;

  if (!state.queue.length) {
    host.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-500);font-style:italic;background:var(--ivory-50);border-radius:var(--radius-md)">Cliquez sur <strong>Analyser les emails</strong> pour generer la file du jour.</div>';
    return;
  }

  host.innerHTML = state.queue.slice(0, 8).map((m, i) => {
    const score = m.score || 0;
    const cls = score >= 70 ? 'is-high' : (score >= 40 ? 'is-mid' : 'is-low');
    return `
      <div class="ar-mail ${cls}" data-mail-id="${m.id || i}">
        <div class="ar-mail-rail"></div>
        <div class="ar-mail-body">
          <div class="ar-mail-from">${escHtml(m.from || m.sender || 'inconnu')}${m.received_at ? ' · ' + m.received_at.slice(0, 10) : ''}</div>
          <div class="ar-mail-subject">${escHtml(m.subject || '(sans objet)')}</div>
          <div class="ar-mail-snippet">${escHtml(m.snippet || m.body_preview || '')}</div>
        </div>
        <div class="ar-mail-actions">
          <button class="ar-mail-act accept" data-action="accept" data-id="${m.id || i}">Accepter</button>
          <button class="ar-mail-act defer"  data-action="defer"  data-id="${m.id || i}">Reporter</button>
          <button class="ar-mail-act ignore" data-action="ignore" data-id="${m.id || i}">Ignorer</button>
        </div>
      </div>
    `;
  }).join('');

  host.querySelectorAll('[data-action]').forEach(b => {
    b.addEventListener('click', () => {
      const action = b.dataset.action;
      const id = b.dataset.id;
      handleQueueAction(action, id);
    });
  });
}

async function handleQueueAction(action, id) {
  const card = document.querySelector(`[data-mail-id="${id}"]`);
  if (card) { card.style.opacity = '0.4'; card.style.pointerEvents = 'none'; }
  // Hook backend si l API supporte
  await safeFetch(`/api/emails/${id}/${action}`, { method: 'POST' });
  // Retire visuellement apres 400ms
  setTimeout(() => {
    if (card) card.remove();
    state.queue = state.queue.filter(m => String(m.id) !== String(id));
    const stat = document.querySelector('[data-region="ar-queue-stat"]');
    if (stat) stat.innerHTML = `<strong>${state.queue.length}</strong> emails restants`;
  }, 400);
}

// === Mode FOCUS (decisions a trancher) ===
async function loadFocus() {
  const data = await safeFetch('/api/decisions');
  state.focusList = (data?.decisions || data || []).filter(d => d.status === 'open' || d.status === 'a_trancher');
  state.focusIdx = 0;
  renderFocus();
}

function renderFocus() {
  const host = document.querySelector('[data-region="ar-focus-host"]');
  if (!host) return;

  if (!state.focusList.length) {
    host.innerHTML = '<div data-component="empty-state" data-props=\'{"icon":"check","title":"Toutes les decisions sont tranchees","description":"Aucune decision en attente. Continuez la file emails ou retournez au cockpit."}\'></div>';
    return;
  }

  const d = state.focusList[state.focusIdx];
  const total = state.focusList.length;
  const options = d.options || ['Aller', 'Ne pas aller', 'Attendre'];

  host.innerHTML = `
    <div class="ar-decision">
      <div class="ar-decision-eyebrow">DECISION ${state.focusIdx + 1} / ${total}</div>
      <h2 class="ar-decision-title">${escHtml(d.title || d.label || 'Decision')}</h2>
      <p class="ar-decision-context">${escHtml(d.context || d.description || 'Pas de contexte additionnel.')}</p>
      <div class="ar-decision-options">
        ${options.map(o => `<button class="ar-option" data-option="${escHtml(o)}">${escHtml(o)}</button>`).join('')}
      </div>
      <div class="ar-decision-actions">
        <button class="ar-btn ar-btn-ghost" data-action="prev" ${state.focusIdx === 0 ? 'disabled' : ''}>← Precedente</button>
        <button class="ar-btn ar-btn-ghost" data-action="skip">Passer</button>
        <button class="ar-btn ar-btn-ghost" data-action="next" ${state.focusIdx === total - 1 ? 'disabled' : ''}>Suivante →</button>
      </div>
    </div>
  `;

  host.querySelectorAll('[data-option]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const choice = btn.dataset.option;
      await safeFetch(`/api/decisions/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'tranchee', resolution: choice, tranchee_at: new Date().toISOString() })
      });
      state.focusList.splice(state.focusIdx, 1);
      if (state.focusIdx >= state.focusList.length && state.focusIdx > 0) state.focusIdx--;
      renderFocus();
    });
  });

  host.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'prev' && state.focusIdx > 0) state.focusIdx--;
      else if (a === 'next' && state.focusIdx < state.focusList.length - 1) state.focusIdx++;
      else if (a === 'skip' && state.focusIdx < state.focusList.length - 1) state.focusIdx++;
      renderFocus();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ar-mode-tab').forEach(t => t.addEventListener('click', () => switchMode(t.dataset.mode)));
  document.querySelector('[data-action="analyze"]')?.addEventListener('click', analyzeEmails);
  document.querySelector('[data-action="bootstrap"]')?.addEventListener('click', bootstrapProjects);
  renderQueue(); // initial empty state
});
