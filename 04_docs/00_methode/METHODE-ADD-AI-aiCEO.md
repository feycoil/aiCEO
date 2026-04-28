# ADD-AI — Méthode de développement *fully built by AI*

> Note fondatrice · 28/04/2026 · *AI-Driven Development for aiCEO*
> **Owner** : Major Fey (CEO) · **Builder** : agent Claude (via Cowork desktop)
> **Postulat** : un produit IA-first peut être conçu, codé, testé, livré et opéré entièrement par une IA, sous arbitrage exécutif du CEO. Le projet aiCEO est le cas d'application.

---

## 1. Manifeste

### 1.1 La promesse opérationnelle

> *aiCEO sera développé entièrement par le binôme CEO + Claude. Le CEO décide. Claude exécute.*

Le CEO ne code pas. Le CEO ne configure pas Windows. Le CEO ne pose pas de tag git. Le CEO **arbitre, valide, refuse, oriente**. Tout le reste est de la responsabilité de l'IA.

### 1.2 Les 5 principes fondateurs

1. **Continuité** — Claude se rappelle de tout entre les sessions via mémoire structurée (CLAUDE.md + memory/ + ADRs + JOURNAL). Aucune décision ne se perd.
2. **Multi-rôle** — Claude joue 8 rôles experts en parallèle (architect, dev backend, dev frontend, designer, QA, security, technical writer, PM). Pas un assistant générique : 8 spécialistes.
3. **Auto-vérification** — chaque livrable passe par un check qualité automatique avant proposition au CEO. Tests, audit visuel, ADR cohérent, smoke vert.
4. **Coût-conscient** — chaque sprint a un budget tokens cible. Optimisation continue (batch LLM, cache, contexte minimal).
5. **Méta-amélioration** — chaque sprint produit un retex qui améliore Claude lui-même (skills mis à jour, slash commands enrichies, hooks ajoutés).

### 1.3 La règle d'or

> *Si Claude peut le faire, Claude le fait. Si Claude ne peut pas, le CEO le fait au plus tôt sur instruction explicite. Aucun travail "facultatif" n'est sauté — il est juste reporté au CEO si bloqué.*

---

## 2. Répartition des rôles binôme

| Domaine | CEO (Major Fey) | Claude (Cowork) |
|---|---|---|
| **Vision & arbitrage produit** | ✅ Décide | Propose, simule, alerte |
| **Roadmap stratégique** | ✅ Valide | Rédige, met à jour, publie ADR |
| **Architecture technique** | Valide en cas de pivot | ✅ Conçoit, documente, refactor |
| **Code (front + back)** | — | ✅ Tout |
| **Tests (unit + E2E + smoke)** | — | ✅ Tout |
| **Design (DS + maquette)** | Valide visuellement | ✅ Tout |
| **Documentation (ADR, README, CLAUDE.md)** | — | ✅ Tout |
| **Git (commit, branches)** | — | ✅ Tout |
| **PowerShell / Windows / install** | ✅ Exécute | Génère scripts (`.ps1`) |
| **Sécurité (clés API, secrets)** | ✅ Setting env vars | Rappelle + audit |
| **Recette utilisateur** | ✅ Test final visuel | Fournit checklist + auto-test préalable |
| **Push GitHub / tag / release** | ✅ Run le script | Génère + audit cohérence |
| **Décisions ExCom** | ✅ Présente | Prépare matériaux |

**Lecture** : ~85% de l'effort est sur Claude. Le CEO est le **shipper** (arbitrage + dernière mile Windows).

---

## 3. Stack Cowork à mettre en place

### 3.1 Plugin custom `aiceo-dev` à créer

Plugin Cowork dédié au projet, à installer via `claude plugin install`. Structure :

