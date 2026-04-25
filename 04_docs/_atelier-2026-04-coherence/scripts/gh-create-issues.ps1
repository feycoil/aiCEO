# ============================================================================
#  gh-create-issues.ps1 — Ouvre les 11 issues GitHub du backlog atelier 2026-04
# ============================================================================
#  Source    : 04_docs/_atelier-2026-04-coherence/drafts/ISSUES-A-OUVRIR.md
#  Pré-requis: `gh auth status` OK · droits write sur feycoil/aiCEO
#  Usage     : depuis la racine du repo : pwsh -File .\04_docs\_atelier-2026-04-coherence\scripts\gh-create-issues.ps1
#  Effet     : (1) créée/met à jour les labels nécessaires, (2) s'assure que les 3 milestones (MVP, V1, V2) existent, (3) ouvre les 11 issues
#  Idempotent: oui pour labels/milestones. Pour les issues, si tu relances tu auras des doublons — vérifier avant de ré-exécuter.
# ============================================================================

$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

# --- Encoding : forcer UTF-8 pour les arguments passés aux native exe (gh.exe).
# PowerShell 5.1 utilise CP1252 par défaut, ce qui casse les accents des titres d'issues.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==> Repo cible : $repo" -ForegroundColor Cyan
Write-Host ""

# --- 0. Auth check -----------------------------------------------------------
& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERREUR : gh auth status KO. Lance 'gh auth login' avant." -ForegroundColor Red
  exit 1
}

# --- 1. Bootstrap labels (idempotent) ----------------------------------------
Write-Host "==> Bootstrap des labels" -ForegroundColor Cyan
$labels = @(
  @{ name = "lane/design-system"; color = "7a6a8a"; description = "Design system — tokens, composants, pipeline DS" }
  @{ name = "lane/docs";          color = "b88237"; description = "Documentation — spec, business, onboarding" }
  @{ name = "lane/infra";         color = "3d7363"; description = "Infra / DevOps — tooling, CI, hooks" }
  @{ name = "priority/P0";        color = "8a3b1b"; description = "Bloquant — à traiter en priorité absolue" }
  @{ name = "priority/high";      color = "d96d3e"; description = "Haute priorité" }
  @{ name = "priority/P1";        color = "d96d3e"; description = "Priorité 1" }
  @{ name = "priority/P2";        color = "7790ae"; description = "Priorité 2" }
  @{ name = "priority/P3";        color = "9a9da8"; description = "Priorité 3 / parqué" }
  @{ name = "scope/interne";      color = "eeebe4"; description = "Livrable interne ETIC" }
  @{ name = "scope/externe";      color = "f5e8d6"; description = "Livrable externe (investisseur, CEO pair…)" }
  @{ name = "status/parked";      color = "e4e1d9"; description = "Parqué — à ré-ouvrir selon conditions" }
  @{ name = "phase/v0.5";         color = "fdecdf"; description = "Sprint fusion v0.5" }
  @{ name = "type/chore";         color = "dcd8cd"; description = "Chore / maintenance" }
  @{ name = "type/doc";           color = "e2ece8"; description = "Documentation" }
  @{ name = "type/infra";         color = "e9eef4"; description = "Infrastructure" }
  @{ name = "type/audit-trimestriel"; color = "b88237"; description = "Audit trimestriel des livrables vivants — règle GOUVERNANCE.md" }
)
foreach ($l in $labels) {
  & gh label create $l.name --repo $repo --color $l.color --description $l.description --force 2>&1 | Out-Null
  Write-Host "   label $($l.name)" -ForegroundColor DarkGray
}

# --- 2. Bootstrap milestones (idempotent via gh api) -------------------------
Write-Host "==> Bootstrap des milestones" -ForegroundColor Cyan
function Ensure-Milestone($title, $description) {
  # Parsing JSON natif PowerShell — évite le bug de stripping des quotes passées à jq via native exe
  $jsonText = & gh api "repos/$repo/milestones?state=all" 2>$null | Out-String
  $existing = $null
  if (-not [string]::IsNullOrWhiteSpace($jsonText)) {
    try {
      $milestones = $jsonText | ConvertFrom-Json
      $existing = $milestones | Where-Object { $_.title -eq $title } | Select-Object -First 1
    } catch {
      $existing = $null
    }
  }
  if (-not $existing) {
    & gh api "repos/$repo/milestones" -f title="$title" -f description="$description" 2>&1 | Out-Null
    Write-Host "   milestone $title (créée)" -ForegroundColor Green
  } else {
    Write-Host "   milestone $title (existe)" -ForegroundColor DarkGray
  }
}
Ensure-Milestone "MVP" "Fusion v0.4 → v0.5 — local-first Windows mono-poste"
Ensure-Milestone "V1"  "Cloud — CEO pair + investisseur"
Ensure-Milestone "V2"  "Commercialisation externe + programme partenaires"

