# aiCEO MVP — Copilote exécutif local

Trois flux qui tournent en local sur votre poste :

| Flux | URL | Rôle |
|---|---|---|
| **Arbitrage matinal** | `http://localhost:3001/` | Chaque matin, Claude propose Faire / Déléguer / Reporter à partir de vos tâches |
| **Brouillon de délégation** | bouton "✉ Voir brouillon" | Génère un mail prêt-à-envoyer (destinataire + objet + corps) |
| **Boucle du soir** | `http://localhost:3001/evening` | 2 min pour dire ce qui a été fait — alimente l'apprentissage |

Les données restent sur votre poste sauf le texte envoyé à Claude pour raisonner.

> 📚 **Référence API REST complète** : voir [`docs/API.md`](docs/API.md) — tous les endpoints (cockpit, tasks, decisions, contacts, projects, groups, events, arbitrage, evening) avec exemples curl, codes HTTP et variables d'environnement.

---

## Démarrage en 3 commandes

```bash
cd aiCEO_Agent/mvp
npm install            # première fois uniquement
node server.js         # démarre → http://localhost:3001
```

Sous Windows : double-clic sur `start.bat` (voir `DEMARRER-WINDOWS.md`).

**Sans clé API**, le MVP tourne en **mode démo** (arbitrage + brouillons pré-bakés, utile pour voir l'UI).
**Avec clé API**, il appelle Claude Sonnet 4.6 en réel.

---

## Brancher Claude (5 minutes)

1. Créez une clé API sur [console.anthropic.com](https://console.anthropic.com/)
2. Copiez `.env.example` en `.env` et collez la clé :

   ```
   ANTHROPIC_API_KEY=sk-ant-votreclé
   ANTHROPIC_MODEL=claude-sonnet-4-6
   ```

3. Redémarrez `node server.js` — le badge passe de "DÉMO" à "sonnet-4-6".

Coût indicatif observé en production (run réel 24/04/2026, 28 tâches + 926 mails injectés) : ≈ 1,0 ct pour l'arbitrage (5,2 k tokens in / 2,5 k out) + ≈ 0,2 ct par brouillon de délégation. Budget quotidien ≈ 1,5 ct.

### Réseau d'entreprise (proxy MITM)

Si votre poste passe par un proxy corp (Zscaler, Squid, etc.) avec interception SSL :

```
HTTPS_PROXY=http://proxy.etic-services.net:3128
NODE_EXTRA_CA_CERTS=C:\chemin\vers\cert-racine-corp.crt
```

Le wrapper `src/anthropic-client.js` détecte `HTTPS_PROXY` et route le SDK Anthropic via `https-proxy-agent` automatiquement. Un log `[llm] proxy actif : …` confirme la prise en compte au démarrage.

---

## Flux d'usage quotidien

**Matin (2 min)**
1. Ouvrez `http://localhost:3001`
2. Cliquez **Lancer l'arbitrage** → Claude classe **toutes** vos tâches ouvertes : 3 FAIRE max, 2 DÉLÉGUER max, **REPORTER absorbe tout le reste** (pas de limite haute — 0 tâche perdue)
3. Reshuffle par drag & drop si besoin
4. **Valider l'arbitrage** → figé dans `data/decisions.json`

**Sur la colonne Déléguer**
- Cliquez **✉ Voir brouillon** sur une carte
- Claude rédige le mail avec le contact rattaché au projet pré-sélectionné
- Vous éditez le destinataire / objet / corps à la volée
- **Copier** (presse-papier), **Enregistrer** (log local) ou **Envoyer via Outlook** (mailto: qui ouvre votre client mail avec tout pré-rempli)

**Soir (2 min)** — `http://localhost:3001/evening`
- Reprend l'arbitrage validé du matin
- Pour chaque item : **Fait / Partiel / Pas fait** + note facultative
- Énergie (1-5) + humeur en un mot
- **Clore la journée** → résumé texte, signal si surchauffe détectée

---

## Ingestion Outlook (30 derniers jours)

Deux approches selon votre contexte.

### Option A — COM Outlook (pas d'Azure, pas d'OAuth)

**Prérequis** : Outlook installé et ouvert sur le poste.

```powershell
# Extraction brute (inbox + envoyés, 30 jours)
cd aiCEO_Agent\mvp
powershell -ExecutionPolicy Bypass -File scripts\fetch-outlook.ps1

# Normalisation + filtrage bruit + inférence projet
node scripts\normalize-emails.js
```

Résultat : `data/emails.json` (mails utiles) + `data/emails-summary.json` (stats par expéditeur, par projet, par jour).

Endpoint de vérification : `GET /api/emails/summary`.

### Contexte email dans l'arbitrage

Une fois les emails normalisés, ils sont **automatiquement injectés dans le prompt d'arbitrage** :
- Digest global (volume 30j, non lus, top expéditeurs, volume par projet)
- Signal par tâche (7 derniers jours) : nb de mails, non lus, **relances des contacts rattachés**, dernier sujet reçu
- Règle Claude : "N relances contact ≥ 2" → la tâche monte en FAIRE/DÉLÉGUER

Les cartes de l'arbitrage affichent une chip coral quand il y a pression (≥ 2 relances ou ≥ 3 non lus), sinon une chip bleue calme avec le nombre.

Pour tester sans Outlook : `node scripts/seed-emails-demo.js` — génère 11 emails fictifs cohérents (Marie Ansquer sur amani-credit, Bénédicte sur amani-chantier…).

### Option B — Microsoft Graph (à venir post-MVP)

Nécessite enregistrement Azure AD — plus puissant mais plus long à mettre en place. Voir `docs/06-architecture.md` pour la cible.

---

## Rafraîchir les tâches

Les tâches sont tirées de `../assets/data.js` (votre app aiCEO existante).

```bash
npm run seed           # ou bouton "↻ Recharger données" dans l'UI
```

---

## Architecture

```
server.js                     Express · port 3001
├── GET  /api/health          mode démo ou réel, modèle actif
├── GET  /api/tasks           tâches + projets + events + contacts
├── POST /api/arbitrage       appelle Claude → 3/2/3
├── POST /api/decide          persiste un arbitrage validé
├── GET  /api/history         historique arbitrages
├── POST /api/reseed          relit ../assets/data.js
├── POST /api/delegate        génère un brouillon pour un task_id
├── POST /api/delegate/save   archive un brouillon édité
├── GET  /api/delegate/history
├── GET  /api/evening/context reprend l'arbitrage du jour + tâches
├── POST /api/evening         persiste debrief + produit résumé
├── GET  /api/evening/history
└── GET  /api/emails/summary  stats mails (si normalisés)

src/
├── anthropic-client.js       factory SDK Claude (proxy + NODE_EXTRA_CA_CERTS)
├── prompt.js                 system prompt arbitrage (REPORTER sans plafond)
├── llm.js                    wrapper Claude API + démo (max_tokens 4096)
├── arbitrage.js              orchestration matin
├── drafts.js                 brouillons mails + résolution contacts
├── evening.js                boucle du soir + résumé local
└── emails-context.js         digest + signaux par tâche (branché dans prompt)

scripts/
├── extract-data.js           data.js browser → seed.json
├── fetch-outlook.ps1         Outlook COM → emails-raw.json (30 jours)
├── normalize-emails.js       raw → emails.json (filtre bruit)
└── seed-emails-demo.js       génère un set d'emails démo sans Outlook

data/                         tous les fichiers générés
├── seed.json                 état courant (tâches, projets, events, contacts)
├── decisions.json            historique arbitrages du matin
├── drafts.json               brouillons mails sauvés
├── evenings.json             debriefs du soir
├── emails-raw.json           export Outlook brut (si scripté)
├── emails.json               emails utiles après filtrage
└── emails-summary.json       stats agrégées

public/
├── index.html                UI matin — 3 colonnes + modal brouillon
└── evening.html              UI soir — cases Fait/Partiel/Pas fait
```

---

## Prochaines étapes

| Priorité | Livrable |
|----------|----------|
| ✅ | Arbitrage matinal 3 colonnes + drag & drop |
| ✅ | Flux Déléguer : brouillon mail + destinataire + mailto |
| ✅ | Boucle du soir : capture Fait/Partiel/Pas fait + résumé |
| ✅ | Import Outlook PowerShell 30 jours + normalisation (926 mails utiles sur 3 comptes) |
| ✅ | Brancher les emails dans le prompt arbitrage (contexte enrichi) |
| ✅ | Support proxy corp HTTPS_PROXY + MITM cert (factory Anthropic) |
| ✅ | Run réel end-to-end 24/04/2026 — 28/28 tâches classées, 41 s, ≈ 1,5 ct |
| ⏳ | Démarrage automatique au login Windows (scheduled task) |
| ⏳ | Auto-sync Outlook toutes les 2 h (plus de PS1 manuel) |
| ⏳ | Envoi natif via Microsoft Graph (fin des mailto:) |
| ⏳ | Mémoire : Claude apprend de vos patterns (reports chroniques, perfectionnisme) |
| ⏳ | Vue historique drafts + debriefs (page `/archives`) |

---

## Mode démo

Arbitrage pré-baked dans `src/llm.js` → `DEMO_FALLBACK`. Brouillons générés localement par `src/drafts.js` → `demoFallbackDraft`. Le debrief du soir n'utilise jamais de LLM : le résumé est calculé localement.

Utile pour :
- Tester l'UI sans consommer d'API
- Démontrer le concept sans clé Claude
- Développer offline

---

*Copilote aiCEO · v0.5 · 2026-04-25 — Sprint S2 livré (cockpit + arbitrage + evening + tâches Eisenhower + migration vérifiée + doc API)*
