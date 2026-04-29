// index-store.js (cockpit) — S6.11-EE-2 L2
// 5 sections : hero greeting / KPIs / cap strategique / velocite 7j / projects-houses / top 3
// Sources : /api/cockpit/today, /api/decisions, /api/projects, /api/contacts, /api/big-rocks, /api/preferences

const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function ico(id) {
  return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}

function fmtDateFr(d) {
  const months = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function computeGreeting(firstName) {
  const h = new Date().getHours();
  const fn = firstName || 'Major';
  if (h < 6)  return { eyebrow: 'NUIT', greeting: `Encore la, ${fn} ?`, lead: 'Si vous insistez, autant que ce soit pour quelque chose qui compte.' };
  if (h < 12) return { eyebrow: 'MATIN', greeting: `Bonjour ${fn}.`, lead: 'Voici votre journee : ce qui compte, ce qui peut attendre.' };
  if (h < 14) return { eyebrow: 'MIDI', greeting: 'Bon midi.', lead: 'Petit reset avant la deuxieme moitie. 3 min suffisent.' };
  if (h < 18) return { eyebrow: 'APRES-MIDI', greeting: `Bon apres-midi.`, lead: 'L energie baisse - on tranche les decisions, on differe l execution lourde.' };
  if (h < 22) return { eyebrow: 'SOIR', greeting: `Bonsoir ${fn}.`, lead: 'C est l heure de fermer la boucle. Bilan rapide ?' };
  return { eyebrow: 'NUIT', greeting: 'Bonsoir tard.', lead: 'Demain est un autre jour. Eteignez en paix.' };
}

async function safeFetch(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
}

// === 1. HERO ===
async function renderHero() {
  const eyebrowEl = document.querySelector('[data-region="ck-eyebrow"]');
  const greetingEl = document.querySelector('[data-region="ck-greeting"]');
  const leadEl = document.querySelector('[data-region="ck-lead"]');

  let firstName = '';
  const prefs = await safeFetch('/api/preferences');
  if (prefs && prefs.preferences) firstName = prefs.preferences['user.firstName'] || '';

  const { eyebrow, greeting, lead } = computeGreeting(firstName);
  if (eyebrowEl)  eyebrowEl.textContent  = `COCKPIT - ${fmtDateFr(new Date())} - ${eyebrow}`;
  if (greetingEl) greetingEl.textContent = greeting;
  if (leadEl)     leadEl.textContent     = lead;
}

// === 2. KPIs ===
async function renderKpis() {
  const host = document.querySelector('[data-region="kpis"]');
  if (!host) return;

  const [decs, projs, contacts, weekly] = await Promise.all([
    safeFetch('/api/decisions'),
    safeFetch('/api/projects'),
    safeFetch('/api/contacts'),
    safeFetch('/api/big-rocks')
  ]);

  const counts = {
    decisions: (decs?.decisions || decs || []).filter(d => d.status === 'open' || d.status === 'a_trancher').length,
    projects:  (projs?.projects || projs || []).filter(p => p.status !== 'archived' && p.status !== 'closed').length,
    contacts:  (contacts?.contacts || contacts || []).length,
    bigRocks:  (weekly?.big_rocks || weekly || []).length
  };

  host.innerHTML = `
    <div class="kpi-tile" data-kpi="decisions">
      <div class="kpi-tile-eyebrow">A trancher</div>
      <div class="kpi-tile-value">${counts.decisions}</div>
      <div class="kpi-tile-label">decisions ouvertes</div>
    </div>
    <div class="kpi-tile" data-kpi="projects">
      <div class="kpi-tile-eyebrow">En cours</div>
      <div class="kpi-tile-value">${counts.projects}</div>
      <div class="kpi-tile-label">projets actifs</div>
    </div>
    <div class="kpi-tile" data-kpi="contacts">
      <div class="kpi-tile-eyebrow">Reseau</div>
      <div class="kpi-tile-value">${counts.contacts}</div>
      <div class="kpi-tile-label">contacts</div>
    </div>
    <div class="kpi-tile" data-kpi="bigrocks">
      <div class="kpi-tile-eyebrow">Big Rocks</div>
      <div class="kpi-tile-value">${counts.bigRocks}<span style="font-size:18px;color:var(--ink-300);font-weight:600">/3</span></div>
      <div class="kpi-tile-label">cette semaine</div>
    </div>
  `;
}

// === 3. CAP STRATEGIQUE ===
async function renderCap() {
  const today = await safeFetch('/api/cockpit/today');
  const txtEl  = document.querySelector('[data-region="ck-cap-text"]');
  const weekEl = document.querySelector('[data-region="ck-cap-week"]');

  if (today?.intention) {
    if (txtEl) txtEl.textContent = today.intention;
  }
  if (today?.week && weekEl) weekEl.textContent = `Semaine ${today.week}`;
}

// === 4. VELOCITE 7 JOURS ===
async function renderVelocity() {
  const grid = document.querySelector('[data-region="ck-velocity-grid"]');
  const meta = document.querySelector('[data-region="ck-velocity-meta"]');
  if (!grid) return;

  // Fetch decisions des 7 derniers jours et compte par jour
  const decs = await safeFetch('/api/decisions');
  const list = decs?.decisions || decs || [];
  const today = new Date(); today.setHours(0,0,0,0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0,10);
    const count = list.filter(x => (x.tranchee_at || x.updated_at || '').slice(0,10) === iso && (x.status === 'tranchee' || x.status === 'closed')).length;
    days.push({ iso, count, label: ['L','M','M','J','V','S','D'][d.getDay() === 0 ? 6 : d.getDay() - 1], isToday: i === 0 });
  }

  const total = days.reduce((s, d) => s + d.count, 0);
  if (meta) meta.textContent = `${total} decision${total > 1 ? 's' : ''} tranchee${total > 1 ? 's' : ''}`;

  grid.innerHTML = days.map(d => {
    let cls = 'is-empty';
    if (d.count >= 4) cls = 'is-high';
    else if (d.count >= 2) cls = 'is-mid';
    else if (d.count >= 1) cls = 'is-low';
    if (d.isToday) cls += ' is-today';
    const display = d.count > 0 ? d.count : '·';
    return `
      <div class="ck-velocity-day">
        <div class="ck-velocity-dot ${cls}" title="${d.iso} : ${d.count} decision(s)">${display}</div>
        <div class="ck-velocity-label">${d.label}</div>
      </div>
    `;
  }).join('');
}

