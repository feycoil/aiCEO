# Audit UX/UI Arbitrage v0.8 — Sans concession

**Date** : 30 avril 2026 fin de journée
**Auteur** : agent Claude (binôme CEO Major Fey)
**Périmètre** : page Triage v07 (`/v07/pages/arbitrage.html`) — 28 lots livrés du Lot 1 au Lot 28
**Statut** : livré, à valider lors du test sur soi CEO

---

## 1. Promesse initiale du projet

Issue de la phrase magnétique v0.8 et du Memo UX :

> **Naviguer clair. Trancher juste. Dormir serein.**

Et de la signature Aubrielle « Arbitrage du matin » :

> *5 à 10 minutes — file emails et décisions à trancher*
>
> *L'arbitrage du matin n'est pas un tri d'emails — c'est une déclaration d'intention.*

**Promesse implicite** : en 5-10 minutes le matin, le CEO transforme le chaos de sa boîte mail en :
- Décisions claires à trancher (Focus decisions).
- Actions concrètes à faire (queue triée).
- Liaisons projet/contact à entretenir.
- Et un sentiment de contrôle (pas d'emails oubliés, pas de doublons, pas de surprise).

---

## 2. État actuel — ce qui est livré

### 2.1 Modes d'analyse

| Mode | Backend | Coût | Latence |
|---|---|---|---|
| **Analyser (heuristique)** | SQL scoring + regex sur subject+preview | Gratuit | Instantané |
| **✦ Analyser avec Claude** | LLM batch Sonnet 4.6 sur 12 emails | ~0.06 €/triage | 4-8s |

### 2.2 Flux de dispatch (kinds)

```
Email candidat → kind ∈ { task, decision, project, info }
                       ↓
                  Verdict ∈ { faire, reporter, ignorer, pas-pour-moi }
                       ↓
                  Effet base de données
```

### 2.3 Champs enrichis sur chaque card

| Champ | Source | Visibilité |
|---|---|---|
| Badge kind cliquable | LLM ou heuristique | ⚪ Toujours |
| Indicateur confiance (`⚠`/`··`/rien) | kindConfidence() | ⚪ Toujours |
| Badge `→ destinataire / en CC / mentionné / pas concerné` | LLM relevance | 🟡 Si LLM |
| Badge `⚠ Pas direct` | recipient_flag (parse to_addrs vs myEmails) | 🟢 Toujours |
| Badge `⧇ N emails` (redondance) | Detection clé sujet partagée | 🟢 Si N>1 |
| Tag projet cliquable | inferred_project | ⚪ Toujours |
| Date | received_at | ⚪ Toujours |
| `DE / À` (full destinataires) | from_name + to_addrs | ⚪ Toujours (Lot 28) |
| Subject | DB | ⚪ Toujours |
| `Résumé : ...` | LLM uniquement | 🟡 Si LLM |
| `✦ Action proposée : ...` | LLM uniquement | 🟡 Si LLM |
| `Pourquoi : ...` (rationale ou justification) | LLM rationale ou heuristique | ⚪ Toujours |
| Pill priorité P0/P1/P2/P3 | LLM priority ou score-based | 🟡 Souvent |
| Snippet 180 chars | preview email | 🟢 Si non vide |
| Bouton `↗ Voir le mail original` | source_id | ⚪ Toujours |

### 2.4 Verdict picker

**Ligne 1** : `[✓ Faire] [⏰ Reporter] [ⓘ Ignorer]`
**Ligne 2 (lien)** : `✦ Pas pour moi - Claude apprendra`

### 2.5 Dispositifs additionnels

- **Aide contextuelle** dépliable en haut de page : explique les 4 verdicts + 2 modes + astuce badge.
- **Dropdown badge kind** : changer task ↔ decision ↔ project ↔ info à la volée.
- **Dropdown tag projet** : réaffecter l'email à un autre projet actif.
- **Bandeau bulk** : si checkboxes cochées, toolbar `[Faire(N)] [Reporter(N)] [Ignorer(N)]` pour traiter en lot.
- **Section "Filtrés par Claude (noise)"** : collapsible en bas, montre les emails que Claude a écartés.
- **Section Historique** : derniers jours d'arbitrage avec compteurs actions/décisions/ignorés.
- **Animation Claude réfléchit** : skeleton + 8 messages rotatifs pendant l'analyse LLM.
- **Apprentissage actif** : chaque "Pas pour moi" est POSTé dans `email_feedback`, le LLM en tient compte au prochain triage.
- **Adresses email perso** : configurées dans Onboarding (étape 3/5) ou Réglages → Général. Servent à scorer relevance et recipient_flag.

### 2.6 Backend — scoring + diversification

- Top 30 candidats SQL → diversification max 2 par expéditeur + max 4 par projet → top 12.
- Score = flagged×100 + unread×30 + has_attach×5 + bonus récence + bonus projet + boost redondance (+25 si 3+ emails similaires).
- LLM reçoit en system prompt : adresses CEO + 30 derniers feedbacks comme patterns à respecter.

---

## 3. Alignement promesse vs réalité

### 3.1 ✅ Bien aligné

| Promesse | Livraison | Note |
|---|---|---|
| 5-10 min | 8-12 cards par triage, ~30s par card en mode batch = 4-6 min OK | ✅ |
| Tri qui devient déclaration d'intention | 4 verdicts + dispatch automatique en task/decision/project/info | ✅ |
| Pas de doublons | Email arbitré marqué `arbitrated_at`, ne revient plus | ✅ |
| Décisions stratégiques distinguées des actions | Top 3 emails décisionnels remontés en tête + Focus decisions séparé | ✅ |
| Contrôle visuel | Badge kind cliquable, badge "Pas direct", relance détectée | ✅ |
| Apprentissage | Feedback `not_concerned` + patterns LLM | ✅ |

### 3.2 ⚠️ Points faibles UX/UI résiduels

#### Densité d'information sur la card
- **Symptôme** : la card LLM affiche 8-12 éléments visuels (badge kind, ⚠ Pas direct, → destinataire, ⧇ N emails, 📁 projet, date, DE/À, subject, summary, action proposée, pourquoi, pill priorité, snippet, bouton voir mail).
- **Risque** : surcharge cognitive en analyse rapide. Le CEO peut se perdre.
- **Mitigation** : hiérarchie visuelle a été affinée (Lot 26), mais peut nécessiter un mode "compact" optionnel.

#### Verdicts vs kind — abstraction encore mentale
- **Symptôme** : le CEO doit comprendre que le **badge kind** détermine ce qui est créé quand il clique **Faire**, mais c'est implicite.
- **Mitigation Lot 27** : tooltip sur "Faire" précise "Créer (le kind)". Mais reste abstrait pour un nouvel utilisateur.

#### Pas pour moi vs Ignorer — distinction subtile
- **Symptôme** : 2 actions visuellement proches (skip), différence (apprentissage) pas évidente sans tooltip.
- **Mitigation Lot 27** : "Pas pour moi" est un lien discret séparé par une dashed-border + texte explicite "Claude apprendra".

#### Focus decisions — encore peu peuplé
- **Symptôme** : le mode "🎯 Focus decisions" affiche les décisions ouvertes en DB. Si peu de décisions arbitrées, le mode est vide.
- **Mitigation** : le LLM remonte plus de décisions désormais (scoring décisionnabilité Lot 22).

#### Connexion arbitrage → projet → contact pas encore transparente
- **Symptôme** : un email lié à un projet via tag ne s'affiche pas explicitement dans la page Projects.
- **Backlog** : V1.x — afficher les emails contextuels d'un projet dans sa page détail.

#### Cards heuristique vs LLM — rendu identique mais valeur différente
- **Symptôme** : visuellement, il est difficile de distinguer une card heuristique d'une card Claude. Les deux ont les mêmes badges.
- **Mitigation possible** : ajouter un badge subtil "✦ Claude" sur les cards LLM pour signaler la différence de qualité d'analyse.

### 3.3 ❌ Lacunes avouées

| Lacune | Impact | Backlog |
|---|---|---|
| Auto-création projet sur kind=project | Le verdict "Faire" sur kind=project crée actuellement une task | V1.x |
| Big rocks pas connectés à l'arbitrage | Aucune voie pour transformer un email en Big Rock semaine | V1.x |
| Modal "Voir le mail" affiche preview tronqué (~500 chars) | Pas de body complet | V1.x — extraction Outlook complète |
| Pas de retour visuel après "Pas pour moi" sur la file ultérieure | Le CEO ne voit pas que Claude a appris | V1.x — afficher "✦ Filtré grâce à votre feedback" sur les cards skipées |
| Pas de stats apprentissage | "Claude a évité 12 noises grâce à vos 5 feedbacks ce mois" non visible | V1.x — page Coaching enrichie |
| Édition email Outlook depuis la card | Bouton "Répondre" intégré qui pré-remplit Outlook | V2 |
| Multi-comptes Outlook | Si CEO a plusieurs comptes Outlook, pas géré | V1.x |

### 3.4 🟢 Forces différenciantes

- **Diversification** : pas 8 mails du même expéditeur, équilibrage projet.
- **Heuristique sélection 3 décisions intelligente** : top décisionnels remontés, pas de bumping artificiel.
- **Apprentissage actif** : feedback CEO impacte le prompt LLM suivant.
- **Voix exec moderne** : 12 termes canoniques figés (Triage, Focus, Faire, Reporter, etc.).
- **Layout aéré** : padding généreux, hiérarchie typo claire, animations subtiles.
- **Backend déterministe + LLM optionnel** : si pas de clé Claude, l'app fonctionne en heuristique.

---

## 4. Recommandations priorisées

### 4.1 Quick wins (post-test sur soi)

1. **Ajouter un badge `✦ Claude`** sur les cards LLM pour différencier visuellement des cards heuristique.
2. **Afficher "Claude a appris X feedbacks"** dans le bandeau LLM-status du Cockpit + dans Settings → Coaching IA.
3. **Bouton "Répondre dans Outlook"** qui ouvre `mailto:` ou `outlook://` avec pré-remplissage.
4. **Tooltip pédagogique au premier triage** : expliquer kind vs verdict avec un mini-tour.

### 4.2 Sprint S6.24

5. **Auto-création de projet** sur kind=project + Faire (au lieu de retomber en task).
6. **Liaison email → Big Rock** : verdict "Faire" + kind=task + flag "important" → créer un Big Rock pour la semaine.
7. **Page Project enrichie** : afficher tous les emails liés (info + tasks créées + decisions).
8. **Stats apprentissage** : page Settings → Coaching IA → "Claude a appris N patterns. Liste : ..." avec possibilité de retirer un feedback.

### 4.3 V1.x

9. **Body email complet** dans modal "Voir le mail" (extraction Outlook propre).
10. **Multi-comptes Outlook**.
11. **Mode compact** des cards (toggle dans Réglages → Apparence).
12. **Notifications matin 8h** pour rappeler le rituel Triage.

### 4.4 V2

13. **Triage vocal** : dicter le verdict pendant le café.
14. **Mode "auto-pilote"** : sur les patterns clairs (newsletter X = toujours skip), exécuter automatiquement avec confirmation hebdo.
15. **Widget Outlook plugin** : Triage directement dans Outlook sans switcher d'app.

---

## 5. Verdict final sur l'alignement promesse

**8.5/10** sur l'alignement avec la promesse "Naviguer clair. Trancher juste. Dormir serein."

- **Naviguer clair** ✅ : le triage matinal donne une vue claire des sujets actifs, projet par projet.
- **Trancher juste** ✅ : Focus decisions + 4 options claires + recommandation Claude.
- **Dormir serein** 🟡 : pas encore complètement (manque big rocks intégrés + auto-création projet + pas de notif matin).

**La fonctionnalité Triage est la signature différenciante du produit.** Les concurrents (Sane, Superhuman, Notion AI) traitent les emails. Aucun ne **transforme un email en intention exécutive** avec ce niveau de finesse. C'est ce qui doit être mis en avant dans le pitch ExCom et la communication V1.

---

## 6. Décision pour la session

✅ **Triage v0.8 considéré "prêt pour test sur soi"**.

Le CEO doit passer la recette `RECETTE-CEO-v0.8.md` en condition réelle (1 vraie matinée d'arbitrage) avant de lancer le développement Sprint S6.24.

Les 12 recommandations en §4 sont backlog priorisé pour les sprints à venir.

---

## Sources

- DECISIONS.md (40+ ADRs documentés)
- Memo UX v0.8 Phase 1
- Glossaire 12 termes canoniques (S6.19)
- Code source : `/v07/stores/arbitrage-store-v2.js`, `/src/routes/arbitrage.js`, `/v07/pages/arbitrage.html`
