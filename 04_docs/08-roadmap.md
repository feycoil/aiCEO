# aiCEO — Roadmap & PMO

**Version 1.0 · 23 avril 2026 · 18 mois de trajectoire**

> Plan d'exécution PMO par phases, avec jalons, livrables, dépendances, équipe minimale, et signaux de go/no-go pour passer à la phase suivante.

---

## 1. La vision en 4 jalons

```
  T2 2026          T4 2026          T2 2027          T4 2027
    │                │                │                │
    ▼                ▼                ▼                ▼
  ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
  │  MVP   │     │   V1   │     │   V2   │     │   V3   │
  │        │     │        │     │        │     │        │
  │ Réactif│────▶│Proactif│────▶│ Équipe │────▶│ Coach  │
  │ mono   │     │  mono  │     │ multi  │     │ coach  │
  └────────┘     └────────┘     └────────┘     └────────┘

  "Je vois       "Je reçois      "On travaille    "Je suis
   tout."         des props."     à plusieurs."    mieux."
```

### Promesse par jalon

- **MVP (fin T2 2026)** : *"Je vois tout ce qui compte sans rouvrir 4 apps."*
- **V1 (fin T4 2026)** : *"Mon copilote me pousse des actions prêtes à valider."*
- **V2 (fin T2 2027)** : *"Mon équipe utilise aussi l'outil, on est alignés."*
- **V3 (fin T4 2027)** : *"L'outil me rend du temps et me garde en forme."*

---

## 2. MVP — Fondations (T2 2026, 10 semaines)

### Objectif

Remplacer le jonglage quotidien entre Outlook, SharePoint, Teams, bloc-note par **une seule interface consolidée** pour Feycoil, avec un copilote IA encore réactif (répond quand on lui parle, observe mais ne pousse pas beaucoup).

### Périmètre fonctionnel

**F1 · Cockpit consolidé.** Page d'accueil avec intention de la semaine, Big Rocks, tâches du jour, prochains RDV, propositions IA. Déjà prototypé.

**F2 · Vue par société.** Une page par entité (Adabu, Start, AMANI, ETIC) avec intention, décisions en cours, chantiers actifs, équipe, RDV. Déjà prototypé.

**F3 · Revue hebdo manuelle.** Écran de revue hebdo avec Big Rocks, bilan S-1, cap S+1. Déjà prototypé.

**F4 · Agenda consolidé.** Grille 7 jours × heures, événements multi-sources (Outlook + perso), portlets sans bordure grasse. Déjà prototypé.

**F5 · Tâches unifiées.** Liste de toutes les tâches (multi-sources), filtres par société et statut, bouton déléguer (nudge en place).

**F6 · Intégration Outlook basique.** OAuth Entra ID, lecture mails (Mail.Read), sync delta toutes les 15 min.

**F7 · Copilote réactif.** Chat latéral qui répond aux questions ("prépare-moi le brief Adabu"), rédige des brouillons (email, mémo, résumé). Pas encore proactif.

**F8 · Délégation assistée.** Pour chaque tâche : bouton "déléguer", IA pré-rédige le brief, mail envoyé manuellement, suivi créé.

**F9 · Traçabilité minimale.** Chaque proposition IA a une source (mail, event), un bouton "pourquoi ?", historique acceptations/rejets.

### Livrables

- Application web déployée (Vercel) accessible à Feycoil.
- Intégration Outlook (Mail + Calendar) fonctionnelle.
- 7 pages opérationnelles (cockpit, 4 sociétés, agenda, tâches, revues).
- Dashboard proposition IA (copilote).
- Auth Entra ID stabilisée.

### Équipe minimale

- 1 product designer (Feycoil lui-même en dogfood + designer externe 0.5 ETP).
- 1 fullstack dev (Node + Vanilla HTML/JS).
- 1 AI engineer (intégration LLM, MCP).
- Soutien PMO 0.2 ETP.

### Budget estimé

