# Sprint S6.16 — BETA Lamiae (validation utilisateur réelle)

> **Effort** : 1 j-binôme + 3 j calendaire (usage Lamiae)
> **Position** : Fin Phase 1 (semaine 4)
> **Origine** : recommandation R-2 analyse stratégique CEO 28/04 PM late
> **Critique** : ne pas attendre la fin du chemin pour valider auprès d'un user externe

---

## 1. Problème adressé

**Risque R3** identifié dans l'analyse stratégique : *effet tunnel — 12 semaines avant retour utilisateur*. Si Lamiae est onboardée seulement en S7.9 (semaine 11), tous les sprints précédents reposent sur les hypothèses de Major Fey seul.

Conséquence si Lamiae rejette : 18 j-binôme brûlés sur de mauvaises hypothèses.

**Standard du métier** : onboarder un user externe **avant la moitié du chemin**, idéalement semaine 4-5.

---

## 2. Protocole

### 2.1 Préparation (J0, 4h binôme)

- Setup poste Lamiae (Windows + Outlook)
- Install aiCEO depuis git clone + node + ANTHROPIC_API_KEY
- Seed de quelques décisions/tâches/projets génériques (pas les vraies données ETIC privées)
- Briefing 30 min : promesse produit, parcours type matin, soir, hebdo
- Cheat-sheet imprimée : raccourcis clavier + URL pages

### 2.2 Période d'usage (3 j calendaire, autonome)

Lamiae utilise aiCEO en parallèle de ses outils habituels :
- **Jour 1** : arbitrage matin + bilan soir
- **Jour 2** : ajouter Assistant + Connaissance + Décisions
- **Jour 3** : revue hebdo (même si forcée hors cycle)

Lamiae note ses frictions dans un Google Doc partagé.

### 2.3 Debrief (1h binôme)

3 questions canoniques :
1. **What surprised you ?** (positivement ou négativement)
2. **What was confusing ?** (UX, vocabulaire, workflows)
3. **What's missing ?** (vs ses outils actuels)

Output : tableau "Frictions × Sévérité × Impact V1".

### 2.4 Ajustements roadmap (1h)

En fonction des frictions :
- **P0 (bloquant V1)** : insérer un sprint correctif avant Phase 2
- **P1 (important)** : intégrer dans Phase 2 ou Phase 3
- **P2 (mineur)** : backlog post-V1

---

## 3. Critères de validation

| Métrique | Seuil minimum |
|---|---|
| Time-to-first-decision | < 5 min |
| Tâches générées par arbitrage matin | ≥ 5 |
| Streak après 3 jours | 3 (3/3 rituels soirée) |
| Bugs critiques rencontrés | ≤ 2 |
| NPS Lamiae | ≥ 6/10 |
| Verbatim "Je l'utiliserais en prod" | OUI ou OUI conditionnel |

**Si tous critères passés** : Phase 2 lancée avec confiance.
**Sinon** : retour cadrage, revue de la promesse + roadmap ajustée.

---

## 4. Risques

| # | Risque | Mitigation |
|---|---|---|
| R1 | Lamiae trop polie pour critiquer | Insister sur les frictions, fournir des exemples de critiques attendues |
| R2 | Bugs Windows spécifiques (chemins, permissions) | Faire un dry-run install sur poste similaire avant |
| R3 | Lamiae trop occupée pour 3 j d'usage | Cadrer en avance, planifier ses 3 jours, prévoir un fallback session 2h |
| R4 | Données ETIC privées dans la base | Seed data anonymisée, pas d'import emails réels Lamiae |

---

## 5. Tasks J0

| # | Task | Effort |
|---|---|---|
| 1 | Préparer poste Lamiae (clone + node + .env) | 1.5h |
| 2 | Seed data générique (4 projets, 8 tâches, 3 décisions, 5 contacts, 12 emails fixtures) | 1h |
| 3 | Briefing 30 min + cheat-sheet imprimée | 30 min |
| 4 | Debrief 1h en J+3 | 1h |
| 5 | Ajustement roadmap selon frictions | 1h |

**Total** : 5h ≈ 1 j-binôme + 3 j calendaire (usage Lamiae)

---

## 6. Livrables

- Setup poste Lamiae fonctionnel
- Seed data anonymisée
- Frictions log (Google Doc partagé)
- Tableau "Frictions × Sévérité × Impact V1"
- Roadmap ajustée selon retour Lamiae
- ADR `2026-XX · Beta Lamiae S6.16` avec verdict GO/NO-GO Phase 2

---

## 7. Sources

- Recommandation R-2 analyse stratégique CEO 28/04 PM late
- Risk R3 (effet tunnel) — analyse synthétique
- ROADMAP V2 originale (Lamiae prévue S7.9 → trop tard)
