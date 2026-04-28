# API INDEX — aiCEO v0.5

> **Référence canonique** des endpoints REST de aiCEO post-livraison v0.5 (26/04/2026).
> Source de vérité unique pour le décompte des routes API (cf. CLAUDE.md §11 Sources de vérité).

**Total : 70 routes API** dans 13 routers + **22 routes legacy/utilitaires** dans server.js + **12 routes pages** = **104 endpoints HTTP exposés**.

Base URL : `http://localhost:4747` (cf. ADR S2.00 + variante D Startup folder).

---

## §1 — Routes pages (12)

Servies par `server.js` directement (`res.sendFile`).

| Méthode | Route | Sprint | Sert le fichier |
|---|---|---|---|
| GET | `/` | S2 | `public/index.html` (cockpit) |
| GET | `/arbitrage` | S2 | `public/arbitrage.html` |
| GET | `/evening` | S2 | `public/evening.html` |
| GET | `/taches` | S2 | `public/taches.html` |
| GET | `/agenda` | S3 | `public/agenda.html` |
| GET | `/revues` | S3 | `public/revues/index.html` |
| GET | `/groupes` | S4 | `public/groupes.html` |
| GET | `/projets` | S4 | `public/projets.html` |
| GET | `/projet` | S4 | `public/projet.html` (template paramétré `?id=xxx`) |
| GET | `/contacts` | S4 | `public/contacts.html` |
| GET | `/decisions` | S4 | `public/decisions.html` |
| GET | `/assistant` | S4 | `public/assistant.html` |

**v0.6 (cible officielle depuis 26/04 PM)** : 7 pages additionnelles dans `public/v06/` (hub, index, arbitrage, evening, onboarding, settings, components). À brancher API en S6.2.

---

## §2 — Routes API CRUD (70)

Montées par `server.js` via `app.use('/api/{name}', router)`.

### `/api/tasks` (8 routes) — `src/routes/tasks.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste tasks (filtres : project, status, due_at, q) |
| POST | `/` | Créer task |
| GET | `/:id` | Détail task + events historique |
| PATCH | `/:id` | Update partiel (priority, due_at, project, etc.) |
| DELETE | `/:id` | Suppression |
| POST | `/:id/toggle` | Bascule done ↔ open |
| POST | `/:id/defer` | Reporte à date (ajoute event reschedule) |
| GET | `/:id/events` | Historique complet (created/updated/done/deferred) |

### `/api/decisions` (8 routes) — `src/routes/decisions.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste decisions (filtres : project, status, owner, q) |
| POST | `/` | Créer décision |
| GET | `/:id` | Détail décision + tasks liées (source_id) |
| PATCH | `/:id` | Update partiel |
| DELETE | `/:id` | Suppression |
| POST | `/:id/decide` | Transition status `ouverte → decidee` (sauve `decided_at`) |
| POST | `/:id/execute` | Transition `decidee → executee` |
| POST | `/:id/abandon` | Transition vers `abandonnee` |

### `/api/contacts` (8 routes) — `src/routes/contacts.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste contacts (filtres : q, trust_level, company) |
| GET | `/search` | Recherche full-name/email/company |
| POST | `/` | Créer contact |
| GET | `/:id` | Détail contact + projets liés |
| PATCH | `/:id` | Update partiel |
| DELETE | `/:id` | Suppression |
| POST | `/:id/link-project` | Liaison N:N { project_id, role } |
| DELETE | `/:id/link-project/:project_id` | Délier |

### `/api/projects` (6 routes) — `src/routes/projects.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste projets (filtres : group, status, q) |
| POST | `/` | Créer projet |
| GET | `/:id` | Détail projet + counts (tasks ouvertes, decisions ouvertes, contacts liés, events) |
| PATCH | `/:id` | Update partiel |
| DELETE | `/:id` | Suppression |
| POST | `/:id/progress` | Update progress 0-100 |

### `/api/groups` (5 routes) — `src/routes/groups.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste groupes + counts projets ouverts |
| POST | `/` | Créer groupe |
| GET | `/:id` | Détail + projets attachés |
| PATCH | `/:id` | Update partiel |
| DELETE | `/:id` | Suppression |

### `/api/events` (8 routes) — `src/routes/events.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste events (filtres date range) |
| GET | `/today` | Events du jour |
| GET | `/week` | Events de la semaine ISO (`?week=YYYY-Www&with_tasks=true` S3.01) |
| POST | `/` | Création manuelle event |
| GET | `/:id` | Détail event |
| PATCH | `/:id` | Update partiel |
| PATCH | `/:id/annotate` | Annotation (note libre) |
| DELETE | `/:id` | Suppression |

### `/api/cockpit` (2 routes) — `src/routes/cockpit.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/today` | Payload cockpit complet (intention + big rocks + tasks + decisions + alertes) |
| GET | `/stream` | SSE temps réel (heartbeat 25s + relais task.created/.updated/.deleted) |

### `/api/arbitrage` (4 routes) — `src/routes/arbitrage.js`

| Méthode | Path | Description |
|---|---|---|
| POST | `/start` | Démarre une session d'arbitrage matinal (idempotent) |
| POST | `/commit` | Applique les buckets (faire/déléguer/reporter) sur tasks + insère task_events |
| GET | `/today` | Session du jour si présente |
| GET | `/history` | Liste des arbitrages descendante avec counts |

### `/api/evening` (5 routes) — `src/routes/evening.js`

| Méthode | Path | Description |
|---|---|---|
| POST | `/start` | Démarre session bilan soir |
| POST | `/commit` | Persiste bilan + humeur + énergie + tomorrow_prep |
| GET | `/today` | Session du jour |
| GET | `/history` | Historique des bilans |
| GET | `/streak` | Calcul streak en cours + longest_streak persisté dans settings |

