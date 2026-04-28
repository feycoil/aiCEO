---
name: ship
description: Finalise et livre un sprint aiCEO. Pre-tag → smoke → commit → tag → release notes → ADR livraison. Use when the user says "ship S6.X", "livre le sprint", "on tag", "release S6.X" ou "finalise le sprint".
---

# /ship — Livraison de sprint Lean ADD-AI

## Inputs attendus

- ID du sprint (ex: `S6.9-bis-LIGHT`)
- Numéro de version cible si applicable (ex: `v0.8`, `v1.0`)

## Procédure pre-flight (ordre strict)

1. **Smoke test** : `node --check` sur tous les .js modifiés
2. **Audit visuel** (si UI touchée) : Ctrl+F5 + diff vs maquette
3. **Tests** : `npm test` côté Windows (84+ tests verts attendus)
4. **Lint ADR** : présence ADR de cadrage **et** ADR livraison
5. **Cohérence GitHub** : milestone fermable (issues toutes closes)
6. **Commit messages** : conventional commits (feat/fix/docs/chore)

## Procédure de livraison

1. **Rédiger ADR `vN · YYYY-MM-DD · <ID> livré`** dans `00_BOUSSOLE/DECISIONS.md` :
   - Statut : ACTÉ
   - Contexte (1 paragraphe)
   - Décision (livrables réels, écarts vs cadrage)
   - Conséquences (impact roadmap, dette créée, prochains pas)
   - Sources (commits, ADR cadrage, dossier sprint)
2. **Créer release notes** dans `04_docs/03_roadmap/_release-notes/<ID>.md`
3. **Mettre à jour CLAUDE.md** §1 (statut sprint courant) et §3 si nouvelles features
4. **Régénérer pilotage** : `node scripts/generate-pilotage.js`
5. **Bump cache buster** si front modifié (`?v=NNN` → +1) sur 18 HTML
6. **Commit final** : `feat(<ID>): livré · <courte description>`
7. **Tag git** : `git tag <ID>` + `git push origin <ID>`
8. **GitHub Release** : `gh release create <ID> --notes-file 04_docs/03_roadmap/_release-notes/<ID>.md`
9. **Fermer milestone** GitHub : `gh issue close --milestone <ID>` puis fermer la milestone
10. **Marquer la task completed** dans le TaskList Cowork

## Commandes côté CEO (bash sandbox ne peut pas)

```powershell
cd C:\_workarea_local\aiCEO
git push origin main
git push origin <tag>
gh release create <tag> --notes-file 04_docs/03_roadmap/_release-notes/<ID>.md
```

## Garde-fous Lean ADD-AI

- **Pas de tag sans ADR livré** : la cohérence DECISIONS.md ↔ tag ↔ release est un invariant
- **Pas de release sans audit visuel** si UI touchée
- **Pas de fermeture milestone si issues open** : Lean ne tolère pas la dette implicite

## Sortie attendue

- ADR livraison dans DECISIONS.md
- Release notes dans `_release-notes/`
- CLAUDE.md à jour
- Pilotage régénéré
- Tag posé + release publiée + milestone fermée
- TaskList Cowork à jour

## Sources

- ADR `2026-04-28 v9 · Lean ADD-AI`
- ADR `2026-04-26 · Variante D Startup folder` (workflow Windows)
