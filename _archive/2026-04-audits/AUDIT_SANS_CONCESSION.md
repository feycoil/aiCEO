# aiCEO — Audit fonctionnel sans concession

_Audit réalisé le 23 avril 2026 sur la base de l'état actuel du code (7 pages HTML, 7 pages projet, 4 assets JS/CSS, 1 revue hebdo)._

---

## Verdict global

Le socle visuel et l'architecture JS sont **solides et cohérents** (shell unifié, palette ⌘K, a11y correcte, DA Twisty bien appliquée). Mais **fonctionnellement, c'est une maquette riche, pas un produit**. Sur 7 zones de valeur promises, **1 seule est pleinement opérationnelle** (tâches — et encore, à moitié). Tout le reste est en lecture seule, alimenté par `data.js` en dur, sans persistance serveur, sans édition, sans sync réelle.

Ordre de gravité, du plus problématique au plus acceptable :

1. **Pages projet** — coquilles vides, aucune valeur ajoutée par projet
2. **Revues hebdo** — 1 semaine sur ∞, le widget "archive" est un leurre
3. **Dashboard** — intention et Big Rocks **codés en dur dans le HTML**
4. **Décisions / Agenda / Contacts** — lecture seule, données statiques
5. **Tâches** — fonctionne mais démo-grade (0/21 soldées, pas de create/edit/delete)
6. **Command palette ⌘K** — solide mais superficielle
7. **Persistance / données** — fragile, mono-device, sans export

---

## 1. Dashboard (`index.html`) — demi-vérité

**Ce qui marche.** Le tri des priorités du jour (combinaison `critical` + `overdue` + dues ≤ J+1) est pertinent. Le bandeau rouge "tâches en retard" attire l'œil. Les 4 KPI (projets actifs, en retard, RDV 7j, revue) donnent un pouls rapide. Les 4 projets chauds sont bien sélectionnés (status `hot` / `new` / overdue > 0). La DA Twisty est respectée : hero cream, KPI tintés, typographie display.

**Ce qui ne marche pas.**

- **L'intention de la semaine et les 3 Big Rocks sont en dur dans `index.html` lignes 27–32**. Ce n'est pas un bug, c'est un choix produit non assumé : vous regardez votre propre rappel de la semaine inscrit en dur dans le code source. Pour le changer lundi prochain, il faudra éditer `index.html`. Ça devrait venir de la revue courante (`AICEO.REVIEWS.find(r => r.status === "current")`) qui existe déjà côté data mais n'est pas lue ici.
- **Pas de widget "aujourd'hui"** malgré l'affichage "Bonjour Feyçoil 👋". La date n'est pas visible. Dans un outil de pilotage quotidien, c'est une omission.
- **Pas de quick-add**. Depuis le dashboard, impossible d'ajouter une tâche, un RDV, une décision. Alors que c'est le point d'entrée quotidien.
- **Pas de "continue là où tu t'es arrêté"** — pas de dernière tâche cochée, pas de dernière décision, pas de fil d'activité.

**Verdict.** Vitrine séduisante mais statique. Doit être recâblée sur `REVIEWS[current]`, exposer la date, et proposer au moins un quick-add.

---

## 2. Projets — 7 coquilles vides

`/projets/amani.html`, `feder.html`, `scimb.html`, `sci-start.html`, `ith-lloyds.html`, `etic-depots.html`, `honoraires.html` font chacun **16 lignes identiques** (vérifié : `wc -l` = 16 pour les 7). Tout le contenu est généré par `AICEO.renderProjectPage(id)` à partir de `data.js`. C'est élégant comme approche, mais **aucune personnalisation par projet** : même template, même ordre, même sections, même densité — que vous soyez sur AMANI (54 tâches, un chantier ouvert) ou Honoraires (une poignée de décisions administratives).

**Problèmes concrets.**

- **Pas de contenu spécifique.** AMANI n'a pas son échéancier BREEAM en timeline dédiée, ith-lloyds n'a pas son tableau créanciers, SCI Start n'a pas son cap-table. Tous affichent la même grille "hero + KPI + tâches ouvertes + workstreams + events + décisions".
- **Le hero gradient** utilise `c.bg → #ffffff` depuis `AICEO.PROJECT_COLOR[p.color]`, avec les tokens Twisty actuels (désaturés, muted) le dégradé est quasi invisible — on perd la différenciation visuelle entre projets qui était l'intérêt.
- **Pas d'éditeur.** Impossible depuis la page projet d'ajouter une tâche à ce projet, de créer une décision, de noter un événement. Lecture seule.
- **Pas de "next step".** Sur un outil de pilotage, on attend "quelle est la prochaine action sur ce projet" en gros, en haut. Là c'est noyé dans la liste des tâches ouvertes.

