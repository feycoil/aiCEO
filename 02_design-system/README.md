# aiCEO Design System

> Design system for **aiCEO** — a personal CEO pilotage platform ("Plateforme de pilotage de l'agent aiCEO") for Feyçoil Mouhoussoune, steering the **Groupe TERRES ROUGES** portfolio (11 companies: Adabu, ETIC Services, ITH Data Center, AMANI Resorts/Properties, TAMARIN, SCI Start, SCI Mhssn-Boustane, LTM, Feirasin…).
>
> The product aggregates emails + Outlook calendar into a single **French-language** operational dashboard: projets, tâches (Eisenhower 4D matrix), décisions actées, agenda, contacts, revues hebdo.

## Source

The system is derived from two inputs:

- **Theme reference image** — `uploads/pasted-1776955682808-0.png` : the "**TWISTY**" dashboard mockup (an Income Tracker UI) the user provided as the originating *design spirit*. This is where the cream-card-on-lilac frame, the pill-tab nav, the signature bar chart, the ink-tooltip, and the coral-twist logo mark all come from. aiCEO is a French business-ops adaptation of that template.
- **Codebase** — `aiCEO_Agent/` (local mount): a vanilla-JS SPA shell (`assets/app.js` + `assets/data.js` + `assets/app.css`, theme literally named *"Twisty"*) with per-page HTML files (`index.html`, `projets.html`, `taches.html`, `decisions.html`, `agenda.html`, `contacts.html`, `revues/`). Text-heavy dashboard variant of the same DNA.
- The product is **single-surface**: one responsive web app. No mobile app, no marketing site, no separate docs site — so there is one UI kit.

## Index — what's in this folder

| File / folder           | Purpose |
|-------------------------|---------|
| `README.md`             | This file. Product context, content rules, visual foundations, iconography. |
| `SKILL.md`              | Agent Skills–compatible entrypoint. |
| `colors_and_type.css`   | Raw + semantic design tokens (colors, type scale, shadow, radius). |
| `assets/app.css`        | Theme variables only — drop-in for foundations. |
| `assets/product.app.css`| Full product stylesheet (`theme Twisty`, 895 lines) — source of truth. |
| `assets/app.js`         | Shell renderer (sidebar, topbar, command palette, toasts). |
| `assets/data.js`        | Seed data (companies, projects, tasks, decisions, events, contacts). |
| `fonts/`                | Webfont (Inter via rsms.me — loaded from CDN, no local files). |
| `preview/`              | Design-system preview cards (type, color, components). |
| `ui_kits/aiceo/`        | Pixel-recreation UI kit of the product SPA. |

---

## Content fundamentals

**Language.** All user-facing copy is **French** (`<html lang="fr">`). Dates, months, weekdays, currency, numerals all use French conventions (`fr-FR` locale, week numbers, "Semaine 17", "20–26 avril 2026"). Month names in shorthand: `janv.` `févr.` `mars` `avr.` `mai` `juin` `juil.` `août` `sept.` `oct.` `nov.` `déc.`

**Tone.** Operational, terse, action-led — the voice of a CEO's second brain talking back to them. No marketing gloss. No encouragement. Facts, quantities, deadlines, owners.

- *Intention de la semaine* — "Solder les honoraires Affejee (3ᵉ relance), confirmer le décalage tirage CA Bretagne au 30/04, et sécuriser le FF&E AMANI avant les RV matériaux à Mayotte lundi 27/04."
- *Task meta* — "Moi → Lamiae/compta · AUJOURD'HUI 17h", "→ Comptable · cette semaine"
- *Filter chip* — "🔥 Retard (3)", "★ Vital Few (5)"

**Person.** Direct "you" is rare; the user is "Moi" (first person). Delegations use the arrow: `Moi → Lamiae/compta`, `→ EC`, `→ Karim + Naïma + Naïr`. The greeting is proper-name: "**Bonjour Feyçoil 👋**".

