// trajectoire-store.js — S6.18 page Trajectoire MVP
// Timeline horizontale x axe-Y Streams (groupes), markers carres colores par kind
// Sources : decisions tranchees + big rocks done + projects closed + groups (streams)

const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = {
  period: 30, // jours par defaut
  mode: 'timeline', // ou 'graphe' (S6.23)
  events: [],
  streams: []
};

async function safeFetch(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
}

function periodCutoff(period) {
  if (period === 'all') return new Date(0);
  const days = parseInt(period, 10) || 30;
  return new Date(Date.now() - days * 86400000);
}

function periodLabel(period) {
  const labels = { '7': '7 derniers jours', '30': '30 derniers jours', '90': '90 derniers jours', '180': '6 derniers mois', '365': '12 derniers mois', 'all': 'depuis le debut' };
  return labels[String(period)] || '30 derniers jours';
}

async function loadData() {
  const [decs, brs, projs, groups] = await Promise.all([
    safeFetch('/api/decisions'),
    safeFetch('/api/big-rocks'),
    safeFetch('/api/projects'),
    safeFetch('/api/groups')
  ]);

  // Streams (groupes)
  state.streams = (groups?.groups || groups || []).map(g => ({
    id: g.id,
    name: g.name || g.label || `Stream ${g.id}`,
    description: g.description || ''
  }));

  // Si aucun stream defini, fallback : "General"
  if (!state.streams.length) {
    state.streams = [{ id: null, name: 'General', description: 'Sans Stream' }];
  }

  // Events : decisions tranchees + big rocks done + projects closed
  const events = [];
  (decs?.decisions || decs || []).forEach(d => {
    if (d.status === 'tranchee' || d.status === 'closed') {
      const dt = d.tranchee_at || d.updated_at;
      if (dt) events.push({
        id: d.id, kind: 'decision', date: new Date(dt),
        title: d.title || d.label || 'Decision tranchee',
        streamId: d.group_id || (state.streams[0]?.id ?? null),
        raw: d
      });
    }
  });
  (brs?.big_rocks || brs || []).forEach(b => {
    if (b.status === 'done' || b.completed) {
      const dt = b.completed_at || b.done_at || b.updated_at;
      if (dt) events.push({
        id: b.id, kind: 'bigrock', date: new Date(dt),
        title: b.title || b.label || 'Big Rock atteint',
        streamId: b.group_id || (state.streams[0]?.id ?? null),
        raw: b
      });
    }
  });
  (projs?.projects || projs || []).forEach(p => {
    if (p.status === 'closed' || p.status === 'archived') {
      const dt = p.closed_at || p.archived_at || p.updated_at;
      if (dt) events.push({
        id: p.id, kind: 'project', date: new Date(dt),
        title: p.name || p.title || 'Project clos',
        streamId: p.group_id || (state.streams[0]?.id ?? null),
        raw: p
      });
    }
  });

  state.events = events.filter(e => !isNaN(e.date.getTime()));
}

function renderSummary() {
  const cutoff = periodCutoff(state.period);
  const filtered = state.events.filter(e => e.date >= cutoff);

  const counts = {
    decisions: filtered.filter(e => e.kind === 'decision').length,
    bigrocks: filtered.filter(e => e.kind === 'bigrock').length,
    projects: filtered.filter(e => e.kind === 'project').length,
    streams: new Set(filtered.map(e => e.streamId)).size
  };

  ['decisions','bigrocks','projects','streams'].forEach(k => {
    const el = document.querySelector(`[data-stat="${k}"]`);
    if (el) el.textContent = String(counts[k]);
  });

  const eyebrow = document.querySelector('[data-region="tj-eyebrow"]');
  if (eyebrow) eyebrow.textContent = `TRAJECTOIRE — ${periodLabel(state.period).toUpperCase()}`;
}