**Verdict.** Le design pattern "page projet générique" est défendable pour un MVP, mais le gradient invisible + l'absence d'édition + l'uniformité totale en font pour l'instant des **pages de consultation interchangeables**, pas des cockpits projet.

---

## 3. Tâches (`taches.html`) — fonctionnelle mais démo-grade

**Ce qui marche vraiment.**

- La vue matrice Eisenhower 2×2 (do/plan/delegate/drop) est propre, avec icônes 🔥📅📤🗑️ et compteurs par quadrant.
- Le toggle Liste ↔ Matrice persiste via `localStorage.aiCEO.tasksView`.
- Le cochage/étoilage d'une tâche persiste via `aiCEO.store.v1` avec toast de confirmation.
- `aria-checked` et `aria-pressed` sont correctement gérés.

**Problèmes durs.**

- **0 tâche sur 21 est marquée `done` dans `data.js`**. Donc le filtre "Terminées" est toujours vide à l'ouverture, et les états "motivants" du produit (√ tâches soldées cette semaine) n'existent pas. Données démo non finies.
- **Pas de création**, pas d'édition de libellé, pas de suppression, pas de reprogrammation. Pour réaffecter une tâche à demain, impossible depuis l'interface.
- **Pas d'actions en masse**. Si vous avez 5 tâches "reporter à la semaine prochaine", il faut les rouvrir une à une — et encore, c'est pas possible.
- **Double comptage potentiel** : la matrice compte les `type:"drop"` dans leur quadrant, mais dans la vue liste ils sont filtrés hors de `open`. Deux sources de vérité numérique pour le même dataset.
- **2 tâches sont overdue, 5 étoilées**, mais aucun indicateur global "X en retard" dans la page tâches elle-même (seulement sur le dashboard).

**Verdict.** La meilleure feature du produit. Utilisable au quotidien si on accepte qu'elle soit **read + toggle only**. Il manque le CRUD minimal pour passer de "cochage de démo" à "pilotage réel".

---

## 4. Décisions (`decisions.html`) — lecture seule assumée

9 décisions, groupées par mois, avec filtre par projet. Les 3 KPI en tête sont calculés, la liste est bien lisible.

**Ce qui coince.**

- **Pas d'ajout de décision.** Ironique pour un outil de pilotage exécutif dont le produit-clé *est* la décision.
- **Le champ `parties` est affiché brut** (souvent une chaîne texte style "Feyçoil / Marie / CA Bretagne"). Pas de résolution vers les contacts existants, pas de chip coloré, pas de lien.
- **Le KPI "ce mois" est codé en dur** (cf. les clés `2026-04`, `2026-03`). Le 1er mai il affichera toujours avril.
- **Pas de suivi** : une décision n'a pas de statut (prise / à exécuter / soldée), pas de deadline, pas d'owner traçable. C'est un journal, pas un moteur.

**Verdict.** Journal décisionnel propre et lisible. Mais un journal figé dans data.js est un fichier texte déguisé. Priorité 1 de cette page : permettre l'ajout (même rudimentaire).

---

## 5. Agenda (`agenda.html`) — fausse intégration Outlook

29 événements dans `data.js` (8 passés, 21 futurs à partir du 23 avril). Groupement par jour correct, filtres catégorie (amani/etic/personal) fonctionnels, KPI en tête.

**Le trompe-l'œil.**

- **Aucune connexion Outlook réelle**. Alors que le prompt mentionne un MCP Outlook disponible (`outlook_calendar_search`, `outlook_email_search`). L'agenda affiche des données statiques compilées à la main dans data.js. Un vrai agenda doit refléter l'inbox au moment où on l'ouvre.
- **Taxonomie double qui peut se contredire** : catégorie (`amani|etic|personal`) + projet (`amani|feder|...`). Un événement AMANI est dans `category: "amani"` et `project: "amani"`. Mais un événement "déjeuner Marie Ansquer" est `category: "personal"` ou `etic` ? La règle n'est pas codée, ni documentée.
- **Pas de création d'événement**, pas de réponse à invitation, pas de conflit détecté.
- **Pas de vue semaine / mois.** Seulement un fil chronologique. Sur un agenda, l'absence de grille temporelle est un manque structurant.

