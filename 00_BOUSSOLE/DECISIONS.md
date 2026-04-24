# DECISIONS — Architecture Decision Records (ADR léger)

Une entrée par décision débattue ≥ 30 minutes. Les micro-arbitrages vont dans les messages de commit.

Format :
- **Date · Titre court**
- Contexte, options, décision, conséquences
- Pas de retour en arrière sans un nouvel ADR qui annule

---

## 2026-04-24 · Pipeline tokens DS → CSS + maintien unifié

**Contexte** : audit §P2-7/P2-8 + S2 typographie → coût caché des "3 silos indépendants" (Claude Design ↔ Cowork ↔ GitHub) : chaque modif de token descend en ~1 h de coordination manuelle, sans chemin type documenté ni source machine-lisible. S2 a figé Fira Sans mais n'a formalisé ni le format source des tokens, ni le script d'export, ni le déclencheur. En parallèle, S3 (drafts) et S6 (livrables dev) ont chacune déposé une règle "maintien continu + audit trimestriel" qu'il fallait mutualiser une seule fois.

**Options étudiées** (par dimension) :

- **Format source** : CSS canonique hand-written (statu quo), **`tokens.json`** machine-lisible + CSS généré, ou Style Dictionary (Amazon, multi-plateformes).
- **Outil d'export** : **script Node maison** (~60 lignes, zéro dépendance), Style Dictionary, ou PostCSS plugin.
- **Déclencheur** : **manuel** (`npm run ds:export`), pre-commit Husky, ou GitHub Action.
- **Portée tokens** : couleurs + typo uniquement, **couleurs + typo + espacements + radii + shadows + gradients** (primitives atomiques), ou tout y compris composants applicatifs.
- **Gouvernance** : chemin type seul dans GOUVERNANCE.md, chemin type + règle maintien unifiée, ou **chemin type + règle unifiée + calendrier trimestriel figé**.

**Décision** : bundle cohérent sur 5 dimensions.
1. **`02_design-system/tokens.json` = source canonique** — JSON minimal, structure `{ $meta, fonts.faces, vars }`. `colors_and_type.css` devient **en partie généré** : bloc entre marqueurs `/* === GENERATED FROM tokens.json === */` ... `/* === END GENERATED === */` réécrit par script, section "Semantic type roles" en queue reste hand-written.
2. **Script Node maison** (`02_design-system/scripts/export.js`, ~90 lignes ESM, zéro dépendance) — lit `tokens.json`, rend `@font-face` + `:root { --token: value; }`, réécrit le bloc généré dans `colors_and_type.css`, pousse une copie identique vers `03_mvp/public/assets/colors_and_type.css`. Commande : `npm run ds:export`.
3. **Déclencheur manuel maintenant, Husky en Sprint 3 v0.5** — `npm run ds:export` sur chaque commit qui touche `tokens.json`. Pre-commit hook Husky parqué dans Issue `infra/ds-export-pre-commit-hook`, exécution Sprint 3 v0.5 (quand la stack Husky + tests arrive per SPEC-FUSION §9).
4. **Tokens atomiques complets** — couleurs + typo (families, scale, line-heights, tracking, weights) + espacements + radii + shadows + gradients. Frontière claire : **tokens = primitives atomiques** (générés), **composants = compositions** (`app.css`, `product.app.css`, `portlet`, `coach-strip`, `ai-card`, `chip` — restent CSS manuel et consomment les tokens).
5. **Gouvernance triple** — chemin type 7 étapes dans `GOUVERNANCE.md` (exploration Claude Design → export `tokens.json` → `ds:export` → preview → diff + commit → PR + revue CEO si structurant → close Issue) + section **"Maintien des livrables : continu + audit trimestriel"** mutualisée (drafts S3 + livrables dev S6 + DS S7) + **calendrier trimestriel figé** (Q2 24/07/2026, Q3 24/10, Q4 24/01/2027, Q1 24/04/2027 ; 3 issues `audit/drafts` + `audit/livrables-dev` + `audit/ds` à chaque date, délai 10 jours ouvrés, label `type/audit-trimestriel`).

