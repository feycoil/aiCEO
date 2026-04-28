// time-filter.js — filtre horizon temporel (Tout horizon / 30 J / 90 J / 1 an)
const DEFAULT_OPTIONS = [
  { value: 'all', label: 'Tout horizon' },
  { value: '30',  label: '30 J' },
  { value: '90',  label: '90 J' },
  { value: '365', label: '1 an' }
];

export default {
  mount(el, props = {}) {
    const id = props.id || 'time';
    const options = props.options || DEFAULT_OPTIONS;
    const active = props.active || (options[0] && options[0].value);
    const region = el.querySelector('[data-region="tf-options"]');
    if (!region) return;
    region.innerHTML = options.map(opt => `
      <button type="button"
              role="tab"
              class="tf-opt${opt.value === active ? ' is-active' : ''}"
              data-value="${opt.value}">${opt.label}</button>
    `).join('');

    region.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-value]');
      if (!btn) return;
      region.querySelectorAll('.tf-opt').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      el.dispatchEvent(new CustomEvent('time:change', {
        bubbles: true,
        detail: { id, value: btn.dataset.value }
      }));
    });
  }
};
