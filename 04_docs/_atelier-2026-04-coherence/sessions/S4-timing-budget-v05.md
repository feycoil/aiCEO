# S4 — Timing & budget v0.5 réconciliés

**Ouverture :** 2026-04-24
**Clôture :** 2026-04-24
**Statut :** ✅ close
**Dissonances audit traitées :** C1 (timing v0.5), C5 (budget v0.5)
**Dépendance amont :** S1 (trajectoire local-first → cloud, continuité d'usage)
**Impacte en aval :** S6 (livrables dev), S8 (validation globale)

---

## 1. Périmètre de la session

Deux questions au cœur de la session :

1. **Combien de semaines dure la fusion v0.5 ?** (et combien de sprints ?)
2. **Combien coûte-t-elle réellement ?** (et sur quelle équipe ?)

Ces deux questions sont liées : le budget dépend de la durée × équipe × coût/jour.

Le reste découle : clarifier la frontière "V1 cœur" vs "V1 complet" (durée critique vs durée totale V1) et s'assurer que les trois documents qui parlent de v0.5 (`08-roadmap.md`, `SPEC-TECHNIQUE-FUSION.md`, `SPEC-FONCTIONNELLE-FUSION.md`) disent **la même chose**.

---

## 2. État des lieux — les dissonances factuelles

### 2.1 Nombre de sprints v0.5 : 5 ou 6 ?

**`04_docs/08-roadmap.md` §3.2** (tableau sprints) — **6 sprints** :

| # | Durée | Contenu |
|---|---|---|
| 1 | 2 sem | Schéma SQLite + migrations + routes API + `migrate-from-appweb.js` |
| 2 | 2 sem | Cockpit unifié + arbitrage + evening sur API |
| 3 | 2 sem | Tâches + agenda + revues migrées, retrait `localStorage` |
| 4 | 2 sem | Groupes + projets + template projet + contacts + décisions + assistant chat (WebSocket) |
| 5 | 1 sem | Service Windows (`node-windows` ou NSSM) + raccourci desktop + tests Playwright + CI verte |
| 6 | 1 sem | Scellement, tag `v0.5`, release interne |

Total : 2+2+2+2+1+1 = **10 semaines**.

**`04_docs/SPEC-TECHNIQUE-FUSION.md` §13** — **5 sprints** :

- Sprint 1 (2 sem) — Fondation
- Sprint 2 (2 sem) — Migration pages rituels
- Sprint 3 (2 sem) — Migration pages business
- Sprint 4 (2 sem) — Migration pages portefeuille
- Sprint 5 (1 sem) — Scellement MVP (Service Windows + tests + CI + tag v0.5)

Total : 2+2+2+2+1 = **9 semaines**.

**Écart** : SPEC-TECHNIQUE-FUSION fusionne "durcissement technique" et "scellement/release" dans un seul sprint S5 ; 08-roadmap les sépare en S5 (durcissement) + S6 (scellement/comm).

---

### 2.2 Durée v0.5 : "10 sem" ou "~1,5 mois" ou "7 sem" ?

Trois chiffres coexistent pour la **même** phase :

| Source | Chiffre | Commentaire |
|---|---|---|
| `08-roadmap.md` §3.2 (ligne 81) | **"10 semaines cible, ~1,5 mois dev temps plein"** | Contradiction interne : 10 sem ≈ 2,5 mois, pas 1,5 |
| `08-roadmap.md` §8 chemin critique (ligne 340) | **"6 sem fusion v0.5"** | Incompatible avec §3.2 (10 sem) |
| `08-roadmap.md` §13 synthèse (ligne 428) | **"v0.5 Fusion · 7 sem · ~95 k€"** | Ni 10, ni 6, ni 9 |
| `SPEC-TECHNIQUE-FUSION.md` §13 | **"~10 semaines (MVP complet)"** | Cohérent avec §3.2 de la roadmap en chiffre, mais table 5 sprints = 9 sem |

Quatre chiffres différents (6, 7, 9, 10) pour la même phase dans le même dossier : le CEO ne peut pas citer un nombre de semaines de façon crédible à un interlocuteur externe aujourd'hui.

---

### 2.3 Budget v0.5 : ni dérivé, ni tenu

**`08-roadmap.md` §13** (synthèse) : *"v0.5 Fusion · 7 sem · ~95 k€"*.

**`SPEC-TECHNIQUE-FUSION.md` §13** : *"Budget total estimé : ~10 semaines (MVP complet), budget 132 kEUR conforme roadmap."*

Trois problèmes :

1. **95 k€ n'est dérivé nulle part** dans la roadmap (contrairement à V1 qui a son calcul explicite `16 sem × 4.3 ETP × 900 €/j × 4.5 j/sem ≈ 280 k€`).
2. **Les "132 kEUR" cités dans SPEC-TECHNIQUE-FUSION §13 sont le budget v0.4 MVP initial, pas v0.5** (v0.4 est déjà livré en dogfood solo, bien sous le chiffre — cf. §13 roadmap "— · 132 k€ partiel").
3. **Aucune équipe v0.5 n'est documentée** — quelle taille d'équipe ? quels rôles ? Impossible de vérifier la dérivation.

---

### 2.4 Durée V1 : "14 sem" ou "16 sem" ?

**`08-roadmap.md` §4** (header V1, ligne 106) : *"V1 — copilote proactif (T3-T4 2026, **16 semaines**)"*.
**`08-roadmap.md` §4** (budget, ligne 150) : *"Dev : **16 sem** × 4.3 ETP × 900 €/j × 4.5 j/sem ≈ 280 k€"*.
**`08-roadmap.md` §8** (chemin critique, ligne 340) : *"Chemin critique **14 semaines** de maintenant à V1 fonctionnelle (6 sem fusion v0.5 + **8 sem V1 cœur**)"*.

14 vs 16 : l'écart vient de deux définitions différentes de "V1" — le **cœur fonctionnel** (sub-agents + Postgres + Graph migrés, soit 8 sem) vs le **périmètre complet** (+ SharePoint RAG + viz riches + rituels auto-draftés, soit 16 sem total).

Ce n'est pas faux, mais ce n'est pas **dit** : le lecteur externe ne peut pas réconcilier les deux chiffres.

---

### 2.5 Résumé des écarts

| # | Dissonance | Gravité | Impact externe |
|---|---|---|---|
| D1 | 5 vs 6 sprints v0.5 | Élevée | Tout lecteur croise les 2 sources → perd confiance |
| D2 | 10/7/9/6 semaines v0.5 | **Critique** | CEO ne peut pas citer un chiffre |
| D3 | "1,5 mois" incohérent avec "10 semaines" dans la même phrase | Élevée | Tache interne |
| D4 | Budget 95 k€ non dérivé | Élevée | Pas défendable devant un investisseur |
| D5 | "132 kEUR" dans SPEC-TECHNIQUE-FUSION parle de v0.4 pas v0.5 | Élevée | Source technique contredit source roadmap |
| D6 | Équipe v0.5 non documentée | Moyenne | Empêche toute validation du budget |
| D7 | 14 sem vs 16 sem V1 | Moyenne | Différence de périmètre à expliciter |

---

## 3. Options d'arbitrage

### Q1 — Nombre de sprints v0.5 : 5 ou 6 ?

- **Option A — 6 sprints (10 sem)** : on garde S5 "durcissement technique + Service Windows + tests" distinct de S6 "scellement / tag / release / comm interne / rétro".
- **Option B — 5 sprints (9 sem)** : on fusionne durcissement et scellement dans un S5 (1 sem), comme le dit SPEC-TECHNIQUE-FUSION.

**Reco : A (6 sprints, 10 sem)**. Un sprint dédié au scellement n'est pas du gras : c'est le moment de taguer, d'écrire les release notes, de faire la rétro, d'ajuster les rituels Feycoil autour du nouveau produit. Compresser en 1 sem avec le durcissement rend S5 intenable et fragilise le go/no-go V1.

**Corollaire** : patcher `SPEC-TECHNIQUE-FUSION.md` §13 pour ajouter le sprint 6.

---

### Q2 — Durée v0.5 : quelle valeur canonique ?

- **Option A — 10 semaines** (dérivée de la table §3.2 × 6 sprints ci-dessus).
- **Option B — 9 semaines** (si on retient 5 sprints).
- **Option C — 7 semaines** (chiffre actuel §13 synthèse — source inconnue).
- **Option D — 6 semaines** (chiffre actuel §8 chemin critique — probablement pensé comme "fusion mini viable avant V1 cœur").

**Reco : A — 10 semaines partout**. On corrige :
- §3.2 → retirer "~1,5 mois dev temps plein" (garder seulement "10 semaines cible").
- §8 chemin critique → `6 sem fusion v0.5` devient `10 sem fusion v0.5` et le total devient `10 + 8 = 18 sem vers V1 cœur` (ou `10 + 16 = 26 sem vers V1 complet` selon la définition retenue en Q4).
- §13 synthèse → `7 sem` devient `10 sem`.
- SPEC-TECHNIQUE-FUSION §13 → `~10 semaines (MVP complet)` devient `10 semaines (6 sprints)` avec mention explicite du sprint 6.

---

### Q3 — Budget v0.5 : à dériver sur quelle équipe ?

Trois profils d'équipe envisageables pour les 10 sem de fusion :

| Profil | Composition | ETP | Coût dev 10 sem | +Infra/LLM | Total |
|---|---|:-:|---|---|---|
| **Équipe serrée** | 1 lead dev + 0,5 designer + 0,3 PMO + Feycoil dogfood | 1,8 | 10 × 1,8 × 900 × 4,5 = **73 k€** | 5 k€ | **~78 k€** |
| **Équipe médiane** | 2 fullstack + 0,3 designer + 0,3 PMO + Feycoil dogfood | 2,6 | 10 × 2,6 × 900 × 4,5 = **105 k€** | 5 k€ | **~110 k€** |
| **Équipe confort** | 2 fullstack + 0,5 designer + 0,5 PMO + 0,3 QA + Feycoil dogfood | 3,3 | 10 × 3,3 × 900 × 4,5 = **134 k€** | 5 k€ | **~140 k€** |

Le chiffre **95 k€** actuel de §13 correspond mathématiquement à ~2,35 ETP sur 10 sem. C'est entre l'équipe serrée et la médiane — techniquement tenable si on cadre l'équipe à **1 lead + 1 dev junior + 0,3 designer + 0,3 PMO** (≈ 2,3 ETP).

**Reco : Option B — équipe médiane 2,6 ETP ≈ 110 k€** (arrondi). Justifications :
- Fusion de deux bases de code (MVP + app-web) et migration data : 1 seul dev est risqué sur 10 sem.
- Designer à 0,3 ETP suffit (maintenance DS, pas création — DS "Twisty" est stable après S2).
- PMO à 0,3 ETP suffit (coordination sprints + GitHub + jalons).
- Feycoil reste dogfood user mais n'est **pas** budgété (c'est son temps de CEO, pas du dev).
- Écart vs 95 k€ actuel : +15 k€, crédible à défendre.

