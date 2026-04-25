# ============================================================================
#  gh-create-issues-s3.ps1 — Ouvre les 11 issues GitHub du Sprint S3 (v0.5-s3)
# ============================================================================
#  Source    : 04_docs/DOSSIER-SPRINT-S3.md §3 (table 11 issues, 11,1 j-dev)
#  Pré-requis: `gh auth status` OK · droits write sur feycoil/aiCEO
#  Usage     : depuis la racine du repo :
#              pwsh -File .\04_docs\_sprint-s3\scripts\gh-create-issues-s3.ps1
#  Effet     : (1) crée/met à jour les labels sprint S3,
#              (2) s'assure que le milestone "v0.5-s3" existe,
#              (3) ouvre les 11 issues S3.00 → S3.10.
#  Idempotent: oui pour labels/milestone. Pour les issues : si tu relances
#              tu auras des doublons — vérifier sur GitHub avant de ré-exécuter.
# ============================================================================

$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

# --- Encoding : forcer UTF-8 pour les arguments passés à gh.exe -------------
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==> Repo cible    : $repo"      -ForegroundColor Cyan
Write-Host "==> Sprint        : S3 (v0.5-s3)" -ForegroundColor Cyan
Write-Host "==> Démarrage     : mardi 02/06/2026 09:00" -ForegroundColor Cyan
Write-Host "==> Demo intermed.: vendredi 06/06/2026 16:00" -ForegroundColor Cyan
Write-Host "==> Demo finale   : vendredi 13/06/2026 16:00" -ForegroundColor Cyan
Write-Host "==> Tag cible     : v0.5-s3 (mardi 16/06)" -ForegroundColor Cyan
Write-Host ""

# --- 0. Auth check ----------------------------------------------------------
& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERREUR : gh auth status KO. Lance 'gh auth login' avant." -ForegroundColor Red
  exit 1
}

# --- 1. Bootstrap labels (idempotent) ---------------------------------------
Write-Host "==> Bootstrap des labels S3" -ForegroundColor Cyan
$labels = @(
  @{ name = "sprint/s3";          color = "d96d3e"; description = "Sprint S3 — v0.5-s3 (02/06 → 13/06/2026)" }
  @{ name = "phase/v0.5-s3";      color = "fdecdf"; description = "Sprint S3 fusion v0.5 — agenda + revues + SSE + autosync" }
  @{ name = "lane/mvp";           color = "7a6a8a"; description = "MVP Express + SQLite — backend & frontend monoposte" }
  @{ name = "lane/tests";         color = "3d7363"; description = "Tests unitaires, e2e Playwright, CI GitHub Actions" }
  @{ name = "type/feat";          color = "b88237"; description = "Nouvelle fonctionnalité produit" }
  @{ name = "type/adr";           color = "1f4738"; description = "Architecture Decision Record" }
  @{ name = "type/spike";         color = "9a9da8"; description = "Spike technique / preuve de concept time-boxée" }
  @{ name = "type/test";          color = "3d7363"; description = "Tests automatisés (unit, e2e, integration)" }
  @{ name = "type/docs";          color = "e2ece8"; description = "Documentation technique ou utilisateur" }
  @{ name = "priority/P0";        color = "8a3b1b"; description = "Bloquant — à traiter en priorité absolue" }
  @{ name = "priority/P1";        color = "d96d3e"; description = "Priorité 1 — chemin critique S3" }
  @{ name = "priority/P2";        color = "7790ae"; description = "Priorité 2 — confort / time-box ajustable" }
  @{ name = "area/api";           color = "5b3a78"; description = "Backend API REST" }
  @{ name = "area/ux";            color = "b88237"; description = "Frontend UX / UI" }
  @{ name = "area/ai";            color = "6d2e46"; description = "Intégration Claude / IA" }
  @{ name = "area/realtime";      color = "065a82"; description = "SSE / temps réel" }
  @{ name = "area/integration";   color = "8a3b1b"; description = "Intégration externe (Outlook, schtasks)" }
  @{ name = "area/deploy";        color = "36454f"; description = "Déploiement / Service Windows" }
  @{ name = "owner/dev1";         color = "1f4738"; description = "Owner : Dev1 binôme CEO + Claude" }
  @{ name = "owner/dev2";         color = "5b3a78"; description = "Owner : Dev2 binôme CEO + Claude" }
  @{ name = "owner/pmo";          color = "b88237"; description = "Owner : PMO (CEO côté pilotage)" }
)
foreach ($l in $labels) {
  & gh label create $l.name --repo $repo --color $l.color --description $l.description --force 2>&1 | Out-Null
  Write-Host "   label $($l.name)" -ForegroundColor DarkGray
}

