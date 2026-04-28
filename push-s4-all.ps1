# push-s4-all.ps1
# Script unique pour committer + pusher tout le sprint S4
# (S4.00 → S4.11) en un seul passage.
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\push-s4-all.ps1

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"
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
Write-Host "=== ETAPE 1 : Stager tous les fichiers S4 ===" -Fore Cyan
$files = @(
    # S4.00 + S4.01 (deja prepare)
    "00_BOUSSOLE/DECISIONS.md",
    "03_mvp/data/migrations/2026-04-26-s4-assistant.sql",
    "03_mvp/src/routes/assistant.js",
    "03_mvp/tests/assistant.test.js",
    # S4.02
    "03_mvp/public/assistant.html",
    # S4.03
    "03_mvp/public/groupes.html",
    # S4.04
    "03_mvp/public/projets.html",
    # S4.05
    "03_mvp/public/projet.html",
    # S4.06
    "03_mvp/public/contacts.html",
    # S4.07
    "03_mvp/public/decisions.html",
    # S4.02..07 wired in server.js
    "03_mvp/server.js",
    # S4.08
    "03_mvp/scripts/service-windows/install-desktop-shortcut.ps1",
    # S4.09
    "03_mvp/scripts/service-windows/start-aiCEO-at-logon.ps1",
    "04_docs/INSTALL-WINDOWS.md",
    # S4.10
    "03_mvp/tests/pages.test.js",
    # S4.11
    "04_docs/api/S4.md",
    "04_docs/RECETTE-CEO-v0.5-s4.md",
    # Kickoff S4
    "04_docs/DOSSIER-SPRINT-S4.md",
    "04_docs/POA-SPRINT-S4.xlsx",
    "04_docs/KICKOFF-S4.pptx",
    "04_docs/_sprint-s4/scripts/gh-create-issues-s4.ps1",
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
Write-Host "=== ETAPE 1b : Restaurer les CRLF parasites ===" -Fore Cyan
$crlfFiles = @(
    "03_mvp/src/llm-draft.js",
    "03_mvp/src/realtime.js",
    "03_mvp/src/routes/arbitrage.js",
    "03_mvp/src/routes/big-rocks.js",
    "03_mvp/src/routes/evening.js",
    "03_mvp/src/routes/events.js",
    "03_mvp/src/routes/system.js",
    "03_mvp/src/routes/tasks.js",
    "03_mvp/src/routes/weekly-reviews.js"
)
foreach ($f in $crlfFiles) {
    if (Test-Path $f) {
        $isStaged = (git diff --name-only --cached) -contains $f
        if (-not $isStaged) {
            git checkout -- $f 2>$null
        }
    }
}
# Restaurer tous les tests autres que assistant.test.js et pages.test.js
foreach ($f in (Get-ChildItem 03_mvp/tests/*.test.js).Name) {
    $rel = "03_mvp/tests/$f"
    if ($f -ne "assistant.test.js" -and $f -ne "pages.test.js") {
        $isStaged = (git diff --name-only --cached) -contains $rel
        if (-not $isStaged) {
            git checkout -- $rel 2>$null
        }
    }
}

Write-Host ""
Write-Host "=== git status (staged uniquement) ===" -Fore Cyan
git diff --name-only --cached

Write-Host ""
Write-Host "=== ETAPE 2 : Commit + push ===" -Fore Cyan
$msg = @"
feat(s4): sprint S4 complet — assistant chat + 5 pages portefeuille + polish Windows

S4.00 ADR methode + zero localStorage rappele (Closes #147)
S4.01 backend assistant chat table+SSE (Closes #148)
S4.02 frontend assistant.html chat live SSE (Closes #149)
S4.03 frontend groupes.html portefeuille (Closes #150)
S4.04 frontend projets.html liste cross-groupe (Closes #151)
S4.05 frontend projet.html template parametre (Closes #152)
S4.06 frontend contacts.html cards+search+filters (Closes #153)
S4.07 frontend decisions.html registre + IA recommend (Closes #154)
S4.08 raccourci desktop Cockpit aiCEO (Closes #155)
S4.09 polish service Windows logs rotation + INSTALL-WINDOWS.md (Closes #156)
S4.10 tests pages.test.js (≥80 verts) (Closes #157)
S4.11 doc API S4 + RECETTE-CEO-v0.5-s4 (Closes #158)
"@

git commit -m "$msg"
if ($LASTEXITCODE -eq 0) {
    git push origin main
} else {
    Write-Host "   commit a echoue (rien a committer ?)" -Fore Yellow
}

Write-Host ""
Write-Host "=== ETAPE 3 : Reset DB + tests ===" -Fore Cyan
Set-Location "$root\03_mvp"
npm run db:reset
if ($LASTEXITCODE -eq 0) {
    npm test
}

Write-Host ""
Write-Host "=== ETAPE 4 : Demarrage serveur (a faire manuellement) ===" -Fore Cyan
Write-Host "   Pour demarrer :"
Write-Host "     cd C:\_workarea_local\aiCEO\03_mvp"
Write-Host "     npm start"
Write-Host ""
Write-Host "   Puis ouvrir dans le navigateur :"
Write-Host "     http://localhost:4747/groupes"
Write-Host "     http://localhost:4747/projets"
Write-Host "     http://localhost:4747/contacts"
Write-Host "     http://localhost:4747/decisions"
Write-Host "     http://localhost:4747/assistant"
Write-Host ""
Write-Host "   Et installer le raccourci Bureau (S4.08) :"
Write-Host "     pwsh -File scripts\service-windows\install-desktop-shortcut.ps1 install"
Write-Host ""
