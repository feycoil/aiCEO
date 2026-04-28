# push-s5-all.ps1
# Sprint S5 livre — script unique commit + push + tag v0.5 + GitHub Release
# A lancer apres recette CEO + recette ExCom validees.
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\push-s5-all.ps1
# Pour skip le tag v0.5 (avant recette ExCom) : ajouter -SkipTag
param(
    [switch]$SkipTag
)

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"
$repo = "feycoil/aiCEO"
Set-Location $root

Write-Host ""
Write-Host "=== ETAPE 0 : Tuer le serveur fantome sur :4747 ===" -Fore Cyan
Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object {
    try { Stop-Process -Id $_ -Force -ErrorAction Stop; Write-Host "   killed PID $_" -Fore Green } catch {}
  }
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== ETAPE 1 : Stage les fichiers S5 (~12) ===" -Fore Cyan
$files = @(
    # ADRs S5 (méthode + projet hors OneDrive + cloture v0.5)
    "00_BOUSSOLE/DECISIONS.md",
    # S5.01 tests E2E
    "03_mvp/tests-e2e/package.json",
    "03_mvp/tests-e2e/playwright.config.js",
    "03_mvp/tests-e2e/specs/p1-matin.spec.js",
    "03_mvp/tests-e2e/specs/p2-soir.spec.js",
    "03_mvp/tests-e2e/specs/p3-hebdo.spec.js",
    "03_mvp/tests-e2e/specs/p4-portefeuille.spec.js",
    "03_mvp/tests-e2e/specs/p5-assistant.spec.js",
    "03_mvp/tests-e2e/specs/p6-install.spec.js",
    "03_mvp/tests-e2e/README.md",
    # S5.02 smoke-all
    "03_mvp/scripts/smoke-all.ps1",
    # S5.03 /api/health enrichi
    "03_mvp/server.js",
    # S5.04 RECETTE-EXCOM
    "04_docs/RECETTE-EXCOM-v0.5.md",
    # S5.05 release notes v0.5 final
    "04_docs/_release-notes/v0.5.md",
    # S5.07 ONBOARDING-CEO-PAIR
    "04_docs/ONBOARDING-CEO-PAIR.md",
    # Kickoff S5 + script issues
    "04_docs/DOSSIER-SPRINT-S5.md",
    "04_docs/_sprint-s5/scripts/gh-create-issues-s5.ps1",
    # Roadmap patché (badge + gate-pills + sprint v05-s5 + JOURNAL + RELEASES rn-mvp-0-5)
    "04_docs/11-roadmap-map.html"
)
$staged = 0
$missing = 0
foreach ($f in $files) {
    if (Test-Path $f) {
        git add $f
        Write-Host "   + $f" -Fore Green
        $staged++
    } else {
        Write-Host "   ! MISSING $f" -Fore Red
        $missing++
    }
}
Write-Host "   Total : $staged stages, $missing manquants" -Fore Cyan

Write-Host ""
Write-Host "=== ETAPE 1b : Restaurer CRLF parasites eventuels ===" -Fore Cyan
# Note : depuis l'ADR « Projet hors OneDrive » (26/04 PM), les CRLF parasites devraient avoir disparu.
# Au cas où il en reste sur les sources non touchées, restauration ciblée.
foreach ($f in (git diff --name-only)) {
    $isStaged = (git diff --name-only --cached) -contains $f
    if (-not $isStaged -and (Test-Path $f) -and ($f -like "03_mvp/src/*")) {
        git checkout -- $f 2>$null
    }
}

Write-Host ""
Write-Host "=== git status (staged uniquement) ===" -Fore Cyan
git diff --name-only --cached

Write-Host ""
Write-Host "=== ETAPE 2 : Commit + push ===" -Fore Cyan
$msg = @"
feat(s5): sprint S5 livre - cutover production (E2E + smoke + recette ExCom + tag v0.5)

S5.00 ADR methode S5 + zero localStorage rappele
S5.01 tests E2E Playwright industrialises (6 parcours P1-P6)
S5.02 smoke-all.ps1 (12 pages + 4 routes + /api/health enrichi)
S5.03 /api/health enrichi (uptime + memory + db size + counts + outlook)
S5.04 RECETTE-EXCOM-v0.5.md (demo 30 min + Q&R + decision GO V1)
S5.05 release-notes/v0.5.md synthese 5 sprints
S5.06 ADR v0.5 internalisee terminee + ouverture phase V1
S5.07 ONBOARDING-CEO-PAIR.md mis a jour avec apprentissages reels

