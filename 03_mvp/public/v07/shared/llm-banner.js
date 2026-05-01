// llm-banner.js — Banner LLM live/degrade universel (S6.30)
// Pattern extrait de coaching-store.js, generalise pour toutes les pages.
//
// Usage : import { mountLlmBanner } from '../shared/llm-banner.js';
//         mountLlmBanner('[data-region="page-llm-banner"]');
//
// Le banner s'affiche au-dessus de la page principale et indique :
//  - vert "Claude live" si /api/assistant/llm-status retourne available=true
//  - ambre "Mode degrade" sinon, avec lien Reglages > Coaching IA

export async function mountLlmBanner(selector, opts = {}) {
  const host = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!host) return;
  const ctx = opts.context || 'cette page';
  try {
    const r = await fetch('/api/assistant/llm-status');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const live = !!data.available;
    host.innerHTML = renderBannerHtml(live, ctx, data.message || '');
    host.hidden = false;
  } catch (e) {
    host.innerHTML = renderBannerHtml(false, ctx, 'LLM injoignable.');
    host.hidden = false;
  }
}

function renderBannerHtml(live, ctx, msg) {
  if (live) {
    return ''
      + '<div class="llm-banner is-live">'
      + '<span class="llm-banner-dot"></span>'
      + '<span class="llm-banner-label"><strong>Claude live</strong> sur ' + escapeHtml(ctx) + '</span>'
      + '<span class="llm-banner-meta">Sonnet 4.6 &middot; mode contextuel</span>'
      + '</div>';
  }
  return ''
    + '<div class="llm-banner is-degraded">'
    + '<span class="llm-banner-dot"></span>'
    + '<span class="llm-banner-label"><strong>Mode degrade</strong> &mdash; suggestions rule-based</span>'
    + '<a class="llm-banner-link" href="settings.html#coaching">Activer Claude &rarr;</a>'
    + '</div>';
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
