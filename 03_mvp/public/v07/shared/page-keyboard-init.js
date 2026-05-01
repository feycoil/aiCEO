// page-keyboard-init.js — Auto-wire raccourcis + tour par page (Phase 1E backlog)
//
// Detecte body[data-route] et enregistre raccourcis + tour adaptes.
// Mounte au DOMContentLoaded.

import { registerShortcuts } from './keyboard.js';
import { maybeShowTour } from './page-tour.js';
import { logInteraction } from './interaction-feedback.js';

const SHORTCUTS_BY_ROUTE = {
  decisions: [
    { keys: ['n', 'N'], scope: 'Decisions', label: 'Nouvelle decision', handler: clickAction('new') },
    { keys: ['f', 'F'], scope: 'Decisions', label: 'Filtre statut', handler: focusFilter },
    { keys: '/', scope: 'Decisions', label: 'Recherche', handler: focusSearch }
  ],
  projets: [
    { keys: ['n', 'N'], scope: 'Projets', label: 'Nouveau projet', handler: clickAction('new') },
    { keys: ['f', 'F'], scope: 'Projets', label: 'Filtre statut', handler: clickFirstSegBtn },
    { keys: '/', scope: 'Projets', label: 'Recherche', handler: focusSearch }
  ],
  revues: [
    { keys: ['a', 'A'], scope: 'Revues', label: 'Auto-draft Claude', handler: clickAction('auto-draft') },
    { keys: ['s', 'S'], scope: 'Revues', label: 'Suggerer 3 Big Rocks', handler: clickAction('suggest-rocks') },
    { keys: ['b', 'B'], scope: 'Revues', label: 'Sauvegarder bilan', handler: clickAction('save-bilan') },
    { keys: ['r', 'R'], scope: 'Revues', label: 'Sauvegarder Big Rocks', handler: clickAction('save-rocks') }
  ],
  assistant: [
    { keys: ['n', 'N'], scope: 'Assistant', label: 'Nouveau fil', handler: clickAction('new-conv') },
    { keys: '/', scope: 'Assistant', label: 'Focus composer', handler: focusComposer }
  ],
  connaissance: [
    { keys: ['n', 'N'], scope: 'Connaissance', label: 'Nouveau pin', handler: clickAction('new') },
    { keys: '/', scope: 'Connaissance', label: 'Recherche', handler: () => focusSelector('[data-region="kn-search"]') }
  ],
  coaching: [
    { keys: ['r', 'R'], scope: 'Coaching', label: 'Rafraichir signaux', handler: () => location.reload() }
  ],
  trajectoire: [
    { keys: '7', scope: 'Trajectoire', label: 'Periode 7j', handler: clickPeriod('7') },
    { keys: '3', scope: 'Trajectoire', label: 'Periode 30j', handler: clickPeriod('30') },
    { keys: '9', scope: 'Trajectoire', label: 'Periode 90j', handler: clickPeriod('90') },
    { keys: ['m', 'M'], scope: 'Trajectoire', label: 'Periode 6 mois', handler: clickPeriod('180') },
    { keys: ['y', 'Y'], scope: 'Trajectoire', label: 'Periode 1 an', handler: clickPeriod('365') },
    { keys: ['g', 'G'], scope: 'Trajectoire', label: 'Mode Graphe', handler: clickMode('graphe') },
    { keys: ['t', 'T'], scope: 'Trajectoire', label: 'Mode Timeline', handler: clickMode('timeline') }
  ]
};

