# Angles morts v2 — revue d'expert design senior

> Posture : 15+ ans d'expérience design produit chez les meilleurs éditeurs (Linear, Notion, Stripe, Figma, Anthropic, etc.).
> Date : 26/04/2026
> Contexte : nouveau scope multi-CEO SaaS, fully responsive, multilingue, accessibilité, coaching, robustesse.

## Verdict global

Le brief v2 actuel produira une maquette **9,5/10 pour un usage personnel mono-user**. Avec les nouvelles contraintes, on tombe à **5/10** car ~70 % des décisions structurantes sont absentes : multi-tenant, responsive, i18n, coaching, architecture component-driven.

Cette analyse identifie **22 catégories d'angles morts** et **~180 améliorations**, hiérarchisées P0/P1/P2 selon leur impact sur la maquette v0.5 vs la roadmap V1+.

Ce qu'il faut accepter avant de lire : on ne peut pas TOUT mettre dans la maquette v0.5. Une maquette est une **preuve** visuelle, pas un produit. La discipline consiste à choisir ce qui est visible (in-maquette) et ce qui est documenté comme exigence (in-prompt mais pas in-écran).

---

## Synthèse rapide — 22 catégories

| # | Catégorie | Couverture v2 actuelle | Effort intégration |
|---|---|---|---|
| A | Multi-tenant & dépersonnalisation | 0 % | LOURD |
| B | Responsive multi-device | 0 % (desktop only) | LOURD |
| C | Humanisation & coaching CEO | 20 % (ton ok, patterns absents) | MOYEN |
| D | Accessibilité avancée (WCAG AAA cibles) | 30 % (AA noté, AAA absent) | MOYEN |
| E | Internationalisation (i18n + RTL) | 0 % | LOURD |
| F | Robustesse architecturale | 20 % (CSS ok, comp library absent) | LOURD |
| G | Onboarding & activation | 0 % | LOURD |
| H | Personnalisation tenant | 10 % | MOYEN |
| I | Notifications & async | 0 % | MOYEN |
| J | AI / Copilot transparence | 30 % (sources oui, transparency non) | MOYEN |
| K | Intégrations externes | 10 % (Outlook only) | LOURD |
| L | Sécurité & privacy | 0 % | MOYEN |
| M | États & erreurs (cross-cutting) | 40 % (états critiques par page) | LÉGER |
| N | Analytics & métriques produit | 0 % | LÉGER |
| O | Polish micro-interactions | 50 % (motion ok, sound/haptic non) | LÉGER |
| P | Content strategy | 30 % | MOYEN |
| Q | Design system avancé (atomic + tokens hierarchy) | 40 % | MOYEN |
| R | Documentation design | 0 % | LÉGER |
| S | Contracts API & data | 30 % (endpoints listés) | MOYEN |
| T | Adoption & marketing | 0 % | HORS-SCOPE |
| U | Différenciation concurrentielle | 0 % | MOYEN |
| V | Mesure de l'impact CEO (outcome-based) | 0 % | MOYEN |

---

## A. Multi-tenant & dépersonnalisation (CRITIQUE — refonte complète)

### Le manque
La v2 utilise les vraies données Feyçoil/MHSSN/AMANI/ETIC. Pour un SaaS multi-CEO, ce n'est plus possible.

### A1. Architecture data multi-tenant (P0 maquette)
- Toute donnée a un `tenant_id` invisible
- Pas de leak cross-tenant possible
- Settings tenant : couleurs, logo, vocabulaire (groupe/holding/entité), langue, fuseau horaire
- Démo tenant : un dataset réaliste mais générique (ex : "Acme Holding", "Globex Capital", "Initech Services")

### A2. Dataset démo générique (P0 maquette)
**Action immédiate** : remplacer dans `07-datasets-elargi.md` :
- MHSSN → "Northwind Holdings" (gouvernance, immobilier, family office)
- AMANI → "Solstice Hospitality" (hôtellerie, exploitation, certification)
- ETIC → "Helix Services" (services tech, conseil, infogérance)

Et tous les noms réels par des personae génériques :
- Marie Ansquer → "Sarah Chen" (banque)
- Bénédicte → "Léa Moreau" (design)
- Jean Hentgen → "Marc Dupont" (avocat)
- etc.

### A3. Personae secondaires (P0 maquette)
La maquette doit montrer 3 archétypes de CEO :
- **Holder family office** (3 entités, gouvernance, SCI) — comme MHSSN
- **Multi-business operator** (4-5 entités opérationnelles, M&A) — comme AMANI/ETIC fusion
- **Solo CEO with assistant** (1 entité, focus exécution, copilote IA très présent)

→ L'index-nav.html peut proposer un **switcher persona démo** pour montrer la flexibilité.

### A4. Configuration tenant (P1 maquette)
Page `settings.html` à ajouter :
- Identité (nom CEO, photo, locale, fuseau)
- Identité tenant (raison sociale, logo, couleur primaire custom)
- Vocabulaire (label "groupe" / "holding" / "company" / "entity" choisi)
- Sociétés (CRUD)
- Équipe (CRUD avec rôles)
- Intégrations (Outlook, Google Calendar, IMAP, etc.)
- Notifications (granular)
- Sécurité (2FA, sessions, audit)
- Plan & facturation (placeholder)
- Données (export, suppression GDPR)

### A5. Concept "vocabulaire configurable" (P1 maquette)
Certains CEO disent "groupe", d'autres "holding", "house", "portfolio", "umbrella". Le terme doit être paramétrable et utilisé partout dynamiquement.

→ Implémentation maquette : utiliser dans le copy `{{tenant.entityLabel}}` (ex : `{{tenant.entityLabel.plural}}` pour "Mes groupes" / "My houses" / "Mes holdings").

### A6. Logo tenant custom (P1 maquette)
Logo aiCEO disparaît du drawer pour les comptes payants → remplacé par logo tenant. Maquette doit montrer les 2 cas (logo aiCEO démo vs logo tenant custom).

### A7. Couleur primaire custom (P1 maquette)
Le `--brand` est aujourd'hui figé à `#111418`. Il doit pouvoir être configuré par le tenant (palette pré-définie de 12 couleurs, ou color picker premium).

