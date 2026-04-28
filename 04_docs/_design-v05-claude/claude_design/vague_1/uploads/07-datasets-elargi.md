# Datasets réalistes — aiCEO v0.5

> Source : `01_app-web/assets/data.js` v4 (rebuild 23/04/2026 depuis 1025 mails Outlook + 56 events).
> Toutes les pages doivent utiliser CES données. Aucun Lorem.

## STRUCTURE GROUPES (3, pas 4)

⚠ **Correction importante** : la vraie structure est **3 groupes**, pas 4. SCI Adabu et SCI Start sont **sous MHSSN**.

| Groupe | Tagline | Couleur | Color hex | Description |
|---|---|---|---|---|
| **MHSSN Holding** | Gouvernance · Famille · SCI | indigo | `#3d4e7d` | Holding familial Mouhoussoune. Gouvernance, SCI Start / Adabu, assistance Affejee, FEIRASIN Holding, dossiers cyber & conformité. |
| **AMANI** | Hôtel & Spa Mayotte | rose/coral | `#d96d3e` | AMANI Properties / AMANI Resorts / AMANI Hospitality — chantier hôtel, financement CA Bretagne, FF&E, exploitation Viventium, certification BREEAM, FEDER. |
| **ETIC Services** | Services · Mayotte | amber | `#b88237` | ETIC Services / ITH / LTM / AA. Facturation débours, dépôt comptes 2019-2023, accès bancaires, dossiers fonciers (Ghams). |

Couleurs utilisées par groupe (CSS vars) :
- MHSSN → background `#e3e7ee`, text `#2a3658`, accent `#3d4e7d`
- AMANI → background `--rose-bg #fdecdf`, text `--rose-800 #8a3b1b`, accent `--rose #d96d3e`
- ETIC → background `--amber-bg #f5e8d6`, text `--amber-800 #6d4816`, accent `--amber #b88237`

Couleurs `--sky`, `--emerald`, `--violet` restent libres pour autres usages (statuts, accents secondaires).

---

## 14 PROJETS RÉELS (à utiliser tels quels)

### MHSSN (4)

| ID | Nom | Tagline | Statut | Avancement | Sociétés liées |
|---|---|---|---|---|---|
| `mhssn-gouv` | Gouvernance MHSSN | Pacte · Cyber · Famille | active | 48% | MHSSN |
| `sci-start-adabu` | SCI Start / Adabu | Comptes + convention Affejee | hot | 70% | SCI Start, SCI Adabu |
| `feirasin-holding` | FEIRASIN Holding | CAM Expertise · prélèvements | active | 35% | FEIRASIN Holding |
| `mouhoussoune-aff` | Assistance Mouhoussoune | Affejee · honoraires forfait | active | 55% | Groupe Mouhoussoune |

### AMANI (7)

| ID | Nom | Tagline | Statut | Avancement |
|---|---|---|---|---|
| `amani-credit` | Crédits CA Bretagne | Contrat 02/04 · Tirage d'Avance | hot | 62% |
| `amani-ffe` | FF&E AMANI | Contrat Franklin / Bénédicte | hot | 58% |
| `amani-chantier` | Chantier AMANI | MOE/MOA · Vinci · Ocidim | hot | 71% |
| `amani-legal` | Dossier 96830001 AMANI-RESORTS | Honoraires Franklin · Jeantet | active | 40% |
| `amani-exploit` | Exploitation Viventium | Préouverture · staffing | active | 25% |
| `amani-feder` | FEDER MYT013568 | Complétude · pièces 05/05 | active | 30% |
| `amani-breeam` | Certification BREEAM | Marge · reporting chantier | active | 20% |

### ETIC (3)

| ID | Nom | Tagline | Statut | Avancement |
|---|---|---|---|---|
| `etic-services` | ETIC Services | Facturation · Dépôts comptes | active | 50% |
| `etic-ith-ltm` | ITH / LTM / AA | Accès CA · consolidation | active | 30% |
| `etic-ghams` | Ghams parcelle 1436 | Foncier Mayotte | new | 10% |

---

## 11 SOCIÉTÉS