**Casing.** Sentence case for titles. `SCREAMING CAPS` only for caption/label eyebrows (`TÂCHES OUVERTES`, `À FAIRE`, `EN RETARD`). Company codes are always uppercase short-codes (`AMP`, `TAM`, `SCIS`, `ETIC`).

**Ampersands / glyphs.** Unicode is embraced: `·` (middle dot) as a meta separator, `→` for delegation, `↻` for recurrent events, `✓` for signed/done items, `★` for Vital Few, `—` em-dash in titles ("Projet AMANI — Hôtel Pamandzi"), French guillemets `« »` in error messages, numeric ordinals with superscript: `3ᵉ relance`.

**Quantification everywhere.** Titles and subtitles carry counts:
- "7 projets identifiés depuis les emails et l'agenda"
- "${open} ouvertes · ${overdue} en retard · ${vital} vital few ★"
- "29 événements agenda · 80+ emails scannés"

**Emoji — YES, but scoped.** Emoji serve as category markers, never decoration:
- Projects each have one emoji icon (🏨 🏗️ 💻 🌴 💾 ⚖️ 🇪🇺 🏳️).
- Matrix quadrants: 🔥 Faire · 📅 Planifier · 📤 Déléguer · 🗑️ Abandonner
- Section heads: 🎯 Intention · 🪨 3 Big Rocks · ⚡ Priorités · 📅 Prochains rendez-vous
- Status: 🔥 Brûlant (project state)
- Greeting: 👋

The rule: **one emoji max per title, always at the front, always as semantic tag**. Never decorative. Never mid-sentence.

**Numbers** use French formatting (space-separated thousands, comma decimal) and **tabular-nums** are always on for counts, dates, times, and KPI values.

**Vocabulary (business-specific, keep these exact):**
- *Revue hebdo*, *Intention*, *Big Rocks* (3), *Vital Few* (80/20 star), *Matrice d'Eisenhower 4D* (Faire / Planifier / Déléguer / Abandonner), *4P* (Préparer → Réaliser), *Soldé*, *En retard*, *À venir*, *Récurrent*, *Chantier*, *COPIL*, *FF&E*, *HMA*, *BREEAM*, *CPI*, *FEDER*, *KYC*, *OC (Obligations convertibles)*, *Tirage* (bank draw), *SPV*, *RAF*, *MOE/MOA*, *AMO*.

---

## Visual foundations

### Overall vibe
**Warm, quiet, paper-like.** The product feels like a cream index-card desk organizer on a lilac felt surface — not a SaaS dashboard. No glow, no glass, no neon. Everything is matte, tactile, and grounded in warm neutrals with sparse muted accents.

### Frame
The app is never full-bleed. It sits in a **20px outer padding of lilac-grey** (`--bg: #a9adbe`) against which a **cream app card** (`--surface: #f5f3ef`, `border-radius: 28px`, big soft drop shadow `0 30px 80px -20px rgba(17,20,24,.25)`) floats. The sidebar is inside that card — same cream — separated only by a 1px border. No "navbar that goes to the edge" — the whole chrome is a floating object.

### Color
- **Neutrals dominate.** Cream (`#f5f3ef`), white cards inside cream (`#ffffff`), warm-gray pills (`#eeebe4`). Backgrounds are never pure white against the app.
- **Brand = ink black** (`#111418`), not the coral. The active nav item, the `.btn.primary`, the progress bar fills, the Big Rock numerals — all pure brand ink. Coral is an accent (overdue, Hot/Brûlant).
- **Accents are muted & earthy**: coral `#d96d3e`, ochre `#b88237`, sage `#3d7363`, powder blue `#7790ae`, dusty violet `#7a6a8a`. No pure blue, no pure green, no pure red. Each accent has a soft `-50` tint used as pill bg + a dark `-800` shade for pill fg.
- **KPI cards** use diagonal top-left tinted gradients (`linear-gradient(170deg, #fdecdf 0%, #ffffff 100%)`) — the tint is always on top, fading to white at the corner opposite.
- **Imagery** — none. There are no photographs, no hero images, no illustrations in the product. Color comes entirely from the palette + emoji.

