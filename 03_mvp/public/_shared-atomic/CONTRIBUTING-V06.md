# CONTRIBUTING — Design System v0.6

> Guide pratique pour contribuer au DS v0.6.
> S'applique à tout fichier CSS/HTML dans `03_mvp/public/`.

## TL;DR (à connaître par cœur)

1. **Tokens** : 3 niveaux (primitive → semantic → component). Un composant utilise SEULEMENT semantic ou component, jamais primitive.
2. **BEM** strict avec préfixes : `.c-block__element--modifier`, `.o-grid`, `.u-mt-4`, `.is-active`.
3. **ITCSS** 7 couches : settings → tools → generic → elements → objects → components → utilities. La spécificité monte uniquement.
4. **Pas de `!important`** sauf cas exceptionnel documenté en commentaire.
5. **Pas de couleur en dur** dans les composants. Toujours `var(--token-*)`.
6. **Pas de `localStorage` applicatif** (ADR S2.00). Seules tolérées : `aiCEO.uiPrefs.*` pour préférences UI volatiles (drawer collapsed, etc.).

---

## 1. Architecture ITCSS

### Pourquoi ITCSS ?

Inverted Triangle CSS organise les règles CSS du **plus général** au **plus spécifique**. La spécificité monte uniquement, jamais l'inverse. Conséquence : pas de conflit de cascade, pas besoin de `!important`.

### Les 7 couches

```
01_settings/    Variables CSS (tokens primitive/semantic/component)
02_tools/       Utilitaires (n/a en CSS pur, dossier vide ou très léger)
03_generic/     Reset, normalize, box-sizing global
04_elements/    Defaults pour h1, p, a, ul, button (sans classe CSS)
05_objects/     Layout primitives sans cosmétique : .o-grid, .o-stack
06_components/  Visuel par bloc : .c-button, .c-card, .c-modal
07_utilities/   Overrides ciblés : .u-text-center, .u-mt-4
```

### Règles d'or

- **Settings** : que des `:root { --token-*: ...; }`. Pas de sélecteur de classe.
- **Generic** : un seul `*, *::before, *::after { box-sizing: border-box }` + reset Eric Meyer minimaliste.
- **Elements** : sélecteurs d'éléments HTML uniquement (pas de classe). Ex : `h1 { font-size: var(--text-h1); }`.
- **Objects** : layout pur, pas de couleur ni de border. Ex : `.o-grid` définit grid-template-columns mais pas de bg-color.
- **Components** : visuel complet, peut combiner objects. Pas de positionnement page-level.
- **Utilities** : overrides ciblés, peuvent contenir `!important` (acceptable car responsabilité unique).

---

## 2. Tokens CSS — 3 niveaux

### Pourquoi 3 niveaux ?

Permet de changer le brand color tenant en surchargeant uniquement les semantic tokens, sans toucher aux primitive tokens (référence) ni aux component tokens (qui héritent automatiquement).

### Niveau A — Primitive

Couleur brute, neutre, sans usage contextuel. C'est la palette source.

```css
:root {
  --color-rose-50:  #fdecdf;
  --color-rose-500: #d96d3e;
  --color-rose-800: #8a3b1b;

  --color-navy-100: #f5f3ef;
  --color-navy-900: #111418;
}
```

### Niveau B — Semantic

Mappe les primitive vers un usage contextuel. **C'est le seul niveau que les composants doivent référencer.**

```css
:root {
  --color-bg: var(--color-navy-100);
  --color-surface: #ffffff;
  --color-brand: var(--color-navy-900);
  --color-danger: var(--color-rose-500);
  --color-danger-bg: var(--color-rose-50);
}
```

### Niveau C — Component (optionnel)

Spécifique à un composant. Utile si on veut isoler le theming d'un composant.

```css
.c-button {
  --button-primary-bg: var(--color-brand);
  --button-primary-color: var(--color-surface);
  --button-radius: var(--radius-button);
}
```

### Règle d'or

```css
/* ❌ MAUVAIS — composant référence un primitive */
.c-button { background: var(--color-rose-500); }

/* ✅ BON — composant référence un semantic */
.c-button.c-button--danger { background: var(--color-danger); }

/* ✅ BON aussi — composant référence un component token (lui-même) */
.c-button { background: var(--button-primary-bg); }
```

---

## 3. BEM avec préfixes

### Convention de nommage

```
.[préfixe]-[block]__[element]--[modifier]
```

| Préfixe | Couche ITCSS | Usage | Exemple |
|---|---|---|---|
| `c-` | components | Bloc visuel autonome | `.c-task-card`, `.c-modal` |
| `o-` | objects | Layout primitive | `.o-grid`, `.o-stack` |
| `u-` | utilities | Override ciblé | `.u-text-center`, `.u-mt-4` |
| `t-` | themes / tenant overrides | Surcharge tenant (V1+) | `.t-acme` |
| `is-` / `has-` | states | État runtime | `.is-active`, `.has-error` |

### BEM strict

```css
/* Block */
.c-task-card { ... }

/* Element (double underscore) */
.c-task-card__title { ... }
.c-task-card__meta { ... }

/* Modifier (double tiret) */
.c-task-card--priority-p0 { ... }
.c-task-card--draggable { ... }

/* État (préfixe is-/has-) */
.c-task-card.is-active { ... }
.c-task-card.has-overdue { ... }
```

### Règles strictes

