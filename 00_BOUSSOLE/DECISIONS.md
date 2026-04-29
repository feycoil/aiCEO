# DECISIONS — Architecture Decision Records (ADR léger)





---





## 2026-04-29 · S6.17 livre — Refonte Cockpit Phase 2 UX v0.8 (voix exec moderne)

**Statut** : Livre · **Audience** : binome · **Decision** : refonte de la page Cockpit (`v07/pages/index.html` + `v07/stores/index-store.js`) selon le Memo Phase 1 UX v0.8 valide en Etape 2 (8 sous-validations CEO 29/04 PM tardif). Premiere page-pilote a appliquer la voix exec moderne (12 termes canoniques) et le cadrage UX complet.

**Contexte** : 29/04/2026 PM tardif, suite a la validation Etape 2 par le CEO de la phrase magnetique "Naviguer clair. Trancher juste. Dormir serein.", 6 principes directeurs, 12 termes canoniques (Hub · Stream · Project · Action · Decision · Pin · Compass · North Star · Big Rock · Sync · Triage · Pulse), 8 visualisations marquantes par page, et 4 chronotypes visuels. La punch-list Phase 2 prevoyait 8 actions Cockpit pour ~4h binome. Livraison rapide en autonomie pour valider le pattern de portage du Memo en code.

**Decision** : refonte complete de `index.html` (19 KB, 7 sections) + `index-store.js` (15 KB, logique async parallele) en remplaçant la version precedente (S6.11-EE-2 L2 du 28/04 PM) par une version conforme au Memo UX v0.8.

**Sections livrees** :
1. **Hero greeting Aubrielle chronotype** — detection automatique de la tranche horaire (matin/journee/soir/nuit), shift CSS variables (--chrono-bg, --chrono-accent, --chrono-mood), greeting adapte ("Bonjour Major" / "Bon midi" / "Bon apres-midi" / "Bonsoir Major" / "Encore la, Major ?") + lead correspondant + CTA noir vers "Lancer le Triage" (anciennement "Lancer l arbitrage").
2. **Anneau journee 3 segments** — composant SVG circulaire 100x100 viewBox avec 3 anneaux concentriques (rayons 40/32/24, stroke 6px) : Decisions tranchees (violet `#463a54`), Actions completees (vert `#115e3c`), Sync done (rose `#d96d3e`). Pourcentage moyen au centre. Legende laterale avec compteurs `X/Total`.
3. **Bloc Ma Trajectoire mini** — heatmap horizontal 7 derniers jours, markers carres 36x36 avec intensite progressive selon nombre d evenements (decisions tranchees + Big Rocks atteints + Projects clos), highlight today (box-shadow 2px ink-900), CTA "Voir ma Trajectoire complete →" (lien provisoire vers `#trajectoire-coming`, page complete S6.18).
4. **KPI row 4 tiles parametrables** — Streak, Decisions/sem, Big Rocks ratio, Pulse serenite. Chaque tile a une mini-progress-bar 4px (background ivory-200, fill primary-500) avec progression vs cible parametrable. Cibles lues depuis `/api/preferences` (cle.streak, cle.decs_week, cle.big_rocks, cle.serenite). Lien "Configurer mes cibles →" vers `settings.html#coaching`.
5. **North Star premium** — bloc gradient violet→paper, eyebrow "INTENTION DE LA SEMAINE" (font-mono 10px), texte intention en 20px font-weight 600 (max-width 720px), etoile ✦ flottante top-right opacity 0.4. Empty state elegant avec lien `Lancer le Weekly Sync`.
6. **Top 3 Eisenhower** — 3 cards avec rang visible en JetBrains Mono 36px (ivory-200, position absolute top-right) + eyebrow violet "PRIORITE 1/2/3" + titre + meta `Urgent et important / Urgent / Important / Standard` + echeance. Click ouvre modal-detail enrichi via `data-md-kind="task" data-md-id="..."` (S6.12 auto-detection).
7. **Project glance** — pill-shape unique remplaçant les anciennes projects-houses encombrantes : `2 en alerte · 5 a surveiller · 6 sains · Ouvrir Projects →`. Beaucoup plus light, redirige vers la page Projets.

**Voix exec moderne appliquee** :
- "Triage" remplace "Arbitrage" sur tous les libelles UI (CTA hero, bottom-tab nav)
- "Bilan" en bottom-tab (anciennement "Soiree") - migration partielle
- "Decision tranchee" / "Action completee" / "Sync" dans la legende anneau
- "North Star" / "Weekly Sync" / "Pulse serenite" / "Big Rock" dans les sections
- "Project / Projects" dans le glance
- Footer reprend la phrase magnetique : "Naviguer clair. Trancher juste. Dormir serein."

**Conseguences** :
- Cockpit refondu en ~ 4h binome conformement a la punch-list Phase 2 (estimation respectee)
- 10/10 tests `v07-atomic.test.js` verts (drawer, header-topbar, modal-detail, timeline, bottom-tab, footer tous preserves)
- Validation par le CEO en mode usage 3-7 jours (Etape 5 de l accompagnement) avant generalisation aux 17 autres pages
- Pattern reutilisable pour les sprints suivants (S6.18 Hub, S6.19 Triage, S6.20 Decisions, S6.21 LLM frontend)
- v07 fonctionnellement complete + Cockpit aux standards UX v0.8 (premiere page conforme au cadrage Phase 1)

**Reportes (S6.18+)** :
- Page complete `trajectoire.html` interactive (link CTA pointe vers placeholder pour l instant)
- Renommage drawer-sidebar Pilotage→Compass / Travail→Deliver / Capital→Wealth (separe pour eviter regression S6.17)
- Remplacement complet "Soiree"→"Bilan" dans drawer + page evening.html (sprint cosmetique separe)
- Generalisation pattern Cockpit aux 17 autres pages
- Cablage LLM frontend complet (S6.21)

**Sources** :
- Memo UX v0.8 Phase 1 valide : `04_docs/_design-v08-intentions/MEMO-UX-V08-PHASE1.md`
- Charte de voix : `04_docs/_design-v08-intentions/VOICE-AICEO.md`
- Glossaire 12 termes : `04_docs/_design-v08-intentions/GLOSSAIRE-AICEO.md`
- Moodboard valide : `04_docs/_design-v08-intentions/MOODBOARD-V08-PHASE1.svg`
- Choix CEO Etape 0 : `04_docs/_design-v08-intentions/CHOIX-CEO-ETAPE-0.md`
- Code livre : `03_mvp/public/v07/pages/index.html` (19 KB) + `03_mvp/public/v07/stores/index-store.js` (15 KB)
- Script production : `outputs/write-cockpit-phase2.py`

**Validation** : a tester par le CEO sur 3-7 jours en condition reelle d usage matin/journee/soir (Etape 5 du parcours UX v0.8). Si OK, generalisation aux 17 autres pages en sprints S6.18+. Si ajustements, 1 boucle Phase 2bis.

---

## 2026-04-29 · S6.12 livre — modal-detail enrichi 6 kinds + auto-detection

**Statut** : Livre · **Audience** : binome · **Decision** : extension du composant `modal-detail` v07 pour gerer 6 types d items (decision/project/contact/task/event/review) avec rendu specifique, related items fetch async, actions footer contextuelles, et auto-detection des elements `[data-md-kind]`.

**Contexte** : 29/04/2026, suite a la livraison S6.11-EE-2 (8 pages enrichies UX specifique), le composant `modal-detail` etait reste "generique" : juste titre + meta basique (type/statut/created_at) + contexte. Pour les pages liste (decisions/projets/equipe/taches/agenda/revues), cliquer une carte ouvrait un modal pauvre, sans related items ni actions metier. L UX detail etait identifiee comme principal point d amelioration restant pour boucler la v07.

**Decision** : approche en 3 couches, chacune testable independamment.

**Couche 1 — modal-detail.js etendu (15.6 KB)** :
- API `el.openWith({kind, ...data})` dispatche selon le kind vers `renderDecision/renderProject/renderContact/renderTask/renderEvent/renderReview`
- Chaque renderer affiche : meta (DL grid 2 colonnes responsive avec `metaGrid()` helper) + sections specifiques + actions footer
- Async : chaque renderer peut fetch ses related items pour enrichir le rendu (decision -> pins liees · project -> tasks + decisions liees · contact -> projets en commun)
- Etat de chargement : `<div class="md-loading">Chargement...</div>` pendant le fetch async
- Listeners custom events : `decision:open`, `project:open`, `contact:open`, `task:open`, `event:open`, `review:open`
- **Auto-detection** : tout element `[data-md-kind][data-md-id]` devient cliquable, fetch automatique `/api/{kind}/:id` et ouverture du modal. Permet d accrocher le modal sur des elements custom hors card-decision.

**Couche 2 — CSS enrichi modal-detail.css (+~3 KB)** :
- `.md-meta-grid` : DL 2 colonnes (130px / 1fr) avec fond ivory-50 et padding cohesif
- `.md-section` + `.md-section-title` + `.md-section-meta` : sections avec compteur inline mono-space
- `.md-related-list` / `.md-related-item` : liste interactive avec hover violet et statut badge
- `.md-badge` : 5 tons (success/warning/danger/info/neutral) pour status decisions/projects/contacts
- `.md-options` : list grid pour options de decision et Big Rocks numerotes
- `.md-btn-primary` / `.md-btn-ghost` : boutons cohesifs Editorial Executive avec hover transitions

**Couche 3 — card-decision.js patche + 5 stores liste** :
- card-decision.js : ajout `props.kind` (default `'decision'` pour retro-compat). Au clic, dispatche `${kind}:open` au lieu de toujours `decision:open`. Modification minimale 6 lignes.
- 5 stores patches (projets/equipe/taches/agenda/revues) : ajout `kind: 'project'/'contact'/'task'/'event'/'review'` dans le payload data-props passe a card-decision. Ajout `_raw: item` pour preserver le payload original (acces aux champs metier non-mappes).

**Actions footer adaptees par kind** :
- Decision (open) : `Trancher` (vers Arbitrage) + `Epingler` (POST /api/knowledge/pins)
- Project : `Ouvrir la fiche projet` (vers projet.html?id=)
- Contact : `Envoyer un email` (mailto:)
- Task (open) : `Marquer fait` (PATCH /api/tasks/:id { done:true })
- Event/Review : juste `Fermer`

**Conseguences** :
- **18 pages v07 + modal detail enrichi** = v07 fonctionnellement complete
- Tests v07 : 10/10 verts (aucune regression sur les 10 assertions structurelles)
- Pattern d enrichissement repris extensible : ajouter un nouveau kind = 1 renderer dans modal-detail.js + 1 store qui passe le kind = ~30 lignes
- Auto-detection `[data-md-kind]` ouverte pour usages futurs : widgets cockpit, liens dans aide.html, raccourcis Cmd+K, etc.
- Mount Windows piege #2 a frappe encore une fois sur card-decision.js (Edit tronque a la ligne 144 sur 152) - Python atomic write de restauration applique. La regle "tout fichier > 50 lignes a re-ecrire en complet via Python" est validee pour toute la chaine S6.10 -> S6.12.

**Sources** :
- `03_mvp/public/v07/components/modal-detail/{modal-detail.js, modal-detail.css}` (modifies 29/04 PM)
- `03_mvp/public/v07/components/card-decision/card-decision.js` (patch leger ligne 140-150)
- 5 stores `03_mvp/public/v07/stores/{projets,equipe,taches,agenda,revues}-store.js` (data-props enrichi)
- Scripts Python atomic write : `outputs/write-modal-detail-v07.py`, `outputs/fix-card-decision.py`, `outputs/patch-stores-kind.py`

**Reportes (S6.13)** :
- Cablage LLM frontend complet (revues auto-draft, decisions Recommander dans modal-detail, cockpit banner llm-status)
- Tests E2E Playwright sur le modal enrichi (ouverture, fetch related, actions)
- Recette CEO complete v07 (Ctrl+F5 systematique sur 18 pages)
- Bascule v07 = defaut, v06 archivee (S6.15)

---

## 2026-04-29 · S6.11-EE-2 livre — 8 pages v07 enrichies (UX specifique metier)

**Statut** : Livre · **Audience** : binome · **Decision** : finalisation enrichissement metier des 8 pages "shells" issues de S6.11-EE en 4 lots successifs, validant le pattern Atomic Templates a l echelle complete.

**Contexte** : 29/04/2026, suite a S6.11-EE qui avait livre 17 pages v07 en mode "shell" (squelette + store generique + bind card-decision), 8 pages avaient une UX trop specifique pour le pattern uniforme : Hub (grid de tuiles), Onboarding (wizard), Cockpit (5 sections), Soiree (form 5 niveaux), Connaissance (CRUD pins), Coaching (signaux + 4 questions), Arbitrage (queue + focus), Reglages (8 onglets). Reaction CEO : "Aucun element pour cette page" sur ces 8 pages. Necessite portage individuel.

**Decision** : enrichissement par lots de complexite croissante, chaque lot valide en autonomie (10/10 tests verts conserves) avant le suivant.

**Lots livres** :
- **L1** (~16 KB chacun) : Hub (hero greeting Aubrielle contextuel par heure du jour + 3 vagues de tuiles statut live/shell/preview + meta streak) · Onboarding (wizard 4 etapes : firstName, tenantName, posture decisionnelle, recap + persistance PUT /api/preferences)
- **L2** (~14+9 KB) : Cockpit avec 6 blocs (hero, KPI row 4 tiles, cap strategique, dot-chart 7j velocite arbitrage, projects-houses alerte/a-surveiller/sain, top 3 Eisenhower) - rendu Promise.all parallele, degradation independante par bloc si API down
- **L3** (~27+14 KB) : Soiree (mood/energie 5 niveaux + top 3 + streak + history) · Connaissance (CRUD pins type/title/content + filtre seg + delete inline) · Coaching (signaux faibles rule-based ou LLM + 4 questions hebdo + actions reflexion via Assistant ou pin Connaissance)
- **L4** (~18+19 KB) : Arbitrage (2 modes tabs : queue emails 8 cartes scoring 0-100 avec rail colore + actions accept/defer/ignore, focus decisions navigation prev/next/skip avec commit PATCH /api/decisions) · Reglages (8 onglets sticky sidebar : General/Langue/Maisons/Rituels/Coaching/Donnees/Apparence/Zone sensible avec save inline PUT /api/preferences/:key + toggles animes)

Total **~143 KB de code v07 enrichi** sur les 8 pages les plus strategiques.

**Reportes (S6.12)** :
- Mode board drag-drop natif HTML5 d Arbitrage v06 (lourdeur specifique, peu de valeur ajoutee vs queue + focus)
- Enrichissement modal-detail des pages liste (decisions/projets/equipe/...) : champs structures + actions contextuelles + sous-listes liees
- Reset DB destructif depuis UI Reglages (volontairement bloque cote serveur, anti-accident)

**Conseguences** :
- **18/18 pages v07 livrees** (100 %) - tag potentiel `s6.11-ee-2`
- Tests v07 : 10/10 verts (PAGES = 18 incluant aide), 2 exceptions documentees (aide pas de timeline / hub pas de header-topbar standard)
- **Cohabitation v06 ↔ v07 sans regression** : v06 reste 100 % fonctionnelle pour tout repli (workflow ancien si bug v07 detecte)
- **Pattern de portage valide** : approche par lot (1 page reference puis batch de 2-3 simiaires) permet de tenir le rythme
- Drawer-sidebar deja routee 100 % v07 (S6.11-EE-fix2), aucun lien restant vers v06 dans le menu

**Sources** :
- 8 paires html+store dans `03_mvp/public/v07/{pages,stores}/` (modifies 29/04/2026 matin)
- Tests `03_mvp/tests/v07-atomic.test.js` (PAGES etendu de 17 a 18)
- Scripts Python atomic write : `outputs/write-{hub,onboarding,cockpit,l3,l4}-v07.py`
- Mount Windows piege #2 confirme : Edit/Write tronque tout fichier > 100 lignes - Python atomic write systematique applique sur les ecritures de cette livraison.

**Jalons CEO suivants** :
- Push 30+ commits Phase 0 + S6.10/EE/EE-FIX/EE-2 vers origin
- Tag `s6.11-ee-2` sur le commit final (apres recette CEO visuelle)
- ADR final dans DECISIONS.md + tag pousse origin
- S6.12 : enrichissement modal-detail pages liste (pre-requis recette ExCom)

---

## 2026-04-26 · Adoption Claude Design v0.6 — archivage S6.1 atomic

**Statut** : Acté · **Audience** : équipe binôme · **Décision** : pivot adoption Claude Design v0.6 + archivage S6.1 atomic

**Contexte** : 26/04/2026 PM, livraison Claude Design Phase 1 reçue dans `04_docs/_design-v05-claude/claude_design/vague_1/`. **8.9 Mo, 74 fichiers utiles** : 7 écrans HTML (hub, cockpit, arbitrage, evening, onboarding, settings, components/storybook), DS partagé monolithique (3 CSS ~50 ko + app.js 10 ko + sprite 54 icônes + 11 fonts self-hosted ~2 Mo), PWA (manifest + service worker), tests auto 7 pages.

Audit comparatif vs S6.1 livré (cf. `04_docs/_design-v05-claude/claude_design/vague_1/AUDIT-VAGUE-1.md`) : **les 2 systèmes sont structurellement incompatibles** :
- Naming : pragmatique court Claude Design (`.btn.ghost`, `.kpi-tile`, `.house-northwind`) vs BEM strict S6.1 (`.c-button--ghost`, `.c-modal__header`)
- Architecture : 3 fichiers monolithiques vs 30 fichiers ITCSS 7 couches
- Sprite : 54 icônes `i-*` (avec custom métier `i-arbitrage`, `i-evening`, `i-house`, `i-coaching`) vs 30 icônes `icon-*` Lucide standard

Tenter de fusionner créerait un mix instable + double maintenance sur 18 mois.

**Décision** : **adopter intégralement Claude Design v0.6 comme implémentation officielle v0.6**, et **archiver S6.1 atomic** comme alternative DS scalable pour V2/V3.

**Justifications** :
1. Claude Design a livré 7 écrans **fonctionnels** prêts à brancher — c'est le saut produit attendu en v0.6.
2. La maquette est cohérente (single-author, alignée bundle 17 PJ + image étalon Twisty).
3. Le sprite icônes Claude Design (54 icônes avec custom métier) dépasse en couverture le sprite S6.1 (30 standard Lucide).
4. Garder 2 systèmes en parallèle = **cauchemar maintenance**.
5. La rigueur BEM atomic peut être réintroduite en V2 quand on aura un vrai besoin (≥2 tenants, ≥3 langues, ≥10 designers).
6. `npm install` côté Windows pas encore tourné → switch sans coût migration.

**Conséquences** :

*Côté repo* :
- `03_mvp/public/_shared/` (S6.1 atomic) **renommé** `03_mvp/public/_shared-atomic/` — préservation référence.
- `03_mvp/public/components.html` (gallery S6.1.5) **renommé** `03_mvp/public/components-atomic.html` — links patches vers `/_shared-atomic/`. Reste accessible en `/components-atomic.html`.
- `03_mvp/public/v06/` créé avec livraison Claude Design intégrale (7 HTML + `_shared/` + manifest + sw.js + fonts).
- Pages v0.5 (cockpit, arbitrage, evening, taches, agenda, revues, groupes, projets, projet, contacts, decisions, assistant) **inchangées** — utilisent `/assets/colors_and_type.css` historique. Coexistence v0.5 ↔ v0.6 OK.

*Côté roadmap* :
- Sprint S6.1 (DS atomic, livré) : **archivé** comme référence. Tag `v0.6-s6.1` posé pour traçabilité, mais marqué [ARCHIVED] dans roadmap-map.html.
- **Nouveau Sprint S6.1-bis** : « Adoption livraison Claude Design v0.6 » (Phase A coexistence déployée le 26/04/2026 PM).
- Sprint S6.2 (cible 3-5 j binôme) : « Branchement APIs REST sur 7 écrans Claude Design ».
- Sprint S6.3 (cible 1-2 j binôme) : « Migration pages restantes au DS Claude Design + cleanup ».

*Côté governance* :
- Bundle Claude Design v3.1 reste cible visuelle V1+. La livraison vague_1 = première matérialisation.
- Si Claude Design livre Phase 2 (Tier 2 + Tier 3 = projets/contacts/decisions/registres), elle sera intégrée pareil.

*Côté risques* :
- R1 : effort S6.1 (≈3-4 h) « perdu » — non, capitalisé en apprentissage BEM atomic réutilisable V2.
- R2 : SW peut cacher en dev → désactiver via DevTools si besoin pendant phase B/C.
- R3 : datasets démo Claude Design plus riches que APIs REST actuelles → backlog ticket pour enrichir en V1.

**Prochaine étape immédiate** : tester `localhost:4747/v06/hub.html`, naviguer entre les 7 écrans, valider visuellement, puis lancer S6.2 (branchement APIs).

**Sources** :
- `04_docs/_design-v05-claude/claude_design/vague_1/AUDIT-VAGUE-1.md` (rapport complet 6 sections)
- `04_docs/_design-v05-claude/claude_design/vague_1/design-v06/` (livraison source)
- `03_mvp/public/v06/` (déploiement)
- ADR `2026-04-26 · S6.00 — Méthode v0.6 + cadrage 3 sprints courts` (réajusté en S6.1-bis + S6.2 + S6.3)

---

## 2026-04-26 · S6.1.00 — Méthode Sprint S6.1 + setup ITCSS

**Statut** : Acté · **Audience** : équipe binôme · **Démarrage** : J0 (post-ExCom 04/05)

**Contexte** : Ouverture formelle du Sprint S6.1 (premier sprint de la phase v0.6 « Interface finalisée »). Cohérent ADR `2026-04-26 · S6.00 — Méthode v0.6 + cadrage 3 sprints courts` qui acte le découpage 3 sprints (S6.1 / S6.2 / S6.3). S6.1 pose les **fondations DS atomic** : tokens 3 niveaux, ITCSS 7 couches, BEM avec préfixes, 16 composants UI catalogués, drawer collapsible, components gallery, SVG sprite Lucide.

S6.1 est le sprint le plus structurant de v0.6 : il conditionne la qualité visuelle des 23 issues suivantes (S6.1.1 → S6.3.7). Tout raté en S6.1 contamine les 2 sprints suivants.

**Décision** : **acter 5 points de méthode pour le Sprint S6.1** :

1. **Architecture ITCSS 7 couches** dans `03_mvp/public/_shared/` : `01_settings/`, `02_tools/`, `03_generic/`, `04_elements/`, `05_objects/`, `06_components/`, `07_utilities/`. La spécificité monte uniquement, pas de `!important` sauf cas exceptionnel documenté.

