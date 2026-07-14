# Clinical Edge — Design System Spec

Target system that resolves every finding in `audit.md`. Written to be executed one
module at a time by an implementing model **without further judgment calls** — where a
choice existed, it has been made here. Values are exact; rules are enforceable.

North star: the Instagram carousel system (`content/instagram-carousel/_template-dark.html`)
— dark, editorial, confident, restrained. Mono uppercase eyebrows, one accent used
sparingly, warm cards as counterpoint on dark, typography does the hierarchy work.

Ratified decisions (signed off 2026-07-14):
1. **Marketing conforms to app tokens.** The legacy `#0B1F2A/#112936/#00C2D1` palette is retired.
2. **Purple `#8B5CF6`/`#7c4de6` is eliminated; gold `--ce-gold` absorbs it** (Shift Challenge accent).
3. **ICU Drips' 8-color category system is semantic — formalized as named tokens.**
4. **`#A8C1CC` is promoted to `--ce-text-light-body`** (canonical body-on-dark, per Instagram template).

---

## 1. Color tokens and usage rules

`frontend/src/styles/tokens.css` remains the single source of truth. **No color may
appear in any stylesheet or inline style unless it is a `var(--ce-*)` reference**,
with two exceptions: pure `#fff`/`#000` inside SVG artwork, and `rgba()` alpha-blends
listed in §1.6.

### 1.1 Tokens to ADD to tokens.css (ratifying colors already in the codebase — no new hues)

```css
/* ── Text (addition) ── */
--ce-text-light-body: #A8C1CC;  /* body copy on dark navy — canonical per IG template */

/* ── Warm surfaces (additions — unify Rhythm Lab's local fork) ── */
--ce-warm-mid:  #F0EDE6;  /* mid warm surface (Rhythm Lab sidebar); same value as --ce-text-light, distinct role */
--ce-warm-deep: #E8E3D8;  /* deep warm surface (Rhythm Lab wells) */

/* ── ICU Drips category accents (formalized from icu-drips.css:22–54) ── */
--ce-cat-vasopressor:    #0ABFBC;
--ce-cat-inotrope:       #D4785A;
--ce-cat-sedation:       #4EAD8A;
--ce-cat-antiarrhythmic: #7B7FC4;
--ce-cat-anticoag:       #B07040;
--ce-cat-vasodilator:    #3B9EC9;
--ce-cat-diuretic:       #5B8AB0;
--ce-cat-glycemic:       #C4A035;
```

`icu-drips.css` re-points its `--id-cat-accent` assignments at these tokens (values
identical — zero visual change). Category accents may render **only** as: eyebrow
text, 2–3px left-edge bars, and effect-chip borders. Never backgrounds, never floods,
never buttons.

### 1.2 Accent roles (the rules that were never written down)

| Token | Role | Allowed uses | Forbidden uses |
|---|---|---|---|
| `--ce-teal` `#0ABFBC` | THE brand accent | Eyebrows, links, focus rings, primary-button fill (compact buttons only), active states, small dots/bars | Large floods (any filled area taller than a button), body text, backgrounds of content cards, glows |
| `--ce-teal-deep` `#0A8F8D` | Teal on warm surfaces; hover state of filled teal | Teal text on warm bg; `:hover` of primary buttons | Anything on dark navy (contrast too low) |
| `--ce-gold` `#D4A84B` | The counterpoint accent: practice, pearls, "watch" | Shift Challenge feature accent, clinical-pearl eyebrows, monitor/watch badges, secondary highlights | Never adjacent to urgency-MODERATE amber in the same component (they read as one) |
| `--ce-blue` `#4da3ff` | Informational status ONLY | Offline notices, info banners, SBAR "Situation" label | Section accents, buttons, links, decorative use. If a use isn't a status/info message, it isn't blue. |
| `--ce-urgency-*` | Clinical urgency semantics ONLY | Urgency badges, urgency dots, quiz verdicts (see §6.7) | Decoration, section coding, marketing chips |

**The one-accent rule:** any single screen region (a card, a panel, a section) uses at
most ONE accent color plus neutrals. Hierarchy comes from type scale and spacing, not
from adding a second hue.

