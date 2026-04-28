# Sprint S6.9-bis — Setup ADD-AI + restructuration projet + extension pilotage

> **Origine** : ADR `2026-04-28 v8 · Adoption méthode ADD-AI` + mandat CEO 28/04 PM late
> **Préalable indispensable** avant Phase 1 du Plan de Réalignement
> **Effort estimé (LEAN)** : 0.5 j-binôme (~3h chrono Claude) — version allégée validée par CEO 28/04 PM late
> **Effort plein (deferred)** : 1.5 j → reporté à S6.16-bis post-V1 si ADD-AI valide ses promesses
> **Cible LEAN** : Cowork minimal (3 skills + 4 subagents) + memory/ bootstrap + hooks essentiels. Restructuration dossier reportée à S6.16-bis.

---

## ⚡ Note LEAN ADD-AI (28/04 PM late)

**Décision CEO** : adopter la variante Lean ADD-AI plutôt que la version pleine.

**Ajustements vs version originale** :
- ✂️ Skills : 3 essentielles (`/kickoff`, `/ship`, `/retex`) au lieu de 10
- ✂️ Subagents : 4 essentiels (architect, dev-fullstack, designer, qa-engineer) au lieu de 8
- ✂️ Restructuration dossier projet : **reportée à S6.16-bis** (fin de course, après V1 validé)
- ✂️ Scheduled tasks : 3 essentielles (morning, evening, weekly) au lieu de 5
- ✂️ Plugin Cowork minimal viable, pas exhaustif
- ✅ Hooks git pre-commit + post-commit gardés
- ✅ Memory/ bootstrap depuis CLAUDE.md gardé
- ✅ ADR de cadrage gardée

**Effort réduit** : 1.5 j → **0.5 j** (3h chrono Claude).

**Rationale** : éviter la sur-ingénierie en Phase 0. On formalise le minimum viable, on valide la promesse ADD-AI via spike J+1, puis on enrichit incrémentalement quand le besoin réel apparaît.

---

## Objectifs du sprint

1. **Restructurer le dossier projet** pour s'adapter à la démarche ADD-AI tout en conservant 100% du contenu existant
2. **Étendre le pilotage** avec arborescence + sync GitHub automatique
3. **Configurer Cowork** : plugin `aiceo-dev`, 8 subagents, mémoire structurée, scheduled tasks, hooks
4. **Documenter la méthode** opérationnelle (slash commands, conventions, retex template)
5. **Lancer la routine de synchronisation** du pilotage à chaque commit + chaque heure

---

## 1. Restructuration du dossier projet

### État actuel

```
aiCEO/
├── 00_BOUSSOLE/                     # ADRs + ROADMAP
├── 03_mvp/                          # code app
│   ├── src/                         # tout en vrac (routes/, db.js, server.js)
│   ├── public/                      # tout en vrac (v06/, _shared-atomic/)
│   ├── data/                        # SQLite + emails JSON
│   ├── scripts/                     # PowerShell + Node
│   └── tests/
├── 04_docs/                         # docs éparpillées
│   ├── 00-README.md, 01-vision-produit.md, ...
│   ├── audits/
│   ├── api/
│   ├── _design-v05-claude/
│   └── _sprint-*/
├── _archive/                        # archives backlog initial
├── scripts/                         # NEW (S6.9-bis) : generate-pilotage
└── *.ps1                            # 18 scripts PowerShell racine
```

### Cible (S6.9-bis)

