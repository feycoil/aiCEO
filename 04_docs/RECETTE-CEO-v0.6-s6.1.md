# Recette CEO — v0.6 / S6.1 (Design System atomic + 27 composants)

> **Objectif** : valider que le Design System ITCSS + 27 composants livres en S6.1 sont fonctionnels, accessibles (clavier + contraste) et coherents avec les tokens DS.
>
> **Duree estimee** : 15 minutes
> **Pre-requis** : poste Windows avec aiCEO installe, serveur lance (Variante D ou `npm start` dans `03_mvp/`)

---

## Etape 1 — Lancer la gallery (1 min)

Ouvrir Edge sur :

```
http://localhost:4747/components.html
```

**Critere GO** : la page se charge sans erreur console (F12 -> Console). Sidebar visible a gauche avec 3 sections (Atoms 11 / Molecules 9 / Organisms 7) = 27 liens.

---

## Etape 2 — Atomes (4 min)

Cliquer chaque ancre du menu gauche dans l'ordre. Pour chaque section verifier :

| # | Composant | A verifier |
|---|---|---|
| 1 | Button | Variants colorimetriques distincts (primary navy, secondary cream, ghost transparent, danger rose). Hover change la teinte. Disabled grise. |
| 2 | Input | text/textarea/number/date affichent bien. Champ `is-error` a bordure rose + ring rose. |
| 3 | Badge | 5 variants colorimetriques. Count badge rond. Dot petit cercle. |
| 4 | Avatar | 5 tailles croissantes. Stack avec overlap visible. |
| 5 | Icon | 9 icones Lucide affichees stroke 1.5. La derniere (check coaching) plus grande + coloree violet. |
| 6 | Spinner | 3 tailles tournent en continu (animation rotate). |
| 7 | Skeleton | Lignes + cercle + carte avec animation shimmer (vague claire). |
| 8 | Switch | Toggle clic OK, etat coche bascule navy. Disabled non-cliquable. |
| 9 | Checkbox | Cocher/decocher OK. Disabled grise. |
| 10 | Radio | Selection mutuellement exclusive (un seul actif). |
| 11 | Tag | 7 variants colorimetriques + outlined + 2 tailles. |

**Critere GO** : aucun composant casse visuellement. Couleurs coherentes avec DS Twisty (navy/cream + accents).

---

## Etape 3 — Molecules (3 min)

| # | Composant | A verifier |
|---|---|---|
| 12 | SearchPill | Input pill arrondi. Focus -> ring + bordure plus marquee. |
| 13 | FormField | Label au-dessus, helper en gris en bas. Variante is-error a label normal + erreur rose. |
| 14 | Toast | 4 variants empiles vertical avec couleur left-border distincte. Bouton X visible. |
| 15 | Tooltip | 2 tooltips visibles (top + bottom) avec petite fleche. |
| 16 | ProgressMeter | 5 barres avec largeurs differentes (30%/60%/90%/45%/15%) et couleurs (brand/brand/success/warning/danger). |
| 17 | Stepper | 4 etapes numerotees, 2 cochees vertes, 1 active navy, 1 grise. Connecteurs entre etapes. |
| 18 | Dropdown | Menu visible (.is-open) avec 3 items + 1 actif (Dupliquer en navy soft). |
| 19 | Tabs | Default avec onglet actif souligne navy. Pills avec arriere-plan blanc actif. |
| 20 | Pagination | Boutons avec page 3 active (navy). Ellipsis "..." entre 4 et 12. |

**Critere GO** : interactions clavier OK (Tab navigue dans les composants, focus visible avec ring).

---

## Etape 4 — Organisms (3 min)

| # | Composant | A verifier |
|---|---|---|
| 21 | Drawer | Section vide (composant plein-hauteur — sera teste sur pages cockpit en S6.2). |
| 22 | Header | Sticky en haut. Breadcrumbs grises + titre h2 + search + 2 actions + avatar. |
| 23 | Footer | 2 variants : default (copyright + liens) + posture (citation script font centree). |
| 24 | Modal | Cliquer "Ouvrir modal demo" -> overlay sombre + dialog blanc. **Tester** : Escape ferme. Clic backdrop ferme. Bouton Annuler/Supprimer visibles. |
| 25 | CommandPalette | Cliquer "Ouvrir Cmd+K demo" OU **raccourci `Ctrl+K`** -> palette s'ouvre top-center. Input autofocus. Items "Cockpit" highlighted. Footer raccourcis kbd. |
| 26 | EmptyState | Icone archive grise + titre "Aucune donnee" + bouton primary. Variante coaching avec script font violette ("Le calme"). |
| 27 | ErrorState | Icone alert rouge + titre "Connexion perdue" + bouton "Reessayer". Inline rouge avec border. |

**Critere GO** : Modal et CommandPalette repondent au clavier (Escape ferme).

---

## Etape 5 — Tests automatises (2 min)

Dans PowerShell :

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm test -- tests/components-gallery.test.js
```

**Critere GO** : 5 tests verts (boot + components.html + icons.svg + index.css + 27 CSS).

---

## Etape 6 — Console + Network (2 min)

Sur `/components.html` :

1. F12 -> **Console** : aucune erreur ni warning (acceptable : aucun message).
2. F12 -> **Network** : recharger la page (Ctrl+F5). Verifier :
   - `index.css` -> 200
   - 27 fichiers `_shared/06_components/c-*.css` -> 200
   - `_shared/icons.svg` -> 200
   - 3 fichiers `01_settings/tokens-*.css` -> 200
3. F12 -> **Lighthouse** : audit Accessibility -> score >= 90 (cible WCAG AA).

**Critere GO** : tous les assets chargent en 200, score Lighthouse >= 90.

---

## Synthese GO/NO-GO

| # | Critere | Statut |
|---|---|---|
| 1 | Page gallery se charge sans erreur | [ ] |
| 2 | 11 atoms visuellement corrects | [ ] |
| 3 | 9 molecules visuellement corrects | [ ] |
| 4 | 7 organisms visuellement corrects | [ ] |
| 5 | Modal + CommandPalette interactifs (clavier) | [ ] |
| 6 | Tests automatises 5/5 verts | [ ] |
| 7 | Console + Network propres | [ ] |
| 8 | Lighthouse a11y >= 90 | [ ] |

**GO si 8/8** -> `git tag v0.6-s6.1` puis demarrage S6.2.

**NO-GO si < 8/8** -> creer issue corrective S6.1.7 + retest.

---

## Annexe — Defauts connus S6.1 acceptes (non-bloquants)

- **Drawer** : pas demo dans gallery (organism plein-hauteur). Test reporte S6.2 sur pages cockpit.
- **Stylelint BEM** : `npm run css:lint` peut echouer si dependances pas installees. Action manuelle CEO : `npm install` une fois pour activer (`stylelint`, `@axe-core/cli`, `lucide-static`). Non-bloquant pour S6.1 valide via tests smoke.
- **Bundle Claude Design** : la maquette n'est pas encore generee. Composants S6.1 sont base technique fidele aux specs `06-composants-catalogue.md` du bundle, mais une fois la maquette dispo, ajuster a la marge (couleurs/spacings) en S6.1.8 micro-correctif si besoin.
- **Audit a11y externe** : reporte S6.3.X (sortie de v0.6 avant V1).
