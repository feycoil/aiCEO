# ================================================================
# setup-github-issues.ps1 -- Migration backlog -> GitHub Issues
# ================================================================
# Genere labels, milestones et ~80 issues sur feycoil/aiCEO a partir
# du backlog xlsx (42 features F1-F42) + Option 2 (tactiques).
#
# Usage (dans C:\_workarea_local\aiCEO) :
#   # Dry-run d'abord pour verifier ce qui va etre cree
#   powershell -ExecutionPolicy Bypass -File .\_scratch\setup-github-issues.ps1 -DryRun
#   # Puis pour de vrai
#   powershell -ExecutionPolicy Bypass -File .\_scratch\setup-github-issues.ps1
#
# Idempotent : labels forces (ecrasent si existent).
# Milestones et issues : echoue si doublon -- executer une seule fois.
#
# NOTE : script en ASCII pur pour eviter les problemes d'encodage
# PowerShell 5.1 Windows (UTF-8 sans BOM lu en Windows-1252).
# ================================================================

[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$REPO = 'feycoil/aiCEO'

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Dry($msg)  { Write-Host "  [DRY] $msg" -ForegroundColor DarkGray }
function Write-Warn($msg) { Write-Host "  [!] $msg" -ForegroundColor Yellow }

# ================================================================
# Pre-checks
# ================================================================
Write-Step 'Pre-checks'

try { gh --version | Out-Null } catch { throw "GitHub CLI non installe." }
Write-Ok 'gh present'

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) { throw "gh non authentifie. Lance 'gh auth login'." }
Write-Ok 'gh authentifie'

$remote = git remote get-url origin 2>&1
if ($remote -notmatch 'aiCEO') { throw "Remote 'origin' ne pointe pas sur aiCEO : $remote" }
Write-Ok "remote origin : $remote"

if ($DryRun) { Write-Warn 'Mode DRY-RUN -- aucune modification ne sera faite sur GitHub' }

# ================================================================
# PHASE 1 -- LABELS (29)
# ================================================================
Write-Step 'Phase 1/4 -- Labels'

$labels = @(
    # Phases (milestones en doublon pour filtre rapide)
    @{ n='phase/mvp'; c='FFCE83'; d='Phase MVP (T2 2026)' }
    @{ n='phase/v1';  c='FFAB40'; d='Phase V1 (T3-T4 2026)' }
    @{ n='phase/v2';  c='FF6E40'; d='Phase V2 (T1-T2 2027)' }
    @{ n='phase/v3';  c='6C5CE7'; d='Phase V3 (T3-T4 2027)' }

    # Lanes techniques
    @{ n='lane/app-web';        c='B89BD9'; d='Front app web (01_app-web)' }
    @{ n='lane/mvp-backend';    c='E8604C'; d='Backend MVP Node (03_mvp)' }
    @{ n='lane/design-system';  c='E8B54C'; d='Design system Twisty (02_design-system)' }
    @{ n='lane/docs';           c='8EA7C4'; d='Documentation (04_docs, 00_BOUSSOLE)' }
    @{ n='lane/infra';          c='546E7A'; d='CI/CD, tooling, dette technique' }

    # Domaines produit (6 simplifies)
    @{ n='domain/core';         c='0052CC'; d='Fondation, rituels, workflows' }
    @{ n='domain/ia';           c='5319E7'; d='IA, delegation, tracabilite' }
    @{ n='domain/ux';           c='EC4899'; d='Design, visualisations, interactions' }
    @{ n='domain/integration';  c='0891B2'; d='Outlook, Teams, SharePoint' }
    @{ n='domain/tech';         c='374151'; d='Infra, scalabilite, compliance' }
    @{ n='domain/wellbeing';    c='10B981'; d='Coaching, burnout, bien-etre' }

    # Types d'issues
    @{ n='type/epic';       c='3E4B9A'; d='Feature macro (xlsx F1-F42)' }
    @{ n='type/feat';       c='0E8A16'; d='Nouvelle fonctionnalite' }
    @{ n='type/fix';        c='D93F0B'; d='Correction de bug' }
    @{ n='type/chore';      c='FBCA04'; d='Maintenance, refactor, tooling' }
    @{ n='type/docs';       c='1D76DB'; d='Documentation' }
    @{ n='type/research';   c='6F42C1'; d='Recherche/exploration non engagee' }

    # Priorites (repris scoring RICE xlsx)
    @{ n='prio/P0'; c='B60205'; d='Bloquant -- a faire immediatement' }
    @{ n='prio/P1'; c='D93F0B'; d='Haute -- iteration courante' }
    @{ n='prio/P2'; c='FBCA04'; d='Moyenne -- a planifier' }
    @{ n='prio/P3'; c='C5DEF5'; d='Basse -- nice to have' }

    # Speciaux
    @{ n='quick-win';       c='0E8A16'; d='RICE eleve x effort faible' }
    @{ n='blocked';         c='000000'; d='Bloque par une dependance' }
    @{ n='needs-research';  c='6F42C1'; d='Necessite exploration avant engagement' }
    @{ n='risk-tracked';    c='D4C5F9'; d='Lie a un risque identifie (xlsx R1-R12)' }
)