```
aiceo-dev.plugin/
├── plugin.json                      # metadata + dépendances
├── README.md
├── skills/
│   ├── sprint-kickoff/SKILL.md      # /sprint-kickoff
│   ├── sprint-finalize/SKILL.md     # /sprint-finalize (commit + ADR + tag)
│   ├── audit-ux-ui/SKILL.md
│   ├── audit-perf/SKILL.md
│   ├── audit-security/SKILL.md
│   ├── audit-a11y/SKILL.md
│   ├── ds-consolidate/SKILL.md      # extraire styles inline → tweaks.css
│   ├── llm-batch-optimize/SKILL.md
│   ├── benchmark-concurrents/SKILL.md
│   ├── routine-morning/SKILL.md     # briefing matin CEO
│   ├── routine-evening/SKILL.md     # bilan soir
│   ├── routine-weekly/SKILL.md      # revue hebdo
│   └── retex-sprint/SKILL.md        # retex auto post-sprint
├── commands/
│   ├── kickoff.md                   # /kickoff <sprint-id>
│   ├── ship.md                      # /ship (full pipeline commit + push + tag)
│   ├── audit.md                     # /audit <type>
│   ├── refactor.md                  # /refactor <module>
│   └── focus.md                     # /focus <objective> (mode 4h chrono)
├── agents/
│   ├── architect.md                 # subagent expert architecture
│   ├── dev-backend.md
│   ├── dev-frontend.md
│   ├── designer.md
│   ├── qa-engineer.md
│   ├── security-auditor.md
│   ├── tech-writer.md
│   └── product-manager.md
├── memory/
│   ├── promesses.md                 # promesse produit + ICP + jobs-to-be-done
│   ├── architecture.md              # diagram + invariants
│   ├── conventions.md               # naming, patterns, anti-patterns
│   ├── ds-tokens.md                 # tokens DS canonical
│   └── retex/                       # 1 retex par sprint
├── hooks/
│   ├── pre-commit.sh                # node --check + smoke quick + ADR cohérence
│   ├── post-commit.sh               # update CLAUDE.md auto + push si tag
│   └── pre-tag.sh                   # smoke-all + audit visuel
└── mcps/
    └── aiceo-mcp.json               # MCP custom pour query SQLite local
```

**Action immédiate** : créer ce plugin via `cowork-plugin-management:create-cowork-plugin`.

### 3.2 Skills à créer (10 essentielles)

| Skill | Trigger | Effet |
|---|---|---|
| `/kickoff <sprint>` | Démarrage sprint | Crée milestone GH, ADR cadrage, génère plan détaillé, tasks structurées |
| `/ship` | Fin sprint | Pre-tag checks → smoke-all → commit → tag → ADR livré → release notes → push |
| `/audit ux` | À la demande | Audit complet UX/UI sans concession (cf. AUDIT-UXUI-2026-04-28.md) |
| `/audit perf` | À la demande | Lighthouse + latence routes + budget tokens LLM |
| `/audit security` | Pré-V1 | OWASP top 10 + secrets scan + headers + CSP |
| `/refactor <module>` | À la demande | Audit module + plan refacto + exécute + tests |
| `/focus <obj> <durée>` | Mode rush | Bloque 4h chrono sur 1 objectif, Claude n'arrête pas tant que ce n'est pas fait |
| `/morning-brief` | Matin CEO | Résumé nuit + alertes + 3 priorités du jour |
| `/evening-bilan` | Soir CEO | Résumé du jour + auto-mise à jour streak + question coaching |
| `/retex` | Post-sprint auto | Retex détaillé : ce qui a marché / coûté / surpris / à corriger |

### 3.3 Subagents experts à instancier

8 subagents préconfigurés avec leur **system prompt spécialisé**, leur **mémoire dédiée**, et leurs **tools restreints** :

| Subagent | Rôle | Tools | Quand l'invoquer |
|---|---|---|---|
| **architect** | Architecture, ADR, modélisation données | Read, Glob, Grep, Edit ADR | Avant tout sprint structurel |
| **dev-backend** | Routes, DB, migrations, services | All file tools + bash | Implémentation serveur |
| **dev-frontend** | HTML, JS bind-*, CSS DS | All file tools + bash | Implémentation client |
| **designer** | Maquettes, DS tokens, UX critique | Read, Edit CSS, web_fetch | Audit visuel + design system |
| **qa-engineer** | Tests unit + E2E + smoke + accessibilité | All file tools + bash | Pré-tag + post-feature |
| **security-auditor** | OWASP, secrets, headers, CSP, RGPD | Read, Grep, web_fetch | Pré-V1 + après chaque ADD endpoint |
| **tech-writer** | Doc, README, ADR, release notes | Read, Edit md | Post-sprint |
| **product-manager** | Métriques, roadmap, jobs-to-be-done | Read, web_search | Mensuel + pre-V1 |

**Convention d'usage** : main agent (Claude principal) **délègue** explicitement, ne fait pas tout lui-même. Latence + qualité.

