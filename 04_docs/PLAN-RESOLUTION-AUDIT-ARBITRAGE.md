# Plan de résolution — Audit UX/UI Arbitrage v0.8

**Date** : 30 avril 2026
**Auteur** : agent Claude (binôme CEO Major Fey)
**Source** : `04_docs/AUDIT-UX-ARBITRAGE-v0.8.md` (8.5/10 alignement promesse)
**Cadre** : 6 points faibles + 7 lacunes + 12 recommandations à séquencer
**Objectif** : passer de 8.5/10 à 9.5/10 d'ici fin V1 (T3 2026)

---

## 1. Résumé exécutif

L'audit a identifié **19 sujets** à traiter. Ils sont regroupés en **6 phases** allant de J+0 à V2 (T1 2027).

| Phase | Sprint | Effort binôme | Items | Statut |
|---|---|---|---|---|
| **0** | Test sur soi CEO | 1 matinée | Validation recette | ⏳ À planifier |
| **1** | S6.24 — Quick wins UX | 1.5 j | 4 items | 🟢 Prêt |
| **2** | S6.25 — Lacunes structurelles | 2.5 j | 4 items | 🟡 Spec à raffiner |
| **3** | S6.26 — Polish UX | 1.5 j | 4 items | 🟡 |
| **4** | V1.x.1 — Outlook deep | 3 j | 3 items | 🔴 Backlog V1 |
| **5** | V1.x.2 — Apprentissage avancé | 2 j | 3 items | 🔴 Backlog V1 |
| **6** | V2 — Différenciation marché | sprint V2 dédié | 3 items | 🔴 Backlog V2 |

**Total v0.8 → v0.9 → V1.x** : ~10 jours binôme (en plus des 28 lots déjà livrés).

---

## 2. Phase 0 — Test sur soi CEO (avant tout sprint dev)

### Objectif

Avant de coder le moindre quick win, **valider en condition réelle** que la fonctionnalité actuelle tient sa promesse pour 1 matinée complète d'arbitrage.

### Protocole

Suivre `04_docs/05_recette/RECETTE-CEO-v0.8.md`, scénario adapté pour Triage :

1. **8h00** — Sync Outlook (`pwsh -File scripts/sync-outlook.ps1`).
2. **8h05** — Ouvrir `/v07/pages/arbitrage.html`.
3. **8h05-8h10** — Click "✦ Analyser avec Claude" → traiter 8-12 emails avec verdicts.
4. **8h10-8h15** — Switch "🎯 Focus decisions" → trancher 3-5 décisions ouvertes.
5. **8h15** — Lire l'historique cumulé en bas de page.

### Critères GO / NO-GO

| Critère | Cible |
|---|---|
| Durée totale | ≤ 10 min |
| Boutons fonctionnels | 100% |
| Doublons créés | 0 |
| Faux positifs Claude | ≤ 2/10 |
| Sentiment "contrôle" | Subjectif CEO ≥ 7/10 |

### Output

Si GO → enchaîner Phase 1.
Si NO-GO → identifier les blockers et recadrer Phase 1 avant les quick wins.

**Effort** : 30 minutes (recette) + retour CEO en commentaire dans cette doc.

---

## 3. Phase 1 — Sprint S6.24 — Quick wins UX (1.5 j binôme)

Items à fort impact, coût faible. À livrer en 1.5 j d'un seul tenant.

### S6.24.1 — Badge `✦ Claude` sur cards LLM (0.25 j)

**Problème** : visuellement, on ne distingue pas une card heuristique d'une card LLM. Le CEO ne sait pas si la card vient d'un scoring SQL ou d'une analyse Claude.

**Solution** : ajouter un mini-badge `✦ Claude` (violet, opacity 0.7) en bas à droite de chaque card LLM. Tooltip "Analysée par Claude Sonnet 4.6".

**Effet** : valorisation visuelle du mode LLM, transparence sur la source.

**Fichiers** : `arbitrage-store-v2.js` (renderQueue card template) + `arbitrage.html` (CSS badge `.ar-card-llm-tag`).

