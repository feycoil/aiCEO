# aiCEO — Coaching & anti-surchauffe

**Version 1.0 · 23 avril 2026 · UX psycho pour un CEO sur-engagé**

> Ce document définit la couche émotionnelle et psychologique d'aiCEO : tonalité, rituels, mécanismes anti-burnout, coaching intégré. Il répond au profil de Feycoil : perfectionniste, manager intense, difficulté à déléguer, tendance à en faire trop.

---

## 1. La thèse psychologique

Un CEO multi-sociétés vit trois régimes cognitifs qui s'alternent dans une même journée :

**Régime 1 · Pilotage opérationnel** — exécution rapide, tri mails, validations. Cerveau en mode réactif.
**Régime 2 · Décision stratégique** — arbitrage sur un dossier important. Cerveau en mode réflexif.
**Régime 3 · Leadership relationnel** — conversation humaine (coach, coachée, équipier). Cerveau en mode empathique.

Ces trois régimes ont des **coûts cognitifs très différents**. Les superposer sans pause (ce que fait une journée CEO moyenne) produit ce qu'Adam Gazzaley appelle "cognitive interference" — une fatigue non proportionnelle à la quantité de travail, mais à la fréquence de bascule.

**L'hypothèse d'aiCEO** : un outil qui reconnaît ces régimes et les **orchestre dans la journée** peut réduire la fatigue sans réduire la production.

---

## 2. Les cadres théoriques convoqués

Quatre disciplines inspirent la couche coaching. On les cite explicitement pour que l'équipe design puisse arbitrer sans improviser.

### 2.1 Les Big Rocks (Stephen Covey)

Métaphore du pot rempli de gros cailloux d'abord, puis de sable. Si on met le sable en premier, les cailloux ne rentrent plus. **Trois priorités maximum par semaine**, identifiées le dimanche, protégées toute la semaine.

### 2.2 GTD — Getting Things Done (David Allen)

Pattern "capture / clarify / organize / reflect / engage". **Règle des 2 minutes** (si ça prend moins, fais-le ; sinon, capture-le). Distinction tâche / projet / next action.

### 2.3 ACT — Acceptance & Commitment Therapy (Steven Hayes)

Acceptation de ce qu'on ne peut pas contrôler, engagement sur ses valeurs. **Défusion cognitive** : différencier "je me sens débordé" de "je suis débordé". Outil précieux pour un perfectionniste.

### 2.4 Stoïcisme pratique (Epictète, Sénèque, Marc Aurèle)

Dichotomie du contrôle (ce qui dépend de moi vs ce qui n'en dépend pas), journal du soir (Sénèque écrivait chaque soir ce qu'il avait fait), *memento mori* léger — rappeler la finitude pour relativiser.

---

## 3. La tonalité UX — la voix d'aiCEO

### Principes de voix

La voix d'aiCEO n'est ni celle d'un coach sportif, ni celle d'un chatbot serviable. Elle ressemble à celle d'un **chief-of-staff senior**, dans la cinquantaine, qui a vu d'autres CEO tomber :

- **Chaleureuse mais pas familière.** "Bon lundi" plutôt que "Hey champion".
- **Respectueuse et première personne.** "Je t'ai préparé…", pas "Voici la préparation."
- **Directe quand il le faut.** "Ta semaine est trop chargée" — sans emballage.
- **Bienveillante sans niaiserie.** Aucune emoji céleste, aucun "tu vas y arriver !".
- **Lucide et humble.** "Je ne suis pas sûr, tu me diras si j'ai bien compris."
- **Calme à tout moment.** Jamais d'urgence rouge, jamais de ponctuation explosive !!

### Matrice des micro-copies

| Situation | À bannir | Formulation aiCEO |
|---|---|---|
| Tâche en retard | "⚠️ EN RETARD" | "À revoir quand tu auras un moment — pas urgent encore." |
| Journée saturée | "Alerte surcharge !!" | "Ta journée est pleine. Veux-tu qu'on déplace 2 tâches ?" |
| Proposition IA | "Cliquer ici pour accepter" | "J'ai préparé ceci pour toi. Valide, ajuste, ou ignore." |
| Délégation suggérée | "Déléguez maintenant !" | "Marie fait ce type de travail très bien. Je lui transfère ?" |
| Clôture journée | "Bravo, tu as tué la journée !" | "Bonne journée. Tu as fait ce qui comptait. À demain." |
| Accueil matin | "Yo, prêt à crusher la journée ?" | "Bon matin. Comment tu te sens aujourd'hui ?" |
| Erreur | "Oops, something went wrong" | "Je n'ai pas réussi à faire ça. Veux-tu que je réessaie ?" |
| Pas d'activité | "Empty state" | "Rien d'urgent. Profite du calme." |

