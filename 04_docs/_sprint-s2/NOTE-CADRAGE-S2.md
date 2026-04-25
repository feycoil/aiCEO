# Sprint S2 — Note de cadrage binôme

**À** : Dev1, Dev2
**De** : Major Fey · CEO ETIC Services / pilote aiCEO · PMO
**Date d'envoi** : lundi 18/05/2026 · veille de kickoff
**Lecture** : 5 min · garder ouvert pendant les 10 jours du sprint
**Source unique de vérité** : `04_docs/DOSSIER-SPRINT-S2.md`

---

## 1. Pourquoi ce sprint compte

S2 est le sprint qui **transforme l'app statique de démo en cockpit dogfoodable au quotidien**. À la fin de S2, j'utilise aiCEO en production sur mes 4 boucles (matin / journée / soir / portefeuille) sans toucher à `localStorage`. C'est l'étape qui légitime tout le reste de v0.5 devant l'ExCom et nos premiers CEO pairs.

Si on rate S2, on est honnête, on bascule en correction et on raccourcit S3. Si on réussit S2, S3 et S4 deviennent des sprints de polish, pas de course.

---

## 2. Périmètre verrouillé

**4 pages migrées vers l'API SQLite, zéro `localStorage` applicatif** :

| Page | Endpoints à câbler | Owner | Issue |
|---|---|---|---|
| `index.html` | `GET /api/cockpit/today` | Dev2 | S2.02 |
| `arbitrage.html` | `POST /start /commit · GET /today /history` | Dev1 | S2.03 |
| `evening.html` | `POST /start /commit · GET /today` + streak engine | Dev2 | S2.04 |
| `taches.html` | CRUD `/api/tasks` + Eisenhower 2×2 | Dev2 | S2.05 |

**Ce qui n'est PAS dans S2** : décisions, agenda, contacts, projets (S3+). Si on touche, on l'écrit dans `DECISIONS.md` le jour même.

**Périmètre élargi** : `taches.html` a été absorbée depuis S3 grâce au coussin S1 (~2 j d'avance dogfood). Plan B documenté si dérive.

---

## 3. Critical path — à protéger absolument

```
S2.01 (1,5j Dev1) → S2.02 (2j Dev2)            ← cockpit débloqué jeudi 21/05
S2.06 (1,5j Dev1) → S2.05 (3j Dev2)            ← taches débloquées vendredi 22/05
S2.03 (3j Dev1)   → S2.07 (2j Dev1)            ← e2e en J7-J8
S2.04 (2j Dev2)   → S2.07
```

Règle d'or : **S2.01, S2.03, S2.06 doivent être terminés au stand-up de vendredi 23/05 09:00**. Si l'un dérive, on le signale au mid-sprint check ExCom du 28/05 — ne pas attendre la démo.

---

## 4. Cadence — 4 rituels + 1 mid-sprint + 1 démo

| Rituel | Quand | Durée | Format |
|---|---|---|---|
| Daily standup | Lun-Ven 09:00 | 15 min | hier / aujourd'hui / blocage · pas de débat technique |
| Mid-week point | Mer 14:00 | 15 min | dépendances, blocages, rien d'autre |
| Mid-sprint check ExCom | Mer 28/05 ~14:30 | 15 min | Major Fey + PMO + dérive cumulée vs plan |
| Démo + rétro | Ven 30/05 16:00 | 45 min | démo live localhost + 30 min rétro |

PMO chronomètre. Si un sujet déborde → ticket de discussion offline.

---

## 5. Plan B mid-sprint — décision vendredi 23/05 16:00

Si **dérive cumulée binôme ≥ 1 j-dev** au stand-up de fin de semaine 1, **S2.05 (`taches.html`) bascule en S3**. Cela libère 3 j Dev2 pour stabiliser S2.04 + S2.08 et préserver la démo finale + le tag v0.5-s2.

Critères chiffrés (l'un suffit) :
- Σ charge réalisée Dev1+Dev2 < 7 j à la fin J5 (vendredi 22/05 18:00)
- S2.01 ou S2.03 non terminés J5
- Bug bloquant non résolu > 0,5 j-dev sur le critical path

Si déclenché : ADR rédigé le 23/05 soir, mise à jour `11-roadmap-map.html` (JOURNAL + Phase 2), démo 30/05 sur 3 pages avec `taches.html` en wireframe.

---

## 6. Definition of Done — chaque issue avant `gh issue close`

Une issue est close uniquement si **les 5 cases sont cochées** :

- [ ] Code committé sur `release/v0.5-s2` avec message conventionnel (`feat:`, `fix:`, etc.) référençant `#S2.0X`
- [ ] Tests unitaires associés verts en CI
- [ ] Vérification manuelle locale : ouvre `localhost:3001/<page>`, fait l'action, ferme l'onglet, rouvre — l'état persiste via SQLite
- [ ] Aucune entrée `localStorage.setItem('aiceo_*')` ajoutée (preferences UI tolérées)
- [ ] Note dans `JOURNAL` roadmap + commentaire de fermeture sur l'issue avec lien commit

**S2.07 (Playwright e2e) est le filet final** : si une e2e échoue, on ne ferme pas l'issue d'origine, on la rouvre.

---

## 7. Branches & commits

- Branche sprint : `release/v0.5-s2` (créée à 09:00 lundi 19/05)
- Issues fermées par commit avec footer `Closes #S2.0X`
- Tag `v0.5-s2` posé **lundi 02/06** par PMO (CEO) si score critères ≥ 9/10
- Pas de force-push sur `main`. Merge en fin de sprint via PR avec review croisée binôme.

---

## 8. Si bloqué — ordre d'escalade

1. **Stand-up suivant** (15 min max d'attente) — formulez le blocage en une phrase.
2. **Slack/canal binôme** entre stand-ups — pour les blocages techniques résolubles à 2.
3. **Ping PMO** (Major Fey) — pour les blocages produit / scope / décisions.
4. **ADR si décision impactante** — `00_BOUSSOLE/DECISIONS.md`, format existant.

Pas de blocage qui dépasse 4 h sans signal. Pas de signal = on présume que tout va bien.

---

## 9. Liens utiles à épingler

| Ressource | URL/chemin |
|---|---|
| Repo | https://github.com/feycoil/aiCEO |
| Milestone S2 | https://github.com/feycoil/aiCEO/milestone (filter v0.5-s2) |
| Dossier sprint | `04_docs/DOSSIER-SPRINT-S2.md` |
| POA budget | `04_docs/POA-SPRINT-S2.xlsx` |
| Roadmap interactive | `04_docs/11-roadmap-map.html` |
| Tracker daily (sidebar Cowork) | artifact `sprint-s2-tracker` |
| ADR récents | `00_BOUSSOLE/DECISIONS.md` (en haut) |

---

## 10. Tonalité

On est en sprint resserré, pas en marathon. Objectif zéro stress, zéro héroïsme. Si quelqu'un sent que ça dérape, on le dit au stand-up suivant, on protège la démo en bougeant le scope (S2.05 en S3), pas en tirant sur les nuits ou les week-ends.

À lundi 19/05 09:00. Branche prête, issues collées, café tiré.

— Major
