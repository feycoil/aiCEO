#Requires -Version 5
<#
.SYNOPSIS
  Creation des 24 issues GitHub pour la phase v0.6 (3 sprints S6.1, S6.2, S6.3).

.DESCRIPTION
  Cree 24 issues sur 3 milestones, idempotent. Bodies dans issues-bodies/<id>.md.
  UTF-8 BOM obligatoire (piege #5 PS5 CLAUDE.md).

.PARAMETER Repo
  Defaut : feycoil/aiCEO

.PARAMETER DryRun
  Affiche sans creer.

.EXAMPLE
  pwsh -File 04_docs\_sprint-s6\scripts\gh-create-issues-v06.ps1
  pwsh -File 04_docs\_sprint-s6\scripts\gh-create-issues-v06.ps1 -DryRun
  powershell -ExecutionPolicy Bypass -File 04_docs\_sprint-s6\scripts\gh-create-issues-v06.ps1
#>

[CmdletBinding()]
param(
    [string]$Repo = "feycoil/aiCEO",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Resoudre chemin absolu vers les bodies
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BodiesDir = Join-Path (Split-Path -Parent $ScriptDir) "issues-bodies"

if (-not (Test-Path $BodiesDir)) {
    Write-Host "[FAIL] Dossier bodies introuvable : $BodiesDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== gh-create-issues-v06.ps1 ===" -ForegroundColor Cyan
Write-Host "Repo       : $Repo"
Write-Host "BodiesDir  : $BodiesDir"
Write-Host "DryRun     : $DryRun"
Write-Host ""

# Phase 1 : verifier gh CLI
Write-Host "=== Phase 1 : gh CLI ===" -ForegroundColor Cyan
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Host "  [OK] $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] gh CLI introuvable. https://cli.github.com" -ForegroundColor Red
    exit 1
}

$null = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] gh non authentifie. Lance gh auth login" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] gh auth OK" -ForegroundColor Green

# Phase 2 : milestones (idempotent via gh api -f)
Write-Host ""
Write-Host "=== Phase 2 : milestones v0.6 ===" -ForegroundColor Cyan

$milestones = @(
    @{ Title = "v0.6-s6.1"; Description = "Sprint S6.1 - DS atomic + 16 composants + drawer + components gallery" }
    @{ Title = "v0.6-s6.2"; Description = "Sprint S6.2 - Refonte 7 pages cockpit + rituels + travail courant + coaching v0.6" }
    @{ Title = "v0.6-s6.3"; Description = "Sprint S6.3 - 5 pages registres + onboarding + settings + a11y + recette + tag v0.6" }
)

$existingMs = @{}
try {
    $msListJson = gh api "repos/$Repo/milestones?state=all&per_page=100" 2>$null
    if ($LASTEXITCODE -eq 0 -and $msListJson) {
        $msList = $msListJson | ConvertFrom-Json
        foreach ($m in $msList) { $existingMs[$m.title] = $m.number }
    }
} catch {
    Write-Host "  [WARN] Impossible de lister milestones : $_" -ForegroundColor Yellow
}

foreach ($ms in $milestones) {
    if ($existingMs.ContainsKey($ms.Title)) {
        Write-Host "  [SKIP] $($ms.Title) deja existant (#$($existingMs[$ms.Title]))" -ForegroundColor Yellow
        continue
    }
    if ($DryRun) {
        Write-Host "  [DRY] Creerait milestone $($ms.Title)" -ForegroundColor Magenta
        continue
    }
    try {
        gh api "repos/$Repo/milestones" -X POST -f title="$($ms.Title)" -f description="$($ms.Description)" -f state="open" --silent
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Milestone $($ms.Title) cree" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] gh api exit=$LASTEXITCODE pour $($ms.Title)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  [ERROR] $_" -ForegroundColor Red
    }
}

# Phase 3 : definition 24 issues
Write-Host ""
Write-Host "=== Phase 3 : 24 issues v0.6 ===" -ForegroundColor Cyan

$issues = @(
    @{
        Id     = "S6.1.0"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.0 - ADR methode S6 + setup ITCSS + scripts npm"
        BodyFile = "$BodiesDir\S6.1.0.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/chore", "prio/P0")
    },
    @{
        Id     = "S6.1.1"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.1 - Tokens CSS 3 niveaux (primitive/semantic/component)"
        BodyFile = "$BodiesDir\S6.1.1.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.1.2"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.2 - Composants atoms (Button, Input, Badge, Avatar, Icon, Spinner, Skeleton, Switch, Checkbox, Radio, Tag/Chip)"
        BodyFile = "$BodiesDir\S6.1.2.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.1.3"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.3 - Composants molecules (SearchPill, FormField, Toast, Tooltip, ProgressMeter, Stepper, Dropdown, Tabs, Pagination)"
        BodyFile = "$BodiesDir\S6.1.3.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.1.4"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.4 - Composants organisms (Drawer collapsible, Header, Footer, Modal, CommandPalette, EmptyState, ErrorState)"
        BodyFile = "$BodiesDir\S6.1.4.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.1.5"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.5 - Components gallery /components.html mini-storybook"
        BodyFile = "$BodiesDir\S6.1.5.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/docs", "prio/P1")
    },
    @{
        Id     = "S6.1.6"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.6 - SVG sprite Lucide 30 icones"
        BodyFile = "$BodiesDir\S6.1.6.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/feat", "prio/P1")
    },
    @{
        Id     = "S6.1.7"
        Sprint = "v0.6-s6.1"
        Title  = "S6.1.7 - Tests unit composants critiques + recette S6.1 + tag v0.6-s6.1"
        BodyFile = "$BodiesDir\S6.1.7.md"
        Labels = @("phase/v0.6", "lane/design-system", "type/test", "prio/P0")
    },
    @{
        Id     = "S6.2.0"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.0 - ADR S6.2 + recette S6.1 + setup pages"
        BodyFile = "$BodiesDir\S6.2.0.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/chore", "prio/P0")
    },
    @{
        Id     = "S6.2.1"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.1 - Refonte index.html cockpit + patterns coaching v0.6"
        BodyFile = "$BodiesDir\S6.2.1.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.2.2"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.2 - Refonte arbitrage.html + friction positive 5e P0"
        BodyFile = "$BodiesDir\S6.2.2.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.2.3"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.3 - Refonte evening.html + recovery streak break"
        BodyFile = "$BodiesDir\S6.2.3.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.2.4"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.4 - Refonte taches.html (Eisenhower 2x2 + filtres)"
        BodyFile = "$BodiesDir\S6.2.4.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.2.5"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.5 - Refonte agenda.html drag-drop hebdo"
        BodyFile = "$BodiesDir\S6.2.5.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.2.6"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.6 - Refonte revues.html (Big Rocks + auto-draft Claude)"
        BodyFile = "$BodiesDir\S6.2.6.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P1")
    },
    @{
        Id     = "S6.2.7"
        Sprint = "v0.6-s6.2"
        Title  = "S6.2.7 - Refonte assistant.html streaming SSE raffine + auto-save + recette S6.2 + tag v0.6-s6.2"
        BodyFile = "$BodiesDir\S6.2.7.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.3.0"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.0 - ADR S6.3 + recette S6.2 + setup registres"
        BodyFile = "$BodiesDir\S6.3.0.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/chore", "prio/P0")
    },
    @{
        Id     = "S6.3.1"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.1 - Refonte groupes.html portefeuille drill-down"
        BodyFile = "$BodiesDir\S6.3.1.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.3.2"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.2 - Refonte projets.html liste cross-groupe + filtres"
        BodyFile = "$BodiesDir\S6.3.2.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.3.3"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.3 - Refonte projet.html template parametre ?id="
        BodyFile = "$BodiesDir\S6.3.3.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.3.4"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.4 - Refonte contacts.html cards avatar + filtres trust"
        BodyFile = "$BodiesDir\S6.3.4.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P1")
    },
    @{
        Id     = "S6.3.5"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.5 - Refonte decisions.html registre + IA recommend"
        BodyFile = "$BodiesDir\S6.3.5.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P1")
    },
    @{
        Id     = "S6.3.6"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.6 - Onboarding wizard 5 etapes + Settings page basique 4 sections"
        BodyFile = "$BodiesDir\S6.3.6.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/feat", "prio/P0")
    },
    @{
        Id     = "S6.3.7"
        Sprint = "v0.6-s6.3"
        Title  = "S6.3.7 - Audit a11y axe-core + audit pro externe + recette CEO + tag v0.6 + GitHub Release + ADR cloture"
        BodyFile = "$BodiesDir\S6.3.7.md"
        Labels = @("phase/v0.6", "lane/app-web", "type/test", "prio/P0")
    }
)

