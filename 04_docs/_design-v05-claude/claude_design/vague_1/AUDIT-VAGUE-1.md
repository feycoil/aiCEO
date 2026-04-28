# AUDIT VAGUE 1 — Livraison Claude Design vs S6.1 livré

**Date** : 2026-04-26
**Auteur** : binôme CEO + Claude
**Objet** : inventaire de la livraison Claude Design Phase 1 + plan d'intégration

---

## 1. Inventaire de la livraison

### `claude_design/vague_1/` — 8.9 Mo, 74 fichiers utiles (74 miroirs `~BROMIUM/` à ignorer — sécurité Edge)

#### `design-v05/` — version intermédiaire (13 pages, retouches v0.5 actuelle)
| Fichier | Taille | Usage |
|---|---|---|
| 13 HTML | ~variable | agenda, arbitrage, assistant, contacts, decisions, evening, groupes, index, maquettes, projet, projets, revues, taches |
| `_shared/app.css` | ? | style v0.5 retouché |
| `_shared/colors_and_type.css` | ? | tokens v0.5 |
| `_shared/shell.js` | ? | layout JS |
| `_shared/sidebar.html` | ? | navigation partagée |

→ **Référence** : pas la cible v0.6, juste une version intermédiaire. Garder mais ne pas adopter.

#### `design-v06/` — **CIBLE OFFICIELLE v0.6** ⭐
| Fichier | Taille | Usage |
|---|---|---|
| `hub.html` | 15.5 ko | **Page d'accueil v0.6** — navigation centrale entre les 7 écrans |
| `index.html` | 34.9 ko | Cockpit (greeting Aubrielle + Top-3 + Agenda + Projets) |
| `arbitrage.html` | 36.6 ko | Arbitrage matin (focus + kanban drag-drop) |
| `evening.html` | 22.4 ko | Boucle du soir (humeur + énergie + top-3 + streak) |
| `onboarding.html` | 14.0 ko | Wizard onboarding (étape 3/5) |
| `settings.html` | 31.4 ko | Réglages utilisateur + tenant |
| `components.html` | 19.0 ko | **Storybook Claude Design** (mini référence visuelle) |
| `manifest.webmanifest` | 1.7 ko | PWA manifest |
| `sw.js` | 1.5 ko | Service worker (cache-first shell + fonts) |
| `_shared/app.css` | 36.0 ko | **Style monolithique** (drawer, topbar, btn, cards, kpi, dot-chart, etc.) |
| `_shared/colors_and_type.css` | 10.5 ko | Tokens (généré depuis tokens.json) + @font-face |
| `_shared/tweaks.css` | 3.5 ko | Panneau "Tweaks" (in-page knobs DS) |
| `_shared/app.js` | 10.6 ko | Toast / modal / sheet / drawer / tweaks (vanilla) |
| `_shared/icons.svg.html` | 14.9 ko | **54 icônes** (sprite chargé via fetch) |
| `_shared/fonts/*` | ~2 Mo | Fira Sans 100→900 + Aubrielle + Sol Thin (self-hosted) |

#### `uploads/` — les 17 PJ originaux du prompt v3.1 (référence)
Tokens, persona, datasets, microcopy, responsive, i18n, architecture atomique, etc. Identique au bundle préparé.

---

## 2. Comparaison structurelle Claude Design v0.6 vs S6.1 livré

| Aspect | Claude Design v0.6 | Ma S6.1 livrée | Verdict |
|---|---|---|---|
| **Nombre d'écrans** | 7 (hub + cockpit + arbitrage + evening + onboarding + settings + storybook) | 1 (storybook seul) | Claude Design **largement supérieur** |
| **Architecture CSS** | 3 fichiers monolithiques (~50 ko cumulés) | 7 couches ITCSS, 30 fichiers (~86 ko cumulés) | Claude Design plus **pragmatique**, S6.1 plus **scalable** |
| **Naming components** | Pragmatique court : `.btn.ghost`, `.drawer-item`, `.kpi-tile`, `.card-title`, `.house-northwind` | BEM strict : `.c-button--ghost`, `.c-drawer__item`, `.c-modal__header` | **Incompatibles**. Choisir un seul. |
| **Sprite icônes** | 54 icônes, préfixe `i-` (i-home, i-arbitrage, i-coaching, i-house...) | 30 icônes, préfixe `icon-` (icon-home, icon-search...) | Claude Design plus **complet** (54 vs 30 + custom métier comme `i-arbitrage`, `i-evening`) |
| **JS partagé** | `app.js` (toast, modal, sheet, drawer, tweaks) ~10 ko | Aucun (vanilla inline dans gallery) | Claude Design **mieux structuré** |
| **PWA** | manifest + service worker | Aucun | Claude Design **bonus** |
| **Patterns coaching** | Greeting Aubrielle font script + Posture footer + Coaching strip | Tags `--coaching` + EmptyState `--coaching` | Claude Design plus **incarné** |
| **Polices self-hosted** | 11 fichiers OTF/TTF dans `_shared/fonts/` | Aucun (référence fonts via assets) | Claude Design **autonome** |
| **Responsive** | Desktop + tablet + mobile (drawer collapsible 240↔60 + bottom-tab mobile + safe-area-inset) | Desktop + breakpoints simples | Claude Design plus **abouti** |
| **Tweaks panel** | Panneau in-page pour ajuster tokens DS à la volée | Aucun | Claude Design **outil designer** |

---

## 3. Conclusion de l'audit

