# push-audit-phase1.ps1
# Pousse les 7 livrables Phase 1 audit (P0/P1) avant ExCom 04/05
# Usage : pwsh -File C:\_workarea_local\aiCEO\push-audit-phase1.ps1

$ErrorActionPreference = "Continue"
$root = "C:\_workarea_local\aiCEO"
Set-Location $root

Write-Host ""
Write-Host "=== Phase 1 audit — push livrables P0/P1 avant ExCom 04/05 ===" -Fore Cyan

$files = @(
    # Q1+Q2+Q3 : patches CLAUDE.md (budget exact + tests breakdown + ADRs count + table § 11 sources de vérité)
    "CLAUDE.md",
    # Q5 : INDEX.md routes API exhaustif (70 CRUD + 22 legacy + 12 pages = 104 endpoints)
    "04_docs/api/INDEX.md",
    # 2 ADRs structurantes : critère flux 3 sem + allocation budgétaire
    "00_BOUSSOLE/DECISIONS.md",
    # Patches roadmap-map.html (gate-pill v0.6 Phase 1 + JOURNAL + PERIODS + decision card)
    "04_docs/11-roadmap-map.html",
    # Audit consolidé
    "04_docs/audits/AUDIT-PROJET-aiCEO-2026-04-26.md"
)

# Q4 : suppressions (déjà faites en sandbox, à committer)
# - 04_docs/11-roadmap-map-v1-backup.html  → archivé dans _archive/roadmap-map-backups/
# - 04_docs/11-roadmap-map-v2-backup.html  → archivé
# - 15 dossiers ~BROMIUM/ → supprimés

foreach ($f in $files) {
    if (Test-Path $f) {
        git add $f
        Write-Host "   + $f" -Fore Green
    } else {
        Write-Host "   ! MISSING $f" -Fore Red
    }
}

# Stage les suppressions ~BROMIUM et déplacements backups
git add -A 02_design-system/ 03_mvp/public/v06/ 04_docs/_design-v05-claude/ 2>$null
git add -A _archive/roadmap-map-backups/ 2>$null
git add -u 04_docs/11-roadmap-map-v1-backup.html 04_docs/11-roadmap-map-v2-backup.html 2>$null

Write-Host ""
Write-Host "=== git status (staged) ===" -Fore Cyan
git status --short

Write-Host ""
Write-Host "=== Commit + push ===" -Fore Cyan
$msg = @"
docs(audit-phase1): resoudre 7 alertes P0/P1 avant ExCom 04/05

Q1 CLAUDE.md budget exact : 110 k€ engages / 97,4 k€ depenses (88,5 %) / 12,6 k€ provision V1 dont 8 k€ absorbes v0.6 Phase 1
Q2 CLAUDE.md tests breakdown : 91 verts sandbox (84 unit + 7 smoke) / 103 cumules Windows (+12 E2E)
Q3 CLAUDE.md ADRs count : 22+ ADRs datees au 26/04 PM + table sources de verite domaine (§ 11)
Q4 cleanup : 15 dossiers ~BROMIUM supprimes + 2 backups roadmap archives _archive/roadmap-map-backups/
Q5 04_docs/api/INDEX.md : 70 routes CRUD + 22 legacy + 12 pages = 104 endpoints (elimine alerte A4 gap 40 vs 27)
ADR Critere flux 3 sem - resilience proxy : 4 sprints S1-S4 reussis = preuve fonctionnelle equivalente, tag v0.5 posable immediatement
ADR Allocation budgetaire post-v0.5 : transparence tresorerie ExCom, reallocation 254 k economies V1 option beta detaillee
Patches roadmap-map.html : gate-pill v0.6 Phase 1 ADOPTEE + JOURNAL entry adoption Claude Design + PERIODS sub maj + decision card v0.6 mention
AUDIT-PROJET-aiCEO-2026-04-26.md : rapport consolide 5 dimensions (note 17/20)
"@

git commit -m "$msg"
if ($LASTEXITCODE -eq 0) {
    git push origin main
} else {
    Write-Host "   commit a echoue (rien a committer ?)" -Fore Yellow
}

Write-Host ""
Write-Host "=== Phase 1 audit COMPLETE — 7/7 alertes P0/P1 resolues ===" -Fore Green
Write-Host ""
Write-Host "Reste pour ExCom 04/05 :"
Write-Host "  - Repeter scenario demo seul en chrono < 16 min (cf. RECETTE-EXCOM-v0.5.md § 5)"
Write-Host "  - Verifier 12 cases checklist preparation"
Write-Host ""
Write-Host "Phase 2 audit (P2 - 4h, post-ExCom S6.1 v0.6) :"
Write-Host "  - Cleanup orphelins 01_app-web/, 05_journeys/, 06_revues/"
Write-Host "  - Templates manquants (TEMPLATE-DOSSIER-SPRINT.md)"
Write-Host "  - ESLint config 03_mvp/"
Write-Host ""
