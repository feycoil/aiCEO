# UX Intentions v0.8 — Working Notes (archive complete)

**Statut** : Travail en cours · **Audience** : binome CEO + agent Claude · **Cree** : 29/04/2026 PM

> Ce document **archive l integralite de la reflexion UX preparatoire au sprint S6.16+** : intentions brutes, arbitrages identifies (avec options non retenues), references visuelles candidates, scenarios quotidiens candidats, prompt finalise Phase 1, et vision long terme. **A ne pas effacer apres livraison de la Phase 1** — sert de reference pour les iterations futures (V1.x boite de design Pentagram/IDEO).

---

## A. Intentions UX/UI brutes (verbatim CEO)

> Capture textuelle pour preserver l intention originelle. Date : 29/04/2026 PM.

```
Intention UX/Ui - Experience utilisateur - Apprehension Interface
------------------------------------------------------------------
+ Comment lancer le hub et l onboarding
+ revoir la semantique du projet maison, espace, arbitrage, decision, projet, taches/actions, etc. > documenter dans aide, garder coherence semantique
+ lutter contre la complexite et submersion d information. CEO souvent multi task sur sollicite. l appli doit apporter de la serenite dans la complexite

	> Principe de la page google - tres epure par defaut (USPs mis en avant - simple efficace/courant - le reste peut etre atteint a la demande via des menus)
+ l intention de l application doit etre clair et identifiable - a ce stade on a l impression d un admin dashboard avec des infos de toutes part.
	> intention UX/UI (masquer par defaut ce qui n est pas utile toute de suite ce qui n est pas usage immediat)
		> decouvrir les infos contextuellement -> dans le parcours
		> si besoin le CEO peut aller chercher du detail via un menu de navigation
	> l appli doit paraitre simple d utilisation au premier abord et legere meme si beaucoup de fonctionnalites (masque au premier abord si elle n ont pas d interet immediat)
	> privilegier par defaut une experience guidee (navigation en mode journey type) - a identifier.
+ trop d info peux amener a la procrastination :
	l appli s adresse a des CEO ADHD profile / Perfectionniste / Autistic / Exhausted / overwhelmed
		il doit les aider a sortir du stress et du blocage devant ampleur de la taches
		il doit gamifier pour experience plus joyeuse et rewards (plusieurs niveau)
		elle doit etre incitative > CEO profil batailleur > gagnant > stratege

Il faut pouvoir adresser tout cela dans une experience d utilisation unique et coherente et integree et simple et sexy.
le layout du contenu, style de presentation du contenu, des presentation imagee conceptuelle (graph, map, tree, diagrammes, plan, tableaux, etc.) sont a privilegier pour des profile CEO
	> visual thinking, synthese, alternative view, beaucoup d info en vue simple.
	> rien n empechera par la suite de rechercher le detail s il souhaite creuser mais par defaut le CEO veut du narratif, du guide, de l illustre et conceptuel, du clair et direct (efficient/efficace).

+ le style design lisible - aere/epure - premium/pro - luxe/minimaliste/haut de gamme - design/art (le CEO est generalement qqun d eduque - CSP+ - premium)
```

---

## B. Arbitrages identifies (5 tensions strategiques)

Chaque tension est listee avec **les options envisagees** (B1-B4 initiales + B5 ajoutee 29/04 PM tardif) et la **recommandation tranchee** issue de la conversation. Les options non retenues sont **conservees pour V1.x ou pivot eventuel**.

### B1. Tension luxe minimaliste × gamification

| Option | Description | Statut |
|---|---|---|
| **A. Editorial pur** | Aucune gamification visible. Streak chiffre sobre. Apple Fitness anneaux discrets. Inspiration : Reflect, Linear, Apple HIG. | **RECOMMANDEE Phase 1** |
| B. Gamification douce | Anneaux completion + 3 niveaux de strates (debutant/aguerri/strategiquement-aiCEO). Inspiration : Apple Fitness + Whoop. | Backlog V1.x si CEO le demande explicitement |
| C. Gamification saine forte | XP, niveaux narratifs (Apprenti/Pilote/Strategist/Visionnaire), streaks visibles, ligues. Inspiration : Duolingo. | **REJETEE** (incompatible identite premium) |
| D. Pure utilite zero gam | Aucun rewards visible, juste les KPIs bruts. | Trop austere, perd l incitatif |

