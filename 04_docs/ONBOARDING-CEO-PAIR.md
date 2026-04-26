# ONBOARDING-CEO-PAIR — Installer aiCEO chez un CEO pair

**Version** : v0.5 (révisée S5.07 avec apprentissages réels post-livraison)
**Cible** : CEO d'une autre entité du groupe ETIC ou réseau, qui veut tester aiCEO sur son propre poste
**Durée** : 1 journée (90 min installation + 1/2 journée prise en main + 1 journée pour s'approprier rituels)
**Pré-requis humain** : 1 CEO motivé, 1 binôme tech (peut être le pair même CEO si à l'aise PowerShell + Git)

---

## §0 — Avant de commencer

### Profil CEO cible
- Direction d'une entité 30-200 personnes
- Rituels de pilotage déjà en place (matin / soir / hebdo) ou désir de les structurer
- Outlook Desktop comme outil principal mail + agenda
- Tolère 30 min d'install + 1 semaine d'apprentissage rituels
- Veut **garder le contrôle** sur ses données (SQLite local, pas de cloud applicatif)

### Profil non cible
- CEO 100% mobile (l'app mobile est V1.4, pas v0.5)
- Org > 500 personnes nécessitant équipes et délégation pro (V1.2)
- DSI exigeant SSO Microsoft Entra immédiat (V1.1)

### Ce que vous obtiendrez
- Cockpit web local, accessible depuis le navigateur (`http://localhost:4747/`)
- Sync Outlook automatique toutes les 2h (mails + calendrier)
- Arbitrage matinal IA-assisté (top 3 + délégation + report)
- Bilan du soir avec streak humeur/énergie
- Revues hebdo avec auto-draft Claude
- Assistant chat live SQLite-aware (Claude voit votre base)
- Portefeuille (groupes / projets / contacts / décisions)

### Ce que vous n'obtiendrez PAS en v0.5
- App mobile (V1.4)
- Multi-utilisateur (V1.1)
- Intégration Teams / Slack / Notion (V1.3)
- Backup automatique (V1.5 — à scripter manuellement en attendant)

---

## §1 — Installation poste Windows (90 minutes)

### 1.1 Pré-requis logiciels

```powershell
node --version          # v24.x requis (pour node:sqlite natif)
git --version           # 2.40+
gh --version            # 2.x ; puis gh auth login
$PSVersionTable.PSVersion  # 5.1 OK, 7.x recommandé (pwsh)
```

Si `node` < 24 : installer depuis https://nodejs.org/ (LTS).
Si `gh` absent : installer depuis https://cli.github.com/.

### 1.2 Cloner + installer

```powershell
# Demander au CEO source (Major Fey) un accès au repo prive feycoil/aiCEO
# Puis cloner dans C:\_workarea_local\aiCEO (chemin attendu par les scripts)
git clone https://github.com/feycoil/aiCEO.git C:\_workarea_local\aiCEO
cd C:\_workarea_local\aiCEO\03_mvp
npm install
npm run db:reset
```

### 1.3 Configurer .env

Créer `C:\_workarea_local\aiCEO\03_mvp\.env` :

```
ANTHROPIC_API_KEY=sk-ant-...    # demander a Anthropic ou utiliser cle pair
ANTHROPIC_MODEL=claude-sonnet-4-6
PORT=4747
DEMO_MODE=0
```

Si pas de clé Anthropic disponible : laisser `ANTHROPIC_API_KEY` vide. Le mode démo automatique fournira des réponses factices, le cockpit reste fonctionnel pour évaluer l'UX.

### 1.4 Test démarrage manuel

```powershell
npm start
```

Doit afficher dans le terminal :
```
--------------------------------------
  aiCEO v0.5 - copilote executif
  -> http://localhost:4747          (matin - arbitrage)
  -> mode : REEL - claude-sonnet-4-6
--------------------------------------
```

Ouvrir `http://localhost:4747/` dans Edge/Chrome → cockpit doit s'afficher (vide = normal au premier lancement).

`Ctrl+C` pour stopper.

### 1.5 Tests automatiques

```powershell
npm test
```

Attendu : ≥ **85 tests verts** en < 5 secondes. Si rouge, STOP, contacter l'équipe support.

### 1.6 Autostart Windows (Variante D Startup folder)

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-startup-shortcut.ps1 install
```

Au prochain logon Windows, le serveur démarre automatiquement (fenêtre minimisée).

### 1.7 Raccourci Bureau "Cockpit aiCEO"

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-desktop-shortcut.ps1 install
```

Une icône "Cockpit aiCEO" apparaît sur le Bureau, double-clic → ouvre le cockpit dans le navigateur par défaut.

### 1.8 Sync Outlook automatique (terminal admin requis 1 fois)

```powershell
schtasks /create `
  /sc HOURLY /mo 2 `
  /tn "aiCEO-Outlook-Sync" `
  /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\_workarea_local\aiCEO\03_mvp\scripts\sync-outlook.ps1" `
  /ru "$env:USERNAME" `
  /rl HIGHEST `
  /f
```

Lancer une fois manuellement pour le 1er fetch :
```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\sync-outlook.ps1
```

Vérifier `data/sync-outlook.log` : doit contenir une ligne `=== sync-outlook OK ===` récente.

### 1.9 Smoke test final

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\smoke-all.ps1
```

Attendu : `RESUME PASS: 25 FAIL: 0` (12 pages + 4 routes assistant + 9 routes API critiques + /api/health enrichi).

Si quelques fails non bloquants (ex: page projet sans `?id=`) → tolérer.

---

## §2 — Recette CEO post-install (suivre `RECETTE-CEO-v0.5-s4.md`)

8 sections, 25 minutes. Cocher 6/6 critères verts pour valider l'installation. Reproduire les Tests critiques :
- Streaming SSE assistant (mots arrivent un par un)
- IA recommend décisions (Claude propose actions concrètes)
- Drag-drop tâche dans agenda hebdo
- Big Rocks max 3 contrainte HTTP 400
- Alerte Outlook stale si > 4h sans sync

---

## §3 — Prise en main rituels (1 semaine)

### Jour 1 — Matin
1. Ouvrir Cockpit (raccourci Bureau)
2. Aller `/arbitrage` → drag-drop des 3 plus importantes vers "Faire"
3. Drag les "à déléguer" → modal brouillon mail apparaît, valider/éditer
4. Drag les "à reporter" → choisir nouvelle date

### Jour 1 — Soir
1. Aller `/evening`
2. Saisir bilan (3 lignes), humeur (bien/moyen/mauvais), énergie (1-5)
3. Top 3 demain (souvent = report d'aujourd'hui non fait + nouveaux engagements)
4. Streak commence

### Jour 5 — Hebdo (vendredi soir ou samedi matin)
1. Aller `/revues`
2. Saisir 3 Big Rocks pour la semaine suivante
3. Cliquer "Demander brouillon Claude" → revue auto-générée à éditer

### Tous les jours — Assistant
- Question type : "Quelles décisions sont en attente d'exécution depuis plus de 5 jours ?"
- Question type : "Quel projet a le plus de tâches en retard ?"
- Question type : "Rédige-moi un mail de relance à <contact> sur <projet>"

---

## §4 — Apprentissages réels v0.5 (NEW)

Issues fréquentes rencontrées par le CEO original durant la phase dogfood :

| Symptôme | Cause | Fix |
|---|---|---|
| `Cannot GET /assistant` après git pull | Serveur tourne avec ancien code | Tuer node + relancer (`Get-NetTCPConnection -LocalPort 4747` + Stop-Process) |
| `EBUSY: resource busy aiceo.db` | 2 process node simultanés | Tuer tous les nodes avant `npm run db:reset` |
| Sync Outlook ne tourne pas | Outlook fermé pendant la sync COM | Ouvrir Outlook + relancer `sync-outlook.ps1` |
| Cockpit affiche `outlook_stale critical` | Sync Outlook en panne depuis > 24h | `pwsh -File scripts\sync-outlook.ps1` manuel |
| Modal délégation sans suggestions équipe | `data/team.json` vide | Compléter avec votre N+1, N-1, secrétariat |
| `gh issue create` échoue avec label not found | Labels GH manquants après clonage | `pwsh -File fix-labels.ps1` à la racine repo |
| Doublons d'issues sur GitHub | Script `gh-create-issues-sX.ps1` lancé 2× | `pwsh -File cleanup-issues.ps1 -Apply` (audit ciblé) |
| Releases GH non publiées malgré tags posés | Manuel oublié | `pwsh -File fix-consistence.ps1 -Apply` |
| Bug NUL-padding sur `tests/*.js` (anciennement) | OneDrive sync polluait les fichiers | **Résolu en v0.5 par déplacement hors OneDrive** (cf. ADR « Projet hors OneDrive ») |

### Patterns que le CEO a adoptés
- **Push Git après chaque session significative** (substitut backup auto pré-V1.5)
- **Smoke test avant fermeture poste** (`smoke-all.ps1` 30 secondes)
- **Recette CEO mensuelle** (rejouer `RECETTE-CEO-v0.5-s4.md` complet 1×/mois)
- **Snapshot manuel hebdomadaire** : copier `data/aiceo.db` → `data/aiceo.db.YYYYMMDD` (en attendant V1.5)

### Ce qui marche bien et ce qu'il faut accepter
**Marche bien** :
- Démarrage automatique au logon (Variante D)
- Arbitrage matinal IA (gain ~45 min/jour)
- Streak du soir (effet motivant réel sur 30+ jours)
- Assistant chat avec contexte SQLite (Claude voit la base)
- Drag-drop natif HTML5 sur arbitrage + agenda (fluide)

**À accepter pré-V1** :
- Solo uniquement (pas de partage avec assistante / N+1)
- Pas de mobile
- Pas d'intégration Teams (export manuel mail si besoin)
- SQLite mono-instance (pas multi-poste, attention si CEO change de PC)
- Backup manuel (snapshot hebdo + push Git)

---

## §5 — Support continu

- **Repo GitHub** : `feycoil/aiCEO` (issues + discussions)
- **Releases** : `v0.5-s1` → `v0.5` (5 tags + notes détaillées par sprint)
- **CEO original** : Major Fey (`feycoil@etic-services.net`)
- **Documentation principale** :
  - `04_docs/INSTALL-WINDOWS.md` (install pas-à-pas, 9 sections, troubleshooting 8 cas)
  - `04_docs/RECETTE-CEO-v0.5-s4.md` (validation post-install + mensuelle)
  - `04_docs/api/S4.md` (doc API curl examples)
  - `00_BOUSSOLE/DECISIONS.md` (27 ADRs)
  - `04_docs/11-roadmap-map.html` (roadmap interactive)

### Communauté CEOs pairs
À constituer post-V1. En attendant, échange direct binôme à binôme via Major Fey.

---

## §6 — Contributions (CEO pair → pull request)

Si vous identifiez un bug ou une amélioration UX :

1. Forker `feycoil/aiCEO` ou créer une branche dans le repo si vous avez les droits write
2. Patcher (frontend = `03_mvp/public/*.html`, backend = `03_mvp/src/routes/*.js`)
3. Lancer `npm test` + `pwsh -File scripts/smoke-all.ps1`
4. Pull request vers `main`, mention `@feycoil` pour review

Conventions :
- Nommage commits : `feat(area): description` ou `fix(area): description`
- Tests : ajouter `tests/<area>.test.js` si nouvelle route ou logique métier
- Doc : patcher `00_BOUSSOLE/DECISIONS.md` si décision structurante (pattern ADR léger)

---

## §7 — Sources

- ADR « v0.5 internalisée terminée » (DECISIONS.md, 26/04/2026)
- DOSSIER-SPRINT-S5.md § Pilier 3
- INSTALL-WINDOWS.md (référence install)
- RECETTE-CEO-v0.5-s4.md (référence validation)
- Issue GitHub #YYY (S5.07)
