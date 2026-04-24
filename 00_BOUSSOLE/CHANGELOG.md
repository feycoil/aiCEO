# Changelog

Toutes les évolutions notables du produit aiCEO. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

Versionnage : les jalons correspondent à des tags Git (`v0.4`, `v0.5`…).

---

## [Non publié]

### Ajouté
- Structure unifiée `aiCEO/` : 00_BOUSSOLE + 6 domaines numérotés + `_drafts/` `_archive/` `_scratch/`
- `.gitignore` adapté (OneDrive, Node, secrets, données MVP privées)
- Fusion `aiCEO_Design_System/` → `02_design-system/`
- Archivage des audits précédents dans `_archive/2026-04-audits/`
- Archivage des scripts debug MVP dans `_archive/2026-04-debug-scratch/`
- Roadmap interactive `04_docs/11-roadmap-map.html`
- Plan de gouvernance `04_docs/PLAN-GOUVERNANCE.md`

### À faire
- Renommer le dossier racine OneDrive `aiCEO_Agent` → `aiCEO`
- Nettoyer les anciens dossiers vides (`docs/`, `journeys/`, `mvp/`, `revues/` à la racine)
- Init Git local (voir `00_BOUSSOLE/INIT-GITHUB.md`)
- Premier push GitHub privé

---

## [0.4] — 2026-04-24

### Ajouté
- MVP : support proxy corp `HTTPS_PROXY` + `NODE_EXTRA_CA_CERTS` (factory Anthropic)
- MVP : contexte email injecté dans le prompt d'arbitrage (digest global + signaux par tâche)
- Chip coral sur cartes sous pression (≥ 2 relances ou ≥ 3 non lus)

### Modifié
- Prompt arbitrage : REPORTER sans plafond (toutes les tâches hors FAIRE/DÉLÉGUER y vont, 0 perdue)
- Prompt délégation : ton plus clair, placeholders remplacés

### Validé
- Run réel 28/28 tâches classées en 41 s
- 5,2 k tokens in / 2,5 k out · ≈ 1 ct / arbitrage · budget quotidien ≈ 1,5 ct
- Import Outlook : 926 mails utiles sur 3 comptes (30 jours)

---

## [0.3] — 2026-04-20

### Ajouté
- Boucle du soir : `public/evening.html`, endpoints `/api/evening/*`
- Flux délégation : brouillon mail généré par Claude, mailto: Outlook, archive locale
- Import Outlook 30 jours via PowerShell COM + normalisation JS

---

## [0.2] — 2026-04-15

### Ajouté
- Drag & drop entre colonnes FAIRE / DÉLÉGUER / REPORTER
- Validation d'arbitrage persistée dans `data/decisions.json`

---

## [0.1] — 2026-04-11

### Ajouté
- Scaffold Express port 4747
- Endpoint `/api/arbitrage` avec prompt système + wrapper SDK Anthropic
- UI 3 colonnes + mode démo fallback (sans clé API)
