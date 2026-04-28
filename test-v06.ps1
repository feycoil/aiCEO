# test-v06.ps1 — Test rapide deploiement Claude Design v0.6
#
# Usage : pwsh -File test-v06.ps1

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Test deploiement Claude Design v0.6 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Etat repo
Write-Host "[1] Verification arbo public/" -ForegroundColor Yellow
$base = "C:\_workarea_local\aiCEO\03_mvp\public"
$tests = @(
    @{ path = "$base\v06\hub.html";                   label = "Hub v0.6" },
    @{ path = "$base\v06\index.html";                 label = "Cockpit v0.6" },
    @{ path = "$base\v06\arbitrage.html";             label = "Arbitrage v0.6" },
    @{ path = "$base\v06\evening.html";               label = "Evening v0.6" },
    @{ path = "$base\v06\onboarding.html";            label = "Onboarding v0.6" },
    @{ path = "$base\v06\settings.html";              label = "Settings v0.6" },
    @{ path = "$base\v06\components.html";            label = "Storybook v0.6" },
    @{ path = "$base\v06\_shared\app.css";            label = "DS app.css" },
    @{ path = "$base\v06\_shared\colors_and_type.css"; label = "DS colors_and_type.css" },
    @{ path = "$base\v06\_shared\icons.svg.html";     label = "Sprite 54 icones" },
    @{ path = "$base\v06\manifest.webmanifest";       label = "PWA manifest" },
    @{ path = "$base\v06\sw.js";                      label = "Service worker" },
    @{ path = "$base\_shared-atomic";                 label = "Archive S6.1 _shared-atomic/" },
    @{ path = "$base\components-atomic.html";         label = "Archive S6.1.5 storybook" }
)
foreach ($t in $tests) {
    if (Test-Path $t.path) {
        $size = if ((Get-Item $t.path).PSIsContainer) { (Get-ChildItem $t.path -Recurse -File | Measure-Object -Sum Length).Sum } else { (Get-Item $t.path).Length }
        Write-Host "    [OK] $($t.label) ($([math]::Round($size/1024, 1)) ko)" -ForegroundColor Green
    } else {
        Write-Host "    [KO] $($t.label) MANQUANT" -ForegroundColor Red
    }
}

# 2. Test serveur Express
Write-Host ""
Write-Host "[2] Test HTTP sur localhost:4747" -ForegroundColor Yellow
$urls = @(
    "http://localhost:4747/v06/hub.html",
    "http://localhost:4747/v06/index.html",
    "http://localhost:4747/v06/arbitrage.html",
    "http://localhost:4747/v06/_shared/app.css",
    "http://localhost:4747/v06/_shared/icons.svg.html",
    "http://localhost:4747/v06/manifest.webmanifest",
    "http://localhost:4747/components-atomic.html"
)
foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "    [OK] $url -> $($r.StatusCode) ($($r.RawContentLength) bytes)" -ForegroundColor Green
    } catch {
        Write-Host "    [KO] $url -> $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Verdict
Write-Host ""
Write-Host "=== Ouverture navigateur ===" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://localhost:4747/v06/hub.html" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop | Out-Null
    Write-Host "[OK] Hub v0.6 accessible. Ouverture..." -ForegroundColor Green
    Start-Process "http://localhost:4747/v06/hub.html"
} catch {
    Write-Host "[KO] Serveur non accessible. Lance d'abord :" -ForegroundColor Red
    Write-Host "       cd C:\_workarea_local\aiCEO\03_mvp" -ForegroundColor Gray
    Write-Host "       `$env:PORT=4747; npm start" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Notes ===" -ForegroundColor Cyan
Write-Host "  - Service worker peut cacher en dev. Si pages bizarres :" -ForegroundColor Gray
Write-Host "    F12 -> Application -> Service Workers -> Unregister" -ForegroundColor Gray
Write-Host "    Puis Ctrl+F5 hard reload" -ForegroundColor Gray
Write-Host "  - Pages v0.5 historiques : http://localhost:4747/index.html (cockpit), /arbitrage, etc." -ForegroundColor Gray
Write-Host "  - Storybook S6.1 archive : http://localhost:4747/components-atomic.html" -ForegroundColor Gray
Write-Host "  - Storybook Claude Design : http://localhost:4747/v06/components.html" -ForegroundColor Gray
