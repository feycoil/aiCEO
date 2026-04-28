# Cadrage livraison par version — aiCEO v0.5 → V3

> **Lecture impérative pour l'équipe dev avant tout sprint planning.**
> Ce document mappe chaque feature de la maquette à sa version target dans la ROADMAP officielle (`04_docs/08-roadmap.md` v3.0).
> Source : ADR `2026-04-26 · Bundle design Claude Design v3.1 — cible visuelle V1 + re-mapping cadrage par version`.

## ⚠ Mise à jour 26/04/2026 (post-ADR insertion v0.6)

Nouvelle structure : **6 paliers** au lieu de 5 (v0.4 / v0.5 / **v0.6** / V1 / V2 / V3). Le palier **v0.6 "Interface finalisée"** absorbe la majorité des features visuelles de la maquette (DS atomic, composants, microcopy, WCAG AA, coaching léger, onboarding simple, settings basique, components gallery), laissant V1 se concentrer sur les 6 thèmes fonctionnels (multi-tenant + équipes + intégrations + mobile + backup + logs).

### Re-mapping par version

- **Refonte UI complète selon maquette Claude Design v3.1** : **`[v0.6]`** ⭐ NOUVEAU (DS atomic + 16 composants + 13 pages refondues + microcopy FR + WCAG AA)
- **Patterns coaching légers** (time-of-day, friction positive, recovery streak break, posture footer) : **`[v0.6]`** ⭐ NOUVEAU
- **Onboarding wizard simple** (5 étapes désactivable) : **`[v0.6]`** ⭐ NOUVEAU
- **Settings page basique** (4 sections sans multi-tenant) : **`[v0.6]`** ⭐ NOUVEAU
- **Components gallery** mini-storybook : **`[v0.6]`** ⭐ NOUVEAU
- **Audit accessibilité externe** : **`[v0.6]`** ⭐ NOUVEAU
- **Multi-tenant Northwind + vocabulary configurable + switcher tenant** : **`[V1]`** (thème 1)
- **Mobile responsive + tablet + PWA + bottom-tab nav + FAB + bottom sheets** : **`[V1]`** (thème 4)
- **Permissions multi-rôles + délégation E2E** : **`[V1]`** (thème 2)
- **Intégrations Teams/Notion/Slack + webhooks** : **`[V1]`** (thème 3)
- **Backup chiffré automatique** : **`[V1]`** (thème 5)
- **Logs winston + Langfuse** : **`[V1]`** (thème 6)
- **i18n FR + EN activé** : **`[V2]`** (architecture posée techniquement v0.6 sans activation EN)
- **RTL prep AR/HE** : **`[V2]`**
- **Coach Opus hebdo + mirror moments + score santé + self-talk monitoring + pause forcée + post-mortem auto** : **`[V3]`**
- **Offline-first + multi-CEO écosystème** : **`[V3]`**

→ La maquette représente toujours la vision V1 SaaS complète, mais son implémentation se fait en 2 paliers : **v0.6 (UI uniquement)** puis **V1 (features fonctionnelles)**.

## 1. Posture de la maquette

**La maquette représente la vision produit complète v0.5 → V3.**
Elle est conçue pour 4 audiences :

1. **Équipe dev v0.5** : ne livre que les features taggées `v0.5` dans le sprint courant. Les features `V1/V2/V3` servent de référence visuelle pour préparer l'architecture.
2. **Board / investisseurs** : maquette complète avec coaching, multi-tenant, mobile.
3. **Recrutement / partenaires** : démontre la trajectoire produit ambitieuse.
4. **Feycoil dogfood** : l'app v0.5 réelle qu'il utilise reste mono-user (lui), mais il sait que Sarah Chen incarne le futur SaaS.

## 2. Mapping feature × version (référentiel)

### Pages (16 pages dans la maquette)

