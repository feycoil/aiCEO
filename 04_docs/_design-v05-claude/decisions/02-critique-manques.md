# Critique sans concession — manques du prompt actuel

> Date : 26/04/2026
> Posture : auto-critique d'une revue design lead. L'objectif est une maquette parfaite, pas correcte.
> Méthode : passage en revue de chaque section du prompt + projection sur les 22 vues attendues.

## Verdict global

Le prompt actuel produira une maquette **7,5/10**. Les manques identifiés visent à passer à **9,5/10**.

Il n'a aucun défaut bloquant — Claude Design saura quoi faire. Mais sur 22 vues, sans verrouillage de certains points, on aura des incohérences qui se révéleront au moment de l'intégration dev. Mieux vaut les anticiper maintenant.

---

## CRITIQUE 1 — Système de composants UI sous-spécifié (BLOQUANT)

### Le manque
Le prompt liste 10 composants Twisty à reprendre, mais **n'en spécifie aucun de façon prête-à-l'emploi**. Conséquence : sur 22 vues, Claude Design va réinventer chaque composant à chaque page → divergence visuelle garantie.

Composants critiques absents de la spec :

| Composant | Présent en | Spec actuelle |
|---|---|---|
| **Buttons** (primary/secondary/ghost/danger × sizes sm/md/lg) | Toutes pages | ❌ aucune |
| **Form inputs** (text/textarea/select/date/number) | evening, taches, decisions, contacts | ❌ aucune |
| **Modals** (small/medium/large + variants confirm/dismiss) | taches édition, decisions reco | ❌ "à éviter sauf destruction" mais pas de design fourni |
| **Toasts** (success/error/info) | Toutes pages | ❌ "subtil top-right 2s" sans plus |
| **Tooltips** | drawer collapse, kbd shortcuts, chevrons | ❌ aucune |
| **Dropdowns / Selects** | filtres, week-selector | ❌ aucune (alors que Twisty montre "Week ▾") |
| **Switches / Toggles** | settings, vue toggle list/kanban | ❌ aucune |
| **Progress bars** (linear + circular) | Big Rocks, projets, streak ring | ❌ mentionnés mais pas designés |
| **Tags/Chips** (filled/outline × neutral/society/status × sizes) | Toutes pages | ⚠ partiel |
| **Avatars** (sizes 16/24/32/48 + initiales fallback color logic) | drawer, contacts, projets | ⚠ partiel |
| **Skeletons** (line/circle/card + animation pulse vs shimmer) | Tous loading states | ❌ aucune |

### L'impact
Sur la page taches.html, Claude va designer un bouton "+". Sur la page decisions.html, il va en designer un autre légèrement différent. Sur arbitrage.html, encore un autre. Multiplie ça par 10 composants × 13 pages = chaos visuel d'intégration.

### Ce qu'il faut ajouter
Un **catalogue de composants** en pièce jointe : `06-composants-catalogue.md` qui définit chaque composant en variant + tailles + états (default/hover/focus/disabled/loading), avec le HTML/CSS d'exemple. ~600-800 lignes mais salvifique.

Alternative budget court : ajouter une section §X dans le prompt avec les 10 composants critiques en table.

---

## CRITIQUE 2 — Iconographie zéro spec (BLOQUANT)

### Le manque
Le prompt cite "icone home", "icone sun", "icone moon"… pour le drawer (12 icônes) mais :
- ❌ Aucune lib mentionnée (Lucide ? Heroicons ? Phosphor ?)
- ❌ Aucune épaisseur/stroke-width imposée
- ❌ Aucune taille uniforme définie
- ❌ Pas de spec sur les icônes contextuelles dans le contenu (status alertes, actions cards, chevrons, etc.)
- ❌ Pas de spec sur les illustrations empty-state (line-art ? coloré ? aucune ?)

### L'impact
Claude Design va probablement utiliser Heroicons (par défaut), mais des fois Lucide, des fois inventé. Stroke-width 1.5 vs 2 vs filled. Taille 16 vs 18 vs 20 vs 24. Visuellement ça se voit immédiatement.

