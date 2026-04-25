# ============================================================
# gh-cleanup-coherence-v1.ps1
# ============================================================
# Audit du 2026-04-25 — remediation des 5 divergences GitHub <-> roadmap.
#
# A executer depuis Windows : pwsh -File ce-script.ps1
# Pre-requis : gh CLI authentifie (gh auth status doit etre OK).
#
# Etapes :
#   1. Fermer doublons S3 #124-#134 (state_reason=not_planned)
#   2. Creer milestones manquants sprint-externe-v0.5 + v0.5-s1 (closed)
#   3. Completer meta PR #111 (S2) : milestone + labels + reviewers
#   4. Completer meta PR #112 (S3) : milestone + labels + reviewers
#   5. Merger PR #111 -> ferme automatiquement #101-#110
#   6. Dump final pour verifier
#
# Tout est idempotent : re-execution sans effet de bord.
# ============================================================

$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== gh-cleanup-coherence-v1 ===" -ForegroundColor Cyan
Write-Host "Repo : $repo`n"

# ---------- 0. Auth check ----------
Write-Host "[0/6] Auth check..." -ForegroundColor Yellow
& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR : gh auth status KO. Faire 'gh auth login' d'abord." -ForegroundColor Red
    exit 1
}
Write-Host "  OK`n"

# ---------- 1. Fermer doublons S3 #124-#134 ----------
Write-Host "[1/6] Fermeture des doublons S3 #124-#134 (state_reason=not_planned)..." -ForegroundColor Yellow
$dupCloseComment = "Doublon du script ``gh-create-issues-s3.ps1`` execute deux fois. La serie de reference est #113-#123 (meme titres, meme milestone v0.5-s3). Ferme automatiquement par audit du 2026-04-25 (cf. ``04_docs/_audit-2026-04-25/``)."
foreach ($n in 124..134) {
    # Verif etat actuel (idempotent)
    $jsonText = & gh api "repos/$repo/issues/$n" 2>$null | Out-String
    if ([string]::IsNullOrWhiteSpace($jsonText)) {
        Write-Host "  #$n : non trouve, skip" -ForegroundColor DarkGray
        continue
    }
    $issue = $jsonText | ConvertFrom-Json
    if ($issue.state -eq "closed") {
        Write-Host "  #$n : deja closed, skip" -ForegroundColor DarkGray
        continue
    }
    # Comment
    $tmpComment = New-TemporaryFile
    [System.IO.File]::WriteAllText($tmpComment.FullName, $dupCloseComment, [System.Text.Encoding]::UTF8)
    & gh issue comment $n --repo $repo --body-file $tmpComment.FullName 2>&1 | Out-Null
    Remove-Item $tmpComment.FullName -Force
    # Close avec state_reason
    & gh issue close $n --repo $repo --reason "not planned" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  #$n : closed (not planned)" -ForegroundColor Green
    } else {
        Write-Host "  #$n : ECHEC close" -ForegroundColor Red
    }
}
Write-Host ""

# ---------- 2. Creer milestones manquants ----------
Write-Host "[2/6] Creation milestones rétroactifs (sprint-externe-v0.5 + v0.5-s1)..." -ForegroundColor Yellow

function Ensure-MilestoneClosed($title, $description, $dueOn) {
    $jsonText = & gh api "repos/$repo/milestones?state=all&per_page=100" 2>$null | Out-String
    $existing = $null
    if (-not [string]::IsNullOrWhiteSpace($jsonText)) {
        try {
            $existing = ($jsonText | ConvertFrom-Json) | Where-Object { $_.title -eq $title } | Select-Object -First 1
        } catch { $existing = $null }
    }
    if ($existing) {
        Write-Host "  $title : existe deja (#$($existing.number), state=$($existing.state))" -ForegroundColor DarkGray
        # Si deja closed, rien a faire ; sinon on close
        if ($existing.state -ne "closed") {
            & gh api -X PATCH "repos/$repo/milestones/$($existing.number)" -f state=closed 2>&1 | Out-Null
            Write-Host "    -> close" -ForegroundColor Green
        }
        return
    }
    # Cree puis ferme
    $created = & gh api "repos/$repo/milestones" `
        -f title="$title" `
        -f description="$description" `
        -f due_on="$dueOn" `
        -f state="closed" 2>$null | ConvertFrom-Json
    if ($created -and $created.number) {
        Write-Host "  $title : cree #$($created.number) closed" -ForegroundColor Green
    } else {
        Write-Host "  $title : ECHEC creation" -ForegroundColor Red
    }
}