| Page | v0.5 | V1 | V2 | V3 |
|---|:-:|:-:|:-:|:-:|
| `index.html` (cockpit) | ✅ structure + données mono-user | refonte avec compteurs proactifs Inngest | ouvre vue rôles | ajoute coach mode |
| `arbitrage.html` | ✅ rule-based | + reco LLM enrichies | — | + coach contextuel |
| `evening.html` | ✅ humeur + énergie + top 3 | + suggestions auto Claude | — | + journal reconnaissance + détection burnout |
| `taches.html` | ✅ liste + Eisenhower | + sub-agents auto-classement | + délégation E2E visible côté destinataire | — |
| `agenda.html` | ✅ vue semaine Outlook COM | + Graph API webhooks proactifs | — | + offline ElectricSQL |
| `revues.html` | ✅ revue manuelle | + auto-draft Claude | — | + post-mortem auto + score santé |
| `assistant.html` | ✅ chat SSE Claude | + sub-agents spécialisés | + mentions Teams | + coach mode Opus |
| `groupes.html` | ✅ desktop, 3 entités Feycoil | — | switcher tenant + permissions | — |
| `projets.html` | ✅ desktop | + viz radiale + arbre | — | — |
| `projet.html` | ✅ template paramétré | + timeline décisions | — | — |
| `contacts.html` | ✅ desktop | + matrice confiance auto | + vues équipe | — |
| `decisions.html` | ✅ desktop, reco Claude | + tracking auto-décision | + canvas tldraw collab | — |
| `onboarding.html` | ❌ pas v0.5 (mono-user dogfood) | wizard simple Feycoil | wizard multi-tenant | + onboarding mobile |
| `settings.html` | ✅ basique (intégrations, sécurité) | + observabilité Langfuse | + multi-tenant config | + offline + coach prefs |
| `components.html` (gallery) | ✅ DS étendu | F18 design system étendu | — | — |
| `index-nav.html` | ✅ desktop | — | + tenant switcher | — |

### Features transversales

