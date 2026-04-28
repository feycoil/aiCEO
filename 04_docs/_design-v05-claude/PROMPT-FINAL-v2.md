# Prompt unique — Maquette Claude Design aiCEO v0.5 (v2)

> Version 2 — 26/04/2026 — intégrant les 24 manques identifiés en revue critique.
> Backup v1 disponible : `PROMPT-FINAL-v1.md`.
> 8 pièces jointes à uploader simultanément.

## Pièces jointes à uploader (8 fichiers)

1. `00-REFERENCE-VISUELLE-twisty.png` — image étalon visuel ⚠ à déposer manuellement
2. `01-tokens.json` — Design System canonique aiCEO
3. `02-colors_and_type.css` — variables CSS générées
4. `03-spec-extraits.md` — extrait pertinent SPEC fonctionnelle
5. `04-pages-detail.md` — fiche détaillée des 13 pages
6. `05-persona.md` — persona Feyçoil + 3 groupes réels
7. `06-composants-catalogue.md` — 16 composants UI prêts à l'emploi
8. `07-datasets-elargi.md` — 28 tâches, 25 contacts, 25 RDV, 14 projets, 10 décisions, 9 AI proposals, 4 revues
9. `08-patterns-techniques.md` — motion, drag&drop, charts, palette, accessibility, formats FR

---

## Le prompt (à copier intégralement)

```
# Brief design — aiCEO v0.5 (cockpit CEO unifie, 13 pages, hi-fi clickable)

Tu es un designer produit senior + dev front. Mission : concevoir et coder
la maquette complete hi-fi du cockpit CEO aiCEO v0.5, 13 pages HTML
clickables + 1 page index, 22 vues totales (13 default + 9 etats critiques),
prets pour integration dev a 100%.

# 0. PIECES JOINTES — UTILISATION OBLIGATOIRE

Tu disposes de 8 fichiers joints qui constituent ton corpus de reference.
Tu DOIS t'y reporter avant de produire chaque element :

1. `00-REFERENCE-VISUELLE-twisty.png` — etalon visuel a reproduire pixel-pres
   sur les patterns recurrents (radius, chips, charts dot, stat hero)
2. `01-tokens.json` + `02-colors_and_type.css` — variables CSS canoniques.
   ZERO HEX EN DUR. Tout via var(--token).
3. `03-spec-extraits.md` — criteres acceptance + endpoints API
4. `04-pages-detail.md` — role/contenu/API/etat critique pour chaque page
5. `05-persona.md` — Feycoil + 3 groupes reels (MHSSN/AMANI/ETIC)
6. `06-composants-catalogue.md` — 16 composants UI deja designes,
   a REUTILISER tels quels. Aucune reinvention.
7. `07-datasets-elargi.md` — 28 taches reelles, 25 contacts, 25 RDV, etc.
   AUCUN Lorem. Toutes les donnees viennent de ce fichier.
8. `08-patterns-techniques.md` — motion, drag&drop, charts SVG, command
   palette, accessibility, formats FR, keyboard shortcuts.

Si un element manque dans les pieces jointes, demande AVANT d'inventer.

# 1. CONTEXTE PRODUIT

aiCEO est un copilote executif personnel local sur poste Windows. Persona :
Feycoil, 40 ans, dirigeant de 3 groupes : MHSSN Holding (gouvernance + SCI
Start/Adabu + FEIRASIN + Affejee), AMANI (3 societes hotelieres Mayotte),
ETIC Services (services + ITH/LTM/AA).

Il pilote :
- 14 projets actifs cross-groupes
- ~30 taches operationnelles
- ~10 RDV/jour
- ~50 mails entrants/jour
- 25 contacts proches

Trois rituels imposes :
- Matin (5 min) : arbitrage 30 taches en buckets faire/deleguer/reporter
- Soir (2 min) : bilan humeur + energie + top 3 demain + streak
- Hebdo dimanche (20 min) : revue Big Rocks S-1 + cap S+1

Voir `05-persona.md` + `03-spec-extraits.md` pour le detail.

# 2. REFERENCE VISUELLE — GOLD STANDARD A REPRODUIRE

Image jointe : `00-REFERENCE-VISUELLE-twisty.png` (Twisty Income Tracker).

Patterns OBLIGATOIRES a transposer dans aiCEO (la maquette doit pouvoir
etre posee a cote sans friction visuelle) :

- **Radius conteneur principal** : 28-32px
- **Radius cartes secondaires** : 18-24px
- **Chips** : pill (rounded-full)
- **Densite** : aere mais riche (32px padding, 24px gouttiere)
- **Stat hero** : grands chiffres en weight black/Sol-thin, caption 2 lignes
- **Value pill** : callout pill brand navy filled qui floate sur un dot chart
- **Day pills** S M T W T F S : ronds avec actif filled brand
- **List-card avec rows** : icone carree arrondie + label + chip + chevron
- **Avatar circulaire** + chip overlay seniority
- **Tabs underline** : ligne fine sous link actif
- **Top right cluster** : search bar + icones boutons ronds + avatar

ANTI-patterns INTERDITS :
- Pas d'ombre 3D, pas de gradient candy, pas de glow, pas de skeumorphisme
- Pas de couleurs criardes (Trello/Asana style)
- Pas d'icones decoratives gratuites
- Pas de hamburger menu (desktop only 1280-1920px)
- Pas de Material Design defaults

# 3. SYSTEME DE DESIGN — TOKENS A RESPECTER

Source canonique : `01-tokens.json` + `02-colors_and_type.css` (joints).

## 3.1 Couleurs (utilisation OBLIGATOIRE de var(--token), zero hex en dur)

```css
/* Neutres */
--bg: #a9adbe;
--surface: #f5f3ef;
--surface-2: #ffffff;
--surface-3: #eeebe4;
--border: rgba(17,20,24,0.08);
--border-strong: rgba(17,20,24,0.16);
--text: #111418;
--text-2: #4b5564;
--text-3: #737c89;