### Type
**Inter variable** via `@import url('https://rsms.me/inter/inter.css')` + opentype features `cv11,ss01,ss03`. That's it — one family. Weights used: 400 / 500 / 600 / 700 / **800 (Extra-Bold, heavily used for display, card titles, KPI values, Big Rock text)**. Letter-spacing is always negative on display (`-0.035em` on `.display`, `-0.025em` on h1, `-0.015em` on card titles). Caption/eyebrow labels flip: `0.08–0.1em` tracking + uppercase + 10–11px. No serif. No monospace in UI — only in `<code>` mentions inside help text and in the ⌘K shortcut pill.

### Shape
- **Big radii**: 28px (app shell), 24px (cards), 18px (default), 14px (task rows), 12px (nav items, badges wrappers), 999px (pills, badges, buttons — always fully rounded).
- **Pills, not rectangles.** Buttons are pill-shaped (`border-radius: 999px`). Badges are pill-shaped. The KPI/search button in the topbar is a pill.
- Exception: company code chips are `border-radius: 6px` mini-tags (they read as code/labels).

### Shadow system
Layered, low-opacity, always on `rgba(17,20,24, …)` — never pure black.
- `--shadow-xs` — 1px only, for borders-that-aren't-borders
- `--shadow-card` — 1px + 30px blur drop-shadow for standard cards
- `--shadow-app` — the big 80px blur halo under the whole app
- `--shadow-hero` — fuller for the "Intention" hero card
- Inset shadows on KPIs? **No** — KPIs have tint gradients instead.
- Inset shadows on progress bars: yes — `inset 0 1px 2px rgba(17,20,24,.06)`.

### Borders
1px solid `--border` (`#e4e1d9`) on all cards, nav separators, input dividers. Hover deepens to `--border-2` (`#cfcbc1`). Never a 2px border as decoration. **The matrix cells get a 4px coloured top-stripe border** (`border-top: 4px solid var(--rose)` etc.) — this is the one exception and signals quadrant category.

### Layout rules
- Desktop: fixed 248px sidebar + fluid main, max-width 1500px, 28px / 32px page padding, 18px grid gap.
- Mobile (`max-width: 900px`): sidebar becomes off-canvas with backdrop; outer padding shrinks to 10px; app radius shrinks to 20px; grids collapse to single column.
- Sidebar is sticky on desktop, off-canvas on mobile via `.sidebar.open`.

### Backgrounds
- No hero images. No photography. No illustrations. No full-bleed imagery of any kind.
- Only gradients are: diagonal cream-to-white on the Intention hero card (`--gradient-hero`), diagonal tinted-to-white on KPI cards, and the brand gradient `--gradient-brand` (almost unused in the product — reserved for future hero).
- No textures, no patterns, no grain, no noise.

### Transparency & blur
Blur is reserved for overlay backdrops only:
- `.sidebar-backdrop` — `rgba(17,20,24,.5)` + `backdrop-filter: blur(3px)` (mobile sidebar open)
- `.palette-backdrop` — `rgba(17,20,24,.45)` + `backdrop-filter: blur(4px)` (command palette open)

No frosted-glass cards. No translucent sidebars.

### Animation
Fast, quiet, never playful.
- Standard transition: `.15s ease` (hover on nav, buttons, pills)
- Card hover: `transform: translateY(-2px)` + deeper shadow; `.2s ease`
- Button press: `transform: translateY(1px)`
- Palette open: `slideup` 0.2s (`translateY(8px) → 0`, `opacity 0 → 1`); backdrop `fadein` 0.15s
- Toast: `slideup 0.25s`, auto-dismiss at 2200ms with `fadeout 0.25s`
- Progress bar fill: `.3s ease` on width
- **No bounces, no springs, no elastic. No spinners.** `prefers-reduced-motion` drops everything to `0.001ms`.