### S6.24.2 — Stats apprentissage visibles (0.5 j)

**Problème** : le CEO marque "Pas pour moi" mais ne voit pas le résultat ("Claude a appris X feedbacks, a évité Y noises ce mois").

**Solution** :
- Backend : route `GET /api/arbitrage/learning-stats` qui agrège `email_feedback` (count par verdict + par mois).
- Frontend Cockpit : ajouter une mini-card "Apprentissage" sous le banner LLM ("✦ Claude a appris N patterns ce mois — Y emails évités auto").
- Frontend Settings → Coaching IA : afficher la liste des 30 derniers patterns avec bouton "✕ retirer ce feedback" (DELETE `/api/arbitrage/email-feedback/:id`).

**Effet** : boucle de feedback positive → CEO voit l'utilité du "Pas pour moi" → continue à enseigner.

**Fichiers** : `arbitrage.js` (route), `index-store.js` (Cockpit mini-card), `settings-store.js` (panelCoaching enrichi).

### S6.24.3 — Bouton "Répondre dans Outlook" (0.25 j)

**Problème** : si le CEO veut répondre directement à un email, il doit switcher d'app, retrouver l'email dans Outlook.

**Solution** : sur chaque card LLM, ajouter un bouton "↗ Répondre" qui ouvre `mailto:from_email?subject=RE: subject`. Sur Windows avec Outlook par défaut, ouvre directement le fenêtre de réponse.

**Effet** : friction → 0 sur "je vois un email, je veux répondre".

**Fichiers** : `arbitrage-store-v2.js` (bouton à côté de "Voir le mail"), `arbitrage.html` (CSS).

### S6.24.4 — Tour onboarding "1er triage" (0.5 j)

**Problème** : un nouveau CEO ne comprend pas immédiatement la distinction kind/verdict, ni le rôle des badges.

**Solution** : tooltip pédagogique séquentiel au premier "Analyser avec Claude" (détection : `localStorage.first_triage_done` absent) :
1. "Voici une card. Le badge en haut indique ce que Claude a inféré."
2. "Cliquez sur le badge pour changer de type."
3. "Faire = créer ce que dit le badge. Reporter = revenir plus tard. Ignorer = skip silencieux."
4. "Pas pour moi = Claude apprendra à filtrer ce type d'email."
5. Marque `localStorage.first_triage_done = '1'` à la fin.

**Effet** : courbe d'apprentissage divisée par 2.

**Fichiers** : `arbitrage-store-v2.js` (helper `firstTriageWalkthrough()`), `arbitrage.html` (CSS overlay tutoriel).

### Livrables sprint S6.24

- 4 features livrées en 1.5 j binôme
- ADR documenté
- Tests v07-atomic verts
- Pilotage régénéré

---

## 4. Phase 2 — Sprint S6.25 — Lacunes structurelles (2.5 j binôme)

Items qui débloquent la promesse complète. Plus complexes mais critiques.

### S6.25.1 — Auto-création projet sur kind=project + Faire (0.75 j)

**Problème** : actuellement, click "Faire" sur une card kind=project crée une **task**, pas un projet. La promesse est trompeuse.

**Solution** :
- Backend `/api/arbitrage/accept` : si `kind=project` + `verdict=faire`, INSERT INTO projects (name=subject tronqué, description=summary, status=active, created_at=now). Lier email source via `emails.project_id`.
- Frontend : toast confirmant "✓ Projet créé : {name}" avec lien direct vers la page projet.

**Effet** : promesse tenue, kind=project devient utile.

**Fichiers** : `arbitrage.js` (route accept), `arbitrage-store-v2.js` (toast).

### S6.25.2 — Liaison email → Big Rock (0.75 j)

**Problème** : les Big Rocks (3 priorités hebdo de la Weekly Sync) sont déconnectés du Triage. Aucune voie pour transformer un email matinal en Big Rock semaine.

