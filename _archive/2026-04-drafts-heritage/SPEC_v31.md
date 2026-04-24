# aiCEO v3.1 — Spec dev : incitation naturelle, offline-first

> **ARCHIVÉ 2026-04-24** — ce document décrit la spec dev de l'itération v3.1 (service worker, moteur NBA ambient+reactive, localStorage-only). Superseded par `04_docs/SPEC-TECHNIQUE-FUSION.md` (fusion v0.5, backend Node + `better-sqlite3`, intégration Outlook via COM puis Graph). Voir `README.md` de ce dossier pour le contexte d'archivage. Ne pas réutiliser comme source de vérité.

---

**Destinataire** équipe dev aiCEO
**Auteur** design system + product
**Statut** prête pour implémentation
**Cible** v3.1 sans régression v3 (23 avril 2026)
**Contrainte transverse** 100% localStorage, 100% offline (aucune dépendance réseau)

---

## 1. Pourquoi v3.1 ?

La v3 livre les écrans et les rituels, mais le CEO doit encore *aller chercher* l'action suivante. L'objectif v3.1 : **faire venir l'action au CEO plutôt que l'inverse**, sans jamais interrompre, sans culpabiliser, et sans dépendre du réseau.

### Trois régimes d'incitation à implémenter

1. **Ambient** — signaux périphériques permanents (pulse léger, compteurs, couleurs). Toujours visibles, jamais bruyants.
2. **Scripted** — rituels déclenchés à heure fixe (matin, 17h, dimanche soir).
3. **Reactive** — l'app perçoit un pattern (charge, retard, propo dormante) et propose pile le geste suivant.

La v3 a couvert "scripted" (end-of-day drawer). Il manque ambient + reactive.

---

## 2. Modules à livrer

| Fichier | Rôle | Nouveau / patch |
|---|---|---|
| `assets/app-nba.js` | Moteur NBA + ambient + rituals + shortcut reveal | **nouveau** (autonome) |
| `assets/sw.js` | Service worker offline-first | **nouveau** |
| `assets/app.js` | Register SW + appel `A.initAmbient()` dans mount | **patch minimal** |
| `assets/app.css` | Styles `.nudge-pulse`, `.hint-dot`, `.nba-card`, `.dim` | **patch** |
| Toutes pages HTML | Ajouter `<script src="assets/app-nba.js"></script>` après `app.js` | **patch** |
| `manifest.webmanifest` | PWA + icône | **nouveau** (optionnel) |

