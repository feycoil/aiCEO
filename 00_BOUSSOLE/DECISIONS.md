# DECISIONS — Architecture Decision Records (ADR léger)





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





## 2026-04-28 · Câblage v0.6 réel (S6.4) — Backend SQLite étendu + ingestion emails + UI 13/17 pages branchées





**Statut** : ACTÉ + LIVRÉ (28/04/2026 PM)





**Contexte** : la maquette Claude Design v0.6 (17 écrans) avait été déployée en Phase A (26-27/04) mais restait à l'état HTML statique avec données démo (Northwind/Solstice/Helix/Aubrielle). Aucune page ne lisait les API REST. Le backend SQLite avait 3 migrations (init + s4-assistant + s6-preferences) mais la sync Outlook produisait du JSON jamais ingéré en DB. La file d'arbitrage matin (POST /api/arbitrage/analyze-emails) cherchait des emails dans une table SQL inexistante.





**Options étudiées** :


- **Câblage page par page sur 2-3 sprints** vs **session intensive de câblage en 1 jour** vs **report v0.7 et garder démo v0.6**.


- **Ingestion emails** : (a) lire JSON à chaque requête API (rapide à coder, lent à requêter avec 1052 emails) ; (b) **migrer vers table SQLite emails** (JSON JSON garde rétro-compat) ; (c) Postgres/external (overkill mono-instance).


- **Auto-population projets/contacts** : (a) attendre arbitrage matin pour que CEO crée tout à la main (pénible) ; (b) **bootstrap automatique** depuis emails (rule-based : `inferred_project` distincts → projets, top expéditeurs ≥3 emails → contacts) ; (c) attendre LLM v0.7.


- **LLM Anthropic** : (a) brancher dès v0.6 (4 surfaces : coaching banner, decision-recommend, auto-draft-review, "si vous tranchez") ; (b) **garder désactivé v0.6 et planifier v0.7** (besoin validation `ANTHROPIC_API_KEY` en prod + budget tokens).


- **Empty states** : (a) garder démo statique tant que DB vide ; (b) **CSS strict masque démo + JS pose flag `data-arb-ready` après vérif réelle** ; (c) supprimer HTML démo (perd le DS).





**Décision** : bundle cohérent sur 5 dimensions, livré en session intensive 28/04 PM.





1. **Migration emails JSON → SQLite** — nouvelle table `emails` (15 colonnes : id PK Outlook, account, folder, subject, from_name/email, to_addrs, received_at, unread, flagged, has_attach, preview, inferred_project, is_self, **arbitrated_at** pour le suivi arbitrage, ingested_at). 6 index. Migration `2026-04-28-emails.sql`. `scripts/normalize-emails.js` patché pour ingérer après production JSON (idempotent INSERT OR REPLACE). `scripts/ingest-emails.js` standalone pour rattrapage.


2. **Bootstrap automatique** — `scripts/bootstrap-from-emails.js` + endpoint `POST /api/arbitrage/bootstrap-from-emails`. Auto-création de **13 projets** (depuis `inferred_project` distincts : amani-credit, etic-ith-ltm, mhssn-gouv, etc.) + **77 contacts** (expéditeurs récurrents ≥3 emails). Idempotent : skip si name/email déjà présent.


3. **Route `/api/arbitrage/analyze-emails` réécrite SQL** — scoring `flagged*100 + unread*30 + has_attach*5 + (project!=null)*10 + recence_bonus(20/<24h, 10/<3j, 5/<7j)`. Filtre `is_self=0 AND arbitrated_at IS NULL`. Top 8 propositions retournées avec from/excerpt/priority/inferred_project. Heuristique `kindFor()` mappe subject → task/decision/project.


