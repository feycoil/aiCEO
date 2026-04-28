# Changelog

Toutes les évolutions notables du produit aiCEO. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

Versionnage : les jalons correspondent à des tags Git (`v0.4`, `v0.5`…).

---

## [Non publié]

### Insertion v0.6 — Interface finalisée entre v0.5 et V1 — 2026-04-26

**Décision majeure CEO** : insérer une phase **v0.6 "Interface finalisée"** entre v0.5 livré (26/04) et V1 (T3 2026), dédiée exclusivement à la refonte UI selon le bundle Claude Design v3.1, sur scope fonctionnel v0.5 préservé (pas de feature nouvelle).

**Pourquoi un palier dédié** : éviter de diluer les sprints V1 (multi-tenant + équipes + intégrations + mobile + backup + logs, ~46 k€/6 mois) avec une refonte UI majeure. v0.6 valide la direction visuelle par dogfood Feycoil 1-2 mois avant V1, et permet à l'équipe binôme V1 de coder multi-tenant sur des fondations DS stables.

**Périmètre v0.6** (UI uniquement) :
- DS atomic 3 niveaux (primitive / semantic / component) + ITCSS + BEM
- 16 composants UI catalogués
- 13 pages refondues selon maquette
- Microcopy FR unifié
- WCAG AA cockpit + audit a11y externe (~3 k€)
- Patterns coaching v0.6 légers (time-of-day, friction positive, recovery streak break, posture footer)
- Onboarding wizard simple (5 étapes, désactivé Feycoil, activable CEO pair)
- Settings page basique (4 sections, sans multi-tenant)
- Components gallery mini-storybook
- Drawer collapsible 240↔60 px persistance localStorage
- Iconographie Lucide stroke 1.5 unifiée (30 icônes)
- Charts SVG inline (6 patterns autorisés)
- Source-link pattern unifié + auto-save dirty state
- Streaming SSE assistant raffiné

**Hors scope v0.6** (réservé V1+) : multi-tenant, équipes, intégrations Teams/Notion/Slack, mobile/PWA, backup chiffré, logs Langfuse, i18n EN, RTL, coach Opus, mirror moments, score santé, offline-first.

**Modèle d'équipe** : binôme Feycoil + Claude étendu (cohérent ADR modèle binôme V1). 0 ETP externe.

**Découpage** : 3 sprints courts (~5 j chrono dogfood chacun) — S6.1 DS+composants+gallery, S6.2 cockpit+rituels+coaching, S6.3 registres+onboarding+settings+a11y+recette+tag.

**Vélocité cible** : ×15-×20 (entre v0.5 ×30 et V1 cible ×10). Réaliste car scope étroit (UI uniquement).

**Budget v0.6** : ~8 k€ absorbés dans provision V1 actuelle (105 k€ disponible) — pas de rallonge budgétaire.

| Poste | Montant |
|---|---|
| LLM Claude API (3 sem × 30 €/jour) | ~600 € |
| Provision imprévus / outils | ~3 k€ |
| Tests utilisateur (1 CEO pair pré-V1) | ~2 k€ |
| Audit accessibilité externe | ~3 k€ |
| **Total v0.6** | **~8 k€** |

**Conséquence trajectoire** : V1 démarre **après v0.6** (au lieu de directement après v0.5). Calendrier V1 (T3 2026 - T1 2027) inchangé, juste précédé d'1 mois de v0.6 (mai 2026).

**ROADMAP v3.1 → v3.2** : version bumpée, palier v0.6 ajouté §3.3, synthèse §13 mise à jour avec 6ᵉ colonne v0.6.

**Total 18 mois** : 110 k€ v0.5 + 8 k€ v0.6 + 46 k€ V1 + 800 k€ V2 + 600 k€ V3 = **~1,47 M€** (vs 1,46 M€ v3.1, +8 k€ v0.6 absorbés).

### Modèle binôme CEO + Claude étendu à V1 — 2026-04-26

**Décision majeure CEO** : tous les rôles techniques V1 (2 fullstack + 1 mobile + 1 AI + 1 designer + 0,5 DevSecOps + 0,3 PMO = 5,6 ETP initialement budgétés) sont assurés par le binôme **Feycoil + Claude**. Recrutement externe annulé.

