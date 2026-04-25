# resolve-merge.ps1 — refait le merge main -> docs/sprint-s3-kickoff cote Windows
# avec les memes resolutions que la sandbox (pas de re-saisie manuelle).
#
# Usage : pwsh ou powershell, dans C:\_workarea_local\aiCEO

$ErrorActionPreference = "Stop"
Set-Location "C:\_workarea_local\aiCEO"

Write-Host "[1/6] Fetch + checkout docs/sprint-s3-kickoff" -Fore Cyan
git fetch origin
git checkout docs/sprint-s3-kickoff
git reset --hard origin/docs/sprint-s3-kickoff

Write-Host "[2/6] Merge origin/main (va creer 6 conflits)" -Fore Cyan
$mergeOutput = git merge origin/main --no-edit 2>&1
Write-Host $mergeOutput

Write-Host "[3/6] Resolution automatique : keep HEAD pour les 6 fichiers" -Fore Cyan
$files = @(
  "00_BOUSSOLE/DECISIONS.md",
  "03_mvp/docs/API.md",
  "03_mvp/public/index.html",
  "03_mvp/public/taches.html",
  "03_mvp/server.js",
  "03_mvp/src/routes/cockpit.js"
)
foreach ($f in $files) {
  Write-Host "  - $f : keep HEAD"
  # Strip conflict markers (keep HEAD section)
  $content = Get-Content $f -Raw -Encoding UTF8
  $lines = $content -split "`n"
  $out = @()
  $mode = "normal"
  foreach ($line in $lines) {
    if ($line.StartsWith("<<<<<<< ")) { $mode = "ours"; continue }
    if ($line.StartsWith("=======")) { $mode = "theirs"; continue }
    if ($line.StartsWith(">>>>>>> ")) { $mode = "normal"; continue }
    if ($mode -eq "ours" -or $mode -eq "normal") { $out += $line }
  }
  [System.IO.File]::WriteAllLines($f, $out, [System.Text.UTF8Encoding]::new($false))
  git add $f
}

Write-Host "[4/6] Patch system.js : threshold toujours present" -Fore Cyan
$sysFile = "03_mvp/src/routes/system.js"
$sys = Get-Content $sysFile -Raw -Encoding UTF8
$old1 = @"
  const summaryPath = opts.summaryPath || SUMMARY_PATH;
  if (!fs.existsSync(summaryPath)) {
    return {
      ok: false,
      source: 'emails-summary.json',
      reason: 'fichier absent',
      lastSyncAt: null,
      lastSyncAgeMin: null,
      level: 'critical',
    };
  }
"@
$new1 = @"
  const summaryPath = opts.summaryPath || SUMMARY_PATH;
  const threshold = {
    warn_min: THRESHOLD_WARN_MIN,
    critical_min: THRESHOLD_CRITICAL_MIN,
  };
  if (!fs.existsSync(summaryPath)) {
    return {
      ok: false,
      source: 'emails-summary.json',
      reason: 'fichier absent',
      lastSyncAt: null,
      lastSyncAgeMin: null,
      level: 'critical',
      threshold,
    };
  }
"@
$old2 = @"
  return {
    ok: level === 'ok',
    source: 'emails-summary.json',
    summaryPath,
    lastSyncAt: mtime.toISOString(),
    lastSyncAgeMin: ageMin,
    level,
    threshold: {
      warn_min: THRESHOLD_WARN_MIN,
      critical_min: THRESHOLD_CRITICAL_MIN,
    },
  };
"@
$new2 = @"
  return {
    ok: level === 'ok',
    source: 'emails-summary.json',
    summaryPath,
    lastSyncAt: mtime.toISOString(),
    lastSyncAgeMin: ageMin,
    level,
    threshold,
  };
"@
$sys = $sys.Replace($old1, $new1).Replace($old2, $new2)
[System.IO.File]::WriteAllText($sysFile, $sys, [System.Text.UTF8Encoding]::new($false))
git add $sysFile

Write-Host "[5/6] Tests npm" -Fore Cyan
Push-Location 03_mvp
npm test
$testExit = $LASTEXITCODE
Pop-Location
if ($testExit -ne 0) {
  Write-Host "[KO] tests fail. Verifier avant commit." -Fore Red
  exit 1
}

Write-Host "[6/6] Commit + push" -Fore Cyan
git commit -m "Merge main into docs/sprint-s3-kickoff (resolution conflits S2/S3)

6 fichiers en conflit tous resolus keep HEAD (superset main + ajouts S3) :
- 00_BOUSSOLE/DECISIONS.md
- 03_mvp/docs/API.md
- 03_mvp/public/index.html
- 03_mvp/public/taches.html
- 03_mvp/server.js
- 03_mvp/src/routes/cockpit.js

Fix bonus : src/routes/system.js threshold toujours present (resilience clean-room).

Tests : 75/75 verts post-merge."
git push origin docs/sprint-s3-kickoff

Write-Host "`n=== MERGE RESOLU ET POUSSE ===" -Fore Green
Write-Host "Tu peux maintenant lancer : gh pr merge 112 --merge" -Fore Cyan
