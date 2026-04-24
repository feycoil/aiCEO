# Audit de cohérence — aiCEO

**Date** : 24 avril 2026
**Portée** : tout `C:\_workarea_local\aiCEO\` (00_BOUSSOLE, 01_app-web, 02_design-system, 03_mvp, 04_docs, 05_journeys, 06_revues, `_archive/`, `_drafts/`, `_scratch/`)
**Mandat** : analyse sans concession sur 4 axes — fond, forme, complétude par audience, consistance produit — avec recommandations priorisées.

---

## TL;DR — verdict en trois lignes

Le repo tient, la pensée est claire, le MVP tourne — mais **le produit existe aujourd'hui à trois endroits qui ne se parlent plus tout à fait** : la vision stratégique (04_docs), la spec de fusion (SPEC-FUSION) et le code livré (03_mvp + 01_app-web). Trois narratifs cohérents en isolation, qui divergent dès qu'on les superpose (timing v0.5, budget MVP, typographie, périmètre délégation, positionnement benchmark). Côté audience, c'est un **silo interne de qualité (CEO/PMO/Designer ≥ 80 %) mais zéro chose à montrer dehors** (Client 0 %, Partenaire 0 %, Investisseur 40 %) — aiCEO est prêt à être *utilisé*, pas à être *présenté*.

---

## 1. Les 7 dissonances critiques (à traiter d'abord)

### C1. Trois narratifs concurrents sur le même produit

| Narratif | Source de vérité | Ce qu'il dit |
|---|---|---|
| **Vision** | `04_docs/01-vision.md`, `04_docs/04-positionnement.md` | aiCEO = copilote cloud SaaS multi-CEO ETIC, coach stratégique, horizon 2027 |
| **Plan** | `04_docs/08-roadmap.md` (v2.0), `00_BOUSSOLE/ROADMAP.md` | 4 milestones MVP→V1→V2→V3, budgets 132 k€ / 290 k€ / 693 k€ / 598 k€ |
| **Spec fusion** | `04_docs/SPEC-FONCTIONNELLE-FUSION.md`, `SPEC-TECHNIQUE-FUSION.md` | App Node locale Windows mono-poste, SQLite, Service Windows, 10 sprints |
| **Code livré** | `03_mvp/`, `01_app-web/` | Node + Express + vanilla JS + JSON + localStorage, mode démo, proxy corp |

**Le problème** : chaque narratif est cohérent avec lui-même mais contredit les autres sur des éléments qui importent :

- **Timing v0.5** : `08-roadmap.md` dit 6 semaines, `SPEC-TECHNIQUE-FUSION §13` dit 10–12 semaines (10 sprints de 1 sem).
- **Budget MVP** : `08-roadmap.md` v2.0 dit 132 k€ cumulés ; ré-estimation intégrant la fusion tombe à ~285 k€.
- **Positionnement produit** : `04-positionnement.md` place aiCEO face à des cloud SaaS (Lattice, Motion, Superhuman) ; la décision fusion en fait une **app locale Windows**. Le benchmark n'est plus pertinent.
- **Périmètre délégation** : `01-vision.md` promet la délégation comme signature MVP ; `SPEC-FONCTIONNELLE-FUSION §4` la dégrade en "brouillon mailto:" pour MVP et repousse l'end-to-end en V2.
- **Rituel dimanche** : promis en MVP par la vision, repoussé en V1 par la roadmap v2.0.

**Impact** : quiconque lit plus d'un document en ressort avec une image contradictoire. Cela inclut Claude lui-même en cowork sessions successives.

### C2. Typographie — trois sources, aucune autorité

- `02_design-system/tokens/typography.json` → **Fira Sans** (10 poids) + Aubrielle_Demo + Sol Thin.
- `02_design-system/assets/app.css` + `01_app-web/product.app.css` → **Inter** via CDN Google Fonts.
- `04_docs/07-design-system.md` → mentionne **Cambria / Calibri** (reliquat d'une itération antérieure).

Trois sources. Aucune n'est marquée "canonique". `REPO-CONTEXT.md` documente le conflit mais ne le tranche pas. C'est le conflit le plus visible dans le repo et il est ouvert depuis plusieurs jalons.

### C3. `06-architecture.md` vs `SPEC-TECHNIQUE-FUSION.md` — qui gagne ?

Les deux documents décrivent la même architecture cible v0.5–V1. La refonte du 24/04 a aligné `06-architecture.md` v2.0, mais :

- `06-architecture.md` est l'index architecture (large, trajectoire v0.4→V3).
- `SPEC-TECHNIQUE-FUSION.md` est la spec opérationnelle fusion (profondeur, sprints, schéma SQL complet).

Aucun des deux n'indique explicitement : *"pour la fusion v0.5, la source de vérité est `SPEC-TECHNIQUE-FUSION.md`, `06-architecture` reste la carte large"*. Résultat : le prochain développeur qui modifie l'un oubliera l'autre.

### C4. Zero livrable pour audience externe

Score complétude par audience :

| Audience | Score | Manque critique |
|---|---|---|
| CEO (Feycoil) | 80 % | pas de tableau de bord décisionnel synthétique |
| PMO | 90 % | OK (roadmap + backlog GitHub + revues) |
| CTO / dev | 70 % | pas d'onboarding dev, pas d'OpenAPI, pas de runbook ops |
| Designer | 95 % | OK (DS, UI kits, REPO-CONTEXT) |
| **Client potentiel** | **0 %** | aucun one-pager, aucune landing, aucune démo partageable |
| **Investisseur** | **40 %** | pas de business plan, pas de pitch deck, pas de KPIs commerciaux |
| **Partenaire ETIC / CEO pair** | **0 %** | aucun kit "comment l'installer chez un autre CEO ETIC" |

Le produit est conçu pour l'écosystème ETIC (multi-CEO en V3) mais aucun livrable n'est exportable vers un CEO pair aujourd'hui, ni même vers un DG / AE qui devrait l'utiliser en V2.

### C5. ADR manquantes sur trois décisions structurantes

`DECISIONS.md` couvre la fusion et la migration backlog GitHub. Il ne couvre pas :

- **F17 — bascule SolidJS** (évoquée en V1, "research muted" dans 08-roadmap, pas de note écrite).
- **Graph API OAuth vs PowerShell COM** (basculement prévu V1, aucune ADR, juste des mentions éparses dans SPEC-TECHNIQUE §9).
- **Typographie** (voir C2 — aucune décision formelle n'a tranché).

Ces trois décisions seront prises dans les 3 mois. Sans ADR, elles seront prises *implicitement* en codant, et le "pourquoi" sera perdu.

### C6. Dossiers orphelins sans mandat clair

- `05_journeys/` — un seul fichier, statut flou, pas référencé par `04_docs/00-README.md` ni par la BOUSSOLE.
- `06_revues/` — existe, pas d'indice sur la cadence, le template, ou qui les lit.
- `_drafts/` — deux fichiers restants après archivage backlog, pas de règle sur "quand un draft bascule en doc officiel".

Soit on leur donne un rôle, soit on les archive. Laisser des dossiers "peut-être" dans un repo de gouvernance ronge la crédibilité du reste.

### C7. Benchmark positionnement obsolète

`04_docs/04-positionnement.md` compare aiCEO à Lattice, Motion, Superhuman, Clara Labs, Read.ai. Tous sont cloud SaaS B2B, prix ~10–30 $/mois/utilisateur.

Post-fusion, aiCEO v0.5 est une **app Node locale Windows mono-poste**, déployée comme Service Windows, avec un coût opérationnel de **~1,5 cent/jour en tokens** et **0 € d'infra cloud**. Le marché de référence n'est plus le SaaS productivité — c'est plutôt Copilot for Business, Rewind, Motion-desktop, voire les plugins Outlook. Le document n'a pas été mis à jour.

---

## 2. Analyse par axe

### 2.1 Fond — la thèse tient-elle ?

**Ce qui tient** : la thèse centrale (un CEO multi-sociétés en surcharge cognitive a besoin d'un copilote qui arbitre / délègue / reporte avec mémoire) est stable sur 6 documents : vision, persona, pain points, KPI, ADRs fusion, journey matin. Le trio arbitrage-délégation-reprise est une vraie réponse à un vrai problème, documentée avec des chiffres réels (28/28 tâches, 926 mails, ≈1 ct/arbitrage).

**Ce qui craque** :

1. La promesse produit a glissé **sans mise à jour amont**. Le MVP livré est un assistant local, pas le copilote conversationnel du `01-vision.md`. Il faut soit rapatrier la vision sur la réalité locale-first, soit expliciter que V1/V2 dé-localisent le produit vers le cloud — et assumer la conséquence : aujourd'hui aiCEO promet deux choses différentes selon quel doc on lit en premier.
2. Le **scope MVP** a été redéfini deux fois (cockpit + 13 pages → 3 colonnes → fusion 13 pages) mais aucun document ne liste explicitement "ce qui a été coupé du MVP et repoussé où". Un lecteur qui a vu la v1 de la vision se demandera où sont passés : rituel dimanche, délégation end-to-end, coach stoïque, multi-utilisateur. La réponse existe (dans `SPEC-FONCTIONNELLE-FUSION §8`) mais elle est noyée.
3. Le **modèle économique** est absent de la roadmap. Les budgets (132 k€ + 290 k€ + 693 k€ + 598 k€ = ~1,7 M€ sur 18 mois) n'ont aucune contrepartie revenue. En V3 il y a "multi-CEO écosystème ETIC" — 2 à 3 CEO. À quel prix ? Facturé comment ? C'est un angle mort structurel.

### 2.2 Forme — la structure tient-elle ?

**Ce qui tient** :

- Arborescence propre, séparation `00_BOUSSOLE` (règles) / `04_docs` (produit) / silos techniques.
- `04_docs/00-README.md` est un vrai index avec chemins de lecture par audience.
- ADR pattern dans `DECISIONS.md` correctement appliqué pour les 3 dernières décisions.
- CHANGELOG à jour, format Keep-a-Changelog respecté.
- Aucun lien cassé détecté dans les documents principaux.

**Ce qui craque** :

1. **Numérotation `04_docs/`** : 01, 02, 03, 04, 05, 06, 07, 08, 10, 11 — le 09 a sauté (ancien `09-backlog.xlsx` archivé) mais le saut n'est pas comblé ni expliqué. Trivial mais visible.
2. **Co-existence `06-architecture.md` + `SPEC-TECHNIQUE-FUSION.md`** sans hiérarchie explicite (voir C3).
3. **`02_design-system/README.md` vs `REPO-CONTEXT.md`** — deux docs de cadrage design, pas de séparation claire de rôle.
4. **Dossiers `05_journeys/`, `06_revues/`, `_drafts/`** — rôle flou (voir C6).
5. **Spec fusion hors-index** : `SPEC-FONCTIONNELLE-FUSION.md` et `SPEC-TECHNIQUE-FUSION.md` ne sont pas listés dans `04_docs/00-README.md`. Ce sont pourtant les documents les plus stratégiques du moment.

### 2.3 Complétude par audience

Voir tableau en C4. En creux : **aiCEO est documenté pour être construit, pas pour être partagé**. C'est cohérent avec son stade (préproduction interne) mais ça devient bloquant dès qu'on veut :

- recruter un dev : pas d'onboarding, pas d'OpenAPI, pas de schéma SQL accessible hors `SPEC-TECHNIQUE` § 5 (brut).
- pitcher un investisseur : pas de one-pager, pas de deck, pas de business plan.
- tester chez un CEO pair ETIC : pas de guide install, pas de tuto import Outlook, pas de "premier jour avec aiCEO".
- démontrer à un client : pas de landing, pas de vidéo, pas de démo sans clé API personnelle.

### 2.4 Consistance — UN produit ou une multitude ?

**Réponse courte** : conceptuellement UN produit, physiquement **deux projets convergents** (app-web Twisty + MVP Node) avec une fusion planifiée mais pas exécutée, plus **trois espaces de maquettage** Claude Design (Design System / aiCEO v1 / aiCEO_mvp_v1) sans pipeline automatique vers le code.

**Les 3 silos Claude Design ↔ Cowork ↔ GitHub** sont documentés dans `GOUVERNANCE.md` comme règle assumée, mais le coût opérationnel de cette règle n'est pas chiffré : chaque changement de token passe par un copier-coller manuel. À l'échelle V1 (Inngest + sub-agents), ce n'est pas tenable.

---

## 3. Recommandations priorisées

### P0 — à faire cette semaine (bloque le reste)

1. **Rédiger 3 ADR courtes** dans `DECISIONS.md` (une journée) :
   - ADR "Trajectoire produit local-first → cloud V1" : assume que v0.4/v0.5 est local Windows, V1 rebascule cloud. Conséquences sur positionnement, pricing, sécurité.
   - ADR "Typographie : Fira Sans canonique" : tranche Fira Sans partout, programme la purge d'Inter dans les CSS et la mise à jour de `07-design-system.md`. Ouvre une Issue GitHub `lane/design-system` avec périmètre chiffré.
   - ADR "Sources de vérité documentaires" : déclare **`SPEC-TECHNIQUE-FUSION.md` canonique pour la fusion**, `06-architecture.md` carte large, `08-roadmap.md` canonique pour le plan, `DECISIONS.md` canonique pour le "pourquoi".

2. **Patcher 3 documents pour cohérence** (deux heures) :
   - `01-vision.md` : ajouter en tête un bloc "État 24/04/2026 — ce que le MVP livre aujourd'hui vs la vision horizon 2027", avec pointeurs explicites vers SPEC-FUSION pour le périmètre réel.
   - `04-positionnement.md` : mettre à jour le benchmark (cloud SaaS → productivité desktop/Copilot) ou marquer le doc "obsolète — refonte prévue post-v0.5".
   - `04_docs/00-README.md` : ajouter les 2 SPEC-FUSION à l'index + corriger le saut de numérotation (soit on renumérote 10→09, 11→10, soit on comble 09 par un redirect-stub expliquant l'archivage).

3. **Réconcilier timing et budget v0.5** (deux heures) :
   - Soit `08-roadmap.md` passe à 10–12 semaines (aligné SPEC-TECHNIQUE §13), soit SPEC-TECHNIQUE compresse à 6 semaines avec justification du ré-estimé.
   - Même exercice pour budget MVP : valider 132 k€ ou 285 k€ ou un chiffre intermédiaire, documenter les hypothèses dans `08-roadmap.md` § 7.

### P1 — à faire sous 2 semaines

4. **Créer le livrable Investisseur / ETIC pair** (deux à trois jours) :
   - Un `04_docs/PITCH-ONEPAGE.md` : problème, solution, preuve MVP v0.4, trajectoire, appel à l'action. 1 page, exportable PDF.
   - Un `04_docs/BUSINESS-CASE.md` : hypothèses revenue (écosystème ETIC, 2-3 CEO pairs, pricing interne vs externe), coût cumulé 18 mois, point mort, ROI pour le CEO utilisateur (gain de temps chiffré).
   - Un `04_docs/ONBOARDING-CEO-PAIR.md` : "comment installer aiCEO chez un autre CEO ETIC" — prérequis, install Service Windows, import Outlook, premier arbitrage.

5. **Créer le livrable Dev** (deux jours) :
   - `04_docs/ONBOARDING-DEV.md` : clone repo, stack locale, commandes, points d'entrée, conventions.
   - Un OpenAPI 3.0 généré (ou écrit à la main) à partir des endpoints `SPEC-TECHNIQUE §6` — sert de contrat pour chat assistant V1+ et pour tout intégrateur futur.
   - `04_docs/RUNBOOK-OPS.md` : que faire si l'import Outlook échoue, si la clé Anthropic expire, si Service Windows ne démarre pas.

6. **Trancher les dossiers orphelins** (une heure) :
   - `05_journeys/` → soit migrer dans `04_docs/05-user-journeys.md`, soit archiver.
   - `06_revues/` → ajouter un README court (cadence hebdo dimanche, template, qui relit), ou archiver.
   - `_drafts/` → règle dans GOUVERNANCE : "un draft vit 4 semaines max, sinon archive ou promotion".

### P2 — à faire avant de clôturer v0.5

7. **Unifier le DS et le code** :
   - Script `02_design-system/export-to-css.{js,ps1}` qui génère `app.css` depuis les tokens JSON. Tue le conflit Inter/Fira à la racine.
   - Plug ce script dans CI GitHub Actions.

8. **Pipeline Claude Design ↔ Cowork ↔ GitHub** :
   - Même si les 3 silos restent logiquement séparés, documenter dans `GOUVERNANCE.md` **le chemin type d'un changement** (ex : "token color modifié → PR Design System → validation CEO → export CSS → PR MVP → close Issue GitHub"). Sans ce chemin, chaque changement coûte 1h de coordination humaine.

9. **Killer ou parquer F17 (SolidJS)** :
   - Décider officiellement : reste en vanilla pour tout V1, ou SolidJS au moment où une page dépasse 500 lignes de JS. Dans les deux cas, ADR courte, Issue GitHub mise à jour.

### P3 — horizon V1 (3-6 mois)

10. **Modèle économique écrit** : avant d'engager 290 k€ en V1, avoir un document qui dit "aiCEO vaut X € pour qui, est-ce qu'ETIC paie, est-ce qu'on vend à l'extérieur, à combien, via quel canal". Pas d'obligation d'avoir la réponse — obligation d'avoir le document qui pose les questions.

11. **Kit démo partageable** : landing web + vidéo 3 min + démo sandbox (mode démo sans clé API amplifié) déployable en public. Sert pour investisseur, CEO pair, recrutement.

12. **Observabilité produit** : avant d'industrialiser V1 sub-agents, connecter Langfuse et poser 3 KPIs mesurables (latence arbitrage, taux d'acceptation des classifications, coût par utilisateur-jour). Sans métriques on ne peut ni arbitrer F17, ni valider F42.

---

## 4. Plan d'action proposé — 4 semaines

| Semaine | Livrables | Sortie attendue |
|---|---|---|
| **S1 (28/04 → 04/05)** | 3 ADR (P0-1) + 3 patchs docs (P0-2) + réconciliation timing/budget (P0-3) | Repo cohérent sur un seul narratif |
| **S2 (05/05 → 11/05)** | PITCH-ONEPAGE + BUSINESS-CASE + ONBOARDING-CEO-PAIR (P1-4) | 3 livrables partageables vers externe |
| **S3 (12/05 → 18/05)** | ONBOARDING-DEV + OpenAPI + RUNBOOK-OPS (P1-5) + orphelins tranchés (P1-6) | Repo prêt à accueillir un dev externe |
| **S4 (19/05 → 25/05)** | Script export tokens → CSS (P2-7) + chemin type 3 silos (P2-8) + décision F17 (P2-9) | Fusion v0.5 démarrable sans dette structurelle |

---

## 5. Ce qu'il faut accepter

Trois points durs que cet audit ne résout pas et qui reviendront :

1. **Claude Design n'a pas d'API** — tant que les tokens et les maquettes vivent dans Claude Design sans export, la boucle DS → code restera manuelle. C'est un plafond structurel, pas un bug.
2. **Local-first Windows est un cul-de-sac à moyen terme** — à V2 (multi-tenant), l'app doit redevenir cloud. Le travail v0.5 sur `node-windows`, Service Windows, COM, `better-sqlite3` sera largement jeté. C'est assumé, mais le coût de cette trajectoire "v0.5 pont jetable" mérite d'être écrit quelque part.
3. **Le CEO est à la fois utilisateur, client, PMO et investisseur** — c'est une boucle courte qui accélère le MVP, mais à V2/V3 elle devient un risque de biais. Le premier vrai test externe (CEO pair ETIC) est l'événement le plus important de la trajectoire post-v0.5, plus important que toute feature V1.

---

## 6. En une phrase

**aiCEO a la substance d'un produit, la forme d'un atelier personnel, et il lui manque trois semaines de travail documentaire pour tenir à la fois la route technique, la route stratégique et la première conversation externe.**

---

*Audit produit le 24/04/2026. Revue proposée à S+4 (22/05/2026) pour vérifier exécution P0+P1.*