# --- 3. Création des 11 issues ----------------------------------------------
Write-Host ""
Write-Host "==> Création des 11 issues" -ForegroundColor Cyan
Write-Host ""

$tmpDir = Join-Path $env:TEMP "aiCEO-issues-$(Get-Random)"
New-Item -ItemType Directory -Path $tmpDir | Out-Null

function Create-Issue($num, $title, $labelsCsv, $milestone, $body) {
  $bodyFile = Join-Path $tmpDir "issue-$num.md"
  [System.IO.File]::WriteAllText($bodyFile, $body, [System.Text.Encoding]::UTF8)
  Write-Host "   [$num] $title" -ForegroundColor White
  & gh issue create --repo $repo `
    --title $title `
    --body-file $bodyFile `
    --label $labelsCsv `
    --milestone $milestone
  if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERREUR création issue $num" -ForegroundColor Red
  }
}

# ----------------------------------------------------------------------------
#  ISSUE 1 — DS · câbler MVP sur design system
# ----------------------------------------------------------------------------
$body1 = @"
Contexte
--------
Validation §1.1 POST-ATELIER (premier run pipeline DS → CSS, 2026-04-24) a révélé une
coherence gap : le pipeline pousse bien ``colors_and_type.css`` vers ``03_mvp/public/assets/``,
mais **le MVP ne le consomme pas**. Deux symptômes visibles dans Chrome localhost:4747 :

1. Les h1/h2/h3 s'affichent en **serif** (fallback Cambria/Georgia) parce que Fira Sans
   ne charge pas — les OTF ne sont pas dans ``03_mvp/public/assets/fonts/``.
