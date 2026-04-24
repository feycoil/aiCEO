> **ARCHIVÉ le 2026-04-24** — document de proposition v0.1 rédigé le 24/04/2026. Toutes les propositions ont été exécutées ou décidées :
>
> - Arborescence unifiée `aiCEO/` créée (ok)
> - `.gitignore` posé, Git init et dépôt `feycoil/aiCEO` privé créés
> - Backlog xlsx migré en 78 issues GitHub (29 labels, 4 milestones)
> - Renommage `aiCEO_Agent` → `aiCEO` effectué
> - Les 3 "décisions à prendre" en §8 ont toutes été tranchées (oui / compte perso / fusion immédiate)
>
> Les règles vivantes extraites de ce doc (rôles Claude Design / Cowork / GitHub, conventions draft/livrable) ont été portées dans `00_BOUSSOLE/GOUVERNANCE.md`.
>
> **Ouverte lacune** : le §6 (« Cohérence retrouvée avec Claude Design ») proposait un pivot `02_design-system/TOKENS.md`. Le dossier `02_design-system/` n'existait pas au repo au 24/04 — import depuis OneDrive aiCEO_Design_System en cours (voir CHANGELOG).

---

# Plan de gouvernance produit aiCEO

*v0.1 · 24/04/2026 · proposition à valider avant mise en œuvre*

Ce document répond à quatre questions que vous avez posées ensemble :

1. Comment **unifier** les dossiers `aiCEO_Agent` et `aiCEO_Design_System` dans une arborescence claire ?
2. Comment **archiver** les anciens documents et **tracer** les décisions, les versions, les réflexions ?
3. Comment **distinguer** les brouillons (draft) des livrables (release) ?
4. Comment **coordonner** Claude Design (web), Cowork (desktop) et **GitHub** dans une conduite de projet unique ?

Rien n'est exécuté ici — c'est une proposition. Vous décidez ce qu'on applique.

---

## 1. Diagnostic — où nous en sommes

### Deux dossiers déconnectés

- `aiCEO_Agent/` — cockpit web (HTML/CSS/JS), MVP Node, docs stratégie, journeys, revues. **~80 MB, 10 branches de travail.**
- `aiCEO_Design_System/` — tokens de design (couleurs, typo, espacements). **Autonome, pas référencé depuis aiCEO_Agent.**

**Conséquence** : le design system évolue seul, le MVP code en dur sa propre palette, l'app web a sa feuille de style. Trois vérités sur les couleurs Twisty.

### Pas de séparation draft / livrable

Les fichiers actifs, les brouillons et les anciennes versions cohabitent dans la même racine. Exemple :

- `REFONTE_v3.md`, `SPEC_v31.md`, `AUDIT_SANS_CONCESSION.md`, `PROMPT_REPRODUCTION.md`, `_template.md` → aucun ne dit s'il est obsolète, en cours, ou de référence.
- `revue-2026-W17-widget.jsx` (27 KB) orphelin : pas référencé, pas clair s'il est gardé.
- Fichiers debug `llm_test.js`, `proxy_smoke.js`, `run_arb.js` (62 octets chacun) présents dans le MVP.
- `~BROMIUM` (lockfiles OneDrive) visibles dans plusieurs dossiers.

### Pas de versioning explicite

Vous avez écrit « v1 », « v3 », « v4 », « v31 » dans des noms de fichiers, mais :

- Aucun `CHANGELOG.md` ne raconte ce qui a changé entre deux versions.
- Aucun `DECISIONS.md` ne garde trace des choix (« on a abandonné COM Outlook → Graph pour X raisons »).
- Pas de Git → impossible de revenir 3 jours en arrière si on casse quelque chose.

### Trois outils, aucune gouvernance commune

| Outil | Rôle aujourd'hui | Problème |
|---|---|---|
| **Claude Design** (claude.ai/projects) | Style, design system | Non lié au code, révisions en parallèle |
| **Cowork** (Claude Desktop) | Sessions de travail sur les fichiers, MVP, docs | Pas de trace entre sessions |
| **GitHub** | *pas encore utilisé* | À mettre en place |

Les décisions prises en chat avec Claude Design ne remontent pas dans Cowork. Les évolutions de Cowork ne sont pas tracées historiquement. GitHub pourrait être le tissu conjonctif.

---

## 2. Proposition — arborescence unifiée

Je propose de **fusionner** les deux dossiers dans un seul `aiCEO/` (renommage du dossier racine) structuré en **6 domaines** + **zones de service**.

