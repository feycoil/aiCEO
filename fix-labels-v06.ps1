#Requires -Version 5
<#
.SYNOPSIS
  Cree les labels GitHub manquants pour la phase v0.6.

.DESCRIPTION
  Idempotent. Cree uniquement les labels absents. Ajoute principalement
  "phase/v0.6" (les autres labels lane/type/prio existent deja depuis v0.5).

.PARAMETER Repo
  Defaut : feycoil/aiCEO

.PARAMETER DryRun
  Affiche sans creer.

.EXAMPLE
  pwsh -File fix-labels-v06.ps1
  pwsh -File fix-labels-v06.ps1 -DryRun
#>

[CmdletBinding()]
param(
    [string]$Repo = "feycoil/aiCEO",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== fix-labels-v06.ps1 ===" -ForegroundColor Cyan
Write-Host "Repo : $Repo"
Write-Host ""

# Liste complete des labels requis pour v0.6 (extraits de gh-create-issues-v06.ps1)
# Format : @{ Name = "..."; Color = "...hex sans #..."; Description = "..." }
$requiredLabels = @(
    # Phase
    @{ Name = "phase/v0.6"; Color = "5b6ee1"; Description = "Phase v0.6 - Interface finalisee" }
    # Lanes (existent deja v0.5 mais on verifie)
    @{ Name = "lane/design-system"; Color = "7a6a8a"; Description = "Design system (DS atomic, composants, gallery)" }
    @{ Name = "lane/app-web"; Color = "7790ae"; Description = "App web (frontend pages refondues)" }
    # Types (existent deja v0.5 mais on verifie)
    @{ Name = "type/feat"; Color = "3d7363"; Description = "Nouvelle fonctionnalite" }
    @{ Name = "type/chore"; Color = "9a9da8"; Description = "Tache technique sans nouvelle valeur" }
    @{ Name = "type/test"; Color = "b88237"; Description = "Tests unit/integration/e2e" }
    @{ Name = "type/docs"; Color = "5b5e68"; Description = "Documentation" }
    # Priorites (existent deja v0.5 mais on verifie)
    @{ Name = "prio/P0"; Color = "d96d3e"; Description = "Bloquant - a faire en premier" }
    @{ Name = "prio/P1"; Color = "b88237"; Description = "Important - a faire dans le sprint" }
)

# Recuperer les labels existants en une seule requete
$existingLabels = @{}
try {
    $labelsJson = gh api "repos/$Repo/labels?per_page=100" 2>$null
    if ($LASTEXITCODE -eq 0 -and $labelsJson) {
        $labelsList = $labelsJson | ConvertFrom-Json
        foreach ($l in $labelsList) { $existingLabels[$l.name] = $l }
        Write-Host "$($existingLabels.Count) labels existants recuperes" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "[WARN] Impossible de lister labels : $_" -ForegroundColor Yellow
}

$created = 0; $skipped = 0; $failed = 0

foreach ($label in $requiredLabels) {
    if ($existingLabels.ContainsKey($label.Name)) {
        Write-Host "  [SKIP] $($label.Name) deja existant" -ForegroundColor Yellow
        $skipped++
        continue
    }

    if ($DryRun) {
        Write-Host "  [DRY] Creerait $($label.Name) (#$($label.Color))" -ForegroundColor Magenta
        $created++
        continue
    }

    try {
        gh label create $label.Name --repo $Repo --color $label.Color --description $label.Description
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $($label.Name) cree (#$($label.Color))" -ForegroundColor Green
            $created++
        } else {
            Write-Host "  [FAIL] $($label.Name) exit=$LASTEXITCODE" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "  [ERROR] $($label.Name) - $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
Write-Host "  Crees   : $created" -ForegroundColor Green
Write-Host "  Skippes : $skipped" -ForegroundColor Yellow
$col = "White"
if ($failed -gt 0) { $col = "Red" }
Write-Host "  Echecs  : $failed" -ForegroundColor $col

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "Prochaine etape : relancer le script de creation des issues" -ForegroundColor Cyan
    Write-Host "  pwsh -File 04_docs\_sprint-s6\scripts\gh-create-issues-v06.ps1" -ForegroundColor White
} else {
    exit 1
}