**Solution** :
- Sur chaque card, un nouveau verdict optionnel : **"⛰ En faire un Big Rock"** (visible uniquement si `kind=task` ou `decision`).
- Click → POST `/api/big-rocks` avec week=current + title=subject + description=summary, lié à la prochaine Weekly Sync.
- Toast : "Big Rock ajouté à la semaine W{N}. Configurez-le dans Weekly Sync."

**Effet** : flux Triage → Weekly Sync connecté, gestion stratégique vraiment intégrée.

**Fichiers** : `arbitrage-store-v2.js` (verdict picker enrichi conditionnel), `revues-store.js` (page Weekly Sync rafraîchie au prochain load).

### S6.25.3 — Page Project enrichie avec emails liés (0.5 j)

**Problème** : un email avec kind=info (ou tag projet manuel) est lié à un projet, mais la page projet ne l'affiche pas. Le contexte projet reste invisible.

**Solution** :
- Backend `GET /api/projects/:id/emails` (route nouvelle).
- Frontend `projet-store.js` : nouvelle section "📧 Emails contextuels (N)" qui liste les emails liés. Card compacte avec from/date/subject + bouton "Voir le mail".

**Effet** : la page projet devient un vrai dossier projet avec contexte email natif.

**Fichiers** : `arbitrage.js` ou `projects.js` (route), `projet-store.js` (rendering), CSS dédié.

### S6.25.4 — Stats apprentissage détaillées (0.5 j)

**Note** : déjà partiellement couvert par S6.24.2. Cette tâche complète :
- Settings → Coaching IA : liste filtrable des feedbacks (par expéditeur, par projet, par verdict).
- Bouton "Exporter en CSV" pour audit.
- Graph d'évolution (matin par matin) du nombre d'emails arbitrés vs filtrés auto.

**Effet** : transparence totale sur l'apprentissage, audit-ready.

**Fichiers** : `settings-store.js` (panelCoaching enrichi avec graph JS).

### Livrables sprint S6.25

- 4 features livrées en 2.5 j
- Migration éventuelle pour `emails.project_id` (si pas déjà existant)
- Tests E2E sur le flux complet : email → Big Rock → Weekly Sync

---

## 5. Phase 3 — Sprint S6.26 — Polish UX (1.5 j binôme)

Items qui réduisent la friction restante.

### S6.26.1 — Mode "compact" des cards (0.5 j)

**Problème** : 14 éléments visuels sur une card LLM = surcharge possible en mode "scan rapide".

**Solution** : toggle dans Réglages → Apparence : "Compact / Normal / Détaillé". Mode compact masque snippet + summary, garde uniquement badge kind + sujet + 3 verdicts.

**Fichiers** : `settings-store.js` (toggle), `tweaks.css` (classes `.ar-card.is-compact`).

### S6.26.2 — Distinction visuelle subtile cards heuristique vs LLM (0.25 j)

**Problème** : les cards des 2 modes ont le même rendu. Cohérence OK mais perte de signal.

**Solution** : cards LLM ont une **bordure gauche fine violette** (~2px), cards heuristique = bordure ivory standard. Indication discrète mais permanente.

**Fichiers** : CSS `.ar-card.is-llm`.

### S6.26.3 — Retour visuel après "Pas pour moi" (0.5 j)

**Problème** : quand Claude filtre un email grâce à un feedback passé, le CEO ne le voit pas — il voit juste moins d'emails. Pas de feedback boucle visible.

**Solution** : dans la section "Filtrés par Claude (noise)" en bas de Triage, ajouter pour chaque email filtré une mention "✦ Filtré grâce à votre feedback du JJ/MM/AAAA" si match avec un pattern email_feedback.

**Effet** : transparence + valorisation du temps investi en apprentissage.

**Fichiers** : `arbitrage.js` (analyze-emails-llm enrichit `skipped[]` avec `matched_feedback_id`), `arbitrage-store-v2.js` (renderSkipped enrichi).

### S6.26.4 — Focus decisions plus peuplé (0.25 j)

**Problème** : si peu de décisions sont arbitrées, le mode Focus est vide. Sentiment "page morte".

