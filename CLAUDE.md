# CLAUDE.md — Point d'entrée projet aiCEO pour agent Claude

> **Lis ce fichier en premier** quand tu démarres une nouvelle session sur ce projet. Il consolide le contexte, les conventions, les pièges connus et les workflows types pour t'éviter de tout redécouvrir.

**Version** : 28/04/2026 PM (post-S6.4 — câblage v0.6 réel sur SQLite + sync Outlook emails)
**À jour à chaque clôture de sprint** ou décision structurante (cf. § 8 Maintenance).

---

## §1 — Vue d'ensemble (30 secondes)

**aiCEO** = copilote IA exécutif local pour CEO. Cockpit + arbitrage matin + bilan soir + revue hebdo + assistant chat live (Claude streaming SSE) + portefeuille (groupes/projets/contacts/décisions). 100 % local, SQLite mono-instance, zéro cloud applicatif. Intégrations : Outlook (sync 2h via schtasks), Anthropic Claude API, GitHub.

**Trajectoire (ROADMAP v3.2)** : v0.4 (app statique) → v0.5 (internalisée fonctionnelle ✅) → **v0.6 (Interface finalisée selon bundle Claude Design v3.1, ~8 k€ binôme, ~2-3 sem)** → V1 (SaaS + équipes + mobile, ~46 k€ binôme/6 mois) → V2 (commercial intl + i18n + SOC 2, 800 k€) → V3 (coach + offline + multi-CEO, 600 k€).

**Statut au 28/04/2026 (PM)** :
- **v0.5 internalisée TERMINÉE** : 5 sprints livrés. Tag `v0.5` posé. **110 k€ engagés / 97,4 k€ dépensés (88,5%) / 12,6 k€ provision V1**.
- **v0.6 Phase A (DS Claude Design)** : maquette 17 écrans déployée dans `03_mvp/public/v06/`. Pages v0.5 historiques toujours présentes.
- **v0.6 Phase B — Câblage réel (S6.4 LIVRÉ 28/04 PM)** :
  - **Backend 100% SQLite** : 14 routes API REST, 20 tables, 4 migrations (init + s4-assistant + s6-preferences + **2026-04-28-emails**).
  - **Sync Outlook → SQLite** : table `emails` (id Outlook PK + 14 colonnes), `scripts/normalize-emails.js` patché (ingestion DB + JSON rétro-compat), `scripts/ingest-emails.js` (rattrapage standalone). 1052 emails ingérés en DB.
  - **Bootstrap auto** : `scripts/bootstrap-from-emails.js` crée 13 projets (depuis `inferred_project` distincts) + 77 contacts (top expéditeurs ≥3 emails). Idempotent. Endpoint `POST /api/arbitrage/bootstrap-from-emails` exposé.
  - **Route `POST /api/arbitrage/analyze-emails`** réécrite SQL : scoring `flagged*100 + unread*30 + has_attach*5 + recence_bonus`, top 8 propositions.
  - **13/17 pages frontend câblées sur API** : cockpit (KPIs + Cap stratégique + dot-chart 7j + projects-houses + Top3), arbitrage (file emails + focus + board kanban drag-drop SQL), projets (auto-status alerte/à-surveiller/sain heuristique), équipe (avatars uniformes + recence), décisions (liste + tri + summary), tâches (buckets temporels + chips filtres dynamiques + tri + toggle done), revues (CTA "Démarrer la revue"), evening, settings, onboarding, projet, hub, components.
  - **3 pages preview annoncées** : assistant.html (v0.7), connaissance.html (v0.7), coaching.html (v0.8) — banners ambres, démo masquée.
  - **Auto-suggestions aiCEO rule-based** : projet status (volume emails 30j + récence), arbitrage scoring SQL, KPIs cockpit. **LLM Anthropic disponible côté serveur (4 routes SSE) mais non branché en UI v0.6** — décision délibérée : nécessite validation `ANTHROPIC_API_KEY` en prod.
- **Tags Git** : `v0.5` (final v0.5), `v0.6-s6.1` (DS atomic archivé). À poser : `v0.6-s6.4` post-recette.

**Prochaine étape** : recette CEO + ExCom → GO câblage v0.7 LLM (coaching + auto-draft + decision-recommend) + sync events Outlook + tag `v0.6-s6.4`.

---

## §2 — Contexte humain (la « méthode binôme »)

