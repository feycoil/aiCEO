---
title: aiCEO — Onboarding CEO pair
audience: CEO pair ETIC qui veut tester aiCEO en moins d'une heure
version: v1.0 — guide v0.5 (T2 2026)
date: 2026-04-25
status: livrable externe
filtrage: |
  Audience : CEO pair. Éléments redactés : aucun (c'est public).
---

# aiCEO — Tu veux tester ? On y va, c'est moins d'une heure.

Salut,

Si tu lis ça, c'est que je t'ai donné le pitch et que tu m'as dit *« banco,
montre ». * Ce guide te fait passer de zéro à un premier arbitrage matinal
réel sur **tes propres mails Outlook**, en environ une heure. Pas de SaaS
à signer, rien qui sort de ton poste, juste une clé Anthropic perso à 5 €
de crédit le temps du test.

Si tu coinces sur une étape, ne perds pas plus de 10 minutes : tu m'écris
ou tu m'appelles, je débugge avec toi.

— Feycoil

---

## 1 · Prérequis

Avant de commencer, vérifie que tu as :

| Bloc | Détail | Pourquoi |
|---|---|---|
| **Windows 10 ou 11** | poste pro ou perso, peu importe | Service Windows + PowerShell COM |
| **Outlook desktop** | classique (pas la version Web), Microsoft 365 ou Exchange | Lecture COM 30 jours de mails |
| **Node.js 20+** | `node --version` doit renvoyer `v20.x` ou plus | Backend MVP |
| **Clé Anthropic perso** | console.anthropic.com → API keys → "Create Key" | LLM arbitrage |
| **5 € de crédit Anthropic** | console.anthropic.com → Billing | Couvre 1-2 mois de test, ≈ 1 ct par arbitrage |
| **Proxy corporate** | facultatif, on gère `HTTPS_PROXY` | Si ta boîte filtre les sorties HTTPS |

Tu n'as pas besoin de :

- Un serveur quelque part — **tout tourne sur ton PC**.
- Une équipe IT — **l'install est mono-poste, sans installer.exe** ; tu
  copies un dossier, tu lances un service.
- Un compte SaaS — **rien à signer, rien à provisionner**.

---

## 2 · Installation — 15 minutes

### 2.1 Récupérer le code

Choix A (le plus simple) — tu télécharges le ZIP :

```
https://github.com/feycoil/aiCEO/releases/tag/v0.5
→ aiCEO-v0.5-windows.zip → décompresse dans C:\aiCEO\
```

Choix B (si tu as Git) :

```powershell
cd C:\
git clone https://github.com/feycoil/aiCEO.git
cd aiCEO\03_mvp
```

### 2.2 Installer les dépendances

Ouvre PowerShell **dans le dossier `03_mvp`** et lance :

```powershell
npm install
```

Ça prend 1-2 minutes. Si tu es derrière un proxy corp, ajoute avant :

```powershell
$env:HTTPS_PROXY = "http://proxy.tasociete.local:8080"
$env:HTTP_PROXY  = "http://proxy.tasociete.local:8080"
```

### 2.3 Configurer la clé Anthropic

Crée un fichier `.env` dans `03_mvp\` (copie depuis `.env.example` si présent) :

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
PORT=3001
TZ=Europe/Paris
```

Ne commit jamais ce fichier (`.gitignore` le couvre déjà).

### 2.4 Installer le Service Windows (démarrage auto)

Un script PowerShell installe l'agent comme service système — il
redémarrera tout seul après reboot et après crash :

```powershell
.\install-service.ps1
```

Le script utilise [`node-windows`](https://github.com/coreybutler/node-windows)
(option par défaut, cf. `SPEC-TECHNIQUE-FUSION.md` §8.1) ou NSSM en fallback.
Il crée un service nommé `aiCEO Agent`, démarrage automatique, retry
3 × 5 s en cas de crash.

Vérifier que ça tourne :

```powershell
Get-Service "aiCEO Agent"
# STATUS    NAME              DISPLAYNAME
# Running   aiCEO Agent       aiCEO Agent
```

Et dans le navigateur : `http://localhost:3001/` doit afficher le cockpit.

### 2.5 Raccourci desktop

Le script d'install dépose `aiCEO.url` sur ton bureau — un clic ouvre le
cockpit dans Chrome (ou le navigateur par défaut). Tu peux l'épingler à la
barre des tâches Windows.

---

## 3 · Importer 30 jours d'Outlook — 5 minutes

aiCEO lit ton Outlook desktop **localement, via PowerShell COM**, sans
mots de passe ni Graph API. Tes mails ne quittent pas ton poste — seul le
résumé compact des tâches du jour part vers Claude pour l'arbitrage.

```powershell
.\outlook-pull.ps1 -Days 30
```

Tu verras défiler :

```
[*] Connecting to Outlook (default profile)...
[+] Mailbox: feycoil@etic-services.net (892 mails 30 j)
[+] Mailbox: contact@adabu.fr (delegated, 21 mails 30 j)
[+] Mailbox: pole-rh@etic-services.net (delegated, 13 mails 30 j)
[✓] 926 mails normalized → data/emails-summary.json
```

Si ton Outlook a plusieurs boîtes déléguées, le script les détecte
automatiquement. Le résultat est un JSON local de quelques Mo, dans
`data/emails-summary.json`.

> **Sécurité** — ce JSON contient des extraits de tes mails (sujet, expéditeur,
> 3 premières lignes du corps). Il reste sur ton disque, dans ton profil
> utilisateur. Aucun envoi vers un cloud externe. Tu peux l'inspecter, le
> supprimer, le re-générer à volonté.

---

## 4 · Premier arbitrage matinal — 15 minutes

### 4.1 Ouvrir le cockpit

`http://localhost:3001/` (ou clic sur `aiCEO.url`) → tu arrives sur la
page **Aujourd'hui**. La première fois, elle est vide — c'est normal.

### 4.2 Lancer l'arbitrage

Clique le gros bouton **« Préparer ma matinée »** en haut à droite.

aiCEO va :

1. Charger le contexte (tes 30 j de mails + ton agenda Outlook + tes tâches
   ouvertes des arbitrages précédents — vide la première fois).
2. Envoyer un résumé compact à Claude Sonnet 4.5 (5,2 k tokens in en
   moyenne).
3. Recevoir l'arbitrage **3 / 2 / N** : 3 priorités du jour, 2 tâches à
   déléguer (avec brouillon de mail prêt), N tâches à différer.
4. Afficher le tout en cockpit, en environ **40 secondes**.

Coût observé : ≈ 1 ct par arbitrage (Sonnet 4.5 prompt caching).

### 4.3 Lire les 3 colonnes

- **Faire (3 priorités)** — chaque carte est une décision ou une action
  à exécuter par toi, dans la matinée. Clique pour voir les mails sources.
- **Déléguer (2)** — chaque carte propose un destinataire et un brouillon
  de mail. Tu peux modifier le brouillon, puis cliquer **« Envoyer »** —
  le mail part de ton Outlook directement (rien ne sort du PC).
- **Différer (N)** — la pile de ce qui n'est ni urgent ni délégable. Ré-évalué
  demain. Tu peux marquer "définitivement enterré" pour purger.

### 4.4 Sous pression

Si l'agent détecte que tu es **chargé** (> 6 priorités potentielles), un
chip coral apparaît en haut : *« Tu es chargé. Veux-tu reporter X ? »*.
Clique pour voir les options de report. C'est la seule UX qui pousse à
ralentir.

### 4.5 Boucle du soir (optionnel jour 1)

À 18h ou quand tu veux, ouvre `http://localhost:3001/evening` :

1. Coche ce que tu as fait dans la liste des 3 priorités.
2. Note en 1 phrase ce qui a coincé (champ libre, restera en mémoire pour
   l'arbitrage de demain).
3. Valide → l'agent capitalise pour le lendemain.

3 minutes, fin de journée propre.

---

## 5 · FAQ

### Confidentialité — où vont mes mails ?

**Nulle part.** Tes mails Outlook restent dans Outlook. Le JSON résumé
(`data/emails-summary.json`) reste sur ton disque, dans ton profil
utilisateur. **Ce qui sort vers Claude** = un résumé compact des tâches du
jour (sujet + expéditeur + 3 lignes de contexte par mail), uniquement au
moment de l'arbitrage. Pas de log côté Anthropic après le run (politique
no-train + no-log opt-out déjà active sur le compte API standard).

En V1 cloud (T4 2026), ce sera mirroring AWS Bedrock EU Frankfurt avec
DPA signé. En v0.5 que tu testes, c'est encore l'API directe Anthropic —
acceptable pour un test pair, à challenger si tu testes sur des dossiers
sensibles.

### Coût mensuel ?

À l'usage v0.4 mesuré sur mon poste (1 arbitrage / jour, 22 jours ouvrés) :
**≈ 5 € / mois d'API Anthropic**. Tu paies ce que tu consommes, directement
à Anthropic, sur ta clé perso.

Aucun abonnement aiCEO en v0.5. Le SaaS payant arrive en V2 (T1 2027) sur
les CEO pilotes — ça sera ton choix à ce moment-là.

### Support si ça casse ?

Tu m'écris : `feycoil@etic-services.net`. Je débugge en visio (max 30 min)
ou je te file un patch. Pas de ticketing, pas de SLA officiel — c'est un
test pair.

### Rollback / désinstall ?

```powershell
.\uninstall-service.ps1
# puis tu supprimes C:\aiCEO\
```

Le service est désinstallé, le dossier supprimé, tes mails Outlook sont
intacts (on n'écrit jamais dans Outlook, sauf via "Envoyer" explicite que
tu déclenches dans la modale délégation).

### Et si je veux modifier le prompt système ?

Il est versionné dans `03_mvp/prompts/arbitrage.md`. Tu peux le tordre à
ta sauce, ça reste local. Si tu veux que je récupère ta variation, tu
m'envoies un diff par mail.

### Multi-poste / fixe + portable ?

Pas en v0.5 (tout reste local-poste). En V1 (T4 2026), les données passent
sur Postgres Supabase EU et tu peux te connecter depuis n'importe quel
poste avec OAuth Microsoft. Si c'est bloquant pour toi, dis-le moi —
c'est un signal fort sur le timing V1.

### J'ai un Mac / Linux

Pas en v0.5 (Windows + Outlook desktop only). En V2 (T1-T2 2027) → PWA
mobile + offline cross-OS via ElectricSQL. Si tu es bloqué Mac, dis-le moi,
on peut envisager un test V1 web seul (sans Outlook desktop, juste Graph
API mail).

### Quelle est la prochaine étape si ça me plaît ?

Trois portes (cf. *PITCH-ONEPAGE.md* §CTA) :

1. **Pilote V1 (T3-T4 2026)** — 2-3 CEO pairs ETIC valident la bascule
   cloud avant ouverture plus large. Tu m'écris, on en discute.
2. **Investir early V1 → V3** — trajectoire 18 mois cadrée dans
   *BUSINESS-CASE.md*, ouverture commerciale post-V2.
3. **Tester en silence pendant 30 jours et me redonner ton verdict** —
   c'est ce que je préfère.

---

## 6 · Annexe — fichiers utiles

| Fichier | Pour quoi faire |
|---|---|
| `03_mvp/README.md` | Rappel structure projet et commandes dev |
| `03_mvp/prompts/arbitrage.md` | Prompt système (lisible, modifiable) |
| `03_mvp/data/emails-summary.json` | Tes mails normalisés (à inspecter / supprimer librement) |
| `03_mvp/data/decisions.json` | Tes arbitrages successifs (mémoire courte) |
| `00_BOUSSOLE/CHANGELOG.md` | Ce qui change à chaque version |
| `04_docs/SPEC-TECHNIQUE-FUSION.md` | Architecture complète si tu veux creuser |

---

## 7 · Quand ça coince

Trois numéros à composer dans cet ordre :

1. **Console : `Get-Service "aiCEO Agent"`** — si Stopped, relance avec
   `Start-Service "aiCEO Agent"`.
2. **Logs : `C:\aiCEO\03_mvp\logs\agent.log`** — la dernière erreur est
   en bas. Tu m'envoies les 30 dernières lignes par mail.
3. **Moi** : `feycoil@etic-services.net` ou `+33 6 …` (cf. ma carte de
   visite). Je suis dispo en semaine.

---

*Bon test. Tu me diras franchement ce que tu en penses — y compris « ça
ne sert à rien pour moi », c'est exactement le retour qui aide à cadrer
la suite.*

— **Feycoil Mouhoussoune** · CEO ETIC Services · `feycoil@etic-services.net`
