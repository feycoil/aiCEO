/* mobile.js — Burger menu + drawer off-canvas <640px */
(function () {
  'use strict';
  if (window.innerWidth >= 640) {
    // Pas mobile, mais on prépare au cas où resize
    setupResizeListener();
    return;
  }
  injectBurger();
  setupResizeListener();

  function injectBurger() {
    if (document.getElementById('aiceo-burger')) return;
    const s = document.createElement('style');
    s.textContent = `
      @media (max-width: 639px) {
        #aiceo-burger { position: fixed; top: 14px; left: 14px; width: 40px; height: 40px; background: var(--surface-2,#fff); border: 1px solid var(--border,#eee); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.10); z-index: 9000; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .app[data-drawer-mobile="open"] .drawer { display: flex !important; position: fixed !important; inset: 0; width: 280px; z-index: 9500; box-shadow: 4px 0 24px rgba(0,0,0,.20); animation: aiceo-drawer-in .25s ease-out; }
        .app[data-drawer-mobile="open"]::before { content: ""; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 9400; }
        @keyframes aiceo-drawer-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .topbar, .app-main { padding-top: 56px; }
      }
    `;
    document.head.appendChild(s);

    const btn = document.createElement('button');
    btn.id = 'aiceo-burger';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const app = document.querySelector('.app');
      if (!app) return;
      const open = app.dataset.drawerMobile === 'open';
      app.dataset.drawerMobile = open ? '' : 'open';
    });
    document.body.appendChild(btn);

    // Fermer drawer au clic backdrop
    document.addEventListener('click', (e) => {
      const app = document.querySelector('.app');
      if (!app || app.dataset.drawerMobile !== 'open') return;
      // Si clic dans le drawer ou sur burger, ne ferme pas
      if (e.target.closest('.drawer') || e.target.closest('#aiceo-burger')) return;
      app.dataset.drawerMobile = '';
    });
  }

  function setupResizeListener() {
    window.addEventListener('resize', () => {
      if (window.innerWidth < 640 && !document.getElementById('aiceo-burger')) {
        injectBurger();
      }
    });
  }
})();
