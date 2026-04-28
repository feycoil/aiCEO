# push-v0.7-finalize.ps1 — Commit post-tag v0.7 (docs + S6.8 backlog)
#
# Capture les modifs réalisées APRES le commit v0.7 b7e9125 :
#  - CLAUDE.md restauré (§10 + §11) + bloc S6.8 backloggé
#  - 11-roadmap-map.html restauré + 3 nouvelles entries JOURNAL
#  - ADR 2026-04-28 v5 (Revue maquette + S6.8 backloggé) déjà dans DECISIONS.md
#  - bind-counts.js nouveau (pattern data-count S6.8 PoC)
#  - tweaks.css empty-state pattern
#  - normalize-events.js patché (ingested_at)
#  - migrations corrigées (BEGIN/COMMIT supprimés + defaults constants)
#
# Usage : pwsh -ExecutionPolicy Bypass -File push-v0.7-finalize.ps1
# Le tag v0.7 reste sur b7e9125 (immuable). Ce commit ajoute "docs(v0.7)" en suite.

[CmdletBinding()]
param([switch]$DryRun)

$ErrorActionPreference = "Stop"
$repo = "C:\_workarea_local\aiCEO"
Set-Location $repo

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  push-v0.7-finalize — Commit docs post-tag v0.7" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Pre-flight
$status = git status --porcelain
if (-not $status) {
    Write-Host "Aucune modification. Sortie." -ForegroundColor Cyan
    exit 0
}

Write-Host "Modifs detectees :" -ForegroundColor Yellow
git status --short
Write-Host ""

# Auto-test JS
Write-Host "Auto-test node --check sur fichiers JS critiques..." -ForegroundColor Yellow
$jsFiles = @(
    "03_mvp/public/v06/_shared/bind-counts.js",
    "03_mvp/scripts/normalize-events.js",
    "03_mvp/server.js"
)
foreach ($f in $jsFiles) {
    $full = Join-Path $repo $f
    if (Test-Path $full) {
        & node --check $full 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { Write-Host "  OK  $f" } else { Write-Host "  FAIL $f" -ForegroundColor Red; exit 2 }
    }
}
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY-RUN] Pas de commit." -ForegroundColor Cyan
    exit 0
}

# Commit + push
git add -A
git commit -m @"
docs(v0.7): polish post-tag - CLAUDE.md v5 + roadmap-map JOURNAL + ADR v5 S6.8 backloggé

Suite au commit b7e9125 + tag v0.7, ajout des docs de finalisation :
- CLAUDE.md restauré (paragraphes 10+11) + bloc v0.7 livrée et S6.8 v0.7-polish-phase-2 backloggé
- 11-roadmap-map.html restauré + 3 nouvelles entries JOURNAL :
  * Sprint S6.8 v0.7-polish-phase-2 BACKLOGGE (~4 j-binôme, 12 issues)
  * ADR v5 - Revue maquette complete post-finalisation v0.7
  * v0.7 LIVREE et taggee - commit b7e9125 + tag v0.7 sur origin
- ADR 2026-04-28 v5 (Revue maquette + S6.8 backloggé) deja dans DECISIONS.md
- bind-counts.js neuf (pattern data-count='route:field' generique avec fallback démo)
- tweaks.css empty-state pattern
- normalize-events.js patche (ingested_at via Date.toISOString)
- 3 migrations v0.7 corrigees (BEGIN/COMMIT supprimes + defaults constants)
- push-v0.7-finalize.ps1 nouveau (ce script)

5 decisions Claude D6.5.1 a D6.5.5 actees dans ADR v5.
Backlog S6.8 a creer GitHub via fix-milestones-v0.7.ps1 -Apply.

Tag v0.7 reste sur b7e9125 (immuable).
"@
git push origin HEAD

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  Docs v0.7 commitees et pushees" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
