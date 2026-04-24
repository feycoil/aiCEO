# Session 3 — Sources de vérité doc + dossiers orphelins

**Ouverture** : 24/04/2026
**Dissonances ciblées** : C3 (hiérarchie `06-architecture.md` vs `SPEC-TECHNIQUE-FUSION.md`), C6 (dossiers orphelins `05_journeys/`, `06_revues/`, `_drafts/`)

---

## 1. Contexte

L'audit a soulevé deux problèmes de structure qui, non traités, vont provoquer de la dérive documentaire continue :

### 1.1 Ambiguïté sur les sources de vérité

Plusieurs documents couvrent des périmètres qui se chevauchent sans que la hiérarchie soit explicitée :

| Paire de docs | Recouvrement | Risque |
|---|---|---|
| `04_docs/06-architecture.md` v2.0 vs `SPEC-TECHNIQUE-FUSION.md` | Tous deux décrivent l'archi cible v0.5/V1+. Le premier trace la carte large (v0.4 → V3), le second détaille la fusion v0.5 (schéma SQL, 10 sprints) | Le prochain dev qui modifie l'un oubliera l'autre |
| `04_docs/08-roadmap.md` vs GitHub Issues | La roadmap Markdown liste les jalons, GitHub porte le backlog vivant | Dérive potentielle entre les deux |
| `DECISIONS.md` vs commits Git | ADRs vs messages de commit | OK si la règle "ADR ≥ 30 min de débat" tient |

### 1.2 Dossiers à mandat flou

Trois dossiers vivent hors du chemin de lecture officiel :

| Dossier | Contenu réel | Mandat documenté | Statut audit |
|---|---|---|---|
| `05_journeys/` | 5 pages HTML + CSS (matinée, arbitrage, copilote, clôture, revue) + index + journey.css | Non cité dans `00-README.md`, pas d'indice sur la cadence ou le rôle | Orphelin |
| `06_revues/` | Revue W17 (markdown, widget jsx, widget html, pdf) + index | Pas de README, pas de règle de cadence | Orphelin semi-actif |
| `_drafts/` | `_template.md` et `_template-widget.jsx` (gabarits utiles), `REFONTE_v3.md` et `SPEC_v31.md` (anciennes itérations) | Aucune règle "combien de temps un draft vit avant d'être archivé ou promu" | Mélange gabarits + déchets |

### 1.3 Saut de numérotation et index incomplet

- `04_docs/00-README.md` décrit bien 01→10, y compris un renvoi pour le 09 archivé vers GitHub Issues. ✅ En réalité pas de saut visible.
- `SPEC-FONCTIONNELLE-FUSION.md` et `SPEC-TECHNIQUE-FUSION.md` sont bien listés, en section séparée "Spécifications fusion". ✅ OK mais peuvent être mieux intégrés.
- L'`AUDIT-COHERENCE-2026-04-24.md` n'est pas dans l'index. ❌ À ajouter ou marquer comme "transient".
- Le dossier `_atelier-2026-04-coherence/` n'est pas dans l'index. Voulu ou oubli ?

---

## 2. Questions à trancher

1. **Pour la paire `06-architecture.md` vs `SPEC-TECHNIQUE-FUSION.md`** — qui gagne sur quel périmètre, et comment on le déclare ?
2. **Pour `05_journeys/`** — on l'archive, on le promeut dans `04_docs/` comme fascicule officiel, ou on le garde comme démo UX à part ?
3. **Pour `06_revues/`** — on formalise le rituel avec un README + cadence, on archive, ou on le laisse comme bibliothèque de revues historiques ?
4. **Pour `_drafts/`** — quelle règle : durée de vie max, critère de promotion/archivage, qu'est-ce qu'on fait avec `REFONTE_v3.md` et `SPEC_v31.md` aujourd'hui ?
5. **Pour l'index `00-README.md`** — ajoute-t-on AUDIT + atelier ? Dans quelle section ?

---

## 3. Options et recommandation

### 3.1 Hiérarchie des sources de vérité (résout C3)

**Option retenue proposée** :

