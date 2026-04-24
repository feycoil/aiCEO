<#
.SYNOPSIS
    fetch-outlook.ps1 - recupere les mails des 30 derniers jours depuis TOUS les
    comptes configures dans Outlook (principal + boites deleguees + PST archives)
    et les dump en JSON dans ../data/emails-raw.json.

.DESCRIPTION
    Utilise Outlook.Application via COM. Itere sur Namespace.Stores pour couvrir
    chaque compte / boite partagee / fichier PST monte.

    Pour chaque Store, cherche la "Inbox" et les "Sent Items" (ou "Elements
    envoyes") dans l'arborescence des dossiers, et extrait les items des N
    derniers jours.

    Chaque item JSON porte un champ "account" = display name du Store dont il
    provient, pour pouvoir filtrer ou agreger cote aval.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\fetch-outlook.ps1
    powershell -ExecutionPolicy Bypass -File scripts\fetch-outlook.ps1 -Days 60

.NOTES
    Si Outlook demande une confirmation "Un programme tente d'acceder...",
    autorisez "Autoriser pour 10 minutes" et relancez.
#>

param(
    [int]$Days = 30,
    [string]$OutFile = (Join-Path $PSScriptRoot "..\data\emails-raw.json")
)

$ErrorActionPreference = "Stop"

Write-Host "-> Demarrage extraction Outlook ($Days derniers jours, tous comptes)"

$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")

$threshold = (Get-Date).AddDays(-$Days)
$thresholdStr = $threshold.ToString("g")

Write-Host "  - Seuil : $thresholdStr"
Write-Host ""

# ============================================================
# Helpers
# ============================================================

# Noms de dossiers candidates pour Inbox et Sent selon la langue d'Outlook
$InboxNames = @("Inbox", "Boite de reception", "Boîte de réception", "Posteingang", "Bandeja de entrada")
$SentNames  = @("Sent Items", "Elements envoyes", "Éléments envoyés", "Gesendete Elemente", "Elementos enviados")

function Find-FolderByNames($parent, $candidateNames) {
    foreach ($name in $candidateNames) {
        try {
            $f = $parent.Folders.Item($name)
            if ($f) { return $f }
        } catch { }
    }
    return $null
}

function Build-ItemPayload($m, $folderTag, $accountName) {
    $body = $m.Body
    if ($body -and $body.Length -gt 500) { $body = $body.Substring(0, 500) + "..." }

    # Resolution Exchange DN -> SMTP pour les expediteurs internes
    $fromEmail = $m.SenderEmailAddress
    if ($fromEmail -and $fromEmail.StartsWith("/O=")) {
        try {
            $exchUser = $m.Sender.GetExchangeUser()
            if ($exchUser -and $exchUser.PrimarySmtpAddress) {
                $fromEmail = $exchUser.PrimarySmtpAddress
            }
        } catch { }
    }

    return [ordered]@{
        id           = $m.EntryID
        account      = $accountName
        folder       = $folderTag
        subject      = $m.Subject
        from_name    = $m.SenderName
        from_email   = $fromEmail
        to           = $m.To
        cc           = $m.CC
        received_at  = $m.ReceivedTime.ToString("o")
        sent_at      = if ($m.SentOn) { $m.SentOn.ToString("o") } else { $null }
        unread       = $m.UnRead
        flagged      = ($m.FlagStatus -ne 0)
        size         = $m.Size
        has_attach   = ($m.Attachments.Count -gt 0)
        body_preview = $body
        categories   = $m.Categories
    }
}

function Extract-Items($folder, $folderTag, $accountName) {
    if (-not $folder) { return @() }
    $out = @()

    try {
        $items = $folder.Items
        $dateField = if ($folderTag -eq "sent") { "[SentOn]" } else { "[ReceivedTime]" }
        $items.Sort($dateField, $true)
    } catch {
        Write-Host ("    ! folder unreadable ({0}) : {1}" -f $folderTag, $_.Exception.Message)
        return @()
    }

    # Pour le dossier Sent : iteration manuelle (Restrict sur [SentOn] echoue
    # silencieusement selon la locale Outlook / format date). Pour l'Inbox,
    # Restrict est necessaire sur grosses boites (perf).
    if ($folderTag -eq "sent") {
        foreach ($m in $items) {
            try {
                if ($m.Class -ne 43) { continue }
                $when = $null
                try { $when = $m.SentOn } catch { }
                if (-not $when) { try { $when = $m.ReceivedTime } catch { } }
                if (-not $when -or $when -lt $threshold) { continue }
                $out += (Build-ItemPayload $m $folderTag $accountName)
            } catch {
                Write-Host ("    ! skip item: " + $_.Exception.Message)
            }
        }
        return $out
    }

    # Inbox : filtre Jet (en-US invariant pour robustesse locale)
    try {
        $usFmt = $threshold.ToString("MM/dd/yyyy HH:mm", [System.Globalization.CultureInfo]::InvariantCulture)
        $filter = "[ReceivedTime] >= '$usFmt'"
        $filtered = $items.Restrict($filter)
    } catch {
        Write-Host ("    ! restrict failed ({0}) : {1}" -f $folderTag, $_.Exception.Message)
        return @()
    }

    foreach ($m in $filtered) {
        try {
            # MailItem = 43
            if ($m.Class -ne 43) { continue }
            $out += (Build-ItemPayload $m $folderTag $accountName)
        } catch {
            Write-Host ("    ! skip item: " + $_.Exception.Message)
        }
    }
    return $out
}

# ============================================================
# Iteration sur tous les Stores
# ============================================================

$allItems = @()
$perAccount = @()

$stores = @($namespace.Stores)
Write-Host "  Comptes Outlook detectes : $($stores.Count)"
Write-Host ""

foreach ($store in $stores) {
    $accountName = $store.DisplayName
    Write-Host "  [$accountName]"
    try {
        $root = $store.GetRootFolder()
    } catch {
        Write-Host ("    ! root inaccessible : " + $_.Exception.Message)
        continue
    }

    $inboxFolder = Find-FolderByNames $root $InboxNames
    $sentFolder  = Find-FolderByNames $root $SentNames

    $inboxBefore = if ($inboxFolder) { $inboxFolder.Items.Count } else { 0 }
    $sentBefore  = if ($sentFolder)  { $sentFolder.Items.Count  } else { 0 }
    Write-Host "    Inbox  : $inboxBefore items avant filtre$(if (-not $inboxFolder) { ' (NON TROUVE)' })"
    Write-Host "    Sent   : $sentBefore items avant filtre$(if (-not $sentFolder) { ' (NON TROUVE)' })"

    $inboxItems = Extract-Items $inboxFolder "inbox" $accountName
    $sentItems  = Extract-Items $sentFolder  "sent"  $accountName
    Write-Host "    -> Inbox filtree : $($inboxItems.Count) | Sent filtre : $($sentItems.Count)"
    Write-Host ""

    $allItems += $inboxItems
    $allItems += $sentItems
    $perAccount += [ordered]@{
        account      = $accountName
        inbox_before = $inboxBefore
        sent_before  = $sentBefore
        inbox_kept   = $inboxItems.Count
        sent_kept    = $sentItems.Count
    }
}

# ============================================================
# Payload et ecriture
# ============================================================

$payload = [ordered]@{
    extracted_at = (Get-Date).ToString("o")
    window_days  = $Days
    accounts     = $perAccount
    counts       = @{
        total = $allItems.Count
        inbox = ($allItems | Where-Object { $_.folder -eq "inbox" }).Count
        sent  = ($allItems | Where-Object { $_.folder -eq "sent" }).Count
    }
    items        = $allItems
}

$outDir = Split-Path -Parent $OutFile
if (-not (Test-Path -LiteralPath $outDir)) {
    try { New-Item -ItemType Directory -Path $outDir -Force | Out-Null } catch { }
}

$json = $payload | ConvertTo-Json -Depth 6
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Supprimer le fichier existant pour eviter le padding NUL dans OneDrive
# quand le nouveau contenu est plus petit que l'ancien.
if (Test-Path -LiteralPath $OutFile) {
    try { Remove-Item -LiteralPath $OutFile -Force } catch { }
}

[System.IO.File]::WriteAllText($OutFile, $json, $utf8NoBom)

# Double securite : tronquer explicitement a la taille du JSON
try {
    $fs = [System.IO.File]::Open($OutFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Write)
    $fs.SetLength([System.Text.Encoding]::UTF8.GetByteCount($json))
    $fs.Close()
} catch { }

Write-Host "============================================================"
Write-Host "[OK] Export OK : $OutFile"
Write-Host "  Total : $($allItems.Count) mails sur $Days jours, $($stores.Count) compte(s)"
Write-Host "============================================================"
