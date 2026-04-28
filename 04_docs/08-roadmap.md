# aiCEO — Roadmap & PMO

**Version 3.3 · 28 avril 2026 · v0.6 livrée + insertion v0.7 (gaps LLM/events/status) · trajectoire 18 mois**

> Plan d'exécution PMO par milestones GitHub, avec jalons, livrables, dépendances, équipe minimale et signaux de go/no-go.
>
> **v3.3 (28/04 · ADR restructuration roadmap post-S6.4)** : v0.6 livrée en 4 sprints S6.1 (DS atomic archivé) + S6.2-S6.3 (Phase A Claude Design + 17 écrans) + **S6.4 (câblage v0.6 réel : backend SQLite étendu + 13/17 pages branchées API + sync emails Outlook + bootstrap projets/contacts)**. Scope enrichi vs v3.2 initiale. **Insertion v0.7 entre v0.6 et V1** pour combler les gaps identifiés au CR-GAP-v06-cablage : LLM Anthropic 4 surfaces UX (coaching, decision-recommend, auto-draft-review, "Si vous tranchez A"), sync events Outlook (calendrier), status decision 'reportee' (kanban col Reporté non volatile), FK emails→projects + UI rattachement, 3 pages preview à câbler (assistant, connaissance, coaching), archivage emails-context.js legacy. ~3-4 sessions binôme (~12h chrono) · ~5 k€ absorbés dans provision V1 réduite.
>
> **v3.2 (26/04 · ADR insertion v0.6)** : phase v0.6 "Interface finalisée" insérée entre v0.5 livré et V1. Refonte UI complète selon bundle Claude Design v3.1 (DS atomic + 16 composants + microcopy unifié + accessibility WCAG AA + patterns coaching légers + onboarding simple + components gallery). Pas de scope fonctionnel nouveau. ~2-3 sem binôme · ~8 k€ absorbés dans provision V1.
>
> **v3.1 (26/04 · ADR modèle binôme V1)** : équipe V1 consolidée à Feycoil + Claude (vélocité x30 v0.5 validée → cible x10 V1). Recrutement externe annulé. Budget V1 passe de 300 k€ à 46 k€ (économie 254 k€ réallouée en anticipation V2). 0 ETP externe sauf audit sécurité (~15 k€ fin V1) + tests CEO pairs (~3 k€ mi-V1).
>
> **v3.0 (26/04 · réalignement initial)** : phase v0.5 close (5 sprints en ~16h chrono dogfood). V1 redéfinie autour 6 thèmes prioritaires absorbant multi-tenant + mobile + équipes (ex-V2/V3). Pression Microsoft Copilot CEO 2027 et bundle design Claude Design v3.1 cible visuelle V1.
>
> Remplace la v2.0 du 24/04. Voir ADR `2026-04-26 · Insertion v0.6 — Interface finalisée entre v0.5 et V1` + ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1` + ADR `2026-04-26 · Bundle design Claude Design v3.1` dans `00_BOUSSOLE/DECISIONS.md`.

---

## 1. État d'avancement au 28/04/2026 (post-clôture v0.6)

| Palier | État | Tag / milestone | Preuve |
|---|---|---|---|
| **MVP v0.4** | Livré, run réel | `v0.4` · milestone `MVP` (partiel) | 28/28 tâches arbitrées en 41 s, ≈ 1 ct / arbitrage, 926 mails importés sur 3 boîtes |
| **App Web Twisty v4** | Livré, absorbé dans la fusion v0.5 | — | 13 pages + Design System `02_design-system/` |
| **Produit unifié v0.5 (fusion)** | **✅ LIVRÉ 26/04/2026** | `v0.5` · milestones `v0.5-s1` à `v0.5-s5` (closes) | 5 sprints en ~16h chrono · 41 issues closes · ~95 tests verts · 12 pages frontend · 27 ADRs · 110 k€ / 110 k€ |
| **Bundle design Claude Design v3.1** | ✅ Livré 26/04 (cible visuelle V1) | `04_docs/_design-v05-claude/` | 16 ressources · 6 ADR gouvernance · prompt v3.1 ~16k chars · audit roadmap |
| **v0.6 Interface finalisée + câblage réel** | **✅ LIVRÉ 28/04/2026** | `v0.6-s6.1` (DS atomic archivé) + tag `v0.6-s6.4` à poser post-recette | S6.1 atomic livré (27 composants archive référence V2/V3) + Phase A déployée (17 écrans Claude Design) + S6.4 câblage réel (table emails SQLite, 1052 emails ingérés, 13 projets + 77 contacts auto-créés, 13/17 pages câblées API REST). 449 occurrences cache `?v=98`. Scripts S6.4 ajoutés : ingest-emails, bootstrap-from-emails. CR-GAP livré. |
| **v0.7 LLM + Outlook events + finalisation gaps** | 🔜 Ouverture post-recette ExCom (~3-4 sessions binôme) | milestone `v0.7` à créer | Combler les 5 gaps identifiés CR-GAP : LLM 4 surfaces UX (coaching banner, decision-recommend, auto-draft-review, "Si vous tranchez A") + sync events Outlook + status decision 'reportee' + FK emails→projects + 3 pages preview câblées · ~5 k€ absorbés provision V1 |
| **V1 SaaS + équipes + mobile** | 🔜 Démarrage post-v0.7 | milestone `V1` à recréer | 6 thèmes priorisés ~41 k€ binôme/6 mois (vs 46 k€ : -5 k€ absorbés v0.7) — voir §4 |
| **V2 commercial international** | Esquissée (ex-V2 multi-tenant absorbé en V1) | milestone `V2` à redéfinir | i18n + RTL + SOC 2 + canvas IA + premier client international |
| **V3 coach + offline + post-mortem** | Stable | milestone `V3` | F29-F35 (coach Opus, offline-first, post-mortem auto, multi-CEO écosystème) |

**Vélocité validée v0.5** : 5 sprints (S1+S2+S3+S4+S5) livrés en ~16h chrono cumulées (binôme CEO + Claude) vs ~520h ETP plan = **gain x30**. Schedule variance cumulée ~150 jours d'avance vs calendrier original.

Source unique du backlog : **GitHub Issues** sur [`feycoil/aiCEO`](https://github.com/feycoil/aiCEO/issues) — milestones v0.5-s1 à v0.5-s5 closes, V1 à ouvrir, V2 et V3 à redéfinir.

---

## 2. La trajectoire en 6 paliers (réalignement v3.3)

```
  Livré        Livré        Livré        2 sem        6 mois            T2-T4 2027       T4 2027+
  T2 2026      T2 2026      T2 2026      mai 2026     T3 2026-T1 27     ────────         ────────
     │            │            │            │            │                 │                │
     ▼            ▼            ▼            ▼            ▼                 ▼                ▼
  ┌──────┐   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐         ┌──────┐         ┌──────┐
  │ v0.4 │   │ v0.5 │    │ v0.6 │    │ v0.7 │    │  V1  │         │  V2  │         │  V3  │
  │ MVP  │──▶│Fusion│───▶│Câblé │───▶│ LLM +│───▶│SaaS +│────────▶│Comm. │────────▶│Coach │
  │Rituels│   │unifié│    │+ DS  │    │events│    │équipes│         │intl. │         │+offl.│
  │ réels │   │✅done│    │✅done│    │+ gaps│    │+mobile│         │+i18n │         │+multi│
  └──────┘   └──────┘    └──────┘    └──────┘    └──────┘         └──────┘         └──────┘

  "Je trie    "Tout       "Mon       "Mon      "Je rends         "On vend         "L'outil
   mes        passe par   outil      outil     l'outil           l'outil hors     me rend
   matins."   une seule   est aussi  pense     dispo à mes       écosystème       du temps
              app."       beau qu'il pour      pairs + équipe    ETIC."           et me garde
                          est utile. moi       ETIC, partout,                      en forme.
                          + données  (LLM)."   mobile inclus."                     Multi-CEO."
                          réelles."
