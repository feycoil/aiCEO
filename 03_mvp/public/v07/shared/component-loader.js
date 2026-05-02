// component-loader.js — Atomic Templates · instancie data-component au load
// Sprint S6.10-bis-LIGHT · ADR v12 (2026-04-28)
//
// Pattern : chaque <div data-component="X" data-props='{...}'> au load
// → fetch components/X/X.html (template) + import components/X/X.js (logique)
// → injecte template + appelle module.default.mount(el, props)
//
// Cache template HTML pour éviter N fetches par composant.

const tplCache = new Map();
const modCache = new Map();

async function fetchTemplate(name) {
  if (tplCache.has(name)) return tplCache.get(name);
  const html = await fetch(`../components/${name}/${name}.html`).then(r => {
    if (!r.ok) throw new Error(`template ${name}.html: HTTP ${r.status}`);
    return r.text();
  });
  tplCache.set(name, html);
  return html;
}

async function importModule(name) {
  if (modCache.has(name)) return modCache.get(name);
  const mod = await import(`../components/${name}/${name}.js`);
  modCache.set(name, mod);
  return mod;
}

export class ComponentLoader {
  static async load(root = document) {
    const els = root.querySelectorAll('[data-component]:not([data-mounted])');
    const tasks = [];
    for (const el of els) {
      tasks.push(this.mountOne(el));
    }
    await Promise.all(tasks);
  }

  static async mountOne(el) {
    const name = el.dataset.component;
    if (!name) return;
    let props = {};
    if (el.dataset.props) {
      try { props = JSON.parse(el.dataset.props); }
      catch (e) { console.error(`[loader:${name}] data-props JSON invalide`, e); }
    }
    try {
      const [html, mod] = await Promise.all([fetchTemplate(name), importModule(name)]);
      el.innerHTML = html;
      el.dataset.mounted = 'true';
      if (mod.default && typeof mod.default.mount === 'function') {
        mod.default.mount(el, props);
      }
    } catch (e) {
      console.error(`[loader:${name}] mount failed`, e);
      el.innerHTML = `<div style="color:#c14a4a;padding:8px;font-family:monospace;font-size:12px;">[component error: ${name}]</div>`;
    }
  }

  // Re-mount d'une zone (utile après store.setState() qui injecte du HTML)
  static async refresh(region) {
    if (typeof region === 'string') region = document.querySelector(region);
    if (!region) return;
    await this.load(region);
  }
}

// === S6.43 : Onboarding gate global (toutes pages v07) ===
// Si DB vide ET pas d'onboarding completed, redirect vers onboarding.html
// Ne se declenche pas sur la page d'onboarding elle-meme ni sur axes.html/aide.html (utiles meme avant onboarding).
async function onboardingGate() {
  if (typeof window === 'undefined') return;
  const route = document.body && document.body.dataset && document.body.dataset.route;
  // Pages exemptees du gate (onboarding lui-meme, aide, axes peuvent etre visites sans onboarding)
  const EXEMPT = ['onboarding', 'aide', 'axes'];
  if (route && EXEMPT.includes(route)) return;
  try {
    const [prefRes, healthRes] = await Promise.all([
      fetch('/api/preferences', { cache: 'no-store' }),
      fetch('/api/health', { cache: 'no-store' })
    ]);
    let needsOnboarding = false;
    if (prefRes.ok) {
      const data = await prefRes.json();
      const prefs = (data && data.preferences) || {};
      if (!prefs['user.firstName'] && !prefs['onboarding.completed']) needsOnboarding = true;
    }
    if (healthRes.ok) {
      const h = await healthRes.json();
      const c = (h && h.counts) || {};
      const allEmpty = (c.tasks || 0) === 0 && (c.projects || 0) === 0 && (c.decisions || 0) === 0 && (c.contacts || 0) === 0 && (c.conversations || 0) === 0;
      if (allEmpty && !needsOnboarding) {
        // DB vide mais firstName encore set : ne pas forcer mais laisser passer
        // (cas rare apres wipe partiel)
      } else if (allEmpty) {
        needsOnboarding = true;
      }
    }
    if (needsOnboarding) {
      // Eviter boucle si onboarding rate (page deja loaded)
      if (!window.location.pathname.endsWith('/onboarding.html')) {
        console.info('[onboarding-gate] DB vide ou onboarding incomplet, redirect vers onboarding');
        window.location.href = window.location.pathname.replace(/[^/]*$/, 'onboarding.html');
      }
    }
  } catch (e) { /* silencieux : ne pas bloquer le load si l'API ne repond pas */ }
}

// Auto-init au DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      onboardingGate();  // S6.43 : check avant le load des composants
      ComponentLoader.load();
    });
  } else {
    onboardingGate();
    ComponentLoader.load();
  }
}