### A8. Permissions / multi-user (P2 maquette)
Mono-user en MVP mais l'architecture doit prévoir :
- CEO (owner)
- Assistant (full access en délégation)
- Lecture seule (board members, comptable)
- Sociétaire/famille (vue partielle)

Un page `team.html` avec une matrice de permissions (futur).

### A9. Trial / pricing (P2 maquette)
Bandeau discret "14 jours d'essai · 7 j restants" en haut sur compte trial. Page pricing standalone.

### A10. Multi-account switcher (P2 maquette)
Un consultant peut être CEO de plusieurs entités séparées. Le drawer doit proposer un switcher de tenant en haut.

---

## B. Responsive multi-device (CRITIQUE — refonte complète)

### Le manque
La v2 dit "desktop only 1280-1920". Tu veux **fully responsive desktop + tablette + mobile**. C'est un changement structurel.

### B1. Breakpoints (P0 maquette)
```css
--bp-mobile: 640px;    /* Mobile portrait */
--bp-tablet: 1024px;   /* Tablette / mobile landscape */
--bp-desktop: 1280px;  /* Desktop standard */
--bp-wide: 1600px;     /* Desktop wide */
```

### B2. Stratégie navigation par device (P0 maquette)
| Device | Pattern primaire |
|---|---|
| **Mobile** (< 640) | Bottom-tab nav (5 items max) + drawer overlay accessible via menu icon top-left |
| **Tablette** (640-1024) | Drawer collapsé 60px par défaut + content full |
| **Desktop** (> 1024) | Drawer 240px expanded par défaut |

### B3. Touch targets & gestures (P0 maquette)
- Minimum target : 44×44 px (iOS) / 48×48 px (Android)
- Swipe-to-dismiss sur les modals mobile
- Long-press = mode édition
- Pull-to-refresh sur listes
- Swipe entre buckets arbitrage (mobile : un bucket à la fois)

### B4. Page restructuration mobile (P0 maquette)

**Cockpit mobile** :
- Stack vertical (pas de grid 3 col)
- Hero "Carte Matin" en pleine largeur
- Big Rocks en carrousel horizontal swipeable
- Compteurs en grid 2x2 en bas

**Arbitrage mobile** :
- Un seul bucket visible à la fois
- Navigation par tabs en haut : Faire (3) | Déléguer (2) | Reporter (5)
- Swipe gauche/droite pour changer
- FAB "Valider" persistante en bas

**Eisenhower mobile** :
- Pas de matrice 2x2 sur mobile (trop petit)
- Liste flat avec filtre quadrant en chip horizontal

**Agenda mobile** :
- Vue **jour** par défaut (pas semaine)
- Swipe vers semaine en lecture seule
- Tab "Aujourd'hui / Demain / Cette semaine"

**Assistant chat mobile** :
- Plein écran (pas de sidebar conversations visible)
- Sidebar accessible via icône liste en haut

### B5. PWA (P1 maquette)
- `manifest.webmanifest` avec icônes, theme-color, display: standalone
- Service worker pour cache shell + offline mode
- Install prompt iOS/Android
- Splash screen custom

### B6. Mobile-specific patterns (P1 maquette)
- **FAB** : Floating Action Button en bas-droite, "+ Nouvelle tâche", monte de 56px au-dessus du bottom-tab
- **Bottom sheets** : remplacent les modals desktop sur mobile (slide-up depuis bas)
- **Sticky headers** : titre de page sticky avec back arrow
- **Pull-to-refresh** : haptic + spinner en haut

### B7. Orientation (P1 maquette)
- iPad landscape : drawer 240px + 2-col content
- iPhone landscape : message "App optimisée portrait" (ou layout dégradé)

### B8. Safe-area insets (P0 maquette)
```css
padding-top: env(safe-area-inset-top);
padding-bottom: max(16px, env(safe-area-inset-bottom));
```
Notch iOS, Dynamic Island, gesture bar Android — tous gérés.

### B9. Viewport units modernes (P0 maquette)
Utiliser `dvh` (dynamic viewport height) au lieu de `vh` pour gérer les barres mobile cachées/visibles.

### B10. Performance mobile (P0 maquette)
- Bundle initial < 100kb mobile
- Images < 50kb par device pixel ratio
- Lazy load des routes
- Preload des polices critiques uniquement
- Critical CSS inline (premier paint < 1s sur 3G)

---

## C. Humanisation & coaching CEO (NOUVEAU — gros plus de valeur)

### Le manque
Le ton "anti-flatterie" est noté mais sans patterns concrets. Le coaching n'est pas du tout abordé. C'est le différenciateur n°1 vs Notion/Things/Linear.

### C1. Tone scripts par contexte (P0 maquette)
Définir 5 contextes et le ton attendu :
| Contexte | Ton | Exemple |
|---|---|---|
| Salutation matin (humeur "bien" hier) | Direct, factuel | "Bon retour. 28 tâches t'attendent." |
| Salutation matin (humeur "mauvaise" hier) | Doux, court | "On reprend en douceur. Pose-toi 30 secondes." |
| Confirmation arbitrage | Sobre | "Arbitrage enregistré." (toast) |
| Erreur réseau | Factuel, action claire | "Outlook n'a pas répondu. [Réessayer]" |
| Coaching weekly check-in | Question ouverte | "Tu as délégué 8 tâches. Quel est le ressenti ?" |

### C2. Time-of-day adaptation (P0 maquette)
Le cockpit s'adapte selon l'heure :
- **5h-9h** : Carte Matin saillante (gradient amber doux), salutation + intention
- **9h-17h** : Carte Matin pliée, focus sur taches/agenda
- **17h-20h** : Carte Soir saillante (gradient violet doux), bilan
- **20h-23h** : Mode "fin de journée", suggestion fermer l'app, quote inspirante
- **23h-5h** : Bandeau "Il est tard. Rendez-vous demain ?" + CTA "Prendre 5 min de tactique"

