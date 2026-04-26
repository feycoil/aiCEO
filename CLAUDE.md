# CLAUDE.md — Point d'entrée projet aiCEO pour agent Claude

> **Lis ce fichier en premier** quand tu démarres une nouvelle session sur ce projet. Il consolide le contexte, les conventions, les pièges connus et les workflows types pour t'éviter de tout redécouvrir.

**Version** : 26/04/2026 (post v0.5 livrée)
**À jour à chaque clôture de sprint** ou décision structurante (cf. § 8 Maintenance).

---

## §1 — Vue d'ensemble (30 secondes)

**aiCEO** = copilote IA exécutif local pour CEO. Cockpit + arbitrage matin + bilan soir + revue hebdo + assistant chat live (Claude streaming SSE) + portefeuille (groupes/projets/contacts/décisions). 100 % local, SQLite mono-instance, zéro cloud applicatif. Intégrations : Outlook (sync 2h via schtasks), Anthropic Claude API, GitHub.

**Trajectoire** : v0.4 (app statique) → v0.5 (internalisée fonctionnelle) → V1 (multi-tenant + équipes + intégrations + mobile, ~300 k€).

**Statut au 26/04/2026** : **v0.5 internalisée TERMINÉE**. 5 sprints livrés (S1+S2+S3+S4+S5) en ~16 h chrono cumulées dogfood par binôme CEO + Claude. 110 k€ / 110 k€ = 100% budget consommé. Tag `v0.5` posé, GitHub Release publiée.

**Prochaine étape** : recette ExCom puis décision GO V1.

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
- 11 routers REST CRUD (`/api/{tasks,decisions,contacts,projects,groups,events,cockpit,arbitrage,evening,weekly-reviews,big-rocks,system,assistant}`)
- 4 routes assistant streaming SSE via `messages.stream` Anthropic SDK
- SSE bus EventEmitter + `GET /api/cockpit/stream` (S3.05)
- Migrations versionnées (`data/migrations/*.sql` + tracking `schema_migrations` table)
- Mode démo automatique sans `ANTHROPIC_API_KEY`
- Isolation tests via env `AICEO_DB_OVERRIDE=/path/to/test.db`
- Port défaut **4747** (pas 3001 — historique S2.00 mais wrapper Variante D utilise 4747)

### Frontend (12 pages, `03_mvp/public/`)
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
- **~95 verts** : 78 unit/intégration (`npm test` natif `node:test`) + 7 smoke HTTP `pages.test.js` + ~12 E2E Playwright (`tests-e2e/`)
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
| Une décision passée (technique, méthode, livraison) | `00_BOUSSOLE/DECISIONS.md` (31 ADRs, format léger : Statut + Contexte + Décision + Conséquences + Sources) |
| L'historique chronologique du projet | `04_docs/11-roadmap-map.html` onglet 4 « Journal & écarts » (JOURNAL[]) |
| L'état d'un sprint passé | `04_docs/_release-notes/v0.5-sX.md` ou `04_docs/DOSSIER-SPRINT-SX.md` |
| Comment installer sur un nouveau poste | `04_docs/INSTALL-WINDOWS.md` (9 sections, troubleshooting 8 cas) |
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
- [ ] **ExCom décision GO V1** : présenter, décider entre 3 options (recommandation Option A : multi-tenant + équipes + intégrations + mobile + backup auto + logs winston, ordre de grandeur 300 k€ sur 6 mois)
- [ ] **Si GO V1** : kickoff Sprint V1.1 (multi-tenant Supabase + RLS + auth Microsoft Entra)

### Risques résiduels v0.5 (cf. ADR « v0.5 internalisée terminée »)
- **R1** — Backup auto SQLite manquant (S5.04 reporté V1.5). Mitigation : push Git après chaque session significative + snapshot manuel hebdo
- **R2** — Logs non structurés (S5.05 reporté V1.6). Pas de prod externe avant V1.6
- **R3** — Stockage local pur (depuis ADR « Projet hors OneDrive »). Bloquant pour équipes V1.2

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

**Source de vérité de ce fichier** : `C:\_workarea_local\aiCEO\CLAUDE.md` (commit dans Git, donc pérenne)