| Feature | v0.5 | V1 | V2 | V3 | Source roadmap |
|---|:-:|:-:|:-:|:-:|---|
| **SQLite local** | ✅ | migration Postgres Supabase | — | + ElectricSQL sync | §3.2 / §4 |
| **Outlook COM PowerShell** | ✅ | → Graph API OAuth msal-node | — | — | F6 / V1 §4 |
| **Claude Sonnet réactif** | ✅ | + Opus + sub-agents Inngest | — | + coach Opus | F10 / V1 §4 |
| **Mémoire LT** | ❌ | pgvector 3 strates | — | — | F11 / V1 §4 |
| **Drawer collapsible desktop** | ✅ | — | — | — | F18 anticipé |
| **Command palette ⌘K** | ✅ démo simple | F18 complet | — | — | F18 / V1 |
| **Multi-tenant + RLS Supabase** | ❌ | ✅ V1 thème 1 (80 k€) | — | — | V1 §4 (re-mappé 26/04) |
| **Vocabulary configurable (houses)** | ❌ | ✅ V1 thème 1 | — | — | V1 (re-mappé) |
| **Switcher tenant + theme custom** | ❌ | ✅ V1 thème 1 | — | — | V1 (re-mappé) |
| **Permissions multi-rôles** | ❌ | ✅ V1 thème 2 (50 k€) | — | — | V1 (re-mappé) |
| **Délégation end-to-end** | ❌ | ✅ V1 thème 2 | — | — | V1 (re-mappé) |
| **Mobile responsive (390px)** | ❌ | ✅ V1 thème 4 (70 k€) | — | — | V1 (re-mappé) |
| **Tablet responsive (1024px)** | ❌ | ✅ V1 thème 4 | — | — | V1 (re-mappé) |
| **PWA + service worker** | ❌ | ✅ V1 thème 4 | — | — | V1 (re-mappé) |
| **Bottom-tab nav + FAB + sheets** | ❌ | ✅ V1 thème 4 | — | — | V1 (re-mappé) |
| **Intégrations Teams + Notion + Slack** | ❌ | ✅ V1 thème 3 (60 k€) | — | — | V1 (re-mappé) |
| **Backup automatique + chiffrement at-rest** | ❌ | ✅ V1 thème 5 (20 k€) | — | — | V1 (re-mappé) |
| **Logs winston + Langfuse** | ❌ | ✅ V1 thème 6 (20 k€) | — | — | V1 (re-mappé) |
| **Offline-first** | ❌ | — | — | ✅ F43 | V3 §6 |
| **i18n FR + EN** | ❌ | architecture préparée | ✅ F29 activé | — | V2 §5 (acté 26/04) |
| **RTL prep (AR/HE)** | ❌ | — | ✅ F30 | — | V2 §5 |
| **RTL prep** | ❌ | — | — | hors roadmap | aucune |
| **WCAG AA basique** | ✅ | + AAA cockpit | + audit complet | — | bonne pratique |
| **Skip links + focus visible** | ✅ | — | — | — | bonne pratique |
| **Coach prompt assistant hebdo** | ❌ | — | — | ✅ F29 | V3 §6 |
| **Mirror moments hebdo** | ❌ | — | — | ✅ F29-F32 | V3 §6 |
| **Self-talk monitoring** | ❌ | — | — | ✅ F31 | V3 §6 |
| **Score santé exécutive** | ❌ | — | — | ✅ F31 | V3 §6 |
| **Time saved metric** | ❌ | ✅ F14 | — | — | V1 §4 |
| **Decision velocity** | ❌ | ✅ F14 | — | — | V1 §4 |
| **Strategic ratio cockpit** | ❌ | partiel | partiel | — | non roadmap mais cohérent V1 |
| **Pause forcée ergonomie** | ❌ | — | — | ✅ F32 | V3 §6 |
| **Posture stratégique footer** | ✅ minimaliste | — | — | + intégré coach mode | acceptable v0.5 |
| **Friction positive (5e P0)** | ✅ | — | — | — | acceptable v0.5 |
| **Recovery streak break** | ✅ | — | — | — | acceptable v0.5 |
| **Time-of-day adaptation** | ✅ minimaliste | — | — | — | acceptable v0.5 |
| **AI transparency badges** | ✅ basiques | F14 V1 complet | — | — | F14 anticipé |
| **Drag & drop accessible** | ✅ | — | — | — | bonne pratique |
| **Atomic design + tokens 3 niveaux** | ✅ | — | — | — | F18 anticipé v0.5 |
| **ITCSS architecture** | ✅ | — | — | — | bonne pratique v0.5 |
| **SVG sprite + service worker cache** | ✅ partiel | — | — | + offline complet | bonne pratique v0.5 |
| **Quarterly review automatique** | ❌ | — | — | ✅ F33 | V3 §6 |

### Données (datasets)

| Donnée | v0.5 | V1+ |
|---|:-:|:-:|
| Tenant Feycoil/MHSSN/AMANI/ETIC (réel) | ✅ usage dogfood | ✅ |
| Tenant démo Sarah Chen/Northwind (fictif) | ❌ pour le dev | ✅ pour la maquette + V2 multi-tenant |
| 28 tâches MHSSN/AMANI/ETIC réelles | ✅ dogfood | — |
| 25 tâches Northwind fictives | ❌ dev | ✅ maquette only |
| 25 contacts MHSSN réels | ✅ dogfood | — |
| 25 contacts Northwind fictifs | ❌ dev | ✅ maquette only |

## 3. Lecture pour l'équipe dev v0.5

**Périmètre du sprint planning v0.5** = uniquement features taggées `✅ v0.5` dans les tableaux ci-dessus.

Concrètement :

### À LIVRER en v0.5 (110 k€, 10 sem, 2.6 ETP)

- 13 pages `03_mvp/public/*` desktop
- SQLite local + zéro localStorage
- Outlook COM PowerShell (pas Graph API)
- Cockpit + arbitrage + evening + taches + agenda + revues + assistant + groupes + projets + projet + contacts + decisions
- Drawer collapsible desktop
- Command palette ⌘K version simple
- Service Windows + raccourci desktop
- Tests Playwright e2e
- WCAG AA + skip links + focus visible
- Atomic design + tokens 3 niveaux + ITCSS (architecture, pas refonte)
- Friction positive (5e P0)
- Recovery streak break
- Time-of-day adaptation simple
- AI transparency badges basiques
- Posture stratégique footer minimaliste
- Données réelles Feycoil/MHSSN/AMANI/ETIC

