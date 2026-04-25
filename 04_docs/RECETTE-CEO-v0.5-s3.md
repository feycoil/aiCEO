# Recette CEO v0.5-s3

**Tag testé** : `v0.5-s3` (commit `5a322dd`) · **Date début recette** : 25 avr. 2026 · **Pattern** : identique à `RECETTE-CEO-v0.5-s1.md`

Validation manuelle des 4 piliers S3 en conditions réelles d'usage CEO. Cocher au fur et à mesure ; tout `KO` → ouvrir issue avec label `recette-v0.5-s3`.

---

## §0 — Pré-requis poste

- [ ] **Repo à jour** : `cd C:\_workarea_local\aiCEO ; git pull` → branche `main` au commit `≥d92e983`
- [ ] **Tag v0.5-s3 visible localement** : `git tag --list | findstr v0.5-s3` → `v0.5-s3`
- [ ] **Node ≥ 22.5** : `node -v` → `v22.x` ou `v24.x`
- [ ] **`.env` présent** : `Test-Path 03_mvp/.env` → `True`

---

## §1 — Boot serveur

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm install   # idempotent
npm start     # serveur sur :4747 (ou :3001 selon .env)
```

- [ ] Bannière `aiCEO v0.5 - copilote executif` affichée sans erreur
- [ ] `Invoke-RestMethod http://localhost:4747/api/health` → `ok=True`, `model=claude-sonnet-4-6`
- [ ] 6 pages frontend HTTP 200 : `/`, `/agenda`, `/revues/`, `/taches`, `/arbitrage`, `/evening`

---

## §2 — Tests automatisés (régression)

```powershell
npm test
```

- [ ] **75/75 tests verts** en < 30 s
- [ ] Aucun warning bloquant (juste `ExperimentalWarning: SQLite`)

---

## §3 — Pilier 1 : Agenda hebdo + drag-drop natif

Ouvrir `http://localhost:4747/agenda?week=2026-W23` dans le navigateur.

- [ ] **Sélecteur semaine** : ← / Aujourd'hui / → fonctionnent. URL change avec `?week=YYYY-Www` (deep link partageable)
- [ ] **Vue 7 colonnes** lun-dim, jour courant surligné en lilac
- [ ] **Panneau gauche « Tâches à planifier »** : liste les tâches sans `due_at` (priorité P0/P1/P2 visible)
- [ ] **Drag-drop natif** : glisser une task-pill du panneau sur un jour → toast `Tâche planifiée 2026-XX-XX`
- [ ] **Vérif backend** : la tâche apparaît dans `Invoke-RestMethod "http://localhost:4747/api/events/week?week=2026-W23&with_tasks=true"` (champ `tasks[]`)
- [ ] **A11y clavier** : Tab pour focus une task-pill, Espace pour grab, flèches → puis Espace sur un jour → drop fonctionne
- [ ] **Click event** → drawer latéral droit avec horaire/lieu/attendees/source

⚠️ Si Edge legacy : tester aussi sur Chrome (drag-drop natif requis).

---

## §4 — Pilier 2 : Revues + Big Rocks + auto-draft

Ouvrir `http://localhost:4747/revues/?week=2026-W23`.

### 4.1 Big Rocks (max 3)

- [ ] **Ajouter Big Rock** × 3 : titres « Test rock 1/2/3 » → tous acceptés, status `défini` par défaut
- [ ] **Tentative 4ᵉ** : bouton désactivé OU toast d'erreur HTTP 400 `contrainte max 3 big rocks par semaine atteinte`
- [ ] **Modifier le statut** d'un rock via dropdown : `défini` → `en-cours` → `accompli`. Ligne change de couleur (vert si accompli, rose si raté)
- [ ] **Supprimer un rock** : croix rouge → confirmation → ligne disparaît
- [ ] Cleanup : supprimer les 3 rocks de test

### 4.2 Auto-draft Claude

