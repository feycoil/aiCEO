# S8 — Validation globale & clôture de l'atelier

*Statut : ✅ close 2026-04-24*

## 1. Contexte

S1→S7 ont produit **~45 livrables** (ADRs, patches de docs canoniques, squelettes nouveaux, scripts, pipeline DS). Avant d'archiver l'atelier, S8 fait **trois choses** :

1. **Audit de cohérence croisé S1→S7** — relire les décisions entre elles pour détecter les contradictions résiduelles que chaque session n'a pas pu voir de sa position.
2. **Validation des livrables produits** — ce qui est testable maintenant (scripts, patches) vs ce qui est validable uniquement post-production (5 livrables externes, openapi.yaml).
3. **Clôture propre** — CHANGELOG, archivage in-place, kit de reprise des actions manuelles à exécuter hors atelier.

S8 ne produit pas de nouvelles décisions produit. Elle produit un **méta-livrable de clôture** (+ un patch résiduel si une contradiction est détectée).

## 2. État des lieux

### Ce qui est fait (recap S1→S7)

| Session | Livrables | Statut |
|---|---|---|
| S1 | Trajectoire local→cloud + continuité | ✅ 3 livrables |
| S2 | Fira Sans canonique | ✅ 8 fichiers patchés |
| S3 | Hiérarchie sources + 4 orphelins traités + règle drafts 4 sem | ✅ 8 livrables |
| S4 | Timing (10 sem) + budget (110 k€) + équipe (2,6 ETP) v0.5 réconciliés | ✅ 6 livrables |
| S5 | Cadrage 5 livrables externes (CEO pair + investisseur) | ✅ cadrage, **production 05/05** |
| S6 | ONBOARDING-DEV + RUNBOOK-OPS + OpenAPI cadrée | ✅ 5 livrables, openapi post-12/05 |
| S7 | Pipeline tokens.json → CSS + règle maintien unifiée + calendrier trimestriel | ✅ 8 livrables |

### Audit statique croisé (pré-S8, fait par Claude)

**Contradictions trouvées** :

| # | Localisation | Contradiction | Sévérité | Source canonique post-atelier |
|---|---|---|---|---|
| **C-R1** | `04_docs/SPEC-FONCTIONNELLE-FUSION.md:468` (§9 risques) | "Feycoil décroche pendant les **4-6 sem** de fusion" | **Moyenne** — contredit S4 (10 sem) | S4 → 10 sem |
| **C-R2** | `04_docs/SPEC-FONCTIONNELLE-FUSION.md:480-484` (§10 prochaines étapes) | "4 vagues × 2 sem = **8 sem**" | **Forte** — contredit S4 (10 sem, 6 sprints) | S4 → 10 sem / 6 sprints |

**Pas de contradiction** sur les autres paires vérifiées :
- `02-benchmark.md:230` pointe vers `06-architecture.md` pour l'IA 2026 → OK (scope V1+, carte large, cohérent post-S3).
- Footers cross-ref `01-vision-produit.md:189`, `02-benchmark.md:339`, `03-ia-proactive.md:322` → OK (pas de revendication de canon).
- `03-ia-proactive.md:5` → OK (cite 06-archi comme "articulation", pas comme source canonique fusion v0.5).
- `08-roadmap.md:462` → OK (mentionne déjà SPEC-FUSION comme liée).

### Ce qui n'est PAS validable en S8

- **Premier run `npm run ds:export`** — demande un shell (pas disponible cette session Claude). À exécuter en prochaine session Cowork par le CEO.
- **Rendu visuel des previews `02_design-system/preview/colors-*.html`** — demande un navigateur.
- **Rendu markdown `04_docs/00-README.md`** — demande un rendu GitHub.
- **5 livrables externes S5** — pas encore produits (sprint 05/05 → 11/05).
- **`openapi.yaml`** — pas encore produit (sprint 12/05 → 18/05).
- **Envoi test d'un livrable à un CEO pair** — post-production S5.

Ce qui sort du périmètre S8 doit être tracé explicitement en **post-atelier** avec dates cibles.

### Ce qui est validable en S8

- **Cross-reading des ADRs** pour détecter les contradictions résiduelles (fait ci-dessus — 2 trouvées).
- **Patch des contradictions détectées** (C-R1, C-R2).
- **CHANGELOG** — entrée atelier dédiée.
- **Kit de reprise** — check-list unique des actions manuelles CEO.
- **Archivage atelier** — règle d'archivage (in-place vs déplacement).

## 3. Questions à trancher

### Q1 — Périmètre S8

