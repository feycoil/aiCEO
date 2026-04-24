# aiCEO — Visualisation & pensée graphique

**Version 1.0 · 23 avril 2026 · Patterns visuels & principes d'encodage**

> Feycoil pense en images. Ce document décrit comment aiCEO rend l'information visuellement manipulable — sans jamais l'enfermer dans une seule représentation.

---

## 1. Principe fondateur — *Un nœud, N vues*

**Règle maîtresse** : chaque entité métier (tâche, décision, RDV, chantier, personne) est un **nœud** unique dans un graphe. Ce nœud est projetable dans **cinq représentations** sans duplication de données :

```
                    ┌──────────────┐
                    │    NODE      │
                    │  (décision,  │
                    │   tâche,     │
                    │   personne…) │
                    └──────┬───────┘
                           │
      ┌──────────┬─────────┼─────────┬──────────┐
      ▼          ▼         ▼         ▼          ▼
    LISTE     GRID      ARBRE     GRAPHE    CANVAS
   (ordre)  (colonnes) (parent/  (relations)  (spatial
                       enfant)               libre)
```

Chaque vue montre des **facettes différentes** du même nœud. Passer de l'une à l'autre se fait avec un raccourci clavier (`Ctrl+1` à `Ctrl+5`) **sans recharger la page, sans perdre la sélection**.

*Inspiration directe : Tana "live views", Heptabase whiteboards imbriqués.*

---

## 2. Les 6 formats visuels supportés

### 2.1 Liste temporelle (défaut sobre)

**Quand l'utiliser** : petits volumes (< 15 items), pour une lecture séquentielle.
**Structure** : cartes portlets empilées verticalement, pastille de catégorie à gauche.
**Interactions** : clic ouvre le drawer, drag réordonne, swipe marque fait.

### 2.2 Grid (tableau contextuel)

**Quand l'utiliser** : données typées à comparer (tâches avec statut/owner/échéance, équipiers avec compétences/charge).
**Structure** : colonnes configurables selon le tag du nœud, filtres de haut de colonne, tri multi-critères.
**Interactions** : édition inline, drag d'une colonne pour changer l'ordre, clic sur entête pour trier, **bouton IA** "suggère-moi les colonnes pertinentes".
**Inspiration** : Tana live-views grid.

### 2.3 Arbre (hiérarchie repliable)

**Quand l'utiliser** : structure parent-enfant (OKR → initiatives → tâches ; société → équipes → personnes).
**Structure** : outliner avec triangles de pliage, niveau mis en évidence visuellement.
**Interactions** : `Tab` pour descendre un niveau, `Shift+Tab` pour remonter, `Space` pour plier/déplier, drag pour re-parenter. L'IA peut **déduire la structure d'arbre depuis un brief textuel** (pattern Tana AI).
**Inspiration** : Tana outliner, Logseq blocks.

### 2.4 Graphe (réseau sémantique)

**Quand l'utiliser** : relations non-hiérarchiques (décisions ↔ personnes ↔ risques ↔ initiatives), identification de clusters.
**Structure** : nœuds colorés par type, arêtes étiquetées par relation, taille du nœud = centralité (degree).
**Interactions** : zoom progressif (ego-graph sur un nœud = sa vue 1-hop), drag pour repositionner, double-clic pour ouvrir le nœud, **clic IA** "explique-moi ce cluster en une phrase".
**Techno** : Cytoscape.js avec layout `fcose` ou `cola`.
**Inspiration** : Reflect, Obsidian graph view.

### 2.5 Canvas spatial (carte conceptuelle libre)

**Quand l'utiliser** : pensée exploratoire, cartographie parties prenantes, matrice impact/effort, arbitrage multi-critères.
**Structure** : zone 2D infinie, axes optionnels (impact/effort, probabilité/gravité), frames pour zones thématiques, arrows bindées.
**Interactions** : pan/zoom fluide (comme Figma/tldraw), drag d'un nœud depuis la palette latérale, **agent IA qui travaille visiblement sur le canvas** (regroupe, aligne, suggère).
**Techno** : tldraw SDK (ou équivalent) avec agent bindings.
**Inspiration** : tldraw Make Real, Heptabase whiteboards.

### 2.6 Timeline (axe temporel)

**Quand l'utiliser** : séquences datées (jalons projet, événements, revues hebdo), pour voir la cohérence chronologique.
**Structure** : ligne horizontale avec couches empilables (stratégie / exécution / perso), zoom jour ↔ semaine ↔ mois ↔ trimestre.
**Interactions** : drag pour décaler un jalon, pinch-zoom sur le temps, détection auto de conflits (IA).
**Inspiration** : Heptabase journal, Napkin timeline.

### 2.7 Kanban spatial (bonus)

