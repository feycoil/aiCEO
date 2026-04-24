# aiCEO — Design system & spec UX/UI

**Version 1.0 · 23 avril 2026 · Twisty design language · Spec complète** · dernière relecture 24/04/2026

> Ce document décrit les principes, tokens, composants et parcours du design system aiCEO — baptisé **Twisty**. Il complète `04-visualisation.md` (patterns visuels) et sert de référence pour tout chantier UI.

## Sources canoniques des assets

Trois silos à connaître (pas de pont programmatique entre eux — voir `00_BOUSSOLE/GOUVERNANCE.md` §"Synchronisation") :

| Source | Emplacement | Rôle |
|---|---|---|
| **Repo** `02_design-system/` | Dossier du dépôt (import complet effectué au 24/04/2026) | **Source vivante**. Contient tokens (`colors_and_type.css`), assets (`app.css`, `product.app.css` 895 lignes, `app.js`, `data.js`, `logo.svg`), fonts (Fira Sans 10 poids + Aubrielle + Sol), 12 previews HTML, `ui_kits/aiceo/`, et `REPO-CONTEXT.md` (note repo spécifique). |
| **Design System OneDrive** `aiCEO_Design_System/` | `C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Design_System\` | Atelier amont. Les itérations faites hors Git y arrivent, puis sont resyncées dans `02_design-system/` via la procédure de `REPO-CONTEXT.md`. |
| **Code app** `01_app-web/assets/` puis `03_mvp/public/assets/` (post-fusion) | `app.css`, `data.js`, `app.js` | Implémentation effective dans le cockpit. |
| **Claude Design** | Projets `aiCEO Design System`, `aiCEO v1`, `aiCEO_mvp_v1` | Atelier visuel — maquettes, itérations UI. Jamais "la vérité finale". |

**Règle opérationnelle** : toute nouvelle règle UI créée en Claude Design passe par `_drafts/design-claude-YYYY-MM-DD.md` avant promotion vers `02_design-system/` via session Cowork. Sinon elle s'évapore.

---

## 1. Les principes Twisty

Cinq principes qui tranchent les arbitrages de design.

### P1 · Épuré sans froideur

Les grandes surfaces crème et l'absence de lignes grasses créent du calme. Mais on évite le blanc pur, la police système sans âme, le minimalisme clinique. Les pastels chaleureux, la typographie grotesk ronde, et les ombres douces donnent le sentiment d'une app qu'on aime ouvrir.

### P2 · Pensée visuelle par défaut

Toute information qui le permet est présentée en format visuel (grid, arbre, graphe, timeline, carte) avant d'être listée. Le texte est la dernière option, pas la première. Une décision est un arbre, une équipe est un graphe, un agenda est une grille.

### P3 · Densité honnête

L'écran ne cache pas l'information et ne la surcharge pas. Chaque page tient sous la ligne de flottaison desktop 1080p en situation normale. Si ça déborde, c'est que c'est trop — on regroupe ou on archive.

### P4 · Sans bruit visuel inutile

Pas de gradient, pas de filet coloré inutile, pas d'ombre épaisse, pas d'icône sans label, pas d'animation qui retarde. Chaque élément doit justifier sa présence.

### P5 · Une seule action mise en avant par écran

Chaque page propose *une* action primaire claire (un bouton vif, un CTA dominant). Le reste est secondaire. Le CEO ne doit jamais hésiter sur "qu'est-ce que je peux faire ici ?"

---

## 2. Les design tokens

### 2.1 Couleurs de base

```css
--frame        : #a9adbe;  /* cadre extérieur (lilas-gris) */
--surface      : #f5f3ef;  /* surface de travail (crème) */
--surface-2    : #ffffff;  /* cartes & panels (blanc cassé) */
--surface-3    : #fbfaf7;  /* sous-surfaces très douces */
--text         : #111418;  /* texte principal (noir encre) */
--text-2       : #3f4554;  /* texte secondaire */
--text-3       : #707687;  /* texte muet */
--border       : #e7e5de;  /* bordures sobres */
--border-strong: #d4d1c7;  /* bordures lisibles */
--accent       : #d96d3e;  /* corail — action primaire */
--accent-hover : #c85d2e;  /* hover */
```

### 2.2 Couleurs catégorielles (sociétés & statuts)

```css
/* Violet — Adabu, intention stratégique */
--violet    : #6d3ba5;
--violet-bg : #e9d9ff;
--violet-800: #4e2a78;

