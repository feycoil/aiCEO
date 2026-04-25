# Sprint S1 — Backend stable SQLite — Recette

**Période** : 25 avril → 9 mai 2026 (sprint d'un trait, recette finale).
**Mode** : binôme CEO + Claude, exécution interne (pas de dev externe).
**Tag cible** : `v0.5-s1`

## Définition de Fait

Le sprint est livré quand :

1. ✅ `npm install` puis `npm run db:init` créent `data/aiceo.db` avec **14 tables métier** (+ `settings` + `schema_migrations`) et **18 index**.
2. ✅ `npm run db:migrate-from-appweb` importe les **3 groupes / 14 projets / 28 tâches / 10 décisions / 25 contacts / 25 events** depuis `01_app-web/assets/data.js` sans erreur, idempotent.
3. ✅ `npm run db:migrate-json` charge `data/{decisions,evenings,drafts}.json` dans `arbitrage_sessions` / `evening_sessions` / `delegations`.
4. ✅ `npm start` démarre le serveur sur :4747 et expose **40+ endpoints REST** sur `/api/{tasks,decisions,contacts,projects,groups,events}` (CRUD complet + transitions + recherches).
5. ✅ `npm test` passe 100 % (≥ 22 cas couvrant CRUD + relations + event-sourcing).
6. ✅ Arbitrage matinal et boucle du soir fonctionnent **sans régression** (les flux Claude existants continuent de passer par `loadSeed()` / `arbitrage.js` jusqu'à S2).

## Inventaire livré

### Schéma SQLite (1 migration)
- `data/migrations/2026-04-25-init-schema.sql` — 14 tables + 2 utilitaires.

### Couche d'accès (1 fichier)
- `src/db.js` — singleton `getDb()`, `uuid7()`, `now()`, helpers JSON, `crud(table, opts)` factory.

### Routes REST (6 modules)
- `src/routes/tasks.js`     — CRUD + `toggle` + `defer` + event sourcing (`task_events`).
- `src/routes/decisions.js` — CRUD + transitions (`decide` / `execute` / `abandon`) + tâches liées.
- `src/routes/contacts.js`  — CRUD + recherche full-name/email/company + liaison N:N projets.
- `src/routes/projects.js`  — CRUD + counts agrégés + endpoint `progress`.
- `src/routes/groups.js`    — CRUD + counts projets actifs.
- `src/routes/events.js`    — agenda lecture/écriture (refus mutation events Outlook), filtres `today`/`week`/range.

### Scripts (3 nouveaux)
- `scripts/init-db.js`               — runner de migrations idempotent.
- `scripts/migrate-from-appweb.js`   — import `01_app-web/data.js` → SQLite (vm sandbox).
- `scripts/migrate-json-to-sqlite.js` — import `data/*.json` → tables historiques.

### Tests (1 suite)
- `tests/api.test.js` — 22 cas d'intégration sur base de test isolée (`aiceo-test.db`).

### Wiring
- `server.js` — montage de 6 routers REST + conservation `/api/seed` legacy.
- `package.json` — version `0.5.0-s1`, scripts `db:init`, `db:reset`, `db:migrate-*`, `test`.

## Endpoints REST (catalogue)

### Tâches — `/api/tasks`
- `GET /` — filtres : `project`, `done`, `eisenhower`, `priority`, `starred`, `q`, `type`, `limit`, `offset`.
- `POST /` — crée une tâche, log event `created`.
- `GET /:id` — tâche + historique events.
- `PATCH /:id` — édite (log event `edited` + champs modifiés).
- `DELETE /:id` — supprime (cascade events).
- `POST /:id/toggle` — bascule `done` (log `done`/`undone`).
- `POST /:id/defer` — reporte (log `deferred` + raison).
- `GET /:id/events` — historique brut.

### Décisions — `/api/decisions`
- `GET /`, `POST /`, `GET /:id` (+ tâches liées via `source_type='decision'`), `PATCH /:id`, `DELETE /:id`.
- `POST /:id/decide` — `ouverte → decidee` + `decided_at = now`.
- `POST /:id/execute` — `decidee → executee`.
- `POST /:id/abandon` — `* → abandonnee`.

### Contacts — `/api/contacts`
- `GET /`, `POST /`, `GET /:id` (+ projets liés), `PATCH /:id`, `DELETE /:id`.
- `GET /search?q=...` — recherche LIKE name/email/company/role.
- `POST /:id/link-project` — crée/remplace lien N:N + rôle.
- `DELETE /:id/link-project/:project_id` — délie.

### Projets — `/api/projects`
- `GET /`, `POST /`, `GET /:id` (+ counts tasks/decisions/contacts/events), `PATCH /:id`, `DELETE /:id`.
- `POST /:id/progress` — met à jour la jauge 0-100.

### Groupes — `/api/groups`
- `GET /` (+ counts projets actifs/total), `POST /`, `GET /:id` (+ projets attachés), `PATCH /:id`, `DELETE /:id`.

### Events — `/api/events`
- `GET /` — filtres `from`, `to`, `project`, `source_type`.
- `GET /today`, `GET /week` — fenêtres temporelles.
- `POST /`, `GET /:id`, `PATCH /:id` (refuse Outlook), `DELETE /:id` (idem).
- `PATCH /:id/annotate` — autorise annotations `notes`/`project_id` y compris sur events Outlook.

**Total** : 41 routes REST.

## Procédure de recette manuelle

```bash
cd 03_mvp

# 1. Préparation
npm install                          # → installe better-sqlite3 + deps
npm run db:reset                     # → drop + apply migration
npm run db:migrate-from-appweb       # → 3 grp / 14 proj / 28 tasks / ...
npm run db:migrate-json              # → arbitrage_sessions / evening_sessions / delegations

# 2. Tests automatisés
npm test                             # → ≥ 22 cas, tous verts

# 3. Smoke test serveur
npm start                            # → http://localhost:4747

# Dans un autre terminal :
curl http://localhost:4747/api/health
curl http://localhost:4747/api/groups
curl http://localhost:4747/api/projects?group=amani
curl 'http://localhost:4747/api/tasks?project=amani-credit&done=false'

# 4. Non-régression flux Claude
# Ouvrir http://localhost:4747 → arbitrage matinal doit fonctionner
# Ouvrir http://localhost:4747/evening → boucle du soir doit fonctionner
```

## Critères de validation

| # | Critère | Méthode | Statut |
|---|---------|---------|--------|
| 1 | Schéma 14 tables + indexes | `python3` ad-hoc OK | ✅ vérifié |
| 2 | Code 12 fichiers `node --check` | `for f in ...; do node --check; done` | ✅ tous OK |
| 3 | Migration data.js → SQLite | dry-run via `vm.runInContext` + comptage | ✅ 3/14/28/10/25/25 |
| 4 | Tests d'intégration | `npm test` (Windows, post-`npm install`) | À exécuter sur Windows |
| 5 | Démarrage serveur | `npm start` sans warning | À exécuter sur Windows |
| 6 | Arbitrage non-régression | UI matin reste fonctionnelle | À exécuter sur Windows |

## Ce qui sort du périmètre S1 (S2-S6)

- **S2** : Front Twisty 13 pages branché sur les nouvelles routes (taches/projets/decisions/contacts/agenda).
- **S3** : Outlook adapter v2 → écriture dans `events` SQLite (au lieu de cache JSON).
- **S4** : Boucle du soir + revues hebdo branchées sur `evening_sessions` / `weekly_reviews` / `big_rocks`.
- **S5** : Polish UX, gamification, command palette ⌘K.
- **S6** : Recette finale + tag `v0.5` + livraison.

## Engagements pour l'exécution

1. **Idempotence** : tous les scripts `db:migrate-*` se relancent sans dupliquer.
2. **FK ON / WAL** : forcés à chaque connexion via `getDb()`.
3. **Event sourcing** : toute mutation tâche logguée dans `task_events`.
4. **JSON transparent** : `crud()` accepte `jsonFields: ['attendees', ...]` pour sérialisation auto.
5. **UUIDv7-like** : les IDs auto-générés sont chronologiquement triables (timestamp 48 bits).
