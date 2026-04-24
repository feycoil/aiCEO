# Prompt de reproduction — aiCEO Agent v3

Ce document contient le prompt unique à fournir à un LLM (Claude, GPT, etc.) pour régénérer intégralement l'application **aiCEO — Cockpit** avec ses fonctionnalités, ses pages, son design system et ses données seed.

Le prompt est en français, volontairement détaillé (specs non négociables) pour éviter la dérive créative du modèle.

---

## Prompt à copier/coller

> **Rôle** — Tu es un ingénieur front-end senior + designer produit. Tu dois livrer une application web statique complète, prête à ouvrir dans un navigateur sans build ni serveur, qui reproduit fidèlement **aiCEO — Cockpit**, un tableau de bord exécutif monoutilisateur pour un CEO pilotant 3 groupes (Adabu Holding, Groupe AMANI, Terres Rouges).
>
> **Livrable** — Une arborescence de fichiers HTML + 3 fichiers partagés dans `assets/`. Pas de framework, pas de bundler, pas de Node. Juste HTML5 + CSS3 + JavaScript vanilla (ES6+) + `localStorage`. Le tout doit fonctionner en double-clic sur `index.html`.
>
> **Langue** — Toute l'UI est en **français**. Ton rédactionnel : posé, bienveillant, jamais culpabilisant, jamais "hustle". Le copilote parle comme un coach serein, pas comme un productivity bro.
>
> ---
>
> ## 1. Arborescence à produire
>
> ```
> /index.html              ← Cockpit (page d'accueil)
> /taches.html             ← Liste / Matrice Eisenhower / Timeline par énergie
> /agenda.html             ← Grille semaine + vue Liste + Historique
> /decisions.html          ← Décisions à exécuter / exécutées
> /groupes.html            ← Portefeuille 3 groupes
> /projets.html            ← Cartes de projets regroupées par groupe
> /contacts.html           ← Annuaire filtrable
> /assistant.html          ← Copilote IA (propositions)
> /revues/index.html       ← Revues hebdo (Big Rocks + intention)
> /projets/<slug>.html     ← Pages projet dédiées (1 par projet)
> /assets/app.css          ← Design system complet
> /assets/app.js           ← Shell unifié + CRUD + helpers
> /assets/data.js          ← Toutes les données seed (IIFE)
> /assets/project-page.js  ← Renderer spécifique des pages projet
> ```
>
> Chaque HTML charge `assets/app.css` puis `assets/data.js` puis `assets/app.js`, puis un bloc `<script>` inline qui appelle `AICEO.mount({ page, title, breadcrumb, content, onMounted })`.
>
> ---
>
> ## 2. Design system ("DA Twisty")
>
> ### Tokens CSS (racine `:root`)
> - **Base** — `--bg:#a9adbe` (lilas froid, hors-app), `--surface:#f5f3ef` (cream, fond d'app), `--surface-2:#ffffff`, `--surface-3:#eeebe4`.
> - **Bordures** — `--border:rgba(17,20,24,.08)`, `--border-strong:rgba(17,20,24,.16)`.
> - **Texte** — `--text:#111418`, `--text-2:#4b5564`, `--text-3:#737c89`, `--muted:#a1a8b3`.
> - **Accents** (5 familles, chacune avec variantes `-bg` et `-800`) :
>   - rose/coral — `#d96d3e` / `#fdecdf` / `#8a3b1b` (**accent produit principal**)
>   - emerald/sage — `#3d7363` / `#e2ece8` / `#234236`
>   - sky — `#7790ae` / `#e9eef4` / `#3b506a`
>   - amber — `#b88237` / `#f5e8d6` / `#6d4816`
>   - violet — `#7a6a8a` / `#ece7f0` / `#463a54`
> - **Couleurs groupe** (codes à respecter strictement) :
>   - `--group-adabu:#3d4e7d` (bleu nuit)
>   - `--group-amani:#d96d3e` (terracotta)
>   - `--group-terres:#b88237` (ocre doré)
> - **Radii** — xl 28px, lg 24px, default 18px, sm 12px.
> - **Shadows** — `--shadow-app: 0 20px 60px rgba(17,20,24,.18), 0 8px 24px rgba(17,20,24,.08)` ; `--shadow-card: 0 1px 2px rgba(17,20,24,.04), 0 2px 6px rgba(17,20,24,.04)`.
> - **Typo** — Inter (import `https://rsms.me/inter/inter.css`), features `'cv11','ss01'`. Titres `letter-spacing:-0.02em`, weight 700-800. `.tnum{ font-variant-numeric: tabular-nums }`.
>
> ### Shell
> - Body avec `padding:20px` (l'app "flotte" sur fond lilas). L'`.app` est une grille `248px 1fr`, `border-radius:28px`, `box-shadow:var(--shadow-app)`, `overflow:hidden`.
> - **Sidebar** sticky (hauteur `calc(100vh - 40px)`), fond `--surface`. En haut : un *stamp* carré coral 36px avec un logo SVG (deux arcs inversés), la marque "aiCEO" en 800 uppercase et un sous-titre "Terres Rouges" en 10px tracking .1em.
> - Items de nav regroupés en 3 sections : **Pilotage** (Cockpit, Tâches, Agenda, Décisions, Revues hebdo), **Portefeuille** (Portefeuille, Projets, Contacts), **Intelligence** (Copilote IA). Titres de section en 10px uppercase tracking .1em, text-3.
> - Item actif : fond `var(--text)` (noir), texte blanc, shadow `0 6px 18px -6px rgba(17,20,24,.4)`. Au survol : fond `--surface-3`.
> - Badge `.count` à droite des items (pastille arrondie) pour le nombre de tâches en retard / propositions IA en attente.
> - **Group switcher** collé en bas du sidebar : titre "Scope", puis un chip "Tous les groupes" + un chip par groupe (petit point coloré 8px + nom). Le chip actif prend fond blanc + border + ombre.
>
> ### Topbar (76px sticky, fond `--surface`)
> Hamburger mobile (caché >=900px) -> breadcrumbs (`a / a / current-bold`) -> à droite : une *search-pill* blanche de 320px (icône loupe à gauche, placeholder "Rechercher un projet, une tâche…", `kbd` "⌘K" à droite) cliquable pour ouvrir la palette, puis deux `icon-btn` ronds (bell, settings), puis un avatar rond coral 36px avec initiales "FM".
>
> ### Composants clés à implémenter
> 1. **Intention Hero** — carte blanche large, eyebrow uppercase, h1 32px tracking tendu, sous-titre, à droite un "streak-badge" (flamme + "Streak N jours") et une ligne de `.badge-chip` débloqués.
> 2. **Week gauge** — "Semaine en cours", compteur `X / Y soldées`, `%`, barre 10px de haut remplie en emerald, ligne de jours (Lun-Dim, points gris qui deviennent noirs pour les jours passés).
> 3. **Coach strip** — fine barre coral-bg avec un disque noir "AI" à gauche et un message bienveillant contextuel.
> 4. **Rock-card** — carte blanche bordurée pour chaque Big Rock, "Big Rock #N", titre de la rock, mini-bar de progression, %.
> 5. **Cockpit-grid** — 4 cartes : Focus (3 tâches max), Criticité (nuage de pastilles colorées — `critical/high/medium/low`), Semaine (7 colonnes avec barre de charge par jour en ticks verticaux), Décisions en attente.
> 6. **Task row** — checkbox ronde à gauche, titre + chips (`⏱ estimé`, énergie `🔥 deep / ◐ moyen / ◦ léger`, échéance `📅 date`, `✨ IA`, pill projet coloré par groupe, *source-pill* backlink), étoile à droite + menu actions (✎ / 🗑).
> 7. **AI card** — fond `--surface-2`, bordure, eyebrow `kind · urgency`, titre, résumé, ligne `rationale`, zone `preview` repliable (fond pâle coral-bg, aperçu mail tronqué), 3 boutons `.ai-btn` : Accepter (noir), Copier, Ignorer (rouge).
> 8. **Source-pill** — petit bouton arrondi `icône · label · ↗` pour montrer l'origine (mail, event, dossier, décision).
> 9. **Drawer** — panneau latéral droit 420px (`position:fixed; right:0; top:0; height:100vh`) avec backdrop, qui s'ouvre via `AICEO.openDrawer({eyebrow,title,source,meta,related,actions})` : section "Source d'origine" (carte type mail), section "Informations" (label / valeur), section "Éléments liés", boutons d'action.
> 10. **Quick-Add modal** — centré, overlay noir 50%, formulaire 10 champs (titre, projet select, échéance date, toggle Type Eisenhower `Faire/Planifier/Déléguer/Abandonner`, toggle Priorité `Critique/Haute/Moyenne/Basse`, estimé min, toggle Énergie `Léger/Moyen/Deep`, context select, checkbox "IA peut aider").
> 11. **Palette ⌘K** — overlay centré, input large, résultats groupés par catégorie (Pages, Projets, Tâches, Contacts, Décisions), navigation clavier flèches/Enter, highlight `selected`.
> 12. **FAB** — bouton rond coral 56px flottant bas-droite, symbole `+`, ouvre Quick-Add.
> 13. **Toast** — bottom-center, fond noir, apparition/disparition douce, variants `success` (gauche verte), `warn` (gauche ambre).
> 14. **Celebrate toast** — apparait après chaque tâche soldée avec une coche + message coach.
>
> ### A11y
> `skip-link`, `aria-label`/`aria-current`, focus ring, `prefers-reduced-motion` (désactive pulse), `@media (forced-colors: active)`, tous les boutons custom ont `role="button" tabindex="0"` avec gestion Enter/Space.
>
> ---
>
> ## 3. Données seed (dans `assets/data.js`, un IIFE qui peuple `window.AICEO`)
>
> ### 3 Groupes
> - `adabu` — "Adabu Holding", "IT · Data · Telecom"
> - `amani` — "Groupe AMANI", "Hôtellerie · F&B · Spa"
> - `terres-rouges` — "Terres Rouges", "Family Office · Invest"
>
> ### 9 Projets (avec `{ id, group, name, tagline, status, color, icon, companies, kpi, progress }`)
> Adabu : `feirasin`, `etic-depots`, `datacenter-mb`.
> AMANI : `amani` (chaud, 71%).
> Terres Rouges : `honoraires`, `sci-start`, `ith-lloyds`, `sci-mb`, `feder`.
>
> ### 26 Tâches
> Schéma : `{ id, title, project, type:"do|plan|delegate|drop", priority:"critical|high|medium|low", due, starred, done, estimatedMin, energy:"light|medium|deep", aiCapable, aiProposal?, context:"deep-work|email|meeting|phone" }`.
> Répartition : 21 ouvertes, 5 soldées. Les 6 tâches AMANI doivent dominer en poids/priorité. 4 tâches sont `critical` avec échéance `2026-04-23`. Mix équilibré des 4 types Eisenhower, des 3 énergies, et de `aiCapable:true` (environ 60%).
>
> Exemples obligatoires (mots-clés) : "Valider contrat Bénédicte (FF&E) + annexe BREEAM", "Exécuter virement honoraires Affejee (3e relance)", "Confirmer décalage tirage CA Bretagne 30/04 par écrit", "Brief RV matériaux Mayotte (lundi 27/04)", "Valider roadmap T2 FEIRASIN", "Valider convention SCI Start / Adabu", "Cadrer POC edge MB".
>
> ### 10 Décisions
> Schéma : `{ id, title, date, project, parties[], outcome, rationale, status:"to-execute|executed", owner, deadline, tags[] }`. 5 `to-execute` avec deadline <= 30/04, 5 `executed` antérieures.
>
> ### 29 Événements (EVENTS)
> Schéma : `{ id, title, date:"YYYY-MM-DDTHH:MM", duration_min, category:"etic|amani|personal", project, location, attendees[], prep_needed }`. 8 passés, 21 à venir, étalés du 23/04 au 12/05/2026. Mix ExCom, chantier, calls avocat/banque, mission Mayotte (600 min), dîners partenaires, AG.
>
> ### 22 Contacts
> Schéma : `{ id, name, org, role, email, phone, tags[], projects[] }`. Couverture 100% email et téléphone.
>
> ### 9 Propositions IA (AI_PROPOSALS)
> Schéma : `{ id, kind:"email-draft|meeting-prep|task-from-event|workload-rebalance|automation|summary", title, source, urgency:"now|today|this-week", estimatedGain, status:"pending", summary, rationale, preview }`. Le `preview` doit contenir un brouillon de mail réaliste ou un ODJ structuré pour être copiable.
>
> ### 4 Revues hebdo (REVIEWS)
> `W15` archivée 85%, `W16` archivée 65%, `W17` **current** 35% avec 3 Big Rocks détaillées autour de Affejee/CA Bretagne/AMANI, `W18` upcoming (vide, préparable par le copilote).
>
> ### 8 Sociétés (COMPANIES), 6 palettes projet (PROJECT_COLOR), 3 palettes groupe (GROUP_COLOR).
>
> ### Helpers data
> `A.getProject(id)`, `A.getGroup(id)`, `A.getContact(id)`, `A.getTasksOfProject(pid)`, `A.getProjectsOfGroup(gid)`, `A.workloadForDate(iso)` (retourne `{ tasks, events, totalMin, taskMin, evMin }`).
>
> ---
>
> ## 4. Logique applicative (`assets/app.js`)
>
> ### Persistance
> - Clé unique : `aiCEO.store.v1` dans `localStorage`.
> - `A.getStorePath(path, default)` / `A.setStorePath(path, value)` avec chemins pointés (`tasks.state.t7.done`, `gamif.streak`, `view.activeGroup`, `proposals`, etc.).
> - **Merge data-driven** : `A.TASKS_ALL()` retourne `base + added - deleted` avec patches `edited[id]` et états `state[id]` appliqués en surcharge. Idem pour `A.DECISIONS_ALL()` et `A.PROPOSALS_ALL()`.
>
> ### CRUD complet
> - Tâches : `createTask`, `updateTask`, `deleteTask`, `toggleTaskDone`, `toggleTaskStar`, `isTaskDone`, `isTaskStarred`, callback `onTaskChange(fn)`.
> - Décisions : `createDecision`, `updateDecision`, bascule statut.
> - Propositions : `acceptProposal`, `rejectProposal`, `setProposalStatus`.
>
> ### Scope filter
> - `A.getActiveGroup()` / `A.setActiveGroup(id)` ; les helpers `A.scopeTasks(list)` et `A.scopeProjects(list)` filtrent sur le groupe actif (`"all"` = tout).
> - Au clic sur un chip du group switcher -> `location.reload()` (les pages s'adaptent).
>
> ### Export JSON
> `A.exportJSON()` télécharge un dump daté avec tâches + décisions + events + contacts + projets + groupes + reviews + propositions.
>
> ### Shell & Mount
> `A.mount({ page, title, subtitle?, breadcrumb, pageHeader?, pageActions?, content, onMounted? })` reconstruit `<div id="app-root">` avec sidebar + topbar + main + modals + drawer + toast-wrap + FAB.
>
> ### Palette (⌘K / `/`)
> Ouvre overlay, cherche dans 5 catégories, navigation clavier complète, Enter = `location.href = r.href`.
>
> ### Drawer (source inspector)
> Sur tout élément `[data-open-task]` / `[data-open-decision]` / `[data-open-event]` un listener global ouvre un drawer latéral contenant : la "source d'origine" (un mini-aperçu type thread mail ou event agenda, reconstruit heuristiquement via `A._sourceOfTask(t)`), les méta-infos, les éléments liés (events, décisions, propositions IA), et les boutons d'action contextuels (toggle done, éditer…).
>
> ### Gamification
> - `A.getStreak()` — `{ days, lastDay }`, auto-bumpé quand une tâche est passée à `done` un nouveau jour.
> - `A.getBadges()` — débloqués aux paliers 1 / 5 / 20 / 50 tâches soldées total.
> - `A._countClosedToday()` / `A._countClosedThisWeek()` (semaine = depuis lundi).
> - `A.celebrate(msg)` — toast inline avec coche après chaque tâche soldée.
> - `A.coachMessage({ overdue, bigRocksProgress, weekNum })` — renvoie une phrase aléatoire parmi 3-4 variantes selon 7 contextes : beaucoup de retards, journée productive, streak >=5, semaine >=8 soldées, 2 Big Rocks derrière, après 17h, avant 10h, fallback générique. Jamais culpabilisant.
>
> ### End-of-day ritual
> Si heure >= 17h, afficher sur le cockpit une section "Clôturer la journée sereinement" avec bouton qui ouvre un drawer bilan (N soldées aujourd'hui, streak, reste, ce qui attend demain, mot du copilote).
>
> ### Raccourcis clavier
> `⌘K` / `Ctrl+K` / `/` -> palette. `N` (hors champ texte) -> Quick-Add. `Esc` -> ferme modals/drawer.
>
> ### Icônes
> Inline SVG style Lucide, stroke 2, round caps, `currentColor`. Ne pas charger de lib.
>
> ---
>
> ## 5. Comportement des pages
>
> ### `index.html` — Cockpit
> Structure exacte (dans l'ordre vertical) :
> 1. **Intention Hero** (top-eyebrow "S17 · Intention" -> h1 du `review.intention` -> meta "scope · tâches ouvertes · décisions en attente" | streak + badges)
> 2. **Week gauge** (compteur soldées / total)
> 3. **Coach strip** (message contextuel de `A.coachMessage`)
> 4. **Big Rocks** (3 rock-cards, progression dégressive)
> 5. **Cockpit grid 4 cartes** : Focus (3 tâches prioritisées : retards critiques > duJour starred > duJour > starred open) + next event, Criticité (dot cloud), Charge/jour (semaine lun->dim), Décisions en attente (max 4).
> 6. **End-of-day CTA** si >=17h.
>
> ### `taches.html`
> Toggle 3 vues (Liste / Matrice Eisenhower 2x2 / Timeline par énergie). Filtres : projet, priorité, énergie, checkbox "afficher soldées". KPIs : `Soldées cette semaine / Ouvertes / En retard / Copilote IA`. Bloc "À rattraper calmement" pour les retards. Quick-Add en haut à droite.
>
> ### `agenda.html`
> Vue Semaine (grille 7j x 14h de 7h à 21h, row 56px, events positionnés en absolute par `top` et `height`), avec bande de charge par jour (workload bar colorée green/amber/rose). Vue Liste chronologique. Vue Historique. Navigation entre semaines. Chaque event ouvre son drawer.
>
> ### `decisions.html`
> Bloc "À exécuter" trié par deadline, puis blocs mensuels des exécutées. Bouton `Marquer exécutée` inline. Modal d'ajout.
>
> ### `assistant.html`
> Intention-hero adaptée ("Je vous ai préparé N propositions"). 4 KPIs (En attente / Acceptées / Urgentes / Automatisations). Sections par `kind`. Bouton "Tout accepter". Historique en bas. Bloc "À venir dans le copilote" (roadmap).
>
> ### `groupes.html`
> 3 cartes groupe XXL (icône 44px, tagline uppercase colorée, description, mini-KPIs : projets / ouvertes / retard / charge / IA / décisions à exécuter / événements futurs / progression moyenne), chacune cliquable pour filtrer le scope.
>
> ### `projets.html`
> Cartes projet groupées par groupe. Chaque carte : icône + nom + tagline + statut pill + stats (tâches, retard, charge, %), barre de progression. Lien vers `projets/<id>.html`.
>
> ### `projets/<id>.html`
> Page projet détaillée via `project-page.js` : header projet (nom, groupe, entités), tâches liées, décisions liées, events à venir, KPIs spécifiques au groupe (Adabu = roadmap tech + SLA ; AMANI = timeline chantier Cadrage->Structure->FF&E->Ouverture + contraintes BREEAM ; Terres Rouges = tableau bord juridique & financier).
>
> ### `contacts.html`
> Recherche + filtre par tag. Cartes avec avatar initiales, nom, rôle @ org, tags pills, projets liés. 4 KPIs. Boutons Écrire / Appeler / Résumé IA.
>
> ### `revues/index.html`
> Revue courante en intention-hero + 3 Big Rocks cards + progression. Bouton "Préparer revue S18" qui génère une proposition de Big Rocks à partir des tâches S18 + events prep_needed. Liste des revues archivées cliquables.
>
> ---
>
> ## 6. Contenus éditoriaux non négociables
>
> - Le ton du copilote est **calme, adulte, jamais "streak obsessif"**. Exemples à respecter : *"Quelques tâches en retard — pas un drame. Une seule soldée change la donne."*, *"Régularité remarquable — continuez sans forcer."*, *"Rien soldé aujourd'hui · parfois c'est juste une journée pour réfléchir. Demain sera plus linéaire."*
> - Les brouillons de mail dans les AI_PROPOSALS doivent sonner français-pro (Cher Maître, Bien cordialement, etc.), signés "Feyçoil Ansquer".
> - Le FAB, le quick-add et la palette sont toujours présents sur **toutes** les pages.
> - Date "d'aujourd'hui" pour la démo = **2026-04-23** (jeudi). `current` review = W17. Ne pas utiliser `new Date()` pour trier les données seed, calcule tout par rapport à cette date pivot si besoin (mais garde `new Date()` pour les fonctions runtime).
>
> ---
>
> ## 7. Critères de recette
>
> 1. Ouvrir `index.html` au double-clic -> l'app s'affiche sans erreur console.
> 2. `⌘K` ouvre la palette, Enter navigue.
> 3. Touche `N` ouvre Quick-Add ; créer une tâche la fait apparaître dans `taches.html` après reload.
> 4. Cocher une tâche -> toast "Tâche soldée" + celebration + streak incrémenté + badge si palier atteint.
> 5. Cliquer sur un chip de groupe -> scope appliqué partout, count du sidebar mis à jour.
> 6. Ouvrir une tâche -> drawer latéral avec source inspector et éléments liés.
> 7. `A.exportJSON()` dans la console télécharge un JSON bien formé.
> 8. Responsive : <900px le sidebar devient drawer (hamburger) ; <720px les grids 2/3/4 passent à 1 col.
> 9. Accessibilité : navigation 100% clavier, skip-link fonctionne, focus visible.
> 10. Aucun appel réseau en dehors de l'import Inter.
>
> ---
>
> Génère maintenant l'intégralité des fichiers, un par un, avec leur chemin en en-tête, sans couper le code. Commence par `assets/data.js`, puis `assets/app.css`, puis `assets/app.js`, puis les HTML dans l'ordre de la section 1.

---

## Comment l'utiliser

1. Copie le bloc entre guillemets ci-dessus dans un LLM capable de générer de longues sorties (Claude Opus, GPT-5, etc.).
2. Si la sortie est tronquée, demande la suite fichier par fichier en re-citant la section 1.
3. Récupère l'arborescence dans un dossier local et ouvre `index.html`.

## Notes de fidélité

Ce prompt encode les **specs observables** mais laisse une latitude d'interprétation au modèle sur les micro-détails (wording exact, agencement fin des chips, etc.). Pour une reproduction pixel-perfect, il faut attacher au prompt les 3 fichiers `assets/*.js` et `assets/app.css` existants comme références de style.
