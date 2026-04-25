# Conventions scripts — aiCEO

> Notes durables pour les scripts récurrents (PowerShell, bash, Node).
> À consulter avant de générer un nouveau `gh-create-issues-sX.ps1`,
> un `setup-*`, ou tout script qui embarque des bodies markdown.

---

## 1. PowerShell — bodies markdown pour `gh issue create`

### Le format qui marche : here-string **single-quoted** `@'...'@`

```powershell
$body01 = @'
Contexte
--------
S2 a livré l''ADR `2026-04-25 · S2.00 — Zéro localStorage` (source de vérité = SQLite).
Cible S3 : rappeler la règle sur `agenda.html` et `revues/index.html`.

À faire
-------
- [ ] Étendre `GET /api/events/week?with_tasks=true`
- [ ] Tests : `npm test` -> compteur global passe à 61

Critères d''acceptation
----------------------
- `curl http://localhost:3001/api/cockpit/today` -> 200
'@
```

**Règles** :

- Délimiteurs : `@'` ouvre, `'@` ferme, **chacun seul sur sa ligne en colonne 0**.
- Apostrophe à l'intérieur : la **doubler** -> `''` rend `'` à l'écriture.
  - `l'ADR` -> `l''ADR`
  - `Critères d'acceptation` -> `Critères d''acceptation`
- Backticks markdown : **rester littéraux** -> `` `agenda.html` ``, sans rien doubler.
- Aucune expansion `$variable` à l'intérieur (c'est le but : tout est statique).

### Le format qui CASSE : here-string double-quoted `@"..."@`

```powershell
# NE PAS UTILISER pour des bodies markdown
$body01 = @"
- [ ] `index.html` doit consommer l'API
- [ ] Patcher `notes.html` pour le drag-drop
"@
```

Pourquoi ça casse :

- `` ` `` est le **caractère d'échappement PowerShell** dans `@"..."@`.
  - `` `n `` -> newline (et non backtick + `n`)
  - `` `t `` -> tab
  - `` `r `` -> CR
  - `` `0 ``, `` `a ``, `` `b ``, `` `e ``, `` `f ``, `` `v `` -> caractères de contrôle
  - `` `<lettre quelconque> `` -> le backtick est **consommé**, on perd le code span markdown
- Les `''` doublés à l'intérieur d'un `@"..."@` produisent `''` littéraux (deux apostrophes), pas une seule.

Donc `` `index.html` `` dans un `@"..."@` rend `index.html` (sans backticks) ; et `` `notes.html` `` rend littéralement `<newline>otes.html` parce que `` `n `` est interprété comme newline !

### Schéma squelette d'un `gh-create-issues-sX.ps1`

```powershell
$ErrorActionPreference = "Stop"
$repo = "feycoil/aiCEO"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 1. Auth check
& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR : gh auth status KO" -ForegroundColor Red; exit 1 }

# 2. Labels (idempotent via --force)
$labels = @(
  @{ name = "sprint/sX"; color = "d96d3e"; description = "Sprint SX" }
  # ...
)
foreach ($l in $labels) {
  & gh label create $l.name --repo $repo --color $l.color --description $l.description --force 2>&1 | Out-Null
}

# 3. Milestone (idempotent via gh api + ConvertFrom-Json — ne JAMAIS utiliser --jq)
function Ensure-Milestone($title, $description, $dueOn) {
  $jsonText = & gh api "repos/$repo/milestones?state=all" 2>$null | Out-String
  $existing = $null
  if (-not [string]::IsNullOrWhiteSpace($jsonText)) {
    try {
      $existing = ($jsonText | ConvertFrom-Json) | Where-Object { $_.title -eq $title } | Select-Object -First 1
    } catch { $existing = $null }
  }
  if (-not $existing) {
    & gh api "repos/$repo/milestones" -f title="$title" -f description="$description" -f due_on="$dueOn" 2>&1 | Out-Null
  }
}
Ensure-Milestone "v0.5-sX" "Description courte" "2026-MM-DDTHH:MM:SSZ"

# 4. Création des issues — body file via UTF-8 explicite + capture des numéros GitHub
$tmpDir = Join-Path $env:TEMP "aiCEO-issues-sX-$(Get-Random)"
New-Item -ItemType Directory -Path $tmpDir | Out-Null
$createdIssues = @()

function Create-Issue($num, $title, $labelsCsv, $milestone, $body) {
  $bodyFile = Join-Path $tmpDir "issue-$num.md"
  [System.IO.File]::WriteAllText($bodyFile, $body, [System.Text.Encoding]::UTF8)
  # --json url,number capture les vrais refs GitHub pour le PR body
  $result = & gh issue create --repo $repo --title $title --body-file $bodyFile `
    --label $labelsCsv --milestone $milestone | Out-String
  $url = ($result -split "`n" | Where-Object { $_ -match "^https://" } | Select-Object -First 1).Trim()
  if ($url -match '/issues/(\d+)$') {
    $script:createdIssues += [PSCustomObject]@{ tag = $num; number = [int]$matches[1]; url = $url }
  }
}

