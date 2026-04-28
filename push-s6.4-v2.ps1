# push-s6.4-v2.ps1 — Commit + push session 28/04 PM v2
# Usage : pwsh -File push-s6.4-v2.ps1

$ErrorActionPreference = "Stop"
Set-Location "C:\_workarea_local\aiCEO"

Write-Host "=== S6.4 v2 — Onglets Logs/Releases + restauration scripts settings ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] git status" -ForegroundColor Yellow
git status --short
Write-Host ""

Write-Host "[2/4] git add ." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "[3/4] git commit" -ForegroundColor Yellow
$msg = @"
feat(s6.4-v2): onglets Logs/Releases + restauration scripts settings.html

Backend :
- GET /api/system/logs : lecture data/*.log + tail 200 lignes (aiCEO-server.log + sync-outlook.log) avec metadata (size, mtime, age, totalLines)
- GET /api/system/releases : 4 livrées (v0.5, v0.5-s4, v0.6-s6.1, v0.6-s6.4) + 4 upcoming (v0.7, V1, V2, V3) avec features detaillees

Frontend :
- Onglet "Logs" dans Réglages :
  * Bouton "Charger les logs" manuel (les fichiers peuvent être volumineux)
  * Spinner pendant fetch
  * Console dark theme avec coloration syntaxique (error rouge / warn ambre / OK vert)
  * Bandeau ambre "À quoi ça sert ?" pour aider le CEO non-tech
  * Tabs par fichier avec badges PS/Node + age
- Onglet "Releases" dans Réglages :
  * Skeleton loader animé pendant fetch (auto-load car rapide)
  * 2 sections : "Livrées" (timeline desc) + "À venir"
  * Cartes avec border-left coloré (emerald/accent/ambre)
  * Pills statut + features + ETA + effort + bloqué par

Fixes critiques :
- settings.html avait perdu 19/20 scripts (mount Windows tronqué). Restauration via Python atomic write : shell.js, bind-drawer-extras, bind-drawer-badges, bind-settings, clear-demo, modal, crud-modals, breadcrumbs, etc.
- Pattern globals theme.js renforcé : window.aiceoSettingsTab(event, target)
- Pattern onclick HTML inline injecté sur chaque tab (resiste aux handlers globaux)
- CSS pure pour settings tabs verticaux + drawer items + badges (independant de shell.js qui injectait en JS - timing fragile)

Documentation :
- CLAUDE.md §1 statut S6.4 v2 + §5 piège "Page HTML qui perd ses scripts en bas"
- 04_docs/11-roadmap-map.html : entry JOURNAL 2026-04-28 v2

Cache bumped : v=92 → v=98 (15 versions, ~428 occurrences chacune sur 18 HTML).

Risques résiduels v0.7 inchangés : LLM 4 surfaces UX preview, sync events Outlook, status decision 'reportee', FK emails->projects.
"@

git commit -m $msg
Write-Host "    OK : commit créé"
Write-Host ""

Write-Host "[4/4] git push origin main" -ForegroundColor Yellow
git push origin main
Write-Host "    OK : push effectué"
Write-Host ""

Write-Host "=== S6.4 v2 livré sur main ===" -ForegroundColor Green