| ID | Nom | Groupe | Type |
|---|---|---|---|
| `mhssn` | MHSSN | mhssn | Holding familial |
| `feirasin` | FEIRASIN Holding | mhssn | Holding |
| `sci-start` | SCI Start | mhssn | SCI |
| `sci-adabu` | SCI Adabu | mhssn | SCI |
| `amani-props` | AMANI Properties SA | amani | Foncière hôtelière |
| `amani-resorts` | AMANI Resorts SAS | amani | Société d'exploitation |
| `amani-hosp` | AMANI Hospitality | amani | Exploitation hôtelière |
| `etic-services` | ETIC Services | etic | Société de services |
| `ith` | ITH | etic | Société de services |
| `ltm` | LTM | etic | Société de services |
| `aa` | AA | etic | Société de services |

---

## 28 TÂCHES — ARBITRAGE MATINAL S17 (semaine 20-26 avril)

Format : `id | titre | projet | type | priority | due | starred | done | estim_min | energy | ai_capable | source`

### AMANI CRÉDIT (urgent, semaine du tirage)
- `t1` | Renvoyer l'Attestation Emprunteur signée à Marie Ansquer (CA Bretagne) | amani-credit | do | **critical** | 2026-04-23 | ⭐ | open | 15min | light | ✅ ai-capable | mail
- `t2` | Signer Attestation modifiée PRET CA via LGoA (Maeva Ferrere) | amani-credit | do | **critical** | 2026-04-23 | ⭐ | open | 20min | light | — | mail
- `t3` | Régulariser impayé AMANI PROPERTIES / HDM (facture 17/02) | amani-credit | do | high | 2026-04-24 | — | open | 10min | light | ✅ | mail
- `t4` | Compléter CPs restants du tirage (Inter-Invest ⇄ CA Bretagne) | amani-credit | plan | high | 2026-04-27 | ⭐ | open | 45min | deep | ✅ | mail

### AMANI FF&E
- `t5` | Transférer observations Bénédicte à Jean Hentgen (FF&E Contract) | amani-ffe | do | **critical** | 2026-04-23 | ⭐ | open | 20min | medium | ✅ | mail
- `t6` | Valider version finale contrat FF&E (relecture + signature) | amani-ffe | do | high | 2026-04-25 | ⭐ | open | 60min | deep | ✅ | mail
- `t7` | Brief RV matériaux Mayotte (mission 27/04) | amani-ffe | plan | high | 2026-04-24 | — | open | 30min | medium | ✅ | deep-work

### AMANI CHANTIER
- `t8` | Valider CR chantier S17 (Integrale / Viventium) | amani-chantier | do | high | 2026-04-24 | — | open | 25min | medium | ✅ | mail
- `t9` | Statuer sur Octroi de mer AMANI (impact enveloppe) | amani-chantier | do | high | 2026-04-28 | ⭐ | open | 40min | deep | — | mail
- `t10` | Répondre Yann Cornec — analyse devis ENERGIE CONCEPT | amani-chantier | do | medium | 2026-04-25 | — | open | 30min | medium | ✅ | mail
- `t11` | Préparer Comité de pilotage AMANI 28/04 (Ocidim/Vinci) | amani-chantier | plan | high | 2026-04-27 | ⭐ | open | 45min | deep | ✅ | meeting
- `t12` | Confirmer nouvelle date Réunion BREEAM (après 30/04 avec Marge) | amani-breeam | delegate | medium | 2026-04-24 | — | open | 10min | light | ✅ | mail
- `t13` | Arbitrer choix prestataire piscine AMANI | amani-chantier | do | high | 2026-04-28 | ⭐ | open | 60min | deep | — | meeting
- `t14` | Archiver/traiter alertes ArchiLid (plate-forme projet) | amani-chantier | delegate | low | 2026-04-28 | — | open | 15min | light | ✅ | mail

### AMANI LEGAL / HONORAIRES FRANKLIN
- `t15` | Exécuter virement honoraires Franklin (Alamowitch) | amani-legal | do | **critical** | 2026-04-23 | ⭐ | open | 10min | light | — | mail
- `t16` | Confirmer virements déjà passés à Franklin (Machinet) | amani-legal | do | high | 2026-04-24 | — | open | 15min | light | ✅ | mail

