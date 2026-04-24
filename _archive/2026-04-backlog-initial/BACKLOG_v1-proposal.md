# BACKLOG v1 — proposition (Option 2, reconstruit)

**Date** : 2026-04-24
**Statut** : DRAFT — à comparer avec `04_docs/09-backlog.xlsx` avant création des issues GitHub
**Base** : 120 todos réalisés + roadmap interactive + docs produit + décisions consignées

---

## Structure

- **Milestones GitHub** : `v0.4` (✅ shipped), `v0.5`, `v0.6`, `v1.0`, `v2.0`
- **Labels lane** : `lane/app-web`, `lane/mvp`, `lane/design-system`, `lane/docs`, `lane/infra`
- **Labels type** : `type/feat`, `type/fix`, `type/chore`, `type/docs`, `type/research`
- **Labels priorité** : `prio/P0` (bloquant), `prio/P1` (haute), `prio/P2` (moyenne), `prio/P3` (basse)

---

## Milestone v0.5 — Stabilisation MVP (4-6 sem)

**Objectif** : rendre le MVP utilisable tous les matins sans bug, avec persistance et monitoring.

| # | Titre | Lane | Type | Prio |
|---|---|---|---|---|
| 1 | Installer le MVP comme service Windows (auto-start au login) | mvp | feat | P1 |
| 2 | Persistance de l'historique des arbitrages (JSON dated par jour) | mvp | feat | P1 |
| 3 | Re-scan Outlook incrémental (since last-sync, pas 30j à chaque fois) | mvp | feat | P1 |
| 4 | Compteur de coût API Anthropic (jour + mois en cours) dans evening.html | mvp | feat | P2 |
| 5 | Tests unitaires `llm.js` (mocks API + retries + proxy) | mvp | chore | P2 |
| 6 | Tests unitaires `drafts.js` (qualité des brouillons) | mvp | chore | P2 |
| 7 | Bouton "Synthèse de la semaine" dans evening.html (lundi matin) | mvp | feat | P2 |
| 8 | Logging structuré (fichier rotatif, pas console uniquement) | mvp | chore | P2 |
| 9 | Fix : resélection des tâches différées après reload | mvp | fix | P1 |
| 10 | Améliorer inférence projet : viser <20% d'erreurs (vs 30% actuel) | mvp | feat | P2 |

## Milestone v0.6 — Enrichissement IA + UX (6-8 sem)

**Objectif** : le MVP devient un vrai copilote, pas juste un arbitre.

| # | Titre | Lane | Type | Prio |
|---|---|---|---|---|
| 11 | Intégrer calendrier Outlook dans l'arbitrage (RDV du jour visibles) | mvp | feat | P1 |
| 12 | Mode "focus" (timer pomodoro + silence notifications) dans app web | app-web | feat | P2 |
| 13 | Drag & drop inter-quadrants dans vue Eisenhower (`taches.html`) | app-web | feat | P2 |
| 14 | Rapport hebdo auto-généré par Claude (remplace revue manuelle) | mvp | feat | P1 |
| 15 | Export PDF d'une revue hebdo (pour archive ou partage) | app-web | feat | P3 |
| 16 | i18n fr/en (préparer ouverture future) | app-web | chore | P3 |
| 17 | Streaks + badges (layer gamification léger, activable/désactivable) | app-web | feat | P3 |
| 18 | "Mode mémoire longue" : Claude se souvient des préférences semaine après semaine | mvp | research | P2 |
| 19 | Widget hebdo pour Outlook (rappel matin du dashboard) | mvp | feat | P3 |
| 20 | Auto-détection des engagements pris dans les mails (`drafts.js`) | mvp | feat | P2 |

## Milestone v1.0 — Fusion app web + MVP (8-12 sem)

**Objectif** : une seule application, une seule interface, un seul backend.