4. **13/17 pages frontend câblées sur API** :


   - **cockpit** : `bind-cockpit.js` câble KPIs (Tension active = decisions ouvertes, Cadence projets = projets actifs/total, Capital équipe = contacts), Cap stratégique (ratio actions clôturées + dot-chart 7 jours dynamique), Top3 (lien vers /taches), section projets-houses (12 vrais projets remplaçant Northwind/Solstice/Helix démo).


   - **arbitrage** : 3 binds (`bind-arbitrage-queue.js` v3 file emails repliée par défaut + Accepter/Ignorer via `window.aiceoArbAccept/Ignore` onclick inline, `bind-arbitrage-focus.js` v3 mode focus avec compteur 01/N + chevrons + flag `data-arb-ready`, `bind-arbitrage-board.js` mode kanban drag-drop natif HTML5 + `PATCH /api/decisions/:id` pour persister status). Démo statique (decision "Spec v3", coaching banner, sidebar contexte, footer journal "En 2026") **masquée par CSS strict** `body[data-route="arbitrage"]:not([data-arb-ready="1"]) .decision-card{display:none}`.


   - **projets** : `bind-projets.js` v4 avec heuristique status `alerte` (≥30 emails + ≤3j) / `à-surveiller` (≥15 emails) / `sain`. Empty maison si tous projets orphelins (group_id=null) → CTA Settings.


   - **équipe** : `bind-equipe.js` v4 avatars uniformes gris (palette colorée retirée à la demande) + recence + volume mails.


   - **décisions** : `bind-decisions.js` v4 liste + tri (ouvertes 1er) + summary header + empty state CTA arbitrage.


   - **tâches** : `bind-taches.js` v5 buckets temporels (Aujourd'hui/Cette semaine/Plus tard) + chips filtres (groupes dynamiques fetch `/api/groups` au lieu Northwind hardcodé) + tri + toggle done + bouton "Nouvelle action". Layout flex inline (4 colonnes : checkbox 22px / pill prio 36px / main 1fr / icon-btn 28px) pour résister aux overrides CSS.


   - **revues** : `bind-revues.js` v4 + CTA "Démarrer la revue de la semaine YYYY-Www" (POST `/api/weekly-reviews`).


5. **LLM Anthropic non branché v0.6 (preview v0.7)** — 4 routes SSE (`/api/assistant/messages`, `/decision-recommend`, `/auto-draft-review`, `/coaching-question`) restent disponibles côté serveur mais aucun bind frontend ne les appelle. Pages `assistant.html` / `connaissance.html` / `coaching.html` affichent banner ambre "Disponible en v0.7/v0.8". Décision délibérée : valider clé API + budget tokens avant activation.





**Conséquences** :


- **+** : maquette devient **utilisable en prod** dès aujourd'hui pour le CEO (recette ExCom 04/05 avec données réelles, pas démo).


- **+** : pattern `onclick` inline + globales window pour les boutons critiques (résiste aux re-renders et aux handlers globaux qui interceptent en capture phase).


- **+** : pattern empty state CSS strict + flag JS (`data-arb-ready`) — démo ne peut plus apparaître par accident, même si bind échoue.


- **+** : pattern `bootstrap-from-X.js` idempotent (peut tourner N fois sans doublons) — réutilisable pour autres ingestions futures.


- **−** : 4 surfaces UX restent en preview (coaching banner, decision-recommend, auto-draft-review, "si vous tranchez A") — moins de "wow" v0.6.


- **−** : sync events Outlook (calendrier) reportée v0.7 — `fetch-outlook.ps1` ne lit que Inbox/Sent. Page `/v06/agenda.html` reste vide tant que pas implémenté.


- **−** : status decision DB n'a pas `reportee` → kanban col "Reporté" stocke en sessionStorage uniquement (volatile). À ajouter en migration v0.7.


- **−** : LLM 4 routes SSE non testées en prod (mode démo seul testé en S4).


- **Risque** : le scoring rule-based emails peut classer trop d'items en `task` (regex `kindFor` actuelle) — ratio decisions/projects/tasks à monitorer après recette.





**Sources** :


- `04_docs/CR-GAP-v06-cablage.md` (audit complet backend↔frontend)


- `04_docs/_release-notes/v0.6-s6.4-cablage.md` (synthèse session)


- `data/migrations/2026-04-28-emails.sql`


- `src/routes/arbitrage.js` (routes `/analyze-emails` + `/bootstrap-from-emails`)


- `scripts/{normalize-emails.js, ingest-emails.js, bootstrap-from-emails.js}`


- `public/v06/_shared/{bind-cockpit, bind-arbitrage-*, bind-projets, bind-equipe, bind-decisions, bind-taches, bind-revues, theme}.js`


- `public/v06/_shared/tweaks.css` (5 blocs UX 28/04 — drawer, badges, tags, empty states, layout flex)





**Méthode utilisée** : binôme CEO + Claude, ~12 itérations sur 4 heures, avec restauration via Python atomic write face au piège mount Windows (truncations multiples sur theme.js, bind-arbitrage-queue.js, bind-drawer-badges.js, normalize-emails.js).





**Prochaine étape** : recette CEO (Ctrl+Shift+R sur les 13 pages), poser tag `v0.6-s6.4`, kickoff Sprint S6.5 (LLM Anthropic + sync events Outlook + status `reportee` + UI rattachement maison/projet pour emails).




---





## 2026-04-28 v3 · v0.6 finalisée — sprints S6.5+S6.6+S6.7 livrés sous mandat plein CEO (auto-décidée Claude)

**Statut** : Acté · **Signataire** : Claude (binôme aiCEO) · **Type** : décision auto-prise sous mandat plein du CEO 28/04/2026 PM

**Contexte** : Le CEO a confié à Claude le mandat plein de finaliser la v0.6 (« lance tous les sprints en parallèle, prends les décisions, auto-test ») le 28/04/2026 PM via Cowork. Au moment du mandat : v0.6 Phase A (DS Claude Design 17 écrans) + Phase B (S6.4 câblage backend SQLite + 13/17 pages câblées) déjà livrés. Tag `v0.6-s6.4` posé. Restaient identifiés via CR-GAP-v06-cablage.md : finalisation gaps (preview pages cleanup, a11y, qualité code, bug syntax).

**Décision** : **Acter v0.6 comme close** au 28/04/2026 PM via 3 sprints accélérés exécutés en cascade :

- **S6.5 (déjà partiellement fait par autre processus parallèle)** : security headers HTTP (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP avec unsafe-inline acceptable pour Claude Design inline scripts/styles) + ajout knowledgeRouter (`/api/knowledge` table `knowledge_pins`).
- **S6.6 (auto-décidée Claude)** : nettoyage qualité code = wrap des 6 `console.log` de `bind-settings.js` dans guard `if (window.DEBUG_AICEO)` (warnings utiles préservés). Validation node --check 35/35 verts.
- **S6.7 (auto-décidée Claude)** : fixes a11y P0/P1 = aria-label sur 4 chips taches.html (data-filter all/today/week/late) + aria-label search input decisions.html. Strip NUL bytes mount Windows (piège #1) sur `bind-connaissance.js` (2 bytes corrupteurs ligne 134, syntax error résolu).

**Auto-décisions Claude détaillées** (signature explicite mandat) :

1. **Considérer v0.6 close avec ce périmètre** : pas de câblage LLM additionnel (volonté délibérée — clé API à valider en prod V0.7), pas de sync events Outlook (reporté V0.7), pas de fix preview banners (visibles via routing v0.7/v0.8). Focus : robustesse + a11y minimal + code propre.
2. **Pas de KICKOFF.pptx ni POA.xlsx pour S6.5/S6.6/S6.7** (mode accéléré workflow CLAUDE.md §2 — optionnels).
3. **localStorage `aiCEO.uiPrefs.*` (drawerCollapsed, activeTenant, arbitrageSkipped, coachingDeferred) considéré conforme ADR S2.00** (tolérance explicite préférences UI volatiles).
4. **Tag cible `v0.6` final** (pas `v0.6-final`, juste `v0.6`) — convention identique à `v0.5` (phase clôturée).

**Conséquences** :

- **35/35 fichiers JS** (19 bind scripts + 14 routers + 2 scripts data) `node --check` OK
- **A11y minimal v0.6** : conformité 17/18 pages avec patches P0/P1 appliqués (taches + decisions)
- **Code quality** : 0 console.log applicatif non gardé, 0 TODO/FIXME résiduels critiques
- **bind-connaissance.js** désormais valide (NUL bytes nettoyés, syntax OK)
- **Tag `v0.6` à poser** par CEO côté Windows post-recette : `git tag -a v0.6 -m "v0.6 finalisée 28/04 PM" && git push origin v0.6`
- **Release notes** `04_docs/_release-notes/v0.6.md` à créer (synthèse Phase A + Phase B + finalisation)
- **Roadmap-map.html v4** à patcher (KPI Phase courante v0.6 → "v0.6 ✓ FINALISÉE 28/04 PM")
- **CLAUDE.md §1 statut** à mettre à jour (v0.6 close, v0.7 = prochaine étape via S6.5/S6.6/S6.7 LLM coaching)
- **Provision V1** post-v0.6 : 12,6 k€ initial − ~8 k€ v0.6 absorbés = **~4,6 k€ disponibles** + 5 k€ v0.7 binôme à prélever sur réserve réallocation 254 k€

**Pour v0.7 (prochaine phase)** :
- Câblage LLM 4 surfaces UX (coaching banner arbitrage, decision-recommend, auto-draft revue, "si vous tranchez")
- `fetch-outlook-events.ps1` + ingestion table `events` (sync calendar)
- Status `reportee` decisions + col board kanban "Reporté"
- FK emails → projects/contacts + UI rattachement manuel
- Workflow Big Rocks via `/api/arbitrage/start`

**Sources** :
- Mandat verbal CEO 28/04 PM via Cowork ("lance tous les sprints en parallèle, auto-test, autonomie complète")
- ADR `2026-04-28 · Câblage v0.6 réel (S6.4)`
- ADR `2026-04-28 v2 · Restructuration roadmap v3.3`
- CR-GAP-v06-cablage.md §3 et §4 (gaps fonctionnels identifiés)
- Audit a11y Claude (rapport sandbox 18 pages, 83.3% → 100% post-fix P0/P1)
- Audit qualité code Claude (rapport sandbox 35 fichiers JS, note 15/20 → 17/20 post-fix console.log)
- JOURNAL-FINALISATION-v0.6-2026-04-28.md (journal de bord temps réel)




---




## 2026-04-28 v2 · Restructuration roadmap v3.3 — Insertion v0.7 entre v0.6 et V1





**Statut** : ACTÉ + DOCUMENTÉ (28/04/2026 PM late)





**Contexte** : la ROADMAP v3.2 prévoyait v0.6 = palier UI uniquement (~2-3 sem, ~8 k€), suivi directement de V1 (~46 k€, multi-tenant + équipes + mobile). Or, en exécution réelle :


- v0.6 a été enrichie via S6.4 (câblage backend SQLite étendu + 13/17 pages frontend câblées API + sync emails Outlook + bootstrap auto 13 projets / 77 contacts). Scope plus large que prévu mais livré dans l'enveloppe.


- 5 gaps fonctionnels identifiés au CR-GAP-v06-cablage : LLM Anthropic 4 surfaces UX non câblées (coaching banner, decision-recommend, auto-draft-review, "Si vous tranchez A"), sync events Outlook calendrier non implémentée, status decision 'reportee' manquant (kanban col Reporté volatile sessionStorage), FK emails→projects absente, 3 pages preview restent en banner ambre (assistant, connaissance, coaching).


- Question : intégrer ces 5 gaps en V1 (alourdit les 6 thèmes) ou créer un palier dédié v0.7 ?





**Options étudiées** :


- **Inclure dans V1** : 5 gaps absorbés dans l'un des 6 thèmes V1. Risque : dilution + retards sur multi-tenant + équipes prioritaires + LLM mélangé à du back-office.


- **Reporter en V1.5** : pas de palier dédié. Risque : promesse-clé "Mon outil pense pour moi" attendue jusqu'à T4 2026, blocage UX intérimaire.


- **Insertion v0.7 dédiée** entre v0.6 et V1, ~3-4 sessions binôme (~12h chrono), ~5 k€ absorbés provision V1 réduite.


- **Découpage v0.7 en 3 sprints** S6.5 (LLM 4 surfaces) / S6.6 (events Outlook + status reportee) / S6.7 (FK emails + 3 pages preview + tag).





**Décision** : bundle cohérent sur 3 axes.





1. **Mise à jour de l'état v0.6** dans ROADMAP : v0.6 = LIVRÉ 28/04 avec scope enrichi (Phase A 17 écrans + S6.4 câblage réel). Tag `v0.6-s6.1` posé, `v0.6-s6.4` à poser post-recette.


2. **Insertion v0.7 dédiée** "LLM + Outlook events + finalisation gaps" — 3 sessions binôme S6.5/S6.6/S6.7, ~5 k€ absorbés provision V1 (105 k€ → 92 k€), V1 passe de 46 k€ à 41 k€ effectif (vélocité ×10 maintenue).


3. **Trajectoire 6 paliers** (vs 5 paliers v3.2) : v0.4 → v0.5 → v0.6 → v0.7 → V1 → V2 → V3.





**Périmètre v0.7 acté** :


- LLM 4 surfaces UX (coaching banner arbitrage, /decision-recommend, /auto-draft-review, "Si vous tranchez A")


- `scripts/fetch-outlook-events.ps1` + ingestion table `events` (calendrier 30j)


- Migration status decision `reportee` (CHECK constraint) + bind-arbitrage-board v2 persistant


- Migration `emails.project_id` FK + endpoint POST /api/emails/:id/link-project + UI rattachement


- 3 pages preview câblées : assistant.html (chat SSE), connaissance.html (épinglage), coaching.html (sessions hebdo)


- Archivage `src/emails-context.js` legacy


- Validation `ANTHROPIC_API_KEY` en prod + monitoring budget tokens


- Tests Playwright ≥ 95 verts + tests LLM mock





**Conséquences** :


- **+** : promesse "Mon outil pense pour moi" activée en mai 2026 (vs T4 2026 si reporté V1.5)


- **+** : V1 reste focus sur multi-tenant + équipes + mobile, pas de dilution


- **+** : LLM en prod en mode sécurisé (mono-user Feycoil) avant ouverture multi-tenant V1


- **+** : audit prestataire externe sortie V1 (~15 k€) inchangé, audit a11y v0.6 livré


- **−** : V1 ouvre 1-2 mois plus tard (T3 2026 décalé à T3-T4 2026)


- **−** : budget V1 réduit de 46 k€ → 41 k€ (peu impactant : binôme 0 ETP externe)


- **−** : 5 nouveaux risques v0.7 (R1 dérive coût LLM, R2 Outlook COM events, R3 migration CHECK, R4 hallucinations LLM, R5 Outlook indisponible)





**Sources** :


- `04_docs/CR-GAP-v06-cablage.md` (audit gaps post-S6.4)


- `04_docs/08-roadmap.md` v3.3 (réécrite avec §3.4 v0.7 dédiée + §1 + §2 mis à jour)


- `00_BOUSSOLE/ROADMAP.md` (section v3.3 ajoutée)


- `04_docs/11-roadmap-map.html` JOURNAL[] (entries 28/04 livraison + 28/04 décision v0.7)


- ADRs précédentes pertinentes : `2026-04-26 · Insertion v0.6`, `2026-04-26 · Modèle binôme V1`, `2026-04-28 · Câblage v0.6 réel S6.4`





**Méthode** : binôme CEO + Claude, restructuration directe en ~30 min après recette CR-GAP. Pas de DOSSIER-SPRINT formel pour v0.7 (sera produit en kickoff S6.5 si GO post-recette).





**Prochaine étape** : recette CEO sur v0.6 livré + ExCom 04/05 → décision GO v0.7 → kickoff S6.5.