**Conséquences** :
- 6 livrables produits : `02_design-system/tokens.json`, `02_design-system/scripts/export.js`, `02_design-system/package.json` (script `ds:export`), patch `02_design-system/colors_and_type.css` (marqueurs GENERATED ajoutés), gros patch `00_BOUSSOLE/GOUVERNANCE.md` (chemin type + règle unifiée + calendrier), patch `04_docs/07-design-system.md` §2.3 (source canonique = `tokens.json`).
- Coût caché "3 silos" transformé en **chemin mécanique** : ~1 h de coordination manuelle → ~15 min (export JSON → `npm run ds:export` → diff → commit).
- Trois règles S3+S6+S7 "maintien continu + audit trimestriel" **mutualisées une seule fois** dans GOUVERNANCE.md — plus de redite en trois endroits.
- Parqués explicitement : pre-commit Husky (Issue `infra/ds-export-pre-commit-hook`, Sprint 3 v0.5), Style Dictionary (V2+ si multi-plateformes), export auto Claude Design → tokens.json (plafond structurel Claude Design sans API), GitHub Action auto-commit CSS (V1+ quand on dépasse le local).
- Auto-déclencheur des 3 issues trimestrielles prévu en v0.5 via Service Windows tâche planifiée (cf. SPEC-FUSION §7). D'ici là : tâche manuelle marquée dans l'agenda CEO.
- **Interdit** : éditer à la main le bloc entre marqueurs `GENERATED` dans `colors_and_type.css` (écrasé sans avertissement à la prochaine exécution `ds:export`).
- S8 validera que `npm run ds:export` régénère bien le CSS sans régression visuelle (diff pré/post première exécution doit être minimal ou vide), et auditera la cohérence tokens ↔ preview ↔ 03_mvp.

---

## 2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook

**Contexte** : audit de cohérence §P1-5 — audience CTO/dev interne couverte à ~70 %, trois manques : pas d'onboarding dev structuré, pas de spec OpenAPI 3.0, pas de runbook ops. Équipe v0.5 confirmée en S4 (2 fullstack arrivent 05/05) → besoin P0 de rendre les devs productifs à J+2.

**Options étudiées** (par dimension) :

- **Format** : monolithique, éclaté OSS 3 fichiers (ONBOARDING + CONTRIBUTING + RUNBOOK), ou **éclaté minimal** 2 fichiers.
- **OpenAPI** : hand-written depuis SPEC-FUSION §6, généré depuis code v0.5, ou **hybride** (hand-written maintenant, bascule vers généré en Sprint 3-4).
- **Portée runbook** : minimal (pannes vécues), exhaustif (anticipation V1+), ou **minimal vivant** (règle : chaque panne diagnostiquée → entrée runbook).
- **Stockage** : tout `04_docs/`, tout `03_mvp/`, ou **hybride par nature** (doc dev dans `03_mvp/docs/` + pointeurs dans `04_docs/00-README.md`).
- **Maintien** : par sprint, trimestriel, ou **continu + audit trimestriel** (pattern S3).

**Décision** : bundle cohérent sur 5 dimensions.
1. **Éclaté minimal** — 2 fichiers (`ONBOARDING-DEV.md` + `RUNBOOK-OPS.md`), pas de `CONTRIBUTING.md` tant que l'équipe reste < 4 personnes.
2. **OpenAPI hybride** — `openapi.yaml` hand-written dérivé de `SPEC-TECHNIQUE-FUSION.md` §6 produit en S2 du plan audit (12/05 → 18/05), puis bascule vers génération depuis code en Sprint 3-4 v0.5 (Zod + zod-to-openapi).
3. **Runbook minimal vivant** — démarre avec 5-8 modes de panne connus, règle explicite en tête : chaque panne diagnostiquée en prod → entrée runbook dans le sprint en cours.
4. **Stockage hybride** — `03_mvp/docs/` pour les 3 fichiers (co-évolution avec le code), pointeurs dans `04_docs/00-README.md` + `SPEC-TECHNIQUE-FUSION.md` §6 pour découvrabilité.
5. **Maintien continu + audit trimestriel** — règle mutualisée avec les drafts S3 dans `GOUVERNANCE.md` (patch prévu S7).

**Conséquences** :
- 2 squelettes créés maintenant : `03_mvp/docs/ONBOARDING-DEV.md` + `03_mvp/docs/RUNBOOK-OPS.md`.
- `openapi.yaml` parqué en sprint production S2 plan audit (12/05 → 18/05), ~1,5 j de travail doc.
- Issue GitHub à ouvrir manuellement : `infra/openapi-generated-from-code` (scope MVP, priorité P1, exécution Sprint 3-4 v0.5).
- Parqués explicitement : `CONTRIBUTING.md` séparé (ré-ouverture si contractor V2+), `ONBOARDING-DEV-EXTERNE.md` (post-V2), runbook exhaustif (contre-indiqué par règle vivante).
- S7 devra intégrer la règle "maintien continu + audit trimestriel" dans `GOUVERNANCE.md` (à mutualiser avec drafts S3).
- S8 devra valider que les 3 livrables dev restent cohérents avec `SPEC-TECHNIQUE-FUSION.md`.

---

## 2026-04-24 · Fusion app-web ↔ MVP en produit unifié

**Contexte** : deux sous-projets en parallèle — `01_app-web/` (SPA vanilla JS + localStorage, 13 pages cockpit Twisty v4) et `03_mvp/` (Node Express + Claude API + JSON files, flux matin/soir/délégation). La frontière est devenue floue (doublons pages, double source de vérité sur les données, deux stacks à maintenir).

