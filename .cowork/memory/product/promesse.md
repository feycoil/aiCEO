# Promesse aiCEO

> **aiCEO** = copilote IA exécutif local pour CEO.

## Pour qui

- **Persona principale** : Major Fey (CEO, ETIC Services), poste Windows 11 + Outlook Desktop + Edge
- **Persona suppléante (V1)** : Lamiae (CEO pair francophone)
- **Personae cibles V2+** : 5 CEO pairs francophones puis CEO internationaux

## Jobs-to-be-done

1. **Arbitrage matin** : trier inbox + emails non lus en < 5 min, classer en 3 buckets (faire / déléguer / ignorer)
2. **Cockpit jour** : visualiser cap stratégique + top 3 + alertes en 1 écran
3. **Bilan soir** : capture humeur/énergie/Top 3 + streak régularité
4. **Revue hebdo** : Big Rocks max 3 + auto-draft Claude
5. **Portefeuille** : 13 projets ETIC + 77 contacts + décisions tracées

## Promesses différenciantes

- 🏠 **100% local** : SQLite mono-instance, zéro cloud applicatif → souveraineté
- ⚡ **Vélocité ×30** vs méthode classique (validée v0.5)
- 🎯 **Cap stratégique** : pas de gestion de tâches générique, focus exécutif CEO
- 🤖 **LLM Anthropic intégré** : 5 routes mode dégradé activable (coaching, decision-recommend, auto-draft, effects-propagation, llm-status)
- 🧠 **Coaching léger** : signaux faibles + 4 questions LLM (preview v0.7)
- 📚 **Knowledge pins** : base de connaissance auto-construite par dialogue avec l'assistant

## Contraintes inviolables

- Zéro cloud applicatif (toutes les données restent sur le poste CEO)
- RGPD-compliant by design
- Mode dégradé sans `ANTHROPIC_API_KEY` (fallback rule-based)
- Mono-instance (multi-tenant arrive en V1.2 via Supabase)

## Pricing cible (V1)

50€/mois CEO. Fork open-source possible (souveraineté = différenciateur).

## Sources

- `CLAUDE.md` §1 (vue d'ensemble)
- `04_docs/03_roadmap/PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md`
- `04_docs/01_produit/01-vision-produit.md`
