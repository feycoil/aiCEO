# Responsive spec — aiCEO v0.5

> Couverture : desktop / tablette / mobile.
> Cible : Tier 1+2 sur 3 viewports, Tier 3 desktop only en démo (mobile en V1).

## 1. Breakpoints

```css
:root {
  --bp-mobile-sm: 360px;   /* iPhone SE, Galaxy Fold */
  --bp-mobile:    640px;   /* Mobile portrait standard */
  --bp-tablet:    1024px;  /* iPad portrait, mobile landscape */
  --bp-desktop:   1280px;  /* Desktop standard */
  --bp-wide:      1600px;  /* Desktop wide */
}

/* Media queries */
@media (max-width: 639px)              { /* Mobile portrait */ }
@media (min-width: 640px) and (max-width: 1023px) { /* Tablet */ }
@media (min-width: 1024px)             { /* Desktop */ }
@media (min-width: 1600px)             { /* Wide desktop */ }
```

### Tailles cibles maquette

| Viewport | Largeur cible | Hauteur cible |
|---|---|---|
| Mobile | 390 (iPhone 14) | 844 |
| Tablet | 1024 (iPad) | 768 |
| Desktop | 1440 | 900 |

## 2. Stratégie navigation par device

### Mobile (< 640px)

**Bottom-tab nav** : 5 items max + bouton "Plus" pour le reste.

```html
<nav class="bottom-tab-nav">
  <a class="bottom-tab active" href="/"><svg><!-- home --></svg><span>Cockpit</span></a>
  <a class="bottom-tab" href="/taches"><svg><!-- check-square --></svg><span>Tâches</span></a>
  <a class="bottom-tab fab-trigger"><svg><!-- plus circle 32px --></svg></a>
  <a class="bottom-tab" href="/agenda"><svg><!-- calendar --></svg><span>Agenda</span></a>
  <a class="bottom-tab" href="/menu"><svg><!-- menu --></svg><span>Plus</span></a>
</nav>
```

Comportement :
- Hauteur 56px + safe-area-inset-bottom
- Active : couleur `--brand`, label visible
- Bouton central FAB (Floating Action Button) "+" pour création rapide
- "Plus" ouvre un drawer overlay avec tous les items

### Tablette (640-1024px)

**Drawer collapsé 60px par défaut**, avec possibilité d'étendre à 240px (overlay).

- Hauteur full
- Tooltips on hover sur items (lib JS minimaliste)
- Bouton "Étendre" en bas pour expand temporaire (overlay sur le contenu, pas push)

### Desktop (≥ 1024px)

**Drawer 240px expanded** par défaut, collapsible 60px.

Comme déjà spécifié en v2.

## 3. Touch targets & gestures

### Tailles minimum

- Mobile/tablette tactile : **48×48 px minimum** (Material) / 44×44 px iOS
- Desktop souris : 32×32 px minimum (mais pour cohérence on garde 44+ partout)

### Spacing entre éléments tactiles

- Minimum 8 px entre 2 cibles tactiles
- Idéal 16 px

### Gestures supportées

| Geste | Action |
|---|---|
| **Swipe gauche** sur task card | Reveal actions (delete, archive, étoile) |
| **Swipe droite** sur task card | Marquer done |
| **Long-press** (500ms) sur card | Ouvrir mode édition |
| **Pinch** sur agenda | Zoom semaine ↔ jour |
| **Pull-to-refresh** sur listes | Refresh sync |
| **Swipe down** sur modal/sheet | Fermer |
| **Swipe gauche/droite** entre buckets arbitrage | Changer de colonne |

## 4. Layout adaptations par page

### 4.1 Cockpit (index.html)

**Desktop** (1440px) :
- 3 col grid (Carte Matin 44% / Carte Soir 28% / Big Rocks 28%)
- Compteurs en bas, 4 col

**Tablette** (1024px) :
- 2 col grid (Carte Matin 50% / [Carte Soir + Big Rocks stack 50%])
- Compteurs en bas, 4 col (smaller)