/* Brand */
--brand: #111418;
--brand-2: #2b3139;
--brand-50: #eceef1;

/* Accents semantiques */
--rose: #d96d3e;       --rose-bg: #fdecdf;    --rose-800: #8a3b1b;
--emerald: #3d7363;    --emerald-bg: #e2ece8; --emerald-800: #234236;
--sky: #7790ae;        --sky-bg: #e9eef4;     --sky-800: #3b506a;
--amber: #b88237;      --amber-bg: #f5e8d6;   --amber-800: #6d4816;
--violet: #7a6a8a;     --violet-bg: #ece7f0;  --violet-800: #463a54;

/* Couleurs groupes (3, pas 4) */
--group-mhssn: #3d4e7d;   /* indigo */
--group-amani: #d96d3e;   /* rose/coral */
--group-etic:  #b88237;   /* amber */

/* Radii */
--radius-xl: 28px;       /* hero containers */
--radius-lg: 24px;
--radius:    18px;
--radius-sm: 12px;

/* Shadows */
--shadow-app:  0 20px 60px rgba(17,20,24,0.18), 0 8px 24px rgba(17,20,24,0.08);
--shadow-card: 0 1px 2px rgba(17,20,24,0.04), 0 2px 6px rgba(17,20,24,0.04);
--shadow-pop:  0 20px 40px rgba(17,20,24,0.20);

/* Spacing scale (multiples de 4 OBLIGATOIRES) */
--space-0:0; --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
--space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px;
--space-12:48px; --space-16:64px;

/* Durations */
--duration-instant: 100ms;
--duration-snap: 120ms;
--duration-smooth: 200ms;
--duration-deliberate: 300ms;
--duration-celebration: 600ms;

