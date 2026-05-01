// revues-store.js \u2014 Weekly Sync v07 (S6.23) : rituel 3 sections
// Bilan semaine ecoulee + 3 Big Rocks semaine prochaine + Historique

const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Calcul ID semaine ISO (YYYY-Www) selon norme ISO 8601
function getWeekId(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  // Jeudi de la semaine (ISO : la semaine appartient a l annee de son jeudi)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const state = {
  pastWeek: null,         // semaine ecoulee (YYYY-Www)
  nextWeek: null,         // semaine prochaine
  review: null,           // weekly_review pour pastWeek
  rocks: [null, null, null], // 3 big rocks pour nextWeek (positions 1,2,3)
  history: []
};

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { console.warn('[revues] fetch fail', url, e); return null; }
}

// === Toast feedback ===
function showToast(msg, kind) {
  let host = document.querySelector('.ws-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'ws-toast-host';
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  const colors = kind === 'success' ? ['#dcfce7', '#166534'] : kind === 'error' ? ['#fee2e2', '#991b1b'] : ['#fef3c7', '#92400e'];
  t.style.cssText = `background:${colors[0]};color:${colors[1]};border:1px solid ${colors[1]}40;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.08);animation:wsFadeUp .25s`;
  t.textContent = msg;
  host.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2800);
}

function showSaved(region) {
  const el = document.querySelector(`[data-region="${region}"]`);
  if (!el) return;
  el.classList.add('is-visible');
  setTimeout(() => el.classList.remove('is-visible'), 1800);
}

// === Init weeks ===
function initWeeks() {
  const today = new Date();
  // Si on est lundi-mardi : la "semaine ecoulee" est probablement la semaine d avant
  // Si on est mercredi-dimanche : la "semaine ecoulee" est la semaine en cours (qui se termine dimanche)
  // Convention : pastWeek = semaine en cours, nextWeek = semaine suivante
  state.pastWeek = getWeekId(today);
  const next = new Date(today);
  next.setDate(next.getDate() + 7);
  state.nextWeek = getWeekId(next);

  const pastLabel = document.querySelector('[data-region="ws-past-week-label"]');
  const nextLabel = document.querySelector('[data-region="ws-next-week-label"]');
  if (pastLabel) pastLabel.textContent = `Semaine ${state.pastWeek}`;
  if (nextLabel) nextLabel.textContent = `Semaine ${state.nextWeek}`;
}

// === Load review pour past week ===
async function loadCurrentReview() {
  const all = await safeFetch('/api/weekly-reviews');
  const list = all?.reviews || all?.weekly_reviews || (Array.isArray(all) ? all : []);
  state.review = list.find(r => r.week_id === state.pastWeek) || null;

  // Remplir les inputs
  const fields = ['intention', 'bilan', 'cap_prochaine', 'mood', 'notes'];
  for (const f of fields) {
    const el = document.querySelector(`[data-key="${f}"]`);
    if (el && state.review) el.value = state.review[f] || '';
  }

  // Liste historique (sauf semaine en cours)
  state.history = list.filter(r => r.week_id !== state.pastWeek)
    .sort((a, b) => (b.week_id || '').localeCompare(a.week_id || ''))
    .slice(0, 8);
  renderHistory();
}

function renderHistory() {
  const host = document.querySelector('[data-region="ws-history-list"]');
  const count = document.querySelector('[data-region="ws-history-count"]');
  if (count) count.textContent = `${state.history.length} bilan${state.history.length > 1 ? 's' : ''}`;
  if (!host) return;
  if (!state.history.length) {
    host.innerHTML = '<div class="ws-empty">Aucun bilan precedent. Le 1er sera enregistre apres avoir clique "Enregistrer le bilan".</div>';
    return;
  }
  host.innerHTML = state.history.map(r => `
    <div class="ws-history-item">
      <div class="ws-history-week">${escHtml(r.week_id || '?')}</div>
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--ink-900);margin-bottom:4px">${escHtml(r.intention || '(sans intention)')}</div>
        <div class="ws-history-bilan">${escHtml(r.bilan || '(pas de bilan)')}</div>
      </div>
    </div>
  `).join('');
}

// === Load rocks pour next week ===
async function loadCurrentRocks() {
  const all = await safeFetch('/api/big-rocks');
  const list = all?.big_rocks || (Array.isArray(all) ? all : []);
  const forNext = list.filter(r => r.week_id === state.nextWeek);
  // Indexer par ordre 1/2/3
  state.rocks = [null, null, null];
  for (const r of forNext) {
    if (r.ordre >= 1 && r.ordre <= 3) state.rocks[r.ordre - 1] = r;
  }
  renderRocks();
}

function renderRocks() {
  const host = document.querySelector('[data-region="ws-rocks-grid"]');
  if (!host) return;
  host.innerHTML = [1, 2, 3].map(n => {
    const r = state.rocks[n - 1] || { title: '', description: '', status: 'defini' };
    return `
      <div class="ws-rock" data-rock-ordre="${n}">
        <div class="ws-rock-head">
          <span class="ws-rock-num">${n}</span>
          <span class="ws-rock-status is-${escHtml(r.status || 'defini')}">${escHtml(r.status || 'defini')}</span>
        </div>
        <input type="text" class="ws-input" data-rock-field="title" data-rock-ordre="${n}" value="${escHtml(r.title || '')}" placeholder="Big Rock ${n}" />
        <textarea class="ws-textarea" data-rock-field="description" data-rock-ordre="${n}" rows="2" placeholder="Detail / contexte">${escHtml(r.description || '')}</textarea>
      </div>
    `;
  }).join('');
}

