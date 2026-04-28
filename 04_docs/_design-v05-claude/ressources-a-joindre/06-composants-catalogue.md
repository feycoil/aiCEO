# Catalogue de composants UI — aiCEO v0.5

> Source : extraction de `01_app-web/assets/app.css` v3 (DA Twisty étendue, 1798 lignes) + comblement des manques.
> Tous les composants doivent être réutilisés à l'identique sur les 22 vues. Aucune réinvention page-par-page.

## Sommaire

1. Buttons
2. Form inputs
3. Modals
4. Toasts
5. Tooltips
6. Dropdowns / Selects
7. Switches / Toggles
8. Progress bars
9. Tags / Chips / Pills
10. Avatars
11. Skeletons (loading states)
12. Tabs underline
13. Cards (variants)
14. KPI tiles
15. Search pill (header)
16. Command palette ⌘K

---

## 1. Buttons

### Variants × sizes

| Variant | Usage | Background | Color | Border |
|---|---|---|---|---|
| **primary** | CTA principal (Valider arbitrage, Bonne nuit, Demander reco) | `--brand` #111418 | #fff | `--brand` |
| **secondary** | Actions secondaires (Annuler, Filtrer) | `--surface-2` #fff | `--text` | `--border` |
| **ghost** | Actions tertiaires (chevron expand, edit inline) | transparent | `--text-2` | transparent |
| **danger** | Suppressions, actions destructives | `--rose-bg` #fdecdf | `--rose-800` #8a3b1b | `--rose` |
| **icon-only** | Topbar actions, quick actions row | transparent | `--text-2` | none |

Sizes : `sm` (padding 5px 10px, font 12px), `md` (default, padding 8px 14px, font 13px), `lg` (padding 10px 18px, font 14px).

### HTML/CSS exemple

```html
<!-- Primary -->
<button class="btn primary">
  <svg width="14" height="14"><!-- lucide check --></svg>
  Valider l'arbitrage
</button>

<!-- Secondary -->
<button class="btn">Annuler</button>

<!-- Ghost -->
<button class="btn-ghost"><svg><!-- lucide chevron-down --></svg></button>

<!-- Danger -->
<button class="btn danger">Supprimer</button>

<!-- Icon-only -->
<button class="icon-btn" aria-label="Réglages">
  <svg width="16" height="16"><!-- lucide settings --></svg>
</button>
```

```css
.btn{
  display:inline-flex; align-items:center; gap:8px;
  padding: 8px 14px; border: 1px solid var(--border);
  border-radius: 10px; background: var(--surface-2);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all .12s;
  font-variant-numeric: tabular-nums;
}
.btn:hover{ border-color: var(--border-strong); transform: translateY(-1px); }
.btn:active{ transform: translateY(0); }
.btn:focus-visible{ outline: 2px solid var(--brand); outline-offset: 2px; }
.btn:disabled{ opacity: .5; cursor: not-allowed; transform: none; }

.btn.primary{ background: var(--brand); color: #fff; border-color: var(--brand); }
.btn.primary:hover{ background: var(--brand-2); }

.btn.danger{ background: var(--rose-bg); color: var(--rose-800); border-color: var(--rose); }
.btn.danger:hover{ background: var(--rose); color: #fff; }

.btn.sm{ padding: 5px 10px; font-size: 12px; gap: 6px; }
.btn.lg{ padding: 10px 18px; font-size: 14px; gap: 10px; }
```

### États
- **default** : voir ci-dessus
- **hover** : `border-color: var(--border-strong)` + `translateY(-1px)`
- **active** : `translateY(0)`
- **focus-visible** : `outline 2px solid var(--brand) offset 2px`
- **disabled** : `opacity .5`, cursor not-allowed
- **loading** : remplacer label par `<svg>` spinner Lucide `loader-2` rotation

---

## 2. Form inputs

### Text input

