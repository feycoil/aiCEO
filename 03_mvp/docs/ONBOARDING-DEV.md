# ONBOARDING-DEV — aiCEO MVP (v0.4 vivant + v0.5 en cours)

*Cible : dev fullstack rejoignant l'équipe v0.5 (premier jour → productif à J+2).*

Ce document complète `../README.md` côté **usage produit** et pointe vers `../../04_docs/SPEC-TECHNIQUE-FUSION.md` pour l'**architecture cible v0.5**. Il ne duplique ni l'un ni l'autre : il ajoute le parcours d'installation + les conventions d'équipe.

> **Source canonique architecture** : `04_docs/SPEC-TECHNIQUE-FUSION.md` (schéma SQLite, API REST, découpage modules). Ce fichier pointe vers elle, ne la réécrit pas.
>
> **Source canonique ops** : `./RUNBOOK-OPS.md` (modes de panne + remèdes).

---

## 1. Pré-requis poste

| Requis | Version | Vérification |
|---|---|---|
| **Node.js** | 20.x (LTS) | `node --version` → `v20.x.x` |
| **npm** | ≥ 10 (fourni avec Node 20) | `npm --version` |
| **Git** | ≥ 2.40 | `git --version` |
| **Outlook Desktop** | installé, profil actif | pour l'import COM v0.4 (facultatif en dev) |
| **PowerShell** | 5.1+ (Windows par défaut) | pour `scripts/fetch-outlook.ps1` |
| **Clé Anthropic API** | sk-ant-… | facultatif (mode démo sans) |
| **Éditeur** | VS Code recommandé | extensions : ESLint, Prettier |

Sous réseau ETIC : prévoir `HTTPS_PROXY` + `NODE_EXTRA_CA_CERTS` (voir `../README.md` §"Réseau d'entreprise").

---

## 2. Premier démarrage (15 min)

```bash
# 1. Cloner le repo
git clone git@github.com:feycoil/aiCEO.git
cd aiCEO/03_mvp

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# éditer .env → ANTHROPIC_API_KEY (facultatif, mode démo sans)

# 4. Démarrer le serveur
node server.js
# → aiCEO MVP démarré sur http://localhost:4747

# 5. Ouvrir dans le navigateur
# http://localhost:4747             → arbitrage matinal
# http://localhost:4747/evening     → boucle du soir
```

**Si le serveur ne démarre pas** → voir `./RUNBOOK-OPS.md` §"Serveur qui refuse de démarrer".

**Pas de données ?** Faire `npm run seed` une fois pour charger le jeu de démo (tâches/projets/contacts).

---

## 3. Structure du repo (vue 30 sec)

```
03_mvp/
├── README.md                     usage produit (tu es dev → tu lis aussi)
├── docs/
│   ├── ONBOARDING-DEV.md         ← tu es ici
│   ├── RUNBOOK-OPS.md            modes de panne + remèdes
│   └── openapi.yaml              spec formelle API REST (produit S2 plan audit)
├── server.js                     Express · port 4747 · point d'entrée
├── src/                          8 modules métier (voir §4)
├── scripts/                      fetch-outlook.ps1, normalize-emails.js, seed
├── public/                       UI statique (index.html, evening.html, assets)
├── data/                         *.json générés (jamais commités, voir .gitignore)
└── package.json
```

**Spec cible v0.5** : le dossier SQLite `data/aiceo.db` remplacera les `*.json` séparés. Voir `../../04_docs/SPEC-TECHNIQUE-FUSION.md` §5 pour le schéma complet des 13 tables.

---

## 4. Les 8 modules `src/` (ordre de lecture)

| # | Module | Rôle | Tu touches quand… |
|---|---|---|---|
| 1 | **`anthropic-client.js`** | factory SDK Claude (proxy, cert racine, timeout) | tu ajoutes un nouvel appel LLM |
| 2 | **`prompt.js`** | system prompt d'arbitrage (REPORTER sans plafond) | tu ajustes les règles métier du prompt |
| 3 | **`llm.js`** | wrapper Claude API + fallback démo | tu ajoutes un nouveau type d'appel |
| 4 | **`arbitrage.js`** | orchestration matin (charge tâches → prompt → parse → persist) | tu ajoutes un critère d'arbitrage |
| 5 | **`drafts.js`** | brouillons mails de délégation + résolution contacts | tu touches la génération de mails |
| 6 | **`evening.js`** | boucle du soir : debrief + résumé local (pas de LLM) | tu changes la logique du soir |
| 7 | **`emails-context.js`** | digest mails + signaux par tâche, injecté dans le prompt | tu enrichis le contexte email |
| 8 | **`json-robust.js`** | lecteur/écrivain JSON tolérant au padding NUL OneDrive | tu ne devrais pas toucher (stable) |

Le point d'entrée `server.js` monte les routes Express et délègue à ces modules. Lis-le en **3ᵉ** après `../README.md` et ce fichier.

---

## 5. Commandes npm utiles

```bash
node server.js             # démarre le serveur (pas de hot-reload pour l'instant)
npm run seed               # recharge data/seed.json depuis ../01_app-web/assets/data.js
npm run check              # node --check sur tous les src/*.js (syntaxe)
npm run check:public       # node --check sur tous les scripts public/

# Import Outlook (Windows + Outlook ouvert)
powershell -ExecutionPolicy Bypass -File scripts/fetch-outlook.ps1
node scripts/normalize-emails.js

# Pour tester sans Outlook
node scripts/seed-emails-demo.js   # génère 11 emails fictifs cohérents
```

