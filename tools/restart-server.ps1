# tools/restart-server.ps1
# Wrapper qui appelle le script restart-server.ps1 a la racine du repo.
# Convention introduite en S6.9-bis-LIGHT : tous les scripts user-facing sous tools/.
# Le script racine sera deplace en tools/ definitivement en S6.16-bis (restructuration).

param(
    [switch]$StopOnly
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$rootScript = Join-Path $repoRoot "restart-server.ps1"

if (Test-Path $rootScript) {
    if ($StopOnly) {
        & $rootScript -StopOnly
    } else {
        & $rootScript
    }
} else {
    Write-Host "ERREUR : $rootScript introuvable" -Fore Red
    exit 1
}
