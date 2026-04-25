# consistence-dump.ps1
# Harvest GitHub state for feycoil/aiCEO and write a single JSON file
# consumed by 11-roadmap-map.html to render GitHub-style refs.
#
# Run from Windows (PowerShell 5+ ou 7+) :
#   cd C:\_workarea_local\aiCEO\04_docs\_audit-2026-04-25
#   ./consistence-dump.ps1
#
# Output:
#   04_docs/_audit-2026-04-25/github-state.json
#
# Pre-requis: gh CLI authentifie (gh auth status)

$ErrorActionPreference = 'Stop'
$OutputEncoding         = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

$repo = 'feycoil/aiCEO'
$out  = Join-Path $PSScriptRoot 'github-state.json'

Write-Host "[*] Repository  : $repo"
Write-Host "[*] Sortie      : $out"
Write-Host ""

function Invoke-GH {
  param([Parameter(Mandatory)][string]$Path)
  gh api $Path --paginate 2>$null | ConvertFrom-Json
}

# ------------------------------------------------------------------ repo
Write-Host "[1/5] Repository meta..."
$repoMeta = gh api "repos/$repo" | ConvertFrom-Json

# ------------------------------------------------------------------ milestones
Write-Host "[2/5] Milestones..."
$milestones = gh api "repos/$repo/milestones?state=all&per_page=100" --paginate | ConvertFrom-Json
$milestonesOut = @($milestones | ForEach-Object {
  [pscustomobject]@{
    number       = $_.number
    title        = $_.title
    state        = $_.state
    description  = $_.description
    due_on       = $_.due_on
    open_issues  = $_.open_issues
    closed_issues= $_.closed_issues
    html_url     = $_.html_url
  }
})

# ------------------------------------------------------------------ labels
Write-Host "[3/5] Labels..."
$labels = gh api "repos/$repo/labels?per_page=100" --paginate | ConvertFrom-Json
$labelsOut = @($labels | ForEach-Object {
  [pscustomobject]@{ name = $_.name; color = $_.color; description = $_.description }
})

# ------------------------------------------------------------------ issues (open + closed, exclut PRs)
Write-Host "[4/5] Issues (open + closed)..."
$issuesRaw = gh api "repos/$repo/issues?state=all&per_page=100" --paginate | ConvertFrom-Json
$issuesOut = @($issuesRaw | Where-Object { -not $_.pull_request } | ForEach-Object {
  [pscustomobject]@{
    number    = $_.number
    title     = $_.title
    state     = $_.state
    state_reason = $_.state_reason
    labels    = @($_.labels | ForEach-Object { [pscustomobject]@{ name = $_.name; color = $_.color } })
    milestone = if ($_.milestone) { [pscustomobject]@{ number = $_.milestone.number; title = $_.milestone.title; state = $_.milestone.state } } else { $null }
    assignees = @($_.assignees | ForEach-Object { $_.login })
    body      = if ($_.body) { ($_.body -split "`n")[0..([Math]::Min(2,([string]$_.body -split "`n").Length-1))] -join "`n" } else { '' }
    html_url  = $_.html_url
    created_at= $_.created_at
    updated_at= $_.updated_at
    closed_at = $_.closed_at
  }
})

# ------------------------------------------------------------------ pulls
Write-Host "[5/5] Pull requests (open + closed + merged)..."
$prsRaw = gh api "repos/$repo/pulls?state=all&per_page=100" --paginate | ConvertFrom-Json
$prsOut = @($prsRaw | ForEach-Object {
  $pr      = $_
  $detail  = gh api "repos/$repo/pulls/$($pr.number)" | ConvertFrom-Json
  $reviews = gh api "repos/$repo/pulls/$($pr.number)/reviews" | ConvertFrom-Json
  $reqRev  = if ($detail.requested_reviewers) { @($detail.requested_reviewers | ForEach-Object { $_.login }) } else { @() }
  $doneRev = if ($reviews) { @($reviews | ForEach-Object { [pscustomobject]@{ user = $_.user.login; state = $_.state } }) } else { @() }

  [pscustomobject]@{
    number      = $pr.number
    title       = $pr.title
    state       = $pr.state
    merged      = [bool]$detail.merged
    merged_at   = $detail.merged_at
    head        = $pr.head.ref
    base        = $pr.base.ref
    labels      = @($pr.labels | ForEach-Object { [pscustomobject]@{ name = $_.name; color = $_.color } })
    milestone   = if ($pr.milestone) { [pscustomobject]@{ number = $pr.milestone.number; title = $pr.milestone.title; state = $pr.milestone.state } } else { $null }
    assignees   = @($pr.assignees | ForEach-Object { $_.login })
    requested_reviewers = $reqRev
    reviews     = $doneRev
    draft       = [bool]$pr.draft
    html_url    = $pr.html_url
    created_at  = $pr.created_at
    updated_at  = $pr.updated_at
    closed_at   = $pr.closed_at
  }
})

# ------------------------------------------------------------------ payload
$payload = [pscustomobject]@{
  generated_at = (Get-Date -Format 'o')
  repo         = @{
    full_name      = $repoMeta.full_name
    default_branch = $repoMeta.default_branch
    html_url       = $repoMeta.html_url
    open_issues    = $repoMeta.open_issues_count
    description    = $repoMeta.description
  }
  milestones = $milestonesOut
  labels     = $labelsOut
  issues     = $issuesOut
  pulls      = $prsOut
}

# Profondeur 20 (vs 8 historiquement) pour absorber labels/reviews/milestones imbriques
$json = $payload | ConvertTo-Json -Depth 20

# Validation pre-write : si le JSON serialise n'est pas parseable on s'arrete net.
# Cause connue PS5 : ConvertTo-Json sur objets contenant des hashtables peut produire
# du JSON tronque silencieusement. On a remplace tous les @{} imbriques par
# [pscustomobject]@{} pour serialisation deterministe.
try {
  $null = $json | ConvertFrom-Json -ErrorAction Stop
} catch {
  $badPath = "$out.bad"
  [IO.File]::WriteAllText($badPath, $json, [Text.UTF8Encoding]::new($false))
  throw "[FAIL] JSON serialisation invalide. Dump brut sauve dans $badPath. Erreur : $_"
}

$utf8NoBom = [Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText($out, $json, $utf8NoBom)

# Validation post-write : on relit le fichier et on parse. Si KO on arrete.
try {
  $null = (Get-Content $out -Raw -Encoding UTF8) | ConvertFrom-Json -ErrorAction Stop
} catch {
  throw "[FAIL] Fichier ecrit mais non-parseable. Verifier $out. Erreur : $_"
}

Write-Host ""
Write-Host "[OK] $($issuesOut.Count) issues, $($prsOut.Count) PRs, $($milestonesOut.Count) milestones, $($labelsOut.Count) labels"
Write-Host "[OK] JSON valide ($([Math]::Round((Get-Item $out).Length/1KB, 1)) Ko)"
Write-Host "[OK] Sortie : $out"
