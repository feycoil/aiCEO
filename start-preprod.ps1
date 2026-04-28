# start-preprod.ps1 — Lance un serveur preprod isole sur port 4748
#
# Caracteristiques :
#   - Port 4748 (au lieu de 4747 dev)
#   - Base SQLite isolee : data/aiceo-preprod.db
#   - Seed automatique au premier lancement
#   - Coexistence avec le serveur dev (port 4747)
#
# Usage : pwsh -File start-preprod.ps1
#         pwsh -File start-preprod.ps1 -Reset    # reset complet base preprod
#         pwsh -File start-preprod.ps1 -Public   # + tunnel cloudflare public

param(
    [switch]$Reset,
    [switch]$Public
)

$ErrorActionPreference = "Continue"
$mvp = "C:\_workarea_local\aiCEO\03_mvp"
$dbName = "aiceo-preprod.db"
$dbPath = "$mvp\data\$dbName"
$port = 4748

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "  aiCEO PREPROD — Port $port  " -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""

# 1. Tue eventuels process sur 4748
Write-Host "[1] Tuer process sur port $port..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "    PID $($_.OwningProcess) tue" -ForegroundColor Green
}
Start-Sleep -Seconds 1

# 2. Reset si demande
if ($Reset -and (Test-Path $dbPath)) {
    Write-Host ""
    Write-Host "[2] Reset base preprod..." -ForegroundColor Yellow
    Remove-Item $dbPath -Force
    Write-Host "    $dbName supprimee" -ForegroundColor Green
}

# 3. Init base si absente + seed
if (-not (Test-Path $dbPath)) {
    Write-Host ""
    Write-Host "[3] Init base preprod + seed donnees demo..." -ForegroundColor Yellow
    Set-Location $mvp
    $env:AICEO_DB_OVERRIDE = $dbPath
    & node scripts/init-db.js 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Schema cree" -ForegroundColor Green
    } else {
        Write-Host "    [FAIL] init-db" -ForegroundColor Red
        exit 1
    }
    & npm run seed 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Donnees demo seedees" -ForegroundColor Green
    } else {
        Write-Host "    Seed skipped (continue avec base vide)" -ForegroundColor Yellow
    }
    $size = [math]::Round((Get-Item $dbPath).Length / 1KB, 1)
    Write-Host "    Base preprod : $dbName ($size ko)" -ForegroundColor Green
} else {
    $size = [math]::Round((Get-Item $dbPath).Length / 1KB, 1)
    Write-Host ""
    Write-Host "[3] Base preprod existante : $dbName ($size ko)" -ForegroundColor Gray
    Write-Host "    Pour reset : pwsh -File start-preprod.ps1 -Reset" -ForegroundColor Gray
}

# 4. Lance serveur preprod sur port 4748
Write-Host ""
Write-Host "[4] Lance serveur preprod sur :$port..." -ForegroundColor Yellow
$startCmd = @"
cd '$mvp'
`$env:PORT='$port'
`$env:AICEO_DB_OVERRIDE='$dbPath'
`$Host.UI.RawUI.WindowTitle = 'aiCEO PREPROD :$port'
node server.js
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd -WindowStyle Normal
Write-Host "    Serveur lance dans nouvelle fenetre" -ForegroundColor Green

# 5. Attente boot
Write-Host ""
Write-Host "[5] Attente serveur preprod..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$port/api/system/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            $ready = $true
            Write-Host "    Ready apres $($i+1) sec" -ForegroundColor Green
            break
        }
    } catch {}
}
if (-not $ready) {
    Write-Host "    [WARN] Serveur pas demarre apres 15s" -ForegroundColor Yellow
    exit 1
}

# 6. Tunnel Cloudflare si demande
if ($Public) {
    Write-Host ""
    Write-Host "[6] Tunnel public Cloudflare..." -ForegroundColor Yellow
    $cf = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if (-not $cf) {
        Write-Host "    [INFO] cloudflared non installe" -ForegroundColor Yellow
        Write-Host "    Install : winget install Cloudflare.cloudflared" -ForegroundColor Gray
    } else {
        Write-Host "    Lancement tunnel quick (URL temporaire)..." -ForegroundColor Gray
        $tunnelCmd = "cloudflared tunnel --url http://localhost:$port"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $tunnelCmd -WindowStyle Normal
        Write-Host "    Tunnel lance — l'URL apparait dans la nouvelle fenetre" -ForegroundColor Green
    }
}

# 7. Ouvre navigateur
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "  PREPROD READY  " -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "URL preprod        : http://localhost:$port/" -ForegroundColor White
Write-Host "Base SQLite        : $dbPath" -ForegroundColor Gray
Write-Host "Dev parallele      : http://localhost:4747/ (inchange)" -ForegroundColor Gray
Write-Host ""
Write-Host "Le serveur dev (4747) reste accessible sur sa base aiceo.db." -ForegroundColor Gray
Write-Host "Aucune interaction entre les 2 environnements." -ForegroundColor Gray
Write-Host ""

Start-Process "http://localhost:$port/"
