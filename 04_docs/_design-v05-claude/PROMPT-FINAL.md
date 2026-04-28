# Prompt unique — Maquette Claude Design aiCEO v0.5 (v3.1)

> Version 3.1 — 26/04/2026 — refonte SaaS multi-CEO scalable + cadrage par version (v0.5/V1/V2/V3) suite audit roadmap.
> Backups : `PROMPT-FINAL-v1.md`, `PROMPT-FINAL-v2.md`.
> 15 pièces jointes à uploader simultanément.

## ⚠ POSTURE DE LA MAQUETTE (à comprendre avant de lancer)

Cette maquette représente la **vision produit complète v0.5 → V3** sur 18 mois (1.68 M€ cumul). Pas seulement le sprint v0.5 (110 k€).

**Audiences distinctes** :
- **Équipe dev v0.5** : implémente uniquement les features taggées `[target: v0.5]`. Le reste sert de référence visuelle architecturale.
- **Board / investisseurs / partenaires** : la maquette incarne la trajectoire 18 mois — démontre la crédibilité produit.
- **Feycoil dogfood** : l'app v0.5 réelle reste mono-user (lui), MHSSN/AMANI/ETIC (pas Northwind), desktop only, FR only.

Ne PAS confondre maquette de design produit et sprint plan dev. Voir `17-cadrage-livraison-par-version.md` pour le mapping feature × version.

## Pièces jointes à uploader (15 fichiers)

1. `00-REFERENCE-VISUELLE-twisty.png` — image étalon visuel
2. `01-tokens.json` — Design System canonique aiCEO
3. `02-colors_and_type.css` — variables CSS générées
4. `03-spec-extraits.md` — extrait pertinent SPEC fonctionnelle
5. `04-pages-detail.md` — fiche détaillée des 13 pages
6. `05-persona.md` — persona Feyçoil + 3 groupes (legacy)
7. `06-composants-catalogue.md` — 16 composants UI prêts
8. `07-datasets-elargi.md` — datasets v2 réels Feycoil/MHSSN (legacy mais utile pour v0.5 dev)
9. `08-patterns-techniques.md` — motion, drag&drop, charts, palette, accessibility
10. `09-tenant-demo-personae.md` — Northwind Holdings (tenant démo générique pour vision)
11. `10-coaching-patterns.md` — tone scripts, time-of-day, mirror moments, recovery
12. `11-responsive-spec.md` — breakpoints, layouts mobile/tablet/desktop, PWA
13. `12-i18n-spec.md` — architecture i18n FR+EN, RTL prep, formats locale
14. `13-architecture-atomique.md` — atomic design, tokens hierarchy, ITCSS, perf
15. `14-microcopy-principes-impact.md` — microcopy FR+EN, 7 principes design, score santé
16. `17-cadrage-livraison-par-version.md` — ⭐ **NOUVEAU** mapping feature × version (v0.5/V1/V2/V3) pour équipe dev

---

## Le prompt (à copier intégralement)