function renderTimeline() {
  const host = document.querySelector('[data-region="tj-timeline"]');
  const empty = document.querySelector('[data-region="tj-empty"]');
  if (!host) return;

  const cutoff = periodCutoff(state.period);
  const now = new Date();
  const filtered = state.events.filter(e => e.date >= cutoff);

  if (!filtered.length) {
    host.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }
  host.hidden = false;
  if (empty) empty.hidden = true;

  // Calcul des bornes temporelles
  const minTime = state.period === 'all'
    ? Math.min(...filtered.map(e => e.date.getTime()))
    : cutoff.getTime();
  const maxTime = now.getTime();
  const span = maxTime - minTime;

  // Grouper events par stream
  const eventsByStream = new Map();
  state.streams.forEach(s => eventsByStream.set(s.id, []));
  filtered.forEach(e => {
    if (!eventsByStream.has(e.streamId)) eventsByStream.set(e.streamId, []);
    eventsByStream.get(e.streamId).push(e);
  });

  // Filtrer streams sans events (garder ceux avec au moins 1 event sur la periode)
  const streamsWithEvents = state.streams.filter(s => (eventsByStream.get(s.id) || []).length > 0);

  // Si aucun stream nomme avec events mais des events orphelins, ajouter "General"
  if (!streamsWithEvents.length && filtered.length > 0) {
    streamsWithEvents.push({ id: null, name: 'General', description: '' });
  }

  // Graduations : diviser la periode en 5 segments
  const gradSteps = 5;
  const graduations = [];
  for (let i = 0; i <= gradSteps; i++) {
    const t = minTime + (span * i / gradSteps);
    const d = new Date(t);
    graduations.push({
      pct: (i / gradSteps) * 100,
      label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    });
  }

  // Render rows
  let html = '';

  streamsWithEvents.forEach(stream => {
    const evs = (eventsByStream.get(stream.id) || []).sort((a, b) => a.date - b.date);

    let markersHtml = '';
    // Graduations sur le 1er row uniquement (visuel propre)
    if (stream === streamsWithEvents[0]) {
      graduations.forEach(g => {
        markersHtml += `<div class="tj-graduation" style="left:${g.pct}%"><span class="tj-graduation-label">${g.label}</span></div>`;
      });
    } else {
      graduations.forEach(g => {
        markersHtml += `<div class="tj-graduation" style="left:${g.pct}%"></div>`;
      });
    }

    evs.forEach(e => {
      const t = e.date.getTime();
      const pct = span > 0 ? ((t - minTime) / span) * 100 : 50;
      const symbol = e.kind === 'decision' ? 'D' : (e.kind === 'bigrock' ? '★' : 'P');
      const apiKind = e.kind === 'bigrock' ? 'big-rock' : (e.kind === 'project' ? 'project' : 'decision');
      const mdKind = e.kind === 'project' ? 'project' : (e.kind === 'bigrock' ? 'task' : 'decision');
      const dateStr = e.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      markersHtml += `<span class="tj-marker kind-${e.kind}" style="left:calc(${pct.toFixed(2)}% - 12px)" title="${escHtml(e.title)} - ${dateStr}" data-md-kind="${mdKind}" data-md-id="${e.id}">${symbol}</span>`;
    });

    html += `
      <div class="tj-row">
        <div class="tj-stream-label">
          ${escHtml(stream.name)}
          <span class="tj-stream-meta">${evs.length} event${evs.length > 1 ? 's' : ''}</span>
        </div>
        <div class="tj-track">${markersHtml}</div>
      </div>
    `;
  });

  host.innerHTML = html;
}


