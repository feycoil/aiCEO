// S6.5 quality: console.log gated behind window.DEBUG_AICEO (defaults to false in production)
/* bind-settings.js — Polish settings page :
 *  - Hash routing : #tab=maisons --> onglet houses
 *  - Load dynamique des maisons depuis /api/groups
 *  - CRUD complet : ajouter, renommer, changer couleur, supprimer
 *  - Widget color picker visuel (6 swatches)
 *  - Menu ... + bouton corbeille direct
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'settings') return;
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  async function api(method, url, body) {
    try {
      const r = await fetch(url, {
        method, headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (r.status === 204) return {};
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        console.warn('[settings api] !ok response', { method, url, status: r.status, data });
        throw new Error(data.error || r.statusText);
      }
      return data;
    } catch (e) {
      console.warn('[settings api]', method, url, e.message);
      throw e;
    }
  }

  function escapeHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function toast(msg, kind) {
    if (window.AICEOShell && window.AICEOShell.showToast) {
      window.AICEOShell.showToast(msg, kind || 'info');
    }
  }

  // -- Hash routing -------------------------------------------------
  const TAB_MAP = {
    general: 'general', maisons: 'houses', houses: 'houses',
    locale: 'locale', rituels: 'rituals', rituals: 'rituals',
    coaching: 'coaching', data: 'data', donnees: 'data',
    'donnees-souverainete': 'data', health: 'health', sante: 'health',
    danger: 'danger', 'zone-sensible': 'danger',
    apparence: 'appearance', appearance: 'appearance',
    logs: 'logs', releases: 'releases'
  };

  function activateTab(panelKey) {
    const target = TAB_MAP[panelKey] || panelKey;
    if (!target) return;
    const navItem = $('[data-tab="' + target + '"]');
    if (navItem) {
      navItem.click();
      navItem.classList.add('is-active');
    }
    $$('[data-panel]').forEach(p => {
      if (p.dataset.panel === target) {
        p.classList.add('is-visible');
        p.style.display = '';
      }
    });
  }

  function applyHash() {
    const hash = (window.location.hash || '').replace(/^#/, '');
    if (!hash) return;
    const m = hash.match(/tab=([\w-]+)/i);
    if (m) activateTab(m[1].toLowerCase());
  }

  // -- House item rendering -----------------------------------------
  const HOUSE_COLORS = [
    { key: 'rose',    hex: '#d94a3d' },
    { key: 'amber',   hex: '#e8a93c' },
    { key: 'emerald', hex: '#5a8a7e' },
    { key: 'sky',     hex: '#5a8aa6' },
    { key: 'violet',  hex: '#7d6ba8' },
    { key: 'slate',   hex: '#6b7280' }
  ];

  function houseColorHex(g) {
    if (g.color && g.color.startsWith('#')) return g.color;
    if (g.color) {
      const found = HOUSE_COLORS.find(c => c.key === g.color);
      if (found) return found.hex;
    }
    return HOUSE_COLORS[0].hex;
  }

  function showSavingState(input) {
    removeFeedback(input);
    const fb = document.createElement('span');
    fb.className = 'aiceo-save-feedback aiceo-saving';
    fb.style.cssText = 'margin-left:10px;font-size:12px;color:var(--text-3,#888);font-weight:500';
    fb.textContent = '⌛ Enregistrement…';
    input.parentElement.appendChild(fb);
  }
  function showSavedState(input) {
    removeFeedback(input);
    const fb = document.createElement('span');
    fb.className = 'aiceo-save-feedback aiceo-saved';
    fb.style.cssText = 'margin-left:10px;font-size:12px;color:var(--emerald,#5a8a7e);font-weight:600;animation:aiceo-fade-in .15s';
    fb.textContent = '✓ Enregistré';
    input.parentElement.appendChild(fb);
    setTimeout(() => {
      fb.style.transition = 'opacity .4s';
      fb.style.opacity = '0';
      setTimeout(() => fb.remove(), 400);
    }, 1800);
  }
  function showErrorState(input, msg) {
    removeFeedback(input);
    const fb = document.createElement('span');
    fb.className = 'aiceo-save-feedback aiceo-error';
    fb.style.cssText = 'margin-left:10px;font-size:12px;color:var(--rose,#d94a3d);font-weight:600';
    fb.textContent = '✗ ' + (msg || 'Erreur');
    input.parentElement.appendChild(fb);
    setTimeout(() => fb.remove(), 4000);
  }
  function removeFeedback(input) {
    const old = input.parentElement.querySelectorAll('.aiceo-save-feedback');
    old.forEach(o => o.remove());
  }

  function renderHouseItem(g) {
    const li = document.createElement('li');
    li.className = 'house-edit-row';
    li.dataset.houseId = g.id;
    li.dataset.color = g.color || 'rose';
    li.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px 16px 14px 22px;background:var(--surface,#faf8f3);border-radius:10px;position:relative';

    // Color bar
    const bar = document.createElement('span');
    bar.className = 'house-color-bar';
    bar.style.cssText = 'position:absolute;left:6px;top:14px;bottom:14px;width:4px;border-radius:4px;background:' + houseColorHex(g);
    li.appendChild(bar);

    // Name input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = g.name || '';
    input.style.cssText = 'flex:0 1 240px;border:1px solid var(--border,#e0dcd0);border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;background:#fff';
    input.addEventListener('blur', async () => {
      const newName = input.value.trim();
      if (newName && newName !== g.name) {
        showSavingState(input);
        try {
          await api('PATCH', '/api/groups/' + encodeURIComponent(g.id), { name: newName });
          g.name = newName;
          showSavedState(input);
        } catch (e) {
          showErrorState(input, e.message);
          input.value = g.name || '';
        }
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = g.name || ''; input.blur(); }
    });
    li.appendChild(input);

    // Meta
    const meta = document.createElement('span');
    meta.className = 'house-meta';
    meta.style.cssText = 'flex:1;color:var(--text-3,#888);font-size:13px';
    const projects = g.counts && g.counts.projects_total ? g.counts.projects_total : 0;
    const active = g.counts && g.counts.projects_active ? g.counts.projects_active : 0;
    meta.textContent = projects + ' projet' + (projects > 1 ? 's' : '') + ' . ' + active + ' actif' + (active > 1 ? 's' : '');
    li.appendChild(meta);

    // Color picker btn (swatch round) — event delegation via data-action
    const colorBtn = document.createElement('button');
    colorBtn.type = 'button';
    colorBtn.className = 'house-color-btn';
    colorBtn.title = 'Changer la couleur';
    colorBtn.dataset.action = 'house-color';
    colorBtn.dataset.houseId = g.id;
    colorBtn.dataset.houseColor = g.color || 'rose';
    colorBtn.style.cssText = 'width:28px;height:28px;border-radius:50%;border:2px solid var(--surface-2,#fff);background:' + houseColorHex(g) + ';cursor:pointer;box-shadow:0 0 0 1px var(--border,#e0dcd0);flex-shrink:0;position:relative;z-index:5';
    li.appendChild(colorBtn);

    // Delete btn (corbeille)
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'house-delete-btn';
    delBtn.title = 'Supprimer cette maison';
    delBtn.setAttribute('aria-label', 'Supprimer');
    delBtn.style.cssText = 'width:32px;height:32px;border-radius:50%;border:1px solid var(--border,#e0dcd0);background:var(--surface-2,#fff);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-3,#888);flex-shrink:0;transition:all .15s';
    delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
    delBtn.addEventListener('mouseenter', () => {
      delBtn.style.color = 'var(--rose,#d94a3d)';
      delBtn.style.borderColor = 'var(--rose,#d94a3d)';
      delBtn.style.background = 'rgba(217,74,61,0.08)';
    });
    delBtn.addEventListener('mouseleave', () => {
      delBtn.style.color = 'var(--text-3,#888)';
      delBtn.style.borderColor = 'var(--border,#e0dcd0)';
      delBtn.style.background = 'var(--surface-2,#fff)';
    });
    delBtn.dataset.action = 'house-delete';
    delBtn.dataset.houseId = g.id;
    delBtn.dataset.houseName = g.name || '';
    delBtn.style.cssText += ';position:relative;z-index:5';
    li.appendChild(delBtn);

    if (window.DEBUG_AICEO) console.log('[aiCEO settings] rendered house item:', g.id, 'has color btn:', !!li.querySelector('.house-color-btn'), 'has delete btn:', !!li.querySelector('.house-delete-btn'));
    return li;
  }

  function openColorPicker(li, g, anchor, bar) {
    if (window.DEBUG_AICEO) console.log('[settings] openColorPicker called for', g.id);
    const existing = document.getElementById('aiceo-color-picker');
    if (existing) { existing.remove(); return; }
    const rect = anchor.getBoundingClientRect();
    const picker = document.createElement('div');
    picker.id = 'aiceo-color-picker';
    picker.style.cssText = 'position:fixed;top:' + (rect.bottom + 8) + 'px;left:' + (rect.right - 200) + 'px;background:var(--surface-2,#fff);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06);padding:12px;z-index:10000;display:flex;gap:8px;animation:aiceo-dd-fade .15s ease-out';
    HOUSE_COLORS.forEach(c => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.title = c.key;
      const isCurrent = (g.color || 'rose') === c.key;
      swatch.style.cssText = 'width:32px;height:32px;border-radius:50%;border:0;background:' + c.hex + ';cursor:pointer;outline:' + (isCurrent ? '3px solid var(--text,#1a1a1a)' : 'none') + ';outline-offset:2px';
      swatch.addEventListener('click', async () => {
        try {
          await api('PATCH', '/api/groups/' + encodeURIComponent(g.id), { color: c.key });
          g.color = c.key;
          li.dataset.color = c.key;
          bar.style.background = c.hex;
          anchor.style.background = c.hex;
          picker.remove();
          toast('Couleur mise a jour', 'success');
        } catch (e) {
          alert('Erreur : ' + e.message);
        }
      });
      picker.appendChild(swatch);
    });
    document.body.appendChild(picker);
    setTimeout(() => {
      const close = (ev) => {
        if (!picker.contains(ev.target) && ev.target !== anchor) {
          picker.remove();
          document.removeEventListener('click', close);
        }
      };
      document.addEventListener('click', close);
    }, 0);
  }

  async function deleteHouse(g, li) {
    if (window.DEBUG_AICEO) console.log('[settings] deleteHouse called', g);
    if (!confirm('Supprimer la maison \u00ab ' + (g.name || '') + ' \u00bb ?\n\nLes projets lies perdront leur rattachement.')) return;
    try {
      await api('DELETE', '/api/groups/' + encodeURIComponent(g.id));
      li.style.transition = 'all .25s';
      li.style.opacity = '0';
      li.style.transform = 'translateX(-12px)';
      setTimeout(() => {
        li.remove();
        loadHouses(); // recharge pour afficher empty state si plus aucune
      }, 250);
      toast('Maison supprimee', 'success');
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  }

  // -- Load dynamique des maisons -----------------------------------
  async function loadHouses() {
    if (window.DEBUG_AICEO) console.log('[aiCEO settings] loadHouses() called, document.body.dataset.route =', document.body.dataset.route);
    const list = $('[data-panel="houses"] .house-edit-list, .house-edit-list');
    if (!list) return;
    let groups = [];
    try {
      const data = await api('GET', '/api/groups');
      groups = (data && (data.groups || data)) || [];
    } catch (e) {
      groups = [];
    }
    if (window.DEBUG_AICEO) console.log('[aiCEO settings] groups loaded:', groups.length, groups);
    list.innerHTML = '';
    if (groups.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'aiceo-houses-empty';
      empty.style.cssText = 'list-style:none;padding:32px 24px;text-align:center;color:var(--text-3,#888);background:var(--surface,#faf8f3);border-radius:10px';
      empty.innerHTML = '<p style="margin:0 0 6px;font-weight:500">Aucune maison configuree</p>' +
        '<p style="margin:0;font-size:13px">Creez votre premiere maison pour structurer vos projets, KPIs et arbitrages.</p>';
      list.appendChild(empty);
      return;
    }
    groups.forEach(g => list.appendChild(renderHouseItem(g)));
  }

  // -- Bind "+ Ajouter une maison" ----------------------------------
  function bindAddHouse() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.house-add-btn, [data-action="add-house"]');
      const isText = btn || (() => {
        const t = e.target.closest('button, a');
        return t && /ajouter une maison|nouvelle maison|\+ ajouter/i.test((t.textContent||'').trim());
      })();
      if (!btn && !isText) return;
      const target = btn || e.target.closest('button, a');
      if (!target.closest('[data-panel="houses"], .houses-panel')) return;
      e.preventDefault();
      e.stopPropagation();
      const list = $('[data-panel="houses"] .house-edit-list, .house-edit-list');
      if (!list) return;
      // Retirer l\'empty state s\'il existe
      const empty = list.querySelector('.aiceo-houses-empty');
      if (empty) empty.remove();
      // Ajouter une row temporaire avec input vide
      const li = document.createElement('li');
      li.className = 'house-edit-row is-new';
      li.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px 16px 14px 22px;background:var(--surface,#faf8f3);border-radius:10px;position:relative';
      li.innerHTML = '<span style="position:absolute;left:6px;top:14px;bottom:14px;width:4px;border-radius:4px;background:' + HOUSE_COLORS[0].hex + '"></span>';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Nom de la maison (ex. Holding, R&D)';
      input.style.cssText = 'flex:1;border:1px solid var(--border,#e0dcd0);border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;background:#fff';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'Annuler';
      cancelBtn.style.cssText = 'border:0;background:transparent;color:var(--text-3,#888);cursor:pointer;font-size:13px;padding:6px 10px';
      cancelBtn.addEventListener('click', () => { li.remove(); loadHouses(); });
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.textContent = 'Creer';
      saveBtn.style.cssText = 'border:0;background:var(--text,#1a1a1a);color:#fff;cursor:pointer;font-size:13px;padding:8px 14px;border-radius:8px;font-weight:600';
      const doSave = async () => {
        const name = input.value.trim();
        if (!name) { input.focus(); return; }
        try {
          const res = await api('POST', '/api/groups', { name, color: 'rose' });
          li.remove();
          await loadHouses();
          toast('Maison creee : ' + name, 'success');
        } catch (e) {
          alert('Erreur : ' + e.message);
        }
      };
      saveBtn.addEventListener('click', doSave);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); doSave(); }
        if (e.key === 'Escape') { li.remove(); loadHouses(); }
      });
      li.appendChild(input);
      li.appendChild(cancelBtn);
      li.appendChild(saveBtn);
      // Inserer avant le bouton "+ Ajouter une maison" si present, sinon en fin
      const addBtnInDom = list.querySelector('.house-add-btn, [data-action="add-house"]');
      if (addBtnInDom && addBtnInDom.parentNode === list) {
        list.insertBefore(li, addBtnInDom);
      } else {
        list.appendChild(li);
      }
      input.focus();
    });
  }

  // -- Event delegation globale (bypass tous les autres handlers) --
  function bindGlobalActions() {
    if (window.__aiceoSettingsActionsBound) return;
    window.__aiceoSettingsActionsBound = true;
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const houseId = target.dataset.houseId;
      if (!houseId) return;

      if (action === 'house-color') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const li = target.closest('.house-edit-row, li');
        const bar = li ? li.querySelector('.house-color-bar') : null;
        // Reconstruire l'objet g depuis les data attributes
        const g = {
          id: houseId,
          name: li ? (li.querySelector('input')?.value || '') : '',
          color: target.dataset.houseColor || 'rose'
        };
        openColorPicker(li, g, target, bar);
      } else if (action === 'house-delete') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const li = target.closest('.house-edit-row, li');
        const name = target.dataset.houseName || (li ? li.querySelector('input')?.value : '') || '';
        deleteHouse({ id: houseId, name }, li);
      }
    }, true); // capture phase pour bypass tout autre handler
  }

  function bindSyncOutlookBtn() {
    const syncBtn = document.getElementById('aiceo-settings-sync-btn');
    if (!syncBtn) return;
    // Bouton desactive tant que la fonctionnalite n'est pas dispo dans l'app
    syncBtn.disabled = true;
    syncBtn.setAttribute('aria-disabled', 'true');
    syncBtn.title = 'v0.7 — utilisez scripts/sync-outlook.ps1 manuellement en attendant';
    syncBtn.style.pointerEvents = 'none';
    syncBtn.style.opacity = '0.5';
    syncBtn.style.cursor = 'not-allowed';
    syncBtn.textContent = 'v0.7';
  }

  function init() {
    applyHash();
    bindGlobalActions();
    loadHouses();
    bindAddHouse();
    bindSyncOutlookBtn();
    setTimeout(bindSyncOutlookBtn, 600);
    window.addEventListener('hashchange', applyHash);
    setTimeout(applyHash, 200);
    setTimeout(loadHouses, 600); // re-tenter apres tabs actives
  }

  // ---- LOGS ---------------------------------------------------------
  let logsLoaded = false;
  let logsLoading = false;
  let activeLogIdx = 0;

  function renderLogsLoadButton() {
    const tabsEl = document.getElementById('aiceo-logs-tabs');
    const contentEl = document.getElementById('aiceo-logs-content');
    if (!tabsEl || !contentEl) return;
    if (logsLoaded || logsLoading) return;
    tabsEl.innerHTML = '';
    contentEl.innerHTML =
      '<div style="padding:36px 24px;text-align:center;background:var(--surface-2,#fff);border:1px dashed var(--border,#e5e1d8);border-radius:10px">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-3,#888);margin-bottom:14px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
        '<h3 style="margin:0 0 6px;font-size:15px;font-weight:600;color:var(--text,#111)">Logs non charges</h3>' +
        '<p style="margin:0 0 18px;font-size:13px;color:var(--text-3,#888);max-width:420px;margin-left:auto;margin-right:auto">Les fichiers de log peuvent etre volumineux. Cliquez ci-dessous pour les charger a la demande.</p>' +
        '<button type="button" id="aiceo-logs-load-btn" class="btn primary" onclick="return window.aiceoLoadLogs && window.aiceoLoadLogs()">Charger les logs</button>' +
      '</div>';
  }

  window.aiceoLoadLogs = function() {
    loadLogs();
    return false;
  };

  async function loadLogs() {
    if (logsLoaded || logsLoading) return;
    logsLoading = true;
    const tabsEl = document.getElementById('aiceo-logs-tabs');
    const contentEl = document.getElementById('aiceo-logs-content');
    if (!tabsEl || !contentEl) return;
    // Spinner pendant fetch
    contentEl.innerHTML =
      '<div style="padding:48px 24px;text-align:center">' +
        '<span class="aiceo-spinner"></span>' +
        '<p style="margin:14px 0 0;font-size:13px;color:var(--text-3,#888)">Chargement des logs...</p>' +
      '</div>';
    tabsEl.innerHTML = '';
    const r = await fetch('/api/system/logs', { headers: { Accept: 'application/json' } }).catch(function(){ return null; });
    const data = r && r.ok ? await r.json() : null;
    const logs = (data && data.logs) || [];

    tabsEl.innerHTML = '';
    if (logs.length === 0) {
      tabsEl.innerHTML = '<div style="padding:14px 0;color:var(--text-3,#888);font-size:13px">Aucun log disponible.</div>';
      return;
    }
    logs.forEach(function(log, i) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aiceo-logs-tab' + (i === activeLogIdx ? ' is-active' : '');
      btn.dataset.idx = String(i);
      btn.style.cssText = 'background:transparent;border:0;padding:10px 14px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:var(--text-3,#888)';
      if (i === activeLogIdx) {
        btn.style.color = 'var(--text,#111)';
        btn.style.borderBottomColor = 'var(--accent,#e35a3a)';
        btn.style.fontWeight = '600';
      }
      const sourceLabel = log.source === 'powershell' ? 'PS' : (log.source === 'backend' ? 'Node' : '');
      const ageStr = log.exists ? (log.ageMin < 60 ? log.ageMin + ' min' : (log.ageMin < 1440 ? Math.round(log.ageMin/60) + ' h' : Math.round(log.ageMin/1440) + ' j')) : '';
      btn.innerHTML = '<span style="display:inline-block;font-size:9px;font-weight:700;padding:1px 5px;border-radius:99px;background:var(--surface-3,#ebe7df);color:var(--text-2,#555);margin-right:6px;letter-spacing:0.04em">' + sourceLabel + '</span>' +
        log.name + (ageStr ? ' <span style="color:var(--text-3,#888);font-weight:400;font-size:11px">· ' + ageStr + '</span>' : '');
      btn.addEventListener('click', function() {
        activeLogIdx = i;
        renderLogContent(logs);
        loadLogs.cached = logs;
        renderTabsActive(tabsEl, i);
      });
      tabsEl.appendChild(btn);
    });
    loadLogs.cached = logs;
    renderLogContent(logs);
    logsLoaded = true;
    logsLoading = false;
  }

  function renderTabsActive(tabsEl, activeIdx) {
    Array.prototype.slice.call(tabsEl.children).forEach(function(t, i) {
      const active = i === activeIdx;
      t.style.color = active ? 'var(--text,#111)' : 'var(--text-3,#888)';
      t.style.borderBottomColor = active ? 'var(--accent,#e35a3a)' : 'transparent';
      t.style.fontWeight = active ? '600' : '500';
    });
  }

  function renderLogContent(logs) {
    const contentEl = document.getElementById('aiceo-logs-content');
    if (!contentEl) return;
    const log = logs[activeLogIdx];
    if (!log) { contentEl.innerHTML = ''; return; }
    if (!log.exists) {
      contentEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-3,#888);background:var(--surface-2,#fff);border:1px dashed var(--border,#e5e1d8);border-radius:10px"><p style="margin:0 0 6px;font-weight:500">Fichier absent</p><p style="margin:0;font-size:12px">' + log.desc + '</p><code style="display:inline-block;margin-top:10px;font-size:11px;color:var(--text-3,#888)">' + log.name + '</code></div>';
      return;
    }
    const lines = log.lines || [];
    const linesHTML = lines.map(function(line, idx) {
      const num = lines.length - lines.length + idx + 1 + (log.totalLines - lines.length);
      let color = 'var(--text-2,#555)';
      if (/error|KO|fatal|fail/i.test(line)) color = 'var(--rose-700,#9c2920)';
      else if (/warn/i.test(line)) color = 'var(--amber-800,#92400e)';
      else if (/OK|done|success/i.test(line)) color = 'var(--emerald-700,#115e3c)';
      return '<div style="display:flex;gap:12px;padding:2px 0;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;line-height:1.55"><span style="color:var(--text-3,#888);min-width:42px;text-align:right;flex-shrink:0;user-select:none">' + num + '</span><span style="color:' + color + ';white-space:pre-wrap;word-break:break-word;flex:1">' + escHtml(line) + '</span></div>';
    }).join('');

    const sizeKb = (log.size / 1024).toFixed(1);
    contentEl.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface-3,#ebe7df);border-radius:8px 8px 0 0;font-size:11px;color:var(--text-2,#555)">' +
        '<div><strong style="color:var(--text,#111)">' + log.name + '</strong> &nbsp; <span style="color:var(--text-3,#888)">' + log.desc + '</span></div>' +
        '<div style="font-family:ui-monospace,monospace">' + sizeKb + ' KB · ' + log.totalLines + ' lignes total · maj ' + (new Date(log.mtime).toLocaleString('fr-FR')) + '</div>' +
      '</div>' +
      '<div style="background:#1a1d22;color:#e8e9eb;padding:14px 16px;border-radius:0 0 8px 8px;max-height:480px;overflow-y:auto">' +
        (linesHTML || '<p style="margin:0;color:#888;font-style:italic;font-size:12px">Fichier vide</p>') +
      '</div>' +
      '<p style="margin-top:10px;font-size:11px;color:var(--text-3,#888)">200 dernières lignes affichées · les fichiers complets sont dans <code>data/</code></p>';
  }

  function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ---- RELEASES -----------------------------------------------------
  let releasesLoaded = false;
  async function loadReleases() {
    if (releasesLoaded) return;
    const contentEl = document.getElementById('aiceo-releases-content');
    if (!contentEl) return;
    // Skeleton pendant fetch
    contentEl.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:12px">' +
        '<div class="aiceo-skeleton" style="height:90px"></div>' +
        '<div class="aiceo-skeleton" style="height:120px"></div>' +
        '<div class="aiceo-skeleton" style="height:90px"></div>' +
      '</div>';
    const r = await fetch('/api/system/releases', { headers: { Accept: 'application/json' } }).catch(function(){ return null; });
    const data = r && r.ok ? await r.json() : null;
    const released = (data && data.released) || [];
    const upcoming = (data && data.upcoming) || [];

    function renderRelease(rel, isUpcoming) {
      const colorBar = isUpcoming ? 'var(--amber,#f5b342)' : (rel.current ? 'var(--accent,#e35a3a)' : 'var(--emerald,#15a05c)');
      const tag = isUpcoming ? 'À venir' : (rel.current ? 'Courante' : 'Livrée');
      const tagBg = isUpcoming ? 'var(--amber-50,#fef3c7)' : (rel.current ? 'var(--rose-50,#fde6e3)' : 'var(--emerald-50,#d6f3e6)');
      const tagFg = isUpcoming ? 'var(--amber-800,#92400e)' : (rel.current ? 'var(--rose-700,#9c2920)' : 'var(--emerald-700,#115e3c)');
      const meta = isUpcoming ? ('ETA ' + rel.eta + (rel.effort ? ' · ' + rel.effort : '')) : ('Livrée le ' + new Date(rel.date).toLocaleDateString('fr-FR'));
      const blocked = isUpcoming && rel.blocked ? '<p style="margin:6px 0 0;font-size:11px;color:var(--rose-700,#9c2920)"><strong>Bloqué par :</strong> ' + rel.blocked.join(', ') + '</p>' : '';
      return '<article style="display:flex;gap:14px;padding:18px 20px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:12px;margin-bottom:12px;border-left:4px solid ' + colorBar + '">' +
          '<div style="flex:1;min-width:0">' +
            '<header style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap">' +
              '<span style="font-size:13px;font-weight:700;color:var(--text,#111);font-family:ui-monospace,monospace">' + rel.version + '</span>' +
              '<span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;background:' + tagBg + ';color:' + tagFg + ';letter-spacing:0.05em;text-transform:uppercase">' + tag + '</span>' +
              '<span style="color:var(--text-3,#888);font-size:11px;margin-left:auto">' + meta + '</span>' +
            '</header>' +
            '<h3 style="margin:0 0 6px;font-size:14px;font-weight:600;color:var(--text,#111)">' + escHtml(rel.title) + '</h3>' +
            (rel.summary ? '<p style="margin:0 0 8px;font-size:12px;color:var(--text-2,#555);line-height:1.5">' + escHtml(rel.summary) + '</p>' : '') +
            '<ul style="margin:8px 0 0;padding-left:18px;font-size:12px;color:var(--text-2,#555);line-height:1.7">' +
              (rel.features || []).map(function(f){ return '<li>' + escHtml(f) + '</li>'; }).join('') +
            '</ul>' +
            blocked +
          '</div>' +
        '</article>';
    }

    const releasedHtml = released.length === 0 ? '<p style="color:var(--text-3,#888);font-size:13px">Aucune release pour le moment.</p>' :
      released.slice().reverse().map(function(rel){ return renderRelease(rel, false); }).join('');
    const upcomingHtml = upcoming.length === 0 ? '<p style="color:var(--text-3,#888);font-size:13px">Aucune release planifiée.</p>' :
      upcoming.map(function(rel){ return renderRelease(rel, true); }).join('');

    contentEl.innerHTML =
      '<section style="margin-bottom:28px">' +
        '<h3 style="margin:0 0 12px;font-size:13px;font-weight:700;color:var(--text-2,#555);text-transform:uppercase;letter-spacing:0.06em">Livrées · ' + released.length + '</h3>' +
        releasedHtml +
      '</section>' +
      '<section>' +
        '<h3 style="margin:0 0 12px;font-size:13px;font-weight:700;color:var(--text-2,#555);text-transform:uppercase;letter-spacing:0.06em">À venir · ' + upcoming.length + '</h3>' +
        upcomingHtml +
      '</section>';

    releasesLoaded = true;
  }

  // Handler robuste pour les tabs settings : switch panel au click
  // (Independant de shell.js qui peut faillir au timing)
  function setActiveTab(target) {
    if (!target) return;
    var allTabs = document.querySelectorAll('[data-tab]');
    var allPanels = document.querySelectorAll('[data-panel]');
    allTabs.forEach(function(t) { t.classList.remove('is-active'); });
    allPanels.forEach(function(p) { p.classList.remove('is-visible'); });
    var tab = document.querySelector('[data-tab="' + target + '"]');
    var panel = document.querySelector('[data-panel="' + target + '"]');
    if (tab) tab.classList.add('is-active');
    if (panel) panel.classList.add('is-visible');
    // Lazy-loaders pour logs/releases
    if (target === 'logs') setTimeout(renderLogsLoadButton, 50);
    else if (target === 'releases') setTimeout(loadReleases, 50);
  }

  function bindTabsLocal() {
    // Inject onclick inline sur chaque tab pour resister a tout handler global
    // window.aiceoSettingsTab est defini dans theme.js (sync, dispo avant tout)
    var tabs = document.querySelectorAll('.settings-tab[data-tab]');
    tabs.forEach(function(tab) {
      var target = tab.dataset.tab;
      if (!target) return;
      tab.setAttribute('onclick', "return window.aiceoSettingsTab && window.aiceoSettingsTab(event, '" + target + "')");
    });
    // Exposer les fonctions LazyLoad pour aiceoSettingsTab
    window.aiceoLoadLogsButton = renderLogsLoadButton;
    window.aiceoLoadReleases = loadReleases;
    if (window.DEBUG_AICEO) console.log('[aiCEO settings] onclick inline injected on ' + tabs.length + ' tabs');
  }

  // Default activate general si aucun panel visible au load
  function ensureDefaultTab() {
    var visiblePanels = document.querySelectorAll('.settings-section.is-visible');
    if (visiblePanels.length === 0) {
      // Verifier hash d'abord
      var hash = (window.location.hash || '').replace(/^#/, '');
      var m = hash.match(/tab=([\w-]+)/i);
      if (m) {
        var target = TAB_MAP[m[1].toLowerCase()] || m[1].toLowerCase();
        setActiveTab(target);
      } else {
        setActiveTab('general');
      }
    }
  }

  function bindLazyLoad() {
    bindTabsLocal();
    ensureDefaultTab();
    // Si hash demande direct logs/releases
    if (/(^|#)tab=logs/.test(window.location.hash)) setTimeout(renderLogsLoadButton, 200);
    if (/(^|#)tab=releases/.test(window.location.hash)) setTimeout(loadReleases, 200);
  }
  bindLazyLoad();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindLazyLoad);

})();
