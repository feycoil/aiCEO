// hub-store.js - S6.19 Lot 1 Hub voix exec moderne
const TILES = {
  pilotage: [
    { id: 'cockpit', name: 'Cockpit', href: 'index.html', iconId: 'home', desc: 'KPIs, North Star, Top 3 du jour, anneau journee.', status: 'live' },
    { id: 'arbitrage', name: 'Triage', href: 'arbitrage.html', iconId: 'arbitrage', desc: 'File emails + focus mode. Le matin, en 5-10 min.', status: 'shell' },
    { id: 'evening', name: 'Bilan', href: 'evening.html', iconId: 'evening', desc: 'Mood, energie, top 3 fait, streak. Le soir, en 3 min.', status: 'live' }
  ],
  deliver: [
    { id: 'projets', name: 'Projects', href: 'projets.html', iconId: 'projects', desc: 'Portefeuille avec auto-status alerte / a-surveiller / sain.', status: 'live' },
    { id: 'taches', name: 'Actions', href: 'taches.html', iconId: 'actions', desc: 'Buckets temporels, Eisenhower, chips Streams.', status: 'live' },
    { id: 'agenda', name: 'Agenda', href: 'agenda.html', iconId: 'calendar', desc: 'Sync Outlook events J-15 a J+30.', status: 'live' },
    { id: 'assistant', name: 'Assistant', href: 'assistant.html', iconId: 'sparkle', desc: 'Chat live SSE Claude Sonnet + sidebar conversations.', status: 'preview' },
    { id: 'equipe', name: 'Equipe', href: 'equipe.html', iconId: 'people', desc: '77 contacts avec recence + volume mails.', status: 'live' }
  ],
  wealth: [
    { id: 'trajectoire', name: 'Trajectoire', href: 'trajectoire.html', iconId: 'arrow-up-right', desc: 'Vue retrospective : Decisions tranchees + Big Rocks + Projects clos.', status: 'live' },
    { id: 'connaissance', name: 'Connaissance', href: 'connaissance.html', iconId: 'knowledge', desc: 'Pins de Decisions / criteres / regles.', status: 'preview' },
    { id: 'coaching', name: 'Coaching', href: 'coaching.html', iconId: 'coaching', desc: 'Pulse signals + 4 questions Sync hebdo.', status: 'preview' },
    { id: 'revues', name: 'Weekly Sync', href: 'revues.html', iconId: 'undo', desc: 'Big Rocks (max 3) + auto-draft Claude.', status: 'live' },
    { id: 'decisions', name: 'Decisions', href: 'decisions.html', iconId: 'target', desc: 'Registre + transitions + IA recommend.', status: 'live' }
  ]
};

const STATUS = { live: { label: 'live', title: 'Page complete' }, shell: { label: 'shell', title: 'A enrichir S6.19+' }, preview: { label: 'preview', title: 'Preview LLM' } };

function ico(id) { return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`; }

function renderTile(t) {
  const s = STATUS[t.status] || STATUS.shell;
  return `<a href="${t.href}" class="hub-tile">
    <div class="hub-tile-head">
      <span class="hub-tile-icon">${ico(t.iconId)}</span>
      <span class="hub-tile-name">${t.name}</span>
      <span class="hub-tile-badge ${t.status}" title="${s.title}">${s.label}</span>
    </div>
    <p class="hub-tile-desc">${t.desc}</p>
  </a>`;
}

function detectChronotype() { const h = new Date().getHours(); if (h < 6) return 'night'; if (h < 12) return 'morning'; if (h < 18) return 'day'; if (h < 22) return 'evening'; return 'night'; }

function computeGreeting(fn) {
  const h = new Date().getHours();
  const n = fn || 'Major';
  if (h < 6) return { eyebrow: 'NUIT', greeting: `Encore la, ${n} ?` };
  if (h < 12) return { eyebrow: 'MATIN', greeting: `Bonjour ${n}.` };
  if (h < 14) return { eyebrow: 'MIDI', greeting: 'Bon midi.' };
  if (h < 18) return { eyebrow: 'APRES-MIDI', greeting: 'Bon apres-midi.' };
  if (h < 22) return { eyebrow: 'SOIR', greeting: `Bonsoir ${n}.` };
  return { eyebrow: 'NUIT', greeting: 'Bonsoir tard.' };
}

function fmtDateFr(d) { const m = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`; }

async function safeFetch(url) { try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); } catch (e) { return null; } }

async function renderTrajectoireMini() {
  const grid = document.querySelector('[data-region="hub-traj-grid"]');
  if (!grid) return;
  const [decs, brs, projs] = await Promise.all([safeFetch('/api/decisions'), safeFetch('/api/big-rocks'), safeFetch('/api/projects')]);
  const decList = decs?.decisions || decs || [];
  const brList = brs?.big_rocks || brs || [];
  const projList = projs?.projects || projs || [];
  const today = new Date(); today.setHours(0,0,0,0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0,10);
    const total = decList.filter(x => (x.tranchee_at||'').slice(0,10) === iso && (x.status==='tranchee'||x.status==='closed')).length
                + brList.filter(x => (x.completed_at||x.done_at||'').slice(0,10) === iso).length
                + projList.filter(x => (x.closed_at||x.archived_at||'').slice(0,10) === iso).length;
    const label = ['L','M','M','J','V','S','D'][d.getDay() === 0 ? 6 : d.getDay() - 1];
    days.push({ iso, total, label, isToday: i === 0 });
  }
  grid.innerHTML = days.map(d => {
    let cls = 'is-empty'; if (d.total >= 5) cls='is-high'; else if (d.total >= 3) cls='is-mid'; else if (d.total >= 1) cls='is-low';
    if (d.isToday) cls += ' is-today';
    const display = d.total > 0 ? d.total : d.label;
    return `<div class="hub-traj-day ${cls}" title="${d.iso} : ${d.total} evenements">${display}</div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.setAttribute('data-chronotype', detectChronotype());
  let fn = '';
  const prefs = await safeFetch('/api/preferences');
  if (prefs && prefs.preferences) fn = prefs.preferences['user.firstName'] || '';
  const { eyebrow, greeting } = computeGreeting(fn);
  const eyebrowEl = document.querySelector('[data-region="hub-eyebrow"]');
  const greetingEl = document.querySelector('[data-region="hub-greeting"]');
  if (eyebrowEl) eyebrowEl.textContent = `HUB - ${fmtDateFr(new Date())} - ${eyebrow}`;
  if (greetingEl) greetingEl.textContent = greeting;
  document.querySelector('[data-region="grid-pilotage"]').innerHTML = TILES.pilotage.map(renderTile).join('');
  document.querySelector('[data-region="grid-deliver"]').innerHTML = TILES.deliver.map(renderTile).join('');
  document.querySelector('[data-region="grid-wealth"]').innerHTML = TILES.wealth.map(renderTile).join('');
  await renderTrajectoireMini();
});
