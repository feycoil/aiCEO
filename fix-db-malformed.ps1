# fix-db-malformed.ps1
# Diagnostique et repare la DB SQLite aiceo.db corrompue (erreur "database disk image is malformed")
#
# Usage :
#   pwsh -File C:\_workarea_local\aiCEO\fix-db-malformed.ps1                  # DRY-RUN (diagnostic seul)
#   pwsh -File C:\_workarea_local\aiCEO\fix-db-malformed.ps1 -Recover         # Tentative de recuperation via sqlite3.exe .recover
#   pwsh -File C:\_workarea_local\aiCEO\fix-db-malformed.ps1 -Reinit          # Re-init complet + re-ingest emails (perd les donnees applicatives)
#
# Ordre recommande : DRY-RUN -> -Recover -> si echec -> -Reinit

param(
    [switch]$Recover,
    [switch]$Reinit,
    [switch]$FixIndex
)

$ErrorActionPreference = "Stop"
$repoRoot = "C:\_workarea_local\aiCEO"
$mvpRoot  = Join-Path $repoRoot "03_mvp"
$dataDir  = Join-Path $mvpRoot "data"
$dbPath   = Join-Path $dataDir "aiceo.db"
$stamp    = Get-Date -Format "yyyyMMdd-HHmm"

function Write-Step($msg, $color = "Cyan") { Write-Host "" ; Write-Host "==> $msg" -ForegroundColor $color }
function Write-OK($msg)   { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    [!]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "    [X]  $msg" -ForegroundColor Red }

# ============================================================
# Sanity checks
# ============================================================
Write-Step "Sanity checks"

if (-not (Test-Path $dbPath)) {
    Write-Err "DB introuvable : $dbPath"
    exit 1
}
$dbSize = [math]::Round((Get-Item $dbPath).Length / 1KB, 0)
Write-OK "DB trouvee : $dbPath ($dbSize KB)"

$flagCount = @($Recover, $Reinit, $FixIndex) | Where-Object { $_ } | Measure-Object | Select-Object -Expand Count
if ($flagCount -gt 1) {
    Write-Err "Choisir un seul mode : -Recover OU -Reinit OU -FixIndex"
    exit 1
}

$mode = if ($Reinit) { "REINIT" } elseif ($Recover) { "RECOVER" } elseif ($FixIndex) { "FIXINDEX" } else { "DRY-RUN" }
Write-Host "    Mode : $mode" -ForegroundColor Magenta

