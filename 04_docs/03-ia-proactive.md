# aiCEO — IA proactive & délégation

**Version 1.0 · 23 avril 2026 · Playbook du copilote**

> Ce document définit la philosophie, les patterns et les garde-fous du copilote aiCEO. Il complète `01-vision-produit.md` (axe 2 : proactivité) et s'articule avec `06-architecture.md` (mise en œuvre technique).

---

## 1. La grammaire de la proactivité

### 1.1 Le principe

Un copilote proactif **ne répond pas à la question posée — il pose la question suivante.** Là où un chat attend un prompt, aiCEO observe en continu les signaux disponibles (emails, agenda, fichiers, tâches, humeur déclarée) et émet des propositions.

Une proposition a toujours **cinq ingrédients** :

1. **Un déclencheur** : l'événement qui l'a fait naître (mail reçu, RDV à J-48h, tâche en retard de 3 jours…).
2. **Un diagnostic** : ce que l'IA a lu dans la situation, en une phrase.
3. **Une suggestion concrète** : action ou artefact rédigé, pas une question.
4. **Un gain estimé** : temps gagné, risque évité, délégation possible.
5. **Trois boutons** : *Valider* · *Ajuster* · *Ignorer*. Rien d'autre.

### 1.2 Le rythme

- **15 propositions par jour maximum** par défaut. Au-delà, le CEO est pollué plus qu'aidé.
- **Regroupement par vague** : les propositions sont poussées en 3 fenêtres (7h, 13h, 18h), pas en continu, pour ne pas fragmenter l'attention.
- **Urgence hiérarchisée** : *maintenant* (rouge doux), *aujourd'hui* (ambre), *cette semaine* (violet), *veille* (gris).
- **Veille muette en weekend** : aucune proposition poussée sam/dim sauf urgence critique qualifiée.

---

## 2. Taxonomie des propositions

Le copilote distingue **8 familles** de propositions. Chaque famille a ses règles d'activation, sa forme visuelle, et son niveau d'audace par défaut.

| Famille | Déclencheur typique | Exemple | Audace |
|---|---|---|---|
| **email-draft** | Mail reçu, urgence > J+2 | "Je t'ai rédigé une réponse au mail de Lloyds" | Forte |
| **meeting-prep** | RDV à J-48h | "Voici le brief pour le comité stratégique Adabu" | Forte |
| **task-from-event** | RDV requiert préparation | "Tu devras envoyer le PV avant mardi — je crée la tâche ?" | Moyenne |
| **workload-rebalance** | Charge > 110 % | "Ta semaine est saturée. Propose de déplacer 3 tâches à S19 ?" | Forte |
| **delegation-nudge** | Tâche éligible à délégation | "Cette tâche est typique de ce que Jean fait bien — je délègue ?" | **Très forte** |
| **followup-stale** | Absence de réponse > N jours | "Tu attendais un retour de X depuis 6 jours. Je relance ?" | Moyenne |
| **automation** | Motif répétitif détecté | "Tu fais ce pattern chaque semaine — je l'automatise ?" | Forte |
| **insight** | Anomalie détectée (KPI, agenda) | "Tes meetings ont augmenté de 30 % ce mois. Cause ?" | Faible (interroge) |

### 2.1 Les règles d'audace

L'**audace** d'une proposition = à quel point l'IA s'avance par rapport au CEO.

- **Faible** : l'IA constate et demande ("as-tu remarqué que…").
- **Moyenne** : l'IA suggère une action sans l'engager ("veux-tu que je fasse X ?").
- **Forte** : l'IA a préparé l'artefact, il suffit de valider ("voici le brouillon, clic pour envoyer").
- **Très forte** : l'IA est prête à déclencher une chaîne (ex : déléguer = créer tâche + rédiger mail + poser suivi).

L'**audace par défaut** se calibre sur 60 jours d'apprentissage :
- semaine 1-2 : audace faible partout (la confiance se gagne).
- semaine 3-6 : montée progressive par famille, si taux d'acceptation ≥ 60 %.
- semaine 7+ : audace forte par défaut, CEO peut redescendre manuellement.

---

## 3. Les boucles d'apprentissage

Trois boucles simultanées, à horizon différent.

### Boucle courte (intra-session)

Chaque action du CEO sur une proposition (Valider / Ajuster / Ignorer) alimente un **signal implicite** :

