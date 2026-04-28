# Patterns coaching CEO — aiCEO v0.5

> Différenciateur stratégique vs Notion / Things / Linear / Asana.
> Ces patterns doivent transparaître visuellement dans la maquette.
> Ergonomie, sociologie, scripting : pensés pour un CEO multi-entités souvent isolé, decision-fatigue chronique, time-poverty.

## Philosophie

aiCEO **n'est pas un coach** (pas de leçons morales).
aiCEO **est un copilote attentif** : il observe, suggère, n'impose jamais, recadre quand l'utilisateur dérive.

Principes :
1. **Anti-flatterie absolue** : pas de "Bravo !", "Génial !", "Champion !"
2. **Question > affirmation** : "Quel est le ressenti ?" plutôt que "Tu vas mieux"
3. **Recovery > pression** : reprendre vaut mieux que culpabiliser
4. **Pas de gamification toxique** : streaks oui, levels/XP/leaderboards non
5. **Observation > injonction** : "J'ai noté que…" plutôt que "Tu devrais…"

---

## 1. Tone scripts par contexte

### 1.1 Salutation matin (cockpit)

**Logique** : varie selon humeur déclarée la veille au soir.

| Humeur veille | Salutation FR | Salutation EN | Ton |
|---|---|---|---|
| `bien` | "Bon retour, Sarah." | "Welcome back, Sarah." | Direct, factuel |
| `moyen` | "Bonjour Sarah." | "Good morning, Sarah." | Neutre, sobre |
| `mauvais` | "Bonjour Sarah. On reprend en douceur." | "Good morning, Sarah. Let's ease back in." | Doux, court |
| `pas de bilan veille` | "Bonjour Sarah." | "Good morning, Sarah." | Neutre par défaut |
| `streak break (a manqué hier)` | "Bonjour Sarah. Pas grave, on reprend." | "Good morning, Sarah. No worries, let's continue." | Bienveillant, sans culpabiliser |
| `streak 7 jours` | "Bonjour Sarah." (pas de mention streak — discret) | "Good morning, Sarah." | Neutre. Le streak est visible ailleurs, pas crié dessus |

### 1.2 Confirmations actions

**Règle** : toast subtil, jamais modal, jamais "Bravo".

| Action | FR | EN |
|---|---|---|
| Arbitrage validé | "Arbitrage enregistré." | "Triage saved." |
| Tâche déléguée | "Délégation envoyée à Léa." | "Delegated to Léa." |
| Décision tranchée | "Décision actée." | "Decision recorded." |
| Boucle du soir | "À demain." | "See you tomorrow." |
| Big Rock atteint | "Big Rock atteint." | "Big Rock done." (pas "Achievement unlocked!") |
| Streak +1 | (pas de toast — affiché dans evening.html) | (idem) |
| Streak 30 | "Streak de 30 jours." (pas de "Wow !") | "30-day streak." |
| Streak 100 | "Streak de 100 jours." + confetti très discret 1.5s | "100-day streak." + subtle confetti |

### 1.3 Erreurs et frictions

**Règle** : factuel, action claire, pas anxiogène.

| Erreur | FR | EN |
|---|---|---|
| Outlook timeout | "Outlook n'a pas répondu en 30 s. [Réessayer]" | "Outlook didn't respond in 30s. [Retry]" |
| API IA limit | "Quota IA atteint pour ce mois. Le mode rule-based prend le relais." | "AI quota reached this month. Falling back to rule-based mode." |
| Sync conflict | "Conflit détecté avec un autre appareil. Quelle version garder ?" | "Conflict detected. Which version do you want to keep?" |
| Crash recovery | "Quelque chose s'est cassé. [Recharger] [Signaler]" | "Something broke. [Reload] [Report]" |
| Réseau offline | "Hors-ligne. Tes actions seront synchronisées au retour du réseau." | "Offline. Your changes will sync when back online." |

