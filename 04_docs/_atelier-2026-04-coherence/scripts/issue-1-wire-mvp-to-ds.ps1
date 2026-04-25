# ============================================================================
#  issue-1-wire-mvp-to-ds.ps1 — Sprint 1 v0.5 · Issue 1 ds/wire-mvp-to-ds
# ============================================================================
#  Exécute :
#    (1) branche ds/wire-mvp-to-ds depuis main
#    (2) Volet A · copie 12 polices DS vers 03_mvp/public/assets/fonts/
#    (3) Commit Volet A (fonts)
#    (4) Commit Volet B (link CSS) — Les edits HTML sont faits séparément par
#        Claude via Edit, donc ce script commite juste ce qui est staged
#    (5) Commit Volet C (migration vars)
#
#  Usage : depuis C:\_workarea_local\aiCEO
#    pwsh -File .\04_docs\_atelier-2026-04-coherence\scripts\issue-1-wire-mvp-to-ds.ps1
#
#  Important : ce script doit être lancé APRÈS que Claude ait fini les Edit
#  sur index.html et evening.html (volets B + C). Si tu le lances avant, les
#  commits B et C seront vides.
# ============================================================================

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Item .).FullName
if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
  Write-Host "ERREUR : lance depuis la racine du repo aiCEO (pas de .git ici)" -ForegroundColor Red
  exit 1
}

# --- 0. Check propre ---------------------------------------------------------
$statusProbe = & git status --porcelain
if ($statusProbe) {
  Write-Host "ATTENTION : working tree pas propre." -ForegroundColor Yellow
  Write-Host "Fichiers modifiés :" -ForegroundColor Yellow
  & git status --short
  Write-Host ""
  Write-Host "Continue ? (O/n) " -NoNewline -ForegroundColor Yellow
  $r = Read-Host
  if ($r -and $r -ne "O" -and $r -ne "o") { exit 1 }
}

# --- 1. Branche --------------------------------------------------------------
Write-Host ""
Write-Host "==> (1) Branche ds/wire-mvp-to-ds" -ForegroundColor Cyan
& git checkout main
& git pull origin main
$existing = & git branch --list "ds/wire-mvp-to-ds"
if ($existing) {
  Write-Host "   branche existante détectée — checkout" -ForegroundColor DarkGray
  & git checkout ds/wire-mvp-to-ds
} else {
  & git checkout -b ds/wire-mvp-to-ds
}

# --- 2. Volet A · copie des 12 polices ---------------------------------------
Write-Host ""
Write-Host "==> (2) Volet A · copie des 12 polices vers 03_mvp/public/assets/fonts/" -ForegroundColor Cyan
$srcDir = Join-Path $repoRoot "02_design-system\fonts"
$dstDir = Join-Path $repoRoot "03_mvp\public\assets\fonts"
New-Item -ItemType Directory -Force -Path $dstDir | Out-Null

$fontFiles = @(
  "FiraSans-Thin.otf"
  "FiraSans-ExtraLight.otf"
  "FiraSans-Light.otf"
  "FiraSans-Regular.otf"
  "FiraSans-Book.otf"
  "FiraSans-Medium.otf"
  "FiraSans-SemiBold.otf"
  "FiraSans-Bold.otf"
  "FiraSans-ExtraBold.otf"
  "FiraSans-Heavy.otf"
  "Aubrielle_Demo.ttf"
  "SolThin.otf"
)
foreach ($f in $fontFiles) {
  $src = Join-Path $srcDir $f
  $dst = Join-Path $dstDir $f
  if (-not (Test-Path $src)) {
    Write-Host "   MANQUE : $src" -ForegroundColor Red
    exit 1
  }
  Copy-Item -Path $src -Destination $dst -Force
  Write-Host "   ✓ $f" -ForegroundColor DarkGreen
}
$count = (Get-ChildItem $dstDir -File | Measure-Object).Count
Write-Host "   total : $count fichiers dans 03_mvp/public/assets/fonts/" -ForegroundColor Green