### À NE PAS LIVRER en v0.5 (réservé V1/V2/V3)

- ❌ Multi-tenant : retirer toute logique tenant (vocabulary configurable, switcher, theme)
- ❌ Mobile + tablet + PWA + bottom-tab nav + FAB + bottom sheets
- ❌ Offline-first
- ❌ i18n (rester FR uniquement, hardcoded)
- ❌ Onboarding wizard (Feycoil dogfood, pas de wizard)
- ❌ Coach prompt hebdo + mirror moments + self-talk monitoring
- ❌ Score santé exécutive + decision velocity + time saved metric
- ❌ Pause forcée ergonomie
- ❌ Quarterly review auto

### Principe d'intégration

L'équipe dev consulte la maquette pour :
- **Comprendre la cible long-terme** (architecture, ergonomie, ton)
- **Préparer l'architecture** (tokens, atomic design, BEM) sans coût v0.5
- **Implémenter uniquement les features `✅ v0.5`**

Si une feature de la maquette n'est pas taggée `v0.5`, elle est **explicitement exclue** du sprint.

## 4. Lecture pour le board / investisseurs

La maquette montre la **trajectoire produit 18 mois** (1.68 M€ cumul, 4 paliers v0.5 → V3) :

- **v0.5 (T2 2026, 110 k€)** : démontré aux features taggées
- **V1 (T3-T4 2026, 290 k€)** : copilote proactif Inngest, Graph API, mémoire pgvector
- **V2 (T1-T2 2027, 693 k€)** : multi-tenant, équipe ETIC, SOC 2
- **V3 (T3-T4 2027, 598 k€)** : coach + mobile + offline + multi-CEO

La maquette **incarne le produit V3 final**, ce qui rend la trajectoire crédible.

## 5. Lecture pour Feycoil (dogfood)

L'app v0.5 que tu utilises au quotidien sera :
- Mono-user (toi, pas Sarah Chen)
- Desktop only (sur ton poste Windows)
- FR uniquement
- 3 groupes réels (MHSSN, AMANI, ETIC) — pas Northwind
- Sans coach hebdo agressif (juste les patterns légers : recovery, friction positive)

La maquette est ton outil de **vision** — pour toi, pour l'équipe, pour le board. L'app dev v0.5 est ton outil de **dogfood**.

## 6. Implications sprint v0.5

### Sprint 1 (S1) — déjà planifié dans la roadmap

Schéma SQLite + migrations + routes API tasks/decisions/contacts/projects/groups + `migrate-from-appweb.js`.

⚠ **Ne PAS ajouter** : tenant_id, user_id, RLS, theming. Ces champs viennent en V2.

### Sprint 2 (S2) — cockpit unifié + arbitrage + evening

Implémenter en utilisant les composants `06-composants-catalogue.md` et les patterns `08-patterns-techniques.md` + `10-coaching-patterns.md` **filtrés au scope v0.5**.

⚠ **Ne PAS ajouter** : coach prompt hebdo, score santé, mobile responsive.

### Sprints 3-4 (S3-S4) — pages travail courant + portefeuille + chat assistant

Idem.

⚠ **Ne PAS ajouter** : multi-langue, switcher tenant, vocabulary configurable.

### Sprint 5 (S5) — Service Windows + tests Playwright + CI

Conforme roadmap.

### Sprint 6 (S6) — scellement v0.5

Conforme roadmap.

## 7. Quand activer les features V1/V2/V3 ?

### V1 (post-v0.5, T3-T4 2026)

Démarrer après scellement v0.5 (`v0.5` tag GitHub).

**Activation features V1 dans la maquette → réelle implémentation** :
- Migration SQLite → Postgres Supabase (S1-S2)
- Graph API OAuth (S2-S4)
- Inngest sub-agents (S5-S8)
- Mémoire pgvector (S9-S11)
- SharePoint RAG (S12)
- Rituels auto-draftés + viz riches (S13-S16)