$commonLabels = "sprint/sX,phase/v0.5-sX"

$body00 = @'
... markdown ici ...
'@
Create-Issue "SX.00" "[SX.00] Titre" "$commonLabels,lane/mvp,type/adr,priority/P0,owner/pmo" "v0.5-sX" $body00

# Sortie : JSON des numéros pour le PR body
$createdIssues | ConvertTo-Json -Depth 2 | Out-File "04_docs/_sprint-sX/issues-sX.json" -Encoding UTF8
Write-Host "Closes line for PR body :" -ForegroundColor Cyan
Write-Host ("Closes " + (($createdIssues | ForEach-Object { "#$($_.number)" }) -join ", "))
```

### Pièges historiques (ne pas refaire)

| # | Piège | Sprint | Fix retenu |
|---|---|---|---|
| 1 | `gh api ... --jq` ne marche pas en PowerShell (jq absent du `gh` Windows) | S1 | `ConvertFrom-Json` + `Where-Object` |
| 2 | Bodies en `@"..."@` cassent les backticks markdown et les `` `n `` deviennent newlines | S3 | Bodies en `@'...'@` |
| 3 | `''` doublé dans `@"..."@` produit deux apostrophes littérales | S3 | Bodies en `@'...'@` (où `''` = `'` correct) |
| 4 | `--body "string"` mange les newlines selon les politiques de quoting Windows | S2 | Toujours passer par `--body-file <tmp>.md` UTF-8 |
| 5 | **PowerShell 5 lit le `.ps1` en cp1252 si pas de BOM** -> mojibake (`—` -> `â€"`, `é` -> `Ã©`) qui casse le parser | S3 | Sauver le `.ps1` en **UTF-8 avec BOM** (`EF BB BF`). Vérifier : `(Get-Content $file -Encoding Byte -TotalCount 3) -join ','` doit donner `239,187,191`. Côté Linux : `printf '\xef\xbb\xbf'; cat fichier.ps1` |
| 6 | **`Closes #SX.NN` ne ferme rien** — GitHub n'auto-close que sur numéros décimaux (`Closes #15`). Le tag `SX.NN` est dans le titre, pas l'ID. | S2 | (a) Capturer les numéros GitHub à la création (cf. squelette ci-dessus, sortie `issues-sX.json`). (b) Générer le `PR-SX.md` avec les vrais refs `Closes #15, #16, ...`. (c) Fallback post-merge : `gh issue list --milestone v0.5-sX --state open --json number \| ConvertFrom-Json \| ForEach-Object { gh issue close $_.number --reason completed }` (idempotent, ne touche pas aux issues déjà closes ni aux autres milestones) |

---

## 2. Bash sandbox — git sur mount Windows

Le mount `/sessions/.../mnt/aiCEO/` (qui pointe vers `C:\_workarea_local\aiCEO`)
souffre d'un problème de sync avec les writes atomiques de git :

- `.git/index` peut être corrompu (`bad signature 0x00000000`) après un `git add`
  qui passait pourtant proprement.
