# Pièges techniques connus aiCEO

> Ces pièges ont été rencontrés en production. Chaque entrée a un fix éprouvé.

## Mount Windows / OneDrive

### P1 — NUL bytes en fin de fichier (`^@^@^@^@`)
- **Cause** : Bug OneDrive sync (résolu 26/04 PM par déplacement repo hors OneDrive)
- **Symptôme** : fichiers terminés par `\x00` répétés, parsing JSON/JS casse silencieusement
- **Fix** : `python3 strip-nul.py` (template dans CLAUDE.md §5)

### P2 — Edit/Write tool tronque les fichiers > 100 lignes
- **Cause** : Mount Windows fragile sur certains fichiers (server.js, assistant.html)
- **Symptôme** : fichier perd silencieusement sa fin (ex: drawer non stylé, tabs cassés)
- **Fix** : **Python atomic write** systématique pour fichiers > 100 lignes

```python
import os
dst = "/sessions/.../mnt/aiCEO/path/to/file.ext"
with open(dst, "r", encoding="utf-8") as f:
    content = f.read()
# patches sur content...
tmp = dst + ".tmp"
with open(tmp, "w", encoding="utf-8", newline="\n") as f:
    f.write(content); f.flush(); os.fsync(f.fileno())
os.replace(tmp, dst)
```

### P3 — Page HTML perd ses `<script>` en bas
- **Cause** : Mount Windows tronque silencieusement la fin du HTML
- **Symptôme** : drawer non stylé, tabs cassés, badges absents (28/04 PM : settings.html avait perdu 19/20 scripts)
- **Détection** : `grep -c "<script src" page.html` doit être ≥ 15 sur les pages câblées
- **Fix** : restaurer via Python atomic write en copiant la section `<script src>` d'une page voisine

### P4 — CRLF parasites ~22 fichiers en `git status` après clone
- **Cause** : Conversion auto LF→CRLF Windows
- **Fix** : `git checkout -- 03_mvp/src/* 03_mvp/tests/*.test.js` (sauf nouveaux fichiers)

## SQLite

### P5 — `EBUSY: resource busy aiceo.db` sur `npm run db:reset`
- **Cause** : 2+ process node simultanés (souvent serveur fantôme du wrapper Variante D + nouveau npm start)
- **Fix** : `Get-NetTCPConnection -LocalPort 4747 | Stop-Process -Force` avant db:reset

### P6 — `disk I/O error errcode 4618` SQLite
- **Cause** : Sandbox Linux ne supporte pas node:sqlite sur tous les paths
- **Fix** : Tester côté Windows uniquement, ou path `/sessions/.../mnt/outputs/` ou `/tmp/test.db`

## Express / Node

### P7 — `EADDRINUSE :::4747`
- **Cause** : Wrapper logon a déjà démarré le serveur
- **Fix** : `Get-NetTCPConnection -LocalPort 4747 | Stop-Process -Force`

### P8 — Cache buster oublié après modif JS/CSS
- **Cause** : Modif `_shared/bind-*.js` ou `app.css` sans bump `?v=NNN`
- **Symptôme** : navigateurs CEO chargent l'ancienne version
- **Fix** : `find 03_mvp/public/v06 -name "*.html" -exec sed -i 's/?v=99/?v=100/g' {} \;` (ou script PowerShell équivalent)

## GitHub / Tooling

### P9 — `gh issue create` échoue `label not found`
- **Fix** : `pwsh -File fix-labels.ps1` (idempotent)

### P10 — `gh release create` echec `Release.tag_name already exists`
- **Cause** : Release existe déjà (en draft ou public)
- **Fix** : `pwsh -File fix-consistence-v2.ps1 -Apply` (publie drafts + crée manquantes)

### P11 — Doublons d'issues sur GitHub
- **Cause** : Script `gh-create-issues-sX.ps1` lancé 2× par erreur
- **Fix** : `pwsh -File cleanup-issues.ps1 -Apply` (audit ciblé)

## JSON-in-script

### P12 — `</script>` ou `<!--` dans contenu JSON embarqué casse le parsing
- **Cause** : Le navigateur ferme prématurément le `<script type="application/json">` quand il rencontre `</script>` dans le contenu (même dans une string JSON)
- **Symptôme** : JSON.parse fail silencieusement → tous les bindings JS cassés
- **Fix** : Escape Unicode AVANT injection dans HTML :

```js
let payload = JSON.stringify(data);
payload = payload.replace(/<\//g, '\\u003C/').replace(/<!--/g, '\\u003C!--');
html = html.replace('/*PILOTAGE_DATA*/', payload);
```

⚠️ **NE PAS** utiliser `\!` — ce n'est pas une séquence d'échappement JSON valide. Toujours `<`.

## CEO communication

### P13 — Copier-coller en français change `xxx.md` en `[xxx.md](http://xxx.md)`
- **Cause** : App du CEO transforme noms ressemblant URL en lien markdown
- **Fix** : **Toujours générer un script `.ps1`** plutôt que demander de coller des commandes contenant `.md`

### P14 — Issues fermées par script mais milestone reste open
- **Cause** : Le commit `feat(sX)` n'a pas de `Closes #YYY` car les numéros sont créés APRÈS
- **Fix** : Fermer manuellement avec `gh issue close --reason completed` puis `gh issue close --milestone`

## Sources

- `CLAUDE.md` §5 (table complète des pièges)
- Retex S6.7 (28/04 PM JSON escape Unicode)
- Retex S6.8 (28/04 soir mount Windows + scripts perdus)
