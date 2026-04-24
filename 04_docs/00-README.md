# aiCEO — Dossier produit exécutif

**Destinataire :** Feycoil Mouhoussoune, CEO ETIC Services (ADABU · START · AMANI)
**Date :** 23 avril 2026
**Auteur :** Copilote aiCEO — PMO + Designer + CTO + ergonome
**Statut :** v1 — prêt pour comité

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

**[09 · Backlog produit](09-backlog.xlsx)** *(19 Ko · Excel)*
Feuille exécutive : 120 items répartis en 4 jalons, colonnes *Priorité · Effort · Impact · Dépendances · Propriétaire · Milestone*. Filtrable, triable, chiffré. C'est le document vivant — mettez-le à jour au comité.

### Synthèse · Comité stratégique

**[10 · Deck exécutif](10-exec-deck.pptx)** *(776 Ko · 20 slides · 12 min)*
La version 12-minutes du dossier : thèse, positionnement, grammaire IA, visualisation, coaching, architecture, roadmap, équipe, risques, KPIs, manifeste. Format PowerPoint exploitable directement en comité (ADABU 30/04).

---

## Ordre de lecture recommandé

**Vous avez 20 minutes :** 01 → 10
**Vous avez 2 heures (parcours complet exécutif) :** 01 → 02 → 08 → 10 → 03 → 05
**Vous montez une équipe produit :** 06 → 07 → 09 → 04 → 03
**Vous validez un angle avant comité :** 02 → 01 → 10

---

## Ce qui n'est **pas** dans ce dossier

- Business plan financier détaillé (modèle P&L, levée, dilution) — à produire si go/no-go MVP favorable
- Specs API détaillées (OpenAPI) — à livrer avec la v0 technique
- User research terrain (entretiens CEO, shadowing) — à budgéter dans le MVP
- Contrat partenariats (Outlook Graph, Slack Bot, licences LLM) — à déclencher post-décision

Si l'un de ces livrables devient prioritaire, reprenez le backlog (09) : ils y sont tous référencés avec priorité `P2-Ready`.

---

## Principe d'usage du dossier

Ces documents sont *vivants*. Annotez. Contestez. Supprimez. Le rôle du copilote n'est pas de produire du PDF définitif — c'est d'exposer les pièces pour que vous arbitriez vite et bien. Si une section vous fait tiquer, c'est probablement là qu'il faut creuser.

Prochaine itération attendue : **post-comité 30/04** — intégration de vos décisions + correction des axes qui auront été contestés.

---

*Copilote aiCEO · 23 avril 2026 · v1*