- Dev : 10 sem × 3 ETP × 900 €/j × 4.5 j/sem ≈ **120 k€**.
- Infra (LLM, Supabase, hébergement UE, Graph) : ~2 k€ sur la période.
- Design externe : ~10 k€.
- **Total MVP : ~132 k€**.

### Critères de go/no-go V1

- Feycoil utilise aiCEO **au moins 5 jours/7** pendant 3 semaines consécutives.
- Au moins **2 tâches déléguées via aiCEO par semaine**.
- **Rituels matin + soir adoptés** ≥ 60 % des jours ouvrés.
- **Zéro incident sécurité** (fuite token, prompt injection réussie).
- Taux de satisfaction de Feycoil ≥ 7/10 en NPS interne.

---

## 3. V1 — Copilote proactif (T3-T4 2026, 16 semaines)

### Objectif

Le copilote passe de **réactif à proactif**. Il tourne en fond, détecte les signaux, et pousse des propositions préparées. Feycoil arrive le matin avec "8 propositions préparées, gain estimé 47 min".

### Périmètre fonctionnel

**F10 · Copilote en fond (Inngest).** Jobs scheduled + webhooks Graph. Sub-agents spécialisés (mail, calendar, task, deleg, meeting-prep, weekly-review).

**F11 · Mémoire long-terme.** Postgres + pgvector, 3 strates (identity, preference, episode). Résumés roulants hebdo. Extraction de préférences après 60 jours.

**F12 · Rituels intégrés.** Matin (check-in + intention + top 3), soir (shutdown), dimanche (revue hebdo auto). Mode nuit post-shutdown.

**F13 · Délégation pro.** Matrice de confiance par équipier (silencieuse), propriétaire naturel calculé, brief IA rédigé, suivi automatique (J+2, J+5), relance assistée.

**F14 · Traçabilité totale.** Chaque action IA → log Langfuse + UI "pourquoi ?". Dashboard transparence (tokens consommés, propositions émises, taux acceptation) visible au CEO.

**F15 · Intégration SharePoint.** RAG sur documents CEO, permissions trimmées, embeddings Voyage-3.

**F16 · Détection signaux burnout.** Croisement mails > 22h, weekends actifs, score humeur, taux acceptation — intervention contextuelle douce.

**F17 · Migration SolidJS progressive.** Islands architecture, commencer par le cockpit puis pages sociétés.

**F18 · Design system étendu.** Drawer réutilisable, view switcher 5 formats, source pill standardisée, command palette (Cmd+K).

**F19 · Premières visualisations riches.** Carte radiale sociétés, arbre Big Rocks, timeline décisions.

### Livrables

