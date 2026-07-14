# Clinical Edge Copilot — Current Design Token Audit
Read-only extraction. No code was changed. Source: `frontend/src/styles/tokens.css` (canonical `--ce-*` tokens) plus grep sweeps of `frontend/src` for hex/rgb/rgba/hsl values and `var(--ce-*)` consumption, dated 2026-07-14.

---

## A. Canonical Palette

Source of truth: `frontend/src/styles/tokens.css` (lines 6–96), the only `:root` block defining `--ce-*` tokens.

### Surfaces — navy shell

| Token | Value | Defined | Consumed (var() usage) |
|---|---|---|---|
| `--ce-navy-900` | `#111827` | tokens.css:8 | 4 uses — `App.jsx`, `reference-hub.css`, `abg-lab.css`/`AbgLabModule.jsx` (exact files not individually itemized by the grep tool, counted globally) |
| `--ce-navy-800` | `#0C1E2C` | tokens.css:9 | 0 — no `var(--ce-navy-800)` usage found anywhere in `frontend/src` |
| `--ce-navy-700` | `#1E2A3A` | tokens.css:10 | 5 uses |
| `--ce-navy-600` | `#243040` | tokens.css:11 | 2 uses |
| `--ce-navy-header` | `rgba(11, 31, 42, 0.97)` | tokens.css:12 | 2 uses |
| `--ce-line-dark` | `rgba(255, 255, 255, 0.07)` | tokens.css:13 | 3 uses |
| `--ce-line-navy` | `#2D3B4E` | tokens.css:14 | 8 uses |

### Surfaces — warm learning

| Token | Value | Defined | Consumed |
|---|---|---|---|
| `--ce-warm-bg` | `#E7E1D6` | tokens.css:17 | 6 uses |
| `--ce-warm-card` | `#FFFDF8` | tokens.css:18 | 13 uses |
| `--ce-warm-line` | `#D6D0C4` | tokens.css:19 | 21 uses |
| `--ce-warm-line-soft` | `rgba(17, 24, 39, 0.09)` | tokens.css:20 | 4 uses |

### Brand accents