### Ce qu'il faut ajouter
Section §X dans le prompt :
```
ICONES :
- Bibliotheque OBLIGATOIRE : Lucide (lucide.dev), via CDN <script>
- Stroke-width: 1.5 partout
- Tailles standard : 14px (inline texte), 18px (boutons), 20px (drawer), 24px (illustrations)
- Couleur : currentColor (heritee du parent)
- Icones drawer + 30 icones systeme nominees (liste complete)
- Empty states : illustration line-art Lucide (lib uniquement, pas d'illu personnalisee)
```

---

## CRITIQUE 3 — Typographie hiérarchie incomplete (FORT)

### Le manque
Échelle donnée en px (12→64) mais :
- ❌ Aucun line-height par taille
- ❌ Aucun letter-spacing
- ❌ Aucune règle "quand utiliser Aubrielle vs Sol vs Fira"
- ❌ Mélange weights 100→900 sans guide d'usage
- ❌ Pas de spec sur les casings (UPPERCASE pour eyebrows ? Title case ?)

### L'impact
Le rendu va être correct mais inégal. Les chiffres dans Big Rocks vs Compteurs vs Streak vont être typographiés de façon hétérogène (parfois Sol, parfois Fira black, parfois Fira regular).

### Ce qu'il faut ajouter
Table type-system élargie :
```
TYPE SYSTEM :
- script-hero  64px Aubrielle 400  line-height 1.0  | salutations cockpit, hero soir
- script       44px Aubrielle 400  line-height 1.1  | titres rituel
- stat-hero    64px Sol 100        line-height 1.0  | streaks, KPIs ouverts
- display      32px Fira 600       line-height 1.15 | titres pages
- h1           22px Fira 600       line-height 1.3  | titres cartes
- h2           18px Fira 500       line-height 1.4  | sous-titres
- h3           15px Fira 500       line-height 1.45 | labels colonnes
- body         14px Fira 400       line-height 1.5  | texte courant
- caption      13px Fira 450       line-height 1.4  | meta cartes
- xs           12px Fira 500       line-height 1.3  | badges, chips
- mono         13px ui-monospace 400 line-height 1.4 | IDs, code

USAGE :
- Aubrielle : SEUL pour salutations + hero rituels (≥36px). Jamais inline.
- Sol : SEUL pour chiffres ouverts ≥28px (streaks, KPIs hero, compteurs grands).
- Fira : tout le reste.

CASINGS :
- Eyebrows : UPPERCASE 11px letter-spacing 0.06em (rare, sections eyebrow only)
- Titres : Title Case
- Body : casse normale
- Buttons : casse normale (pas UPPERCASE)
```

---

## CRITIQUE 4 — Spacing system absent (FORT)

### Le manque
Le prompt dit "padding 32px, gouttière 24px" pour les conteneurs mais aucun **système d'échelle**. Conséquence : les espaces internes des cartes vont être 12 ici, 14 là, 16 ailleurs.

### L'impact
La densité visuelle va être inégale entre pages. Les rythmes verticaux ne s'aligneront pas (baseline grid impossible).

### Ce qu'il faut ajouter
```
SPACING SCALE (en px) :
- 0  → 0
- 1  → 4
- 2  → 8
- 3  → 12
- 4  → 16    ← spacing inter-elements dans une carte
- 5  → 20
- 6  → 24    ← gouttiere entre cartes
- 8  → 32    ← padding interne carte
- 10 → 40
- 12 → 48
- 16 → 64    ← marges sections

REGLES :
- Padding carte principale : 32px
- Padding carte secondaire : 24px
- Gap inter-cards : 24px
- Gap label + valeur : 8px
- Gap title + subtitle : 4px
- Inset cluster (icone+texte) : 12px
- Padding boutons : 12px 20px (md)
```

---

## CRITIQUE 5 — Drag & drop spec manquante (FORT)

