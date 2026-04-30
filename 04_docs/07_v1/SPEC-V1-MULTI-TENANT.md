# SPEC V1 — SaaS multi-tenant aiCEO

**Cible** : T3-T4 2026 · ~41 k€ binome · 6 mois · **Audience** : binome + Lamiae future suppleante

> Spec technique V1 elaboree en autonomie agent post-v0.8.

## Architecture cible

```
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Frontend v07    │──│ Backend Express  │──│ Supabase Postgres │
│ (Editorial      │  │ + node:sqlite    │  │ + Row-Level      │
│  Executive      │  │ → migration vers │  │  Security (RLS)  │
│  voix exec)     │  │ Supabase prisma  │  └──────────────────┘
└─────────────────┘  └──────────────────┘             │
        │                     │                        │
        │              Microsoft Entra ID              │
        └────── Auth OAuth2 ──┘                        │
                                                        │
                     Anthropic Claude API ──────────────┘
                     (mode live optionnel)
```

## 8 sprints V1 (~6 j-binome cumule)

### V1.1 — Auth Microsoft Entra (1 j)
- Integration `passport-azure-ad`
- OAuth2 redirect + JWT session
- Migration `user_preferences` vers users table multi-tenant

### V1.2 — Migration SQLite -> Supabase (1 j)
- 21 tables existantes -> Postgres avec contrainte tenant_id
- Migrations Prisma + scripts d export/import
- Test sur staging Supabase free tier

### V1.3 — Row-Level Security (RLS) Postgres (0.5 j)
- Policies par tenant_id sur toutes les tables
- Test isolation : user A ne voit pas les Decisions de user B
- Audit security (basic)

### V1.4 — Frontend multi-tenant (0.5 j)
- Switcher tenant dans drawer-sidebar (`ds-tenant`)
- API calls avec header `X-Tenant-ID` ou JWT claim
- Prefs et Streams par tenant

### V1.5 — Equipes + delegations (1 j)
- Table `team_memberships` (user_id × tenant_id × role)
- Roles : owner / member / viewer
- UI : page Settings → Equipe (invite + permissions)

### V1.6 — Mobile responsive complet (1 j)
- Audit 19 pages v07 sur viewport 380px (iPhone SE) et 768px (iPad)
- Patches CSS (breakpoints supplementaires si necessaire)
- Bottom-tab nav deja OK, juste ajustements drawers + modals

### V1.7 — Backup auto + logs winston (0.5 j)
- Cron Supabase backup quotidien (free tier OK)
- Migration `console.log` -> `winston` 3 transports (console + file + sentry-stub)
- Rotation logs : 5 Mo / 5 archives

### V1.8 — BETA 5 CEOs pairs (1 j + 3 j cal.)
- Recrutement Lamiae + 4 CEO francophones
- Onboarding personalise (template `04_docs/ONBOARDING-CEO-PAIR.md`)
- Feedback structure 30 min / semaine pendant 4 semaines
- Iteration sur 2-3 features minor

## Stack technique V1

| Composant | v0.8 (actuel) | V1 (cible) | Migration |
|---|---|---|---|
| DB | node:sqlite local | Supabase Postgres | scripts/migrate-supabase.js |
| Auth | aucune (single user) | Microsoft Entra ID | passport-azure-ad |
| Frontend | v07 vanilla JS | inchange (Atomic Templates) | rien |
| LLM | Anthropic Claude | inchange + cache redis | + ioredis |
| Backup | manuel snapshot | Supabase auto-backup | config Supabase |
| Logs | console.log | winston | refactor server.js |
| Tests | node:test + Playwright | + load testing artillery | nouveau |

## Decisions techniques

### D1 — Pourquoi Supabase plutot que Firebase / AWS RDS ?
- Postgres natif (pas de NoSQL imposee)
- RLS built-in
- Tier gratuit suffisant pour BETA 5 users
- Open-source friendly, exit possible vers self-hosted

### D2 — Pourquoi Microsoft Entra plutot que Auth0 ?
- ETIC est ecosysteme Microsoft (Outlook, Teams, AAD)
- SSO natif sans surcout
- Conformite RGPD France OK

### D3 — Cohabitation v06 / v07 / v08 ?
- v06 archivee en `_v06-legacy/` (ne plus servir)
- v07 = home par defaut depuis S6.15 (deja effectif)
- "v08" = pas une nouvelle UI, juste l identite Editorial Executive sur v07
- En V1 : drawer voix exec figee (Pilotage/Travail/Capital -> noms preserves OU bascule Compass/Deliver/Wealth a trancher si feedback BETA)

### D4 — Mobile-first ou desktop-first ?
- v0.8 desktop-first (Cockpit grand ecran)
- V1.6 = audit mobile + ajustements
- V2 mobile-first refonte si besoin

## KPIs V1 cible (mesures Reglages → Coaching)

| KPI | v0.8 (now) | V1 cible |
|---|---|---|
| Note produit (auto-eval CEO) | 6.3 / 10 | 8.0 / 10 |
| Smoke pass rate | 100 % | 100 % |
| Velocite arbitrage (emails/min) | 5 | 7+ |
| NPS interne (BETA 5 CEOs) | — | ≥ 8/10 |
| Time-to-1ere-action Cockpit | < 10 sec | < 5 sec |

## Budget V1 detail

| Poste | Cout |
|---|---|
| Binome (6 mois × 4 j/sem × 0.5 j-binome/sprint) | 30 k€ |
| Supabase Pro (BETA + production) | 1.5 k€ |
| Microsoft Entra | inclus ETIC |
| Anthropic API (BETA 5 users 6 mois) | 4 k€ |
| Prestataire audit securite (sortie V1) | 5 k€ |
| Onboarding 5 CEOs pairs | 0.5 k€ (cafes, 4 sessions × 5) |
| **TOTAL** | **~41 k€** |

## Risques V1 et mitigations

| Risque | Severite | Mitigation |
|---|---|---|
| R-V1.1 Migration SQLite -> Supabase casse donnees | ★★★ | Backup avant migration + rollback script + test staging d abord |
| R-V1.2 Microsoft Entra rejette par tenant ETIC | ★★ | Plan B : auth simple JWT email/password |
| R-V1.3 BETA NO-GO (5 CEOs trouvent NPS < 8) | ★★★ | 1 boucle V1bis (1-2 mois) avec ajustements |
| R-V1.4 Anthropic pricing 2x | ★★ | Abstraction LLM-provider, fallback Mistral/local |

---

**Version** : 1.0 · 29/04/2026 PM tres tardif · livre en autonomie agent · a valider Lamiae + Major
