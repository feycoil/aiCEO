# ADR S3.10 — Spike Service Windows : POC node-windows ROUGE → pivot Scheduled Task au logon

## 2026-04-25 · S3.10 — Spike Service Windows : POC node-windows ROUGE → variante C retenue (Scheduled Task au logon)

**Contexte** : Sprint S3 a réservé 1,5 j de time-box strict pour évaluer `node-windows` comme wrapper service Windows pour `server.js` (cible S5 cutover). Le POC a été exécuté sur le poste CEO Windows en mode admin avec `npm install --no-save node-windows && node scripts/service-windows/install-service.js install`.

**Résultat POC** :

- ❌ **Install** : `node install-service.js install` se termine sans erreur visible mais sans log de progression
- ❌ **`sc query aiCEO`** → « Le service spécifié n'existe pas en tant que service installé »
- ❌ **HTTP /api/health** → connect refused (aucun serveur ne tourne)
- ❌ **Reboot → redémarrage auto** : non testable puisque service jamais créé
- ❌ **Outlook COM accessible depuis le contexte service** : non testable

**Diagnostic** : `node-windows` repose sur `svc.install()` async event-driven. Le node process se termine avant que les events `install` se déclenchent (manque `process.stdin.resume()` ou async wait). Patch théorique évident mais cela révèle une **fragilité architecturale** : la création d'un service Windows nécessite un compagnon `winsw.exe` (.NET wrapper) qui peut être bloqué par antivirus / Zscaler / SmartScreen sans message clair. Le POC ouvre donc une question structurelle.

**Décision** : **Variante C — Scheduled Task au logon**. Plus simple, plus sûre, déjà éprouvée par la schtasks Outlook autosync (`aiCEO-Outlook-Sync` créée le 25/04 sans incident).

Pattern technique :

```powershell
# Installation (terminal admin)
schtasks /create `
  /sc ONLOGON `
  /tn "aiCEO-Server-AtLogon" `
  /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\start-aiCEO-at-logon.ps1" `
  /ru "$env:USERNAME" `
  /rl HIGHEST `
  /it

# Désinstall
schtasks /delete /tn "aiCEO-Server-AtLogon" /f
```

Le script `start-aiCEO-at-logon.ps1` (24 lignes) :
- Vérifie idempotence (port 4747 déjà en écoute → skip)
- Lance `node server.js` en `CreateNoWindow=true` (pas de fenêtre visible)
- Log dans `data/aiCEO-server.log` (PID + timestamp)

**Conséquences** :

- **Compte du service** = compte CEO interactif (pas LocalSystem). Les **accès Outlook COM** sont garantis (le contexte est identique à un démarrage manuel `npm start`). C'est l'avantage décisif vs node-windows qui aurait tourné sous LocalSystem.
- **Ne démarre pas au boot, mais au logon** : le serveur n'est pas dispo si le CEO ne s'est pas loggé. Acceptable pour le dogfood pré-V1 (le CEO est de toute façon devant son poste pour utiliser le MVP).
- **Logs** : `data/aiCEO-server.log` (timestamps de start) + sortie standard non capturée (perte légère, acceptable POC). En S5 si on veut aller plus loin : ajouter `winston-daily-rotate-file` dans le serveur lui-même.
- **Pas de redémarrage auto sur crash** : si `node server.js` crashe, il n'est pas relancé jusqu'au prochain logon. À évaluer en S5 — pour le dogfood en cours, le CEO peut relancer manuellement.
- **Antivirus / Zscaler** : la tâche planifiée est moins sujette à blocage que `winsw.exe` (le binaire `node.exe` est déjà whitelisté pour `npm start`).
- **Mises à jour** : `git pull` puis `Stop-Process node ; schtasks /run /tn aiCEO-Server-AtLogon` — pas de uninstall/reinstall service. Friction zéro.

**Pour S5 (cutover production)** : reconsidérer NSSM (variante B) si on veut :
- Le redémarrage auto sur crash
- Le démarrage au boot (sans logon)
- La rotation logs intégrée

**Sources** :
- POC : `03_mvp/scripts/service-windows/install-service.js` (silencieux, pas de logs émis, service jamais créé)
- Pivot : `03_mvp/scripts/service-windows/start-aiCEO-at-logon.ps1` (24 lignes, idempotent)
- Précédent réussi : `aiCEO-Outlook-Sync` (schtasks /sc HOURLY /mo 2 créée 25/04 sans incident)
- DOSSIER S3 §3 (S3.10), §5.5 (R5 risque time-box)
- ADR cadrage S3 du 2026-04-25 (qui prévoyait l'ADR séparée si POC dépasse ou ouvre une question structurelle)
