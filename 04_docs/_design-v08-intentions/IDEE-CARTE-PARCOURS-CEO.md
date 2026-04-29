# Idee — Carte parcours CEO (vue retrospective de la trajectoire)

**Cree** : 29/04/2026 PM tardif · **Origine** : intention CEO en cours de reflexion UX v0.8 · **Statut** : Conceptuel, en attente d arbitrage Phase 1 (B5)

## 1. Origine & motivation

Issue d une intention CEO formulee a la fin de la phase de cadrage UX :
> "il manque a l application quelque chose de l ordre du suivi du parcours du CEO - chemin accompli, une carte des decisions/actions qu il a prises et faites, une forme d arbre ou de roadmap du CEO interactive qui se met a jour au fil des jours et de son activite, structure par groupe / societe / services (admin, fi, op, r&d, maintenance, rh, etc.)"

## 2. Pertinence : 9/10 — alignement fort avec intentions UX v0.8

| Intention | Comment la carte y repond |
|---|---|
| Visual thinking (Theme F) | Synthese visuelle d une grande quantite d info |
| "Page Google" + detail a la demande | La carte est la synthese, le clic revele le detail |
| Profil batailleur/gagnant/stratege (B2) | Voir sa progression motive et incite a continuer |
| Gamification luxe discrete (B1 option A) | Un arbre qui grandit = trophee visuel sans confettis |
| KPIs parametrables (Alerte 5) | La carte est elle-meme un KPI visuel d ensemble |
| Sortir du blocage (intentions C) | Voir "j ai deja fait ca" libere l elan |
| Memoire institutionnelle | Pour CEO qui doute, voir 6 mois d arbitrages tranches est rassurant |

## 3. Inspirations externes

- **GitHub contribution graph** — commits annuel, lisible, motivant sans surenchere
- **Strava heatmap** — parcours cumules sur carte, visualise l effort
- **Apple Fitness mois** — anneaux 30 jours, gamification luxe parfaite
- **Heptabase whiteboard** — cartes connectees, visual thinking
- **Notion Database "Gallery view"** — mosaique tuiles clean
- **Linear roadmap timeline** — projets sur axe temporel
- **Whimsical mind-map** — branches colorees mais clean

## 4. 3 options d integration (a trancher Phase 1, B5)

### Option A — Bloc "Ma trajectoire" dans le Cockpit
- Sous la section projects-houses
- Vue compacte 7-30 jours
- **Effort** : 1.5 h binome
- **Avantage** : visible des l ouverture, pas de page nouvelle
- **Inconvenient** : alourdit le Cockpit (anti-principe Google)

### Option B — Page dediee `trajectoire.html` accessible depuis drawer ★ RECOMMANDEE
- Nouvelle page dans la section Capital du drawer (a cote de decisions, revues, connaissance, coaching)
- Vue complete avec filtre temporel (7j/30j/90j/6mois/1an/all)
- **Effort** : 3 h binome MVP, +3 h pour version avancee
- **Avantage** : merite sa propre URL et son storage, espace pour zoom/pan futur
- **Inconvenient** : 1 page de plus a maintenir

### Option C — Onglet dans Hub.html
- Hub avec tabs (Tableau / Trajectoire)
- **Effort** : 2 h binome
- **Avantage** : tout dans Hub
- **Inconvenient** : Hub doit rester epure ("page Google"), tabs vont charger

### Option D — Differee V1+
- Inscrite en backlog uniquement
- **Effort** : 0 h immediat
- **Avantage** : pas de surcharge sprints actuels
- **Inconvenient** : prive le CEO d une vue motivante immediatement

## 5. Architecture technique MVP (si option B retenue)

### Donnees affichees
**Inclure** : decisions tranchees (status `tranchee`/`closed`) · big rocks atteints (status `done`) · projets clos (status `archived`/`closed`) · revues hebdo signees.
**Exclure** : actions du quotidien (trop de bruit), emails arbitres (pas assez signifiant pour la trajectoire).

### Endpoints sources
- `GET /api/decisions?status=tranchee&limit=200`
- `GET /api/big-rocks?status=done`
- `GET /api/projects?status=closed`
- `GET /api/weekly-reviews`

### Vue MVP (3 h binome)
- **Layout** : grille `axis-X = temps` × `axis-Y = domaines` (groupes paramètrables via Reglages -> Maisons)
- **Markers** : carres colores selon kind
  - Decision strategique = violet `--primary-500`
  - Big Rock = dore (nouveau token)
  - Projet clos = vert `--success`
  - Revue signee = neutre `--ink-500`
- **Interaction** : hover -> mini-fiche · clic -> ouvre `modal-detail` enrichi (S6.12)
- **Filtre temporel** : 7j / 30j / 90j / 6 mois / 1 an / all
- **Densite progressive** : si > 50 markers visibles, regroupement automatique en clusters

### Vue avancee V1.x (+3-6 h)
- Mode "graphe" : connexions entre decisions / projets / big rocks (un projet clos relie aux 12 decisions qui l ont fait avancer)
- Animation "replay" : reconstruction jour par jour de l annee
- Annotations IA : "moments tournants" detectes par Claude
- Export PDF "Mon annee" pour bilans annuels CEO

## 6. Risques & mitigations

| Risque | Mitigation |
|---|---|
| R1 — Surcharge cognitive (arbre touffu) | Densite progressive + clustering automatique > 50 markers |
| R2 — Taxonomie imposee (admin/fi/op/r&d/maintenance/rh) | Parametrable via Reglages -> Maisons (groupes existent deja) |
| R3 — Semantique floue (que montre la carte ?) | Trancher en Phase 1 (cf. § 5 Donnees affichees) |
| R4 — Cout technique (graphe SVG interactif) | MVP 2-3 h (timeline simple) puis extension iterative |
| R5 — Chevauchement avec Pilotage projet | Pilotage = vue dev binome / Trajectoire = vue metier executive |
| R6 — Donnees insuffisantes pour visualiser | Empty state inspirant ("Votre premiere decision tranchee apparaitra ici. Lancez un arbitrage maintenant ?") |

## 7. Sequencement recommande

1. **Phase 1 (S6.16)** : trancher B5 dans le memorandum (option A/B/C/D + semantique)
2. **Phase 2 (S6.17)** : refonte Cockpit (priorite immediate)
3. **S6.18 (si option A retenue)** : ajout du bloc "Ma trajectoire" dans Cockpit (1.5 h)
4. **S6.19 (si option B retenue)** : creation page dediee `trajectoire.html` (3 h MVP)
5. **V1.x** : version avancee (graphe + replay + annotations IA + export PDF)

## 8. Critères de succès

- [ ] Le CEO ouvre la carte au moins 1 fois par semaine spontanement
- [ ] La densite reste lisible meme apres 6 mois d activite
- [ ] La carte aide a repondre a "Qu est-ce que j ai accompli ce trimestre ?" en < 10 sec
- [ ] La carte est exploitable pour les revues mensuelles/trimestrielles strategiques
- [ ] Le CEO peut exporter une vue annuelle pour son bilan de fin d annee

## 9. Liens

- Archive complete reflexion UX : `WORKING-NOTES.md` section B5
- Memo Phase 1 (a venir) : `MEMO-UX-V08-PHASE1.md`
- ADRs officielles : `00_BOUSSOLE/DECISIONS.md`

---

**Version** : 1.0 · 29/04/2026 PM tardif
**Statut** : Conceptuel, en attente d arbitrage Phase 1 (B5)
**Reactivation prevue** : Demarrage S6.16 (Phase 1 cadrage) ou plus tard si differee