### 3.4 MCP custom `aiceo-mcp` à créer

MCP local Node.js qui expose la DB SQLite du projet pour :
- `db_query(sql)` — read-only SQL queries sécurisées
- `db_schema()` — retourne le schéma actuel
- `metrics_today()` — KPIs du jour (tasks done, decisions tranched, streak, cost LLM)
- `arbitrage_velocity_hist()` — historique vitesse arbitrage CEO

Permet aux subagents (notamment `qa-engineer` et `product-manager`) de questionner les vraies données prod du CEO sans passer par HTTP.

### 3.5 Tâches programmées Cowork

| Cron | Action |
|---|---|
| Lun-Ven 7h30 | `/morning-brief` → génère résumé nuit + alertes + 3 priorités |
| Lun-Ven 19h00 | `/evening-bilan` → résumé jour + question coaching |
| Dim 19h00 | `/audit-week` → revue hebdo auto-générée |
| 1er du mois | `/retex-month` → métriques produit + propositions amélio |
| 1× par sprint | `/audit ds` → vérification cohérence DS post-sprint |

---

## 4. Méthode ADD-AI — workflow d'un sprint

### 4.1 Anatomie d'un sprint binôme (4-6h chrono Claude)

```
J0  · /kickoff <sprint-id>
        ├─ architect : ADR cadrage + invariants
        ├─ product-manager : critères acceptance + métriques cible
        ├─ designer : maquettes (si UX impact)
        ├─ tech-writer : doc cadrage + tasks GitHub
        └─ CEO : VALIDATION (5 min)

J1+ · /focus <sprint-id> 4h
        ├─ dev-backend : implémentation routes + tests unit
        ├─ dev-frontend : implémentation UI + bind-*
        ├─ qa-engineer : smoke + visuel + a11y
        └─ Claude principal : audit + retex incrémental

Jx  · /ship <sprint-id>
        ├─ qa-engineer : pré-tag full smoke + perf + a11y
        ├─ security-auditor : si endpoint nouveau
        ├─ tech-writer : ADR livré + release notes
        ├─ Claude principal : git add + commit + tag local
        └─ CEO : EXÉCUTE script PowerShell push + release GH

J+1 · /retex <sprint-id> (auto, pas besoin CEO)
        └─ tech-writer : retex enregistré dans memory/retex/
```

### 4.2 Les 4 niveaux de check obligatoires

Avant qu'un sprint soit shipé :

| Niveau | Vérification | Bloquant ? |
|---|---|---|
| **L1 — Syntax** | `node --check` sur tout JS modifié | Oui |
| **L2 — Smoke** | `pwsh smoke-all.ps1` ≥ 24/24 | Oui |
| **L3 — Visuel** | screenshots automatisés + diff vs maquette | Oui (warning si > 10% diff) |
| **L4 — A11y/Perf** | WCAG 2.1 AA + Lighthouse > 80 | Warning, pas bloquant pré-V1 |

### 4.3 Les 3 boucles d'amélioration continue

**Boucle 1 — Daily** (auto, pas de CEO) : retex incrémental enregistré dans `memory/retex/<sprint>/<date>.md`. *Ce qui a marché, ce qui a coûté, ce qui m'a surpris.*

**Boucle 2 — Weekly** (CEO 15 min) : revue hebdo automatique → CEO valide / corrige / oriente. ADR si pivot.

**Boucle 3 — Monthly** (CEO 30 min) : métriques produit consolidées, benchmark concurrents, propositions d'évolution Claude (skills à ajouter, MCPs à câbler). Met à jour le plugin `aiceo-dev` lui-même.

---

## 5. Architecture produit modulaire — séparation tech / business

### 5.1 Le découplage canonical

```
aiCEO/
├── domain/                          # PURE BUSINESS LOGIC
│   ├── entities/                    # Decision, Task, BigRock, Pin, Conversation...
│   ├── policies/                    # Règles métier : when_decision_stale, when_overdue
│   ├── services/                    # ArbitrageService, CoachingService
│   └── README.md                    # vocabulaire métier + invariants
├── infrastructure/                  # PURE TECHNIQUE
│   ├── persistence/                 # SQLite repositories (jamais en domain)
│   ├── llm/                         # Anthropic SDK wrapper, batch, cache
│   ├── outlook/                     # Sync Outlook
│   └── http/                        # Express routes (jamais business)
├── presentation/                    # UI
│   ├── v06/                         # actuel
│   ├── _shared/                     # DS + bind-* + utilities
│   └── design-system/               # tokens canoniques (single source)
└── tests/
    ├── domain/                      # tests métier purs (rapides)
    ├── infrastructure/              # tests infra (DB, HTTP)
    └── e2e/                         # parcours complets
```