### C3. Friction positive (P0 maquette)
Avant certaines actions, l'app pose une question :
- 5e tâche P0 du jour : "C'est ta 5e tâche P0 ce matin. Sûr que tout est urgent ?"
- 3e décision reportée même semaine : "Tu reportes pour la 3e fois 'Décision X'. Veux-tu la trancher ou la supprimer ?"
- Big Rock semaine ajouté #4 : "Plus de 3 Big Rocks dilue le focus. Tu veux quand même ?"

### C4. Recovery patterns (P1 maquette)
- Manque la boucle du soir 3 jours : pas de culpabilité, juste "Pas grave, on reprend ce soir."
- Streak cassé : message neutre, pas de "Dommage !". Ex : "Streak interrompu à 23 jours. Reprends quand tu veux."
- Retour après pause longue (> 7j) : page d'accueil simplifiée, "Bon retour. On reprend doucement avec quoi ?"

### C5. Mirror moments (P1 maquette)
1×/sem (vendredi soir, après bilan) :
- "Cette semaine, tu as délégué 8 tâches vs 3 la semaine d'avant."
- "Ton Big Rock #2 (FF&E) avance, mais le #3 (Affejee) recule. Tu veux changer la priorité ou y consacrer un créneau ?"
- "Tu as eu 3 réunions Outlook qui n'avaient pas de tâches associées. C'est normal ou tu veux qu'on les rattache ?"

### C6. Coach intégré (P1 maquette)
Composant `<coach-prompt>` qui apparaît 1×/sem (au lancement de la revue dimanche) :
- "Question de la semaine : qu'est-ce qui aurait dû être délégué et ne l'a pas été ?"
- "Quel a été le moment le plus contrariant cette semaine ? Que faire pour qu'il ne se reproduise pas ?"
- "Ton énergie moyenne cette semaine était 2.8/5. Qu'est-ce qui a pesé ?"

### C7. Self-talk monitoring (P2 maquette)
Détecter dans la note du soir des patterns négatifs ("je suis nul", "j'y arrive pas", "merde") et proposer un recadrage doux :
- "J'ai noté que tu utilises des mots durs envers toi. Veux-tu que je propose une reformulation ?"
- Bouton "Réfléchir avec Claude" (chat assistant pré-amorcé sur le sujet)

### C8. Posture stratégique (P2 maquette)
Question stratégique du mois affichée discrètement (footer cockpit) :
- "Quelle est ta vision à 5 ans ?"
- "Si tu devais arrêter une activité demain, laquelle ?"
- "Quelle compétence tu veux développer ce trimestre ?"

CTA "Y répondre dans la revue mensuelle" (nouvelle page revues mensuelle, à designer).

### C9. Pause forcée (P1 maquette)
Si l'app détecte > 2h d'utilisation continue :
- Toast bottom : "Tu es sur aiCEO depuis 2h. Une pause ? [Plus tard / Pause 15 min]"
- Si "Pause 15 min" cliqué : modal plein écran avec timer + 3 suggestions (lever, eau, regard horizon)

### C10. Anti-gamification (P0 maquette — confirmer dans le prompt)
Pas de levels, XP, badges visuels excessifs, leaderboard. Streaks oui mais sans pression. Confettis très très discrets (1×/100 jours streak).

### C11. Posture & ergonomie (P2 maquette)
Rappel toutes les 50 min : "Pause posture ? [+ 5 min] [Plus tard]". Si activé, suggestions 3 mouvements.

### C12. Ergonomie sociologique (P0 — pattern conceptuel)
**Comprendre le persona CEO** :
- Décision-fatigue → minimiser le nombre de décisions UI à prendre (defaults intelligents)
- Time-poverty → tout doit prendre < 5s ou être annulable
- Isolation → l'assistant chat est un compagnon, pas un assistant froid
- Perfectionnisme → permettre "good enough", pas "complete"

