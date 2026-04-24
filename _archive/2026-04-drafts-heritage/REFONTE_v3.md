# aiCEO v3 — Refonte complète (23 avril 2026)

> **ARCHIVÉ 2026-04-24** — ce document décrit l'itération v3 (localStorage-only, 3 groupes, cockpit, copilote `assistant.html`). Superseded par les fascicules `04_docs/01` à `04_docs/08` + `SPEC-FONCTIONNELLE-FUSION.md` + `SPEC-TECHNIQUE-FUSION.md`. Voir `README.md` de ce dossier pour le contexte d'archivage. Ne pas réutiliser comme source de vérité.

---

Réponse à l'audit sans concession : chaque remarque adressée, app restructurée autour de 3 groupes et d'un copilote IA.

## Ce qui change fondamentalement

### 1. Organisation par 3 groupes
Navigation primaire + thème couleur + filtre de scope global (tous les écrans obéissent) :
- **Adabu Holding** (bleu nuit) — IT, Data, Telecom, FEIRASIN
- **Groupe AMANI** (terracotta) — Hôtellerie, F&B, Spa
- **Terres Rouges** (ocre) — Family Office, SCI, Invest

Un **group-switcher** en bas du sidebar permet de basculer le contexte ; `groupes.html` offre la vue portefeuille cumulée.

### 2. Cockpit temps réel (ex-Dashboard)
`index.html` repensé avec :
- **Focus Now** (carte noire, pulse animée) — la prochaine action critique avec son contexte complet (projet, groupe, estimé, énergie, échéance, disponibilité IA)
- **Workload meter** — charge estimée J + charge 7 j + nombre de propositions IA
- **Pulse des 3 groupes** — KPIs par groupe en cliquable
- **Intention S17 + Big Rocks** tirés de `AICEO.REVIEWS[current]` (plus de hardcoded dans le HTML)
- **Top 3 propositions IA** inline
- **Priorités du jour** + prochains RDV + projets chauds

### 3. Copilote IA (`assistant.html`)
Nouvelle page dédiée. 9 propositions seedées, classées par type :
- ✉️ Brouillons mail (relance Affejee, confirmation CA Bretagne, relance climatisation)
- 📋 Préparations réunion (RV matériaux Mayotte, Comité Adabu)
- ✓ Création de tâches depuis events (détection auto prep_needed)
- ⚖️ Rééquilibrage charge (alerte mercredi 29/04 saturé)
- ⚙️ Automatisations (BC fournisseurs récurrents)
- 📝 Synthèses (décisions à exécuter cette semaine)

Chaque proposition : rationale, preview, Accepter/Copier/Ignorer. États persistés. Roadmap copilote affichée.

### 4. CRUD complet
Tâches : création (FAB + touche **N** + quick-add modal), édition, suppression, reprogrammation.
Décisions : création via modale, bascule statut to-execute → executed en un clic.
Tout persisté dans `localStorage.aiCEO.store.v1`.

### 5. Tâches enrichies
Chaque tâche porte désormais :
- `estimatedMin` (5-90 min)
- `energy` (léger/moyen/deep)
- `aiCapable` + `aiProposal` (l'IA peut aider + quoi proposer)
- `context` (deep-work/email/meeting/phone)

Nouvelle vue **Timeline** dans `taches.html` : organise ta journée par énergie (matin=deep, midi=moyen, soir=quick wins).

### 6. Pages projet différenciées
Widgets spécifiques par groupe :
- **Adabu** : roadmap tech, KPI SLA, prochains jalons
- **AMANI** : timeline chantier (Cadrage→Structure→FF&E→Ouverture) + contraintes BREEAM
- **Terres Rouges** : tableau bord juridique & financier, exposition, prochain rdv clé

### 7. Quick-Add global
- Touche **N** depuis n'importe quelle page
- FAB flottant (bouton + en bas à droite)
- 10 champs pré-remplis, toggle pour type Eisenhower / priorité / énergie

### 8. Agenda enrichi
- Vue **Cette semaine** (grille 7 jours avec workload bar par jour)
- Vue **Liste** (chronologique)
- Vue **Historique** (rdv passés)
- Chaque event : durée, lieu, prep_needed, nb attendees
- Badge "Connexion Outlook à configurer" (honnêteté produit)

### 9. Revues multi-semaines
- 4 semaines : **W15 archivée, W16 archivée, W17 courante, W18 à préparer**
- Génération automatique de la revue S18 à partir des tâches/events S18 + prep_needed
- Big Rocks proposés par l'IA à valider dimanche

### 10. Contacts complétés
- Téléphones ajoutés (100% couverture)
- Emails : 22/22 couverts
- Boutons Écrire / Appeler / Résumé IA

### 11. Infrastructure
- Export JSON complet (`A.exportJSON()`)
- Persistance étendue (tâches + décisions + propositions + scope actif)
- `A.TASKS_ALL()` merge base + added - deleted + edited
- CSS enrichi : 834 lignes, focus-now, workload, ai-card, modal, formulaires, FAB, print styles
- A11y préservée (skip-link, aria, focus ring, reduced-motion, forced-colors)

## Volumes

- **3 groupes** · **9 projets** (Adabu 3, AMANI 1, Terres Rouges 5) · **26 tâches** (21 open / 5 done)
- **10 décisions** · **29 events** · **22 contacts** · **9 propositions IA** · **4 revues**
- `assets/` : 104 KB (data 36K, app 24K, css 32K, project-page 12K)

## Raccourcis clavier

- `⌘K` ou `/` — Palette de recherche
- `N` — Nouvelle tâche
- `Esc` — Fermer

## Ce qui reste à construire (identifié honnêtement)

- Branchement Outlook réel (MCP dispo mais non câblé)
- Dark mode
- Export PDF (JSON OK)
- Génération vocale → tâche
- i18n (tout en français en dur)
