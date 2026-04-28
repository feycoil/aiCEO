/* cockpit-layout.js — Réorganise le cockpit en grid 1.5fr / 1fr
 * Gauche : hero (greeting + lead + CTAs + cap stratégique en bas)
 * Droite : 4 KPI cards en grille 2x2
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'home') return;

  function relayout() {
    if (document.querySelector('.cockpit-top-grid')) return; // déjà fait

    const main = document.querySelector('main, .app-main');
    if (!main) return;

    const heroCard = main.querySelector('.card.hero');
    if (!heroCard) return;

    // Cibler directement .kpi-row (la vraie classe)
    const kpiRow = main.querySelector('.kpi-row');
    if (!kpiRow) return;

    const kpiCards = Array.from(kpiRow.children);
    if (kpiCards.length === 0) return;

    // 1. Cap stratégique reste à droite du texte (dans hero-grid)
    // (pas de manipulation DOM ici, le CSS se charge du layout)

    // 2. Créer le wrapper .cockpit-top-grid
    const wrapper = document.createElement('div');
    wrapper.className = 'cockpit-top-grid';
    heroCard.parentNode.insertBefore(wrapper, heroCard);
    wrapper.appendChild(heroCard);

    // 3. Créer .kpi-2x2 et y placer les 4 KPI cards
    const kpiBox = document.createElement('div');
    kpiBox.className = 'kpi-2x2';
    kpiCards.forEach(card => kpiBox.appendChild(card));
    wrapper.appendChild(kpiBox);

    // 4. Retirer le conteneur .kpi-row maintenant vide
    if (kpiRow.children.length === 0) {
      kpiRow.remove();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', relayout);
  } else {
    relayout();
  }
  // Re-tenter au cas où des bind-* injecteraient async
  setTimeout(relayout, 200);
  setTimeout(relayout, 600);
})();
