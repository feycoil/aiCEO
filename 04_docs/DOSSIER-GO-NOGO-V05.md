---
title: aiCEO v0.5 — Dossier de décision GO/NO-GO 110 k€
audience: ExCom ETIC Services (interne)
version: v1.0 — projet de décision
date: 2026-04-25
butoir: 2026-05-05
auteur: Major Fey (CEO ETIC Services)
status: à valider ExCom — décision attendue avant 5 mai 2026
---

# aiCEO v0.5 — Dossier de décision GO/NO-GO 110 k€

## 0 · Synthèse exécutive

**Demande de décision** : engager 110 k€ sur 10 semaines (mai → 14 juillet 2026) pour livrer la phase **v0.5 fusion app-web ↔ MVP** d'aiCEO.

**Verdict recommandé** : **GO** au tarif catalogue 110 k€, démarrage sprint 1 le **lundi 5 mai 2026**, scellement v0.5 et tag `v0.5` le **mardi 14 juillet 2026** (rebasé sur le calendrier réel des semaines ouvrées).

**Pourquoi maintenant** : la v0.4 a démontré la valeur du copilote (28/28 tâches arbitrées en 41 s, ≈ 1 ct/jour LLM). Sans v0.5, le produit reste prisonnier d'une architecture à deux têtes (app-web `localStorage` + MVP JSON files) qui bloque toute extension multi-CEO future. La fusion est le pré-requis structurel à V1 (T3 2026) puis V2 (T1 2027). Repousser de 3 mois coûterait ≈ 18-25 k€ de dette technique en V1.

**Conséquence d'un GO** : 110 k€ engagés, équipe 2,6 ETP recrutée d'ici fin avril, tag `v0.5` mi-juillet 2026, jalon go/no-go V1 (290 k€) déclenché en T3 2026 sur la base de 9 critères de scellement objectifs.

**Conséquence d'un NO-GO** : déstabilisation du dogfood Major Fey sur 6-12 semaines, dette technique app-web ↔ MVP qui s'aggrave, fenêtre marché LLM-mature 2026 perdue. Trois plans contingence détaillés en §6.

**Audience de ce dossier** : ExCom ETIC Services en interne. Les éléments commerciaux externes (CEO pair, investisseur business angel) sont traités séparément dans `BUSINESS-CASE.md` et `PITCH-DECK-INVESTISSEUR.pptx` (branches `docs/business-case` et `docs/pitch-deck`).

> **Lecture rapide** : §0 décision · §1 périmètre · §2 plan financier · §3 critères go/no-go · §4 gouvernance · §5 risques · §6 plan contingence · §7 sprint 1 ready-to-fire · §8 annexes.

---

## 1 · Périmètre v0.5 et plan d'exécution

### 1.1 — Quoi : fusion en produit unifié

La v0.5 absorbe l'app-web Twisty (13 pages cockpit, vanilla JS + `localStorage`) dans le MVP Node Express + Claude API + JSON. Cible : **un seul produit, un seul stack, un seul flux de données**, hébergé localement sur le PC du CEO via Service Windows.

Les 21 pages aujourd'hui dispersées sur deux projets sont consolidées en **13 pages cibles** dans `03_mvp/public/` :

| Famille | Pages |
|---|---|
| Cockpit / rituels | `index.html`, `arbitrage.html`, `evening.html` |
| Tâches / agenda | `taches.html`, `agenda.html` |
| Revues | `revues.html` |
| Registres | `contacts.html`, `decisions.html` |
| Sociétés / projets | `groupes.html`, `projets.html`, `projet/:id.html` (template commun) |
| Copilote | `assistant.html` (WebSocket live) |

Le `localStorage` est remplacé par **SQLite via `better-sqlite3`** (13 tables), un schéma conçu pour migrer 1:1 vers Postgres en V1. Le serveur Node sert toutes les pages, expose 40+ endpoints REST, et tourne en service Windows démarrage auto.

### 1.2 — Comment : 6 sprints sur 10 semaines

