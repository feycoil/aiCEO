/* bind-equipe.js v4 — Cards avec avatars colores + last interaction
 *
 * Reproduit la maquette Claude Design : avatar large + nom + role + house pill
 * + last interaction depuis emails. Tries par recence.
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'equipe') return;

  const $  = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  async function tryJson(url, opts) {
    try {
      const r = await fetch(url, Object.assign({ headers: { Accept: 'application/json' } }, opts || {}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  // Couleur stable a partir d'un nom (hash simple)
  const PALETTE = [
    { bg: '#3b82f6', fg: '#fff' }, // blue
    { bg: '#10b981', fg: '#fff' }, // emerald
    { bg: '#f59e0b', fg: '#fff' }, // amber
    { bg: '#ef4444', fg: '#fff' }, // rose
    { bg: '#8b5cf6', fg: '#fff' }, // violet
    { bg: '#06b6d4', fg: '#fff' }, // cyan
    { bg: '#ec4899', fg: '#fff' }, // pink
    { bg: '#84cc16', fg: '#fff' }, // lime
    { bg: '#6366f1', fg: '#fff' }  // indigo
  ];
  function colorFor(name) {
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    return PALETTE[Math.abs(h) % PALETTE.length];
  }

  function initials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function recence(c) {
    if (!c.last_seen_at) return '';
    const d = new Date(c.last_seen_at);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return "hier";
    if (diff < 7) return "il y a " + diff + " j";
    if (diff < 30) return "il y a " + Math.floor(diff / 7) + " sem";
    return "il y a " + Math.floor(diff / 30) + " mois";
  }

  function renderCard(c) {
    var name = c.name || (c.email || '').split('@')[0] || '(sans nom)';
    var ini = initials(name);
    var role = c.role || (c.email && c.email.indexOf('@') !== -1 ? c.email.split('@')[1].split('.')[0] : '');
    var last = recence(c);
    var volMatch = (c.notes || '').match(/^(\d+)\s+email/);
    var vol = volMatch ? volMatch[1] : '';

    return '<article class="contact-card" data-contact-id="' + c.id + '" style="display:flex;align-items:flex-start;gap:14px;padding:18px 20px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px">' +
        '<span style="flex-shrink:0;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--surface-3,#ebe7df);color:var(--text-2,#555);font-weight:600;font-size:13px">' + escHtml(ini) + '</span>' +
        '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">' +
          '<h3 style="margin:0;font-size:14px;font-weight:600;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(name) + '</h3>' +
          (role ? '<p style="margin:0;font-size:12px;color:var(--text-3,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(role) + '</p>' : '') +
          '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap">' +
            (vol ? '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:var(--surface-3,#ebe7df);color:var(--text-2,#555);letter-spacing:0.04em">' + vol + ' MAILS</span>' : '') +
            (last ? '<span style="font-size:11px;color:var(--text-3,#888);white-space:nowrap">' + last + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</article>';
  }

  async function init() {
    const data = await tryJson('/api/contacts?limit=200');
    const contacts = (data && data.contacts) || [];
    const grids = $$('.team-grid');
    if (grids.length === 0) return;

    if (contacts.length === 0) {
      grids[0].innerHTML = '<div style="grid-column:1/-1;padding:60px 24px;text-align:center;color:var(--text-3,#888)">' +
        '<p style="margin:0 0 8px;font-weight:500">Aucun contact dans votre reseau.</p>' +
        '<p style="margin:0;font-size:13px">Lancez la sync Outlook puis le bootstrap pour peupler depuis vos emails.</p>' +
        '</div>';
      return;
    }

    // Sort par recence
    const sorted = contacts.slice().sort(function (a, b) {
      const da = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
      const db = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      return db - da;
    });

    // Header summary
    const main = $('main, .app-main');
    if (main && !main.querySelector('.aiceo-team-summary')) {
      const recent = sorted.filter(function (c) {
        if (!c.last_seen_at) return false;
        const diff = Math.floor((Date.now() - new Date(c.last_seen_at).getTime()) / 86400000);
        return diff <= 7;
      }).length;
      const sum = document.createElement('div');
      sum.className = 'aiceo-team-summary';
      sum.style.cssText = 'margin-bottom:20px;font-size:13px;color:var(--text-2,#555)';
      sum.innerHTML = '<strong>' + sorted.length + ' personnes</strong> dans votre reseau · <strong>' + recent + '</strong> contactees cette semaine';
      const firstGrid = grids[0];
      firstGrid.parentElement.insertBefore(sum, firstGrid);
    }

    grids[0].style.display = 'grid';
    grids[0].style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    grids[0].style.gap = '14px';
    grids[0].innerHTML = sorted.map(renderCard).join('');

    for (let i = 1; i < grids.length; i++) {
      grids[i].style.display = 'none';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