**Pourquoi A** : protege l identite Editorial Executive premium pour le public CSP+. Une gamification visible kitsch ferait fuir un CEO 50+ ans habitue aux outils Bloomberg/Stripe/Linear.

### B2. Profil utilisateur cible (positionnement marketing & psychologique)

| Option | Description | Statut |
|---|---|---|
| **a. Major Fey, CEO reel ETIC Services** | App concue pour un humain reel et ses traits perso. Pas de positionnement marketing. | **RECOMMANDEE Phase 1** (single-user actuel) |
| **b. CEO francais francophone CSP+ premium** | Positionnement large : profils varies, tous aises. | **RECOMMANDEE V1+** (SaaS multi-tenant) |
| c. CEO multi-tasking exhausted generique | Positionnement pathologisant ("CEO surcharge"). | **REJETE** (condescendance + risque marketing) |
| d. CEO ADHD/Perfectionniste/Autistic | Positionnement medicalise. | **REJETE** (niche, blessant, mauvais marketing) |

**Pourquoi a + b en sequence** : aujourd hui single-user (Major), donc concu pour Major. Demain SaaS V1, pivot vers (b) avec recherche utilisateur formelle.

### B3. Semantique metier (concepts canoniques)

| Concept | Definition Phase 1 (provisoire, a finaliser dans Memorandum) |
|---|---|
| **Espace** | Conteneur top-level (1 espace = 1 perimetre = 1 compte). Multi-espace possible plus tard. |
| **Maison** | Synonyme UI de "Projet" en mode visuel/affectif (cf. "projects-houses" cockpit). |
| **Projet** | Entite metier (table `projects`) avec statut alerte/a-surveiller/sain. |
| **Groupe** | Regroupement transverse de projets (ex : "Direction generale", "Tech", "Commercial"). |
| **Cap strategique** | Intention de la semaine/trimestre. Si decision du jour ne sert pas le cap, la differer. |
| **Big Rock** | Priorite hebdo (max 3 par semaine). |
| **Arbitrage** | Rituel matin (5-10 min) de tri emails + decisions. |
| **Decision** | Choix explicite trace (ouverte / tranchee / gelee / reportee). |
| **Action / Tache** | Travail concret (Eisenhower urgent×important). Synonymes (UI prefere "Action"). |
| **Rituel** | Routine planifiee (matin Arbitrage, soir Bilan, vendredi Revue). |
| **Pin de connaissance** | Decision/critere/regle epinglee pour reutilisation future. |
| **Signal faible** | Pattern detecte par l app (ex : 3 decisions ouvertes > 7 jours). |

**Principe** : ne pas reinventer sauf si vraie innovation produit. Garder le langage CEO standard (decision, action, projet) et limiter les neologismes a `cap strategique`, `Big Rock`, `pin`, `signal faible`. **Eviter** : "vibe", "energy points", "milestones-quests", "achievement-unlocked".

### B4. Navigation guidee × liberte

| Option | Description | Statut |
|---|---|---|
| **A. Journey par defaut + liberte derriere menu** | A l ouverture, l app propose le rituel adapte a l heure (matin/journee/soir). Le CEO peut sortir du parcours via le drawer-sidebar. | **RECOMMANDEE Phase 1** |
| B. Liberte totale, pas de journey | Toujours le cockpit en page d entree, le CEO choisit. | **REJETEE** (perd l incitatif rituel) |
| C. Journey impose | App force le rituel matin/soir, pas de skip. | **REJETEE** (paternaliste) |
| D. Mode journey toggleable | Setting on/off dans Reglages. | Backlog V1.x si feedback negatif sur (A) |

**Pourquoi A** : aligne avec "experience guidee mode journey" demande, sans enlever la liberte. Le drawer-sidebar reste le filet de securite.

---

### B5. Carte parcours CEO (vue retrospective de la trajectoire)

> Ajout 29/04/2026 PM tardif suite reflexion CEO. Idee : visualisation interactive arbre/roadmap des decisions/actions/projets accomplis, structuree par domaines (admin/fi/op/r&d/maintenance/rh).