**Confirmation states (ratified 2026-07-14 — save/copy/apply "it worked" feedback):**
There is no success color. Success is not a clinical semantic in this product, and a
green success token would re-import the deleted `#1FBF75` family and collide with
urgency-LOW's meaning. Confirmation renders in the **teal family, one §1.6 step up**
from the control's resting state, **plus a mandatory non-color signal** (glyph swap
`⎘ → ✓`, or label change `Save → Saved`) — the non-color signal carries the meaning
(WCAG 1.4.1); the teal step is reinforcement only. Specifics:
- Text/glyph color: `--ce-teal` on dark navy, `--ce-teal-deep` on warm surfaces.
- Tinted controls: resting `0.04` bg / `0.22` border → confirmed `0.10` bg / `0.30`
  border (§1.6 steps; already implemented in Copilot's Save Case — that is the
  reference pattern for every module).
- Transient confirmations (copy) revert after ~1.5–2s; persistent ones (saved) hold
  until state changes.
- Never urgency tokens, never gold, never any green. Applies to every module with
  save/copy/apply actions — not decided per module.

### 1.3 Text tokens (complete set after additions)

| Token | Value | Use |
|---|---|---|
| `--ce-text-dark` | `#111827` | Headings on warm |
| `--ce-text-mid` | `#2E3B4A` | Body on warm |
| `--ce-text-muted` | `#526174` | Secondary on warm |
| `--ce-text-dim` | `#7F99A5` | Tertiary/labels, both surfaces |
| `--ce-text-light` | `#F0EDE6` | Headings on dark |
| `--ce-text-light-body` | `#A8C1CC` | **Body on dark** (new) |
| `--ce-text-light-sec` | `#94A3B8` | Dimmer secondary on dark: placeholders, disabled, timestamps |

**Gray-soup consolidation map** — every off-token gray migrates to its nearest token.
This IS a (subtle) visual change; it is intended and approved:

| Stray value(s) | Replace with |
|---|---|
| `#8A9BA8`, `#9AA8B2`, `#7A8D9A`, `#6A7D8A`, `#9AABBA`, `#8096A0` | `var(--ce-text-dim)` |
| `#3D5166`, `#556B7A`, `#4A6675`, `#3A5A6A`, `#3D5E6E` | `var(--ce-text-muted)` |
| `#4A6978`, `#3A5566`, `#5A7A8A`, `#6A8A9A`, `#5D687C`, `#7B8494`, `#A8B3C3` | `var(--ce-text-dim)` on dark, `var(--ce-text-muted)` on warm |
| `#BCCDD6`, `#B0B8C4`, `#A8C1CC`-lookalikes | `var(--ce-text-light-body)` |
| `#E8E4DC` (index.css body), `#F8FBFC` (all uses) | `var(--ce-text-light)` |
| `#C4BDB5` (chip borders on warm) | `var(--ce-warm-line)` |
| `#07111C` | `var(--ce-navy-900)` |
| Reference Hub golds `#9A7020 #7A5A10 #8A6010 #4A3800 #B07020 #C08030 #5A3D08`, shared `#8A6A22` | `#8A6A22` becomes the single "gold-on-warm" — ratify as `--ce-gold-deep: #8A6A22`; all others replace with it |
| ICU/RefHub local reds `#D97C7C #b05050 #C84444 #B84040 #8A3030 #C06B6B`, App `#E96B6B` | `var(--ce-urgency-high)` on warm, `var(--ce-urgency-high-dark)` on dark |
| Rhythm Lab verdicts `#2D7A56` / `#B94040` | `var(--ce-urgency-low)` / `var(--ce-urgency-high)` |
| App section accents `#e05572 #1FBF75 #F2B94B` and marketing chip colors `#fca5a5 #fbbf24 #86efac #c084fc #fb923c #fcd34d #e07a3a #22c55e #f59e0b #f97316 #ef4444 #DC2626 #D97706` | Removed entirely by §6.2 and §8.6 — no mapping, the pattern is deleted |
| `#8B5CF6`, `#7c4de6` | `var(--ce-gold)`; hover `var(--ce-gold-deep)` |
| Download.jsx locals `#0E2436 #103246 #0B1E2D #0E2E40 #162033 #F3F4F6 #E7E2D8 #a6a6a6` | Gradients → flat `var(--ce-navy-900)`; light grays → nearest warm/text token per the rows above |
| ICU pale surfaces `#F0F7F7 #E8F0F4 #BFCFDA #FFF8EE #0B2E2E` | **Backgrounds/surfaces only:** `rgba(10,191,188,0.06)` tint on warm-card (all four pales); `#0B2E2E` → `var(--ce-navy-700)`. **Usage decides, not the hex** (ratified 2026-07-14): when `#E8F0F4` or `#BFCFDA` appear as *text on dark* (e.g. ICU Drips hero-card / compare-pair drip names), map by text role instead — `#E8F0F4` → `var(--ce-text-light)` (heading), `#BFCFDA` → `var(--ce-text-light-body)` (secondary, consistent with the `#BCCDD6`-lookalike row). Same principle applies to any future hex-collision between a surface row and a text usage. |
| Rhythm Lab `#4E9E78`/`#4E7C70` "sinus green" | Keep — ratify as `--ce-cat-sinus: #4E7C70` (Rhythm Lab rhythm-family accent, same rules as §1.1 category accents; replace `#4E9E78` occurrences with it) |
| Rhythm Lab dark golds `#8B6914 #1a1208`, `#8B7EC0`, `#C09030` | `var(--ce-gold-deep)` / `var(--ce-navy-900)` / `var(--ce-cat-antiarrhythmic)` / `var(--ce-gold)` |

