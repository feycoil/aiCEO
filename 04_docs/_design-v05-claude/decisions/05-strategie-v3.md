# Stratégie finale v3 — SaaS multi-CEO scalable

> Date : 26/04/2026
> Choix CEO validés sur 4 arbitrages stratégiques.

## Choix actés

| # | Sujet | Décision |
|---|---|---|
| 1 | Scope responsive | Tier 1+2 × 3 viewports (desktop/tablet/mobile), Tier 3 desktop only |
| 2 | Coaching CEO | Patterns complets visibles dans la maquette (tone scripts, time-of-day, mirror moments, friction positive, recovery) |
| 3 | Multi-tenant | 1 tenant démo "Northwind Holdings" + démos d'options dans Settings |
| 4 | i18n | FR principal + EN sur 2-3 vues clés + RTL simulation sur 1 vue |

## Volumétrie cible

### Pages de la maquette

**Tier 0 — Onboarding & Settings (nouveau)**
- `onboarding.html` (3 étapes clés du wizard) — desktop + mobile
- `settings.html` (8 sections en accordéon) — desktop + mobile
- `components.html` (mini-storybook gallery) — desktop only

**Tier 1 — Cockpit & rituels** (3 viewports chacun)
- `index.html` — cockpit unifié
- `arbitrage.html`
- `evening.html`

**Tier 2 — Travail courant** (3 viewports chacun)
- `taches.html`
- `agenda.html`
- `revues.html`
- `assistant.html`

**Tier 3 — Registres** (desktop only)
- `groupes.html`
- `projets.html`
- `projet.html`
- `contacts.html`
- `decisions.html`

**Index navigation**
- `index-nav.html` (responsive)

### Total vues

- Tier 0 : 3 × 1.5 viewports = 5 vues (settings 2 viewports, components 1)
- Tier 1 : 3 pages × 3 viewports = 9 vues
- Tier 1 états critiques : 3 × ~2 = 6 vues
- Tier 2 : 4 pages × 3 viewports = 12 vues
- Tier 2 états critiques : 4 × ~2 = 8 vues
- Tier 3 : 5 pages desktop = 5 vues
- Tier 3 états critiques : 5 × 1 = 5 vues
- Index nav : 3 viewports = 3 vues
- EN cockpit + onboarding + settings : 3 vues
- RTL simulation settings : 1 vue

**Total ~57 vues**. C'est ambitieux. Stratégie : prompt v3 demande explicitement à Claude Design de livrer en **3 vagues** (Tier 0+1, puis Tier 2, puis Tier 3) avec confirmation entre chaque.

## Ressources à produire (en plus des 9 existantes)

| # | Fichier | Contenu | Priorité |
|---|---|---|---|
| 09 | `09-tenant-demo-personae.md` | Remplacement intégral datasets : Northwind Holdings, équipe générique anglophone-friendly | P0 |
| 10 | `10-coaching-patterns.md` | Tone scripts par contexte, time-of-day, mirror moments, friction positive, recovery, posture, anti-gamification | P0 |
| 11 | `11-responsive-spec.md` | Breakpoints, layouts par device, gestures mobile, PWA, safe-area, performance budget | P0 |
| 12 | `12-i18n-spec.md` | Architecture i18n, dictionnaires FR+EN, pluralization, RTL prep, formats locale | P0 |
| 13 | `13-architecture-atomique.md` | Atomic design, tokens hierarchy 3 niveaux, ITCSS, theming JSON, perf budget | P0 |
| 14 | `14-microcopy.md` | Tous les empty/error/placeholder/tooltips en FR + EN | P0 |
| 15 | `15-principes-design.md` | 7 principes fondateurs aiCEO | P1 |
| 16 | `16-mesure-impact.md` | Score santé exécutive, time saved, decision velocity, impact V1 | P1 |

## Évolution prompt

| Version | Contenu | Taille | Pages | Vues |
|---|---|---|---|---|
| v1 | 13 pages desktop, données réelles, base | 16 ko | 13 | 14 |
| v2 | + 24 manques traités, données réelles enrichies | 16 ko prompt + 9 PJ | 13 | 23 |
| **v3** | + multi-tenant + responsive + coaching + i18n + onboarding + settings + components gallery | ~30 ko prompt + 17 PJ | **15** | **~57** |

## Avantages stratégiques de cette refonte

1. **La maquette devient un argument commercial** (multi-CEO scalable)
2. **Le coaching = différenciateur clair** vs Notion/Things/Asana
3. **Architecture évolutive** (atomic design + tokens hierarchy = facile à étendre V1+)
4. **Robustesse i18n** dès le jour 1 (vs migration douloureuse plus tard)
5. **Accessibilité comme principe** (pas comme afterthought)
6. **Mesure d'impact** (CEO peut quantifier la valeur)

## Risques résiduels

1. **Volume génération Claude Design** sur 57 vues. Mitigation : 3 vagues + critères auto-stop.
2. **Cohérence cross-vagues** : risque que Tier 2 vague 2 dérive de Tier 1 vague 1. Mitigation : composants `_shared/` strictement réutilisés + référence dans le prompt à la session précédente.
3. **Image Twisty insuffisante** pour mobile : prévoir 1-2 références mobile complémentaires (Notion mobile, Linear mobile, Cron mobile).

## Calendrier de livraison

- **J0 (aujourd'hui)** : ressources 09-16 produites + prompt v3 finalisé
- **J+1** : maquette générée par Claude Design (vague 1 Tier 0+1)
- **J+2** : validation + vague 2 Tier 2
- **J+3** : validation + vague 3 Tier 3
- **J+4** : audit qualité final + livraison