- Si **Validée** sans modification → l'IA continue dans cette direction.
- Si **Ajustée** → l'IA capture la différence texte original vs texte envoyé. C'est la source la plus précieuse d'apprentissage.
- Si **Ignorée** → l'IA réduit le score de cette famille de proposition pour ce contexte.

### Boucle moyenne (hebdomadaire)

Chaque dimanche soir, lors de la revue hebdo, le copilote présente au CEO **un bilan méta** :

- Nombre de propositions émises / acceptées / ajustées / ignorées.
- Familles qui marchent / qui polluent.
- **Patterns de modification** : "tu as reformulé 70 % de mes brouillons en ajoutant la formule "Bien à toi" — je l'intègre par défaut ?"
- Ajustement du **profil stylistique** (ton, longueur, formules d'ouverture/clôture).

### Boucle longue (trimestrielle)

Tous les 90 jours, re-calibrage :

- Mise à jour du **prompt système** personnel du CEO (ses red lines, préférences, valeurs explicitées).
- Révision des **règles d'audace** par famille.
- **Élagage** de la mémoire long-terme (quelles préférences sont obsolètes ?).

---

## 4. La mémoire long-terme

C'est le moat (leçon d'Athena). Trois strates.

### Strate 1 · Identité

Ce qui ne change pas : valeurs, tolérance au risque, red lines absolues, personnes clés, entités gérées.

Exemples :
- `red_line: "jamais de mail envoyé sans relecture CEO avant 22h"`
- `preferred_close: "Bien à toi,\nFeycoil"`
- `delegation_trust: { "Jean Dupuis": 0.85, "Marie Roux": 0.90 }`

Stockage : fichier `profil.yaml` versionné, édité avec le CEO lors des revues trimestrielles.

### Strate 2 · Préférences émergentes

Ce qui se capture par observation :

