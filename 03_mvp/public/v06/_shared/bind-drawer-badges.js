/* bind-drawer-badges.js — Badges dynamiques (count) sur les items drawer */
(function () {
  'use strict';

  async function api(url, opts) {
    try {
      const r = await fetch(url, Object.assign({
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
      }, opts || {}));
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function setBadge(navKey, count) {
    const item = document.querySelector('[data-nav="' + navKey + '"]');
    if (!item) return;
    let badge = item.querySelector('.badge:not(.badge-preview)');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'badge';
      item.appendChild(badge);
    }
    if (count && count > 0) {
      badge.textContent = String(count);
      badge.removeAttribute('data-zero');
      badge.style.display = '';
    } else {
      badge.textContent = '';
      badge.setAttribute('data-zero', '1');
      badge.style.display = 'none';
    }
  }

  async function refresh() {
    // Arbitrage : decisions ouvertes + emails a arbitrer
    const decs = await api('/api/decisions?status=ouverte');
    const arbProposals = await api('/api/arbitrage/analyze-emails', { method: 'POST' }).catch(function () { return null; });
    var arbCount = 0;
    if (decs) arbCount += ((decs.decisions || decs) || []).length;
    if (arbProposals && arbProposals.proposals) arbCount += arbProposals.proposals.length;
    setBadge('arbitrage', arbCount);

    // Actions : taches non faites
    const tasks = await api('/api/tasks?done=false');
    if (tasks) {
      const arr = tasks.tasks || tasks || [];
      setBadge('actions', arr.length);
    } else {
      setBadge('actions', 0);
    }

    // Projets : actifs (status active|hot|new)
    const projs = await api('/api/projects?limit=100');
    if (projs) {
      const allProjs = projs.projects || projs || [];
      const activeProjs = allProjs.filter(function (p) {
        return ['active', 'hot', 'new'].indexOf((p.status || '').toLowerCase()) !== -1;
      });
      setBadge('projects', activeProjs.length);
    } else {
      setBadge('projects', 0);
    }

    // Agenda : evenements aujourd'hui
    const today = new Date().toISOString().slice(0, 10);
    const events = await api('/api/events?from=' + today + '&to=' + today);
    if (events) {
      const arr = events.events || events || [];
      setBadge('agenda', arr.length);
    } else {
      setBadge('agenda', 0);
    }
  }

  function init() {
    refresh();
    setInterval(refresh, 30000); // refresh toutes les 30s
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
