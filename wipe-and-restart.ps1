#requires -Version 5.1
<#
.SYNOPSIS
  aiCEO — Reset complet : vide toute la base SQLite + caches emails, comme une nouvelle installation.

.DESCRIPTION
  1. Stoppe le serveur Express si en route (port 4747)
  2. Supprime data/aiceo.db (+ fichiers WAL/SHM)
  3. Supprime data/emails.json + emails-summary.json + events.json (caches Outlook)
  4. Relance les migrations (npm run db:reset) -> base propre avec seeds (8 domaines + 1 societe)
  5. Optionnel : redemarre le serveur

.PARAMETER NoRestart
  Ne redemarre pas le serveur a la fin (par defaut, le serveur est relance).

.PARAMETER Force
  Skip la confirmation interactive (utile pour scripts automatises).

.EXAMPLE
  .\wipe-and-restart.ps1
    Reset interactif avec confirmation puis redemarrage serveur

.EXAMPLE
  .\wipe-and-restart.ps1 -Force -NoRestart
    Reset silencieux sans redemarrer le serveur (pour CI ou debug)
#>

param(
  [switch]$NoRestart,
  [switch]$Force,
  [switch]$KillAllNode  # Tue TOUS les node.exe et npm.cmd du systeme + desactive schtasks aiCEO-Outlook-Sync
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$mvpDir = Join-Path $repoRoot '03_mvp'
$dataDir = Join-Path $mvpDir 'data'

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  aiCEO - Reset complet (comme une nouvelle installation)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# --- 0. Confirmation ---
if (-not $Force) {
  Write-Host "Cette commande va SUPPRIMER definitivement :" -ForegroundColor Yellow
  Write-Host "  - Toutes vos taches, decisions, projets, contacts" -ForegroundColor Yellow
  Write-Host "  - Toutes vos conversations Assistant" -ForegroundColor Yellow
  Write-Host "  - Tous les emails synchronises (cache local)" -ForegroundColor Yellow
  Write-Host "  - Toutes les Big Rocks et Weekly Reviews" -ForegroundColor Yellow
  Write-Host "  - Tous les pins de Connaissance" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "La base sera recreee vide avec uniquement les seeds par defaut :" -ForegroundColor Green
  Write-Host "  - 8 domaines (Finance, Sales, Marketing, Operations, RH, Tech, Strategie, Legal)" -ForegroundColor Green
  Write-Host "  - 1 societe (Mon entreprise, a renommer dans /axes)" -ForegroundColor Green
  Write-Host ""
  $confirm = Read-Host "Tapez 'RESET' pour confirmer"
  if ($confirm -ne 'RESET') {
    Write-Host "Annule." -ForegroundColor Red
    exit 1
  }
}

# --- 1. Stop server (port 4747 + tous les node.exe relatifs au repo) ---
Write-Host ""
Write-Host "[1/5] Arret robuste du serveur (port 4747 + node.exe lies au repo)..." -ForegroundColor Cyan

# 1a. Tuer le process qui ecoute le port 4747
try {
  $conns = Get-NetTCPConnection -LocalPort 4747 -State Listen -ErrorAction SilentlyContinue
  if ($conns) {
    $conns | ForEach-Object {
      $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
      if ($proc) {
        Write-Host "  Stop port-listener PID $($proc.Id) ($($proc.ProcessName))" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
      }
    }
  }
} catch { }

# 1b. Tuer aussi tout node.exe qui touche au repo (anti-fantome wrapper logon)
$repoSegments = @('aiCEO\03_mvp', 'aiCEO\\03_mvp')
$nodes = Get-Process -Name node, npm -ErrorAction SilentlyContinue
if ($nodes) {
  foreach ($n in $nodes) {
    $line = $null
    try {
      $line = (Get-CimInstance Win32_Process -Filter "ProcessId=$($n.Id)" -ErrorAction SilentlyContinue).CommandLine
    } catch { }
    $isMine = $false
    if ($line) {
      foreach ($seg in $repoSegments) { if ($line -like "*$seg*") { $isMine = $true; break } }
    }
    if ($isMine -or ($line -and ($line -match 'aiceo' -or $line -match 'server\.js'))) {
      Write-Host "  Stop node PID $($n.Id) (cmdline lien repo)" -ForegroundColor Gray
      Stop-Process -Id $n.Id -Force -ErrorAction SilentlyContinue
    }
  }
}

# 1c. Mode agressif : tue TOUS les node.exe restants + desactive schtasks Outlook
if ($KillAllNode) {
  Write-Host "  Mode agressif : kill TOUS les node.exe + npm.cmd restants..." -ForegroundColor Yellow
  Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Stop node PID $($_.Id) (mode KillAllNode)" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
  }
  # Stop tache planifiee Outlook si en cours
  try {
    $task = Get-ScheduledTask -TaskName 'aiCEO-Outlook-Sync' -ErrorAction SilentlyContinue
    if ($task) {
      $info = Get-ScheduledTaskInfo -TaskName 'aiCEO-Outlook-Sync' -ErrorAction SilentlyContinue
      if ($info -and $info.LastTaskResult -eq 267009) {  # 267009 = task running
        Stop-ScheduledTask -TaskName 'aiCEO-Outlook-Sync' -ErrorAction SilentlyContinue
        Write-Host "  Stop schtask aiCEO-Outlook-Sync (etait en cours)" -ForegroundColor Gray
      }
    }
  } catch { }
}