- Style d'écriture (longueur moyenne, registre, formules).
- Créneaux préférés pour tel type de tâche (mails le matin, créatif l'après-midi).
- Partenaires avec qui les échanges sont formels / informels.
- Sujets qui déclenchent systématiquement une exécution personnelle vs une délégation.

Stockage : base vectorielle (pgvector) indexée par (domaine, contexte, date).

### Strate 3 · Épisodes

Les souvenirs datés — conversations importantes, décisions prises, contextes de chaque société.

- "Le 12/04, comité Adabu a acté le go sur le POC data center — Philippe responsable."
- "Le CEO a refusé en décembre la proposition d'ouvrir Maroc — budget trop serré."

Stockage : append-only log, indexable sémantiquement. Jamais édité, seulement annoté.

---

## 5. La délégation comme fonctionnalité première

### 5.1 Pourquoi c'est le cœur

Feycoil a tendance à tout faire lui-même. Un outil qui l'aide à "faire plus" ne l'aide pas — il amplifie son sur-engagement. Un outil qui l'aide à **faire faire** lui rend du temps réel.

**Règle de conception** : chaque écran qui affiche des tâches doit proposer la délégation comme action de premier niveau, à égalité avec "faire maintenant".

### 5.2 Le pattern "délégation en un clic"

Quand une tâche est créée, l'IA évalue 4 critères :

1. **Délégabilité** (est-ce du travail que quelqu'un d'autre pourrait faire ?)
2. **Propriétaire naturel** (quel membre de l'équipe serait le meilleur ?)
3. **Brief ready** (l'IA peut-elle rédiger le brief tout seul ?)
4. **Follow-up possible** (sait-on quand relancer ?)

Si les 4 passent, le bouton "Déléguer" apparaît en couleur vive à côté de "Faire". Un clic déclenche :

1. **Création de tâche** dans l'outil de l'équipier (Teams Planner, Asana, Trello…).
2. **Mail de brief** pré-rédigé avec contexte, attendu, date limite, pièces jointes.
3. **Entrée dans le suivi** (relance J+2 si pas lu, J+5 si pas avancé).
4. **Notification au CEO** quand la tâche est livrée, avec résumé de ce qui a été produit.

### 5.3 Le nudge anti-perfectionnisme

Si le CEO a exécuté **3 tâches déléguables** la même journée (par réflexe), le copilote émet en fin de journée un message calme :

> *"Tu as fait 3 choses aujourd'hui que tu aurais pu confier à Jean ou Marie. Ce n'est pas grave — mais demain, veux-tu que je te le signale *avant* que tu ne commences ?"*

Validation → Le lendemain, dès qu'une tâche déléguable est créée, l'IA la pré-attribue avant que le CEO ne clique sur "Faire".

### 5.4 La matrice de confiance par équipier

Pour chaque membre de l'équipe, l'IA maintient une **matrice de confiance implicite** à 5 dimensions :

- Fiabilité de livraison (livre-t-il à temps ?)
- Qualité au standard CEO (besoin de reprendre ?)
- Initiative (fait-il plus que demandé ?)
- Communication (tient-il au courant ?)
- Maturité sujet (maîtrise-t-il le domaine ?)

Ces scores évoluent à chaque tâche livrée. Ils alimentent le choix du propriétaire naturel et ne sont **jamais exposés à l'équipier** (sensibilité RH).

---

## 6. Les patterns d'exécution autonome

Il existe des actions que le copilote peut effectuer **sans validation** — à condition qu'elles soient réversibles et que le CEO les ait autorisées en onboarding.

### Actions autonomes (whitelist par défaut)

- Déplacer un RDV non critique après accord tacite de l'autre partie (ex : call interne).
- Archiver des mails newsletter identifiés comme lus.
- Marquer des tâches comme terminées quand un mail de livraison arrive.
- Mettre à jour le statut d'une proposition acceptée.
- Pré-rédiger un brouillon de réponse (sauvegardé en draft Outlook, pas envoyé).

### Actions toujours human-in-the-loop

- Envoyer un mail sortant.
- Supprimer un fichier ou un mail.
- Engager le CEO sur un RDV sans demander.
- Communiquer avec un partenaire externe.
- Modifier une donnée métier (CRM, ERP).
- Toute action qui touche l'argent, le juridique, le personnel.

---

## 7. Anti-patterns à éviter

- **Le chatbot tombeau.** Si le CEO a besoin de *taper* pour activer l'IA, on a déjà perdu. L'IA doit arriver sur l'écran que le CEO regarde déjà.
- **La transparence qui noie.** Expliquer chaque raisonnement du modèle en 5 paragraphes étouffe. On expose une **raison en une ligne** ; le détail est derrière un clic "pourquoi ?".
- **La proposition sans action.** Toute proposition doit avoir un CTA clair. "Tu as 3 tâches en retard" sans bouton = bruit.
- **L'avalanche du lundi matin.** Le copilote ne doit jamais afficher plus de 5 propositions en arrivée matinale. Les autres attendent 13h.
- **Le ton injonctif.** "Tu dois déléguer" → interdit. "Tu as 3 tâches déléguables — veux-tu que je prépare les briefs ?" → ok.

---

## 8. Signaux contextuels à intégrer

Le copilote écoute (avec consentement explicite) :

- **Outlook** : emails reçus/envoyés, catégories, priorités Microsoft, flags.
- **Calendrier** : événements à venir, précédents, participants, lieux.
- **SharePoint** : documents modifiés récemment, partages reçus.
- **Teams** : messages directs non lus, mentions dans canaux.
- **Tâches** : création, statut, dérives de délai.
- **Humeur déclarée** : score 1-5 au check-in matin + tag émotionnel optionnel.
- **Streak** : jours consécutifs de rituel matin, jours de shutdown effectif.
- **Localisation** (opt-in) : en déplacement vs bureau → adapte les propositions.

### Signaux à inférer (par analyse)

- **Charge cognitive** : nombre de meetings back-to-back, longueur des plages sans respiration.
- **Surcharge émotionnelle** : fréquence des notifications weekend, mails envoyés après 22h, langage plus sec dans les mails.
- **Saturation décisionnelle** : ratio propositions acceptées / ignorées en baisse → le CEO est cognitive-overload.

---

## 9. Exemples concrets (walkthrough)

### Scénario A — Lundi matin, 7h45

Le CEO ouvre aiCEO. L'IA a travaillé pendant la nuit.

**Cockpit affiche :**

> ✨ *Copilote · 8 propositions préparées · gain estimé 47 min*
>
> 1. **email-draft** · Réponse à Lloyds (qui traîne depuis 6 jours). *Ton : cordial mais ferme. Gain : 8 min.* [Valider] [Ajuster] [Ignorer]
> 2. **meeting-prep** · Brief comité stratégique Adabu (jeudi 14h). *3 points clés : go/no-go POC, arbitrage budget, nomination Philippe.* [Ouvrir le brief]
> 3. **delegation-nudge** · Tâche "rédiger support AMANI" → Marie. *Matrice confiance : 0.90. Brief prêt.* [Déléguer] [Faire moi-même]
> 4. **workload-rebalance** · Mardi saturé à 120 %. *2 tâches à déplacer : validation SCI (reportable S18), relance Paul (non critique).* [Appliquer]
> *... 4 autres*

Feycoil clique "Valider" sur (1), "Ouvrir" sur (2), "Déléguer" sur (3), "Appliquer" sur (4). **4 clics, 4 actions, 47 min gagnées.**

### Scénario B — Mercredi 18h

Fin de journée. Le CEO va fermer.

L'IA pousse le **shutdown rituel** :

> 🌙 *Fin de journée · 3 petites questions*
>
> **1 · As-tu fait ce qui comptait aujourd'hui ?** *(oui / partiellement / non)*
>
> **2 · Sur un mot, comment tu te sens ?** *(lucide / tendu / fatigué / stimulé)*
>
> **3 · Trois choses à reporter à demain** *(présélectionnées par l'IA : relire mémo, appeler X, valider Y)*

Puis :

> *Journée bien remplie. Tu as délégué 3 fois et fait 2 tâches critiques — c'est exactement le ratio qu'on vise. Bonne soirée — je reprends demain 6h00.*

L'interface bascule en mode "nuit" : fond sombre, pas de nouvelles propositions, seules les urgences critiques passent.

### Scénario C — Dimanche 19h30

Revue hebdo.

> ✨ *Revue S17 · l'IA a pré-rempli*
>
> **Bilan S17** · 3 Big Rocks validés, 1 décalé. Gain IA acceptée : 4h30. Taux acceptation : 68 %.
>
> **Ce que j'ai appris de toi** · Tu préfères "Bien à toi" à "Cordialement" (intégré). Tu reportes systématiquement les relances Lloyds au mardi (appris). Tu acceptes 85 % de mes délégations à Marie, 45 % à Jean (je te pousse plus Marie).
>
> **Proposition S18** · Intention : *terrain Mayotte*. 3 Big Rocks : PV chantier, comité strat Adabu, dossier juridique SCI. 14 tâches pré-planifiées. Mercredi bloqué pour focus.
>
> [Valider S18] [Ajuster]

---

## 10. KPIs de succès du copilote

| Métrique | Seuil minimal (S+30) | Cible (S+180) |
|---|---|---|
| Taux d'acceptation propositions | ≥ 40 % | ≥ 60 % |
| Propositions/jour actives | 8-12 | 12-15 |
| Tâches déléguées / semaine | ≥ 5 | ≥ 15 |
| Ratio délégation / exécution CEO | 30 % | 55 % |
| Temps CEO gagné / semaine (déclaré) | ≥ 3 h | ≥ 8 h |
| Heure médiane shutdown | 20h00 | 19h15 |
| NPS du copilote (à 90 jours) | ≥ 50 | ≥ 75 |

---

## 11. Garde-fous éthiques et psychologiques

- **Le CEO reste pilote.** L'IA propose, le CEO décide. Aucune action écriture sans clic.
- **Le refus doit être aussi respecté que l'acceptation.** Si une famille de propositions est ignorée 10 fois, l'IA la désactive jusqu'à ce que le CEO la réactive.
- **Pas de nudge émotionnel manipulateur.** On n'utilise pas la culpabilité, la peur, l'urgence rouge. La tonalité reste calme et respectueuse.
- **Pas de surveillance déguisée.** Si une donnée est lue (emails, fichiers), elle est lisible dans le dashboard transparence du CEO à tout moment.
- **Droit à l'oubli.** Le CEO peut purger à tout moment une catégorie de mémoire, un équipier, un sujet.

---

## 12. Évolution v2+ : l'IA comme coach stratégique

Au-delà du copilote d'exécution, ambition v2 : un **coach stratégique hebdomadaire**.

- Questions socratiques sur les arbitrages importants ("pourquoi cette décision plutôt qu'une autre ?").
- Détection de patterns auto-destructeurs ("tu acceptes systématiquement les meetings du vendredi, mais tu finis épuisé le lundi — pattern à casser ?").
- Challenge bienveillant sur les Big Rocks ("tu portes cette initiative depuis 3 mois sans avancer — est-ce toujours le bon moment ?").
- Propositions de recul ("tu n'as pas eu de journée off depuis 23 jours — je propose vendredi ?").

Cette couche exige une mémoire long-terme mature (strate Identité + Épisodes croisées) et un modèle conversationnel à haute compétence (Claude Opus 4.6+). Elle ne viendra pas avant 12 mois d'usage, quand la confiance est gagnée.

---

*Document lié : `01-vision-produit.md` · `05-coaching-ux.md` · `06-architecture.md`*
