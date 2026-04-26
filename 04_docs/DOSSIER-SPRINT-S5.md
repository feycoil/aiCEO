# DOSSIER Sprint S5 — Cutover production v0.5

**Version** : v0.5-s5 · **Cible** : tag `v0.5` final + recette ExCom + clôture phase v0.5 internalisée
**Auteur** : binôme CEO + Claude · **Date cadrage** : 2026-04-26
**Statut** : kickoff prêt · démarrage immédiat (vélocité S1+S2+S3+S4 = 4 sprints en ~12 h cumulées dogfood)

---

## 1. Périmètre

### Pilier 1 — Industrialisation tests (S5.01 + S5.02 + S5.03)

Les 4 sprints précédents ont livré **85 tests unitaires/intégration verts**. Il manque le **boundary E2E** (vrai navigateur, vrai serveur) qui industrialise la recette CEO en script auto. C'est le filet de sécurité indispensable avant de déclarer v0.5 prête pour ExCom.

- **S5.01 Tests E2E Playwright** : 6 parcours canoniques (P1 matin, P2 soir, P3 hebdo, P4 portefeuille, P5 assistant streaming, P6 install smoke 12 pages). Auto-screenshot pour preuve visuelle. CI-ready (npm run test:e2e).
- **S5.02 Smoke test post-deploy** : `scripts/smoke-all.ps1` valide les 12 pages HTTP 200 + 4 routes assistant + alerte Outlook last-sync. Lance avec `pwsh -File smoke-all.ps1`. Exit 0 = OK, 1 = FAIL.
- **S5.03 /api/health enrichie** : uptime, memory usage, taille `aiceo.db`, count tasks/decisions/projects/contacts/conversations, last sync Outlook. Pour observer la santé en production sans ouvrir DevTools.

### Pilier 2 — Recette + scellement (S5.04 + S5.05 + S5.06)

