# snapshot-db.ps1 — copie aiceo.db vers snapshots/ avec retention 30 jours
$ErrorActionPreference = "Continue"
$src = "C:\_workarea_local\aiCEO\03_mvp\data\aiceo.db"
$dst = "C:\_workarea_local\aiCEO\03_mvp\data\snapshots"
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }
if (-not (Test-Path $src)) { Write-Host "[KO] aiceo.db absent" ; exit 1 }
$today = Get-Date -Format "yyyy-MM-dd"
$copy = Join-Path $dst "aiceo-$today.db"
Copy-Item -Path $src -Destination $copy -Force
$size = [math]::Round((Get-Item $copy).Length / 1024, 1)
Write-Host "[OK] snapshot $copy ($size KB)"
# Retention 30 jours
$cutoff = (Get-Date).AddDays(-30)
Get-ChildItem $dst -Filter "aiceo-*.db" | Where-Object { $_.LastWriteTime -lt $cutoff } | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-Host "[CLEAN] retire $($_.Name) (>30j)"
}
