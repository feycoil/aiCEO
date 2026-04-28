// drawer-sidebar.js — composant atomique
const ITEMS = [
  { id: 'cockpit',     label: 'Cockpit',      href: 'index.html',     icon: '◉' },
  { id: 'arbitrage',   label: 'Arbitrage',    href: 'arbitrage.html', icon: '⇆' },
  { id: 'taches',      label: 'Actions',      href: 'taches.html',    icon: '✓' },
  { id: 'agenda',      label: 'Agenda',       href: 'agenda.html',    icon: '▣' },
  { id: 'evening',     label: 'Soirée',       href: 'evening.html',   icon: '☾' },
  { id: 'projets',     label: 'Projets',      href: 'projets.html',   icon: '◈' },
  { id: 'equipe',      label: 'Équipe',       href: 'equipe.html',    icon: '◎' },
  { id: 'decisions',   label: 'Décisions',    href: 'decisions.html', icon: '◆' },
  { id: 'revues',      label: 'Revues',       href: 'revues.html',    icon: '↻' },
  { id: 'connaissance',label: 'Connaissance', href: 'connaissance.html', icon: '◐', badge: 'NEW' },
  { id: 'assistant',   label: 'Assistant',    href: 'assistant.html', icon: '◯', badge: 'NEW' },
  { id: 'coaching',    label: 'Coaching',     href: 'coaching.html',  icon: '◑', badge: 'NEW' },
  { id: 'settings',    label: 'Réglages',     href: 'settings.html',  icon: '⚙' }
];

export default {
  mount(el, props = {}) {
    const active = props.active || el.dataset.active || '';
    const items = props.items || ITEMS;
    const list = el.querySelector('[data-region="ds-items"]');
    if (!list) return;
    list.innerHTML = items.map(item => `
      <li class="ds-item${item.id === active ? ' is-active' : ''}">
        <a href="${item.href}" class="ds-link">
          <span class="ds-icon" aria-hidden="true">${item.icon}</span>
          <span class="ds-label">${item.label}</span>
          ${item.badge ? `<span class="ds-badge">${item.badge}</span>` : ''}
        </a>
      </li>
    `).join('');
  }
};