- **S5.04 Recette ExCom** : `RECETTE-EXCOM-v0.5.md` + scénario démo 30 min. Format présentation pour l'ExCom (pas pour le CEO solo). Démo : cockpit live → arbitrage matin → assistant chat streaming → portefeuille drill-down → revue hebdo.
- **S5.05 Tag v0.5 final + Release** : tag `v0.5` (pas `v0.5-s5`) sur main, `release-notes/v0.5.md` = synthèse globale 4 sprints, breaking changes, métriques cumulées (110 k€ engagés, 90+ tests, 12 pages, 4 routes assistant, ~150 j d'avance vs BASELINE).
- **S5.06 ADR « v0.5 internalisée terminée »** : bilan + ouverture phase v1. Acte la fin du dogfood pré-V1, ouvre la roadmap v1 (multi-tenant, équipes, intégrations Teams/Notion, mobile).

### Pilier 3 — Documentation onboarding (S5.07)

- **S5.07 ONBOARDING-CEO-PAIR.md révisé** : intégrer les apprentissages réels v0.5 (sync Outlook schtasks, Variante D Startup folder, raccourci Bureau Cockpit aiCEO, recette CEO post-install, troubleshooting, fix-labels script). Le doc actuel date de la phase de cadrage et ne reflète pas le vécu dogfood.

### Hors scope (reportés en v1)

- **S5.04 Backup SQLite automatique** (initial scope) → reporté v1. Le projet est désormais hors OneDrive (cf. ADR « projet hors OneDrive »), versioning passif perdu mais snapshot manuel acceptable pré-V1.
- **S5.05 winston-daily-rotate-file** (initial scope) → reporté v1. La rotation KISS S4.09 (2 Mo / 3 archives) suffit pour le volume dogfood actuel.

## 2. 8 critères de fin (GO tag v0.5)

1. ✓ 6 parcours E2E Playwright passent en local (`npm run test:e2e`)
2. ✓ `smoke-all.ps1` exit 0 sur 12 pages + 4 routes assistant
3. ✓ `GET /api/health` retourne payload enrichi avec metrics
4. ✓ `RECETTE-EXCOM-v0.5.md` rédigée et scénario démo testé (chrono 30 min)
5. ✓ Tag `v0.5` posé + GitHub Release publiée avec notes v0.5
6. ✓ ADR « v0.5 internalisée terminée » dans DECISIONS.md
7. ✓ `ONBOARDING-CEO-PAIR.md` mis à jour avec apprentissages réels
8. ✓ 90+ tests verts (85 hérités + ~5 ajoutés par S5.01)

## 3. 8 issues (S5.00 → S5.07)

| ID | Titre | Charge | Owner | P |
|---|---|---|---|---|
| S5.00 | ADR méthode Sprint S5 + zéro localStorage rappelé | 0,3 j | PMO | P0 |
| S5.01 | Tests E2E Playwright industrialisés (6 parcours + auto-screenshot) | 2,5 j | Dev1 | P0 |
| S5.02 | Smoke test post-deploy automatique (12 pages + 4 routes) | 0,7 j | Dev1 | P0 |
| S5.03 | Page /api/health enrichie (uptime + memory + db size + counts) | 0,5 j | Dev1 | P1 |
| S5.04 | Recette ExCom v0.5 (RECETTE-EXCOM-v0.5.md + scénario démo 30 min) | 1,0 j | PMO | P0 |
| S5.05 | Tag v0.5 final + GitHub Release synthèse 4 sprints | 0,5 j | PMO | P0 |
| S5.06 | ADR « v0.5 internalisée terminée » + ouverture phase v1 | 0,5 j | PMO | P0 |
| S5.07 | Mise à jour ONBOARDING-CEO-PAIR.md (cas réels v0.5) | 0,5 j | PMO | P1 |
| **Total** | | **6,5 j-dev / 20 j capacité = 67% marge** | | |

## 4. Planning J1 → J5 (compressé)

| Jour | Date cible | Livrables |
|---|---|---|
| J1 matin | 26/04 PM | S5.00 ADR · S5.03 /health enrichi · S5.02 smoke-all.ps1 |
| J1 soir | 26/04 soir | S5.01 tests E2E (3 parcours sur 6) |
| J2 | 27/04 | S5.01 tests E2E (3 parcours restants) · S5.04 RECETTE-EXCOM |
| J3 | 28/04 | S5.07 ONBOARDING-CEO-PAIR révisé · S5.06 ADR clôture |
| J4 | 29/04 | Recette CEO Windows complète + démo scénario chrono |
| J5 | 30/04 | S5.05 tag v0.5 + Release · clôture milestone v0.5-s5 |

Démos : aucune intermédiaire (sprint court). Démo finale = recette CEO complète + scénario démo ExCom répété 1×.

## 5. Top 5 risques

| # | Risque | Mitigation |
|---|---|---|
| R1 | Playwright Chromium infaisable en sandbox Linux (S2 reporté pour ça) | Tests S5.01 à exécuter côté CEO Windows uniquement, scripts livrés mais non exécutés sandbox |
| R2 | 6 parcours E2E sous-estimés (chacun ~30 min à scripter + debug) | Time-box S5.01 à 2,5 j strict, sortie 4 parcours minimum |
| R3 | Démo ExCom dérape si pas répétée | S5.04 inclut chrono test 30 min en répétition seul avant ExCom |
| R4 | Tag v0.5 posé prématurément (avant recette CEO 8/8 verts) | Critère 5 explicite : tag uniquement après 7/8 critères validés |
| R5 | ADR clôture v0.5 (S5.06) trop court → pas d'ouverture v1 claire | Inclure 3-5 thèmes phase v1 (multi-tenant, équipes, mobile, intégrations, monitoring pro) |

## 6. Budget

| Poste | Montant |
|---|---|
| 6,5 j-dev × 1100 €/j (CEO + Claude pondéré) | 7,2 k€ |
| Outils Playwright + Chromium licensing | 0,3 k€ |
| Buffer recette + démo ExCom préparation | 1,5 k€ |
| **Coût direct S5** | **9,0 k€** |
| Reliquat budget v0.5 (110 - 88,4 cumul S1-S4) | **21,6 k€** dispo |
| Sous-utilisation S5 (12,6 k€) → reportée provision V1 | |

Cumul v0.5 fin S5 = **97,4 k€ / 110 k€ = 88,5 %** (12,6 k€ provision V1).

## 7. Dépendances pour V1

Issues ouvertes après tag v0.5 (à scoper en kickoff V1) :
- Multi-tenant (auth + équipes + RLS)
- App mobile compagnon
- Intégration Teams (Microsoft Graph)
- Backup SQLite automatique (S5.04 reporté)
- Logs winston-daily-rotate-file (S5.05 reporté)
- Détection burnout signaux faibles
- SOC 2 Type II compliance

## 8. Sources

- ADR cadrage S4 (`2026-04-26 · Sprint S4 — kickoff préparé`)
- ADR Sprint S4 livré (`2026-04-26 · Sprint S4 livré`)
- `04_docs/RECETTE-CEO-v0.5-s4.md` (8 sections, base pour S5.04)
- `04_docs/INSTALL-WINDOWS.md` (9 sections, base pour S5.07)
- 4 release notes : `_release-notes/v0.5-s1.md`, `s2.md`, `s3.md`, `s4.md` (synthèse pour S5.05)
