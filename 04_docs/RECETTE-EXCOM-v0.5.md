# RECETTE EXCOM — aiCEO v0.5 internalisée

**Date cible présentation** : ExCom du XX/05/2026 (à caler)
**Audience** : ExCom (CEO + 5-7 directions opérationnelles)
**Durée** : 30 minutes (15 min démo live + 10 min Q&R + 5 min décision suite)
**Format** : démo écran partagée sur le poste CEO Windows · slides minimales (pas de pitch deck investisseur)
**Livrable post-ExCom** : décision GO/NO-GO sur **ouverture phase v1** (multi-tenant + équipes + intégrations + mobile)

---

## §0 — Contexte (1 minute parlée, pas de slide)

> *"Il y a 6 mois (octobre 2025), j'ai annoncé à l'ExCom mon intention de me doter d'un copilote IA exécutif pour reprendre le contrôle de mon agenda et de ma charge mentale. En janvier 2026, j'ai obtenu un GO pour investir 110 k€ sur 8 semaines de cadrage + développement internalisé. Aujourd'hui, je vous présente le résultat : v0.5 livrée, dogfood depuis 1 mois, zéro outil externe, prêt pour scaler."*

Métriques à mentionner en intro :
- **Budget** : 110 k€ engagés, 100 % consommés (97,4 k€ direct + 12,6 k€ provision V1)
- **Temps réel** : 5 sprints livrés en **~16 h chrono cumulées** (vs 13 semaines BASELINE = ~520 h équivalent ETP)
- **Code livré** : 1 backend Express + SQLite, 12 pages frontend, 4 routes assistant streaming Claude, ~95 tests verts, ~30 k lignes de code + doc
- **Dogfood CEO depuis** : 25/04/2026 (jour de livraison S1+S2+S3) — usage quotidien intensif

---

## §1 — Démo live (15 minutes chrono)

### Scène 1 — Cockpit matinal (3 min)

1. **Ouvrir** raccourci Bureau "Cockpit aiCEO" → `http://localhost:4747/`
2. **Pointer** : intention du jour, 3 big rocks de la semaine, alerte Outlook last-sync, compteurs tâches/décisions ouvertes
3. **Cliquer** une carte tâche → drawer source à droite avec contexte email/réunion d'origine
4. **Souligner** : "tout est temps réel via SSE — pas de F5, pas de cache, source de vérité unique = SQLite serveur"

### Scène 2 — Arbitrage matin (3 min)

1. **Naviguer** `/arbitrage`
2. **Pointer** : 3 colonnes (Faire / Déléguer / Reporter), drag-drop natif, top 3 priorités calculées par IA Claude
3. **Drag** une tâche depuis "Faire" vers "Déléguer" → modal apparaît avec brouillon de mail pré-rédigé Claude (basé sur contexte email + équipe)
4. **Cliquer** "Sauvegarder décision" → tâche disparaît de l'inbox, apparaît dans `/decisions` avec source-link
5. **Souligner** : "le LLM fait l'arbitrage cognitif lourd — moi je tranche en 5 minutes ce qui prenait 1h"

### Scène 3 — Assistant chat live (3 min)

1. **Naviguer** `/assistant`
2. **Pointer** : sidebar conversations (historique persistant SQLite), thread principal
3. **Taper** : "Quelles décisions sont en attente d'exécution depuis plus de 5 jours ?" + Ctrl+Enter
4. **Pointer** : streaming Claude chunk-par-chunk (SSE), réponse contextualisée avec liens vers décisions
5. **Cliquer** une décision référencée → ouvre `/decisions` avec ligne mise en évidence
6. **Souligner** : "Claude voit MA base de données métier — pas un chatbot générique. C'est mon copilote, il connaît mes projets."

### Scène 4 — Portefeuille drill-down (3 min)

1. **Naviguer** `/groupes` → 3-4 cards groupe avec progression moyenne
2. **Cliquer** card "Détail" → drawer avec liste projets du groupe
3. **Cliquer** un projet → page projet `/projet?id=xxx` avec 5 KPIs + tâches + décisions liées
4. **Naviguer** `/contacts` → recherche "Ansquer" → carte contact avec mailto direct
5. **Souligner** : "vue d'avion sur 360°, drill-down 3 clics du portefeuille à l'action concrète"

### Scène 5 — Revue hebdo + IA (3 min)

1. **Naviguer** `/revues` → liste des 12 dernières semaines
2. **Cliquer** semaine courante → 3 Big Rocks éditables inline
3. **Cliquer** "Demander brouillon Claude" → markdown structuré 4 sections généré par IA (focus, ton, top 3 demain, écarts)
4. **Souligner** : "le rituel hebdo est le pilier méta-cognition. L'IA fait le brouillon, moi je tranche et je commit."

---

## §2 — Q&R typiques (10 min — préparer réponses)

