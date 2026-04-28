# Plan de réalignement aiCEO — 28/04/2026

> **Pendant** de l'audit UX/UI 2026-04-28 (cf. `AUDIT-UXUI-2026-04-28.md`)
> **Objectif** : combler l'écart entre la promesse produit et l'expérience livrée actuellement.
> **Horizon** : 12 semaines (3 phases de 4 semaines), pré-V1.

---

## 0. Rappel de la promesse produit

> *« Copilote IA exécutif local pour CEO. Cockpit + arbitrage matin + bilan soir + revue hebdo + assistant chat live + portefeuille. 100% local, SQLite mono-instance, zéro cloud applicatif. Vélocité ×30 binôme. »*

**Lecture stratégique** : 4 mots-clés portent la promesse.
1. **Copilote** → l'IA fait le travail invisible avec / pour le CEO
2. **Exécutif** → ergonomie haute vitesse, pas une note-taking app
3. **Local** → souveraineté + offline + zero cloud
4. **CEO** → ICP précis (Feyçoil + 5-10 CEO pairs francophones)

**Ce que l'on a perdu en route** :
- Le **flux** (chaque page est un écran isolé, pas un workflow)
- La **vitesse** (souris obligatoire, pas keyboard-first)
- Le **contexte IA** (chaque conversation repart à zéro, pas de mémoire)
- L'**ambition narrative** (cockpit avait du potentiel, livré sans LLM réel)

---

## 1. Stratégie de réalignement — 3 phases

### Phase 0 — SETUP ADD-AI + REFONTE FRONTEND (semaines 1-2) · ~3.5 j-binôme

**Mantra** : *Préparer la fondation avant de construire dessus.*

| Sprint | Objectif | Effort |
|---|---|---|
| **S6.9-bis — Setup ADD-AI + restructuration projet + extension pilotage** | Plugin Cowork + 8 subagents + memory/ + restructuration dossier + sync GitHub auto | 1.5 j |
| **S6.10-bis — Refonte frontend "Atomic Templates"** | Framework templates vierges + 3 pages migrées (decisions, connaissance, arbitrage) + 12 composants atomiques | 2 j |

**Livrables Phase 0** :
- Plugin Cowork `aiceo-dev` opérationnel
- Dossier projet restructuré (00_methode, 01_produit, 02_architecture, 03_roadmap, etc.)
- Pilotage avec arborescence + sync GitHub
- Framework Atomic Templates documenté + 3 pages-pilote migrées
- Plan migration des 15 autres pages chiffré

### Phase 1 — FONDATIONS (semaines 3-6) · ~5.5 j-binôme

**Mantra** : *Solidifier le DS et la vitesse avant tout le reste.*

| Sprint | Objectif | Effort |
|---|---|---|
| **S6.11 — DS consolidation finale** | Extraire styles inline restants, documenter composants v07, tokens élévation | 1 j |
| **S6.12 — Keyboard-first arbitrage** | Mode plein écran inbox-zero, navigation ↑↓, Big Rocks topbar (sur arbitrage v07) | 1 j |
| **S6.13 — Cmd+K palette + FTS5** | Recherche globale full-text + quick actions | 1 j |
| **S6.14 — Contexte LLM enrichi** | System prompt enrichi serveur, mémoire inter-fils | 1 j |
| **S6.15 — Revues hebdo refondue** | KPIs réels, posture LLM, mouvement, cap (page revues migrée v07) | 1.5 j |

**Livrables Phase 1** :
- Note produit : 6.3 → 8.0
- Vitesse arbitrage : 2 emails/min → 5 emails/min
- 100% des composants S6.8 documentés dans `components.html`
- 5 ADRs

### Phase 2 — INTELLIGENCE (semaines 5-8) · ~6 j-binôme

**Mantra** : *L'IA devient un vrai binôme contextualisé.*

