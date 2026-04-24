# Journal de l'atelier de cohérence

Trace chronologique des décisions prises pendant l'atelier 2026-04-coherence.
Format : une entrée par session, mise à jour en fin de session.

---

## 2026-04-24 — Ouverture

- Audit de cohérence produit (`04_docs/AUDIT-COHERENCE-2026-04-24.md`).
- 7 dissonances critiques identifiées.
- Démarche : atelier structuré 8 sessions, 4 semaines.
- Cadre formalisé dans `CADRE.md`.
- Ouverture Session 1 — Narratif produit.

---

## Sessions

### S1 — Narratif produit & trajectoire
*Statut : ✅ close 2026-04-24*

**Décision** : Option A — local-first comme pont jetable (v0.4/v0.5) → cloud V1+.

**Contrainte ajoutée par le CEO** : **continuité d'usage**. Le CEO ne doit pas perdre l'usage pendant la fusion v0.5 ni la bascule cloud V1. Mode parallèle obligatoire, rollback ≤ 10 min, parité avant bascule finale, chaque sprint livre une fonctionnalité utilisable.

**Livrables** :
- ADR `2026-04-24 · Trajectoire produit` dans `00_BOUSSOLE/DECISIONS.md`
- Patch `01-vision-produit.md` § 0 "État actuel vs horizon"
- Patch `02-benchmark.md` § 0 "Deux marchés de référence, deux phases produit"

**À reprendre en aval** : S4 (budgéter la refonte stack local→cloud en V1), S6 (runbook mode parallèle v0.4 + v0.5).

### S2 — Typographie
*Statut : ✅ close 2026-04-24*

**Décision** : Option A — **Fira Sans canonique, self-hostée**.

**8 fichiers patchés** :
- `02_design-system/assets/app.css` — `@import Inter` → `@import ../colors_and_type.css`
- `02_design-system/assets/product.app.css` — idem + `font-family: Fira Sans`
- `01_app-web/assets/app.css` — purge Inter + ajout `@font-face` Fira 6 poids
- `03_mvp/public/index.html` — Calibri/Cambria → `"Fira Sans", Calibri/Cambria, …`
- `03_mvp/public/evening.html` — idem
- `04_docs/07-design-system.md` § 2.3 — réécriture stack Fira complète
- `00_BOUSSOLE/DECISIONS.md` — ADR ajoutée
- `02_design-system/REPO-CONTEXT.md` — marqué "écart résolu"

**Continuité préservée** : MVP affiche toujours Cambria/Calibri visuellement, Fira Sans est première dans la stack et prendra le relais quand les fichiers OTF seront copiés dans `03_mvp/public/assets/fonts/` (sprint S1 fusion v0.5).

**Reste à faire (hors S2)** : Issue GitHub à ouvrir manuellement (contenu préparé dans `S2-typographie.md §7`), prose README DS à mettre à jour (upstream OneDrive).

### S3 — Sources de vérité doc + orphelins
*Statut : ✅ close 2026-04-24*

**Décision** : bundle reco retenu intégralement.
- Hiérarchie des sources canoniques formalisée (tableau 7 domaines, ADR dédiée).
- `05_journeys/` promu en fascicule transverse 12 (démo UX cliquable).
- `06_revues/` formalisé en fascicule transverse 11 (rituel hebdo dominical).
- Règle 4 semaines pour les drafts (ADR dédiée).
- `REFONTE_v3.md` + `SPEC_v31.md` archivés dans `_archive/2026-04-drafts-heritage/` (content-obsolete, superseded par fascicules 01-08 + SPEC-FUSION).
- `00-README.md` enrichi : fascicules 11/12 + section "Audits et ateliers".

