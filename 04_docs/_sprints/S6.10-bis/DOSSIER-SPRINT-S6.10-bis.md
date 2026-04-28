# Sprint S6.10-bis — Refonte frontend "Atomic Templates"

> **Origine** : observation CEO 28/04 — *"la maquette s'appuie sur des pages HTML avec des données démo et est ensuite templatée par une stack JS avec parfois plusieurs passes pour obtenir un résultat final, ce qui rend le ciblage des updates UX/UI complexe avec des comportements indésirables difficile à debugger."*
> **Préalable** : Sprint S6.9-bis ADD-AI livré
> **Effort estimé** : 2 j-binôme
> **Cible** : framework "Atomic Templates" + 3 pages migrées exemplaires + plan migration des 15 autres

---

## 1. Diagnostic du frontend actuel

### Le problème — 3 couches qui se télescopent

Aujourd'hui, **chaque page est rendue par 3 mécanismes superposés**, chacun pouvant écrire dans le DOM en parallèle :

1. **HTML statique** (`v06/*.html`) avec **données démo en dur** (textes, chiffres, cards démo)
2. **`bind-*.js`** spécifique à la page (ex: `bind-decisions.js`) qui :
   - Appelle l'API
   - **Efface ou remplace** des sections du HTML
   - Re-render des cards via `innerHTML = ...`
3. **`shell.js`, `clear-demo.js`, `theme.js`, `bind-drawer-*.js`** qui :
   - Modifient le drawer
   - Injectent des CSS dynamiques
   - Cachent ou remplacent des empty states
   - Marquent des items comme "preview"

**Conséquences observées** :
- `clear-demo.js` injectait un empty state "Votre base de connaissance est vide" pendant que `bind-connaissance.js` injectait le sien → **double affichage**
- Les `style="..."` inline ajoutés dans les `bind-*.js` pendant S6.8 **shadow** les classes DS de `tweaks.css`
- Pour changer la couleur d'un bouton, il faut savoir où il est rendu : HTML statique ? bind-*.js ? shell.js ?
- Quand le HTML statique a déjà des chiffres ("47 décisions"), le bind doit "trouver et remplacer" — fragile à chaque refacto HTML
- Les **passes multiples** (clear-demo → bind → re-render après fetch) provoquent des **flashes visuels** au load

### Pourquoi c'est arrivé

La maquette source Claude Design avait un objectif **visuel** : montrer le rendu fini, pas une app vide. Donc beaucoup de données démo en dur. Quand on a câblé les pages au backend, on a **superposé** plutôt que **substitué** — le HTML statique reste, le JS le rectifie.

C'est viable pour un MVP de démo mais pas pour itérer.

---

## 2. Le framework "Atomic Templates"

### 2.1 Principe fondateur

> **Une page = 1 squelette HTML vierge + 1 store + des composants.**
> **Aucune donnée démo dans le HTML. Aucun rendu en parallèle. Une seule source de vérité.**

### 2.2 Les 5 règles

1. **HTML squelette vierge** : la page contient uniquement la **structure** (zones nommées par `data-region="..."`). Aucun contenu démo.
2. **Composants atomiques** réutilisables : 1 dossier par composant avec `template.html` + `bind.js` + `style.css`. Le composant lit ses props depuis un attribut `data-props`.
3. **Store unique** : 1 module par page qui fetch + transforme + dispatche aux composants. Source de vérité unique.
4. **Pas de re-rendering en cascade** : les composants s'auto-render quand leur store émet un changement. Pas de `innerHTML = ...` ad hoc.
5. **DS via classes uniquement** : aucun `style="..."` inline. Toutes les couleurs / tailles / espacements via classes utilitaires `tweaks.css`.

### 2.3 Anatomie d'une page Atomic

