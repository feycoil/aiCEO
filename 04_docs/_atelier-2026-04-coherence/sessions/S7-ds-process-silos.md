# S7 — Pipeline DS → CSS + process 3 silos

*Statut : ✅ close 2026-04-24*

## 1. Contexte

L'audit §P2-7/P2-8 pointe un coût opérationnel caché : **la règle "3 silos indépendants" (Claude Design ↔ Cowork ↔ GitHub) est assumée dans `GOUVERNANCE.md`, mais sans chemin type documenté pour un changement**. Chaque token ou composant modifié dans Claude Design descend en ~1h de coordination manuelle (copier-coller, édition CSS, vérif cohérence), sans filet.

S2 a tranché la typographie (Fira Sans canonique), mais n'a **pas formalisé** :
- le format **source** des tokens (un JSON canonique ? un CSS canonique ? les deux ?),
- le **script d'export** qui garantit qu'on ne dérive pas entre `02_design-system/colors_and_type.css` et `03_mvp/public/assets/app.css`,
- le **déclencheur** (quand on régénère le CSS) et le **process de revue** associé.

L'audit §P2-8 demande aussi un **chemin type** d'un changement formalisé dans `GOUVERNANCE.md`, et les sessions S3 (drafts) + S6 (livrables dev) ont toutes deux déposé une **règle "maintien continu + audit trimestriel"** qu'il faut formaliser une seule fois (pas trois fois).

S7 tranche le format tokens, l'outil d'export, le déclencheur, la portée, et formalise la gouvernance en un seul patch `GOUVERNANCE.md`.

## 2. État des lieux

### Ce qui existe
- **`02_design-system/colors_and_type.css`** — source actuelle des tokens (CSS pure avec `--color-*`, `--font-*`, `@font-face`). Rédigée à la main.
- **`02_design-system/assets/app.css`** — stylesheet produit (895 lignes, theme Twisty) qui consomme les tokens via `@import ../colors_and_type.css`.
- **`02_design-system/assets/product.app.css`** — variante "product" (idem).
- **`01_app-web/assets/app.css`** — copie quasi-identique, maintenue manuellement.
- **`03_mvp/public/index.html` + `evening.html`** — consomment `app.css` avec stack Fira en premier (post-S2).
- **`02_design-system/preview/`** — 12 HTML de prévisualisation (colors, typo, components).
- **`02_design-system/fonts/`** — 11 OTF Fira Sans + Aubrielle + SolThin.

### Ce qui manque
- Un **fichier source machine-lisible** (JSON, YAML) des tokens. Aujourd'hui la source est du CSS — impossible à consommer programmatiquement côté script.
- Un **script d'export** `tokens → CSS` qui garantit la cohérence entre `02_design-system/`, `01_app-web/`, `03_mvp/public/` sans copie manuelle.
- Un **chemin type** documenté dans `GOUVERNANCE.md` pour un changement UI/token (qui décide, qui exporte, qui merge).
- Une **règle unique** "maintien continu + audit trimestriel" couvrant drafts (S3) + livrables dev (S6) + DS (S7), pour ne pas avoir trois règles qui disent la même chose à 3 endroits.

### Contraintes héritées
- **S1 continuité** : un changement de token ne doit pas casser v0.4 en prod pendant la bascule v0.5. Le script doit permettre un **diff propre + rollback** par commit Git.
- **S2 typographie** : Fira Sans canonique figée. Le script d'export doit respecter la stack Fira Sans → Calibri/Cambria fallback déjà en place.
- **S3 sources canoniques** : `02_design-system/` est la source vivante, `01_app-web/` est gelé (référence visuelle), `03_mvp/public/` consomme. Le script doit **pousser vers 03_mvp/public/ uniquement**, pas vers 01_app-web/ (qui reste gelé).
- **S4 budget** : 10 sem / 2,6 ETP. Le script doit être **minimal** (pas de Style Dictionary + pipeline Node complexe) — 30-80 lignes JS au max.
- **S6 philosophie** : Node 20 + vanilla, pas de dépendance lourde. Réutiliser ce qui existe (`fs`, `path`).

### Claude Design = plafond structurel
Claude Design n'a pas d'API. L'audit §P2-14 le note : la boucle "Claude Design → tokens" restera **manuelle** (designer exporte en JSON à la main depuis la conversation). Ce n'est pas un bug S7 — c'est une contrainte. S7 traite ce qui est **en aval** de cette étape manuelle : `tokens.json` → CSS → app.

## 3. Audiences

