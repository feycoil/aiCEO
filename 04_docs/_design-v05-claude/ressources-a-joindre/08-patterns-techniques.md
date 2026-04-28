# Patterns techniques & interactions — aiCEO v0.5

> Couvre les patterns interactionnels, motion, charts, command palette, source-link, dirty-state.
> Source : extraction `01_app-web/assets/app.js` (1425 lignes) + bonnes pratiques.

## Sommaire

1. Motion system (durations, easings, patterns)
2. Drag & drop (arbitrage, Eisenhower)
3. Iconographie (Lucide)
4. Type system élargi
5. Spacing scale
6. Charts (6 patterns SVG)
7. Command palette ⌘K
8. Source-link rendering
9. Dirty state / auto-save
10. Streaming SSE rendering
11. Drawer collapse pattern
12. Accessibility patterns
13. Formats FR (date/heure/montant)
14. Keyboard shortcuts
15. Index navigation page

---

## 1. Motion system

### Durations scale

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | 100ms | Hover, micro-feedback |
| `--duration-snap` | 120ms | Buttons, transitions courantes |
| `--duration-smooth` | 200ms | Modals, dropdowns, overlays |
| `--duration-deliberate` | 300ms | Drawer collapse, page transitions |
| `--duration-celebration` | 600ms | Success states, ring fills, streak |

### Easings

| Token | Value | Usage |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default — expansion, apparition |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.6, 1)` | Slides, déplacements |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Streak celebration, drop snap |

### Patterns standards

```css
/* Hover card */
.card:hover{ transform: translateY(-1px); box-shadow: var(--shadow-pop); transition: all var(--duration-smooth) var(--ease-out); }

/* Modal in */
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
.modal{ animation: modal-in var(--duration-smooth) var(--ease-out); }

/* Drawer collapse */
.drawer{ transition: width var(--duration-deliberate) var(--ease-in-out); }

/* Skeleton pulse */
@keyframes skel-pulse{ 0%, 100%{ opacity: 0.4; } 50%{ opacity: 0.7; } }
.skel{ animation: skel-pulse 1.5s ease-in-out infinite; }

