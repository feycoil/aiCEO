---
title: aiCEO — Business case 18 mois
audience: investisseur business angel · CEO pair · Comex ETIC Services
version: v0.5 — pré-tour interne
date: 2026-04-25
status: draft externe (à valider COPIL ETIC avant diffusion)
filtrage: |
  Audience : investisseur / CEO pair. Éléments redactés : ventilation salaires
  individuels ETIC, identité des CEO pilotes, conditions commerciales clients
  pro de l'agence Twisty. Toutes les figures financières sont des hypothèses
  de travail à challenger, pas des engagements contractuels.
---

# aiCEO — Business case 18 mois

## TL;DR (pour les pressés)

aiCEO est un **copilote stratégique pour CEO de PME** qui transforme la charge
mentale du dirigeant (300-1000 mails/jour, 30-50 décisions/jour, multi-projets,
pas d'équipe support) en **arbitrage matinal de 5 minutes**.

Le **MVP v0.4 est livré** (Node + Outlook desktop + Claude Sonnet 4.5,
arbitrage 28 tâches en 41 s pour ≈ 1 ct/jour). La trajectoire 18 mois mène à
une plateforme multi-tenant prête pour 2-3 CEO pairs en V3 (T4 2027).

Le **business case interne** est piloté par le **gain de temps CEO** (5-7 h/sem
récupérées en V1 ≈ 45-65 k€/an de valeur reproductible) plutôt que par un
chiffre d'affaires SaaS immédiat. Le **modèle économique externe** (SaaS
premium 300-800 €/CEO/mois) ne s'ouvre qu'à partir de V2 (T1-T2 2027), une
fois le multi-tenant et la conformité SOC 2 en place.

**Coût total trajectoire** : ≈ 1,68 M€ sur 18 mois (110 + 290 + 693 + 598 k€),
financés par fonds propres ETIC Services + appoint éventuel business angel
sur la phase V2 (mise en marché).

**Risques majeurs** : (1) v0.5 local-first reste un *pont jetable* à
re-architecturer en V1 cloud, (2) dépendance Anthropic au modèle LLM unique,
(3) modèle économique externe non encore validé, (4) dépendance opérationnelle
à un CEO pilote unique (Feycoil) jusqu'à fin V1.

---

## 1 · Pourquoi maintenant

### 1.1 — La fenêtre de marché

Quatre signaux alignés en 2026 ouvrent la fenêtre :

1. **Maturité LLM raisonnement** : Claude Sonnet 4.5, GPT-5, Gemini 2.5 Pro
   passent le seuil de l'arbitrage de tâches contextualisé — démontré par la
   v0.4 sur 28/28 tâches réelles.
2. **Saturation cognitive des CEO PME** : INSEE / Bpifrance — 78 % des
   dirigeants de PME 10-250 salariés rapportent une charge informationnelle
   *insurmontable*, 41 % se déclarent en risque burnout (vague 2025).
3. **Refus du SaaS US standard** : RGPD, ANSSI, souveraineté numérique
   française — les outils américains (Notion AI, Motion, Reclaim) ne
   convainquent plus les CEO sensibles au sujet (cf. benchmark v2 §0).
4. **Outils desktop natifs sous-investis** : aucun concurrent n'adresse le
   stack Outlook desktop + Windows Pro qui domine encore les PME françaises
   et les ETI 50-500 salariés.

### 1.2 — Pourquoi nous

ETIC Services (Major Fey CEO) est :

- **Utilisateur cible et pilote dogfooding** depuis avril 2026 (boîte mail
  réelle, 926 mails Outlook 30 j, agenda multi-comptes).
- **Détenteur d'un design system mature** (Twisty, 13 polices, 19 pages
  produit) prêt à être réutilisé sur la plateforme.
- **Implanté dans un écosystème de 2-3 CEO pairs** francophones de PME
  technologiques, candidats naturels au pilote V3.
- **Capable de maintenir le rythme dev solo + intervenants spécialisés**
  démontré par la livraison v0.4 en 6 semaines.

---

## 2 · Hypothèses revenue

### 2.1 — Phase v0.5 → V1 (T2 2026 → T4 2026) : usage interne ETIC