---

## 4. Les rituels — la colonne vertébrale

Trois rituels structurent la semaine. Ils sont **non négociables** dans le sens où ils sont présents dans l'interface ; le CEO peut les sauter, mais l'app en prend acte et le mentionne lors de la revue hebdo.

### 4.1 Rituel du matin · "Intention" (5 min)

Chaque matin à 6h30 (configurable), l'app affiche un écran plein-page calme :

```
┌─────────────────────────────────────────────┐
│                                             │
│  Bon mercredi, Feycoil.                     │
│                                             │
│  Comment tu te sens ce matin ?              │
│    [lucide]  [tendu]  [fatigué]  [stimulé] │
│                                             │
│  ──────────────────                         │
│                                             │
│  Ton intention du jour                      │
│  (une phrase, une seule)                    │
│    _______________________________________  │
│                                             │
│  ──────────────────                         │
│                                             │
│  Mon top 3 (je te propose)                  │
│    ● PV chantier Mayotte                    │
│    ● Validation POC Adabu                   │
│    ● Relire projet SCI                      │
│                                             │
│  [Valider ma journée]  [Ajuster]            │
│                                             │
└─────────────────────────────────────────────┘
```

**Inspirations** : Sunsama planning guide, BetterUp check-in.

**Ce que ça produit** :
- Le CEO arrive à son bureau avec un cap, pas une inbox.
- L'humeur déclarée alimente le copilote (si "fatigué" → propositions allégées ce jour-là).
- Les 3 priorités ancrent la journée.

### 4.2 Rituel du soir · "Clôture" (3 min)