```html
<div class="field">
  <label class="field-label" for="task-title">Titre de la tâche</label>
  <input type="text" id="task-title" class="input" placeholder="Ex : Préparer ODJ CoPil AMANI">
  <div class="field-help">Court et actionnable, verbe d'action en début</div>
</div>
```

```css
.field{ display: grid; gap: 6px; }
.field-label{ font-size: 12px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.04em; }
.field-help{ font-size: 12px; color: var(--text-3); }
.input{
  padding: 10px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px; font-family: inherit;
  color: var(--text);
  transition: border-color .12s;
}
.input:focus{ outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-50); }
.input::placeholder{ color: var(--text-3); }
.input:disabled{ background: var(--surface-3); color: var(--text-3); }
.input.error{ border-color: var(--rose); }
```

### Textarea

```html
<textarea class="input textarea" rows="3" placeholder="Note du jour…"></textarea>
```

```css
.textarea{ resize: vertical; min-height: 84px; line-height: 1.5; }
```

### Select (natif puis custom — voir §6)

### Date picker

Utiliser `<input type="date">` natif HTML5 + classe `.input`. Cohérence cross-browser acceptable pour MVP local.

### Number / stepper

```html
<div class="stepper">
  <button class="btn sm" aria-label="moins">−</button>
  <input type="number" class="input stepper-input" value="3" min="1" max="5">
  <button class="btn sm" aria-label="plus">+</button>
</div>
```

```css
.stepper{ display: inline-flex; align-items: center; gap: 0; }
.stepper-input{ width: 48px; text-align: center; border-radius: 0; border-left: 0; border-right: 0; }
.stepper .btn:first-child{ border-radius: 10px 0 0 10px; }
.stepper .btn:last-child{ border-radius: 0 10px 10px 0; }
```

---

## 3. Modals

### Variants

| Size | Width | Usage |
|---|---|---|
| **compact** | 320px | Confirmations destructives, alertes |
| **medium** | 560px | Édition tâche, création projet, paramètres rapide |
| **large** | 720px | Vue détaillée (RDV Outlook, projet preview) |

### HTML structure

```html
<div class="modal-backdrop open" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal modal-medium">
    <div class="modal-header">
      <h3 class="modal-title" id="modal-title">Nouvelle tâche</h3>
      <button class="modal-close" aria-label="Fermer">×</button>
    </div>
    <div class="modal-body">
      <!-- form fields -->
    </div>
    <div class="modal-footer">
      <button class="btn">Annuler</button>
      <button class="btn primary">Créer</button>
    </div>
  </div>
</div>
```

```css
.modal-backdrop{
  display: none;
  position: fixed; inset: 0;
  background: rgba(17,20,24,0.40);
  backdrop-filter: blur(6px);
  z-index: 200;
  align-items: center; justify-content: center;
  padding: 20px;
}
.modal-backdrop.open{ display: flex; }
.modal{
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-pop);
  max-height: 90vh; overflow-y: auto;
  animation: modal-in 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-compact{ width: min(320px, 100%); }
.modal-medium{ width: min(560px, 100%); }
.modal-large{ width: min(720px, 100%); }

.modal-header{ padding: 18px 24px; border-bottom: 1px solid var(--border); display:flex; align-items:center; }
.modal-title{ font-size: 16px; font-weight: 600; margin: 0; }
.modal-close{ margin-left: auto; background: transparent; border: none; cursor: pointer; padding: 6px 10px; border-radius: 8px; font-size: 18px; color: var(--text-3); }
.modal-close:hover{ background: var(--surface-3); }
.modal-body{ padding: 20px 24px; display:grid; gap: 14px; }
.modal-footer{ padding: 14px 24px; border-top: 1px solid var(--border); display:flex; gap:10px; justify-content: flex-end; }

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .modal{ animation: none; }
}
```

### Comportements
- **Esc** ferme la modal
- **Click backdrop** ferme la modal
- **Focus trap** (focus reste dans la modal)
- **Restore focus** au déclencheur à la fermeture
- **Click destructif** (Supprimer dans danger modal) : confirmation requise via second clic OU saisie texte "supprimer"

