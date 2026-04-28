# fetch-outlook-events.ps1
# Récupère les événements (calendrier) Outlook sur fenêtre J-15 → J+30.
# Produit data/events-raw.json (puis ingéré en SQLite par scripts/normalize-events.js).
#
# Usage : powershell -ExecutionPolicy Bypass -File scripts\fetch-outlook-events.ps1
# Pré-requis : Outlook ouvert (sinon CO_E_SERVER_EXEC_FAILURE 0x80080005).
#
# Cible : olFolderCalendar (constante 9 dans Outlook Object Model).

[CmdletBinding()]
param(
    [int]$DaysPast = 15,
    [int]$DaysFuture = 30,
    [string]$OutFile = (Join-Path $PSScriptRoot "..\data\events-raw.json")
)

$ErrorActionPreference = "Stop"

$startDate = (Get-Date).AddDays(-$DaysPast)
$endDate   = (Get-Date).AddDays($DaysFuture)
Write-Host "Fenetre : $($startDate.ToString('yyyy-MM-dd')) -> $($endDate.ToString('yyyy-MM-dd'))"

$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")

# olFolderCalendar = 9
$calendar = $namespace.GetDefaultFolder(9)
if (-not $calendar) {
    Write-Error "Calendrier Outlook introuvable (olFolderCalendar)"
    exit 2
}

# Filtre DASL (range)
$startStr = $startDate.ToString("g")
$endStr   = $endDate.ToString("g")
$restrict = "[Start] >= '$startStr' AND [Start] <= '$endStr'"

# IncludeRecurrences : essentiel pour récupérer les répétitions
$items = $calendar.Items
$items.Sort("[Start]")
$items.IncludeRecurrences = $true
$filtered = $items.Restrict($restrict)

$events = @()
$count = 0
foreach ($e in $filtered) {
    $count++
    if ($count -gt 1000) { break }  # sécurité

    try {
        $organizer = $null
        if ($e.Organizer) { $organizer = "$($e.Organizer)" }

        $statusMap = @{ 0 = 'none'; 1 = 'tentative'; 2 = 'busy'; 3 = 'oof'; 4 = 'wfh'; 5 = 'free' }
        $busyStatus = if ($e.BusyStatus) { $statusMap[$e.BusyStatus] } else { 'none' }
        $statusOut = if ($e.MeetingStatus -eq 5) { 'cancelled' } elseif ($busyStatus -eq 'tentative') { 'tentative' } else { 'confirmed' }

        $bodyPreview = $null
        if ($e.Body) { $bodyPreview = $e.Body.Substring(0, [Math]::Min(500, $e.Body.Length)) }

        $events += [PSCustomObject]@{
            id            = "$($e.EntryID)"
            subject       = "$($e.Subject)"
            location      = "$($e.Location)"
            starts_at     = $e.Start.ToString("o")
            ends_at       = $e.End.ToString("o")
            duration_min  = [int]$e.Duration
            organizer     = $organizer
            attendees     = "$($e.RequiredAttendees)"
            status        = $statusOut
            body_preview  = $bodyPreview
            is_recurring  = [bool]$e.IsRecurring
            categories    = "$($e.Categories)"
        }
    } catch {
        Write-Warning "Item ignore : $_"
    }
}

# Wrap final
$summary = [PSCustomObject]@{
    extracted_at  = (Get-Date).ToString("o")
    window_start  = $startDate.ToString("o")
    window_end    = $endDate.ToString("o")
    days_past     = $DaysPast
    days_future   = $DaysFuture
    total         = $events.Count
    items         = $events
}

$json = $summary | ConvertTo-Json -Depth 4 -Compress
$json | Out-File -FilePath $OutFile -Encoding UTF8 -Force

Write-Host "OK : $($events.Count) evenements extraits"
Write-Host "  Total : $($events.Count) events sur $($DaysPast + $DaysFuture) jours, $($events.Count) compte(s)"
Write-Host "  -> $OutFile"