### 1.4 Empty states

**Règle** : court, factuel, suggérer une action.

| Page | FR | EN |
|---|---|---|
| Tâches vide | "Aucune tâche en attente. Profite." | "No tasks. Enjoy." |
| Décisions vide | "Aucune décision ouverte." | "No open decisions." |
| Agenda jour vide | "Aucun rendez-vous aujourd'hui." | "No meetings today." |
| Contacts recherche vide | "Aucun contact pour 'xyz'." | "No contact for 'xyz'." |
| Inbox empty | "0 mail. Inbox zero." | "0 mails. Inbox zero." |
| Big Rocks vide | "Définis 1 à 3 objectifs pour la semaine." | "Set 1-3 goals for the week." |
| Premier matin (post-onboarding) | "Première journée. Commence par un arbitrage matinal." | "First day. Start with a morning triage." |

---

## 2. Time-of-day adaptation

Le cockpit s'adapte selon l'heure du jour.

### Découpage horaire

| Plage | Mode | Hero card | Couleur dominante | CTA primaire |
|---|---|---|---|---|
| 5h-8h | Matin actif | Carte Matin saillante (gradient amber doux) | `--amber-bg` | "Lancer l'arbitrage" |
| 8h-12h | Journée matinale | Carte Matin pliée si arbitrage fait | neutre | (selon contexte) |
| 12h-14h | Pause déjeuner | Bandeau discret "Pause ?" | neutre | "Pause 15 min" |
| 14h-17h | Journée après-midi | Compteurs + tâches du jour visibles | neutre | (selon contexte) |
| 17h-20h | Pré-soir | Carte Soir saillante (gradient violet doux) | `--violet-bg` | "Boucler la journée" |
| 20h-22h | Fin de journée | Mode déconnexion suggérée | sombre, doux | "Bonne soirée" |
| 22h-5h | Heure tardive | Banner "Il est tard. À demain ?" | très calme | "Mode lecture" |

### Implémentation

Le cockpit lit l'heure côté client (JS `new Date().getHours()`) et applique une classe sur `<body>` :
- `body[data-time-period="morning"]`
- `body[data-time-period="day"]`
- `body[data-time-period="evening"]`
- `body[data-time-period="night"]`

Les variations sont visuelles (saillance des cards) et copy (CTA, salutation).

### Démo dans la maquette

3 vues du cockpit en variants (toggle) :
- **Default morning** (8h-12h, par défaut)
- **Evening saliance** (17h-20h, carte Soir saillante)
- **Late night** (22h+, banner discret)

---

## 3. Friction positive

Avant certaines actions, l'app pose une question modeste pour faire réfléchir l'utilisateur. Pas de blocage.

### Patterns avec leurs déclencheurs

| Trigger | Modal/Banner FR | EN |
|---|---|---|
| 5e tâche P0 ajoutée pour aujourd'hui | "5 tâches P0 aujourd'hui. Tout est vraiment urgent ? [Continuer] [Réviser]" | "5 P0 tasks today. All really urgent? [Continue] [Review]" |
| 3e décision reportée même semaine | "Tu reportes 'X' pour la 3e fois. Trancher cette semaine ou supprimer ?" | "You've deferred 'X' three times. Decide this week or remove?" |
| 4e Big Rock en cours d'ajout | "Plus de 3 Big Rocks dilue le focus. Tu veux quand même ?" | "More than 3 Big Rocks dilutes focus. Add anyway?" |
| Création projet sans Big Rock associé | "Ce projet n'est lié à aucun Big Rock semaine. C'est intentionnel ?" | "No Big Rock linked. Intentional?" |
| Suppression tâche avec source mail récente (< 7j) | "Cette tâche vient d'un mail récent. Sûr de vouloir la supprimer ?" | "Recent email source. Sure to delete?" |
| 50+ tâches ouvertes | "50+ tâches ouvertes. Le copilote suggère un nettoyage 30 min ce vendredi ?" | "50+ open tasks. Suggest 30-min cleanup Friday?" |
| Pas d'arbitrage matinal 3 jours | "3 jours sans arbitrage matinal. Pas grave. Veux-tu reprendre maintenant ou demain ?" | "3 days without triage. No worries. Resume now or tomorrow?" |

