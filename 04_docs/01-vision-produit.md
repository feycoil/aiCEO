# aiCEO — Vision produit

**Version 1.0 · 23 avril 2026 · Pour Feycoil Mouhoussoune**

---

## 1. Le pitch en une ligne

**aiCEO est le copilote proactif d'un CEO multi-sociétés qui pense en images, exige l'excellence, et doit apprendre à déléguer.**

Là où les outils existants servent des fonctions (email, agenda, projet), aiCEO sert **une personne décideuse** — dans sa cognition propre, ses rituels, ses arbitrages, ses zones de sur-engagement.

---

## 2. Le problème

Un CEO multi-sociétés qui tient 4 à 7 entités en parallèle vit un triple déficit structurel :

**Un déficit d'attention.** Son esprit est fragmenté entre des boîtes qui exigent chacune 100 % de présence. Passer de l'une à l'autre coûte entre 15 et 25 minutes de recalibrage mental (coûts de changement de contexte documentés par l'APA et Sophie Leroy).

**Un déficit de délégation.** Le CEO perfectionniste pense faire plus vite que son équipe, ce qui est vrai pour 20 % des tâches — mais il applique la règle aux 80 % restants. Il absorbe alors un travail que personne n'a demandé et qui n'a pas sa valeur horaire.

**Un déficit de respiration.** La journée se termine sans clôture explicite. Le cerveau reste en exécution jusqu'à 22 h, la charge mentale résiduelle érode le sommeil, et la boucle recommence.

Les outils existants traitent chacun de ces problèmes en silo — Motion planifie, Sunsama apaise, Athena délègue, Tana visualise. Aucun ne les traite **ensemble, autour d'une personne unique**.

---

## 3. L'utilisateur cible

### Persona primaire — Feycoil, CEO portefeuille

**43 ans, fondateur d'ETIC Services** (3 entités : Adabu, Start SCI, AMANI), préside un comité stratégique par mois et par société, gère 25 collaborateurs directs et indirects, déplacements fréquents (Mayotte, Paris, Maroc).

**Son mode cognitif dominant** : il pense par cartes, arbres, grids, graphes, diagrammes conceptuels. Un tableau lui parle instantanément ; un mur de texte lui parle peu. Il consomme mieux une décision présentée comme un arbre à trois branches qu'un paragraphe de six lignes.

**Son style de management** : rigueur méticuleuse, haut standard d'exigence, contrôle serré. Il lit chaque version, reprend chaque livrable, pose la question que personne d'autre ne pose. C'est sa force ; c'est aussi son plafond de verre parce qu'il arrive un moment où aucun humain n'arrive à scaler son attention.

