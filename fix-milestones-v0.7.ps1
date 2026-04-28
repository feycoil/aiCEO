# fix-milestones-v0.7.ps1 — Synchronise GitHub milestones avec ROADMAP v3.3
# Usage : pwsh -File fix-milestones-v0.7.ps1 [-Apply]
#
# Effectue les actions suivantes :
#   1. Régénère consistence-dump.json (état actuel GitHub)
#   2. Audite les milestones v0.6 ouvertes vs ce qui a été livré (S6.4)
#   3. Propose : close S6.4, créer milestone v0.7, créer sprints S6.5/S6.6/S6.7
#   4. Crée les issues détaillées v0.7 (17 livrables CR-GAP)
#
# Sans -Apply : DRY-RUN (juste rapport)
# Avec -Apply : exécute toutes les modifications GitHub

param(
    [switch]$Apply
)

$ErrorActionPreference = "Stop"
Set-Location "C:\_workarea_local\aiCEO"

Write-Host "=== Sync GitHub milestones ROADMAP v3.3 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Refresh consistence dump
Write-Host "[1/4] Refresh consistence-dump.json" -ForegroundColor Yellow
pwsh -File consistence-dump.ps1
Write-Host ""

# 2. Audit
Write-Host "[2/4] Audit milestones v0.6 ouvertes" -ForegroundColor Yellow
$dump = Get-Content consistence-dump.json | ConvertFrom-Json
$v06Milestones = $dump.milestones | Where-Object { $_.title -like "v0.6*" -or $_.title -like "*S6.*" }
foreach ($m in $v06Milestones) {
    Write-Host "  #$($m.number) | $($m.title) | open: $($m.open) | closed: $($m.closed) | $($m.state)"
}
Write-Host ""

# 3. Issues ouvertes par sprint
Write-Host "[3/4] Issues ouvertes par sprint" -ForegroundColor Yellow
$openIssues = $dump.issues | Where-Object {
    $_.state -eq "open" -and $_.milestone -and ($_.milestone.title -like "v0.6*" -or $_.milestone.title -like "*S6.*")
}
$grouped = $openIssues | Group-Object { $_.milestone.title }
foreach ($g in $grouped) {
    Write-Host "  Milestone: $($g.Name) ($($g.Count) issues ouvertes)"
    foreach ($i in $g.Group) {
        Write-Host "    #$($i.number) $($i.title.Substring(0, [Math]::Min(70, $i.title.Length)))"
    }
}
Write-Host ""

# 4. Plan d'action
Write-Host "[4/4] Plan d'action ROADMAP v3.3" -ForegroundColor Yellow
$actions = @(
    "A. Closer milestones livrés : v0.6-s6.1 (DS atomic), v0.6-s6.2 (Phase A), v0.6-s6.3 (tests), v0.6-s6.4 (câblage réel)",
    "B. Closer issues livrées dans ces sprints (audit fin requis post-recette)",
    "C. Créer milestone v0.7 'LLM + Outlook events + finalisation gaps'",
    "D. Créer milestones S6.5 (LLM 4 surfaces), S6.6 (events + reportee), S6.7 (FK + 3 pages preview)",
    "E. Créer 17 issues détaillées v0.7 (cf. 04_docs/08-roadmap.md §3.4)"
)
foreach ($a in $actions) {
    Write-Host "  $a"
}

if (-not $Apply) {
    Write-Host ""
    Write-Host "DRY-RUN terminé. Relancez avec -Apply pour exécuter." -ForegroundColor Magenta
    exit 0
}

# === MODE APPLY ===
Write-Host ""
Write-Host "=== APPLY ACTIONS ===" -ForegroundColor Red

# Créer milestone v0.7
Write-Host "Création milestone v0.7..."
gh api repos/feycoil/aiCEO/milestones -f title="v0.7" `
  -f description="LLM Anthropic + sync events Outlook + finalisation gaps CR-GAP-v06-cablage. 3 sessions binôme S6.5/S6.6/S6.7. ~5 k€ absorbés provision V1." `
  -f state="open" 2>$null
Write-Host "    OK"

# Créer sprints S6.5, S6.6, S6.7
foreach ($s in @("S6.5", "S6.6", "S6.7")) {
    $titles = @{
        "S6.5" = "v0.7-s6.5 - LLM 4 surfaces UX"
        "S6.6" = "v0.7-s6.6 - Outlook events + status decision reportee"
        "S6.7" = "v0.7-s6.7 - FK emails-projects + 3 pages preview + tag v0.7"
    }
    $descs = @{
        "S6.5" = "LLM Anthropic câblé sur coaching banner arbitrage + decision-recommend + auto-draft-review + Si vous tranchez A. ~4h binôme."
        "S6.6" = "Sync events Outlook (calendrier 30j) + page agenda peuplée + status decision reportee migration + bind-arbitrage-board v2 persistant. ~4h binôme."
        "S6.7" = "FK emails->projects + UI rattachement + 3 pages preview câblées (assistant SSE, connaissance, coaching) + archivage emails-context.js legacy + recette + tag v0.7. ~4h binôme."
    }
    Write-Host "Création milestone $($titles[$s])..."
    gh api repos/feycoil/aiCEO/milestones -f title="$($titles[$s])" -f description="$($descs[$s])" -f state="open" 2>$null
    Write-Host "    OK"
}

