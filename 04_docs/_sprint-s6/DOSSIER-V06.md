# DOSSIER v0.6 — Interface finalisée

> **Cadrage de la phase v0.6** (palier UI dédié entre v0.5 livré et V1)
> Mode binôme CEO + Claude étendu · vélocité cible ×15-×20
> Date : 26/04/2026

---

## §1 — Contexte et raison d'être

### Pourquoi v0.6 ?

La phase v0.5 a livré un produit fonctionnel complet (5 sprints en ~16h chrono dogfood, vélocité ×30, 110 k€ / 110 k€). Le code, les tests, le service Windows, le dogfood quotidien Feycoil — tout fonctionne.

**Mais visuellement**, l'app v0.5 est encore au niveau "MVP fonctionnel" : pas de DS atomic, pas de microcopy unifié, pas d'accessibilité WCAG AA, pas de patterns coaching, pas d'onboarding.

Le bundle Claude Design v3.1 livré le 26/04 (16 ressources + prompt v3.1 + 7 ADR de gouvernance) propose une cible visuelle complète V1 SaaS multi-CEO. **Implémenter cette refonte au milieu des 6 thèmes V1** (multi-tenant + équipes + intégrations + mobile + backup + logs, ~46 k€/6 mois) **diluerait V1 et créerait des conflits de merge**.

**Décision (ADR `2026-04-26 · Insertion v0.6`)** : v0.6 = palier UI dédié, scope fonctionnel v0.5 préservé, ~2-3 sem binôme, ~8 k€ absorbé dans provision V1.

### Promesse v0.6

> *« Mon outil est aussi beau qu'il est utile. »*

Refonte visuelle complète des 13 pages selon le bundle Claude Design v3.1, avec patterns coaching légers, accessibilité WCAG AA, microcopy unifié — **sans ajouter de feature fonctionnelle**.

### Pré-requis levés

- ✅ v0.5 livré (tag `v0.5` posé)
- ✅ Bundle Claude Design v3.1 prêt (`04_docs/_design-v05-claude/`)
- ✅ Vélocité binôme validée (×30 sur v0.5)
- ✅ Cadrage tri-audience (équipe dev / board / Feycoil dogfood)
- ✅ Cadrage par version (`17-cadrage-livraison-par-version.md`)
- 🔜 GO ExCom 04/05 acté

---

## §2 — Périmètre v0.6

### À LIVRER (16 items)

1. **DS atomic 3 niveaux** — tokens primitive (couleurs brutes) → semantic (usage contextuel) → component (par bloc)
2. **ITCSS architecture** — 7 couches (settings / tools / generic / elements / objects / components / utilities)
3. **BEM naming convention** — préfixes `c-` (components), `o-` (objects), `u-` (utilities), `is-/has-` (states)
4. **16 composants UI catalogués** — voir `04_docs/_design-v05-claude/ressources-a-joindre/06-composants-catalogue.md` :
   - Atoms : Button (4 variants × 3 sizes), Input, Badge, Avatar, Icon, Spinner, Skeleton, Switch, Checkbox, Radio, Tag/Chip
   - Molecules : SearchPill, FormField, Toast, Tooltip, ProgressMeter, Stepper, Dropdown, Tabs, Pagination
   - Organisms : Drawer collapsible, Header, Footer, Modal (3 sizes), CommandPalette ⌘K, EmptyState, ErrorState
5. **13 pages refondues** — cockpit, arbitrage, evening, taches, agenda, revues, assistant + groupes, projets, projet, contacts, decisions + index
6. **Microcopy FR unifié** — empty states, errors, confirmations, placeholders, tooltips, onboarding
7. **WCAG AA cockpit/arbitrage/evening** — skip links, focus visible, ARIA roles, keyboard 100 %, prefers-reduced-motion, color blindness (couleur + icon)
8. **Patterns coaching v0.6 légers** — 4 patterns visibles :
   - Time-of-day adaptation cockpit (4 modes : matin / journée / soir / nuit)
   - Friction positive (5e P0 ajoutée → modal soft "5 P0 aujourd'hui. Tout est urgent ?")
   - Recovery streak break (sans drame, "Pas grave, on reprend")
   - Posture stratégique footer (question du mois)
