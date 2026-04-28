/* bind-arbitrage.js v3 — workflow matin */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  async function tryJson(url, opts){
    try {
      const r = await fetch(url, Object.assign({headers:{Accept:'application/json'}}, opts||{}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch(e) { return null; }
  }

  async function ensureSession() {
    let data = await tryJson('/api/arbitrage/today');
    if (!data || data.empty) {
      // Démarrer une nouvelle session
      data = await tryJson('/api/arbitrage/start', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({})
      });
    }
    return data;
  }

  function updateColCounts(proposals) {
    if (!proposals) return;
    const cols = $$('.board-col');
    cols.forEach(col => {
      const name = (col.querySelector('.board-col-name') || {}).textContent || '';
      const countEl = col.querySelector('.board-col-count');
      if (!countEl) return;
      const lc = name.toLowerCase();
      let count = 0;
      if (lc.includes('faire'))         count = (proposals.faire || []).length;
      else if (lc.includes('délég'))    count = (proposals.deleguer || []).length;
      else if (lc.includes('reporter')) count = (proposals.reporter || []).length;
      else if (lc.includes('gel'))      count = 0;
      countEl.textContent = count;
    });
  }

  function bindTrancherBtn(session) {
    const btn = $('#trancher-btn');
    if (!btn) return;
    btn.disabled = false;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Validation…';
      const decisions = (session && session.proposals) || { faire: [], deleguer: [], reporter: [] };
      const r = await tryJson('/api/arbitrage/commit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ decisions })
      });
      if (r && window.AICEOShell) {
        window.AICEOShell.showToast('Arbitrage validé. Bonne journée 🌅', 'success');
        setTimeout(() => { window.location.href = '/v06/index.html'; }, 1200);
      } else {
        btn.disabled = false;
        btn.textContent = 'Trancher';
      }
    });
  }

  async function init() {
    const data = await ensureSession();
    if (!data || !data.session) return;
    updateColCounts(data.session.proposals);
    bindTrancherBtn(data.session);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
