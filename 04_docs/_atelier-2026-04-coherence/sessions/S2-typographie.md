# Session 2 — Typographie canonique

**Ouverture** : 24/04/2026
**Dissonance ciblée** : C2 (trois sources typo contradictoires)

---

## 1. Contexte

Le repo contient **trois sources de vérité contradictoires** sur la typographie :

| Source | Déclare | Statut |
|---|---|---|
| `02_design-system/tokens/typography.json` | **Fira Sans** (10 poids) + Aubrielle_Demo (display) + Sol Thin (accents) | Tokens officiels DS |
| `02_design-system/assets/app.css` + `01_app-web/product.app.css` | **Inter** via `@import` CDN Google Fonts | Code livré |
| `04_docs/07-design-system.md` | Mentionne **Cambria / Calibri** dans certaines sections | Doc partiellement obsolète |

`02_design-system/REPO-CONTEXT.md` documente le conflit mais ne le tranche pas. C'est le conflit le plus visible du repo ; il persiste depuis plusieurs jalons et ronge la crédibilité du DS.

Contrainte implicite : tout changement CSS doit respecter **la continuité d'usage CEO** (S1). Donc la migration Inter → Fira se fait en douceur, pas en big-bang.

---

## 2. Question centrale

**Quelle est la police canonique d'aiCEO, et comment on réconcilie les trois sources sans casser l'UI actuelle ?**

---

## 3. Options

### Option A — Fira Sans canonique (tokens gagnent)

**Décision** : Fira Sans est la typo officielle. Inter (CDN) et Cambria/Calibri (doc) sont à purger.

**Plan** :
1. Hoster Fira Sans localement dans `02_design-system/fonts/` (déjà présent) et l'exposer via `@font-face` dans `app.css`.
2. Retirer l'`@import` Google Fonts Inter.
3. Patcher `07-design-system.md` pour aligner sur Fira Sans.
4. Patcher `product.app.css` en miroir.
5. Aubrielle_Demo et Sol Thin restent en tant que polices d'accent (display / thin) sur cas précis, non corps de texte.

**Coût** : 1 sprint DS court (1-2 j), zéro impact utilisateur visible (Fira et Inter ont une métrique très proche).

### Option B — Inter canonique (code livré gagne)

**Décision** : Inter est la typo officielle. Les tokens DS et la doc sont à réaligner sur Inter.

**Plan** :
1. Patcher `typography.json` pour remplacer Fira Sans par Inter.
2. Archiver les fichiers Fira dans `_archive/`.
3. Patcher `07-design-system.md`.

**Coût** : zéro changement CSS, mais **perte** du travail de DS initial (Fira Sans avait été choisi pour son caractère plus "institutionnel" / moins SaaS générique que Inter).

### Option C — Fira Sans canonique par défaut, Inter de secours (pragmatique)

**Décision** : Fira officielle, mais fallback Inter via stack CSS en cas d'absence des fichiers locaux. Évite tout risque de "page sans police" si le bundle Fira n'est pas là.

**Plan** : stack `font-family: "Fira Sans", "Inter", system-ui, sans-serif;` partout. `@import` Inter supprimé (système ne doit pas dépendre de Google Fonts).

---

## 4. Recommandation Claude

**Option A** — Fira Sans canonique. Deux raisons :

1. Les tokens DS représentent la **décision design explicite** qui a été prise à un moment où le CEO a fait un choix d'identité produit (Fira Sans = plus humain, plus "ETIC", moins "startup SF"). Inter est arrivé comme *fallback technique* dans le CDN au moment du scaffolding, pas comme un choix produit.
2. Héberger les fontes localement (sans `@import` Google Fonts) va dans le sens de la **souveraineté produit** (cf. S1 phase locale, argument "tout reste sur le poste").

Option C en variante acceptable si tu veux un filet de sécurité pendant la transition — mais fait perdurer Inter sur les postes où Fira ne charge pas, ce qui recrée le problème.

---

## 5. Livrables si Option A retenue

1. **ADR `2026-04-24 · Typographie canonique Fira Sans`** dans `DECISIONS.md`
2. **Patch `02_design-system/assets/app.css`** : suppression `@import` Google Fonts Inter, ajout `@font-face` Fira Sans + Aubrielle + Sol Thin depuis `/fonts/`, `font-family` système mis à jour
3. **Patch `01_app-web/product.app.css`** : même traitement (copie miroir)
4. **Patch `04_docs/07-design-system.md`** : section typo aligné sur Fira Sans, retrait des mentions Cambria/Calibri
5. **Issue GitHub** dans `feycoil/aiCEO` : `lane/design-system` + `priority/high`, titre *"Purger Inter, hoster Fira Sans localement (ADR 2026-04-24)"*, checklist des 3 fichiers à toucher, référence ADR
6. **Note dans REPO-CONTEXT.md** : conflit résolu, date, pointeur ADR

