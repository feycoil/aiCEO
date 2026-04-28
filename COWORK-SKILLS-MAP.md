# COWORK-SKILLS-MAP — Quel skill pour quelle action sur aiCEO

> Référentiel rapide pour le binôme CEO + Claude. À chaque action courante, le slash command à utiliser.

## Cycle sprint

| Étape sprint | Slash command | Output attendu |
|---|---|---|
| Cadrage sprint | `/product-management:sprint-planning` | DOSSIER-SPRINT-SX.md (7 sections) |
| Spec d'une feature | `/product-management:write-spec` | SPEC-feature.md (PRD complet) |
| ADR choix tech | `/engineering:architecture` | ADR dans DECISIONS.md |
| Code review PR | `/engineering:code-review` | Rapport critique + recommandations |
| Debug bug | `/engineering:debug` | Reproduce + isolate + fix |
| Pre-deploy | `/engineering:deploy-checklist` | Checklist + rollback plan |
| Release notes | `/engineering:documentation` | release-notes/vX.Y.md |
| Audit dette | `/engineering:tech-debt` | Backlog refactor priorisé |

## Cycle design (v0.6 prioritaire)

| Étape | Slash command | Output |
|---|---|---|
| Audit DS existant | `/design:design-system` | Rapport cohérence + naming + tokens |
| Critique composant | `/design:design-critique` | Feedback usabilité + hiérarchie |
| Spec dev | `/design:design-handoff` | Spec sheet (props, states, breakpoints) |
| A11y check | `/design:accessibility-review` | Audit WCAG 2.1 AA |
| Microcopy | `/design:ux-copy` | Copy review + propositions |
| Synthèse user research | `/design:research-synthesis` | Thèmes + insights + recommandations |

## Cycle décision + gouvernance

| Type décision | Slash command | Output |
|---|---|---|
| Compliance check (RGPD, multi-tenant) | `/legal:compliance-check` | Liste régulations + approbations + risques |
| Audit vendor (Supabase, etc.) | `/legal:vendor-check` | Statut contrats + gap analysis |
| Risk assessment projet | `/legal:legal-risk-assessment` | Severity × likelihood + escalation |
| Préparation meeting ExCom | `/legal:meeting-briefing` | Brief structuré + action items |
| Variance analysis budget | `/finance:variance-analysis` | Décomposition par driver + commentaire |

## Cycle communication

| Cible | Slash command | Output |
|---|---|---|
| Slides ExCom | `/anthropic-skills:internal-comms` ou `/anthropic-skills:pptx` | .pptx structuré ETIC |
| Onepager investisseur | `/marketing:draft-content` | .md / .html A4 |
| Document long (.docx) | `/anthropic-skills:docx` | .docx pro |
| PDF (export recette, contrats) | `/anthropic-skills:pdf` | .pdf |
| Tableur budget | `/anthropic-skills:xlsx` | .xlsx avec formules |
| Co-rédaction spec longue | `/anthropic-skills:doc-coauthoring` | Workflow itératif |
| Email externe (CEO pair) | `/marketing:draft-content` | Mail FR/EN |
| Stakeholder update | `/product-management:stakeholder-update` | Update audience-tailored |

## Cycle continuité (sessions Claude)

| Action | Slash command | Output |
|---|---|---|
| Update CLAUDE.md fin de sprint | `/productivity:memory-management` | CLAUDE.md enrichi |
| Tracker tâches cross-session | `/productivity:task-management` | TASKS.md |
| Sync tâches du tracker GitHub | `/productivity:update` | TASKS.md à jour |
| Init système productivité (1 fois) | `/productivity:start` | Bootstrap |
| Nettoyage trimestriel mémoire | `/anthropic-skills:consolidate-memory` | Mémoire condensée |
| Digest hebdo cross-sources | `/enterprise-search:digest` | Digest mardi/vendredi |
| Recherche projet (toutes sources) | `/enterprise-search:search` | Résultats agrégés |

## Cycle data + métriques

| Action | Slash command | Output |
|---|---|---|
| Métriques produit aiCEO | `/product-management:metrics-review` | Scorecard + recommandations |
| Analyse data ad-hoc | `/data:analyze` | Réponse à question data |
| Dashboard interactif | `/data:build-dashboard` | .html interactif |
| Visualisation publication | `/data:create-viz` | .png / .html chart |
| Validation analyse | `/data:validate-data` | Audit méthodologie |

## Cycle V1 onboarding pairs

| Action | Slash command | Output |
|---|---|---|
| Onboarding nouveau pair (Lamiae V1) | `/human-resources:onboarding` | Checklist + plan 30/60/90j |
| Plan recrutement futur (V2) | `/human-resources:org-planning` | Org design + headcount |
| Comp analysis pair (si rémunéré) | `/human-resources:comp-analysis` | Benchmark + bands |
| Performance review pair (V2+) | `/human-resources:performance-review` | Self + manager + calibration |

## Cycle support utilisateur (post-V1.2 équipes)

| Action | Slash command | Output |
|---|---|---|
| Triage ticket bug pair CEO | `/customer-support:ticket-triage` | Priorité P1-P4 + routing |
| Recherche réponse client | `/customer-support:customer-research` | Réponse multi-sources sourcée |
| Draft réponse client | `/customer-support:draft-response` | Mail/message client adapté |
| Article KB après bug | `/customer-support:kb-article` | KB article structurée |
| Escalation engineering | `/customer-support:customer-escalation` | Package escalation |

## Slash commands à mémoriser ABSOLUMENT (top 10)

1. `/product-management:sprint-planning` — kickoff sprint
2. `/engineering:architecture` — ADR
3. `/engineering:code-review` — review PR
4. `/design:design-critique` — critique composant
5. `/design:accessibility-review` — audit WCAG
6. `/anthropic-skills:internal-comms` — slides ExCom
7. `/anthropic-skills:doc-coauthoring` — spec longue
8. `/legal:compliance-check` — RGPD multi-tenant V1.1
9. `/finance:variance-analysis` — suivi budget V1
10. `/productivity:memory-management` — update CLAUDE.md

---

## Plugins/MCPs externes à installer (priorité V1)

À installer dans Cowork → Plugins → Marketplace, ou via `/mcp-registry:search_mcp_registry` puis `/mcp-registry:suggest_connectors`.

### Phase V1.1 (multi-tenant)
- **Supabase MCP** : dev schema + RLS depuis Claude

### Phase V1.3 (intégrations)
- **Microsoft Graph MCP** : Outlook avancé + Teams + SharePoint
- **GitHub Actions MCP** : workflows CI/CD

### Phase V1.4 (mobile)
- **PostHog MCP** : analytics mobile

### Phase V1.6 (monitoring)
- **Sentry MCP** : erreurs prod
- **Langfuse MCP** : tracing prompts (cost + debug)

### Optionnels
- **Slack MCP** (alternative Teams)
- **Notion MCP** (si pair sur Notion)

---

## Source

- Référentiel skills installés : sandbox /sessions/<id>/mnt/.claude/skills/
- Plugin manager : `/cowork-plugin-management:cowork-plugin-customizer`
- Mémoire projet : `C:\_workarea_local\aiCEO\CLAUDE.md`
