# ============================================================================
# gh-create-issues-s5.ps1 — Creation des 8 issues Sprint S5
# ============================================================================
#  Sprint : v0.5-s5 (Cutover production = tests E2E + recette ExCom + tag v0.5 final)
#  Demarrage : 26/04/2026 immediat (vélocité S1+S2+S3+S4 = 4 sprints en ~12 h cumulees)
#  Tag cible : v0.5 (pas v0.5-s5 — c'est le tag final de la phase v0.5 internalisee)
#  Charge : 6,5 j-dev / 20 j capacite = 67 % marge
#  Source : 04_docs/DOSSIER-SPRINT-S5.md
# ============================================================================

$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==> Repo cible    : $repo"      -ForegroundColor Cyan
Write-Host "==> Sprint        : S5 (v0.5-s5, tag cible v0.5)" -ForegroundColor Cyan
Write-Host "==> Demarrage     : 26/04/2026 immediat" -ForegroundColor Cyan
Write-Host ""

& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERREUR : gh auth status KO. Lance gh auth login avant." -ForegroundColor Red
  exit 1
}

Write-Host "==> Verification milestone v0.5-s5..." -ForegroundColor Cyan
$ms = gh api "repos/$repo/milestones?state=all" | ConvertFrom-Json
$s5 = $ms | Where-Object { $_.title -eq "v0.5-s5" }
if (-not $s5) {
  Write-Host "   Milestone v0.5-s5 ABSENT. Creation..." -ForegroundColor Yellow
  $created = gh api "repos/$repo/milestones" --method POST `
    -f title="v0.5-s5" `
    -f description="Sprint S5 - cutover production (E2E + recette ExCom + tag v0.5 final)" `
    -f due_on="2026-04-30T18:00:00Z" | ConvertFrom-Json
  Write-Host "   Milestone v0.5-s5 cree (number=$($created.number))." -ForegroundColor Green
} else {
  Write-Host "   Milestone v0.5-s5 trouve (number=$($s5.number))." -ForegroundColor Green
}

Write-Host ""
Write-Host "==> Creation des 8 issues S5.00 -> S5.07" -ForegroundColor Cyan
Write-Host ""

$tmpDir = Join-Path $env:TEMP "aiCEO-issues-s5-$(Get-Random)"
New-Item -ItemType Directory -Path $tmpDir | Out-Null

function Create-Issue($num, $title, $labelsCsv, $milestone, $body) {
  $bodyFile = Join-Path $tmpDir "issue-$num.md"
  [System.IO.File]::WriteAllText($bodyFile, $body, [System.Text.Encoding]::UTF8)
  Write-Host "   [$num] $title" -ForegroundColor White
  & gh issue create --repo $repo `
    --title $title `
    --body-file $bodyFile `
    --label $labelsCsv `
    --milestone $milestone
  if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERREUR creation issue $num" -ForegroundColor Red
  }
}

$commonLabels = "sprint/s5,phase/v0.5-s5"

# ----------------------------------------------------------------------------
$body00 = @'
Contexte
--------
S4 a livre l'ADR `2026-04-26 - S4.00 - Methode Sprint S4 + zero localStorage rappele` sur les 6 nouvelles pages migrees.
S5 doit acter la methode finale de la phase v0.5 internalisee : 3 piliers (industrialisation tests + recette + scellement), 8 issues, tag v0.5 final.

A faire
-------
- [ ] Rediger une ADR `2026-04-26 - S5.00 - Methode Sprint S5 + zero localStorage rappele` dans `00_BOUSSOLE/DECISIONS.md`
- [ ] Contexte : 3 piliers (S5.01-03 industrialisation tests, S5.04-06 recette + scellement, S5.07 onboarding doc)
- [ ] Decision : (a) tests E2E Playwright 6 parcours canoniques, (b) recette ExCom 30 min, (c) tag v0.5 final, (d) ADR cloture phase v0.5

Source : DOSSIER-SPRINT-S5.md
Closes #YYY
'@
Create-Issue "S5.00" "[S5.00] ADR Sprint S5 + zero localStorage rappele + tag v0.5 final cible" "$commonLabels,lane/mvp,type/adr,priority/P0,owner/pmo" "v0.5-s5" $body00

# ----------------------------------------------------------------------------
$body01 = @'
Contexte
--------
S2 et S3 ont prevu Playwright mais reporte (Chromium infaisable sandbox). S5.01 industrialise enfin les 6 parcours canoniques sur Windows.

A faire
-------
- [ ] Creer `03_mvp/tests-e2e/` avec package.json + playwright.config.js
- [ ] Specs : P1 matin, P2 soir, P3 hebdo, P4 portefeuille, P5 assistant streaming, P6 install smoke
- [ ] Auto-screenshot on-failure + video retain-on-failure
- [ ] CI-ready (`npm test` depuis tests-e2e)
- [ ] README avec pre-requis + commandes
- [ ] Test specifique zero localStorage applicatif sur P1, P2, P4, P5

Criteres d'acceptation
----------------------
- 6 specs livrees, structure standard Playwright
- `npm install && npx playwright install chromium && npm test` passe
- Au moins P6 install passe 100% (smoke 12 pages + /api/health enrichi)

Charge / Owner
--------------
- 2,5 j-dev
- Owner : Dev1
'@
Create-Issue "S5.01" "[S5.01] Tests E2E Playwright industrialises (6 parcours P1-P6)" "$commonLabels,lane/tests,type/test,priority/P0,owner/dev1" "v0.5-s5" $body01

# ----------------------------------------------------------------------------
$body02 = @'
Contexte
--------
Chaque deploy local doit pouvoir etre valide en < 1 minute via un script PowerShell smoke.

A faire
-------
- [ ] Creer `03_mvp/scripts/smoke-all.ps1`
- [ ] Pre-flight : verifier que :4747 ecoute
- [ ] 12 pages frontend (HTTP 200)
- [ ] 4 routes assistant
- [ ] /api/health enrichi (verifier uptime_s + memory + counts)
- [ ] /api/system/last-sync
- [ ] 7 routes API critiques (groups, projects, contacts, decisions, tasks, cockpit, ...)
- [ ] Resume PASS/FAIL + exit 0 si OK, 1 sinon

Charge : 0,7 j-dev. Owner : Dev1.
'@
Create-Issue "S5.02" "[S5.02] Smoke test post-deploy automatique (smoke-all.ps1)" "$commonLabels,lane/infra,type/feat,priority/P0,owner/dev1" "v0.5-s5" $body02

# ----------------------------------------------------------------------------
$body03 = @'
Contexte
--------
GET /api/health actuel renvoie juste { ok, demo, model }. Insuffisant pour observer en production.

A faire
-------
- [ ] Etendre route GET /api/health dans server.js
- [ ] Ajouter : uptime_s, memory.rss_mb, memory.heap_mb
- [ ] Ajouter : db.path + db.size_kb
- [ ] Ajouter : counts.tasks/decisions/projects/contacts/conversations
- [ ] Ajouter : outlook.last_sync_min_ago + outlook.level (ok/warn/critical)
- [ ] version: "v0.5"

Criteres d'acceptation
----------------------
- curl http://localhost:4747/api/health retourne payload enrichi
- Test E2E P6 (S5.01) verifie body.uptime_s, body.memory, body.counts
'@
Create-Issue "S5.03" "[S5.03] /api/health enrichi (uptime + memory + db size + counts + outlook)" "$commonLabels,lane/mvp,type/feat,priority/P1,owner/dev1" "v0.5-s5" $body03

# ----------------------------------------------------------------------------
$body04 = @'
Contexte
--------
Apres v0.5 internalisee livree, presentation a l'ExCom pour decision GO V1.

A faire
-------
- [ ] Rediger `04_docs/RECETTE-EXCOM-v0.5.md`
- [ ] Section §0 contexte (1 min parle, pas de slide)
- [ ] Section §1 demo live 15 min (5 scenes : cockpit / arbitrage / assistant / portefeuille / revue)
- [ ] Section §2 Q&R typiques 10 min (8 questions probables + reponses preparees)
- [ ] Section §3 decision suite (3 options : GO V1 / pause / STOP, recommandation GO V1)
- [ ] Section §5 checklist preparation (12 cases avant ExCom)

Charge : 1,0 j. Owner : PMO.
'@
Create-Issue "S5.04" "[S5.04] Recette ExCom v0.5 (RECETTE-EXCOM-v0.5.md + scenario demo 30 min)" "$commonLabels,lane/docs,type/docs,priority/P0,owner/pmo" "v0.5-s5" $body04

# ----------------------------------------------------------------------------
$body05 = @'
Contexte
--------
Apres validation recette CEO 8/8 + recette ExCom OK, poser le tag final v0.5 (pas v0.5-s5 — phase complete).

A faire
-------
- [ ] Rediger `04_docs/_release-notes/v0.5.md` (synthese 5 sprints, 12 pages, ~95 tests, 110 k€)
- [ ] git tag -a v0.5 -m "v0.5 internalisee terminee - 5 sprints livres en ~16h chrono"
- [ ] git push origin v0.5
- [ ] gh release create v0.5 --notes-file 04_docs/_release-notes/v0.5.md
- [ ] gh api -X PATCH repos/feycoil/aiCEO/milestones/10 -f state=closed
'@
Create-Issue "S5.05" "[S5.05] Tag v0.5 final + GitHub Release synthese 4 sprints" "$commonLabels,lane/docs,type/docs,priority/P0,owner/pmo" "v0.5-s5" $body05

# ----------------------------------------------------------------------------
$body06 = @'
Contexte
--------
Acter formellement la fin de la phase v0.5 internalisee + ouvrir phase V1.

A faire
-------
- [ ] Rediger ADR `2026-04-26 - v0.5 internalisee terminee - bilan + ouverture phase V1` dans DECISIONS.md
- [ ] Bilan : 41 issues closes, 5 tags + 5 releases, ~95 tests, 110 k€, 150 j d'avance
- [ ] Decision : phase v0.5 close, plus de nouvelles issues sur milestone v0.5-*
- [ ] Ouverture V1 : 6 themes prioritaires (multi-tenant 80k, equipes 50k, integrations 60k, mobile 70k, backup 20k, logs 20k = 300k)
- [ ] Risques residuels v0.5 : R1 backup, R2 logs, R3 stockage local
'@
Create-Issue "S5.06" "[S5.06] ADR v0.5 internalisee terminee + ouverture phase V1" "$commonLabels,lane/docs,type/adr,priority/P0,owner/pmo" "v0.5-s5" $body06

# ----------------------------------------------------------------------------
$body07 = @'
Contexte
--------
ONBOARDING-CEO-PAIR.md actuel ne reflete pas le vecu dogfood v0.5.

A faire
-------
- [ ] Reviser `04_docs/ONBOARDING-CEO-PAIR.md`
- [ ] Section §1 install : Variante D Startup folder + raccourci Bureau + sync Outlook schtasks
- [ ] Section §2 recette : reference RECETTE-CEO-v0.5-s4.md
- [ ] Section §4 apprentissages reels : table 9+ symptomes/causes/fix
- [ ] Section §4 patterns CEO : push Git apres session, snapshot manuel hebdo
- [ ] Section §5 support continu : repo GitHub, CEO original (Major Fey)

Charge : 0,5 j. Owner : PMO.
'@
Create-Issue "S5.07" "[S5.07] ONBOARDING-CEO-PAIR.md mis a jour avec apprentissages reels v0.5" "$commonLabels,lane/docs,type/docs,priority/P1,owner/pmo" "v0.5-s5" $body07

Write-Host ""
Write-Host "==> 8 issues S5.00 -> S5.07 crees dans milestone v0.5-s5" -ForegroundColor Cyan
Write-Host "==> Verifier : gh issue list --milestone v0.5-s5" -ForegroundColor Cyan
Write-Host ""
