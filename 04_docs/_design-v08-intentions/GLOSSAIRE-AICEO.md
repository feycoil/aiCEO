# GLOSSAIRE aiCEO — 12 termes canoniques (voix exec moderne)

**Statut** : VALIDE Phase 1 · **Date** : 29/04/2026 PM tardif · **Voix** : exec moderne avec anglicismes premium ancres

> Ce glossaire est la **source de verite semantique** pour tous les libelles UI, codes, documentation. Toute deviation doit etre justifiee par une vraie innovation produit (cf. arbitrage B3 nuance vers voix exec moderne).

## Hierarchie des concepts (champ semantique navigation maritime)

```
Hub (port d attache + page d accueil personnelle, fusion semantique)
└── Stream (vertical de business : admin / fi / op / r&d / maintenance / rh)
    └── Project (entite metier)
        ├── Action (travail concret)
        ├── Decision (choix trace)
        └── Pin (extrait epingle reutilisable)

Au-dessus du portefeuille :
- Compass (pilotage strategique, drawer section)
- North Star (intention trimestre/semaine)
- Big Rock (priorite hebdo, max 3)
- Sync (umbrella term : Triage matin, Quick Sync hebdo, Evening Sync)
- Triage (rituel matin tri emails et decisions)

Detection automatique :
- Pulse (signal faible detecte par l app)
```

## Definitions

### Hub
**Conteneur top-level + page d accueil personnelle** (fusion semantique). Un Hub = un perimetre = un compte. Multi-Hub possible plus tard (perso / pro / projet specifique). La page `hub.html` du drawer EST la page d entree dans son Hub. Synonyme operationnel : tenant.

### Stream
**Vertical de business** transverse aux Projects (admin, finance, ops, R&D, maintenance, RH, commercial, etc.). Configuration parametrable Reglages → Streams. Chaque Project appartient a 1 Stream. Permet la structuration de la Trajectoire et des dashboards par metier.

### Project
**Entite metier principale** (table `projects`). Statut auto-detecte : `alerte / a-surveiller / sain` (heuristique sur volume mails 30j). Possede des Actions, Decisions, Contacts lies. C est l unite de travail concrete.

### Action
**Travail concret a executer.** Suit la matrice Eisenhower (`urgent` × `important`). Possede une echeance, un Project de rattachement, un statut `done`. *Cote backend : table `tasks`.*

### Decision
**Choix explicite trace.** Statuts : `ouverte` (a trancher) / `tranchee` (engagee) / `gelee` (suspendue) / `reportee` (replanifiee). Chaque Decision a un titre, contexte, options envisagees, eventuellement une resolution + date de trancheage.

### Pin (de connaissance)
**Extrait epingle reutilisable** : decision / critere / regle. Stocke dans table `knowledge_pins`. Permet a l Assistant LLM d injecter du contexte personnalise. Notion-style.

### Compass
**Pilotage strategique** (drawer section + outil mental). Le Compass guide vers la North Star. Repond a la question "ai-je le cap ?". Affiche dans Cockpit, accessible Sync hebdo. Inspiration : "let me steer this", "stay the course".

### North Star
**Intention de la semaine ou du trimestre.** Phrase courte qui donne le "pourquoi". Si une Decision du jour ne sert pas la North Star, la differer. Ancree dans la table `weekly_reviews.intention`. Inspiration : Y Combinator, founder culture.

### Big Rock
**Priorite hebdomadaire (max 3 par semaine).** Issu du concept "Big Rocks first" (Stephen Covey). Doit etre tangible et mesurable a la fin de la semaine. Si plus de 3, ce ne sont plus des priorites.

### Sync
**Umbrella term pour tous les rituels coordonnes.** Inclut :
- **Triage matin** (5-10 min) — tri emails + decisions du jour
- **Evening Sync** (3 min) — humeur + energie + top 3 + streak
- **Quick Sync hebdo** (30 min, vendredi) — bilan + Big Rocks + auto-draft Claude

Cohere avec le langage interne ETIC ("Quick Sync Hebdo" = reunion managers).

### Triage
**Rituel matin (5-10 min)** de tri emails + Decisions. File des emails non lus / flagges / recents → 3 actions possibles : **accepter / reporter / ignorer**. Genere des Decisions, Actions, met a jour les Projects. Anglicisme medical (emergency-room) → urgence priorisee.

### Pulse
**Pattern detecte automatiquement** par l app (rule-based ou LLM). Signal faible que l on doit ressentir. Exemples :
- 3 Decisions ouvertes depuis > 7 jours → "your decision pulse is slowing"
- 2 Projects en alerte simultanement → "alert pulse rising on Streams X+Y"
- Mood basse 3 jours consecutifs → "your serenity pulse drops"
- Aucun Evening Sync cette semaine → "your rhythm pulse is fading"

S affiche dans Coaching et eventuellement dans Cockpit (banner discret). Inspiration : "checking the pulse" exec strategy/wellness.

## Drawer sections (sections du menu lateral)

- **Compass** (ex-Pilotage) — Cockpit, Triage, Evening Sync
- **Deliver** (ex-Travail) — Projects, Actions, Agenda, Assistant, Equipe
- **Wealth** (ex-Capital) — Pins (Connaissance), Coaching, Weekly Sync (ex-Revues), Decisions, Trajectoire (NEW page S6.18)

## Termes a EVITER

Liste des termes qui doivent **etre rejetes** des libelles UI :

- ❌ `vibe`, `energy points`, `XP`, `level up`, `quest`, `achievement` (jargon gamification kitsch — Duolingo banni)
- ❌ `opportunity`, `lead`, `case`, `pipeline` (jargon CRM Salesforce banni)
- ❌ `ticket`, `issue`, `epic`, `story` (jargon agile/JIRA banni)
- ❌ `deal`, `account`, `contact-lead` (jargon commercial banni)
- ❌ `vibe coding`, `flow state`, `4D thinking` (buzzwords)
- ❌ `Cap strategique` (litteral) → utiliser **North Star**
- ❌ `Rituel` (litteral) → utiliser **Sync**
- ❌ `Signal faible` (litteral) → utiliser **Pulse**
- ❌ `Espace` (banal) → utiliser **Hub**
- ❌ `Maison` (alias affectif inutile) → utiliser **Project**
- ❌ `Groupe` (banal) → utiliser **Stream**
- ❌ `Pilotage / Travail / Capital` (banal) → utiliser **Compass / Deliver / Wealth** dans le drawer

## Conventions de libelle UI

- **Phrases courtes**, sans verbe a l infinitif si possible ("Top 3 du jour" plutot que "Voir mes top 3 actions du jour")
- **Tutoiement evite** (preferer la forme impersonnelle ou distancee polie)
- **Majuscules** : Title Case pour les concepts canoniques (North Star, Big Rock, Quick Sync) ; minuscules pour les libelles courants
- **Mots francais en priorite** : "actions" plutot que "tasks", "decisions" plutot que "decisions" (anglais)
- **Anglicismes exec acceptes** : Hub, Stream, Project, Compass, North Star, Big Rock, Sync, Triage, Pulse, Pin, Trajectoire (francais).
- **Composes mixtes** : "Quick Sync hebdo", "Evening Sync", "Triage matinal" → mix accepte si fluidite preservee.