```
# Brief design — aiCEO v0.5 (SaaS multi-CEO, fully responsive, multilingue)

Tu es designer produit senior + dev front avec 15 ans chez les meilleurs
editeurs (Linear, Notion, Stripe, Figma, Anthropic). Tu appliques tes
enseignements.

Mission : maquette complete hi-fi du copilote SaaS aiCEO v0.5, pour CEO
multi-entites, prete pour integration dev a 100 %.

# 0. PIECES JOINTES — UTILISATION OBLIGATOIRE

Tu disposes de 14 fichiers. Tu DOIS t'y reporter avant de produire chaque
element :

1. `00-REFERENCE-VISUELLE-twisty.png` — etalon visuel pixel-pres (radius,
   chips, dot chart, stat hero, list-card)
2. `01-tokens.json` + `02-colors_and_type.css` — variables CSS canoniques.
   Aucun hex en dur dans ton output.
3. `03-spec-extraits.md` — criteres d'acceptation
4. `04-pages-detail.md` — role/contenu/API/etat critique par page
5. `05-persona.md` (legacy) — garder pour reference structurelle
6. `06-composants-catalogue.md` — 16 composants UI a REUTILISER tels quels
7. `07-datasets-elargi.md` (legacy v2 — REMPLACE par 09)
8. `08-patterns-techniques.md` — motion, drag&drop, charts, palette,
   accessibility, formats FR
9. `09-tenant-demo-personae.md` ⭐ TENANT DEMO PRINCIPAL :
   Northwind Holdings + Sarah Chen + 3 houses (Northwind/Solstice/Helix).
   AUCUN nom reel : Sarah, Léa Moreau, Marc Dupont, Anya Petrova, Jonas
   Keller, etc.
10. `10-coaching-patterns.md` ⭐ DIFFERENCIATEUR : tone scripts par contexte
    (humeur, time-of-day), friction positive, mirror moments, recovery,
    posture strategique, anti-gamification
11. `11-responsive-spec.md` ⭐ RESPONSIVE COMPLET : breakpoints, navigation
    par device (bottom-tab mobile, drawer 60px tablet, drawer 240px
    desktop), gestures (swipe, long-press, pull-to-refresh), PWA, FAB,
    bottom sheets, safe-area-inset
12. `12-i18n-spec.md` ⭐ MULTILINGUE : architecture FR+EN, dictionnaires,
    pluralization, RTL prep, formats locale (date/time/number/currency)
13. `13-architecture-atomique.md` ⭐ ROBUSTESSE : atomic design 6 niveaux,
    tokens hierarchy 3 niveaux (primitive/semantic/component), ITCSS,
    BEM avec prefixes, theming JSON, perf budget, SVG sprite, service
    worker, error boundaries
14. `14-microcopy-principes-impact.md` ⭐ MICROCOPY FR+EN exhaustif,
    7 principes design fondateurs, voice & tone, score sante executive,
    time saved metric
15. `17-cadrage-livraison-par-version.md` ⭐⭐⭐ MAPPING FEATURE × VERSION
    (v0.5/V1/V2/V3). LECTURE OBLIGATOIRE avant tout commit. Definit
    quoi est livre en v0.5 vs V1/V2/V3.

Si un element manque, demande AVANT d'inventer.

# 0bis. POSTURE DE LA MAQUETTE — VISION PRODUIT v0.5 → V3

Cette maquette represente la TRAJECTOIRE PRODUIT 18 MOIS (1.68 M EUR cumul),
pas seulement le sprint v0.5 (110 k EUR).

Audiences :
1. Equipe dev v0.5 : n'implemente QUE les features taggees [target: v0.5]
2. Board / investisseurs : maquette en mode "Live" pour demo trajectoire
3. Feycoil dogfood : app v0.5 reelle = mono-user MHSSN/AMANI/ETIC desktop FR

Pour CHAQUE composant que tu produis, ajoute dans les annotations dev HTML
le tag [target: v0.5 | V1 | V2 | V3] avec la version cible de la feature.

Voir `17-cadrage-livraison-par-version.md` pour le mapping complet.

Mode rendu :
- Par defaut : Live (toutes features visibles, comme si dispo)
- Mode "vue dev" : toggle dans index-nav.html qui bascule en placeholder
  pour les features hors v0.5 (opacity 0.5 + badge "Bientot · V1/V2/V3")

# 1. CONTEXTE PRODUIT

aiCEO est un SaaS qui sert tout CEO multi-entites (3-10 societes via
holdings, family offices, multi-business operators).

Persona principal demo : **Sarah Chen, founder & CEO Northwind Holdings**,
40 ans, Geneve. Pilote 3 houses :
- **Northwind Capital** (family office, indigo)
- **Solstice Hospitality** (3 hotels Mediterranee, rose)
- **Helix Services** (conseil tech B2B, amber)

Voir `09-tenant-demo-personae.md` pour donnees completes (12 societes,
14 projets, 25 contacts, 25 taches arbitrage S17, 8 decisions, 25 RDV).

Le produit propose 3 rituels :
- **Matin** (5 min) : arbitrage IA-assiste 25 taches en buckets faire/
  deleguer/reporter
- **Soir** (2 min) : bilan humeur + energie + top 3 demain + streak
- **Hebdo** (dimanche, 20 min) : revue Big Rocks + cap S+1 (auto-draft
  par Claude)

# 2. REFERENCE VISUELLE — GOLD STANDARD

Image jointe : `00-REFERENCE-VISUELLE-twisty.png`. Patterns OBLIGATOIRES :

- Radius conteneur principal 28-32px, cartes 18-24px, chips pill
- Densite aere mais riche (32px padding hero, 24px gouttiere)
- Stat hero (chiffres geants 64px Sol thin, caption 2 lignes)
- Value pill (callout brand navy filled au-dessus d'un dot chart)
- Day pills S M T W T F S (ronds, actif filled brand)
- List-card avec rows (icone carree + label + chip + chevron toggle)
- Avatar circulaire + chip overlay
- Tabs underline (ligne fine sous link actif)
- Top right cluster (search-pill + icones + avatar)

ANTI-patterns INTERDITS :
- Pas d'ombre 3D, pas de gradient candy, pas de glow, pas de skeumorphisme
- Pas de couleurs criardes (Trello/Asana style)
- Pas d'icones decoratives gratuites
- Pas de hamburger menu desktop

# 3. SCOPE PRODUIT v0.5 SAAS

## 3.1 Multi-tenant

- Tenant unique demo : Northwind Holdings
- Switcher tenant dans le drawer (montre 3 archetypes : Northwind / Acme /
  Stratos), 2 derniers grises avec "Bientot disponible"
- Vocabulary configurable : Sarah utilise "house" (pas "groupe"). Affiche
  donc "Mes houses" partout (settings le confirme)
- Couleurs houses : `--color-house-1` indigo, `--color-house-2` rose,
  `--color-house-3` amber
- Logo aiCEO par defaut, replacable par logo tenant en compte paye

## 3.2 Fully responsive

3 viewports OBLIGATOIRES sur Tier 0+1+2 :
- **Mobile** 390px (iPhone 14)
- **Tablet** 1024px (iPad)
- **Desktop** 1440px

Tier 3 (registres) : desktop only en demo (mobile en V1+).

Voir `11-responsive-spec.md` pour layouts detailles par device.

## 3.3 Multilingue

- **FR** principal (defaut)
- **EN** sur 3 vues cles : cockpit, onboarding etape 3, settings
- **RTL** simulation sur 1 vue : settings (placeholder ar/he generique)

Voir `12-i18n-spec.md` pour architecture + dictionnaires + formats.

## 3.4 Accessibilite

- WCAG 2.2 AA minimum global, **AAA cible sur ecrans critiques** (cockpit,
  arbitrage, evening)
- Skip links sur chaque page
- Focus visible 2px brand offset 2px
- ARIA roles/labels stricts
- Navigation 100 % au clavier (drag&drop accessible avec espace + fleches)
- prefers-reduced-motion respecte
- Color blindness : status pills = couleur + icon (pas seulement couleur)

## 3.5 Coaching

Patterns OBLIGATOIRES visibles dans la maquette (voir `10-coaching-
patterns.md`) :

- **Salutation matin adaptive** : varie selon humeur veille (bien / moyen /
  mauvaise / streak break) — montrer 2 variants
- **Time-of-day adaptation** : cockpit varie selon heure (matin / journee /
  evening / nuit) — montrer 2 variants
- **Friction positive** : 5e P0 ajoutee declenche modal soft "5 P0
  aujourd'hui. Tout est urgent ?" — montrer 1 variant arbitrage
- **Mirror moments** : observation factuelle hebdo dans revues.html —
  montrer 1 variant
- **Recovery** : streak break sans drame ("Pas grave, on reprend") —
  montrer 1 variant evening
- **Posture strategique** : question du mois en footer cockpit
- **Coach prompt** : conversation pre-amorcee dans assistant.html — 1 variant
- **Anti-gamification** : confirmer absence de levels/XP/leaderboard, juste
  streak factuel

# 4. SYSTEME DE DESIGN — TOKENS A RESPECTER

Voir `01-tokens.json`, `02-colors_and_type.css`, `13-architecture-
atomique.md`.

Tokens en 3 niveaux :
- **Primitive** : `--color-rose-500: #d96d3e`
- **Semantic** : `--color-danger: var(--color-rose-500)`
- **Component** (optionnel) : `--button-primary-bg: var(--color-brand)`