**Mapping rôles × Claude** documenté dans ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1` :
- Fullstack (×2) → Claude code production-grade (Node + Postgres + vanilla JS)
- Mobile dev → Claude PWA (manifest, service worker, gestures, FAB)
- AI engineer → Claude (architecture prompts, sub-agents, evals)
- Product designer → Claude (bundle v3.1 livré)
- DevSecOps → Claude (chiffrement AES-256, msal-node OAuth, RLS)
- PMO → Claude (sprints, milestones, ADR, planning, retro)
- CEO + dogfood + signature externe → Feycoil

**Budget V1 révisé** : passe de **300 k€ à 46 k€** (économie 254 k€). Détail :
- Dev humain : 0 € (Feycoil non budgété)
- Infra (Supabase Pro + Postgres RLS + Bedrock + Langfuse + monitoring + backup) : ~12 k€
- LLM Claude API (6 mois) : ~5,5 k€
- Apple Developer + Google Play : ~150 €
- Audit sécurité externe pen-testing fin V1 : ~15 k€
- Onboarding 1er CEO pair : ~3 k€
- Provision imprévus / outils SaaS : ~10 k€

**Réallocation 254 k€** : option β (anticipation V2) — marketing initial 80 k€ + recrutement 1 success/sales junior à mi-V1 (mois 4) 40 k€ + provision SOC 2 anticipée 50 k€ + trésorerie restante 85 k€.

**Vélocité cible V1 = x10** (vs x30 validée sur v0.5). Suffisant pour 6 thèmes ~300 k€ valeur travail externalisée équivalent en 6 mois.

**Limites reconnues** + mitigation détaillée :
- Dépendance unique Feycoil → CEO pair suppléant Lamiae à former mois 1
- Pas de tests utilisateur externes pendant développement → onboarder 1er CEO pair francophone à mi-V1
- Pas de pen-testing externe → audit prestataire en sortie V1 (~15 k€)
- Pas de signature contrat Apple/Google/SOC 2 → Feycoil reste responsable légal
- Biais auto-évaluation Claude designant lui-même → externalisation review au moins 1× par milestone

**Plan résilience binôme** : documentation continue (`00_BOUSSOLE/` + `04_docs/`), push Git après chaque session, CEO pair suppléant Lamiae, détection burnout Feycoil via boucle du soir, backup conversation Claude.

**Critères go/no-go en cours V1** : 3 mois (3/6 thèmes livrés + 1er CEO pair engagé + vélocité ≥ x5), 6 mois (tag v1 + ≥ 2 CEO pairs onboardés + adoption mobile + audit sécurité 0 finding critique).

**ROADMAP v3.0 → v3.1** : version bumpée, équipe binôme actée dans §4 V1, budget révisé dans §13 synthèse.

**Conséquence trajectoire 18 mois** : budget total **1,71 M€ → 1,46 M€** (économie 254 k€ V1 réallouée en V2 anticipation et trésorerie).

### Bundle design Claude Design v3.1 + réalignement ROADMAP v3.0 — 2026-04-26

**Bundle design produit complet livré** dans `04_docs/_design-v05-claude/` :

- 16 ressources (image étalon Twisty + tokens DS + 14 fichiers markdown spécialisés : composants UI, datasets, patterns techniques, tenant démo, coaching, responsive, i18n, architecture atomique, microcopy/principes/impact, cadrage par version)
- Prompt v3.1 unique (~16k chars, 18 sections) à coller dans Claude Design pour générer ~62 vues hi-fi clickables
- 6 ADR de gouvernance design : analyse visuelle réf Twisty, arbitrages tranchés, critique 24 manques, stratégie finale, audit roadmap, cadrage v3.1
- 3 backups prompt (v1, v2, v3) traçant l'évolution

**Audit conformité ROADMAP** (`decisions/06-audit-roadmap-vs-bundle.md`) : 75 % features `[v0.5]`, 10 % `[V1]`, 10 % `[V2]`, 5 % `[V3]`. Posture maquette = vision produit complète multi-audience (équipe dev / board / Feycoil dogfood).

**ADR `2026-04-26 · Bundle design Claude Design v3.1 — cible visuelle V1 + re-mapping cadrage par version`** acte 4 points :
1. Bundle reconnu comme cible visuelle V1 (pas V2/V3 comme initialement supposé)
2. Re-mapping : multi-tenant, équipes, intégrations, mobile (ex-V2/V3) → V1 ; i18n → V2 ; coach Opus + offline → V3
3. i18n positionnée en V2 (architecture préparée V1, activation V2 commercial international)
4. Communication tri-audience documentée

**ROADMAP `04_docs/08-roadmap.md` v2.0 → v3.0** : V1 redéfinie (300 k€/6 mois/6 thèmes au lieu de 290 k€/16 sem/proactif uniquement), V2 redéfinie (commercial international + i18n + SOC 2 + canvas IA, ancien V2 multi-tenant absorbé en V1), V3 stable (coach + offline + multi-CEO écosystème, mobile absorbé en V1). Synthèse §13 mise à jour avec colonnes alignées sur la nouvelle trajectoire.

**ROADMAP `00_BOUSSOLE/ROADMAP.md`** : tableau d'état mis à jour avec v0.5 livré + bundle design + nouveaux périmètres V1/V2/V3.

**Conséquences** :
- Aucun rétro-pédalage nécessaire sur le bundle design v3.1 — il représente le produit V1 cible
- ExCom 04/05 a maintenant un bundle visuel complet à présenter pour décider GO V1
- Multi-tenant en V1 = absorption pression Microsoft Copilot CEO 2027
- Mobile en V1 = friction réduite onboarding CEO pair
- Équipes en V1 = adoption ETIC accélérée (pas attendre V2)
- i18n en V2 = focus dogfood + 2-3 CEO pairs francophones d'abord, ouverture EN après stabilisation

### v0.5 internalisée terminée — 2026-04-26 (séparé)

Phase v0.5 close avec scellement formel : 5 sprints livrés en ~16h chrono dogfood, vélocité x30 vs plan ETP, 110 k€/110 k€ budget consommé, 41 issues closes, 5 tags GitHub, ~95 tests verts, 12 pages frontend, 27 ADRs au total. Recette ExCom prête (cf. `RECETTE-EXCOM-v0.5.md`). Voir ADR `2026-04-26 · v0.5 internalisée terminée`.

Ouverture V1 : 6 thèmes prioritaires ~300 k€ sur 6 mois (multi-tenant, équipes, intégrations Teams/Notion/Slack, mobile compagnon, backup auto, logs structurés). GO V1 immédiat recommandé suite à pression marché Microsoft Copilot CEO 2027.

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