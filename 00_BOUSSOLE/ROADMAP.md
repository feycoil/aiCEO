# ROADMAP — compagnon texte de la carte interactive

Pour la carte cliquable : [`04_docs/11-roadmap-map.html`](../04_docs/11-roadmap-map.html).
Pour le détail produit (jalons, équipe, budgets, KPIs) : [`04_docs/08-roadmap.md`](../04_docs/08-roadmap.md) (v3.3 — restructuration 28/04 post-S6.4).

## Où nous en sommes — 28/04/2026

| Branche | État | Tag / milestone GitHub |
|---|---|---|
| **App Web Twisty** (`01_app-web/`) | Abouti v4, absorbé dans la fusion v0.5 | — (archivée) |
| **MVP Node** (`03_mvp/`) | Validé en réel v0.4 · 28/28 tâches arbitrées · ≈ 1,5 ct/jour | Tag `v0.4` · milestone `MVP` |
| **Produit unifié v0.5** | **✅ LIVRÉ 26/04/2026** — 5 sprints en ~16h chrono dogfood, vélocité x30 | Tag `v0.5` · milestones `v0.5-s1` à `v0.5-s5` closes |
| **Bundle design Claude Design v3.1** | ✅ Livré 26/04 (cible visuelle V1) | `04_docs/_design-v05-claude/` |
| **v0.6 — Interface finalisée + câblage réel** | **✅ LIVRÉ 28/04/2026** — 4 sprints S6.1 (DS atomic) + S6.2-S6.3 (Phase A 17 écrans) + S6.4 (câblage backend SQLite + 13/17 pages API + sync emails Outlook) | Tag `v0.6-s6.1` posé · `v0.6-s6.4` à poser post-recette |
| **v0.7 — LLM + events Outlook + gaps** | 🔜 Ouverture post-recette ExCom (~3-4 sessions binôme · ~5 k€) | milestone `v0.7` à créer |
| **V1 — SaaS + équipes + mobile** | 🔜 Démarrage post-v0.7 (6 thèmes ~41 k€ binôme/6 mois, vs 46 k€ initial : -5 k€ absorbés v0.7) | milestone `V1` à recréer |
| **V2 — commercial international + i18n + SOC 2** | Esquissée (ex-V2 multi-tenant absorbé en V1) | milestone `V2` à redéfinir |
| **V3 — coach + offline + multi-CEO écosystème** | Stable | milestone `V3` |

**Réalignement v3.3 (ADR 28/04)** : v0.6 livrée différemment de prévu (scope enrichi via S6.4 câblage réel + ingestion emails SQLite + bootstrap auto). v0.7 inséré entre v0.6 et V1 pour combler les 5 gaps identifiés CR-GAP : LLM Anthropic 4 surfaces UX (coaching, decision-recommend, auto-draft, "Si vous tranchez A"), sync events Outlook calendrier, status decision 'reportee' (kanban persistant), FK emails→projects + UI rattachement, 3 pages preview à câbler. Budget V1 réduit de 46 k€ → 41 k€.

**Réalignement v3.0 (ADR 26/04)** : la nouvelle V1 absorbe ce qui était V2 (multi-tenant) et V3 (mobile) dans la ROADMAP v2.0 du 24/04. Cause : pression Microsoft Copilot CEO 2027 + vélocité x30 binôme CEO+Claude validée sur v0.5.

