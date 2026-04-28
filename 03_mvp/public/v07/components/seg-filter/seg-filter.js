// seg-filter.js
export default {
  mount(el, props = {}) {
    const id = props.id || 'filter';
    const options = props.options || [];
    const active = props.active || (options[0] || '');
    const region = el.querySelector('[data-region="sf-options"]');
    if (!region) return;
    region.innerHTML = options.map(opt => `
      <button type="button"
              role="tab"
              class="sf-opt${opt === active ? ' is-active' : ''}"
              data-value="${opt}">${opt}</button>
    `).join('');

    region.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-value]');
      if (!btn) return;
      region.querySelectorAll('.sf-opt').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      el.dispatchEvent(new CustomEvent('seg:change', {
        bubbles: true,
        detail: { id, value: btn.dataset.value }
      }));
    });
  }
};
