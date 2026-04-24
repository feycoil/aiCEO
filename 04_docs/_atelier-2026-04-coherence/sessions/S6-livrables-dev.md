# S6 — Livrables dev (onboarding, OpenAPI, runbook)

*Statut : 🔬 ouverte 2026-04-24*

## 1. Contexte

L'audit de cohérence (`AUDIT-COHERENCE-2026-04-24.md` §P1-5) note que l'audience **CTO/dev interne** est couverte à **~70 %** mais avec trois manques précis :
- pas d'onboarding dev pour un nouvel entrant (clone → premier serveur qui tourne → premier commit),
- pas de spec OpenAPI 3.0 pour l'API REST (contrat pour Claude dans Cowork V1+ et tout intégrateur futur),
- pas de runbook ops pour les modes de panne (import Outlook qui échoue, clé Anthropic expirée, Service Windows qui ne démarre pas).

S6 tranche le **format**, la **portée**, le **stockage** et le **maintien** de ces trois livrables.

## 2. État des lieux

### Ce qui existe déjà
- **`03_mvp/README.md`** — README racine MVP v0.4 (commandes npm, port, pré-requis). Quasi-onboarding mais non structuré comme tel.
- **`04_docs/SPEC-TECHNIQUE-FUSION.md`** §1-5 — stack Node 20 + Express + better-sqlite3 + vanilla JS, schéma SQLite complet (13 tables), découpage modules. Quasi-onboarding "matière brute" mais orienté spec cible v0.5, pas "comment je démarre demain matin".
- **`04_docs/SPEC-TECHNIQUE-FUSION.md`** §6 — catalogue de ~40 endpoints REST répartis sur 14 domaines (Tâches, Décisions, Projets, Groupes, Contacts, Arbitrage, Soir, Délégations, Calendrier, Mails, Revues, Cockpit, Copilote, Settings). Matière brute pour l'OpenAPI.
- **`04_docs/06-architecture.md`** — carte large V1→V3 (ingestion, graphe de contexte, agent cognitif, scalabilité).
- **`03_mvp/src/`** — 8 modules (`arbitrage`, `drafts`, `emails-context`, `evening`, `llm`, `prompt`, `anthropic-client`, `json-robust`).

### Ce qui manque
- Un **fichier `ONBOARDING-DEV.md`** qui prend un dev par la main : checkout, npm install, `.env`, premier `npm run dev`, premier serveur tournant, premier endpoint curled, conventions de commit, où coder quoi.
- Une **spec OpenAPI 3.0** (`openapi.yaml` ou `.json`) qui décrit formellement les ~40 endpoints : chemin, méthode, paramètres, corps attendu, réponses, codes HTTP. C'est le **contrat** que Claude dans Cowork V1+ lira pour dialoguer avec l'app sans guesser.
- Un **runbook ops** qui liste les modes de panne connus avec diagnostic + remède : "l'import Outlook plante avec erreur X → faire Y", "la clé Anthropic retourne 401 → renouveler + redémarrer Service", "le Service Windows ne démarre pas → logs dans Z, commande PowerShell de reset".

### Contraintes héritées des sessions précédentes
- **S1** — continuité d'usage : le runbook doit couvrir **v0.4 qui tourne en ce moment** ET **v0.5 en cours de déploiement**, parce que les deux coexisteront pendant la fusion.
- **S3** — hiérarchie des sources : `ONBOARDING-DEV.md` **doit pointer vers** `SPEC-TECHNIQUE-FUSION.md` comme source canonique architecture, pas dupliquer. Règle = pas de contenu fork.
- **S4** — équipe v0.5 : 2 fullstack devs + 0,3 product designer + 0,3 PMO. Les 2 fullstack sont les **premiers lecteurs** de l'onboarding. Budget 10 sem / 110 k€, donc l'onboarding doit les rendre productifs à **J+2 max**.
- **S5** — un livrable par audience : on peut avoir un `ONBOARDING-DEV.md` (interne) et un potentiel `ONBOARDING-DEV-EXTERNE.md` plus tard si on ouvre à un contractor ou un partenaire tech. Pour l'instant, interne suffit.

## 3. Audiences

| # | Audience | Horizon | Priorité S6 |
|---|---|---|---|
| 1 | **Dev interne v0.5** — 2 fullstack qui rejoignent l'équipe en S1 fusion (05/05 → 11/05) | immédiate (2 sem) | **P0** |
| 2 | **Claude dans Cowork** (futur) — agent IA qui dialoguera avec l'API REST en V1+ | V1 (post-v0.5) | **P1** (OpenAPI) |
| 3 | **Dev externe futur** — contractor, partenaire tech, intégrateur V2+ | V2+ (post-comité) | **P2** (parqué) |
| 4 | **Ops / support** (futur, CEO pair compris) — quelqu'un qui doit débugger une install en panne | v0.5 + post-CEO-pair | **P1** (runbook) |