**Options étudiées** :
- (A) Garder les deux séparés indéfiniment (app-web = vitrine statique, MVP = copilote)
- (B) **MVP absorbe app-web** — le serveur Node sert les pages de cockpit, SQLite remplace localStorage + JSON, un seul produit à la fin
- (C) App-web absorbe MVP (flux IA côté client via appels API directs) — pas viable pour OAuth Graph, secrets, données lourdes

**Décision** : B. Le MVP absorbe l'app-web. Vanilla JS conservé côté client (pas de refactor SolidJS maintenant, F17 muté). Migration des 13 pages cockpit dans `03_mvp/public/`, SQLite via `better-sqlite3` pour tout (groupes, projets, tâches, décisions, contacts, semaines, big rocks, sessions matin/soir), mise à plat des 21 pages en 13 pages cibles.

**Conséquences** :
- Arrêt de l'évolution isolée de `01_app-web/` — gel au niveau actuel, basculé en référence visuelle.
- Migration one-shot des données localStorage + JSON vers SQLite (script dédié avec backup/rollback).
- Refonte des assets : un seul `app.css` et une seule `data.js` côté `03_mvp/public/`.
- Specs détaillées : `04_docs/SPEC-FONCTIONNELLE-FUSION.md` et `04_docs/SPEC-TECHNIQUE-FUSION.md` (issues GitHub P0 ouvertes).
- La trajectoire MVP → V1 → V2 → V3 reste valable (Service Windows, Graph API, Chrome extension en V1+).

---

## 2026-04-24 · Backlog xlsx → GitHub Issues (source de vérité)

**Contexte** : `04_docs/09-backlog.xlsx` contenait 78 items (42 features F1-F42, ~35 tactiques, 1 epic infra) répartis sur 7 onglets (README, Backlog, Roadmap, KPIs, Budget, Risques). Double gestion (xlsx local + roadmap HTML + discussions Cowork) = dérives permanentes.

**Options étudiées** :
- (A) Garder xlsx comme backlog vivant
- (B) **Migrer vers GitHub Issues** avec 29 labels (`lane/*`, `type/*`, `priority/*`, `status/*`, `phase/*`, `scope/*`) et 4 milestones (MVP, V1, V2, V3)
- (C) Outil externe (Linear, Jira)

**Décision** : B. GitHub Issues devient la source unique du backlog. Script PowerShell `_scratch/setup-github-issues.ps1` (ASCII, ExecutionPolicy Bypass) exécuté le 24/04 : 78 issues créées dans `feycoil/aiCEO`, liées aux milestones + labels.