```
aiCEO/
├── 00_BOUSSOLE/                     # inchangé : ADRs + ROADMAP (canonique)
├── 04_docs/                         # SOURCE DE VERITE doc
│   ├── 00_methode/                  # ADD-AI + framework + conventions
│   │   ├── METHODE-ADD-AI-aiCEO.md
│   │   ├── FRAMEWORK-ATOMIC-TEMPLATES.md  (S6.10-bis)
│   │   ├── CONVENTIONS-CODE.md
│   │   ├── PILOTAGE-USAGE.md
│   │   └── RETEX-TEMPLATE.md
│   ├── 01_produit/                  # vision, ICP, jobs-to-be-done
│   │   ├── PRD-aiCEO.md
│   │   ├── 01-vision-produit.md
│   │   ├── 02-benchmark.md
│   │   └── PERSONAE.md
│   ├── 02_architecture/             # tech, DB, routes, DS
│   │   ├── 06-architecture.md
│   │   ├── 07-design-system.md
│   │   ├── api/INDEX.md, api/*.md
│   │   └── DOMAIN-MODEL.md
│   ├── 03_roadmap/                  # roadmap + plan + livraisons
│   │   ├── 08-roadmap.md
│   │   ├── PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md
│   │   └── _release-notes/
│   ├── 04_design/                   # maquettes Claude Design
│   │   └── _design-v05-claude/      (renommé)
│   ├── 05_recette/                  # checklists CEO
│   │   ├── ONBOARDING-CEO-PAIR.md
│   │   ├── INSTALL-WINDOWS.md
│   │   └── RECETTE-*.md
│   ├── 06_audits/                   # rapports d'audit (déjà existe)
│   ├── 07_sprints/                  # 1 dossier par sprint
│   │   ├── _index.md
│   │   ├── S5/
│   │   ├── S6.1/, S6.2/, ..., S6.8/
│   │   ├── S6.9-bis/
│   │   └── S6.10-bis/
│   └── 00-pilotage-projet.html      # dashboard auto-généré
├── 03_mvp/                          # code app — restructuration en S6.10-bis
│   ├── domain/                      # business logic pure
│   ├── infrastructure/              # DB + LLM + HTTP
│   ├── presentation/                # UI = ex-public/
│   ├── data/
│   ├── scripts/
│   └── tests/
├── scripts/                         # outillage projet (pilotage, ADD-AI)
│   ├── generate-pilotage.js
│   ├── pilotage-template.html
│   ├── adr-new.js                   # nouveau (S6.9-bis)
│   ├── retex-new.js                 # nouveau (S6.9-bis)
│   └── consistence-dump-now.js      # nouveau (S6.9-bis)
├── .cowork/                         # NOUVEAU : config Cowork
│   ├── memory/                      # mémoire structurée
│   │   ├── product/
│   │   ├── tech/
│   │   ├── retex/
│   │   └── ceo-context/
│   ├── plugins/aiceo-dev/           # plugin custom (créé S6.9-bis)
│   └── routines.json                # scheduled tasks
├── tools/                           # NOUVEAU : scripts shell utilisateur
│   ├── update-pilotage.ps1
│   ├── restart-server.ps1
│   ├── fix-db-malformed.ps1
│   └── ... (déplacement 18 scripts ps1 racine)
├── CLAUDE.md                        # inchangé : point d'entrée Claude
└── README.md                        # nouveau : guide CEO

_archive/                            # inchangé
```

### Plan de migration (préserve tout, déplace propre)

| Action | Effet | Risque |
|---|---|---|
| Déplacer 18 `*.ps1` racine → `tools/` | clean racine | aucun (paths absolus dans scripts) |
| Renommer `04_docs/` → garder mais sous-classer en `00_methode/`, `01_produit/`, etc. | Doc structurée par domaine | Moyennement risqué (les liens internes des .md devront être patchés via script) |
| Rassembler tous les sprints `04_docs/_sprint-*` → `04_docs/07_sprints/` | regroupement | aucun |
| Créer `.cowork/` racine avec memory/plugins/routines | infrastructure ADD-AI | aucun (nouveau) |
| Garder `03_mvp/` tel quel pour S6.10-bis | refactor archi en S6.10-bis | trop risqué de tout faire en une fois |

**Discipline** : un script de migration `tools/restructure-2026-04-29.ps1` qui fait tous les `Move-Item` + un script `update-md-links.js` qui patch les liens internes.

---

## 2. Extension pilotage (déjà partiellement livré dans le commit en cours)

✅ Section "🌳 Arborescence projet" (3 niveaux, icônes par type)
✅ Section "🔗 État GitHub" (milestones + issues open/closed + releases)
✅ Sync auto via hook `post-commit`

**À ajouter en S6.9-bis** :
- Routine PowerShell `consistence-dump-hourly.ps1` qui regénère `consistence-dump.json` chaque heure (schtasks Windows)
- Section "⚠️ Décrochages" qui détecte automatiquement les sprints qui ont dépassé leur budget (via comparaison vs `routines.json`)
- Section "💰 Coût LLM" (à venir Phase 2 quand instrumentation en place)
- Section "🔥 Streak CEO" (depuis `evening_sessions`)