- **Option A** — S8 = uniquement les validations actionnables maintenant (audit statique + patches résiduels + CHANGELOG + archivage). Les validations post-production (ds:export, 5 livrables externes, openapi, envoi test) sont listées en "post-atelier" dans un kit de reprise.
- **Option B** — Garder l'atelier ouvert jusqu'à ce que toutes les validations post-production soient faites (ré-ouvrir S8 après chaque jalon). L'atelier peut alors durer jusqu'à fin juin 2026.
- **Option C** — A + créer une "S9 light" de validation post-production (~30 min, après le sprint S2 plan audit du 18/05), séparée de S8.

**Reco** : **A**. L'atelier a fait sa mission (trancher, produire les squelettes, documenter). Les validations post-production sont du **maintien** (pattern S3+S6+S7 "continu + audit trimestriel"), pas de l'atelier. B dilue la clôture. C ajoute une session sans valeur ajoutée — si les livrables S5/S6 dérivent, c'est l'audit trimestriel qui les rattrape, pas une session atelier.

### Q2 — Traitement des 2 contradictions résiduelles (C-R1, C-R2)

- **Option A** — Patch maintenant dans `SPEC-FONCTIONNELLE-FUSION.md` §9 et §10 (remplacer "4-6 sem" → "10 sem" et "4 vagues × 2 sem" → "6 sprints × 10 sem" en renvoyant explicitement à `08-roadmap.md §3.2`).
- **Option B** — Ouvrir une Issue GitHub `doc/spec-fonctionnelle-fusion-timing-post-S4` pour patch ultérieur.
- **Option C** — Accepter la dissonance (considérer que `SPEC-FONCTIONNELLE-FUSION.md` est une "spec fonctionnelle draft" et que les chiffres techniques vivent dans SPEC-TECHNIQUE-FUSION + roadmap).

**Reco** : **A**. Les 2 contradictions sont dans le même doc, sur 5 lignes. Patch en 5 min maintenant. Option B laisse traîner une dissonance qui alimente la confusion interne. Option C est refusable : la **spec fonctionnelle donne le cadre**, ses risques doivent refléter la réalité post-S4.

### Q3 — Format CHANGELOG

- **Option A** — Une seule entrée atelier dans `[Non publié]` qui résume les 45 livrables en ~15 lignes, avec renvois vers `_atelier-2026-04-coherence/JOURNAL.md` pour le détail.
- **Option B** — Une entrée par session (8 entrées) dans `[Non publié]`.
- **Option C** — Section `## [0.4.1] — 2026-04-24 · Atelier de cohérence` bumpée en version patch.

**Reco** : **A**. Le CHANGELOG raconte une histoire, pas un journal. L'atelier = un événement structurant, résumé en une entrée qui pointe vers la trace détaillée. B pollue le CHANGELOG. C implique de tagger v0.4.1, hors portée produit (on est en v0.4 avec MVP déployé, pas de release produit en S8).

### Q4 — Archivage atelier

- **Option A** — In-place (le dossier `_atelier-2026-04-coherence/` reste où il est, statut dans JOURNAL.md marqué "atelier clos 2026-04-24"). Pas de stub pointeur.
- **Option B** — Déplacer vers `_archive/2026-04-atelier-coherence/` + stub pointeur dans `04_docs/` (cohérent avec règle `_archive/`).
- **Option C** — A maintenant, B dans 3 mois si plus de consultation.

**Reco** : **A**. L'atelier a produit beaucoup de doc et reste une **trace vivante** (ADRs référencent des sessions, SPEC-FUSION §6 cite S6, etc.). Archiver le déplacer casse les renvois. Règle `_archive/` s'applique aux documents **remplacés** par une nouvelle version — l'atelier n'est pas remplacé, il est **clos**. L'argument de S6 ("remanies si consultation morte post-3 mois") reste valide pour B si le dossier devient silencieux.

### Q5 — Kit de reprise post-atelier

- **Option A** — Créer `_atelier-2026-04-coherence/POST-ATELIER-ACTIONS.md` avec check-list unique de toutes les actions manuelles CEO (issues GitHub à ouvrir, calendrier agenda, premier run ds:export, sprint S2 plan audit livrables externes, sprint S3 plan audit openapi).
- **Option B** — Laisser chaque session mère tracer ses actions (§9 de S5, §X de S6, etc.) — le CEO compile lui-même.
- **Option C** — A + un 2e fichier `_atelier-2026-04-coherence/POST-ATELIER-VALIDATIONS.md` distinct qui trace les validations techniques (ds:export, previews, openapi vs SPEC §6).

**Reco** : **A**. Une check-list unique = une discipline mécanique. B disperse et garantit l'oubli. C ajoute une seconde source — l'inverse de ce que la règle "maintien unifié" de S7 a posé. Les validations techniques peuvent être des entrées typées dans la même check-list.

## 4. Bundle reco

