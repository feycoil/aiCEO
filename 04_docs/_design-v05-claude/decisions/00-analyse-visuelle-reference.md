# Analyse visuelle — référence Twisty Income Tracker

> Déconstruction de l'image fournie (dashboard freelance "Twisty") pour cadrer la direction.
> Date : 26/04/2026.

## Verdict global

**Convergence quasi-totale avec le DS aiCEO Twisty.** Cette image n'est pas une référence externe à intégrer : c'est essentiellement le DS aiCEO appliqué proprement. On capitalise.

## Patterns visuels extraits

### Couleurs (mappées sur DS aiCEO)

| Élément image | Hex visible | Token DS aiCEO | Match |
|---|---|---|---|
| Fond global lavande | ~#a9adbe | `--bg #a9adbe` | ✅ exact |
| Conteneur principal cream | ~#f5f3ef | `--surface #f5f3ef` | ✅ exact |
| Carte chart blanche | #ffffff | `--surface-2 #ffffff` | ✅ exact |
| Texte titre navy | #111418 | `--text #111418` | ✅ exact |
| Brand navy bouton/jour T | #111418 | `--brand #111418` | ✅ exact |
| Accent coral chart | ~#d96d3e | `--rose #d96d3e` | ✅ exact |
| Borders très discrètes | ~#e4e1d9 | `--border #e4e1d9` | ✅ exact |

→ **Aucune couleur à inventer**. Le DS canonique suffit.

### Typographie

- Famille sans-serif géométrique → cohérent **Fira Sans** (DS canonique)
- Hiérarchie marquée :
  - Display "Income Tracker" ~32px bold
  - Stat "+20%" ~64px black weight (= `--fs-script-hero`, mais utilisé en sans)
  - H2 "Your Recent Projects" ~22px semi-bold
  - Body 14-15px regular
  - Caption "S M T W T F S" 13px medium
- Numérique tabulaire évident (chiffres alignés colonnes "64 / 12 / 10")
- → **Aucune évolution typo nécessaire**.

### Spacing & rounding

- Border-radius **conteneur principal : ~32px**. C'est plus généreux que la baseline DS.
  → **Évolution DS proposée** : pousser `--radius-xl` à 32px pour les cartes-conteneurs.
- Border-radius cartes secondaires : ~24px
- Border-radius chips (tags Remote/Part-time, badges Paid/Not Paid) : pill (rounded-full)
- Padding interne carte principale : ~32px
- Gouttière entre blocs : ~24px

### Composants identifiés (réutilisables aiCEO)

1. **TopNav horizontal** : logo gauche + nav links centrés + actions droite (search, settings, bell, avatar)
   - Active state : underline subtle sous le link courant
   - Width search bar : ~30 % de la nav
2. **Card title bloc** : icône carrée arrondie + titre display + control droite (selector "Week ▾")
3. **Vertical bar chart minimaliste** : ligne verticale fine + dot au sommet, callout pill sur la valeur active. Day labels en chips ronds en bas (filled active).
4. **Stat card** : valeur géante (+20%) + caption 2 lignes. Aligné à gauche, sans icône.
5. **List card avec rows** : icône carrée arrondie + label + statut chip (Paid/Not Paid) + chevron toggle. Sub-row optionnelle avec tags + description + meta (location + time).
6. **Connection card avatar** : photo ronde + nom + chip seniority + bouton "+" rond
7. **Promo card gradient** : fond decorative dotted/halftone, titre + description + CTA pill
8. **Multi-stat bar chart** : 3 colonnes labels + valeurs grandes + barres verticales colorées (mix navy + coral)
9. **Date selector** : icône calendar + date + chevron
10. **Avatar** : ronde, photo réaliste cropped, taille variable (16/24/32/48px)

### Densité & souffle

- L'image est **aérée** mais **dense informationnellement** :
  - 9 zones d'information distinctes dans un seul écran
  - Chaque zone fait son métier sans empiéter
  - Pas un seul élément décoratif gratuit
- → **Direction à reprendre stricto sensu pour aiCEO**.

### Anti-patterns absents (confirmation)

- Pas d'ombre portée 3D
- Pas de gradient candy
- Pas de glow / neon
- Pas de skeumorphisme
- Pas d'icône décorative

→ **Déjà cohérent avec les anti-patterns documentés**.

## Évolutions DS à acter

1. **`--radius-xl` à 32px** pour les conteneurs principaux (au lieu de la valeur actuelle plus modeste).
2. **`--radius-lg` à 24px** pour les cartes secondaires.
3. **Pattern "stat hero"** : taille +60px pour les chiffres clés (cf. "+20%" et "$2,567"), accompagné d'une caption courte.
4. **Pattern "value pill"** : callout pill navy filled qui floate au-dessus du dot d'un chart. À standardiser.
5. **Avatar circulaire avec chip overlay** (Senior/Middle) : pattern intéressant pour aiCEO sur la page contacts.

## Patterns à transposer pour aiCEO v0.5

| Réf Twisty | Équivalent aiCEO v0.5 |
|---|---|
| Income Tracker chart | **Cockpit charge tâches semaine** (variation ouvert/clos) |
| Recent Projects list | **Top 3 du jour** (post-arbitrage) ou **Big Rocks semaine** |
| Let's Connect | **Contacts à recontacter** (last-contact > 30j) |
| Unlock Premium | **Carte "Streak du soir"** ou **CTA arbitrage si pas fait** |
| Proposal Progress | **Compteurs jour/semaine** (tâches done, décisions tranchées, RDV honorés) |
| Day pills (S M T W...) | **Sélecteur jour** dans agenda hebdo |
| Tabs underline (Home, Messages...) | **Drawer principal aiCEO** (inversé : vertical au lieu d'horizontal ?) |