### AMANI EXPLOIT / FEDER
- `t17` | Transmettre pièces FEDER MYT013568 avant 05/05 (Nassebati) | amani-feder | do | high | 2026-05-04 | ⭐ | open | 90min | deep | ✅ | mail
- `t18` | Clarifier avec Inter-Invest (Delpech) signature attestation TVA FEDER | amani-feder | do | medium | 2026-04-28 | — | open | 20min | medium | ✅ | mail

### MHSSN
- `t19` | Payer honoraires Affejee (dossier AMANI — 3ᵉ relance) | mouhoussoune-aff | do | **critical** | 2026-04-23 | ⭐ | open | 10min | light | — | mail
- `t20` | Valider convention modifiée Affejee (forfait 2025 inclus) | sci-start-adabu | do | high | 2026-04-25 | ⭐ | open | 40min | deep | ✅ | mail
- `t21` | Résoudre prélèvement CAM Expertise échoué (FEIRASIN Holding) | feirasin-holding | do | high | 2026-04-24 | — | open | 15min | light | ✅ | mail
- `t22` | Traiter demandes Tiime CAM Expertise (FEIRASIN Holding) | feirasin-holding | delegate | medium | 2026-04-28 | — | open | 20min | light | ✅ | mail
- `t23` | Vérifier mails suspects ALEFPA (cyberattaque 21/04) | mhssn-gouv | do | high | 2026-04-24 | ⭐ | open | 15min | light | ✅ | mail
- `t24` | Prendre décision suite Courrier du médecin (famille) | mhssn-gouv | do | medium | 2026-04-25 | — | open | 15min | medium | — | phone

### ETIC
- `t25` | Régler facture débours Affejee ETIC (dépôts comptes 2019-2023) | etic-services | do | high | 2026-04-25 | — | open | 10min | light | — | mail
- `t26` | Consolider accès bancaires ETIC / ITH / LTM / AA (CA) | etic-ith-ltm | plan | medium | 2026-05-02 | — | open | 45min | medium | ✅ | mail
- `t27` | Suivre dossier Ghams parcelle 1436 | etic-ghams | plan | low | 2026-05-10 | — | open | 30min | medium | — | mail
- `t28` | Traiter relance facture TERAO N°25.01060 | etic-services | delegate | medium | 2026-04-28 | — | open | 15min | light | ✅ | mail

### Bucket par défaut (rule-based) pour arbitrage matinal
- **FAIRE (top 3 P0/P1)** : t1, t2, t15 (les 3 critical du jour 23/04)
- **DÉLÉGUER (ai_capable=1 + critical/high)** : t3, t5, t8, t12, t14, t16, t21, t22, t23, t28
- **REPORTER (reste)** : t4, t6, t7, t9, t10, t11, t13, t17, t18, t20, t24, t25, t26, t27

---

## 10 DÉCISIONS

| ID | Titre | Date | Projet | Statut | Owner | Deadline | Tags |
|---|---|---|---|---|---|---|---|
| d1 | Tirage d'Avance AMANI PROPERTIES — conditions suspensives | 2026-04-23 | amani-credit | to-execute | Feyçoil | 2026-04-24 | banque, AMANI, urgent |
| d2 | Attestation modifiée PRET CA — signature parents | 2026-04-23 | amani-credit | to-execute | Feyçoil | 2026-04-24 | juridique, AMANI, notaire |
| d3 | Convention Affejee forfait 2025 inclus (SCI Start/Adabu) | 2026-04-21 | sci-start-adabu | to-execute | Feyçoil | 2026-04-25 | juridique, SCI |
| d4 | Report Réunion BREEAM après 30/04 | 2026-04-21 | amani-breeam | to-execute | Ocidim | 2026-04-30 | chantier, certification |
| d5 | Octroi de mer AMANI — impact enveloppe à chiffrer | 2026-04-17 | amani-chantier | to-execute | MTCMO | 2026-04-30 | AMANI, finance |
| d6 | Acter version finale contrat FF&E (Franklin/Bénédicte) | 2026-04-22 | amani-ffe | to-execute | Feyçoil | 2026-04-25 | AMANI, contrat |
| d7 | Vigilance cyber ALEFPA — messages suspects 20/04 | 2026-04-21 | mhssn-gouv | **executed** | Feyçoil | 2026-04-22 | cyber, conformité |
| d8 | Prélèvement CAM Expertise à rejouer — FEIRASIN | 2026-04-23 | feirasin-holding | to-execute | Feyçoil | 2026-04-25 | trésorerie |
| d9 | Exploitation AMANI — limites de prestations FTM/FF&E | 2026-04-21 | amani-exploit | to-execute | Ocidim | 2026-04-28 | AMANI, exploit |
| d10 | Dépôt FEDER MYT013568 — pièces avant 05/05 | 2026-04-23 | amani-feder | to-execute | Feyçoil | 2026-05-05 | subvention, AMANI |

