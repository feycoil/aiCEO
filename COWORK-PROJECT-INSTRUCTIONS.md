# Bloc à coller dans Cowork → Settings → Instructions du projet aiCEO

> Ce fichier sert UNIQUEMENT de réservoir copier-coller pour configurer Cowork.
> Le vrai contenu de référence reste `CLAUDE.md` à la racine du repo.

---

## Texte à copier dans le champ "Instructions" de Cowork

```
Projet : aiCEO — copilote IA exécutif local pour CEO ETIC.

PHASE COURANTE : v0.5 internalisée TERMINÉE 26/04/2026 (5 sprints, 110 k€, ~95 tests, tag v0.5 posé).
PHASES À VENIR : v0.6 (UI Claude Design v3.1, ~8 k€ binôme, 2-3 sem) → V1 (SaaS + équipes + mobile, ~46 k€ binôme/6 mois en MODÈLE BINÔME — 0 ETP externe, vélocité ×10) → V2 (commercial intl + i18n + SOC 2, 800 k€) → V3 (coach + offline + multi-CEO, 600 k€).
PROCHAINE DÉCISION : recette ExCom 04/05 → GO v0.6 + GO V1 (modèle binôme) + réallocation 254 k€ option β + CEO pair suppléant Lamiae.

CONTEXTE BINÔME :
- Owner : Major Fey (CEO), poste Windows 11 + Outlook + Edge
- Méthode : « kickoff léger + exécution intégrée + finalisation immédiate »
- Vélocité prouvée : ×30 vs plan ETP (sprint en 3-9 h chrono)
- Cible V1 : ×10 (modèle binôme étendu, 0 ETP externe acté)

LECTURE OBLIGATOIRE EN DÉBUT DE SESSION :
1. C:\_workarea_local\aiCEO\CLAUDE.md (point d'entrée projet, 10 sections, version 26/04 post-v0.6 + binôme V1)
2. 00_BOUSSOLE\DECISIONS.md si décision technique en cours (32+ ADRs)
3. 04_docs\11-roadmap-map.html JOURNAL si retour de pause
4. 04_docs\_design-v05-claude\ si tâche design (16 ressources + 7 ADR gouvernance)

RÉFLEXES OBLIGATOIRES :
- Patcher fichiers > 100 lignes ou critiques (server.js, DECISIONS.md, roadmap-map.html, *.html du DS) : Python atomic write OBLIGATOIRE (jamais Edit/Write direct)
- NE JAMAIS demander au CEO de copier-coller des commandes contenant `.md` (l'app transforme en lien markdown). Toujours générer un script .ps1 avec préfixe fix-/push-/cleanup-/consistence-/setup-
- Toujours kill serveur fantôme :4747 avant npm test ou db:reset (`Get-NetTCPConnection -LocalPort 4747 | Stop-Process -Force`)
- Toujours node --check après modif .js
- Toujours vérifier zéro localStorage applicatif sur nouvelle page (ADR S2.00, regex `localStorage.(setItem|getItem|removeItem|clear|key|length)`)
- Toujours utiliser le port 4747 par défaut (pas 3001 — variante D Windows)

SOURCE DE VÉRITÉ :
- Code + docs : GitHub feycoil/aiCEO (commits sur main, 5 milestones v0.5 fermés, tag v0.5 posé, 5 GitHub Releases publiées)
- État projet temps réel : `04_docs/11-roadmap-map.html` (4 onglets : convergence, Plan v0.5, release notes, JOURNAL)
- Décisions : `00_BOUSSOLE/DECISIONS.md` (format ADR léger : Statut + Contexte + Décision + Conséquences + Sources)

À FAIRE EN FIN DE SESSION SIGNIFICATIVE :
- Mettre à jour CLAUDE.md si nouveau piège ou convention apparue
- Ajouter ADR à DECISIONS.md si décision structurante
- Patcher 11-roadmap-map.html (JOURNAL entry + Sprint status si applicable)
- Proposer commit + push (pas de backup auto pré-V1.5 — risque résiduel R1 acté)
- Lancer audit consistence : pwsh -File consistence-dump.ps1 puis fix-consistence-v2.ps1 -Apply si divergences

DOSSIERS PROJET :
- 00_BOUSSOLE/ : ADRs (DECISIONS.md), ROADMAP.md
- 01_app-web/ : prototype historique (pré-MVP)
- 02_design-system/ : Twisty CSS tokens (DS source)
- 03_mvp/ : backend Express + node:sqlite + frontend 12 pages + tests + scripts/service-windows
- 04_docs/ : documentation projet (DOSSIER-SPRINT, release-notes, RECETTE, INSTALL, ONBOARDING, api/, _design-v05-claude/)
- Scripts racine : fix-labels, cleanup-issues, consistence-dump, fix-consistence-v2, push-s4-all, push-s5-all, fix-s4

INTERLOCUTEURS :
- CEO Major Fey (vision + tranche)
- CEO pair suppléant Lamiae (à former mois 1 V1 — résilience binôme)
- ExCom (décisions GO v0.6, GO V1, réallocation budget) — 04/05/2026

PIÈGES TECHNIQUES KNOWN (cf. CLAUDE.md §5 pour les 12 cas + fix) :
NUL bytes (OneDrive — résolu), CRLF parasites, Edit/Write tronque, EBUSY db, EADDRINUSE 4747, disk I/O sandbox, gh label not found, gh release already exists, doublons issues, copier-coller `.md` en français, séquencement push avant create-issues.
```

---

## Comment l'appliquer dans Cowork

1. Ouvrir Cowork desktop
2. Sidebar gauche → Sélectionner le projet aiCEO (ou le créer s'il n'existe pas, pointant sur `C:\_workarea_local\aiCEO`)
3. Bouton ⚙ Settings du projet → Instructions
4. Coller le bloc encadré ci-dessus
5. Save

Le bloc fait ~2 KB, bien en-dessous des limites Cowork (typiquement 8 KB d'instructions projet).
