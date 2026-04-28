# Audit UX/UI approfondi — aiCEO v0.6

**Date** : 27 avril 2026
**Périmètre** : 17 écrans Claude Design v0.6 + 25 scripts JS + 5 CSS partagés
**Auditeur** : binôme Claude (revue critique)

> Audit lucide post-livraison. Aucune complaisance. Hiérarchisé : 🔴 critique · 🟠 majeur · 🟡 mineur · 🟢 opportunité.

---

## 1. Cohérence globale du design system

### ✅ Forces
- **DS partagé strict** : 82 variables CSS uniques (tokens), 2 hex en dur résiduels seulement
- **Architecture ITCSS-like** : `colors_and_type.css` (tokens) → `app.css` (composants) → `tweaks.css` (overrides)
- **Sprite SVG inline** (Lucide stroke 1.8) sur les 17 pages — cohérence iconique parfaite
- **Polices self-hosted** (Fira Sans + Aubrielle script + Sol Thin) — typographie maîtrisée
- **Drawer canonique** propagé sur 14 pages (sauf hub/onboarding/components qui ont leur propre layout)

### 🔴 Critique
- **Aucune source unique de styles `.hub-*`** : ces classes n'existent pas dans app.css → j'ai créé un `hub-storybook.css` de fallback. Risque de divergence si Claude Design retouche le hub.
- **Inline styles abusifs** dans 4 pages (`settings.html` : 56, `index.html` : 35, `agenda.html` : 38, `components.html` : 33). Anti-pattern qui rend la maintenance hostile.

### 🟠 Majeur
- **Onboarding wizard** = HTML statique figé sur "étape 3" — j'ai dû créer un wizard JS qui injecte par-dessus. Le HTML d'origine est inutilisé, c'est de la dette.
- **Tweaks panel** Claude Design (debug DS) : code source tronqué → désactivé. Outil designer perdu.
- **Tokens non documentés** : pas de page Storybook qui liste les 82 tokens avec exemples visuels. `components.html` est un mini-storybook mais n'expose pas les tokens.

### 🟡 Mineur
- Polices Fira Sans 11 fichiers pesant ~2 Mo (chargées toutes en font-face même celles peu utilisées comme Heavy 900 ou ExtraLight 200). À sous-setter en V1 (gain ~70 %).
- Variables CSS en kebab-case (`--text-2`) cohérentes mais nomenclature non documentée. Pas de guide « quand utiliser `--text-2` vs `--text-3` ».

---

## 2. Navigation & architecture de l'information

### ✅ Forces
- **Drawer responsive fluide** : expanded 240 → collapsed 60 (avec persistance localStorage) → off-canvas mobile (<640px) avec burger
- **Bouton flottant collapse** position:fixed (élégant, fonctionne partout)
- **Items grisés "preview"** (Connaissance/Coaching) avec badge orange — l'utilisateur voit ce qui est V1
- **Cmd+K palette** avec recherche fuzzy multi-entité (cmds + projets + tâches + décisions + contacts)
- **Profile dropdown** sur drawer-user (Mon profil / Verrouiller / Réinitialiser / Refaire onboarding)