| Q | Reco | Effet |
|---|---|---|
| Q1 | **A** — S8 = validations actionnables maintenant + kit post-atelier | Clôture nette. Post-production = maintien (pas atelier). |
| Q2 | **A** — Patch `SPEC-FONCTIONNELLE-FUSION.md` §9 + §10 | 2 contradictions factuelles corrigées en 5 min. Cohérence post-S4. |
| Q3 | **A** — Une entrée CHANGELOG atelier dans `[Non publié]` | Raconte l'événement, renvoie à JOURNAL pour le détail. |
| Q4 | **A** — Archivage in-place | Trace vivante. Renvois préservés. |
| Q5 | **A** — `POST-ATELIER-ACTIONS.md` unique | Check-list mécanique. Conforme S7 "maintien unifié". |

### Livrables si bundle reco accepté

1. **Patch `04_docs/SPEC-FONCTIONNELLE-FUSION.md`** — §9 ligne 468 ("4-6 sem" → "10 sem, voir `08-roadmap.md §3.2`") et §10 §4 lignes 480-484 (4 vagues × 2 sem → 6 sprints × ~1,5-2 sem, voir SPEC-TECHNIQUE-FUSION §13).
2. **Entrée CHANGELOG atelier** dans `00_BOUSSOLE/CHANGELOG.md` section `[Non publié]` — résumé 15 lignes avec pointeur vers `04_docs/_atelier-2026-04-coherence/JOURNAL.md`.
3. **`_atelier-2026-04-coherence/POST-ATELIER-ACTIONS.md`** — check-list mécanique des actions manuelles CEO : issues GitHub à ouvrir (label, contenu prêt dans sessions), calendrier agenda (4 dates audits trimestriels), validations techniques (1er run `ds:export`), sprints S2 (livrables externes) et S3 (openapi) plan audit.
4. **Clôture S8 dans `JOURNAL.md`** — statut ✅ close.
5. **Marqueur clôture atelier dans `JOURNAL.md`** — ligne en fin : "Atelier clos le 2026-04-24. Dossier conservé in-place comme trace vivante."
6. **Update critères clôture `CADRE.md` §7** — check des items verts (5 ADRs → **11 ADRs** produites, chiffres réels, + marquer "validation post-production post-18/05" explicitement pour ce qui reste).

### Parqué explicitement

- **Ré-ouverture S8** après sprint S2 plan audit (livrables externes 05/05-11/05) et sprint S3 plan audit (openapi 12/05-18/05) — **refusée**. L'audit trimestriel du 24/07 (pattern S3+S6+S7) rattrapera les dérives.
- **Archivage physique `_archive/`** — pas maintenant. Reconsidérer dans 3 mois si consultation tombe à 0.
- **Tag `v0.4.1` CHANGELOG** — pas maintenant. On est en v0.4 produit ; la clôture atelier n'est pas une release produit.
- **Nouvelle ADR "Atelier de cohérence 2026-04 : clôture et bilan"** — pas nécessaire. Le JOURNAL + CHANGELOG suffisent. Pas de nouvelle décision structurante à tracer — juste la clôture d'un processus.

## 5. Décisions

CEO : **bundle reco accepté intégralement** sur les 5 dimensions.

| Q | Décision | Commentaire |
|---|---|---|
| Q1 — Périmètre S8 | **A** — validations actionnables maintenant + kit post-atelier | Post-production (5 livrables externes, openapi, 1er run ds:export) = maintien via audit trimestriel, pas atelier. Refus de ré-ouvrir S8 après sprint S2 plan audit. |
| Q2 — Contradictions résiduelles | **A** — patch maintenant | C-R1 (§9 ligne 468 "4-6 sem") et C-R2 (§10 lignes 480-484 "4 vagues × 2 sem") corrigées dans `SPEC-FONCTIONNELLE-FUSION.md` en renvoyant explicitement à S4 (10 sem / 6 sprints). |
| Q3 — CHANGELOG | **A** — 1 entrée atelier dans `[Non publié]` | Résumé 15 lignes avec renvoi vers JOURNAL pour le détail + renvoi vers POST-ATELIER-ACTIONS pour la suite. Pas de tag v0.4.1. |
| Q4 — Archivage | **A** — in-place | Atelier = trace vivante. ADRs + SPEC-FUSION citent les sessions. Archivage physique différé à 3 mois si consultation morte. |
| Q5 — Kit de reprise | **A** — `POST-ATELIER-ACTIONS.md` unique | Check-list mécanique, conforme à la règle S7 "maintien unifié". 6 sections (validations, issues, calendrier, sprints, critères clôture, suivi). |

## 6. Livrables produits