```
aiCEO/
├── 00_BOUSSOLE/                  ← vision, roadmap, governance (à lire en premier)
│   ├── README.md                    boussole produit — pourquoi on fait ça
│   ├── ROADMAP.md                   texte, complément de la carte interactive
│   ├── ROADMAP-MAP.html             carte interactive (11-roadmap-map.html)
│   ├── DECISIONS.md                 journal des décisions (ADR léger)
│   ├── CHANGELOG.md                 quoi a changé, quand, pourquoi
│   └── GOUVERNANCE.md               ce document
│
├── 01_app-web/                   ← cockpit Twisty statique (HTML/CSS/JS)
│   ├── index.html
│   ├── agenda.html, contacts.html, decisions.html, …
│   ├── assets/                      js, css, data.js
│   ├── projets/                     pages par projet
│   └── README.md                    comment l'ouvrir, ce qu'il fait
│
├── 02_design-system/             ← ex-aiCEO_Design_System, unique source de vérité
│   ├── tokens/                      couleurs, typo, spacing (.json + .css)
│   ├── components/                  doc + exemples
│   ├── icons/
│   └── README.md
│
├── 03_mvp/                       ← serveur Node + ingestion Outlook
│   ├── server.js
│   ├── public/                      UI matin + soir
│   ├── src/                         prompt, llm, drafts, evening, emails-context
│   ├── scripts/                     fetch-outlook.ps1, normalize-emails.js, seed
│   ├── data/                        ⚠️ JAMAIS commit — généré, local uniquement
│   ├── docs/                        description PPTX, journal
│   └── README.md
│
├── 04_docs/                      ← stratégie produit
│   ├── 01-vision-produit.md
│   ├── 02-benchmark.md
│   ├── 03-ia-proactive.md
│   ├── 04-visualisation.md
│   ├── 05-coaching-ux.md
│   ├── 06-architecture.md
│   ├── 07-design-system.md
│   ├── 08-roadmap.md
│   ├── 09-backlog.xlsx
│   └── 10-exec-deck.pptx
│
├── 05_journeys/                  ← 5 scénarios UX
│   ├── arbitrage.md
│   ├── delegation.md
│   ├── debrief.md
│   ├── revue-hebdo.md
│   └── apprentissage.md
│
├── 06_revues/                    ← revues hebdomadaires
│   ├── 2026-W17/
│   │   ├── revue.md
│   │   └── widget.jsx
│   └── 2026-W18/…
│
├── _drafts/                      ← en cours de maturation, non stabilisé
│   └── …                            (déplacer ici SPEC_v31 si encore en débat, etc.)
│
├── _archive/                     ← versions précédentes figées, ne plus toucher
│   ├── 2026-04-app-web-v3/
│   ├── 2026-04-mvp-pptx-v1/
│   └── README.md                    index des archives + pourquoi archivé
│
└── _scratch/                     ← bac à sable, hors Git (listé dans .gitignore)
    └── …                            expérimentations, fichiers éphémères
```

### Règles d'or

- **00 à 06** : numérotés pour forcer l'ordre de lecture. `00_BOUSSOLE` est l'entrée universelle.
- **`_drafts/`** : tout ce qui n'est pas encore décidé. Préfixe `_` pour trier en bas.
- **`_archive/`** : on déplace, on ne supprime jamais. Chaque sous-dossier est daté + décrit dans `_archive/README.md`.
- **`_scratch/`** : poubelle autorisée. Dans `.gitignore`.
- **Pas de fichier à la racine** sauf `README.md` (pointeur vers `00_BOUSSOLE/`) et `.gitignore`.

### Migration — comment on passe de l'état actuel à la cible

Ceci est **destructif** : à faire en une seule fois, avec Git initialisé **avant** pour filet de sécurité. Script de migration proposé (à exécuter par vos soins après validation) :