Entre 18h et 20h (déclenché au choix du CEO ou par détection d'inactivité de 30 min), l'app pousse :

```
┌─────────────────────────────────────────────┐
│                                             │
│  Fin de journée 🌙                          │
│                                             │
│  As-tu fait ce qui comptait aujourd'hui ?   │
│    [oui]  [partiellement]  [non]            │
│                                             │
│  Sur un mot, comment tu te sens maintenant ?│
│    [apaisé]  [fier]  [épuisé]  [frustré]    │
│                                             │
│  Trois choses à reporter (je les ai vues)   │
│    ▢ Relire mémo                            │
│    ▢ Appeler Paul                           │
│    ▢ Valider devis                          │
│    → reportées à demain ?  [oui] [non]      │
│                                             │
│  [Clôturer ma journée]                      │
│                                             │
└─────────────────────────────────────────────┘
```

Puis message final :

> *"Journée bien remplie. Tu as délégué 3 fois et fait 2 tâches critiques — c'est exactement le ratio qu'on vise. Bonne soirée — je reprends demain 6h30."*

Après clôture, l'interface passe en **mode nuit** : fond sombre, pas de nouvelles propositions, seules les urgences critiques passent (définies en amont : famille, santé, force majeure).

**Inspirations** : Sunsama shutdown, Superhuman "You're done" screen.

### 4.3 Rituel du dimanche · "Revue & Cap" (15 min)

Dimanche soir, 19h (configurable), un écran dédié :

```
┌─────────────────────────────────────────────┐
│                                             │
│  Revue S17 — Retour                         │
│                                             │
│  3 Big Rocks : 2 validés · 1 décalé         │
│  Tâches : 34 dont 12 déléguées              │
│  Réunions : 23h30 · Focus : 8h15            │
│                                             │
│  ✨ Ce que j'ai appris de toi cette semaine │
│  • Tu préfères "Bien à toi"                 │
│  • Tu reports Lloyds au mardi               │
│  • Tu acceptes 85% délégations Marie        │
│                                             │
│  ──────────────────                         │
│                                             │
│  Cap S18 — Ce que je propose                │
│                                             │
│  Intention : "Terrain Mayotte"              │
│                                             │
│  Big Rock 1 · PV chantier Mayotte           │
│  Big Rock 2 · Comité stratégique Adabu      │
│  Big Rock 3 · Dossier juridique SCI Start   │
│                                             │
│  14 tâches pré-planifiées                   │
│  Mercredi bloqué en focus                   │
│                                             │
│  [Valider la semaine]  [Ajuster]            │
│                                             │
└─────────────────────────────────────────────┘
```

**Inspirations** : Sunsama weekly review, Reclaim weekly preview, GTD weekly review.

Ce rituel remplace le "dimanche soir angoissé" par un moment structuré, où le lendemain est prévisible et la semaine a un cap.

---

## 5. Les mécanismes anti-surchauffe

### 5.1 Le NON bienveillant (inspiré Motion + Sunsama)

Quand le CEO tente d'ajouter une tâche alors que sa capacité est saturée :

```
┌─────────────────────────────────────────────┐
│                                             │
│  Je comprends — mais regarde :              │
│                                             │
│  Ta semaine est déjà à 108% de capacité.    │
│  Ajouter "relire contrat LOA" te mettrait   │
│  à 115%, ce qui va se payer mercredi.       │
│                                             │
│  Trois options :                            │
│    ▢ Reporter à S19 (pas urgent)            │
│    ▢ Déléguer à Marie (elle fait bien ça)   │
│    ▢ Remplacer une tâche moins importante   │
│                                             │
│  [Je force quand même]  [Une des options]   │
│                                             │
└─────────────────────────────────────────────┘
```

Règle : **jamais de blocage dur**. Le CEO garde toujours la possibilité de forcer — mais il le fait en connaissance de cause. L'important est que l'arbitrage devienne conscient.

### 5.2 Le streak du repos (inversion radicale)

Là où Duolingo récompense les jours consécutifs d'apprentissage, aiCEO récompense :

- **Jours avec shutdown effectué** (badge journalier).
- **Nuits > 7h déclarées** (badge "respiration").
- **Weekends sans ouverture de l'app professionnel** (badge "déconnexion").
- **Semaines sans mail envoyé après 22h** (badge "frontière saine").

Message type : *"7 jours consécutifs de shutdown avant 20h. Tu prends vraiment soin de toi cette semaine."*

**Pas de pression inverse** : si le CEO brise la streak, aucun reproche. Juste *"reprenons à zéro, sans culpabilité"*.

### 5.3 La détection des signaux faibles de burnout

L'IA surveille en continu (opt-in) :

| Signal | Seuil d'alerte | Intervention |
|---|---|---|
| Mails envoyés après 22h | ≥ 3 par semaine | Question douce en revue hebdo |
| Weekends avec ouverture app | ≥ 2 consécutifs | Proposition journée off vendredi |
| Taux d'acceptation propositions | baisse > 25 % | Check-in "tu te sens noyé ?" |
| Score humeur moyen | < 2.5/5 sur 5 jours | Proposition séance de recul |
| Meetings back-to-back | > 4 jours/semaine | Propose bloc focus mercredi |
| Respiration (plages libres > 1h) | < 5h / semaine | Alerte revue hebdo |

**Règle absolue** : l'IA n'alerte jamais sur un seul signal. Elle **croise** et pousse une intervention seulement quand 2-3 signaux convergent.

### 5.4 Le mode "surcharge détectée"

Quand l'IA estime que la charge cognitive est au-delà du seuil, l'interface bascule en **mode simplifié** automatiquement :

- Le cockpit affiche uniquement les 3 priorités du jour. Tout le reste est replié.
- Les propositions IA sont réduites à 3 maximum (au lieu de 15).
- Le drawer de droite masque les "liens" (moins de stimuli).
- Un message discret : *"Je t'ai simplifié la vue aujourd'hui. Tu peux tout rouvrir [ici]."*

Retour automatique à la normale dès que les signaux sont revenus au vert.

### 5.5 Les protections temporelles (inspiré Reclaim)

Certains créneaux sont **protégés par défaut** et non modifiables sans une triple confirmation :

- **Focus hebdo** : un bloc de 3h une fois par semaine, sur le créneau favori (détecté par l'IA).
- **Respiration quotidienne** : 15 min chaque après-midi, à l'heure du creux circadien (14h30 par défaut).
- **Déjeuner** : 45 min minimum, jamais compressé.
- **Week-end** : du vendredi 19h au lundi 7h, mode nuit auto.

Si un interlocuteur externe propose un RDV dans un créneau protégé, l'IA :
1. Propose une **alternative** dans un créneau ouvert.
2. Signale au CEO la tentative, avec le choix de briser la protection.

### 5.6 Le recadrage cognitif (ACT light)

Dans le drawer d'une tâche en retard, au lieu d'afficher "En retard de 4 jours", l'IA propose :

> *"Cette tâche attend depuis 4 jours. Avant de te culpabiliser, remarque : **l'as-tu évitée parce qu'elle est inutile, difficile, ou parce qu'une autre t'a semblé plus importante ?**"*

Trois boutons :
- "Inutile → supprimer"
- "Difficile → fractionner en 3 petites étapes"
- "Moins importante → la réordonner dans la semaine"

Le CEO sort de la culpabilité pour entrer dans la décision. C'est de l'ACT appliqué.

---

## 6. Les moments difficiles — protocoles

### 6.1 La journée catastrophe

Tout tombe le même jour. L'IA détecte le pattern (> 5 urgences parallèles déclarées / détectées) :

> *"Journée particulière. Je te propose de tout arrêter 10 min : sors marcher, reviens avec un café, et on priorise ensemble une seule chose."*

Puis :
- Efface l'agenda non critique.
- Propose de reporter 2-3 RDV que l'IA sait décalables.
- Revient sur un seul Big Rock "minimum viable" pour la journée.

### 6.2 La post-mortem après échec

Quand un Big Rock a été décalé 2 fois ou abandonné :

> *"Ce rock est décalé depuis 3 semaines. Ça peut vouloir dire trois choses. Ce n'est plus la bonne saison. La formulation ne marche pas. Ou il te manque quelque chose pour l'exécuter. Qu'est-ce qui se passe ?"*

Puis l'IA propose :
- Supprimer le rock (pas un échec, un arbitrage).
- Reformuler (plus petit, plus tangible).
- Identifier l'obstacle (manque-il une compétence, une ressource, un go ?).

### 6.3 Le dimanche angoissé

Si le CEO ouvre l'app un dimanche 22h (hors rituel de revue) :

> *"Tu es là un dimanche soir. Ça arrive. Veux-tu qu'on décharge vite ce qui te trotte, pour que tu t'endormes l'esprit léger ?"*

Puis offre un **quick capture** en 3 questions :
1. Qu'est-ce qui te préoccupe ?
2. Est-ce urgent vraiment, ou ça peut attendre lundi 7h ?
3. Si oui, écris-le et ferme — je le reprends demain matin.

---

## 7. Le coach stratégique (v2+)

Couche conversationnelle dédiée, activée à la demande, qui joue le rôle d'un coach exécutif.

### Scénarios types

**Scénario "arbitrage important"**  
Le CEO dit : *"Je dois décider cette semaine sur l'ouverture Maroc."*  
Le coach : questions socratiques (pourquoi maintenant ? qui décide en vrai ? que perd-on à attendre ? quelle est la pire conséquence du oui ? du non ? ton instinct dit quoi ? que dirait [mentor] ?).  
Sortie : un résumé structuré de sa propre pensée, qu'il peut garder comme note.

**Scénario "je me sens coincé"**  
Le CEO dit : *"Je tourne en rond depuis 2 semaines sur le dossier X."*  
Le coach : pattern de défusion ACT (ce sentiment, depuis quand ? quels autres dossiers ont ce pattern ? qu'est-ce qui est sous ton contrôle ? qu'est-ce qui ne l'est pas ?).  
Sortie : une action minuscule actionnable **aujourd'hui**.

**Scénario "revue stoïque"**  
Chaque fin de trimestre, l'IA propose une revue type journal de Sénèque :
- Qu'ai-je fait de bien ce trimestre ?
- Qu'ai-je fait qui ne me ressemblait pas ?
- Qu'est-ce que j'ai appris sur moi ?
- Qu'est-ce que je veux rapprocher de moi ? Éloigner ?

### Garde-fous

- **Le coach n'est jamais intrusif.** Il ne se déclenche que si le CEO l'active.
- **Le coach ne diagnostique pas.** Il n'a pas le droit de dire "tu es en burnout" — mais peut dire "j'observe 4 signaux qui, dans d'autres contextes, précèdent un épuisement".
- **Le coach oriente vers un humain quand il faut.** Si signaux graves de détresse, il propose de prendre RDV avec un vrai coach/thérapeute.

---

## 8. La boîte à outils psychologique

À placer dans un module "bien-être" discret, accessible à la demande :

- **Respiration guidée** (3 min, pattern 4-7-8 ou cohérence cardiaque).
- **Mini-méditation** (3/5/10 min, inspiré Headspace).
- **Journal de reconnaissance** (3 choses reconnues par jour, inspiré gratitude research).
- **Recadrage cognitif** (outil CBT — "quelle pensée j'ai ? est-elle vraie ? utile ?").
- **Carnet des victoires** (liste cumulative des Big Rocks validés, visible sur demande).

Règle : cette section n'est **jamais poussée**. Elle attend que le CEO vienne, sans notification.

---

## 9. Indicateurs de succès du coaching

| Métrique | Horizon | Cible |
|---|---|---|
| Taux de réalisation des rituels matin | 30 jours | ≥ 80 % |
| Taux de réalisation du shutdown soir | 30 jours | ≥ 70 % |
| Taux de réalisation de la revue hebdo | 60 jours | ≥ 85 % |
| Score humeur moyen | 90 jours | ≥ 3.5/5 |
| Heure médiane de shutdown | 90 jours | recul 45 min |
| Weekends totalement off (app fermée) | 90 jours | ≥ 70 % |
| Nuits > 7h déclarées | 90 jours | ≥ 60 % |
| Mails envoyés après 22h | 90 jours | baisse 50 % |
| NPS de la couche coaching | 90 jours | ≥ 60 |

---

## 10. Les risques et les limites

### Risque 1 · L'effet paternaliste

Un outil qui dit au CEO comment vivre sa vie est vite rejeté. Contre-mesure : tout est proposition, jamais injonction. Le CEO peut désactiver n'importe quel rituel à tout moment.

### Risque 2 · Le faux sentiment de contrôle

Un outil qui mesure tout peut donner l'illusion que tout est gérable. Contre-mesure : l'IA reconnaît ses propres limites explicitement. "Je ne vois qu'une partie de ta vie. Tu décides si ce que je dis est pertinent."

### Risque 3 · La médicalisation inappropriée

Le coach ne doit jamais se substituer à un professionnel de santé mentale. Contre-mesure : orientation systématique vers un humain en cas de signaux graves. Mention explicite dans l'onboarding : "aiCEO n'est pas un thérapeute."

### Risque 4 · La stigmatisation des moments faibles

Si les "jours à basse humeur" sont affichés comme des échecs, le CEO triche. Contre-mesure : tonalité de compassion ("c'est ok, tout le monde a des jours comme ça"), pas de graphique "baisse de performance".

### Risque 5 · Le sur-engagement par optimisation du coaching

Paradoxe : optimiser le coaching peut devenir une nouvelle source de charge. Contre-mesure : le coaching est une couche **passive**, qui se déploie à ton rythme. Aucune notification, aucune relance, aucun badge qui pousse.

---

## 11. Synthèse — le manifeste psychologique

> Nous construisons un outil pour quelqu'un qui en fait trop.
>
> Nous lui devons du respect. Pas de nudge marketing, pas de streak culpabilisant, pas de ton martial. Du respect.
>
> Nous lui devons de la lucidité. Lui montrer sa charge réelle, ses patterns destructeurs, ses marges de délégation — sans juger.
>
> Nous lui devons du silence. Le droit à ne pas recevoir de proposition, à ne pas ouvrir l'app, à fermer son ordinateur le dimanche.
>
> Nous lui devons une voix calme. Pas la voix d'un outil qui veut de l'engagement. La voix d'un collègue senior qui a vu d'autres CEO tomber et qui l'aide à ne pas tomber à son tour.
>
> Le meilleur compliment que nous puissions recevoir :
> *"Avec aiCEO, je dors mieux."*

---

*Document lié : `01-vision-produit.md` · `02-benchmark.md` · `03-ia-proactive.md` · `07-design-system.md`*
