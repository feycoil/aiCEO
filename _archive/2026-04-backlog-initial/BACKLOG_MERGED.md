# BACKLOG MERGED — fusion xlsx + Option 2

**Date** : 2026-04-24
**Source A** : `04_docs/09-backlog.xlsx` (42 features F1-F42, scoring RICE)
**Source B** : `_drafts/BACKLOG_v1-proposal.md` (55 items techniques Option 2)
**Statut** : DRAFT — à valider avant génération du script `gh issue create`

---

## Insight clé

- **Source A (xlsx)** = backlog **produit**, orienté valeur utilisateur, 42 features macros scorées RICE. Chaque feature ≈ 1-6 semaines de dev. Lisible par un stakeholder.
- **Source B (Option 2)** = backlog **technique**, orienté découpe opérationnelle, 55 items petits (quelques jours). Lisible par un dev qui veut avancer.

**Décision proposée** : on garde les deux niveaux dans GitHub via deux conventions :
- **Epic** (label `type/epic`) = une feature F1-F42 du xlsx → issue parent de haut niveau
- **Issue tactique** (label `type/feat`, `fix`, etc.) = un item Option 2 → issue enfant, liée à un epic via `Part of #N`

---

## Schéma labels + milestones proposé

### Milestones (phases produit du xlsx + notre v0.4 déjà shipped)

| Milestone | Correspondance | Durée | Budget xlsx | Statut |
|---|---|---|---|---|
| **v0.4** | MVP — tranche 1 (ce qui est déjà là) | — | — | ✅ Shipped 2026-04-24 |
| **MVP** | MVP complet (F1-F9 + F42) | T2 2026 | 132 k€ | 🟡 En cours (~60%) |
| **V1** | Copilote proactif (F10-F19, F39-F40) | T3-T4 2026 | 290 k€ | À venir |
| **V2** | Équipe + certif (F20-F28, F37-F38, F41) | T1-T2 2027 | 693 k€ | À venir |
| **V3** | Coaching avancé + mobile (F29-F36) | T3-T4 2027 | 598 k€ | À venir |

### Labels

**Phase** (en plus des milestones, pour filtrer rapide) :
`phase/mvp`, `phase/v1`, `phase/v2`, `phase/v3`

**Lane** (tech lane, reprise de la roadmap interactive) :
`lane/app-web`, `lane/mvp-backend`, `lane/design-system`, `lane/docs`, `lane/infra`

**Domaine produit** (repris du xlsx) :
`domain/fondation`, `domain/rituel`, `domain/integration`, `domain/ia`, `domain/delegation`, `domain/transparence`, `domain/coaching`, `domain/tech`, `domain/design`, `domain/visuel`, `domain/ux`, `domain/workflow`, `domain/compliance`, `domain/bien-etre`

**Type** :
`type/epic` (feature xlsx), `type/feat`, `type/fix`, `type/chore`, `type/docs`, `type/research`

**Priorité** (repris RICE xlsx) :
`prio/P0`, `prio/P1`, `prio/P2`, `prio/P3`

**Spéciaux** :
`quick-win` (score RICE élevé + effort faible), `blocked`, `needs-research`, `risk-tracked` (lié à un risque R1-R12)

---

## Diff — ce qui est fait vs à faire

### Features xlsx — état réel au 2026-04-24

Je recode avec mes yeux, sachant où on en est :

