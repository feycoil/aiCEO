# S5 — Livrables externes

**Ouverture :** 2026-04-24
**Clôture :** 2026-04-24
**Statut :** ✅ close
**Dissonances audit traitées :** C4 (zéro livrable externe), partiellement C7 (positionnement obsolète qui alimente le pitch)
**Dépendance amont :** S1 (trajectoire local-first pont jetable vers cloud V1+ — contraint la narration externe), S4 (chiffres budgétaires canoniques pour le business case)
**Impacte en aval :** S7 (pipeline DS → CSS nécessaire si livrables externes ont un rendu graphique léché), S8 (validation finale)

---

## 1. Périmètre de la session

L'audit (§1 C4 et §3 P1-4) est sans ambiguïté :

> *« aiCEO est prêt à être utilisé, pas à être présenté. »*

| Audience | Score audit | Livrable manquant |
|---|:-:|---|
| CEO pair ETIC | **0 %** | Kit install + tuto premier jour |
| Client potentiel | **0 %** | One-pager, landing, démo partageable |
| Investisseur | **40 %** | Pitch deck dédié, business case, KPIs commerciaux |
| Partenaire tech (Microsoft, Anthropic) | non mesuré | Spec d'intégration (hors scope S5) |

En une phrase de l'audit §6 : *« aiCEO a la substance d'un produit, la forme d'un atelier personnel, et il lui manque trois semaines de travail documentaire pour tenir à la fois la route technique, la route stratégique et la première conversation externe. »*

**Question centrale de S5** : quelles audiences externes on traite **maintenant**, avec quels livrables, où, et quand ?

---

## 2. État des lieux — ce qu'on a déjà

| Actif | Destination initiale | Utilisable tel quel en externe ? |
|---|---|---|
| `04_docs/10-exec-deck.pptx` (20 slides) | ExCom ADABU 30/04 — comité stratégique **interne** | **Non** — contient chiffres internes, positionnement non à jour, pas de redaction |
| `05_journeys/` (5 pages HTML cliquables) | Démo UX matin/arbitrage/copilote/soir/revue | **Oui partiellement** — promu en fascicule transverse 12 en S3 ; peut servir de démo visuelle |
| `04_docs/01-vision-produit.md` | Thèse produit pour équipe interne | **Non** — trop détaillé, pas adapté à un pair externe |
| `04_docs/02-benchmark.md` | Cartographie concurrence | **À retravailler** — positionnement obsolète (C7 audit) |
| `04_docs/08-roadmap.md` | Plan interne | **Non** — budgets/équipe sensibles |
| Dogfood v0.4 (28/28 arbitrages, 926 mails, ≈1 ct/arbitrage) | Preuve interne | **Oui** — chiffres crédibles pour tout pitch |
| `03_mvp/` code source | Dev interne | **Non diffusable** — contient clés API, données réelles |

**Constat** : 2 actifs partiellement réutilisables (`05_journeys/` et les chiffres de dogfood), tout le reste nécessite soit une redaction (deck), soit une réécriture ciblée (vision, benchmark).

---

## 3. Audiences et livrables candidats

### 3.1 CEO pair ETIC (priorité selon l'audit §5.3)

> *« Le premier vrai test externe (CEO pair ETIC) est l'événement le plus important de la trajectoire post-v0.5, plus important que toute feature V1. »* (audit §5.3)

**Profil** : autre CEO de l'écosystème ETIC (DG d'une société sœur, fondateur d'une start-up pair, CEO d'une filiale) qui voudrait tester aiCEO sur son propre flux Outlook.

**Besoin** : comprendre en 15 minutes ce que ça fait, en 30 minutes ce que ça coûte d'adopter, en 1 jour avoir une install fonctionnelle.

**Livrables candidats** :
- **`ONBOARDING-CEO-PAIR.md`** (audit P1-4c) — prérequis, install Service Windows, import Outlook, premier arbitrage, ce qui reste à configurer. Exportable en PDF.
- **Démo cliquable** — `05_journeys/` déjà existe, peut être hébergée en local ou capture vidéo.
- **FAQ** — "Mes données sortent-elles de mon poste ?" "Qui voit mes mails ?" "Combien ça coûte par mois ?" "Je peux arrêter quand ?"
- **Lettre d'introduction** de Feycoil à son pair (une page, ton personnel, pas marketing).

### 3.2 Investisseur / partenaire financier

**Profil** : VC early-stage, business angel, ou partenaire industriel type ETIC Services qui finance l'évolution V1→V3.