# --- 2. Bootstrap milestone v0.5-s3 (idempotent) ----------------------------
Write-Host ""
Write-Host "==> Bootstrap du milestone v0.5-s3" -ForegroundColor Cyan
function Ensure-Milestone($title, $description, $dueOn) {
  $jsonText = & gh api "repos/$repo/milestones?state=all" 2>$null | Out-String
  $existing = $null
  if (-not [string]::IsNullOrWhiteSpace($jsonText)) {
    try {
      $milestones = $jsonText | ConvertFrom-Json
      $existing = $milestones | Where-Object { $_.title -eq $title } | Select-Object -First 1
    } catch {
      $existing = $null
    }
  }
  if (-not $existing) {
    & gh api "repos/$repo/milestones" `
      -f title="$title" `
      -f description="$description" `
      -f due_on="$dueOn" 2>&1 | Out-Null
    Write-Host "   milestone $title (créée, due $dueOn)" -ForegroundColor Green
  } else {
    Write-Host "   milestone $title (existe)" -ForegroundColor DarkGray
  }
}
Ensure-Milestone "v0.5-s3" "Sprint S3 fusion v0.5 — agenda hebdo + revues + auto-draft Claude + SSE câblé + autosync Outlook (2 pages + 2 chantiers)" "2026-06-16T16:00:00Z"

# --- 3. Création des 11 issues S3.00 → S3.10 --------------------------------
Write-Host ""
Write-Host "==> Création des 11 issues S3.00 → S3.10" -ForegroundColor Cyan
Write-Host ""

$tmpDir = Join-Path $env:TEMP "aiCEO-issues-s3-$(Get-Random)"
New-Item -ItemType Directory -Path $tmpDir | Out-Null

function Create-Issue($num, $title, $labelsCsv, $milestone, $body) {
  $bodyFile = Join-Path $tmpDir "issue-$num.md"
  [System.IO.File]::WriteAllText($bodyFile, $body, [System.Text.Encoding]::UTF8)
  Write-Host "   [$num] $title" -ForegroundColor White
  & gh issue create --repo $repo `
    --title $title `
    --body-file $bodyFile `
    --label $labelsCsv `
    --milestone $milestone
  if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERREUR création issue $num" -ForegroundColor Red
  }
}

$commonLabels = "sprint/s3,phase/v0.5-s3"

# ----------------------------------------------------------------------------
#  S3.00 — ADR Sprint S3 — méthode + zéro localStorage applicatif rappelé
# ----------------------------------------------------------------------------
$body00 = @'
Contexte
--------
S2 a livré l''ADR `2026-04-25 · S2.00 — Zéro localStorage applicatif` (source de vérité = SQLite serveur, le front lit/écrit toujours via REST).
S3 doit **rappeler la règle** sur les 2 nouvelles pages migrées (`agenda.html`, `revues/index.html`) et acter la méthode S3 (4 piliers, 11 issues, démos hebdo, time-box spike).

À faire
-------
- [ ] Rédiger une ADR `2026-06-02 · S3.00 — Méthode Sprint S3 + zéro localStorage rappelé` dans `00_BOUSSOLE/DECISIONS.md`
- [ ] Contexte : 4 piliers (agenda, revues, SSE câblé, autosync Outlook), spike Service Windows time-boxé 1,5 j
- [ ] Décision : (a) rappel S2.00 sur les nouvelles pages, (b) drag-drop natif HTML5 (réutilise pattern S2.03), (c) demos J5 (06/06) et J10 (13/06), (d) tag `v0.5-s3` cible 16/06
- [ ] Conséquences : cumul 60 % à 50 % sprintage, marge confortable S4-S6, dépendances héritées par S4 (assistant.html chat, contacts/decisions, projets/groupes)
- [ ] Vérif : `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/{agenda.html,revues/index.html}` -> 0 (sauf `aiCEO.uiPrefs`)

Critères d''acceptation
----------------------
- ADR S3.00 mergée dans `DECISIONS.md` avant J1 (kickoff 02/06 09:00)
- Référencée dans le KICKOFF-S3.pptx slide ADR

Charge / Owner / Dépendances
----------------------------
- Charge : 0,3 j-dev
- Owner  : PMO (Lead dev)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S3.md` §3 (S3.00), `00_BOUSSOLE/DECISIONS.md` 2026-04-25 (cadrage S3)
'@
Create-Issue "S3.00" "[S3.00] ADR Sprint S3 — méthode + zéro localStorage applicatif rappelé" "$commonLabels,lane/mvp,type/adr,priority/P0,owner/pmo" "v0.5-s3" $body00

# ----------------------------------------------------------------------------
#  S3.01 — Backend /api/events/week extension + /api/weekly-reviews + /api/big-rocks
# ----------------------------------------------------------------------------
$body01 = @'
Contexte
--------
`agenda.html` (S3.02) et `revues/index.html` (S3.04) ont besoin de 3 surfaces backend :
1) `GET /api/events/week` étendu avec `?with_tasks=true` (agrège les tâches `due_at` dans la semaine)
2) CRUD `GET/POST /api/weekly-reviews?week=YYYY-Www` (table `weekly_reviews` créée S2.00)
3) CRUD `GET/POST /api/big-rocks?week=YYYY-Www` (table `big_rocks` créée S2.00, max 3 par semaine — contrainte applicative)

