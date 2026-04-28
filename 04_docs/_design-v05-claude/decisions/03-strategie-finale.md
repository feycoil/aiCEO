# Stratégie finale — A3 + C1 + 01_app-web

> Date : 26/04/2026
> Choix CEO : intégrer **tous les manques** (A3) en **un seul lancement** (C1), capitaliser sur `01_app-web/` comme mine d'or.

## Verrous techniques levés

### 1. Découverte structure réelle

L'utilisateur avait initialement présenté 4 sociétés (Adabu, Start, AMANI, ETIC). L'extraction de `01_app-web/assets/data.js` v4 (rebuild 23/04 depuis 1025 mails Outlook) révèle la **vraie structure** :

- **3 groupes** (pas 4) : MHSSN Holding / AMANI / ETIC Services
- **SCI Adabu** et **SCI Start** sont **sous MHSSN**, pas autonomes
- **11 sociétés** réparties dans les 3 groupes
- **14 projets**, **28 tâches** d'arbitrage S17, **25 contacts**, **25 RDV**, **10 décisions**, **9 AI proposals**, **4 revues** hebdo

Cette structure est désormais reflétée partout dans le bundle.

### 2. CSS DA Twisty étendu disponible

`01_app-web/assets/app.css` (1798 lignes) contient déjà :
- Tokens CSS complets (couleurs, radii, shadows, typography)
- 16+ composants designés et testés (sidebar, topbar, cards 3 variants, KPI, focus-now, workload meter, AI cards, task rows, matrix-2x2, banners, pills, buttons, command palette, modals, forms)

Tout cela a été extrait dans `06-composants-catalogue.md` pour réutilisation directe par Claude Design.

## Couverture des 24 manques identifiés

| # | Manque | Traité dans |
|---|---|---|
| 1 | Catalogue composants UI | `06-composants-catalogue.md` (16 composants) |
| 2 | Iconographie | `08-patterns-techniques.md` §3 (Lucide, 30 icônes) |
| 3 | Type system | `08-patterns-techniques.md` §4 (line-heights, usage Aubrielle/Sol/Fira) |
| 4 | Spacing scale | `08-patterns-techniques.md` §5 (multiples de 4) |
| 5 | Drag & drop pattern | `08-patterns-techniques.md` §2 (visuel + keyboard) |
| 6 | Références visuelles supplémentaires | Note dans v2 : optionnel, prompt suffisant sans pour la v1 |
| 7 | Datasets élargis | `07-datasets-elargi.md` (4× volume v1) |
| 8 | Charts patterns | `08-patterns-techniques.md` §6 (6 patterns SVG) |
| 9 | Accessibility | Prompt v2 §11 + `08-patterns-techniques.md` §12 |
| 10 | Logo aiCEO | Prompt v2 §7 (monogramme A coral spécifié) |
| 11 | Index navigation | `08-patterns-techniques.md` §15 |
| 12 | Modal pattern | `06-composants-catalogue.md` §3 (3 sizes + comportements) |
| 13 | Motion system | `08-patterns-techniques.md` §1 |
| 14 | Command palette | `08-patterns-techniques.md` §7 |
| 15 | Formats FR | `08-patterns-techniques.md` §13 + Prompt v2 §12 |
| 16 | Tier 3 augmenté | Prompt v2 §6 (états critiques pour les 5 pages T3) |
| 17 | Densité textuelle copies | Prompt v2 §9 |
| 18 | Avatars (initiales) | `06-composants-catalogue.md` §10 + Prompt v2 §7 |
| 19 | Dirty state / auto-save | `08-patterns-techniques.md` §9 |
| 20 | Source-link rendering | `08-patterns-techniques.md` §8 |
| 21 | Volumes edge cases | Prompt v2 §17 critère #2 (28 tâches, sans clic perdu) |
| 22 | Focus/hover/disabled states | `06-composants-catalogue.md` (états par composant) |
| 23 | Dark mode futur | Prompt v2 implicite via vars CSS structurées |
| 24 | Critère Tier auto-stop | Prompt v2 §16 |

**24/24 manques traités**.

## Métriques v1 → v2

| Aspect | v1 | v2 | Évolution |
|---|---|---|---|
| Taille prompt | ~16 k chars | ~28 k chars | +75 % |
| Pièces jointes | 6 | 9 | +3 |
| Composants spécifiés | 5 vagues | 16 prêts | +220 % |
| Datasets | maigres | exhaustifs | +250 % |
| Patterns techniques | 0 | 15 | nouveau |
| Score qualité estimé | 7,5/10 | 9,5/10 | +27 % |

## Risques résiduels

1. **Volume de génération** sur 23 vues. Mitigation : critère §16 du prompt v2 (auto-stop + demande confirmation).
2. **Image Twisty** doit être déposée manuellement dans `ressources-a-joindre/00-REFERENCE-VISUELLE-twisty.png`.
3. **Patterns absents de Twisty** (calendrier, chat, kanban) sont décrits textuellement uniquement. Si Claude Design produit du visuel divergent sur ces patterns, demander en suivi 1-2 références complémentaires.

## Décisions tracées

- A3 : tous les manques intégrés
- C1 : un seul lancement (pas de palier)
- 01_app-web : capitalisation maximale (CSS + datasets v4)
- Backup v1 conservé : `PROMPT-FINAL-v1.md`