# 1d. Attendre que les handles SQLite soient libres (jusqu'a 5s)
Write-Host "  Attente 5s pour liberation des handles SQLite..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# --- 2. Suppression base SQLite (avec retry si verrouille) ---
Write-Host ""
Write-Host "[2/5] Suppression base SQLite..." -ForegroundColor Cyan
$dbFiles = @('aiceo.db', 'aiceo.db-wal', 'aiceo.db-shm')
foreach ($f in $dbFiles) {
  $p = Join-Path $dataDir $f
  if (-not (Test-Path $p)) { continue }
  $deleted = $false
  for ($attempt = 1; $attempt -le 5; $attempt++) {
    try {
      Remove-Item $p -Force -ErrorAction Stop
      Write-Host "  Supprime : $f" -ForegroundColor Gray
      $deleted = $true
      break
    } catch {
      if ($attempt -eq 5) {
        Write-Host "  ERREUR : $f reste verrouille apres 5 tentatives." -ForegroundColor Red
        Write-Host "" -ForegroundColor Yellow
        Write-Host "  CAUSES PROBABLES :" -ForegroundColor Yellow
        Write-Host "    - Un autre node.exe sur le systeme tient le fichier (autre projet ouvert ?)" -ForegroundColor Yellow
        Write-Host "    - La tache planifiee aiCEO-Outlook-Sync est en cours d execution" -ForegroundColor Yellow
        Write-Host "    - Un editeur (VS Code SQLite viewer, DB Browser) garde le fichier ouvert" -ForegroundColor Yellow
        Write-Host "" -ForegroundColor Yellow
        Write-Host "  SOLUTION RAPIDE : relancez avec -KillAllNode (tue TOUS les node.exe du systeme) :" -ForegroundColor Cyan
        Write-Host "    .\wipe-and-restart.ps1 -KillAllNode" -ForegroundColor White
        Write-Host "" -ForegroundColor Yellow
        Write-Host "  OU manuellement :" -ForegroundColor Yellow
        Write-Host "    1. Task Manager (Ctrl+Shift+Esc) > tuer tous les node.exe" -ForegroundColor Yellow
        Write-Host "    2. Fermer DB Browser / VS Code SQLite si ouvert" -ForegroundColor Yellow
        Write-Host "    3. Relancer ce script" -ForegroundColor Yellow
        exit 2
      }
      Write-Host "  Verrouille (tentative $attempt/5), retry dans 2s..." -ForegroundColor Yellow
      Start-Sleep -Seconds 2
    }
  }
}

# --- 3. Suppression caches emails / events / arbitrage ---
Write-Host ""
Write-Host "[3/5] Suppression caches Outlook..." -ForegroundColor Cyan
$cacheFiles = @(
  'emails.json', 'emails-summary.json', 'events.json',
  'arbitrage-history.json', 'evening-history.json', 'team.json'
)
foreach ($f in $cacheFiles) {
  $p = Join-Path $dataDir $f
  if (Test-Path $p) {
    Remove-Item $p -Force
    Write-Host "  Supprime : $f" -ForegroundColor Gray
  }
}

# --- 4. Re-init base (applique toutes les migrations + seeds) ---
Write-Host ""
Write-Host "[4/5] Re-creation base + seeds..." -ForegroundColor Cyan
Push-Location $mvpDir
try {
  npm run db:reset 2>&1 | Out-String | Write-Host
} finally {
  Pop-Location
}

# --- 5. Restart server ---
if (-not $NoRestart) {
  Write-Host ""
  Write-Host "[5/5] Redemarrage du serveur..." -ForegroundColor Cyan
  Push-Location $mvpDir
  try {
    Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$mvpDir'; npm start" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  Serveur en cours de demarrage (fenetre PowerShell ouverte)." -ForegroundColor Gray
  } finally {
    Pop-Location
  }
} else {
  Write-Host ""
  Write-Host "[5/5] Serveur non redemarre (option -NoRestart)." -ForegroundColor Gray
  Write-Host "  Pour relancer manuellement : cd 03_mvp && npm start" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Reset complete. Premiere visite : http://localhost:4747" -ForegroundColor Green
Write-Host "  Vous serez automatiquement redirige vers /v07/pages/onboarding.html" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Parcours suggere apres reset :" -ForegroundColor Cyan
Write-Host "  1. Onboarding wizard 5 etapes (identite -> espace -> emails -> posture -> recap)" -ForegroundColor White
Write-Host "  2. Aller dans /v07/pages/axes.html : renommer 'Mon entreprise' + ajouter vos autres societes" -ForegroundColor White
Write-Host "  3. Lancer la sync Outlook (manuelle) ou attendre le schtasks 2h" -ForegroundColor White
Write-Host "  4. Premier Triage matin : /v07/pages/arbitrage.html" -ForegroundColor White
Write-Host "  5. Auto-classification des projets crees : /v07/pages/axes.html (bouton)" -ForegroundColor White
Write-Host "  6. Premiere Weekly Sync : /v07/pages/revues.html (3 Big Rocks)" -ForegroundColor White
Write-Host ""
Write-Host "Doc complete : 04_docs/PARCOURS-INIT-CEO.md" -ForegroundColor Cyan
Write-Host ""