```

### Promesse par milestone

- **MVP (T2 2026 · v0.4 livré)** : *« Mon arbitrage matinal est fait en < 10 min avec Claude. »*
- **v0.5 fusion (T2 2026 · ✅ livré 26/04)** : *« Tout mon flux — matin, journée, soir, revues — passe par une seule app. »*
- **v0.6 Interface finalisée + câblage réel (T2 2026 · ✅ livré 28/04 · ~8 k€)** : *« Mon outil est aussi beau qu'il est utile, et il marche sur mes vraies données. DS Claude Design + 13/17 pages câblées API + sync emails Outlook + bootstrap auto projets/contacts. »*
- **v0.7 LLM + Outlook events + gaps (mai 2026 · ~5 k€ binôme)** : *« Mon outil pense pour moi. Coaching IA proactif, draft revue auto, decision-recommend, "si vous tranchez A". Calendrier Outlook synchronisé. Toutes les pages preview câblées. »*
- **V1 (T3 2026-T1 2027 · 6 thèmes 41 k€ binôme)** : *« Multi-tenant, équipes ETIC en collab, intégrations Teams/Notion/Slack, mobile compagnon, observabilité. CEO pairs francophones onboardés. »*
- **V2 (T2-T4 2027)** : *« Commercial international : i18n FR+EN, SOC 2 Type II, premier client international, canvas IA collaboratif, viz riches. »*
- **V3 (T4 2027+)** : *« Coach conversationnel Opus, offline-first, post-mortem auto, multi-CEO écosystème, RTL pour pays MENA. »*

---

## 3. MVP — fondations livrées + fusion v0.5

### 3.1 Acquis v0.4 (24/04/2026)

- **Arbitrage matinal** (`03_mvp/public/index.html`) : import emails 30 j + calendrier, prompt système + contexte email injecté, 3 colonnes FAIRE / DÉLÉGUER / REPORTER avec drag & drop, validation persistée dans `data/decisions.json`.
- **Délégation assistée** : brouillon mail généré par Claude, `mailto:` Outlook, archive locale.
- **Boucle du soir** (`evening.html`) : bilan structuré, humeur, top 3 demain.
- **Intégration Outlook** : PowerShell COM (`outlook-pull.ps1`), scan 3 boîtes (principale + 2 déléguées), delta 30 j, 926 mails utiles en run réel.
- **Proxy corporate** : `HTTPS_PROXY` + `NODE_EXTRA_CA_CERTS` supportés.
- **Chip coral** sur cartes sous pression (≥ 2 relances ou ≥ 3 non lus).
- **Cockpit + 13 pages** app-web Twisty (lue en localStorage, à migrer v0.5).

### 3.2 v0.5 — fusion app-web ↔ MVP (T2 2026)

**Décision ADR du 24/04** : MVP absorbe app-web ; SQLite remplace `localStorage` + JSON ; le MVP devient le produit unique. Voir `DECISIONS.md` + [`SPEC-FONCTIONNELLE-FUSION.md`](SPEC-FONCTIONNELLE-FUSION.md) + [`SPEC-TECHNIQUE-FUSION.md`](SPEC-TECHNIQUE-FUSION.md).

**Périmètre** (21 → 13 pages, consolidation −38%) :

| Famille | Pages cible (dans `03_mvp/public/`) |
|---|---|
| Cockpit / rituels | `index.html` (cockpit unifié), `arbitrage.html`, `evening.html` |
| Tâches / agenda | `taches.html`, `agenda.html` |
| Revues | `revues.html` |
| Registres | `contacts.html`, `decisions.html` |
| Sociétés / projets | `groupes.html`, `projets.html`, `projet/:id.html` (template commun) |
| Copilote | `assistant.html` (WebSocket live) |

**Sprints** (10 semaines cible, 6 sprints) :

| # | Durée | Contenu |
|---|---|---|
| 1 | 2 sem | Schéma SQLite (13 tables) + migrations versionnées + routes API tasks/decisions/contacts/projects/groups + `migrate-from-appweb.js` |
| 2 | 2 sem | Cockpit unifié + arbitrage + evening sur API |
| 3 | 2 sem | Tâches + agenda + revues migrées, retrait `localStorage` |
| 4 | 2 sem | Groupes + projets + template projet + contacts + décisions + assistant chat live (WebSocket) |
| 5 | 1 sem | Service Windows (`node-windows` ou NSSM) + raccourci desktop + tests Playwright 3 flux critiques + CI verte |
| 6 | 1 sem | Scellement, tag `v0.5`, release interne, rétro sprint + ajustement rituels Feycoil |

### 3.2bis Équipe v0.5

- **2 fullstack dev** (Node 20 + vanilla JS + SQL, montée en compétence `better-sqlite3`).
- **0,3 product designer** (maintenance DS "Twisty" côté pages migrées, pas de création).
- **0,3 PMO** (coordination sprints, GitHub Issues, jalons go/no-go).
- **Feycoil** en dogfood quotidien (matin/soir sur v0.5 dès le sprint 2), non budgété.

Total actif : **2,6 ETP** sur 10 semaines.

### 3.2ter Budget v0.5

- Dev : 10 sem × 2,6 ETP × 900 €/j × 4,5 j/sem ≈ **105 k€**.
- Infra / LLM (SQLite local, Claude Sonnet v0.4 inchangé, CI Actions minutes) : ~5 k€.
- **Total v0.5 : ~110 k€**.

Calcul cohérent avec le format V1 (§4). ADR associée : `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Timing & budget v0.5 réconciliés*.

