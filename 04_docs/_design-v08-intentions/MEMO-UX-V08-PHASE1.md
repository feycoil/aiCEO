# MEMO UX v0.8 — Phase 1 Cadrage (refondu voix exec)

**Statut** : VALIDE Phase 1 · **Date** : 29/04/2026 PM tardif · **Audience** : binome CEO + agent Claude · **Voix** : exec moderne avec anglicismes premium ancres (cf. `VOICE-AICEO.md`)

## 1. Phrase magnetique (6 mots, rythme trinitaire)

**Naviguer clair. Trancher juste. Dormir serein.**

> Validation CEO Etape 2.1 (29/04/2026 PM tardif) — phrase magnetique fixee.

## 2. Identite tranchee

aiCEO **EST** le Compass executive du CEO francophone CSP+ : journey rituel + cards interactives discretes + Trajectoire visuelle + assistant IA bienveillant. aiCEO **N EST PAS** un dashboard admin, un CRM, un outil de productivite generique, ni une app de gamification "saine forte".

## 3. Principes directeurs (6 nominaux)

1. **Surface vide d abord, contenu sur demande** — Hub Google, pas Salesforce.
2. **Suggere, n impose** — Amie discret > Outlook intrusif.
3. **Visualisation > liste** — Anneau, timeline, carte > tableau brut.
4. **Geometrie pure, jamais kitsch** — Apple Fitness > Duolingo.
5. **Une chose a la fois** — Superhuman focus > Bloomberg surcharge.
6. **Premium par retenue** — Linear, pas SAP.

## 4. 5 tensions tranchees

- **B1 luxe×gam = 4/10** — gam visible mais sobre (streak chiffre + 1 anneau + indicateur progression). Aucun XP/mascotte/confettis.
- **B2 profil = a→b** — Major Fey CEO ETIC reel maintenant, CEO francophone CSP+ premium au moment SaaS V1.
- **B3 semantique = voix exec moderne** — anglicismes premium ancres (Compass, North Star, Sync, Triage, Pulse...) quand le francais est lourd. Glossaire fige : `GLOSSAIRE-AICEO.md`.
- **B4 navigation = A** journey + liberte derriere drawer.
- **B5 Trajectoire = HYBRIDE** — bloc Hub synthetique non-interactif + page dediee `trajectoire.html` interactive (drawer Wealth). Affiche mix Decisions strategiques + Big Rocks + Projects clos.

## 5. Glossaire metier — voir `GLOSSAIRE-AICEO.md`

12 termes canoniques en voix exec moderne :
**Hub · Stream · Project · Action · Decision · Pin** (architecture)
**Compass · North Star · Big Rock · Sync · Triage · Pulse** (rituels & strategie)

## 6. Visualisations conceptuelles par page

| Page | Vue | Visualisation marquante |
|---|---|---|
| **Hub** | macro | Grid 3 vagues (Compass / Deliver / Wealth) + greeting Aubrielle chronotype + bloc Trajectoire mini |
| **Trajectoire** | macro | Timeline horizontale × axe-Y Streams, markers carres colores par kind |
| **Cockpit** | micro | Anneau journee + dot-chart 7j velocite Triage + bloc Trajectoire mini avec CTA |
| **Project** | micro | Mindmap (Decisions ↔ Actions ↔ Contacts lies) au lieu de listes |
| **Equipe** | micro | Reseau de contacts (graphe par recence + volume mails) |
| **Agenda** | micro | Timeline verticale jour avec events colores par Project auto-lie |
| **Weekly Sync** | micro | Big Rocks numerotes 1/2/3 + barre progression trimestre vs North Star |
| **Decisions** | micro | Card timeline avec rail couleur statut + modal-detail enrichi |

## 7. Chronotype visuel

| Tranche | Palette | Densite | Tonalite langage |
|---|---|---|---|
| **Matin** (6h-12h) | warm ivory + accent rose | epure | energique mais douce |
| **Journee** (12h-18h) | neutre paper + ink | standard | pragmatique direct |
| **Soir** (18h-22h) | warm + ivory chaud | epure | contemplatif bienveillant |
| **Nuit** (22h-6h) | cool legerement assombri | epure max | rare et indulgent |

## 8. 5 KPIs parametrables (Reglages → Coaching)

| KPI | Cible defaut | Parametrable |
|---|---|---|
| Streak | 18 j / 30 (60 %) | OUI |
| Decisions tranchees / sem | 5 | OUI |
| Big Rocks ratio | 2/3 (67 %) | OUI |
| Pulse mood 7j (serenite) | 3.8 / 5 | OUI |
| Time-to-1ere-action Cockpit | ≤ 10 sec | OUI |

## 9. Punch-list Phase 2 (refonte Cockpit, ordre + estimation)

1. **Hero greeting Aubrielle chronotype** — adapter palette + tonalite par tranche (45 min)
2. **Anneau journee** — composant SVG circulaire 3 segments (Decisions / Actions / Sync) (60 min)
3. **Bloc "Ma Trajectoire" synthetique non-interactif** — 7 derniers jours horizontal + CTA page dediee (45 min)
4. **Refonte KPI row** — 4 tiles avec progression vs cible parametrable (30 min)
5. **North Star premium** — bloc gradient simplifie, 1 phrase intention mise en avant (20 min)
6. **Top 3 Eisenhower** — ordering par priorite avec icones rang 1/2/3 (30 min)
7. **Suppression projects-houses encombrant** — remplacer par lien drawer Projects (10 min)
8. **Tests v07-atomic.test.js verts + ADR S6.17** (20 min)

**Total estimation : ~4h binome.**

## 10. Scope-out explicite (NE FAIT PAS Phase 1+2)

- ❌ Mode sombre (V2)
- ❌ Illustrations sur mesure (V1.x designer humain)
- ❌ Audit accessibilite WCAG complet (pre-V1)
- ❌ Refonte 18 pages d un coup (page-pilote Cockpit seul)
- ❌ Gamification Duolingo-like (XP/mascotte/confettis/ligues)
- ❌ Page `trajectoire.html` complete interactive (S6.18 separe)
- ❌ Cablage LLM frontend complet (S6.13 separe)
- ❌ Mobile responsive audit complet (V1)
- ❌ Renommage drawer Pilotage→Compass / Travail→Deliver / Capital→Wealth dans le code (S6.17 ou S6.18 separe avec migration libelles)

---

**Validation CEO** : 5 min de relecture. Si OK → lance Phase 2 refonte Cockpit. Si desaccord → 1 boucle d ajustement.

**Voir aussi** : `MOODBOARD-V08-PHASE1.svg` · `GLOSSAIRE-AICEO.md` · `VOICE-AICEO.md`