**Ses frustrations** :
- Pas de vue consolidée portefeuille (il doit rouvrir 4 outils pour savoir où il en est).
- Mails qui s'accumulent parce qu'il veut répondre lui-même.
- Réunions qui partent sans lui quand il est sur une autre société.
- Délégation qui revient en boomerang (la tâche n'est pas faite comme il voulait, donc il la reprend).
- Dimanche soir avec 7 dossiers ouverts dans la tête, pas un.

### Personas secondaires (v2)

- **Son Directeur général adjoint** qui récupère certaines délégations.
- **Sa future assistante exécutive** qui pilote l'agenda et les RDV.
- **Ses partenaires d'ExCom** qui ont besoin de visibilité sur les décisions en cours sans tout relire.

---

## 4. La thèse différenciée

aiCEO se distingue sur **trois axes irréductibles** que personne n'adresse ensemble :

**Axe 1 — Vision portefeuille, pas fonctionnelle.** L'app est structurée par sociétés et par décisions transverses, pas par modules (agenda / tâches / mail). Le CEO entre par le nom d'une entité et voit tout ce qui la concerne — c'est contre-intuitif pour les PM de produit SaaS, c'est évident pour un patron qui pense en P&L.

**Axe 2 — Copilote proactif qui propose avant qu'on demande.** L'IA ne répond pas aux questions ; elle pose les siennes. « Tu as un comité stratégique Adabu dans 48 h — voici le brief que je t'ai préparé », « Ton calendrier de demain est saturé à 110 %, que veux-tu déplacer ? », « Le mail de Lloyds traîne depuis 6 jours, voici une réponse rédigée, valide ou corrige ». Chaque proposition a une source, un gain estimé, et un bouton "ignore".

**Axe 3 — Pensée visuelle native.** Toute information peut basculer entre cinq représentations (liste, grid, arbre, graphe, carte spatiale) sans perte, en un raccourci clavier. L'IA choisit le format le plus pédagogique pour le sujet et propose la bascule. C'est la manière dont Feycoil pense ; l'app parle sa langue.

---

## 5. Les principes directeurs

Sept règles qui tranchent les arbitrages de conception :

**P1 — Une personne, pas une équipe.** L'app sert un CEO. Le multi-utilisateur est un ajout tardif, pas une fondation. Conséquence : l'IA a le droit d'être opinionée — « je te propose X » plutôt que « voici des options ».

**P2 — Proactif, pas réactif.** Chaque écran accueille le CEO par une proposition, pas par une question. Le chat est une porte, pas le centre.

**P3 — Visuel par défaut.** Tout écran doit tenir en un coup d'œil sans scroll. Si un contenu excède, il est visualisé (grid, arbre, graphe) — il n'est pas listé.

**P4 — Le NON bienveillant.** L'app arbitre et ose refuser. « Ta semaine est pleine, choisis ce qui saute. » Jamais de culpabilisation, jamais d'urgence rouge.

**P5 — Délégation facilitée.** Chaque tâche a un bouton "déléguer" qui rédige le brief, envoie le mail, pose le suivi. L'IA rend la délégation plus rapide que l'exécution.

**P6 — Rituels non négociables.** Matin (5 min d'intention), soir (3 min de clôture), dimanche (15 min de revue S+1). Le produit se verrouille visuellement hors de ces rituels pour protéger le CEO.

**P7 — Traçabilité totale.** Chaque action de l'IA a une source (mail d'origine, événement, note), un auteur (quel modèle, quelle logique), un horodatage, un bouton "expliquer pourquoi". L'opacité tue la confiance.

---

## 6. Le système — trois couches

**Couche 1 · Cockpit** — la vue d'entrée. Cinq widgets : intention de la semaine (Big Rocks), tâches du jour, RDV critiques, propositions IA en attente, humeur/streak. Lecture sous 10 secondes, action sous 30.

**Couche 2 · Sociétés** — une page par entité (Adabu, Start, AMANI, ETIC). Chaque page montre l'intention courante, les décisions en cours, les chantiers actifs, l'équipe associée, le prochain RDV board.

**Couche 3 · Objets transverses** — agenda consolidé, tâches inter-sociétés, décisions à arbitrer, revues hebdo, archives. Ces objets circulent entre toutes les sociétés et se filtrent.

L'IA tourne en fond de manière permanente, se réveille sur événements (nouvel email, nouveau fichier, veille d'un RDV), et produit des propositions. Elle ne fait jamais d'action écrite (envoyer, supprimer, engager) sans un clic humain.

---

## 7. Les signaux de succès

### Métriques CEO

- **Temps CEO gagné par semaine** (≥ 6 h/semaine à 6 mois, via tâches déléguées + préparations IA acceptées).
- **Heure de fin de journée médiane** (cible : recul de 45 min à 6 mois — le CEO ferme plus tôt).
- **Ratio délégation/exécution** (tâches assignées vs exécutées soi-même — cible : +40 % en 3 mois).
- **Score de respiration hebdo** (nombre de jours avec shutdown effectué, weekend réellement off).

### Métriques produit

