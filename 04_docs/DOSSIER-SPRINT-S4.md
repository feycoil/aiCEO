# DOSSIER SPRINT S4 — Pages portefeuille + Assistant chat live + Polish service

**Sprint** : `v0.5-s4` · **Période** : 16/06 → 27/06/2026 (cible cal initial) ou démarrable immédiatement (gain -49 j de S3)
**Charge** : 10,2 j-dev / 20 j capacité = **49 % marge** (dailys + retro + démos)
**Démo intermédiaire** : J5 (assistant chat live + groupes/projets)
**Démo finale** : J10 (6 pages migrées + e2e vert)
**Tag cible** : `v0.5-s4` post-merge

---

## 0 · Synthèse exécutive

Sprint S4 du plan v0.5. Trois piliers :

1. **Migration des 5 pages back-office** vers l'API SQLite : `groupes.html` · `projets.html` · `projet/:id.html` (template commun pour 10 pages projet) · `contacts.html` · `decisions.html`. Toutes les routes API existent déjà depuis S1 (`/api/groups`, `/api/projects`, `/api/contacts`, `/api/decisions`) — S4 les **consomme**, ne crée rien côté backend.
2. **Assistant chat live IA** : nouvelle table `assistant_conversations` + `assistant_messages`, route `POST /api/assistant/messages` avec **streaming Claude via SSE** (réutilise le bus S2.10/S3.05). Frontend `assistant.html` migré avec scroll auto et reconnexion exponentielle.
3. **Polish service Windows** : raccourci desktop "Cockpit aiCEO" pour lancer le navigateur sur `http://localhost:4747`, rotation logs `data/aiCEO-server.log` (>10 Mo → archive), doc install/update consolidée.

Le sprint **achève la migration UI v0.5** : toutes les pages legacy `01_app-web/` sont remplacées par leurs équivalents API-driven dans `03_mvp/public/`. Reste à S5 le durcissement (CI GitHub Actions + Playwright e2e Linux + monitoring).

**Décalage S5 induit** : aucun. S5 reste sur durcissement + tag `v0.5` + handoff CEO pair (hors périmètre dev).

> **Lecture rapide** : §1 périmètre · §2 critères de fin · §3 12 issues à ouvrir · §4 planning daily · §5 risques · §6 budget · §7 dépendances S5.

---

## 1 · Périmètre S4 — 6 pages migrées + chat live + polish

### 1.1 — `assistant.html` (chat IA live)

- Page existante côté `01_app-web/assistant.html` (162 lignes, copilote IA en mode "fake reply").
- **Cible S4** : chat live réel, streaming Claude via SSE.
- Backend nouveau (S4.01) :
  - Table `assistant_conversations(id, title, created_at, updated_at)`
  - Table `assistant_messages(id, conversation_id, role, content, ts, model, tokens_in, tokens_out)`
  - Route `POST /api/assistant/messages` : crée message user, appelle Claude streaming, append message assistant, push chunks SSE
  - Route `GET /api/assistant/conversations` : liste 20 dernières
  - Route `GET /api/assistant/conversations/:id` : full thread
- Frontend (S4.02) :
  - Scroll auto en bas sur nouveau message
  - Streaming progressive (chunks SSE)
  - Reconnexion exponentielle si SSE coupé (pattern S3.05 réutilisé)
  - Indicateur "Claude réfléchit…" (cursor animé)
  - History 20 conversations dans sidebar gauche

### 1.2 — `groupes.html` (vue portefeuille 3 groupes)

- Source : `01_app-web/groupes.html` (124 lignes).
- **Cible S4** : page migrée API consommant `GET /api/groups` (qui retourne déjà `counts.projects_total`).
- Cards 3 groupes (ETIC Services / Groupe AMANI / MHSSN Holding) avec icône, tagline, projets cumulés, tâches ouvertes.

### 1.3 — `projets.html` (liste cross-groupe)

- Source : `01_app-web/projets.html` (84 lignes).
- **Cible S4** : `GET /api/projects` retourne déjà tous les projets avec `counts.tasks_open` + `counts.decisions_open`. Filtre dropdown par groupe.

### 1.4 — `projet/:id.html` (template commun pour 10 pages projet)

- Sources : 10 fichiers `01_app-web/projets/*.html` (~550 bytes chacun, juste des thin shells qui chargent un template via JS).
- **Cible S4** : 1 seul template `03_mvp/public/projet.html` paramétré via `?id=amani-chantier` (querystring). Charge `GET /api/projects/:id` + tasks/decisions/events liés.
- Bénéfice maintenance : 10 pages → 1 fichier.

### 1.5 — `contacts.html` (cartes + recherche + filtres)

- Source : `01_app-web/contacts.html` (158 lignes).
- **Cible S4** : `GET /api/contacts` (route S1, support `?q=` full-text léger). Filtres trust_level + recherche live.

### 1.6 — `decisions.html` (registre + IA recommend)

- Source : `01_app-web/decisions.html` (151 lignes).
- **Cible S4** : `GET /api/decisions` + `POST /api/decisions/:id/recommend` (Claude, livré S2). Statuts ouverte/décidée, pill IA si recommend disponible.

