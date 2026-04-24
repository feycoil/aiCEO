# Changelog

Toutes les évolutions notables du produit aiCEO. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

Versionnage : les jalons correspondent à des tags Git (`v0.4`, `v0.5`…).

---

## [Non publié]

### Atelier de cohérence 2026-04 — clos le 2026-04-24

8 sessions structurées (S1 → S8) pour résoudre les 7 dissonances critiques identifiées dans `04_docs/AUDIT-COHERENCE-2026-04-24.md`. Trace complète : [`04_docs/_atelier-2026-04-coherence/JOURNAL.md`](../04_docs/_atelier-2026-04-coherence/JOURNAL.md).

**8 ADRs produites par l'atelier** dans `00_BOUSSOLE/DECISIONS.md` : trajectoire produit local→cloud + continuité (S1), typographie Fira Sans canonique (S2), hiérarchie sources canoniques + règle drafts 4 sem (S3, 2 ADRs), timing 10 sem / budget 110 k€ / équipe 2,6 ETP v0.5 (S4), livrables externes cadrage (S5), livrables dev onboarding+OpenAPI+runbook (S6), pipeline tokens DS → CSS + maintien unifié (S7). S8 est une session de clôture sans nouvel ADR. À noter : 4 autres ADRs datées 2026-04-24 (fusion app-web ↔ MVP, backlog xlsx → GitHub Issues, restructuration aiCEO/, GitHub perso privé) sont des décisions **pré-atelier** prises le même jour mais en amont de l'ouverture atelier — total DECISIONS.md au 24/04 = **12 ADRs**.

**~45 livrables produits** : 8 docs patchés (01-vision, 02-benchmark, 06-architecture, 07-design-system, 08-roadmap, 00-README, SPEC-TECHNIQUE-FUSION, SPEC-FONCTIONNELLE-FUSION), 8 nouveaux docs (READMEs dossiers orphelins, ONBOARDING-DEV, RUNBOOK-OPS, session files atelier), pipeline technique DS (tokens.json + scripts/export.js + package.json + marqueurs GENERATED dans colors_and_type.css), refonte GOUVERNANCE.md (chemin type tokens 7 étapes, règle maintien unifié, calendrier trimestriel figé Q2 2026 → Q1 2027).

**Coûts cachés résolus** : 4 durées v0.5 conflictuelles (6/7/9/10 sem) → 10 sem partout ; 3 silos indépendants Claude Design ↔ Cowork ↔ GitHub sans chemin type → 7 étapes documentées, ~1 h coordination → ~15 min ; trois règles "maintien continu + audit trimestriel" déposées par S3+S6+S7 → mutualisées une seule fois dans GOUVERNANCE.md.

**Post-atelier — validations et actions manuelles CEO** : check-list mécanique dans [`04_docs/_atelier-2026-04-coherence/POST-ATELIER-ACTIONS.md`](../04_docs/_atelier-2026-04-coherence/POST-ATELIER-ACTIONS.md) (issues GitHub à ouvrir, calendrier agenda trimestriel, premier run `npm run ds:export`, sprint production livrables externes 05/05-11/05, sprint production openapi.yaml 12/05-18/05).

