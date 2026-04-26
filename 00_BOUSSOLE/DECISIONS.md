# DECISIONS — Architecture Decision Records (ADR léger)





---





## 2026-04-26 · S4.00 — Méthode Sprint S4 + zéro localStorage applicatif rappelé

**Contexte** : Ouverture formelle du Sprint S4 (J1 26/04/2026, démarrage immédiat sur gain -49 j de S3 — calendrier original 16/06 conservé pour traçabilité). Les sprints S2 et S3 ont livré l'ADR fondatrice S2.00 et son rappel S3.00 sur les pages migrées : SQLite serveur reste **source de vérité unique**, le front lit/écrit toujours via REST, jamais via `localStorage` (sauf préférences UI volatiles dans la clé réservée `aiCEO.uiPrefs`). Les 6 pages introduites en S4 (`assistant.html`, `groupes.html`, `projets.html`, `projet.html`, `contacts.html`, `decisions.html`) doivent appliquer la même règle dès leur première ligne.

**Décision** : **acter 4 points de méthode pour le sprint S4** :

1. **Rappel S2.00 sur les 6 nouvelles pages** — aucune n'utilise `localStorage` applicatif (conversations chat, big rocks, draft state, recherche query, filtre groupe, formulaires : tout transite par les routes REST `/api/{assistant,groups,projects,contacts,decisions}`). Seule exception tolérée : `aiCEO.uiPrefs` (zoom, dernière conversation ouverte). Vérifié par `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/{assistant,groupes,projets,projet,contacts,decisions}.html` → 0 (sauf `aiCEO.uiPrefs`).

2. **Streaming SSE pour assistant chat** — réutilise le bus EventEmitter posé S2.10 et le pattern câblé front S3.05. Backend : `POST /api/assistant/messages` push chunks `event: text\ndata: {"text":"..."}` puis `event: done\ndata: {"id":"..."}`. Cap `max_tokens 1500` par défaut. Fallback non-streaming si `ANTHROPIC_API_KEY` absente. Frontend : `fetch keepalive` + `ReadableStream` parsing chunks live, scroll auto, reconnexion exponentielle 1 s → 30 s plafond.

3. **Démos hebdo (J5 + J10)** — démo intermédiaire vendredi J5 16:00 (assistant chat live + groupes/projets), démo finale vendredi J10 16:00 (6 pages migrées + e2e vert). Format identique S2/S3 : screen-share 30 min, 0 slide, démo live.

4. **Tag `v0.5-s4` cible J+1 lundi** — posé après merge `release/v0.5-s4` → `main`, avec note de release auto-générée depuis `RELEASES` array de `04_docs/11-roadmap-map.html` (process recetté audit 25/04).

**Conséquences** :

- **Cumul v0.5 fin S4 = 80 % budget** consommé (88,4 k€ / 110 k€). Reste 21,6 k€ pour S5 (durcissement) + S6 (scellement). Marge confortable.
- **Migration UI v0.5 achevée** à fin S4 : toutes les pages legacy `01_app-web/` sont remplacées par leurs équivalents API-driven dans `03_mvp/public/`.
- **Streaming Claude SSE** : architecture mono-user mono-direction = SSE suffit. Pas de WebSocket (rejeté en S2.10 ADR). Le bus EventEmitter sert à la fois aux mutations (S3.05 task.created/updated/deleted) et aux chunks de chat (S4.01 assistant.text/done).
- **Template projet.html paramétré** (S4.05) : 10 pages `01_app-web/projets/*.html` (~550 bytes thin shells) → 1 seul fichier `03_mvp/public/projet.html` lisant `?id=`. Bénéfice maintenance majeur, audit visuel J4 sur 3 projets représentatifs pour vérifier qu'aucune spécif legacy ne se perd.
- **Recherche `?q=` contacts** (S4.06) : route S1 supporte déjà `?q=` (LIKE plein). Si latence > 200 ms en dogfood, fallback FTS5 SQLite (virtual table) en S4 sans nouvelle dépendance externe.
- **Polish service Windows** (S4.08+S4.09) : finalise la variante D adoptée en S3.10 (Startup folder shortcut). Raccourci desktop "Cockpit aiCEO" sur le Bureau du CEO + rotation logs > 10 Mo + INSTALL-WINDOWS.md consolidé. Permet le **handoff CEO pair en S5/S6** sans nouveau code spécifique.

**Vérif d'acceptance ADR** : intégrée au critère #2 du DOSSIER-SPRINT-S4 §2 (12 critères de fin de sprint).

**Sources** : `04_docs/DOSSIER-SPRINT-S4.md` §1, §2, §3 (S4.00) · ADR fondatrice `2026-05-19 · S2.00 — Zéro localStorage applicatif` (en S2 cockpit) · pattern streaming SDK Anthropic (`@anthropic-ai/sdk` v0.27, `messages.stream`).

---

## 2026-04-26 · Sprint S4 — kickoff préparé (pages portefeuille + assistant chat live + polish service)

**Contexte** : Sprint S3 livré en avance le 25/04 (cf. ADR « Sprint S3 livré » ci-dessous, −49 j vs BASELINE). Le périmètre S4 d'origine (SPEC §13 ligne 984-986) prévoyait : *"Migration pages portefeuille — groupes, projets, pages projet, contacts, décisions + Assistant chat live (WebSocket)"*. Question d'arbitrage à l'ouverture de S4 : tenir le scope d'origine sur 2 semaines confortables, ou densifier en absorbant déjà le polish service Windows (raccourci desktop + rotation logs + INSTALL-WINDOWS.md) qui était initialement S5.

**Décision** : **densifier S4 à 3 piliers** — (1) **5 pages back-office migrées API** : `groupes.html` · `projets.html` · `projet/:id.html` (10 pages legacy → 1 template paramétré) · `contacts.html` · `decisions.html`. Toutes les routes API existent depuis S1, S4 les consomme uniquement (zéro backend nouveau côté pages). (2) **Assistant chat live IA** : nouvelle table `assistant_conversations` + `assistant_messages`, route `POST /api/assistant/messages` avec **streaming Claude via SSE** (réutilise bus S2.10/S3.05). Frontend `assistant.html` migré avec scroll auto, reconnexion exponentielle 1 s → 30 s. Cap `max_tokens 1500` par défaut, fallback non-streaming si pas de clé API. (3) **Polish service Windows** : raccourci desktop "Cockpit aiCEO" sur le Bureau du CEO pointant `http://localhost:4747`, rotation `data/aiCEO-server.log` si > 10 Mo (move vers `.log.1`), `INSTALL-WINDOWS.md` consolidé (install fresh / update / uninstall / troubleshooting). 12 issues `S4.00` → `S4.11` · **10,2 j-dev sur 20 j capacité** (49 % marge dailys/retro/démos). Démarrage **lundi 16/06/2026 09:00** · démo intermédiaire **vendredi 20/06 16:00** · démo finale **vendredi 27/06 16:00** · tag cible **`v0.5-s4`** lundi 30/06.

**Conséquences** :

- **Cumul v0.5 fin S4 = 88,4 k€ / 110 k€ = 80 %** budget consommé (S1 22,1 + S2 22,1 + S3 22,1 + S4 22,1). Reste 21,6 k€ pour S5 (durcissement) + S6 (scellement). Marge confortable.
- **Migration UI v0.5 achevée** : toutes les pages legacy `01_app-web/` sont remplacées par leurs équivalents API-driven dans `03_mvp/public/`. Reste à S5 le durcissement (CI Playwright Linux + monitoring + handoff CEO pair).
- **Streaming SSE pour chat assistant** : réutilise le bus EventEmitter posé S2.10 et le pattern câblé front S3.05 (cockpit + agenda + tâches). Pas de nouveau spike. Architecture mono-user mono-direction = SSE suffit. Cap `max_tokens 1500` pour limiter latence p95 (cible first-token < 3 s, full-response < 30 s).
- **Polish service Windows en S4.08+S4.09** : finalise la variante D adoptée en S3.10 (Startup folder shortcut). Le raccourci desktop ajoute la commodité d'usage (icône Bureau du CEO). Rotation logs et `INSTALL-WINDOWS.md` consolidé permettront le **handoff CEO pair en S5/S6** (scope livrable externe couvert sans nouveau code).
- **Critères de fin S4** : 12 conditions (ADR mergée, 6 pages 200, zéro localStorage, POST assistant streaming SSE valide, latence p95 < 30 s, recherche contacts < 200 ms, filtre groupe projets, 10 IDs projet OK, raccourci desktop fonctionnel, ≥ 80 tests unitaires, ≥ 4 tests e2e back-office, doc API S4 enrichie).
- **Top 5 risques S4** identifiés avec mitigation + déclencheur : R1 streaming Claude latence p95 (Moy/P1), R2 template projet.html paramétré perd specifs legacy (Faible/P2), R3 recherche `?q=` contacts trop lente (Faible/P3), R4 raccourci desktop bloqué GPO (Moy/P3), R5 SSE chat coupé Zscaler (Moy/P2).
- **Roadmap interactive** (`04_docs/11-roadmap-map.html`) : badge Plan v0.5 fusion → "S4 KICKOFF", gate-pill "S4 KICKOFF préparé · 16 → 27 juin · assistant chat + 5 pages portefeuille + polish service", jalon `v05-s4` ajouté avec `status:"doing"`, période `juin-s2` actualisée pour mentionner S4 en cible.

**Sources** : `04_docs/DOSSIER-SPRINT-S4.md`, `04_docs/POA-SPRINT-S4.xlsx` (6 feuilles, 9 formules, 0 erreur, palette Coral Energy), `04_docs/KICKOFF-S4.pptx` (12 slides), `04_docs/_sprint-s4/scripts/gh-create-issues-s4.ps1` (12 issues UTF-8 BOM), `04_docs/11-roadmap-map.html` (jalon `v05-s4`).

---

## 2026-04-25 · Sprint S3 livré (release/v0.5-s3) — agenda + revues + SSE live + last-sync





**Contexte** : Sprint S3 cadré en avance le 25/04 (cf. ADR « Sprint S3 — cadrage 4 piliers »), démarrage planifié 02/06/2026 mais **livré complet le 25/04** par binôme CEO + Claude (~3 h chrono dogfood, vélocité bien supérieure aux hypothèses). Les 11 issues ont été traitées dans l'ordre du POA, sans Plan B activé. Smoke complet validé sur poste CEO Windows : 6/6 pages frontend HTTP 200, 4/4 endpoints API S3 200, contrainte max 3 big rocks confirmée HTTP 400, alerte cockpit `outlook_stale` active (level=critical, lastSyncAt 41 h).





