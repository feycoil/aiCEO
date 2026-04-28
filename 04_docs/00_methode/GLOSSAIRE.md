# Glossaire aiCEO — pour CEO non-tech

> *Référence : tous les acronymes et le jargon technique du projet expliqués en français simple, avec un exemple à chaque fois.*
> **Quand utiliser** : à consulter dès qu'un terme inconnu apparaît dans un audit, une ADR, un sprint. Mis à jour à chaque sprint.

---

## A

**ADR** (Architecture Decision Record)
> *Document court et daté qui acte une décision technique ou produit prise pendant le projet, avec son contexte et ses conséquences.*
> **Pourquoi c'est utile** : on peut retrouver pourquoi on a fait tel choix il y a 3 mois sans deviner.
> **Exemple** : `ADR v8 · Adoption méthode ADD-AI` explique pourquoi on engage 22 j-binôme dans cette méthode et quels sont les critères de sortie.

**ADD-AI** (AI-Driven Development)
> *Méthode de développement de logiciel où c'est l'IA (Claude) qui écrit, teste, livre le code, et le CEO qui valide les arbitrages stratégiques.*
> **Notre cas** : aiCEO est le 1er produit ETIC entièrement développé en ADD-AI.

**API** (Application Programming Interface)
> *Façon pour deux logiciels de se parler. aiCEO expose des routes type `/api/decisions` que le frontend (la page web) appelle pour récupérer ou modifier des données.*

---

## B

**Big Rocks**
> *Vocabulaire interne aiCEO. Les **3 priorités hebdomadaires** du CEO posées en début de semaine. Les "gros cailloux" qu'on doit absolument déplacer cette semaine.*
> **Origine** : référence au métaphore de Stephen Covey (gros cailloux dans le bocal avant le sable).
> **Visuel** : barres de progression sur le cockpit aiCEO.

**Backlinks bidirectionnels**
> *Quand un objet (ex: décision) sait quels autres objets le référencent (ex: projets, contacts).*
> **Notre cas** : Décisions ↔ projets ↔ contacts ↔ knowledge_pins. Cliquer sur une décision montre les projets liés, et inversement.

**Beta closed**
> *Version en test fermé chez quelques utilisateurs sélectionnés (vs beta open au grand public).*
> **Notre cas** : V1.1 sera proposée à 5 CEO pairs francophones (Lamiae + 4 réseaux Feyçoil).

**Boucle du soir** *(jargon interne aiCEO)*
> *Rituel quotidien du soir : noter humeur, énergie, top 3 du jour, capturer ce qui a coûté.*
> **Effet** : alimente le coaching IA + revue hebdo + streak.

---

## C

**CEO pair**
> *Un autre CEO du même calibre que le user principal, qui utilise aussi le produit. Pour aiCEO : CEOs francophones de PME tech.*

**Cockpit**
> *Vocabulaire interne aiCEO. La page d'accueil de l'app qui montre l'état du jour : intention, Big Rocks, alertes, suggestions IA.*
> **Inspiration** : tableau de bord d'avion — voir ce qui compte sans chercher.

**Cmd+K (palette)**
> *Raccourci clavier (Ctrl+K sur Windows, Cmd+K sur Mac) qui ouvre une fenêtre de recherche universelle.*
> **Pourquoi** : standard dans tous les outils CEO modernes (Linear, Notion, Reflect). Permet de naviguer ou agir sans souris.

**Compte à rebours sprint**
> *Sprint = bloc de travail de 0.5 à 2 j-binôme avec un objectif clair. Numéroté (ex: S6.9-bis, S7.1).*