2. Les couleurs MVP (cream #FAF6EF, sage #A8C8A4, lilac #A895DB, coral #EC7A6A,
   amber #E0B25C…) **divergent matériellement** des tokens DS (surface #f5f3ef,
   emerald #3d7363, violet #7a6a8a, rose #d96d3e, amber #b88237). Exemple critique :
   ``--sage`` MVP (#A8C8A4 vert clair pastel) vs ``--emerald`` DS (#3d7363 vert sapin) —
   la page "Faire" du MVP a donc une identité visuelle différente du DS.

Cause : ``index.html`` et ``evening.html`` ont **350 lignes de CSS inliné** dans ``<style>``
avec leur propre palette hard-codée (``--cream``, ``--ink``, ``--lilac``, ``--sage``, ``--coral``)
et **aucun ``<link rel="stylesheet">``** vers ``/assets/colors_and_type.css``.

ADRs de référence :
- S2 · Typographie canonique Fira Sans self-hosted
- S7 · Pipeline tokens DS → CSS + maintien unifié
- S7 · Règle : tokens.json est source canonique, aucun override hors pipeline
→ ``00_BOUSSOLE/DECISIONS.md``

À faire (Sprint 1 fusion v0.5, cf. SPEC-TECHNIQUE-FUSION §3)
------------------------------------------------------------
### Volet A — Déployer les polices
- [ ] Copier ``02_design-system/fonts/FiraSans-*.otf`` (10 poids : Thin/ExtraLight/Light/Regular/Book/Medium/SemiBold/Bold/ExtraBold/Heavy) dans ``03_mvp/public/assets/fonts/``
- [ ] Copier ``02_design-system/fonts/Aubrielle_Demo.ttf`` et ``SolThin.otf`` (2 polices accent)
- [ ] Vérifier : ``ls 03_mvp/public/assets/fonts/ | wc -l`` = 12

### Volet B — Câbler ``colors_and_type.css``
- [ ] Dans ``03_mvp/public/index.html`` : ajouter ``<link rel="stylesheet" href="/assets/colors_and_type.css">`` **avant** la balise ``<style>`` inline (pour que l'inline puisse surcharger pendant la transition)
- [ ] Idem dans ``03_mvp/public/evening.html``
- [ ] Vérifier en DevTools Network : ``colors_and_type.css`` charge en 200, les 12 OTF aussi (pas de 404)
- [ ] Vérifier en DevTools Elements : ``:root`` expose les 92 tokens DS (--bg, --surface, --rose, etc.)
- [ ] Rapport : le h1 "Arbitrage matinal" passe visuellement en Fira Sans ExtraBold

### Volet C — Migrer les variables inline vers les tokens DS
- [ ] Substitutions dans les 2 fichiers (index.html et evening.html), dans l'ordre :
  - ``--cream`` → ``--surface``
  - ``--cream-deep`` → ``--surface-3``
  - ``--ink`` → ``--text``
  - ``--ink-2`` → ``--text-2``
  - ``--ink-3`` → ``--text-3``
  - ``--line`` → ``--border``
  - ``--lilac`` → ``--violet``
  - ``--lilac-soft`` → ``--violet-50``
  - ``--sage-soft`` → ``--emerald-50``
  - ``--sage``, ``--sage-ac`` → choix CEO : garder (pastel actuel) ou migrer vers ``--emerald`` (vert sapin DS). Trancher en sprint.
  - ``--coral`` → ``--rose`` ; ``--coral-soft`` → ``--rose-50``
  - ``--amber`` → ``--amber`` (valeurs à réconcilier : MVP #E0B25C vs DS #b88237)
  - ``--amber-soft`` → ``--amber-50``
  - ``--sky`` → ``--sky`` ; ``--sky-soft`` → ``--sky-50``
- [ ] Supprimer le bloc ``:root { --cream: ...; ... }`` inline une fois toutes les substitutions faites
- [ ] Nettoyer les ``font-family: "Fira Sans", Cambria, Georgia, serif;`` → ``font-family: var(--font-sans);`` pour body et h1/h2/h3 avec ``font-weight: var(--fw-extrabold)`` (pas de fallback serif)

### Volet D — Régression visuelle
- [ ] Screenshots avant/après sur ``/`` et ``/evening`` (Chrome Windows)
- [ ] Si divergence violente sur emerald (--sage → --emerald) ou amber, ouvrir sous-issue "token reconciliation" : décider en sprint design si on aligne le MVP sur le DS (change identité visuelle actuelle) ou si on patche tokens.json pour refléter les valeurs MVP existantes.

Critères d'acceptation
----------------------
- Aucun chargement de fonte depuis rsms.me ou Google Fonts (onglet Network DevTools)
- Toutes les pages affichent Fira Sans visuellement — plus aucun fallback Cambria/Georgia
- Aucun bloc ``:root { --cream: ...; }`` inline restant dans ``index.html`` et ``evening.html``
- Tokens consommés depuis ``/assets/colors_and_type.css`` uniquement
- Pas de régression fonctionnelle sur les flows Arbitrage et Soir

Source
------
- Session S2 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S2-typographie.md §7``
- Session S7 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S7-ds-process-silos.md``
- POST-ATELIER §1.1 validation pipeline (gap MVP découvert 2026-04-24)
"@
Create-Issue 1 "[DS] Fusion v0.5 · câbler 03_mvp sur le design system (fonts Fira Sans + consommation colors_and_type.css)" "lane/design-system,priority/high,phase/v0.5,type/chore" "MVP" $body1

# ----------------------------------------------------------------------------
#  ISSUE 2 — Benchmark v2 (bloquant)
# ----------------------------------------------------------------------------
$body2 = @"
Contexte
--------
Le benchmark actuel (``04_docs/02-benchmark.md``) compare aiCEO à Lattice, Motion, Superhuman — tous des SaaS cloud.
Post-fusion v0.5, aiCEO est une app locale Windows mono-poste. Le marché de référence est désormais :
Microsoft Copilot for Business, Rewind, Motion-desktop, plugins Outlook, Claude-for-work desktop.

**Cette issue est P0 bloquant** : les 5 livrables externes (pitch, business case, deck) dépendent de ce patch.

Critères d'acceptation
----------------------
- [ ] §3 du benchmark remis à jour avec les 5 nouveaux concurrents directs (Copilot for Business, Rewind, Motion-desktop, Reflect, plugin Outlook Superhuman)
- [ ] §0 ajouté : "Deux marchés de référence selon la phase produit" (local-first v0.4/v0.5 = productivité desktop ; cloud V1+ = SaaS CEO)
- [ ] Mentionner ADR S1 (trajectoire produit)
- [ ] Renvoi depuis les livrables externes vers ce document

Durée estimée : 2-4 h

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue 1
Dépendance audit C7 (positionnement obsolète).
"@
Create-Issue 2 "[DOC] Benchmark v2 — positionnement post-fusion v0.5 (bloque livrables externes)" "lane/docs,priority/P0,scope/interne,type/doc" "V1" $body2

# ----------------------------------------------------------------------------
#  ISSUE 3 — Pitch onepage
# ----------------------------------------------------------------------------
$body3 = @"
Contexte
--------
Livrable externe cadré en S5 atelier cohérence. Dépend de Issue #2 (benchmark v2).
Cible : CEO pair ETIC + investisseur early.

Critères d'acceptation
----------------------
- [ ] 1 page A4 exportable PDF
- [ ] Structure : Problème (3 lignes) / Solution (3 lignes) / Preuve MVP v0.4 (28/28, 926 mails, ≈1 ct/arbitrage) / Trajectoire 18 mois (schéma 5 jalons) / Appel à l'action
- [ ] Ton investisseur, pas marketing
- [ ] Redaction des chiffres budgétaires sensibles : ordres de grandeur, pas exact
- [ ] Référence en pied de page vers ``BUSINESS-CASE.md`` pour le détail
- [ ] En-tête de filtrage : ``Audience : CEO pair / investisseur. Éléments redactés : budget précis, chiffres ETIC internes. Version interne de référence : 04_docs/BUSINESS-CASE.md``

Sprint de production : 05/05 → 11/05/2026 (S2 plan audit).

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue 2
"@
Create-Issue 3 "[DOC] PITCH-ONEPAGE.md — 1 page A4 investisseur" "lane/docs,priority/P1,scope/externe,type/doc" "V1" $body3

# ----------------------------------------------------------------------------
#  ISSUE 4 — Business case
# ----------------------------------------------------------------------------
$body4 = @"
Contexte
--------
Livrable externe cadré en S5. Cible : investisseur early, CEO pair.
Dépend de Issue #2 (benchmark v2) pour le positionnement.

Critères d'acceptation
----------------------
- [ ] Section hypothèses revenue : écosystème ETIC (2-3 CEO pairs en V3, pricing interne vs externe à estimer), pas de commercialisation externe avant V2
- [ ] Section coûts cumulés : 1,69 M€ sur 18 mois (arbitré S4)
- [ ] Section point mort : conditions pour atteindre l'équilibre (nombre d'utilisateurs × prix × marge)
- [ ] Section ROI CEO utilisateur : gain de temps chiffré (baseline Feycoil = 5-7 h/sem en V1 cible) × valeur horaire CEO
- [ ] Risques connus : local-first pont jetable (coût de migration V1), dépendance Anthropic (mitigation LiteLLM V1+), absence de modèle économique écrit à date
- [ ] En-tête de filtrage : ``Audience : investisseur / CEO pair. Éléments redactés : ventilation ETIC interne.``

Sprint de production : 05/05 → 11/05/2026.

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue 3
"@
Create-Issue 4 "[DOC] BUSINESS-CASE.md — hypothèses revenue + coûts + ROI" "lane/docs,priority/P1,scope/externe,type/doc" "V1" $body4

# ----------------------------------------------------------------------------
#  ISSUE 5 — Onboarding CEO pair
# ----------------------------------------------------------------------------
$body5 = @"
Contexte
--------
Livrable externe cadré en S5. Cible : CEO pair ETIC qui veut tester aiCEO.

Critères d'acceptation
----------------------
- [ ] Prérequis techniques : Windows 10+, Outlook desktop, clé Anthropic personnelle (~5 €/mois à l'usage v0.4), proxy corporate accepté
- [ ] Installation Service Windows pas-à-pas (dérivé de ``SPEC-TECHNIQUE-FUSION.md`` §9)
- [ ] Import Outlook 30 jours (script ``outlook-pull.ps1``)
- [ ] Premier arbitrage : 15 minutes pour comprendre le flux matin
- [ ] FAQ : confidentialité (données restent sur le poste), coût mensuel, support, rollback
- [ ] Ton pair-à-pair, pas vendeur
- [ ] En-tête de filtrage : ``Audience : CEO pair. Éléments redactés : aucun (c'est public).``

Sprint de production : 05/05 → 11/05/2026.

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue 4
"@
Create-Issue 5 "[DOC] ONBOARDING-CEO-PAIR.md — installer et démarrer aiCEO en < 1 h" "lane/docs,priority/P1,scope/externe,type/doc" "V1" $body5

# ----------------------------------------------------------------------------
#  ISSUE 6 — Lettre intro
# ----------------------------------------------------------------------------
$body6 = @"
Contexte
--------
Livrable externe cadré en S5. Accompagne l'envoi de ``PITCH-ONEPAGE.md`` + ``ONBOARDING-CEO-PAIR.md`` à un CEO pair ETIC.

Critères d'acceptation
----------------------
- [ ] 1 page, signée Feycoil
- [ ] 4 blocs : "Pourquoi je t'envoie ça", "ce que tu trouveras", "ce que j'attends de toi (ou pas)", "quand je rappelle"
- [ ] Ton personnel, pas commercial
- [ ] Template réutilisable avec placeholders ``<prénom>``, ``<société>``, ``<context>``
- [ ] En-tête de filtrage : ``Audience : CEO pair nominatif. Éléments redactés : aucun.``

Sprint de production : 05/05 → 11/05/2026.

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue 5
"@
Create-Issue 6 "[DOC] LETTRE-INTRO-CEO-PAIR.md — 1 page signée Feycoil" "lane/docs,priority/P1,scope/externe,type/doc" "V1" $body6

# ----------------------------------------------------------------------------
#  ISSUE 7 — Pitch deck investisseur
# ----------------------------------------------------------------------------
$body7 = @"
Contexte
--------
Livrable externe cadré en S5. Adaptation du deck interne ``10-exec-deck.pptx`` (20 slides ADABU internes) en deck investisseur externe.

Critères d'acceptation
----------------------
- [ ] Adaptation 10-exec-deck.pptx → nouveau deck 15-18 slides investisseur
- [ ] Slides modifiés : ajout traction (slide 3 ou 4), positionnement remis à jour (slide benchmark), redaction des chiffres budget (ordres de grandeur), ajout "ce qui n'est pas encore construit" (honnêteté)
- [ ] Slides conservés : manifeste, roadmap 18 mois, KPIs
- [ ] Slides retirés : équipe ETIC interne (confidentiel), détails opérationnels ADABU
- [ ] Export autonome (pptx + pdf)
- [ ] En-tête de filtrage (speaker notes slide 1) : ``Audience : investisseur. Éléments redactés : équipe ADABU, détails opérationnels, ventilation budget ETIC.``

Sprint de production : 05/05 → 11/05/2026.

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue 6
"@
Create-Issue 7 "[DOC] PITCH-DECK-INVESTISSEUR.pptx — 15-18 slides adaptées depuis exec-deck" "lane/docs,priority/P1,scope/externe,type/doc" "V1" $body7

# ----------------------------------------------------------------------------
#  ISSUE 8 — Pitch client (parqué V2)
# ----------------------------------------------------------------------------
$body8 = @"
Contexte
--------
Livrable parqué en S5 atelier cohérence.
Audience "client potentiel" ouverte post-V1 uniquement. Pas de commercialisation externe avant V2.

À ré-ouvrir quand
-----------------
- V1 cloud disponible ET retour terrain de 2-3 CEO pairs exploitables ET décision produit de commercialiser.

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue parqueur.
"@
Create-Issue 8 "[DOC-PARQUE] PITCH-CLIENT.md — post-V1" "lane/docs,priority/P3,scope/externe,status/parked,type/doc" "V2" $body8

# ----------------------------------------------------------------------------
#  ISSUE 9 — Kit partenaire tech (parqué V2)
# ----------------------------------------------------------------------------
$body9 = @"
Contexte
--------
Livrable parqué en S5 atelier cohérence.
Audience "partenaire tech" ouverte post-V2 (intégration Graph API + Supabase stabilisée).

À ré-ouvrir quand
-----------------
- V2 sortie ET architecture Graph + Supabase + Inngest éprouvée sur 3 mois minimum ET décision produit d'ouvrir un programme partenaires.

Source
------
Session S5 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S5-livrables-externes.md §9`` issue parqueur.
"@
Create-Issue 9 "[DOC-PARQUE] KIT-PARTENAIRE-TECH.md — post-V2" "lane/docs,priority/P3,scope/externe,status/parked,type/doc" "V2" $body9

# ----------------------------------------------------------------------------
#  ISSUE 10 — OpenAPI (Sprint 3-4)
# ----------------------------------------------------------------------------
$body10 = @"
Contexte
--------
ADR 2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook.
Bascule "hand-written → généré" pour ``03_mvp/docs/openapi.yaml``.

Version hand-written produite en sprint S2 du plan audit (12/05 → 18/05/2026, ~1,5 j de travail doc sur SPEC-TECHNIQUE-FUSION §6, ~40 endpoints / 14 domaines).
Cette issue pilote la bascule automatique en Sprint 3-4 de la fusion v0.5.

À faire (Sprint 3-4 fusion v0.5)
--------------------------------
- [ ] Ajouter la dépendance ``zod-to-openapi`` (la dépendance ``zod`` est déjà prévue en fusion v0.5 per SPEC-TECHNIQUE-FUSION §9)
- [ ] Typer les routes Express avec ``zod`` (schémas request/response)
- [ ] Script ``scripts/gen-openapi.js`` qui génère ``03_mvp/docs/openapi.yaml`` depuis les schémas Zod
- [ ] CI check drift : si ``openapi.yaml`` committé ≠ version générée → fail
- [ ] Retirer la version hand-written de mai — le fichier ``openapi.yaml`` devient 100 % auto-généré
- [ ] Mettre à jour ``03_mvp/docs/ONBOARDING-DEV.md`` pour expliquer la génération

Critères d'acceptation
----------------------
- ``openapi.yaml`` généré couvre les ~40 endpoints cataloguées en SPEC-TECHNIQUE-FUSION §6
- Pas de dérive silencieuse (CI bloque)
- Dev qui ajoute une route ajoute un schéma Zod → OpenAPI mis à jour automatiquement

Source
------
Session S6 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S6-livrables-dev.md §7``
"@
Create-Issue 10 "[INFRA] OpenAPI 3.0 généré depuis code (Zod + zod-to-openapi)" "lane/infra,priority/P1,phase/v0.5,type/infra" "V1" $body10

# ----------------------------------------------------------------------------
#  ISSUE 11 — Husky pre-commit
# ----------------------------------------------------------------------------
$body11 = @"
Contexte
--------
ADR 2026-04-24 · Pipeline tokens DS → CSS + maintien unifié.
Actuellement ``npm run ds:export`` est **manuel** — un dev peut oublier et committer ``tokens.json`` sans régénérer ``colors_and_type.css``.

Cette issue pilote l'automatisation en Sprint 3 v0.5 (quand Husky arrive dans la stack per SPEC-TECHNIQUE-FUSION §9).

À faire (Sprint 3 fusion v0.5)
------------------------------
- [ ] Installer ``husky`` à la racine du repo (ou dans ``02_design-system/`` selon décision d'équipe)
- [ ] Configurer pre-commit hook :
  ``````
  if git diff --cached --name-only | grep -q "02_design-system/tokens.json"; then
    (cd 02_design-system && npm run ds:export) || exit 1
    git add 02_design-system/colors_and_type.css 03_mvp/public/assets/colors_and_type.css
  fi
  ``````
- [ ] Tester sur un commit qui touche tokens.json → CSS régénéré automatiquement
- [ ] Documenter dans ``00_BOUSSOLE/GOUVERNANCE.md`` (section "Chemin type d'un changement de token" — retirer le marqueur "Parqué")

Critères d'acceptation
----------------------
- Un commit qui touche ``tokens.json`` régénère automatiquement les 2 fichiers CSS et les ajoute au commit
- Un commit qui ne touche pas ``tokens.json`` n'exécute pas le script (pas de ralentissement)
- Le chemin type dans GOUVERNANCE passe de 7 étapes manuelles à 6 (étape 3 devient automatique)

Source
------
Session S7 atelier cohérence · ``04_docs/_atelier-2026-04-coherence/sessions/S7-ds-process-silos.md §5``
"@
Create-Issue 11 "[INFRA] Pre-commit hook Husky — régénère ds:export si tokens.json modifié" "lane/infra,priority/P2,phase/v0.5,type/infra" "V1" $body11

# --- 4. Cleanup --------------------------------------------------------------
Remove-Item -Recurse -Force $tmpDir

Write-Host ""
Write-Host "==> Terminé. Vérifie sur https://github.com/$repo/issues" -ForegroundColor Green