**Décision** : **acter la livraison de Sprint S3** avec scellement formel — **11/11 issues closes** (`S3.00` → `S3.10`), **5 commits** sur la branche `docs/sprint-s3-kickoff` (`ce22641` → `990be37`), **75/75 tests verts** (62 hérités S3.01-S3.03 + 11 nouveaux S3.05-S3.08). Tag cible **`v0.5-s3`** posable post-merge. Le POC service Windows (S3.10) est livré en code mais le test d'install reste à effectuer en dogfood admin CEO — pas d'ADR si POC vert silencieux, ADR séparée si question structurelle.





**Conséquences** :





- **Cumul v0.5 fin S3 = 60 % budget** consommé (66,3 k€ / 110 k€). Reste 33,7 k€ pour S4-S5-S6 + amorçage V1. Marge confortable.


- **4 piliers livrés** :


  - **agenda.html migré API** (`GET /api/events/week?week=YYYY-Www&with_tasks=true`) : grille hebdo lun-dim, drag-drop natif HTML5 (pattern S2.03 réutilisé), refetch optimiste 200 ms, A11y clavier complète (aria-grabbed/aria-dropeffect, flèches + Espace).


  - **revues/index.html migré API** : Big Rocks éditables CRUD inline avec contrainte applicative max 3/sem (HTTP 400 au 4ᵉ POST, vérifié smoke), bouton « Demander brouillon Claude » → `POST /api/weekly-reviews/:week/draft`, archives 12 dernières revues, deep link `?week=YYYY-Www`.


  - **SSE câblé front** : `EventSource('/api/cockpit/stream')` sur cockpit + tâches + agenda avec reconnexion exponentielle 1 s → 30 s plafond. Bus émet sur `task.created/.updated/.deleted` depuis routes mutatrices. Smoke E2E validé sandbox + heartbeat 25 s Zscaler-safe.


  - **Outlook autosync (côté serveur)** : `GET /api/system/last-sync` lit `mtime(emails-summary.json)`, retourne `level ∈ {ok, warn>4h, critical>24h}`, alerte cockpit `outlook_stale` injectée automatiquement. Le `schtasks /sc HOURLY /mo 2` reste à poser côté CEO (admin). Endpoint `/api/system/health` complet (uptime, mem, node version).


- **Auto-draft Claude (S3.03)** : `src/llm-draft.js` agrège tâches done + sessions arbitrage/soir + big rocks → prompt système rubric 6 critères (focus / ton / 200-400 mots / sources / top 3 demain / écarts) → markdown structuré 4 sections. Fallback offline (template figé) si pas de clé API ou `?fallback=true`. Mode mock client testé.


- **Tests** : 55 (S2) → 62 (S3.01) → 64 (S3.03) → **75 (S3.10)**, durée 28 s. 14 fichiers de tests, isolation `AICEO_DB_OVERRIDE` systématique (un fichier SQLite dédié par suite, supprimé en `after`). Aucune régression sur le périmètre v0.5-s2.


- **Doc API** : `docs/API.md` enrichi de 6 sections S3 (events/week, big-rocks, weekly-reviews, auto-draft, system, SSE) avec exemples curl complets. Total 669 lignes, 38+ exemples curl actualisés.


- **POC service Windows S3.10** : `scripts/service-windows/install-service.js` (node-windows wrapper install/start/stop/uninstall) + `README.md` (critères acceptance + 6 limites identifiées) + `ADR-S3-10-template.md` à remplir si dépassement. **Test install reste à faire** en terminal admin CEO Windows (commandes documentées dans le README).


- **Schedule variance vs BASELINE** : -49 j (livré 25/04 vs planifié 13/06). Gain réinjecté en avance calendaire pure cette fois (S2 avait absorbé en densification, S3 ne pouvait pas absorber davantage). Le sprint S4 peut désormais démarrer dès que le CEO décide.


- **Tag** : `v0.5-s3` posable post-merge sur `main` via `git tag -a v0.5-s3 -m "Sprint S3 — agenda + revues + SSE live + last-sync"`.





**Sources** : branche `docs/sprint-s3-kickoff` (commits `ce22641`, `a21585c`, `bf379fb`, `013cdef`, `990be37`), `04_docs/DOSSIER-SPRINT-S3.md`, `03_mvp/docs/API.md` §S3 Extensions, `03_mvp/scripts/service-windows/`, smoke live PowerShell CEO 25/04 17:30.





---





## 2026-06-02 · S3.00 — Méthode Sprint S3 + zéro localStorage applicatif rappelé





**Contexte** : Ouverture formelle du Sprint S3 (J1 02/06/2026). Le sprint S2 a livré l'ADR fondatrice `2026-05-19 · S2.00 — Zéro localStorage applicatif` qui établit SQLite serveur comme **source de vérité unique** : le front lit/écrit toujours via REST, jamais via `localStorage` (sauf préférences UI volatiles dans la clé réservée `aiCEO.uiPrefs`). Les 2 pages introduites en S3 (`agenda.html`, `revues/index.html`) doivent appliquer la même règle dès leur première ligne, sans dérive. En parallèle, la méthode S3 doit être actée formellement avant que le code parte : 4 piliers, démos hebdo, time-box spike strict.





**Décision** : **acter 4 points de méthode pour le sprint S3** :





1. **Rappel S2.00 sur les 2 nouvelles pages** — `agenda.html` et `revues/index.html` n'utilisent **aucune** clé `localStorage` applicative (events, big-rocks, weekly-review state, drag-drop position : tout transite par les nouvelles routes REST `/api/events/week`, `/api/weekly-reviews`, `/api/big-rocks`). Seule exception tolérée : `aiCEO.uiPrefs` (zoom calendrier, semaine courante affichée par défaut). Vérifié par `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/{agenda.html,revues/index.html}` → 0 (sauf `aiCEO.uiPrefs`).





2. **Drag-drop natif HTML5** — réutilise le pattern validé en S2.03 (`arbitrage.html`) : `draggable=true` + `dragstart` / `dragover` / `drop` natifs, sans dépendance externe (pas de SortableJS ni `react-dnd`). Sur `agenda.html` : drag d'une `task-pill` depuis la rail latérale vers une cellule jour → `PATCH /api/tasks/:id { due_at }` immédiat, refetch optimiste après 200 ms.





3. **Démos hebdo (J5 06/06 et J10 13/06)** — démo intermédiaire vendredi 06/06 16:00 (S3.01 + S3.02 livrées + S3.05 SSE câblé front), démo finale vendredi 13/06 16:00 (10/10 issues closes). Format identique S2 : screen-share 30 min CEO, 0 slide, démo live sur poste CEO Windows.