Ensure-MilestoneClosed `
    "sprint-externe-v0.5" `
    "Sprint externe pre-fusion (avril 2026) — 6 livrables docs (benchmark v2, pitch onepage, business case, onboarding, lettre intro, pitch deck investisseur). Historique pre-GitHub, ferme retroactivement par audit 2026-04-25." `
    "2026-04-25T23:59:59Z"

Ensure-MilestoneClosed `
    "v0.5-s1" `
    "Sprint S1 du plan v0.5 — Backend stable SQLite (14 tables, 41 routes, 23/23 tests). Tag v0.5-s1 sur 141ca0f. Livre 25/04/2026, ferme retroactivement par audit 2026-04-25." `
    "2026-04-25T23:59:59Z"

Write-Host ""

# ---------- 3. Completer meta PR #111 ----------
Write-Host "[3/6] PR #111 (S2) — milestone + labels + reviewers..." -ForegroundColor Yellow

# Recuperer IDs milestone v0.5-s2
$msJson = & gh api "repos/$repo/milestones?state=all&per_page=100" | Out-String
$ms = ($msJson | ConvertFrom-Json) | Where-Object { $_.title -eq "v0.5-s2" } | Select-Object -First 1
if (-not $ms) {
    Write-Host "  ERREUR : milestone v0.5-s2 introuvable" -ForegroundColor Red
} else {
    & gh api -X PATCH "repos/$repo/issues/111" -F "milestone=$($ms.number)" 2>&1 | Out-Null
    Write-Host "  milestone : v0.5-s2 (#$($ms.number)) OK" -ForegroundColor Green
}

# Labels (idempotent : --add-label cumule, doublons ignores cote API)
& gh issue edit 111 --repo $repo `
    --add-label "phase/v0.5-s2" `
    --add-label "sprint/s2" `
    --add-label "lane/mvp" `
    --add-label "type/release" 2>&1 | Out-Null
Write-Host "  labels : phase/v0.5-s2, sprint/s2, lane/mvp, type/release OK" -ForegroundColor Green

# Reviewer (auto-merge en self-review impossible, mais on ajoute le CEO comme reviewer pour traçabilité)
# Note : reviewer = login GitHub. Adapter si besoin.
$prReviewer = "feycoil"
& gh pr edit 111 --repo $repo --add-reviewer $prReviewer 2>&1 | Out-Null
Write-Host "  reviewer : $prReviewer (peut echouer si self-review, normal)" -ForegroundColor DarkGray
Write-Host ""

# ---------- 4. Completer meta PR #112 ----------
Write-Host "[4/6] PR #112 (S3) — milestone + labels + reviewers..." -ForegroundColor Yellow
$ms3 = ($msJson | ConvertFrom-Json) | Where-Object { $_.title -eq "v0.5-s3" } | Select-Object -First 1
if (-not $ms3) {
    Write-Host "  ERREUR : milestone v0.5-s3 introuvable" -ForegroundColor Red
} else {
    & gh api -X PATCH "repos/$repo/issues/112" -F "milestone=$($ms3.number)" 2>&1 | Out-Null
    Write-Host "  milestone : v0.5-s3 (#$($ms3.number)) OK" -ForegroundColor Green
}
& gh issue edit 112 --repo $repo `
    --add-label "phase/v0.5-s3" `
    --add-label "sprint/s3" `
    --add-label "lane/docs" `
    --add-label "type/docs" 2>&1 | Out-Null