**Besoin** : thèse défendable, marché cible, traction, équipe, trajectoire financière, risques connus.

**Livrables candidats** :
- **`PITCH-ONEPAGE.md`** (audit P1-4a) — problème / solution / preuve MVP v0.4 / trajectoire / appel à l'action. 1 page, exportable PDF.
- **`BUSINESS-CASE.md`** (audit P1-4b) — hypothèses revenue (écosystème ETIC, pricing interne vs externe, 2-3 CEO pairs en V3), coût cumulé 18 mois (1,69 M€ confirmé S4), point mort, ROI pour le CEO utilisateur (gain de temps chiffré).
- **Deck investisseur dédié** — adaptation du `10-exec-deck.pptx` avec :
  - Redaction des chiffres budgétaires sensibles
  - Positionnement remis à jour (Copilot for Business, Rewind, Motion-desktop — cf. C7) — **dépendance explicite au patch de `02-benchmark.md`**
  - Ajout d'un slide traction (28/28 arbitrages, 926 mails, ≈1 ct/arbitrage)
  - Ajout d'un slide "ce qui n'est pas encore construit" (honnêteté)

### 3.3 Client / prospect commercial

**Profil** : un CEO / DG hors écosystème ETIC qui pourrait acheter aiCEO en V2/V3.

**Besoin** : pitch commercial court, ROI chiffré, démo sans engagement.

**Position de S5** : **trop tôt**. Le produit n'est pas commercialisable (V1 pas sortie, V2 multi-tenant = 2027). Le travail client doit venir **après** V1 validée (go/no-go V2). Ouvrir ce chantier maintenant = gaspiller 5-10 j de rédaction pour un périmètre qui aura changé.

**Reco** : parquer, rouvrir en S5-bis post-V1 (T4 2026 ou T1 2027).

### 3.4 Partenaire technique (Microsoft Graph, Anthropic, Supabase)

**Profil** : équipe produit / BD d'un fournisseur d'infrastructure qui voudrait co-construire ou référencer aiCEO.

**Position de S5** : **hors scope immédiat**. Utile quand on aura besoin de crédits étendus, d'accès bêta (Graph API privilégié, pricing Anthropic), ou de co-marketing (V2+). Aujourd'hui, v0.4 tourne sur API publiques, pas de besoin.

**Reco** : parquer.

---

## 4. Dissonances à résoudre avant de livrer

Livrer un pitch investisseur en citant le benchmark actuel = se tirer une balle dans le pied (le benchmark compare à Lattice/Motion/Superhuman, tous des SaaS cloud, alors que v0.5 est local Windows). Il faut donc **enchaîner** S5 avec un patch du positionnement.

| Dissonance bloquante | Résolution requise avant livrable | Effort |
|---|---|---|
| C7 Benchmark obsolète (Lattice/Motion/Superhuman → Copilot for Business/Rewind/Motion-desktop) | Patch `02-benchmark.md` §0 ou refonte ciblée §3 | 2-4 h |
| Narration local-first pont jetable (S1) | Déjà documentée en ADR S1 — à **synthétiser** en 1 paragraphe pour le pitch | 1 h |
| Chiffres v0.5 (10 sem / 110 k€ / 2,6 ETP) | Déjà alignés en S4 — à **reprendre tels quels** | 0 h |
| Modèle économique absent (audit §2.1.3) | Hypothèses revenue à poser dans `BUSINESS-CASE.md` — **c'est justement le livrable** | inclus |

---

## 5. Options d'organisation

### Q1 — Quelles audiences prioritaires en S5 ?

- **Option A — CEO pair uniquement** : 2-3 jours, ONBOARDING-CEO-PAIR + lettre + FAQ. Risque : pas de pitch investisseur si opportunité émerge.
- **Option B — CEO pair + Investisseur** (audit §4 S2) : 4-5 jours, 5 livrables (PITCH-ONEPAGE + BUSINESS-CASE + ONBOARDING-CEO-PAIR + adaptation deck + FAQ). Couvre les deux priorités de l'audit.
- **Option C — Tout, tout de suite** : 10+ jours, client + partenaire tech inclus. Risque : livrables périmés avant V1.

**Reco : B — CEO pair + Investisseur**. Le client et le partenaire tech sont parqués (reco §3.3 et §3.4). Les 5 livrables couvrent P1-4 de l'audit intégralement.

---

### Q2 — Quels formats exactement ?

