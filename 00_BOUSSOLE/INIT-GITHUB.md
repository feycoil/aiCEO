# INIT-GITHUB — Mise en place du dépôt Git + GitHub (sur votre poste Windows)

**Contexte** : OneDrive bloque l'initialisation Git depuis la session Cowork. Cette recette est à exécuter **une seule fois**, localement sur votre poste, dans PowerShell ou Git Bash.

## Prérequis

1. [Git pour Windows](https://git-scm.com/download/win) installé (vérifier : `git --version`)
2. Compte GitHub (vous avez confirmé : **compte personnel privé**)
3. Clé SSH liée à votre compte GitHub, **OU** authentification via GitHub CLI (`gh auth login`)

## Étape 1 — Exclure `.git/` de OneDrive (critique)

OneDrive corrompt les fichiers `.git/config.lock` s'il tente de synchroniser. Deux approches :

**Approche A — Sortir le projet de OneDrive (recommandé)**

Déplacez le dossier `aiCEO_Agent` hors de votre dossier OneDrive. Par exemple :

```
D:\dev\aiCEO\
```

Git s'y plaira. Vous perdez la synchro OneDrive, mais Git devient votre source de vérité.

**Approche B — Laisser dans OneDrive mais exclure `.git/`**

Dans OneDrive (Paramètres → Compte → Choisir les dossiers à synchroniser), décochez `.git/` spécifiquement. Moins robuste mais fonctionne.

## Étape 2 — Renommer le dossier racine

Dans Windows Explorer, renommez `aiCEO_Agent` → `aiCEO`.

## Étape 3 — Nettoyer les restes OneDrive

Dans PowerShell, dans le dossier du projet :

```powershell
# Supprimer le .git cassé (créé par Cowork, verrouillé partiellement)
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Supprimer les anciens dossiers vides laissés par la migration
Remove-Item -Recurse -Force docs, journeys, mvp, revues -ErrorAction SilentlyContinue

# Vérifier : on doit voir 00_BOUSSOLE, 01_app-web, ..., _drafts, _archive, _scratch
Get-ChildItem -Force | Select-Object Name
```

## Étape 4 — Initialiser Git localement

```bash
# Dans Git Bash ou PowerShell
cd D:\dev\aiCEO   # (ou votre chemin)

git init -b main
git config user.email "feycoil@etic-services.net"
git config user.name "Major Fey"

# Premier commit : .gitignore seul (protection avant d'ajouter le reste)
git add .gitignore
git commit -m "chore: .gitignore initial"

# Second commit : boussole + docs
git add 00_BOUSSOLE/ 04_docs/ 05_journeys/ README.md
git commit -m "docs: boussole + stratégie produit + journeys"

# Troisième commit : design system
git add 02_design-system/
git commit -m "feat(design-system): tokens Twisty + UI kits v1"

# Quatrième commit : app web
git add 01_app-web/
git commit -m "feat(app-web): cockpit Twisty v4 (index, agenda, projets, ...)"

# Cinquième commit : MVP
git add 03_mvp/
git commit -m "feat(mvp): copilote local v0.4 (arbitrage + délégation + soir + Outlook)"

# Sixième commit : revues
git add 06_revues/
git commit -m "docs(revues): revue W17 pilote"

# Zones de travail
git add _drafts/ _archive/
git commit -m "chore: drafts + archives"

# Tag de l'état courant
git tag -a v0.4 -m "MVP déploiement réel validé 24/04/2026 — 28/28 tâches, ≈ 1,5 ct/jour"

# Voir l'historique
git log --oneline --graph --decorate
```

## Étape 5 — Créer le dépôt GitHub privé

**Option A — Via GitHub CLI (recommandé, 10 s)** :

```bash
gh auth login   # si première fois
gh repo create aiCEO --private --source=. --remote=origin --push
git push --tags
```

**Option B — Via l'interface web** :

1. [github.com/new](https://github.com/new) → nom `aiCEO`, visibilité **Private**, **aucun** README / .gitignore / LICENSE (on les a déjà)
2. Récupérer l'URL SSH (`git@github.com:<user>/aiCEO.git`)
3. Dans votre terminal :

```bash
git remote add origin git@github.com:<user>/aiCEO.git
git push -u origin main
git push --tags
```

## Étape 6 — Vérifier

```bash
git remote -v                     # doit afficher origin
git branch -a                     # main + remotes/origin/main
git log --oneline                 # historique propre
git tag                           # doit lister v0.4
```

Sur github.com/<user>/aiCEO, vous devez voir tous les dossiers `00_BOUSSOLE/` → `_scratch/`, ainsi que le tag `v0.4`.

## Étape 7 — Convertir `04_docs/09-backlog.xlsx` en issues

Cette étape peut se faire plus tard. Processus proposé :

1. Ouvrir `09-backlog.xlsx`, exporter en CSV ou copier/coller
2. Pour chaque ligne, créer une issue GitHub avec les labels `lane/app-web` | `lane/mvp` | `lane/v2`, `type/feat` | `type/fix` | `type/docs`
3. Activer **GitHub Projects** (onglet Projects dans le repo) → board Kanban
4. Relier les issues à la roadmap : chaque jalon de `11-roadmap-map.html` devient un milestone GitHub

Une fois fait, le xlsx peut être archivé dans `_archive/2026-04-backlog-initial/`.

## En cas de problème

- **`fatal: bad config line`** : le `.git/config` est corrompu par OneDrive. Refaire Étape 3 (supprimer `.git` puis `git init`).
- **`.git/config.lock: Operation not permitted`** : idem, OneDrive tient le fichier. Sortir du dossier OneDrive (Approche A étape 1).
- **Secrets commités par accident** : `git rm --cached .env` puis recommit. Si déjà poussé : régénérer la clé API Anthropic immédiatement et faire `git filter-repo` pour nettoyer l'historique.

---

*Document à conserver dans `00_BOUSSOLE/` — à relire lors des sorties d'équipe ou en cas de besoin de refaire un dépôt propre.*
