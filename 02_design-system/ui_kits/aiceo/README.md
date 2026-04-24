# aiCEO UI kit

A single demonstration page (`index.html`) that exercises the entire design language on one canvas. Load `../../assets/product.app.css` (the real product stylesheet) so every new surface you build inherits the exact tokens, component classes, and media queries.

## What's shown
- **App shell** — 28px-radius cream card on lilac frame; 248px sidebar + sticky topbar
- **Sidebar** — coral twist-mark logo, ink-black active nav, count pills
- **Topbar** — breadcrumbs, search pill with ⌘K kbd, icon buttons, initials avatar
- **Page header** — display title with emoji greeting, subtitle with quantified context, action cluster
- **Intention hero** — cream→warm gradient card with eyebrow + 2-line greeting + prose + quantification chips, paired with 3 Big Rocks
- **KPI row** — 4 tinted KPI cards (rose / amber / emerald / sky)
- **Twisty chart** — the signature lollipop bar chart + 48px +20% display + ink tooltip
- **Segmented control** (Semaine / Mois / Trim.) and **project list** with emoji pills + status badges
- **Matrix 4D** — Eisenhower quadrants with coloured top-stripe borders, tasks, vital-few stars, overdue state
- **Team row** — name + role tag + (+) action, mimicking Twisty's "Let's Connect"
- **Dotted upsell** — halftone sky card with pill CTA
- **Tick-bar sparkline** — "Avancement décisions" stat block with 44 vertical ticks per column
- **Agenda strip** — time-pill + title + location + recurrence/owner badge

## Reuse rules
- Build new pages by copying the topbar + sidebar from this kit, then swapping the `.page` contents.
- Always include `<html lang="fr">` and keep strings in French.
- Never introduce new accent hues — pick from `--rose / --amber / --emerald / --sky / --violet` + their `-50` / `-800` pairs.
- Emoji only as category tags (first character of a title). Never decorative.
- Display weight is always `800` with negative tracking. Uppercase only for `.label` / `.overline` eyebrows.