/* Sky — Start SCI, info */
--sky       : #3b6ba5;
--sky-bg    : #dce9f7;
--sky-800   : #274c78;

/* Sage / Emerald — AMANI, calme, OK */
--emerald   : #2b7350;
--emerald-bg: #d8ecdf;
--sage      : #5d8f72;

/* Amber — ETIC Services, attention */
--amber     : #a57b3b;
--amber-bg  : #f5e8cc;
--amber-800 : #7a5a2a;

/* Rose — alerte douce, rituel */
--rose      : #a53b5f;
--rose-bg   : #f5dada;
--rose-800  : #7a2c46;
```

**Règle absolue** : **aucun rouge vif** (#ff0000 et voisins), **aucun gradient**, **aucun filet coloré inséré dans une carte** (border-left coloré banni).

### 2.3 Typographie

> **Source canonique des tokens** : `02_design-system/tokens.json` (depuis S7 atelier cohérence, ADR `2026-04-24 · Pipeline tokens DS → CSS + maintien unifié`). Le fichier `colors_and_type.css` est **en partie généré** — le bloc entre les marqueurs `/* === GENERATED FROM tokens.json === */` et `/* === END GENERATED === */` est réécrit par `npm run ds:export` ; la section "Semantic type roles" en fin de fichier reste hand-written. Pour modifier un token (couleur, typo, espacement, radius, shadow), voir `00_BOUSSOLE/GOUVERNANCE.md` §"Chemin type d'un changement de token".

**Fira Sans est la typographie canonique d'aiCEO** (ADR 2026-04-24 · Typographie canonique, dans `00_BOUSSOLE/DECISIONS.md`). Elle est self-hostée depuis `02_design-system/fonts/` (10 poids, du Thin 100 au Heavy 900), via les `@font-face` déclarés dans `02_design-system/colors_and_type.css`. Aucune dépendance à Google Fonts / rsms.me / CDN externe — conforme à la trajectoire souveraine locale-first (cf. vision produit § 0).

Deux polices d'**accent** sont utilisables sparsely :
- **Aubrielle** — display script, pour titres d'intention, salutations, moments "hero". Jamais en corps de texte.
- **Sol Thin** — ultra-light, pour très grands chiffres ou sous-titres stylisés. Jamais en corps.

```css
--font-sans   : "Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-script : "Aubrielle", Georgia, serif;   /* display uniquement */
--font-thin   : "Sol", "Fira Sans", sans-serif; /* accents ultra-légers */
--font-mono   : ui-monospace, SFMono-Regular, "JetBrains Mono", monospace;

/* OpenType features Fira Sans : alternates contextuelles + formes
   caractéristiques (chiffres ronds, a à un étage) */
font-feature-settings: "calt", "ss02", "ss03";

--fs-xs   : 11.5px;  /* labels, stats tabulaires */
--fs-sm   : 13px;    /* small, sub-labels */
--fs-base : 15px;    /* corps principal */
--fs-lg   : 17px;    /* sous-titres */
--fs-xl   : 20px;    /* titres de section */
--fs-2xl  : 24px;    /* titres de page */
--fs-3xl  : 32px;    /* hero titles */
--fs-4xl  : 44px;    /* grande intention */

--fw-thin       : 100;
--fw-extralight : 200;
--fw-light      : 300;
--fw-regular    : 400;
--fw-book       : 450;
--fw-medium     : 500;
--fw-semibold   : 600;
--fw-bold       : 700;
--fw-extrabold  : 800;
--fw-heavy      : 900;

