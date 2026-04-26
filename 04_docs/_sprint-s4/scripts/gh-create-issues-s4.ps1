# ============================================================================
# gh-create-issues-s4.ps1 — Creation des 12 issues Sprint S4
# ============================================================================
#  Sprint : v0.5-s4 (Pages portefeuille + Assistant chat + Polish service)
#  Demarrage cible : lundi 16/06/2026 09:00
#  Demo intermediaire : vendredi 20/06 16:00
#  Demo finale : vendredi 27/06 16:00
#  Tag cible : v0.5-s4 (lundi 30/06)
#  Charge : 10,2 j-dev / 20 j capacite = 49 % marge
#  Source : 04_docs/DOSSIER-SPRINT-S4.md
# ============================================================================

$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==> Repo cible    : $repo"      -ForegroundColor Cyan
Write-Host "==> Sprint        : S4 (v0.5-s4)" -ForegroundColor Cyan
Write-Host "==> Demarrage     : lundi 16/06/2026 09:00" -ForegroundColor Cyan
Write-Host "==> Tag cible     : v0.5-s4 (lundi 30/06)" -ForegroundColor Cyan
Write-Host ""

& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERREUR : gh auth status KO. Lance gh auth login avant." -ForegroundColor Red
  exit 1
}

Write-Host "==> Verification milestone v0.5-s4..." -ForegroundColor Cyan
$ms = gh api "repos/$repo/milestones?state=all" | ConvertFrom-Json
$s4 = $ms | Where-Object { $_.title -eq "v0.5-s4" }
if (-not $s4) {
  Write-Host "   Milestone v0.5-s4 ABSENT. Cree-le manuellement avant de relancer ce script :" -ForegroundColor Yellow
  Write-Host "   gh api repos/$repo/milestones --method POST -f title=v0.5-s4 -f description=\"Sprint S4 - Pages portefeuille + Assistant chat\" -f due_on=2026-06-30T00:00:00Z" -ForegroundColor Yellow
  exit 1
} else {
  Write-Host "   Milestone v0.5-s4 trouve (number=$($s4.number))." -ForegroundColor Green
}

Write-Host ""
Write-Host "==> Creation des 12 issues S4.00 -> S4.11" -ForegroundColor Cyan
Write-Host ""

$tmpDir = Join-Path $env:TEMP "aiCEO-issues-s4-$(Get-Random)"
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
    Write-Host "      ERREUR creation issue $num" -ForegroundColor Red
  }
}

$commonLabels = "sprint/s4,phase/v0.5-s4"


# ----------------------------------------------------------------------------
#  S4.00
# ----------------------------------------------------------------------------
$body00 = @'
Contexte
--------
S3 a livré l''ADR `2026-06-02 · S3.00 — Méthode Sprint S3` (rappel S2.00 zéro localStorage, drag-drop natif, démos hebdo, tag).
S4 doit **rappeler la règle** sur les 6 nouvelles pages migrées (`assistant`, `groupes`, `projets`, `projet/:id`, `contacts`, `decisions`) et acter la méthode S4 (3 piliers, 12 issues, démos hebdo).

À faire
-------
- [ ] Rédiger une ADR `2026-06-16 · S4.00 — Méthode Sprint S4 + zéro localStorage rappelé` dans `00_BOUSSOLE/DECISIONS.md`
- [ ] Contexte : 3 piliers (5 pages portefeuille, assistant chat live SSE, polish service Windows)
- [ ] Décision : (a) rappel S2.00 sur les 6 nouvelles pages, (b) streaming SSE pour assistant, (c) demos J5 (20/06) et J10 (27/06), (d) tag `v0.5-s4` cible 30/06
- [ ] Conséquences : cumul 80 % budget v0.5 fin S4, dépendances héritées par S5

Critères d''acceptation
----------------------
- ADR S4.00 mergée dans `DECISIONS.md` avant J1 (kickoff 16/06 09:00)

Charge / Owner / Dépendances
----------------------------
- Charge : 0,3 j-dev
- Owner  : PMO
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §3 (S4.00)
'@
Create-Issue "S4.00" "[S4.00] ADR Sprint S4 — méthode + zéro localStorage rappelé sur 6 nouvelles pages" "$commonLabels,lane/mvp,type/adr,priority/P0,owner/pmo" "v0.5-s4" $body00

# ----------------------------------------------------------------------------
#  S4.01
# ----------------------------------------------------------------------------
$body01 = @'
Contexte
--------
`assistant.html` (S4.02) a besoin d''un backend chat live qui appelle Claude en streaming.
Backend nouveau S4 : 2 tables + 3 routes REST + streaming SSE (réutilise bus S2.10/S3.05).

