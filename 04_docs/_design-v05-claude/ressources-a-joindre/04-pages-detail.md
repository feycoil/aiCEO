# Détail des 13 pages — aiCEO v0.5

> Référentiel page-par-page : rôle, contenu, source API, état critique à concevoir, références patterns Twisty applicables.

---

## Tier 1 — Cockpit + rituels (P0, qualité maximale)

### 1. `index.html` — Cockpit unifié

**Rôle** : page d'accueil au lever. Donner l'état du jour en < 5 secondes de scan.

**Contenu** :
- Salutation script Aubrielle "Bonjour Feycoil," (taille 44px)
- Date du jour en sous-titre
- Drawer collapsible gauche
- Zone centrale en grid responsive :
  - **Carte Matin** (44 % width) : si arbitrage non fait → CTA visuel fort. Si fait → top 3 du jour avec checkboxes
  - **Carte Soir** (28 % width) : preview des heures restantes + streak en grand
  - **Big Rocks semaine** (28 % width) : 3 objectifs avec progress bars
- Ligne suivante :
  - **Alertes** (40 % width) : list-card style Twisty avec rows (overdue, stale outlook, big rocks manquants)
  - **Compteurs jour** (60 % width) : pattern "Proposal Progress" Twisty avec 4 colonnes (Tâches, Décisions, RDV, Mails)
- Footer discret : v0.5-s4, latence DB, last-sync Outlook

**API** : `GET /api/cockpit/today`, `GET /api/system/last-sync`

**État critique** : `outlook-stale-warning` (alert level=warn affichée en pleine largeur si lastSyncAgeMin > 240)

**Patterns Twisty à reprendre** :
- Stat hero "+20%" pour "12 jours streak"
- Day pills S M T W T F S pour le mini-agenda en bas
- List-card avec rows pour les alertes
- Multi-stat bar chart pour les compteurs (substitut au "Proposal Progress")

---

### 2. `arbitrage.html` — Arbitrage matinal

**Rôle** : transformer ~30 tâches ouvertes en plan du jour en 5 min max.

**Contenu** :
- Header : "Arbitrage matinal" + timer écoulé (objectif < 5 min) + chip "Jeudi 26/04"
- 3 colonnes drag & drop (HTML5 natif) :
  - **FAIRE** (top 3 P0/P1 → vous) : fond surface-2 blanc, badge prio
  - **DÉLÉGUER** (ai_capable=1 → équipe) : badge délégation + chip destinataire
  - **REPORTER** (reste → demain ou +) : grisé, sélecteur date relatif
- Pour chaque tâche : titre, project chip société (couleur ETIC/Adabu/etc.), priority pill, due relatif ("dans 2 j"), source-link icone (mail/projet/RDV)
- Latéral droit (28 % width) : "Courriels du jour" — 10 mails avec sender + subject + bouton "→ tâche"
- Bottom sticky : "Valider l'arbitrage (28 tâches)" CTA brand navy filled

**API** : `POST /api/arbitrage/start`, `POST /api/arbitrage/commit`, `GET /api/tasks?done=0`

**État critique** : `loading-claude-recommendation` (skeleton bullets pendant que le LLM réfléchit ~2-3s, puis remplissage progressif des reasons sous chaque tâche)

**Patterns Twisty** :
- Cards rows pour chaque tâche (style "Recent Projects")
- Chips pill pour prio + société
- CTA pill bottom (style "Upgrade now")

---

### 3. `evening.html` — Boucle du soir

**Rôle** : 2 minutes de décompression + prep demain.

**Contenu** :
- Hero "Comment s'est passée ta journée ?" en script Aubrielle 44px
- Slider humeur 3 positions (mauvais / moyen / bien) — picto minimaliste
- Slider énergie 1-5 (chiffres en Sol thin 32px)
- Champ libre "Note du jour" (3 lignes max, placeholder "Ce qui m'a marqué…")
- Bloc "Top 3 demain" auto-suggéré par Claude (proposé éditable)
- **Stat hero streak** : "12 jours consécutifs" en Sol thin 64px (= taille `--fs-script-hero`), entouré d'un anneau de progression month
- CTA "Bonne nuit" pill brand navy

**API** : `POST /api/evening/start`, `POST /api/evening/commit`, `GET /api/evening/streak`

**État critique** : `streak-celebration` (à 7/30/100 jours, anneau anime + petit confettis discret pendant 1.5s, puis disparaît)