```bash
# 0. Snapshot Git avant tout bouge
git init && git add -A && git commit -m "snapshot initial avant restructuration"

# 1. Créer la nouvelle arborescence
mkdir -p aiCEO/{00_BOUSSOLE,01_app-web,02_design-system,03_mvp,04_docs,05_journeys,06_revues,_drafts,_archive,_scratch}

# 2. Déplacer par branche (exemples)
mv index.html agenda.html contacts.html decisions.html groupes.html taches.html projets.html assistant.html projets/ assets/ aiCEO/01_app-web/
mv ../aiCEO_Design_System/* aiCEO/02_design-system/
mv mvp/* aiCEO/03_mvp/
mv docs/* aiCEO/04_docs/
mv journeys/* aiCEO/05_journeys/
mv revues/* aiCEO/06_revues/
mv REFONTE_v3.md SPEC_v31.md aiCEO/_drafts/
mv AUDIT_SANS_CONCESSION.md PROMPT_REPRODUCTION.md mvp-journal-semaine1.md aiCEO/04_docs/
mv _template* aiCEO/_scratch/

# 3. Nettoyer les orphelins (déplacer dans _archive/ pour trace)
mv llm_test.js proxy_smoke.js run_arb.js aiCEO/_archive/2026-04-debug-scratch/

# 4. Commit
git add -A && git commit -m "restructuration : dossiers unifiés en aiCEO/"
```

---

## 3. Conventions de versioning et d'archivage

### Principe

**Git est la source de vérité pour les versions.** On arrête de mettre `v3`, `v31` dans les noms de fichiers. On tague les versions dans Git et on maintient un `CHANGELOG.md` lisible.

### `CHANGELOG.md` — format léger

Un fichier en racine `00_BOUSSOLE/CHANGELOG.md`, mis à jour à chaque palier. Format **Keep a Changelog** simplifié :

```markdown
# Changelog

## [Non publié]
### En cours
- Restructuration dossiers aiCEO/ unifiée

## [0.4] — 2026-04-24
### Ajouté
- MVP : support proxy corp HTTPS_PROXY + NODE_EXTRA_CA_CERTS
- MVP : contexte email injecté dans le prompt d'arbitrage
- Run réel 28/28 tâches, 41 s, ≈ 1,5 ct/jour

### Modifié
- Prompt arbitrage : REPORTER sans plafond (était max 3)

## [0.3] — 2026-04-20
### Ajouté
- Boucle du soir / debrief
- Flux délégation + brouillons mails
```

### `DECISIONS.md` — ADR léger

Pour chaque choix structurant, un paragraphe dans `00_BOUSSOLE/DECISIONS.md` :

```markdown
## 2026-04-22 · Outlook COM plutôt que Graph
**Contexte** : besoin d'ingérer les mails pour le contexte arbitrage.
**Options étudiées** : (A) COM local PowerShell ; (B) Microsoft Graph via Azure AD.
**Décision** : A — pas de setup Azure, Outlook déjà ouvert sur le poste.
**Conséquences** : nécessite Outlook lancé, dépendance COM Windows. Graph à prévoir en V2+.
```

Règle : **une décision ≥ 30 minutes de débat** mérite une entrée. Les micro-arbitrages non.

### Versioning — numérotation

- Tags Git `v0.1`, `v0.2` …, `v1.0` quand le produit unifié est livrable.
- Pas de `v1`, `v2` dans les noms de fichiers. Un fichier = un nom stable.
- Les **livrables** (PPTX, PDF, HTML interactifs) datés : `aiCEO-MVP-description-2026-04-24.pptx`.
- Les **brouillons** restent sans date, dans `_drafts/`.

### Archivage — quand archive-t-on ?

On bouge vers `_archive/YYYY-MM-contexte/` quand :