1. **Patch `04_docs/SPEC-FONCTIONNELLE-FUSION.md` §9 ligne 468** — "Feycoil décroche pendant les **10 sem** de fusion (6 sprints, voir `08-roadmap.md §3.2`)" + mention "cf. S1 atelier cohérence continuité d'usage" dans la mitigation.
2. **Patch `04_docs/SPEC-FONCTIONNELLE-FUSION.md` §10 §4** — "Démarrer la fusion — **6 sprints sur 10 sem** (plan canonique post-S4 atelier cohérence, voir `SPEC-TECHNIQUE-FUSION.md §13` et `08-roadmap.md §3.2`). Décomposition indicative par vagues fonctionnelles (~Sprint 1-2, ~Sprint 2-3, ~Sprint 4-5, ~Sprint 5-6)" + mention "équipe 2,6 ETP / budget ~110 k€" en §5 scellement MVP.
3. **Patch `00_BOUSSOLE/CHANGELOG.md` `[Non publié]`** — nouvelle sous-section "**Atelier de cohérence 2026-04 — clos le 2026-04-24**" : 11 ADRs, ~45 livrables, 3 coûts cachés résolus (4 durées v0.5 → 10 sem, 3 silos → chemin type 7 étapes, 3 règles maintien → 1 seule), pointeur vers JOURNAL + POST-ATELIER-ACTIONS.
4. **`04_docs/_atelier-2026-04-coherence/POST-ATELIER-ACTIONS.md`** — check-list mécanique en 6 sections :
   - §1 Validations techniques (1er `ds:export` + rendu `00-README.md`)
   - §2 8 issues GitHub à ouvrir (1 S2 fonts + 6 S5 externes + 2 parqueurs + 1 S6 openapi + 1 S7 Husky) + label `type/audit-trimestriel`
   - §3 Calendrier trimestriel Q2 2026 → Q1 2027 (4 dates d'ouverture, 12 issues, délais +10j ouvrés)
   - §4 2 sprints post-atelier (S2 plan audit 05/05, S3 plan audit 12/05)
   - §5 Critères de clôture CADRE §7 à jour (11 ADRs au lieu de 5, 8 docs patchés au lieu de 5, 2 items post-production tracés)
   - §6 Règle de suivi (commit à chaque item coché, flag hebdo si stagne > 1 mois, renommage + déplacement `_archive/` quand tout coché)
5. **Clôture S8 dans `JOURNAL.md`** — statut ✅ close + entrée complète (décision, audit croisé 2 contradictions, livrables, parqués, à reprendre).
6. **Marqueur clôture atelier dans `JOURNAL.md`** — section finale "**2026-04-24 — Clôture de l'atelier**" avant le légende des statuts : atelier clos, dossier in-place, reconsidérer archivage physique 3 mois, suite = POST-ATELIER-ACTIONS + plan produit normal.

## 7. Audit post-atelier — statut de clôture (CADRE §7)

État à la fermeture de S8 le 2026-04-24 :

| Critère CADRE §7 | Cible initiale | État réel | Statut |
|---|---|---|---|
| ADRs rédigées, datées, signées CEO | 5 | **8 ADRs atelier** (S1-S7 dont S3 en produit 2 ; S8 est clôture sans ADR) — + 4 ADRs pré-atelier datées 24/04 = 12 au total dans DECISIONS.md. Toutes validées "bundle reco" en session | ✅ Dépassé |
| Documents patchés | 5 | **8** (01-vision, 02-benchmark, 06-architecture, 07-design-system, 08-roadmap, 00-README, SPEC-TECHNIQUE-FUSION, SPEC-FONCTIONNELLE-FUSION) | ✅ Dépassé |
| Nouveaux documents créés et relus | 6 | **partiel** : 2 créés (ONBOARDING-DEV, RUNBOOK-OPS) + 4 READMEs dossiers orphelins + 8 session files atelier. Reste à produire : 5 livrables externes (sprint 05/05→11/05) + openapi.yaml (sprint 12/05→18/05) | ⏳ Post-production |
| Script export tokens → CSS fonctionnel | 1 | **1 créé** (`02_design-system/scripts/export.js` ~90 lignes ESM). **1er run à confirmer** en §1.1 POST-ATELIER-ACTIONS | ✅ Créé, ⏳ 1er run |
| CHANGELOG à jour, section dédiée atelier | ✓ | **Entrée atelier** dans `[Non publié]` de `00_BOUSSOLE/CHANGELOG.md` | ✅ |
| JOURNAL.md complet, chaque session tracée | ✓ | **8 sessions closes** + marqueur clôture atelier | ✅ |
| ≥ 1 livrable externe testé (envoi CEO pair / investisseur) | 1 | **0** | ⏳ Post-production (item §4.1 POST-ATELIER-ACTIONS) |

**Verdict** : atelier **clos** sur les items actionnables en session. 2 items restent ouverts (1er run `ds:export` + envoi test livrable externe). Ils sont tracés mécaniquement dans `POST-ATELIER-ACTIONS.md` et **ne rouvrent pas l'atelier**. L'audit trimestriel Q2 (24/07/2026) les rattrapera comme maintenance.
