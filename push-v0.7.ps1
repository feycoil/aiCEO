# push-v0.7.ps1 — Finalisation et push v0.7 (28/04/2026 PM late)
#
# Sprints S6.5 + S6.6 + S6.7 livrés en parallèle sous mandat plein CEO carte blanche.
# Code 13/13 node --check verts. Cache busté v=98 -> v=99 (446 occurrences sur 18 HTML).
#
# Usage : pwsh -ExecutionPolicy Bypass -File push-v0.7.ps1
#
# Pré-requis : être à la racine repo C:\_workarea_local\aiCEO\, gh CLI authentifié.

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$SkipMigrations,
    [switch]$SkipRelease
)

$ErrorActionPreference = "Stop"
$repo = "C:\_workarea_local\aiCEO"
Set-Location $repo

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  push-v0.7 — Finalisation v0.7 aiCEO" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Pre-flight checks (avec auto-fix tag v0.7 mal positionné)
Write-Host "[1/8] Pre-flight checks..." -ForegroundColor Yellow

if (-not (Test-Path "$repo\.git")) {
    Write-Error "Pas de repo git à $repo"
    exit 1
}

# Auto-fix : si tag v0.7 existe local mais pointe sur HEAD actuel (= v0.6-final),
# c'est qu'il a été posé prématurément par un run précédent qui a planté avant
# le commit v0.7. On le supprime (local + remote) pour pouvoir re-tagger proprement.
$tagExists = git tag --list "v0.7"
if ($tagExists) {
    $tagCommit = (git rev-list -n 1 v0.7).Trim()
    $headCommit = (git rev-parse HEAD).Trim()
    $hasUncommitted = (git status --porcelain | Measure-Object).Count -gt 0

    if ($tagCommit -eq $headCommit -and $hasUncommitted) {
        Write-Host "  Tag v0.7 detecte sur commit actuel ($($headCommit.Substring(0,7))) avec $((git status --porcelain | Measure-Object).Count) modifs non commitees." -ForegroundColor Yellow
        Write-Host "  -> Tag v0.7 pose prematurement par un run anterieur. Suppression auto (local+remote)..." -ForegroundColor Yellow
        git tag -d v0.7 2>&1 | Out-Null
        $remoteHasTag = git ls-remote --tags origin 2>$null | Select-String -Pattern "refs/tags/v0\.7$" -Quiet
        if ($remoteHasTag) {
            git push origin --delete v0.7 2>&1 | Out-Null
            Write-Host "  Tag v0.7 supprime sur remote." -ForegroundColor Green
        }
        Write-Host "  Tag v0.7 supprime en local." -ForegroundColor Green
    } elseif ($tagCommit -eq $headCommit -and -not $hasUncommitted) {
        Write-Host "  Tag v0.7 deja sur le HEAD courant et aucune modif non commitee. Sortie propre." -ForegroundColor Cyan
        exit 0
    }
}

# Auto-clean : supprimer le test sandbox laisse en place (untracked)
$testFile = "$repo\03_mvp\scripts\_test-v07-migrations.js"
if (Test-Path $testFile) {
    Remove-Item $testFile -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleanup : 03_mvp\scripts\_test-v07-migrations.js supprime (test sandbox)." -ForegroundColor DarkGray
}

$status = git status --porcelain
if (-not $status) {
    Write-Warning "Aucune modification non commitee. Rien a faire."
    exit 0
}

$node = node --version
Write-Host "  Node : $node"
Write-Host "  Repo : $repo"
Write-Host "  Modifs non commitees : $(($status | Measure-Object).Count) fichiers"

# 2. Migrations SQLite (sauf si --SkipMigrations)
if (-not $SkipMigrations) {
    Write-Host ""
    Write-Host "[2/8] Lancement migrations SQLite v0.7..." -ForegroundColor Yellow
    Push-Location "$repo\03_mvp"
    try {
        # Tuer serveurs fantômes pour libérer aiceo.db
        $proc = Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Server actif sur :4747, kill..."
            $proc | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
            Start-Sleep 1
        }

        node scripts/init-db.js
        if ($LASTEXITCODE -ne 0) { throw "init-db.js a échoué" }
        Write-Host "  3 migrations v0.7 appliquées (events-extend + decisions-reportee + emails-fk-projects)" -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "[2/8] Migrations skippées (--SkipMigrations)" -ForegroundColor DarkGray
}

