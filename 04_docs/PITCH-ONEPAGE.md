# aiCEO — Le copilote du CEO multi-sociétés

**Pitch onepage · Version 1.0 · 24 avril 2026 · Pour CEO pair / business angel**

> **En-tête de filtrage** — Audience : CEO pair ETIC ou business angel early.
> Éléments redactés : budget précis, ventilation ETIC interne, données mails échantillonnées.
> Version interne de référence pour le détail : [`BUSINESS-CASE.md`](BUSINESS-CASE.md) · positionnement concurrentiel : [`02-benchmark.md` Axe 5](02-benchmark.md#axe-5--phase-locale--marché-desktop-first-v04--v05).

---

## Le problème

Un CEO qui pilote 4 à 7 entités vit un **triple déficit structurel**. Déficit d'attention — chaque société exige 100 % de présence et passer de l'une à l'autre coûte 15 à 25 minutes de recalibrage mental. Déficit de délégation — le CEO perfectionniste pense faire plus vite, ce qui est vrai à 20 %, faux pour les 80 % restants qu'il absorbe en silence. Déficit de respiration — la journée se termine sans clôture, le cerveau reste en exécution jusqu'à 22 h, le sommeil s'érode.

Microsoft Copilot, Motion, Sunsama, Superhuman traitent **un silo chacun**. Aucun n'arbitre simultanément mails + agenda + décisions à travers plusieurs sociétés, dans la langue d'un patron, sur le poste du CEO.

## La solution

aiCEO est un **copilote desktop installé sur le poste du CEO** qui produit chaque matin un arbitrage **3 / 2 / N** : 3 priorités à faire, 2 décisions à déléguer avec brouillon de mail prêt à envoyer, N tâches à différer ou clôturer. Le soir, une boucle de 3 minutes referme la journée et capitalise la mémoire pour le lendemain. Tout reste sur le poste — aucun mail ne quitte le tenant Outlook du CEO.

Différenciateurs irréductibles : **arbitrage multi-sociétés** en langage de CEO (pas un assistant générique d'inbox), **souveraineté locale** (proxy corp géré, mode démo sans clé API), **intégration Outlook desktop native** via PowerShell COM. Sur ces 5 critères, **aucun des 5 concurrents desktop-first ne coche plus de 0 ou 1 case** ([benchmark Axe 5](02-benchmark.md#axe-5)).

## Preuve — MVP v0.4 livré le 24 avril 2026

Le produit tourne aujourd'hui sur un vrai CEO multi-sociétés (Feycoil Mouhoussoune, ETIC Services, 4 entités).

**28 / 28 tâches** classées sur l'arbitrage matin réel · **41 secondes** d'inférence Claude Sonnet 4.5 · **5,2 k tokens in / 2,5 k out** par run · **≈ 1 ct par arbitrage** · budget quotidien observé **≈ 1,5 ct**. Import Outlook PowerShell COM sur 3 boîtes (principale + 2 déléguées) sur 30 jours : **926 mails utiles** après normalisation, reproductible. Délégation un-clic avec brouillon Claude pré-rédigé. Boucle du soir, contexte email injecté dans le prompt, support proxy corporate, chip d'alerte sous pression. Tag `v0.4` publié sur GitHub `feycoil/aiCEO`.

## Trajectoire — 18 mois, 5 jalons

| Jalon | Échéance | Nature | Ce que ça prouve |
|---|---|---|---|
| **MVP v0.4** | 24/04/2026 ✅ | Local Windows mono-poste, Node + JSON | L'arbitrage marche sur les vrais mails du CEO pilote |
| **v0.5 fusion** | T2 2026 (en cours) | Local + SQLite + Service Windows + 13 pages unifiées | Le CEO l'utilise quotidiennement, sans interruption d'usage |
| **V1 cloud** | T3-T4 2026 | Bascule cloud (Supabase + Graph OAuth + Inngest + sub-agents) | Premier CEO pair ETIC testable, 24/7 autonome |
| **V2 équipe** | T1-T2 2027 | Multi-tenant + RLS + Teams + délégation end-to-end | Le produit quitte le silo CEO, atteint DG / AE |
| **V3 coach + mobile** | T3-T4 2027 | PWA mobile + offline + Claude Opus coach + multi-CEO | Compagnon proactif, 2-3 CEO pairs en production |

Contrainte produit assumée : à chaque bascule, **le CEO ne perd jamais l'usage**. Mode parallèle, pas big-bang.

## Appel à l'action

Trois manières de s'engager, dans l'ordre du moins au plus engageant.

**Tester en pair — 1 heure** · installation Service Windows + import Outlook 30 j + premier arbitrage. Procédure : [`ONBOARDING-CEO-PAIR.md`](ONBOARDING-CEO-PAIR.md). Coût opérationnel : ≈ 5 € / mois d'API Anthropic personnelle.

**Sponsoriser le pilote V1 (T3-T4 2026)** · 2 à 3 CEO pairs ETIC qui valident la bascule cloud avant ouverture plus large. Tickets de sponsoring : ordres de grandeur dans [`BUSINESS-CASE.md`](BUSINESS-CASE.md).

**Investir early V1 → V3** · trajectoire 18 mois cadrée, équipe et coûts cumulés détaillés dans [`BUSINESS-CASE.md`](BUSINESS-CASE.md). Ouverture commerciale externe positionnée **post-V2** uniquement, pas de précipitation produit.

> **Contact** — Feycoil Mouhoussoune · CEO ETIC Services · `feycoil@etic-services.net`
> **Référentiels** — [`BUSINESS-CASE.md`](BUSINESS-CASE.md) (chiffré) · [`02-benchmark.md` Axe 5](02-benchmark.md#axe-5) (positionnement) · [`08-roadmap.md`](08-roadmap.md) (jalons détaillés)
