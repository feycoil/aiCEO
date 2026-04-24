# aiCEO — Roadmap & PMO

**Version 2.0 · refonte du 24 avril 2026 · trajectoire 18 mois**

> Plan d'exécution PMO par milestones GitHub, avec jalons, livrables, dépendances, équipe minimale et signaux de go/no-go. Remplace la v1.0 du 23/04 qui présentait le MVP comme "à venir" : le MVP v0.4 est **livré et utilisé en réel**, le prochain palier est la **fusion app-web ↔ MVP** (v0.5).

---

## 1. État d'avancement au 24/04/2026

| Palier | État | Tag / milestone | Preuve |
|---|---|---|---|
| **MVP v0.4** | Livré, run réel | `v0.4` · milestone `MVP` (partiel) | 28/28 tâches arbitrées en 41 s, ≈ 1 ct / arbitrage, 926 mails importés sur 3 boîtes |
| **App Web Twisty v4** | Livré, absorbée à la fusion | — | 13 pages + Design System `02_design-system/` |
| **Produit unifié v0.5** (fusion) | Specs rédigées, sprint 1 à démarrer | milestone `MVP` | `SPEC-FONCTIONNELLE-FUSION.md` + `SPEC-TECHNIQUE-FUSION.md` |
| **V1 copilote proactif** | Périmètre cadré, post-v0.5 | milestone `V1` | Épics F10-F19 migrés en GitHub Issues |
| **V2 multi-utilisateur** | Esquissée | milestone `V2` | Épics F20-F28 |
| **V3 coach + mobile** | Esquissée | milestone `V3` | Épics F29-F42 |