À faire
-------
- [ ] Migration SQLite : `assistant_conversations(id, title, created_at, updated_at)` + `assistant_messages(id, conversation_id FK, role, content, ts, model, tokens_in, tokens_out)`
- [ ] `src/routes/assistant.js` : GET conversations (20 dernières), GET conversations/:id, POST /messages (stream SSE), DELETE conversations/:id
- [ ] Cap `max_tokens: 1500`. Fallback non-streaming si pas de clé API.
- [ ] Tests `tests/assistant.test.js` (3 tests)

Critères d''acceptation
----------------------
- `curl -N -X POST .../api/assistant/messages -d ''{"content":"Salut"}''` → stream chunks puis done
- Latence first-token p95 < 3 s, full-response p95 < 30 s
- 3 tests verts (compteur ≥ 78)

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev1 (Backend)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.1, §3 (S4.01)
'@
Create-Issue "S4.01" "[S4.01] Backend assistant chat — table conversations + messages + POST streaming SSE" "$commonLabels,lane/mvp,type/feat,priority/P0,owner/dev1" "v0.5-s4" $body01

# ----------------------------------------------------------------------------
#  S4.02
# ----------------------------------------------------------------------------
$body02 = @'
Contexte
--------
Source `01_app-web/assistant.html` (162 lignes, copilote IA "fake reply").
Cible S4 : page migrée `03_mvp/public/assistant.html`, consomme POST /api/assistant/messages en streaming SSE.

À faire
-------
- [ ] Créer `03_mvp/public/assistant.html` (palette Twisty)
- [ ] Sidebar gauche : 20 dernières conversations (clic → load)
- [ ] Zone principale : thread messages, scroll auto bas
- [ ] Input : textarea + Ctrl+Enter
- [ ] Streaming progressif chunks ajoutés au DOM en live
- [ ] Indicateur "Claude réfléchit…" (cursor animé)
- [ ] Reconnexion exponentielle 1 s → 30 s plafond (pattern S3.05)
- [ ] Vérif zéro localStorage applicatif

Critères d''acceptation
----------------------
- `curl http://localhost:3001/assistant` → 200
- Conversation complète usable avec streaming visible
- Latence first-token < 3 s mesurée

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : **S4.01** (peut démarrer en parallèle sur squelette dès J2)

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.1, §3 (S4.02), §5.1
'@
Create-Issue "S4.02" "[S4.02] Frontend assistant.html migré API + chat live SSE streaming" "$commonLabels,lane/mvp,type/feat,priority/P0,owner/dev2" "v0.5-s4" $body02

# ----------------------------------------------------------------------------
#  S4.03
# ----------------------------------------------------------------------------
$body03 = @'
Contexte
--------
Source `01_app-web/groupes.html` (124 lignes) lit AICEO.GROUPS en localStorage.
Cible S4 : page migrée consommant `GET /api/groups` (route S1, déjà avec counts).

À faire
-------
- [ ] Créer `03_mvp/public/groupes.html`
- [ ] Cards 3 groupes : icône + tagline + counts (projets, hot, tâches ouvertes)
- [ ] Click card → navigate `/projets?group=<id>` (filtré)
- [ ] Vérif zéro localStorage

Critères d''acceptation
----------------------
- `curl http://localhost:3001/groupes` → 200
- 3 cards avec données live API

Charge / Owner / Dépendances
----------------------------
- Charge : 1,0 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.2
'@
Create-Issue "S4.03" "[S4.03] Frontend groupes.html migré API (vue portefeuille 3 groupes)" "$commonLabels,lane/mvp,type/feat,priority/P1,owner/dev2" "v0.5-s4" $body03

# ----------------------------------------------------------------------------
#  S4.04
# ----------------------------------------------------------------------------
$body04 = @'
Contexte
--------
Source `01_app-web/projets.html` (84 lignes).
Cible S4 : `GET /api/projects` (14 projets) + filtre dropdown groupe + deep link `?group=<id>`.

À faire
-------
- [ ] Créer `03_mvp/public/projets.html`
- [ ] Filtre dropdown groupe synchronisé query string (deep link)
- [ ] Cards/tableau : nom, groupe, status, progress, counts
- [ ] Click ligne → `/projet?id=<id>`
- [ ] Vérif zéro localStorage

Critères d''acceptation
----------------------
- `curl http://localhost:3001/projets` → 200
- 14 projets affichés, filtre opérationnel

Charge / Owner / Dépendances
----------------------------
- Charge : 1,0 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.3
'@
Create-Issue "S4.04" "[S4.04] Frontend projets.html migré API (liste cross-groupe + filtre)" "$commonLabels,lane/mvp,type/feat,priority/P1,owner/dev2" "v0.5-s4" $body04