| Question probable | Réponse préparée |
|---|---|
| Combien ça coûte en API Claude par mois ? | ~50-150 €/mois selon volume conversations + arbitrage. Cap `max_tokens 1500` sur l'assistant + contexte limité. |
| Mes données partent où ? | SQLite **local** sur poste CEO. Pas de cloud applicatif. Seul l'API Claude voit les prompts (contexte transitoire). Pour V1 multi-tenant : cloud privé Supabase + RLS. |
| Compatible avec un autre CEO de notre groupe ? | Oui en l'état. C'est exactement le point d'entrée v1 : on déploie le même setup chez un CEO pair (cf. ONBOARDING-CEO-PAIR.md mis à jour). |
| Que se passe-t-il si Claude est down ? | Mode démo automatique : l'arbitrage IA et le brouillon délégation tombent sur templates locaux statiques. Le cockpit, les tâches, les décisions restent fonctionnels (SQLite local). |
| Combien de temps pour onboarder un nouveau CEO ? | 30 minutes installation (cf. INSTALL-WINDOWS.md, 9 sections, 8 cas troubleshooting). Puis 1 semaine pour s'approprier les rituels. |
| Sécurité données client ? | Aucune donnée client dans aiCEO en l'état (uniquement données internes CEO : tâches, décisions, projets, contacts internes). Pour V1, RLS Supabase + audit Langfuse. |
| Migration vers Microsoft Copilot un jour ? | Non, philosophie inverse : Copilot = générique grand public. aiCEO = spécifique métier exécutif, contrôle total de la stack. |
| Coût V1 estimé ? | À cadrer en kickoff V1 post-décision ExCom. Ordre de grandeur : 200-300 k€ pour multi-tenant + mobile + intégrations Teams. À valider après benchmark Supabase + ElectricSQL. |

---

## §3 — Décision suite (5 min)

### Option A — GO V1 immédiat (recommandé)

- Cadrage V1 = 2 semaines (mai 2026)
- Périmètre cible V1 : multi-tenant + auth + équipes + Teams + mobile + backup SQLite auto + winston-daily-rotate-file
- Budget cible : 200-300 k€ sur 6 mois (à affiner en kickoff V1)
- Démarrage exécution : juin 2026

### Option B — Pause + observation 3 mois

- Continuer dogfood CEO solo jusqu'à juillet 2026
- Mesurer : adoption rituels, gain temps réel, plaintes, frictions
- Décision V1 reportée septembre 2026

### Option C — STOP

- Garder v0.5 en l'état (CEO solo)
- Pas d'expansion équipes / multi-tenant
- Coût : 0 sur expansion, mais perte momentum + pas de scaling investissement

**Recommandation préparée** : **Option A**, sur les arguments suivants :
- Vélocité prouvée (5 sprints en 16h vs 13 semaines plan)
- Architecture multi-tenant déjà compatible (SQLite isolé par utilisateur via `AICEO_DB_OVERRIDE`)
- Pression marché : Microsoft annonce Copilot CEO en 2027, fenêtre d'avance limitée
- Coût marginal V1 absorbable (200-300 k€ vs valeur stratégique différenciation managériale)

---

## §4 — Annexes (à projeter en backup si questions)

- `04_docs/_release-notes/v0.5.md` — synthèse 5 sprints, métriques, breaking changes
- `04_docs/INSTALL-WINDOWS.md` — install reproductible 30 min sur poste Windows
- `04_docs/api/S4.md` — doc API endpoints assistant (curl examples + parsing SSE)
- `00_BOUSSOLE/DECISIONS.md` — historique 25+ ADRs (cadrage, choix techniques, retours d'expérience)
- `04_docs/11-roadmap-map.html` — roadmap interactive 4 onglets (cap, plan v0.5, journal, releases)
- `consistence-dump.json` — état GitHub (issues, milestones, tags, releases) à date

---

## §5 — Checklist préparation (à cocher avant ExCom)

- [ ] Recette CEO Windows v0.5-s4 + s5 passée 100 %
- [ ] Sync Outlook OK depuis < 4h (pour démo Scène 2 alerte)
- [ ] Au moins 1 conversation assistant avec 3+ messages (pour démo Scène 3 sidebar)
- [ ] Au moins 3 décisions dont 1 exécutée + 1 abandonnée (pour démo Scène 1 compteurs)
- [ ] Au moins 1 revue hebdo committée avec 3 big rocks (pour démo Scène 5)
- [ ] Raccourci Bureau "Cockpit aiCEO" présent et fonctionnel
- [ ] `pwsh -File scripts/smoke-all.ps1` exit 0
- [ ] Tests E2E `npm test` dans `tests-e2e/` exit 0
- [ ] Démo répétée seul en chrono < 16 minutes (1 minute de marge sécurité)
- [ ] Slides backup PDF imprimées au cas où démo plante (`04_docs/_release-notes/v0.5.md` printé)
- [ ] Feuille Q&R imprimée (§2 ci-dessus)
- [ ] Bouton micro/caméra coupés sur poste CEO pendant démo (focus écran partagé)

---

## §6 — Sources

- DOSSIER-SPRINT-S5.md § Pilier 2
- ADR S5.00 méthode S5
- ADR « v0.5 internalisée terminée » (S5.06, à rédiger en clôture)
- 5 release notes : `_release-notes/v0.5-s1.md`, `s2.md`, `s3.md`, `s4.md`, `v0.5.md`
- Issue GitHub #YYY (S5.04)
