# CR Gap — Câblage backend ↔ frontend v0.6

> **Date** : 28/04/2026  
> **Sprint** : S6.4 (post Phase A Claude Design)  
> **Auteur** : Claude (binôme CEO + agent)  
> **Statut DB** : SQLite mono-instance, 20 tables, 4 migrations appliquées

---

## §1 — État backend (audit)

### Routes API REST montées (14)

| Route | Router | Source | Statut |
|---|---|---|---|
| `/api/tasks` | `src/routes/tasks.js` | SQLite (table `tasks`) | ✅ |
| `/api/decisions` | `src/routes/decisions.js` | SQLite (table `decisions`) | ✅ |
| `/api/contacts` | `src/routes/contacts.js` | SQLite (table `contacts`) | ✅ |
| `/api/projects` | `src/routes/projects.js` | SQLite (table `projects`) | ✅ |
| `/api/groups` | `src/routes/groups.js` | SQLite (table `groups`) | ✅ |
| `/api/events` | `src/routes/events.js` | SQLite (table `events`) | ✅ |
| `/api/cockpit` | `src/routes/cockpit.js` | SQLite (vues agrégées) | ✅ |
| `/api/arbitrage` | `src/routes/arbitrage.js` | SQLite (table `emails` + `decisions` + `arbitrage_sessions`) | ✅ |
| `/api/evening` | `src/routes/evening.js` | SQLite (table `evening_sessions`) | ✅ |
| `/api/weekly-reviews` | `src/routes/weekly-reviews.js` | SQLite (table `weekly_reviews` + `weeks`) | ✅ |
| `/api/big-rocks` | `src/routes/big-rocks.js` | SQLite (table `big_rocks`) | ✅ |
| `/api/system` | `src/routes/system.js` | health + sync | ✅ |
| `/api/preferences` | `src/routes/preferences.js` | SQLite (table `user_preferences`) | ✅ |
| `/api/assistant` | `src/routes/assistant.js` | SQLite (`assistant_conversations` + `assistant_messages`) + Anthropic SSE | ⚠ disponible si `ANTHROPIC_API_KEY` |

### Tables SQLite (20)

```
arbitrage_sessions     emails              schema_migrations
assistant_conversations  evening_sessions    settings
assistant_messages     events              task_events
big_rocks              groups              tasks
contacts               projects            user_preferences
contacts_projects      delegations         weekly_reviews
decisions              weeks
```

### Migrations appliquées (4)

1. `2026-04-25-init-schema.sql` — schéma initial S1
2. `2026-04-26-s4-assistant.sql` — assistant LLM + conversations
3. `2026-04-27-s6-preferences.sql` — table user_preferences (Settings)
4. **`2026-04-28-emails.sql`** — table emails (sync Outlook → SQLite) **[nouveau session courante]**

### Helpers JSON encore utilisés

| Fichier | Usage | Statut |
|---|---|---|
| `src/json-robust.js` | Helper utilitaire (read/write atomique) | ✅ Légitime — utilisé par scripts de sync Outlook (produisent JSON intermédiaire) |
| `src/emails-context.js` | `loadEmails()` legacy | ⚠ Plus utilisé par les routes réelles (route `analyze-emails` lit la table SQL) — **à archiver** |

### Scripts de sync / bootstrap

| Script | Rôle | Statut |
|---|---|---|
| `scripts/sync-outlook.ps1` | Wrapper fetch + normalize | ✅ |
| `scripts/fetch-outlook.ps1` | COM Outlook → `data/emails-raw.json` | ✅ (emails uniquement, **pas events** — gap) |
| `scripts/normalize-emails.js` | JSON → JSON propre **+ ingestion SQLite** | ✅ **[nouveau]** |
| `scripts/ingest-emails.js` | Rattrapage standalone | ✅ **[nouveau]** |
| `scripts/bootstrap-from-emails.js` | Auto-création projets + contacts depuis emails | ✅ **[nouveau]** |
| `scripts/init-db.js` | Migrations | ✅ |

**Conclusion §1** : backend 100 % SQLite. Le helper `emails-context.js` peut être archivé (sera fait en S6.5 ou v0.7).

---

## §2 — État frontend (17 pages /v06/)

