# aiCEO — Dossier produit exécutif

**Destinataire :** Feycoil Mouhoussoune, CEO ETIC Services (ADABU · START · AMANI)
**Date de v1 :** 23 avril 2026 · **Dernière mise à jour :** 24 avril 2026 (post-fusion + GitHub)
**Auteur :** Copilote aiCEO — PMO + Designer + CTO + ergonome
**Statut :** v1 — dossier stratégie passé en comité, produit en cours de fusion app-web ↔ MVP

---

## Pourquoi ce dossier existe

Vous pilotez simultanément trois sociétés, une mission Mayotte, un POC data-center, un conseil SCI, et vous arbitrez plus de 40 dossiers vivants en parallèle. L'outil actuel (index.html + assistant.html + agenda hebdo) est une bonne v0 — il agrège, il groupe, il affiche. Il ne *décide pas à votre place*, il ne *voit pas comme vous voyez*, et il ne *protège pas votre énergie*.

Ce dossier répond à une seule question : **à quoi doit ressembler la v1 d'aiCEO pour qu'elle devienne votre copilote exécutif, pas un tableau de bord de plus ?**

Les neuf documents qui suivent sont organisés en trois couches — *pourquoi*, *quoi*, *comment* — et se terminent par une synthèse pour votre comité stratégique.

---

## Les dix fascicules

### Couche 1 · Pourquoi — Vision & marché

**[01 · Vision produit](01-vision-produit.md)** *(11 Ko · 10 min)*
Thèse produit en une page, profil utilisateur encodé (visuel, exigeant, sous charge, difficulté à déléguer), promesse en 3 phrases, anti-promesses assumées. À lire en premier.

**[02 · Benchmark approfondi](02-benchmark.md)** *(17 Ko · 20 min)*
14 produits scannés (Dust, Lindy, Martin, Athena, Motion, Reclaim, Superhuman, Sunsama, Tana, Reflect, Heptabase, Napkin, Mem, Notion AI). Ce que chacun fait bien, là où ils plafonnent, la niche ouverte que personne n'occupe : *copilote proactif × pensée visuelle native*.

### Couche 2 · Quoi — Spécifications fonctionnelles

**[03 · IA proactive & délégation](03-ia-proactive.md)** *(16 Ko · 20 min)*
Grammaire des propositions (6 familles : brouillon mail, prep RDV, tâche depuis événement, rééquilibrage charge, automatisation, synthèse). Boucle cognitive IDLE→SENSE→DIAGNOSE→PROPOSE→WAIT→ACT→LEARN. Délégation un-clic. Anti-perfectionnisme assumé.