| Token | Value | Defined | Consumed |
|---|---|---|---|
| `--ce-teal` | `#0ABFBC` | tokens.css:23 | 35 uses — heaviest-used color token in the system (component CSS files + tokens.css's own utility classes) |
| `--ce-teal-deep` | `#0A8F8D` | tokens.css:24 | 15 uses |
| `--ce-gold` | `#D4A84B` | tokens.css:25 | 14 uses |
| `--ce-blue` | `#4da3ff` | tokens.css:26 | 0 — never consumed via `var(--ce-blue)`; every use of `#4da3ff` in the codebase is a raw hardcoded hex instead (see Strays) |

### Urgency — desaturated clinical palette

| Token | Value | Defined | Consumed |
|---|---|---|---|
| `--ce-urgency-high` (on warm) | `#8E2F2F` | tokens.css:30 | 1 use — barely referenced via var(); `#8E2F2F` also appears hardcoded (App.jsx:49,1389) |
| `--ce-urgency-high-bg` | `rgba(190, 70, 70, 0.10)` | tokens.css:31 | 0 via var() — but the literal `rgba(190,70,70,0.10)` is hardcoded in App.jsx:49 |
| `--ce-urgency-high-line` | `#B45454` | tokens.css:32 | 0 via var() — hardcoded in App.jsx:49,1386 |
| `--ce-urgency-mod` | `#9A6F1F` | tokens.css:33 | 0 via var() |
| `--ce-urgency-mod-bg` | `rgba(212, 168, 75, 0.10)` | tokens.css:34 | 0 via var() — hardcoded in App.jsx:50 |
| `--ce-urgency-mod-line` | `#C79A3B` | tokens.css:35 | 0 via var() — hardcoded in App.jsx:50 |
| `--ce-urgency-low` | `#0F766E` | tokens.css:36 | 0 via var() |
| `--ce-urgency-low-bg` | `rgba(10, 191, 188, 0.08)` | tokens.css:37 | 0 via var() — hardcoded in App.jsx:51 |
| `--ce-urgency-low-line` | `rgba(10, 191, 188, 0.30)` | tokens.css:38 | 0 via var() — hardcoded in App.jsx:51 |
| `--ce-urgency-high-dark` | `#f4a4a4` | tokens.css:40 | 0 via var() — hardcoded in App.jsx:49 |
| `--ce-urgency-mod-dark` | `#e8c060` | tokens.css:41 | 0 via var() — hardcoded in App.jsx:50 |
| `--ce-urgency-low-dark` | `#5eead4` | tokens.css:42 | 0 via var() — hardcoded in App.jsx:51 |

**Note:** the entire urgency palette block (App.jsx lines 32–37 and 49–51) is a hardcoded re-declaration of the tokens.css values as a local JS object, not `var(--ce-*)` references. Values match exactly (no numeric drift) but the token is duplicated rather than consumed, so any future edit to `tokens.css` urgency values will silently desync from App.jsx's copy.

### Text

| Token | Value | Defined | Consumed |
|---|---|---|---|
| `--ce-text-dark` | `#111827` | tokens.css:45 | 10 uses |
| `--ce-text-mid` | `#2E3B4A` | tokens.css:46 | 5 uses |
| `--ce-text-muted` | `#526174` | tokens.css:47 | 16 uses |
| `--ce-text-dim` | `#7F99A5` | tokens.css:48 | 22 uses |
| `--ce-text-light` | `#F0EDE6` | tokens.css:49 | 9 uses |
| `--ce-text-light-sec` | `#94A3B8` | tokens.css:50 | 8 uses |

---

### Drift — hardcoded values that duplicate a token instead of referencing it

These are places where the *exact same value* as a `--ce-*` token appears as a raw literal (hex/rgb) rather than `var(--ce-token)`. This is drift risk, not color mismatch — but it means the token's canonical status is not actually enforced in these files.

| Stray value | Matches token | File:line |
|---|---|---|
| `#111827` | `--ce-navy-900` / `--ce-text-dark` | `frontend/src/index.css:13,23`; `frontend/src/Privacy.jsx:5,76`; `frontend/src/Support.jsx:5,76`; `frontend/src/ClinicalEdgeHome.jsx:158,186,245`; `frontend/src/App.jsx:875,882,1040`; `frontend/src/modules/reference-hub/ReferenceHubModule.jsx:422,599,953`; `frontend/src/modules/rhythm-lab/components/RhythmStrip.tsx:33,34` |
| `#2D3B4E` | `--ce-line-navy` | `frontend/src/index.css:26`; `frontend/src/App.jsx:372,888,1514,1561,1576,1590,1654`; `frontend/src/modules/rhythm-lab/components/RhythmStrip.tsx:30,48` |
| `#94A3B8` | `--ce-text-light-sec` | `frontend/src/index.css:32`; `frontend/src/App.jsx:884,902,1128`; `frontend/src/modules/icu-drips/icu-drips.css:211`; `frontend/src/modules/rhythm-lab/components/CompareMode.tsx:187` |
| `#4da3ff` | `--ce-blue` | `frontend/src/App.jsx:32,194,1057,1068,1073(x2),1703`; `frontend/src/Landing.jsx:564,702,868,1131,1645`; `frontend/src/Scenario.jsx:547,575,604`; `frontend/src/modules/icu-drips/IcuDripsModule.jsx:16` — the token is **never** consumed via `var()` anywhere; it exists only on paper |
| `#0ABFBC` | `--ce-teal` | Frequently hardcoded alongside legitimate `var(--ce-teal)` use, e.g. `frontend/src/App.jsx:37,200,303,342,414(x2),453,905,925,986,1082,1127,1484,1500,1562,1634`; `frontend/src/Privacy.jsx:33`; `frontend/src/Support.jsx:33`; `frontend/src/ClinicalEdgeHome.jsx:22,93`; `frontend/src/modules/rhythm-lab/rhythm-lab.css:659`; `frontend/src/modules/rhythm-lab/RhythmLabModule.tsx:27`; `frontend/src/modules/reference-hub/ReferenceHubModule.jsx:280`; `frontend/src/modules/icu-drips/icu-drips.css:26,1389`; `frontend/src/modules/icu-drips/IcuDripsModule.jsx:383` |
| `#D4A84B` | `--ce-gold` | `frontend/src/Privacy.jsx:139`; `frontend/src/Support.jsx:91`; `frontend/src/modules/rhythm-lab/components/CompareMode.tsx:15`; `frontend/src/modules/icu-drips/IcuDripsModule.jsx:14` |
| `#526174` | `--ce-text-muted` | Widely hardcoded — `frontend/src/App.jsx:211,916,1072,1264,1296,1463,1578,1599,1665`; `frontend/src/Privacy.jsx:85,173`; `frontend/src/Support.jsx:83,113,124,157,158,171,174,175`; `frontend/src/ClinicalEdgeHome.jsx:92,254`; `frontend/src/modules/reference-hub/ReferenceHubModule.jsx:429,486,606,616,639,664,1055` |
| `#7F99A5` | `--ce-text-dim` | `frontend/src/Privacy.jsx:43,52`; `frontend/src/Support.jsx:43,52`; `frontend/src/ClinicalEdgeHome.jsx:280,297`; `frontend/src/App.jsx:390,407,425,454,463,473,1008,1599`; `frontend/src/QuickStart.jsx:11`; `frontend/src/Landing.jsx:13`; `frontend/src/Scenario.jsx:12`; `frontend/src/modules/reference-hub/ReferenceHubModule.jsx:316` |
| `#F0EDE6` | `--ce-text-light` | `frontend/src/App.jsx:1105`; `frontend/src/modules/rhythm-lab/rhythm-lab.css:21` (as a *different* var name, see Strays §B) |
| `#243040` | `--ce-navy-600` | `frontend/src/App.jsx:1560`; `frontend/src/modules/rhythm-lab/components/RhythmStrip.tsx:26` |
| `#1E2A3A` | `--ce-navy-700` | `frontend/src/Privacy.jsx:158`; `frontend/src/App.jsx:243,249,252,372,1080,1513,1589,1653` |
| `#0A8F8D` | `--ce-teal-deep` | `frontend/src/Support.jsx:109` (as `#0A9E9B` — close but NOT exact, see Strays); `frontend/src/App.jsx:1773` (as `#0A9E9B`, also drifted); `frontend/src/modules/icu-drips/icu-drips.css:1284,1441` (exact match) |
| `#D6D0C4` | `--ce-warm-line` | `frontend/src/Privacy.jsx:138`; `frontend/src/Support.jsx:153` |
| `#FFFDF8` | `--ce-warm-card` | `frontend/src/Support.jsx:89` |
| `#E7E1D6` | `--ce-warm-bg` | `frontend/src/ClinicalEdgeHome.jsx:233`; `frontend/src/App.jsx:1029` |

---

## B. Strays

Every color value that is **not** an exact match to a `--ce-*` token, found as a hardcoded hex/rgb/rgba in inline `style={{}}` objects, component-scoped CSS variables, or component CSS files.

### B1. Near-duplicate / off-by-a-shade tokens (same "concept," different exact value)

These are the most notable drift issues — they look like they should be the canonical token but are a few RGB points off, meaning two subtly different shades render for what should be one design concept.

| Value | Likely intended token | File:line | Note |
|---|---|---|---|
| `#E8E4DC` | `--ce-text-light` (`#F0EDE6`) | `frontend/src/index.css:14` | body text color — noticeably duller/darker than the token's `#F0EDE6` |
| `#0A9E9B` | `--ce-teal-deep` (`#0A8F8D`) | `frontend/src/Support.jsx:109`; `frontend/src/App.jsx:1773` | teal-deep look-alike, off by ~15 in the G channel |
| `#0a8c8a` | `--ce-teal-deep` (`#0A8F8D`) | `frontend/src/modules/icu-drips/icu-drips.css:2048,2081,2379,2404` | yet a *third* variant of "teal-deep" (lowercase hex, distinct from both `#0A8F8D` and `#0A9E9B`) |
| `#089e9b` | `--ce-teal-deep` (`#0A8F8D`) | `frontend/src/modules/icu-drips/icu-drips.css:1822,2127,2148(x2),2451` | a *fourth* teal-deep variant, matches `#0A9E9B` casing/value pattern but lowercase |
| `#19C2D1` / `#19D3E0` | `--ce-teal` (`#0ABFBC`) | `frontend/src/Download.jsx:331`; `frontend/src/Landing.jsx:242` | two more near-teal one-offs, both distinct from `--ce-teal` and from each other |
| `#00C2D1` | `--ce-teal` (`#0ABFBC`) | `frontend/src/Landing.jsx:8,150`; `frontend/src/QuickStart.jsx:8`; `frontend/src/Scenario.jsx:8` | a lighter/brighter teal used consistently across the marketing pages' local palette block, distinct from the app's `--ce-teal` |
| `#0B1F2A` | `--ce-navy-800` (`#0C1E2C`)? | `frontend/src/Landing.jsx:6,176`; `frontend/src/QuickStart.jsx:6,222`; `frontend/src/Scenario.jsx:6,171,301`; `frontend/src/App.jsx:453,1128` | marketing-page "navy" base, close to but not equal to `--ce-navy-800` |
| `#112936` | none exactly — near `--ce-navy-700` (`#1E2A3A`) | `frontend/src/Landing.jsx:7`; `frontend/src/QuickStart.jsx:7`; `frontend/src/Scenario.jsx:7` | second color in the marketing pages' separate local palette |
| `#526174` vs `#556B7A` | `--ce-text-muted` (`#526174`) | `frontend/src/modules/reference-hub/ReferenceHubModule.jsx:786,799` uses `#556B7A` | near-duplicate muted gray, not the token value |
| `#8A9BA8` | not a token; resembles `--ce-text-dim`/`--ce-text-light-sec` blend | `frontend/src/ClinicalEdgeHome.jsx:105,106`; `frontend/src/App.jsx:1151,1164,1206,1284,1748,1768,1774`; `frontend/src/Scenario.jsx` (via App.jsx shared styles); `frontend/src/modules/reference-hub/ReferenceHubModule.jsx:510,688,1079` | recurring "one-off" muted blue-gray used **several places** but never promoted to a token |
| `#7B8494` | resembles `--ce-text-dim`/muted grays | `frontend/src/Download.jsx:218,238,275,294,323,357,369,380` | Download.jsx's own distinct muted-gray, used 8x within that one file only |

### B2. One-off / component-local hex values not tied to any token

| Value | File:line | Context (inferred) |
|---|---|---|
| `#F8FBFC` | `Privacy.jsx:40`, `Support.jsx:40`, `ClinicalEdgeHome.jsx:223`, `QuickStart.jsx:9`, `Landing.jsx:11`, `Scenario.jsx:10`, `App.jsx:999,1616`, `icu-drips.css:98`, `reference-hub/ReferenceHubModule.jsx:312` | near-white text/heading color, used "several places" but not a token |
| `#E9E3D8` | `Privacy.jsx:70`, `Support.jsx:70` | warm surface variant, one-off |
| `#8A6A22` | `Privacy.jsx:149`, `Support.jsx:101`, `icu-drips.css:779,1288` | dark-gold text-on-warm variant |
| `#A8C1CC` | `QuickStart.jsx:10`, `Landing.jsx:12`, `Scenario.jsx:11`, `App.jsx:403,444,1704,1724` | light steel-blue text, "several places" |
| `#3A5566` | `QuickStart.jsx:12`, `Landing.jsx:14`, `App.jsx:396,400,1634` | mid steel-blue, marketing-page local palette |
| `#4A6978` | `App.jsx:397,401,413`, `icu-drips.css:111` | another steel-blue, close to but distinct from `#3A5566`/`#A8C1CC` family |
| `#2E4A5C` | `Landing.jsx:527,669,754,837,920` | card border/accent on Landing only, one concept repeated 5x, no token |
| `#fca5a5`, `#e05572`, `#1FBF75`, `#fbbf24`, `#86efac`, `#c084fc`, `#fb923c`, `#fcd34d`, `#e07a3a`, `#22c55e`, `#f59e0b`, `#f97316`, `#ef4444`, `#DC2626`, `#D97706` | `Landing.jsx` (many lines), `Scenario.jsx:430,547-618`, `App.jsx:33,34,35,36,417,912,1327,1330,1421,1676,1697,1705,1706`, `rhythm-lab/data/rhythms.ts:1198-1201`, `rhythm-lab/components/CompareMode.tsx:16,17` | Tailwind-style default palette values (red-300, amber-400, green-400, purple-400, orange-400 etc.) hardcoded for status/urgency chips — **none of these route through `--ce-urgency-*` tokens**, despite representing urgency/status semantics that the token system was built to cover |
| `#F2B94B` | `App.jsx:35,36,1705`; `Landing.jsx:1132` | gold-adjacent amber, distinct from `--ce-gold` (`#D4A84B`) — used for "moderate" status color, functionally overlaps the urgency-mod token space but isn't it |
| `#E96B6B` | `App.jsx:417,1327,1330`; `IcuDripsModule.jsx:15` | red/urgency-high adjacent, distinct from `--ce-urgency-high-dark` (`#f4a4a4`) or `--ce-urgency-high` (`#8E2F2F`) |
| `#9AA8B2`, `#3D5166`, `#4A6675`, `#3A5A6A`, `#4E9E78`, `#3D5E6E`, `#5A7A8A`, `#6A8A9A` | scattered through `App.jsx` (lines 236, 311, 331, 1219, 1236, 1370, 1376, 1421, 1444, 1463, 1523) | large family of one-off blue-grays and greens, each used once or twice, no token backing |
| `#BCCDD6` | `App.jsx:1724` | one-off |
| `#C4BDB5` | `App.jsx:1180` | one-off warm-gray |
| `#0B2E2E` | `icu-drips.css:1447` | one-off dark teal surface |
| `#F0F7F7` | `icu-drips.css:1603,1683,1879,2025` | recurring pale-teal surface, "several places," no token |
| `#8B5CF6`, `#7c4de6` | `icu-drips.css` (many: 1572,2233,2234,2293,2311,2355,2468,2469,2470,2472(x2),2478(x2),2494) | a purple accent color used heavily (13+ occurrences) inside ICU Drips only — high-frequency but entirely outside the token system |
| `#D97C7C`, `#b05050`, `#C84444` | `icu-drips.css:2052,2057,2081,2082,2379,2383,2387,2404,2405,871` | red/urgency family local to ICU Drips, distinct from `--ce-urgency-high*` tokens |
| `#B0B8C4` | `abg-lab.css:194` | one-off |
| `#4E7C70` | `rhythm-lab.css:792,1519,2045`; `CompareMode.tsx:14` | "sinus/normal" green-teal used several places in Rhythm Lab, no token |
| `#8B6914`, `#1a1208` | `rhythm-lab.css:1567,1809` | one-off dark golds |
| `#2D7A56`, `#B94040` | `rhythm-lab.css:2887,2892,3306` | correct/incorrect answer colors in Rhythm Lab quiz UI, not tied to urgency tokens despite representing an analogous semantic (correct=green/low, incorrect=red/high) |
| `#5A3D08` | `reference-hub.css:321` | one-off |
| `#9A7020`, `#4A3800`, `#7A5A10`, `#8A6010` | `ReferenceHubModule.jsx:448,474,477,613,965,970,1012,1038,1044` | family of dark-gold text/border shades local to Reference Hub, several places, no token |
| `#C06B6B`, `#C08030`, `#B84040`, `#B07020`, `#7A5D1A`, `#8A3030` | `ReferenceHubModule.jsx:1002,1003`; `icu-drips.css:763,764,765,777,778` | red/gold urgency-adjacent one-offs, module-local |
| `#a6a6a6`, `#000`, `#fff` (generic) | `Download.jsx:30,32,39,55,67,80`; various `#fff`/`#000` scattered in `rhythm-lab.css:2814,2819`, `abg-lab.css:178,209`, `icu-drips.css:1523,2146,2470` | pure black/white/gray, "everywhere" as a category but each individual file use is trivial (borders, shadows-adjacent) |
| `#0E2436`, `#103246`, `#0B1E2D`, `#0E2E40` | `Download.jsx:119,152` | gradient stops local to Download page hero, one-off |
| `#F3F4F6`, `#A8B3C3`, `#E7E2D8`, `#162033`, `#5D687C` | `Download.jsx:171,180,194,218,228,238` | Download.jsx's own local palette, distinct from both navy and warm token families |
| `#07111C` | `ClinicalEdgeHome.jsx:158`; `icu-drips.css:360,921` | darker-than-navy-900 shade, "several places," no token |
| `#9AABBA` | `ClinicalEdgeHome.jsx:158` | one-off |
| `#BFCFDA`, `#E8F0F4`, `#FFF8EE` | `icu-drips.css:487,653,692,1456` | one-off pale surfaces |
| `#3B9EC9`, `#5B8AB0`, `#C4A035`, `#7B7FC4`, `#B07040`, `#D4785A`, `#4EAD8A` | `icu-drips.css:26-54` | drip-category accent colors defined as component-scoped `--id-cat-accent` custom properties (not `--ce-*`), one color per drip family — intentional local system but entirely parallel to/outside `tokens.css` |
| `#8096A0`, `#C09030`, `#8B7EC0` | `icu-drips.css:1390,1391,1397` | one-off |
| `#00D8FF`, `#9135ff`, `#eee6ff`, `#8900ff`, `#00c2ff` | `assets/react.svg`, `assets/vite.svg` | vendor/default framework logo assets — not app UI color, excluded from real palette concerns but technically present in `frontend/src` |

### B3. Component-scoped CSS custom properties outside `tokens.css` that define colors

| Variable | Value | File:line |
|---|---|---|
| `--surface-warm` | `#F0EDE6` | `frontend/src/modules/rhythm-lab/rhythm-lab.css:21` |
| `--surface-warm-deep` | `#E8E3D8` | `frontend/src/modules/rhythm-lab/rhythm-lab.css:22` |
| `--id-cat-accent` (8 variants) | `#0ABFBC`, `#4EAD8A`, `#7B7FC4`, `#B07040`, `#D4785A`, `#3B9EC9`, `#5B8AB0`, `#C4A035` | `frontend/src/modules/icu-drips/icu-drips.css:26-54` |

`--surface-warm` (`#F0EDE6`) is a second, differently-named variable holding the **exact same value** as `--ce-text-light` — same hex, two different variable names/purposes (one used as a surface color in Rhythm Lab, the other as a text color in tokens.css), which is a naming collision worth flagging even though the values happen to coincide.

### B4. rgba() one-offs not derived from a `--ce-*` color

Rhythm Lab, ICU Drips, Reference Hub, and ABG Lab component CSS files, plus `Landing.jsx`/`Scenario.jsx`/`App.jsx` inline styles, contain dozens of `rgba(r,g,b,alpha)` values. Most alpha-blend an underlying color that **does** match a token (e.g. `rgba(10,191,188,X)` = `--ce-teal` at various opacities — "everywhere," 60+ occurrences across `rhythm-lab.css`, `icu-drips.css`, `reference-hub.css`, `App.jsx`; `rgba(212,168,75,X)` = `--ce-gold` at various opacities — "several places" in `rhythm-lab.css:1650-1656,2999-3061,3183,3285-3291,3502-3585` and `reference-hub.css:311-313`). These are not registered as token variants (no `--ce-teal-a20` style alpha tokens exist), so every opacity level is a hand-picked literal. Distinct non-token rgba families found:

- `rgba(0,194,209, X)` — `Landing.jsx`, `QuickStart.jsx`, `Scenario.jsx` (marketing pages' own `#00C2D1` teal at various alphas, "several places," none reference `--ce-teal`)
- `rgba(224,85,114, X)` — `#e05572` red at various alphas — `App.jsx`, `Landing.jsx`, `Scenario.jsx` — "several places," not `--ce-urgency-high*`
- `rgba(77,163,255, X)` — `--ce-blue` (`#4da3ff`) hex value alpha-blended by hand in `App.jsx`, `Landing.jsx`, `Scenario.jsx`, `IcuDripsModule.jsx` — again, the token itself is never `var()`-referenced anywhere, only its raw value
- `rgba(31,191,117, X)` — `#1FBF75` green at various alphas — `App.jsx`, `Landing.jsx`, `Scenario.jsx` — "several places," no green token exists in tokens.css at all (urgency-low uses teal-family greens, not this green)
- `rgba(239,68,68,X)`, `rgba(251,191,36,X)`, `rgba(251,146,60,X)`, `rgba(192,132,252,X)`, `rgba(134,239,172,X)`, `rgba(245,158,11,X)` — `Landing.jsx` only — Tailwind-style red/amber/orange/purple/green alphas for feature-card accents, one-off per section

---

## Summary counts

- **Canonical tokens defined:** 31 color-bearing tokens in `tokens.css` (7 navy/surface, 4 warm, 4 accent, 12 urgency, 6 text) plus non-color tokens (typography, shape, spacing, motion) not itemized above.
- **Tokens with zero `var()` consumption:** `--ce-navy-800`, `--ce-blue`, and all 9 non-primary urgency tokens (`-bg`, `-line`, `-dark` variants) — meaning roughly a third of the defined palette exists only as documentation, not as an enforced reference.
- **Distinct stray hex/rgb values found outside the token system:** 100+ (see §B1–B4); heaviest concentrations in `frontend/src/App.jsx`, `frontend/src/Landing.jsx`, `frontend/src/modules/icu-drips/icu-drips.css`, and `frontend/src/modules/reference-hub/ReferenceHubModule.jsx`.
