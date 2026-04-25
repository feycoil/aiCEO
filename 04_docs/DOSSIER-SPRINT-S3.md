---
title: aiCEO v0.5 — Sprint S3 · Agenda hebdo + Revues + SSE live + Outlook autosync
audience: Équipe v0.5 (2 fullstack + designer + PMO + CEO pilote)
version: v1.0 — kickoff
date: 2026-04-25
sprint: S3 (semaines 23-24 / lundi 02/06 → vendredi 13/06)
durée: 2 semaines (10 j ouvrés)
budget: ≈ 22,1 k€ (20 % de l'enveloppe v0.5)
status: ready-to-fire — kickoff lundi 02/06 09:00
parent: DOSSIER-GO-NOGO-V05.md (decision ExCom du 04/05) · DOSSIER-SPRINT-S2.md (S2 livré 25/04)
---

# Sprint S3 — Agenda hebdo + Revues + SSE live + Outlook autosync

## 0 · Synthèse exécutive

**Objet du sprint** : compléter la migration des pages business (`agenda.html`, `revues/index.html`) du repo `01_app-web/` vers `03_mvp/public/` câblées sur l'API SQLite, activer le push live SSE prototypé en S2.10, et automatiser le sync Outlook 2 h (remplacement du lancement PowerShell manuel).

**Périmètre allégé sur la migration** : le DOSSIER-SPRINT-S2 a absorbé `taches.html` (initialement en S3), donc S3 ne migre plus que **2 pages** au lieu de 3 — gain redéployé sur le **câblage SSE front** (livré en S2.10 comme spike, non câblé) et un **spike Service Windows** time-boxé pour préparer S5.

**Livrable attendu fin de sprint** : `agenda.html` + `revues/index.html` accessibles à `http://localhost:3001/`, zéro `localStorage` applicatif sur ces pages, push live cockpit (toggle tâche dans un onglet → cockpit refresh dans l'autre sans F5), Outlook auto-sync toutes les 2 h en tâche planifiée Windows.

**Décalage S4 induit** : S4 reste sur le périmètre prévu (groupes, projets, contacts, décisions, assistant chat live). Aucun glissement par rapport au plan SPEC §13.

> **Lecture rapide** : §1 périmètre · §2 critères de fin · §3 issues à ouvrir · §4 planning daily · §5 risques · §6 budget · §7 dépendances S4.

---

## 1 · Périmètre S3 — 2 pages migrées + 2 chantiers transverses

### 1.1 — `agenda.html` (vue hebdo lun-dim Outlook)

**Aujourd'hui** : `01_app-web/agenda.html` lit `AICEO.STATE.events` en `localStorage`, affiche une grille hebdo lun-dim Twisty.

**Cible S3** :
- Backend : endpoint `GET /api/events/week?week=YYYY-Www` (déjà livré en S1, à brancher) + extension `?with_tasks=true` qui agrège les tâches `due_at` tombant dans la semaine.
- Frontend : `agenda.html` consomme l'API, supprime tous les accès `AICEO.STATE.events`. Drag-drop tâche → jour pour `PATCH /api/tasks/:id { due_at }`.
- Sélecteur semaine (← W23 →) avec query string `?week=YYYY-Www`, persistance dans l'URL (deep link partageable).
- Vue "Aujourd'hui" en surbrillance (col J=lun…dim).
- Click event → drawer detail (titre, organisateur, attendees, sources Outlook).

### 1.2 — `revues/index.html` (revue hebdo + auto-draft)

**Aujourd'hui** : `06_revues/index.html` est un dashboard statique avec les revues archivées (W17 markdown + widget). Pas d'éditeur de revue courante.

**Cible S3** :
- Backend nouveau : `GET/POST /api/weekly-reviews?week=YYYY-Www`, `GET/POST /api/big-rocks?week=YYYY-Www`. Les tables `weekly_reviews` et `big_rocks` existent déjà dans `data/migrations/2026-04-25-init-schema.sql` (S2.00).
- Backend auto-draft : `POST /api/weekly-reviews/:week/draft` qui appelle Claude pour rédiger un brouillon de bilan à partir des tâches done de la semaine + sessions arbitrage + bilans soir.
- Frontend : `revues/index.html` migré dans `03_mvp/public/revues/index.html`. Trois sections :
  1. **Big Rocks de la semaine** (top 3 priorités hebdo, éditables inline, status `todo|doing|done`).
  2. **Bilan auto-drafté** (si pas encore validé : bouton "Demander brouillon Claude" → markdown éditable → bouton "Valider" → POST).
  3. **Archives** (liste des semaines passées, lien vers le markdown archivé `06_revues/revue-YYYY-WNN.md`).
- Le drawer source-inspector remonte la lignée des Big Rocks (lien tâches done, sessions arbitrage de la semaine).

### 1.3 — Câblage SSE front (S3.05)

**Aujourd'hui** : le spike S2.10 a livré `src/realtime.js` + `GET /api/cockpit/stream` + 3 tests verts, mais **aucun front ne s'abonne** au flux SSE. Toggle d'une tâche dans `taches.html` → cockpit dans un autre onglet ne se rafraîchit pas (régression observée en demo S2).

**Cible S3** :
- Routes mutatrices (tasks, decisions, arbitrage, evening, events) appellent `emitChange(type, payload)` sur le bus.
- `index.html` (cockpit) ouvre `new EventSource('/api/cockpit/stream')` au load et re-fetch `/api/cockpit/today` sur chaque event reçu (debounce 200 ms).
- `taches.html` s'abonne aussi pour refléter les modifs croisées.
- Toast UX "Cockpit mis à jour" sur réception (subtil, 1 s).
- Reconnexion auto via `EventSource.onerror` (le navigateur réessaie tout seul, on log juste).

### 1.4 — Outlook autosync 2 h (S3.06)

**Aujourd'hui** : le sync Outlook 30 j est lancé manuellement par PowerShell (`scripts/import-outlook.ps1`). Le CEO doit penser à le relancer.

**Cible S3** :
- Tâche planifiée Windows (`schtasks` ou raccourci `Task Scheduler` créé par installeur) qui exécute `import-outlook.ps1` toutes les 2 h.
- Logging dédié `logs/outlook-sync.log` avec rotation 10 jours.
- Endpoint introspection `GET /api/system/last-sync` qui renvoie `{ last_run, status, mails_in, events_in, errors }` pour le cockpit (alerte si > 4 h sans sync).
- README MVP : section "Installation autosync" avec snippet PowerShell `schtasks /create`.

### 1.5 — Hors périmètre S3 (refs explicites)

Reportés à S4 ou S5 :
- `groupes.html`, `projets.html`, `projet/:id.html` → S4.
- `contacts.html`, `decisions.html` → S4.
- `assistant.html` chat live (WebSocket / SSE bidir) → S4.
- Service Windows + raccourci desktop → **S5** mais **spike S3.10** prépare le terrain (POC node-windows, ADR à rédiger).
- Migration Outlook COM → Graph API OAuth → V1 (hors v0.5).

---

## 2 · Critères de fin de sprint (acceptance, 10 conditions)

Sprint S3 **scellé** vendredi 13/06 si les 10 critères ci-dessous sont verts. Sinon, retro lundi 16/06 + plan de rattrapage début S4.

| # | Critère | Mesure |
|---|---|---|
| 1 | 2 pages neuves accessibles | `curl http://localhost:3001/{agenda.html,revues/index.html}` → 200 |
| 2 | Zéro `localStorage` applicatif | `grep -nE "localStorage\\.(get|set|remove)Item" 03_mvp/public/{agenda.html,revues/index.html}` → 0 |
| 3 | Agenda drag-drop | drag tâche → jour patch `due_at` côté backend, vérifié SQL |
| 4 | Big Rocks éditables | CRUD `/api/big-rocks` complet, persistés table `big_rocks`, max 3 par semaine (contrainte applicative) |
| 5 | Auto-draft Claude OK | `POST /api/weekly-reviews/:week/draft` renvoie un markdown ≥ 200 mots cohérent (revue manuelle CEO) |
| 6 | SSE live cockpit | toggle tâche tab A → cockpit tab B refresh < 1 s sans F5 (test manuel + e2e) |
| 7 | Outlook autosync planifié | `schtasks /query /tn "aiCEO-Outlook-Sync"` → présent, dernier run < 2 h |
| 8 | `GET /api/system/last-sync` | renvoie status structuré, alerte cockpit si > 4 h |
| 9 | Tests unitaires étendus | ≥ 65 tests verts (vs 55 livrés en S2) — `npm test` |
| 10 | Tests e2e parcours hebdo | nouveau parcours `e2e P4 — hebdo : agenda+drag-drop → revue draft → commit` vert |

---

## 3 · Issues GitHub à ouvrir (10)

| ID | Titre | Effort | Assignee | Labels |
|---|---|---|---|---|
| **S3.00** | Aligner ADR S3 (méthode + zéro localStorage applicatif rappelé) | 0,3 j | Lead dev | `phase/sprint-3` `type/adr` `priority/p0` |
| **S3.01** | Backend `/api/events/week` extension + `/api/weekly-reviews` + `/api/big-rocks` | 1,5 j | Backend | `lane/mvp` `type/feat` `priority/p0` `area/api` |
| **S3.02** | Frontend `agenda.html` migré (vue hebdo, drag-drop) | 1,5 j | Frontend | `lane/mvp` `type/feat` `priority/p0` `area/ux` |
| **S3.03** | Backend auto-draft revue Claude (`POST /api/weekly-reviews/:week/draft`) | 1 j | Backend | `lane/mvp` `type/feat` `priority/p1` `area/ai` |
| **S3.04** | Frontend `revues/index.html` migré (Big Rocks + auto-draft + archives) | 1,5 j | Frontend | `lane/mvp` `type/feat` `priority/p0` `area/ux` |
| **S3.05** | Câblage SSE front (cockpit + taches s'abonnent au flux) | 0,8 j | Fullstack | `lane/mvp` `type/feat` `priority/p1` `area/realtime` |
| **S3.06** | Outlook autosync 2 h (schtasks + endpoint `/api/system/last-sync`) | 1 j | Backend + IT | `lane/mvp` `type/feat` `priority/p1` `area/integration` |
| **S3.07** | Tests e2e parcours hebdo (P4) | 0,5 j | Backend | `lane/mvp` `type/test` `priority/p0` |
| **S3.08** | Tests unitaires extensions ≥ 65 verts | 1 j | Lead dev | `lane/mvp` `type/test` `priority/p1` |
| **S3.09** | Doc API S3 (events/week, weekly-reviews, big-rocks, system/last-sync, sse câblé) | 0,5 j | Lead dev | `lane/mvp` `type/docs` `priority/p1` |
| **S3.10** | Spike Service Windows (POC `node-windows`, ADR, time-box 1,5 j) | 1,5 j | Backend | `lane/mvp` `type/spike` `priority/p2` `area/deploy` |

**Total effort** : 11,1 j-dev × 1,8 ETP = absorbé sur 10 j ouvrés × 2 fullstack avec marge 9 %. Designer 0,3 ETP sur S3.02 et S3.04 (revue Twisty). PMO 0,3 ETP sur dailys + retro.

---

## 4 · Planning daily (10 j ouvrés)

| Jour | Date | Focus |
|---|---|---|
| J1 lun | 02/06 | Kickoff matin (deck S3 relu en binôme), S3.00 ADR. Backend démarre S3.01, frontend démarre lecture des pages app-web à migrer. |
| J2 mar | 03/06 | S3.01 routes weekly-reviews + big-rocks (CRUD + tests unit). S3.02 squelette agenda.html + grille hebdo. |
| J3 mer | 04/06 | S3.01 fini (events/week extension + tests). S3.02 drag-drop tâches branché. |
| J4 jeu | 05/06 | S3.04 squelette revues/index.html + intégration Big Rocks. S3.05 câblage SSE cockpit. |
| J5 ven | 06/06 | Demo intermédiaire CEO + ExCom (agenda hebdo + cockpit live). Retrospective J1-J5. |
| J6 lun | 09/06 | S3.03 auto-draft Claude (prompt + endpoint). S3.05 câblage SSE taches. S3.10 spike Service Windows démarre. |
| J7 mar | 10/06 | S3.04 archives revues + UI éditeur markdown. S3.06 schtasks + endpoint last-sync. |
| J8 mer | 11/06 | S3.07 e2e P4 + S3.08 tests unitaires extension. S3.10 ADR Service Windows rédigée. |
| J9 jeu | 12/06 | S3.09 doc API. Bug bash + polish UX (drawer, transitions, toasts). |
| J10 ven | 13/06 | Sprint review CEO + équipe. Tag `v0.5-s3`. Rétro + plan S4. |

**Plan B mid-sprint (J5)** : si S3.03 (auto-draft Claude) glisse, on dégrade en "draft template figé" (pas d'IA) et on réinjecte S3.03 en début S4. Si S3.10 (spike Service Windows) explose le time-box, on l'arrête et on garde l'ADR "à finaliser en S5".

---

## 5 · Risques

| # | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Schtasks Windows nécessite droits admin → CEO doit valider sur poste corp | Moyenne | Moyen | Issue P0 ouverte côté IT ETIC dès J1, fallback : tâche utilisateur (sans admin) |
| R2 | Auto-draft Claude génère un markdown de mauvaise qualité (revue trop vague ou trop verbeuse) | Moyenne | Faible | Prompt itéré sur 5 semaines de données réelles (W14-W18), rubric d'évaluation 6 critères (focus, ton, longueur, sources citées, top 3 demain, surfaçage des écarts) |
| R3 | SSE traversée Zscaler corp (timeout 60 s) | Faible | Moyen | Heartbeat 25 s déjà en place (S2.10), test sur poste CEO J3 |
| R4 | Drag-drop natif HTML5 capricieux sur Edge (anciens fix S2) | Faible | Faible | Réutilisation pattern `arbitrage.html` (déjà éprouvé S2.03) |
| R5 | Migration `06_revues/` → `03_mvp/public/revues/` casse les liens W17 archivés | Faible | Faible | Garder les markdown dans `06_revues/`, le HTML migré pointe vers eux en lecture |

---

## 6 · Budget S3

| Poste | Jours | Coût |
|---|---|---|
| Backend (1 ETP) | 10 j | 8,5 k€ |
| Frontend (1 ETP) | 10 j | 8,5 k€ |
| Designer (0,3 ETP) | 3 j | 2,1 k€ |
| PMO (0,3 ETP) | 3 j | 1,8 k€ |
| Frais Claude API (auto-draft + e2e) | — | 0,2 k€ |
| Buffer aléas | 5 % | 1,0 k€ |
| **Total S3** | | **≈ 22,1 k€** |

Cumul v0.5 (S1+S2+S3 livrés) : ≈ 66,3 k€ / 110 k€ enveloppe → **60 % consommés à 50 % du sprintage** (3/6 sprints). Marge confortable pour S4-S6.

---

## 7 · Dépendances S4

À l'issue de S3, S4 hérite de :

- **API REST stable** sur tasks/decisions/contacts/projects/groups/events/cockpit/arbitrage/evening/weekly-reviews/big-rocks/system → S4 finit la couverture (assistant, chat).
- **SSE bus** prouvé en prod local → S4 peut activer push pour `assistant.html` (chat live) sans nouveau spike.
- **Auto-sync Outlook** → S4 peut compter sur fraîcheur 2 h pour le contexte agent IA.
- **POC Service Windows** (S3.10) → S5 démarre directement sur l'install MSI / NSSM avec ADR validée.

**Aucun glissement par rapport au plan SPEC §13** : S4 garde son périmètre original (portefeuille + assistant chat live).

---

*Cadrage S3 · 2026-04-25 · à valider avec le CEO en kickoff lundi 02/06*
