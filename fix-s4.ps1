# fix-s4.ps1
# Script de remediation S4 — a lancer depuis C:\_workarea_local\aiCEO
# Usage : pwsh -File fix-s4.ps1   (ou .\fix-s4.ps1 si execution policy permet)
#
# Etapes :
#   0. Tuer le serveur fantome sur :4747 (lock DB + ancien code)
#   1. Stager les 11 fichiers S4 + restaurer les modifs CRLF parasites
#   2. Commit + push
#   3. Creer les labels GitHub manquants
#   4. Lancer gh-create-issues-s4.ps1
#   5. Reset DB
#   (le npm start est laisse a l'utilisateur a la fin)

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"
$mvp  = Join-Path $root "03_mvp"
Set-Location $root

Write-Host "`n=== FIX 0 : Tuer le serveur fantome sur :4747 ===" -Fore Cyan
$conns = Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue
if ($conns) {
    $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
        try {
            Stop-Process -Id $_ -Force -ErrorAction Stop
            Write-Host "   killed PID $_" -Fore Green
        } catch {
            Write-Host "   PID $_ deja mort" -Fore Yellow
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   port 4747 libre, rien a tuer" -Fore Yellow
}

Write-Host "`n=== FIX 1 : Stager les 11 fichiers S4 ===" -Fore Cyan
$files = @(
    "03_mvp/server.js",
    "03_mvp/src/routes/assistant.js",
    "03_mvp/public/assistant.html",
    "03_mvp/tests/assistant.test.js",
    "03_mvp/data/migrations/2026-04-26-s4-assistant.sql",
    "00_BOUSSOLE/DECISIONS.md",
    "04_docs/DOSSIER-SPRINT-S4.md",
    "04_docs/POA-SPRINT-S4.xlsx",
    "04_docs/KICKOFF-S4.pptx",
    "04_docs/_sprint-s4/scripts/gh-create-issues-s4.ps1",
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

Write-Host "`n=== FIX 1b : Restaurer les fichiers modifies par CRLF auto-conversion ===" -Fore Cyan
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
        git checkout -- $f
    }
}
# Tests : restaurer tout le dossier (sauf assistant.test.js deja stage)
git checkout -- 03_mvp/tests/arbitrage.test.js
git checkout -- 03_mvp/tests/big-rocks.test.js
git checkout -- 03_mvp/tests/cockpit.test.js
git checkout -- 03_mvp/tests/e2e-hebdo.test.js
git checkout -- 03_mvp/tests/e2e.test.js
git checkout -- 03_mvp/tests/evening.test.js
git checkout -- 03_mvp/tests/events.test.js
git checkout -- 03_mvp/tests/migration.test.js
git checkout -- 03_mvp/tests/realtime-emit.test.js
git checkout -- 03_mvp/tests/realtime.test.js
git checkout -- 03_mvp/tests/system.test.js
git checkout -- 03_mvp/tests/weekly-reviews-draft.test.js
git checkout -- 03_mvp/tests/weekly-reviews.test.js
Write-Host "   CRLF parasites restaures" -Fore Green

Write-Host "`n=== git status (devrait montrer 11 fichiers staged) ===" -Fore Cyan
git status --short

Write-Host "`n=== FIX 2 : Commit + push ===" -Fore Cyan
git commit -m "feat(s4): kickoff + S4.00 ADR + S4.01 backend assistant + S4.02 frontend chat live SSE"
if ($LASTEXITCODE -eq 0) {
    git push origin main
} else {
    Write-Host "   commit a echoue (peut-etre rien a committer ?)" -Fore Yellow
}

Write-Host "`n=== FIX 3 : Creer les labels GitHub manquants ===" -Fore Cyan
gh label create "sprint/s4" --color "FBCA04" --description "Sprint S4 — assistant + 5 pages portefeuille" 2>&1 | Out-String | Write-Host
gh label create "Cockpit"   --color "0E8A16" --description "Pile cockpit (assistant, polish UX, install Windows)" 2>&1 | Out-String | Write-Host

Write-Host "`n=== FIX 4 : Re-lancer le script issues S4 ===" -Fore Cyan
pwsh -File "$root\04_docs\_sprint-s4\scripts\gh-create-issues-s4.ps1"

Write-Host "`n=== FIX 5 : Reset DB ===" -Fore Cyan
Set-Location $mvp
npm run db:reset

Write-Host "`n=== TERMINE ===" -Fore Cyan
Write-Host "  Pour demarrer le serveur :"
Write-Host "    cd $mvp"
Write-Host "    npm start"
Write-Host "  Puis ouvrir : http://localhost:4747/assistant"
Write-Host ""
