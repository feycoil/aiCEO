# start-prototype-v06.ps1 — Lance / restart le prototype v0.6 fonctionnel
#
# Usage : pwsh -File start-prototype-v06.ps1
#
# Actions :
#   1. Tue serveur fantome sur 4747
#   2. Lance npm start sur 4747 (background)
#   3. Attend que le serveur réponde
#   4. Audit cohérence v06
#   5. Ouvre / (= /v06/hub.html)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  aiCEO Prototype v0.6 — Demarrage  " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kill serveur fantôme
Write-Host "[1] Tuer eventuels serveurs sur 4747..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "    PID $($_.OwningProcess) tue" -ForegroundColor Green
    } catch {}
}
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "    PID $($_.OwningProcess) tue (port 3001)" -ForegroundColor Green
    } catch {}
}
Start-Sleep -Seconds 1

# 2. Audit fichiers v06
Write-Host ""
Write-Host "[2] Audit coherence prototype v0.6..." -ForegroundColor Yellow
$base = "C:\_workarea_local\aiCEO\03_mvp\public\v06"
$pages = @("hub.html", "index.html", "arbitrage.html", "evening.html", "onboarding.html", "settings.html", "components.html")
$shared = @("shell.js", "bind-cockpit.js", "bind-arbitrage.js", "bind-evening.js", "bind-settings.js", "bind-onboarding.js", "app.css", "colors_and_type.css", "tweaks.css", "icons.svg.html")
$allOK = $true
foreach ($p in $pages) {
    $f = "$base\$p"
    if (Test-Path $f) {
        $size = (Get-Item $f).Length
        Write-Host "    [OK] page $p ($([math]::Round($size/1024, 1)) ko)" -ForegroundColor Green
    } else {
        Write-Host "    [KO] page $p MANQUANTE" -ForegroundColor Red
        $allOK = $false
    }
}
foreach ($s in $shared) {
    $f = "$base\_shared\$s"
    if (Test-Path $f) {
        Write-Host "    [OK] _shared/$s" -ForegroundColor Green
    } else {
        Write-Host "    [KO] _shared/$s MANQUANT" -ForegroundColor Red
        $allOK = $false
    }
}

if (-not $allOK) {
    Write-Host ""
    Write-Host "[FAIL] Fichiers manquants — abort" -ForegroundColor Red
    exit 1
}

# 3. Lancer npm start en background
Write-Host ""
Write-Host "[3] Lancement serveur sur localhost:4747..." -ForegroundColor Yellow
$mvp = "C:\_workarea_local\aiCEO\03_mvp"

# Démarrer dans nouvelle fenêtre PowerShell visible (pour log)
$startCmd = "cd '$mvp'; `$env:PORT=4747; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd -WindowStyle Normal
Write-Host "    Serveur lance en arriere-plan (nouvelle fenetre)" -ForegroundColor Green
Write-Host "    Logs visibles dans la nouvelle fenetre PowerShell" -ForegroundColor Gray

# 4. Attente boot serveur (poll /api/health)
Write-Host ""
Write-Host "[4] Attente serveur (max 15 sec)..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:4747/api/system/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            $ready = $true
            Write-Host "    [OK] Serveur ready apres $($i+1) sec" -ForegroundColor Green
            break
        }
    } catch {}
}
if (-not $ready) {
    Write-Host "    [KO] Serveur pas demarre apres 15 sec" -ForegroundColor Red
    Write-Host "    Verifie la nouvelle fenetre PowerShell pour erreurs" -ForegroundColor Gray
    exit 1
}

# 5. Test rapide endpoints
Write-Host ""
Write-Host "[5] Test endpoints clefs..." -ForegroundColor Yellow
$urls = @(
    "http://localhost:4747/",                            # redirect / -> /v06/hub.html
    "http://localhost:4747/v06/hub.html",
    "http://localhost:4747/v06/index.html",              # cockpit
    "http://localhost:4747/v06/arbitrage.html",
    "http://localhost:4747/v06/evening.html",
    "http://localhost:4747/v06/settings.html",
    "http://localhost:4747/v06/_shared/shell.js",
    "http://localhost:4747/v06/_shared/bind-cockpit.js",
    "http://localhost:4747/v06/_shared/icons.svg.html",
    "http://localhost:4747/api/cockpit/today",
    "http://localhost:4747/api/tasks?done=false&limit=3",
    "http://localhost:4747/api/projects?status=active&limit=6"
)
foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -MaximumRedirection 3 -ErrorAction Stop
        Write-Host "    [OK] $url -> $($r.StatusCode)" -ForegroundColor Green
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -eq 204) {
            Write-Host "    [OK] $url -> 204 (no content, normal)" -ForegroundColor Green
        } else {
            Write-Host "    [KO] $url -> $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 6. Ouverture navigateur
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Prototype v0.6 PRET  " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Point d'entree unique :" -ForegroundColor White
Write-Host "  http://localhost:4747/   (redirige vers /v06/hub.html)" -ForegroundColor Gray
Write-Host ""
Write-Host "URLs principales :" -ForegroundColor White
Write-Host "  /v06/hub.html         - Page d'accueil (7 cartes)" -ForegroundColor Gray
Write-Host "  /v06/index.html       - Cockpit (vraies donnees)" -ForegroundColor Gray
Write-Host "  /v06/arbitrage.html   - Arbitrage matin (vraies tasks)" -ForegroundColor Gray
Write-Host "  /v06/evening.html     - Boucle du soir (POST /api/evening)" -ForegroundColor Gray
Write-Host "  /v06/settings.html    - Reglages (sante systeme)" -ForegroundColor Gray
Write-Host ""
Write-Host "Notes :" -ForegroundColor Yellow
Write-Host "  - Items drawer 'Projets/Actions/Equipe/Connaissance/Coaching'" -ForegroundColor Gray
Write-Host "    sont GRISES (badge 'soon') car non implementes en v0.6." -ForegroundColor Gray
Write-Host "  - Cmd+K affiche un toast 'disponible en v0.7'." -ForegroundColor Gray
Write-Host "  - Service worker desactive en localhost (pas de cache piege)." -ForegroundColor Gray
Write-Host "  - Pages v0.5 historiques accessibles via /legacy ou URL directe (debug)." -ForegroundColor Gray
Write-Host ""
Write-Host "Si la page reste vide ou affiche les donnees demo :" -ForegroundColor Yellow
Write-Host "  F12 -> Application -> Service Workers -> Unregister" -ForegroundColor Gray
Write-Host "  Puis Ctrl+F5 (hard reload)" -ForegroundColor Gray
Write-Host ""

Start-Process "http://localhost:4747/"
