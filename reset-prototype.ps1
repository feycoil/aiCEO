# reset-prototype.ps1 — Reset complet + relance prototype v0.6
#
# Actions :
#   1. Backup automatique de aiceo.db (data/backup-YYYYMMDD-HHMM.db)
#   2. Kill tous les process node
#   3. npm run db:reset (efface + recrée schéma vide)
#   4. npm run seed (charge données démo)
#   5. Relance serveur sur :4747
#   6. Attente boot
#   7. Ouvre http://localhost:4747/
#
# Usage : pwsh -File reset-prototype.ps1
#         pwsh -File reset-prototype.ps1 -NoSeed     (vide la base sans seed)
#         pwsh -File reset-prototype.ps1 -NoBackup   (skip backup)

param(
    [switch]$NoSeed,
    [switch]$NoBackup
)

$ErrorActionPreference = "Continue"
$mvp = "C:\_workarea_local\aiCEO\03_mvp"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  aiCEO v0.6 — Reset prototype  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backup automatique
if (-not $NoBackup) {
    $dbFile = "$mvp\data\aiceo.db"
    if (Test-Path $dbFile) {
        $stamp = Get-Date -Format "yyyyMMdd-HHmm"
        $backup = "$mvp\data\backup-aiceo-$stamp.db"
        try {
            Copy-Item -Path $dbFile -Destination $backup -ErrorAction Stop
            $size = [math]::Round((Get-Item $backup).Length / 1KB, 1)
            Write-Host "[1] Backup cree : data\backup-aiceo-$stamp.db ($size ko)" -ForegroundColor Green
        } catch {
            Write-Host "[1] Backup echoue (DB peut-etre verrouillee, on continue) : $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[1] Pas de DB existante (premier lancement)" -ForegroundColor Gray
    }
} else {
    Write-Host "[1] Backup skip (-NoBackup)" -ForegroundColor Gray
}

# 2. Kill node
Write-Host ""
Write-Host "[2] Tuer tous les process node..." -ForegroundColor Yellow
$killed = 0
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    $killed++
}
if ($killed -gt 0) {
    Write-Host "    $killed process(es) node tue(s)" -ForegroundColor Green
} else {
    Write-Host "    Aucun process node a tuer" -ForegroundColor Gray
}
Start-Sleep -Seconds 2

# Kill aussi pwsh wrappers logon
Get-WmiObject Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match "server.js|aiCEO-Server" } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "    Wrapper PID $($_.ProcessId) tue" -ForegroundColor Green
  }

Start-Sleep -Seconds 1

# 3. db:reset
Write-Host ""
Write-Host "[3] Reset DB (efface + recree schema)..." -ForegroundColor Yellow
Set-Location $mvp
try {
    $output = & npm run db:reset 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    DB resette" -ForegroundColor Green
    } else {
        Write-Host "    [FAIL] db:reset exit=$LASTEXITCODE" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "    [FAIL] $_" -ForegroundColor Red
    exit 1
}

# 4. Seed
if (-not $NoSeed) {
    Write-Host ""
    Write-Host "[4] Seed donnees demo..." -ForegroundColor Yellow
    try {
        $output = & npm run seed 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    Donnees demo chargees" -ForegroundColor Green
        } else {
            Write-Host "    Seed echoue (continue avec base vide) : exit=$LASTEXITCODE" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    Seed echoue (continue) : $_" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[4] Seed skip (-NoSeed) - base vide, maquette demo Claude Design s'affichera" -ForegroundColor Gray
}

# 5. Reset localStorage cote navigateur (info au CEO)
Write-Host ""
Write-Host "[5] Pour reset prefs UI (drawer collapsed, etc.) :" -ForegroundColor Yellow
Write-Host "    F12 -> Console -> localStorage.clear()" -ForegroundColor Gray

# 6. Relance serveur
Write-Host ""
Write-Host "[6] Relance serveur sur :4747..." -ForegroundColor Yellow
$startCmd = "cd '$mvp'; `$env:PORT=4747; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd -WindowStyle Normal
Write-Host "    Lance dans nouvelle fenetre PowerShell" -ForegroundColor Green

# 7. Attente boot
Write-Host ""
Write-Host "[7] Attente serveur (max 15 sec)..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:4747/api/system/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            $ready = $true
            Write-Host "    Serveur ready apres $($i+1) sec" -ForegroundColor Green
            break
        }
    } catch {}
}
if (-not $ready) {
    Write-Host "    [WARN] Serveur pas demarre apres 15s (verifier nouvelle fenetre)" -ForegroundColor Yellow
}

# 8. Ouvre navigateur
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  Prototype reset et relance  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mode :" -ForegroundColor White
if ($NoSeed) {
    Write-Host "  Base VIDE -> tu vois la maquette demo Claude Design (Aubrielle, Northwind...)" -ForegroundColor Gray
} else {
    Write-Host "  Base SEED -> tu vois les donnees de demo realistes (extract de 01_app-web)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "URLs :" -ForegroundColor White
Write-Host "  http://localhost:4747/                (redirect hub)" -ForegroundColor Gray
Write-Host "  http://localhost:4747/v06/index.html  (cockpit)" -ForegroundColor Gray
Write-Host "  http://localhost:4747/v06/taches.html (taches)" -ForegroundColor Gray
Write-Host ""

if ($ready) {
    Write-Host "Ouverture navigateur..." -ForegroundColor Green
    Start-Process "http://localhost:4747/"
}

Write-Host ""
Write-Host "Pour reset sans seed : pwsh -File reset-prototype.ps1 -NoSeed" -ForegroundColor Gray
Write-Host "Pour reset sans backup : pwsh -File reset-prototype.ps1 -NoBackup" -ForegroundColor Gray
Write-Host ""
