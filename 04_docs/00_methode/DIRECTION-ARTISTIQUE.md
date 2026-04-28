# Direction artistique aiCEO — "Editorial Executive"

> *Note de cadrage design · 28/04/2026 · validée par CEO*
> **Owner** : agent Claude (subagent `designer`)
> **Statut** : Acté · ADR v11 (cf. DECISIONS.md)

---

## 1. Manifeste

> *Hybride entre la rigueur de Linear (raccourcis, structure, vélocité), la clarté éditoriale de Reflect/Granola (typographie, ivoire, ton premium discret), et la finesse Apple HIG (animations, micro-interactions, attention aux détails).*
>
> **L'identité visuelle d'aiCEO doit dire : « outil d'un CEO qui lit le Financial Times, pas d'un dev qui code la nuit ».**

### Références d'inspiration retenues

| Référence | Ce qu'on prend |
|---|---|
| **Reflect** (reflect.app) | Ivoire/cream backgrounds · typographie premium · clarté absolue |
| **Granola** (granola.ai) | Beige éditorial · IA discrète · cible exécutive · serif élégant titres |
| **Linear** (linear.app) | Rigueur · raccourcis Cmd+K · monochrome avec accent unique |
| **Apple HIG** | Animations cubic-bezier(.16,1,.3,1) · spatial design · simplicity = sophistication |

### Anti-références (à éviter)

