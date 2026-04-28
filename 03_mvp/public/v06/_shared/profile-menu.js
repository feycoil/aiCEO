/* profile-menu.js — Dropdown sur drawer-user */
(function () {
  'use strict';

  function injectCSS() {
    if (document.getElementById('aiceo-profile-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-profile-css';
    s.textContent = `
      .aiceo-profile-menu { position: fixed; bottom: 80px; left: 12px; background: var(--surface-2,#fff); border: 1px solid var(--border,#eee); border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,.15); z-index: 9000; min-width: 220px; overflow: hidden; animation: aiceo-pm-in .15s ease-out; }
      .aiceo-profile-menu button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; background: transparent; border: 0; text-align: left; font-size: 14px; color: var(--text,#111); cursor: pointer; font-family: inherit; }
      .aiceo-profile-menu button:hover { background: var(--surface-3,#eee); }
      .aiceo-profile-menu .danger { color: var(--rose-700,#b35327); }
      .aiceo-profile-menu .danger:hover { background: var(--rose-50,#fdecdf); }
      .aiceo-profile-menu .sep { height: 1px; background: var(--border,#eee); }
      @keyframes aiceo-pm-in { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
    `;
    document.head.appendChild(s);
  }

  let menuEl = null;
  function showMenu() {
    if (menuEl) { closeMenu(); return; }
    injectCSS();
    const m = document.createElement('div');
    m.className = 'aiceo-profile-menu';
    m.innerHTML = `
      <button data-action="profile">👤 Mon profil</button>
      <div class="sep"></div>
      <button data-action="lock">🔒 Verrouiller la session</button>
      <button data-action="onboarding">🌅 Refaire l'onboarding</button>
      <div class="sep"></div>
      <button class="danger" data-action="reset">↺ Réinitialiser mon profil</button>
    `;
    document.body.appendChild(m);
    menuEl = m;
    setTimeout(() => document.addEventListener('click', outsideHandler), 50);
    m.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      closeMenu();
      if (action === 'profile') {
        window.location.href = '/v06/settings.html';
      } else if (action === 'lock') {
        if (window.AICEOShell) window.AICEOShell.showToast('Session verrouillée — bonjour à demain 🌙', 'info');
        setTimeout(() => { window.location.href = '/v06/onboarding.html?lock=1'; }, 1000);
      } else if (action === 'onboarding') {
        window.location.href = '/v06/onboarding.html';
      } else if (action === 'reset') {
        if (!window.AICEOConfirm) return;
        const ok = await window.AICEOConfirm(
          'Vos préférences (prénom, maisons, rituels, coaching) seront effacées. Vos projets, tâches, contacts restent intacts. Vous repasserez par l\'onboarding.',
          { title: 'Réinitialiser mon profil ?', confirmLabel: 'Réinitialiser', cancelLabel: 'Annuler', danger: true }
        );
        if (!ok) return;
        // Delete prefs user.* + onboarding.*
        try {
          const prefs = await fetch('/api/preferences').then(r => r.json());
          for (const k of Object.keys(prefs.preferences || {})) {
            if (k.startsWith('user.') || k.startsWith('onboarding.')) {
              await fetch('/api/preferences/' + encodeURIComponent(k), { method: 'DELETE' });
            }
          }
        } catch(e) {}
        try { sessionStorage.removeItem('aiceo.onboard.redirected'); } catch(e) {}
        if (window.AICEOShell) window.AICEOShell.showToast('Profil réinitialisé', 'success');
        setTimeout(() => { window.location.href = '/v06/onboarding.html'; }, 1000);
      }
    });
  }
  function closeMenu() {
    if (!menuEl) return;
    document.removeEventListener('click', outsideHandler);
    menuEl.remove();
    menuEl = null;
  }
  function outsideHandler(e) {
    if (!menuEl) return;
    if (!menuEl.contains(e.target) && !e.target.closest('.drawer-user')) closeMenu();
  }

  function bindUserBtn() {
    document.addEventListener('click', (e) => {
      const userBtn = e.target.closest('.drawer-user');
      if (!userBtn) return;
      e.preventDefault();
      e.stopPropagation();
      showMenu();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUserBtn);
  else bindUserBtn();
})();
