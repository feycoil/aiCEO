// drawer-sidebar.js — Editorial Executive aligne v06 (sprite SVG)
// S6.18 : ajout Trajectoire en tete de Capital (vue retrospective)
// S6.22 Lot 6 : puces chiffrees live (Triage/Projects/Actions/Decisions)
function ico(id) {
  return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}

// hrefs : pages v07 = bare filename (pages chargees depuis v07/pages/)
// hrefs : toutes pages migrees v07 (S6.11-EE-fix2). Flag pending:true gere si une page repasse en v06.
const SECTIONS = [
  {
    title: 'Pilotage',
    items: [
      { id: 'cockpit',     label: 'Cockpit',      href: 'index.html',         iconId: 'home' },
      { id: 'arbitrage',   label: 'Triage',       href: 'arbitrage.html',     iconId: 'arbitrage', badgeCount: 0 },
      { id: 'evening',     label: 'Bilan',        href: 'evening.html',       iconId: 'evening' }
    ]
  },
  {
    title: 'Travail',
    items: [
      { id: 'projets',     label: 'Projects',     href: 'projets.html',       iconId: 'projects', badgeCount: 0 },
      { id: 'taches',      label: 'Actions',      href: 'taches.html',        iconId: 'actions', badgeCount: 0 },
      { id: 'agenda',      label: 'Agenda',       href: 'agenda.html',        iconId: 'calendar' },
      { id: 'assistant',   label: 'Assistant',    href: 'assistant.html',     iconId: 'sparkle', badge: 'NEW' },
      { id: 'equipe',      label: 'Equipe',       href: 'equipe.html',        iconId: 'people' }
    ]
  },
  {
    title: 'Capital',
    items: [
      { id: 'trajectoire', label: 'Trajectoire',  href: 'trajectoire.html',   iconId: 'arrow-up-right', badge: 'NEW' },
      { id: 'connaissance',label: 'Connaissance', href: 'connaissance.html',  iconId: 'knowledge', badge: 'NEW' },
      { id: 'coaching',    label: 'Coaching',     href: 'coaching.html',      iconId: 'coaching', badge: 'NEW' },
      { id: 'revues',      label: 'Weekly Sync',  href: 'revues.html',        iconId: 'undo' },
      { id: 'decisions',   label: 'Decisions',    href: 'decisions.html',     iconId: 'target', badgeCount: 0 }
    ]
  }
];

// Aide v07 livree (S6.11-EE-fix2) — S6.39 : ajout Axes (domaines + societes)
const EXTRA_LINKS = [
  { id: 'axes',     label: 'Axes',     href: 'axes.html',           iconId: 'target' },
  { id: 'help',     label: 'Aide',     href: 'aide.html',           iconId: 'info' },
  { id: 'settings', label: 'Reglages', href: 'settings.html',       iconId: 'settings' }
];

function renderItem(item, active) {
  const isActive = item.id === active ? ' is-active' : '';
  const isPending = item.pending ? ' is-pending' : '';
  const ariaCurrent = item.id === active ? ' aria-current="page"' : '';
  const titleAttr = item.pending ? ' title="Page pas encore migree en v07 (pointe vers v06)"' : '';
  let badge = '';
  if (item.pending) {
    badge = '<span class="ds-tag ds-tag-pending">v06</span>';
  } else if (item.badge) {
    badge = `<span class="ds-badge ds-badge-new">${item.badge}</span>`;
  } else if (item.badgeCount && item.badgeCount > 0) {
    badge = `<span class="ds-badge ds-badge-count" data-region="badge-${item.id}">${item.badgeCount}</span>`;
  } else if (typeof item.badgeCount === 'number') {
    // Slot pre-reserve (cache si 0) pour update live S6.22 Lot 6
    badge = `<span class="ds-badge ds-badge-count" data-region="badge-${item.id}" hidden>0</span>`;
  }
  return `
    <li class="ds-item${isActive}${isPending}" data-item-id="${item.id}">
      <a href="${item.href}" class="ds-link"${ariaCurrent}${titleAttr}>
        ${ico(item.iconId)}
        <span class="ds-label">${item.label}</span>
        ${badge}
      </a>
    </li>
  `;
}

