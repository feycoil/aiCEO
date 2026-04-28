# fix-consistence-v2.ps1
# Corrige les divergences identifiees apres livraison S5 :
#   FIX A — Patcher consistence-dump.ps1 pour matcher 'v0.5*' (au lieu de 'v0.5-*')
#   FIX B — Diagnostiquer et publier les releases (drafts ou absentes)
#   FIX C — Fermer les 8 issues S5 (livrees mais sans Closes # dans commit)
#   FIX D — Fermer le milestone v0.5-s5 apres FIX C
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\fix-consistence-v2.ps1
#         pwsh -File C:\_workarea_local\aiCEO\fix-consistence-v2.ps1 -Apply

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
# FIX A — Patcher le script consistence-dump.ps1 (filter tag)
# ============================================================
Write-Host "=== FIX A : Patch consistence-dump.ps1 pattern tags ===" -Fore Cyan

$dumpScript = Join-Path $root "consistence-dump.ps1"
if (Test-Path $dumpScript) {
    $content = Get-Content $dumpScript -Raw
    $oldPattern = "git tag --list 'v0.5-*' -n1"
    $newPattern = "git tag --list 'v0.5*' -n1"
    if ($content.Contains($oldPattern)) {
        if ($Apply) {
            $content = $content.Replace($oldPattern, $newPattern)
            Set-Content -Path $dumpScript -Value $content -NoNewline -Encoding UTF8
            Write-Host "   + filter tags patche en 'v0.5*'" -Fore Green
        } else {
            Write-Host "   WOULD PATCH 'v0.5-*' -> 'v0.5*'" -Fore Yellow
        }
    } else {
        Write-Host "   = pattern deja correct, skip" -Fore Yellow
    }
} else {
    Write-Host "   ! consistence-dump.ps1 introuvable" -Fore Red
}

# ============================================================
# FIX B — Diagnostiquer les releases (drafts ou manquantes)
# ============================================================
Write-Host ""
Write-Host "=== FIX B : Diagnostic releases GitHub ===" -Fore Cyan

# Lister TOUTES les releases (incluant drafts et prereleases)
$releasesAll = gh api "repos/$repo/releases?per_page=20" 2>$null | ConvertFrom-Json
Write-Host "   Releases trouvees : $($releasesAll.Count)" -Fore $(if ($releasesAll.Count -gt 0) {"Green"} else {"Red"})

if ($releasesAll.Count -gt 0) {
    foreach ($r in $releasesAll) {
        $marker = if ($r.draft) { "[DRAFT]" } elseif ($r.prerelease) { "[PRE]" } else { "[PUBLIC]" }
        Write-Host ("     {0,-12} {1,-8} created={2}" -f $r.tag_name, $marker, $r.created_at)
    }
}

# Tags qu'on doit absolument avoir en release publique
$expectedTags = @("v0.5-s1", "v0.5-s2", "v0.5-s3", "v0.5-s4", "v0.5")
$publishedTags = $releasesAll | Where-Object { -not $_.draft -and -not $_.prerelease } | ForEach-Object { $_.tag_name }
$draftTags = $releasesAll | Where-Object { $_.draft } | ForEach-Object { $_.tag_name }
$missingTags = $expectedTags | Where-Object { $_ -notin $publishedTags }

Write-Host ""
Write-Host "   Tags attendus en release publique : $($expectedTags -join ', ')" -Fore Cyan
Write-Host "   Releases publiques trouvees       : $($publishedTags -join ', ')" -Fore $(if ($publishedTags) {"Green"} else {"Yellow"})
if ($draftTags) {
    Write-Host "   Releases en DRAFT (a publier)     : $($draftTags -join ', ')" -Fore Yellow
}
if ($missingTags) {
    Write-Host "   Releases MANQUANTES (a creer)     : $($missingTags -join ', ')" -Fore Red
}