--lh-tight : 1.2;
--lh-normal: 1.5;
--lh-loose : 1.7;

--letter-tight : -0.025em;  /* titres — Fira demande un peu plus de tracking négatif */
--letter-normal: 0em;        /* corps — Fira lit mieux au neutre */
--letter-wide  : 0.08em;     /* uppercase labels */
```

Tabular numerics sur tous les chiffres : `font-variant-numeric: tabular-nums;`

**Purge 2026-04-24** : les sources contradictoires antérieures (Inter via CDN `rsms.me` dans les CSS, Cambria/Calibri inline dans `03_mvp/public/*.html`) ont été remplacées. Fira Sans est première dans la stack partout ; les anciennes fontes restent en fallback temporaire le temps que les `@font-face` soient servis depuis `03_mvp/public/assets/fonts/` (fusion v0.5). Traces dans `S2-typographie.md` et `REPO-CONTEXT.md`.

### 2.4 Espaces & rayons

```css
--r-sm : 8px;
--r-md : 12px;
--r-lg : 18px;
--r-xl : 24px;
--r-2xl: 28px;   /* grandes cartes / hero */
--r-full: 999px; /* pills, avatars */

--space-1 : 4px;
--space-2 : 8px;
--space-3 : 12px;
--space-4 : 16px;
--space-5 : 20px;
--space-6 : 24px;
--space-8 : 32px;
--space-10: 40px;
--space-12: 48px;
```

### 2.5 Ombres (soft shadow signature Twisty)

```css
--shadow-card : 0 1px 2px rgba(17,20,24,0.04),
                0 2px 6px rgba(17,20,24,0.04);

--shadow-card-hover : 0 2px 4px rgba(17,20,24,0.05),
                      0 6px 14px rgba(17,20,24,0.07);

--shadow-lifted : 0 4px 10px rgba(17,20,24,0.06),
                  0 12px 28px rgba(17,20,24,0.10);

--shadow-modal : 0 8px 24px rgba(17,20,24,0.12),
                 0 24px 60px rgba(17,20,24,0.18);
```

Doubles couches pour un effet "flottant léger" — jamais d'ombre dure.

### 2.6 Durées d'animation

```css
--t-fast  : 120ms;
--t-base  : 200ms;
--t-slow  : 320ms;
--ease    : cubic-bezier(0.2, 0.8, 0.2, 1);  /* out-expo doux */
```

---

## 3. Les composants fondamentaux

### 3.1 Portlet (card)

La brique de base. Fond pastel ou crème, rayon `--r-lg`, ombre soft.

```html
<div class="card panel">
  <div class="card-header">
    <h3 class="card-title">Titre</h3>
    <div class="card-actions"><button class="btn sm">...</button></div>
  </div>
  <div class="card-sub">sous-titre optionnel</div>
  <!-- contenu -->
</div>
```

**Variantes** :
- `.panel` : fond `--surface-2` neutre.
- `.group-themed` : fond pastel selon catégorie (violet, sky, sage, amber, rose).
- `.tinted-amber`, `.tinted-violet`, etc. : versions colorées discrètes.

**Interdit** : border-left coloré épais, inset filet, linear-gradient en background.

### 3.2 Boutons

```html
<button class="btn">Secondaire</button>
<button class="btn primary">Primaire</button>
<button class="btn sm">Petit</button>
<button class="btn ghost">Ghost</button>
<button class="btn danger">Dangereux (rare)</button>
```

Tous arrondis en `--r-full` ou `--r-lg`. Primaire = corail. Pas de rouge vif même pour danger (utiliser rose-800).

### 3.3 Pill & tag

```html
<span class="pill">Base</span>
<span class="pill outline">Outline</span>
<span class="pill outline small tnum">42%</span>
<span class="pill violet">Adabu</span>
```

### 3.4 Avatar

Rond, 32-40 px, fond rose-bg, initiales en text-2. Pas de gradient.

### 3.5 KPI (stat card)

```html
<div class="kpi tinted violet">
  <div class="kpi-label">En attente</div>
  <div class="kpi-value tnum">12</div>
  <div class="kpi-sub">à arbitrer</div>
