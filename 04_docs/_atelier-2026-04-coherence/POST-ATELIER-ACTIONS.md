# POST-ATELIER — Actions manuelles à exécuter hors atelier

*Produit en clôture S8 le 2026-04-24. Maintenu par le CEO jusqu'à épuisement.*

L'atelier de cohérence 2026-04 a produit 45 livrables et 11 ADRs. Certaines actions **sortent du périmètre Claude** (création d'issues GitHub, saisie d'événements agenda, exécution de scripts dans une session Cowork avec shell, sprints de production de livrables). Cette check-list mécanique en tient le décompte dans un seul endroit.

Règle : **un item coché ici = une discipline tenue**. Si un item reste ouvert > 1 mois, flag en revue hebdo dominicale (`06_revues/`).

---

## 1. Validations techniques (prochaine session Cowork avec shell)

### 1.1 Premier run du pipeline DS → CSS (S7)

**⚠️ Bug corrigé le 2026-04-24 post-premier-run** : le script initial utilisait `indexOf(GEN_END)`, qui a matché une citation littérale du marqueur de fin dans un commentaire descriptif (pré-run, le fichier source contenait un commentaire "...entre /\* === GENERATED ... === \*/ et /\* === END GENERATED === \*/ est réécrit par..."). Résultat : bloc @font-face + :root dupliqué, commentaire coupé en deux. Patch appliqué : `scripts/export.js` ligne 84 utilise désormais `lastIndexOf(GEN_END)` — robuste à toute mention littérale du marqueur en prose entre les bornes.

- [x] ~~Premier run exécuté 2026-04-24~~ **résultat corrompu** (bug `indexOf` ci-dessus) — à refaire après revert.
- [x] Bug script identifié + patché (`indexOf` → `lastIndexOf` sur GEN_END).
- [ ] Revert des 2 CSS touchés : `git checkout 02_design-system/colors_and_type.css 03_mvp/public/assets/colors_and_type.css`.
- [ ] Ré-exécuter : `cd 02_design-system && npm run ds:export`.
- [ ] Vérifier rapport console : 12 @font-face + 92 tokens / 12 groupes + chemins + 4 prochaines étapes.
- [ ] `git diff --stat 02_design-system/colors_and_type.css 03_mvp/public/assets/colors_and_type.css`
- [ ] **Cible** : diff petit à modéré sur `02_design-system/colors_and_type.css` (le bloc entre marqueurs passe du format hand-written décoratif au format généré — **mêmes valeurs** mais formatage/commentaires différents). Diff quasi-vide attendu sur `03_mvp/public/assets/colors_and_type.css` (fichier 100% généré, déjà en format généré).
- [ ] Si dérive **sur les valeurs** (couleurs, tailles, poids différents) : corriger `tokens.json` pour matcher l'existant. Ne **jamais** éditer à la main le bloc généré.
- [ ] Ouvrir `02_design-system/preview/colors-accents.html` + `colors-neutrals.html` + `type-scale.html` dans un navigateur → vérifier rendu identique à avant.
- [ ] Si OK : commit `design(ds): first pipeline run — tokens.json source + script export.js (fix: lastIndexOf for GEN_END) + 03_mvp pushed (closes S7 validation)`

### 1.2 Vérification rendu `00-README.md` post-S3 (audit S8 déléguée)

- [ ] Ouvrir `04_docs/00-README.md` sur GitHub (rendu markdown) — vérifier :
  - Fascicules 01-08 numérotés correctement
  - Fascicule 11 (`06_revues/`) + fascicule 12 (`05_journeys/`) listés
  - Section "Audits et ateliers" présente avec lien vers `_atelier-2026-04-coherence/JOURNAL.md`
  - Section "Livrables externes" listée (5 fichiers avec mention *(à produire)*)
  - Section "Livrables dev" pointe vers `03_mvp/docs/ONBOARDING-DEV.md` + `RUNBOOK-OPS.md`
- [ ] Si écart : patch ciblé + commit.

---

## 2. Issues GitHub à ouvrir (backlog atelier)

Toutes dans `feycoil/aiCEO`. Contenu préparé dans chaque session file de l'atelier.

### 2.1 Issues produites par S2+S7 (câblage MVP ↔ DS)