### 3.3 Critères de scellement v0.5 (go/no-go V1)

- 13 pages cibles accessibles à `http://localhost:3001/*`
- Zéro `localStorage` applicatif (seuls paramètres UI légers tolérés)
- Flux matin + flux soir stables 5/5 jours ouvrés sur 3 semaines
- Adoption matin ≥ 80% / soir ≥ 70% des jours ouvrés (tracking)
- Migration sans perte (`check-migration.js` vert)
- Service Windows opérationnel, redémarre après crash
- Tests e2e Playwright verts (arbitrage, délégation, soir)
- CI GitHub Actions verte (lint + unit + audit)
- Zéro incident sécurité (fuite clé, prompt injection)

---

## 3.3 v0.6 — Interface finalisée (mai 2026, ~2-3 sem binôme)

### Objectif

Combler l'écart entre la maquette Claude Design v3.1 (vision V1 SaaS complète) et l'app v0.5 dogfood (UI fonctionnelle mais sans DS atomic, sans microcopy unifié, sans accessibilité WCAG AA, sans patterns coaching). v0.6 est un palier dédié exclusivement à la refonte UI sur le scope fonctionnel v0.5 préservé.

**Promesse** : *« Mon outil est aussi beau qu'il est utile. »*

### Pourquoi un palier dédié ?

Implémenter la refonte UI **dans V1** au milieu des 6 thèmes fonctionnels (multi-tenant + équipes + intégrations + mobile + backup + logs) aurait :
- dilué les sprints V1 et créé des conflits de merge
- retardé les CEO pairs qui auraient découvert un MVP en cours de refonte
- pris le risque de re-coder le DS plus tard sur un produit déjà multi-tenant

Insérer v0.6 entre v0.5 et V1 :
- Valide la direction visuelle par dogfood Feycoil pendant 1-2 mois avant V1
- Permet de présenter à l'ExCom 04/05 une UI réelle (pas juste la maquette)
- L'équipe binôme V1 code multi-tenant sur des fondations stables, pas sur du legacy à refondre
- L'audit accessibilité externe en sortie v0.6 sécurise V1 où l'a11y devient argument commercial

### Périmètre v0.6 (UI uniquement)

| # | Livrable |
|---|---|
| 1 | DS atomic implémenté — tokens 3 niveaux (primitive / semantic / component), ITCSS, BEM avec préfixes |
| 2 | 16 composants UI catalogués (cf. `06-composants-catalogue.md`) — buttons, inputs, modals, toasts, tooltips, dropdowns, switches, progress bars, tags/chips, avatars, skeletons, tabs underline, cards, KPI tiles, search pill, command palette ⌘K |
| 3 | 13 pages refondues — cockpit, arbitrage, evening, taches, agenda, revues, assistant, groupes, projets, projet, contacts, decisions + index nav |
| 4 | Microcopy FR unifié — empty states, errors, confirmations, placeholders, tooltips, onboarding |
| 5 | Accessibilité WCAG AA — skip links, focus visible, ARIA roles, navigation 100 % clavier, prefers-reduced-motion, color blindness (status = couleur + icon) |
| 6 | Patterns coaching v0.6 légers — time-of-day adaptation cockpit (4 modes), friction positive (5e P0), recovery streak break, posture stratégique footer |
| 7 | Onboarding wizard simple (5 étapes) — désactivé pour Feycoil, activable pour CEO pair futur |
| 8 | Settings page basique — 4 sections (identité, intégrations, sécurité base, données) sans multi-tenant config |
| 9 | Components gallery (`/components.html`) — mini-storybook visuel pour gouvernance DS |
| 10 | Drawer collapsible 240 ↔ 60 px persistance localStorage |
| 11 | Iconographie Lucide stroke 1.5 unifiée (30 icônes) |
| 12 | Charts SVG inline (6 patterns autorisés) |
| 13 | Source-link pattern unifié + auto-save dirty state |
| 14 | Streaming SSE assistant raffiné (skeleton bubble + curseur clignotant + reconnexion exp.) |
| 15 | Tests Playwright préservés (~95 verts) + 0 régression v0.5 |
| 16 | Audit accessibilité externe (axe-core + audit pro) avec 0 finding critique |

### À NE PAS livrer en v0.6 (réservé V1+)

- ❌ Multi-tenant, vocabulary configurable, switcher tenant → V1 thème 1
- ❌ Équipes / délégation E2E → V1 thème 2
- ❌ Intégrations Teams/Notion/Slack → V1 thème 3
- ❌ Mobile / tablet / PWA / bottom-tab nav / FAB / bottom sheets → V1 thème 4
- ❌ Backup chiffré automatique → V1 thème 5
- ❌ Logs winston + Langfuse → V1 thème 6
- ❌ i18n FR + EN activé (architecture posée techniquement v0.6 sans activation EN) → V2
- ❌ RTL prep → V2
- ❌ Coach Opus + mirror moments + score santé + self-talk monitoring → V3
- ❌ Offline-first → V3

### Découpage suggéré (3 sprints courts)

