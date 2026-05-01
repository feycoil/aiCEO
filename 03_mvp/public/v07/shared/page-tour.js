// page-tour.js — Tour pedagogique 1ere utilisation par page (S6.33)
// Pattern extrait du tour Triage (S6.24.4), generalise.
//
// Usage :
//   import { maybeShowTour } from '../shared/page-tour.js';
//   maybeShowTour('decisions', [
//     { title: 'Recommander avec Claude', text: 'Cliquez ✦ sur une décision ouverte.' },
//     { title: 'Bouton Trancher', text: 'Choisissez A/B/C dans la modal.' },
//     { title: 'Apprentissage', text: 'Vos verdicts entraînent Claude.' }
//   ]);
//
// localStorage flag : aiCEO.tourDone.<key>
// dismiss permanent au 1er clic "Compris".

export function maybeShowTour(pageKey, steps, opts) {
  if (!pageKey || !Array.isArray(steps) || !steps.length) return;
  const flagKey = 'aiCEO.tourDone.' + pageKey;
  try {
    if (localStorage.getItem(flagKey) === '1') return;
  } catch (e) { return; }
  if (opts && opts.delay) {
    setTimeout(() => showTour(pageKey, steps, flagKey), opts.delay);
  } else {
    showTour(pageKey, steps, flagKey);
  }
}

function showTour(pageKey, steps, flagKey) {
  const overlay = document.createElement('div');
  overlay.className = 'page-tour-overlay';
  overlay.dataset.tourKey = pageKey;
  let html = '<div class="page-tour-modal">';
  html += '<header class="page-tour-head"><span class="page-tour-eyebrow">&#x2726; PREMIERE UTILISATION</span>';
  html += '<button class="page-tour-skip" data-action="tour-skip">Passer</button></header>';
  html += '<div class="page-tour-body">';
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    html += '<div class="page-tour-step"><div class="page-tour-step-num">' + (i + 1) + '</div>';
    html += '<div><h4>' + escapeHtml(s.title) + '</h4>';
    html += '<p>' + escapeHtml(s.text) + '</p></div></div>';
  }
  html += '</div>';
  html += '<footer class="page-tour-foot">';
  html += '<button class="page-tour-cta" data-action="tour-done">Compris, c est parti !</button>';
  html += '</footer></div>';
  overlay.innerHTML = html;
  overlay.addEventListener('click', function (ev) {
    const a = ev.target.dataset.action;
    if (a === 'tour-done' || a === 'tour-skip' || ev.target === overlay) {
      try { localStorage.setItem(flagKey, '1'); } catch (e) {}
      overlay.remove();
    }
  });
  document.body.appendChild(overlay);
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