---

## 4. Toasts

### Variants

| Type | Color | Icon Lucide | Duration |
|---|---|---|---|
| **success** | `--emerald` | check-circle | 2000ms |
| **error** | `--rose` | alert-circle | 4000ms (plus long) |
| **info** | `--sky` | info | 2500ms |

### Position
- **Top-right**, offset 24px du coin
- Stack vertical si plusieurs (gap 8px)
- Slide-in droite, slide-out droite

### HTML

```html
<div class="toast-stack" aria-live="polite" aria-atomic="false">
  <div class="toast toast-success" role="status">
    <svg width="16" height="16"><!-- lucide check-circle --></svg>
    <span class="toast-message">Arbitrage enregistré.</span>
    <button class="toast-close" aria-label="Fermer">×</button>
  </div>
</div>
```

```css
.toast-stack{
  position: fixed;
  top: 24px; right: 24px;
  z-index: 300;
  display: flex; flex-direction: column; gap: 8px;
  pointer-events: none;
}
.toast{
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-left: 4px solid var(--text-2);
  border-radius: 10px;
  box-shadow: var(--shadow-pop);
  font-size: 13px; font-weight: 500;
  pointer-events: auto;
  animation: toast-in 240ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 280px; max-width: 380px;
}
.toast-success{ border-left-color: var(--emerald); color: var(--emerald-800); }
.toast-success svg{ color: var(--emerald); }
.toast-error  { border-left-color: var(--rose);    color: var(--rose-800); }
.toast-error svg{ color: var(--rose); }
.toast-info   { border-left-color: var(--sky);     color: var(--sky-800); }
.toast-info svg{ color: var(--sky); }

.toast-message{ flex: 1; }
.toast-close{ background: transparent; border: none; color: inherit; cursor: pointer; opacity: .6; }
.toast-close:hover{ opacity: 1; }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

---

## 5. Tooltips

### Pattern

Tooltips uniquement sur **éléments icon-only** ou **valeurs tronquées**. Jamais sur du texte évident.

```html
<button class="icon-btn" data-tooltip="Réglages">
  <svg><!-- lucide settings --></svg>
</button>
```

```css
[data-tooltip]{ position: relative; }
[data-tooltip]:hover::after,
[data-tooltip]:focus-visible::after{
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px); left: 50%;
  transform: translateX(-50%);
  background: var(--brand); color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px; font-weight: 500;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  animation: tooltip-in 100ms ease-out;
}
[data-tooltip]:hover::before,
[data-tooltip]:focus-visible::before{
  content: '';
  position: absolute;
  bottom: calc(100% + 4px); left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--brand);
  z-index: 10;
}
@keyframes tooltip-in{ from{ opacity: 0; } to{ opacity: 1; } }
```

**Délai** : 500ms hover avant apparition (ajout JS minimaliste).

---

## 6. Dropdowns / Selects

### Native dropdown stylisé

```html
<div class="select-wrap">
  <select class="input select">
    <option>Cette semaine</option>
    <option>Mois en cours</option>
    <option>Tout</option>
  </select>
  <svg class="select-chevron" width="12" height="12"><!-- lucide chevron-down --></svg>
</div>
```

```css
.select-wrap{ position: relative; display: inline-block; }
.select{
  appearance: none;
  padding-right: 36px;
  cursor: pointer;
  background: var(--surface-2);
}
.select-chevron{
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-3);
}
```

### Custom dropdown menu (action menu)

```html
<div class="menu-wrap">
  <button class="btn-ghost" aria-haspopup="menu" aria-expanded="false">
    <svg><!-- lucide more-horizontal --></svg>
  </button>
  <div class="menu" role="menu">
    <button class="menu-item" role="menuitem">
      <svg><!-- lucide edit --></svg> Renommer
    </button>
    <button class="menu-item" role="menuitem">
      <svg><!-- lucide archive --></svg> Archiver
    </button>
    <hr class="menu-sep">
    <button class="menu-item danger" role="menuitem">
      <svg><!-- lucide trash --></svg> Supprimer
    </button>
  </div>
