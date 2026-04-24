# 06_revues — Rituel hebdomadaire

**Rôle** : bibliothèque des revues de semaine du CEO. Une revue = un livrable écrit à la fin de la semaine pour clôturer, apprendre et fixer l'intention de la suivante.

**Statut** : fascicule transverse officiel depuis 2026-04-24 (atelier de cohérence, S3). Cité dans `04_docs/00-README.md`.

---

## Cadence

**Dimanche soir**, entre 18h et 21h. 20 min max. Jamais reportée au lundi.

La revue est un **rituel produit structurant** (décrit dans `04_docs/01-vision-produit.md`, `04_docs/05-coaching-ux.md`, `04_docs/08-roadmap.md` et `SPEC-FONCTIONNELLE-FUSION §4`) — elle n'est pas optionnelle.

---

## Nommage

Un fichier par revue, nom fixé :

```
revue-YYYY-WNN.md
```

où `YYYY-WNN` suit ISO 8601 (`2026-W17` = semaine 17 de 2026, lundi → dimanche).

Fichiers compagnons optionnels :
- `revue-YYYY-WNN-widget.html` — vue cliquable auto-contenue (si besoin de partager)
- `revue-YYYY-WNN-widget.jsx` — source du widget React
- `revue-YYYY-WNN.pdf` — export imprimable

---

## Gabarit de revue

Chaque revue doit couvrir :

1. **Intention de la semaine écoulée** — rappel du cap fixé dimanche dernier
2. **3 Big Rocks** — où en est chacun (fait / avancé / bloqué / abandonné)
3. **Ce qui a été appris** — 3 à 5 lignes, pas plus
4. **Énergie & charge** — ressenti + signaux objectifs (nb arbitrages, nb reports, saturation)
5. **Prochains Big Rocks (S+1)** — 3 max
6. **Intention S+1** — une phrase, celle qui sera affichée au cockpit

Le fichier `revue-2026-W17.md` sert d'exemple canonique pour la structure.

---

## Qui produit la revue

- **Aujourd'hui (v0.4 / v0.5)** : le CEO, aidé du copilote pour l'agrégation des tâches + décisions + événements de la semaine.
- **En V1** (cf. `04_docs/08-roadmap.md` §4 et `SPEC-FONCTIONNELLE-FUSION §4`) : **rituel dominical auto-drafté** — le copilote rédige un premier jet dimanche 17h à partir du store, le CEO valide / édite en 20 min.

---

## Règle de rétention

Toutes les revues restent **indéfiniment**. Ce dossier est un journal, pas un brouillon. Un archivage annuel (`_archive/revues-YYYY/`) est envisageable à partir de la 2e année de revues.

---

## Contenu actuel

- `index.html` — table des matières cliquable, harmonisée app shell
- `revue-2026-W17.md` + widgets (jsx, html, pdf) — première revue versionnée, sert de référence structurelle

---

*Créé 2026-04-24 dans le cadre de l'atelier de cohérence, Session 3 (formalisation du rituel).*