function renderGraphe() {
  const svg = document.querySelector('[data-region="tj-graphe-svg"]');
  if (!svg) return;
  const cutoff = periodCutoff(state.period);
  const filtered = state.events.filter(e => e.date >= cutoff);
  if (!filtered.length) {
    svg.innerHTML = '<text x="400" y="240" text-anchor="middle" font-size="14" fill="#6b614f">Aucun evenement sur la periode</text>';
    return;
  }
  // Cluster par kind autour de 3 centres
  const W = 800, H = 480;
  const clusters = [
    { kind: 'decision', cx: 200, cy: 240, color: '#463a54', label: 'Decisions' },
    { kind: 'bigrock',  cx: 400, cy: 120, color: '#c08a2c', label: 'Big Rocks' },
    { kind: 'project',  cx: 600, cy: 360, color: '#115e3c', label: 'Projects clos' }
  ];
  let html = '';
  // Background labels clusters
  clusters.forEach(c => {
    html += '<text class="tj-graphe-cluster-label" x="' + c.cx + '" y="' + (c.cy - 80) + '" text-anchor="middle">' + c.label + '</text>';
  });
  // Liens : chaque event au centre de son cluster (visuel simple)
  filtered.forEach(e => {
    const cl = clusters.find(c => c.kind === e.kind);
    if (!cl) return;
    // Position aleatoire mais deterministe autour du cluster
    const seed = (e.id || 0) * 17 + e.date.getTime() / 86400000;
    const angle = (seed % 360) * Math.PI / 180;
    const radius = 30 + ((seed * 7) % 50);
    const x = cl.cx + Math.cos(angle) * radius;
    const y = cl.cy + Math.sin(angle) * radius;
    e._x = x; e._y = y;
    html += '<line class="tj-graphe-link" x1="' + cl.cx + '" y1="' + cl.cy + '" x2="' + x + '" y2="' + y + '"/>';
  });
  // Centres clusters
  clusters.forEach(c => {
    html += '<circle cx="' + c.cx + '" cy="' + c.cy + '" r="36" fill="' + c.color + '" opacity="0.15"/>';
  });
  // Nodes
  filtered.forEach(e => {
    const cl = clusters.find(c => c.kind === e.kind);
    if (!cl || !e._x) return;
    const symbol = e.kind === 'decision' ? 'D' : (e.kind === 'bigrock' ? '*' : 'P');
    const mdKind = e.kind === 'project' ? 'project' : (e.kind === 'bigrock' ? 'task' : 'decision');
    const dateStr = e.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    html += '<g class="tj-graphe-node" data-md-kind="' + mdKind + '" data-md-id="' + e.id + '">';
    html += '<circle cx="' + e._x + '" cy="' + e._y + '" r="11" fill="' + cl.color + '"/>';
    html += '<text x="' + e._x + '" y="' + (e._y + 4) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">' + symbol + '</text>';
    html += '<title>' + escHtml(e.title) + ' - ' + dateStr + '</title>';
    html += '</g>';
  });
  svg.innerHTML = html;
}

function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.tj-mode-btn').forEach(b => b.classList.toggle('is-active', b.dataset.mode === mode));
  const tlEl = document.querySelector('[data-region="tj-timeline"]');
  const grEl = document.querySelector('[data-region="tj-graphe"]');
  if (mode === 'timeline') {
    if (tlEl) tlEl.hidden = false;
    if (grEl) grEl.hidden = true;
    renderTimeline();
  } else {
    if (tlEl) tlEl.hidden = true;
    if (grEl) grEl.hidden = false;
    renderGraphe();
  }
}

function bindModeFilter() {
  const btns = document.querySelectorAll('.tj-mode-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });
}

function bindPeriodFilter() {
  const btns = document.querySelectorAll('[data-region="tj-period"] .tj-period-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.period = btn.dataset.period === 'all' ? 'all' : parseInt(btn.dataset.period, 10);
      renderSummary();
      if (state.mode === 'timeline') renderTimeline();
      else renderGraphe();
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  bindPeriodFilter();
  bindModeFilter();
  await loadData();
  renderSummary();
  renderTimeline();
  console.info('[trajectoire] rendered', { events: state.events.length, streams: state.streams.length, modes: ['timeline', 'graphe'] });
});