---

## 6. Décision

**Option retenue** : **A — Fira Sans canonique, self-hostée, zéro CDN**.

**Motif principal** : les tokens DS représentent le choix d'identité explicite, et le self-hosting va dans le sens de la trajectoire souveraine locale-first actée en S1.

**Livrables produits 2026-04-24** :
- ✅ ADR `2026-04-24 · Typographie canonique : Fira Sans self-hosted` dans `00_BOUSSOLE/DECISIONS.md`
- ✅ Patch `02_design-system/assets/app.css` — `@import` Inter → `@import ../colors_and_type.css`
- ✅ Patch `02_design-system/assets/product.app.css` — idem + `font-family` basculée de `"Inter var"` vers `"Fira Sans"`
- ✅ Patch `01_app-web/assets/app.css` — purge `@import` Inter, ajout `@font-face` Fira 6 poids via chemin relatif `../../02_design-system/fonts/`, `font-family` basculée
- ✅ Patch `03_mvp/public/index.html` — `"Fira Sans", Calibri, ...` et `"Fira Sans", Cambria, Georgia, serif` (Fira première, anciennes fontes en fallback visuel le temps de la fusion v0.5)
- ✅ Patch `03_mvp/public/evening.html` — idem
- ✅ Patch `04_docs/07-design-system.md` § 2.3 — réécriture complète stack Fira, poids 100-900, OT features `calt,ss02,ss03`, purge mentions Inter / Cambria / Calibri
- ✅ Patch `02_design-system/REPO-CONTEXT.md` — marqué "écart résolu" avec trace des fichiers patchés et reste à faire en fusion v0.5

**Continuité d'usage respectée** (contrainte S1) : le MVP continue d'afficher Cambria/Calibri visuellement tant que `@font-face` Fira n'est pas servi depuis `03_mvp/public/assets/fonts/`. Aucune régression perceptible pour le CEO. Le passage visible à Fira Sans se fera au sprint S1 de la fusion v0.5, quand les fichiers OTF seront copiés dans `public/assets/fonts/`.

**Conditions de revisite** : uniquement si Fira Sans pose un problème de rendu majeur sur Edge/Chrome Windows (imprévu car la fonte est OpenType standard) ou si une licence commerciale bloque l'usage pro (Fira Sans est sous SIL Open Font License, donc sans risque).

## 7. Contenu de l'Issue GitHub à créer (hors session)

Dans `feycoil/aiCEO`, ouvrir une issue avec :

**Titre** : `[DS] Fusion v0.5 · copier fonts Fira Sans dans 03_mvp/public/assets/fonts/ et déclarer @font-face`

**Labels** : `lane/design-system`, `priority/high`, `phase/v0.5`, `type/chore`

**Body** :
```
Contexte
--------
ADR 2026-04-24 · Typographie canonique : Fira Sans self-hosted.
DECISIONS.md : https://github.com/feycoil/aiCEO/blob/main/00_BOUSSOLE/DECISIONS.md

À faire (sprint S1 fusion v0.5, cf. SPEC-TECHNIQUE-FUSION §3)
------------------------------------------------------------
- [ ] Copier `02_design-system/fonts/FiraSans-*.otf` (10 poids) dans `03_mvp/public/assets/fonts/`
- [ ] Copier `02_design-system/fonts/Aubrielle_Demo.ttf` et `SolThin.otf`
- [ ] Déclarer les `@font-face` dans le CSS unifié `03_mvp/public/assets/app.css`
- [ ] Tester le rendu sur Edge et Chrome Windows (hauteur x, tracking — Fira est plus large qu'Inter, tokens déjà ajustés)
- [ ] Retirer le fallback Calibri/Cambria des `font-family` inline dans index.html et evening.html une fois Fira chargé

Critères d'acceptation
----------------------
- Aucun chargement de fonte depuis rsms.me ou Google Fonts (vérifié onglet Network DevTools)
- Toutes les pages affichent Fira Sans visuellement (pas juste dans le code)
- Pas de régression visuelle notable (hauteur ligne, densité)
```

## 8. Reste à faire (hors S2)

- Ouverture de l'Issue GitHub ci-dessus — à faire manuellement, j'ai préparé le contenu
- Mise à jour de la prose `README.md` du DS (section Visual foundations décrit encore Inter) — **upstream OneDrive**, sort du scope de cette session
- Copie effective des fonts dans `03_mvp/public/assets/fonts/` et déclaration `@font-face` — planifiée sprint S1 de la fusion v0.5, pas maintenant (éviterait d'ajouter du code non testé à un MVP en usage)

**Clôture** : 2026-04-24. Statut ✅ close.

---

*S2 ouverte 2026-04-24, close 2026-04-24. Décision A. 8 fichiers patchés. Trace dans ce fichier + JOURNAL.md + DECISIONS.md + REPO-CONTEXT.md.*
