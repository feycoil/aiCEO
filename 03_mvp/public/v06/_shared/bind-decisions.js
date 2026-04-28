/* bind-decisions.js v4 — Liste decisions reelles + stats reelles */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'decisions') return;

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

  function statusPill(status) {
    var map = {
      'ouverte':    { label: 'A trancher', bg: 'var(--rose-50,#fde6e3)', fg: 'var(--rose-700,#9c2920)', dot: 'var(--rose,#d94a3d)' },
      'decidee':    { label: 'Tranchee',   bg: 'var(--emerald-50,#d6f3e6)', fg: 'var(--emerald-700,#115e3c)', dot: 'var(--emerald,#15a05c)' },
      'executee':   { label: 'Executee',   bg: 'var(--surface-3,#ebe7df)',  fg: 'var(--text-2,#555)',         dot: 'var(--text-3,#888)' },
      'abandonnee': { label: 'Gelee',      bg: 'var(--surface-3,#ebe7df)',  fg: 'var(--text-3,#888)',         dot: 'var(--text-3,#888)' }
    };
    var s = map[status] || map.ouverte;
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + s.bg + ';color:' + s.fg + ';letter-spacing:0.05em;text-transform:uppercase">' +
      '<span style="width:6px;height:6px;border-radius:50%;background:' + s.dot + '"></span>' + s.label + '</span>';
  }

  function recence(d) {
    if (!d) return '';
    var date = new Date(d);
    var diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return "hier";
    if (diff < 7) return "il y a " + diff + " j";
    if (diff < 30) return "il y a " + Math.floor(diff / 7) + " sem";
    return "il y a " + Math.floor(diff / 30) + " mois";
  }

  function renderRow(d) {
    var status = d.status || 'ouverte';
    var when = recence(d.created_at);
    return '<article class="dec-card" data-decision-id="' + escHtml(d.id) + '" style="display:flex;flex-direction:column;gap:8px;padding:18px 20px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px">' +
      '<header style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
        statusPill(status) +
        '<span style="font-size:11px;color:var(--text-3,#888)">Posee ' + when + '</span>' +
      '</header>' +
      '<h3 style="margin:0;font-size:15px;font-weight:600;color:var(--text,#111);line-height:1.35">' + escHtml(d.title || '(sans titre)') + '</h3>' +
      (d.context ? '<p style="margin:0;font-size:13px;color:var(--text-2,#555);line-height:1.4">' + escHtml(d.context).slice(0, 160) + (d.context.length > 160 ? '...' : '') + '</p>' : '') +
      (d.decision ? '<div style="margin-top:4px;padding:8px 10px;background:var(--surface,#faf8f3);border-radius:8px;font-size:12px;color:var(--text-2,#555)"><strong>Decidee :</strong> ' + escHtml(d.decision).slice(0, 200) + '</div>' : '') +
    '</article>';
  }

  function summary(decisions) {
    var open = decisions.filter(function (d) { return (d.status || 'ouverte') === 'ouverte'; }).length;
    var done = decisions.filter(function (d) { return d.status === 'decidee' || d.status === 'executee'; }).length;
    var frozen = decisions.filter(function (d) { return d.status === 'abandonnee'; }).length;
    return '<div style="display:flex;align-items:center;gap:24px;margin-bottom:20px;font-size:13px;color:var(--text-2,#555)">' +
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--rose,#d94a3d)"></span><strong>' + open + '</strong> a trancher</span>' +
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--emerald,#15a05c)"></span><strong>' + done + '</strong> tranchee(s)</span>' +
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--text-3,#888)"></span><strong>' + frozen + '</strong> gelee(s)</span>' +
    '</div>';
  }

  async function init() {
    const data = await tryJson('/api/decisions?limit=200');
    const decisions = (data && data.decisions) || [];

    // Cible : .dec-list ou .dec-timeline
    const list = $('.dec-list') || $('.dec-timeline');
    if (!list) return;

    if (decisions.length === 0) {
      list.innerHTML = '<div style="padding:60px 24px;text-align:center;color:var(--text-3,#888)">' +
        '<p style="margin:0 0 8px;font-weight:500">Aucune decision enregistree.</p>' +
        '<p style="margin:0 0 16px;font-size:13px">Tranchez votre premiere decision via <a href="/v06/arbitrage.html" style="color:var(--accent,#e35a3a)">/arbitrage</a> ou acceptez une proposition email.</p>' +
        '<a href="/v06/arbitrage.html" class="btn primary" style="text-decoration:none">Aller a l\'arbitrage</a>' +
      '</div>';
      return;
    }

    // Tri : ouvertes d'abord, puis par date desc
    const sorted = decisions.slice().sort(function (a, b) {
      var orderA = (a.status || 'ouverte') === 'ouverte' ? 0 : 1;
      var orderB = (b.status || 'ouverte') === 'ouverte' ? 0 : 1;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Header summary
    const main = $('main, .app-main');
    if (main && !main.querySelector('.aiceo-dec-summary')) {
      const sum = document.createElement('div');
      sum.className = 'aiceo-dec-summary';
      sum.innerHTML = summary(decisions);
      list.parentElement.insertBefore(sum, list);
    }

    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '12px';
    list.innerHTML = sorted.map(renderRow).join('');

    // Cacher d'autres dec-list/timeline duplicates
    const all = $$('.dec-list, .dec-timeline');
    for (var i = 1; i < all.length; i++) {
      if (all[i] !== list) all[i].style.display = 'none';
    }

    // Mettre a jour les stats hardcodees en haut de page
    const statValues = $$('.dec-pulse .stat-value, .dec-stats .stat-num, [class*="kpi"] .stat-num');
    if (statValues.length >= 1) {
      var open = decisions.filter(function (d) { return (d.status || 'ouverte') === 'ouverte'; }).length;
      var done = decisions.filter(function (d) { return d.status === 'decidee' || d.status === 'executee'; }).length;
      if (statValues[0]) statValues[0].textContent = open;
      if (statValues[1]) statValues[1].textContent = done;
      if (statValues[2]) statValues[2].textContent = decisions.length;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
