# Audit conformité bundle v3 vs ROADMAP officielle

> Date : 26/04/2026
> Source : `04_docs/08-roadmap.md` v2.0 (refonte 24/04, trajectoire 18 mois, 1.68 M€)
> Verdict global : **la maquette v3 anticipe largement la roadmap. Bénéfice si bien cadré, risque si mal communiqué.**

## 1. Tableau de conformité par feature

Légende : 🟢 conforme v0.5 · 🟡 à arbitrer · 🔴 hors scope v0.5 (V1/V2/V3)

| Feature dans bundle v3 | Statut | Roadmap réelle |
|---|---|---|
| 13 pages dans `03_mvp/public/` | 🟢 | §3.2 "21 → 13 pages, consolidation −38%" |
| Migration localStorage → SQLite | 🟢 | §3.2 ADR 24/04 |
| Cockpit unifié + arbitrage + evening | 🟢 | §3.2 sprint 2 |
| Pages portefeuille (groupes/projets/contacts/decisions) | 🟢 | §3.2 sprint 4 |
| Chat assistant SSE (vs WebSocket) | 🟢 | ADR S2.10 retient SSE |
| Service Windows + raccourci desktop | 🟢 | §3.2 sprint 5 |
| Tests Playwright e2e | 🟢 | §3.2 sprint 5 |
| Drawer collapsible desktop | 🟢 | F18 partiel (V1) mais raisonnable |
| Command palette ⌘K | 🟡 | F18 V1 |
| Friction positive (5e P0) | 🟢 | Pas explicite mais cohérent |
| Recovery streak break | 🟢 | Pas explicite, cohérent v0.5 |
| Posture stratégique footer | 🟢 | Pas explicite, cohérent |
| Time-of-day adaptation | 🟡 | Pas explicite. Acceptable v0.5 si simple |
| Tokens hierarchy 3 niveaux + ITCSS | 🟡 | Architecture cohérente F18 V1 mais préparation OK v0.5 |
| Atomic design 6 niveaux | 🟡 | Architecture V1 mais préparation OK v0.5 |
| WCAG AA + AAA cockpit | 🟢 | Pas explicite. Bonne pratique v0.5 |
| **Multi-tenant + Northwind démo** | 🔴 | **F20 V2 explicite** : "RLS Supabase, ajout user_id + tenant_id en V2" |
| **Vocabulary configurable (houses vs groupes)** | 🔴 | F20 V2 |
| **Switcher tenant + démo 3 archetypes** | 🔴 | F20 V2 |
| **Theme custom tenant** | 🔴 | F20 V2 |
| **Logo tenant remplaçable** | 🔴 | F20 V2 |
| **Permissions multi-rôles** | 🔴 | F20 V2 |
| **Mobile responsive (390px)** | 🔴 | **F35 V3 explicite** : "PWA iOS + Android" |
| **Tablet responsive (1024px)** | 🔴 | F35 V3 |
| **PWA + manifest + service worker** | 🔴 | F35 V3 |
| **Bottom-tab nav + FAB + bottom sheets** | 🔴 | F35 V3 |
| **Mobile gestures (swipe, pull-refresh, long-press)** | 🔴 | F35 V3 |
| **safe-area-inset-* + dvh** | 🔴 | F35 V3 |
| **Offline-first** | 🔴 | F34 V3 explicite |
| **Onboarding wizard 7 étapes** | 🔴 | Pas v0.5 (mono-user dogfood). Pertinent V2 |
| **i18n FR + EN** | 🟡 | **Hors roadmap explicite**. Aucune mention dans v0.5/V1/V2/V3 |
| **RTL prep (AR/HE)** | 🔴 | Hors roadmap |
| **Sarah Chen + données dépersonnalisées** | 🔴 | v0.5 = mono-user Feycoil dogfood |
| **Coach prompt assistant hebdo** | 🔴 | **F29 V3 explicite** : "Coach conversationnel Claude Opus" |
| **Mirror moments hebdo** | 🔴 | F29-F32 V3 |
| **Self-talk monitoring** | 🔴 | F31 V3 |
| **Pause forcée ergonomie** | 🔴 | F32 V3 boîte à outils |
| **Score santé exécutive** | 🔴 | F31 V3 (burnout) |
| **Time saved metric** | 🟡 | F14 V1 (traçabilité Langfuse) |
| **Decision velocity** | 🟡 | F14 V1 |
| **Strategic ratio** | 🔴 | Pas dans roadmap. Idée intéressante post-V2 |
| **Quarterly review automatique** | 🔴 | F33 V3 (post-mortem auto) |
| **AI transparency badges** | 🟡 | F14 V1 mais préparation OK v0.5 |
| **Components gallery** | 🟢 | Pertinent v0.5 (DS gouvernance) |
| **Settings page** | 🟢 | Légitime v0.5 (paramètres utilisateur de base) |

