# Sprint S6.11-bis — Amélioration interface de pilotage

> **Origine** : mandat CEO 28/04 PM late : *"prevoit aussi un sprint pour ameliorer l'interface de pilotage de projet"*
> **Préalable** : S6.9-bis livré (Setup ADD-AI) + S6.10-bis livré (Atomic Templates)
> **Effort estimé (LEAN)** : 1 j-binôme — Cmd+K + lien sprint cliquable + bouton Régénérer
> **Effort plein (deferred)** : 1.5 j → reporté à post-V1 (S7.13+) si pertinent
> **Cible** : pilotage = vrai poste de pilotage temps réel, pas juste un index statique

---

## ⚡ Note LEAN ADD-AI (28/04 PM late)

**Décision CEO** : version allégée — fonctionnalités essentielles uniquement.

**Ajustements** :
- ✅ **Cmd+K palette globale** (recherche ADRs + docs + commits + sections)
- ✅ **Sprints cliquables** dans la roadmap (déjà partiellement fait)
- ✅ **Bouton "↻ Régénérer"** manuel (lance generate-pilotage.js via API)
- ✂️ Live activity WebSocket : reporté
- ✂️ Métriques produit live : reportées (pas avant Phase 2 quand instrumentées)
- ✂️ Décrochages auto : reportés
- ✂️ Coût LLM section : reporté
- ✂️ Export PDF puppeteer : reporté
- ✂️ Polling 60s : reporté

**Effort réduit** : 1.5 j → **1 j**.

**Rationale** : le pilotage v1 actuel suffit pour piloter Phase 1. Les features avancées (live, métriques, PDF) n'ont de sens qu'une fois le produit lui-même mature. Sinon on construit un cockpit pour piloter un cockpit.

**Cap** : le pilotage ne dépasse jamais **300 KB**. Toute fonctionnalité au-delà = sortir vers une page séparée.

---

## 1. Diagnostic de l'interface pilotage actuelle (v1.0, livrée S6.9-bis)

**Acquis** :
- 12 sections : Dashboard / Timeline / Roadmap / ADRs / Commits / Vélocité / Docs / Audits / Tree / GitHub / Méthode / Actions CEO
- 170 docs indexés, 32 ADRs, 92 commits, 10 tags
- Auto-régénération via hook git post-commit
- DS Twisty + responsive

**Lacunes identifiées** :
1. **Pas de temps réel** : régénéré à chaque commit, mais pas de live update
2. **Pas de drill-down sur les sprints** : on voit la roadmap mais pas le détail d'un sprint en cours
3. **Pas de métriques produit** (cf. PLAN-REALIGNEMENT §2 : 7 KPIs à instrumenter)
4. **Pas de "décrochages"** : aucune détection automatique des sprints qui dépassent leur budget
5. **Pas de coût LLM** : aucune visibilité sur les tokens consommés
6. **Pas de "où en est-on en ce moment"** : pas d'indicateur d'activité courante (sprint actif, dernière action Claude, prochain rituel)
7. **Pas d'export PDF** pour les ExCom
8. **Search globale absente** (Cmd+K à travers ADRs + docs + commits)
9. **Pas de favoris** : impossible d'épingler un doc pour accès rapide
10. **Pas de notifications** : nouveau commit / nouvelle ADR / nouveau sprint

---

## 2. Cible S6.11-bis

L'interface devient un vrai **cockpit de pilotage temps réel** :

### 2.1 Nouvelles sections

| Section | Contenu |
|---|---|
| 📡 **Live activity** | "En cours : Sprint S7.X · 2/13 tasks · 3h chrono restantes · 240k tokens consommés sur 800k budget" |
| 🎯 **Sprint en cours** | Drill-down d'un sprint actif : tasks, retex incrémental, blocages |
| 💰 **Coût LLM** | Tokens IN/OUT par sprint + $ Anthropic + ratio LLM/rule + sparkline 30j |
| 📊 **Métriques produit** | Les 7 KPIs définis dans PLAN-REALIGNEMENT §2 (time-to-first-value, arbitrage velocity, streak médian, etc.) |
| ⚠️ **Décrochages** | Sprints qui ont dépassé budget temps/tokens, ADRs proposées non actées > 7j |
| 🌟 **Favoris** | Docs épinglés par le CEO (localStorage) |

### 2.2 Améliorations sections existantes

| Section | Amélioration |
|---|---|
| Dashboard | Bandeau "ce qui se passe maintenant" en haut + KPIs produit |
| Timeline | Filtres (tags / ADRs / commits / décrochages) + zoom temporel |
| Roadmap | Lien vers DOSSIER-SPRINT-*.md de chaque sprint cliquable |
| ADRs | Tag "à valider" en évidence + liens vers les commits liés |
| Commits | Hover affiche le diff via `git show` |
| Tree | Filtre par extension + exclude patterns dynamiques |
| GitHub | Bouton "Régénérer maintenant" qui lance `consistence-dump.ps1` |