foreach ($l in $labels) {
    if ($DryRun) {
        Write-Dry "label $($l.n) [#$($l.c)]"
    } else {
        gh label create $l.n --color $l.c --description $l.d --force --repo $REPO 2>&1 | Out-Null
        Write-Ok "label $($l.n)"
    }
}

# ================================================================
# PHASE 2 -- MILESTONES (4)
# ================================================================
Write-Step 'Phase 2/4 -- Milestones'

$milestones = @(
    @{ title='MVP'; desc='Cockpit + societes + agenda + taches + Outlook + copilote reactif + delegation + kill switch. T2 2026, 132 kEUR.' }
    @{ title='V1';  desc='Copilote proactif (Inngest) + memoire LT (pgvector) + rituels complets + SharePoint + viz riches. T3-T4 2026, 290 kEUR.' }
    @{ title='V2';  desc='Multi-tenant + delegation e2e + Teams + canvas IA + graphe + SOC 2 pre-requis. T1-T2 2027, 693 kEUR.' }
    @{ title='V3';  desc='Coach strategique + burnout actif + offline + mobile + multi-CEO + SOC 2 full. T3-T4 2027, 598 kEUR.' }
)

$milestoneNumbers = @{}
foreach ($m in $milestones) {
    if ($DryRun) {
        Write-Dry "milestone $($m.title)"
        $milestoneNumbers[$m.title] = 0
    } else {
        $r = gh api "repos/$REPO/milestones" -X POST -f title="$($m.title)" -f description="$($m.desc)" -f state='open' 2>&1 | ConvertFrom-Json
        $milestoneNumbers[$m.title] = $r.number
        Write-Ok "milestone $($m.title) (#$($r.number))"
    }
}

# ================================================================
# PHASE 3 -- ISSUES
# ================================================================
# Helper pour creer une issue et capturer son numero
function New-Issue {
    param(
        [string]$Title,
        [string]$Body,
        [string[]]$Labels,
        [string]$Milestone
    )
    if ($DryRun) {
        $preview = "$Title | labels=[$($Labels -join ',')]"
        if ($Milestone) { $preview += " | milestone=$Milestone" }
        Write-Dry $preview
        return 0
    }
    $ghArgs = @('issue', 'create', '--repo', $REPO, '--title', $Title, '--body', $Body, '--label', ($Labels -join ','))
    if ($Milestone) { $ghArgs += @('--milestone', $Milestone) }
    $url = & gh @ghArgs
    if ($url -match '/issues/(\d+)$') {
        $num = [int]$Matches[1]
        Write-Ok "#$num  $Title"
        return $num
    }
    throw "Echec creation : $Title"
}

# ----------------------------------------------------------------
# PHASE 3A -- EPIC #0 Infrastructure & DX (parent des tactiques infra)
# ----------------------------------------------------------------
Write-Step 'Phase 3a/4 -- Epic transverse Infrastructure & DX'

$epicInfraBody = @'
**Epic transverse** -- hygiene CI/CD, tooling, dette technique.

Regroupe toutes les taches d'infrastructure sans lien direct avec une feature produit :
CI GitHub Actions, Dependabot, README enrichi, CONTRIBUTING, tests unitaires et e2e,
refactor modules, securisation .env, etc.

**Pas de milestone fixe** : les sous-taches sont priorisees individuellement.

**Enfants** : voir les issues `Part of #` pointant vers cette issue.
'@

