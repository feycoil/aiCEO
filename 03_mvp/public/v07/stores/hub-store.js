// hub-store.js — Hub v07 enrichi (S6.11-EE-2 L1.1)
// Rend les 3 vagues de tuiles + greeting contextuel + meta (streak / mode).

const TILES = {
  pilotage: [
    { id: 'cockpit',   name: 'Cockpit',   href: 'index.html',     iconId: 'home',      desc: 'KPIs, cap strategique, top 3 du jour, projets sous tension.', status: 'shell',   meta: 'Quotidien' },
    { id: 'arbitrage', name: 'Arbitrage', href: 'arbitrage.html', iconId: 'arbitrage', desc: 'File emails, focus mode, board drag-drop. Le matin, en 5-10 min.', status: 'shell', meta: 'Matin' },
    { id: 'evening',   name: 'Soiree',    href: 'evening.html',   iconId: 'evening',   desc: 'Humeur, energie, top 3 fait, streak. Le soir, en 3 min.', status: 'shell',   meta: 'Soir' }
  ],
  travail: [
    { id: 'projets',   name: 'Projets',   href: 'projets.html',   iconId: 'projects',  desc: 'Portefeuille avec auto-status alerte / a-surveiller / sain.', status: 'live', meta: 'CRUD' },
    { id: 'taches',    name: 'Actions',   href: 'taches.html',    iconId: 'actions',   desc: 'Buckets temporels, Eisenhower, chips groupes dynamiques.',  status: 'live',  meta: 'Quotidien' },
    { id: 'agenda',    name: 'Agenda',    href: 'agenda.html',    iconId: 'calendar',  desc: 'Sync Outlook events J-15 a J+30.',                          status: 'live',  meta: 'Hebdo' },
    { id: 'assistant', name: 'Assistant', href: 'assistant.html', iconId: 'sparkle',   desc: 'Chat live SSE Claude Sonnet + sidebar conversations.',      status: 'preview', meta: 'LLM' },
    { id: 'equipe',    name: 'Equipe',    href: 'equipe.html',    iconId: 'people',    desc: '77 contacts avec recence + volume mails.',                  status: 'live',  meta: 'CRUD' }
  ],
  capital: [
    { id: 'connaissance', name: 'Connaissance', href: 'connaissance.html', iconId: 'knowledge', desc: 'Pins de decisions / criteres / regles.',         status: 'preview', meta: 'CRUD' },
    { id: 'coaching',     name: 'Coaching',     href: 'coaching.html',     iconId: 'coaching',  desc: 'Signaux faibles + 4 questions LLM contextuelles.', status: 'preview', meta: 'LLM' },
    { id: 'revues',       name: 'Revues hebdo', href: 'revues.html',       iconId: 'undo',      desc: 'Big Rocks (max 3) + auto-draft Claude.',         status: 'live',    meta: 'Hebdo' },
    { id: 'decisions',    name: 'Decisions',    href: 'decisions.html',    iconId: 'target',    desc: 'Registre + transitions + IA recommend.',         status: 'live',    meta: 'CRUD' }
  ]
};

const STATUS_LABELS = {
  live:    { label: 'live',    title: 'Page complete (CRUD ou rituel fonctionnel)' },
  shell:   { label: 'shell',   title: 'Squelette livre (S6.11-EE) - rendu specifique en S6.11-EE-2' },
  preview: { label: 'preview', title: 'Preview LLM ou nouvelle feature' }
};

function ico(id) {
  return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}

function renderTile(tile) {
  const status = STATUS_LABELS[tile.status] || STATUS_LABELS.shell;
  return `
    <a href="${tile.href}" class="hub-tile" data-tile-id="${tile.id}">
      <div class="hub-tile-head">
        <span class="hub-tile-icon">${ico(tile.iconId)}</span>
        <span class="hub-tile-name">${tile.name}</span>
        <span class="hub-tile-badge ${tile.status}" title="${status.title}">${status.label}</span>
      </div>
      <p class="hub-tile-desc">${tile.desc}</p>
      <div class="hub-tile-meta">${tile.meta}</div>
    </a>
  `;
}

function renderGrid(region, tiles) {
  const el = document.querySelector(`[data-region="${region}"]`);
  if (el) el.innerHTML = tiles.map(renderTile).join('');
}

function computeGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { eyebrow: 'NUIT', greeting: 'Encore la, Major ?' };
  if (h < 12) return { eyebrow: 'MATIN', greeting: 'Bonjour Major.' };
  if (h < 14) return { eyebrow: 'MIDI', greeting: 'Bon midi.' };
  if (h < 18) return { eyebrow: 'APRES-MIDI', greeting: 'Bon apres-midi.' };
  if (h < 22) return { eyebrow: 'SOIR', greeting: 'Bonsoir Major.' };
  return { eyebrow: 'NUIT', greeting: 'Bonsoir tard.' };
}

function fmtDateFr(d) {
  const months = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function fetchStreakAndMode() {
  // Tente l API streak (route soir) ; fallback 0 si erreur
  try {
    const r = await fetch('/api/evening/streak');
    if (r.ok) {
      const data = await r.json();
      return { streak: data.streak || 0, mode: 'rituel actif' };
    }
  } catch (e) {}
  return { streak: 0, mode: 'pas encore initie' };
}

document.addEventListener('DOMContentLoaded', async () => {
  // Greeting + date
  const { eyebrow, greeting } = computeGreeting();
  const eyebrowEl  = document.querySelector('[data-region="hub-eyebrow"]');
  const greetingEl = document.querySelector('[data-region="hub-greeting"]');
  if (eyebrowEl)  eyebrowEl.textContent  = `HUB - ${fmtDateFr(new Date())} - ${eyebrow}`;
  if (greetingEl) greetingEl.textContent = greeting;

  // Grids
  renderGrid('grid-pilotage', TILES.pilotage);
  renderGrid('grid-travail',  TILES.travail);
  renderGrid('grid-capital',  TILES.capital);

  // Streak + mode (async, non bloquant)
  const { streak, mode } = await fetchStreakAndMode();
  const streakEl = document.querySelector('[data-region="hub-streak"]');
  const modeEl   = document.querySelector('[data-region="hub-mode"]');
  if (streakEl) streakEl.textContent = `Streak : ${streak} jour${streak > 1 ? 's' : ''}`;
  if (modeEl)   modeEl.innerHTML     = `Mode : <strong>${mode}</strong>`;

  console.info('[hub] rendered', { tiles: TILES.pilotage.length + TILES.travail.length + TILES.capital.length, streak });
});