| Livrable | Format | Destination fichier | Effort |
|---|---|---|:-:|
| Pitch one-pager | Markdown → PDF | `04_docs/PITCH-ONEPAGE.md` | 0,5 j |
| Business case | Markdown (tableaux) → PDF | `04_docs/BUSINESS-CASE.md` | 1 j |
| Onboarding CEO pair | Markdown → PDF | `04_docs/ONBOARDING-CEO-PAIR.md` | 1 j |
| FAQ CEO pair | Markdown (section dans ONBOARDING) | inclus ci-dessus | 0,2 j |
| Lettre d'introduction | Markdown → DOCX | `04_docs/LETTRE-INTRO-CEO-PAIR.md` | 0,3 j |
| Deck investisseur | Adaptation `10-exec-deck.pptx` → nouveau `PITCH-DECK-INVESTISSEUR.pptx` | `04_docs/PITCH-DECK-INVESTISSEUR.pptx` | 1-2 j |
| **Patch blocant** `02-benchmark.md` | Refonte §3 (ou §0) | `04_docs/02-benchmark.md` | 0,3 j |

**Total effort** : 4-5 jours. Cohérent avec la projection S2 de l'audit (§4).

**Reco** : tous les formats ci-dessus. Markdown source + export PDF/DOCX/PPTX à la demande (via skills). Le deck investisseur reste la seule exception (travail direct dans pptx car adaptation d'un existant).

---

### Q3 — Où stocker ces livrables ?

- **Option A — dans `04_docs/` directement** (comme proposé par l'audit P1-4) : cohérent avec l'index, mais mélange livrables internes et externes.
- **Option B — dossier dédié `04_docs/_externe/`** : séparation nette externe vs interne, mais casse la hiérarchie actuelle (numérotée 01-12 + SPEC-FUSION).
- **Option C — nouveau dossier transverse `07_livrables-externes/`** au niveau repo : massif, probablement prématuré.

**Reco : A — dans `04_docs/`** avec préfixes clairs :
- `PITCH-ONEPAGE.md` (majuscules comme les SPEC-FUSION = signal "livrable stratégique")
- `BUSINESS-CASE.md`
- `ONBOARDING-CEO-PAIR.md`
- `LETTRE-INTRO-CEO-PAIR.md`
- `PITCH-DECK-INVESTISSEUR.pptx`

Ajouter une section dédiée dans `04_docs/00-README.md` — **"Livrables externes"** — après la section "Audits et ateliers", pour que la BOUSSOLE sache qu'ils existent et pour qui.

---

### Q4 — Gestion de la confidentialité

Plusieurs éléments sensibles :
- **Chiffres budget précis** : 110 k€ v0.5, 290 k€ V1, 1,69 M€ total 18 mois. Diffusables investisseur OK, CEO pair à discrétion.
- **Mention ETIC Services / ADABU / START / AMANI** : spécifique à Feycoil, peut être public ou à anonymiser selon l'interlocuteur.
- **Données email réelles** (926 mails dogfood) : **jamais** en externe sous forme d'échantillon, OK en chiffre agrégé.
- **Clés API / détails prompts système** : **jamais** en externe.
- **Ton "personnel" de Feycoil** (je, mon flux, ma journée) : assumé pour CEO pair, à neutraliser pour pitch investisseur.

**Options** :
- Option A — **double version** systématique (interne complète + externe redactée). Double le travail.
- **Option B — livrables externes écrits directement pour l'externe**, sans version interne parallèle. Les chiffres sensibles restent dans `08-roadmap.md` (interne), les livrables externes citent les ordres de grandeur. Plus simple.
- Option C — pas de règle, arbitrage cas par cas. Risque de fuite.

**Reco : B** — chaque livrable externe est écrit pour son audience, avec une **règle de filtrage explicite documentée en tête de fichier** :
> `Audience : <CEO pair | Investisseur>. Éléments redactés : <liste>. Version interne de référence : <fichier>.`

---

### Q5 — Cadence de mise à jour

- **Option A — one-shot** : on livre, on arrête. Risque : livrable périmé en 3 mois.
- **Option B — tagué par version produit** : `PITCH-ONEPAGE-v0.5.md`, `PITCH-ONEPAGE-V1.md`, etc. Trace claire, mais duplication.
- **Option C — maintenu en continu, version dans l'en-tête**. Un seul fichier par livrable, entête `**Version produit visée** : v0.5 · **Dernière mise à jour** : YYYY-MM-DD · **Prochaine revue** : YYYY-MM-DD`.

**Reco : C** — cohérent avec le reste du dossier (tous les fascicules ont un en-tête "Dernière mise à jour"). Les livrables externes sont **relus à chaque jalon produit** (v0.5 scellée, V1 scellée) et mis à jour si nécessaire. Revue explicite au dos du rituel hebdomadaire (`06_revues/`) quand pertinent.

---

## 6. Recommandation en bundle

Si le CEO dit "bundle reco" :

| Q | Décision |
|---|---|
| Q1 | **CEO pair + Investisseur** traités maintenant ; client et partenaire tech parqués |
| Q2 | **5 livrables** : PITCH-ONEPAGE.md, BUSINESS-CASE.md, ONBOARDING-CEO-PAIR.md, LETTRE-INTRO-CEO-PAIR.md, PITCH-DECK-INVESTISSEUR.pptx — + **patch préalable** `02-benchmark.md` |
| Q3 | **Dans `04_docs/`** avec préfixes MAJUSCULES + section "Livrables externes" ajoutée dans `00-README.md` |
| Q4 | **Un seul fichier par audience** avec en-tête de filtrage explicite (audience / éléments redactés / version interne de référence) |
| Q5 | **Maintien continu** avec en-tête version produit visée + dernière mise à jour ; revue à chaque jalon produit scellé |

**Effort estimé** : 4-5 jours de travail documentaire, répartis sur la fenêtre S2 du plan audit (05/05 → 11/05).

**Mode opératoire de S5** : on ne **produit pas** les 5 livrables dans cette session. On **cadre** la décision (audiences / formats / stockage / règles) et on **ouvre une issue GitHub par livrable** avec acceptance criteria. La production elle-même est un sprint dédié de 4-5 jours à démarrer en S2 du plan audit.

---

## 7. Décision (séance CEO 2026-04-24)

**"Bundle reco"** — toutes les recommandations acceptées en bloc.

| Q | Décision prise |
|---|---|
| Q1 | **CEO pair + Investisseur** maintenant ; client et partenaire tech parqués (issues GitHub parqueurs, milestone `V2`, label `status/parked`) |
| Q2 | **5 livrables** à produire : `PITCH-ONEPAGE.md`, `BUSINESS-CASE.md`, `ONBOARDING-CEO-PAIR.md`, `LETTRE-INTRO-CEO-PAIR.md`, `PITCH-DECK-INVESTISSEUR.pptx` — **+ dépendance P0** : patch `02-benchmark.md` |
| Q3 | Stockage **dans `04_docs/`** avec préfixes MAJUSCULES ; section "Livrables externes" créée dans `00-README.md` |
| Q4 | **Un seul fichier par audience** avec en-tête de filtrage obligatoire (`Audience : X. Éléments redactés : Y. Version interne de référence : Z.`) |
| Q5 | **Maintien continu**, en-tête version produit visée + dernière mise à jour ; revue à chaque jalon produit scellé |

---

## 8. Livrables produits 2026-04-24 (session de cadrage S5)

1. **ADR** `2026-04-24 · Livrables externes : cadrage` ajoutée dans `00_BOUSSOLE/DECISIONS.md` (audiences priorisées, 5 livrables, dépendance P0 benchmark, stockage, confidentialité, cadence).
2. **Patch `04_docs/00-README.md`** : section "Livrables externes" ajoutée après "Audits et ateliers" (en creux aujourd'hui, 5 livrables listés *(à produire)* + renvoi vers §9 ici).
3. **Contenu des 6 issues GitHub** préparé dans §9 pour ouverture manuelle :
   - `doc/02-benchmark-v2-positionnement-a-jour` · **P0** · bloque les 5 autres
   - `doc/PITCH-ONEPAGE` · P1 · milestone `V1` · labels `lane/docs` + `priority/P1` + `scope/externe`
   - `doc/BUSINESS-CASE` · P1 · idem
   - `doc/ONBOARDING-CEO-PAIR` · P1 · idem
   - `doc/LETTRE-INTRO-CEO-PAIR` · P1 · idem
   - `doc/PITCH-DECK-INVESTISSEUR` · P1 · idem
   - 2 issues parqueurs supplémentaires : `doc/PITCH-CLIENT` (milestone `V2`, `status/parked`), `doc/KIT-PARTENAIRE-TECH` (milestone `V2`, `status/parked`)
4. **`JOURNAL.md`** mis à jour (clôture S5, à faire en fin de session).

---

## 9. Contenu des 6 issues GitHub à ouvrir

### Issue 1 — doc/02-benchmark-v2-positionnement-a-jour

**Priorité** : P0 (bloque les 5 livrables externes).
**Contenu** :
> Le benchmark actuel (`04_docs/02-benchmark.md`) compare aiCEO à Lattice, Motion, Superhuman — tous des SaaS cloud. Post-fusion v0.5, aiCEO est une app locale Windows mono-poste. Le marché de référence est désormais : Microsoft Copilot for Business, Rewind, Motion-desktop, plugins Outlook, Claude-for-work desktop.
>
> **AC** :
> - §3 du benchmark remis à jour avec les 5 nouveaux concurrents directs (Copilot for Business, Rewind, Motion-desktop, Reflect, plugin Outlook Superhuman).
> - §0 ajouté : "Deux marchés de référence selon la phase produit" (local-first v0.4/v0.5 = productivité desktop ; cloud V1+ = SaaS CEO).
> - Mentionner ADR S1 (trajectoire produit).
> - Renvoi depuis les livrables externes vers ce document.

### Issue 2 — doc/PITCH-ONEPAGE

**AC** :
- 1 page A4 exportable PDF.
- Structure : Problème (3 lignes) / Solution (3 lignes) / Preuve MVP v0.4 (chiffres 28/28, 926 mails, ≈1 ct/arbitrage) / Trajectoire 18 mois (schéma 5 jalons) / Appel à l'action.
- Ton investisseur, pas marketing.
- Redaction des chiffres budgétaires sensibles : ordres de grandeur, pas exact.
- Référence en pied de page vers `BUSINESS-CASE.md` pour le détail.

### Issue 3 — doc/BUSINESS-CASE

**AC** :
- Section hypothèses revenue : écosystème ETIC (2-3 CEO pairs en V3, pricing interne vs externe à estimer), pas de commercialisation externe avant V2.
- Section coûts cumulés : 1,69 M€ sur 18 mois (arbitré S4).
- Section point mort : conditions pour atteindre l'équilibre (nombre d'utilisateurs × prix × marge).
- Section ROI CEO utilisateur : gain de temps chiffré (baseline Feycoil = 5-7 h/sem en V1 cible) × valeur horaire CEO.
- Risques connus : local-first pont jetable (coût de migration V1), dépendance Anthropic (mitigation LiteLLM V1+), absence de modèle économique écrit à date.

### Issue 4 — doc/ONBOARDING-CEO-PAIR

**AC** :
- Prérequis techniques : Windows 10+, Outlook desktop, clé Anthropic personnelle (~5 €/mois à l'usage v0.4), proxy corporate accepté.
- Installation Service Windows pas-à-pas (dérivé de `SPEC-TECHNIQUE-FUSION.md` §9).
- Import Outlook 30 jours (script `outlook-pull.ps1`).
- Premier arbitrage : 15 minutes pour comprendre le flux matin.
- FAQ : confidentialité (données restent sur le poste), coût mensuel, support, rollback.
- Ton pair-à-pair, pas vendeur.

### Issue 5 — doc/LETTRE-INTRO-CEO-PAIR

**AC** :
- 1 page, signée Feycoil.
- "Pourquoi je t'envoie ça", "ce que tu trouveras", "ce que j'attends de toi (ou pas)", "quand je rappelle".
- Ton personnel, pas commercial.
- Template réutilisable avec placeholders `<prénom>`, `<société>`, `<context>`.

### Issue 6 — doc/PITCH-DECK-INVESTISSEUR

**AC** :
- Adaptation `10-exec-deck.pptx` (20 slides internes ADABU) → nouveau deck 15-18 slides investisseur.
- Slides modifiés : ajout traction (slide 3 ou 4), positionnement remis à jour (slide benchmark), redaction des chiffres budget (ordres de grandeur), ajout "ce qui n'est pas encore construit" (honnêteté).
- Slides conservés : manifeste, roadmap 18 mois, KPIs.
- Slides retirés : équipe ETIC interne (confidentiel), détails opérationnels ADABU.
- Export autonome (pptx + pdf).

---

## 10. Reste à faire (hors S5)

- **Sprint de production 4-5 j** (fenêtre S2 du plan audit : 05/05 → 11/05) pour exécuter les 6 issues ci-dessus.
- S8 vérifiera que les 5 livrables externes sont cohérents avec les chiffres canoniques issus de S1/S2/S3/S4.

---

*Session S5 ouverte le 2026-04-24 dans le cadre de l'atelier de cohérence.*
