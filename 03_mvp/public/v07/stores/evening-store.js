// evening-store.js — Rituel du soir (S6.11-EE-2 L3.1)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = { mood: null, energy: null };

function selectScale(group, value) {
  document.querySelectorAll(`[data-region="ev-${group}"] .ev-scale-btn`).forEach(b => b.classList.remove('is-selected'));
  const btn = document.querySelector(`[data-${group}="${value}"]`);
  if (btn) btn.classList.add('is-selected');
  state[group] = parseInt(value, 10);
}

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

async function loadStreak() {
  const data = await safeFetch('/api/evening/streak');
  const el = document.querySelector('[data-region="ev-streak"]');
  if (!el) return;
  const streak = data?.streak || 0;
  el.innerHTML = streak > 0
    ? `🔥 Streak : ${streak} jour${streak > 1 ? 's' : ''} consecutif${streak > 1 ? 's' : ''}`
    : '✨ Premier soir - debutons le streak !';
}

async function loadHistory() {
  const data = await safeFetch('/api/evening?limit=7');
  const host = document.querySelector('[data-region="ev-history"]');
  if (!host) return;
  const list = data?.sessions || data || [];
  if (!list.length) {
    host.innerHTML = '<div style="font-size:13px;color:var(--ink-500);font-style:italic;padding:14px;background:var(--ivory-50);border-radius:var(--radius-md)">Aucun bilan enregistre. Le premier sera le debut de votre streak.</div>';
    return;
  }
  host.innerHTML = list.slice(0, 7).map(s => {
    const moodIcon = ['😞','😐','🙂','😊','🤩'][((s.mood || 1) - 1)] || '—';
    const date = (s.date || s.created_at || '').slice(0, 10);
    return `<div class="ev-history-row"><span>${moodIcon} ${escHtml(s.note || s.top1 || 'Bilan ferme')}</span><span class="ev-history-date">${date}</span></div>`;
  }).join('');
}

async function submit(e) {
  e.preventDefault();
  if (state.mood === null) { alert('Indiquez votre humeur du jour.'); return; }
  if (state.energy === null) { alert('Indiquez votre niveau d energie.'); return; }

  const btn = document.querySelector('[data-region="ev-submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Sauvegarde...'; }

  const top1 = document.getElementById('ev-top1')?.value.trim() || '';
  const top2 = document.getElementById('ev-top2')?.value.trim() || '';
  const top3 = document.getElementById('ev-top3')?.value.trim() || '';

  const r = await safeFetch('/api/evening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood: state.mood, energy: state.energy, top1, top2, top3, date: new Date().toISOString().slice(0,10) })
  });

  const host = document.querySelector('[data-region="ev-success-host"]');
  if (r) {
    if (host) host.innerHTML = '<div class="ev-success">✓ Bilan enregistre. Bonne soiree, Major.</div>';
    setTimeout(() => { window.location.href = 'index.html'; }, 1800);
  } else {
    if (host) host.innerHTML = '<div class="ev-success" style="background:var(--danger-50);color:var(--danger);border-color:var(--danger)">✗ Erreur sauvegarde. Reessayez.</div>';
    if (btn) { btn.disabled = false; btn.textContent = 'Cloturer ma journee'; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-region="ev-mood"] .ev-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => selectScale('mood', btn.dataset.mood));
  });
  document.querySelectorAll('[data-region="ev-energy"] .ev-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => selectScale('energy', btn.dataset.energy));
  });
  document.getElementById('ev-form')?.addEventListener('submit', submit);
  loadStreak();
  loadHistory();
});
