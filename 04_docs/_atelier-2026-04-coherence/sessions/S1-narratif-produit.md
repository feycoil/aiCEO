# Session 1 — Narratif produit & trajectoire local→cloud

**Ouverture** : 24/04/2026
**Dissonances ciblées** : C1 (trois narratifs concurrents), C7 (benchmark obsolète)

---

## 1. Contexte

L'audit a montré que trois documents disent trois choses différentes sur ce qu'aiCEO **est** aujourd'hui et ce qu'il **sera** :

- `01-vision.md` → copilote cloud SaaS multi-CEO, coach stratégique, horizon 2027.
- `SPEC-FONCTIONNELLE-FUSION.md` + `SPEC-TECHNIQUE-FUSION.md` → app Node locale Windows mono-poste, SQLite, Service Windows, 10 sprints.
- `03_mvp/` (code livré v0.4) → Node + Express + vanilla JS + JSON + proxy corp, local Windows.
- `04-positionnement.md` → benchmark cloud SaaS (Lattice, Motion, Superhuman, Read.ai, Clara Labs).

Conséquence : le MVP livré est **local Windows**, la vision dit **cloud SaaS**, et le benchmark compare à du cloud SaaS. Quiconque lit deux docs en ressort avec une image contradictoire.

---

## 2. Question centrale

**Est-ce que la trajectoire local-first Windows est :**
**(A) un pont temporaire vers un produit cloud en V1+**,
**(B) la destination finale d'aiCEO (produit souverain local)**,
**ou (C) une étape à compresser pour rebasculer cloud dès v0.5 ?**

De cette réponse découlent : positionnement commercial, ADRs, benchmark, périmètre sécurité, stratégie recrutement CEO pairs ETIC, et la question "le travail v0.5 sur SQLite + Service Windows est-il jetable ?"

---

## 3. Options

### Option A — Local-first comme pont jetable (v0.4 → v0.5), cloud en V1+

**Trajectoire**
- v0.4 / v0.5 : app locale Windows, SQLite, Service Windows, Outlook COM. Mono-utilisateur Feycoil.
- V1 (T3-T4 2026) : bascule cloud sur Supabase (Postgres + pgvector), Graph API OAuth, Inngest crons, backend autonome.
- V2+ : multi-tenant cloud, RLS, Teams, tldraw.

**Ce que ça coûte**
- Le travail v0.5 sur `better-sqlite3`, `node-windows`, PowerShell COM est en partie **jetable** (migration vers Postgres + Graph + Inngest entre V1).
- Doc vision doit être clarifiée : aujourd'hui local, demain cloud, **pourquoi** ce détour.
- Doc positionnement reste aligné sur cloud SaaS à terme, mais précise "MVP / v0.5 en version locale souveraine pour validation interne".

**Ce que ça gagne**
- v0.5 reste conforme aux specs déjà rédigées, aucun chantier supplémentaire.
- Coût infra nul jusqu'à V1 (≈ 1,5 ct/jour en tokens).
- Validation produit sur le CEO pilote sans dépendance cloud ni conformité RGPD multi-tenant.
- Premier CEO pair ETIC peut tester en local sans procédure IT.

**Risque**
- Le MVP local ne préfigure pas le produit cloud — le CEO pair qui teste la version locale peut être déçu par la version cloud V1 (ou inversement).
- Budget V1 revu à la hausse (refonte stack, pas juste ajout de features).

---

### Option B — Local-first comme destination (positionnement "copilote souverain")

**Trajectoire**
- v0.4 / v0.5 / V1 / V2 : tout reste local Windows, évolutions en fonctionnalités (sub-agents locaux, Claude Agent SDK local, mémoire locale chiffrée).
- V3 : option cloud pour les CEO qui le veulent, mais local reste la référence.

**Ce que ça coûte**
- Abandon du multi-tenant cloud V2 tel que spec'é (`SPEC-TECHNIQUE § 4`).
- Les ambitions "Teams Graph + tldraw collaboratif" deviennent plus compliquées (synchronisation P2P ou serveur de relais minimal).
- Marché réduit : vente à des CEO qui acceptent ou demandent du local (ETIC, admin, défense, santé).
- Graph API OAuth peut rester optionnel (COM suffit pour le local).