**Pas de revenue commercial externe.** L'usage est strictement dogfood
Major Fey + 1-2 collaborateurs ETIC en lecture seule sur l'agenda partagé.

Le bénéfice économique est mesuré par le **gain de temps CEO** (cf. §4 ROI),
pas par un chiffre d'affaires.

### 2.2 — Phase V2 (T1-T2 2027) : ouverture écosystème ETIC

À partir du multi-tenant Supabase + RLS (V2), on ouvre 1-2 CEO pairs en
**pilote payant interne ETIC**. Hypothèses de travail :

| Variable | Hypothèse basse | Hypothèse centrale | Hypothèse haute |
|---|---|---|---|
| Pricing CEO pilote interne | 300 €/mois | 500 €/mois | 800 €/mois |
| Nombre pilotes V2 (T2 2027) | 1 | 2 | 3 |
| Revenue annualisé V2 | 3,6 k€ | 12 k€ | 28,8 k€ |

Le pricing 300-800 €/CEO/mois est calibré sur :
- Coût LLM réel observé (≈ 1 ct/arbitrage × 1 arbitrage/jour × 22 jours
  ouvrés ≈ 0,22 €/mois en LLM brut). La marge brute est donc **élevée** en
  l'absence de coûts d'infra significatifs.
- Comparables SaaS premium B2B francophones : Welcome to the Jungle Solo
  (199 €/mois), Pennylane Premium (320 €/mois), Spendesk (400 €/mois HT).
- Volonté de positionner comme **outil CEO** (pas commodity) : prix
  signaling, accompagnement onboarding inclus, support direct du fondateur.

### 2.3 — Phase V3 et au-delà (T3-T4 2027 → 2028) : SaaS premium

À partir de V3 (PWA mobile, coach Opus, multi-CEO ouvert), le modèle pivote
vers une **distribution SaaS premium contrôlée** :

| Variable | Hypothèse basse | Hypothèse centrale | Hypothèse haute |
|---|---|---|---|
| Pricing standard | 400 €/mois | 600 €/mois | 800 €/mois |
| Nombre clients fin 2027 | 5 | 12 | 25 |
| ARR fin 2027 | 24 k€ | 86 k€ | 240 k€ |
| Pricing entreprise (10+ CEO) | — | 5 k€/mois | 12 k€/mois |
| Comptes entreprise fin 2027 | 0 | 1 | 2 |
| ARR entreprise fin 2027 | 0 | 60 k€ | 288 k€ |
| **ARR total fin 2027** | **24 k€** | **146 k€** | **528 k€** |

> **Rappel de filtrage** — ces fourchettes sont des **hypothèses de modélisation**
> destinées à éclairer le calibrage du tour de financement V2, pas des
> projections engageantes. Les pilotes V2 serviront précisément à valider la
> bande basse / centrale.

---

## 3 · Coûts cumulés sur 18 mois

### 3.1 — Synthèse par phase

| Phase | Durée | ETP moyen | Dev | Infra & licences | Spécifiques | **Total phase** |
|---|---:|---:|---:|---:|---:|---:|
| **v0.5** Fusion | 10 sem | 2,6 | 105 k€ | 5 k€ | — | **110 k€** |
| **V1** Proactif | 16 sem | 4,3 | 280 k€ | 8 k€ | 2 k€ traçabilité | **290 k€** |
| **V2** Multi-tenant | 20 sem | 8,0 | 648 k€ | 20 k€ | 25 k€ SOC 2 | **693 k€** |
| **V3** Coach + Mobile | 16 sem | 9,0 | 583 k€ | — | 15 k€ consulting psycho | **598 k€** |
| **Total 18 mois** | **62 sem** | — | **1 616 k€** | **33 k€** | **42 k€** | **≈ 1 691 k€** |

Hypothèses de calcul commune à toutes les phases : 900 €/jour dev moyen
(mix freelance senior + interne ETIC), 4,5 jours / semaine effectifs.

### 3.2 — v0.5 — Fusion app-web ↔ MVP (110 k€, T2 2026)