Décisions onglet "Décidées" : d7 uniquement (cyber ALEFPA executed).

---

## 25 ÉVÉNEMENTS — AGENDA

### Cette semaine (S17 = 20-26 avril)

| ID | Date / Heure | Durée | Titre | Projet | Lieu |
|---|---|---|---|---|---|
| e6 | 22/04 18:00 | 60min | Weekly catch-up MHSSN | mhssn-gouv | Teams |
| e4 | 22/04 13:00 | 120min | 21-02-HOT. AMANI — MOE/MOA — Exploitant | amani-chantier | Teams |
| e9 | 23/04 07:00 | 150min | Réunion chantier AMANI | amani-chantier | Mayotte |
| e22 | 24/04 09:30 | 30min | Point honoraires Franklin (Machinet) | amani-legal | Téléphone |
| e17 | 24/04 10:00 | 45min | Rdv notaire LGoA — Attestation modifiée | amani-credit | Étude LGoA |
| e19 | 24/04 11:30 | 30min | Call Olivia You (Inter-Invest) — CPs restants | amani-credit | Teams |
| e23 | 24/04 14:00 | 30min | Call Marie Ansquer — confirmation tirage | amani-credit | Téléphone |
| e16 | 25/04 15:00 | 60min | Signature contrat FF&E AMANI | amani-ffe | Teams |
| e10 | 26/04 17:45 | 135min | Vie Feycoil + Lamiae — formalité mariage | (perso) | Teams |

### Semaine suivante (S18 = 27 avril-3 mai)

| ID | Date | Durée | Titre |
|---|---|---|---|
| e15 | 27/04 10:00 | 360min | Mission Mayotte — matériaux + visite chantier (amani-ffe) |
| e11 | 27/04 08:30 | 30min | QuickSync ETIC Management Board |
| e12 | 27/04 18:30 | 60min | Weekly catch-up MHSSN |
| e13 | 28/04 09:00 | 120min | Comité de pilotage Hôtel AMANI — limites FTM/FF&E |
| e24 | 28/04 14:00 | 120min | Arbitrage piscine AMANI — visite fournisseurs (Mayotte) |
| e29 | 29/04 18:00 | 60min | Mission Mayotte — retour & debrief (amani-ffe) |
| e14 | 30/04 07:00 | 150min | Réunion chantier AMANI |
| e20 | 04/05 17:00 | 30min | Dépôt dossier FEDER MYT013568 |
| e18 | 05/05 10:00 | 90min | Réunion BREEAM AMANI |
| e25 | 06/05 10:00 | 90min | AG approbation comptes SCI Start + Adabu |

---

## 25 CONTACTS