## 2. Verdict synthétique

### Ce qui est conforme v0.5 (75 % du bundle)

✅ Structure 13 pages, scope fonctionnel, architecture SQLite, rituels matin/soir/hebdo, design system Twisty, vocabulaire métier, données réelles importables, tests Playwright, service Windows.

### Ce qui est en avance de 1 phase (V1, ~10 % du bundle)

🟡 Atomic design + tokens hierarchy + ITCSS + perf budget + AI transparency.
**Verdict** : préparation architecturale acceptable en v0.5, ne casse rien. À garder.

### Ce qui est en avance de 2-3 phases (V2/V3, ~15 % du bundle)

🔴 Multi-tenant complet, fully responsive mobile/tablet, PWA, i18n, coaching avancé V3.
**Verdict** : **gros écart avec la roadmap dev v0.5**. Si on livre ça à l'équipe dev en disant "implémente cette maquette", on explose le budget 110 k€ pour aller vers 700 k€+ (cumul V1+V2+V3).

## 3. Conséquences si on lance Claude Design tel quel

### Risque 1 — Confusion équipe dev

Le sprint planning v0.5 dit "10 sem 2.6 ETP 110 k€". La maquette v3 demande implicitement :
- Multi-tenant Supabase RLS (V2 = 20 sem 8 ETP 693 k€)
- PWA mobile + offline (V3 = 16 sem 9 ETP 598 k€)

Si l'équipe dev se trompe d'objectif, on perd **3-4 sprints** de friction.

### Risque 2 — Budget 110 k€ explosé

L'équipe va vouloir "respecter la maquette" et basculer en mode "tout faire d'un coup".
Réalité : la maquette doit être **livrée en plusieurs releases v0.5 → V3**.

### Risque 3 — Refonte tardive

Si on dev v0.5 sans préparer ce qui vient en V1/V2/V3, on devra refaire l'architecture plus tard. C'est l'argument **pour** garder la vision élargie dans la maquette.

### Risque 4 — Dogfood Feycoil dérouté

v0.5 est censée garder Feycoil en dogfood quotidien (matin/soir). La maquette montre Sarah Chen + Northwind. Feycoil va trouver ça abstrait, pas dogfoodable.

## 4. 4 options d'alignement

### Option A — Maquette "vision produit complète" + cadrage explicit dev

**Concept** : la maquette v3 reste telle quelle, mais on ajoute un fichier `17-cadrage-livraison-par-version.md` qui annote chaque feature avec son target version (v0.5 / V1 / V2 / V3).

**Avantages** :
- Vision long-terme partagée (board, investisseurs, recrutement)
- Architecture v0.5 prépare V1/V2 sans surcoût
- Pas de refonte tardive

**Inconvénients** :
- Risque que l'équipe dev confonde maquette et scope sprint
- Nécessite discipline de tagging

**Coût** : 30 min pour produire le fichier de cadrage.

### Option B — Maquette dev v0.5 stricte (mono-user Feycoil desktop)

**Concept** : on retire de la maquette tout ce qui est V1+ :
- Suppression multi-tenant → retour à Feycoil + MHSSN/AMANI/ETIC
- Suppression mobile + tablet → desktop only
- Suppression i18n → FR uniquement
- Suppression coach prompts hebdo, score santé, mirror moments → ces patterns coaching restent en idée pour V3
- Maintien : friction positive, recovery, time-of-day (légers, cohérents)

**Avantages** :
- 100 % aligné roadmap dev v0.5
- Budget 110 k€ tenable
- Feycoil dogfood facile

**Inconvénients** :
- On a "perdu" 3-4h de travail sur les ressources V1/V2/V3
- Pas de vision long-terme dans la maquette
- Refonte design probable pour V1+V2+V3

**Coût** : 4-6h pour rétro-pédaler les ressources et le prompt.

### Option C — Hybride 2 maquettes

**Concept** : 2 livrables Claude Design distincts :
1. **Maquette v0.5 dev** (mono-user Feycoil, desktop only, FR only, sans coaching avancé) → utilisée par l'équipe dev pour le sprint
2. **Maquette "vision produit" v0.5+V1+V2+V3** (Northwind, responsive, multilingue, coaching) → utilisée pour board / investisseurs / vision

**Avantages** :
- Clair pour chaque audience
- Pas de confusion équipe dev
- Vision long-terme préservée

**Inconvénients** :
- **2× le travail Claude Design**
- Maintenance double quand le DS évolue
- Risque de divergence entre les 2 maquettes

