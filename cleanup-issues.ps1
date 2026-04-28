# cleanup-issues.ps1
# Audit + cleanup du backlog GitHub aiCEO.
# Ferme les doublons techniques et les issues deja livrees.
#
# Usage :
#   pwsh -File cleanup-issues.ps1            # DRY-RUN (affiche sans agir)
#   pwsh -File cleanup-issues.ps1 -Apply     # Applique reellement les fermetures
#
# Source : audit du 26/04/2026 sur 114 issues ouvertes.

param(
    [switch]$Apply
)

$ErrorActionPreference = "Continue"
$repo = "feycoil/aiCEO"

# ----------------------------------------------------------------------------
# Liste des issues a fermer, groupees par motif
# ----------------------------------------------------------------------------
$toClose = @(
    # === A. Doublons S4 (1er batch incomplet, garder #147-158) ===
    @{num=135; reason="Doublon S4.00 (garder #147)"},
    @{num=136; reason="Doublon S4.01 (garder #148)"},
    @{num=137; reason="Doublon S4.02 (garder #149)"},
    @{num=138; reason="Doublon S4.03 (garder #150)"},
    @{num=139; reason="Doublon S4.04 (garder #151)"},
    @{num=140; reason="Doublon S4.05 (garder #152)"},
    @{num=141; reason="Doublon S4.06 (garder #153)"},
    @{num=142; reason="Doublon S4.07 (garder #154)"},
    @{num=143; reason="Doublon S4.08 (garder #155)"},
    @{num=144; reason="Doublon S4.09 (garder #156)"},
    @{num=145; reason="Doublon S4.10 (garder #157)"},
    @{num=146; reason="Doublon S4.11 (garder #158)"},

    # === B. Doublons docs/infra (garder #91-100) ===
    @{num=80; reason="Doublon Benchmark v2 (garder #91, livree)"},
    @{num=81; reason="Doublon PITCH-ONEPAGE (garder #92, livree)"},
    @{num=82; reason="Doublon BUSINESS-CASE (garder #93, livree)"},
    @{num=83; reason="Doublon ONBOARDING-CEO-PAIR (garder #94, livree)"},
    @{num=84; reason="Doublon LETTRE-INTRO-CEO-PAIR (garder #95, livree)"},
    @{num=85; reason="Doublon PITCH-DECK-INVESTISSEUR (garder #96, livree)"},
    @{num=86; reason="Doublon KIT-PARTENAIRE-TECH (garder #97)"},
    @{num=87; reason="Doublon PITCH-CLIENT (garder #98)"},
    @{num=88; reason="Doublon OpenAPI 3.0 (garder #99)"},
    @{num=89; reason="Doublon Pre-commit hook Husky (garder #100)"},

    # === C. Issues livrees ===
    @{num=91; reason="Livree par task #161 (Benchmark v2 sur ds/wire-mvp-to-ds)"},
    @{num=92; reason="Livree par tasks #162-164 (PITCH-ONEPAGE)"},
    @{num=93; reason="Livree par tasks #165-168 (BUSINESS-CASE)"},
    @{num=94; reason="Livree par task #169 (ONBOARDING-CEO-PAIR)"},
    @{num=95; reason="Livree par task #170 (LETTRE-INTRO-CEO-PAIR)"},
    @{num=96; reason="Livree par task #171 (PITCH-DECK-INVESTISSEUR.pptx)"},

    # === D. Chevauchements de scope ===
    @{num=46; reason="Livree par S4.02 (#149) — chat live SSE assistant.html"},
    @{num=67; reason="Livree par S3.10 variante D (raccourci Startup folder) + S4.09 polish (#156)"}
)

Write-Host ""
Write-Host "==> Repo cible : $repo" -ForegroundColor Cyan
if ($Apply) {
    Write-Host "==> MODE : APPLY (les issues seront reellement fermees)" -ForegroundColor Red
} else {
    Write-Host "==> MODE : DRY-RUN (affichage seulement, ajouter -Apply pour fermer)" -ForegroundColor Yellow
}
Write-Host "==> $($toClose.Count) issues a fermer" -ForegroundColor Cyan
Write-Host ""

$ok    = 0
$errs  = 0
$skip  = 0

foreach ($i in $toClose) {
    $num    = $i.num
    $reason = $i.reason
    $url    = "https://github.com/$repo/issues/$num"

    # Verifier qu'elle est bien ouverte
    $state = (gh issue view $num --repo $repo --json state -q .state 2>$null)
    if ($state -eq $null) {
        Write-Host "   [#${num}] SKIP introuvable" -ForegroundColor DarkGray
        $skip++
        continue
    }
    if ($state -ne "OPEN") {
        Write-Host "   [#${num}] SKIP deja $state" -ForegroundColor DarkGray
        $skip++
        continue
    }

    if ($Apply) {
        $comment = "Fermeture cleanup backlog 26/04/2026 : $reason"
        & gh issue close $num --repo $repo --comment $comment --reason "not planned" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [#${num}] CLOSED — $reason" -ForegroundColor Green
            $ok++
        } else {
            Write-Host "   [#${num}] ERREUR fermeture" -ForegroundColor Red
            $errs++
        }
    } else {
        Write-Host "   [#${num}] WOULD CLOSE — $reason" -ForegroundColor Yellow
    }
}

Write-Host ""
if ($Apply) {
    Write-Host "==> Bilan : $ok fermees, $skip ignorees, $errs erreurs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "==> Verifier l'etat actuel :"
    Write-Host "    gh issue list --state open --limit 200"
} else {
    Write-Host "==> Pour appliquer : pwsh -File cleanup-issues.ps1 -Apply" -ForegroundColor Cyan
}
Write-Host ""
