# Architecture atomique & robustesse — aiCEO v0.5

## 1. Atomic Design — 5 niveaux

### Niveau 1 : Tokens

Variables CSS définies dans `_shared/base.css`.

- **Primitive tokens** (couleur brute, neutre, contextuelle)
- **Semantic tokens** (mappent les primitives à des usages contextuels)
- **Component tokens** (spécifiques à un composant)

Voir §2 pour la hiérarchie complète.

### Niveau 2 : Atoms

Briques visuelles indivisibles, sans logique métier.

- `Button` (4 variants × 3 sizes)
- `Input` (text, textarea, number, date)
- `Badge`
- `Avatar`
- `Icon` (wrapper Lucide)
- `Spinner`
- `Divider`
- `Skeleton`
- `Switch`
- `Checkbox`
- `Radio`
- `Tag` / `Chip`

### Niveau 3 : Molecules

Combinaison d'atoms, peu de logique.

- `SearchPill` (Icon + Input + Kbd)
- `FormField` (Label + Input + HelpText + ErrorText)
- `Toast` (Icon + Message + CloseButton)
- `Tooltip` (Trigger + Content)
- `ProgressMeter` (Label + ProgressBar + Value)
- `Stepper` (Buttons + Input)
- `Dropdown` (Trigger + Menu + Items)
- `Tabs` (TabList + Tabs + TabPanels)
- `BreadCrumbs`
- `Pagination`

### Niveau 4 : Organisms

Composants métier complexes, avec logique.

- `Drawer` (collapsible navigation)
- `Header` (TopNav + Search + Actions + Avatar)
- `BottomTabNav` (mobile)
- `Footer`
- `Modal` (3 sizes + variants)
- `BottomSheet` (mobile)
- `CommandPalette` (⌘K)
- `TaskCard` (full task with actions)
- `EventCard`
- `ContactCard`
- `DecisionCard`
- `MorningCard` (cockpit hero)
- `EveningCard`
- `BigRocksList`
- `AlertsList`
- `KpiGrid`
- `AssistantChatBubble`
- `EmptyState`
- `ErrorState`

### Niveau 5 : Templates / Layouts

Squelettes de page sans contenu.

- `AppShell` (Drawer + Header + Main + Footer)
- `AppShellMobile` (Header + Main + BottomTab)
- `ModalShell`
- `OnboardingShell` (centered, no chrome)

### Niveau 6 : Pages

Templates instanciés avec contenu.

13 pages déjà spec'd + `onboarding.html`, `settings.html`, `components.html`.

## 2. Tokens hierarchy — 3 niveaux

### Niveau A : Primitive tokens

Vocabulaire neutre, indépendant de tout usage.