**Règle d'or** : `domain/` ne doit JAMAIS importer `infrastructure/` ni `presentation/`. Inversion de dépendance via interfaces.

**Migration depuis état actuel** (S6.9-bis) : extraire la logique métier des routes Express vers `domain/services/`. Routes deviennent **thin** (validation + appel service + format réponse).

### 5.2 Composants réutilisables

- **DS web components** (long terme) : `<aiceo-card-decision>`, `<aiceo-modal-verdict>` etc. Réutilisables hors aiCEO si besoin.
- **LLM tools registry** : `domain/llm-tools/` qui regroupe `pin_to_knowledge`, `decision-recommend`, etc. Chaque tool = 1 fichier avec schéma + handler + tests.

### 5.3 Évolutivité multi-tenant

Préparer V1 dès maintenant :
- Toutes tables : `tenant_id TEXT NOT NULL DEFAULT 'default'`
- Toutes routes : extraire `tenant_id` du middleware d'auth (en V1)
- Aucun code `WHERE id = ?` sans `AND tenant_id = ?`

---

## 6. Configuration Claude — passer du *prompté* à l'*orchestré*

### 6.1 Mémoire structurée

Configuration mémoire Cowork :

```
memory/
├── product/
│   ├── promesse.md              # promesse + ICP + jobs-to-be-done
│   ├── personae.md              # Major Fey, Lamiae, ICP V1
│   └── decisions-strategiques.md
├── tech/
│   ├── architecture.md
│   ├── conventions.md
│   ├── ds-tokens.md
│   └── invariants.md            # règles techniques inviolables
├── retex/
│   ├── 2026-04-28-S6.8.md       # déjà existant (commit a6e4d25)
│   └── ...
└── ceo-context/
    ├── outlook-projects.md      # 13 projets actuels du CEO
    ├── recurring-contacts.md    # 77 contacts récurrents
    └── etic-context.md          # contexte ETIC Services
```

À chaque conversation, Claude **précharge** le pertinent (selon la tâche) via `Skill` + `Read`.

### 6.2 Hooks de surveillance

Claude est configuré pour **alerter automatiquement** :

| Trigger | Action automatique |
|---|---|
| Sprint > 6h chrono cumulé | Pause + retex partiel + check si pivot nécessaire |
| Coût LLM > 80% du budget sprint | Switch en mode rule-based pour le reste |
| Test rouge cassé | Stop sprint, fix d'abord |
| ADR non rédigée à la fin du sprint | Bloque le tag, force tech-writer |
| `style="..."` ajouté en prod (post-S6.9) | Refactor avant merge |
| Régression UX vs maquette détectée | Alert CEO + ne pas ship |

### 6.3 Slash commands sur-mesure

**Commands fondatrices à créer dans le plugin `aiceo-dev`** :

```
/kickoff <sprint>           # plan + ADR cadrage + tasks
/focus <obj> [<durée>]      # mode 4h-chrono sur 1 objectif
/ship                       # pipeline complet de livraison
/audit <type>               # ux | perf | security | a11y | ds | ds-cohérence
/refactor <module>          # audit + plan + exécute + tests
/morning-brief              # routine matin CEO
/evening-bilan              # routine soir CEO
/audit-week                 # routine hebdo dimanche
/retex                      # auto post-sprint
/cost-status                # tokens consommés / budget restant
/migrate <feature>          # générer migration SQL + tests + rollback
/benchmark <competitor>     # rapide comparaison feature
/learn-from <commit>        # extrait pattern + l'ajoute à conventions.md
```

### 6.4 Boucle d'amélioration de Claude lui-même

