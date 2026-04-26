# sync-outlook.ps1
# Wrapper de la chaîne complète sync Outlook → emails-summary.json.
# Cible : être lancé par schtasks aiCEO-Outlook-Sync /sc HOURLY /mo 2.
#
# Chaîne :
#   1. fetch-outlook.ps1    → data/emails-raw.json     (Outlook COM)
#   2. node normalize-emails.js → data/emails.json + data/emails-summary.json
#
# Pré-requis : Outlook doit être ouvert (sinon CO_E_SERVER_EXEC_FAILURE 0x80080005).
# Si Outlook fermé : le wrapper le détecte et tente un Start-Process outlook.
#
# Logs : data/sync-outlook.log (append, dernier run en bas).
#
# Codes retour :
#   0 = succès complet (raw + summary à jour)
#   1 = Outlook indisponible (start raté)
#   2 = fetch-outlook a échoué (COM bloqué)
#   3 = normalize-emails a échoué (raw invalide)

$ErrorActionPreference = "Stop"
$mvp  = "C:\_workarea_local\aiCEO\03_mvp"
$log  = Join-Path $mvp "data\sync-outlook.log"
Set-Location $mvp

function Log($msg) {
    $ts = Get-Date -Format o
    "$ts $msg" | Add-Content -Path $log -Encoding UTF8
}

Log "=== sync-outlook start ==="

# 1. Vérifier qu'Outlook tourne, sinon le démarrer
$ol = Get-Process outlook -ErrorAction SilentlyContinue
if (-not $ol) {
    Log "[1] Outlook absent, lancement..."
    try {
        Start-Process outlook
        Start-Sleep -Seconds 15
        $ol = Get-Process outlook -ErrorAction SilentlyContinue
        if (-not $ol) {
            Log "[KO] Outlook n'a pas démarré"
            exit 1
        }
        Log "[1] Outlook démarré PID=$($ol.Id)"
    } catch {
        Log "[KO] Erreur Start-Process outlook : $_"
        exit 1
    }
} else {
    Log "[1] Outlook déjà actif PID=$($ol.Id)"
}

# 2. fetch-outlook.ps1
Log "[2] fetch-outlook.ps1..."
try {
    $fetchOut = & powershell -ExecutionPolicy Bypass -File "$mvp\scripts\fetch-outlook.ps1" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log "[KO] fetch-outlook exit=$LASTEXITCODE"
        $fetchOut | ForEach-Object { Log "    $_" }
        exit 2
    }
    # Compter les mails extraits
    $totalLine = $fetchOut | Where-Object { $_ -match "Total :" } | Select-Object -Last 1
    Log "[2] fetch-outlook OK ($totalLine)"
} catch {
    Log "[KO] fetch-outlook exception : $_"
    exit 2
}

# 3. normalize-emails.js
Log "[3] normalize-emails.js..."
try {
    $normOut = & node "$mvp\scripts\normalize-emails.js" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log "[KO] normalize-emails exit=$LASTEXITCODE"
        $normOut | ForEach-Object { Log "    $_" }
        exit 3
    }
    Log "[3] normalize-emails OK"
} catch {
    Log "[KO] normalize-emails exception : $_"
    exit 3
}

# 4. Vérifier que emails-summary.json a bien été touché
$sumPath = Join-Path $mvp "data\emails-summary.json"
if (Test-Path $sumPath) {
    $age = (New-TimeSpan -Start (Get-Item $sumPath).LastWriteTime -End (Get-Date)).TotalMinutes
    Log "[OK] emails-summary.json mtime age = $([Math]::Round($age, 1)) min"
} else {
    Log "[WARN] emails-summary.json absent après normalize"
}

Log "=== sync-outlook OK ==="
exit 0
