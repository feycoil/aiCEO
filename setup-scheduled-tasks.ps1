# setup-scheduled-tasks.ps1
# Cree les 3 taches Windows schtasks pour aiCEO (purs scripts, sans Claude)
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\setup-scheduled-tasks.ps1            (DRY-RUN)
#         pwsh -File C:\_workarea_local\aiCEO\setup-scheduled-tasks.ps1 -Apply     (cree reellement)
#
# Les 3 taches creees :
#   1. aiCEO-Snapshot-DB         : quotidien 22h00, snapshot data/aiceo.db avec retention 30j
#   2. aiCEO-Git-Push-Reminder   : quotidien 21h00, alerte si commits non pousses depuis > 24h
#   3. aiCEO-Smoke-Monthly       : 1er du mois 07h00, smoke-all.ps1 + npm test, alerte si fail
#
# Note : ces taches sont COMPLEMENTAIRES aux 5 taches Cowork (qui utilisent Claude).
# Les Cowork = decisions IA (briefing, bilan, audit). Les schtasks = scripts purs (backup, push, smoke).

param(
    [switch]$Apply
)

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"

Write-Host ""
if ($Apply) {
    Write-Host "==> MODE : APPLY (creation reelle des taches)" -Fore Red
} else {
    Write-Host "==> MODE : DRY-RUN (ajouter -Apply pour creer)" -Fore Yellow
}
Write-Host ""

# ============================================================
# Tache 1 : Snapshot SQLite quotidien 22h00
# ============================================================
Write-Host "=== TACHE 1 : aiCEO-Snapshot-DB (quotidien 22h00) ===" -Fore Cyan

$snapshotScript = Join-Path $root "03_mvp\scripts\snapshot-db.ps1"
$snapshotContent = @'
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
'@

if ($Apply) {
    if (-not (Test-Path (Split-Path $snapshotScript))) {
        New-Item -ItemType Directory -Path (Split-Path $snapshotScript) -Force | Out-Null
    }
    Set-Content -Path $snapshotScript -Value $snapshotContent -Encoding UTF8
    Write-Host "   + script ecrit : $snapshotScript" -Fore Green
    schtasks /create `
        /sc DAILY /st 22:00 `
        /tn "aiCEO-Snapshot-DB" `
        /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$snapshotScript`"" `
        /ru "$env:USERNAME" `
        /f
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + tache aiCEO-Snapshot-DB creee" -Fore Green
    } else {
        Write-Host "   ! creation tache echec" -Fore Red
    }
} else {
    Write-Host "   WOULD CREATE script : $snapshotScript" -Fore Yellow
    Write-Host "   WOULD CREATE schtasks aiCEO-Snapshot-DB DAILY 22:00" -Fore Yellow
}

# ============================================================
# Tache 2 : Git push reminder quotidien 21h00
# ============================================================
Write-Host ""
Write-Host "=== TACHE 2 : aiCEO-Git-Push-Reminder (quotidien 21h00) ===" -Fore Cyan

$pushScript = Join-Path $root "03_mvp\scripts\check-git-push.ps1"
$pushContent = @'
# check-git-push.ps1 — alerte si commits non pousses depuis > 24h
$ErrorActionPreference = "Continue"
Set-Location "C:\_workarea_local\aiCEO"
git fetch origin main 2>&1 | Out-Null
$ahead = (git rev-list --count origin/main..HEAD 2>$null)
if ([string]::IsNullOrWhiteSpace($ahead)) { $ahead = 0 }
if ($ahead -gt 0) {
    $lastCommitTs = git log -1 --format=%ct
    $ageHours = [math]::Round(((Get-Date -UFormat %s) - $lastCommitTs) / 3600, 1)
    if ($ageHours -gt 24) {
        $title = "aiCEO : $ahead commits non pousses depuis $ageHours h"
        $body = "Lance : cd C:\_workarea_local\aiCEO ; git push origin main"
        # Notification Windows toast
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show($body, $title, "OK", "Warning")
        Write-Host "[ALERT] $title"
    } else {
        Write-Host "[OK] $ahead commits ahead, mais < 24h ($ageHours h)"
    }
} else {
    Write-Host "[OK] tout pousse (origin/main aligne avec HEAD)"
}
'@

