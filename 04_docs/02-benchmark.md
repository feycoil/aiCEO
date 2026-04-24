# aiCEO — Benchmark approfondi

**Version 2.0 · 24 avril 2026 · 19 produits étudiés · 5 axes de comparaison (refonte Issue #2)**

> Note : recherche web 2024-2026 complétée par analyse produit. Les tarifs sont indicatifs et évoluent. Re-vérifier avant décision d'acquisition ou de partenariat.
> 
> **Changelog v2.0** — Refonte post-fusion v0.5 (Issue #2 atelier cohérence 2026-04) :
> (1) §0 aligné sur les 5 concurrents desktop-first explicites ;
> (2) ajout de l'Axe 5 · Phase locale avec analyse produit de chacun des 5 ;
> (3) ancre officielle pour les livrables externes (pitch, business case, deck) pendant la phase v0.5.

---

## 0. Deux marchés de référence, deux phases produit

> ⚠️ Suite à l'**ADR S1 · Trajectoire produit local → cloud + continuité** du 24/04/2026 ([DECISIONS.md](../00_BOUSSOLE/DECISIONS.md#adr-s1-trajectoire-produit)), aiCEO traverse **deux positionnements concurrentiels successifs**. Les deux sont traités dans ce document : phase locale dans l'Axe 5, phase cloud dans les Axes 1-4.

**Phase actuelle — local Windows (v0.4 livré, v0.5 en cours, cible T3 2026)**
Le marché de référence n'est plus le cloud SaaS productivité. Les 5 comparables directs sont :

1. **Microsoft Copilot for Business** — Copilot dans Outlook + Teams + Word, local + cloud M365
2. **Rewind.ai** — mémoire locale chiffrée, captures continues, interrogation LLM locale ou cloud
3. **Motion Desktop** — client desktop du SaaS Motion, planification auto + calendrier local
4. **Reflect** — notes backlinkées avec client desktop cross-platform + sync cloud chiffré E2E
5. **Superhuman — plugin Outlook** — email premium avec IA côté Outlook (pas la webapp)

Analyse détaillée dans l'**Axe 5** ci-dessous.

Point différenciant aiCEO dans cette phase : **arbitrage 3/2/N en langage de CEO multi-sociétés** (pas un chatbot générique branché sur Outlook), **souveraineté données** (tout reste sur le poste, proxy corp géré, mode démo sans API Anthropic), **intégration Outlook desktop native** via PowerShell COM (pas Graph API).

**Phase cible — cloud multi-CEO (V1 → V3, ouverture T4 2026 → 2027)**
Le marché de référence redevient le cloud SaaS chief-of-staff et productivité : Lattice, Motion, Sunsama, Superhuman webapp, Clara Labs, Dust, Lindy, Athena, Ema, Martin — tous étudiés dans les Axes 1 à 4.

Les deux benchmarks ne doivent pas être confondus : le produit local v0.5 ne prétend pas battre Motion sur la planification cloud, et le produit cloud V1+ ne prétend pas concurrencer Rewind sur la mémoire locale.

**Renvoi — livrables externes phase v0.5** : les pitchs, business case et deck investisseur produits pendant la fenêtre v0.5 (Issues #3, #4, #5, #7) **doivent citer l'Axe 5 ci-dessous** comme ancre concurrentielle actuelle, pas les Axes 1-4 qui décrivent la phase cible encore non livrée. Ce point évite de promettre un positionnement cloud chief-of-staff qu'aiCEO ne peut pas encore démontrer.

---

## Panorama — 19 produits, 5 familles

| Famille | Phase produit | Produits retenus |
|---|---|---|
| **Phase locale — desktop-first (Axe 5)** | v0.4 / v0.5 | Microsoft Copilot for Business, Rewind.ai, Motion Desktop, Reflect, Superhuman (plugin Outlook) |
| **IA proactive & chief-of-staff (Axe 1)** | V1+ cloud | Dust, Lindy.ai, Athena, Ema, Martin |
| **Pensée visuelle & graphique (Axe 2)** | V1+ cloud | Tana, Reflect, Napkin AI, tldraw, Heptabase, Miro AI |
| **Productivité & anti-surchauffe (Axe 3)** | V1+ cloud | Motion, Reclaim.ai, Sunsama, Superhuman (webapp), Amie |
| **Contexte IA émergent (Axe 4)** | transverse | Claude Agent SDK, GPT-5 Agents, Gemini 2.5 copilots |

> Reflect et Superhuman apparaissent dans deux axes : l'un pour leur expérience desktop-first actuelle (Axe 5, positionnement concurrentiel immédiat d'aiCEO v0.5), l'autre pour leur grammaire UX globale (Axes 2 et 3, utile pour préparer V1+).

---

## Axe 1 · IA proactive & chief-of-staff

### Dust (dust.tt) — RAG entreprise français

**Positioning** : agents IA connectés aux données d'entreprise ; "le ChatGPT de votre boîte".
**Cible** : PME/ETI tech-savvy (Alan, Qonto, Payfit).
**Tarif** : ~29 €/user/mois (Pro), Enterprise sur devis.

Assistants personnalisables, connecteurs natifs (Notion, Slack, Drive), multi-modèles (GPT/Claude/Mistral), Dust Apps pour workflows LLM chaînés, intégration Slack-first.

**Point fort** : l'ancrage data entreprise avec citations visibles ; création d'agents par non-devs en moins de 10 min.
**Limite pour aiCEO** : réactif, pas proactif. Horizontal multi-users, pas vertical mono-CEO. Ignore le contexte émotionnel du dirigeant.

### Lindy.ai — Agents autonomes d'exécution

**Positioning** : "Hire your first AI employee".
**Cible** : solopreneurs, fondateurs early-stage.
**Tarif** : Free (400 crédits), Pro ~49 $/mois, Business ~299 $/mois.

Agents déclenchés par événements (mail → action), meeting recorder + follow-up, lead qualification, phone agent (voix), agent-to-agent delegation.

**Point fort** : autonomie d'exécution réelle (envoie mails, remplit CRM) ; voix téléphonique crédible.
**Limite pour aiCEO** : task-centric, pas decision-centric. Pas de vision portefeuille. Pas de dimension coaching.

### Athena (athenago.com) — Chief-of-staff humain+IA

**Positioning** : "Your executive assistant, powered by humans and AI".
**Cible** : CEOs, VCs, fondateurs Series A+.
**Tarif** : 3 000–6 000 $/mois selon seniority de l'EA dédié.

EA humain dédié + Athena OS (plateforme interne qui capture préférences et SOPs), délégation multi-canal (email, WhatsApp, call), playbooks, communauté de fondateurs.

**Point fort** : **la référence du secteur** sur la délégation. Onboarding 2-4 semaines, capture des préférences implicites, promesse "1000 hours back".
**Limite pour aiCEO** : hybride humain-first (coût élevé), réactif, ne challenge pas stratégiquement, pas multi-sociétés.

### Ema.co — Universal AI employee

**Positioning** : agent IA généraliste qui remplace/augmente les rôles fonctionnels.
**Cible** : mid-market et enterprise, fonctions support/back-office.
**Tarif** : Enterprise uniquement (50-200k $/an).

EmaFusion (méta-modèle qui route vers le meilleur LLM), personas préconfigurés, Generative Workflow Engine, apprentissage par observation (shadowing), guardrails & audit.

**Point fort** : **pattern shadowing** — Ema regarde un humain faire puis reproduit. Positionnement "employé" vs "outil".
**Limite pour aiCEO** : B2B2E, ne sert pas la personne décideuse ; pas de dimension executive intelligence.

### Martin (trymartin.com) — AI chief-of-staff solo

**Positioning** : AI chief-of-staff iOS pour solopreneurs.
**Pertinence** : très proche d'aiCEO sur l'angle perso, à surveiller de près.

---

## Axe 2 · Pensée visuelle & graphique

### Tana (tana.inc) — Outliner sémantique

**Positioning** : "The AI-native workspace" — outliner structuré qui devient base de données graphe via super-tags.
**Tarif** : Free limité, Plus ~10 $/mois, Pro ~17 $/mois.

Patterns-clés : **outliner → graphe sémantique**, **super-tags** (tag = schéma + vue), **live views** (même nœud en liste/table/kanban/calendrier), mentions bidirectionnelles inline.

**IA & visualisation** : Tana AI auto-structure une réunion en nodes (speakers, decisions, tasks), suggère le bon schéma selon le contenu.
**Interactions à copier** : `#tag` déclenche sélecteur schéma ; bascule instantanée liste ↔ table ↔ board via raccourci.
**Limite** : courbe d'apprentissage raide, pas de canvas libre.

### Reflect (reflect.app) — Notes backlinkées + IA

**Positioning** : "Notes for thinkers".
**Tarif** : 10 $/mois flat.

Backlinks automatiques, graph view local, daily notes, tagging léger, inline AI prompts (`//commands`).

**IA & visualisation** : résume, propose des liens vers notes existantes (scores de similarité), pose questions socratiques, transcrit audio en note liée.
**À copier** : `//` pour invoquer l'IA en contexte, panneau "related notes" latéral permanent.
**Limite** : graph view décoratif, pas de canvas.

### Napkin AI (napkin.ai) — Texte-to-visuel

**Positioning** : génère des diagrammes éditables depuis un paragraphe.
**Tarif** : Free (filigrane), Pro ~10 $/mois.

**Patterns-clés** : sélection de texte → bouton "visualize", 4-6 variantes proposées (flowchart, matrice 2x2, funnel, pyramide, timeline, hub-spoke), édition inline, export SVG/PNG/PPT.

**IA pipeline** : parse intent → choose schema → layout. Reconnaît structures (étapes, oppositions, hiérarchies, causalités) et propose le bon gabarit.
**À copier** : bouton flottant "generate visual", galerie de variantes en carrousel.

### tldraw — Canvas spatial + agent IA

**Positioning** : canvas infini open-source avec SDK IA ("Make Real", computer agent).
**Tarif** : app gratuite, SDK commercial payant.

Canvas spatial infini 2D, sketch → code/UI, arrows sémantiques avec bindings, frames comme conteneurs, shape-level AI (agent qui manipule le canvas).

**À copier** : pan/zoom fluide, arrow binding, agent qui travaille visiblement sur le canvas.
**Limite** : canvas libre = pas de structure imposée.

### Heptabase & autres

- **Heptabase** : whiteboards de cartes, nesting de whiteboards, cartes-notes riches.
- **Obsidian Canvas** : canvas + embed vidéos/PDFs.
- **Logseq** : outliner open-source, blocs atomiques référençables.
- **Miro AI** : clustering de sticky-notes, génération de mindmaps, résumé de board.

---

## Axe 3 · Productivité & anti-surchauffe

### Superhuman — Email premium qui respecte le temps

**Positioning** : "The fastest email experience ever made" + AI native.
**Tarif** : 25-33 $/mois.

Split Inbox (VIP/Team/News), raccourcis clavier + Command-K, Auto Drafts, Snippets IA, Snooze et Reminders natifs, écran de clôture zen.

**Anti-surcharge** : promesse chiffrée "4h gagnées/semaine". Écran "You're done for now" à inbox zero.
**Tonalité** : minimaliste, premium, calme. Pas de rouge, pas de badge agressif.
**À copier** : l'**écran de clôture zen**, la promesse chiffrée.

### Motion — Auto-scheduling forcé

**Positioning** : "The AI that runs your day".
**Tarif** : 19-34 $/mois.

Auto-scheduling IA, re-planification automatique, protection focus, project management, meeting booking.

**Anti-surcharge** : Motion **refuse** d'ajouter une tâche si l'agenda est plein — "this task cannot fit before its deadline". Vrai mécanisme de NON.
**Tonalité** : efficace, dense, "productivity bro".
**À copier** : l'alerte "ça ne rentre pas, tu dois choisir".
**À éviter** : densité visuelle, ton optimisation.

### Reclaim.ai — Gardien du focus

**Positioning** : "AI calendar for busy professionals".
**Tarif** : Free, 10-18 $/user/mois selon plan.

Habits récurrents auto-placés (sport, lecture, lunch), Focus Time défendu contre les meetings, smart 1:1s reprogrammés, scheduling links avec buffer, stats hebdo.

**Anti-surcharge** : habitudes personnelles ont le **même poids** qu'une réunion. Buffer auto entre meetings. Rapport hebdo alerte si >50 % de meetings.
**Tonalité** : rassurante, vocabulaire "defend / protect / habits".
**À copier** : habitude = RDV non négociable, rapport équilibre meetings/focus.

### Sunsama — Le rituel apaisé (référence n°1)

**Positioning** : "The daily planner for calm, focused work".
**Tarif** : 16-20 $/mois.

Planning guidé du matin (3-5 min), shutdown rituel du soir, Big Rocks hebdo (max 3 priorités), time-boxing, avertissement si journée > capacité.

**Anti-surcharge** : **champion du NON**. "Your day looks full — move some to tomorrow?". Shutdown impose clôture explicite.
**Tonalité** : chaleureuse, humaine, copy à la première personne, emojis doux.
**À copier** : **quasiment tout** — rituel d'ouverture/clôture, alerte de surcharge bienveillante, Big Rocks hebdo. C'est le modèle tonal de référence pour aiCEO.

### Amie — Joyful productivity

**Positioning** : calendrier et tâches dans un canvas coloré.
**Pertinence** : fusion agenda/tâches sans friction, UX chaleureuse.

---

## Grille comparative maîtresse

| Critère | Dust | Lindy | **Athena** | Ema | Tana | Napkin | **Sunsama** | Motion | Reclaim | Superhuman |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Proactivité IA | ● | ●● | ●● | ●● | ● | ○ | ●● | ●● | ●● | ●● |
| Exécution autonome | ○ | ●●● | ●●● | ●●● | ○ | ○ | ○ | ●● | ●● | ●● |
| Mémoire long-terme CEO | ● | ●● | **●●●** | ●● | ●● | ○ | ●● | ● | ●● | ● |
| Délégation à humain | ○ | ○ | **●●●** | ●● | ○ | ○ | ○ | ○ | ○ | ● |
| Vision portefeuille | ○ | ○ | ○ | ○ | ●● | ○ | ● | ● | ● | ○ |
| Pensée visuelle | ● | ○ | ○ | ○ | **●●●** | **●●●** | ● | ● | ● | ● |
| NON explicite | ○ | ○ | ● | ○ | ○ | ○ | **●●●** | ●●● | ●● | ● |
| Rituel quotidien | ○ | ○ | ●● | ○ | ● | ○ | **●●●** | ● | ●● | ● |
| Coach stratégique | ○ | ○ | ● | ○ | ○ | ○ | ● | ○ | ○ | ○ |
| Tarif | €€ | €€€ | €€€€€ | €€€€€ | €€ | € | €€ | €€ | €€ | €€€ |

Légende : ●●● = excellent · ●● = correct · ● = partiel · ○ = absent.

---

## Axe 4 · Le contexte IA 2026 (couche technique)

**Claude Sonnet 4.5 (Anthropic)** — meilleur raisonnement agentique longue-durée (30h+ de cohérence), context 200K–1M, pricing 3$/15$ par M tokens, excellent function calling parallèle. Cerveau principal recommandé.

**GPT-5 / GPT-5-mini (OpenAI)** — routage auto thinking/non-thinking, 400K context, coût faible sur petits appels. Idéal pour classification haute fréquence.

**Gemini 2.5 Pro (Google)** — context 1M-2M natif, multimodal (vidéo/PDF), grounding Google Search. Fallback pour ingestion SharePoint massive.

**Frameworks agentiques** : LangGraph (workflows durables), Claude Agent SDK (sub-agents + skills + MCP), OpenAI Agents SDK (léger), Inngest (orchestration proactive).

**Détails complets** : voir `06-architecture.md`.

---

## Axe 5 · Phase locale — marché desktop-first (v0.4 / v0.5)

> Ancre concurrentielle **actuelle** d'aiCEO, à citer dans tous les livrables externes produits pendant la fenêtre v0.5 (Issues #3 à #7).
> Les Axes 1 à 4 décrivent le marché de la **phase cible (V1+ cloud)** — utile pour la vision, pas pour le positionnement immédiat.

### Microsoft Copilot for Business — le mastodonte intégré

**Positioning** : Copilot IA dans toutes les apps Microsoft 365 (Outlook, Teams, Word, Excel, PowerPoint). Cible : entreprises déjà équipées M365.
**Profil desktop/local** : hybride. Les données restent dans le tenant M365 (cloud Microsoft), l'UI est dans le client desktop. Pas d'option 100 % on-premise pour la couche IA.
**Forces** : intégration native Outlook/Teams native, gouvernance M365, support entreprise, compatibilité proxy corp.
**Faiblesses vs aiCEO v0.5** : (1) pas d'arbitrage multi-sociétés en langage de CEO — reste un assistant générique d'inbox ; (2) licence 30 €/utilisateur/mois minimum, nécessite M365 E3/E5 au-dessus ; (3) données passent chez Microsoft (OK pour ETIC, bloquant pour un CEO soucieux de souveraineté) ; (4) pas de mode "mono-poste sans tenant" pour un CEO nomade.
**Pricing** : 28,10 €/utilisateur/mois + licence M365.
**Verdict pour aiCEO** : concurrent le plus crédible côté achat rationnel CEO ETIC. **Angle de différenciation** : aiCEO ne remplace pas Copilot sur Outlook — il propose une **couche d'arbitrage par-dessus** qui raisonne sur les 4 sociétés du CEO (ETIC Services, ADABU, Cowork, ETIC Education), chose qu'un Copilot d'inbox ne fait pas.

### Rewind.ai — mémoire locale chiffrée

**Positioning** : "pensée auto-indexée" — capture continue d'écran + audio + messaging local, interrogeable par LLM. Cible : individus productifs exigeant confidentialité.
**Profil desktop/local** : 100 % local macOS/Windows. Index chiffré par défaut, rien ne quitte la machine sauf si l'utilisateur active le cloud pour l'interrogation LLM (ou apporte sa clé Anthropic/OpenAI).
**Forces** : souveraineté radicale (tout sur le disque), recherche temporelle ("ce que j'ai vu mardi entre 14h et 16h"), plugins (Zoom, Slack, Outlook).
**Faiblesses vs aiCEO v0.5** : (1) pas d'arbitrage proactif — c'est un moteur de recherche, pas un copilote qui propose des décisions ; (2) pas de notion de société/projet/Big Rock — raisonne sur l'humain solo ; (3) coût stockage disque important (200 Go/mois d'index typiques) ; (4) pas d'intégration pilotée Outlook (les mails sont indexés mais pas actionnés).
**Pricing** : 19 $/mois par utilisateur (Rewind), 29 $/mois Pro.
**Verdict pour aiCEO** : concurrent direct sur l'angle "souveraineté locale". **Angle de différenciation** : aiCEO n'est pas un miroir passif de l'activité, c'est un **filtre actif** qui produit 3 priorités et 2 délégations par matin — une métaphore de chief-of-staff, pas de secrétaire mémoire.

### Motion Desktop — planification auto calendrier

**Positioning** : client desktop du SaaS Motion. Auto-scheduling agressif qui casse la journée en blocs selon les tâches ouvertes et leurs deadlines.
**Profil desktop/local** : client Electron packagé sur macOS/Windows, mais **les données sont cloud Motion** (AWS). Le desktop sert d'UI temps réel et de notification, pas de mode offline complet.
**Forces** : intégration calendrier Google/Outlook bidirectionnelle, déblocage de créneaux, alertes "tu vas déborder".
**Faiblesses vs aiCEO v0.5** : (1) sèche tonalement — pas de langage de CEO, tout en anglais productivité ; (2) casse la serendipité (bloque tous les créneaux, pas d'espace de respiration) ; (3) données cloud Motion (OK pour indiv, non pour CEO confidentialité) ; (4) pas de notion de délégation humaine.
**Pricing** : 19 $/mois individuel, 34 $/mois équipe.
**Verdict pour aiCEO** : concurrent sur l'angle "ne rate rien". **Angle de différenciation** : aiCEO **propose**, n'impose pas — la décision reste au CEO (validation 3/2/N), et la grammaire est française-pair, pas américaine-productivité.

### Reflect — notes backlinkées cross-platform

**Positioning** : notes personnelles type Roam/Obsidian, mais avec IA native (Claude côté assistant) et sync cloud chiffrée E2E. Cible : penseurs exigeant bi-directional linking + IA.
**Profil desktop/local** : clients natifs macOS / Windows / iOS / Android + web. Données chiffrées E2E côté cloud (Reflect ne peut pas les lire). Desktop garde un cache local.
**Forces** : rapidité, IA intégrée dans la prise de note, backlinking propre, UX épurée.
**Faiblesses vs aiCEO v0.5** : (1) c'est un outil de note, pas de décision — pas de verrouillage à 3 Big Rocks, pas de délégation ; (2) pas d'intégration Outlook active (les mails ne sont pas ingérés pour arbitrage) ; (3) pas de notion multi-sociétés ; (4) le CEO cible de Reflect est plutôt un penseur solo, pas un CEO multi-casquettes.
**Pricing** : 10 $/mois, 100 $/an.
**Verdict pour aiCEO** : concurrent latéral sur l'angle "mémoire CEO". **Angle de différenciation** : aiCEO ne remplace pas Reflect sur la prise de note — il se connecte à Reflect (V1 potentiel) comme source de préférences implicites.

### Superhuman — plugin Outlook (côté desktop)

**Positioning** : email premium "fastest email experience in the world". Historiquement webapp autonome ; en 2025 a lancé **Superhuman for Outlook** — un plugin qui pose son UI au-dessus du client Outlook desktop.
**Profil desktop/local** : plugin COM / add-in qui s'injecte dans Outlook desktop. Traitement IA côté cloud Superhuman (via Azure OpenAI), les mails transitent par Superhuman pour le smart-sort et l'assist.
**Forces** : ergonomie irréprochable (keyboard-first, tri automatique), compatibilité corp Outlook desktop (vs Superhuman webapp qui force le navigateur), snippets IA contextuels.
**Faiblesses vs aiCEO v0.5** : (1) focus strict inbox — pas d'agenda, pas de décisions, pas de multi-sociétés ; (2) données transitent par Superhuman (acceptable pour la plupart, pas pour CEO très exigeants souveraineté) ; (3) prix élevé ; (4) pas de langage CEO, rester "power user email".
**Pricing** : 30 $/mois utilisateur, 40 $/mois équipe.
**Verdict pour aiCEO** : concurrent direct sur l'angle "CEO qui croule sous Outlook". **Angle de différenciation** : aiCEO **va plus loin que la boîte mail** — il arbitre entre mails + rendez-vous + décisions + délégations, là où Superhuman s'arrête à "trier et répondre vite".

### Grille Axe 5 — comparaison synthétique

| Critère | Copilot M365 | Rewind | Motion Desktop | Reflect | Superhuman | **aiCEO v0.5** |
|---|---|---|---|---|---|---|
| Locality des données | Cloud MS tenant | 100 % local | Cloud Motion | Cloud E2E | Cloud Superhuman | **100 % local poste** |
| Proxy corp OK | oui | oui | oui | oui | oui | **oui (testé)** |
| Mode démo sans API | non | non | non | non | non | **oui** |
| Arbitrage 3/2/N | non | non | non | non | non | **oui (différenciateur clé)** |
| Multi-sociétés natif | non | non | non | non | non | **oui (4 sociétés ETIC)** |
| Langage CEO français | non | non | non | non | non | **oui** |
| Délégation humaine outillée | non | non | non | non | non | **partielle (v0.4)** |
| Intégration Outlook desktop | native (M365) | plugin | Graph API | non | plugin natif | **COM PowerShell** |
| Coût mensuel | 30 €+licence | 19–29 $ | 19–34 $ | 10 $ | 30 $ | **~5 € Anthropic API** |
| Courbe d'apprentissage | faible (M365 inclus) | moyenne | forte (auto-schedule) | faible | faible | **moyenne (rituel matin)** |

**Lecture de la grille** : sur les 5 critères stratégiques (arbitrage 3/2/N, multi-sociétés, langage CEO, délégation, souveraineté locale), **aucun des 5 concurrents desktop-first ne coche plus de 0 ou 1 case**. aiCEO v0.5 coche 5/5. Le trou de marché desktop-first est au moins aussi franc que le trou cloud chief-of-staff décrit en Axe 1.

**Limites de l'analyse** : (1) pricing CEO premium reste à trouver — aucun des 5 n'occupe le segment "100-300 €/mois par CEO pour un vrai copilote multi-sociétés" ; (2) la menace d'un Copilot M365 qui ajouterait une feature "multi-tenant aggregation" est réelle mais pas annoncée à date ; (3) la robustesse aiCEO dépend de la qualité d'intégration Outlook COM — à stabiliser pendant v0.5 (Issue #10 OpenAPI, Issue #11 Husky).

---

## Les 10 insights à retenir

**1 · Personne ne combine proactivité stratégique + vision multi-sociétés + IA-first.**
Athena est le plus proche du chief-of-staff mais reste réactif et cher. Les autres servent des équipes ou des fonctions. **Le trou de marché est réel.**

**2 · La mémoire long-terme du CEO est le vrai moat.**
Athena OS le prouve. Capturer les préférences *implicites* du dirigeant — tolérance au risque, style de communication, red lines — vaut plus qu'un moteur de workflow.

**3 · Le shadowing d'Ema est transposable.**
Observer le CEO 2-3 semaines (emails, calls, décisions) avant de proposer, plutôt que demander un setup explicite. Réduit la friction d'onboarding — critique pour un profil "pas le temps".

**4 · La délégation à un humain reste le maillon faible partout.**
Personne n'outille bien "assigne à mon COO + suis jusqu'à livraison + escalade si retard". **Opportunité claire.**

**5 · Le tonal anti-surchauffe suit Sunsama.**
Chaleureux, première personne, pas d'urgence rouge, rituels matin/soir. Tout produit qui s'oppose à ce pattern (Motion, Lindy) perd la bataille du long-terme émotionnel.

**6 · Tana est la grammaire visuelle de référence.**
Un node, N vues (liste, table, kanban, calendrier, graphe). C'est le pattern à copier pour Feycoil — quel que soit le contenu, il peut basculer entre formes de pensée.

**7 · Napkin a cassé la barrière texte → visuel.**
Il suffit d'un bouton flottant à la sélection pour générer 4-6 variantes de schémas. Intégrable dans aiCEO partout où du texte apparaît (brief, décision, revue hebdo).

**8 · tldraw montre le futur du canvas IA.**
L'agent travaille visiblement sur le canvas, pas dans un chat. C'est le pattern qui rend l'IA "collègue" plutôt qu'"outil".

**9 · Le pricing structure la promesse.**
Sous 100 €/mois = outil. 500-1000 €/mois = collaborateur IA. > 3 k$/mois = chief-of-staff. **aiCEO doit choisir la zone 300-800 €/mois** (entre Lindy et Athena) — vide et cohérente avec un "EA IA premium sans humain".

**10 · Le NON bienveillant est un différenciateur de rétention.**
Motion le fait sèchement, Sunsama le fait avec douceur, personne ne le fait avec argumentation stratégique. L'IA d'aiCEO doit savoir dire non ET expliquer pourquoi : "tu as déjà 3 Big Rocks, celui-ci casserait la cohérence — reporte ou remplace ?"

---

## Matrice d'emprunt : ce qu'on copie, ce qu'on évite

### À copier, adapter, intensifier

- **De Sunsama** : rituel matin/soir, Big Rocks (limite 3), "your day looks full", ton chaleureux.
- **D'Athena** : mémoire de préférences implicites, délégation avec SLA et hand-off clair, philosophie "1000 hours back".
- **De Tana** : un node N vues, raccourcis de bascule de format, super-tags typés.
- **De Napkin** : bouton flottant texte → visuel, galerie de variantes.
- **De tldraw** : agent visible sur canvas, frames comme conteneurs modulaires.
- **De Reclaim** : habitudes = RDV non négociables, buffer auto entre meetings.
- **De Superhuman** : écran de clôture zen, raccourcis clavier partout, promesse chiffrée.
- **D'Ema** : shadowing par observation, generative workflow (plan à la volée).
- **De Lindy** : phone agent (voix, v3+).
- **De Motion** : "ça ne rentre pas" — le vrai mécanisme de NON.

### À éviter explicitement

- Le ton "productivity bro" (Motion).
- L'inbox zero comme injonction (Superhuman risque).
- Le chat comme centre (Dust, Lindy — le chat doit être une porte, pas la maison).
- Le streak qui récompense la productivité (Duolingo-style) — chez nous, le streak récompense le repos.
- L'opacité agentique (Ema, Dust) — toute action IA doit être traçable et réversible.
- La structure par modules (Agenda/Tâches/Mail) — aiCEO est structuré par sociétés et décisions.

---

## Positionnement concurrentiel

```
            PROACTIF (pousse)
                   ▲
                   │
         Motion ●  │  ● aiCEO (cible)
                   │
    Lindy ●        │        ● Sunsama
                   │
     ──────────────┼────────────── pensée
    Dust ●         │         ● Athena     visuelle
                   │                      ───►
                   │
       Ema ●       │       ● Tana
                   │
    Superhuman ●   │   ● Napkin
                   │
                   ▼
            RÉACTIF (répond)
```

**aiCEO se positionne dans le quadrant haut-droit** : proactif **ET** visuel, mono-CEO premium sans chief-of-staff humain.

---

## 📌 Sources consultées

### Chief-of-staff / IA proactive
https://dust.tt · https://www.lindy.ai · https://www.athenago.com · https://www.ema.co · https://trymartin.com

### Pensée visuelle
https://tana.inc · https://reflect.app · https://www.napkin.ai · https://tldraw.com · https://makereal.tldraw.com · https://heptabase.com · https://obsidian.md/canvas · https://logseq.com · https://miro.com/ai · https://www.figma.com/figjam/ai

### Productivité & coaching
https://superhuman.com · https://www.usemotion.com · https://reclaim.ai · https://www.sunsama.com · https://amie.so · https://calendar.notion.so · https://www.betterup.com · https://work.headspace.com

### Technique & IA
https://www.anthropic.com/news/claude-sonnet-4-5 · https://openai.com/index/introducing-gpt-5 · https://blog.google/technology/google-deepmind/gemini-2-5-pro · https://langchain-ai.github.io/langgraph · https://www.inngest.com · https://artificialanalysis.ai/models

### Analyses marché
https://a16z.com/visual-thinking-tools-2025 · https://www.firstround.com/review/inbox-zero-superhuman-productivity · https://www.lennysnewsletter.com/p/sunsama-rahul-vohra · https://hbr.org/2024 (executive burnout & calm productivity)

---

*Document lié : `01-vision-produit.md` · `03-ia-proactive.md` · `04-visualisation.md` · `05-coaching-ux.md` · `06-architecture.md`*