| Option | Description | Effort | Statut |
|---|---|---|---|
| A | Bloc "Ma trajectoire" dans le Cockpit (sous projects-houses) | 1.5 h binome | Bonne pour Phase 2 MVP partiel |
| **B** | **Page dediee `trajectoire.html` accessible depuis drawer (section Capital)** | 3 h binome | **RECOMMANDEE Phase 2 ou S6.18** |
| C | Onglet dans Hub.html (Hub + tabs) | 2 h binome | Trop charge pour Hub, perd minimalisme |
| D | Differee V1+ (vision long terme, pas urgent) | 0 h immediat | Possible si surcharge sprints actuels |

**Pourquoi B** : la vue retrospective merite sa propre page (URL, storage, rythme). S inscrit naturellement dans la section "Capital" du drawer (a cote de `decisions`, `revues`, `connaissance`, `coaching`) — c est une vue strategique long-terme.

**Semantique a trancher en Phase 1** : que montre la carte ?
- Decisions tranchees (timeline) ?
- Big Rocks atteints ?
- Projets clos ?
- Mix des trois ?

**Recommandation agent** : mix Big Rocks atteints + decisions strategiques + projets clos. **Exclure les actions du quotidien** (sinon trop de bruit, on retombe dans l admin dashboard).

**Risques identifies** :
- R1 — Surcharge cognitive si arbre touffu → **mitigation** : densite progressive (vue 7j/30j/90j/6mois/1an), zoom/pan, regroupement automatique.
- R2 — Taxonomie imposee (admin/fi/op/r&d) → **mitigation** : taxonomie parametrable via Reglages -> Maisons existant.
- R3 — Semantique floue → **mitigation** : trancher en Phase 1 quel mix d items la carte affiche.
- R4 — Cout technique (graphe SVG interactif) → **mitigation** : MVP 2h (timeline horizontale par domaine, sans pan/zoom) puis extension iterative.
- R5 — Chevauchement avec Pilotage → **mitigation** : Pilotage = vue dev binome ; Trajectoire = vue metier executive ("ai-je avance vers mes objectifs ?" vs "le projet code progresse-t-il ?").

**Inspirations externes** : GitHub contribution graph · Strava heatmap · Apple Fitness mois (anneaux 30j) · Heptabase whiteboard · Notion Database "Gallery view".

**Voir** : `IDEE-CARTE-PARCOURS-CEO.md` dans ce dossier pour le detail architectural complet.

---

## C. 20 references visuelles candidates (choix par familles)

Le CEO a selectionne 5 admirees + 5 detestees parmi cette liste. Les autres restent **references potentielles pour iterations futures**.

### Famille 1 — Editorial luxe
1. **Reflect** — surface notes presque vide, AI invoquee au /
2. **Linear** — sobriete hyper-fonctionnelle, raccourcis Cmd+K omnipresents
3. **Bear** — editeur markdown premium iOS, typographie soignee
4. **iA Writer** — typo monospace, focus mode, zen total
5. **Craft Docs** — luxueux, fond pastel, hierarchie marquee

### Famille 2 — Productivite moderne epuree
6. **Sunsama** — calendar + taches en split sobre, langage humain
7. **Amie** — calendrier + tasks fusionnes, animations soyeuses
8. **Notion Calendar (ex-Cron)** — minimaliste, raccourcis claviers
9. **Superhuman** — email Inbox Zero, vitesse, AI integree discrete

### Famille 3 — AI-first conversationnel
10. **Granola** — chat AI sur fond clair, panneau notes minimaliste
11. **Claude.ai** — desktop chat, latte typographique, pas de chrome
12. **Perplexity** — recherche IA, sources visibles, sobriete

### Famille 4 — Visual thinking & maps
13. **Heptabase** — cartes visuelles, whiteboard, connections
14. **Obsidian Canvas** — graphes de notes, infinite canvas
15. **Tana** — outliner avec super-tags, structuration souple
16. **Whimsical** — diagrammes flux, mind-maps colores mais clean

### Famille 5 — Gamification luxe (anti-Duolingo)
17. **Apple Fitness — anneaux** — gamification ultra-discrete, 3 cercles
18. **Whoop** — recovery score, mono-chiffre par ecran
19. **Oura Ring app** — metriques sommeil + readiness, dark premium

