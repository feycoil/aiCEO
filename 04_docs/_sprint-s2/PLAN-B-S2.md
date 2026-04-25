# Plan B Sprint S2 — Runbook décision mid-sprint

**Owner** : Major Fey (PMO/CEO)
**Moment de décision** : vendredi 23/05/2026 16:00 (fin daily semaine 1)
**Lecture** : 4 min · garder ouvert le 23/05 entre 14h et 17h
**Source** : ADR `00_BOUSSOLE/DECISIONS.md` 2026-04-25 · `DOSSIER-SPRINT-S2.md` §6 · `NOTE-CADRAGE-S2.md` §5

---

## 1. Contexte — pourquoi un Plan B existe

Le Sprint S2 a élargi son périmètre depuis S3 en absorbant `taches.html` (capacité gagnée par le coussin S1 dogfood ~2 j d'avance). On passe de **3 pages → 4 pages migrées vers l'API SQLite** sur la même fenêtre de 10 jours ouvrés (19/05 → 30/05).

Cette absorption se fait sur **19,5 j-dev / 20 j-dev de capacité** (97,5 %). Le coussin résiduel est de **0,5 j-dev** — quasi nul. Si la moindre dérive non absorbable apparaît semaine 1, on a deux choix :
1. **Tirer sur les nuits/week-ends** → option exclue, contradictoire avec la promesse anti-héroïsme du sprint.
2. **Re-décaler `taches.html` en S3** → Plan B documenté ici.

L'option 2 préserve la démo finale, le tag `v0.5-s2` et l'ADR de gouvernance S1 livré 25/04. C'est la seule option compatible avec la ligne CEO "zéro stress, zéro héroïsme".

---

## 2. Triggers — critères chiffrés (un seul suffit)

Mesurés au stand-up de **vendredi 23/05 09:00**, validés en réunion mid-sprint **vendredi 23/05 16:00** :

| # | Critère | Mesure | Seuil de bascule |
|---|---|---|---|
| T1 | **Charge réalisée binôme** | Σ j-dev cochés Dev1+Dev2 sur S2.01-04 + S2.06 | < 7 j à fin J5 |
| T2 | **Critical path J5 — backend** | S2.01 (Backend cockpit) | non terminé J5 18:00 |
| T3 | **Critical path J5 — arbitrage** | S2.03 (Frontend arbitrage + DnD) | non terminé J5 18:00 |
| T4 | **Bug bloquant non résolu** | tout bug `priority/P0` ouvert > 0,5 j-dev | actif sur le critical path |
| T5 | **Migration en échec** | S2.06 (`migrate-from-appweb`) | check-migration.js rouge |

**Règle d'agrégation** : un seul trigger = bascule. Pas de débat. La décision est **automatisée par les chiffres**, pas par sentiment.

**Mesure de référence** :
```
Plan idéal J5 (vendredi 22/05 18:00) :
- Dev1 : S2.01 (1,5j) + S2.03 démarré (~1,5j) + S2.06 démarré ou fini = 4,5 à 6 j cumulés
- Dev2 : S2.02 (2j) + S2.04 démarré (~1,5j)             = 3,5 j cumulés
Σ binôme = 8,0 à 9,5 j-dev
Trigger T1 = bascule si Σ < 7,0 j
```

---

## 3. Scénarios de fin de semaine 1

| État | Triggers | Décision 23/05 16:00 |
|---|---|---|
| 🟢 **Vert** | 0 trigger actif · Σ ≥ 9 j-dev · S2.01/03/06 dans le rythme | On continue à 4 pages. Stand-up lundi 26/05 normal. |
| 🟡 **Jaune** | 0 trigger actif mais Σ entre 7 et 9 j | Stand-up Plan B activable lundi 26/05 09:00 si dérive J6. PMO garde l'ADR sous le coude. |
| 🔴 **Rouge** | ≥ 1 trigger actif | **Bascule activée** : S2.05 reporté en S3, voir §5. |

Le mid-sprint check ExCom du **mercredi 28/05 ~14:30** sert à confirmer/réviser la trajectoire si l'état était jaune au 23/05.

---

## 4. Procédure de décision — qui fait quoi, quand

### Vendredi 23/05 — chronologie

| Heure | Acteur | Action |
|---|---|---|
| 09:00 | Binôme | Daily stand-up : énoncer charge réalisée Dev1 et Dev2 |
| 09:15 | PMO | Saisit Σ dans l'artefact `sprint-s2-tracker` (champ "Réalisé J5") |
| 09:30 | PMO | Évalue les 5 triggers, pose le verdict (vert / jaune / rouge) |
| 09:30 | PMO | Si rouge : prévient Dev2 que S2.05 sera probablement re-décalé |
| 14:00 | Binôme | Stand-up de validation Plan B (15 min) si rouge |
| 16:00 | Major Fey + PMO | **Démo intermédiaire 16:00** — décision officialisée |
| 16:30 | PMO | Si rouge : déclenche §5 (actions de bascule) |
| 17:00 | PMO | Message binôme + ADR rédigé (template §6) |
| 18:00 | PMO | Roadmap interactive mise à jour (§7) |

**Règle d'or** : la décision se prend **dans l'heure 16:00-17:00**, pas plus tard. Pas de "on verra lundi".

---

## 5. Actions de bascule — checklist exhaustive

À exécuter dans l'ordre, le 23/05 entre 16:30 et 18:00.

### 5.1 GitHub (5 min)

- [ ] Issue **S2.05** : retirer label `sprint/s2`, ajouter `sprint/s3`
- [ ] Issue **S2.05** : retirer milestone `v0.5-s2`, ajouter milestone `v0.5-s3` (créer si absent)
- [ ] Issue **S2.05** : ajouter commentaire `Re-décalé en S3 suite Plan B mid-sprint déclenché 23/05/2026. Voir ADR DECISIONS.md.`

### 5.2 Re-allocation Dev2 (10 min)

Dev2 libère **3 j** sur S2.05. Réinjection dans 3 buckets prioritaires :

- [ ] **+1 j sur S2.04** (evening + streak engine) → renforce stabilité, anticipe e2e
- [ ] **+1 j sur S2.08** (tests unitaires extensions) → on cible **35 verts** au lieu de 30
- [ ] **+1 j en réserve "stabilisation"** → bug-fix, polish e2e, support Dev1 sur S2.07

Charge ajustée binôme : 19,5 j − 3 j = **16,5 j-dev** sur capacité résiduelle **15 j** (J6→J10). Coussin restant **−1,5 j** → on est dans les clous avec marge confortable.

### 5.3 Documentation (15 min)

- [ ] **ADR `00_BOUSSOLE/DECISIONS.md`** : nouvelle entrée datée 23/05 (template §6)
- [ ] **`11-roadmap-map.html`** : maj JOURNAL + Phase 2 (§7)
- [ ] **`DOSSIER-SPRINT-S2.md`** : ajouter encart "Plan B activé" en §6 avec date
- [ ] **Artefact `sprint-s2-tracker`** : maj swimlane Dev2 (S2.05 grisée), bandeau "Plan B activé J5"

### 5.4 Communication (10 min)

- [ ] Message binôme (template §6.A)
- [ ] Note ExCom préparatoire pour mid-sprint check 28/05 (template §6.B)
- [ ] Mention dans l'agenda partagé : "Démo finale 30/05 sur 3 pages, `taches.html` reportée S3"

---

## 6. Templates communication

### 6.A — Message binôme (Slack/canal projet, vendredi 23/05 ~17h)

```
@dev1 @dev2 — Plan B mid-sprint S2 activé

Sur la base du stand-up de ce matin et des triggers définis dans
04_docs/_sprint-s2/PLAN-B-S2.md, on bascule S2.05 (taches.html)
en sprint S3.

Pourquoi : [trigger(s) déclenché(s) → ex. "T1: 6,5 j-dev cumulés
binôme à J5, seuil 7 j"]

Ce que ça change :
- Dev2 : tu libères les 3 j prévus sur S2.05. Re-allocation :
  +1j stabilisation S2.04, +1j tests unitaires S2.08 (cible 35),
  +1j réserve stabilisation/support Dev1.
- Dev1 : pas de changement périmètre. Tu restes sur S2.03→S2.07,
  S2.06, S2.10.
- Démo 30/05 : on présente 3 pages (index, arbitrage, evening)
  + taches.html en wireframe statique 1 slide.
- Tag v0.5-s2 reporté de 0 jour : toujours 02/06.

Périmètre S3 enrichi de S2.05 (3 j-dev). Le sprint S3 sera scopé
en conséquence à la rétro 30/05.

Pas de stress. C'est exactement le scénario qu'on avait préparé.
On a 7 j-dev de marge sur capacité S2 résiduelle, on stabilise.

— Major
```

### 6.B — Note ExCom (préparation mid-sprint 28/05, envoi 25/05)

```
Objet : aiCEO v0.5 · Sprint S2 mid-sprint · Plan B activé 23/05

Trois lignes :
1. Périmètre S2 réduit de 4 à 3 pages le 23/05 sur trigger
   chiffré (voir DECISIONS.md). taches.html → S3.
2. Démo finale 30/05 maintenue sur 3 pages + tag v0.5-s2 le 02/06
   préservé. Coussin 1,5 j-dev reconstitué.
3. Sprint S3 prendra S2.05 en plus du périmètre initial. Re-cadrage
   en rétro 30/05.

Détail complet : 04_docs/_sprint-s2/PLAN-B-S2.md
Mid-sprint check ExCom mercredi 28/05 14:30 (15 min).

— Major Fey
```

### 6.C — ADR à coller en haut de DECISIONS.md

```markdown
## 2026-05-23 · Sprint S2 — Plan B activé, taches.html re-décalé en S3

**Statut** : Acté en mid-sprint check 23/05/2026 16:00.
**Owner** : Major Fey (PMO/CEO)

### Contexte
[Trigger(s) déclenché(s), ex. : T1 binôme à 6,5 j-dev à J5, seuil 7 j].
Le runbook 04_docs/_sprint-s2/PLAN-B-S2.md prévoit ce cas.

### Décision
S2.05 (`taches.html` + Eisenhower 2×2) bascule en S3. Démo finale 30/05
sur 3 pages (index, arbitrage, evening). Tag v0.5-s2 maintenu 02/06.

### Conséquences
- Périmètre S2 ramené à 16,5 j-dev / 18 j capacité résiduelle (coussin 1,5 j)
- Dev2 ré-affectée : +1 j S2.04, +1 j S2.08 (cible 35 verts), +1 j réserve
- Sprint S3 enrichi de 3 j-dev → re-cadrage en rétro 30/05/2026
- Budget S2 inchangé : 22,1 k €

### Sources
- 04_docs/_sprint-s2/PLAN-B-S2.md §3 et §5
- Issue GitHub #S2.05 (label re-tagged sprint/s3)
```

---

## 7. Mise à jour artefacts si Plan B déclenché

### 7.A — `11-roadmap-map.html`

**JOURNAL** (ajouter en haut) :
```js
{
  date: "2026-05-23",
  type: "decision",
  title: "Plan B mid-sprint S2 activé — taches.html → S3",
  detail: "Trigger [Tx] déclenché à J5. Re-allocation Dev2 sur S2.04/08/réserve. Démo 30/05 sur 3 pages.",
  refs: ["DECISIONS.md#2026-05-23", "PLAN-B-S2.md"]
}
```

**Phase 2** card body : ajouter une ligne `⚠ Plan B activé 23/05 — 3 pages`.

### 7.B — `sprint-s2-tracker` artefact (Cowork sidebar)

- Bandeau `Plan B activé · J5` au-dessus du burn-down (style `coral`).
- Carte issue **S2.05** : opacity 0.4 + label "→ S3" en surimpression.
- Swimlane **Dev2** : retirer S2.05 du compteur, afficher "8 j → 5 j (+ 3 j réserve stabilisation)".

### 7.C — Burn-down

Ajuster la ligne planifiée à partir de J6 :
```
Avant Plan B : 19,5 → 15 → 10 → 5 → 0  (sur J0→J10)
Après Plan B : J5=11 j restants → linéaire vers 0 sur J10
```

---

## 8. Si Plan B **non déclenché** (scénario vert/jaune)

Pas de no-op : il faut quand même tracer la non-décision pour que la rétro 30/05 ait le contexte.

- [ ] Stand-up 23/05 09:00 : verdict explicite "Plan B non activé — Σ J5 = X j-dev, tous triggers verts"
- [ ] Commentaire dans l'artefact tracker : "J5 OK · Plan B en veille · revoir lundi 26/05"
- [ ] Si état jaune : prévoir mini-check lundi 26/05 09:30 (5 min PMO + binôme) avant relance des tâches semaine 2

---

## 9. Garde-fous

- **Ne jamais** activer Plan B avant 23/05 09:00 (pas d'auto-réalisation par anxiété).
- **Ne jamais** différer la décision après 17:00 le 23/05 (épuisement signal).
- **Ne jamais** rajouter un cinquième page mid-sprint pour "compenser" — la marge va à la stabilité.
- **Ne jamais** modifier le tag `v0.5-s2` ou la date démo finale sans nouvel ADR explicite.

Le but du Plan B est de **transformer une dérive en non-événement**. Si on l'active proprement, le sprint reste calme jusqu'au 30/05.

---

## 10. Post-mortem — à inclure en rétro 30/05 si Plan B déclenché

3 questions à traiter en 10 min :

1. **Trigger qui a sauté** : pourquoi ce critère et pas un autre ? Est-ce que le seuil était bien calibré ?
2. **Coût de la bascule** : qu'est-ce qu'on a perdu (effort dépensé sur S2.05 avant bascule, doublons doc) ?
3. **Apprentissage S3** : qu'est-ce qu'on capitalise pour le prochain sprint élargi ? (calibration coussin, scoping plus serré, pré-mortem plus long)

À écrire dans `04_docs/RELEASE-NOTES-v0.5-s2.md` § "Lessons learned".

---

**Fin du runbook.** Tout est prévu. Le 23/05 doit être un moment calme.
