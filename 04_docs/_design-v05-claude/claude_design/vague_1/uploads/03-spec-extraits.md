# Extraits SPEC fonctionnelle — pour Claude Design

> Sélection des sections de `04_docs/SPEC-FONCTIONNELLE-FUSION.md` strictement nécessaires à la maquette.
> Source complète disponible dans le repo.

## TL;DR du produit

aiCEO v0.5 = **un cockpit CEO local unifié** (Node + SQLite + Express + 13 pages HTML).
Tourne sur poste Windows du dirigeant Feycoil. URL unique http://localhost:3001/.
Source de vérité : SQLite serveur (zéro localStorage applicatif, ADR S2.00).
Fonctionnalités cœur : arbitrage matinal, boucle du soir, gestion tâches/agenda/revues, registres sociétés/projets/contacts/décisions, chat assistant IA avec streaming SSE.

## Workflow cible

```
Matin  → Cockpit → Carte Matin → Arbitrage 5min → Top 3 fixé → journée
Journée → Navigation libre (taches, agenda, assistant, registres)
Soir   → Carte Soir → Bilan 2min → Streak +1 → fermeture
Hebdo  → Dimanche → Revue (auto-draft Claude) → Cap S+1
```

## Critères d'acceptation MVP (extrait)

### Fonctionnel
- Cockpit unifié charge en < 1s
- Arbitrage 30 tâches en < 5min sans clic perdu
- Boucle soir < 2min
- Streak persistant
- Recherche globale `?q=` < 200ms
- Chat assistant first-token < 3s, full < 30s

### UX/UI
- Densité tenue mais aérée
- Couleurs sémantiques uniquement
- Navigation clavier complète (raccourcis : `g+a` agenda, `g+t` taches, `n` nouvelle tâche, `?` aide raccourcis)
- Aucune modal "Êtes-vous sûr ?" sauf destruction irréversible
- Toast subtil top-right pour confirmations
- Pas de skeumorphisme, pas de gradient candy, pas d'ombre 3D

### Hors scope explicite v0.5
- Pas de mobile / responsive (desktop only 1280-1920px)
- Pas de mode dark (light only, dark à V2)
- Pas de multi-langue (français only)
- Pas d'authentification (mono-user local)
- Pas d'intégrations externes Slack/Teams (V1+)

## Données — modèle simplifié

```
sociétés (4)        → ETIC, Adabu, Start, AMANI
projets (~10)       → liés à 1 société, statut, priorité, contact référent
tâches (~30)        → liées optionnellement à 1 projet, prio P0-P3, due_at,
                      eisenhower (UI/UnI/nUI/nUnI/--), ai_capable bool, source
décisions (~3)      → ouvertes / décidées / reportées, options, deadline
contacts (~15)      → équipe interne + partenaires, last-contact relatif
événements          → calendrier Outlook synchro
big_rocks (max 3)   → objectifs semaine
arbitrage_sessions  → 1 par jour
evening_sessions    → 1 par jour, humeur + énergie + top 3 demain
weekly_reviews      → 1 par semaine ISO, bilan + cap
assistant_conv      → conversations chat IA + messages liés
```

## Endpoints API — résumé

```
GET  /api/cockpit/today          agrégat principal
GET  /api/system/last-sync       fraîcheur Outlook

POST /api/arbitrage/start        propose buckets (rule-based ou LLM)
POST /api/arbitrage/commit       valide les décisions CEO
GET  /api/arbitrage/today        session du jour
GET  /api/arbitrage/history      N dernières

POST /api/evening/start
POST /api/evening/commit
GET  /api/evening/streak

GET  /api/tasks                  filtres ?project ?done ?eisenhower ?priority ?starred ?q
POST /api/tasks
PATCH /api/tasks/:id
DELETE /api/tasks/:id

GET  /api/events?week=YYYY-Www
GET  /api/weekly-reviews
POST /api/weekly-reviews/:week/draft  (auto-rédaction Claude)

GET  /api/groups                 4 sociétés
GET  /api/projects?group&status
GET  /api/projects/:id

GET  /api/contacts?q
GET  /api/decisions
POST /api/decisions/:id/recommend  (reco Claude argumentée)

GET  /api/assistant/conversations
POST /api/assistant/messages       (streaming SSE)
GET  /api/search?q                 recherche globale full-text
```