**Dossier atelier conservé in-place** comme trace vivante (pas d'archivage physique maintenant ; reconsidérer 3 mois si consultation tombe à 0).

### Ajouté
- **Décision majeure** : fusion app-web ↔ MVP en produit unifié (MVP absorbe app-web, SQLite remplace localStorage + JSON). Voir `DECISIONS.md` 2026-04-24.
- Spec fonctionnelle fusion : `04_docs/SPEC-FONCTIONNELLE-FUSION.md` (vision, 21→13 pages, user flows matin/soir/hebdo, critères MVP, horizon V1-V3)
- Spec technique fusion : `04_docs/SPEC-TECHNIQUE-FUSION.md` (architecture, stack, schéma SQLite complet, API REST, intégration Outlook, déploiement Service Windows, plan migration one-shot)
- Projet Claude Design `aiCEO_mvp_v1` (vierge) créé pour maquettage UI de la version unifiée
- Archivage de `00_BOUSSOLE/INIT-GITHUB.md` (recette migration exécutée le 24/04) → `_archive/2026-04-init-github/`
- Archivage de `04_docs/PLAN-GOUVERNANCE.md` (proposition v0.1 exécutée) → `_archive/2026-04-plan-gouvernance-v0.1/`

### Ajouté (suite)
- Dossier `02_design-system/` vérifié **présent et complet dans le repo** (audit initial erroné — le dossier existait déjà avec tokens, fonts, preview, ui_kits)
- `02_design-system/REPO-CONTEXT.md` — note de contexte repo : origine, dernière resync, écart Inter/Fira Sans documenté, procédure de resync PowerShell
- `04_docs/AUDIT-COHERENCE-2026-04-24.md` — audit sans concession sur 4 axes (fond/forme/complétude/consistance), 7 dissonances critiques identifiées, plan d'action 4 semaines P0→P2

### Modifié
- **Refonte `04_docs/08-roadmap.md` v2.0** : MVP remis en "livré v0.4", ajout du palier v0.5 (fusion) comme jalon en cours, backlog pointe GitHub Issues, RICE mis à jour avec états (✅ / 🔜 / 📋 / 🔬), budgets réalignés sur la réalité (v0.4 ≈ 1,5 ct/jour).
- **Refonte `04_docs/06-architecture.md` v2.0** : §1 décrit le stack **réellement déployé** (Node + Express + vanilla JS + JSON + PowerShell COM + Anthropic SDK direct) au lieu du stack cible V1+. §2 détaille le delta fusion v0.5 (better-sqlite3 + Zod + Pino + Vitest + Playwright + Service Windows). §3-5 maintiennent la trajectoire V1-V3 avec transitions explicites.
- **Refonte `00_BOUSSOLE/ROADMAP.md`** : tableau d'état aligné sur 4 milestones GitHub, jalons par milestone, pointeurs vers SPEC-FUSION, règle de mise à jour hebdo.

### En cours
- Migration Inter → Fira Sans dans `02_design-system/assets/app.css` + `product.app.css` (planifiée en sprint DS dédié — à ouvrir comme Issue GitHub)

---

## [0.4] — 2026-04-24

### Ajouté
- MVP : support proxy corp `HTTPS_PROXY` + `NODE_EXTRA_CA_CERTS` (factory Anthropic)
- MVP : contexte email injecté dans le prompt d'arbitrage (digest global + signaux par tâche)
- Chip coral sur cartes sous pression (≥ 2 relances ou ≥ 3 non lus)

### Modifié
- Prompt arbitrage : REPORTER sans plafond (toutes les tâches hors FAIRE/DÉLÉGUER y vont, 0 perdue)
- Prompt délégation : ton plus clair, placeholders remplacés

### Validé
- Run réel 28/28 tâches classées en 41 s
- 5,2 k tokens in / 2,5 k out · ≈ 1 ct / arbitrage · budget quotidien ≈ 1,5 ct
- Import Outlook : 926 mails utiles sur 3 comptes (30 jours)

### Added
- Migration backlog xlsx vers GitHub Issues : 78 issues, 4 milestones, 29 labels
- Script `setup-github-issues.ps1` pour reproductibilité
- Épic transverse "Infrastructure & DX" pour chantiers sans feature parent

### Changed
- Backlog source de vérité : `04_docs/09-backlog.xlsx` → GitHub Issues `feycoil/aiCEO`

### Archived
- `04_docs/09-backlog.xlsx` + CSVs → `_archive/2026-04-backlog-initial/`
- `_drafts/BACKLOG_*.md` → `_archive/2026-04-backlog-initial/`
- `_scratch/setup-github-issues.ps1` → `_archive/2026-04-backlog-initial/`

---

## [0.3] — 2026-04-20

### Ajouté
- Boucle du soir : `public/evening.html`, endpoints `/api/evening/*`
- Flux délégation : brouillon mail généré par Claude, mailto: Outlook, archive locale
- Import Outlook 30 jours via PowerShell COM + normalisation JS

---

## [0.2] — 2026-04-15

### Ajouté
- Drag & drop entre colonnes FAIRE / DÉLÉGUER / REPORTER
- Validation d'arbitrage persistée dans `data/decisions.json`

---

## [0.1] — 2026-04-11

### Ajouté
- Scaffold Express port 4747
- Endpoint `/api/arbitrage` avec prompt système + wrapper SDK Anthropic
- UI 3 colonnes + mode démo fallback (sans clé API)