**Mobile** (390px) :
- 1 col stack vertical
- Carte Matin pleine largeur
- Big Rocks → carrousel horizontal swipeable
- Carte Soir
- Compteurs en grid 2x2
- Pas de drawer visible (bottom-tab nav à la place)

### 4.2 Arbitrage (arbitrage.html)

**Desktop** :
- 3 col (Faire / Déléguer / Reporter) + side panel mails 280px
- Drag-drop horizontal entre colonnes

**Tablette** :
- 3 col stack mais plus serré
- Side panel mails passe en bottom panel (collapse)

**Mobile** :
- Tabs horizontaux : Faire (3) | Déléguer (5) | Reporter (12)
- Une colonne visible à la fois
- Swipe gauche/droite pour changer
- FAB "Valider" persistante en bas
- Mails accessibles via icône 📧 en haut (drawer overlay)

### 4.3 Evening (evening.html)

**Desktop / Tablette** :
- 2 col : sliders + champ libre 60% / Streak hero + heatmap 40%

**Mobile** :
- 1 col stack
- Streak hero en haut (impactant)
- Sliders puis champ libre
- Top 3 demain en bas

### 4.4 Tâches (taches.html)

**Desktop** :
- Toggle Liste / Eisenhower
- Filtres en sticky bar top
- Liste en 1 col plein largeur (table-like)
- Eisenhower en grid 2x2

**Tablette** :
- Identique desktop
- Filtres scrollables horizontalement si trop nombreux

**Mobile** :
- Toggle Liste seulement (pas Eisenhower)
- Eisenhower remplacé par "Vue par quadrant" : un quadrant à la fois avec filtre chip horizontal
- Cards taches en 1 col
- Filtres dans un sheet bottom (icône `filter`)

### 4.5 Agenda (agenda.html)

**Desktop** :
- Vue semaine 7 jours × heures
- Sticky col "Aujourd'hui"

**Tablette** :
- Vue semaine 7 jours mais compactée
- Possibilité bascule vue jour

**Mobile** :
- **Vue jour** par défaut (pas semaine)
- Header sticky : date du jour + chevrons jour précédent/suivant
- Liste des events 1 col chronologique
- Tab "Aujourd'hui / Demain / Cette semaine" en haut

### 4.6 Revues (revues.html)

**Desktop / Tablette** :
- Sidebar historique 24% + main 76%

**Mobile** :
- 1 col, historique en bas (collapse)
- Big Rocks en carrousel
- Bilan champ libre pleine largeur
- Cap S+1 en bas

### 4.7 Assistant chat (assistant.html)

**Desktop** :
- Sidebar conversations 24% + chat main 76%

**Tablette** :
- Sidebar collapsable (overlay)

**Mobile** :
- Plein écran chat
- Sidebar accessible via icône liste en haut-gauche
- Input bottom sticky avec safe-area

### 4.8 Onboarding (onboarding.html)

**Mobile-first design** :
- 1 col stack
- Hero illustration 200px
- Question + réponse
- Footer sticky : back / next / progress dots

**Desktop** :
- Centré 480px
- Animation slide entre étapes

### 4.9 Settings (settings.html)

**Desktop** :
- Sidebar onglets 200px + main 1000px

**Tablette / Mobile** :
- Liste sectionsclickable → drill-down
- Back arrow pour revenir

## 5. PWA (Progressive Web App)

### manifest.webmanifest

```json
{
  "name": "aiCEO — Cockpit CEO",
  "short_name": "aiCEO",
  "description": "Le copilote du CEO multi-entités",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#111418",
  "background_color": "#a9adbe",
  "icons": [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ],
  "shortcuts": [
    {"name": "Arbitrage matinal", "url": "/arbitrage", "icons": [...]},
    {"name": "Boucle du soir", "url": "/evening", "icons": [...]}
  ]
}
```

