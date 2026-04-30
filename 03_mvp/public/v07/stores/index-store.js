// index-store.js (Cockpit) - S6.17 / Phase 2 refonte voix exec moderne
// 7 sections : hero greeting Aubrielle chronotype / anneau journee / Ma Trajectoire mini / KPIs parametrables / North Star / Top 3 / Project-glance

const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fmtDateFr(d) {
  const months = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// === Chronotype : detection heure -> data-chronotype + greeting ===
function detectChronotype() {
  const h = new Date().getHours();
  if (h < 6)   return 'night';
  if (h < 12)  return 'morning';
  if (h < 18)  return 'day';
  if (h < 22)  return 'evening';
  return 'night';
}

function computeGreeting(firstName) {
  const h = new Date().getHours();
  const fn = firstName || 'Major';
  if (h < 6)  return { eyebrow: 'NUIT', greeting: `Encore la, ${fn} ?`,    lead: 'Si vous insistez, autant que ce soit pour quelque chose qui compte.' };
  if (h < 12) return { eyebrow: 'MATIN', greeting: `Bonjour ${fn}.`,        lead: 'Voici votre journee : ce qui compte, ce qui peut attendre.' };
  if (h < 14) return { eyebrow: 'MIDI', greeting: `Bon midi.`,              lead: 'Petit reset avant la deuxieme moitie. 3 min suffisent.' };
  if (h < 18) return { eyebrow: 'APRES-MIDI', greeting: `Bon apres-midi.`,  lead: 'L energie baisse — on tranche les Decisions, on differe l execution lourde.' };
  if (h < 22) return { eyebrow: 'SOIR', greeting: `Bonsoir ${fn}.`,         lead: 'La journee se ferme — 3 minutes pour la clore proprement ?' };
  return            { eyebrow: 'NUIT', greeting: 'Bonsoir tard.',           lead: 'Demain est un autre jour. Eteignez en paix.' };
}

async function safeFetch(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
}

// === 1. HERO greeting + chronotype ===
async function renderHero() {
  const eyebrowEl  = document.querySelector('[data-region="ck-eyebrow"]');
  const greetingEl = document.querySelector('[data-region="ck-greeting"]');
  const leadEl     = document.querySelector('[data-region="ck-lead"]');

  // Chronotype sur <html>
  const chrono = detectChronotype();
  document.documentElement.setAttribute('data-chronotype', chrono);

  // Recupere prefs pour le firstName
  let firstName = '';
  const prefs = await safeFetch('/api/preferences');
  if (prefs && prefs.preferences) firstName = prefs.preferences['user.firstName'] || '';

  const { eyebrow, greeting, lead } = computeGreeting(firstName);
  if (eyebrowEl)  eyebrowEl.textContent  = `COCKPIT - ${fmtDateFr(new Date())} - ${eyebrow}`;
  if (greetingEl) greetingEl.textContent = greeting;
  if (leadEl)     leadEl.textContent     = lead;
}

// === 2. ANNEAU JOURNEE (SVG 3 segments) ===
async function renderDayRing() {
  const svg  = document.querySelector('[data-region="ck-day-ring-svg"]');
  const meta = document.querySelector('[data-region="ck-day-meta"]');
  if (!svg) return;

  // Fetch decisions du jour + actions du jour + sync (triage matin + bilan soir)
  const todayIso = new Date().toISOString().slice(0,10);
  const [decs, tasks, eveningRes] = await Promise.all([
    safeFetch('/api/decisions'),
    safeFetch('/api/tasks'),
    safeFetch(`/api/evening?date=${todayIso}`)
  ]);

  const decList = decs?.decisions || decs || [];
  const tasksList = tasks?.tasks || tasks || [];

  const decsToday = decList.filter(d => (d.tranchee_at||'').slice(0,10) === todayIso && (d.status === 'tranchee' || d.status === 'closed')).length;
  const decsTotal = Math.max(decList.filter(d => d.status === 'open' || d.status === 'a_trancher').length + decsToday, 1);

  const actionsToday = tasksList.filter(t => t.done && (t.done_at||'').slice(0,10) === todayIso).length;
  const actionsTotal = Math.max(tasksList.filter(t => !t.done || (t.done_at||'').slice(0,10) === todayIso).length, 1);

  // Sync = 0/1/2 selon triage + bilan
  let syncDone = 0;
  // Heuristique : si on a deja arbitre des emails aujourd'hui (proxy : decisions tranchees ce matin)
  const morningTrancheage = decList.some(d => {
    const dt = d.tranchee_at;
    if (!dt) return false;
    const date = new Date(dt);
    return date.toISOString().slice(0,10) === todayIso && date.getHours() < 12;
  });
  if (morningTrancheage) syncDone++;
  // Bilan soir
  const eveningSession = eveningRes?.sessions?.[0] || (Array.isArray(eveningRes) ? eveningRes[0] : null);
  if (eveningSession) syncDone++;

  // Render SVG : 3 anneaux concentriques
  const cx = 50, cy = 50;
  const radii = [40, 32, 24];
  const widths = [6, 6, 6];
  const colors = ['#463a54', '#115e3c', '#d96d3e'];
  const ratios = [
    Math.min(decsToday / decsTotal, 1),
    Math.min(actionsToday / actionsTotal, 1),
    syncDone / 2
  ];

  let html = '';
  // Background tracks
  radii.forEach((r, i) => {
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ebe7dc" stroke-width="${widths[i]}"/>`;
  });
  // Filled arcs
  radii.forEach((r, i) => {
    const circ = 2 * Math.PI * r;
    const dash = ratios[i] * circ;
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i]}" stroke-width="${widths[i]}" stroke-dasharray="${dash} ${circ}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>`;
  });
  // Center text
  const totalRatio = (ratios[0] + ratios[1] + ratios[2]) / 3;
  const pct = Math.round(totalRatio * 100);
  html += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="800" fill="#1a1612" font-family="Inter, sans-serif">${pct}%</text>`;

  svg.innerHTML = html;

  // Update legend values
  const legD = document.querySelector('[data-leg="decisions"]');
  const legA = document.querySelector('[data-leg="actions"]');
  const legS = document.querySelector('[data-leg="sync"]');
  if (legD) legD.innerHTML = `${decsToday}<span class="total">/${decsTotal}</span>`;
  if (legA) legA.innerHTML = `${actionsToday}<span class="total">/${actionsTotal}</span>`;
  if (legS) legS.innerHTML = `${syncDone}<span class="total">/2</span>`;

  if (meta) {
    if (pct >= 80)      meta.textContent = `journee bien remplie - ${pct}%`;
    else if (pct >= 50) meta.textContent = `journee en cours - ${pct}%`;
    else if (pct >= 20) meta.textContent = `journee en demarrage - ${pct}%`;
    else                meta.textContent = `pas encore commence`;
  }
}

// === 3. BLOC MA TRAJECTOIRE mini (7 derniers jours) ===
async function renderTrajectoireMini() {
  const grid = document.querySelector('[data-region="ck-traj-grid"]');
  const meta = document.querySelector('[data-region="ck-traj-meta"]');
  if (!grid) return;

  // Mix : decisions tranchees + big rocks atteints + projects clos (cf. memo § B5)
  const [decs, bigRocks, projs] = await Promise.all([
    safeFetch('/api/decisions'),
    safeFetch('/api/big-rocks'),
    safeFetch('/api/projects')
  ]);
  const decList = decs?.decisions || decs || [];
  const brList = bigRocks?.big_rocks || bigRocks || [];
  const projList = projs?.projects || projs || [];

  const today = new Date(); today.setHours(0,0,0,0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0,10);

    const decsCount = decList.filter(x => (x.tranchee_at || '').slice(0,10) === iso && (x.status === 'tranchee' || x.status === 'closed')).length;
    const brCount   = brList.filter(x => (x.completed_at || x.done_at || '').slice(0,10) === iso).length;
    const projCount = projList.filter(x => (x.closed_at || x.archived_at || '').slice(0,10) === iso).length;
    const total = decsCount + brCount + projCount;
    const label = ['L','M','M','J','V','S','D'][d.getDay() === 0 ? 6 : d.getDay() - 1];
    days.push({ iso, total, label, isToday: i === 0 });
  }

  const totalAll = days.reduce((s,d) => s + d.total, 0);
  if (meta) meta.textContent = `${totalAll} evenement${totalAll > 1 ? 's' : ''} marquant${totalAll > 1 ? 's' : ''} cette semaine`;

  grid.innerHTML = days.map(d => {
    let cls = 'is-empty';
    if (d.total >= 5)      cls = 'is-high';
    else if (d.total >= 3) cls = 'is-mid';
    else if (d.total >= 1) cls = 'is-low';
    if (d.isToday) cls += ' is-today';
    const display = d.total > 0 ? d.total : '·';
    return `<div class="ck-traj-day ${cls}" title="${d.iso} : ${d.total} evenements">${display}<small style="display:block;font-size:8px;opacity:0.6;font-weight:500">${d.label}</small></div>`;
  }).join('');
}