❌ Notion (trop ludique, trop d'emojis décoratifs)
❌ Bloomberg Terminal (densité écrasante)
❌ Slack (couleurs saturées, ton casual)
❌ Trello / Asana (B2C coloré)
❌ Discord (gen Z casual)

---

## 2. Sept principes

1. **Le mot avant l'icône** — typographie hiérarchisée plutôt qu'iconographie. Une décision = un titre lisible.
2. **L'espace comme luxe** — densité moyenne, respiration entre cards. Padding hero 48px, cards 16-24px.
3. **La couleur comme accent** — palette neutre warm + UNE couleur primaire (violet) + 4 sémantiques.
4. **Le détail au pixel** — bordures 1px, radius progressif (8/12/14/20), ombres en 2 niveaux MAX.
5. **L'animation comme signature** — 120-400ms cubic-bezier(.16,1,.3,1), jamais bouncy.
6. **L'éditorial où c'est important** — Crimson Pro pour titres principaux, Inter pour corps, JetBrains Mono pour data.
7. **Pas d'emoji décoratifs** — exception : système de catégorisation sémantique (🎯 stratégique, ⚖️ décision, ⚡ alerte).

---

## 3. Tokens DS canoniques

### 3.1 Backgrounds (warm neutral)

```
--ivory-50:   #faf8f3   (page bg, défaut)
--ivory-100:  #f5f3ee   (surface secondaire)
--ivory-200:  #ebe7dc   (séparateurs, surface 3)
--paper:      #ffffff   (cards principales)
```

### 3.2 Texte (warm grayscale)

```
--ink-900:    #1a1612   (titres H1)
--ink-700:    #3d362c   (titres H2-H6, corps gras)
--ink-500:    #6b614f   (corps secondaire, meta)
--ink-300:    #a8a092   (subtle, captions)
--ink-100:    #d8d2c4   (disabled, placeholders)
```

### 3.3 Accent unique premium

```
--primary:      #463a54   (violet noir éditorial)
--primary-50:   #ece7f0   (badges, halo)
--primary-rich: #5d4d70   (hover variant)
```

### 3.4 Sémantiques (4 max + neutre)

```
--success:    #115e3c   (validation, accompli)
--success-50: #d6f3e6
--warning:    #92400e   (attention, à valider)
--warning-50: #fef3c7
--danger:     #9c2920   (bloquant, infirmé)
--danger-50:  #fde6e3
--info:       #1e5f9c   (neutre informatif)
--info-50:    #dceaf5
--rare:       #6b614f   (désactivé, archivé)
```

**REJETÉS** :
- ❌ Polychrome décoratif (cyan, magenta, turquoise)
- ❌ Gradients multicolores (Stripe-like)
- ❌ Couleurs néon ou saturées

### 3.5 Typographie

```
Titres H1-H2 (hero, sections importantes)
  font-family: "Crimson Pro", Georgia, "Times New Roman", serif
  font-weight: 600 (semibold) — jamais 700+
  letter-spacing: -0.015em (H1) / -0.01em (H2)
  line-height: 1.2 (H1) / 1.3 (H2)

Corps + sous-titres (H3-H6, paragraphes)
  font-family: "Inter Variable", -apple-system, "Segoe UI", sans-serif
  font-feature-settings: "ss01", "cv11", "tnum"
  line-height: 1.55 (corps) / 1.4 (small)

Mono (data, hash, code, IDs)
  font-family: "JetBrains Mono", "Cascadia Code", ui-monospace, monospace
  font-feature-settings: "calt", "ss01"
```

### 3.6 Échelle typographique (modular scale 1.25)

```
--text-xs:   11px   captions, meta
--text-sm:   13px   corps secondaire
--text-md:   14px   corps principal (DEFAULT)
--text-lg:   16px   sous-titre card
--text-xl:   20px   titre card
--text-2xl:  24px   titre section
--text-3xl:  32px   titre page
--text-4xl:  44px   hero exclusif
```

### 3.7 Espacement (8-grid strict)

```
--space-1:  4px    tight, icône-texte
--space-2:  8px    gap flexrow
--space-3:  12px   gap éléments mineurs
--space-4:  16px   padding card moyen
--space-5:  24px   padding section, gap cards
--space-6:  32px   padding hero standard
--space-7:  48px   padding hero premium
--space-8:  64px   breathing room exceptionnel
```

### 3.8 Élévations (2 niveaux MAX)

```
--elev-1: 0 1px 2px rgba(20,18,16,0.04)
          → cards courantes, inputs

--elev-2: 0 4px 12px rgba(20,18,16,0.06), 0 1px 2px rgba(20,18,16,0.04)
          → cards hover, modals, drawer ouvert
```

⚠️ **Jamais elev-3** — c'est un signal de mauvaise hierarchy.

### 3.9 Radius

```
--radius-sm:   6px    chips, badges, inputs
--radius-md:   10px   boutons, cards petites
--radius-lg:   14px   cards principales (DEFAULT)
--radius-xl:   20px   hero, modals, drawer
--radius-pill: 999px  badges pill, tags
```

### 3.10 Animations

```
Durations
  --motion-fast:    120ms   hover, focus
  --motion-medium:  200ms   transitions sections
  --motion-slow:    400ms   drawer, modal entrées

Easings
  --ease-out:       cubic-bezier(0.16, 1, 0.3, 1)   (Apple-like)
  --ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1)    (matériel)

INTERDIT : easing bouncy (valeurs négatives), durations > 500ms
```

### 3.11 Iconographie

```
Bibliothèque : Lucide (lucide.dev) — line icons monolignes
Tailles : 14 / 16 / 20 / 24 px
Stroke-width : 1.5px sur 20-24, 2px sur 14-16 (lisibilité)
Couleurs : héritent de currentColor

REJETÉS : Font Awesome (trop épais), Material Icons (trop Google),
emojis comme icônes principales (sauf catégorisation sémantique)
```

---

## 4. Composants types — application

### 4.1 Card hero (ex: synthèse exécutive)

```css
.card.hero {
  background: linear-gradient(135deg, var(--paper) 0%, var(--primary-50) 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-7);  /* 48px */
  box-shadow: var(--elev-1);
}
.card.hero h1 {
  font-family: "Crimson Pro", serif;
  font-size: var(--text-3xl);
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink-900);
}
```

### 4.2 Card standard

```css
.card {
  background: var(--paper);
  border: 1px solid var(--ivory-200);
  border-radius: var(--radius-lg);
  padding: var(--space-5);  /* 24px */
  box-shadow: var(--elev-1);
  transition: box-shadow var(--motion-fast) var(--ease-out);
}
.card:hover { box-shadow: var(--elev-2); }
.card-title {
  font-family: "Inter", sans-serif;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--ink-900);
  margin: 0 0 var(--space-3);
}
```

### 4.3 Pills monochromes

```css
.pill {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.pill-primary  { background: var(--primary-50); color: var(--primary); }
.pill-success  { background: var(--success-50); color: var(--success); }
.pill-warning  { background: var(--warning-50); color: var(--warning); }
.pill-danger   { background: var(--danger-50); color: var(--danger); }
.pill-info     { background: var(--info-50); color: var(--info); }
.pill-neutral  { background: var(--ivory-200); color: var(--ink-500); }
```

### 4.4 Boutons

```css
.btn-pri {
  background: var(--ink-900);
  color: var(--paper);
  border: 0;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--motion-fast) var(--ease-out);
}
.btn-pri:hover { opacity: 0.85; }

.btn-sec {
  background: var(--paper);
  color: var(--ink-700);
  border: 1px solid var(--ivory-200);
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--motion-fast) var(--ease-out);
}
.btn-sec:hover { background: var(--ivory-100); }
```

---

## 5. Migration progressive

| Sprint | Périmètre |
|---|---|
| **Maintenant (1h)** | Pilotage : 8 quick wins appliqués (ce commit) |
| **S7.5 Skeleton + perf (0.75 j)** | Refonte profonde DS Twisty pour app aiCEO (tokens, composants, animations) |
| **Phase 3 polish** | Audit final cohérence + ajustements |

---

## 6. Sources

- ADR v11 · Direction artistique Editorial Executive
- Audit UX/UI 28/04/2026 (recommandation R8 — Hierarchy renforcée)
- Mandat CEO 28/04 PM late : *"thème ou style premium très professionnel"*
- Inspirations : reflect.app, granola.ai, linear.app, Apple HIG