### Hover / press states
- **Nav item hover** — `background: var(--surface-3)`, `color: var(--text)`
- **Active nav item** — pure ink-black background, white text, small drop shadow `0 6px 18px -6px rgba(17,20,24,.4)`
- **Button hover** (secondary) — background cream-deepens (`--surface-3`), border deepens (`--border-2`)
- **Button hover** (primary ink) — background shifts `#111418 → #1e2128`
- **Task row hover** — background `var(--surface-3)` (faint cream bed)
- **Project card hover** — `translateY(-2px)` + deeper shadow + border deepens
- **Focus** — `outline: 2px solid var(--text)` + `box-shadow: 0 0 0 4px rgba(17,20,24,.12)` (WCAG 1.4.11)

### Badges / chips
Two families:
- **Badges (pill)** — soft tinted bg + coloured fg + 1px border, with a **6px coloured dot prefix** (the `::before`). Variants: rose / amber / emerald / sky / indigo / violet / slate. Uppercase is **not** applied.
- **Company chips** — 6px-radius mini-tags with bespoke per-company tint (`.c-AMP`, `.c-TAM`, etc.) and the company's 3–5 letter code uppercase, bold.

### Signature widgets from the Twisty reference
These come straight from the source mockup — use them when designing data-viz or feature surfaces:

- **Vertical bar chart, lollipop-style.** Each "bar" is a faint 1px vertical grey track with a small blue dot (`--sky`) at the top. The **active day** gets a solid ink-black vertical bar instead, capped with an **ink pill tooltip** (`background: var(--text)`, white text, value like `$2,567`, positioned 12-16px above the bar top). Day labels are tiny circles at the bottom — inactive in warm-gray, **active day in solid ink-black circle with white letter**. This is the hero datavis language.
- **Dotted halftone upsell card.** "Unlock Premium Features" style card: muted sky/grey background (`--sky-50`) with a **subtle radial dot pattern** fading diagonally (CSS `radial-gradient(circle, #7790ae33 1px, transparent 1.5px) 0 0/14px 14px` masked with a diagonal fade). Copy is short + CTA is a full-width pill button with a `→` at the right edge.
- **Tick-bar sparkline** (Proposal Progress). Stat KPIs with a tiny **row of coloured vertical ticks** under each number — coral for active/accent, grey for default. Density ~40 ticks across 80px, 1px wide, 1px gap, varying heights. Reads like a ballot tally. Use for anything with a count against a baseline.
- **Contact row with role-tag + action.** Circular avatar (40px) · Name bold · small pill role tag next to name (Senior / Middle / Junior, tinted warm) · subtitle (speciality) below · far-right **(+) icon in a pale circle** as "add / follow / assign" action.
- **Pill-tab horizontal nav.** Centered horizontal text links (`Home Messages Discover Wallet Projects`), active item has a **2px ink underline centered below the label** (not a background pill). Plus a rounded search field + circular icon buttons + circular avatar on the right.
- **Date-picker pill.** Slim rounded-rect with calendar icon + date + chevron — sits inline in card headers.
- **Segmented week selector.** Compact pill button `Week ▾` — defaults to current scope, opens a dropdown.
- **Progress bars** — 8px tall, 999px rounded, track in warm-gray with inset shadow, fill in brand ink (not coloured).
- **Brand logo lockup** — 36×36 coral square, 12px radius. In the Twisty reference, it's an **actual coral "twist" SVG mark** inside the square (two curling comma-like forms, stacked). In the aiCEO product, it's simplified to the letter lockup "Ai". Both are acceptable — ship the twist mark for display surfaces, letter lockup for dense UI. Inner-shadow stamp `inset 0 -2px 0 rgba(0,0,0,.06)` + drop-shadow `0 4px 10px -4px rgba(217,109,62,.5)`.
- **Big Rock numerals** — 28×28 square-ish (10px radius), pure brand-ink, white numeral, small drop-shadow.
- **Task check** — 22×22 white box with 1.5px border; on checked, fills with emerald + white `✓`. Corner radius 7px.
- **Task star** — outline 18×18 lucide-style, fills coral when "Vital Few".
- **Floating display numeral.** The "+20%" on the Income Tracker is a `48–56px` `fw-800` tracking `-0.035em` numeral sat on its own, with a two-line 12px caption underneath. Use for hero stats.

