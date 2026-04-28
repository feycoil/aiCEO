# Architecture aiCEO (snapshot v0.7)

> Vue rapide de l'architecture livrée. Pour le détail : `04_docs/02_architecture/06-architecture.md` (post-restructuration S6.16-bis).

## Stack

```
┌──────────────────────────────────────────────────────────┐
│  Frontend v06 (17 pages)                                 │
│  Vanilla JS + bind-*.js + DS Editorial Executive         │
│  PWA (manifest.webmanifest + sw.js)                      │
└─────────────────────┬────────────────────────────────────┘
                      │ REST + SSE
┌─────────────────────▼────────────────────────────────────┐
│  Backend Express (port 4747)                             │
│  15 routers REST CRUD + 5 routes LLM mode dégradé        │
│  SSE bus (cockpit/stream)                                │
└──────┬──────────────────────────┬────────────────────────┘
       │                          │
┌──────▼──────────────┐  ┌────────▼─────────────────────┐
│ SQLite mono-instance│  │ Anthropic API (optionnel)    │
│ 21 tables + 7 mig.  │  │ Claude Sonnet streaming SSE  │
│ aiceo.db            │  │ helper llmReady()            │
└─────────────────────┘  └──────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│ Outlook Desktop (sync 2h via schtasks)                  │
│ COM PowerShell → emails + events JSON → ingest SQLite   │
└─────────────────────────────────────────────────────────┘
```

## Tables SQLite (21)

**Métier** : `tasks`, `decisions`, `contacts`, `projects`, `groups`, `events`, `emails`, `weeks`, `big_rocks`, `delegations`

**Liaison** : `task_events`, `contacts_projects`

**Sessions** : `arbitrage_sessions`, `evening_sessions`, `weekly_reviews`

**Préférences/Settings** : `settings`, `user_preferences`

**Assistant** : `assistant_conversations`, `assistant_messages`, `knowledge_pins` (v0.7)

**Système** : `schema_migrations`

## Routers (15)

`/api/tasks`, `/api/decisions`, `/api/contacts`, `/api/projects`, `/api/groups`, `/api/events`, `/api/cockpit`, `/api/arbitrage`, `/api/evening`, `/api/weekly-reviews`, `/api/big-rocks`, `/api/system`, `/api/preferences`, `/api/assistant`, `/api/knowledge`

## Routes LLM v0.7 (5, mode dégradé activable)

- `POST /api/coaching-question` — signaux faibles + 4 questions LLM
- `POST /api/decision-recommend` — recommandations A/B/C
- `POST /api/auto-draft-review` — auto-draft revue hebdo
- `POST /api/effects-propagation` — preview effets décisions
- `GET /api/llm-status` — état live/dégradé

Helper `llmReady()` détecte présence `ANTHROPIC_API_KEY` → bascule LLM live (Sonnet) / rule-based heuristique.

## Frontend v06 (17 pages)

| Catégorie | Pages |
|---|---|
| **Hub** | hub.html |
| **Pilotage CEO** | index (cockpit), arbitrage, taches, agenda, evening |
| **Portefeuille** | projets, projet, equipe, decisions, revues |
| **Outils LLM** (preview v0.7→v0.8) | assistant, connaissance, coaching |
| **Système** | onboarding, settings, aide, components |

DS partagé : `_shared/colors_and_type.css` + `_shared/app.css` + `_shared/tweaks.css` + `_shared/theme.js` + 19 bind-*.js

## Infrastructure Windows

- **Variante D Startup folder** : `aiCEO-Server.lnk` lance le serveur au logon (sans admin)
- **Raccourci Bureau** : `Cockpit aiCEO.lnk` ouvre navigateur sur cockpit
- **Sync Outlook** : schtasks `aiCEO-Outlook-Sync` toutes les 2h
- **Rotation logs KISS** : 2 Mo / 3 archives via wrapper PowerShell

## Tests

- ~91 verts sandbox Linux (84 unit + 7 smoke)
- ~103 verts cumulés Windows (+12 E2E Playwright)
- Critère minimal recette CEO : 84 verts

## Sources

- `CLAUDE.md` §3 (architecture détaillée)
- `03_mvp/server.js` (registration routers)
- `03_mvp/migrations/*.sql` (7 migrations)