- Copilote proactif stable (> 15 propositions/jour sans plantage).
- Mémoire hiérarchique éprouvée (3+ mois d'historique).
- Rituels adoptés par Feycoil.
- Dashboard observabilité + transparence.
- 3 visualisations riches opérationnelles.

### Équipe

- Extension à **2 fullstack dev**.
- 1 AI engineer + 1 consultant LLM senior (0.3 ETP).
- 1 product designer temps plein.
- PMO 0.3 ETP.

### Budget estimé

- Dev : 16 sem × 4.3 ETP × 900 €/j × 4.5 j/sem ≈ **280 k€**.
- Infra V1 (Bedrock EU, Supabase Team, Inngest, Langfuse) : ~8 k€.
- **Total V1 : ~290 k€**.

### Critères de go/no-go V2

- Taux d'acceptation propositions IA ≥ 55 % sur 60 jours.
- Temps CEO gagné déclaré ≥ 5h/semaine.
- Ratio délégation/exécution ≥ 40 %.
- Rituels matin/soir effectués ≥ 80 % des jours ouvrés.
- Zéro incident majeur sécurité / coût.
- Validation explicite de Feycoil pour ouvrir à l'équipe.

---

## 4. V2 — Ouverture équipe (T1-T2 2027, 20 semaines)

### Objectif

Passer de **mono-CEO à multi-utilisateur**. DG adjoint, AE, collaborateurs proches ont leur propre vue, complémentaire à celle du CEO. Les décisions et tâches circulent, les silos se cassent.

### Périmètre fonctionnel

**F20 · Multi-tenant Supabase (RLS).** Isolation par org, rôles (CEO, DG, AE, manager, collaborateur).

**F21 · Vues rôle-spécifiques.** AE voit l'agenda + les tâches à planifier ; DG voit les décisions en cours + projets assignés. Le CEO garde sa vue totale.

**F22 · Délégation réelle (end-to-end).** Quand le CEO délègue, la tâche apparaît dans aiCEO du destinataire (Marie voit sa liste aiCEO). Suivi visible des deux côtés.

**F23 · Intégration Teams.** Messages directs, mentions dans canaux, présence. Le copilote peut "pinguer" un collaborateur.

**F24 · Comité stratégique intégré.** Workflow dédié : préparation IA (ODJ, briefs par sujet), canvas de décision pendant la séance, PV post-séance automatique, suivis.

**F25 · Canvas tldraw + agent visible.** Pensée visuelle collaborative : le CEO (et son équipe) peut dessiner, l'agent réorganise, enrichit, pousse dans un brief.

**F26 · Graphe Cytoscape.** Vue réseau des parties prenantes d'une décision, des dépendances inter-projets.

**F27 · Dashboard équipe.** Pour le CEO : vue synthèse des charges de chaque équipier (matrice confiance, charge actuelle, disponibilités).

**F28 · SOC 2 Type II.** Audit via Vanta/Drata. Conformité complète RGPD.

### Livrables

- App multi-utilisateur avec isolation stricte.
- Intégration Teams opérationnelle.
- Canvas IA collaboratif (tldraw).
- Graphe visuel du réseau.
- Certification SOC 2 en cours.

### Équipe

- Équipe consolidée à **4 fullstack + 2 AI + 1 DevSecOps + 1 designer + PMO 0.5 ETP** = ~8 ETP.

### Budget estimé

- Dev : 20 sem × 8 ETP × 900 €/j × 4.5 j/sem ≈ **648 k€**.
- Infra V2 : ~20 k€ sur la période.
- Certification SOC 2 : ~25 k€.
- **Total V2 : ~693 k€**.

### Critères de go/no-go V3

- ≥ 5 utilisateurs actifs quotidiens dans l'écosystème ETIC.
- Temps CEO gagné ≥ 8h/semaine maintenu.
- Utilisation Teams natif baisse ≥ 30 % (remplacé par aiCEO).
- Certification SOC 2 obtenue.
- Feycoil valide le packaging pour commercialisation.

---

## 5. V3 — Coaching stratégique (T3-T4 2027, 16 semaines)

### Objectif

Transformer aiCEO d'assistant en **coach stratégique**. Questions socratiques, pattern detection long-terme, anti-burnout actif. Le CEO se sent non seulement efficace mais **mieux** qu'avant aiCEO.

### Périmètre fonctionnel

**F29 · Coach conversationnel activable.** Modes "arbitrage", "je me sens coincé", "revue stoïque". Claude Opus 4.6+ pour cette couche.

**F30 · Journal de reconnaissance.** Module discret pour Feycoil : 3 reconnaissances/jour, visible sur demande.

**F31 · Détection burnout active.** Croisement multi-signaux avec interventions graduées (question → nudge → bloc focus proposé → journée off proposée).

**F32 · Boîte à outils psychologique.** Respiration guidée, méditations, recadrage cognitif, carnet des victoires.

**F33 · Post-mortem automatique.** Quand un Big Rock échoue ou qu'une décision ne se concrétise pas, l'IA pousse une rétrospective structurée.

**F34 · Offline-first (ElectricSQL).** Sync Postgres ↔ SQLite, usage en avion.

**F35 · Application mobile compagnon.** iOS + Android PWA, lecture rapide et validation de propositions, capture vocale.

**F36 · Multi-CEO (écosystème ETIC).** Ouverture contrôlée à 2-3 autres CEO de l'écosystème.

### Livrables

- Coach conversationnel opérationnel.
- Boîte à outils bien-être.
- App mobile.
- Pack multi-CEO avec isolation stricte.

### Équipe

- Équipe stabilisée à **8-10 ETP**, plus un psychologue consultant 0.2 ETP pour la couche coaching.

### Budget estimé

- Dev : 16 sem × 9 ETP × 900 €/j × 4.5 j/sem ≈ **583 k€**.
- Consulting psycho : ~15 k€.
- **Total V3 : ~598 k€**.

---

## 6. Backlog priorisé (RICE)

Méthodologie **RICE** = Reach × Impact × Confidence / Effort.

### Top 15 features MVP + V1 (extrait)

| ID | Feature | Reach | Impact | Confidence | Effort (sem) | Score |
|---|---|:-:|:-:|:-:|:-:|:-:|
| F1 | Cockpit consolidé | 10 | 3 | 0.9 | 2 | 13.5 |
| F6 | Intégration Outlook basique | 10 | 3 | 0.95 | 3 | 9.5 |
| F7 | Copilote réactif (chat) | 10 | 3 | 0.85 | 3 | 8.5 |
| F10 | Copilote proactif (Inngest) | 10 | 3 | 0.7 | 5 | 4.2 |
| F8 | Délégation assistée | 10 | 3 | 0.9 | 3 | 9.0 |
| F11 | Mémoire long-terme | 10 | 2.5 | 0.7 | 4 | 4.4 |
| F12 | Rituels intégrés | 10 | 3 | 0.85 | 2 | 12.8 |
| F15 | Intégration SharePoint | 10 | 2 | 0.8 | 3 | 5.3 |
| F17 | Migration SolidJS | 10 | 2 | 0.75 | 6 | 2.5 |
| F19 | Viz riches (radiale, arbre) | 10 | 3 | 0.8 | 3 | 8.0 |
| F22 | Délégation end-to-end | 5 | 3 | 0.7 | 4 | 2.6 |
| F24 | Comité stratégique intégré | 2 | 3 | 0.6 | 4 | 0.9 |
| F25 | Canvas tldraw + agent | 10 | 2.5 | 0.6 | 6 | 2.5 |
| F29 | Coach conversationnel | 10 | 2.5 | 0.5 | 5 | 2.5 |
| F31 | Détection burnout active | 10 | 3 | 0.55 | 4 | 4.1 |

Scores calculés pour 1 utilisateur (Feycoil) en MVP/V1. Les `reach` montent à 5-10 en V2+.

### Backlog détaillé

Un fichier Excel dédié `09-backlog.xlsx` contient le backlog complet avec 40+ features, critères d'acceptation, dépendances, owners, estimations.

---

## 7. Dépendances & chemin critique

```
  Auth Entra ID (S1)
         │
         ▼
  Graph API Outlook (S2) ──────┐
         │                     │
         ▼                     ▼
  Cockpit UI (S2)        Tâches base (S3)
         │                     │
         ▼                     │
  Chat copilote (S3)           │
         │                     │
         └──────────┬──────────┘
                    ▼
           Agent SDK + LangGraph (S4-S5)
                    │
                    ▼
           Inngest + proactif (S6-S7)
                    │
                    ▼
           Mémoire pgvector (S8-S9)
                    │
                    ▼
           SharePoint RAG (S10)
                    │
                    ▼
           Rituels intégrés (S11)
                    │
                    ▼
           Viz riches (S12-S14)
                    │
                    ▼
           Migration SolidJS (S15-S16, en parallèle)
```

Chemin critique **14 semaines** jusqu'à V1 fonctionnelle. Migration SolidJS non bloquante.

---

## 8. KPIs de pilotage PMO

### Par sprint

- **Velocity** (points livrés).
- **Lead time** (temps d'une feature de backlog à prod).
- **Bug ratio** (bugs introduits par feature livrée).
- **Couverture tests** (viser 70 % back, 50 % front).

### Par mois

- **DAU Feycoil** (jours d'usage effectifs sur 30).
- **Taux de propositions acceptées**.
- **Temps CEO gagné déclaré** (sondage mensuel).
- **Burn financier** vs budget.
- **Incidents P0/P1**.

### Par trimestre

- **Score NPS Feycoil**.
- **Atteinte des jalons go/no-go**.
- **Coût LLM par proposition acceptée** (doit baisser avec l'apprentissage).
- **Conformité RGPD / SOC 2** (audit interne).

---

## 9. Rituels PMO

- **Daily standup 15 min** (équipe dev) — 9h.
- **Demo hebdo 30 min** (Feycoil + équipe) — vendredi 15h.
- **Sprint review 1h** (tous les 2 semaines).
- **Sprint retro 45 min** (tous les 2 semaines).
- **Product review mensuel 2h** avec Feycoil — arbitrages backlog + priorisation.
- **Board review trimestriel 3h** — ExCom ETIC Services, bilan + cap.

---

## 10. Gestion des risques (top 8)

| Risque | Proba | Impact | Score | Mitigation |
|---|:-:|:-:|:-:|---|
| Prompt injection via mail | Med | Haut | 6 | Prompt Shields + human-approval |
| Dérive coûts LLM | Med | Moy | 4 | Budgets par agent + circuit breakers |
| Feycoil décroche (pas d'adoption) | Low | Haut | 4 | Dogfood hebdo, feedback continu, MVP usable vite |
| Refus de l'équipe à la V2 | Med | Haut | 6 | Implication AE + DG dès V1, onboarding dédié |
| Expiration tokens M365 | Med | Moy | 4 | Refresh proactif, alertes |
| Régression UI pendant migration SolidJS | Haut | Moy | 6 | Migration îlots par page, tests Playwright |
| Dépendance LLM providers | Low | Haut | 4 | LiteLLM multi-provider, exports mémoire JSON |
| Retard jalon V1 (>4 sem) | Med | Haut | 6 | MVP minimal viable, priorisation RICE stricte |

---

## 11. Gouvernance

### Qui décide quoi

- **Product vision** : Feycoil.
- **Roadmap trimestrielle** : Product owner + Feycoil + CTO.
- **Priorisation sprint** : Product owner.
- **Architecture technique** : CTO.
- **Design system** : Design lead.
- **Budget / recrutement** : Feycoil (CEO).

### Instance décisionnelle

- **Hebdo** : Product review (Feycoil + PO + CTO).
- **Mensuel** : Sprint planning (équipe + Feycoil 30 min).
- **Trimestriel** : Board review (ExCom ETIC Services).

---

## 12. Synthèse — le plan en une page

```
2026 T2 · MVP       2026 T4 · V1       2027 T2 · V2       2027 T4 · V3
────────            ────────           ────────           ────────
Réactif mono        Proactif mono      Multi-user         Coach
10 sem · 132k€      16 sem · 290k€     20 sem · 693k€     16 sem · 598k€
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cockpit             Copilote fond      Multi-tenant       Coach convers
Sociétés            Mémoire LT         Délégation e2e     Anti-burnout
Agenda              Rituels            Teams              Boîte outils
Tâches              SharePoint         Comité intégré     Mobile
Outlook             Viz riches (3)     Canvas tldraw      Offline
Copilote réactif    SolidJS            Graphe             Multi-CEO
Délégation assist.  Dashboard transp.  SOC 2              Writing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Dogfood Feycoil     Dogfood + validation      Équipe ETIC    Écosystème
```

**Budget 18 mois total : ~1.7 M€** (équipe ~6-8 ETP à plein régime).
**Équipe à plein régime : 8-10 personnes en V2/V3.**

---

*Document lié : `01-vision-produit.md` · `09-backlog.xlsx` · `06-architecture.md`*