```
presentation/v07/
├── pages/
│   └── decisions.html              # SQUELETTE VIERGE (60 lignes max)
├── components/                     # COMPOSANTS RÉUTILISABLES
│   ├── header-topbar/
│   │   ├── header-topbar.html      # template
│   │   ├── header-topbar.js        # logique
│   │   └── header-topbar.css       # style isolé
│   ├── card-decision/
│   │   ├── card-decision.html
│   │   ├── card-decision.js
│   │   └── card-decision.css
│   ├── kpi-tile/
│   ├── modal-detail/
│   ├── empty-state/
│   ├── seg-filter/
│   ├── search-pill/
│   └── ... (≈ 25 composants couvrant les 18 pages)
├── stores/                         # STORES PAR PAGE
│   ├── decisions-store.js          # fetch + state + dispatch
│   ├── arbitrage-store.js
│   └── ...
└── shared/
    ├── tokens.css                  # tous les --variables DS
    ├── tweaks.css                  # classes utilitaires
    ├── component-loader.js         # mécanisme d'instanciation
    └── store.js                    # base class store + EventEmitter
```

### 2.4 Squelette page exemple

```html
<!-- decisions.html — 60 lignes max -->
<!DOCTYPE html>
<html lang="fr"><head>
  <meta charset="UTF-8">
  <title>aiCEO — Décisions</title>
  <link rel="stylesheet" href="../shared/tokens.css">
  <link rel="stylesheet" href="../shared/tweaks.css">
</head>
<body data-route="decisions">
  <div class="app">
    <aside data-component="drawer-sidebar" data-props='{"active":"decisions"}'></aside>
    <main class="app-main">
      <div data-component="header-topbar" data-props='{"title":"Décisions","subtitle":"Ce que vous avez choisi de faire — et de ne pas faire","actions":[{"icon":"search"},{"icon":"export"}]}'></div>

      <div data-region="kpis" class="kpi-row">
        <!-- 4 kpi-tile injectés par decisions-store -->
      </div>

      <div data-component="seg-filter" data-region="filters" data-props='{"id":"type","options":["Toutes","Stratégiques","Opérationnelles","Posture"]}'></div>

      <div data-region="timeline">
        <!-- card-decision injectées par decisions-store -->
      </div>

      <div data-component="empty-state" data-region="empty" hidden data-props='{"icon":"target","title":"Aucune décision","cta":{"label":"Aller à l\'arbitrage","href":"arbitrage.html"}}'></div>
    </main>
  </div>

  <div data-component="modal-detail" data-region="modal"></div>

  <script type="module" src="../stores/decisions-store.js"></script>
  <script type="module" src="../shared/component-loader.js"></script>
</body></html>
```

### 2.5 Component loader

```javascript
// component-loader.js — instancie tous les data-component au load
class ComponentLoader {
  static async load() {
    const els = document.querySelectorAll('[data-component]');
    for (const el of els) {
      const name = el.dataset.component;
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      const module = await import(`../components/${name}/${name}.js`);
      const html = await fetch(`../components/${name}/${name}.html`).then(r => r.text());
      el.innerHTML = html;
      module.default.mount(el, props);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => ComponentLoader.load());
```

### 2.6 Store pattern

```javascript
// decisions-store.js
import { Store } from '../shared/store.js';

class DecisionsStore extends Store {
  async load() {
    const data = await fetch('/api/decisions?limit=200').then(r => r.json());
    this.setState({ decisions: data.decisions || [] });
  }
  filterByType(type) { /* ... */ this.emit('change'); }
}

const store = new DecisionsStore();
store.on('change', (state) => {
  // Render KPIs
  document.querySelector('[data-region="kpis"]').innerHTML =
    state.decisions.length === 0 ? '' : computeKpis(state.decisions);
  // Render cards
  document.querySelector('[data-region="timeline"]').innerHTML =
    state.decisions.map(d => `<div data-component="card-decision" data-props='${JSON.stringify(d)}'></div>`).join('');
  // Re-mount nested components
  ComponentLoader.load();
  // Empty state
  document.querySelector('[data-region="empty"]').hidden = state.decisions.length > 0;
});

store.load();
export default store;
```

### 2.7 Avantage / contrainte

