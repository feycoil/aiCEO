# Choix CEO — Etape 0 (preparation Phase 1 UX v0.8)

**Date** : 29/04/2026 PM tardif · **Statut** : VALIDE · **Audience** : binome CEO + agent Claude

> Inputs consolides du CEO suite a l accompagnement etape par etape (sous-etapes 0.1 a 0.5). Ces choix nourrissent le **prompt Phase 1 V2** archive dans `WORKING-NOTES.md` section E.

---

## 0.1 — 5 apps admirees

| # | App | Ce qui plait | URL ref |
|---|---|---|---|
| 1 | **Amie** | Timeline + fonctionnalite tres discrete (suggeree) | https://amie.so |
| 2 | **Linear** | Sobriete hyper-fonctionnelle | https://linear.app |
| 3 | **Craft.io** (rebrand 2024) | Cards avancees design + interactivite | https://craft.io/blog/brand-new-craft/ |
| 4 | **Superhuman** | Simplicite focus | https://superhuman.com |
| 5 | **Apple Fitness** | Anneau diagramme | https://www.apple.com/apple-fitness-plus |

**Patterns retenus** : discretion / suggere · cards interactives riches · sobriete fonctionnelle DRY · visualisation conceptuelle motivante · focus plutot que dashboard.

## 0.2 — 5 apps detestees / NOK

| # | App | Anti-pattern incarne |
|---|---|---|
| 1 | **Salesforce** | Dashboard admin charge, modules partout |
| 2 | **Odoo** | ERP formulaires lourds + ergonomie technique |
| 3 | **Microsoft Outlook** (nouvelle version) | Admin charge + transparence/blur |
| 4 | **Duolingo** | Gamification kitsch saturee, mascotte |
| 5 | **Bloomberg Terminal** | Sombre + charge, surcharge informationnelle |

**Anti-patterns formalises** : (1) dashboard admin charge · (2) transparence/blur effets sur bg · (3) kitsch colore · (4) brut/austere · (5) trop sombre permanent.

## 0.3 — 15 scenarios retenus + 5 differes

### Niveau A — 7 essentiels Phase 1+2 (immediate)
| # | Scenario |
|---|---|
| 1 | 8h00 lundi — sentir "ma semaine sous controle en 30 sec" |
| 2 | 8h15 mardi — anti-rabbit-hole emails au reveil |
| 4 | 9h30 jeudi — celebrer un deal gagne |
| 7 | 13h30 mercredi crash — "qu est-ce qui compte VRAIMENT ?" |
| 11 | 17h00 lundi — "j ai avance aujourd hui ?" |
| 13 | 19h00 mercredi — rituel court 90 sec (mood + energie + 1 mot) |
| 18 | Apres nuit blanche — app detecte humeur basse + adapte bienveillance |

### Niveau B — 8 post-Cockpit (S6.18+)
| # | Scenario | Sprint cible |
|---|---|---|
| 3 | 8h45 entre 2 reunions — rapide check | S6.18 (Hub) |
| 5 | 10h30 email difficile — arbitrer "repondre/differer" | S6.19 (Arbitrage) |
| 6 | 11h45 mindmap projets paralleles | S6.18 (Carte parcours) |
| 8 | 14h15 documenter decision pitch sans casser le flow | S6.20 (Decisions) |
| 10 | 16h00 partenaire ecrit, app suggere 3 options reponse | S6.21 (LLM frontend) |
| 12 | 18h30 vendredi — celebrer + nommer 1 chose a arreter | S6.19 (Revues) |
| 14 | 22h30 dimanche — preparer mentalement la semaine | S6.18 (rituel elargi) |
| 17 | Avant board meeting — 3 slides en 10 min | V1.x (export PPT) |

### Niveau C — 5 differes V0.9+
| # | Scenario |
|---|---|
| 9 | 15h30 vendredi — qui dans equipe pas appele depuis 2 semaines ? |
| 15 | 9h00 mois nouveau — plan trimestre, rappel cap precedent |
| 16 | 14h00 vendredi mois — revue mensuelle deriver vs cap |
| 19 | Conflit collaborateur — documenter reflexion privee |
| 20 | Apres erreur — revisiter decision passee sans flagellation |