- **Owner** : Major Fey (CEO, mail `feycoil@etic-services.net`), poste Windows 11 + Outlook Desktop + Edge
- **Binôme** : CEO + agent Claude (toi). Le CEO a la vision + tranche, Claude code + documente + propose
- **Méthode** : « kickoff léger + exécution intégrée + finalisation immédiate » → un sprint entier livré en 3-9 h chrono (vs 13 semaines BASELINE = ~520 h ETP, **gain ×30**)
- **Vélocité prouvée** : 5 sprints livrés en avance de ~150 j cumulés vs plan original (planifié 13/06 → 30/06, livré 25-26/04)
- **Workflow type sprint** :
  1. Cadrage rapide (DOSSIER-SPRINT-SX.md, ~7 sections, 8 issues détaillées, 5 risques, budget)
  2. Kickoff (POA xlsx 6 feuilles + KICKOFF pptx 12 slides, **optionnels en mode accéléré**)
  3. Script `gh-create-issues-sX.ps1` UTF-8 BOM
  4. Patch DECISIONS.md (ADR cadrage)
  5. Patch 11-roadmap-map.html (sprint status, gate-pills, JOURNAL)
  6. Exécution issues SX.00 → SX.NN dans la foulée
  7. Finalisation (ADR livré + release-notes/vX.Y-sZ.md + JOURNAL livraison + tag + Release)
  8. Audit consistence GitHub ↔ roadmap (`consistence-dump.ps1` + `fix-consistence.ps1`)

---

## §3 — Architecture livrée (v0.5)

### Backend (`03_mvp/`)
- Express + **node:sqlite** (Node 24, pas better-sqlite3 cf. ADR S1.13)
- **14 routers REST CRUD** (`/api/{tasks,decisions,contacts,projects,groups,events,cockpit,arbitrage,evening,weekly-reviews,big-rocks,system,preferences,assistant}`)
- 4 routes assistant streaming SSE via `messages.stream` Anthropic SDK
- SSE bus EventEmitter + `GET /api/cockpit/stream` (S3.05)
- **20 tables SQLite** : tasks, decisions, contacts, projects, groups, events, **emails** (S6.4 nouveau), arbitrage_sessions, evening_sessions, weekly_reviews, weeks, big_rocks, task_events, contacts_projects, delegations, settings, user_preferences, assistant_conversations, assistant_messages, schema_migrations
- **4 migrations** appliquées : `2026-04-25-init-schema.sql` + `2026-04-26-s4-assistant.sql` + `2026-04-27-s6-preferences.sql` + **`2026-04-28-emails.sql` (S6.4)**
- Mode démo automatique sans `ANTHROPIC_API_KEY` (LLM routes répondent stub)
- Isolation tests via env `AICEO_DB_OVERRIDE=/path/to/test.db`
- Port défaut **4747** (pas 3001 — historique S2.00 mais wrapper Variante D utilise 4747)
- **Endpoints S6.4 ajoutés** :
  - `POST /api/arbitrage/analyze-emails` → scoring SQL emails non lus/flagged/récents (top 8 propositions)
  - `POST /api/arbitrage/bootstrap-from-emails` → auto-création projets (depuis `inferred_project` distincts) + contacts (expéditeurs ≥3 emails). Idempotent.

### Frontend Claude Design v0.6 (17 pages, `03_mvp/public/v06/`) — **CIBLE OFFICIELLE + CÂBLÉE S6.4**