| Sprint | Durée chrono dogfood | Contenu |
|---|---|---|
| **S6.1** | ~5 j | DS atomic + 16 composants + drawer + header + footer + components gallery |
| **S6.2** | ~5 j | Refonte cockpit + arbitrage + evening + taches + agenda + patterns coaching v0.6 |
| **S6.3** | ~5 j | Refonte revues + assistant + 5 pages registres + onboarding + settings + microcopy + accessibility + audit a11y + recette CEO + tag `v0.6` |

### Vélocité cible v0.6

**×15 à ×20** (entre v0.5 ×30 et V1 cible ×10). Réaliste car scope étroit (UI uniquement, pas de nouveau backend, pas de migration data).

### Équipe v0.6

**Binôme Feycoil + Claude étendu** (cohérent ADR `2026-04-26 · Modèle binôme V1`). 0 ETP externe.

### Budget v0.6

| Poste | Montant |
|---|---|
| Dev humain (Feycoil dogfood) | 0 € |
| Infra (déjà payée) | 0 € |
| LLM Claude API (3 sem × 30 €/jour) | ~600 € |
| Provision imprévus / outils | ~3 k€ |
| Tests utilisateur (1 CEO pair pré-V1) | ~2 k€ |
| Audit accessibilité externe (axe-core + audit pro) | ~3 k€ |
| **Total v0.6** | **~8 k€** |

Source : provision V1 actuelle (105 k€ disponible) — v0.6 absorbée sans rallonge budgétaire.

### Critères de scellement v0.6 (go/no-go V1)

- 13 pages refondues conformes maquette Claude Design v3.1 (mode "vue dev" filtré sur `[v0.5]` + `[v0.6]`)
- DS atomic implémenté (tokens 3 niveaux + 16 composants)
- Microcopy FR unifié (zéro string ad hoc cross-pages)
- WCAG AA verifiable cockpit/arbitrage/evening (axe-core 0 finding critique)
- Patterns coaching v0.6 visibles
- Onboarding wizard testable en démo CEO pair
- Tests Playwright ≥ 95 verts
- 0 régression fonctionnelle vs v0.5
- Performance : LCP < 2 s desktop, bundle CSS < 50 kb
- Tag `v0.6` posé, GitHub Release publiée
- Adoption Feycoil : 100 % dogfood sur la nouvelle UI pendant 14 j sans bug bloquant

---

## 3.4 v0.7 — LLM + Outlook events + finalisation gaps (mai 2026, ~3-4 sessions binôme)

### Objectif

Combler les 5 gaps fonctionnels identifiés dans `04_docs/CR-GAP-v06-cablage.md` après le câblage S6.4 :

1. **LLM Anthropic activé sur 4 surfaces UX** : coaching banner arbitrage, decision-recommend, auto-draft-review weekly-reviews, "Si vous tranchez A" (effets propagés).
2. **Sync events Outlook** : calendrier (olFolderCalendar) ingéré dans table `events`, page agenda peuplée.
3. **Status decision 'reportee'** : kanban col "Reporté" persiste en DB (au lieu de sessionStorage volatile).
4. **FK emails → projects** : table emails reçoit `project_id` + UI rattachement maison/projet manuel ou auto-suggéré.
5. **3 pages preview câblées** : assistant.html (chat SSE live), connaissance.html (épinglage decisions/critères), coaching.html (sessions hebdo dimanche soir).

**Promesse** : *« Mon outil pense pour moi. Le coaching arrive au bon moment, la draft de revue est prête vendredi soir, le kanban kanban est persistant, mes emails sont rattachés à mes projets. »*

### Pourquoi un palier dédié ?

Ces 5 gaps sont identifiés en sortie de S6.4 (28/04) comme reportés délibérément. Les inclure en V1 aurait :
- Dilué les sprints V1 multi-tenant + équipes
- Mélangé "back-office souverain" (V1) et "intelligence augmentée" (v0.7)
- Bloqué l'intérêt UX du coaching IA jusqu'à T3 2026

Insérer v0.7 entre v0.6 et V1 :
- Active les promesses-clés de la maquette Claude Design dans 1-2 mois
- Permet la recette CEO sur un produit "complet" avant ouverture aux pairs
- Met le LLM en production en mode sécurisé (mono-user Feycoil) avant multi-tenant V1

### Périmètre v0.7

| # | Livrable | Source |
|---|---|---|
| 1 | LLM `/api/assistant/messages` câblé en chat live (page `/v06/assistant.html`) | Backend déjà prêt, frontend SSE chunk-by-chunk |
| 2 | LLM `/api/assistant/decision-recommend` câblé sur cards arbitrage focus mode | Affiche raison + impact + recommandation A/B/C |
| 3 | LLM `/api/assistant/auto-draft-review` câblé bouton "Démarrer la revue" | Génère intention + bilan + cap prochaine semaine pré-remplis |
| 4 | LLM coaching banner arbitrage (`/coaching-question`) | Question stratégique contextualisée selon historique décisions |
| 5 | Script `scripts/fetch-outlook-events.ps1` (Outlook COM olFolderCalendar) | Pendant ~50 lignes PS pour read-only events sur 30j |
| 6 | Migration `data/migrations/2026-05-XX-events-extend.sql` (FK source_id, type='outlook') | Ingestion via `scripts/normalize-events.js` (nouveau) |
| 7 | Page `/v06/agenda.html` peuplée + grille hebdo drag-drop | bind-agenda.js v2 réécrit |
| 8 | Migration status decision `reportee` (ALTER TABLE check) | Permet kanban col Reporté persistant |
| 9 | bind-arbitrage-board.js v2 : drag→ "Reporté" persiste status='reportee' | Plus de sessionStorage volatile |
| 10 | Migration `2026-05-XX-emails-fk-projects.sql` : ajout `emails.project_id` FK | Avec endpoint POST `/api/emails/:id/link-project` |
| 11 | UI rattachement projet sur file arbitrage emails | Dropdown projets dans la card proposition |
| 12 | Endpoint suggestion auto `/api/emails/suggest-project` (heuristique → LLM v0.7+) | Match `inferred_project` ↔ slug projet existant |
| 13 | Page `/v06/connaissance.html` câblée : épinglage decisions/critères | Nouvelle table `knowledge_pins` |
| 14 | Page `/v06/coaching.html` câblée : session hebdo dimanche soir | Lecture `evening_sessions` + LLM Opus optionnel |
| 15 | Archivage `src/emails-context.js` legacy (plus utilisé) | Supprimer + tag git si rien ne casse |
| 16 | Tests Playwright préservés ≥ 95 verts + nouveaux tests LLM mock | 0 régression v0.6 |
| 17 | Validation `ANTHROPIC_API_KEY` en prod + budget tokens monitoring | Variable env + dashboard /api/system/health |

