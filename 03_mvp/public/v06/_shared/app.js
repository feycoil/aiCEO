/* ════════════════════════════════════════════════════════════════
   aiCEO v0.5 — APP JS
   Layer "comportements transversaux". Pas de framework.
   ICON(name) — render <svg><use href="..."/></svg> string.
   App.toast(), App.modal(), App.sheet(), App.drawer(), App.tweaks()
   ════════════════════════════════════════════════════════════════ */
(function(global){
  'use strict';

  // ───── Icon helper ─────────────────────────────────────────────
  function ICON(name, cls) {
    return `<svg class="ico ${cls||''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }

  // ───── Toast ───────────────────────────────────────────────────
  function ensureToastStack(){
    let s = document.querySelector('.toast-stack');
    if (!s) {
      s = document.createElement('div');
      s.className = 'toast-stack';
      s.setAttribute('aria-live', 'polite');
      document.body.appendChild(s);
    }
    return s;
  }
  function toast(msg, opts){
    opts = opts || {};
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = 'toast ' + (opts.kind || '');
    el.innerHTML = `
      <span class="toast-msg">${msg}</span>
      ${opts.action ? `<button class="btn sm ghost toast-action">${opts.action}</button>` : ''}
      <button class="toast-close" aria-label="Close">${ICON('x')}</button>
    `;
    stack.appendChild(el);
    const close = () => {
      el.style.animation = 'toast-in 200ms reverse';
      setTimeout(() => el.remove(), 200);
    };
    el.querySelector('.toast-close').addEventListener('click', close);
    if (opts.action && opts.onAction) {
      el.querySelector('.toast-action').addEventListener('click', () => {
        opts.onAction();
        close();
      });
    }
    setTimeout(close, opts.duration || 4000);
    return { close };
  }

  // ───── Modal ───────────────────────────────────────────────────
  function modal(opts){
    opts = opts || {};
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal ${opts.size||'medium'} ${opts.kind||''}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 class="modal-title">${opts.title||''}</h2>
          <button class="modal-close" aria-label="Close">${ICON('x')}</button>
        </div>
        <div class="modal-body">${opts.body||''}</div>
        ${opts.footer ? `<div class="modal-footer">${opts.footer}</div>` : ''}
      </div>`;
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('is-open'));
    const close = () => {
      backdrop.classList.remove('is-open');
      setTimeout(() => backdrop.remove(), 200);
    };
    backdrop.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', function onEsc(e){
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
    });
    if (opts.onMount) opts.onMount(backdrop, close);
    return { el: backdrop, close };
  }

  // ───── Bottom sheet (mobile) ───────────────────────────────────
  function sheet(opts){
    opts = opts || {};
    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    const el = document.createElement('div');
    el.className = 'bottom-sheet';
    el.innerHTML = `
      <div class="bottom-sheet-handle" aria-hidden="true"></div>
      <h3 class="card-title" style="margin-bottom:14px">${opts.title||''}</h3>
      <div>${opts.body||''}</div>`;
    document.body.appendChild(backdrop);
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
      el.classList.add('is-open');
    });
    const close = () => {
      backdrop.classList.remove('is-open');
      el.classList.remove('is-open');
      setTimeout(() => { backdrop.remove(); el.remove(); }, 300);
    };
    backdrop.addEventListener('click', close);
    if (opts.onMount) opts.onMount(el, close);
    return { el, close };
  }

  // ───── Drawer collapse ─────────────────────────────────────────
  function setupDrawer(){
    const app = document.querySelector('.app');
    if (!app) return;
    const btn = app.querySelector('.drawer-collapse-btn');
    const stored = localStorage.getItem('aice.drawer');
    if (stored === 'collapsed') app.dataset.drawer = 'collapsed';
    if (btn) {
      btn.addEventListener('click', () => {
        const c = app.dataset.drawer === 'collapsed';
        app.dataset.drawer = c ? 'expanded' : 'collapsed';
        localStorage.setItem('aice.drawer', app.dataset.drawer);
      });
    }
  }

  // ───── Theme toggle (light/dark via media or class) ────────────
  function setupTheme(){
    const stored = localStorage.getItem('aice.theme');
    if (stored === 'dark') document.documentElement.dataset.theme = 'dark';
  }

  // ───── Locale switch (rough — only re-applies dir + lang) ──────
  function setLocale(loc){
    document.documentElement.lang = loc;
    document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.locale = loc;
  }

  // ───── Tweaks panel skeleton ───────────────────────────────────
  function setupTweaks(getDefaults, onChange){
    let mounted = false;
    let panel = null;
    let state = JSON.parse(JSON.stringify(getDefaults()));

    function build(){
      panel = document.createElement('div');
      panel.className = 'tweaks-panel';
      panel.innerHTML = renderPanel(state);
      document.body.appendChild(panel);
      bindPanel();
      mounted = true;
    }

    function renderPanel(s){
      return `
        <header class="tweaks-head">
          <span class="tweaks-title">Tweaks</span>
          <button class="tweaks-close" aria-label="Close">${ICON('x')}</button>
        </header>
        <div class="tweaks-body">${onChange.render(s, ICON)}</div>
      `;
    }

    function bindPanel(){
      panel.querySelector('.tweaks-close').addEventListener('click', () => {
        panel.classList.remove('is-open');
        window.parent.postMessage({type:'__edit_mode_dismissed'}, '*');
      });
      panel.querySelectorAll('[data-tweak]').forEach(input => {
        input.addEventListener('change', () => {
          const key = input.dataset.tweak;
          let val;
          if (input.type === 'checkbox') val = input.checked;
          else if (input.type === 'number' || input.type === 'range') val = +input.value;
          else val = input.value;
          state[key] = val;
          onChange.apply(state, key);
          window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[key]: val}}, '*');
        });
        input.addEventListener('input', () => {
          if (input.type === 'range') {
            const key = input.dataset.tweak;
            state[key] = +input.value;
            onChange.apply(state, key);
          }
        });
      });
    }

    window.addEventListener('message', (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') {
        if (!mounted) build();
        panel.classList.add('is-open');
      }
      if (e.data.type === '__deactivate_edit_mode') {
        if (panel) panel.classList.remove('is-open');
      }
    });
    window.parent.postMessage({type:'__edit_mode_available'}, '*');

    // initial apply
    onChange.apply(state, null);

    return {
      get: () => state,
      apply: () => onChange.apply(state, null),
    };
  }

  // ───── Drag & drop helper (simple) ─────────────────────────────
  function makeDraggable(container, opts){
    opts = opts || {};
    let dragging = null;
    container.querySelectorAll('[data-draggable]').forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', e => {
        dragging = item;
        item.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('is-dragging');
        container.querySelectorAll('.drop-target').forEach(d => d.classList.remove('drop-target'));
        dragging = null;
      });
    });
    container.querySelectorAll('[data-dropzone]').forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drop-target');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drop-target'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drop-target');
        if (dragging && opts.onDrop) opts.onDrop(dragging, zone);
      });
    });
  }

  // ───── Auto-init ───────────────────────────────────────────────
  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    setupTheme();
    setupDrawer();
    // Active nav item from data-route
    const route = document.body.dataset.route;
    if (route) {
      document.querySelectorAll('[data-nav]').forEach(item => {
        item.classList.toggle('is-active', item.dataset.nav === route);
      });
    }
    // skip-link target
    const main = document.querySelector('.app-main');
    if (main && !main.id) main.id = 'main-content';
  });

  // Expose
  global.App = {
    icon: ICON,
    toast,
    modal,
    sheet,
    setLocale,
    setupTweaks,
    makeDraggable,
  };
  global.ICON = ICON;
})(window);