</div>
```

```css
.menu{
  position: absolute;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-pop);
  padding: 6px;
  min-width: 180px;
  z-index: 50;
  animation: menu-in 120ms ease-out;
}
.menu-item{
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 8px 12px;
  background: transparent; border: none; cursor: pointer;
  border-radius: 8px;
  font-size: 13px; color: var(--text); text-align: left;
}
.menu-item:hover{ background: var(--surface-3); }
.menu-item.danger{ color: var(--rose-800); }
.menu-item.danger:hover{ background: var(--rose-bg); }
.menu-sep{ border: none; border-top: 1px solid var(--border); margin: 6px -6px; }

@keyframes menu-in{ from{ opacity: 0; transform: translateY(-4px); } to{ opacity: 1; transform: translateY(0); } }
```

---

## 7. Switches / Toggles

```html
<label class="switch">
  <input type="checkbox" checked>
  <span class="switch-track">
    <span class="switch-thumb"></span>
  </span>
  <span class="switch-label">Notifications activées</span>
</label>
```

```css
.switch{ display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }
.switch input{ position: absolute; opacity: 0; pointer-events: none; }
.switch-track{
  width: 36px; height: 20px;
  background: var(--text-3);
  border-radius: 999px;
  position: relative;
  transition: background 160ms;
}
.switch-thumb{
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 160ms cubic-bezier(0.4, 0, 0.2, 1);
}
.switch input:checked + .switch-track{ background: var(--brand); }
.switch input:checked + .switch-track .switch-thumb{ transform: translateX(16px); }
.switch input:focus-visible + .switch-track{ outline: 2px solid var(--brand); outline-offset: 2px; }
```

### Toggle button group (vue list/kanban)

```html
<div class="toggle-group" role="group">
  <button class="toggle-btn active" aria-pressed="true">Liste</button>
  <button class="toggle-btn" aria-pressed="false">Kanban</button>