# --- 3. Commit Volet A -------------------------------------------------------
Write-Host ""
Write-Host "==> (3) Commit Volet A" -ForegroundColor Cyan
& git add 03_mvp/public/assets/fonts/
$stagedA = & git diff --cached --name-only
if ($stagedA) {
  & git commit -m "design(ds): Volet A · déployer 12 polices self-hosted dans 03_mvp" `
                -m "Copie depuis 02_design-system/fonts/ :" `
                -m "- 10 Fira Sans (Thin → Heavy)" `
                -m "- Aubrielle_Demo.ttf (script accent)" `
                -m "- SolThin.otf (ultra-light numerals)" `
                -m "" `
                -m "Supprime les 12 × 404 @font-face au chargement de colors_and_type.css." `
                -m "Part de Issue 1 · ds/wire-mvp-to-ds · Volet A."
} else {
  Write-Host "   rien à committer pour Volet A (déjà fait ?)" -ForegroundColor DarkGray
}

# --- 4. Commit Volet B + Volet C (HTML edits faits par Claude) ---------------
Write-Host ""
Write-Host "==> (4) Commit Volet B + C (index.html + evening.html)" -ForegroundColor Cyan
& git add 03_mvp/public/index.html 03_mvp/public/evening.html
$stagedBC = & git diff --cached --name-only
if ($stagedBC) {
  & git commit -m "design(ds): Volets B+C · câbler colors_and_type.css et migrer palette inline vers tokens DS" `
                -m "Volet B — câblage CSS externe :" `
                -m "- index.html et evening.html : ajoute <link rel=stylesheet href=/assets/colors_and_type.css> avant <style>" `
                -m "" `
                -m "Volet C — migration des variables inline vers les tokens DS :" `
                -m "- Supprime le bloc :root inline (17 vars locales)" `
                -m "- Substitutions : --cream→--surface, --ink→--text, --line→--border, --lilac→--violet, --coral→--rose, --sage→--emerald, --sage-ac→--emerald-800" `
                -m "- Polices : retire fallback Cambria/Georgia/serif, utilise var(--font-sans)" `
                -m "- Couleurs hardcodées (#5f4a94, #7a5a10, #a63b2b, #2a5c82) migrées vers var(--violet-800/amber-800/rose-800/sky-800)" `
                -m "" `
                -m "Note : --sage (pastel MVP #A8C8A4) migre vers --emerald (vert sapin DS #3d7363)." `
                -m "Décision prise en sprint — cohérence DS prioritaire sur identité visuelle existante." `
                -m "Si régression visuelle jugée trop violente sur la page 'Faire', ouvrir sous-issue 'token reconciliation'." `
                -m "" `
                -m "Part de Issue 1 · ds/wire-mvp-to-ds · Volets B + C."
} else {
  Write-Host "   rien à committer pour Volets B+C (Claude n'a peut-être pas fini les Edit ?)" -ForegroundColor Yellow
}

# --- 5. Récap et push --------------------------------------------------------
Write-Host ""
Write-Host "==> Récap branche ds/wire-mvp-to-ds" -ForegroundColor Cyan
& git log --oneline main..HEAD
Write-Host ""
Write-Host "Push sur origin ? (O/n) " -NoNewline -ForegroundColor Yellow
$r = Read-Host
if (-not $r -or $r -eq "O" -or $r -eq "o") {
  & git push -u origin ds/wire-mvp-to-ds
  Write-Host ""
  Write-Host "==> Ouvre la PR : https://github.com/feycoil/aiCEO/compare/ds/wire-mvp-to-ds?expand=1" -ForegroundColor Green
} else {
  Write-Host "Push différé. Quand prêt : git push -u origin ds/wire-mvp-to-ds" -ForegroundColor DarkGray
}