// === Auto-draft Claude ===
async function autoDraft() {
  const btn = document.querySelector('[data-action="auto-draft"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Claude reflechit...'; }

  const r = await safeFetch(`/api/weekly-reviews/${state.pastWeek}/draft`, { method: 'POST' });
  if (btn) { btn.disabled = false; btn.textContent = '\u2726 Auto-draft Claude'; }

  if (!r) {
    showToast('Auto-draft echoue. Mode degrade ?', 'error');
    return;
  }

  // Remplit les champs (POST /:week/draft renvoie {intention, bilan, cap_prochaine, mood, notes, ...})
  const fields = ['intention', 'bilan', 'cap_prochaine', 'mood', 'notes'];
  for (const f of fields) {
    const el = document.querySelector(`[data-key="${f}"]`);
    if (el && r[f] !== undefined && r[f] !== null) el.value = r[f] || '';
  }
  showToast('\u2726 Brouillon Claude charge. Editez et enregistrez.', 'success');
}

// === Save bilan ===
async function saveBilan() {
  const btn = document.querySelector('[data-action="save-bilan"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Enregistrement...'; }
  const data = { week: state.pastWeek };
  ['intention', 'bilan', 'cap_prochaine', 'mood', 'notes'].forEach(f => {
    const el = document.querySelector(`[data-key="${f}"]`);
    if (el) data[f] = el.value;
  });
  const r = await safeFetch('/api/weekly-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (btn) { btn.disabled = false; btn.textContent = 'Enregistrer le bilan'; }
  if (!r) { showToast('Erreur enregistrement bilan', 'error'); return; }
  state.review = r.review || r;
  showSaved('ws-bilan-saved');
  showToast('\u2713 Bilan enregistre', 'success');
  // Recharger l historique pour reflet
  await loadCurrentReview();
}

// === Save rocks ===
async function saveRocks() {
  const btn = document.querySelector('[data-action="save-rocks"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Enregistrement...'; }

  const promises = [1, 2, 3].map(n => {
    const titleEl = document.querySelector(`[data-rock-field="title"][data-rock-ordre="${n}"]`);
    const descEl = document.querySelector(`[data-rock-field="description"][data-rock-ordre="${n}"]`);
    const title = titleEl?.value.trim() || '';
    const description = descEl?.value.trim() || '';
    if (!title) return Promise.resolve(null);  // skip rocks vides

    const existing = state.rocks[n - 1];
    const body = {
      week: state.nextWeek,
      ordre: n,
      title,
      description: description || null
    };
    if (existing?.id) body.id = existing.id;  // upsert si existant

    return fetch('/api/big-rocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.ok ? r.json() : null).catch(() => null);
  });

  const results = await Promise.allSettled(promises);
  const ok = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const fail = results.length - ok;

  if (btn) { btn.disabled = false; btn.textContent = 'Sauvegarder les 3 Big Rocks'; }

  if (fail > 0) {
    showToast(`${ok} sauve, ${fail} en erreur`, 'error');
  } else {
    showSaved('ws-rocks-saved');
    showToast(`\u2713 Big Rocks de ${state.nextWeek} sauves`, 'success');
  }

  // Recharger pour avoir les ids serveur
  await loadCurrentRocks();
}

// S6.31 — Auto-suggest 3 Big Rocks depuis decisions tranchees + projets en alerte
async function suggestRocks() {
  const btn = document.querySelector('[data-action="suggest-rocks"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Claude analyse...'; }
  try {
    const r = await fetch('/api/weekly-reviews/' + state.nextWeek + '/suggest-rocks', { method: 'POST' });
    const data = await r.json();
    if (btn) { btn.disabled = false; btn.textContent = 'Suggerer 3 Big Rocks'; }
    if (!r.ok || data.error) {
      showToast('Erreur : ' + (data.error || 'serveur'), 'error');
      return;
    }
    if (!data.suggestions || !data.suggestions.length) {
      showToast(data.message || 'Aucune suggestion', 'warning');
      return;
    }
    data.suggestions.slice(0, 3).forEach(function (s, i) {
      const titleInput = document.querySelector('[data-rock-field="title"][data-rock-ordre="' + (i + 1) + '"]');
      const descInput = document.querySelector('[data-rock-field="description"][data-rock-ordre="' + (i + 1) + '"]');
      if (titleInput && !titleInput.value) titleInput.value = s.title;
      if (descInput && !descInput.value) descInput.value = (s.description || '') + (s.rationale ? '\n[Pourquoi : ' + s.rationale + ']' : '');
    });
    showToast(data.suggestions.length + ' Big Rocks suggeres (' + data.mode + ')', 'success');
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Suggerer 3 Big Rocks'; }
    showToast('Erreur reseau : ' + e.message, 'error');
  }
}

// === Init ===
document.addEventListener('DOMContentLoaded', async () => {
  initWeeks();

  // Bind boutons
  document.querySelector('[data-action="auto-draft"]')?.addEventListener('click', autoDraft);
  document.querySelector('[data-action="save-bilan"]')?.addEventListener('click', saveBilan);
  document.querySelector('[data-action="save-rocks"]')?.addEventListener('click', saveRocks);
  document.querySelector('[data-action="suggest-rocks"]')?.addEventListener('click', suggestRocks);

  // Bind blur des inputs pour auto-save (optionnel, on garde le bouton explicite pour l instant)

  // Charger donnees
  await Promise.all([loadCurrentReview(), loadCurrentRocks()]);

  console.info('[revues] weekly sync ready', {
    pastWeek: state.pastWeek,
    nextWeek: state.nextWeek,
    hasReview: !!state.review,
    rocksCount: state.rocks.filter(Boolean).length,
    history: state.history.length
  });
});