**Patterns Twisty** :
- Stat hero +20% pour la streak
- Day pills pour visualiser les 7 derniers soirs (rempli/vide)

---

## Tier 2 — Travail courant (P1)

### 4. `taches.html` — Inbox + Eisenhower

**Rôle** : gestion des tâches hors arbitrage.

**Contenu** :
- Toggle vue en haut : **Liste** | **Eisenhower 2x2**
- Vue Liste : filtres en sticky bar (project chip, priority, due, eisenhower, recherche `?q=`)
- Tableau : checkbox + titre (édit inline) + project chip + prio pill + due + actions
- Vue Eisenhower : 4 quadrants UI/UnI/nUI/nUnI, drag-drop entre, max ~8 tâches par cadran lisible
- CTA "+ Nouvelle tâche" inline + raccourci `n`

**API** : `GET /api/tasks`, `POST/PATCH/DELETE /api/tasks/:id`

**État critique** : `empty-state` (zéro tâche ouverte) — "Aucune tâche en attente. Profite." + illustration line-art minimale + CTA "Importer depuis Outlook"

**Patterns Twisty** :
- List-card rows avec chevron expand
- Filter chips en sticky bar
- Search bar style Twisty top-right

---

### 5. `agenda.html` — Vue hebdomadaire

**Rôle** : voir la semaine en cours.

**Contenu** :
- Header : "Semaine 17" + nav S-1 / S+1 (chevrons) + bouton "Aujourd'hui"
- Grille 7 jours × heures (8h-20h)
- Events Outlook colorés selon la société du contact (sky/amber/emerald/violet)
- Tasks due dans la semaine en chip overlay top de chaque colonne jour
- Sticky "Aujourd'hui" colonne mise en surbrillance brand-50

**API** : `GET /api/events?week=YYYY-Www`

**État critique** : `error-outlook-unreachable` (banner amber en haut "Outlook n'a pas répondu en 30s. Lien : Réessayer / Mode offline")

**Patterns Twisty** :
- Day pills S M T W T F S en sélecteur jour rapide
- Top nav style propre

---

### 6. `revues.html` — Revue hebdo

**Rôle** : rituel dominical, bilan S-1 + cap S+1.

**Contenu** :
- Header : "Revue Semaine 17" + chip "Pré-rédigée par Claude" (si auto-draft)
- Bloc "Big Rocks S-1" : list-card auto-rempli (✓ done / ⚠ partial / ✗ raté) avec couleur sémantique
- Bloc "Bilan" : champ libre 3 paragraphes, pré-rédigé éditable, format markdown subtil
- Bloc "Cap S+1" : 3 nouveaux objectifs à définir
- Sidebar droite (24 %) : historique 4 dernières revues (mini-cards cliquables)

**API** : `GET /api/weekly-reviews`, `POST /api/weekly-reviews/:week/draft`

**État critique** : `draft-streaming` (le bloc Bilan se remplit chunk par chunk pendant que Claude rédige le draft, ~5-10s, indicateur "Claude rédige…" discret)

**Patterns Twisty** :
- Stat hero pour le compteur "12/16 Big Rocks atteints sur 4 semaines"
- Sidebar list-card pour l'historique

---

### 7. `assistant.html` — Copilote chat live

**Rôle** : poser des questions stratégiques au copilote.

**Contenu** :
- Layout 2 colonnes :
  - **Sidebar conversations** (24 %) : 20 dernières conv triées updated_at DESC, search, "+ Nouvelle conversation"
  - **Chat principal** (76 %) : bubbles user (cream surface-3) / assistant (white surface-2)
- Streaming SSE : chunks text-delta puis done
- Skeleton bubble pendant connexion (3 lignes grises animées)
- Footer : input + cap 1500 max_tokens visible discrètement + bouton envoyer pill brand
- Citations sources sous chaque réponse (chips cliquables vers issues GitHub, ADR, fichiers)

**API** : `GET /api/assistant/conversations`, `POST /api/assistant/messages` (SSE)