⚠ Toujours utiliser les semantic tokens dans tes composants (pas les
primitives directement). Pas un seul hex en dur.

## 4.1 Couleurs semantiques (extraits)

```css
--color-bg: var(--color-lavender-bg);          /* #a9adbe */
--color-surface: var(--color-cream-100);        /* #f5f3ef */
--color-surface-elevated: #ffffff;
--color-surface-sunken: var(--color-cream-200); /* #eeebe4 */

--color-brand: var(--color-navy-900);           /* #111418 */
--color-brand-hover: var(--color-navy-700);

--color-text: var(--color-navy-900);
--color-text-secondary: #4b5564;
--color-text-tertiary: #737c89;

--color-success: var(--color-emerald-500);
--color-warning: var(--color-amber-500);
--color-danger:  var(--color-rose-500);
--color-info:    var(--color-sky-500);
--color-coaching:var(--color-violet-500);

--color-house-1: var(--color-indigo-500);
--color-house-2: var(--color-rose-500);
--color-house-3: var(--color-amber-500);
```

## 4.2 Typographie

- **Aubrielle** : SEUL pour salutations + hero rituels (>= 36px)
- **Sol** : SEUL pour chiffres ouverts >= 28px (streaks, KPIs hero)
- **Fira Sans** : tout le reste
- font-variant-numeric: tabular-nums sur tous chiffres

