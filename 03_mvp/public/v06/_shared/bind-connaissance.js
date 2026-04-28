/* bind-connaissance.js — Page connaissance câblée v0.7 (S6.7)
 * Lit /api/knowledge (table knowledge_pins).
 * Permet de pinner une décision, principle ou note. */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'knowledge' && document.body.dataset.route !== 'connaissance') return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  async function api(method, url, body) {
    try {
      var r = await fetch(url, {
        method: method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
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
    return "il y a " + Math.floor(diff / 30) + " mois";
  }

  var KIND_LABEL = {
    decision: 'Decision',
    criterion: 'Critere',
    principle: 'Principe',
    note: 'Note'
  };
  var KIND_COLOR = {
    decision: { bg: 'var(--rose-50,#fde6e3)', fg: 'var(--rose-700,#9c2920)' },
    criterion: { bg: 'var(--amber-50,#fef3c7)', fg: 'var(--amber-800,#92400e)' },
    principle: { bg: 'var(--emerald-50,#d6f3e6)', fg: 'var(--emerald-700,#115e3c)' },
    note: { bg: 'var(--surface-3,#ebe7df)', fg: 'var(--text-2,#555)' }
  };

  function renderPin(p) {
    var c = KIND_COLOR[p.kind] || KIND_COLOR.note;
    var label = KIND_LABEL[p.kind] || 'Note';
    var when = recence(p.pinned_at);
    return '<article class="kn-card" data-pin-id="' + p.id + '" style="display:flex;flex-direction:column;gap:8px;padding:18px 20px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px">' +
      '<header style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">' +
        '<span style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + c.bg + ';color:' + c.fg + ';letter-spacing:0.05em;text-transform:uppercase">' + label + '</span>' +
        '<span style="font-size:11px;color:var(--text-3,#888)">' + when + '</span>' +
      '</header>' +
      '<h3 style="margin:0;font-size:14px;font-weight:600;color:var(--text,#111);line-height:1.35">' + escHtml(p.title) + '</h3>' +
      (p.content ? '<p style="margin:0;font-size:12px;color:var(--text-2,#555);line-height:1.5">' + escHtml(p.content.slice(0, 220)) + (p.content.length > 220 ? '...' : '') + '</p>' : '') +
      '<footer style="display:flex;justify-content:space-between;gap:8px;margin-top:6px;padding-top:8px;border-top:1px solid var(--border,#f0eee9);font-size:11px;color:var(--text-3,#888)">' +
        '<span>' + (p.source_type || 'manuel') + '</span>' +
        '<button type="button" data-pin-archive="' + p.id + '" style="background:transparent;border:0;color:var(--rose-700,#9c2920);font-size:11px;cursor:pointer;padding:0">Archiver</button>' +
      '</footer>' +
    '</article>';
  }

  function renderEmpty() {
    return '<div style="padding:60px 24px;text-align:center;color:var(--text-3,#888)">' +
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-3,#888);margin-bottom:12px"><path d="M12 2l2.39 4.84L20 8l-4 3.91.94 5.5L12 14.77l-4.94 2.64L8 11.91 4 8l5.61-1.16z"/></svg>' +
      '<h3 style="margin:0 0 6px;font-size:15px;font-weight:600;color:var(--text,#111)">Aucune connaissance epinglee</h3>' +
      '<p style="margin:0 0 18px;font-size:13px;max-width:420px;margin-left:auto;margin-right:auto">Epinglez vos decisions tranchees, principes recurrents ou criteres importants pour construire votre base de connaissance.</p>' +
      '<button type="button" id="aiceo-kn-add" class="btn primary">+ Premiere note</button>' +
    '</div>';
  }

  async function init() {
    var data = await api('GET', '/api/knowledge');
    var pins = (data && data.pins) || [];
    var main = $('main, .app-main');
    if (!main) return;

    // Cache le banner ambre preview si présent (la page est maintenant câblée)
    var banner = main.querySelector('.aiceo-preview-banner, [class*="preview-banner"]');
    if (banner) banner.style.display = 'none';

    // Cible: .kn-pinned-list ou injecter dans main
    var target = $('.kn-pinned-list') || $('.kn-pinned-grid') || $('.kn-list');
    if (!target) {
      target = document.createElement('section');
      target.className = 'kn-pinned-list';
      target.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;margin-top:20px';
      main.appendChild(target);
    }

    if (pins.length === 0) {
      target.innerHTML = renderEmpty();
    } else {
      target.style.display = 'grid';
      target.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
      target.style.gap = '14px';
      target.innerHTML = pins.map(renderPin).join('');
    }

    // Bind archive
    target.addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-pin-archive]');
      if (!btn) return;
      var id = btn.dataset.pinArchive;
      if (!confirm('Archiver cette epingle ?')) return;
      var r = await api('DELETE', '/api/knowledge/' + id);
      if (r && r.ok) {
        var card = btn.closest('article');
        if (card) card.style.opacity = '0.4';
        setTimeout(function () { if (card.parentElement) card.parentElement.removeChild(card); }, 300);
      }
    });

    // Bind add (button d'empty state)
    var addBtn = document.getElementById('aiceo-kn-add');
    if (addBtn) {
      addBtn.addEventListener('click', async function () {
        var title = prompt("Titre de l'epingle :");
        if (!title) return;
        var content = prompt('Contenu (optionnel) :') || '';
        var kind = prompt('Type (decision / criterion / principle / note) :') || 'note';
        if (!['decision', 'criterion', 'principle', 'note'].includes(kind)) kind = 'note';
        var r = await api('POST', '/api/knowledge', { title: title, content: content, kind: kind });
        if (r && r.pin) init();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
