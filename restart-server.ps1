# restart-server.ps1
# Tue proprement le serveur node sur :4747 et le relance
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\restart-server.ps1
#         pwsh -File C:\_workarea_local\aiCEO\restart-server.ps1 -StopOnly  (juste arret)

param(
    [switch]$StopOnly
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==> Recherche process listening sur :4747" -Fore Cyan

$conn = Get-NetTCPConnection -LocalPort 4747 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $procId = $conn.OwningProcess
    if ($procId -and $procId -ne 0) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $name = if ($proc) { $proc.Name } else { "(inconnu)" }
        Write-Host "    Process trouve : PID $procId ($name)" -Fore Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "    Process $procId arrete" -Fore Green
    } else {
        Write-Host "    PID $procId non terminal (system process)" -Fore Yellow
    }
} else {
    Write-Host "    Aucun process listening sur :4747" -Fore Green
}

# Nettoyage des connexions ESTABLISHED/TIME_WAIT (ne fait rien sur le port mais informatif)
$remaining = Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "    Note : $($remaining.Count) connexions actives restantes (TIME_WAIT etc)" -Fore Yellow
}

if ($StopOnly) {
    Write-Host ""
    Write-Host "==> Mode StopOnly : pas de relance" -Fore Yellow
    exit 0
}

Write-Host ""
Write-Host "==> Relance du serveur" -Fore Cyan
Write-Host "    cd C:\_workarea_local\aiCEO\03_mvp"
Write-Host "    node server.js"
Write-Host ""
Set-Location "C:\_workarea_local\aiCEO\03_mvp"
node server.js
