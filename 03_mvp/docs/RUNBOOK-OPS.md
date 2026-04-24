# RUNBOOK-OPS — aiCEO MVP

*Cible : dev interne v0.5 + ops + CEO pair (futur). Diagnostic rapide + remède connu pour les modes de panne vécus en vrai.*

---

## Règle de maintenance (importante)

**Chaque panne diagnostiquée en prod → nouvelle entrée dans ce runbook dans le sprint en cours.** Pas d'anticipation : on ne documente pas ce qui pourrait théoriquement arriver. On documente ce qui est arrivé une fois.

Format d'une entrée : **symptôme observable** · **cause racine** · **diagnostic (commandes)** · **remède (étapes)** · **prévention (si applicable)**.

Si tu corriges une panne qui n'est pas listée ici, ajoute-la avant de fermer ta PR.

---

## 1. Serveur qui refuse de démarrer

### 1.1 Port 4747 déjà occupé

**Symptôme** : `Error: listen EADDRINUSE: address already in use :::4747` au lancement de `node server.js`.

**Cause** : un autre processus utilise le port 4747 (souvent un `node server.js` précédent qui n'a pas été tué).

**Diagnostic**
```powershell
# Windows
netstat -ano | findstr :4747
# colonne PID à droite, ex. 18432
```
```bash
# macOS/Linux
lsof -i :4747
```

**Remède**
```powershell
taskkill /PID 18432 /F
```
Ou : changer le port via `PORT=4748 node server.js`.

**Prévention** : en v0.5, le Service Windows gèrera le lifecycle et cette situation disparaît.

### 1.2 Module manquant

**Symptôme** : `Error: Cannot find module 'express'` (ou similaire) au démarrage.

**Cause** : `node_modules/` vide ou version de Node incompatible (< 20).

**Diagnostic**
```bash
node --version            # doit afficher v20.x
ls node_modules/ | head   # doit lister express, dotenv, etc.
```

**Remède**
```bash
rm -rf node_modules package-lock.json
npm install
```
Si le problème persiste avec Node ≥ 20 : ouvre une issue GitHub avec le log complet.

---

## 2. Clé Anthropic

### 2.1 Mode démo bloqué avec une clé valide

**Symptôme** : `GET /api/health` retourne `{"mode":"demo", ...}` alors que `.env` contient `ANTHROPIC_API_KEY=sk-ant-…`.

**Causes possibles**
- `.env` pas chargé (redémarrage serveur oublié après édition).
- Clé avec espace/retour à la ligne invisible collé.
- Variable d'environnement système `ANTHROPIC_API_KEY` vide qui écrase celle du `.env`.

**Diagnostic**
```bash
# côté serveur, dans une Node REPL
node -e "require('dotenv').config(); console.log(JSON.stringify(process.env.ANTHROPIC_API_KEY))"
# doit afficher "sk-ant-..." sans guillemets de chaque côté visibles
```

**Remède**
1. Redémarrer le serveur (`Ctrl+C` puis `node server.js`).
2. Vérifier l'absence d'espaces : `cat .env | od -c | head` (fin de clé doit être `\n`, pas `  \n`).
3. Si variable système polluée : `unset ANTHROPIC_API_KEY` (Linux/macOS) ou retirer dans les variables d'environnement Windows.

### 2.2 401 Unauthorized depuis Anthropic

**Symptôme** : logs serveur `[llm] erreur: 401 authentication_error`.

**Cause** : clé expirée, révoquée, ou quota dépassé côté console.anthropic.com.

**Diagnostic**
```bash
curl -s -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}'
```
Si 401 → clé à renouveler. Si 200 mais mode démo → voir 2.1.

**Remède**
1. Renouveler la clé sur [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. Mettre à jour `.env`.
3. Redémarrer le serveur.

---

## 3. Import Outlook

### 3.1 `fetch-outlook.ps1` ne renvoie rien

**Symptôme** : `scripts/fetch-outlook.ps1` s'exécute sans erreur mais `data/emails-raw.json` est vide ou absent.

**Causes**
- Outlook fermé (le COM a besoin d'une instance active).
- Profil Outlook pas par défaut (plusieurs profils sur le poste).
- ExecutionPolicy qui bloque silencieusement.

**Diagnostic**
```powershell
# Vérifier qu'Outlook tourne
Get-Process outlook -ErrorAction SilentlyContinue

# Tester l'accès COM directement
$ol = New-Object -ComObject Outlook.Application
$ns = $ol.GetNamespace("MAPI")
$ns.Folders | Select Name    # doit lister tes comptes
```

**Remède**
1. Ouvrir Outlook, attendre la fin de la synchro.
2. Relancer : `powershell -ExecutionPolicy Bypass -File scripts\fetch-outlook.ps1`.
3. Si plusieurs profils, forcer celui par défaut dans Outlook → Fichier → Options → Général.

### 3.2 Dossiers Envoyés vides après normalisation

**Symptôme** : `data/emails.json` contient des reçus mais 0 envoyés, alors que la boîte contient des mails récents envoyés.

**Cause connue (fix appliqué 24/04)** : nom de dossier `Sent Items` vs `Éléments envoyés` selon langue Outlook. Le script cherchait `Sent Items` uniquement.

**Diagnostic**
```powershell
# Lister les noms de dossiers du compte principal
$ns.Folders.Item(1).Folders | Select Name
```

**Remède**
Le fix est dans `scripts/fetch-outlook.ps1` (cherche les deux noms). Si tu vois encore le bug : ton Outlook est dans une 3ᵉ langue → ajoute le nom local au tableau `$sentFolderNames` dans le script.

### 3.3 Inférence projet sur-active (> 30 %)

**Symptôme** : `data/emails-summary.json` affiche 73 % des mails rattachés à un projet (cible ≤ 30 %).

**Cause** : patterns de `scripts/normalize-emails.js` trop larges (ex. "ADABU" matche tout mail mentionnant Mayotte).

**Remède** : affiner les regex dans `normalize-emails.js` section `inferProject`, puis re-run `node scripts/normalize-emails.js`. Valider avec `GET /api/emails/summary`.

---

## 4. Réseau corporate

### 4.1 `npm install` échoue SSL sur proxy MITM

**Symptôme** : `npm ERR! code UNABLE_TO_GET_ISSUER_CERT_LOCALLY` au install.

**Cause** : proxy Zscaler/Squid qui intercepte SSL avec un cert racine corp non-présent dans le store Node.

**Remède**
```bash
# 1. Exporter le cert racine corp (depuis l'AC interne ETIC)
# 2. Pointer Node dessus
export NODE_EXTRA_CA_CERTS=C:\certs\etic-root.crt   # Windows: setx
export HTTPS_PROXY=http://proxy.etic-services.net:3128
npm install
```

Le wrapper `src/anthropic-client.js` fait déjà la même chose côté runtime (log `[llm] proxy actif : …` au démarrage).

### 4.2 Claude répond timeout sur réseau ETIC

**Symptôme** : arbitrage bloqué 60 s puis `[llm] timeout`, mais fonctionne à la maison.

**Cause** : proxy qui bufferise ou rate-limit sortant.

**Diagnostic**
```bash
curl -v --proxy $HTTPS_PROXY https://api.anthropic.com/v1/messages ...
# observer le temps de connect vs le temps total
```

**Remède** : augmenter le timeout côté `src/anthropic-client.js` (`timeout: 90_000` par défaut). Si ça persiste, escalader à l'IT ETIC avec la trace curl.

---

## 5. Fichiers JSON / OneDrive

### 5.1 JSON corrompu au redémarrage

**Symptôme** : `SyntaxError: Unexpected token \u0000 in JSON at position …` au chargement de `data/*.json`.

**Cause connue** : OneDrive pad les fichiers avec des bytes NUL lors de la synchro offline, corrompt les JSON écrits en cours de synchro.

**Remède** : le module `src/json-robust.js` gère déjà ce cas (strip NUL + retry). Si tu vois encore l'erreur : c'est que du code contourne le helper → remonter l'écriture vers `json-robust.js`.

**Prévention** : ne jamais écrire `data/*.json` avec `fs.writeFileSync` direct. Toujours passer par `writeJsonRobust()`.

---

## 6. Service Windows (v0.5)

### 6.1 Service ne démarre pas au boot

**Symptôme** : pas de `http://localhost:4747` après reboot, pas d'erreur visible.

**Diagnostic**
```powershell
# Statut du service
Get-Service aiCEO

# Logs Windows (Event Viewer → Windows Logs → Application, source "aiCEO")
Get-EventLog -LogName Application -Source aiCEO -Newest 20
```

**Remède** (ordre)
1. `Start-Service aiCEO` — si ça marche, ajouter "démarrage automatique" : `Set-Service aiCEO -StartupType Automatic`.
2. Si échec : lire le log → chercher `EBUSY` (fichier lock), `EADDRINUSE` (port), `ECONNREFUSED` (proxy), `MODULE_NOT_FOUND` (install corrompu).
3. Dernier recours : désinstaller + réinstaller via `node scripts/install-service.js` (à venir en v0.5, voir SPEC-FUSION §7).

*Cette section grossira en v0.5 quand le Service Windows sera déployé en vrai.*

---

## 7. Mode démo / données

### 7.1 UI vide ("Aucune tâche")

**Symptôme** : `http://localhost:4747` affiche les 3 colonnes vides, bouton "Lancer l'arbitrage" ne fait rien.

**Cause** : `data/seed.json` absent ou vide.

**Remède**
```bash
npm run seed              # régénère depuis ../01_app-web/assets/data.js
# ou bouton "↻ Recharger données" dans l'UI
```

Vérifier : `curl http://localhost:4747/api/tasks | head` doit retourner au moins une tâche.

### 7.2 Emails démo mais pas réels

**Symptôme** : l'arbitrage mentionne Marie Ansquer et Bénédicte (personas démo) alors qu'on est en prod.

**Cause** : `data/emails.json` contient les 11 emails du `seed-emails-demo.js`.

**Remède** : relancer l'import réel (`fetch-outlook.ps1` + `normalize-emails.js`) — cela écrase le fichier démo.

---

## 8. Annexe — où chercher quand une panne n'est pas ici

1. **Logs serveur** : console de `node server.js` (préfixes `[arbitrage]`, `[llm]`, `[drafts]`, `[evening]`, `[emails]`).
2. **État des données** : `ls -la data/` + `curl http://localhost:4747/api/health`.
3. **Git blame** sur le module concerné : une régression récente est souvent la cause.
4. **GitHub Issues** `feycoil/aiCEO` : search sur le message d'erreur (souvent vu avant).
5. **Doc cible v0.5** : `../../04_docs/SPEC-TECHNIQUE-FUSION.md` peut indiquer si le comportement observé est déjà corrigé dans la spec cible.

Si après tout ça tu n'as rien trouvé : ouvrir une issue GitHub avec log complet + commandes rejouables, **puis une fois résolue, ajouter l'entrée ici**.

---

*Dernière mise à jour : 2026-04-24 · v1 · S6 atelier cohérence · 5 catégories de pannes documentées*
