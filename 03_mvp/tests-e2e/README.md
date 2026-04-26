# tests-e2e — Tests E2E Playwright (S5.01)

Tests boundary-end-to-end avec Playwright sur le serveur aiCEO local.

## Pré-requis

1. Serveur aiCEO doit tourner (par défaut `http://localhost:4747`) :
   ```powershell
   cd C:\_workarea_local\aiCEO\03_mvp
   npm start
   ```
2. Installer Playwright (1 fois) :
   ```powershell
   cd C:\_workarea_local\aiCEO\03_mvp\tests-e2e
   npm install
   npx playwright install chromium
   ```

## Lancer les tests

```powershell
npm test                    # tous les parcours
npm run test:headed         # voir le navigateur
npm run test:debug          # pas-à-pas
npm run report              # rapport HTML après run
```

## 6 parcours canoniques

| ID | Fichier | Périmètre |
|---|---|---|
| P1 | `specs/p1-matin.spec.js` | Cockpit + arbitrage matin + zéro localStorage |
| P2 | `specs/p2-soir.spec.js`  | Evening + bilan soir + streak |
| P3 | `specs/p3-hebdo.spec.js` | Revues hebdo + agenda lun-dim |
| P4 | `specs/p4-portefeuille.spec.js` | Groupes + projets + contacts + décisions (pages S4) |
| P5 | `specs/p5-assistant.spec.js` | Chat assistant streaming SSE (S4.02) |
| P6 | `specs/p6-install.spec.js` | Smoke 12 pages + /api/health enrichi + /api/system/last-sync |

## Variables d'env

- `AICEO_E2E_BASE` — override URL base (défaut `http://localhost:4747`)
- `CI=true` — empêche `test.only` accidentel

## Couverture

Les tests valident :
- HTTP 200 sur toutes les pages
- content-type text/html
- Présence des éléments UI structurants (sidebar, input, cards, chips)
- **Zéro localStorage applicatif** (ADR S2.00) sur les pages migrées (P1, P2, P4, P5)
- Streaming SSE fonctionnel sur `/assistant` (P5)
- /api/health enrichi v0.5 (uptime, memory, counts) (P6)
- 4 routes API critiques (/api/groups, /projects, /contacts, /decisions) (P6)

## Sources

- DOSSIER-SPRINT-S5.md § Pilier 1
- ADR S5.00 méthode
- Issue GitHub #YYY (S5.01)
