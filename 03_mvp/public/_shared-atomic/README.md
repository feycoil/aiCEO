# `_shared/` — Design System v0.6 (ITCSS + BEM)

> Architecture CSS atomique introduite en Sprint S6.1 (phase v0.6).
> Source de référence : `04_docs/_design-v05-claude/ressources-a-joindre/13-architecture-atomique.md`

## Arborescence — 7 couches ITCSS (Inverted Triangle CSS)

Du plus général au plus spécifique :

```
_shared/
├── 01_settings/    Variables CSS — tokens 3 niveaux (primitive / semantic / component)
├── 02_tools/       Utilitaires (pas de mixins Sass, on est en CSS pur — ce dossier reste léger)
├── 03_generic/     Reset, normalize, box-sizing global
├── 04_elements/    Defaults pour h1, p, a, ul, button (sans classe)
├── 05_objects/     Layout primitives sans cosmétique : `.o-grid`, `.o-stack`, `.o-cluster`
├── 06_components/  Visuel par bloc : `.c-button`, `.c-card`, `.c-modal`, `.c-task-card`
└── 07_utilities/   Overrides ciblés : `.u-text-center`, `.u-mt-4`
```

## Naming convention BEM + préfixes

| Préfixe | Couche ITCSS | Exemple |
|---|---|---|
| `c-` | components | `.c-task-card`, `.c-task-card__title`, `.c-task-card--priority-p0` |
| `o-` | objects | `.o-grid`, `.o-stack`, `.o-cluster` |
| `u-` | utilities | `.u-text-center`, `.u-mt-4` |
| `t-` | themes / tenant overrides | `.t-acme` (futur V1+ multi-tenant) |
| `is-` / `has-` | states | `.is-active`, `.has-error`, `.is-loading` |

**Règles BEM strictes** :
- `.c-block` → bloc indépendant
- `.c-block__element` → enfant logique (double underscore)
- `.c-block--modifier` → variante (double tiret)
- Pas de profondeur > 1 niveau d'élément (pas `.c-block__elem__sub`)

## Tokens CSS — 3 niveaux (S6.1.1)

```css
/* PRIMITIVE — couleur brute, neutre, sans usage contextuel */
--color-rose-500: #d96d3e;
--color-navy-900: #111418;

/* SEMANTIC — usage contextuel, mappe vers primitive */
--color-brand: var(--color-navy-900);
--color-danger: var(--color-rose-500);

/* COMPONENT — par bloc, mappe vers semantic */
--button-primary-bg: var(--color-brand);
--modal-backdrop-bg: var(--color-overlay);
```

**Règle d'or** : un composant ne référence JAMAIS un token primitive directement. Toujours via semantic ou component.

## Ordre d'import dans `colors_and_type.css`

```css
/* 1. Settings */
@import "./01_settings/tokens-primitive.css";
@import "./01_settings/tokens-semantic.css";
@import "./01_settings/tokens-component.css";

/* 2. Tools (n/a en CSS pur) */

/* 3. Generic */
@import "./03_generic/reset.css";

/* 4. Elements */
@import "./04_elements/typography.css";
@import "./04_elements/links.css";

/* 5. Objects */
@import "./05_objects/grid.css";
@import "./05_objects/stack.css";

/* 6. Components — un fichier par composant */
@import "./06_components/c-button.css";
@import "./06_components/c-input.css";
/* ... 16 composants au total v0.6 */

/* 7. Utilities */
@import "./07_utilities/spacing.css";
@import "./07_utilities/text.css";
```

## Documentation détaillée

Voir `_shared/CONTRIBUTING-V06.md` pour le guide complet (BEM rules, ITCSS layering, do/don't).

## Sources

- `04_docs/_design-v05-claude/ressources-a-joindre/13-architecture-atomique.md`
- `04_docs/_design-v05-claude/ressources-a-joindre/06-composants-catalogue.md`
- DOSSIER-V06.md §3 Sprint S6.1
- ADR `2026-04-26 · S6.1.00 - Méthode Sprint S6.1 + setup ITCSS`