### C13. Coaching scripts métier (P2 maquette)
Le coach connaît 3 frameworks éprouvés :
- **EOS Traction** (Big Rocks, niveau 1/2/3, Rocks et IDS)
- **Eisenhower** (urgent/important)
- **Stoïcisme appliqué** (cercle d'influence, locus of control)

→ Le CEO choisit son framework dans settings, le vocabulaire et les questions s'adaptent.

---

## D. Accessibilité avancée (NOUVEAU — WCAG AAA cible)

### D1. WCAG 2.2 AA min, AAA cible cockpit (P0 maquette)
La v2 dit "WCAG AA". Pour un outil exec utilisé 8h/jour, viser AAA sur les écrans critiques (cockpit, arbitrage, evening). Vérifier :
- Contraste 7:1 sur body text (AAA), 4.5:1 minimum
- Tabular nums obligatoires
- Texte zoomable 200% sans casse layout

### D2. Skip links (P0 maquette)
En haut de chaque page, invisible jusqu'au focus :
```html
<a href="#main" class="skip-link">Aller au contenu principal</a>
<a href="#drawer" class="skip-link">Aller à la navigation</a>
```

### D3. Focus management (P0 maquette)
- Trap dans modals
- Restore focus à la fermeture
- Focus initial du modal sur le 1er élément interactif
- Indicateur focus visible 2px brand offset 2px

### D4. Color blindness (P0 maquette)
Aucune information ne repose UNIQUEMENT sur la couleur :
- Status pill = couleur + ICON Lucide
- Priority = couleur + label texte ("P0" pas juste rouge)
- Charts = couleur + pattern (lignes/dots/dashes)

### D5. Reduce motion (P0 maquette — déjà dans v2 mais à vérifier strict)
```css
@media (prefers-reduced-motion: reduce){
  *, *::before, *::after{
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### D6. Cognitive load mode (P1 maquette)
Settings option "Mode simplifié" :
- Réduit à 3-4 cards principales sur cockpit
- Désactive auto-suggestions IA
- Désactive coach prompts
- Police +2px partout

### D7. Dyslexia mode (P1 maquette)
Settings option :
- Font OpenDyslexic (alternative)
- Line-height +0.2
- Letter-spacing +0.05em
- Word-spacing +0.1em

### D8. High contrast mode (P1 maquette)
Settings option :
- Tous les contrastes doublés (text → black pur, surface → white pur)
- Borders épaisses 2px
- Pas de transparence

### D9. Larger text (P1 maquette)
Settings 100% / 110% / 125% / 150%.

### D10. Screen reader optimisé (P0 maquette)
- `aria-live="polite"` toast stack
- `aria-live="assertive"` errors critiques
- `aria-busy="true"` regions loading
- `aria-describedby` sur tooltips et chips
- Charts SVG avec `<title>` et `<desc>` + texte alternatif data
- `<sr-only>` annonces non-visuelles ("Tâche déplacée vers Faire")

### D11. Keyboard complete coverage (P0 maquette)
Tous les flux faisables au clavier :
- Drag-drop alternatif (espace pour saisir, flèches pour déplacer, espace pour déposer)
- Command palette ⌘K déjà OK
- Modal Esc + tab trap
- Tabs flèches gauche/droite
- Listes j/k navigation

### D12. Aria roles strict (P0 maquette)
- Modal `role="dialog" aria-modal="true"`
- Toast `role="status"` (info) / `role="alert"` (error)
- Tabs `role="tablist"` + `role="tab"` + `role="tabpanel"`
- Search `role="search"`
- Drawer `aria-label="Navigation principale"`

### D13. Tabindex management (P0 maquette)
Jamais de `tabindex="1"` ou positif. `tabindex="0"` pour cards cliquables custom. `tabindex="-1"` pour éléments programmatiquement focusables.

### D14. Form errors accessibles (P0 maquette)
- `aria-invalid="true"` + `aria-describedby` pointant vers le message d'erreur
- Erreur annoncée par screen reader
- Focus auto sur le premier champ en erreur

### D15. Pages 100% navigables sans souris (P0 maquette)
Test : sur chaque page, vérifier qu'on peut tout faire au clavier, y compris drag-drop, command palette, modals, tabs. Documenter.

---

## E. Internationalisation (NOUVEAU)

### E1. Langues à supporter (P0 décision)
Recommandation : **FR + EN au lancement**. Préparer ES, DE, AR (RTL), PT en V1.

### E2. Architecture i18n (P0 maquette)
- Toutes les strings dans `_shared/i18n/{fr,en,es,...}.json`
- Helper `t('key.subkey')` global
- Variables interpolation : `t('cockpit.greeting', { name: 'Sarah' })` → "Bonjour Sarah,"
- Pluralization : `t('tasks.count', { n: 5 })` → "5 tâches" / "0 tâche" / "1 tâche"

### E3. RTL support (P1 maquette)
Pour AR / HE :
- `dir="rtl"` sur `<html>`
- Tous les `margin-left/right` → `margin-inline-start/end`
- Icônes directionnelles flippées (chevron-right vs chevron-left)
- Charts inversés
- Drawer côté droit en RTL

### E4. Pluralization rules (P0 maquette)
- "0 tâche" / "1 tâche" / "5 tâches" — règle FR
- En JSON : `{ "tasks_zero": "0 tâche", "tasks_one": "1 tâche", "tasks_other": "{n} tâches" }`
- Utiliser `Intl.PluralRules` natif

### E5. Format date/time/number par locale (P0 maquette)
- `Intl.DateTimeFormat` natif
- `Intl.NumberFormat` natif
- `Intl.RelativeTimeFormat` natif (pour "il y a 2 j")
- Premier jour de semaine selon locale (lundi FR, dimanche US)
- Format heure 24h FR vs 12h AM/PM US

### E6. Currency par tenant (P1 maquette)
Settings tenant : devise principale (EUR / USD / GBP). Affichage automatique avec `Intl.NumberFormat`.

### E7. Vocabulaire culturel (P1 maquette)
Voir A5 (entityLabel configurable). Aussi :
- Format nom : "Prénom Nom" (FR) vs "First Last" / "Last First" (JP/CN)
- Civilité : Mr/Mrs (EN) vs M./Mme (FR) vs absente (DE moderne)

### E8. String length variations (P0 maquette)
DE strings 30 % plus long que FR. EN souvent plus court. Prévoir flexibilité layout (pas de width fixe sur les containers texte).

### E9. Locale switcher (P0 maquette)
Dans le drawer footer (au-dessus de Réglages) ou settings. Détection navigator.language au premier load.

### E10. Translations memory (P1 maquette)
- Key consistency : `cockpit.greeting`, `cockpit.bigrocks.title`
- Pas de strings en dur dans le HTML
- Pas de strings concaténées (utiliser variables)

---

## F. Robustesse architecturale (CRITIQUE — DS atomique)

### F1. Atomic Design (P0 maquette)
Architecture stricte :
- **Tokens** : couleurs, typo, spacing, radii (déjà fait via CSS vars)
- **Atoms** : Button, Input, Badge, Avatar, Icon
- **Molecules** : SearchPill, TaskCard, ProgressMeter, FormField, Toast
- **Organisms** : Drawer, Header, Modal, CommandPalette, Cockpit cards
- **Templates** : layouts pages
- **Pages** : 13 pages instanciées

### F2. Component naming convention (P0 maquette)
- HTML : kebab-case `<task-card>`, `<form-field>`
- CSS : BEM `.task-card__title`, `.task-card--hot`
- Tokens : `--color-bg`, `--color-text-primary`, `--space-4`

### F3. Tokens hierarchy à 2 niveaux (P0 maquette)
**Primitive tokens** (couleur brute) :
```
--color-rose-500: #d96d3e;
--color-navy-900: #111418;
--color-cream-100: #f5f3ef;
```
**Semantic tokens** (utilisation contextuelle) :
```
--color-brand: var(--color-navy-900);
--color-surface: var(--color-cream-100);
--color-accent-warning: var(--color-rose-500);
```

Avantage : changer le brand color = remap d'1 var, pas 50.

### F4. Theming JSON schema (P1 maquette)
Permet à un tenant de surcharger ses tokens :
```json
{
  "tenant": "acme",
  "tokens": {
    "color.brand": "#0070f3",
    "color.brand-50": "#e8f4ff"
  }
}
```

### F5. Storybook (P1 architecture, hors maquette directe)
Mais le prompt v3 doit demander une page `_shared/components.html` qui liste tous les composants en gallery, comme un mini-storybook visuel.

### F6. CSS architecture (P0 maquette)
ITCSS (Inverted Triangle CSS) :
1. Settings (variables)
2. Tools (mixins, fonctions — peu utiles en CSS pur)
3. Generic (reset)
4. Elements (h1, p, a default)
5. Objects (layout primitives sans cosmétique : `.o-grid`, `.o-stack`)
6. Components (`.c-card`, `.c-button`)
7. Utilities (`.u-text-center`, `.u-mt-4`)

### F7. Performance budget (P0 maquette)
- LCP < 2.0s sur 3G
- INP < 100ms
- CLS < 0.05
- Bundle initial < 100kb (mobile) / 200kb (desktop)
- Critical CSS inline < 14kb

### F8. Image optimization (P0 maquette)
- WebP/AVIF avec fallback JPEG
- Responsive `<picture>` ou `srcset`
- Lazy loading natif `loading="lazy"`
- Preload uniquement les images above-the-fold critiques

### F9. Font loading strategy (P0 maquette)
- `font-display: swap` partout
- Subset par langue (latin-fr, latin-ext)
- Preload des 2 weights critiques (400, 600)
- Variable font Fira Sans si possible (1 fichier au lieu de 10)

### F10. CSS containment (P1 maquette)
```css
.task-card{ contain: layout style; }
```
Améliore les perfs sur listes longues.

### F11. SVG sprite vs inline (P1 maquette)
Sprite SVG pour les 30 icônes Lucide (1 file, 30 `<symbol>`), référencé via `<svg><use href="#icon-home"/></svg>`. Réduit le bundle de ~50 % par rapport à inline.

### F12. Code splitting (P1 maquette)
Chaque page = 1 bundle JS isolé. Charge uniquement le JS nécessaire à la route active.

### F13. Service worker pour cache (P1 maquette)
Cache shell + assets statiques. Strategy : cache-first pour assets, network-first pour API.

### F14. Error boundaries (P0 maquette)
Chaque page wrappée dans un try-catch global :
- Affiche page d'erreur amicale
- Lien "Recharger" + "Signaler"
- Stack trace cachée mais loguée

### F15. State management (P1 architecture)
- Source de vérité : SQLite local + sync cloud
- Optimistic UI (action visible avant confirm serveur)
- Conflict resolution : last-write-wins simple, ou CRDT pour avancé
- Offline queue : actions stockées et rejouées

---

## G. Onboarding & activation (NOUVEAU)

### G1. First-run wizard (P0 maquette — nouvelle page)
Écran `onboarding.html` avec 7 étapes :
1. Choisir langue (FR/EN) + fuseau horaire
2. Présentation 60s : "Voici aiCEO, ton copilote. 3 rituels, ~5 min/jour."
3. Combien d'entités tu pilotes ? (1-N) — slider ou boutons
4. Nommer chaque entité + couleur custom
5. Importer Outlook (OAuth) ou skip
6. Importer équipe (CSV / manuel / skip)
7. Choisir ton premier Big Rock de la semaine

### G2. Empty states éducatifs (P0 maquette — déjà partiellement)
Sur chaque page vide, micro-tutoriel contextuel :
- Taches vide : "Pas encore de tâches. [+ Ajouter une tâche] ou [Importer Outlook]"
- Decisions vide : "Tes décisions ouvertes apparaîtront ici. Tu peux en ajouter en cliquant sur [+ Nouvelle décision]"
- Big Rocks vide : "Définis 1 à 3 objectifs majeurs pour la semaine."

### G3. Progressive disclosure (P0 maquette)
Première semaine : afficher uniquement Cockpit + Arbitrage + Evening. Cacher Eisenhower, agenda complet, registres tier 3.
Semaine 2+ : débloquer progressivement.

### G4. Sample data toggle (P1 maquette)
Settings : "Remplir avec des exemples" pour pouvoir explorer toutes les pages avec des données démo (les datasets génériques A2). Toggle ON/OFF.

### G5. Tour guidé (P1 maquette)
3-5 spotlights non envahissants, skippables, re-accessibles via help center.

### G6. Activation moments (P1 maquette)
- Premier arbitrage validé : toast doux "Premier arbitrage. Tu vas voir, ça devient vite réflexe."
- Première décision tranchée : toast doux "Décision tranchée. C'est ce qui fait la différence."
- Première semaine validée : modal "Tu as bouclé une semaine complète. Quelques observations…" + mirror moment

### G7. Help center contextuel (P1 maquette)
Bouton "?" dans header → modal slide-in droite avec :
- FAQ contextuelle à la page courante
- Vidéo 60s tutoriel
- Lien chat support
- Raccourcis clavier

---

## H. Personnalisation tenant avancée (NOUVEAU)

### H1. Theme custom (P1 maquette)
Settings → palette de 12 couleurs primaires pré-définies + color picker premium.

### H2. Density modes (P1 maquette)
Settings : compact / cozy (default) / comfortable.
- Compact : padding cards 16px au lieu de 20px, font-size body 13px
- Comfortable : padding 28px, font-size 15px

### H3. Custom shortcuts (P2 maquette)
Settings → liste des raccourcis remappables.

### H4. Custom drawer (P2 maquette)
Réordonner les items du drawer drag-drop, choisir lesquels afficher.

### H5. Custom dashboard widgets (P2 — V1+)
Cockpit avec widgets glissables, redimensionnables.

### H6. Logo & favicon custom (P1 maquette)
Settings → upload logo + favicon. Impacte le drawer + browser tab.

---

## I. Notifications & async (NOUVEAU)

### I1. Notification center (P1 maquette — nouvelle page/modal)
Bouton bell dans header → drawer right slide :
- Non lues en haut
- Groupées par type
- Bouton "Tout marquer comme lu"
- Filtres : système / coaching / outlook / IA

### I2. Browser notifications (P1 maquette)
Settings → opt-in granular :
- "Big Rock atteint" : ON
- "Outlook désynchronisé" : ON
- "Suggestion IA" : OFF

### I3. Email digests (P1 maquette)
Settings → opt-in :
- Daily : top 3 du jour à 7h00
- Weekly : revue dimanche soir à 19h00
- Monthly : récap mensuel le 1er du mois

### I4. Mobile push (P2 maquette — nécessite PWA)
Quand l'app est PWA installée, push notifications via Web Push API.

### I5. Quiet hours (P0 maquette)
Settings : période sans aucune notif (défaut 22h-7h).

### I6. Smart batching (P1 maquette)
Si 5 notifications similaires en 10 min : grouper en une "5 nouveaux mails Outlook urgents".

### I7. Snooze notifications (P1 maquette)
Long-press sur notif → "Rappeler dans 1h / demain matin / lundi".

---

## J. AI / Copilot transparence (CRITIQUE pour la confiance)

### J1. AI badge sur chaque output (P0 maquette)
Chaque suggestion/draft IA porte un badge violet `Suggéré par Claude` cliquable qui explique :
- Quel modèle (Sonnet 4.6)
- Quel contexte injecté
- Quels tokens consommés
- Confiance estimée

### J2. Confidence indicators (P0 maquette)
Sur arbitrage et reco décisions : icône signal (3 barres) ou pourcentage indiquant la confiance.

### J3. Override AI sans friction (P0 maquette)
Toujours possible d'éditer/ignorer une suggestion IA sans dialog de confirmation.

### J4. AI usage limits visible (P1 maquette)
Footer cockpit : "Coût IA aujourd'hui : 0,18 €" / "Mois : 4,30 € / 15,00 € budget".

### J5. Citations sources (P0 maquette)
Toute reco IA cite ses sources (tâches, mails, décisions, ADR) en chips cliquables.

### J6. Feedback loop 👍/👎 (P1 maquette)
Sur chaque output IA : 2 boutons discrets pour rapport qualité.

### J7. AI privacy controls (P1 maquette)
Settings → "Mode privé" qui désactive complètement les appels IA, fallback rule-based.

### J8. Hallucination guard (P1 architecture)
Toute suggestion IA passe par un validator simple avant affichage (champs obligatoires, dates plausibles, IDs existants).

### J9. Context window indicator (P2 maquette)
Modal debug : "Voici les 12 tâches + 3 décisions + 5 mails que Claude a vus pour cette suggestion."

### J10. Model selector (P2 maquette)
Settings avancés : choisir modèle (Haiku/Sonnet/Opus) selon arbitrage qualité/coût.

### J11. AI explainability (P0 maquette)
Bouton "Pourquoi cette suggestion ?" sur chaque reco → modal avec raisonnement Claude.

---

## K. Intégrations externes (NOUVEAU)

### K1. Multi-provider calendar (P1 maquette)
Settings → connecteurs Outlook / Google Cal / Apple Cal / IMAP. Logo + status (connecté / synchro / erreur).

### K2. Multi-provider mail (P1 maquette)
Outlook / Gmail / IMAP. Boîte unifiée ou séparée.

### K3. Slack / Teams push délégations (P2 maquette)
Quand tu délègues une tâche, push un message Slack/Teams au destinataire.

### K4. Webhooks (P2 maquette)
Settings → URL webhook + secret + events à pousser (task.created, decision.tranchée, etc.).

### K5. Import / Export (P1 maquette)
- Import : CSV (tâches), ICS (calendrier), JSON (autre instance aiCEO)
- Export : tout (RGPD), filtré (par projet, par période)

### K6. API publique (P2 maquette)
Page `developer.html` avec API key, docs OpenAPI, exemples.

### K7. Browser extension (P2 maquette)
Capture rapide d'une page web → tâche aiCEO.

### K8. Mobile share extension (P2 maquette)
iOS / Android : "Partager vers aiCEO" depuis n'importe quelle app → nouvelle tâche.

### K9. Zapier / Make / n8n (P2 maquette)
Connecteurs no-code listés en tant que partenaires.

---

## L. Sécurité & privacy (NOUVEAU)

### L1. 2FA / MFA (P1 maquette)
Settings → activer 2FA TOTP (Authy, Google Auth) ou WebAuthn (clé physique, biométrie).

### L2. Session management (P1 maquette)
Settings → liste des sessions actives (device, lieu, dernière activité), bouton "Déconnecter cette session".

### L3. Audit log (P1 maquette)
Page settings → activité (qui a fait quoi quand). Filtrable, exportable.

### L4. Encryption at rest (P0 architecture)
SQLite chiffré. Mention dans settings : "Tes données sont chiffrées sur ton appareil (AES-256)".

### L5. End-to-end encryption (P2 — premium)
Option premium : E2E sur les données les plus sensibles.

### L6. Backup / restore (P1 maquette)
Bouton "Exporter sauvegarde chiffrée" + "Restaurer depuis sauvegarde".

### L7. RGPD compliance (P0 maquette)
- Export complet des données
- Suppression complète + délai de grâce 30 j
- Consentement granular sur analytics, IA, etc.
- Privacy policy + ToS accessibles

### L8. No-tracking by default (P0 maquette)
Settings → analytics OFF par défaut. Opt-in explicite.

### L9. Phishing protection (P1 architecture)
Mails et liens suspects (déjà détectés en démo via t23 ALEFPA) : badge rouge + warning.

### L10. Trusted devices (P1 maquette)
Settings → liste des appareils approuvés. Nouveau device = OTP par mail.

---

## M. États & erreurs (CRITIQUE — déjà partiellement traité)

### M1. Network offline persistant (P0 maquette)
Banner top sticky : "Hors-ligne. Tes actions seront sync à la reprise."

### M2. API timeout (P0 maquette)
Toast error + bouton "Réessayer". Si échoue 3 fois : modal "Connexion lente. Veux-tu basculer en mode offline ?"

### M3. OAuth disconnected (P0 maquette)
Banner amber : "Outlook déconnecté. [Reconnecter]"

### M4. Quota dépassé (P1 maquette)
Modal : "Tu as atteint ta limite IA pour ce mois. [Upgrade] ou [Continuer en mode rule-based]"

### M5. Browser deprecated (P1 maquette)
Sur load, si IE / vieux Safari : page "Ton navigateur n'est pas supporté. Utilise Chrome, Edge, Firefox, Safari récent."

### M6. Maintenance mode (P1 maquette)
Page dédiée si serveur down : message clair + ETA + status page link.

### M7. Crash recovery (P0 maquette)
Error boundary par page → page "Quelque chose s'est cassé. [Recharger] [Signaler le bug]"

### M8. Stale data indicator (P1 maquette)
Si dernière sync > 30 min : icône amber "Données peut-être obsolètes. [Rafraîchir]"

### M9. Conflict resolution (P1 maquette)
Si 2 devices éditent la même tâche : modal "Conflit détecté. Quelle version garder ? [Mienne / Autre / Fusionner]"

### M10. Empty inbox state (P0 maquette — déjà)
Voir taches.html empty state.

### M11. Loading too long (P1 maquette)
Si > 5s : message "Ça prend plus longtemps que d'habitude…"

### M12. Quota partiel (P1 maquette)
"Tu as utilisé 90 % de ton quota IA ce mois". Anticipation.

---

## N. Analytics & métriques produit (NOUVEAU — pour faire évoluer l'app)

### N1. DAU / WAU / MAU (P1 architecture)
Tracking opt-in.

### N2. Activation rate (P1 architecture)
% de comptes qui complètent un arbitrage matinal dans les 7j post-onboarding.

### N3. Retention J1/J7/J30 (P1 architecture)
Métrique clé pour SaaS.

### N4. Feature adoption (P1 architecture)
Quelles pages sont utilisées, quelles features (Eisenhower vs liste, command palette ⌘K, etc.).

### N5. AI usage par user (P1 architecture)
Tokens, coût, types de prompts.

### N6. NPS trimestriel (P1 maquette)
Modal NPS 1×/trimestre, micro-survey.

### N7. Churn early signals (P1 architecture)
Usage drop > 30% en 7j → alerter ou proposer help.

### N8. Funnel onboarding (P1 architecture)
Tracker chaque étape du wizard, identifier où ça décroche.

---

## O. Polish micro-interactions (avancé)

### O1. Sound design opt-in (P2 maquette)
Settings → sound on/off. Sons doux pour validation arbitrage, validation soir. Inspiration : DuoLingo (mais plus calme).

### O2. Haptic feedback mobile (P1 maquette)
- Drag/drop : tap léger
- Validation : tap moyen
- Erreur : tap fort
- Streak celebration : pattern doux

### O3. Particle effects ultra discret (P2 maquette)
Streak 100 jours : confetti minimal 1.5s.

### O4. Easter eggs subtils (P2 maquette)
Vraiment subtils. Pas de "Konami code".

### O5. Empty card affordances (P1 maquette)
Pour les cards vides (Big Rocks, Décisions) : drag des items depuis taches pour remplir, indicateur visuel.

### O6. Keyboard hints overlay (P1 maquette)
En appuyant sur ?, modal aide raccourcis. Aussi : afficher temporairement les raccourcis (ex: les pills "K" "J" sur le focus d'une liste).

### O7. Spring physics (P1 maquette)
Drag & drop avec physique douce (pas linear).

### O8. Stagger animations (P1 maquette)
Cards qui s'affichent : delay de 30ms entre chaque pour effet "wave".

---

## P. Content strategy (NOUVEAU)

### P1. Tone of voice guidelines (P0 maquette)
Document interne :
- Direct, factuel, concis
- Jamais de flatterie ("Bravo")
- Erreurs : factuelles, action claire
- Coaching : questions ouvertes, jamais directives

### P2. Microcopy library (P0 maquette — fichier dédié `09-microcopy.md`)
Tous les empty states, errors, placeholders, tooltips, confirmations.

### P3. Help center intégré (P1 maquette)
Page `help.html` avec FAQ + tutoriels + raccourcis + chat support.

### P4. Tooltips éducatifs (P1 maquette)
"Qu'est-ce qu'un Big Rock ?" → tooltip qui explique.

### P5. Onboarding video 60s (P1 maquette)
Une vidéo embarquée dans le wizard étape 2.

### P6. Release notes in-app (P1 maquette)
Modal "Quoi de neuf" 1×/release. Liste 3-5 changements visuels.

### P7. Public changelog (P2 maquette)
Page changelog.html publique.

### P8. Public roadmap (P2 maquette)
Page roadmap.html. Engageant pour early adopters.

---

## Q. Design system avancé

### Q1. Tokens hierarchy 3 niveaux (P0 maquette — voir F3)

### Q2. Aliases tokens (P0 maquette)
```css
--color-button-primary-bg: var(--color-brand);
--color-input-border: var(--color-border-default);
```

### Q3. Theming JSON schema (P1 maquette — voir A7, F4)

### Q4. Dark mode prep (P0 maquette)
Tous les tokens ont une variant dark (en commentaire pour v0.5) :
```css
:root {
  --color-bg: #f5f3ef;
  /* dark: #1a1d24 */
}
```

### Q5. High contrast variant (P1 maquette — voir D8)

### Q6. Density variants (P1 maquette — voir H2)

### Q7. Component variants exhaustifs (P0 maquette — voir composants catalogue)

### Q8. Composition rules (P1 maquette)
"Ne pas mettre un Button primary dans un Toast" — règles documentées.

### Q9. Icon naming (P0 maquette — voir D)
Lucide kebab-case : `check-circle`, `chevron-down`.

### Q10. Animation guidelines library (P0 maquette — voir patterns techniques)

---

## R. Documentation design (NOUVEAU)

### R1. Design principles (P1 maquette — fichier `10-principes-design.md`)
5-7 principes fondateurs, ex :
1. Densité tenue, jamais saturée
2. Couleur = sémantique, jamais décoration
3. Anti-flatterie, factuel
4. Ergonomie cognitive : minimiser les décisions UI
5. Coaching subtil, jamais infantilisant
6. Performance native > framework lourd
7. Accessibilité par défaut, pas en option

### R2. Component documentation (P1 maquette — déjà partiellement dans 06-composants-catalogue.md)

### R3. Pattern library (P1 maquette — déjà partiellement dans 08-patterns-techniques.md)

### R4. Brand guidelines (P1 maquette — fichier dédié)
Voice, identité, do/don't.

### R5. Code-design parity (P0 maquette)
Naming identique entre design et code.

---

## S. Contracts API & data (architecture)

### S1. OpenAPI spec (P1 architecture, hors maquette)
Tous les endpoints documentés.

### S2. Schema validation (P0 architecture)
Tous les inputs validés (Zod / Joi).

### S3. Error codes enum (P0 architecture)
Pas de strings ad hoc.

### S4. Pagination cursor-based (P1 architecture)
Pour grandes listes (tâches archivées, mails).

### S5. Caching strategy (P1 architecture)
ETags, Cache-Control headers.

---

## T. Adoption & marketing (HORS SCOPE maquette)

Mais à anticiper : landing page, pricing, comparison, testimonials, FAQ, case studies.

---

## U. Différenciation concurrentielle (NOUVEAU)

### U1. Vision claire (P0 maquette)
aiCEO ≠ Notion (généraliste), Things (perso), Linear (dev), Asana (équipe). 

**Positionnement unique** : copilote stratégique pour CEO multi-entités, focus rituels + arbitrage IA + coaching subtil.

### U2. Killer feature visible (P0 maquette)
1 feature qui n'existe nulle part ailleurs. Recommandation : **arbitrage matinal IA-assisté en 5 min**. C'est la promesse principale.

### U3. Anti-features (P0 maquette)
Communiquer ce qu'on ne fait PAS :
- Pas de gestion d'équipe (Asana fait ça)
- Pas de prise de notes Markdown (Notion fait ça)
- Pas de gestion projet Gantt (Monday fait ça)
- aiCEO fait UNE chose : structurer la tête du CEO.

### U4. Comparaison side-by-side (P1 maquette)
Page marketing comparant à Notion / Things / Asana sur 5 dimensions.

---

## V. Mesure de l'impact CEO (NOUVEAU — différenciateur stratégique)

### V1. Score "santé exécutive" (P1 maquette)
Composite indicateur affiché 1×/sem :
- Sleep proxy (heure boucle du soir vs cible)
- Energy moyen 7j
- Mood moyen 7j
- Tasks done / planned
- Decisions tranchées / reportées
- Big Rocks atteints

→ Score 0-100, tendance.

### V2. Time saved metric (P1 maquette)
"Cette semaine : 3h12 économisées grâce aux brouillons IA + délégations." Montrer la valeur tangible.

### V3. Decision velocity (P2 maquette)
"Tu tranches en moyenne en 2.3 jours (vs 4.1 il y a 3 mois)". Progression visible.

### V4. Strategic vs tactical ratio (P2 maquette)
"55 % de ton temps sur du stratégique cette semaine (cible 70 %)". Objectif de vie pro.

### V5. Quarterly review (P1 maquette — V1+)
Rapport trimestriel auto-généré : tendances, victoires, regrets, recommandations Claude.

---

## Synthèse priorisation

### IN MAQUETTE v0.5 (P0 — obligatoire)
- A1, A2, A3, A4, A5, A7 : multi-tenant + dépersonnalisation
- B1, B2, B3, B4, B8, B9, B10 : responsive complet
- C1, C2, C3, C10, C12 : humanisation & coaching basique
- D1, D2, D3, D4, D5, D10, D11, D12, D13, D14, D15 : accessibilité
- E1, E2, E4, E5, E8, E9 : i18n FR+EN
- F1, F2, F3, F6, F7, F8, F9, F14 : architecture solide
- G1, G2, G3 : onboarding wizard
- I5 : quiet hours
- J1, J2, J3, J5, J11 : AI transparency
- L4, L7, L8 : sécurité base
- M1, M3, M7, M10 : états critiques
- O1 : sound opt-in
- P1, P2 : content strategy + microcopy
- Q1, Q2, Q4, Q9, Q10 : DS avancé
- R5 : code-design parity
- U1, U2, U3 : différenciation
- V1, V2 : mesure impact

### IN PROMPT v3 mais pas tous écrans (P1)
- A6, A8, A9, A10
- B5, B6, B7
- C4-C9, C11, C13
- D6-D9
- E3, E6, E7, E10
- F4, F10-F13, F15
- G4-G7
- H1-H6
- I1-I3, I6, I7
- J4, J6-J8
- K1, K2, K5
- L1-L3, L5, L6, L9, L10
- M2, M4-M6, M8, M9, M11, M12
- N1-N8
- O2-O5, O7, O8
- P3-P6
- Q3, Q5, Q6, Q8
- R1-R4
- S1-S5
- V3, V5

### ROADMAP V1+ (P2 — pas dans v0.5)
- C reste : self-talk monitoring, posture stratégique
- H5 : custom dashboard widgets
- I4 : mobile push
- J9, J10
- K3, K4, K6-K9
- O3, O4, O6
- P7, P8
- T : marketing
- V4

---

## Recommandation finale

L'inflation du brief est massive (de 13 pages → ~22 pages avec settings, onboarding, help, components gallery, notifications, etc.). On ne peut pas tout livrer en une seule session Claude Design même optimisée.

**Stratégie réaliste** :

**Bundle "v0.5 démo SaaS"** (12-15 pages × 3 viewports = 36-45 vues) :
- Onboarding wizard (3 écrans clés)
- Cockpit (desktop + tablet + mobile + coaching variant)
- Arbitrage (desktop + mobile)
- Evening (desktop + mobile)
- Taches (desktop + tablet + mobile)
- Agenda (desktop + mobile)
- Revues (desktop + mobile)
- Assistant chat (desktop + mobile)
- Settings (desktop, qui contient tous les sous-points i18n, notifs, sécurité, etc.)
- Components gallery (mini-storybook 1 page)

**Tier 3 registres = desktop only en démo** (groupes, projets, projet, contacts, decisions). Mobile en V1.

**Bundle "v0.5 docs supplémentaires"** :
- `09-microcopy.md` : tous les copies par langue FR+EN
- `10-principes-design.md` : 7 principes
- `11-architecture.md` : atomic design, tokens hierarchy, perf budget
- `12-coaching-patterns.md` : tone scripts par contexte, mirror moments, recovery, posture
- `13-i18n-spec.md` : FR + EN strings, RTL prep, pluralization

Ce qui donne : prompt v3 ~50k chars + 13 pièces jointes + scope explicit "ne pas livrer Tier 3 mobile".

C'est cohérent, ambitieux mais atteignable.