$epicInfraNumber = New-Issue `
    -Title '[Epic] Infrastructure & DX' `
    -Body $epicInfraBody `
    -Labels @('type/epic', 'domain/tech', 'lane/infra')

# ----------------------------------------------------------------
# PHASE 3B -- 42 EPICS F1-F42
# ----------------------------------------------------------------
Write-Step 'Phase 3b/4 -- 42 Epics produit (F1-F42)'

# Format : id / title / milestone / prio / domain / rice / status / desc / accept / extra
$epics = @(
    # --- MVP (10) ---
    @{ id='F1';  title='Cockpit consolide'; m='MVP'; p='P0'; dom='core'; rice='R10 x I3 x C0.9 / E2 = 13.5'; st='shipped';
       desc="Page d'accueil avec intention, Big Rocks, taches, RDV, props IA.";
       accept='Lecture sous 10s, actions sous 30s, 5 widgets.';
       extra='Etat : [DONE] Shipped v0.4 (01_app-web/index.html)' }
    @{ id='F2';  title='Vue par societe'; m='MVP'; p='P0'; dom='core'; rice='R10 x I3 x C0.9 / E2 = 13.5'; st='shipped';
       desc='Page dediee par entite (Adabu, Start, AMANI, ETIC) avec intention, decisions, chantiers, equipe.';
       accept='Navigation fluide, filtres operationnels.';
       extra='Etat : [DONE] Shipped v0.4 (groupes.html + 9 pages projet)' }
    @{ id='F3';  title='Revue hebdo manuelle'; m='MVP'; p='P0'; dom='core'; rice='R10 x I3 x C0.85 / E2 = 12.8'; st='shipped';
       desc='Ecran de revue hebdo avec Big Rocks, bilan S-1, cap S+1.';
       accept='Template rempli en moins de 15min.';
       extra='Etat : [DONE] Shipped v0.4 (06_revues/index.html + widget W17)' }
    @{ id='F4';  title='Agenda consolide'; m='MVP'; p='P0'; dom='core'; rice='R10 x I3 x C0.9 / E2 = 13.5'; st='shipped';
       desc='Grille 7j x heures, events multi-sources (Outlook + perso), portlets Twisty.';
       accept='Affichage 7 jours, categorisation visuelle.';
       extra='Etat : [DONE] Shipped v0.4 (agenda.html hebdo)' }
    @{ id='F5';  title='Taches unifiees'; m='MVP'; p='P0'; dom='core'; rice='R10 x I3 x C0.9 / E2 = 13.5'; st='shipped';
       desc='Liste multi-sources, filtres, bouton deleguer.';
       accept='Liste filtrable, tri multi-criteres.';
       extra='Etat : [DONE] Shipped v0.4 (taches.html + Eisenhower)' }
    @{ id='F6';  title='Integration Outlook (Mail + Calendar)'; m='MVP'; p='P0'; dom='integration'; rice='R10 x I3 x C0.95 / E3 = 9.5'; st='partial';
       desc='OAuth Entra ID, delta sync 15min, Mail.Read + Calendars.Read.';
       accept='Sync fiable, renouvellement tokens auto.';
       extra='Etat : [PARTIAL] PowerShell COM (pas OAuth Entra), 30j one-shot. Migrer vers Graph API.' }
    @{ id='F7';  title='Copilote reactif (chat)'; m='MVP'; p='P0'; dom='ia'; rice='R10 x I3 x C0.85 / E3 = 8.5'; st='partial';
       desc='Chat lateral qui repond, redige brouillons, resume.';
       accept='Reponse sous 3s, tracabilite sources.';
       extra='Etat : [PARTIAL] assistant.html est statique, pas de vrai chat live.' }
    @{ id='F8';  title='Delegation assistee'; m='MVP'; p='P0'; dom='ia'; rice='R10 x I3 x C0.9 / E3 = 9.0'; st='shipped';
       desc='Bouton deleguer, brief IA pre-redige, mail envoye, suivi cree.';
       accept='Brief genere en moins de 5s, suivi automatique.';
       extra='Etat : [DONE] Shipped v0.4 (03_mvp/src/drafts.js + modale UI).' }
    @{ id='F9';  title='Tracabilite minimale'; m='MVP'; p='P0'; dom='ia'; rice='R10 x I2.5 x C0.9 / E1 = 22.5'; st='partial';
       desc='Chaque prop a source, bouton pourquoi, historique.';
       accept='100% des props ont source affichee.';
       extra='Etat : [PARTIAL] source-link dans app-web ; pas encore dans le MVP backend.' }
    @{ id='F42'; title='Kill switch copilote'; m='MVP'; p='P0'; dom='ia'; rice='R10 x I3 x C0.95 / E1 = 28.5 (quick-win)'; st='todo';
       desc="Bouton 'suspendre 1h/1j/indefini' dans settings.";
       accept='Effet immediat, aucune prop pendant la suspension.';
       extra='[!] **Bloquant MVP** -- Score RICE le plus eleve du backlog, effort 1 sem. A faire en priorite.' }

    # --- V1 (11) ---
    @{ id='F10'; title='Copilote proactif (Inngest)'; m='V1'; p='P0'; dom='ia'; rice='R10 x I3 x C0.7 / E5 = 4.2'; st='todo';
       desc='Jobs scheduled + webhooks. Sub-agents mail/cal/task/deleg/prep/review.';
       accept='15 props/j stable, 0 plantage/sem.';
       extra='Epine dorsale V1 -- transformation MVP (reactif) vers copilote proactif.' }
    @{ id='F11'; title='Memoire long-terme (pgvector)'; m='V1'; p='P0'; dom='ia'; rice='R10 x I2.5 x C0.7 / E4 = 4.4'; st='todo';
       desc='3 strates (identity/preference/episode), resumes roulants hebdo.';
       accept='Strates separees, recuperation sous 200ms.';
       extra='Supabase + pgvector. Permet au copilote de se souvenir semaine apres semaine.' }
    @{ id='F12'; title='Rituels integres'; m='V1'; p='P0'; dom='core'; rice='R10 x I3 x C0.85 / E2 = 12.8'; st='partial';
       desc='Matin (check-in + top 3), soir (shutdown), dimanche (revue auto).';
       accept='Adoption superieure a 80% jours ouvres.';
       extra='Etat : [PARTIAL] matin OK + soir OK (MVP), rituel dimanche a faire.' }
    @{ id='F13'; title='Delegation pro (matrice confiance)'; m='V1'; p='P0'; dom='ia'; rice='R10 x I3 x C0.8 / E3 = 8.0'; st='todo';
       desc='Matrice silencieuse par equipier, proprietaire naturel, suivi J+2/J+5.';
       accept='Au moins 5 taches deleguees par semaine.';
       extra='Evolution de F8 -- la delegation devient personnalisee par equipier.' }
    @{ id='F14'; title='Tracabilite totale (Langfuse)'; m='V1'; p='P1'; dom='ia'; rice='R10 x I2 x C0.85 / E2 = 8.5'; st='todo';
       desc='Logs agent, UI pourquoi, dashboard transparence visible CEO.';
       accept='100% actions auditables.';
       extra='Langfuse self-hosted. Depend de F8/F10 en amont.' }
    @{ id='F15'; title='Integration SharePoint (RAG)'; m='V1'; p='P1'; dom='integration'; rice='R10 x I2 x C0.8 / E3 = 5.3'; st='todo';
       desc='Indexation docs, embeddings Voyage-3, permissions trimmees.';
       accept='Recherche sous 1s, 0 fuite perm.';
       extra='Voyage-3 via API. RLS sur les chunks.' }
    @{ id='F16'; title='Detection burnout (signaux faibles)'; m='V1'; p='P1'; dom='wellbeing'; rice='R10 x I3 x C0.55 / E4 = 4.1'; st='todo';
       desc='Croisement mails apres 22h, weekends actifs, humeur, taux accept.';
       accept='Alertes moins de 2 par mois, 0 faux positif.';
       extra='Signaux doux (pas d''alarme). Evolution : F31 (V3) = intervention active.' }
    @{ id='F18'; title='Design system etendu'; m='V1'; p='P1'; dom='ux'; rice='R10 x I2.5 x C0.85 / E2 = 10.6'; st='partial';
       desc='Drawer, view switcher, source pill, command palette Cmd+K.';
       accept='Composants documentes.';
       extra='Etat : [PARTIAL] drawer OK, Cmd+K OK, source pill OK. Reste view switcher + doc exhaustive.' }
    @{ id='F19'; title='Visualisations riches'; m='V1'; p='P0'; dom='ux'; rice='R10 x I3 x C0.8 / E3 = 8.0'; st='todo';
       desc='Carte radiale societes, arbre Big Rocks, timeline decisions.';
       accept='3 viz operationnelles, bascule sous 100ms.';
       extra='D3 ou Plotly. Pas de dependance forte SolidJS.' }
    @{ id='F39'; title='Streak du repos'; m='V1'; p='P2'; dom='wellbeing'; rice='R10 x I1.5 x C0.85 / E1 = 12.8'; st='partial';
       desc='Badge jours shutdown, weekends off, nuits 7h+.';
       accept='Affichage discret, pas de pression.';
       extra='Etat : [PARTIAL] moteur gamif existe (tasks #54), etendre aux signaux repos.' }
    @{ id='F40'; title='NON bienveillant sur saturation'; m='V1'; p='P0'; dom='wellbeing'; rice='R10 x I2.5 x C0.85 / E2 = 10.6'; st='todo';
       desc='Alerte quand ajout tache depasse capacite, 3 options (decaler/deleguer/annuler).';
       accept='Affiche sur 100% des saturations.';
       extra='**Central UX psycho** -- la differentiation vs Motion/Reclaim. Ne pas sous-estimer.' }

    # --- V2 (11) ---
    @{ id='F20'; title='Multi-tenant Supabase (RLS)'; m='V2'; p='P0'; dom='tech'; rice='R5 x I3 x C0.85 / E4 = 3.2'; st='todo';
       desc='Isolation par org, roles CEO/DG/AE/manager/collab.';
       accept='0 fuite cross-tenant, RLS teste.';
       extra='Pre-requis V2. Migration SQLite vers Postgres.' }
    @{ id='F21'; title='Vues role-specifiques'; m='V2'; p='P0'; dom='ux'; rice='R5 x I3 x C0.8 / E3 = 4.0'; st='todo';
       desc='AE voit agenda+taches, DG voit decisions+projets, CEO voit tout.';
       accept='Matrice permissions documentee.';
       extra='Necessite F20 (RLS).' }
    @{ id='F22'; title='Delegation end-to-end'; m='V2'; p='P0'; dom='ia'; rice='R5 x I3 x C0.75 / E4 = 2.8'; st='todo';
       desc='Tache deleguee apparait chez destinataire, suivi bilateral.';
       accept='Cycle complet teste 20 taches.';
       extra='Complete F8/F13. Necessite multi-tenant F20.' }
    @{ id='F23'; title='Integration Teams'; m='V2'; p='P1'; dom='integration'; rice='R5 x I2.5 x C0.75 / E3 = 3.1'; st='todo';
       desc='Messages directs, mentions, presence, ping equipier.';
       accept='Sync temps reel sous 2s.';
       extra='Graph API Teams. Ecriture optionnelle au debut.' }
    @{ id='F24'; title='Comite strategique integre'; m='V2'; p='P1'; dom='core'; rice='R2 x I3 x C0.65 / E4 = 1.0'; st='todo';
       desc='ODJ + briefs IA + canvas decision + PV auto + suivis.';
       accept='Comite prepare en moins de 30min.';
       extra='Workflow avance. Reach faible (usage CEO principalement).' }
    @{ id='F25'; title='Canvas tldraw + agent visible'; m='V2'; p='P0'; dom='ux'; rice='R10 x I2.5 x C0.6 / E6 = 2.5'; st='todo';
       desc='Pensee visuelle collaborative, agent reorganise.';
       accept='Latence agent sous 500ms, collab temps reel.';
       extra='Brique pensee graphique. tldraw v2 + Yjs.' }
    @{ id='F26'; title='Graphe Cytoscape'; m='V2'; p='P1'; dom='ux'; rice='R10 x I2.5 x C0.75 / E3 = 6.3'; st='todo';
       desc='Reseau parties prenantes, dependances inter-projets.';
       accept='Navigation fluide 100+ noeuds.';
       extra='Cytoscape.js. Lie a F19 visualisations riches.' }
    @{ id='F27'; title='Dashboard equipe'; m='V2'; p='P2'; dom='ux'; rice='R5 x I2 x C0.7 / E2 = 3.5'; st='todo';
       desc='Matrice charge/confiance par equipier.';
       accept='Charges a jour sous 1j.';
       extra='Necessite F20 + F13.' }
    @{ id='F37'; title='Bouton visualiser (Napkin pattern)'; m='V2'; p='P1'; dom='ux'; rice='R10 x I2.5 x C0.7 / E3 = 5.8'; st='todo';
       desc='Selection texte -> 4-6 variantes de schemas, inserables inline.';
       accept='Generation sous 5s, 6 gabarits.';
       extra='Inspire Napkin AI. Brique pensee graphique.' }
    @{ id='F38'; title='Mode surcharge detectee'; m='V2'; p='P2'; dom='wellbeing'; rice='R10 x I2.5 x C0.65 / E2 = 8.1'; st='todo';
       desc='UI simplifiee auto quand signaux convergents.';
       accept='Activation correcte 90% des cas.';
       extra='Depend F16 (detection signaux).' }
    @{ id='F41'; title='Recadrage cognitif (ACT light)'; m='V2'; p='P2'; dom='wellbeing'; rice='R10 x I2 x C0.7 / E2 = 7.0'; st='todo';
       desc='Drawer tache retard : reframe en 3 options (inutile/difficile/moins imp).';
       accept='Teste 10 taches, 60% resolution.';
       extra='ACT = Acceptance and Commitment Therapy. Leger, optionnel.' }

    # --- V3 (9) ---
    @{ id='F28'; title='SOC 2 Type II'; m='V3'; p='P0'; dom='tech'; rice='R5 x I3 x C0.9 / E4 = 3.4'; st='todo';
       desc='Audit Vanta/Drata, conformite RGPD complete.';
       accept='Certification obtenue.';
       extra='[!] Deplacee de V2 vers V3 (decision 2026-04-24) : utile seulement avec client entreprise.' }
    @{ id='F29'; title='Coach conversationnel'; m='V3'; p='P1'; dom='wellbeing'; rice='R10 x I2.5 x C0.5 / E5 = 2.5'; st='todo';
       desc='Modes arbitrage / coince / revue stoique (Claude Opus).';
       accept='3 scenarios testes, 70% satisfaction.';
       extra='Claude Opus 4+ pour nuance emotionnelle.' }
    @{ id='F30'; title='Journal de reconnaissance'; m='V3'; p='P2'; dom='wellbeing'; rice='R10 x I1.5 x C0.8 / E1 = 12.0'; st='todo';
       desc='Module 3 reconnaissances/j, visible sur demande.';
       accept='Integration discrete.';
       extra='Base sur Seligman (psycho positive). Quick-win V3.' }
    @{ id='F31'; title='Detection burnout active'; m='V3'; p='P1'; dom='wellbeing'; rice='R10 x I3 x C0.55 / E4 = 4.1'; st='todo';
       desc='Interventions graduees : question -> nudge -> bloc focus -> journee off.';
       accept='Taux faux positif sous 5%.';
       extra='Evolution F16. Sensible -- a co-designer avec psy.' }
    @{ id='F32'; title='Boite a outils psycho'; m='V3'; p='P2'; dom='wellbeing'; rice='R10 x I2 x C0.8 / E3 = 5.3'; st='todo';
       desc='Respiration, meditations, recadrage, carnet victoires.';
       accept='5 outils disponibles.';
       extra='Pack bien-etre. Peut etre plugin externe.' }
    @{ id='F33'; title='Post-mortem automatique'; m='V3'; p='P2'; dom='wellbeing'; rice='R10 x I2 x C0.7 / E2 = 7.0'; st='todo';
       desc='Retro structuree sur Big Rock echoue ou decision non concretisee.';
       accept='Template utile teste 5 cas.';
       extra='Apprentissage organisationnel.' }
    @{ id='F34'; title='Offline-first (ElectricSQL)'; m='V3'; p='P1'; dom='tech'; rice='R10 x I2.5 x C0.65 / E5 = 3.3'; st='todo';
       desc='Sync Postgres <-> SQLite, usage en avion.';
       accept='Cas avion 2h sans reseau OK.';
       extra='ElectricSQL ou PowerSync. Important pour mobile.' }
    @{ id='F35'; title='App mobile compagnon'; m='V3'; p='P1'; dom='tech'; rice='R10 x I2.5 x C0.7 / E6 = 2.9'; st='todo';
       desc='iOS+Android PWA, lecture rapide, capture vocale.';
       accept='Actions cles sous 30s mobile.';
       extra='PWA plutot que native (budget). Necessite F34.' }
    @{ id='F36'; title='Multi-CEO (ecosysteme ETIC)'; m='V3'; p='P1'; dom='tech'; rice='R3 x I3 x C0.7 / E3 = 2.1'; st='todo';
       desc='Ouverture 2-3 CEO, isolation stricte.';
       accept='Onboarding sous 1j, isolation 100%.';
       extra='Hypothese commerciale. Valide le modele avant ouverture large.' }

    # --- No milestone (research) ---
    @{ id='F17'; title='Migration SolidJS'; m=$null; p='P2'; dom='tech'; rice='R10 x I2 x C0.75 / E6 = 2.5'; st='research';
       desc='Islands architecture, cockpit puis pages societes.';
       accept='Parite fonctionnelle, perf +20%.';
       extra='[!] Mute en research (decision 2026-04-24) : 6 sem pour +20% perf, a valider seulement si probleme perf avere. Tant que vanilla JS tient, on garde.' }
)

# Detecter les lanes par domaine (default app-web, override pour mvp-backend)
$domToLane = @{
    'core'        = 'app-web'
    'ia'          = 'mvp-backend'
    'integration' = 'mvp-backend'
    'ux'          = 'app-web'
    'tech'        = 'mvp-backend'
    'wellbeing'   = 'app-web'
}

$epicNumbers = @{}
foreach ($e in $epics) {
    $phaseLine = if ($e.m) { "**Phase** : $($e.m)" } else { "**Phase** : -- (research, pas de milestone)" }
    $body = @"
**Feature xlsx** : $($e.id)
**Score RICE** : $($e.rice)
**Domaine** : $($e.dom)
$phaseLine

## Description

$($e.desc)

## Criteres d'acceptation

$($e.accept)

## Contexte

$($e.extra)

---
*Cree par ``setup-github-issues.ps1`` le 2026-04-24. Source : ``04_docs/09-backlog.xlsx`` ligne $($e.id).*
"@

    $labelList = @('type/epic', "prio/$($e.p)", "domain/$($e.dom)", "lane/$($domToLane[$e.dom])")
    if ($e.m) { $labelList += "phase/$($e.m.ToLower())" }
    if ($e.st -eq 'research') { $labelList += @('type/research', 'needs-research') }
    if ($e.rice -match 'quick-win') { $labelList += 'quick-win' }
    if ($e.id -eq 'F42') { $labelList += 'quick-win' }

    $num = New-Issue -Title "[$($e.id)] $($e.title)" -Body $body -Labels $labelList -Milestone $e.m
    $epicNumbers[$e.id] = $num
}

# ----------------------------------------------------------------
# PHASE 3C -- TACTICAL ISSUES (~35)
# ----------------------------------------------------------------
Write-Step 'Phase 3c/4 -- Issues tactiques'

# Chaque tactique peut etre liee a un epic parent via "Part of #<num>"
$tacticals = @(
    # Tactiques rattachees a des epics xlsx
    @{ title='Scan Outlook incremental (delta depuis last-sync)'; parent='F6'; m='MVP'; p='P1'; type='feat'; lane='mvp-backend'; dom='integration';
       desc='Remplacer le scan 30j one-shot par un delta incremental. Complete F6. Base pour la migration Entra ID.' }
    @{ title='Widget Outlook : carte matin du cockpit'; parent='F6'; m='V1'; p='P3'; type='feat'; lane='mvp-backend'; dom='integration';
       desc='Mini widget pour integrer directement Outlook (popup ou add-in) montrant les top 3 du matin.' }
    @{ title='Chat live temps reel dans assistant.html'; parent='F7'; m='MVP'; p='P1'; type='feat'; lane='app-web'; dom='ia';
       desc='Passer de assistant.html statique a un vrai chat live streaming avec Claude. WebSocket ou SSE.' }
    @{ title="Integrer le calendrier Outlook dans l'arbitrage matinal"; parent='F7'; m='MVP'; p='P1'; type='feat'; lane='mvp-backend'; dom='ia';
       desc='Les RDV du jour doivent etre visibles dans la 1ere colonne de 03_mvp/public/index.html (arbitrage).' }
    @{ title='Source-link dans le MVP backend (/api/arbitrage)'; parent='F9'; m='MVP'; p='P1'; type='feat'; lane='mvp-backend'; dom='ia';
       desc='Chaque tache/brouillon retourne par le backend doit inclure source: {type, id, uri} pour le lien source.' }
    @{ title='Historique arbitrages matinaux (JSON dates)'; parent='F11'; m='MVP'; p='P1'; type='feat'; lane='mvp-backend'; dom='ia';
       desc='Persister chaque arbitrage dans 03_mvp/data/history/YYYY-MM-DD.json. Base future pour F11 memoire LT.' }
    @{ title='Fix : reselection des taches differees apres reload'; parent='F5'; m='MVP'; p='P1'; type='fix'; lane='app-web'; dom='core';
       desc="Bug observe durant le run MVP 2026-04 : les taches 'differe' perdent leur etat apres reload. taches.html." }
    @{ title='Ameliorer inference projet (moins de 20% erreurs vs 30% actuel)'; parent='F10'; m='V1'; p='P2'; type='feat'; lane='mvp-backend'; dom='ia';
       desc="Actuellement prompt.js a ~30% d'erreur de mapping tache vers projet. Objectif V1 : moins de 20%." }
    @{ title="Detection auto d'engagements pris dans les mails"; parent='F10'; m='V1'; p='P2'; type='feat'; lane='mvp-backend'; dom='ia';
       desc="Parser Sent pour detecter 'je m''occupe de X', 'je te reviens', etc. -> proposer des taches." }
    @{ title='Bouton Synthese de la semaine (rituel dimanche)'; parent='F12'; m='V1'; p='P1'; type='feat'; lane='mvp-backend'; dom='core';
       desc='Genere une synthese hebdo auto-generee par Claude le dimanche matin. Complete F12.' }
    @{ title='Rapport hebdo auto-genere par Claude'; parent='F12'; m='V1'; p='P1'; type='feat'; lane='mvp-backend'; dom='core';
       desc='Remplacer la revue manuelle (06_revues/) par une revue semi-auto : Claude redige, utilisateur amende.' }
    @{ title='Compteur cout API Anthropic (jour + mois)'; parent='F14'; m='MVP'; p='P2'; type='feat'; lane='mvp-backend'; dom='ia';
       desc='Afficher dans evening.html le cout cumule du jour + du mois. Lien vers le dashboard Anthropic.' }
    @{ title='Drag & drop inter-quadrants dans vue Eisenhower'; parent='F5'; m='V1'; p='P2'; type='feat'; lane='app-web'; dom='ux';
       desc='Permettre de deplacer les taches entre les 4 quadrants (U/I, U/-, -/I, -/-) dans taches.html.' }
    @{ title='Mode focus (timer pomodoro + silence notifications)'; parent='F38'; m='V1'; p='P2'; type='feat'; lane='app-web'; dom='wellbeing';
       desc='Precurseur de F38. Bouton focus qui lance un timer 25min + cache notifications.' }
    @{ title='Skin Twisty applique sur toutes les pages MVP'; parent='F18'; m='V1'; p='P1'; type='chore'; lane='design-system'; dom='ux';
       desc='Les pages 03_mvp/public/*.html utilisent encore un style basique. Appliquer le skin Twisty.' }

    # Tactiques sans epic (transverse produit)
    @{ title="Export PDF d'une revue hebdo"; parent=$null; m='V1'; p='P3'; type='feat'; lane='app-web'; dom='ux';
       desc="Bouton d'export d'une revue (page 06_revues/) en PDF stylise pour archive ou partage." }
    @{ title='i18n fr/en (preparer ouverture future)'; parent=$null; m='V2'; p='P3'; type='chore'; lane='app-web'; dom='ux';
       desc='Extraire les strings, systeme de dictionnaire, detection langue. Pre-requis ouverture non-FR.' }
    @{ title='Onboarding guide au premier lancement'; parent=$null; m='V1'; p='P2'; type='feat'; lane='app-web'; dom='ux';
       desc='Tour des 5 Big Rocks en 3-4 ecrans. Affiche uniquement la premiere fois.' }
    @{ title='Spec fonctionnelle fusion app web + MVP'; parent=$null; m='MVP'; p='P0'; type='docs'; lane='docs'; dom='core';
       desc='Documenter precisement : quelles pages du MVP remplacent quelles pages app-web ? Quel workflow unifie ?' }
    @{ title='Spec technique fusion app web + MVP'; parent=$null; m='MVP'; p='P0'; type='docs'; lane='docs'; dom='tech';
       desc='MVP Node Express devient backend unique. App web consomme /api/*. Migration localStorage vers SQLite.' }
    @{ title="Doc d'installation non-tech (video + PDF)"; parent=$null; m='V1'; p='P1'; type='docs'; lane='docs'; dom='core';
       desc="Guide d'installation pour utilisateur non-dev : 5 etapes max, captures, lien video." }

    # Tactiques Infrastructure & DX (parent = epic #0)
    @{ title='Tests unitaires backend MVP (llm/drafts/arbitrage/emails-context)'; parent='INFRA'; m='MVP'; p='P2'; type='chore'; lane='mvp-backend'; dom='tech';
       desc='Couverture tests unitaires sur les 4 modules backend critiques. Mocks API Anthropic + fixtures Outlook.' }
    @{ title='Logging structure rotatif (fichier + JSON)'; parent='INFRA'; m='MVP'; p='P1'; type='chore'; lane='mvp-backend'; dom='tech';
       desc='Remplacer console.log par Winston/Pino. Pre-requis F14 (Langfuse).' }
    @{ title='Install MVP comme service Windows (auto-start)'; parent='INFRA'; m='MVP'; p='P1'; type='chore'; lane='mvp-backend'; dom='tech';
       desc='Utiliser node-windows ou NSSM pour que le MVP demarre au login Windows.' }
    @{ title='CI GitHub Actions : lint + format + audit npm'; parent='INFRA'; m='MVP'; p='P1'; type='chore'; lane='infra'; dom='tech';
       desc='Workflow .github/workflows/ci.yml : eslint + prettier + npm audit sur chaque PR.' }
    @{ title='Dependabot active pour dependances npm'; parent='INFRA'; m='MVP'; p='P1'; type='chore'; lane='infra'; dom='tech';
       desc='Fichier .github/dependabot.yml : weekly npm updates sur 03_mvp/.' }
    @{ title='README.md racine enrichi (getting started + archi)'; parent='INFRA'; m='MVP'; p='P1'; type='docs'; lane='docs'; dom='tech';
       desc='Actuellement minimaliste (1266 o). Ajouter : quickstart, schema architecture, liens 00_BOUSSOLE.' }
    @{ title='CONTRIBUTING.md (conventions commits, branches, reviews)'; parent='INFRA'; m='MVP'; p='P2'; type='docs'; lane='docs'; dom='tech';
       desc='Meme pour soi-meme : aide a ne pas deriver. Conventional commits, PR template, branching.' }
    @{ title='Refactor 01_app-web/assets/app.js en modules ES'; parent='INFRA'; m='V1'; p='P2'; type='chore'; lane='app-web'; dom='tech';
       desc='app.js fait 2800+ lignes. Decouper en modules (cockpit, taches, agenda, contacts, assistant, decisions).' }
    @{ title='Normaliser variables CSS Twisty (supprimer hex inline)'; parent='INFRA'; m='V1'; p='P2'; type='chore'; lane='design-system'; dom='ux';
       desc='Certaines couleurs Twisty sont encore en hex inline dans les CSS. Passer tout en var(--twisty-*).' }
    @{ title='Couvrir cas erreur reseau dans llm.js (timeout, 429, 500)'; parent='INFRA'; m='MVP'; p='P1'; type='fix'; lane='mvp-backend'; dom='tech';
       desc='Retries exponentiels, gestion 429 (rate limit), erreurs reseau. Tests associes.' }
    @{ title='Tests e2e Playwright sur 3 flux critiques'; parent='INFRA'; m='V1'; p='P2'; type='chore'; lane='infra'; dom='tech';
       desc='Flux : (1) arbitrage matinal, (2) delegation, (3) boucle du soir. Lances en CI.' }
    @{ title='Build Windows .exe signe (electron-builder ou Tauri)'; parent='INFRA'; m='V1'; p='P1'; type='chore'; lane='infra'; dom='tech';
       desc='Distribution comme executable signe. Prepare F35 desktop app.' }
    @{ title='Audit dependances MVP (depcheck + suppression inutiles)'; parent='INFRA'; m='MVP'; p='P2'; type='chore'; lane='mvp-backend'; dom='tech';
       desc="node_modules contient probablement des deps non utilisees. Nettoyer pour reduire surface d'attaque." }
    @{ title='Securiser .env : rappel dans 00_BOUSSOLE/GOUVERNANCE.md'; parent='INFRA'; m='MVP'; p='P1'; type='docs'; lane='docs'; dom='tech';
       desc='Regle claire : .env jamais commite, rotation cle API tous les 90j, si leak -> regenerer + git filter-repo.' }
)

foreach ($t in $tacticals) {
    $parentNum = $null
    $parentRef = ''
    if ($t.parent -eq 'INFRA') {
        $parentNum = $epicInfraNumber
        $parentRef = "Part of #$parentNum (Epic Infrastructure & DX)"
    } elseif ($t.parent) {
        $parentNum = $epicNumbers[$t.parent]
        $parentRef = "Part of #$parentNum (Epic $($t.parent))"
    }

    $parentLine = if ($parentRef) { $parentRef } else { '' }
    $body = @"
## Description

$($t.desc)

$parentLine

---
*Cree par ``setup-github-issues.ps1`` le 2026-04-24.*
"@

    $labelList = @("type/$($t.type)", "prio/$($t.p)", "domain/$($t.dom)", "lane/$($t.lane)")
    if ($t.m) { $labelList += "phase/$($t.m.ToLower())" }

    New-Issue -Title $t.title -Body $body -Labels $labelList -Milestone $t.m | Out-Null
}

# ================================================================
# PHASE 4 -- RECAPITULATIF
# ================================================================
Write-Step 'Phase 4/4 -- Recapitulatif'

if ($DryRun) {
    Write-Host "`nMode DRY-RUN termine -- aucun changement reel." -ForegroundColor Yellow
    Write-Host "Relance sans -DryRun pour creer pour de vrai." -ForegroundColor Yellow
} else {
    $totalEpics = $epics.Count + 1  # +1 pour l'epic #0 Infra
    $totalTactics = $tacticals.Count
    $total = $totalEpics + $totalTactics
    Write-Host "`n[OK] $($labels.Count) labels crees" -ForegroundColor Green
    Write-Host "[OK] $($milestones.Count) milestones crees" -ForegroundColor Green
    Write-Host "[OK] $totalEpics issues epic creees" -ForegroundColor Green
    Write-Host "[OK] $totalTactics issues tactiques creees" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "  TOTAL : $total issues sur $REPO" -ForegroundColor Green -BackgroundColor DarkGreen

    Write-Host "`nProchaines etapes :" -ForegroundColor Cyan
    Write-Host "  1. Creer un GitHub Project (Kanban) 'aiCEO Roadmap'"
    Write-Host "     gh project create --owner feycoil --title 'aiCEO Roadmap'"
    Write-Host "  2. Archiver le xlsx + CSVs :"
    Write-Host "     mkdir _archive\2026-04-backlog-initial"
    Write-Host "     move 04_docs\09-backlog* _archive\2026-04-backlog-initial\"
    Write-Host "  3. Archiver les drafts :"
    Write-Host "     move _drafts\BACKLOG_*.md _archive\2026-04-backlog-initial\"
    Write-Host "  4. Commit :"
    Write-Host "     git add -A ; git commit -m 'chore: migration backlog vers GitHub Issues'"
    Write-Host "     git push"
    Write-Host "  5. Ouvrir : gh repo view --web"
}
