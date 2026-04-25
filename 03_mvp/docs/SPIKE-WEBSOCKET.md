# Spike — Push temps réel cockpit (S2.10)

> **Time-box** : 3 j-dev (18-23/05/2026 dans le sprint S2 — réalisé en avance le 25/04/2026 pour livrer le sprint S2 complet).
> **Question** : faut-il introduire WebSocket pour rafraîchir le cockpit (`index.html`) sans bouton "Recharger" ?
> **Conclusion** : **non — Server-Sent Events (SSE)** suffit, zéro dépendance, compatible nativement avec `EventSource` côté navigateur. Décision **différée à v0.6** si polling 30 s s'avère insuffisant.

---

## 1. Contexte

Le cockpit (`/api/cockpit/today`, S2.01) agrège tâches + décisions + événements en une seule réponse JSON. Aujourd'hui, `index.html` recharge via `fetch()` :

- au chargement de la page,
- après chaque action utilisateur (toggle tâche, commit arbitrage…).

**Problème observé en demo** : si je toggle une tâche depuis `taches.html` dans un autre onglet, le cockpit ne se met pas à jour tant qu'on ne rafraîchit pas. Idem si un event Outlook est ingéré pendant la journée (sync planifié).

**Besoin réel** : push asynchrone serveur → onglets ouverts dès qu'un mutateur (`POST /api/tasks`, `PATCH /api/tasks/:id`, `POST /api/arbitrage/commit`, etc.) modifie l'état.

---

## 2. Options évaluées

| Option | Coût intégration | Latence | Bidir | Dépendances | Complexité ops |
|---|---|---|---|---|---|
| **A. Polling 30 s** (statu quo amélioré) | 5 min | ≤ 30 s | non | — | nulle |
| **B. SSE (`text/event-stream`)** | ½ j | < 200 ms | non (S→C uniquement) | — (HTTP/1.1 natif) | nulle (1 connexion HTTP par onglet) |
| **C. WebSocket (`ws` lib)** | 1-2 j | < 100 ms | oui | `ws@^8` | upgrade HTTP/1.1 + reverse-proxy à reconfigurer |
| **D. Socket.IO** | 1 j (rapide) | < 100 ms | oui | `socket.io@^4` (250 KB côté client) | fallbacks long-poll, version pinning |

### Critères

1. **Besoin réel** : 1-onglet → 1-utilisateur (CEO). Pas de collaboration multi-user. Pas de chat. Le serveur pousse → le client reflète. Mono-directionnel suffit.
2. **Stack actuel** : Express 4, pas de reverse-proxy, run local poste CEO. Pas d'environnement cluster. Pas de scale-out.
3. **Risque ops** : chaque dépendance ajoutée alourdit l'install Windows et augmente la surface CVE.
4. **Dogfood** : on doit pouvoir lancer `node server.js` sans rien d'autre que `npm install`.

→ **SSE coche tout ce qui compte ici.** WebSocket apporte la bidirectionnalité, mais le client n'a rien à envoyer en push (les commandes restent en POST REST classiques) — c'est un overkill.

---

## 3. Décision (ADR S2.10)

> **Adopter SSE** pour le push cockpit. Endpoint : `GET /api/cockpit/stream`.
> **Différer WebSocket** à v0.6+ uniquement si un cas d'usage bidirectionnel apparaît (ex : co-édition CEO + EA).

**Format** :

```
event: task.updated
data: {"id":"01HZ...","title":"...","done":true}

event: cockpit.refresh
data: {"reason":"arbitrage.committed","date":"2026-04-25"}
```

**Diffusion** : un `EventEmitter` interne (`src/realtime.js`) reçoit des events depuis les routes mutatrices (tasks, arbitrage, evening, decisions, events). L'endpoint SSE relaie ces events à toutes les connexions actives.

**Reconnexion** : le navigateur relance `EventSource` automatiquement après coupure (geste natif). Heartbeat serveur toutes les 25 s pour traverser les proxies.

**Backpressure** : si > 50 connexions actives → log warning. Pour aiCEO mono-user, on ne dépassera pas 5-6 onglets.

---

## 4. Prototype livré

Fichiers créés dans cette spike :

- `src/realtime.js` — `bus` (`EventEmitter` global) + helper `emitChange(type, payload)`.
- `src/routes/cockpit.js` — ajout `GET /api/cockpit/stream` (SSE) + heartbeat 25 s.
- `tests/realtime.test.js` — 2 tests : (a) la connexion SSE reçoit un event quand `bus.emit()` est appelé ; (b) heartbeat ping reçu après 30 s (mocked timer).

Côté front (snippet pour intégration v0.6) :

```js
const es = new EventSource('/api/cockpit/stream');
es.addEventListener('task.updated', () => loadCockpit());
es.addEventListener('cockpit.refresh', () => loadCockpit());
es.onerror = () => console.warn('[sse] reconnect…'); // navigateur réessaie tout seul
```

> ⚠️ Volontairement **non câblé sur le front** dans ce sprint : on livre la plomberie + le doc, l'activation côté UI sera S3.

---

## 5. À surveiller

- **Authentification** : si on expose le serveur hors localhost, ajouter une auth token obligatoire sur `/stream`.
- **CORS** : aujourd'hui Express n'envoie aucun header CORS — ajouter `Access-Control-Allow-Origin` si front est servi par un autre domaine.
- **Test en proxy corp Zscaler** : SSE garde une connexion HTTP ouverte → vérifier que Zscaler ne ferme pas après 60 s (sinon `EventSource` reconnecte mais on perd le heartbeat tuning).
- **Connexion zombie** : prévoir un timeout de 5 min côté serveur pour fermer les connexions sans activité.

---

## 6. Ce qui n'est pas dans le spike

- Migration Socket.IO ou ws : pas de besoin.
- Diffusion sélective par projet/groupe : pas de besoin (mono-user).
- Persist queue offline : pas de besoin (poste local).

---

## 7. Bilan time-box

| Item | Estimé | Réalisé |
|---|---|---|
| Recherche & comparatif | 0,5 j | 0,5 j ✅ |
| Prototype + tests | 1,5 j | 0,5 j ✅ (SSE plus léger qu'estimé) |
| Doc + ADR | 0,5 j | 0,5 j ✅ |
| Prévu pour WS (abandonné) | 0,5 j | — |
| **Total** | 3 j | **1,5 j** — gain 1,5 j sur le sprint |

→ Le gain de temps a été redéployé sur S2.07 (tests e2e Playwright reportés, voir suite sprint).

---

*Spike S2.10 · branche release/v0.5-s2 · 2026-04-25*