L'audience P0 gouverne le format : l'onboarding est écrit **pour les 2 devs qui arrivent le 05/05**.

## 4. Questions à trancher

### Q1 — Format : monolithique ou éclaté ?

- **Option A (monolithique)** — un seul `ONBOARDING-DEV.md` gros qui absorbe tout (install + conventions + runbook + pointeur OpenAPI). Lecture linéaire, facile à maintenir.
- **Option B (éclaté, standard OSS)** — trois fichiers distincts : `ONBOARDING-DEV.md` (clone → premier commit), `CONTRIBUTING.md` (conventions, PR process, tests), `RUNBOOK-OPS.md` (modes de panne). C'est le pattern GitHub/OSS standard que Claude dans Cowork reconnaît aussi.
- **Option C (éclaté minimal)** — deux fichiers : `ONBOARDING-DEV.md` (install + conventions fusionnées) + `RUNBOOK-OPS.md` (ops). Pas de `CONTRIBUTING.md` séparé parce qu'équipe de 2 → pas besoin de PR process formalisé.

**Reco** : **C (éclaté minimal)**. Équipe 2,6 ETP ne justifie pas la cérémonie OSS complète. Deux fichiers : un pour démarrer, un pour dépanner. Si on ouvre à un contractor en V2, on extrait `CONTRIBUTING.md` à ce moment.

### Q2 — OpenAPI : hand-written maintenant ou généré plus tard ?

- **Option A (hand-written maintenant depuis SPEC §6)** — je dérive `openapi.yaml` directement de `SPEC-TECHNIQUE-FUSION.md` §6 (catalogue ~40 endpoints). **Coût** : ~1,5 j de travail doc. **Bénéfice** : contrat disponible dès J0 pour Claude dans Cowork V1, et gap audit P1-5 fermé maintenant.
- **Option B (généré depuis code v0.5 via décorateurs)** — on ajoute Zod + `zod-to-openapi` (ou similaire) au stack v0.5, les routes auto-génèrent l'OpenAPI à chaque build. **Coût** : ~0,5 j d'infra dans S1 fusion. **Bénéfice** : l'OpenAPI reste **synchronisé avec le code par construction** — aucune dérive possible.
- **Option C (hybride)** — A pour **J0** (contrat visible tout de suite, figé sur SPEC §6), puis bascule vers B quand le code v0.5 atteint parité avec la spec (~Sprint 3/4). Le hand-written devient source de vérité jusqu'à la bascule, puis le généré reprend la main.

**Reco** : **C (hybride)**. A pur gèle la dérive code↔doc au bout de 2 mois. B pur retarde le livrable P0 (audit ouvert pendant 6 sem). C donne le contrat **maintenant** ET le synchronisme **à la fin**. La bascule A→B est une tâche dans le roadmap v0.5, pas une décision ultérieure.

### Q3 — Portée du runbook : minimal MVP ou exhaustif ?

- **Option A (minimal)** — 5-8 modes de panne vécus en vrai (Outlook COM qui crashe, clé Anthropic expirée, port 3000 occupé, Service Windows qui ne boote pas, SQLite lock). Courte (~4 pages), utile immédiatement.
- **Option B (exhaustif)** — tout ce qui peut casser théoriquement (réseau, firewall, COM, OAuth Graph V1, Supabase down V1, etc.). Long (~15 pages), anticipe V1+.
- **Option C (minimal vivant)** — A + règle explicite : **toute nouvelle panne diagnostiquée en prod donne lieu à une entrée runbook dans le sprint en cours**. Le runbook grossit organiquement, guidé par la réalité, pas l'anticipation.

**Reco** : **C (minimal vivant)**. La règle "chaque panne → entrée runbook" transforme le doc en artefact utile et non en fiction prospective. C'est aussi un garde-fou contre l'oubli (dette tech cachée).

### Q4 — Stockage : `04_docs/` ou `03_mvp/` ?

