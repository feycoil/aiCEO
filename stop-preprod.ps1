# stop-preprod.ps1 — Arrete le serveur preprod (port 4748)
# Le serveur dev (4747) reste actif

$port = 4748
Write-Host ""
Write-Host "Arret preprod (port $port)..." -ForegroundColor Magenta

$found = $false
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  PID $($_.OwningProcess) (port $port) tue" -ForegroundColor Green
    $found = $true
}

# Tuer aussi cloudflared tunnel s'il y a
Get-WmiObject Win32_Process -Filter "Name='cloudflared.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match "$port" } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "  Tunnel cloudflared (PID $($_.ProcessId)) tue" -ForegroundColor Green
    $found = $true
  }

if (-not $found) {
    Write-Host "  Aucun process preprod actif" -ForegroundColor Gray
}
Write-Host ""
