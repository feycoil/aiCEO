// aide-store.js - page statique, pas de fetch API
// Ce store existe pour respecter le pattern Atomic Templates
// (chaque page v07 a son store, meme si vide)
console.info('[aide] page Aide v07 - contenu statique evolutif');

// Smooth scroll vers les sections du sommaire
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.aide-toc-item[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Mise a jour URL sans rechargement
        history.pushState(null, '', href);
      }
    });
  });
});