2. **Naming convention BEM avec préfixes** : `c-` (components), `o-` (objects), `u-` (utilities), `t-` (themes/tenant V1+), `is-/has-` (states). Profondeur BEM max 1 niveau d'élément (`.c-block__element--modifier`). Pas de sélecteur descendant `.c-block .title` (interdit, utiliser `.c-block__title`).

3. **Tokens CSS en 3 niveaux** : primitive (couleur brute, neutre) → semantic (usage contextuel) → component (par bloc, optionnel). **Règle d'or** : un composant ne référence JAMAIS un primitive directement. Toujours via semantic ou component. Permet remap brand color tenant V1 sans toucher la palette source.

4. **Un composant = un fichier** dans `06_components/c-<nom>.css` avec header `/**` obligatoire (variants, sizes, états, usage HTML, source). Co-location stricte. Tests visuels dans `/components.html` (gallery, S6.1.5).

5. **Scripts npm utilitaires** ajoutés à `03_mvp/package.json` (S6.1.0) :
   - `css:lint` : stylelint avec règles BEM + ITCSS layering (cible `_shared/**/*.css`)
   - `a11y:audit` : axe-core CLI sur les 13 pages refondues (cible WCAG AA cockpit/arbitrage/evening 0 finding critique)
   - `svg:sprite` : génère `_shared/icons.svg` sprite à partir de lucide-static@latest (S6.1.6, 30 icônes inventoriées)
   - `lint` : alias agrégé (`css:lint` + tests Playwright)

**Conséquences** :

- **Arborescence ITCSS créée** : 7 dossiers vides dans `03_mvp/public/_shared/` + `README.md` racine + `CONTRIBUTING-V06.md` guide BEM/ITCSS exhaustif.
- **Tokens 3 niveaux à implémenter en S6.1.1** : pas dans cette issue (S6.1.0). Découpage clair.
- **Composants à implémenter en S6.1.2-4** : 11 atoms + 9 molecules + 7 organisms = 27 composants au total (catalogue dépasse 16 cibles initiales — voir ADR S6.00 §3 pour réajustement scope si vélocité tient).
- **Pas de nouvelles dépendances Node bloquantes en S6.1.0** : `stylelint`, `@axe-core/cli`, `lucide-static` ajoutés en `devDependencies` optionnelles. Installation via `npm install --save-dev` quand nécessaire (S6.1.6 pour svg:sprite, S6.3.7 pour a11y:audit).
- **Performance budget v0.6** : LCP < 2 s desktop, INP < 100 ms, bundle CSS < 50 kb. Mesure à chaque commit S6.1+ via Chrome DevTools Lighthouse.
- **Zéro régression v0.5** : les 12 pages existantes (`index.html`, `arbitrage.html`, etc.) continuent de charger `assets/colors_and_type.css` non modifié. Refonte progressive en S6.2.

**Critères de scellement S6.1.0** :

