# diag-server.ps1 — Diagnostic + relance serveur aiCEO
#
# Usage : pwsh -File diag-server.ps1
#         (ou si pwsh absent : powershell -ExecutionPolicy Bypass -File diag-server.ps1)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Diagnostic serveur aiCEO ===" -ForegroundColor Cyan
Write-Host ""

# 1. Process node ?
Write-Host "[1] Process node en cours..." -ForegroundColor Yellow
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Format-Table Id, ProcessName, StartTime, Path -AutoSize
} else {
    Write-Host "    Aucun process node detecte." -ForegroundColor Gray
}

# 2. Ports 3001 + 4747
Write-Host ""
Write-Host "[2] Etat des ports 3001 et 4747..." -ForegroundColor Yellow
foreach ($port in @(3001, 4747)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    if ($conn) {
        $proc = Get-Process -Id $conn[0].OwningProcess -ErrorAction SilentlyContinue
        Write-Host "    Port $port : OCCUPE par PID $($conn[0].OwningProcess) ($($proc.ProcessName))" -ForegroundColor Green
    } else {
        Write-Host "    Port $port : libre" -ForegroundColor Gray
    }
}

# 3. Test HTTP sur les deux ports
Write-Host ""
Write-Host "[3] Test HTTP /api/health..." -ForegroundColor Yellow
foreach ($port in @(3001, 4747)) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "    http://localhost:$port/api/health -> $($r.StatusCode)" -ForegroundColor Green
        Write-Host "      Body: $($r.Content.Substring(0, [Math]::Min(150, $r.Content.Length)))" -ForegroundColor Gray
    } catch {
        Write-Host "    http://localhost:$port/api/health -> KO ($($_.Exception.Message))" -ForegroundColor Red
    }
}

# 4. Test /components.html
Write-Host ""
Write-Host "[4] Test HTTP /components.html..." -ForegroundColor Yellow
foreach ($port in @(3001, 4747)) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$port/components.html" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "    http://localhost:$port/components.html -> $($r.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "    http://localhost:$port/components.html -> KO" -ForegroundColor Red
    }
}

# 5. Logs Variante D ?
Write-Host ""
Write-Host "[5] Logs wrapper Variante D..." -ForegroundColor Yellow
$logPath = "$env:LOCALAPPDATA\aiCEO\server.log"
if (Test-Path $logPath) {
    Write-Host "    Log file : $logPath" -ForegroundColor Gray
    Write-Host "    Dernieres 10 lignes :" -ForegroundColor Gray
    Get-Content $logPath -Tail 10 | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkGray }
} else {
    Write-Host "    Aucun log Variante D ($logPath introuvable)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Verdict + actions ===" -ForegroundColor Cyan
Write-Host ""
$port4747ok = $false
$port3001ok = $false
try { Invoke-WebRequest -Uri "http://localhost:4747/api/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop | Out-Null; $port4747ok = $true } catch {}
try { Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop | Out-Null; $port3001ok = $true } catch {}

if ($port4747ok) {
    Write-Host "[OK] Serveur Variante D OK sur 4747." -ForegroundColor Green
    Write-Host "     Ouvrir : start http://localhost:4747/components.html" -ForegroundColor White
    Start-Process "http://localhost:4747/components.html"
} elseif ($port3001ok) {
    Write-Host "[OK] Serveur en mode dev sur 3001 (pas Variante D)." -ForegroundColor Green
    Write-Host "     Ouvrir : start http://localhost:3001/components.html" -ForegroundColor White
    Start-Process "http://localhost:3001/components.html"
} else {
    Write-Host "[KO] Aucun serveur ne repond." -ForegroundColor Red
    Write-Host ""
    Write-Host "Choix de relance :" -ForegroundColor Yellow
    Write-Host "  A) Mode dev (foreground, port 3001) - recommande pour debug :" -ForegroundColor White
    Write-Host "       cd C:\_workarea_local\aiCEO\03_mvp" -ForegroundColor Gray
    Write-Host "       npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  B) Mode dev avec port 4747 (compatible Variante D) :" -ForegroundColor White
    Write-Host "       cd C:\_workarea_local\aiCEO\03_mvp" -ForegroundColor Gray
    Write-Host "       `$env:PORT=4747; npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  C) Relancer Variante D logon shortcut (background) :" -ForegroundColor White
    Write-Host "       Start-Process `"$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\aiCEO-Server.lnk`"" -ForegroundColor Gray
    Write-Host ""
    $choix = Read-Host "Lancer A automatiquement ? (o/N)"
    if ($choix -eq "o" -or $choix -eq "O") {
        Set-Location "C:\_workarea_local\aiCEO\03_mvp"
        Write-Host ""
        Write-Host "[INFO] Lancement npm start... (Ctrl+C pour arreter)" -ForegroundColor Cyan
        Write-Host "       Ouvrir dans navigateur : http://localhost:3001/components.html" -ForegroundColor White
        Write-Host ""
        Start-Process "http://localhost:3001/components.html"
        npm start
    }
}