**État critique** : `streaming-response` (bulle assistant en cours de remplissage, curseur clignote, possibilité d'arrêter génération avec un bouton)

**Patterns Twisty** :
- Avatar circulaire pour la sidebar conversations (initiales si pas de photo)
- List-card rows pour les convs

---

## Tier 3 — Registres (P2)

### 8. `groupes.html` — Portefeuille sociétés

**Rôle** : vue globale 4 sociétés.

**Contenu** :
- Header : "Portefeuille — 4 sociétés"
- Grid 2x2 de cartes-sociétés :
  - Logo placeholder couleur (monogramme E/A/S/AM)
  - Nom société
  - Intention en cours (1 ligne)
  - Big Rock semaine (1 ligne avec progress)
  - Stat hero KPI clé : CA cumul OU trésorerie OU nb projets actifs
  - Footer carte : nb tâches actives + nb décisions ouvertes
  - CTA "→ Voir détail" vers projets.html filtré

**API** : `GET /api/groups`

**État critique** : `default` (pas d'autre état pertinent)

**Patterns Twisty** :
- Carte format "Income Tracker" pour chaque société (en plus petit)
- Stat hero pour le KPI

---

### 9. `projets.html` — Liste chantiers

**Rôle** : tous les projets actifs cross-sociétés.

**Contenu** :
- Header : filtres en chips (société, statut, priority)
- Toggle vue : **Liste** | **Kanban**
- Liste : rows avec nom + société chip + % avancement (mini-progress) + prochaine étape + contact référent (avatar + nom)
- Kanban : colonnes par statut (À démarrer / En cours / En revue / Terminé)

**API** : `GET /api/projects?group=...&status=...`

**État critique** : `default`

**Patterns Twisty** :
- List-card avec rows expandable
- Filter chips
- Avatar + chip referent

---

### 10. `projet.html` — Page projet (template paramétré ?id=)

**Rôle** : vue détaillée d'un projet.

**Contenu** :
- Header : nom projet + société chip + statut chip + priority pill
- 4 onglets underline (style Twisty Home/Messages/Discover) :
  - **Vue d'ensemble** : intention, prochaines étapes (3-5), contacts (avatars), RDV à venir
  - **Tâches liées** : list embed taches filtrée par project_id
  - **Décisions** : list embed decisions filtrée
  - **Historique** : timeline événements
- Sidebar droite : meta projet (créé le, dernière modif, contact référent principal)

**API** : `GET /api/projects/:id`

**État critique** : `default`

**Patterns Twisty** :
- Tabs underline = navigation interne
- Stat hero pour avancement global

---

### 11. `contacts.html` — Registre équipe

**Rôle** : tous les contacts proches.

**Contenu** :
- Header : recherche `?q=` plein texte + filtres chips (société, dernier contact)
- Grid de cartes contact :
  - Avatar circulaire (photo si dispo, initiales sinon)
  - Nom (prénom + initiale du nom)
  - Rôle
  - Société chip
  - Chip "Dernier contact il y a X jours" (couleur sémantique : <7j vert, 7-30j neutre, >30j amber)
  - CTA "→ Mail" (mailto deeplink)

**API** : `GET /api/contacts?q=...`

**État critique** : `empty-search-results` ("Aucun contact trouvé pour 'xyz'. Essayer un autre terme.")

**Patterns Twisty** :
- Pattern "Let's Connect" parfaitement transposable
- Avatar + chip seniority devient avatar + chip dernier contact

---

### 12. `decisions.html` — Registre décisions

**Rôle** : décisions ouvertes + historique.

**Contenu** :
- Onglets underline : **Ouvertes** | **Décidées** | **Reportées**
- Liste : pour chaque décision : titre + contexte 1 ligne + options (chips) + deadline + chip société
- CTA per row : "Demander recommandation IA" → bulle violet apparaît avec la reco argumentée Claude

**API** : `GET /api/decisions`, `POST /api/decisions/:id/recommend`

**État critique** : `claude-recommendation-loading` (bulle violet skeleton pendant 2-3s puis remplissage du raisonnement)

**Patterns Twisty** :
- Tabs underline
- List-card rows avec chevron expand

---

## Récap rapide pour Claude Design

| # | Page | Tier | État critique en plus du default |
|---|---|---|---|
| 1 | index.html | T1 | outlook-stale-warning |
| 2 | arbitrage.html | T1 | loading-claude-recommendation |
| 3 | evening.html | T1 | streak-celebration |
| 4 | taches.html | T2 | empty-state |
| 5 | agenda.html | T2 | error-outlook-unreachable |
| 6 | revues.html | T2 | draft-streaming |
| 7 | assistant.html | T2 | streaming-response |
| 8 | groupes.html | T3 | (default uniquement) |
| 9 | projets.html | T3 | (default uniquement) |
| 10 | projet.html | T3 | (default uniquement) |
| 11 | contacts.html | T3 | empty-search-results |
| 12 | decisions.html | T3 | claude-recommendation-loading |

**Total vues** : 13 default + 9 états critiques = **22 vues**.