| # | Dates | Durée | Contenu | Livrable |
|---|---|---:|---|---|
| 1 | 05/05 → 18/05 | 2 sem | Schéma SQLite + migrations + API tasks/decisions/contacts/projects/groups + `migrate-from-appweb.js` | Backend stable |
| 2 | 19/05 → 01/06 | 2 sem | Cockpit unifié + arbitrage.html + evening.html sur API | Flux matin + soir |
| 3 | 02/06 → 15/06 | 2 sem | Tâches + agenda + revues migrées, retrait `localStorage` | 3 pages business |
| 4 | 16/06 → 29/06 | 2 sem | Groupes + projets + template + contacts + décisions + assistant chat live (WebSocket) | Portefeuille complet |
| 5 | 30/06 → 06/07 | 1 sem | Service Windows + raccourci desktop + tests Playwright 3 flux + CI GitHub Actions verte | Durcissement technique |
| 6 | 07/07 → 14/07 | 1 sem | Tag `v0.5` + release notes internes + rétro sprint + ajustement rituels Feycoil | Scellement |

**Réf** : `04_docs/SPEC-TECHNIQUE-FUSION.md` §13 (sprints) et §6 (API), `04_docs/SPEC-FONCTIONNELLE-FUSION.md` (parcours utilisateur).

### 1.3 — Qui : équipe 2,6 ETP

- **2 fullstack dev** (Node 20 + vanilla JS + SQL, montée `better-sqlite3`) — recrutement en cours, onboarding ciblé J+5 du sprint 1.
- **0,3 product designer** (maintenance DS Twisty sur pages migrées, pas de création).
- **0,3 PMO** (coordination sprints, GitHub Issues, jalons go/no-go) — porté par Major Fey.
- **Major Fey** en dogfood quotidien (matin + soir sur v0.5 dès sprint 2), **non budgété** (charge interne ETIC).

### 1.4 — Hors périmètre v0.5 (refs explicites)

Les éléments suivants sont **explicitement reportés à V1 ou plus tard** :
- Postgres + Supabase RLS multi-tenant → **V1 (T3-T4 2026)**.
- Graph API OAuth `msal-node` → **V1**.
- Inngest (durable execution) + pgvector + Langfuse → **V1**.
- Sub-agents spécialisés (mail, calendar, deleg, meeting-prep) → **V1**.
- SOC 2 Type II + ouverture CEO pair externe → **V2 (T1-T2 2027)**.
- Coach conversationnel Opus + PWA mobile → **V3 (T3-T4 2027)**.

Cette frontière est ferme. Toute pression pour avancer un élément V1 dans v0.5 doit faire l'objet d'un ADR explicite et d'une renégociation de l'enveloppe.

---

## 2 · Plan financier résumé

### 2.1 — Ventilation 110 k€

| Poste | Hypothèse | Montant | % |
|---|---|---:|---:|
| Dev fullstack (2 ETP) | 10 sem × 2 × 900 €/j × 4,5 j | 81,0 k€ | 73,6 % |
| Designer DS (0,3 ETP) | 10 sem × 0,3 × 900 €/j × 4,5 j | 12,2 k€ | 11,1 % |
| PMO (0,3 ETP) | 10 sem × 0,3 × 900 €/j × 4,5 j | 12,2 k€ | 11,0 % |
| **Sous-total dev** | | **105,3 k€** | **95,7 %** |
| Infra LLM Claude Sonnet 4.5 | 1 ct/jour × ~70 j × 1 user | 0,1 k€ | 0,1 % |
| CI GitHub Actions | Pro 2000 min/mois inclus | 0 k€ | 0 % |
| Provision domaine + doc statique | 5 k€/an au prorata | 0,9 k€ | 0,8 % |
| Provision risque (scope creep, dépassement 5 %) | 15 % × 105 k€ | 3,7 k€ | 3,4 % |
| **Total v0.5** | | **≈ 110,0 k€** | **100 %** |

**Détail mensuel et trésorerie 12 mois** : voir `POA-V05.xlsx` (onglets `1-Ventilation`, `2-Trésorerie`, `3-Sensibilité`).

### 2.2 — Trésorerie mai 2026 → avril 2027

Décaissement v0.5 concentré sur **mai-juin-juillet 2026** (paiement freelances mensuel à terme échu) :
- Mai 2026 : ~33 k€ (sprint 1-2 partiel)
- Juin 2026 : ~44 k€ (sprint 2-3-4 partiel)
- Juillet 2026 : ~33 k€ (sprint 5-6 + scellement)

