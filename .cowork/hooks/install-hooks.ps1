# install-hooks.ps1
# Installe les hooks git Lean ADD-AI dans .git/hooks/
# Source : .cowork/hooks/
# Usage : pwsh -File .cowork\hooks\install-hooks.ps1

$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    Write-Host "Erreur : pas dans un repo git" -Fore Red
    exit 1
}

$srcDir = Join-Path $repoRoot ".cowork\hooks"
$dstDir = Join-Path $repoRoot ".git\hooks"

if (-not (Test-Path $srcDir)) {
    Write-Host "Erreur : $srcDir introuvable" -Fore Red
    exit 1
}

# Liste des hooks a installer
$hooks = @("pre-commit")

foreach ($hook in $hooks) {
    $src = Join-Path $srcDir $hook
    $dst = Join-Path $dstDir $hook

    if (-not (Test-Path $src)) {
        Write-Host "  Skip $hook : source absente" -Fore Yellow
        continue
    }

    # Backup existant si different
    if (Test-Path $dst) {
        $existing = Get-FileHash $dst -Algorithm SHA256
        $new = Get-FileHash $src -Algorithm SHA256
        if ($existing.Hash -eq $new.Hash) {
            Write-Host "  $hook deja installe (identique)" -Fore Green
            continue
        }
        Copy-Item $dst "$dst.bak" -Force
        Write-Host "  Backup $hook -> $hook.bak" -Fore Yellow
    }

    Copy-Item $src $dst -Force

    # Sous Windows, git Bash interprete le shebang. Pas besoin de chmod.
    Write-Host "  OK $hook installe" -Fore Green
}

Write-Host ""
Write-Host "Hooks Lean ADD-AI installes." -Fore Cyan
Write-Host "Test : faire un commit, le hook pre-commit doit valider 'OK pre-commit Lean ADD-AI'." -Fore Cyan
