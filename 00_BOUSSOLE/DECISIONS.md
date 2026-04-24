# DECISIONS — Architecture Decision Records (ADR léger)

Une entrée par décision débattue ≥ 30 minutes. Les micro-arbitrages vont dans les messages de commit.

Format :
- **Date · Titre court**
- Contexte, options, décision, conséquences
- Pas de retour en arrière sans un nouvel ADR qui annule

---

## 2026-04-24 · Restructuration en aiCEO/ unifié

**Contexte** : deux dossiers séparés (`aiCEO_Agent/` + `aiCEO_Design_System/`), fichiers orphelins, pas de versioning, pas de distinction draft / livrable.

**Options étudiées** :
- (A) Laisser en l'état, documenter les conventions
- (B) Fusionner dans une arborescence numérotée 00_BOUSSOLE / 01..06 + zones `_drafts/` `_archive/` `_scratch/`
- (C) Fusionner mais sans numérotation (arborescence plate par domaine)

**Décision** : B. La numérotation force l'ordre de lecture, rend le dossier auto-documenté, et sépare clairement ce qui est canonique (01-06) de ce qui est en maturation (`_drafts/`) ou historique (`_archive/`).

**Conséquences** :
- Tous les chemins internes changent. À corriger : liens dans `04_docs/10-exec-deck.pptx` (pointe vers anciens chemins ?), scripts MVP qui lisent `../assets/data.js` → devient `../01_app-web/assets/data.js`.
- Les scripts manuels (raccourcis Windows, start.bat) doivent être revus.

---

## 2026-04-24 · GitHub sur compte perso privé (pas orga ETIC)

**Contexte** : besoin d'un versioning + source de vérité. Choix entre compte personnel GitHub et organisation ETIC.

**Options étudiées** :
- (A) Perso privé
- (B) Orga ETIC Services privée

**Décision** : A. Plus rapide à mettre en place, pas de permissions à régler. Transférable vers l'orga ETIC ultérieurement si le produit est adopté par l'entreprise.

**Conséquences** :
- Propriété intellectuelle temporairement sur le compte perso. À clarifier si le produit devient un livrable ETIC officiel.

---

## 2026-04-22 · Outlook COM plutôt que Microsoft Graph

**Contexte** : besoin d'ingérer les mails pour enrichir le contexte d'arbitrage.

**Options étudiées** :
- (A) COM local via PowerShell — Outlook doit être ouvert
- (B) Microsoft Graph avec enregistrement Azure AD

**Décision** : A pour le MVP. Pas de setup Azure, pas de consentement admin, pas d'OAuth. Outlook est déjà ouvert sur le poste.

**Conséquences** :
- Dépendance à Outlook lancé pour ingérer
- Les données ne quittent pas le poste (bon pour la confidentialité)
- Graph à prévoir pour V2+ quand on aura l'envoi natif de mails

---

## 2026-04-22 · REPORTER sans plafond dans l'arbitrage

**Contexte** : sur 20 tâches, Claude renvoyait parfois 3/2/12 ou forçait dans un des 3 paniers. Il "perdait" des tâches en fin de liste.

**Options étudiées** :
- (A) Garder 3/2/3 strict → oblige Claude à trancher, risque de perdre les petites
- (B) FAIRE ≤ 3, DÉLÉGUER ≤ 2, REPORTER absorbe tout le reste

**Décision** : B. Aucune tâche n'est perdue. La colonne REPORTER peut contenir 20+ items, c'est le journal du jour.

**Conséquences** : UI adaptée (scroll dans REPORTER), règle affichée « 0 tâche perdue » comme engagement produit.

---

## Template pour la prochaine décision

```markdown
## YYYY-MM-DD · Titre court

**Contexte** : (en 2-3 lignes)

**Options étudiées** :
- (A) …
- (B) …

**Décision** : …

**Conséquences** : …
```