### 1.4 Unused-token disposition

| Token | Verdict | Rationale / enforcement |
|---|---|---|
| `--ce-navy-800` `#0C1E2C` | **DEPRECATED** | No consumer, no role left once marketing conforms. Mark `/* @deprecated — do not use */` now; delete after marketing migration ships. |
| `--ce-blue` | **KEPT** | Earns the "informational status" role (§1.2). App.jsx offline notice + SBAR Situation already consume it. |
| `--ce-urgency-high/mod/low` `-bg -line -dark` (9 tokens) | **KEPT — must gain consumers** | `App.jsx URGENCY_STYLES` (lines 46–52) rewires to `var()` references (§8.2). Quiz verdicts consume them (§6.7). |
| `--ce-text-light-sec` | **KEPT, narrowed** | Placeholders/disabled/timestamps only; body copy moves to `--ce-text-light-body`. |
| Everything else in tokens.css | KEPT as-is | |

### 1.5 The urgency system (clinical semantics — LOCKED)

On warm surfaces: HIGH `--ce-urgency-high/-bg/-line`, MODERATE `--ce-urgency-mod/…`,
LOW `--ce-urgency-low/…`. On dark: the `-dark` text variants over
`rgba()` tints of the same hue. These colors mean urgency and ONLY urgency, everywhere
— marketing included. The desaturated clinical values are a feature (no alarm fatigue),
not a limitation; marketing must not "juice" them.

### 1.6 Permitted rgba() derivations

Alpha-blends are allowed only of these bases, at these steps:
`--ce-teal` base `10,191,188` / `--ce-gold` base `212,168,75` / `--ce-blue` base
`77,163,255` / urgency bases per tokens.css / white `255,255,255` / black `0,0,0`.
Steps: 0.04, 0.06, 0.08, 0.10, 0.12, 0.16, 0.22, 0.30. Nothing else. (This legalizes
the existing tint conventions while killing hand-mixed one-offs like `rgba(0,194,209,…)`.)

---

## 2. Typography

**Fonts: Inter (sans) + IBM Plex Mono (mono) — already loaded, already tokens
(`--ce-font-sans`, `--ce-font-mono`).** Note: CLAUDE.md's "Syne / DM Sans / DM Mono"
predates the shipped UI; the code loads Inter/Plex globally and the Instagram north
star is Inter/Plex. This spec ratifies Inter/Plex. *(Flag to Mohamed: update CLAUDE.md's
font row when convenient — do not switch fonts.)*

### 2.1 Type scale (use the `--ce-fs-*` tokens; add none)

| Level | Size | Weight | Tracking | Family | Use |
|---|---|---|---|---|---|
| Display (marketing hero only) | `clamp(38px, 6vw, 64px)` | 800 | −0.03em | Inter | One per marketing page |
| H1 | `--ce-fs-h1` clamp(24–32) | 800 | −0.04em | Inter | Module title |
| H2 | `--ce-fs-h2` 22 | 700 | −0.03em | Inter | Section heading |
| H3 | `--ce-fs-h3` 17 | 700 | −0.02em | Inter | Card title |
| Lead | `--ce-fs-lead` 15 | 400 | 0 | Inter | Intro paragraph |
| Body | `--ce-fs-body` 14 | 400 | 0 | Inter | line-height 1.65 |
| Body-sm | `--ce-fs-body-sm` 12 | 400 | 0 | Inter | Dense/secondary |
| Caption | `--ce-fs-caption` 11 | 400–500 | 0 | Inter or Mono | Timestamps, legal |
| Eyebrow | `--ce-fs-eyebrow` 10 | 700 | `--ce-track-eyebrow` 0.12em, UPPERCASE | **Mono** | Labels, categories |

