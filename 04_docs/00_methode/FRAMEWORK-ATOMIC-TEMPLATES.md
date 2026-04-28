# Framework Atomic Templates — frontend aiCEO

> **Note de cadrage technique** · 28/04/2026
> **À implémenter en S6.10-bis** (cf. `04_docs/_sprints/S6.10-bis/`)
> **Owner** : agent Claude (subagent `dev-frontend`)

---

## 1. Mission

Remplacer le frontend v06 actuel (3 couches qui se télescopent) par un framework léger sans dépendances tierces où :
- **chaque page = squelette vierge** (60 lignes HTML)
- **chaque composant est atomique** et réutilisable
- **chaque page a 1 store unique** (source de vérité)
- **aucune donnée démo dans le HTML**
- **aucun style inline dans le JS**

Le tout en **vanilla JS + ES modules** (pas de framework npm).

---

## 2. Architecture en 1 schéma

```
┌─────────────────────────────────────────────────────────────┐
│  PAGE.HTML (squelette vierge)                                │
│  ┌──────────────────────────────────────────────────┐        │
│  │ <body data-route="decisions">                     │        │
│  │   <div data-component="X" data-props='{}'>...     │        │
│  │   <div data-region="cards"></div>                 │        │
│  │   <script src="../stores/Y-store.js"></script>    │        │
│  │ </body>                                            │        │
│  └────────────────────┬─────────────────────────────┘        │
│                       │ instanciation au load                 │
│                       ▼                                       │
│  COMPONENT-LOADER  ──────────────► COMPOSANTS                 │
│  (mécanisme d'init)                ┌─────────────────┐        │
│                                    │ card-decision   │        │
│                                    │ ├─ template.html│        │
│                                    │ ├─ bind.js      │        │
│                                    │ └─ style.css    │        │
│                                    └─────────────────┘        │
│                       ▲                                       │
│                       │ event 'change'                        │
│  STORE  ◄─────────── fetch /api/...                           │
│  (état + dispatch)    │                                       │
│                       │ setState() → emit('change')           │
│                       ▼                                       │
│  RENDER en région:                                            │
│    document.querySelector('[data-region]')                    │
│      .innerHTML = <data-component>...</data-component>        │
│    → ComponentLoader.load() (re-mount nouveaux comp.)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Conventions de nommage

| Type | Convention | Exemple |
|---|---|---|
| Composant | kebab-case, prefix sémantique | `card-decision`, `modal-form`, `seg-filter` |
| Store | nom-page + `-store` | `decisions-store.js`, `arbitrage-store.js` |
| data-region | nom-domaine singulier | `data-region="timeline"`, `data-region="kpis"` |
| data-component | identique au dossier | `data-component="card-decision"` |
| data-props | JSON valide | `data-props='{"id":"123","title":"..."}'` |

---

## 4. Anatomie d'un composant

### `components/card-decision/card-decision.html`
```html
<article class="card-decision" data-decision-id="${id}">
  <header class="card-decision__head">
    <span class="pill pill--type" data-slot="type"></span>
    <span class="pill pill--status" data-slot="status"></span>
  </header>
  <h3 class="card-decision__title" data-slot="title"></h3>
  <p class="card-decision__rationale" data-slot="rationale"></p>
  <footer class="card-decision__foot">
    <span data-slot="meta"></span>
    <button class="btn btn--ghost btn--xs" data-action="open">Ouvrir →</button>
  </footer>
</article>
```

### `components/card-decision/card-decision.js`
```javascript
import { Component } from '../../shared/component.js';

export default class CardDecision extends Component {
  static mount(el, props) {
    super.mount(el, props);
    el.querySelector('[data-slot="title"]').textContent = props.title || '';
    el.querySelector('[data-slot="rationale"]').textContent = props.rationale || '';
    el.querySelector('[data-slot="type"]').textContent = props.type || '';
    el.querySelector('[data-slot="status"]').textContent = props.status || '';
    el.querySelector('[data-slot="meta"]').textContent = props.meta || '';
    el.querySelector('[data-action="open"]').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('decision:open', { detail: props }));
    });
  }
}
```

### `components/card-decision/card-decision.css`
```css
.card-decision {
  display: grid; grid-template-columns: 96px 1fr; gap: 18px;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px 20px;
  margin-bottom: 14px; box-shadow: var(--shadow-1);
}
.card-decision__head { display: flex; gap: 6px; }
.card-decision__title { margin: 0; font-size: 15px; font-weight: 600; }
.card-decision__rationale { margin: 0; font-size: 13px; color: var(--text-2); }
.card-decision__foot { display: flex; justify-content: space-between; }
```

---

## 5. Pattern Store

### `shared/store.js`
```javascript
export class Store {
  constructor() { this._listeners = new Set(); this._state = {}; }
  setState(patch) { this._state = { ...this._state, ...patch }; this._emit('change'); }
  getState() { return this._state; }
  on(evt, fn) { this._listeners.add({ evt, fn }); }
  _emit(evt) { for (const l of this._listeners) if (l.evt === evt) l.fn(this._state); }
}
```

### `stores/decisions-store.js`
```javascript
import { Store } from '../shared/store.js';
import { ComponentLoader } from '../shared/component-loader.js';

