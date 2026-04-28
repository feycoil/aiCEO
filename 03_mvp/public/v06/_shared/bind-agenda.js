/* bind-agenda.js v3 — Événements de la semaine */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  async function tryJson(url, opts){
    try {
      const r = await fetch(url, Object.assign({headers:{Accept:'application/json'}}, opts||{}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch(e) { return null; }
  }
  function houseName(group_id) {
    if (!group_id) return 'northwind';
    const id = String(group_id).toLowerCase();
    if (id.includes('north')) return 'northwind';
    if (id.includes('sols'))  return 'solstice';
    if (id.includes('helix')) return 'helix';
    return 'northwind';
  }

  async function init() {
    const data = await tryJson('/api/events?limit=50');
    if (!data || !data.events || data.events.length === 0) return;
    // L'agenda est un grid complexe — on update juste les counters en haut
    const counters = {
      total: data.events.length,
      meetings: data.events.filter(e => (e.kind || '').toLowerCase().includes('meet')).length,
      deepwork: data.events.filter(e => (e.kind || '').toLowerCase().includes('deep')).length,
    };
    // Cherche les tiles "Deep work / Réunions / Espace libre / Top-3 placés"
    $$('.agenda-summary-stat, .summary-tile').forEach(tile => {
      const lbl = (tile.querySelector('.summary-tile-label, .label') || {}).textContent || '';
      const val = tile.querySelector('.summary-tile-value, .value, .stat');
      if (!val) return;
      const lblL = lbl.toLowerCase();
      if (lblL.includes('réunion'))     val.textContent = counters.meetings;
      else if (lblL.includes('deep'))   val.textContent = counters.deepwork + 'h';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
