# Prompt unique à coller dans Claude Design

> Date : 26/04/2026
> À uploader avec : 5 fichiers du dossier `ressources-a-joindre/`
> Cible : projet Claude Design `aiCEO_mvp_v1`

## Pièces jointes à uploader simultanément

1. `00-REFERENCE-VISUELLE-twisty.png` — image étalon visuel
2. `01-tokens.json` — Design System canonique aiCEO
3. `02-colors_and_type.css` — variables CSS générées
4. `03-spec-extraits.md` — extrait pertinent SPEC fonctionnelle
5. `04-pages-detail.md` — fiche détaillée des 13 pages
6. `05-persona.md` — persona Feycoil + sociétés réelles

---

## Le prompt (à copier intégralement)

```
# Brief design — aiCEO v0.5 (cockpit CEO unifie, 13 pages, hi-fi clickable)

Tu es un designer produit senior. Mission : concevoir la maquette complete
hi-fi du cockpit CEO aiCEO v0.5, 13 pages HTML clickables, prets pour
integration dev.

## 1. CONTEXTE PRODUIT

aiCEO est un copilote executif personnel qui tourne en local sur le poste
Windows d'un dirigeant pluriel (Feycoil, 40 ans, pilote ETIC Services +
Adabu + Start + AMANI). C'est un outil quotidien, ouvert toute la journee,
pas un dashboard mensuel.

Trois rituels et des registres :
- Matin : arbitrage 30 taches en 5 min (top 3 du jour)
- Soir : bilan humeur+energie, top 3 demain, streak
- Hebdo (dimanche) : revue Big Rocks, cap S+1
- Journee : navigation libre dans taches, agenda, registres, assistant chat

Voir piece jointe `05-persona.md` pour le persona detaille (donnees
quotidiennes typiques, vocabulaire, sociétés).

Voir `03-spec-extraits.md` pour les criteres d'acceptation et endpoints API.

## 2. REFERENCE VISUELLE GOLD STANDARD

Image jointe : `00-REFERENCE-VISUELLE-twisty.png` (dashboard freelance Twisty
Income Tracker).

Cette image est l'etalon de qualite a reproduire. Patterns OBLIGATOIRES a
transposer dans aiCEO :

- **Radius conteneur principal 32px**, cartes secondaires 24px, chips pill
  (rounded-full)
- **Densite tenue + aere** : padding interne carte 32px, gouttiere 24px
- **Stat hero** : grands chiffres 64px en weight black/sol-thin, accompagnes
  d'une caption 2 lignes
- **Value pill** : callout pill brand navy filled qui floate au-dessus d'un
  point de chart
- **Day pills** S M T W T F S : ronds avec un actif filled brand
- **List-card avec rows** : icone carree arrondie + label + chip statut +
  chevron toggle ; sub-row optionnelle avec tags + description + meta
- **Avatar circulaire** photo realiste + chip overlay ('Senior', 'Middle')
- **Tabs underline** : ligne fine sous le link actif uniquement
- **Top right cluster** : search bar + 2-3 icones bouton ronds + avatar

ANTI-patterns visuels (interdits) :
- Pas d'ombre 3D, pas de gradient candy, pas de glow, pas de skeumorphisme
- Pas de couleurs criardes (Trello/Asana style)
- Pas d'icones decoratives gratuites
- Pas de hamburger menu (desktop only 1280-1920px)

## 3. SYSTEME DE DESIGN — TOKENS A RESPECTER

Source canonique : `01-tokens.json` + `02-colors_and_type.css` (joints).

Couleurs (utilisation OBLIGATOIRE de var(--token), zero hex en dur) :

```css
/* Neutres */
--bg: #a9adbe;            /* fond global lavande */
--surface: #f5f3ef;       /* surface principale cream */
--surface-2: #ffffff;     /* cartes blanches */
--surface-3: #eeebe4;     /* zones secondaires */
--border: #e4e1d9;
--text: #111418;          /* titre */
--text-2: #5b5e68;        /* corps */
--text-3: #9a9da8;        /* legende */

/* Brand */
--brand: #111418;         /* CTA primaires, drawer, value pills */
--brand-50: #eeebe4;

/* Accents semantiques (jamais decoratifs) */
--rose: #d96d3e;          /* alerte, urgence */
--amber: #b88237;         /* attention, deadlines proches */
--emerald: #3d7363;       /* succes, etat stable */
--sky: #7790ae;           /* info, nav */
--violet: #7a6a8a;        /* IA, suggestions, recommandations */