| ID | Nom | Org | Rôle | Tags | Projets |
|---|---|---|---|---|---|
| c1 | Marie Ansquer | CA Bretagne | Chargée d'affaires AMANI | banque, priorité | amani-credit |
| c2 | Olivia You | Inter-Invest | Montage financier | finance, priorité | amani-credit, amani-feder |
| c3 | Caroline Wadin | Inter-Invest | Directrice projets | finance, priorité | amani-credit |
| c4 | Thérèse Ho | Inter-Invest | Gestion dossier | finance | amani-credit |
| c5 | Alexandre Sirugue | LGoA Notaires | Notaire | juridique, priorité | amani-credit |
| c6 | Maeva Ferrere | LGoA Notaires | Clerc de notaire | juridique | amani-credit |
| c7 | Jean Hentgen | Franklin Paris | Avocat — FF&E | juridique, priorité | amani-ffe |
| c8 | Stéphan Alamowitch | Franklin Paris | Avocat à la Cour — honoraires | juridique | amani-legal |
| c9 | Géraldine Machinet | Franklin Paris | Comptabilité cabinet | compta | amani-legal |
| c10 | Michel Delafosse | MTCMO | MOD / MOA chantier AMANI | chantier, priorité | amani-chantier |
| c11 | Yann Cornec | Integrale | MOE AMANI | chantier, priorité | amani-chantier |
| c12 | Rémi Giannetti | Ocidim | Pilotage AMANI | chantier, priorité | amani-chantier, amani-breeam, amani-exploit |
| c13 | el-nachdy Selemani | Ocidim / SMTPC | Comité exécution AMANI | chantier | amani-chantier |
| c14 | Philippe Bourget | Vinci Construction | Entreprise générale | chantier | amani-chantier |
| c15 | Christophe Carlier | Viventium Hotels | Exploitant AMANI | exploit, priorité | amani-exploit, amani-chantier |
| c16 | David Affejee | Affejee & Associés | Avocat conseil famille | juridique, famille | mouhoussoune-aff, sci-start-adabu, etic-services |
| c17 | Mathilde Troquier | Affejee & Associés | Juriste | juridique | etic-services |
| c18 | Chafick Mouhoussoune | MHSSN | Associé / famille | famille, priorité | amani-ffe, mhssn-gouv |
| c19 | Djedid Mouhoussoune | MHSSN | Associé / famille | famille, priorité | amani-legal, mhssn-gouv |
| c20 | Thomas Delelis | CA Réunion | Chargé d'affaires AMANI | banque | amani-credit |
| c21 | Nassebati Said | Europe à Mayotte | Instructrice FEDER | subvention, priorité | amani-feder |
| c22 | Natacha Chaney | CVS Avocats | Avocat conseil | juridique | amani-credit, mhssn-gouv |
| c23 | Bénédicte DG Design | BdG Design | Design & FF&E AMANI | design, priorité | amani-ffe |
| c24 | Mouhamadil | ETIC Services | Board member | exec | etic-services |
| c25 | Lamiae | MHSSN / ETIC | Famille · Co-pilote | famille, exec | etic-services, sci-start-adabu |

Pour la page contacts, calculer un last-contact relatif :
- Marie Ansquer : il y a 1 j (call confirmé 24/04)
- Bénédicte : il y a 4 j (annotations PDF 22/04)
- Jean Hentgen : il y a 5 j (mail FF&E 21/04)
- David Affejee : il y a 5 j (relance 21/04)
- Chafick Mouhoussoune : il y a 4 j (Weekly MHSSN 22/04)
- Lamiae : aujourd'hui
- Mouhamadil : il y a 2 j (QuickSync 24/04)
- Rémi Giannetti : il y a 9 j (Comité exé 17/04)
- Yann Cornec : il y a 4 j
- Reste : valeurs >14j

---

## 9 AI PROPOSALS (cockpit AI cards)

Toutes ancrées sur des tâches/events réels.

| ID | Type | Titre | Source | Urgence | Gain estimé |
|---|---|---|---|---|---|
| p1 | email-draft | Brouillon : envoi Attestation Emprunteur à Marie Ansquer | task:t1 | now | ~10 min |
| p2 | email-draft | Brouillon : transfert observations Bénédicte → Jean Hentgen | task:t5 | now | ~8 min |
| p3 | email-draft | Brouillon : réponse FEDER MYT013568 à Nassebati Said | task:t17 | this-week | ~20 min |
| p4 | meeting-prep | Préparation : Comité de pilotage AMANI 28/04 | event:e13 | this-week | ~45 min |
| p5 | task-from-event | Créer tâches de prép. (9 événements prep_needed) | events | this-week | ~20 min |
| p6 | workload-rebalance | Vendredi 24/04 surchargé — lisser | calendar | now | Réduire risque |
| p7 | summary | Synthèse : 7 décisions à exécuter cette semaine | decisions | now | ~5 min |
| p8 | email-draft | Brouillon : relance prestataires Octroi de mer (MTCMO) | task:t9 | this-week | ~10 min |
| p9 | automation | Auto-archiver alertes ArchiLid récurrentes | task:t14 | this-week | ~15 min/sem |