**Alternative défendable : Option A — équipe serrée 78 k€** si contrainte de cash dure. À assumer clairement : 1 seul dev = risque retard si arrêt maladie ou imprévu.

---

### Q4 — V1 : 14 sem ou 16 sem ?

Deux notions différentes, il faut trancher **laquelle est la durée canonique** et comment l'autre est étiquetée :

- **Option A — V1 = 16 sem canonique** (périmètre complet), avec §8 qui clarifie : "chemin critique 14 sem vers V1 cœur (6→10 sem fusion + 8 sem cœur) ; V1 complet = 16 sem (+ 8 sem enrichissements SharePoint/viz/auto-draft)".
- **Option B — V1 = 14 sem canonique** (cœur minimal), avec enrichissements traités comme V1.1 / V1.5. Budget V1 recalculé sur 14 sem × 4,3 ETP = ~245 k€ au lieu de 290 k€.

**Reco : A** — le header §4 et le calcul budget sont déjà à 16 sem, et les enrichissements (SharePoint RAG, viz riches, rituels auto-draftés) sont des épics V1 (F15, F19) pas V1.5. Clarifier §8 suffit.

---

### Q5 — Équipe v0.5 à documenter

Aucune option : à **ajouter** dans `08-roadmap.md` §3 (nouveau §3.2bis "Équipe v0.5") pour parité avec V1/V2/V3 qui ont leur section équipe explicite.

