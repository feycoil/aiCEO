/* bind-drawer-extras.js v1 — Drawer extras :
 *  - Bind .drawer-tenant → dropdown des maisons (groups) avec switcher
 *  - Tue les .drawer-collapse-btn dupliqués (un seul #aiceo-float-toggle)
 */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  async function api(method, url, body) {
    try {
      const r = await fetch(url, {
        method, headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  // ── 1. Tenant switcher (dropdown maisons) ──────────────────────
  function bindTenant() {
    const btn = $('.drawer-tenant');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const existing = document.getElementById('aiceo-tenant-dropdown');
      if (existing) { existing.remove(); return; }

      const data = await api('GET', '/api/groups');
      const groups = (data && (data.groups || data)) || [];

      const dd = document.createElement('div');
      dd.id = 'aiceo-tenant-dropdown';
      const rect = btn.getBoundingClientRect();
      const left = Math.max(10, rect.left);
      const top  = rect.bottom + 6;
      const width = Math.max(220, rect.width);
      dd.style.cssText = [
        'position:fixed', 'top:' + top + 'px', 'left:' + left + 'px',
        'min-width:' + width + 'px', 'max-width:320px',
        'background:var(--surface-2,#fff)',
        'border-radius:12px',
        'box-shadow:0 12px 36px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.06)',
        'z-index:10000',
        'padding:8px',
        'font-family:inherit',
        'font-size:14px',
        'animation:aiceo-dd-fade .15s ease-out'
      ].join(';');

      // Animation keyframes (injectées une fois)
      if (!document.getElementById('aiceo-dd-anim')) {
        const s = document.createElement('style');
        s.id = 'aiceo-dd-anim';
        s.textContent = '@keyframes aiceo-dd-fade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }';
        document.head.appendChild(s);
      }

      const stored = (function(){ try { return localStorage.getItem('aiCEO.uiPrefs.activeTenant') || ''; } catch(e) { return ''; } })();

      if (groups.length === 0) {
        dd.innerHTML = [
          '<div style="padding:18px 14px;text-align:center">',
            '<div style="color:var(--text-3,#888);font-size:13px;margin-bottom:10px">',
              'Aucune maison créée pour le moment',
            '</div>',
            '<a href="/v06/settings.html#tab=maisons" style="display:inline-block;padding:8px 14px;background:var(--accent,#e35a3a);color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">',
              '+ Créer une maison',
            '</a>',
          '</div>'
        ].join('');
      } else {
        // Liste des maisons
        groups.forEach(g => {
          const isActive = stored === g.id;
          const initial = (g.name || '?').charAt(0).toUpperCase();
          const item = document.createElement('button');
          item.type = 'button';
          item.style.cssText = [
            'display:flex', 'align-items:center', 'gap:10px',
            'width:100%', 'padding:7px 10px',
            'border:0',
            'background:' + (isActive ? 'var(--surface-3,#f0eee9)' : 'transparent'),
            'cursor:pointer', 'border-radius:8px',
            'font-size:13px', 'color:var(--text,#111)',
            'text-align:left', 'font-family:inherit',
            'transition:background .12s'
          ].join(';');
          item.addEventListener('mouseenter', () => {
            if (!isActive) item.style.background = 'var(--surface-3,#f5f3ef)';
          });
          item.addEventListener('mouseleave', () => {
            if (!isActive) item.style.background = 'transparent';
          });
          item.innerHTML = [
            '<span style="width:22px;height:22px;border-radius:7px;background:var(--accent,#e35a3a);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">',
              initial,
            '</span>',
            '<span style="flex:1">' + escapeHtml(g.name || '(sans nom)') + '</span>',
            isActive ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent,#e35a3a)"><polyline points="20 6 9 17 4 12"/></svg>' : ''
          ].join('');
          item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try { localStorage.setItem('aiCEO.uiPrefs.activeTenant', g.id); } catch(err) {}
            const nameEl = btn.querySelector('.tenant-name');
            const markEl = btn.querySelector('.tenant-mark');
            if (nameEl) {
              nameEl.textContent = g.name || '(sans nom)';
              nameEl.dataset.userSelected = '1';
            }
            if (markEl) markEl.textContent = initial;

            // Persister server-side via /api/preferences
            fetch('/api/preferences', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ activeTenantId: g.id, activeTenantName: g.name })
            }).catch(() => {});

            // MutationObserver pour empêcher tout autre script d'écraser
            if (nameEl && !nameEl.dataset.observerAttached) {
              nameEl.dataset.observerAttached = '1';
              const desiredText = g.name || '(sans nom)';
              const observer = new MutationObserver(() => {
                if (nameEl.textContent !== desiredText && nameEl.dataset.userSelected === '1') {
                  nameEl.textContent = desiredText;
                }
              });
              observer.observe(nameEl, { childList: true, characterData: true, subtree: true });
            }

            dd.remove();
            if (window.AICEOShell && window.AICEOShell.showToast) {
              window.AICEOShell.showToast('Maison active : ' + (g.name || ''), 'info');
            }
          });
          dd.appendChild(item);
        });

        // Separator
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--border,#eee);margin:6px 6px';
        dd.appendChild(sep);

        // Manage link
        const manage = document.createElement('a');
        manage.href = '/v06/settings.html#tab=maisons';
        manage.style.cssText = [
          'display:flex', 'align-items:center', 'gap:8px',
          'padding:9px 10px', 'border-radius:8px',
          'color:var(--accent,#e35a3a)', 'text-decoration:none',
          'font-size:13px', 'font-weight:600',
          'transition:background .12s'
        ].join(';');
        manage.addEventListener('mouseenter', () => manage.style.background = 'var(--surface-3,#f5f3ef)');
        manage.addEventListener('mouseleave', () => manage.style.background = 'transparent');
        manage.innerHTML = '<span style="font-size:16px">+</span> Gérer les maisons';
        dd.appendChild(manage);
      }

      document.body.appendChild(dd);

      // Close on outside click
      setTimeout(() => {
        const closeHandler = (ev) => {
          if (!dd.contains(ev.target) && !btn.contains(ev.target)) {
            dd.remove();
            document.removeEventListener('click', closeHandler);
            document.removeEventListener('keydown', escHandler);
          }
        };
        const escHandler = (ev) => {
          if (ev.key === 'Escape') {
            dd.remove();
            document.removeEventListener('click', closeHandler);
            document.removeEventListener('keydown', escHandler);
          }
        };
        document.addEventListener('click', closeHandler);
        document.addEventListener('keydown', escHandler);
      }, 0);
    });
  }


  // ── Bind sélecteur de langue ───────────────────────────────────
  const LOCALES = [
    { code: 'fr', label: 'Français', flag: 'FR', tone: 'Tonalité par défaut' },
    { code: 'en', label: 'English',  flag: 'GB', tone: 'UK · 24h' },
    { code: 'ar', label: 'العربية',  flag: 'SA', tone: 'RTL · Hijri toggle' }
  ];

  function bindLocaleSwitcher() {
    // i18n complet planifie en V2 (cf. ROADMAP). On garde le bouton visible
    // mais en mode "bientot" : grisaille + tag version, pas de dropdown.
    let btn = $('.drawer-locale');
    if (!btn) {
      btn = Array.from(document.querySelectorAll('.drawer .drawer-item, .drawer-foot a, .drawer-foot button')).find(el =>
        /^(français|english|العربية|langue)/i.test((el.textContent||'').trim())
      );
    }
    if (!btn || btn.dataset.localeBound === '1') return;
    btn.dataset.localeBound = '1';

    // Mode preview
    btn.classList.add('is-preview');
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('title', 'Multi-langue disponible en V2 (i18n)');
    btn.style.cursor = 'not-allowed';

    // Force libelle "Langue" (au lieu de "Français")
    const label = btn.querySelector('.locale-name, .label, span:not(.ico):not(.badge):not(.pill)');
    if (label) label.textContent = 'Langue';

    // Ajouter badge version V2 (meme classe .badge-preview que Coaching/Assistant)
    if (!btn.querySelector('.badge-preview')) {
      const badge = document.createElement('span');
      badge.className = 'badge-preview';
      badge.textContent = 'V2';
      btn.appendChild(badge);
    }

    // Bloquer le click (capture pour court-circuiter d'eventuels handlers en aval)
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.AICEOShell && window.AICEOShell.showToast) {
        window.AICEOShell.showToast('Multi-langue disponible en V2', 'info');
      }
    }, true);
  }

  function escapeHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ── 2. Tue les .drawer-collapse-btn dupliqués ──────────────────
  function killDuplicates() {
    // Tous les .drawer-collapse-btn natifs cachés (le floating les remplace)
    $$('.drawer-collapse-btn').forEach(b => {
      if (b.id === 'aiceo-float-toggle') return;
      b.style.display = 'none';
      b.setAttribute('aria-hidden', 'true');
    });
    // Si plusieurs aiceo-float-toggle existent (re-injection accidentelle), garder le premier
    const floats = document.querySelectorAll('#aiceo-float-toggle');
    if (floats.length > 1) {
      for (let i = 1; i < floats.length; i++) floats[i].remove();
    }
  }

  // ── Restore active tenant au load (si stocké) ──────────────────
  async function restoreActiveTenant() {
    let stored = '';
    try { stored = localStorage.getItem('aiCEO.uiPrefs.activeTenant') || ''; } catch(e) {}
    if (!stored) return;
    const data = await api('GET', '/api/groups');
    const groups = (data && (data.groups || data)) || [];
    const g = groups.find(x => x.id === stored);
    if (!g) return;
    const btn = $('.drawer-tenant');
    if (!btn) return;
    const nameEl = btn.querySelector('.tenant-name');
    const markEl = btn.querySelector('.tenant-mark');
    if (nameEl) {
      nameEl.textContent = g.name || nameEl.textContent;
      nameEl.dataset.userSelected = '1';
    }
    if (markEl) markEl.textContent = (g.name || '?').charAt(0).toUpperCase();
  }

  // ── 3. Profil utilisateur (avatar, nom, role) ──────────────────
  function bindUserProfile() {
    const userBtn = $('.drawer-user');
    if (!userBtn) return;

    function applyUser() {
      const u = window.AICEO_USER || window.AICEO_CONFIG || {};
      const firstName = u.firstName || '';
      const lastName = u.lastName || '';
      const fullName = (firstName + ' ' + lastName).trim() || u.userName || 'Utilisateur';
      const role = u.role || u.userRole || 'CEO';
      const initials = ((firstName.charAt(0) || '') + (lastName.charAt(0) || '')).toUpperCase()
        || (u.userInitials || (fullName.split(' ').map(w => (w[0] || '')).join('').toUpperCase().slice(0, 2)))
        || 'U';

      const avatar = userBtn.querySelector('.avatar');
      const nameEl = userBtn.querySelector('.name');
      const roleEl = userBtn.querySelector('.role');

      if (avatar) avatar.textContent = initials;
      if (nameEl) nameEl.textContent = fullName;
      if (roleEl) roleEl.textContent = role;
    }

    applyUser();
    document.addEventListener('aiceo:user-loaded', applyUser);
  }

  function init() {
    bindTenant();
    bindLocaleSwitcher();
    bindUserProfile();
    killDuplicates();
    restoreActiveTenant();
    // Observer pour killer les duplicates si re-injectés
    new MutationObserver(killDuplicates).observe(document.body, {
      childList: true, subtree: true
    });
    // Re-bind tenant si le drawer est re-rendu
    new MutationObserver(() => { bindTenant(); bindLocaleSwitcher(); }).observe(document.body, {
      childList: true, subtree: true
    });
    // Re-kill au scroll au cas où
    window.addEventListener('scroll', killDuplicates, { passive: true });
    setInterval(killDuplicates, 2000); // safety net long terme
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