À faire
-------
- [ ] Étendre `GET /api/events/week` avec query `?with_tasks=true` qui ajoute `{ tasks: [...] }` au payload (jointure `tasks` sur `due_at` ∈ [lundi 00:00 ; dimanche 23:59])
- [ ] Créer routes `/api/weekly-reviews` (GET single par semaine ISO, POST upsert) — payload `{ week, summary_md, status: ''draft'' | ''final'', updated_at }`
- [ ] Créer routes `/api/big-rocks` (GET liste par semaine, POST upsert avec validation max 3) — payload `{ id?, week, title, status: ''todo'' | ''doing'' | ''done'', sort_order }`
- [ ] Tests unitaires : `tests/weekly-reviews.test.js` (3 tests), `tests/big-rocks.test.js` (3 tests dont contrainte max 3), `tests/events.test.js` ajout test `with_tasks=true` (1 test)

Critères d''acceptation
----------------------
- `curl http://localhost:3001/api/events/week?week=2026-W23&with_tasks=true` -> 200, payload contient `events[]` + `tasks[]`
- `curl -X POST .../api/big-rocks` avec un 4ᵉ big rock même semaine -> 400 (contrainte max 3 respectée)
- `npm test` : +6 tests verts (compteur global passe à 61)

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev1 (Backend)
- Dépendances : aucune (démarrage J1 02/06)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.1, §1.2, §3 (S3.01)
'@
Create-Issue "S3.01" "[S3.01] Backend /api/events/week extension + /api/weekly-reviews + /api/big-rocks" "$commonLabels,lane/mvp,type/feat,priority/P0,area/api,owner/dev1" "v0.5-s3" $body01

# ----------------------------------------------------------------------------
#  S3.02 — Frontend agenda.html migré (vue hebdo lun-dim + drag-drop natif HTML5)
# ----------------------------------------------------------------------------
$body02 = @'
Contexte
--------
`01_app-web/agenda.html` lit `AICEO.STATE.events` en `localStorage` et affiche une grille hebdo lun-dim Twisty.
Cible S3 : page migrée dans `03_mvp/public/agenda.html`, consomme l''API S3.01, drag-drop natif HTML5 réutilisant le pattern S2.03.

À faire
-------
- [ ] Créer `03_mvp/public/agenda.html` (migration depuis `01_app-web/agenda.html`) — palette Twisty conservée
- [ ] Supprimer tous les accès `AICEO.STATE.events` ; consommer `GET /api/events/week?week=YYYY-Www&with_tasks=true`
- [ ] Sélecteur semaine (← W23 →) avec query string `?week=YYYY-Www`, persistance dans l''URL (deep link partageable)
- [ ] Vue "Aujourd''hui" en surbrillance (col J=lun…dim selon `new Date()`)
- [ ] Click event -> drawer detail (titre, organisateur, attendees, sources Outlook)
- [ ] Drag tâche (du panneau latéral `tasks[]`) -> jour calendrier -> `PATCH /api/tasks/:id { due_at: ''2026-06-04T09:00:00'' }`
- [ ] A11y : aria-grabbed/aria-dropeffect, support clavier (flèches + Espace pour grab/drop)
- [ ] Vérif : `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/agenda.html` -> 0 (sauf `aiCEO.uiPrefs`)

