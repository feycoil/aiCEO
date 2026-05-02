# Parcours d'initialisation aiCEO — Accompagnement dirigeant

> **Version 01/05/2026 PM** · v0.8 · Phase 1F COMPLETE
> Pour CEO qui démarre une **nouvelle installation** OU qui veut **réinitialiser** son aiCEO.

---

## TL;DR — 3 minutes pour partir d'une page blanche

```powershell
# 1. Reset complet (depuis racine du repo)
cd C:\_workarea_local\aiCEO
.\wipe-and-restart.ps1

# 2. Ouvrir le navigateur sur :
http://localhost:4747

# 3. Suivre le wizard d'onboarding (5 étapes, 3 minutes)
# 4. Aller dans /axes pour configurer ses sociétés réelles
# 5. Lancer la première sync Outlook (auto schtasks ou manuelle)
# 6. Premier Triage matin → premiers projets → auto-classification
```

---

## Étape 0 — Vider toutes les données (reset)

Trois options selon le contexte :

### Option A — Script PowerShell (recommandé pour un reset complet)

```powershell
cd C:\_workarea_local\aiCEO
.\wipe-and-restart.ps1
```

Ce script :
1. Stoppe le serveur Express (port 4747)
2. Supprime `data/aiceo.db` (+ WAL/SHM)
3. Supprime les caches Outlook (`emails.json`, `emails-summary.json`, `events.json`, etc.)
4. Re-applique toutes les migrations + seeds (8 domaines + 1 société par défaut)
5. Redémarre le serveur dans une nouvelle fenêtre

Options : `-Force` (skip confirmation), `-NoRestart` (pas de redémarrage auto).

### Option B — Endpoint REST depuis l'UI (depuis Réglages › Zone sensible)

```http
POST /api/system/wipe-data
X-Confirm-Wipe: yes-i-am-sure
Content-Type: application/json

{ "keep_seeds": true }
```

- `keep_seeds: true` (défaut) : préserve les 8 domaines et 1 société par défaut, vide tout le reste.
- `keep_seeds: false` : reset total + re-seed minimal depuis la migration.
- Vide aussi les fichiers cache Outlook sur disque.

### Option C — Manuel (pour debug)

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
# 1. Stopper le serveur
Get-NetTCPConnection -LocalPort 4747 | ForEach { Stop-Process -Id $_.OwningProcess -Force }
# 2. Supprimer base + caches
Remove-Item data\aiceo.db, data\aiceo.db-wal, data\aiceo.db-shm -ErrorAction SilentlyContinue
Remove-Item data\emails*.json, data\events.json -ErrorAction SilentlyContinue
# 3. Reinit + seeds
npm run db:reset
# 4. Redémarrer
npm start
```

---

## Étape 1 — Lancement du serveur

Si vous avez utilisé le **raccourci de démarrage automatique** (ADR S3.10 « Variante D »), le serveur est déjà actif au logon Windows. Sinon :

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm start
```

Le serveur écoute sur **http://localhost:4747** (port figé).
Première visite → redirige automatiquement vers `/v07/pages/index.html` (Cockpit) ou vers l'onboarding si la base est vide.

**Vérification rapide** :
- `http://localhost:4747/api/health` → JSON avec `ok: true` + counts à 0 si fresh install
- `http://localhost:4747/v07/pages/onboarding.html` → wizard

---

## Étape 2 — Onboarding wizard (5 étapes · 3 min)

Page : **`/v07/pages/onboarding.html`**

Les 5 étapes du wizard :

| # | Nom        | Champs                                                          | But                                              |
|---|------------|------------------------------------------------------------------|--------------------------------------------------|
| 1 | identite   | `firstName`, `lastName`, `role`                                  | Personnaliser le ton                             |
| 2 | espace     | `tenantName` (ex: « ETIC Services »)                            | Label de votre espace dans la sidebar           |
| 3 | emails     | Adresses perso à exclure du triage (ex: votre mail personnel)   | Le LLM ignorera ces senders dans Triage          |
| 4 | posture    | Style de coaching (ferme / direct / chaleureux)                 | Le ton de l'assistant LLM                        |
| 5 | recap      | Résumé + premier ping coaching                                  | Première interaction réussie                     |

**Astuce CEO** : si vous skippez l'onboarding, vous pourrez tout réajuster dans `/v07/pages/settings.html` plus tard.

---

## Étape 3 — Configurer les axes (Domaines & Sociétés)