**Weight rules:** 400 body · 500 UI labels/links · 600 inline emphasis · 700
headings/buttons/eyebrows · 800 H1/Display only · **900 never** (in-app). No weight
below 400. Italic only for quoted scenario text and the Closing pull-quote.

**The eyebrow is the system's signature.** Every section/card label is: IBM Plex Mono,
10px, 700, uppercase, 0.12em tracking, in the region's single accent color. Never an
icon, never an emoji, never a sparkle. (This convention already exists everywhere —
keep it exactly; normalize stray letter-spacings of 0.5px–2.5px to the token.)

---

## 3. Spacing, radius, elevation, motion

- **Spacing:** 4px base, existing `--ce-sp-*` tokens (4…40). Section vertical rhythm:
  64px between page sections (desktop), 40px (mobile). Card internal padding: 20px
  (dense: 14px). Replace one-off paddings to the nearest token.
- **Radius — exactly four values:** `--ce-r-sm` 4 (badges, chips, inputs) ·
  `--ce-r-md` 8 (cards, buttons, panels — the default) · `--ce-r-lg` 12 (hero cards,
  modals, the app frame) · `--ce-r-pill` 999 (marketing hero eyebrow badge ONLY) ·
  plus `50%` for true circles. **Every other radius value (1,2,3,5,6,7,9,10,11,14,16,
  18,20,100) migrates to the nearest of the four.**
- **Elevation — exactly three shadows:** `--ce-shadow-card`, `--ce-shadow-float`,
  `--ce-shadow-hero` (already tokens). **Shadows are always neutral black — a shadow
  containing an accent color (teal glow) is banned.**
- **Motion:** `--ce-dur-fast/base/slow` + `--ce-ease-*` only. Entrance = existing
  `ce-fade-in`/`ce-slide-up` utilities (≤8px travel, ≤220ms). **Banned:** infinite
  loops (float, pulse, glow), parallax, hover `translateY` on buttons, anything > 400ms.
  Reduced-motion overrides already exist in tokens.css — keep.

---

## 4. Component specs

### 4.1 Page header (ONE recipe, all modules)
Sticky, `background: var(--ce-navy-header)`, `backdrop-filter: blur(20px)` (ratified),
`border-bottom: 1px solid var(--ce-line-dark)`, no gradient overlay, no box-shadow.
Content: CE logo (30px, `fill: var(--ce-teal)`) + wordmark ("Clinical Edge" 15px/700
`--ce-text-light`, module name under it as eyebrow in `--ce-text-dim`) left; `.ce-back-link`
("← All tools") right. **ABG Lab conforms to this** (logo added, back link moves right).
Marketing pages use the same header with "Open App" as a compact primary button instead
of the back link.

### 4.2 Buttons
| Variant | Spec |
|---|---|
| Primary | Fill `--ce-teal`, text `#111827` (via `--ce-text-dark`), radius `--ce-r-md`, padding 10px 22px, 13px/700 Inter, `box-shadow: none`. Hover: fill `--ce-teal-deep`. Active: none (no transform). Disabled: fill `rgba(10,191,188,0.08)`, text `--ce-text-light-sec`. |
| Primary-gold (Shift Challenge only) | Same geometry; fill `--ce-gold`, text `--ce-text-dark`. Hover: `--ce-gold-deep` fill with text `--ce-warm-card`. |
| Secondary | Transparent; border 1px `--ce-line-navy` (dark) / `--ce-warm-line` (warm); text `--ce-text-light-body` / `--ce-text-muted`. Hover: border-color `rgba(10,191,188,0.30)`, text one tier brighter. |
| Text/link | No border; `--ce-teal` on dark, `--ce-teal-deep` on warm; underline on hover only. |
| Destructive | Text-only, `--ce-urgency-high` (warm) / `--ce-urgency-high-dark` (dark). Confirm state may fill `--ce-urgency-high-bg`. |
Focus (all): `outline: 2px solid var(--ce-teal); outline-offset: 2px` (matches existing
`.ce-interactive-card` convention). **Banned on buttons:** glows, gradients, translateY,
scale > pressed `.ce-pressable` (which is allowed).

