# aiCEO Design System — Agent Skill

> Load this when a user asks to design anything for **aiCEO**, the personal CEO pilotage platform for Feyçoil Mouhoussoune / Groupe Terres Rouges.

## Always do
1. **Read `README.md` first.** It is the single source of truth for the product, tone, and visual language. Do not skim. Pay special attention to: Content Fundamentals, Visual Foundations, Iconography, and the Twisty signature widgets section.
2. **Load the real stylesheet.** Every artifact must `<link rel="stylesheet" href="…/assets/product.app.css">` (theme "Twisty") — 895 lines of tokens and component classes. Use `colors_and_type.css` only when you need a standalone token-only sheet.
3. **French everywhere.** `<html lang="fr">`, all copy French, `fr-FR` dates, numeric thousands space-separated, decimal comma, month abbreviations `janv. févr. mars avr. mai juin juil. août sept. oct. nov. déc.`.
4. **Copy the UI kit frame.** Start from `ui_kits/aiceo/index.html` — it has the correct sidebar, topbar, and page-header chrome. Swap out the `.page` contents.

## Visual non-negotiables
- **Frame** — 20px lilac (`--bg #a9adbe`) padding around a 28px-radius cream (`--surface #f5f3ef`) app card with `--shadow-app`. Sidebar lives INSIDE the card.
- **Brand = ink black** (`#111418`). Coral is an accent + logo stamp only. Primary buttons, active nav, progress fills, Big Rock numerals — all `--text`.
- **Type** — Inter variable via rsms.me CDN; weights 400/500/600/700/**800**; `font-feature-settings: "cv11","ss01","ss03"`; `tabular-nums` always on counts/dates/KPIs; negative tracking `-0.025em → -0.04em` on display.
- **Palette** — neutrals dominate. Only 5 accents, each with `-50` / base / `-800`: rose, amber, emerald, sky, violet. No pure red/green/blue. No new hues.
- **Radius** — 28 shell · 24 card · 18 default · 12 nav/input · 14 task row · 999 pill.
- **Shadows** — low-opacity `rgba(17,20,24, …)`. Use the tokens `--shadow-card`, `--shadow-hero`, `--shadow-app`.
- **Emoji** — ONE per title, at the front, semantic tag only (🎯 🪨 ⚡ 📅 🔥 📤 🗑️ 🏨 🏗️ 💻 🌴 💾 ⚖️ 🇪🇺).
- **Icons** — Lucide stroke-2 round. No flips in style.

## Content patterns to reuse verbatim
- Greeting: "Bonjour Feyçoil 👋"
- Week header: "Semaine 17 · 20–26 avril 2026 — 29 événements agenda · 80+ emails scannés"
- Delegation: "Moi → Lamiae/compta"
- Overdue: red `AUJOURD'HUI 17h` in task meta
- Matrix titles: **🔥 Faire · 📅 Planifier · 📤 Déléguer · 🗑️ Abandonner**
- Company chips (always uppercase short-code): AMP · TAM · ETIC · SCIS · ITH · AMR · ADB · LTM · SCIMB · FEIR · TR

## Signature widgets (cross-reference `preview/`)
- **Twisty bar chart** — lollipop stems + blue dot, active day = ink bar with ink pill tooltip + white-on-ink day circle. See `preview/components-chart.html`.
- **Dotted halftone upsell** — sky-50 bg with 14px radial-dot grid fading diagonal; white pill CTA with right arrow. See `preview/components-premium.html`.
- **Tick-bar sparkline** — 44 vertical 1.5px ticks, rose tint for active portion, below a big 800-weight numeral. See `preview/components-tickbar.html`.
- **KPI tint** — `linear-gradient(170deg, <accent>-50 0%, #fff 100%)`. See `preview/components-kpi.html`.
- **Intention hero** — `--gradient-hero`, eyebrow + 2-line display greet + prose + chips, paired with 3 Big Rocks cards.
- **Matrix 4D cell** — white card, 4px top-stripe border in quadrant colour (rose / amber / sky / text-3).

## Don'ts
- No photography, illustrations, or hero images — the product has none.
- No frosted glass / translucent cards. Blur is reserved for `.palette-backdrop` + `.sidebar-backdrop`.
- No bounces, springs, elastic, or spinners. Transitions: `.15s ease` (hover), `.2s ease` (card hover `translateY(-2px)`).
- No emoji mid-sentence. No decorative icons. No uppercase in body copy.
- No new colours or radii — use the tokens.
- Don't call the brand "coral-first" — the brand colour is ink; coral is the stamp.

## Preview / UI kit index
- Foundations — `preview/colors-neutrals.html`, `colors-accents.html`, `colors-companies.html`, `type-scale.html`, `type-display.html`, `shadow-radius.html`
- Components — `preview/components-buttons.html`, `components-kpi.html`, `components-chart.html`, `components-tickbar.html`, `components-premium.html`, `components-tasks.html`
- Brand — `preview/brand-logo-icons.html`
- **Full UI kit** — `ui_kits/aiceo/index.html`