### 1.7 — Polish service Windows + raccourci desktop

- Raccourci `Cockpit aiCEO.lnk` sur le bureau du CEO pointant vers `http://localhost:4747` (avec icône custom si possible).
- Wrapper `start-aiCEO-at-logon.ps1` enrichi : rotation `data/aiCEO-server.log` si > 10 Mo (move vers `aiCEO-server.log.1`).
- README dans `03_mvp/scripts/service-windows/INSTALL-WINDOWS.md` consolidé : install fresh poste, update existing, désinstall propre.

### 1.8 — Hors périmètre S4 (refs explicites)

- ❌ Service Windows MSI / NSSM / monitoring → S5 (durcissement)
- ❌ Tests Playwright e2e Linux complet → S5 (CI GitHub Actions)
- ❌ Multi-user / scaling WebSocket → V2
- ❌ RAG SharePoint sur l'assistant → V1+

---

## 2 · Critères de fin de sprint (acceptance, 12 conditions)

| # | Critère | Source vérification |
|---|---|---|
| 1 | ADR S4.00 mergée dans `DECISIONS.md` avant J1 | `head -10 00_BOUSSOLE/DECISIONS.md` |
| 2 | `grep -nE "localStorage\.(get\|set\|remove)Item" 03_mvp/public/{assistant,groupes,projets,projet,contacts,decisions}.html` → 0 (sauf `aiCEO.uiPrefs`) | grep |
| 3 | `curl http://localhost:4747/{assistant,groupes,projets,projet?id=...,contacts,decisions}` → 6/6 HTTP 200 | smoke 1-liner |
| 4 | `POST /api/assistant/messages` retourne stream SSE valide avec chunks `text` puis `done` | curl -N |
| 5 | Latence p95 chat first-token < 3 s, full-response < 30 s | mesure manuelle dogfood J3 |
| 6 | Recherche `?q=` sur `/contacts` retourne résultats pertinents en < 200 ms | smoke |
| 7 | Sélecteur groupe sur `/projets` filtre correctement (vérifié par count) | manual |
| 8 | Pages projet `/projet?id=amani-chantier` à `/projet?id=feder` toutes fonctionnelles | smoke loop |
| 9 | Raccourci desktop `Cockpit aiCEO.lnk` ouvre Edge/Chrome sur cockpit | manual |
| 10 | `npm test` ≥ 80 verts (≥ 5 nouveaux : assistant streaming + recommend + …) | npm test |
| 11 | Tests e2e parcours back-office (HTTP-boundary, pattern S3.07) ≥ 4 verts | tests/e2e-backoffice.test.js |
| 12 | `docs/API.md` enrichi de la section S4 (assistant, raccourci, polish) avec exemples curl | wc + grep |

---

## 3 · Issues GitHub à ouvrir (12)

| ID | Titre court | Charge | Owner | Labels (en plus de `sprint/s4` `phase/v0.5-s4`) |
|---|---|---|---|---|
| **S4.00** | ADR Sprint S4 — méthode + zéro localStorage rappelé sur 6 nouvelles pages | 0,3 j | PMO | `lane/mvp` `type/adr` `priority/P0` `owner/pmo` |
| **S4.01** | Backend assistant chat — table conversations + messages + POST streaming SSE | 1,5 j | Dev1 | `lane/mvp` `type/feat` `priority/P0` `owner/dev1` |
| **S4.02** | Frontend `assistant.html` migré API + chat live SSE streaming | 1,5 j | Dev2 | `lane/mvp` `type/feat` `priority/P0` `owner/dev2` |
| **S4.03** | Frontend `groupes.html` migré API (vue portefeuille 3 groupes) | 1,0 j | Dev2 | `lane/mvp` `type/feat` `priority/P1` `owner/dev2` |
| **S4.04** | Frontend `projets.html` migré API (liste cross-groupe + filtre) | 1,0 j | Dev2 | `lane/mvp` `type/feat` `priority/P1` `owner/dev2` |
| **S4.05** | Frontend `projet.html` template commun migré (10 pages → 1) | 1,5 j | Dev2 | `lane/mvp` `type/feat` `priority/P1` `owner/dev2` |
| **S4.06** | Frontend `contacts.html` migré API + recherche + filtres | 1,0 j | Dev2 | `lane/mvp` `type/feat` `priority/P1` `owner/dev2` |
| **S4.07** | Frontend `decisions.html` migré API + IA recommend | 0,8 j | Dev2 | `lane/mvp` `type/feat` `priority/P1` `owner/dev2` |
| **S4.08** | Raccourci desktop "Cockpit aiCEO" + script install | 0,3 j | Dev1 | `lane/mvp` `type/feat` `priority/P2` `owner/dev1` |
| **S4.09** | Polish service Windows — rotation logs + INSTALL-WINDOWS.md consolidé | 0,8 j | Dev1 | `lane/mvp` `type/improve` `priority/P2` `owner/dev1` |
| **S4.10** | Tests e2e parcours back-office + tests unitaires extensions (≥ 80 verts) | 1,0 j | Dev1 | `lane/tests` `type/test` `priority/P0` `owner/dev1` |
| **S4.11** | Documentation API S4 + recette CEO v0.5-s4 préparée | 0,5 j | PMO | `lane/mvp` `type/docs` `priority/P1` `owner/pmo` |

