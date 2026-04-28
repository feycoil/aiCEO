# Arbitrages tranchés (26/04/2026)

## Décisions

| # | Sujet | Décision retenue | Implication prompt |
|---|---|---|---|
| 1 | Données | Réalistes — vraies sociétés Feycoil (Adabu, Start, AMANI, ETIC), vrais prénoms d'équipe | Le prompt nomme tout en dur. Le rendu est utilisable comme démo perso, pas pour public externe. |
| 2 | États secondaires | 1 état critique par page (default + 1) | ~26 vues totales (13 default + 13 stratégiques). Le prompt précise quel état critique pour chaque page. |
| 3 | Stratégie prompt | Unique avec découpage Tier interne (1/2/3) | 1 seul copier-coller. Si Claude Design plafonne, instruction de relancer sur Tier suivant. |
| 4 | Référence Twisty | Gold standard à reproduire | Niveau de qualité visuelle, patterns (radius 32, chips pill, dot chart) imposés. |
| 5 | Composants partagés | Fichier `_shared/` unique réutilisé par les 13 pages | Drawer + header + footer définis 1 fois, importés. |
| 6 | Drawer | Collapsible 60px ↔ 240px (best of both) | Drawer vertical fixe gauche, fond brand navy, retractable par bouton. |
| 7 | Stack CSS | Hybride : variables DS (couleurs/typo/radius) + Tailwind utilities (layout/spacing) | Ratio 60/40. Garantit intégration ultérieure dans 03_mvp. |

## Conséquences pour le prompt

- **Section "Données"** explicitement réaliste avec exemples nommés
- **Section "États"** liste 1 état critique par page, pas une matrice exhaustive
- **Section "Format livraison"** précise l'arborescence avec `_shared/`
- **Section "Drawer"** spécifie le comportement collapsible avec les 2 widths
- **Section "Stack"** précise variables DS pour couleurs/typo, Tailwind pour le reste
- **Marqueurs `### Tier`** présents pour permettre un déroulé progressif côté Claude Design