- **Pas de profondeur > 1 niveau d'élément** : `.c-block__elem__sub` est interdit. Si nécessaire, créer un sous-block : `.c-sub-block`.
- **Modifier sans block n'a pas de sens** : `.c-task-card--priority-p0` mais pas `.--priority-p0` seul.
- **État avec block** : toujours combiner avec le block parent : `.c-task-card.is-active`.

---

## 4. Conventions de fichiers

### Un composant = un fichier CSS

```
06_components/
├── c-avatar.css
├── c-badge.css
├── c-button.css
├── c-card.css
├── c-modal.css
└── ...
```

### Header de fichier obligatoire

```css
/**
 * c-button — Composant Button
 *
 * Variants : primary | secondary | ghost | danger
 * Sizes : sm | md | lg
 * États : default, hover, focus-visible, active, disabled, loading
 *
 * Usage HTML :
 *   <button class="c-button c-button--primary c-button--md">Valider</button>
 *
 * Source : 06-composants-catalogue.md (S6.1.2)
 */
```

---

## 5. Tokens à utiliser systématiquement

### Couleurs

```css
/* Surfaces */
var(--color-bg)              /* fond global */
var(--color-surface)         /* cartes, modals */
var(--color-surface-2)       /* zones nested */

/* Texte */
var(--color-text)            /* corps */
var(--color-text-2)          /* secondaire */
var(--color-text-3)          /* meta, légendes */

/* Sémantique */
var(--color-brand)           /* CTA primaires */
var(--color-success)
var(--color-danger)
var(--color-warning)
var(--color-info)

/* Borders */
var(--color-border)
var(--color-border-2)        /* accent border */
```

### Typographie

```css
/* Familles */
var(--font-sans)             /* Fira Sans, défaut */
var(--font-script)           /* Aubrielle, ≥36px */
var(--font-thin)             /* Sol, ≥28px chiffres */
var(--font-mono)             /* code, kbd */

/* Tailles */
var(--text-xs)   /* 11px */
var(--text-sm)   /* 13px */
var(--text-md)   /* 15px - default */
var(--text-lg)   /* 17px */
var(--text-h3)   /* 19px */
var(--text-h2)   /* 24px */
var(--text-h1)   /* 32px */

/* Lignes */
var(--leading-tight)   /* 1.2 */
var(--leading-normal)  /* 1.5 */
var(--leading-loose)   /* 1.75 */
```

### Espacements (échelle 4px)

```css
var(--space-1)   /* 4px */
var(--space-2)   /* 8px */
var(--space-3)   /* 12px */
var(--space-4)   /* 16px */
var(--space-5)   /* 24px */
var(--space-6)   /* 32px */
var(--space-7)   /* 48px */
var(--space-8)   /* 64px */
```

### Radius

```css
var(--radius-xs)     /* 4px */
var(--radius-sm)     /* 8px */
var(--radius-md)     /* 12px - default cards */
var(--radius-lg)     /* 16px - modals */
var(--radius-pill)   /* 999px - pills, chips */
```

---

## 6. Do / Don't

### ✅ Do

- Utiliser `var(--token-*)` partout dans les composants
- Préfixer les classes (`c-`, `o-`, `u-`)
- Co-localiser un composant dans 1 seul fichier `c-<nom>.css`
- Documenter chaque composant avec un header `/** ... */`
- Tester les composants dans `/components.html` (gallery)
- Préserver les tests Playwright à chaque commit (≥ 95 verts)

### ❌ Don't

- ❌ `color: #d96d3e;` (hex en dur — utiliser `var(--color-danger)`)
- ❌ `.task-card { ... }` (sans préfixe — utiliser `.c-task-card`)
- ❌ `.c-task-card .title { ... }` (sélecteur descendant — utiliser `.c-task-card__title`)
- ❌ `.c-block__element__sub { ... }` (BEM > 1 niveau)
- ❌ `!important` sauf dans `07_utilities/` ou cas exceptionnel commenté
- ❌ `localStorage.setItem('aiCEO.tasks', ...)` (zéro localStorage applicatif — ADR S2.00)

---

## 7. Workflow ajout d'un composant

1. **Vérifier** que le composant existe dans `04_docs/_design-v05-claude/ressources-a-joindre/06-composants-catalogue.md`.
2. **Créer** `_shared/06_components/c-<nom>.css` avec header obligatoire.
3. **Importer** dans `_shared/index.css` (ou `assets/colors_and_type.css` selon configuration).
4. **Ajouter** au `/components.html` (gallery) avec toutes les variantes.
5. **Tester** au moins 1 état critique (Playwright recommandé sur les 5+ composants critiques).
6. **Documenter** les évolutions DS dans `04_docs/_design-v05-claude/decisions/`.

---

## 8. Audit qualité avant merge

Avant tout commit sur main :

```powershell
# 1. Lint CSS (S6.1.0 ajoute ces scripts npm)
cd 03_mvp
npm run css:lint

# 2. Audit accessibilité
npm run a11y:audit

# 3. Tests Playwright
npm run test

# 4. Smoke test pages
npm run smoke
```

---

## 9. Sources documentaires

- `04_docs/_design-v05-claude/ressources-a-joindre/13-architecture-atomique.md` — Architecture détaillée
- `04_docs/_design-v05-claude/ressources-a-joindre/06-composants-catalogue.md` — 16 composants v0.6
- `04_docs/_design-v05-claude/ressources-a-joindre/14-microcopy-principes-impact.md` — Voice & tone, principes design
- ADR `2026-04-26 · S6.1.00 — Méthode Sprint S6.1 + setup ITCSS`
- ADR `2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1`
