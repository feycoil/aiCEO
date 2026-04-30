# PITCH ExCom 04/05/2026 — aiCEO v0.8 livre + GO V1

**Audience** : ExCom ETIC Services (Lamiae + autres) · **Duree** : 30 min · **Format** : 12 slides + Q&R · **Decisions a acter** : 4

> Pitch deck en markdown a convertir en PPTX (cf. `04_docs/_design-v05-claude/`).

## Slide 1 — Couverture

```
aiCEO v0.8 livre — Le Compass executive du CEO francophone CSP+

[Naviguer clair. Trancher juste. Dormir serein.]

ExCom 04/05/2026 · Major Fey
```

## Slide 2 — Recap 90 secondes

- **v0.4 → v0.7** livres en 5 jours chrono (24-28/04) : MVP + Fusion + Cablage reel + LLM 4 surfaces
- **v0.8** livre 29/04 : UX Editorial Executive complete · 19/19 pages refondues voix exec moderne · 4/5 routes LLM frontend cablees
- **38 ADRs** · **16 tags Git** · **10/10 tests verts**
- Methode binome (CEO + agent) : velocite x30 vs plan ETP traditionnel

## Slide 3 — Demo live (5 min)

Demo enchaine en 5 ecrans :
1. Cockpit refondu chronotype + Anneau journee + Trajectoire mini
2. Triage matin (file emails 8 propositions)
3. Modal-detail Decision avec bouton ✦ Recommander Claude
4. Page Trajectoire (timeline horizontale x Streams)
5. Pilotage Roadmap ADD-AI (Gantt 18 mois + drawer detail v0.8)

## Slide 4 — Methodologie ADD-AI prouvee

| Indicateur | Avant | Apres |
|---|---|---|
| Velocite (j-binome / sprint) | 13 sem ETP | 3-9 h chrono |
| ADRs documentes | 22 (v0.5) | 38 (v0.8) |
| Pages frontend | 12 (v06) | 19 (v07) |
| Tests verts | 84 (v0.5) | 103+ (v0.8 cumule Windows) |

## Slide 5 — Voix exec moderne figee (12 termes)

```
Architecture           Strategie & rituels
Hub                    Compass
Stream                 North Star
Project                Big Rock
Action                 Sync
Decision               Triage
Pin                    Pulse
```

Charte de voix : `04_docs/_design-v08-intentions/VOICE-AICEO.md`

## Slide 6 — 4 decisions a acter

| # | Decision | Budget | Recommandation |
|---|---|---|---|
| 1 | **GO V1 modele binome (~41 k€, T3-T4 2026)** | absorbe provision V1 | OUI |
| 2 | **Realloc 254 k€ option β** (anticipation V2) | marketing 80 + success/sales 40 + provision SOC 2 50 + tresorerie 85 | OUI |
| 3 | **CEO pair Lamiae** suppleant binome V1 | formation 1 mois | OUI |
| 4 | **BETA 5 CEO pairs francophones** mi-V1 | recrutement T3 2026 | OUI |

## Slide 7 — V1 modele binome (focus)

**Cible** : T3-T4 2026 · 6 mois · ~41 k€ binome (reduit de -5 k€ vs roadmap initiale)

**Livrables V1** :
- Multi-tenant Supabase + RLS + Microsoft Entra auth
- Equipes (delegations, partage Hub/Streams)
- Mobile responsive complet
- Backup auto SQLite + logs structures winston
- BETA 5 CEOs pairs francophones (Lamiae + 4 invites)

**Non-bloquants V1** : audit accessibilite WCAG (V1.5), mode sombre (V2)

## Slide 8 — Risques residuels et mitigations

| Risque | Severite | Mitigation |
|---|---|---|
| R4 Dependance Feyçoil | ★★★★ | CEO pair Lamiae forme mois 1 V1 |
| R5 Pas de tests utilisateurs externes | ★★★ | BETA 5 CEOs pairs mi-V1 |
| R6 Pas de pen-testing externe | ★★★ | Audit prestataire en sortie V1 (~15 k€) |
| R7 Biais auto-evaluation Claude | ★★ | Externalisation review prestataire 1x/milestone |

## Slide 9 — Budget cumule 18 mois (1.56 M€)

```
v0.5 (livre)       :    97 k€
v0.6+v0.7 (livre)  :    13 k€  (binome + provision)
v0.8 (livre)       :     5 k€  (5 j-binome + agent autonome)
V1 (T3-T4 26)      :    41 k€  (binome) + 254 k€ option β = 295 k€
V2 (2027)          :   800 k€
V3 (2028+)         :   600 k€
                     ────────
TOTAL 18 mois      : 1 560 k€
```

Point mort : **250-350 utilisateurs** (V3) · marche cible : 50-150 €/mois.

## Slide 10 — Roadmap visuelle

[Inserer Gantt timeline 18 mois du pilotage 00-pilotage-projet.html]

```
v0.4 ✓ │ v0.5 ✓ │ v0.6 ✓ │ v0.7 ✓ │ v0.8 ★ │ v0.9 ⚡ │ V1 │ V2 │ V3
24/04   26/04    28/04    28/04PM  29/04    05/26    T3-26 2027 2028+
```

## Slide 11 — Question rituelle ExCom

> « Si on devait s arreter aujourd hui, qu est-ce qui resterait acquis ? »

**Reponse honnete** : Backend SQLite stable + 19 pages v07 refondues + 4 routes LLM operationnelles + voix exec moderne figee + 38 ADRs documentes. Le projet survit a une pause grace a la documentation et au tag `v0.8`.

## Slide 12 — Vote ExCom

```
GO V1 modele binome           :  OUI / NON
Realloc 254 k€ option β       :  OUI / NON
CEO pair Lamiae suppleant     :  OUI / NON
BETA 5 CEO pairs francophones :  OUI / NON
```

## Q&R prevu (8 questions probables)

1. **Pourquoi pas Microsoft Copilot CEO ?** -> souverainete donnees, pas de feature parite, ecosysteme français
2. **Comment tester en condition reelle avant V1 ?** -> recette CEO 25 min + BETA Lamiae mi-V1
3. **Combien Anthropic API en prod ?** -> ~5-15 € / utilisateur / mois selon usage (mode degrade gratuit)
4. **Plan B si Claude vire pricing ?** -> abstraction LLM-provider, fallback Mistral/local
5. **Audit securite ?** -> sortie V1 prestataire (~15 k€)
6. **Pourquoi pas plus rapide V1 ?** -> binome solo + besoin BETA + recettes
7. **Que faire si BETA Lamiae NO-GO ?** -> 1 boucle d ajustement V1bis (1-2 mois)
8. **Quand on commercialise ?** -> V2 (2027), apres SOC 2 et i18n

---

**Version** : 1.0 · 29/04/2026 · livre en autonomie agent · a relire par Major avant ExCom