/* Couleurs societes (chips) */
ETIC -> --sky
Adabu -> --amber
Start -> --emerald
AMANI -> --violet
```

Typographie :
- Famille principale : "Fira Sans" (10 graisses 100->900)
- Famille script : "Aubrielle" (display ≥36px : salutations type "Bonjour Feycoil,")
- Famille thin display : "Sol" (chiffres ultra-light ≥28px : streaks, KPIs)
- Mono : ui-monospace (code, IDs)

Echelle :
- script-hero 64px / script 44px / display 32px
- h1 22px / h2 18px / h3 15px
- lead 14px / body 14px / sm 13px / xs 12px

Numerique tabulaire ("tnum", "lnum") OBLIGATOIRE pour tous chiffres en colonne.

## 4. STACK CSS HYBRIDE

Ratio 60/40 :
- **60 % Variables DS** : couleurs, typo, radius via var(--token)
- **40 % Tailwind utilities** (CDN) : layout (grid, flex), spacing, states
  (hover, focus), responsive

Ne PAS utiliser de couleur Tailwind (`bg-blue-500`...) ni de typo Tailwind
(`text-blue-600`). Toujours `bg-[var(--surface-2)]` ou via classe custom.

Exemple type :
```html
<div class="rounded-[32px] p-8 grid grid-cols-3 gap-6"
     style="background: var(--surface-2); border: 1px solid var(--border);">
  <h2 class="text-[22px] font-semibold" style="color: var(--text);">
    Big Rocks semaine
  </h2>
</div>
```

## 5. PERIMETRE — 13 PAGES + 1 INDEX NAVIGATION

Voir `04-pages-detail.md` joint pour la fiche complete de chaque page (role,
contenu, API consommees, etat critique).

Structure de livraison attendue :

```
/design-v05/
  index-nav.html              page navigation entre les 13 maquettes
  index.html                  cockpit unifie (T1)
  arbitrage.html              arbitrage matinal (T1)
  evening.html                boucle du soir (T1)
  taches.html                 inbox + Eisenhower (T2)
  agenda.html                 vue hebdo (T2)
  revues.html                 revue hebdo (T2)
  assistant.html              chat copilote (T2)
  groupes.html                portefeuille societes (T3)
  projets.html                liste projets (T3)
  projet.html                 page projet template (T3)
  contacts.html               registre equipe (T3)
  decisions.html              registre decisions (T3)
  _shared/
    drawer.html               drawer collapsible 60px<->240px (extrait reutilise)
    header.html               header avec search + actions + avatar
    footer.html               footer discret version + last-sync
    base.css                  imports vars + reset