À partir d'août 2026, si le go V1 est prononcé, le rythme passe à ~70 k€/mois (4 mois × 70 k€ ≈ 290 k€ V1). Le pic trésorerie cumulé à 12 mois (avr 2027) atteint ≈ 400 k€ avant l'éventuel financement V2.

**Source de financement v0.5** : fonds propres ETIC Services. Pas de tour externe nécessaire avant V2 (T1 2027). Confirmation trésorerie disponible à valider avec le DAF avant signature des contrats freelance.

### 2.3 — Sensibilité (best / base / worst)

| Scénario | Hypothèse principale | Coût total | Écart |
|---|---|---:|---:|
| **Best** | Sprints 5-6 réduits à 1,5 sem cumulé (release rapide) | 95 k€ | −14 % |
| **Base** | Plan nominal 6 sprints | 110 k€ | — |
| **Worst** | +2 sem rattrapage Sprint 4 (assistant chat) + 1 sem incident prod | 134 k€ | +22 % |

La provision risque 15 % couvre le scénario *base + 1 incident*, pas le scénario *worst* complet. Au-delà de 120 k€ engagés, un point ExCom de mi-parcours (semaine du 8 juin) est déclenché automatiquement.

---

## 3 · Critères GO / NO-GO

### 3.1 — Critères GO (5 conditions cumulatives)

Le GO 110 k€ est **prononcé si et seulement si** :

1. **Trésorerie** : ETIC Services confirme la disponibilité ≥ 110 k€ sur la période mai-juillet 2026 (validation DAF avant 30/04).
2. **Équipe sourcée** : 2 dev fullstack identifiés et engagés sur les 10 semaines, contrats freelance signés avant 02/05. À défaut, sprint 1 reporté en glissement maîtrisé jusqu'à 19/05 max (perte ≈ 11 k€).
3. **Périmètre figé** : la liste des 13 pages cibles + 40+ endpoints API est validée sans amendement par l'ExCom (pas d'ajout en cours de route sans ADR).
4. **Hypothèse stratégique partagée** : ExCom souscrit à la lecture "v0.5 = pont jetable nécessaire vers V1 cloud" et accepte que ~30 % du code v0.5 (adapters PowerShell COM, Service Windows) soit jetable en V1 (mitigation §5.1).
5. **Critères de scellement v0.5 acceptés** : les 9 critères §3.3 sont reconnus comme la grille de validation du tag `v0.5` (pas de re-débat ad hoc en juillet).

### 3.2 — Critères NO-GO (1 seul suffit)

Le NO-GO est prononcé si **au moins l'un** des points suivants est vrai :

- (a) Trésorerie < 110 k€ disponible sur la période, sans solution de pont identifiée.
- (b) Aucun candidat dev fullstack identifié au 02/05 *et* le glissement à 19/05 n'est pas acceptable (raisons stratégiques ETIC).
- (c) ExCom estime que la fenêtre marché LLM-mature ne tient plus (changement majeur Anthropic, GPT-5 commodity, etc.) et exige un re-positionnement produit avant tout investissement dev.
- (d) Découverte d'un risque RGPD bloquant sur l'architecture v0.5 (improbable : architecture strictement locale, mais cas inclus pour exhaustivité).

### 3.3 — Critères de scellement v0.5 (validation du tag mi-juillet)

Repris de `04_docs/08-roadmap.md` §3.3 :

1. 13 pages cibles accessibles à `http://localhost:3001/*`.
2. Zéro `localStorage` applicatif (seuls paramètres UI légers tolérés).
3. Flux matin + flux soir stables 5/5 jours ouvrés sur 3 semaines consécutives.
4. Adoption matin ≥ 80 % / soir ≥ 70 % des jours ouvrés (tracking).
5. Migration sans perte (`check-migration.js` vert).
6. Service Windows opérationnel, redémarre après crash simulé.
7. Tests e2e Playwright verts (arbitrage, délégation, soir).
8. CI GitHub Actions verte (lint + unit + audit).
9. Zéro incident sécurité (fuite clé, prompt injection) sur la durée du sprint 6.

Le tag `v0.5` est le déclencheur du dossier go/no-go V1 (290 k€).