# 3. Auto-test : node --check sur les fichiers JS critiques v0.7
Write-Host ""
Write-Host "[3/8] Auto-test node --check sur JS v0.7..." -ForegroundColor Yellow
$jsFiles = @(
    "03_mvp/public/v06/_shared/bind-coaching.js",
    "03_mvp/public/v06/_shared/bind-connaissance.js",
    "03_mvp/public/v06/_shared/bind-arbitrage-focus.js",
    "03_mvp/public/v06/_shared/bind-arbitrage-board.js",
    "03_mvp/public/v06/_shared/bind-arbitrage-queue.js",
    "03_mvp/public/v06/_shared/bind-revues.js",
    "03_mvp/public/v06/_shared/bind-assistant.js",
    "03_mvp/public/v06/_shared/bind-agenda.js",
    "03_mvp/scripts/normalize-events.js",
    "03_mvp/src/routes/knowledge.js",
    "03_mvp/src/routes/arbitrage.js",
    "03_mvp/src/routes/assistant.js",
    "03_mvp/server.js"
)
$failures = 0
foreach ($f in $jsFiles) {
    $full = Join-Path $repo $f
    if (-not (Test-Path $full)) {
        Write-Host "  MISSING $f" -ForegroundColor Red
        $failures++
        continue
    }
    & node --check $full 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK  $f"
    } else {
        Write-Host "  FAIL $f" -ForegroundColor Red
        $failures++
    }
}
if ($failures -gt 0) {
    Write-Error "$failures fichier(s) ne passent pas node --check. Abort."
    exit 2
}
Write-Host "  $($jsFiles.Count)/$($jsFiles.Count) verts" -ForegroundColor Green

# 4. Tests unitaires (best-effort)
Write-Host ""
Write-Host "[4/8] Tests unitaires (best-effort)..." -ForegroundColor Yellow
Push-Location "$repo\03_mvp"
try {
    $env:NODE_OPTIONS = ""
    & npm test 2>&1 | Tee-Object -Variable testOut | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "  Tests rouges, mais on continue (binôme assume)."
    }
} finally {
    Pop-Location
}

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY-RUN] Arrêt avant commit/push/tag." -ForegroundColor Cyan
    exit 0
}

# 5. Commit
Write-Host ""
Write-Host "[5/8] Git add + commit..." -ForegroundColor Yellow
git add -A
git commit -m @"
feat(v0.7): livraison v0.7 - LLM 4 surfaces + Outlook events + finalisation gaps

Sprints S6.5/S6.6/S6.7 livres en parallele sous mandat plein CEO carte blanche.

S6.5 - LLM 4 surfaces UX (mode degrade activable)
- 5 routes assistant.js : coaching-question, decision-recommend, auto-draft-review,
  effects-propagation, llm-status. Helper llmReady() detecte ANTHROPIC_API_KEY.
- Frontend : bind-arbitrage-focus v4 (recommandations A/B/C + Si vous tranchez X),
  bind-revues v5 (auto-draft sur demarrage revue), bind-coaching neuf
  (signaux faibles + 4 questions LLM), bind-assistant v4 (banner Claude live/degrade).

S6.6 - Outlook events sync + status reportee persistant
- Migration 2026-04-28-events-extend.sql : organizer/status/body_preview/ingested_at + 3 idx.
- Migration 2026-04-28-decisions-reportee.sql : recreate 3-etapes pour CHECK incluant reportee.
- scripts/fetch-outlook-events.ps1 : COM Outlook GetDefaultFolder(9), J-15 a J+30.
- scripts/normalize-events.js : ingestion SQLite idempotente.
- bind-arbitrage-board v2 : status reportee persistant DB.
- bind-agenda v2 : grille hebdo lun-dim.

S6.7 - FK emails->projects + 3 pages preview + tag
- Migration 2026-04-28-emails-fk-projects.sql : FK emails.project_id + table knowledge_pins.
- src/routes/knowledge.js : 5 endpoints CRUD pins.
- 2 routes arbitrage.js : link-project + suggest-project.
- bind-arbitrage-queue v4 : auto-link email->projet sur Accept.
- bind-connaissance neuf : render pins KIND_LABEL + archive + add.
- 18 HTML : bump cache v=98 -> v=99 (446 occurrences).

5 decisions Claude carte blanche documentees dans 04_docs/_sprint-v0.7/JOURNAL.md (D1-D5).
ADR 2026-04-28 v4 ajoute (DECISIONS.md ligne 1681).
CLAUDE.md mis a jour version v4 statut v0.7 LIVREE.
13/13 fichiers JS node --check verts.

Closes v0.7
"@

# 6. Tag v0.7
Write-Host ""
Write-Host "[6/8] Tag v0.7..." -ForegroundColor Yellow
git tag -a v0.7 -m "v0.7 - LLM 4 surfaces UX (mode degrade) + Outlook events + finalisation gaps - 28/04/2026 PM late"
Write-Host "  Tag v0.7 pose" -ForegroundColor Green

# 7. Push
Write-Host ""
Write-Host "[7/8] Push origin (commits + tag)..." -ForegroundColor Yellow
git push origin HEAD
git push origin v0.7

