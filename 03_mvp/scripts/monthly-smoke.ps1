# monthly-smoke.ps1 — smoke-all.ps1 + npm test, alerte si fail
$ErrorActionPreference = "Continue"
Set-Location "C:\_workarea_local\aiCEO\03_mvp"
$report = Join-Path "data" "smoke-monthly-$(Get-Date -Format yyyy-MM-dd).log"
"=== Smoke mensuel $(Get-Date -Format o) ===" | Out-File $report -Encoding UTF8

# Smoke HTTP
& powershell -File scripts\smoke-all.ps1 *>&1 | Tee-Object -FilePath $report -Append
$smokeOK = ($LASTEXITCODE -eq 0)

# npm test
"" | Out-File $report -Encoding UTF8 -Append
"=== npm test ===" | Out-File $report -Encoding UTF8 -Append
& npm test *>&1 | Tee-Object -FilePath $report -Append
$testOK = ($LASTEXITCODE -eq 0)

if ($smokeOK -and $testOK) {
    Write-Host "[OK] smoke + tests verts (rapport : $report)"
} else {
    $title = "aiCEO smoke mensuel : FAIL"
    $body = "smoke=$smokeOK tests=$testOK — voir $report"
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($body, $title, "OK", "Error")
    Write-Host "[ALERT] $title"
}
