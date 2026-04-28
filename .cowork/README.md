# `.cowork/` — Configuration Cowork pour aiCEO (Lean ADD-AI)

> **Livré** : Sprint S6.9-bis-LIGHT (28/04/2026 soir)
> **Mode** : Lean ADD-AI (variante minimaliste, cf. ADR v9)
> **Cible** : infrastructure prête pour S6.10-bis-LIGHT (Atomic Templates) + SPIKE-VALIDATION-ADD-AI

## Structure

```
.cowork/
├── plugins/
│   └── aiceo-dev/                    # Plugin custom aiCEO
│       ├── plugin.json               # Manifeste plugin
│       ├── skills/                   # 3 skills Lean
│       │   ├── kickoff.md            # /kickoff <sprint>
│       │   ├── ship.md               # /ship
│       │   └── retex.md              # /retex
│       └── agents/                   # 4 subagents experts
│           ├── architect.md
│           ├── dev-fullstack.md
│           ├── designer.md
│           └── qa-engineer.md
├── memory/                           # Mémoire structurée (bootstrap CLAUDE.md)
│   ├── product/                      # Promesse, contraintes
│   ├── tech/                         # Architecture, invariants, pièges
│   ├── retex/                        # 1 retex par sprint (vide au démarrage)
│   └── ceo-context/                  # Contexte ETIC + CEO
└── routines.json                     # 3 scheduled tasks Lean
```

## Différences vs version pleine ADD-AI (deferred S6.16-bis)

| Aspect | Lean (S6.9-bis-LIGHT) | Plein (S6.16-bis future) |
|---|---|---|
| Skills | 3 (`/kickoff`, `/ship`, `/retex`) | 10 |
| Subagents | 4 (architect, dev-fullstack, designer, qa-engineer) | 8 |
| Scheduled tasks | 3 essentielles (deferred impl) | 5 |
| Restructuration dossier | reportée | actée |
| Hooks git | pre-commit + post-commit | + pre-tag étendu |
| Effort | 0.5 j-binôme | 1.5 j-binôme |

**Rationale** : Lean = on formalise le minimum viable, on valide la promesse ADD-AI via SPIKE J+1, puis on enrichit incrémentalement quand le besoin réel apparaît.

## Comment utiliser

### Démarrer un sprint
```
/kickoff S6.10-bis-LIGHT
```
Le skill crée le dossier sprint, le DOSSIER-SPRINT.md, l'ADR de cadrage, et la milestone GitHub.

### Livrer un sprint
```
/ship
```
Pre-tag → smoke → commit → tag → release notes → ADR livraison.

### Capturer un retour d'expérience
```
/retex S6.10-bis-LIGHT
```
Génère un retex dans `.cowork/memory/retex/<date>-<ID>.md` et patche la mémoire si apprentissages durables.

### Invoquer un subagent expert
Via le tool `Agent` Claude Cowork avec `subagent_type: "aiceo-dev:architect"` (ou dev-fullstack, designer, qa-engineer).

## Mémoire (bootstrap)

Les fichiers de `.cowork/memory/` sont initialisés depuis CLAUDE.md sections clés :
- `product/promesse.md` ← CLAUDE.md §1
- `product/contraintes.md` ← CLAUDE.md §10 + ADRs S2.00, S6.1, v9, v11
- `tech/architecture.md` ← CLAUDE.md §3
- `tech/invariants.md` ← extraction règles inviolables
- `tech/pieges-connus.md` ← CLAUDE.md §5
- `ceo-context/etic-context.md` ← CLAUDE.md §1+§2

Chaque retex sprint peut patcher ces fichiers si apprentissages durables.

## Sources

- ADR `2026-04-28 v8 · Adoption ADD-AI`
- ADR `2026-04-28 v9 · Lean ADD-AI + 3 garde-fous`
- DOSSIER-SPRINT-S6.9-bis.md
- `04_docs/00_methode/METHODE-ADD-AI-aiCEO.md`
