# Archive — drafts v3 / v3.1 (héritage)

**Date d'archivage** : 2026-04-24
**Cadre** : atelier de cohérence 2026-04, Session 3 (sources de vérité + dossiers orphelins)
**Référence ADR** : `00_BOUSSOLE/DECISIONS.md` · *2026-04-24 · Règle de vie des drafts (4 semaines max)*

---

## Pourquoi ces deux fichiers ont été archivés

Les deux drafts ci-dessous décrivent l'**itération v3 / v3.1** d'aiCEO — une version produit 100% `localStorage`, avec `assistant.html` comme page séparée et un moteur "NBA" (Next Best Action) ambient+reactive+scripted.

Cette itération a été **superseded** par le concept actuel :

- **v0.4 / fusion v0.5** — backend Node + Express + `better-sqlite3`, frontend vanilla JS découpé en modules ES, intégration Outlook via PowerShell COM puis Graph API.
- Spécifications canoniques actuelles : `04_docs/01` à `04_docs/08` + `04_docs/SPEC-FONCTIONNELLE-FUSION.md` + `04_docs/SPEC-TECHNIQUE-FUSION.md`.

Les concepts **conservés** du draft v3 (3 groupes Adabu/AMANI/Terres Rouges, cockpit temps réel, Big Rocks tirés de la revue) sont intégrés dans les fascicules canoniques. Les concepts **non retenus** (`localStorage.aiCEO.store.v1` comme source unique, `assistant.html` page séparée, moteur NBA ambient+reactive décrit ici en détail) ont été soit simplifiés soit reportés dans le backlog GitHub.

---

## Contenu

- `REFONTE_v3.md` — refonte produit v3 (3 groupes, 11 chapitres). Daté 23/04/2026.
- `SPEC_v31.md` — spec dev v3.1 : incitation naturelle, offline-first, service worker, moteur NBA. Daté 23/04/2026.

Les deux fichiers sont conservés en l'état pour traçabilité historique. Ils **ne doivent pas** être réutilisés comme source de vérité — ils sont périmés par conception.

---

## Si besoin de récupérer un concept

Lire, puis ouvrir une issue GitHub `feycoil/aiCEO` avec label `type/discussion` en citant ce dossier d'archive. Ne pas éditer les fichiers archivés — ils sont figés à leur état du 24/04/2026.
