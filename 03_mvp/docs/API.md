# API REST aiCEO — référence

> Sprint **S2.09** · branche `release/v0.5-s2` · port `3001` (cf. ADR S2.00 / DOSSIER-SPRINT-S2 §1).
>
> Base URL locale : `http://localhost:3001`
> Toutes les réponses sont en `application/json` (sauf `204 No Content` explicitement noté).
> L'auth n'existe pas en local (mono-utilisateur poste CEO). Si vous exposez le serveur sur réseau, ajoutez un reverse-proxy + auth en amont.

---

## Sommaire

- [Variables d'environnement](#variables-denvironnement)
- [Conventions](#conventions)
- [Health & seed](#health--seed)
- [Cockpit (S2.01)](#cockpit-s201)
- [Tasks (S1)](#tasks-s1)
- [Decisions (S1)](#decisions-s1)
- [Contacts (S1)](#contacts-s1)
- [Projects & Groups (S1)](#projects--groups-s1)
- [Events (S1)](#events-s1)
- [Arbitrage (S2.03)](#arbitrage-s203)
- [Evening loop (S2.04)](#evening-loop-s204)
- [Legacy JSON (compat)](#legacy-json-compat)
- [Codes HTTP](#codes-http)
- [Smoke-test 1 commande](#smoke-test-1-commande)

---
- [Events — extension /week (S3.01)](#events--extension-week)
- [Big Rocks (S3.01)](#big-rocks-s301)
- [Weekly Reviews (S3.01)](#weekly-reviews-s301)
- [Auto-draft Claude (S3.03)](#auto-draft-claude-s303)
- [System / observability (S3.06)](#system--observability-s306)
- [SSE temps réel câblé front (S3.05)](#sse-temps-réel-câblé-front-s305)

## Variables d'environnement

Définies dans `.env` (cf. `.env.example`) ou exportées :

| Variable                | Défaut                  | Rôle                                                               |
|-------------------------|-------------------------|--------------------------------------------------------------------|
| `PORT`                  | `3001`                  | Port d'écoute HTTP. Aligné sur le contrat S2 — ne pas changer.     |
| `ANTHROPIC_API_KEY`     | (vide)                  | Si vide → mode `DEMO` (arbitrage/brouillons pré-bakés).            |
| `ANTHROPIC_MODEL`       | `claude-sonnet-4-6`     | Modèle utilisé par `src/llm.js`.                                   |
| `DEMO_MODE`             | `0`                     | Forcer le mode démo même avec une clé API valide.                  |
| `HTTPS_PROXY`           | (vide)                  | Proxy corp pour le SDK Anthropic (Zscaler, Squid…).                |
| `NODE_EXTRA_CA_CERTS`   | (vide)                  | Certificat racine du proxy MITM si besoin.                         |
| `AICEO_DB_OVERRIDE`     | `data/aiceo.db`         | Chemin SQLite alternatif — utilisé par les tests pour s'isoler.    |

Le mode courant est lisible via `GET /api/health`.

---

## Conventions

- **IDs** : UUIDv7-like (`uuid7()`), 26 caractères hex avec prefix temporel — triables par création.
- **Dates** : ISO 8601 UTC (`2026-04-25T08:30:00.000Z`). Les "jours" simples sont au format `YYYY-MM-DD`.
- **Persistance** : SQLite (`data/aiceo.db`) avec `journal_mode=WAL` et `foreign_keys=ON`. Migrations dans `data/migrations/`.
- **Event sourcing tasks** : chaque mutation insère un `task_events` (created / edited / done / undone / deferred / arbitraged).
- **Validation** : `400 Bad Request` avec `{ "error": "..." }` ; `404` si ressource inconnue ; `204` quand la ressource du jour n'existe pas encore (cockpit, evening, arbitrage today).

> ⚠️ **Zéro `localStorage` côté front** (ADR S2.00) — toutes les pages `public/*.html` consomment cette API.

---

## Health & seed

### `GET /api/health`

Vérifie que le serveur répond et expose le mode courant.

```bash
curl -s http://localhost:3001/api/health | jq
```

```json
{ "ok": true, "demo": false, "model": "claude-sonnet-4-6" }
```

### `POST /api/reseed`

Rejoue `scripts/extract-data.js` (data.js → seed.json). Utile uniquement pour la compat legacy (les routes API REST utilisent SQLite directement).

```bash
curl -s -X POST http://localhost:3001/api/reseed
```

---

## Cockpit (S2.01)

### `GET /api/cockpit/today`

Agrégat unique alimentant `index.html` (intention semaine, big rocks, compteurs, alertes).

```bash
curl -s http://localhost:3001/api/cockpit/today | jq
```

```json
{
  "date": "2026-04-25",
  "week_id": "2026-W17",
  "intention": "Sortir le sprint S2 sans dette",
  "big_rocks": [
    { "id": "br1", "ordre": 1, "title": "MVP cockpit live", "status": "doing" }
  ],
  "counters": {
    "tasks":     { "open": 12, "done_today": 3, "total": 47 },
    "decisions": { "open": 4,  "decided_today": 1 },
    "events":    { "today": 2, "upcoming_24h": 5 }
  },
  "alerts": [
    { "level": "warn", "kind": "overdue", "message": "3 tâches en retard", "ref": null }
  ]
}
```

---

## Tasks (S1)

CRUD complet + toggle/defer + journal d'événements.

### `GET /api/tasks`

Filtres : `project`, `done` (`true`/`false`/`1`/`0`), `eisenhower` (`UI`/`U-`/`-I`/`--`), `priority` (`P0`..`P3`), `starred` (`true`/`false`), `q` (recherche plein-texte sur titre), `type` (`do`/`delegate`/`defer`/`done`), `limit`, `offset`.

```bash
curl -s "http://localhost:3001/api/tasks?done=false&eisenhower=UI&limit=20" | jq '.tasks[] | {id, title, priority}'
```

### `POST /api/tasks`

```bash
curl -s -X POST http://localhost:3001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Préparer kickoff S3",
    "priority": "P1",
    "eisenhower": "UI",
    "project_id": null,
    "starred": true,
    "ai_capable": false
  }' | jq
```

Champs acceptés : `title` (requis), `description`, `project_id`, `type`, `priority`, `eisenhower`, `starred`, `done`, `due_at`, `estimated_min`, `energy`, `ai_capable`, `ai_proposal`, `context`, `source_type`, `source_id`.

### `GET /api/tasks/:id`

Retourne la tâche + `events[]` (event sourcing).

```bash
curl -s http://localhost:3001/api/tasks/$ID | jq
```

### `PATCH /api/tasks/:id`

```bash
curl -s -X PATCH http://localhost:3001/api/tasks/$ID \
  -H 'Content-Type: application/json' \
  -d '{ "eisenhower": "U-", "starred": false }' | jq
```

### `DELETE /api/tasks/:id`

```bash
curl -s -X DELETE http://localhost:3001/api/tasks/$ID
```

### `POST /api/tasks/:id/toggle`

Bascule `done` ↔ `not done` (génère event `done` ou `undone`).

```bash
curl -s -X POST http://localhost:3001/api/tasks/$ID/toggle | jq
```

### `POST /api/tasks/:id/defer`

Reporte une tâche (event `deferred`, `due_at` mis à jour).

```bash
curl -s -X POST http://localhost:3001/api/tasks/$ID/defer \
  -H 'Content-Type: application/json' \
  -d '{ "due_at": "2026-04-28" }' | jq
```

### `GET /api/tasks/:id/events`

Historique brut.

---

## Decisions (S1)

Registre stratégique avec transitions `ouverte → decidee → executee` (ou `abandonnee`).

```bash
curl -s "http://localhost:3001/api/decisions?status=ouverte" | jq

curl -s -X POST http://localhost:3001/api/decisions \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Investir 110k€ sur v0.5",
    "context": "Cf. DOSSIER-GO-NOGO-V05",
    "owner": "Major Fey",
    "deadline": "2026-05-15"
  }' | jq

curl -s -X POST http://localhost:3001/api/decisions/$ID/decide \
  -H 'Content-Type: application/json' \
  -d '{ "decision": "GO conditionnel — sprint S2 en preuve" }' | jq

curl -s -X POST http://localhost:3001/api/decisions/$ID/execute
curl -s -X POST http://localhost:3001/api/decisions/$ID/abandon
```

`GET /api/decisions/:id` retourne aussi `linked_tasks[]` (tâches dont `source_type='decision'` et `source_id` = decision).

---

## Contacts (S1)

```bash
# Liste
curl -s http://localhost:3001/api/contacts | jq '.contacts | length'

# Recherche full-text (LIKE %q%)
curl -s "http://localhost:3001/api/contacts/search?q=alefpa" | jq

# Création
curl -s -X POST http://localhost:3001/api/contacts \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Camille Dupont", "email": "camille@etic-services.net", "trust_level": "haute" }' | jq

# Lier à un projet
curl -s -X POST http://localhost:3001/api/contacts/$ID/link-project \
  -H 'Content-Type: application/json' \
  -d '{ "project_id": "proj-alefpa", "role": "sponsor" }' | jq

# Dé-lier
curl -s -X DELETE http://localhost:3001/api/contacts/$ID/link-project/proj-alefpa
```

`GET /api/contacts/:id` enrichit la réponse avec `projects[]` (jointure `contacts_projects`).

---

## Projects & Groups (S1)

### Projects

```bash
curl -s "http://localhost:3001/api/projects?status=active&q=cyber" | jq

curl -s -X POST http://localhost:3001/api/projects \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Pilote v0.5", "group_id": "g-aiceo", "status": "hot", "progress": 30 }' | jq

curl -s -X POST http://localhost:3001/api/projects/$ID/progress \
  -H 'Content-Type: application/json' \
  -d '{ "progress": 65 }'
```

### Groups

```bash
curl -s http://localhost:3001/api/groups | jq '.groups[] | {id, name, counts}'

curl -s http://localhost:3001/api/groups/$ID | jq '.group.projects'
```

`GET /api/groups` enrichit chaque groupe avec `counts.projects_total` / `counts.projects_active`.
`GET /api/groups/:id` retourne aussi `projects[]`.

---

## Events (S1)

Synchronisés depuis Outlook (read-only) ou créés manuellement.

```bash
# Liste avec fenêtre temporelle
curl -s "http://localhost:3001/api/events?from=2026-04-25&to=2026-05-02" | jq

# Aujourd'hui
curl -s http://localhost:3001/api/events/today | jq '.events | length'

# Semaine glissante
curl -s "http://localhost:3001/api/events/week?from=2026-04-20" | jq

# Création manuelle
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Kickoff S3",
    "starts_at": "2026-05-12T09:00:00Z",
    "duration_min": 60,
    "project_id": "proj-aiceo"
  }' | jq

# Annoter un event Outlook (notes / project_id seuls modifiables)
curl -s -X PATCH http://localhost:3001/api/events/$ID/annotate \
  -H 'Content-Type: application/json' \
  -d '{ "notes": "Préparer slides v2", "project_id": "proj-aiceo" }'
```

> ⚠️ `PATCH /api/events/:id` retourne **409 Conflict** si `source_type='outlook'` (lecture-seule). Utiliser `/annotate` à la place.

---

## Arbitrage (S2.03)

Boucle matin : Claude (ou la règle priorité) propose Faire / Déléguer / Reporter, le CEO valide.

### `POST /api/arbitrage/start` (idempotent)

Crée la session du jour. Si elle existe déjà → renvoie l'existante.

```bash
curl -s -X POST http://localhost:3001/api/arbitrage/start \
  -H 'Content-Type: application/json' \
  -d '{}' | jq
```

```json
{
  "id": "01HZ...",
  "date": "2026-04-25",
  "proposals": { "faire": ["t-001","t-002","t-003"], "deleguer": ["t-014"], "reporter": ["t-009"] },
  "faire":    [{ "task_id": "t-001", "task": { "...": "..." } }],
  "deleguer": [],
  "reporter": []
}
```

### `POST /api/arbitrage/commit`

Applique les buckets sur `tasks` (type updated, `due_at=demain` pour reporter) + insère `task_events.event_type='arbitraged'`.

```bash
curl -s -X POST http://localhost:3001/api/arbitrage/commit \
  -H 'Content-Type: application/json' \
  -d '{
    "decisions": {
      "faire":    ["t-001","t-002","t-003"],
      "deleguer": ["t-014"],
      "reporter": ["t-009","t-021"]
    }
  }' | jq
```

`400` si `decisions` manquant. `404` si aucune session du jour (appeler `/start` d'abord).

### `GET /api/arbitrage/today`

`200` avec la session, `204 No Content` si pas encore lancée aujourd'hui.

```bash
curl -s -i http://localhost:3001/api/arbitrage/today
```

### `GET /api/arbitrage/history`

Sessions descendant, avec `counts.faire / deleguer / reporter` quand committée.

```bash
curl -s http://localhost:3001/api/arbitrage/history | jq '.items[] | {date, committed, counts}'
```

---

## Evening loop (S2.04)

Boucle soir : bilan du jour + humeur + énergie + top 3 demain + streak.

### `POST /api/evening/start` (idempotent)

```bash
curl -s -X POST http://localhost:3001/api/evening/start \
  -H 'Content-Type: application/json' \
  -d '{}' | jq
```

### `POST /api/evening/commit`

```bash
curl -s -X POST http://localhost:3001/api/evening/commit \
  -H 'Content-Type: application/json' \
  -d '{
    "bilan": {
      "fait":     ["sprint S2 doc API"],
      "partiel":  ["spike WS"],
      "pas_fait": []
    },
    "humeur":         "bien",
    "energie":        4,
    "tomorrow_prep":  ["push origin", "réunion CEO pair", "ouvrir S3"],
    "duration_sec":   180
  }' | jq
```

Validations :
- `bilan` (objet) — requis.
- `humeur` ∈ `{ tres-bien, bien, neutre, tendu, difficile }`.
- `energie` ∈ entier 1..5.
- Tout autre → `400`.

### `GET /api/evening/today`

`200` avec session, `204` si aucune.

### `GET /api/evening/streak`

```bash
curl -s http://localhost:3001/api/evening/streak | jq
```

```json
{ "current": 7, "longest": 14, "total": 42 }
```

`longest` est persisté dans `settings.evening.longest_streak` (mis à jour à chaque `/commit`).

### `GET /api/evening/history?limit=14`

Retourne les N dernières sessions (max 60), descendant.

---

## Legacy JSON (compat)

Endpoints conservés tant que la migration vers SQLite n'est pas complète sur l'arbitrage UI v0.4 :

| Méthode | URL                       | Rôle                                                     |
|---------|---------------------------|----------------------------------------------------------|
| `GET`   | `/api/seed`               | data.js → JSON (compat front legacy)                     |
| `POST`  | `/api/decide`             | log d'arbitrage (JSON file)                              |
| `GET`   | `/api/history`            | historique arbitrages JSON                               |
| `POST`  | `/api/delegate`           | génère un brouillon mail (Claude)                        |
| `POST`  | `/api/delegate/save`      | persiste un draft                                        |
| `GET`   | `/api/delegate/history`   | drafts persistés                                         |
| `GET`   | `/api/evening/context`    | matin → soir : récupère arbitrage du jour                |
| `POST`  | `/api/evening`            | (legacy v0.4) ancien endpoint debrief — **utiliser `/api/evening/commit`**  |
| `GET`   | `/api/evening/history`    | (legacy v0.4) — couvert par la nouvelle route `/history` |
| `GET`   | `/api/emails/summary`     | stats emails ingérés (Outlook)                           |

> Les nouveaux endpoints `/api/evening/*` (S2.04) prennent **précédence** sur les legacy au routing (cf. `server.js` ligne 67).

---

---

## S3 Extensions (S3.01 → S3.06)

> Sprint S3 livre l'agenda hebdo, les revues hebdomadaires éditables (Big Rocks max 3 + auto-draft Claude), le câblage SSE temps réel front et l'observabilité de la sync Outlook.

### Events — extension `/week`

`GET /api/events/week?week=YYYY-Www&with_tasks=true` (S3.01)

Retourne les events + (optionnel) les tâches dont `due_at` tombe dans la fenêtre ISO de la semaine demandée. Lundi inclus, lundi suivant exclu.

```bash
curl http://localhost:3001/api/events/week?week=2026-W23
curl http://localhost:3001/api/events/week?week=2026-W23&with_tasks=true
# Sans week : 7 jours à partir d'aujourd'hui (legacy)
curl http://localhost:3001/api/events/week
```

Réponse :

```json
{
  "from": "2026-06-01T00:00:00.000Z",
  "to": "2026-06-08T00:00:00.000Z",
  "week": "2026-W23",
  "events": [...],
  "count": 5,
  "tasks": [...],
  "tasks_count": 3
}
```

### Big Rocks (S3.01)

Top 3 priorités hebdomadaires. Contrainte applicative : **maximum 3 par semaine**, le 4ᵉ POST renvoie `400`.

```bash
# Liste de la semaine
curl http://localhost:3001/api/big-rocks?week=2026-W23

# Création (status defini par defaut, ordre auto-attribué = MAX(ordre)+1)
curl -X POST http://localhost:3001/api/big-rocks \
  -H "Content-Type: application/json" \
  -d '{"week":"2026-W23","title":"Cabler SSE front","status":"defini"}'

# Mise à jour (PATCH)
curl -X PATCH http://localhost:3001/api/big-rocks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"accompli"}'

# Suppression
curl -X DELETE http://localhost:3001/api/big-rocks/<id>
```

Statuts valides (CHECK constraint) : `defini`, `en-cours`, `accompli`, `rate`.

Erreur contrainte max 3 :

```json
{
  "error": "contrainte max 3 big rocks par semaine atteinte",
  "week": "2026-W23",
  "current": 3,
  "max": 3
}
```

### Weekly Reviews (S3.01)

Une revue par semaine (UNIQUE constraint sur `week_id`). Upsert idempotent.

```bash
# Lecture par semaine
curl http://localhost:3001/api/weekly-reviews?week=2026-W23

# Liste des 12 dernières
curl http://localhost:3001/api/weekly-reviews

# Upsert (insert si pas de row pour cette semaine, sinon update)
curl -X POST http://localhost:3001/api/weekly-reviews \
  -H "Content-Type: application/json" \
  -d '{"week":"2026-W23","intention":"Livrer S3 propre","bilan":"## Focus...","mood":"bien"}'
```

Champs : `intention`, `big_rocks_done` (JSON), `bilan` (markdown), `cap_prochaine`, `mood`, `notes`, `draft_by_llm` (0/1).

### Auto-draft Claude (S3.03)

`POST /api/weekly-reviews/:week/draft` — agrège les données de la semaine (tâches done, sessions arbitrage/soir, big rocks) et appelle Claude pour produire un brouillon markdown structuré (`## Focus`, `## Faits saillants`, `## Écarts`, `## Top 3 demain`).

```bash
# Mode normal (Claude si ANTHROPIC_API_KEY définie)
curl -X POST http://localhost:3001/api/weekly-reviews/2026-W23/draft

# Mode fallback forcé (squelette markdown vide, sans appel API)
curl -X POST "http://localhost:3001/api/weekly-reviews/2026-W23/draft?fallback=true"
```

Réponse (source claude) :

```json
{
  "week": "2026-W23",
  "markdown": "## Focus\n…",
  "source": "claude",
  "model": "claude-sonnet-4-6",
  "usage": { "input_tokens": 850, "output_tokens": 320 },
  "context_summary": { "tasks_done": 12, "tasks_open": 2, "big_rocks": 3 }
}
```

Réponse (source fallback) si pas de clé API ou `?fallback=true` :

```json
{
  "week": "2026-W23",
  "markdown": "## Focus\n_(template offline …)_\n…",
  "source": "fallback",
  "reason": "no ANTHROPIC_API_KEY",
  "context_summary": { "tasks_done": 12, "tasks_open": 2, "big_rocks": 3 }
}
```

Rubric d'évaluation 6 critères (cf. ADR S3.00) : focus 1 ligne · ton factuel · 200-400 mots · ≥ 3 sources citées · top 3 demain · écarts surfacés.

### System / observability (S3.06)

`GET /api/system/last-sync` — fraîcheur de la dernière sync Outlook (mtime de `data/emails-summary.json`). Source de l'alerte cockpit `outlook_stale`.

```bash
curl http://localhost:3001/api/system/last-sync
```

Réponse :

```json
{
  "ok": true,
  "source": "emails-summary.json",
  "summaryPath": "/.../data/emails-summary.json",
  "lastSyncAt": "2026-04-25T14:30:00.000Z",
  "lastSyncAgeMin": 32,
  "level": "ok",
  "threshold": { "warn_min": 240, "critical_min": 1440 }
}
```

Niveau d'alerte : `ok` (< 4 h), `warn` (4-24 h), `critical` (> 24 h ou fichier absent). Le cockpit `GET /api/cockpit/today` injecte automatiquement une `alert.kind = "outlook_stale"` quand le niveau passe en warn ou critical.

`GET /api/system/health` — ping détaillé : pid, uptime, mémoire, version Node.

```bash
curl http://localhost:3001/api/system/health
```

### SSE temps réel câblé front (S3.05)

Le bus `EventEmitter` posé en S2.10 émet désormais sur les routes mutatrices :

| Route | Émet |
|---|---|
| `POST /api/tasks` | `task.created` |
| `PATCH /api/tasks/:id` | `task.updated` |
| `POST /api/tasks/:id/toggle` | `task.updated` |
| `DELETE /api/tasks/:id` | `task.deleted` |

Le front (cockpit `index.html`, `taches.html`, `agenda.html`) souscrit via `EventSource('/api/cockpit/stream')` avec reconnexion exponentielle (1 s → 30 s plafond) et `refetch()` automatique sur événement.

```bash
# Suivre le flux SSE en CLI
curl -N http://localhost:3001/api/cockpit/stream
```

Heartbeat `: ping <ts>` toutes les 25 s pour traverser les proxies (Zscaler timeout 60 s).

## Codes HTTP

| Code | Sens                                                                        |
|------|-----------------------------------------------------------------------------|
| 200  | OK                                                                          |
| 201  | Resource créée (POST `/api/{tasks,decisions,projects,groups,events,contacts}`) |
| 204  | Pas de session du jour (cockpit cas limite, `evening/today`, `arbitrage/today`) |
| 400  | Validation (champ requis, enum, range)                                      |
| 404  | Ressource inconnue                                                          |
| 409  | Conflit immutabilité (event Outlook lecture-seule)                          |
| 500  | Erreur serveur — voir logs `node server.js`                                 |

---

## Smoke-test 1 commande

Vérifie en 1 ligne que tous les endpoints clés répondent :

```bash
for u in \
  /api/health \
  /api/cockpit/today \
  /api/tasks \
  /api/decisions \
  /api/contacts \
  /api/projects \
  /api/groups \
  /api/events/today \
  /api/arbitrage/today \
  /api/evening/streak ; do
  printf "%-30s → " "$u"
  curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3001$u"
done
```

Sortie attendue : `200` partout (sauf `204` pour `arbitrage/today` et cockpit si BDD vide).

---

*Doc API · S2.09 · v0.5-s2 · 2026-04-25*
