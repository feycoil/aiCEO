# push-s4-finalize.ps1
# Finalisation Sprint S4 — pousse l'ADR « Sprint S4 livré » + release notes +
# patch roadmap-map. A lancer APRES push-s4-all.ps1 et la recette CEO.
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\push-s4-finalize.ps1

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"
Set-Location $root

Write-Host ""
Write-Host "=== ETAPE 1 : Stage les 3 fichiers de finalisation ===" -Fore Cyan
$files = @(
    "00_BOUSSOLE/DECISIONS.md",
    "04_docs/_release-notes/v0.5-s4.md",
    "04_docs/11-roadmap-map.html"
)
foreach ($f in $files) {
    if (Test-Path $f) {
        git add $f
        Write-Host "   + $f" -Fore Green
    } else {
        Write-Host "   ! MISSING $f" -Fore Red
    }
}

Write-Host ""
Write-Host "=== git diff --stat ===" -Fore Cyan
git diff --cached --stat

Write-Host ""
Write-Host "=== ETAPE 2 : Commit + push ===" -Fore Cyan
$msg = "docs(s4): Sprint S4 livre - ADR + release notes v0.5-s4 + roadmap doing->done"
git commit -m "$msg"
if ($LASTEXITCODE -eq 0) {
    git push origin main
} else {
    Write-Host "   commit a echoue (rien a committer ?)" -Fore Yellow
}

Write-Host ""
Write-Host "=== ETAPE 3 : Tag v0.5-s4 (apres recette CEO OK) ===" -Fore Cyan
Write-Host "   ATTENTION : ne tagger que si la recette CEO 04_docs/RECETTE-CEO-v0.5-s4.md est passee 6/6."
Write-Host ""
Write-Host "   Pour tagger maintenant :" -Fore Yellow
Write-Host "     git tag -a v0.5-s4 -m 'Sprint S4 - assistant chat live + 5 pages portefeuille + polish Windows'"
Write-Host "     git push origin v0.5-s4"
Write-Host "     gh release create v0.5-s4 --title 'v0.5-s4 (Sprint S4)' --notes-file 04_docs/_release-notes/v0.5-s4.md"
Write-Host ""
Write-Host "   Puis fermer le milestone v0.5-s4 :"
Write-Host "     gh api -X PATCH repos/feycoil/aiCEO/milestones/9 -f state=closed"
Write-Host ""
Write-Host "=== ETAPE 4 : Verification finale ===" -Fore Cyan
Write-Host "     gh issue list --milestone v0.5-s4 --state closed         # 12/12 attendues"
Write-Host "     gh release view v0.5-s4                                  # une fois taggee"
Write-Host ""
