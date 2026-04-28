# Tenant démo & personae génériques — aiCEO v0.5 SaaS

> Remplace `07-datasets-elargi.md` pour la v3.
> Le tenant démo "Northwind Holdings" représente un CEO multi-entités générique.
> Pas de données identifiantes réelles. Données crédibles mais 100 % fictives.

## Le tenant démo principal : Northwind Holdings

**Persona CEO** :
- **Nom** : Sarah Chen
- **Rôle** : Founder & CEO, Northwind Holdings
- **Contexte** : Pilote 3 entités via une holding familiale, basée à Genève. Anglophone, pratique aussi le français.
- **Ancienneté entrepreneuriat** : 12 ans
- **Avatar** : initiales "SC" sur fond `--brand-50`

**Salutation** :
- FR : "Bonjour Sarah,"
- EN : "Good morning, Sarah,"

## 3 entités (= "houses" au choix de Sarah)

Northwind utilise le vocabulaire **"house"** plutôt que "groupe". Le settings le confirme.

| House | Tagline | Couleur | Couleur hex | Description |
|---|---|---|---|---|
| **Northwind Capital** | Family office · Private equity | indigo | `#3d4e7d` | Holding familial, gestion patrimoniale, participations minoritaires dans 4 PME, immobilier locatif Suisse + France |
| **Solstice Hospitality** | Boutique hotels · Mediterranean | rose/coral | `#d96d3e` | Groupe d'hôtellerie haut de gamme : 3 hôtels (Mallorca, Capri, Cassis), exploitation directe + spa, 65 collaborateurs |
| **Helix Services** | B2B tech consulting · DACH region | amber | `#b88237` | Cabinet de conseil tech, basé Berlin + Zurich, 28 consultants, focus retail & finance |

Couleurs CSS :
- Northwind Capital → `--house-northwind: #3d4e7d` (indigo)
- Solstice Hospitality → `--house-solstice: #d96d3e` (rose)
- Helix Services → `--house-helix: #b88237` (amber)

## 12 sociétés réparties

| Société | House | Type |
|---|---|---|
| Northwind Capital SA | Northwind | Holding |
| Northwind Properties Sàrl | Northwind | SCI / SCPI |
| Tarrant Industries (participation 32%) | Northwind | PME industrielle |
| Lumen Wellness (participation 18%) | Northwind | PME santé |
| Solstice Hospitality Group | Solstice | Groupe hôtelier |
| Solstice Mallorca SA | Solstice | Hôtel-spa |
| Solstice Capri SA | Solstice | Hôtel boutique |
| Solstice Cassis SAS | Solstice | Hôtel boutique |
| Helix Services GmbH | Helix | Conseil tech |
| Helix Berlin GmbH | Helix | Filiale opérationnelle |
| Helix Zurich AG | Helix | Filiale opérationnelle |
| Helix Labs (R&D) | Helix | Filiale R&D |

## 12 projets actifs cross-houses

### Northwind Capital (3)

| ID | Nom | Tagline | Statut | Avancement |
|---|---|---|---|---|
| `nw-governance` | Pacte d'actionnaires v2 | Famille · cyber · conformité | active | 55 % |
| `nw-tarrant` | Audit prise de participation Tarrant | Due diligence financière · juridique | hot | 70 % |
| `nw-properties` | Refinancement portefeuille immo | 4 lignes · 3 banques | active | 40 % |

### Solstice Hospitality (5)

| ID | Nom | Tagline | Statut | Avancement |
|---|---|---|---|---|
| `sol-mallorca-spa` | Extension spa Mallorca | FF&E · architecture · ouverture été 26 | hot | 65 % |
| `sol-capri-renov` | Rénovation Capri (saison fermée) | 12 chambres · planning serré | hot | 58 % |
| `sol-financing` | Crédit-relais saison été | 2 banques · garanties croisées | hot | 45 % |
| `sol-staffing` | Pré-recrutement saison été 26 | 28 postes · 4 sites | active | 30 % |
| `sol-certification` | Certification BREEAM Mallorca | Hôtel pilote durabilité | active | 25 % |

### Helix Services (4)