| F# | Feature | Phase xlsx | État réel | Commentaire |
|---|---|---|---|---|
| **F1** | Cockpit consolidé | MVP P0 | ✅ FAIT | `index.html` app-web v4 |
| **F2** | Vue par société | MVP P0 | ✅ FAIT | `groupes.html` + 9 pages projet |
| **F3** | Revue hebdo manuelle | MVP P0 | ✅ FAIT | `revues/index.html` + widget W17 |
| **F4** | Agenda consolidé | MVP P0 | ✅ FAIT | `agenda.html` hebdo Twisty |
| **F5** | Tâches unifiées | MVP P0 | ✅ FAIT | `taches.html` + Eisenhower |
| **F6** | Intégration Outlook | MVP P0 | 🟡 PARTIEL | PowerShell COM (pas OAuth Entra ID), 30j one-shot |
| **F7** | Copilote réactif (chat) | MVP P0 | 🟡 PARTIEL | `assistant.html` statique, pas de vrai chat live |
| **F8** | Délégation assistée | MVP P0 | ✅ FAIT | MVP `drafts.js` — brouillons Claude |
| **F9** | Traçabilité minimale | MVP P0 | 🟡 PARTIEL | Source-link ↗ dans app-web ; pas dans MVP |
| **F10** | Copilote proactif (Inngest) | V1 P0 | ❌ À FAIRE | Jobs scheduled / webhooks |
| **F11** | Mémoire long-terme (pgvector) | V1 P0 | ❌ À FAIRE | 3 strates |
| **F12** | Rituels intégrés | V1 P0 | 🟡 PARTIEL | MVP matin ✅ + soir ✅, dimanche à faire |
| **F13** | Délégation pro (matrice confiance) | V1 P0 | ❌ À FAIRE | Matrice silencieuse |
| **F14** | Traçabilité totale (Langfuse) | V1 P1 | ❌ À FAIRE | Logs agent, dashboard |
| **F15** | Intégration SharePoint (RAG) | V1 P1 | ❌ À FAIRE | |
| **F16** | Détection burnout (signaux faibles) | V1 P1 | ❌ À FAIRE | |
| **F17** | Migration SolidJS | V1 P1 | ❌ À FAIRE | À questionner : nécessaire ? |
| **F18** | Design system étendu | V1 P1 | 🟡 PARTIEL | Drawer ✅, Cmd+K ✅, source pill ✅ ; view switcher à faire |
| **F19** | Visualisations riches | V1 P0 | ❌ À FAIRE | Carte radiale, arbre, timeline |
| **F20** | Multi-tenant Supabase (RLS) | V2 P0 | ❌ À FAIRE | |
| **F21** | Vues rôle-spécifiques | V2 P0 | ❌ À FAIRE | |
| **F22** | Délégation end-to-end | V2 P0 | ❌ À FAIRE | |
| **F23** | Intégration Teams | V2 P1 | ❌ À FAIRE | |
| **F24** | Comité stratégique intégré | V2 P1 | ❌ À FAIRE | |
| **F25** | Canvas tldraw + agent visible | V2 P0 | ❌ À FAIRE | |
| **F26** | Graphe Cytoscape | V2 P1 | ❌ À FAIRE | |
| **F27** | Dashboard équipe | V2 P2 | ❌ À FAIRE | |
| **F28** | SOC 2 Type II | V2 P0 | ❌ À FAIRE | |
| **F29** | Coach conversationnel | V3 P1 | ❌ À FAIRE | |
| **F30** | Journal de reconnaissance | V3 P2 | ❌ À FAIRE | |
| **F31** | Détection burnout active | V3 P1 | ❌ À FAIRE | |
| **F32** | Boîte à outils psycho | V3 P2 | ❌ À FAIRE | |
| **F33** | Post-mortem automatique | V3 P2 | ❌ À FAIRE | |
| **F34** | Offline-first (ElectricSQL) | V3 P1 | ❌ À FAIRE | |
| **F35** | App mobile compagnon | V3 P1 | ❌ À FAIRE | |
| **F36** | Multi-CEO (écosystème ETIC) | V3 P1 | ❌ À FAIRE | |
| **F37** | Bouton visualiser (Napkin) | V2 P1 | ❌ À FAIRE | |
| **F38** | Mode surcharge détectée | V2 P2 | ❌ À FAIRE | |
| **F39** | Streak du repos | V1 P2 | 🟡 PARTIEL | Streak gamif engine existe, à étendre au repos |
| **F40** | NON bienveillant saturation | V1 P0 | ❌ À FAIRE | Alerte à implémenter |
| **F41** | Recadrage cognitif (ACT light) | V2 P2 | ❌ À FAIRE | |
| **F42** | **Kill switch copilote** | MVP P0 | ❌ À FAIRE | ⚠️ **Bloquant MVP** — score RICE 28.5, quick-win absolu |

