// header-topbar.js
export default {
  mount(el, props = {}) {
    const title = el.querySelector('[data-region="ht-title"]');
    const sub = el.querySelector('[data-region="ht-sub"]');
    const acts = el.querySelector('[data-region="ht-actions"]');
    if (props.title && title) title.textContent = props.title;
    if (props.subtitle && sub) {
      sub.textContent = props.subtitle;
      sub.hidden = false;
    }
    if (Array.isArray(props.actions) && acts) {
      acts.innerHTML = props.actions.map(a => `
        <button class="btn ${a.primary ? 'btn-pri' : 'btn-sec'} ${a.iconOnly ? 'btn-icon' : ''}"
                ${a.id ? `data-action="${a.id}"` : ''}
                aria-label="${a.label || a.icon || 'action'}">
          ${a.icon ? `<span class="ht-act-ico" aria-hidden="true">${a.icon}</span>` : ''}
          ${!a.iconOnly && a.label ? `<span>${a.label}</span>` : ''}
        </button>
      `).join('');
    }
  }
};