### À NE PAS livrer en v0.7 (réservé V1+)

- ❌ Multi-tenant, équipes, mobile, intégrations Teams/Notion/Slack → V1
- ❌ Backup auto SQLite → V1.5 (R1 risque résiduel v0.5)
- ❌ Logs winston structurés → V1.6
- ❌ i18n EN activé → V2
- ❌ Coach Opus avancé (vs coaching banner simple v0.7) → V3

### Découpage suggéré (3 sessions binôme courtes)

| Sprint | Durée chrono | Contenu |
|---|---|---|
| **S6.5** | ~4h | LLM 4 surfaces UX (coaching banner + decision-recommend + auto-draft-review + "si vous tranchez A") + tests mock |
| **S6.6** | ~4h | Sync events Outlook (script PS + ingestion + bind-agenda v2) + status decision 'reportee' (migration + bind-arbitrage-board v2) |
| **S6.7** | ~4h | FK emails→projects (migration + endpoint + UI) + 3 pages preview câblées (assistant SSE + connaissance + coaching) + archivage legacy + recette + tag `v0.7` |

### Vélocité cible v0.7

**×15** — entre v0.6 (×30 sur scope étroit S6.4) et V1 (×10 sur scope large multi-tenant). Cohérent avec le scope intermédiaire (3 chantiers techniques + 3 pages UI).

### Équipe v0.7

**Binôme Feycoil + Claude étendu** (cohérent ADR `2026-04-26 · Modèle binôme V1`). 0 ETP externe.

### Budget v0.7

| Poste | Montant |
|---|---|
| Dev humain (Feycoil dogfood) | 0 € |
| Infra (déjà payée) | 0 € |
| LLM Claude API (1 mois × 50 €/jour, prod live) | ~1.5 k€ |
| Provision tokens budget run | ~1.5 k€ |
| Validation `ANTHROPIC_API_KEY` prod + monitoring | ~0.5 k€ |
| Tests utilisateur (CEO pair pré-V1, optionnel) | ~1 k€ |
| Provision imprévus | ~0.5 k€ |
| **Total v0.7** | **~5 k€** |

Source : provision V1 actuelle (105 k€ avant v0.6 → 97 k€ après v0.6 → 92 k€ après v0.7). V1 passe de 46 k€ à 41 k€ effectif (vélocité ×10 maintenue).

### Critères de scellement v0.7 (go/no-go V1)

- LLM Anthropic actif en prod sur 4 surfaces UX (testable en démo CEO pair)
- `ANTHROPIC_API_KEY` validée + budget tokens contrôlé (dashboard `/api/system/health`)
- Sync events Outlook fonctionnelle, page agenda peuplée
- Kanban arbitrage col "Reporté" persiste en DB (status='reportee')
- ≥ 5 emails rattachés manuellement à un projet (test FK)
- 3 pages preview (assistant, connaissance, coaching) ne portent plus le banner ambre "v0.7/v0.8"
- Tests Playwright ≥ 95 verts + tests LLM mock (offline)
- 0 régression fonctionnelle vs v0.6
- `src/emails-context.js` legacy archivé/supprimé
- Tag `v0.7` posé, GitHub Release publiée
- Dogfood Feycoil 14 j sans bug bloquant LLM ni quota dépassé

### Risques v0.7

- **R1** — Coût tokens LLM dérive si prompt mal calibré (mitigation : monitoring + alertes >100€/jour)
- **R2** — Outlook COM API capricieuse sur events (déjà connue sur emails) — mitigation : run manuel + retry
- **R3** — Status `reportee` introduit régression CHECK constraint — mitigation : migration testée en sandbox avant prod
- **R4** — LLM hallucine recommandations decision — mitigation : fallback rule-based + UI "vérifier la source"

---

## 4. V1 — SaaS + équipes + mobile (T3 2026 - T1 2027, 6 mois)

### Objectif

Sortir l'outil du dogfood mono-Feycoil pour ouvrir à des CEO pairs francophones et à l'équipe ETIC, avec une expérience mobile compagnon et les intégrations entreprise (Teams, Notion, Slack). C'est la phase qui transforme aiCEO en produit utilisable hors poste Windows de Feycoil.

**Promesse** : *« Je rends l'outil dispo à mes pairs + équipe ETIC, partout, mobile inclus. »*

### Pression marché

Microsoft a annoncé Copilot CEO pour 2027. Notre fenêtre d'avance est limitée — d'où la décision (ADR 26/04) d'absorber dans V1 ce qui était auparavant V2 (multi-tenant) et V3 (mobile). Vélocité x30 du binôme CEO+Claude validée sur v0.5 rend le scope tenable en 6 mois.

### 6 thèmes prioritaires (ordre du 26/04)

| # | Thème | Budget | Description |
|---|---|---|---|
| 1 | **Multi-tenant** | ~80 k€ | Supabase + RLS + auth Microsoft Entra ID. Ajout `user_id` + `tenant_id` à toutes les tables. Isolation stricte. Migration SQLite → Postgres. Vocabulary configurable par tenant ("groupe" / "house" / "holding"). |
| 2 | **Équipes (vues role-specific + délégation pro E2E)** | ~50 k€ | Rôles (CEO, DG, AE, manager, collaborateur). DG voit décisions + projets assignés, AE voit agenda + tâches à planifier. Quand CEO délègue, tâche apparaît chez destinataire. Matrice confiance silencieuse. |
| 3 | **Intégrations** | ~60 k€ | Microsoft Teams (Graph API OAuth msal-node — remplace PowerShell COM), Notion (lecture pages + pousser tâches), Slack (push délégations, mentions canal). Webhooks sortants Zapier-compatible. |
| 4 | **App mobile compagnon (PWA)** | ~70 k€ | iOS + Android via PWA. 3 viewports responsive (390 / 1024 / 1440). Bottom-tab nav 5 items + FAB. Bottom sheets remplaçant modals desktop. Notifications push (priorité, validations rapides). Dictée vocale pour création tâche. Consultation pendant déplacement. |
| 5 | **Backup automatique SQLite + chiffrement at-rest** | ~20 k€ | Schtasks daily backup chiffré AES-256. Snapshots versionnés 7/30/365 j. Point S5.04 reporté de v0.5. Fin du risque "perte irréversible si crash disque". |
| 6 | **Logs winston-daily-rotate-file + monitoring Langfuse** | ~20 k€ | Logs structurés JSON avec rotation. Langfuse pour traçabilité LLM (tokens, prompts, latences). Point S5.05 reporté de v0.5. Pré-requis observabilité multi-tenant. |