---

## REVUES HEBDO (4 semaines)

### S15 (6-12 avril) — archivée
- **Intention** : Sécuriser le contrat de crédits AMANI (CA Bretagne, signature 02/04) et solder attestations FEDER.
- **Big Rocks** : Signer Contrat de Crédits 02/04 / Relance honoraires Franklin / Cadrer attestation TVA FEDER
- **Done** : Contrat Crédits AMANI signé 02/04, Honoraires Franklin facturés 08/04
- **Mood** : productive
- **Avancement** : 78%

### S16 (13-19 avril) — archivée
- **Intention** : Aligner MOE/MOA + Viventium sur chantier AMANI ; lancer revue contrat FF&E.
- **Big Rocks** : CoPil AMANI 14/04 / Comité exécution AMANI 17/04 / Revue FF&E Contract
- **Done** : CoPil 14/04 tenu, Comité exécution 17/04 tenu, V1 FF&E reçue
- **Pending** : Octroi de mer à instruire, FF&E Contract — relance Bénédicte
- **Decisions** : d5 (Octroi de mer)
- **Mood** : intense
- **Avancement** : 62%

### S17 (20-26 avril) — EN COURS
- **Intention** : Débloquer le tirage d'avance AMANI (attestations CA Bretagne + LGoA), signer contrat FF&E, et solder honoraires Affejee/Franklin.
- **Big Rocks (3, max)** :
  1. URGENT — Attestation Emprunteur + Attestation modifiée LGoA (tirage CA Bretagne)
  2. FF&E AMANI — intégrer observations Bénédicte et signer contrat Franklin 25/04
  3. MHSSN — régler honoraires Affejee (3ᵉ relance) + valider convention SCI Start/Adabu
- **Pending** : Attestations (t1, t2), Transfert obs Bénédicte (t5), Honoraires Affejee (t19)
- **Decisions actives** : d1, d2, d3, d6
- **Mood** : urgent
- **Avancement** : 40%

### S18 (27 avril-3 mai) — à venir
- **Intention** : (à définir dimanche 27/04 — auto-draft Claude possible)
- **Big items probables** : mission Mayotte 27/04, CoPil AMANI 28/04, Dépôt FEDER 05/05, AG SCI 06/05.

---

## 3 BIG ROCKS — semaine S17 (à utiliser sur cockpit)

1. **URGENT — Attestations CA Bretagne + LGoA** (avancement 60%, deadline 24/04)
2. **FF&E AMANI signé** (avancement 70%, deadline 25/04)
3. **Régler honoraires Affejee + convention SCI** (avancement 30%, deadline 25/04)

---

## 10 MAILS REÇUS — zone "Courriels du jour" arbitrage matinal

Sample 23/04/2026 matin :

| # | De | Sujet | Heure | Action suggérée |
|---|---|---|---|---|
| 1 | Marie Ansquer (CA Bretagne) | URGENT AMANI PROPERTIES / Contrat de Crédits 02/04 | 06:42 | → tâche t1 |
| 2 | Maeva Ferrere (LGoA) | URGENT Attestation modifiée à signer (23/04) | 07:15 | → tâche t2 |
| 3 | Stéphan Alamowitch (Franklin) | Honoraires Franklin (relance 22/04) | 07:32 | → tâche t15 |
| 4 | David Affejee | TR groupe MOUHOUSSOUNE assistance + RE approbation comptes | 07:48 | → tâche t19 |
| 5 | Chafick (FF&E AMANI) | Projet AMANI - FF&E Contract (chafick 22/04) | 08:01 | → tâche t5 |
| 6 | gocardless | Votre paiement à CAM EXPERTISE a échoué | 08:14 | → tâche t21 |
| 7 | Yann Cornec (Integrale) | 21-02-HOT. AMANI - GTC - Analyse devis ENERGIE CONCEPT | 08:23 | → tâche t10 |
| 8 | Nassebati Said (Europe-à-Mayotte) | INSTRUCTION FEDER MYT013568 (23/04) | 08:35 | → tâche t17 |
| 9 | (alerte sécurité) | IMPORTANT CYBER ATTAQUE (ALEFPA 21/04) | 08:42 | → tâche t23 |
| 10 | Géraldine Machinet (Franklin) | Dossier 96830001 - AMANI-RESORTS SAS (23/04) | 08:51 | → tâche t16 |