| # | Audience | Rôle dans le pipeline | Priorité S7 |
|---|---|---|---|
| 1 | **Designer (Claude Design)** | Produit tokens + mockups, exporte `tokens.json` à la main | P0 |
| 2 | **Dev fullstack v0.5** | Lance le script d'export, intègre CSS dans le MVP | P0 |
| 3 | **CEO** | Valide les changements structurants (nouvelle palette, typo) | P1 |
| 4 | **Reviewer PR** | Lit le diff CSS généré, confirme qu'il n'y a pas de régression | P1 |

## 4. Questions à trancher

### Q1 — Format source des tokens

- **Option A** — garder `colors_and_type.css` comme source canonique, pas de JSON. Pro : pas de double maintenance. Con : impossible à lire programmatiquement, les autres CSS doivent `@import` au lieu de pouvoir être régénérés.
- **Option B** — **`02_design-system/tokens.json`** devient source canonique, `colors_and_type.css` et autres CSS sont **générés** par script. Pro : une seule source de vérité, export vers N cibles possible. Con : ajoute un fichier à tenir.
- **Option C** — Style Dictionary (Amazon, standard de l'industrie design tokens). Pro : riche, multi-plateformes (CSS, iOS, Android). Con : dépendance lourde, config YAML, over-engineering pour un MVP vanilla.

**Reco** : **B** (JSON source minimal). Cohérent avec S6 (Node 20 vanilla), tue le risque de dérive, ~80 lignes de script.

### Q2 — Outil d'export

- **Option A** — script maison Node minimal (`02_design-system/scripts/export.js`, ~60 lignes, `fs` + `JSON.parse` + templating string).
- **Option B** — Style Dictionary (cf. Q1-C).
- **Option C** — PostCSS plugin custom (`postcss-custom-properties` + manifest JSON). Puissant mais config YAML + chaîne PostCSS à installer.

**Reco** : **A** (script maison). Lisible à 100 %, pas de dépendance, évolue avec l'équipe.

### Q3 — Déclencheur

- **Option A** — manuel : le designer ou le dev lance `npm run ds:export` dans `02_design-system/`. Commit manuel des fichiers générés.
- **Option B** — pre-commit hook Husky qui régénère avant chaque commit touchant `tokens.json`.
- **Option C** — GitHub Action qui régénère sur PR et commit le diff automatiquement.

**Reco** : **A maintenant, B en Sprint 3 v0.5** (quand Husky + tests arrivent dans la stack per SPEC-FUSION §9). C pas prioritaire en MVP local Windows mono-poste. Issue GitHub `infra/ds-export-pre-commit-hook` à ouvrir pour S3 v0.5.

### Q4 — Portée des tokens exportés

- **Option A** — **couleurs + typographie uniquement** (MVP minimum — c'est tout ce qui bouge en ce moment).
- **Option B** — couleurs + typographie + espacements + radii + shadows + motions (couverture complète de `colors_and_type.css` + `app.css` header).
- **Option C** — tout, y compris les classes utilitaires (portlet, coach-strip, ai-card, chip — composants applicatifs, pas des tokens à proprement parler).

**Reco** : **B** (couverture tokens complète, pas les composants). Les composants restent du CSS écrit à la main dans `app.css` — ils **consomment** les tokens générés, ne sont pas générés eux-mêmes. Frontière claire : tokens = primitives atomiques, composants = compositions.

### Q5 — Gouvernance : chemin type + règle maintien unifiée

- **Option A** — documenter juste le chemin type dans GOUVERNANCE.md (§"Synchronisation Claude Design → Cowork → GitHub" enrichi avec les 7 étapes concrètes).
- **Option B** — A + ajouter une section unique **"Maintien des livrables : continu + audit trimestriel"** qui couvre drafts (S3) + livrables dev (S6) + DS (S7) en une seule règle.
- **Option C** — A + B + calendrier des audits trimestriels figé (Q2 = 24/07, Q3 = 24/10, Q4 = 24/01, Q1 = 24/04).

**Reco** : **C** (A + B + calendrier figé). Sinon les audits trimestriels se font "un jour". Avec un calendrier dans GOUVERNANCE.md, la discipline est mécanique : chaque trimestre, on ouvre 3 Issues GitHub (`audit/drafts`, `audit/livrables-dev`, `audit/ds`) dans le milestone du trimestre.

## 5. Bundle reco

| Q | Reco | Effet |
|---|---|---|
| Q1 | **B** — `tokens.json` source canonique | Une source unique, diff machine-lisible, export vers N cibles. |
| Q2 | **A** — script Node maison `scripts/export.js` | ~60 lignes, zéro dépendance, lisible à 100 %. |
| Q3 | **A maintenant, B Sprint 3 v0.5** | Manuel au début, pre-commit hook quand Husky arrive dans la stack. |
| Q4 | **B** — couleurs + typo + espacements + radii + shadows | Tokens = primitives atomiques. Composants restent CSS manuel. |
| Q5 | **C** — chemin type + règle maintien unifiée + calendrier trimestriel figé | Discipline mécanique, règle S3+S6+S7 mutualisée une seule fois. |

### Livrables si bundle reco accepté

1. **ADR** `2026-04-24 · Pipeline tokens DS → CSS + maintien unifié` dans `00_BOUSSOLE/DECISIONS.md`.
2. **`02_design-system/tokens.json`** — dérivé de `colors_and_type.css` actuel (couleurs, typo, espacements, radii, shadows). Source canonique.
3. **`02_design-system/scripts/export.js`** — script Node minimal (~60 lignes) qui régénère `colors_and_type.css` + pousse vers `03_mvp/public/assets/colors_and_type.css`. Commande : `node scripts/export.js`.
4. **`02_design-system/package.json`** (si absent) + script `npm run ds:export` pour simplicité.
5. **Patch `00_BOUSSOLE/GOUVERNANCE.md`** :
   - §"Synchronisation" enrichi avec les **7 étapes du chemin type** (token modifié dans Claude Design → export `tokens.json` → `npm run ds:export` → PR avec diff CSS → revue CEO si structurant → merge → close Issue).
   - Nouvelle section **"Maintien des livrables : continu + audit trimestriel"** mutualisée pour drafts, livrables dev, DS (couvre S3+S6+S7).
   - **Calendrier trimestriel figé** : audits Q2 (24/07/2026), Q3 (24/10), Q4 (24/01/2027), Q1 (24/04/2027). 3 Issues à ouvrir à chaque date.
6. **Patch `04_docs/07-design-system.md`** §2.3 — encadré "Source canonique des tokens = `tokens.json`, ce document est la doc de référence. Pour modifier un token, voir GOUVERNANCE.md §chemin type."
7. **Clôture S7 dans `JOURNAL.md`**.

### Parqué explicitement
- **Pre-commit Husky** — Issue GitHub `infra/ds-export-pre-commit-hook` à ouvrir, exécution Sprint 3 v0.5.
- **Style Dictionary** — pas maintenant, à reconsidérer si on passe multi-plateformes (Mac, iOS) en V2+.
- **Export automatique Claude Design → tokens.json** — plafond structurel (Claude Design n'a pas d'API). Étape manuelle assumée.
- **GitHub Action auto-commit CSS** — pas en MVP mono-poste Windows. Reconsidérer V1+ quand on dépasse le local.

## 6. Décisions

CEO : **bundle reco accepté intégralement** sur les 5 dimensions.

| Q | Décision | Commentaire |
|---|---|---|
| Q1 — Format source | **B** — `02_design-system/tokens.json` canonique, `colors_and_type.css` en partie généré | Structure `{ $meta, fonts.faces, vars }`. Bloc entre marqueurs `/* === GENERATED FROM tokens.json === */` ... `/* === END GENERATED === */` réécrit par script. Section "Semantic type roles" en queue reste hand-written (composants typographiques qui consomment les tokens). |
| Q2 — Outil d'export | **A** — script Node maison `02_design-system/scripts/export.js` | ~90 lignes ESM, zéro dépendance (`fs`, `path`, `url`). Lit `tokens.json`, rend `@font-face` + `:root { --token: value }`, réécrit le bloc généré, pousse une copie identique vers `03_mvp/public/assets/colors_and_type.css`. Rapport console en fin d'exécution. |
| Q3 — Déclencheur | **A maintenant, B Sprint 3 v0.5** | `npm run ds:export` manuel au début. Pre-commit hook Husky parqué dans Issue GitHub `infra/ds-export-pre-commit-hook`, exécution Sprint 3 v0.5 (quand la stack Husky + tests arrive per SPEC-FUSION §9). GitHub Action pas prioritaire en mono-poste Windows. |
| Q4 — Portée tokens | **B** — couleurs + typo + espacements + radii + shadows + gradients | Frontière claire : **tokens = primitives atomiques** (générés), **composants = compositions** (portlet, coach-strip, ai-card, chip — restent CSS manuel dans `app.css`). 12 groupes de `vars` dans `tokens.json`. |
| Q5 — Gouvernance | **C** — chemin type 7 étapes + règle maintien unifiée + calendrier trimestriel figé | Les trois règles "maintien continu + audit trimestriel" déposées par S3 (drafts) + S6 (livrables dev) + S7 (DS) sont mutualisées une seule fois. 4 dates figées d'ouverture (24/07, 24/10, 24/01, 24/04), 3 issues par date, label `type/audit-trimestriel`, délai 10 jours ouvrés. Auto-déclencheur v0.5 via Service Windows tâche planifiée (SPEC-FUSION §7). |

## 7. Livrables produits

1. **ADR** `2026-04-24 · Pipeline tokens DS → CSS + maintien unifié` ajoutée en tête de `00_BOUSSOLE/DECISIONS.md` (5 options par dimension, décision bundle, 10 conséquences).
2. **`02_design-system/tokens.json`** créé — source canonique. Structure `{ $meta, fonts.faces (12 entrées : Fira Sans 10 poids + Aubrielle + Sol), vars (12 groupes couvrant Color neutrals/brand/accents, Type families/scale/line-heights/tracking/weights, Shape radius/shadow/space, Gradient & ring) }`.
3. **`02_design-system/scripts/export.js`** créé — ~90 lignes Node ESM, zéro dépendance. Algorithme : lire `tokens.json` → rendre `@font-face` + `:root { --token: value }` → localiser marqueurs `GEN_START`/`GEN_END` dans `colors_and_type.css` → remplacer le bloc entre marqueurs (préserve hand-written) → mkdir + écriture dans `03_mvp/public/assets/colors_and_type.css`. Rapport console (N faces + N tokens + N groupes + chemins + 4 prochaines étapes git).
4. **`02_design-system/package.json`** créé — `{ "type": "module", "scripts": { "ds:export": "node scripts/export.js" } }`, zéro dépendance (hors `private: true`, `license: UNLICENSED`, metadata `name/version/description/author`).
5. **Patch `02_design-system/colors_and_type.css`** — en-tête enrichi (note "SOURCE CANONIQUE : tokens.json" + renvoi vers `GOUVERNANCE.md §chemin type`). Marqueur `/* === GENERATED FROM tokens.json — do not edit by hand === */` ajouté avant le bloc `@font-face`. Marqueur `/* === END GENERATED === */` ajouté après le `}` fermant du `:root` final, juste avant la section `SEMANTIC TYPE ROLES` (annotée "hand-written — composants typographiques, consomment les tokens ci-dessus").
6. **Gros patch `00_BOUSSOLE/GOUVERNANCE.md`** :
   - Nouvelle sous-section **"Chemin type d'un changement de token (7 étapes)"** sous §Synchronisation : exploration Claude Design → export `tokens.json` → `npm run ds:export` → contrôle visuel `preview/colors-*.html` → `git diff --stat` + commit typé → PR + revue CEO si structurant (≥ 30 min débat OU visible dans 10 dernières sec d'usage) → close Issue GitHub `lane/design-system`. **Interdit** : éditer à la main le bloc entre marqueurs GENERATED. **Parqué** : pre-commit Husky.
   - Nouvelle section **"Maintien des livrables : continu + audit trimestriel"** — règle mutualisée S3+S6+S7. Table 5 lignes : `_drafts/*`, `ONBOARDING-DEV.md`, `RUNBOOK-OPS.md`, `openapi.yaml` (post S2 plan audit), `tokens.json` + CSS générés. Chaque ligne a un régime continu + un propriétaire d'audit trimestriel.
   - Sous-section **"Calendrier trimestriel figé"** : 4 dates (Q2 24/07/2026, Q3 24/10, Q4 24/01/2027, Q1 24/04/2027), 3 issues par date (`audit/drafts Qx`, `audit/livrables-dev Qx`, `audit/ds Qx`), label dédié `type/audit-trimestriel` à créer, délai d'exécution 10 jours ouvrés, auto-déclencheur v0.5 via Service Windows.
7. **Patch `04_docs/07-design-system.md` §2.3** — blockquote en tête : "Source canonique des tokens : `02_design-system/tokens.json` (depuis S7 atelier cohérence, ADR `2026-04-24 · Pipeline tokens DS → CSS + maintien unifié`). Le fichier `colors_and_type.css` est **en partie généré** ; la section "Semantic type roles" en fin de fichier reste hand-written."
8. Clôture S7 dans `JOURNAL.md` avec entrée complète (décision, coût caché adressé, livrables, parqués, à reprendre en aval).

## 8. À reprendre en aval

- **S8** — valider que `tokens.json` + script exportent bien vers les 3 emplacements CSS attendus sans régression visuelle (test : diff `colors_and_type.css` pré/post première exécution doit être vide ou minimal).
- **Issue GitHub** `infra/ds-export-pre-commit-hook` à ouvrir manuellement (scope MVP, P2, Sprint 3 v0.5).
- **Calendrier audits trimestriels** — à intégrer dans les milestones GitHub (3 issues ouvertes chaque 24 du trimestre).