---

## 4 · Gouvernance de la décision

### 4.1 — Calendrier décision (10 jours)

| Date | Étape | Acteur | Output |
|---|---|---|---|
| 25/04 vendredi | Diffusion dossier ExCom | Major Fey | DOSSIER + POA + KICKOFF transmis |
| 28/04 lundi | Validation trésorerie | DAF | OK ≥ 110 k€ disponibles |
| 30/04 mercredi | Sourcing dev confirmé | Major Fey + RH | 2 candidats dev contractuels engagés |
| 04/05 lundi | Réunion ExCom décision | ExCom (n=4) | GO ou NO-GO formel |
| 05/05 mardi | (si GO) Sprint 1 démarrage | Équipe | Onboarding + kickoff |
| 05/05 mardi | (si NO-GO) Plan contingence | ExCom + Major Fey | Choix scénario §6 |

**Butoir absolu** : décision avant fin de journée **mardi 5 mai 2026**. Au-delà, le glissement détruit la fenêtre 10 semaines (livraison v0.5 décalée à fin juillet, conflit avec congés équipe).

### 4.2 — Forum de décision

- **Décideur principal** : ExCom ETIC (n=4) en réunion dédiée 04/05.
- **Décideur opérationnel** : Major Fey (CEO ETIC + CEO pilote aiCEO), porteur du projet.
- **Validations latérales** :
  - DAF ETIC : trésorerie + cohérence enveloppe annuelle.
  - DSI ETIC (consultatif) : validation architecture v0.5 (already aligned via SPEC-TECHNIQUE-FUSION).
  - Conseil ETIC (consultatif) : info simple, pas de droit de veto à ce niveau d'engagement.

### 4.3 — Format décision

Décision tracée dans `00_BOUSSOLE/DECISIONS.md` sous forme d'ADR daté `2026-05-04 · GO v0.5 (ou NO-GO)`. L'ADR documente : contexte, options étudiées, décision, conséquences, arbitrages dissidents éventuels.

---

## 5 · Risques consolidés top 5

### 5.1 — Pont jetable v0.5 (P0, accepté)

**Risque** : ~30 % du code v0.5 (adapters PowerShell Outlook COM, Service Windows, certaines vues localhost) sera ré-écrit en V1 cloud.

**Mitigation actée** :
- Schéma SQLite 13 tables conçu pour migrer 1:1 vers Postgres (cf. SPEC-TECHNIQUE §5).
- Couche d'abstraction `services/outlook.js` qui encapsule Outlook COM en v0.5, sera remplacée par `msal-node` Graph en V1 sans changer l'API agent.
- 70 % du code v0.5 est capitalisé : modèle de données, API REST, cockpit HTML/CSS/JS, prompts agent versionnés.

**Décision implicite** : ExCom accepte cette dette en échange de la livraison rapide v0.5 et du dogfood permanent CEO.

### 5.2 — Sourcing équipe sous tension (P0, mitigation active)

**Risque** : 2 fullstack senior Node + SQL en France à 900 €/j ne sont pas une commodity. Si pas trouvés au 02/05, glissement sprint 1 inévitable.

**Mitigation** :
- Sourcing déjà ouvert depuis 18/04 sur réseau ETIC + Twisty Agency.
- Plan B : un seul dev senior + un dev medium 600 €/j pour 0,2 k€ d'écart (-12 % capacité acceptable sur sprint 1-2 administrativement faciles).
- Plan C : décaler sprint 1 à 19/05 (perte 11 k€, mais sprint 6 décalé au 21/07 → conflit congés).

### 5.3 — Dépassement périmètre Sprint 4 (P1)

**Risque** : Sprint 4 (groupes + projets + assistant chat WebSocket) est le plus dense. Le chat live WebSocket est un point d'incertitude technique (jamais éprouvé sur stack v0.4).

**Mitigation** :
- Spike technique WebSocket prévu sprint 2 (3 j, à coût marginal nul).
- Plan B : `assistant.html` livré en mode polling AJAX (pas WebSocket) au sprint 4 si spike négatif. Bascule WebSocket parquée en post-V1.
- Provision 15 % couvre +2 sem au pire (cf. §2.3 worst).

### 5.4 — Dépendance Anthropic LLM unique (P1, V1)