Tests automatisés : arrivent en v0.5 (Vitest unit + Playwright e2e, voir `SPEC-TECHNIQUE-FUSION.md` §9 "Plan de tests").

---

## 6. Conventions de code (équipe 2026)

**Style**
- Vanilla JS côté client (pas de framework). Pas de refactor SolidJS maintenant (F17 muté, voir ADR Fusion).
- Node 20 côté serveur. ESM natif (`"type": "module"` dans package.json) — pas de CommonJS sauf librairie legacy.
- Indentation : 2 espaces.
- Pas de semi-colons finaux (convention existante du repo).

**Nommage fichiers**
- `kebab-case.js` pour les modules : `emails-context.js`, `json-robust.js`.
- `PascalCase.js` nulle part — pas de classes exportées.

**Commits**
- Format court : `fix(arbitrage): REPORTER absorbe maintenant toutes les tâches`
- Préfixes courants : `fix`, `feat`, `refactor`, `docs`, `chore`, `test`, `infra`.
- Référence d'issue GitHub en fin si applicable : `(#42)`.

**Branches**
- `main` protégée (pas de push direct).
- `feat/<scope>-<short-desc>` pour une feature.
- `fix/<scope>-<short-desc>` pour un bug.
- Merge par **squash merge** (un seul commit par PR dans main).

**Revue de code**
- Minimum 1 relecteur. En équipe 2 → auto-revue + lecture croisée quotidienne.
- Pas de PR > 400 lignes modifiées sans découpage préalable.

**Tests**
- v0.4 actuel : pas de tests automatisés, validation manuelle via `npm run check` + lancement local + QA du matin.
- v0.5 cible : couverture Vitest ≥ 70 % sur `src/`, e2e Playwright pour les 3 flux critiques (matin, délégation, soir).

---

## 7. Flux de développement type (cas réel)

**Scénario** : ajouter un critère "âge moyen des mails non lus" dans le prompt d'arbitrage.

1. Créer une branche : `git checkout -b feat/arbitrage-email-age`
2. Modifier `src/emails-context.js` pour calculer l'âge moyen par tâche.
3. Enrichir le digest dans `src/emails-context.js` (champ `avgAgeUnread`).
4. Ajouter le champ dans le prompt `src/prompt.js` §"Signaux par tâche".
5. Tester : `node scripts/seed-emails-demo.js && node server.js` → rejouer l'arbitrage en démo.
6. Tester en réel : relancer l'import Outlook, observer le prompt en console (log `[arbitrage] prompt envoyé : ...`).
7. `npm run check` → vert.
8. Commit : `feat(arbitrage): signal âge moyen mails non lus (#XX)`
9. Push + PR → revue croisée → squash merge.

---

## 8. Pour aller plus loin

| Besoin | Où aller |
|---|---|
| Comprendre le produit global | `../../04_docs/00-README.md` (index des 10 fascicules) |
| Architecture cible v0.5 | `../../04_docs/SPEC-TECHNIQUE-FUSION.md` |
| Spec fonctionnelle post-fusion | `../../04_docs/SPEC-FONCTIONNELLE-FUSION.md` |
| Roadmap 18 mois | `../../04_docs/08-roadmap.md` |
| Décisions structurantes | `../../00_BOUSSOLE/DECISIONS.md` |
| Mode de panne + remèdes | `./RUNBOOK-OPS.md` |
| Spec OpenAPI (à produire S2 plan audit) | `./openapi.yaml` |
| Backlog produit | GitHub Issues `feycoil/aiCEO` |

---

## 9. Questions fréquentes du premier jour

**Q. Je vois des `*.json` dans `data/` qui ne sont pas dans git. Normal ?**
R. Oui. `data/` est dans `.gitignore` — c'est l'état local du serveur (arbitrages, mails extraits, debriefs). Le seed initial se (re)crée via `npm run seed`.

**Q. L'arbitrage me dit "mode DÉMO" alors que j'ai une clé dans `.env`.**
R. Vérifie `GET /api/health` — le badge doit afficher `sonnet-4-6`. Sinon voir `./RUNBOOK-OPS.md` §"Mode démo bloqué avec une clé valide".

**Q. `npm install` explose en erreur SSL sur le réseau corp.**
R. C'est le proxy MITM. Voir `../README.md` §"Réseau d'entreprise" et `./RUNBOOK-OPS.md` §"Proxy / cert corp".

**Q. Où est le schéma SQLite ?**
R. En v0.4 il n'existe pas encore — on tourne encore sur fichiers JSON. Voir `../../04_docs/SPEC-TECHNIQUE-FUSION.md` §5 pour le schéma cible v0.5 (13 tables).

**Q. Comment j'ajoute un endpoint REST ?**
R. (1) Ajouter la route dans `server.js`, (2) créer/étendre un module `src/` pour la logique, (3) si l'endpoint est public / destiné à Claude dans Cowork, synchroniser `docs/openapi.yaml`. En v0.5 après bascule Zod, cette synchro sera automatique.

---

## 10. Maintien de ce document

Règle S6 : **maintien continu + audit trimestriel** (cohérent avec la gouvernance drafts/docs). Chaque sprint v0.5 livre une mise à jour ONBOARDING si le périmètre change (nouvelles dépendances, nouvelle commande, nouveau module `src/`). Revue systématique à chaque jalon : v0.5, V1, V2.

Si tu lis ce fichier et qu'il contient une info fausse ou obsolète, ouvre une PR `docs(onboarding): corrige X` — c'est un artefact vivant.

---

*Dernière mise à jour : 2026-04-24 · v1 · S6 atelier cohérence*
