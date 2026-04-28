/* shell.js v4 — Cohérence v0.6 + grisage features preview */
(function () {
  'use strict';
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const $  = (s, r=document) => r.querySelector(s);

  const CONFIG = window.AICEO_CONFIG || {
    userName:    'Major Fey',
    userInitials:'MF',
    userRole:    'CEO',
    tenantName:  'ETIC Services',
    tenantMark:  'E',
    locale:      'Français'
  };

  // Mapping data-route (body) → href du drawer item à marquer actif
  const ROUTE_TO_HREF = {
    home:'index.html', arbitrage:'arbitrage.html', evening:'evening.html',
    taches:'taches.html', agenda:'agenda.html', revues:'revues.html',
    assistant:'assistant.html', projets:'projets.html', projet:'projets.html',
    equipe:'equipe.html', connaissance:'connaissance.html', coaching:'coaching.html',
    decisions:'decisions.html', settings:'settings.html'
  };

  // Pages "preview" — visuel statique, données simulées
  // Ces hrefs seront grisés dans le drawer (badge "preview")
  const PREVIEW_HREFS = {
    'connaissance.html': 'Données simulées · branchement V1',
    'coaching.html':     'Données simulées · branchement V1',
    'assistant.html':    'Chat IA simulé · SSE complet en V0.7'
  };
  const PREVIEW_ROUTES = new Set(['connaissance', 'coaching', 'assistant']);

  function markActive() {
    const route = document.body.dataset.route || '';
    const targetHref = ROUTE_TO_HREF[route];
    if (!targetHref) return;
    $$('.drawer-item').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/^.*\//, '');
      if (href === targetHref) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('is-active');
        a.removeAttribute('aria-current');
      }
    });
  }

  // Mapping feature → version cible
  const VERSION_MAP = {
    'assistant.html':    'v0.7',
    'connaissance.html': 'v0.7',
    'coaching.html':     'v0.8'
  };
  function getVersionLabel(href, elem) {
    if (VERSION_MAP[href]) return VERSION_MAP[href];
    const navKey = elem && elem.dataset && elem.dataset.nav || '';
    if (/^assistant|knowledge|connaissance|sync/.test(navKey)) return 'v0.7';
    if (/coaching|posture/.test(navKey)) return 'v0.8';
    const text = (elem && elem.textContent || '').toLowerCase();
    if (/coaching|posture/.test(text)) return 'v0.8';
    return 'v0.7';
  }

  function markPreview() {
    $$('.drawer-item').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/^.*\//, '');
      const tip = PREVIEW_HREFS[href];
      if (tip) {
        a.classList.add('is-preview');
        a.setAttribute('title', tip);
        // Ajout d'un badge "preview" si pas déjà
        if (!a.querySelector('.badge-preview')) {
          const b = document.createElement('span');
          b.className = 'badge-preview';
          b.textContent = getVersionLabel(href, a);
          a.appendChild(b);
        }
      }
    });
  }

  function applyUserContext() {
    // Priorité : window.AICEO_USER (depuis /api/preferences) > CONFIG default
    const u = window.AICEO_USER || CONFIG;
    const userName = u.userName || u.firstName || CONFIG.userName;
    const userInitials = u.userInitials || ((userName.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)) || 'U');
    const userRole = u.userRole || CONFIG.userRole;
    const tenantName = u.tenantName || CONFIG.tenantName;
    const tenantMark = u.tenantMark || CONFIG.tenantMark;
    const locale = u.locale || CONFIG.locale;
    $$('.tenant-name').forEach(el => el.textContent = tenantName);
    $$('.tenant-mark').forEach(el => el.textContent = tenantMark);
    $$('.drawer-user .name').forEach(el => el.textContent = userName);
    $$('.drawer-user .role').forEach(el => el.textContent = userRole);
    $$('.drawer-user .avatar').forEach(el => el.textContent = userInitials);
    $$('.locale-name').forEach(el => el.textContent = locale);
    // Ajout span "FR" pour mode collapsed (juste après .locale-name)
    $$('.drawer-locale').forEach(btn => {
      if (btn.querySelector('.locale-code')) return;
      const code = document.createElement('span');
      code.className = 'locale-code';
      code.textContent = (CONFIG.locale || 'Français').slice(0, 2).toUpperCase();
      const nameSpan = btn.querySelector('.locale-name');
      if (nameSpan) nameSpan.parentNode.insertBefore(code, nameSpan.nextSibling);
      else btn.appendChild(code);
    });
  }

  function injectPreviewBanner() {
    const route = document.body.dataset.route || '';
    if (!PREVIEW_ROUTES.has(route)) return;
    if (document.querySelector('.aiceo-preview-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'aiceo-preview-banner';
    const labels = {
      connaissance: 'Connaissance — bientôt · données simulées · branchement complet en V1',
      coaching:     'Coaching — bientôt · données simulées · branchement complet en V1',
      assistant:    'Assistant IA — bientôt · le chat streaming SSE arrive en v0.7'
    };
    banner.innerHTML = '<span style="margin-right:8px">⚠</span>' + (labels[route] || 'Bientôt');
    banner.style.cssText = [
      'position:sticky','top:0','z-index:50',
      'padding:10px 20px','background:var(--amber-50,#f5e8d6)',
      'color:var(--amber-800,#6d4816)','font-size:13px','font-weight:500',
      'text-align:center','border-bottom:1px solid var(--amber,#b88237)'
    ].join(';');
    const main = $('main, .app-main, .page-main, .app > .main') || document.body;
    main.insertBefore(banner, main.firstChild);
  }

  function injectCSS() {
    if (document.getElementById('aiceo-shell-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-shell-css';
    s.textContent = [
      // ── Override fond global (lavande Twisty trop saturé) ──
      ':root{--bg: #f5f3ef !important}',
      'html, body{background:#f5f3ef !important;background-color:#f5f3ef !important}',
      '.app{background:#f5f3ef !important}',

      // ── Drawer items ──
      '.drawer-item.is-active{background:var(--surface-3,#e7e3d9);font-weight:600}',
      '.drawer-item.is-preview{opacity:.7}',
      '.drawer-item.is-preview:hover{opacity:1}',
      '.badge-soon, .badge-preview{margin-left:auto;font-size:9px;text-transform:uppercase;',
        'letter-spacing:.05em;padding:2px 6px;border-radius:99px;',
        'font-weight:600;line-height:1;align-self:center}',
      '.badge-soon{background:var(--surface-3,#eee);color:var(--text-3,#888)}',
      '.badge-preview{background:var(--amber-50,#f5e8d6);color:var(--amber-800,#6d4816);',
        'border:1px solid var(--amber,#b88237)}',

      // ── Toggle Jour/Semaine/Mois (.seg) ──
      '.seg{display:inline-flex;background:var(--surface-3,#eeebe4);border-radius:8px;padding:3px;gap:2px}',
      '.seg-btn{padding:6px 14px;font-size:13px;font-weight:500;color:var(--text-2,#4a4f5a);',
        'background:transparent;border:0;border-radius:6px;cursor:pointer;font-family:inherit;transition:all .15s}',
      '.seg-btn:hover{color:var(--text,#111)}',
      '.seg-btn.is-active{background:var(--surface-2,#fff);color:var(--text,#111);',
        'box-shadow:0 1px 2px rgba(0,0,0,.06);font-weight:600}',

      // ── Topbar week-nav (boutons fléchés agenda) ──
      '.topbar-week-nav{display:flex;gap:4px;align-items:center}',
      '.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;',
        'background:transparent;border:1px solid var(--border,#eee);border-radius:8px;cursor:pointer;color:var(--text-2,#4a4f5a)}',
      '.icon-btn:hover{background:var(--surface-3,#eee);color:var(--text,#111)}',

      // ── Toast ──
      '.aiceo-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);',
      'padding:12px 18px;border-radius:10px;background:var(--text,#111);color:#fff;',
      'box-shadow:0 6px 24px rgba(0,0,0,.18);z-index:9999;font-size:14px;',
      'animation:aiceoToastIn 200ms ease-out}',
      '@keyframes aiceoToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}',
      'to{opacity:1;transform:translateX(-50%) translateY(0)}}',
      // ── Settings page : tabs + panels ──
      '.settings-grid{display:grid;grid-template-columns:240px 1fr;gap:var(--space-5,24px);align-items:start}',
      '@media (max-width: 768px){.settings-grid{grid-template-columns:1fr}}',
      '.settings-tabs{display:flex;flex-direction:column;gap:2px;position:sticky;top:80px}',
      '.settings-tab svg{color:currentColor;width:16px;height:16px;flex-shrink:0}',
      '.settings-section{display:none}',
      '.settings-section.is-visible{display:block}',
      '.settings-panel{display:flex;flex-direction:column;gap:var(--space-4,16px)}',
          // ── Drawer collapsed : cacher badges + scrollbar + locale FR ──
      '.app[data-drawer="collapsed"] .drawer-item .badge-preview,',
      '.app[data-drawer="collapsed"] .drawer-item .badge-soon,',
      '.app[data-drawer="collapsed"] .drawer-locale .locale-name, .app[data-drawer="collapsed"] .drawer-locale > svg { display: none !important; }',
      // Locale code FR en collapsed
      '.app[data-drawer="collapsed"] .drawer-locale .locale-code { display: inline; font-weight: 700; font-size: 11px; }',
      '.drawer-locale .locale-code { display: none; color: var(--text-2); font-weight: 600; font-size: 12px; }',
      // Cacher scrollbar drawer (mais garder scroll fonctionnel)
      '.drawer { scrollbar-width: none; -ms-overflow-style: none; overflow-y: auto; overflow-x: visible !important; }',
      '.drawer::-webkit-scrollbar { display: none; width: 0; height: 0; }',
      '.drawer-nav { overflow-y: auto; overflow-x: visible; scrollbar-width: none; }',
      '.drawer-nav::-webkit-scrollbar { display: none; }',
'.app { overflow: visible !important; }',
      '.drawer { position: relative !important; }',
      // drawer-collapse-btn rendu plus visible
      '.drawer-collapse-btn { position: absolute !important; color: var(--text, #111) !important; background: var(--surface-2, #fff) !important; box-shadow: 0 2px 10px rgba(0,0,0,.20) !important; transition: all .2s !important; width: 28px !important; height: 28px !important; right: -14px !important; top: 50% !important; transform: translateY(-50%) !important; bottom: auto !important; left: auto !important; opacity: 1 !important; z-index: 1000 !important; border: 1px solid var(--border, #e0e0e0) !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; }',
      '.app[data-drawer="collapsed"] .drawer-collapse-btn { width: 16px !important; height: 36px !important; right: -16px !important; border-radius: 0 8px 8px 0 !important; border-left: 0 !important; box-shadow: 2px 2px 8px rgba(0,0,0,.15) !important; }',
      '.app[data-drawer="collapsed"] .drawer-collapse-btn svg { width: 12px !important; height: 12px !important; transform: rotate(180deg); }',
      // Mode collapsed : centrer le bouton (pas de superposition avec l'avatar)
      // Cacher le logo aiCEO en collapsed (le bouton prend sa place)
      '.drawer-collapse-btn svg { width: 18px !important; height: 18px !important; stroke-width: 2 !important; color: var(--text, #111) !important; }',
      '.drawer-collapse-btn::before { content: ""; position: absolute; inset: -8px; border-radius: 50%; }',
      '.drawer-collapse-btn:hover { background: var(--text, #111) !important; color: #fff !important; box-shadow: 0 4px 16px rgba(0,0,0,.25) !important; }',
      '.app[data-drawer="collapsed"] .drawer-collapse-btn:hover { width: 22px !important; transform: translateY(-50%) !important; }',
      /* svg styled inline above */
      // ── Responsive : drawer visible en tablette (collapsed), off-canvas en mobile ──
      '@media (min-width: 640px) and (max-width: 1023px) { .drawer { display: flex !important; } .app { grid-template-columns: var(--drawer-w-collapsed) 1fr !important; } .app[data-drawer="expanded"] { grid-template-columns: var(--drawer-w-expanded) 1fr !important; } }',
      '@media (max-width: 639px) { .drawer { display: none !important; } .app { grid-template-columns: 1fr !important; } #aiceo-float-toggle { display: none !important; } }',
          // ── Pages preview : visuel atténué (non développées) ──
      'body[data-route="connaissance"] main, body[data-route="coaching"] main, body[data-route="connaissance"] .app-main, body[data-route="coaching"] .app-main { filter: grayscale(0.4) opacity(0.7); transition: filter .3s ease; pointer-events: auto; }',
      'body[data-route="connaissance"] main:hover, body[data-route="coaching"] main:hover, body[data-route="connaissance"] .app-main:hover, body[data-route="coaching"] .app-main:hover { filter: grayscale(0.2) opacity(0.85); }',
      // Banner preview plus marqué (au-dessus du filtre)
      '.aiceo-preview-banner { filter: none !important; opacity: 1 !important; position: sticky; top: 0; z-index: 100; }',
      // Items drawer preview plus discrets
      '.drawer-item.is-preview .label { color: var(--text-3, #888); font-style: italic; }',
          // ── Boutons non branchés (auto-detect) ────────────────────────
      '.aiceo-disabled-btn { opacity: 0.4 !important; cursor: not-allowed !important; pointer-events: none !important; filter: grayscale(0.6); }',
      '.aiceo-preview-btn { opacity: 0.85 !important; position: relative !important; cursor: help !important; }',
      '.aiceo-preview-btn::after { content: "v0.7"; position: absolute; top: -8px; right: -8px; background: var(--amber-50, #f5e8d6); color: var(--amber-800, #6d4816); font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.04em; border: 1px solid var(--amber, #b88237); pointer-events: none; line-height: 1; z-index: 10; }',
        ].join('');
    document.head.appendChild(s);
  }

  function showToast(msg, kind) {
    const el = document.createElement('div');
    el.className = 'aiceo-toast aiceo-toast--' + (kind || 'info');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2400);
    setTimeout(() => el.remove(), 2700);
  }

  function bindCmdK() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        showToast('Recherche rapide — disponible en v0.7', 'info');
      }
    });
  }

  function toggleDrawer() {
    // Délègue à window.toggleAiceoDrawer pour garantir la sauvegarde localStorage
    if (typeof window.toggleAiceoDrawer === 'function') {
      window.toggleAiceoDrawer();
    } else {
      const app = $('.app');
      if (!app) return;
      const next = (app.dataset.drawer || 'expanded') === 'expanded' ? 'collapsed' : 'expanded';
      app.dataset.drawer = next;
      try { localStorage.setItem('aiCEO.uiPrefs.drawerCollapsed', next === 'collapsed' ? '1' : '0'); } catch(e) {}
    }
  }

  function bindDrawerCollapse() {
    // Clic sur le bouton officiel (skip si display:none = remplacé par flottant)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="drawer-collapse"], .drawer-collapse-btn');
      if (btn && getComputedStyle(btn).display !== 'none') {
        e.preventDefault();
        toggleDrawer();
        return;
      }
      // Double-clic sur le logo aiCEO toggle aussi
      const logo = e.target.closest('.drawer-logo');
      if (logo && e.detail === 2) {
        e.preventDefault();
        toggleDrawer();
        return;
      }
    });
    // Raccourci clavier Ctrl+B / Cmd+B
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleDrawer();
      }
    });
    // Tooltip au bouton
    const btnEl = $('.drawer-collapse-btn');
    if (btnEl && !btnEl.hasAttribute('title')) {
      btnEl.setAttribute('title', 'Réduire/Étendre le menu (Ctrl+B)');
    }
  }


  // ── Tabs handler générique [data-tab] / [data-panel] ─────────────
  function bindTabs() {
    const tabs = $$('[data-tab]');
    if (tabs.length === 0) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.dataset.tab;
        if (!target) return;
        // Désactiver tous les autres tabs du même groupe
        const group = tab.parentElement;
        if (group) {
          group.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('is-active'));
        } else {
          $$('[data-tab]').forEach(t => t.classList.remove('is-active'));
        }
        tab.classList.add('is-active');
        // Cacher tous les panels et afficher le bon
        $$('[data-panel]').forEach(p => p.classList.remove('is-visible'));
        const panel = $('[data-panel="' + target + '"]');
        if (panel) panel.classList.add('is-visible');
      });
    });
  }


  // ── Détection breakpoint pour défaut drawer ────────────────────
  function getDevice() {
    const w = window.innerWidth;
    if (w >= 1024) return 'desktop';
    if (w >= 640)  return 'tablet';
    return 'mobile';
  }
  function getResponsiveDefault() {
    const d = getDevice();
    if (d === 'desktop') return 'expanded';
    if (d === 'tablet')  return 'collapsed';
    return 'mobile'; // mode off-canvas
  }

  function restoreDrawerState() {
    try {
      const pref = localStorage.getItem('aiCEO.uiPrefs.drawerCollapsed');
      const app = document.querySelector('.app');
      if (!app) return;
      const device = getDevice();
      let target;
      if (pref === '0' || pref === '1') {
        // Pref user explicite — on respecte
        target = pref === '1' ? 'collapsed' : 'expanded';
      } else {
        // Pas de pref — défaut selon device
        target = device === 'desktop' ? 'expanded' : 'collapsed';
      }
      app.dataset.drawer = target;
      console.log('[aiCEO drawer] device=' + device + ', pref=' + pref + ' → ' + target);
    } catch(e) { console.warn('[aiCEO] restore error:', e); }
  }


  // ── Bouton flottant toggle drawer ────────────────────────────
  // Approche radicale : un bouton position:fixed indépendant du drawer
  // qui se positionne automatiquement à la frontière entre drawer et main.
  function injectFloatingToggle() {
    if (document.getElementById('aiceo-float-toggle')) return;
    // Cacher le bouton drawer-collapse-btn original (on le remplace)
    $$('.drawer-collapse-btn').forEach(b => b.style.display = 'none');
    const btn = document.createElement('button');
    btn.id = 'aiceo-float-toggle';
    btn.setAttribute('aria-label', 'Réduire/Étendre le menu (Ctrl+B)');
    btn.title = 'Réduire/Étendre le menu (Ctrl+B)';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    btn.style.cssText = [
      'position: fixed',
      'top: 50%',
      'left: var(--drawer-w-expanded, 240px)',
      'transform: translate(-50%, -50%)',
      'width: 28px',
      'height: 28px',
      'border-radius: 50%',
      'background: var(--surface-2, #fff)',
      'border: 1px solid var(--border, #e0e0e0)',
      'box-shadow: 0 2px 10px rgba(0,0,0,.18)',
      'color: var(--text, #111)',
      'cursor: pointer',
      'z-index: 9999',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'transition: all .2s ease',
      'padding: 0'
    ].join(';');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.toggleAiceoDrawer();
      updateFloatingTogglePosition();
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--text, #111)';
      btn.style.color = '#fff';
      btn.style.transform = 'translate(-50%, -50%) scale(1.15)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'var(--surface-2, #fff)';
      btn.style.color = 'var(--text, #111)';
      btn.style.transform = 'translate(-50%, -50%)';
    });
    // SVG transition propre
    setTimeout(() => {
      const svg = btn.querySelector('svg');
      if (svg) svg.style.transition = 'transform .25s ease';
    }, 100);
    document.body.appendChild(btn);
    updateFloatingTogglePosition();

    // MutationObserver : repositionne automatiquement à chaque changement
    // de data-drawer (par restoreDrawerState, toggle, ou autre)
    const app = $('.app');
    if (app && !app.dataset.observerAttached) {
      app.dataset.observerAttached = '1';
      const obs = new MutationObserver(() => updateFloatingTogglePosition());
      obs.observe(app, { attributes: true, attributeFilter: ['data-drawer'] });
    }
    // Également : multi-tick safety (si restoreDrawerState est en retard)
    setTimeout(updateFloatingTogglePosition, 0);
    setTimeout(updateFloatingTogglePosition, 50);
    setTimeout(updateFloatingTogglePosition, 200);
  }

  function updateFloatingTogglePosition() {
    const btn = document.getElementById('aiceo-float-toggle');
    if (!btn) return;
    const app = $('.app');
    if (!app) return;
    const isCollapsed = app.dataset.drawer === 'collapsed';
    const drawerWidth = isCollapsed ? 60 : 240;
    btn.style.left = drawerWidth + 'px';
    // Bouton : juste centré (pas de rotate qui conflicte avec hover)
    btn.style.transform = 'translate(-50%, -50%)';
    // Rotate SUR LE SVG seul → indique le sens ouverture/fermeture
    const svg = btn.querySelector('svg');
    if (svg) svg.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
    btn.dataset.collapsed = isCollapsed ? '1' : '0';
  }


  // ── Resize : si pas de pref user, ré-adapter au breakpoint ─────
  function bindResize() {
    let lastDevice = getDevice();
    window.addEventListener('resize', () => {
      const newDevice = getDevice();
      if (newDevice === lastDevice) return;
      lastDevice = newDevice;
      const pref = localStorage.getItem('aiCEO.uiPrefs.drawerCollapsed');
      if (pref === '0' || pref === '1') return; // pref user explicite, on ne touche pas
      // Sinon réappliquer le défaut
      const app = document.querySelector('.app');
      if (!app) return;
      app.dataset.drawer = newDevice === 'desktop' ? 'expanded' : 'collapsed';
    });
  }


  // ── Bind boutons Claude Design sans href (texte → action) ──────
  function bindNavButtons() {
    // Map texte → URL ou action
    const TEXT_NAV = [
      { match: /ouvrir\s+l['']?arbitrage/i,  url: '/v06/arbitrage.html' },
      { match: /^arbitrer$/i,                url: '/v06/arbitrage.html' },
      { match: /aller\s+au\s+cockpit/i,     url: '/v06/index.html' },
      { match: /ouvrir\s+le\s+cockpit/i,    url: '/v06/index.html' },
      { match: /voir\s+(le\s+)?cockpit/i,    url: '/v06/index.html' },
      { match: /cl[oô]turer\s+la\s+journ[ée]/i, action: 'evening-submit' },
      { match: /commencer\s+la\s+soir[ée]e/i, url: '/v06/evening.html' },
      { match: /ouvrir\s+(la\s+)?soir[ée]e/i, url: '/v06/evening.html' },
      { match: /voir\s+les?\s+\d+\s+(actions|t[âa]ches)/i, url: '/v06/taches.html' },
      { match: /voir\s+(le\s+)?d[ée]tail/i, url: null /* dépend du context */ },
      { match: /reformuler/i, url: '/v06/assistant.html' },
      { match: /pr[ée]parer/i, url: '/v06/arbitrage.html' },
      { match: /trancher$/i,    action: 'arbitrage-trancher' },
      { match: /r[ée]viser/i,  action: 'open-top3-edit' },
    ];

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button:not([type="submit"]):not([data-bound]):not([data-action="drawer-collapse"])');
      if (!btn) return;
      // Skip si déjà handled (par crud-modals etc)
      if (btn.dataset.new) return;
      // Skip si bouton dans un form qui a son propre handler
      if (btn.closest('.aiceo-modal')) return;

      const text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 80) return;

      for (const rule of TEXT_NAV) {
        if (rule.match.test(text)) {
          if (rule.url) {
            e.preventDefault();
            window.location.href = rule.url;
            return;
          }
          if (rule.action === 'evening-submit') {
            // Déjà géré par bind-evening
            return;
          }
          // Autres actions...
        }
      }
    });
  }


  // ── Détection auto boutons non branchés (disabled / preview) ──
  function markUnboundButtons() {
    const PREVIEW_ROUTES = new Set(['connaissance', 'coaching']);
    const route = document.body.dataset.route || '';
    const isPreviewPage = PREVIEW_ROUTES.has(route);

    // Regex des textes connus comme "branchés"
    const KNOWN_TEXTS = [
      /ouvrir\s+l['']?arbitrage/i, /^arbitrer$/i, /aller\s+au\s+cockpit/i,
      /ouvrir\s+le\s+cockpit/i, /voir\s+(le\s+)?cockpit/i,
      /cl[oô]turer\s+la\s+journ[ée]/i, /commencer\s+la\s+soir[ée]e/i,
      /ouvrir\s+(la\s+)?soir[ée]e/i, /voir\s+les?\s+\d+\s+(actions|t[âa]ches)/i,
      /reformuler/i, /pr[ée]parer/i, /trancher$/i, /r[ée]viser/i,
      /nouveau|nouvelle|ajouter/i, /capter/i,
      /sauvegarder|enregistrer|cr[ée]er|modifier|supprimer/i,
      /ouvrir$/i, /^ouvrir/i, /annuler|fermer|valider|continuer|terminer/i,
      /^\+/, /jour|semaine|mois/i, /tableau|maison|sant[ée]/i,
      /aujourd['']?hui/i, /^précédent|^suivant/i,
      /forcer\s+(une\s+)?sync/i, /exporter/i, /r[ée]initialiser|supprimer\s+mon/i,
    ];

    function shouldSkip(btn) {
      // Skip si déjà branché explicitement
      if (btn.dataset.new || btn.dataset.bound || btn.dataset.actionBound) return true;
      if (btn.hasAttribute('onclick')) return true;
      if (btn.type === 'submit' || btn.closest('form')) return true;
      // Skip composants gérés par shell
      const skipClasses = ['drawer-item','drawer-collapse-btn','drawer-tenant','drawer-user','drawer-locale','seg-btn','icon-btn','chip','task-check','tab','settings-tab','aiceo-modal-close'];
      for (const cls of skipClasses) if (btn.classList.contains(cls)) return true;
      if (btn.id === 'aiceo-float-toggle') return true;
      if (btn.closest('.aiceo-modal, .aiceo-modal-backdrop')) return true;
      if (btn.closest('.drawer')) return true; // tout ce qui est dans le drawer
      // Liens avec href réel
      if (btn.tagName === 'A') {
        const href = btn.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('javascript:') && !href.startsWith('?')) return true;
      }
      return false;
    }

    function isKnown(text) {
      if (!text) return false;
      for (const re of KNOWN_TEXTS) if (re.test(text)) return true;
      return false;
    }

    function scan() {
      $$('button, a.btn').forEach(btn => {
        if (shouldSkip(btn)) return;
        const text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length > 80) return;
        if (isKnown(text)) return;

        // Pas branché → marquer
        if (btn.dataset.aiceoMark) return; // déjà marqué
        if (isPreviewPage) {
          btn.classList.add('aiceo-preview-btn');
          btn.dataset.aiceoMark = 'preview';
          btn.title = 'Aperçu — disponible dans la version complète (V1)';
        } else {
          btn.classList.add('aiceo-disabled-btn');
          btn.dataset.aiceoMark = 'disabled';
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
          btn.title = 'Action non encore branchée';
        }
      });
    }

    // Première passe + retries (pour rattraper les bindings tardifs)
    setTimeout(scan, 100);
    setTimeout(scan, 500);
    setTimeout(scan, 1500);
    // Re-scan après ajout dynamique de boutons
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    restoreDrawerState();
    // Unregister SW en localhost pour éviter cache piège dev
    if ('serviceWorker' in navigator && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    }
    injectCSS();
    markActive();
    bindTabs();
    markPreview();
    applyUserContext();
    // Re-applique quand les vraies prefs user arrivent (async)
    document.addEventListener('aiceo:user-loaded', applyUserContext);
    injectPreviewBanner();
    bindDrawerCollapse();
    bindCmdK();
    bindNavButtons();
    injectFloatingToggle();
    markUnboundButtons();
    bindResize();
    // Binding direct sur le bouton collapse-btn (en plus de la delegation)
    setTimeout(() => {
      const btn = document.querySelector('.drawer-collapse-btn');
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDrawer();
        });
      }
    }, 50);
    document.body.dataset.shellReady = 'true';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Fonction globale accessible depuis onclick inline
  window.toggleAiceoDrawer = function() {
    const app = document.querySelector('.app');
    if (!app) return false;
    const current = app.dataset.drawer || 'expanded';
    const next = current === 'expanded' ? 'collapsed' : 'expanded';
    app.dataset.drawer = next;
    try {
      localStorage.setItem('aiCEO.uiPrefs.drawerCollapsed', next === 'collapsed' ? '1' : '0');
      console.log('[aiCEO drawer] ' + current + ' → ' + next + ' (localStorage=' + localStorage.getItem('aiCEO.uiPrefs.drawerCollapsed') + ')');
    } catch(e) { console.warn('[aiCEO] localStorage error:', e); }
    if (typeof updateFloatingTogglePosition === 'function') updateFloatingTogglePosition();
    return false;
  };

  window.AICEOShell = { showToast, CONFIG, markActive, markPreview, toggleDrawer: window.toggleAiceoDrawer };
})();
