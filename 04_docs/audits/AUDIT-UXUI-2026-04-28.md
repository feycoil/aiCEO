# Audit UX/UI aiCEO — 28/04/2026 (post-S6.8)

> **Auteur** : agent Claude (sous mandat plein CEO)
> **Mode** : PMO + Designer expert · sans concession
> **Périmètre** : 18 pages frontend `03_mvp/public/v06/` · DS Twisty · workflow CEO complet
> **État du code analysé** : commit `a6e4d25` post-S6.8.5

---

## TL;DR

| Indicateur | Note | Cible V1 |
|---|---|---|
| Note globale produit | **6.3 / 10** | 8.5 / 10 |
| Design System cohérence | 6 / 10 | 9 / 10 |
| Workflow CEO matin | 5 / 10 (file lente) | 9 / 10 |
| Workflow CEO journée | 6 / 10 (LLM hors-contexte) | 9 / 10 |
| Workflow CEO soir | 6 / 10 (rituel saisi) | 8 / 10 |
| Workflow CEO hebdo | 4 / 10 (démo restante) | 9 / 10 |
| Manques vs concurrents | 7 critiques | < 2 |

**Verdict synthétique** : aiCEO est un MVP technique remarquable mais l'expérience délivrée n'atteint pas la promesse produit. Sur 4 moments CEO, seul le matin est partiellement narratif. Les autres sont des écrans de saisie.

---

## 1. Vision produit vs réalité — l'écart critique

**Promesse** : *« Copilote IA exécutif local pour CEO. Cockpit + arbitrage matin + bilan soir + revue hebdo + assistant chat live + portefeuille. »*

**Constat** : la promesse marketing est cohérente, mais l'expérience délivrée est encore celle d'un MVP outil, pas d'un compagnon. À chaque étape du flow CEO, l'utilisateur fait du travail que l'IA devrait faire pour lui.

Sur les 4 moments du CEO (matin / journée / soir / hebdo), seuls 2 ont une expérience à peu près narrative (matin et hebdo). Les autres sont des écrans de saisie. Pour un produit qui se positionne au-dessus de Reflect/Notion, c'est insuffisant.

---

## 2. Design System — cohérence et trous

**Forces** :
- Palette Twisty (`--violet`, `--rose`, `--amber`, `--emerald`, `--sky`, `--surface-1/2/3`) avec sémantique claire
- Typographie cohérente (Crimson Pro + Inter)
- Sidebar drawer cohérente sur 18 pages

**Régressions** :
- **Inflation des styles inline** : tous les composants câblés en JS pendant S6.8 ont du style inline, pas de classes DS
- **Variables couleurs avec fallback en dur** : changements DS ne se propagent pas
- **Composants non documentés** dans `components.html` (modal, card empty state, badges, modal verdict, card pin)
- **8 variantes de bouton** au lieu de 4 max
- **Pas de tokens d'élévation** (`--shadow-1` à `--shadow-5` à inventer)

**Verdict DS** : 6/10. Discipline qui s'effrite. Sprint de consolidation nécessaire.

---

## 3. Architecture de l'information — la sidebar

| Section | Items | Diagnostic |
|---|---|---|
| **PILOTAGE** | Cockpit, Arbitrage (8), Soirée | OK |
| **TRAVAIL** | Projets (13), Actions (40), Agenda, Assistant *NEW*, Équipe | OK mais Assistant mal placé (transverse, pas du "travail") |
| **CAPITAL** | Connaissance *NEW*, Coaching *NEW* | "Capital" trop abstrait pour CEO sous pression |
| **(en bas)** | Revues, Décisions | **Décisions critique mais caché en bas** : devrait être dans PILOTAGE |
| **(footer)** | Français V2, Aide, Réglages | OK |

**Frictions** :
- Décisions sans badge de priorité contrairement à Arbitrage
- Soirée sans état "fait/pas fait" du jour
- Pas de "Mes projets actifs" épinglés
- Switcher d'espace placeholder qui prend 60px verticaux pour rien
- Badge "NEW" durera ~1 mois puis sera obsolète sans cleanup

---

## 4. Workflow CEO — analyse par moment

### A. Matin (8h00 — Cockpit + Arbitrage)

**Promesse** : 28 emails arbitrés en 12 min via 5 verdicts Eisenhower.

**État** :
- Cockpit hero + intention LLM (S6.8.4) ✅
- 3 Big Rocks visualisés (S6.8.4) ✅ mais barres à 0% si rien saisi en revue
- Alertes matin (S6.8.4) ✅ mais sans projection "si tu ignores X, voilà ce qui casse"
- Suggestions aiCEO 3 cards (S6.8.4) ✅ heuristique, LLM non câblé
- File 28 emails, big blocks (S6.8.3) ✅
- Click email → modal verdict 5 boutons + raccourcis 1-5 (S6.8.2) ✅

