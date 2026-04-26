# INSTALL-WINDOWS.md — Installation aiCEO sur poste CEO Windows

**Version** : v0.5-s4 · **Cible** : poste Windows 10/11 du CEO en mode dogfood
**Auteur** : binôme CEO + Claude · **Dernière révision** : 2026-04-26 (Sprint S4)

> Ce document consolide tout ce qu'il faut pour qu'un nouveau poste CEO ait aiCEO opérationnel en moins de 30 minutes : serveur, autostart au logon, raccourci Bureau, sync Outlook automatique, rotation des logs, vérifications de santé.

---

## 0. Pré-requis poste

| Composant | Version mini | Vérif |
|---|---|---|
| Windows | 10 ou 11 | `winver` |
| PowerShell | 7.x recommandé (5.1 OK) | `pwsh --version` ou `$PSVersionTable.PSVersion` |
| Node.js | 24.x (pour `node:sqlite` natif) | `node --version` |
| Git | 2.40+ | `git --version` |
| GitHub CLI (`gh`) | 2.x | `gh --version` puis `gh auth login` |
| Outlook Desktop | 2019/365 ouvert au logon | sync Outlook = COM, exige Outlook actif |
| Edge ou Chrome | navigateur par défaut | pour le raccourci Bureau |

Cloner le repo dans `C:\_workarea_local\aiCEO` (chemin attendu par tous les scripts) :

```powershell
git clone https://github.com/feycoil/aiCEO.git C:\_workarea_local\aiCEO
cd C:\_workarea_local\aiCEO\03_mvp
npm install
npm run db:reset
```

Créer un `.env` (cf. `.env.example`) avec au minimum :

```
ANTHROPIC_API_KEY=sk-ant-...    # optionnel : sans cle, mode DEMO automatique
ANTHROPIC_MODEL=claude-sonnet-4-6
PORT=4747                        # aligné sur le wrapper logon
DEMO_MODE=0
```

---

## 1. Démarrage manuel (test rapide)

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm start
```

→ ouvre `http://localhost:4747/` dans le navigateur. Tu dois voir le cockpit. Coupe avec `Ctrl+C`.

`npm test` doit passer (≥ 78 verts attendus, voir §5).

---

## 2. Autostart au logon Windows (variante D — Startup folder shortcut)

ADR : `00_BOUSSOLE/DECISIONS.md` § "S3.10 Spike Service Windows · variante D retenue".

**Pourquoi pas un service Windows classique ?**
- `node-windows` (variante A) : `winsw.exe` compagnon .NET souvent bloqué par Zscaler/SmartScreen
- `schtasks /it ONLOGON` (variante C) : bug Windows documenté, pas testable via `schtasks /run`
- **Variante D = raccourci `.lnk` dans le Startup folder** : pattern Windows standard, toléré par tous les antivirus, désactivable trivialement.

### Installation (1 commande, profil utilisateur, **pas d'admin**)

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-startup-shortcut.ps1 install
```

Le script crée `aiCEO-Server.lnk` dans `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`. Au prochain logon, le wrapper PowerShell `start-aiCEO-at-logon.ps1` se lance (fenêtre minimisée), démarre `node server.js` et écrit dans `data/aiCEO-server.log`.

### Vérifications

```powershell
# Etat du raccourci
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-startup-shortcut.ps1 status

# Le wrapper a-t-il pose un PID ?
Get-Content C:\_workarea_local\aiCEO\03_mvp\data\aiCEO-server.log -Tail 10

# Le serveur ecoute-t-il ?
Get-NetTCPConnection -LocalPort 4747 | Select-Object OwningProcess
```

### Désinstallation

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-startup-shortcut.ps1 uninstall
# Tuer le serveur en cours :
Get-NetTCPConnection -LocalPort 4747 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Rotation des logs (S4.09)

Le wrapper `start-aiCEO-at-logon.ps1` rotate automatiquement `data/aiCEO-server.log` à chaque démarrage si > **2 Mo** :
- `aiCEO-server.log` → `aiCEO-server.log.1`
- `.1` → `.2`
- `.2` → `.3`
- `.3` est supprimé (garde 3 archives max ≈ 8 Mo total)

Pas de winston/winston-daily-rotate-file pour rester KISS pré-V1. À reconsidérer en S5 si volume log explose.

---

## 3. Raccourci Bureau "Cockpit aiCEO" (S4.08)

Une icône sur le Bureau qui ouvre `http://localhost:4747/` dans le navigateur par défaut.

