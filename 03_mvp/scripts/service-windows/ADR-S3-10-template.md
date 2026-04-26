# ADR S3.10 — Spike Service Windows : POC node-windows ROUGE → variante D retenue (Startup folder shortcut)

## 2026-04-25 · S3.10 — Spike Service Windows : POC node-windows ROUGE → 2 pivots successifs (variante C tentée → variante D adoptée)

**Contexte** : Sprint S3 a réservé 1,5 j de time-box strict pour évaluer `node-windows` comme wrapper service Windows pour `server.js` (cible S5 cutover). Le POC a été exécuté sur le poste CEO Windows en mode admin avec `npm install --no-save node-windows && node scripts/service-windows/install-service.js install`.

### Tentative #1 — POC `node-windows` (variante A) : ROUGE

- ❌ Install : `node install-service.js install` se termine sans erreur visible mais sans log de progression
- ❌ `sc query aiCEO` → « Le service spécifié n'existe pas en tant que service installé »
- ❌ HTTP /api/health → connect refused

**Diagnostic** : `svc.install()` est event-driven async. Le node process se termine avant que les events `install` se déclenchent. Patch théorique évident mais cela révèle une fragilité architecturale (winsw.exe = compagnon .NET sujet à blocage antivirus/Zscaler/SmartScreen).

### Tentative #2 — Schtasks `/it ONLOGON` (variante C) : ROUGE OPÉRATIONNELLE

```powershell
schtasks /create /sc ONLOGON /tn aiCEO-Server-AtLogon `
  /tr 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ...\start-aiCEO-at-logon.ps1' `
  /ru CEO /it
```

- ✅ Tâche créée (`schtasks /create` retourne « Opération réussie »)
- ❌ `schtasks /run` ne déclenche rien (`Dernier résultat: 267011` = `SCHED_S_TASK_HAS_NOT_RUN`)
- ❌ `Start-ScheduledTask` (PowerShell module) idem
- ✅ Wrapper PowerShell standalone fonctionne parfaitement (test direct = exit 0, log écrit)

**Diagnostic** : bug Windows documenté. Les tâches déclarées `/it` (Interactive Only) ne peuvent **pas** être déclenchées via `schtasks /run` ni `Start-ScheduledTask`. Elles tournent uniquement sur leur trigger réel (logon Windows). Impossible donc de valider le POC sans relogon, et le pattern de test/debug devient lourd.

**Décision** : **Variante D — Raccourci dans le Startup folder du profil utilisateur**. Pattern Windows le plus simple et le plus fiable pour démarrer une app au logon.

```powershell
# Installation (terminal NON admin, profil CEO)
$WshShell      = New-Object -ComObject WScript.Shell
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath  = Join-Path $startupFolder "aiCEO-Server.lnk"

$shortcut = $WshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath       = "powershell.exe"
$shortcut.Arguments        = '-ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\start-aiCEO-at-logon.ps1"'
$shortcut.WorkingDirectory = "C:\_workarea_local\aiCEO\03_mvp"
$shortcut.WindowStyle      = 7   # Minimized (les .lnk ignorent 0=Hidden)
$shortcut.Description      = "aiCEO copilote - demarrage serveur au logon"
$shortcut.Save()
```

Le script `start-aiCEO-at-logon.ps1` (24 lignes, déjà livré) reste inchangé :
- Vérifie idempotence (skip si :4747 déjà en écoute)
- Lance `node server.js` en `CreateNoWindow=true`
- Log timestamps dans `data/aiCEO-server.log`

**Validation** :
- Test 25/04 02:36 : kill node + `Start-Process` du raccourci → `[start] node server.js PID=24552` dans le log + `/api/health` 200 ✅
- Test 25/04 02:40 : second cycle, `[start] node server.js PID=30180` ✅
- Le raccourci se déclenchera automatiquement au prochain logon Windows

**Conséquences** :

- **Compte du service** = compte CEO interactif (pas LocalSystem). Les **accès Outlook COM** sont garantis (le contexte est identique à un démarrage manuel `npm start`).
- **Démarre au logon, pas au boot** : le serveur n'est pas dispo si le CEO ne s'est pas loggé. Acceptable pour le dogfood pré-V1.
- **Logs** : `data/aiCEO-server.log` (timestamps de start) + sortie standard non capturée. En S5 si on veut aller plus loin : ajouter `winston-daily-rotate-file` dans le serveur.
- **Pas de redémarrage auto sur crash** : si `node server.js` crashe, il n'est pas relancé jusqu'au prochain logon. À évaluer en S5.
- **Antivirus / Zscaler** : un raccourci `.lnk` dans `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup` est une mécanique standard Windows que les antivirus laissent passer (vs `winsw.exe` ou tâches planifiées qui peuvent être surveillés).
- **Visibilité / désactivation triviales** : `Win+R → shell:startup` ouvre le dossier. Supprimer `aiCEO-Server.lnk` désactive le démarrage auto.
- **Mises à jour** : `git pull` puis `Stop-Process node ; Start-Process raccourci` — pas de uninstall/reinstall service. Friction zéro.

**Pour S5 (cutover production)** : reconsidérer NSSM (variante B) si on veut :
- Le redémarrage auto sur crash
- Le démarrage au boot (sans logon)
- La rotation logs intégrée

**Sources** :
- POC node-windows : `03_mvp/scripts/service-windows/install-service.js` (silencieux, service jamais créé)
- Tentative schtasks `/it ONLOGON` : créée mais non déclenchable manuellement (bug Windows)
- Pivot final : raccourci `aiCEO-Server.lnk` dans `[Environment]::GetFolderPath('Startup')`
- Wrapper : `03_mvp/scripts/service-windows/start-aiCEO-at-logon.ps1` (24 lignes, idempotent)
- Précédent réussi : `aiCEO-Outlook-Sync` (schtasks `/sc HOURLY /mo 2` créée 25/04, fonctionne sans `/run` manuel grâce au trigger récurrent)
- Logs validation : `data/aiCEO-server.log` (deux entrées `[start]` 25/04 02:36 et 02:40)
- DOSSIER S3 §3 (S3.10), §5.5 (R5 risque time-box)
- ADR cadrage S3 du 2026-04-25 (qui prévoyait l'ADR séparée si POC dépasse ou ouvre une question structurelle)
