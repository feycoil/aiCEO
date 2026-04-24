# GOUVERNANCE — Règles de conduite du projet

Le document de référence détaillé est dans [`04_docs/PLAN-GOUVERNANCE.md`](../04_docs/PLAN-GOUVERNANCE.md).

Ce fichier en reprend les règles opérationnelles.

## Rôle de chaque outil

| Outil | Rôle canonique | À y faire | À NE PAS y faire |
|---|---|---|---|
| **Claude Design** (web) | Atelier visuel | Itérer sur écrans, palettes, mocks | Stocker la vérité finale |
| **Cowork** (Desktop) | Atelier code + docs | Éditer, produire, tenir le journal | Inventer des écrans from scratch |
| **GitHub** | Source de vérité | Commits, tags, issues, wiki | Héberger les données privées MVP |

## Synchronisation Claude Design → Cowork

Tout nouveau token ou règle UI créé dans Claude Design :

1. Collé dans `_drafts/design-claude-YYYY-MM-DD.md`
2. Session Cowork suivante : je promeus vers `02_design-system/` si validé
3. Commit signale la source : `design: palette v2 (source: Claude Design 24/04)`

## Fin de session Cowork

Chaque session se termine par :

1. Entrée dans `CHANGELOG.md` section `[Non publié]`
2. Si décision ≥ 30 min : entrée dans `DECISIONS.md`
3. Commit : `chore: session YYYY-MM-DD — <résumé court>`

## Drafts vs livrables

| Zone | Signification |
|---|---|
| Dans `00_` à `06_` | Livrable à jour, canonique |
| Dans `_drafts/` | En maturation, peut changer |
| Dans `_scratch/` | Jetable (hors Git) |
| Dans `_archive/` | Gelé, pour référence historique |

Un doc promu de `_drafts/` → `0X_` passe par un commit `promote: <nom> → livrable`.

## Versioning

- Tags Git : `v0.1`, `v0.2`, …, `v1.0`
- **Pas de `v1`, `v3` dans les noms de fichiers** — un fichier = un nom stable
- Livrables datés : `aiCEO-MVP-description-2026-04-24.pptx`

## Archivage

On déplace vers `_archive/YYYY-MM-contexte/` quand :
- Un document est remplacé par une nouvelle version stabilisée
- Une branche de travail est abandonnée (documenter pourquoi dans `_archive/README.md`)
- Un v1 est publié et on travaille sur le v2

**Jamais de suppression physique** pendant la phase de conception.