**Principe de livraison** : tout ajout est **additif** (aucune signature d'API modifiée). Si `app-nba.js` n'est pas chargé, l'app v3 marche exactement comme avant.

---

## 3. Storage — extension du schéma

Le store reste `localStorage.aiCEO.store.v1`. On ajoute une clé `journey` sans toucher au reste.

```js
store.v1 = {
  // === v3 (inchangé) ===
  view: { activeGroup: "all" },
  tasks: { added: [], edited: {}, deleted: [], state: {} },
  decisions: { added: [], edited: {} },
  proposals: { status: {} },
  streak: { current: 4, lastDate: "2026-04-23" },
  badges: { ... },

  // === v3.1 (nouveau) ===
  journey: {
    rituals: {
      matin:   { lastDate: "2026-04-23", triggered: true  },
      cloture: { lastDate: "2026-04-22", triggered: true  },
      revue:   { lastWeek: "2026-W16",  triggered: true  }
    },
    pageVisits: { dashboard: 42, taches: 28, assistant: 15 },
    shortcutsUsed: { "cmd-k": true, "n": false, "slash": true },
    hintsShown: { "shortcut-n": 1 },
    nbaHistory: [ { ts: "2026-04-23T08:05", itemId: "T-121", accepted: true } ],
    lastSeen: "2026-04-23T08:05"
  }
}
```

**Migration** : aucun code — `A.getStorePath("journey.rituals.matin.triggered", false)` crée implicitement la structure.

---

## 4. Offline-first : stratégie

Le CEO doit pouvoir **ouvrir l'app dans l'avion**, consulter, ajouter des tâches, accepter des propositions. Aucune dégradation.

### Couche 1 : données (déjà 100% offline en v3)
Toutes les écritures passent par `A._saveStore()` → localStorage. **Rien à changer.**

### Couche 2 : assets (nouveau en v3.1)
Service worker `sw.js` qui pré-cache au `install` :
- Toutes les pages HTML racine (`index.html`, `taches.html`, …)
- Tous les assets (`assets/app.css`, `assets/app.js`, `assets/app-nba.js`, `assets/data.js`, `assets/project-page.js`)
- Les pages projet (`projets/*.html`)
- Les revues (`revues/index.html`, `revues/*.html`)
- Les journeys (`journeys/*.html`, `journeys/journey.css`)

**Stratégie de fetch** :
- HTML → **stale-while-revalidate** (lecture instantanée depuis cache, revalidation en arrière-plan).
- CSS/JS → **cache-first** (ne change que sur nouveau déploiement).
- `data.js` → **cache-first** (seed data, versionné par hash).
- Toute requête externe → **network only** (pas de mise en cache sensible).

### Couche 3 : "queue offline" (hors v3.1)
Pas encore nécessaire — tant que Outlook n'est pas branché, il n'y a rien à synchroniser. Prévu pour v3.2.

### Dégradation gracieuse
Si `navigator.serviceWorker` absent (browser très vieux, file://) → on ne registre rien, l'app marche normalement tant que l'onglet est ouvert. Zéro message d'erreur visible pour le CEO.

### Pré-requis de déploiement
Le SW nécessite un serveur HTTP(S). En dev local : `python -m http.server 8080` ou `npx serve`. Sur file:// le SW ne registre pas mais localStorage continue de marcher.

---

## 5. Moteur `A.nba(ctx)` — Next Best Action

### Intention
À tout moment, une et une seule question à se poser : *« qu'est-ce que le CEO devrait faire, là, maintenant ? »*. Le moteur renvoie un candidat unique.

### Signature
```js
/**
 * @param {Object} ctx — contexte optionnel. Si vide, lu depuis l'env.
 * @param {string} ctx.page — page courante
 * @param {Date}   ctx.now — date courante
 * @param {'deep'|'medium'|'light'} ctx.energy — énergie déclarée ou dérivée
 * @returns {Object|null} item ou null si rien à proposer
 *   { kind, id, title, reason, estimatedMin, url, action? }
 */
A.nba = function(ctx) { ... }
```

### Ordre de priorité (scoring)

Le scoring somme plusieurs règles. Le candidat avec le **plus haut score** l'emporte.

| Candidat | +points si |
|---|---|
| Tâche Focus Now du jour, non-faite | `+100` |
| Event prep_needed dans ≤ 2h, sans tâche associée | `+90` |
| Proposition IA urgence `now` | `+85` |
| Tâche critique due aujourd'hui, non-faite | `+75` |
| Proposition IA urgence `today` | `+60` |
| Décision dormante > 7 jours | `+50` (sauf si `page==="decisions"`) |
| Tâche en retard (due < today) | `+40` |
| Tâche correspondant à l'énergie courante | `+15` |
| Tâche correspondant au contexte horaire (`deep-work` avant 11h, `email` après 16h) | `+10` |
| Tâche déjà proposée et ignorée il y a < 2h | `−25` |
| Tâche `type:"drop"` | `−999` |

### Énergie dérivée par défaut
- 07:00 → 10:30 : `deep`
- 10:30 → 14:00 : `medium`
- 14:00 → 17:00 : `medium`
- 17:00 → 20:00 : `light`

L'utilisateur peut écraser : `A.setEnergy('medium')` → stocké 2h dans `store.journey.energyOverride`.

### Rendu recommandé : `A.renderNba(ctx)`
Retourne un bloc HTML calibré pour être glissé dans :
- Le cockpit (zone sous Focus Now)
- Le footer de chaque drawer (« enchaîner avec … »)
- La fin de la page Copilote (« suggestion suivante »)

Utilise la classe `.nba-card` définie dans `app.css`.

### Historique
Chaque proposition NBA s'enregistre dans `store.journey.nbaHistory[]` avec `{ts, itemId, accepted}`. Permet d'éviter de reproposer trop vite et de mesurer le taux d'acceptation.

---

## 6. `A.ambient()` — pulses sidebar

### Intention
La sidebar devient une **carte périphérique** : un point orange pulse discrètement sur les rubriques où un sujet attend.

### Déclenchement
- À `mount()` → scan une fois, décore les `nav-item`.
- Toutes les 90 secondes tant que l'onglet est actif (`setInterval` annulable).
- Sur chaque `A.onTaskChange` + `A.onProposalChange` → scan ponctuel.

### Règles

| Nav item | Pulse si |
|---|---|
| `dashboard` | Focus Now du jour non-commencé ET il est après 08:00 |
| `tasks` | ≥ 1 tâche en retard OU ≥ 3 critiques pour aujourd'hui |
| `agenda` | ≥ 1 event `prep_needed` dans ≤ 4h sans tâche liée |
| `decisions` | ≥ 1 décision `to-execute` de plus de 7 j |
| `reviews` | Dimanche après 18:00 ET revue de la semaine courante non signée |
| `assistant` | ≥ 1 proposition urgence `now` OU ≥ 5 propositions `pending` |

### Rendu visuel
- Un point Ø 6px `--hint-amber` (`#e8a23d`) collé au label, animation `nudge-pulse` (2.4s, opacity 1 → 0.45 → 1).
- Aucun chiffre rouge, aucun badge criard.
- Respecte `prefers-reduced-motion` : pas d'animation, le point reste fixe.

### A11y
- `aria-label` du `.nav-item` se complète : `"Tâches, 2 en retard"`.
- Contraste du point ≥ 3:1 sur fond sidebar (vérifié).

---

## 7. `A.ritualTrigger(name)` — ancres temporelles

Un dispatcher unique pour les 3 rituels déclenchés automatiquement.

### Ancres

| Rituel | Fenêtre | Page attendue | Effet |
|---|---|---|---|
| `matin` | 07:30 → 09:30 | `dashboard` | Anime l'apparition du Focus Now (scale-in 300ms), dim les autres widgets à 0.6 pendant 2s |
| `cloture` | ≥ 17:00 | toute page | Ouvre `A.openEndOfDay()` via `A.openDrawer` (existe en v3) |
| `revue` | dimanche 19:00 → 21:00 | `dashboard` ou `reviews` | Affiche un coach-strip *« Revue S{N+1} prête, 20 min »* cliquable |

Chaque rituel n'est déclenché qu'**une fois par date cible**. La clé est conservée dans `store.journey.rituals.<name>`.

### API
```js
A.ritualTrigger("matin");  // idempotent : vérifie la date, agit ou pas
A.ritualCheckAll();        // appelé dans A.mount(), teste les 3 en silence
```

### Comportement "déjà raté"
Si le CEO entre à 14h sur le dashboard et n'a pas eu son rituel matin → on **ne le rejoue pas** (trop tard). Une micro-note discrète apparaît dans la coach-strip : *« Matinée décalée — on se cadre maintenant ? »*.

---

## 8. `A.revealShortcut(key)` — pédagogie progressive

### Règle
Après N visites sur une page, si le CEO n'a **jamais** utilisé un raccourci applicable → on le lui souffle une seule fois via toast silencieux (pas de son, 4s).

| Raccourci | Visites seuil | Message |
|---|---|---|
| `⌘K` | 3 visites sans usage | *« ⌘K ouvre la recherche rapide, partout. »* |
| `N` | 3 visites sur taches/dashboard sans usage | *« Appuyez sur N pour créer une tâche. »* |
| `Esc` | 2 ouvertures de drawer | *« Esc ferme le tiroir. »* |

### Implémentation
- Sur chaque mount → `store.journey.pageVisits[page]++`
- Sur chaque usage de raccourci → `store.journey.shortcutsUsed[key] = true`
- Fonction `A.maybeRevealShortcuts(page)` appelée dans `initAmbient` — ne propose jamais plus d'un conseil par session.

### Règle d'or
**Un conseil, une fois.** `store.journey.hintsShown[key]` track l'affichage. Si le CEO a vu le conseil mais ne l'utilise pas, on ne le redit pas avant 14 jours.

---

## 9. CSS — additions

Ajouter à la fin de `assets/app.css` :

```css
/* ============ v3.1 — Ambient & Incitation ============ */

:root {
  --hint-amber: #e8a23d;
  --hint-amber-bg: rgba(232,162,61,.18);
  --nba-accent: var(--rose);
}

@keyframes nudge-pulse {
  0%, 100% { opacity: 1;    transform: scale(1); }
  50%      { opacity: .45;  transform: scale(.85); }
}

/* Pulse dot posé à côté d'un nav-item */
.nav-item { position: relative; }
.nav-item .hint-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--hint-amber);
  margin-left: 6px;
  vertical-align: middle;
  animation: nudge-pulse 2.4s ease-in-out infinite;
  flex-shrink: 0;
}
@media (prefers-reduced-motion: reduce) {
  .nav-item .hint-dot { animation: none; }
}

/* Carte NBA inline */
.nba-card {
  display: flex; gap: 12px; align-items: center;
  background: #fdf7ed;
  border: 1px solid #f0d7a5;
  border-radius: 14px;
  padding: 12px 14px;
  margin-top: 12px;
}
.nba-card-icon {
  width: 32px; height: 32px; border-radius: 10px;
  background: var(--nba-accent); color: #fff;
  display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
}
.nba-card-body { flex: 1; min-width: 0; }
.nba-card-eyebrow { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.nba-card-title { font-weight: 600; font-size: 13px; line-height: 1.3; margin-top: 2px; }
.nba-card-reason { font-size: 11px; color: var(--muted); margin-top: 2px; }
.nba-card-cta { padding: 6px 14px; border-radius: 999px; background: #1a1b1f; color: #fff; font-size: 12px; border: 0; cursor: pointer; white-space: nowrap; }
.nba-card-cta:hover { background: #000; }

/* Utilitaire : atténuer un groupe pendant un rituel */
.dim { opacity: .55; transition: opacity .4s; }
.dim--in { animation: dimIn .35s both; }
@keyframes dimIn { from {opacity:1} to {opacity:.55} }

/* Focus Now : apparition accentuée au rituel matin */
.focus-now--ritual-entry { animation: focusRitual .6s cubic-bezier(.2,.8,.2,1) both; }
@keyframes focusRitual {
  from { opacity: 0; transform: scale(.96) translateY(6px); }
  to   { opacity: 1; transform: none; }
}

/* Toast silent (révélation de raccourci) */
.toast.silent {
  background: rgba(26,27,31,.92);
  color: #f5f3ef;
  border: 1px solid rgba(255,255,255,.08);
}
.toast.silent kbd {
  background: rgba(255,255,255,.12); color: #fff;
  padding: 1px 6px; border-radius: 6px; margin: 0 2px; font-size: 11px;
}
```

Aucune règle existante n'est modifiée.

---

## 10. API — checklist complète après v3.1

### Nouvelles méthodes (sur `window.AICEO`)
- `A.nba(ctx?)` → item | null
- `A.renderNba(ctx?)` → string HTML (ou "")
- `A.ambient()` → void (scan + décore)
- `A.initAmbient()` → void (hook mount)
- `A.ritualTrigger(name)` → boolean (a déclenché ou pas)
- `A.ritualCheckAll()` → void
- `A.revealShortcut(key)` → boolean
- `A.maybeRevealShortcuts(page)` → void
- `A.registerServiceWorker()` → Promise&lt;void&gt;
- `A.setEnergy(level)` → void
- `A.getEnergy()` → `'deep'|'medium'|'light'`

### Nouvelles clés store
- `journey.rituals.*`
- `journey.pageVisits`
- `journey.shortcutsUsed`
- `journey.hintsShown`
- `journey.nbaHistory`
- `journey.energyOverride`
- `journey.lastSeen`

---

## 11. Acceptance criteria

Chaque feature doit passer ces tests manuels :

### NBA
- [ ] À 08:00 sur cockpit, NBA propose une tâche Focus du jour.
- [ ] À 16:30, NBA préfère `context:email` et `energy:light`.
- [ ] Accepter une proposition NBA marque la tâche comme `in-progress` et enregistre dans `nbaHistory`.
- [ ] Ignorer une proposition NBA (bouton « plus tard ») : ne réapparaît pas avant 2h.

### Ambient
- [ ] Quand une décision est dormante > 7j, le menu Décisions porte un point qui pulse.
- [ ] Quand j'exécute la décision, le point disparaît dans les 90s suivantes.
- [ ] Avec `prefers-reduced-motion`, le point existe mais ne pulse pas.

### Rituals
- [ ] Première visite du jour sur cockpit entre 7h30 et 9h30 → Focus Now scale-in.
- [ ] Deuxième visite le même jour → pas de rejeu.
- [ ] 17h15, toute page → drawer de clôture s'ouvre.
- [ ] Dimanche 19h30 sur cockpit → coach-strip « Revue prête ».

### Shortcut reveal
- [ ] Après 3 ouvertures du cockpit sans ⌘K → toast silent au 4e mount.
- [ ] Après le toast, si le CEO utilise ⌘K dans la foulée → jamais reproposé.
- [ ] Si ignore pendant 14 jours → rejeu possible.

### Offline
- [ ] Load app online, puis couper réseau, recharger → l'app fonctionne.
- [ ] Ajouter une tâche offline → persiste après refresh.
- [ ] DevTools > Application > Cache Storage affiche `aiCEO-v3.1-*`.
- [ ] Sur file:// (double-clic HTML), pas d'erreur console, app fonctionne sans SW.

---

## 12. Plan de delivery (ordre recommandé)

1. **PR #1 — `app-nba.js` + patch CSS** (aucun risque, module désactivable par simple retrait du script tag).
2. **PR #2 — hook `A.initAmbient()` dans `A.mount`** (1 ligne dans app.js).
3. **PR #3 — pages HTML** : ajouter le script tag (mécanique, 12 fichiers).
4. **PR #4 — `sw.js` + registration** (à tester sur http, désactive sur file://).
5. **PR #5 — manifest.webmanifest + icône** (PWA, optionnel).

Chaque PR est indépendamment mergeable et réversible.

---

## 13. Métriques de succès

Mesurables depuis `store.journey` après 2 semaines d'usage :

| Métrique | Cible v3.1 | Calcul |
|---|---|---|
| **Time-to-first-action** (login → premier geste utile) | < 90s | `firstUsefulActionTs - sessionStartTs` |
| **Taux rituels tenus** (matin/cloture/revue) | ≥ 70% | `triggered / eligible` sur 7 jours |
| **NBA acceptance** | ≥ 40% | `nbaHistory.filter(accepted) / nbaHistory.length` |
| **Pages visitées sans clic sidebar** | ≥ 30% | suivi via `lastVisitTrigger: "ambient"\|"click"\|"url"` |
| **Shortcuts adoptés** après reveal | ≥ 50% | `shortcutsUsed / hintsShown` |
| **Offline success** | 100% | refresh hors ligne → pas d'erreur |

Un écran dev `debug.html` expose ces compteurs sur `store.journey` — pas exposé au CEO.

---

## 14. Hors scope v3.1

Pour éviter la dérive, **explicitement repoussé** en v3.2 ou plus :

- Synchronisation Outlook / cloud — queue offline vraie.
- Dark mode.
- Notifications push (Web Push API).
- Génération vocale → tâche.
- Onboarding conversationnel du premier lancement.
- A/B testing des formulations NBA.

---

## 15. Tonalité & anti-patterns

**Règles de rédaction** (copy des NBA, des conseils, des coach-strips) :
- Phrase courte, une idée par phrase.
- Jamais d'impératif agressif. Préférer *« on peut »*, *« si vous voulez »*.
- Jamais de « vous avez oublié », « vous devez », « attention ».
- Pas d'emoji dans les CTA (boutons purs). Ok dans les eyebrows.
- Pas plus de 14 mots par nudge.

**À proscrire côté UI**:
- Modales bloquantes.
- Badges rouges saturés (ambre uniquement pour les hints).
- Notifications push/sonores.
- « Points » ou niveaux style jeu.
- Onboarding linéaire forcé.

---

**Fin de spec.** Questions/ajustements → ping product + design avant de coder.