## 4.3 Iconographie

Lucide stroke 1.5, currentColor, sizes 12/14/16/20/24px.
SVG sprite recommande pour les 30 icones (`/icons.svg` avec `<symbol>`).

## 4.4 Spacing scale

Multiples de 4 OBLIGATOIRES : `--size-1` (4) -> `--size-16` (64).
Aucune valeur ad hoc (jamais `padding: 13px`).

# 5. STACK TECHNIQUE

## 5.1 CSS architecture (ITCSS)

```
01_settings/    Tokens (3 niveaux)
02_tools/       (n/a CSS pur)
03_generic/     Reset
04_elements/    Defaults h1, p, a
05_objects/     .o-grid, .o-stack, .o-cluster (layout primitives)
06_components/  .c-button, .c-card, .c-modal, .c-task-card
07_utilities/   .u-text-center, .u-mt-4
```

Naming : BEM avec prefixes (`c-`, `o-`, `u-`, `t-`, `is-`, `has-`).

## 5.2 Hybride 60/40

- 60 % vars CSS : couleurs, typo, radius, spacing
- 40 % Tailwind utilities (CDN) : layout, states, responsive

JAMAIS de couleur Tailwind (`bg-blue-500`). Toujours `style="background:
var(--color-surface-elevated)"`.

## 5.3 JavaScript

Vanilla JS pur (pas de framework). Limite a :
- Drawer collapse + persist localStorage
- Tabs switching
- Modals + focus trap + esc
- Toast auto-dismiss
- Drag & drop HTML5 + clavier (espace + fleches)
- Tooltips delay 500ms
- Command palette ⌘K
- Auto-save indicator
- Streaming SSE simulation (setTimeout chunks)
- Bottom-tab nav mobile + FAB
- Bottom sheets (mobile, swipe-to-dismiss)
- Pull-to-refresh
- i18n switcher (toggle FR/EN sur cockpit/onboarding/settings)

## 5.4 Performance budget

- LCP < 2.5s mobile / < 1.5s desktop
- Bundle JS initial < 100kb mobile
- Critical CSS inline < 14kb
- SVG sprite icones < 20kb total
- Service worker cache shell

# 6. PERIMETRE — 16 PAGES, ~62 VUES

## 6.1 Tier 0 — Onboarding & Settings (NOUVEAU v3)

**Onboarding** (`onboarding.html`) — 1 etape clé du wizard
- Etape 3/7 (creation des houses) — desktop + mobile
- + 1 EN locale demo

**Settings** (`settings.html`) — 8 sections en accordeon
- Default desktop + mobile
- + 1 EN locale demo (cockpit en EN)
- + 1 RTL simulation (settings en arabe placeholder)

**Components Gallery** (`components.html`) — desktop only
- Mini-storybook visuel : tous les composants UI rassembles
- Sections : atoms / molecules / organisms / patterns

## 6.2 Tier 1 — Cockpit & rituels (3 viewports)

| Page | Desktop | Tablet | Mobile | Etats |
|---|---|---|---|---|
| `index.html` | ✅ default | ✅ | ✅ | + 1 evening saliance + 1 mobile-night |
| `arbitrage.html` | ✅ default | ✅ | ✅ | + 1 loading-claude + 1 friction-positive |
| `evening.html` | ✅ default | ✅ | ✅ | + 1 streak-celebration + 1 streak-break |

## 6.3 Tier 2 — Travail courant (3 viewports)

| Page | Desktop | Tablet | Mobile | Etats |
|---|---|---|---|---|
| `taches.html` | ✅ | ✅ | ✅ | + 1 empty + 1 quadrant-mobile |
| `agenda.html` | ✅ | ✅ | ✅ | + 1 error-outlook + 1 vue-jour-mobile |
| `revues.html` | ✅ | ✅ | ✅ | + 1 mirror-moment + 1 draft-streaming |
| `assistant.html` | ✅ | ✅ | ✅ | + 1 streaming + 1 coach-prompt + 1 mobile-fullscreen |