</div>
```

4 KPI max par ligne (grid-4). Fond pastel uniforme, pas de gradient.

### 3.6 Intention hero

Grand titre d'intention en haut de page, sur fond crème.

```html
<div class="intention-hero">
  <div class="intention-hero-left">
    <div class="intention-hero-eyebrow">S17 · Intention</div>
    <h1 class="intention-hero-title">Terrain Mayotte</h1>
    <div class="intention-hero-sub">3 Big Rocks · 67% progressé</div>
  </div>
  <div class="intention-hero-right">
    <span class="pill outline">67%</span>
  </div>
</div>
```

### 3.7 Big Rock

```html
<div class="rock-card">
  <div class="rock-card-head"><span class="rock-num">1</span><span>Big Rock</span></div>
  <div class="rock-card-title">PV chantier Mayotte + arbitrages</div>
  <div class="rock-mini-bar"><div class="rock-mini-bar-fill" style="width:62%"></div></div>
  <div class="rock-card-meta"><span>62% progression</span></div>
</div>
```

### 3.8 Week gauge

Barre de progression hebdo en pleine largeur.

```html
<div class="week-gauge">
  <div class="week-gauge-track">
    <div class="week-gauge-fill" style="width:67%"></div>
  </div>
</div>
```

**Important** : la nesting `.week-gauge > .week-gauge-track > .week-gauge-fill` est obligatoire. Le track porte `position:relative; overflow:hidden;` et le fill est `position:absolute; inset:0; border-radius:999px; width:X%`.

### 3.9 Coach strip

Bandeau haut de page avec message copilote.

```html
<div class="coach-strip">
  <span class="coach-dot">AI</span>
  <span><em>Copilote ·</em> Voici 3 priorités pour aujourd'hui.</span>
</div>
```

### 3.10 AI card (proposition)

```html
<div class="ai-card" data-proposal-id="...">
  <div class="ai-card-kind">✉️ Brouillon mail</div>
  <span data-source-pill class="src-pill">
    <span class="src-icon">📥</span>
    <span class="src-detail">Outlook · Lloyds</span>
  </span>
  <div class="ai-card-title">Réponse à Lloyds</div>
  <div class="ai-card-body">Bonjour John, merci pour votre retour...</div>
  <div class="ai-card-preview-fade"></div>
  <div class="ai-card-actions">
    <button class="btn primary">Valider</button>
    <button class="btn">Ajuster</button>
    <button class="btn ghost">Ignorer</button>
  </div>
</div>
```

Fond `--violet-bg` pastel uniforme. Pas de gradient, pas de filet. Le fade est un `--surface` aplatis, pas un linear-gradient.

### 3.11 Drawer latéral

Glisse depuis la droite, 380 px de large, ombre modale.

```html
<div class="drawer">
  <div class="drawer-header">
    <div class="eyebrow">Tâche</div>
    <h2 class="drawer-title">Rédiger PV chantier</h2>
    <div class="drawer-source"><!-- source pill --></div>
  </div>
  <div class="drawer-meta">
    <div><label>Société</label><value>ETIC Services</value></div>
    <div><label>Échéance</label><value>Jeudi 25/04</value></div>
    ...
  </div>
  <div class="drawer-related">
    <h4>Liens</h4>
    <!-- nodes liés -->
  </div>
  <div class="drawer-actions">
    <button class="btn primary">Faire</button>
    <button class="btn">Déléguer</button>
  </div>
</div>
```

### 3.12 Sélecteur de vue

```html
<div class="view-switcher">
  <button data-view="list" class="active">Liste</button>
  <button data-view="grid">Grid</button>
  <button data-view="tree">Arbre</button>
  <button data-view="graph">Graphe</button>
  <button data-view="canvas">Canvas</button>
</div>
```

Raccourcis clavier Ctrl+1..5.

### 3.13 Source pill

Petit badge affichant l'origine d'un élément (mail, RDV, fichier).

```html
<span data-source-pill class="src-pill">
  <span class="src-icon">✉️</span>
  <span class="src-detail">Outlook · Lloyds</span>