### Le manque
Arbitrage et Eisenhower utilisent du drag & drop "natif HTML5" mais aucune spec sur :
- Apparence du **ghost** (translucide ? rotated ? avec ombre ?)
- **Drop indicator** (line ? glow ? highlight ?)
- **Snap behavior** (auto-arrange ? insertion exacte ?)
- **Animation** sur dépôt (smooth slide ? snap ?)
- **Multi-select drag** (possible ? désactivé ?)
- **Comportement clavier** (alternative drag pour accessibility)

### L'impact
Le rendu Claude va probablement faire un drag basique avec un drop sur n'importe quelle cible, sans feedback visuel. Sur arbitrage qui est LE flux clé de 5 minutes/jour, c'est critique.

### Ce qu'il faut ajouter
Section dédiée drag & drop pattern dans le prompt avec specs visuelles précises (~30 lignes).

---

## CRITIQUE 6 — Référence visuelle unique = couverture insuffisante (FORT)

### Le manque
La référence Twisty couvre :
- Dashboard avec charts ✅
- List cards ✅
- Connection cards (avatars) ✅
- Promo card ✅
- Tabs nav horizontale ✅

Elle ne couvre PAS :
- ❌ Calendrier hebdomadaire (agenda.html)
- ❌ Chat streaming (assistant.html)
- ❌ Drawer vertical collapsible (présent partout)
- ❌ Kanban board (projets.html)
- ❌ Matrice 2x2 Eisenhower (taches.html)
- ❌ Page profile/détail à onglets (projet.html)
- ❌ Modale d'édition (edit task)

### L'impact
Pour ces 7 patterns absents de la réf, Claude Design va inventer ou s'inspirer d'autres sources mentales (probablement Linear pour le kanban, claude.ai pour le chat, Notion pour les onglets). Risque de divergence stylistique.

### Ce qu'il faut ajouter
**Soit** des références additionnelles en pièce jointe (capture Cron pour agenda, capture claude.ai pour chat, capture Linear pour kanban).
**Soit** des descriptions très précises de ces patterns dans le prompt.

Recommandation : 2-3 captures supplémentaires + descriptions textuelles précises pour les 4 patterns clés (calendrier, chat, drawer collapse, matrice 2x2).

---

## CRITIQUE 7 — Données réalistes incomplètes (FORT)

### Le manque
Le persona donne :
- 4 sociétés ✅
- 7 projets sur ~10 mentionnés ⚠
- 5 contacts sur ~15 mentionnés ⚠
- 8 tâches sur ~30 ⚠
- 3 décisions sur ~3 ✅
- 0 événement Outlook ❌
- 0 conversation assistant exemple ❌
- 0 Big Rocks nommés ❌
- 0 mail exemple pour la zone "Courriels du jour" arbitrage ❌

### L'impact
Pour les pages où le volume importe (agenda hebdo, taches en mode liste, contacts en grid, assistant sidebar), Claude va devoir inventer du Lorem qui pollue le rendu et obscurcit le vrai usage.

### Ce qu'il faut ajouter
Section "Datasets" élargie :
- 10 projets nommés avec sociétés + statuts + contacts
- 15 contacts avec rôles + dernier contact en jours
- 30 tâches d'arbitrage avec prio + ai_capable + due
- 10 RDV exemples par jour avec heures + sociétés
- 5 conversations assistant avec titles
- 3 Big Rocks de la semaine en cours
- 10 mails reçus exemples (sender + subject)

---

## CRITIQUE 8 — Charts / dataviz non couvertes (MOYEN)

### Le manque
Twisty montre 2 patterns chart. On va en avoir besoin de plus :
- Mini progress bars (Big Rocks) ⚠
- Calendar heatmap (streak du soir 30j) ❌
- Donut/ring (avancement projet, streak month) ❌
- Timeline (historique projet) ❌
- Mini sparkline (tendance compteurs) ❌

Bibliothèque : aucune mentionnée. Claude va probablement utiliser SVG inline ou Chart.js, sans cohérence.

### L'impact
Visuellement mineur si bien fait, mais cohérence cross-pages compromise si chaque chart adopte une lib différente.