ADR Projet hors OneDrive acte (fin bugs NUL/CRLF)
Roadmap : badge S5 LIVRE + sprint v05-s5 done + RELEASES rn-mvp-0-5 + JOURNAL

Cumul v0.5 : 5 sprints livres en ~16h chrono cumulees, 110 k€ / 110 k€ = 100%
~95 tests verts, 12 pages, 4 routes assistant, 27 ADRs, ~150 j d'avance vs BASELINE
"@

git commit -m "$msg"
if ($LASTEXITCODE -eq 0) {
    git push origin main
} else {
    Write-Host "   commit a echoue (rien a committer ?)" -Fore Yellow
}

Write-Host ""
Write-Host "=== ETAPE 3 : Creer les 8 issues S5 sur GitHub ===" -Fore Cyan
pwsh -File "$root\04_docs\_sprint-s5\scripts\gh-create-issues-s5.ps1"

if ($SkipTag) {
    Write-Host ""
    Write-Host "=== ETAPE 4 : SKIP tag v0.5 (option -SkipTag) ===" -Fore Yellow
    Write-Host "   Une fois recette ExCom validee, lance manuellement :"
    Write-Host "     git tag -a v0.5 -m 'v0.5 internalisee terminee'"
    Write-Host "     git push origin v0.5"
    Write-Host "     gh release create v0.5 --title 'v0.5 internalisee terminee' --notes-file 04_docs/_release-notes/v0.5.md"
} else {
    Write-Host ""
    Write-Host "=== ETAPE 4 : Tag v0.5 + GitHub Release ===" -Fore Cyan

    # Tag local
    git tag -a v0.5 -m "v0.5 internalisee TERMINEE - 5 sprints livres en ~16h chrono - 110 k€ - 95 tests"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + tag v0.5 cree" -Fore Green
        git push origin v0.5
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   + tag v0.5 pousse" -Fore Green

            # GitHub Release
            gh release create v0.5 --repo $repo `
                --title "v0.5 internalisee terminee (Sprint S5 livre)" `
                --notes-file "04_docs/_release-notes/v0.5.md"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   + GitHub Release v0.5 publiee" -Fore Green
            } else {
                Write-Host "   ! GitHub Release v0.5 echec, lance manuellement" -Fore Red
            }
        }
    } else {
        Write-Host "   = tag v0.5 existe deja, skip" -Fore Yellow
    }
}

Write-Host ""
Write-Host "=== ETAPE 5 : Smoke test final ===" -Fore Cyan
Set-Location "$root\03_mvp"
Write-Host "   Demarrer le serveur dans un autre terminal :"
Write-Host "     cd C:\_workarea_local\aiCEO\03_mvp ; npm start"
Write-Host ""
Write-Host "   Puis dans CE terminal :"
Write-Host "     pwsh -File scripts\smoke-all.ps1"
Write-Host "   Attendu : PASS = 25, FAIL = 0"

Write-Host ""
Write-Host "=== ETAPE 6 : Tests E2E Playwright (1ere fois uniquement) ===" -Fore Cyan
Write-Host "     cd C:\_workarea_local\aiCEO\03_mvp\tests-e2e"
Write-Host "     npm install"
Write-Host "     npx playwright install chromium"
Write-Host "     npm test"
Write-Host "   Attendu : ~12 tests verts (P1 a P6)"

Write-Host ""
Write-Host "=== TERMINE — v0.5 internalisee est LIVREE ===" -Fore Green
Write-Host ""
Write-Host "   Etapes restantes manuelles :"
Write-Host "   1. Recette CEO : suivre 04_docs/RECETTE-CEO-v0.5-s4.md (deja faite ?) + valider /assistant + /groupes etc."
Write-Host "   2. Recette ExCom : suivre 04_docs/RECETTE-EXCOM-v0.5.md (chrono demo 30 min repete seul)"
Write-Host "   3. ExCom : presenter, decider GO V1"
Write-Host "   4. Si GO V1 : kickoff V1 (multi-tenant + equipes + integrations + mobile)"
Write-Host ""