**Quand l'utiliser** : flux d'exécution (à faire / en cours / fait), ou regroupement par horizon (jour / semaine / mois).
**Structure** : colonnes limitées (WIP = max 5 en "en cours"), cartes = nodes, IA peut regrouper par critère.
**Interactions** : drag horizontal change statut, vertical change priorité, clic sur la colonne pour filtrer la timeline.

---

## 3. La bascule instantanée

Toute vue d'une collection de nœuds expose en haut un **sélecteur visuel** :

```
┌──────────────────────────────────────────────┐
│  [Liste] [Grid] [Arbre] [Graphe] [Canvas]    │
│    ●                                          │
└──────────────────────────────────────────────┘
```

Raccourcis clavier : `Ctrl+1` Liste · `Ctrl+2` Grid · `Ctrl+3` Arbre · `Ctrl+4` Graphe · `Ctrl+5` Canvas · `Ctrl+6` Timeline.

**Règle technique** : la bascule doit être **inférieure à 100 ms** — sinon le geste perd son pouvoir cognitif. Le modèle de données partagé (nœuds en mémoire) + re-render ciblé rend ça atteignable.

---

## 4. Le pattern texte → visuel (Napkin)

À tout endroit où du texte apparaît (brief, décision, revue hebdo, mémo, mail), **un bouton flottant apparaît à la sélection** :

```
" cette décision implique trois axes : le financement,
  l'équipe, et les délais — chacun ayant ses risques "
                                    ↓ sélection
                            ┌─────────────────┐
                            │ ✨ Visualiser ▾ │
                            └─────────────────┘
                                    ↓ clic
           Galerie de 4-6 variantes :
           • Arbre (3 axes, sous-branches)
           • Matrice 2x2 (risque × impact)
           • Timeline (séquence)
           • Hub-spoke (décision centrale)
           • Venn (intersections)
```

L'IA parse l'intention (étapes ? oppositions ? hiérarchie ? causalité ?) et propose le gabarit le plus pertinent en premier. Le CEO choisit, édite, insère.

**Cas d'usage concrets aiCEO** :
- Dans un mémo de décision, sélectionner les options → visualiser en matrice 2x2.
- Dans un brief de RDV, sélectionner les points à couvrir → arbre des sujets.
- Dans une revue hebdo, sélectionner les Big Rocks → hub-spoke ou timeline.

---

## 5. Les visualisations spécifiques métier

### 5.1 La carte des sociétés (page d'accueil Cockpit)

Vue globale du portefeuille en **cartographie radiale** :

```
                 ADABU
                   ●
                  ╱│╲
                 ╱ │ ╲
              STRAT│POC (décisions actives)
                   │
    AMANI ●───── CEO ─────● ETIC Services
           ╲      │      ╱
            ╲     │     ╱
              ● START
```

Taille du cercle = charge cognitive actuelle. Couleur = humeur dominante détectée (vert calme → rouge brûlant). Arêtes = décisions ou projets transverses.

Clic sur une société → zoom sur sa page dédiée.

### 5.2 L'arbre des Big Rocks

Chaque Big Rock de la semaine est un **tronc** ; chaque tâche qui le soutient est une **branche**.

```
                ┌──────────────────────────────┐
                │  INTENTION S17               │
                │  "Terrain Mayotte"           │
                └───────────┬──────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    ┌────────┐        ┌──────────┐       ┌──────────┐
    │ Rock 1 │        │ Rock 2   │       │ Rock 3   │
    │ PV chantier│   │ Comité   │       │ Dossier  │
    └────┬───┘        │ stratégie│       │ SCI Start│
         │            └────┬─────┘       └────┬─────┘
    ┌────┴─────┐        ┌──┴──┐           ┌──┴───┐
    ▼   ▼   ▼            ▼   ▼            ▼   ▼  ▼
    tâches               tâches           tâches
```

Visualisation en SVG simple, avec progress ring sur chaque nœud.

### 5.3 La matrice délégation (éclairer les transferts)

Vue 2D : axes *compétence requise* × *autorité nécessaire*. Chaque tâche est un point. L'IA colorie :

```
             COMPÉTENCE HAUTE
                    ▲
                    │
     [Seulement moi] │  [Déléguer à expert]
                    │
                    │
   AUTORITÉ ────────┼──────── AUTORITÉ
   BASSE            │           HAUTE
                    │
  [Déléguer à tous] │  [Moi + validateur]
                    │
                    ▼
             COMPÉTENCE BASSE
```

Règle visuelle : les points dans les deux quadrants inférieurs clignotent doucement avec le badge "⚡ déléguable". L'IA propose le propriétaire naturel.

### 5.4 La timeline de décision (suivi d'arbitrages)

Pour chaque décision importante : une **ligne de vie** qui montre l'évolution de la réflexion.