Write-Host "  Total : $($issues.Count) issues a creer" -ForegroundColor Green

# Phase 4 : recuperer issues existantes
Write-Host ""
Write-Host "=== Phase 4 : verification idempotence ===" -ForegroundColor Cyan

$existingTitles = @{}
try {
    $issuesListJson = gh issue list --repo $Repo --state all --limit 500 --json number,title 2>$null
    if ($LASTEXITCODE -eq 0 -and $issuesListJson) {
        $issuesList = $issuesListJson | ConvertFrom-Json
        foreach ($i in $issuesList) { $existingTitles[$i.title] = $i.number }
        Write-Host "  $($existingTitles.Count) issues existantes recuperees" -ForegroundColor Green
    }
} catch {
    Write-Host "  [WARN] Impossible de lister issues : $_" -ForegroundColor Yellow
}

# Phase 5 : creer les issues
Write-Host ""
Write-Host "=== Phase 5 : creation des issues ===" -ForegroundColor Cyan

$created = 0; $skipped = 0; $failed = 0

foreach ($issue in $issues) {
    if ($existingTitles.ContainsKey($issue.Title)) {
        Write-Host "  [SKIP] #$($existingTitles[$issue.Title]) $($issue.Id)" -ForegroundColor Yellow
        $skipped++; continue
    }
    if (-not (Test-Path $issue.BodyFile)) {
        Write-Host "  [FAIL] $($issue.Id) - body file absent : $($issue.BodyFile)" -ForegroundColor Red
        $failed++; continue
    }
    if ($DryRun) {
        Write-Host "  [DRY] $($issue.Id) - $($issue.Title) [$($issue.Sprint)]" -ForegroundColor Magenta
        $created++; continue
    }
    try {
        $labelArgs = @()
        foreach ($l in $issue.Labels) {
            $labelArgs += "--label"
            $labelArgs += $l
        }
        $url = & gh issue create --repo $Repo --title $issue.Title --body-file $issue.BodyFile --milestone $issue.Sprint @labelArgs 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $($issue.Id) - $url" -ForegroundColor Green
            $created++
        } else {
            Write-Host "  [FAIL] $($issue.Id) - exit=$LASTEXITCODE - $url" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "  [ERROR] $($issue.Id) - $_" -ForegroundColor Red
        $failed++
    }
}

# Resume
Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
Write-Host "  Crees   : $created" -ForegroundColor Green
Write-Host "  Skippes : $skipped" -ForegroundColor Yellow
$col = "White"
if ($failed -gt 0) { $col = "Red" }
Write-Host "  Echecs  : $failed" -ForegroundColor $col

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "Verifier labels manquants : pwsh -File fix-labels.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Voir issues : https://github.com/$Repo/milestones" -ForegroundColor Cyan