```css
:root {
  /* COULEURS PRIMITIVES */
  --color-cream-50:  #faf8f4;
  --color-cream-100: #f5f3ef;
  --color-cream-200: #eeebe4;
  --color-cream-300: #e4e1d9;

  --color-navy-700: #2b3139;
  --color-navy-900: #111418;

  --color-rose-50:  #fdecdf;
  --color-rose-500: #d96d3e;
  --color-rose-800: #8a3b1b;

  --color-emerald-50:  #e2ece8;
  --color-emerald-500: #3d7363;
  --color-emerald-800: #234236;

  --color-sky-50:  #e9eef4;
  --color-sky-500: #7790ae;
  --color-sky-800: #3b506a;

  --color-amber-50:  #f5e8d6;
  --color-amber-500: #b88237;
  --color-amber-800: #6d4816;

  --color-violet-50:  #ece7f0;
  --color-violet-500: #7a6a8a;
  --color-violet-800: #463a54;

  --color-indigo-500: #3d4e7d;
  --color-indigo-50:  #e3e7ee;

  --color-lavender-bg: #a9adbe;

  /* SPACING PRIMITIVES */
  --size-px: 1px;
  --size-0:  0;
  --size-1:  4px;
  --size-2:  8px;
  --size-3:  12px;
  --size-4:  16px;
  --size-5:  20px;
  --size-6:  24px;
  --size-8:  32px;
  --size-10: 40px;
  --size-12: 48px;
  --size-16: 64px;

  /* RADIUS PRIMITIVES */
  --radius-px: 1px;
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* DURATION PRIMITIVES */
  --duration-100: 100ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-600: 600ms;

  /* EASING PRIMITIVES */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Niveau B : Semantic tokens

Vocabulaire d'usage. **Toujours utiliser les semantic tokens dans les composants**, jamais les primitives directement (sauf cas exceptionnel).

```css
:root {
  /* Surfaces */
  --color-bg: var(--color-lavender-bg);
  --color-surface: var(--color-cream-100);
  --color-surface-elevated: #ffffff;
  --color-surface-sunken: var(--color-cream-200);

  /* Borders */
  --color-border: rgba(17,20,24,0.08);
  --color-border-strong: rgba(17,20,24,0.16);
  --color-border-focus: var(--color-navy-900);

  /* Text */
  --color-text: var(--color-navy-900);
  --color-text-secondary: #4b5564;
  --color-text-tertiary: #737c89;
  --color-text-disabled: #a1a8b3;
  --color-text-on-brand: #ffffff;

  /* Brand & accents */
  --color-brand: var(--color-navy-900);
  --color-brand-hover: var(--color-navy-700);
  --color-brand-subtle: #eceef1;

  /* États sémantiques */
  --color-success: var(--color-emerald-500);
  --color-success-bg: var(--color-emerald-50);
  --color-warning: var(--color-amber-500);
  --color-warning-bg: var(--color-amber-50);
  --color-danger: var(--color-rose-500);
  --color-danger-bg: var(--color-rose-50);
  --color-info: var(--color-sky-500);
  --color-info-bg: var(--color-sky-50);
  --color-coaching: var(--color-violet-500);
  --color-coaching-bg: var(--color-violet-50);

  /* Houses (groupes) */
  --color-house-1: var(--color-indigo-500);   /* Northwind / MHSSN style */
  --color-house-2: var(--color-rose-500);     /* Solstice / AMANI style */
  --color-house-3: var(--color-amber-500);    /* Helix / ETIC style */
  --color-house-4: var(--color-emerald-500);  /* Future house 4 */
  --color-house-5: var(--color-violet-500);   /* Future house 5 */

  /* Spacing semantic */
  --space-card-padding: var(--size-5);   /* 20px par défaut */
  --space-card-padding-lg: var(--size-8); /* 32px hero cards */
  --space-card-gap: var(--size-6);        /* 24px entre cartes */
  --space-element-gap: var(--size-4);     /* 16px inter-elements dans une carte */
  --space-form-field-gap: var(--size-2);  /* 8px label-input */
  --space-section-gap: var(--size-12);    /* 48px entre sections */

  /* Radius semantic */
  --radius-button: 10px;
  --radius-input: 10px;
  --radius-chip: var(--radius-full);
  --radius-card: var(--radius-md);
  --radius-card-hero: var(--radius-xl);
  --radius-modal: var(--radius-lg);

  /* Typography semantic */
  --font-family-sans: "Fira Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-script: "Aubrielle", cursive;
  --font-family-numeric-thin: "Sol", "Fira Sans", sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, Consolas, monospace;
}
```

### Niveau C : Component tokens (optionnel pour v0.5)

Si on veut isoler un composant pour theming avancé.

```css
.button {
  --button-bg: var(--color-surface-elevated);
  --button-color: var(--color-text);
  --button-border: var(--color-border);
  /* ... */
}
.button.primary {
  --button-bg: var(--color-brand);
  --button-color: var(--color-text-on-brand);
  --button-border: var(--color-brand);
}
```

### Avantage de cette hiérarchie

Pour changer la couleur primaire d'un tenant :

```css
.tenant-acme {
  --color-brand: #0070f3;
  --color-brand-hover: #0059c9;
  --color-brand-subtle: #e8f4ff;
}
```

→ **3 lignes** modifient l'apparence de toute l'app, pas 50.

## 3. CSS architecture — ITCSS

Inverted Triangle CSS, 7 couches du plus général au plus spécifique :

```
01_settings/    Variables CSS (les 3 niveaux ci-dessus)
02_tools/       (Mixins/fonctions — n/a en CSS pur)
03_generic/     Reset, normalize
04_elements/    h1, p, a, ul (defaults)
05_objects/     .o-grid, .o-stack, .o-cluster (layout primitives)
06_components/  .c-button, .c-card, .c-modal (visuel)
07_utilities/   .u-text-center, .u-mt-4 (overrides)
```

### Naming convention BEM

```css
.c-task-card { /* Block */ }
.c-task-card__title { /* Element */ }
.c-task-card__meta { /* Element */ }
.c-task-card--priority-p0 { /* Modifier */ }
.c-task-card--draggable { /* Modifier */ }
```

### Préfixes

- `c-` components
- `o-` objects (layout primitives)
- `u-` utilities
- `t-` themes / tenant overrides
- `is-` / `has-` states (`.is-active`, `.has-error`)

## 4. Component naming convention

### Fichiers

- HTML : `_shared/components/c-task-card.html` (templating si besoin)
- CSS : co-located ou groupé dans `_shared/components.css`

### Markup

```html
<article class="c-task-card c-task-card--priority-p0" data-task-id="t1">
  <header class="c-task-card__header">
    <span class="c-pill c-pill--house" style="--house-color: var(--color-house-2);">Solstice</span>
    <span class="c-pill c-pill--priority c-pill--priority-p0">P0</span>
  </header>
  <h3 class="c-task-card__title">Renvoyer Attestation Emprunteur</h3>
  <footer class="c-task-card__meta">
    <span class="c-task-card__due">aujourd'hui</span>
    <a class="c-source-link" href="...">
      <svg class="c-icon c-icon--sm"><!-- mail --></svg>
      <span class="c-source-link__label">CA Bretagne</span>
    </a>
  </footer>
