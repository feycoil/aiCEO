# cleanup-v0.6-issues.ps1
# Ferme les issues v0.6 livrees + ferme le milestone v0.6 apres finalisation 28/04 PM
# Complement de fix-milestones-v0.7.ps1 (qui cree v0.7 mais ne cleanup pas v0.6)
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\cleanup-v0.6-issues.ps1            (DRY-RUN)
#         pwsh -File C:\_workarea_local\aiCEO\cleanup-v0.6-issues.ps1 -Apply

param(
    [switch]$Apply
)

$ErrorActionPreference = "Continue"
$repo = "feycoil/aiCEO"

Write-Host ""
if ($Apply) {
    Write-Host "==> MODE : APPLY" -Fore Red
} else {
    Write-Host "==> MODE : DRY-RUN (ajouter -Apply pour executer)" -Fore Yellow
}
Write-Host ""

# ============================================================
# ETAPE 1 : Identifier toutes les milestones v0.6.*
# ============================================================
Write-Host "=== ETAPE 1 : Identifier milestones v0.6.* ===" -Fore Cyan

$milestones = gh api "repos/$repo/milestones?state=all&per_page=50" 2>$null | ConvertFrom-Json
$v06Milestones = $milestones | Where-Object { $_.title -like "v0.6*" }

if ($v06Milestones.Count -eq 0) {
    Write-Host "   Aucune milestone v0.6.* trouvee" -Fore Yellow
} else {
    foreach ($m in $v06Milestones) {
        Write-Host "   #$($m.number) $($m.title) state=$($m.state) open=$($m.open_issues) closed=$($m.closed_issues)" -Fore Yellow
    }
}

# ============================================================
# ETAPE 2 : Fermer toutes les issues open des milestones v0.6.*
# ============================================================
Write-Host ""
Write-Host "=== ETAPE 2 : Fermer issues v0.6.* livrees ===" -Fore Cyan

$closeMsg = "Livree par v0.6 finalisee 28/04/2026 PM. " + `
            "Sprint S6.4 cable backend SQLite + 1052 emails ingeres + 13/17 pages frontend cablees. " + `
            "Sprints S6.5 (security headers + knowledge router) + S6.6 (qualite code DEBUG_AICEO) + S6.7 (a11y P0/P1 + bug syntax) " + `
            "livres sous mandat plein CEO. " + `
            "Cf. ADR ``2026-04-28 v3 v0.6 finalisee`` dans 00_BOUSSOLE/DECISIONS.md + release notes 04_docs/_release-notes/v0.6.md."

$totalClosed = 0
$totalSkipped = 0
$totalErrors = 0

foreach ($m in $v06Milestones) {
    $msTitle = $m.title
    Write-Host ""
    Write-Host "   --- Milestone $msTitle (#$($m.number)) ---" -Fore Cyan

    $issues = gh issue list --milestone $msTitle --state open --limit 100 --json number,title --repo $repo 2>$null | ConvertFrom-Json

    if ($issues.Count -eq 0) {
        Write-Host "       Aucune issue ouverte" -Fore Green
        continue
    }

    Write-Host "       $($issues.Count) issues a fermer :" -Fore Yellow

    foreach ($i in $issues) {
        $title = $i.title.Substring(0, [Math]::Min(70, $i.title.Length))
        if ($Apply) {
            gh issue close $i.number --repo $repo --reason completed --comment $closeMsg 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "       + #$($i.number) ferme : $title" -Fore Green
                $totalClosed++
            } else {
                Write-Host "       ! #$($i.number) fermeture echec : $title" -Fore Red
                $totalErrors++
            }
        } else {
            Write-Host "       WOULD CLOSE #$($i.number) : $title" -Fore Yellow
            $totalSkipped++
        }
    }
}

# ============================================================
# ETAPE 3 : Fermer les milestones v0.6.* qui n'ont plus d'issues open
# ============================================================
Write-Host ""
Write-Host "=== ETAPE 3 : Fermer milestones v0.6.* sans open ===" -Fore Cyan

# Re-query apres fermeture des issues
$milestonesUpdated = gh api "repos/$repo/milestones?state=all&per_page=50" 2>$null | ConvertFrom-Json
$v06Updated = $milestonesUpdated | Where-Object { $_.title -like "v0.6*" }

foreach ($m in $v06Updated) {
    if ($m.state -eq "closed") {
        Write-Host "   = $($m.title) deja closed, skip" -Fore Yellow
        continue
    }

    $stillOpen = if ($Apply) { $m.open_issues } else { 0 }  # En dry-run, on simule pas les fermetures

    if ($Apply -and $stillOpen -eq 0) {
        gh api -X PATCH "repos/$repo/milestones/$($m.number)" -f state=closed | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   + $($m.title) ferme" -Fore Green
        } else {
            Write-Host "   ! $($m.title) fermeture echec" -Fore Red
        }
    } else {
        Write-Host "   WOULD CLOSE $($m.title) (#$($m.number))" -Fore Yellow
    }
}

# ============================================================
# Resume
# ============================================================
Write-Host ""
Write-Host "=== RESUME ===" -Fore Cyan
if ($Apply) {
    Write-Host "   $totalClosed issues fermees, $totalErrors erreurs" -Fore Green
    Write-Host ""
    Write-Host "Etape suivante : creer milestone v0.7 + 17 issues backlog v0.7 :" -Fore Cyan
    Write-Host "    pwsh -File C:\_workarea_local\aiCEO\fix-milestones-v0.7.ps1 -Apply"
    Write-Host ""
    Write-Host "Verifier l'etat post-fix :"
    Write-Host "    pwsh -File C:\_workarea_local\aiCEO\consistence-dump.ps1"
} else {
    Write-Host "   $totalSkipped issues seraient fermees en mode -Apply" -Fore Yellow
    Write-Host ""
    Write-Host "Pour appliquer : pwsh -File C:\_workarea_local\aiCEO\cleanup-v0.6-issues.ps1 -Apply" -Fore Cyan
}
Write-Host ""