## 0.4 — 5 arbitrages strategiques

### B1 — Curseur luxe x gamification : **4 / 10**
Gam visible mais sobre : streak + anneau completion + 1 indicateur de progression.
**Jamais** : XP, mascotte, confettis, ligues. Un cran au-dessus des Apple Fitness anneaux purs (3).

### B2 — Profil utilisateur : **a → b sequence**
- (a) Major Fey, CEO reel ETIC Services, traits perso → **Phase 1 + 2 immediate**
- (b) CEO francophone CSP+ premium → **V1+ (SaaS multi-tenant)**

Implications : on conçoit Major-friendly maintenant, on universalise au moment du SaaS. Tests utilisateurs CEOs pairs francophones recrutes en V1.

### B3 — Semantique metier : **A** (pas de reinvention sauf vraie innovation)
Le CEO insiste sur **glossaire et definitions precises**. Livrable supplementaire : `GLOSSAIRE-AICEO.md` annexe au memo Phase 1, avec :
- 11 termes canoniques (espace, maison, projet, groupe, cap strategique, Big Rock, arbitrage, decision, action, rituel, pin, signal faible)
- Definition 1-2 phrases par terme
- Relations hierarchiques (espace contient projets, projet appartient a groupe, etc.)

### B4 — Navigation guidee x liberte : **A** (journey + liberte derriere drawer)
Matin propose Arbitrage, soir propose Bilan, mais le CEO peut sortir via drawer-sidebar a tout moment.

### B5 — Carte parcours CEO : **HYBRIDE**
- **(a) Bloc Cockpit synthetique non-interactif** — version reduite motivante visible quotidiennement
- **(b) Page dediee `trajectoire.html` interactive** — exploration complete (drawer section Capital)
- **CTA "Voir ma trajectoire complete"** depuis le bloc Cockpit vers la page

**Que montre la carte (option 4)** : mix decisions strategiques + Big Rocks + projets clos. Exclure les actions du quotidien (sinon trop de bruit).

## 0.5 — KPIs parametrables

### Q1 — Panneau "Mes baselines & cibles" Reglages → Coaching : **OUI**

### Q2 — 5 KPIs retenus
1. **Streak** — jours consecutifs avec bilan soir fait
2. **Decisions tranchees par semaine** — compteur 7j glissants
3. **Big Rocks atteints / poses** — ratio `done / total` du trimestre
4. **Serenite auto-evaluee** — moyenne mood 1-5 derniers 7j
5. **Temps avant 1ere action utile** — event time-to-interactive Cockpit

### Q3 — Cibles par defaut + parametrables
| KPI | Valeur initiale | Parametrable ? |
|---|---|---|
| Streak | 18 jours / 30 (60 %) | OUI |
| Decisions tranchees | 5 / semaine | OUI |
| Big Rocks | 2 / 3 (67 %) | OUI |
| Serenite | 3.8 / 5 | OUI |
| Temps 1ere action | ≤ 10 sec | OUI |

**Toutes parametrables** dans Reglages → Coaching → "Mes baselines & cibles".

---

## Synthese pour le memo Phase 1

**Identite tranchee** (a developper en Phase 1) : aiCEO = visuel premium serenite + cards interactives discretes + journey rituel matin/soir + gamification luxe par formes geometriques pures (jamais XP/mascotte) + carte trajectoire hybride.

**Style design** : warm neutrals (Editorial Executive existant) + Aubrielle script signatures + Fira Sans corps + accent violet `--primary-500`. Tons : pas trop sombre par defaut, pas de transparence/blur sur bg, pas de couleurs saturees.

**Voix** : francophone CSP+ premium, langage standard CEO + 4 neologismes acceptes (cap, Big Rock, pin, signal faible). Pas de jargon medicalise, pas de baby-talk.

**Public test Phase 2** : Major en mode cobaye (3-7 jours d usage reel) en se projetant CEO francophone moyen.

---

**Reactivation prevue** : ces choix sont les inputs du **prompt Phase 1 V2 final consolide** (cf. `PROMPT-PHASE1-FINAL.md` dans ce dossier). A relancer S6.16.