**[04 · Visualisation & pensée graphique](04-visualisation.md)** *(19 Ko · 25 min)*
10 gabarits de vues (cockpit radial, hub-spoke, matrice 2×2, Kanban groupé, timeline T/V, arbre de dossiers, pensée visuelle texte↔diagramme, mémoire spatiale, sparklines d'énergie, graphe de décision). Pour chaque gabarit : quand l'utiliser, quand ne *pas* l'utiliser.

**[05 · Coaching & anti-surchauffe](05-coaching-ux.md)** *(21 Ko · 25 min)*
UX psychologie : ton *chief-of-staff senior*, pas coach sportif. Rituel matin/soir/dimanche. Budget d'interruption (15 max/jour). Détection saturation via signaux passifs. Weekend muet. Phrases exactes testées pour 12 moments-clés.

### Couche 3 · Comment — Construire & livrer

**[06 · Architecture technique](06-architecture.md)** *(25 Ko · 30 min)*
Topologie : ingestion (Outlook, Slack, GitHub, Notion, Airtable) → graphe de contexte → agent cognitif → cockpit. Scalabilité 1→20 CEOs. Souveraineté des données (scope par société, oubli actif). Coûts LLM maîtrisés (cascade modèles). Stack proposé : Next.js + pgvector + Temporal + Claude Sonnet.

**[07 · Design system](07-design-system.md)** *(21 Ko · 25 min)*
Tokens Twisty (crème + lilas + coral + sage + sky + amber). Typographie (Cambria headers + Calibri body). Composants : portlet pastel, drawer source, coach-strip, ai-card, chip. Règles : aplats jamais dégradés, filets jamais intérieurs, motif répété = cohérence.

**[08 · Roadmap 18 mois](08-roadmap.md)** *(18 Ko · 20 min)*
4 jalons : MVP T2 2026 (132 k€) → V1 T4 2026 (290 k€) → V2 T2 2027 (693 k€) → V3 T4 2027 (598 k€). Total 1,7 M€ · équipe 3→9 ETP. Chaque palier porte un go/no-go mesurable (usage, rétention, NPS, CAC/LTV).

**09 · Backlog produit** *(migré le 24/04/2026)*
Depuis le 24/04/2026, le backlog est **GitHub Issues** sur `feycoil/aiCEO` : 78 issues (42 epics F1-F42 + ~35 tactiques + 1 epic infra), 29 labels (`lane/*`, `type/*`, `priority/*`, `status/*`, `phase/*`, `scope/*`) et 4 milestones (`MVP`, `V1`, `V2`, `V3`). L'ancien xlsx est archivé dans [`_archive/2026-04-backlog-initial/`](../_archive/2026-04-backlog-initial/) pour traçabilité.

### Spécifications fusion (ajoutées le 24/04/2026)

**[SPEC-FONCTIONNELLE-FUSION](SPEC-FONCTIONNELLE-FUSION.md)** *(fusion app-web ↔ MVP)*
Vision unifiée, cartographie 21→13 pages, user flows matin/soir/hebdo, doublons résolus, critères d'acceptation MVP, horizon V1-V3. 5 diagrammes Mermaid.

**[SPEC-TECHNIQUE-FUSION](SPEC-TECHNIQUE-FUSION.md)** *(architecture cible post-fusion)*
Stack Node 20 + Express + better-sqlite3 + vanilla JS, schéma SQLite complet (13 tables), API REST (40+ endpoints), intégration Outlook (COM MVP → Graph V1), déploiement Service Windows, plan de migration one-shot avec backup/rollback, sprints S1-S8.

### Synthèse · Comité stratégique

**[10 · Deck exécutif](10-exec-deck.pptx)** *(776 Ko · 20 slides · 12 min)*
La version 12-minutes du dossier : thèse, positionnement, grammaire IA, visualisation, coaching, architecture, roadmap, équipe, risques, KPIs, manifeste. Format PowerPoint exploitable directement en comité (ADABU 30/04).

### Fascicules transverses (hors couches)

**[11 · Rituel hebdomadaire](../06_revues/README.md)**
Bibliothèque des revues dominicales du CEO. Cadence, gabarit, nommage (`revue-YYYY-WNN.md`), alimentation future par le rituel auto-drafté en V1. Revue W17 comme exemple canonique.

**[12 · User journeys (démo UX cliquable)](../05_journeys/README.md)**
Cinq pages HTML statiques illustrant les moments-clés : matinée, arbitrage, copilote en journée, clôture du soir, revue hebdo. Sert de référence visuelle pour designers, devs et investisseurs/CEO pairs (livrable externe potentiel).

### Audits et ateliers (documents de pilotage transitoires)

Ces documents ne sont pas des fascicules — ce sont des **traces de travail** produites lors d'audits ponctuels ou d'ateliers structurés. Ils restent accessibles pour traçabilité mais ne font pas foi en permanence.

- **[AUDIT-COHERENCE-2026-04-24](AUDIT-COHERENCE-2026-04-24.md)** — audit sans concession du dossier produit (7 dissonances critiques identifiées)
- **[`_atelier-2026-04-coherence/`](_atelier-2026-04-coherence/)** — atelier structuré en 8 sessions qui tranche les dissonances de l'audit. `CADRE.md` (méthode), `JOURNAL.md` (trace chrono), `sessions/S*-*.md` (une par décision). Les décisions durables sont promues en ADR dans `00_BOUSSOLE/DECISIONS.md`.

Hiérarchie des sources de vérité documentaires formalisée dans `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Hiérarchie des sources de vérité documentaires*.

### Livrables externes (audiences hors équipe produit)

Les documents ci-dessous sont écrits **pour des lecteurs externes** (CEO pair ETIC, investisseur) et portent en en-tête une mention `Audience : X. Éléments redactés : Y. Version interne de référence : Z.`. Ils ne remplacent pas les fascicules internes — ils en sont la version filtrée et contextualisée pour un usage partagé hors dossier. Cadrage formalisé dans `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Livrables externes : cadrage* (Session 5 de l'atelier de cohérence).

- **PITCH-ONEPAGE.md** — *(à produire en S2 du plan audit, 05/05 → 11/05)* · 1 page exportable PDF · problème / solution / preuve MVP v0.4 / trajectoire / CTA · investisseur
- **BUSINESS-CASE.md** — *(à produire)* · hypothèses revenue, coûts 18 mois, point mort, ROI CEO utilisateur · investisseur
- **ONBOARDING-CEO-PAIR.md** — *(à produire)* · install Service Windows, import Outlook, premier arbitrage, FAQ · CEO pair ETIC
- **LETTRE-INTRO-CEO-PAIR.md** — *(à produire)* · template 1 page signée Feycoil, pair-à-pair · CEO pair ETIC
- **PITCH-DECK-INVESTISSEUR.pptx** — *(à produire, adapté depuis `10-exec-deck.pptx`)* · 15-18 slides, version investisseur · investisseur

Les 6 issues GitHub correspondantes (dont la dépendance bloquante `doc/02-benchmark-v2-positionnement-a-jour`) ont leur contenu préparé dans [`_atelier-2026-04-coherence/sessions/S5-livrables-externes.md`](_atelier-2026-04-coherence/sessions/S5-livrables-externes.md) §9.

### Livrables dev (audience CTO / dev interne)

Les documents ci-dessous sont écrits **pour l'équipe dev v0.5** (2 fullstack arrivent 05/05) et vivent **avec le code** dans `../03_mvp/docs/` pour co-évoluer sans dérive. Des pointeurs existent depuis ce README pour découvrabilité depuis le dossier produit. Cadrage formalisé dans `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook* (Session 6 de l'atelier de cohérence).

- **[ONBOARDING-DEV.md](../03_mvp/docs/ONBOARDING-DEV.md)** — parcours premier jour (clone → premier serveur → premier commit), pré-requis, 8 modules `src/`, conventions équipe, FAQ. Pointe vers `SPEC-TECHNIQUE-FUSION.md` comme source canonique architecture.
- **[RUNBOOK-OPS.md](../03_mvp/docs/RUNBOOK-OPS.md)** — modes de panne diagnostiqués en prod + remèdes (serveur, clé Anthropic, import Outlook, proxy corp, JSON OneDrive, Service Windows). Règle explicite : chaque nouvelle panne → entrée runbook dans le sprint.
- **openapi.yaml** — *(à produire en S2 du plan audit, 12/05 → 18/05)* · spec OpenAPI 3.0 formelle dérivée de `SPEC-TECHNIQUE-FUSION.md` §6 (~40 endpoints / 14 domaines). Contrat pour Claude dans Cowork V1+ et intégrateurs futurs. Bascule vers génération automatique depuis le code en Sprint 3-4 v0.5 (Zod + zod-to-openapi, issue GitHub `infra/openapi-generated-from-code` à ouvrir).

Parqués explicitement (non produits en S6) : `CONTRIBUTING.md` séparé (ré-ouvert si équipe ≥ 4), `ONBOARDING-DEV-EXTERNE.md` (post-V2 si contractor/partenaire tech), runbook exhaustif anticipé (contre-indiqué par la règle vivante).

---

## Ordre de lecture recommandé

**Vous avez 20 minutes :** 01 → 10
**Vous avez 2 heures (parcours complet exécutif) :** 01 → 02 → 08 → 10 → 03 → 05
**Vous montez une équipe produit :** 06 → 07 → SPEC-TECHNIQUE-FUSION → 04 → 03
**Vous validez un angle avant comité :** 02 → 01 → 10
**Vous attaquez la fusion app-web ↔ MVP :** SPEC-FONCTIONNELLE-FUSION → SPEC-TECHNIQUE-FUSION → GitHub Issues (milestone MVP)

---

## Ce qui n'est **pas** dans ce dossier

- Business plan financier détaillé (modèle P&L, levée, dilution) — à produire si go/no-go MVP favorable
- Specs API détaillées (OpenAPI) — à livrer avec la v0 technique
- User research terrain (entretiens CEO, shadowing) — à budgéter dans le MVP
- Contrat partenariats (Outlook Graph, Slack Bot, licences LLM) — à déclencher post-décision

Si l'un de ces livrables devient prioritaire, reprenez le backlog GitHub (`feycoil/aiCEO` Issues) : ils y sont tous référencés avec label `priority/P2` ou `priority/P3`.

---

## Principe d'usage du dossier

Ces documents sont *vivants*. Annotez. Contestez. Supprimez. Le rôle du copilote n'est pas de produire du PDF définitif — c'est d'exposer les pièces pour que vous arbitriez vite et bien. Si une section vous fait tiquer, c'est probablement là qu'il faut creuser.

Prochaine itération attendue : **post-comité 30/04** — intégration de vos décisions + correction des axes qui auront été contestés.

---

*Copilote aiCEO · 23 avril 2026 · v1*
