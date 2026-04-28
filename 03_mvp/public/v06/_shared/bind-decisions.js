/* bind-decisions.js v5 — Page decisions cablee complete (S6.8.1)
 * - 4 KPI dynamiques (tranchees, attente, infirmees, revisiter)
 * - Cards riches : rail date + pills (project/type/status) + rationale + effets + footer
 * - Bouton "Ouvrir" : modal detail
 * - Bouton "Demander a l'assistant" : redirige avec ?context=decision:<id>
 * - Search input + filtres type + horizon
 * - Bouton Exporter : telecharge JSON
 */
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

  function recence(d) {
    if (!d) return '';
    var diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return "hier";
    if (diff < 7) return "il y a " + diff + " j";
    if (diff < 30) return "il y a " + Math.floor(diff / 7) + " sem";
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  function formatDateLine(iso) {
    if (!iso) return ['—', ''];
    var d = new Date(iso);
    var today = new Date();
    today.setHours(0,0,0,0);
    var dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var diffJ = Math.round((today - dDate) / 86400000);
    var dateLabel;
    if (diffJ === 0) dateLabel = "Aujourd'hui";
    else if (diffJ === 1) dateLabel = 'Hier';
    else dateLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    var timeLabel = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return [dateLabel, timeLabel];
  }

  // Mapping status -> { label, css class for pill }
  var STATUS_MAP = {
    'ouverte':    { lbl: 'A trancher', cls: 'active', color: { bg: 'var(--rose-50,#fde6e3)', fg: 'var(--rose-700,#9c2920)' } },
    'decidee':    { lbl: 'Tranchee',   cls: 'active', color: { bg: 'var(--emerald-50,#d6f3e6)', fg: 'var(--emerald-700,#115e3c)' } },
    'executee':   { lbl: 'Executee',   cls: 'active', color: { bg: 'var(--emerald-50,#d6f3e6)', fg: 'var(--emerald-700,#115e3c)' } },
    'abandonnee': { lbl: 'Gelee',      cls: 'frozen', color: { bg: 'var(--surface-3,#ebe7df)', fg: 'var(--text-3,#888)' } },
    'reportee':   { lbl: 'Reportee',   cls: 'frozen', color: { bg: 'var(--amber-50,#fef3c7)', fg: 'var(--amber-800,#92400e)' } }
  };

  // Heuristique : type d'une decision selon son statut/context (pas de champ dedie en v0.7)
  function inferType(d) {
    var txt = ((d.title || '') + ' ' + (d.context || '') + ' ' + (d.decision || '')).toLowerCase();
    if (/posture|principe|ne plus|ne jamais|jamais/.test(txt)) return 'posture';
    if (/strateg|positionnement|cap|pivot|partenariat|levee|series|valuation|priorit|focus/.test(txt)) return 'strategic';
    return 'operational';
  }
  var TYPE_LABEL = { strategic: 'Strategique', operational: 'Operationnelle', posture: 'Posture' };

  function statusPill(status) {
    var cfg = STATUS_MAP[status] || STATUS_MAP['ouverte'];
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + cfg.color.bg + ';color:' + cfg.color.fg + ';letter-spacing:.05em;text-transform:uppercase">' + cfg.lbl + '</span>';
  }

  function typePill(type) {
    var lbl = TYPE_LABEL[type] || 'Note';
    return '<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:600;padding:3px 8px;border-radius:99px;background:var(--surface-3,#ebe7df);color:var(--text-2,#555);letter-spacing:.04em;text-transform:uppercase">' + lbl + '</span>';
  }

  function renderCard(d) {
    var status = d.status || 'ouverte';
    var dateLine = formatDateLine(d.created_at);
    var type = inferType(d);
    var rationale = d.decision || d.context || '';
    var hasRevisit = d.revisit_at;
    return '<article class="dec-card" data-decision-id="' + escHtml(d.id) + '" data-status="' + status + '" data-type="' + type + '" style="display:grid;grid-template-columns:96px 1fr;gap:18px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px;padding:18px 20px;margin-bottom:14px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
      '<div class="dec-card-rail" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding-top:4px;border-right:1px solid var(--border,#f0eee9);padding-right:14px">' +
        '<span class="dec-card-date" style="font-size:13px;font-weight:600;color:var(--text,#111)">' + dateLine[0] + '</span>' +
        (dateLine[1] ? '<span class="dec-card-time" style="font-size:11px;color:var(--text-3,#888)">' + dateLine[1] + '</span>' : '') +
      '</div>' +
      '<div class="dec-card-body" style="display:flex;flex-direction:column;gap:8px">' +
        '<header class="dec-card-head" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
          typePill(type) + statusPill(status) +
        '</header>' +
        '<h3 class="dec-card-title" style="margin:0;font-size:15px;font-weight:600;color:var(--text,#111);line-height:1.35">' + escHtml(d.title || '(sans titre)') + '</h3>' +
        (rationale ? '<p class="dec-card-rationale" style="margin:0;font-size:13px;color:var(--text-2,#555);line-height:1.5">' + escHtml(rationale).slice(0, 280) + (rationale.length > 280 ? '...' : '') + '</p>' : '') +
        (status === 'decidee' || status === 'executee' ?
          '<div class="dec-card-effects" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 12px;background:var(--surface,#faf8f3);border-radius:8px;font-size:12px">' +
            '<div><span style="display:block;font-size:10px;color:var(--text-3,#888);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Tranchee le</span><span style="color:var(--text-2,#555)">' + recence(d.decided_at || d.created_at) + '</span></div>' +
            (hasRevisit ? '<div><span style="display:block;font-size:10px;color:var(--text-3,#888);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">A revisiter</span><span style="color:var(--text-2,#555)">' + recence(d.revisit_at) + '</span></div>' : '<div></div>') +
          '</div>' : '') +
        '<footer class="dec-card-foot" style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;padding-top:10px;border-top:1px solid var(--border,#f0eee9);font-size:11px;color:var(--text-3,#888)">' +
          '<span class="dec-card-source">Posee ' + recence(d.created_at) + (d.created_at ? ' · ' + new Date(d.created_at).toLocaleDateString('fr-FR') : '') + '</span>' +
          '<div style="display:flex;gap:6px">' +
            (status === 'ouverte' ? '<a href="assistant.html?context=decision:' + encodeURIComponent(d.id) + '" data-bound="1" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--violet-800,#463a54);text-decoration:none;padding:5px 10px;border-radius:6px;background:var(--violet-50,#ece7f0);transition:all .15s" onmouseover="this.style.background=\'var(--violet-800,#463a54)\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'var(--violet-50,#ece7f0)\';this.style.color=\'var(--violet-800,#463a54)\'">Demander a l\'assistant</a>' : '') +
            '<button type="button" class="dec-open-btn btn ghost xs" data-bound="1" data-decision-open="' + escHtml(d.id) + '" style="font-size:11px;padding:5px 10px;border-radius:6px;background:transparent;border:1px solid var(--border,#ddd);color:var(--text-2,#555);cursor:pointer;transition:all .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'">Ouvrir &rarr;</button>' +
          '</div>' +
        '</footer>' +
      '</div>' +
    '</article>';
  }

  // KPIs : update les 4 pulse cards
  function updateKpis(decisions) {
    var open = decisions.filter(function (d) { return (d.status || 'ouverte') === 'ouverte'; }).length;
    var done = decisions.filter(function (d) { return d.status === 'decidee' || d.status === 'executee'; }).length;
    var infirmed = decisions.filter(function (d) { return d.status === 'abandonnee' && d.decided_at; }).length;
    var revisit = decisions.filter(function (d) {
      if (!d.revisit_at) return false;
      var diff = (new Date(d.revisit_at).getTime() - Date.now()) / 86400000;
      return diff > 0 && diff < 30;
    }).length;
    var pulses = {
      'dec-pulse-tranchees': done,
      'dec-pulse-attente': open,
      'dec-pulse-infirmees': infirmed,
      'dec-pulse-revisiter': revisit
    };
    Object.keys(pulses).forEach(function (k) {
      var el = document.getElementById(k);
      if (el) el.textContent = String(pulses[k]);
    });
    var eyebrow = $('#dec-eyebrow');
    if (eyebrow) eyebrow.textContent = 'Decisions' + (done > 0 ? ' · ' + done + ' tranchee' + (done > 1 ? 's' : '') : '');
  }

  // Modal detail décision
  function showDetailModal(d) {
    var existing = $('.aiceo-dec-modal-overlay');
    if (existing) existing.remove();
    var status = d.status || 'ouverte';
    var type = inferType(d);
    var overlay = document.createElement('div');
    overlay.className = 'aiceo-dec-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,18,16,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;animation:aiceoFadeIn .2s';
    overlay.innerHTML = [
      '<div style="background:var(--surface-1,#fafaf7);border-radius:16px;padding:32px;width:640px;max-width:92vw;max-height:88vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.18);animation:aiceoSlideUp .25s">',
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:20px">',
          '<div style="flex:1">',
            '<div style="display:flex;gap:6px;margin-bottom:10px">' + typePill(type) + statusPill(status) + '</div>',
            '<h2 style="margin:0 0 6px;font-size:20px;font-weight:600;color:var(--text,#111);line-height:1.3">' + escHtml(d.title || '(sans titre)') + '</h2>',
            '<p style="margin:0;font-size:12px;color:var(--text-3,#888)">Posee ' + recence(d.created_at) + (d.decided_at ? ' · Tranchee ' + recence(d.decided_at) : '') + '</p>',
          '</div>',
          '<button type="button" class="dec-modal-close" data-bound="1" style="background:transparent;border:0;cursor:pointer;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3,#888);transition:all .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
        '</div>',
        (d.context ? '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3,#888);margin-bottom:6px">Contexte</div><p style="margin:0;font-size:14px;line-height:1.55;color:var(--text-2,#555)">' + escHtml(d.context) + '</p></div>' : ''),
        (d.decision ? '<div style="margin-bottom:16px;padding:14px 16px;background:var(--surface,#faf8f3);border-radius:8px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3,#888);margin-bottom:6px">Decision</div><p style="margin:0;font-size:14px;line-height:1.55;color:var(--text,#111);font-weight:500">' + escHtml(d.decision) + '</p></div>' : ''),
        '<div style="display:flex;gap:8px;margin-top:24px;justify-content:flex-end;flex-wrap:wrap">',
          '<a href="assistant.html?context=decision:' + encodeURIComponent(d.id) + '" data-bound="1" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:8px;background:var(--violet-50,#ece7f0);color:var(--violet-800,#463a54);text-decoration:none;font-size:13px;font-weight:600;transition:all .15s" onmouseover="this.style.background=\'var(--violet-800,#463a54)\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'var(--violet-50,#ece7f0)\';this.style.color=\'var(--violet-800,#463a54)\'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Discuter avec l\'assistant</a>',
          (status === 'ouverte' ?
            '<button type="button" data-bound="1" data-decision-trancher="' + escHtml(d.id) + '" style="padding:10px 18px;border-radius:8px;background:var(--text,#111);color:#fff;border:0;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity=\'.9\'" onmouseout="this.style.opacity=\'1\'">Marquer tranchee</button>'
            : '') +
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    if (!document.getElementById('aiceo-dec-modal-anim')) {
      var s = document.createElement('style');
      s.id = 'aiceo-dec-modal-anim';
      s.textContent = '@keyframes aiceoFadeIn{from{opacity:0}to{opacity:1}}@keyframes aiceoSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }

    function close() { overlay.remove(); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.dec-modal-close').addEventListener('click', close);
    document.addEventListener('keydown', function escH(ev) { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escH); } });

    var trancherBtn = overlay.querySelector('[data-decision-trancher]');
    if (trancherBtn) {
      trancherBtn.addEventListener('click', async function () {
        var decision = prompt("Quelle decision tranchez-vous ? (texte court qui decrit l\'arbitrage)");
        if (!decision) return;
        var r = await fetch('/api/decisions/' + encodeURIComponent(d.id) + '/decide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: decision })
        });
        if (r.ok) { close(); init(); }
        else alert('Erreur : ' + r.status);
      });
    }
  }

  var allDecisions = [];
  var currentFilter = 'all';
  var currentHorizon = 'all';
  var currentSearch = '';

  function getFiltered() {
    var arr = allDecisions;
    if (currentFilter !== 'all') {
      arr = arr.filter(function (d) { return inferType(d) === currentFilter; });
    }
    if (currentHorizon !== 'all') {
      var horizonDays = parseInt(currentHorizon, 10);
      arr = arr.filter(function (d) {
        if (!d.created_at) return true;
        var diff = (Date.now() - new Date(d.created_at).getTime()) / 86400000;
        return diff <= horizonDays;
      });
    }
    if (currentSearch) {
      var q = currentSearch.toLowerCase();
      arr = arr.filter(function (d) {
        return (d.title && d.title.toLowerCase().includes(q))
            || (d.context && d.context.toLowerCase().includes(q))
            || (d.decision && d.decision.toLowerCase().includes(q));
      });
    }
    return arr;
  }

  function renderList() {
    var list = $('#dec-timeline');
    if (!list) return;
    var filtered = getFiltered();
    var sorted = filtered.slice().sort(function (a, b) {
      var orderA = (a.status || 'ouverte') === 'ouverte' ? 0 : 1;
      var orderB = (b.status || 'ouverte') === 'ouverte' ? 0 : 1;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    if (sorted.length === 0) {
      if (allDecisions.length === 0) {
        list.innerHTML = '<div style="padding:60px 24px;text-align:center;color:var(--text-3,#888);background:var(--surface-2,#fff);border-radius:14px">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-3,#888);margin-bottom:12px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
          '<h3 style="margin:0 0 6px;font-size:15px;font-weight:600;color:var(--text,#111)">Aucune decision enregistree.</h3>' +
          '<p style="margin:0 0 18px;font-size:13px">Tranchez votre premiere decision via l\'arbitrage matin ou acceptez une proposition email.</p>' +
          '<a href="arbitrage.html" data-bound="1" class="btn primary" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:8px;background:var(--text,#111);color:#fff;text-decoration:none;font-size:13px;font-weight:600">Aller a l\'arbitrage &rarr;</a>' +
        '</div>';
      } else {
        list.innerHTML = '<div style="padding:40px 24px;text-align:center;color:var(--text-3,#888);font-size:13px">Aucune decision ne correspond aux filtres actuels.</div>';
      }
      return;
    }
    list.innerHTML = sorted.map(renderCard).join('');
    var meta = $('#dec-filter-meta');
    if (meta) meta.textContent = sorted.length + ' resultat' + (sorted.length > 1 ? 's' : '') + ' · les plus recentes en haut';
  }

  function bindFilters() {
    $$('#dec-filter-type [data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#dec-filter-type [data-filter]').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        currentFilter = b.dataset.filter;
        renderList();
      });
    });
    $$('#dec-filter-horizon [data-horizon]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#dec-filter-horizon [data-horizon]').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        currentHorizon = b.dataset.horizon;
        renderList();
      });
    });
  }

  function bindSearch() {
    var s = $('#dec-search');
    if (!s) return;
    s.addEventListener('input', function () {
      currentSearch = s.value.trim();
      renderList();
    });
  }

  function bindOpenButtons() {
    var list = $('#dec-timeline');
    if (!list || list.dataset.openBound) return;
    list.dataset.openBound = '1';
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-decision-open]');
      if (!btn) return;
      var id = btn.dataset.decisionOpen;
      var d = allDecisions.find(function (x) { return x.id === id; });
      if (d) showDetailModal(d);
    });
  }

  function bindExport() {
    var btn = $('#dec-export-btn');
    if (!btn || btn.dataset.exportBound) return;
    btn.dataset.exportBound = '1';
    btn.addEventListener('click', function () {
      var data = JSON.stringify(allDecisions, null, 2);
      var blob = new Blob([data], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'aiceo-decisions-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (window.AICEOShell) window.AICEOShell.showToast(allDecisions.length + ' decisions exportees', 'success');
    });
  }

  async function init() {
    var data = await tryJson('/api/decisions?limit=200');
    allDecisions = (data && data.decisions) || [];
    updateKpis(allDecisions);
    renderList();
    bindFilters();
    bindSearch();
    bindOpenButtons();
    bindExport();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