Source unique du backlog : **GitHub Issues** sur [`feycoil/aiCEO`](https://github.com/feycoil/aiCEO/issues) — 78 issues actives (42 epics F1-F42 + ~35 tactiques + 1 épic infra/DX), 29 labels, 4 milestones.

---

## 2. La trajectoire en 4 milestones

```
  Livré            En cours         Après v0.5       T1-T2 2027       T3-T4 2027
  T2 2026          T2 2026          T3-T4 2026       ────────         ────────
     │                │                │                │                │
     ▼                ▼                ▼                ▼                ▼
  ┌────────┐     ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
  │v0.4 MVP│     │ v0.5   │      │   V1   │      │   V2   │      │   V3   │
  │        │────▶│ Fusion │─────▶│Proactif│─────▶│ Équipe │─────▶│ Coach  │
  │Rituels │     │ app+BE │      │  mono  │      │ multi  │      │ mobile │
  │ réels  │     │unifiés │      │        │      │        │      │        │
  └────────┘     └────────┘      └────────┘      └────────┘      └────────┘

  "Je trie      "Un seul          "Je reçois      "On travaille    "L'outil me
   mes          produit           des props      à plusieurs."    rend du temps
   matins."     unifié."          préparées."                     et me garde
                                                                   en forme."
```

### Promesse par milestone

- **MVP (T2 2026 · partiel v0.4 livré)** : *« Mon arbitrage matinal est fait en < 10 min avec Claude. »*
- **v0.5 fusion (T2 2026 · en cours)** : *« Tout mon flux — matin, journée, soir, revues — passe par une seule app. »*
- **V1 (T3-T4 2026)** : *« Mon copilote tourne en fond et me pousse des actions prêtes à valider. »*
- **V2 (T1-T2 2027)** : *« Mon équipe utilise aussi l'outil, on est alignés. »*
- **V3 (T3-T4 2027)** : *« L'outil me rend du temps et me garde en forme. »*

---

## 3. MVP — fondations livrées + fusion v0.5

### 3.1 Acquis v0.4 (24/04/2026)

- **Arbitrage matinal** (`03_mvp/public/index.html`) : import emails 30 j + calendrier, prompt système + contexte email injecté, 3 colonnes FAIRE / DÉLÉGUER / REPORTER avec drag & drop, validation persistée dans `data/decisions.json`.
- **Délégation assistée** : brouillon mail généré par Claude, `mailto:` Outlook, archive locale.
- **Boucle du soir** (`evening.html`) : bilan structuré, humeur, top 3 demain.
- **Intégration Outlook** : PowerShell COM (`outlook-pull.ps1`), scan 3 boîtes (principale + 2 déléguées), delta 30 j, 926 mails utiles en run réel.
- **Proxy corporate** : `HTTPS_PROXY` + `NODE_EXTRA_CA_CERTS` supportés.
- **Chip coral** sur cartes sous pression (≥ 2 relances ou ≥ 3 non lus).
- **Cockpit + 13 pages** app-web Twisty (lue en localStorage, à migrer v0.5).

### 3.2 v0.5 — fusion app-web ↔ MVP (T2 2026)

**Décision ADR du 24/04** : MVP absorbe app-web ; SQLite remplace `localStorage` + JSON ; le MVP devient le produit unique. Voir `DECISIONS.md` + [`SPEC-FONCTIONNELLE-FUSION.md`](SPEC-FONCTIONNELLE-FUSION.md) + [`SPEC-TECHNIQUE-FUSION.md`](SPEC-TECHNIQUE-FUSION.md).

**Périmètre** (21 → 13 pages, consolidation −38%) :

| Famille | Pages cible (dans `03_mvp/public/`) |
|---|---|
| Cockpit / rituels | `index.html` (cockpit unifié), `arbitrage.html`, `evening.html` |
| Tâches / agenda | `taches.html`, `agenda.html` |
| Revues | `revues.html` |
| Registres | `contacts.html`, `decisions.html` |
| Sociétés / projets | `groupes.html`, `projets.html`, `projet/:id.html` (template commun) |
| Copilote | `assistant.html` (WebSocket live) |

**Sprints** (10 semaines cible, 6 sprints) :

| # | Durée | Contenu |
|---|---|---|
| 1 | 2 sem | Schéma SQLite (13 tables) + migrations versionnées + routes API tasks/decisions/contacts/projects/groups + `migrate-from-appweb.js` |
| 2 | 2 sem | Cockpit unifié + arbitrage + evening sur API |
| 3 | 2 sem | Tâches + agenda + revues migrées, retrait `localStorage` |
| 4 | 2 sem | Groupes + projets + template projet + contacts + décisions + assistant chat live (WebSocket) |
| 5 | 1 sem | Service Windows (`node-windows` ou NSSM) + raccourci desktop + tests Playwright 3 flux critiques + CI verte |
| 6 | 1 sem | Scellement, tag `v0.5`, release interne, rétro sprint + ajustement rituels Feycoil |

### 3.2bis Équipe v0.5

- **2 fullstack dev** (Node 20 + vanilla JS + SQL, montée en compétence `better-sqlite3`).
- **0,3 product designer** (maintenance DS "Twisty" côté pages migrées, pas de création).
- **0,3 PMO** (coordination sprints, GitHub Issues, jalons go/no-go).
- **Feycoil** en dogfood quotidien (matin/soir sur v0.5 dès le sprint 2), non budgété.

Total actif : **2,6 ETP** sur 10 semaines.

### 3.2ter Budget v0.5

- Dev : 10 sem × 2,6 ETP × 900 €/j × 4,5 j/sem ≈ **105 k€**.
- Infra / LLM (SQLite local, Claude Sonnet v0.4 inchangé, CI Actions minutes) : ~5 k€.
- **Total v0.5 : ~110 k€**.

Calcul cohérent avec le format V1 (§4). ADR associée : `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Timing & budget v0.5 réconciliés*.

### 3.3 Critères de scellement v0.5 (go/no-go V1)

- 13 pages cibles accessibles à `http://localhost:3001/*`
- Zéro `localStorage` applicatif (seuls paramètres UI légers tolérés)
- Flux matin + flux soir stables 5/5 jours ouvrés sur 3 semaines
- Adoption matin ≥ 80% / soir ≥ 70% des jours ouvrés (tracking)
- Migration sans perte (`check-migration.js` vert)
- Service Windows opérationnel, redémarre après crash
- Tests e2e Playwright verts (arbitrage, délégation, soir)
- CI GitHub Actions verte (lint + unit + audit)
- Zéro incident sécurité (fuite clé, prompt injection)

---

## 4. V1 — copilote proactif (T3-T4 2026, 16 semaines)

### Objectif

Passer de **réactif à proactif**. L'agent tourne en fond, observe les signaux, pousse des propositions préparées. Feycoil arrive le matin avec *« 8 propositions préparées, gain estimé 47 min »*.

### Transitions techniques majeures

- **SQLite → Postgres Supabase** (migration one-shot, table `_migrations` versionnée).
- **PowerShell COM → Graph API OAuth** (msal-node device code flow) — backend autonome, sans session Windows.
- **Ajout Inngest** pour durable execution (cron + webhooks + retries).
- **Ajout pgvector** pour la mémoire long-terme vectorielle.
- **Ajout Langfuse** pour traçabilité complète LLM.

### Périmètre fonctionnel (épics F10-F19 / milestone `V1`)

- **F10 · Copilote en fond (Inngest).** Jobs schedulés + webhooks Graph. Sub-agents spécialisés (mail, calendar, task, deleg, meeting-prep, weekly-review).
- **F11 · Mémoire long-terme.** Postgres + pgvector, 3 strates (identity, preference, episode). Résumés roulants hebdo. Extraction préférences après 60 jours.
- **F12 · Rituels intégrés.** Matin (check-in + intention + top 3), soir (shutdown), dimanche (revue hebdo auto-draftée). Mode nuit post-shutdown.
- **F13 · Délégation pro.** Matrice de confiance par équipier (silencieuse), propriétaire naturel calculé, brief IA rédigé, suivi automatique (J+2, J+5), relance assistée.
- **F14 · Traçabilité totale.** Chaque action IA → log Langfuse + UI « pourquoi ? ». Dashboard transparence (tokens consommés, propositions émises, taux acceptation).
- **F15 · Intégration SharePoint.** RAG sur documents CEO, permissions trimmées, embeddings Voyage-3.
- **F16 · Détection signaux burnout.** Croisement mails > 22h, weekends actifs, score humeur, taux acceptation — intervention contextuelle douce.
- **F17 · Migration SolidJS progressive.** *Muté en research*. Décision reportée à la fin V1 selon besoin perf. Si le vanilla JS + modules ES tient, on ne migre pas.
- **F18 · Design system étendu.** Drawer réutilisable, view switcher 5 formats, source pill standardisée, command palette (Cmd+K).
- **F19 · Premières visualisations riches.** Carte radiale sociétés, arbre Big Rocks, timeline décisions.

### Livrables

- Copilote proactif stable (> 15 propositions/jour sans plantage).
- Mémoire hiérarchique éprouvée (3+ mois d'historique).
- Rituels adoptés par Feycoil (≥ 80% adoption matin, ≥ 70% soir, ≥ 80% dimanche).
- Dashboard observabilité + transparence.
- 3 visualisations riches opérationnelles.

### Équipe

- 2 fullstack dev (Node 20 + vanilla JS ou SolidJS si F17 activé).
- 1 AI engineer + 1 consultant LLM senior (0.3 ETP).
- 1 product designer temps plein.
- PMO 0.3 ETP.

### Budget estimé

- Dev : 16 sem × 4.3 ETP × 900 €/j × 4.5 j/sem ≈ **280 k€**.
- Infra V1 (Supabase Team, Inngest, Langfuse, Bedrock EU) : ~8 k€.
- **Total V1 : ~290 k€**.

### Critères de go/no-go V2

- Taux d'acceptation propositions IA ≥ 55% sur 60 jours.
- Temps CEO gagné déclaré ≥ 5 h/semaine.
- Ratio délégation/exécution ≥ 40%.
- Rituels matin/soir/hebdo maintenus aux seuils v0.5.
- Zéro incident majeur sécurité / coût.
- Validation explicite de Feycoil pour ouvrir à l'équipe.

---

## 5. V2 — ouverture équipe (T1-T2 2027, 20 semaines)

### Objectif

Passer de **mono-CEO à multi-utilisateur**. DG adjoint, AE, collaborateurs proches ont leur propre vue, complémentaire à celle du CEO. Les décisions et tâches circulent, les silos se cassent.

### Périmètre (épics F20-F28 / milestone `V2`)

- **F20 · Multi-tenant Supabase (RLS).** Isolation par org, rôles (CEO, DG, AE, manager, collaborateur). Ajout `user_id` + `tenant_id` à toutes les tables.
- **F21 · Vues rôle-spécifiques.** AE voit agenda + tâches à planifier, DG voit décisions + projets assignés, CEO garde sa vue totale.
- **F22 · Délégation end-to-end.** Quand le CEO délègue, la tâche apparaît dans aiCEO du destinataire. Suivi visible des deux côtés.
- **F23 · Intégration Teams.** Messages directs, mentions dans canaux, présence. Le copilote peut pinguer un collaborateur.
- **F24 · Comité stratégique intégré.** Préparation IA (ODJ, briefs par sujet), canvas de décision pendant la séance, PV post-séance automatique, suivis.
- **F25 · Canvas tldraw + agent visible.** Pensée visuelle collaborative : CEO et équipe dessinent, l'agent réorganise, enrichit, pousse dans un brief.
- **F26 · Graphe Cytoscape.** Vue réseau des parties prenantes d'une décision, dépendances inter-projets.
- **F27 · Dashboard équipe.** Vue synthèse des charges de chaque équipier (matrice confiance, charge actuelle, disponibilités).
- **F28 · SOC 2 Type II.** Audit via Vanta/Drata. Conformité complète RGPD.

### Livrables

- App multi-utilisateur avec isolation stricte (RLS testée).
- Intégration Teams opérationnelle.
- Canvas IA collaboratif (tldraw + Yjs).
- Graphe visuel du réseau.
- Certification SOC 2 en cours.

### Équipe

- 4 fullstack + 2 AI + 1 DevSecOps + 1 designer + PMO 0.5 ETP = ~8 ETP.

### Budget estimé

- Dev : 20 sem × 8 ETP × 900 €/j × 4.5 j/sem ≈ **648 k€**.
- Infra V2 : ~20 k€ sur la période.
- Certification SOC 2 : ~25 k€.
- **Total V2 : ~693 k€**.

### Critères de go/no-go V3

- ≥ 5 utilisateurs actifs quotidiens dans l'écosystème ETIC.
- Temps CEO gagné ≥ 8 h/semaine maintenu.
- Usage Teams natif baisse ≥ 30% (remplacé par aiCEO).
- Certification SOC 2 obtenue.
- Feycoil valide le packaging pour commercialisation.

---

## 6. V3 — coaching stratégique + mobile (T3-T4 2027, 16 semaines)

### Objectif

Transformer aiCEO d'assistant en **coach stratégique + compagnon mobile**. Questions socratiques, pattern detection long-terme, anti-burnout actif. Le CEO se sent non seulement efficace mais **mieux** qu'avant aiCEO.

### Périmètre (épics F29-F42 / milestone `V3`)

- **F29 · Coach conversationnel activable.** Modes « arbitrage », « je me sens coincé », « revue stoïque ». Claude Opus 4.6+ pour cette couche.
- **F30 · Journal de reconnaissance.** Module discret : 3 reconnaissances/jour, visible sur demande.
- **F31 · Détection burnout active.** Croisement multi-signaux avec interventions graduées (question → nudge → bloc focus proposé → journée off proposée).
- **F32 · Boîte à outils psychologique.** Respiration guidée, méditations, recadrage cognitif, carnet des victoires.
- **F33 · Post-mortem automatique.** Quand un Big Rock échoue ou qu'une décision ne se concrétise pas, rétrospective structurée.
- **F34 · Offline-first (ElectricSQL ou PowerSync).** Sync Postgres ↔ SQLite, usage en avion.
- **F35 · Application mobile compagnon.** PWA iOS + Android, lecture rapide et validation de propositions, capture vocale.
- **F36 · Multi-CEO (écosystème ETIC).** Ouverture contrôlée à 2-3 autres CEO de l'écosystème.
- **F37-F42** : raffinements backlog (streaks, kill switch global, exports, paramètres avancés) — voir GitHub Issues.

### Livrables

- Coach conversationnel opérationnel.
- Boîte à outils bien-être.
- App mobile PWA.
- Pack multi-CEO avec isolation stricte.

### Équipe

- Équipe stabilisée à **8-10 ETP**, plus un psychologue consultant 0.2 ETP pour la couche coaching.

### Budget estimé

- Dev : 16 sem × 9 ETP × 900 €/j × 4.5 j/sem ≈ **583 k€**.
- Consulting psycho : ~15 k€.
- **Total V3 : ~598 k€**.

---

## 7. Backlog priorisé

### 7.1 Source unique : GitHub Issues

Depuis le 24/04/2026, **GitHub Issues sur `feycoil/aiCEO` est la source unique du backlog** (ADR dans `DECISIONS.md`). L'xlsx d'origine est archivé dans [`_archive/2026-04-backlog-initial/`](../_archive/2026-04-backlog-initial/).

| Dimension | Valeur |
|---|---|
| Issues actives | **78** (42 epics F1-F42 + ~35 tactiques + 1 épic infra/DX) |
| Milestones | 4 : `MVP`, `V1`, `V2`, `V3` |
| Labels | 29 : `lane/*` · `type/*` · `priority/*` · `status/*` · `phase/*` · `scope/*` |
| URL | https://github.com/feycoil/aiCEO/issues |

**Règle** : tout nouveau besoin produit = **nouvelle Issue** (pas de TODO dans le code, pas de fichier backlog parallèle).

### 7.2 Top features par milestone (extrait RICE)

Méthodologie RICE = Reach × Impact × Confidence / Effort. Scores calculés pour 1 utilisateur (Feycoil) en MVP/V1 ; Reach monte à 5-10 en V2+.

| ID | Feature | Milestone | Reach | Impact | Conf. | Effort (sem) | Score | État |
|---|---|---|:-:|:-:|:-:|:-:|:-:|:-:|
| F1 | Cockpit consolidé | MVP | 10 | 3 | 0.9 | 2 | 13.5 | ✅ v0.4 (app-web) + v0.5 (fusion) |
| F6 | Intégration Outlook COM | MVP | 10 | 3 | 0.95 | 3 | 9.5 | ✅ v0.4 |
| F7 | Copilote réactif (chat) | v0.5 | 10 | 3 | 0.85 | 3 | 8.5 | 🔜 sprint 4 fusion |
| F8 | Délégation assistée | MVP | 10 | 3 | 0.9 | 3 | 9.0 | ✅ v0.4 |
| F10 | Copilote proactif (Inngest) | V1 | 10 | 3 | 0.7 | 5 | 4.2 | 📋 |
| F11 | Mémoire long-terme pgvector | V1 | 10 | 2.5 | 0.7 | 4 | 4.4 | 📋 |
| F12 | Rituels intégrés | V1 | 10 | 3 | 0.85 | 2 | 12.8 | 🔜 partiel v0.5 |
| F15 | Intégration SharePoint | V1 | 10 | 2 | 0.8 | 3 | 5.3 | 📋 |
| F17 | Migration SolidJS | V1 | 10 | 2 | 0.5 | 6 | 1.7 | 🔬 muté research |
| F19 | Viz riches (radiale, arbre) | V1 | 10 | 3 | 0.8 | 3 | 8.0 | 📋 |
| F22 | Délégation end-to-end | V2 | 5 | 3 | 0.7 | 4 | 2.6 | 📋 |
| F24 | Comité stratégique intégré | V2 | 2 | 3 | 0.6 | 4 | 0.9 | 📋 |
| F25 | Canvas tldraw + agent | V2 | 10 | 2.5 | 0.6 | 6 | 2.5 | 📋 |
| F29 | Coach conversationnel | V3 | 10 | 2.5 | 0.5 | 5 | 2.5 | 📋 |
| F31 | Détection burnout active | V3 | 10 | 3 | 0.55 | 4 | 4.1 | 📋 |
| F42 | Kill switch global | V3 | 10 | 2 | 0.9 | 1 | 18.0 | 📋 (à remonter MVP) |

Légende : ✅ livré · 🔜 sprint courant · 📋 backlog · 🔬 research

---

## 8. Dépendances & chemin critique

```
  MVP v0.4 (livré)
         │
         ▼
  Spec fusion validée (livrée 24/04) ─────┐
         │                                │
         ▼                                ▼
  Schéma SQLite + migrations (S1)    Routes API REST (S1)
         │                                │
         └──────────────┬─────────────────┘
                        ▼
                 Migration data (S1)
                        │
                        ▼
              Cockpit unifié (S2)
                        │
                        ▼
          Pages rituels sur API (S2-S3)
                        │
                        ▼
          Pages portefeuille + chat (S4)
                        │
                        ▼
              Service Windows (S5)
                        │
                        ▼
                 Scellement v0.5 (S6)
                        │
                        ▼
          Migration SQLite → Postgres (V1 S1-S2)
                        │
                        ▼
          Graph API OAuth (V1 S2-S4)
                        │
                        ▼
          Inngest + sub-agents (V1 S5-S8)
                        │
                        ▼
          Mémoire pgvector (V1 S9-S11)
                        │
                        ▼
          SharePoint RAG (V1 S12)
                        │
                        ▼
          Rituels auto-draftés + viz (V1 S13-S16)
```

Chemin critique **18 semaines** de maintenant à **V1 cœur** fonctionnelle (10 sem fusion v0.5 + 8 sem V1 cœur : migration Postgres + Graph API + Inngest + sub-agents). La **V1 complète** (F15 SharePoint RAG + F19 viz riches + F12 rituels auto-draftés + F11 mémoire pgvector outillée) couvre **8 sem supplémentaires** = **26 sem au total** pour atteindre le périmètre V1 (cohérent avec §4 : "V1 — 16 sem, 290 k€"). F17 SolidJS non bloquant (research). Réconciliation timing : ADR `2026-04-24 · Timing & budget v0.5 réconciliés`.

---

## 9. KPIs de pilotage PMO

### Par sprint

- **Velocity** (points livrés).
- **Lead time** (temps d'une feature de backlog à prod).
- **Bug ratio** (bugs introduits par feature livrée).
- **Couverture tests** (viser 70% back, 50% front) — applicable dès sprint 1 fusion.

### Par mois

- **DAU Feycoil** (jours d'usage effectifs sur 30).
- **Taux de propositions acceptées** (cible ≥ 60% flux matin).
- **Temps CEO gagné déclaré** (sondage mensuel).
- **Coût LLM quotidien** (baseline v0.4 ≈ 1,5 ct/jour, alerte si ×3).
- **Burn financier** vs budget.
- **Incidents P0/P1**.

### Par trimestre

- **Score NPS Feycoil**.
- **Atteinte des jalons go/no-go**.
- **Coût LLM par proposition acceptée** (doit baisser avec l'apprentissage).
- **Conformité RGPD / SOC 2** (audit interne dès V2).

---

## 10. Rituels PMO

- **Daily standup 15 min** (équipe dev) — 9h.
- **Demo hebdo 30 min** (Feycoil + équipe) — vendredi 15h.
- **Sprint review 1 h** (tous les 2 semaines).
- **Sprint retro 45 min** (tous les 2 semaines).
- **Product review mensuel 2 h** avec Feycoil — arbitrages backlog GitHub + priorisation.
- **Board review trimestriel 3 h** — ExCom ETIC Services, bilan + cap.

---

## 11. Gestion des risques (top 9)

| Risque | Proba | Impact | Score | Mitigation |
|---|:-:|:-:|:-:|---|
| Prompt injection via mail | Med | Haut | 6 | Prompt Shields (V1) + human-approval sur envoi, déjà en place MVP |
| Dérive coûts LLM | Med | Moy | 4 | Budgets par agent + circuit breakers + F42 kill switch, baseline v0.4 ≈ 1,5 ct/jour |
| Feycoil décroche (pas d'adoption fusion) | Low | Haut | 4 | Dogfood quotidien depuis v0.4, livraison fusion par vagues, rituels matin/soir déjà adoptés |
| Migration one-shot perd des données | Med | Haut | 6 | Backup `localStorage` avant + `check-migration.js` + rollback simple |
| Refus de l'équipe à V2 | Med | Haut | 6 | Implication AE + DG dès V1 preview, onboarding dédié |
| Expiration tokens Graph API | Med | Moy | 4 | Refresh proactif msal-node, alertes, fallback COM pendant transition |
| Régression UI pendant fusion | Med | Moy | 4 | Screenshots v4 avant migration + QA page par page + Playwright e2e |
| Dépendance Anthropic / tarifs | Low | Haut | 4 | LiteLLM V1+ multi-provider, exports mémoire JSON standard |
| Retard jalon v0.5 (> 4 sem) | Med | Haut | 6 | Spec figée, 4 vagues isolables, priorisation RICE stricte |

---

## 12. Gouvernance

### Qui décide quoi

- **Product vision** : Feycoil (CEO).
- **Roadmap trimestrielle** : Product owner + Feycoil + CTO.
- **Priorisation sprint** : Product owner (via milestones GitHub).
- **Architecture technique** : CTO (trace dans `DECISIONS.md` pour les ADR).
- **Design system** : Design lead (source : `02_design-system/` + projets Claude Design, voir `00_BOUSSOLE/GOUVERNANCE.md`).
- **Budget / recrutement** : Feycoil (CEO).

### Instance décisionnelle

- **Hebdo** : Product review (Feycoil + PO + CTO) — 30 min.
- **Bi-mensuel** : Sprint planning (équipe + Feycoil) — 1 h.
- **Trimestriel** : Board review (ExCom ETIC Services) — 3 h.

### Règles opérationnelles

Voir `00_BOUSSOLE/GOUVERNANCE.md` : trois silos (Claude Design / Cowork / GitHub), règle de synchronisation Claude Design → `_drafts/` → `02_design-system/`, backlog sur GitHub Issues, archivage via stub de redirection.

---

## 13. Synthèse — le plan en une page

```
v0.4 MVP livré      v0.5 Fusion        V1 Proactif        V2 Équipe         V3 Coach+Mobile
2026-04-24          T2 2026            T3-T4 2026         T1-T2 2027         T3-T4 2027
────────            ────────           ────────           ────────           ────────
Réactif rituel      Unifié mono        Proactif mono      Multi-tenant       Coach + PWA
— · dogfood solo    10 sem · ~110 k€   16 sem · 290 k€    20 sem · 693 k€    16 sem · 598 k€
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arbitrage matinal   SQLite unifié      Inngest proactif   RLS Supabase       Claude Opus coach
Délégation un-clic  13 pages /api      Graph API OAuth    Vues par rôle      Anti-burnout actif
Boucle du soir      Cockpit fusion     Postgres+pgvector  Teams + Delg E2E   Boîte à outils
Outlook COM 30 j    Chat WebSocket     Mémoire 3 strates  tldraw collab      Offline ElectricSQL
Chip sous pression  Service Windows    SharePoint RAG     Cytoscape graphe   PWA mobile
Proxy corp          Tests Playwright   Rituels auto-draft SOC 2 Type II      Multi-CEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dogfood Feycoil     Dogfood étendu     Dogfood + valid.   Équipe ETIC        Écosystème
```

**Budget 18 mois total ≈ 1,68 M€** (équipe montant de 3 → 9-10 ETP).
**MVP déjà livré** : coût effectif v0.4 bien sous le budget initial (dev solo + LLM ≈ 1,5 ct/jour).

---

*Documents liés : [`01-vision-produit.md`](01-vision-produit.md) · [`06-architecture.md`](06-architecture.md) · [`SPEC-FONCTIONNELLE-FUSION.md`](SPEC-FONCTIONNELLE-FUSION.md) · [`SPEC-TECHNIQUE-FUSION.md`](SPEC-TECHNIQUE-FUSION.md) · [`00_BOUSSOLE/ROADMAP.md`](../00_BOUSSOLE/ROADMAP.md) · Backlog : [`feycoil/aiCEO` GitHub Issues](https://github.com/feycoil/aiCEO/issues)*
