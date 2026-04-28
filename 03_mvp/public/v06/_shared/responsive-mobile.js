/* responsive-mobile.js — Touch DnD + listes mobile + agenda day-mode */
(function () {
  'use strict';
  if (window.innerWidth >= 1024) return;

  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
      @media (max-width: 767px) {
        /* Listes : stacker en cards */
        .task-row { flex-direction: column !important; align-items: stretch !important; padding: 12px !important; gap: 6px !important; border: 1px solid var(--border,#eee) !important; border-radius: 10px !important; margin-bottom: 8px !important; }
        .task-meta { flex-wrap: wrap !important; gap: 6px !important; }
        .proj-card, .dec-card, .contact-card { padding: 14px !important; }
        /* Modal full-screen mobile */
        .aiceo-modal-backdrop { padding: 0 !important; align-items: flex-end !important; }
        .aiceo-modal { max-width: 100% !important; max-height: 95vh !important; border-radius: 14px 14px 0 0 !important; }
        /* Agenda: 1 jour à la fois */
        .agenda-grid { grid-template-columns: 50px 1fr !important; }
        .agenda-day:not(.is-today) { display: none !important; }
        /* Topbar plus compact */
        .topbar { flex-wrap: wrap !important; gap: 8px !important; padding: 8px 12px !important; }
      }
    `;
    document.head.appendChild(s);
  }

  // Touch DnD natif (polyfill HTML5 DnD pour mobile)
  function bindTouchDnD() {
    if (document.body.dataset.route !== 'arbitrage') return;
    let dragSrc = null, ghost = null;

    document.addEventListener('touchstart', (e) => {
      const card = e.target.closest('[draggable="true"], .task-card, [data-task-id]');
      if (!card || !card.draggable) return;
      dragSrc = card;
      card.style.opacity = '0.5';
      ghost = card.cloneNode(true);
      ghost.style.cssText = 'position:fixed;pointer-events:none;opacity:0.7;z-index:9999;width:' + card.offsetWidth + 'px;left:-9999px;top:-9999px';
      document.body.appendChild(ghost);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!dragSrc || !ghost) return;
      e.preventDefault();
      const t = e.touches[0];
      ghost.style.left = (t.clientX - 50) + 'px';
      ghost.style.top = (t.clientY - 30) + 'px';
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!dragSrc || !ghost) return;
      const t = e.changedTouches[0];
      const target = document.elementFromPoint(t.clientX, t.clientY);
      const col = target?.closest('.board-col, .kanban-col');
      if (col) {
        const list = col.querySelector('.kanban-list, .board-col-body, .o-stack') || col;
        list.appendChild(dragSrc);
        if (window.AICEOShell) window.AICEOShell.showToast('Carte déplacée', 'info');
      }
      dragSrc.style.opacity = '';
      ghost.remove();
      dragSrc = null;
      ghost = null;
    });
  }

  function init() {
    injectCSS();
    bindTouchDnD();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
