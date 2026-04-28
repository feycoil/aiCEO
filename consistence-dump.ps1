# consistence-dump.ps1
# Dump l'etat GitHub actuel pour audit de coherence vs roadmap.
# Usage : pwsh -File C:\_workarea_local\aiCEO\consistence-dump.ps1
# Output : C:\_workarea_local\aiCEO\consistence-dump.json

$ErrorActionPreference = "Continue"
$repo = "feycoil/aiCEO"
$out  = "C:\_workarea_local\aiCEO\consistence-dump.json"

Write-Host ""
Write-Host "==> Dump GitHub state pour $repo" -Fore Cyan
Write-Host ""

# 1. Tags
Write-Host "  [1/5] Tags..." -Fore Yellow
$tags = git tag --list 'v0.5*' -n1 2>&1 | ForEach-Object {
    if ($_ -match '^(\S+)\s+(.*)$') {
        @{ name=$Matches[1]; message=$Matches[2].Trim() }
    } else {
        @{ name=$_.Trim(); message="" }
    }
}

# 2. Releases GitHub
Write-Host "  [2/5] Releases..." -Fore Yellow
$releases = gh release list --limit 20 --json tagName,name,isDraft,isPrerelease,publishedAt,url 2>$null | ConvertFrom-Json

# 3. Milestones
Write-Host "  [3/5] Milestones..." -Fore Yellow
$milestones = gh api "repos/$repo/milestones?state=all&per_page=50" 2>$null | ConvertFrom-Json |
    ForEach-Object {
        @{
            number   = $_.number
            title    = $_.title
            state    = $_.state
            open     = $_.open_issues
            closed   = $_.closed_issues
            due_on   = $_.due_on
            html_url = $_.html_url
        }
    }

# 4. Issues groupees par milestone
Write-Host "  [4/5] Issues..." -Fore Yellow
$issuesAll = gh issue list --state all --limit 500 --json number,title,state,labels,milestone,url 2>$null | ConvertFrom-Json
$issuesByMilestone = @{}
foreach ($i in $issuesAll) {
    $ms = if ($i.milestone) { $i.milestone.title } else { "(none)" }
    if (-not $issuesByMilestone.ContainsKey($ms)) {
        $issuesByMilestone[$ms] = @{ open=@(); closed=@() }
    }
    $entry = @{
        number = $i.number
        title  = $i.title
        labels = ($i.labels | ForEach-Object { $_.name }) -join ","
    }
    if ($i.state -eq "OPEN") {
        $issuesByMilestone[$ms].open += $entry
    } else {
        $issuesByMilestone[$ms].closed += $entry
    }
}

# 5. Branches recentes
Write-Host "  [5/5] Branches..." -Fore Yellow
$branches = git branch -a --sort=-committerdate 2>&1 |
    Select-Object -First 15 |
    ForEach-Object { $_.Trim() }

# Compose dump
$dump = [ordered]@{
    timestamp           = (Get-Date -Format o)
    repo                = $repo
    branch_current      = (git branch --show-current 2>&1).Trim()
    head_commit         = (git rev-parse --short HEAD 2>&1).Trim()
    head_message        = (git log -1 --pretty=%s 2>&1).Trim()
    tags                = $tags
    releases            = $releases
    milestones          = $milestones
    issues_by_milestone = $issuesByMilestone
    branches_recent     = $branches
}

# Force conversion sans truncature (piege #6 ConvertTo-Json depth)
$json = $dump | ConvertTo-Json -Depth 20 -Compress:$false
$json | Out-File -FilePath $out -Encoding UTF8

Write-Host ""
Write-Host "==> Dump ecrit : $out" -Fore Green
Write-Host "    Taille    : $((Get-Item $out).Length) bytes"
Write-Host "    Tags      : $($tags.Count)"
Write-Host "    Releases  : $($releases.Count)"
Write-Host "    Milestones: $($milestones.Count)"
Write-Host "    Issues    : $($issuesAll.Count) total ($($issuesAll | Where-Object {$_.state -eq 'OPEN'} | Measure-Object).Count open)"
Write-Host ""
Write-Host "==> Resume rapide (par milestone) :"
foreach ($ms in $milestones | Sort-Object number) {
    $key = $ms.title
    $cnt = if ($issuesByMilestone.ContainsKey($key)) { $issuesByMilestone[$key] } else { @{open=@();closed=@()} }
    Write-Host ("    {0,-12} #{1,-3} {2,-7} open={3,2} closed={4,2}" -f $ms.title, $ms.number, $ms.state, $cnt.open.Count, $cnt.closed.Count)
}
Write-Host ""
Write-Host "==> Releases publiees :"
foreach ($r in $releases) {
    $draftMark = if ($r.isDraft) { "[DRAFT]" } else { "[PUBLIC]" }
    Write-Host ("    {0,-10} {1,-8} {2}" -f $r.tagName, $draftMark, $r.publishedAt)
}
Write-Host ""
Write-Host "==> Tags locaux :"
foreach ($t in $tags) {
    Write-Host ("    {0,-10} {1}" -f $t.name, $t.message)
}
Write-Host ""