- `git status` peut "rater" des fichiers modifiés malgré un `git diff` qui voit l'écart.
- Les writes via Edit tool peuvent **truncater** un fichier (lecture cache stale, write tronqué) — vérifier avec `wc -l` après chaque Edit, et au besoin réécrire en `Write` complet ou via `python3 /tmp/build.py`.

### Le pattern qui marche : index sur tmpfs

```bash
cd /sessions/.../mnt/aiCEO
cp .git/index /tmp/git-index-work
GIT_INDEX_FILE=/tmp/git-index-work git add path/to/file
GIT_INDEX_FILE=/tmp/git-index-work git status --short
GIT_INDEX_FILE=/tmp/git-index-work git commit -m "..."
cp /tmp/git-index-work .git/index   # resync .git/index seulement après commit OK
```

### Symptômes -> remède

| Symptôme | Remède |
|---|---|
| `Write` tool dit OK mais le fichier n'apparaît pas, ou apparaît à 0 octet | Attendre 5 s puis revérifier, sinon réécrire via `python3 /tmp/build.py` |
| `.tmp.PID.timestamp` orphelin à 0 octet à côté du fichier cible | `rm` le tmp, réécrire (artefact de l'écriture atomique foirée) |
| `git status` clean alors que le contenu a clairement changé | `cp .git/index /tmp/git-index-work && GIT_INDEX_FILE=/tmp/git-index-work git status` |
| `fatal: index file corrupt` | `git reset` (récupère l'index depuis HEAD sans toucher le working tree) |
| `git add` reporte tous les fichiers en "deleted" | Workflow tmpfs `GIT_INDEX_FILE=/tmp/git-index-work` |
| Fichier truncaté après `Edit` tool | `Read` complet -> `Write` du fichier en entier, OU mieux : `cat > fichier <<'EOF_DELIM' ... EOF_DELIM` via bash |

### Push depuis le sandbox

Le sandbox **n'a pas** les credentials GitHub du CEO. Tout `git push` doit se faire
côté Windows. Pattern récurrent :

1. Sandbox : crée la branche, commit(s), prêt à pousser
2. CEO côté Windows :
   ```powershell
   cd C:\_workarea_local\aiCEO
   git fetch
   git push -u origin <branch-name>
   gh pr create --base main --head <branch-name> --title "..." --body "..."
   ```

---

## 3. Conventions transverses (toutes plateformes)

- **Encoding** : UTF-8 partout. PowerShell : forcer
  `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` + sauver les `.ps1` **avec BOM**.
- **EOL** : `.gitattributes` impose `*.ps1 text eol=crlf`, le warning
  "LF will be replaced by CRLF" est attendu et bénin.
- **Idempotence** : tout script setup (labels, milestone, etc.)
  doit être ré-exécutable sans effet de bord (vérifier l'existence avant de créer).
- **Préfixe d'issue** : titre = `[SX.NN] <verbe d'action>` pour faciliter `gh issue list --search "SX.NN"`.
- **Labels** : `sprint/sX`, `phase/v0.5-sX`, `lane/mvp|tests`, `type/feat|adr|spike|test|docs`, `priority/P0|P1|P2`, `area/api|ux|ai|realtime|integration|deploy`, `owner/dev1|dev2|pmo`.
- **Charge / Owner / Dépendances** : section obligatoire en pied de body, format
  ```
  - Charge : N j-dev
  - Owner  : Dev1 | Dev2 | PMO
  - Dépendances : aucune | **SX.NN**
  ```
- **Source** : dernière ligne du body, pointe vers le DOSSIER-SPRINT et la section concernée.
- **Auto-close PR -> issues** : capturer les numéros à la création (sortie `issues-sX.json`),
  les utiliser dans `PR-SX.md` (`Closes #15, #16, ...`). Le tag `SX.NN` du titre **n'est pas un ID GitHub**.

---

*Dernière maj : 2026-04-25 (post-fix S3 heredoc + BOM + auto-close issues). À enrichir au fil des sprints.*
