# update-pilotage.ps1 — Regenere 04_docs/00-pilotage-projet.html depuis tout le projet
#
# Usage :
#   pwsh -File update-pilotage.ps1                  # regenere une fois
#   pwsh -File update-pilotage.ps1 -InstallHook     # installe hook git post-commit (auto regen)
#   pwsh -File update-pilotage.ps1 -Open            # regenere puis ouvre dans le navigateur

param(
    [switch]$InstallHook,
    [switch]$Open,
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$repoRoot = "C:\_workarea_local\aiCEO"

function Write-Info($msg) { if (-not $Quiet) { Write-Host "==> $msg" -Fore Cyan } }
function Write-OK($msg)   { if (-not $Quiet) { Write-Host "    [OK] $msg" -Fore Green } }
function Write-Warn($msg) { if (-not $Quiet) { Write-Host "    [!]  $msg" -Fore Yellow } }

# ============================================================
# Option -InstallHook : installe le hook post-commit
# ============================================================
if ($InstallHook) {
    Write-Info "Installation hook git post-commit"
    $hookPath = Join-Path $repoRoot ".git\hooks\post-commit"
    $hookContent = @'
#!/bin/sh
# Auto-genere par update-pilotage.ps1
# Regenere 04_docs/00-pilotage-projet.html apres chaque commit
node "$(git rev-parse --show-toplevel)/scripts/generate-pilotage.js" 2>&1 | tail -3
'@
    Set-Content -Path $hookPath -Value $hookContent -Encoding UTF8
    # Make executable (Git for Windows)
    if (Test-Path $hookPath) {
        Write-OK "Hook installe : $hookPath"
        Write-Host "    Le pilotage sera regenere automatiquement apres chaque git commit." -Fore Yellow
    } else {
        Write-Warn "Echec installation hook (pas de .git/hooks/ ?)"
    }
    exit 0
}

# ============================================================
# Generation
# ============================================================
Write-Info "Regeneration du pilotage projet"
Push-Location $repoRoot
try {
    $output = node scripts\generate-pilotage.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        if (-not $Quiet) { $output | ForEach-Object { Write-Host "    $_" } }
        Write-OK "Pilotage regenere"
    } else {
        Write-Warn "Erreur generation : exit $LASTEXITCODE"
        $output | ForEach-Object { Write-Host "    $_" }
        exit $LASTEXITCODE
    }
} finally { Pop-Location }

# ============================================================
# Option -Open : ouvre dans le navigateur
# ============================================================
if ($Open) {
    $htmlPath = Join-Path $repoRoot "04_docs\00-pilotage-projet.html"
    if (Test-Path $htmlPath) {
        Write-Info "Ouverture dans le navigateur"
        Start-Process $htmlPath
    }
}

Write-Host ""
Write-Host "Pilotage : file:///$($repoRoot.Replace('\','/'))/04_docs/00-pilotage-projet.html" -Fore Cyan
