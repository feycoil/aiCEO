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