const TOURS_BY_ROUTE = {
  decisions: [
    { title: 'Recommander avec Claude', text: 'Cliquez le bouton ✦ Recommander sur une decision ouverte. Claude propose A/B/C avec rationale.' },
    { title: 'KPI tones', text: 'Tranchees=vert, En attente=ambre, Infirmees=rouge, A revisiter=violet. Scan rapide de l etat du portefeuille.' },
    { title: 'Raccourcis', text: 'Touche N pour nouvelle decision, F pour filtres, / pour recherche, ? pour aide complete.' }
  ],
  projets: [
    { title: 'KPI-row + filtres seg', text: 'Vue immediate : combien de projets en alerte, a surveiller, sains. Filtre par clic sur un segment.' },
    { title: 'Auto-create depuis Triage', text: 'Pendant le Triage matinal, kind=project + Faire cree le projet et y rattache l email.' },
    { title: 'Raccourcis', text: 'N pour nouveau projet, F pour filtre statut, / pour recherche.' }
  ],
  revues: [
    { title: 'Auto-draft Claude', text: 'Touche A : Claude redige le bilan en analysant decisions tranchees + projets de la semaine.' },
    { title: 'Suggerer 3 Big Rocks', text: 'Touche S : 3 Big Rocks suggeres depuis projets en alerte + decisions tranchees + tasks P0.' },
    { title: 'Rituel hebdo 30 min', text: '3 sections : Bilan ecoule + 3 Big Rocks semaine prochaine + Historique. B/R pour sauver.' }
  ],
  assistant: [
    { title: 'Memoire inter-fils', text: 'Claude voit votre snapshot DB a chaque message : decisions ouvertes, Big Rocks, projets actifs.' },
    { title: 'Markdown rendu', text: 'Les reponses Claude sont rendues en markdown (gras/italique/code/listes/headings).' },
    { title: 'Raccourcis', text: 'N pour nouveau fil, / pour focus composer, Ctrl+Enter pour envoyer.' }
  ],
  connaissance: [
    { title: 'Base evolutive', text: 'Epinglez decisions tranchees, criteres reutilisables, regles ou notes. Evite de re-decider demain.' },
    { title: 'Search + filtres', text: 'Touche / pour rechercher dans titres + contenus. Filtres par type via les onglets.' },
    { title: 'KPIs + voix exec', text: 'KPI-row Total/Decisions/Criteres/Regles. Toasts en bas a droite (plus d alert natif).' }
  ],
  coaching: [
    { title: 'Signaux faibles LLM', text: 'Bordure violette gauche = signal genere par Claude (vs rule-based). Niveaux : alerte/warn/info.' },
    { title: '4 questions hebdo', text: 'Reflechissez en mode Assistant (lien direct) ou epinglez les insights forts.' },
    { title: 'Touche R', text: 'R rafraichit les signaux. ? affiche tous les raccourcis disponibles.' }
  ],
  trajectoire: [
    { title: 'Recit Claude', text: 'En tete de page, recit narratif 3-5 phrases sur la periode selectionnee (decisions/Big Rocks/projets clos).' },
    { title: 'Periodes au clavier', text: '7=7j, 3=30j, 9=90j, M=6mois, Y=1an. Switch instantane sans toucher la souris.' },
    { title: 'Modes', text: 'T=Timeline (par stream), G=Graphe (cluster). Click marker = modal-detail enrichi.' }
  ]
};

// Helpers
function clickAction(actionName) {
  return () => {
    const btn = document.querySelector('[data-action="' + actionName + '"]');
    if (btn) {
      btn.click();
      logInteraction({ kind: 'keyboard', action: 'shortcut_' + actionName });
    }
  };
}

function clickPeriod(days) {
  return () => {
    const btn = document.querySelector('[data-period="' + days + '"]');
    if (btn) { btn.click(); logInteraction({ kind: 'keyboard', action: 'period_' + days }); }
  };
}

function clickMode(mode) {
  return () => {
    const btn = document.querySelector('[data-mode="' + mode + '"]');
    if (btn) { btn.click(); logInteraction({ kind: 'keyboard', action: 'mode_' + mode }); }
  };
}

function focusFilter() {
  const f = document.querySelector('.seg-btn, [data-component="seg-filter"] button');
  if (f) f.focus();
}

function clickFirstSegBtn() {
  const f = document.querySelector('.seg-btn');
  if (f) f.focus();
}

function focusSearch() {
  const s = document.querySelector('input[type="search"], input[placeholder*="hercher"], input[placeholder*="herche"]');
  if (s) s.focus();
}

function focusComposer() {
  const c = document.querySelector('[data-region="as-composer"] textarea, .as-composer textarea, textarea[placeholder*="essage"]');
  if (c) c.focus();
}

function focusSelector(sel) {
  const el = document.querySelector(sel);
  if (el) el.focus();
}

// Init
function init() {
  const route = (document.body.dataset.route || '').toLowerCase();
  const shortcuts = SHORTCUTS_BY_ROUTE[route];
  if (shortcuts) registerShortcuts(shortcuts);
  const tour = TOURS_BY_ROUTE[route];
  if (tour) {
    setTimeout(() => maybeShowTour(route, tour, { delay: 1500 }), 1500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
