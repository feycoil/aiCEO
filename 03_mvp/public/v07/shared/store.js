// store.js — Atomic Templates · base class Store avec EventEmitter
// Sprint S6.10-bis-LIGHT · ADR v12 (2026-04-28)
//
// Pattern : 1 store par page, source de vérité unique.
// API :
//   class MyStore extends Store {
//     async load() { this.setState({ items: await fetch(...) }); }
//   }
//   const s = new MyStore();
//   s.on('change', (state) => render(state));
//   s.load();

export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this._listeners = new Map(); // event -> Set<fn>
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.emit('change', this.state);
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this._listeners.get(event).delete(fn); // off()
  }

  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(...args); } catch (e) { console.error(`[store:${event}]`, e); }
    }
  }
}

// Helper utilitaire : bind une fonction render au state du store
export function bindRender(store, renderFn) {
  store.on('change', renderFn);
  if (store.state) renderFn(store.state);
}
