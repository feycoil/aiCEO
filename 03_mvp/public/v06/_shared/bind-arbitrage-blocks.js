/* bind-arbitrage-blocks.js v1 (S6.8.3) — Macro-scenarios pliables sur la page arbitrage
 * Affiche les propositions email groupees par inferred_project.
 * Boutons : "Accepter le bloc" (cree tout en transaction) + "Detailler" (expand)
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'arbitrage') return;

  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  async function tryJson(url, opts) {
    try {
      var r = await fetch(url, Object.assign({ headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }, opts || {}));
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function renderBlock(block) {
    var counts = block.kinds || {};
    var kindLabels = [];
    if (counts.task) kindLabels.push(counts.task + ' tache' + (counts.task > 1 ? 's' : ''));
    if (counts.decision) kindLabels.push(counts.decision + ' decision' + (counts.decision > 1 ? 's' : ''));
    if (counts.project) kindLabels.push(counts.project + ' projet' + (counts.project > 1 ? 's' : ''));
    var summary = kindLabels.join(' · ');
    return '<article class="aiceo-arb-block" data-block-project="' + escHtml(block.project) + '" style="background:var(--surface-2,#fff);border:1px solid var(--border,#eee);border-radius:14px;margin-bottom:12px;overflow:hidden;transition:box-shadow .15s">' +
      '<header style="display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer" data-block-toggle="' + escHtml(block.project) + '">' +
        '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:var(--violet-50,#ece7f0);color:var(--violet-800,#463a54);font-weight:700;font-size:13px">' + (block.count) + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:600;color:var(--text,#111)">' + escHtml(block.project) + '</div>' +
          '<div style="font-size:11px;color:var(--text-3,#888);margin-top:2px">' + summary + ' &middot; score moyen ' + block.avg_score + '</div>' +
        '</div>' +
        '<button type="button" class="block-accept-all" data-bound="1" data-block-accept="' + escHtml(block.project) + '" style="padding:6px 14px;border-radius:7px;background:var(--text,#111);color:#fff;border:0;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s" onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'">Accepter le bloc</button>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="block-chevron" style="color:var(--text-3,#888);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</header>' +
      '<div class="block-detail" data-block-detail="' + escHtml(block.project) + '" style="display:none;border-top:1px solid var(--border,#f0eee9);padding:12px 18px">' +
        block.proposals.map(function (p) {
          var kindBg = p.kind === 'decision' ? 'var(--rose-50,#fde6e3)' : p.kind === 'project' ? 'var(--emerald-50,#d6f3e6)' : 'var(--surface-3,#ebe7df)';
          var kindFg = p.kind === 'decision' ? 'var(--rose-700,#9c2920)' : p.kind === 'project' ? 'var(--emerald-700,#115e3c)' : 'var(--text-2,#555)';
          return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border,#f5f3ee);font-size:13px" data-prop-id="' + escHtml(p.id) + '">' +
            '<span style="background:' + kindBg + ';color:' + kindFg + ';font-size:9px;font-weight:700;padding:2px 6px;border-radius:99px;text-transform:uppercase;letter-spacing:.05em;flex-shrink:0">' + p.kind + '</span>' +
            '<span style="flex:1;min-width:0;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(p.title) + '</span>' +
            '<span style="font-size:11px;color:var(--text-3,#888);flex-shrink:0">' + escHtml(p.from) + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</article>';
  }

  async function acceptBlock(projectSlug, allBlocks) {
    var block = allBlocks.find(function (b) { return b.project === projectSlug; });
    if (!block) return;
    if (!confirm('Accepter le bloc "' + projectSlug + '" ? ' + block.count + ' element(s) seront crees (taches/decisions/projets).')) return;
    var ok = 0, fail = 0;
    for (var i = 0; i < block.proposals.length; i++) {
      var p = block.proposals[i];
      var endpoint = p.kind === 'project' ? '/api/projects' :
                    p.kind === 'decision' ? '/api/decisions' : '/api/tasks';
      var payload = p.kind === 'project' ? { name: p.title, description: p.excerpt } :
                   p.kind === 'decision' ? { title: p.title, context: p.excerpt } :
                   { title: p.title, description: p.excerpt, priority: p.proposed_priority || 'P1' };
      try {
        var r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (r.ok) ok++; else fail++;
      } catch (e) { fail++; }
    }
    var blockEl = document.querySelector('[data-block-project="' + projectSlug + '"]');
    if (blockEl) blockEl.style.opacity = '0.5';
    if (window.AICEOShell) window.AICEOShell.showToast(ok + ' acceptes' + (fail ? ' (' + fail + ' echecs)' : ''), 'success');
  }

  async function init() {
    var data = await tryJson('/api/arbitrage/analyze-emails-grouped', { method: 'POST' });
    if (!data || !data.blocks) return;
    if (data.blocks.length === 0) return;
    // Inject avant la file existante
    var main = document.querySelector('main, .app-main');
    if (!main) return;
    var section = document.createElement('section');
    section.className = 'aiceo-arb-blocks-section';
    section.style.cssText = 'padding:20px 0';
    section.innerHTML = '<header style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:16px"><div><h2 style="margin:0;font-size:16px;font-weight:600;color:var(--text,#111)">Macro-scenarios detectes</h2><p style="margin:2px 0 0;font-size:12px;color:var(--text-3,#888)">' + data.total_blocks + ' projet(s) groupe(s) &middot; ' + data.total_orphans + ' orphelin(s) en file simple ci-dessous</p></div></header>' +
      data.blocks.map(renderBlock).join('');
    // Insertion : avant la queue existante (au top du main)
    main.insertBefore(section, main.firstChild);

    // Bind toggle expand
    section.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-block-toggle]');
      var accept = e.target.closest('[data-block-accept]');
      if (accept) {
        e.stopPropagation();
        acceptBlock(accept.dataset.blockAccept, data.blocks);
        return;
      }
      if (toggle) {
        var slug = toggle.dataset.blockToggle;
        var detail = section.querySelector('[data-block-detail="' + slug + '"]');
        var chevron = toggle.querySelector('.block-chevron');
        if (detail) {
          var isOpen = detail.style.display !== 'none';
          detail.style.display = isOpen ? 'none' : 'block';
          if (chevron) chevron.style.transform = isOpen ? 'rotate(0)' : 'rotate(180deg)';
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
