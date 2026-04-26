# start-aiCEO-at-logon.ps1
# Lance le serveur aiCEO au logon Windows via Start-Process discret (sans fenêtre).
# Cible : équivalent fonctionnel d'un service Windows, sans la complexité de node-windows.
#
# Installation (terminal admin) :
#   schtasks /create `
#     /sc ONLOGON `
#     /tn "aiCEO-Server-AtLogon" `
#     /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\start-aiCEO-at-logon.ps1" `
#     /ru "$env:USERNAME" `
#     /rl HIGHEST `
#     /it
#
# Arrêt du serveur (n'importe quel terminal) :
#   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
#
# Désinstallation tâche :
#   schtasks /delete /tn "aiCEO-Server-AtLogon" /f

$ErrorActionPreference = "Stop"
$mvp  = "C:\_workarea_local\aiCEO\03_mvp"
$log  = Join-Path $mvp "data\aiCEO-server.log"

Set-Location $mvp

# === S4.09 — Rotation simple (pre-S5 winston) ===
# Si le log courant > 2 Mo, rotate vers .1 (et .1 vers .2 si existe).
# Garde 3 archives max. Pas de gzip (KISS).
$ROTATE_MAX_BYTES = 2MB
$ROTATE_KEEP      = 3
if (Test-Path $log) {
    $sz = (Get-Item $log).Length
    if ($sz -ge $ROTATE_MAX_BYTES) {
        for ($i = $ROTATE_KEEP; $i -ge 1; $i--) {
            $src = "$log.$i"
            $dst = "$log.$($i+1)"
            if (Test-Path $src) {
                if ($i -eq $ROTATE_KEEP) {
                    Remove-Item $src -Force -ErrorAction SilentlyContinue
                } else {
                    Move-Item $src $dst -Force -ErrorAction SilentlyContinue
                }
            }
        }
        Move-Item $log "$log.1" -Force -ErrorAction SilentlyContinue
        Add-Content -Path $log -Value "$(Get-Date -Format o) [rotate] previous log -> .1 (was $sz bytes)"
    }
}

# Si le serveur tourne déjà sur 4747, ne rien faire (idempotent)
$listening = (netstat -ano | findstr LISTENING | findstr :4747)
if ($listening) {
    Add-Content -Path $log -Value "$(Get-Date -Format o) [skip] serveur deja en ecoute sur :4747"
    exit 0
}

# Lance node server.js en tâche détachée, log sur fichier
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName        = "node.exe"
$psi.Arguments       = "server.js"
$psi.WorkingDirectory = $mvp
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.CreateNoWindow  = $true

$p = [System.Diagnostics.Process]::Start($psi)

# Redirection logs en arrière-plan
Start-Job -ScriptBlock {
    param($pid, $log)
    while ($true) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction Stop
            Start-Sleep -Seconds 5
        } catch {
            break
        }
    }
} -ArgumentList $p.Id, $log | Out-Null

Add-Content -Path $log -Value "$(Get-Date -Format o) [start] node server.js PID=$($p.Id)"