## 6.4 Tier 3 — Registres (desktop only)

| Page | Desktop | Etats |
|---|---|---|
| `groupes.html` | ✅ | + 1 kpi-loading |
| `projets.html` | ✅ | + 1 filter-active |
| `projet.html` | ✅ | + 1 tab-decisions-empty |
| `contacts.html` | ✅ | + 1 empty-search |
| `decisions.html` | ✅ | + 1 reco-loading |

## 6.5 Index navigation

`index-nav.html` × 3 viewports.

## 6.6 Total vues

~62 vues. Ambitieux. Stratégie de génération en 3 vagues §16.

# 7. DRAWER COLLAPSIBLE (responsive)

Voir `08-patterns-techniques.md` §11 + `11-responsive-spec.md` §2.

## 7.1 Desktop : drawer 240px <-> 60px

Toggle chevron en bas. Persiste dans `localStorage["aiCEO.uiPrefs.drawerCollapsed"]` (la SEULE clé localStorage applicative tolerée par ADR S2.00 / S4.00).

## 7.2 Tablet : drawer 60px par defaut, expand overlay

Sur tablette, drawer est en mode collapsed 60px par défaut. L'expand temporaire est en overlay (push-aside par dessus le contenu).

## 7.3 Mobile : bottom-tab nav

Disparait, remplace par bottom-tab nav 5 items :
- Cockpit (home)
- Tâches (check-square)
- **+ FAB centre** (plus)
- Agenda (calendar)
- Plus (menu) — ouvre drawer overlay avec tous les items

Hauteur 56px + safe-area-inset-bottom. Active : couleur brand, label.

## 7.4 Items drawer (12)

1. Cockpit
2. Arbitrage matinal
3. Boucle du soir
4. Tâches (badge nb taches du jour)
5. Agenda
6. Revues hebdo
7. Assistant chat
--- separateur ---
8. Houses (mes houses, pas "groupes" — vocabulary configurable)
9. Projets
10. Contacts
11. Décisions
--- footer ---
12. Réglages
13. Avatar Sarah Chen (CEO Northwind Holdings)

## 7.5 Logo aiCEO

Monogramme "A" sur fond `--color-rose` 28×28 mode étendu, + texte "aiCEO" 18px weight 800. En collapse : monogramme seul.
Dans la maquette : logo aiCEO démo. Settings montre la possibilité de remplacer par logo tenant.

# 8. ETATS CRITIQUES (par page)

Pour chaque page concernée, fournir 2-3 vues en variants accessibles via tabs :

| Page | Etats critiques |
|---|---|
| index | default + outlook-stale-warning + evening-saliance + mobile-night |
| arbitrage | default + loading-claude + friction-positive |
| evening | default + streak-celebration + streak-break |
| taches | default + empty + quadrant-mobile |
| agenda | default + error-outlook + vue-jour-mobile |
| revues | default + mirror-moment + draft-streaming |
| assistant | default + streaming + coach-prompt + mobile-fullscreen |
| onboarding | default + EN locale |
| settings | default + EN locale + RTL simulation |
| groupes | default + kpi-loading |
| projets | default + filter-active |
| projet | default + tab-decisions-empty |
| contacts | default + empty-search |
| decisions | default + reco-loading |

Toggle "Default | [état] | [état]" en haut de page (sticky bar, style toggle-group).

# 9. DONNEES (Northwind Holdings)

Voir `09-tenant-demo-personae.md`.

⚠ AUCUN nom reel : Sarah Chen, Léa Moreau, Marc Dupont, Anya Petrova, Jonas Keller, Karim Habib, Tobias Brandt, Mei Tanaka, etc. Pas de Feyçoil, MHSSN, AMANI, ETIC.

## 9.1 Salutation

- FR : "Bonjour Sarah," (Aubrielle 44px) ou variants coaching
- EN : "Good morning, Sarah,"

## 9.2 3 Big Rocks de la semaine

1. **Pacte d'actionnaires v2 validé** (60 %) — deadline 25/04
2. **Spa Mallorca — engagement Habib Frères** (75 %) — deadline 23/04
3. **Major bank Helix renouvellement OK** (80 %) — deadline 26/04

## 9.3 Top 3 du jour (post-arbitrage)