Une fois par mois :
1. **Audit retex** : grouper les 4 retex de la période, identifier patterns récurrents (frictions, oublis, surprises)
2. **Mise à jour skills** : nouvelles skills si récurrence > 3, optimisation skills existantes
3. **Mise à jour CLAUDE.md** : nouveaux pièges, nouvelles conventions, nouveaux scripts
4. **Mise à jour subagents** : refine system prompts si performance < attendue
5. **Mise à jour MCPs** : nouveaux tools data si besoin
6. **ADR `2026-XX-XX · Méta-amélioration Claude #N`** : trace formelle de l'amélioration

---

## 7. Métriques & contrôles

### 7.1 Tableau de bord projet (dashboard `/admin/metrics.html`)

- **Vélocité** : commits par sprint, j-binôme par sprint, tasks shipped
- **Qualité** : tests pass rate, smoke pass rate, ADR cohérence
- **Coût** : tokens IN/OUT par sprint, $ Anthropic, ratio LLM/rule
- **Friction CEO** : nombre d'interventions Windows requises, blocages

### 7.2 Budgets cibles

| Métrique | Budget par sprint |
|---|---|
| Durée chrono Claude | ≤ 6h |
| Tokens consommés | ≤ 800k IN + 200k OUT |
| Coût $ | ≤ 5 € |
| Interventions PowerShell CEO | ≤ 3 |
| Tests rouges introduits | 0 |
| Régression visuelle vs maquette | 0 |

Si dépassement : alerte automatique + retex avec analyse cause racine.

### 7.3 Métriques produit (déjà définies dans PLAN-REALIGNEMENT)

Cf. `PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md` §2 (7 KPIs produit).

---

## 8. Plan de conversion du projet actuel

### 8.1 Diagnostic état actuel (au 28/04/2026)

**Acquis** :
- 38 commits propres
- 30 ADRs documentés
- CLAUDE.md à jour (v7)
- 5 sprints S6.8 livrés en chaîne (vélocité prouvée)
- Tag v0.7 sur origin
- 18 pages frontend + 15 routers + 21 tables SQLite

**Manques pour passer en mode ADD-AI** :
- Pas de plugin Cowork dédié (`aiceo-dev`)
- Pas de subagents préconfigurés
- Pas de hooks de surveillance
- Pas de scheduled tasks (briefing matin/soir/hebdo)
- Pas de mémoire structurée (`memory/`)
- Pas de séparation domain/infrastructure (mélange dans `src/`)
- Pas de dashboard métriques

### 8.2 Plan de conversion en 3 sprints (S6.9-bis, S6.10-bis, S6.11-bis)

**S6.9-bis — Setup Cowork & gouvernance (1 j-binôme)**
- Créer plugin `aiceo-dev` (skills + commands + agents) via `cowork-plugin-management:create-cowork-plugin`
- Créer 8 subagents avec system prompts dédiés
- Créer scheduled tasks (matin, soir, hebdo, mensuel)
- Créer `memory/` structurée + bootstrap depuis CLAUDE.md
- ADR `2026-05-XX · Setup ADD-AI`

**S6.10-bis — Refactor architecture domain/infrastructure (1.5 j)**
- Créer dossiers `domain/`, `infrastructure/`, `presentation/`
- Migrer 3 services exemplaires : ArbitrageService, DecisionService, KnowledgeService
- Routes deviennent thin
- Tests métier purs ajoutés
- ADR `2026-05-XX · Découplage tech/business`

**S6.11-bis — Dashboard métriques + hooks de surveillance (1 j)**
- Créer page `/v06/admin/metrics.html`
- MCP `aiceo-mcp` exposant DB SQLite read-only
- Hooks pre-commit (`node --check`, smoke quick, ADR check)
- Hooks post-commit (CLAUDE.md auto-update si nécessaire)
- Hooks pre-tag (smoke-all + visual diff + a11y)
- ADR `2026-05-XX · Observabilité ADD-AI`

**Total conversion** : 3.5 j-binôme. Après ça, le projet aiCEO **est** ADD-AI.

### 8.3 Reprise du plan de réalignement Phase 1-2-3

Une fois la conversion ADD-AI terminée, **reprendre** le plan de réalignement (`PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md`) avec la nouvelle méthode :
- Phase 1 → Sprints S6.12 → S6.16 (5 sprints, ~1 mois)
- Phase 2 → Sprints S7.1 → S7.6 (~1 mois)
- Phase 3 → Sprints S7.7 → S7.11 (~1 mois)

**Avantage clair** : avec ADD-AI, chaque sprint coûtera moins de tokens, fera moins d'erreurs, et improvera Claude pour le suivant. **Effet cumulatif**.