**Synthèse MVP** : 5/10 ✅ totalement faits · 4/10 🟡 partiels · **F42 manquant bloquant MVP**.

### Items Option 2 — mapping aux epics xlsx

Mes 55 items techniques se mappent (ou pas) aux features xlsx. Voici le mapping :

| Item Opt2 | Rattachement | Commentaire |
|---|---|---|
| 1. Service Windows MVP | F10 (précurseur) | Précondition du copilote proactif |
| 2. Historique arbitrages | F11 (précurseur) | Embryon de mémoire long-terme |
| 3. Scan Outlook incrémental | **F6** — complétion | Fait passer F6 de 🟡 à ✅ |
| 4. Compteur coût API | F14 (précurseur) | Ancêtre du dashboard Langfuse |
| 5. Tests unitaires llm.js | transverse infra | Pas d'epic, issue propre |
| 6. Tests unitaires drafts.js | transverse infra | Pas d'epic, issue propre |
| 7. Synthèse hebdo | **F12** — complétion dimanche | |
| 8. Logging structuré | transverse infra | Précondition F14 |
| 9. Fix resélection tâches différées | **F5** — bug correctif | |
| 10. Inférence projet <20% | transverse qualité | Lié à MVP actuel |
| 11. Calendrier dans arbitrage | **F7** — complétion | |
| 12. Mode focus | F38 (précurseur) | |
| 13. Drag & drop Eisenhower | transverse UX | Amélioration `taches.html` |
| 14. Rapport hebdo auto | **F12** — compléte le dimanche |
| 15. Export PDF revue | transverse UX | Issue propre |
| 16. i18n fr/en | V2+ | Épi dédié à créer |
| 17. Streaks/badges | **F39** déjà partiellement fait |
| 18. Mémoire longue | **F11** — découpe | |
| 19. Widget Outlook | F6 (extension) |
| 20. Auto-détection engagements | F10 (précurseur) | |
| 21. Spec fonctionnelle fusion | transverse docs | Pré-requis V1 |
| 22. Spec technique fusion | transverse docs | Pré-requis V1 |
| 23-26. Migration + auth + API + SQLite | **F10-F20** découpe infra V1→V2 | |
| 27. Skin Twisty MVP | **F18** — découpe design |
| 28. Desktop (Electron/Tauri) | **F35** précurseur desktop |
| 29. Tests e2e | transverse infra | |
| 30. Doc install non-tech | transverse docs | |
| 31. Build Windows signé | **F28** (compliance) précurseur |
| 32. Onboarding guidé | transverse UX | |
| 33-42. V2/V3 items | mappent aux F20-F36 | |
| 43-50. Infra/DX | transverse infra | |
| 51-55. Dette tech | transverse | |

### Gaps identifiés

