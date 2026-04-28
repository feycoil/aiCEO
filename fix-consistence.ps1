# fix-consistence.ps1
# Corrige les divergences identifiees par check_consistence_versions().
# Usage : pwsh -File C:\_workarea_local\aiCEO\fix-consistence.ps1
#         pwsh -File C:\_workarea_local\aiCEO\fix-consistence.ps1 -Apply

param(
    [switch]$Apply
)

$ErrorActionPreference = "Continue"
$repo = "feycoil/aiCEO"
$root = "C:\_workarea_local\aiCEO"
Set-Location $root

Write-Host ""
if ($Apply) {
    Write-Host "==> MODE : APPLY" -Fore Red
} else {
    Write-Host "==> MODE : DRY-RUN (ajouter -Apply pour executer)" -Fore Yellow
}
Write-Host ""

# ============================================================
# DIVERGENCE 1 : Creer les 4 GitHub Releases manquantes
# ============================================================
Write-Host "=== FIX 1 : Publier les GitHub Releases manquantes ===" -Fore Cyan

$releases = @(
    @{ tag="v0.5-s1"; title="v0.5-s1 (Sprint S1 - Backend stable SQLite)";                notes="04_docs/_release-notes/v0.5-s1.md" },
    @{ tag="v0.5-s2"; title="v0.5-s2 (Sprint S2 - Cockpit live + rituels + spike SSE)";    notes="04_docs/_release-notes/v0.5-s2.md" },
    @{ tag="v0.5-s3"; title="v0.5-s3 (Sprint S3 - Agenda + Revues + SSE live + Outlook)";  notes="04_docs/_release-notes/v0.5-s3.md" },
    @{ tag="v0.5-s4"; title="v0.5-s4 (Sprint S4 - Assistant chat + 5 pages portefeuille)"; notes="04_docs/_release-notes/v0.5-s4.md" }
)

foreach ($r in $releases) {
    # Verifier que la release n'existe pas deja
    $exists = gh release view $r.tag --repo $repo 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   = $($r.tag) deja publie, skip" -Fore Yellow
        continue
    }

    # Verifier que les notes existent
    if (-not (Test-Path $r.notes)) {
        Write-Host "   ! $($r.tag) : notes manquantes ($($r.notes))" -Fore Red
        continue
    }

    if ($Apply) {
        gh release create $r.tag --repo $repo --title $r.title --notes-file $r.notes
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   + $($r.tag) publie avec $($r.notes)" -Fore Green
        } else {
            Write-Host "   ! $($r.tag) creation echouee" -Fore Red
        }
    } else {
        Write-Host "   WOULD CREATE $($r.tag) avec $($r.notes)" -Fore Yellow
    }
}

# ============================================================
# DIVERGENCE 2 : Fermer le milestone v0.5-s2
# ============================================================
Write-Host ""
Write-Host "=== FIX 2 : Fermer le milestone v0.5-s2 (#5) ===" -Fore Cyan

if ($Apply) {
    gh api -X PATCH "repos/$repo/milestones/5" -f state=closed | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + milestone v0.5-s2 ferme" -Fore Green
    } else {
        Write-Host "   ! fermeture echouee" -Fore Red
    }
} else {
    Write-Host "   WOULD CLOSE milestone v0.5-s2 (#5)" -Fore Yellow
}

# ============================================================
# DIVERGENCE 3 : Diagnostiquer les 16 issues open du milestone MVP
# ============================================================
Write-Host ""
Write-Host "=== FIX 3 : Diagnostique milestone MVP (16 issues open dans milestone clos) ===" -Fore Cyan

$mvpIssues = gh issue list --milestone MVP --state open --limit 50 --json number,title --repo $repo 2>$null | ConvertFrom-Json

if ($mvpIssues.Count -eq 0) {
    Write-Host "   = aucune issue ouverte dans milestone MVP, divergence resolue" -Fore Green
} else {
    Write-Host "   $($mvpIssues.Count) issues ouvertes dans milestone MVP :" -Fore Yellow
    foreach ($i in $mvpIssues) {
        Write-Host ("     #{0,3} {1}" -f $i.number, $i.title.Substring(0, [Math]::Min(70, $i.title.Length)))
    }
    Write-Host ""
    Write-Host "   Decision a prendre :" -Fore Cyan
    Write-Host "   (a) Retirer milestone MVP de ces 16 issues (les laisser sans milestone)" -Fore Cyan
    Write-Host "       gh issue edit <NUM> --milestone ''" -Fore Gray
    Write-Host "   (b) Reouvrir le milestone MVP (gh api -X PATCH repos/$repo/milestones/1 -f state=open)" -Fore Cyan
    Write-Host "       Puis decider du devenir de ces 16 issues" -Fore Gray
    Write-Host ""
    Write-Host "   Recommandation : (a) car MVP est livre, ces issues sont du backlog v1+." -Fore Cyan
    Write-Host "   Pour appliquer (a) automatiquement :" -Fore Cyan
    Write-Host "     foreach (`$i in `$mvpIssues) { gh issue edit `$i.number --milestone '' --repo $repo }" -Fore Gray
}

# ============================================================
# Resume final
# ============================================================
Write-Host ""
Write-Host "=== RESUME ===" -Fore Cyan
if ($Apply) {
    Write-Host "Pour re-verifier l'etat post-fix :" -Fore Cyan
    Write-Host "    pwsh -File C:\_workarea_local\aiCEO\consistence-dump.ps1"
} else {
    Write-Host "Pour appliquer les corrections (sauf FIX 3 qui necessite decision) :" -Fore Cyan
    Write-Host "    pwsh -File C:\_workarea_local\aiCEO\fix-consistence.ps1 -Apply"
}
Write-Host ""
