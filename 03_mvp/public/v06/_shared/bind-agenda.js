/* bind-agenda.js v2 — Grille hebdo events Outlook (Sprint v0.7-S6.6) */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'agenda') return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  async function tryJson(url, opts) {
    try {
      var r = await fetch(url, Object.assign({ headers: { Accept: 'application/json' } }, opts || {}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function startOfWeek(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    var dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return d;
  }

  function fmtTime(iso) {
    if (!iso) return '';
    return (new Date(iso)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function fmtDay(d) {
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function renderEmpty(label) {
    return '<div style="padding:48px 24px;text-align:center;background:var(--surface-2,#fff);border:1px dashed var(--border,#e5e1d8);border-radius:14px;color:var(--text-3,#888);grid-column:1/-1">' +
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;color:var(--text-3,#888)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
      '<p style="margin:0 0 6px;font-weight:500;color:var(--text,#111)">Calendrier non synchronise</p>' +
      '<p style="margin:0 0 14px;font-size:13px">Lancez la sync events Outlook pour peupler l\'agenda :</p>' +
      '<code style="display:inline-block;background:var(--surface-3,#ebe7df);padding:8px 14px;border-radius:6px;font-size:11px;line-height:1.6">pwsh -File scripts/fetch-outlook-events.ps1<br>node scripts/normalize-events.js</code>' +
      (label ? '<p style="margin:14px 0 0;font-size:11px;color:var(--text-3,#888)">' + escHtml(label) + '</p>' : '') +
    '</div>';
  }

  function renderEvent(e) {
    var time = fmtTime(e.starts_at);
    var dur = e.duration_min ? '\u00B7 ' + e.duration_min + ' min' : '';
    var loc = e.location ? '<span style="color:var(--text-3,#888);font-size:11px">\uD83D\uDCCD ' + escHtml(e.location.slice(0, 40)) + '</span>' : '';
    return '<div style="padding:8px 10px;background:var(--surface-2,#f5f1ea);border-left:3px solid var(--accent,#e35a3a);border-radius:6px;font-size:12px;margin-bottom:6px" data-event-id="' + e.id + '">' +
      '<div style="font-weight:600;color:var(--text,#111);font-size:11px">' + escHtml(time) + ' ' + dur + '</div>' +
      '<div style="font-weight:500;margin-top:2px;line-height:1.3">' + escHtml(e.title || '(sans titre)') + '</div>' +
      (loc ? '<div style="margin-top:3px">' + loc + '</div>' : '') +
    '</div>';
  }

  function renderGrid(events) {
    var monday = startOfWeek(new Date());
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }

    var byDay = {};
    days.forEach(function (d) { byDay[d.toISOString().slice(0, 10)] = []; });
    events.forEach(function (e) {
      if (!e.starts_at) return;
      var key = (new Date(e.starts_at)).toISOString().slice(0, 10);
      if (byDay[key]) byDay[key].push(e);
    });

    var html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px">';
    var todayKey = (new Date()).toISOString().slice(0, 10);
    days.forEach(function (d) {
      var key = d.toISOString().slice(0, 10);
      var isToday = key === todayKey;
      var dayEvents = byDay[key] || [];
      html += '<div style="background:var(--surface,#fff);border:1px solid var(--border,#e0dcd0);border-radius:10px;padding:12px;min-height:200px' +
        (isToday ? ';border-color:var(--accent,#e35a3a);background:linear-gradient(180deg,#fff5f0 0%,var(--surface,#fff) 100%)' : '') +
      '">' +
        '<header style="margin-bottom:10px;font-size:11px;color:var(--text-2,#555);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">' +
          escHtml(fmtDay(d)) +
          (isToday ? ' <span style="background:var(--accent,#e35a3a);color:#fff;padding:1px 6px;border-radius:99px;font-size:9px;margin-left:4px">AUJD</span>' : '') +
          (dayEvents.length ? ' <span style="float:right;color:var(--text-3,#888);font-weight:400">' + dayEvents.length + '</span>' : '') +
        '</header>' +
        (dayEvents.length === 0 ? '<div style="font-size:11px;color:var(--text-3,#888);font-style:italic;text-align:center;padding:24px 8px">aucun rdv</div>' : dayEvents.map(renderEvent).join('')) +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  async function init() {
    var monday = startOfWeek(new Date());
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    var fromKey = monday.toISOString().slice(0, 10);
    var toKey = sunday.toISOString().slice(0, 10);

    var data = await tryJson('/api/events?from=' + fromKey + '&to=' + toKey + '&limit=200');
    var events = (data && data.events) || [];

    var target = $('.agenda-grid') || $('.agenda-summary') || $('main, .app-main');
    if (!target) return;

    if (events.length === 0) {
      target.innerHTML = renderEmpty('Periode : ' + fromKey + ' \u2192 ' + toKey);
    } else {
      target.innerHTML = renderGrid(events);
    }

    var summaryStats = $$('.agenda-summary-stat .summary-tile-value, .agenda-stat-value');
    if (summaryStats.length >= 1 && summaryStats[0]) summaryStats[0].textContent = events.length;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