**Coût** : 2× sessions Claude Design (~3-4h chacune).

### Option D — Maquette v3 conservée + roadmap mise à jour (recadrer la cible)

**Concept** : tu décides que la **roadmap doit évoluer** pour intégrer ces nouveaux ambitions. v0.5 devient une "v0.5 SaaS-ready" qui prépare la commercialisation dès le départ. Conséquences :
- Budget v0.5 : 110 k€ → 200 k€ (+ 8-10 sem)
- Démarrage V1 décalé de 2 mois
- Multi-tenant et responsive partiellement intégrés en v0.5 (architecture, pas features complètes)

**Avantages** :
- Cohérence stratégique full produit-SaaS
- Levée de fonds plus crédible (produit visualisable)
- Pas de refonte mid-trajectoire

**Inconvénients** :
- Décale tout le calendrier
- Augmente le budget v0.5 de 80 %
- Demande nouvelle ADR + buy-in équipe

**Coût** : 1 ADR à rédiger + reschedule sprints.

## 5. Recommandation expert

**Option A est la plus pragmatique.**

Voici pourquoi :

1. **Une maquette ≠ un sprint plan.** Une maquette de design produit doit montrer la vision complète, pas seulement le scope du sprint courant. Sinon on doit re-designer à chaque release. C'est exactement la règle chez Linear, Notion, Stripe.

2. **L'équipe dev doit savoir lire un mockup avec un mapping de version.** C'est un livrable supplémentaire (1 fichier markdown), pas un re-travail.

3. **Le bénéfice "preuve visuelle de la trajectoire" vaut plus que le risque "confusion équipe"** si la communication est claire.

4. **Le coût Option B (rétro-pédaler) est élevé et fait perdre de la valeur** acquise sur les patterns coaching, l'architecture atomique, le tenant model.

5. **Option D (re-scope roadmap)** doit être un choix CEO conscient, pas une dérive design.

### Ce qu'il faut produire en plus pour Option A

Un fichier `17-cadrage-livraison-par-version.md` qui :
- Pour chaque écran, dit explicitement "v0.5 / V1 / V2 / V3"
- Pour chaque feature transversale (multi-tenant, responsive, i18n, coaching), dit la version target
- Est joint à la maquette pour l'équipe dev
- Sert de référence pour les sprint plannings ultérieurs

Et **mettre à jour le prompt v3** :
- En préambule : "cette maquette représente la vision produit v0.5+V1+V2+V3, pas seulement le sprint v0.5"
- Dans les annotations dev par page : ajouter `target version : v0.5 / V1 / V2 / V3`

## 6. Questions ouvertes pour Feycoil

1. **L'équipe dev v0.5 démarre quand ?** Si c'est dans 2-4 semaines, le risque de confusion est élevé.
2. **Y a-t-il une démarche de levée de fonds ou board** dans les 3 prochains mois ? Si oui, la maquette "vision" est précieuse → Option A.
3. **L'équipe dev est-elle senior et capable de lire un mapping de version ?** Si oui, Option A. Si junior, Option B.
4. **Roadmap v0.5 (110 k€) figée par contrat ou exploratoire ?** Si figée, Option A (laisser scope dev intact). Si exploratoire, Option D possible.

## 7. État réel du bundle après cet audit

Sur les 14 ressources :

| Ressource | Statut |
|---|---|
| 01-tokens.json | 🟢 v0.5 conforme |
| 02-colors_and_type.css | 🟢 v0.5 conforme |
| 03-spec-extraits.md | 🟢 v0.5 conforme |
| 04-pages-detail.md | 🟢 v0.5 conforme (13 pages) |
| 05-persona.md (legacy) | 🟢 v0.5 conforme (Feycoil) |
| 06-composants-catalogue.md | 🟢 v0.5 conforme + préparation V1 |
| 07-datasets-elargi.md (legacy) | 🟢 v0.5 conforme (MHSSN/AMANI/ETIC) |
| 08-patterns-techniques.md | 🟡 mixte v0.5 + V1 (command palette V1, motion v0.5) |
| **09-tenant-demo-personae.md** | 🔴 **V2 features** (multi-tenant, vocabulary, Sarah Chen) |
| **10-coaching-patterns.md** | 🔴 **V3 features** (coach prompt, mirror moments, score santé) |
| **11-responsive-spec.md** | 🔴 **V3 features** (mobile, tablet, PWA) |
| **12-i18n-spec.md** | 🔴 **Hors roadmap** |
| **13-architecture-atomique.md** | 🟡 V1 (F18 design system étendu) mais cohérent v0.5 |
| **14-microcopy-principes-impact.md** | 🟡 microcopy v0.5 OK, score santé V3, time saved V1 |
