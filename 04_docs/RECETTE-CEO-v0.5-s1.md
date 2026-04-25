# Recette CEO Windows v0.5-s1

**Tag** : `v0.5-s1` · **Commit** : `141ca0f` · **Date recette** : à effectuer en dogfood par CEO sur poste Windows

Plan de recette manuelle pour valider que le sprint S1 (backend stable SQLite) tient la route en conditions réelles d'usage CEO.
À cocher au fur et à mesure ; tout `KO` -> ouvrir une issue avec le label `recette-v0.5-s1`.

---

## Pré-requis poste

- [ ] **Node.js** : `node -v` -> `>=22.5.0` (requis pour `node:sqlite`)
- [ ] **Repo à jour** : `cd C:\_workarea_local\aiCEO ; git pull ; git status` -> `Your branch is up to date`
- [ ] **Branche** : on travaille sur `main` (la recette teste l'état figé `v0.5-s1`)
- [ ] **Config `.env`** : `03_mvp/.env` présent, `ANTHROPIC_API_KEY` valorisée, `HTTPS_PROXY` si poste entreprise

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
node -v          # doit afficher v22.5+ ou v24+
Test-Path .env   # doit afficher True
```

---

## 1. Boot serveur (cold start)

- [ ] `npm install` -> aucun build natif, 5 dépendances pures JS, exit 0
- [ ] `npm run db:init` -> 14 tables créées + 18 indexes, message `[OK] Schema v...`
- [ ] `npm run db:migrate-from-appweb` -> `3 groupes / 14 projets / 28 tâches / 10 décisions / 25 contacts / 25 events`
- [ ] `npm start` -> serveur écoute sur **port 3001** (alignement S2.00 ; si v0.5-s1 strict reste sur 4747, ajuster ici)
- [ ] `http://localhost:3001/api/health` répond `{ "status": "ok", "db": "ok" }`

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm install
npm run db:reset      # base de prod réinitialisée proprement
npm run db:migrate-from-appweb
npm start
# ouvrir un 2e terminal pour les tests ci-dessous
```

---

## 2. Tests automatisés (référence)

- [ ] `npm test` -> **23/23 verts** sur sprint S1 (49/49 si on tape déjà la branche S2)
- [ ] Aucun warning `node:sqlite` ni stack trace
- [ ] Durée totale `< 5 s`

---

## 3. Tour des 6 modules CRUD (HTTP boundary)

Tester chaque module avec PowerShell `Invoke-RestMethod`. Format attendu : objet JSON.

### 3.1 Tasks (`/api/tasks`)

- [ ] `GET /api/tasks` -> liste avec 28+ items
- [ ] `POST /api/tasks` body `{ "title":"recette-test", "groupId":"<id>" }` -> 201 + nouveau `id`
- [ ] `PATCH /api/tasks/:id` body `{ "status":"done" }` -> 200, `task_events` enrichi
- [ ] `DELETE /api/tasks/:id` -> 204, plus dans `GET /api/tasks`

### 3.2 Decisions (`/api/decisions`)

- [ ] `GET /api/decisions` -> 10+ items
- [ ] `POST /api/decisions` -> 201

### 3.3 Contacts (`/api/contacts`)

- [ ] `GET /api/contacts` -> 25+ items
- [ ] `GET /api/contacts?q=<nom>` -> filtrage texte fonctionnel

### 3.4 Projects (`/api/projects`)

- [ ] `GET /api/projects` -> 14+ items
- [ ] `GET /api/projects/:id/tasks` -> tâches du projet

### 3.5 Groups (`/api/groups`)

- [ ] `GET /api/groups` -> 3 groupes (perso, pro, ALEFPA ou équivalent)

### 3.6 Events (`/api/events`)

- [ ] `GET /api/events?from=<iso>&to=<iso>` -> liste filtrée
- [ ] Pas d'overlap avec Outlook (events séparés)

---

## 4. Intégrité et migration

- [ ] `node scripts/check-migration.js` -> `[OK] data.js et SQLite alignés (0 divergence)`
- [ ] Lancer 2× la migration (`db:migrate-from-appweb`) -> idempotente, pas de duplicate
- [ ] Forcer un crash mid-migration (Ctrl+C) puis relancer -> reprise propre
- [ ] `dir 03_mvp\data\app.sqlite` -> taille raisonnable (`< 5 Mo` typiquement)

---

## 5. Isolation tests vs prod

- [ ] `$env:AICEO_DB_OVERRIDE = "$PWD\test.sqlite" ; npm test` -> tests passent sur DB isolée
- [ ] La base prod (`data/app.sqlite`) **n'est pas touchée** par `npm test` (vérifier date de modification avant/après)
- [ ] Cleanup : `rm test.sqlite`

---

## 6. Dogfood quotidien (1 semaine cible)

À cocher sur 5 jours ouvrés consécutifs après le boot serveur :

- [ ] **J1** : arbitrage matinal complet (3 faire / 2 déléguer / N reporter) sans erreur
- [ ] **J2** : bilan du soir + streak engine s'incrémente (`settings.evening.longest_streak += 1`)
- [ ] **J3** : import Outlook 30j fonctionne sur tous les comptes (inbox + sent + délégués)
- [ ] **J4** : délégation par mailto: déclenche bien l'ouverture Outlook + draft visible dans Brouillons
- [ ] **J5** : run réel arbitrage avec Claude API live -> coût `< 2 ct` (référence : 1,5 ct sur 28 tâches au 24/04)

---

## 7. Edge cases connus

- [ ] **Hotfix S1.13** : `node:sqlite` charge bien sans VS Build Tools installés
- [ ] **Proxy entreprise** : si `HTTPS_PROXY` set, l'appel Anthropic passe (cf. patch llm.js)
- [ ] **CRLF/LF** : ouvrir un `.ps1` du repo -> pas de mojibake (`â€"`), encoding UTF-8 BOM correct
- [ ] **Index git** : opérations `git add` répétées ne corrompent pas `.git/index` (sinon -> `GIT_INDEX_FILE=/tmp/git-index-work` workaround)

---

## 8. Sortie de recette

Si **toutes les cases sont cochées** :

```powershell
git tag -a v0.5-s1-recette -m "Recette CEO v0.5-s1 validee le $(Get-Date -Format yyyy-MM-dd)"
git push origin v0.5-s1-recette
```

Puis ajouter une entrée JOURNAL dans `04_docs/11-roadmap-map.html` :

```javascript
{ ts:"2026-XX-XX", type:"livraison", component:"mvp",
  title:"Recette CEO v0.5-s1 validee (5 j dogfood)",
  detail:"23/23 tests verts en environnement reel + 5 j dogfood sans incident bloquant.",
  delta:0, source:"04_docs/RECETTE-CEO-v0.5-s1.md" }
```

Sinon, ouvrir une issue par case `KO` avec :
- Label : `recette-v0.5-s1`
- Milestone : `v0.5-s1` (réutiliser celui existant)
- Body : repro steps + sortie console

---

## Annexes

**Fixtures de test PowerShell** :

```powershell
# Helper pour les tests CRUD
$base = "http://localhost:3001"
function Get-Json($path)        { Invoke-RestMethod -Uri "$base$path" }
function Post-Json($path, $obj) { Invoke-RestMethod -Method Post -Uri "$base$path" -Body ($obj | ConvertTo-Json) -ContentType 'application/json' }

# Smoke test 1-liner (cible : tout en vert en 30 s)
@('/api/health','/api/tasks','/api/decisions','/api/contacts','/api/projects','/api/groups','/api/events') | % {
  try { $r = Get-Json $_ ; Write-Host "OK  $_" -Fg Green }
  catch { Write-Host "KO  $_  -- $_" -Fg Red }
}
```

---

*Document généré dans le cadre du sprint v0.5-s1. Source : `04_docs/RECETTE-CEO-v0.5-s1.md`*