# ============================================================
# Stopper les serveurs node sur :4747
# ============================================================
Write-Step "Arret des serveurs node sur :4747"
$proc = Get-NetTCPConnection -LocalPort 4747 -ErrorAction SilentlyContinue | Select-Object -Expand OwningProcess -Unique
if ($proc) {
    foreach ($p in $proc) {
        try {
            Stop-Process -Id $p -Force -ErrorAction Stop
            Write-OK "Process $p arrete"
        } catch {
            Write-Warn "Process $p deja termine ou non accessible"
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-OK "Aucun serveur node ecoutant sur :4747"
}

# ============================================================
# ETAPE 1 : Backup systematique
# ============================================================
Write-Step "Backup DB courante"
$backup = Join-Path $dataDir "aiceo.db.bak-malformed-$stamp"
Copy-Item $dbPath $backup -Force
Write-OK "Backup : $backup"

# ============================================================
# ETAPE 2 : Diagnostic via node:sqlite (toujours dispo, Node 24)
# ============================================================
Write-Step "Diagnostic via node:sqlite (PRAGMA integrity_check)"
$diagJs = Join-Path $env:TEMP "aiceo-diag-$stamp.js"
@'
const { DatabaseSync } = require('node:sqlite');
const path = process.argv[2];
try {
  const db = new DatabaseSync(path, { readOnly: true });
  const integrity = db.prepare('PRAGMA integrity_check').all();
  console.log('INTEGRITY:', JSON.stringify(integrity));

  // Map rootpage -> table/index name (utile pour identifier la corruption)
  try {
    const pages = db.prepare("SELECT name, type, rootpage FROM sqlite_master WHERE rootpage IS NOT NULL ORDER BY rootpage").all();
    const corruptPage = (integrity[0] && integrity[0].integrity_check || '').match(/page (\d+)/);
    if (corruptPage) {
      const p = parseInt(corruptPage[1], 10);
      const hit = pages.find(x => x.rootpage === p);
      if (hit) console.log('CORRUPT_OBJECT: page=' + p + ' name=' + hit.name + ' type=' + hit.type);
      else console.log('CORRUPT_OBJECT: page=' + p + ' (pas trouve dans sqlite_master, probablement page intermediaire b-tree)');
    }
    console.log('PAGES_NEAR_61:', JSON.stringify(pages.filter(x => Math.abs(x.rootpage - 61) <= 5)));
  } catch (e) { console.log('PAGES_ERR:', e.message); }

  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('TABLES:', tables.map(t => t.name).join(', '));
  } catch (e) { console.log('TABLES_ERR:', e.message); }

  // Tester chaque table : SELECT COUNT(*) ne lit pas tous les b-tree pages,
  // SELECT * touche tout - permet d'identifier les tables atteintes par la corruption
  const allTables = ['arbitrage_sessions','assistant_conversations','assistant_messages','big_rocks',
    'contacts','contacts_projects','decisions','delegations','emails','evening_sessions','events',
    'groups','knowledge_pins','projects','schema_migrations','settings','task_events','tasks',
    'user_preferences','weekly_reviews','weeks'];
  const counts = {};
  const fullScan = {};
  for (const t of allTables) {
    try {
      const r = db.prepare('SELECT COUNT(*) AS c FROM ' + t).get();
      counts[t] = r.c;
    } catch (e) { counts[t] = 'COUNT_ERR:' + e.message; continue; }
    try {
      // Full scan pour detecter si la table est touchee par la corruption
      const rows = db.prepare('SELECT * FROM ' + t).all();
      fullScan[t] = 'OK ' + rows.length;
    } catch (e) { fullScan[t] = 'SCAN_ERR:' + e.message; }
  }
  console.log('COUNTS:', JSON.stringify(counts));
  console.log('FULL_SCAN:', JSON.stringify(fullScan, null, 2));
  db.close();
} catch (e) {
  console.log('OPEN_ERR:', e.message);
  process.exit(1);
}
'@ | Out-File -FilePath $diagJs -Encoding UTF8

Push-Location $mvpRoot
$diag = node $diagJs $dbPath 2>&1
Pop-Location
Remove-Item $diagJs -Force -ErrorAction SilentlyContinue
$diag | ForEach-Object { Write-Host "    $_" }

# ============================================================
# ETAPE 3 : DRY-RUN -> on s'arrete ici
# ============================================================
if (-not $Recover -and -not $Reinit -and -not $FixIndex) {
    Write-Step "DRY-RUN termine" "Yellow"
    Write-Host "    Etapes possibles :"
    Write-Host "      1. Si CORRUPT_OBJECT type=index : reconstruction propre (zero perte) :"
    Write-Host "         pwsh -File $PSCommandPath -FixIndex"
    Write-Host "      2. Tentative de recuperation complete via sqlite3.exe :"
    Write-Host "         pwsh -File $PSCommandPath -Recover"
    Write-Host "      3. Re-init complet (perte donnees applicatives, re-ingere emails) :"
    Write-Host "         pwsh -File $PSCommandPath -Reinit"
    Write-Host ""
    Write-Host "    Rollback manuel : Copy-Item '$backup' '$dbPath' -Force"
    exit 0
}

# ============================================================
# ETAPE 4-FIXINDEX : Reconstruction des index corrompus (zero perte donnees)
# ============================================================
if ($FixIndex) {
    Write-Step "Reconstruction des index corrompus" "Cyan"
    Write-Host "    Cible : index detectes corrompus dans le diag (ex: idx_assistant_conv_updated)"

    $fixJs = Join-Path $env:TEMP "aiceo-fixindex-$stamp.js"
    @'
const { DatabaseSync } = require('node:sqlite');
const path = process.argv[2];
const db = new DatabaseSync(path);

// 1. Identifier les objets corrompus via integrity_check
const integrity = db.prepare('PRAGMA integrity_check').all();
console.log('Avant fix:', JSON.stringify(integrity));

// 2. Snapshot exhaustif des index user-defined : on capture name+sql AVANT toute modif
//    (au cas ou DROP echoue sur une page corrompue + VACUUM efface l'objet sans qu'il soit recree)
const originalIndexes = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
console.log('Total index user-defined:', originalIndexes.length);
const originalNames = new Set(originalIndexes.map(i => i.name));

// 3. Strategie : DROP + CREATE pour chaque index user-defined
//    Ne PAS continue sur DROP error : on tente quand meme CREATE INDEX IF NOT EXISTS,
//    car le DROP peut echouer si la page b-tree de l'index est corrompue mais l'index
//    sera de toute facon nettoye par VACUUM. CREATE IF NOT EXISTS apres VACUUM = idempotent.
let dropped = 0, created = 0, dropErrs = [], createErrs = [];
for (const idx of originalIndexes) {
  try {
    db.exec('DROP INDEX IF EXISTS ' + idx.name);
    dropped++;
  } catch (e) {
    dropErrs.push(idx.name);
    console.log('DROP ' + idx.name + ' ERR: ' + e.message + ' (sera tente apres VACUUM)');
  }
  try {
    db.exec(idx.sql);
    created++;
    console.log('  + ' + idx.name + ' (' + idx.tbl_name + ') OK');
  } catch (e) {
    createErrs.push(idx.name);
    console.log('CREATE ' + idx.name + ' ERR: ' + e.message + ' (sera tente apres VACUUM)');
  }
}
console.log('Index dropped: ' + dropped + ' / created: ' + created + ' / drop_err: ' + dropErrs.length + ' / create_err: ' + createErrs.length);

// 4. VACUUM pour reclaim et compacter (efface les pages corrompues orphelines)
console.log('VACUUM en cours...');
db.exec('VACUUM');

// 5. SAFETY NET : comparer index actuels vs originaux, recreer tout ce qui manque
const afterIndexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
const afterNames = new Set(afterIndexes.map(i => i.name));
const missing = originalIndexes.filter(i => !afterNames.has(i.name));

if (missing.length > 0) {
  console.log('Safety net : ' + missing.length + ' index manquants apres VACUUM, reconstruction...');
  for (const idx of missing) {
    try {
      db.exec(idx.sql);
      console.log('  ++ ' + idx.name + ' (' + idx.tbl_name + ') reconstruit via safety net');
    } catch (e) {
      console.log('SAFETY_NET ' + idx.name + ' ERR: ' + e.message);
    }
  }
} else {
  console.log('Safety net : aucun index manquant (parfait)');
}

// 6. Re-verifier integrity
const integrityAfter = db.prepare('PRAGMA integrity_check').all();
console.log('Apres fix:', JSON.stringify(integrityAfter));

// 7. Audit final : confirmer que tous les index originaux sont bien presents
const finalIndexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
const finalNames = new Set(finalIndexes.map(i => i.name));
const stillMissing = [...originalNames].filter(n => !finalNames.has(n));
if (stillMissing.length > 0) {
  console.log('ATTENTION index encore manquants:', JSON.stringify(stillMissing));
} else {
  console.log('Audit final OK : ' + finalIndexes.length + '/' + originalIndexes.length + ' index user-defined presents');
}

db.close();
'@ | Out-File -FilePath $fixJs -Encoding UTF8

    Push-Location $mvpRoot
    $fixOut = node $fixJs $dbPath 2>&1
    $fixExit = $LASTEXITCODE
    Pop-Location
    Remove-Item $fixJs -Force -ErrorAction SilentlyContinue

    $fixOut | ForEach-Object { Write-Host "    $_" }

    if ($fixExit -ne 0) {
        Write-Err "Fix index a echoue (exit $fixExit)"
        Write-Host "    Rollback : Copy-Item '$backup' '$dbPath' -Force"
        Write-Host "    Fallback : pwsh -File $PSCommandPath -Reinit"
        exit 5
    }

    if ($fixOut -match 'integrity_check.+ok') {
        Write-OK "Integrity check OK apres reconstruction des index"
    } else {
        Write-Warn "Integrity check pas encore OK - verifier la sortie ci-dessus"
        Write-Host "    Si la corruption touche aussi des tables (pas juste des index), passer en -Recover ou -Reinit"
    }
}

# ============================================================
# ETAPE 4a : Mode RECOVER via sqlite3.exe
# ============================================================
if ($Recover) {
    Write-Step "Recuperation via sqlite3.exe .recover"

    $sqlite3 = Get-Command sqlite3.exe -ErrorAction SilentlyContinue
    if (-not $sqlite3) {
        Write-Err "sqlite3.exe introuvable dans PATH"
        Write-Host "    Telecharge sqlite-tools-win-x64-*.zip depuis https://www.sqlite.org/download.html"
        Write-Host "    Decompresse et ajoute le dossier au PATH ou place sqlite3.exe dans $dataDir"
        Write-Host ""
        Write-Host "    Alternative immediate : -Reinit (perd donnees mais reconstruit propre)"
        exit 2
    }
    Write-OK "sqlite3.exe trouve : $($sqlite3.Source)"

    Push-Location $dataDir
    try {
        $recoveredSql  = "aiceo-recovered-$stamp.sql"
        $freshDb       = "aiceo-fresh-$stamp.db"

        Write-Host "    Dump .recover -> $recoveredSql ..."
        & sqlite3.exe aiceo.db ".recover" | Out-File -Encoding UTF8 $recoveredSql
        $dumpSize = [math]::Round((Get-Item $recoveredSql).Length / 1KB, 0)
        Write-OK "Dump genere : $dumpSize KB"

        Write-Host "    Reload dans DB fraiche -> $freshDb ..."
        & sqlite3.exe $freshDb ".read $recoveredSql"
        if (-not (Test-Path $freshDb)) { throw "DB fraiche non creee" }
        Write-OK "DB fraiche cree"

        # Verification counts
        Write-Host "    Verification counts dans DB fraiche..."
        $check = & sqlite3.exe $freshDb @"
SELECT 'emails',COUNT(*) FROM emails;
SELECT 'projects',COUNT(*) FROM projects;
SELECT 'contacts',COUNT(*) FROM contacts;
SELECT 'tasks',COUNT(*) FROM tasks;
SELECT 'decisions',COUNT(*) FROM decisions;
SELECT 'schema_migrations',COUNT(*) FROM schema_migrations;
"@
        $check -split "`n" | ForEach-Object { Write-Host "      $_" }

        # Verification integrity sur DB fraiche
        $intCheck = & sqlite3.exe $freshDb "PRAGMA integrity_check;"
        if ($intCheck.Trim() -eq "ok") {
            Write-OK "Integrity OK sur DB fraiche"
        } else {
            Write-Warn "Integrity check sur DB fraiche : $intCheck"
        }

        # Swap
        Write-Host ""
        $confirm = Read-Host "    Swap DB fraiche -> aiceo.db ? [O/n]"
        if ($confirm -in @("","O","o","Y","y")) {
            Move-Item aiceo.db "aiceo.db.corrupt-$stamp" -Force
            Move-Item $freshDb aiceo.db -Force
            Write-OK "Swap effectue. Ancienne DB renommee aiceo.db.corrupt-$stamp"
        } else {
            Write-Warn "Swap annule. DB fraiche conservee : $freshDb"
        }
    } catch {
        Write-Err "Echec recuperation : $_"
        Write-Host "    Fallback : pwsh -File $PSCommandPath -Reinit"
        Pop-Location
        exit 3
    }
    Pop-Location
}

# ============================================================
# ETAPE 4b : Mode REINIT
# ============================================================
if ($Reinit) {
    Write-Step "Re-init complet" "Red"
    Write-Warn "ATTENTION : cette operation perd toutes les donnees applicatives"
    Write-Warn "Les emails seront re-ingeres depuis data/emails.json (si present)"
    Write-Warn "Backup deja fait : $backup"
    Write-Host ""
    $confirm = Read-Host "    Confirmer re-init ? [oui/non]"
    if ($confirm -ne "oui") {
        Write-Warn "Re-init annule"
        exit 0
    }

    Push-Location $mvpRoot
    try {
        Move-Item ".\data\aiceo.db" ".\data\aiceo.db.dead-$stamp" -Force
        Write-OK "DB corrompue archivee"

        Write-Host "    Lancement init-db.js..."
        node scripts\init-db.js
        if ($LASTEXITCODE -ne 0) { throw "init-db.js a echoue" }
        Write-OK "Schema cree (7 migrations appliquees)"

        if (Test-Path ".\data\emails.json") {
            Write-Host "    Re-ingestion emails..."
            node scripts\ingest-emails.js
            if ($LASTEXITCODE -eq 0) {
                Write-OK "Emails re-ingeres"
                Write-Host "    Bootstrap projets + contacts..."
                node scripts\bootstrap-from-emails.js
                if ($LASTEXITCODE -eq 0) { Write-OK "Bootstrap OK" } else { Write-Warn "Bootstrap echoue" }
            } else {
                Write-Warn "Re-ingest echoue, lance manuellement : node scripts\ingest-emails.js"
            }
        } else {
            Write-Warn "data\emails.json absent. Lance fetch-outlook + normalize-emails pour re-ingerer :"
            Write-Host "        pwsh -File scripts\sync-outlook.ps1"
        }
    } catch {
        Write-Err "Echec re-init : $_"
        Write-Host "    Rollback : Copy-Item '$backup' '$dbPath' -Force"
        Pop-Location
        exit 4
    }
    Pop-Location
}

# ============================================================
# ETAPE 5 : Validation finale
# ============================================================
Write-Step "Validation finale"
$finalJs = Join-Path $env:TEMP "aiceo-final-$stamp.js"
@'
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const r = db.prepare('PRAGMA integrity_check').all();
console.log('integrity_check:', JSON.stringify(r));
const counts = {};
for (const t of ['emails','projects','contacts','tasks','decisions','schema_migrations']) {
  try { counts[t] = db.prepare('SELECT COUNT(*) AS c FROM ' + t).get().c; }
  catch (e) { counts[t] = 'ERR'; }
}
console.log('counts:', JSON.stringify(counts));
db.close();
'@ | Out-File -FilePath $finalJs -Encoding UTF8

Push-Location $mvpRoot
$final = node $finalJs $dbPath 2>&1
Pop-Location
Remove-Item $finalJs -Force -ErrorAction SilentlyContinue
$final | ForEach-Object { Write-Host "    $_" }

Write-Step "Termine" "Green"
Write-Host "    Relancer le serveur :"
Write-Host "        cd $mvpRoot ; node server.js"
Write-Host ""
Write-Host "    Re-tester :"
Write-Host "        pwsh -File scripts\smoke-all.ps1"
Write-Host ""
Write-Host "    Backup conserve : $backup"
Write-Host ""
