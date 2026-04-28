# Journal Sprint v0.7 — LLM + Outlook events + finalisation gaps

> **Démarrage** : 28/04/2026 fin PM late  
> **Mode** : exécution parallèle 3 agents (S6.5 / S6.6 / S6.7) sous coordination Claude  
> **Autorisation CEO** : carte blanche sur décisions design/UX/UI/archi  
> **Objectif** : tag `v0.7` à la fin

---

## 📌 État actuel pré-sprint

- Backend : 14 routes REST · 20 tables SQLite · 4 migrations
- Frontend : 17 pages v06 · 19 bind-*.js · cache `?v=98`
- LLM : `ANTHROPIC_API_KEY` **absente** — implémentation en mode dégradé (rule-based fallback) avec activation auto si clé future
- Status decision actuel : `ouverte | decidee | executee | abandonnee` (manque `reportee`)
- Outlook sync : emails OK (1052 ingérés), events absents

---

## 🎯 Sprints v0.7 lancés en parallèle

| Sprint | Lot | Statut | Notes |
|---|---|---|---|
| **S6.5** | LLM 4 surfaces UX (mode dégradé activable) | 🟡 en cours | Mode rule-based si pas de clé, LLM si présente |
| **S6.6** | Outlook events + status `reportee` | 🟡 en cours | Migration SQL + script PS + bind-arbitrage-board v2 |
| **S6.7** | FK emails→projects + 3 pages preview + tag | 🟡 en cours | Migration FK + UI rattachement + assistant/connaissance/coaching |

---

## 🧠 Décisions prises par Claude (carte blanche CEO)

### D1 — LLM en mode dégradé activable
**Contexte** : `ANTHROPIC_API_KEY` absente du serveur en sandbox.  
**Décision** : implémenter complètement les 4 surfaces UX avec **fallback rule-based** automatique. Si clé présente → LLM live ; sinon → suggestions déterministes (heuristiques) avec mention "Activer ANTHROPIC_API_KEY pour LLM live".  
**Justification** : dogfood Feycoil tourne aujourd'hui sans coût tokens. Mise en service trivial future (juste setter env var).

### D2 — Status `reportee` ajouté via migration ALTER TABLE
**Contexte** : SQLite ne supporte pas `ALTER TABLE` pour modifier un CHECK constraint.  
**Décision** : migration en 3 étapes : (1) renommer table → `decisions_old`, (2) créer table `decisions` avec nouveau CHECK incluant `reportee`, (3) `INSERT INTO decisions SELECT * FROM decisions_old`, (4) drop old.  
**Justification** : pratique standard SQLite recommandée par documentation officielle.

### D3 — fetch-outlook-events.ps1 sur 30 jours rolling
**Contexte** : besoin couverture calendrier passé+futur.  
**Décision** : fetch événements de J-15 à J+30 (vs 30j passés pour emails).  
**Justification** : un manager voit son passé proche pour références + futur pour planification. Cohérent avec usage agenda.

### D4 — UI rattachement projet dropdown async
**Contexte** : la file d'arbitrage emails a des items kind=task qui pourraient bénéficier d'un projet rattaché.  
**Décision** : ajouter un dropdown "Rattacher au projet…" dans la card proposition arbitrage. Liste fetch `/api/projects` async. Bouton "Suggérer" propose match `inferred_project` ↔ slug projet.  
**Justification** : l'utilisateur voit le contexte au moment d'accepter, pas a posteriori.

### D5 — Pages preview câblées sans LLM (mode statique)
**Contexte** : connaissance.html et coaching.html prévues v0.7 avec LLM.  
**Décision** : câbler en lecture DB (knowledge_pins, evening_sessions) avec interactions de base, **sans LLM Opus pour coaching**. Le LLM coaching sera ajouté V3 si validation produit.  
**Justification** : éviter une dépendance Opus (coût élevé) qui ne se justifie qu'en multi-CEO. v0.7 reste sur Sonnet.

---

## 🔧 Items à faire côté CEO (si bloqué — sinon Claude continue)

Aucun bloqueur connu pour lancer les 3 sprints. Tous les fichiers sont accessibles, SQLite migrations standalone, scripts PowerShell prêts à packager.

**Optionnel mais recommandé après livraison v0.7** :
- Setter `ANTHROPIC_API_KEY` en variable d'environnement Windows pour activer LLM live
- Lancer `pwsh -File scripts/fetch-outlook-events.ps1` (Outlook ouvert) pour ingérer le calendrier
- Recette Ctrl+Shift+R sur chaque page v06 pour valider

---

## 📊 Métriques cible

| Métrique | Cible |
|---|---|
| Durée totale | ≤ 6h chrono cumulées (3 sprints × ~2h) |
| Lignes JS ajoutées | ~1500 |
| Lignes CSS | ~150 |
| Migrations SQL | 3 (events + reportee + emails-fk-projects) |
| Routes ajoutées | 4 (link-project + suggest + 2 LLM helpers) |
| Pages câblées en plus | 3 (assistant, connaissance, coaching) |
| Tests Playwright | ≥ 95 verts (préservés) |
| Cache busts | v=98 → v=104 |

---

## 📝 Activité chronologique (maintenue par Claude)

- **20:00** — Démarrage mission v0.7. Audit état projet OK. Décisions D1-D5 actées.
- **20:00–22:00** — Sprints S6.5 + S