### Famille 6 — Serenite / calme
20. **Endel** — soundscape adaptatif, interface contemplative

### Predictions et choix CEO
**Predictions agent (avant choix)** : 1 (Reflect), 2 (Linear), 5 (Craft), 11 (Claude.ai), 17 (Apple Fitness anneaux).
**Choix CEO confirme** : [A REMPLIR PAR CEO]
**Choix CEO rejetes** : [A REMPLIR PAR CEO]
**Notes** : conserver les 14-15 non-retenus comme **bibliotheque de references pour V1.x boite de design**.

---

## D. 20 scenarios quotidiens candidats

Le CEO en a retenu 6-8 essentiels. Les autres restent **utiles pour tests utilisateurs ulterieurs (V1)** et **tests E2E Playwright**.

### Tranche matinale
1. **8h00 lundi** — cafe, ouvre l app, veut sentir "ma semaine sous controle en 30 sec"
2. **8h15 mardi** — reveil difficile, quoi voir d abord pour s eviter le rabbit-hole emails ?
3. **8h45 mercredi** — entre 2 reunions, juste verifier "ai-je rate quelque chose ?"
4. **9h30 jeudi** — vient de gagner un deal, veut **celebrer** (ou va ce moment ?)

### Tranche journee
5. **10h30 mardi** — un email difficile arrive, l app aide a arbitrer "reponds maintenant ou differe ?"
6. **11h45 lundi** — perdu dans 3 projets en parallele, veut une **vue mindmap** pour s y retrouver
7. **13h30 mercredi crash** — surcharge, frustre, veut **"qu est-ce qui compte VRAIMENT cette semaine ?"**
8. **14h15 jeudi** — finit un pitch, veut documenter rapidement la decision prise sans casser le flow
9. **15h30 vendredi** — veut explorer **"qui dans mon equipe je n ai pas appele depuis 2 semaines ?"**
10. **16h00 mardi** — un partenaire ecrit, l app suggere **3 options de reponse contextuelles**
11. **17h00 lundi** — fin de journee, veut savoir **"est-ce que j ai avance aujourd hui ?"**

### Tranche soir & rituel
12. **18h30 vendredi** — bilan semaine, veut **celebrer** ce qui a marche + nommer 1 chose a arreter
13. **19h00 mercredi** — epuise, **rituel court** (mood + energie + 1 mot du jour) en 90 secondes max
14. **22h30 dimanche** — dimanche soir, veut **preparer mentalement** la semaine sans planifier dans le detail

### Moments strategiques
15. **9h00 mois nouveau** — fait son **plan trimestre**, veut se rappeler du cap precedent
16. **14h00 vendredi mois** — veut **revue mensuelle** : qu est-ce qui a derive vs cap ?
17. **avant board meeting** — prepare 3 slides en 10 min depuis l historique app

### Moments difficiles
18. **apres nuit blanche** — l app **detecte** (humeur basse 3 jours, energie 2/5) et **adapte** : pas de rituel ce soir, message court bienveillant
19. **conflit avec collaborateur** — veut documenter sa reflexion sans la partager, juste pour soi
20. **apres erreur** — veut **revisiter** une decision passee qui s est mal passee, sans se flageller

### Recommandation agent (essentiels Phase 1)
**6 scenarios essentiels** (★) : 1, 2, 7, 11, 13, 18.
- 1 : entree par excellence
- 2 : anti-rabbit-hole emails
- 7 : sortir du blocage (principe directeur)
- 11 : retrospection rapide fin de journee
- 13 : rituel court soir (deja livre v07)
- 18 : detection + adaptation IA bienveillante

**Selection CEO confirmee** : [A REMPLIR PAR CEO]
**Notes** : 14 scenarios non-essentiels conserves pour : (a) tests utilisateurs V1 quand 5+ CEOs pairs onboardes, (b) tests E2E Playwright avec scenarios temporels reels, (c) idees produit V2/V3 (ex : scenario 4 celebration → feature "Wall of Wins", scenario 18 detection → feature "Coach mode" V3).

---

## E. Prompt finalise Phase 1 V2 (a soumettre a l agent quand pret)