**Solution** : élargir le critère de chargement Focus :
- Décisions `status='ouverte'` ouvrir aussi `status='active'`.
- Inclure les décisions `status='reportee'` (avec badge "reportée").
- Top-up : si moins de 3 décisions ouvertes, charger les 3 dernières décisions tranchées avec option "Ré-ouvrir".

**Effet** : Focus decisions toujours utile.

**Fichiers** : `arbitrage-store-v2.js` (loadFocus filter).

### Livrables sprint S6.26

- 4 features polish livrées en 1.5 j

---

## 6. Phase 4 — V1.x.1 — Outlook deep integration (3 j binôme)

Phase plus lourde, à embarquer dans le sprint V1 dédié Outlook.

### V1.1 — Body email complet dans modal "Voir le mail" (1.5 j)

**Problème** : `modal Voir le mail` affiche actuellement seulement les 500 premiers chars du `preview`. Pas le body complet.

**Solution** :
- Étendre le script `scripts/fetch-outlook.ps1` pour extraire le `Body` complet (HTMLBody si présent, sinon Body texte) de chaque MailItem.
- Étendre la table `emails` avec colonne `body_full TEXT` (migration SQL).
- Modal "Voir le mail" : afficher body complet avec rendu HTML safe (sanitize via DOMPurify ou similar).

**Risque** : taille DB augmentée significativement (5-50 KB par email). Mitigation : seulement les emails non-arbitrés depuis 30j.

### V1.2 — Multi-comptes Outlook (1 j)

**Problème** : si le CEO a 3 comptes Outlook (ETIC, ITH, SCI), seul un est syncé.

**Solution** :
- Settings → Sync Outlook : liste des comptes détectés via COM Outlook.
- Toggle on/off par compte.
- `fetch-outlook.ps1` itère sur les comptes activés.
- Champ `account` déjà présent dans table emails.

### V1.3 — Bouton "Répondre" avancé avec Claude pré-rédacteur (0.5 j)

**Solution** : extension de S6.24.3, mais le bouton "Répondre" appelle `/api/llm-draft-reply` qui génère un brouillon de réponse contextuel, puis `mailto:` ouvre Outlook avec le body pré-rempli.

**Effet** : "Triage matin" peut directement déboucher sur des réponses envoyées.

---

## 7. Phase 5 — V1.x.2 — Apprentissage avancé (2 j binôme)

### V1.4 — Liste patterns appris + retrait (0.75 j)

Couverture de la lacune "stats apprentissage". Settings → Coaching IA → liste paginée des feedbacks avec recherche, filtres, suppression.

### V1.5 — Auto-apply patterns (0.75 j)

**Problème** : Claude apprend mais ne pré-applique pas. Le CEO doit toujours valider.

**Solution** : si un email matche un pattern fort (ex. "même expéditeur, même sujet, verdict=not_concerned 5+ fois"), l'app **auto-applique** le verdict en silence et le glisse dans la section "Filtrés par Claude" en bas. Toast hebdo : "✦ Cette semaine, Claude a auto-filtré N emails grâce à vos patterns. Vérifiez si vous voulez."

### V1.6 — Notifications matin 8h (0.5 j)

Web push ou notification système Windows : "Bonjour Major. 8 emails attendent votre arbitrage. Ouvrir le Triage." Avec consentement Settings.

---

## 8. Phase 6 — V2 — Différenciation marché

Sprint V2 dédié, ~10-15 j binôme.

### V2.1 — Triage vocal

Dictée vocale du verdict pendant le café : "Faire ce mail, reporter celui-ci, info pour ADABU sur le 3e..."

### V2.2 — Mode auto-pilote

Pour les patterns clairs (newsletters spécifiques, notifs auto), auto-skip sans intervention. Log hebdo. CEO valide ou retire.

### V2.3 — Plugin Outlook

Triage **directement dans Outlook** via add-in COM ou Office 365. Pas besoin de switcher d'app.

---

## 9. Matrice impact / effort

