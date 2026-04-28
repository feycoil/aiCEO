/* bind-connaissance.js v3 — Page connaissance câblée v0.7 (S6.7 + S6.8.1)
 * S6.8.1 final design (28/04 PM late) :
 *   - Empty state vraiment centre dans toute la largeur (override kn-shell flex)
 *   - Card empty plus large (560px)
 *   - Modal stylé Nouvelle note (au lieu de prompt JS natif)
 *   - Toggle Liste / Frise fonctionnel (groupage par jour)
 *   - Sidebar PAR TYPE interactive (hover + active + cursor pointer)
 *   - data-bound="1" sur tous les boutons pour echapper markUnboundButtons (tag v0.7)
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'knowledge' && document.body.dataset.route !== 'connaissance') return;

  var $  = function (s, r) { return (r || document).querySelector(s); };
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
  var currentFilter = 'all';
  var currentView = 'list';
  var allPins = [];

  // ─────────── Carte Epinglee
  function renderPinnedCard(p) {
    var c = KIND_COLOR[p.kind] || KIND_COLOR.note;
    var label = KIND_LABEL[p.kind] || 'Note';
    var when = recence(p.pinned_at);
    return '<article class="kn-pinned-card" data-pin-id="' + p.id + '" style="display:flex;flex-direction:column;gap:10px;padding:18px 20px;background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px;transition:box-shadow .15s">' +
      '<div class="kn-pinned-eyebrow" style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + c.bg + ';color:' + c.fg + ';letter-spacing:.05em;text-transform:uppercase;align-self:flex-start">' + label + '</div>' +
      '<h3 style="margin:0;font-size:15px;font-weight:600;color:var(--text,#111);line-height:1.35">' + escHtml(p.title) + '</h3>' +
      (p.content ? '<p style="margin:0;font-size:13px;color:var(--text-2,#555);line-height:1.5">' + escHtml(p.content.slice(0, 220)) + (p.content.length > 220 ? '...' : '') + '</p>' : '') +
      '<footer style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;padding-top:10px;border-top:1px solid var(--border,#f0eee9);font-size:11px;color:var(--text-3,#888)">' +
        '<span>' + escHtml(p.source_type === 'assistant' ? 'via Assistant' : (p.source_type || 'manuel')) + ' &middot; ' + when + '</span>' +
        '<button type="button" data-pin-archive="' + p.id + '" data-bound="1" style="background:transparent;border:0;color:var(--text-3,#888);font-size:11px;cursor:pointer;padding:2px 8px;border-radius:6px;transition:all .15s" onmouseover="this.style.background=\'var(--rose-50,#fde6e3)\';this.style.color=\'var(--rose-700,#9c2920)\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--text-3,#888)\'">Archiver</button>' +
      '</footer>' +
      (p.source_type === 'assistant' && p.source_id ?
        '<a href="assistant.html?conv=' + encodeURIComponent(p.source_id) + '" data-bound="1" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--violet-800,#463a54);text-decoration:none;cursor:pointer;margin-top:4px;padding:4px 0;transition:color .15s" onmouseover="this.style.color=\'var(--accent,#e35a3a)\'" onmouseout="this.style.color=\'var(--violet-800,#463a54)\'"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voir la conversation source</a>'
        : '') +
    '</article>';
  }

  // ─────────── Ligne liste (vue Liste)
  function renderRow(p) {
    var c = KIND_COLOR[p.kind] || KIND_COLOR.note;
    var label = KIND_LABEL[p.kind] || 'Note';
    var when = recence(p.pinned_at);
    return '<li class="kn-row" data-pin-id="' + p.id + '" style="display:grid;grid-template-columns:120px 90px 1fr auto;gap:14px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border,#f0eee9);font-size:13px">' +
      '<span class="kn-row-time" style="color:var(--text-3,#888);font-size:11px;text-transform:uppercase;letter-spacing:.05em;font-weight:600">' + when + '</span>' +
      '<span class="kn-row-type" style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + c.bg + ';color:' + c.fg + ';letter-spacing:.05em;text-transform:uppercase;justify-self:start">' + label + '</span>' +
      '<h3 class="kn-row-title" style="margin:0;font-size:14px;font-weight:500;color:var(--text,#111);line-height:1.35">' + escHtml(p.title) + '</h3>' +
      '<span class="kn-row-source" style="color:var(--text-3,#888);font-size:11px">' + escHtml(p.source_type || 'manuel') + '</span>' +
    '</li>';
  }

  // ─────────── Vue Frise (groupage par jour)
  function renderTimeline(pins) {
    if (pins.length === 0) return '';
    var groups = {};
    pins.forEach(function (p) {
      var date = (p.pinned_at || '').slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(p);
    });
    var dates = Object.keys(groups).sort().reverse();
    return dates.map(function (d) {
      var dateLabel = recence(d);
      var items = groups[d].map(function (p) {
        var c = KIND_COLOR[p.kind] || KIND_COLOR.note;
        var label = KIND_LABEL[p.kind] || 'Note';
        return '<div class="kn-timeline-item" style="display:flex;gap:14px;padding:12px 0;border-left:2px solid var(--border,#f0eee9);padding-left:18px;position:relative">' +
          '<span style="position:absolute;left:-7px;top:18px;width:12px;height:12px;border-radius:50%;background:' + c.fg + ';border:3px solid var(--surface-1,#fafaf7)"></span>' +
          '<div style="flex:1">' +
            '<span style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;background:' + c.bg + ';color:' + c.fg + ';letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px">' + label + '</span>' +
            '<h4 style="margin:0;font-size:14px;font-weight:500;color:var(--text,#111);line-height:1.4">' + escHtml(p.title) + '</h4>' +
            (p.content ? '<p style="margin:4px 0 0;font-size:12px;color:var(--text-2,#555);line-height:1.5">' + escHtml(p.content.slice(0, 180)) + (p.content.length > 180 ? '...' : '') + '</p>' : '') +
          '</div>' +
        '</div>';
      }).join('');
      return '<div class="kn-timeline-day" style="margin-bottom:24px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-3,#888);margin-bottom:8px">' + dateLabel + '</div>' +
        items +
      '</div>';
    }).join('');
  }

  // ─────────── Empty state design v3 (centre dans toute la largeur du main)
  function renderEmpty() {
    return '<div class="aiceo-kn-empty-wrap" style="display:flex;justify-content:center;align-items:center;width:100%;min-height:60vh;padding:40px 24px">' +
      '<div class="aiceo-kn-empty-card" style="text-align:center;max-width:560px;width:100%;display:flex;flex-direction:column;align-items:center;gap:18px;padding:56px 48px;background:var(--surface-2,#fff);border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05)">' +
        '<div style="width:80px;height:80px;border-radius:50%;background:var(--violet-50,#ece7f0);display:flex;align-items:center;justify-content:center">' +
          '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--violet-800,#463a54)"><path d="M12 2l2.39 4.84L20 8l-4 3.91.94 5.5L12 14.77l-4.94 2.64L8 11.91 4 8l5.61-1.16z"/></svg>' +
        '</div>' +
        '<h3 style="margin:0;font-size:19px;font-weight:600;color:var(--text,#111);line-height:1.3">Votre base de connaissance est vide.</h3>' +
        '<p style="margin:0;font-size:14px;line-height:1.55;color:var(--text-2,#555);max-width:420px">Les decisions epinglees et criteres crees par l\'assistant apparaitront ici.</p>' +
        '<a href="assistant.html" data-bound="1" class="aiceo-empty-cta" style="display:inline-flex;align-items:center;gap:10px;padding:12px 24px;border-radius:10px;background:var(--text,#111);color:#fff;text-decoration:none;font-size:14px;font-weight:600;border:0;margin-top:8px;transition:all .15s">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          'Demarrer une conversation' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</a>' +
        '<a href="#" id="aiceo-kn-add-manual" data-bound="1" style="font-size:12px;color:var(--text-3,#888);text-decoration:none;cursor:pointer;font-family:inherit;transition:color .15s" onmouseover="this.style.color=\'var(--text-2,#555)\'" onmouseout="this.style.color=\'var(--text-3,#888)\'">ou creez une note manuellement</a>' +
      '</div>' +
    '</div>';
  }

  // ─────────── Modal stylé Nouvelle note (remplace les 3 prompts JS)
  function showAddNoteModal(onSubmit) {
    var existing = $('.aiceo-kn-modal-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'aiceo-kn-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,18,16,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;animation:aiceoKnFadeIn .2s ease-out';
    overlay.innerHTML = [
      '<div class="aiceo-kn-modal" style="background:var(--surface-1,#fafaf7);border-radius:16px;padding:32px;width:480px;max-width:90vw;max-height:90vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.18);animation:aiceoKnSlideUp .25s ease-out">',
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px">',
          '<div>',
            '<h3 style="margin:0 0 4px;font-size:18px;font-weight:600;color:var(--text,#111)">Nouvelle note</h3>',
            '<p style="margin:0;font-size:12px;color:var(--text-3,#888)">Epingler une decision, un critere, un principe ou une note libre.</p>',
          '</div>',
          '<button type="button" class="kn-modal-close" data-bound="1" aria-label="Fermer" style="background:transparent;border:0;cursor:pointer;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3,#888);transition:all .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\';this.style.color=\'var(--text,#111)\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--text-3,#888)\'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
        '</div>',
        '<form class="kn-modal-form" style="display:flex;flex-direction:column;gap:14px">',
          '<label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:600;color:var(--text-2,#555)">Type</span>',
            '<select name="kind" style="padding:10px 12px;font-size:13px;font-family:inherit;border:1px solid var(--border,#eee);border-radius:8px;background:var(--surface-2,#fff);color:var(--text,#111);cursor:pointer">',
              '<option value="note">Note</option>',
              '<option value="decision">Decision</option>',
              '<option value="criterion">Critere</option>',
              '<option value="principle">Principe</option>',
            '</select>',
          '</label>',
          '<label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:600;color:var(--text-2,#555)">Titre</span>',
            '<input name="title" type="text" required maxlength="200" placeholder="Ex: Critere de selection RFP" style="padding:10px 12px;font-size:13px;font-family:inherit;border:1px solid var(--border,#eee);border-radius:8px;background:var(--surface-2,#fff);color:var(--text,#111);outline:none;transition:border-color .15s" onfocus="this.style.borderColor=\'var(--violet-800,#463a54)\'" onblur="this.style.borderColor=\'var(--border,#eee)\'">',
          '</label>',
          '<label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:600;color:var(--text-2,#555)">Contenu (optionnel)</span>',
            '<textarea name="content" rows="5" maxlength="2000" placeholder="Detaillez la note..." style="padding:10px 12px;font-size:13px;font-family:inherit;border:1px solid var(--border,#eee);border-radius:8px;background:var(--surface-2,#fff);color:var(--text,#111);outline:none;resize:vertical;line-height:1.5;transition:border-color .15s" onfocus="this.style.borderColor=\'var(--violet-800,#463a54)\'" onblur="this.style.borderColor=\'var(--border,#eee)\'"></textarea>',
          '</label>',
          '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">',
            '<button type="button" class="kn-modal-cancel" data-bound="1" style="padding:10px 18px;border-radius:8px;background:transparent;color:var(--text-2,#555);border:1px solid var(--border,#ddd);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s" onmouseover="this.style.background=\'var(--surface-3,#ebe7df)\'" onmouseout="this.style.background=\'transparent\'">Annuler</button>',
            '<button type="submit" class="kn-modal-submit" data-bound="1" style="padding:10px 22px;border-radius:8px;background:var(--text,#111);color:#fff;border:0;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">Creer la note</button>',
          '</div>',
        '</form>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    // Animations CSS injectees une fois
    if (!document.getElementById('aiceo-kn-modal-anim')) {
      var s = document.createElement('style');
      s.id = 'aiceo-kn-modal-anim';
      s.textContent = '@keyframes aiceoKnFadeIn{from{opacity:0}to{opacity:1}}@keyframes aiceoKnSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }

    function close() { overlay.remove(); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.kn-modal-close').addEventListener('click', close);
    overlay.querySelector('.kn-modal-cancel').addEventListener('click', close);
    document.addEventListener('keydown', function escHandler(ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    });

    overlay.querySelector('.kn-modal-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var fd = new FormData(ev.target);
      var data = {
        title: fd.get('title') || '',
        content: fd.get('content') || '',
        kind: fd.get('kind') || 'note'
      };
      if (!data.title.trim()) return;
      close();
      onSubmit(data);
    });

    setTimeout(function () { overlay.querySelector('input[name="title"]').focus(); }, 100);
  }

  async function addNoteManual() {
    showAddNoteModal(async function (data) {
      var r = await api('POST', '/api/knowledge', data);
      if (r && r.pin) init();
    });
  }

  // ─────────── Update sidebar counts
  function updateSidebarCounts(pins) {
    var counts = { all: pins.length, decision: 0, criterion: 0, principle: 0, note: 0 };
    pins.forEach(function (p) {
      var k = p.kind || 'note';
      if (counts[k] !== undefined) counts[k]++;
    });
    Object.keys(counts).forEach(function (k) {
      var el = $('[data-count-kind="' + k + '"]');
      if (el) el.textContent = String(counts[k]);
    });
  }

  function updateSearchPlaceholder(total) {
    var s = $('#kn-search');
    if (!s) return;
    if (total === 0) {
      s.placeholder = 'Aucune entree pour le moment';
      s.disabled = true;
    } else {
      s.placeholder = 'Rechercher dans ' + total + ' entree' + (total > 1 ? 's' : '') + ' ...';
      s.disabled = false;
    }
  }

  function updateFeaturedSubtitle(count) {
    var sub = $('#kn-featured-subtitle');
    if (!sub) return;
    if (count === 0) sub.textContent = '';
    else sub.textContent = count + ' reference' + (count > 1 ? 's' : '') + ' epingle' + (count > 1 ? 'es' : 'e');
  }

  function getFiltered() {
    if (currentFilter === 'all') return allPins;
    return allPins.filter(function (p) { return p.kind === currentFilter; });
  }

  function applyShellLayoutForEmpty(empty) {
    var shell = $('.kn-shell');
    if (!shell) return;
    if (empty) {
      // Quand vide : flex centered (override grid)
      shell.style.display = 'flex';
      shell.style.justifyContent = 'center';
      shell.style.alignItems = 'flex-start';
      shell.style.gridTemplateColumns = 'none';
    } else {
      shell.style.display = '';
      shell.style.justifyContent = '';
      shell.style.alignItems = '';
      shell.style.gridTemplateColumns = '';
    }
  }

  function renderLists() {
    var pinnedList = $('#kn-pinned-list');
    var listEl = $('#kn-list');
    var featuredSection = $('#kn-featured-section');
    var recentSection = $('#kn-recent-section');
    var sidebar = $('#kn-sidebar');
    var totalCount = allPins.length;

    if (totalCount === 0) {
      // EMPTY STATE total
      applyShellLayoutForEmpty(true);
      if (pinnedList) {
        pinnedList.style.display = 'block';
        pinnedList.style.gridTemplateColumns = 'none';
        pinnedList.innerHTML = renderEmpty();
      }
      if (recentSection) recentSection.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
      var featuredHead = featuredSection && featuredSection.querySelector('.kn-featured-head');
      if (featuredHead) featuredHead.style.display = 'none';
      var manualBtn = document.getElementById('aiceo-kn-add-manual');
      if (manualBtn) manualBtn.addEventListener('click', function (e) { e.preventDefault(); addNoteManual(); });
      return;
    }

    // Pas vide : restaure layout normal
    applyShellLayoutForEmpty(false);
    if (sidebar) sidebar.style.display = '';
    if (recentSection) recentSection.style.display = '';
    var featuredHead2 = featuredSection && featuredSection.querySelector('.kn-featured-head');
    if (featuredHead2) featuredHead2.style.display = '';

    var filtered = getFiltered();

    // Epingles : top 6
    if (pinnedList) {
      pinnedList.style.display = 'grid';
      pinnedList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
      var top = filtered.slice(0, 6);
      pinnedList.innerHTML = top.length === 0
        ? '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-3,#888);font-size:13px">Aucune entree dans cette categorie.</div>'
        : top.map(renderPinnedCard).join('');
    }

    // Recent : list ou timeline selon currentView
    if (listEl) {
      if (filtered.length === 0) {
        listEl.innerHTML = '<li style="padding:32px;text-align:center;color:var(--text-3,#888);font-size:13px;list-style:none">Aucune entree.</li>';
      } else if (currentView === 'timeline') {
        listEl.style.listStyle = 'none';
        listEl.style.padding = '8px 0';
        listEl.innerHTML = '<li style="list-style:none">' + renderTimeline(filtered.slice(0, 50)) + '</li>';
      } else {
        listEl.style.listStyle = 'none';
        listEl.style.padding = '0';
        listEl.innerHTML = filtered.slice(0, 50).map(renderRow).join('');
      }
    }
  }

  function bindSidebarFilter() {
    var items = $$('.kn-side-item[data-kind]');
    items.forEach(function (it) {
      it.style.cursor = 'pointer';
      it.style.transition = 'background .15s';
      it.addEventListener('mouseenter', function () { if (!it.classList.contains('is-active')) it.style.background = 'var(--surface-3,#ebe7df)'; });
      it.addEventListener('mouseleave', function () { if (!it.classList.contains('is-active')) it.style.background = 'transparent'; });
      it.addEventListener('click', function () {
        items.forEach(function (i) { i.classList.remove('is-active'); i.style.background = 'transparent'; });
        it.classList.add('is-active');
        it.style.background = 'var(--surface-3,#ebe7df)';
        currentFilter = it.dataset.kind;
        renderLists();
      });
    });
  }

  function bindViewToggle() {
    var btns = $$('.kn-recent .seg-btn[data-view]');
    btns.forEach(function (b) {
      b.dataset.bound = '1';
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        currentView = b.dataset.view;
        renderLists();
      });
    });
  }

  function bindSearch() {
    var s = $('#kn-search');
    if (!s) return;
    s.addEventListener('input', function () {
      var q = s.value.trim().toLowerCase();
      var filtered;
      if (!q) {
        filtered = getFiltered();
      } else {
        filtered = allPins.filter(function (p) {
          var match = (p.title && p.title.toLowerCase().includes(q))
                   || (p.content && p.content.toLowerCase().includes(q));
          if (currentFilter !== 'all') return match && p.kind === currentFilter;
          return match;
        });
      }
      var listEl = $('#kn-list');
      if (listEl) {
        listEl.innerHTML = filtered.length === 0
          ? '<li style="padding:32px;text-align:center;color:var(--text-3,#888);font-size:13px;list-style:none">Aucun resultat.</li>'
          : filtered.slice(0, 50).map(renderRow).join('');
      }
    });
  }

  function bindHeaderAddBtn() {
    var headerBtn = $('header.topbar .btn.primary, .topbar .btn.primary');
    if (headerBtn && !headerBtn.dataset.knBound) {
      headerBtn.dataset.knBound = '1';
      headerBtn.dataset.bound = '1';
      headerBtn.addEventListener('click', addNoteManual);
    }
  }

  async function init() {
    var data = await api('GET', '/api/knowledge');
    allPins = (data && data.pins) || [];

    updateSidebarCounts(allPins);
    updateSearchPlaceholder(allPins.length);
    updateFeaturedSubtitle(allPins.length);
    renderLists();
    bindSidebarFilter();
    bindViewToggle();
    bindSearch();
    bindHeaderAddBtn();

    // Bind archive (delegation sur main)
    var main = $('main, .app-main');
    if (main && !main.dataset.knArchiveBound) {
      main.dataset.knArchiveBound = '1';
      main.addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-pin-archive]');
        if (!btn) return;
        var id = btn.dataset.pinArchive;
        if (!confirm('Archiver cette epingle ?')) return;
        var r = await api('DELETE', '/api/knowledge/' + id);
        if (r && r.ok) init();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