### 🔴 Critique
- **Pas de breadcrumbs** ni indication de profondeur dans la navigation. Sur `/v06/projet.html?id=X`, l'utilisateur ne sait pas d'où il vient.
- **Boutons sans href** dans la maquette (« Ouvrir l'arbitrage », « Préparer », « Reformuler ») — j'ai dû les binder par regex texte. Fragile : un texte modifié casse la nav.

### 🟠 Majeur
- **Hub (`/v06/hub.html`)** : pas de drawer, ni de navigation cohérente. C'est une page splash isolée. Si l'utilisateur arrive là sans onboarding fait, il peut se sentir perdu.
- **Bouton "+" Nouveau** détecté par regex texte → tag automatique `data-new` → fragile à l'i18n (en EN/AR « New project » ne match pas).
- **Pas de retour visible** depuis page projet vers la liste (pas de breadcrumb, pas de bouton "←").
- **Cmd+K palette** ne propose pas de raccourcis G+T (genre Linear) pour navigation power-user.

### 🟡 Mineur
- **Drawer-tenant** (sélecteur d'espace) ne fait rien — mono-tenant donc pas pertinent v0.6, mais visuellement il invite au clic. À griser ou retirer le chevron.
- Pas de **barre de recherche globale** dans le header (sauf via Cmd+K). Découvrabilité limitée pour non-power-users.

---

## 3. États (loading, empty, error, success)

### ✅ Forces
- **Empty states implémentés** sur 5 pages (cockpit, evening, settings, components, onboarding) avec textes propres
- **Toast queue système** (multi-toasts empilés sans s'écraser)
- **Offline banner** sticky top quand serveur perdu (poll 10s)
- **Confirm dialog custom** AICEOConfirm (remplace les natifs `confirm()`/`alert()`)
- **Skeleton loading CSS** dispo (`.aiceo-skeleton`) avec shimmer

### 🔴 Critique
- **Empty states manquants** sur 11 pages sur 17 (taches, arbitrage, agenda, projets, projet, equipe, decisions, revues, assistant, coaching, connaissance) — quand la base est vide, l'écran est plat.
- **Pas de loading skeleton appliqué** : la classe CSS existe mais n'est utilisée nulle part. Les pages s'affichent vides puis se remplissent (FOUC).
- **Pas de gestion d'erreur** quand un fetch API échoue : silent fail, l'utilisateur ne sait pas que quelque chose a planté (sauf via console).

### 🟠 Majeur
- **Pas de feedback success après action** sur certains points (drag-drop arbitrage → toast "Carte → faire" mais pas de confirmation visuelle persistante).
- **Empty state cockpit Top-3** : message "Aucune tâche prioritaire pour aujourd'hui. Profitez-en pour respirer." OK pour zen-mode mais ne propose pas d'action (genre "+ Capter une tâche").

### 🟡 Mineur
- Skeleton pas animé sur les pages preview (Connaissance/Coaching) qui ont juste un filtre grayscale. Une animation skeleton serait plus claire que "page grisée".

---

## 4. CRUD & formulaires

### ✅ Forces
- **Modal générique réutilisable** (`AICEOModal.open`) avec 4 entités configurées
- **Selects async** (group_id chargé depuis /api/groups, project_id depuis /api/projects) — empêche les FK invalides
- **Range slider** pour `progress` avec affichage live de la valeur
- **Auto-tag des boutons "+ Nouveau X"** par texte
- **Édition au clic** sur les cards (data-task-id, data-project-id, etc.)
- **Suppression** avec confirm danger custom

### 🔴 Critique
- **Pas de validation client** des champs avant submit. Si tu entres une date passée pour `due_at`, ou une priorité invalide, ça part vers le serveur qui rejette.
- **Pas de gestion d'erreur** dans le modal : si l'API renvoie 400, l'utilisateur voit `alert("Erreur : title requis")` natif (au lieu d'un message dans le formulaire à côté du champ).

### 🟠 Majeur
- **Pas d'auto-save** des brouillons : si tu fermes accidentellement le modal en pleine saisie, tu perds tout.
- **Pas de duplication / cloner** : créer une tâche similaire à une existante = tout retaper.
- **Pas de sélection multiple / bulk actions** : impossible de cocher 5 tâches et les marquer toutes terminées.
- **Pas d'undo après suppression** : "Annuler dans les 5s" toast serait pro.

### 🟡 Mineur
- Modal **pas de tabs** pour formulaires longs (settings → 9 onglets, mais la création projet a 6 champs sur une seule colonne — peut être étoffé en V1 sans paniquer).
- Pas de **markdown preview** dans textarea description (pour les longs textes formatés).

---

## 5. Drag & drop / interactions complexes

### ✅ Forces
- **DnD natif HTML5** sur arbitrage (3 buckets) — fonctionnel
- **Feedback visuel** au dragover (background change)
- **Compteurs colonnes** se mettent à jour en temps réel

### 🔴 Critique
- **DnD non persisté côté backend** : tu drag-drop une carte, mais si tu ne cliques pas "Trancher", c'est perdu au reload. Aucune indication visuelle que c'est en mémoire seulement.
- **DnD ne marche pas sur mobile** : touch events non gérés. Sur tablette/smartphone, l'arbitrage est bloqué.
- **Pas de DnD sur tâches Eisenhower** alors que la maquette suggère 4 quadrants drag-drop.

### 🟠 Majeur
- **Pas d'animation lors du drop** : la carte saute brutalement d'une colonne à l'autre.
- **Pas de keyboard navigation** pour DnD (accessibilité : impossible de bouger une carte au clavier).

---

## 6. Filtres & recherche

### ✅ Forces
- **Filter chips** (Par maison / Par santé / Tableau) avec toggle is-active
- **Cmd+K palette** pour recherche transverse

### 🔴 Critique
- **Filtres chips ne se cumulent pas** : ils sont mutuellement exclusifs (1 chip actif à la fois) sauf si `data-multi="1"` sur le groupe. Donc impossible de filtrer "Northwind + à risque" simultanément.
- **Pas de recherche locale** sur les listes (taches, projets, contacts) au-delà de Cmd+K. Pas d'input de recherche dans le topbar de chaque page.
- **Pas de tri** : impossible de trier projets par progression, tâches par échéance, contacts par dernière interaction.

### 🟠 Majeur
- **Pas de sauvegarde des filtres** : si tu filtres "Solstice + à risque", recharge la page → reset.
- **Pas de filtres temporels** sur agenda/revues (cette semaine vs ce mois vs ce trimestre).

---

## 7. Accessibilité (WCAG 2.2 AA)

### ✅ Forces
- **Skip-link** (`Aller au contenu`) présent dans toutes les pages
- **aria-label** sur les éléments interactifs principaux (drawer, burger, close buttons, toggles)
- **Tokens contraste** OK (text/text-2/text-3 sur surfaces blanc/cream — testé visuellement)
- **prefers-reduced-motion** respecté (token `--reduceMotion` + override transitions)

### 🔴 Critique
- **11 boutons sans aria-label ni textContent** détectés (probablement icon-only buttons mal renseignés).
- **Pas de keyboard trap dans les modals** : Tab peut sortir du modal et atteindre la page derrière. Pas de focus management à l'ouverture/fermeture.
- **Cmd+K palette** : pas de role="combobox" ni aria-activedescendant — un screen reader ne sait pas que c'est une recherche autocomplete.

### 🟠 Majeur
- **Contrastes pages preview** (filter grayscale 0.4 + opacity 0.7) : peut tomber sous WCAG AA sur les textes secondaires. À tester avec axe-core.
- **Drawer collapsed** (60px) : les icônes seules sans label visible — un user clavier doit deviner qu'il y a Cockpit/Arbitrage/etc. tooltip arrive au hover seulement.

### 🟡 Mineur
- **Pas de skip "to navigation"** ni "to footer" en plus du "to main". Un nav verbeuse comme la nôtre justifierait un skip "to main content" (déjà là) + "to settings".

---

## 8. Responsive

### ✅ Forces
- **3 breakpoints clairs** : desktop (≥1024) / tablet (640-1023) / mobile (<640)
- **Drawer adapté** : expanded → collapsed 60px → off-canvas mobile avec burger
- **Persistance** : pref user respectée (si togglée), sinon défaut device
- **MutationObserver** repositionne le bouton flottant en temps réel

### 🔴 Critique
- **Cards sur mobile** : grilles auto-fill OK mais les tableaux/listes (`task-row`, `dec-card`) ne se simplifient pas. Trop d'informations sur 360px width → scroll horizontal probable.
- **Modal mobile** : largeur 560px max → sur 360px, le modal couvre 90% de l'écran. Mais les champs comme "select Project lié" peuvent dépasser si la liste est longue.

### 🟠 Majeur
- **Pas de version "data" mobile-first** sur certaines pages : `agenda.html` avec une grille `grid-template-columns: 56px repeat(7, 1fr)` → 7 colonnes visibles en 360px = colonnes de 40px illisibles.
- **Bouton flottant collapse** : caché en mobile (correct) mais pas de visual cue qu'on peut ouvrir le drawer via burger.

### 🟡 Mineur
- Pas de **portrait/landscape** check sur tablette (768x1024 vs 1024x768).

---

## 9. Microcopy & tonalité

### ✅ Forces
- **Tonalité coaching v0.6** intégrée : « Profitez-en pour respirer », « À tout moment dans la journée 🌿 », « Bonjour à demain 🌙 »
- **Question stratégique footer** : "Si vous deviez n'avancer qu'une seule chose ce trimestre, est-ce que ce serait Northwind v3 ?" → cohérent avec posture coaching
- **Empty states sont des invitations** plutôt que des constats secs : « Capturer maintenant ↗ », « Démarrez une discussion »

### 🔴 Critique
- **Aucune i18n** : tout en français en dur. Pour V1 multi-langues (FR/EN/AR), réécriture profonde nécessaire.
- **Vocabulaire non aligné** : "Maisons" (drawer onboarding) vs "groupes" (table SQL) vs "Houses" (data ID) → confusion conceptuelle.
- **"Action" vs "Tâche"** : le drawer dit "Actions" mais la table c'est `tasks`, et l'UI dit "Nouvelle tâche". Inconsistant.

### 🟠 Majeur
- **Capitalisation** : "Top-3 du jour" / "TENSION ACTIVE" / "Capter" — mélange titre case, all caps, lowercase sans logique apparente.
- **Caractères spéciaux** : « guillemets français » bien utilisés en HTML mais le sprite chevron.svg n'a pas d'équivalent fr-FR.

### 🟡 Mineur
- Toast "Enregistré" : peut être plus contextuel ("Préférence enregistrée", "Tâche créée"). Actuellement générique.

---

## 10. Performance

### ✅ Forces
- **Tout local** : zéro CDN, zéro cloud, zéro tracker. Performance réseau = 0 latence pour les statics.
- **Cache busting `?v=38`** appliqué partout
- **defer scripts** sur 12 fichiers JS (parallel download)
- **Service worker** sw.js pour offline-first + désactivé en localhost dev

### 🟠 Majeur
- **13 scripts JS chargés par page** : ~80 ko cumulés mais ce sont 13 requêtes HTTP (HTTP/1.1 sans bundle). Sur 4G lent → ~1 sec de chargement scripts.
- **Sprite SVG inline 14 ko dans 17 pages** = 14×17 = 238 ko de duplication. À externaliser via `<use href="/_shared/icons.svg.html#X"/>` cross-document (avec polyfill SVG Use).
- **Pas de bundle / minification** : tous les scripts en plain text non minifiés.
- **Polices 11 fichiers de 200 ko chacun** : 2 Mo de fonts chargées dès le 1er hit.

### 🟡 Mineur
- **Re-render complet** au reload après création/édition (`location.reload()`) plutôt qu'un patch DOM ciblé. Acceptable pour MVP, mais Linear / Notion ont du diff DOM.

---

## 11. Architecture technique du frontend

### ✅ Forces
- **Séparation claire** : 1 fichier `bind-X.js` par page = "controller"
- **Modules globaux** : `AICEOShell`, `AICEOModal`, `AICEOConfirm`, `AICEOCrud`, `AICEOPrefs`, `AICEOCmdK`, `AICEOSettings`
- **Politique de fidélité maquette** explicite (commentaire dans bind-cockpit.js)
- **MutationObserver** pour rattraper les changements dynamiques

### 🔴 Critique
- **25 scripts dans `_shared/`** sans module system (pas de import/export ES6). Tout en IIFE globaux qui collisionnent potentiellement avec les variables. Refacto vers `<script type="module">` souhaitable.
- **Pas de tests unitaires** sur ce code JS. Les tests E2E sont reportés palier 4. Donc un refacto = risque.

### 🟠 Majeur
- **Code dupliqué** : `tryJson()`, `escHtml()`, `$`, `$$` réimplémentés dans presque chaque bind-X.js. À extraire dans `_shared/utils.js`.
- **Pas de TypeScript** (compréhensible pour MVP rapide, mais code 5000+ lignes mérite typage).
- **DOMContentLoaded handlers multiples** dans chaque fichier. À centraliser dans un bootstrap unique.

### 🟡 Mineur
- Naming `bind-X.js` correct mais le fichier `workflow.js` mélange 4 features (DnD + filtres + soirée + cloche) → violation SRP. À éclater en `dnd.js`, `filters.js`, etc.

---

## 12. Sécurité (vue front-end)

### ✅ Forces
- **escHtml()** sur toutes les insertions dynamiques (pas de risque XSS depuis API)
- **Pas de localStorage applicatif** sauf clé tolérée `aiCEO.uiPrefs.*` (ADR S2.00 respectée)
- **Service Worker** désactivé en localhost dev (évite cache piège pour devs)
- **Pas de tracker tiers** (ni GA, ni Sentry, ni Hotjar)

### 🟠 Majeur
- **Input non sanitisé** côté client : les entrées textarea (description, notes) passent au backend sans filtrage HTML. Si quelqu'un colle `<script>`, le rendu côté list affichera "&lt;script&gt;" (escapeHtml fait son boulot). OK pour MVP local mais à durcir pour multi-user.
- **Pas de CSP** : ni `Content-Security-Policy` ni `X-Frame-Options` (le serveur Express n'envoie pas ces headers).
- **Pas de CSRF token** sur les POST/PATCH/DELETE. Local mono-user → pas critique. Multi-user V1 → critique.

---

## 13. Forces structurelles à conserver

1. **Local-first** non négociable (souveraineté données = différenciateur)
2. **Pages autonomes** avec CSS inline qui ferme proprement (post-fix)
3. **Convention `data-*-id`** sur les items rendus (clé de l'auto-detect orphelins démo)
4. **clear-demo.js** comme garde-fou anti-démo
5. **Modal générique** + crud-modals.js → ajouter une nouvelle entité = 5 lignes de config
6. **Sprite SVG inline** → fonctionne en file:// (CD scenarios)

---

## 14. Plan de remédiation prioritaire

### 🚨 Sprint S6.4 — Bloquants critiques (~3 jours)

| # | Item | Justification |
|---|---|---|
| 1 | Empty states sur 11 pages manquantes | Critique UX si base vide |
| 2 | Validation form client + erreurs in-field | Réduit friction CRUD |
| 3 | Loading skeletons pendant fetch | Élimine FOUC |
| 4 | Gestion erreur API gracieuse (toast / banner) | Confiance utilisateur |
| 5 | Boutons icon-only avec aria-label | A11y critique |
| 6 | Focus trap modals + ESC restore focus | A11y critique |
| 7 | Filtres cumulables multi-critères | Productivité dès 30 items |
| 8 | Recherche locale dans chaque page (Ctrl+F custom) | Découvrabilité |

### ⚠️ Sprint S6.5 — Polish majeur (~2 jours)

| # | Item | Justification |
|---|---|---|
| 9 | Breadcrumbs dans header pages détail | Orientation |
| 10 | DnD touch events (mobile) | Tablette utilisable |
| 11 | Mobile: simplifier listes/grilles (cards stackées) | Lisibilité <640px |
| 12 | Animation drop carte arbitrage | Feedback fluide |
| 13 | Auto-save brouillon modal | Pas de perte saisie |
| 14 | Bulk actions (sélection multi) | Productivité |
| 15 | Undo après suppression (toast 5s) | Filet de sécurité |

### 💡 Sprint S6.6+ — Architecture & V1 prep (~3 jours)

| # | Item | Justification |
|---|---|---|
| 16 | Refacto modules ES6 (`<script type="module">`) | Maintenabilité |
| 17 | Extraire utils communs (`_shared/utils.js`) | DRY |
| 18 | Tests E2E Playwright sur les 17 pages | Recette automatisée |
| 19 | Bundle + minification (esbuild) | Performance |
| 20 | Sous-set des fonts Latin | Performance |
| 21 | Storybook tokens (page dédiée) | Documentation DS |
| 22 | i18n FR/EN structure (clés extraites) | Préparation V1 |
| 23 | TypeScript progressif | Robustesse |

### 🎯 Sprint S6.7 — Sécurité & a11y compliance (~1.5 jours)

| # | Item | Justification |
|---|---|---|
| 24 | Headers CSP + X-Frame-Options dans server.js | Sécurité base |
| 25 | Audit a11y axe-core automatisé en CI | WCAG 2.2 AA |
| 26 | Audit Lighthouse Mobile + Desktop (cible 90+) | Performance |

---

## 15. Note de confiance

**Note globale UX** : **B+ (78/100)**

Justification :
- ✅ Design **A** : DS solide, cohérence visuelle, microcopy coaching réussi
- ⚠ UX **B** : flows fonctionnels mais friction sur empty states, errors, mobile
- ⚠ A11y **C+** : skip-link OK, mais focus trap manquant, contrastes pages preview à valider
- ✅ Performance **B+** : local-first, mais bundle non optimisé
- ⚠ Architecture **B** : solide mais 25 scripts globaux + duplication DRY

**Verdict** : prêt pour usage CEO en preprod, **pas prêt pour prod externe** (multi-user, A11y, sécurité, mobile DnD). Les paliers S6.4 + S6.5 + S6.7 (~6.5 j) sont les minimums pour un v0.6-stable défendable en ExCom. S6.6+ peut être déféré à V1.

---

**Recommandation finale** : prioriser **S6.4 (bloquants critiques)** en mode binôme accéléré (~24 h chrono). Une fois fait → recette CEO 30 min sur les 17 pages → tag `v0.6-rc1` → préprod test 1 semaine → décision GO V1.