### Thèmes secondaires (V1.5, mêmes 6 mois si vélocité tient)

Anciennes V1 v2.0 reclassées en V1.5 (à intégrer si vélocité dogfood le permet) :

- **F10 · Copilote proactif Inngest.** Jobs schedulés + webhooks Graph. Sub-agents spécialisés.
- **F11 · Mémoire long-terme pgvector.** 3 strates (identity, preference, episode). Résumés roulants hebdo.
- **F15 · Intégration SharePoint RAG.** Documents CEO, permissions trimmées, embeddings Voyage-3.
- **F19 · Visualisations riches.** Carte radiale sociétés, arbre Big Rocks, timeline décisions.

### Bundle design Claude Design v3.1 (cible visuelle V1)

Voir `04_docs/_design-v05-claude/` pour la maquette complète. Le bundle a été produit le 26/04 et acté comme cible visuelle V1 par l'ADR du même jour. 16 ressources + prompt v3.1 + 6 ADR de gouvernance.

Couvre les 6 thèmes + anticipe légèrement V3 (coaching) avec target version explicite par feature dans `17-cadrage-livraison-par-version.md`.

### Transitions techniques majeures

- **SQLite local → Postgres Supabase** (migration one-shot, table `_migrations` versionnée). Multi-tenant par RLS.
- **PowerShell COM → Microsoft Graph API OAuth** (msal-node device code flow). Backend autonome sans session Windows.
- **Ajout Inngest** pour durable execution (cron + webhooks + retries) — V1.5.
- **Ajout pgvector** pour la mémoire long-terme — V1.5.
- **Ajout Langfuse** pour traçabilité LLM — V1 thème 6.
- **Ajout PWA + service worker** pour mobile — V1 thème 4.

### Livrables V1

- Application multi-tenant fonctionnelle avec ≥ 2 CEO pairs francophones onboardés.
- Équipe ETIC (DG + AE) en collab opérationnelle.
- App mobile PWA installable sur iPhone/Android.
- Intégrations Teams + Notion + Slack actives.
- Backup automatique chiffré + observabilité Langfuse.
- Bundle design v3.1 implémenté à 100 % sur features `[V1]`.

### Équipe — modèle binôme étendu (ADR `2026-04-26 · Modèle binôme CEO + Claude étendu à V1`)

Tous les rôles techniques V1 sont assurés par le binôme **Feycoil + Claude**, validé sur v0.5 (vélocité x30, 5 sprints en ~16h chrono dogfood).

| Rôle | Acteur | Périmètre |
|---|---|---|
| **CEO + dogfood + arbitrage produit + signature externe** | Feycoil | Vision, arbitrage, validation, signature contrats Apple/Google/SOC 2/CEO pairs, dogfood quotidien matin/soir |
| **Fullstack dev (×2)** | Claude (mode séquentiel rapide) | Node 20 + Postgres + RLS Supabase + vanilla JS + Tailwind + Express |
| **Mobile dev (PWA)** | Claude | Manifest, service worker, viewports responsive, gestures, FAB, bottom-tab nav |
| **AI engineer / LLM** | Claude | Prompts, sub-agents, evals, integration Anthropic SDK, fallback rule-based |
| **Product designer** | Claude (bundle v3.1 livré) | DS, composants UI, patterns, accessibilité, microcopy, motion |
| **DevSecOps** | Claude | Chiffrement AES-256, msal-node OAuth, RLS, audit log |
| **PMO** | Claude | Sprints, milestones GitHub, ADR, recette, planning, retro |
| **CEO pair suppléant (résilience binôme)** | Lamiae (à former mois 1) | Dogfood + arbitrage en cas d'empêchement Feycoil > 7 j |

**0 ETP externe en V1**. Recrutement annulé.

### Externalisations strictement nécessaires

- **Audit sécurité externe (pen-testing)** : prestataire en sortie V1 (~15 k€). Pré-requis avant ouverture commerciale V2.
- **Tests utilisateurs CEO pairs réels** : 2 CEO pairs francophones onboardés en mode bêta accélérée mois 4-5 (~3 k€ formation + repas + support).

### Budget V1 — révisé binôme

- Dev humain : **0 €** (Feycoil non budgété en équipe, mode dogfood)
- Infra (Supabase Pro + Postgres RLS + Bedrock EU + Langfuse Cloud + monitoring + backup chiffré) : **~12 k€**
- LLM Claude API (6 mois × 30 €/jour moyen) : **~5,5 k€**
- Apple Developer + Google Play Developer : **~150 €**
- Audit sécurité externe (pen-testing fin V1) : **~15 k€**
- Onboarding 1er CEO pair (formation, support 1×1) : **~3 k€**
- Provision imprévus / outils SaaS divers : **~10 k€**
- **Total V1 binôme : ~46 k€** (vs 300 k€ sourcing externe — économie 254 k€)

### Réallocation 254 k€ économisés (anticipation V2)

Recommandation : option β (anticipation V2) pour absorber pression Microsoft Copilot CEO 2027.

- **Marketing initial** (landing, pricing, comparison, 5 case studies) : ~80 k€
- **Recrutement 1 success/sales junior à mi-V1** (mois 4, ramp-up, onboarding) : ~40 k€
- **Provision SOC 2 anticipée** : ~50 k€
- **Trésorerie restante** (provision V2 ou autre) : ~85 k€

### Vélocité cible V1