1. t6 — Valider devis FF&E Spa Mallorca (P0, 60 min)
2. t7 — Signer contrat-cadre Habib Frères (P0, 20 min)
3. t1 — Valider draft pacte v2 (P0, 30 min)

## 9.4 Streak

18 jours consécutifs. Plus longue 31 j. Mois 18/26.

# 10. TON ET PERSONNALITE

Voir `14-microcopy-principes-impact.md` Partie 1.

Resume :
- Direct, factuel, pas de flatterie ("Bravo", "Genial")
- Erreurs factuelles ("Outlook n'a pas repondu en 30 s")
- Empty: "Aucune tache en attente. Profite."
- Vocabulaire : cockpit, arbitrage matinal, boucle du soir, Big Rocks,
  alerte, house (vocabulary tenant-configurable)

# 11. ACCESSIBILITY (WCAG AAA cible cockpit + AA global)

Voir `08-patterns-techniques.md` §12 + `13-architecture-atomique.md`.

OBLIGATOIRE :
- Skip links chaque page
- Focus visible 2px brand offset 2px
- ARIA roles strict
- Navigation 100 % clavier
- prefers-reduced-motion
- Color blindness : status = couleur + icon
- Cognitive load : option mode simplifie dans settings (placeholder dans la
  maquette, pas implemente)
- Larger text : 100% / 110% / 125% / 150% dans settings (placeholder)

# 12. RESPONSIVE — patterns mobile critiques

Voir `11-responsive-spec.md`.

## 12.1 Bottom-tab nav

5 items + FAB + safe-area-inset-bottom.

## 12.2 FAB (+ Nouvelle tâche)

56px ronde, position fixed bottom: 16+56+safe-area, right: 16, brand bg, white +.

## 12.3 Bottom sheets

Remplacent les modals desktop sur mobile. Slide-up depuis bas. Handle visuel haut. Swipe-to-dismiss.

## 12.4 Sticky headers mobile

Position sticky top: safe-area, backdrop-filter blur, back arrow + titre + actions.

## 12.5 Pull-to-refresh

Sur listes (taches, contacts, decisions). 60px tire = trigger.

## 12.6 Swipe gestures

- Swipe gauche task : reveal actions
- Swipe droite task : marker done
- Long-press (500ms) : mode edition
- Pinch agenda : zoom semaine <-> jour
- Swipe entre buckets arbitrage

## 12.7 Cockpit mobile (layout vertical)

- Stack 1 col
- Hero "Carte Matin" pleine largeur
- Big Rocks en carrousel horizontal swipeable
- Carte Soir
- Compteurs grid 2x2

## 12.8 Arbitrage mobile

- Tabs horizontaux : Faire (3) | Déléguer (5) | Reporter (12)
- Une colonne visible a la fois
- Swipe gauche/droite pour changer
- FAB "Valider" persistante

## 12.9 Agenda mobile

Vue jour par défaut, swipe semaine en lecture seule.

## 12.10 PWA

- manifest.webmanifest avec icones, theme-color
- Service worker cache shell + assets
- Install prompt iOS/Android
- safe-area-inset-* partout
- 100dvh au lieu de 100vh

# 13. INTERNATIONALISATION

Voir `12-i18n-spec.md`.

## 13.1 Architecture

- Strings dans `_shared/i18n/{fr,en}.json`
- Helper `t('key', vars)` avec interpolation
- Pluralization via `Intl.PluralRules`
- Detection auto navigator.language
- Persiste localStorage "aiCEO.uiPrefs.locale"

## 13.2 Demo dans la maquette

- Cockpit en EN (1 vue toggle)
- Onboarding etape 3 en EN (1 vue toggle)
- Settings avec switcher locale ouvert (1 vue)
- Settings en RTL simulation (1 vue, placeholder ar/he)

## 13.3 Locale switcher UI

Drawer footer (au-dessus de Reglages) : globe icon + langue actuelle + chevron.
Click → menu dropdown avec FR / EN + flag emoji.

## 13.4 Vocabulary configurable (entityLabel)

Sarah Chen utilise "house" plutot que "groupe". Donc : "Mes houses", "Voir cette house", "Houses (3)" partout. Settings → Vocabulary montre l'option.

## 13.5 Formats par locale

```javascript
new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
// → "26 avril 2026"
new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
// → "April 26, 2026"
```

Heure 24h en FR (avec "h": "14h30"), 12h en EN ("2:30 PM").

# 14. COACHING — vues a integrer

Voir `10-coaching-patterns.md`.