**Frictions critiques matin** :
- Pas de mode plein écran "inbox-zero" type Superhuman
- Pas de feedback IA pendant la session ("Tu as déclinpé 5 emails Revolut, je masque les suivants ?")
- Pas de pause/reprise (si fermeture mi-session, reprise impossible)
- 1 appel API LLM par email × 28 = 30 cents par arbitrage (devrait être batch)

**Note matin** : 5/10. Cible Superhuman = 6 emails/min. Cible actuelle = ~2/min.

### B. Journée (10h-17h — Assistant + Décisions)

**Promesse** : CEO discute avec Claude, IA capture décisions et critères dans Connaissance.

**État** :
- Assistant câblé (S6.8.1) ✅
- Tool `pin_to_knowledge` câblé ✅
- Modal Historique ✅
- Bouton "Demander à l'assistant" sur cards décisions ✅

**Frictions critiques journée** :
- **Le contexte n'est pas réellement injecté côté serveur** — le frontend pre-remplit le composer mais le system prompt LLM n'est pas enrichi avec décisions/projets/Big Rocks
- **Pas de mémoire inter-fils** : chaque conversation repart à zéro
- **Pas de fil "ongoing" permanent** : 50 conversations dispersées
- Sidebar Conversations utilise les 60 premiers char du 1er message comme titre — illisible
- Pas de Cmd+J global pour overlay assistant depuis n'importe quelle page
- Pas de @mentions pour référencer projet/décision/tâche par ID

**Pour Décisions (S6.8.1)** :
- 4 KPIs câblés ✅ mais le 4e ("revisiter sous 30j") affiche toujours 0 (champ `revisit_at` jamais peuplé) — **faux compteur**
- Pas de timeline visuelle (la maquette en avait une)
- Pas de "décision-as-code" (if/then/else)

**Note journée** : 6/10. Câblage technique solide, mais l'IA n'est pas un binôme contextualisé.

### C. Soir (18h-22h — Soirée + bilan)

**État** : page evening.html avec rituel humeur/énergie/top3/streak.

**Frictions** :
- Pas de "summary" auto-généré du jour
- Pas de lecture vocale du résumé
- Pas de capture audio pour "ce qui m'a coûté"
- Pas de "ce que tu as remis à demain"

### D. Hebdo (Dimanche 19h — Revues)

**État** : KPIs hardcoded (47/12/15/9h/4/5), citation démo, cap démo, posture démo.

**Manque critique** : revue hebdo = moment **plus haut levier** du produit (1 fois/sem, 30 min, alimente toute la semaine). Sous-investi.

---

## 5. Page-par-page — verdict détaillé

| Page | Note | Forces | Régressions / Manques |
|---|---|---|---|
| Cockpit | 7/10 | Hero narratif, alertes, Big Rocks visu | Pas de carrousel "live", suggestions heuristique pas LLM, KPI basics |
| Arbitrage | 6/10 | Modal verdict + raccourcis, big blocks | Pas keyboard nav, pas inbox-zero, pas pause/reprise |
| Décisions | 7/10 | Cards riches, modal détail, filtres, export | KPI #4 toujours à 0, pas de timeline, pas de critères réutilisables |
| Connaissance | 8/10 | Empty state propre, modal stylé, filter, footer source | Pas de FK group_id, pas de tags libres, pas de FTS5 |
| Assistant | 7/10 | Tool pin câblé, sidebar dynamique, SSE fixé | Pas de contexte serveur, pas de fil ongoing, pas Cmd+J |
| Coaching | 5/10 | Bouton "Discuter" câblé | Données démo, pas de session record, footer v0.5 |
| Revues | 4/10 | Auto-draft LLM existe v0.7 | Tout encore démo (KPIs, citation, cap, mouvement, timeline) |
| Projets | 7/10 | 13 projets, auto-status, summary | Pas de Gantt, pas de Big Rocks rattachés visibles |
| Actions | 7/10 | Buckets, chips dynamiques, toggle | Pas Eisenhower, pas Pomodoro, pas drag-drop entre buckets |
| Équipe | 6/10 | 77 contacts, recence, volume | Pas "qui m'attend ?", pas de relances IA |
| Agenda | 5/10 | Grille hebdo /api/events | Sync Outlook script PS manuel, pas drag-drop date |
| Évening | 6/10 | Rituel humeur/énergie/top3, streak | Pas de résumé auto, pas de capture audio |
| Settings | 6/10 | 8 onglets clairs, ANTHROPIC_API_KEY | Bouton sync désactivé, placeholders v0.7/v0.8 |
| Onboarding | 7/10 | Wizard 3 étapes propre | Pas d'import bulk Notion/Linear/Asana |

