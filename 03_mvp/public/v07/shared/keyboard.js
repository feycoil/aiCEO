// keyboard.js — Raccourcis clavier universels (S6.33)
// Pattern : chaque page enregistre ses raccourcis via registerShortcuts(map).
// Aide globale : ? affiche overlay des raccourcis actifs.
// Esc ferme l'aide. Les inputs/textareas sont ignores.

const registry = new Map(); // key -> { handler, label, scope }
let helpOpen = false;
let installed = false;

export function registerShortcuts(shortcuts) {
  // shortcuts : array of { keys: 'a' | ['a', 'A'], label, scope, handler }
  for (const s of shortcuts) {
    const keys = Array.isArray(s.keys) ? s.keys : [s.keys];
    for (const k of keys) {
      registry.set(k, { handler: s.handler, label: s.label, scope: s.scope || 'global' });
    }
  }
  installHandler();
}

export function clearShortcuts() {
  registry.clear();
}

function installHandler() {
  if (installed) return;
  installed = true;
  document.addEventListener('keydown', onKey);
}

function onKey(ev) {
  // Ignore si focus dans input/textarea/contenteditable (sauf Esc/?)
  const tag = (ev.target.tagName || '').toLowerCase();
  const isInput = tag === 'input' || tag === 'textarea' || ev.target.isContentEditable;
  if (helpOpen) {
    if (ev.key === 'Escape') { closeHelp(); ev.preventDefault(); }
    return;
  }
  if (isInput) {
    // Permet Esc pour quitter input
    if (ev.key === 'Escape') ev.target.blur();
    return;
  }
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  // ? ou H pour aide globale
  if (ev.key === '?' || ev.key === 'h' || ev.key === 'H') {
    showHelp();
    ev.preventDefault();
    return;
  }
  const entry = registry.get(ev.key);
  if (entry && typeof entry.handler === 'function') {
    entry.handler(ev);
    ev.preventDefault();
  }
}

function showHelp() {
  if (helpOpen) return;
  helpOpen = true;
  const overlay = document.createElement('div');
  overlay.dataset.region = 'kb-help';
  overlay.className = 'kb-help-overlay';
  // Group by scope
  const byScope = {};
  registry.forEach((v, k) => {
    if (!byScope[v.scope]) byScope[v.scope] = [];
    // Don't double-list same handler key variants : keep first label per key family
    if (!byScope[v.scope].some(e => e.label === v.label)) {
      byScope[v.scope].push({ key: k, label: v.label });
    }
  });
  let html = '<div class="kb-help-modal">';
  html += '<header class="kb-help-head"><h3>&#x2328; Raccourcis clavier</h3>';
  html += '<button class="kb-help-close" data-action="kb-close">&times;</button></header>';
  html += '<p class="kb-help-intro">Une frappe = une action. Inputs/textareas ignorent les raccourcis.</p>';
  for (const scope of Object.keys(byScope)) {
    html += '<div class="kb-help-scope"><h4>' + escapeHtml(scope) + '</h4><ul>';
    for (const e of byScope[scope]) {
      html += '<li><kbd>' + escapeHtml(e.key) + '</kbd><span>' + escapeHtml(e.label) + '</span></li>';
    }
    html += '</ul></div>';
  }
  html += '<div class="kb-help-scope"><h4>Aide</h4><ul>';
  html += '<li><kbd>?</kbd><span>Afficher cette aide</span></li>';
  html += '<li><kbd>Esc</kbd><span>Fermer</span></li>';
  html += '</ul></div>';
  html += '</div>';
  overlay.innerHTML = html;
  overlay.addEventListener('click', function (ev) {
    if (ev.target === overlay || ev.target.dataset.action === 'kb-close') closeHelp();
  });
  document.body.appendChild(overlay);
}

function closeHelp() {
  helpOpen = false;
  const el = document.querySelector('[data-region="kb-help"]');
  if (el) el.remove();
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