| Domaine | Source canonique | Rôle | Sources secondaires |
|---|---|---|---|
| **Architecture cible V1→V3** | `04_docs/06-architecture.md` | Carte large, trajectoire, budget global | — |
| **Architecture fusion v0.5** | `04_docs/SPEC-TECHNIQUE-FUSION.md` | Source de vérité opérationnelle : schéma SQL, endpoints REST, sprints | `06-architecture.md §2` renvoie vers elle |
| **Spec fonctionnelle v0.5** | `04_docs/SPEC-FONCTIONNELLE-FUSION.md` | 13 pages cibles, user flows matin/soir/hebdo | — |
| **Roadmap & jalons** | `04_docs/08-roadmap.md` | Milestones, budgets, KPIs par jalon | `00_BOUSSOLE/ROADMAP.md` compagnon |
| **Backlog opérationnel** | GitHub Issues `feycoil/aiCEO` | Single source | `08-roadmap.md` RICE table en miroir light |
| **Décisions structurantes** | `00_BOUSSOLE/DECISIONS.md` | ADR ≥ 30 min de débat | Commits Git pour micro-arbitrages |
| **Design tokens & règles** | `02_design-system/colors_and_type.css` + `tokens/` | Canoniques | `07-design-system.md` prose |

**ADR à rédiger** : `2026-04-24 · Hiérarchie des sources de vérité documentaires`, listant le tableau ci-dessus comme référence unique.

**Action sur `06-architecture.md`** : ajouter en tête de §2 un encadré *"Pour les détails opérationnels de la fusion v0.5 (schéma SQL, sprints, endpoints), la source canonique est `SPEC-TECHNIQUE-FUSION.md`. Ce document en donne la carte large et la trajectoire."*

### 3.2 `05_journeys/` — que faire ?

**Recommandation : promouvoir comme démo UX documentée**, intégrer au `00-README.md` en tant que **fascicule 04 bis** (ou 04-journeys).

Motifs : les 5 pages HTML sont une traduction concrète des user flows décrits dans `04-visualisation.md` et `SPEC-FONCTIONNELLE-FUSION §2`. C'est utile à :
- un designer qui veut voir à quoi ressemblent les flux cibles
- un investisseur/CEO pair qui veut cliquer plutôt que lire (livrable externe S5)
- un dev qui implémente la fusion v0.5

Action : ajouter une entrée dans `00-README.md` Couche 2, renommer le dossier (ou pas) et écrire un `05_journeys/README.md` de 5 lignes décrivant le rôle et la relation aux specs.

Alternative : archiver tel quel, ne pas s'y fier. Possible mais dommage vu le contenu.

### 3.3 `06_revues/` — que faire ?

**Recommandation : formaliser le rituel, cadence hebdo**.

La revue dominicale est un rituel produit clé (cité dans `01-vision-produit.md`, `08-roadmap.md`, `SPEC-FONCTIONNELLE-FUSION §4`). Le fait que W17 ait été produite en markdown + widget + pdf est la bonne pratique à répliquer.

Action :
- Créer `06_revues/README.md` avec : cadence (dimanche soir), template (markdown + widget optionnel), règle de nommage (`revue-YYYY-WNN.md`), qui relit.
- Lier depuis `00-README.md` comme fascicule transverse "Rituel hebdo".
- En V1, ce dossier sera alimenté automatiquement par le rituel dominical auto-drafté (cf. `08-roadmap §4`).

### 3.4 `_drafts/` — règle de vie

**Recommandation : règle simple à écrire dans `GOUVERNANCE.md`** :

- Les fichiers `_template*` restent indéfiniment (gabarits réutilisables).
- Tout autre draft vit **4 semaines maximum**. Au-delà, décision binaire : soit **promu** (déplacé dans son emplacement définitif et référencé dans un index), soit **archivé** (déplacé vers `_archive/YYYY-MM-draft-nom/`).
- `REFONTE_v3.md` et `SPEC_v31.md` ont > 4 semaines aujourd'hui. Action immédiate : les lire rapidement, décider promotion ou archivage.

### 3.5 Index `00-README.md` — ajouts

**Recommandation** :
- Ajouter un 11e fascicule transverse : **Rituel hebdo** (`06_revues/`).
- Ajouter un 12e fascicule transverse : **User journeys** (`05_journeys/`).
- Créer une section "Audits et ateliers" (pas dans les fascicules, à part) qui liste `AUDIT-COHERENCE-*` et `_atelier-*` comme documents de pilotage transitoires.

---

## 4. Livrables si recommandations retenues

