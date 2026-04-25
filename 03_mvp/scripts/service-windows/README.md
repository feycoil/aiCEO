# Service Windows — POC node-windows (S3.10)

> **Time-box strict 1,5 j.** Ce dossier livre un POC, pas un livrable de production. La décision finale (activer node-windows en S5 ou pivoter vers MSI/NSSM) sera prise via ADR si ce POC fait apparaître une question structurelle.

## Pourquoi

Le serveur `aiCEO` tourne aujourd'hui en avant-plan via `npm start` (terminal CEO ouvert). Cible S5 (cutover) : démarrage automatique au boot Windows, redémarrage sur crash, logs persistants dans Event Viewer ou fichiers, sans terminal visible.

## Quoi

Un wrapper [`node-windows`](https://github.com/coreybutler/node-windows) qui installe `server.js` comme **service Windows** (équivalent `sc` en mode utilisateur).

## Comment

Sur le poste CEO (Windows, droits admin) :

```powershell
# Pré-requis : droits admin terminal PowerShell
cd C:\_workarea_local\aiCEO\03_mvp

# Installer la dépendance node-windows (pas dans package.json, expérimental)
npm install --no-save node-windows

# Installer le service (idempotent — re-run met à jour la config)
node scripts/service-windows/install-service.js install

# Le service démarre automatiquement après l'install.
# Vérifier le statut :
sc query aiCEO

# Logs : aiCEO.out.log / aiCEO.err.log dans daemon\
dir C:\_workarea_local\aiCEO\03_mvp\daemon\
```

Désinstaller :

```powershell
node scripts/service-windows/install-service.js uninstall
```

## Critères d'acceptation POC

- [ ] `install` réussit sans erreur sur le poste CEO Windows
- [ ] `sc query aiCEO` retourne `RUNNING`
- [ ] `curl http://localhost:3001/api/health` répond 200 sans terminal visible
- [ ] Reboot Windows -> service redémarre automatiquement
- [ ] `uninstall` nettoie correctement la configuration

## Limites identifiées (à confirmer en S5)

| Sujet | Détail | Mitigation S5 |
|---|---|---|
| Droits admin | Install/uninstall nécessitent admin terminal | Doc CEO + script `run-as-admin.cmd` |
| Compte du service | LocalSystem par défaut → accès Outlook COM ? | Tester avec compte CEO interactif |
| Logs | `daemon\*.log` non rotatés | `winston-daily-rotate-file` ou Event Viewer |
| Mises à jour | service doit être `stop` avant pull → `start` | Script `update.cmd` (stop, git pull, npm install, start) |
| Antivirus | Zscaler / endpoint protection peuvent bloquer | Whitelist `node.exe` + chemin aiCEO |
| Plateforme | Windows Server 2019 non testé | Acceptance criteria S5 |

## Décision attendue

À l'issue du time-box 1,5 j (S3.10) :

- ✅ **POC vert silencieux** : pas d'ADR. S5 démarre directement sur cette base, ajoute la rotation logs + scripts ops.
- ⚠️ **POC rouge ou question structurelle** : ouvrir une ADR `2026-06-XX · S3.10 — Spike Service Windows`, comparer alternatives (MSI/NSSM, scheduled task au boot, conteneur Docker Desktop). Décision avant fin S3.

## Références

- node-windows : https://github.com/coreybutler/node-windows
- Sysinternals Process Explorer : https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer
- ADR S3.00 (méthode S3) : `00_BOUSSOLE/DECISIONS.md`
- DOSSIER S3 §1.5 (hors périmètre = packaging > S3.10) + §3 (S3.10) + §5.5 (R5 risque time-box)