if ($Apply) {
    Set-Content -Path $pushScript -Value $pushContent -Encoding UTF8
    Write-Host "   + script ecrit : $pushScript" -Fore Green
    schtasks /create `
        /sc DAILY /st 21:00 `
        /tn "aiCEO-Git-Push-Reminder" `
        /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$pushScript`"" `
        /ru "$env:USERNAME" `
        /f
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + tache aiCEO-Git-Push-Reminder creee" -Fore Green
    } else {
        Write-Host "   ! creation tache echec" -Fore Red
    }
} else {
    Write-Host "   WOULD CREATE script : $pushScript" -Fore Yellow
    Write-Host "   WOULD CREATE schtasks aiCEO-Git-Push-Reminder DAILY 21:00" -Fore Yellow
}

# ============================================================
# Tache 3 : Smoke test mensuel
# ============================================================
Write-Host ""
Write-Host "=== TACHE 3 : aiCEO-Smoke-Monthly (1er du mois 07h00) ===" -Fore Cyan

$smokeWrapper = Join-Path $root "03_mvp\scripts\monthly-smoke.ps1"
$smokeContent = @'
# monthly-smoke.ps1 — smoke-all.ps1 + npm test, alerte si fail
$ErrorActionPreference = "Continue"
Set-Location "C:\_workarea_local\aiCEO\03_mvp"
$report = Join-Path "data" "smoke-monthly-$(Get-Date -Format yyyy-MM-dd).log"
"=== Smoke mensuel $(Get-Date -Format o) ===" | Out-File $report -Encoding UTF8

# Smoke HTTP
& powershell -File scripts\smoke-all.ps1 *>&1 | Tee-Object -FilePath $report -Append
$smokeOK = ($LASTEXITCODE -eq 0)

# npm test
"" | Out-File $report -Encoding UTF8 -Append
"=== npm test ===" | Out-File $report -Encoding UTF8 -Append
& npm test *>&1 | Tee-Object -FilePath $report -Append
$testOK = ($LASTEXITCODE -eq 0)

if ($smokeOK -and $testOK) {
    Write-Host "[OK] smoke + tests verts (rapport : $report)"
} else {
    $title = "aiCEO smoke mensuel : FAIL"
    $body = "smoke=$smokeOK tests=$testOK — voir $report"
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($body, $title, "OK", "Error")
    Write-Host "[ALERT] $title"
}
'@

if ($Apply) {
    Set-Content -Path $smokeWrapper -Value $smokeContent -Encoding UTF8
    Write-Host "   + script ecrit : $smokeWrapper" -Fore Green
    schtasks /create `
        /sc MONTHLY /d 1 /st 07:00 `
        /tn "aiCEO-Smoke-Monthly" `
        /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$smokeWrapper`"" `
        /ru "$env:USERNAME" `
        /f
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + tache aiCEO-Smoke-Monthly creee" -Fore Green
    } else {
        Write-Host "   ! creation tache echec" -Fore Red
    }
} else {
    Write-Host "   WOULD CREATE script : $smokeWrapper" -Fore Yellow
    Write-Host "   WOULD CREATE schtasks aiCEO-Smoke-Monthly MONTHLY day 1 07:00" -Fore Yellow
}

# ============================================================
# Resume
# ============================================================
Write-Host ""
Write-Host "==> RESUME" -Fore Cyan
if ($Apply) {
    Write-Host "Verifier les 3 taches creees :" -Fore Green
    Write-Host "    schtasks /query /tn aiCEO-Snapshot-DB /v /fo LIST"
    Write-Host "    schtasks /query /tn aiCEO-Git-Push-Reminder /v /fo LIST"
    Write-Host "    schtasks /query /tn aiCEO-Smoke-Monthly /v /fo LIST"
    Write-Host ""
    Write-Host "Pour supprimer : schtasks /delete /tn aiCEO-Snapshot-DB /f (idem autres)"
    Write-Host ""
    Write-Host "Note : ces 3 taches sont COMPLEMENTAIRES aux 5 taches Cowork (briefing/bilan/revue/audit/prep semaine)" -Fore Cyan
    Write-Host "Cowork = IA Claude execute. Schtasks = scripts purs. Les 8 taches couvrent ensemble :" -Fore Cyan
    Write-Host "  - 7h matin (Cowork briefing) -> 18h soir (Cowork bilan) -> 21h push reminder (schtasks) -> 22h snapshot DB (schtasks)" -Fore Cyan
    Write-Host "  - Vendredi 17h revue hebdo (Cowork) -> Dimanche 20h prep semaine (Cowork) -> Lundi 8h audit consistence (Cowork)" -Fore Cyan
    Write-Host "  - 1er du mois smoke + tests (schtasks)" -Fore Cyan
} else {
    Write-Host "Pour appliquer : pwsh -File C:\_workarea_local\aiCEO\setup-scheduled-tasks.ps1 -Apply" -Fore Cyan
}
Write-Host ""
