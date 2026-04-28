/* bind-active-nav.js — Active l'item du drawer selon data-route */
(function () {
  'use strict';
  const ROUTE_TO_NAV = {
    home: 'home',
    arbitrage: 'arbitrage',
    evening: 'evening',
    projets: 'projects',
    projet: 'projects',
    taches: 'actions',
    agenda: 'agenda',
    assistant: 'assistant',
    equipe: 'people',
    connaissance: 'knowledge',
    coaching: 'coaching',
    revues: 'revues',
    decisions: 'decisions',
    settings: 'settings',
    aide: 'aide'
  };

  function highlight() {
    const route = document.body.dataset.route || '';
    const navKey = ROUTE_TO_NAV[route];
    if (!navKey) return;
    document.querySelectorAll('.drawer-item').forEach(item => {
      item.classList.remove('is-active');
      item.removeAttribute('aria-current');
    });
    const target = document.querySelector('[data-nav="' + navKey + '"]');
    if (target) {
      target.classList.add('is-active');
      target.setAttribute('aria-current', 'page');
    }
  }

  function init() {
    highlight();
    // Re-apply après mutations DOM
    new MutationObserver(highlight).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