</span>
```

Style pastel discret, clic = ouvre la source.

---

## 4. Les pages (architecture informationnelle)

### 4.1 Cockpit (index.html) — la page d'entrée

**Au-dessus de la ligne de flottaison** :
1. Coach strip (1 message)
2. Intention de la semaine (hero)
3. Grid 3 Big Rocks
4. Grid 4 KPI (tâches à faire, RDV aujourd'hui, propositions, humeur/streak)

**En dessous** :
5. Propositions IA en attente (5 max visibles)
6. Prochains RDV (3 cartes horizontales)
7. Équipe présente aujourd'hui (facultatif)

### 4.2 Société (projets/{id}.html)

1. Intention de la société (hero pastel société)
2. Décisions en cours
3. Chantiers actifs (kanban compact)
4. Équipe associée
5. Prochains RDV board
6. Historique revues société

### 4.3 Agenda (agenda.html)

1. Grille hebdo 7 jours × heures
2. Légende société (pastilles colorées)
3. Panneau latéral : RDV sélectionné + prep IA

### 4.4 Tâches (taches.html)

1. Sélecteur de vue (liste/grid/arbre/kanban)
2. Filtres (société, owner, échéance)
3. Vue sélectionnée
4. Action "créer tâche" flottante (bas droite)

### 4.5 Décisions (decisions.html)

1. Grille cartes décisions par statut (à arbitrer / arbitrée / archivée)
2. Chaque carte : titre, options, deadline, acteurs
3. Clic → drawer avec timeline de décision

### 4.6 Revues (revues/index.html)

1. Coach strip
2. Intention de la semaine courante
3. Grid Big Rocks + week gauge
4. Panel "en cours"
5. Panel S+1 préparée par IA
6. Grid archives (cartes semaines passées)

### 4.7 Contacts (contacts.html)

1. Grille cartes personnes (équipe + partenaires)
2. Filtres société, rôle
3. Clic → drawer avec historique, tâches en cours, dernière interaction

### 4.8 Copilote (assistant.html)

1. Intention hero copilote (bandeau avec propositions du moment)
2. 4 KPI (en attente / acceptées / urgentes / automations)
3. Sections par type de proposition (email draft, meeting prep…)
4. Historique acceptées/rejetées
5. Roadmap copilote

### 4.9 Groupes / sociétés (groupes.html)

1. Carte radiale des sociétés (SVG)
2. Pour chaque société : hero compact (pastel société) + 3 métriques clés
3. Action "explorer la société"

---

## 5. Les parcours clés

### 5.1 Parcours "matin type" (5 min)

1. `index.html` s'ouvre.
2. Coach strip pousse rituel matin → clic → modal d'intention.
3. CEO déclare humeur + phrase d'intention.
4. L'IA propose top 3 → CEO valide ou ajuste.
5. Retour cockpit avec 3 Big Rocks affichés.
6. CEO clique sur la première proposition email → drawer → valider → envoyé.
7. Clic "Déléguer" sur une tâche → confirmation → brief envoyé automatiquement.

### 5.2 Parcours "préparer un comité" (15 min)

1. CEO reçoit notification J-48h RDV comité stratégique Adabu.
2. Clic sur la proposition "meeting-prep" → ouvre un écran dédié.
3. Écran montre : dernière décision, 3 points à trancher, mémo pré-rédigé, documents rattachés.
4. CEO sélectionne un paragraphe → clic "visualiser" → arbre à 3 branches.
5. L'arbre est collé dans le brief.
6. CEO clique "Partager avec ExCom" → mail rédigé + destinataires présélectionnés.
7. Validation et envoi.

### 5.3 Parcours "déléguer une tâche" (1 min)

1. CEO ouvre une tâche dans le drawer.
2. Bouton "Déléguer" en couleur vive.
3. Clic → IA a déjà identifié le propriétaire naturel (Marie, confiance 0.90).
4. Écran de confirmation : brief rédigé, deadline, suivi J+5.
5. CEO édite (ou pas) et valide.
6. Tâche bascule en "déléguée", mail envoyé, suivi programmé.

### 5.4 Parcours "soir type" (3 min)

1. 18h30 : push notification discrète "fin de journée ?".
2. CEO clique → écran de clôture.
3. Répond aux 3 questions (ce qui compte / humeur / reports).
4. Clic "Clôturer" → écran zen "bonne soirée".
5. App passe en mode nuit jusqu'à demain 6h30.

### 5.5 Parcours "revue dimanche" (15 min)

1. 19h : coach strip propose la revue.
2. CEO ouvre revues/index.html → panel S+1 pré-rempli.
3. Révision des Big Rocks proposés, ajustement si besoin.
4. Validation S18 → semaine engagée.
5. Bilan S17 affiché : ce que j'ai appris de toi, stats, préférences mises à jour.

---

## 6. Les règles d'interaction

### 6.1 Raccourcis clavier globaux

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Command palette (cherche tout) |
| `Cmd/Ctrl + 1-5` | Bascule de vue (liste/grid/arbre/graphe/canvas) |
| `Cmd/Ctrl + /` | Focus la barre de recherche |
| `Alt + E` | Visualiser la sélection texte |
| `G` | Regrouper par (menu) |
| `F` | Filtrer (barre) |
| `V` | Pivoter vue (menu rapide) |
| `Esc` | Fermer drawer / modal / command palette |
| `N` | Nouvelle tâche / nouveau node |
| `Shift + ?` | Afficher tous les raccourcis |

### 6.2 États des composants

Chaque composant supporte 5 états : default, hover, active, focus, disabled.

```css
.btn:hover    { background: ...; box-shadow: var(--shadow-card-hover); transform: translateY(-1px); }
.btn:active   { transform: translateY(0); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

Transitions à `--t-base` avec `--ease`.

### 6.3 Feedback

- **Toast** : apparition en haut-droite, fond pastel selon type (sage pour succès, amber pour attention, rose pour alerte), 4 s puis fade.
- **Skeleton** : pendant un load LLM > 200 ms, afficher skeleton pulsant doux.
- **Stream** : pour réponse LLM, streamer le texte en live (effet "tape" doux).

---

## 7. L'accessibilité

### 7.1 Règles AA WCAG 2.1

- **Contraste** : 4.5:1 minimum pour texte corps, 3:1 pour grandes tailles et composants non textuels.
- **Focus visible** : outline 2px sur tout élément focusable.
- **Navigation clavier** : tout actionnable au clavier, ordre tab logique.
- **Labels** : aucune icône seule sans aria-label.
- **Alt** : toute image décorative `alt=""`, toute image porteuse de sens a un alt descriptif.
- **Rôles ARIA** : `role="button"`, `role="dialog"`, `aria-live="polite"` sur zones de propositions.

### 7.2 Daltonisme

- Chaque couleur catégorielle a un **symbole associé** :
  - Adabu → ● (rond plein)
  - Start → ○ (rond creux)
  - AMANI → ◆ (losange)
  - ETIC → ■ (carré)
- Test via Stark / Sim Daltonism à chaque release.

### 7.3 Taille de texte

- Zoom navigateur jusqu'à 200 % sans casse.
- Taille minimum effective 13 px (jamais de 10-11 px sauf tabulaire secondaire).

---

## 8. Les responsive breakpoints

```css
/* Mobile first est un leurre pour un CEO. Desktop first. */
--bp-mobile  : 640px;
--bp-tablet  : 900px;
--bp-desktop : 1280px;
--bp-wide    : 1600px;
```

- Desktop (≥ 1280 px) : expérience complète, drawers + panels latéraux.
- Tablet (900-1279 px) : drawers en modal, panels rétractés.
- Mobile (< 900 px) : vue compacte, propositions essentielles, pas de canvas. Deux cases d'usage : lecture rapide en déplacement, validation urgente d'une proposition.

---

## 9. Les états vides (empty states)

Règle : un état vide n'est pas une erreur. C'est un moment de calme.

```
┌─────────────────────────────────────┐
│                                     │
│         ✨  (icône légère)          │
│                                     │
│         Rien d'urgent.              │
│         Profite du calme.           │
│                                     │
└─────────────────────────────────────┘
```

Pas de CTA "créer ta première tâche" agressif. Juste une icône et deux lignes.

---

## 10. Les micro-patterns signature

### P1 · Pastille de catégorie

Un petit rond de 8 px de couleur, placé à 6 px du bord gauche de l'event/tâche. Signale la société sans filet épais.

### P2 · Tabular nums pour les chiffres

Tous les pourcentages, compteurs, durées en `tabular-nums` pour un alignement propre.

### P3 · Scroll progressif sans barre

`scrollbar-width: thin; scrollbar-color: transparent transparent;` — barre invisible au repos, apparaît au hover.

### P4 · Focus ring discret

`outline: 2px solid var(--accent); outline-offset: 2px; border-radius: inherit;` — jamais outline bleu Chrome.

### P5 · Bouton primaire "pressed" qui rassure

Au clic, léger scale(0.98) + shadow réduite — rétroaction tactile sans mouvement excessif.

---

## 11. Les anti-patterns à refuser

- Les gradients de fond (banned depuis la v3).
- Les filets colorés inset dans les cartes (banned).
- Les borders-left colorés (banned).
- Les ombres floues et grasses (50 %+ opacity) — le Twisty veut des ombres subtiles uniquement.
- Le rouge vif pour "urgent" — utiliser rose-800 pour l'alerte douce.
- Les icônes sans label ni tooltip.
- Les boutons "ghost" en dégradé.
- Les toasts qui se superposent ou qui restent > 6 s.
- Le uppercase généralisé sur titres (préférer lettrage normal + weight semibold).

---

## 12. Roadmap design system

### Phase 1 — Stabilisation Twisty (en cours)

- Tokens consolidés (fait).
- Portlet, KPI, intention-hero, big-rock, week-gauge (fait).
- Audit gradient / filet (fait).
- Documentation composants (ce doc).

### Phase 2 — Extension composants (T2 2026)

- Drawer réutilisable.
- View switcher 5 formats.
- Source pill standardisée.
- Command palette (Cmd+K).

### Phase 3 — Viz components (T3-T4 2026)

- Carte radiale sociétés.
- Arbre Big Rocks.
- Matrice 2x2 délégation.
- Timeline décisions.
- Graphe Cytoscape intégré.

### Phase 4 — Canvas & IA (T1-T2 2027)

- Intégration tldraw SDK.
- Agent IA visible sur canvas.
- Gabarits visuels (10 formats type Napkin).
- Bouton "visualiser" contextuel.

### Phase 5 — Dark mode & accessibility (T2 2027)

- Palette dark equivalent.
- Audit AA complet.
- Tests daltonisme / lecteur écran.

---

## 13. Synthèse — le manifeste visuel

> Twisty est un design system qui respire. 
> 
> Il utilise le crème et le lilas pour donner au CEO le sentiment d'ouvrir un carnet de cuir, pas un tableau de bord.
> 
> Il utilise des pastels pour catégoriser sans crier, des ombres douces pour donner de la profondeur sans agressivité, et des typographies grotesques pour lier rigueur et chaleur.
> 
> Il refuse ce qui brille, ce qui pousse, ce qui court. Il veut de la présence calme, pas de la performance visuelle.

---

*Documents liés : `04-visualisation.md` · `01-vision-produit.md` · `SPEC-FONCTIONNELLE-FUSION.md` · `SPEC-TECHNIQUE-FUSION.md` · code : `01_app-web/assets/app.css` (actuel) → `03_mvp/public/assets/app.css` (cible post-fusion) · source canonique : `02_design-system/` (en cours d'import depuis OneDrive `aiCEO_Design_System/`)*