**Ce que ça gagne**
- Positionnement différenciant net : **"aiCEO — le copilote qui ne quitte jamais votre poste"**.
- Zéro coût infra récurrent pour le produit (coût tokens chez le client ou hébergé par ETIC).
- RGPD / souveraineté / ETIC Mayotte : argument commercial immédiat.
- v0.5 n'est plus jetable — c'est le produit.

**Risque**
- Écosystème ETIC multi-CEO devient compliqué (3 CEO × 3 installations × 3 bases locales, pas de vue consolidée).
- Fonctionnalités collaboratives V2-V3 à repenser.
- Marché global plus petit vs cloud SaaS.

---

### Option C — Accélérer le rebasculement cloud (v0.5 déjà cloud)

**Trajectoire**
- v0.4 reste local (déjà livré).
- v0.5 : skip la phase SQLite locale, partir directement sur Supabase cloud.
- V1+ : continue cloud.

**Ce que ça coûte**
- Jeter ~6 semaines de spec fusion (`SPEC-TECHNIQUE-FUSION.md` §3-5 : schéma SQLite, Service Windows, migration).
- Re-spec fusion v0.5 en mode cloud (4-6 sem de spec + design).
- Retarder v0.5 de 2-3 mois au total.
- Impose OAuth Graph dès v0.5 (plus de COM) → chantier sécurité Azure.
- Dépendance infra cloud dès MVP (Supabase, DNS, certificats, RGPD).

**Ce que ça gagne**
- Un seul narratif "cloud SaaS" cohérent, vision aligné code, positionnement aligné.
- Pas de travail jetable.
- Démo externe plus facile (URL partageable).

**Risque**
- Coût immédiat d'infra (~50-100 €/mois dès v0.5).
- Complexité conformité plus tôt (RGPD, SSO corp, proxy).
- Le CEO pilote perd l'usage immédiat pendant la refonte.
- Les specs fusion déjà rédigées deviennent obsolètes.

---

## 4. Éléments d'aide à la décision

**Arguments pour A (pont jetable)**
- C'est la trajectoire déjà implicite dans les specs (`SPEC-TECHNIQUE §4` évoque déjà Supabase V1+).
- Minimum de travail supplémentaire pour v0.5.
- Cohérent avec la vision long terme cloud.

**Arguments pour B (local souverain)**
- C'est le produit qui existe *réellement* aujourd'hui.
- Positionnement marché différenciant et défendable.
- Aligné avec la mission Mayotte (contextes à connectivité variable, souveraineté).

**Arguments pour C (accélérer cloud)**
- Cohérence documentaire immédiate.
- Facilite recrutement investisseur (pitch SaaS classique).

**Signal fort contre C** : jeter 6 semaines de spec fusion déjà publiée, avec un MVP qui marche en local et apporte déjà 28/28 arbitrages/jour. Coût-bénéfice défavorable.

---

## 5. Décision à prendre

**Choix parmi A / B / C.**

Selon la réponse, les livrables de cette session seront :

### Si A — Pont jetable
- ADR-FUSION-02 "Trajectoire local-first → cloud" dans `DECISIONS.md`
- Patch `01-vision.md` : bloc "État actuel (local) vs horizon (cloud)" en tête
- Patch `04-positionnement.md` : ajoute un §0 "aiCEO aujourd'hui / aiCEO à terme", benchmark split en deux blocs
- Note dans `08-roadmap.md §4 V1` : "refonte stack locale → cloud, budget inclus"

### Si B — Local souverain
- ADR-FUSION-02 "aiCEO — copilote local souverain"
- Réécriture partielle de `01-vision.md` et `04-positionnement.md` : repositionner sur "souverain local"
- Refonte de `08-roadmap.md V1/V2/V3` : adapter les milestones (pas de Supabase, pas de RLS cloud, Teams en version locale ou supprimée)
- Conséquence sur `SPEC-TECHNIQUE §3-4` (V1/V2) : à replanifier