```

## 6. DRAWER COLLAPSIBLE (composant pivot)

Le drawer est l'element navigationnel principal, present sur les 13 pages.

Specs :
- **Mode etendu (240px)** : fond brand navy #111418, texte cream surface #f5f3ef,
  icone + label par item, item actif fond brand-50 sur 4px gauche
- **Mode collapse (60px)** : fond brand, icones uniquement, tooltip on hover
- Toggle : bouton chevron en bas du drawer
- 12 items dans l'ordre :
  1. Cockpit (icone home)
  2. Arbitrage matinal (icone sun)
  3. Boucle du soir (icone moon)
  4. Taches (icone check-square)
  5. Agenda (icone calendar)
  6. Revues hebdo (icone refresh-cw)
  7. Assistant chat (icone message-circle)
  ---
  8. Sociétés (icone briefcase)
  9. Projets (icone folder)
  10. Contacts (icone users)
  11. Décisions (icone git-branch)
  ---
  12. Réglages (icone settings, en bas)
- Logo aiCEO en haut du drawer (mini en mode collapse)
- Avatar Feycoil en bas (au-dessus de Réglages)

## 7. ETATS A CONCEVOIR (1 critique par page)

Pour chaque page, fournir :
- **L'etat default** (vue principale avec donnees realistes)
- **L'etat critique** liste ci-dessous, dans une variante separee de la page
  (toggle d'etats en haut sous forme de tabs : "Default | [nom etat]")

| # | Page | Etat critique |
|---|---|---|
| 1 | index.html | outlook-stale-warning (banner amber pleine largeur si lastSync > 4h) |
| 2 | arbitrage.html | loading-claude-recommendation (skeleton bullets pendant 2-3s) |
| 3 | evening.html | streak-celebration (anneau anime + confetti discret a 7/30/100j) |
| 4 | taches.html | empty-state ("Aucune tache en attente. Profite." + illu line-art) |
| 5 | agenda.html | error-outlook-unreachable (banner amber + lien "Reessayer") |
| 6 | revues.html | draft-streaming (bilan se remplit chunk par chunk) |
| 7 | assistant.html | streaming-response (bulle en cours, curseur clignote, btn arret) |
| 8 | groupes.html | (default uniquement) |
| 9 | projets.html | (default uniquement) |
| 10 | projet.html | (default uniquement) |
| 11 | contacts.html | empty-search-results ("Aucun contact pour 'xyz'") |
| 12 | decisions.html | claude-recommendation-loading (bulle violet skeleton 2-3s) |

Total = 13 default + 9 etats critiques = 22 vues.

## 8. DONNEES REALISTES A UTILISER

Ne pas inventer de Lorem. Utiliser ces donnees dans toutes les maquettes :

Sociétés : ETIC Services (sky), Adabu (amber), Start (emerald), AMANI (violet).

Projets exemples :
- "Refonte SI Direction Régionale" (ETIC, En cours, 65%)
- "Travaux SPA Bénédicte" (Adabu, En cours, 40%)
- "Cohorte printemps 2026" (Start, En cours, 80%)
- "Levée fonds Q3" (AMANI, A démarrer, 10%)
- "Renouvellement contrat CA Bretagne" (ETIC, En revue, 90%)
- "Devis climatisation SPA" (Adabu, En cours, 55%)
- "Onboarding 3 nouveaux consultants" (ETIC, En cours, 30%)

Contacts equipe :
- Sikina M. (Assistante de direction, ETIC)
- Marc D. (Directeur opérations, ETIC)
- Bénédicte F. (Gérante, Adabu)
- Yann R. (Coordinateur programme, Start)
- Aïda K. (Chargée de mission, AMANI)

Tâches exemples (pour arbitrage) :
- "Contrat Bénédicte FF&E - signature finale" (Adabu, P0, due aujourd'hui)
- "Virement Affejee - 3e relance" (ETIC, P0, due aujourd'hui, ai_capable=1)
- "Confirmer décalage tirage CA Bretagne par écrit" (ETIC, P1, due demain)
- "Relance devis climatisation SPA" (Adabu, P1, ai_capable=1)
- "Commande switch 48 ports Vitry" (ETIC, P2, ai_capable=1)
- "Préparer AG SCI MB" (Adabu, P2, due dans 7j)
- "Classer dossier FEDER" (ETIC, P3, ai_capable=1)
- "Appel notaire statuts SCI MB" (Adabu, P2)

Décisions ouvertes :
- "Prolonger contrat consultant senior X ?" (ETIC, deadline 30/04)
- "Investissement SPA travaux complémentaires 15kEUR ?" (Adabu, deadline 05/05)
- "Levée Q3 - participer roadshow Singapour ?" (AMANI, deadline 10/05)

Salutation : "Bonjour Feycoil," (en script Aubrielle 44px)

Streak du soir : 12 jours consécutifs (afficher en grand 64px Sol thin)

## 9. TON ET PERSONNALITE

- Direct, factuel, sans flatterie. Jamais de "Bravo !", "Génial !".
- Erreurs : "Outlook n'a pas répondu en 30 s" (pas "Oups !").
- Empty : "Aucune tâche en attente. Profite." (pas "Wow tout est fait !").
- Confirmations : toast subtil top-right 2s, jamais de modal "Êtes-vous sûr ?".
- Numérique : tabulaire partout, jamais "0 tâches" - écrire "0 tâche".
- Vocabulaire propre :
  - "cockpit" pas "tableau de bord"
  - "arbitrage matinal" pas "morning planning"
  - "boucle du soir" pas "evening routine"
  - "Big Rocks" pas "objectifs"
  - "alerte" pas "notification"
  - "société" pas "entreprise" ni "client"

## 10. ANNOTATIONS DEV (en commentaire HTML, en haut de chaque page)

```html
<!--
  Page : taches.html
  Routes API consommees :
    - GET /api/tasks?...
    - POST /api/tasks
    - PATCH /api/tasks/:id
    - DELETE /api/tasks/:id
  Composants reutilisables (a extraire) :
    - PageHeader : title + cta
    - TaskCard : task + onChange
    - FilterBar : filters + values + onChange
  Breakpoints : desktop only (1280-1920)
  Etats geres dans cette maquette : default, empty
  Micro-interactions :
    - hover task card -> elevation +1px, btn quick actions reveal
    - drag task -> ghost suit le curseur, drop zones surlignees emerald-50
    - confirm delete -> modal compact, bouton danger rose
    - keyboard : n -> nouvelle tache, / -> focus search
  DS evolutions : aucune (respect strict tokens)
