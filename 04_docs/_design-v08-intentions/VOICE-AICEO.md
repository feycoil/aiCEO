# VOICE aiCEO — Charte de voix produit

**Statut** : VALIDE Phase 1 · **Date** : 29/04/2026 PM tardif · **Audience** : binome CEO + agent Claude + futurs designers/devs

> Cette charte fige le **ton, la forme et le fond** du langage aiCEO a tous les niveaux du produit (UI, copy marketing, doc, ADRs, libelles API, messages erreur). Source obligatoire pour tout travail de copy.

## 1. Principe directeur

> **Voix exec moderne. Anglicismes premium ancres quand le francais est lourd, francais standard quand il est exec-ready. Aucun anglicisme pour le frime.**

Chaque anglicisme retenu doit etre :
- **Ancre dans le lexique exec moderne** (founder culture, McKinsey/BCG, Y Combinator, Linear, Notion, Stripe)
- **Court et lisible** par un CEO francophone CSP+ sans contexte
- **Premium**, pas tech-jargon ni baby-talk

## 2. Champ semantique : navigation maritime + executive

### Cohérence narrative

```
Hub (port d attache)
└── Compass guide → North Star aims → Sync paces → Deliver outputs
    └── Big Rock priorities the week
        └── Triage every morning
            └── Pulse senses signals
```

### Vocabulaire ancre par champ

| Champ | Termes acceptes |
|---|---|
| **Navigation** | Hub, Compass, North Star, Stream, Trajectoire |
| **Rythme** | Sync, Triage, Big Rock, Cadence (interne, pas en libelle UI) |
| **Detection** | Pulse, Signal (sans "faible"), Drift (V1) |
| **Action** | Project, Action, Decision, Deliver |
| **Memoire** | Pin, Wealth, Weekly Sync |

## 3. Tons par contexte

| Contexte | Ton | Exemple |
|---|---|---|
| Greeting matin | Energique mais doux | "Bonjour Major. Voici votre journee — ce qui compte, ce qui peut attendre." |
| Greeting soir | Contemplatif bienveillant | "Bonsoir Major. La journee se ferme — 3 minutes pour la clore proprement ?" |
| Greeting nuit | Rare et indulgent | "Encore la, Major ? Si vous insistez, autant que ce soit pour quelque chose qui compte." |
| Empty state | Inspirant + CTA | "Pas encore de Decisions epinglees. La prochaine pourrait commencer maintenant." |
| Erreur | Direct + responsabilite | "Sauvegarde echouee. Le serveur tourne-t-il sur :4747 ?" |
| Success | Affirme + bref | "✓ Bilan enregistre. Bonne soiree." |
| Coaching IA | Bienveillant + pertinent | "Votre Pulse de serenite baisse. Une cause a explorer en Weekly Sync ?" |
| Marketing | Magnetique + sobre | "Naviguer clair. Trancher juste. Dormir serein." |

## 4. Anti-patterns a bannir

### Mots/expressions a proscrire

- ❌ "vibe", "energy points", "XP", "achievement unlocked" (Duolingo)
- ❌ "opportunity", "lead", "pipeline", "deal flow" (Salesforce)
- ❌ "ticket", "epic", "story" (JIRA)
- ❌ "synergize", "leverage", "best practice", "deep dive", "circle back" (corporate buzzwords)
- ❌ "let s grab a coffee", "shoot me an email" (familier)
- ❌ "you ve got this!", "amazing!", "awesome!" (positivisme baby-talk)
- ❌ "cap strategique", "signal faible", "rituel" (litteraux peu exec)

### Tons a eviter

- ❌ **Pathologisant** ("votre cerveau ADHD a besoin de...")
- ❌ **Paternaliste** ("n oubliez pas de prendre soin de vous")
- ❌ **Hyperbolique** ("revolutionnez votre productivite !")
- ❌ **Familier baby-talk** ("hop hop hop, on tranche !")
- ❌ **Technique sec** ("status: tranchee_at field updated")
- ❌ **Corporate fade** ("nous nous engageons a vous accompagner")

## 5. Conventions ecriture

### Capitalisation
- **Title Case** : concepts canoniques (North Star, Big Rock, Quick Sync, Evening Sync, Weekly Sync, Triage)
- **minuscules** : libelles courants (decisions, actions, projects, sync hebdo)

### Ponctuation
- **Phrases courtes** preferees aux phrases longues
- **Trois points** acceptes pour suspension douce ("À demain...")
- **Points d exclamation** : maximum 1 par ecran (sinon ca crie)
- **Italiques** : pour les emphases ponctuelles (e.g. *Si la Decision ne sert pas la North Star, la differer.*)

### Genre
- **Inclusif sans lourdeur** : preferer formes neutres ("CEOs", "personnes", "binome") aux doublons ("CEOs et CEOes")
- Si ambiguite, masculin generique accepte (cohere langue francaise standard)

### Typographie
- Espace insecable avant `: ; ! ? %`
- Apostrophe typographique `'` au lieu de `'`
- Tirets : em-dash `—` pour incises, en-dash `–` pour intervalles, hyphen `-` pour mots composes

## 6. Sources d inspiration

- **Linear** — sobriete fonctionnelle DRY ("The issue tracker you ll enjoy using")
- **Reflect** — humilite epuree
- **Sunsama** — langage humain pragmatique ("Plan your day with intention")
- **Stripe** — clarte technique exec
- **Notion** — anglicisme premium ancre
- **Apple HIG** — restraint + hierarchie

## 7. Reactivation et evolutions

Cette charte est **vivante**. A reviser :
- Apres Phase 2 (refonte Cockpit livree, ajustements possibles)
- Au moment SaaS V1 (B2 pivote vers public CSP+ — possible elargissement champ semantique)
- Si feedback utilisateur (CEOs pairs en V1) revele une dissonance

Toute mise a jour passe par un **commit avec ADR** dans `00_BOUSSOLE/DECISIONS.md`.

---

**Version** : 1.0 · 29/04/2026 PM tardif · Phase 1 cadrage UX v0.8
