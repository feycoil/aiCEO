// thinking-overlay.js — Animation thinking standardisee LLM (S6.30)
// Pattern extrait de arbitrage-store-v2.js (showThinkingOverlay), generalise.
//
// Usage :
//   import { showThinking, hideThinking } from '../shared/thinking-overlay.js';
//   const handle = showThinking({ host: '[data-region="my-host"]', messages: [...], skeleton: 3 });
//   // ... apres le fetch LLM
//   hideThinking(handle);
//
// messages : tableau de strings rotatifs (toutes les 1.5s), 8 par defaut
// skeleton : nombre de skeleton-cards a afficher (3 par defaut)

const DEFAULT_MESSAGES = [
  'Claude lit le contexte...',
  'Identifie les patterns...',
  'Filtre le bruit...',
  'Synthese chaque element...',
  'Detecte les priorites...',
  'Genere les recommandations...',
  'Finalise la sortie...',
  'Encore un instant...'
];

export function showThinking(opts = {}) {
  const target = typeof opts.host === 'string' ? document.querySelector(opts.host) : opts.host;
  if (!target) return null;
  const messages = Array.isArray(opts.messages) && opts.messages.length ? opts.messages : DEFAULT_MESSAGES;
  const skeletonCount = typeof opts.skeleton === 'number' ? opts.skeleton : 3;

  // Trouve ou cree l'overlay
  let host = target.parentNode.querySelector('[data-region="thinking-overlay"]');
  if (!host) {
    host = document.createElement('div');
    host.dataset.region = 'thinking-overlay';
    host.className = 'thinking-overlay';
    target.parentNode.insertBefore(host, target);
  }
  host.innerHTML = renderOverlayHtml(messages[0], skeletonCount);
  host.hidden = false;

  // Rotation messages toutes les 1.5s
  let i = 0;
  const msgEl = host.querySelector('[data-region="thinking-msg"]');
  const interval = setInterval(() => {
    i = (i + 1) % messages.length;
    if (msgEl) msgEl.textContent = messages[i];
  }, 1500);

  return { host, interval };
}

export function hideThinking(handle) {
  if (!handle) return;
  if (handle.interval) clearInterval(handle.interval);
  if (handle.host) handle.host.hidden = true;
}

function renderOverlayHtml(msg, count) {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push('<div class="skeleton-card"><div class="skeleton-line w-30"></div><div class="skeleton-line w-70"></div><div class="skeleton-line w-90"></div></div>');
  }
  return ''
    + '<div class="thinking-pulse">'
    + '<span class="thinking-spinner"></span>'
    + '<span data-region="thinking-msg">' + escapeHtml(msg) + '</span>'
    + '</div>'
    + '<div class="skeleton-grid">' + skeletons.join('') + '</div>';
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