</article>
```

## 5. Theming JSON schema (multi-tenant)

```json
{
  "$schema": "https://aiceo.io/schemas/theme.json",
  "tenant": "acme-corp",
  "name": "Acme Corp",
  "logo": {
    "light": "https://...",
    "dark": "https://..."
  },
  "tokens": {
    "color.brand": "#0070f3",
    "color.brand-hover": "#0059c9",
    "color.brand-subtle": "#e8f4ff"
  },
  "houses": [
    { "id": "h1", "name": "Acme Industries", "color": "#0070f3" },
    { "id": "h2", "name": "Acme Capital",    "color": "#10b981" },
    { "id": "h3", "name": "Acme Ventures",   "color": "#f59e0b" }
  ],
  "vocabulary": {
    "entity_singular": "house",
    "entity_plural": "houses"
  }
}
```

Le JSON est appliqué en CSS variables au runtime :

```javascript
function applyTheme(theme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.tokens)) {
    root.style.setProperty('--' + key.replace('.', '-'), value);
  }
}
```

## 6. Performance budget

### Cibles globales

| Métrique | Mobile 3G | Desktop |
|---|---|---|
| LCP | < 2.5s | < 1.5s |
| INP | < 200ms | < 100ms |
| CLS | < 0.05 | < 0.05 |
| TTI | < 4s | < 2s |
| Bundle initial JS | < 100kb | < 200kb |
| Bundle CSS | < 30kb | < 50kb |
| Images per viewport | < 200kb | < 500kb |
| Total page weight | < 500kb | < 1.5mb |

### Stratégies

1. **Critical CSS inline** dans `<head>` (< 14kb).
2. **Code splitting** par route (chaque page charge son JS).
3. **Lazy load** des routes via `<link rel="modulepreload">`.
4. **Preload critical assets** (Fira 400 + 600, logo).
5. **Subset fonts** par locale.
6. **WebP/AVIF** images avec fallback.
7. **SVG sprite** pour les 30 icônes Lucide (1 fichier).
8. **Service worker** avec cache-first sur assets statiques.
9. **Compression** Brotli/gzip côté serveur.
10. **HTTP/2 push** sur les ressources critiques.

## 7. Image optimization

### Pattern recommandé

```html
<picture>
  <source media="(min-width: 1024px)" srcset="hero-1280.avif" type="image/avif">
  <source media="(min-width: 1024px)" srcset="hero-1280.webp" type="image/webp">
  <source media="(min-width: 1024px)" srcset="hero-1280.jpg">
  <source media="(min-width: 640px)" srcset="hero-768.webp" type="image/webp">
  <source media="(min-width: 640px)" srcset="hero-768.jpg">
  <img src="hero-480.jpg" alt="..." loading="lazy" decoding="async" width="480" height="320">
</picture>
```

### Avatars

- **Initiales SVG** par défaut (pas d'image)
- Photo optionnelle : 96×96 max retina, WebP < 10kb

## 8. Font loading strategy

```css
@font-face {
  font-family: "Fira Sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/firasans-400-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153; /* latin */
}

