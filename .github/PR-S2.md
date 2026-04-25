# Sprint S2 — v0.5-s2

> Branche : `release/v0.5-s2` → `main`
> Sprint S2 livré complet · 10/10 issues · 11 commits · 55/55 tests verts
> Période : 13 → 25/04/2026 (3 semaines, fin avancée grâce au gain time-box du spike SSE)

---

## Résumé exécutif

Sprint S2 transforme aiCEO d'un prototype « tâches + arbitrage » en un **cockpit CEO opérationnel** :

- **Cockpit live** (`/api/cockpit/today`) : agrégat tâches + décisions + events + intention de semaine + alertes, zéro `localStorage` applicatif.
- **Rituels matin/soir** : arbitrage matinal (top 3 / délégation IA / report) et bilan du soir (humeur + énergie + top 3 demain) avec **streak persistant**.
- **Modèles métier élargis** : projets, groupes, contacts, recherche globale.
- **IA décisionnelle** : Claude propose une recommandation argumentée pour une décision ouverte.
- **Documentation API complète** (`docs/API.md`, 38 exemples curl) + **spike SSE** (`docs/SPIKE-WEBSOCKET.md`).
- **3 parcours e2e** (HTTP boundary tests) qui valident matin / journée / soir de bout en bout.

Aucune régression sur le périmètre v0.4 (49 tests S1 toujours verts, 6 nouveaux tests S2).

---

## Closes

Closes #S2.00, #S2.01, #S2.02, #S2.03, #S2.04, #S2.05, #S2.06, #S2.07, #S2.08, #S2.09, #S2.10.

---

## Détail des 10 issues

| Issue | Titre | Livrables clés |
|---|---|---|
| **S2.00** | ADR & schéma SQLite | `data/migrations/2026-04-25-init-schema.sql`, ADR « zéro localStorage applicatif » |
| **S2.01** | Cockpit du jour | `GET /api/cockpit/today` — counters SQL + alertes (overdue, stale, big rocks manquants) |
| **S2.02** | Arbitrage matinal | `POST /api/arbitrage/start|commit`, `GET /today` — proposals : top 3 P0/P1 → faire, ai_capable → déléguer, reste → reporter |
| **S2.03** | Eisenhower drag-drop | `PATCH /api/tasks/:id` accepte `eisenhower` ∈ {UI, UnI, nUI, nUnI, --}, filtre `?eisenhower=…` |
| **S2.04** | Projets & groupes | Tables `projects`, `groups`, `contacts` + routes CRUD complètes |
| **S2.05** | Recherche globale | `GET /api/search?q=…` — full-text léger sur tasks/decisions/contacts/projects |
| **S2.06** | IA recommandation décisions | `POST /api/decisions/:id/recommend` — appel Anthropic, fallback offline si pas de clé |
| **S2.07** | Tests e2e 3 parcours | `tests/e2e.test.js` — HTTP boundary tests (Playwright différé S3+, Chromium infaisable en sandbox) |
| **S2.08** | Bilan du soir | `POST /api/evening/start|commit`, streak persistant dans `settings.evening.longest_streak`, validations humeur ∈ {bien, moyen, mauvais} et energie ∈ [1,5] |
| **S2.09** | Documentation API | `docs/API.md` — 487 lignes, 15 sections, 38 exemples curl, smoke-test 1 commande, README mis à jour v0.5 |
| **S2.10** | Spike push temps réel | `docs/SPIKE-WEBSOCKET.md` (ADR SSE retenu vs WS), `src/realtime.js` (bus EventEmitter), `GET /api/cockpit/stream` (SSE + heartbeat 25 s) |

---

## Tests

| Suite | Avant S2 | Après S2 |
|---|---|---|
| `tests/*.test.js` (total) | 49 | **55** |
| Nouveaux : `tests/e2e.test.js` (S2.07) | — | 3 parcours |
| Nouveaux : `tests/realtime.test.js` (S2.10) | — | 3 tests SSE |

```
$ npm test
ok 1 - cockpit/today renvoie counters + alerts
ok 2 - arbitrage/start propose top 3 + delegate
…
ok 55 - GET /stream relaie les emitChange en SSE
# pass 55 / fail 0
```

Isolation par `AICEO_DB_OVERRIDE` (un fichier SQLite dédié par suite, supprimé en `after`). Nettoyage WAL/SHM systématique.

---

## ADRs livrés

- **S2.00 — Zéro `localStorage` applicatif** : la source de vérité est SQLite côté serveur. Le front lit/écrit toujours via REST.
- **S2.10 — SSE plutôt que WebSocket** : mono-user, mono-directionnel, zéro dépendance, `EventSource` natif navigateur. WebSocket différé v0.6+ si un cas bidir apparaît (co-édition CEO + EA).

---

## Time-box

Le spike S2.10 (estimé 3 j) a été livré en 1.5 j (SSE plus léger qu'un proto WebSocket). Le gain (1.5 j) a été redéployé sur **S2.07** pour livrer les 3 parcours e2e malgré l'impossibilité de faire tourner Playwright en sandbox.

---

## Variables d'env utilisées

| Var | Effet | Défaut |
|---|---|---|
| `PORT` | Port HTTP serveur | 3001 |
| `AICEO_DB_OVERRIDE` | Chemin SQLite (utile en tests) | `data/aiceo.db` |
| `ANTHROPIC_API_KEY` | Active S2.06 (sinon fallback) | — |
| `HTTPS_PROXY` | Pour environnements corp | — |

---

## Vérification rapide post-merge

```bash
node server.js
# dans un autre terminal
curl http://localhost:3001/api/cockpit/today
curl -N http://localhost:3001/api/cockpit/stream   # SSE → reçoit `event: hello`
```

---

## Tag prévu

À la fusion, tagger `v0.5-s2` :

```bash
git checkout main
git pull
git tag -a v0.5-s2 -m "Sprint S2 — cockpit live + rituels + SSE"
git push origin v0.5-s2
```

---

*PR générée le 2026-04-25 · 11 commits du `accea60` au `6f4e6e8`*