### Style visuel

Modal compact (320px), variant "soft" :
- Fond `--surface-2`
- Border-left 4px `--violet` (couleur coaching)
- Pas d'icône agressive
- 2 boutons : action + alternative
- Pas de "Annuler" (laisser fermer en clic dehors ou Esc)

---

## 4. Mirror moments

Pattern hebdomadaire : observation factuelle qui invite à la réflexion.

### Quand ?

À l'ouverture de la revue hebdo (dimanche après 17h), avant la rétrospective.

### Format

Bandeau en haut de `revues.html` :

```
🪞 Cette semaine, j'ai noté :
• Tu as délégué 8 tâches (vs 3 la semaine d'avant)
• Ton Big Rock #2 a avancé de +20 %, le #3 a reculé de -10 %
• 3 réunions Outlook sans tâches associées

[Approfondir avec Claude] [Passer à la revue]
```

### Patterns d'observations

L'algorithme génère 2-4 observations factuelles parmi :

| Type | Exemple FR | Exemple EN |
|---|---|---|
| Délégation | "Tu as délégué 8 tâches (vs 3 semaine d'avant)" | "You delegated 8 tasks (vs 3 last week)" |
| Big Rocks | "Big Rock #2 +20 %, #3 -10 %" | "Big Rock #2 +20 %, #3 -10 %" |
| Décisions | "Tu as tranché 4 décisions, reporté 6" | "4 decisions taken, 6 deferred" |
| Énergie | "Énergie moyenne 2.8/5 cette semaine (3.6 mois dernier)" | "Avg energy 2.8/5 this week (3.6 last month)" |
| Tâches done | "73 % des tâches planifiées faites (cible 80 %)" | "73 % of planned tasks done (target 80 %)" |
| Réunions sans suite | "3 RDV sans tâches associées" | "3 meetings without follow-up tasks" |
| Time saved IA | "Le copilote t'a fait gagner ~3h12 cette semaine" | "Copilot saved you ~3h12 this week" |
| Décision velocity | "Tu tranches en 2.3j en moyenne (4.1j il y a 3 mois)" | "Avg decision time: 2.3d (4.1d 3 months ago)" |

### Ton

Factuel, **jamais jugement**. Pas de "tu devrais".

---

## 5. Recovery patterns

### 5.1 Streak interrompu

**Pas de drame.** Pattern :

```
Streak interrompu à 23 jours. C'est OK.
La régularité revient avec la pratique, pas avec la perfection.

[Reprendre ce soir]
```

Couleur sombre, pas rouge. Pas de notification push agressive.

### 5.2 Manque la boucle du soir 3 jours

```
Pas de bilan depuis lundi. Pas grave.

Veux-tu :
• Reprendre maintenant en 2 min
• Sauter cette semaine et reprendre dimanche
```

### 5.3 Retour après pause longue (> 7 j)

Cockpit simplifié, mode "comeback" :

```
Bon retour. On reprend doucement.

Aujourd'hui, juste :
1. [Voir tes 3 prochaines deadlines]
2. [Faire un arbitrage matinal léger (10 tâches max)]
3. [Pause]
```

Cache temporairement les pages avancées (Eisenhower, registres). Réactive après 1ère utilisation.

### 5.4 Période très chargée détectée

Si > 80 % du temps en réunions sur 5 jours consécutifs :

```
Tu enchaînes. C'est normal. 
Ai-je raison de penser qu'un créneau de réflexion stratégique te manque ?

[Bloquer 2h jeudi matin] [Pas maintenant]
```

---

## 6. Posture stratégique

