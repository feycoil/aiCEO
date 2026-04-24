# REPO-CONTEXT — contexte du DS dans le repo aiCEO

*Ce fichier est spécifique au repo. Le `README.md` du dossier est la documentation canonique du Design System (miroir de OneDrive).*

## Origine et dernière synchro

**Source amont** : OneDrive `C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Design_System\`

**Dernière resync** : à noter ici à chaque commit `design: sync from OneDrive YYYY-MM-DD`

**Fichiers imoortés** : ce dossier contient l'intégralité de l'amont (README.md, SKILL.md, colors_and_type.css, assets/, fonts/ avec binaires OTF/TTF, preview/ 12 HTML, ui_kits/aiceo/, uploads/).

## Écart résolu — Fira Sans canonique (2026-04-24)

**Statut** : ✅ **tranché**. Voir `00_BOUSSOLE/DECISIONS.md` § `2026-04-24 · Typographie canonique : Fira Sans self-hosted`. Atelier de cohérence S2.

**Patches appliqués le 24/04/2026** :
- `assets/app.css` + `assets/product.app.css` : `@import rsms.me/inter` remplacé par `@import ../colors_and_type.css`. `font-family: "Inter var"…` → `"Fira Sans"…`
- `../01_app-web/assets/app.css` : purge `@import Inter`, ajout `@font-face` Fira (6 poids) pointant vers `../../02_design-system/fonts/`
- `../03_mvp/public/index.html` + `evening.html` : `Cambria`/`Calibri` remplacés par `"Fira Sans", Cambria…` / `"Fira Sans", Calibri…` (anciennes fontes conservées en fallback visuel tant que Fira n'est pas servi localement par le MVP)
- `../04_docs/07-design-system.md` § 2.3 : réécriture complète, stack Fira canonique, poids 100-900, OT features

**Reste à faire** (tracé dans `_atelier-2026-04-coherence/sessions/S2-typographie.md` §8) :
- Fusion v0.5 sprint S1 : copier `02_design-system/fonts/*.otf` dans `03_mvp/public/assets/fonts/` + ajouter les `@font-face` dans le CSS unifié. À ce moment-là, Fira Sans s'affichera réellement dans le MVP (aujourd'hui fallback Cambria/Calibri).
- Mise à jour de la prose du `README.md` du DS (section Visual foundations) — toujours à faire (hors session S2, scope OneDrive upstream).

---

## Historique — contexte de l'écart avant résolution

**Symptôme** : incohérence interne au DS OneDrive sur la famille principale.

| Source | Famille déclarée |
|---|---|
| `colors_and_type.css` (tokens canoniques) | **Fira Sans** self-hosted depuis `./fonts/` (10 poids) + Aubrielle + Sol |
| `assets/app.css` (ligne 7) | `@import url('https://rsms.me/inter/inter.css')` — Inter CDN |
| `assets/product.app.css` (ligne 4-7) | Commentaire `Typo : Inter (variable)...` + `@import ... inter.css` |
| `README.md` (section Visual foundations) | « **Inter variable** via `@import url('https://rsms.me/inter/inter.css')` + opentype features `cv11,ss01,ss03`. That's it — one family. » |
| `fonts/README.md` | Revendique **Fira Sans + Aubrielle + Sol** self-hosted, avec note de migration : *« The product codebase currently loads Inter from rsms.me/inter/inter.css. Design-system outputs must prefer Fira Sans. For the product, plan a migration... »* |

**Lecture** : la **cible** du DS est Fira Sans (voir tokens + fonts/README.md), mais le **produit actuel** charge encore Inter. Les fichiers `README.md` et `assets/product.app.css` reflètent l'état produit, pas la cible DS.

### Plan de migration

Action à prendre lors d'un sprint dédié (à créer comme Issue GitHub avec label `lane/design-system`) :

1. Dans `assets/app.css` et `assets/product.app.css` : supprimer l'`@import rsms.me/inter/inter.css` et ajouter l'import local du bloc `@font-face` Fira Sans défini dans `colors_and_type.css`.
2. Remplacer le stack `font-family` par `var(--font-sans)` (qui pointe déjà sur Fira Sans en premier).
3. Retester visuellement les 12 preview HTML et le ui_kits/aiceo/index.html — Fira Sans a une hauteur x plus forte qu'Inter, les trackings négatifs doivent être détendus (déjà anticipé dans les tokens `--tracking-*`).
4. Mettre à jour la prose du `README.md` (section Visual foundations) pour décrire Fira Sans + Aubrielle + Sol à la place d'Inter.
5. Propager au produit : une fois la fusion app-web ↔ MVP terminée, l'instance `03_mvp/public/assets/app.css` doit charger Fira Sans self-hosted (plus de CDN rsms.me — également pertinent en contexte corporate avec proxy).

## Règle de resync

Quand OneDrive est modifié (itération via Claude Design `aiCEO Design System`, ou édit direct des previews) :

```powershell
$src  = "C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Design_System"
$dest = "C:\_workarea_local\aiCEO\02_design-system"
Copy-Item "$src\*" $dest -Recurse -Force -Exclude "REPO-CONTEXT.md"
git add 02_design-system/
git commit -m "design: sync from OneDrive $(Get-Date -Format yyyy-MM-dd)"
```

Le `-Exclude "REPO-CONTEXT.md"` préserve ce fichier (local au repo, absent d'OneDrive).

## Lien avec les autres silos

Voir `00_BOUSSOLE/GOUVERNANCE.md` §"Synchronisation Claude Design → Cowork → GitHub". Résumé :

- Nouvelles itérations UI en **Claude Design** (projets `aiCEO Design System`, `aiCEO v1`, `aiCEO_mvp_v1`) → export dans `_drafts/design-claude-YYYY-MM-DD.md` → revue session Cowork → promotion vers `02_design-system/` via Edit / commit.
- **Pas de pont programmatique** entre Claude Design, OneDrive et le repo — synchro manuelle discipline.