```
                        EFFORT FAIBLE         EFFORT FORT
                        (≤ 1 j)               (≥ 1 j)
                  ┌──────────────────────┬──────────────────────┐
IMPACT FORT       │ S6.24.2 (stats)      │ S6.25.1 (auto-projet)│
                  │ S6.24.3 (Outlook)    │ S6.25.2 (Big Rocks)  │
                  │ S6.24.4 (tour)       │ V1.1 (body complet)  │
                  │                      │ V1.5 (auto-apply)    │
                  ├──────────────────────┼──────────────────────┤
IMPACT MOYEN      │ S6.24.1 (badge ✦)    │ V1.2 (multi-comptes) │
                  │ S6.26.x (polish)     │ V1.4 (patterns UI)   │
                  │ S6.26.4 (Focus pop)  │                      │
                  ├──────────────────────┼──────────────────────┤
IMPACT FAIBLE     │ S6.26.2 (bordure)    │ V2.x (vocal, plugin) │
                  │                      │                      │
                  └──────────────────────┴──────────────────────┘
```

**Priorité absolue** (impact fort + effort faible) : S6.24.2, S6.24.3, S6.24.4 → tous en S6.24.

---

## 10. Calendrier proposé

| Semaine | Sprint | Livraison | Test |
|---|---|---|---|
| **S+0** (cette semaine) | Phase 0 — Test sur soi | — | CEO recette en réel |
| **S+1** | S6.24 quick wins | 4 features | CEO valide |
| **S+2** | S6.25 lacunes structurelles | 4 features | CEO valide en réel |
| **S+3** | S6.26 polish | 4 features | Recette finale v0.9 |
| **S+4** | Buffer + ADR + recette ExCom | — | ExCom 04/05 → GO V1 |
| **S+5 à S+8** | Sprint V1.1 (multi-tenant) | V1 démarre | — |
| **S+9 à S+11** | V1.x.1 — Outlook deep | 3 features | — |
| **S+12 à S+13** | V1.x.2 — Apprentissage avancé | 3 features | — |
| **T1 2027** | V2 dédié | Triage vocal + plugin Outlook | — |

---

## 11. Risques

| Risque | Mitigation |
|---|---|
| Test sur soi NO-GO → blockers cachés | Réordonner Phase 1 selon les blockers réels avant de coder |
| Mount Windows tronque encore les fichiers | Python atomic write systématique pour fichiers >100 lignes |
| LLM API coûts > budget V1 (~50 €/mois) | Cache des patterns + auto-skip pour réduire appels Claude |
| Multi-comptes Outlook complexe (auth) | Limiter V1.2 aux comptes locaux Outlook desktop, pas O365 cloud |
| Triage vocal V2 — accuracy LLM Whisper | Reporter à V2.x si latence trop élevée |

---

## 12. Décision pour le CEO

**4 décisions à prendre cette semaine** :

1. **GO/NO-GO Phase 0** — passer la recette test sur soi cette semaine ? **Recommandation** : oui, c'est la condition sine qua non.

2. **Validation périmètre Phase 1 (S6.24)** — les 4 quick wins sont-ils alignés ? **Recommandation** : oui, ce sont les +impacts pour -coûts.

3. **Priorisation S6.25** — auto-projet et Big Rocks d'abord ou page Project enrichie d'abord ? **Recommandation** : auto-projet en premier (débloque promesse), Big Rocks ensuite (connecte le rituel hebdo).

4. **V2 (Triage vocal + plugin Outlook)** — confirmation budget ~10-15 j binôme T1 2027 ? **Recommandation** : oui si différenciation marché reste critique. Sinon reporter V3.

---

## 13. Output attendu

À la fin de S6.26 :
- ✅ 12 items principaux livrés
- ✅ Audit UX/UI mis à jour : note **9.5/10 sur l'alignement promesse**
- ✅ Recette CEO v0.9 passée
- ✅ Pilotage à jour
- ✅ Pitch ExCom mis à jour avec démo Triage complet

---

**Source** : `04_docs/AUDIT-UX-ARBITRAGE-v0.8.md`, `00_BOUSSOLE/DECISIONS.md`, `04_docs/08-roadmap.md` v3.3.
