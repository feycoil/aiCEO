# Brand fonts (self-hosted)

aiCEO ships three typefaces, all self-hosted in this folder. No CDN required.

## Fira Sans — primary UI face
Workhorse face for all body, labels, titles, numerals, buttons, cards. Full weight set from 100 → 900:

| Weight | File |
|-------:|------|
| 100 Thin | `FiraSans-Thin.otf` |
| 200 ExtraLight | `FiraSans-ExtraLight.otf` |
| 300 Light | `FiraSans-Light.otf` |
| 400 Regular | `FiraSans-Regular.otf` |
| 450 Book | `FiraSans-Book.otf` |
| 500 Medium | `FiraSans-Medium.otf` |
| 600 SemiBold | `FiraSans-SemiBold.otf` |
| 700 Bold | `FiraSans-Bold.otf` |
| 800 ExtraBold | `FiraSans-ExtraBold.otf` |
| 900 Heavy | `FiraSans-Heavy.otf` |

Use ExtraBold (800) for display and card titles — it's the signature weight. Heavy (900) is rare, reserved for very large type. Book (450) is a hair heavier than Regular — useful for body copy that needs slightly more presence.

## Aubrielle — display script
Decorative script — `Aubrielle_Demo.ttf`, one weight. Reserved for heroic/emotional moments only:

- The greeting line ("Bonjour Feyçoil" on the dashboard)
- Intention eyebrows / section openers on hero cards
- Empty-state poetry
- Presentation covers and handwritten-feel callouts

**Never** use Aubrielle for UI, body, or under 36px. It has no bold. Minimum size is `--fs-script` (44px).

## Sol Thin — ultra-light display
`SolThin.otf`, one weight (100). Use sparingly for stylised display moments — huge KPI numerals, ultra-minimal subtitles, poster-like headers. Minimum 28px (hairline strokes disappear below that).

## Stack (from `colors_and_type.css`)

```
--font-sans:   "Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-script: "Aubrielle", "Apple Chancery", "Snell Roundhand", cursive;
--font-thin:   "Sol", "Fira Sans", sans-serif;
--font-mono:   ui-monospace, SFMono-Regular, Menlo, monospace;
```

## Migration note
The product codebase currently loads **Inter** from `rsms.me/inter/inter.css`. Design-system outputs must prefer Fira Sans (from this folder). For the product, plan a migration: swap the `@import` for the Fira Sans `@font-face` block in `colors_and_type.css` and replace the font stack.