// === 4. KPIs parametrables (4 tiles) ===
async function renderKpis() {
  const host = document.querySelector('[data-region="kpis"]');
  if (!host) return;

  const [decs, brs, eveningSessions, prefs] = await Promise.all([
    safeFetch('/api/decisions'),
    safeFetch('/api/big-rocks'),
    safeFetch('/api/evening?limit=30'),
    safeFetch('/api/preferences')
  ]);

  const cibles = {
    streak:           parseInt((prefs?.preferences || {})['cible.streak']     || 18, 10),
    decsWeek:         parseInt((prefs?.preferences || {})['cible.decs_week']  || 5,  10),
    bigRocksRatio:    parseFloat((prefs?.preferences || {})['cible.big_rocks'] || 0.67),
    pulseSerenite:    parseFloat((prefs?.preferences || {})['cible.serenite'] || 3.8)
  };

  // Streak : jours consecutifs avec evening session
  const evList = eveningSessions?.sessions || eveningSessions || [];
  const streak = computeStreak(evList);

  // Decisions tranchees cette semaine
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const decsThisWeek = (decs?.decisions || decs || []).filter(d =>
    (d.status === 'tranchee' || d.status === 'closed') &&
    new Date(d.tranchee_at || d.updated_at || 0) >= oneWeekAgo
  ).length;

  // Big Rocks ratio
  const brList = brs?.big_rocks || brs || [];
  const brsDone  = brList.filter(b => b.status === 'done' || b.completed).length;
  const brsTotal = Math.max(brList.length, 1);
  const brsRatio = brsDone / brsTotal;

  // Pulse serenite (moyenne mood 7 derniers jours)
  const recent = evList.slice(0, 7);
  const moodAvg = recent.length > 0
    ? recent.reduce((s, e) => s + (e.mood || 3), 0) / recent.length
    : 0;

  const tiles = [
    {
      eyebrow: 'STREAK',
      value: streak,
      total: cibles.streak,
      unit: 'j',
      label: `cible ${cibles.streak} j`,
      pct: Math.min(streak / cibles.streak, 1)
    },
    {
      eyebrow: 'DECISIONS / SEM',
      value: decsThisWeek,
      total: cibles.decsWeek,
      unit: '',
      label: `cible ${cibles.decsWeek} / sem`,
      pct: Math.min(decsThisWeek / cibles.decsWeek, 1)
    },
    {
      eyebrow: 'BIG ROCKS',
      value: brsDone,
      total: brsTotal,
      unit: '',
      label: `cible ${Math.round(cibles.bigRocksRatio * 100)}%`,
      pct: Math.min(brsRatio / cibles.bigRocksRatio, 1)
    },
    {
      eyebrow: 'PULSE SERENITE',
      value: moodAvg.toFixed(1),
      total: 5,
      unit: '/5',
      label: `cible ${cibles.pulseSerenite}/5`,
      pct: Math.min(moodAvg / cibles.pulseSerenite, 1)
    }
  ];

  host.innerHTML = tiles.map(t => `
    <div class="kpi-tile">
      <div class="kpi-tile-eyebrow">${t.eyebrow}</div>
      <div class="kpi-tile-value">${t.value}<span style="font-size:14px;color:var(--ink-300);font-weight:500">${t.unit}</span></div>
      <div class="kpi-tile-label" style="margin-bottom:6px">${t.label}</div>
      <div style="height:4px;background:var(--ivory-200);border-radius:2px;overflow:hidden">
        <div style="height:100%;background:var(--primary-500, #463a54);width:${Math.round(t.pct * 100)}%;transition:width 600ms cubic-bezier(.16,1,.3,1)"></div>
      </div>
    </div>
  `).join('');
}