---

## 3. Configuration Cowork (plugin `aiceo-dev`)

### 3.1 Skills à créer (10)

| Skill | Trigger | Effet | Priorité S6.9-bis |
|---|---|---|---|
| `/kickoff <sprint>` | Démarrage sprint | Crée milestone + ADR + plan | **P0** |
| `/ship` | Fin sprint | Pre-tag → smoke → commit → tag → release | **P0** |
| `/audit ux/perf/security/a11y` | À la demande | Audit dédié | P1 |
| `/refactor <module>` | À la demande | Audit + plan + exécute | P1 |
| `/focus <obj> <durée>` | Mode rush | 4h chrono sur 1 obj | P1 |
| `/morning-brief` | Matin CEO | Résumé nuit + alertes | **P0** |
| `/evening-bilan` | Soir CEO | Résumé jour + question | **P0** |
| `/audit-week` | Dim soir | Revue hebdo auto | P1 |
| `/retex` | Post-sprint auto | Retex automatique | **P0** |
| `/cost-status` | Anytime | Budget tokens consommés | P1 |

**Commande Cowork** : utilise le plugin `cowork-plugin-management:create-cowork-plugin` qui génère le squelette.

### 3.2 Subagents experts (8)

| Subagent | Rôle | Tools | System prompt cible |
|---|---|---|---|
| `architect` | Architecture, ADR, modélisation | Read, Glob, Grep, Edit | "Tu es un architecte logiciel senior. Tu raisonnes en termes d'invariants, de découplage, de testabilité..." |
| `dev-backend` | Routes, DB, services | All file + bash | "Tu es un dev senior Node/SQLite. Tu écris du code testable, sans effets de bord cachés..." |
| `dev-frontend` | HTML, JS bind-*, CSS DS | All file + bash | "Tu es un dev frontend senior. Pas de framework lourd. Vanilla JS + Web Components..." |
| `designer` | DS, maquettes, UX critique | Read, Edit CSS, web_fetch | "Tu es un designer produit senior. Tu raisonnes en parcours utilisateur..." |
| `qa-engineer` | Tests + smoke + a11y | All file + bash | "Tu es un QA engineer senior. Tu testes les cas limites, les états vides, les erreurs..." |
| `security-auditor` | OWASP, secrets, RGPD | Read, Grep, web_fetch | "Tu es un security engineer. Tu cherches les fuites, les XSS, les injections..." |
| `tech-writer` | Doc, README, ADR | Read, Edit md | "Tu es un technical writer. Tu écris clair, concis, structuré..." |
| `product-manager` | Métriques, roadmap | Read, web_search | "Tu es un PM senior. Tu raisonnes ROI, métriques, jobs-to-be-done..." |

Chaque subagent = 1 fichier `.md` dans `.cowork/plugins/aiceo-dev/agents/<nom>.md` avec son system prompt.

### 3.3 Mémoire structurée

```
.cowork/memory/
├── product/
│   ├── promesse.md            # promesse + ICP + jobs-to-be-done
│   ├── personae.md            # Major Fey, Lamiae
│   ├── decisions-strategiques.md
│   └── contraintes.md         # zero cloud, RGPD, souveraineté
├── tech/
│   ├── architecture.md
│   ├── conventions.md
│   ├── ds-tokens.md
│   ├── invariants.md          # règles inviolables
│   └── pieges-connus.md       # NUL bytes, mount Windows, etc.
├── retex/                     # 1 retex par sprint
│   ├── _template.md
│   └── 2026-04-28-S6.8.md
└── ceo-context/
    ├── projets-actifs.md      # 13 projets ETIC
    ├── contacts-recurrents.md # 77 contacts
    └── etic-context.md
```

Bootstrap depuis `CLAUDE.md` actuel (extraction sections § par §).

### 3.4 Scheduled tasks (Cowork)

Configuration `.cowork/routines.json` :
```json
{
  "routines": [
    { "name": "morning-brief", "cron": "0 30 7 * * 1-5", "skill": "/morning-brief" },
    { "name": "evening-bilan", "cron": "0 0 19 * * 1-5", "skill": "/evening-bilan" },
    { "name": "audit-week", "cron": "0 0 19 * * 0", "skill": "/audit-week" },
    { "name": "retex-month", "cron": "0 0 9 1 * *", "skill": "/retex" },
    { "name": "consistence-hourly", "cron": "0 0 * * * *", "command": "node scripts/consistence-dump-now.js" }
  ]
}
```

