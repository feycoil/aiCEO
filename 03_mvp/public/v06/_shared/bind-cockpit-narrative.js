/* bind-cockpit-narrative.js v1 (S6.8.4) — Hero intention + Big Rocks visu + alertes matin + suggestions
 * S'injecte au-dessus du contenu cockpit existant.
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'home' && document.body.dataset.route !== 'cockpit') return;

  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  async function tryJson(url, opts) {
    try {
      var r = await fetch(url, Object.assign({ headers: { Accept: 'application/json' } }, opts || {}));
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function renderHero(intention, bigRocks) {
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir';
    var name = (window.AICEO_USER && window.AICEO_USER.firstName) || (window.AICEO_CONFIG && window.AICEO_CONFIG.userName) || 'Feyçoil';
    var brsHtml = '';
    if (bigRocks && bigRocks.length > 0) {
      brsHtml = '<div style="margin-top:18px;padding:16px 18px;background:var(--surface-2,#fff);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--violet-800,#463a54)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3,#888)">3 Big Rocks &middot; semaine en cours</span></div>' +
        bigRocks.map(function (b, i) {
          var pct = b.status === 'accompli' ? 100 : b.status === 'en-cours' ? 50 : b.status === 'rate' ? 100 : 0;
          var barColor = b.status === 'rate' ? 'var(--rose,#d94a3d)' : b.status === 'accompli' ? 'var(--emerald,#15a05c)' : 'var(--text,#111)';
          return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0' + (i < bigRocks.length-1 ? ';border-bottom:1px solid var(--border,#f0eee9)' : '') + '"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--surface-3,#ebe7df);color:var(--text-2,#555);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + (i+1) + '</span><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:var(--text,#111);line-height:1.35">' + escHtml(b.title || '') + '</div><div style="height:3px;background:var(--surface-3,#ebe7df);border-radius:99px;margin-top:6px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + barColor + ';transition:width .4s"></div></div></div></div>';
        }).join('') +
      '</div>';
    }
    return '<section class="aiceo-cockpit-hero" style="margin:8px 0 20px;padding:24px 28px;background:linear-gradient(180deg, var(--surface-1,#fafaf7) 0%, var(--surface-2,#fff) 100%);border-radius:16px;border:1px solid var(--border,#eee)">' +
      '<div style="font-size:12px;color:var(--text-3,#888);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Intention de la semaine</div>' +
      '<h1 style="margin:0;font-size:24px;font-weight:600;color:var(--text,#111);line-height:1.3">' + greeting + ', ' + escHtml(name) + '.</h1>' +
      '<p style="margin:6px 0 0;font-size:18px;color:var(--text-2,#555);line-height:1.4;font-weight:500">' + escHtml(intention || 'Posez le cap de votre semaine.') + '</p>' +
      brsHtml +
    '</section>';
  }

  function renderAlerts(alerts) {
    if (!alerts || alerts.length === 0) return '';
    var items = alerts.map(function (a) {
      var color = a.severity === 'high' ? 'var(--rose-700,#9c2920)' : a.severity === 'medium' ? 'var(--amber-800,#92400e)' : 'var(--text-3,#888)';
      var bg = a.severity === 'high' ? 'var(--rose-50,#fde6e3)' : a.severity === 'medium' ? 'var(--amber-50,#fef3c7)' : 'var(--surface-3,#ebe7df)';
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:' + bg + ';border-radius:8px;font-size:12px;color:' + color + '"><span style="flex:1">' + escHtml(a.message) + '</span>' + (a.cta ? '<a href="' + escHtml(a.cta) + '" data-bound="1" style="color:' + color + ';text-decoration:none;font-weight:600">Voir &rarr;</a>' : '') + '</div>';
    }).join('');
    return '<section style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3,#888);margin-bottom:8px">Alertes du matin</div><div style="display:flex;flex-direction:column;gap:6px">' + items + '</div></section>';
  }

  function renderSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) return '';
    var iconMap = { delegation: 'i-people', recadrage: 'i-target', reprise: 'i-clock' };
    var items = suggestions.map(function (sug) {
      var icon = iconMap[sug.kind] || 'i-sparkle';
      var actions = (sug.actions || []).map(function (a) {
        return '<a href="' + escHtml(a.href) + '" data-bound="1" style="font-size:11px;color:var(--text,#111);text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid var(--border,#ddd);background:var(--surface-2,#fff);transition:background .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'var(--surface-2,#fff)\'">' + escHtml(a.label) + '</a>';
      }).join('');
      return '<div style="padding:14px 16px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:12px;display:flex;flex-direction:column;gap:8px">' +
        '<div style="display:flex;align-items:center;gap:8px"><svg class="ico" width="14" height="14" style="color:var(--violet-800,#463a54)"><use href="#' + icon + '"/></svg><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--violet-800,#463a54)">' + sug.kind + '</span></div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--text,#111);line-height:1.35">' + escHtml(sug.title) + '</div>' +
        (sug.body ? '<div style="font-size:12px;color:var(--text-2,#555);line-height:1.4">' + escHtml(sug.body) + '</div>' : '') +
        (actions ? '<div style="display:flex;gap:6px;margin-top:4px">' + actions + '</div>' : '') +
      '</div>';
    }).join('');
    return '<section style="margin-bottom:24px"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px"><h2 style="margin:0;font-size:14px;font-weight:600;color:var(--text,#111)">Suggestions aiCEO</h2><span style="font-size:11px;color:var(--text-3,#888)">' + suggestions.length + ' proposition(s)</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px">' + items + '</div></section>';
  }

  async function init() {
    var main = document.querySelector('main, .app-main');
    if (!main) return;
    if (main.dataset.cockpitNarrativeInjected) return;
    main.dataset.cockpitNarrativeInjected = '1';

    // Fetch en parallele
    var [intentRes, alertsRes, suggestionsRes] = await Promise.all([
      tryJson('/api/cockpit/intention'),
      tryJson('/api/cockpit/morning-alerts'),
      tryJson('/api/cockpit/llm-suggestions')
    ]);

    var intention = (intentRes && intentRes.intention) || 'Posez le cap de votre semaine.';
    var bigRocks = (intentRes && intentRes.big_rocks) || [];
    var alerts = (alertsRes && alertsRes.alerts) || [];
    var suggestions = (suggestionsRes && suggestionsRes.suggestions) || [];

    var wrap = document.createElement('div');
    wrap.className = 'aiceo-cockpit-narrative';
    wrap.innerHTML = renderHero(intention, bigRocks) + renderAlerts(alerts) + renderSuggestions(suggestions);

    // Inserer en premier dans main
    main.insertBefore(wrap, main.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