| Page | URL | Bind | Statut S6.4 |
|---|---|---|---|
| Hub | `/v06/hub.html` | — | Static (navigation centrale) |
| Cockpit | `/v06/index.html` | `bind-cockpit.js` | ✅ KPIs + Cap stratégique + dot-chart 7j + projects-houses + Top3 (real API) |
| Arbitrage | `/v06/arbitrage.html` | `bind-arbitrage(-queue/-focus/-board).js` | ✅ File emails (POST `/analyze-emails`) + focus mode (decisions DB) + board mode (drag-drop SQL persist via `PATCH /api/decisions/:id`) |
| Projets | `/v06/projets.html` | `bind-projets.js` v4 | ✅ 13 projets + auto-status alerte/à-surveiller/sain (heuristique volume emails 30j) + summary header |
| Équipe | `/v06/equipe.html` | `bind-equipe.js` v4 | ✅ 77 contacts + avatars uniformes gris + recence + volume mails |
| Décisions | `/v06/decisions.html` | `bind-decisions.js` v4 | ✅ Liste + tri (ouvertes 1er) + summary "X à trancher · Y tranchées · Z gelées" |
| Actions | `/v06/taches.html` | `bind-taches.js` v5 | ✅ Buckets temporels + chips filtres (groupes dynamiques fetch `/api/groups`) + tri + toggle done + bouton "Nouvelle action" |
| Revues | `/v06/revues.html` | `bind-revues.js` v4 | ✅ Liste + CTA "Démarrer la revue de la semaine" (POST `/api/weekly-reviews`) |
| Agenda | `/v06/agenda.html` | `bind-agenda.js` | ⚠ Lit `/api/events` mais sync events Outlook **manquante** — feature **v0.7** |
| Soirée | `/v06/evening.html` | `bind-evening.js` | ✅ Rituel humeur/énergie/top3/streak |
| Onboarding | `/v06/onboarding.html` | `bind-onboarding.js` | ✅ Wizard 3 étapes (firstName, tenantName, première maison) |
| Settings | `/v06/settings.html` | `bind-settings.js` | ✅ 8 onglets (Général/Langue/Maisons/Rituels/Coaching/Données/Apparence/Zone sensible). Bouton sync Outlook désactivé v0.7. |
| Projet | `/v06/projet.html` | `bind-projet.js` | ✅ Détail projet (param `?id=`) + KPIs + tasks + décisions liées |
| Aide | `/v06/aide.html` | — | Static (7 sections PowerShell commandes) |
| Components | `/v06/components.html` | — | Static (Storybook 27 atomes) |
| Assistant | `/v06/assistant.html` | `bind-assistant.js` | ⚠ **Preview v0.7** (banner ambre, chat SSE désactivé sans `ANTHROPIC_API_KEY`) |
| Connaissance | `/v06/connaissance.html` | — | ⚠ **Preview v0.7** (banner ambre) |
| Coaching | `/v06/coaching.html` | — | ⚠ **Preview v0.8** (banner ambre) |

DS partagé : `/v06/_shared/colors_and_type.css` + `/v06/_shared/app.css` + `/v06/_shared/tweaks.css` (1700+ lignes, 5 blocs UX 28/04) + `/v06/_shared/theme.js` (avec globals `aiceoArbStart/ManualPicker/ArbAccept/ArbIgnore/ArbToggleQueue` + Toggle file). 19 bind-*.js + sprite icônes. PWA : `/v06/manifest.webmanifest` + `/v06/sw.js`.

**Cache busting** : `?v=92` (449 occurrences sur 18 fichiers HTML — bumpé à chaque release JS/CSS).

### Scripts S6.4 nouveaux

- `scripts/normalize-emails.js` — patché : produit JSON `data/emails.json` + ingère table SQLite `emails` (idempotent INSERT OR REPLACE)
- `scripts/ingest-emails.js` — rattrapage standalone : ingère `data/emails.json` existant en DB sans relancer Outlook
- `scripts/bootstrap-from-emails.js` — auto-création projets distincts + contacts récurrents depuis emails ingérés. Idempotent.

### Frontend S6.1 atomic ARCHIVÉ (`03_mvp/public/_shared-atomic/`)

Archive de référence pour V2/V3 (DS BEM strict + ITCSS 7 couches + 27 composants). Storybook accessible sur `/components-atomic.html`. Ne sera pas branché en v0.6 mais code valide réutilisable plus tard.

### Frontend v0.5 historique (12 pages, `03_mvp/public/`) — inchangé
| Page | Sprint | Particularité |
|---|---|---|
| `/` cockpit | S2 | 5 cards intention + big rocks + tâches + décisions + alertes |
| `/arbitrage` | S2 | 3 colonnes drag-drop natif HTML5 |
| `/evening` | S2 | humeur + énergie + top3 + streak |
| `/taches` | S2 | Eisenhower 2×2 + inbox + quick-add |
| `/agenda` | S3 | grille hebdo lun-dim drag-drop tâche → date |
| `/revues` | S3 | Big Rocks max 3 + auto-draft Claude |
| `/groupes` | S4 | portefeuille drill-down drawer |
| `/projets` | S4 | liste cross-groupe + filtres + recherche |
| `/projet?id=xxx` | S4 | template paramétré (5 KPIs + tâches + décisions) |
| `/contacts` | S4 | cards avatar + recherche + filtres trust |
| `/decisions` | S4 | registre + transitions + IA recommend (réutilise `/api/assistant/messages`) |
| `/assistant` | S4 | chat live SSE chunk-par-chunk + sidebar conversations |

