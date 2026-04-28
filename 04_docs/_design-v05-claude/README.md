# Maquette Claude Design — aiCEO v0.5

> Dossier dédié à la conception de la maquette complète v0.5 sur Claude Design.
> Workflow : co-construction itérative du prompt avec arbitrages tracés, puis livraison d'un prompt unique + bundle ressources.

## Structure

```
_design-v05-claude/
├── README.md                          ce fichier
├── PROMPT-FINAL.md                    le prompt v2 unique a coller dans Claude Design
├── PROMPT-FINAL-v1.md                 backup v1 (avant integration des 24 manques)
├── decisions/                         arbitrages traces
│   ├── 00-analyse-visuelle-reference.md  decomposition de l'image Twisty
│   ├── 01-arbitrages-trances.md          7 decisions cles (donnees/etats/strategie/etc.)
│   ├── 02-critique-manques.md            critique sans concession 24 manques
│   └── 03-strategie-finale.md            choix A3 + C1 + 01_app-web
└── ressources-a-joindre/              9 fichiers a uploader avec le prompt
    ├── 00-REFERENCE-VISUELLE-instructions.md  ⚠ image Twisty a deposer manuellement
    ├── 01-tokens.json                          copie du DS canonique
    ├── 02-colors_and_type.css                  variables CSS generees
    ├── 03-spec-extraits.md                     extrait pertinent SPEC fonctionnelle
    ├── 04-pages-detail.md                      fiche par page (13 pages × role/contenu/API/etat)
    ├── 05-persona.md                           persona Feycoil + 3 groupes reels
    ├── 06-composants-catalogue.md              16 composants UI prets a l'emploi
    ├── 07-datasets-elargi.md                   28 taches, 25 contacts, 25 RDV, 14 projets, etc.
    └── 08-patterns-techniques.md               motion, drag&drop, charts, palette, accessibility
```

## Méthode

1. ✅ Analyse visuelle de la référence Twisty
2. ✅ 7 arbitrages CEO tranchés (donnees/etats/strategie/reference/composants/drawer/CSS)
3. ✅ Critique sans concession : 24 manques identifies
4. ✅ Choix CEO : A3 (tout integrer) + C1 (un seul lancement)
5. ✅ Capitalisation 01_app-web/ (CSS + datasets v4)
6. ✅ Bundle resources finalise (9 fichiers)
7. ✅ Prompt v2 assemble (28k chars, 18 sections)
8. ⏳ A faire : deposer image Twisty + uploader sur Claude Design + lancer

## Score qualite estime

- v1 : 7,5/10 (mono-user, desktop only, datasets reels)
- v2 : 9,5/10 (mono-tenant, desktop only, donnees reelles)
- **v3 : 9,5/10 sur scope SaaS multi-CEO, fully responsive, multilingue, coaching, accessibilite, robustesse**

## Couverture v3.1 (post-audit roadmap)

~62 vues prevues = 16 pages × variants par viewport + etats critiques

- Tier 0 : Onboarding + Settings + Components Gallery (5 vues)
- Tier 1 : Cockpit + Arbitrage + Evening × 3 viewports + variants (16 vues)
- Tier 2 : Taches + Agenda + Revues + Assistant × 3 viewports + variants (20 vues)
- Tier 3 : Groupes + Projets + Projet + Contacts + Decisions desktop only + etats (10 vues)
- Index nav × 3 viewports + EN locale + RTL = 7 vues additionnelles

Tenant demo : **Northwind Holdings** (Sarah Chen + 3 houses : Northwind Capital, Solstice Hospitality, Helix Services). Donnees 100 % depersonnalisees.

## ⚠ CADRAGE PAR VERSION (audit roadmap v3.1)

La maquette represente la VISION PRODUIT v0.5 → V3 (18 mois, 1.68 M EUR cumul).
Pas seulement le sprint v0.5 (110 k EUR).

Repartition des features :
- ~75 % features [target: v0.5] (cockpit, rituels, drawer desktop, SQLite, Outlook COM)
- ~10 % features [target: V1] (atomic design, AI transparency, time saved metric)
- ~10 % features [target: V2] (multi-tenant Northwind, vocabulary configurable)
- ~5 % features [target: V3] (mobile responsive, PWA, coach prompts, score sante)

Lecture pour l'equipe dev v0.5 : voir `ressources-a-joindre/17-cadrage-livraison-par-version.md` qui mappe chaque feature a sa version target. Implementer UNIQUEMENT les features [v0.5] dans le sprint courant.

Lecture pour le board / investisseurs : la maquette en mode "Live" demontre la trajectoire complete et la credibilite produit-SaaS.

## Action manuelle restante avant lancement

1. Verifier que l'image Twisty est bien dans `ressources-a-joindre/00-REFERENCE-VISUELLE-twisty.png` (deja la)
2. Uploader les 14 fichiers (image + 13 .md/.json/.css) de `ressources-a-joindre/` dans la conversation Claude Design
3. Coller le contenu de `PROMPT-FINAL.md` (entre les triples backticks)
4. Repondre aux questions structurelles eventuelles
5. Confirmer "continue vague 2" puis "continue vague 3" entre les paliers