- **Option A (tout dans `04_docs/`)** — cohérent avec fascicules 01-08 et livrables externes S5. Bonus : versionné avec le reste du dossier produit, visible d'un coup d'œil dans `00-README.md`.
- **Option B (tout dans `03_mvp/`)** — cohérent avec le repo code, le dev clone le repo et trouve les docs là où il code. Inconvénient : silo Cowork (OneDrive) ne voit pas ces docs.
- **Option C (hybride par nature)** — `ONBOARDING-DEV.md` et `RUNBOOK-OPS.md` dans **`03_mvp/docs/`** (vivent avec le code, les devs les éditent dans leur IDE avec le reste). `openapi.yaml` dans **`03_mvp/docs/`** aussi (généré depuis le code en Q2-C). **Pointeurs** dans `04_docs/00-README.md` §"Livrables dev" et dans `SPEC-TECHNIQUE-FUSION.md` pour que le dossier produit sache où ils sont.

**Reco** : **C (hybride par nature)**. La doc dev est **proche du code** (meilleure co-évolution, pas de dérive), mais **découvrable depuis `04_docs/`** (le CEO et tout audit retrouvent tout d'un clic). C'est aussi cohérent avec la règle S3 de hiérarchie des sources : `03_mvp/docs/` = source canonique "doc d'exécution", `04_docs/` = source canonique "doc d'intention" qui pointe vers elle.

### Q5 — Maintien : qui, quand ?

- **Option A (maintien actif)** — chaque sprint v0.5 livre une mise à jour ONBOARDING + RUNBOOK si le périmètre change. Intégré à la definition of done.
- **Option B (maintien trimestriel)** — revue des 3 docs à chaque jalon (v0.5, V1, V2). Entre-temps, dérive possible.
- **Option C (maintien continu + revue trimestrielle)** — A pour le flux normal, B comme filet de sécurité (audit systématique trimestriel dans `GOUVERNANCE.md`).

**Reco** : **C (continu + filet)**. Identique au pattern S3 (règle drafts 4 sem + audit trimestriel). Même logique de gouvernance : le flux normal gère 90 %, l'audit trimestriel attrape les 10 % oubliés.

## 5. Bundle reco (tout en un)

Si la CEO dit "bundle reco" :

| Q | Reco | Effet |
|---|---|---|
| Q1 | **C** — éclaté minimal (`ONBOARDING-DEV.md` + `RUNBOOK-OPS.md`) | 2 fichiers, pas 3. Pas de CONTRIBUTING.md tant que l'équipe est < 4 personnes. |
| Q2 | **C** — hybride, hand-written maintenant, généré en Sprint 3-4 v0.5 | Contrat OpenAPI visible à J0, bascule vers génération automatique quand le code v0.5 atteint parité. |
| Q3 | **C** — minimal vivant (règle : chaque panne → entrée runbook) | Runbook démarre léger (~5-8 entrées), grossit organiquement. |
| Q4 | **C** — hybride par nature (`03_mvp/docs/` + pointeurs dans `04_docs/00-README.md`) | Doc dev co-habite avec le code, reste découvrable depuis le dossier produit. |
| Q5 | **C** — maintien continu + audit trimestriel (règle dans `GOUVERNANCE.md`) | Même pattern que S3 (drafts 4 sem + audit trimestriel). |

### Livrables si bundle reco accepté

1. **ADR** `2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook` dans `00_BOUSSOLE/DECISIONS.md`.
2. **Fichier `03_mvp/docs/ONBOARDING-DEV.md`** — squelette complet (install, .env, npm scripts, structure `src/`, conventions de commit, pointeurs vers SPEC-TECHNIQUE-FUSION et RUNBOOK). Premier jet basé sur le `README.md` racine + les 8 modules existants.
3. **Fichier `03_mvp/docs/RUNBOOK-OPS.md`** — squelette avec 5-8 modes de panne connus (Outlook COM, clé Anthropic, port 3000, SQLite lock, Service Windows). Règle de maintenance explicitement documentée en tête.
4. **Fichier `03_mvp/docs/openapi.yaml`** — spec OpenAPI 3.0 hand-written dérivée de `SPEC-TECHNIQUE-FUSION.md` §6 (~40 endpoints, 14 domaines). **Note de production** : à produire en sprint dédié S2 du plan audit (12/05 → 18/05), trop volumineux pour S6.
5. **Patch `04_docs/00-README.md`** — nouvelle section "Livrables dev" pointant vers les 3 fichiers `03_mvp/docs/`.
6. **Patch `04_docs/SPEC-TECHNIQUE-FUSION.md`** §6 — encadré "Voir `03_mvp/docs/openapi.yaml` pour la spec formelle OpenAPI 3.0 dérivée de cette section".
7. **Note dans `_atelier-2026-04-coherence/JOURNAL.md`** — S6 close, livrables produits, reste à faire (openapi.yaml production S2 plan audit).

### Ce que S6 ne produit PAS (parqué explicitement)

- **`CONTRIBUTING.md` séparé** — parqué tant que l'équipe < 4. À ré-ouvrir si contractor V2+.
- **`ONBOARDING-DEV-EXTERNE.md`** — parqué jusqu'à ouverture à un contractor / partenaire tech post-V2.
- **Bascule OpenAPI généré depuis code** — tâche à créer en issue GitHub (`infra/openapi-generated-from-code`, scope MVP, priorité P1), exécution Sprint 3-4 v0.5.
- **Runbook exhaustif V1+** — le runbook grossit organiquement selon règle Q3-C. Pas de production en avance de phase.

## 6. Décisions

CEO : **bundle reco validé** (24/04/2026).

| Q | Décision | Rationale en une ligne |
|---|---|---|
| Q1 — Format | **Éclaté minimal** (2 fichiers : ONBOARDING-DEV + RUNBOOK-OPS) | Équipe < 4 personnes → pas besoin de CONTRIBUTING.md séparé pour l'instant. |
| Q2 — OpenAPI | **Hybride** : hand-written maintenant (S2 plan audit) → généré en Sprint 3-4 v0.5 | Contrat visible à J0 pour Claude dans Cowork ; synchronisme code↔doc garanti in fine. |
| Q3 — Portée runbook | **Minimal vivant** : démarrage 5-8 pannes + règle "chaque panne → entrée" | Artefact utile, pas de fiction prospective. Grossit organiquement. |
| Q4 — Stockage | **Hybride par nature** : `03_mvp/docs/` + pointeurs `04_docs/00-README.md` | Doc dev co-habite avec le code (co-évolution), reste découvrable depuis le dossier produit. |
| Q5 — Maintien | **Continu + audit trimestriel** (mutualisé avec drafts S3, règle à formaliser en S7) | Même pattern de gouvernance : flux normal gère 90 %, audit attrape 10 %. |

## 7. Livrables produits

1. **ADR** `2026-04-24 · Livrables dev : onboarding, OpenAPI, runbook` dans `00_BOUSSOLE/DECISIONS.md` — contexte, 5 options, décision bundle, 6 conséquences.
2. **`03_mvp/docs/ONBOARDING-DEV.md`** — 10 sections : pré-requis, premier démarrage (15 min), structure repo, 8 modules `src/` (tableau), commandes npm, conventions 2026, flux dev type, pointeurs doc, FAQ premier jour, maintien. Source canonique architecture explicitement = SPEC-TECHNIQUE-FUSION (pas de dupliquer).
3. **`03_mvp/docs/RUNBOOK-OPS.md`** — 7 sections de pannes : serveur (port occupé, module manquant), clé Anthropic (mode démo bloqué, 401), import Outlook (rien, envoyés vides, inférence sur-active), réseau corp (install SSL, timeout), JSON/OneDrive (NUL corruption), Service Windows v0.5 (ébauche), mode démo/données (UI vide, emails démo parasites) + règle de maintenance en tête.
4. **Patch `04_docs/00-README.md`** — nouvelle section "Livrables dev (audience CTO / dev interne)" après "Livrables externes", listant les 3 fichiers + parqués.
5. **Patch `04_docs/SPEC-TECHNIQUE-FUSION.md` §6** — encadré de renvoi vers `../03_mvp/docs/openapi.yaml` + note sur la bascule hand-written → généré en Sprint 3-4.
6. **Clôture S6** dans `_atelier-2026-04-coherence/JOURNAL.md`.

**Non produit en S6 (parqué, avec chemin de rattrapage) :**
- `03_mvp/docs/openapi.yaml` → sprint production S2 plan audit (12/05 → 18/05).
- Issue GitHub `infra/openapi-generated-from-code` à ouvrir manuellement (scope MVP, P1, Sprint 3-4 v0.5).

## 8. À reprendre en aval

- **S7** — patch `GOUVERNANCE.md` pour formaliser la règle "maintien continu + audit trimestriel" des livrables dev (mutualiser avec la même règle déjà prévue pour drafts S3).
- **S8** — valider que les 3 livrables dev sont cohérents avec SPEC-TECHNIQUE-FUSION (pas de dérive contenu).
- **Sprint production openapi.yaml** — S2 du plan audit (12/05 → 18/05), ~1,5 j de travail doc sur la base de SPEC-TECHNIQUE-FUSION §6.
- **Issue GitHub** `infra/openapi-generated-from-code` — à ouvrir manuellement, scope MVP, priorité P1, exécution Sprint 3-4 v0.5.
