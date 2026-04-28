# fix-labels.ps1
# Cree tous les labels potentiellement utilises par les scripts gh-create-issues-sX.ps1
# Idempotent : skip silencieux si label existe deja.
#
# Usage : pwsh -File C:\_workarea_local\aiCEO\fix-labels.ps1

$ErrorActionPreference = "Continue"

$labels = @(
    @{name="sprint/s1"; color="C2E0C6"; desc="Sprint S1 - Backend stable SQLite"},
    @{name="sprint/s2"; color="BFD4F2"; desc="Sprint S2 - Pages cockpit migrees API"},
    @{name="sprint/s3"; color="D4C5F9"; desc="Sprint S3 - Pages hebdo + temps reel SSE"},
    @{name="sprint/s4"; color="FBCA04"; desc="Sprint S4 - Assistant + 5 pages portefeuille"},
    @{name="sprint/s5"; color="FF9933"; desc="Sprint S5 - Cutover production"},

    @{name="phase/v0.5-s1"; color="C2E0C6"; desc="Phase v0.5 sprint 1"},
    @{name="phase/v0.5-s2"; color="BFD4F2"; desc="Phase v0.5 sprint 2"},
    @{name="phase/v0.5-s3"; color="D4C5F9"; desc="Phase v0.5 sprint 3"},
    @{name="phase/v0.5-s4"; color="FBCA04"; desc="Phase v0.5 sprint 4"},
    @{name="phase/v0.5-s5"; color="FF9933"; desc="Phase v0.5 sprint 5"},

    @{name="lane/mvp";       color="C5DEF5"; desc="Lane MVP — code applicatif"},
    @{name="lane/docs";      color="BFE5BF"; desc="Lane docs — documentation"},
    @{name="lane/infra";     color="FEF2C0"; desc="Lane infra — install / service"},
    @{name="lane/tests";     color="D4C5F9"; desc="Lane tests — unitaires + e2e"},

    @{name="type/feat";      color="0E8A16"; desc="Nouvelle fonctionnalite"},
    @{name="type/improve";   color="1D76DB"; desc="Amelioration"},
    @{name="type/fix";       color="D93F0B"; desc="Correction de bug"},
    @{name="type/test";      color="5319E7"; desc="Tests"},
    @{name="type/doc";       color="C2E0C6"; desc="Documentation"},
    @{name="type/docs";      color="C2E0C6"; desc="Documentation (alias)"},
    @{name="type/adr";       color="5319E7"; desc="Architecture Decision Record"},
    @{name="type/refactor";  color="FBCA04"; desc="Refactor"},

    @{name="priority/P0";    color="B60205"; desc="Bloquant"},
    @{name="priority/P1";    color="D93F0B"; desc="Important"},
    @{name="priority/P2";    color="FBCA04"; desc="Normal"},
    @{name="priority/P3";    color="0E8A16"; desc="Nice to have"},

    @{name="owner/dev1";     color="EEEEEE"; desc="Owner Dev1 (binôme principal)"},
    @{name="owner/dev2";     color="EEEEEE"; desc="Owner Dev2 (binôme secondaire)"},
    @{name="owner/ceo";      color="EEEEEE"; desc="Owner CEO"},
    @{name="owner/pmo";      color="EEEEEE"; desc="Owner PMO"},

    @{name="Backend";   color="0E8A16"; desc="Backend Node Express SQLite"},
    @{name="Frontend";  color="1D76DB"; desc="Frontend HTML/JS/CSS"},
    @{name="Cockpit";   color="0E8A16"; desc="Pile cockpit (UX, polish, install)"},
    @{name="Tests";     color="5319E7"; desc="Tests unitaires + e2e"},
    @{name="Docs";      color="5319E7"; desc="Documentation API / recette / ADR"},
    @{name="Infra";     color="C5DEF5"; desc="Infra Windows (service, schtasks, install)"},
    @{name="DX";        color="BFE5BF"; desc="Developer experience"},

    @{name="P0";        color="B60205"; desc="Bloquant"},
    @{name="P1";        color="D93F0B"; desc="Important"},
    @{name="P2";        color="FBCA04"; desc="Normal"},
    @{name="P3";        color="0E8A16"; desc="Nice to have"}
)

Write-Host "==> Creation labels (idempotent)`n" -Fore Cyan

$created = 0
$skipped = 0
$errors  = 0

foreach ($l in $labels) {
    $out = gh label create $l.name --color $l.color --description $l.desc 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   + $($l.name)" -Fore Green
        $created++
    } elseif ($out -match "already exists") {
        Write-Host "   = $($l.name) (existe deja)" -Fore Yellow
        $skipped++
    } else {
        Write-Host "   ! $($l.name) : $out" -Fore Red
        $errors++
    }
}

Write-Host "`n==> Bilan : $created crees, $skipped existants, $errors erreurs" -Fore Cyan
Write-Host "`n==> Pour creer les 12 issues S4 maintenant :"
Write-Host "    pwsh -File C:\_workarea_local\aiCEO\04_docs\_sprint-s4\scripts\gh-create-issues-s4.ps1"
Write-Host ""