| Pattern | Page | Variant a livrer |
|---|---|---|
| Salutation morning adaptive | index.html | Variant "humeur mauvaise" : "Bonjour Sarah. On reprend en douceur." |
| Time-of-day cockpit | index.html | Variant "evening saliance" (17-20h) : carte Soir saillante gradient violet |
| Friction positive (5e P0) | arbitrage.html | Variant modal soft : "5 P0 aujourd'hui. Tout est urgent ? [Continuer] [Réviser]" |
| Mirror moment | revues.html | Variant : banner top "🪞 Cette semaine, j'ai noté : • Tu as délégué 8 tâches (vs 3) • ..." |
| Recovery streak break | evening.html | Variant : message doux "Streak interrompu à 23 jours. C'est OK." |
| Posture strategique footer | index.html | Footer cockpit : "✨ Question du mois : Quelle décision repousses-tu depuis 6 mois ?" |
| Coach prompt assistant | assistant.html | Variant "coach-prompt" : conversation pré-amorcée avec question hebdo |

# 15. SCORE D'IMPACT (mesure CEO)

Voir `14-microcopy-principes-impact.md` Partie 3.

Affichages obligatoires :
- **Score sante executive** : ring chart 70/100 + tendance dans `revues.html` (vue mirror moment)
- **Time saved** : footer cockpit "Cette semaine : 3h12 économisées"
- **Decision velocity** : visible dans mirror moment revues
- **Strategic vs tactical ratio** : KPI compteurs cockpit "Stratégique : 55% (cible 70%)"

# 16. STRATEGIE DE LIVRAISON — 3 VAGUES

Vu la volumétrie (~62 vues), livre EN 3 VAGUES avec confirmation entre chaque :

## Vague 1 : Tier 0 + Tier 1 (cockpit + rituels)

Génere :
1. `_shared/base.css` (imports tokens 3 niveaux, ITCSS, reset)
2. `_shared/base.js` (helpers : drawer, modals, palette, i18n switcher,
   bottom-sheet, FAB, pull-to-refresh)
3. `_shared/icons.svg` (sprite 30 icones Lucide)
4. `_shared/drawer.html`, `header.html`, `footer.html`, `bottom-tab-nav.html`
5. `index-nav.html` (× 3 viewports)
6. `onboarding.html` (etape 3 desktop + mobile + EN)
7. `settings.html` (desktop + mobile + EN + RTL)
8. `components.html` (gallery desktop)
9. `index.html` Tier 1 (× 3 viewports + 4 etats)
10. `arbitrage.html` Tier 1 (× 3 viewports + 3 etats)
11. `evening.html` Tier 1 (× 3 viewports + 3 etats)

ATTENDS confirmation utilisateur : "continue vague 2".

## Vague 2 : Tier 2 (travail courant)

Genere :
1. `taches.html` (× 3 viewports + 3 etats)
2. `agenda.html` (× 3 viewports + 3 etats)
3. `revues.html` (× 3 viewports + 3 etats avec score sante)
4. `assistant.html` (× 3 viewports + 4 etats)

ATTENDS confirmation : "continue vague 3".

## Vague 3 : Tier 3 (registres, desktop only)

Genere :
1. `groupes.html` (desktop + 1 etat)
2. `projets.html` (desktop + 1 etat)
3. `projet.html` (desktop + 1 etat)
4. `contacts.html` (desktop + 1 etat)
5. `decisions.html` (desktop + 1 etat)

# 17. CRITERES DE REUSSITE (auto-evaluation finale)

Une vague est validee si :

0. ✅ CHAQUE composant non-trivial a un tag [target: v0.5/V1/V2/V3] dans
     les annotations HTML (voir `17-cadrage-livraison-par-version.md`)
1. ✅ Aucun hex en dur (tokens uniquement)
2. ✅ Aucun nom reel (Northwind/Sarah/Léa/etc. uniquement)
3. ✅ Tier 1+2 sur 3 viewports (desktop + tablet + mobile)
4. ✅ Tier 3 desktop only
5. ✅ Bottom-tab nav mobile fonctionne
6. ✅ Drawer collapsible desktop fonctionne
7. ✅ Composants reutilises depuis `06-composants-catalogue.md`
8. ✅ Tous les patterns coaching visibles (8 listes §14)
9. ✅ EN locale sur 3 vues cles
10. ✅ RTL simulation sur 1 vue settings
11. ✅ Skip links + focus visible sur toutes les pages
12. ✅ Annotations dev en commentaire HTML
13. ✅ Index nav permet de naviguer entre pages + viewports + etats
14. ✅ Performance : critical CSS inline, SVG sprite, service worker
15. ✅ FAB mobile sur pages avec creation
16. ✅ Bottom sheets remplacent modals sur mobile
17. ✅ Score sante executive visible dans revues
18. ✅ Time saved visible dans footer cockpit
19. ✅ Vocabulary configurable : "houses" pas "groupes"
20. ✅ Time-of-day adaptation visible (2 variants cockpit)