// === 5. PROJECTS-HOUSES ===
async function renderHouses() {
  const host = document.querySelector('[data-region="ck-houses"]');
  if (!host) return;

  const projs = await safeFetch('/api/projects');
  const list = (projs?.projects || projs || []);

  if (!list.length) {
    host.innerHTML = `
      <div class="ck-empty" style="grid-column:1/-1">
        Aucun projet actif. <a href="projets.html" style="color:var(--primary-700)">Creer un projet</a> ou faire un arbitrage matinal pour qu aiCEO en propose.
      </div>
    `;
    return;
  }

  // Trier : alerte > attention > sain ; max 6 cards
  const score = (s) => s === 'alerte' ? 0 : s === 'a_surveiller' ? 1 : 2;
  const sorted = [...list].sort((a, b) => score(a.status) - score(b.status)).slice(0, 6);

  host.innerHTML = sorted.map(p => {
    const status = p.status || 'sain';
    const cls = status === 'alerte' ? 'is-alert' : (status === 'a_surveiller' ? 'is-attention' : 'is-sain');
    const statusLabel = status === 'alerte' ? 'ALERTE' : (status === 'a_surveiller' ? 'A SURVEILLER' : 'SAIN');
    return `
      <a href="projet.html?id=${p.id}" class="ck-house ${cls}">
        <div class="ck-house-name">${escHtml(p.name || p.title || 'Projet')}</div>
        <div class="ck-house-status">${statusLabel}</div>
        <div class="ck-house-meta">
          <span>${p.tasks_count || 0} actions</span>
          <span>${p.decisions_count || 0} decisions</span>
        </div>
      </a>
    `;
  }).join('');
}

// === 6. TOP 3 DU JOUR ===
async function renderTop3() {
  const host = document.querySelector('[data-region="ck-top3"]');
  if (!host) return;

  const tasks = await safeFetch('/api/tasks');
  const list = (tasks?.tasks || tasks || []).filter(t => !t.done && !t.archived);

  // Tri Eisenhower : urgent + important > important > urgent > reste ; max 3
  const score = (t) => {
    const u = t.urgent ? 1 : 0;
    const i = t.important ? 1 : 0;
    return -(u * 2 + i);
  };
  const top = [...list].sort((a, b) => score(a) - score(b)).slice(0, 3);

  if (!top.length) {
    host.innerHTML = `
      <div class="ck-empty" style="grid-column:1/-1">
        Pas d action prioritaire. <a href="taches.html" style="color:var(--primary-700)">Capturer une action</a> ou faire un arbitrage matinal.
      </div>
    `;
    return;
  }

  host.innerHTML = top.map((t, i) => `
    <div class="ck-top3-card">
      <div class="ck-top3-rank">PRIORITE ${i + 1}</div>
      <div class="ck-top3-title">${escHtml(t.title || t.label || 'Action')}</div>
      <div class="ck-top3-meta">
        ${t.due_date ? `Echeance : ${t.due_date} - ` : ''}${t.urgent ? 'urgent' : 'non urgent'} - ${t.important ? 'important' : 'pas decisif'}
      </div>
    </div>
  `).join('');
}

// === Init ===
document.addEventListener('DOMContentLoaded', async () => {
  // Rendu en parallele (chaque section degrade independamment si API down)
  await Promise.all([
    renderHero(),
    renderKpis(),
    renderCap(),
    renderVelocity(),
    renderHouses(),
    renderTop3()
  ]);
  console.info('[cockpit] all sections rendered');
});
