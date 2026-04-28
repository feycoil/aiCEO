# package-release.ps1 — Cree un ZIP portable de la preprod pour deploiement externe
#
# Sortie : C:\_workarea_local\aiCEO\release\aiCEO-v0.6-preprod-YYYYMMDD-HHMM.zip
#
# Contenu :
#   - 03_mvp/ (sans node_modules)
#   - data/aiceo-preprod.db (seedee)
#   - START-AICEO.ps1 (script de lancement local pour le poste cible)
#   - README.txt (instructions)
#
# Usage : pwsh -File package-release.ps1

$ErrorActionPreference = "Stop"
$mvp = "C:\_workarea_local\aiCEO\03_mvp"
$releaseDir = "C:\_workarea_local\aiCEO\release"
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$pkgName = "aiCEO-v0.6-preprod-$stamp"
$pkgDir = "$releaseDir\$pkgName"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  aiCEO v0.6 — Package release portable  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Creer dossier de packaging
if (Test-Path $pkgDir) { Remove-Item $pkgDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $pkgDir | Out-Null
Write-Host "[1] Package dir : $pkgDir" -ForegroundColor Gray

# 2. Copier 03_mvp en excluant node_modules + tests + scripts dev
Write-Host "[2] Copie 03_mvp (sans node_modules)..." -ForegroundColor Yellow
robocopy $mvp "$pkgDir\03_mvp" /E /XD "node_modules" "tests-e2e" ".vscode" /XF "*.log" /NFL /NDL /NJH /NJS | Out-Null
Write-Host "    OK" -ForegroundColor Green

# 3. S'assurer qu'il y a une base seedee
$srcDb = "$mvp\data\aiceo-preprod.db"
$dstDb = "$pkgDir\03_mvp\data\aiceo.db"
if (Test-Path $srcDb) {
    Copy-Item $srcDb $dstDb -Force
    Write-Host "[3] Base preprod copiee comme aiceo.db (donnees demo)" -ForegroundColor Green
} else {
    Write-Host "[3] Pas de base preprod — sera seedee au 1er lancement" -ForegroundColor Yellow
}

# 4. Script de lancement portable
$startScript = @'
﻿# START-AICEO.ps1 — Lance aiCEO sur ce poste (portable)
# Usage : double-clic sur le fichier OU pwsh -File START-AICEO.ps1

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$mvp = "$here\03_mvp"
$port = 4747

Write-Host "Lancement aiCEO v0.6..." -ForegroundColor Cyan

# Install deps si pas faites
if (-not (Test-Path "$mvp\node_modules")) {
    Write-Host "Premier lancement : installation des dependances (1-2 min)..." -ForegroundColor Yellow
    Push-Location $mvp
    npm install
    Pop-Location
}

# Init DB si absente
if (-not (Test-Path "$mvp\data\aiceo.db")) {
    Push-Location $mvp
    node scripts\init-db.js
    npm run seed
    Pop-Location
}

# Tue eventuels process sur le port
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Lance le serveur
Push-Location $mvp
$env:PORT = $port
Start-Process "http://localhost:$port/"
node server.js
'@
Set-Content -Path "$pkgDir\START-AICEO.ps1" -Value $startScript -Encoding UTF8
Write-Host "[4] START-AICEO.ps1 cree" -ForegroundColor Green

# 5. README
$readme = @"
=========================================================
  aiCEO v0.6 — Preprod portable
  Build $stamp
=========================================================

INSTALLATION SUR UN NOUVEAU POSTE WINDOWS
-----------------------------------------

Pre-requis :
  - Windows 10/11
  - Node.js 22+ (https://nodejs.org)
  - PowerShell 7+ recommande (winget install Microsoft.PowerShell)

Etapes :
  1. Decompresser ce ZIP dans un dossier (ex: C:\aiCEO\)
  2. Ouvrir PowerShell dans ce dossier
  3. Lancer : .\START-AICEO.ps1
     (ou double-cliquer sur START-AICEO.ps1)
  4. Le serveur demarre et s'ouvre dans ton navigateur sur :
       http://localhost:4747/

Au 1er lancement :
  - npm install (1-2 min, telecharge ~300 dependances)
  - Init de la base SQLite + seed donnees demo

Aux lancements suivants :
  - Demarrage immediat (~3 sec)
  - La base persiste dans 03_mvp\data\aiceo.db

URLS PRINCIPALES
-----------------------------------------
  http://localhost:4747/                 Hub principal
  http://localhost:4747/v06/index.html   Cockpit du jour
  http://localhost:4747/v06/arbitrage.html
  http://localhost:4747/v06/evening.html
  http://localhost:4747/api/system/health  Sante serveur

ARRETER LE SERVEUR
-----------------------------------------
  Ctrl+C dans la fenetre PowerShell
  Ou tuer le process node depuis le Task Manager

DONNEES
-----------------------------------------
  Tout est local. Aucun cloud.
  Base SQLite : 03_mvp\data\aiceo.db
  Pour reset : supprimer aiceo.db puis relancer

SUPPORT
-----------------------------------------
  Contact : feycoil@etic-services.net
  Repo source : https://github.com/feycoil/aiCEO
"@
Set-Content -Path "$pkgDir\README.txt" -Value $readme -Encoding UTF8
Write-Host "[5] README.txt cree" -ForegroundColor Green

# 6. Compresser en ZIP
Write-Host ""
Write-Host "[6] Compression en ZIP..." -ForegroundColor Yellow
$zipPath = "$releaseDir\$pkgName.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$pkgDir\*" -DestinationPath $zipPath -CompressionLevel Optimal
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Host "    ZIP : $zipPath ($zipSize Mo)" -ForegroundColor Green

# 7. Cleanup dossier intermediaire
Remove-Item $pkgDir -Recurse -Force
Write-Host "[7] Cleanup dossier intermediaire" -ForegroundColor Gray

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  Package release pret  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "Pour deployer sur un autre poste Windows :" -ForegroundColor Gray
Write-Host "  1. Copier le ZIP" -ForegroundColor Gray
Write-Host "  2. Decompresser" -ForegroundColor Gray
Write-Host "  3. Lancer START-AICEO.ps1" -ForegroundColor Gray
Write-Host ""

# Ouvrir le dossier
Start-Process "explorer.exe" -ArgumentList $releaseDir
