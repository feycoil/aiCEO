---
name: kickoff
description: Démarre un sprint aiCEO en mode Lean ADD-AI. Crée le dossier sprint, l'ADR de cadrage, le DOSSIER-SPRINT.md, et la milestone GitHub. Use when the user says "lance le sprint S6.X", "kickoff S6.X", "démarre le sprint X" ou "on démarre la phase 0/1/2/3".
---

# /kickoff — Démarrage de sprint Lean ADD-AI

## Inputs attendus

- ID du sprint (ex: `S6.9-bis-LIGHT`, `SPIKE-VALIDATION`, `S6.11-EE`)
- Effort cible (en j-binôme : 0.5, 1, 1.5)
- Objectif en 1 phrase
- Critères de sortie formels (3 max)

## Procédure

1. **Créer le dossier sprint** `04_docs/_sprints/<ID>/`
2. **Générer le DOSSIER-SPRINT-<ID>.md** depuis le template `04_docs/00_methode/RETEX-TEMPLATE.md` (si existant) sinon depuis le squelette ci-dessous :
   - Origine (ADR référence)
   - Objectif sprint
   - Tasks détaillées (3-8 tasks max en mode Lean)
   - Critères d'acceptance
   - Risques (3 max en mode Lean)
   - Sources
3. **Inscrire l'ADR de cadrage** dans `00_BOUSSOLE/DECISIONS.md` :
   - Format léger : `vN · YYYY-MM-DD · <ID> cadré`
   - Statut + Contexte + Décision + Conséquences + Sources
4. **Créer la milestone GitHub** via `gh milestone create` (si `gh` disponible côté CEO)
5. **Mettre à jour la roadmap** `04_docs/03_roadmap/ROADMAP-V2-2026-04-28.md` (status sprint : 📋 Cadré)
6. **Marquer la task in_progress** dans le TaskList Cowork

## Garde-fous Lean ADD-AI

- Effort cible **≤ 1.5 j-binôme** par sprint (sinon découper)
- Tasks détaillées **≤ 8** (sinon scope creep)
- Risques **≤ 3** (sinon prendre le temps de bien cadrer en amont)
- ADR en **format léger** (5 sections max, pas de pavé)

## Exemple d'usage

```
/kickoff S6.10-bis-LIGHT
> Effort: 1 j-binôme
> Objectif: Migrer decisions.html en framework Atomic Templates (page-pilote)
> Critères de sortie: 1 page migrée + 12 composants documentés + audit visuel diff < 5%
```

## Sortie attendue

- Dossier `04_docs/_sprints/<ID>/` créé
- `DOSSIER-SPRINT-<ID>.md` rédigé
- ADR de cadrage dans DECISIONS.md
- Milestone GitHub créée (côté CEO)
- TaskList Cowork mise à jour

## Sources

- ADR `2026-04-28 v9 · Lean ADD-AI`
- `04_docs/00_methode/METHODE-ADD-AI-aiCEO.md`