/* Easings */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Icon sizes */
--icon-xs: 12px; --icon-sm: 14px; --icon-md: 16px;
--icon-lg: 20px; --icon-xl: 24px;
```

## 3.2 Type system (voir 08-patterns-techniques.md §4 pour echelle complete)

- **Aubrielle** : SEUL pour salutations + hero rituels (>=36px). Jamais inline.
- **Sol** : SEUL pour chiffres ouverts >=28px (streaks, KPIs hero).
- **Fira Sans** : tout le reste. Tabular-nums sur tous chiffres.
- Line-heights : 1.0 (display), 1.3 (h1), 1.4 (h2), 1.45 (h3), 1.5 (body), 1.4 (sm).
- font-feature-settings: "kern", "liga", "calt".

## 3.3 Iconographie (Lucide OBLIGATOIRE)

- Bibliotheque : Lucide (https://lucide.dev), via CDN UMD
- stroke-width: 1.5
- stroke: currentColor
- fill: none (sauf cas explicite)
- Tailles standardisees : --icon-xs/sm/md/lg/xl
- Liste 30 icones inventoriees dans `08-patterns-techniques.md` §3

# 4. STACK TECHNIQUE

## 4.1 CSS hybride (60/40)

- 60% Variables DS : couleurs, typo, radius via var(--token)
- 40% Tailwind utilities (CDN) : layout (grid, flex), spacing utilities,
  states (hover, focus)

NE PAS utiliser de couleur Tailwind (`bg-blue-500`...) ni de typo Tailwind
(`text-blue-600`). Toujours `style="background: var(--surface-2)"` ou via
classe custom.

Exemple type :
```html
<div class="rounded-[28px] grid grid-cols-3 gap-6"
     style="background: var(--surface-2); padding: var(--space-8);
            border: 1px solid var(--border);">
  <h2 style="font-size: 22px; font-weight: 600; color: var(--text);">
    Big Rocks semaine 17
  </h2>
</div>
```

## 4.2 JS minimal

JavaScript autorise UNIQUEMENT pour :
- Drawer collapse toggle (avec persistance localStorage clé `aiCEO.uiPrefs.drawerCollapsed`, SEULE clé autorisee par ADR S2.00)
- Tabs switching
- Modals open/close + focus trap + esc handler
- Toast auto-dismiss
- Drag & drop (HTML5 native + clavier)
- Tooltips delay 500ms
- Command palette ⌘K
- Auto-save indicator
- Streaming SSE simulation (timeout setTimeout chunks)
- Index navigation toggle entre default et etat critique

Pas de framework. Vanilla JS pur, pas de jQuery.

# 5. PERIMETRE — 13 PAGES + 1 INDEX = 14 FICHIERS, 22 VUES

Voir `04-pages-detail.md` pour la fiche complete role/contenu/API/etat
critique de chaque page.

## Structure de livraison

```
/design-v05/
  index-nav.html              page navigation entre les 13 maquettes (voir §15 patterns)
  index.html                  cockpit unifie (T1)
  arbitrage.html              arbitrage matinal (T1)
  evening.html                boucle du soir (T1)
  taches.html                 inbox + Eisenhower (T2)
  agenda.html                 vue hebdo (T2)
  revues.html                 revue hebdo (T2)
  assistant.html              chat copilote (T2)
  groupes.html                portefeuille societes (T3)
  projets.html                liste projets (T3)
  projet.html                 page projet template (T3)
  contacts.html               registre equipe (T3)
  decisions.html              registre decisions (T3)
  _shared/
    drawer.html               drawer collapsible 60px<->240px (extrait reutilise)
    header.html               header avec search + actions + avatar
    footer.html               footer discret version + last-sync
    base.css                  imports tokens + reset + utilities
    base.js                   helpers JS (drawer toggle, modals, palette)