/* Streak celebration */
@keyframes ring-fill{
  from { stroke-dashoffset: 175.93; }
  to   { stroke-dashoffset: 105.56; }
}
.ring-celebrate circle:nth-child(2){ animation: ring-fill var(--duration-celebration) var(--ease-spring); }
```

### Reduce motion

OBLIGATOIRE sur toutes les animations :

```css
@media (prefers-reduced-motion: reduce){
  *, *::before, *::after{
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .skel{ animation: none; opacity: 0.55; }
}
```

---

## 2. Drag & drop (arbitrage + Eisenhower)

### Pattern visuel

Pendant le drag :
- **Ghost** (élément suit le curseur) : opacity 0.7, transform scale(1.02) rotate(1deg), shadow `--shadow-pop`, cursor `grabbing`
- **Élément origine** : opacity 0.3 (placeholder)
- **Drop zones valides** : background `--emerald-bg`, border 2px dashed `--emerald`, transition 120ms
- **Drop zone hover** (curseur dessus) : background `--emerald-bg` plus saturé + border solid

Au drop :
- **Animation snap** : translate from cursor to final position 200ms `--ease-spring`
- **Toast success** : "Tâche déplacée vers Faire"

### HTML structure (arbitrage)

```html
<div class="arbitrage-grid">
  <section class="arbitrage-col" data-bucket="faire">
    <header class="arbitrage-col-header">
      <h3>FAIRE</h3>
      <span class="pill priority p0">Top 3</span>
    </header>
    <ul class="arbitrage-list" data-droptarget="faire">
      <li class="task-card" draggable="true" data-task-id="t1">
        <div class="task-handle"><svg><!-- lucide grip-vertical --></svg></div>
        <div class="task-content">
          <span class="pill group-pill"><span class="dot" style="background: var(--rose);"></span>AMANI</span>
          <h4 class="task-title">Renvoyer Attestation Emprunteur à Marie Ansquer</h4>
          <div class="task-meta">
            <span class="pill priority p0">P0</span>
            <span class="task-due">aujourd'hui</span>
            <span class="task-source"><svg><!-- mail --></svg> mail CA Bretagne</span>
          </div>
        </div>
      </li>
    </ul>
  </section>
  <!-- Colonnes DÉLÉGUER, REPORTER -->
</div>
```

### Comportement clavier (accessibility)

Alternative au drag à la souris :
- Tab pour focus task card
- Espace pour "saisir" (visuel : card lifted + border brand)
- Flèche gauche/droite pour changer de colonne
- Espace pour "déposer"
- Esc pour annuler

### CSS

```css
.arbitrage-grid{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
.arbitrage-col{ background: var(--surface); border-radius: var(--radius); padding: 16px; min-height: 400px; }
.arbitrage-col[data-droptarget].dragover{
  background: var(--emerald-bg);
  outline: 2px dashed var(--emerald);
  outline-offset: -2px;
}
.task-card{
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all var(--duration-snap) var(--ease-out);
  display: flex; align-items: flex-start; gap: 10px;
}
.task-card:hover{ border-color: var(--border-strong); transform: translateY(-1px); }
.task-card.dragging{
  opacity: 0.3;
  cursor: grabbing;
}
.task-card.drag-ghost{
  opacity: 0.7;
  transform: scale(1.02) rotate(1deg);
  box-shadow: var(--shadow-pop);
  cursor: grabbing;
  z-index: 100;
}
.task-card.keyboard-grabbed{
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-50);
}
```

### Drop indicator (insertion line entre tâches)

Pour le réordonnancement à l'intérieur d'une colonne :
- Ligne 2px solide `--brand` qui apparaît au-dessus/dessous de la position cible
- Animation `--duration-snap`

---

## 3. Iconographie (Lucide OBLIGATOIRE)

### Bibliothèque

**Lucide** (https://lucide.dev) — chargé via CDN UMD :

```html
<script src="https://unpkg.com/lucide@latest"></script>
<script>lucide.createIcons();</script>
```

Ou inline : copier le SVG depuis lucide.dev et coller.

### Specs visuelles

- **stroke-width: 1.5** partout
- **stroke: currentColor** (hérite du parent)
- **fill: none** sauf cas explicite (ex : star fill jaune pour favori)

### Tailles standardisées

| Token | Size | Usage |
|---|---|---|
| `--icon-xs` | 12px | Inline texte caption |
| `--icon-sm` | 14px | Inline body, chips |
| `--icon-md` | 16px | Boutons, status indicators |
| `--icon-lg` | 20px | Drawer, headers |
| `--icon-xl` | 24px | Hero, stat-hero, illustrations |

### Inventaire des 30 icônes utilisées

**Drawer (12)** : `home`, `sun`, `moon`, `check-square`, `calendar`, `refresh-cw`, `message-circle`, `briefcase`, `folder`, `users`, `git-branch`, `settings`

**Topbar (5)** : `search`, `bell`, `user`, `chevron-down`, `command`

**Status / actions (10)** : `check`, `x`, `chevron-right`, `chevron-down`, `more-horizontal`, `plus`, `edit`, `trash-2`, `archive`, `external-link`

**Sources / source-link (5)** : `mail`, `calendar-clock`, `folder-open`, `git-pull-request`, `link`

**States (5)** : `alert-circle`, `check-circle`, `info`, `loader-2`, `wifi-off`

**Empty states (3)** : `inbox` (taches empty), `coffee` (boucle soir empty), `search-x` (search empty)

### Empty state illustrations

PAS d'illustration personnalisée. Utiliser une icône Lucide `xl` (32-48px) en `--text-3` opacity 0.5, centrée, accompagnée d'un texte court.

```html
<div class="empty-state">
  <svg width="48" height="48" style="color: var(--text-3); opacity: 0.5;"><!-- lucide inbox --></svg>
  <h3>Aucune tâche en attente</h3>
  <p>Profite. La prochaine arrive toujours assez vite.</p>
  <button class="btn">Importer depuis Outlook</button>
</div>
```

```css
.empty-state{
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 24px;
  text-align: center;
  gap: 12px;
}
.empty-state h3{ font-size: 16px; font-weight: 600; margin: 0; color: var(--text); }
.empty-state p{ font-size: 13px; color: var(--text-3); margin: 0; max-width: 280px; }
.empty-state .btn{ margin-top: 16px; }
```

---

## 4. Type system élargi

### Échelle complète avec line-height

| Token | Family | Size | Weight | Line-height | Usage |
|---|---|---|---|---|---|
| `--type-script-hero` | Aubrielle | 64px | 400 | 1.0 | Salutations cockpit (rare) |
| `--type-script` | Aubrielle | 44px | 400 | 1.1 | Hero rituel matin/soir |
| `--type-stat-hero` | Sol | 64px | 100 | 1.0 | Streak, KPIs ouverts |
| `--type-stat-md` | Sol | 32px | 100 | 1.1 | Mid-stat KPI tinted |
| `--type-display` | Fira | 32px | 700 | 1.15 | Titres de page |
| `--type-h1` | Fira | 22px | 600 | 1.3 | Titres cartes hero |
| `--type-h2` | Fira | 18px | 600 | 1.4 | Sous-titres |
| `--type-h3` | Fira | 15px | 600 | 1.45 | Titres cartes default |
| `--type-lead` | Fira | 14px | 500 | 1.55 | Intro/lead paragraphes |
| `--type-body` | Fira | 14px | 400 | 1.5 | Corps |
| `--type-sm` | Fira | 13px | 500 | 1.4 | Meta cards, captions |
| `--type-xs` | Fira | 12px | 500 | 1.3 | Badges, chips |
| `--type-eyebrow` | Fira | 11px | 700 | 1.2 | Eyebrows uppercase letter-spacing 0.06em |
| `--type-mono` | ui-monospace | 13px | 400 | 1.4 | IDs, code, kbd |

### Règles d'usage strictes

1. **Aubrielle** : SEUL pour salutations + hero rituels (≥36px). Jamais inline. Jamais en uppercase. Toujours en fr ("Bonjour Feycoil,").
2. **Sol** : SEUL pour chiffres ouverts ≥28px (streaks, KPIs hero, compteurs grands). Jamais pour du texte.
3. **Fira** : tout le reste. Tabular-nums sur tous chiffres.
4. **Mono** : IDs (t1, e9, c3, w17), shortcuts (`⌘K`), code.

### Casings

- **Eyebrows** : UPPERCASE 11px letter-spacing 0.06em (rare, sections eyebrow only — ex : kpi-label)
- **Titres** : Title Case
- **Body, buttons, chips** : casse normale
- **Status pills** : Title Case (ex: "Actif", "Hot", "Nouveau")

### Numerique tabulaire

```css
:root{
  font-family: "Fira Sans", -apple-system, ..., sans-serif;
  font-feature-settings: "kern", "liga", "calt";
}

/* Partout où un chiffre apparaît */
.tabular, .kpi-value, .stat-hero-value, .task-due, .progress-meta, td.num{
  font-variant-numeric: tabular-nums;
}
```

---

## 5. Spacing scale

### Tokens

```css
:root{
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;   /* spacing inter-elements dans une carte */
  --space-5: 20px;
  --space-6: 24px;   /* gouttiere entre cartes */
  --space-8: 32px;   /* padding interne carte hero */
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;  /* marges sections */
}
```

### Règles d'application

| Contexte | Spacing |
|---|---|
| Padding carte hero | `--space-8` (32px) |
| Padding carte default | `--space-5` (20px) |
| Padding carte compact | `--space-3` (12px) |
| Gap inter-cards (grid) | `--space-6` (24px) |
| Gap inter-sections (page) | `--space-12` (48px) |
| Gap label + valeur (form field) | `--space-2` (8px) |
| Gap title + subtitle (card-header) | `--space-1` (4px) |
| Gap inset cluster (icon + texte) | `--space-3` (12px) |
| Padding boutons md | `--space-2 --space-4` (8px 16px) |

---

## 6. Charts (6 patterns SVG)

### Règle absolue

**Implémentation : SVG inline UNIQUEMENT**. Pas de Chart.js / Recharts / D3 en maquette.
**Couleurs : tokens DS exclusivement**. Pas de palette par défaut.
**Animation : aucune sur charts statiques** (pas de "growth on enter").

### Pattern 1 — Vertical line + dot (style Twisty Income Tracker)

Pour : charge tâches semaine, streak month visualisation.

```html
<svg viewBox="0 0 320 180" class="chart-vertical-dots" aria-label="Charge tâches semaine">
  <!-- Lignes verticales -->
  <line x1="40" y1="40" x2="40" y2="160" stroke="var(--text-3)" stroke-width="1" opacity="0.3"/>
  <line x1="80" y1="60" x2="80" y2="160" stroke="var(--text-3)" stroke-width="1" opacity="0.3"/>
  <!-- ... -->
  <!-- Dots -->
  <circle cx="40" cy="40" r="4" fill="var(--text-3)"/>
  <circle cx="80" cy="60" r="4" fill="var(--text-3)"/>
  <!-- Dot actif (jour courant) -->
  <circle cx="160" cy="20" r="6" fill="var(--brand)"/>
  <!-- Pill callout valeur -->
  <g transform="translate(160, 0)">
    <rect x="-22" y="-18" width="44" height="22" rx="11" fill="var(--brand)"/>
    <text x="0" y="-3" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">28</text>
  </g>
  <!-- Day labels (chips) -->
  <g class="day-labels" transform="translate(0, 175)">
    <circle cx="40" cy="0" r="14" fill="var(--surface-3)"/>
    <text x="40" y="4" text-anchor="middle" font-size="11" font-weight="500">L</text>
    <!-- ... -->
    <circle cx="160" cy="0" r="14" fill="var(--brand)"/>
    <text x="160" y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">J</text>
  </g>
</svg>
```

### Pattern 2 — Vertical bars minimal (style Twisty Proposal Progress)

Pour : compteurs cockpit (tâches, décisions, RDV, mails).

```html
<svg viewBox="0 0 240 80" class="chart-bars">
  <g transform="translate(0,0)">
    <rect x="2" y="20" width="2" height="60" fill="var(--brand)"/>
    <rect x="6" y="30" width="2" height="50" fill="var(--brand)"/>
    <!-- ... -->
  </g>
</svg>
```

Couleurs alternées : moitié `--brand` navy, moitié `--rose` pour différenciation visuelle (cf. Twisty).

### Pattern 3 — Linear progress bar (Big Rocks, projets)

Voir composants §8.

### Pattern 4 — Circular ring (streak month, completion projet)

Voir composants §8.

### Pattern 5 — Calendar heatmap (30j streak du soir)

```html
<svg viewBox="0 0 224 56" class="chart-heatmap" aria-label="Streak du soir 30 derniers jours">
  <!-- 30 cellules 6x5 -->
  <g class="heatmap-cell" transform="translate(0,0)">
    <rect x="0" y="0" width="20" height="20" rx="4" fill="var(--emerald)" data-day="2026-03-28"/>
  </g>
  <g class="heatmap-cell" transform="translate(28,0)">
    <rect x="0" y="0" width="20" height="20" rx="4" fill="var(--emerald)" data-day="2026-03-29"/>
  </g>
  <!-- Jour manqué -->
  <g class="heatmap-cell" transform="translate(56,0)">
    <rect x="0" y="0" width="20" height="20" rx="4" fill="var(--surface-3)" data-day="2026-03-30"/>
  </g>
  <!-- ... -->
</svg>
```

Tooltip on hover : "26/04 — Bilan fait, humeur bien, énergie 4/5".

### Pattern 6 — Sparkline (tendances mini)

```html
<svg viewBox="0 0 80 24" class="sparkline" aria-label="Tendance 7 derniers jours">
  <polyline
    points="0,18 13,12 26,15 40,8 53,10 66,4 80,6"
    fill="none"
    stroke="var(--emerald)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

---

## 7. Command palette ⌘K

### Pattern complet (déjà partiellement dans 01_app-web)

Trigger :
- Raccourci clavier `⌘K` (Mac) / `Ctrl+K` (Windows)
- Click sur la search-pill du header
- Raccourci `/` (focus search)

Structure visuelle :
- Backdrop blur + opacity 0.32
- Position : top 15vh, centré, width 640px
- Animation : fade + scale 0.96→1, 200ms

### HTML

```html
<div class="palette-backdrop" role="dialog" aria-modal="true" aria-labelledby="palette-input">
  <div class="palette">
    <input
      class="palette-input"
      id="palette-input"
      type="text"
      placeholder="Rechercher tâches, projets, contacts, décisions…"
      aria-label="Recherche globale"
      autofocus>
    <div class="palette-results" role="listbox">
      <!-- Groupe Tâches -->
      <div class="palette-group-label">Tâches (3)</div>
      <button class="palette-item selected" role="option">
        <div class="palette-item-icon"><svg><!-- check-square --></svg></div>
        <div>
          <div class="palette-item-label">Renvoyer Attestation Emprunteur à Marie Ansquer</div>
          <div class="palette-item-sub">AMANI · P0 · aujourd'hui</div>
        </div>
        <kbd class="palette-item-kbd">↵</kbd>
      </button>
      <!-- Groupe Contacts -->
      <div class="palette-group-label">Contacts (2)</div>
      <button class="palette-item" role="option">
        <div class="palette-item-icon">
          <span class="avatar sm" data-color="amani">MA</span>
        </div>
        <div>
          <div class="palette-item-label">Marie Ansquer</div>
          <div class="palette-item-sub">CA Bretagne · banque</div>
        </div>
      </button>
      <!-- Groupe Projets, Décisions, RDV similaires -->
    </div>
    <div class="palette-footer">
      <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
      <span><kbd>↵</kbd> ouvrir</span>
      <span><kbd>esc</kbd> fermer</span>
    </div>
  </div>
</div>
```

### CSS (déjà dans app.css 01_app-web — réutiliser)

Voir lignes 678-720 de `01_app-web/assets/app.css`.

### Comportements

- Frappe = filtre debounce 100ms
- Flèches haut/bas = navigation entre items, scroll auto
- Enter = ouvrir l'item sélectionné (route vers la page concernée)
- Esc = ferme la palette, focus restitué au déclencheur
- Click sur backdrop = ferme

### Groupes de résultats

Affichés dans cet ordre, max 5 items par groupe :
1. **Tâches** (icône check-square)
2. **Contacts** (avatar)
3. **Projets** (icône folder)
4. **Décisions** (icône git-branch)
5. **RDV** (icône calendar-clock)

---

## 8. Source-link rendering

### Pattern visuel

Petit chip cream `--surface-3` avec icône + label tronqué + chevron, hover state.

```html
<a class="source-link" href="outlook://...">
  <svg class="source-icon" width="14" height="14"><!-- lucide mail --></svg>
  <span class="source-label">URGENT AMANI / Contrat Crédits 02/04</span>
  <svg class="source-chevron" width="12" height="12"><!-- chevron-right --></svg>
</a>
```

```css
.source-link{
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  background: var(--surface-3);
  border-radius: 999px;
  font-size: 12px;
  color: var(--text-2);
  max-width: 280px;
  cursor: pointer;
  transition: all .12s;
}
.source-link:hover{ background: var(--brand-50); color: var(--text); }
.source-icon{ flex-shrink: 0; color: var(--text-3); }
.source-label{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.source-chevron{ flex-shrink: 0; opacity: 0.5; }
.source-link:hover .source-chevron{ opacity: 1; }
```

### Types de source (icônes)

| Type | Icon Lucide |
|---|---|
| mail | `mail` |
| event | `calendar-clock` |
| project | `folder-open` |
| decision | `git-branch` |
| issue github | `git-pull-request` |
| url externe | `external-link` |

---

## 9. Dirty state / auto-save

### Pattern

Pas de bouton "Save" explicit pour les champs textes longs (note du jour, bilan revue, draft message assistant).

Workflow :
1. User tape dans un champ
2. Au bout de **1 seconde** sans frappe : déclenchement save automatique
3. Pendant le save : indicateur "Enregistrement…" en bas-droite (`<span>` discret)
4. Save réussi : indicateur change en "Enregistré · il y a 2 s" (timer relatif), reste 4s puis disparaît
5. Save échoué : toast error + bouton "Réessayer"

### HTML

```html
<div class="autosave-indicator">
  <span class="autosave-status saving">
    <svg class="spin" width="12" height="12"><!-- loader-2 --></svg>
    Enregistrement…
  </span>
</div>
<!-- Devient -->
<div class="autosave-indicator">
  <span class="autosave-status saved">
    <svg width="12" height="12"><!-- check --></svg>
    Enregistré · il y a 2 s
  </span>
</div>
```

```css
.autosave-indicator{ position: fixed; bottom: 24px; right: 24px; pointer-events: none; }
.autosave-status{
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12px; color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.autosave-status.saving svg{ animation: spin 1s linear infinite; color: var(--sky); }
.autosave-status.saved svg{ color: var(--emerald); }
@keyframes spin{ to{ transform: rotate(360deg); } }
```

---

## 10. Streaming SSE rendering (assistant chat)

### Pattern

Le backend pousse via Server-Sent Events :
```
event: text
data: {"text": "Voici une "}

event: text
data: {"text": "proposition d'ODJ "}

event: done
data: {"id": "msg-uuid"}
```

### Rendu front

- **Avant le 1er chunk** : skeleton bubble avec 3 lignes pulse (~2s)
- **Pendant streaming** : append du texte chunk-par-chunk, **curseur clignotant** en fin de bubble
- **Auto-scroll** vers le bas à chaque chunk (sauf si user a scrollé manuellement vers le haut)
- **Bouton "Arrêter génération"** visible pendant le streaming (au-dessus du curseur, btn ghost rose)
- **Fin (event:done)** : curseur disparaît, footer apparaît avec "il y a X s · Sources : [chips]"

```html
<!-- Bubble assistant streaming -->
<div class="message assistant streaming">
  <div class="message-content">
    Voici une proposition d'ODJ structurée pour le CoPil du 28/04...
    <span class="streaming-cursor">▋</span>
  </div>
  <button class="btn danger sm streaming-stop">
    <svg><!-- square --></svg> Arrêter
  </button>
</div>
```

```css
.streaming-cursor{
  display: inline-block;
  width: 2px; height: 1em;
  background: var(--brand);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 1s infinite;
}
@keyframes cursor-blink{
  0%, 50%{ opacity: 1; }
  51%, 100%{ opacity: 0; }
}
.streaming-stop{
  margin-top: 8px;
  font-size: 11px; padding: 4px 10px;
}
```

### Reconnexion

Si la connexion SSE coupe :
- Affichage discret en haut de la zone chat : `⚠ Reconnexion en cours…` (banner sky)
- Backoff exponentiel : 1s, 2s, 4s, 8s, 16s, 30s plafond
- Si succès : banner devient success "Reconnecté" pendant 1s puis disparaît
- Si échec définitif (>30s) : banner error + bouton "Recharger la page"

---

## 11. Drawer collapse pattern

### Specs

- **Mode étendu** : 240px width
- **Mode collapse** : 60px width
- **Toggle** : bouton chevron-left/right en bas du drawer (au-dessus de Réglages)
- **Persistance** : mémorisée dans `localStorage["aiCEO.uiPrefs.drawerCollapsed"]` (la SEULE clé localStorage autorisée par l'ADR S2.00 / S4.00)
- **Animation** : `width 300ms cubic-bezier(0.4, 0, 0.6, 1)`
- **Tooltips** sur les items en mode collapse (label complet en hover)
- **Transition labels** : opacity 0→1 200ms avec delay 150ms (pour qu'ils n'apparaissent qu'après l'élargissement)

### HTML

```html
<aside class="drawer" data-collapsed="false" aria-label="Navigation principale">
  <div class="drawer-header">
    <a class="drawer-logo" href="/">
      <span class="logo-mark">A</span>
      <span class="logo-text">aiCEO</span>
    </a>
  </div>

  <nav class="drawer-nav">
    <ul class="drawer-section">
      <li><a class="drawer-item active" href="/" data-tooltip="Cockpit">
        <svg class="drawer-icon"><!-- lucide home --></svg>
        <span class="drawer-label">Cockpit</span>
      </a></li>
      <li><a class="drawer-item" href="/arbitrage" data-tooltip="Arbitrage matinal">
        <svg class="drawer-icon"><!-- lucide sun --></svg>
        <span class="drawer-label">Arbitrage matinal</span>
        <span class="drawer-badge">28</span>
      </a></li>
      <!-- ... 10 autres items -->
    </ul>
    <hr class="drawer-sep">
    <ul class="drawer-section">
      <!-- Registres -->
    </ul>
  </nav>

  <div class="drawer-footer">
    <button class="drawer-toggle" aria-label="Réduire la barre">
      <svg><!-- chevron-left --></svg>
    </button>
    <a class="drawer-item" href="/settings" data-tooltip="Réglages">
      <svg class="drawer-icon"><!-- lucide settings --></svg>
      <span class="drawer-label">Réglages</span>
    </a>
    <a class="drawer-item drawer-user" href="/profile" data-tooltip="Feyçoil">
      <span class="avatar sm" data-color="mhssn">FM</span>
      <div class="drawer-user-info">
        <div class="drawer-user-name">Feyçoil M.</div>
        <div class="drawer-user-role">CEO MHSSN</div>
      </div>
    </a>
  </div>
</aside>
```

### CSS

```css
.drawer{
  width: 240px;
  background: var(--brand);
  color: var(--surface);
  display: flex; flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: sticky; top: 0;
  transition: width var(--duration-deliberate) var(--ease-in-out);
  overflow: hidden;
}
.drawer[data-collapsed="true"]{ width: 60px; }

.drawer-header{ padding: 20px 16px; }
.drawer-logo{ display: flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; }
.logo-mark{
  width: 28px; height: 28px;
  background: var(--rose);
  color: #fff;
  border-radius: 8px;
  display: grid; place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}
.logo-text{ font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }

.drawer[data-collapsed="true"] .drawer-label,
.drawer[data-collapsed="true"] .logo-text,
.drawer[data-collapsed="true"] .drawer-badge,
.drawer[data-collapsed="true"] .drawer-user-info{
  opacity: 0; pointer-events: none;
  transition: opacity 100ms;
}

.drawer-nav{ flex: 1; padding: 8px; overflow-y: auto; }
.drawer-section{ list-style: none; margin: 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 2px; }

.drawer-item{
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--surface-3);
  text-decoration: none;
  font-size: 13px; font-weight: 500;
  transition: all .12s;
  position: relative;
}
.drawer-item:hover{ background: rgba(255,255,255,0.06); color: var(--surface); }
.drawer-item.active{
  background: var(--brand-2);
  color: var(--surface);
}
.drawer-item.active::before{
  content: '';
  position: absolute; left: 0; top: 8px; bottom: 8px;
  width: 3px;
  background: var(--rose);
  border-radius: 0 2px 2px 0;
}
.drawer-icon{ width: 18px; height: 18px; flex-shrink: 0; stroke: currentColor; }
.drawer-label{ flex: 1; transition: opacity 200ms 150ms; }
.drawer-badge{
  background: var(--rose);
  color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.drawer-sep{ border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 12px 8px; }

.drawer-footer{ padding: 8px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.08); }
.drawer-toggle{
  background: transparent; border: none;
  color: var(--text-3);
  padding: 8px; border-radius: 8px;
  cursor: pointer;
  align-self: flex-end;
  transition: all .12s;
}
.drawer-toggle:hover{ color: var(--surface); background: rgba(255,255,255,0.06); }
.drawer[data-collapsed="true"] .drawer-toggle svg{ transform: rotate(180deg); }
.drawer[data-collapsed="true"] .drawer-toggle{ align-self: center; }

.drawer-user-info{ flex: 1; min-width: 0; }
.drawer-user-name{ font-size: 13px; font-weight: 600; color: var(--surface); }
.drawer-user-role{ font-size: 11px; color: var(--text-3); }

/* Tooltips en mode collapse */
.drawer[data-collapsed="true"] .drawer-item:hover::after{
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 12px); top: 50%;
  transform: translateY(-50%);
  background: var(--brand); color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px; font-weight: 500;
  white-space: nowrap;
  box-shadow: var(--shadow-pop);
  z-index: 50;
}
```

---

## 12. Accessibility patterns

### WCAG AA contrasts

**Vérifier ces combinaisons** (plusieurs sont à risque) :

| Combo | Ratio | Verdict |
|---|---|---|
| `--text` #111418 sur `--surface` #f5f3ef | 14.6 | ✅ AAA |
| `--text-2` #4b5564 sur `--surface` #f5f3ef | 7.1 | ✅ AAA |
| `--text-3` #737c89 sur `--surface` #f5f3ef | 3.8 | ⚠ AA large only |
| `--text-3` #9a9da8 sur `--surface-2` #fff | 3.0 | ❌ FAIL — relever vers #737c89 |

**Règle** : si un texte échoue WCAG AA (4.5:1 body), utiliser `--text-2` à la place.

### Focus visible

OBLIGATOIRE sur tout interactif :

```css
*:focus-visible{
  outline: 2px solid var(--brand);
  outline-offset: 2px;
  border-radius: inherit;
}
```

### ARIA roles

- Modal : `role="dialog" aria-modal="true" aria-labelledby="modal-title"`
- Toast : `role="status"` (success/info), `role="alert"` (error)
- Tabs : `role="tablist"` + `role="tab" aria-selected="true"` + `role="tabpanel"`
- Search : `role="search"`
- Drawer : `aria-label="Navigation principale"`
- Buttons icon-only : `aria-label="..."`
- Cards cliquables : `tabindex="0"` + `role="button"`

### Keyboard handlers

- **Tab** : ordre naturel
- **Enter / Espace** : activation
- **Esc** : ferme modal/dropdown/palette
- **Flèches** : navigation tabs, drag&drop accessibility, palette
- **/** : focus search globale
- **⌘K** / **Ctrl+K** : ouvre command palette
- **n** : nouvelle tâche (sur taches.html)
- **?** : modal aide raccourcis

### Screen readers

Même mono-user, utiliser :
- `aria-live="polite"` sur le toast-stack (annonce les notifs sans interrompre)
- `aria-busy="true"` pendant les loading states
- `aria-label` sur tous les boutons icon-only
- `<label>` lié à chaque input avec `for=`
- `<sr-only>` class pour annonces non-visuelles ("Tâche déplacée vers Faire")

```css
.sr-only{
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

---

## 13. Formats FR

### Date

| Contexte | Format | Exemple |
|---|---|---|
| Court (chips, meta) | DD/MM/YYYY | 26/04/2026 |
| Moyen (cartes) | DD MMM YYYY | 26 avr. 2026 |
| Long (titres) | dddd D MMMM YYYY | jeudi 26 avril 2026 |
| Header pages | dddd D MMMM | jeudi 26 avril |

### Heure

Format unique : **HH'h'mm** (avec h)
- 14h30, 09h00, 18h45
- Jamais "14:30"

### Date relative

| Délai | Affichage |
|---|---|
| Aujourd'hui | "aujourd'hui" |
| +1 j | "demain" |
| +2 à +7 j | "dans X j" |
| +8 j et + | "dans X j" puis bascule en date courte si > 30 j |
| -1 j | "hier" |
| -2 à -7 j | "il y a X j" |
| -8 j et + | "il y a X j" puis bascule en date courte si > 30 j |
| <1h | "il y a X min" |
| 1h-23h | "il y a X h" |

### Heure relative dans agenda

- À venir : "dans 2 h", "dans 45 min"
- En cours : "en cours"
- Terminé : "il y a 30 min"

### Montant

| Format | Usage |
|---|---|
| 15 000 € | Montants exacts |
| 15 k€ | Montants compacts (KPIs) |
| 1,5 M€ | Millions |
| 180,00 € | Avec décimales si nécessaire |

Espaces insécables (`&nbsp;`) entre nombre et unité.

### Pourcentage

Format : "65 %" (espace insécable, jamais "65%").

### Nombres

- Tabular-nums partout
- Séparateur de milliers : espace insécable ("28 tâches" si nb à 4 chiffres+)
- Ordinal : 1er, 2e, 3e (pas "1ère/2ème/3ème")

---

## 14. Keyboard shortcuts

### Mappings

| Touche(s) | Action | Contexte |
|---|---|---|
| `⌘K` / `Ctrl+K` | Ouvre command palette | Global |
| `/` | Focus search bar header | Global |
| `g` puis `c` | Va au cockpit | Global (vim-style) |
| `g` puis `t` | Va à taches | Global |
| `g` puis `a` | Va à agenda | Global |
| `g` puis `r` | Va à revues | Global |
| `n` | Nouvelle tâche | Sur taches |
| `e` | Édite tâche/contact/projet sélectionné | Sur listes |
| `↵` | Ouvre item sélectionné | Sur listes |
| `j` / `k` | Navigation haut/bas | Sur listes |
| `1` `2` `3` | Bascule onglets (sur projet.html) | Sur tabs |
| `Esc` | Ferme modal/palette | Global |
| `?` | Modal aide raccourcis | Global |

### Helper modal (?)

Modal medium, liste 2-colonnes des raccourcis groupés (Navigation / Actions / Listes), kbd stylé.

---

## 15. Index navigation page

### Spec design

Page d'accueil de la maquette pour naviguer entre les 22 vues.

```html
<main class="index-nav">
  <header class="index-header">
    <div class="index-title">aiCEO v0.5 — Maquette complète</div>
    <div class="index-meta">26/04/2026 · 22 vues · DA Twisty étendue</div>
  </header>

  <section class="index-section">
    <h2 class="index-section-title">Tier 1 — Cockpit & rituels</h2>
    <div class="index-grid">
      <a class="index-card" href="index.html">
        <div class="index-thumb">
          <iframe src="index.html" loading="lazy" tabindex="-1"></iframe>
        </div>
        <div class="index-card-body">
          <h3>Cockpit unifié</h3>
          <p>Vue d'accueil — état du jour en 5 secondes</p>
          <div class="index-states">
            <a class="pill outline" href="index.html">default</a>
            <a class="pill outline" href="index.html?state=outlook-stale">outlook-stale</a>
          </div>
        </div>
      </a>
      <!-- Idem pour arbitrage.html, evening.html -->
    </div>
  </section>

  <section class="index-section">
    <h2 class="index-section-title">Tier 2 — Travail courant</h2>
    <!-- 4 cards -->
  </section>

  <section class="index-section">
    <h2 class="index-section-title">Tier 3 — Registres</h2>
    <!-- 5 cards -->
  </section>
</main>
```

```css
.index-nav{ background: var(--bg); min-height: 100vh; padding: 32px; }
.index-header{ text-align: center; margin-bottom: 48px; }
.index-title{ font-size: 32px; font-weight: 700; color: var(--text); }
.index-meta{ font-size: 14px; color: var(--text-2); margin-top: 8px; }

.index-section{ margin-bottom: 48px; }
.index-section-title{ font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 20px; }

.index-grid{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

.index-card{
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-card);
  transition: all .2s;
}
.index-card:hover{ transform: translateY(-2px); box-shadow: var(--shadow-pop); }

.index-thumb{
  height: 240px;
  background: var(--surface-3);
  position: relative;
  overflow: hidden;
}
.index-thumb iframe{
  width: 1280px; height: 720px;
  transform: scale(0.34);
  transform-origin: top left;
  border: none;
  pointer-events: none;
}

.index-card-body{ padding: 16px 20px; }
.index-card h3{ font-size: 16px; font-weight: 600; margin: 0; color: var(--text); }
.index-card p{ font-size: 13px; color: var(--text-3); margin: 4px 0 12px; }
.index-states{ display: flex; gap: 6px; flex-wrap: wrap; }
.index-states .pill{ font-size: 11px; }
```

---

## Synthèse — checklist d'application

Pour chaque page de la maquette, vérifier :

- [ ] Animations respectent `--duration-*` et `--ease-*`
- [ ] `prefers-reduced-motion` géré
- [ ] Icônes : Lucide stroke 1.5
- [ ] Type system : line-heights respectés, Aubrielle/Sol selon règles
- [ ] Spacing scale : multiples de 4px exclusivement
- [ ] Charts : SVG inline, tokens DS exclusivement
- [ ] Source-link : pattern unique
- [ ] Auto-save : indicateur cohérent
- [ ] SSE streaming : skeleton + cursor + reconnect
- [ ] Drawer collapse : transition smooth + tooltips
- [ ] Focus visible : 2px brand offset 2px
- [ ] ARIA roles présents
- [ ] Formats FR : date/heure/montant uniformes
- [ ] Keyboard shortcuts opérationnels (au moins indiqués)
- [ ] Index navigation accessible