Critères d''acceptation
----------------------
- `curl http://localhost:3001/agenda.html` -> 200
- Drag tâche -> jour patch `due_at` côté backend, vérifié SQL (critère sprint #3)
- Sélecteur semaine fonctionne, deep link partageable
- Drag-drop OK Chrome + Edge Windows + clavier

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : **S3.01** (l''API doit être livrée d''abord, peut démarrer en parallèle sur le squelette dès J2)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.1, §3 (S3.02), §5.4 risque drag-drop Edge
'@
Create-Issue "S3.02" "[S3.02] Frontend agenda.html migré (vue hebdo lun-dim + drag-drop natif HTML5)" "$commonLabels,lane/mvp,type/feat,priority/P0,area/ux,owner/dev2" "v0.5-s3" $body02

# ----------------------------------------------------------------------------
#  S3.03 — Backend auto-draft revue Claude (POST /api/weekly-reviews/:week/draft)
# ----------------------------------------------------------------------------
$body03 = @'
Contexte
--------
Pour `revues/index.html` (S3.04), le CEO doit pouvoir cliquer "Demander brouillon Claude" et recevoir un markdown >= 200 mots cohérent en moins de 15 s.

À faire
-------
- [ ] Créer `POST /api/weekly-reviews/:week/draft` qui appelle Claude (Anthropic SDK déjà en place) avec un prompt itéré sur 5 semaines de données réelles (W14-W18)
- [ ] Le prompt agrège : tâches `done` de la semaine, sessions arbitrage, bilans soir, big rocks status. Format markdown structuré (focus / faits saillants / écarts / top 3 demain).
- [ ] Rubric d''évaluation 6 critères : focus (1 ligne), ton (factuel non emphatique), longueur (200-400 mots), sources citées (>= 3 tâches/sessions), top 3 demain présents, surfaçage des écarts
- [ ] Fallback offline si pas de clé API : draft template figé (squelette markdown vide à compléter manuellement) — conformément au plan B mid-sprint
- [ ] Test unitaire : `tests/weekly-reviews-draft.test.js` — 2 tests (avec et sans clé API, mock Anthropic)

Critères d''acceptation
----------------------
- `POST /api/weekly-reviews/2026-W23/draft` renvoie un markdown >= 200 mots cohérent (revue manuelle CEO sur W14-W18) (critère sprint #5)
- Latence p95 < 15 s
- Fallback offline OK (pas de 500 si `ANTHROPIC_API_KEY` absente)
- 2 tests verts (compteur global 63)

Charge / Owner / Dépendances
----------------------------
- Charge : 1 j-dev
- Owner  : Dev1 (Backend)
- Dépendances : **S3.01** (table `weekly_reviews` accessible via CRUD)

⚠ **Plan B mid-sprint J5** : si dérive sur ce ticket, on dégrade en "draft template figé" (sans IA) et on réinjecte la partie Claude en début S4.

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.2 et §3 (S3.03), §5.2 risque qualité auto-draft, §4 plan B
'@
Create-Issue "S3.03" "[S3.03] Backend auto-draft revue Claude (POST /api/weekly-reviews/:week/draft)" "$commonLabels,lane/mvp,type/feat,priority/P1,area/ai,owner/dev1" "v0.5-s3" $body03

# ----------------------------------------------------------------------------
#  S3.04 — Frontend revues/index.html migré (Big Rocks + auto-draft + archives)
# ----------------------------------------------------------------------------
$body04 = @'
Contexte
--------
`06_revues/index.html` est un dashboard statique avec les revues archivées (W17 markdown + widget). Pas d''éditeur de revue courante.
Cible S3 : page migrée dans `03_mvp/public/revues/index.html` avec 3 sections (Big Rocks + auto-draft + archives).

À faire
-------
- [ ] Créer `03_mvp/public/revues/index.html` (migration depuis `06_revues/index.html`) — palette Twisty conservée
- [ ] Section 1 : **Big Rocks de la semaine** — top 3 priorités hebdo, éditables inline, status `todo|doing|done`, persistance via `/api/big-rocks`
- [ ] Section 2 : **Bilan auto-drafté** — si pas encore validé : bouton "Demander brouillon Claude" -> `POST /api/weekly-reviews/:week/draft` -> markdown éditable (textarea ou lib markdown) -> bouton "Valider" -> `POST /api/weekly-reviews` avec `status: ''final''`
- [ ] Section 3 : **Archives** — liste des semaines passées (`GET /api/weekly-reviews`), lien vers le markdown archivé `06_revues/revue-YYYY-WNN.md` (lecture seule, garder les .md en place)
- [ ] Drawer source-inspector : remonte la lignée des Big Rocks (lien tâches done, sessions arbitrage de la semaine)
- [ ] Vérif : `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/revues/index.html` -> 0 (sauf `aiCEO.uiPrefs`)

Critères d''acceptation
----------------------
- `curl http://localhost:3001/revues/index.html` -> 200
- 3 sections opérationnelles, Big Rocks CRUD + max 3 (critère sprint #4)
- Auto-draft Claude OK : bouton -> markdown >= 200 mots -> édition -> validation persistée
- Archives W17 toujours accessibles via lien markdown `06_revues/revue-2026-W17.md`

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : **S3.01** (CRUD weekly-reviews + big-rocks) ; **S3.03** souhaitée mais pas bloquante (le bouton "Demander brouillon" peut être désactivé tant que S3.03 pas livrée)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.2 et §3 (S3.04), §5.5 risque liens W17 archivés
'@
Create-Issue "S3.04" "[S3.04] Frontend revues/index.html migré (Big Rocks + auto-draft + archives)" "$commonLabels,lane/mvp,type/feat,priority/P0,area/ux,owner/dev2" "v0.5-s3" $body04

# ----------------------------------------------------------------------------
#  S3.05 — Câblage SSE front (cockpit + taches s'abonnent au flux temps réel)
# ----------------------------------------------------------------------------
$body05 = @'
Contexte
--------
Le spike S2.10 a livré `src/realtime.js` + `GET /api/cockpit/stream` + 3 tests verts, mais **aucun front ne s''abonne** au flux SSE.
Régression observée en démo S2 : toggle d''une tâche dans `taches.html` -> cockpit dans un autre onglet ne se rafraîchit pas.

À faire
-------
- [ ] Routes mutatrices (tasks, decisions, arbitrage, evening, events) appellent `emitChange(type, payload)` sur le bus `src/realtime.js`
- [ ] `index.html` (cockpit) : ouvre `new EventSource(''/api/cockpit/stream'')` au load, re-fetch `/api/cockpit/today` sur chaque event reçu (debounce 200 ms via `setTimeout` rolling)
- [ ] `taches.html` : s''abonne aussi pour refléter les modifs croisées
- [ ] Toast UX subtil "Cockpit mis à jour" sur réception (1 s, fond ICE bleu)
- [ ] Reconnexion auto via `EventSource.onerror` (le navigateur réessaie tout seul, on log juste)
- [ ] Test e2e dans `tests/realtime-front.test.js` (HTTP boundary + simulateur EventSource) : POST tâche -> SSE event reçu < 1 s

Critères d''acceptation
----------------------
- Toggle tâche tab A -> cockpit tab B refresh < 1 s sans F5 (critère sprint #6, test manuel + e2e)
- Heartbeat 25 s OK derrière Zscaler corp (test sur poste CEO J3)
- Reconnexion auto fonctionnelle après cut wifi 30 s

Charge / Owner / Dépendances
----------------------------
- Charge : 0,8 j-dev
- Owner  : Dev1 (Fullstack)
- Dépendances : aucune (démarrage J4 04/06 après S3.01-S3.02 stables)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.3 et §3 (S3.05), §5.3 risque SSE Zscaler
'@
Create-Issue "S3.05" "[S3.05] Câblage SSE front (cockpit + taches s'abonnent au flux temps réel)" "$commonLabels,lane/mvp,type/feat,priority/P1,area/realtime,owner/dev1" "v0.5-s3" $body05

# ----------------------------------------------------------------------------
#  S3.06 — Outlook autosync 2 h (schtasks + GET /api/system/last-sync + alerte cockpit)
# ----------------------------------------------------------------------------
$body06 = @'
Contexte
--------
Le sync Outlook 30 j est lancé manuellement par PowerShell (`scripts/import-outlook.ps1`). Le CEO doit penser à le relancer.
Cible S3 : tâche planifiée Windows toutes les 2 h + endpoint introspection `/api/system/last-sync`.

À faire
-------
- [ ] Créer un script `scripts/install-outlook-autosync.ps1` qui appelle `schtasks /create /tn "aiCEO-Outlook-Sync" /tr "pwsh -File <path>\import-outlook.ps1" /sc HOURLY /mo 2 /ru "$env:USERNAME" /rl LIMITED`
- [ ] Logging dédié `logs/outlook-sync.log` avec rotation 10 jours (script PowerShell `Rotate-Log`)
- [ ] Endpoint `GET /api/system/last-sync` qui parse `logs/outlook-sync.log` et renvoie `{ last_run: ISO8601, status: ''ok'' | ''error'' | ''stale'', mails_in: int, events_in: int, errors: [...] }`
- [ ] Alerte cockpit si `last_run > 4 h` (intégration S2.01 `alerts`)
- [ ] README MVP : section "Installation autosync" avec snippet PowerShell `schtasks /create`
- [ ] Coordination IT ETIC : issue P0 ouverte côté IT pour valider droits user (sans admin via `/rl LIMITED`)

Critères d''acceptation
----------------------
- `schtasks /query /tn "aiCEO-Outlook-Sync"` -> présent, dernier run < 2 h (critère sprint #7)
- `curl http://localhost:3001/api/system/last-sync` -> 200, status structuré (critère sprint #8)
- Alerte cockpit si > 4 h sans sync (test manuel : couper schtask, attendre, vérifier alerte)
- Fallback : tâche utilisateur (sans admin) si ETIC refuse droits

Charge / Owner / Dépendances
----------------------------
- Charge : 1 j-dev
- Owner  : Dev1 (Backend) + IT ETIC pour validation droits
- Dépendances : aucune (démarrage J7 10/06)

⚠ **Risque R1** : Schtasks Windows nécessite droits admin -> CEO doit valider sur poste corp (issue IT P0 ouverte dès J1).

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.4 et §3 (S3.06), §5.1 risque schtasks admin
'@
Create-Issue "S3.06" "[S3.06] Outlook autosync 2 h (schtasks + GET /api/system/last-sync + alerte cockpit)" "$commonLabels,lane/mvp,type/feat,priority/P1,area/integration,owner/dev1" "v0.5-s3" $body06

# ----------------------------------------------------------------------------
#  S3.07 — Tests e2e parcours hebdo P4 (agenda + drag-drop -> revue draft -> commit)
# ----------------------------------------------------------------------------
$body07 = @'
Contexte
--------
S2 a livré 3 parcours e2e (matin / journée / soir) en HTTP boundary tests dans `tests/e2e.test.js`.
Cible S3 : nouveau parcours **P4 — hebdo** (agenda + drag-drop -> revue draft -> commit).

À faire
-------
- [ ] Ajouter dans `tests/e2e.test.js` (ou nouveau `tests/e2e-hebdo.test.js`) le scénario P4 :
  1. `GET /api/events/week?week=2026-W23&with_tasks=true` -> vérifie 200 + payload structuré
  2. `PATCH /api/tasks/:id { due_at }` -> simule drag-drop tâche -> jour
  3. `POST /api/big-rocks` × 3 (max respecté), 4ᵉ rejeté
  4. `POST /api/weekly-reviews/2026-W23/draft` -> markdown >= 200 mots (mock Anthropic si pas de clé)
  5. `POST /api/weekly-reviews` avec `status: ''final''` -> persisté SQLite
  6. `GET /api/weekly-reviews?week=2026-W23` -> renvoie le bilan validé
- [ ] Isolation par `AICEO_DB_OVERRIDE` (cohérent avec S2 e2e), nettoyage WAL/SHM
- [ ] Compteur `npm test` : +1 parcours = test bloc avec 6 sub-assertions

Critères d''acceptation
----------------------
- Parcours P4 vert (critère sprint #10)
- Pas de régression sur P1/P2/P3 livrés S2
- Temps total e2e < 3 s (HTTP boundary, pas de browser)

Charge / Owner / Dépendances
----------------------------
- Charge : 0,5 j-dev
- Owner  : Dev1 (Backend)
- Dépendances : **S3.01**, **S3.03** (auto-draft) ; **S3.02** + **S3.04** non bloquants (e2e en HTTP, pas en browser)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §3 (S3.07)
'@
Create-Issue "S3.07" "[S3.07] Tests e2e parcours hebdo P4 (agenda + drag-drop -> revue draft -> commit)" "$commonLabels,lane/tests,type/test,priority/P0,owner/dev1" "v0.5-s3" $body07

# ----------------------------------------------------------------------------
#  S3.08 — Tests unitaires extensions (SSE émission, last-sync, events with_tasks, big-rocks) >= 65 verts
# ----------------------------------------------------------------------------
$body08 = @'
Contexte
--------
S2 a livré 55 tests verts (49 S1 + 6 S2). Critère S3 #9 : **>= 65 tests verts** = +10 tests supplémentaires (en plus de ceux ajoutés par S3.01 +6 et S3.03 +2 = +8 minimum, on vise +10 avec coverage SSE et autosync).

À faire
-------
- [ ] Tests SSE émission (`tests/realtime-emit.test.js`) — 2 tests : routes mutatrices déclenchent `emitChange`, debounce 200 ms côté front simulé
- [ ] Tests autosync log parser (`tests/system-last-sync.test.js`) — 2 tests : log frais vs stale (>4h), gestion erreurs absentes vs présentes
- [ ] Tests events with_tasks (`tests/events-with-tasks.test.js`) — 2 tests : tâches dans la semaine vs hors semaine, deep link query string
- [ ] Tests Big Rocks contrainte (`tests/big-rocks-constraint.test.js`) — 2 tests : 4ᵉ rejeté, sort_order respecté
- [ ] Tests drawer source-inspector revues (`tests/revues-lineage.test.js`) — 2 tests : Big Rock -> tâches done de la semaine, -> sessions arbitrage
- [ ] `npm test` : compteur global >= 65 (cible 67 avec marge)

Critères d''acceptation
----------------------
- `npm test` retourne >= 65 tests verts (critère sprint #9)
- Couverture des nouveaux endpoints S3 : SSE émission, last-sync, events with_tasks, big-rocks contrainte
- Pas de régression S1/S2 (49 + 6 toujours verts)

Charge / Owner / Dépendances
----------------------------
- Charge : 1 j-dev
- Owner  : PMO (Lead dev) — peut prendre la main car PMO 0,3 ETP
- Dépendances : aucune (peut démarrer en parallèle dès J5)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §3 (S3.08), §2 critère #9
'@
Create-Issue "S3.08" "[S3.08] Tests unitaires extensions (SSE émission, last-sync, events with_tasks, big-rocks) >= 65 verts" "$commonLabels,lane/tests,type/test,priority/P1,owner/pmo" "v0.5-s3" $body08

# ----------------------------------------------------------------------------
#  S3.09 — Documentation API S3 (events/week, weekly-reviews, big-rocks, last-sync, SSE câblé)
# ----------------------------------------------------------------------------
$body09 = @'
Contexte
--------
S2 a livré `docs/API.md` 487 lignes / 15 sections / 38 exemples curl.
Cible S3 : documenter les 5 nouvelles surfaces backend + le câblage SSE.

À faire
-------
- [ ] Ajouter dans `docs/API.md` les sections :
  - `GET /api/events/week?week=YYYY-Www&with_tasks=true` (extension)
  - `GET/POST /api/weekly-reviews?week=YYYY-Www`
  - `POST /api/weekly-reviews/:week/draft`
  - `GET/POST /api/big-rocks?week=YYYY-Www` (avec contrainte max 3)
  - `GET /api/system/last-sync`
- [ ] Section "SSE — câblage front" : exemples `EventSource`, debounce 200 ms, reconnexion auto
- [ ] Mettre à jour le smoke-test 1 commande pour couvrir 1 ping S3 (ex: `curl /api/big-rocks?week=$(date +%Y-W%V)`)
- [ ] Ajouter +5 à +8 exemples curl (cible totale >= 45 exemples)
- [ ] Mettre à jour README v0.5 : section "Endpoints S3" + lien vers DOSSIER-SPRINT-S3.md

Critères d''acceptation
----------------------
- `docs/API.md` à jour reflète l''état post-S3 (15 -> 20 sections environ)
- Smoke-test 1 commande couvre les 5 nouveaux endpoints
- Onboarding test : un humain externe (ou Claude fresh session) déploie `npm install && npm start` + lance smoke-test sans question annexe

Charge / Owner / Dépendances
----------------------------
- Charge : 0,5 j-dev
- Owner  : PMO (Lead dev)
- Dépendances : **S3.01**, **S3.03**, **S3.05**, **S3.06** (tous les endpoints livrés)

Source : `04_docs/DOSSIER-SPRINT-S3.md` §3 (S3.09)
'@
Create-Issue "S3.09" "[S3.09] Documentation API S3 (events/week, weekly-reviews, big-rocks, last-sync, SSE câblé)" "$commonLabels,lane/mvp,type/docs,priority/P1,owner/pmo" "v0.5-s3" $body09

# ----------------------------------------------------------------------------
#  S3.10 — Spike Service Windows — POC node-windows + ADR (time-box 1,5 j strict)
# ----------------------------------------------------------------------------
$body10 = @'
Contexte
--------
Service Windows + raccourci desktop = livrable S5. Pour préparer le terrain, S3 lance un **spike POC** time-boxé **1,5 j strict** sur `node-windows`.

⚠ **Time-box strict 1,5 jour** (J6-J8, mar 09/06 PM -> mer 10/06 EOD). Si pas concluant à mer 10/06 18:00, on **arrête net**, on garde l''ADR "à finaliser en S5", l''issue ferme avec rapport de stop.

À faire
-------
- [ ] Branche `spike/s5-service-windows` créée à partir de `main`
- [ ] `npm install node-windows --save-dev` (dev only, ne pas embarquer en prod)
- [ ] Script `scripts/spike-install-service.js` : utilise `node-windows` pour installer `server.js` comme service Windows `aiCEO-MVP` (Local System ou User account)
- [ ] Script `scripts/spike-uninstall-service.js` : pour pouvoir tester proprement (cleanup)
- [ ] Test sur poste CEO : démarrage auto au boot, redémarrage si crash, logs Windows Event Viewer
- [ ] Rapport spike : `04_docs/_sprint-s3/spike-service-windows-report.md` documentant : 1) ce qui marche, 2) ce qui ne marche pas, 3) recommandation S5 (go `node-windows` / pivot `nssm` / pivot installeur MSI)
- [ ] Rédiger ADR `2026-06-XX · S3.10 — Spike Service Windows` dans `DECISIONS.md` (10 critères de décision)

Critères d''acceptation
----------------------
- Spike fonctionnel **OU** parqué proprement (PR fermée avec rapport stop)
- Décision claire pour S5 : `node-windows` retenu / pivot `nssm` / pivot installeur MSI
- ADR S3.10 dans `DECISIONS.md` (que le spike soit go ou no-go)
- Pas de dette technique laissée sur `main` (le spike vit sur sa branche, `node-windows` reste dev-only si retenu)

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j (time-boxé strict, **stop net si dépassement**)
- Owner  : Dev1 (Backend)
- Dépendances : aucune (démarrage J6 09/06 PM)

⚠ **Plan B** : si le spike explose le time-box, on arrête, on garde l''ADR "à finaliser en S5", l''issue ferme avec rapport de stop. Pas de débordement sur les autres tickets S3.

Source : `04_docs/DOSSIER-SPRINT-S3.md` §1.5, §3 (S3.10), §4 plan B mid-sprint, §5 risque time-box
'@
Create-Issue "S3.10" "[S3.10] Spike Service Windows — POC node-windows + ADR (time-box 1,5 j strict)" "$commonLabels,lane/mvp,type/spike,priority/P2,area/deploy,owner/dev1" "v0.5-s3" $body10

# --- 4. Cleanup -------------------------------------------------------------
Remove-Item -Recurse -Force $tmpDir

Write-Host ""
Write-Host "==> Terminé. Vérifie sur https://github.com/$repo/issues" -ForegroundColor Green
Write-Host "==> Filtre conseillé : is:issue is:open milestone:v0.5-s3 sort:title-asc" -ForegroundColor DarkGray
Write-Host ""