### Ce qu'il faut ajouter
```
CHARTS :
- Implementation : SVG inline uniquement (pas de lib externe en maquette)
- Couleurs : tokens DS exclusivement (jamais Chart.js default)
- Patterns autorises :
  1. Vertical line + dot (style Twisty Income)
  2. Vertical bar minimal (style Proposal Progress)
  3. Linear progress bar (Big Rocks, projets)
  4. Circular ring (streaks month, completion)
  5. Calendar heatmap 7x4 (30j streak du soir)
  6. Sparkline (tendances compteurs cockpit)
- Animation : aucune sur charts statiques (pas de "growth on enter")
```

---

## CRITIQUE 9 — Accessibilité totalement absente (MOYEN)

### Le manque
Zéro mention de :
- WCAG AA contrast ratios (alors qu'on a des couleurs custom)
- ARIA roles / labels
- Keyboard handlers (raccourcis cités sans détail)
- Focus visible states
- Screen reader (même mono-user, garder bonne pratique)

### L'impact
Pour un outil mono-user on peut argumenter que c'est moins critique. Mais : Feycoil va vieillir avec son outil. Et certains contrastes du DS (text-3 #9a9da8 sur surface #f5f3ef = ratio 2.8:1 → FAIL WCAG AA) sont à risque.

### Ce qu'il faut ajouter
Section §X courte :
```
ACCESSIBILITY :
- Contrast minimum : WCAG AA (4.5:1 body, 3:1 large text). Verifier text-3
  sur surface : utiliser text-2 si echec.
- Focus visible : 2px outline brand offset 2px sur tout interactif
- Keyboard nav : tab order naturel, espace = activate, esc = close modal
- Aria-label sur tout bouton icon-only
- Tabindex 0 sur cards cliquables
```

---

## CRITIQUE 10 — Logo aiCEO + identité absent (MOYEN)

### Le manque
Le drawer mentionne "Logo aiCEO en haut" mais :
- Aucun fichier logo fourni
- Aucune description du logo
- Aucune tagline / signature
- Pas de favicon

### L'impact
Claude va inventer un logo. Probablement texte stylisé "aiCEO" ou un monogramme inventé. Ça va figurer sur les 13 pages et sera difficile à retirer ensuite.

### Ce qu'il faut décider et ajouter
Soit :
- a) **Tu fournis un logo** existant (SVG ou PNG)
- b) **Tu spécifies** ce que Claude doit produire ("monogramme 'A' brand navy sur surface, taille 32px collapse / 120px etendu")
- c) **Tu acceptes** que ce soit un placeholder à remplacer post-livraison

Recommandation : option B avec spec courte.

---

## CRITIQUE 11 — Index navigation sous-spécifiée (MOYEN)

### Le manque
On demande `index-nav.html` qui permet de naviguer entre les 13 maquettes, mais zéro spec sur sa nature :
- Sitemap visuel ?
- Grille de previews (thumbnails) ?
- Liste sectionnée par Tier ?
- Storybook-style ?

### L'impact
Risque de récupérer une page très moche qui sera l'écran d'accueil de la maquette. Mauvaise première impression.

### Ce qu'il faut ajouter
Spec courte (~20 lignes) : grille 3 colonnes de cards (1 par page), chaque card montre titre + sous-titre rôle + thumbnail iframe miniature + tabs default/critique. Header avec titre "aiCEO v0.5 — Maquette" + version + date.

---

## CRITIQUE 12 — Modals / overlays pas designés (MOYEN)

### Le manque
"Pas de modal sauf destruction" est cité mais on a :
- Édition de tâche (taches.html) — implicite modal ?
- Suppression confirmation (taches.html, decisions.html) — modal danger
- Recommandation Claude (decisions.html) — overlay ou bulle ?
- Détail event Outlook (agenda.html) — popover ?

### L'impact
Sans spec, Claude va designer des modals "Material Design default" qui jurent avec le reste.

### Ce qu'il faut ajouter
Pattern "Modal" avec 3 variants (compact 320px, medium 480px, large 720px), backdrop, animation slide-from-bottom 200ms ease-out, focus trap, escape to close.