| Sprint | Objectif | Effort |
|---|---|---|
| **S7.1 — Memoire inter-fils** | Daily summary LLM + mémoire intégrée au system prompt assistant | 1 j |
| **S7.2 — Batch LLM operations** | 1 appel pour N items au lieu de N appels (arbitrage) | 1 j |
| **S7.3 — Capture audio + transcription** | Whisper local pour soir + bilan | 1.5 j |
| **S7.4 — Backlinks bidirectionnels** | Décisions ↔ projets ↔ contacts ↔ knowledge_pins | 1 j |
| **S7.5 — Skeleton loading + perf** | Budget temps par interaction (50ms / 200ms / 800ms) | 0.5 j |
| **S7.6 — Mobile responsive** | Layout < 768px utilisable pour CEO en déplacement | 1 j |

**Livrables Phase 2** :
- Note produit : 8.0 → 9.0
- Coût LLM divisé par 4-6× (batch)
- Mobile usable (perte d'usage CEO récupérée)
- 6 ADRs

### Phase 3 — RITUALISATION (semaines 9-12) · ~5.5 j-binôme

**Mantra** : *L'app est un compagnon quotidien indispensable, pas un outil ouvert ad hoc.*

| Sprint | Objectif | Effort |
|---|---|---|
| **S7.7 — Daily digest matin** | LLM résumé "ce qui s'est passé pendant ton sommeil" | 1 j |
| **S7.8 — Bilan soir augmenté** | Génération auto résumé du jour + lecture vocale | 1 j |
| **S7.9 — Onboarding CEO pair** | Seed data, walkthrough 7 jours, exemples francophones | 1.5 j |
| **S7.10 — Notifications PWA** | Reminders matin/soir hebdo (sans push cloud) | 1 j |
| **S7.11 — Light/dark mode** | DS étendu, switcher dans Réglages | 1 j |

**Livrables Phase 3** :
- Note produit : 9.0 → 9.5
- Premier CEO pair onboardé (Lamiae) en autonomie
- Engagement : streak moyen > 14 jours
- 5 ADRs

**Total 4 phases** (incl. Phase 0) : ~20.5 j-binôme = ~6 semaines CEO chrono = ~12 semaines calendaire si interruptions.

---

## 2. Métriques de pilotage produit (à définir)

Pour ne plus piloter au feeling, instaurer 7 métriques produit suivies hebdo.

| Métrique | Définition | Cible V1 |
|---|---|---|
| **Time-to-first-value** | Délai onboarding → 1 décision tranchée | < 5 min |
| **Arbitrage velocity** | Emails arbitrés / minute en session | ≥ 5 |
| **Streak médian** | Nombre de jours consécutifs avec rituel soir | ≥ 14 j |
| **% décisions non-stale** | Décisions ouvertes < 7j / total ouvertes | ≥ 80 % |
| **LLM cost per CEO/mois** | Tokens IN+OUT × prix Sonnet | < 5 € |
| **NPS interne** | Score CEO + CEO pair sur 10 | ≥ 8 |
| **Friction reports** | Bugs UX/UI signalés / semaine | < 3 |

Implémentation : mini-dashboard `/v06/admin/metrics.html` (lecture seule SQLite).

---

## 3. Autres analyses à conduire

| # | Analyse | Quand | Livrable |
|---|---|---|---|
| **A1** | **Audit accessibilité WCAG 2.1 AA** | Sprint S6.9 | Rapport + fix 100% AA |
| **A2** | **Audit performance (latence, charge)** | Sprint S6.10 | Lighthouse score, time-to-interactive |
| **A3** | **Audit sécurité** (data au repos, API keys, headers, IPv6, DNS rebinding, etc.) | Avant V1 | OWASP Top-10 checklist |
| **A4** | **Audit testing coverage** | Sprint S6.11 | Coverage / 80% pour code critique |
| **A5** | **Audit i18n readiness** | Avant V2 | Strings extraits, framework i18n choisi |
| **A6** | **Audit data model future-proofness** (multi-tenant, FK group_id, partitionnement) | Avant V1 | Migration plan |
| **A7** | **Étude utilisateur** : 5 interviews CEO francophones (1h chacune) | Sprint S7.x | Personas, jobs-to-be-done, frictions principales |
| **A8** | **Benchmark concurrents systématique** : Reflect, Mem, Notion AI, Linear, Superhuman, Granola, Magic | Avant pricing V1 | Matrix forces/faiblesses comparée |
| **A9** | **Audit éthique / RGPD** : zéro PII vers cloud, droit de regard CEO sur ses data | Avant V1 | Privacy policy + terms |
| **A10** | **Audit observabilité** : logs structurés, métriques, alerting | Sprint S7.5 | OpenTelemetry export local |

**Priorités** : A1, A2, A6 sont **bloquantes** pour V1. A3, A9 sont **bloquantes** pour CEO pair B2B. A7, A8 sont **bloquantes** pour pricing.

---

## 4. Recommandations supplémentaires (analyse complémentaire)

### 4.1 Gouvernance produit

- **PRD vivant** : un seul document `04_docs/PRD-aiCEO.md` qui décrit la promesse, l'ICP, les jobs-to-be-done. À mettre à jour à chaque sprint.
- **Design Review** : avant chaque sprint, valider les écrans avec un designer externe (peut être un freelance 1 j).
- **Bug bash mensuel** : 1 demi-journée binôme à chasser les frictions UX.

### 4.2 Discipline technique

- **Garder le DS pur** : aucun `style="..."` inline dans les bind-*.js. Tout passe par classes utilitaires `tweaks.css` ou `tokens-*.css`.
- **Aucune route serveur sans tests** : `tests/` avec >80% coverage avant merge.
- **Versionning sémantique strict** : `v0.7.x` patches, `v0.8.0` minor (features), `v1.0.0` reserve V1.

### 4.3 Architecture future

- **Préparer V1 multi-tenant** : ajouter colonne `tenant_id TEXT NOT NULL DEFAULT 'default'` partout dès maintenant. Migration coûteuse plus tard.
- **Préparer V1 FK group_id sur knowledge_pins** : permet rattachement projet (Phase 2 S7.4).
- **Stocker les conversations LLM en clair JSON** plutôt qu'en table SQL — facilite la rétention/export.

### 4.4 Stratégie commerciale (post-V1)

- **Pricing pair-pricing** : 50€/mois CEO francophone, fork open-source possible (souveraineté = différenciateur).
- **Communauté** : recruter 5 CEO pairs francophones pour beta closed (Lamiae + 4 réseaux Feycoil).
- **Distribution** : pas de SaaS hosted en V1. Distribution = installer local Windows/Mac.

### 4.5 Anti-patterns à éviter

- **Ne pas ajouter de nouvelles pages** avant d'avoir consolidé les 18 existantes.
- **Ne pas brancher de nouveaux LLM endpoints** sans batch + cache.
- **Ne pas accepter de "v0.8" qui régresse vs v0.7** : tag uniquement quand smoke-all 24/24 + audit visuel passé.

---

## 5. Plan d'action immédiat (semaine 1)

| Jour | Action | Owner |
|---|---|---|
| **J1** | Acter ce plan via ADR `2026-04-29 · Plan réalignement aiCEO Phase 1-2-3` | CEO + Claude |
| **J1** | Créer milestone GitHub `Phase-1-Fondations` + 5 issues S6.9 → S6.13 | CEO (script `pwsh`) |
| **J2** | Sprint S6.9 — DS consolidation kickoff (4h chrono) | Claude |
| **J3** | Sprint S6.10 — Keyboard-first kickoff (4h chrono) | Claude |
| **J4-J5** | Sprint S6.11, S6.12, S6.13 (3 × 4h chrono) | Claude |
| **J5** | Bilan Phase 1 + audit visuel + smoke-all | CEO + Claude |
| **J5** | Tag `v0.8` si critères passés | CEO |

---

## 6. Décision attendue

Pour démarrer la Phase 1, j'ai besoin de :
1. **Validation du plan** par le CEO (ce document)
2. **ADR signée** dans `00_BOUSSOLE/DECISIONS.md` actant le plan
3. **Mandat** : carte blanche Claude sur les 5 sprints S6.9 → S6.13

Sans ça, on continue à patcher au fil de l'eau et on ne tient pas la promesse.

---

## Sources

- `AUDIT-UXUI-2026-04-28.md` (audit complet)
- ADR `2026-04-28 v6 · Sprint S6.8 livré`
- Maquette source Claude Design v0.5
- ROADMAP v3.3
- Promesse produit (CLAUDE.md §1)

