---
name: retex
description: Rédige un retour d'expérience (REX) automatique post-sprint aiCEO. Identifie ce qui a marché, ce qui a coincé, et les ajustements à intégrer dans la mémoire/ Cowork. Use when the user says "retex S6.X", "fais le retour d'expérience", "REX du sprint", ou déclenchement automatique post-/ship.
---

# /retex — Retour d'expérience Lean ADD-AI

## Inputs attendus

- ID du sprint à rétrospecter (ex: `S6.9-bis-LIGHT`)
- Métriques disponibles : commits, durée chrono, tokens consommés (si instrumenté), vélocité réelle vs cadrage

## Procédure

1. **Charger le DOSSIER-SPRINT** depuis `04_docs/_sprints/<ID>/`
2. **Charger l'ADR livraison** depuis `00_BOUSSOLE/DECISIONS.md`
3. **Mesurer les écarts** :
   - Effort cadré vs réel (j-binôme et heures chrono)
   - Tasks prévues vs livrées (et tasks ajoutées en cours)
   - Risques anticipés vs réalisés
   - Imprévus (debug, corruption, etc.)
4. **Rédiger le retex** dans `.cowork/memory/retex/<YYYY-MM-DD>-<ID>.md` selon ce squelette :

```markdown
# Retex — <ID>

**Date livraison** : YYYY-MM-DD
**Effort cadré** : N j-binôme
**Effort réel** : M j-binôme (chrono : Hh)
**Vélocité** : ratio plan/réel

## Ce qui a marché ✅
- ...

## Ce qui a coincé 🟡
- ...

## Imprévus 🔴
- ...

## Apprentissages structurels
- ...

## À intégrer dans la mémoire/
- mémoire/tech/pieges-connus.md : <piège découvert>
- mémoire/tech/conventions.md : <règle nouvelle>
- mémoire/product/contraintes.md : <contrainte révélée>

## Métriques (si instrumentées)
- Tokens input/output : ...
- Coût LLM estimé : ...
- Lignes de code +/- : ...
- Tests verts : .../...

## Recommandations sprint suivant
- ...
```

5. **Patcher la mémoire** : si apprentissages durables, les inscrire dans `.cowork/memory/tech/pieges-connus.md`, `conventions.md`, etc.
6. **Mettre à jour CLAUDE.md** §5 (Pièges techniques connus) si nouveau piège répétable identifié

## Garde-fous Lean ADD-AI

- Retex **≤ 30 minutes** d'écriture (Lean = on capture l'essentiel, pas un mémoire)
- **Format ≤ 2 pages** (sinon trop dilué)
- Apprentissages **actionnables** : chaque entrée doit pouvoir être transposée en règle/code/check

## Cas d'usage automatique

Le hook `post-tag` peut déclencher `/retex` automatiquement à chaque tag posé. Configurer dans `.cowork/routines.json`.

## Sortie attendue

- Retex `.cowork/memory/retex/<date>-<ID>.md` créé
- Mémoire mise à jour si apprentissages durables
- CLAUDE.md §5 patché si nouveau piège
- Recommandations affichées au CEO pour le sprint suivant

## Sources

- ADR `2026-04-28 v9 · Lean ADD-AI`
- `04_docs/00_methode/METHODE-ADD-AI-aiCEO.md`