**Risque** : v0.5 reste sur API Claude Sonnet 4.5 directe Anthropic. Coupure service ou × 5 pricing impactent immédiatement.

**Mitigation v0.5** : volume d'appels minimal (1 arbitrage/jour ≈ 0,30 €/mois LLM brut), donc impact financier limité même en cas de pricing × 5. Mitigation structurelle (Bedrock EU + LiteLLM) prévue en V1 (cf. BUSINESS-CASE §6.2).

### 5.5 — RGPD sur architecture locale (P2, hypothèse)

**Risque** : v0.5 expose la base mail Outlook complète d'un dirigeant à Claude. Anonymisation imparfaite côté prompt agent.

**Mitigation** :
- Architecture v0.5 strictement locale : **rien ne sort du PC du CEO** vers Claude au-delà du payload de l'arbitrage en cours (résumés mails, pas mails bruts).
- Audit RGPD complet déclenché en V2 multi-tenant (provision 8-15 k€ déjà fléchée dans BUSINESS-CASE §3.6).
- DPO ETIC informé du périmètre v0.5, pas d'objection actée à la date du dossier.

---

## 6 · Plan contingence (si NO-GO ou si GO différé)

### 6.1 — Scénario A : Différer 3 mois (NO-GO court)

**Déclencheur** : trésorerie indisponible immédiatement, mais accessible à T3 2026.