# Créer 17 issues détaillées v0.7 (cf. 08-roadmap.md §3.4)
Write-Host ""
Write-Host "Création 17 issues v0.7..."

$issues = @(
    @{ sprint="S6.5"; title="v0.7.01 LLM /api/assistant/messages câblé chat live (assistant.html)"; body="Brancher SSE chunk-by-chunk frontend sur la route serveur déjà prête." },
    @{ sprint="S6.5"; title="v0.7.02 LLM /api/assistant/decision-recommend sur cards arbitrage focus"; body="Affiche raison + impact + recommandation A/B/C par décision." },
    @{ sprint="S6.5"; title="v0.7.03 LLM /api/assistant/auto-draft-review sur bouton Démarrer revue"; body="Génère intention + bilan + cap pré-remplis selon historique semaine." },
    @{ sprint="S6.5"; title="v0.7.04 LLM coaching banner arbitrage (/coaching-question)"; body="Question stratégique contextualisée selon historique décisions." },
    @{ sprint="S6.5"; title="v0.7.05 Validation ANTHROPIC_API_KEY prod + monitoring tokens"; body="Variable env documentée + dashboard /api/system/health enrichi avec budget tokens." },
    @{ sprint="S6.6"; title="v0.7.06 Script fetch-outlook-events.ps1 (calendrier Outlook 30j)"; body="Pendant fetch-outlook.ps1 mais sur olFolderCalendar(9). Read-only." },
    @{ sprint="S6.6"; title="v0.7.07 Migration 2026-05-XX-events-extend.sql + scripts/normalize-events.js"; body="Ingestion table events depuis JSON calendrier produit par fetch-outlook-events." },
    @{ sprint="S6.6"; title="v0.7.08 Page agenda.html peuplée + bind-agenda.js v2"; body="Grille hebdo lun-dim drag-drop tâche -> date. Click event -> drawer détail." },
    @{ sprint="S6.6"; title="v0.7.09 Migration status decision reportee (CHECK constraint)"; body="ALTER TABLE decisions check status IN (...,reportee). Tests sandbox avant prod." },
    @{ sprint="S6.6"; title="v0.7.10 bind-arbitrage-board.js v2 : status reportee persistant"; body="Drop sur col Reporté -> PATCH status=reportee. Plus de sessionStorage volatile." },
    @{ sprint="S6.7"; title="v0.7.11 Migration 2026-05-XX-emails-fk-projects.sql"; body="Ajout emails.project_id FK projects(id) ON DELETE SET NULL." },
    @{ sprint="S6.7"; title="v0.7.12 Endpoint POST /api/emails/:id/link-project + suggestion auto"; body="UI rattachement manuel + heuristique inferred_project -> slug projet existant." },
    @{ sprint="S6.7"; title="v0.7.13 UI rattachement projet sur file arbitrage emails (dropdown projets)"; body="Dans bind-arbitrage-queue.js, ajouter select projets dans la card proposition." },
    @{ sprint="S6.7"; title="v0.7.14 Page connaissance.html câblée : épinglage decisions/critères"; body="Nouvelle table knowledge_pins. Boutons épingler sur decisions + critères répétés." },
    @{ sprint="S6.7"; title="v0.7.15 Page coaching.html câblée : sessions hebdo dimanche soir"; body="Lecture evening_sessions + LLM Opus optionnel. Génération question stratégique semaine." },
    @{ sprint="S6.7"; title="v0.7.16 Archivage src/emails-context.js legacy"; body="Supprimer fichier non utilisé + tag git si rien ne casse en sandbox + Windows." },
    @{ sprint="S6.7"; title="v0.7.17 Tests Playwright >= 95 verts + tests LLM mock + recette + tag v0.7"; body="Tests offline (mock LLM) + dogfood Feycoil 14j + tag v0.7 + GitHub Release." }
)

foreach ($i in $issues) {
    Write-Host "  $($i.title)"
    if ($Apply) {
        gh issue create --repo feycoil/aiCEO --title "$($i.title)" --body "$($i.body)" --milestone "v0.7-$($i.sprint.ToLower())" 2>$null
    }
}

Write-Host ""
Write-Host "=== Sync GitHub terminé ===" -ForegroundColor Green
Write-Host "Vérifier sur https://github.com/feycoil/aiCEO/milestones" -ForegroundColor Cyan