# Action : publier les drafts + creer les manquantes
foreach ($tag in $expectedTags) {
    $existing = $releasesAll | Where-Object { $_.tag_name -eq $tag } | Select-Object -First 1
    $notesFile = "04_docs/_release-notes/$tag.md"
    if (-not (Test-Path $notesFile)) {
        Write-Host "   ! $tag : notes manquantes ($notesFile)" -Fore Red
        continue
    }

    if ($existing -and -not $existing.draft) {
        Write-Host "   = $tag deja publie [PUBLIC], skip" -Fore Yellow
        continue
    }

    if ($existing -and $existing.draft) {
        # Publier le draft existant
        if ($Apply) {
            gh api -X PATCH "repos/$repo/releases/$($existing.id)" -f draft=false 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   + $tag draft -> publie" -Fore Green
            } else {
                Write-Host "   ! $tag publication echec" -Fore Red
            }
        } else {
            Write-Host "   WOULD PUBLISH draft $tag" -Fore Yellow
        }
    } else {
        # Creer la release
        if ($Apply) {
            gh release create $tag --repo $repo --title "$tag" --notes-file $notesFile
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   + $tag cree avec notes $notesFile" -Fore Green
            } else {
                Write-Host "   ! $tag creation echec" -Fore Red
            }
        } else {
            Write-Host "   WOULD CREATE $tag avec notes $notesFile" -Fore Yellow
        }
    }
}

# ============================================================
# FIX C — Fermer les 8 issues S5 (livrees mais sans Closes #)
# ============================================================
Write-Host ""
Write-Host "=== FIX C : Fermer les 8 issues S5 (livrees mais sans Closes #) ===" -Fore Cyan

$s5Issues = gh issue list --milestone v0.5-s5 --state open --limit 50 --json number,title --repo $repo 2>$null | ConvertFrom-Json
Write-Host "   Issues S5 ouvertes : $($s5Issues.Count)" -Fore $(if ($s5Issues.Count -eq 0) {"Green"} else {"Yellow"})

if ($s5Issues.Count -gt 0) {
    foreach ($i in $s5Issues) {
        if ($Apply) {
            gh issue close $i.number --repo $repo --reason completed --comment "Livre par commit feat(s5) sur main. Code livre dans 03_mvp/ et docs dans 04_docs/." 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   + #$($i.number) ferme" -Fore Green
            } else {
                Write-Host "   ! #$($i.number) fermeture echec" -Fore Red
            }
        } else {
            Write-Host ("   WOULD CLOSE #{0,3} {1}" -f $i.number, $i.title.Substring(0, [Math]::Min(60, $i.title.Length))) -Fore Yellow
        }
    }
}

# ============================================================
# FIX D — Fermer le milestone v0.5-s5
# ============================================================
Write-Host ""
Write-Host "=== FIX D : Fermer le milestone v0.5-s5 (#10) ===" -Fore Cyan

$ms = gh api "repos/$repo/milestones/10" 2>$null | ConvertFrom-Json
if ($ms.state -eq "closed") {
    Write-Host "   = milestone v0.5-s5 deja ferme, skip" -Fore Yellow
} else {
    if ($Apply) {
        gh api -X PATCH "repos/$repo/milestones/10" -f state=closed | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   + milestone v0.5-s5 ferme" -Fore Green
        } else {
            Write-Host "   ! fermeture echec" -Fore Red
        }
    } else {
        Write-Host "   WOULD CLOSE milestone v0.5-s5 (#10)" -Fore Yellow
    }
}

# ============================================================
# Resume + re-dump
# ============================================================
Write-Host ""
Write-Host "=== RESUME ===" -Fore Cyan
if ($Apply) {
    Write-Host "Pour re-verifier l'etat post-fix :" -Fore Cyan
    Write-Host "    pwsh -File C:\_workarea_local\aiCEO\consistence-dump.ps1"
    Write-Host ""
    Write-Host "Attendu :"
    Write-Host "  - Tags : 6 (incl. v0.5)"
    Write-Host "  - Releases publiees : 5 (v0.5-s1 a v0.5)"
    Write-Host "  - v0.5-s5 #10 closed open=0 closed=8"
    Write-Host ""
    Write-Host "v0.5 internalisee TERMINEE - tout est scelle" -Fore Green
} else {
    Write-Host "Pour appliquer : pwsh -File C:\_workarea_local\aiCEO\fix-consistence-v2.ps1 -Apply" -Fore Cyan
}
Write-Host ""