9. **Onboarding wizard simple** (5 étapes) — désactivé Feycoil (déjà onboardé), activable CEO pair futur
10. **Settings page basique** — 4 sections (identité / intégrations / sécurité base / données) sans multi-tenant
11. **Components gallery** (`/components.html`) — mini-storybook visuel pour gouvernance DS
12. **Drawer collapsible** 240↔60 px avec persistance localStorage `aiCEO.uiPrefs.drawerCollapsed`
13. **Iconographie Lucide** stroke 1.5 unifiée (30 icônes inventoriées) en SVG sprite
14. **Charts SVG inline** (6 patterns autorisés : vertical line+dot, vertical bars, linear progress, circular ring, calendar heatmap, sparkline)
15. **Source-link pattern unifié** + auto-save dirty state (1s après dernière frappe)
16. **Streaming SSE assistant raffiné** (skeleton bubble + curseur clignotant + reconnexion exponentielle) — déjà en v0.5, polish v0.6

### À NE PAS LIVRER (réservé V1+)

- ❌ Multi-tenant + RLS Supabase + auth Microsoft Entra → V1 thème 1 (~80 k€)
- ❌ Équipes + délégation E2E + matrice confiance → V1 thème 2 (~50 k€)
- ❌ Intégrations Teams + Notion + Slack + webhooks → V1 thème 3 (~60 k€)
- ❌ App mobile compagnon PWA → V1 thème 4 (~70 k€)
- ❌ Backup chiffré automatique → V1 thème 5 (~20 k€)
- ❌ Logs winston + Langfuse → V1 thème 6 (~20 k€)
- ❌ i18n FR + EN activé (architecture posée techniquement v0.6 sans activation EN) → V2
- ❌ RTL prep AR/HE → V2
- ❌ Coach Opus + mirror moments + score santé + self-talk monitoring → V3
- ❌ Offline-first → V3

---

## §3 — Découpage 3 sprints (24 issues totales)

### Sprint S6.1 — DS atomic + 16 composants + drawer + components gallery

**Durée cible** : ~5 j chrono dogfood
**Date démarrage** : post-ExCom 04/05
**Budget** : ~2,7 k€ (LLM + provision)

**Issues prévues (8)** :

| # | ID | Titre | Effort cible |
|---|---|---|---|
| 1 | S6.1.0 | ADR méthode S6 + setup ITCSS + scripts npm | 0,3 j |
| 2 | S6.1.1 | Tokens 3 niveaux dans `_shared/tokens.css` (primitive/semantic/component) | 0,5 j |
| 3 | S6.1.2 | Composants atoms (Button, Input, Badge, Avatar, Icon, Spinner, Skeleton, Switch, Checkbox, Radio, Tag/Chip) | 1,5 j |
| 4 | S6.1.3 | Composants molecules (SearchPill, FormField, Toast, Tooltip, ProgressMeter, Stepper, Dropdown, Tabs, Pagination) | 1,2 j |
| 5 | S6.1.4 | Composants organisms (Drawer collapsible, Header, Footer, Modal 3 sizes, CommandPalette, EmptyState, ErrorState) | 1,0 j |
| 6 | S6.1.5 | Components gallery `/components.html` mini-storybook (toutes variantes visibles) | 0,5 j |
| 7 | S6.1.6 | SVG sprite Lucide 30 icônes (`/_shared/icons.svg`) | 0,3 j |
| 8 | S6.1.7 | Tests unit composants critiques (Button states, Modal focus trap, Drawer persist, CommandPalette ⌘K) | 0,7 j |

**Total effort** : 6,0 j-dev sur ~5 j chrono dogfood (vélocité ×15 conservatrice).

### Sprint S6.2 — Refonte 7 pages cockpit + rituels + travail courant + coaching

**Durée cible** : ~5 j chrono dogfood
**Date démarrage** : post-S6.1 livré
**Budget** : ~2,7 k€

**Issues prévues (8)** :

| # | ID | Titre | Effort cible |
|---|---|---|---|
| 1 | S6.2.0 | ADR S6.2 + recette S6.1 + setup pages | 0,3 j |
| 2 | S6.2.1 | Refonte `index.html` cockpit (selon maquette) + patterns coaching v0.6 | 1,2 j |
| 3 | S6.2.2 | Refonte `arbitrage.html` + friction positive 5e P0 | 1,0 j |
| 4 | S6.2.3 | Refonte `evening.html` + recovery streak break | 0,8 j |
| 5 | S6.2.4 | Refonte `taches.html` Eisenhower + filtres | 0,8 j |
| 6 | S6.2.5 | Refonte `agenda.html` drag-drop + posture stratégique footer | 0,8 j |
| 7 | S6.2.6 | Refonte `revues.html` Big Rocks + auto-draft | 0,5 j |
| 8 | S6.2.7 | Refonte `assistant.html` streaming SSE raffiné + auto-save | 1,0 j |

