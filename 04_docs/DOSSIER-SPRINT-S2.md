---
title: aiCEO v0.5 — Sprint S2 · Cockpit unifié + flux matin/soir + tâches
audience: Équipe v0.5 (2 fullstack + designer + PMO + CEO pilote)
version: v1.0 — kickoff
date: 2026-04-25
sprint: S2 (semaine 19-22 / lundi 19/05 → lundi 01/06)
durée: 2 semaines (10 j ouvrés)
budget: ≈ 22,1 k€ (20 % de l'enveloppe v0.5)
status: ready-to-fire — kickoff lundi 19/05 09:00
parent: DOSSIER-GO-NOGO-V05.md (decision ExCom du 04/05)
---

# Sprint S2 — Cockpit unifié + flux matin/soir + tâches

## 0 · Synthèse exécutive

**Objet du sprint** : migrer 4 pages de l'app-web Twisty (`localStorage`) vers les endpoints API SQLite livrés en S1, et stabiliser les flux matin (arbitrage) et soir (evening) sur backend.

**Périmètre élargi** : par rapport au DOSSIER GO/NO-GO d'origine (3 pages : cockpit + arbitrage + evening), S2 absorbe **`taches.html`** initialement prévue en S3. Justification : S1 livré en avance par le CEO en dogfood (backend stable, tag `v0.5-s1` posé le 25/04), libérant ~2 jours de marge équipe.

**Livrable attendu fin de sprint** : 4 pages cibles fonctionnelles à `http://localhost:3001/`, zéro `localStorage` applicatif sur ces pages, flux matin/soir stables 3 jours consécutifs, CRUD tâches complet sur API.

**Décalage S3 induit** : S3 devient *agenda + revues* uniquement (au lieu de *tâches + agenda + revues*) — gain net pour absorber l'effort `assistant.html` chat live de S4 si le spike WebSocket (sprint 2 hors plan) est concluant.

> **Lecture rapide** : §1 périmètre · §2 critères de fin · §3 issues à ouvrir · §4 planning daily · §5 risques · §6 budget · §7 dépendances S3.

---

## 1 · Périmètre S2 — 4 pages migrées

### 1.1 — `index.html` (cockpit unifié)

**Aujourd'hui** : page Twisty cockpit qui lit `AICEO.STATE` en `localStorage` et agrège les compteurs côté client.

**Cible S2** :
- Backend : nouvel endpoint `GET /api/cockpit/today` qui renvoie `{ intention, bigRocks[], counters: { tasks: {open, done}, decisions: {open}, mails: {pending} }, alerts[] }`.
- Frontend : `index.html` consomme cet endpoint, supprime tous les accès `AICEO.STATE.*`.
- Drawer source-inspector : lit la même API, affiche la lignée de chaque carte.
- Toast + streak engine : conservés en l'état (UI pure, pas de persistance localStorage requise).

### 1.2 — `arbitrage.html` (flux matin)

**Aujourd'hui** : MVP `index.html` Express qui appelle `/api/arbitrage` (S1) et persiste en JSON files via le wrapper `services/arbitrage.js`.

**Cible S2** :
- Backend : confirmation des endpoints `POST /api/arbitrage/start`, `POST /api/arbitrage/commit`, `GET /api/arbitrage/today`, `GET /api/arbitrage/history`. Persistance en SQLite tables `arbitrage_sessions` et `arbitrage_proposals`.
- Frontend : 3 colonnes (top 3 / déléguer / différer + rejeter) avec drag & drop natif HTML5. Validation finale persiste via `commit`.
- Émission de tâches/délégations en cascade vers `tasks` et `drafts`.
- Bouton « rejouer démo » désactivé en prod (feature flag settings).

### 1.3 — `evening.html` (flux soir)

**Aujourd'hui** : MVP `evening.html` qui agrège la journée et écrit en JSON files.

**Cible S2** :
- Backend : `POST /api/evening/start`, `POST /api/evening/commit`, `GET /api/evening/today`. Persistance table `evening_sessions`.
- Frontend : récap des 3 Big Rocks, humeur (5 emojis), top 3 demain, lien automatique vers session arbitrage du lendemain.
- Streak engine : compteur série jours consécutifs persisté côté backend (table `streaks`).

### 1.4 — `taches.html` (CRUD complet + Eisenhower)

**Aujourd'hui** : page Twisty avec CRUD `localStorage`, matrice Eisenhower 2×2, quick-add.

**Cible S2** :
- Backend : endpoints CRUD `/api/tasks` complets (create, list, get, patch, delete, toggle, defer) — déjà livrés en S1, à brancher.
- Frontend : page consomme l'API, ajoute la matrice Eisenhower 2×2 (urgent/important), conserve le quick-add inline.
- Filtres : par projet, par statut (open/done), par quadrant Eisenhower.

### 1.5 — Hors périmètre S2 (refs explicites)

Reportés à S3 ou S4 :
- `agenda.html` (vue hebdo) → S3.
- `revues.html` (revue hebdo auto-draft) → S3.
- `groupes.html`, `projets.html`, `projet/:id.html` → S4.
- `contacts.html`, `decisions.html` → S4.
- `assistant.html` chat live WebSocket → S4 (avec spike technique en S2 J+5).
- Service Windows + raccourci desktop → S5.

---

## 2 · Critères de fin de sprint (acceptance, 10 conditions)

Le sprint S2 est **scellé** vendredi 30/05 si **les 10 critères** ci-dessous sont verts. Sinon, retro lundi 02/06 et plan de rattrapage en début S3.

| # | Critère | Mesure |
|---|---|---|
| 1 | 4 pages accessibles | `curl http://localhost:3001/{index,arbitrage,evening,taches}.html` → 200 |
| 2 | Zéro `localStorage` applicatif | `grep -r "localStorage\." 03_mvp/public/{index,arbitrage,evening,taches}.html` → 0 (UI prefs tolérées) |
| 3 | Flux matin stable 3j | 3 sessions `/api/arbitrage/start` → `commit` consécutives sans erreur, journalisées |
| 4 | Flux soir stable 3j | 3 bilans evening sur 3 jours consécutifs, top-3-demain reporté en arbitrage J+1 |
| 5 | CRUD tâches via API | toggle, defer, delete fonctionnels, persistés SQLite |
| 6 | Matrice Eisenhower OK | drag tâche entre quadrants → patch `eisenhower` côté backend |
| 7 | Migration `localStorage→SQLite` | script `migrate-from-appweb.js` exécuté avec 0 perte (check-migration.js vert) |
| 8 | Tests e2e Playwright | 3 specs vertes : `arbitrage-happy.spec.ts`, `evening-happy.spec.ts`, `tasks-crud.spec.ts` |
| 9 | Tests unitaires étendus | ≥ 30 tests verts (vs 23 livrés en S1) — `npm test` |
| 10 | CI GitHub Actions verte | lint + unit + e2e + audit dans le workflow main |

---

## 3 · Issues GitHub à ouvrir (10)

À créer via `gh-create-issues.ps1` patché pour le sprint S2. Référence : labels `sprint:s2`, `phase:fusion`, milestone `v0.5-s2`.

| # | Titre | Charge | Owner | Bloquant |
|---|---|---:|---|---|
| S2.01 | Backend `GET /api/cockpit/today` (agrégat intention + Big Rocks + compteurs + alertes) | 1,5 j | Dev1 | — |
| S2.02 | Frontend `index.html` migré sur API + retrait `localStorage` | 2 j | Dev2 | S2.01 |
| S2.03 | Frontend `arbitrage.html` migré sur `/api/arbitrage/*` + drag & drop natif | 3 j | Dev1 | — |
| S2.04 | Frontend `evening.html` migré sur `/api/evening/*` + streak engine backend | 2 j | Dev2 | — |
| S2.05 | Frontend `taches.html` migré sur `/api/tasks/*` + matrice Eisenhower | 3 j | Dev2 | S2.06 |
| S2.06 | Finaliser `migrate-from-appweb.js` (tâches + décisions + contacts) + check-migration | 1,5 j | Dev1 | — |
| S2.07 | Tests Playwright e2e : 3 specs (`arbitrage`, `evening`, `tasks`) | 2 j | Dev1 | S2.03, S2.04, S2.05 |
| S2.08 | Tests unitaires extensions (cockpit aggregator, tasks defer/toggle, evening rollup) | 1 j | Dev2 | — |
| S2.09 | Documentation API à jour (README 03_mvp + curl examples + variables env) | 0,5 j | PMO | — |
| S2.10 | Spike WebSocket (3 j) — preuve de concept chat live (préparation S4 `assistant.html`) | 3 j | Dev1 | — |

**Total charge planifiée** : 19,5 j-dev × 2 dev sur 10 j ouvrés = ≈ 0,98 j-dev/j → léger overcommit acceptable (cible utilisation 90 %).

> Les charges sont en **j-dev** (un développeur, une journée). Le total dépasse la capacité brute (20 j-dev) de 0,5 j car la charge inclut le spike WebSocket S2.10 traité comme parking lot et donc compressible en cas de retard.

---

## 4 · Planning daily

### 4.1 — Daily standup

- **Quand** : lundi-vendredi 09:00, 15 min strict (chrono).
- **Format** : tour de table 3 questions (hier / aujourd'hui / blocage), pas de débat technique en daily.
- **Canal** : Teams / Slack en visio si distribué.
- **Animation** : PMO (Major Fey ou son binôme) tient le minutage.

### 4.2 — Cadence sprint (2 semaines)

| Jour | Activité clé |
|---|---|
| Lun 19/05 | Kickoff (45 min) + ouverture des 10 issues + setup branche `release/v0.5-s2` |
| Mar 20/05 | S2.01 + S2.03 démarrent. PMO ouvre milestone GitHub. |
| Mer 21/05 | S2.06 démarre (migration). Mid-week point synchro 14:00 (15 min). |
| Jeu 22/05 | S2.02 démarre (dépend S2.01). Spike S2.10 démarre en parallèle. |
| Ven 23/05 | Demo intermédiaire 16:00 — état cockpit + arbitrage. Retro mini (10 min). |
| Lun 26/05 | S2.04 + S2.05 démarrent. |
| Mar 27/05 | S2.07 démarre (tests e2e). |
| Mer 28/05 | Mid-sprint check ExCom (Major Fey, 15 min) — alerte si dérive ≥ 1 j cumulée. |
| Jeu 29/05 | S2.08 + S2.09. Stabilisation. |
| Ven 30/05 | **Demo finale 16:00** + **retro 30 min** + ouverture milestone S3. |
| Lun 02/06 | Tag `v0.5-s2` si critères §2 verts, sinon plan de rattrapage. |

### 4.3 — Demo de fin de sprint (vendredi 30/05)

- Démo en live sur localhost:3001 par Dev1 ou Dev2 (15 min).
- Parcours : cockpit du jour → arbitrage matin (1 décision réelle) → tâches (toggle + Eisenhower) → evening (humeur + top-3-demain).
- Public : équipe complète + Major Fey + 1 invité ExCom (DAF ou DSI).
- Output : entrée Journal `11-roadmap-map.html` + commit du tag si vert.

---

## 5 · Risques top 5 et mitigation

### 5.1 — Densification due à `taches.html` absorbé (P1)

**Risque** : la 4ᵉ page ajoute 3 j-dev de charge. Si le drag & drop arbitrage prend plus longtemps que prévu, S2.05 dérape.

**Mitigation** :
- **Plan B mid-sprint** : si dérive ≥ 1 j cumulée vendredi 23/05, S2.05 (`taches.html`) re-décalé en S3. Annoncé dans le mid-sprint check ExCom mercredi 28/05.
- Le périmètre original (3 pages) reste atteignable comme garde-fou.

### 5.2 — Drag & drop arbitrage en JS natif (P1)

**Risque** : le composant 3 colonnes avec drag-drop est aujourd'hui fait avec une librairie tierce dans Twisty. Pour le MVP zero-dep, on doit ré-implémenter en HTML5 Drag and Drop API native.

**Mitigation** :
- Spike rapide jeudi 21/05 matin (2h) : valider que l'API native couvre nos besoins (drop zones, ghost element, touch fallback).
- Plan B : utiliser `SortableJS` (vendoré dans `public/assets/lib/` — 7 ko gzip), single dep, vendoré pour rester offline-first.
- Critère bascule : si spike révèle plus de 4h supplémentaires, on prend `SortableJS` sans débat.

### 5.3 — Divergence shapes app-web ↔ MVP (P1)

**Risque** : la migration `localStorage → SQLite` pourrait perdre des champs sur `tasks` (ex : `eisenhower`, `effort`, `delegated_to_id`) si le mapping n'est pas exhaustif.

**Mitigation** :
- `check-migration.js` (livré en S1) compare les checksums avant/après. Doit être exécuté avant **et** après chaque exécution `migrate-from-appweb.js`.
- Test fixture : un dump `localStorage` réel de Major Fey est versionné dans `03_mvp/test/fixtures/aiceo-state-2026-04-25.json` pour rejeu.

### 5.4 — Streak engine côté backend (P2)

**Risque** : la migration du streak engine (compteur jours consécutifs matin/soir) en backend nécessite une définition précise du "fait" (matin = arbitrage commit ; soir = evening commit). Si la définition glisse, dette technique.

**Mitigation** :
- ADR rédigé jour 1 du sprint par PMO : `2026-05-19 · Streak engine — définition métier des "jours actifs"`.
- Tests unitaires couvrent les cas : journée vide, samedi/dimanche, vacances déclarées (settings).

### 5.5 — Spike WebSocket parallèle qui consomme de la capacité (P2)

**Risque** : S2.10 (spike chat live pour S4) est inscrit dans le sprint mais n'est pas critique. S'il déborde, il vampirise S2.07 (tests).

**Mitigation** :
- Time-box strict 3 j sur S2.10. Si pas concluant à J+5, on parque le résultat partiel et S2.10 ferme.
- Le spike est nominalement assigné au dev "léger" pour ne pas saturer le critique.

---

## 6 · Budget S2

### 6.1 — Ventilation

| Poste | Hypothèse | Montant | % |
|---|---|---:|---:|
| Dev fullstack 2 ETP | 2 sem × 2 × 900 €/j × 4,5 j | 16,2 k€ | 73,3 % |
| Designer DS 0,3 ETP | 2 sem × 0,3 × 900 €/j × 4,5 j | 2,4 k€ | 11,0 % |
| PMO 0,3 ETP | 2 sem × 0,3 × 900 €/j × 4,5 j | 2,4 k€ | 11,0 % |
| **Sous-total équipe** | | **21,1 k€** | **95,3 %** |
| LLM Claude (estim. mois) | usage normal | 0,03 k€ | 0,1 % |
| Provision risque (5 %) | | 1,0 k€ | 4,6 % |
| **Total S2** | | **≈ 22,1 k€** | **100 %** |

### 6.2 — Cumul v0.5

| Sprint | Coût | Cumul | % v0.5 |
|---|---:|---:|---:|
| S1 (livré 25/04, dogfood CEO) | 0 k€ | 0 k€ | 0 % |
| **S2 (en cours)** | **22,1 k€** | **22,1 k€** | **20 %** |
| S3 prévu | 22,1 k€ | 44,2 k€ | 40 % |
| S4 prévu | 22,1 k€ | 66,3 k€ | 60 % |
| S5 prévu | 11,0 k€ | 77,3 k€ | 70 % |
| S6 prévu | 11,0 k€ | 88,3 k€ | 80 % |
| Provisions + LLM + infra | 21,7 k€ | 110 k€ | 100 % |

> S1 livré sans coût équipe (dogfood CEO solo). Mécaniquement, S2 démarre avec ~22 k€ de marge sur l'enveloppe v0.5 — utilisable en provision risque ou capacité supplémentaire S4.

---

## 7 · Dépendances S3 et amorce

### 7.1 — Ce que S3 hérite

S3 (02/06 → 15/06) reçoit en entrée :
- API tasks/decisions/contacts/projects/groups stable (S1) + cockpit/arbitrage/evening migrés (S2).
- Spike WebSocket clos (positif → archi `assistant.html` actée ; négatif → fallback polling AJAX décidé).
- Migration `localStorage → SQLite` complète sur 4 pages.

### 7.2 — Périmètre S3 ajusté

Initialement *tâches + agenda + revues*, S3 devient :
- `agenda.html` (vue hebdo lun-dim, sur `/api/calendar`).
- `revues.html` (revue hebdo, sur `/api/revues`).
- Stabilisation tests e2e (élargir à 5 specs).
- **Capacité libérée par retrait `taches.html`** : ~2 j-dev → réinvestis dans démarrage anticipé `groupes.html` (normalement S4).

### 7.3 — Amorce S4

Si spike WebSocket S2.10 positif :
- ADR `2026-05-30 · Chat live — WebSocket retenu` rédigé en fin S2.
- S4 démarre avec une archi WebSocket pré-validée (gain ~2 j sur `assistant.html`).

Si spike négatif :
- Bascule polling AJAX (250 ms ou push après chaque message) actée en S2 retro.
- S4 démarre sans dette technique sur ce point, en mode dégradé fonctionnel mais simple.

---

## 8 · Annexes

### A — Documents de référence

| Doc | Branche | Rôle |
|---|---|---|
| `04_docs/DOSSIER-GO-NOGO-V05.md` | `main` | Décision GO ExCom + cadrage v0.5 110 k€ |
| `04_docs/SPEC-TECHNIQUE-FUSION.md` §6, §13 | `main` | API REST + sprints |
| `04_docs/SPEC-FONCTIONNELLE-FUSION.md` | `main` | Parcours utilisateur |
| `03_mvp/docs/SPRINT-S1-RECETTE.md` | `main` | Recette S1 (référence pour étendre les tests S2) |
| `04_docs/POA-SPRINT-S2.xlsx` | `main` (à committer) | Issues S2 + budget + checklist acceptance |
| `04_docs/KICKOFF-S2.pptx` | `main` (à committer) | Deck kickoff lundi 19/05 |
| `04_docs/11-roadmap-map.html` | `main` | Roadmap interactive (à actualiser : Phase 1 → done, Phase 2 → doing) |

### B — Ouverture du sprint (commandes)

```powershell
# Branche du sprint
git checkout main
git pull origin main
git checkout -b release/v0.5-s2
git push -u origin release/v0.5-s2

# Création des 10 issues GitHub
cd 04_docs
.\gh-create-issues-s2.ps1   # à dériver de gh-create-issues.ps1
```

### C — Glossaire S2

- **Cockpit unifié** : page `index.html` qui agrège intention + Big Rocks + compteurs sans `localStorage`.
- **Spike technique** : exploration time-boxée pour valider une hypothèse (ici : WebSocket pour chat live S4).
- **Eisenhower** : matrice 2×2 urgent/important pour prioriser tâches.
- **Streak engine** : moteur de comptage jours consécutifs matin (arbitrage) et soir (evening).

### D — Changelog

- **v1.0 — 2026-04-25** — Première version pour kickoff sprint S2 lundi 19/05.

---

*Document interne équipe v0.5. Référence DOSSIER-GO-NOGO-V05.md pour le cadrage stratégique. À mettre à jour au fil du sprint si dérive ou plan B activé.*