- [ ] Cliquer **Demander brouillon Claude** → spinner 3-15 s → markdown structuré apparaît
- [ ] Markdown contient les 4 sections : `## Focus`, `## Faits saillants`, `## Écarts`, `## Top 3 demain`
- [ ] Au moins 3 sources citées (titres de tâches ou IDs ou big rocks)
- [ ] Longueur ≈ 200-400 mots
- [ ] Statut affiché : `Brouillon claude` (mode réel) OU `Brouillon fallback` (mode offline)
- [ ] Si `ANTHROPIC_API_KEY` invalide ou réseau coupé : fallback markdown squelette s'affiche, pas de 500
- [ ] Latence p95 < 15 s (cible critère sprint #5)

### 4.3 Enregistrement

- [ ] Éditer le markdown généré
- [ ] Cliquer **Enregistrer la revue** → toast `Revue enregistrée (insert)`
- [ ] Recharger la page → la revue est restituée (POST upsert idempotent)
- [ ] Aller dans la liste **Archives** en bas → la revue de la semaine 2026-W23 apparaît

---

## §5 — Pilier 3 : SSE temps réel

Test à 2 fenêtres navigateur côte à côte.

- [ ] **Fenêtre A** : `http://localhost:4747/` (cockpit)
- [ ] **Fenêtre B** : `http://localhost:4747/taches`
- [ ] Dans B, **cocher une tâche** comme done → A se rafraîchit en < 1 s (counter `done_today` change)
- [ ] Dans B, **créer une tâche** via formulaire → A reçoit l'event, counter `open` incrémente
- [ ] **Couper le serveur** (Ctrl+C dans la fenêtre `npm start`) → A et B affichent en console `EventSource error`, retry exponentiel 1 s → 30 s
- [ ] **Relancer `npm start`** → A et B se reconnectent automatiquement, refetch redonne l'état correct
- [ ] **Console DevTools réseau** : event `task.updated` / `task.created` visibles avec payload `{ id, ts }`

⚠️ Si Zscaler en place : vérifier que les SSE traversent (heartbeat 25 s testé). Si timeout, repli polling à envisager pour S5.

---

## §6 — Pilier 4 : Outlook last-sync + alerte

### 6.1 Endpoint last-sync

```powershell
Invoke-RestMethod http://localhost:4747/api/system/last-sync
```

- [ ] Retourne `{ ok, source, lastSyncAt, lastSyncAgeMin, level, threshold }`
- [ ] `level` ∈ `{ ok, warn, critical }` selon âge de `data/emails-summary.json`
- [ ] Si `lastSyncAgeMin > 240` : `level=warn`. Si `> 1440` : `level=critical`. Sinon `ok`.

### 6.2 Alerte cockpit

```powershell
(Invoke-RestMethod http://localhost:4747/api/cockpit/today).alerts
```

- [ ] Si last-sync `level=critical|warn`, l'array `alerts` contient un objet `{ kind: "outlook_stale", level, message, ref: { type:"system", id:"last-sync" } }`
- [ ] Cette alerte apparaît visuellement dans la section « Alertes » du cockpit (`/`)

### 6.3 Schtasks autosync (admin)

À effectuer en terminal **PowerShell admin** :

```powershell
schtasks /create `
  /sc HOURLY /mo 2 `
  /tn "aiCEO-Outlook-Sync" `
  /tr "powershell.exe -ExecutionPolicy Bypass -File C:\_workarea_local\aiCEO\03_mvp\scripts\fetch-outlook.ps1" `
  /ru "$env:USERNAME" `
  /it
```

- [ ] Tâche créée sans erreur
- [ ] `schtasks /query /tn "aiCEO-Outlook-Sync"` → `Status: Ready`
- [ ] Forcer une exécution : `schtasks /run /tn "aiCEO-Outlook-Sync"`
- [ ] 30 s plus tard : `(Invoke-RestMethod http://localhost:4747/api/system/last-sync).level` → `ok`
- [ ] L'alerte cockpit `outlook_stale` disparaît

⚠️ Si droits admin refusés par IT (R1 du dossier S3) : escalade issue P0, fallback `/sc DAILY` non-admin.

---

## §7 — POC service Windows S3.10 (admin)

À effectuer en terminal **PowerShell admin** sur poste CEO :

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm install --no-save node-windows
node scripts/service-windows/install-service.js install
# Attendre ~30 s
sc query aiCEO
```

- [ ] `STATE : RUNNING` dans la sortie de `sc query aiCEO`
- [ ] `Invoke-RestMethod http://localhost:4747/api/health` → 200 sans terminal `npm start` ouvert
- [ ] **Reboot Windows** → service redémarre auto (`sc query aiCEO` → RUNNING après login)
- [ ] Logs présents dans `daemon\aiCEO.out.log` et `daemon\aiCEO.err.log`
- [ ] **Outlook COM accessible** depuis le service (Critique S5) : tester `schtasks /run /tn aiCEO-Outlook-Sync` → `last-sync` se rafraîchit
- [ ] Désinstall propre : `node scripts/service-windows/install-service.js uninstall` → `sc query aiCEO` retourne « service inexistant »

**Décision attendue** :
- ✅ Tout vert → **POC vert silencieux**, pas d'ADR. S5 démarre directement sur cette base.
- ⚠️ Au moins un KO → ouvrir `scripts/service-windows/ADR-S3-10-template.md`, remplir, coller en haut de `00_BOUSSOLE/DECISIONS.md`.

---

## §8 — Dogfood 5 jours (cible cycle complet)

À cocher sur 5 jours ouvrés consécutifs.

- [ ] **J1** : matin → arbitrage 3/2/N sur `/arbitrage` ; soir → bilan sur `/evening` (humeur + énergie + top 3 demain)
- [ ] **J2** : créer 3 Big Rocks pour la semaine sur `/revues/?week=YYYY-Www`. Suivre leur progression dans la journée
- [ ] **J3** : utiliser `/agenda` pour planifier 5+ tâches via drag-drop. Vérifier l'overdue alert dans cockpit
- [ ] **J4** : laisser le serveur tourner toute la journée, ouvrir 3+ onglets, vérifier que SSE garde tout sync sans refresh manuel
- [ ] **J5** : déclencher `Demander brouillon Claude` sur la revue hebdo. Adapter, enregistrer. Vérifier latence < 15 s et qualité ≥ 5/6 critères rubric

**Critères de réussite dogfood** :
- 0 incident bloquant sur 5 jours
- Coût Claude API quotidien < 5 ct (incluant arbitrage matin + draft revue)
- Streak du soir → ≥ 3 jours consécutifs

---

## §9 — Sortie de recette

Si **toutes les cases sont cochées** :

```powershell
git tag -a v0.5-s3-recette -m "Recette CEO v0.5-s3 validée le $(Get-Date -Format yyyy-MM-dd)"
git push origin v0.5-s3-recette
```

Puis ajouter une entrée RELEASES `rn-recette-v0-5-s3` (cf. pattern `rn-recette-v0-5-s1`) dans `04_docs/11-roadmap-map.html`.

Si **au moins une case KO** : ouvrir une issue par case avec :
- Label : `recette-v0.5-s3`
- Milestone : `v0.5-s3` (ou créer `v0.5-s3-bugfix`)
- Body : repro steps + sortie console + screenshot

---

## Annexes

**Smoke 1-liner (pour validation rapide quotidienne)** :

```powershell
$base = "http://localhost:4747"
@(
  '/api/health',
  '/api/cockpit/today',
  '/api/events/week?week=' + (Get-Date -UFormat '%Y-W%V'),
  '/api/big-rocks?week=' + (Get-Date -UFormat '%Y-W%V'),
  '/api/system/last-sync'
) | ForEach-Object {
  try { $r = Invoke-RestMethod "$base$_" ; Write-Host "OK  $_" -Fore Green }
  catch { Write-Host "KO  $_  $($_.Exception.Message)" -Fore Red }
}
```

**Estimation temps recette** :
- §0-§7 (technique) : ~45 min
- §8 (dogfood 5 j) : 5 jours en parallèle de l'usage normal
- §9 (sortie) : 5 min

---

*Source : `04_docs/RECETTE-CEO-v0.5-s3.md` · pattern hérité de `RECETTE-CEO-v0.5-s1.md` (rapporté `RAPPORT-RECETTE-v0.5-s1.md` VERDICT GO 25/04)*
