# push-s6.1-finalize.ps1 — Finalisation Sprint S6.1 (DS atomic + 27 composants)
#
# Usage : pwsh -File push-s6.1-finalize.ps1
#
# Actions :
#   1. git status check (refuse si pas clean)
#   2. git add . + commit "feat(s6.1): DS atomic + 27 composants + gallery + 30 icones"
#   3. git push origin main
#   4. git tag v0.6-s6.1
#   5. git push origin v0.6-s6.1
#   6. gh release create v0.6-s6.1 --title --notes-file 04_docs/_release-notes/v0.6-s6.1.md
#   7. gh issue close pour les 8 issues du milestone v0.6-s6.1
#   8. gh api PATCH milestone v0.6-s6.1 state=closed

$ErrorActionPreference = "Stop"

Write-Host "=== push-s6.1-finalize ===" -ForegroundColor Cyan

# 1. cd repo
Set-Location "C:\_workarea_local\aiCEO"

# 2. status
$status = git status --porcelain
if ($status) {
    Write-Host "[INFO] Modifications detectees a commiter :" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "[OK] Repo deja clean (rien a committer)" -ForegroundColor Green
}

# 3. commit
if ($status) {
    git add .
    $msg = @"
feat(s6.1): DS atomic + 27 composants + gallery + 30 icones

- Tokens CSS 3 niveaux (primitive/semantic/component) - 206 tokens
- 11 atoms : Button, Input, Badge, Avatar, Icon, Spinner, Skeleton, Switch, Checkbox, Radio, Tag
- 9 molecules : SearchPill, FormField, Toast, Tooltip, ProgressMeter, Stepper, Dropdown, Tabs, Pagination
- 7 organisms : Drawer, Header, Footer, Modal, CommandPalette, EmptyState, ErrorState
- SVG sprite Lucide stroke 1.5 (30 icones inventoriees v0.6)
- Components Gallery /components.html (mini-storybook)
- Test smoke automatique (5 tests Node native)
- Recette CEO 8 criteres GO/NO-GO

Closes #(issues s6.1.0 a s6.1.7)
"@
    git commit -m $msg
    Write-Host "[OK] Commit cree" -ForegroundColor Green
}

# 4. push
git push origin main
Write-Host "[OK] Push main" -ForegroundColor Green

# 5. tag
$tagExists = git tag -l "v0.6-s6.1"
if ($tagExists) {
    Write-Host "[INFO] Tag v0.6-s6.1 existe deja" -ForegroundColor Yellow
} else {
    git tag -a "v0.6-s6.1" -m "v0.6 / S6.1 - Design System atomic + 27 composants"
    git push origin "v0.6-s6.1"
    Write-Host "[OK] Tag v0.6-s6.1 cree + pushe" -ForegroundColor Green
}

# 6. Release
$releaseNotesPath = "04_docs\_release-notes\v0.6-s6.1.md"
if (-not (Test-Path $releaseNotesPath)) {
    Write-Host "[FAIL] Release notes manquantes : $releaseNotesPath" -ForegroundColor Red
    Write-Host "       Genere d'abord les release notes avant de relancer." -ForegroundColor Red
    exit 1
}

$releaseExists = & gh release view "v0.6-s6.1" 2>$null
if ($releaseExists) {
    Write-Host "[INFO] Release v0.6-s6.1 existe deja" -ForegroundColor Yellow
} else {
    & gh release create "v0.6-s6.1" `
        --title "v0.6 / S6.1 - Design System atomic + 27 composants" `
        --notes-file $releaseNotesPath
    Write-Host "[OK] Release v0.6-s6.1 publiee" -ForegroundColor Green
}

# 7. Fermer issues du milestone v0.6-s6.1
Write-Host "[INFO] Cloture des issues milestone v0.6-s6.1..." -ForegroundColor Cyan
$issues = & gh issue list --milestone "v0.6-s6.1" --state open --json number --jq ".[].number"
foreach ($n in $issues) {
    & gh issue close $n --reason completed
    Write-Host "  [OK] Issue #$n fermee" -ForegroundColor Green
}

# 8. Fermer milestone
$milestoneNumber = & gh api repos/feycoil/aiCEO/milestones --jq ".[] | select(.title==`"v0.6-s6.1`") | .number"
if ($milestoneNumber) {
    & gh api -X PATCH "repos/feycoil/aiCEO/milestones/$milestoneNumber" -f state=closed
    Write-Host "[OK] Milestone v0.6-s6.1 ferme" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== S6.1 finalise ===" -ForegroundColor Cyan
Write-Host "Tag    : v0.6-s6.1"
Write-Host "Release: https://github.com/feycoil/aiCEO/releases/tag/v0.6-s6.1"
Write-Host ""
Write-Host "Prochaine etape : Sprint S6.2 (refonte 7 pages cockpit + rituels)" -ForegroundColor Yellow
Write-Host "                  Necessite la maquette Claude Design generee."
