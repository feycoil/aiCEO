# ROADMAP — compagnon texte de la carte interactive

Pour voir la carte cliquable : [`04_docs/11-roadmap-map.html`](../04_docs/11-roadmap-map.html)

## État au 24/04/2026

| Branche | État | Version |
|---|---|---|
| **App Web Twisty** | abouti | v4 |
| **MVP Node** | validé en réel | v0.4 |
| **V1 — produit unifié** | à venir | juin 2026 (cible) |

## Jalons clés

### ✅ Fait
- Cockpit web Twisty v4 (pages cohérentes, design system appliqué)
- MVP complet : arbitrage 3/2/N · délégation · boucle du soir · import Outlook · contexte email dans prompt · proxy corp
- Run réel 24/04 : 28/28 tâches, 41 s, ≈ 1,5 ct/jour
- Documentation produit (vision, benchmark, IA, UX, architecture, design system)

### 🔜 Prochaines semaines (mai 2026)
- **Alignement design tokens** : fusionner `02_design-system/` dans le MVP + app web (palette unique)
- **Branchement données MVP** : pages app web consomment `/api/tasks`, `/api/decisions`, `/api/emails/summary`
- **Démarrage auto Windows** du MVP
- **Auto-sync Outlook 2h** (plus de PowerShell manuel)

### 🎯 V1 — juin 2026 (cible)
Fusion App Web + MVP = un seul produit. UI Twisty branchée sur le serveur Node. Livrable candidat pour déploiement interne ETIC.

### 🚀 V2+ — été 2026
- Envoi natif Graph (fin des mailto:)
- Mémoire patterns (Claude apprend des reports chroniques, perfectionnisme)
- Vue archives drafts / debriefs

## Règle de mise à jour

À chaque revue hebdomadaire :
1. Mettre à jour `MILESTONES` dans `04_docs/11-roadmap-map.html` (statut `done` / `doing` / `todo`)
2. Synchroniser ce fichier (table + jalons clés)
3. Commit : `roadmap: update W<NN>`
