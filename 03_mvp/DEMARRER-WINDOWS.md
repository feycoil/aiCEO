# Démarrer sur Windows — guide en 2 minutes

## 1 · Vérifier Node.js (une seule fois)

Ouvrez **PowerShell** (Démarrer → tapez "powershell") et tapez :

```powershell
node --version
```

**Si ça affiche `v18.xx.x` ou plus** → passez à l'étape 2.

**Si ça affiche "command not found"** → installez Node.js :
1. Allez sur https://nodejs.org/
2. Téléchargez la version **LTS** (bouton vert à gauche)
3. Double-cliquez l'installeur, acceptez tout par défaut
4. **Fermez et rouvrez** PowerShell, retestez `node --version`

---

## 2 · Lancer le MVP

**Option A — un seul clic (recommandé)**

Dans l'Explorateur Windows, naviguez jusqu'au dossier `mvp` :

```
C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Agent\mvp
```

Double-cliquez sur **`start.bat`**.

Une fenêtre noire s'ouvre, puis votre navigateur s'ouvre automatiquement sur `http://localhost:3001`.

**Pour arrêter** : fermez la fenêtre noire.

---

**Option B — en ligne de commande**

Dans PowerShell :

```powershell
cd "C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Agent\mvp"
npm install
node server.js
```

Puis ouvrez http://localhost:3001 dans votre navigateur.

---

## ⚠ Problème possible avec SharePoint

Le dossier `aiCEO_Agent` est dans un dossier **synchronisé SharePoint/OneDrive**. Node.js peut ramer ou planter (trop de fichiers créés trop vite).

**Si vous rencontrez des erreurs**, copiez le dossier `mvp` vers un chemin local court :

```powershell
# Dans PowerShell
Copy-Item -Recurse "C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Agent\mvp" "C:\aiceo-mvp"
cd C:\aiceo-mvp
.\start.bat
```

Le MVP lit les données depuis `..\assets\data.js`. Si vous copiez `mvp` seul, il ne trouvera plus les données. Alors copiez **tout le dossier `aiCEO_Agent`** :

```powershell
Copy-Item -Recurse "C:\Users\feycoil.ETIC\ETIC Services\EXECUTIVE BOARD [ExCom] - Direction - Documents\1. Gouvernance et Décisions\aiCEO_Agent" "C:\aiceo"
cd C:\aiceo\mvp
.\start.bat
```

Puis quand vous voulez synchroniser avec votre version SharePoint, copiez juste `data\decisions.json` (l'historique de vos arbitrages).

---

## Dépannage rapide

| Symptôme | Cause | Solution |
|----------|-------|----------|
| "Node.js n'est pas installé" | Node pas dans le PATH | Réinstallez Node.js en cochant "Add to PATH", redémarrez PowerShell |
| `localhost:3001` ne charge pas | Serveur pas démarré | Double-cliquez `start.bat`, attendez le message "Serveur en cours de démarrage" |
| "Port 3001 already in use" | Autre appli utilise le port | Éditez `.env`, mettez `PORT=3002` |
| `npm install` échoue avec "ENAMETOOLONG" | Chemin Windows trop long | Copiez le dossier vers `C:\aiceo\` (voir plus haut) |
| Windows Defender bloque | Antivirus paranoïaque | Clic droit sur `start.bat` → Propriétés → Débloquer |
| Écran blanc dans le navigateur | Cache | Ctrl+F5 pour recharger |

---

## Pour brancher Claude (optionnel — le mode démo marche sans)

1. Créez une clé API sur https://console.anthropic.com/
2. Dans le dossier `mvp`, copiez `.env.example` en `.env`
3. Ouvrez `.env` dans le Bloc-notes, collez votre clé :

   ```
   ANTHROPIC_API_KEY=sk-ant-votrecletici
   ```

4. Sauvegardez, relancez `start.bat`

Le badge en haut à droite passera de "MODE DÉMO" à "claude-sonnet-4-6".

Coût : environ 1 ct par arbitrage. Budget mensuel typique : ~0,50 € à raison d'un arbitrage/jour.

---

*Copilote aiCEO · v0.1*