</div>
```

```css
.toggle-group{ display: inline-flex; background: var(--surface-3); padding: 3px; border-radius: 10px; }
.toggle-btn{
  padding: 6px 14px;
  background: transparent; border: none;
  border-radius: 7px;
  font-size: 13px; font-weight: 500; color: var(--text-2);
  cursor: pointer; transition: all .12s;
}
.toggle-btn:hover{ color: var(--text); }
.toggle-btn.active{ background: var(--surface-2); color: var(--text); box-shadow: var(--shadow-card); }
```

---

## 8. Progress bars

### Linear

```html
<div class="progress" role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-fill" style="width: 65%"></div>
</div>
<div class="progress-meta">65 % avancement · Big Rock S17</div>
```

```css
.progress{
  height: 6px;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill{
  height: 100%;
  background: var(--brand);
  border-radius: inherit;
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
.progress.tinted-emerald .progress-fill{ background: var(--emerald); }
.progress.tinted-amber   .progress-fill{ background: var(--amber); }
.progress.tinted-rose    .progress-fill{ background: var(--rose); }
.progress-meta{ font-size: 12px; color: var(--text-3); margin-top: 6px; }
```

### Circular ring (streak month, completion projet)

SVG inline 64×64 viewBox, stroke-dasharray pour le fill.

```html
<svg class="ring" width="64" height="64" viewBox="0 0 64 64" aria-label="Streak 12 jours">
  <circle cx="32" cy="32" r="28" stroke="var(--surface-3)" stroke-width="6" fill="none"/>
  <circle cx="32" cy="32" r="28" stroke="var(--brand)" stroke-width="6" fill="none"
          stroke-dasharray="175.93" stroke-dashoffset="105.56"
          stroke-linecap="round" transform="rotate(-90 32 32)"/>
  <text x="32" y="36" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text)" font-variant-numeric="tabular-nums">40%</text>
</svg>
```

---

## 9. Tags / Chips / Pills

### Variants

| Type | Class | Background | Color | Usage |
|---|---|---|---|---|
| **neutral** | `.pill` | `--surface-3` | `--text` | Tags, méta neutres |
| **outline** | `.pill outline` | transparent | `--text-2` | Filtres inactifs |
| **status active** | `.pill status active` | `--emerald-bg` | `--emerald-800` | Projet actif |
| **status hot** | `.pill status hot` | `--rose-bg` | `--rose-800` | Urgent, hot |
| **status new** | `.pill status new` | `--sky-bg` | `--sky-800` | Nouveau |
| **status archived** | `.pill status archived` | `--surface-3` | `--text-3` | Terminé |

### Group/Société pill (avec dot)

```html
<span class="pill group-pill">
  <span class="dot" style="background: var(--group-amani);"></span>
  AMANI
</span>
```

```css
.pill{ display:inline-flex; align-items:center; gap:6px; padding: 3px 10px; border-radius: 999px; background: var(--surface-3); font-size: 12px; font-weight: 500; }
.pill.outline{ background: transparent; border: 1px solid var(--border); }
.pill .dot{ width: 6px; height: 6px; border-radius: 50%; }
.pill.status.active  { background: var(--emerald-bg); color: var(--emerald-800); }
.pill.status.hot     { background: var(--rose-bg);    color: var(--rose-800); }
.pill.status.new     { background: var(--sky-bg);     color: var(--sky-800); }
.pill.status.archived{ background: var(--surface-3);  color: var(--text-3); }

/* Couleurs groupes (dots) */
:root{
  --group-mhssn: #3d4e7d;   /* indigo */
  --group-amani: #d96d3e;   /* rose/coral */
  --group-etic:  #b88237;   /* amber */
}
```

### Sizes : `sm` (font 11px, padding 2px 8px), `md` (default), `lg` (font 13px, padding 4px 12px).

### Priority pill (P0-P3)

```html
<span class="pill priority p0">P0</span>
```

```css
.priority.p0{ background: var(--rose); color: #fff; font-weight: 600; }
.priority.p1{ background: var(--amber); color: #fff; font-weight: 600; }
.priority.p2{ background: var(--surface-3); color: var(--text-2); }
.priority.p3{ background: var(--surface-3); color: var(--text-3); }
```

---

## 10. Avatars

### Sizes

| Class | Size | Usage |
|---|---|---|
| `.avatar.xs` | 16×16 | Inline meta |
| `.avatar.sm` | 24×24 | List rows |
| `.avatar.md` | 32×32 | Drawer footer, contacts grid |
| `.avatar.lg` | 48×48 | Card header (focus contact) |

### HTML — initiales fallback

```html
<span class="avatar md" data-color="amani" title="Bénédicte F.">
  <span class="avatar-initials">BF</span>
</span>
```

```css
.avatar{
  display: inline-grid; place-items: center;
  border-radius: 50%;
  font-weight: 600;
  background: var(--surface-3);
  color: var(--text);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.avatar.xs{ width: 16px; height: 16px; font-size: 8px; }
.avatar.sm{ width: 24px; height: 24px; font-size: 10px; }
.avatar.md{ width: 32px; height: 32px; font-size: 12px; }
.avatar.lg{ width: 48px; height: 48px; font-size: 16px; }

/* Couleurs par groupe (background + couleur texte) */
.avatar[data-color="mhssn"] { background: #e3e7ee; color: var(--group-mhssn); }
.avatar[data-color="amani"] { background: var(--rose-bg); color: var(--rose-800); }
.avatar[data-color="etic"]  { background: var(--amber-bg); color: var(--amber-800); }

/* Avec photo */
.avatar img{ width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
```

### Fallback rules
- 1 prénom + 1 nom : 2 initiales (Sikina M. → SM)
- 1 mot seul : 2 premières lettres (Lamiae → LA)
- Couleur background : selon `data-color` projet/groupe ou hash du nom

### Avatar stack (multi)

```html
<div class="avatar-stack">
  <span class="avatar sm" data-color="amani">BF</span>
  <span class="avatar sm" data-color="mhssn">CM</span>
  <span class="avatar sm">+3</span>
</div>
```

```css
.avatar-stack{ display: inline-flex; }
.avatar-stack .avatar{ border: 2px solid var(--surface-2); margin-left: -8px; }
.avatar-stack .avatar:first-child{ margin-left: 0; }
```

---

## 11. Skeletons (loading states)

Pattern : pulse opacité, jamais shimmer (plus calme).

```html
<div class="skeleton-card">
  <div class="skel skel-line w-60"></div>
  <div class="skel skel-line w-80" style="margin-top: 8px;"></div>
  <div class="skel skel-line w-40" style="margin-top: 8px;"></div>
</div>

<!-- Avatar -->
<div class="skel skel-circle w-32"></div>

<!-- Card complète -->
<div class="skel skel-card"></div>
```

```css
.skel{
  display: block;
  background: var(--surface-3);
  border-radius: 6px;
  animation: skel-pulse 1.5s ease-in-out infinite;
}
.skel-line{ height: 12px; }
.skel-circle{ width: 32px; height: 32px; border-radius: 50%; }
.skel-card{ height: 120px; border-radius: var(--radius); }
.w-40{ width: 40%; }
.w-60{ width: 60%; }
.w-80{ width: 80%; }

@keyframes skel-pulse{
  0%, 100%{ opacity: 0.4; }
  50%{ opacity: 0.7; }
}

@media (prefers-reduced-motion: reduce){
  .skel{ animation: none; opacity: 0.55; }
}
```

---

## 12. Tabs underline

Pattern Twisty : underline sur l'onglet actif, hover discret sur les autres.

```html
<nav class="tabs" role="tablist">
  <button class="tab active" role="tab" aria-selected="true">Vue d'ensemble</button>
  <button class="tab" role="tab">Tâches liées</button>
  <button class="tab" role="tab">Décisions</button>
  <button class="tab" role="tab">Historique</button>
</nav>
```

```css
.tabs{ display: flex; gap: 0; border-bottom: 1px solid var(--border); }
.tab{
  padding: 12px 20px;
  background: transparent; border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 14px; font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  transition: all .12s;
}
.tab:hover{ color: var(--text); }
.tab.active{ color: var(--text); border-bottom-color: var(--brand); font-weight: 600; }
.tab:focus-visible{ outline: 2px solid var(--brand); outline-offset: 2px; border-radius: 4px; }
```

---

## 13. Cards (variants)

### Default card

```html
<article class="card">
  <header class="card-header">
    <h3 class="card-title">Big Rocks S17</h3>
    <button class="btn-ghost card-actions"><svg><!-- chevron --></svg></button>
  </header>
  <div class="card-body">…</div>
</article>
```

```css
.card{
  background: var(--surface-2);
  border-radius: var(--radius);     /* 18px */
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid transparent;
  transition: box-shadow .12s, border-color .12s;
}
.card:hover{ box-shadow: var(--shadow-pop); }

/* Variants */
.card.hero{ border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-app); }
.card.panel{ box-shadow: none; border: 1px solid var(--border); }
.card.group-themed{ border: 1px solid var(--border); }
.card.compact{ padding: 14px; border-radius: var(--radius-sm); }

.card-header{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.card-title{ font-size: 15px; font-weight: 600; letter-spacing:-0.01em; margin:0; }
.card-sub  { font-size: 12.5px; color: var(--text-3); }
.card-actions{ margin-left:auto; display:flex; gap:6px; }
```

### Hero card (cockpit Carte Matin/Soir)

Border-radius 28-32px, padding 32px, ombre `--shadow-app`.

### Group-themed card (groupes societes)

Background tinté avec la couleur du groupe (ex : `--rose-bg` pour AMANI), border accent.

---

## 14. KPI tiles

```html
<div class="kpi tinted rose">
  <div class="kpi-label">Tâches ouvertes</div>
  <div class="kpi-value">28</div>
  <div class="kpi-sub">+5 vs S16</div>
</div>
```

```css
.kpi{
  padding: 16px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.kpi.tinted.rose   { background: var(--rose-bg);    border-color: rgba(217,109,62,.18); }
.kpi.tinted.sage,
.kpi.tinted.emerald{ background: var(--emerald-bg); border-color: rgba(61,115,99,.18); }
.kpi.tinted.sky    { background: var(--sky-bg);     border-color: rgba(119,144,174,.18); }
.kpi.tinted.amber  { background: var(--amber-bg);   border-color: rgba(184,130,55,.18); }
.kpi.tinted.violet { background: var(--violet-bg);  border-color: rgba(122,106,138,.18); }

.kpi-label{ font-size: 11.5px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.06em; }
.kpi.tinted.rose   .kpi-label{ color: var(--rose-800); }
.kpi.tinted.emerald .kpi-label{ color: var(--emerald-800); }
.kpi.tinted.sky    .kpi-label{ color: var(--sky-800); }
.kpi.tinted.amber  .kpi-label{ color: var(--amber-800); }
.kpi.tinted.violet .kpi-label{ color: var(--violet-800); }

.kpi-value{ font-size: 28px; font-weight: 700; letter-spacing:-0.03em; margin-top:4px; font-variant-numeric: tabular-nums; }
.kpi-sub  { font-size: 12px; color: var(--text-3); margin-top:2px; }
```

### Stat hero (variante grande, pour streak)

```html
<div class="stat-hero">
  <div class="stat-hero-value">12<span class="stat-hero-unit"> j</span></div>
  <div class="stat-hero-label">Boucle du soir consécutive</div>
</div>
```

```css
.stat-hero-value{ font-family: "Sol", "Fira Sans", sans-serif; font-weight: 100; font-size: 64px; letter-spacing: -0.04em; line-height: 1; color: var(--text); font-variant-numeric: tabular-nums; }
.stat-hero-unit{ font-size: 32px; font-weight: 300; color: var(--text-2); margin-left: 4px; }
.stat-hero-label{ font-size: 12px; font-weight: 500; color: var(--text-2); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
```

---

## 15. Search pill (header)

```html
<div class="search-pill" role="search">
  <svg class="ico-s" width="16" height="16"><!-- lucide search --></svg>
  <input type="text" placeholder="Rechercher tâches, projets, contacts…" aria-label="Recherche globale">
  <kbd>⌘K</kbd>
</div>
```

```css
.search-pill{
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  min-width: 320px;
}
.search-pill:hover{ border-color: var(--border-strong); }
.search-pill input{
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 13px; font-family: inherit; color: var(--text);
}
.search-pill input::placeholder{ color: var(--text-3); }
.ico-s{ color: var(--text-3); flex-shrink: 0; }
.search-pill kbd{
  font-family: ui-monospace, monospace;
  font-size: 11px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 5px;
  color: var(--text-3);
}
```

---

## 16. Command palette (⌘K)

Voir `08-patterns-techniques.md` section "Command palette" pour le pattern complet.

Le HTML/CSS de base est déjà dans `01_app-web/assets/app.css` lignes 678-720, à réutiliser.

---

## Synthèse — règles d'or

1. **Aucune couleur en dur** : toujours `var(--token)`.
2. **Font-variant-numeric tabular-nums** sur tout chiffre.
3. **Border-radius scale** : `12 / 18 / 24 / 28-32` (sm / default / lg / xl).
4. **Shadow scale** : `--shadow-card` (subtle), `--shadow-pop` (overlay), `--shadow-app` (hero).
5. **Transitions** : 120ms (snap), 200ms (smooth), respect `prefers-reduced-motion`.
6. **Focus visible** : `outline 2px solid var(--brand) offset 2px` partout.
7. **Tailles** : `sm` / `md` (default) / `lg` partout où ça fait sens.
8. **States** : default / hover / focus / active / disabled / loading documentés.
