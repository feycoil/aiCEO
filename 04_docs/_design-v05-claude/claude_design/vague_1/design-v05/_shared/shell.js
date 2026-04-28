// _shared/shell.js — injects the sidebar HTML and sets active nav item.
(function () {
  const ACTIVE = document.body.dataset.nav || '';
  fetch('_shared/sidebar.html').then(r => r.text()).then(html => {
    const slot = document.getElementById('sidebar-slot');
    if (!slot) return;
    slot.outerHTML = html;
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.dataset.key === ACTIVE) el.classList.add('active');
    });
  });

  // State tabs (loading / empty / error / success / streaming variants)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.state-tabs button[data-show]');
    if (!btn) return;
    const tabs = btn.parentElement;
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    const target = btn.dataset.show;
    const scope = tabs.dataset.scope || 'body';
    const root = scope === 'body' ? document : document.querySelector(scope);
    root.querySelectorAll('[data-state]').forEach(el => {
      if (el.dataset.state === target) el.setAttribute('data-active', '');
      else el.removeAttribute('data-active');
    });
  });
})();