**Note moyenne pondérée** : **6.3/10**.

---

## 6. Frictions UX critiques (priorité d'attaque)

**P0 — Régressions du marché** :
1. Pas de keyboard-first sur l'arbitrage (Superhuman / Linear sont 100% navigables clavier)
2. Pas de Cmd+K palette de commandes globale (anormal pour un produit IA-first)
3. Pas de batch LLM dans les requêtes (cher et lent)

**P1 — Manques que la maquette résolvait** :
4. Pas de panel détail latéral persistant sur arbitrage (modal = compromis acceptable mais inférieur)
5. Pas de "navigateur de raccourcis" complet (↑↓ + ⌘ undo + ⌘ apply manquent)
6. Pas de Big Rocks rappelés en topbar arbitrage (la maquette avait pills SCIS/AMP/ETIC)
7. Pas de session arbitrage persistante (compteur sans pause/reprise)

**P2 — Cohérence visuelle** :
8. Inline styles partout dans bind-*.js post-S6.8
9. Pas de light/dark mode (standard 2025 pour un outil 12h/jour)
10. Pas de versions responsives mobile (CEO en déplacement = produit inutilisable)

---

## 7. Manques fonctionnels vs concurrents

| Fonctionnalité | Reflect | Mem | Notion AI | Linear | aiCEO |
|---|---|---|---|---|---|
| Recherche full-text instantanée | ✅ | ✅ | ✅ | ✅ | ❌ pas FTS5 |
| Cmd+K palette globale | ✅ | ✅ | ✅ | ✅ | ❌ |
| Mode keyboard-first | ⭐ | ⭐ | ✅ | ⭐ | ❌ |
| Daily digest auto | ✅ | ✅ | ❌ | ❌ | Partiel |
| Backlinks bidirectionnels | ✅ | ✅ | ✅ | ❌ | ❌ |
| AI capture audio | ❌ | ✅ | ❌ | ❌ | ❌ |
| Batch LLM operations | — | — | ✅ | ✅ | ❌ |
| Mobile native | ✅ | ✅ | ✅ | ✅ | ❌ |
| Offline-first | ⭐ | ⭐ | ❌ | ❌ | ✅ SQLite |
| Sync calendrier 2-way | ✅ | ❌ | ❌ | ✅ | ❌ read-only |

**aiCEO gagne sur** : 100% local, zero-cloud, intégration Outlook native (avantage RGPD).
**aiCEO perd sur** : tout ce qui est productivité quotidienne fluide.

**Conséquence stratégique** : aiCEO est positionné comme outil souverain, pas comme outil rapide. Niche viable mais ICP très précis (CEO européen sensible à la souveraineté).

---

## 8. Risques produit identifiés

| # | Risque | Action |
|---|---|---|
| R1 | Dette UX cumulative (50% temps maintenance dans 6 mois) | Geler 1 sprint sur 4 pour DS consolidation |
| R2 | Churn LLM (Anthropic peut changer prix/tools) | Abstraire le tool layer pour basculer GPT/Mistral en 1 j |
| R3 | Attention au CEO unique (tout conçu pour Major Fey) | Seed data + onboarding plus généreux pour Lamiae/CEO pair |
| R4 | Sidebar surchargée (14 entrées → 20+ bientôt) | Passer à modèle "core 8 + tabs internes" |
| R5 | Pas de monitoring temps de réponse perçu | Skeleton loading partout + budget temps par interaction |

---

## 9. Recommandations priorisées

**Top 5 actions à investir** (cf. plan détaillé dans `PLAN-REALIGNEMENT-2026-04-28.md`) :

1. **Sprint S6.9 — DS consolidation** (1.5 j-binôme)
2. **Sprint S6.10 — Keyboard-first arbitrage** (1 j)
3. **Sprint S6.11 — Cmd+K palette + recherche FTS5** (1 j)
4. **Sprint S6.12 — Contexte LLM enrichi** (1 j)
5. **Sprint S6.13 — Revues hebdo refondue** (1 j)

**Total** : ~5.5 j-binôme = 1 sprint compact à 6h chrono Claude soit ~2 semaines du CEO.

**ROI estimé** : produit passe de **6.3/10 à 8.5/10**, devient comparable à Reflect/Mem sur la vitesse, conserve avantage souveraineté.

---

## Sources

- Mandat verbal CEO 28/04/2026 PM late
- Maquette source `04_docs/_design-v05-claude/claude_design/vague_1/`
- Code analysé : commit `a6e4d25` (HEAD)
- ADR `2026-04-28 v6 · Sprint S6.8 livré`
- Screenshots cockpit + arbitrage + connaissance + assistant + décisions partagés en session