- [ ] **`ds/wire-mvp-to-ds`** (anciennement `ds/fira-install-03mvp`, scope élargi post-découverte 2026-04-24) — Câblage complet du MVP sur le design system en 3 volets : (A) copier 12 polices (10 Fira Sans OTF + Aubrielle + Sol) de `02_design-system/fonts/` vers `03_mvp/public/assets/fonts/` ; (B) ajouter `<link rel="stylesheet" href="/assets/colors_and_type.css">` dans `index.html` et `evening.html` ; (C) migrer les variables inline (`--cream`, `--ink`, `--lilac`, `--sage`, `--coral`) vers les tokens DS (`--surface`, `--text`, `--violet`, `--emerald|--sage-keep` à trancher, `--rose`). Scope MVP, P1, exécution Sprint 1 v0.5. Contenu complet : voir `drafts/ISSUES-A-OUVRIR.md §Issue 1`. **Découvert lors de la validation §1.1** : le MVP a 350 lignes de CSS inliné qui shuntent `colors_and_type.css` et définissent une palette hard-codée divergente (ex : `--sage #A8C8A4` MVP vs `--emerald #3d7363` DS, `--amber #E0B25C` vs `--amber #b88237`).

### 2.2 Issues produites par S5 (livrables externes)

- [ ] **`doc/02-benchmark-v2-positionnement-a-jour`** — **P0** bloquant. Patch `02-benchmark.md` pour retirer Lattice/Motion/Superhuman et introduire Copilot for Business, Rewind, Motion-desktop. 2-4 h. Bloque les 5 autres.
- [ ] **`doc/pitch-onepage-ceo-pair`** — P1. Livrable externe, ~1 j. Après 2.2 ci-dessus.
- [ ] **`doc/business-case-investisseur`** — P1. ~2 j. Après 2.2.
- [ ] **`doc/onboarding-ceo-pair`** — P1. ~0,5 j. Après 2.2.
- [ ] **`doc/lettre-intro-ceo-pair`** — P1. ~2 h. Après onboarding.
- [ ] **`doc/pitch-deck-investisseur-pptx`** — P1. ~1-2 j. Après business case.
- [ ] **`doc/client-potentiel-PARQUE`** — P3 parqueur. Ré-ouverture post-V1.
- [ ] **`doc/partenaire-tech-PARQUE`** — P3 parqueur. Ré-ouverture post-V2.

Contenu des 8 issues : voir `sessions/S5-livrables-externes.md §9`.

### 2.3 Issues produites par S6 (livrables dev)

- [ ] **`infra/openapi-generated-from-code`** — P1. Scope MVP, exécution Sprint 3-4 v0.5 (Zod + `zod-to-openapi` + CI check drift). Contenu : voir `sessions/S6-livrables-dev.md §7`.

### 2.4 Issues produites par S7 (pipeline DS)

- [ ] **`infra/ds-export-pre-commit-hook`** — P2. Scope MVP, exécution Sprint 3 v0.5 (quand Husky arrive dans la stack per SPEC-FUSION §9). Contenu : voir `sessions/S7-ds-process-silos.md §5`.

### 2.5 Label GitHub dédié à créer

- [ ] Créer label **`type/audit-trimestriel`** (couleur au choix, description : "Audit trimestriel des livrables vivants — règle GOUVERNANCE.md"). Utilisé par les 12 issues trimestrielles (section 3 ci-dessous).

---

## 3. Calendrier trimestriel figé (S7 règle maintien unifiée)

Saisir dans l'agenda CEO comme événements récurrents trimestriels (ou tâche planifiée Windows en v0.5, cf. SPEC-FUSION §7).

### 3.1 Q2 2026 — ouverture le 24 juillet 2026

- [ ] Créer issue `audit/drafts Q2` (milestone Q2, label `type/audit-trimestriel`, scope `_drafts/*`)
- [ ] Créer issue `audit/livrables-dev Q2` (milestone Q2, scope `03_mvp/docs/ONBOARDING-DEV.md` + `RUNBOOK-OPS.md` + `openapi.yaml`)
- [ ] Créer issue `audit/ds Q2` (milestone Q2, scope `02_design-system/tokens.json` + CSS générés)
- [ ] Exécuter les 3 audits dans les **10 jours ouvrés** suivants → 07/08/2026 maximum.
- [ ] Sinon flag en revue hebdo dominicale.

### 3.2 Q3 2026 — ouverture le 24 octobre 2026

- [ ] 3 issues (drafts Q3, livrables-dev Q3, ds Q3) + exécution ≤ 07/11/2026.

### 3.3 Q4 2026 — ouverture le 24 janvier 2027

- [ ] 3 issues (drafts Q4, livrables-dev Q4, ds Q4) + exécution ≤ 06/02/2027.

### 3.4 Q1 2027 — ouverture le 24 avril 2027

