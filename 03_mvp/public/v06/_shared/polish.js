/* polish.js — UX polish v0.6 stable
 * window.AICEOConfirm(message, opts) → Promise<boolean>
 * Toast queue système
 * Offline banner
 * Tooltip system [data-tooltip]
 * Animations micro (hover lift cards)
 */
(function () {
  'use strict';

  function injectCSS() {
    if (document.getElementById('aiceo-polish-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-polish-css';
    s.textContent = `
      /* ── Confirm dialog ── */
      .aiceo-confirm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 11500; display: flex; align-items: center; justify-content: center; padding: 20px; animation: aiceo-fade-in .15s ease-out; }
      .aiceo-confirm { background: var(--surface-2,#fff); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.30); width: 100%; max-width: 440px; padding: 24px; animation: aiceo-slide-up .2s ease-out; }
      .aiceo-confirm-title { font-size: 17px; font-weight: 700; margin: 0 0 8px; color: var(--text,#111); }
      .aiceo-confirm-msg { font-size: 14px; color: var(--text-2,#555); margin: 0 0 20px; line-height: 1.5; }
      .aiceo-confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
      .aiceo-confirm-btn { padding: 10px 18px; border-radius: 8px; border: 1px solid transparent; font-weight: 500; cursor: pointer; font-size: 14px; font-family: inherit; }
      .aiceo-confirm-btn.cancel { background: transparent; color: var(--text-2,#555); }
      .aiceo-confirm-btn.cancel:hover { background: var(--surface-3,#eee); }
      .aiceo-confirm-btn.confirm { background: var(--text,#111); color: #fff; }
      .aiceo-confirm-btn.confirm:hover { background: #2c2f36; }
      .aiceo-confirm-btn.danger { background: var(--rose,#d96d3e); color: #fff; }
      .aiceo-confirm-btn.danger:hover { background: var(--rose-700,#b35327); }

      /* ── Toast queue ── */
      .aiceo-toast-stack { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 10000; pointer-events: none; align-items: center; }
      .aiceo-toast-stack > .aiceo-toast { position: static !important; transform: none !important; pointer-events: auto; left: auto; bottom: auto; }

      /* ── Offline banner ── */
      .aiceo-offline-banner { position: fixed; top: 0; left: 0; right: 0; background: var(--rose,#d96d3e); color: #fff; padding: 8px 16px; text-align: center; font-size: 13px; font-weight: 500; z-index: 12000; transform: translateY(-100%); transition: transform .3s ease; }
      .aiceo-offline-banner.is-visible { transform: translateY(0); }

      /* ── Tooltip ── */
      [data-tooltip] { position: relative; }
      [data-tooltip]:hover::after, [data-tooltip]:focus-visible::after {
        content: attr(data-tooltip); position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
        background: var(--text,#111); color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
        white-space: nowrap; pointer-events: none; z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,.20);
      }
      [data-tooltip]:hover::before, [data-tooltip]:focus-visible::before {
        content: ""; position: absolute; bottom: calc(100% + 1px); left: 50%; transform: translateX(-50%);
        border: 5px solid transparent; border-top-color: var(--text,#111); pointer-events: none; z-index: 9999;
      }

      /* ── Animations micro ── */
      .card, .proj-card, .dec-card, .contact-card, .hub-card { transition: transform .15s ease, box-shadow .15s ease; }
      .card:hover, .proj-card:hover, .dec-card:hover, .contact-card:hover, .hub-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.08); }
      :root[data-reduce-motion="1"] .card:hover, :root[data-reduce-motion="1"] .proj-card:hover { transform: none; }

      /* ── Loading skeleton ── */
      .aiceo-skeleton { background: linear-gradient(90deg, var(--surface-3,#eee) 25%, var(--surface,#f5f3ef) 50%, var(--surface-3,#eee) 75%); background-size: 200% 100%; animation: aiceo-shimmer 1.5s infinite; border-radius: 6px; }
      @keyframes aiceo-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      /* ── Empty state propre ── */
      .aiceo-empty-clean { text-align: center; padding: 48px 24px; color: var(--text-3,#888); }
      .aiceo-empty-clean .icon { font-size: 32px; margin-bottom: 12px; opacity: 0.5; }
      .aiceo-empty-clean h3 { font-size: 16px; font-weight: 600; margin: 0 0 6px; color: var(--text-2,#555); }
      .aiceo-empty-clean p { font-size: 14px; margin: 0 0 16px; }

      /* Animations base */
      @keyframes aiceo-fade-in { from { opacity:0 } to { opacity:1 } }
      @keyframes aiceo-slide-up { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
    `;
    document.head.appendChild(s);
  }

  // ── Confirm dialog ─────────────────────────────────────────────
  window.AICEOConfirm = function (message, opts) {
    return new Promise((resolve) => {
      injectCSS();
      const cfg = Object.assign({
        title: 'Confirmation',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        danger: false
      }, opts || {});

      const backdrop = document.createElement('div');
      backdrop.className = 'aiceo-confirm-backdrop';
      backdrop.innerHTML = `
        <div class="aiceo-confirm" role="dialog" aria-modal="true">
          <h2 class="aiceo-confirm-title">${escapeHtml(cfg.title)}</h2>
          <p class="aiceo-confirm-msg">${escapeHtml(message || '')}</p>
          <div class="aiceo-confirm-actions">
            <button class="aiceo-confirm-btn cancel" type="button">${escapeHtml(cfg.cancelLabel)}</button>
            <button class="aiceo-confirm-btn ${cfg.danger ? 'danger' : 'confirm'}" type="button">${escapeHtml(cfg.confirmLabel)}</button>
          </div>
        </div>
      `;
      const close = (val) => { document.removeEventListener('keydown', onKey); backdrop.remove(); resolve(val); };
      const onKey = (e) => { if (e.key === 'Escape') close(false); if (e.key === 'Enter') close(true); };
      document.addEventListener('keydown', onKey);
      backdrop.querySelector('.cancel').addEventListener('click', () => close(false));
      backdrop.querySelector('.confirm, .danger').addEventListener('click', () => close(true));
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false); });
      document.body.appendChild(backdrop);
      setTimeout(() => backdrop.querySelector('.confirm, .danger').focus(), 50);
    });
  };

  function escapeHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Toast queue (réutilise AICEOShell.showToast mais empile) ──
  const oldToast = window.AICEOShell?.showToast;
  if (oldToast && !window.AICEOShell._toastQueueMonkeyPatched) {
    window.AICEOShell._toastQueueMonkeyPatched = true;
    let stack = null;
    const ensureStack = () => {
      if (!stack || !document.body.contains(stack)) {
        stack = document.createElement('div');
        stack.className = 'aiceo-toast-stack';
        document.body.appendChild(stack);
      }
      return stack;
    };
    window.AICEOShell.showToast = function (msg, kind) {
      injectCSS();
      const s = ensureStack();
      const el = document.createElement('div');
      el.className = 'aiceo-toast aiceo-toast--' + (kind || 'info');
      el.textContent = msg;
      s.appendChild(el);
      setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2400);
      setTimeout(() => el.remove(), 2700);
    };
  }

  // ── Offline banner ─────────────────────────────────────────────
  function setupOffline() {
    injectCSS();
    const banner = document.createElement('div');
    banner.className = 'aiceo-offline-banner';
    banner.innerHTML = '⚠ Connexion serveur perdue — vérification…';
    document.body.appendChild(banner);

    let lastOk = Date.now();
    async function ping() {
      try {
        const r = await fetch('/api/system/health', { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(3000) });
        if (r.ok) {
          banner.classList.remove('is-visible');
          lastOk = Date.now();
        } else if (Date.now() - lastOk > 5000) {
          banner.classList.add('is-visible');
        }
      } catch {
        if (Date.now() - lastOk > 5000) banner.classList.add('is-visible');
      }
    }
    setInterval(ping, 10000);
    window.addEventListener('online', ping);
    window.addEventListener('offline', () => banner.classList.add('is-visible'));
  }

  // ── Replace native confirm() in handlers ──────────────────────
  // (Patches via monkey-patching de window.confirm — opt-in)

  function init() {
    injectCSS();
    setupOffline();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