- v0.5 a validé **x30**.
- V1 cible **x10** (6 mois suffisent largement pour 6 thèmes ~300 k€ valeur travail externalisée équivalent).
- Si chute < x5 en mi-V1, GO recrutement externe partiel (1 fullstack senior ~8 k€/mois) en mois 4. Pas avant.

### Critères de go/no-go V2

- Tag `v1` posé avec multi-tenant + équipes + intégrations + mobile + backup + logs livrés
- ≥ 2 CEO pairs francophones onboardés et utilisateurs actifs ≥ 30 j
- Adoption mobile par Feycoil ≥ 60 % des consultations hors bureau
- Adoption équipe ETIC (DG + AE) ≥ 50 % des jours ouvrés
- Architecture i18n fonctionnelle en sandbox (toggle FR/EN visible mais pas activé externe)
- Aucun incident sécurité / fuite multi-tenant
- Validation explicite Feycoil pour ouvrir à un client international (V2)
- Rituels matin/soir/hebdo maintenus aux seuils v0.5

---

## 5. V2 — commercial international + i18n + SOC 2 (T2-T4 2027, 20 semaines)

### Objectif

Passer de **mono-tenant francophone à SaaS commercial international**. Premier client hors écosystème ETIC. Conformité SOC 2 Type II obtenue. i18n FR+EN activé (RTL préparé). Canvas IA collaboratif et viz riches finalisés.

**Promesse** : *« On vend l'outil hors écosystème ETIC. »*

### Note de réalignement v3.0 (26/04)

L'ancienne V2 (ROADMAP v2.0) couvrait "multi-utilisateur" qui a été absorbé en V1 nouvelle (équipes + multi-tenant). V2 nouvelle se recentre sur la dimension commerciale internationale + conformité.

### Périmètre

- **F23 · Comité stratégique intégré (canvas de décision).** Préparation IA (ODJ, briefs par sujet), canvas de décision pendant la séance, PV post-séance automatique, suivis. (ex F24 ROADMAP v2.0)
- **F25 · Canvas tldraw + agent visible.** Pensée visuelle collaborative : CEO et équipe dessinent, l'agent réorganise, enrichit, pousse dans un brief. (inchangé)
- **F26 · Graphe Cytoscape.** Vue réseau des parties prenantes d'une décision, dépendances inter-projets. (inchangé)
- **F27 · Dashboard équipe avancé.** Vue synthèse des charges de chaque équipier (matrice confiance, charge actuelle, disponibilités), tendances long-terme. (inchangé)
- **F28 · SOC 2 Type II.** Audit via Vanta/Drata. Conformité complète RGPD + ISO 27001 partiel. (inchangé)
- **F29 · i18n FR + EN activé.** Architecture déjà préparée en V1 (helper `t()`, dictionnaires). En V2 : activation effective, premier client EN onboardé, support multi-langue dans drawer + settings + locale switcher. (NOUVEAU)
- **F30 · RTL prep (AR/HE).** Layout flippé, icônes directionnelles miroir, drawer côté droit. Premier marché : Maroc / Émirats si client identifié. (NOUVEAU)
- **F31 · Premier client international.** Onboarding hors écosystème ETIC. Pricing transparent. Self-service signup (avec validation manuelle Feycoil sur les 5 premiers comptes). (NOUVEAU)
- **F32 · Visualisations riches finalisées.** Carte radiale sociétés, arbre Big Rocks, timeline décisions, mind-map des relations. Reporté de V1 ROADMAP v2.0. (NOUVEAU)
- **F33 · API publique + browser extension.** Pour intégrations clients tiers. Capture rapide depuis n'importe quelle page web. (NOUVEAU)

### Livrables V2

- Application multi-langue FR + EN activée, RTL préparé.
- Premier client international onboardé hors écosystème ETIC.
- Canvas IA collaboratif (tldraw + Yjs).
- Graphe visuel du réseau.
- Certification SOC 2 Type II obtenue.
- Pricing transparent + self-service signup.
- API publique + browser extension.

### Équipe

- 4 fullstack + 2 AI + 1 DevSecOps + 1 designer + 1 success/sales + PMO 0.5 ETP = ~9 ETP.

### Budget estimé

- Dev : 20 sem × 9 ETP × 900 €/j × 4.5 j/sem ≈ **730 k€**.
- Infra V2 : ~20 k€ sur la période.
- Certification SOC 2 : ~25 k€.
- Marketing initial (landing, pricing, comparison) : ~25 k€.
- **Total V2 : ~800 k€** (vs 693 k€ ROADMAP v2.0 — +100 k€ pour la commercialisation).

### Critères de go/no-go V3

- ≥ 5 clients tenants payants stable
- ≥ 1 client international actif (FR ou EN)
- Temps CEO gagné ≥ 8 h/semaine maintenu sur la base
- Certification SOC 2 obtenue
- ARR ≥ 200 k€ sur 12 mois glissants
- Validation Feycoil pour ouvrir RTL + multi-CEO écosystème

---

## 6. V3 — coaching stratégique + offline + multi-CEO (T4 2027+, 16 semaines)

### Objectif

Transformer aiCEO d'assistant en **coach stratégique long-terme**. Questions socratiques, pattern detection sur 12+ mois d'historique, anti-burnout actif. Mode offline-first robuste pour tous les utilisateurs (avion, déplacements). Multi-CEO écosystème (plusieurs CEO indépendants partagent données limitées).

**Promesse** : *« L'outil me rend du temps et me garde en forme. Je dispose d'un coach disponible 24/7. »*

### Note de réalignement v3.0 (26/04)

L'ancienne V3 (ROADMAP v2.0) couvrait "coach + mobile" — mobile a été absorbé en V1, V3 se recentre sur coaching + offline + multi-CEO.

### Périmètre (épics F35-F45)