**ADR fondatrice S2.00** : **zéro localStorage applicatif**. Front lit/écrit toujours via REST. SQLite serveur = source de vérité unique. Seules tolérées : préférences UI volatiles dans clé réservée `aiCEO.uiPrefs`.

### Tests
- **~91 tests verts en sandbox Linux** : 84 unit/intégration (`npm test` natif `node:test`) + 7 smoke HTTP (`pages.test.js`)
- **~103 tests verts cumulés Windows** : +~12 E2E Playwright (`tests-e2e/`, P1 matin, P2 soir, P3 hebdo, P4 portefeuille, P5 assistant streaming, P6 install smoke 12 pages)
- Critère minimal recette CEO S4 = 84 verts (cf. RECETTE-CEO-v0.5-s4.md). Plage cible : ≥ 91 sandbox / ≥ 103 Windows.
- E2E Playwright **Windows uniquement** (Chromium infaisable sur sandbox Linux)

### Infrastructure Windows
- **Variante D Startup folder** (ADR S3.10) : `aiCEO-Server.lnk` lance le serveur au logon (sans admin requis)
- **Raccourci Bureau** : `Cockpit aiCEO.lnk` ouvre le navigateur sur cockpit
- **Sync Outlook** : schtasks `aiCEO-Outlook-Sync` toutes les 2h
- **Rotation logs KISS** : 2 Mo / 3 archives via wrapper PowerShell (S4.09 — winston reporté V1.6)

---

## §4 — Paths à connaître