**Avantages** :
- ✅ **Pas de double affichage** : 1 source de vérité (store), 1 cible (data-region)
- ✅ **Componentisation** : un `card-decision` est utilisable sur Décisions, Cockpit, Connaissance
- ✅ **CSS isolé par composant** : pas de cascade indésirable
- ✅ **Test unit possible** par composant (sans navigateur via JSDOM)
- ✅ **Squelettes HTML lisibles** (60 lignes vs 1000+ aujourd'hui)
- ✅ **Migration progressive** : les anciennes pages v06 cohabitent avec les nouvelles v07

**Contraintes** :
- ⚠️ JS modules (ES modules natifs) → besoin d'un serveur statique (déjà OK avec Express)
- ⚠️ Fetch HTML par composant = N requêtes au load → cache navigateur OK, mais penser à un bundle build pour V1
- ⚠️ Migration progressive nécessaire (S6.10-bis fait 3 pages, le reste s'enchaîne dans Phase 1-2)

---

## 3. Plan de migration S6.10-bis (3 pages exemplaires)

### Pages cibles (les + impactées par les bugs S6.8)

| # | Page | Pourquoi en premier | Effort |
|---|---|---|---|
| 1 | **decisions** | Cas d'usage le + simple : liste + filtres + KPIs + modal | 4h |
| 2 | **connaissance** | A le double empty state historique → bon test du store unique | 3h |
| 3 | **arbitrage** | Le + complexe (file + détail + verdict + macro-blocks) — preuve de scalabilité | 5h |

### Composants à créer (≈ 12 réutilisables)

| Composant | Réutilisable sur |
|---|---|
| `header-topbar` | toutes les pages |
| `drawer-sidebar` | toutes les pages |
| `kpi-tile` | cockpit, decisions, projets, equipe, revues |
| `card-decision` | decisions, cockpit, connaissance |
| `card-pin` | connaissance, assistant |
| `seg-filter` | decisions, taches, agenda, revues |
| `search-pill` | decisions, equipe, connaissance, taches |
| `modal-detail` | decisions, projets |
| `modal-form` | nouvelle décision, nouvelle tâche, nouvelle note |
| `empty-state` | toutes les pages |
| `pill-status` | partout |
| `arbitrage-row` | arbitrage queue |

---

## 4. Tasks S6.10-bis

| # | Task | Effort |
|---|---|---|
| 1 | Créer arborescence `presentation/v07/` (pages, components, stores, shared) | 30 min |
| 2 | Implémenter `Store` base class + `ComponentLoader` | 1h |
| 3 | Migrer tokens.css + tweaks.css épurés (sans inline) | 1h |
| 4 | Créer 12 composants atomiques | 4h |
| 5 | Migrer page **decisions.html** | 2h |
| 6 | Migrer page **connaissance.html** | 1.5h |
| 7 | Migrer page **arbitrage.html** | 3h |
| 8 | Tests unit composants (JSDOM) | 1.5h |
| 9 | Documenter framework dans `00_methode/FRAMEWORK-ATOMIC-TEMPLATES.md` | 1h |
| 10 | Plan détaillé migration des 15 autres pages | 30 min |
| 11 | Commit + ADR `2026-XX-XX · Adoption Atomic Templates` | 30 min |

**Total** : ~16h ≈ 2 j-binôme

---

## 5. Critères d'acceptance

- ✅ 3 pages migrées en `presentation/v07/` rendent identiquement aux v06 actuelles
- ✅ Aucune donnée démo en dur dans les .html v07
- ✅ Aucun `style="..."` inline dans les bind/store .js
- ✅ 12 composants atomiques utilisables via `data-component="..."`
- ✅ Tests unit ≥ 80% sur les composants
- ✅ Framework documenté dans `FRAMEWORK-ATOMIC-TEMPLATES.md`
- ✅ Plan migration des 15 autres pages chiffré

---

## 6. Risques

| # | Risque | Mitigation |
|---|---|---|
| R1 | ES modules sur file:// pas supportés | Servir via Express (déjà actif) |
| R2 | Fetch HTML × N composants = lent | Préload + cache navigateur, bundle V1 |
| R3 | Cohabitation v06 / v07 source de confusion | Drawer indique "v07" avec badge BETA, route `/v07/*` |
| R4 | Migration des 15 autres pages bloque la roadmap | Faire 3 pages en S6.10-bis, le reste pendant Phase 1-2 incrémentalement |

---

## 7. Sources

- Mandat CEO 28/04 PM late : *"propose un principe de template vierge qui sont intégré et dynamisé à la demande"*
- Pattern source : *Web Components* (Lit) simplifié + *Atomic Design* (Brad Frost)
- Inspiration : Linear, Reflect (architecture composant)
- ADR `2026-04-28 v8 · ADD-AI`

