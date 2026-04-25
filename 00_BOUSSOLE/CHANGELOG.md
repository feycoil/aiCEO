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

### Sprint S3 — kickoff cadré 2026-04-25 (démarrage 02/06/2026)

4 piliers, 11 issues (S3.00 → S3.10), 11,1 j-dev sur 20 j de capacité (45 % de marge). Pages migrées API SQLite : `agenda.html` (S3.01) + `revues/index.html` (S3.02). Câblage SSE front (S3.05, exploite le bus livré en S2.10). Autosync Outlook 2 h via `schtasks` (S3.06). Spike Service Windows POC time-boxé 1,5 j strict avec critère stop net (S3.10). Demos 06/06 puis 13/06, tag cible `v0.5-s3` le 16/06. Cumul tâches v0.5 : **60 %** post-S3. Voir `DECISIONS.md` 2026-04-25 + `04_docs/_sprint-s3/DOSSIER-S3.md` + `04_docs/_sprint-s3/POA-S3.xlsx` + `04_docs/_sprint-s3/KICKOFF-S3.pptx`.

### Sprint S2 — v0.5-s2 livré 2026-04-25 (release/v0.5-s2 → main, tag v0.5-s2 pending)

**Sprint clos en avance** (cible 01/06, livré 25/04 — schedule variance −37 j) : 10/10 issues fermées, 11 commits (`accea60` → `6f4e6e8`), **55/55 tests verts** (49 S1 + 6 S2 nouveaux), zéro régression v0.4. PR `release/v0.5-s2` prête, voir `.github/PR-S2.md`.

- **Cockpit live** : `GET /api/cockpit/today` agrège tâches + décisions + events + intention de semaine + alertes (overdue, stale, big rocks manquants). Zéro `localStorage` applicatif (ADR S2.00).
- **Rituels matin/soir** : `POST /api/arbitrage/start|commit` (top 3 P0/P1 → faire, ai_capable → déléguer, reste → reporter), `POST /api/evening/start|commit` (humeur ∈ {bien, moyen, mauvais}, énergie ∈ [1,5], top 3 demain) avec **streak persistant** dans `settings.evening.longest_streak`.
- **Modèles métier élargis** : tables `projects`, `groups`, `contacts` + CRUD complet, recherche globale `GET /api/search?q=…` (full-text léger sur tasks/decisions/contacts/projects), `PATCH /api/tasks/:id` accepte `eisenhower` ∈ {UI, UnI, nUI, nUnI, --} avec filtre `?eisenhower=…`.
- **IA décisionnelle** : `POST /api/decisions/:id/recommend` — recommandation Claude argumentée, fallback offline si pas de clé.
- **Documentation API** : `docs/API.md` 487 lignes / 15 sections / **38 exemples curl** + smoke-test 1 commande, README mis à jour v0.5.
- **Spike SSE** (S2.10, time-boxé 3 j → livré 1,5 j) : `docs/SPIKE-WEBSOCKET.md` (ADR SSE retenu vs WS — mono-user, mono-directionnel, zéro dépendance, `EventSource` natif), `src/realtime.js` (bus EventEmitter), `GET /api/cockpit/stream` (SSE + heartbeat 25 s). Câblage front différé S3.05.
- **Tests e2e** (3 parcours matin / journée / soir) en HTTP boundary tests dans `tests/e2e.test.js` ; Playwright différé S3+ (Chromium infaisable en sandbox). Isolation par `AICEO_DB_OVERRIDE` + nettoyage WAL/SHM systématique.
- **ADRs livrés** : S2.00 (zéro localStorage applicatif, source de vérité = SQLite serveur) + S2.10 (SSE plutôt que WebSocket).
- **Time-box** : gain 1,5 j sur S2.10 redéployé sur S2.07 (3 parcours e2e) malgré contrainte sandbox.

Tag `v0.5-s2` à appliquer post-merge : `git tag -a v0.5-s2 -m "Sprint S2 — cockpit live + rituels + SSE" && git push origin v0.5-s2`.

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
- `04_docs/AUDIT-COHERENCE-2026-04-24.md` — audit sa