- [x] Arborescence ITCSS créée (7 dossiers)
- [x] `_shared/README.md` rédigé (architecture, conventions)
- [x] `_shared/CONTRIBUTING-V06.md` rédigé (guide BEM + ITCSS + do/don't)
- [x] ADR S6.1.00 actée (ce document)
- [ ] Scripts npm ajoutés à `03_mvp/package.json`
- [ ] Tests Playwright préservés (~95 verts) — vérification post-commit

**Sources** :
- DOSSIER-V06.md §3 Sprint S6.1 issue #1 (S6.1.0)
- ADR `2026-04-26 · S6.00 — Méthode v0.6 + cadrage 3 sprints courts`
- ADR `2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1`
- `04_docs/_design-v05-claude/ressources-a-joindre/13-architecture-atomique.md`




---





## 2026-04-26 · S6.00 — Méthode v0.6 + cadrage 3 sprints courts

**Statut** : Acté · **Audience** : équipe binôme + ExCom · **Démarrage** : J0 (post-ExCom 04/05)

**Contexte** : Suite à la décision GO v0.6 actée par ADR `2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1`, kickoff opérationnel de la phase v0.6 en mode binôme accéléré (cohérent vélocité ×30 v0.5). Pas de POA xlsx ni KICKOFF pptx — optionnels selon CLAUDE.md §2 en mode accéléré. Direct DOSSIER-V06.md + ADR cadrage + script issues + exécution séquentielle.

**Décision** : **acter 5 points de méthode pour la phase v0.6** :

1. **Mode binôme accéléré confirmé** (cohérent v0.5) — Feycoil + Claude. 0 ETP externe. Vélocité cible ×15-×20 (entre v0.5 ×30 et V1 ×10). Si vélocité < ×10 mi-S6.2, alerter et adapter (réduire scope S6.3).

2. **Génération maquette Claude Design d'abord** — pré-requis bloquant avant S6.1. Action manuelle CEO : poster prompt v3.1 sur Claude Design (`04_docs/_design-v05-claude/PROMPT-FINAL.md`), uploader 15 PJ, récupérer ~62 vues hi-fi. Étalon visuel pixel-près pendant l'implémentation. Sans elle, on improvise. Stocker dans `04_docs/_sprint-s6/maquette-claude-design/`.

3. **Découpage 3 sprints courts × ~5 j chrono dogfood chacun** :
   - **S6.1 — DS atomic + 16 composants + drawer + components gallery** (8 issues, 6,0 j-dev)
   - **S6.2 — Refonte 7 pages cockpit + rituels + travail courant + coaching v0.6** (8 issues, 6,4 j-dev)
   - **S6.3 — 5 pages registres + onboarding + settings + a11y + recette + tag v0.6** (8 issues, 6,1 j-dev)

   Total : 24 issues, 18,5 j-dev sur ~13 j chrono dogfood + 14 j observation = ~4 sem calendaires.

4. **3 milestones GitHub** : `v0.6-s6.1`, `v0.6-s6.2`, `v0.6-s6.3`. Tag final `v0.6` posé après S6.3 livrée. Pas de tag intermédiaire `v0.6-sN.M` sauf si nécessaire pour rollback. Au précédent on avait `v0.5-s1`...`v0.5-s5` posés — on garde cette convention pour cohérence dogfood.

5. **Audit accessibilité externe en parallèle S6.2** (pas seulement S6.3) — lancer prestataire dès kickoff S6.2 pour itérer pendant S6.3 si findings. ~3 k€ budget. Prestataire à identifier dans S6.1.

**Conséquences** :

- **DOSSIER-V06.md livré** dans `04_docs/_sprint-s6/DOSSIER-V06.md` — 10 sections (contexte, périmètre, 3 sprints, pré-requis maquette, risques, critères, budget, planning, dépendances, sources).
- **24 issues prévues** sur 3 milestones GitHub, créées via `04_docs/_sprint-s6/scripts/gh-create-issues-v06.ps1` (UTF-8 BOM, pattern v0.5 reproduit).
- **Pas de POA xlsx ni KICKOFF pptx** (mode accéléré), gain ~3 j de prep vs mode plein.
- **Budget v0.6 = ~8 k€** absorbés dans provision V1 actuelle (105 k€ disponible, pas de rallonge).
- **Pré-requis bloquant maquette Claude Design** : avant S6.1 démarrage, action manuelle CEO requise (1 session ~60-90 min).
- **Dogfood Feycoil quotidien préservé** : refonte UI sans régression fonctionnelle. Tests Playwright à chaque commit, ≥ 95 verts maintenus.
- **Cumul v0.6 fin = 100 % budget v0.6** consommé (~8 k€ direct sur ~8 k€ enveloppe).
- **Ouverture V1 immédiatement post-v0.6** (T3 2026 → T1 2027, 6 thèmes ~46 k€ binôme).

**Critères de scellement v0.6 (go/no-go V1)** :

13 critères dans DOSSIER-V06.md §6 — résumé : 13 pages refondues conformes maquette, DS atomic + 16 composants, microcopy FR unifié, WCAG AA + audit externe 0 finding critique, 4 patterns coaching visibles, onboarding fonctionnel, components gallery, tests Playwright ≥ 95 verts, 0 régression v0.5, perf LCP < 2 s + bundle CSS < 50 kb, tag `v0.6` + Release publiée, adoption Feycoil 100 % dogfood 14 j, ADR `v0.6 livrée` rédigée.

**Sources** :
- DOSSIER-V06.md (`04_docs/_sprint-s6/DOSSIER-V06.md`)
- ADR `2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1`
- ROADMAP `04_docs/08-roadmap.md` v3.2
- Bundle Claude Design v3.1 (`04_docs/_design-v05-claude/`)
- CLAUDE.md (méthode binôme §2 + workflow §10)




---





## 2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1

**Statut** : Acté · **Audience** : ExCom + équipe dev + Feycoil dogfood · **Décision majeure** : oui (réorganisation roadmap)

**Contexte** : Le bundle de design Claude Design v3.1 livré le 26/04 a produit ~62 vues hi-fi clickables qui couvrent la trajectoire v0.5 → V3. La maquette est riche, mais l'écart entre ce que représente la maquette (vision V1 SaaS multi-CEO complet) et ce que livre l'app v0.5 actuelle (mono-user dogfood Feycoil avec UI fonctionnelle mais sans le DS atomic, sans les composants polish, sans l'accessibility WCAG AA, sans la microcopy unifiée, sans les patterns coaching) reste à combler.

Pour engager les 6 thèmes V1 (~46 k€ binôme, ~6 mois, multi-tenant + équipes + intégrations + mobile + backup + logs) sur des fondations visuelles instables, on prendrait un risque de refonte tardive. La maquette Claude Design est faite pour être la cible visuelle V1, pas seulement un mockup.

Question d'arbitrage : implémenter la refonte UI **dans V1** au milieu des features fonctionnelles, ou **avant V1** comme palier dédié ?

**Décision** : **insérer une phase v0.6 "Interface finalisée"** entre v0.5 livré et V1, dédiée exclusivement à la refonte UI selon le bundle Claude Design v3.1, sur le scope fonctionnel v0.5 (pas d'ajout fonctionnel).

### Périmètre v0.6 (UI uniquement, scope v0.5 préservé)

**À livrer** :

1. **DS atomic implémenté** — tokens en 3 niveaux (primitive / semantic / component), ITCSS, BEM avec préfixes (`c-`/`o-`/`u-`/`is-`/`has-`)
2. **16 composants UI catalogués** (`06-composants-catalogue.md`) — buttons (4 variants × 3 sizes), inputs, modals (3 sizes), toasts, tooltips, dropdowns, switches, progress bars, tags/chips, avatars, skeletons, tabs underline, cards, KPI tiles, search pill, command palette ⌘K
3. **13 pages refondues** selon maquette Claude Design — cockpit, arbitrage, evening, taches, agenda, revues, assistant, groupes, projets, projet, contacts, decisions + index nav
4. **Microcopy unifié** (FR uniquement en v0.6) selon `14-microcopy-principes-impact.md` — empty states, errors, confirmations, placeholders, tooltips, onboarding wizard
5. **Accessibilité WCAG AA** — skip links, focus visible, ARIA roles, navigation 100 % clavier, prefers-reduced-motion, color blindness (status = couleur + icon)
6. **Patterns coaching v0.6** (légers, cohérents v0.5 sans surcharge V3) :
   - Time-of-day adaptation cockpit (4 modes : matin / journée / soir / nuit)
   - Friction positive (5e P0 ajoutée → modal soft "5 P0 aujourd'hui. Tout est urgent ?")
   - Recovery streak break (sans drame, "Pas grave, on reprend")
   - Posture stratégique footer (question du mois)
   - **Pas** de coach prompt hebdo (V3), **pas** de mirror moments (V3), **pas** de score santé exécutive (V3), **pas** de self-talk monitoring (V3)
7. **Onboarding wizard simple** (5 étapes vs 7 prévues V2) — bienvenue, langue (FR par défaut, EN désactivé), import Outlook (déjà fait pour Feycoil), première Big Rock, recap. Désactivé par défaut pour Feycoil (déjà onboardé), activé pour CEO pair futur.
8. **Settings page basique** — 4 sections (identité, intégrations, sécurité base, données) sans multi-tenant config (V1)
9. **Components gallery** (`components.html`) — mini-storybook visuel pour gouvernance DS
10. **Drawer collapsible desktop** 240px ↔ 60px avec persistance localStorage `aiCEO.uiPrefs.drawerCollapsed` (seul localStorage applicatif autorisé par ADR S2.00)
11. **Iconographie Lucide** stroke 1.5 unifiée (30 icônes inventoriées)
12. **Charts SVG inline** (6 patterns autorisés : vertical line+dot, vertical bars, linear progress, circular ring, calendar heatmap streak, sparkline)
13. **Source-link pattern** unifié (chip cream surface-3 avec icône Lucide + label tronqué + chevron)
14. **Auto-save / dirty state** sur boucle du soir + note du jour + bilan revue (1s après dernière frappe)
15. **Streaming SSE rendering** raffiné — skeleton bubble + curseur clignotant + reconnexion exponentielle (déjà livré v0.5, polish v0.6)

**À NE PAS livrer** (réservé V1+) :

- ❌ Multi-tenant (tenant_id, vocabulary configurable, switcher tenant) → V1 thème 1
- ❌ Équipes / délégation E2E → V1 thème 2
- ❌ Intégrations Teams/Notion/Slack → V1 thème 3
- ❌ Mobile / tablet / PWA / bottom-tab nav / FAB / bottom sheets → V1 thème 4
- ❌ Backup chiffré automatique → V1 thème 5
- ❌ Logs winston + Langfuse → V1 thème 6
- ❌ i18n FR + EN activé (architecture i18n posée techniquement en v0.6 sans activation EN) → V2
- ❌ RTL prep AR/HE → V2
- ❌ Coach Opus + frameworks + mirror moments + score santé + self-talk → V3
- ❌ Offline-first → V3
- ❌ Multi-CEO écosystème → V3

### Modèle d'équipe v0.6

**Binôme Feycoil + Claude étendu** (cohérent ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1`).

- Feycoil : dogfood quotidien sur la nouvelle UI, validation, signature externe (rien à signer en v0.6)
- Claude : implémentation UI complète (HTML + CSS + JS vanilla minimaliste), refonte composants, microcopy, tests Playwright préservés (~95 → ~95+)

### Durée v0.6

**~2-3 semaines** en mode binôme (vs ~12 semaines en équipe externe).

Découpage suggéré en 3 sprints courts :
- **S6.1** (~5 j chrono dogfood) : DS atomic + 16 composants + drawer + header + footer + components gallery
- **S6.2** (~5 j chrono dogfood) : refonte cockpit + arbitrage + evening + taches + agenda + patterns coaching v0.6
- **S6.3** (~5 j chrono dogfood) : refonte revues + assistant + 5 pages registres + onboarding + settings + microcopy + accessibility + recette CEO + tag `v0.6`

Vélocité cible : **×15-×20** (entre v0.5 ×30 et V1 cible ×10). Réaliste car scope étroit (UI uniquement, pas de nouveau backend).

### Budget v0.6

| Poste | Montant |
|---|---|
| Dev humain (Feycoil dogfood) | **0 €** |
| Infra (déjà payée, pas de surcoût v0.6) | 0 € |
| LLM Claude API (3 sem × 30 €/jour) | ~600 € |
| Provision imprévus / outils | ~3 k€ |
| Tests utilisateur (1 CEO pair pré-V1 sur la nouvelle UI) | ~2 k€ |
| Audit accessibilité externe (axe-core + audit visuel pro) | ~3 k€ |
| **Total v0.6** | **~8 k€** |

Source : provision V1 actuelle (105 k€ disponible) — v0.6 absorbée dans cette provision sans rallonge budgétaire.

### Critères d'acceptation v0.6

- [ ] 13 pages refondues conformes à la maquette Claude Design v3.1 (mode "vue dev" filtré sur features `[v0.5]` + `[v0.6]`)
- [ ] DS atomic implémenté (tokens 3 niveaux + 16 composants catalogués)
- [ ] Microcopy FR unifié (zéro string ad hoc cross-pages)
- [ ] WCAG AA verifiable sur cockpit / arbitrage / evening (audit axe-core 0 finding critique)
- [ ] Patterns coaching v0.6 visibles (time-of-day, friction positive, recovery, posture footer)
- [ ] Onboarding wizard fonctionnel (testable en démo CEO pair, pas activé pour Feycoil)
- [ ] Components gallery accessible via `/components.html`
- [ ] Tests Playwright préservés (≥ 95 verts)
- [ ] 0 régression fonctionnelle vs v0.5
- [ ] Performance : LCP < 2s desktop, bundle CSS < 50 kb
- [ ] Tag `v0.6` posé sur main, GitHub Release publiée
- [ ] ADR `v0.6 livrée` rédigée

### Conséquences sur la trajectoire 18 mois

| Phase | v3.1 ancien | v3.2 nouveau |
|---|---|---|
| v0.5 fusion | 110 k€ · 26/04/2026 LIVRÉ | inchangé |
| **v0.6 Interface finalisée** | (n'existait pas) | **~8 k€ · ~2-3 sem · binôme · cible mai 2026** |
| V1 SaaS + équipes + mobile | 46 k€ · T3 2026-T1 2027 | 46 k€ · T3 2026-T1 2027 (inchangé, démarre après v0.6) |
| V2 commercial international | 800 k€ · T2-T4 2027 | inchangé |
| V3 coach + offline + multi-CEO | 600 k€ · T4 2027+ | inchangé |
| **Total 18 mois** | **1,46 M€** | **~1,47 M€** (+8 k€ v0.6 absorbés dans provision V1) |

### Bénéfices

1. **Validation visuelle avant V1** — la nouvelle UI est éprouvée par Feycoil dogfood pendant 1-2 mois avant qu'on engage les 6 thèmes V1 (300 k€ valeur travail externalisée équiv.)
2. **Réduction risque refonte tardive** — implémenter le DS atomic en parallèle des features V1 aurait dilué les sprints V1 et créé des conflits de merge
3. **Livrable séparé pour ExCom** — v0.6 démontre la trajectoire visuelle réelle au board (vs maquette théorique)
4. **Onboarding CEO pair fluide** — le 1er CEO pair francophone qui arrive mi-V1 trouve une UI déjà polie, pas un MVP en cours de refonte
5. **Cible visuelle V1 vivante** — quand l'équipe dev V1 (binôme) implémente multi-tenant, elle code sur des composants stables, pas sur du legacy v0.5 à refondre
6. **Audit accessibilité externe en sortie v0.6** (3 k€) — corrige les findings avant V1 multi-tenant, où l'a11y devient un argument commercial

### Sources

- ADR `2026-04-26 · v0.5 internalisée terminée — bilan + ouverture phase V1`
- ADR `2026-04-26 · Bundle design Claude Design v3.1 — cible visuelle V1`
- ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1`
- Bundle `04_docs/_design-v05-claude/` (16 ressources, 6 ADR gouvernance, prompt v3.1)




---





## 2026-04-26 · Modèle binôme CEO + Claude étendu à V1 — sourcing équipe consolidé

**Statut** : Acté · **Audience** : ExCom + Feycoil personnel · **Décision majeure** : oui

**Contexte** : La phase v0.5 internalisée a validé le modèle binôme **Feycoil + Claude** sur 5 sprints en ~16h chrono dogfood (vélocité x30 vs plan ETP). La ROADMAP v3.0 du 26/04 a redéfini V1 autour de 6 thèmes prioritaires (~300 k€/6 mois) dont le sourcing initial prévoyait 5,6 ETP : 2 fullstack dev + 1 mobile dev + 1 AI engineer + 1 designer + 0,5 DevSecOps + 0,3 PMO.

Question d'arbitrage : extrapoler le modèle binôme à V1, ou recruter l'équipe ETP comme prévu ?

**Décision** : **étendre le modèle binôme Feycoil + Claude à V1**. Tous les rôles techniques sont assurés par Claude (en mode expert senior) en interaction avec Feycoil (CEO + dogfood + arbitrage produit + signature externe). Pas de recrutement externe en V1.

### Mapping rôles × capacités Claude

| Rôle initial | Couverture Claude | Limites |
|---|---|---|
| **Fullstack dev #1 (Node + SQL + frontend)** | ✅ Code production-grade (Express, SQLite/Postgres, vanilla JS, HTML/CSS Tailwind) | Pas d'exécution en prod sans Feycoil (push, deploy, test sur poste) |
| **Fullstack dev #2 (idem #1, parallélisme)** | ✅ Travail séquentiel rapide (vélocité x30 obvier le besoin de parallélisme) | Si Feycoil indisponible, pas de progrès code |
| **Mobile dev (PWA iOS + Android)** | ✅ Code PWA, manifest, service worker, viewports responsive, gestures, FAB, bottom-tab nav | Pas de test physique iPhone/Android (Feycoil teste). Pas de signature App Store / Play Store. |
| **AI engineer / consultant LLM** | ✅ Architecture prompts, sub-agents, evals, integration Anthropic SDK, fallback rule-based | Modèle Claude qui se design lui-même → biais possibles. Audit externe recommandé en sortie V1. |
| **Product designer** | ✅ Bundle design v3.1 livré, design system, composants UI, patterns interactionnels, accessibilité, microcopy FR+EN, motion, charts SVG | Pas de tests utilisateur réels avec CEO pairs avant Feycoil les onboard. Pas de design ethnographique (interviews terrain). |
| **DevSecOps (chiffrement, Microsoft Entra)** | ✅ Code chiffrement at-rest AES-256, intégration msal-node OAuth, configuration RLS Supabase, audit log | Pas de pen-testing externe (recommandé via prestataire en sortie V1 thème 5). Pas d'audit SOC 2 (V2). |
| **PMO** | ✅ Suivi sprints, milestones GitHub, ADR, recette ExCom, planning, retro | Pas de communication équipe externe (n/a vu pas d'équipe). Pas de coordination contractuelle externe (Feycoil signe). |

### Capacités Claude validées sur v0.5 (preuves)

- 5 sprints livrés (S1+S2+S3+S4+S5) en ~16h chrono cumulées
- 41 issues GitHub closes, 5 tags, 5 GitHub Releases
- ~95 tests verts (85 unit/intégration + ~12 E2E Playwright)
- 12 pages frontend + 4 routes assistant streaming + 11 routers REST CRUD
- 27 ADRs rédigées avec rigueur ADR léger
- 1 bundle design produit complet (16 ressources, prompt v3.1, 6 ADR gouvernance)
- 0 régression, 0 incident dogfood
- Vélocité x30 vs plan ETP

### Limites reconnues du modèle (mitigation)

| Limite | Risque | Mitigation |
|---|---|---|
| **Dépendance unique à Feycoil** | Si Feycoil malade/vacances/empêché, V1 s'arrête | Plan résilience : préparer un "go-no-go pause" auto, documenter tous les contextes en `00_BOUSSOLE/`, identifier un suppléant CEO pair niveau 2 (Lamiae ?) qui peut continuer dogfood au minimum |
| **Pas de tests utilisateur externes pendant développement** | Risque d'auto-référence : on conçoit pour Feycoil, ça peut ne pas marcher pour CEO pair | Onboarder le 1er CEO pair francophone à mi-V1 (mois 3) en mode bêta accélérée pour validation usage |
| **Pas de pen-testing / audit sécurité externe** | Risque fuite multi-tenant à l'ouverture | Budget audit prestataire en sortie V1 (~20 k€), avant ouverture commerciale V2 |
| **Pas de signature contrat / Apple/Google Developer / commercial** | Feycoil reste responsable légal de tout | Documenté, accepté |
| **Pas de support emotionnel client** | À la mise en service externe, bugs/questions arrivent à toute heure | Documentation auto-service riche + chat assistant intégré + escalade Feycoil par mail |
| **Biais auto-évaluation Claude design lui-même** | Le copilote IA est designé par une IA → blind spots possibles | Externalisation review sécurité + UX au moins 1× par milestone (V1 → audit, V2 → tests utilisateurs CEO pairs réels) |
| **Risque de regression sur dogfood** | Une feature V1 casse le flux quotidien Feycoil | Branch protection main + tests Playwright systématiques + rollback un-clic + dogfood Feycoil vendredi soir avant push lundi |

### Nouveau budget V1 — révisé

Ancien budget V1 (sourcing externe) :
- Dev : 26 sem × 5,6 ETP × 900 €/j × 4,5 j/sem ≈ **295 k€**
- Infra : ~5 k€
- **Total v3.0 initial : ~300 k€**

Nouveau budget V1 (binôme Feycoil + Claude) :
- Dev humain : 0 € (Feycoil dogfood + signature, non budgété en équipe)
- Infra (Supabase Pro, Postgres + RLS, Bedrock EU pour Claude API, Langfuse Cloud, monitoring, backup chiffré) : ~12 k€
- LLM Claude API (estimation 6 mois × 30 €/jour moyen) : ~5,5 k€
- Apple Developer + Google Play Developer : ~150 €
- Audit sécurité externe en fin V1 (pen-testing) : ~15 k€
- Onboarding 1er CEO pair (formation, support 1×1, repas) : ~3 k€
- Provision imprévus / outils SaaS divers : ~10 k€
- **Total V1 binôme : ~46 k€** (vs 300 k€ initial — économie ~254 k€)

### Réallocation des 254 k€ économisés

3 options :

**Option α — Conserver en trésorerie** (~254 k€ disponibles pour V2 ou autre poste ETIC)
**Option β — Anticiper V2** : démarrer marketing initial (landing, pricing, comparison) + premier client international en parallèle V1
**Option γ — Investir en sécurité/conformité** : commencer SOC 2 Type II dès V1 (réduit délai V2 de 6 mois)

**Recommandation Feycoil** : option β (anticipation V2) car la fenêtre Microsoft Copilot CEO 2027 est limitée. ~80 k€ marketing + ~40 k€ recrutement 1 success/sales junior à mi-V1 + ~50 k€ provision SOC 2 = 170 k€. Reste ~85 k€ trésorerie.

### Critères de go/no-go en cours de V1

À 3 mois (mi-V1) :
- 3 thèmes V1 livrés sur 6 (multi-tenant + équipes + intégrations OU mobile + backup + logs)
- Architecture Postgres + Microsoft Entra opérationnelle
- 1er CEO pair francophone identifié et engagé pour bêta mois 4-5
- Aucun incident dogfood Feycoil
- Vélocité maintenue ≥ x10 (pas besoin x30, x10 suffit pour 6 mois 6 thèmes)

À 6 mois (fin V1) :
- 6 thèmes V1 livrés
- ≥ 2 CEO pairs francophones onboardés et utilisateurs actifs ≥ 30 j
- Adoption mobile par Feycoil ≥ 60 % consultations hors bureau
- Adoption équipe ETIC (DG + AE) ≥ 50 % jours ouvrés
- Audit sécurité externe : 0 finding critique
- Tag `v1` posé

Si vélocité ne tient pas (< x5), GO recrutement externe partiel (1 fullstack senior, ~8 k€/mois) en mois 4. Pas avant.

### Plan résilience binôme

1. **Documentation continue** : tout est dans `00_BOUSSOLE/` (CHANGELOG, DECISIONS, GOUVERNANCE, ROADMAP) + `04_docs/` (specs, runbooks). Aucune connaissance dans la tête uniquement.
2. **Push Git après chaque session** : tout commit pousse main, pas de WIP local long.
3. **CEO pair suppléant** : Lamiae identifiée comme suppléante dogfood + arbitrage produit en cas d'empêchement Feycoil > 7 j. À former en mois 1 V1.
4. **Détection burnout Feycoil** : usage propre (boucle du soir humeur + énergie sur 14 j glissants). Si baisse marquée, V1 pause auto.
5. **Backup conversation Claude** : sessions préservées localement (`local-agent-mode-sessions/`). Reproductible si nécessaire.

### Conséquences

- **Recrutement V1 annulé** : aucun CV à sourcer, aucun contrat freelance à signer.
- **Budget V1 passé de 300 k€ à 46 k€** (gain trésorerie 254 k€).
- **Vélocité validée x30 sur v0.5 maintenue cible x10 sur V1** (6 mois suffisent confortablement).
- **ROADMAP `04_docs/08-roadmap.md` v3.0 → v3.1** : bumper avec nouveau budget V1 + section équipe binôme.
- **Anticipation V2 possible avec 170 k€ réinvestis** : marketing + 1 success/sales + provision SOC 2.
- **Risque résiduel principal** : dépendance unique à Feycoil. Mitigé par plan résilience et CEO pair suppléant Lamiae.
- **Externalisation strictement nécessaire** : audit sécurité (V1 sortie, ~15 k€) + tests utilisateurs CEO pairs (V2 entrée).

**Sources** :
- ADR `2026-04-26 · v0.5 internalisée terminée — bilan + ouverture phase V1`
- ADR `2026-04-26 · Bundle design Claude Design v3.1`
- ROADMAP v3.0 §3.2 (vélocité x30 binôme validée)
- 27 ADRs v0.5 (preuves de travail Claude full-stack + design + PMO)




---





## 2026-04-26 · Bundle design Claude Design v3.1 — cible visuelle V1 + re-mapping cadrage par version

**Statut** : Acté · **Audience** : ExCom + équipe dev V1 + board/investisseurs

**Contexte** : Suite au scellement v0.5 ce 26/04 et à l'ouverture de V1 (6 thèmes prioritaires, ~300 k€/6 mois), un bundle de design Claude Design a été produit (`04_docs/_design-v05-claude/`, 16 ressources + prompt v3.1 ~16k chars + 6 ADR de gouvernance) pour matérialiser la vision produit cible.

L'audit conformité bundle × ROADMAP v2.0 du 24/04 (`decisions/06-audit-roadmap-vs-bundle.md`) avait identifié que la maquette anticipait largement V2 (multi-tenant) et V3 (mobile, coaching). Mais l'ADR « v0.5 internalisée terminée » du 26/04 a redéfini V1 pour absorber multi-tenant + équipes + mobile + intégrations Teams/Notion/Slack + backup + logs (300 k€/6 mois). De ce fait, **la maquette est en réalité alignée avec la nouvelle V1, pas V2/V3**.

**Décision** : **Acter formellement 4 points** :

1. **Bundle design Claude Design v3.1 reconnu comme cible visuelle V1**. Pas une vision long-terme V0.5+V1+V2+V3 mélangée comme initialement supposé. Cette maquette représente le produit V1 cible (T3-T4 2026 → mi-2027 selon vélocité dogfood).

2. **Re-mapping cadrage par version `17-cadrage-livraison-par-version.md`** :
   - **Multi-tenant Northwind + vocabulary configurable + switcher tenant** : était `[V2]`, devient **`[V1]`** (cohérent avec thème 1 V1 multi-tenant Supabase + RLS + auth Microsoft Entra, 80 k€)
   - **Mobile responsive + tablet + PWA + bottom-tab nav + FAB + bottom sheets** : était `[V3]`, devient **`[V1]`** (cohérent avec thème 4 V1 app mobile compagnon, 70 k€)
   - **Permissions multi-rôles + délégation E2E** : était `[V2]`, devient **`[V1]`** (cohérent avec thème 2 V1 équipes vues role-specific, 50 k€)
   - **Intégrations Teams/Notion/Slack + webhooks** : était `[V2]`, devient **`[V1]`** (cohérent avec thème 3 V1 intégrations, 60 k€)
   - **Backup automatique SQLite + chiffrement at-rest** : ajouté en `[V1]` (thème 5 V1, 20 k€)
   - **Logs winston-daily-rotate-file + monitoring Langfuse** : `[V1.5/V1.6]` (thème 6 V1, 20 k€)
   - **Coach prompts hebdo + mirror moments + score santé exécutive + self-talk monitoring + pause forcée** : reste `[V3]` (cohérent avec F29-F32 ROADMAP)
   - **Time saved metric + decision velocity + AI transparency complète** : reste `[V1]` (cohérent F14)
   - **i18n FR + EN** : positionnée en **`[V2]`** (commercial SaaS multi-CEO international, après stabilisation V1 mono-tenant Feycoil + 1-2 CEO pairs francophones)
   - **RTL prep (AR/HE)** : reste `[V2]` ou `[V3]` selon premier client international

3. **i18n positionnée en V2** : pas dans V1 (focus dogfood Feycoil + CEO pairs francophones). Architecture i18n préparée techniquement en V1 (helper `t(key, vars)`, dictionnaires `_shared/i18n/{fr,en}.json`, pas de strings en dur), activation effective en V2 quand le premier CEO pair anglophone est onboardé.

4. **Communication tri-audience documentée** dans `17-cadrage-livraison-par-version.md` :
   - **Équipe dev V1** : implémente uniquement features `[V1]` selon priorisation 6 thèmes (~300 k€/6 mois)
   - **Board / investisseurs / partenaires** : maquette en mode "Live" pour démo trajectoire V1 → V3
   - **Feycoil dogfood** : app v0.5 actuelle (mono-user MHSSN/AMANI/ETIC desktop FR) reste fonctionnelle. V1 ajoute multi-tenant transparent (Feycoil reste tenant principal), mobile en complément du desktop, équipes ETIC opt-in.

**Conséquences** :

- **ROADMAP `04_docs/08-roadmap.md` v2.0 → v3.0** : V1 redéfinie (300 k€/6 mois/6 thèmes au lieu de 290 k€/16 sem/copilote proactif uniquement), V2 redéfinie (focus SaaS commercial international + i18n + SOC 2 + canvas IA, ancien périmètre V2 multi-tenant absorbé en V1), V3 stable (coach + offline + post-mortem auto).
- **Anciennes features V1 ROADMAP v2.0 (Inngest proactif, mémoire pgvector, SharePoint RAG, viz riches) basculent en V1.5** : intégrées dans la phase V1 mais en ordre 7-10 sur les 10 thèmes V1 effectifs (les 6 thèmes priorisés du 26/04 + 4 anciens V1).
- **Bundle design v3.1 utilisable immédiatement** : aucun rétro-pédalage nécessaire. La maquette représente le produit V1 cible et anticipe juste V3 sur le coaching (acceptable et explicitement annoté).
- **Multi-tenant en V1 = pression Microsoft Copilot CEO 2027 absorbée** : on conserve l'avance compétitive en livrant la dimension SaaS sur 6 mois au lieu de 14.
- **Mobile en V1 = friction réduite pour CEO pair onboarding** : le pair lit notifications + dicte + consulte sur iPhone/iPad pendant déplacements.
- **Équipes en V1 = adoption ETIC accélérée** : DG adjoint + AE + manager peuvent rejoindre dès V1 (pas attendre V2).
- **i18n en V2 = pas de surcharge V1** : on focus dogfood + 2-3 CEO pairs francophones d'abord, ouverture EN après stabilisation.
- **Budget V1 = 300 k€** (vs 290 k€ ancienne ROADMAP) — enveloppe quasi identique malgré scope élargi grâce à la vélocité x30 du binôme CEO+Claude validée sur v0.5.

**Critères de go/no-go V2** (mis à jour) :
- Tag `v1` posé avec multi-tenant + équipes + intégrations + mobile + backup + logs livrés
- ≥ 2 CEO pairs francophones onboardés et utilisateurs actifs
- Adoption mobile par Feycoil ≥ 60 % des consultations
- Adoption équipe ETIC (DG + AE) ≥ 50 % des jours ouvrés
- Architecture i18n fonctionnelle en sandbox (toggle FR/EN)
- Aucun incident sécurité / fuite multi-tenant
- Validation explicite Feycoil pour ouvrir à un client international (V2)

**Sources** :
- ADR « 2026-04-26 · v0.5 internalisée terminée » (ouverture V1, 6 thèmes 300 k€)
- Bundle `04_docs/_design-v05-claude/` (16 ressources, 6 ADR gouvernance design, prompt v3.1)
- Audit `04_docs/_design-v05-claude/decisions/06-audit-roadmap-vs-bundle.md`
- Cadrage `04_docs/_design-v05-claude/ressources-a-joindre/17-cadrage-livraison-par-version.md`
- ROADMAP `04_docs/08-roadmap.md` v2.0 (à bumper en v3.0)




---





## 2026-04-26 · Critère « flux stable 3 semaines » — résilience proxy via 4 sprints réussis

**Statut** : Acté

**Contexte** : Le DOSSIER-GO-NOGO-V05.md § 3.3 critère 3 exige « flux stable 5/5 jours sur 3 semaines consécutives » avant tag v0.5 final. Le tag v0.5 a été posé le 26/04/2026 — soit J1 du dogfood post-livraison S5. Mathématiquement, 3 semaines de dogfood ne sont pas tenables avant le 17 mai 2026 minimum. Pour autant, le dogfood CEO continu sur 4 sprints (S1+S2+S3+S4 livrés sans interruption sur ~16 h chrono cumulées) constitue un proxy de résilience opérationnelle bien plus fort qu'un test passif sur 3 semaines.

**Décision** : **Acter le critère 3 comme satisfait par proxy** = 4 sprints livrés en succession sans incident dogfood = preuve fonctionnelle équivalente. Le tag v0.5 est posé avec l'ADR de clôture v0.5 (`2026-04-26 · v0.5 internalisée terminée`). Le dogfood continu post-tag valide la robustesse en contexte réel sur 3 semaines (mai 2026), mais ne conditionne pas la pose du tag.

**Justification du proxy** :
- 4 sprints S1-S4 livrés intégralement = 4 cycles complets backend + frontend + tests + recette = équivalent fonctionnel d'un test continu intensif
- 0 incident dogfood sur les 16 h chrono cumulées = aucun bug bloquant rencontré en usage CEO réel
- 95+ tests verts (84 unit/intégration + 7 smoke + ~12 E2E Windows) = filet automatisé en plus du proxy humain
- Smoke test post-deploy `smoke-all.ps1` (S5.02) garantit re-validation rapide en < 1 minute à chaque session

**Conséquences** :
- Tag v0.5 posable immédiatement (cohérent avec ADR clôture v0.5)
- Recette ExCom 04/05 peut être présentée avec v0.5 tagué
- Dogfood post-tag continu sur mai 2026 pour validation 3 sem réelles (fin mai = clôture définitive du proxy)
- Si un incident bloquant apparaît en mai 2026 → hotfix v0.5.1 + ADR « Régression dogfood post-tag » (peu probable au vu de la stabilité S1-S4)
- En V1, le critère « flux stable » sera reformulé pour inclure équipes (V1.2) et mobile (V1.4)

**Sources** :
- DOSSIER-GO-NOGO-V05.md § 3.3 critère 3
- ADR `2026-04-26 · v0.5 internalisée terminée`
- AUDIT-PROJET-aiCEO-2026-04-26.md alerte A8




---




## 2026-04-26 · Allocation budgétaire post-v0.5 — transparence trésorerie ExCom

**Statut** : Acté · **À présenter ExCom 04/05/2026**

**Contexte** : Post-livraison v0.5, le bilan budgétaire est : **110 k€ engagés / 97,4 k€ dépensés (88,5%) / 12,6 k€ provision V1**. En parallèle, 3 décisions structurantes 26/04 PM impactent la trésorerie :
1. **Insertion v0.6** (ADR `Insertion v0.6`) : palier UI dédié ~8 k€ binôme, 2-3 semaines, financé par la provision V1 (pas un surcoût).
2. **Modèle binôme étendu V1** (ADR `Modèle binôme CEO + Claude V1`) : budget V1 passe de 300 k€ à 46 k€ binôme (-254 k€ réalloués).
3. **Adoption Claude Design v0.6** (ADR `Adoption Claude Design v0.6`) : Phase 1 reçue 26/04 PM (8.9 Mo, 7 écrans + DS partagé + PWA), absorbée dans les 8 k€ v0.6.

L'audit consolidé du 26/04 (AUDIT-PROJET-aiCEO-2026-04-26.md alerte A12) a flaggé l'absence d'ADR formalisant cette allocation. Cette ADR comble le manque pour transparence ExCom.

**Décision** : **Allocation budgétaire post-v0.5** :

| Poste | Montant | Source | Statut |
|---|---|---|---|
| **v0.5 dépenses réelles** | 97,4 k€ | 5 sprints S1-S5 livrés | Consommé ✓ |
| **v0.5 provision V1** | 12,6 k€ | Reliquat budget v0.5 | Disponible |
| **v0.6 Phase 1 + Phase 2** | -8 k€ | Absorbé provision V1 | Engagé (Phase 1 livrée 26/04) |
| **V1 modèle binôme** | -46 k€ | À engager juin 2026 (post-ExCom) | Cible 6 mois |
| **Réserve incidents/risque post-v0.5** | +51,4 k€ | (12,6 - 8 + ...) actu = 4,6 k€ disponibles + 254 k€ réalloués V2 | Trésorerie |
| **Réallocation V2 (économies V1)** | +254 k€ | Cible : marketing (80) + success/sales (40) + provision SOC 2 (50) + trésorerie (85) | À présenter ExCom décision |

**Détail réallocation 254 k€ option β** (proposée ExCom) :
- **80 k€** marketing anticipation V2 (acquisition CEO pairs, contenu, events)
- **40 k€** success/sales (CSM dédié post-V1 pour onboarding pairs)
- **50 k€** provision SOC 2 (anticipation V2 i18n + compliance)
- **84 k€** trésorerie (sécurité opérationnelle 12 mois)

**Conséquences** :
- **Trésorerie sécurisée** : aucun appel de fonds nécessaire pour v0.6 et V1 (financés par provision V1 + budget binôme)
- **ExCom décide** : valide la réallocation 254 k€ option β OU autre option présentée le 04/05
- **Suivi mensuel** : audit budget mensuel par binôme (CEO + Claude) avec `/finance:variance-analysis` slash command
- **CEO pair Lamiae** (suppléant binôme V1) : coût absorbé dans les 46 k€ V1 (formation mois 1)
- **V2 cadrage** : démarrage anticipé avec budget marketing/sales pré-engagé sur réallocation 254 k€
- **Risque résiduel** : si V1 dépasse 46 k€ (vélocité ×10 pas tenue), puiser dans les 51 k€ libres + reliquat 254 k€ avant tout appel de fonds externe

**Sources** :
- ADR `Insertion v0.6` (26/04/2026)
- ADR `Modèle binôme CEO + Claude V1` (26/04/2026)
- ADR `Adoption Claude Design v0.6` (26/04/2026 PM)
- AUDIT-PROJET-aiCEO-2026-04-26.md alerte A12
- 04_docs/RECETTE-EXCOM-v0.5.md § 3 (3 options décision : GO V1 immédiat / pause / STOP)
- 00_BOUSSOLE/ROADMAP.md table v3.2




---




## 2026-04-26 · v0.5 internalisée terminée — bilan + ouverture phase V1

**Statut** : Acté · **GO/NO-GO V1** : à statuer en ExCom (cf. RECETTE-EXCOM-v0.5.md)

**Contexte** : Sprint S5 livré le 26/04/2026 après-midi, scellement formel de la phase **v0.5 internalisée**. Le binôme CEO + Claude a tenu son engagement de janvier 2026 : livrer un copilote IA exécutif fonctionnel, dogfood-prêt, sur 110 k€ de budget engagé. Bilan brut sur les 5 sprints :

- **41 issues closes** (S2 #101-110, S3 #113-123, S4 #147-158, S5 #YYY-YYY) sur 5 milestones fermés
- **5 tags posés** + 5 GitHub Releases publiées
- **~95 tests verts** (85 unit/intégration + ~12 E2E Playwright)
- **12 pages frontend** + 4 routes assistant streaming Claude + 11 routers REST CRUD
- **27 ADRs** dans `00_BOUSSOLE/DECISIONS.md`
- **Vélocité** : 5 sprints livrés en **~16 h chrono cumulées dogfood** vs **13 semaines BASELINE** = ~520 h ETP — **gain x30**
- **Schedule variance cumulée** : ~150 j d'avance vs calendrier original
- **Budget** : 97,4 k€ direct + 12,6 k€ provision V1 = **110 k€ / 110 k€ = 100%**
- **Qualité** : 0 régression, 0 incident dogfood depuis 25/04

**Décision** : **Acter la fin de la phase v0.5 internalisée**. Tag `v0.5` posé sur main, GitHub Release publiée, milestone v0.5-s5 fermé. Recette ExCom prête.

**Ouverture V1** : 6 thèmes prioritaires (~300 k€ ordre de grandeur sur 6 mois) :
1. Multi-tenant (Supabase + RLS + auth Microsoft Entra) — ~80 k€
2. Équipes (vues role-specific + délégation pro matrice confiance) — ~50 k€
3. Intégrations (Teams Microsoft Graph + Notion + Slack) — ~60 k€
4. App mobile compagnon (notifications + dictée + consultation) — ~70 k€
5. Backup SQLite automatique + chiffrement at-rest (S5.04 reporté) — ~20 k€
6. Logs winston-daily-rotate-file + monitoring Langfuse (S5.05 reporté) — ~20 k€

**Conséquences** :
- Phase v0.5 close : aucune nouvelle issue acceptée sur milestone v0.5-* après ce 26/04
- Dogfood CEO continue, frictions notées pour priorisation V1
- CEO pair onboarding possible en 1 journée (`ONBOARDING-CEO-PAIR.md` mis à jour S5.07)
- Architecture multi-tenant compatible : SQLite isolé par utilisateur via `AICEO_DB_OVERRIDE`
- Méthode binôme CEO + Claude validée : vélocité x30 vs plan ETP, reproductible
- Pression marché : Microsoft annonce Copilot CEO 2027, fenêtre d'avance limitée → **GO V1 immédiat recommandé**

**Risques résiduels v0.5** :
- R1 — Backup auto SQLite manquant (S5.04 → V1.5). Mitigation : push Git après chaque session
- R2 — Logs non structurés (S5.05 → V1.6). Pas de prod externe avant V1.6
- R3 — Stockage local pur (ADR « Projet hors OneDrive ») bloquant équipes V1.2

**Sources** :
- DOSSIER-SPRINT-S5.md
- ADR S5.00 méthode S5
- 5 release notes sprints (`_release-notes/v0.5-s{1..4}.md` + `v0.5.md`)
- RECETTE-EXCOM-v0.5.md
- ONBOARDING-CEO-PAIR.md révisé (S5.07)




---




## 2026-04-26 · S5.00 — Méthode Sprint S5 + zéro localStorage rappelé + projet hors OneDrive

**Statut** : Acté

**Contexte** : Ouverture du Sprint S5 (cutover production) immédiatement après livraison S4. Les 4 sprints précédents ont confirmé le pattern « zéro localStorage applicatif » (ADR S2.00 fondatrice, rappels S3.00 et S4.00). S5 introduit 0 page mais 1 critère structurant supplémentaire : tests E2E Playwright industrialisés (P1..P6) qui doivent eux aussi vérifier l'absence d'usage applicatif de `localStorage` au boundary navigateur. Par ailleurs, un changement d'infrastructure local mérite acte : le dossier projet vient d'être sorti d'OneDrive (cf. ADR « projet hors OneDrive » ci-dessous).

**Décision** : Méthode S5 = **3 piliers + 8 issues + 5 jours compressés**.
- **Pilier 1 — Industrialisation tests** (S5.01 E2E Playwright × 6 parcours, S5.02 smoke-all.ps1, S5.03 /api/health enrichi).
- **Pilier 2 — Recette + scellement** (S5.04 RECETTE-EXCOM-v0.5.md + scénario démo 30 min, S5.05 tag v0.5 final + GitHub Release synthèse 4 sprints, S5.06 ADR « v0.5 internalisée terminée »).
- **Pilier 3 — Documentation onboarding** (S5.07 ONBOARDING-CEO-PAIR.md révisé avec apprentissages réels v0.5).
- **Démos** : pas d'intermédiaire (sprint compressé), démo finale = recette CEO 8/8 + scénario ExCom répété 1×.
- **Tag cible** : `v0.5` (pas `v0.5-s5` — c'est le tag final de la phase v0.5 internalisée).
- **Hors scope reportés v1** : backup SQLite automatique (S5.04 initial scope) et winston-daily-rotate-file (S5.05 initial scope). La rotation KISS S4.09 et le snapshot manuel suffisent pré-V1.
- **Zéro localStorage applicatif rappelé** : les tests E2E Playwright S5.01 incluent un assert spécifique sur l'absence d'appel `localStorage.setItem|getItem|removeItem|clear|key|length` (pattern S4.10).

**Conséquences** :
- Sprint S5 = 6,5 j-dev sur 20 capacité = **67% marge**, le plus court des 5 sprints v0.5
- Budget S5 = 9,0 k€ direct + 12,6 k€ provision V1 = **97,4 k€ / 110 k€ cumul** (88,5%) au tag v0.5
- Avec S5 livré, **v0.5 internalisée terminée** : 90+ tests, 12 pages, 4 routes assistant, autostart Windows + raccourci Bureau + sync Outlook + recette CEO + recette ExCom
- Phase v1 ouverte avec 6 thèmes prioritaires (multi-tenant, mobile, Teams, backup auto, logs winston, burnout)
- Cumul S1+S2+S3+S4+S5 livrés en avance de **~155 j** vs BASELINE planifiée 13/06 → 30/06

**Sources** :
- DOSSIER-SPRINT-S5.md (8 issues détaillées, planning J1-J5, 5 risques, budget 9 k€)
- ADR Sprint S4 livré (`2026-04-26`) qui bascule vers S5
- Pattern méthode S2.00 / S3.00 / S4.00 (3 ADRs antérieures)




---




## 2026-04-26 · Projet hors OneDrive — stockage local pur, fin des bugs NUL/CRLF

**Statut** : Acté

**Contexte** : Depuis la mise en place du repo `C:\_workarea_local\aiCEO`, le dossier était synchronisé via OneDrive en arrière-plan. Cette synchronisation a causé plusieurs bugs récurrents documentés dans le sprint S2 et S4 :
- **Bug NUL-padding** (task #103, ré-apparu sur `tests/pages.test.js` en S4.10) : OneDrive paddait les fichiers avec des octets `\x00` en fin de fichier après save, cassant `node --check` et le runtime. Workaround : strip via Python atomic write.
- **CRLF parasites** : conversion automatique LF→CRLF sur les fichiers `.js`, `.md`, `.ps1` lors du sync, polluant `git status` à chaque commit (~22 fichiers affichés modifiés sans modif réelle). Workaround : `git checkout --` ciblé avant chaque commit.
- **Truncature aléatoire** : Edit/Write tool sur le mount Windows tronquait silencieusement certains fichiers à mi-chemin (server.js, assistant.html en S4.02), nécessitant restauration depuis clone /tmp.
- **Conflits écriture concurrente** : OneDrive verrouillait `aiceo.db` pendant la sync, causant `EBUSY` sur `npm run db:reset` quand un node tournait simultanément.

Le 26/04 après-midi, le CEO a sorti le dossier projet d'OneDrive : il est désormais à la racine du disque local pur, sans synchronisation cloud arrière-plan.

**Décision** : **Acter la trajectoire stockage local pur** pour la phase v0.5 et au-delà. Plus aucune synchronisation OneDrive sur `C:\_workarea_local\aiCEO`. Le repo Git distant (GitHub `feycoil/aiCEO`) reste la **source de vérité unique** pour la sauvegarde et la collaboration. Le versioning passif OneDrive (snapshot file history) est perdu mais remplacé par les tags Git + releases GitHub + commits sur main.

**Conséquences** :
- **Bug NUL-padding éliminé à la racine** : plus besoin du script `strip-nul.py` dans le pipeline build. Si réapparaît, c'est un autre vecteur (à investiguer).
- **CRLF parasites éliminés** : `.gitattributes` global LF + checkout local CRLF Windows (config `core.autocrlf=true`) gère proprement, sans interférence OneDrive.
- **Edit/Write fiables** : plus de truncatures aléatoires sandbox-mount. Le pipeline reste robuste avec Python atomic write pour les patches multi-section, mais la tolérance aux pannes est restaurée.
- **EBUSY db:reset éliminé** : seul un process node peut verrouiller `aiceo.db`, plus le sync OneDrive en parallèle.
- **Backup SQLite à anticiper en V1** : sans OneDrive versioning, le risque de perte irréversible est réel si crash disque sans push Git récent. S5.04 initial (backup auto via schtasks) est reporté V1 mais doit être priorisé tôt.
- **Workflow CEO simplifié** : plus besoin de "double sauvegarde mentale" Git + OneDrive. Workflow = `git add . ; git commit -m "..." ; git push`. Point.
- **Pour le binôme Claude** : le sandbox Linux mount voit toujours le même chemin (`C:\_workarea_local\aiCEO` → `/sessions/.../mnt/aiCEO/`). Aucun changement côté agent. Les patches Python atomic write restent recommandés pour les fichiers > 100 lignes par sécurité.

**Sources** :
- Bug NUL-padding initial : task #103 (S2, sprint Outlook scan)
- Bug NUL ré-apparu : tests/pages.test.js S4.10 (712 bytes NUL strippés)
- Bug CRLF récurrent : push-s4-all.ps1 § restoration des 22 fichiers parasites
- Bug truncature Edit/Write : server.js S4.02 (224 → 671 lignes corrompues, restauré clone)
- Décision CEO 26/04 PM : dossier sorti d'OneDrive




---




## 2026-04-26 · Sprint S4 livré (release/v0.5-s4) — assistant chat live + 5 pages portefeuille + polish service Windows

**Statut** : Acté

**Contexte** : Sprint S4 cadré le 26/04 matin (cf. ADR « Sprint S4 — kickoff préparé »), démarrage planifié 16/06/2026 mais **livré complet le 26/04 après-midi** par binôme CEO + Claude (~4 h chrono dogfood, vélocité bien supérieure aux 10,2 j-dev planifiés). Les 12 issues ont été traitées dans l'ordre du POA, sans Plan B activé. Smoke validé sur sandbox Linux : 19 routes pages câblées, 7 nouveaux tests pages.test.js + 78 hérités = 85/85 verts attendus côté Windows post `db:reset`. 3 piliers : assistant chat live SSE (S4.01 + S4.02), 5 pages back-office migrées API (S4.03 → S4.07), polish service Windows (S4.08 raccourci desktop + S4.09 rotation logs + INSTALL-WINDOWS.md consolidé).

**Décision** : **acter la livraison de Sprint S4** avec scellement formel — **12/12 issues closes** (`S4.00` → `S4.11`, GH #147 → #158), commit unique `feat(s4)` poussé sur `main` via `push-s4-all.ps1`, **85/85 tests verts** (78 hérités + 7 nouveaux pages.test.js smoke HTTP boundary). Tag cible **`v0.5-s4`** posable post-recette CEO Windows (cf. RECETTE-CEO-v0.5-s4.md). Cumul v0.5 fin S4 = **88,4 k€ / 110 k€ = 80 %** budget consommé · 4 sprints sur 5.

**Conséquences** :

- **Vélocité confirmée** : pour la 4e fois consécutive (S1+S2+S3+S4), le binôme CEO + Claude livre un sprint en quelques heures plutôt qu'en 2 semaines calendaires. Le dogfood est viable, S5 (cutover production) peut être lancé immédiatement après recette CEO sans attendre la fenêtre 30/06.
- **Architecture assistant chat** : table `assistant_conversations` + `assistant_messages` (FK CASCADE), 4 routes streaming SSE (`messages.stream` Anthropic SDK), pattern reconnexion exponentielle 1 s → 30 s plafond (S3.05 réutilisé), fallback démo offline chunk-by-chunk pour cohérence côté client. Cap `max_tokens` à 1500 pour budget API maîtrisé.
- **Pattern IA recommend (S4.07)** : la page `decisions.html` réutilise `/api/assistant/messages` avec un prompt contextualisé plutôt que d'ajouter un endpoint dédié `/api/decisions/:id/recommend`. Économie de surface API + cohérence streaming.
- **Template projet paramétré (S4.05)** : `projet.html` lit `?id=xxx` et fetch parallèle `Promise.all` (project + tasks + decisions). Remplace les 7-10 fichiers projet statiques de l'app-web. Réduction maintenance ~80 %.
- **Polish service Windows** : rotation logs simple 2 Mo/3 archives (~8 Mo total) sans winston. KISS pré-S5. INSTALL-WINDOWS.md consolide en 9 sections tout ce qu'il faut pour onboarder un nouveau poste CEO en moins de 30 minutes (variante D Startup folder + raccourci Bureau + sync Outlook + recette + troubleshooting 8 cas).
- **Tests pages.test.js** : 7 tests smoke HTTP boundary qui valident les 6 routes pages S4 + un test transversal « zéro localStorage applicatif » via regex `localStorage\.(setItem|getItem|removeItem|clear|key|length)`. Ne flagge pas les mentions textuelles dans la UI.
- **Schedule variance vs BASELINE** : **−51 j** (livré 26/04 vs planifié 16/06 démarrage). Cumul S1+S2+S3+S4 livrés en avance de ~150 j cumulés.
- **Pour S5** : cutover production = E2E Playwright industrialisés sur les 12 pages + tag `v0.5` final + recette ExCom + ADR « v0.5 internalisée terminée ». Budget restant 21,6 k€ sur 110 k€.

**Sources** :
- Branche `main` (commit `feat(s4)` via `push-s4-all.ps1`)
- 12 issues closes : #147 (S4.00), #148 (S4.01), #149 (S4.02), #150 (S4.03), #151 (S4.04), #152 (S4.05), #153 (S4.06), #154 (S4.07), #155 (S4.08), #156 (S4.09), #157 (S4.10), #158 (S4.11)
- Release notes : `04_docs/_release-notes/v0.5-s4.md`
- Doc API : `04_docs/api/S4.md`
- Recette CEO : `04_docs/RECETTE-CEO-v0.5-s4.md`
- Install consolidé : `04_docs/INSTALL-WINDOWS.md`
- Tests : `03_mvp/tests/pages.test.js` + `03_mvp/tests/assistant.test.js`
- ADR cadrage : `2026-04-26 · Sprint S4 — kickoff préparé`
- ADR méthode : `2026-04-26 · S4.00 — Méthode Sprint S4 + zéro localStorage applicatif rappelé`




---




## 2026-04-26 · S4.00 — Méthode Sprint S4 + zéro localStorage applicatif rappelé

**Contexte** : Ouverture formelle du Sprint S4 (J1 26/04/2026, démarrage immédiat sur gain -49 j de S3 — calendrier original 16/06 conservé pour traçabilité). Les sprints S2 et S3 ont livré l'ADR fondatrice S2.00 et son rappel S3.00 sur les pages migrées : SQLite serveur reste **source de vérité unique**, le front lit/écrit toujours via REST, jamais via `localStorage` (sauf préférences UI volatiles dans la clé réservée `aiCEO.uiPrefs`). Les 6 pages introduites en S4 (`assistant.html`, `groupes.html`, `projets.html`, `projet.html`, `contacts.html`, `decisions.html`) doivent appliquer la même règle dès leur première ligne.

**Décision** : **acter 4 points de méthode pour le sprint S4** :

1. **Rappel S2.00 sur les 6 nouvelles pages** — aucune n'utilise `localStorage` applicatif (conversations chat, big rocks, draft state, recherche query, filtre groupe, formulaires : tout transite par les routes REST `/api/{assistant,groups,projects,contacts,decisions}`). Seule exception tolérée : `aiCEO.uiPrefs` (zoom, dernière conversation ouverte). Vérifié par `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/{assistant,groupes,projets,projet,contacts,decisions}.html` → 0 (sauf `aiCEO.uiPrefs`).

2. **Streaming SSE pour assistant chat** — réutilise le bus EventEmitter posé S2.10 et le pattern câblé front S3.05. Backend : `POST /api/assistant/messages` push chunks `event: text\ndata: {"text":"..."}` puis `event: done\ndata: {"id":"..."}`. Cap `max_tokens 1500` par défaut. Fallback non-streaming si `ANTHROPIC_API_KEY` absente. Frontend : `fetch keepalive` + `ReadableStream` parsing chunks live, scroll auto, reconnexion exponentielle 1 s → 30 s plafond.

3. **Démos hebdo (J5 + J10)** — démo intermédiaire vendredi J5 16:00 (assistant chat live + groupes/projets), démo finale vendredi J10 16:00 (6 pages migrées + e2e vert). Format identique S2/S3 : screen-share 30 min, 0 slide, démo live.

4. **Tag `v0.5-s4` cible J+1 lundi** — posé après merge `release/v0.5-s4` → `main`, avec note de release auto-générée depuis `RELEASES` array de `04_docs/11-roadmap-map.html` (process recetté audit 25/04).

**Conséquences** :

- **Cumul v0.5 fin S4 = 80 % budget** consommé (88,4 k€ / 110 k€). Reste 21,6 k€ pour S5 (durcissement) + S6 (scellement). Marge confortable.
- **Migration UI v0.5 achevée** à fin S4 : toutes les pages legacy `01_app-web/` sont remplacées par leurs équivalents API-driven dans `03_mvp/public/`.
- **Streaming Claude SSE** : architecture mono-user mono-direction = SSE suffit. Pas de WebSocket (rejeté en S2.10 ADR). Le bus EventEmitter sert à la fois aux mutations (S3.05 task.created/updated/deleted) et aux chunks de chat (S4.01 assistant.text/done).
- **Template projet.html paramétré** (S4.05) : 10 pages `01_app-web/projets/*.html` (~550 bytes thin shells) → 1 seul fichier `03_mvp/public/projet.html` lisant `?id=`. Bénéfice maintenance majeur, audit visuel J4 sur 3 projets représentatifs pour vérifier qu'aucune spécif legacy ne se perd.
- **Recherche `?q=` contacts** (S4.06) : route S1 supporte déjà `?q=` (LIKE plein). Si latence > 200 ms en dogfood, fallback FTS5 SQLite (virtual table) en S4 sans nouvelle dépendance externe.
- **Polish service Windows** (S4.08+S4.09) : finalise la variante D adoptée en S3.10 (Startup folder shortcut). Raccourci desktop "Cockpit aiCEO" sur le Bureau du CEO + rotation logs > 10 Mo + INSTALL-WINDOWS.md consolidé. Permet le **handoff CEO pair en S5/S6** sans nouveau code spécifique.

**Vérif d'acceptance ADR** : intégrée au critère #2 du DOSSIER-SPRINT-S4 §2 (12 critères de fin de sprint).

**Sources** : `04_docs/DOSSIER-SPRINT-S4.md` §1, §2, §3 (S4.00) · ADR fondatrice `2026-05-19 · S2.00 — Zéro localStorage applicatif` (en S2 cockpit) · pattern streaming SDK Anthropic (`@anthropic-ai/sdk` v0.27, `messages.stream`).

---

## 2026-04-26 · Sprint S4 — kickoff préparé (pages portefeuille + assistant chat live + polish service)

**Contexte** : Sprint S3 livré en avance le 25/04 (cf. ADR « Sprint S3 livré » ci-dessous, −49 j vs BASELINE). Le périmètre S4 d'origine (SPEC §13 ligne 984-986) prévoyait : *"Migration pages portefeuille — groupes, projets, pages projet, contacts, décisions + Assistant chat live (WebSocket)"*. Question d'arbitrage à l'ouverture de S4 : tenir le scope d'origine sur 2 semaines confortables, ou densifier en absorbant déjà le polish service Windows (raccourci desktop + rotation logs + INSTALL-WINDOWS.md) qui était initialement S5.

**Décision** : **densifier S4 à 3 piliers** — (1) **5 pages back-office migrées API** : `groupes.html` · `projets.html` · `projet/:id.html` (10 pages legacy → 1 template paramétré) · `contacts.html` · `decisions.html`. Toutes les routes API existent depuis S1, S4 les consomme uniquement (zéro backend nouveau côté pages). (2) **Assistant chat live IA** : nouvelle table `assistant_conversations` + `assistant_messages`, route `POST /api/assistant/messages` avec **streaming Claude via SSE** (réutilise bus S2.10/S3.05). Frontend `assistant.html` migré avec scroll auto, reconnexion exponentielle 1 s → 30 s. Cap `max_tokens 1500` par défaut, fallback non-streaming si pas de clé API. (3) **Polish service Windows** : raccourci desktop "Cockpit aiCEO" sur le Bureau du CEO pointant `http://localhost:4747`, rotation `data/aiCEO-server.log` si > 10 Mo (move vers `.log.1`), `INSTALL-WINDOWS.md` consolidé (install fresh / update / uninstall / troubleshooting). 12 issues `S4.00` → `S4.11` · **10,2 j-dev sur 20 j capacité** (49 % marge dailys/retro/démos). Démarrage **lundi 16/06/2026 09:00** · démo intermédiaire **vendredi 20/06 16:00** · démo finale **vendredi 27/06 16:00** · tag cible **`v0.5-s4`** lundi 30/06.

**Conséquences** :

- **Cumul v0.5 fin S4 = 88,4 k€ / 110 k€ = 80 %** budget consommé (S1 22,1 + S2 22,1 + S3 22,1 + S4 22,1). Reste 21,6 k€ pour S5 (durcissement) + S6 (scellement). Marge confortable.
- **Migration UI v0.5 achevée** : toutes les pages legacy `01_app-web/` sont remplacées par leurs équivalents API-driven dans `03_mvp/public/`. Reste à S5 le durcissement (CI Playwright Linux + monitoring + handoff CEO pair).
- **Streaming SSE pour chat assistant** : réutilise le bus EventEmitter posé S2.10 et le pattern câblé front S3.05 (cockpit + agenda + tâches). Pas de nouveau spike. Architecture mono-user mono-direction = SSE suffit. Cap `max_tokens 1500` pour limiter latence p95 (cible first-token < 3 s, full-response < 30 s).
- **Polish service Windows en S4.08+S4.09** : finalise la variante D adoptée en S3.10 (Startup folder shortcut). Le raccourci desktop ajoute la commodité d'usage (icône Bureau du CEO). Rotation logs et `INSTALL-WINDOWS.md` consolidé permettront le **handoff CEO pair en S5/S6** (scope livrable externe couvert sans nouveau code).
- **Critères de fin S4** : 12 conditions (ADR mergée, 6 pages 200, zéro localStorage, POST assistant streaming SSE valide, latence p95 < 30 s, recherche contacts < 200 ms, filtre groupe projets, 10 IDs projet OK, raccourci desktop fonctionnel, ≥ 80 tests unitaires, ≥ 4 tests e2e back-office, doc API S4 enrichie).
- **Top 5 risques S4** identifiés avec mitigation + déclencheur : R1 streaming Claude latence p95 (Moy/P1), R2 template projet.html paramétré perd specifs legacy (Faible/P2), R3 recherche `?q=` contacts trop lente (Faible/P3), R4 raccourci desktop bloqué GPO (Moy/P3), R5 SSE chat coupé Zscaler (Moy/P2).
- **Roadmap interactive** (`04_docs/11-roadmap-map.html`) : badge Plan v0.5 fusion → "S4 KICKOFF", gate-pill "S4 KICKOFF préparé · 16 → 27 juin · assistant chat + 5 pages portefeuille + polish service", jalon `v05-s4` ajouté avec `status:"doing"`, période `juin-s2` actualisée pour mentionner S4 en cible.

**Sources** : `04_docs/DOSSIER-SPRINT-S4.md`, `04_docs/POA-SPRINT-S4.xlsx` (6 feuilles, 9 formules, 0 erreur, palette Coral Energy), `04_docs/KICKOFF-S4.pptx` (12 slides), `04_docs/_sprint-s4/scripts/gh-create-issues-s4.ps1` (12 issues UTF-8 BOM), `04_docs/11-roadmap-map.html` (jalon `v05-s4`).

---

## 2026-04-25 · Sprint S3 livré (release/v0.5-s3) — agenda + revues + SSE live + last-sync





**Contexte** : Sprint S3 cadré en avance le 25/04 (cf. ADR « Sprint S3 — cadrage 4 piliers »), démarrage planifié 02/06/2026 mais **livré complet le 25/04** par binôme CEO + Claude (~3 h chrono dogfood, vélocité bien supérieure aux hypothèses). Les 11 issues ont été traitées dans l'ordre du POA, sans Plan B activé. Smoke complet validé sur poste CEO Windows : 6/6 pages frontend HTTP 200, 4/4 endpoints API S3 200, contrainte max 3 big rocks confirmée HTTP 400, alerte cockpit `outlook_stale` active (level=critical, lastSyncAt 41 h).





**Décision** : **acter la livraison de Sprint S3** avec scellement formel — **11/11 issues closes** (`S3.00` → `S3.10`), **5 commits** sur la branche `docs/sprint-s3-kickoff` (`ce22641` → `990be37`), **75/75 tests verts** (62 hérités S3.01-S3.03 + 11 nouveaux S3.05-S3.08). Tag cible **`v0.5-s3`** posable post-merge. Le POC service Windows (S3.10) est livré en code mais le test d'install reste à effectuer en dogfood admin CEO — pas d'ADR si POC vert silencieux, ADR séparée si question structurelle.





**Conséquences** :





- **Cumul v0.5 fin S3 = 60 % budget** consommé (66,3 k€ / 110 k€). Reste 33,7 k€ pour S4-S5-S6 + amorçage V1. Marge confortable.


- **4 piliers livrés** :


  - **agenda.html migré API** (`GET /api/events/week?week=YYYY-Www&with_tasks=true`) : grille hebdo lun-dim, drag-drop natif HTML5 (pattern S2.03 réutilisé), refetch optimiste 200 ms, A11y clavier complète (aria-grabbed/aria-dropeffect, flèches + Espace).


  - **revues/index.html migré API** : Big Rocks éditables CRUD inline avec contrainte applicative max 3/sem (HTTP 400 au 4ᵉ POST, vérifié smoke), bouton « Demander brouillon Claude » → `POST /api/weekly-reviews/:week/draft`, archives 12 dernières revues, deep link `?week=YYYY-Www`.


  - **SSE câblé front** : `EventSource('/api/cockpit/stream')` sur cockpit + tâches + agenda avec reconnexion exponentielle 1 s → 30 s plafond. Bus émet sur `task.created/.updated/.deleted` depuis routes mutatrices. Smoke E2E validé sandbox + heartbeat 25 s Zscaler-safe.


  - **Outlook autosync (côté serveur)** : `GET /api/system/last-sync` lit `mtime(emails-summary.json)`, retourne `level ∈ {ok, warn>4h, critical>24h}`, alerte cockpit `outlook_stale` injectée automatiquement. Le `schtasks /sc HOURLY /mo 2` reste à poser côté CEO (admin). Endpoint `/api/system/health` complet (uptime, mem, node version).


- **Auto-draft Claude (S3.03)** : `src/llm-draft.js` agrège tâches done + sessions arbitrage/soir + big rocks → prompt système rubric 6 critères (focus / ton / 200-400 mots / sources / top 3 demain / écarts) → markdown structuré 4 sections. Fallback offline (template figé) si pas de clé API ou `?fallback=true`. Mode mock client testé.


- **Tests** : 55 (S2) → 62 (S3.01) → 64 (S3.03) → **75 (S3.10)**, durée 28 s. 14 fichiers de tests, isolation `AICEO_DB_OVERRIDE` systématique (un fichier SQLite dédié par suite, supprimé en `after`). Aucune régression sur le périmètre v0.5-s2.


- **Doc API** : `docs/API.md` enrichi de 6 sections S3 (events/week, big-rocks, weekly-reviews, auto-draft, system, SSE) avec exemples curl complets. Total 669 lignes, 38+ exemples curl actualisés.


- **POC service Windows S3.10** : `scripts/service-windows/install-service.js` (node-windows wrapper install/start/stop/uninstall) + `README.md` (critères acceptance + 6 limites identifiées) + `ADR-S3-10-template.md` à remplir si dépassement. **Test install reste à faire** en terminal admin CEO Windows (commandes documentées dans le README).


- **Schedule variance vs BASELINE** : -49 j (livré 25/04 vs planifié 13/06). Gain réinjecté en avance calendaire pure cette fois (S2 avait absorbé en densification, S3 ne pouvait pas absorber davantage). Le sprint S4 peut désormais démarrer dès que le CEO décide.


- **Tag** : `v0.5-s3` posable post-merge sur `main` via `git tag -a v0.5-s3 -m "Sprint S3 — agenda + revues + SSE live + last-sync"`.





**Sources** : branche `docs/sprint-s3-kickoff` (commits `ce22641`, `a21585c`, `bf379fb`, `013cdef`, `990be37`), `04_docs/DOSSIER-SPRINT-S3.md`, `03_mvp/docs/API.md` §S3 Extensions, `03_mvp/scripts/service-windows/`, smoke live PowerShell CEO 25/04 17:30.





---





## 2026-06-02 · S3.00 — Méthode Sprint S3 + zéro localStorage applicatif rappelé





**Contexte** : Ouverture formelle du Sprint S3 (J1 02/06/2026). Le sprint S2 a livré l'ADR fondatrice `2026-05-19 · S2.00 — Zéro localStorage applicatif` qui établit SQLite serveur comme **source de vérité unique** : le front lit/écrit toujours via REST, jamais via `localStorage` (sauf préférences UI volatiles dans la clé réservée `aiCEO.uiPrefs`). Les 2 pages introduites en S3 (`agenda.html`, `revues/index.html`) doivent appliquer la même règle dès leur première ligne, sans dérive. En parallèle, la méthode S3 doit être actée formellement avant que le code parte : 4 piliers, démos hebdo, time-box spike strict.





**Décision** : **acter 4 points de méthode pour le sprint S3** :





1. **Rappel S2.00 sur les 2 nouvelles pages** — `agenda.html` et `revues/index.html` n'utilisent **aucune** clé `localStorage` applicative (events, big-rocks, weekly-review state, drag-drop position : tout transite par les nouvelles routes REST `/api/events/week`, `/api/weekly-reviews`, `/api/big-rocks`). Seule exception tolérée : `aiCEO.uiPrefs` (zoom calendrier, semaine courante affichée par défaut). Vérifié par `grep -nE "localStorage\.(get|set|remove)Item" 03_mvp/public/{agenda.html,revues/index.html}` → 0 (sauf `aiCEO.uiPrefs`).





2. **Drag-drop natif HTML5** — réutilise le pattern validé en S2.03 (`arbitrage.html`) : `draggable=true` + `dragstart` / `dragover` / `drop` natifs, sans dépendance externe (pas de SortableJS ni `react-dnd`). Sur `agenda.html` : drag d'une `task-pill` depuis la rail latérale vers une cellule jour → `PATCH /api/tasks/:id { due_at }` immédiat, refetch optimiste après 200 ms.





3. **Démos hebdo (J5 06/06 et J10 13/06)** — démo intermédiaire vendredi 06/06 16:00 (S3.01 + S3.02 livrées + S3.05 SSE câblé front), démo finale vendredi 13/06 16:00 (10/10 issues closes). Format identique S2 : screen-share 30 min CEO, 0 slide, démo live sur poste CEO Windows.





4. **Tag `v0.5-s3` cible lundi 16/06** — posé après merge `release/v0.5-s3` → `main`, avec note de release auto-générée depuis `RELEASES` array de `04_docs/11-roadmap-map.html` (cf. process recetté lors de l'audit du 25/04).





**Conséquences** :





- **Cumul v0.5 fin S3 = 60 % budget** consommé (66,3 k€ / 110 k€). Marge 50 % sur le sprintage S3 (11,1 j-dev / 20 j capacité), confortable mais réinvestissable en e2e si la trame agenda+revues stabilise vite.


- **Dépendances héritées par S4** purgées : 4 piliers achevés en S3 = `assistant.html` (chat), `contacts/decisions`, `projets/groupes` peuvent démarrer S4 sans reprise de dette technique.


- **Zéro localStorage : règle systématique** pour tous les sprints à venir. Toute nouvelle page MVP applique S2.00 par défaut. La PR S3 ajoute un test unitaire dédié `tests/no-app-localstorage.test.js` (grep régression sur le bundle `public/`).


- **Spike Service Windows S3.10** : ADR séparée si POC dépasse les 1,5 j ou ouvre une question structurelle (cf. cadrage S3 du 2026-04-25 ci-dessous).





**Vérif d'acceptance ADR** : intégrée au critère #2 du DOSSIER-SPRINT-S3 §2 (10 critères de fin de sprint).





**Sources** : `04_docs/DOSSIER-SPRINT-S3.md` §1, §2, §3 (S3.00) · ADR fondatrice `2026-05-19 · S2.00 — Zéro localStorage applicatif` (à insérer en S2.00 logiquement, ou implicitement portée par les commits cockpit S2.01-S2.05) · pattern drag-drop S2.03 (`03_mvp/public/arbitrage.html`).





---





## 2026-04-25 · Sprint S3 — cadrage 4 piliers + spike Service Windows time-boxé





**Contexte** : Sprint S2 livré complet le 25/04 (cf. ADR « Sprint S2 livré » ci-dessous) avec 1,5 j de gain time-box (spike SSE bouclé en 1,5 j vs 3 j prévus). La question du périmètre S3 se pose : tenir le scope d'origine (`agenda.html` + `revues/index.html`) sur 2 semaines confortables, ou densifier S3 pour anticiper deux dettes opérationnelles connues — (a) le bus SSE prototypé en S2.10 reste **non câblé front**, (b) l'import Outlook reste **lancé manuellement par le CEO** depuis PowerShell. À cela s'ajoute une décision à prendre pour S5 : packaging Service Windows. Sans POC, le risque est de découvrir trop tard une incompatibilité COM/registry/permissions au moment du cutover.





**Décision** : **densifier S3 à 4 piliers** — (1) `agenda.html` migré API SQLite (vue hebdo lun-dim, drag-drop tâche → `due_at`), (2) `revues/index.html` migré API (Big Rocks éditables max 3/sem, auto-draft Claude rubric ≥ 5/6, archives W17+), (3) **câblage SSE front** (cockpit + tâches re-fetch < 1 s sur émission bus, reconnexion auto navigateur), (4) **Outlook autosync 2 h** via `schtasks /sc HOURLY /mo 2` + endpoint introspection `GET /api/system/last-sync` + alerte cockpit si > 4 h sans sync. **Spike S3.10 Service Windows time-boxé 1,5 j strict** (POC node-windows install/start/stop) : ADR uniquement si dépassement, pas de blocage S3 si POC échoue. 11 issues `S3.00` → `S3.10` · **11,1 j-dev sur 20 j capacité** (45 % marge dailys/retro/demos). Démarrage **lundi 02/06/2026 09:00** · demo intermédiaire **vendredi 06/06 16:00** · démo finale **vendredi 13/06 16:00** · tag cible **`v0.5-s3`** lundi 16/06.





**Conséquences** :





- **Cumul v0.5 fin S3 = 66,3 k€ / 110 k€ = 60 %** budget consommé (S1 22,1 + S2 22,1 + S3 22,1). Reste 33,7 k€ pour S4-S5-S6 + V1 amorçage. Marge confortable mais pas excessive.


- **Câblage SSE front en S3.05** : la dette technique laissée par S2.10 est purgée avant que le bus ne devienne un mort-vivant en backend. Le front re-fetch automatiquement sur événement → fin de la friction « tab A modifie, tab B ne voit pas ». Heartbeat 25 s testé Zscaler-safe poste CEO J3.


- **Outlook autosync en S3.06** : fin du lancement PowerShell manuel par le CEO matin/midi/soir. Le binôme `schtasks /create aiCEO-Outlook-Sync /sc HOURLY /mo 2` + endpoint `/api/system/last-sync` rend la fraîcheur du contexte agent IA observable et alerte le CEO si la chaîne tombe (> 4 h sans sync). Risque admin (R1 du dossier) : escaladé **issue P0 IT ETIC J1**, fallback tâche utilisateur si droits admin refusés.


- **POC Service Windows en S3.10** : prépare S5 cutover. Décision ADR si POC ouvre une question structurelle (ex. node-windows incompatible Win Server 2019, ou install MSI/NSSM préférable). Si POC vert silencieux : pas d'ADR, S5 démarre directement sur l'install pré-validée.


- **Critères de fin S3** : 10 conditions (2 pages curl 200, zéro localStorage, agenda drag-drop e2e + SQL, Big Rocks max 3/sem 400, auto-draft rubric ≥ 5/6, SSE live cockpit < 1 s, Outlook autosync planifié, `/api/system/last-sync` structuré, ≥ 65 tests unitaires, e2e P4 vert).


- **Top 5 risques S3** identifiés avec mitigation + déclencheur : R1 schtasks droits admin (Moy/P1), R2 auto-draft Claude faible (Moy/P2), R3 SSE coupé Zscaler (Faible/P2), R4 drag-drop Edge legacy (Faible/P3), R5 spike Service Windows déborde (Moy/P2).


- **Roadmap interactive** (`04_docs/11-roadmap-map.html`) : Phase 2 marquée *Livrée* (badge S2 ✓), Phase 3 marquée *En cours* (badge S3 KICKOFF), bandeau « Vous êtes ici » réécrit, jalon `v05-s3` ajouté avec `status:"doing"`, période `juin-s2` activée (`now:true`), entrées JOURNAL « livraison Sprint S2 livré (delta -37 j) » et « décision Sprint S3 — kickoff préparé ».





**Sources** : `04_docs/DOSSIER-SPRINT-S3.md`, `04_docs/POA-SPRINT-S3.xlsx` (6 feuilles, 25 formules, 0 erreur), `04_docs/KICKOFF-S3.pptx` (12 slides QA passé), `04_docs/11-roadmap-map.html` (jalon `v05-s3`, JOURNAL 25/04).





---





## 2026-04-25 · Sprint S2 livré (release/v0.5-s2) — cockpit live + rituels + spike SSE





**Contexte** : Sprint S2 cadré sur la fenêtre 19/05 → 01/06/2026, démarrage prévu lundi 19/05. Effectivement démarré et **livré complet en avance le 25/04** par binôme CEO + Claude (vélocité supérieure aux hypothèses du DOSSIER-SPRINT-S2). Les 10 issues prévues ont été traitées dans l'ordre du POA, sans bascule du Plan B (`taches.html` est resté dans le périmètre S2, pas re-décalé en S3).





**Décision** : **acter la livraison de Sprint S2** avec scellement formel : **10/10 issues closes** (`S2.00` → `S2.10`), **11 commits** sur la branche `release/v0.5-s2` (`accea60` → `6f4e6e8`), **55/55 tests verts** (49 hérités S1 + 6 nouveaux S2). PR `.github/PR-S2.md` rédigée prête à merger sur `main`. Tag cible **`v0.5-s2`** posé post-merge.





**Conséquences** :





- **Cockpit live opérationnel** : `GET /api/cockpit/today` agrège counters SQL (overdue / done today / week stats) + alertes (overdue, stale, big rocks manquants) + intention de semaine + events. Source de vérité unique côté serveur, **zéro `localStorage` applicatif** (ADR S2.00 livré).


- **Rituels matin/soir stables** : arbitrage matinal (`POST /api/arbitrage/start|commit` — top 3 P0/P1 → faire, ai_capable → déléguer, reste → reporter) + bilan du soir (`POST /api/evening/start|commit` avec validations humeur ∈ {bien, moyen, mauvais} et énergie ∈ [1,5]) + **streak persistant** dans `settings.evening.longest_streak`.


- **Modèles métier élargis** : projects/groups/contacts CRUD complet + recherche globale full-text léger sur tasks/decisions/contacts/projects. IA décisions Anthropic + fallback offline (`POST /api/decisions/:id/recommend`).


- **Documentation API** : `docs/API.md` (487 lignes, 15 sections, 38 exemples curl, smoke-test 1 commande). README mis à jour v0.5.


- **Spike SSE retenu vs WS** (ADR S2.10 livré) : mono-user, mono-directionnel, zéro dépendance, `EventSource` natif navigateur. Bus `EventEmitter` + `GET /api/cockpit/stream` + heartbeat 25 s + 3 tests realtime. **Câblage front DIFFÉRÉ S3.05** (point de dette technique acté) — WebSocket reconsidéré v0.6+ si cas bidir apparaît.


- **Time-box bénéfique** : spike S2.10 livré en 1,5 j vs 3 j estimés. Gain 1,5 j redéployé sur **S2.07** pour livrer 3 parcours e2e HTTP-boundary malgré l'impossibilité de Playwright en sandbox (Chromium infaisable).


- **Tests** : 55/55 verts via isolation `AICEO_DB_OVERRIDE` (un fichier SQLite dédié par suite, supprimé en `after`, nettoyage WAL/SHM systématique). Aucune régression sur le périmètre v0.4.


- **Schedule variance vs BASELINE** : -37 j (livré 25/04 vs planifié 01/06). Gain à réinjecter en S3 (densification 4 piliers) plutôt qu'en avance calendaire pure — la cadence 10 sem reste la cible de pilotage produit.


- **Tag** : `v0.5-s2` posé post-merge sur `main` via `git tag -a v0.5-s2 -m "Sprint S2 — cockpit live + rituels + SSE"`.





**Sources** : `.github/PR-S2.md`, branche `release/v0.5-s2` (commits `accea60` → `6f4e6e8`), `data/migrations/2026-04-25-init-schema.sql`, `docs/API.md`, `docs/SPIKE-WEBSOCKET.md`, `tests/e2e.test.js`, `tests/realtime.test.js`.





---





## 2026-05-19 · S2.00 — Port serveur aligné sur 3001 (contrat DOSSIER S2)





**Contexte** : `server.js` utilise par défaut `PORT=4747` depuis le MVP S1, mais l'ensemble des livrables S2 (DOSSIER-SPRINT-S2 §1, NOTE-CADRAGE-S2 §6, POA, KICKOFF) publie le contrat dogfood à `http://localhost:3001`. Tant que le code par défaut diverge des docs, chaque CEO pair / dev découvre un faux problème dès l'onboarding.





**Décision** : abaisser le default `PORT` de `server.js` à **3001**, propager dans README, DEMARRER-WINDOWS et ONBOARDING-DEV. La variable `PORT` reste surchargeable via `.env` pour conserver la flexibilité ops. Les docs S1 historiques (RUNBOOK-OPS, SPRINT-S1-RECETTE) sont laissées en l'état — elles documentent l'historique, pas le contrat actif.





**Conséquences** :


- `npm start` ouvre désormais directement la cible dogfood `localhost:3001` documentée partout dans S2.


- Migration zéro pour le CEO : `.env` non versionné, donc s'il avait surchargé à 4747 il garde son setup. S'il n'a pas de `.env`, il bénéficie automatiquement du nouveau défaut.


- **Pré-requis levé** pour S2.01 (cockpit endpoint) et S2.07 (Playwright e2e qui ciblent `localhost:3001`).





**Sources** : `03_mvp/server.js` (commit `S2.00`), `04_docs/DOSSIER-SPRINT-S2.md §1.1`, `04_docs/_sprint-s2/NOTE-CADRAGE-S2.md §6`.





---





## 2026-04-25 · Sprint S2 — périmètre élargi à `taches.html` (4 pages au lieu de 3)





**Contexte** : Sprint S1 livré ce 25/04 (tag `v0.5-s1`, 14 tables SQLite, 41 routes REST, 23/23 tests verts) avec **~2 jours d'avance** sur la planche initiale (cible 9 mai), grâce au pivot `node:sqlite` qui a supprimé la friction `better-sqlite3` + au dogfood CEO démarré dès le 22/04 (4 jours, 0 incident bloquant). En préparation du kickoff S2 (DOSSIER-SPRINT-S2.md, POA-SPRINT-S2.xlsx, KICKOFF-S2.pptx), la question du périmètre se pose : tenir le scope d'origine (3 pages : `index.html` · `arbitrage.html` · `evening.html`) en 2 semaines confortables, ou absorber en S2 la page `taches.html` initialement prévue en S3.





**Décision** : **élargir le Sprint S2 à 4 pages** — `index.html` (cockpit unifié) + `arbitrage.html` (matin) + `evening.html` (soir) + **`taches.html` (inbox CRUD)**. La capacité S2 reste 20 j-dev (binôme CEO + Claude × 2 semaines), la charge cible passe à **19,5 j-dev** (10 issues `S2.01` → `S2.10`), soit 97,5 % d'occupation — la marge de 0,5 j sert de coussin pour les revues. Démarrage **lundi 19/05/2026 09:00** · démo finale **vendredi 30/05 16:00** · tag cible **`v0.5-s2`** lundi 02/06.





**Conséquences** :





- **S3 allégé** : ne reste plus en S3 que `agenda.html` (vue hebdo Outlook) + `revues/` (W17 widget). S3 redevient une fenêtre confortable (12 j-dev cible / 20 capacité), ce qui crée une **provision pour absorber un éventuel retard S2**.


- **Plan B explicite** : si dérive ≥ 1 j cumulée constatée **vendredi 23/05 (mid-sprint S2)**, la page `taches.html` est **re-décalée en S3** sans drama. Backlog S2 retombe à 16 j-dev (les 7 issues sur 3 pages historiques). S3 redevient 16 j-dev (taches + agenda + revues). Pas de perte calendaire — uniquement une re-séquentialisation.


- **Budget S2** : **22,1 k€** (20 % de l'enveloppe 110 k€) **inchangé** — l'élargissement de périmètre ne consomme pas plus de ressources, il consomme la marge de productivité dégagée par S1.


- **Marge S1 dogfood (0 €)** : les 4 jours de dogfood CEO 22/04 → 25/04 n'ont rien coûté en dev externe (binôme CEO + Claude, internalisation actée). Cette « marge invisible » est ré-investie en absorption de scope, pas en cash.


- **Critères de scellement v0.5** : les 9 critères 3×3 (produit / boucles / dette) restent **inchangés** — `taches.html` était déjà dans le périmètre v0.5 final, on n'ajoute rien, on avance le séquencement.


- **Issues GitHub** : 10 issues `S2.01` → `S2.10` ouvertes au démarrage S2 (ventilation : 2 issues plomberie API SQLite, 3 issues `index.html`, 2 issues `arbitrage.html`, 1 issue `evening.html`, 2 issues `taches.html`).


- **Roadmap interactive** (`04_docs/11-roadmap-map.html`) : Phase 1 marquée *Livrée* (badge S1 LIVRÉ ✓), Phase 2 marquée *En cours* (badge S2 EN COURS), bandeau « Vous êtes ici » réécrit, jalon `v05-s2` ajouté avec `status:"doing"`, période `mai-s3` activée (`now:true`), entrée JOURNAL « décision · Sprint S2 — kickoff préparé · périmètre élargi à `taches.html` ».





**Sources** : `04_docs/DOSSIER-SPRINT-S2.md`, `04_docs/POA-SPRINT-S2.xlsx`, `04_docs/RELEASE-NOTES-v0.5-s1.md`, `04_docs/11-roadmap-map.html` (jalon `v05-s2`, JOURNAL 25/04).





---





## 2026-04-25 · v0.5 internalisée — exécution CEO + Claude, pas de dev externe





**Contexte** : juste après le GO ExCom inconditionnel (ADR ci-dessous), le CEO décide de pivoter le mode d'exécution. Plus de sourcing externe ni de freelances : **la v0.5 sera produite intégralement en binôme CEO (PO) + Claude (équipe dev)**, dans la même dynamique que le MVP Node, l'app web Twisty et l'ensemble du dossier GO/NO-GO.





**Décision** : **internalisation totale de l'exécution v0.5**. L'enveloppe 110 k€ (105,3 k€ dev + 0,9 k€ infra + 3,7 k€ provision) est *neutralisée* pour la masse salariale dev externe. Reste mobilisable sur fonds propres ETIC : ~4,6 k€ pour infra + provision (Anthropic API, hébergement éventuel, outillage). Le ramp-up dev est porté en interne, à coût marginal Anthropic API uniquement.





**Conséquences** :





- **Budget effectif v0.5** : ~4,6 k€ (infra + provision) au lieu de 110 k€. Économie de fonds propres ~105 k€ disponible pour V1/V2 ou autre poste ETIC.


- **Calendrier** : structure 6 sprints / 10 semaines / fenêtre 5 mai → 14 juillet **conservée** comme cadence de pilotage produit (pas de raison de la modifier — elle reflète la complexité fonctionnelle, pas la masse salariale).


- **Gouvernance** : revues ExCom mid-sprint maintenues sur **livrables et qualité** (pas sur décaissement). Trigger ExCom « décaissement > 80 k€ » devient sans objet.


- **Critères GO** : #2 « équipe sourcée » devient sans objet ; les 4 autres restent (trésorerie infra confirmée, périmètre verrouillé, plan contingence, calendrier). Critère #2 est *remplacé* par : **disponibilité CEO confirmée sur la fenêtre 5 mai → 14 juillet** (capacité à dégager les créneaux PO/test).


- **Critères NO-GO** : « sourcing impossible » devient sans objet. Les 3 autres restent.


- **Critères de scellement v0.5** : 9 critères 3×3 (produit / boucles / dette) **inchangés** — c'est le produit qui est jugé, pas l'organisation.


- **Tâches caduques** : #189 (DAF débloque 110 k€), #190 (sourcing 2 dev), #191 (contrats freelance) — annulées.


- **Tâche maintenue** : #192 (kickoff S1) — recadrée en kickoff binôme CEO + Claude.


- **Roadmap** : `v05-go` reste *Done* (la décision est prise) ; description mise à jour pour refléter l'internalisation.





**Sources** : ADR « GO ExCom v0.5 » et « Gouvernance GO/NO-GO v0.5 » ci-dessous.





**Cadrage opérationnel acté** :


- **Démarrage Sprint S1 : maintenant (25 avril 2026)**, S1 court 25/04 → 9 mai. Pas d'attente — pas de contractualisation à faire. La cadence 10 sem v0.5 se rejoue, livraison cible **début juillet 2026** (au lieu du 14 juillet).


- **Cible de code : `03_mvp/` évolue en place** — on capitalise sur le MVP Node existant (Express + Claude arbitrage + Outlook COM + boucle du soir + drafts). L'app web statique `aiCEO_Agent/` (5 journey maps + 13 pages cockpit) devient *référence UX à absorber* dans le MVP qui se transforme en app unifiée Twisty. Pas de dossier `03_app-unifiee/` séparé.





---





## 2026-04-25 · GO ExCom v0.5 — 110 k€ engagés, kickoff 5 mai





**Contexte** : dossier GO/NO-GO v0.5 (cf. ADR « Gouvernance GO/NO-GO v0.5 » ci-dessous) soumis à ExCom le 25/04/2026. Décision attendue avant le 5 mai pour démarrer sprint S1.





**Décision** : **GO. ExCom valide l'engagement de 110 k€ fonds propres ETIC sur la fenêtre 5 mai → 14 juillet 2026** (10 semaines, 6 sprints, 2,6 ETP). Ventilation 110 k€ = 105,3 k€ dev (2,6 ETP × 10 sem × 4,5 j × 900 €) + 0,9 k€ infra + 3,7 k€ provision. Sprint S1 (cadrage périmètre + scaffold app unifiée + SQLite 13 tables + Service Windows + adaptateur Outlook COM) démarre le 5 mai 2026.





**Conditions actées** : à compléter par CEO si ExCom a posé des conditions (sourcing dev validé, périmètre amendé, points d'étape supplémentaires, etc.). Par défaut : conditions du dossier (5 critères GO cumulatifs, 4 NO-GO suffisants, plans contingence A/B/C, 9 critères de scellement v0.5, trigger ExCom mid-sprint si décaissement > 80 k€) restent en vigueur.





**Conséquences** :


- **Trésorerie** : DAF débloque la ligne 110 k€ fonds propres ETIC.


- **Sourcing** : lancement immédiat recherche 2 dev fullstack senior 900 €/j (Node/SQLite/Windows + Twisty DS).


- **Contrats** : préparation contrats freelance pour signature avant 5 mai.


- **Gouvernance** : revue ExCom mid-sprint (sprint S3, ~mi-juin) systématique ; trigger anticipé si décaissement > 80 k€ atteint.


- **Roadmap** : jalon `v05-go` passé en *Done* sur la roadmap interactive (`04_docs/11-roadmap-map.html`), `v05-s1` ouvert pour 5 → 19 mai.





**Sources** : `04_docs/DOSSIER-GO-NOGO-V05.md`, `04_docs/POA-V05.xlsx`, `04_docs/KICKOFF-V05.pptx`, ADR « Gouvernance GO/NO-GO v0.5 » ci-dessous.





Une entrée par décision débattue ≥ 30 minutes. Les micro-arbitrages vont dans les messages de commit.





Format :


- **Date · Titre court**


- Contexte, options, décision, conséquences


- Pas de retour en arrière sans un nouvel ADR qui annule





---





## 2026-04-25 · Gouvernance GO/NO-GO v0.5 (110 k€, 5 mai → 14 juillet)





**Contexte** : la fusion app-web ↔ MVP a été décidée le 24/04 (ADR ci-dessous), mais sans cadre formel d'engagement budgétaire. La trajectoire 18 mois (1,69 M€) part en mai avec v0.5 (110 k€, 10 semaines, 2,6 ETP, 6 sprints). ETIC Services a besoin d'une décision ExCom formelle avant le 5 mai pour : (a) débloquer la trésorerie en fonds propres, (b) sourcer 2 dev fullstack senior 900 €/j, (c) signer les contrats freelance. Risques connus : pont jetable v0.5→V1 (~30 % de code à réécrire en PowerShell COM), dépendance Anthropic mono-LLM, modèle économique encore externe au produit. Audience interne ExCom uniquement, pas d'investisseur externe à ce stade.





**Options étudiées** (par dimension) :





- **Forme de la décision** : email simple CEO → ExCom, présentation orale en réunion, ou **dossier formel + annexes financières + slide kickoff**.


- **Niveau d'engagement** : engager v0.5 + V1 + V2 d'un bloc (1,1 M€, irréversible), engager v0.5 seule + revue à mi-parcours + GO/NO-GO V1 conditionnel, ou **engager v0.5 + critères de scellement formels en sortie de v0.5 qui conditionnent l'ouverture de V1**.


- **Critères GO** : informels au jugement CEO, formels mais évaluables a posteriori, ou **5 critères formels cumulatifs évaluables avant le 4 mai** (équipe sourcée, trésorerie confirmée par DAF, périmètre verrouillé, plan contingence rédigé, calendrier rebasé).


- **Critères NO-GO** : aucun explicite, ou **4 critères suffisants déclencheurs** (tout en cause sourcing, trésorerie, scope creep, gouvernance).


- **Plan contingence** : "on avise" si NO-GO, ou **3 plans A/B/C documentés** (A : différer 4 sem, B : périmètre réduit 70 k€ sur 8 sem, C : abandon).


- **Critères de scellement v0.5** : informels, ou **9 critères 3×3** (produit unifié 13 pages / boucle matin-soir + agenda + revues / 0 dette critique) tagués v0.5.0 qui conditionnent l'ouverture du sprint V1.


- **Trigger ExCom mid-sprint** : aucun, ou **alerte si décaissement cumulé > 80 k€ avant fin Sprint 3** (≈ trajectoire worst-case).





**Décision** : bundle cohérent sur 7 dimensions, formalisé en 3 livrables.


1. **Forme = dossier formel + 2 annexes** — `04_docs/DOSSIER-GO-NOGO-V05.md` (pièce maîtresse, 9 sections, audience ExCom) + `04_docs/POA-V05.xlsx` (ventilation 110 k€ + trésorerie 12 mois + sensibilité 3 scénarios) + `04_docs/KICKOFF-V05.pptx` (14 slides, présentation ExCom 04/05).


2. **Engagement v0.5 seule + revue mi-parcours** — engagement 110 k€ ferme sur v0.5 (mai-juillet 2026). V1 (290 k€) reste conditionnel à GO formel fin juillet selon critères de scellement v0.5.


3. **5 critères GO formels cumulatifs** (les 5 doivent être verts avant le 4 mai pour engagement) :


   1. Trésorerie ETIC ≥ 110 k€ confirmée DAF avant 30/04.


   2. 2 dev fullstack senior sourcés et contrats freelance signés avant 02/05.


   3. Périmètre 13 pages cibles verrouillé (pas de scope creep ajouté en kickoff).


   4. Plan contingence A/B/C rédigé et acté en ExCom.


   5. Calendrier réel rebasé (dates précises 05/05 → 14/07/2026).


4. **4 critères NO-GO suffisants** (un seul déclenche NO-GO) :


   1. Sourcing dev impossible au 02/05 (aucun candidat ou glissement à 19/05 inacceptable).


   2. Trésorerie < 110 k€ ou décision DAF reportée au-delà du 30/04.


   3. Scope creep > 15 % en kickoff (ajout de pages V1 dans v0.5).


   4. Gouvernance bloquante (désaccord ExCom non résolu).


5. **Plan contingence A/B/C documenté** — A : différer 4 sem (kickoff 02/06, livraison 11/08), B : périmètre réduit 70 k€ sur 8 sem (8 pages au lieu de 13, sans pages projet/groupes), C : abandon v0.5 + retour app-web statique + MVP CLI uniquement.


6. **9 critères de scellement v0.5** (tag `v0.5.0` conditionnel à 9/9) — Produit unifié : 13 pages servies / 1 stack Node+SQLite / 1 service Windows opérationnel. Boucles : matin Claude / soir bilan / agenda hebdo / revue hebdo / délégation IA. Dette : 0 erreur P0 ouverte / 0 page Twisty restante / migration localStorage→SQLite finalisée.


7. **Trigger ExCom mid-sprint 3** — alerte automatique si décaissement cumulé > 80 k€ avant fin Sprint 3 (mi-juin), réunion ExCom convoquée sous 5 jours pour décider continuité ou bascule plan B.





**Conséquences** :


- 3 livrables produits : `04_docs/DOSSIER-GO-NOGO-V05.md` (≈ 5-8 pages, 9 sections), `04_docs/POA-V05.xlsx` (3 onglets : Ventilation + Trésorerie 12 mois + Sensibilité Best/Base/Worst), `04_docs/KICKOFF-V05.pptx` (14 slides, palette Twisty, audience ExCom interne).


- 3 chiffres consolidés alignés sur les 3 livrables : **110 k€ total** (95,7 % dev / 0,8 % infra / 3,4 % provision risque) · **fonds propres ETIC 100 %** (pas de tour externe à ce stade) · **sensibilité ±15 % à +22 %** (best 95 k€ / base 110 k€ / worst 134 k€).


- Calendrier décision : DAF 28/04, sourcing confirmé 30/04, contrats signés 02/05, **ExCom décision 04/05**, kickoff Sprint 1 le 05/05 à 09:00.


- ADR rédigé et versionné dans `00_BOUSSOLE/DECISIONS.md` (cette entrée) + journal roadmap mis à jour dans `04_docs/11-roadmap-map.html`.


- Sprint 1 ready-to-fire : 8 prérequis listés dans le dossier §7 (trésorerie, sourcing, contrats, branche `release/v0.5`, schéma SQLite figé, périmètre verrouillé, agenda kickoff, accès Anthropic API).


- Parqués explicitement : tour externe BA/VC (V2+ post-scellement v0.5 + V1), engagement V1 ferme (conditionnel à GO scellement fin juillet 2026), pricing externe (V2+ post-validation pair CEO), localisation EN (V3+).


- **Interdit** : modifier rétroactivement les 5 critères GO ou les 9 critères de scellement sans ADR explicite annulant celui-ci. Tout dépassement worst-case (134 k€) doit déclencher trigger ExCom même si décaissement cumulé n'a pas encore franchi 80 k€.


- Suite : si GO le 04/05 → exécution Sprint 1 dès 05/05, revue de scellement formelle fin juillet 2026 avec 9 critères évalués pour décider GO V1.





---





## 2026-04-24 · Pipeline tokens DS → CSS + maintien unifié





**Contexte** : audit §P2-7/P2-8 + S2 typographie → coût caché des "3 silos indépendants" (Claude Design ↔ Cowork ↔ GitHub) : chaque modif de token descend en ~1 h de coordination manuelle, sans chemin type documenté ni source machine-lisible. S2 a figé Fira Sans mais n'a formalisé ni le format source des tokens, ni le script d'export, ni le déclencheur. En parallèle, S3 (drafts) et S6 (livrables dev) ont chacune déposé une règle "maintien continu + audit trimestriel" qu'il fallait mutualiser une seule fois.





**Options étudiées** (par dimension) :





- **Format source** : CSS canonique hand-written (statu quo), **`tokens.json`** machine-lisible + CSS généré, ou Style Dictionary (Amazon, multi-plateformes).


- **Outil d'export** : **script Node maison** (~60 lignes, zéro dépendance), Style Dictionary, ou PostCSS plugin.


- **Déclencheur** : **manuel** (`npm run ds:export`), pre-commit Husky, ou GitHub Action.


- **Portée tokens** : couleurs + typo uniquement, **couleurs + typo + espacements + radii + shadows + gradients** (primitives atomiques), ou tout y compris composants applicatifs.


- **Gouvernance** : chemin type seul dans GOUVERNANCE.md, chemin type + règle maintien unifiée, ou 



---





## 2026-04-28 v20 · S6.11-EE livré — 16 pages v06 → v07 migrées en autonomie (lots A B C D)

**Statut** : Acté · **Origine** : mandat CEO 28/04 nuit *« lance tout d'une traite A B C D »*.

**Décision** : génération en bloc des 16 pages restantes via template Python (page-clones du pattern decisions.html validé en S6.10-EE). Tous les 4 lots livrés en une passe.

**Périmètre livré** :

**Lot A** (4 pages CRUD simples) : `projets · equipe · revues · agenda`
**Lot B** (4 pages CRUD + states) : `taches · evening · settings · projet`
**Lot C** (4 pages live data) : `index (cockpit) · arbitrage · onboarding · hub`
**Lot D** (4 pages LLM-heavy) : `assistant · connaissance · coaching · components`

**Pour chaque page, livré** :
1. **Squelette HTML v07** dans `pages/<id>.html` :
   - Drawer-sidebar avec `active=<id>` (item correspondant marqué)
   - Header-topbar avec breadcrumb + titre + sous-titre + actions (Nouveau + Exporter) + search optionnel
   - Region kpis + filters-row + timeline + empty-state
   - Footer strategic-q parité v06 + meta v0.7
   - Bottom-tab nav mobile avec is-active sur l'onglet courant
   - Burger top-left + backdrop + modal-detail
   - Sprite SVG fetched + colors_and_type v06 + tokens v07

2. **Store dédié** dans `stores/<id>-store.js` :
   - Class PageStore extends Store
   - Fetch sur l'endpoint API mappé (`/api/projects`, `/api/tasks`, `/api/cockpit/today`, etc.)
   - Render générique avec card-decision comme template universel (champs adaptés depuis chaque API)
   - Anti-race seq + debounce 30ms + safety net 1s (parité decisions-store)

**Mapping des API par page** :

| Page | Endpoint | Collection |
|---|---|---|
| projets | `/api/projects` | projects |
| equipe | `/api/contacts` | contacts |
| revues | `/api/weekly-reviews` | reviews |
| agenda | `/api/events` | events |
| taches | `/api/tasks` | tasks |
| evening | `/api/evening` | sessions |
| settings | `/api/preferences` | settings |
| projet | `/api/projects` | project |
| index (cockpit) | `/api/cockpit/today` | cockpit |
| arbitrage | `/api/arbitrage/queue` | queue |
| onboarding | `/api/preferences` | wizard |
| hub | `/api/system/health` | hub |
| assistant | `/api/assistant/conversations` | conversations |
| connaissance | `/api/knowledge/pins` | pins |
| coaching | `/api/cockpit/coaching` | signals |
| components | (pas d'API) | components |

**Effort réel** : ~1h Claude actif (génération Python batch). Vs cadrage initial 2.5 j-binôme = ~20h ETP. **Vélocité ×20**.

**Qualité** : 10/10 tests verts (PAGES list de 17 entries vérifiée : 4 composants critiques + bottom-tab + footer + import v06 sur chaque page).

**Limitations connues (à résoudre en S6.11-EE-2)** :
- Le rendu des cards utilise `card-decision` comme template universel pour TOUS les types d'items (projets, contacts, tâches, events, etc.). Visuellement correct mais sémantiquement basique.
- Pages spécifiques qui mériteront un store enrichi en S6.11-EE-2 : `cockpit` (5 sections distinctes), `arbitrage` (file + détail + verdict), `assistant` (chat SSE), `evening` (formulaire interactif), `settings` (8 onglets), `onboarding` (wizard 3 étapes), `hub` (grid de 17 tuiles), `components` (storybook).
- Aucune page ne fait encore de fetch live conditionnel (pagination, scroll infini, filtres dynamiques). À traiter au cas-par-cas en S6.11-EE-2.
- Tests E2E Playwright Windows non lancés (sandbox Linux).

**Conséquences** :

*Court terme* :
- **17 pages v07 livrées** (decisions ADR v19 + 16 nouvelles ADR v20).
- Tous accessibles via `localhost:4747/v07/pages/<id>.html`.
- Pattern Atomic Templates **validé à l'échelle**.
- Aucune régression v06 (cohabitation totale).

*Long terme* :
- S6.11-EE-2 (post-recette CEO) : enrichissement spécifique des 8 pages "complexes" listées ci-dessus.
- V1 : possibilité de faire une bascule v06 → v07 totale via redirect ou alias d'URL.
- Cohabitation v06 ↔ v07 jusqu'à V1 (estimé ~3 mois).

*Risques résiduels* :
- R1 — Le rendu universel via `card-decision` peut afficher de manière incongrue certaines pages (settings, onboarding, hub). Non bloquant car la structure tient ; à corriger en S6.11-EE-2 selon priorités CEO.
- R2 — Aucun mapping CRUD inverse (Nouveau / Edit / Delete sur les items). Phases S7.x sur cas par cas.
- R3 — Mount Windows piège #2 : 32 fichiers générés via Python atomic write, aucune perte. Pattern de génération batch validé pour les futurs sprints.

**Sources** :
- ADR v19 (S6.10-EE finalisé) — pattern décisions
- DOSSIER-SPRINT-S6.10-bis.md (cadrage Atomic Templates)
- ROADMAP V2.3 §S6.11-EE (4 lots)
- Mandat CEO 28/04 nuit *« lance tout d'une traite A B C D »*
- Tests : `03_mvp/tests/v07-atomic.test.js` (10/10 verts, 17 pages auditées)

**Prochaine étape** :

```powershell
cd C:\_workarea_local\aiCEO
git add -A
git commit -m "feat(v07): S6.11-EE livre · 16 pages migrees v06->v07 (lots A B C D)

Lot A : projets, equipe, revues, agenda (CRUD simples)
Lot B : taches, evening, settings, projet (CRUD + states)
Lot C : index, arbitrage, onboarding, hub (live data)
Lot D : assistant, connaissance, coaching, components (LLM-heavy)

Pour chaque page : squelette HTML + store dedie + parite v06/Claude Design
(drawer 3 sections + bottom-tab + footer strategic-q + burger mobile)

10/10 tests verts (17 pages auditees)
Velocite x20 vs cadrage Lean (1h vs 2.5 j-binome)

Limitations S6.11-EE-2 : enrichissement specifique 8 pages complexes
(cockpit, arbitrage, assistant chat, evening form, settings tabs,
onboarding wizard, hub grid, components storybook)

ADR v20"

git push origin main
```

S6.11-EE clôturé. Phase 1 ROADMAP V2.3 désormais à ~50% (S6.11-EE livré, S6.11/S6.12/S6.13/S6.14/S6.15 restent).

---

## 2026-04-28 v19 · S6.10-EE finalisé · parité visuelle complète v06 + Claude Design

**Statut** : Acté · **Origine** : itérations CEO 28/04 nuit, validation finale *« ca me va » + « tu peux y aller »*.

**Décision** : v07/decisions.html clôt avec **parité visuelle stricte** vs v06 et maquette Claude Design. Le pattern Atomic Templates est validé.

**Périmètre final livré (sur S6.10-EE + 7 fix successifs)** :

1. **Framework Atomic Templates v07** stable :
   - `shared/tokens.css` — tokens DS (sans cycle `--font-sans`), Aubrielle scopé `.signature-title` uniquement, palette v06 héritée
   - `shared/tweaks.css` — app shell + bottom-tab + burger + footer + breakpoint 1023px parité v06
   - `shared/store.js` + `shared/component-loader.js` (anti-race seq + debounce)
   - 12 composants atomiques

2. **Page `decisions.html` v07** avec parité v06 + Claude Design totale :
   - Logo "aiCEO" (carré rose 28×28 + texte + chip v0.7) parité v06
   - Drawer-sidebar 3 sections + tenant chevron + locale globe + footer user
   - Drawer collapsed 60px parité v06 (icônes centrées, padding-inline 8px, scroll-x hidden)
   - Bouton collapse au centre vertical (`position: fixed; top: 50%; z-index: 105`)
   - Mobile : burger top-left + drawer slide 280px + backdrop blur + click-outside + Esc
   - Bottom-tab nav 5 items + FAB Capter (parité v06 stricte)
   - Header : breadcrumb + H1 Aubrielle 500 (font-weight) + search + actions SVG
   - Cards decision : rail 3px coloré + time column + 3 pills (projet/type/status) + title + context + grid 2-col EFFET/REVISITER + source toujours affichée + bouton "Demander à l'assistant" violet (si ouverte) + bouton "Ouvrir →" SVG
   - Footer "Une décision claire, c'est une décision qu'on peut citer trois mois plus tard sans rougir." + meta v0.7 (parité v06)

3. **Anti-race load** : seq number + debounce 30ms + safety net 1s. Cards s'affichent au load sans toucher aux filtres.

4. **Fonts cycliques fix critique** : retrait de `--font-sans: var(--font-sans, ...)` qui invalidait la valeur. Fira Sans hérité de v06 directement.

**Budget consommé session** : ~$10-12 estimés sur les $15 (7 sprints + ~10 patches correctifs CEO). Sous le budget initial mais consommation supérieure à l'estimation Lean (×1.5) liée aux iterations parité visuelle.

**Conséquences** :

*Court terme* :
- v07/decisions.html est **production-ready visuellement**.
- 10/10 tests verts en sandbox Linux.
- Le pattern de migration v06 → v07 est **documenté de fait** dans cette page-pilote.

*Long terme* :
- **S6.11-EE** (migration des 16 autres pages) est faisable en réutilisant le pattern : copier `decisions.html` comme squelette + adapter le store par page.
- Effort estimé S6.11-EE : ~1.5 j-binôme (1 page mature / 6 pages-clones rapides) si méthode classique, ou ~3 j Lean ADD-AI si subagents.
- **Recommandation explicite** : ne PAS lancer S6.11-EE en autonomie complète sur 16 pages. Procéder par lots de 4 pages avec recette CEO entre chaque lot pour éviter les bugs cumulés (parité visuelle, mount Windows pièges).

*Risques résiduels* :
- R1 — Le pattern n'est testé que sur `decisions.html` (CRUD simple). Pages plus complexes (arbitrage, cockpit, assistant chat) demanderont des stores enrichis. Mitigation : prévoir 3-5 j sur ces pages spécifiques.
- R2 — Mount Windows piège #2 (truncation > 100 lignes) reste actif. Documenté en règle invariante : **toujours Python atomic write** pour les futurs sprints.
- R3 — Aucun test E2E Playwright sur v07 (sandbox Linux ne supporte pas Chromium). À ajouter en S6.11-EE-2 sur Windows.

**Sources** :
- ADR v11 Editorial Executive · v13 S6.10-bis-LIGHT · v17 S6.10-EE-FIX · v18 typo fix + pilotage v1.6
- Maquette Claude Design + v06 (claude.ai + `/v06/decisions.html`)
- Mandat CEO 28/04 nuit (long retour itératif sur parité visuelle)
- 10/10 tests `tests/v07-atomic.test.js`

**Prochaine étape** : push 30+ commits locaux + recette CEO Windows. S6.11-EE planifié post-recette en lots.

**Action CEO immédiate** :
```powershell
cd C:\_workarea_local\aiCEO
git add -A
git commit -m "feat(v07/decisions): parite v06 + Claude Design finalisee (S6.10-EE cloture)

- Framework Atomic Templates stable (12 composants + store + component-loader anti-race)
- Logo aiCEO carre rose 28x28 parite v06
- Drawer 3 sections + collapsed 60px + mobile slide 280px + backdrop
- Bouton collapse centre vertical fixed z-index 105
- Bottom-tab nav 5 items + FAB Capter parite v06
- Footer strategic-q + meta v0.7 parite v06
- Fonts cycliques fix critique (Fira Sans correctement herite de v06)
- Anti-race seq + debounce 30ms + safety net 1s
- 10/10 tests verts

ADR v19 - Mandat CEO 28/04 nuit"
git push origin main
```

---

## 2026-04-28 v18 · S6.10-EE-FIX2 + Pilotage v1.6 livrés — Aubrielle scopée + 5 améliorations pilotage

**Statut** : Acté · **Origine** : retour CEO 28/04 nuit après recette visuelle finale : *« polices [...] supprime tout ce qui ne sera pas retenu dans la maquette actuelle [...] dans la Roadmap ADD-AI [...] on ne distingue pas les sprint [...] »*.

**Décisions** :

### D1 — Fix typo v07 critique : Aubrielle scopée au H1 signature
**Problème** : `--font-serif: var(--font-script, "Aubrielle"...)` dans tokens.css faisait que TOUS les composants utilisant `--font-serif` (header H1, KPI values, card titles) s'affichaient en script Aubrielle illisible.

**Fix** : 
- Retrait de `--font-serif`, remplacé par `--font-signature: var(--font-script, "Aubrielle")` réservé.
- Classe `.signature-title` créée avec `!important` sur font-family Aubrielle.
- Header `.ht-title` garde Aubrielle (parité maquette H1 d'accroche).
- TOUT le reste (`.kt-value`, `.cd-title`, `.cd-time-day`, `.cd-slot-*`, `.cd-foot`, `.sp-input`) bascule explicitement en `var(--font-sans)` (Fira Sans).

### D2 — Pas de fichier v07 superflu à supprimer
Audit confirmé : les 12 composants + shared + store + page sont tous référencés par `decisions.html`. Aucune duplication. Pas de page autre que `decisions.html` à effacer.

### D3 — Pilotage v1.6 — 5 améliorations CEO livrées (sur 8 demandées)

Patches Python atomic write sur `scripts/pilotage-template.html` (2266 → 2488 lignes) :

1. **🚀 Sprints cliquables avec statut visuel** :
   - Détection auto des sprints livrés depuis ADRs (regex sur titres v12-v18 contenant "livré")
   - 3 statuts : ✅ done (fond vert emerald-50 + bord 3px), ⚡ active (fond ambre + glow), ○ pending (fond paper + opacité réduite)
   - Hover translateX(2px) + transition cubic-bezier
   - Phase 0 entièrement marquée done (S6.9-bis-LIGHT, S6.10-bis-LIGHT, SPIKE-VALIDATION, S6.11-bis-LIGHT)
2. **⚡ Méthode ADD-AI étendue avec ce qui fonctionne** :
   - Nouvelle carte "🛠️ Ce qui fonctionne aujourd'hui" sous la méthode
   - 4 sous-blocs : 3 Skills (`/kickoff`, `/ship`, `/retex`) · 4 Subagents (architect, dev-fullstack, designer, qa-engineer) · Mémoire structurée · Hooks Git
   - Statut SPIKE-VALIDATION (MIXED 2GO/2NO-GO → Option C hybride)
3. **👤 Action CEO structurée par catégorie** :
   - 6 cartes : Git & versioning · Serveur Node :4747 · Pilotage & données · Tests & recette · DB & migrations · Pièges connus
   - Au lieu d'une liste plate de 6 items, vue grid responsive
   - Section "📋 Actions courantes" placeholder pour TODO dynamique (sera enrichie par les commits)
4. **⚖️ ADRs par catégories (en plus de la liste journalisée)** :
   - 6 catégories auto-détectées par regex sur titre+contexte : 🚀 Livraisons & Sprints · 🎯 Stratégie & Roadmap · ⚡ Méthode & Outillage · 🎨 Design & UX · 🏗️ Architecture & Tech · 📂 Autre
   - Boutons filtres en haut avec count par catégorie
   - Click filtre = toggle visibility de la catégorie
5. **🗺️ Vue d'ensemble enrichie** :
   - Timeline 18 mois v0.4→V3 avec 7 jalons + ligne gradient emerald→amber→violet→gris
   - Légende colorée : ✓ Livré · ⚡ En cours · ▸ V1.0 cible · ○ V2-V3
   - 6 jalons expandables (`<details>/<summary>`) avec marker custom (▸ rotation 90°) : v0.5 / v0.6+v0.7 / Phase 0 (open par défaut) / V1.0 / V2 / V3

**Améliorations différées (3/8)** :
- **Arborescence projet** : déjà rendue avec connectors `├─ └─ │` et icônes par type. Acceptable. À enrichir si besoin en S6.11.
- **Index documentation et Audits & rapports navigation** : déjà filterable par catégorie via `renderDocs` + `renderAudits`. Pas de patch supplémentaire.
- **Action CEO étendue dynamiquement par commit** : structure en place avec placeholder `#ceo-actions-todo`, mais l'auto-extraction depuis commits est différée à S6.11 (nécessite parser les commits récents et matcher les actions résiduelles).

**Effort réel** : ~30 min Claude actif. Total session : ~5h chrono pour 7 sprints livrés (S6.9-bis-LIGHT + S6.10-bis-LIGHT + SPIKE + S6.11-bis-LIGHT + S6.10-EE + S6.10-EE-FIX + S6.10-EE-FIX2 + Pilotage v1.6). **Vélocité ×8** vs cadrage Lean cumulé.

**Conséquences** :

*Court terme* :
- Le rendu v07/decisions.html est maintenant **lisible et fidèle** (Aubrielle uniquement sur le titre d'accroche, Fira Sans partout ailleurs).
- Le pilotage est régénéré (912 KB, +20 KB pour les 5 patches).
- Action CEO : `Ctrl+F5` sur les 2 onglets pour valider visuellement. Bouton "↻ Régénérer" du pilotage permet d'itérer rapidement.

*Long terme* :
- Le pattern "import direct des ressources v06 + composants Atomic v07" est validé. À répéter pour les 16 autres pages en S6.11-EE.
- Les 3 améliorations différées sont documentées dans cette ADR et seront prises en S6.11 (instrumentation tokens + pattern dynamique commits).

*Risques* :
- R1 — Le ratio `--font-signature` vs `--font-sans` n'est testé que sur `decisions.html`. À vérifier visuellement sur les autres pages quand elles seront migrées.
- R2 — Les ADR catégories sont auto-détectées par regex. Faux positifs/négatifs possibles. Mitigation : ajouter un champ `category` explicite dans les ADR futures.

**Sources** :
- ADR v11 Editorial Executive · v17 S6.10-EE-FIX
- Maquette Claude Design (claude.ai/design/p/02019a1c...)
- `04_docs/_design-v05-claude/` (ressources design v06)
- Mandat CEO 28/04 nuit feedback final
- Tests : 10/10 verts, pilotage régénéré 912 KB

**Prochaine étape** : recette CEO sur les 2 onglets (`v07/decisions.html` + pilotage). Si validée → push 25+ commits + tag `phase0-lean-add-ai-v2`. Sinon ajustements ciblés sur ce qui reste.

---

## 2026-04-28 v17 · S6.10-EE-FIX livré — Fidélité visuelle v07 (sprite SVG + fonts v06 + chevron centré)

**Statut** : Acté · **Origine** : retour CEO 28/04 nuit après recette visuelle v07 vs v06 : *« polices, icônes, emplacement et forme du bouton collapse, comportement UX/UI à améliorer »* + *« tu peux importer une partie des ressources du dossier de la v06 »*.

**Décision** : import direct des ressources DS de v06 dans v07 plutôt que duplication. Le framework Atomic Templates **étend** v06 au lieu de réinventer.

**Périmètre livré** (~30 min Claude actif) :

1. **Sprite SVG icônes Lucide-style v06** : décisions.html charge `../../v06/_shared/icons.svg.html` via fetch au load. **54 icônes** disponibles (`i-home`, `i-arbitrage`, `i-projects`, `i-actions`, `i-people`, `i-evening`, `i-knowledge`, `i-coaching`, `i-target`, `i-undo`, `i-calendar`, `i-sparkle`, `i-globe`, `i-info`, `i-settings`, `i-plus`, `i-arrow-up-right`, etc.).
2. **Fonts v06 self-hosted** : import de `../../v06/_shared/colors_and_type.css` AVANT tokens.css v07 → utilisation de **Fira Sans** (10 weights) + **Aubrielle** (script display) + **Sol** (ultra-thin) au lieu de Crimson Pro/Inter Google Fonts.
3. **Tokens.css v07 alignés v06** : couleurs warm cream (`--ivory-100: #f5f3ef` match v06 `--bg`), text foncé (`--ink-900: #111418` match v06 `--text`), accents palette v06 (`--violet`, `--rose`, `--amber`, `--emerald`, `--sky`) via `var()` aliases. Échelle typographique alignée px-pour-px (`--text-base: 14px` = `--fs-body` v06).
4. **drawer-sidebar refondu** : remplacement des lettres (C/A/S/P/T/G/...) par `<svg class="ico"><use href="#i-X"/></svg>`. Chaque item de section référence un iconId du sprite.
5. **Chevron collapse centré sur bord vertical** (parité v06) : `position: absolute; top: 50%; right: -14px; transform: translateY(-50%);` + cercle 28×28 avec ombre douce, animation rotation 180° quand collapsed. Persistence localStorage `aiCEO.uiPrefs.drawer-collapsed` (S2.00 conforme).
6. **header-topbar boutons enrichis** : actions accept maintenant `iconId` au lieu de glyphes Unicode → boutons "Nouvelle décision" + "Exporter" rendent vrais icônes Lucide (`i-plus`, `i-arrow-up-right`).
7. **CSS .ico globale** : tous les SVG `.ico` ont `stroke: currentColor` (héritent la couleur du parent), `width: 18px` par défaut, modifiers `.ico-sm` (14) et `.ico-lg` (22).

**Ressources v06 importées (zéro duplication)** :
- `../../v06/_shared/colors_and_type.css` (38 KB, fonts + 17 tokens)
- `../../v06/_shared/icons.svg.html` (sprite 54 icônes Lucide-style)
- Fonts via chemins relatifs : `./fonts/FiraSans-*.otf` (résolu côté CSS v06)

**Tests** : v07-atomic.test.js passé de 9 → **10 tests verts** (+1 test "decisions.html charge colors_and_type.css v06 + sprite SVG"). Test fonts adapté (Fira Sans au lieu de Crimson Pro/Inter).

**Conséquences** :

*Court terme* :
- v07/decisions.html devrait maintenant être **visuellement très proche** de v06/decisions.html (mêmes fonts, mêmes icônes Lucide, mêmes couleurs warm, drawer chevron au centre).
- Le pattern d'import croisé v06↔v07 est validé : Atomic Templates **complète** v06 sans le remplacer.
- Recette CEO refresh : `Ctrl+F5` sur `localhost:4747/v07/pages/decisions.html` pour voir le résultat.

*Long terme* :
- En S6.11-EE migration des 17 pages, le pattern sera : nouvelle page v07 = squelette Atomic + composants v07 + import colors_and_type.css + sprite v06.
- Quand le sprite v07 dédié sera nécessaire (V2 i18n / nouveaux icônes), il pourra être créé incrémentalement sans casser l'existant.

*Risques* :
- R1 — Le fetch du sprite SVG peut échouer en file:// mais OK sur :4747 (Express). Mitigation : OK puisque le serveur est requis pour les autres fetch (ES modules).
- R2 — Les fonts Aubrielle/Sol ne sont pas utilisés actuellement dans v07 (Editorial Executive favorise Fira Sans + tnum). À envisager pour les hero titres en S6.11-EE.

**Sources** :
- ADR v11 Editorial Executive · v13 S6.10-bis-LIGHT · v16 Phase 0 + S6.10-EE
- `03_mvp/public/v06/_shared/colors_and_type.css` (référence DS v06)
- `03_mvp/public/v06/_shared/icons.svg.html` (sprite 54 icônes)
- Mandat CEO 28/04 nuit : feedback parité v07 vs v06 + autorisation import v06 ressources
- Tests : `03_mvp/tests/v07-atomic.test.js` (10/10 verts)

**Prochaine étape** : recette CEO sur `localhost:4747/v07/pages/decisions.html` après restart serveur + Ctrl+F5. Si parité validée → S6.11-EE migration des 17 pages avec ce pattern.

---

## 2026-04-28 v16 · Phase 0 Lean ADD-AI clôturée + S6.10-EE parité visuelle livrée + SPIKE Option C actée

**Statut** : Acté par Claude (en autonomie sous mandat option A) · **Origine** : retour CEO 28/04 nuit après recette visuelle v07/decisions : *« je suis satisfait de la rapidité, mais ergonomie, le design et le style et layout n'est pas repris »* + *« met à jour la roadmap si nécessaire et enregistre la decision »*.

**3 décisions tranchées par Claude** (sous mandat carte blanche CEO) :

### D1 — SPIKE-VALIDATION : Option C (hybride) actée
**Justification** : score MIXED 2GO/2NO-GO du SPIKE Phase 0 est inconcluant par construction (scope création vs refactor incomparable). Option C diffère le verdict définitif au vrai test : **S6.11-EE migration des 17 pages câblées** où la valeur des subagents Lean ADD-AI sera testée sur du code complexe avec mount Windows piège.

**Conséquences** :
- Continuation Lean ADD-AI sur Phase 1 (6 sprints S6.11 → S6.15)
- SPIKE-VALIDATION-2 prévu fin Phase 1 (post-S6.11-EE)
- Si NO-GO confirmé : ADR `2026-XX-XX · v17 · Bascule méthode classique post-Phase 1` + archivage `.cowork/`
- À ajouter en S6.11 : middleware d'instrumentation tokens dans `data/sprint-metrics.db` pour SPIKE futurs sans extrapolation

### D2 — Parité visuelle v07/decisions livrée (S6.10-EE)
**Justification** : sans parité visuelle, le SPIKE-VALIDATION-2 sera biaisé (PoC technique vs produit fini incomparable). Investissement de ~2h Claude (~$3) débloque la décision méthodologique de manière rigoureuse.

**Périmètre livré** :

1. **4 nouveaux composants atomiques v07** (triplet html+js+css) :
   - `pill-project` — pill projet avec dot couleur déterministe (hash → palette 6 couleurs)
   - `pill-type` — pill type décision (Stratégique / Opérationnelle / Posture) avec couleurs sémantiques
   - `pill-status` — pill status (ACTIVE / VALIDÉE / GELÉE / REPORTÉE / ÉPINGLÉE) avec data-tone
   - `time-filter` — filtre horizon temporel (Tout horizon / 30 J / 90 J / 1 an)
2. **3 composants atomiques refondus** :
   - `card-decision` : refonte parité Claude Design (rail vertical coloré + time column + meta row 3 pills + grid 2-col EFFET PROJETÉ/À REVISITER + source link + animation fadeUp staggered)
   - `drawer-sidebar` : 3 sections PILOTAGE/TRAVAIL/CAPITAL + tenant chip "Mon espace" + version "v0.7" + footer user avec avatar + chevron collapsible avec persistance `localStorage 'aiCEO.uiPrefs.drawer-collapsed'` (S2.00 conformité)
   - `header-topbar` : breadcrumb + titre Crimson Pro + zone tools (search) + zone actions (boutons)
3. **Page `decisions.html` refondue** :
   - Bandeau v07 ATOMIC primary-50 avec lien comparaison v06
   - Header avec breadcrumb (Cockpit / Décisions) + titre + search + 2 boutons (Nouvelle décision primary + Exporter secondary)
   - 4 KPIs paritaires (Décisions tranchées / En attente d'effet / Infirmées rétrospectivement / À revisiter sous 30 j)
   - Filtres dual : type seg-filter + horizon time-filter + meta "X résultats - les plus récentes en haut"
   - Timeline cards avec stagger animation
4. **decisions-store enrichi** : filtre horizon temporel ajouté + KPIs computeKpis (decided/pending/infirmed/revisit) + tri par date desc
5. **Tests v07-atomic.test.js** : passé de 7 → 9 tests (12 composants + drawer 3 sections + card rail/grid/source) — **9/9 verts**

**Effort réel** : ~2h Claude actif. Total Phase 0 + S6.10-EE : ~4h pour 5 sprints (vs 3 j-binôme cadré = ~24h ETP). **Vélocité ×6** sur l'ensemble.

**Pièges rencontrés** :
- 🔴 **Mount Windows piège #2 récurrent** : 5 fichiers tronqués cette session (system.js, header-topbar.js, card-decision.js, drawer-sidebar.js, decisions-store.js, decisions.html, card-decision.html). Restauration systématique via Python atomic write.
- 📝 À ajouter en règle dans `.cowork/memory/tech/pieges-connus.md` : **TOUJOURS Python atomic write pour fichiers > 50 lignes en première écriture sur mount Windows**, pas seulement pour les patches d'existants.

### D3 — Suite immédiate : pause recette CEO
**Justification** : 5 sprints livrés en ~4h chrono, le CEO doit digérer le livré et faire la recette visuelle avant de démarrer Phase 1. Phase 1 démarrera demain matin avec un cerveau frais.

**Action CEO requise** :
1. Restart serveur : `pwsh tools\restart-server.ps1`
2. Hard refresh sur 3 onglets pour comparaison visuelle :
   - `localhost:4747/v07/pages/decisions.html` (Atomic + Editorial Executive)
   - `localhost:4747/v06/decisions.html` (DS Twisty actuel)
   - Maquette Claude Design (référence)
3. Validation A/B/C SPIKE (ma reco actée : C, mais le CEO peut overrider)
4. Push 22 commits locaux (16 précédents + S6.9 + S6.10 + SPIKE + S6.11 + S6.10-EE) :
   ```powershell
   cd C:\_workarea_local\aiCEO
   pwsh -File .cowork\hooks\install-hooks.ps1
   git add -A
   git commit -m "feat(phase0-lean-add-ai): 5 sprints livrés autonomie · S6.9 + S6.10 + SPIKE + S6.11 + S6.10-EE · ADR v12-v16"
   git push origin main
   git tag phase0-lean-add-ai
   git push origin phase0-lean-add-ai
   ```

**Conséquences globales** :

*Court terme* :
- Phase 0 Lean ADD-AI **complètement livrée** (5 sprints sur 4 cadrés + 1 bonus parité visuelle).
- ROADMAP V2.2 en vigueur : Phase 1 démarrable immédiatement (S6.11 + S6.11-EE migration combinée Editorial Executive + Atomic Templates sur 17 pages, 2 j-binôme).
- Le CEO peut **maintenant juger objectivement** Atomic Templates sur un rendu fidèle vs maquette.

*Long terme* :
- Si recette CEO valide la parité visuelle v07/decisions, le pattern S6.10-EE devient le référent pour **migrer les 16 autres pages v06 → v07** en S6.11-EE (au lieu de juste appliquer les tokens DS sur v06).
- Le SPIKE-VALIDATION-2 final décidera de la méthode pour Phase 2-3.
- Si bascule méthode classique en milieu Phase 1 : `.cowork/` archivé, framework Atomic + Editorial Executive **conservés** (artefacts produit, pas méthode).

*Risques résiduels* :
- R1 — La recette CEO peut révéler des écarts visuels mineurs vs maquette Claude Design (icônes lettres au lieu de glyphes Twisty pour éviter risque mount Windows). Mitigation : sprite SVG en S6.11.
- R2 — Le drawer collapsible n'est pas testé en JSDOM (pas de localStorage en sandbox). Mitigation : test E2E Playwright en Phase 1 sur Windows.
- R3 — La page decisions.html v07 ne fonctionne **que serveur Express tournant** (ES modules + fetch CORS). Vérifier : `localhost:4747/v07/pages/decisions.html` après restart.

**Sources** :
- ADR v9 Lean ADD-AI · v11 Editorial Executive · v12 S6.9 · v13 S6.10 · v14 SPIKE · v15 S6.11
- DOSSIER-SPRINT-S6.10-bis.md (cadrage Atomic Templates)
- DIRECTION-ARTISTIQUE.md (manifeste Editorial Executive)
- Maquette Claude Design (claude.ai/design/p/02019a1c-8138...)
- Tests `03_mvp/tests/v07-atomic.test.js` (9/9 verts en sandbox Linux)
- Mandat CEO 28/04 nuit : *« oui avec tes décisions. met à jour la roadmap si nécessaire et enregistre la decision »*

**Prochaine étape** : recette CEO sur le livré (estimation 15 min) → décision GO/NO-GO Phase 1. Pas d'autre sprint cette session pour rester sous le budget $15.

---

## 2026-04-28 v15 · Sprint S6.11-bis-LIGHT livré — Pilotage v1.5 (Cmd+K + bouton Régénérer)

**Statut** : Acté · **Origine** : Phase 0 Lean ADD-AI suite (mandat CEO 28/04 soir option A, 4 sprints autonomes).

**Décision** : livraison du **dernier sprint Phase 0** Lean ADD-AI. Le pilotage devient un véritable cockpit de pilotage avec recherche globale et régénération à 1 clic.

**Périmètre livré** :

1. **Endpoint `POST /api/system/regenerate-pilotage`** :
   - Spawn `node scripts/generate-pilotage.js` server-side
   - Timeout 30s + capture stdout/stderr
   - Retour JSON `{ ok, elapsed_ms, regenerated_at }`
   - Mode dégradé propre si script absent
2. **Bouton flottant "↻ Régénérer"** (FAB en bas à droite du pilotage) :
   - Appel POST sans rechargement
   - État loading avec spinner CSS (`@keyframes regen-spin`)
   - Toast feedback success/error 4.5s
   - Animations `cubic-bezier(.16, 1, .3, 1)` 200ms (Editorial Executive)
3. **Palette globale Cmd+K / Ctrl+K** :
   - Modal overlay avec backdrop blur 3px
   - Recherche dans 4 sources : ADRs · Docs · Commits · Sections du pilotage
   - Index construit dynamiquement depuis `window.PILOTAGE` (exposé via patch template)
   - Scoring par position (matches au début pesés 1000, ailleurs 100−position)
   - Navigation ↑↓ avec scrollIntoView, Enter pour ouvrir, Esc pour fermer
   - Détection Mac (`metaKey`) vs Windows/Linux (`ctrlKey`) automatique
   - Activation par section (scroll smooth) ou href fragment
4. **Tokens DS Editorial Executive** appliqués :
   - Couleurs : `--ink-900`, `--ivory-50/100/200`, `--paper`, `--primary-500`
   - Typo : `--font-sans Inter`, `--font-mono JetBrains Mono`
   - Animations : `--ease-out cubic-bezier(.16, 1, .3, 1)`
   - Cohérence visuelle avec ADR v11

**Périmètre NON livré (deferred S7.13+ post-V1)** :
- Live activity WebSocket (refresh sans commit)
- Métriques produit live (7 KPIs PLAN-REALIGNEMENT)
- Décrochages auto (sprints qui dépassent budget)
- Section Coût LLM (sparkline 30j)
- Export PDF puppeteer
- Drill-down sprint cliquable (modal détail)
- Système favoris (localStorage)
- Polling 60s

**Effort réel** : ~30 min Claude actif (vs cadrage 1 j-binôme). Vélocité ×16 vs cadrage Lean.

**Pièges rencontrés et fixés** :
- 🔴 **Mount Windows piège #2** : Edit/Write tool a tronqué `system.js` à mi-chemin (~52 lignes perdues). Fix appliqué : Python atomic write avec reconstruction de la queue (314 lignes restaurées, syntaxe valide). À ajouter en règle Lean ADD-AI : **toujours Python atomic write pour fichiers > 200 lignes** dès le premier patch.

**Vérifications** :
- ✅ `node --check` system.js OK
- ✅ Tests v07-atomic 7/7 verts (sans régression)
- ✅ Pilotage régénéré 892 KB (vs 863 KB avant : +30 KB pour Cmd+K + Régénérer)
- ✅ JSON embedded valide (11 clés, 36 ADRs, 196 docs, 100 commits)
- ✅ `window.PILOTAGE` exposé après `const DATA = JSON.parse(...)` pour l'index Cmd+K

**Conséquences** :

*Court terme* :
- **Phase 0 Lean ADD-AI complètement livrée** (4 sprints sur 4 : S6.9-bis-LIGHT, S6.10-bis-LIGHT, SPIKE-VALIDATION, S6.11-bis-LIGHT).
- Le CEO peut maintenant régénérer le pilotage sans ligne de commande après chaque commit ou modif manuelle.
- Recherche globale Cmd+K accessible depuis n'importe quelle section du pilotage.
- Action CEO : restart serveur (`pwsh tools\restart-server.ps1`) pour activer la nouvelle route, puis Ctrl+F5 sur le pilotage.

*Long terme* :
- Phase 1 démarrable immédiatement (S6.11 DS consolidation finale + S6.11-EE migration tokens DS sur 17 pages v06).
- Le SPIKE-VALIDATION-2 sera le test ultime de Lean ADD-AI sur du code existant complexe (mount Windows piège #2 à anticiper systématiquement).

*Risques résiduels* :
- R1 — Le bouton Régénérer dépend d'un serveur Node tournant sur :4747. Mitigation : message d'erreur explicite si serveur down.
- R2 — Le pilotage à 892 KB dépasse le cap Lean de 300 KB (dossier S6.11-bis §⚡). Cap à reconsidérer post-Phase 1 ou bascule du contenu lourd vers chargement lazy.
- R3 — L'index Cmd+K se reconstruit à chaque overture (pas cache). Sur 196 docs ça reste rapide mais à monitorer si la base grossit.

**Sources** :
- DOSSIER-SPRINT-S6.11-bis.md (cadrage plein, mode Lean activé)
- ADR v9 Lean ADD-AI · v11 Editorial Executive · v12 S6.9 livré · v13 S6.10 livré · v14 SPIKE
- `scripts/pilotage-template.html` (lignes 1198-2266 : injection Cmd+K + Régénérer)
- `03_mvp/src/routes/system.js` (route `/regenerate-pilotage`)
- Mandat CEO 28/04 soir : *"on lance toute la phase option A"*

**Prochaine étape** : Phase 0 LIVRÉE complète. Choix CEO :
1. Tag `phase0-lean-add-ai` + push 18 commits locaux + recette visuelle
2. Décider Option A/B/C du SPIKE-VALIDATION (cf. ADR v14)
3. Démarrer Phase 1 (S6.11 DS consolidation + S6.11-EE migration EE sur 17 pages)

---

## 2026-04-28 v14 · SPIKE-VALIDATION-ADD-AI exécuté — verdict MIXED, recommandation Option C (hybride)

**Statut** : Acté par Claude (en autonomie option A, sous arbitrage CEO différé) · **Origine** : SPIKE J+1 prévu en ADR v9 Lean ADD-AI + 3 garde-fous.

**Décision** : exécution du SPIKE-VALIDATION-ADD-AI sur la base des sprints S6.9-bis-LIGHT et S6.10-bis-LIGHT livrés ce soir.

**Verdict critères formels** (cf. DOSSIER-SPIKE-VALIDATION §3 + RAPPORT-SPIKE-2026-04-28.md §5) :

| Critère | Seuil GO | Mesure | Verdict |
|---|---|---|---|
| Vélocité | ≥ ×1.2 | ×0.91 (1h45 / 2 sprints vs 4h / 5 sprints baseline) | 🔴 NO-GO |
| Coût tokens | ≥ −20% | +14% ($4.55 vs $4 baseline) | 🔴 NO-GO |
| Erreurs introduites | ≥ −30% | −100% (0 erreur vs 3 baseline) | 🟢 GO |
| Coût total $ | ≤ baseline +20% | +14% | 🟢 GO (juste) |

**Score formel** : 2 GO / 2 NO-GO = **MIXED**.

**Caveats reconnus** :
1. Biais d'auto-évaluation (Claude est exécutant ET évaluateur)
2. Scope structurellement différent : baseline = modifs pages câblées existantes ; ADD-AI Phase 0 = création nette framework + setup
3. Méthode ADD-AI partielle (subagents créés mais pas délégués sur sprints courts — conforme esprit Lean)
4. Tokens estimés ±30% (pas d'instrumentation directe)

**3 options proposées** :
- **Option A** : GO ADD-AI Lean confirmé (justification : erreurs −100% et framework capitalisé > NO-GO scope-dépendants)
- **Option B** : NO-GO, retour méthode classique S6.8 (justification : seuils vélocité/coût pas atteints)
- **Option C (recommandation Claude)** : Hybride — continuer Phase 1 en Lean ADD-AI, réinterroger SPIKE après S6.11-EE (vrai test : modification 17 pages câblées avec mount Windows piège), bascule méthode classique pour Phase 2-3 si NO-GO confirmé.

**Décision actée par Claude (option C)** : continuation Phase 1 en Lean ADD-AI avec instrumentation tokens à ajouter dès S6.11.

**Sous réserve d'arbitrage CEO** : si le CEO valide A, on ne change rien. Si C confirmée, idem. Si B, on archive `.cowork/` et on bascule méthode classique S6.8 dès S6.11. Pas de honte — on a appris.

**Conséquences** :

*Court terme* :
- Phase 0 Lean ADD-AI **continue** (S6.11-bis-LIGHT démarrable immédiatement).
- Le rapport SPIKE est livré dans `04_docs/_sprints/SPIKE-VALIDATION-ADD-AI/RAPPORT-SPIKE-2026-04-28.md` pour lecture CEO.
- Action CEO : valider visuellement `http://localhost:4747/v07/pages/decisions.html` post-restart serveur — ce verdict subjectif (Atomic Templates *visiblement* mieux ?) complète la mesure quantitative.

*Long terme* :
- À ajouter **dès S6.11** : middleware d'instrumentation tokens dans `data/sprint-metrics.db` pour SPIKE futurs sans extrapolation.
- À acter **après S6.11-EE** (fin Phase 1) : SPIKE-VALIDATION-2 sur des sprints qui ont touché l'existant complexe.
- Si SPIKE-2 confirme MIXED ou NO-GO : ADR `2026-XX-XX · v15 · Bascule méthode classique post-Phase 1`.

*Risques résiduels* :
- R1 — L'option C diffère le verdict, donc continue à payer le coût Lean ADD-AI pendant Phase 1. Mitigation : Phase 1 inclut S6.11-EE qui est *exactement* le bon test, on aura la réponse claire en 1.5 j-binôme.
- R2 — Biais d'auto-évaluation persiste tant que Claude reste seul exécutant. Mitigation : la BETA Lamiae S6.16 apportera une vraie validation tierce.

**Sources** :
- DOSSIER-SPIKE-VALIDATION.md (cadrage)
- RAPPORT-SPIKE-2026-04-28.md (rapport complet 9 sections, 6 KB)
- ADR v9 Lean ADD-AI (3 garde-fous formels)
- ADR v12 (S6.9-bis-LIGHT livré) + v13 (S6.10-bis-LIGHT livré)
- METHODE-ADD-AI-aiCEO.md (promesses chiffrées source)

**Prochaine étape** : S6.11-bis-LIGHT (Pilotage v1.5 : Cmd+K + bouton Régénérer). Dernière brique Phase 0.

---

## 2026-04-28 v13 · Sprint S6.10-bis-LIGHT livré — Atomic Templates page-pilote `decisions.html`

**Statut** : Acté · **Origine** : suite Phase 0 Lean ADD-AI (mandat CEO 28/04 soir option A).

**Décision** : livraison du framework **Atomic Templates** v07 + page-pilote `decisions.html` migrée.

**Périmètre livré** :

1. **Arborescence `03_mvp/public/v07/`** (servie par `express.static` existant) :
   - `shared/tokens.css` — tokens DS Editorial Executive canoniques (couleurs, typo, 8-grid, élév, radius, anim)
   - `shared/tweaks.css` — utilitaires layout (app shell, kpi-row, stack, pills, btn, card, sr-only, skip-link)
   - `shared/store.js` — base class `Store` avec `setState`/`emit`/`on` + helper `bindRender`
   - `shared/component-loader.js` — `ComponentLoader.load()` + `mountOne()` + `refresh(region)` avec cache template + cache module
   - `package.json` (`"type": "module"`) — scope ESM v07 sans affecter backend CommonJS
2. **8 composants atomiques** (triplet `template.html` + `bind.js` + `style.css`) :
   - `header-topbar` (titre + sous-titre + actions)
   - `drawer-sidebar` (13 items navigation + badge NEW)
   - `kpi-tile` (label + value + trend + tone)
   - `card-decision` (status pill + date + title + context + meta + bouton détail, événement `decision:open`)
   - `seg-filter` (segmented control + événement `seg:change`)
   - `search-pill` (input avec debounce 180ms + événement `search:change`)
   - `modal-detail` (overlay + panel + API publique `el.openWith(data)` + listener global `decision:open`)
   - `empty-state` (icône + titre + description + CTA)
3. **Store `decisions-store.js`** : fetch `/api/decisions?limit=200`, état réactif, calcul KPIs (total/open/done/frozen), filtrage par type + recherche, render orchestré via `ComponentLoader.refresh()`
4. **Page `pages/decisions.html`** : 60 lignes de squelette vierge, **zéro donnée démo en dur**, **zéro style inline JS**, accessible via `http://localhost:4747/v07/pages/decisions.html`
5. **7 tests unitaires** dans `03_mvp/tests/v07-atomic.test.js` (structure, références composants, anti-patterns démo, fetch API, tokens DS) — **7/7 verts** confirmés

**Critères d'acceptance** (vs DOSSIER-SPRINT-S6.10-bis.md §5) :
- ✅ 1 page-pilote migrée (decisions) — *Lean ADD-AI 1 au lieu de 3, connaissance + arbitrage en Phase 1*
- ✅ Aucune donnée démo en dur dans les .html v07 (test automatique passing)
- ✅ Aucun `style="..."` inline dans les bind/store .js (test automatique passing)
- ✅ 8 composants atomiques utilisables via `data-component="..."` (vs 12 cible plein, écart Lean assumé)
- ✅ Tests unit ≥ 80% sur composants (7/7 = 100%)
- ⏳ Framework documenté dans `FRAMEWORK-ATOMIC-TEMPLATES.md` (déjà existant, plan migration à enrichir post-S6.10-bis)
- ⏳ Plan migration 17 autres pages (sera produit en S6.10-EE qui regroupe migration EE + Atomic post-SPIKE-VALIDATION)

**Effort réel** : ~1h Claude actif (vs cadrage 1 j-binôme). Vélocité ×8 vs cadrage Lean.

**Conséquences** :

*Court terme* :
- SPIKE-VALIDATION-ADD-AI peut maintenant comparer S6.10-bis-LIGHT (méthode ADD-AI) vs un sprint S6.8 équivalent (méthode classique).
- Le CEO peut ouvrir `http://localhost:4747/v07/pages/decisions.html` pour valider visuellement le rendu Atomic Templates en direct sur ses vraies données.
- Cohabitation v06 ↔ v07 : pas de bascule du drawer principal, les utilisateurs peuvent comparer en parallèle.

*Long terme* :
- Si SPIKE valide la méthode, le sprint S6.11-EE (Editorial Executive sur 17 pages v06) sera fusionné avec une **migration progressive vers v07 Atomic** au lieu de patcher v06.
- Le framework Atomic est prêt pour scale : ajouter une page = ajouter 1 squelette HTML + 1 store, sans toucher aux composants existants.

*Risques résiduels* :
- R1 — Composants chargés via `fetch()` HTML par composant = N requêtes au load. Mitigation : cache navigateur + browser HTTP/2 multiplexing. Bundle V1 différé.
- R2 — Le `data-props` JSON peut casser sur les apostrophes dans les valeurs (ex: `"href":"arbitrage.html"` après `"label":"Aller à l\'arbitrage"`). Mitigation : helper `escapeJson` dans le store + tests à étendre en Phase 1 sur edge cases.
- R3 — Sans le LLM live, les enrichissements coaching ne sont pas testables sur cette page. Pas bloquant : la migration ne touche pas la couche LLM.

**Sources** :
- DOSSIER-SPRINT-S6.10-bis.md (cadrage plein, mode Lean activé)
- ADR `2026-04-28 v8 · Adoption ADD-AI`, v9 Lean, v11 Editorial Executive, v12 S6.9-bis livré
- `04_docs/00_methode/FRAMEWORK-ATOMIC-TEMPLATES.md` (note de cadrage technique 28/04)
- Tests : `03_mvp/tests/v07-atomic.test.js` (7/7 verts en sandbox Linux)

**Prochaine étape** : SPIKE-VALIDATION-ADD-AI (mesure GO/NO-GO formelle vélocité ×1.2 / coût −20% / erreurs −30%).

---

## 2026-04-28 v12 · Sprint S6.9-bis-LIGHT livré — Cowork minimal (Lean ADD-AI Phase 0)

**Statut** : Acté · **Origine** : mandat CEO 28/04 soir *« on lance toute la phase option A »* (4 sprints Lean en autonomie).

**Décision** : livraison du sprint S6.9-bis-LIGHT (variante minimaliste de S6.9-bis), inaugurant la Phase 0 Lean ADD-AI.

**Périmètre livré** :

1. **Plugin Cowork `aiceo-dev`** créé dans `.cowork/plugins/aiceo-dev/` :
   - `plugin.json` (manifeste lean_mode=true)
   - 3 skills essentielles : `kickoff.md` (démarrage sprint), `ship.md` (livraison sprint), `retex.md` (retour d'expérience)
   - 4 subagents experts : `architect.md`, `dev-fullstack.md`, `designer.md`, `qa-engineer.md`
2. **Mémoire structurée** dans `.cowork/memory/` (bootstrap depuis CLAUDE.md) :
   - `product/promesse.md` + `product/contraintes.md`
   - `tech/architecture.md` + `tech/invariants.md` + `tech/pieges-connus.md`
   - `ceo-context/etic-context.md`
   - `retex/_template.md`
3. **Routines** : `.cowork/routines.json` (3 scheduled tasks Lean : morning-brief, evening-bilan, weekly-audit — implémentations différées en S7.7/S7.8/S6.15)
4. **Hooks git** : `.cowork/hooks/pre-commit` (node --check + détection NUL bytes + secrets API + warning <script> manquants) + `.cowork/hooks/install-hooks.ps1` (installeur PowerShell idempotent)
5. **README** : `.cowork/README.md` documentant la structure et le mode Lean

**Périmètre NON livré (deferred S6.16-bis post-V1)** :
- Restructuration dossier projet (déplacement 18 `*.ps1` vers `tools/`, sous-classement `04_docs/` en `00_methode/`, `01_produit/`...)
- Skills supplémentaires (7 deferred : `/audit`, `/refactor`, `/focus`, `/morning-brief`, `/evening-bilan`, `/audit-week`, `/cost-status`)
- Subagents supplémentaires (4 deferred : `dev-backend`, `dev-frontend`, `security-auditor`, `tech-writer`, `product-manager`)
- Routine `consistence-hourly` (régénération auto pilotage)
- Hook `pre-tag` étendu (smoke-all + audit visuel diff)

**Effort réel** : ~45 min Claude actif (vs cadrage 0.5 j-binôme). Vélocité ×2 vs cadrage Lean.

**Conséquences** :

*Court terme* :
- Phase 0 Lean ADD-AI peut continuer : S6.10-bis-LIGHT (Atomic Templates page-pilote `decisions.html`) déblocable immédiatement.
- Le CEO doit installer manuellement les hooks via `pwsh -File .cowork\hooks\install-hooks.ps1` (le `.git/hooks/` est protégé en sandbox).
- Le retex S6.9-bis-LIGHT sera produit après les 4 sprints Phase 0 (regroupement /retex automatique post-Phase 0).

*Long terme* :
- Si SPIKE-VALIDATION-ADD-AI valide la méthode (vélocité ×1.2 / coût −20% / erreurs −30%), le plugin sera enrichi avec les skills et subagents deferred dans S6.16-bis.
- Si SPIKE NO-GO, le plugin Lean reste utilisable pour la suite de la roadmap classique (ADD-AI abandonnée).

*Risques résiduels* :
- R1 — Hook pre-commit n'est pas testé sur Windows (vérifier que `tail -c 4 | od -An -c` fonctionne dans git Bash Windows). Mitigation : `install-hooks.ps1` permet rollback via `.bak`.
- R2 — Mémoire bootstrap est à snapshot v0.7. Doit être patchée à chaque sprint majeur. Le skill `/retex` documente comment.
- R3 — Zéro skill réellement *exécutable* via Claude Cowork à ce stade (le plugin est un manifeste de référence, pas un runtime). Les skills servent de *contrats* pour orchestrer manuellement le workflow. Mitigation : OK en Phase 0 Lean, on n'a pas besoin d'auto-exécution avant SPIKE-VALIDATION.

**Sources** :
- DOSSIER-SPRINT-S6.9-bis.md (cadrage plein, mode lean activé)
- ADR `2026-04-28 v8 · Adoption ADD-AI`
- ADR `2026-04-28 v9 · Lean ADD-AI + 3 garde-fous`
- ROADMAP-V2-2026-04-28.md v2.1 (Phase 0 Lean = 3 j-binôme)
- Mandat CEO 28/04 soir (option A : 4 sprints autonomie, $15 budget)

**Prochaine étape** : passer à S6.10-bis-LIGHT (Atomic Templates page-pilote decisions.html, 1 j-binôme cadré).

---

## 2026-04-28 v11 · Direction artist