```
  17/03        05/04        12/04        23/04         ?
    │           │            │             │           │
    │           │            │             │          ???
  saisie     premiers    option A       décision     exécution
  initiale   éléments    privilégiée    finale
    │           │            │             │
   "brouillon"  "analyse"    "arbitrage"   "acté"
```

Interactions : clic sur une étape → commentaires de l'époque. Hover → aperçu du document/mail de l'époque.

### 5.5 Le graphe des parties prenantes

Pour un projet/décision, l'IA génère automatiquement le réseau des acteurs concernés :

- Nœud CEO au centre.
- Équipe interne en anneau proche (taille = implication).
- Partenaires externes en anneau lointain.
- Arêtes : relation (direct / indirect / décisionnaire / informé).
- **Mini-IA** : "qui manque à cette cartographie ?"

### 5.6 La carte d'agenda hebdomadaire (déjà prototypée)

Grille 7 jours × heures, événements en portlets. **Extensions v2** :

- **Vue heat-map** (densité d'occupation par créneau).
- **Vue flux** (segments horizontaux = blocs de meetings, plages vides = respiration).
- **Vue thématique** (couleur par société ou type d'activité).

---

## 6. L'agent IA sur canvas (v2)

Ambition forte, pattern tldraw : **l'IA n'est plus dans un chat latéral, elle travaille sur le canvas.**

### Ce que ça donne concrètement

Le CEO dessine en 20 secondes un schéma mains nues :

```
    [Board Adabu] ────→ [POC data center]
                            │
                            ▼
                     [Philippe responsable]
```

Il clique "✨ Netoyer et enrichir". L'agent :

1. **Redresse** les lignes, aligne les boîtes.
2. **Propose** d'ajouter les acteurs manquants (CTO, DAF).
3. **Ajoute** les dates connues sur les flèches (décision J-X).
4. **Colore** par société.
5. **Demande** : "voulez-vous que je pousse ce schéma dans le brief du comité de jeudi ?"

### Principes

- L'agent **agit visiblement** : l'utilisateur voit les boîtes bouger, les textes apparaître, les lignes se redresser. Transparence = confiance.
- L'agent **peut être interrompu** à tout moment (touche `Esc`).
- L'agent **propose, ne décide pas** : toute modification est en mode "suggestion", le CEO accepte globalement ou par item.
- L'agent **ne colle pas de fictions** : si une info n'existe pas, il la laisse vide et le signale.

---

## 7. L'encodage cognitif — principes de design

### Règles d'or visuelles

1. **Une couleur = une société**. Jamais autre chose. Apprentissage constant.
2. **Un format = un type d'information**. Rectangle = tâche, cercle = personne, losange = décision, pentagone = jalon.
3. **La taille encode l'importance**, pas la date. (Une tâche de 2h et une tâche de 2 mois peuvent avoir la même taille visuelle si même criticité.)
4. **La position spatiale encode l'état d'esprit**, pas la chronologie. (En canvas libre — la timeline gère la chronologie ailleurs.)
5. **Le blanc est un signal** : du vide est un espace de respiration, pas une erreur de design.

### Charte chromatique (référence Twisty)

| Usage | Couleur | Hex approximatif |
|---|---|---|
| Cadre de l'app | Lilas-gris | `#a9adbe` |
| Surface principale | Crème | `#f5f3ef` |
| Texte & brand | Noir encre | `#111418` |
| Accent action | Corail | `#d96d3e` |
| Société ADABU | Violet pastel | `#e9d9ff` / `#6d3ba5` |
| Société START | Sky pastel | `#dce9f7` / `#3b6ba5` |
| Société AMANI | Sage pastel | `#d8ecdf` / `#2b7350` |
| Société ETIC | Amber pastel | `#f5e8cc` / `#a57b3b` |
| Société future | Rose pastel | `#f5dada` / `#a53b5f` |
| Calme / OK | Emerald pastel | `#d8ecdf` |
| Attention | Amber pastel | `#f5e8cc` |
| Alerte douce | Rose pastel | `#f5dada` |

**Aucun rouge vif, aucun gradient, aucun filet coloré à l'intérieur des widgets.** Fond pastel suffit à catégoriser.

---

## 8. L'accessibilité visuelle

- **Contraste AA WCAG minimum** sur tous les textes (ratio 4.5:1).
- **Police lisible** : Inter ou système, taille minimale 13 px pour le texte de détail, 15 px pour le corps, 24 px pour les titres.
- **Daltonisme** : chaque couleur a un **symbole associé** (rond plein / rond creux / losange / carré). Une personne daltonienne peut distinguer les sociétés sans la couleur.
- **Mode sombre** : indispensable à terme, avec palette équivalente à forte luminosité gardée pastel.

---

## 9. Les patterns d'interaction clés

### P1 · Le geste "expliquer visuellement"

N'importe où dans l'app, presser `Alt+E` sur une sélection textuelle déclenche la génération d'un visuel de la sélection. Inspiré de Napkin.

### P2 · Le geste "pivoter la vue"

Presser `V` active le sélecteur de format rapide (liste/grid/arbre/graphe/canvas). Flèches pour naviguer, Entrée pour valider.

### P3 · Le geste "regrouper par"

Presser `G` active le menu "regrouper par" : société, statut, owner, échéance, priorité. S'applique à toutes les vues.

### P4 · Le geste "filtrer"

Presser `F` active la barre de filtre universelle qui s'applique quel que soit le format.

### P5 · Le drawer contextuel

Cliquer sur un nœud ouvre un **drawer latéral** à 380 px, avec :
- En-tête : eyebrow (type), titre, source (mail/RDV/fichier d'origine).
- Meta : attributs principaux.
- Liens : nœuds reliés (tâches, décisions, personnes).
- Actions : boutons contextuels (valider, déléguer, ajuster, archiver).

Le drawer ne bloque pas la vue, il glisse depuis la droite sur 380 px.

---

## 10. La bibliothèque de composants visuels (roadmap)

### Phase MVP (T2 2026)

- Cartographie radiale des sociétés (SVG statique).
- Arbre des Big Rocks (SVG statique).
- Grille agenda 7 jours (CSS grid, déjà prototypé).
- Portlets liste (Twisty, déjà prototypé).

### Phase V1 (T4 2026)

- Grid typée avec tri/filtre (librairie TanStack Table).
- Timeline de décision (SVG + drag).
- Matrice 2x2 délégation (SVG + tooltips).

### Phase V2 (T2 2027)

- Graphe Cytoscape (sociétés, parties prenantes, décisions).
- Canvas spatial (tldraw SDK ou équivalent).
- Bouton Napkin "visualiser" en contextuel.

### Phase V3 (T4 2027)

- Agent IA visible sur canvas.
- Mindmap collaboratif (multi-utilisateur).
- Animation de transitions entre vues (Framer Motion).

---

## 11. Gabarits visuels types (à livrer en bibliothèque)

L'IA doit pouvoir générer instantanément ces gabarits depuis une intention textuelle :

| Gabarit | Cas d'usage CEO | Forme |
|---|---|---|
| **Arbre à 3 branches** | Décision avec 3 options | Tronc + 3 branches + sous-feuilles |
| **Matrice 2x2** | Risque × impact, priorité × effort | Cadran 4 zones |
| **Funnel** | Pipeline commercial, recrutement | Entonnoir 3-5 étapes |
| **Pyramide** | Hiérarchie de valeurs / priorités | 3-5 strates |
| **Timeline horizontale** | Jalons projet, revues hebdo | Ligne + marqueurs |
| **Hub-spoke** | Décision centrale + parties prenantes | Cercle central + rayons |
| **Venn** | Intersections compétences, enjeux | 2-3 cercles |
| **Sankey** | Flux budgétaires, réaffectations | Flèches proportionnelles |
| **Heat-map** | Densité agenda, charge équipe | Grille colorée |
| **Mindmap radial** | Exploration d'un sujet | Nœud central + branches rayonnantes |

---

## 12. Anti-patterns visuels à bannir

- **L'histogramme pour tout**. Un bar chart ne dit rien sans comparaison pertinente.
- **Le camembert à 8 tranches**. Au-delà de 4 catégories, utiliser un bar chart ou un treemap.
- **La légende cachée**. Toute couleur/symbole doit avoir son sens visible à l'écran.
- **Le gradient décoratif**. Supprimé de toute l'app (cf. design-system).
- **L'icône sans label**. Une icône seule = ambiguïté. Toujours coupler à un mot ou un tooltip au hover.
- **La chronologie verticale sans date**. Si c'est une timeline, les dates doivent être visibles.
- **Le graphe à 200 nœuds**. Au-delà de 40 nœuds visibles, introduire un zoom ou un clustering.

---

## 13. Synthèse — le manifeste visuel

> Feycoil pense en cartes. Nous lui devons une app cartographique.
>
> Nous ne lui donnerons jamais un texte là où un arbre dirait mieux, ni une liste là où un graphe révélerait un pattern.
>
> Nous lui donnerons le droit de basculer de format en 100 ms, parce que c'est ainsi qu'il pense — plastiquement, spatialement.
>
> Nous lui donnerons un canvas pour tracer, un outliner pour structurer, un graphe pour relier, une timeline pour ordonner, une grille pour arbitrer. Et nous lui donnerons un agent qui travaille **sur** le canvas, pas à côté.

---

*Document lié : `01-vision-produit.md` · `02-benchmark.md` · `07-design-system.md`*
