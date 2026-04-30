# RECETTE CEO v0.8 — Validation usage reel

**Date** : 29/04/2026 PM tres tardif · **Duree** : 25 minutes · **Cible** : Major Fey + ExCom · **Pre-requis** : `localhost:4747/` accessible · ANTHROPIC_API_KEY configure (optionnel pour mode degrade)

> Cette recette valide la livraison v0.8 (UX Editorial Executive complete) avant ExCom 04/05. 6 criteres GO/NO-GO. Chronometre.

## Pre-recette (5 min) — Setup

```powershell
cd C:\_workarea_local\aiCEO
git status                    # tout commite ?
git log --oneline -5          # derniers commits
git tag --list "s6.*" | sort  # tags poses
pwsh -File restart-server.ps1 # serveur up
```

Verifier dans le navigateur : `http://localhost:4747/` redirige bien sur Cockpit refondu.

## Test 1 — Cockpit chronotype (3 min)

**Critere GO** : a 3 moments differents de la journee (matin/journee/soir), le greeting + palette + tonalite changent visuellement.

**Steps** :
1. Ouvrir `localhost:4747/` (= Cockpit v07)
2. Verifier eyebrow `COCKPIT - 29 avril 2026 - MATIN/MIDI/SOIR/NUIT`
3. Verifier que le greeting Aubrielle correspond a l heure (`Bonjour Major.` matin, `Bonsoir Major.` soir)
4. Le bandeau LLM affiche `Claude live` (vert) ou `Mode degrade` (ambre)
5. L'anneau journee affiche un pourcentage avec 3 segments

**GO si** : 4/5 elements presents et coherents.

## Test 2 — Triage matinal (4 min)

**Critere GO** : le Triage permet de trier 5 emails en moins de 4 min.

**Steps** :
1. Click bouton noir `Lancer le Triage` du Cockpit
2. Mode `📬 File emails` actif par defaut
3. Click `Analyser les emails` -> 8 propositions affichees
4. Pour chaque carte email : `Accepter` ou `Reporter` ou `Ignorer`
5. Switch sur mode `🎯 Focus decisions` -> click `Trancher` une Decision

**GO si** : 5 emails arbitres en < 4 min sans relance.

## Test 3 — Modal-detail enrichi (3 min)

**Critere GO** : ouvrir un detail Decision affiche meta + contexte + bouton `✦ Recommander avec Claude`.

**Steps** :
1. Ouvrir Decisions (drawer)
2. Click sur une carte Decision ouverte
3. Verifier modal-detail enrichi affiche : meta · contexte · options · pins lies
4. Click bouton `✦ Recommander avec Claude` (si LLM live)
5. Verifier qu une section `✦ Recommandation Claude` s ajoute en bas

**GO si** : modal s ouvre + bouton Recommander disponible (LLM live OU mode degrade clair).

## Test 4 — Trajectoire visuelle (2 min)

**Critere GO** : la page Trajectoire affiche markers colores avec hover + filtre temporel fonctionnel.

**Steps** :
1. Drawer -> section Capital -> click `Trajectoire`
2. Verifier hero `Votre chemin accompli` + 4 stats summary
3. Toggle filtres : `7j` / `30j` / `90j` / `tout` -> markers se recalculent
4. Hover sur un marker : tooltip avec date
5. Click marker : modal-detail s ouvre (si Decision/Big Rock/Project clos)

**GO si** : 4/5 elements OK + filtre temporel reactive instantanement.

## Test 5 — Bilan rituel soir (3 min)

**Critere GO** : completer le rituel Bilan en 90 secondes.

**Steps** :
1. Drawer -> Pilotage -> `Bilan` (anciennement Soiree)
2. Selectionner mood (1-5) et energie (1-5)
3. Remplir top 3 (optionnel)
4. Click `Cloturer ma journee`
5. Verifier streak +1 et redirection vers Cockpit

**GO si** : rituel complete en < 90 sec sans friction.

## Test 6 — Auto-draft Weekly Sync (3 min, LLM live uniquement)

**Critere GO** : si Claude live, le bouton `Generer un brouillon` produit un texte coherent en < 30 sec.

**Steps** :
1. Drawer -> Capital -> `Weekly Sync`
2. Click `Generer un brouillon` du banner premium
3. Attendre la reponse Claude
4. Verifier texte coherent + bouton bascule sur `✓ Brouillon genere`

**GO si** : brouillon produit en < 30 sec OU mode degrade affiche clairement (rule-based fallback).

## Critere global GO/NO-GO

| Test | Statut |
|---|---|
| 1 Cockpit chronotype | ⬜ |
| 2 Triage matinal | ⬜ |
| 3 Modal-detail enrichi | ⬜ |
| 4 Trajectoire visuelle | ⬜ |
| 5 Bilan rituel soir | ⬜ |
| 6 Auto-draft (si LLM live) | ⬜ |

**GO ExCom si** : 5/6 OU 6/6.
**NO-GO si** : ≤ 4/6.

## Apres recette : actions

- Si GO : push tag `v0.8-recette-ok` + preparer ExCom 04/05 (cf. `PITCH-EXCOM-04-05.md`)
- Si NO-GO : creer ADR `R-RECETTE-v0.8-NO-GO.md` listant les 2+ tests echoues + plan de fix avant nouvelle recette

---

**Version** : 1.0 · 29/04/2026 PM tres tardif · livre en autonomie agent