- **Dev** : 10 sem × 2,6 ETP × 900 €/j × 4,5 j/sem = 105,3 k€.
- **Infra** : SQLite local (gratuit), Claude Sonnet 4.5 inchangé (≈ 0,30 €/mois
  par user), CI GitHub Actions 2000 min/mois (gratuit Pro), domaine + hébergement
  doc statique (≈ 5 k€/an provision).
- **Livrables clés** : API REST 40+ endpoints, schéma SQLite 13 tables, cockpit
  unifié 13 pages, Service Windows démarrage auto, migration `migrate-from-appweb.js`
  (cf. SPEC-TECHNIQUE-FUSION.md §13).
- **ETP** : 1 lead dev (Major Fey 0,8) + 1 dev intervenant (1,2) + 0,4 design
  intermittent (0,2 ETP × 2 personnes) + 0,2 PMO (Major Fey).

### 3.3 — V1 — Copilote proactif (290 k€, T3-T4 2026)

- **Dev** : 16 sem × 4,3 ETP × 900 €/j × 4,5 j/sem ≈ 280 k€.
- **Infra V1** :
  - Supabase Team (Postgres + pgvector + storage) : 599 €/mois × 4 mois ≈ 2,4 k€.
  - Inngest (jobs + webhooks) : 200 $/mois × 4 mois ≈ 0,7 k€.
  - Bedrock EU (mirroring Anthropic via AWS Frankfurt) : 1500 €/mois × 4 mois ≈ 6 k€.
  - Langfuse cloud EU (traçabilité) : provision 2 k€.
  - **Sous-total infra ≈ 8-10 k€**.
- **Livrables clés** : sub-agents spécialisés (mail, calendar, task, deleg,
  meeting-prep, weekly-review), Graph API OAuth msal-node, mémoire 3 strates
  (identity / preference / episode), rituels auto-draftés.
- **ETP** : 1 lead + 2 backend (cloud / Postgres / Inngest) + 1 frontend
  (cockpit React + agent UI) + 0,3 PMO.

### 3.4 — V2 — Multi-tenant équipe (693 k€, T1-T2 2027)

- **Dev** : 20 sem × 8 ETP × 900 €/j × 4,5 j/sem ≈ 648 k€.
- **Infra V2** : Supabase Pro upgradé (1500 €/mois × 5 mois) + Bedrock EU
  scaling + Teams Graph API + observabilité Datadog ≈ 18-20 k€.
- **SOC 2 Type II** via Vanta ou Drata : audit + contrôles + provision risque
  ≈ 25 k€.
- **Livrables clés** : RLS Supabase rôles (CEO / DG / AE / manager / collab),
  délégation end-to-end (la tâche apparaît chez le destinataire), Teams Graph
  API, canvas tldraw collaboratif, certification SOC 2 Type II.
- **ETP** : 1 CTO/lead + 3 backend (multi-tenant + RLS + Teams) + 2 frontend
  (collab + tldraw) + 1 SRE/DevOps + 1 PMO + 0,3 design.

### 3.5 — V3 — Coach + mobile (598 k€, T3-T4 2027)

- **Dev** : 16 sem × 9 ETP × 900 €/j × 4,5 j/sem ≈ 583 k€.
- **Consulting psycho-clinicien** (anti-burnout, modes coach Opus) : 2 j/mois ×
  4 mois × 1500 €/j ≈ 12-15 k€.
- **Livrables clés** : coach conversationnel Claude Opus (modes arbitrage /
  coincé / revue stoïque), détection burnout active + interventions graduées,
  PWA offline-first (ElectricSQL ou PowerSync), ouverture multi-CEO 2-3 pairs
  ETIC.
- **ETP** : équipe V2 + 1 coach produit psycho-aware + reinforcement
  mobile/PWA (2 frontend supplémentaires).

### 3.6 — Coûts hors trajectoire (à provisionner)

À côté du dev produit, prévoir :

- **Marketing-pilote V2-V3** : 30-50 k€ sur 6 mois (site landing, vidéo
  démo, contenu CEO, événement lancement écosystème ETIC).
- **Juridique RGPD / CGU / DPA** : 8-15 k€ (cabinet spécialisé tech B2B).
- **Comptabilité dédiée + suivi tour** : 5 k€/an.
- **Provision risque dépendance LLM** (passage Bedrock dual-vendor) : 10 k€.