Reco contenu (selon la réponse Q3) :
> **Équipe v0.5** : 2 fullstack dev + 0,3 product designer + 0,3 PMO ≈ 2,6 ETP. Feycoil assure le dogfood quotidien (matin/soir) et valide les livrables à chaque fin de sprint. Pas de LLM engineer dédié (pas de changement de modèle par rapport à v0.4, Claude Sonnet uniquement).

---

## 4. Recommandation en bundle

Si le CEO dit "bundle reco" :

| Q | Décision |
|---|---|
| Q1 | **6 sprints (10 semaines)** — patcher SPEC-TECHNIQUE-FUSION pour ajouter S6 scellement |
| Q2 | **10 semaines partout** — corriger §3.2 (retirer "~1,5 mois"), §8 (6→10 sem), §13 (7→10 sem), SPEC-TECHNIQUE-FUSION §13 |
| Q3 | **Budget 110 k€ dérivé** (10 sem × 2,6 ETP × 900 × 4,5 ≈ 105 k€ dev + 5 k€ infra/LLM) — corriger §13 synthèse |
| Q4 | **V1 = 16 sem canonique** — clarifier §8 : 14 sem = chemin critique vers "V1 cœur", 16 sem = V1 complet |
| Q5 | **Ajouter §3.2bis "Équipe v0.5"** dans `08-roadmap.md` |

