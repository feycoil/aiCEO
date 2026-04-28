# Invariants techniques aiCEO

> **Invariants** = règles qui doivent rester vraies à chaque commit, indépendamment du sprint courant.

## Architecture

| # | Invariant | Vérification |
|---|---|---|
| I1 | SQLite est la source de vérité unique pour les données métier | grep `localStorage.setItem` hors `aiCEO.uiPrefs` → 0 résultat |
| I2 | Le frontend ne calcule pas de business logic métier | bind-*.js fait uniquement fetch + DOM render |
| I3 | Toutes les routes Express utilisent le pattern `try/catch + res.status(N).json()` | grep des `throw` non catchés dans routes |
| I4 | Toutes les migrations SQL sont idempotentes | rerun `init-db.js` 2× sans erreur |
| I5 | Aucune dépendance NPM avec vulnérabilité known-critical | `npm audit` clean |

## Tests

| # | Invariant | Vérification |
|---|---|---|
| I6 | ≥ 84 tests verts en sandbox Linux à chaque commit sur main | `npm test` exit 0 |
| I7 | Smoke HTTP 12/12 pages 200 à chaque tag | `node scripts/smoke-quick.js` |
| I8 | Aucun `<script>` perdu en bas des HTML câblés | `grep -c "<script src" page.html` ≥ 15 sur pages câblées |

## Design System

| # | Invariant | Vérification |
|---|---|---|
| I9 | Aucun hex hardcodé hors de `colors_and_type.css` (cible V1) | `grep -r "#[0-9a-f]\{6\}" --include="*.css" --include="*.html"` filtré |
| I10 | Cache buster `?v=NNN` à jour à chaque release JS/CSS | grep cohérence sur 18 HTML |
| I11 | WCAG AA passing à chaque tag | audit a11y manuel ou axe |

## Méthodologie

| # | Invariant | Vérification |
|---|---|---|
| I12 | Chaque sprint a une ADR de cadrage **et** une ADR de livraison dans DECISIONS.md | grep `S6.X` dans DECISIONS.md |
| I13 | Chaque tag git a une release notes dans `_release-notes/` | check fichier existe |
| I14 | CLAUDE.md §1 est à jour après chaque clôture de sprint | check date + version stamp |
| I15 | Effort sprint Lean ≤ 1.5 j-binôme | check DOSSIER-SPRINT.md |

## Sécurité

| # | Invariant | Vérification |
|---|---|---|
| I16 | Aucun secret dans Git (.env, API keys, tokens) | `git secrets --scan` ou regex manuelle |
| I17 | Aucun bulk data envoyé à Anthropic (LLM payload minimal) | code review LLM routes |

## Si un invariant casse

1. **STOP commit/tag** immédiat
2. Documenter la rupture dans le retex sprint courant
3. Ouvrir une issue P0 GitHub
4. Bloquer la livraison tant que non résolu

## Sources

- `CLAUDE.md` §10 (réflexes obligatoires)
- `00_BOUSSOLE/DECISIONS.md` (29 ADRs au 28/04/2026)