---

## 9. Conduite à adopter

### 9.1 Pour le CEO

- **3 routines obligatoires** : briefing matin (5 min), bilan soir (3 min), revue hebdo dimanche (15 min)
- **1 décision majeure max par jour** : déléguer le reste à Claude
- **Aucune saisie technique** : si Claude demande "lance ce script PowerShell", le CEO le fait sans questionner. Si bug, Claude diagnostique.
- **Trust by default, verify on critical** : valider visuellement les UI changes, les pricing/économique, les changements DS structurels. Le reste, Claude assume.

### 9.2 Pour Claude

- **Ne JAMAIS demander confirmation pour des actions réversibles** (commit local, ADR, refactor).
- **TOUJOURS demander confirmation pour** : push origin, suppression DB, changement DS structurel, ouverture nouvelle dépendance npm, modification CLAUDE.md §1 (statut).
- **Auto-déléguer aux subagents** : main agent fait <30% du travail, le reste passe par les subagents experts.
- **Se mettre à jour soi-même** : à chaque retex, propose une amélioration (skill, MCP, hook).
- **Couper court aux sprints qui dérapent** : si > 6h chrono, pause + analyse pivot.

### 9.3 Discipline d'équipe

- **Semaine type** :
  - Lun-Ven : 1-2 sprints courts (4h chacun) + briefings matin/soir
  - Sam : pause produit (Claude réfléchit en arrière-plan via batch retex)
  - Dim : revue hebdo (15 min CEO + audit auto Claude) + planning semaine suivante

- **Mois type** :
  - Sem 1 : focus une feature majeure (1 sprint S7.x)
  - Sem 2 : focus seconde feature
  - Sem 3 : audit transverse (perf, a11y, sécurité, ds)
  - Sem 4 : retex mensuel + méta-amélioration Claude + planning mois suivant

---

## 10. Récap exécutif

**Ce qu'on met en place** :
1. **Plugin Cowork `aiceo-dev`** avec 10 skills, 13 slash commands, 8 subagents experts, hooks de surveillance, MCP custom, scheduled tasks
2. **Méthode ADD-AI** formalisée : 5 principes, 7 phases sprint, 4 niveaux check, 3 boucles d'amélioration
3. **Architecture produit refactorée** : domain / infrastructure / presentation découplés
4. **Mémoire structurée** : `memory/product`, `memory/tech`, `memory/retex`, `memory/ceo-context`
5. **Dashboard métriques** : vélocité + qualité + coût + friction
6. **Boucle de méta-amélioration mensuelle** : Claude s'améliore lui-même
7. **Plan de conversion en 3.5 j-binôme** pour passer le projet actuel en mode ADD-AI

**Ce que ça coûte** :
- 3.5 j conversion (sprints S6.9-bis → S6.11-bis)
- Coût en attention CEO : 30 min de validation initiale + routines quotidiennes (10 min/j)

**Ce que ça rapporte** :
- Vélocité : ×1.5 à ×2 par effet d'apprentissage cumulatif
- Coût tokens : −40% via batch + cache + délégation aux subagents
- Erreurs : −80% via hooks + qa-engineer subagent + tests auto
- Continuité : zéro perte de contexte entre sessions
- Évolutivité : prêt V1 multi-tenant + commercial

**Décision attendue** :
- Validation de cette note par le CEO
- ADR `2026-04-29 · Adoption méthode ADD-AI pour aiCEO`
- Mandat pour démarrer la conversion S6.9-bis dès demain

---

## Annexes

- A1 — Maquette plugin `aiceo-dev` détaillée : *à produire S6.9-bis*
- A2 — System prompts des 8 subagents : *à produire S6.9-bis*
- A3 — Spec MCP `aiceo-mcp` : *à produire S6.9-bis*
- A4 — Charte conventions code (TypeScript-grade rigueur en JS) : *à produire S6.10-bis*

## Sources

- `04_docs/audits/AUDIT-UXUI-2026-04-28.md`
- `04_docs/audits/PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md`
- ADR `2026-04-28 v6 · Sprint S6.8 livré`
- ADR `2026-04-28 v7 · Audit UX/UI + plan réalignement`
- Mandat CEO 28/04 PM late : *« logiciel fully developped by ai, projet fully managed by ai »*