### 4.3 Cards
| Variant | Spec |
|---|---|
| Warm content card | `--ce-warm-card` bg, 1px `--ce-warm-line` border, radius `--ce-r-md`, `--ce-shadow-card`, padding 18–20px. Optional single accent: 3px left border. |
| Dark card | `--ce-navy-700` bg, 1px `--ce-line-navy` border, radius `--ce-r-md`. Elevated/hover: `--ce-navy-600`. |
| Hero/feature card | Either surface, radius `--ce-r-lg`, `--ce-shadow-hero` (dark) or `--ce-shadow-float` (warm). Max one per screen. |
Accent placement on cards: left border or eyebrow color — never top border (that's
the retired marketing pattern), never tinted card backgrounds except urgency badges
and ≤0.06-alpha accent tints. Interactive cards use existing `.ce-interactive-card` /
`.ce-card-lift` utilities — no bespoke hovers.

### 4.4 Badges & chips
Status/urgency badge: mono eyebrow type, `--ce-r-sm`, tint bg (0.10) + line border
(0.22–0.30) + solid text, all three from ONE token family. Dot (6–7px circle) optional.
Effect chips (ICU Drips): current pattern is canonical — mono 11px, `--ce-r-sm`,
neutral border. Input chips (Copilot "Try asking"): transparent, 1px `--ce-warm-line`
border, `--ce-text-muted`, radius `--ce-r-sm`. **Pills only on the marketing hero eyebrow.**

### 4.5 Panels & disclosures
`ClinicalTrustPanel` is the canonical disclosure: quiet border, eyebrow summary,
chevron toggle. Any new expand/collapse copies its anatomy. Info banners: 3px left
border in the status color (`--ce-blue` info, urgency tokens for warnings), tint bg
0.06, radius `--ce-r-md`, mono eyebrow tag (e.g. `OFFLINE`) + body text. The App.jsx
offline notice (lines 1053–1076) is already the reference implementation.

### 4.6 Tables (Reference Hub)
Header row: eyebrow type in `--ce-text-muted`, bottom border `--ce-warm-line`. Rows:
`--ce-fs-body-sm`, 10px vertical padding, hairline separators, no zebra striping, no
row shadows. Numeric columns: IBM Plex Mono.

### 4.7 Empty & loading states
Empty: eyebrow (`NO SAVED CASES`) + one body-sm sentence in `--ce-text-dim`. No
illustrations, no emoji, no "Nothing here yet! 🎉".
Loading: the existing 5-bar equalizer (teal, quiet) + ONE static mono caption:
**"Thinking it through…"** — the four rotating `LOADING_PHASES` strings are deleted
(App.jsx:59–64). Streaming preview: keep, but cursor blink is the only animation.

### 4.8 Quiz verdicts (Rhythm Lab + ICU Drips, unified)
Correct: text `--ce-urgency-low`, bg `--ce-urgency-low-bg`, border `--ce-urgency-low-line`.
Incorrect: text `--ce-urgency-high`, bg `--ce-urgency-high-bg`, border `--ce-urgency-high-line`.
Glyphs ✓/✗ allowed (functional, not decorative). Same treatment in both modules.

---

## 5. BANNED PATTERNS (enforceable — reject any diff that reintroduces one)