# ----------------------------------------------------------------------------
#  S4.05
# ----------------------------------------------------------------------------
$body05 = @'
Contexte
--------
Sources : 10 fichiers `01_app-web/projets/*.html` (~550 bytes thin shells).
Cible S4 : 1 seul template `03_mvp/public/projet.html` paramétré via `?id=`.

À faire
-------
- [ ] Créer `03_mvp/public/projet.html`
- [ ] Lire query string `?id=` (ex: `?id=amani-chantier`)
- [ ] `GET /api/projects/:id` + tasks + decisions + events filtrés par projet
- [ ] Header : nom/groupe/status/progress
- [ ] Sections tâches/décisions/events
- [ ] Audit visuel J4 sur 3 projets représentatifs
- [ ] Vérif zéro localStorage

Critères d''acceptation
----------------------
- `curl http://localhost:3001/projet?id=amani-chantier` → 200
- 10 IDs projet testés (loop smoke)
- Pas de régression visuelle vs pages legacy

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.4, §5.2
'@
Create-Issue "S4.05" "[S4.05] Frontend projet.html template commun migré (10 pages → 1 template paramétré)" "$commonLabels,lane/mvp,type/feat,priority/P1,owner/dev2" "v0.5-s4" $body05

# ----------------------------------------------------------------------------
#  S4.06
# ----------------------------------------------------------------------------
$body06 = @'
Contexte
--------
Source `01_app-web/contacts.html` (158 lignes) : cards avec recherche full-text + filtres trust_level.
Cible S4 : `GET /api/contacts ?q=` (route S1 support recherche) + filtres trust_level + recherche live.

À faire
-------
- [ ] Créer `03_mvp/public/contacts.html`
- [ ] `GET /api/contacts ?q=<query>` debouncée 200 ms
- [ ] Cards : nom, role, company, email, phone, trust_level pill
- [ ] Filtre trust_level (haute/moyenne/faible/inconnue)
- [ ] Vérif zéro localStorage

Critères d''acceptation
----------------------
- `curl http://localhost:3001/contacts` → 200
- Recherche `?q=Sirugue` retourne 1 match en < 200 ms

Charge / Owner / Dépendances
----------------------------
- Charge : 1,0 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.5, §5.3
'@
Create-Issue "S4.06" "[S4.06] Frontend contacts.html migré API + recherche + filtres" "$commonLabels,lane/mvp,type/feat,priority/P1,owner/dev2" "v0.5-s4" $body06

# ----------------------------------------------------------------------------
#  S4.07
# ----------------------------------------------------------------------------
$body07 = @'
Contexte
--------
Source `01_app-web/decisions.html` (151 lignes).
Cible S4 : `GET /api/decisions` + `POST /api/decisions/:id/recommend` (Claude + fallback offline, livré S2).

À faire
-------
- [ ] Créer `03_mvp/public/decisions.html`
- [ ] Liste 10 décisions avec colonnes statut, titre, contexte, project_id, decided_at
- [ ] Bouton "Demander recommandation Claude" → POST `/api/decisions/:id/recommend` → drawer/modale
- [ ] Pill IA si recommend disponible
- [ ] Vérif zéro localStorage

Critères d''acceptation
----------------------
- `curl http://localhost:3001/decisions` → 200
- Click "Demander recommandation" → markdown réponse Claude

Charge / Owner / Dépendances
----------------------------
- Charge : 0,8 j-dev
- Owner  : Dev2 (Frontend)
- Dépendances : aucune (S2 a livré le backend)

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.6
'@
Create-Issue "S4.07" "[S4.07] Frontend decisions.html migré API + IA recommend" "$commonLabels,lane/mvp,type/feat,priority/P1,owner/dev2" "v0.5-s4" $body07

# ----------------------------------------------------------------------------
#  S4.08
# ----------------------------------------------------------------------------
$body08 = @'
Contexte
--------
Le CEO doit cliquer une icône Bureau pour ouvrir le cockpit dans son navigateur.

À faire
-------
- [ ] Créer `03_mvp/scripts/service-windows/install-desktop-shortcut.ps1` (pattern install-startup-shortcut.ps1)
  - `install` : `Cockpit aiCEO.lnk` sur Bureau pointant `http://localhost:4747`
  - Icône custom (pomme de pin lilac)
  - `uninstall`, `status`
- [ ] Section "Raccourci desktop" dans INSTALL-WINDOWS.md

Critères d''acceptation
----------------------
- Double-clic raccourci ouvre Edge/Chrome sur cockpit
- Désinstall propre