Page : **`/v07/pages/axes.html`** (lien `Axes` dans la sidebar)

À l'arrivée, vous voyez :
- **8 domaines seedés** : Finance · Sales · Marketing · Operations · RH · Tech · Stratégie · Legal
- **1 société seedée** : « Mon entreprise » (à renommer)

**Actions à faire ici** :
1. **Renommer « Mon entreprise »** en votre vraie raison sociale (clic « Renommer »)
2. **Ajouter vos autres sociétés** si vous avez plusieurs entités (formulaire en bas, avec icône emoji + couleur)
3. *Optionnel* : ajouter ou supprimer des domaines (si vous n'avez pas de Sales par exemple)

**Pourquoi ?** Vos projets seront tagués sur 2 axes orthogonaux :
- **Domaine** = thématique (le « quoi », transverse aux entités)
- **Société** = entité juridique (le « où », typique du CEO multi-business)

Les vues dans `/projets` se basent dessus.

---

## Étape 4 — Première sync Outlook

Deux options :

### Auto (recommandé) — schtasks toutes les 2h

Si vous avez exécuté `scripts/install-outlook-sync.ps1` lors de l'install, une tâche planifiée Windows nommée `aiCEO-Outlook-Sync` synchronise vos emails toutes les 2h sans intervention.

### Manuelle — pour la première sync immédiate

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
.\scripts\sync-outlook.ps1
```

Cette commande :
1. Lance `fetch-outlook.ps1` (COM Outlook desktop) → récupère les 15 derniers jours d'emails dans `data/emails.json`
2. Lance `normalize-emails.js` → ingère dans la table SQLite `emails` (idempotent)
3. Met à jour `data/emails-summary.json` (mtime utilisé par le KPI « dernière sync »)

**Vérification** : `http://localhost:4747/api/system/last-sync` → niveau `ok` si moins de 4h.

---

## Étape 5 — Premier Triage matin (le rituel-clé)

Page : **`/v07/pages/arbitrage.html`**

Le matin (ou tout de suite après votre 1re sync), lancez le Triage :

1. **Bandeau Claude** affiche les emails non lus / flagged / récents (top ~20)
2. Pour chaque email, **3 verdicts proposés par Claude** (LLM) :
   - **Action** → crée une tâche dans `/taches`
   - **Décision** → crée une décision ouverte dans `/decisions`
   - **Big Rock** → ajoute aux 3 priorités hebdo dans `/revues`
   - **Info** → contexte projet (pas d'action)
   - **Rejeter** → l'email est ignoré (le LLM apprend pour la prochaine fois)
3. **Auto-création de projets** : si un email mentionne un projet inconnu, un projet est créé automatiquement (heuristique sur `inferred_project`)
4. **Auto-création de contacts** : senders ≥3 emails deviennent contacts

À la fin du Triage : votre cockpit se peuple, des projets apparaissent dans `/projets`.

---

## Étape 6 — Auto-classification des projets créés

Page : **`/v07/pages/axes.html`** → bouton **« Lancer la classification »**

Les projets créés au Triage n'ont **ni domaine ni société**. Le bouton fait :

1. **Preview** : analyse name + tagline + description de chaque projet, propose un domaine via heuristique mots-clés (ex: « tresorerie » → Finance, « CTO » → RH, « hopital sud » → Sales)
2. **Confirmation** : popup listant les 5 premières propositions
3. **Apply** : PATCH chaque projet avec son `domain_id`

Bouton voisin **« Rattacher tous »** : assigne **votre société par défaut** à tous les projets sans société (avec choix multi-société si vous en avez plusieurs).

**Résultat** : dans `/projets`, le toggle « Par société » et « Par domaine » montre désormais des sections non vides.

---

## Étape 7 — Premier rituel hebdo (Weekly Sync)

Page : **`/v07/pages/revues.html`**

1. Cliquez **« Démarrer la revue de la semaine »**
2. Définissez vos **3 Big Rocks** (priorités hebdomadaires)
3. Auto-suggestion LLM disponible : Claude propose 3 Big Rocks basés sur vos décisions ouvertes + projets hot
4. À la fin de la semaine : retour pour bilan (accompli / raté / reportée)

---

## Étape 8 — Premier rituel soir (Bilan)

Page : **`/v07/pages/evening.html`**

Chaque soir (5 min) :
1. Humeur (1-5)
2. Énergie (1-5)
3. Top 3 du jour (texte libre)
4. Streak hebdo affiché

Construit votre Trajectoire (page `/v07/pages/trajectoire.html`) sur la durée.

---

## Carte mentale de l'init (pour le coaching dirigeant)

```
┌─────────────────────────────────────────────────────────────────┐
│  RESET (optionnel) → wipe-and-restart.ps1                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  CONFIGURATION INITIALE (5 min)                                │
│  1. Onboarding wizard (5 étapes)                               │
│  2. /axes → renommer société + ajouter les autres              │
│  3. Sync Outlook (manuelle ou auto schtasks)                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PREMIER USAGE (15 min — démontre la valeur)                   │
│  4. Triage matin → emails analysés → projets/actions/décisions │
│  5. /axes auto-classify → projets rattachés sur 2 axes         │
│  6. /projets → vue Tableau pour scan rapide                    │
│  7. Première Weekly Sync → 3 Big Rocks                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  RYTHME QUOTIDIEN (entrer dans la routine)                     │
│  • Matin : Triage 5 min                                        │
│  • Décisions du jour : Cmd+K → "trancher"                      │
│  • Soir : Bilan 5 min (humeur, énergie, top 3)                 │
│  • Vendredi : Weekly Sync (10 min)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conseils d'accompagnement (pour celui qui assiste le CEO)

### Avant la session de mise en route

- Vérifier qu'**Outlook Desktop est installé et configuré** (avec son compte pro principal)
- Vérifier la **clé API Anthropic** dans `.env` (sinon mode dégradé rule-based)
- Avoir le mot de passe Windows pour les schtasks (sans admin requis si Variante D)

### Pendant la session

- **Ne pas faire à sa place** : lui laisser cliquer sur les boutons, taper son prénom, choisir ses sociétés
- **Insister sur `/axes`** : c'est là que sa structure d'entreprise est encodée. 5 minutes investies = des mois de classification automatique correcte.
- **Faire le 1er Triage avec lui** : c'est le rituel le plus important. Lui montrer comment Claude justifie ses propositions, comment lui peut « Rejeter » sans culpabiliser.
- **Lui faire faire** son **premier Bilan du soir** ou **première Weekly Sync** AVANT de partir. La 1re fois est la plus dure (page blanche). Les suivantes seront fluides.

### Après la session

- 1er suivi à J+3 : « Tu as fait combien de Triages ? Combien de Décisions tranchées ? »
- 1re revue à J+7 : ouvrir `/trajectoire` ensemble pour voir le récit Claude
- Ajustements probables : tons coaching, sociétés à renommer, domaines à supprimer si non utilisés

### Pièges connus

| Symptôme                                  | Cause / Solution                                     |
|-------------------------------------------|------------------------------------------------------|
| Page Axes blanche                         | Ctrl+F5 (cache navigateur sur les anciens stores)    |
| Triage ne montre pas d'emails             | Sync Outlook absente — voir Étape 4                  |
| Tous les projets « Sans domaine »         | Lancer auto-classification dans `/axes`              |
| Mode fallback rule-based partout          | `ANTHROPIC_API_KEY` absente du `.env`                |
| Erreur EBUSY: aiceo.db                    | Process node fantôme — `Get-NetTCPConnection 4747`  |
| Le Cockpit reste vide                     | Pas encore de Triage fait → pas de big rocks/tasks   |

---

## Checklist GO du CEO (validation après init)

- [ ] Onboarding terminé, mon prénom apparaît dans la sidebar
- [ ] Mes sociétés sont configurées dans `/axes` (au moins 1, maximum 5 idéalement)
- [ ] Outlook a synchronisé au moins une fois (vérification : `/api/system/last-sync` `level: ok`)
- [ ] J'ai fait mon premier Triage et des projets sont apparus
- [ ] J'ai lancé l'auto-classification → mes projets ont chips colorées dans `/projets`
- [ ] J'ai testé la vue **Tableau** dans `/projets` (compacte pour scan rapide)
- [ ] J'ai défini mes 3 Big Rocks de la semaine dans `/revues`
- [ ] J'ai fait un Bilan du soir au moins une fois
- [ ] L'assistant Claude répond avec contexte sur mes projets (test : ouvrir un projet, cliquer « Demander à Claude »)

**Si 8/9 cases cochées → vous êtes opérationnel.**

---

*Doc maintenue dans `04_docs/PARCOURS-INIT-CEO.md`. Mise à jour à chaque évolution structurelle de l'init.*
