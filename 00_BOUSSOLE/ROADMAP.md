# ROADMAP — compagnon texte de la carte interactive

Pour la carte cliquable : [`04_docs/11-roadmap-map.html`](../04_docs/11-roadmap-map.html).
Pour le détail produit (jalons, équipe, budgets, KPIs) : [`04_docs/08-roadmap.md`](../04_docs/08-roadmap.md).

## Où nous en sommes — 24/04/2026

| Branche | État | Tag / milestone GitHub |
|---|---|---|
| **App Web Twisty** (`01_app-web/`) | Abouti v4, en voie d'absorption par le MVP | — (sera archivée après fusion) |
| **MVP Node** (`03_mvp/`) | Validé en réel v0.4 · 28/28 tâches arbitrées · ≈ 1,5 ct/jour | Tag `v0.4` · milestone GitHub `MVP` |
| **Produit unifié v0.5** | Specs rédigées (`SPEC-FONCTIONNELLE-FUSION`, `SPEC-TECHNIQUE-FUSION`) | milestone `MVP` en cours |
| **V1 — copilote proactif** | Périmètre cadré, démarrage post-v0.5 | milestone `V1` |
| **V2 — multi-utilisateur** | Esquissée, dépendante V1 | milestone `V2` |
| **V3 — coach + mobile** | Esquissée, horizon T4 2027 | milestone `V3` |

Source unique de vérité opérationnelle : **GitHub Issues** sur [`feycoil/aiCEO`](https://github.com/feycoil/aiCEO/issues) — 78 issues actives, 4 milestones (`MVP`, `V1`, `V2`, `V3`), 29 labels (`lane/*`, `type/*`, `priority/*`, `status/*`, `phase/*`, `scope/*`).

## Jalons clés

### Fait

- **MVP v0.4** (24/04/2026) : arbitrage 3 / 2 / N, délégation un-clic, boucle du soir, import Outlook 30 j, contexte email dans prompt, support proxy corp, chip coral sous pression. Run réel 28/28 tâches classées en 41 s, 5,2 k tokens in / 2,5 k out, ≈ 1 ct / arbitrage.
- **App Web Twisty v4** : cockpit + 13 pages, Design System `02_design-system/` importé et versionné dans le repo.
- **Décision fusion app-web ↔ MVP** (ADR du 24/04/2026, `DECISIONS.md`) : MVP absorbe app-web, SQLite remplace `localStorage` + JSON.
- **Specs fusion rédigées** : `04_docs/SPEC-FONCTIONNELLE-FUSION.md` (21 → 13 pages, flux matin/soir/hebdo, critères MVP, horizon V1-V3) et `04_docs/SPEC-TECHNIQUE-FUSION.md` (schéma SQLite 13 tables, 40+ endpoints REST, intégration Outlook COM→Graph, déploiement Service Windows).
- **Backlog migré** xlsx → GitHub Issues (ADR du 24/04/2026, 78 issues structurées).

### En cours — milestone `MVP` (cible T2 2026, scellement v0.5)

- **Fusion app-web ↔ MVP** par vagues de 2 semaines (voir `SPEC-TECHNIQUE-FUSION.md` §13) :
  1. Backend API + schéma SQLite + migration `migrate-from-appweb.js`
  2. Cockpit unifié + pages tâches + agenda + revues sur API
  3. Pages portefeuille (groupes, projets, contacts, décisions) sur API
  4. Assistant chat live + Service Windows + tests e2e
- **Alignement Design System** : migration Inter → Fira Sans dans `02_design-system/assets/app.css` + `product.app.css` (Issue à ouvrir, label `lane/design-system`).
- **Démarrage auto Windows** du MVP (`node-windows` ou NSSM) + raccourci desktop `aiCEO.url`.
- **Auto-sync Outlook 2 h** (remplace le lancement PowerShell manuel).

### Après v0.5 — milestone `V1` (cible T3-T4 2026)

- **Copilote proactif** : jobs Inngest (cron + webhooks), sub-agents spécialisés (mail, calendar, task, deleg, meeting-prep, weekly-review).
- **Mémoire long-terme** : migration SQLite → Postgres Supabase + pgvector, 3 strates (identity / preference / episode), résumés roulants hebdo.
- **Graph API OAuth** (msal-node) : remplace PowerShell COM, backend autonome sans session Windows ouverte.
- **Langfuse** : traçabilité complète des appels Claude.
- **Rituel dimanche auto-draftée** : revue hebdo pré-rédigée par l'agent.

### Milestone `V2` (cible T1-T2 2027)

- **Multi-tenant** Supabase + RLS, rôles (CEO, DG, AE, manager, collaborateur).
- **Délégation end-to-end** : la tâche apparaît chez le destinataire.
- **Teams Graph API** + **canvas tldraw collaboratif**.
- **SOC 2 Type II** via Vanta/Drata.

### Milestone `V3` (cible T3-T4 2027)

- **Coach conversationnel** (Claude Opus) — modes arbitrage / coincé / revue stoïque.
- **Détection burnout active** — interventions graduées.
- **Offline-first** (ElectricSQL ou PowerSync) + **PWA mobile**.
- **Multi-CEO** (ouverture 2-3 CEO de l'écosystème ETIC).

## Règle de mise à jour

À chaque revue hebdomadaire :

1. Mettre à jour `MILESTONES` dans `04_docs/11-roadmap-map.html` (statut `done` / `doing` / `todo`).
2. Synchroniser ce fichier (table d'état + jalons clés).
3. Vérifier que les milestones GitHub reflètent la même réalité (issues closes / ouvertes).
4. Commit : `roadmap: update W<NN>`.

## Liens utiles

- Détail roadmap produit : [`04_docs/08-roadmap.md`](../04_docs/08-roadmap.md)
- Architecture technique : [`04_docs/06-architecture.md`](../04_docs/06-architecture.md)
- Specs fusion : [`SPEC-FONCTIONNELLE-FUSION.md`](../04_docs/SPEC-FONCTIONNELLE-FUSION.md) · [`SPEC-TECHNIQUE-FUSION.md`](../04_docs/SPEC-TECHNIQUE-FUSION.md)
- ADR / décisions : [`DECISIONS.md`](DECISIONS.md)
- Changelog : [`CHANGELOG.md`](CHANGELOG.md)
- Gouvernance : [`GOUVERNANCE.md`](GOUVERNANCE.md)
- Backlog : [`feycoil/aiCEO` GitHub Issues](https://github.com/feycoil/aiCEO/issues)