function renderSection(section, active) {
  return `
    <div class="ds-section">
      <div class="ds-section-title">${section.title}</div>
      <ul class="ds-list">
        ${section.items.map(item => renderItem(item, active)).join('')}
      </ul>
    </div>
  `;
}

// S6.22 Lot 6 : fetch comptes live (Triage/Projects/Actions/Decisions ouvertes)
async function loadBadgeCounts(el) {
  const safeFetch = async (url, opts) => {
    try {
      const r = await fetch(url, { ...(opts || {}), headers: { 'Accept': 'application/json', ...(opts?.headers || {}) } });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  };
  // analyze-emails est en POST, pas GET. Si echec route, on tente une heuristique
  // sur GET /api/arbitrage qui renvoie souvent l'historique pas le compteur.
  const [projects, tasks, decisions, arbStats] = await Promise.all([
    safeFetch('/api/projects'),
    safeFetch('/api/tasks'),
    safeFetch('/api/decisions'),
    safeFetch('/api/arbitrage/analyze-emails', { method: 'POST' })
  ]);

  // Comptes : projets actifs, tasks non-done, decisions ouvertes, emails arbitrables
  // API formats : {projects:[...]} / {tasks:[...]} / {decisions:[...]}
  const projList = projects?.projects || (Array.isArray(projects) ? projects : []);
  const taskList = tasks?.tasks || (Array.isArray(tasks) ? tasks : []);
  const decList  = decisions?.decisions || (Array.isArray(decisions) ? decisions : []);
  const counts = {
    projets:   projList.filter(p => (p.status || '').toLowerCase() === 'active').length,
    taches:    taskList.filter(t => !t.done).length,
    decisions: decList.filter(d => (d.status || '').toLowerCase() === 'ouverte').length,
    arbitrage: arbStats?.total || arbStats?.total_blocks || 0
  };
  console.info('[drawer-sidebar] counts', counts);

  // Update badges DOM
  Object.entries(counts).forEach(([id, n]) => {
    const slot = el.querySelector(`[data-region="badge-${id}"]`);
    if (!slot) return;
    if (n > 0) {
      slot.textContent = String(n);
      slot.hidden = false;
    } else {
      slot.hidden = true;
    }
  });
}

export default {
  mount(el, props = {}) {
    const active = props.active || el.dataset.active || '';
    const sectionsRegion = el.querySelector('[data-region="ds-sections"]');
    if (sectionsRegion) {
      sectionsRegion.innerHTML = SECTIONS.map(s => renderSection(s, active)).join('');
      sectionsRegion.innerHTML += `
        <div class="ds-section ds-section-extras">
          <ul class="ds-list">
            ${EXTRA_LINKS.map(item => renderItem(item, active)).join('')}
          </ul>
        </div>
      `;
    }

    const userName = el.querySelector('[data-region="ds-user-name"]');
    const userRole = el.querySelector('[data-region="ds-user-role"]');
    const userAvatar = el.querySelector('[data-region="ds-user-avatar"]');
    if (props.user) {
      if (userName && props.user.name) userName.textContent = props.user.name;
      if (userRole && props.user.role) userRole.textContent = props.user.role;
      if (userAvatar && props.user.name) userAvatar.textContent = props.user.name[0].toUpperCase();
    }
    if (props.tenant && props.tenant.label) {
      const tenantLabel = el.querySelector('.ds-tenant-label');
      const tenantAvatar = el.querySelector('.ds-tenant-avatar');
      if (tenantLabel) tenantLabel.textContent = props.tenant.label;
      if (tenantAvatar) tenantAvatar.textContent = props.tenant.label[0].toUpperCase();
    }

    const toggle = el.querySelector('[data-action="toggle"]');
    const root = el.querySelector('[data-region="ds-root"]');
    const STORAGE_KEY = 'aiCEO.uiPrefs.drawer-collapsed';
    let stored = false;
    try { stored = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
    if (root && stored) root.classList.add('is-collapsed');
    if (toggle && root) {
      toggle.addEventListener('click', () => {
        root.classList.toggle('is-collapsed');
        try {
          localStorage.setItem(STORAGE_KEY, root.classList.contains('is-collapsed') ? '1' : '0');
        } catch (e) {}
      });
    }

    // S6.22 Lot 6 : load counts en arriere-plan (non bloquant)
    loadBadgeCounts(el).catch(e => console.warn('[drawer-sidebar] counts load failed', e));
  }
};