- [ ] 3 issues (drafts Q1, livrables-dev Q1, ds Q1) + exécution ≤ 07/05/2027.
- [ ] **À cette date** : anniversaire 1 an de l'atelier cohérence. Ré-audit général du repo ? (décision à prendre en Q1 2027)

### 3.5 Automatisation v0.5 (parqué)

- [ ] Quand Service Windows v0.5 est en prod (SPEC-FUSION §7) : planifier tâche qui crée automatiquement les 3 issues à chaque date ci-dessus. D'ici là : tâche manuelle.

---

## 4. Sprints de production post-atelier (plan audit cohérence)

### 4.1 Sprint S2 plan audit — 05/05 → 11/05/2026 (livrables externes)

- [ ] Ouvrir les 6 issues actives de §2.2 (sans les 2 parqueurs).
- [ ] Traiter en ordre : benchmark-v2 (P0) → onboarding-ceo-pair → lettre-intro → pitch-onepage → business-case → pitch-deck.
- [ ] 5 livrables produits dans `04_docs/` avec préfixes MAJUSCULES + en-tête de filtrage confidentialité obligatoire.
- [ ] **Test de sortie atelier** : envoi d'au moins 1 livrable à 1 CEO pair ETIC pour valider réception/compréhension (critère de clôture CADRE §7 item final).

### 4.2 Sprint S3 plan audit — 12/05 → 18/05/2026 (openapi.yaml)

- [ ] Produire `03_mvp/docs/openapi.yaml` en ~1,5 j de travail doc sur la base de `SPEC-TECHNIQUE-FUSION.md` §6 (~40 endpoints / 14 domaines).
- [ ] Diff vs SPEC-FUSION §6 pour détecter éventuelle dérive.
- [ ] Commit + close l'entrée concernée dans le backlog v0.4.

---

## 5. Critères de clôture atelier (CADRE.md §7)

État à la clôture S8 :

- [x] **5 ADRs rédigées** → **8 ADRs atelier** (S1 trajectoire, S2 typographie, S3 hiérarchie sources, S3 règle drafts, S4 timing budget, S5 livrables externes, S6 livrables dev, S7 pipeline tokens) + 4 ADRs pré-atelier datées du même jour = **12 ADRs au 24/04/2026**, toutes signées CEO (via validations "bundle reco" en session)
- [x] **5 documents patchés** → 8 documents patchés (vision, positionnement, 06-architecture, 07-design-system, 08-roadmap, 00-README, SPEC-TECHNIQUE-FUSION, SPEC-FONCTIONNELLE-FUSION)
- [ ] **6 nouveaux documents créés** — partiellement : 2 créés (ONBOARDING-DEV, RUNBOOK-OPS) + 4 READMEs dossiers orphelins + 8 session files atelier ; les 5 livrables externes restent à produire en sprint 05/05-11/05 (item §4.1)
- [x] **1 script export tokens → CSS fonctionnel** — `02_design-system/scripts/export.js` créé (~90 lignes ESM, zéro dépendance). **Premier run à exécuter en §1.1 pour confirmation visuelle.**
- [x] **CHANGELOG à jour, section dédiée atelier** — entrée dans `[Non publié]` du `00_BOUSSOLE/CHANGELOG.md`
- [x] **JOURNAL.md complet, chaque session tracée** — 8 sessions closes
- [ ] **Au moins 1 des 6 livrables externes testé** — post-production, item §4.1

**Statut** : atelier clos sur les items actionnables en session. 2 items restent ouverts et sont tracés dans cette check-list (§1.1 validation pipeline DS + §4.1 test livrable externe). Ils **ne rouvrent pas l'atelier** — ils sont traités comme maintenance par l'audit trimestriel (pattern S3+S6+S7).

---

## 6. Suivi

- [ ] Cocher chaque item au fur et à mesure.
- [ ] Commit de cette check-list modifiée à chaque progression significative : `chore(atelier): post-atelier progress — <item coché>`.
- [ ] Si un item stagne > 1 mois : flag en revue hebdo dominicale `06_revues/revue-2026-WXX.md`.
- [ ] Quand **tout est coché** (horizon réaliste : fin Q2 2026 pour §1 + §2 + §4, Q1 2027 pour §3.4) : renommer ce fichier en `POST-ATELIER-ACTIONS-CLOS.md` et déplacer dans `_archive/2026-04-atelier-coherence/` avec stub pointeur.

---

*Généré en S8 atelier cohérence 2026-04-24. Source : synthèse de S2§7, S5§9, S6§7, S7§5 + critères clôture CADRE §7.*
