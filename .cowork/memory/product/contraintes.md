# Contraintes produit aiCEO

> Ce qui est **non-négociable** dans toute décision produit ou tech.

## Souveraineté & RGPD

- **Zéro cloud applicatif** : toutes les données métier (emails, projets, contacts, décisions, événements) restent sur le poste CEO
- **Pas de télémétrie cachée** : si une métrique est collectée, elle est documentée et opt-out possible
- **Anthropic API uniquement pour le LLM** : payload outbound contient strictement le contenu nécessaire au prompt, pas de bulk data
- **RGPD-compliant by design** : droits d'accès/rectification/effacement applicables (export DB SQLite + suppression poste = oubli total)

## Architecture

- **SQLite mono-instance** = source de vérité unique (pas de cache duplicate sans le savoir)
- **Pas de localStorage applicatif** (ADR S2.00) — frontend lit/écrit toujours via REST. Seules tolérées : préférences UI volatiles dans clé `aiCEO.uiPrefs`
- **Pas de framework frontend lourd** : vanilla JS + Web Components (cf. ADR S6.1)
- **Pas de PostgreSQL avant V1.2** : migration SQLite → Supabase planifiée, pas avant

## Méthodologie

- **Lean ADD-AI** (ADR v9 du 28/04/2026) : effort sprint ≤ 1.5 j-binôme, tasks ≤ 8, risques ≤ 3, ADR format léger
- **3 garde-fous formels** : SPIKE J+1 (mesure GO/NO-GO ADD-AI) + BETA Lamiae S6.16 + critères sortie V1 explicites

## Direction artistique

- **Editorial Executive** (ADR v11 du 28/04/2026) : tokens DS canoniques, Crimson Pro/Inter/JetBrains Mono, 8-grid, 2 elev, 5 radius, anim 120/200/400ms
- **WCAG AA non-négociable** : contraste 4.5:1 corps, 3:1 large text, focus ring visible, touch target ≥ 32px desktop

## Sécurité

- **Pas de secrets dans Git** : `.env` gitignored, secrets via env vars Windows
- **Pas d'exécution de code utilisateur sans sandbox** (cf. ADR « Pas de code-execution dynamique »)
- **Audit prestataire externe en sortie V1** (~15 k€)

## Sources

- `CLAUDE.md` §11 (sources de vérité), §10 (réflexes)
- `00_BOUSSOLE/DECISIONS.md` (ADRs S2.00, S6.1, v9, v11)