function computeStreak(evList) {
  if (!Array.isArray(evList) || !evList.length) return 0;
  const sorted = [...evList].sort((a,b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
  let streak = 0;
  let cursor = new Date(); cursor.setHours(0,0,0,0);
  for (const ev of sorted) {
    const dt = new Date(ev.date || ev.created_at || 0); dt.setHours(0,0,0,0);
    const diff = Math.round((cursor - dt) / 86400000);
    if (diff <= 1) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

// === 5. NORTH STAR ===
async function renderNorthStar() {
  const today = await safeFetch('/api/cockpit/today');
  const txtEl  = document.querySelector('[data-region="ck-ns-text"]');
  const weekEl = document.querySelector('[data-region="ck-ns-week"]');

  if (today?.intention && txtEl) {
    txtEl.innerHTML = escHtml(today.intention);
  }
  if (today?.week && weekEl) weekEl.textContent = `Semaine ${today.week}`;
}

// === 6. TOP 3 du jour (Eisenhower) ===
async function renderTop3() {
  const host = document.querySelector('[data-region="ck-top3"]');
  if (!host) return;

  const tasks = await safeFetch('/api/tasks');
  const list = (tasks?.tasks || tasks || []).filter(t => !t.done && !t.archived);

  const score = (t) => {
    const u = t.urgent ? 1 : 0;
    const i = t.important ? 1 : 0;
    return -(u * 2 + i);
  };
  const top = [...list].sort((a, b) => score(a) - score(b)).slice(0, 3);

  if (!top.length) {
    host.innerHTML = `
      <div class="ck-empty" style="grid-column:1/-1">
        Pas d'Action prioritaire aujourd'hui. <a href="taches.html" style="color:var(--primary-700)">Capturer une Action</a> ou faire un Triage matinal.
      </div>
    `;
    return;
  }

  host.innerHTML = top.map((t, i) => {
    const eis = t.urgent && t.important ? 'Urgent et important'
              : t.urgent ? 'Urgent'
              : t.important ? 'Important'
              : 'Standard';
    return `
      <div class="ck-top3-card" data-md-kind="task" data-md-id="${t.id}">
        <div class="ck-top3-rank">${i + 1}</div>
        <div class="ck-top3-eyebrow">PRIORITE ${i + 1}</div>
        <div class="ck-top3-title">${escHtml(t.title || t.label || 'Action sans titre')}</div>
        <div class="ck-top3-meta">
          ${eis}${t.due_date ? ' · echeance ' + t.due_date : ''}
        </div>
      </div>
    `;
  }).join('');
}

// === 7. PROJECT GLANCE (remplace projects-houses encombrant) ===
async function renderProjectGlance() {
  const projs = await safeFetch('/api/projects');
  const list = (projs?.projects || projs || []);
  const counts = {
    alert: list.filter(p => p.status === 'alerte').length,
    watch: list.filter(p => p.status === 'a_surveiller').length,
    healthy: list.filter(p => p.status === 'sain' || (!p.status && p.status !== 'archived')).length
  };
  const setVal = (key, n) => {
    const el = document.querySelector(`[data-pg="${key}"]`);
    if (el) el.textContent = String(n);
  };
  setVal('alert', counts.alert);
  setVal('watch', counts.watch);
  setVal('healthy', counts.healthy);
}


// === S6.13 Banner LLM live/degrade ===
async function renderLLMStatus() {
  const banner = document.querySelector('[data-region="ck-llm-banner"]');
  const text = document.querySelector('[data-region="ck-llm-text"]');
  if (!banner || !text) return;
  const r = await safeFetch('/api/llm-status');
  if (r?.ready || r?.available || r?.mode === "live") {
    banner.classList.add('is-live');
    banner.classList.remove('is-degraded');
    text.innerHTML = '<strong>Claude live</strong> · 5 surfaces UX activees · IA contextualisee';
  } else {
    banner.classList.add('is-degraded');
    banner.classList.remove('is-live');
    text.innerHTML = '<strong>Mode degrade</strong> · ANTHROPIC_API_KEY absente · regles heuristiques rule-based';
  }
  banner.hidden = false;
}

// === Onboarding auto-redirect (S6.22) ===
async function onboardingRedirectCheck() {
  try {
    const r = await fetch('/api/preferences');
    if (!r.ok) return false;
    const data = await r.json();
    const prefs = data?.preferences || {};
    if (!prefs['user.firstName'] && !prefs['onboarding.completed']) {
      window.location.href = 'onboarding.html';
      return true;
    }
  } catch (e) {}
  return false;
}


// S6.24.2 : mini-card apprentissage Claude sous le banner LLM
async function renderLearningMini() {
  try {
    const r = await fetch('/api/arbitrage/learning-stats');
    if (!r.ok) return;
    const data = await r.json();
    if (!data.total) return;
    const banner = document.querySelector('[data-region="ck-llm-banner"]');
    if (!banner || banner.hidden) return;
    let mini = document.querySelector('[data-region="ck-learning-mini"]');
    if (!mini) {
      mini = document.createElement('div');
      mini.dataset.region = 'ck-learning-mini';
      mini.style.cssText = 'margin-top:8px;font-size:12px;color:var(--ink-500);font-style:italic';
      banner.parentNode.insertBefore(mini, banner.nextSibling);
    }
    mini.innerHTML = `\u2726 Claude a appris <strong style="color:var(--violet-800,#463a54);font-style:normal">${data.total}</strong> patterns. <a href="settings.html#coaching" style="color:var(--violet-800,#463a54)">Voir les stats</a>`;
  } catch (e) { /* swallow */ }
}

// === Init ===
document.addEventListener('DOMContentLoaded', async () => {
  // First launch detection: redirect onboarding if firstName absent
  const redirected = await onboardingRedirectCheck();
  if (redirected) return;
  await Promise.all([
    renderHero(),
    renderLLMStatus(),
    renderDayRing(),
    renderTrajectoireMini(),
    renderKpis(),
    renderNorthStar(),
    renderTop3(),
    renderProjectGlance(),
    renderLearningMini()
  ]);
  console.info('[cockpit S6.17] all sections rendered with voix exec moderne');
});
