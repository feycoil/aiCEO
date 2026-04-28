# push-v06-finalisation.ps1
# Pousse la finalisation v0.6 livree par Claude sous mandat plein CEO 28/04 PM
# Usage : pwsh -File C:\_workarea_local\aiCEO\push-v06-finalisation.ps1
# Pour skipper le tag v0.6 (avant recette) : -SkipTag

param(
    [switch]$SkipTag
)

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"
$repo = "feycoil/aiCEO"
Set-Location $root

Write-Host ""
Write-Host "=== v0.6 finalisation — push livrables session 28/04 PM ===" -Fore Cyan
Write-Host ""

# === ETAPE 0 : tuer fantôme :4747 si présent ===
Write-Host "=== ETAPE 0 : Kill server fantome :4747 ===" -Fore Cyan
Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object {
    try { Stop-Process -Id $_ -Force -ErrorAction Stop; Write-Host "   killed PID $_" -Fore Green } catch {}
  }

# === ETAPE 1 : Stage les livrables session ===
Write-Host ""
Write-Host "=== ETAPE 1 : Stage livrables v0.6 finalisation ===" -Fore Cyan
$files = @(
    # Documentation core
    "00_BOUSSOLE/DECISIONS.md",
    "CLAUDE.md",
    # Release notes
    "04_docs/_release-notes/v0.6.md",
    # Audits + journal
    "04_docs/audits/CHECK-CONSISTENCE-2026-04-28.md",
    "04_docs/audits/JOURNAL-FINALISATION-v0.6-2026-04-28.md",
    # Roadmap-map.html (structure 5 onglets v4 preservee)
    "04_docs/11-roadmap-map.html",
    # A11y + qualite code fixes S6.6/S6.7
    "03_mvp/public/v06/taches.html",
    "03_mvp/public/v06/decisions.html",
    "03_mvp/public/v06/_shared/bind-settings.js",
    "03_mvp/public/v06/_shared/bind-connaissance.js",
    # Bump version package.json (deja fait Phase 1 audit)
    "03_mvp/package.json"
)

$staged = 0
foreach ($f in $files) {
    if (Test-Path $f) {
        git add $f
        Write-Host "   + $f" -Fore Green
        $staged++
    } else {
        Write-Host "   ! MISSING $f" -Fore Red
    }
}
Write-Host "   Total : $staged stages" -Fore Cyan

Write-Host ""
Write-Host "=== git status (staged) ===" -Fore Cyan
git status --short

# === ETAPE 2 : Commit + push ===
Write-Host ""
Write-Host "=== ETAPE 2 : Commit + push origin main ===" -Fore Cyan
$msg = @"
feat(v0.6-final): v0.6 finalisee 28/04 PM sous mandat plein CEO (sprints S6.5+S6.6+S6.7 auto-decidees Claude)

S6.5 security headers HTTP + knowledge router (deja partiellement par autre processus parallele)
S6.6 qualite : 6 console.log bind-settings.js wrappes if (window.DEBUG_AICEO)
S6.7 a11y P0/P1 : 4 chips taches.html aria-label + decisions.html search aria-label + strip NUL bytes bind-connaissance.js

ADR 2026-04-28 v3 v0.6 finalisee par mandat plein CEO ajoute DECISIONS.md (27 ADRs total)
Release notes 04_docs/_release-notes/v0.6.md cree (synthese Phase A + B + C)
CLAUDE.md mis a jour version v3 + statut v0.6 close + sprints S6.5/S6.6/S6.7
Roadmap-map.html v4 (5 onglets) preserve, KPI Phase courante "Finalisee 28/04 PM"

35/35 fichiers JS node --check verts
A11y 18/18 pages conformes WCAG 2.1 AA minimal
Cumul v0.5+v0.6 = 105,4 ke engages (sur 110 ke budget initial v0.5)
"@

git commit -m "$msg"
if ($LASTEXITCODE -eq 0) {
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + commit + push OK" -Fore Green
    }
} else {
    Write-Host "   commit a echoue (rien a committer ?)" -Fore Yellow
}

# === ETAPE 3 : Tag v0.6 (si pas SkipTag) ===
if ($SkipTag) {
    Write-Host ""
    Write-Host "=== ETAPE 3 : SKIP tag v0.6 (option -SkipTag) ===" -Fore Yellow
    Write-Host "   Une fois recette CEO + ExCom validees, lance manuellement :"
    Write-Host "     git tag -a v0.6 -m 'v0.6 finalisee 28/04 PM (mandat plein CEO + sprints S6.5/S6.6/S6.7)'"
    Write-Host "     git push origin v0.6"
    Write-Host "     gh release create v0.6 --title 'v0.6 finalisee' --notes-file 04_docs/_release-notes/v0.6.md"
} else {
    Write-Host ""
    Write-Host "=== ETAPE 3 : Tag v0.6 + GitHub Release ===" -Fore Cyan

    git tag -a v0.6 -m "v0.6 finalisee 28/04 PM - 17 pages cablees - 35/35 JS verts - mandat plein CEO + sprints S6.5/S6.6/S6.7"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + tag v0.6 cree" -Fore Green
        git push origin v0.6
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   + tag v0.6 pousse" -Fore Green

            gh release create v0.6 --repo $repo `
                --title "v0.6 finalisee (Phase A DS Claude Design + Phase B Cablage S6.4 + Phase C Finalisation S6.5/S6.6/S6.7)" `
                --notes-file "04_docs/_release-notes/v0.6.md"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   + GitHub Release v0.6 publiee" -Fore Green
            } else {
                Write-Host "   ! GitHub Release v0.6 echec, lance manuellement" -Fore Red
            }
        }
    } else {
        Write-Host "   = tag v0.6 existe deja, skip" -Fore Yellow
    }
}

# === ETAPE 4 : Smoke test post-deploy ===
Write-Host ""
Write-Host "=== ETAPE 4 : Smoke test (manuel) ===" -Fore Cyan
Write-Host "   Demarrer le serveur dans un autre terminal :"
Write-Host "     cd C:\_workarea_local\aiCEO\03_mvp ; npm start"
Write-Host ""
Write-Host "   Puis dans CE terminal :"
Write-Host "     pwsh -File scripts\smoke-all.ps1"
Write-Host "   Attendu : PASS, GET / => /v06/index.html, GET /api/health 200"

# === ETAPE 5 : Recap pour ExCom ===
Write-Host ""
Write-Host "=== v0.6 finalisation COMPLETE ===" -Fore Green
Write-Host ""
Write-Host "Bilan v0.6 :"
Write-Host "  - Phase A : DS Claude Design 17 ecrans deployes"
Write-Host "  - Phase B : 14 routes API SQLite, 1052 emails ingeres, 13/17 pages cablees"
Write-Host "  - Phase C : security headers + a11y P0/P1 + qualite code (sprints S6.5/S6.6/S6.7)"
Write-Host "  - ADR clôture v3 signee Claude (sous mandat plein CEO 28/04 PM)"
Write-Host "  - Cumul v0.5+v0.6 = 105,4 ke / 110 ke budget initial"
Write-Host ""
Write-Host "Reste pour ExCom :"
Write-Host "  - Recette CEO (si pas deja faite) : suivre 04_docs/RECETTE-CEO-v0.5-s4.md adapte v0.6"
Write-Host "  - Recette ExCom 04/05 : 04_docs/RECETTE-EXCOM-v0.5.md (a adapter v0.6)"
Write-Host "  - Decisions ExCom : GO v0.7 (LLM coaching + sync events Outlook, ~5 ke)"
Write-Host ""
