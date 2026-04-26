# RECETTE CEO — v0.5-s4

**Cible** : valider que le sprint S4 est bon pour usage dogfood. À exécuter par le CEO sur son poste Windows après `git pull` + `npm install` + `npm run db:reset`.

**Durée** : 25 minutes.

---

## §0 — Pré-requis poste

- [ ] `node --version` → v24.x
- [ ] `git --version` → 2.40+
- [ ] `gh auth status` → connecté à `feycoil/aiCEO`
- [ ] `Get-NetTCPConnection -LocalPort 4747` → vide (aucun fantôme) OU si présent : tuer avant
- [ ] `cd C:\_workarea_local\aiCEO && git pull origin main` → up to date
- [ ] `cd 03_mvp && npm install` → 0 vuln, 0 warn rouge
- [ ] `npm run db:reset` → succès (applique 2 migrations : init-schema + s4-assistant)

---

## §1 — Tests automatiques

```powershell
cd C:\_workarea_local\aiCEO\03_mvp
npm test
```

**Attendu** :
- ≥ **84 tests verts** (78 anciens + 6 nouveaux pages.test.js)
- 0 failed
- Durée < 5 secondes

Si < 84 verts ou tests rouges → STOP, ne pas continuer la recette. Investiguer.

---

## §2 — Boot serveur

```powershell
npm start
```

**Attendu dans le terminal** :

```
--------------------------------------
  aiCEO v0.5 - copilote executif
  -> http://localhost:4747          (matin - arbitrage)
  -> http://localhost:4747/evening  (soir - debrief)
  -> mode : REEL - claude-sonnet-4-6   (ou DEMO si pas de cle API)
--------------------------------------
```

Smoke test :

```powershell
curl http://localhost:4747/api/health
```

→ `{"ok":true,"demo":false,"model":"claude-sonnet-4-6"}`

---

## §3 — Tour des 12 pages (HTTP 200 + render visuel)

Pour chacune des routes ci-dessous, ouvrir dans Edge/Chrome, vérifier qu'aucune erreur n'apparaît dans la console F12 :

| Route | Ce qu'on doit voir | Sprint |
|---|---|---|
| `/` | Cockpit avec 5 cards (intention, big rocks, tâches, décisions, agenda) | S2 |
| `/arbitrage` | 3 colonnes drag-drop (faire / déléguer / reporter) | S2 |
| `/evening` | Bilan soir avec humeur + énergie + top3 | S2 |
| `/taches` | Inbox + matrice Eisenhower 2×2 | S2 |
| `/agenda` | Vue hebdo lun-dim, drag-drop tâche → date | S3 |
| `/revues` | Revues hebdo + draft IA | S3 |
| `/groupes` | **3-4 cards groupes**, progression moyenne, KPIs, drawer projets | **S4.03** |
| `/projets` | **Liste projets**, filtres groupe (chips), recherche | **S4.04** |
| `/projet?id=...` | **Page projet** : header, KPIs, tâches, décisions | **S4.05** |
| `/contacts` | **Cartes contacts** avec avatar initiales, recherche, filtre confiance | **S4.06** |
| `/decisions` | **Registre** filtres statut, bouton "💡 Recommander une suite" | **S4.07** |
| `/assistant` | **Chat live** sidebar conversations, streaming chunk-par-chunk | **S4.02** |

**Test critique S4.02 — assistant streaming** :
1. Aller sur `/assistant`
2. Taper "Quels sont mes 3 chantiers prioritaires ?" + Ctrl+Enter
3. Vérifier que les mots arrivent **un par un** (pas d'un bloc)
4. Cliquer "Nouvelle conversation" → sidebar se vide, focus sur input

**Test critique S4.07 — IA recommend** :
1. Aller sur `/decisions`
2. Cliquer "💡 Recommander une suite" sur une décision ouverte
3. Drawer s'ouvre à droite, recommandation streame depuis Claude
4. Échap ferme le drawer

---

## §4 — Autostart + raccourci Bureau

```powershell
# Raccourci Startup folder
pwsh -File scripts\service-windows\install-startup-shortcut.ps1 status
# attendu : raccourci installe + serveur ecoute sur :4747

# Raccourci Bureau (S4.08)
pwsh -File scripts\service-windows\install-desktop-shortcut.ps1 install
pwsh -File scripts\service-windows\install-desktop-shortcut.ps1 status
```

**Test visuel** :
- Aller sur le Bureau Windows → l'icône **"Cockpit aiCEO"** est présente
- Double-clic → ouvre `http://localhost:4747/` dans le navigateur par défaut
- Si le serveur ne tourne pas, le navigateur affiche "site inaccessible" — c'est attendu

---

## §5 — Rotation logs (S4.09)

```powershell
$log = "C:\_workarea_local\aiCEO\03_mvp\data\aiCEO-server.log"
Get-Item $log | Select-Object Name, Length
# Si Length > 2 Mo : au prochain logon le wrapper rotate vers .1

# Verifier les archives
Get-ChildItem "$($log)*" | Select-Object Name, Length
```

Pas de test forçé — rotation se déclenche organiquement.

---

## §6 — Sync Outlook

```powershell
# Verifier que la tâche planifiée tourne (créée en S2)
schtasks /query /tn "aiCEO-Outlook-Sync" /v /fo LIST | Select-String "Last Run|Next Run|Status"

# Logs récents
Get-Content C:\_workarea_local\aiCEO\03_mvp\data\sync-outlook.log -Tail 20
```

Si pas tourné depuis > 4h, l'alerte cockpit `last_sync` doit afficher `warn` ou `critical`.

---

## §7 — Edge cases connus

| Test | Attendu |
|---|---|
| Visiter `/projet` sans `?id=xxx` | Message "Pas d'identifiant projet" |
| Visiter `/groupes` avec 0 groupe en base | Empty state "Aucun groupe configuré" |
| Visiter `/decisions` avec filtre statut sans aucune décision | Empty state "Aucune décision ne correspond" |
| Recherche dans `/contacts` accent → "Köhl" | Trouve "Kohl" et "Köhl" (LIKE %% case-insensitive) |
| Cliquer "💡 Recommander" sans clé API Claude | Stream message factice "Mode fallback…" |
| Ctrl+Enter dans assistant avec input vide | Pas d'envoi |

---

## §8 — Verdict

| Critère | Statut |
|---|---|
| ≥ 84 tests verts | ☐ |
| 12 pages HTTP 200 + console F12 sans erreur | ☐ |
| Streaming SSE fonctionnel `/assistant` | ☐ |
| Recommendation IA fonctionnel `/decisions` | ☐ |
| Raccourci Bureau présent + click ouvre cockpit | ☐ |
| Sync Outlook last-sync OK (< 4h) | ☐ |

Si **6/6 cochés** → S4 GO pour tag `v0.5-s4`. Procéder à :

```powershell
cd C:\_workarea_local\aiCEO
git tag -a v0.5-s4 -m "Sprint S4 — assistant chat + 5 pages portefeuille + polish Windows"
git push origin v0.5-s4
gh release create v0.5-s4 --title "v0.5-s4 (Sprint S4)" --notes-file 04_docs/release-notes/v0.5-s4.md
```

Si < 6/6 → fixer les défauts, re-tester, ne pas tagger.

---

## Sources

- `04_docs/DOSSIER-SPRINT-S4.md` (cadrage)
- `04_docs/INSTALL-WINDOWS.md` (install consolidée)
- `04_docs/api/S4.md` (curl examples)
- `00_BOUSSOLE/DECISIONS.md` § S4.00..S4.10
- Issues GitHub : #147 → #158 (12 issues sprint S4)