```

## Chaque page de contenu doit contenir :

- Le `_shared/drawer.html` inline (collapse persisted via localStorage)
- Le `_shared/header.html` inline (search-pill + icons + avatar)
- Le contenu propre a la page
- Un toggle "Default | [etat critique]" en haut de page (sauf default-only)
- Annotations dev en commentaire HTML (voir §10)
- Les imports `_shared/base.css` et `_shared/base.js`

# 6. ETATS CRITIQUES (1 par page sauf 3 sans)

Pour chaque page concernee, fournir 2 vues en variants accessibles via tabs :

| # | Page | Etat critique en plus du default |
|---|---|---|
| 1 | index.html | outlook-stale-warning (banner amber pleine largeur si lastSync > 4h) |
| 2 | arbitrage.html | loading-claude-recommendation (skeleton bullets pendant 2-3s) |
| 3 | evening.html | streak-celebration (anneau anime + confetti discret a 7/30/100j) |
| 4 | taches.html | empty-state ("Aucune tache en attente. Profite." + illu Lucide) |
| 5 | agenda.html | error-outlook-unreachable (banner amber + lien "Reessayer") |
| 6 | revues.html | draft-streaming (bilan se remplit chunk par chunk) |
| 7 | assistant.html | streaming-response (bulle en cours, curseur clignote, btn arret) |
| 8 | groupes.html | kpi-loading (skeletons KPIs par groupe) |
| 9 | projets.html | filter-active (multi-select chips actifs + count results) |
| 10 | projet.html | tab-decisions-empty (onglet decisions vide) |
| 11 | contacts.html | empty-search-results ("Aucun contact pour 'xyz'") |
| 12 | decisions.html | claude-recommendation-loading (bulle violet skeleton 2-3s) |

Total = 13 default + 9 etats critiques + 1 index nav = 23 vues. (3 pages T3
ont seulement default + etat critique, soit 6 vues T3 + 8 vues T1+T2 + index = ... )

NB : tab toggle "Default | [nom etat]" dans une barre sticky en haut de chaque
page concernee, style `toggle-group` (voir composants §7).

# 7. DRAWER COLLAPSIBLE (composant pivot, present sur 13 pages)

Voir `08-patterns-techniques.md` §11 pour spec complete.

Resume :
- 240px etendu / 60px collapse, transition `width 300ms ease-in-out`
- Fond `--brand` navy, texte cream
- 12 items + footer (Reglages + Avatar Feycoil)
- Toggle bouton chevron en bas, persiste dans localStorage
- Tooltips on hover en mode collapse
- Active state : background `--brand-2`, accent rose 3px sur la gauche

Items dans l'ordre :
1. Cockpit (home)
2. Arbitrage matinal (sun)
3. Boucle du soir (moon)
4. Taches (check-square) — badge nb taches du jour
5. Agenda (calendar)
6. Revues hebdo (refresh-cw)
7. Assistant chat (message-circle)
--- separateur ---
8. Societes (briefcase)
9. Projets (folder)
10. Contacts (users)
11. Decisions (git-branch)
--- footer ---
12. Reglages (settings)
13. Avatar Feycoil M. (CEO MHSSN)

Logo aiCEO en haut : monogramme "A" sur fond `--rose` 28px en mode etendu,
texte "aiCEO" 18px weight 800 a cote. En mode collapse : monogramme seul.

# 8. DONNEES REALISTES (extraction `01_app-web/assets/data.js` v4)

⚠ STRUCTURE REELLE : 3 groupes (pas 4). SCI Adabu et SCI Start sont SOUS MHSSN.

## Groupes (3)

- **MHSSN Holding** : gouvernance + SCI Start/Adabu + Affejee + FEIRASIN
- **AMANI** : 3 societes hotelieres Mayotte (Properties, Resorts, Hospitality)
- **ETIC Services** : services + ITH/LTM/AA + Ghams

## 14 projets reels, 25 contacts reels, 28 taches d'arbitrage S17,
## 10 decisions, 25 RDV S17-S18, 9 AI proposals

Voir `07-datasets-elargi.md` pour la liste complete a utiliser TELLE QUELLE.
Tu DOIS reprendre les noms reels (Marie Ansquer, Bénédicte, Jean Hentgen,
Maeva Ferrere, Rémi Giannetti, Chafick Mouhoussoune, etc.).

## Salutation cockpit

"Bonjour Feycoil," en script Aubrielle 44px. Sous-titre date longue
"jeudi 26 avril 2026" en Fira 14px text-2.

## Streak du soir

12 jours consecutifs (Sol thin 64px). Plus longue streak : 23j.

## Big Rocks S17 (3, max)

1. URGENT — Attestations CA Bretagne + LGoA (60%)
2. FF&E AMANI signe (70%)
3. Reglier honoraires Affejee + convention SCI (30%)

## Top 3 du jour (post-arbitrage)

1. t1 - Renvoyer Attestation Emprunteur a Marie Ansquer (P0, 15 min)
2. t2 - Signer Attestation modifiee PRET CA via LGoA (P0, 20 min)
3. t15 - Executer virement honoraires Franklin (P0, 10 min)

# 9. TON ET PERSONNALITE (copies)

- Direct, factuel, sans flatterie. Jamais de "Bravo !", "Genial !".
- Erreurs : "Outlook n'a pas repondu en 30 s" (pas "Oups !").
- Empty : "Aucune tache en attente. Profite." (pas "Wow tout est fait !").
- Confirmations : toast subtil top-right 2s.
- Numerique : tabulaire partout, jamais "0 taches" - ecrire "0 tache".
- Vocabulaire propre :
  - "cockpit" pas "tableau de bord"
  - "arbitrage matinal" pas "morning planning"
  - "boucle du soir" pas "evening routine"
  - "Big Rocks" pas "objectifs"
  - "alerte" pas "notification"
  - "groupe" pour les 3 entites holdings, "societe" pour les filiales,
    "projet" pour les chantiers
- Densite textuelle : <60 caracteres par ligne titre, <140 caracteres par
  ligne body, <30 caracteres par chip.

# 10. ANNOTATIONS DEV (en commentaire HTML, en haut de chaque page)

```html
<!--
  Page : taches.html
  Routes API consommees :
    - GET /api/tasks?...
    - POST /api/tasks
    - PATCH /api/tasks/:id
    - DELETE /api/tasks/:id
  Composants reutilisables (a extraire) :
    - PageHeader : title + cta
    - TaskCard : task + onChange
    - FilterBar : filters + values + onChange
    - Matrix2x2 : tasks + onMove (Eisenhower)
  Breakpoints : desktop only (1280-1920)
  Etats geres dans cette maquette : default, empty
  Micro-interactions :
    - hover task card -> elevation +1px, btn quick actions reveal
    - drag task -> ghost suit le curseur, drop zones surlignees emerald-50
    - confirm delete -> modal compact, bouton danger rose
    - keyboard : n -> nouvelle tache, / -> focus search, j/k navigation
  DS evolutions : aucune (respect strict tokens)
  Source dataset : 07-datasets-elargi.md sections 28 taches + filtres
-->
```

# 11. ACCESSIBILITY (OBLIGATOIRE)

## Contrastes WCAG AA minimum

- text + surface : 14.6:1 OK
- text-2 + surface : 7.1:1 OK
- text-3 + surface : 3.8:1 -> AA large only
- text-3 + surface-2 (#fff) : 3.0:1 -> FAIL, utiliser text-2 a la place

## Focus visible

```css
*:focus-visible{
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
```

## ARIA roles

- Modal : `role="dialog" aria-modal="true" aria-labelledby="..."`
- Toast : `role="status"` (success/info), `role="alert"` (error)
- Tabs : `role="tablist"` + `role="tab" aria-selected="..."`
- Search : `role="search"`
- Drawer : `aria-label="Navigation pr