1. **No emoji or decorative glyphs** in UI or copy. Functional glyphs allowed: ✓ ✗ ← → › ▲ ▼ ⌘. Kill: `✦` (AbgLabModule.jsx:112 → mono `PEARL` eyebrow), `✎` (App.jsx:416 → text button "Note").
2. **No "AI-powered", "Powered by", "not another AI chatbot", or any sentence that mentions AI/chatbots to distance itself from them.** State capability plainly. (Privacy/Support may say "uses a large language model" once, in the FAQ answer body.)
3. **No radial-gradient glow blobs, under-card glows, corner glows, or accent-colored box-shadows.** Anywhere.
4. **No macOS window chrome** (traffic-light dots) on mock UI.
5. **No infinite animations**: float, pulse, glow, shimmer. (Loader bars/cursor during an actual pending request are exempt.)
6. **No linear-gradient backgrounds** on headers, heroes, or buttons. Flat token colors only. (The IG template's baked-in vignette is print art, not UI chrome.)
7. **No glassmorphism beyond the ratified header blur.** No blurred cards, no frosted panels.
8. **No borderTop-accent cards** and no grids of ≥3 identical accent cards. If three items share a skeleton, render them as an editorial list (Home-hub pattern) or numbered hairline grid (Landing "Problem" section pattern — that one is good).
9. **No hex/rgb literals outside tokens.css** except §1.6 alpha steps and SVG `#fff`/`#000`.
10. **No border-radius outside {4, 8, 12, 999, 50%}.**
11. **No new font families, no weight 900, no font-size outside the scale.**
12. **No default-palette Tailwind hues** (the `#fca5a5`/`#fbbf24`/`#86efac`/`#c084fc`/`#fb923c` family) — if a color isn't a token, it doesn't ship.
13. **No rotating/fake loading narration.** One state, one message.
14. **No urgency colors for non-urgency meaning, and no non-token colors for urgency.**
15. **No centered hero with badge+headline+subhead+two-buttons+floating-mock stack.** Marketing heroes are left-aligned editorial (see §8.6).
16. **No rally-cry triplets** ("Think clearer. Move faster. Feel more confident.") in product or marketing copy.

---

## 6. Per-module execution notes

Each block is self-contained; execute as an independent task. Zero-visual-change items
are marked ⚙ (mechanical); visible-change items are marked ★.

### 6.1 tokens.css ⚙
Add §1.1 tokens + `--ce-gold-deep: #8A6A22` + `--ce-cat-sinus: #4E7C70`. Mark
`--ce-navy-800` deprecated (comment only). Touch nothing else.

### 6.2 Copilot (App.jsx + index.css) ★
- `SECTIONS` (App.jsx:31–38): all six sections drop their per-section hues. New config: accent `var(--ce-teal-deep)` / bg `transparent` for ALL sections **except** "Possible concerns" and "Where this may be heading", which get accent `var(--ce-gold-deep)` / bg `rgba(212,168,75,0.06)`. SectionCard keeps its 3px left border + eyebrow; the accent now comes from these two values only. Closing pull-quote: unchanged (teal). 
- `URGENCY_STYLES` (46–52): rewire every literal to its `var(--ce-urgency-*)` token ⚙.
- `LOADING_PHASES` (59–64): replace with single string per §4.7 ★.
- Saved-case icon buttons (413–417): one shared color `var(--ce-text-dim)`; hover `--ce-teal`; delete-button hover `--ce-urgency-high-dark`. `✎` → text "Note" ★.
- Gray soup + `#E96B6B` + `#F2B94B` + `#1FBF75` + `#e05572`: migrate per §1.3 map ⚙/★.
- index.css:14 body color → `var(--ce-text-light)` ⚙.
- Radii: 5→4, 6→4 (chips/badges) or 8 (cards) by element class, 7→8, 10/11→8 ★(subtle).

### 6.3 ICU Drips ★
- Purple → gold per §1.2/§4.2 (css lines 1572, 2233–2234, 2291–2311, 2353–2355, 2466–2478, 2494). Challenge primary button = Primary-gold spec ★.
- `--id-cat-accent` assignments → `var(--ce-cat-*)` tokens ⚙.
- Local reds/golds/pales per §1.3 map ★(subtle).
- Verdicts already teal/red → §4.8 urgency tokens ★(subtle).

### 6.4 Rhythm Lab ★(subtle)
- `--surface-warm`/`--surface-warm-deep` → `var(--ce-warm-mid)`/`var(--ce-warm-deep)` ⚙ (values identical — this closes the "Phase 2 warm unification" TODO in rhythm-lab.css:14–16).
- Quiz verdict colors → §4.8. `#4E9E78`→`--ce-cat-sinus`; dark golds per map.
- CompareMode.tsx:16–17 (`#e05572`, `#1FBF75`) and rhythms.ts:1198–1201 urgency-ish colors → urgency tokens.

### 6.5 Reference Hub ★(subtle)
- Gold family → `--ce-gold-deep` per map. Grays per map. `#556B7A` → `--ce-text-muted`.
- Tables conform to §4.6 (mostly already do).

### 6.6 ABG Lab ★
- Header conforms to §4.1 (add logo+wordmark, move back link right).
- "Interpret ABG" flood button → Primary spec (compact, right-aligned next to Clear; no full-width teal flood).
- `✦` → mono `PEARL` eyebrow.

### 6.7 Home hub, Privacy, Support, Download ★
- Home hub: already canonical; only §1.3 gray migration ⚙.
- Privacy/Support: reword "AI-powered …" → "Clinical Edge Copilot is a clinical reasoning support tool for bedside nurses, built on a large language model." Gray/gold token migration ⚙.
- Download: gradients → flat `var(--ce-navy-900)` header/hero; local palette per map; keep App Store badge asset as-is (Apple brand rules) ★.

### 6.8 Marketing pages (Landing, QuickStart, Scenario) ★★ — full reskin, biggest job
- Delete each local `C = {...}` block; import nothing — use `var(--ce-*)` directly. Map: `bg→--ce-navy-900`, `card→--ce-navy-700`, `accent→--ce-teal`, `textPrimary→--ce-text-light`, `textSecondary→--ce-text-light-body`, `muted→--ce-text-dim`, `subtle→--ce-text-dim`, `border→--ce-line-dark`, `borderAccent→rgba(10,191,188,0.22)`. Hover teals `#19D3E0/#19C2D1` → `--ce-teal-deep`.
- Hero (Landing): left-aligned editorial — eyebrow (mono, static dot, **no pulse**), Display headline (accent on ONE phrase max), lead paragraph, two §4.2 buttons. Delete: ambient glows, floating animation, under-card glow, window chrome. The mock response card stays (it's real product content) but becomes a §4.3 dark hero card, static, with chrome row = simple eyebrow "CLINICAL EDGE COPILOT" + hairline.
- Mock-card section accents: rebuild with the §6.2 scheme (teal + gold only) and real urgency tokens for badges — the marketing preview must show the product's actual colors.
- The four identical 3-card grids: keep at most ONE card grid; convert the rest to the numbered hairline-grid treatment (Landing lines 1480–1538 pattern) or editorial lists. Cut the two sections whose content is near-duplicate ("How It Helps You Think" vs "How It Thinks" — merge into one).
- Copy: delete all four "not generic AI / not another chatbot" constructions and both rally-cry triplets. Replacement voice: state what it does ("Structured clinical reasoning, in the same order a preceptor would walk you through it.").
- QuickStart/Scenario: palette map + §4.1 header + §4.2 buttons; QuickStart "Try:" pills → `--ce-r-sm` chips; Scenario urgency chips → urgency tokens.

---

## 7. DO NOT TOUCH

1. **Clinical content**: every drip description, rhythm criterion, ABG rule, reference value, scenario text, and the nine-section response format (CLAUDE.md). Design changes never rewrite clinical statements.
2. **Dosing-free guardrails**: all "not a dosing guide / no dosing / educational only" language and the Safety Note conventions — wording stays verbatim.
3. **ClinicalTrustPanel accessibility work**: `aria-expanded`, `aria-controls`, `useId`-generated ids, focus styling, `rel="noopener noreferrer"` external links (ClinicalTrustPanel.jsx). Restyle via clinicalTrust.css tokens only; never touch the JSX semantics.
4. **Analytics**: every `trackEvent` call, event name, and payload — including the ones inline in buttons being restyled. Move them with the markup; never rename or drop.
5. **Backend**: `POST /api/copilot`, prompts, `max_tokens: 1400`, streaming behavior — untouchable per CLAUDE.md.
6. **Parser contract**: `ALIAS_MAP`/section header parsing in App.jsx — restyling SectionCard is fine; parsing logic is not a design surface.
7. **localStorage keys** (`clinical_edge_history`, `clinical_edge_saved_cases`, `clinical_edge_mode`, `copilot_prefill`).
8. **PWA/service worker, vite.config.js, vercel.json, deployment config.**
9. **Reduced-motion blocks** in tokens.css.
10. **The CE logo SVG paths** and the App Store badge artwork.

---

## 8. Execution order (recommended)

1. §6.1 tokens.css additions ⚙ (unblocks everything)
2. §6.2 Copilot (flagship; establishes SectionCard + button + loading patterns)
3. §6.3 ICU Drips (purple kill + category tokens)
4. §6.4–6.6 Rhythm Lab, Reference Hub, ABG Lab
5. §6.7 small pages
6. §6.8 marketing reskin (largest, most visual, benefits from every pattern above existing first)

Verify each step: `cd frontend && npm run build` passes, then load the module in the
browser and confirm against this spec + `grep -rE '#[0-9a-fA-F]{3,8}' <touched files>`
returns only tokens.css and §1.6-legal values.