**Verdict.** Joli fil d'événements. Mais tant que ce n'est pas **branché sur votre vrai Outlook via le MCP**, c'est du mobilier. C'est sans doute le feature avec le plus grand écart entre l'apparence (vraie feature) et la réalité (lecture seule d'un dump).

---

## 6. Contacts (`contacts.html`) — données lacunaires

25 contacts, 11 organisations, panneau détail avec avatar + coordonnées + événements liés.

**Ce qui marche.** La recherche live + filtres (tag/projet/org) fonctionnent. Le chip des tags est bien coloré. Le sidebar détail est élégant.

**Les lacunes objectives des données.**

- **13 contacts sur 25 (52%) n'ont pas d'email.**
- **25 contacts sur 25 (100%) n'ont pas de téléphone.** Le champ n'existe probablement même pas dans le schema.
- **Résultat** : la promesse "coordonnées en un clic" n'est tenue que pour 12/25 contacts, et jamais pour le téléphone. C'est un carnet d'adresses à moitié rempli.

**Les limites structurelles.**

- **Les événements liés au contact sont devinés par préfixe d'email** (ex: `marie.ansquer@...` → recherche `marie` dans les events). Heuristique fragile — homonymes, prénoms manquants dans `participants`, événements loupés.
- **Pas de création, pas d'édition, pas de merge.** Si ça bug — ça ne se répare pas depuis l'UI.
- **Pas d'historique d'interactions** (dernier échange, dernière décision, dernière tâche impliquant ce contact). C'est un annuaire, pas un CRM.

**Verdict.** Annuaire esthétique, mais **données incomplètes** + zéro édition = outil de consultation secondaire. Moins utile qu'un carnet Outlook standard tant qu'il n'est pas synchronisé et complet.

---

## 7. Revues hebdo (`revues/index.html`) — 1 semaine sur ∞

C'est le feature le plus vendeur sur le papier ("archive multi-semaine de vos revues hebdo avec KPI agrégés"). **Il y a 1 seule semaine dans `WEEKS`, la W17.** La moyenne sur "progression moyenne" est calculée sur 1 point. L'archive est une archive d'un élément.

Le widget lui-même est un **bundle React de 27 lignes avec Babel inline** — c'est un choix technique inhabituel pour un site sans build (tout le reste est HTML+JS vanilla).

**Verdict.** Feature **prétextuelle**. Tant qu'il n'y a pas 6–8 semaines de recul minimum, ça reste un trou narratif. Priorité : un générateur automatique de revue hebdo (Sundays à partir de tasks + decisions + events de la semaine). Sans ça, "archive de revues" n'a pas de matière.

---

## 8. Command palette ⌘K — solide mais superficielle

**Ce qui marche.** Raccourci global, navigation clavier (↑↓/Enter/Esc), recherche multi-index (pages / projets / tâches / contacts / décisions), résultats typés avec icônes.

**Les angles morts.**

- **Pas de scoring fuzzy** — recherche exact-substring uniquement. Tapez "amni" → 0 résultat.
- **Pas de section "Récents"** par défaut (palette vide sans query). Pour un quick-jump, "les 5 derniers lieux visités" serait la valeur n°1.
- **Les décisions ne matchent que si la query a une longueur ≥ 1**, les tâches sont cappées à 6 quand la query est courte. Règles non documentées.
- **Pas de commandes**. Une palette devrait permettre `/nouvelle-tache`, `/bascule-vue`, `/export`. Là c'est uniquement du nav.

**Verdict.** Bonne base, features manquantes attendues.

---

## 9. Persistance / données — fragile