---

## CRITIQUE 13 — Animations non spécifiées (MOYEN)

### Le manque
- Drawer collapse : "slide" mais aucune durée ni easing
- Modals : aucune anim
- Hover states : "elevation +1" mais comment ?
- Card transitions : zéro
- Streak celebration : "anneau anime + confetti" sans plus
- Skeleton : "pulse" implicite mais pas spec
- SSE chunks : "remplissage progressif" mais animation par mot ? par chunk ?

### L'impact
Animations vont être incohérentes entre pages. Certaines vont "flasher", d'autres seront trop slow.

### Ce qu'il faut ajouter
```
MOTION :
- Duration scale : 100ms (instant), 200ms (snappy), 300ms (smooth), 500ms (deliberate)
- Easing : cubic-bezier(0.4, 0, 0.2, 1) (ease-out par defaut)
- Reduce motion : respect prefers-reduced-motion (toutes anims < 100ms)
- Patterns standard :
  - Hover card : translateY(-1px) + shadow lift, 200ms
  - Modal in : scale(0.98) -> 1 + opacity 0 -> 1, 200ms
  - Drawer collapse : width transition, 250ms
  - Skeleton : opacity 0.4 -> 0.8 boucle 1.5s
  - SSE streaming : pas d'animation, juste append
  - Streak celebration : ring fill 600ms + confetti 1500ms
```

---

## CRITIQUE 14 — Search / Command palette manquante (MOYEN)

### Le manque
Twisty a une search bar dans le header. Le prompt la mentionne mais :
- ❌ Aucune spec sur ce qu'elle cherche (tâches ? contacts ? cross-modal ?)
- ❌ Aucune spec UX résultats (inline ? command palette overlay ?)
- ❌ Endpoint `/api/search?q` exposé mais pas relié à un design

### L'impact
La search bar va être décorative. Or sur 30 tâches + 15 contacts + 10 projets, c'est un usage critique.

### Ce qu'il faut ajouter
Pattern "Command palette" style cmd+k :
- Trigger : raccourci `/` ou `cmd+k` ou click search bar
- Overlay centré 640px width, modale style
- Input + résultats groupés (Tâches, Contacts, Projets, Décisions, RDV)
- Navigation flèches + enter pour sélection
- Footer : "Échap pour fermer / Entrée pour ouvrir"

---

## CRITIQUE 15 — Specs date/heure/nombre pour i18n (MOYEN)

### Le manque
Aucune spec sur :
- Format date (26/04/2026 vs 26 avril 2026 vs jeudi 26 avril)
- Format heure (14:30 vs 14h30)
- Format relatif ("il y a 2j" vs "depuis 2 jours" vs "2j ago")
- Format montant (15 000 € vs 15k€ vs 15.000€)
- Format pourcentage (65% vs 65 %)

### L'impact
Inconsistance cross-pages garantie.

### Ce qu'il faut ajouter
Mini-section :
```
FORMATS FR :
- Date courte : 26/04/2026
- Date longue : jeudi 26 avril 2026
- Heure : 14h30 (avec h, jamais ":")
- Relatif : "dans 2 j" / "il y a 3 j" / "aujourd'hui" / "hier" / "demain"
- Montant : "15 000 €" (espace insécable, € après)
- Montant compact : "15 k€"
- Pourcentage : "65 %" (espace insécable)
- Numerique tabulaire toujours en colonnes
```

---

## CRITIQUE 16 — Tier 3 (registres) sous-investi (MOYEN)

### Le manque
Le prompt traite Tier 3 (5 pages) avec 1 paragraphe par page, état critique = "default uniquement" pour groupes/projets/projet. C'est un sous-investissement.

### L'impact
Ces pages vont être génériques. Or projets et contacts sont des pages utilisées plusieurs fois par jour.

### Ce qu'il faut ajouter
- 1 état critique par page (pas "default only") :
  - groupes : `kpi-loading` (skeletons KPIs)
  - projets : `filter-active` (avec multi-select chips actifs)
  - projet : `tab-decisions-empty` (onglet vide)