- **Taux d'acceptation des propositions IA** (cible ≥ 55 %).
- **Propositions proactives par jour** (cible 8-15, stable).
- **Temps moyen entre ouverture d'un écran et action** (cible < 30 s sur cockpit).
- **NPS mono-utilisateur à 90 jours** (cible ≥ 70 — on parle d'un outil que le CEO recommande à ses pairs).

---

## 8. Ce qu'aiCEO n'est pas

Pour clarifier par la négative :

- **Ce n'est pas un ERP ou un CRM.** Les données métier restent dans les systèmes existants ; aiCEO lit, ne stocke pas.
- **Ce n'est pas un outil d'équipe.** La collaboration est une projection, pas le cœur. Les collaborateurs voient ce que le CEO leur assigne, pas l'inverse.
- **Ce n'est pas un chatbot.** L'IA ne vit pas dans un thread — elle agit depuis les écrans métier.
- **Ce n'est pas un optimiseur de productivité.** L'objectif n'est pas « faire plus », c'est « faire mieux ce qui compte et fermer la porte du bureau ».
- **Ce n'est pas Motion.** Le produit n'aligne pas une armée de tâches à maximiser ; il arbitre peu de choses et dit non souvent.

---

## 9. Pourquoi maintenant

Trois vagues convergent en 2026 :

**Vague 1 · Modèles IA agentiques matures.** Claude Sonnet 4.5 et GPT-5 tiennent désormais des boucles agentiques de 10 à 30 heures avec fiabilité. La proactivité stable est enfin possible.

**Vague 2 · Microsoft Graph ouvert.** L'accès delta temps réel à Outlook, SharePoint, Teams est industrialisé. Un copilote peut observer le CEO sans clic.

**Vague 3 · Fatigue des outils généralistes.** Les CEO multi-sociétés en ont assez de jongler avec six apps. Le marché est prêt pour une app-qui-pense-à-leur-place.

---

## 10. Le plan d'attaque (résumé)

- **MVP (T2 2026)** : cockpit + sociétés + revues hebdo + copilote réactif sur emails + délégation assistée. Usage mono-utilisateur Feycoil, apprentissage terrain.
- **V1 (T4 2026)** : copilote proactif en fond (Inngest), rituels matin/soir, pensée visuelle multi-formats, intégration Outlook/SharePoint complète.
- **V2 (T2 2027)** : ouverture équipe (DG adjoint, AE), vues comité stratégique, intégration Teams, mémoire long-terme.
- **V3 (T4 2027)** : coaching personnalisé (voix calme, check-in émotionnel), anti-burnout actif, multi-CEO (2-3 dirigeants dans l'écosystème ETIC).

Le détail est dans `08-roadmap.md`.

---

## 11. Les risques à surveiller

- **Sur-confiance dans l'IA** qui engage le CEO sur des décisions qu'il n'aurait pas prises. Mitigation : human-approval sur toute action écriture, traçabilité visible, mode apprentissage les 60 premiers jours.
- **Dépendance à Microsoft** (rachat, changement tarifaire Graph). Mitigation : couche d'abstraction connecteurs, backup export local.
- **Éreintement du CEO** par trop de propositions. Mitigation : limite dure de 15 propositions/jour par défaut, budget ajustable.
- **Fuite de données sensibles** vers LLM. Mitigation : ZDR systématique, routage Bedrock EU, redaction Presidio.
- **Adoption qui stagne** si le premier rituel n'est pas établi en 10 jours. Mitigation : onboarding guidé par l'IA elle-même, session hebdo d'ajustement du prompt système.

---

## 12. Le manifeste (pour clore)

> Nous construisons un copilote pour une personne. Pas un assistant, un copilote — celui qui voit la route, anticipe le virage, et laisse le pilote aux commandes.
>
> Nous le construisons pour un CEO qui donne trop, qui voit trop, qui pense trop vite. Nous lui devons un outil qui respire à son rythme, parle sa langue visuelle, lui dit non quand il faut, et lui rend le soir.
>
> aiCEO n'est pas un gain de productivité. C'est un gain de lucidité et un gain de sommeil.

---

*Document lié : `02-benchmark.md` · `06-architecture.md` · `08-roadmap.md`*