1. **ADR `2026-04-24 · Hiérarchie des sources de vérité`** dans `DECISIONS.md` — tableau des sources canoniques, règles d'arbitrage
2. **ADR `2026-04-24 · Règle de vie des drafts`** dans `DECISIONS.md` — 4 semaines max, promotion ou archivage
3. **Patch `04_docs/06-architecture.md` §2** — encadré de renvoi vers SPEC-TECHNIQUE-FUSION
4. **`05_journeys/README.md`** créé — mandat, relation aux specs, 5 pages listées
5. **`06_revues/README.md`** créé — cadence, template, nommage, alimentation V1
6. **Patch `_drafts/README.md` ou `GOUVERNANCE.md`** — règle 4 semaines explicite
7. **Arbitrage `REFONTE_v3.md` et `SPEC_v31.md`** — lecture rapide, décision à documenter
8. **Patch `04_docs/00-README.md`** — ajout fascicules 11/12 + section "Audits et ateliers"

---

## 5. Décision (séance CEO 2026-04-24)

Le CEO a validé le **bundle reco** (toutes les recommandations retenues telles que proposées) :

| Question | Décision |
|---|---|
| Q1 — Hiérarchie `06-architecture.md` vs `SPEC-TECHNIQUE-FUSION.md` | **Acceptée** (proposition 3.1). ADR rédigée, tableau des sources canoniques figé. |
| Q2 — `05_journeys/` | **Promu en fascicule transverse** (12). README créé, lien dans `00-README.md`. |
| Q3 — `06_revues/` | **Formalisé en rituel hebdo** (fascicule 11). README créé avec cadence dimanche, gabarit, nommage `revue-YYYY-WNN.md`, alimentation auto prévue V1. |
| Q4 — `_drafts/` | **Règle 4 semaines** retenue. ADR rédigée. `REFONTE_v3.md` et `SPEC_v31.md` archivés dans `_archive/2026-04-drafts-heritage/` (motif : content-obsolete, superseded par fascicules 01-08 + SPEC-FUSION). |
| Q5 — `00-README.md` | **Ajouts 11 + 12 + section "Audits et ateliers"** appliqués. |

## 6. Livrables produits 2026-04-24

- ✅ **ADR `2026-04-24 · Hiérarchie des sources de vérité documentaires`** dans `00_BOUSSOLE/DECISIONS.md` — tableau des 7 domaines avec source canonique unique, règle d'arbitrage en cas de conflit.
- ✅ **ADR `2026-04-24 · Règle de vie des drafts (4 semaines max)`** dans `00_BOUSSOLE/DECISIONS.md` — politique complète (gabarits vs drafts, promotion vs archivage, header obligatoire).
- ✅ **Patch `04_docs/06-architecture.md` §2** — encadré de renvoi explicite vers `SPEC-TECHNIQUE-FUSION.md` comme source canonique pour la fusion v0.5.
- ✅ **`05_journeys/README.md`** créé — mandat (démo UX cliquable), audiences (designer / dev / CEO pair / investisseur), 5 pages listées, relation aux sources canoniques.
- ✅ **`06_revues/README.md`** créé — cadence dimanche 18h-21h, gabarit en 6 points, nommage ISO `revue-YYYY-WNN.md`, alimentation V1 auto-drafté.
- ✅ **`_drafts/README.md`** créé — règle 4 semaines explicite, header obligatoire pour tout nouveau draft, audit trimestriel programmé.
- ✅ **Archivage `REFONTE_v3.md` + `SPEC_v31.md`** → `_archive/2026-04-drafts-heritage/` (contenu intégral préservé, stubs pointeurs dans `_drafts/`, README d'archive expliquant le motif).
- ✅ **Patch `04_docs/00-README.md`** — ajout fascicule 11 (Rituel hebdo) + fascicule 12 (User journeys) + section "Audits et ateliers" listant AUDIT-COHERENCE + `_atelier-2026-04-coherence/`.

## 7. Reste à faire (hors S3)

- **Patch `00_BOUSSOLE/GOUVERNANCE.md`** — ajouter section "Audit trimestriel des drafts" (Q4 de la règle). Sera fait en S7 (DS & process) pour éviter de toucher GOUVERNANCE.md dans plusieurs sessions.
- **Prose des autres docs** qui citent `06-architecture.md` sans préciser sa relation à SPEC-TECHNIQUE-FUSION — audit lors de S8 (validation globale).
- **Vérification visuelle** que le rendu du fascicule `00-README.md` reste cohérent avec les ajouts — à faire en S8.

---

*S3 ouverte 2026-04-24, close 2026-04-24. Bundle reco retenu intégralement. 8 livrables produits. Trace dans ce fichier + JOURNAL.md + DECISIONS.md (2 ADR) + 4 nouveaux README + 1 dossier archive.*
