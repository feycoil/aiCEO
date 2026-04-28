# SPIKE — Validation de la promesse ADD-AI

> **Type** : SPIKE de validation rapide (pas un sprint feature)
> **Effort** : 0.5 j-binôme (4h chrono)
> **Position** : J+1 après S6.10-bis (semaine 1, jour 2-3)
> **Origine** : analyse stratégique CEO 28/04 PM late, recommandation R-4 + R-7

---

## 1. Question à laquelle on répond

> *La méthode ADD-AI tient-elle ses promesses chiffrées ?*

Annonces dans `METHODE-ADD-AI-aiCEO.md` :
- **Vélocité ×1.5 à ×2** (effet d'apprentissage cumulatif)
- **Coût tokens −40%** (batch + cache + délégation subagents)
- **Erreurs −80%** (hooks + qa-engineer subagent)
- **Continuité parfaite** cross-sessions

Sans validation, on engage **22 j-binôme** sur de la projection.

---

## 2. Protocole

### 2.1 Mesurer la baseline (S6.8)

D'après les commits S6.8.1 → S6.8.5 :
- 5 commits enchaînés
- ~4h chrono Claude
- ~750k tokens IN + 180k OUT (estimation)
- ~3 erreurs introduites (bug streaming SSE, double empty state, NUL bytes)
- Cost estimé ~4 €

**Action 1** : extraire métriques précises depuis les commits + retex S6.8.

### 2.2 Implémenter une feature équivalente en mode ADD-AI minimal

**Choix** : ajout d'un endpoint + page front simple (équivalent S6.8.1 sidebar activation).
**Cible** : `/api/cockpit/llm-suggestions` mode batch (S7.2 anticipé) ou un nouveau composant atomique.

**Méthode ADD-AI minimale** (Lean) :
- Délégation à `architect` subagent pour ADR
- Délégation à `dev-fullstack` subagent pour code + test
- Délégation à `qa-engineer` subagent pour smoke + audit visuel
- Hook pre-commit obligatoire
- Retex auto en fin

### 2.3 Mesurer

| Métrique | Baseline S6.8 | Cible ADD-AI Lean | Réel |
|---|---|---|---|
| Durée chrono Claude | 4h | ≤ 2.5h | ? |
| Tokens IN consommés | ~750k | ≤ 500k | ? |
| Tokens OUT | ~180k | ≤ 130k | ? |
| Coût (€) | ~4 € | ≤ 2.5 € | ? |
| Erreurs introduites | 3 | ≤ 1 | ? |
| Commits faits | 5 | ≥ 1 propre + 1 ADR | ? |
| CEO interventions Windows | 8 | ≤ 3 | ? |

### 2.4 Comparer + décider

---

## 3. Critères de sortie ADD-AI (formels)

| Critère | Seuil GO | Seuil NO-GO |
|---|---|---|
| Vélocité | ×1.2 ou + | < ×1.0 |
| Coût tokens | −20% ou + | > baseline |
| Erreurs | −30% ou + | ≥ baseline |
| Coût total $ | ≤ baseline | > baseline +20% |

**Si tous critères GO** : continuer Lean ADD-AI sur Phase 1.

**Si majorité NO-GO** : retour méthode classique S6.8. ADR `2026-XX-XX · Abandon ADD-AI` actée. Pas de honte — on a appris.

**Si mixed (2 GO / 2 NO-GO)** : ajustement méthode (drop subagents qui ne tiennent pas) + 2e spike S6.10 fin de Phase 1.

---

## 4. Tasks SPIKE

| # | Task | Effort |
|---|---|---|
| 1 | Extraire métriques baseline S6.8 (tokens, durée, erreurs) | 30 min |
| 2 | Choix de la feature à reproduire en ADD-AI | 15 min |
| 3 | Implémentation feature en ADD-AI Lean (avec mesure) | 2h |
| 4 | Comparaison + tableau résultats | 30 min |
| 5 | Décision GO/NO-GO + ADR | 30 min |
| 6 | Update PLAN-REALIGNEMENT selon décision | 15 min |

**Total** : 4h ≈ 0.5 j-binôme.

---

## 5. Livrables

- Tableau de comparaison baseline vs ADD-AI (chiffré)
- ADR `2026-XX-XX · Validation ADD-AI ${verdict}` (GO / NO-GO / Mixed)
- Si GO : continuation Lean ADD-AI Phase 1
- Si NO-GO : retour méthode classique avec apprentissages capitalisés

---

## 6. Sources

- Mandat CEO 28/04 PM late — analyse stratégique recommandation R-4 + R-7
- METHODE-ADD-AI-aiCEO.md (promesses chiffrées à valider)
- ADR v8 ADD-AI
