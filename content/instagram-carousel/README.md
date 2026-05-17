# Clinical Edge — Instagram Carousel System

1080 × 1350 px slides (Instagram portrait). Exports at 2× = 2160 × 2700 px.

---

## Starting a new post

```
cp _template-dark.html post-XX.html
```

Then edit **only the copy** inside `post-XX.html`. Never touch the palette, depth system, footer, or type scale.

---

## Export workflow

```bash
# 1. Copy your post to index.html
cp post-XX.html index.html

# 2. Export all slides
npm run export          # outputs exports/slide-01.png … slide-N.png

# 3. Archive
mkdir -p exports/archive/post-XX
cp exports/slide-*.png exports/archive/post-XX/
cp post-XX.html        exports/archive/post-XX/

# 4. Restore index.html (optional — it's just a preview file)
```

---

## Template files

| File | Purpose |
|---|---|
| `_template-dark.html` | **Dark post starter** — full palette, depth system, 9 slides |
| `post-52.html` | **Reference implementation** — audit-verified, correct in every detail |

---

## Locked palette — real Clinical Edge app colors

```
--ce-bg-dark:         #111827   Main dark slide background
--ce-card-dark:       #1E2A3A   Dark cards / panels / footer
--ce-surface-elev:    #243040   Elevated dark surfaces (rare)
--ce-border-dark:     #2D3B4E   Borders, dividers, inactive dots
--ce-bg-warm:         #E7E1D6   Warm app background (warm posts)
--ce-card-warm:       #F0EDE6   Warm highlight cards on dark slides
--ce-card-warm-lt:    #FFFDF8   Lighter warm card variant
--ce-teal:            #0ABFBC   Brand teal — CTA, dots, bars
--ce-text-dark:       #F0EDE6   Heading text on dark surfaces
--ce-text-dark-muted: #A8C1CC   Body / secondary text on dark
--ce-text-warm:       #111827   Heading text on warm surfaces
--ce-text-warm-muted: #526174   Body text on warm surfaces
```

**NEVER use:** `#07142A`, invented navies, bright neon cyan, `#2DB9BE`, `#19C2D1`

---

## Background depth system (baked into template)

Every dark slide has three invisible layers:

| Layer | Effect | Value |
|---|---|---|
| Vignette | Edges pull slightly darker | `rgba(0,0,0,0.16)` radial gradient |
| Center lift | Barely-there warm ambient at upper center | `rgba(255,252,248,0.028)` radial gradient |
| Grain | Removes flat digital feel | SVG feTurbulence at 0.025 opacity |

The viewer feels the depth. Nothing looks designed.

---

## Design rules

**Background mode:**
- Dark post → use `--ce-bg-dark` (#111827) as slide bg
- Warm post → use `--ce-bg-warm` (#E7E1D6) as slide bg

**Warm-within-dark rule:**
- On dark slides, use `.card-warm` (#F0EDE6) for key pull-quote / highlight cards
- Text inside warm cards: `warm-h3` (#111827) + `warm-p` (#526174)

**Dark-within-warm rule:**
- On warm slides, use `.card` (#1E2A3A) for key panels
- Text inside dark cards: normal type scale (#F0EDE6 / #A8C1CC)

**Never:**
- Gradients on slide surfaces (depth system already handles this)
- Glow effects
- Cyberpunk / AI-startup aesthetics
- Moving content to the top (preserve centered emotional layout)
- Changing footer or counter structure

---

## Slide structure (9-slide default)

| Slot | Role | Pattern |
|---|---|---|
| 01 | Hook | h1 split + teal accent + swipe indicator |
| 02 | Beat 1 | teal-bar + h2 |
| 03 | Beat 2 | teal-bar + h2 + divider + p.large |
| 04 | Highlight | `.card-warm` with warm-h3 + warm-p |
| 05 | Beat 3 | teal-bar + h3 + divider + p.large |
| 06 | Punchline | h1 split, active badge |
| 07 | Beat 4 | teal-bar + h3 + divider + p.large |
| 08 | Product | teal-bar + h2 "Built for how nurses actually think." |
| 09 | CTA | label + h2 URL + divider + p.large + cta-btn-visual |

---

## Type scale

```
h1  140px / weight 900 / tracking -5px  →  #F0EDE6
h2   96px / weight 800 / tracking -3px  →  #F0EDE6
h3   72px / weight 700 / tracking -2px  →  #F0EDE6
p    40px / weight 400                  →  #A8C1CC
p.large  44px / weight 400              →  #A8C1CC
p.small  34px / weight 400              →  rgba(168,193,204,0.55)
.label   28px / IBM Plex Mono / 700     →  #0ABFBC (or rgba at 30% for muted)
```
