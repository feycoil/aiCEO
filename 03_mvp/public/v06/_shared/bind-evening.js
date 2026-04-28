/* bind-evening.js v3 — workflow soir */
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

  function readUiState() {
    // Détecter humeur sélectionnée (data-mood active)
    const moodEl = $('[data-mood].is-selected, [data-mood].is-active');
    const humeurMap = { calm: 'tres-bien', good: 'bien', neutre: 'neutre', tendu: 'tendu', dur: 'difficile' };
    const humeur = moodEl ? (humeurMap[moodEl.dataset.mood] || moodEl.dataset.mood || 'neutre') : 'neutre';
    // Énergie (slider ou data-energy)
    const eEl = $('input[name="energie"], [data-energy].is-selected');
    let energie = 3;
    if (eEl) {
      energie = Number(eEl.value || eEl.dataset.energy || 3);
      if (isNaN(energie) || energie < 1 || energie > 5) energie = 3;
    }
    // Bilan (textareas)
    const bilan = {
      fait:     ($('textarea[name="fait"]') || {}).value || '',
      partiel:  ($('textarea[name="partiel"]') || {}).value || '',
      pas_fait: ($('textarea[name="pas_fait"]') || {}).value || ''
    };
    const tomorrow_prep = ($('textarea[name="tomorrow"]') || {}).value || '';
    return { humeur, energie, bilan, tomorrow_prep };
  }

  async function init() {
    // Charger streak réel
    const data = await tryJson('/api/evening/today');
    if (data && data.streak) {
      const streakEls = $$('[data-bind="streak"], .streak-value, .streak-num');
      streakEls.forEach(el => el.textContent = data.streak.current_days || 0);
    }
    // Bouton "Terminer la boucle" / Finish
    const btn = $('#finish-btn');
    if (btn) {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        const orig = btn.textContent;
        btn.textContent = 'Sauvegarde…';
        const state = readUiState();
        const r = await tryJson('/api/evening/commit', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(state)
        });
        if (r) {
          if (window.AICEOShell) window.AICEOShell.showToast('Boucle du soir enregistrée 🌙', 'success');
          setTimeout(() => { window.location.href = '/v06/index.html'; }, 1200);
        } else {
          btn.disabled = false;
          btn.textContent = orig;
          if (window.AICEOShell) window.AICEOShell.showToast('Erreur lors de la sauvegarde', 'error');
        }
      });
    }
    // Sélecteur humeur (data-mood) — toggle is-selected
    $$('[data-mood]').forEach(el => {
      el.addEventListener('click', () => {
        $$('[data-mood]').forEach(o => o.classList.remove('is-selected'));
        el.classList.add('is-selected');
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