- Augmenter la spec par page (×2 lignes minimum)
- Ajouter 1 micro-interaction par page

---

## CRITIQUE 17 — Brand voice ton vs UI sous-spécifié (FAIBLE)

### Le manque
Section ton OK pour les copies, mais :
- ❌ Aucune spec sur la **densité textuelle** acceptable (combien de mots max par card ?)
- ❌ Aucune spec sur la **personnalisation IA** (tu dis "bonjour Feycoil" en script, mais le ton du chat assistant peut-il dire "Sikina" ?)

### L'impact
Mineur. Risque de copies un peu inégales en longueur mais ne casse pas le rendu.

---

## CRITIQUE 18 — Dataset photos avatars non décidé (FAIBLE)

### Le manque
Persona dit "photo placeholder initiales rondes". Mais :
- Twisty montre des **vraies photos** (pas des initiales)
- Pour les 5 contacts ETIC réels, peut-on utiliser des photos générées (UI Faces, This Person Does Not Exist) ou s'en tenir aux initiales ?

### L'impact
Visuel : initiales = moins riche que Twisty. Photos générées = plus proche de la réf, mais éthiquement bizarre pour des humains réels.

### Ce qu'il faut décider et trancher
**Recommandation** : initiales rondes en couleur de société (Sikina rond sky, Bénédicte rond amber, etc.). Cohérent + consenti + propre.

---

## CRITIQUE 19 — Dirty state / auto-save ambigu (FAIBLE)

### Le manque
Boucle du soir : champs édités → "Bonne nuit" valide ? Auto-save ? Indicateur "non sauvegardé" ?
Note du jour : Save explicit ou auto ?
Édition tâche inline : same.

### L'impact
Mineur visuel mais important UX. Sans spec, Claude va inventer.

### Ce qu'il faut ajouter
Pattern "Save state" : auto-save 1s après dernier keystroke, indicateur "Enregistré" toast subtil bas-droite, jamais bouton "Save" explicite.

---

## CRITIQUE 20 — Source-link rendering pas spécifié (FAIBLE)

### Le manque
"Source-link tâche → mail Outlook" : comment c'est rendu visuellement ?
- Icône (mail/calendar/projet) ?
- Badge cliquable ?
- Texte cliquable ?
- Tooltip au hover ?

### L'impact
Pattern qui va revenir partout (cockpit alertes, arbitrage tâches, decisions). Doit être cohérent.

### Ce qu'il faut ajouter
Pattern "Source link" : icône Lucide 14px + label tronqué 24ch + chevron-right 12px, tout en chip cream surface-3 avec hover state.

---

## CRITIQUE 21 — Volume edge cases non testés (FAIBLE)

### Le manque
Que se passe-t-il avec 100 tâches au lieu de 30 ? L'Eisenhower 2x2 avec 50 tâches dans un cadran ?

### L'impact
La maquette va montrer le cas confortable. Le réel sera parfois pire.

### Ce qu'il faut ajouter (optionnel)
1-2 vues "edge case" : taches.html avec 80 tâches en liste (pour tester scroll + filtres), Eisenhower avec 30 tâches dans le cadran "À faire urgent".

---

## CRITIQUE 22 — Focus / hover / disabled states non spécifiés (FAIBLE)

### Le manque
On dit "hover card +1px elevation" mais :
- Pas de focus state (clavier)
- Pas de disabled state
- Pas de active state (pressed)
- Pas de selected state (multi-select)

### L'impact
Maquette static-only, mais ces states vont devoir être designés au moment du dev.

### Ce qu'il faut ajouter (optionnel)
Catalogue states pour 3 composants critiques (button, card, chip).

---

## CRITIQUE 23 — Dark mode déclaré hors scope mais... (FAIBLE)

### Le manque
"Pas de mode dark en v0.5" OK. Mais le DS doit-il le préparer ? `--surface-dark`, `prefers-color-scheme` partial ?

### L'impact
Aucun en v0.5. Friction technique en V2.