**Conséquences** :
- Sprint 1 démarre 04/08/2026 → tag v0.5 le 13/10/2026.
- Décalage cascade : V1 démarre T4 2026 → SOC 2 V2 mid-2027 (au lieu T1 2027).
- Pendant 3 mois : maintenance v0.4 en l'état (≈ 5 k€ provision interne ETIC pour bugfixes critiques + sécurité).
- Coût caché dette technique : ≈ 18-25 k€ (chaque semaine d'app-web ↔ MVP en parallèle ajoute ~2 k€ de dette).
- Risque marché : fenêtre LLM-mature 2026 partiellement perdue, GPT-5 et Gemini 3 deviennent commodity, repositionnement produit nécessaire.

### 6.2 — Scénario B : Périmètre réduit (NO-GO partiel, ~75 k€)

**Déclencheur** : trésorerie limitée à 70-80 k€, mais ExCom souhaite avancer.

**Périmètre réduit** :
- Sprints 1-3 + 5-6 conservés (8 semaines, fusion incomplète).
- Sprint 4 reporté en V1 (groupes + projets + assistant restent en app-web `localStorage`).
- Coût : ~75 k€.
- Conséquence : le produit reste à deux têtes sur 30 % du périmètre, dette technique non résorbée mais réduite.
- Critères de scellement v0.5 : 6/9 atteignables (4 indisponibles : groupes, projets, contacts, assistant).
- Décision V1 plus lourde car migration Postgres doit absorber 4 pages restantes en plus du multi-tenant.

### 6.3 — Scénario C : Abandon plateforme (NO-GO terminal)

**Déclencheur** : ExCom estime que la trajectoire 1,69 M€ sur 18 mois (BUSINESS-CASE §3) n'est plus stratégiquement souhaitable pour ETIC Services.

**Conséquences** :
- v0.4 maintenue en l'état comme outil interne Major Fey (run cost ≈ 5 k€/an, déjà absorbé).
- Dossier `aiCEO` archivé comme R&D produit, IP conservée pour réactivation ultérieure.
- Communication interne neutre (pas de comm externe : la v0.4 et le BUSINESS-CASE ne sont pas publics).
- Pas de coût de sortie immédiat. Coût d'opportunité = perte de la valeur plateforme estimée 5-7 h/sem CEO récupérées V1+ (≈ 45-65 k€/an).

**Recommandation Major Fey** : éviter le scénario C avant d'avoir testé v0.5 en production. La v0.4 démontre la valeur, mais sans v0.5 elle reste un proof-of-concept non scalable.

---

## 7 · Sprint 1 ready-to-fire

### 7.1 — Pré-requis avant le 5 mai (J-10 → J0)

| # | Action | Échéance | Responsable | Status |
|---|---|---|---|---|
| 1 | Décision ExCom GO formelle | 04/05 | ExCom | en attente |
| 2 | Validation trésorerie DAF | 28/04 | DAF | en cours |
| 3 | Sourcing 2 dev fullstack | 02/05 | Major Fey + RH | en cours |
| 4 | Contrats freelance signés | 02/05 | DAF + dev | en attente sourcing |
| 5 | Onboarding pack rédigé | 30/04 | Major Fey | T3 issue `infra/onboarding-dev` |
| 6 | OpenAPI v1 hand-written | 18/05 (sprint 1 fin) | Major Fey | parqué Issue `infra/openapi-handwritten` |
| 7 | Repo aiCEO branche `release/v0.5` | 02/05 | Major Fey | branche à créer |
| 8 | Kickoff sprint 1 | 05/05 09:00 | Équipe complète | KICKOFF-V05.pptx prêt |

### 7.2 — Premier jour (5 mai matin)

- 09:00 — Kickoff sprint 1 sur `KICKOFF-V05.pptx` (15 slides, 45 min).
- 10:00 — Tour de table équipe + accès GitHub + ouverture des 8 issues sprint 1.
- 11:00 — Démarrage technique : schéma SQLite + migrations + tests DB.
- 17:00 — Stand-up de fin de journée + ajustement issues si dérive.

### 7.3 — Rituels sprint v0.5

- **Daily** : 15 min lundi-vendredi 09:00 (bref, sur Slack/Teams si possible).
- **Sprint review** : vendredi fin de sprint, démo Major Fey + ajustement backlog.
- **Sprint retro** : vendredi fin de sprint, 30 min, capitalisation.
- **Mid-sprint check** (ExCom) : vendredi en milieu de sprint 3 (12/06) si dérive ≥ 3 j cumulée détectée par roadmap interactive.

---

## 8 · Annexes

### A — Documents de référence

| Doc | Branche | Rôle |
|---|---|---|
| `04_docs/SPEC-FONCTIONNELLE-FUSION.md` | `main` | Parcours utilisateur 13 pages |
| `04_docs/SPEC-TECHNIQUE-FUSION.md` | `main` | Architecture, schéma, API, sprints, budget |
| `04_docs/08-roadmap.md` §3.2-3.3 | `main` | Périmètre + critères de scellement |
| `04_docs/BUSINESS-CASE.md` | `docs/business-case` | Trajectoire 18 mois, 1,69 M€, scénarios ARR |
| `04_docs/POA-V05.xlsx` | `main` (à committer) | Plan opérationnel et financier détaillé |
| `04_docs/KICKOFF-V05.pptx` | `main` (à committer) | Deck kickoff sprint 1 |
| `00_BOUSSOLE/DECISIONS.md` | `main` | ADR de référence + ADR GO/NO-GO à venir |
| `00_BOUSSOLE/ROADMAP.md` | `main` | Vue trajectoire courte |
| `04_docs/11-roadmap-map.html` | `main` | Roadmap interactive + journal vivant |

### B — Glossaire éclair

- **v0.4** : MVP Node + Outlook desktop livré 22/04/2026, arbitrage 28 tâches en 41 s.
- **v0.5** : phase couverte par ce dossier — fusion app-web ↔ MVP, 110 k€, 10 sem.
- **V1** : copilote proactif (Inngest + Postgres + Graph API), 290 k€, T3-T4 2026.
- **V2** : multi-tenant équipe + SOC 2, 693 k€, T1-T2 2027.
- **V3** : coach Opus + PWA mobile + ouverture CEO pair, 598 k€, T3-T4 2027.
- **Pont jetable** : code v0.5 (PowerShell COM, Service Windows) qui sera ré-écrit en V1.
- **Dogfood** : usage interne quotidien Major Fey comme CEO pilote.

### C — Composition ExCom décideur

- Major Fey — CEO ETIC Services + CEO pilote aiCEO (porteur projet).
- (À compléter ExCom selon convocation 04/05).

### D — Changelog du dossier

- **v1.0 — 2026-04-25** — Première version pour décision ExCom 04/05.

---

*Document interne ExCom ETIC Services. Ne pas diffuser à l'extérieur sans validation explicite. Pour la version filtrée business angel / CEO pair, voir `BUSINESS-CASE.md` (branche `docs/business-case`).*