**Total enveloppe externe ≈ 55-80 k€** sur la période, à intégrer si on
sort du périmètre dogfood ETIC.

---

## 4 · Point mort

### 4.1 — Lecture interne (gain de temps CEO)

Le **business case interne** ne dépend pas du revenue externe. Il se mesure
en temps CEO récupéré × valeur horaire.

- **Hypothèse temps gagné en V1 (cible)** : 5-7 h/semaine × 45 semaines
  ouvrées = 225-315 h/an récupérées sur des activités à faible valeur
  ajoutée (tri inbox, planification, suivi tâches déléguées).
- **Valeur horaire CEO ETIC** (hypothèse de modélisation, basée sur coût
  complet dirigeant moyenne PME 50-200 salariés) : 150-250 €/h.
- **Gain annuel valorisé V1 (un seul CEO)** : 45-65 k€ (centre de gamme :
  270 h × 200 €/h = 54 k€).

À partir de V1 (T4 2026), **le seul gain Feycoil rembourse environ 13-18 %
des coûts V1 annualisés**. Ce calcul ne capture pas les gains qualitatifs
(décisions plus solides, moins de mails ratés, baisse de la charge mentale).

### 4.2 — Lecture externe (point mort SaaS V2+)

Si on raisonne **opex récurrents seuls** (hors investissement R&D coulé),
les coûts marginaux par CEO additionnel post-V2 sont essentiellement :