> **V2 - 29/04/2026 PM tardif** : integre les 5 angles morts identifies en analyse posterieure (phrase magnetique 7 mots / moodboard SVG intermediaire / chronotype visuel matin-soir / distinction vue macro vs micro / 5e tension carte parcours) + 5e arbitrage strategique a trancher.

```markdown
# PROMPT — aiCEO UX Phase 1 V2 : Cadrage conversationnel (1 h binome, zero code sauf moodboard SVG)

## Contexte (auto-suffisant)
aiCEO v0.7+ livree (18/18 pages v07, framework Atomic Templates, direction Editorial Executive).
Cible utilisateur principale : Major Fey, CEO ETIC Services. Modele binome (CEO + agent Claude).
Sprint UX insere en parallele de S6.13 LLM. Objectif Phase 1 : trancher 5 arbitrages
fondamentaux et produire un Memorandum-cadrage 1 page recto + moodboard SVG simple
avant tout travail de code metier. Phase 2 (separee) refondra UNE page-pilote (Cockpit).
Phase 2bis ou S6.18 : carte parcours CEO si tranche en B5. Vision boite de design
Pentagram/IDEO inscrite en backlog V1.x avec etoffement ADD-AI.

## Inputs CEO (a remplir avant de soumettre ce prompt)

### 1. Selection visuelle (cf. WORKING-NOTES.md section C)
- 5 apps que j admire / inspire-moi : [LISTE_5_APPS_ADMIREES]
- 5 apps que je trouve trop chargees / NOK : [LISTE_5_APPS_DETESTEES]

### 2. Selection scenarios quotidiens (cf. WORKING-NOTES.md section D)
- Scenarios essentiels retenus (6-8 max) : [LISTE_SCENARIOS]

### 3. Arbitrages tranches a priori (5 tensions, cf. WORKING-NOTES.md section B)
- B1 — Tension luxe x gamification : curseur 0-10 -> MA POSITION : [VALEUR]
- B2 — Profil utilisateur : (a) Major reel / (b) CEO CSP+ / (c) generique / (d) medicalise -> MA POSITION : [VALEUR]
- B3 — Semantique metier : autorise reinvention sauf innovation justifiee -> MA POSITION : [VALEUR]
- B4 — Navigation guidee x liberte : (A) journey + liberte / (B) liberte totale / (C) journey impose / (D) toggleable -> MA POSITION : [VALEUR]
- B5 — Carte parcours CEO : (A) bloc Cockpit / (B) page dediee / (C) onglet Hub / (D) differee V1+ -> MA POSITION : [VALEUR]
  Si A ou B : que montre la carte ? (decisions / big rocks / projets / mix) -> MA POSITION : [VALEUR]

### 4. Criteres mesurables parametrables (innovation produit)
- D accord pour integrer le panneau "Mes baselines & cibles" dans Reglages -> Coaching ? OUI / NON / PRECISER

## Mission Phase 1 (livrables)

### Livrable principal : Memorandum-cadrage
Produis `04_docs/_design/MEMO-UX-V08-PHASE1.md`, **1 page recto (≤ 600 mots)**, contenant :
1. **Phrase magnetique 7 mots** — la promesse vendable d aiCEO en 7 mots type "The issue tracker you ll enjoy using" (Linear). Pas une definition, une promesse.
2. **Identite tranchee** (3 lignes max) — ce qu aiCEO est et ce qu il N est PAS.
3. **5-7 principes directeurs nominaux** — courts, memorables, traçables dans le code.
4. **Tensions tranchees** (5 tensions B1-B5, decision binaire ou nuancee + justification 1 phrase chacune).
5. **Glossaire metier canonique** (10-12 termes).
6. **Visualisations conceptuelles par page** :
   - **Vue macro** (1 visualisation marquante par page d entree : Hub, Trajectoire si retenue)
   - **Vue micro** (1 visualisation par page detaillee : Cockpit, Projet, Equipe, Agenda, Revues, Decisions)
   - Specifier laquelle pour les 6 pages les plus exposees.
7. **Chronotype visuel** — pour chaque tranche horaire (matin / journee / soir / nuit), preciser :
   - Palette dominante (warm / neutral / cool)
   - Densite contenu (epure / standard / dense)
   - Tonalite langage (energique / pragmatique / contemplatif)
8. **4-5 KPIs personnels parametrables** (panneau Reglages -> Coaching).
9. **Punch-list Phase 2** (5-8 actions ordonnees, estimation horaire binome).
10. **Scope-out explicite** (mode sombre, illustrations sur mesure, audit WCAG complet, refonte 18 pages d un coup, gamification Duolingo-like).

### Livrable bonus : Moodboard SVG simple
Produis aussi `04_docs/_design/MOODBOARD-V08-PHASE1.svg`, **1 fichier SVG ≤ 30 KB** contenant :
- Palette decidée (5-7 swatchs nommes)
- Typo principale + secondaire (specimens "Aa Bb Cc 123")
- 3 cartes types stylisees (KPI tile, decision card, journey banner)
- Permet validation visuelle CEO en 30 sec avant Phase 2

## Contraintes
- Coherence v07 obligatoire (framework Atomic + Editorial Executive base)
- Mount Windows piege #2 (atomic write Python si fichier > 50 lignes)
- Tests v07-atomic.test.js 10/10 verts
- Pas de dependance externe lourde (SVG natif, CSS, au pire Chart.js)
- Cohabitation v06 ↔ v07 jusqu a S6.15

## Validation
Memo + moodboard relus par CEO en 5 min. Si OK -> lance Phase 2 (refonte Cockpit). Si desaccord -> 1 boucle d ajustement.
```