| Page | Bind | Statut câblage | Données réelles | Démos statiques |
|---|---|---|---|---|
| `/v06/` (cockpit) | `bind-cockpit.js` | ✅ Complet | KPIs (decisions/projects/contacts), Cap stratégique (ratio + dot-chart 7j), Top3 tasks, projects-houses | Coaching KPI = `—` (preview v0.8) |
| `/v06/arbitrage.html` | `bind-arbitrage-(queue/focus/board).js` | ✅ Complet | File emails (POST `/analyze-emails`), focus mode (decisions DB), board mode (drag-drop SQL persist) | Coaching banner + sidebar contexte + "Si vous tranchez A" + footer journal **masqués CSS** |
| `/v06/projets.html` | `bind-projets.js` v4 | ✅ Complet | 13 projets + auto-status alerte/sain (heuristique volume emails) + summary header | Empty maison si tous orphelins |
| `/v06/equipe.html` | `bind-equipe.js` v4 | ✅ Complet | 77 contacts (avatars uniformes gris, recence, volume mails) | — |
| `/v06/decisions.html` | `bind-decisions.js` v4 | ✅ Complet | Liste + tri (ouvertes en 1er) + summary (X à trancher / Y tranchées) | Stats top hardcodées écrasées |
| `/v06/taches.html` | `bind-taches.js` v5 | ✅ Complet | Tasks par bucket temporel + chips filtres (groupes dynamiques) + tri + toggle done + bouton "Nouvelle action" | Counts chips réels |
| `/v06/revues.html` | `bind-revues.js` v4 | ✅ Partiel | Liste + CTA "Démarrer la revue" | Big rocks au draft |
| `/v06/agenda.html` | `bind-agenda.js` | ⚠ Partiel | Lecture `/api/events` mais **events Outlook pas sync** | Démo statique cachée par clear-demo |
| `/v06/evening.html` | `bind-evening.js` | ✅ Complet | Rituel soirée (humeur/énergie/top3/streak) | — |
| `/v06/assistant.html` | `bind-assistant.js` | ⚠ Preview v0.7 | Banner ambre, chat SSE désactivé (besoin `ANTHROPIC_API_KEY`) | Threads démo masqués |
| `/v06/connaissance.html` | — | ⚠ Preview v0.7 | Banner ambre | Démo statique |
| `/v06/coaching.html` | — | ⚠ Preview v0.8 | Banner ambre | Démo statique |
| `/v06/onboarding.html` | `bind-onboarding.js` | ✅ Complet | Wizard 3 étapes (firstName, tenantName, première maison) → `/api/preferences` + `/api/groups` | — |
| `/v06/settings.html` | `bind-settings.js` | ✅ Complet | 8 onglets (Général/Langue/Maisons/Rituels/Coaching/Données/Apparence/Zone sensible) | Bouton Sync Outlook désactivé v0.7 |
| `/v06/projet.html` | `bind-projet.js` | ✅ Complet | Détail projet (params `?id=`) + KPIs + tasks + decisions liées | — |
| `/v06/aide.html` | — | ✅ Static | 7 sections PowerShell commandes | — |
| `/v06/hub.html` | — | ✅ Static | Navigation centrale | — |
| `/v06/components.html` | — | ✅ Static | Storybook 27 composants atomiques | — |

---

## §3 — Gap fonctionnel identifié

### Backend → frontend (manque côté UI)

| Fonctionnalité backend | UI manquante | Cible |
|---|---|---|
| `/api/assistant/messages` (4 routes SSE Anthropic) | Coaching banner arbitrage, "Si vous tranchez A", chat live | **v0.7** (besoin `ANTHROPIC_API_KEY`) |
| `/api/arbitrage/start` (LLM big rocks faire/déléguer/reporter) | Mode tableau actuel câble status DB mais ne propose plus de big rocks | **v0.7** |
| `/api/arbitrage/commit` | Bouton "Commit & terminer" sur board-mode | **v0.7** |
| `/api/system/sync-outlook` | Bouton manuel UI (existe mais désactivé) | **v0.7** |
| `/api/big-rocks` | Page revues affiche big rocks mais sans création UI | **v1.0** |

### Frontend → backend (manque côté API)

| Élément UI | API manquante | Cible |
|---|---|---|
| Filtre "later" du board arbitrage | Pas de status DB correspondant — stocké en sessionStorage | **v0.7** : ajouter `decisions.status='reportee'` |
| Avatars contacts depuis photos Outlook | Pas de champ `avatar_url` | **v1.0** |
| Maison rattachable à un projet auto | Pas d'API d'inférence projet→groupe | **v0.7** : algorithme matching + UI manuelle |
| Liens emails → projets/contacts | Table `emails` n'a pas de FK vers projects/contacts | **v0.7** : ajouter FK + UI lien |
| Feed événements Outlook | `fetch-outlook.ps1` ne lit pas le calendrier | **v0.7** : `fetch-outlook-events.ps1` |

### Auto-suggestions aiCEO (rule-based vs LLM)

| Surface | Source actuelle | Cible LLM v0.7 |
|---|---|---|
| KPIs cockpit | Counts SQL | (idem) |
| Cap stratégique 72% | (done+tranchee)/total | (idem) |
| Status projet alerte/sain | Volume emails 30j + récence | LLM avec contexte |
| Scoring file arbitrage | flagged*100 + unread*30 + recency | LLM ranking par enjeux |
| Coaching banner | masqué v0.6 | LLM + posture history |
| "Si vous tranchez A" | masqué v0.6 | LLM + projets impactés |
| Auto-draft revue hebdo | masqué | `/auto-draft-review` LLM |
| Decision recommend | masqué | `/decision-recommend` LLM |

---

## §4 — Synthèse

✅ **Backend** : migration JSON → SQLite **complète**. 14 routes, 20 tables, 4 migrations.

✅ **Frontend** : **13/17 pages** câblées API (76 %). 3 pages preview annoncées v0.7/v0.8 (Assistant, Connaissance, Coaching). 1 page semi-câblée (Agenda — manque sync events Outlook).

⚠ **LLM Anthropic** : 4 routes SSE prêtes côté serveur mais non branchées en UI v0.6 (volonté délibérée — clé API à valider en prod).

⚠ **Sync Outlook** : emails OK (1052 ingérés), events manquant (script à écrire v0.7).

📋 **Décisions à venir v0.7** :
- Câbler LLM (4 surfaces : coaching, decision-recommend, auto-draft-review, "si vous tranchez")
- Ajouter `fetch-outlook-events.ps1` + ingestion table `events`
- Ajouter status `reportee` aux decisions (pour board kanban col "Reporté")
- FK emails → projects + UI de rattachement
- Workflow "Big Rocks" via `/api/arbitrage/start`

---

**Source canonique** : `04_docs/CR-GAP-v06-cablage.md` (ce fichier).  
**Pour aller plus loin** : voir `04_docs/_release-notes/v0.6-s6.4-cablage.md` (synthèse session) et `04_docs/11-roadmap-map.html` (roadmap interactive).