Write-Host "  labels : phase/v0.5-s3, sprint/s3, lane/docs, type/docs OK" -ForegroundColor Green
& gh pr edit 112 --repo $repo --add-reviewer $prReviewer 2>&1 | Out-Null
Write-Host "  reviewer : $prReviewer" -ForegroundColor DarkGray
Write-Host ""

# ---------- 5. Merger PR #111 ----------
Write-Host "[5/6] Merge PR #111 (S2) — declenchera Closes #101-#110..." -ForegroundColor Yellow
$doMerge = $true
# Verifier que le PR body contient bien les Closes #N
$prBody = & gh pr view 111 --repo $repo --json body | ConvertFrom-Json
$bodyHasCloses = ($prBody.body -match "Closes\s+#10[1-9]") -or ($prBody.body -match "Close[sd]?:?\s+#10[1-9]")
if ($bodyHasCloses) {
    Write-Host "  PR body contient bien des refs Closes #101+, OK" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION : PR body ne contient PAS de 'Closes #101..#110'." -ForegroundColor Yellow
    Write-Host "  Auto-close ne fonctionnera pas. Patcher le body avant de merger ?" -ForegroundColor Yellow
    Write-Host "  Lien : https://github.com/$repo/pull/111" -ForegroundColor Cyan
    $confirm = Read-Host "  Continuer le merge quand meme ? [o/N]"
    if ($confirm -ne "o") {
        Write-Host "  Merge ANNULE par l'utilisateur. Fermeture manuelle des issues S2 sautee." -ForegroundColor Yellow
        $doMerge = $false
    }
}

if ($doMerge) {
    # Merge en squash (convention aiCEO) avec auto-delete branch
    & gh pr merge 111 --repo $repo --squash --delete-branch 2>&1 | Tee-Object -Variable mergeLog
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Merge OK." -ForegroundColor Green
        # Fallback : si le PR body n'avait pas de Closes #N, fermer manuellement
        if (-not $bodyHasCloses) {
            Write-Host "  Fallback : fermeture manuelle des issues S2 #101-#110..." -ForegroundColor Yellow
            foreach ($n in 101..110) {
                $i = & gh api "repos/$repo/issues/$n" 2>$null | ConvertFrom-Json
                if ($i.state -eq "open") {
                    & gh issue close $n --repo $repo --reason "completed" 2>&1 | Out-Null
                    Write-Host "    #$n : closed (completed)" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "  Merge ECHEC. Voir log ci-dessus." -ForegroundColor Red
    }
}
Write-Host ""

# ---------- 6. Dump final pour audit ----------
Write-Host "[6/6] Dump final pour audit..." -ForegroundColor Yellow
$dumpScript = Join-Path $PSScriptRoot "..\consistence-dump.ps1"
if (Test-Path $dumpScript) {
    & pwsh -File $dumpScript
    Write-Host "  Dump regenere -> ../github-state.json" -ForegroundColor Green
} else {
    Write-Host "  consistence-dump.ps1 introuvable a $dumpScript" -ForegroundColor Yellow
    Write-Host "  Lancer manuellement : pwsh -File 04_docs/_audit-2026-04-25/consistence-dump.ps1" -ForegroundColor Cyan
}

Write-Host "`n=== TERMINE ===" -ForegroundColor Cyan
Write-Host "Verifier :"
Write-Host "  - https://github.com/$repo/issues?q=is%3Aissue+state%3Aclosed (S2 #101-110 + S3 doublons #124-134)"
Write-Host "  - https://github.com/$repo/milestones?state=closed (sprint-externe-v0.5 + v0.5-s1)"
Write-Host "  - https://github.com/$repo/pull/112 (meta : milestone+labels+reviewer)"
Write-Host "  - github-state.json regenere"
