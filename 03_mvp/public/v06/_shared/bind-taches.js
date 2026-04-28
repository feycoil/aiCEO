/* bind-taches.js v5 — Liste actions + filtres cables (chips + tri) */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'taches') return;

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

  let allTasks = [];
  let allGroups = [];
  let activeFilter = 'all';
  let activeSort = 'priority';

  function bucketFor(t) {
    var due = t.due_at || t.created_at;
    if (!due) return 'plus_tard';
    var date = new Date(due);
    if (isNaN(date.getTime())) return 'plus_tard';
    var now = new Date();
    var todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    var weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay()));
    if (date <= todayEnd) return 'aujourd_hui';
    if (date <= weekEnd) return 'semaine';
    return 'plus_tard';
  }

  function isLate(t) {
    return t.due_at && new Date(t.due_at).getTime() < Date.now();
  }

  function dueLabel(t) {
    if (!t.due_at) {
      if (t.estimated_min) return '~' + t.estimated_min + ' min';
      return '';
    }
    var date = new Date(t.due_at);
    var now = new Date();
    var diffDays = Math.floor((date.getTime() - now.getTime()) / 86400000);
    if (diffDays < 0) return 'En retard \u00B7 J' + diffDays;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 7) return 'J+' + diffDays;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function renderTask(t) {
    var prio = (t.priority || 'P2').toLowerCase();
    var prioColors = {
      p0: { bg: 'var(--rose, #d94a3d)', fg: '#fff' },
      p1: { bg: 'var(--rose-50, #fde6e3)', fg: 'var(--rose-700, #9c2920)' },
      p2: { bg: 'var(--surface-3, #ebe7df)', fg: 'var(--text-2, #555)' },
      p3: { bg: 'transparent', fg: 'var(--text-3, #888)' }
    };
    var pc = prioColors[prio] || prioColors.p2;
    var due = dueLabel(t);
    var lateColor = isLate(t) ? 'color:var(--rose-700,#9c2920);font-weight:600' : 'color:var(--text-3,#888)';
    var groupChip = '';
    if (t.project_id) {
      var g = allGroups.find(function(grp){ return grp.id === t.project_id; });
      if (g) {
        groupChip = '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:99px;background:var(--surface-3,#ebe7df);color:var(--text-2,#555);white-space:nowrap">' + escHtml(g.name) + '</span>';
      }
    }
    return '<li class="task-row" data-task-id="' + escHtml(t.id) + '" data-priority="' + prio + '" data-bucket="' + bucketFor(t) + '" style="display:flex;align-items:center;gap:12px;padding:12px 8px;border-bottom:1px solid var(--border,#eee);list-style:none">' +
        '<button class="task-check" aria-label="Cocher" style="flex:0 0 22px;width:22px;height:22px;border-radius:50%;border:2px solid var(--border-2,#d4d0c4);background:transparent;cursor:pointer;padding:0" onclick="return window.aiceoTaskToggle && window.aiceoTaskToggle(event, \'' + escHtml(t.id) + '\')"></button>' +
        '<span class="task-prio ' + prio + '" style="flex:0 0 36px;width:36px;text-align:center;font-size:10px;font-weight:800;padding:3px 0;border-radius:4px;background:' + pc.bg + ';color:' + pc.fg + '">' + prio.toUpperCase() + '</span>' +
        '<div class="task-main" style="flex:1;min-width:0;overflow:hidden">' +
          '<h3 style="margin:0 0 2px;font-size:14px;font-weight:600;color:var(--text,#111);line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(t.title || '(sans titre)') + '</h3>' +
          '<div style="display:flex;gap:6px;align-items:center;font-size:12px;color:var(--text-3,#888);flex-wrap:wrap">' +
            (t.estimated_min ? '<span>~' + t.estimated_min + ' min</span>' : '') +
            (due ? (t.estimated_min ? '<span>·</span>' : '') + '<span style="' + lateColor + '">' + escHtml(due) + '</span>' : '') +
            (groupChip ? '<span>·</span>' + groupChip : '') +
          '</div>' +
        '</div>' +
        '<button class="icon-btn" aria-label="Plus" tabindex="-1" style="flex:0 0 28px;width:28px;height:28px;border:0;background:transparent;cursor:pointer;color:var(--text-3,#888);border-radius:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>' +
      '</li>';
  }

  function applyFilter(tasks) {
    if (activeFilter === 'all') return tasks;
    if (activeFilter === 'today') return tasks.filter(function(t){ return bucketFor(t) === 'aujourd_hui'; });
    if (activeFilter === 'week') return tasks.filter(function(t){ return bucketFor(t) === 'semaine' || bucketFor(t) === 'aujourd_hui'; });
    if (activeFilter === 'late') return tasks.filter(isLate);
    // Sinon : maison (group_id)
    return tasks.filter(function(t){ return t.project_id === activeFilter; });
  }

  function applySort(tasks) {
    var sorted = tasks.slice();
    if (activeSort === 'priority') {
      sorted.sort(function(a, b){
        var pa = ['P0','P1','P2','P3'].indexOf((a.priority||'P2').toUpperCase());
        var pb = ['P0','P1','P2','P3'].indexOf((b.priority||'P2').toUpperCase());
        if (pa !== pb) return pa - pb;
        var da = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        var db = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    } else if (activeSort === 'due') {
      sorted.sort(function(a, b){
        var da = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        var db = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    } else if (activeSort === 'group') {
      sorted.sort(function(a, b){ return (a.project_id||'').localeCompare(b.project_id||''); });
    } else if (activeSort === 'recent') {
      sorted.sort(function(a, b){ return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); });
    }
    return sorted;
  }

  function totalEst(arr) {
    return arr.reduce(function(s, t){ return s + (t.estimated_min || 0); }, 0);
  }

  function renderGroup(label, tasks) {
    var est = totalEst(tasks);
    return '<article class="task-group">' +
      '<header class="task-group-head">' +
        '<h2 class="card-title" style="font-size:var(--fs-h4)">' + label + '</h2>' +
        '<span class="u-text-3 small">' + tasks.length + ' action' + (tasks.length > 1 ? 's' : '') + (est ? ' \u00B7 ~' + est + ' min estimees' : '') + '</span>' +
      '</header>' +
      '<ul class="task-list" role="list">' +
        tasks.map(renderTask).join('') +
      '</ul>' +
    '</article>';
  }

  function renderAll() {
    const section = $('.task-groups');
    if (!section) return;

    const filtered = applySort(applyFilter(allTasks));

    if (filtered.length === 0) {
      section.innerHTML = '<div style="padding:60px 24px;text-align:center;color:var(--text-3,#888);background:var(--surface-2,#fff);border-radius:14px">' +
        '<p style="margin:0 0 8px;font-weight:500">Aucune action pour ce filtre</p>' +
        '<p style="margin:0;font-size:13px">Changez de filtre ou retirez les criteres pour voir d\'autres actions.</p>' +
      '</div>';
      return;
    }

    // Toujours grouper par bucket si activeFilter != 'all', on group quand meme sauf si on a un filtre temporel
    if (activeFilter === 'today' || activeFilter === 'late') {
      section.innerHTML = renderGroup(activeFilter === 'today' ? "Aujourd'hui" : 'En retard', filtered);
    } else {
      const buckets = { aujourd_hui: [], semaine: [], plus_tard: [] };
      filtered.forEach(function(t){ buckets[bucketFor(t)].push(t); });
      var html = '';
      if (buckets.aujourd_hui.length > 0) html += renderGroup("Aujourd'hui", buckets.aujourd_hui);
      if (buckets.semaine.length > 0)     html += renderGroup('Cette semaine', buckets.semaine);
      if (buckets.plus_tard.length > 0)   html += renderGroup('Plus tard', buckets.plus_tard);
      section.innerHTML = html;
    }
  }

  function refreshChipCounts() {
    var counts = {
      all: allTasks.length,
      today: allTasks.filter(function(t){ return bucketFor(t) === 'aujourd_hui'; }).length,
      week: allTasks.filter(function(t){ var b = bucketFor(t); return b === 'semaine' || b === 'aujourd_hui'; }).length,
      late: allTasks.filter(isLate).length
    };
    var chips = $$('.filter-chips .chip');
    chips.forEach(function(chip){
      var f = chip.dataset.filter;
      var cnt = chip.querySelector('.chip-count');
      if (counts.hasOwnProperty(f)) {
        if (cnt) cnt.textContent = counts[f];
      } else if (f && f.length > 0) {
        // Filtre maison : compter par group_id
        var n = allTasks.filter(function(t){ return t.project_id === f; }).length;
        if (cnt) cnt.textContent = n;
        else {
          var c = document.createElement('span');
          c.className = 'chip-count';
          c.textContent = n;
          chip.appendChild(c);
        }
      }
    });
  }

  function rebuildHouseChips() {
    var chips = $('.filter-chips');
    if (!chips) return;
    // Retirer les anciens chips maison (Northwind/Solstice/Helix hardcodes)
    var oldHouses = $$('.filter-chips .chip').filter(function(c){
      var f = c.dataset.filter;
      return f && f !== 'all' && f !== 'today' && f !== 'week' && f !== 'late' && !allGroups.find(function(g){ return g.id === f; });
    });
    oldHouses.forEach(function(c){ c.remove(); });

    // Ajouter les vraies maisons
    allGroups.forEach(function(g){
      if (chips.querySelector('[data-filter="' + g.id + '"]')) return;
      var chip = document.createElement('button');
      chip.className = 'chip';
      chip.dataset.filter = g.id;
      var color = g.color || 'rose';
      chip.innerHTML = '<span class="dot" style="background:var(--' + color + ', var(--text-3))"></span>' + escHtml(g.name) + ' <span class="chip-count">0</span>';
      chips.appendChild(chip);
    });
  }

  function bindChips() {
    document.body.addEventListener('click', function(ev) {
      var chip = ev.target.closest('.filter-chips .chip');
      if (chip && chip.dataset.filter) {
        ev.preventDefault();
        $$('.filter-chips .chip').forEach(function(c){ c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeFilter = chip.dataset.filter;
        renderAll();
      }
    });
  }

  function bindSort() {
    var select = $('.filter-meta select');
    if (!select) return;
    var map = { 0: 'priority', 1: 'due', 2: 'group', 3: 'recent' };
    select.addEventListener('change', function() {
      activeSort = map[select.selectedIndex] || 'priority';
      renderAll();
    });
  }

  function bindNewAction() {
    var btn = Array.prototype.slice.call(document.querySelectorAll('button')).find(function(b){
      return /nouvelle action/i.test(b.textContent || '');
    });
    if (!btn) return;
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      if (window.AICEOCrud && window.AICEOCrud.open) {
        window.AICEOCrud.open('task');
      } else {
        var title = prompt('Titre de la nouvelle action :');
        if (!title) return;
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title, priority: 'P2' })
        }).then(function(r){ if (r.ok) init(); });
      }
    });
  }

  // Toggle done/non-done
  window.aiceoTaskToggle = function(ev, id) {
    if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
    var checkbox = ev && ev.target ? ev.target : null;
    var row = checkbox ? checkbox.closest('.task-row') : null;
    var done = row && row.classList.contains('is-done');
    fetch('/api/tasks/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: done ? 0 : 1 })
    }).then(function(r){
      if (r.ok && row) {
        row.classList.toggle('is-done');
        if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast(done ? 'Tache rouverte' : 'Tache cochee', 'success');
      }
    }).catch(function(err){ console.error('[aiCEO task-toggle]', err); });
    return false;
  };

  async function init() {
    const [tasksData, groupsData] = await Promise.all([
      tryJson('/api/tasks?done=false&limit=200'),
      tryJson('/api/groups')
    ]);
    allTasks = (tasksData && tasksData.tasks) || [];
    allGroups = (groupsData && groupsData.groups) || [];

    rebuildHouseChips();
    refreshChipCounts();
    renderAll();

    // Maj filter-meta count
    var meta = $('.filter-meta');
    // Le filter-meta a un select, on n'ecrase pas le contenu
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      bindChips();
      bindSort();
      bindNewAction();
      init();
    });
  } else {
    bindChips();
    bindSort();
    bindNewAction();
    init();
  }
})();
