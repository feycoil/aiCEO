# Release v0.5-s1 — GO ExCom internalisé · S1 livré

**Date :** 2026-04-25
**Tag :** `v0.5-s1`
**Commits :** 6 ahead of `origin/main`

---

## TL;DR

- Décision **GO ExCom** prise et internalisée dans la roadmap.
- **Sprint S1 livré** (S1.13 inclus : pivot complet `better-sqlite3` → `node:sqlite`).
- Roadmap interactive (`04_docs/11-roadmap-map.html`) entièrement actualisée.
- Stabilisation EOL au niveau du dépôt + livrables d'atelier archivés.

---

## Détail des commits (6)

### 1. `docs(roadmap)` — refonte v0.5
Refonte complète de la carte de roadmap : onglets, Release Notes,
Journal & écarts, diagrammes Mermaid, jalons v0.5.

### 2. `docs(roadmap)` — actualisation post GO ExCom
- Bandeau « Vous êtes ici » → GO ExCom internalisé + S1 livré
- Timeline SVG : PRÉ-REQUIS → GO EXCOM ✓
- Phase 1 : `better-sqlite3` → `node:sqlite`, badge **S1 LIVRÉ ✓**
- Pré-requis 4/4 ✓, décision unique GO ExCom (vert)
- Période `avril-s4` ajoutée au hub V05
- Fix Mermaid : suppression des accents dans IDs d'états (`Signee` / `Archivee`)
- Header version : `v0.4` → `v0.5-s1`

### 3. `fix(s1.13)` — pivot `node:sqlite` complété
- `03_mvp/scripts/init-db.js` : `require('better-sqlite3')` → `require('../src/db-driver')`
  *(sans ce fix, le script était cassé depuis le commit `141ca0f` qui supprimait la dépendance)*
- `03_mvp/docs/SPRINT-S1-RECETTE.md` : Node 22.5+, `db-driver.js`,
  `AICEO_DB_OVERRIDE` pour isolation des tests, 23 tests (vs 22).

### 4. `chore(repo)` — `.gitattributes`
Stabilisation des fins de ligne :
- `* text=auto eol=lf` (défaut)
- `*.bat` / `*.cmd` / `*.ps1` → `eol=crlf`
- `*.png` / `*.jpg` / `*.pdf` / `*.pptx` / `*.xlsx` / `*.docx` / `*.ico` → `binary`

### 5. `docs(atelier-2026-04)` — archives scripts
Archivage des scripts PowerShell de création d'issues utilisés pendant
l'atelier GO/NO-GO.

### 6. `docs(v05)` — livrables atelier
- `DOSSIER-GO-NOGO-V05.md`
- `KICKOFF-V05.pptx`
- `POA-V05.xlsx`
- ADRs associés

---

## Tag

Le tag `v0.5-s1` a été **déplacé** du commit `141ca0f` vers le commit
S1.13 complets afin d'inclure le fix `init-db.js` indispensable au bon
fonctionnement du pivot `node:sqlite`.

---

## Vérifs post-push

- [ ] `git log --oneline origin/main..HEAD` → vide
- [ ] `git ls-remote --tags origin v0.5-s1` → pointe sur le bon SHA
- [ ] CI verte sur `main`
- [ ] Roadmap rendue correctement (onglet v0.5, Mermaid, bandeau)

---

## Commandes de publication

```powershell
# Publier les 6 commits
git push origin main

# Repositionner le tag distant
git push origin :refs/tags/v0.5-s1
git push origin v0.5-s1
```

---

## Liens

- Roadmap interactive : `04_docs/11-roadmap-map.html`
- Sprint S1 recette : `03_mvp/docs/SPRINT-S1-RECETTE.md`
- Dossier GO/NO-GO : `01_atelier/2026-04/DOSSIER-GO-NOGO-V05.md`