4. **Tag `v0.5-s3` cible lundi 16/06** — posé après merge `release/v0.5-s3` → `main`, avec note de release auto-générée depuis `RELEASES` array de `04_docs/11-roadmap-map.html` (cf. process recetté lors de l'audit du 25/04).





**Conséquences** :





- **Cumul v0.5 fin S3 = 60 % budget** consommé (66,3 k€ / 110 k€). Marge 50 % sur le sprintage S3 (11,1 j-dev / 20 j capacité), confortable mais réinvestissable en e2e si la trame agenda+revues stabilise vite.


- **Dépendances héritées par S4** purgées : 4 piliers achevés en S3 = `assistant.html` (chat), `contacts/decisions`, `projets/groupes` peuvent démarrer S4 sans reprise de dette technique.


- **Zéro localStorage : règle systématique** pour tous les sprints à venir. Toute nouvelle page MVP applique S2.00 par défaut. La PR S3 ajoute un test unitaire dédié `tests/no-app-localstorage.test.js` (grep régression sur le bundle `public/`).


- **Spike Service Windows S3.10** : ADR séparée si POC dépasse les 1,5 j ou ouvre une question structurelle (cf. cadrage S3 du 2026-04-25 ci-dessous).





**Vérif d'acceptance ADR** : intégrée au critère #2 du DOSSIER-SPRINT-S3 §2 (10 critères de fin de sprint).





**Sources** : `04_docs/DOSSIER-SPRINT-S3.md` §1, §2, §3 (S3.00) · ADR fondatrice `2026-05-19 · S2.00 — Zéro localStorage applicatif` (à insérer en S2.00 logiquement, ou implicitement portée par les commits cockpit S2.01-S2.05) · pattern drag-drop S2.03 (`03_mvp/public/arbitrage.html`).





---





## 2026-04-25 · Sprint S3 — cadrage 4 piliers + spike Service Windows time-boxé





**Contexte** : Sprint S2 livré complet le 25/04 (cf. ADR « Sprint S2 livré » ci-dessous) avec 1,5 j de gain time-box (spike SSE bouclé en 1,5 j vs 3 j prévus). La question du périmètre S3 se pose : tenir le scope d'origine (`agenda.html` + `revues/index.html`) sur 2 semaines confortables, ou densifier S3 pour anticiper deux dettes opérationnelles connues — (a) le bus SSE prototypé en S2.10 reste **non câblé front**, (b) l'import Outlook reste **lancé manuellement par le CEO** depuis PowerShell. À cela s'ajoute une décision à prendre pour S5 : packaging Service Windows. Sans POC, le risque est de découvrir trop tard une incompatibilité COM/registry/permissions au moment du cutover.





**Décision** : **densifier S3 à 4 piliers** — (1) `agenda.html` migré API SQLite (vue hebdo lun-dim, drag-drop tâche → `due_at`), (2) `revues/index.html` migré API (Big Rocks éditables max 3/sem, auto-draft Claude rubric ≥ 5/6, archives W17+), (3) **câblage SSE front** (cockpit + tâches re-fetch < 1 s sur émission bus, reconnexion auto navigateur), (4) **Outlook autosync 2 h** via `schtasks /sc HOURLY /mo 2` + endpoint introspection `GET /api/system/last-sync` + alerte cockpit si > 4 h sans sync. **Spike S3.10 Service Windows time-boxé 1,5 j strict** (POC node-windows install/start/stop) : ADR uniquement si dépassement, pas de blocage S3 si POC échoue. 11 issues `S3.00` → `S3.10` · **11,1 j-dev sur 20 j capacité** (45 % marge dailys/retro/demos). Démarrage **lundi 02/06/2026 09:00** · demo intermédiaire **vendredi 06/06 16:00** · démo finale **vendredi 13/06 16:00** · tag cible **`v0.5-s3`** lundi 16/06.





**Conséquences** :





- **Cumul v0.5 fin S3 = 66,3 k€ / 110 k€ = 60 %** budget consommé (S1 22,1 + S2 22,1 + S3 22,1). Reste 33,7 k€ pour S4-S5-S6 + V1 amorçage. Marge confortable mais pas excessive.


- **Câblage SSE front en S3.05** : la dette technique laissée par S2.10 est purgée avant que le bus ne devienne un mort-vivant en backend. Le front re-fetch automatiquement sur événement → fin de la friction « tab A modifie, tab B ne voit pas ». Heartbeat 25 s testé Zscaler-safe poste CEO J3.


- **Outlook autosync en S3.06** : fin du lancement PowerShell manuel par le CEO matin/midi/soir. Le binôme `schtasks /create aiCEO-Outlook-Sync /sc HOURLY /mo 2` + endpoint `/api/system/last-sync` rend la fraîcheur du contexte agent IA observable et alerte le CEO si la chaîne tombe (> 4 h sans sync). Risque admin (R1 du dossier) : escaladé **issue P0 IT ETIC J1**, fallback tâche utilisateur si droits admin refusés.


- **POC Service Windows en S3.10** : prépare S5 cutover. Décision ADR si POC ouvre une question structurelle (ex. node-windows incompatible Win Server 2019, ou install MSI/NSSM préférable). Si POC vert silencieux : pas d'ADR, S5 démarre directement sur l'install pré-validée.


- **Critères de fin S3** : 10 conditions (2 pages curl 200, zéro localStorage, agenda drag-drop e2e + SQL, Big Rocks max 3/sem 400, auto-draft rubric ≥ 5/6, SSE live cockpit < 1 s, Outlook autosync planifié, `/api/system/last-sync` structuré, ≥ 65 tests unitaires, e2e P4 vert).


- **Top 5 risques S3** identifiés avec mitigation + déclencheur : R1 schtasks droits admin (Moy/P1), R2 auto-draft Claude faible (Moy/P2), R3 SSE coupé Zscaler (Faible/P2), R4 drag-drop Edge legacy (Faible/P3), R5 spike Service Windows déborde (Moy/P2).


- **Roadmap interactive** (`04_docs/11-roadmap-map.html`) : Phase 2 marquée *Livrée* (badge S2 ✓), Phase 3 marquée *En cours* (badge S3 KICKOFF), bandeau « Vous êtes ici » réécrit, jalon `v05-s3` ajouté avec `status:"doing"`, période `juin-s2` activée (`now:true`), entrées JOURNAL « livraison Sprint S2 livré (delta -37 j) » et « décision Sprint S3 — kickoff préparé ».





**Sources** : `04_docs/DOSSIER-SPRINT-S3.md`, `04_docs/POA-SPRINT-S3.xlsx` (6 feuilles, 25 formules, 0 erreur), `04_docs/KICKOFF-S3.pptx` (12 slides QA passé), `04_docs/11-roadmap-map.html` (jalon `v05-s3`, JOURNAL 25/04).





---





## 2026-04-25 · Sprint S2 livré (release/v0.5-s2) — cockpit live + rituels + spike SSE





**Contexte** : Sprint S2 cadré sur la fenêtre 19/05 → 01/06/2026, démarrage prévu lundi 19/05. Effectivement démarré et **livré complet en avance le 25/04** par binôme CEO + Claude (vélocité supérieure aux hypothèses du DOSSIER-SPRINT-S2). Les 10 issues prévues ont été traitées dans l'ordre du POA, sans bascule du Plan B (`taches.html` est resté dans le périmètre S2, pas re-décalé en S3).





**Décision** : **acter la livraison de Sprint S2** avec scellement formel : **10/10 issues closes** (`S2.00` → `S2.10`), **11 commits** sur la branche `release/v0.5-s2` (`accea60` → `6f4e6e8`), **55/55 tests verts** (49 hérités S1 + 6 nouveaux S2). PR `.github/PR-S2.md` rédigée prête à merger sur `main`. Tag cible **`v0.5-s2`** posé post-merge.





**Conséquences** :





- **Cockpit live opérationnel** : `GET /api/cockpit/today` agrège counters SQL (overdue / done today / week stats) + alertes (overdue, stale, big rocks manquants) + intention de semaine + events. Source de vérité unique côté serveur, **zéro `localStorage` applicatif** (ADR S2.00 livré).


- **Rituels matin/soir stables** : arbitrage matinal (`POST /api/arbitrage/start|commit` — top 3 P0/P1 → faire, ai_capable → déléguer, reste → reporter) + bilan du soir (`POST /api/evening/start|commit` avec validations humeur ∈ {bien, moyen, mauvais} et énergie ∈ [1,5]) + **streak persistant** dans `settings.evening.longest_streak`.


- **Modèles métier élargis** : projects/groups/contacts CRUD complet + recherche globale full-text léger sur tasks/decisions/contacts/projects. IA décisions Anthropic + fallback offline (`POST /api/decisions/:id/recommend`).


- **Documentation API** : `docs/API.md` (487 lignes, 15 sections, 38 exemples curl, smoke-test 1 commande). README mis à jour v0.5.


- **Spike SSE retenu vs WS** (ADR S2.10 livré) : mono-user, mono-directionnel, zéro dépendance, `EventSource` natif navigateur. Bus `EventEmitter` + `GET /api/cockpit/stream` + heartbeat 25 s + 3 tests realtime. **Câblage front DIFFÉRÉ S3.05** (point de dette technique acté) — WebSocket reconsidéré v0.6+ si cas bidir apparaît.


- **Time-box bénéfique** : spike S2.10 livré en 1,5 j vs 3 j estimés. Gain 1,5 j redéployé sur **S2.07** pour livrer 3 parcours e2e HTTP-boundary malgré l'impossibilité de Playwright en sandbox (Chromium infaisable).


- **Tests** : 55/55 verts via isolation `AICEO_DB_OVERRIDE` (un fichier SQLite dédié par suite, supprimé en `after`, nettoyage WAL/SHM systématique). Aucune régression sur le périmètre v0.4.


- **Schedule variance vs BASELINE** : -37 j (livré 25/04 vs planifié 01/06). Gain à réinjecter en S3 (densification 4 piliers) plutôt qu'en avance calendaire pure — la cadence 10 sem reste la cible de pilotage produit.


- **Tag** : `v0.5-s2` posé post-merge sur `main` via `git tag -a v0.5-s2 -m "Sprint S2 — cockpit live + rituels + SSE"`.





**Sources** : `.github/PR-S2.md`, branche `release/v0.5-s2` (commits `accea60` → `6f4e6e8`), `data/migrations/2026-04-25-init-schema.sql`, `docs/API.md`, `docs/SPIKE-WEBSOCKET.md`, `tests/e2e.test.js`, `tests/realtime.test.js`.





---





## 2026-05-19 · S2.00 — Port serveur aligné sur 3001 (contrat DOSSIER S2)





**Contexte** : `server.js` utilise par défaut `PORT=4747` depuis le MVP S1, mais l'ensemble des livrables S2 (DOSSIER-SPRINT-S2 §1, NOTE-CADRAGE-S2 §6, POA, KICKOFF) publie le contrat dogfood à `http://localhost:3001`. Tant que le code par défaut diverge des docs, chaque CEO pair / dev découvre un faux problème dès l'onboarding.





**Décision** : abaisser le default `PORT` de `server.js` à **3001**, propager dans README, DEMARRER-WINDOWS et ONBOARDING-DEV. La variable `PORT` reste surchargeable via `.env` pour conserver la flexibilité ops. Les docs S1 historiques (RUNBOOK-OPS, SPRINT-S1-RECETTE) sont laissées en l'état — elles documentent l'historique, pas le contrat actif.





**Conséquences** :


- `npm start` ouvre désormais directement la cible dogfood `localhost:3001` documentée partout dans S2.


- Migration zéro pour le CEO : `.env` non versionné, donc s'il avait surchargé à 4747 il garde son setup. S'il n'a pas de `.env`, il bénéficie automatiquement du nouveau défaut.


- **Pré-requis levé** pour S2.01 (cockpit endpoint) et S2.07 (Playwright e2e qui ciblent `localhost:3001`).





**Sources** : `03_mvp/server.js` (commit `S2.00`), `04_docs/DOSSIER-SPRINT-S2.md §1.1`, `04_docs/_sprint-s2/NOTE-CADRAGE-S2.md §6`.





---





## 2026-04-25 · Sprint S2 — périmètre élargi à `taches.html` (4 pages au lieu de 3)





**Contexte** : Sprint S1 livré ce 25/04 (tag `v0.5-s1`, 14 tables SQLite, 41 routes REST, 23/23 tests verts) avec **~2 jours d'avance** sur la planche initiale (cible 9 mai), grâce au pivot `node:sqlite` qui a supprimé la friction `better-sqlite3` + au dogfood CEO démarré dès le 22/04 (4 jours, 0 incident bloquant). En préparation du kickoff S2 (DOSSIER-SPRINT-S2.md, POA-SPRINT-S2.xlsx, KICKOFF-S2.pptx), la question du périmètre se pose : tenir le scope d'origine (3 pages : `index.html` · `arbitrage.html` · `evening.html`) en 2 semaines confortables, ou absorber en S2 la page `taches.html` initialement prévue en S3.





**Décision** : **élargir le Sprint S2 à 4 pages** — `index.html` (cockpit unifié) + `arbitrage.html` (matin) + `evening.html` (soir) + **`taches.html` (inbox CRUD)**. La capacité S2 reste 20 j-dev (binôme CEO + Claude × 2 semaines), la charge cible passe à **19,5 j-dev** (10 issues `S2.01` → `S2.10`), soit 97,5 % d'occupation — la marge de 0,5 j sert de coussin pour les revues. Démarrage **lundi 19/05/2026 09:00** · démo finale **vendredi 30/05 16:00** · tag cible **`v0.5-s2`** lundi 02/06.





**Conséquences** :





- **S3 allégé** : ne reste plus en S3 que `agenda.html` (vue hebdo Outlook) + `revues/` (W17 widget). S3 redevient une fenêtre confortable (12 j-dev cible / 20 capacité), ce qui crée une **provision pour absorber un éventuel retard S2**.


- **Plan B explicite** : si dérive ≥ 1 j cumulée constatée **vendredi 23/05 (mid-sprint S2)**, la page `taches.html` est **re-décalée en S3** sans drama. Backlog S2 retombe à 16 j-dev (les 7 issues sur 3 pages historiques). S3 redevient 16 j-dev (taches + agenda + revues). Pas de perte calendaire — uniquement une re-séquentialisation.


- **Budget S2** : **22,1 k€** (20 % de l'enveloppe 110 k€) **inchangé** — l'élargissement de périmètre ne consomme pas plus de ressources, il consomme la marge de productivité dégagée par S1.


- **Marge S1 dogfood (0 €)** : les 4 jours de dogfood CEO 22/04 → 25/04 n'ont rien coûté en dev externe (binôme CEO + Claude, internalisation actée). Cette « marge invisible » est ré-investie en absorption de scope, pas en cash.


- **Critères de scellement v0.5** : les 9 critères 3×3 (produit / boucles / dette) restent **inchangés** — `taches.html` était déjà dans le périmètre v0.5 final, on n'ajoute rien, on avance le séquencement.


- **Issues GitHub** : 10 issues `S2.01` → `S2.10` ouvertes au démarrage S2 (ventilation : 2 issues plomberie API SQLite, 3 issues `index.html`, 2 issues `arbitrage.html`, 1 issue `evening.html`, 2 issues `taches.html`).


- **Roadmap interactive** (`04_docs/11-roadmap-map.html`) : Phase 1 marquée *Livrée* (badge S1 LIVRÉ ✓), Phase 2 marquée *En cours* (badge S2 EN COURS), bandeau « Vous êtes ici » réécrit, jalon `v05-s2` ajouté avec `status:"doing"`, période `mai-s3` activée (`now:true`), entrée JOURNAL « décision · Sprint S2 — kickoff préparé · périmètre élargi à `taches.html` ».





**Sources** : `04_docs/DOSSIER-SPRINT-S2.md`, `04_docs/POA-SPRINT-S2.xlsx`, `04_docs/RELEASE-NOTES-v0.5-s1.md`, `04_docs/11-roadmap-map.html` (jalon `v05-s2`, JOURNAL 25/04).





---





## 2026-04-25 · v0.5 internalisée — exécution CEO + Claude, pas de dev externe





**Contexte** : juste après le GO ExCom inconditionnel (ADR ci-dessous), le CEO décide de pivoter le mode d'exécution. Plus de sourcing externe ni de freelances : **la v0.5 sera produite intégralement en binôme CEO (PO) + Claude (équipe dev)**, dans la même dynamique que le MVP Node, l'app web Twisty et l'ensemble du dossier GO/NO-GO.





**Décision** : **internalisation totale de l'exécution v0.5**. L'enveloppe 110 k€ (105,3 k€ dev + 0,9 k€ infra + 3,7 k€ provision) est *neutralisée* pour la masse salariale dev externe. Reste mobilisable sur fonds propres ETIC : ~4,6 k€ pour infra + provision (Anthropic API, hébergement éventuel, outillage). Le ramp-up dev est porté en interne, à coût marginal Anthropic API uniquement.





**Conséquences** :





- **Budget effectif v0.5** : ~4,6 k€ (infra + provision) au lieu de 110 k€. Économie de fonds propres ~105 k€ disponible pour V1/V2 ou autre poste ETIC.


- **Calendrier** : structure 6 sprints / 10 semaines / fenêtre 5 mai → 14 juillet **conservée** comme cadence de pilotage produit (pas de raison de la modifier — elle reflète la complexité fonctionnelle, pas la masse salariale).


- **Gouvernance** : revues ExCom mid-sprint maintenues sur **livrables et qualité** (pas sur décaissement). Trigger ExCom « décaissement > 80 k€ » devient sans objet.


- **Critères GO** : #2 « équipe sourcée » devient sans objet ; les 4 autres restent (trésorerie infra confirmée, périmètre verrouillé, plan contingence, calendrier). Critère #2 est *remplacé* par : **disponibilité CEO confirmée sur la fenêtre 5 mai → 14 juillet** (capacité à dégager les créneaux PO/test).


- **Critères NO-GO** : « sourcing impossible » devient sans objet. Les 3 autres restent.


- **Critères de scellement v0.5** : 9 critères 3×3 (produit / boucles / dette) **inchangés** — c'est le produit qui est jugé, pas l'organisation.


- **Tâches caduques** : #189 (DAF débloque 110 k€), #190 (sourcing 2 dev), #191 (contrats freelance) — annulées.


- **Tâche maintenue** : #192 (kickoff S1) — recadrée en kickoff binôme CEO + Claude.


- **Roadmap** : `v05-go` reste *Done* (la décision est prise) ; description mise à jour pour refléter l'internalisation.





**Sources** : ADR « GO ExCom v0.5 » et « Gouvernance GO/NO-GO v0.5 » ci-dessous.





**Cadrage opérationnel acté** :


- **Démarrage Sprint S1 : maintenant (25 avril 2026)**, S1 court 25/04 → 9 mai. Pas d'attente — pas de contractualisation à faire. La cadence 10 sem v0.5 se rejoue, livraison cible **début juillet 2026** (au lieu du 14 juillet).


- **Cible de code : `03_mvp/` évolue en place** — on capitalise sur le MVP Node existant (Express + Claude arbitrage + Outlook COM + boucle du soir + drafts). L'app web statique `aiCEO_Agent/` (5 journey maps + 13 pages cockpit) devient *référence UX à absorber* dans le MVP qui se transforme en app unifiée Twisty. Pas de dossier `03_app-unifiee/` séparé.





---





## 2026-04-25 · GO ExCom v0.5 — 110 k€ engagés, kickoff 5 mai





**Contexte** : dossier GO/NO-GO v0.5 (cf. ADR « Gouvernance GO/NO-GO v0.5 » ci-dessous) soumis à ExCom le 25/04/2026. Décision attendue avant le 5 mai pour démarrer sprint S1.





**Décision** : **GO. ExCom valide l'engagement de 110 k€ fonds propres ETIC sur la fenêtre 5 mai → 14 juillet 2026** (10 semaines, 6 sprints, 2,6 ETP). Ventilation 110 k€ = 105,3 k€ dev (2,6 ETP × 10 sem × 4,5 j × 900 €) + 0,9 k€ infra + 3,7 k€ provision. Sprint S1 (cadrage périmètre + scaffold app unifiée + SQLite 13 tables + Service Windows + adaptateur Outlook COM) démarre le 5 mai 2026.





**Conditions actées** : à compléter par CEO si ExCom a posé des conditions (sourcing dev validé, périmètre amendé, points d'étape supplémentaires, etc.). Par défaut : conditions du dossier (5 critères GO cumulatifs, 4 NO-GO suffisants, plans contingence A/B/C, 9 critères de scellement v0.5, trigger ExCom mid-sprint si décaissement > 80 k€) restent en vigueur.





**Conséquences** :


- **Trésorerie** : DAF débloque la ligne 110 k€ fonds propres ETIC.


- **Sourcing** : lancement immédiat recherche 2 dev fullstack senior 900 €/j (Node/SQLite/Windows + Twisty DS).


- **Contrats** : préparation contrats freelance pour signature avant 5 mai.


- **Gouvernance** : revue ExCom mid-sprint (sprint S3, ~mi-juin) systématique ; trigger anticipé si décaissement > 80 k€ atteint.


- **Roadmap** : jalon `v05-go` passé en *Done* sur la roadmap interactive (`04_docs/11-roadmap-map.html`), `v05-s1` ouvert pour 5 → 19 mai.





**Sources** : `04_docs/DOSSIER-GO-NOGO-V05.md`, `04_docs/POA-V05.xlsx`, `04_docs/KICKOFF-V05.pptx`, ADR « Gouvernance GO/NO-GO v0.5 » ci-dessous.





Une entrée par décision débattue ≥ 30 minutes. Les micro-arbitrages vont dans les messages de commit.





Format :


- **Date · Titre court**


- Contexte, options, décision, conséquences


- Pas de retour en arrière sans un nouvel ADR qui annule





---





## 2026-04-25 · Gouvernance GO/NO-GO v0.5 (110 k€, 5 mai → 14 juillet)





**Contexte** : la fusion app-web ↔ MVP a été décidée le 24/04 (ADR ci-dessous), mais sans cadre formel d'engagement budgétaire. La trajectoire 18 mois (1,69 M€) part en mai avec v0.5 (110 k€, 10 semaines, 2,6 ETP, 6 sprints). ETIC Services a besoin d'une décision ExCom formelle avant le 5 mai pour : (a) débloquer la trésorerie en fonds propres, (b) sourcer 2 dev fullstack senior 900 €/j, (c) signer les contrats freelance. Risques connus : pont jetable v0.5→V1 (~30 % de code à réécrire en PowerShell COM), dépendance Anthropic mono-LLM, modèle économique encore externe au produit. Audience interne ExCom uniquement, pas d'investisseur externe à ce stade.





**Options étudiées** (par dimension) :





- **Forme de la décision** : email simple CEO → ExCom, présentation orale en réunion, ou **dossier formel + annexes financières + slide kickoff**.


- **Niveau d'engagement** : engager v0.5 + V1 + V2 d'un bloc (1,1 M€, irréversible), engager v0.5 seule + revue à mi-parcours + GO/NO-GO V1 conditionnel, ou **engager v0.5 + critères de scellement formels en sortie de v0.5 qui conditionnent l'ouverture de V1**.


- **Critères GO** : informels au jugement CEO, formels mais évaluables a posteriori, ou **5 critères formels cumulatifs évaluables avant le 4 mai** (équipe sourcée, trésorerie confirmée par DAF, périmètre verrouillé, plan contingence rédigé, calendrier rebasé).


- **Critères NO-GO** : aucun explicite, ou **4 critères suffisants déclencheurs** (tout en cause sourcing, trésorerie, scope creep, gouvernance).


- **Plan contingence** : "on avise" si NO-GO, ou **3 plans A/B/C documentés** (A : différer 4 sem, B : périmètre réduit 70 k€ sur 8 sem, C : abandon).


- **Critères de scellement v0.5** : informels, ou **9 critères 3×3** (produit unifié 13 pages / boucle matin-soir + agenda + revues / 0 dette critique) tagués v0.5.0 qui conditionnent l'ouverture du sprint V1.


- **Trigger ExCom mid-sprint** : aucun, ou **alerte si décaissement cumulé > 80 k€ avant fin Sprint 3** (≈ trajectoire worst-case).





**Décision** : bundle cohérent sur 7 dimensions, formalisé en 3 livrables.


1. **Forme = dossier formel + 2 annexes** — `04_docs/DOSSIER-GO-NOGO-V05.md` (pièce maîtresse, 9 sections, audience ExCom) + `04_docs/POA-V05.xlsx` (ventilation 110 k€ + trésorerie 12 mois + sensibilité 3 scénarios) + `04_docs/KICKOFF-V05.pptx` (14 slides, présentation ExCom 04/05).


2. **Engagement v0.5 seule + revue mi-parcours** — engagement 110 k€ ferme sur v0.5 (mai-juillet 2026). V1 (290 k€) reste conditionnel à GO formel fin juillet selon critères de scellement v0.5.


3. **5 critères GO formels cumulatifs** (les 5 doivent être verts avant le 4 mai pour engagement) :


   1. Trésorerie ETIC ≥ 110 k€ confirmée DAF avant 30/04.


   2. 2 dev fullstack senior sourcés et contrats freelance signés avant 02/05.


   3. Périmètre 13 pages cibles verrouillé (pas de scope creep ajouté en kickoff).


   4. Plan contingence A/B/C rédigé et acté en ExCom.


   5. Calendrier réel rebasé (dates précises 05/05 → 14/07/2026).


4. **4 critères NO-GO suffisants** (un seul déclenche NO-GO) :


   1. Sourcing dev impossible au 02/05 (aucun candidat ou glissement à 19/05 inacceptable).


   2. Trésorerie < 110 k€ ou décision DAF reportée au-delà du 30/04.


   3. Scope creep > 15 % en kickoff (ajout de pages V1 dans v0.5).


   4. Gouvernance bloquante (désaccord ExCom non résolu).


5. **Plan contingence A/B/C documenté** — A : différer 4 sem (kickoff 02/06, livraison 11/08), B : périmètre réduit 70 k€ sur 8 sem (8 pages au lieu de 13, sans pages projet/groupes), C : abandon v0.5 + retour app-web statique + MVP CLI uniquement.


6. **9 critères de scellement v0.5** (tag `v0.5.0` conditionnel à 9/9) — Produit unifié : 13 pages servies / 1 stack Node+SQLite / 1 service Windows opérationnel. Boucles : matin Claude / soir bilan / agenda hebdo / revue hebdo / délégation IA. Dette : 0 erreur P0 ouverte / 0 page Twisty restante / migration localStorage→SQLite finalisée.


7. **Trigger ExCom mid-sprint 3** — alerte automatique si décaissement cumulé > 80 k€ avant fin Sprint 3 (mi-juin), réunion ExCom convoquée sous 5 jours pour décider continuité ou bascule plan B.





**Conséquences** :


- 3 livrables produits : `04_docs/DOSSIER-GO-NOGO-V05.md` (≈ 5-8 pages, 9 sections), `04_docs/POA-V05.xlsx` (3 onglets : Ventilation + Trésorerie 12 mois + Sensibilité Best/Base/Worst), `04_docs/KICKOFF-V05.pptx` (14 slides, palette Twisty, audience ExCom interne).


- 3 chiffres consolidés alignés sur les 3 livrables : **110 k€ total** (95,7 % dev / 0,8 % infra / 3,4 % provision risque) · **fonds propres ETIC 100 %** (pas de tour externe à ce stade) · **sensibilité ±15 % à +22 %** (best 95 k€ / base 110 k€ / worst 134 k€).


- Calendrier décision : DAF 28/04, sourcing confirmé 30/04, contrats signés 02/05, **ExCom décision 04/05**, kickoff Sprint 1 le 05/05 à 09:00.


- ADR rédigé et versionné dans `00_BOUSSOLE/DECISIONS.md` (cette entrée) + journal roadmap mis à jour dans `04_docs/11-roadmap-map.html`.


- Sprint 1 ready-to-fire : 8 prérequis listés dans le dossier §7 (trésorerie, sourcing, contrats, branche `release/v0.5`, schéma SQLite figé, périmètre verrouillé, agenda kickoff, accès Anthropic API).


- Parqués explicitement : tour externe BA/VC (V2+ post-scellement v0.5 + V1), engagement V1 ferme (conditionnel à GO scellement fin juillet 2026), pricing externe (V2+ post-validation pair CEO), localisation EN (V3+).


- **Interdit** : modifier rétroactivement les 5 critères GO ou les 9 critères de scellement sans ADR explicite annulant celui-ci. Tout dépassement worst-case (134 k€) doit déclencher trigger ExCom même si décaissement cumulé n'a pas encore franchi 80 k€.


- Suite : si GO le 04/05 → exécution Sprint 1 dès 05/05, revue de scellement formelle fin juillet 2026 avec 9 critères évalués pour décider GO V1.





---





## 2026-04-24 · Pipeline tokens DS → CSS + maintien unifié





**Contexte** : audit §P2-7/P2-8 + S2 typographie → coût caché des "3 silos indépendants" (Claude Design ↔ Cowork ↔ GitHub) : chaque modif de token descend en ~1 h de coordination manuelle, sans chemin type documenté ni source machine-lisible. S2 a figé Fira Sans mais n'a formalisé ni le format source des tokens, ni le script d'export, ni le déclencheur. En parallèle, S3 (drafts) et S6 (livrables dev) ont chacune déposé une règle "maintien continu + audit trimestriel" qu'il fallait mutualiser une seule fois.





**Options étudiées** (par dimension) :





- **Format source** : CSS canonique hand-written (statu quo), **`tokens.json`** machine-lisible + CSS généré, ou Style Dictionary (Amazon, multi-plateformes).


- **Outil d'export** : **script Node maison** (~60 lignes, zéro dépendance), Style Dictionary, ou PostCSS plugin.


- **Déclencheur** : **manuel** (`npm run ds:export`), pre-commit Husky, ou GitHub Action.


- **Portée tokens** : couleurs + typo uniquement, **couleurs + typo + espacements + radii + shadows + gradients** (primitives atomiques), ou tout y compris composants applicatifs.


- **Gouvernance** : chemin type seul dans GOUVERNANCE.md, chemin type + règle maintien unifiée, ou **chemin type + règle unifiée + calendrier trimestriel figé**.





**Décision** : bundle cohérent sur 5 dimensions.


1. **`02_design-system/tokens.json` = source canonique** — JSON minimal, structure `{ $meta, fonts.faces, vars }`. `colors_and_type.css` devient **en partie généré** : bloc entre marqueurs `/* === GENERATED FROM tokens.json === */` ... `/* === END GENERATED === */` réécrit par script, section "Semantic type roles" en queue reste hand-written.


2. **Script Node maison** (`02_design-system/scripts/export.js`, ~90 lignes ESM, zéro dépendance) — lit `tokens.json`, rend `@font-face` + `:root { --token: value; }`, réécrit le bloc généré dans `colors_and_type.css`, pousse une copie identique vers `03_mvp/public/assets/colors_and_type.css`. Commande : `npm run ds:export`.


3. **Déclencheur manuel maintenant, Husky en Sprint 3 v0.5** — `npm run ds:export` sur chaque commit qui touche `tokens.json`. Pre-commit hook Husky parqué dans Issue `infra/ds-export-pre-commit-hook`, exécution Sprint 3 v0.5 (quand la stack Husky + tests arrive per SPEC-FUSION §9).


4. **Tokens atomiques complets** — couleurs + typo (families, scale, line-heights, tracking, weights) + espacements + radii + shadows + gradients. Frontière claire : **tokens = primitives atomiques** (générés), **composants = compositions** (`app.css`, `product.app.css`, `portlet`, `coach-strip`, `ai-card`, `chip` — restent CSS manuel et consomment les tokens).


5. **Gouvernance triple** — chemin type 7 étapes dans `GOUVERNANCE.md` (exploration Claude Design → export `tokens.json` → `ds:export` → preview → diff + commit → PR + revue CEO si structurant → close Issue) + section **"Maintien des livrables : continu + audit trimestriel"** mutualisée (drafts S3 + livrables dev S6 + DS S7) + **calendrier trimestriel figé** (Q2 24/07/2026, Q3 24/10, Q4 24/01/2027, Q1 24/04/2027 ; 3 issues `audit/drafts` + `audit/livrables-dev` + `audit/ds` à chaque date, délai 10 jours ouvrés, label `type/audit-trimestriel`).





**Conséquences** :


- 6 livrables produits : `02_design-system/tokens.json`, `02_design-system/scripts/export.js`, `02_design-system/package.json` (script `ds:export`), patch `02_design-system/colors_and_type.css` (marqueurs GENERATED ajoutés), gros patch `00_BOUSSOLE/GOUVERNANCE.md` (chemin type + règle unifiée + calendrier), patch `04_docs/07-design-system.md` §2.3 (source canonique = `tokens.json`).


- Coût caché "3 silos" transformé en **chemin mécanique** : ~1 h de coordination manuelle → ~15 min (export JSON → `npm run ds:export` → diff → commit).


- Trois règles S3+S6+S7 "maintien continu + audit trimestriel" **mutualisées une seule fois** dans GOUVERNANCE.md — plus de redite en trois endroits.


- Parqués explicitement : pre-commit Husky (Issue `infra/ds-export-pre-commit-hook`, Sprint 3 v0.5), Style Dictionary (V2+ si multi-plateformes), export auto Claude Design → tokens.json (plafond structurel Claude Design sans API), GitHub Action auto-commit CSS (V1+ quand on dépasse le local).


- Auto-déclencheur des 3 issues trimestrielles prévu en v0.5 via Service Windows tâche planifiée (cf. SPEC-FUSION §7). D'ici là : tâche manuelle marquée dans l'agenda CEO.


- **Interdit** : éditer à la main le bloc entre marqueurs `GENERATED` dans `colors_and_type.css` (écrasé sans avertissement à la prochaine exécution `ds:export`).


- S8 validera que `npm run ds:export` régénère bien le CSS sans régression visuelle (diff pré/post première exécution doit être minimal ou vide), et auditera la cohérence tokens ↔ preview ↔ 03_mvp.





---





## 2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook





**Contexte** : audit de cohérence §P1-5 — audience CTO/dev interne couverte à ~70 %, trois manques : pas d'onboarding dev structuré, pas de spec OpenAPI 3.0, pas de runbook ops. Équipe v0.5 confirmée en S4 (2 fullstack arrivent 05/05) → besoin P0 de rendre les devs productifs à J+2.





**Options étudiées** (par dimension) :





- **Format** : monolithique, éclaté OSS 3 fichiers (ONBOARDING + CONTRIBUTING + RUNBOOK), ou **éclaté minimal** 2 fichiers.


- **OpenAPI** : hand-written depuis SPEC-FUSION §6, généré depuis code v0.5, ou **hybride** (hand-written maintenant, bascule vers généré en Sprint 3-4).


- **Portée runbook** : minimal (pannes vécues), exhaustif (anticipation V1+), ou **minimal vivant** (règle : chaque panne diagnostiquée → entrée runbook).


- **Stockage** : tout `04_docs/`, tout `03_mvp/`, ou **hybride par nature** (doc dev dans `03_mvp/docs/` + pointeurs dans `04_docs/00-README.md`).


- **Maintien** : par sprint, trimestriel, ou **continu + audit trimestriel** (pattern S3).





**Décision** : bundle cohérent sur 5 dimensions.


1. **Éclaté minimal** — 2 fichiers (`ONBOARDING-DEV.md` + `RUNBOOK-OPS.md`), pas de `CONTRIBUTING.md` tant que l'équipe reste < 4 personnes.


2. **OpenAPI hybride** — `openapi.yaml` hand-written dérivé de `SPEC-TECHNIQUE-FUSION.md` §6 produit en S2 du plan audit (12/05 → 18/05), puis bascule vers génération depuis code en Sprint 3-4 v0.5 (Zod + zod-to-openapi).


3. **Runbook minimal vivant** — démarre avec 5-8 modes de panne connus, règle explicite en tête : chaque panne diagnostiquée en prod → entrée runbook dans le sprint en cours.


4. **Stockage hybride** — `03_mvp/docs/` pour les 3 fichiers (co-évolution avec le code), pointeurs dans `04_docs/00-README.md` + `SPEC-TECHNIQUE-FUSION.md` §6 pour découvrabilité.


5. **Maintien continu + audit trimestriel** — règle mutualisée avec les drafts S3 dans `GOUVERNANCE.md` (patch prévu S7).





**Conséquences** :


- 2 squelettes créés maintenant : `03_mvp/docs/ONBOARDING-DEV.md` + `03_mvp/docs/RUNBOOK-OPS.md`.


- `openapi.yaml` parqué en sprint production S2 plan audit (12/05 → 18/05), ~1,5 j de travail doc.


- Issue GitHub à ouvrir manuellement : `infra/openapi-generated-from-code` (scope MVP, priorité P1, exécution Sprint 3-4 v0.5).


- Parqués explicitement : `CONTRIBUTING.md` séparé (ré-ouverture si contractor V2+), `ONBOARDING-DEV-EXTERNE.md` (post-V2), runbook exhaustif (contre-indiqué par règle vivante).


- S7 devra intégrer la règle "maintien continu + audit trimestriel" dans `GOUVERNANCE.md` (à mutualiser avec drafts S3).


- S8 devra valider que les 3 livrables dev restent cohérents avec `SPEC-TECHNIQUE-FUSION.md`.





---





## 2026-04-24 · Fusion app-web ↔ MVP en produit unifié





**Contexte** : deux sous-projets en parallèle — `01_app-web/` (SPA vanilla JS + localStorage, 13 pages cockpit Twisty v4) et `03_mvp/` (Node Express + Claude API + JSON files, flux matin/soir/délégation). La frontière est devenue floue (doublons pages, double source de vérité sur les données, deux stacks à maintenir).





**Options étudiées** :


- (A) Garder les deux séparés indéfiniment (app-web = vitrine statique, MVP = copilote)


- (B) **MVP absorbe app-web** — le serveur Node sert les pages de cockpit, SQLite remplace localStorage + JSON, un seul produit à la fin


- (C) App-web absorbe MVP (flux IA côté client via appels API directs) — pas viable pour OAuth Graph, secrets, données lourdes





**Décision** : B. Le MVP absorbe l'app-web. Vanilla JS conservé côté client (pas de refactor SolidJS maintenant, F17 muté). Migration des 13 pages cockpit dans `03_mvp/public/`, SQLite via `better-sqlite3` pour tout (groupes, projets, tâches, décisions, contacts, semaines, big rocks, sessions matin/soir), mise à plat des 21 pages en 13 pages cibles.





**Conséquences** :


- Arrêt de l'évolution isolée de `01_app-web/` — gel au niveau actuel, basculé en référence visuelle.


- Migration one-shot des données localStorage + JSON vers SQLite (script dédié avec backup/rollback).


- Refonte des assets : un seul `app.css` et une seule `data.js` côté `03_mvp/public/`.


- Specs détaillées : `04_docs/SPEC-FONCTIONNELLE-FUSION.md` et `04_docs/SPEC-TECHNIQUE-FUSION.md` (issues GitHub P0 ouvertes).


- La trajectoire MVP → V1 → V2 → V3 reste valable (Service Windows, Graph API, Chrome extension en V1+).





---





## 2026-04-24 · Backlog xlsx → GitHub Issues (source de vérité)





**Contexte** : `04_docs/09-backlog.xlsx` contenait 78 items (42 features F1-F42, ~35 tactiques, 1 epic infra) répartis sur 7 onglets (README, Backlog, Roadmap, KPIs, Budget, Risques). Double gestion (xlsx local + roadmap HTML + discussions Cowork) = dérives permanentes.





**Options étudiées** :


- (A) Garder xlsx comme backlog vivant


- (B) **Migrer vers GitHub Issues** avec 29 labels (`lane/*`, `type/*`, `priority/*`, `status/*`, `phase/*`, `scope/*`) et 4 milestones (MVP, V1, V2, V3)


- (C) Outil externe (Linear, Jira)





**Décision** : B. GitHub Issues devient la source unique du backlog. Script PowerShell `_scratch/setup-github-issues.ps1` (ASCII, ExecutionPolicy Bypass) exécuté le 24/04 : 78 issues créées dans `feycoil/aiCEO`, liées aux milestones + labels.





**Conséquences** :


- Le xlsx est archivé (`_archive/2026-04-backlog-initial/`). Plus aucune source parallèle.


- Tout nouveau besoin produit = nouvelle Issue (pas de TODO dans le code).


- `04_docs/08-roadmap.md` doit être mis à jour pour pointer vers les milestones GitHub (plus vers l'xlsx).


- Le script PowerShell est archivé avec la migration.





---





## 2026-04-24 · Restructuration en aiCEO/ unifié





**Contexte** : deux dossiers séparés (`aiCEO_Agent/` + `aiCEO_Design_System/`), fichiers orphelins, pas de versioning, pas de distinction draft / livrable.





**Options étudiées** :


- (A) Laisser en l'état, documenter les conventions


- (B) Fusionner dans une arborescence numérotée 00_BOUSSOLE / 01..06 + zones `_drafts/` `_archive/` `_scratch/`


- (C) Fusionner mais sans numérotation (arborescence plate par domaine)





**Décision** : B. La numérotation force l'ordre de lecture, rend le dossier auto-documenté, et sépare clairement ce qui est canonique (01-06) de ce qui est en maturation (`_drafts/`) ou historique (`_archive/`).





**Conséquences** :


- Tous les chemins internes changent. À corriger : liens dans `04_docs/10-exec-deck.pptx` (pointe vers anciens chemins ?), scripts MVP qui lisent `../assets/data.js` → devient `../01_app-web/assets/data.js`.


- Les scripts manuels (raccourcis Windows, start.bat) doivent être revus.





---





## 2026-04-24 · GitHub sur compte perso privé (pas orga ETIC)





**Contexte** : besoin d'un versioning + source de vérité. Choix entre compte personnel GitHub et organisation ETIC.





**Options étudiées** :


- (A) Perso privé


- (B) Orga ETIC Services privée





**Décision** : A. Plus rapide à mettre en place, pas de permissions à régler. Transférable vers l'orga ETIC ultérieurement si le produit est adopté par l'entreprise.





**Conséquences** :


- Propriété intellectuelle temporairement sur le compte perso. À clarifier si le produit devient un livrable ETIC officiel.





---





## 2026-04-22 · Outlook COM plutôt que Microsoft Graph





**Contexte** : besoin d'ingérer les mails pour enrichir le contexte d'arbitrage.





**Options étudiées** :


- (A) COM local via PowerShell — Outlook doit être ouvert


- (B) Microsoft Graph avec enregistrement Azure AD





**Décision** : A pour le MVP. Pas de setup Azure, pas de consentement admin, pas d'OAuth. Outlook est déjà ouvert sur le poste.





**Conséquences** :


- Dépendance à Outlook lancé pour ingérer


- Les données ne quittent pas le poste (bon pour la confidentialité)


- Graph à prévoir pour V2+ quand on aura l'envoi natif de mails





---





## 2026-04-22 · REPORTER sans plafond dans l'arbitrage





**Contexte** : sur 20 tâches, Claude renvoyait parfois 3/2/12 ou forçait dans un des 3 paniers. Il "perdait" des tâches en fin de liste.





**Options étudiées** :


- (A) Garder 3/2/3 strict → oblige Claude à trancher, risque de perdre les petites


- (B) FAIRE ≤ 3, DÉLÉGUER ≤ 2, REPORTER absorbe tout le reste





**Décision** : B. Aucune tâche n'est perdue. La colonne REPORTER peut contenir 20+ items, c'est le journal du jour.





**Conséquences** : UI adaptée (scroll dans REPORTER), règle affichée « 0 tâche perdue » comme engagement produit.





---





## 2026-04-24 · Trajectoire produit : local-first comme pont jetable vers cloud V1+, avec continuité d'usage CEO





**Contexte** : l'audit de cohérence du 24/04 (`04_docs/AUDIT-COHERENCE-2026-04-24.md`, dissonance C1) a mis en évidence trois narratifs concurrents — `01-vision-produit.md` promet un copilote cloud SaaS multi-CEO, les specs fusion (`SPEC-*-FUSION.md`) décrivent une app Node **locale Windows mono-poste**, et le code livré v0.4 est local. Il fallait trancher : local-first est-il un pont, la destination, ou faut-il accélérer le cloud dès v0.5 ? Atelier de cohérence, Session 1 (`04_docs/_atelier-2026-04-coherence/sessions/S1-narratif-produit.md`).





**Options étudiées** :


- (A) **Pont jetable** : v0.4/v0.5 local, rebascule cloud en V1 (Supabase + Graph + Inngest)


- (B) **Destination locale souveraine** : v0.5 → V3 local, positionnement "copilote qui ne quitte jamais le poste"


- (C) **Accélération cloud** : skip SQLite locale, v0.5 déjà cloud





**Décision** : **A — pont jetable, avec contrainte forte de continuité d'usage CEO**.





Deux motifs :


1. Conforme aux specs fusion déjà rédigées (10 sprints S1-S8), aucun chantier supplémentaire.


2. La bascule cloud V1 était déjà implicite dans la roadmap ; on l'explicite comme choix assumé, pas comme dérive.





**Contrainte ajoutée par le CEO (irréversible sauf nouvel ADR)** :


Le CEO **ne doit pas perdre l'usage** pendant la phase fusion v0.5 ni pendant la bascule cloud V1. Il doit pouvoir **tester toutes les fonctionnalités et produire du retour d'usage en continu**, pas par à-coups.





Conséquences opérationnelles de la contrainte :


- **Fusion v0.5 progressive, pas big-bang** : chaque sprint S1-S8 livre une fonctionnalité utilisable de bout en bout (pas un palier technique invisible). Le MVP v0.4 reste opérationnel jusqu'à parité atteinte par le nouveau code.


- **Mode parallèle obligatoire** : pendant la transition, l'ancien MVP (port 4747 + JSON) et le nouveau (fusion + SQLite) cohabitent sur le poste. Le CEO bascule fonction par fonction, pas d'un coup.


- **Rollback à chaque étape** : chaque migration (données, schéma, endpoint) doit pouvoir revenir en arrière en moins de 10 minutes, sans perte de décisions prises entre-temps.


- **Parité fonctionnelle avant bascule finale** : pas d'arrêt de v0.4 tant que v0.5 n'a pas démontré parité + stabilité sur 1 semaine d'usage CEO réel.


- **Même logique V0.5 → V1** : la bascule cloud V1 se fera aussi par vagues, avec période de coexistence local + cloud pour éviter toute coupure.





**Conséquences produit** :


- Le travail v0.5 sur `better-sqlite3`, `node-windows`, PowerShell COM, schéma SQLite est **assumé en partie jetable en V1** — c'est un choix, pas une surprise.


- `01-vision-produit.md` doit expliciter "aiCEO aujourd'hui (local) / aiCEO horizon 2027 (cloud)" pour que quiconque lit la vision comprenne la trajectoire.


- `02-benchmark.md` doit distinguer benchmark court terme (productivité desktop, Copilot, Rewind) et benchmark horizon (cloud SaaS Motion/Sunsama/Lattice).


- `08-roadmap.md` V1 doit explicitement budgéter la **refonte stack local → cloud** (pas seulement des nouvelles features).


- Chaque sprint fusion doit inclure un critère d'acceptation "le CEO peut l'utiliser + donner du feedback" avant de passer au sprint suivant.





**Conditions de revisite** : uniquement si un blocage technique majeur impose l'accélération cloud (ex. SQLite ne tient pas la charge, Outlook COM bloqué par IT corp) — et dans ce cas, nouvel ADR avec plan de continuité d'usage équivalent.





---





## 2026-04-24 · Typographie canonique : Fira Sans self-hosted





**Contexte** : l'audit de cohérence (`04_docs/AUDIT-COHERENCE-2026-04-24.md`, dissonance C2) a mis en évidence **trois sources de vérité contradictoires** sur la typographie :


- `02_design-system/tokens/typography.json` + `colors_and_type.css` → **Fira Sans** (10 poids self-hosted) + Aubrielle + Sol Thin


- `02_design-system/assets/app.css` + `product.app.css` + `01_app-web/assets/app.css` → **Inter** via `@import` CDN `rsms.me/inter/inter.css`


- `03_mvp/public/index.html` + `evening.html` → **Cambria / Calibri** inline


- `04_docs/07-design-system.md` § 2.3 → documentait Inter (alors que les tokens disaient Fira)





Conflit documenté dans `02_design-system/REPO-CONTEXT.md` mais jamais tranché. Atelier de cohérence, Session 2 (`04_docs/_atelier-2026-04-coherence/sessions/S2-typographie.md`).





**Options étudiées** :


- (A) **Fira Sans canonique** (tokens gagnent) — purger Inter et Cambria/Calibri


- (B) Inter canonique (code livré gagne) — aligner tokens sur Inter


- (C) Fira canonique + Inter fallback — stack hybride





**Décision** : **A — Fira Sans canonique, self-hostée, zéro dépendance CDN**.





Motifs :


1. Les tokens DS représentent un choix d'identité produit **explicite et délibéré** (Fira Sans = plus humain, plus institutionnel, moins "startup SF"). Inter était un fallback technique arrivé au scaffolding, pas un choix.


2. Le self-hosting des fontes supprime la dépendance Google Fonts / `rsms.me`, conforme à la trajectoire locale souveraine actée en S1 (ADR `2026-04-24 · Trajectoire produit`).


3. Les 10 fichiers OTF Fira Sans + Aubrielle_Demo + Sol Thin sont **déjà présents** dans `02_design-system/fonts/`.





**Patches appliqués 2026-04-24** :


- `02_design-system/assets/app.css` : `@import rsms.me/inter` → `@import ../colors_and_type.css`


- `02_design-system/assets/product.app.css` : idem + `font-family: "Inter var"…` → `"Fira Sans"…`


- `01_app-web/assets/app.css` : purge `@import Inter`, ajout `@font-face` Fira (6 poids) pointant vers `../../02_design-system/fonts/`, `font-family` basculée


- `03_mvp/public/index.html` : `Calibri`, `Cambria` remplacés par `"Fira Sans", Calibri, …` / `"Fira Sans", Cambria, …` (Fira première, anciennes fontes en fallback tant que `@font-face` n'est pas servi localement par le MVP)


- `03_mvp/public/evening.html` : idem


- `04_docs/07-design-system.md` § 2.3 : réécriture complète, stack Fira, poids étendus 100-900, OpenType features documentées


- `02_design-system/REPO-CONTEXT.md` : note "conflit résolu 2026-04-24" (à compléter hors session)





**Continuité d'usage (ADR S1)** : le MVP conserve Cambria/Calibri en fallback visuel immédiat tant que la fusion v0.5 n'a pas servi les fichiers Fira localement sous `03_mvp/public/assets/fonts/`. Aucune régression visible pour le CEO. Le passage visible à Fira Sans se fera lors du sprint S1 de la fusion (copie des assets DS dans `public/`, déjà prévu dans `SPEC-TECHNIQUE-FUSION §3`).





**Conséquences** :


- Issue GitHub à ouvrir manuellement dans `feycoil/aiCEO` : `lane/design-system` + `priority/high`, titre *"[DS] Fusion v0.5 · copier fonts Fira Sans dans 03_mvp/public/assets/fonts/"*, référence cette ADR (contenu d'issue préparé dans `_atelier-2026-04-coherence/sessions/S2-typographie.md` §7).


- Tout nouveau CSS ou nouvelle page doit utiliser `"Fira Sans"` en première position, jamais Inter, jamais Cambria/Calibri de façon primaire.


- `02_design-system/tokens/typography.json` fait foi sur les poids et les features OT.





---





## 2026-04-24 · Hiérarchie des sources de vérité documentaires





**Contexte** : l'audit de cohérence (`AUDIT-COHERENCE-2026-04-24.md`, dissonance C3) a mis en évidence des périmètres recouvrants entre documents sans hiérarchie explicite — notamment `04_docs/06-architecture.md` v2.0 et `04_docs/SPEC-TECHNIQUE-FUSION.md`, qui décrivent tous deux l'architecture cible sans qu'on sache lequel fait foi sur quoi. Risque : le prochain dev qui modifie l'un oubliera l'autre. Atelier de cohérence, Session 3 (`04_docs/_atelier-2026-04-coherence/sessions/S3-sources-verite.md`).





**Options étudiées** :


- (A) Une seule source par périmètre, hiérarchie explicite dans un ADR (proposition atelier)


- (B) Fusionner les documents qui se chevauchent


- (C) Laisser l'existant et gérer au cas par cas





**Décision** : **A — hiérarchie explicite, une source canonique par périmètre**.





Tableau de référence unique (à citer dans tout nouveau document qui porte un de ces sujets) :





| Domaine | Source canonique | Rôle | Sources secondaires |


|---|---|---|---|


| **Architecture cible V1→V3** | `04_docs/06-architecture.md` | Carte large, trajectoire, budgets | — |


| **Architecture fusion v0.5** | `04_docs/SPEC-TECHNIQUE-FUSION.md` | Source opérationnelle : schéma SQL, endpoints REST, sprints S1-S8 | `06-architecture.md` §2 renvoie vers elle |


| **Spec fonctionnelle v0.5** | `04_docs/SPEC-FONCTIONNELLE-FUSION.md` | 13 pages cibles, user flows matin/soir/hebdo | — |


| **Roadmap & jalons** | `04_docs/08-roadmap.md` | Milestones, budgets, KPIs par jalon | `00_BOUSSOLE/ROADMAP.md` (compagnon exécutif) |


| **Backlog opérationnel** | GitHub Issues `feycoil/aiCEO` | Single source | `08-roadmap.md` RICE table en miroir light |


| **Décisions structurantes** | `00_BOUSSOLE/DECISIONS.md` | ADR ≥ 30 min de débat | Commits Git pour micro-arbitrages |


| **Design tokens & règles** | `02_design-system/colors_and_type.css` + `tokens/` | Canoniques | `07-design-system.md` (prose) |





**Règle d'arbitrage en cas de conflit** : la source canonique gagne. Toute source secondaire qui contredit le canon doit être mise à jour ou marquée obsolète dans la même PR.





**Conséquences** :


- Patch immédiat `04_docs/06-architecture.md` §2 : encadré *"Pour les détails opérationnels de la fusion v0.5 (schéma SQL, sprints, endpoints), la source canonique est `SPEC-TECHNIQUE-FUSION.md`. Ce document en donne la carte large et la trajectoire."*


- Toute PR qui touche l'une des sources canoniques doit vérifier si elle impacte une source secondaire et la mettre à jour le cas échéant.


- Ce tableau est la référence en cas de doute — toute future doc qui se chevauche avec un domaine listé doit déclarer explicitement son rôle par rapport au canon.





**Conditions de revisite** : nouvel ADR si un périmètre apparaît (ex. compliance, données client) ou si la fusion v0.5 absorbe complètement `06-architecture.md`.





---





## 2026-04-24 · Règle de vie des drafts (4 semaines max)





**Contexte** : l'audit de cohérence (dissonance C6) a identifié le dossier `_drafts/` comme hybride — il contient à la fois des **gabarits réutilisables** (`_template.md`, `_template-widget.jsx`) et des **itérations anciennes** (`REFONTE_v3.md`, `SPEC_v31.md`) sans règle de durée de vie. Résultat : accumulation silencieuse de docs obsolètes que personne n'ose supprimer. Atelier de cohérence, Session 3.





**Options étudiées** :


- (A) Règle 4 semaines + promotion/archivage binaire


- (B) Pas de règle, nettoyage ad-hoc


- (C) Dossier purement temporaire, vidé chaque fin de sprint





**Décision** : **A — règle 4 semaines max, promotion ou archivage binaire**.





**Règles** :


1. Les fichiers dont le nom commence par `_template` restent indéfiniment (gabarits).


2. Tout autre fichier dans `_drafts/` a une durée de vie **maximale de 4 semaines** depuis sa création.


3. Au-delà de 4 semaines, décision binaire obligatoire :


   - **Promu** : déplacé dans son emplacement définitif (`04_docs/`, `02_design-system/`, etc.) et référencé dans un index.


   - **Archivé** : déplacé dans `_archive/YYYY-MM-draft-<nom>/` avec un `README.md` court expliquant le contexte et la raison d'archivage.


4. Un draft peut être archivé **avant** 4 semaines s'il est content-obsolète (superseded par un livrable officiel).





**Action immédiate 2026-04-24** :


- `REFONTE_v3.md` et `SPEC_v31.md` décrivent une itération produit (v3 / v3.1, localStorage-only, `assistant.html` séparé) **superseded** par les fascicules `01` à `08` + `SPEC-FONCTIONNELLE-FUSION` + `SPEC-TECHNIQUE-FUSION`. Archivés dans `_archive/2026-04-drafts-heritage/` avec README contextuel.





**Conséquences** :


- `_drafts/README.md` créé, porteur de la règle + inventaire des gabarits.


- Tout nouveau draft doit inclure une date ISO dans son en-tête (`**Créé** : YYYY-MM-DD`) pour faciliter l'audit.


- Un audit trimestriel de `_drafts/` est prévu dans `GOUVERNANCE.md` (à patcher en S7 ou immédiatement).





**Conditions de revisite** : si le volume de drafts devient ingérable (> 10 simultanés) ou si la durée de 4 semaines s'avère trop courte pour certains types (ex. spec longue en incubation), affiner par type dans un nouvel ADR.





---





## 2026-04-24 · Timing & budget v0.5 réconciliés





**Contexte** : l'audit de cohérence (dissonances C1 et C5) a relevé que le dossier produit avance **quatre durées différentes** pour la fusion v0.5 (6 sem dans le chemin critique, 7 sem dans la synthèse, 9 sem dans SPEC-TECHNIQUE-FUSION, 10 sem dans la table des sprints) et **deux budgets incompatibles** (95 k€ dans la synthèse roadmap sans dérivation, 132 kEUR dans SPEC-TECHNIQUE-FUSION qui est en fait le budget v0.4 MVP). L'équipe v0.5 n'est par ailleurs documentée nulle part. Conséquence : le CEO ne peut pas citer un chiffre de v0.5 à un interlocuteur externe sans être contredit par un autre passage du dossier. Atelier de cohérence, Session 4.





**Options étudiées** :


- (A) Accepter le bundle reco — 6 sprints / 10 sem / 110 k€ / équipe 2,6 ETP documentée, V1 = 16 sem canonique avec §8 clarifié


- (B) Compresser à 5 sprints / 9 sem comme le propose SPEC-TECHNIQUE-FUSION


- (C) Viser 78 k€ avec une équipe serrée à 1,8 ETP (1 lead dev + 0,5 designer + 0,3 PMO)





**Décision** : **A — bundle reco**.





1. **6 sprints, 10 semaines** pour la fusion v0.5. S6 dédié au scellement (tag `v0.5`, release interne, rétro, communication) est conservé distinct du S5 (durcissement technique + Service Windows + tests e2e + CI).


2. **Équipe v0.5 = 2,6 ETP** : 2 fullstack dev + 0,3 product designer + 0,3 PMO. Feycoil reste dogfood user quotidien, non budgété.


3. **Budget v0.5 = ~110 k€** (10 sem × 2,6 ETP × 900 €/j × 4,5 j/sem ≈ 105 k€ dev + 5 k€ infra/LLM).


4. **V1 = 16 semaines canonique** (périmètre complet, budget 290 k€). Le chiffre "14 sem" du chemin critique §8 désigne le chemin vers "V1 cœur" (migration Postgres + Graph API + Inngest + sub-agents), les 8 sem restantes couvrent les enrichissements F15 SharePoint RAG, F19 viz riches, F12 rituels auto-draftés.





**Conséquences** :


- Patch `04_docs/08-roadmap.md` : §3.2 (retirer "~1,5 mois dev temps plein"), §3.2bis "Équipe v0.5" créée, §3.2ter "Budget v0.5" créée (dérivation explicite), §8 chemin critique (6→10 sem fusion + clarification V1 cœur vs V1 complet), §13 synthèse (7 sem → 10 sem, 95 k€ → 110 k€).


- Patch `04_docs/SPEC-TECHNIQUE-FUSION.md` §13 : ajout du Sprint 6 (scellement, 1 sem) ; remplacement de "132 kEUR conforme roadmap" par "110 kEUR (dérivation dans `08-roadmap.md` §3.2ter)".


- À partir de cet ADR, **tout chiffre v0.5** cité dans le dossier doit être aligné sur 10 sem / 110 k€ / 2,6 ETP ou amender cet ADR.


- Budget total 18 mois ajusté : MVP v0.4 dogfood (bien sous 132 k€) + v0.5 110 k€ + V1 290 k€ + V2 693 k€ + V3 598 k€ ≈ 1,69 M€ (ligne §13 `Budget 18 mois total ≈ 1,68 M€` reste valide).





**Conditions de revisite** : si la fusion v0.5 dépasse 12 semaines ou 130 k€, ouvrir un nouvel ADR avec analyse de la dérive (dette technique sous-estimée, équipe insuffisante, périmètre sous-estimé).





---





## 2026-04-24 · Livrables externes : cadrage





**Contexte** : l'audit de cohérence (dissonance C4) a relevé que le dossier produit est *« prêt à être utilisé, pas à être présenté »* — score complétude **0 % CEO pair**, **0 % client**, **40 % investisseur**. L'audit §5.3 insiste : *« le premier vrai test externe (CEO pair ETIC) est l'événement le plus important de la trajectoire post-v0.5 »*. Parallèlement, la dissonance C7 (positionnement obsolète — benchmark Lattice/Motion/Superhuman incompatible avec la réalité local-first post-fusion) bloque tout pitch crédible. Atelier de cohérence, Session 5.





**Options étudiées** :


- (A) CEO pair uniquement — scope minimal, 2-3 j


- (B) **CEO pair + Investisseur** — couvre P1-4 de l'audit intégralement, 4-5 j


- (C) Tout (+ client + partenaire tech) — 10+ j, livrables périmés avant V1





**Décision** : **B — CEO pair + Investisseur traités maintenant**, client et partenaire tech parqués (reco révisable post-V1 pour le client, post-V2 pour le partenaire tech).





**Cadrage S5** :


1. **5 livrables à produire** (sprint dédié 4-5 j, fenêtre S2 du plan audit 05/05 → 11/05) :


   - `04_docs/PITCH-ONEPAGE.md` — problème/solution/preuve/trajectoire/CTA, 1 page PDF


   - `04_docs/BUSINESS-CASE.md` — hypothèses revenue, coûts 18 mois (1,69 M€), point mort, ROI CEO utilisateur


   - `04_docs/ONBOARDING-CEO-PAIR.md` — prérequis, install Service Windows, import Outlook, premier arbitrage, FAQ


   - `04_docs/LETTRE-INTRO-CEO-PAIR.md` — template 1 page signée Feycoil, pair-à-pair


   - `04_docs/PITCH-DECK-INVESTISSEUR.pptx` — adaptation de `10-exec-deck.pptx` (redactions + traction + positionnement à jour + slides "pas encore construit")


2. **Dépendance bloquante P0** : patch `04_docs/02-benchmark.md` (refonte §3 : Copilot for Business / Rewind / Motion-desktop / plugin Outlook ; §0 ajouté "Deux marchés de référence selon phase produit"). Sans ce patch, le pitch investisseur ne tient pas.


3. **Stockage** : tous les livrables dans `04_docs/` avec préfixes MAJUSCULES (cohérent avec `SPEC-FONCTIONNELLE-FUSION.md` et `SPEC-TECHNIQUE-FUSION.md`). Nouvelle section "Livrables externes" ajoutée dans `04_docs/00-README.md`.


4. **Confidentialité** : un seul fichier par audience, pas de double version. En-tête de filtrage explicite obligatoire sur chaque livrable externe : `Audience : <CEO pair | Investisseur>. Éléments redactés : <liste>. Version interne de référence : <fichier>.`


5. **Cadence** : maintien continu, pas de fichiers versionnés (`-v0.5.md`). Chaque livrable porte `**Version produit visée** : <v0.5 | V1 | ...> · **Dernière mise à jour** : YYYY-MM-DD`. Revue systématique à chaque jalon produit scellé (v0.5, V1, V2).





**Conséquences** :


- **6 issues GitHub à ouvrir manuellement** (contenu préparé dans `04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md` §9) : `doc/02-benchmark-v2-positionnement-a-jour` (P0), puis les 5 issues `doc/PITCH-ONEPAGE`, `doc/BUSINESS-CASE`, `doc/ONBOARDING-CEO-PAIR`, `doc/LETTRE-INTRO-CEO-PAIR`, `doc/PITCH-DECK-INVESTISSEUR`. Labels : `lane/docs` + `priority/P1` (sauf benchmark = P0) + `scope/externe` + milestone `V1`.


- Section "Livrables externes" ajoutée dans `04_docs/00-README.md`, en creux aujourd'hui, à alimenter au fil de la production.


- Le `10-exec-deck.pptx` actuel reste **interne uniquement** (ExCom ADABU 30/04). Toute adaptation pour l'externe passe par un nouveau fichier (pas de variante confuse du même nom).


- Client et partenaire tech : créer 2 issues GitHub parqueurs avec milestone `V2` et label `status/parked` pour garder la trace de la décision (rouvrir post-V1 et post-V2 respectivement).





**Conditions de revisite** : si une opportunité externe se présente avant T1 2027 (intérêt concret d'un client-test, approche d'un VC qualifié, sollicitation d'un partenaire tech), rouvrir cet ADR pour ajouter le livrable pertinent. Ne pas produire préventivement ce qui peut être obsolète.





---





## Template pour la prochaine décision





```markdown


## YYYY-MM-DD · Titre court





**Contexte** : (en 2-3 lignes)





**Options étudiées** :


- (A) …


- (B) …





**Décision** : …





**Conséquences** : …


```