| # | Titre | Lane | Type | Prio |
|---|---|---|---|---|
| 21 | Spec fonctionnelle fusion (quel workflow, quelles pages restantes ?) | docs | docs | P0 |
| 22 | Spec technique fusion (MVP devient backend de l'app web) | docs | docs | P0 |
| 23 | Migration données : app web (localStorage) → backend unifié | mvp | feat | P0 |
| 24 | API unique exposée par le backend (endpoints REST documentés) | mvp | feat | P0 |
| 25 | Auth locale (profils multi-utilisateurs si besoin plus tard) | mvp | feat | P1 |
| 26 | Persistence SQLite (au lieu de fichiers JSON isolés) | mvp | feat | P1 |
| 27 | Appliquer skin Twisty sur toutes les pages du MVP (arbitrage + soir) | design-system | feat | P0 |
| 28 | Installer comme app desktop (Electron ou Tauri) | app-web | feat | P1 |
| 29 | Tests end-to-end (Playwright ou Cypress) sur les 3 flux critiques | app-web | chore | P1 |
| 30 | Doc d'installation "non-tech" (vidéo + guide PDF) | docs | docs | P1 |
| 31 | Build distribuable Windows (`.exe` signé si possible) | mvp | chore | P1 |
| 32 | Onboarding guidé au premier lancement (tour des 5 Big Rocks) | app-web | feat | P2 |

## Milestone v2.0+ — Ouverture (horizon 2027)

**Objectif** : de produit perso à produit pour équipes.

| # | Titre | Lane | Type | Prio |
|---|---|---|---|---|
| 33 | Multi-utilisateur : équipe, rôles, permissions | mvp | feat | P1 |
| 34 | Sync cloud optionnelle (respect souveraineté : off par défaut) | mvp | feat | P1 |
| 35 | Intégration Teams / Slack (lecture + écriture) | mvp | feat | P2 |
| 36 | Intégration Notion / Airtable (bidirectionnelle) | mvp | feat | P2 |
| 37 | Mobile companion (iOS/Android, read-only dans un 1er temps) | app-web | feat | P2 |
| 38 | Marketplace de "skills" (ajouter des workflows personnalisés) | mvp | feat | P3 |
| 39 | Landing page publique (positionnement souverain, différenciation) | docs | feat | P1 |
| 40 | Modèle économique (définir : licence / abonnement / open source ?) | docs | research | P0 |
| 41 | Étude de marché (10-20 interviews utilisateurs cibles) | docs | research | P1 |
| 42 | Privacy policy + CGU (si modèle commercial) | docs | docs | P1 |

## Infra / DX (transverse, pas de milestone fixe)

| # | Titre | Lane | Type | Prio |
|---|---|---|---|---|
| 43 | CI GitHub Actions : lint (eslint) + format (prettier) + audit (npm audit) | infra | chore | P1 |
| 44 | Dependabot activé pour dépendances node | infra | chore | P1 |
| 45 | Refactor `01_app-web/assets/app.js` : séparer en modules (cockpit, tâches, etc.) | app-web | chore | P2 |
| 46 | Audit dépendances MVP : supprimer celles non utilisées (`depcheck`) | mvp | chore | P2 |
| 47 | Enrichir `README.md` racine : getting started + schéma architecture | docs | docs | P1 |
| 48 | Créer `CONTRIBUTING.md` (conventions commits, branches, reviews) | docs | docs | P2 |
| 49 | Branches strategy : définir workflow (trunk vs gitflow) | docs | docs | P2 |
| 50 | Sécuriser `.env` : rappel dans `00_BOUSSOLE/GOUVERNANCE.md` | docs | docs | P1 |

## Dette technique identifiée

| # | Titre | Lane | Type | Prio |
|---|---|---|---|---|
| 51 | `app.js` monolithique (2800+ lignes) → découper en modules ES | app-web | chore | P2 |
| 52 | Décider TypeScript ou non (selon complexité future) | app-web | research | P3 |
| 53 | Harmoniser nommage : `data.js` app-web ≠ `data.js` DS (dédupliquer ou expliciter) | design-system | chore | P2 |
| 54 | Normaliser les couleurs Twisty en variables CSS (certaines sont en hex inline) | design-system | chore | P2 |
| 55 | Couvrir les cas d'erreur réseau dans `llm.js` (timeouts, 429, 500) | mvp | fix | P1 |

---

## Récapitulatif

- **55 items** identifiés
- **Répartition par milestone** : 10 v0.5 · 10 v0.6 · 12 v1.0 · 10 v2.0 · 13 transverse/dette
- **Répartition par lane** : `mvp` 21 · `app-web` 13 · `docs` 10 · `design-system` 5 · `infra` 6

## À comparer avec `04_docs/09-backlog.xlsx`

Attendu pour vérification :
1. Exporter le xlsx en CSV → Cowork lit la version à plat
2. Diff automatique :
   - ❶ Items du xlsx **absents** ici → ajouter au backlog final
   - ❷ Items **ici** mais **pas** dans le xlsx → valider qu'ils sont pertinents
   - ❸ Items **communs** → OK, garder
3. Backlog final = union nettoyée
4. Script `gh issue create` généré

---

*Document volatile à archiver dans `_archive/2026-04-backlog-initial/` une fois les issues créées.*