**Total : 10,2 j-dev** sur 20 j capacité (binôme CEO + Claude × 2 semaines) = 49 % marge.

---

## 4 · Planning daily (10 j ouvrés)

| Jour | Date | Activités |
|---|---|---|
| J1 lun | 16/06 | Kickoff matin (deck S4 relu en binôme), S4.00 ADR. Backend démarre S4.01 (table + route streaming), frontend démarre lecture sources `01_app-web/`. |
| J2 mar | 17/06 | S4.01 fin (Claude streaming + tests). S4.02 démarre (assistant.html scroll + SSE). |
| J3 mer | 18/06 | S4.02 fin. S4.03 (groupes.html) + S4.04 (projets.html) en parallèle. Première mesure latence chat. |
| J4 jeu | 19/06 | S4.03 + S4.04 fin. S4.05 démarre (template projet.html unifié). |
| J5 ven | 20/06 | **Démo intermédiaire 16:00** : assistant chat live + groupes/projets. S4.05 fin. |
| J6 lun | 23/06 | S4.06 (contacts.html). S4.10 (tests) démarre en parallèle. |
| J7 mar | 24/06 | S4.07 (decisions.html). S4.10 continue. |
| J8 mer | 25/06 | S4.08 (raccourci desktop) + S4.09 (polish service). S4.10 finalise. |
| J9 jeu | 26/06 | S4.11 doc API + recette. Buffer correctifs. |
| J10 ven | 27/06 | **Démo finale 16:00** : 6 pages migrées + e2e vert. Préparation tag `v0.5-s4` (lundi 30/06). |

---

## 5 · Risques

| Risque | Proba | Impact | Mitigation | Déclencheur Plan B |
|---|---|---|---|---|
| **R1** Streaming SSE Claude bavard / latence p95 > 30 s | Moy | P1 | Time-box max_tokens 1500 + cap réponses + cache prompt système | dérive J3 → fallback non-streaming (POST classique) |
| **R2** Template projet.html paramétré perd les pages legacy spécifiques (Mermaid, KPI custom) | Faible | P2 | Audit visuel J4 sur 3 projets représentatifs (amani, etic-depots, feder) | écart UI > 30% → garder 2-3 pages projet dédiées en plus du template |
| **R3** Recherche `?q=` contacts trop lente (LIKE plein) | Faible | P3 | Index FTS5 SQLite dispo si besoin | latence > 500 ms → ajouter virtual table FTS5 en S4 |
| **R4** Raccourci desktop bloqué par GPO / antivirus ETIC | Moy | P3 | Whitelist dossier `%USERPROFILE%\Desktop` (raccourcis user permis par défaut) | KO → escalade IT ou variante "page épinglée navigateur" |
| **R5** SSE chat se déconnecte sur Zscaler après >5 min | Moy | P2 | Heartbeat 25 s déjà en place (S2.10) | observation J6 → fallback long-polling |

---

## 6 · Budget S4

| Poste | k€ | Note |
|---|---|---|
| Dev1 (backend + tests + service) | 5,3 | 5,3 j × 1 050 €/j |
| Dev2 (5 pages frontend) | 5,3 | 5,3 j × 1 050 €/j |
| PMO (ADR + doc + recette) | 0,8 | 0,8 j × 1 000 €/j |
| Designer review | 0,5 | 0,5 j × 1 000 €/j |
| Marge contingence | 10 % | inclus dans 22,1 k€ |
| **Total S4** | **22,1 k€** | identique S2 et S3 par construction |

**Cumul v0.5 fin S4** : 22,1 + 22,1 + 22,1 + 22,1 = **88,4 k€ / 110 k€ = 80 %**. Reste 21,6 k€ pour S5 (durcissement) + S6 (scellement).

---

## 7 · Dépendances S5

À l'issue de S4, S5 hérite de :

- **6 pages frontend migrées API** → S5 finalise polish + accessibilité + responsive review complète
- **Assistant chat live opérationnel** → S5 ajoute monitoring usage Claude (coût quotidien, top-k topics)
- **Raccourci desktop + service Windows polish** → S5 documente install MSI fresh poste pour CEO pair (livrable externe)
- **Tests ≥ 80 verts** → S5 ajoute Playwright e2e Linux (CI GitHub Actions) pour les 3 parcours critiques

**Aucun glissement** par rapport au plan SPEC §13 (Sprint 5 = durcissement technique). S5 reste sur fenêtre 7-13/07/2026 ou démarrable immédiatement après S4 livré.

---

*Source : `04_docs/DOSSIER-SPRINT-S4.md` · Pattern hérité de `DOSSIER-SPRINT-S3.md` (livré 25/04 -49 j vs BASELINE)*
