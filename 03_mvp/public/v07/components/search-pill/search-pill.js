// search-pill.js
export default {
  mount(el, props = {}) {
    const input = el.querySelector('[data-region="sp-input"]');
    if (!input) return;
    if (props.placeholder) input.placeholder = props.placeholder;

    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        el.dispatchEvent(new CustomEvent('search:change', {
          bubbles: true,
          detail: { query: input.value.trim() }
        }));
      }, 180);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { input.value = ''; input.blur();
        el.dispatchEvent(new CustomEvent('search:change', { bubbles: true, detail: { query: '' } }));
      }
    });
  }
};