### Si C — Accélérer cloud
- ADR-FUSION-02 "Bascule cloud dès v0.5"
- Archivage des specs fusion locales
- Re-spec v0.5 cloud (4-6 sem), décalage livraison v0.5
- Refonte `06-architecture §2`, `08-roadmap §3`, `SPEC-TECHNIQUE` complet

---

## 6. Recommandation Claude

**Option A**, pour trois raisons :

1. Elle est **conforme à ce qui a été spec'é** (10 sprints fusion déjà écrits, cohérents avec v0.5 local).
2. Elle **n'hypothèque rien** : la bascule cloud V1 reste possible, et on aura appris sur 6 mois d'usage CEO réel avant.
3. Elle permet **la première conversation externe** (CEO pair ETIC, investisseur) sans attendre cloud.

Le point à clarifier *explicitement* en cas de A : écrire que **le travail v0.5 sur SQLite + Service Windows est un pont**, et que le plan V1 inclut la refonte stack (ce n'est pas une surprise, c'est un choix assumé). Ce point doit apparaître dans l'ADR **et** dans `01-vision.md`.

---

## 7. Décision

**Option retenue** : **A — pont jetable (local v0.4/v0.5 → cloud V1+)**.

**Motif principal** : conforme aux specs fusion déjà écrites, n'hypothèque aucune trajectoire future, permet la première conversation externe (CEO pair + investisseur) sans attendre le cloud.

**Contrainte ajoutée par le CEO (irréversible sauf nouvel ADR)** :
Le CEO **ne doit pas perdre l'usage** pendant la fusion v0.5 ni pendant la bascule cloud V1. Il doit pouvoir **tester toutes les fonctionnalités et donner du retour en continu**.

**Conséquences actées** :
1. Fusion v0.5 **progressive, pas big-bang** — chaque sprint livre une fonctionnalité utilisable de bout en bout.
2. **Mode parallèle obligatoire** — pendant la transition, l'ancien MVP (port 4747 + JSON) et le nouveau (fusion + SQLite) cohabitent. Bascule fonction par fonction.
3. **Rollback ≤ 10 minutes** à chaque étape, sans perte de décisions prises entre-temps.
4. **Parité fonctionnelle avant bascule finale** — pas d'arrêt de v0.4 tant que v0.5 n'a pas démontré parité + stabilité sur 1 semaine d'usage réel.
5. **Même logique V0.5 → V1** — bascule cloud par vagues, période de coexistence local + cloud.
6. Chaque sprint fusion doit inclure un critère d'acceptation **"le CEO peut l'utiliser + donner du feedback"**.

**Livrables produits** :
- ✅ ADR `2026-04-24 · Trajectoire produit` ajouté à `00_BOUSSOLE/DECISIONS.md`
- ✅ Patch `04_docs/01-vision-produit.md` — section § 0 "État actuel vs horizon" en tête + tableau des 5 phases + rappel contrainte continuité
- ✅ Patch `04_docs/02-benchmark.md` — section § 0 "Deux marchés de référence, deux phases produit" distinguant phase locale (Copilot, Rewind, Motion Desktop, TheBrain Pro, plugins Outlook IA) et phase cloud (Lattice, Motion, Sunsama, etc.)
- 🔜 Livrable additionnel à produire en S4 (timing/budget v0.5) : budgéter explicitement en V1 la **refonte stack local → cloud** (pas juste des features)
- 🔜 Livrable additionnel à produire en S6 (dev) : ajouter un RUNBOOK "mode parallèle v0.4 + v0.5" pour documenter la coexistence

**Conditions de revisite** : uniquement si un blocage technique majeur impose l'accélération cloud (ex. SQLite ne tient pas la charge, Outlook COM bloqué par IT corp) — et dans ce cas, nouvel ADR avec plan de continuité d'usage équivalent.

**Clôture** : 2026-04-24. Statut ✅ close.

---

*S1 ouverte 2026-04-24, close 2026-04-24. Trace conservée dans ce fichier + JOURNAL.md + DECISIONS.md.*
