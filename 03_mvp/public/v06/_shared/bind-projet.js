/* bind-projet.js v3 — Détail projet */
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
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    const data = await tryJson('/api/projects/' + encodeURIComponent(id));
    if (!data || !data.project) return;
    const p = data.project;
    // Titre projet
    const title = $('.project-title, h1.title, h1');
    if (title) title.textContent = p.name || '(sans nom)';
    const tagline = $('.project-tagline, .tagline, .lead');
    if (tagline && p.tagline) tagline.textContent = p.tagline;
    // Compteurs
    if (data.counts) {
      const set = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };
      set('[data-bind="project-tasks-count"]',     data.counts.tasks_open || 0);
      set('[data-bind="project-decisions-count"]', data.counts.decisions_open || 0);
      set('[data-bind="project-contacts-count"]',  data.counts.contacts || 0);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