# 18. AVANT DE COMMENCER

Si tu detectes une question structurelle, POSE LA AVANT.

Exemples legitimes :
- "L'image Twisty couvre desktop. Je propose pour mobile une inspiration
  Linear/Cron — OK ?"
- "Le RTL simulation : tu veux une langue placeholder spécifique (ar/he) ou
  juste un layout flippé ?"
- "Sur mobile, pour Eisenhower, je propose un seul quadrant a la fois avec
  filtre chip — OK ?"

Sinon, commence par la **vague 1**, ordre :
1. base.css
2. base.js
3. icons.svg
4. _shared/* components
5. onboarding.html
6. settings.html
7. components.html
8. index-nav.html (3 viewports)
9. index.html (Tier 1, 3 viewports + variants)
10. arbitrage.html (Tier 1)
11. evening.html (Tier 1)

ATTENDS confirmation avant Vague 2.

GO.
```

---

## Notes méthodologiques (hors prompt)

### Évolution v2 → v3

| Aspect | v2 | v3 | Gain |
|---|---|---|---|
| Taille prompt | 16k chars | ~28k chars | +75 % |
| Pièces jointes | 9 | 14 (ou 15 selon comptage) | +5 |
| Pages | 13 | 16 (+ onboarding, settings, components) | +23 % |
| Vues | 23 | ~62 | +170 % |
| Multi-tenant | Absent | Architecture complète + tenant démo | nouveau |
| Responsive | Desktop only | Mobile + tablet + desktop | nouveau |
| Coaching | 0 pattern | 8 patterns visibles + 1 ressource | nouveau |
| i18n | 0 | FR + EN + RTL prep | nouveau |
| Architecture | CSS basique | Atomic + tokens 3 niveaux + ITCSS + perf budget | nouveau |
| Microcopy | inexistant | FR + EN exhaustif | nouveau |
| Score d'impact | absent | 4 métriques visibles | nouveau |

### Score qualité estimé

- **v1** : 7,5/10 (correct, mono-user)
- **v2** : 9,5/10 (cohérent, mono-tenant, desktop only)
- **v3** : **9,5/10 sur scope SaaS multi-CEO, fully responsive, multilingue, coaching, accessibilité, robustesse**

### Risques résiduels v3

1. **Volumétrie 62 vues** : c'est au plafond. Stratégie 3 vagues §16 du prompt mitige.
2. **Image Twisty insuffisante** pour mobile : Claude Design devra inférer ou demander confirmation.
3. **Cohérence cross-vagues** : risque que vague 2 dérive de vague 1. Mitigation : composants `_shared/` strictement réutilisés.
4. **Effort dev** : la maquette générée représente un effort dev de 60-80 jours. Aligner avec le plan de sprints.

### Bundle final

```
04_docs/_design-v05-claude/
├── README.md
├── PROMPT-FINAL.md  ⭐ v3 (28k chars)
├── PROMPT-FINAL-v1.md
├── PROMPT-FINAL-v2.md
├── decisions/                       (5 fichiers)
└── ressources-a-joindre/            (15 fichiers)
    ├── 00-REFERENCE-VISUELLE-twisty.png
    ├── 00-REFERENCE-VISUELLE-instructions.md
    ├── 01-tokens.json
    ├── 02-colors_and_type.css
    ├── 03-spec-extraits.md
    ├── 04-pages-detail.md
    ├── 05-persona.md (legacy)
    ├── 06-composants-catalogue.md
    ├── 07-datasets-elargi.md (legacy)
    ├── 08-patterns-techniques.md
    ├── 09-tenant-demo-personae.md  ⭐
    ├── 10-coaching-patterns.md  ⭐
    ├── 11-responsive-spec.md  ⭐
    ├── 12-i18n-spec.md  ⭐
    ├── 13-architecture-atomique.md  ⭐
    └── 14-microcopy-principes-impact.md  ⭐
```
