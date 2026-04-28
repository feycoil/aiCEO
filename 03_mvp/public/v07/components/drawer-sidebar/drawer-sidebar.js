// drawer-sidebar.js — Editorial Executive aligne v06 (sprite SVG)
// S6.10-EE-FIX
function ico(id) {
  return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}

const SECTIONS = [
  {
    title: 'Pilotage',
    items: [
      { id: 'cockpit',     label: 'Cockpit',      href: '../../v06/index.html',      iconId: 'home' },
      { id: 'arbitrage',   label: 'Arbitrage',    href: '../../v06/arbitrage.html',  iconId: 'arbitrage', badgeCount: 0 },
      { id: 'evening',     label: 'Soiree',       href: '../../v06/evening.html',    iconId: 'evening' }
    ]
  },
  {
    title: 'Travail',
    items: [
      { id: 'projets',     label: 'Projets',      href: '../../v06/projets.html',    iconId: 'projects', badgeCount: 0 },
      { id: 'taches',      label: 'Actions',      href: '../../v06/taches.html',     iconId: 'actions', badgeCount: 0 },
      { id: 'agenda',      label: 'Agenda',       href: '../../v06/agenda.html',     iconId: 'calendar' },
      { id: 'assistant',   label: 'Assistant',    href: '../../v06/assistant.html',  iconId: 'sparkle', badge: 'NEW' },
      { id: 'equipe',      label: 'Equipe',       href: '../../v06/equipe.html',     iconId: 'people' }
    ]
  },
  {
    title: 'Capital',
    items: [
      { id: 'connaissance',label: 'Connaissance', href: '../../v06/connaissance.html', iconId: 'knowledge', badge: 'NEW' },
      { id: 'coaching',    label: 'Coaching',     href: '../../v06/coaching.html',     iconId: 'coaching', badge: 'NEW' },
      { id: 'revues',      label: 'Revues',       href: '../../v06/revues.html',     iconId: 'undo' },
      { id: 'decisions',   label: 'Decisions',    href: 'decisions.html',            iconId: 'target' }
    ]
  }
];

// Aide + Reglages : section additionnelle apres Capital (pas avec FOOTER plus, evite duplication avec ds-locale).
const EXTRA_LINKS = [
  { id: 'help',    label: 'Aide',      href: '../../v06/aide.html',        iconId: 'info' },
  { id: 'settings',label: 'Reglages',  href: '../../v06/settings.html',    iconId: 'settings' }
];

function renderItem(item, active) {
  const isActive = item.id === active ? ' is-active' : '';
  const ariaCurrent = item.id === active ? ' aria-current="page"' : '';
  const badge = item.badge
    ? `<span class="ds-badge ds-badge-new">${item.badge}</span>`
    : (item.badgeCount && item.badgeCount > 0 ? `<span class="ds-badge ds-badge-count">${item.badgeCount}</span>` : '');
  return `
    <li class="ds-item${isActive}">
      <a href="${item.href}" class="ds-link"${ariaCurrent}>
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

export default {
  mount(el, props = {}) {
    const active = props.active || el.dataset.active || '';
    const sectionsRegion = el.querySelector('[data-region="ds-sections"]');
    if (sectionsRegion) {
      sectionsRegion.innerHTML = SECTIONS.map(s => renderSection(s, active)).join('');
      sectionsRegion.innerHTML += `
        <div class="ds-section ds-section-extras">
          <ul class="ds-list">
            ${EXTRA_LINKS.map(item => `
              <li class="ds-item">
                <a href="${item.href}" class="ds-link ds-link-extra">
                  ${ico(item.iconId)}
                  <span class="ds-label">${item.label}</span>
                  
                </a>
              </li>
            `).join('')}
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
  }
};