**Les 2 systèmes sont fondamentalement incompatibles** au niveau naming et architecture. Tenter de fusionner créerait du double travail et un mix instable.

**Forces respectives** :
- **Claude Design v0.6** = livraison produit prête à brancher. 7 écrans réels. Cohérent. Connait le bundle complet (17 PJ + image étalon Twisty).
- **Ma S6.1** = rigueur DS atomic, 27 composants BEM strict, scalable multi-tenant V1+. Mais sans cible visuelle vue → divergence forte.

**Décision recommandée** : **adopter intégralement Claude Design v0.6** comme implémentation v0.6, et **archiver S6.1** comme alternative atomic strict pour V2/V3 (quand le besoin scalabilité multi-tenant + i18n RTL deviendra critique).

**Justifications** :
1. Claude Design a livré 7 écrans **fonctionnels** — c'est le saut produit attendu en v0.6.
2. La maquette est **cohérente** (un seul auteur, un seul style, alignée bundle 17 PJ + image Twisty).
3. Le sprite icônes Claude Design (54 icônes avec custom métier `i-arbitrage`, `i-evening`) **dépasse** le mien (30 standard Lucide).
4. Garder 2 systèmes en parallèle = **cauchemar maintenance** sur 18 mois.
5. La rigueur BEM atomic peut être **réintroduite en V2** quand on aura un vrai besoin (≥2 tenants, ≥3 langues, ≥10 designers).
6. Mon `npm install` n'a pas encore tourné côté Windows — le DS atomic n'est pas en production, donc c'est le moment de switcher sans coût migration.

---

## 4. Plan d'intégration (3 phases)

### Phase A — Déploiement coexistence (1 h binôme, immédiat)

1. ✅ Audit livraison (ce document)
2. ⏳ Copier `claude_design/vague_1/design-v06/*` → `03_mvp/public/v06/`
3. ⏳ Copier `design-v06/_shared/*` → `03_mvp/public/v06/_shared/`
4. ⏳ Vérifier `localhost:4747/v06/hub.html` charge OK + naviguer entre les 7 écrans
5. ⏳ Sanity check : sprite icônes charge bien via `#icons-host` + fetch (CORS local OK)
6. ⏳ ADR DECISIONS.md « Adoption livraison Claude Design v0.6 + archivage S6.1 atomic en alt-design »

### Phase B — Branchement APIs REST (S6.2 raccourci, 3-5 j binôme)

7. Pour chaque écran v0.6, remplacer données démo hardcodées par fetch APIs REST :
   - `index.html` → `/api/cockpit` SSE + `/api/big-rocks` + `/api/tasks?today=true` + `/api/decisions?status=pending`
   - `arbitrage.html` → `/api/arbitrage` + drag-drop `/api/tasks/:id PATCH`
   - `evening.html` → `/api/evening POST` + `/api/cockpit/streak GET`
   - `settings.html` → `/api/system` + nouveau `/api/preferences` (à créer)
   - `onboarding.html` → wizard premier login (probablement nouvelle table)
8. Patterns coaching v0.6 (4 modes time-of-day, friction positive 5e P0, recovery streak break, posture footer) déjà incorporés dans la maquette → vérifier branchement aux datasets
9. Tests E2E Playwright sur les 7 nouvelles pages
10. Recette CEO 8 critères + recette ExCom

### Phase C — Cleanup S6.3 (1-2 j binôme)

11. Migrer pages restantes (taches/agenda/revues/groupes/projets/projet/contacts/decisions/assistant) au DS Claude Design v0.6
12. Renommer `03_mvp/public/v06/` → racine `03_mvp/public/` (et archiver l'ancien)
13. Archiver mon `_shared/` S6.1 atomic dans `04_docs/_design-v05-claude/alternative-atomic-bem/` pour réf future
14. Tag `v0.6-final` + Release

---

## 5. Risques + mitigations

| Risque | Mitigation |
|---|---|
| Branchement API plus long que prévu (datasets démo riches Claude Design vs API simples) | Brancher progressivement, rester sur données démo si gap → backlog ticket |
| Sprite icônes chargé via fetch peut échouer en file:// | OK car serveur Express sert tout. Reste tester `localhost:4747/v06/_shared/icons.svg.html` direct |
| Service worker peut cacher pendant dev | Désactiver SW en dev (`if (location.hostname === 'localhost' && location.port === '4747') { /* skip */ }`) |
| Polices `_shared/fonts/` 2 Mo augmentent payload initial | Acceptable v0.6 (cache-first SW). En V2, sous-set Latin uniquement (gain ~70%) |
| Perdre les 4-5 h investies sur S6.1 | Pas perdues : code archivé en référence pour V2. Apprentissage BEM strict capitalisé. |

---

## 6. Décisions à acter

- [x] Adopter Claude Design v0.6 comme implémentation officielle v0.6
- [ ] Archiver S6.1 atomic dans `04_docs/_design-v05-claude/alternative-atomic-bem/`
- [ ] Lancer Phase A immédiatement (1 h)
- [ ] Renommer le sprint en cours : S6.1 (DS atomic, archivé) + S6.1-bis (adoption Claude Design)
- [ ] Mettre à jour ROADMAP `08-roadmap.md` v3.2 → v3.3 pour refléter l'adoption
- [ ] Mettre à jour `11-roadmap-map.html` avec nouveau schéma
- [ ] Mettre à jour `CLAUDE.md` §1 et §3 pour refléter la nouvelle réalité

---

**Source** : audit binôme CEO + Claude le 26/04/2026 sur `04_docs/_design-v05-claude/claude_design/vague_1/`