### Service worker (cache strategy)

- Cache-first : assets statiques (CSS, fonts, JS, icônes)
- Network-first : API calls (avec timeout 3s puis fallback cache)
- Network-only : auth, payments

### Install prompt

iOS Safari : modal one-time "Ajouter à l'écran d'accueil" (custom, car iOS n'a pas de prompt natif).
Chrome/Edge : `beforeinstallprompt` event capturé + bouton custom dans settings.

### Splash screen

iOS : `apple-touch-icon` + `apple-touch-startup-image` par taille de device.
Android : auto-généré via manifest.

## 6. Safe-area insets

```css
:root {
  --safe-top: env(safe-area-inset-top, 0);
  --safe-bottom: env(safe-area-inset-bottom, 0);
  --safe-left: env(safe-area-inset-left, 0);
  --safe-right: env(safe-area-inset-right, 0);
}

.app-shell {
  padding-top: max(16px, var(--safe-top));
  padding-bottom: max(16px, var(--safe-bottom));
}

.bottom-tab-nav {
  padding-bottom: max(8px, var(--safe-bottom));
}
```

Gère :
- Notch iPhone X+
- Dynamic Island iPhone 14 Pro
- Gesture bar Android
- iPad keyboard

## 7. Viewport units modernes

```css
.fullscreen-modal {
  height: 100dvh; /* dynamic viewport height — gère barres mobile */
  /* fallback : */
  height: 100vh;
}
```

`dvh` au lieu de `vh` pour éviter le bug iOS Safari où la barre URL fait sauter le layout.

## 8. Performance budget

### Cibles

| Métrique | Cible mobile (3G slow) | Cible desktop |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.0s |
| **INP** (Interaction to Next Paint) | < 200ms | < 100ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.05 |
| **TTI** (Time To Interactive) | < 4s | < 2s |
| Bundle initial JS | < 100kb | < 200kb |
| Bundle CSS | < 30kb | < 50kb |
| Images per viewport | < 200kb total | < 500kb total |

### Stratégies

- **Critical CSS inline** (< 14kb)
- **Lazy load** des routes (code-split par page)
- **Lazy load** des images below-the-fold
- **Preload** uniquement les fonts critiques (Fira 400 + 600)
- **Subset fonts** par locale (latin-fr / latin-en)
- **WebP/AVIF** avec fallback JPEG
- **SVG sprite** pour les 30 icônes Lucide (1 fichier)
- **Service worker** avec cache aggressive

### Tools de mesure

Lighthouse, WebPageTest, Real User Monitoring (RUM) opt-in.

## 9. Image optimization

### Sizes par viewport

| Type | Mobile | Tablet | Desktop |
|---|---|---|---|
| Avatar 48px | 96×96 (retina) | 96×96 | 96×96 |
| Hero illustration | 600px wide | 800px | 1200px |
| Logo | 64×64 | 96×96 | 128×128 |

### `<picture>` responsive

```html
<picture>
  <source media="(min-width: 1024px)" srcset="hero-desktop.avif" type="image/avif">
  <source media="(min-width: 1024px)" srcset="hero-desktop.webp" type="image/webp">
  <source media="(min-width: 1024px)" srcset="hero-desktop.jpg">
  <source media="(min-width: 640px)" srcset="hero-tablet.webp" type="image/webp">
  <source media="(min-width: 640px)" srcset="hero-tablet.jpg">
  <img src="hero-mobile.jpg" alt="..." loading="lazy" width="600" height="400">
</picture>
```

## 10. FAB (Floating Action Button) mobile

Pattern Material/iOS pour création rapide.

```css
.fab {
  position: fixed;
  bottom: calc(16px + 56px + var(--safe-bottom)); /* au-dessus du bottom-tab */
  right: 16px;
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  display: grid; place-items: center;
  box-shadow: var(--shadow-pop);
  z-index: 30;
  transition: transform 200ms var(--ease-spring);
}
.fab:active { transform: scale(0.92); }
.fab svg { width: 24px; height: 24px; }
```

Sur mobile : FAB "Nouvelle tâche" globale, accessible depuis toutes les pages sauf onboarding/settings.

## 11. Bottom sheets (mobile)

Remplacent les modals desktop pour les actions secondaires.

```css
.bottom-sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--surface-2);
  border-radius: 20px 20px 0 0;
  padding: 24px 16px max(24px, var(--safe-bottom));
  box-shadow: var(--shadow-pop);
  transform: translateY(100%);
  transition: transform 300ms var(--ease-out);
  z-index: 200;
}
.bottom-sheet.open { transform: translateY(0); }

.bottom-sheet-handle {
  width: 36px; height: 4px;
  background: var(--text-3);
  border-radius: 2px;
  margin: 0 auto 16px;
  opacity: 0.4;
}
```

Swipe-to-dismiss : 50% de hauteur dépassée vers le bas → close.

## 12. Sticky headers mobile

```css
.mobile-page-header {
  position: sticky;
  top: var(--safe-top);
  background: var(--surface);
  padding: 12px 16px;
  display: flex; align-items: center; gap: 12px;
  z-index: 10;
  border-bottom: 1px solid var(--border);
}
```

Avec back arrow + titre + actions.

## 13. Pull-to-refresh

```html
<div class="pull-to-refresh" data-listener="taches">
  <div class="ptr-spinner"><svg><!-- loader-2 --></svg></div>
</div>
<ul class="task-list">…</ul>
```

JS : `touchstart` + `touchmove` calcule la distance, déclenche refresh si > 60px tiré.

## 14. Orientation handling

### Portrait (recommandé)

Tous les layouts optimisés pour portrait.

### Landscape mobile

Affichage dégradé acceptable. Pas de mockup dédié dans la maquette v0.5.
Banner discret : "App optimisée portrait" avec rotation icon.

### Landscape iPad

Layout type "tablet" (drawer 60px collapsed + content full).

## 15. Vues à livrer dans la maquette

| Page | Desktop | Tablet | Mobile | Total |
|---|---|---|---|---|
| index.html (cockpit) | ✅ + 1 état critique + 1 evening saliance | ✅ | ✅ + 1 mobile-night | 6 |
| arbitrage.html | ✅ + 1 loading | ✅ | ✅ + 1 friction-positive (5 P0) | 6 |
| evening.html | ✅ + 1 streak-celebration | ✅ | ✅ + 1 streak-break | 6 |
| taches.html | ✅ + 1 empty | ✅ | ✅ + 1 quadrant-mobile | 6 |
| agenda.html | ✅ + 1 error-outlook | ✅ | ✅ + 1 vue-jour-mobile | 6 |
| revues.html | ✅ + 1 mirror-moment | ✅ | ✅ + 1 draft-streaming | 6 |
| assistant.html | ✅ + 1 streaming + 1 coach-prompt | ✅ | ✅ + 1 mobile-fullscreen | 6 |
| groupes.html | ✅ + 1 kpi-loading | ❌ | ❌ | 2 |
| projets.html | ✅ + 1 filter-active | ❌ | ❌ | 2 |
| projet.html | ✅ + 1 tab-decisions-empty | ❌ | ❌ | 2 |
| contacts.html | ✅ + 1 empty-search | ❌ | ❌ | 2 |
| decisions.html | ✅ + 1 reco-loading | ❌ | ❌ | 2 |
| onboarding.html | ✅ étape 3 | ❌ | ✅ étape 3 | 2 |
| settings.html | ✅ + 1 EN locale + 1 RTL | ❌ | ✅ | 4 |
| components.html | ✅ | ❌ | ❌ | 1 |
| index-nav.html | ✅ | ✅ | ✅ | 3 |

**Total : ~62 vues** (plus dense que prévu, donc on intègre le critère §16 du prompt v3 : Claude Design livre par vagues).
