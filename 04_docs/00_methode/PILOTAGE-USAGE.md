# Pilotage projet aiCEO — guide d'usage

Le **dashboard de pilotage** est l'interface unique du CEO pour suivre l'évolution du projet aiCEO.

## Accès

Ouvrir : `file:///C:/_workarea_local/aiCEO/04_docs/00-pilotage-projet.html`

## Fonctionnalités

### Tableau de bord (page d'accueil)
- **Version actuelle** : tag git le plus récent
- **Commits 7j** : activité récente
- **ADRs total** : nombre de décisions architecturales documentées
- **Documents** : fichiers .md indexés automatiquement
- **Activité récente** : 10 derniers commits
- **5 dernières décisions** : ADRs cliquables → modal détail
- **Vélocité 30j** : graphique commits par jour

### Timeline
Mix chronologique : tags Git + ADRs + commits "feat" significatifs (max 50 derniers).

### Roadmap ADD-AI
Visualisation des 3 phases : Fondations / Intelligence / Ritualisation, avec tous les sprints planifiés.

### Décisions (ADRs)
Liste filtrable de tous les ADRs avec recherche full-text sur titre + résumé.

### Commits
100 derniers commits avec auteur, hash, type (feat / fix / docs / refactor).

### Vélocité
Stats agrégées : total 30j · jours actifs · moyenne / pic.

### Documentation (index auto)
**Tous les .md du projet** sont scannés et catégorisés automatiquement :
- Gouvernance · Audits · Méthode · Releases · Sprints · API · Recette · Doc · Tech · Racine
- Recherche full-text + filtre par catégorie
- Click sur une carte → ouvre le .md dans le navigateur

### Audits & rapports
Vue dédiée filtrée sur la catégorie "audit" pour accès rapide.

### Actions CEO
Liste des tâches Windows que Claude ne peut pas faire (push, hooks, restart serveur).

## Mise à jour

### Manuelle
```powershell
pwsh -File C:\_workarea_local\aiCEO\update-pilotage.ps1
# Ou avec ouverture auto :
pwsh -File C:\_workarea_local\aiCEO\update-pilotage.ps1 -Open
```

### Automatique (recommandé)
Une fois pour toutes :
```powershell
pwsh -File C:\_workarea_local\aiCEO\update-pilotage.ps1 -InstallHook
```

À partir de là, le pilotage est régénéré **automatiquement après chaque `git commit`** via le hook `.git/hooks/post-commit`.

## Architecture technique

- **`scripts/pilotage-template.html`** : template HTML statique (DS Twisty + JS pur, pas de framework)
- **`scripts/generate-pilotage.js`** : Node.js scanner qui :
  - Scan récursif `**/*.md` (exclude `.git`, `node_modules`, `_archive`)
  - Parse `00_BOUSSOLE/DECISIONS.md` (extraction ADRs par regex `## YYYY-MM-DD`)
  - `git log` 100 derniers commits + `git tag --sort=-creatordate`
  - Charge `consistence-dump.json` si présent
  - Calcule vélocité 30 derniers jours
  - Génère `04_docs/00-pilotage-projet.html` avec données embed (pas de fetch CORS)
- **`update-pilotage.ps1`** : wrapper PowerShell + option `-InstallHook` + `-Open`
- **`.git/hooks/post-commit`** : hook qui appelle le générateur après chaque commit

## Catégorisation auto des documents

| Categorie | Pattern path |
|---|---|
| `gouvernance` | `00_BOUSSOLE/*` |
| `audit` | `*audit*/*.md` |
| `methode` | `*methode*` ou `*method*` |
| `release` | `*release-notes*` |
| `sprint` | `*sprint*` |
| `api` | `*/api/*` |
| `recette` | `*recette*` ou `*onboarding*` |
| `doc` | `04_docs/*` (fallback) |
| `tech` | `03_mvp/*` |
| `racine` | `CLAUDE.md`, `README.md` |

## Évolutions futures (S6.9-bis ADD-AI)

- Intégration métriques produit live depuis SQLite (via MCP `aiceo-mcp`)
- Section "Décrochages" automatique : détection des sprints qui dépassent leur budget
- Sparkline coût LLM par sprint
- Notifications navigateur si nouveau commit ou ADR critique
- Export PDF du dashboard pour ExCom

## Sources

- ADR `2026-04-28 v8 · Adoption méthode ADD-AI`
- `04_docs/00_methode/METHODE-ADD-AI-aiCEO.md`
- Mandat CEO 28/04 PM late : "document interactif qui permet au CEO de suivre ton travail"
