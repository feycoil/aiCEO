# diagnose-outlook.ps1 - diagnostic rapide pour comprendre pourquoi
# New-Object -ComObject Outlook.Application plante.

$line = "=" * 56
Write-Host $line
Write-Host "  Diagnostic Outlook COM"
Write-Host $line

# 1. Processus admin ?
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Host "PowerShell admin     : $isAdmin"

# 2. Architecture PowerShell
$psBits = if ([Environment]::Is64BitProcess) { "64-bit" } else { "32-bit" }
Write-Host "PowerShell arch      : $psBits"

# 3. Processus Outlook present ?
$ol = Get-Process outlook -ErrorAction SilentlyContinue
if ($ol) {
    Write-Host "Outlook processus    : OUI (PID $($ol.Id))"
    try {
        $path = $ol.Path
        Write-Host "Outlook chemin       : $path"
        # Detecter l'architecture Outlook via le chemin
        if ($path -like "*Program Files (x86)*") {
            Write-Host "Outlook arch         : 32-bit"
        } elseif ($path -like "*Program Files*") {
            Write-Host "Outlook arch         : 64-bit"
        }
    } catch {
        Write-Host "Outlook chemin       : inaccessible ($($_.Exception.Message))"
    }
} else {
    Write-Host "Outlook processus    : NON (pas lance)"
}

# 4. Registre - quelle version d'Outlook installee
$reg32 = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Office\ClickToRun\Configuration"
$reg64 = "HKLM:\SOFTWARE\Microsoft\Office\ClickToRun\Configuration"
foreach ($r in @($reg32, $reg64)) {
    if (Test-Path $r) {
        $cfg = Get-ItemProperty -Path $r -ErrorAction SilentlyContinue
        if ($cfg -and $cfg.Platform) {
            Write-Host "Office Click-to-Run  : $($cfg.Platform) ($r)"
        }
    }
}

# 5. Tentative instantiation
Write-Host ""
Write-Host "Test : New-Object -ComObject Outlook.Application"
try {
    $test = New-Object -ComObject Outlook.Application
    Write-Host "  [OK] Instantiation reussie"
    $ns = $test.GetNamespace("MAPI")
    $inbox = $ns.GetDefaultFolder(6)
    Write-Host "  [OK] Inbox accessible - $($inbox.Items.Count) items"
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($test) | Out-Null
} catch {
    Write-Host "  [ECHEC] $($_.Exception.Message)"
    Write-Host ""
    Write-Host "  Pistes :"
    if ($isAdmin) {
        Write-Host "   - PowerShell tourne EN ADMIN : relancer en user normal"
    } else {
        Write-Host "   - Verifier qu'Outlook est entierement charge (boite visible)"
        Write-Host "   - Verifier que l'architecture PS ($psBits) matche celle d'Outlook"
        Write-Host "   - Fermer Outlook completement (Task Manager) et relancer"
    }
}

Write-Host ""
Write-Host $line
