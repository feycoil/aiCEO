# create-roadmap-v2-milestones.ps1
# Cree les 19 milestones GitHub pour la ROADMAP V2 + 1 milestone V1.0 final
#
# Usage : pwsh -File tools\create-roadmap-v2-milestones.ps1            (DRY-RUN)
#         pwsh -File tools\create-roadmap-v2-milestones.ps1 -Apply

param(
    [switch]$Apply
)

$ErrorActionPreference = "Continue"
$repo = "feycoil/aiCEO"

Write-Host ""
if ($Apply) {
    Write-Host "==> MODE : APPLY" -Fore Red
} else {
    Write-Host "==> MODE : DRY-RUN" -Fore Yellow
}
Write-Host ""

$milestones = @(
    # Phase 0 (3)
    @{ title="Phase 0 - S6.9-bis Setup ADD-AI"; desc="Restructuration projet + Cowork plugin + 8 subagents + memory/ + sync GitHub. 1.5 j-binome." },
    @{ title="Phase 0 - S6.10-bis Atomic Templates"; desc="Framework templates vierges + 12 composants atomiques + 3 pages migrees (decisions/connaissance/arbitrage). 2 j-binome." },
    @{ title="Phase 0 - S6.11-bis Pilotage v2"; desc="Interface pilotage temps reel : live activity + Cmd+K + metriques produit + decrochages + export PDF. 1.5 j-binome." },

    # Phase 1 (5)
    @{ title="Phase 1 - S6.11 DS consolidation"; desc="0 styles inline, components.html v07 documente, 5 tokens elevation. 1 j." },
    @{ title="Phase 1 - S6.12 Keyboard-first arbitrage"; desc="Mode plein ecran arbitrage v07 + raccourcis 1-5 + ↑↓ + Big Rocks topbar. 1 j." },
    @{ title="Phase 1 - S6.13 Cmd+K palette + FTS5"; desc="Recherche globale + quick actions + SQLite FTS5. 1 j." },
    @{ title="Phase 1 - S6.14 Contexte LLM enrichi"; desc="System prompt enrichi serveur + memoire inter-fils basique. 1 j." },
    @{ title="Phase 1 - S6.15 Revues hebdo refondue"; desc="KPIs reels, posture LLM, mouvement, cap, page migree v07. 1.5 j." },

    # Phase 2 (6)
    @{ title="Phase 2 - S7.1 Memoire inter-fils LLM"; desc="Daily summary LLM integre au system prompt assistant. 1 j." },
    @{ title="Phase 2 - S7.2 Batch LLM operations"; desc="1 appel pour N items + cache + ratio LLM/rule. 1 j." },
    @{ title="Phase 2 - S7.3 Capture audio + Whisper"; desc="Whisper local pour bilan soir vocal. 1.5 j." },
    @{ title="Phase 2 - S7.4 Backlinks bidirectionnels"; desc="Decisions <-> projets <-> contacts <-> pins. 1 j." },
    @{ title="Phase 2 - S7.5 Skeleton loading + perf"; desc="Budget temps par interaction (50/200/800 ms). 0.5 j." },
    @{ title="Phase 2 - S7.6 Mobile responsive"; desc="Layout < 768px utilisable pour CEO en deplacement. 1 j." },

    # Phase 3 (5)
    @{ title="Phase 3 - S7.7 Daily digest matin"; desc="LLM resume nuit + 3 priorites du jour. 1 j." },
    @{ title="Phase 3 - S7.8 Bilan soir augmente"; desc="Auto resume jour + lecture vocale. 1 j." },
    @{ title="Phase 3 - S7.9 Onboarding CEO pair"; desc="Seed data + walkthrough 7 jours + Lamiae francophone. 1.5 j." },
    @{ title="Phase 3 - S7.10 Notifications PWA"; desc="Reminders matin/soir/hebdo (sans push cloud). 1 j." },
    @{ title="Phase 3 - S7.11 Light/dark mode"; desc="DS etendu + switcher Reglages. 1 j." },

    # V1.0 final
    @{ title="V1.0 - Produit dev-grade ready"; desc="Note produit >= 9.0/10, smoke 100%, 7 KPIs instrumentes, NPS >= 8, 100% pages v07. Tag v1.0 + Release." }
)

Write-Host "$($milestones.Count) milestones a creer" -Fore Cyan
Write-Host ""

$created = 0
$skipped = 0
$errors = 0

foreach ($m in $milestones) {
    if ($Apply) {
        $existing = gh api "repos/$repo/milestones?state=all&per_page=100" --jq ".[] | select(.title==`"$($m.title)`") | .number" 2>$null
        if ($existing) {
            Write-Host "   = Existe deja : $($m.title)" -Fore Yellow
            $skipped++
            continue
        }
        gh api repos/$repo/milestones -f title="$($m.title)" -f description="$($m.desc)" -f state="open" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   + Cree : $($m.title)" -Fore Green
            $created++
        } else {
            Write-Host "   ! Erreur : $($m.title)" -Fore Red
            $errors++
        }
    } else {
        Write-Host "   WOULD CREATE : $($m.title)" -Fore Yellow
    }
}

Write-Host ""
Write-Host "=== RESUME ===" -Fore Cyan
if ($Apply) {
    Write-Host "   $created cree(s), $skipped existant(s), $errors erreur(s)" -Fore Green
} else {
    Write-Host "   $($milestones.Count) milestones seraient crees en mode -Apply" -Fore Yellow
    Write-Host ""
    Write-Host "Pour appliquer : pwsh -File tools\create-roadmap-v2-milestones.ps1 -Apply" -Fore Cyan
}
Write-Host ""