Source unique de vérité opérationnelle : **GitHub Issues** sur [`feycoil/aiCEO`](https://github.com/feycoil/aiCEO/issues) — milestones v0.5 closes, V1 à ouvrir, V2 et V3 à redéfinir.

## Jalons clés

### Fait

- **MVP v0.4** (24/04/2026) : arbitrage 3 / 2 / N, délégation un-clic, boucle du soir, import Outlook 30 j, contexte email dans prompt, support proxy corp, chip coral sous pression. Run réel 28/28 tâches classées en 41 s, 5,2 k tokens in / 2,5 k out, ≈ 1 ct / arbitrage.
- **App Web Twisty v4** : cockpit + 13 pages, Design System `02_design-system/` importé et versionné dans le repo.
- **Décision fusion app-web ↔ MVP** (ADR du 24/04/2026, `DECISIONS.md`) : MVP absorbe app-web, SQLite remplace `localStorage` + JSON.
- **Specs fusion rédigées** : `04_docs/SPEC-FONCTIONNELLE-FUSION.md` (21 → 13 pages, flux matin/soir/hebdo, critères MVP, horizon V1-V3) et `04_docs/SPEC-TECHNIQUE-FUSION.md` (schéma SQLite 13 tables, 40+ endpoints REST, intégration Outlook COM→Graph, déploiement Service Windows).
- **Backlog migré** xlsx → GitHub Issues (ADR du 24/04/2026, 78 issues structurées).

### Fait additionnel — 26/04/2026

- **Phase v0.5 internalisée close** (ADR `2026-04-26 · v0.5 internalisée terminée`) : 5 sprints livrés en ~16h chrono dogfood, vélocité x30 vs plan ETP, 110 k€/110 k€ budget consommé. 41 issues closes. Tag `v0.5` posé.
- **Bundle design Claude Design v3.1 livré** (ADR `2026-04-26 · Bundle design Claude Design v3.1`) : 16 ressources + prompt v3.1 + 6 ADR de gouvernance dans `04_docs/_design-v05-claude/`. Acté comme cible visuelle V1.
- **Re-mapping cadrage par version** : multi-tenant (ex-V2) → V1, mobile (ex-V3) → V1, équipes (ex-V2) → V1, i18n → V2, coach Opus + offline → V3.
- **Modèle binôme CEO + Claude étendu à V1** (ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1`) : tous les rôles techniques V1 (2 fullstack + mobile + AI + designer + DevSecOps + PMO) assurés par Claude. Recrutement externe annulé. Budget V1 passe de 300 k€ à 46 k€ (-254 k€). Vélocité cible x10 (vs x30 v0.5). CEO pair suppléant Lamiae à former mois 1 pour résilience binôme.
- **Insertion v0.6 — Interface finalisée** (ADR `2026-04-26 · Insertion v0.6`) : palier UI dédié inséré entre v0.5 livré et V1, ~2-3 sem binôme, ~8 k€ absorbés dans provision V1. Refonte UI complète selon bundle Claude Design v3.1 (DS atomic 3 niveaux + 16 composants + microcopy FR unifié + WCAG AA + patterns coaching légers + onboarding simple + components gallery + audit a11y externe). Pas de scope fonctionnel nouveau. Démarrage post-ExCom 04/05.

### À démarrer (palier 1) — milestone `v0.6` (mai 2026, ~2-3 sem binôme, ~8 k€)

Refonte UI selon bundle Claude Design v3.1 sur scope fonctionnel v0.5 préservé. Pas de feature nouvelle.

1. **DS atomic** — tokens 3 niveaux (primitive / semantic / component), ITCSS, BEM
2. **16 composants UI** — buttons, inputs, modals, toasts, tooltips, dropdowns, switches, progress bars, tags/chips, avatars, skeletons, tabs underline, cards, KPI tiles, search pill, command palette ⌘K
3. **13 pages refondues** selon maquette
4. **Microcopy FR unifié**
5. **WCAG AA cockpit** + audit a11y externe (~3 k€)
6. **Patterns coaching v0.6 légers** — time-of-day, friction positive, recovery streak break, posture footer
7. **Onboarding wizard simple** (5 étapes) + **Settings basique** (4 sections, sans multi-tenant)
8. **Components gallery** — mini-storybook
9. Tag `v0.6` posé · 0 régression v0.5 · adoption Feycoil 100 % dogfood pendant 14 j

### À démarrer (palier 2) — milestone `V1` (T3 2026 - T1 2027, ~46 k€ binôme / 6 mois, 6 thèmes)

V1 redéfinie le 26/04 (ADR `Bundle design Claude Design v3.1`) absorbe les ex-V2 (multi-tenant) et ex-V3 (mobile) pour répondre à la pression Microsoft Copilot CEO 2027.

1. **Multi-tenant Supabase + RLS + auth Microsoft Entra** (~80 k€) — isolation stricte par `tenant_id`, vocabulary configurable ("groupe"/"house"/"holding"), migration SQLite → Postgres.
2. **Équipes (rôles + délégation E2E + matrice confiance)** (~50 k€) — DG, AE, manager, collaborateur. Quand CEO délègue, tâche apparaît chez destinataire.
3. **Intégrations Teams + Notion + Slack + webhooks** (~60 k€) — Microsoft Graph API OAuth (remplace PowerShell COM), pousse délégations dans Teams/Slack.
4. **App mobile compagnon (PWA iOS + Android)** (~70 k€) — 3 viewports responsive, bottom-tab nav + FAB, notifications push, dictée vocale, consultation déplacement.
5. **Backup automatique SQLite + chiffrement at-rest AES-256** (~20 k€) — schtasks daily, snapshots versionnés 7/30/365 j (S5.04 reporté).
6. **Logs winston-daily-rotate-file + monitoring Langfuse** (~20 k€) — observabilité multi-tenant (S5.05 reporté).

**Thèmes secondaires V1.5** (si vélocité permet, anciennes V1 v2.0) : Inngest copilote proactif, mémoire pgvector, SharePoint RAG, viz riches.

### Milestone `V2` (T2-T4 2027, ~800 k€)

V2 redéfinie le 26/04 — recentré sur la dimension commerciale internationale (multi-tenant déjà absorbé en V1).

- **i18n FR + EN activé** — architecture préparée en V1, activation effective + premier client EN.
- **RTL prep (AR/HE)** — premier marché Maroc / Émirats.
- **Premier client international** — onboarding hors écosystème ETIC, pricing transparent, self-service signup.
- **SOC 2 Type II** via Vanta/Drata, RGPD complet, ISO 27001 partiel.
- **Canvas IA collaboratif (tldraw + Yjs)**.
- **Graphe Cytoscape** réseau parties prenantes.
- **Visualisations riches** : carte radiale sociétés, arbre Big Rocks, timeline décisions.
- **API publique + browser extension**.
- ARR cible ≥ 200 k€ sur 12 mois glissants.

### Milestone `V3` (T4 2027+, ~600 k€)

V3 recentrée sur la dimension coaching + offline + multi-CEO (mobile déjà livré en V1).

- **Coach conversationnel Claude Opus** — modes arbitrage / coincé / revue stoïque. Bibliothèque de questions par framework (EOS / Eisenhower / Stoïcisme).
- **Mirror moments hebdo + score santé exécutive**.
- **Self-talk monitoring + recadrage doux**.
- **Pause forcée ergonomie**.
- **Détection burnout active** — interventions graduées.
- **Boîte à outils psychologique** — respiration, méditation, recadrage cognitif.
- **Post-mortem automatique** sur Big Rocks ratés.
- **Offline-first** (ElectricSQL ou PowerSync).
- **Multi-CEO écosystème** — ouverture 2-3+ CEO indépendants en partage réseau limité.

## Règle de mise à jour

À chaque revue hebdomadaire :