### Question stratégique du mois

Affichée discrètement dans le footer du cockpit, en italic, gris doux.

Exemples :
- "Quelle est ta vision à 5 ans ?"
- "Si tu devais arrêter une activité demain, laquelle ?"
- "Quelle compétence veux-tu développer ce trimestre ?"
- "Que ferais-tu si tu n'avais peur de rien ?"
- "Qu'est-ce qui te dévore l'énergie sans rien produire ?"
- "Qui pourrais-tu déléguer mais que tu refuses encore ?"
- "Quelle décision repousses-tu depuis 6 mois ?"
- "Quelle conversation difficile n'as-tu pas eue ?"

### Format dans le footer

```
[footer]
   v0.5-s4 · last sync 4 min · 0.18 € today
   ─────────
   ✨ Question du mois : Quelle décision repousses-tu depuis 6 mois ?
   [Y répondre dans la revue]
[/footer]
```

L'utilisateur peut cliquer pour ouvrir un modal note rapide. La réponse est consignée pour la revue mensuelle.

---

## 7. Coach intégré (assistant chat)

### Quand ?

1×/sem (vendredi soir 18h ou dimanche 18h), prompt automatique dans la sidebar des conversations.

### Format

Conversation pré-amorcée dans `assistant.html` :

```
ASSISTANT: Avant ta revue hebdo, on prend 5 minutes ?

J'ai noté que cette semaine :
• Tu as eu 5 réunions sur le projet Spa Mallorca
• Décision "lancer Helix Labs" repoussée 3 fois

Question : qu'est-ce qui aurait dû être délégué et ne l'a pas été ?
```

### Bibliothèque de questions

| Catégorie | Questions |
|---|---|
| Délégation | "Quelle tâche faite cette semaine n'aurait pas dû t'incomber ?" |
| Décision | "Quelle décision te coûte le plus en énergie en ce moment ?" |
| Énergie | "Qu'est-ce qui a pesé le plus cette semaine ?" |
| Posture | "Sur quelle activité as-tu eu l'impression de subir vs de choisir ?" |
| Vision | "Y a-t-il un signal cette semaine qui mérite un creusement plus large ?" |
| Burnout signals | "Sur 1-10, comment juges-tu ta réserve d'énergie ce vendredi ?" |
| Relations | "Qui dans ton équipe nécessite plus d'attention de ta part ?" |
| Stratégie | "Qu'est-ce qui change dans 3 mois si rien ne bouge cette semaine ?" |

### Posture du coach

- Questions ouvertes (jamais yes/no)
- Pas plus de 1 question par tour
- Si l'utilisateur répond court ("ouais ça va"), creuser doucement : "Tu peux développer un peu ?"
- Si l'utilisateur évite, accepter et passer : "OK, on garde ça pour plus tard."
- Jamais de suggestion non sollicitée

---

## 8. Anti-gamification

### Ce qu'on a (acceptable)

- ✅ Streak boucle du soir (régularité)
- ✅ Compteur "tâches done" (factuel)
- ✅ Score santé exécutive (composite, optionnel)
- ✅ Time-saved IA (valeur tangible)

### Ce qu'on n'a pas (toxique)

- ❌ Levels / XP
- ❌ Badges visuels excessifs
- ❌ Leaderboard vs autres CEO
- ❌ Trophées décoratifs
- ❌ Notifications de "défi quotidien"
- ❌ Sons de victoire forts
- ❌ Confetti à chaque action

### Confetti policy

Confetti UNIQUEMENT à :
- Streak 100 jours (1× dans la vie utilisateur)
- 1 an d'utilisation continue (1×/an)

Et même là : très discret (10 particules max, 1.5s, palette DS).

---

## 9. Self-talk monitoring (V1+)

### Détection

L'app analyse les notes du soir (champ libre `evening.notes`) et détecte des patterns :
- "je suis nul"
- "j'y arrive pas"
- "merde"
- "raté"
- "fatigué"
- "trop"

