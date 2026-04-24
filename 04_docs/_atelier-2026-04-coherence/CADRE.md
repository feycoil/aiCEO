# Atelier de cohérence — aiCEO

**Date de lancement** : 24 avril 2026
**Durée cible** : 4 semaines (clôture 22 mai 2026)
**Pilote** : Feycoil Mouhoussoune (CEO)
**Assistant** : Claude (Cowork)
**Déclencheur** : `04_docs/AUDIT-COHERENCE-2026-04-24.md` — 7 dissonances critiques, plan P0→P2.

---

## 1. Objectif

Résoudre les 7 dissonances identifiées dans l'audit de cohérence, et livrer un repo aiCEO qui tient **trois routes** en parallèle :

1. **Route technique** — un seul narratif technique entre vision, spec fusion et code livré.
2. **Route stratégique** — un business case et un positionnement alignés sur la réalité produit.
3. **Première conversation externe** — des livrables partageables (CEO pair ETIC, investisseur, dev externe, client potentiel).

À la sortie : plus aucune contradiction majeure entre documents, trace écrite de chaque arbitrage, et un kit de 6 livrables externes prêts à être envoyés.

---

## 2. Méthode — 8 sessions thématiques

Chaque session suit le même gabarit :

1. **Contexte** — rappel du problème (extrait audit + docs concernés).
2. **Options** — 2 à 3 options concrètes, chacune avec conséquences écrites.
3. **Question(s) à trancher** — Claude pose, CEO répond.
4. **Décision** — consignée dans `JOURNAL.md` + ADR formelle si structurante.
5. **Livrables** — documents produits ou patchés immédiatement.
6. **Validation de session** — go/no-go avant la session suivante.

Une session = une unité de décision cohérente. Elle peut durer 15 min (typographie) ou 2 h (livrables externes).

---

## 3. Planning indicatif

| # | Session | Dissonance ciblée | Durée estimée | Semaine |
|---|---|---|---|---|
| **S1** | Narratif produit & trajectoire local→cloud | C1, C7 | 45 min | S1 |
| **S2** | Typographie canonique | C2 | 15 min | S1 |
| **S3** | Sources de vérité documentaires + dossiers orphelins | C3, C6 | 30 min | S1 |
| **S4** | Timing & budget v0.5 | C1 (sous-point) | 30 min | S1 |
| **S5** | Livrables externes (CEO pair, investisseur, client) | C4 | 2–3 h | S2 |
| **S6** | Livrables dev (onboarding, OpenAPI, runbook) | C4 (sous-point) | 2 h | S3 |
| **S7** | Pipeline DS → CSS & process 3 silos | C2 suite, consistance | 1 h | S4 |
| **S8** | Validation globale, archivage, CHANGELOG | — | 30 min | S4 |

---

## 4. Livrables attendus en sortie d'atelier

### ADRs dans `00_BOUSSOLE/DECISIONS.md`
- ADR-FUSION-02 — Trajectoire produit local-first → cloud
- ADR-DS-01 — Typographie canonique
- ADR-DOC-01 — Hiérarchie des sources de vérité documentaires
- ADR-TECH-01 — Bascule PowerShell COM → Graph API OAuth (horizon V1)
- ADR-UI-01 — Stratégie SolidJS (F17) : go, no-go ou déclencheurs

### Documents patchés
- `04_docs/01-vision.md` — bloc "état actuel vs horizon"
- `04_docs/04-positionnement.md` — benchmark mis à jour
- `04_docs/00-README.md` — index complété (SPEC-FUSION + numérotation)
- `04_docs/07-design-system.md` — alignement typographie
- `04_docs/08-roadmap.md` — timing & budget v0.5 réconciliés

### Nouveaux documents
- `04_docs/PITCH-ONEPAGE.md`
- `04_docs/BUSINESS-CASE.md`
- `04_docs/ONBOARDING-CEO-PAIR.md`
- `04_docs/ONBOARDING-DEV.md`
- `04_docs/API-OPENAPI.yaml` (ou `.md`)
- `04_docs/RUNBOOK-OPS.md`

### Artefacts techniques
- `02_design-system/scripts/export-to-css.{ps1|js}` — génère `app.css` depuis tokens
- Chemin type "DS ↔ Cowork ↔ GitHub" documenté dans `GOUVERNANCE.md`

### Clôture
- `00_BOUSSOLE/CHANGELOG.md` mis à jour
- `_atelier-2026-04-coherence/` archivé in-place (pas supprimé — sert de trace)

---

## 5. Règles de l'atelier

- **Une décision ne se re-débat pas.** Si S1 tranche "local-first pont jetable", S5 ne reviendra pas dessus.
- **Pas de perfection.** Chaque livrable est "bon assez pour servir" ; on itère après usage réel, pas en atelier.
- **Pas de nouveau périmètre.** L'atelier ne crée pas de nouvelle feature, il consolide l'existant.
- **Trace écrite systématique.** Chaque session finit par un patch dans `JOURNAL.md` avant de fermer.
- **Validation finale CEO.** Le CEO valide chaque livrable à la clôture (S8).

---

## 6. Arborescence de l'atelier

```
04_docs/_atelier-2026-04-coherence/
├── CADRE.md                     ← ce document
├── JOURNAL.md                   ← journal de décisions, tenu session par session
├── sessions/
│   ├── S1-narratif-produit.md
│   ├── S2-typographie.md
│   ├── S3-sources-verite.md
│   ├── S4-timing-budget-v0.5.md
│   ├── S5-livrables-externes.md
│   ├── S6-livrables-dev.md
│   ├── S7-ds-et-process.md
│   └── S8-validation.md
└── drafts/                      ← brouillons avant promotion vers 04_docs/
```

À la clôture, le dossier **n'est pas supprimé** — il devient la trace de l'atelier et peut être rouvert si un arbitrage doit être révisé.

---

## 7. Critères de clôture (S8)

L'atelier est considéré clos quand **tous les items suivants sont verts** :

- [ ] 5 ADRs rédigées, datées, signées CEO dans `DECISIONS.md`
- [ ] 5 documents patchés (vision, positionnement, README, DS, roadmap)
- [ ] 6 nouveaux documents créés et relus
- [ ] 1 script export tokens→CSS fonctionnel
- [ ] CHANGELOG à jour, section dédiée atelier
- [ ] `JOURNAL.md` complet, chaque session tracée
- [ ] Au moins 1 des 6 livrables externes testé (envoi à 1 CEO pair ou 1 investisseur)

---

*Cadre établi le 24/04/2026. Révision possible uniquement en S8 et uniquement si un blocage structurel est identifié pendant l'atelier.*
