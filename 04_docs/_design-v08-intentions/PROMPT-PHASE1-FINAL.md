# PROMPT — aiCEO UX Phase 1 FINAL CONSOLIDE (a soumettre tel quel a l agent)

> Version finale post-Etape 0 (29/04/2026 PM tardif). Tous les inputs CEO sont remplis. A copier-coller dans le chat pour lancer Phase 1.

---

```markdown
# PROMPT — aiCEO UX Phase 1 V2 : Cadrage conversationnel (1 h binome, zero code metier sauf moodboard SVG)

## Contexte (auto-suffisant)
aiCEO v0.7+ livree (18/18 pages v07, framework Atomic Templates, direction Editorial Executive).
Cible utilisateur principale : Major Fey, CEO ETIC Services. Modele binome (CEO + agent Claude).
Sprint UX insere en parallele de S6.13 LLM. Objectif Phase 1 : trancher 5 arbitrages
fondamentaux et produire un Memorandum-cadrage 1 page recto + moodboard SVG simple
avant tout travail de code metier. Phase 2 (separee) refondra UNE page-pilote (Cockpit).
Phase 2bis ou S6.18 : carte parcours CEO. Vision boite de design Pentagram/IDEO
inscrite en backlog V1.x avec etoffement ADD-AI.

## Inputs CEO (validés en Etape 0, cf. `CHOIX-CEO-ETAPE-0.md`)

### 1. Selection visuelle (cf. WORKING-NOTES.md section C)
- 5 apps admirees : Amie · Linear · Craft.io (rebrand 2024) · Superhuman · Apple Fitness anneaux
- 5 apps detestees : Salesforce · Odoo · Microsoft Outlook (nouvelle version) · Duolingo · Bloomberg Terminal

### 2. Selection scenarios quotidiens (Niveau A — 7 essentiels Phase 1+2)
1, 2, 4, 7, 11, 13, 18 — cf. `CHOIX-CEO-ETAPE-0.md` § 0.3 pour le detail.

### 3. Arbitrages tranches (5 tensions)
- **B1 — Curseur luxe x gamification : 4 / 10** (gam visible mais sobre : streak + anneau completion + 1 indicateur progression. JAMAIS XP/mascotte/confettis/ligues.)
- **B2 — Profil utilisateur : a → b sequence** (Major reel maintenant, CEO francophone CSP+ premium au moment SaaS V1)
- **B3 — Semantique metier : A** (pas de reinvention sauf vraie innovation produit, glossaire precis exige)
- **B4 — Navigation guidee x liberte : A** (journey + liberte derriere drawer)
- **B5 — Carte parcours CEO : HYBRIDE** (bloc Cockpit synthetique non-interactif + page dediee `trajectoire.html` interactive avec CTA "Voir ma trajectoire complete"). **Affiche : mix decisions strategiques + Big Rocks + projets clos** (exclure actions du quotidien)

### 4. Criteres mesurables parametrables
- **Panneau "Mes baselines & cibles" dans Reglages → Coaching** : OUI
- **5 KPIs retenus** : Streak (cible 18j/30) · Decisions/semaine (cible 5) · Big Rocks ratio (cible 2/3) · Serenite mood 7j (cible 3.8/5) · Time-to-1ere-action (cible ≤ 10s)
- **Toutes les cibles parametrables** par le CEO

## Mission Phase 1 (livrables)

### Livrable principal : Memorandum-cadrage
Produis `04_docs/_design/MEMO-UX-V08-PHASE1.md`, **1 page recto (≤ 600 mots)**, contenant :
1. **Phrase magnetique 7 mots** — la promesse vendable d aiCEO type Linear ("The issue tracker you ll enjoy using"). Pas une definition, une promesse.
2. **Identite tranchee** (3 lignes max) — ce qu aiCEO est et ce qu il N est PAS.
3. **5-7 principes directeurs nominaux** — courts, memorables, traçables dans le code.
4. **Tensions tranchees** (5 tensions B1-B5, decision binaire ou nuancee + justification 1 phrase chacune, en s appuyant sur les inputs § 3).
5. **Glossaire metier canonique** — 11 termes (espace, maison, projet, groupe, cap strategique, Big Rock, arbitrage, decision, action, rituel, pin, signal faible) avec definition 1-2 phrases + relations hierarchiques. Si glossaire >150 mots, le sortir dans annexe `GLOSSAIRE-AICEO.md`.
6. **Visualisations conceptuelles par page** :
   - **Vue macro** (1 visualisation marquante par page d entree : Hub, Trajectoire)
   - **Vue micro** (1 visualisation par page detaillee : Cockpit, Projet, Equipe, Agenda, Revues, Decisions)
   - Specifier laquelle pour les 6 pages les plus exposees.
7. **Chronotype visuel** — pour chaque tranche horaire (matin / journee / soir / nuit), preciser :
   - Palette dominante (warm / neutral / cool)
   - Densite contenu (epure / standard / dense)
   - Tonalite langage (energique / pragmatique / contemplatif)
8. **5 KPIs parametrables** (panneau Reglages → Coaching) avec leurs cibles par defaut.
9. **Punch-list Phase 2** (5-8 actions ordonnees pour la refonte Cockpit, estimation horaire binome).
10. **Scope-out explicite** (mode sombre, illustrations sur mesure, audit WCAG complet, refonte 18 pages d un coup, gamification Duolingo-like).

### Livrable bonus : Moodboard SVG simple
Produis aussi `04_docs/_design/MOODBOARD-V08-PHASE1.svg`, **1 fichier SVG ≤ 30 KB** contenant :
- Palette decidee (5-7 swatchs nommes)
- Typo principale + secondaire (specimens "Aa Bb Cc 123")
- 3 cartes types stylisees (KPI tile, decision card, journey banner)
- Permet validation visuelle CEO en 30 sec avant Phase 2

## Contraintes
- Coherence v07 obligatoire (framework Atomic + Editorial Executive base)
- Mount Windows piege #2 (atomic write Python si fichier > 50 lignes)
- Tests v07-atomic.test.js 10/10 verts
- Pas de dependance externe lourde (SVG natif, CSS, au pire Chart.js)
- Cohabitation v06 ↔ v07 jusqu a S6.15
- Anti-patterns a eviter explicitement : dashboard admin charge (Salesforce/Odoo/Outlook), transparence/blur sur bg (Outlook nouvelle version), kitsch colore (Duolingo), brut/austere (JIRA), sombre+charge (Bloomberg)

## Validation
Memo + moodboard relus par CEO en 5 min. Si OK -> lance Phase 2 (refonte Cockpit). Si desaccord -> 1 boucle d ajustement.
```

---

**Comment l utiliser** : copie-colle l integralite du bloc markdown ci-dessus dans le chat avec moi. Je produirai alors les 2 livrables (Memorandum 1 page + Moodboard SVG).