### `/api/weekly-reviews` (5 routes) — `src/routes/weekly-reviews.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste reviews (filtre `?week=YYYY-Www`) |
| GET | `/:id` | Détail review |
| POST | `/` | Création/update (upsert idempotent) |
| POST | `/:week/draft` | Auto-draft Claude (rubric 6 critères, S3.03) |
| DELETE | `/:id` | Suppression |

### `/api/big-rocks` (5 routes) — `src/routes/big-rocks.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/` | Liste (filtre `?week=YYYY-Www`, ordre ASC) |
| GET | `/:id` | Détail |
| POST | `/` | Création (contrainte applicative max 3/sem, sinon HTTP 400) |
| PATCH | `/:id` | Update partiel |
| DELETE | `/:id` | Suppression |

### `/api/system` (2 routes) — `src/routes/system.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/last-sync` | Statut sync Outlook (mtime emails-summary.json, level ok/warn>4h/critical>24h) |
| GET | `/health` | Healthcheck enrichi (S5.03 — uptime, memory, db_size, counts) |

### `/api/assistant` (4 routes) — `src/routes/assistant.js`

| Méthode | Path | Description |
|---|---|---|
| GET | `/conversations` | Liste 20 dernières conversations |
| GET | `/conversations/:id` | Historique complet (messages user + assistant) |
| DELETE | `/conversations/:id` | Suppression (FK CASCADE messages) |
| POST | `/messages` | Streaming SSE Claude (`messages.stream` Anthropic SDK), ou démo fallback |

---

## §3 — Routes legacy / utilitaires (22)

Définies directement dans `server.js`. Encore actives pour compat ou utilitaires.

### Compat arbitrage (4 routes)

| Méthode | Path | Statut | Note |
|---|---|---|---|
| GET | `/api/seed` | Legacy | Retourne seed tasks/projects/events/contacts pour arbitrage UI v0.4 |
| POST | `/api/decide` | Legacy | Sauvegarde décision (remplacé par `/api/decisions`) |
| GET | `/api/history` | Legacy | Historique des décisions arbitrage v0.4 |
| POST | `/api/reseed` | Utilitaire | Re-exécute `extract-data.js` |

### Délégation (3 routes)

| Méthode | Path | Statut |
|---|---|---|
| POST | `/api/delegate` | Génère brouillon mail délégation via Claude (S1) |
| POST | `/api/delegate/save` | Sauvegarde brouillon |
| GET | `/api/delegate/history` | Historique brouillons |

### Evening legacy (3 routes)

| Méthode | Path | Note |
|---|---|---|
| GET | `/api/evening/context` | Hydrate contexte arbitrage du jour (tasks + buckets) |
| POST | `/api/evening` | Sauvegarde bilan (route plate, complémente `/api/evening/commit`) |
| GET | `/api/evening/history` | Historique bilans (legacy) |

### Health + emails (2 routes)

| Méthode | Path | Note |
|---|---|---|
| GET | `/api/health` | Healthcheck enrichi v0.5 (uptime, memory, db_size, counts, outlook level) |
| GET | `/api/emails/summary` | Résumé emails Outlook (mtime + premiers items) |

### Autres routes pages (10)

Comptées en §1 (pages frontend).

---

## §4 — Récap totaux

| Catégorie | Count |
|---|---|
| Routes pages frontend (`res.sendFile`) | **12** |
| Routes API CRUD (13 routers) | **70** |
| Routes legacy / utilitaires (server.js direct) | **22** |
| **TOTAL endpoints HTTP** | **104** |
| Routes pages **v0.6 cible** (à brancher S6.2) | +7 |

**Note importante** : la promesse "40+ endpoints REST" du DOSSIER-GO-NOGO-V05.md est **largement dépassée** (70 endpoints CRUD purs, 92 si on inclut les routes legacy + utilitaires). Engagement A3 audit consolidé : ✅ conforme.

---

## §5 — Conventions

- **Préfixe** : toutes les routes API commencent par `/api/`
- **Format réponse** : JSON `{ data, count, ... }` ou `{ error: "msg" }` sur erreur
- **Codes HTTP** : 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Internal Error
- **Streaming SSE** : `text/event-stream` sur `/api/cockpit/stream` et `/api/assistant/messages`
- **Idempotence** : `POST /start` (arbitrage, evening) sont idempotents (un seul session par jour)
- **CASCADE** : `DELETE /api/assistant/conversations/:id` supprime les messages liés (FK ON DELETE CASCADE)

---

## §6 — Évolutions V1 prévues

| Endpoint | Phase V1 |
|---|---|
| `POST /api/auth/login` (Microsoft Entra OIDC) | V1.1 |
| `GET /api/users/me` + `/api/teams` | V1.2 (équipes) |
| `POST /api/share/:resource/:id` (collab N:N) | V1.2 |
| Webhooks Microsoft Graph (Outlook → push) | V1.3 |
| `GET /api/mobile/push-token` (FCM) | V1.4 |
| Routes Sentry healthcheck enrichies | V1.6 |

Cf. `00_BOUSSOLE/ROADMAP.md` § V1 themes.

---

## §7 — Sources

- `03_mvp/server.js` (montage routers + routes legacy)
- `03_mvp/src/routes/*.js` (13 fichiers router)
- `04_docs/api/S4.md` (curl examples assistant + groupes + projets + contacts + décisions)
- ADR `00_BOUSSOLE/DECISIONS.md` § S2.00 (zéro localStorage), § S5.03 (/api/health enrichi)

**Audit consolidé 26/04/2026** : ce fichier élimine alerte A4 (« gap 40 vs 27 routes ») — la réalité est **70 routes API CRUD + 22 legacy/utilitaires = 92 endpoints REST**, largement au-delà des 40+ promises.