### Installation

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-desktop-shortcut.ps1 install
```

Le script tente d'utiliser `02_design-system/assets/icons/aiceo.ico` si présent, sinon fallback Edge/Chrome.

### Vérification + désinstallation

```powershell
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-desktop-shortcut.ps1 status
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-desktop-shortcut.ps1 uninstall
```

### Personnaliser le port

```powershell
pwsh -File ...\install-desktop-shortcut.ps1 install -Port 3001
```

---

## 4. Sync Outlook automatique (schtasks /sc HOURLY)

Source : `03_mvp/scripts/sync-outlook.ps1` (S2 livré, S3 stabilisé).

### Installation tâche planifiée (1 fois, terminal **admin**)

```powershell
schtasks /create `
  /sc HOURLY /mo 2 `
  /tn "aiCEO-Outlook-Sync" `
  /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\_workarea_local\aiCEO\03_mvp\scripts\sync-outlook.ps1" `
  /ru "$env:USERNAME" `
  /rl HIGHEST `
  /f
```

→ exécute toutes les 2 heures. Logs : `03_mvp/data/sync-outlook.log`.

### Codes retour

| Code | Sens |
|---|---|
| 0 | Succès complet (raw + summary à jour) |
| 1 | Outlook indisponible (Start-Process raté) |
| 2 | fetch-outlook.ps1 a échoué (COM bloqué) |
| 3 | normalize-emails.js a échoué (raw invalide) |

Le wrapper détecte si Outlook est fermé et tente `Start-Process outlook` avec 15 s d'attente.

### Désactivation

```powershell
schtasks /delete /tn "aiCEO-Outlook-Sync" /f
```

---

## 5. Recette de validation (post-install)

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm test                              # >= 78 verts attendus (cf. RECETTE-CEO-v0.5-s4.md)
curl http://localhost:4747/api/health # { "ok": true, "demo": false, "model": "claude-sonnet-4-6" }
```

Visiter dans le navigateur (chacune doit se charger sans erreur console F12) :

- `/` cockpit
- `/arbitrage` arbitrage matin
- `/evening` bilan soir
- `/taches` tâches Eisenhower
- `/agenda` agenda hebdo
- `/revues` revues hebdo
- `/groupes` portefeuille (S4.03)
- `/projets` liste projets (S4.04)
- `/projet?id=xxx` page projet (S4.05)
- `/contacts` contacts (S4.06)
- `/decisions` décisions (S4.07)
- `/assistant` chat IA (S4.02)

---

## 6. Mises à jour

```powershell
cd C:\_workarea_local\aiCEO
git pull origin main
cd 03_mvp
npm install                    # si package.json a change
npm run db:migrate             # OU db:reset si dev
# Redemarrer le serveur :
Get-NetTCPConnection -LocalPort 4747 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }
# Le raccourci Startup folder relancera au prochain logon.
# OU manuellement :
pwsh -WindowStyle Hidden -File scripts\service-windows\start-aiCEO-at-logon.ps1
```

---

## 7. Désinstallation complète

```powershell
# Tuer le serveur
Get-NetTCPConnection -LocalPort 4747 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }

# Retirer raccourcis
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-startup-shortcut.ps1 uninstall
pwsh -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\install-desktop-shortcut.ps1 uninstall

# Retirer tâche Outlook (admin)
schtasks /delete /tn "aiCEO-Outlook-Sync" /f

# Supprimer le repo (optionnel)
Remove-Item -Recurse -Force C:\_workarea_local\aiCEO
```

---

## 8. Troubleshooting

| Symptôme | Cause probable | Fix |
|---|---|---|
| `Cannot GET /assistant` | Serveur tourne avec ancien code | `pkill node` + relancer (le wrapper logon a démarré une vieille version pré-pull) |
| `EBUSY: resource busy aiceo.db` | Process node garde le lock | Tuer tous les `node.exe` avant `npm run db:reset` |
| `EADDRINUSE :::4747` | Wrapper logon a déjà démarré un serveur | Tuer via `Get-NetTCPConnection -LocalPort 4747` |
| `disk I/O error errcode 4618` | DB ouverte par 2 process node simultanés | Tuer fantômes, relancer un seul `npm start` |
| `CO_E_SERVER_EXEC_FAILURE 0x80080005` | Outlook fermé pendant sync COM | Ouvrir Outlook + relancer `pwsh -File scripts\sync-outlook.ps1` |
| `gh: Validation Failed (HTTP 422)` | Milestone ou label manquant | `pwsh -File fix-labels.ps1` |
| `git push` rejected (non-fast-forward) | Branche en retard | `git pull --rebase origin main` |

---

## 9. Sources & ADR

- `00_BOUSSOLE/DECISIONS.md` § S3.10 (variante D), § S4.00 (méthode)
- `04_docs/DOSSIER-SPRINT-S4.md` § 1.7 (raccourci desktop), § 5.4 (polish service)
- Issue GitHub #143 (S4.08), #144 (S4.09)