---

## 5. Décision (séance CEO 2026-04-24)

**"Bundle reco"** — toutes les recommandations acceptées en bloc.

| Q | Décision prise |
|---|---|
| Q1 | **6 sprints (10 semaines)** — S6 scellement dédié, distinct du S5 durcissement |
| Q2 | **10 semaines partout** — §3.2 corrigé, §8 corrigé, §13 synthèse corrigé, SPEC-TECHNIQUE-FUSION corrigé |
| Q3 | **Équipe médiane 2,6 ETP → ~110 k€** (2 fullstack + 0,3 designer + 0,3 PMO) |
| Q4 | **V1 = 16 sem canonique** (périmètre complet) ; §8 clarifié : 18 sem vers V1 cœur, 26 sem vers V1 complet |
| Q5 | **§3.2bis "Équipe v0.5" + §3.2ter "Budget v0.5"** ajoutés dans `08-roadmap.md` |

---

## 6. Livrables produits 2026-04-24

1. **ADR** `2026-04-24 · Timing & budget v0.5 réconciliés` ajoutée dans `00_BOUSSOLE/DECISIONS.md` (6 sprints / 10 sem / 110 k€ / équipe 2,6 ETP / V1 = 16 sem canonique).
2. **Patch `04_docs/08-roadmap.md`** :
   - §3.2 : "~1,5 mois dev temps plein" retiré (remplacé par "6 sprints")
   - §3.2bis (nouveau) : "Équipe v0.5" documentée (2,6 ETP)
   - §3.2ter (nouveau) : "Budget v0.5" dérivé (105 k€ dev + 5 k€ infra = ~110 k€)
   - §8 chemin critique : 6→10 sem fusion, clarification "V1 cœur" (18 sem) vs "V1 complet" (26 sem / 16 sem V1 pur)
   - §13 synthèse : `7 sem · ~95 k€` → `10 sem · ~110 k€` ; `— · 132 k€ partiel` → `— · dogfood solo` pour v0.4
3. **Patch `04_docs/SPEC-TECHNIQUE-FUSION.md` §13** :
   - Sprint 5 recentré sur durcissement technique
   - Sprint 6 ajouté (scellement, tag, release, rétro)
   - "132 kEUR conforme roadmap" remplacé par "10 semaines (6 sprints) · ~110 k€" avec renvoi vers §3.2ter
4. **`JOURNAL.md`** mis à jour (clôture S4, à faire à la fin).

---

## 7. Reste à faire (hors S4)

- S6 (livrables dev) devra référencer l'équipe v0.5 documentée ici pour le runbook onboarding.
- S8 (validation finale) devra vérifier que `SPEC-FONCTIONNELLE-FUSION.md` ne contredit pas non plus les nouveaux chiffres (probablement OK, la spec fonctionnelle ne chiffre pas).

---

*Session S4 ouverte le 2026-04-24 dans le cadre de l'atelier de cohérence.*