**À cette étape** : la maquette v3 sert de référence visuelle pour l'équipe.

### V2 (T1-T2 2027)

Démarrer après tag `v1`.

**Activation features V2 dans la maquette → réelle implémentation** :
- Multi-tenant Supabase RLS (S1-S5)
- Vues rôle-spécifiques (S6-S8)
- Délégation E2E (S9-S10)
- Teams (S11-S13)
- Canvas tldraw + agent visible (S14-S16)
- Graphe Cytoscape (S17)
- SOC 2 Type II (S18-S20)

### V3 (T3-T4 2027)

Démarrer après tag `v2`.

**Activation features V3 dans la maquette → réelle implémentation** :
- Coach conversationnel Opus (S1-S4)
- Boîte à outils psychologique (S5-S6)
- Détection burnout active (S7-S8)
- Post-mortem auto (S9-S10)
- Offline-first (S11-S13)
- App mobile PWA (S14-S16)

## 8. Décision pour l'équipe Claude Design

Quand tu génères la maquette, **respecte les annotations dev par page** qui maintenant incluent un champ `target version` pour chaque section/composant. Exemple :

```html
<!--
  Page : index.html (cockpit)
  Routes API consommees :
    - GET /api/cockpit/today          [target: v0.5]
    - GET /api/system/last-sync       [target: v0.5]
    - GET /api/proactive/proposals    [target: V1]
    - GET /api/team/dashboard         [target: V2]

  Composants reutilisables :
    - PageHeader [v0.5]
    - MorningCard [v0.5]
    - EveningCard [v0.5]
    - BigRocksList [v0.5]
    - ProactiveProposals [target: V1]
    - TeamWorkloadCard [target: V2]
    - StrategicInsights [target: V3]

  Patterns coaching presents :
    - Time-of-day adaptation [v0.5]
    - Friction positive [v0.5]
    - Coach prompt hebdo [target: V3]
    - Score sante executive [target: V3]
-->
```

L'équipe dev v0.5 implémente uniquement ce qui est `[v0.5]`. Les autres composants restent visibles dans la maquette comme **placeholders disabled** ou **avec badge "Bientôt — V1"**.

## 9. Visibilité dans la maquette

### Pour les features V1/V2/V3 affichées

Deux options de rendu :

**Option Live** (par défaut)
La feature est rendue normalement, comme si elle était disponible. Avantage : démo plus impressionnante. Inconvénient : équipe dev pourrait la confondre avec scope v0.5.

**Option Placeholder**
La feature est rendue en mode "placeholder disabled" : opacité 50% + badge "Bientôt · V1" / "Bientôt · V2" / "Bientôt · V3" en haut à droite. Avantage : clair pour l'équipe dev. Inconvénient : démo moins fluide.

**Recommandation** : mix selon usage :
- **Pour la démo board / investisseurs** : Live (la maquette doit "vendre" la trajectoire)
- **Pour l'équipe dev** : ajouter un toggle global dans `index-nav.html` "Mode dev" qui bascule en Placeholder pour toutes les features hors v0.5

## 10. Critères de validation maquette par audience

### Validation équipe dev v0.5

- [ ] Annotations dev avec target version présentes
- [ ] Liste explicite des composants `[v0.5]` à implémenter
- [ ] Liste explicite des composants `[V1/V2/V3]` à NE PAS implémenter
- [ ] Mapping API endpoint → version cible
- [ ] Mode "vue dev" disponible dans `index-nav.html`

### Validation board / investisseurs

- [ ] Maquette en mode Live (toutes features visibles)
- [ ] Trajectoire produit visible : v0.5 → V3
- [ ] Coaching, multi-tenant, mobile, i18n incarnés visuellement
- [ ] Cohérence visuelle cross-pages

### Validation Feycoil

- [ ] Une vue "App réelle v0.5" qui montre Feycoil + MHSSN/AMANI/ETIC (pas Northwind)
- [ ] Confirmation que la maquette long-terme ne change pas le scope dogfood quotidien
