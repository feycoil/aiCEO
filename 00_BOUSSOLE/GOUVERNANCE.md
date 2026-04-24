# GOUVERNANCE — Règles de conduite du projet

Le document de référence historique (proposition v0.1 du 24/04/2026) est archivé dans [`_archive/2026-04-plan-gouvernance-v0.1/PLAN-GOUVERNANCE.md`](../_archive/2026-04-plan-gouvernance-v0.1/PLAN-GOUVERNANCE.md). Ce fichier est désormais la **référence vivante** des règles opérationnelles.

## Trois silos, trois rôles, un produit

| Outil | Rôle canonique | À y faire | À NE PAS y faire |
|---|---|---|---|
| **Claude Design** (web) | Atelier visuel — exploration UI/UX, génération de mocks en dialogue long | Itérer écrans, palettes, composants, micro-interactions | Stocker la vérité finale — extraire les tokens et les promouvoir dans `02_design-system/` |
| **Cowork** (Desktop) | Atelier code + docs — sessions sur fichiers locaux, exécution locale | Éditer code, lancer le MVP, produire docs, journal, QA | Inventer des écrans from scratch (Claude Design est plus adapté) |
| **GitHub** (`feycoil/aiCEO`, privé) | Source de vérité — versioning, backlog, archive consultable | Commits, tags, releases, Issues, milestones | Héberger les données privées MVP (`data/*.json`, mails, contacts) |

### Projets Claude Design associés

| Projet Claude Design | Rôle |
|---|---|
| `aiCEO Design System` | Source canonique des tokens, fonts, composants. **Dossier OneDrive** `aiCEO_Design_System/` — import en cours vers `02_design-system/` du repo. |
| `aiCEO v1` | Première tentative de design produit (référence, à consulter pour inspiration) |
| `aiCEO_mvp_v1` | Projet vierge en attente de prompt — destiné à maquetter l'UI de la version unifiée (post-fusion app-web ↔ MVP) |

**Aucune connexion programmatique** entre ces trois projets Claude Design, le repo GitHub et le dossier OneDrive. La synchronisation repose entièrement sur la règle ci-dessous.

## Synchronisation Claude Design → Cowork → GitHub

Tout nouveau token, écran, règle UI produit en Claude Design :