| ID | Nom | Tagline | Statut | Avancement |
|---|---|---|---|---|
| `helix-major-account` | Renouvellement contrat major bank | Suisse · 18 mois · 2.4 MEUR | hot | 80 % |
| `helix-recruitment` | Recrutement 5 seniors Berlin | Backend · Fullstack · DevOps | active | 35 % |
| `helix-rebrand` | Refonte identité visuelle Helix | Site · pitch deck · LinkedIn | active | 50 % |
| `helix-r&d` | Lancement Helix Labs (R&D) | Stratégie · positionnement · 3 POCs | new | 15 % |

## 25 contacts génériques

Personae anglophone-friendly (suite à un CEO basé Genève qui travaille en plusieurs langues).

| ID | Nom | Org | Rôle | Tags | Projets liés |
|---|---|---|---|---|---|
| c1 | Marc Dupont | Banque Privée Suisse | Senior banker | banque, priorité | nw-properties, sol-financing |
| c2 | Léa Moreau | Cabinet Lefèvre | Avocate associée | juridique, priorité | nw-governance, nw-tarrant |
| c3 | David Park | Park & Associés | Notaire | juridique, priorité | nw-governance |
| c4 | Anya Petrova | Inter-Capital | Montage financier | finance, priorité | sol-financing, nw-tarrant |
| c5 | Jonas Keller | Studio Keller | Architecte hôtelier | design, priorité | sol-mallorca-spa, sol-capri-renov |
| c6 | Isabella Romano | Romano Consulting | Hospitality director | exploit, priorité | sol-staffing |
| c7 | Tobias Brandt | Helix Berlin | Managing director | exec, famille | helix-recruitment, helix-r&d |
| c8 | Mei Tanaka | Helix Zurich | Operations lead | exec | helix-major-account |
| c9 | Léon Rousseau | Banque Crédit Helvétique | Chargé d'affaires | banque | sol-financing |
| c10 | Karim Habib | Habib Frères Construction | Maître d'œuvre | chantier, priorité | sol-mallorca-spa |
| c11 | Olivia Wright | Wright Brand Studio | Brand strategist | design | helix-rebrand |
| c12 | Henrik Müller | Müller Tax Advisors | Fiscaliste | compta | nw-governance, helix-r&d |
| c13 | Sofia Costa | Capri Boutique Hotels Network | Pair CEO | network | sol-capri-renov |
| c14 | Daniel Reyes | Reyes Cyber Audit | Cybersécurité | conformité | nw-governance |
| c15 | Valentina Russo | Russo Talent | Recruiter senior | RH | helix-recruitment |
| c16 | Pierre Lambert | Lambert Notaires | Notaire patrimoine | juridique, famille | nw-governance, nw-properties |
| c17 | Aisha Khan | Khan Energy Consulting | Consultante BREEAM | certification | sol-certification |
| c18 | Markus Weber | Weber Holding (associé) | Co-actionnaire Tarrant | famille, priorité | nw-tarrant |
| c19 | Linh Nguyen | Nguyen Capital Advisors | Conseil M&A | finance | nw-tarrant |
| c20 | Carlos Mendes | Mendes Hospitality Tech | Software vendor | exploit | sol-staffing |
| c21 | Julia Steiner | Steiner Architecture | Architecte intérieur | design | sol-capri-renov |
| c22 | Yusuf Demir | Demir Insurance Group | Courtier assurances | conformité | nw-properties, sol-mallorca-spa |
| c23 | Charlotte Bishop | Bishop Recruitment | Hospitality recruiter | RH | sol-staffing |
| c24 | Rafael Silva | Silva Wealth Management | Gestionnaire patrimoine | finance, famille | nw-properties |
| c25 | Emma Lindberg | Lindberg & Co | Family office Sweden | famille, network | nw-governance |

## 25 tâches arbitrage S17 (semaine 20-26 avril)

### Northwind Capital (5)

- `t1` | Valider draft pacte v2 reçu de Léa Moreau | nw-governance | do | **critical** | 23/04 | ⭐ | 30 min | deep | non | mail
- `t2` | Signer attestation patrimoniale (notaire David Park) | nw-governance | do | **critical** | 23/04 | ⭐ | 15 min | light | non | mail
- `t3` | Examiner dossier DD Tarrant (Anya Petrova) | nw-tarrant | do | high | 25/04 | ⭐ | 90 min | deep | non | mail
- `t4` | Confirmer mandat refinancement à Marc Dupont | nw-properties | do | high | 24/04 | — | 15 min | light | oui | mail
- `t5` | Préparer call associé Markus Weber sur Tarrant | nw-tarrant | plan | high | 26/04 | — | 30 min | medium | oui | meeting