### Réaction

Si détecté 2+ fois en 7 jours :

```
🪶 J'ai noté que tu utilises souvent des mots durs envers toi.

Ce n'est pas mon rôle de te juger. Mais si tu veux, je peux :
• Proposer une reformulation (recadrage doux)
• Te poser une question d'introspection
• Suggérer un coach humain de mon réseau

[Reformuler] [Question] [Coach humain] [Pas maintenant]
```

### Pattern reformulation

Bouton ouvre une modale avec :
- Le texte original (visible)
- 2-3 reformulations proposées par Claude
- L'utilisateur choisit ou édite

Exemple :
- Original : "Encore une journée de merde, j'arrive à rien."
- Reformulations :
  - "Journée frustrante. J'ai accompli moins que prévu."
  - "Décalage entre mes attentes et la réalité aujourd'hui."
  - "Aujourd'hui m'a coûté plus que prévu. À noter."

---

## 10. Pause forcée

### Trigger

Plus de 2h continues sur l'app sans pause détectée (mouse idle).

### Toast bottom-right

```
⏸️ 2h sur aiCEO. Une pause ?

[Plus tard] [Pause 15 min]
```

### Si "Pause 15 min" cliqué

Modal plein écran :

```
[fullscreen modal]

   15:00
   Pause active

   Suggestions :
   • Lever et marcher 5 min
   • Boire un verre d'eau
   • Regarder par la fenêtre 2 min

   [Skip] [Reprendre]
[/fullscreen modal]
```

Timer décompte de 15 min. Bouton "Reprendre" disponible à tout moment.

---

## 11. Posture & ergonomie

### Rappel hebdomadaire (pas plus)

Vendredi 16h, modal :

```
🧘 Rappel posture hebdo.

Comment tu t'es senti(e) physiquement cette semaine ?

[1 - Tendu(e)] [2] [3] [4] [5 - En forme]
```

Réponse logguée pour patterns long-terme.

---

## 12. Coaching frameworks intégrables

### EOS Traction (par défaut)

- Big Rocks (3 max/semaine)
- Niveau 1/2/3 (vision/objectifs/tâches)
- IDS (Identifier, Discuss, Solve) pour décisions
- L10 meeting structure

### Eisenhower

- Matrice urgent/important
- Filtre /api/tasks?eisenhower=…
- Suggestions auto basées sur due_at + priority

### Stoïcisme appliqué (optionnel)

- Cercle d'influence vs cercle de préoccupation
- Locus of control externe vs interne
- Question quotidienne : "Sur quoi as-tu eu un vrai contrôle aujourd'hui ?"

### Switcher framework (settings)

Settings → Coaching → Framework :
- EOS Traction (par défaut)
- Eisenhower
- Stoïcisme appliqué
- Personnalisé

Le vocabulaire et les questions s'adaptent.

---

## Résumé — vues coaching à intégrer dans la maquette

| Pattern | Page concernée | Visible dans la maquette ? |
|---|---|---|
| Salutation morning adaptive | index.html | ✅ 2 variants (humeur "bien" / "mauvaise") |
| Time-of-day cockpit | index.html | ✅ 2 variants (default morning / evening saliance) |
| Friction positive (5e P0) | arbitrage.html | ✅ 1 variant (modal soft) |
| Mirror moment | revues.html | ✅ 1 variant (banner top) |
| Recovery (streak break) | evening.html | ✅ 1 variant (alerte douce) |
| Posture stratégique footer | index.html | ✅ visible footer |
| Coach prompt assistant | assistant.html | ✅ 1 variant (conversation pré-amorcée) |
| Pause forcée | (overlay any page) | ✅ 1 variant (overlay 15 min) |
| Anti-gamification | (partout) | ✅ contrôlé par cohérence |

**Total : ~9 vues nouvelles couvrant le coaching.**