### Ce qu'il faut ajouter (optionnel)
Note dans le prompt : "Les variables CSS doivent être structurées pour autoriser un theme dark futur (V2). Ne pas hardcoder de couleurs hors tokens."

---

## CRITIQUE 24 — Stratégie "Tier interne" floue côté Claude (FAIBLE)

### Le manque
On dit à Claude "si tu plafonnes, livre Tier 1 puis attends confirmation". Mais comment Claude sait-il qu'il plafonne ? Le prompt actuel ne donne pas de critère mesurable.

### L'impact
Claude va probablement essayer les 22 vues d'un coup et dégrader sur les dernières.

### Ce qu'il faut ajouter
Critère explicite :
```
SI tu detectes que tu approches 90% du budget de generation,
TERMINE la vue en cours puis :
1. Lister ce qui reste a livrer
2. Demander explicitement "continue tier suivant ?"
3. NE PAS commencer une vue partielle
```

---

## Plan d'action priorisé

### Doivent être ajoutés au prompt (BLOQUANT)
1. Catalogue de composants UI (en pièce jointe nouvelle `06-composants-catalogue.md`)
2. Spec iconographie (Lucide, stroke 1.5, tailles)
3. Type system élargi (line-height, usage Aubrielle/Sol/Fira)
4. Spacing scale (4/8/12/16/24/32/48/64)
5. Drag & drop pattern complet

### Devraient être ajoutés (FORT)
6. Références visuelles supplémentaires (calendrier, chat, drawer collapse, kanban)
7. Datasets élargis (10 projets, 15 contacts, 30 tâches, 10 RDV, 5 conv, 3 Big Rocks, 10 mails)
8. Patterns charts (5 patterns autorisés en SVG)
9. Section accessibility (contrast, focus, ARIA)
10. Décision logo aiCEO (placeholder ou spec)
11. Spec index-nav.html
12. Pattern modal (3 variants)

### Améliorent significativement (MOYEN)
13. Motion system (durations, easings, patterns)
14. Pattern Command Palette
15. Formats FR (date/heure/montant)
16. Tier 3 augmenté (états critiques + spec étendue)
17. Pattern Source link

### Polish (FAIBLE)
18. Décision photos avatars
19. Pattern dirty state / auto-save
20. Edge case volumes
21. Focus/hover/disabled states catalogue
22. Note dark mode futur
23. Critère Tier auto-stop
24. Densité textuelle copies

---

## Ce qu'il faut décider maintenant

Trois leviers de calibrage :

**A. Effort intégration** :
- a1) Ajouter UNIQUEMENT les bloquants (1-5) → prompt passe de 16k à ~22k chars, ressources +1 fichier
- a2) Ajouter bloquants + forts (1-12) → prompt ~28k chars, ressources +2 fichiers
- a3) Tout intégrer (1-24) → prompt ~40k chars, ressources +3 fichiers, risque sur-spécification

**Recommandation : a2** — l'écart 7,5/10 → 9/10 vient surtout des forts. Au-delà on rentre dans des micro-détails que Claude Design gère acceptablement par défaut.

**B. Nombre de pièces jointes** :
- b1) Garder 6 pièces (ne fusionner aucun manque dans des fichiers séparés, tout mettre dans le prompt) → prompt 40k+
- b2) Ajouter 1-2 pièces (catalogue composants + datasets élargis) → prompt 22-28k
- b3) Tout en pièces jointes (datasets, composants, motion, charts) → prompt 18k mais 9-10 pièces

**Recommandation : b2** — Claude Design gère 8 pièces sans souci, au-delà il fouille moins.

**C. Stratégie de validation** :
- c1) Intégrer tout puis lancer → 1 round
- c2) Intégrer en 2 vagues : bloquants → générer Tier 1 → ajuster → ajouter le reste → générer Tier 2-3 → ajuster
- c3) MVP d'abord : intégrer les bloquants seulement, lancer Tier 1, voir le résultat, décider d'ajuster

**Recommandation : c3** — minimise le risque de sur-ingénierie. On verra en pratique ce qui manque vraiment vs ce que Claude Design gère par défaut.