### 3.5 Hooks de surveillance

`.git/hooks/pre-commit` : `node --check` + smoke quick + ADR cohérence
`.git/hooks/post-commit` : régen pilotage (déjà installé)
`.git/hooks/pre-tag` : smoke-all + audit visuel diff vs maquette + ADR `livré` présent

---

## 4. Documentation méthode opérationnelle

À produire dans S6.9-bis :

- `04_docs/00_methode/CONVENTIONS-CODE.md` : naming, patterns, anti-patterns, exemples avant/après
- `04_docs/00_methode/RETEX-TEMPLATE.md` : template retex à dupliquer chaque sprint
- `04_docs/00_methode/CHEAT-SHEET-CLAUDE.md` : référence rapide des slash commands + subagents

---

## 5. Roadmap mise à jour

Fichier `04_docs/03_roadmap/PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md` mis à jour :
- Insertion **Sprint S6.9-bis** (ce sprint) avant Phase 1
- Insertion **Sprint S6.10-bis** Refonte Frontend (Atomic Templates) avant Phase 1 sprint S6.9 DS consolidation
- Renumérotation Phase 1 sprints : S6.11 → S6.15 (au lieu de S6.9 → S6.13)

---

## 6. Tasks détaillées S6.9-bis

| # | Task | Effort |
|---|---|---|
| 1 | Étendre `generate-pilotage.js` (tree + github) | 30 min ✅ fait |
| 2 | Étendre template HTML pilotage (2 sections) | 30 min ✅ fait |
| 3 | Créer `tools/restructure-2026-04-29.ps1` (Move-Item batch) | 45 min |
| 4 | Créer `tools/update-md-links.js` (patch liens internes) | 30 min |
| 5 | Lancer la restructuration sur le projet | 15 min |
| 6 | Créer `.cowork/memory/` + bootstrap depuis CLAUDE.md | 1h |
| 7 | Créer plugin `aiceo-dev` via cowork-plugin-management | 1h |
| 8 | Créer 8 subagents (.md system prompts) | 1h |
| 9 | Créer 10 skills (.md descriptions) | 1h |
| 10 | Créer hooks git pre-commit + pre-tag | 30 min |
| 11 | Documenter conventions + cheat-sheet + retex template | 1h |
| 12 | Mettre à jour PLAN-REALIGNEMENT avec S6.9-bis + S6.10-bis | 15 min |
| 13 | Commit + ADR `2026-04-29 · S6.9-bis livré` | 15 min |

**Total** : ~8h30 (1.5 j-binôme)

---

## 7. Critères d'acceptance

- ✅ Dashboard pilotage affiche tree + GitHub (déjà fait)
- ⏳ Tous les `*.ps1` racine déplacés dans `tools/`
- ⏳ Tous les liens internes .md fonctionnels après restructuration
- ⏳ Plugin `aiceo-dev` installé et utilisable via slash commands dans Cowork
- ⏳ 8 subagents instanciables via `Agent` tool
- ⏳ Hook git post-commit régénère le pilotage à chaque commit
- ⏳ Hook git pre-commit refuse les commits qui cassent `node --check`
- ⏳ ADR `2026-04-29 · S6.9-bis livré` rédigée

---

## 8. Risques

| # | Risque | Mitigation |
|---|---|---|
| R1 | Restructuration casse les liens .md (plein de relatifs) | Script `update-md-links.js` avec regex + dry-run avant apply |
| R2 | Les `*.ps1` racine sont référencés dans des docs avec chemins absolus | Grep avant move + patch des docs |
| R3 | Cowork plugin custom complexe à créer en 1 sprint | Démarrer minimal (3 skills + 4 subagents) puis itérer |
| R4 | Perte de continuité Claude pendant la restructuration | Bootstrapper memory/ AVANT le déménagement |

---

## 9. Sources

- ADR `2026-04-28 v8 · Adoption méthode ADD-AI`
- `04_docs/00_methode/METHODE-ADD-AI-aiCEO.md` (note descriptive complète)
- Mandat CEO 28/04 PM late : *"projet fully managed by ai"*