---

## F. Vision long terme — Boite de design Pentagram/IDEO style (V1.x)

**Statut** : Backlog · **Activation** : V1.x apres bascule v07 = defaut.

### Ce qu il faudra etoffer dans ADD-AI Cowork plugin

**Nouveaux subagents** (`.cowork/agents/`) :
- `design-strategist` — produit chartes UX, manifestes, principes directeurs structures
- `ux-researcher` — synthese interviews, personas formels, parcours-utilisateur cartographies
- `visual-systems` — design tokens detailles, illustrations sur mesure (mood-boards SVG), specifications composants

**Nouvelles skills** (`.cowork/skills/`) :
- `produce-design-system` — genere DS complet (tokens, composants, doc, exemples) en livrable PDF + storybook
- `audit-ux-quantitatif` — instrumente l app, mesure 30 jours d usage reel, produit rapport audit
- `design-handoff-spec` — produit specs detaillees engineer-ready (Figma-like specs en markdown + SVG)

**Nouveaux outputs supportes** :
- Mood-boards SVG complexes
- Spec PDF multi-pages (skill `pdf` deja la mais a etoffer)
- Storybook genere automatiquement
- Videos demos (lottie / svg-animation)

**Estimation** : 2-3 sprints d etoffement Cowork plugin en V1.x (~6-9 h binome).

### Pourquoi differer
- Phase 1+2 actuelles = livraison rapide pour CEO single-user (Major)
- Boite de design = sens uniquement quand SaaS multi-tenant (V1+) avec plusieurs CEOs pairs cobaye
- Eviter sur-engineering pour le besoin actuel

---

## G. Notes pour reprise future

### Quand reactiver ce document
- Demarrage Phase 1 (S6.16) : remplir les `[A REMPLIR PAR CEO]` de la section C, D
- Apres Phase 2 (page-pilote Cockpit livree) : noter les apprentissages Phase 2, ajuster si nouvelles tensions decouvertes
- Demarrage V1.x boite de design : reactiver section F, decomposer en sprints d etoffement ADD-AI
- Pivot positionnement marketing (single → SaaS) : revisiter B2 (profil utilisateur)

### Conventions a suivre
- Tout ajout futur en haut de section avec date + sprint id
- Conserver les options non retenues, ne JAMAIS supprimer
- Mettre a jour ce doc en cascade avec ADR DECISIONS.md quand decision officielle prise

### Fichiers lies
- `04_docs/_design-v05-claude/` — heritage Phase 1 design (claude design vague 1)
- `00_BOUSSOLE/DECISIONS.md` — ADRs officielles
- `04_docs/08-roadmap.md` — roadmap officielle, sera amendee post Phase 2
- `CLAUDE.md` §1 — statut sprint en cours

---

**Version** : 1.0 · 29/04/2026 PM
**Auteur** : Binome CEO Major Fey + agent Claude
**Prochaine reactivation prevue** : Demarrage S6.16 (Phase 1 cadrage)