class DecisionsStore extends Store {
  async load() {
    const data = await fetch('/api/decisions?limit=200').then(r => r.json());
    this.setState({
      decisions: data.decisions || [],
      filter: 'all',
      search: ''
    });
  }
  filter(type) { this.setState({ filter: type }); }
  search(q) { this.setState({ search: q }); }
  getFiltered() {
    const { decisions, filter, search } = this.getState();
    let arr = decisions;
    if (filter !== 'all') arr = arr.filter(d => d.type === filter);
    if (search) arr = arr.filter(d => (d.title + ' ' + d.context).toLowerCase().includes(search.toLowerCase()));
    return arr;
  }
}
const store = new DecisionsStore();

store.on('change', (state) => {
  const filtered = store.getFiltered();
  // KPIs
  document.querySelector('[data-region="kpis"]').innerHTML = renderKpis(state.decisions);
  // Timeline
  if (filtered.length === 0) {
    document.querySelector('[data-region="timeline"]').innerHTML = '';
    document.querySelector('[data-region="empty"]').hidden = false;
  } else {
    document.querySelector('[data-region="empty"]').hidden = true;
    document.querySelector('[data-region="timeline"]').innerHTML = filtered.map(d => `<div data-component="card-decision" data-props='${JSON.stringify(d)}'></div>`).join('');
    ComponentLoader.load();
  }
});

store.load();
export default store;
```

---

## 6. Tests unit composants (JSDOM)

```javascript
// tests/components/card-decision.test.js
const { JSDOM } = require('jsdom');
const test = require('node:test');
const assert = require('node:assert');

test('card-decision renders title and status', async () => {
  const dom = new JSDOM('<div></div>');
  const el = dom.window.document.querySelector('div');
  el.innerHTML = '<article><h3 data-slot="title"></h3><span data-slot="status"></span></article>';
  const CardDecision = (await import('../../presentation/v07/components/card-decision/card-decision.js')).default;
  CardDecision.mount(el, { title: 'RFP Hôpital Sud', status: 'ouverte' });
  assert.equal(el.querySelector('[data-slot="title"]').textContent, 'RFP Hôpital Sud');
  assert.equal(el.querySelector('[data-slot="status"]').textContent, 'ouverte');
});
```

---

## 7. Migration progressive — pas de big bang

| Sprint | Pages migrées vers v07 |
|---|---|
| **S6.10-bis** | decisions, connaissance, arbitrage (3 pages) |
| Phase 1 — S6.13 | revues, cockpit (2 pages) |
| Phase 2 — S7.1-S7.6 | assistant, coaching, agenda, projets, equipe (5 pages) |
| Phase 3 — S7.7-S7.11 | evening, taches, settings, onboarding, hub (5 pages) |

**Total** : 18 pages migrées en ~5 sprints. Cohabitation v06 / v07 pendant la transition (drawer affiche un badge "BETA" sur les nouvelles).

---

## 8. Bénéfices attendus

| Métrique | Avant | Après |
|---|---|---|
| Lignes HTML par page | 800-1000 | **60-80** |
| Couches qui rendent | 3 (HTML + bind + shell+ clear-demo) | **1** (store) |
| `style="..."` inline | ~50 par page | **0** |
| Composants réutilisés | 0 | **12-25** |
| Temps debug bug visuel | 30 min (chercher où ça vient) | **5 min** (un seul endroit) |
| Bundle size | 600 KB | **~100 KB par page** (ESM lazy) |
| Test coverage frontend | 0% | **≥ 80%** sur composants |

---

## 9. Anti-patterns à interdire

❌ Données démo dans le HTML squelette
❌ `innerHTML = '<div style="...">...</div>'` ad hoc dans un store ou bind
❌ Plusieurs scripts qui modifient le même `data-region`
❌ Fetch dans un composant (composants = pure render, store = data)
❌ CSS inline (`style="..."`)
❌ Variables couleurs avec fallback en dur (`var(--rose, #f00)`) — utiliser `var(--rose)` strict, et le DS doit être chargé en premier

---

## 10. Sources

- ADR `2026-04-28 v8 · ADD-AI`
- Sprint S6.10-bis (cadrage)
- Inspiration : Atomic Design (Brad Frost), Web Components, Lit (sans la lib)
- Mandat CEO 28/04 : *"templates vierges intégrés et dynamisés à la demande, framework avec composants pour partager templates, widgets, styles"*