---

## Iconography

### System used
**Hand-rolled inline SVG icons** with stroke-based outlines — matching the **Lucide / Feather** style (24×24 viewBox, `stroke: currentColor`, `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`). The product does NOT use an icon font, sprite, or Lucide package — every icon is written inline as an SVG string inside the JS map (`NAV_ICONS` in `assets/app.js`). The widget component (`revue-2026-W17-widget.jsx`) uses actual `lucide-react` imports (`CheckCircle2`, `Circle`, `Star`, `Target`, `Calendar`, `TrendingUp`, `Mountain`, `ClipboardCheck`, `Building2`), confirming Lucide is the reference set.

**For our use:** link Lucide from CDN or import `lucide-react` — same visual output, same stroke weight (2), same round joins. See `ui_kits/aiceo/Icon.jsx` for the thin wrapper we ship.

### Specific icons in the product
Nav: dashboard (grid) · projects (folder) · tasks (check+rect) · decisions (doc+lines) · reviews (calendar) · agenda (clock) · contacts (users) · search (magnifier) · hamburger (3 lines).

Inline in content: star (Vital Few), check-circle (done), circle (todo), alert-circle (overdue banner), document+fold (review link), rect-grid (widget link), arrow-right (ghost link).

### Emoji as icons
Emoji are used **in addition to** SVG icons, specifically for:
1. **Project icons** — each project row/card carries one emoji (🏨 AMANI, 🏗️ SCI Start, 💻 ETIC, 🌴 SCIMB, 💾 ITH, ⚖️ Honoraires, 🇪🇺 FEDER). These display on a 44×44 soft-tinted rounded square.
2. **Matrix quadrants** — 🔥 📅 📤 🗑️ — prefix the quadrant title.
3. **Section headings** — 🎯 🪨 ⚡ 📅 prefix card titles on the dashboard.
4. **Status labels** — 🔥 Brûlant, 🎂 birthday events, 👤 Personnel filter chip, ⚡ QuickSync, 🏨 🏗️ etc.

**Rule:** emoji only where a category or project identity is being labeled. Never as decoration within body copy.

### Unicode glyphs (non-emoji)
These appear as typographic icons in meta strings and should be preserved verbatim:
- `·` — middle dot separator in task metadata
- `→` — delegation / action chain arrow
- `↻` — recurrent event marker
- `✕` — close / clear filter
- `↗` — external link (Outlook)
- `★ / ☆` — Vital Few (also available as SVG)
- `▲ / ▼` — KPI delta up/down
- `✓` — done
- French quotes `« »`, en-dash `–`, em-dash `—`.

### Assets we ship
- `assets/logo.svg` — the coral "Ai" lockup, redrawn from the product's DOM structure.
- No other bitmap logos, no partner logos, no illustrations. The product ships none.

---

## Design system–level rules to enforce in new designs

1. **Start from the frame.** New interfaces for aiCEO should wrap in the lilac-padded cream app shell (28px radius, big drop shadow). If building a full-bleed view (slide, poster) drop the outer padding but keep cream as the canvas background.
2. **Ink, not coral.** Primary actions, active nav, progress fills, big numerals are all `--text` (ink #111418). Coral is an alarm colour + the logo stamp.
3. **Stay in French.** All strings in French. Use the product's vocabulary.
4. **Quantify.** Titles carry counts. Subtitles describe scope in numbers.
5. **Pill buttons, soft cards, tight tracking, heavy weight.** 800-weight display type + large negative tracking is the house signature.
6. **Muted accents, tinted KPIs.** Every KPI card gets a diagonal top-left tint to white gradient in one of the six accent families.
7. **One emoji per title.** As category tag, always at the front.
8. **Lucide (stroke-2, round) icons only.** Never flip styles mid-interface.
