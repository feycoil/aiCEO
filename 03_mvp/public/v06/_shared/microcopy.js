/* microcopy.js — Vocabulaire harmonisé + structure i18n future */
(function () {
  'use strict';
  // Mapping vocabulaire incohérent → cible
  const REPLACE_MAP = [
    // "Houses" → "Maisons" (déjà français, mais si EN)
    [/\bHouses\b/g, 'Maisons'],
    // Forcer "Maisons" partout (était "groupes" en SQL mais affichage = Maisons)
    // Action item label : "Tâches" cohérent partout
    [/\bAction\s*item/gi, 'Tâche']
  ];

  function applyMicrocopy() {
    // Walker DOM textNodes + attribute aria-label
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walker.nextNode()) {
      let txt = node.nodeValue;
      if (!txt || !txt.trim()) continue;
      let modified = false;
      for (const [re, rep] of REPLACE_MAP) {
        if (re.test(txt)) {
          txt = txt.replace(re, rep);
          modified = true;
        }
      }
      if (modified) node.nodeValue = txt;
    }
  }

  // Préparation i18n : si data-i18n="key" → futur lookup dans dictionnaire
  // Pour MVP, on garde le texte en français, mais on tague les clés
  function prepareI18n() {
    // Tag automatique des labels stables (à compléter manuellement V1)
    const I18N_TAGS = {
      'Cockpit': 'nav.cockpit',
      'Arbitrage': 'nav.arbitrage',
      'Soirée': 'nav.evening',
      'Réglages': 'nav.settings',
      'Annuler': 'btn.cancel',
      'Créer': 'btn.create',
      'Enregistrer': 'btn.save',
      'Supprimer': 'btn.delete',
      'Confirmer': 'btn.confirm'
    };
    document.querySelectorAll('button, a, span, label').forEach(el => {
      const txt = (el.textContent || '').trim();
      if (I18N_TAGS[txt] && !el.dataset.i18n) {
        el.dataset.i18n = I18N_TAGS[txt];
      }
    });
  }

  function init() {
    applyMicrocopy();
    prepareI18n();
    new MutationObserver(() => {
      // Re-pass après mutations (bind-X.js render)
      applyMicrocopy();
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