1. Export manuel dans `_drafts/design-claude-YYYY-MM-DD.md` (copie de la sortie utile, capture d'écran si mockup)
2. Session Cowork suivante : revue du draft → si validé, promotion vers `02_design-system/` (tokens, composants) ou `01_app-web/` puis `03_mvp/public/` (vues)
3. Commit référence la source : `design: palette v2 (source: Claude Design aiCEO_mvp_v1 session 24/04)`
4. Si c'est une décision UI structurante (≥ 30 min de débat) : entrée dans `DECISIONS.md`

**Sans cette chaîne, les choix de Claude Design s'évaporent.**

### Chemin type d'un changement de token (7 étapes)

Le coût caché de "3 silos indépendants" est adressé en S7 de l'atelier cohérence (ADR `2026-04-24 · Pipeline tokens DS → CSS + maintien unifié`). **Source canonique des tokens = `02_design-system/tokens.json`**. `colors_and_type.css` est en partie **généré** ; la section "Semantic type roles" en fin de fichier reste hand-written.

Pour toute modification de token (couleur, typo, espacement, radius, shadow, gradient) :

1. **Exploration visuelle** dans Claude Design (projet `aiCEO Design System`) → le designer produit mockups + liste de tokens modifiés.
2. **Export manuel** : le designer extrait les valeurs finales et édite `02_design-system/tokens.json` dans la session Cowork (un seul fichier touché à cette étape).
3. **Régénération CSS** : `cd 02_design-system && npm run ds:export`. Le script réécrit le bloc GENERATED de `colors_and_type.css` + pousse une copie vers `03_mvp/public/assets/colors_and_type.css`.
4. **Contrôle visuel local** : ouvrir `02_design-system/preview/colors-accents.html` (ou les previews concernées) pour vérifier le rendu. Si écart visuel → retour étape 2.
5. **Diff & commit** : `git diff --stat` pour lire l'impact. Commit type : `design(tokens): rose 50/800 ajustés + nouvelle violette (source: Claude Design session YYYY-MM-DD)`.
6. **PR + revue CEO si structurant** : ≥ 30 min de débat ou changement visible dans les 10 dernières secondes d'usage → PR bloquante, validation CEO avant merge + entrée `DECISIONS.md`. Sinon : squash merge direct.
7. **Close Issue GitHub** concernée (`lane/design-system`). Si l'Issue n'existait pas, en créer une rétroactive pour tracer la modif.

**Interdit** : éditer à la main le bloc entre `/* === GENERATED FROM tokens.json ===` et `/* === END GENERATED === */` dans `colors_and_type.css`. La prochaine exécution de `ds:export` écrase ces modifs sans avertissement.

**Parqué** : pre-commit hook Husky qui régénère automatiquement à chaque commit touchant `tokens.json` (Issue `infra/ds-export-pre-commit-hook`, Sprint 3 v0.5).

## Maintien des livrables : continu + audit trimestriel

Règle unifiée pour les livrables vivants du repo (S3 + S6 + S7 atelier cohérence). Chaque livrable ci-dessous a **un régime de maintien continu** (MAJ à chaque sprint si le périmètre change) **+ un audit trimestriel** qui attrape les oublis.

| Livrable | Maintien continu | Audit trimestriel (propriétaire) |
|---|---|---|
| `_drafts/*` (règle 4 sem) | À chaque fin de sprint : promouvoir ou archiver les drafts > 4 sem | Issue `audit/drafts` — recensement, promotion, archive |
| `03_mvp/docs/ONBOARDING-DEV.md` | À chaque sprint qui change pré-requis, commandes, modules, conventions | Issue `audit/livrables-dev` — lecture complète, corrections PR |
| `03_mvp/docs/RUNBOOK-OPS.md` | À chaque panne diagnostiquée en prod → nouvelle entrée dans le sprint | Issue `audit/livrables-dev` — revue des entrées, vérif remèdes |
| `03_mvp/docs/openapi.yaml` (post S2 plan audit) | Auto-généré depuis code v0.5 (Sprint 3-4) — pas de maintien manuel | Issue `audit/livrables-dev` — diff vs SPEC §6 pour détecter dérive |
| `02_design-system/tokens.json` + CSS générés | À chaque sprint touchant l'UI : commit via chemin type ci-dessus | Issue `audit/ds` — cohérence tokens ↔ preview ↔ 03_mvp |

### Calendrier trimestriel figé

Les audits trimestriels s'ouvrent **le 24 de chaque trimestre** (date d'anniversaire du lancement de l'atelier cohérence 2026-04-24). À chaque date, **3 Issues GitHub** à créer et à assigner au milestone du trimestre :

| Trimestre | Date d'ouverture | Issues à créer |
|---|---|---|
| **Q2 2026** | 24/07/2026 | `audit/drafts Q2`, `audit/livrables-dev Q2`, `audit/ds Q2` |
| **Q3 2026** | 24/10/2026 | `audit/drafts Q3`, `audit/livrables-dev Q3`, `audit/ds Q3` |
| **Q4 2026** | 24/01/2027 | `audit/drafts Q4`, `audit/livrables-dev Q4`, `audit/ds Q4` |
| **Q1 2027** | 24/04/2027 | `audit/drafts Q1`, `audit/livrables-dev Q1`, `audit/ds Q1` |

**Délai d'exécution visé** : chaque audit trimestriel est fermé dans les 10 jours ouvrés suivant son ouverture. Sinon, flag dans la revue hebdo dominicale (`06_revues/`).

**Label GitHub dédié** : `type/audit-trimestriel` (à créer).

**Auto-déclencheur** : en v0.5, une tâche planifiée (voir SPEC-TECHNIQUE-FUSION §7 — Service Windows) pourra créer automatiquement les 3 issues à chaque date. D'ici là : tâche manuelle marquée dans l'agenda CEO.

## Statut du dossier `02_design-system/`

**Présent et complet dans le repo** au 2026-04-24 — import depuis OneDrive déjà effectué. Contenu :
- `README.md`, `SKILL.md`, `REPO-CONTEXT.md` (note de contexte repo)
- `colors_and_type.css` (tokens canoniques : Fira Sans + Aubrielle + Sol + 5 accents muets)
- `assets/` : `app.css`, `product.app.css` (895 lignes, theme Twisty), `app.js`, `data.js`, `project-page.js`, `logo.svg`, `twisty-reference.png`
- `fonts/` : **binaires OTF/TTF** — Fira Sans 10 poids + Aubrielle_Demo + SolThin
- `preview/` : 12 HTML (colors-neutrals/accents/companies, type-display/families/scale/weights, components-buttons/chart/kpi/premium/tasks/tickbar, shadow-radius, brand-logo-icons)
- `ui_kits/aiceo/` : recréation pixel de la SPA produit
- `uploads/` : image de référence Twisty d'origine

**Rôle** : source unique de vérité vivante. Le dossier OneDrive `aiCEO_Design_System` devient "atelier amont" — les modifications upstream sont resyncées ici via la procédure décrite dans `02_design-system/REPO-CONTEXT.md`.

**Écart documenté** : incohérence interne Inter vs Fira Sans (voir `REPO-CONTEXT.md`). Sprint de migration à prévoir.

## Fin de session Cowork

Chaque session se termine par :

1. Entrée dans `CHANGELOG.md` section `[Non publié]`
2. Si décision ≥ 30 min : entrée dans `DECISIONS.md`
3. Commit : `chore: session YYYY-MM-DD — <résumé court>`
4. Si des Issues GitHub ont été fermées ou créées, les référencer dans le commit (`closes #42`, `refs #17`)

## Drafts vs livrables

| Zone | Signification | Exemples |
|---|---|---|
| Dans `00_` à `06_` | Livrable — à jour, canonique, réutilisable | `04_docs/SPEC-TECHNIQUE-FUSION.md` |
| Dans `_drafts/` | Brouillon — en maturation, peut changer | `_drafts/design-claude-2026-04-25.md` |
| Dans `_scratch/` | Jetable — hors Git | `_scratch/prompt-experiment.md` |
| Dans `_archive/` | Gelé — référence historique uniquement | `_archive/2026-04-init-github/INIT-GITHUB.md` |

Un doc promu de `_drafts/` → `0X_` passe par un commit `promote: <nom> → livrable`.

## Versioning

- Tags Git : `v0.1`, `v0.2`, …, `v1.0` au passage unifié post-fusion, puis `v2.0` à la V2.
- **Pas de `v1`, `v3` dans les noms de fichiers** — un fichier = un nom stable.
- Livrables datés : `aiCEO-MVP-description-2026-04-24.pptx`.
- Tag courant (24/04/2026) : `v0.4` — MVP déploiement réel validé (28/28 tâches, ≈ 1,5 ct/jour, Outlook COM + Claude API).

## Backlog = GitHub Issues

Depuis le 24/04/2026, **GitHub Issues est la source unique du backlog**. L'xlsx d'origine est archivé (`_archive/2026-04-backlog-initial/`).

- 78 issues actives dans `feycoil/aiCEO` (42 epics F1-F42 + ~35 tactiques + 1 epic infra)
- 29 labels : `lane/*`, `type/*`, `priority/*`, `status/*`, `phase/*`, `scope/*`
- 4 milestones : `MVP`, `V1`, `V2`, `V3`
- Tout nouveau besoin produit = nouvelle Issue (pas de TODO dans le code)

## Archivage

On déplace vers `_archive/YYYY-MM-contexte/` quand :
- Un document est remplacé par une nouvelle version stabilisée
- Une branche de travail est abandonnée (documenter pourquoi dans `_archive/README.md`)
- Un v1 est publié et on travaille sur le v2

**Jamais de suppression physique** pendant la phase de conception. Les originaux deviennent des stubs pointant vers l'archive (voir `00_BOUSSOLE/INIT-GITHUB.md` et `04_docs/PLAN-GOUVERNANCE.md` comme exemples).
