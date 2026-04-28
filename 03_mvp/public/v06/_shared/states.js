/* states.js — Helpers globaux pour empty / skeleton / error
 * window.AICEOStates = { empty, skeleton, errorBanner, hideError }
 */
(function () {
  'use strict';

  function injectCSS() {
    if (document.getElementById('aiceo-states-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-states-css';
    s.textContent = `
      .aiceo-empty {
        text-align: center; padding: 48px 24px; color: var(--text-3,#888);
        max-width: 480px; margin: 0 auto;
      }
      .aiceo-empty-icon {
        font-size: 36px; margin-bottom: 14px; opacity: 0.4;
      }
      .aiceo-empty-title {
        font-size: 16px; font-weight: 600; color: var(--text-2,#555);
        margin: 0 0 6px;
      }
      .aiceo-empty-msg {
        font-size: 14px; line-height: 1.5; margin: 0 0 18px;
      }
      .aiceo-empty-cta {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 9px 16px; background: var(--text,#111); color: #fff;
        border-radius: 8px; text-decoration: none; font-size: 13px;
        font-weight: 500; cursor: pointer; border: 0; font-family: inherit;
        transition: background .15s;
      }
      .aiceo-empty-cta:hover { background: #2c2f36; }

      .aiceo-skel-line {
        background: linear-gradient(90deg, var(--surface-3,#eee) 25%, var(--surface,#f5f3ef) 50%, var(--surface-3,#eee) 75%);
        background-size: 200% 100%; animation: aiceo-shimmer 1.5s infinite;
        border-radius: 6px; height: 14px; margin-bottom: 8px;
      }
      .aiceo-skel-card {
        background: var(--surface-2,#fff); border: 1px solid var(--border,#eee);
        border-radius: 12px; padding: 18px;
      }
      @keyframes aiceo-shimmer {
        0% { background-position: 200% 0; } 100% { background-position: -200% 0; }
      }

      .aiceo-error-banner {
        position: fixed; top: 0; left: 0; right: 0;
        padding: 10px 16px; background: var(--rose,#d96d3e); color: #fff;
        text-align: center; font-size: 13px; font-weight: 500;
        z-index: 11999; transform: translateY(-100%);
        transition: transform .3s ease;
      }
      .aiceo-error-banner.is-visible { transform: translateY(0); }
      .aiceo-error-banner button {
        margin-left: 12px; background: rgba(255,255,255,.20); color: #fff;
        border: 0; padding: 4px 10px; border-radius: 6px; cursor: pointer;
        font-size: 12px;
      }
    `;
    document.head.appendChild(s);
  }

  // ── Empty state HTML générique ─────────────────────────────────
  function empty(opts) {
    injectCSS();
    const { icon = '', title = '', msg = '', ctaLabel = '', ctaAction = null, ctaHref = null } = opts || {};
    const el = document.createElement('div');
    el.className = 'aiceo-empty';
    let html = '';
    if (icon)  html += '<div class="aiceo-empty-icon">' + icon + '</div>';
    if (title) html += '<h3 class="aiceo-empty-title">' + title + '</h3>';
    if (msg)   html += '<p class="aiceo-empty-msg">' + msg + '</p>';
    if (ctaLabel) {
      if (ctaHref) {
        html += '<a class="aiceo-empty-cta" href="' + ctaHref + '">' + ctaLabel + '</a>';
      } else {
        html += '<button class="aiceo-empty-cta" type="button">' + ctaLabel + '</button>';
      }
    }
    el.innerHTML = html;
    if (ctaAction && !ctaHref) {
      const btn = el.querySelector('button');
      if (btn) btn.addEventListener('click', ctaAction);
    }
    return el;
  }

  // ── Skeleton lines/cards ───────────────────────────────────────
  function skeleton(opts) {
    injectCSS();
    const { type = 'line', count = 3, container = null } = opts || {};
    const el = document.createElement('div');
    el.className = 'aiceo-skeleton-wrap';
    el.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:12px';
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        const card = document.createElement('div');
        card.className = 'aiceo-skel-card';
        card.innerHTML = `
          <div class="aiceo-skel-line" style="width:60%;height:18px"></div>
          <div class="aiceo-skel-line" style="width:90%"></div>
          <div class="aiceo-skel-line" style="width:75%"></div>
        `;
        el.appendChild(card);
      } else {
        const line = document.createElement('div');
        line.className = 'aiceo-skel-line';
        line.style.width = (60 + Math.random() * 35) + '%';
        el.appendChild(line);
      }
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(el);
    }
    return el;
  }

  // ── Error banner global ────────────────────────────────────────
  let errBanner = null;
  function errorBanner(msg, opts) {
    injectCSS();
    if (!errBanner) {
      errBanner = document.createElement('div');
      errBanner.className = 'aiceo-error-banner';
      document.body.appendChild(errBanner);
    }
    const cfg = opts || {};
    errBanner.innerHTML = '⚠ ' + (msg || 'Une erreur est survenue') +
      '<button type="button" data-close>Fermer</button>' +
      (cfg.retryAction ? '<button type="button" data-retry>Réessayer</button>' : '');
    errBanner.classList.add('is-visible');
    errBanner.querySelector('[data-close]').addEventListener('click', hideError);
    if (cfg.retryAction) {
      errBanner.querySelector('[data-retry]').addEventListener('click', () => {
        hideError();
        cfg.retryAction();
      });
    }
    if (cfg.autoHide !== false) setTimeout(hideError, cfg.duration || 6000);
  }

  function hideError() {
    if (errBanner) errBanner.classList.remove('is-visible');
  }

  // ── Wrapper fetch global avec gestion error ───────────────────
  async function safeFetch(url, opts, errOpts) {
    try {
      const r = await fetch(url, opts);
      if (!r.ok) {
        let msg = 'Erreur ' + r.status;
        try { const j = await r.json(); if (j.error) msg = j.error; } catch {}
        if (!errOpts || !errOpts.silent) errorBanner(msg);
        return null;
      }
      if (r.status === 204) return { _empty: true };
      return await r.json();
    } catch (e) {
      if (!errOpts || !errOpts.silent) {
        errorBanner('Connexion serveur perdue : ' + e.message, { retryAction: () => safeFetch(url, opts, errOpts) });
      }
      return null;
    }
  }

  window.AICEOStates = { empty, skeleton, errorBanner, hideError, safeFetch };
})();