**Conséquences** :
- Le xlsx est archivé (`_archive/2026-04-backlog-initial/`). Plus aucune source parallèle.
- Tout nouveau besoin produit = nouvelle Issue (pas de TODO dans le code).
- `04_docs/08-roadmap.md` doit être mis à jour pour pointer vers les milestones GitHub (plus vers l'xlsx).
- Le script PowerShell est archivé avec la migration.

---

## 2026-04-24 · Restructuration en aiCEO/ unifié

**Contexte** : deux dossiers séparés (`aiCEO_Agent/` + `aiCEO_Design_System/`), fichiers orphelins, pas de versioning, pas de distinction draft / livrable.

**Options étudiées** :
- (A) Laisser en l'état, documenter les conventions
- (B) Fusionner dans une arborescence numérotée 00_BOUSSOLE / 01..06 + zones `_drafts/` `_archive/` `_scratch/`
- (C) Fusionner mais sans numérotation (arborescence plate par domaine)

**Décision** : B. La numérotation force l'ordre de lecture, rend le dossier auto-documenté, et sépare clairement ce qui est canonique (01-06) de ce qui est en maturation (`_drafts/`) ou historique (`_archive/`).

**Conséquences** :
- Tous les chemins internes changent. À corriger : liens dans `04_docs/10-exec-deck.pptx` (pointe vers anciens chemins ?), scripts MVP qui lisent `../assets/data.js` → devient `../01_app-web/assets/data.js`.
- Les scripts manuels (raccourcis Windows, start.bat) doivent être revus.

---

## 2026-04-24 · GitHub sur compte perso privé (pas orga ETIC)

**Contexte** : besoin d'un versioning + source de vérité. Choix entre compte personnel GitHub et organisation ETIC.

**Options étudiées** :
- (A) Perso privé
- (B) Orga ETIC Services privée

**Décision** : A. Plus rapide à mettre en place, pas de permissions à régler. Transférable vers l'orga ETIC ultérieurement si le produit est adopté par l'entreprise.

**Conséquences** :
- Propriété intellectuelle temporairement sur le compte perso. À clarifier si le produit devient un livrable ETIC officiel.

---

## 2026-04-22 · Outlook COM plutôt que Microsoft Graph

**Contexte** : besoin d'ingérer les mails pour enrichir le contexte d'arbitrage.

**Options étudiées** :
- (A) COM local via PowerShell — Outlook doit être ouvert
- (B) Microsoft Graph avec enregistrement Azure AD

**Décision** : A pour le MVP. Pas de setup Azure, pas de consentement admin, pas d'OAuth. Outlook est déjà ouvert sur le poste.

**Conséquences** :
- Dépendance à Outlook lancé pour ingérer
- Les données ne quittent pas le poste (bon pour la confidentialité)
- Graph à prévoir pour V2+ quand on aura l'envoi natif de mails

---

## 2026-04-22 · REPORTER sans plafond dans l'arbitrage

**Contexte** : sur 20 tâches, Claude renvoyait parfois 3/2/12 ou forçait dans un des 3 paniers. Il "perdait" des tâches en fin de liste.

**Options étudiées** :
- (A) Garder 3/2/3 strict → oblige Claude à trancher, risque de perdre les petites
- (B) FAIRE ≤ 3, DÉLÉGUER ≤ 2, REPORTER absorbe tout le reste

**Décision** : B. Aucune tâche n'est perdue. La colonne REPORTER peut contenir 20+ items, c'est le journal du jour.

**Conséquences** : UI adaptée (scroll dans REPORTER), règle affichée « 0 tâche perdue » comme engagement produit.

---

## 2026-04-24 · Trajectoire produit : local-first comme pont jetable vers cloud V1+, avec continuité d'usage CEO

**Contexte** : l'audit de cohérence du 24/04 (`04_docs/AUDIT-COHERENCE-2026-04-24.md`, dissonance C1) a mis en évidence trois narratifs concurrents — `01-vision-produit.md` promet un copilote cloud SaaS multi-CEO, les specs fusion (`SPEC-*-FUSION.md`) décrivent une app Node **locale Windows mono-poste**, et le code livré v0.4 est local. Il fallait trancher : local-first est-il un pont, la destination, ou faut-il accélérer le cloud dès v0.5 ? Atelier de cohérence, Session 1 (`04_docs/_atelier-2026-04-coherence/sessions/S1-narratif-produit.md`).

**Options étudiées** :
- (A) **Pont jetable** : v0.4/v0.5 local, rebascule cloud en V1 (Supabase + Graph + Inngest)
- (B) **Destination locale souveraine** : v0.5 → V3 local, positionnement "copilote qui ne quitte jamais le poste"
- (C) **Accélération cloud** : skip SQLite locale, v0.5 déjà cloud

**Décision** : **A — pont jetable, avec contrainte forte de continuité d'usage CEO**.

Deux motifs :
1. Conforme aux specs fusion déjà rédigées (10 sprints S1-S8), aucun chantier supplémentaire.
2. La bascule cloud V1 était déjà implicite dans la roadmap ; on l'explicite comme choix assumé, pas comme dérive.

**Contrainte ajoutée par le CEO (irréversible sauf nouvel ADR)** :
Le CEO **ne doit pas perdre l'usage** pendant la phase fusion v0.5 ni pendant la bascule cloud V1. Il doit pouvoir **tester toutes les fonctionnalités et produire du retour d'usage en continu**, pas par à-coups.

Conséquences opérationnelles de la contrainte :
- **Fusion v0.5 progressive, pas big-bang** : chaque sprint S1-S8 livre une fonctionnalité utilisable de bout en bout (pas un palier technique invisible). Le MVP v0.4 reste opérationnel jusqu'à parité atteinte par le nouveau code.
- **Mode parallèle obligatoire** : pendant la transition, l'ancien MVP (port 4747 + JSON) et le nouveau (fusion + SQLite) cohabitent sur le poste. Le CEO bascule fonction par fonction, pas d'un coup.
- **Rollback à chaque étape** : chaque migration (données, schéma, endpoint) doit pouvoir revenir en arrière en moins de 10 minutes, sans perte de décisions prises entre-temps.
- **Parité fonctionnelle avant bascule finale** : pas d'arrêt de v0.4 tant que v0.5 n'a pas démontré parité + stabilité sur 1 semaine d'usage CEO réel.
- **Même logique V0.5 → V1** : la bascule cloud V1 se fera aussi par vagues, avec période de coexistence local + cloud pour éviter toute coupure.

**Conséquences produit** :
- Le travail v0.5 sur `better-sqlite3`, `node-windows`, PowerShell COM, schéma SQLite est **assumé en partie jetable en V1** — c'est un choix, pas une surprise.
- `01-vision-produit.md` doit expliciter "aiCEO aujourd'hui (local) / aiCEO horizon 2027 (cloud)" pour que quiconque lit la vision comprenne la trajectoire.
- `02-benchmark.md` doit distinguer benchmark court terme (productivité desktop, Copilot, Rewind) et benchmark horizon (cloud SaaS Motion/Sunsama/Lattice).
- `08-roadmap.md` V1 doit explicitement budgéter la **refonte stack local → cloud** (pas seulement des nouvelles features).
- Chaque sprint fusion doit inclure un critère d'acceptation "le CEO peut l'utiliser + donner du feedback" avant de passer au sprint suivant.

**Conditions de revisite** : uniquement si un blocage technique majeur impose l'accélération cloud (ex. SQLite ne tient pas la charge, Outlook COM bloqué par IT corp) — et dans ce cas, nouvel ADR avec plan de continuité d'usage équivalent.

---

## 2026-04-24 · Typographie canonique : Fira Sans self-hosted

**Contexte** : l'audit de cohérence (`04_docs/AUDIT-COHERENCE-2026-04-24.md`, dissonance C2) a mis en évidence **trois sources de vérité contradictoires** sur la typographie :
- `02_design-system/tokens/typography.json` + `colors_and_type.css` → **Fira Sans** (10 poids self-hosted) + Aubrielle + Sol Thin
- `02_design-system/assets/app.css` + `product.app.css` + `01_app-web/assets/app.css` → **Inter** via `@import` CDN `rsms.me/inter/inter.css`
- `03_mvp/public/index.html` + `evening.html` → **Cambria / Calibri** inline
- `04_docs/07-design-system.md` § 2.3 → documentait Inter (alors que les tokens disaient Fira)

Conflit documenté dans `02_design-system/REPO-CONTEXT.md` mais jamais tranché. Atelier de cohérence, Session 2 (`04_docs/_atelier-2026-04-coherence/sessions/S2-typographie.md`).

**Options étudiées** :
- (A) **Fira Sans canonique** (tokens gagnent) — purger Inter et Cambria/Calibri
- (B) Inter canonique (code livré gagne) — aligner tokens sur Inter
- (C) Fira canonique + Inter fallback — stack hybride

**Décision** : **A — Fira Sans canonique, self-hostée, zéro dépendance CDN**.

Motifs :
1. Les tokens DS représentent un choix d'identité produit **explicite et délibéré** (Fira Sans = plus humain, plus institutionnel, moins "startup SF"). Inter était un fallback technique arrivé au scaffolding, pas un choix.
2. Le self-hosting des fontes supprime la dépendance Google Fonts / `rsms.me`, conforme à la trajectoire locale souveraine actée en S1 (ADR `2026-04-24 · Trajectoire produit`).
3. Les 10 fichiers OTF Fira Sans + Aubrielle_Demo + Sol Thin sont **déjà présents** dans `02_design-system/fonts/`.

**Patches appliqués 2026-04-24** :
- `02_design-system/assets/app.css` : `@import rsms.me/inter` → `@import ../colors_and_type.css`
- `02_design-system/assets/product.app.css` : idem + `font-family: "Inter var"…` → `"Fira Sans"…`
- `01_app-web/assets/app.css` : purge `@import Inter`, ajout `@font-face` Fira (6 poids) pointant vers `../../02_design-system/fonts/`, `font-family` basculée
- `03_mvp/public/index.html` : `Calibri`, `Cambria` remplacés par `"Fira Sans", Calibri, …` / `"Fira Sans", Cambria, …` (Fira première, anciennes fontes en fallback tant que `@font-face` n'est pas servi localement par le MVP)
- `03_mvp/public/evening.html` : idem
- `04_docs/07-design-system.md` § 2.3 : réécriture complète, stack Fira, poids étendus 100-900, OpenType features documentées
- `02_design-system/REPO-CONTEXT.md` : note "conflit résolu 2026-04-24" (à compléter hors session)

**Continuité d'usage (ADR S1)** : le MVP conserve Cambria/Calibri en fallback visuel immédiat tant que la fusion v0.5 n'a pas servi les fichiers Fira localement sous `03_mvp/public/assets/fonts/`. Aucune régression visible pour le CEO. Le passage visible à Fira Sans se fera lors du sprint S1 de la fusion (copie des assets DS dans `public/`, déjà prévu dans `SPEC-TECHNIQUE-FUSION §3`).

**Conséquences** :
- Issue GitHub à ouvrir manuellement dans `feycoil/aiCEO` : `lane/design-system` + `priority/high`, titre *"[DS] Fusion v0.5 · copier fonts Fira Sans dans 03_mvp/public/assets/fonts/"*, référence cette ADR (contenu d'issue préparé dans `_atelier-2026-04-coherence/sessions/S2-typographie.md` §7).
- Tout nouveau CSS ou nouvelle page doit utiliser `"Fira Sans"` en première position, jamais Inter, jamais Cambria/Calibri de façon primaire.
- `02_design-system/tokens/typography.json` fait foi sur les poids et les features OT.

---

## 2026-04-24 · Hiérarchie des sources de vérité documentaires

**Contexte** : l'audit de cohérence (`AUDIT-COHERENCE-2026-04-24.md`, dissonance C3) a mis en évidence des périmètres recouvrants entre documents sans hiérarchie explicite — notamment `04_docs/06-architecture.md` v2.0 et `04_docs/SPEC-TECHNIQUE-FUSION.md`, qui décrivent tous deux l'architecture cible sans qu'on sache lequel fait foi sur quoi. Risque : le prochain dev qui modifie l'un oubliera l'autre. Atelier de cohérence, Session 3 (`04_docs/_atelier-2026-04-coherence/sessions/S3-sources-verite.md`).

**Options étudiées** :
- (A) Une seule source par périmètre, hiérarchie explicite dans un ADR (proposition atelier)
- (B) Fusionner les documents qui se chevauchent
- (C) Laisser l'existant et gérer au cas par cas

**Décision** : **A — hiérarchie explicite, une source canonique par périmètre**.

Tableau de référence unique (à citer dans tout nouveau document qui porte un de ces sujets) :

| Domaine | Source canonique | Rôle | Sources secondaires |
|---|---|---|---|
| **Architecture cible V1→V3** | `04_docs/06-architecture.md` | Carte large, trajectoire, budgets | — |
| **Architecture fusion v0.5** | `04_docs/SPEC-TECHNIQUE-FUSION.md` | Source opérationnelle : schéma SQL, endpoints REST, sprints S1-S8 | `06-architecture.md` §2 renvoie vers elle |
| **Spec fonctionnelle v0.5** | `04_docs/SPEC-FONCTIONNELLE-FUSION.md` | 13 pages cibles, user flows matin/soir/hebdo | — |
| **Roadmap & jalons** | `04_docs/08-roadmap.md` | Milestones, budgets, KPIs par jalon | `00_BOUSSOLE/ROADMAP.md` (compagnon exécutif) |
| **Backlog opérationnel** | GitHub Issues `feycoil/aiCEO` | Single source | `08-roadmap.md` RICE table en miroir light |
| **Décisions structurantes** | `00_BOUSSOLE/DECISIONS.md` | ADR ≥ 30 min de débat | Commits Git pour micro-arbitrages |
| **Design tokens & règles** | `02_design-system/colors_and_type.css` + `tokens/` | Canoniques | `07-design-system.md` (prose) |

**Règle d'arbitrage en cas de conflit** : la source canonique gagne. Toute source secondaire qui contredit le canon doit être mise à jour ou marquée obsolète dans la même PR.

**Conséquences** :
- Patch immédiat `04_docs/06-architecture.md` §2 : encadré *"Pour les détails opérationnels de la fusion v0.5 (schéma SQL, sprints, endpoints), la source canonique est `SPEC-TECHNIQUE-FUSION.md`. Ce document en donne la carte large et la trajectoire."*
- Toute PR qui touche l'une des sources canoniques doit vérifier si elle impacte une source secondaire et la mettre à jour le cas échéant.
- Ce tableau est la référence en cas de doute — toute future doc qui se chevauche avec un domaine listé doit déclarer explicitement son rôle par rapport au canon.

**Conditions de revisite** : nouvel ADR si un périmètre apparaît (ex. compliance, données client) ou si la fusion v0.5 absorbe complètement `06-architecture.md`.

---

## 2026-04-24 · Règle de vie des drafts (4 semaines max)

**Contexte** : l'audit de cohérence (dissonance C6) a identifié le dossier `_drafts/` comme hybride — il contient à la fois des **gabarits réutilisables** (`_template.md`, `_template-widget.jsx`) et des **itérations anciennes** (`REFONTE_v3.md`, `SPEC_v31.md`) sans règle de durée de vie. Résultat : accumulation silencieuse de docs obsolètes que personne n'ose supprimer. Atelier de cohérence, Session 3.

**Options étudiées** :
- (A) Règle 4 semaines + promotion/archivage binaire
- (B) Pas de règle, nettoyage ad-hoc
- (C) Dossier purement temporaire, vidé chaque fin de sprint

**Décision** : **A — règle 4 semaines max, promotion ou archivage binaire**.

**Règles** :
1. Les fichiers dont le nom commence par `_template` restent indéfiniment (gabarits).
2. Tout autre fichier dans `_drafts/` a une durée de vie **maximale de 4 semaines** depuis sa création.
3. Au-delà de 4 semaines, décision binaire obligatoire :
   - **Promu** : déplacé dans son emplacement définitif (`04_docs/`, `02_design-system/`, etc.) et référencé dans un index.
   - **Archivé** : déplacé dans `_archive/YYYY-MM-draft-<nom>/` avec un `README.md` court expliquant le contexte et la raison d'archivage.
4. Un draft peut être archivé **avant** 4 semaines s'il est content-obsolète (superseded par un livrable officiel).

**Action immédiate 2026-04-24** :
- `REFONTE_v3.md` et `SPEC_v31.md` décrivent une itération produit (v3 / v3.1, localStorage-only, `assistant.html` séparé) **superseded** par les fascicules `01` à `08` + `SPEC-FONCTIONNELLE-FUSION` + `SPEC-TECHNIQUE-FUSION`. Archivés dans `_archive/2026-04-drafts-heritage/` avec README contextuel.

**Conséquences** :
- `_drafts/README.md` créé, porteur de la règle + inventaire des gabarits.
- Tout nouveau draft doit inclure une date ISO dans son en-tête (`**Créé** : YYYY-MM-DD`) pour faciliter l'audit.
- Un audit trimestriel de `_drafts/` est prévu dans `GOUVERNANCE.md` (à patcher en S7 ou immédiatement).

**Conditions de revisite** : si le volume de drafts devient ingérable (> 10 simultanés) ou si la durée de 4 semaines s'avère trop courte pour certains types (ex. spec longue en incubation), affiner par type dans un nouvel ADR.

---

## 2026-04-24 · Timing & budget v0.5 réconciliés

**Contexte** : l'audit de cohérence (dissonances C1 et C5) a relevé que le dossier produit avance **quatre durées différentes** pour la fusion v0.5 (6 sem dans le chemin critique, 7 sem dans la synthèse, 9 sem dans SPEC-TECHNIQUE-FUSION, 10 sem dans la table des sprints) et **deux budgets incompatibles** (95 k€ dans la synthèse roadmap sans dérivation, 132 kEUR dans SPEC-TECHNIQUE-FUSION qui est en fait le budget v0.4 MVP). L'équipe v0.5 n'est par ailleurs documentée nulle part. Conséquence : le CEO ne peut pas citer un chiffre de v0.5 à un interlocuteur externe sans être contredit par un autre passage du dossier. Atelier de cohérence, Session 4.

**Options étudiées** :
- (A) Accepter le bundle reco — 6 sprints / 10 sem / 110 k€ / équipe 2,6 ETP documentée, V1 = 16 sem canonique avec §8 clarifié
- (B) Compresser à 5 sprints / 9 sem comme le propose SPEC-TECHNIQUE-FUSION
- (C) Viser 78 k€ avec une équipe serrée à 1,8 ETP (1 lead dev + 0,5 designer + 0,3 PMO)

**Décision** : **A — bundle reco**.

1. **6 sprints, 10 semaines** pour la fusion v0.5. S6 dédié au scellement (tag `v0.5`, release interne, rétro, communication) est conservé distinct du S5 (durcissement technique + Service Windows + tests e2e + CI).
2. **Équipe v0.5 = 2,6 ETP** : 2 fullstack dev + 0,3 product designer + 0,3 PMO. Feycoil reste dogfood user quotidien, non budgété.
3. **Budget v0.5 = ~110 k€** (10 sem × 2,6 ETP × 900 €/j × 4,5 j/sem ≈ 105 k€ dev + 5 k€ infra/LLM).
4. **V1 = 16 semaines canonique** (périmètre complet, budget 290 k€). Le chiffre "14 sem" du chemin critique §8 désigne le chemin vers "V1 cœur" (migration Postgres + Graph API + Inngest + sub-agents), les 8 sem restantes couvrent les enrichissements F15 SharePoint RAG, F19 viz riches, F12 rituels auto-draftés.

**Conséquences** :
- Patch `04_docs/08-roadmap.md` : §3.2 (retirer "~1,5 mois dev temps plein"), §3.2bis "Équipe v0.5" créée, §3.2ter "Budget v0.5" créée (dérivation explicite), §8 chemin critique (6→10 sem fusion + clarification V1 cœur vs V1 complet), §13 synthèse (7 sem → 10 sem, 95 k€ → 110 k€).
- Patch `04_docs/SPEC-TECHNIQUE-FUSION.md` §13 : ajout du Sprint 6 (scellement, 1 sem) ; remplacement de "132 kEUR conforme roadmap" par "110 kEUR (dérivation dans `08-roadmap.md` §3.2ter)".
- À partir de cet ADR, **tout chiffre v0.5** cité dans le dossier doit être aligné sur 10 sem / 110 k€ / 2,6 ETP ou amender cet ADR.
- Budget total 18 mois ajusté : MVP v0.4 dogfood (bien sous 132 k€) + v0.5 110 k€ + V1 290 k€ + V2 693 k€ + V3 598 k€ ≈ 1,69 M€ (ligne §13 `Budget 18 mois total ≈ 1,68 M€` reste valide).

**Conditions de revisite** : si la fusion v0.5 dépasse 12 semaines ou 130 k€, ouvrir un nouvel ADR avec analyse de la dérive (dette technique sous-estimée, équipe insuffisante, périmètre sous-estimé).

---

## 2026-04-24 · Livrables externes : cadrage

**Contexte** : l'audit de cohérence (dissonance C4) a relevé que le dossier produit est *« prêt à être utilisé, pas à être présenté »* — score complétude **0 % CEO pair**, **0 % client**, **40 % investisseur**. L'audit §5.3 insiste : *« le premier vrai test externe (CEO pair ETIC) est l'événement le plus important de la trajectoire post-v0.5 »*. Parallèlement, la dissonance C7 (positionnement obsolète — benchmark Lattice/Motion/Superhuman incompatible avec la réalité local-first post-fusion) bloque tout pitch crédible. Atelier de cohérence, Session 5.

**Options étudiées** :
- (A) CEO pair uniquement — scope minimal, 2-3 j
- (B) **CEO pair + Investisseur** — couvre P1-4 de l'audit intégralement, 4-5 j
- (C) Tout (+ client + partenaire tech) — 10+ j, livrables périmés avant V1

**Décision** : **B — CEO pair + Investisseur traités maintenant**, client et partenaire tech parqués (reco révisable post-V1 pour le client, post-V2 pour le partenaire tech).

**Cadrage S5** :
1. **5 livrables à produire** (sprint dédié 4-5 j, fenêtre S2 du plan audit 05/05 → 11/05) :
   - `04_docs/PITCH-ONEPAGE.md` — problème/solution/preuve/trajectoire/CTA, 1 page PDF
   - `04_docs/BUSINESS-CASE.md` — hypothèses revenue, coûts 18 mois (1,69 M€), point mort, ROI CEO utilisateur
   - `04_docs/ONBOARDING-CEO-PAIR.md` — prérequis, install Service Windows, import Outlook, premier arbitrage, FAQ
   - `04_docs/LETTRE-INTRO-CEO-PAIR.md` — template 1 page signée Feycoil, pair-à-pair
   - `04_docs/PITCH-DECK-INVESTISSEUR.pptx` — adaptation de `10-exec-deck.pptx` (redactions + traction + positionnement à jour + slides "pas encore construit")
2. **Dépendance bloquante P0** : patch `04_docs/02-benchmark.md` (refonte §3 : Copilot for Business / Rewind / Motion-desktop / plugin Outlook ; §0 ajouté "Deux marchés de référence selon phase produit"). Sans ce patch, le pitch investisseur ne tient pas.
3. **Stockage** : tous les livrables dans `04_docs/` avec préfixes MAJUSCULES (cohérent avec `SPEC-FONCTIONNELLE-FUSION.md` et `SPEC-TECHNIQUE-FUSION.md`). Nouvelle section "Livrables externes" ajoutée dans `04_docs/00-README.md`.
4. **Confidentialité** : un seul fichier par audience, pas de double version. En-tête de filtrage explicite obligatoire sur chaque livrable externe : `Audience : <CEO pair | Investisseur>. Éléments redactés : <liste>. Version interne de référence : <fichier>.`
5. **Cadence** : maintien continu, pas de fichiers versionnés (`-v0.5.md`). Chaque livrable porte `**Version produit visée** : <v0.5 | V1 | ...> · **Dernière mise à jour** : YYYY-MM-DD`. Revue systématique à chaque jalon produit scellé (v0.5, V1, V2).

**Conséquences** :
- **6 issues GitHub à ouvrir manuellement** (contenu préparé dans `04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md` §9) : `doc/02-benchmark-v2-positionnement-a-jour` (P0), puis les 5 issues `doc/PITCH-ONEPAGE`, `doc/BUSINESS-CASE`, `doc/ONBOARDING-CEO-PAIR`, `doc/LETTRE-INTRO-CEO-PAIR`, `doc/PITCH-DECK-INVESTISSEUR`. Labels : `lane/docs` + `priority/P1` (sauf benchmark = P0) + `scope/externe` + milestone `V1`.
- Section "Livrables externes" ajoutée dans `04_docs/00-README.md`, en creux aujourd'hui, à alimenter au fil de la production.
- Le `10-exec-deck.pptx` actuel reste **interne uniquement** (ExCom ADABU 30/04). Toute adaptation pour l'externe passe par un nouveau fichier (pas de variante confuse du même nom).
- Client et partenaire tech : créer 2 issues GitHub parqueurs avec milestone `V2` et label `status/parked` pour garder la trace de la décision (rouvrir post-V1 et post-V2 respectivement).

**Conditions de revisite** : si une opportunité externe se présente avant T1 2027 (intérêt concret d'un client-test, approche d'un VC qualifié, sollicitation d'un partenaire tech), rouvrir cet ADR pour ajouter le livrable pertinent. Ne pas produire préventivement ce qui peut être obsolète.

---

## Template pour la prochaine décision

```markdown
## YYYY-MM-DD · Titre court

**Contexte** : (en 2-3 lignes)

**Options étudiées** :
- (A) …
- (B) …

**Décision** : …

**Conséquences** : …
```