### 2.3 Recherche globale Cmd+K

Modal Cmd+K (overlay) qui cherche dans :
- 32 ADRs
- 170 docs
- 92+ commits (message)
- Sections du pilotage (navigation rapide)

Résultats classés par pertinence + raccourcis clavier ↑↓ Enter.

---

## 3. Architecture technique S6.11-bis

### 3.1 Auto-refresh sans commit

Aujourd'hui le pilotage est régénéré **uniquement après un commit**. On ajoute :

- **WebSocket optionnel** vers `localhost:4747/api/pilotage/stream` qui pousse les events :
  - Nouveau commit local (via `fs.watch` sur `.git/refs/heads/main`)
  - Nouveau .md ajouté
  - Nouveau sprint démarré
  - Métriques produit changées
- **Fallback polling** : si WebSocket non dispo, polling `/api/pilotage/state` toutes les 60 sec.
- **Bouton manuel "↻ Régénérer"** qui lance `node scripts/generate-pilotage.js` via fetch POST.

### 3.2 Détection automatique de décrochages

Logique dans `generate-pilotage.js` :
```javascript
function detectDecrochages(sprints, retex, commits) {
  const result = [];
  // Sprint dépassé en chrono
  for (const sprint of sprints) {
    if (sprint.chrono_h > sprint.budget_h * 1.5) {
      result.push({ kind: 'chrono_overrun', sprint: sprint.id, ratio: sprint.chrono_h / sprint.budget_h });
    }
  }
  // Sprint avec tests rouges au commit
  // ADRs proposées > 7j non actées
  // Etc.
  return result;
}
```

### 3.3 Métriques produit en SQLite

Table dédiée `pilotage_metrics` :
```sql
CREATE TABLE pilotage_metrics (
  id INTEGER PRIMARY KEY,
  metric_key TEXT NOT NULL,
  value REAL NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  context TEXT
);
```

Alimentée par :
- `evening_sessions` → streak médian
- `tasks` → arbitrage velocity (à calculer après chaque commit)
- LLM cost → instrumenté à chaque appel `messages.stream`
- `decisions` → % non-stale

Route MCP `aiceo-mcp` expose ces métriques au pilotage (lecture seule).

### 3.4 Export PDF (pour ExCom)

Bouton "📄 Export PDF" qui appelle :
- Lance `puppeteer.launch()` headless local
- Charge le pilotage HTML
- `page.pdf({ format: 'A4', printBackground: true })`
- Download direct dans le navigateur

---

## 4. Tasks S6.11-bis

| # | Task | Effort |
|---|---|---|
| 1 | Section "Live activity" + bandeau dashboard | 1h |
| 2 | Drill-down sprint cliquable (modal détail) | 1h |
| 3 | Section "Coût LLM" + sparkline + alimentation depuis logs | 1.5h |
| 4 | Section "Métriques produit" (7 KPIs) | 1.5h |
| 5 | Section "Décrochages" + détection automatique | 1h |
| 6 | Système favoris (localStorage) | 30 min |
| 7 | Recherche globale Cmd+K | 1.5h |
| 8 | Auto-refresh polling 60s + bouton "Régénérer" | 1h |
| 9 | Export PDF via puppeteer | 1h |
| 10 | Filtres Timeline + Tree | 30 min |
| 11 | Régénération + tests visuels | 30 min |
| 12 | ADR `2026-XX · S6.11-bis livré` | 30 min |

**Total** : ~12h ≈ 1.5 j-binôme

---

## 5. Critères d'acceptance

- ✅ Bandeau "Live activity" en haut du dashboard
- ✅ Cliquer sur un sprint dans la roadmap ouvre le détail (DOSSIER-SPRINT.md)
- ✅ Cmd+K ouvre une recherche globale fonctionnelle (ADRs + docs + commits)
- ✅ Section "Coût LLM" affiche tokens et $ par sprint
- ✅ Décrochages détectés automatiquement
- ✅ Système de favoris persistent en localStorage
- ✅ Polling auto-refresh 60s fonctionnel
- ✅ Export PDF génère un fichier propre

---

## 6. Sources

- Mandat CEO 28/04 : *"prevoit aussi un sprint pour ameliorer l'interface de pilotage de projet"*
- ADR `2026-04-28 v8 · ADD-AI`
- DOSSIER-SPRINT-S6.9-bis.md (setup ADD-AI préalable)
- PLAN-REALIGNEMENT-PROMESSE-2026-04-28.md (les 7 KPIs à câbler)