- Un document est remplacé par une nouvelle version stabilisée (ex : `SPEC_v31.md` remplacé par `SPEC.md` final → l'ancienne va en archive).
- Une branche de travail est abandonnée (on documente dans `_archive/README.md` **pourquoi**).
- Le v1 d'un livrable est publié et on travaille sur le v2 (on archive le v1 figé).

**Jamais de suppression physique** pendant la phase de conception. Git gère la vraie suppression plus tard si besoin.

### Drafts vs livrables — convention

| Zone | Signification | Exemples |
|---|---|---|
| Dans un dossier numéroté `0X_` | **Livrable** — à jour, canonique, réutilisable | `04_docs/01-vision-produit.md` |
| Dans `_drafts/` | **Brouillon** — en maturation, peut changer | `_drafts/spec-v31-notes.md` |
| Dans `_scratch/` | **Jetable** — expérimentation, non versionné | `_scratch/test-prompt-fragment.md` |
| Dans `_archive/` | **Gelé** — pour référence historique uniquement | `_archive/2026-04-app-web-v3/` |

Un doc promu de `_drafts/` → `0X_` passe obligatoirement par un commit nommé `promote: <nom> → livrable`.

---

## 4. Gouvernance Claude Design ↔ Cowork ↔ GitHub

### Rôle de chaque outil

| Outil | Rôle canonique | À y faire | À NE PAS y faire |
|---|---|---|---|
| **Claude Design** (web) | Atelier visuel · exploration UI/UX en dialogue long · génération de mocks | Itérer sur écrans, palettes, composants, micro-interactions | Stocker la vérité finale : extraire les tokens, les mettre dans `02_design-system/` |
| **Cowork** (Desktop) | Atelier code + docs · sessions sur vos fichiers locaux · exécution locale | Éditer code, lancer le MVP, produire docs, tenir le journal, QA | Inventer des écrans from scratch (Claude Design est meilleur pour ça) |
| **GitHub** | Source de vérité · versioning · archive consultable · tissu de coordination | Commits, tags, releases, issues, wiki | Héberger les données privées du MVP (`data/*.json` sensibles) |

### Flux de travail standard

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Claude Design    │───▶│ Cowork (Desktop) │───▶│ GitHub (public   │
│ exploration UI   │    │ code + docs      │    │ ou privé)        │
│                  │    │                  │    │                  │
│ → mocks, tokens  │    │ → implémente,    │    │ → commits tagués,│
│   en chat        │    │   écrit MD       │    │   CHANGELOG mis  │
│                  │    │   versionne      │    │   à jour         │
└──────────────────┘    └──────────────────┘    └──────────────────┘
        │                       │                       │
        └───── synchro ────────┘                       │
        tokens extraits de Claude Design               │
        → posés dans 02_design-system/ par Cowork      │
                                │                       │
                                └──── push régulier ───┘
```

### Règle de synchronisation Claude Design → Cowork

Quand Claude Design produit un écran, un token, une règle UI nouvelle :

1. Vous copiez la sortie dans **une issue GitHub** (voir §5) ou dans `_drafts/design-notes-YYYY-MM-DD.md`.
2. Lors d'une session Cowork, je relis l'issue/le draft, j'implémente ou je mets à jour `02_design-system/`.
3. Je mentionne la source dans le commit : `design: palette Twisty v2 (source: Claude Design session 24/04)`.

Sans cette étape, les choix faits en Design s'évaporent.

### Règle de mémoire entre sessions Cowork

Chaque session Cowork se termine par un **mini-bilan** écrit dans `00_BOUSSOLE/CHANGELOG.md` (section `[Non publié]`) + commit. Prochaine session : on relit le CHANGELOG avant de démarrer.

---

## 5. Mise en place GitHub — plan en 5 étapes

### Étape 1 — Décider le dépôt (privé, 15 min)

- **Dépôt privé** recommandé : le MVP contient des noms de contacts, des projets ETIC réels, des mails (même filtrés). Privé par défaut.
- Nom proposé : `aiCEO` (sous votre compte ou orga ETIC).
- License : aucune (privé) ou proprietary.

### Étape 2 — `.gitignore` — crucial avant tout `git add` (10 min)

OneDrive + Node.js + aiCEO génèrent des fichiers à **ne jamais** committer. Proposition :

```gitignore
# OneDrive lockfiles
~$*
.DS_Store
Thumbs.db

# Node
node_modules/
npm-debug.log*
yarn-error.log
package-lock.json.bak

# Secrets
.env
.env.local
*.key
*.pem

# MVP — données générées (privées)
03_mvp/data/emails-raw.json
03_mvp/data/emails.json
03_mvp/data/emails-summary.json
03_mvp/data/seed.json
03_mvp/data/decisions.json
03_mvp/data/drafts.json
03_mvp/data/evenings.json

# Scratch & caches
_scratch/
*.log
.cache/
dist/
build/

# OS
.idea/
.vscode/settings.json
```

### Étape 3 — Initialisation (30 min)

```bash
cd "C:\...\aiCEO"   # après restructuration
git init
git add .gitignore
git commit -m "chore: .gitignore initial"
git add 00_BOUSSOLE/ 04_docs/ 05_journeys/ 02_design-system/
git commit -m "docs: vision, journeys, design system v1"
git add 01_app-web/
git commit -m "feat(app-web): cockpit Twisty v4"
git add 03_mvp/
git commit -m "feat(mvp): copilote local v0.4 (arbitrage + délégation + soir + Outlook)"
git tag v0.4 -m "MVP déploiement réel validé 24/04/2026"

# Puis pousser
git remote add origin git@github.com:<votre-compte>/aiCEO.git
git push -u origin main
git push --tags
```

### Étape 4 — Stratégie de branches (simple)

Pour un produit à une seule personne + Claude, pas la peine de Gitflow. Règle minimale :

- `main` : toujours fonctionnel. Pas de commit cassé.
- `wip/<sujet>` : branches courtes pour expérimentations risquées. Merge squashé dans main.
- Tags : `v0.5`, `v0.6`… à chaque palier notable (correspond aux entrées `CHANGELOG.md`).

### Étape 5 — Issues = backlog (remplace votre xlsx)

Transférer `04_docs/09-backlog.xlsx` en issues GitHub, avec labels :

- `type/feat`, `type/fix`, `type/docs`, `type/refactor`
- `lane/app-web`, `lane/mvp`, `lane/design-system`, `lane/v2`
- `status/doing`, `status/blocked`

Un Kanban GitHub Projects relie visuellement les issues aux jalons de la roadmap HTML. **Il devient la source unique** — vous fermez le xlsx.

---

## 6. Coexistence Claude Design : cohérence retrouvée

Le problème que vous signalez : *« il semble qu'il y ait de l'incohérence avec le produit car les projets ne sont pas liés »*.

Diagnostic : Claude Design travaille sur une **vision** du design qui dérive de l'app web réelle parce qu'elle n'a pas accès à `02_design-system/`.

Proposition en 3 règles :

1. **Un artefact pivot : `02_design-system/TOKENS.md`** décrit en texte lisible la palette (exactement la palette Twisty qu'on a utilisée dans le PPTX MVP), la typo, les espacements. À chaque session Claude Design, vous collez ce fichier dans le premier message — Claude Design travaille alors **à l'intérieur** du système, pas à côté.
2. **Retour obligatoire de Claude Design** : tout nouveau token ou règle créé dans Claude Design doit être écrit dans `_drafts/design-claude-YYYY-MM-DD.md` avant d'être promu vers `02_design-system/`. Sinon ça disparaît.
3. **Revue hebdo des divergences** : une fois par semaine (en fin de revue W-X), on vérifie que `02_design-system/` et l'app web et le MVP utilisent les mêmes couleurs exactement. Outil : grep des hex codes dans `01_app-web/**` et `03_mvp/**`, comparaison avec `02_design-system/tokens/colors.css`.

---

## 7. Séquencement proposé

Dans l'ordre d'exécution suggéré (à valider par vous) :

| # | Action | Durée | Vous ou moi ? |
|---|---|---|---|
| 1 | Valider cette proposition (lire, commenter) | 30 min | **Vous** |
| 2 | Initialiser Git + `.gitignore` avant toute migration | 10 min | Moi, en session |
| 3 | Créer l'arborescence `aiCEO/` cible | 15 min | Moi |
| 4 | Migrer fichiers par branche (commits lisibles) | 1 h | Moi |
| 5 | Écrire `00_BOUSSOLE/` : README, CHANGELOG, DECISIONS vides | 30 min | Moi |
| 6 | Créer dépôt GitHub privé + premier push | 15 min | **Vous** (compte) + moi (contenu) |
| 7 | Migrer backlog.xlsx → issues GitHub | 1 h | Moi |
| 8 | Extraire tokens Twisty dans `02_design-system/` | 1 h | Moi |
| 9 | Premier cycle : itérer Claude Design avec TOKENS.md en prompt | 30 min | **Vous** |

**Estimation totale : une grosse matinée.** Après quoi, le produit a une colonne vertébrale claire pour les prochains mois.

---

## 8. Ce que ça NE règle pas (et il faudra y revenir)

- **Import continu d'Outlook** : reste un PowerShell manuel. La gouvernance n'y change rien, l'auto-sync arrive en V2+ (voir roadmap).
- **Multi-utilisateur** : toute cette structure est mono-poste. Si vous voulez partager le MVP avec quelqu'un d'autre chez ETIC, il faudra un vrai backend et une auth — hors périmètre V1.
- **Tests automatisés** : ni `01_app-web/` ni `03_mvp/` n'ont de tests. À ajouter avant v1.0, pas avant.

---

## Décisions à prendre

Trois questions pour avancer :

1. **Renomme-t-on `aiCEO_Agent` en `aiCEO`**, ou garde-t-on le nom actuel ? (Je propose le renommage, plus clair.)
2. **Dépôt GitHub** : sous votre compte personnel ou sous l'orga ETIC Services ?
3. **Fusion des dossiers aujourd'hui** ou après une session de validation plus poussée ?

Dites-moi et j'exécute l'étape 2 de la mise en place.

---

*Document vivant · à mettre à jour à chaque revue · versionné dans `00_BOUSSOLE/GOUVERNANCE.md`*