- **`localStorage.aiCEO.store.v1`** stocke uniquement `tasks.{id}.done|starred`. Tout le reste (édition d'une décision, ajout d'un contact, etc.) n'est pas persisté — parce qu'il n'y a pas d'édition.
- **Pas d'undo**. Cochez une tâche par erreur → un re-clic. Pas d'historique.
- **Mono-device.** localStorage = pas de synchro entre machine pro et perso. Si vous cochez une tâche sur le fixe du bureau, rien n'apparaît sur le portable.
- **`data.js` = 33 KB de données en dur** dans un seul fichier JS. Pour modifier une échéance, il faut éditer le source et redéployer. **Ce n'est pas un produit, c'est un statoscope figé à la date de son dernier commit.**
- **Aucun export** (PDF / CSV / JSON). Pour produire une revue de direction, il faut des copier-coller.

**Verdict.** Le point technique le plus structurant à régler. Sans backend (même minimal : un Google Sheet, un JSON sur OneDrive) ou a minima une édition + export, **le produit ne survit pas à son deuxième mois** — les données deviennent périmées et la friction pour les mettre à jour (éditer data.js à la main) fait qu'on cesse de le faire.

---

## 10. Accessibilité, perfs, responsive — globalement OK

**Bonne surprise.** Skip-link, landmarks (`role="main"`, `role="navigation"`), `aria-checked`/`aria-pressed` sur les toggles, focus ring 2px solid + halo 0.20 (WCAG 1.4.11 compliant), `@media (prefers-reduced-motion)` honoré, `@media (forced-colors)` supporté. Palette typo Inter, tailles lisibles, contraste labels -800 sur bg tintés conforme AA.

**Petits reproches.**

- **`<aside>` avec `role="navigation"` ajouté** — `<aside>` implique déjà `role="complementary"`. Ajouter `role="navigation"` override et perd la sémantique de "panneau latéral". Utiliser `<nav>` imbriqué aurait été plus propre.
- **Pas de dark mode.** Demandé 0 fois, mais sur un outil consulté de 6h à 23h il mérite d'exister.
- **Pas de print styles.** Imprimer la page décisions ou la revue hebdo = désastre visuel.
- **Pas d'i18n.** Toutes les strings en dur en français. Si un cofondateur anglophone vous rejoint, gros chantier.

**Verdict.** A11y + structure = **meilleur aspect du produit**. Mais mode sombre / impression / i18n manquent.

---

## Ce qu'il faut faire, par ordre d'impact

1. **Recâbler le dashboard sur `REVIEWS[current]`** — sortir l'intention et les Big Rocks du HTML. C'est 30 minutes de travail, corrige le pire problème perçu.
2. **CRUD tâches minimal** : create, edit, delete, reprogrammer. Passe le produit de "maquette" à "outil".
3. **Générateur de revue hebdo automatique** : agréger les tasks done + decisions + events de la semaine → produire une entrée `REVIEWS[W18]`. Donne du sens à la page revues.
4. **Connecter l'agenda au vrai Outlook** via le MCP disponible. Tant que ce n'est pas fait, l'agenda ment sur sa nature.
5. **Pages projet différenciées** : au moins 1 ou 2 widgets custom par projet chaud (AMANI timeline BREEAM, honoraires tableau créanciers). Même 3 projets sur 7 suffisent à justifier l'investissement.
6. **Backend minimal** — Google Sheet ou JSON synchronisé. Sans ça, data.js devient plus faux chaque semaine.
7. **Export PDF / CSV** — revue hebdo, liste décisions, cascade de tâches. Sinon le produit ne sort jamais de l'app.
8. **Quick-add global** — `n` ou `+` depuis n'importe quelle page ajoute une tâche, une décision, un contact.

---

## Ce qui est sous-estimé et mérite d'être revendiqué

- La **cohérence visuelle** atteinte avec la DA Twisty est réelle. 7 pages HTML + 7 stubs projet qui partagent le même shell sans divergence visuelle, c'est bien.
- Le **pattern `A.mount({...})`** est élégant et scalable. Ajouter une 8ᵉ page ne coûte presque rien.
- L'**a11y** est au-dessus de la moyenne des apps internes d'entreprise.
- Le **toggle Liste ↔ Matrice avec persistance** sur les tâches est une vraie bonne idée UX.
- La **palette ⌘K multi-index** est plus loin que beaucoup d'outils commerciaux.

---

_Fin de l'audit. Prochaine étape suggérée : prioriser les 3 premiers points (dashboard recâblé, CRUD tâches, générateur revue) — c'est ce qui transforme une maquette en outil quotidien._
