/* breadcrumbs.js v2 — Compact dans topbar (pas de ligne dédiée) + raccourcis G+T */
(function () {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);

  const ROUTE_LABELS = {
    home: 'Cockpit', arbitrage: 'Arbitrage', evening: 'Soirée',
    taches: 'Actions', agenda: 'Agenda', revues: 'Revues',
    assistant: 'Assistant', projets: 'Projets', projet: 'Projet',
    equipe: 'Équipe', connaissance: 'Connaissance', coaching: 'Coaching',
    decisions: 'Décisions', settings: 'Réglages'
  };

  function todayDateStr() {
    const now = new Date();
    const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' · Semaine ' + weekNum;
  }

  function injectBreadcrumb() {
    const route = document.body.dataset.route || '';
    if (!route || route === 'hub' || route === 'onboarding') return;
    if ($('#aiceo-breadcrumbs')) return;

    // Cible : topbar-title-eyebrow (au-dessus du h1) — pas de ligne en plus
    let target = $('.topbar-title-eyebrow');
    if (target) {
      const id = new URLSearchParams(window.location.search).get('id');
      const label = ROUTE_LABELS[route] || route;
      let html;
      if (route === 'home') {
        // Cockpit : breadcrumb minimal + date dynamique
        html = '<span style="font-weight:600">Cockpit</span>';
        html += '<span style="margin:0 8px;opacity:0.4">·</span>';
        html += '<span style="opacity:0.85">' + todayDateStr() + '</span>';
      } else {
        html = '<a href="/v06/index.html" style="color:inherit;text-decoration:none;opacity:0.7">Cockpit</a>';
        html += '<span style="margin:0 6px;opacity:0.5">/</span>';
        if (route === 'projet') {
          html += '<a href="/v06/projets.html" style="color:inherit;text-decoration:none;opacity:0.7">Projets</a>';
          html += '<span style="margin:0 6px;opacity:0.5">/</span>';
        }
        html += '<span style="font-weight:600">' + label;
        if (id) html += ' #' + id.slice(0, 8);
        html += '</span>';
      }
      target.innerHTML = html;
      target.id = 'aiceo-breadcrumbs';
      target.style.cssText = 'font-size:11px;color:var(--text-3,#888);text-transform:none;letter-spacing:0;font-weight:400';
      return;
    }
    // Fallback : insérer juste avant h1 du main avec petit espace
    const h1 = $('main h1, .app-main h1');
    if (!h1) return;
    const bc = document.createElement('div');
    bc.id = 'aiceo-breadcrumbs';
    bc.setAttribute('aria-label', 'Fil d\'Ariane');
    bc.style.cssText = 'font-size:11px;color:var(--text-3,#888);margin-bottom:4px;display:flex;align-items:center;gap:4px';
    const id = new URLSearchParams(window.location.search).get('id');
    const label = ROUTE_LABELS[route] || route;
    let html = '<a href="/v06/index.html" style="color:inherit;text-decoration:none">Cockpit</a><span style="opacity:0.5">/</span>';
    if (route === 'projet') {
      html += '<a href="/v06/projets.html" style="color:inherit;text-decoration:none">Projets</a><span style="opacity:0.5">/</span>';
    }
    html += '<span style="font-weight:600">' + label + (id ? ' #' + id.slice(0,8) : '') + '</span>';
    bc.innerHTML = html;
    h1.parentNode.insertBefore(bc, h1);
  }

  // (date dynamique gérée dans injectBreadcrumb pour route=home)

  // Raccourcis G+T (Linear-style)
  let gPressed = false;
  function bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'g' || e.key === 'G') {
        gPressed = true;
        setTimeout(() => gPressed = false, 1200);
        return;
      }
      if (gPressed) {
        const map = {
          'h': '/v06/index.html', 'c': '/v06/index.html',
          'a': '/v06/arbitrage.html', 's': '/v06/evening.html',
          't': '/v06/taches.html', 'p': '/v06/projets.html',
          'd': '/v06/decisions.html', 'e': '/v06/equipe.html',
          'g': '/v06/agenda.html', 'r': '/v06/revues.html',
          'i': '/v06/assistant.html', ',': '/v06/settings.html'
        };
        const url = map[e.key.toLowerCase()];
        if (url) {
          e.preventDefault();
          window.location.href = url;
          gPressed = false;
        }
      }
    });
  }

  function init() {
    injectBreadcrumb();  // Toutes pages : breadcrumb compact (Cockpit · date pour home)
    bindShortcuts();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