**Total effort** : 6,4 j-dev sur ~5 j chrono dogfood.

### Sprint S6.3 — 5 pages registres + onboarding + settings + a11y + recette + tag v0.6

**Durée cible** : ~5 j chrono dogfood
**Date démarrage** : post-S6.2 livré
**Budget** : ~2,6 k€ + 3 k€ audit a11y externe

**Issues prévues (8)** :

| # | ID | Titre | Effort cible |
|---|---|---|---|
| 1 | S6.3.0 | ADR S6.3 + recette S6.2 + setup registres | 0,3 j |
| 2 | S6.3.1 | Refonte `groupes.html` portefeuille drill-down | 0,7 j |
| 3 | S6.3.2 | Refonte `projets.html` liste cross-groupe + filtres | 0,7 j |
| 4 | S6.3.3 | Refonte `projet.html` template paramétré ?id= | 0,8 j |
| 5 | S6.3.4 | Refonte `contacts.html` cards avatar + filtres trust | 0,7 j |
| 6 | S6.3.5 | Refonte `decisions.html` registre + IA recommend | 0,7 j |
| 7 | S6.3.6 | Onboarding wizard simple (5 étapes) + Settings page basique (4 sections) | 1,2 j |
| 8 | S6.3.7 | Audit a11y axe-core + audit pro externe + recette CEO + tag `v0.6` + GitHub Release | 1,0 j |

**Total effort** : 6,1 j-dev sur ~5 j chrono dogfood.

---

## §4 — Pré-requis : génération maquette Claude Design

Avant de démarrer S6.1, **action manuelle CEO requise** :

1. Aller sur Claude Design dans le projet `aiCEO_mvp_v1`
2. Uploader les 15 fichiers de `04_docs/_design-v05-claude/ressources-a-joindre/`
3. Coller le contenu de `04_docs/_design-v05-claude/PROMPT-FINAL.md` (entre les triples backticks)
4. Répondre aux questions structurelles éventuelles
5. Confirmer "continue vague 2" puis "continue vague 3" entre paliers
6. Récupérer les ~62 vues hi-fi clickables générées
7. Copier les vues dans `04_docs/_sprint-s6/maquette-claude-design/`

Cette maquette sert d'**étalon visuel pixel-près** pendant l'implémentation des 3 sprints. Sans elle, on improvise.

---

## §5 — Risques & mitigations

| # | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Maquette Claude Design qualité décevante (ne reflète pas la vision) | Moyenne | Haut | Bundle v3.1 ultra-spécifié (16 ressources, prompt 16k chars) + 1ʳᵉ vague Tier 0+1 validée avant Tier 2-3 |
| R2 | Régression fonctionnelle pendant refonte UI | Moyenne | Haut | Tests Playwright préservés ≥ 95 verts à chaque commit · dogfood Feycoil quotidien · CI lint+unit |
| R3 | Vélocité binôme < ×15 (sortir de cible) | Faible | Moyen | v0.5 a validé ×30, marge confortable. Si chute < ×10 mi-S6.2, alerter et adapter (réduire scope S6.3) |
| R4 | Audit a11y externe trouve findings critiques tardivement | Faible | Moyen | Lancer audit dès S6.2 (parallèle au refonte), pas seulement en S6.3. Itérer pendant S6.3 si findings |
| R5 | Conflits de merge si plusieurs branches parallèles | Faible | Faible | Mode binôme = travail séquentiel sur une branche unique, pas de parallélisme. Push après chaque session |
| R6 | Microcopy FR incohérent cross-pages | Moyenne | Faible | Centraliser dans `_shared/microcopy-fr.json` chargé par toutes les pages. Validateur eslint custom (rule "no-string-literals-in-html") |
| R7 | Performance dégradée par DS atomic (CSS bloat) | Faible | Moyen | Cible bundle CSS < 50 kb (mesure à chaque commit). Critical CSS inline. Purge classes inutilisées via PostCSS |

---

## §6 — Critères d'acceptation v0.6 (go/no-go V1)

