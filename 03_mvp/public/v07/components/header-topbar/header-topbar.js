// header-topbar.js — Editorial Executive aligne v06 (sprite SVG)
// S6.10-EE-FIX
import { ComponentLoader } from '../../shared/component-loader.js';

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeJsonAttr(s) { return String(s).replace(/'/g, '&#39;'); }
function ico(id) {
  if (!id) return '';
  return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}

export default {
  mount(el, props = {}) {
    const title = el.querySelector('[data-region="ht-title"]');
    const sub = el.querySelector('[data-region="ht-sub"]');
    const breadcrumb = el.querySelector('[data-region="ht-breadcrumb"]');
    const tools = el.querySelector('[data-region="ht-tools"]');
    const acts = el.querySelector('[data-region="ht-actions"]');

    if (props.title && title) title.textContent = props.title;
    if (props.subtitle && sub) {
      sub.textContent = props.subtitle;
      sub.hidden = false;
    }
    if (props.breadcrumb && breadcrumb) {
      const items = Array.isArray(props.breadcrumb) ? props.breadcrumb : [{ label: props.breadcrumb }];
      breadcrumb.innerHTML = items.map((b, i) => {
        const sep = i > 0 ? '<span class="ht-bc-sep" aria-hidden="true">/</span>' : '';
        const item = b.href
          ? `<a href="${b.href}" class="ht-bc-link">${escapeHtml(b.label)}</a>`
          : `<span class="ht-bc-current">${escapeHtml(b.label)}</span>`;
        return sep + item;
      }).join('');
      breadcrumb.hidden = false;
    }
    if (props.search && tools) {
      tools.innerHTML = `<div data-component="search-pill" data-props='${escapeJsonAttr(JSON.stringify({ placeholder: props.search.placeholder || 'Rechercher...' }))}'></div>`;
      ComponentLoader.refresh(tools);
    }
    if (Array.isArray(props.actions) && acts) {
      acts.innerHTML = props.actions.map(a => `
        <button class="btn ${a.primary ? 'btn-pri' : 'btn-sec'} ${a.iconOnly ? 'btn-icon' : ''}"
                ${a.id ? `data-action="${a.id}"` : ''}
                aria-label="${a.label || a.iconId || 'action'}">
          ${a.iconId ? ico(a.iconId) : ''}
          ${!a.iconOnly && a.label ? `<span>${a.label}</span>` : ''}
        </button>
      `).join('');
    }
  }
};