**❶ Présents dans xlsx absents de mon Option 2** (à récupérer) :
- F42 — Kill switch copilote (quick-win P0, je l'avais oublié)
- F10 — Copilote proactif (je l'avais découpé mais pas nommé comme tel)
- F13 — Matrice confiance par équipier
- F16 — Détection burnout signaux faibles
- F17 — Migration SolidJS (à questionner)
- F19 — Visualisations riches (carte radiale, arbre, timeline)
- F24 — Comité stratégique intégré
- F25 — Canvas tldraw + agent visible
- F26 — Graphe Cytoscape
- F28 — SOC 2 Type II
- F29-F33 — Stack coaching (conversationnel, journal, burnout actif, boîte psycho, post-mortem)
- F37 — Napkin / bouton visualiser
- F38 — Mode surcharge auto
- F40 — NON bienveillant (oubli majeur, P0 V1)
- F41 — Recadrage cognitif ACT

**❷ Présents dans mon Option 2 absents du xlsx** (à valider) :
- Tests unitaires llm.js + drafts.js (items 5-6) — pratique saine, à conserver
- Logging structuré (item 8) — pré-requis Langfuse, à conserver
- Refactor app.js en modules (item 45, 51) — dette technique, à conserver
- Dependabot + CI (items 43-44) — infra de base, à conserver
- Doc install non-tech + onboarding (items 30, 32) — manque dans xlsx mais utile
- Branches strategy + CONTRIBUTING (items 48-49) — hygiène Git
- Fix resélection tâches différées (item 9) — bug réel observé pendant le run MVP

**❸ Features xlsx à questionner** :
- **F17** — Migration SolidJS : est-ce vraiment nécessaire ? L'app actuelle en vanilla JS fonctionne très bien. Coût 6 sem pour un gain de perf +20% — à relire avec recul.
- **F20** — Multi-tenant Supabase : seulement si on vise la V2 équipe rapidement. Sinon on reste sur SQLite local.
- **F28** — SOC 2 Type II : budget ~300 k€ implicites. À reporter si pas de client entreprise à court terme.

---

## Plan de création des issues

### Total estimé après merge

- **42 issues epic** (une par feature F1-F42)
- **~35 issues tactiques** (Option 2 nettoyé des doublons avec features xlsx)
- **+ quelques transverses** (CI, tests, docs)
- = **~80-85 issues** au total

### Stratégie de regroupement visuel

- GitHub **Projects** (Kanban) : une vue par milestone (MVP / V1 / V2 / V3) + une vue transverse
- Les epics deviennent des "cards" parents, les tactiques sont liées via `Part of #N`
- Les priorités P0/P1/P2/P3 = couleur colonne / groupage

### Script de génération

Script PowerShell `setup-github-issues.ps1` qui fait en une passe :

1. `gh label create` pour chaque label (~30 labels)
2. `gh api repos/feycoil/aiCEO/milestones` pour chaque milestone (MVP, V1, V2, V3)
3. `gh issue create` pour chaque epic (42 issues avec `--label type/epic,phase/X,prio/PY,domain/Z`)
4. `gh issue create` pour chaque tactique (~35-40 issues)
5. Affichage final : URLs des issues créées

### Après exécution

- [ ] Créer GitHub Project "aiCEO Roadmap" (Kanban) et y rattacher toutes les issues
- [ ] Associer chaque issue à son milestone
- [ ] Archiver `09-backlog.xlsx` + CSVs dans `_archive/2026-04-backlog-initial/`
- [ ] Supprimer `_drafts/BACKLOG_v1-proposal.md` et `_drafts/BACKLOG_MERGED.md` (déplacés dans l'archive)
- [ ] Entrée CHANGELOG v0.4 : "Backlog migré en GitHub Issues (80+ issues, 4 milestones)"
- [ ] Git commit : `chore: migration backlog → issues GitHub (étape 7 INIT-GITHUB)`

---

## Questions pour toi avant génération

1. **F17 SolidJS** : on garde en epic ou on mute en `type/research` + `needs-research` pour l'instant ?
2. **F28 SOC 2** : on garde comme epic V2 ou on déplace en V3 / later ?
3. **Item Option 2 #16 i18n** : créer un epic à part ou garder en tactique mineure ?
4. **Mes tests unitaires (items 5-6)** : créer 2 issues séparées ou une seule "Tests unitaires MVP" ?
5. **Priorités différentes entre sources** : si une feature est P0 dans xlsx mais je l'estimais P2, on tranche comment ? → **Suggestion : xlsx fait foi**, mes priorités Option 2 viennent en secondaire.
6. **Labels domaine** : tu veux bien les 14 domaines du xlsx, ou on simplifie en 5-6 grands groupes ?
7. **Issue tactique orpheline** : celles sans epic xlsx clair (ex: CI, Dependabot) — on crée un epic `#0 Infrastructure & DX` pour les rattacher ?

---

*Document volatile à archiver dans `_archive/2026-04-backlog-initial/` une fois les issues créées.*