@font-face {
  font-family: "Fira Sans";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/firasans-600-latin.woff2") format("woff2");
}
```

### Preload critical

```html
<link rel="preload" href="/fonts/firasans-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/firasans-600-latin.woff2" as="font" type="font/woff2" crossorigin>
```

### Subset par langue

`firasans-400-latin.woff2` (FR/EN/ES/DE/PT/IT)
`firasans-400-latin-ext.woff2` (PL/CZ/etc.)
`firasans-400-arabic.woff2` (AR)

## 9. SVG sprite pour icônes

Au lieu de 30 SVG inline ou 30 fetch :

```html
<!-- _shared/icons.svg (chargé une fois) -->
<svg style="display: none;">
  <symbol id="icon-home" viewBox="0 0 24 24"><path d="..."/></symbol>
  <symbol id="icon-sun" viewBox="0 0 24 24"><path d="..."/></symbol>
  <!-- ... 30 symbols -->
</svg>

<!-- Usage -->
<svg class="c-icon c-icon--md"><use href="/icons.svg#icon-home"/></svg>
```

Réduction de ~50% du bundle initial vs inline.

## 10. Service Worker (cache strategy)

```javascript
// sw.js
const CACHE_NAME = 'aiceo-v0.5-shell';
const SHELL = [
  '/',
  '/_shared/base.css',
  '/_shared/base.js',
  '/icons.svg',
  '/fonts/firasans-400-latin.woff2',
  '/fonts/firasans-600-latin.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) {
    // Network-first pour API
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first pour assets statiques
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
```

## 11. Error boundaries

Chaque page wrappée dans une `<error-boundary>` qui :
1. Catch les erreurs JS de la page
2. Affiche page d'erreur dégradée
3. Logue l'erreur côté serveur (Sentry-like)
4. Offre [Recharger] et [Signaler]

```html
<error-boundary>
  <main id="content">…</main>
  <template slot="fallback">
    <div class="error-state">
      <svg><!-- alert-triangle --></svg>
      <h2>Quelque chose s'est cassé</h2>
      <p>L'erreur a été enregistrée. Tu peux recharger la page.</p>
      <button onclick="location.reload()">Recharger</button>
      <button>Signaler le bug</button>
    </div>
  </template>
</error-boundary>
```

## 12. Testing strategy

| Niveau | Outil | Cible |
|---|---|---|
| Unit | Vitest | Helpers (i18n, format, validators) |
| Component | Storybook + Chromatic | Visual regression |
| Integration | Vitest + jsdom | Logique métier composants |
| E2E | Playwright | 5 parcours critiques (matin, soir, arbitrage, recherche, settings) |
| Accessibility | axe-core | Toutes les pages |
| Performance | Lighthouse CI | Toutes les pages, budget enforced |

## 13. Versioning & semver

### Tokens CSS

`--token-name` est stable. Renommer = breaking change.

### Components

Components versionnés (atomic design) :
- v1.0.0 : MVP
- v1.x.0 : ajout de variants (non breaking)
- v2.0.0 : breaking (rename props, retrait variants)

### Release notes auto

À chaque release, modale "Quoi de neuf" qui pointe vers le changelog.

## 14. Observability (analytics opt-in)

```javascript
// Telemetry minimal opt-in
if (consent.analytics) {
  track('page.viewed', { page: 'cockpit', tenant: tenantId });
  track('arbitrage.completed', { tasks_count: 28, duration_sec: 180 });
}
```

Strict opt-in. Settings → "Aider à améliorer aiCEO ?" toggle.

## 15. Resume — checklist architecture

- [ ] Tokens en 3 niveaux (primitive / semantic / component)
- [ ] BEM + préfixes c-/o-/u-/t-/is-/has-
- [ ] ITCSS layered
- [ ] Atomic Design 6 niveaux
- [ ] Theming JSON par tenant
- [ ] Critical CSS inline < 14kb
- [ ] Code splitting par route
- [ ] SVG sprite icônes
- [ ] Font subset par locale
- [ ] Service worker cache
- [ ] Error boundaries par page
- [ ] Telemetry opt-in stricte
- [ ] Tests : unit + component + e2e + a11y + perf
