# import-real-data.ps1 — Import / migration de tes vraies donnees dans aiceo.db
#
# Detecte automatiquement les sources disponibles :
#   - Backup recent (data/backup-*.db) - le plus recent
#   - App v0.5 historique (01_app-web/assets/data.js)
#   - Sync Outlook (calendrier + emails)
#
# Usage : pwsh -File import-real-data.ps1
#         pwsh -File import-real-data.ps1 -From backup
#         pwsh -File import-real-data.ps1 -From appweb
#         pwsh -File import-real-data.ps1 -From outlook

param(
    [ValidateSet('auto','backup','appweb','outlook','status')]
    [string]$From = 'auto'
)

$ErrorActionPreference = "Continue"
$mvp = "C:\_workarea_local\aiCEO\03_mvp"
$dbPath = "$mvp\data\aiceo.db"
$port = 4747

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  aiCEO — Import des vraies donnees  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# === STATUS — afficher contenu actuel base ===
function Show-DbStatus {
    if (-not (Test-Path $dbPath)) {
        Write-Host "Base $dbPath introuvable" -ForegroundColor Yellow
        return
    }
    $size = [math]::Round((Get-Item $dbPath).Length / 1KB, 1)
    Write-Host "Base actuelle : $dbPath ($size ko)" -ForegroundColor Gray

    Push-Location $mvp
    $script = @'
const { getDb } = require('./src/db');
try {
  const db = getDb();
  const tables = ['tasks','decisions','contacts','projects','groups','events','weekly_reviews','big_rocks','arbitrage_sessions','evening_sessions'];
  console.log('Comptes des tables :');
  for (const t of tables) {
    try {
      const r = db.prepare('SELECT COUNT(*) as c FROM ' + t).get();
      console.log('  ' + t.padEnd(20) + ' = ' + r.c);
    } catch(e) { console.log('  ' + t.padEnd(20) + ' = (table absente)'); }
  }
} catch(e) { console.error('Erreur DB:', e.message); }
'@
    $tmpScript = "$env:TEMP\check-aiceo-db.js"
    Set-Content -Path $tmpScript -Value $script
    & node $tmpScript 2>&1
    Remove-Item $tmpScript -ErrorAction SilentlyContinue
    Pop-Location
}

# Toujours afficher status au demarrage
Write-Host "[STATUS]" -ForegroundColor Yellow
Show-DbStatus
Write-Host ""

if ($From -eq 'status') { exit 0 }

# === Detection auto si From=auto ===
if ($From -eq 'auto') {
    # Priorite 1 : backup recent
    $latestBackup = Get-ChildItem "$mvp\data\backup-aiceo-*.db" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestBackup) {
        $backupAge = (New-TimeSpan -Start $latestBackup.LastWriteTime -End (Get-Date)).TotalHours
        if ($backupAge -lt 48) {
            Write-Host "[AUTO] Backup recent detecte : $($latestBackup.Name) ($([math]::Round($backupAge,1))h)" -ForegroundColor Cyan
            $From = 'backup'
        }
    }

    if ($From -eq 'auto') {
        # Priorite 2 : data.js v0.5
        if (Test-Path "C:\_workarea_local\aiCEO\01_app-web\assets\data.js") {
            Write-Host "[AUTO] App v0.5 historique detectee" -ForegroundColor Cyan
            $From = 'appweb'
        } else {
            Write-Host "[AUTO] Aucune source auto detectee. Choisir explicitement :" -ForegroundColor Yellow
            Write-Host "  -From backup   (restaure le dernier backup)" -ForegroundColor Gray
            Write-Host "  -From appweb   (migration depuis v0.5)" -ForegroundColor Gray
            Write-Host "  -From outlook  (sync calendrier + emails)" -ForegroundColor Gray
            Write-Host "  -From status   (affiche juste l'etat)" -ForegroundColor Gray
            exit 1
        }
    }
}

# === Stop serveur (sinon DB lock) ===
Write-Host ""
Write-Host "[STOP SERVEURS]" -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  PID $($_.OwningProcess) (port $port) tue" -ForegroundColor Green
}
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -match "aiCEO" } | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# === Backup actuel par securite ===
if (Test-Path $dbPath) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmm"
    $newBackup = "$mvp\data\backup-aiceo-before-import-$stamp.db"
    try {
        Copy-Item $dbPath $newBackup
        Write-Host "  Backup securite : $(Split-Path -Leaf $newBackup)" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Backup securite echoue : $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[IMPORT — source : $From]" -ForegroundColor Yellow
Write-Host ""

switch ($From) {
    'backup' {
        $latestBackup = Get-ChildItem "$mvp\data\backup-aiceo-*.db" -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -notmatch "before-import" } |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if (-not $latestBackup) {
            Write-Host "[FAIL] Aucun backup trouve dans data\" -ForegroundColor Red
            exit 1
        }
        Write-Host "  Restore : $($latestBackup.Name) -> aiceo.db" -ForegroundColor Cyan
        Copy-Item $latestBackup.FullName $dbPath -Force
        Write-Host "  OK" -ForegroundColor Green
    }

    'appweb' {
        Push-Location $mvp
        Write-Host "  Migration depuis 01_app-web/assets/data.js..." -ForegroundColor Cyan
        & npm run db:migrate-from-appweb
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [FAIL] Migration echouee" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Pop-Location
        Write-Host "  OK" -ForegroundColor Green
    }

    'outlook' {
        Push-Location $mvp
        Write-Host "  Sync Outlook (calendrier + emails)..." -ForegroundColor Cyan
        if (Test-Path "scripts\sync-outlook.ps1") {
            & pwsh -File scripts\sync-outlook.ps1
        } else {
            Write-Host "  [FAIL] scripts\sync-outlook.ps1 introuvable" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Pop-Location
        Write-Host "  OK" -ForegroundColor Green
    }
}

# === Status post-import ===
Write-Host ""
Write-Host "[STATUS POST-IMPORT]" -ForegroundColor Yellow
Show-DbStatus

# === Relance serveur ===
Write-Host ""
Write-Host "[RELANCE SERVEUR]" -ForegroundColor Yellow
$startCmd = @"
cd '$mvp'
`$env:PORT='$port'
`$Host.UI.RawUI.WindowTitle = 'aiCEO DEV :$port'
node server.js
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd -WindowStyle Normal

# Attente
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$port/api/system/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
}

if ($ready) {
    Write-Host "  Serveur ready sur :$port" -ForegroundColor Green
    Start-Process "http://localhost:$port/"
} else {
    Write-Host "  [WARN] Serveur pas demarre" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tes donnees sont maintenant dans http://localhost:$port/" -ForegroundColor Cyan
Write-Host ""