**8 livrables produits** :
- 2 ADRs dans `00_BOUSSOLE/DECISIONS.md` (Hiérarchie sources + Règle drafts)
- Patch `04_docs/06-architecture.md` §2 (encadré de renvoi vers SPEC-TECHNIQUE-FUSION)
- Patch `04_docs/00-README.md` (fascicules 11/12 + section Audits)
- 4 nouveaux README (`05_journeys/`, `06_revues/`, `_drafts/`, `_archive/2026-04-drafts-heritage/`)
- Archivage 2 drafts + stubs pointeurs dans `_drafts/`

**À reprendre en aval** : S7 (patch `GOUVERNANCE.md` section "Audit trimestriel des drafts"), S8 (audit des autres docs qui citent `06-architecture.md` + vérification rendu `00-README.md`).

### S4 — Timing & budget v0.5 réconciliés
*Statut : ✅ close 2026-04-24*

**Décision** : bundle reco — 6 sprints / 10 sem / équipe 2,6 ETP / ~110 k€ / V1 = 16 sem canonique.

**Dissonances résolues** : 7 dissonances factuelles sous C1 (timing v0.5) + C5 (budget v0.5). Quatre durées différentes (6 / 7 / 9 / 10 sem) réconciliées à **10 sem partout**. Budget 95 k€ non dérivé → **110 k€ dérivé explicitement** (2,6 ETP × 10 sem × 900 €/j × 4,5 j/sem + 5 k€ infra). SPEC-TECHNIQUE-FUSION remise en cohérence (5 sprints → 6 sprints, 132 kEUR v0.4 → 110 kEUR v0.5). Durée V1 clarifiée : 14 sem = chemin critique vers "V1 cœur", 16 sem = V1 complet canonique.

**Livrables** :
- ADR `2026-04-24 · Timing & budget v0.5 réconciliés` dans `00_BOUSSOLE/DECISIONS.md`
- Patches `04_docs/08-roadmap.md` : §3.2 (retrait "1,5 mois"), §3.2bis équipe v0.5, §3.2ter budget v0.5, §8 chemin critique, §13 synthèse
- Patch `04_docs/SPEC-TECHNIQUE-FUSION.md` §13 (Sprint 6 ajouté, budget 132 kEUR → 110 kEUR avec renvoi)