- **F35 · Coach conversationnel activable.** Modes « arbitrage », « je me sens coincé », « revue stoïque ». Claude Opus pour cette couche. Bibliothèque de questions par framework (EOS Traction / Eisenhower / Stoïcisme appliqué). Toggle dans Settings.
- **F36 · Mirror moments hebdomadaires.** Observations factuelles automatiques 1×/semaine (délégations, Big Rocks, énergie, decisions velocity). Visibles dans la revue dimanche.
- **F37 · Score santé exécutive.** Composite hebdo (régularité boucle soir + énergie + mood + tasks done/planned + decisions tranchées + Big Rocks atteints + time saved IA + decision velocity). Affichage uniquement dans revue dimanche, pas de notification agressive.
- **F38 · Self-talk monitoring + recadrage doux.** Détection patterns négatifs dans notes du soir. Reformulation proposée par Claude (jamais imposée).
- **F39 · Pause forcée ergonomie.** Détection > 2h continues, suggestion pause 15 min. Rappel posture hebdo vendredi.
- **F40 · Detection burnout active.** Croisement mails > 22h, weekends actifs, score humeur, taux acceptation — interventions graduées (question → nudge → bloc focus proposé → journée off).
- **F41 · Boîte à outils psychologique.** Respiration guidée, méditations, recadrage cognitif, carnet des victoires.
- **F42 · Post-mortem automatique.** Quand un Big Rock échoue ou qu'une décision ne se concrétise pas, rétrospective structurée.
- **F43 · Offline-first (ElectricSQL ou PowerSync).** Sync Postgres ↔ SQLite local, usage en avion / sans réseau.
- **F44 · Multi-CEO écosystème.** Ouverture contrôlée à 2-3+ CEO indépendants qui partagent uniquement données réseau (pas tâches/decisions). Réseau de pairs.
- **F45 · Mobile mature (animations, gestures, dictée vocale avancée).** Raffinement V1 mobile.

### Livrables V3

- Coach conversationnel Opus opérationnel + 8 patterns coaching activables.
- Boîte à outils bien-être.
- Offline-first robuste.
- Pack multi-CEO écosystème avec isolation stricte par tenant.
- Mobile mature (au-delà de la PWA V1 fonctionnelle).

### Équipe

- Équipe stabilisée à **8-10 ETP**, plus un psychologue consultant 0.2 ETP pour la couche coaching.

### Budget estimé

- Dev : 16 sem × 9 ETP × 900 €/j × 4.5 j/sem ≈ **583 k€**.
- Consulting psycho : ~15 k€.
- **Total V3 : ~600 k€**.

---

## 7. Backlog priorisé

### 7.1 Source unique : GitHub Issues

Depuis le 24/04/2026, **GitHub Issues sur `feycoil/aiCEO` est la source unique du backlog** (ADR dans `DECISIONS.md`). L'xlsx d'origine est archivé dans [`_archive/2026-04-backlog-initial/`](../_archive/2026-04-backlog-initial/).

| Dimension | Valeur |
|---|---|
| Issues actives | **78** (42 epics F1-F42 + ~35 tactiques + 1 épic infra/DX) |
| Milestones | 4 : `MVP`, `V1`, `V2`, `V3` |
| Labels | 29 : `lane/*` · `type/*` · `priority/*` · `status/*` · `phase/*` · `scope/*` |
| URL | https://github.com/feycoil/aiCEO/issues |

**Règle** : tout nouveau besoin produit = **nouvelle Issue** (pas de TODO dans le code, pas de fichier backlog parallèle).

### 7.2 Top features par milestone (extrait RICE)

Méthodologie RICE = Reach × Impact × Confidence / Effort. Scores calculés pour 1 utilisateur (Feycoil) en MVP/V1 ; Reach monte à 5-10 en V2+.

| ID | Feature | Milestone | Reach | Impact | Conf. | Effort (sem) | Score | État |
|---|---|---|:-:|:-:|:-:|:-:|:-:|:-:|
| F1 | Cockpit consolidé | MVP | 10 | 3 | 0.9 | 2 | 13.5 | ✅ v0.4 (app-web) + v0.5 (fusion) |
| F6 | Intégration Outlook COM | MVP | 10 | 3 | 0.95 | 3 | 9.5 | ✅ v0.4 |
| F7 | Copilote réactif (chat) | v0.5 | 10 | 3 | 0.85 | 3 | 8.5 | 🔜 sprint 4 fusion |
| F8 | Délégation assistée | MVP | 10 | 3 | 0.9 | 3 | 9.0 | ✅ v0.4 |
| F10 | Copilote proactif (Inngest) | V1 | 10 | 3 | 0.7 | 5 | 4.2 | 📋 |
| F11 | Mémoire long-terme pgvector | V1 | 10 | 2.5 | 0.7 | 4 | 4.4 | 📋 |
| F12 | Rituels intégrés | V1 | 10 | 3 | 0.85 | 2 | 12.8 | 🔜 partiel v0.5 |
| F15 | Intégration SharePoint | V1 | 10 | 2 | 0.8 | 3 | 5.3 | 📋 |
| F17 | Migration SolidJS | V1 | 10 | 2 | 0.5 | 6 | 1.7 | 🔬 muté research |
| F19 | Viz riches (radiale, arbre) | V1 | 10 | 3 | 0.8 | 3 | 8.0 | 📋 |
| F22 | Délégation end-to-end | V2 | 5 | 3 | 0.7 | 4 | 2.6 | 📋 |
| F24 | Comité stratégique intégré | V2 | 2 | 3 | 0.6 | 4 | 0.9 | 📋 |
| F25 | Canvas tldraw + agent | V2 | 10 | 2.5 | 0.6 | 6 | 2.5 | 📋 |
| F29 | Coach conversationnel | V3 | 10 | 2.5 | 0.5 | 5 | 2.5 | 📋 |
| F31 | Détection burnout active | V3 | 10 | 3 | 0.55 | 4 | 4.1 | 📋 |
| F42 | Kill switch global | V3 | 10 | 2 | 0.9 | 1 | 18.0 | 📋 (à remonter MVP) |

Légende : ✅ livré · 🔜 sprint courant · 📋 backlog · 🔬 research

---

## 8. Dépendances & chemin critique

```
  MVP v0.4 (livré)
         │
         ▼
  Spec fusion validée (livrée 24/04) ─────┐
         │                                │
         ▼                                ▼
  Schéma SQLite + migrations (S1)    Routes API REST (S1)
         │                                │
         └──────────────┬─────────────────┘
                        ▼
                 Migration data (S1)
                        │
                        ▼
              Cockpit unifié (S2)
                        │
                        ▼
          Pages rituels sur API (S2-S3)
                        │
                        ▼
          Pages portefeuille + chat (S4)
                        │
                        ▼
              Service Windows (S5)
                     