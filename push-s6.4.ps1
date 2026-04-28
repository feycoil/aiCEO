# push-s6.4.ps1 — Workflow de commit + push S6.4 (Câblage v0.6 réel)
# Usage : pwsh -File push-s6.4.ps1
#
# Étapes :
#   1. git status (vérification)
#   2. git add . (tous les changements de la session)
#   3. git commit -m "feat(s6.4): câblage v0.6 réel + ingestion emails SQLite + bootstrap"
#   4. git push origin main

$ErrorActionPreference = "Stop"
Set-Location "C:\_workarea_local\aiCEO"

Write-Host "=== Sprint S6.4 — Câblage v0.6 réel ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] git status" -ForegroundColor Yellow
git status --short
Write-Host ""

Write-Host "[2/4] git add ." -ForegroundColor Yellow
git add .
Write-Host "    OK : changements stagés"
Write-Host ""

Write-Host "[3/4] git commit" -ForegroundColor Yellow
$msg = @"
feat(s6.4): câblage v0.6 réel + ingestion emails SQLite + bootstrap

Backend :
- Migration data/migrations/2026-04-28-emails.sql (table emails, 15 cols, 6 idx)
- normalize-emails.js patché : ingestion SQLite après production JSON
- ingest-emails.js (rattrapage) + bootstrap-from-emails.js (auto projets+contacts)
- POST /api/arbitrage/analyze-emails réécrit SQL (scoring flagged*100 + unread*30 + recence)
- POST /api/arbitrage/bootstrap-from-emails (idempotent)

Frontend (13/17 pages câblées API) :
- bind-cockpit.js : KPIs + Cap stratégique dynamique + dot-chart 7j + Top3
- bind-arbitrage-(queue v3, focus v3, board v1) : file emails + focus mode + kanban drag-drop SQL
- bind-projets.js v4 : auto-status alerte/à-surveiller/sain
- bind-equipe.js v4 : avatars uniformes + recence
- bind-decisions.js v4, bind-taches.js v5, bind-revues.js v4
- theme.js : globals window.aiceoArb* (onclick inline, résiste aux handlers globaux)
- tweaks.css : 5 blocs UX (drawer harmonisation, tags compacts, hero rebalance, arbitrage demo masquage radical, final UX)

Pages preview annoncées : assistant (v0.7), connaissance (v0.7), coaching (v0.8) — banners ambres.

Documentation :
- 00_BOUSSOLE/DECISIONS.md : ADR 2026-04-28 Câblage v0.6 réel S6.4
- 04_docs/CR-GAP-v06-cablage.md : audit complet backend ↔ frontend (gap LLM, events Outlook, status reportee, FK emails→projects)
- 04_docs/_release-notes/v0.6-s6.4-cablage.md : synthèse session
- 04_docs/11-roadmap-map.html : JOURNAL[] 2026-04-28 livraison + décision sprint v0.7
- CLAUDE.md : §1 statut + §3 architecture maj

Cache bumped v=77 → v=92 (15 versions, 449 occurrences chacune sur 18 HTML).

Risques résiduels v0.7 :
- R1 LLM 4 surfaces UX preview (coaching, decision-recommend, auto-draft, si tranchez A)
- R2 sync events Outlook manquante (calendrier non lu)
- R3 status decision sans 'reportee' (kanban col Reporté volatile sessionStorage)
- R4 scoring kindFor classe trop en task (ratio à monitorer)
- R5 emails sans FK vers projects/contacts

Méthode : binôme CEO+Claude, ~12 itérations / ~4h, ~30 fichiers, ~2000 lignes JS + ~250 CSS.
~5 troncatures mount Windows restaurées via Python atomic write.
"@

git commit -m $msg
Write-Host "    OK : commit créé"
Write-Host ""

Write-Host "[4/4] git push origin main" -ForegroundColor Yellow
git push origin main
Write-Host "    OK : push effectué"
Write-Host ""

Write-Host "=== Sprint S6.4 livré sur main ===" -ForegroundColor Green
Write-Host "Suite : recette CEO (Ctrl+Shift+R sur 13 pages) puis tag v0.6-s6.4 si OK." -ForegroundColor Cyan