**À reprendre en aval** : S6 (runbook onboarding dev doit référencer l'équipe v0.5 documentée), S8 (vérifier que `SPEC-FONCTIONNELLE-FUSION.md` ne contredit pas les nouveaux chiffres — probable OK car la spec fonctionnelle ne chiffre pas).

### S5 — Livrables externes (CEO pair, investisseur)
*Statut : ✅ close 2026-04-24*

**Décision** : bundle reco — CEO pair + Investisseur traités maintenant (client post-V1, partenaire tech post-V2 parqués avec issues GitHub explicites). 5 livrables cadrés pour production en S2 du plan audit (05/05 → 11/05) : `PITCH-ONEPAGE.md`, `BUSINESS-CASE.md`, `ONBOARDING-CEO-PAIR.md`, `LETTRE-INTRO-CEO-PAIR.md`, `PITCH-DECK-INVESTISSEUR.pptx` — **+ dépendance bloquante P0** : patch `02-benchmark.md` (positionnement obsolète C7).

**Cadrage** :
- Stockage : `04_docs/` avec préfixes MAJUSCULES (cohérent avec `SPEC-FUSION`).
- Confidentialité : un fichier par audience, en-tête de filtrage obligatoire (`Audience : X. Éléments redactés : Y. Version interne de référence : Z.`).
- Cadence : maintien continu, revue à chaque jalon produit scellé (v0.5, V1, V2).
- S5 = **session de cadrage** uniquement. La **production** des livrables est un sprint dédié de 4-5 j à démarrer en S2 du plan audit.

**Livrables** :
- ADR `2026-04-24 · Livrables externes : cadrage` dans `00_BOUSSOLE/DECISIONS.md`
- Patch `04_docs/00-README.md` : nouvelle section "Livrables externes" (5 livrables listés *(à produire)*)
- Contenu de 8 issues GitHub à ouvrir manuellement (6 actives + 2 parqueurs) — préparé dans `sessions/S5-livrables-externes.md` §9

**À reprendre en aval** : sprint de production dédié (05/05 → 11/05 dans le plan audit) ; S8 validera la cohérence des 5 livrables avec les chiffres canoniques S1/S2/S3/S4.

### S6 — Livrables dev
*Statut : ✅ close 2026-04-24*

**Décision** : bundle reco — **éclaté minimal** (2 fichiers, pas 3) + **OpenAPI hybride** (hand-written maintenant, généré en Sprint 3-4) + **runbook minimal vivant** (règle : chaque panne → entrée) + **stockage hybride par nature** (`03_mvp/docs/` + pointeurs `04_docs/`) + **maintien continu + audit trimestriel** (pattern S3 mutualisé).

**Gap audit P1-5 fermé** : onboarding dev structuré, runbook ops documenté, OpenAPI cadré (produit en S2 plan audit). Audience CTO/dev passe de ~70 % couverte à ~90 % (10 % restants = openapi.yaml à produire).

**Livrables produits** :
- ADR `2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook` dans `00_BOUSSOLE/DECISIONS.md`
- `03_mvp/docs/ONBOARDING-DEV.md` — squelette complet (pré-requis, démarrage 15 min, 8 modules `src/`, commandes npm, conventions, flux type, FAQ, maintien). Pointe vers SPEC-TECHNIQUE-FUSION comme source canonique architecture (pas de dupliquer).
- `03_mvp/docs/RUNBOOK-OPS.md` — 5 catégories de pannes documentées (serveur, clé Anthropic, import Outlook, proxy corp, JSON OneDrive) + ébauche Service Windows v0.5. Règle de maintenance explicitement en tête.
- Patch `04_docs/00-README.md` : nouvelle section "Livrables dev" pointant vers les 3 fichiers `03_mvp/docs/`
- Patch `04_docs/SPEC-TECHNIQUE-FUSION.md` §6 : encadré de renvoi vers `openapi.yaml` + note sur la bascule hand-written → généré

**Non produit en S6, parqué** :
- `03_mvp/docs/openapi.yaml` — à produire en sprint dédié S2 plan audit (12/05 → 18/05, ~1,5 j de travail doc sur la base de SPEC-TECHNIQUE-FUSION §6, ~40 endpoints / 14 domaines)
- Issue GitHub `infra/openapi-generated-from-code` à ouvrir manuellement (scope MVP, P1, exécution Sprint 3-4 v0.5)
- `CONTRIBUTING.md` séparé (ré-ouverture si contractor V2+)
- `ONBOARDING-DEV-EXTERNE.md` (post-V2)

**À reprendre en aval** : S7 (patch `GOUVERNANCE.md` règle "maintien continu + audit trimestriel" des livrables dev, à mutualiser avec drafts S3), S8 (valider que les 3 livrables dev restent cohérents avec SPEC-TECHNIQUE-FUSION sans dérive, audit spécifique openapi.yaml vs SPEC §6 quand produit).

### S7 — DS & process / pipeline tokens
*Statut : ✅ close 2026-04-24*

**Décision** : bundle reco — **`tokens.json` source canonique** (Q1) + **script Node maison** `scripts/export.js` ~90 lignes (Q2) + **déclencheur manuel maintenant, Husky Sprint 3 v0.5** (Q3) + **tokens atomiques complets** couleurs+typo+espacements+radii+shadows+gradients (Q4) + **chemin type 7 étapes + règle maintien unifiée + calendrier trimestriel figé** (Q5).

**Coût caché adressé** : "3 silos indépendants" (Claude Design ↔ Cowork ↔ GitHub) — chaque modif de token passait par ~1 h de coordination manuelle sans chemin type. Post-S7 : ~15 min (export JSON → `npm run ds:export` → diff → commit). Trois règles "maintien continu + audit trimestriel" déposées par S3 (drafts) + S6 (livrables dev) + S7 (DS) **mutualisées une seule fois** dans GOUVERNANCE.md.

**Livrables produits** :
- ADR `2026-04-24 · Pipeline tokens DS → CSS + maintien unifié` dans `00_BOUSSOLE/DECISIONS.md`
- `02_design-system/tokens.json` — source canonique (`$meta`, `fonts.faces` 12 entrées, `vars` 12 groupes couvrant couleurs neutrals/brand/accents, typo families/scale/line-heights/tracking/weights, radius, shadow, space, gradient & ring)
- `02_design-system/scripts/export.js` — ~90 lignes Node ESM, zéro dépendance. Lit `tokens.json`, rend `@font-face` + `:root { --token: value }`, réécrit le bloc entre marqueurs dans `colors_and_type.css`, pousse une copie identique vers `03_mvp/public/assets/colors_and_type.css`
- `02_design-system/package.json` — scripts `ds:export`, `type: "module"`, zéro dépendance
- Patch `02_design-system/colors_and_type.css` — marqueurs `/* === GENERATED FROM tokens.json === */` + `/* === END GENERATED === */` ajoutés, section "Semantic type roles" en queue (hand-written, consomme les tokens) annotée
- Patch `00_BOUSSOLE/GOUVERNANCE.md` — nouvelle sous-section **"Chemin type d'un changement de token (7 étapes)"** sous §Synchronisation + nouvelle section **"Maintien des livrables : continu + audit trimestriel"** avec table 5 lignes (drafts, ONBOARDING-DEV, RUNBOOK-OPS, openapi.yaml, tokens.json+CSS) + sous-section **"Calendrier trimestriel figé"** (Q2 24/07/2026, Q3 24/10, Q4 24/01/2027, Q1 24/04/2027, 3 issues par date, label `type/audit-trimestriel`, délai 10 jours ouvrés)
- Patch `04_docs/07-design-system.md` §2.3 — blockquote "Source canonique des tokens = `02_design-system/tokens.json`, `colors_and_type.css` est en partie généré"

**Non produit en S7, parqué** :
- Pre-commit hook Husky — Issue GitHub `infra/ds-export-pre-commit-hook` à ouvrir manuellement (scope MVP, P2, exécution Sprint 3 v0.5 quand la stack Husky + tests arrive)
- Style Dictionary — à reconsidérer en V2+ si on passe multi-plateformes (Mac, iOS)
- Export automatique Claude Design → tokens.json — **plafond structurel** assumé (Claude Design n'a pas d'API, étape manuelle reste)
- GitHub Action auto-commit CSS — reconsidérer V1+ quand on dépasse le local mono-poste Windows
- Auto-création des 3 issues trimestrielles — v0.5 via Service Windows tâche planifiée (cf. SPEC-FUSION §7) ; d'ici là tâche manuelle agenda CEO aux 4 dates figées

**À reprendre en aval** : S8 (validation que `npm run ds:export` régénère `colors_and_type.css` sans régression visuelle — diff pré/post première exécution doit être minimal ou vide ; audit cohérence tokens ↔ preview ↔ 03_mvp ; vérif que la section hand-written "Semantic type roles" est bien préservée par le script).

### S8 — Validation globale & clôture
*Statut : ✅ close 2026-04-24*

**Décision** : bundle reco — **A partout**. S8 = validations actionnables maintenant (Q1 A) + patch des 2 contradictions résiduelles détectées (Q2 A) + 1 entrée CHANGELOG atelier (Q3 A) + archivage in-place (Q4 A) + kit de reprise unique `POST-ATELIER-ACTIONS.md` (Q5 A).

**Audit croisé S1→S7** — 2 contradictions factuelles détectées puis patchées :
- C-R1 : `SPEC-FONCTIONNELLE-FUSION.md` §9 ligne 468 "4-6 sem de fusion" → patché "10 sem, voir 08-roadmap.md §3.2".
- C-R2 : `SPEC-FONCTIONNELLE-FUSION.md` §10 lignes 480-484 "4 vagues × 2 sem" → patché "6 sprints sur 10 sem, voir SPEC-TECHNIQUE-FUSION §13".

Aucune autre contradiction factuelle détectée sur les cross-refs `06-architecture.md`, ADRs entre elles, footers, et SPEC-TECHNIQUE vs SPEC-FONCTIONNELLE au-delà des 2 lignes ci-dessus.

**Livrables produits** :
- Patch `04_docs/SPEC-FONCTIONNELLE-FUSION.md` §9 (ligne 468 — "4-6 sem" → "10 sem" + renvoi 08-roadmap) et §10 (§4 reformulé en "6 sprints sur 10 sem" avec vagues indicatives + renvoi SPEC-TECHNIQUE-FUSION §13 + mention équipe 2,6 ETP / 110 k€)
- Patch `00_BOUSSOLE/CHANGELOG.md` `[Non publié]` — nouvelle sous-section **"Atelier de cohérence 2026-04 — clos le 2026-04-24"** : 11 ADRs, ~45 livrables, 3 coûts cachés résolus, pointeur vers JOURNAL + POST-ATELIER-ACTIONS.md
- `04_docs/_atelier-2026-04-coherence/POST-ATELIER-ACTIONS.md` — check-list mécanique 6 sections (validations techniques ds:export + 00-README, 8 issues GitHub backlog atelier + label `type/audit-trimestriel` à créer, calendrier trimestriel Q2→Q1 2027 avec dates limites +10j ouvrés, 2 sprints post-atelier 05/05 + 12/05, critères clôture CADRE §7 à jour, règle suivi)
- Clôture S8 dans ce JOURNAL
- Marqueur clôture atelier (ligne finale ci-dessous)

**Non produit, parqué** :
- Premier run `npm run ds:export` — bash indisponible en session S8. Item §1.1 de `POST-ATELIER-ACTIONS.md` (prochaine session Cowork avec shell).
- Rendu visuel previews + rendu markdown GitHub `00-README.md` — navigateur indisponible. Item §1.2 POST-ATELIER-ACTIONS.
- Production des 5 livrables externes (sprint 05/05→11/05 plan audit) + openapi.yaml (sprint 12/05→18/05) — hors atelier. Item §4 POST-ATELIER-ACTIONS.
- Envoi test d'un livrable externe à un CEO pair ETIC — critère de clôture CADRE §7 dernier item, post-production.

**À reprendre en aval** : plus de session atelier. Les validations restantes sont traitées en maintenance par l'audit trimestriel Q2 (ouverture 24/07/2026), pattern S3+S6+S7 mutualisé dans `GOUVERNANCE.md`.

---

## 2026-04-24 — Clôture de l'atelier

Atelier de cohérence aiCEO **clos le 2026-04-24**. 8 sessions, 8 ADRs atelier (+ 4 pré-atelier datées même jour = 12 ADRs 24/04 au total), ~45 livrables, 2 contradictions statiques résiduelles patchées en S8. 7 dissonances critiques de `AUDIT-COHERENCE-2026-04-24.md` traitées ou parquées explicitement.

**Dossier conservé in-place** comme trace vivante. ADRs référencent des sessions, SPEC-FUSION cite les sessions, le dossier reste consultable. Reconsidérer archivage physique (déplacement `_archive/`) dans 3 mois si consultation tombe à 0.

**Suite** : exécution de la check-list `POST-ATELIER-ACTIONS.md` et reprise du plan produit normal (sprint S2 plan audit 05/05, sprint fusion v0.5 à partir du 05/05 équipe 2 fullstack).

---

## Légende statut
- 🔬 ouverte — session en cours
- ✅ close — décision prise et livrable produit
- ⏸️ en attente — pas encore ouverte
- 🔁 re-ouverte — révision exceptionnelle
