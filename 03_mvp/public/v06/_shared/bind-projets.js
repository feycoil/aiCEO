/* bind-projets.js v4 — Liste projets groupes par maison + auto-status aiCEO
 *
 * Heuristique status (rule-based, faute de LLM brancher):
 *   - "alerte" si email recent < 3j ET volume >= 30 sur 30j
 *   - "a-surveiller" si volume >= 15 sur 30j
 *   - "sain" sinon
 *   (Ces seuils sont extrais de la description "X email(s) sur 30 jours...")
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'projets') return;

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

  // Inferer status depuis description "N email(s) sur 30 jours (premier YYYY-MM-DD, dernier YYYY-MM-DD)"
  function inferStatus(p) {
    if (p.status && p.status !== 'active' && p.status !== 'new') return p.status;
    const desc = p.description || '';
    const volMatch = desc.match(/^(\d+)\s+email/);
    const lastMatch = desc.match(/dernier\s+(\d{4}-\d{2}-\d{2})/);
    if (!volMatch) return 'sain';
    const vol = parseInt(volMatch[1], 10);
    let daysSinceLast = 999;
    if (lastMatch) {
      daysSinceLast = Math.floor((Date.now() - new Date(lastMatch[1]).getTime()) / 86400000);
    }
    if (daysSinceLast <= 3 && vol >= 30) return 'alerte';
    if (vol >= 15) return 'a-surveiller';
    return 'sain';
  }

  function statusPill(status) {
    const map = {
      'alerte':       { label: 'ALERTE',       bg: 'var(--rose-50, #fde6e3)',    fg: 'var(--rose-700, #9c2920)',  dot: 'var(--rose, #d94a3d)' },
      'a-surveiller': { label: 'A SURVEILLER', bg: 'var(--amber-50, #fef3c7)',   fg: 'var(--amber-800, #92400e)', dot: 'var(--amber, #f5b342)' },
      'hot':          { label: 'URGENT',       bg: 'var(--rose-50, #fde6e3)',    fg: 'var(--rose-700, #9c2920)',  dot: 'var(--rose, #d94a3d)' },
      'suspended':    { label: 'SUSPENDU',     bg: 'var(--surface-3, #ebe7df)',  fg: 'var(--text-2, #555)',       dot: 'var(--text-3, #888)' },
      'archived':     { label: 'ARCHIVE',      bg: 'var(--surface-3, #ebe7df)',  fg: 'var(--text-3, #888)',       dot: 'var(--text-3, #888)' },
      'sain':         { label: 'SAIN',         bg: 'var(--emerald-50, #d6f3e6)', fg: 'var(--emerald-700, #115e3c)', dot: 'var(--emerald, #15a05c)' }
    };
    const s = map[status] || map.sain;
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;background:' + s.bg + ';color:' + s.fg + ';letter-spacing:0.05em">' +
      '<span style="width:6px;height:6px;border-radius:50%;background:' + s.dot + '"></span>' + s.label + '</span>';
  }

  function progressFromVolume(p) {
    const vol = (p.description || '').match(/^(\d+)/);
    if (!vol) return 0;
    const n = parseInt(vol[1], 10);
    return Math.min(95, Math.max(10, Math.round(n * 1.5)));
  }

  function renderCard(p) {
    const status = inferStatus(p);
    const progress = progressFromVolume(p);
    const desc = p.description || '';
    const volMatch = desc.match(/^(\d+)\s+email/);
    const vol = volMatch ? volMatch[1] : '0';
    const lastMatch = desc.match(/dernier\s+(\d{4}-\d{2}-\d{2})/);
    let recence = '';
    if (lastMatch) {
      const days = Math.floor((Date.now() - new Date(lastMatch[1]).getTime()) / 86400000);
      recence = days === 0 ? "aujourd'hui" : (days === 1 ? "hier" : "il y a " + days + " j");
    }

    const progBg = status === 'alerte' ? 'var(--rose, #d94a3d)' :
                   status === 'a-surveiller' ? 'var(--amber, #f5b342)' : 'var(--emerald, #15a05c)';

    return '<a href="projet.html?id=' + encodeURIComponent(p.id) + '" class="proj-card" data-project-id="' + p.id + '" data-status="' + status + '" style="display:flex;flex-direction:column;gap:10px;padding:18px 20px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px;text-decoration:none;color:inherit;transition:all 0.15s">' +
        '<header style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
          statusPill(status) +
          '<span style="font-size:11px;color:var(--text-3,#888)">Actif depuis ' + recence + '</span>' +
        '</header>' +
        '<h3 style="margin:0;font-size:16px;font-weight:600;color:var(--text,#111);line-height:1.3">' + escHtml(p.name || '(sans nom)') + '</h3>' +
        (p.tagline ? '<p style="margin:0;font-size:13px;color:var(--text-3,#888);line-height:1.4">' + escHtml(p.tagline) + '</p>' : '') +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto">' +
          '<div style="flex:1;height:4px;background:var(--surface-3,#ebe7df);border-radius:99px;overflow:hidden">' +
            '<div style="height:100%;width:' + progress + '%;background:' + progBg + ';border-radius:99px"></div>' +
          '</div>' +
          '<span style="font-size:13px;font-weight:600;color:var(--text-2,#555);min-width:36px;text-align:right">' + progress + '%</span>' +
        '</div>' +
        '<footer style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-3,#888);padding-top:8px;border-top:1px solid var(--border,#f0eee9)">' +
          '<span>' + vol + ' email(s) / 30j</span>' +
          (status === 'alerte' ? '<span style="color:var(--rose-700,#9c2920);font-weight:600">! recent</span>' : '') +
        '</footer>' +
      '</a>';
  }

  function summarize(projects) {
    const alerts = projects.filter(function (p) { return inferStatus(p) === 'alerte'; }).length;
    const watch = projects.filter(function (p) { return inferStatus(p) === 'a-surveiller'; }).length;
    const sains = projects.length - alerts - watch;
    return '<header style="display:flex;align-items:center;gap:18px;margin-bottom:24px;font-size:13px;color:var(--text-2,#555)">' +
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--emerald,#15a05c)"></span><strong>' + sains + '</strong> en bonne sante</span>' +
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--amber,#f5b342)"></span><strong>' + watch + '</strong> a surveiller</span>' +
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--rose,#d94a3d)"></span><strong>' + alerts + '</strong> en alerte</span>' +
    '</header>';
  }

  function emptyHouse(projects) {
    return '<div style="grid-column:1/-1;padding:48px 24px;background:var(--surface-2,#fff);border:1px dashed var(--border,#e5e1d8);border-radius:14px;text-align:center;color:var(--text-3,#888)">' +
      '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;color:var(--text-3,#888)"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>' +
      '<h3 style="margin:0 0 8px;font-size:15px;font-weight:600;color:var(--text,#111)">Aucune maison rattachee</h3>' +
      '<p style="margin:0 0 16px;font-size:13px;max-width:420px;margin-left:auto;margin-right:auto">Vos ' + projects.length + ' projets sont detectes automatiquement depuis vos emails, mais ne sont rattaches a aucune maison. Creez vos maisons depuis Reglages pour mieux organiser.</p>' +
      '<a href="/v06/settings.html#tab=maisons" class="btn primary" style="text-decoration:none">+ Creer une maison</a>' +
    '</div>';
  }

  async function init() {
    const data = await tryJson('/api/projects?limit=100');
    const projects = (data && data.projects) || [];
    const grids = $$('.proj-grid');

    if (grids.length === 0) return;
    if (projects.length === 0) {
      grids[0].innerHTML = '<div style="grid-column:1/-1;padding:60px 24px;text-align:center;color:var(--text-3,#888)">' +
        '<p style="margin:0 0 8px;font-weight:500">Aucun projet enregistre.</p>' +
        '<p style="margin:0;font-size:13px">Lancez un arbitrage matin pour decouvrir des projets dans vos emails.</p>' +
        '</div>';
      return;
    }

    // Summary header au-dessus
    const summarySection = $('.proj-houses, .proj-health-bar') || grids[0].parentElement;
    if (summarySection && !summarySection.querySelector('.aiceo-proj-summary')) {
      const sum = document.createElement('div');
      sum.className = 'aiceo-proj-summary';
      sum.innerHTML = summarize(projects);
      summarySection.insertBefore(sum, summarySection.firstChild);
    }

    // Tous les projets dans le 1er grid (pas de groupes en DB)
    const grid = grids[0];
    const sorted = projects.slice().sort(function (a, b) {
      const order = { alerte: 0, 'a-surveiller': 1, sain: 2 };
      return (order[inferStatus(a)] || 9) - (order[inferStatus(b)] || 9);
    });

    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    grid.style.gap = '16px';

    // Tous les projets sont group_id=null -> pas de maison rattachee
    const orphans = projects.filter(function (p) { return !p.group_id; });
    if (orphans.length === projects.length) {
      grid.innerHTML = emptyHouse(projects) + sorted.map(renderCard).join('');
    } else {
      grid.innerHTML = sorted.map(renderCard).join('');
    }

    // Cacher les autres grids (ils sont des duplicats demo)
    for (let i = 1; i < grids.length; i++) {
      grids[i].style.display = 'none';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