Charge / Owner / Dépendances
----------------------------
- Charge : 0,3 j-dev
- Owner  : Dev1 (DevOps)
- Dépendances : aucune

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.7, §5.4
'@
Create-Issue "S4.08" "[S4.08] Raccourci desktop "Cockpit aiCEO" + script install" "$commonLabels,lane/mvp,type/feat,priority/P2,owner/dev1" "v0.5-s4" $body08

# ----------------------------------------------------------------------------
#  S4.09
# ----------------------------------------------------------------------------
$body09 = @'
Contexte
--------
Wrapper `start-aiCEO-at-logon.ps1` (S3.10 variante D) écrit sans rotation.

À faire
-------
- [ ] Enrichir wrapper : rotation `aiCEO-server.log > 10 Mo` → `aiCEO-server.log.1`
- [ ] Créer `03_mvp/scripts/service-windows/INSTALL-WINDOWS.md` :
  - "Install fresh poste" (clone + npm install + raccourcis + schtasks)
  - "Update existing" (git pull + restart)
  - "Uninstall" (cleanup raccourcis + schtasks)
  - "Troubleshooting" (Outlook COM 0x80080005, schtasks /it 267011, etc.)

Critères d''acceptation
----------------------
- Rotation forcée : fichier > 10 Mo → archive créée
- INSTALL-WINDOWS.md ≥ 100 lignes, 4 sections

Charge / Owner / Dépendances
----------------------------
- Charge : 0,8 j-dev
- Owner  : Dev1
- Dépendances : S4.08 (raccourci desktop documenté)

Source : `04_docs/DOSSIER-SPRINT-S4.md` §1.7
'@
Create-Issue "S4.09" "[S4.09] Polish service Windows (logs rotation + INSTALL-WINDOWS.md consolidé)" "$commonLabels,lane/mvp,type/improve,priority/P2,owner/dev1" "v0.5-s4" $body09

# ----------------------------------------------------------------------------
#  S4.10
# ----------------------------------------------------------------------------
$body10 = @'
Contexte
--------
S3 a livré 75/75 verts. S4 ajoute 5+ tests.

À faire
-------
- [ ] `tests/assistant.test.js` (3 tests : POST stream, GET history, DELETE cascade)
- [ ] `tests/decisions-recommend.test.js` (1 test mock Claude)
- [ ] `tests/contacts-search.test.js` (1 test `?q=`)
- [ ] `tests/e2e-backoffice.test.js` (4 tests HTTP-boundary, pattern S3.07)

Critères d''acceptation
----------------------
- `npm test` ≥ 80 verts en < 30 s
- Aucune régression sur 75 tests existants

Charge / Owner / Dépendances
----------------------------
- Charge : 1,0 j-dev
- Owner  : Dev1 (QA)
- Dépendances : S4.01 + S4.06 + S4.07

Source : `04_docs/DOSSIER-SPRINT-S4.md` §3
'@
Create-Issue "S4.10" "[S4.10] Tests e2e parcours back-office + tests unitaires extensions (≥ 80 verts)" "$commonLabels,lane/tests,type/test,priority/P0,owner/dev1" "v0.5-s4" $body10

# ----------------------------------------------------------------------------
#  S4.11
# ----------------------------------------------------------------------------
$body11 = @'
Contexte
--------
S3 a livré `docs/API.md` enrichi + `RECETTE-CEO-v0.5-s3.md`. Pareil pour S4.

À faire
-------
- [ ] Étendre `03_mvp/docs/API.md` section "S4 Extensions" :
  - `/api/assistant/conversations` + `/api/assistant/messages` (POST streaming SSE)
- [ ] Créer `04_docs/RECETTE-CEO-v0.5-s4.md` (pattern v0.5-s3) :
  - 8 sections + smoke 1-liner annexe

Critères d''acceptation
----------------------
- `docs/API.md` enrichi (≥ +5 sections curl)
- `RECETTE-CEO-v0.5-s4.md` ≥ 200 lignes

Charge / Owner / Dépendances
----------------------------
- Charge : 0,5 j-dev
- Owner  : PMO
- Dépendances : tous les autres tickets S4

Source : `04_docs/DOSSIER-SPRINT-S4.md` §3
'@
Create-Issue "S4.11" "[S4.11] Documentation API S4 + recette CEO v0.5-s4 préparée" "$commonLabels,lane/mvp,type/docs,priority/P1,owner/pmo" "v0.5-s4" $body11

Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "==> 12 issues S4.00 -> S4.11 crees dans milestone v0.5-s4" -ForegroundColor Green
Write-Host "==> Verifier : gh issue list --milestone v0.5-s4" -ForegroundColor Cyan
Write-Host ""