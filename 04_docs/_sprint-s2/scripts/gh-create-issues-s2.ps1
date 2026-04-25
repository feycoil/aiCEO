# ============================================================================
#  gh-create-issues-s2.ps1 — Ouvre les 10 issues GitHub du Sprint S2 (v0.5-s2)
# ============================================================================
#  Source    : 04_docs/DOSSIER-SPRINT-S2.md §3 (table 10 issues, 19,5 j-dev)
#  Pré-requis: `gh auth status` OK · droits write sur feycoil/aiCEO
#  Usage     : depuis la racine du repo :
#              pwsh -File .\04_docs\_sprint-s2\scripts\gh-create-issues-s2.ps1
#  Effet     : (1) crée/met à jour les labels sprint S2,
#              (2) s'assure que le milestone "v0.5-s2" existe,
#              (3) ouvre les 10 issues S2.01 → S2.10.
#  Idempotent: oui pour labels/milestone. Pour les issues : si tu relances
#              tu auras des doublons — vérifier sur GitHub avant de ré-exécuter.
# ============================================================================

$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

# --- Encoding : forcer UTF-8 pour les arguments passés à gh.exe -------------
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==> Repo cible    : $repo"      -ForegroundColor Cyan
Write-Host "==> Sprint        : S2 (v0.5-s2)" -ForegroundColor Cyan
Write-Host "==> Démarrage     : lundi 19/05/2026 09:00" -ForegroundColor Cyan
Write-Host "==> Démo finale   : vendredi 30/05/2026 16:00" -ForegroundColor Cyan
Write-Host "==> Tag cible     : v0.5-s2 (lundi 02/06)" -ForegroundColor Cyan
Write-Host ""

# --- 0. Auth check ----------------------------------------------------------
& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERREUR : gh auth status KO. Lance 'gh auth login' avant." -ForegroundColor Red
  exit 1
}

# --- 1. Bootstrap labels (idempotent) ---------------------------------------
Write-Host "==> Bootstrap des labels S2" -ForegroundColor Cyan
$labels = @(
  @{ name = "sprint/s2";       color = "d96d3e"; description = "Sprint S2 — v0.5-s2 (19/05 → 30/05/2026)" }
  @{ name = "phase/v0.5-s2";   color = "fdecdf"; description = "Sprint S2 fusion v0.5 — cockpit unifié + flux matin/soir + tâches" }
  @{ name = "lane/mvp";        color = "7a6a8a"; description = "MVP Express + SQLite — backend & frontend monoposte" }
  @{ name = "lane/tests";      color = "3d7363"; description = "Tests unitaires, e2e Playwright, CI GitHub Actions" }
  @{ name = "type/feature";    color = "b88237"; description = "Nouvelle fonctionnalité produit" }
  @{ name = "type/migration";  color = "8a3b1b"; description = "Migration de données / persistance" }
  @{ name = "type/spike";      color = "9a9da8"; description = "Spike technique / preuve de concept time-boxée" }
  @{ name = "type/test";       color = "3d7363"; description = "Tests automatisés (unit, e2e, integration)" }
  @{ name = "type/doc";        color = "e2ece8"; description = "Documentation technique ou utilisateur" }
  @{ name = "priority/P0";     color = "8a3b1b"; description = "Bloquant — à traiter en priorité absolue" }
  @{ name = "priority/P1";     color = "d96d3e"; description = "Priorité 1 — chemin critique S2" }
  @{ name = "priority/P2";     color = "7790ae"; description = "Priorité 2 — confort / time-box ajustable" }
  @{ name = "owner/dev1";      color = "1f4738"; description = "Owner : Dev1 binôme CEO + Claude" }
  @{ name = "owner/dev2";      color = "5b3a78"; description = "Owner : Dev2 binôme CEO + Claude" }
  @{ name = "owner/pmo";       color = "b88237"; description = "Owner : PMO (CEO côté pilotage)" }
)
foreach ($l in $labels) {
  & gh label create $l.name --repo $repo --color $l.color --description $l.description --force 2>&1 | Out-Null
  Write-Host "   label $($l.name)" -ForegroundColor DarkGray
}

