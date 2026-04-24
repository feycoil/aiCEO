# _drafts — atelier temporaire

**Rôle** : lieu d'incubation pour les documents en cours d'écriture ou en discussion, avant qu'ils rejoignent un emplacement canonique (`04_docs/`, `02_design-system/`, etc.) ou l'archive.

**Référence ADR** : `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Règle de vie des drafts (4 semaines max)*. Atelier de cohérence, Session 3.

---

## Règles de vie

1. **Gabarits réutilisables** (nom commençant par `_template`) → restent indéfiniment dans ce dossier.
2. **Tout autre draft** → durée de vie **maximale 4 semaines** depuis sa création.
3. Au-delà de 4 semaines, décision binaire obligatoire :
   - **Promu** : déplacé dans son emplacement définitif + référencé dans un index (`00-README.md` ou autre).
   - **Archivé** : déplacé dans `_archive/YYYY-MM-draft-<nom>/` avec un `README.md` court expliquant le contexte.
4. Un draft peut être archivé **avant** 4 semaines s'il est content-obsolète (superseded par un livrable officiel).

---

## Header obligatoire pour tout nouveau draft

```markdown
# <titre>

**Créé** : YYYY-MM-DD
**Auteur** : <nom ou rôle>
**Statut** : incubation
**Destination visée** : <chemin canonique si promu, sinon "à décider">
```

Sans la date de création, l'audit de durée de vie ne peut pas s'appliquer.

---

## Contenu actuel

- `_template.md` — gabarit de document standard (gouvernance, briefs, etc.)
- `_template-widget.jsx` — gabarit pour les widgets React embarqués (revues, artefacts)
- `REFONTE_v3.md` — stub d'archivage (contenu dans `_archive/2026-04-drafts-heritage/`)
- `SPEC_v31.md` — stub d'archivage (contenu dans `_archive/2026-04-drafts-heritage/`)

---

## Audit trimestriel

Un audit des drafts vivants est effectué chaque trimestre (mars / juin / septembre / décembre). Objectifs : purger les drafts > 4 semaines, vérifier que les headers sont bien renseignés, et décider promotion/archivage explicite.

Cadence formalisée dans `00_BOUSSOLE/GOUVERNANCE.md` (section "Synchronisation & hygiène du repo").

---

*Créé 2026-04-24 dans le cadre de l'atelier de cohérence, Session 3.*