### Solstice Hospitality (10)

- `t6` | Valider devis FF&E Spa Mallorca avec Jonas Keller | sol-mallorca-spa | do | **critical** | 23/04 | ⭐ | 60 min | deep | non | mail
- `t7` | Signer contrat-cadre Habib Frères (chantier) | sol-mallorca-spa | do | **critical** | 23/04 | ⭐ | 20 min | light | non | mail
- `t8` | Régler honoraires Studio Keller (relance #2) | sol-mallorca-spa | do | high | 24/04 | — | 5 min | light | non | mail
- `t9` | Statuer sur le planning Capri (12 chambres rénovation) | sol-capri-renov | do | high | 25/04 | ⭐ | 45 min | deep | non | mail
- `t10` | Valider dossier crédit-relais transmis aux 2 banques | sol-financing | do | high | 28/04 | ⭐ | 30 min | medium | oui | mail
- `t11` | Préparer comité hospitality 28/04 | sol-mallorca-spa | plan | high | 27/04 | ⭐ | 45 min | deep | oui | meeting
- `t12` | Lancer campagne pré-recrutement (28 postes) | sol-staffing | delegate | medium | 25/04 | — | 20 min | medium | oui | mail
- `t13` | Confirmer audit BREEAM Mallorca (Aisha Khan) | sol-certification | do | medium | 26/04 | — | 15 min | light | oui | mail
- `t14` | Valider convention assurances saison été (Yusuf Demir) | sol-mallorca-spa | do | medium | 28/04 | — | 25 min | medium | oui | mail
- `t15` | Répondre à Sofia Costa (network Capri Boutique) | sol-capri-renov | do | low | 30/04 | — | 10 min | light | oui | mail

### Helix Services (10)

- `t16` | Finaliser proposition major bank (Mei Tanaka) | helix-major-account | do | **critical** | 24/04 | ⭐ | 120 min | deep | non | meeting
- `t17` | Signer offres 2 candidats seniors Berlin | helix-recruitment | do | high | 25/04 | ⭐ | 30 min | medium | non | mail
- `t18` | Valider charte graphique Helix (Olivia Wright) | helix-rebrand | do | high | 27/04 | — | 45 min | deep | non | mail
- `t19` | Brief stratégique Tobias Brandt sur R&D Labs | helix-r&d | plan | high | 26/04 | ⭐ | 60 min | deep | oui | meeting
- `t20` | Régler honoraires Habib Brand Studio | helix-rebrand | do | medium | 25/04 | — | 5 min | light | non | mail
- `t21` | Réviser SLA contrat major bank | helix-major-account | do | medium | 26/04 | — | 40 min | medium | oui | mail
- `t22` | Confirmer participation conférence Berlin (Helix R&D) | helix-r&d | do | medium | 28/04 | — | 10 min | light | oui | mail
- `t23` | Vérifier alertes phishing IT (cybersécurité) | nw-governance | do | high | 24/04 | ⭐ | 15 min | light | oui | mail
- `t24` | Programmer call Daniel Reyes (audit cyber Q2) | nw-governance | do | low | 30/04 | — | 10 min | light | oui | mail
- `t25` | Traiter pré-validation tax structure Helix Labs (Henrik Müller) | helix-r&d | delegate | medium | 28/04 | — | 25 min | medium | oui | mail

## 8 décisions ouvertes

| ID | Titre | Date | Projet | Owner | Deadline | Tags |
|---|---|---|---|---|---|---|
| d1 | Approuver pacte d'actionnaires v2 (Léa Moreau) | 23/04 | nw-governance | Sarah | 25/04 | juridique, famille |
| d2 | Acter Spa Mallorca — extension salle de soins (35 m²) | 22/04 | sol-mallorca-spa | Sarah | 26/04 | hospitality |
| d3 | Trancher prise de participation Tarrant (32 % → 40 % ?) | 21/04 | nw-tarrant | Sarah | 30/04 | M&A, famille |
| d4 | Choisir banque chef de file refinancement immo (3 propositions) | 20/04 | nw-properties | Sarah | 28/04 | finance |
| d5 | Recruter 5 ou 7 seniors Berlin ? | 22/04 | helix-recruitment | Sarah | 25/04 | RH, exec |
| d6 | Validation finale charte graphique Helix (3 directions) | 21/04 | helix-rebrand | Sarah | 27/04 | design |
| d7 | Externaliser ou internaliser cyber audit Northwind ? | 20/04 | nw-governance | Sarah | 30/04 | cyber |
| d8 | Lancer Helix Labs en Suisse ou Berlin ? | 19/04 | helix-r&d | Sarah | 30/04 | M&A, exec |

## 25 RDV (cette semaine + prochaine)

Déjà passés :
- 22/04 18h00 (60 min) | Weekly catch-up Northwind Capital | nw-governance | Teams | Sarah, Henrik, Markus
- 22/04 14h30 (90 min) | Comité hospitality Solstice | sol-mallorca-spa | Teams | Sarah, Isabella, Jonas, Karim
- 21/04 09h30 (60 min) | Helix Berlin Management Board | helix-recruitment | Teams | Sarah, Tobias, Valentina

À venir cette semaine S17 :
- 23/04 09h00 (45 min) | Call Léa Moreau — pacte v2 | nw-governance | Visio | Sarah, Léa
- 24/04 10h00 (60 min) | Rdv David Park — signature attestation | nw-governance | Étude Park | Sarah, David
- 24/04 11h30 (30 min) | Call Marc Dupont — refinancement | nw-properties | Téléphone | Sarah, Marc
- 24/04 14h00 (60 min) | Call Anya Petrova — DD Tarrant | nw-tarrant | Visio | Sarah, Anya, Linh
- 24/04 16h00 (45 min) | Helix Major Bank — review proposition | helix-major-account | Visio | Sarah, Mei, Tobias
- 25/04 10h00 (60 min) | Signature contrat Habib Frères | sol-mallorca-spa | Bureau Genève | Sarah, Karim, Notaire
- 25/04 14h00 (45 min) | Interview candidat senior #1 Berlin | helix-recruitment | Visio | Sarah, Tobias, Valentina
- 25/04 16h00 (45 min) | Interview candidat senior #2 Berlin | helix-recruitment | Visio | Sarah, Tobias, Valentina
- 26/04 17h45 (90 min) | Vie privée — perso bloquée | (perso) | — | Sarah

S18 (semaine prochaine) :
- 27/04 09h00 (180 min) | Mission Mallorca — visite chantier extension spa | sol-mallorca-spa | Mallorca | Sarah, Jonas, Karim
- 27/04 14h00 (60 min) | Audit BREEAM Mallorca avec Aisha Khan | sol-certification | Mallorca | Sarah, Aisha
- 28/04 09h00 (90 min) | Comité hospitality Solstice — Q2 review | sol-mallorca-spa | Visio | Sarah, Isabella, Jonas, Karim
- 28/04 11h00 (60 min) | Call Markus Weber — décision Tarrant | nw-tarrant | Téléphone | Sarah, Markus
- 28/04 15h00 (30 min) | Décision banque refinancement | nw-properties | Visio | Sarah, Marc, Léon, Anya
- 29/04 09h00 (60 min) | Helix Berlin — brief R&D Labs | helix-r&d | Visio | Sarah, Tobias, Mei
- 29/04 18h00 (60 min) | Mission Mallorca — debrief retour | sol-mallorca-spa | Visio | Sarah, Isabella
- 30/04 09h00 (60 min) | Comité Northwind family — pacte v2 | nw-governance | Genève | Sarah, Markus, Emma, Linh
- 30/04 14h00 (45 min) | Call Daniel Reyes — audit cyber Q2 | nw-governance | Visio | Sarah, Daniel
- 02/05 10h00 (90 min) | AG Northwind Capital | nw-governance | Bureau Genève | Sarah, Markus, famille
- 03/05 14h00 (60 min) | Bilan Helix mensuel | helix-major-account | Berlin | Sarah, Tobias, Mei

## Dernier contact (last-contact pour page Contacts)

- Léa Moreau : aujourd'hui (relance pacte 23/04)
- Marc Dupont : il y a 2 j (mail refinancement 21/04)
- Anya Petrova : il y a 1 j (DD Tarrant 22/04)
- Tobias Brandt : il y a 1 j (Helix board 22/04)
- Karim Habib : il y a 4 j (chantier 19/04)
- David Park : aujourd'hui (signature 23/04)
- Reste : valeurs entre 5j et 25j

## 9 AI Proposals (cockpit AI cards)

| ID | Type | Titre | Source | Urgence |
|---|---|---|---|---|
| p1 | email-draft | Brouillon : confirmation mandat à Marc Dupont | t4 | now |
| p2 | email-draft | Brouillon : réponse à Léa Moreau (pacte v2) | t1 | now |
| p3 | meeting-prep | Préparation : call DD Tarrant 24/04 | t3 | this-week |
| p4 | meeting-prep | Préparation : comité hospitality 28/04 | t11 | this-week |
| p5 | task-from-event | Créer tâches de prép pour 5 RDV upcoming sans tasks | events | now |
| p6 | workload-rebalance | Vendredi 25/04 surchargé (3 RDV + 4 tâches deep) | calendar | now |
| p7 | summary | Synthèse : 5 décisions à trancher cette semaine | decisions | now |
| p8 | email-draft | Brouillon : campagne pré-recrutement | t12 | this-week |
| p9 | automation | Auto-archiver alertes phishing récurrentes | t23 | this-week |

## 3 Big Rocks de la semaine

1. **Pacte d'actionnaires v2 validé** (60 %) — deadline 25/04
2. **Spa Mallorca — engagement Habib Frères** (75 %) — deadline 23/04
3. **Major bank Helix renouvellement OK** (80 %) — deadline 26/04

## Top 3 du jour (post-arbitrage 23/04)

1. t6 — Valider devis FF&E Spa Mallorca (P0, 60 min)
2. t7 — Signer contrat-cadre Habib Frères (P0, 20 min)
3. t1 — Valider draft pacte v2 (P0, 30 min)

## Streak du soir

- Streak actuel : 18 jours consécutifs
- Plus longue streak : 31 jours
- Mois en cours : 18/26 jours validés

## Compteurs cockpit (jour 23/04)

- Tâches ouvertes : 25
- Tâches du jour : 7 (3 critical + 4 high)
- Décisions ouvertes : 8
- RDV aujourd'hui : 1 + 2 calls
- Mails non triés : 38

## Alertes cockpit (démo)

| Type | Niveau | Message |
|---|---|---|
| outlook-stale | warn | Outlook synchronisé il y a 4h12 |
| overdue-tasks | critical | 2 tâches en retard : t6 (Devis FF&E Spa) et t7 (Contrat Habib) due ce matin |
| big-rocks-incomplet | info | Big Rock #2 sans tâche tracker associée |

## Vocabulaire localisable

| Concept | FR | EN |
|---|---|---|
| Cockpit | Cockpit | Cockpit |
| Big Rocks | Big Rocks | Big Rocks |
| Boucle du soir | Boucle du soir | Evening close |
| Arbitrage matinal | Arbitrage matinal | Morning triage |
| Faire | Faire | Do |
| Déléguer | Déléguer | Delegate |
| Reporter | Reporter | Defer |
| Décision | Décision | Decision |
| Contact | Contact | Contact |
| Société | Société | Company |
| House (entité) | Groupe / House | House / Group |
| Streak | Streak | Streak |
| Revue hebdo | Revue hebdo | Weekly review |

## Fonction "switcher persona démo" (index-nav)

L'index navigation propose un switcher pour montrer 3 archétypes :

1. **Sarah Chen — Northwind Holdings** (3 houses, family office) — *DÉFAUT*
2. **Marcus Lefèvre — Acme Industries** (5 entités, industriel multi-business)
3. **Yuki Tanaka — Stratos Studio** (1 entité, solo CEO + assistant)

Pour la maquette v3, on ne livre QUE le persona Sarah Chen. Le switcher montre les 2 autres en placeholder grisé avec "Bientôt disponible".