# --- 2. Bootstrap milestone v0.5-s2 (idempotent) ----------------------------
Write-Host ""
Write-Host "==> Bootstrap du milestone v0.5-s2" -ForegroundColor Cyan
function Ensure-Milestone($title, $description, $dueOn) {
  $jsonText = & gh api "repos/$repo/milestones?state=all" 2>$null | Out-String
  $existing = $null
  if (-not [string]::IsNullOrWhiteSpace($jsonText)) {
    try {
      $milestones = $jsonText | ConvertFrom-Json
      $existing = $milestones | Where-Object { $_.title -eq $title } | Select-Object -First 1
    } catch {
      $existing = $null
    }
  }
  if (-not $existing) {
    & gh api "repos/$repo/milestones" `
      -f title="$title" `
      -f description="$description" `
      -f due_on="$dueOn" 2>&1 | Out-Null
    Write-Host "   milestone $title (créée, due $dueOn)" -ForegroundColor Green
  } else {
    Write-Host "   milestone $title (existe)" -ForegroundColor DarkGray
  }
}
Ensure-Milestone "v0.5-s2" "Sprint S2 fusion v0.5 — cockpit unifié + flux matin/soir + taches.html (4 pages)" "2026-06-02T16:00:00Z"

# --- 3. Création des 10 issues S2.01 → S2.10 --------------------------------
Write-Host ""
Write-Host "==> Création des 10 issues S2.01 → S2.10" -ForegroundColor Cyan
Write-Host ""

$tmpDir = Join-Path $env:TEMP "aiCEO-issues-s2-$(Get-Random)"
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
    Write-Host "      ERREUR création issue $num" -ForegroundColor Red
  }
}

$commonLabels = "sprint/s2,phase/v0.5-s2"

# ----------------------------------------------------------------------------
#  S2.01 — Backend GET /api/cockpit/today
# ----------------------------------------------------------------------------
$body01 = @"
Contexte
--------
``index.html`` (cockpit unifié) consomme aujourd'hui ``AICEO.STATE`` en ``localStorage``
et agrège les compteurs côté client. Cible S2 : tout passer côté backend pour
préparer la trajectoire cloud (ADR ``2026-04-24 · Trajectoire produit local-first → cloud``).

À faire
-------
- [ ] Créer la route ``GET /api/cockpit/today`` dans ``03_mvp/src/server.js`` (ou nouveau module ``routes/cockpit.js``)
- [ ] Réponse JSON :
    ``{ intention: string|null, bigRocks: [{id, title, progress, group}], counters: { tasks: {open, done, doing}, decisions: {open, urgent}, mails: {pending, drafts} }, alerts: [{level, title, detail}] }``
- [ ] Source des données : tables SQLite ``intentions``, ``big_rocks``, ``tasks``, ``decisions``, ``drafts`` (via ``crud()`` du db-driver)
- [ ] ``tasks.open`` = ``status = 'open' AND deleted_at IS NULL``, ``tasks.done`` = ``status = 'done' AND closed_at >= today_local()``
- [ ] ``alerts`` = règles métier : 1) si aucun arbitrage du jour à 11:00 → alerte ; 2) si > 5 décisions ``urgent`` ouvertes ; 3) si streak rompue
- [ ] Test unitaire dans ``03_mvp/tests/cockpit.test.js`` couvrant les 3 cas (intention présente, absente, alerte streak)

Critères d'acceptation
----------------------
- ``curl http://localhost:3001/api/cockpit/today`` → 200, payload conforme schéma ci-dessus
- 1 test unitaire vert dans ``03_mvp/tests/`` (compteur global passe à 24)
- Latence p95 < 80 ms en local (mesure via ``console.time``)

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev1
- Dépendances : aucune (peut démarrer mardi 20/05)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §1.1 et §3 (S2.01)
"@
Create-Issue "S2.01" "[S2.01] Backend GET /api/cockpit/today (agrégat intention + Big Rocks + compteurs + alertes)" "$commonLabels,lane/mvp,type/feature,priority/P1,owner/dev1" "v0.5-s2" $body01

# ----------------------------------------------------------------------------
#  S2.02 — Frontend index.html migré sur API + retrait localStorage
# ----------------------------------------------------------------------------
$body02 = @"
Contexte
--------
``index.html`` doit passer du modèle ``AICEO.STATE`` ``localStorage`` au modèle API
défini par S2.01. Critère de fin de sprint #2 (zéro ``localStorage`` applicatif).

À faire
-------
- [ ] Remplacer tous les accès ``AICEO.STATE.*`` dans ``03_mvp/public/index.html`` par ``fetch('/api/cockpit/today')``
- [ ] Drawer source-inspector : alimenté par la même API, affiche la lignée de chaque carte
- [ ] Garder toast + streak engine en l'état (UI pure)
- [ ] Conserver ``localStorage`` pour préférences UI uniquement (mode sombre, drawer ouvert) — clé ``aiCEO.uiPrefs``
- [ ] Vérifier ``grep -r "localStorage\." 03_mvp/public/index.html`` → 0 (sauf la clé ``aiCEO.uiPrefs``)

Critères d'acceptation
----------------------
- Au refresh de la page, les compteurs viennent du backend (vérif Network DevTools : 1 fetch ``/api/cockpit/today`` en 200)
- Aucune régression visuelle (capture avant/après en pièce jointe)
- Drawer source-inspector affiche toujours la traçabilité

Charge / Owner / Dépendances
----------------------------
- Charge : 2 j-dev
- Owner  : Dev2
- Dépendances : **S2.01** (l'API doit être livrée d'abord)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §1.1 et §3 (S2.02)
"@
Create-Issue "S2.02" "[S2.02] Frontend index.html migré sur /api/cockpit/today + retrait localStorage" "$commonLabels,lane/mvp,type/feature,priority/P1,owner/dev2" "v0.5-s2" $body02

# ----------------------------------------------------------------------------
#  S2.03 — Frontend arbitrage.html migré + drag & drop natif
# ----------------------------------------------------------------------------
$body03 = @"
Contexte
--------
Le flux matin (``arbitrage.html``) du MVP S1 fonctionne déjà avec les endpoints
``/api/arbitrage/*`` mais le drag & drop est partiellement délégué à une lib externe.
Cible S2 : drag & drop **natif HTML5** (zéro lib), 3 colonnes (Top 3 / Déléguer / Différer + Rejeter).

À faire
-------
- [ ] Confirmer endpoints S1 : ``POST /api/arbitrage/start``, ``POST /api/arbitrage/commit``, ``GET /api/arbitrage/today``, ``GET /api/arbitrage/history``
- [ ] UI 3 colonnes en ``<div role="list" draggable="true">`` natif (events ``dragstart``, ``dragover``, ``drop``)
- [ ] Validation finale (``commit``) émet en cascade les tâches/délégations vers ``tasks`` et ``drafts``
- [ ] Bouton « rejouer démo » désactivé en prod via feature flag ``settings.demoMode`` (default false)
- [ ] A11y : aria-grabbed/aria-dropeffect, support clavier (flèches + Espace pour grab/drop)

Critères d'acceptation
----------------------
- 3 sessions consécutives ``start → commit`` sans erreur (critère de fin de sprint #3)
- Drag & drop fonctionne dans Chrome + Edge Windows, support clavier OK
- Tâches arbitrées remontent dans ``GET /api/tasks?status=open``

Charge / Owner / Dépendances
----------------------------
- Charge : 3 j-dev
- Owner  : Dev1
- Dépendances : aucune (peut démarrer mardi 20/05 en parallèle de S2.01)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §1.2 et §3 (S2.03), §5.2 risque drag & drop
"@
Create-Issue "S2.03" "[S2.03] Frontend arbitrage.html migré sur /api/arbitrage/* + drag & drop natif HTML5" "$commonLabels,lane/mvp,type/feature,priority/P1,owner/dev1" "v0.5-s2" $body03

# ----------------------------------------------------------------------------
#  S2.04 — Frontend evening.html + streak engine backend
# ----------------------------------------------------------------------------
$body04 = @"
Contexte
--------
Le flux soir (``evening.html``) du MVP S1 écrit en JSON files. Cible S2 : persistance
SQLite via ``POST /api/evening/*`` + streak engine côté backend (fini le compteur ``localStorage``).

À faire
-------
- [ ] Créer/confirmer endpoints : ``POST /api/evening/start``, ``POST /api/evening/commit``, ``GET /api/evening/today``
- [ ] Persistance table ``evening_sessions`` (déjà créée en S1)
- [ ] Streak engine côté backend : table ``streaks (id, type, current_count, last_increment_at, longest)`` ; trigger sur ``evening commit``
- [ ] Frontend : récap des 3 Big Rocks, humeur 5 emojis, top 3 demain, lien vers session arbitrage J+1
- [ ] Test unitaire streak : 3 evenings consécutifs → ``streak.current_count = 3``, 1 jour manqué → reset

Critères d'acceptation
----------------------
- 3 evenings consécutifs sur 3 jours, top 3 demain reporté en arbitrage J+1 (critère de fin de sprint #4)
- ``GET /api/streaks/evening`` retourne le compteur courant
- Aucun ``localStorage`` applicatif sur ``evening.html`` (critère #2)

Charge / Owner / Dépendances
----------------------------
- Charge : 2 j-dev
- Owner  : Dev2
- Dépendances : aucune (démarrage lun 26/05 après S2.02)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §1.3 et §3 (S2.04), §5.4 risque streak
"@
Create-Issue "S2.04" "[S2.04] Frontend evening.html migré sur /api/evening/* + streak engine backend" "$commonLabels,lane/mvp,type/feature,priority/P1,owner/dev2" "v0.5-s2" $body04

# ----------------------------------------------------------------------------
#  S2.05 — Frontend taches.html + Eisenhower
# ----------------------------------------------------------------------------
$body05 = @"
Contexte
--------
**Page absorbée depuis S3 vers S2** (ADR scope élargi 25/04). Aujourd'hui : CRUD ``localStorage`` +
matrice Eisenhower 2×2 + quick-add inline. Cible S2 : tout sur API SQLite + drag entre quadrants.

À faire
-------
- [ ] Confirmer endpoints S1 ``GET/POST/PATCH/DELETE /api/tasks`` + ``POST /api/tasks/:id/toggle`` + ``POST /api/tasks/:id/defer``
- [ ] Frontend : page consomme l'API, retire tous les ``AICEO.STATE.tasks``
- [ ] Matrice Eisenhower 2×2 (urgent × important) avec drag & drop entre quadrants → ``PATCH /api/tasks/:id { eisenhower: 'q1' | 'q2' | 'q3' | 'q4' }``
- [ ] Filtres : par projet, par statut (open/done), par quadrant
- [ ] Quick-add inline conservé (``POST /api/tasks``)

Critères d'acceptation
----------------------
- CRUD complet via API (critère de fin de sprint #5) : toggle, defer, delete persistés SQLite
- Drag entre quadrants → patch backend OK (critère #6)
- Filtres opérationnels, quick-add inline OK

Charge / Owner / Dépendances
----------------------------
- Charge : 3 j-dev
- Owner  : Dev2
- Dépendances : **S2.06** (la migration des tâches doit être faite avant l'UI)

⚠ **Plan B mid-sprint** : si dérive ≥ 1 j cumulée vendredi 23/05, cette issue est re-décalée en S3
(annonce mid-sprint check ExCom mer 28/05). Backlog S2 retombe à 16,5 j-dev sur 3 pages.

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §1.4 et §3 (S2.05), ADR DECISIONS.md « Sprint S2 — périmètre élargi »
"@
Create-Issue "S2.05" "[S2.05] Frontend taches.html migré sur /api/tasks/* + matrice Eisenhower 2x2" "$commonLabels,lane/mvp,type/feature,priority/P1,owner/dev2" "v0.5-s2" $body05

# ----------------------------------------------------------------------------
#  S2.06 — migrate-from-appweb.js
# ----------------------------------------------------------------------------
$body06 = @"
Contexte
--------
La migration ``app-web → MVP`` est partielle : seuls groupes / projets / events sont migrés en S1.
Pour S2, il faut compléter les **tâches**, **décisions** et **contacts** depuis ``data.js``.

À faire
-------
- [ ] Compléter ``03_mvp/scripts/migrate-from-appweb.js`` :
  - parser ``aiCEO_Agent/assets/data.js`` (28 tâches / 10 décisions / 25 contacts)
  - transformer en lignes SQLite (champs FK, dates ISO 8601, JSON serialized)
  - upsert idempotent (si l'ID existe : update sinon insert)
- [ ] Créer ``03_mvp/scripts/check-migration.js`` :
  - compter chaque table vs source de vérité ``data.js``
  - sortie console verte si tout match, rouge sinon
- [ ] Documenter dans ``03_mvp/README.md`` la procédure : ``npm run migrate:appweb && npm run check:migration``

Critères d'acceptation
----------------------
- ``npm run migrate:appweb`` : zéro perte (critère de fin de sprint #7)
- ``npm run check:migration`` : 100 % match
- Idempotent (relancer 2× donne le même résultat)

Charge / Owner / Dépendances
----------------------------
- Charge : 1,5 j-dev
- Owner  : Dev1
- Dépendances : aucune (démarrage mer 21/05)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §3 (S2.06), §5.3 risque divergence shapes
"@
Create-Issue "S2.06" "[S2.06] Finaliser migrate-from-appweb.js (taches + décisions + contacts) + check-migration.js" "$commonLabels,lane/mvp,type/migration,priority/P1,owner/dev1" "v0.5-s2" $body06

# ----------------------------------------------------------------------------
#  S2.07 — Tests Playwright e2e
# ----------------------------------------------------------------------------
$body07 = @"
Contexte
--------
Critère de fin de sprint #8 : 3 specs Playwright vertes sur les 3 flux clés.

À faire
-------
- [ ] Setup Playwright dans ``03_mvp/`` (déjà installé en S1, vérifier ``npx playwright install``)
- [ ] Spec ``e2e/arbitrage-happy.spec.ts`` :
  - démarre la session, propose 3 tâches, drag → top 3, commit, vérifie que ``GET /api/tasks?source=arbitrage`` retourne 3 lignes
- [ ] Spec ``e2e/evening-happy.spec.ts`` :
  - démarre evening, sélectionne humeur, valide 3 top demain, commit, vérifie streak +1
- [ ] Spec ``e2e/tasks-crud.spec.ts`` :
  - quick-add → toggle → defer → delete, drag entre 2 quadrants Eisenhower
- [ ] Headless par défaut, mode ``--headed`` documenté pour debug
- [ ] Branche CI GitHub Actions : workflow ``e2e.yml`` qui lance ``npm run test:e2e``

Critères d'acceptation
----------------------
- 3 specs vertes en local (Windows Chrome)
- 3 specs vertes en CI GitHub Actions
- Temps total < 90 s

Charge / Owner / Dépendances
----------------------------
- Charge : 2 j-dev
- Owner  : Dev1
- Dépendances : **S2.03**, **S2.04**, **S2.05** (les 3 frontends doivent être branchés)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §3 (S2.07)
"@
Create-Issue "S2.07" "[S2.07] Tests Playwright e2e — 3 specs (arbitrage, evening, tasks)" "$commonLabels,lane/tests,type/test,priority/P1,owner/dev1" "v0.5-s2" $body07

# ----------------------------------------------------------------------------
#  S2.08 — Tests unitaires extensions
# ----------------------------------------------------------------------------
$body08 = @"
Contexte
--------
S1 a livré 23 tests verts. Critère S2 #9 : ≥ 30 tests verts (= 7 tests supplémentaires).

À faire
-------
- [ ] Tests cockpit aggregator (``03_mvp/tests/cockpit.test.js``) — 3 tests : intention présente, absente, alerte streak
- [ ] Tests tasks defer/toggle (``03_mvp/tests/tasks-extended.test.js``) — 2 tests : defer met à jour ``deferred_until``, toggle bascule status
- [ ] Tests evening rollup (``03_mvp/tests/evening.test.js``) — 2 tests : commit incrémente streak, gap d'1 jour reset streak
- [ ] ``npm test`` : compteur global passe à 30+

Critères d'acceptation
----------------------
- ``npm test`` retourne ≥ 30 tests verts (vs 23 livrés en S1)
- Couverture des nouveaux endpoints S2 : cockpit, evening rollup, tasks defer

Charge / Owner / Dépendances
----------------------------
- Charge : 1 j-dev
- Owner  : Dev2
- Dépendances : aucune (peut démarrer en parallèle dès jeudi 22/05)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §3 (S2.08)
"@
Create-Issue "S2.08" "[S2.08] Tests unitaires extensions (cockpit aggregator, tasks defer/toggle, evening rollup)" "$commonLabels,lane/tests,type/test,priority/P2,owner/dev2" "v0.5-s2" $body08

# ----------------------------------------------------------------------------
#  S2.09 — Documentation API
# ----------------------------------------------------------------------------
$body09 = @"
Contexte
--------
Le ``03_mvp/README.md`` doit refléter les nouveaux endpoints S2 et fournir
des exemples curl pour onboarder un futur dev en moins de 30 minutes.

À faire
-------
- [ ] Mettre à jour ``03_mvp/README.md`` :
  - section « Endpoints API » avec la liste exhaustive (cockpit, arbitrage, evening, tasks, projects, decisions, contacts, drafts, streaks)
  - chaque endpoint : méthode, chemin, exemple curl, exemple réponse JSON
- [ ] Variables d'environnement : ``AICEO_DB_OVERRIDE``, ``ANTHROPIC_API_KEY``, ``HTTPS_PROXY``
- [ ] Section troubleshooting : 3 erreurs fréquentes (proxy, base lockée, fonts manquantes)
- [ ] Lien vers ``04_docs/SPEC-TECHNIQUE-FUSION.md`` § endpoints

Critères d'acceptation
----------------------
- README à jour reflète l'état post-S2
- Onboarding test : un humain externe (ou Claude fresh session) déploie ``npm install && npm start`` sans question annexe

Charge / Owner / Dépendances
----------------------------
- Charge : 0,5 j-dev
- Owner  : PMO
- Dépendances : aucune

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §3 (S2.09)
"@
Create-Issue "S2.09" "[S2.09] Documentation API à jour (README 03_mvp + curl examples + variables env)" "$commonLabels,lane/mvp,type/doc,priority/P2,owner/pmo" "v0.5-s2" $body09

# ----------------------------------------------------------------------------
#  S2.10 — Spike WebSocket (parking lot, time-box 3 j)
# ----------------------------------------------------------------------------
$body10 = @"
Contexte
--------
Préparation du sprint S4 (``assistant.html`` chat live). Le but est de valider
qu'on peut faire du WebSocket bidirectionnel via ``ws`` (Node) entre Express et
le navigateur, en mono-poste local — pas de production déployée.

⚠ **Time-box strict 3 jours** (J+5 à J+7 du sprint). Si pas concluant, on parque
le résultat partiel et l'issue ferme (cf. §5.5 risque vampirisation S2.07).

À faire
-------
- [ ] Branche ``spike/s4-websocket`` créée à partir de ``main``
- [ ] ``npm install ws`` côté serveur
- [ ] Endpoint ``ws://localhost:3001/ws/assistant`` : echo basique (le serveur renvoie le message reçu en majuscules)
- [ ] Page ``03_mvp/public/spike-ws.html`` : input + zone de log, connexion WS, échange 5 messages
- [ ] README spike : ``04_docs/_sprint-s2/spike-websocket-report.md`` documentant : 1) ce qui marche, 2) ce qui ne marche pas, 3) recommandation S4 (go / no-go / pivot SSE)

Critères d'acceptation
----------------------
- Spike fonctionnel ou parqué proprement (PR fermée avec rapport)
- Décision claire pour S4 : ``ws`` retenu / pivot vers ``EventSource`` / report S5
- Pas de dette technique laissée sur ``main`` (le spike vit sur sa branche)

Charge / Owner / Dépendances
----------------------------
- Charge : 3 j (time-boxé strict)
- Owner  : Dev1
- Dépendances : aucune (démarre jeudi 22/05 en parallèle)

Source : ``04_docs/DOSSIER-SPRINT-S2.md`` §3 (S2.10), §5.5 risque time-box, §7.3 amorce S4
"@
Create-Issue "S2.10" "[S2.10] Spike WebSocket — preuve de concept chat live (préparation S4 assistant.html, time-box 3 j)" "$commonLabels,lane/mvp,type/spike,priority/P2,owner/dev1" "v0.5-s2" $body10

# --- 4. Cleanup -------------------------------------------------------------
Remove-Item -Recurse -Force $tmpDir

Write-Host ""
Write-Host "==> Terminé. Vérifie sur https://github.com/$repo/issues" -ForegroundColor Green
Write-Host "==> Filtre conseillé : is:issue is:open milestone:v0.5-s2 sort:title-asc" -ForegroundColor DarkGray
Write-Host ""
