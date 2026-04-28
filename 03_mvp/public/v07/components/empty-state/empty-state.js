// empty-state.js
const ICONS = {
  target: '◎', search: '⌕', folder: '◇', sparkle: '✦', circle: '◌',
  decision: '◆', knowledge: '◐', note: '◷'
};

export default {
  mount(el, props = {}) {
    const ico = el.querySelector('[data-region="es-icon"]');
    const title = el.querySelector('[data-region="es-title"]');
    const desc = el.querySelector('[data-region="es-desc"]');
    const cta = el.querySelector('[data-region="es-cta"]');

    if (ico && props.icon) ico.textContent = ICONS[props.icon] || ICONS.circle;
    if (title) title.textContent = props.title || 'Rien à afficher';
    if (desc) {
      desc.textContent = props.description || '';
      desc.hidden = !props.description;
    }
    if (cta && props.cta) {
      cta.innerHTML = `<a href="${props.cta.href}" class="btn btn-pri">${props.cta.label}</a>`;
    }
  }
};
