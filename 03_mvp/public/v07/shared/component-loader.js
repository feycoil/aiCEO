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

// Auto-init au DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ComponentLoader.load());
  } else {
    ComponentLoader.load();
  }
}
