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

// S6.22 Lot 12 : tracking selection bulk
const selected = new Set();

function updateBulkToolbar() {
  const toolbar = document.querySelector('[data-region="ar-bulk-toolbar"]');
  if (!toolbar) return;
  const n = selected.size;
  toolbar.hidden = n === 0;
  const countEl = toolbar.querySelector('[data-region="ar-bulk-count"]');
  if (countEl) countEl.textContent = n + ' selectionne' + (n > 1 ? 's' : '');
}

function renderQueue() {
  const host = document.querySelector('[data-region="ar-queue"]');
  const stat = document.querySelector('[data-region="ar-queue-stat"]');
  if (!host) return;

  if (stat) stat.innerHTML = `<strong>${state.queue.length}</strong> emails proposes par scoring SQL`;

  if (!state.queue.length) {
    host.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-500);font-style:italic;background:var(--ivory-50);border-radius:var(--radius-md)">Cliquez sur <strong>Analyser les emails</strong> pour generer la file du jour.</div>';
    selected.clear();
    updateBulkToolbar();
    renderBulkToolbar();
    return;
  }

  // Garde uniquement les selections valides (au cas ou la queue change)
  const validIds = new Set(state.queue.map(m => String(m.id)));
  for (const id of [...selected]) if (!validIds.has(id)) selected.delete(id);

  // Bulk toolbar
  renderBulkToolbar();

  host.innerHTML = state.queue.slice(0, 50).map((m, i) => {
    const id = String(m.id || i);
    const isChecked = selected.has(id);
    const score = m.score || 0;
    const cls = score >= 70 ? 'is-high' : (score >= 40 ? 'is-mid' : 'is-low');
    const kind = m.kind || 'task';
    const kindBadge = kind === 'decision' ? '<span style="background:#fbeed2;color:#92400e;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase">Decision</span>' : '';
    return `
      <div class="ar-mail ${cls} ${isChecked ? 'is-selected' : ''}" data-mail-id="${id}" style="position:relative">
        <label style="position:absolute;top:14px;left:14px;cursor:pointer;z-index:2">
          <input type="checkbox" data-bulk-check="${id}" ${isChecked ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer" />
        </label>
        <div class="ar-mail-rail"></div>
        <div class="ar-mail-body" style="margin-left:32px">
          <div class="ar-mail-from">${escHtml(m.from || m.sender || 'inconnu')}${m.received_at ? ' · ' + m.received_at.slice(0, 10) : ''} ${kindBadge}</div>
          <div class="ar-mail-subject">${escHtml(m.subject || '(sans objet)')}</div>
          <div class="ar-mail-snippet">${escHtml(m.snippet || m.body_preview || '')}</div>
        </div>
        <div class="ar-mail-actions">
          <button class="ar-mail-act accept" data-action="accept" data-id="${id}">Accepter</button>
          <button class="ar-mail-act defer"  data-action="defer"  data-id="${id}">Reporter</button>
          <button class="ar-mail-act ignore" data-action="ignore" data-id="${id}">Ignorer</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind checkbox toggle
  host.querySelectorAll('[data-bulk-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.bulkCheck;
      if (cb.checked) selected.add(id); else selected.delete(id);
      const card = host.querySelector(`[data-mail-id="${id}"]`);
      if (card) card.classList.toggle('is-selected', cb.checked);
      updateBulkToolbar();
    });
  });

  host.querySelectorAll('[data-action]').forEach(b => {
    b.addEventListener('click', () => {
      const action = b.dataset.action;
      const id = b.dataset.id;
      handleQueueAction(action, id);
    });
  });
}

function renderBulkToolbar() {
  let toolbar = document.querySelector('[data-region="ar-bulk-toolbar"]');
  if (!toolbar) {
    const queueHost = document.querySelector('[data-region="ar-queue"]');
    if (!queueHost) return;
    toolbar = document.createElement('div');
    toolbar.dataset.region = 'ar-bulk-toolbar';
    toolbar.hidden = true;
    toolbar.style.cssText = 'background:#fef9e7;border:1px solid #fbbf24;padding:10px 14px;border-radius:8px;display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;animation:asFadeUp .2s';
    toolbar.innerHTML = `
      <strong style="color:#92400e;font-size:13px" data-region="ar-bulk-count">0 selectionne</strong>
      <button class="ar-mail-act accept" data-bulk-action="accept" style="font-size:12px">Accepter X</button>
      <button class="ar-mail-act defer"  data-bulk-action="defer"  style="font-size:12px">Reporter X</button>
      <button class="ar-mail-act ignore" data-bulk-action="ignore" style="font-size:12px">Ignorer X</button>
      <span style="flex:1"></span>
      <button data-bulk-action="select-all" style="background:transparent;border:1px solid #92400e;color:#92400e;padding:5px 10px;border-radius:6px;font-size:11px;cursor:pointer">Tout selectionner</button>
      <button data-bulk-action="clear" style="background:transparent;border:0;color:#92400e;cursor:pointer;font-size:11px;text-decoration:underline">Tout decocher</button>
    `;
    queueHost.parentNode.insertBefore(toolbar, queueHost);

    toolbar.querySelectorAll('[data-bulk-action]').forEach(b => {
      b.addEventListener('click', () => handleBulkAction(b.dataset.bulkAction));
    });
  }
  updateBulkToolbar();
}

async function handleBulkAction(action) {
  if (action === 'select-all') {
    state.queue.forEach(m => selected.add(String(m.id)));
    renderQueue();
    return;
  }
  if (action === 'clear') {
    selected.clear();
    renderQueue();
    return;
  }
  if (selected.size === 0) {
    showToast('Aucun email selectionne', 'warning');
    return;
  }
  const verdictMap = { accept: 'faire', defer: 'decaler', ignore: 'archiver' };
  const verdict = verdictMap[action] || 'faire';
  const ids = [...selected];
  if (!confirm(`Appliquer "${action}" sur ${ids.length} email${ids.length>1?'s':''} ?`)) return;

  showToast(`Traitement de ${ids.length} email${ids.length>1?'s':''}...`, 'warning');

  // Fire all in parallele
  const promises = ids.map(id => {
    const item = state.queue.find(m => String(m.id) === id);
    if (!item) return Promise.resolve(null);
    return fetch('/api/arbitrage/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_id: item.source_id || item.id || id,
        kind: item.kind || 'task',
        verdict,
        title: item.title || item.subject || '(sans objet)',
        description: item.excerpt || item.snippet || item.body_preview || '',
        priority: item.proposed_priority || 'P1'
      })
    }).then(r => r.ok ? r.json() : null).catch(() => null);
  });

  const results = await Promise.allSettled(promises);
  let created = 0, deduped = 0, errors = 0, decisions = 0;
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value) {
      if (r.value.deduped) deduped++;
      else if (r.value.created) {
        created++;
        if (r.value.created.kind === 'decision') decisions++;
      }
    } else errors++;
  });

  // Bilan toast
  const parts = [];
  if (created) parts.push(`${created} action${created>1?'s':''} creee${created>1?'s':''}`);
  if (decisions) parts.push(`dont ${decisions} decision${decisions>1?'s':''}`);
  if (deduped) parts.push(`${deduped} dedupe`);
  if (errors) parts.push(`${errors} erreur${errors>1?'s':''}`);
  showToast('Bilan : ' + (parts.join(', ') || 'rien fait'), errors ? 'error' : 'success');

  // Retire tous les emails traites de la queue locale
  state.queue = state.queue.filter(m => !ids.includes(String(m.id)));
  selected.clear();
  renderQueue();
}

// S6.22 Lot 10 : feedback toast simple
function showToast(msg, kind) {
  let host = document.getElementById('ar-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'ar-toast-host';
    host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  const bg = kind === 'success' ? '#dcfce7' : (kind === 'error' ? '#fee2e2' : '#fef3c7');
  const fg = kind === 'success' ? '#166534' : (kind === 'error' ? '#991b1b' : '#92400e');
  t.style.cssText = `background:${bg};color:${fg};border:1px solid ${fg}40;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.08);animation:arSlide .25s ease;pointer-events:auto`;
  t.textContent = msg;
  host.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2800);
}

async function handleQueueAction(action, id) {
  const card = document.querySelector(`[data-mail-id="${id}"]`);
  const item = state.queue.find(m => String(m.id) === String(id) || String(m.source_id) === String(id));
  if (card) { card.style.opacity = '0.4'; card.style.pointerEvents = 'none'; }

  // S6.22 Lot 10 : route /api/arbitrage/accept (cree task/decision + dedupe email)
  const verdictMap = { accept: 'faire', defer: 'decaler', ignore: 'archiver' };
  const verdict = verdictMap[action] || 'faire';
  const payload = {
    source_id: item?.source_id || item?.id || id,
    kind: item?.kind || 'task',
    verdict: verdict,
    title: item?.title || item?.subject || '(sans objet)',
    description: item?.excerpt || item?.snippet || item?.body_preview || '',
    priority: item?.proposed_priority || 'P1'
  };

  const r = await safeFetch('/api/arbitrage/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Feedback utilisateur
  if (!r) {
    showToast('Erreur serveur. Verifiez la console (F12).', 'error');
    if (card) { card.style.opacity = '1'; card.style.pointerEvents = 'auto'; }
    return;
  }
  if (r.deduped) {
    showToast('Email deja arbitre — pas de doublon cree.', 'warning');
  } else if (r.created) {
    const lbl = r.created.kind === 'decision' ? 'Decision' : 'Action';
    const verb = verdict === 'archiver' ? 'archive' : (verdict === 'decaler' ? 'reportee' : 'creee');
    showToast(`✓ ${lbl} ${verb}`, 'success');
  } else {
    showToast(`✓ Email ${verdict}`, 'success');
  }

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