### Repo Windows (source de vérité)
- `C:\_workarea_local\aiCEO\` — racine repo (**hors OneDrive depuis 26/04 PM**, cf. ADR « Projet hors OneDrive »)
- `C:\_workarea_local\aiCEO\03_mvp\` — backend + frontend
- `C:\_workarea_local\aiCEO\04_docs\` — docs
- `C:\_workarea_local\aiCEO\00_BOUSSOLE\` — DECISIONS.md (ADRs)

### Mount Linux sandbox (pour toi, agent Claude)
- `/sessions/<session-id>/mnt/aiCEO/` — équivalent du Windows path

### GitHub
- `feycoil/aiCEO` — repo principal (privé)
- 5 milestones v0.5 (s1, s2, s3, s4, s5) — tous fermés
- 5 tags + 5 releases publiées

---

## §5 — Pièges techniques connus (++ que tu vas re-rencontrer)

| Symptôme | Cause | Fix |
|---|---|---|
| **NUL bytes en fin de fichier** (`^@^@^@^@`) après save tools | Bug OneDrive sync (résolu 26/04 PM par déplacement repo hors OneDrive) — peut réapparaître si remis sous OneDrive | `python3 strip-nul.py` (template ci-dessous) |
| **CRLF parasites** ~22 fichiers `git status` après clone | Conversion auto LF→CRLF Windows | `git checkout -- 03_mvp/src/* 03_mvp/tests/*.test.js` (sauf nouveaux fichiers) |
| **Edit/Write tool tronque** des fichiers à mi-chemin | Mount Windows fragile sur certains fichiers (server.js, assistant.html) | Toujours utiliser **Python atomic write** pour fichiers > 100 lignes ou critiques |
| `EBUSY: resource busy aiceo.db` sur `npm run db:reset` | 2+ process node simultanés (souvent serveur fantôme du wrapper Variante D + nouveau npm start) | `Get-NetTCPConnection -LocalPort 4747 \| Stop-Process -Force` avant db:reset |
| `EADDRINUSE :::4747` | Idem (wrapper logon a déjà démarré) | Idem fix |
| `disk I/O error errcode 4618` SQLite | Sandbox Linux ne supporte pas node:sqlite sur tous les paths | Tester côté Windows uniquement, ou path `/sessions/.../mnt/outputs/` |
| `gh issue create` échoue `label not found` | Labels GH manquants | `pwsh -File fix-labels.ps1` (idempotent) |
| `gh release create` echec `Release.tag_name already exists` | Release existe déjà (en draft ou public) | `pwsh -File fix-consistence-v2.ps1 -Apply` (publie drafts + crée manquantes) |
| Doublons d'issues sur GitHub | Script `gh-create-issues-sX.ps1` lancé 2× | `pwsh -File cleanup-issues.ps1 -Apply` (audit ciblé) |
| `git status` montre fichiers non modifiés comme "modifiés" | OneDrive (résolu) ou CRLF | `git checkout --` ciblé |
| Copier-coller en français change `xxx.md` en `[xxx.md](http://xxx.md)` | App du CEO transforme noms ressemblant URL | **Toujours générer un script .ps1** plutôt que demander de coller des commandes |
| Issues fermées par `gh-create-issues-sX.ps1` mais milestone open | Le commit `feat(sX)` n'a pas de `Closes #YYY` car les numéros sont créés APRÈS | Fermer manuellement avec `gh issue close --reason completed` puis fermer milestone |

### Template Python atomic write (anti-corruption mount Windows)

```python
import os
dst = "/sessions/.../mnt/aiCEO/path/to/file.ext"
with open(dst, "r", encoding="utf-8") as f:
    content = f.read()
# ... patches sur content ...
tmp = dst + ".tmp"
with open(tmp, "w", encoding="utf-8", newline="\n") as f:
    f.write(content); f.flush(); os.fsync(f.fileno())
os.replace(tmp, dst)
```

### Template strip-nul.py
```python
with open(f, "rb") as h: raw = h.read()
cleaned = raw.rstrip(b"\x00")
if not cleaned.endswith(b"\n"): cleaned += b"\n"
with open(f + ".tmp", "wb") as h: h.write(cleaned); h.flush(); os.fsync(h.fileno())
os.replace(f + ".tmp", f)
```

---

## §6 — Scripts PowerShell standards (à connaître)

À la racine du repo `C:\_workarea_local\aiCEO\` :

| Script | Rôle |
|---|---|
| `consistence-dump.ps1` | Dump GitHub state (tags, releases, milestones, issues) → `consistence-dump.json` |
| `fix-consistence.ps1` (et `-v2`) | Audit + corrections (publier releases drafts, fermer milestones, retirer milestone obsolète des issues) |
| `cleanup-issues.ps1` | Ferme doublons + issues livrées (32 issues nettoyées en S4) |
| `fix-labels.ps1` | Crée tous les labels GitHub manquants (idempotent) |
| `fix-s4.ps1`, `push-s4-all.ps1`, `push-s4-finalize.ps1` | Workflows S4 |
| `push-s5-all.ps1` | Workflow S5 (commit + push + create issues + tag v0.5 + Release) |

Dans `03_mvp/scripts/` :
- `init-db.js` (avec `--reset`)
- `migrate-from-appweb.js` + `check-migration.js`
- `smoke-all.ps1` (S5.02 — valide 12 pages + 4 routes assistant + /api/health enrichi)
- `service-windows/install-startup-shortcut.ps1` (Variante D)
- `service-windows/install-desktop-shortcut.ps1` (S4.08 raccourci Bureau)
- `service-windows/start-aiCEO-at-logon.ps1` (wrapper logon avec rotation logs S4.09)
- `sync-outlook.ps1` (chaîne fetch-outlook + normalize-emails)

---

## §7 — Where to look : pointers documentaires

Quand tu cherches…

| Tu cherches | Lis |
|---|---|
| Une décision passée (technique, méthode, livraison) | `00_BOUSSOLE/DECISIONS.md` (**22+ ADRs datés au 26/04 PM**, format léger : Statut + Contexte + Décision + Conséquences + Sources) |
| L'historique chronologique du projet | `04_docs/11-roadmap-map.html` onglet 4 « Journal & écarts » (JOURNAL[]) |
| L'état d'un sprint passé | `04_docs/_release-notes/v0.5-sX.md` ou `04_docs/DOSSIER-SPRINT-SX.md` |
| Comment installer sur un nouveau poste | `04_docs/INSTALL-WINDOWS.md` (9 sections, troubleshooting 8 cas) |
| Bundle design Claude Design (cible visuelle V1) | `04_docs/_design-v05-claude/` (16 ressources + prompt v3.1 + 7 ADR) |
| Cadrage features × version (v0.5/v0.6/V1/V2/V3) | `04_docs/_design-v05-claude/ressources-a-joindre/17-cadrage-livraison-par-version.md` |
| Roadmap interactive avec GitGraph + KPIs | `04_docs/11-roadmap-map.html` (onglet "Vue d'ensemble" par défaut) |
| ROADMAP officielle versionnée | `04_docs/08-roadmap.md` v3.2 (réalignement modèle binôme + insertion v0.6) |
| Comment onboarder un CEO pair | `04_docs/ONBOARDING-CEO-PAIR.md` (7 sections, apprentissages réels v0.5) |
| Comment passer la recette CEO post-install | `04_docs/RECETTE-CEO-v0.5-s4.md` (8 sections, 25 minutes, 6/6 critères pour GO) |
| Comment présenter à l'ExCom | `04_docs/RECETTE-EXCOM-v0.5.md` (scénario démo 30 min, Q&R 8 questions, décision GO V1) |
| Doc API curl examples | `04_docs/api/S4.md` (assistant + groupes + projets + contacts + décisions) |
| État GitHub vs roadmap | `consistence-dump.json` (généré par script) + comparaison roadmap-map.html |
| Pourquoi tel choix tech | DECISIONS.md (recherche par mot-clé) |

---

## §8 — Maintenance de ce CLAUDE.md

Mettre à jour ce fichier à chaque :
- Clôture de sprint (mise à jour § 1 statut + § 3 si nouvelles features)
- Décision structurante (référence dans § 5 si nouveau piège ou § 6 si nouveau script)
- Changement infrastructure (paths, ports, dépendances)

**À pousser systématiquement avec le commit de finalisation du sprint.**

---

## §9 — Pending / décisions en attente (au 26/04/2026)

- [ ] **Recette CEO Windows v0.5 complète** : passer `RECETTE-CEO-v0.5-s4.md` + nouveaux endpoints S5 (`/api/health` enrichi, `smoke-all.ps1`, tests E2E Playwright)
- [ ] **Recette ExCom v0.5** : suivre `RECETTE-EXCOM-v0.5.md` § 5 checklist 12 cases, répéter scénario démo seul en chrono < 16 minutes
- [ ] **ExCom 04/05 — 4 décisions à acter** :
  1. **GO v0.6** (~8 k€ absorbé provision V1, ~2-3 sem binôme, mai 2026)
  2. **GO V1 modèle binôme** (46 k€) post-v0.6
  3. **Réallocation 254 k€ option β** (anticipation V2 : marketing 80 + success/sales 40 + provision SOC 2 50 + trésorerie 85)
  4. **CEO pair suppléant Lamiae** pour résilience binôme V1
- [ ] **Si GO v0.6** : kickoff Sprint S6.1 (DS atomic 3 niveaux + 16 composants UI + drawer/header/footer + components gallery)
- [ ] **Si GO V1** : kickoff Sprint V1.1 post-v0.6 (multi-tenant Supabase + RLS + auth Microsoft Entra)
- [ ] **Prompt Claude Design v3.1** : posté quand opportun pour générer la maquette ~62 vues qui sert de cible visuelle v0.6 → V1

### Démarche bundle design Claude Design (post-v0.5, pré-v0.6)
- Dossier dédié : `04_docs/_design-v05-claude/`
- 16 ressources prêtes (image étalon Twisty + tokens DS + 14 docs spécialisés)
- Prompt unique v3.1 ~16 k chars (`PROMPT-FINAL.md`)
- 7 ADR de gouvernance (`decisions/00` à `07`) traçant arbitrages, audit roadmap, choix v0.6
- Modèle "vue dev" : annotations HTML `[target: v0.5/v0.6/V1/V2/V3]` pour guider l'équipe binôme
- Audit conformité ROADMAP v3.2 : la maquette est cible visuelle V1, implémentée en 2 paliers (v0.6 UI + V1 features fonctionnelles)

### Risques résiduels v0.5 (cf. ADR « v0.5 internalisée terminée »)
- **R1** — Backup auto SQLite manquant (S5.04 reporté V1.5). Mitigation : push Git après chaque session significative + snapshot manuel hebdo
- **R2** — Logs non structurés (S5.05 reporté V1.6). Pas de prod externe avant V1.6
- **R3** — Stockage local pur (depuis ADR « Projet hors OneDrive »). Bloquant pour équipes V1.2

### Risques résiduels modèle binôme V1
- **R4** — Dépendance unique à Feycoil. Mitigation : CEO pair suppléant Lamiae à former mois 1 V1
- **R5** — Pas de tests utilisateur externes pendant dev. Mitigation : onboarder 1er CEO pair francophone mi-V1 (mois 4-5)
- **R6** — Pas de pen-testing externe. Mitigation : audit prestataire en sortie V1 (~15 k€)
- **R7** — Biais auto-évaluation Claude designant lui-même. Mitigation : externalisation review au moins 1× par milestone

---

## §10 — Réflexes obligatoires pour l'agent Claude

1. **Toujours lire ce CLAUDE.md en premier** au début d'une session sur ce projet
2. **Ne jamais demander au CEO de copier-coller des commandes en français** avec des fichiers `.md` (l'app transforme en lien markdown, casse PowerShell). Toujours générer un script `.ps1` à lancer
3. **Pour patcher des fichiers > 100 lignes ou critiques** (server.js, DECISIONS.md, roadmap-map.html), utiliser **Python atomic write** plutôt que Edit/Write directs
4. **Préfixer les noms de scripts générés** avec `fix-`, `push-`, `cleanup-`, `consistence-` pour cohérence
5. **Toujours lancer `node --check`** après modification d'un fichier `.js`
6. **Toujours tuer les serveurs fantômes** (`Get-NetTCPConnection -LocalPort 4747 \| Stop-Process -Force`) avant `npm test` ou `npm run db:reset`
7. **Mettre à jour ce CLAUDE.md** quand tu apprends un nouveau piège ou changes une convention
8. **À la fin d'une session significative**, proposer un commit + push pour ne rien perdre (le projet n'a pas de backup auto pré-V1.5)

---

## §11 — Sources de vérité par domaine (canonical)

Pour éviter les divergences entre docs, voici la **source unique** par information :

| Information | Source canonique | Évite désynchro avec |
|---|---|---|
| Budget v0.5 (110 k€ engagés, 97,4 k€ dépensés, 12,6 k€ provision V1) | `04_docs/_release-notes/v0.5.md` | CLAUDE.md §1, DOSSIER-SPRINT-S5.md, 08-roadmap.md |
| Nombre tests verts (91 sandbox / 103 Windows) | `04_docs/_release-notes/v0.5.md` | CLAUDE.md §3, RECETTE-CEO-v0.5-s4.md (critère minimal 84) |
| Liste 12 pages frontend v0.5 | `04_docs/_release-notes/v0.5.md` (table architecture) | CLAUDE.md §3 (table v0.5) |
| Liste 7 pages frontend v0.6 | CLAUDE.md §3 (cible officielle Claude Design depuis 26/04 PM) | DOSSIER-V06.md (à venir S6.2) |
| Liste 70 routes API (par router) | `04_docs/api/INDEX.md` (à créer Q5) | `03_mvp/server.js` + `src/routes/*.js` |
| Décisions architecture / méthode / livraisons | `00_BOUSSOLE/DECISIONS.md` (22+ ADRs datés) | CLAUDE.md, release-notes, JOURNAL roadmap |
| État chronologique projet | `04_docs/11-roadmap-map.html` JOURNAL[] | DECISIONS.md (livraisons), CLAUDE.md §1 (statut) |
| Statut sprint courant | `04_docs/11-roadmap-map.html` Sprint entries | CLAUDE.md §1 (Statut au), gate-pills onglet 2 |
| Tags Git posés | `git tag --list 'v0.5*'` (5 tags : v0.5-s1, s2, s3, s4, v0.5) | RELEASES rn-mvp-* dans roadmap-map.html |
| Trajectoire ROADMAP v3.2 (v0.4 → v0.5 → v0.6 → V1 → V2 → V3) | `00_BOUSSOLE/ROADMAP.md` + `04_docs/08-roadmap.md` | CLAUDE.md §1, DECISIONS.md (ADR Insertion v0.6) |

**Règle d'or** : si tu observes une divergence chiffre/fait entre docs, la source canonique ci-dessus tranche. Mettre à jour les autres docs en cascade et lancer `consistence-dump.ps1` pour vérifier.

---

**Source de vérité de ce fichier** : `C:\_workarea_local\aiCEO\CLAUDE.md` (commit dans Git, donc pérenne)