---

## 5 CONVERSATIONS ASSISTANT — sidebar

| Conv | Dernier message | Update |
|---|---|---|
| « Préparation CoPil AMANI 28/04 » | Donne-moi un ODJ précis avec 3 arbitrages clés et limites FTM/FF&E | il y a 12 min |
| « Octroi de mer — calculer impact » | Ajoute la fourchette basse/haute si on bascule en zone franche | il y a 1 h |
| « Relance Affejee — wording » | Le mot 'relance' est trop dur, propose une formulation plus diplomatique | hier |
| « FEDER pièces manquantes » | Liste-moi les 8 pièces de complétude par owner | hier |
| « Arbitrage piscine AMANI » | Compare les 3 prestataires sur SAV + délai + budget | il y a 3 j |

---

## CONVERSATION ASSISTANT EN COURS (vue principale chat)

```
USER: Donne-moi un ODJ précis pour le Comité de pilotage AMANI du 28/04, avec 3 arbitrages clés et le focus sur les limites FTM/FF&E.

ASSISTANT (streaming): Voici une proposition d'ODJ structurée pour le CoPil du 28/04 (durée 2h, présents : toi, Rémi Giannetti, Philippe Bourget, Michel Delafosse, el-nachdy.selemani) :

**1. Limites FTM vs FF&E — validation matrice (20 min, Ocidim)**
La matrice de répartition entre travaux fixes maître d'œuvre et fourniture FF&E doit être actée. Point bloquant remonté par Christophe Carlier le 22/04. Décision attendue : validation définitive ou cycle d'ajustement supplémentaire avec Vinci.

**2. Arbitrage prestataire piscine AMANI (15 min, toi)**
[curseur clignote…]
```

---

## STREAK DU SOIR

- Streak actuel : **12 jours consécutifs**
- Plus longue streak : 23 jours (mois précédent)
- Mois en cours : 12/30 jours validés (chips remplies dans calendar heatmap)

---

## COMPTEURS COCKPIT (jour 23/04)

- Tâches ouvertes : 28
- Tâches du jour : 6 (t1, t2, t5, t15, t19 critical + t3 high)
- Décisions ouvertes : 9
- RDV aujourd'hui : 3 (e9 chantier, e6 weekly MHSSN — passé, e22 honoraires — demain matin)
- Mails non triés (estimé) : 47

---

## ALERTES COCKPIT

| Type | Niveau | Message |
|---|---|---|
| outlook-stale | warn | Outlook synchronisé il y a 4h12 (seuil 4h dépassé) |
| overdue-tasks | critical | 2 tâches overdue : t15 (Honoraires Franklin) due ce matin, t1 (Attestation Marie Ansquer) due ce matin |
| big-rocks-incomplet | info | 1 Big Rock S17 sans tâche associée (#3 honoraires Affejee — vérifier rattachement) |

---

## DONNÉES POUR PAGE GROUPES (KPI par société)

| Groupe | Tâches actives | Décisions ouvertes | Projets actifs | Big Rock S17 |
|---|---|---|---|---|
| MHSSN | 7 | 1 (d3) | 4 | Convention SCI Affejee + honoraires |
| AMANI | 17 | 7 (d1, d2, d4, d5, d6, d9, d10) | 7 | Tirage CA Bretagne + FF&E |
| ETIC | 4 | 0 | 3 | Accès bancaires consolidés |