- [ ] **13 pages refondues** conformes maquette Claude Design v3.1 (mode "vue dev" filtré sur `[v0.5]` + `[v0.6]`)
- [ ] **DS atomic implémenté** (tokens 3 niveaux + 16 composants catalogués)
- [ ] **Microcopy FR unifié** (zéro string ad hoc cross-pages, tout dans `_shared/microcopy-fr.json`)
- [ ] **WCAG AA verifiable** sur cockpit / arbitrage / evening (axe-core 0 finding critique)
- [ ] **Audit a11y externe** : 0 finding critique (~3 k€ prestataire)
- [ ] **Patterns coaching v0.6 visibles** (time-of-day, friction positive, recovery, posture footer)
- [ ] **Onboarding wizard fonctionnel** (testable en démo CEO pair, désactivé pour Feycoil)
- [ ] **Components gallery** accessible via `/components.html` avec tous les composants en variantes
- [ ] **Tests Playwright préservés** (≥ 95 verts, 0 régression)
- [ ] **0 régression fonctionnelle vs v0.5**
- [ ] **Performance** : LCP < 2 s desktop, INP < 100 ms, bundle CSS < 50 kb
- [ ] **Tag `v0.6` posé** sur main + GitHub Release publiée
- [ ] **Adoption Feycoil** : 100 % dogfood sur la nouvelle UI pendant 14 j sans bug bloquant
- [ ] **ADR `v0.6 livrée`** rédigée

---

## §7 — Budget v0.6

| Poste | Montant |
|---|---|
| Dev humain (Feycoil dogfood + signature externe) | **0 €** |
| Infra (déjà payée v0.5) | 0 € |
| LLM Claude API (3 sem × 30 €/jour) | ~600 € |
| Provision imprévus / outils SaaS | ~3 k€ |
| Tests utilisateur (1 CEO pair pré-V1) | ~2 k€ |
| Audit accessibilité externe (axe-core + audit pro) | ~3 k€ |
| **Total v0.6** | **~8 k€** |

Source : provision V1 actuelle (105 k€ disponible). Pas de rallonge budgétaire. Trajectoire 18 mois passe de 1,46 M€ à 1,47 M€.

---

## §8 — Planning chronologique cible

```
J0  : Kickoff v0.6 + ADR S6.00 + DOSSIER-V06 + script issues v0.6     [aujourd'hui 26/04]
J1  : Action manuelle CEO — generation maquette Claude Design (1 session 60-90 min)
J2  : S6.1 demarrage — issues S6.1.0 + S6.1.1 + S6.1.2
J3  : S6.1 mid — issues S6.1.3 + S6.1.4
J4  : S6.1 fin — issues S6.1.5 + S6.1.6 + S6.1.7
J5  : Recette S6.1 + tag v0.6-s6.1 + Release
J6  : S6.2 demarrage — issues S6.2.0 + S6.2.1 + S6.2.2
J7  : S6.2 mid — issues S6.2.3 + S6.2.4 + S6.2.5
J8  : S6.2 fin — issues S6.2.6 + S6.2.7 + audit a11y kickoff
J9  : Recette S6.2 + tag v0.6-s6.2 + Release
J10 : S6.3 demarrage — issues S6.3.0 + S6.3.1 + S6.3.2
J11 : S6.3 mid — issues S6.3.3 + S6.3.4 + S6.3.5
J12 : S6.3 fin — issues S6.3.6 + S6.3.7 + recette CEO
J13 : Tag v0.6 + GitHub Release + ADR v0.6 livree
J14 : Adoption Feycoil dogfood phase observation 14 j
```

Total : ~13 j chrono dogfood + 14 j observation = ~4 sem calendaires.

Si vélocité ×15 maintenue : finitable en 3 sem calendaires.

---

## §9 — Dépendances techniques

### Pré-requis tech v0.5 (acquis)
- Node 24 + node:sqlite
- Express + 11 routers REST CRUD
- 4 routes assistant streaming SSE
- 12 pages frontend (à refondre v0.6)
- ~95 tests verts (~78 unit + ~12 E2E Playwright + ~5 smoke)
- Service Windows variant D Startup folder
- Fira Sans canonique (DS Twisty)

### Nouveaux pré-requis v0.6
- Lucide-static@latest (SVG sprite)
- PostCSS + autoprefixer (purge CSS) — optionnel selon décision S6.1.0
- axe-core CLI pour audit a11y automatisé
- Prestataire audit a11y pro (à identifier mi-S6.2)

### Aucune nouvelle dépendance backend
v0.6 = refonte UI uniquement. Pas de nouveau router REST, pas de nouvelle migration SQLite, pas de nouveau script PowerShell.

---

## §10 — Sources

- ROADMAP `04_docs/08-roadmap.md` v3.2
- ADR `2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1`
- ADR `2026-04-26 · Bundle design Claude Design v3.1 — cible visuelle V1`
- ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1`
- Bundle `04_docs/_design-v05-claude/` (16 ressources, 7 ADR gouvernance, prompt v3.1)
- CLAUDE.md (méthode binôme accélérée §2 + workflow type sprint §10)