**Continuité** *(principe ADD-AI #1)*
> *Capacité de Claude à se rappeler de tout entre les sessions via mémoire structurée (CLAUDE.md + memory/ + ADRs + retex).*

---

## D

**DS** (Design System)
> *Ensemble de règles visuelles cohérentes : couleurs, polices, espacements, composants.*
> **Notre cas** : DS Twisty avec 5 couleurs sémantiques (`--violet`, `--rose`, `--amber`, `--emerald`, `--sky`).

**Dogfood**
> *Tester son propre produit en conditions réelles avant de le sortir aux clients. ("eat your own dog food")*
> **Notre cas** : Major Fey utilise aiCEO sur ses propres données ETIC depuis avril 2026.

---

## E

**Eisenhower 5 verdicts** *(jargon interne aiCEO)*
> *Les 5 actions possibles sur chaque email/décision en mode arbitrage matinal :*
> 1. **Faire** maintenant ou cette semaine
> 2. **Déléguer** à un membre de l'équipe
> 3. **Décaler** plus tard (snooze)
> 4. **Archiver** sans action (référence)
> 5. **Décliner** poliment
>
> **Origine** : matrice d'Eisenhower (urgent vs important) adaptée au workflow CEO.

**E2E** (End-to-End test)
> *Test qui simule un parcours utilisateur complet (clic, navigation, vérification) au lieu de tester un bout de code isolé.*

**ETIC**
> *ETIC Services : la société de Major Fey, propriétaire d'aiCEO.*

---

## F

**FTS5** (Full-Text Search version 5)
> *Module SQLite qui permet la recherche en texte intégral rapide dans la base.*
> **Notre cas** : permettra Cmd+K palette de chercher dans tous les emails, tâches, décisions, notes en quelques ms.

---

## G

**Garde-fou** *(jargon interne ADD-AI)*
> *Critère formel qui doit être validé sinon on s'arrête. Notre projet en a 3 : SPIKE J+1, BETA Lamiae S6.16, critères de sortie ADD-AI.*

---

## I

**ICP** (Ideal Customer Profile)
> *Profil client idéal pour le produit.*
> **Notre cas** : CEO francophone d'une PME tech, sensible à la souveraineté de ses données, 30-50 ans, déjà sur Outlook.

**Inbox-zero**
> *État où la boîte mail est vide. Méthode de productivité (Merlin Mann).*
> **Notre cas** : objectif de l'arbitrage matinal aiCEO — 28 emails traités en 12 min.

---

## J

**Jobs-to-be-done**
> *Méthode produit (Clayton Christensen) qui se demande "quel travail le client embauche-t-il ce produit pour faire ?" plutôt que "quelles sont ses caractéristiques ?".*
> **Notre cas** : aiCEO est embauché pour "trancher mes 5 décisions de la semaine sans procrastiner" et "ne plus oublier ce que mes mentors m'ont dit".

---

## K

**KPI** (Key Performance Indicator)
> *Indicateur clé de performance. Métrique chiffrée qu'on suit régulièrement pour piloter.*
> **Nos KPIs produit** : Time-to-first-decision, arbitrage velocity, streak médian, % décisions non-stale, coût LLM/CEO/mois, NPS interne, friction reports.

---

## L

**LLM** (Large Language Model)
> *Modèle d'IA qui génère du texte. ChatGPT, Claude, Mistral, Gemini sont des LLMs.*
> **Notre cas** : Anthropic Claude (Sonnet pour les décisions courantes, Opus prévu V3 pour le coaching long).

**Lean** *(qualificatif méthode)*
> *Approche minimaliste : ne construire que ce qui est nécessaire pour valider la prochaine étape.*
> **Notre cas** : Lean ADD-AI = version Lean (3 j Phase 0) au lieu de la version pleine (5 j Phase 0).

---

## M

**MCP** (Model Context Protocol)
> *Standard ouvert créé par Anthropic permettant à Claude de se connecter à des outils externes (bases de données, APIs, fichiers locaux).*
> **Notre cas** : MCP `aiceo-mcp` exposera la base SQLite locale au pilotage et aux subagents.

**MVP** (Minimum Viable Product)
> *Version minimale du produit qui fonctionne et permet d'apprendre. Pas une version "amputée" mais une version "concentrée".*
> **Notre cas** : aiCEO V1 = MVP commercialisable.

**Méta-amélioration** *(principe ADD-AI #5)*
> *Chaque sprint produit un retex qui sert à améliorer Claude lui-même (skills, conventions, hooks). L'IA devient meilleure à chaque sprint.*

---

## N

**NPS** (Net Promoter Score)
> *Score de 0 à 10 qui mesure la satisfaction utilisateur. Question type : "Recommanderiez-vous ce produit à un pair ?".*
> **Notre cas** : critère de sortie SPIKE — NPS Lamiae ≥ 6/10 pour valider Phase 2.

---

## O

**OWASP Top-10**
> *Liste des 10 risques de sécurité web les plus critiques publiée par l'OWASP (Open Web Application Security Project).*
> **Notre cas** : audit obligatoire avant V1 — XSS, injections SQL, secrets exposés, etc.

---

## P

**PaaS / SaaS**
> **PaaS** = Platform as a Service (ex: Heroku) — louer une plateforme de déploiement.
> **SaaS** = Software as a Service (ex: Notion) — louer un logiciel hébergé chez le fournisseur.
> **Notre cas** : aiCEO V1 reste local (zéro cloud). V2 deviendra SaaS.

**Pin / pin_to_knowledge**
> *Action d'épingler un élément (décision, critère, note) dans la base de connaissance long-terme du CEO.*
> **Notre cas** : tool LLM côté serveur — Claude appelle automatiquement `pin_to_knowledge(...)` quand il détecte un élément cristallisé dans la conversation.

**PRD** (Product Requirements Document)
> *Document central qui décrit la promesse, l'ICP, les jobs-to-be-done. À ne pas confondre avec un cahier des charges figé.*

**PWA** (Progressive Web App)
> *Application web qui peut s'installer comme une app native (iOS, Android, Windows) avec icône, mode hors-ligne, notifications.*
> **Notre cas** : aiCEO V1 sera une PWA (déjà manifest + service worker présents).

---

## R

**Retex** (RETour d'EXpérience)
> *Document court rédigé après un sprint qui dit : ce qui a marché, ce qui a coûté, ce qui m'a surpris, ce que je referais différemment.*

**RGPD** (Règlement Général sur la Protection des Données)
> *Loi européenne sur la protection des données personnelles.*
> **Notre cas** : avantage compétitif d'aiCEO — 100% local = données jamais sur cloud étranger.

**Roadmap V2**
> *Plan stratégique aiCEO post-audit 28/04 — 4 phases · 22 sprints · 22 j-binôme · 12 semaines.*

**ROI** (Return On Investment)
> *Ce que rapporte un investissement (temps, argent) divisé par ce qu'il coûte.*
> **Notre cas** : ROI ADD-AI = vélocité ×1.5 + coût −40% si la méthode tient ses promesses.

---

## S

**Skill** *(Cowork)*
> *Fichier markdown qui décrit un comportement à activer dans Claude (ex: `/kickoff`, `/ship`, `/audit`).*
> **Notre cas** : on en crée 3 minimum dans S6.9-bis-LIGHT.

**SOC 2** (Service Organization Controls 2)
> *Certification de sécurité requise pour vendre du SaaS aux entreprises américaines.*
> **Notre cas** : prévue V2 (~50 k€).

**Spike** *(méthode agile)*
> *Sprint court (0.5 à 1 j) dédié à valider une hypothèse technique ou produit avant d'engager les ressources complètes.*
> **Notre cas** : SPIKE-VALIDATION-ADD-AI à J+1 — mesure GO/NO-GO de la méthode.

**Sprint**
> *Bloc de travail concentré de 0.5 à 2 j-binôme avec un objectif clair et mesurable.*
> **Convention aiCEO** : numérotation S6.x, S7.x, etc.

**SQL / SQLite**
> **SQL** = langage standard d'interrogation des bases de données.
> **SQLite** = moteur de base de données embarqué (pas de serveur séparé), parfait pour app locale.
> **Notre cas** : aiCEO utilise SQLite mono-fichier avec 21 tables.

**SSE** (Server-Sent Events)
> *Technique web qui permet au serveur de pousser des données au navigateur en continu (vs requête/réponse classique).*
> **Notre cas** : streaming des réponses Claude (chat assistant) chunk par chunk pour effet "machine à écrire".

**Subagent**
> *Instance spécialisée de Claude avec son propre system prompt et ses tools restreints.*
> **Notre cas** : 4 minimum (architect, dev-fullstack, designer, qa-engineer) en mode Lean.

---

## T

**Time-to-first-value** / **Time-to-first-decision**
> *Temps entre le moment où l'utilisateur ouvre le produit pour la première fois et le moment où il en tire une vraie valeur (1ère décision tranchée).*
> **Cible aiCEO V1** : < 5 min.

**Tool calling**
> *Capacité d'un LLM à appeler des fonctions externes (créer une décision, épingler une note) au lieu de juste générer du texte.*
> **Notre cas** : tool `pin_to_knowledge` câblé en S6.8.1.

**Twisty**
> *Nom du Design System aiCEO. Inspiration : noeud / fil conducteur du parcours CEO.*

---

## U

**UX / UI** (User Experience / User Interface)
> **UX** = expérience d'utilisation (parcours, friction, valeur perçue).
> **UI** = interface visuelle (couleurs, boutons, layouts).
> **UX/UI** = les deux ensemble, ce qui rend un produit agréable.

---

## V

**Vélocité**
> *Vitesse à laquelle on livre. Mesurable en commits/jour, sprints/mois, features/sprint.*
> **Cible ADD-AI** : ×1.2 minimum vs méthode classique.

---

## W

**WCAG 2.1 AA** (Web Content Accessibility Guidelines)
> *Standard d'accessibilité web (lecteurs d'écran, navigation clavier, contrastes).*
> **Notre cas** : audit obligatoire avant V1.

---

## Y

**Y-combinator startup school**
> *Méthode de cadrage produit utilisée chez Y-Combinator (incubateur référence). Inspirations puisées : MVP, lean, jobs-to-be-done, ICP.*

---

## Acronymes & jargon ad hoc — table express

| Sigle | Signification |
|---|---|
| ADR | Architecture Decision Record |
| ADD-AI | AI-Driven Development |
| API | Application Programming Interface |
| CEO | Chief Executive Officer (PDG) |
| CSS | feuilles de style web |
| CTO | Chief Technology Officer |
| DS | Design System |
| FTS5 | Full-Text Search (SQLite) |
| HTML | langage des pages web |
| ICP | Ideal Customer Profile |
| JS | JavaScript |
| KPI | Key Performance Indicator |
| LLM | Large Language Model |
| MCP | Model Context Protocol |
| MVP | Minimum Viable Product |
| NPS | Net Promoter Score |
| PMO | Project Management Office |
| POC | Proof of Concept |
| PRD | Product Requirements Document |
| PWA | Progressive Web App |
| RGPD | Règlement Général Protection Données |
| ROI | Return On Investment |
| SaaS | Software as a Service |
| SDK | Software Development Kit |
| SOC 2 | Service Organization Controls 2 |
| SQL | Structured Query Language |
| SSE | Server-Sent Events |
| TOC | Table Of Contents |
| TTFD | Time-To-First-Decision |
| TTI | Time-To-Interactive |
| UI | User Interface |
| UX | User Experience |
| WCAG | Web Content Accessibility Guidelines |

---

## Convention de mise à jour

Ce glossaire est **vivant**. Chaque sprint qui introduit un nouvel acronyme ou jargon ajoute une entrée ici.
Convention : mettre à jour `last_review` dans le frontmatter.

last_review: 2026-04-28