- LLM Anthropic / Bedrock : ≈ 5-15 €/CEO/mois (selon volume mails).
- Infra Supabase + Inngest : ≈ 10-30 €/CEO/mois (linéaire jusqu'à ~200 CEO).
- Support fondateur : 2-4 h/CEO/mois × 200 €/h ≈ 400-800 €/CEO/mois (pèse).
- **Coût marginal CEO ≈ 415-845 €/mois en early V2**, qui descend à
  100-200 €/mois une fois le support standardisé en V3.

Au pricing central 600 €/CEO/mois en V3, **le point mort cash sur opex est
atteint dès le 2-3<sup>ème</sup> CEO pilote**. Le point mort qui couvre le
coût total trajectoire (1,69 M€ + provision externe ≈ 1,75 M€) suppose en
revanche **un volume de l'ordre de 250-350 CEO clients à 600 €/mois**, soit
un horizon réaliste 2029-2030 si la dynamique d'écosystème ETIC s'élargit
au réseau France Digitale / Bpifrance Excellence.

> **Note de sincérité** — sur la base de 1-3 CEO pilotes ETIC en V3, le
> projet **ne sera jamais cash-positive standalone**. Il est pensé comme
> un **investissement plateforme** réutilisable par ETIC Services pour ses
> propres clients d'agence Twisty + dogfood permanent + ouverture sélective
> à 1-3 CEO pairs. La rentabilité standalone suppose un changement d'échelle
> (tour de financement V2 ou cession plateforme) qui n'est **pas un
> engagement** de la trajectoire actuelle.

---

## 5 · ROI utilisateur (CEO pilote)

Pour le CEO qui paye 300-800 €/mois en V2-V3, le calcul est :

- **Coût annualisé** : 600 €/mois × 12 = 7,2 k€/an.
- **Gain temps cible V1+** : 5-7 h/sem × 45 sem × 200 €/h ≈ 45-65 k€/an.
- **Ratio ROI** : 6-9× le coût SaaS.
- **Gains qualitatifs additionnels** non-valorisés ici : meilleure
  délégation, moins de tâches oubliées, énergie disponible pour la
  stratégie, charge mentale baissée.

**Le ROI tient même en hypothèses dégradées** : à 2 h/sem économisées et
150 €/h, on a encore 13,5 k€/an gagnés vs 7,2 k€/an dépensés (ratio 1,9×).

---

## 6 · Risques connus et mitigations

### 6.1 — Pont jetable v0.5 (risque produit, P0)

**Risque** : la v0.5 est volontairement local-first (SQLite, Outlook COM,
Service Windows). Elle sera intégralement re-architecturée en V1 (Postgres,
Graph API OAuth, cloud EU). Une partie du code v0.5 sera donc *jetée*.

**Mitigation** :
- Schéma SQLite 13 tables conçu d'emblée pour migrer 1:1 vers Postgres.
- Couche d'abstraction `services/outlook.js` qui encapsule Outlook COM en
  v0.5 et sera remplacée par msal-node Graph en V1 sans changer l'API
  appelée par l'agent.
- Documentation `SPEC-TECHNIQUE-FUSION.md` §13 explicite quelle partie
  est jetable (les *adapters* PowerShell COM, Service Windows) et quelle
  partie capitalise (modèle de données, API REST, cockpit, prompts agent).

### 6.2 — Dépendance Anthropic (risque tech, P1)

**Risque** : la v0.4 / v0.5 / V1 reposent intégralement sur Claude Sonnet
4.5 via l'API directe Anthropic. Un changement de pricing × 5, une coupure
service, ou une variation qualité du modèle peuvent compromettre le produit.

**Mitigation** :
- En V1, mirroring **AWS Bedrock EU (Frankfurt)** pour avoir le même modèle
  via un autre canal contractuel.
- En V2, intégration **LiteLLM** comme couche d'abstraction multi-vendeur
  (Anthropic + Bedrock + Mistral + GPT pour fallback de bas niveau).
- Tous les prompts versionnés `02_design-system/prompts/` pour permettre
  un re-tuning rapide sur un modèle alternatif.

### 6.3 — Modèle économique externe non validé (risque marché, P0)

**Risque** : le pricing 300-800 €/CEO/mois est basé sur des comparables et
sur une intuition métier, pas sur 5+ entretiens de validation acheteur ni
sur un test landing page sur le marché ouvert.

**Mitigation** :
- Phase V2 dédiée à l'**ouverture maîtrisée** sur 1-3 CEO pairs ETIC, avec
  une vraie facturation et un vrai NPS mesurés à M+3, M+6, M+12.
- Avant la fin de V1 (T4 2026), prévoir une **vague d'entretiens validation
  acheteur** (10-15 CEO PME francophones, hors écosystème direct ETIC) pour
  challenger le pricing et la proposition de valeur.
- Si la bande basse 300 €/mois ne tient pas en pilote V2, **freezer le
  développement V3 multi-CEO** et reconsidérer le projet comme outil
  interne ETIC standalone (pivot acceptable).

### 6.4 — CEO pilote unique (risque opérationnel, P1)

**Risque** : la totalité du dogfood v0.4 → V1 repose sur Major Fey. Si
Feycoil change de priorités, est indisponible 4+ semaines, ou pivote son
focus métier, la boucle de feedback dogfood se casse.

**Mitigation** :
- Dès V2 (T1 2027), recruter **2 CEO pilotes additionnels** dans
  l'écosystème ETIC (objectif COPIL T4 2026 : identifier les candidats).
- Documenter rigoureusement le rituel dogfood (revue hebdo W17 → W26 + ADR
  systématiques) pour qu'un autre CEO puisse reprendre le pilotage produit
  si nécessaire.
- Provisionner un **lead produit dédié** dans le budget V2 (déjà inclus
  dans l'enveloppe 8 ETP).

### 6.5 — Écart compétences cloud / multi-tenant (risque équipe, P1)

**Risque** : v0.5 est livrable par une équipe restreinte (2-3 ETP).
V2 exige **8 ETP avec compétences cloud + Postgres RLS + multi-tenant +
SOC 2 + DevOps**, profils rares et chers en France.

**Mitigation** :
- Démarrer le **sourcing CTO/lead infra** dès le go V1 (mi-2026) pour
  amorcer l'équipe V2 en T1 2027.
- Provisionner 12-15 % de surcoût ETP (déjà chiffré à 900 €/jour, soit le
  haut du marché freelance senior).
- Possibilité d'**externaliser SOC 2 et DevOps** via partenariat type
  Padok / Theodo Cloud (déjà identifiés dans le réseau ETIC).

### 6.6 — RGPD et contrats data (risque conformité, P2)

**Risque** : v0.5 expose la base mail Outlook complète d'un dirigeant à
Claude Sonnet (anonymisation imparfaite). En V2 multi-tenant, on agrège
les données de plusieurs dirigeants ETIC + clients.

**Mitigation** :
- Architecture v0.5 strictement local — **rien ne sort du PC du CEO**
  vers l'API Claude au-delà du payload de l'arbitrage en cours.
- En V1, basculer sur **Bedrock EU (Frankfurt)** avec DPA signé.
- En V2, **DPA explicite par client final** + audit RGPD avant ouverture
  externe (cabinet spécialisé tech B2B).
- En V2, **SOC 2 Type II** comme preuve indépendante de gouvernance
  (provision 25 k€ déjà incluse).

---

## 7 · Décision attendue

Trois décisions structurantes, à arbitrer COPIL ETIC d'ici **fin T2 2026**
(scellement v0.5) :

1. **Go / no-go V1** (290 k€, T3 2026) sur la base de la v0.5 livrée. Critère
   suffisant : v0.5 stable 6 semaines en dogfood Major Fey + ≥ 1 CEO pair
   identifié intéressé pour V2.
2. **Modèle de financement V2** (693 k€, T1 2027) : fonds propres ETIC seuls,
   ou tour minoritaire business angel (200-400 k€) pour accélérer le sourcing
   équipe et le marketing pilote.
3. **Périmètre commercial V3** (598 k€, T3 2027) : reste en outil
   ETIC + écosystème (max 5-10 CEO clients), ou pivot SaaS ouvert (objectif
   50-100 CEO clients fin 2028, demande tour Série A 1,5-3 M€).

---

## Annexes

### A — Synthèse chiffrée 18 mois

| | v0.5 | V1 | V2 | V3 | **Total** |
|---|---:|---:|---:|---:|---:|
| Durée | 10 sem | 16 sem | 20 sem | 16 sem | **62 sem** |
| ETP | 2,6 | 4,3 | 8,0 | 9,0 | — |
| Dev | 105 k€ | 280 k€ | 648 k€ | 583 k€ | **1 616 k€** |
| Infra | 5 k€ | 8 k€ | 20 k€ | — | **33 k€** |
| Spécifiques | — | 2 k€ | 25 k€ | 15 k€ | **42 k€** |
| **Total** | **110 k€** | **290 k€** | **693 k€** | **598 k€** | **≈ 1 691 k€** |

### B — Sensibilité ARR fin 2027

| Scénario | Pricing moyen | Clients | ARR 2027 | Couverture coût total |
|---|---:|---:|---:|---:|
| Bas | 400 €/mois | 5 | 24 k€ | 1,4 % |
| Central | 600 €/mois + 1 entreprise 5 k€/mois | 12 + 1 | 146 k€ | 8,6 % |
| Haut | 800 €/mois + 2 entreprises 12 k€/mois | 25 + 2 | 528 k€ | 31 % |

Lecture : **même en scénario haut, l'ARR fin 2027 ne couvre pas
intégralement la trajectoire**. Le projet n'est pas un *startup play*
classique mais un investissement plateforme + écosystème.

### C — Documents de contexte

- Trajectoire produit : [`08-roadmap.md`](08-roadmap.md) · [`00_BOUSSOLE/ROADMAP.md`](../00_BOUSSOLE/ROADMAP.md)
- Specs techniques : [`SPEC-FONCTIONNELLE-FUSION.md`](SPEC-FONCTIONNELLE-FUSION.md) · [`SPEC-TECHNIQUE-FUSION.md`](SPEC-TECHNIQUE-FUSION.md)
- Vision et positioning : [`01-vision-produit.md`](01-vision-produit.md)
- Benchmark concurrentiel : [`02-benchmark.md`](02-benchmark.md)
- Pitch onepage filtré : [`PITCH-ONEPAGE.md`](PITCH-ONEPAGE.md)
- ADRs : [`00_BOUSSOLE/DECISIONS.md`](../00_BOUSSOLE/DECISIONS.md)
- Backlog public : [`feycoil/aiCEO` GitHub Issues](https://github.com/feycoil/aiCEO/issues)

---

*Document filtré pour audience CEO pair / business angel. Ventilation interne
ETIC, identités CEO pilotes et conditions commerciales agence Twisty restent
réservées au COPIL ETIC. Toutes les hypothèses financières sont des supports
de modélisation à challenger, pas des engagements contractuels.*
