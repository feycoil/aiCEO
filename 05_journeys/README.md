# 05_journeys — Démo UX cliquable des flux cibles

**Rôle** : traduction concrète, naviguable en HTML statique, des cinq moments-clés de la journée aiCEO. Pas de code produit, pas de données vivantes — un prototype de démonstration.

**Statut** : fascicule transverse officiel depuis 2026-04-24 (atelier de cohérence, S3). Cité dans `04_docs/00-README.md`.

---

## À qui ça sert

| Audience | Usage |
|---|---|
| **Designer** qui reprend le DS | Voir à quoi ressemblent les flux cibles avant de toucher un écran réel |
| **Dev** qui implémente la fusion v0.5 | Référence visuelle des 5 moments (hors code, sans dépendance au MVP) |
| **CEO pair / investisseur** qui veut cliquer plutôt que lire | Livrable externe possible pour la conversation S5 (atelier cohérence) |

---

## Contenu

| Page | Moment | Flux représenté |
|---|---|---|
| `01-matinee.html` | 07:30 — 09:00 | Réveil produit : cockpit, Focus Now, intention de la journée |
| `02-arbitrage.html` | 09:00 — 09:30 | Arbitrage matinal : 3 colonnes (AGIR / REPORTER / DÉLÉGUER) |
| `03-copilote.html` | 10:00 — 17:00 | Copilote en journée : propositions, brouillons mail, rééquilibrage |
| `04-cloture.html` | 17:00 — 17:30 | Clôture du soir : bilan, tâches non-faites, préparation du lendemain |
| `05-revue.html` | dimanche 19:00 | Revue hebdo : semaine écoulée, prochains Big Rocks, intention S+1 |

Plus `index.html` (table des matières) et `journey.css` (styles partagés).

---

## Relation aux sources canoniques

- **User flows détaillés** : `04_docs/SPEC-FONCTIONNELLE-FUSION.md` §2 et `04_docs/04-visualisation.md` font foi sur la logique métier.
- **Grammaire IA** : `04_docs/03-ia-proactive.md` fait foi sur les 6 familles de propositions visibles dans `03-copilote.html`.
- **Rituels** : `04_docs/05-coaching-ux.md` fait foi sur le ton et les phrases testées utilisés dans `01-matinee.html`, `04-cloture.html`, `05-revue.html`.
- **Design tokens** : `journey.css` consomme `02_design-system/colors_and_type.css` (source canonique DS).

Ces pages sont des **traductions UX** de ces sources — elles ne prétendent pas les remplacer. En cas d'écart, la source canonique gagne et la démo doit être mise à jour.

---

## Règles d'évolution

- Toute évolution fonctionnelle dans les fascicules 01-05 ou SPEC-FONCTIONNELLE-FUSION qui impacte un des 5 moments doit être **répercutée ici** dans la même PR (sinon la démo dérive).
- Pas de données vivantes, pas de JS métier — HTML + CSS statique uniquement. L'interactivité reste illustrative (états visibles via toggles ou tabs, pas de vrai store).
- Éviter d'ajouter de nouveaux moments : si un sixième émerge, c'est d'abord une évolution de la grammaire produit (fascicule 03 ou 05) avant d'être un écran ici.

---

*Créé 2026-04-24 dans le cadre de l'atelier de cohérence, Session 3 (promotion en fascicule transverse).*