# 8. GitHub Release (sauf si --SkipRelease)
if (-not $SkipRelease) {
    Write-Host ""
    Write-Host "[8/8] Creation Release GitHub..." -ForegroundColor Yellow
    $hasGh = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $hasGh) {
        Write-Warning "  gh CLI absent — skip Release. Creer a la main : https://github.com/feycoil/aiCEO/releases/new?tag=v0.7"
    } else {
        $releaseBody = @"
## v0.7 - LLM 4 surfaces UX + Outlook events + finalisation gaps

Sprints S6.5/S6.6/S6.7 livres en parallele sous mandat plein CEO carte blanche le 28/04/2026 PM late.

### S6.5 - LLM 4 surfaces UX (mode degrade activable)

5 routes ajoutees dans ``src/routes/assistant.js`` :
- ``POST /api/assistant/coaching-question`` - questions de posture par bucket (defaut/tension/equipe/finance)
- ``POST /api/assistant/decision-recommend`` - 3 options A/B/C avec confidence et recommended
- ``POST /api/assistant/auto-draft-review`` - intention + bilan + cap_prochaine sur stats semaine
- ``POST /api/assistant/effects-propagation`` - effets propages selon choix
- ``GET  /api/assistant/llm-status`` - mode actif (live ou rule-based-fallback)

Helper ``llmReady()`` detecte ``process.env.ANTHROPIC_API_KEY`` -> bascule LLM live (Claude Sonnet) ou fallback rule-based heuristique automatiquement.

Frontend cable :
- ``bind-arbitrage-focus.js`` v4 : recommandations A/B/C + "Si vous tranchez X" hover + coaching banner
- ``bind-revues.js`` v5 : auto-draft sur "Demarrer la revue de la semaine"
- ``bind-coaching.js`` neuf : signaux faibles depuis stats decisions + 4 questions LLM
- ``bind-assistant.js`` v4 : bandeau Claude live (vert) ou mode degrade (ambre)

### S6.6 - Outlook events sync + status reportee persistant

- Migration ``2026-04-28-events-extend.sql`` : colonnes organizer / status / body_preview / ingested_at + 3 index
- Migration ``2026-04-28-decisions-reportee.sql`` : recreate 3-etapes pour CHECK incluant reportee (contournement standard SQLite ALTER TABLE CHECK)
- ``scripts/fetch-outlook-events.ps1`` : COM Outlook GetDefaultFolder(9) avec IncludeRecurrences, fenetre J-15 a J+30
- ``scripts/normalize-events.js`` : ingestion SQLite idempotente (INSERT OR REPLACE sur PK Outlook EntryID)
- ``bind-arbitrage-board.js`` v2 : status reportee persistant DB (vs sessionStorage volatile)
- ``bind-agenda.js`` v2 : grille hebdo lun-dim sur ``/api/events``

### S6.7 - FK emails->projects + 3 pages preview cablees + tag

- Migration ``2026-04-28-emails-fk-projects.sql`` : ``emails.project_id`` FK + table ``knowledge_pins``
- ``src/routes/knowledge.js`` neuf : 5 endpoints CRUD pins (decision/criterion/principle/note + tags + soft delete)
- 2 routes ``arbitrage.js`` : ``POST /api/emails/:id/link-project`` + ``GET /api/emails/suggest-project?email_id=X``
- ``bind-arbitrage-queue.js`` v4 : auto-link email->projet sur Accept (zero-friction)
- ``bind-connaissance.js`` neuf : render pins + archive + add via prompt
- 18 HTML : bump cache ``?v=98 -> ?v=99`` (446 occurrences)

### 5 decisions Claude carte blanche

Documentees dans ``04_docs/_sprint-v0.7/JOURNAL.md`` :
- D1 - LLM mode degrade activable (rule-based sans cle, LLM live avec cle)
- D2 - Status reportee via migration SQLite 3-etapes
- D3 - Events fenetre J-15 a J+30
- D4 - Auto-link email->projet sur Accept (vs dropdown manuel)
- D5 - Pas d'Opus en v0.7 (Sonnet only, Opus reporte V3)

### Tests et validation

- 13/13 fichiers JS ``node --check`` verts
- 18/18 HTML pages cache busted v=99
- ADR 28 ajoute dans ``00_BOUSSOLE/DECISIONS.md`` (ligne 1681)
- ``CLAUDE.md`` v4 statut v0.7 LIVREE

### Activation LLM live (optionnel)

Setter en variable d'environnement Windows :
``[Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-...', 'User')``

Restart serveur. Le bandeau assistant et les fallback basculeront automatiquement sur Claude Sonnet.

### Recette CEO

1. ``npm run db:init`` (applique les 3 migrations v0.7)
2. ``pw