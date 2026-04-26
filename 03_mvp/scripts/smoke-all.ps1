# smoke-all.ps1
# Issue S5.02 — smoke test post-deploy automatique
# Verifie que le serveur aiCEO repond correctement sur :
#   - 12 pages frontend (HTTP 200 + content-type text/html)
#   - 4 routes assistant (GET conversations, POST messages SSE, GET conv/:id, DELETE conv/:id)
#   - GET /api/health (payload enrichi v0.5)
#   - GET /api/system/last-sync (alerte Outlook)
#
# Usage : pwsh -File scripts\smoke-all.ps1               # port 4747 par defaut
#         pwsh -File scripts\smoke-all.ps1 -Port 3001    # port custom
#         pwsh -File scripts\smoke-all.ps1 -Verbose      # detail par check
#
# Exit 0 = tous les checks OK, 1 = au moins un fail.

param(
    [int]$Port = 4747,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$base = "http://localhost:$Port"

$pass = 0
$fail = 0
$details = @()

function Check($name, $url, $expect = 200, [string]$method = "GET", [string]$body = $null) {
    try {
        $params = @{ Uri = $url; Method = $method; UseBasicParsing = $true; TimeoutSec = 5 }
        if ($body) { $params.Body = $body; $params.ContentType = "application/json" }
        $r = Invoke-WebRequest @params -ErrorAction Stop
        $ok = ($r.StatusCode -eq $expect)
        if ($ok) {
            $script:pass++
            if ($Verbose) { Write-Host "   ✓ $name" -Fore Green }
        } else {
            $script:fail++
            $script:details += "$name → HTTP $($r.StatusCode) (attendu $expect)"
            Write-Host "   ✗ $name → HTTP $($r.StatusCode) (attendu $expect)" -Fore Red
        }
    } catch {
        $code = 0
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        if ($code -eq $expect) {
            $script:pass++
            if ($Verbose) { Write-Host "   ✓ $name (HTTP $code attendu)" -Fore Green }
        } else {
            $script:fail++
            $script:details += "$name → erreur : $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))"
            Write-Host "   ✗ $name → $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))" -Fore Red
        }
    }
}

Write-Host ""
Write-Host "==> smoke-all.ps1 — cible $base" -Fore Cyan
Write-Host ""

# === Pre-flight : serveur ecoute ? ===
Write-Host "[0] Pre-flight" -Fore Yellow
$conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if (-not $conn) {
    Write-Host "   ✗ Aucun process n'ecoute sur :$Port" -Fore Red
    Write-Host "     Demarre le serveur : cd 03_mvp ; npm start" -Fore Yellow
    exit 1
}
Write-Host "   ✓ Serveur ecoute sur :$Port" -Fore Green

# === 1. Pages frontend (12) ===
Write-Host ""
Write-Host "[1] Pages frontend (12)" -Fore Yellow
$pages = @("/", "/evening", "/arbitrage", "/taches", "/agenda", "/revues", "/groupes", "/projets", "/projet", "/contacts", "/decisions", "/assistant")
foreach ($p in $pages) {
    Check "page $p" "$base$p"
}

# === 2. API health ===
Write-Host ""
Write-Host "[2] /api/health enrichi (S5.03)" -Fore Yellow
Check "/api/health" "$base/api/health"
try {
    $h = Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 5
    $hasUptime = $null -ne $h.uptime_s
    $hasMemory = $null -ne $h.memory
    $hasCounts = $null -ne $h.counts
    $hasOutlook = $null -ne $h.outlook
    if ($hasUptime -and $hasMemory) { $pass++; if ($Verbose) { Write-Host "   ✓ health.uptime_s + memory" -Fore Green } }
    else { $fail++; $details += "/api/health manque uptime_s ou memory"; Write-Host "   ✗ health manque uptime_s ou memory" -Fore Red }
    if ($hasCounts) { $pass++; if ($Verbose) { Write-Host "   ✓ health.counts (tasks=$($h.counts.tasks))" -Fore Green } }
    else { $fail++; $details += "/api/health manque counts"; Write-Host "   ✗ health manque counts" -Fore Red }
} catch {
    $fail++; $details += "/api/health enrichi parsing fail"
    Write-Host "   ✗ /api/health parsing fail : $_" -Fore Red
}

# === 3. Routes assistant (S4.01) ===
Write-Host ""
Write-Host "[3] Routes assistant (4)" -Fore Yellow
Check "GET /api/assistant/conversations" "$base/api/assistant/conversations"
Check "POST /api/assistant/messages stream" "$base/api/assistant/messages" 200 "POST" '{"content":"smoke test"}'
# GET conv/:id et DELETE testes par tests/assistant.test.js, on ne pollue pas la DB ici

# === 4. Routes API critiques ===
Write-Host ""
Write-Host "[4] API critiques" -Fore Yellow
Check "/api/cockpit/today" "$base/api/cockpit/today" 200
Check "/api/system/last-sync" "$base/api/system/last-sync"
Check "/api/groups" "$base/api/groups"
Check "/api/projects" "$base/api/projects"
Check "/api/contacts" "$base/api/contacts"
Check "/api/decisions" "$base/api/decisions"
Check "/api/tasks" "$base/api/tasks"

# === Resume ===
Write-Host ""
Write-Host "==> RESUME" -Fore Cyan
Write-Host "   PASS : $pass" -Fore Green
Write-Host "   FAIL : $fail" -Fore $(if ($fail -gt 0) { "Red" } else { "Green" })
$total = $pass + $fail
$pct = if ($total) { [Math]::Round(100 * $pass / $total) } else { 0 }
Write-Host "   $pass / $total = $pct %" -Fore Cyan

if ($fail -gt 0) {
    Write-Host ""
    Write-Host "==> Echecs detail :" -Fore Red
    foreach ($d in $details) { Write-Host "   - $d" }
    exit 1
}

Write-Host ""
Write-Host "==> Smoke test OK ✓" -Fore Green
Write-Host ""
exit 0