-->
```

## 11. STRATEGIE DE LIVRAISON PROGRESSIVE (Tier interne)

Si tu sens que la fenetre de generation va plafonner sur les 22 vues, livre
PAR TIER en demandant a continuer entre chaque :

1. **Tier 1 (cockpit + rituels)** : index, arbitrage, evening + leurs etats
   critiques + les composants `_shared/`. Total ~7 vues.
   Apres livraison, attendre confirmation utilisateur "continue tier 2".

2. **Tier 2 (travail courant)** : taches, agenda, revues, assistant + etats
   critiques. Total ~8 vues.
   Attendre confirmation "continue tier 3".

3. **Tier 3 (registres)** : groupes, projets, projet, contacts, decisions +
   etats critiques. Total ~7 vues.

Avantage : qualite uniforme sur les 22 vues, pas de degradation en fin de
generation.

Si la fenetre tient les 22 vues d'un seul coup : livre tout d'une traite.

## 12. CRITERES DE REUSSITE (a auto-evaluer en fin de generation)

Une maquette est "validee" si :

1. ✅ Le CEO peut scanner `index.html` et savoir quoi faire en 5 secondes
2. ✅ L'arbitrage matinal tient en 5 min sur 30 taches sans clic perdu
3. ✅ Densite > claude.ai mais < Linear inbox
4. ✅ Aucune couleur ne crie. Lecture 8h sans fatigue.
5. ✅ Un dev solo peut implementer chaque page en 4-6h max sans inventer
   de composant
6. ✅ Le drawer collapsible fonctionne (toggle JS minimaliste)
7. ✅ Les 22 vues utilisent EXCLUSIVEMENT les tokens DS (zero hex en dur)
8. ✅ Convergence visuelle avec la reference Twisty fournie en piece jointe
9. ✅ Toutes les annotations dev en commentaire HTML sont presentes
10. ✅ index-nav.html permet de cliquer entre les 13 maquettes et basculer
    entre default/etat critique pour chacune

## 13. AVANT DE COMMENCER

Si tu detectes une question structurelle (layout commun, navigation globale,
choix de pattern qui impacte plusieurs pages), POSE LA AVANT de produire en
serie. Exemples de questions legitimes :
- "L'icone du logo aiCEO doit-elle etre fournie ou je peux placeholder ?"
- "Le footer commun doit-il afficher le compteur cout API du jour ?"
- "Le drawer collapse memorise-t-il son etat dans aiCEO.uiPrefs ?"

Sinon, commence par le `_shared/drawer.html` puis Tier 1 dans l'ordre :
index, arbitrage, evening.

GO.
```

---

## Notes méthodo

### Pourquoi ce prompt fait ce qu'il fait

- **Section 2 (référence Twisty)** : on impose le niveau de qualité par l'image plutôt que par 50 mots de description. Beaucoup plus efficace.
- **Section 3 (tokens)** : on injecte les variables directement dans le prompt + on joint le JSON. Double redondance pour que Claude ne fouille pas.
- **Section 4 (stack hybride)** : ratio 60/40 vars/Tailwind est ce qui s'intègre le plus proprement dans `03_mvp/public/` ensuite. Sans cette précision, Claude part en Tailwind pur.
- **Section 6 (drawer)** : c'est le seul composant qui touche les 13 pages, on le spec en détail pour qu'il soit cohérent partout.
- **Section 8 (données réalistes)** : on injecte les vraies sociétés + tâches + décisions pour qu'aucune page n'utilise du Lorem.
- **Section 11 (Tier interne)** : permet à Claude de gérer la charge de génération sans qu'on perde en qualité sur les dernières pages.
- **Section 13 (questions avant)** : ouvre la porte à une clarification au lieu d'une production aveugle.

### Avant de poster sur Claude Design

1. **Sauvegarder l'image Twisty** dans `ressources-a-joindre/` sous le nom `00-REFERENCE-VISUELLE-twisty.png` (cf. `00-REFERENCE-VISUELLE-instructions.md`)
2. **Uploader 6 fichiers** dans la conversation Claude Design avant le prompt :
   - `00-REFERENCE-VISUELLE-twisty.png`
   - `01-tokens.json`
   - `02-colors_and_type.css`
   - `03-spec-extraits.md`
   - `04-pages-detail.md`
   - `05-persona.md`
3. **Coller le prompt** (entre les triples backticks ci-dessus)
4. **Si Claude Design pose une question structurelle** : y répondre puis le laisser dérouler
5. **Si Claude Design propose Tier 1 d'abord** : valider la qualité du Tier 1 avant de demander Tier 2

### Si la maquette ne te plaît pas après Tier 1

Trois leviers d'ajustement avant de relancer Tier 2 :
- **Couleur** : "Force davantage le contraste navy/cream" ou "Désature encore les accents"
- **Densité** : "Plus aéré sur le cockpit" ou "Plus dense sur taches.html"
- **Patterns Twisty** : "Reprends explicitement le pattern X de la référence sur la page Y"

Itère sur Tier 1 jusqu'à validation, ensuite seulement enchaîne Tier 2 + 3.
