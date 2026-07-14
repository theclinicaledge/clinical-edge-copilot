# Clinical Edge — Design Audit: AI-App Identifier Hit List

Scope: every page and module in `frontend/src`, audited 2026-07-14 against the north star
(the Instagram carousel system in `content/instagram-carousel/_template-dark.html` — dark,
editorial, mono-labeled, teal-as-accent, no decoration without information).

Severity: **HIGH** = instantly reads as AI/template-built or undermines clinical trust.
**MED** = generic but not damning. **LOW** = polish-level.

---

## 1. Marketing pages (Landing / QuickStart / Scenario)

### 1.1 — The complete AI-SaaS hero kit · **HIGH**
`frontend/src/Landing.jsx:360–574`
Pill badge with **pulsing glow dot** (`lGlow` keyframe, line 402) → three-line centered
headline with accent-colored middle line → subhead → **two buttons** (filled + ghost) →
**floating mock-app card** (`lFloat` 5s hover animation, line 239) with **under-card
radial glow + 18px blur** (lines 479–489). This is the exact hero every AI landing-page
generator produces. Each element individually is defensible; the full stack together is
the template signature. A serious clinical publication doesn't float and doesn't pulse.

### 1.2 — macOS window chrome with traffic lights · **HIGH**
`Landing.jsx:510–512, 1583–1585`
Red/yellow/green dots on the mock cards. The universal "startup template demo panel"
tell — and it's fake chrome: the product isn't a desktop app. Twice on the page.

### 1.3 — Ambient radial glows scattered through the page · **HIGH**
`Landing.jsx:373–382, 988–996, 1676–1693, 1763–1772`
Four decorative `radial-gradient` glow blobs (hero ambient, corner glows on the safety
and trust cards, final CTA ambient). Pure vibe-decoration carrying zero information —
the north-star template's only "glow" is a 2.8%-opacity ambient lift baked into the
slide, not floating teal orbs.

### 1.4 — Same 3-card grid repeated four times · **HIGH**
`Landing.jsx:1055–1101, 1207–1271, 1297–1361, 1387–1451`
"Why Different", "Real Shift Moments", "How It Helps You Think", "Built for Bedside
Nursing" are the *identical component*: `borderTop: 2px solid teal, borderRadius: 14,
padding: 32px, boxShadow: 0 8px 32px` with mono number + bold title + body. Four
sections, one skeleton, no hierarchy shift between them — layout monotony that reads
as "the model generated N sections from one card component." The page is ~8 screens of
center-label → heading → card-grid on repeat.

### 1.5 — "Not another AI chatbot" defensive copy · **HIGH**
`Landing.jsx:1039–1041` ("This isn't another AI chatbot." + "Not another AI tool telling
you what to do."), `Landing.jsx:1009` ("Designed with clinical guardrails — not generic
AI."), `Landing.jsx:1063` ("not textbook explanations or AI-generated fluff"),
`Landing.jsx:1719` ("not generic AI outputs").
Protesting four times that you're not generic AI is itself the most recognizable
generic-AI copy pattern, and it erodes rather than builds clinical credibility.
Confidence is shown by never mentioning it.

### 1.6 — Rally-cry triplet copy · **MED**
`Landing.jsx:1785` "Think clearer. Move faster. Feel more confident." and `:1461`
"No noise. No fluff. Just better thinking — at every stage."
Three-beat imperative slogans are the stock LLM marketing cadence. "A smart nurse
teaching another smart nurse" wouldn't talk like this.

### 1.7 — Tailwind default palette flood in mock cards & badges · **HIGH**
`Landing.jsx:545, 653, 687, 771, 822, 865, 905, 937, 948, 951, 1131–1133, 1626`;
`Scenario.jsx:430, 547–618`
Urgency chips and section accents hardcode `#fca5a5` (red-300), `#fbbf24` (amber-400),
`#86efac` (green-300), `#c084fc` (purple-400), `#fb923c` (orange-400), `#fcd34d`
(amber-300), `#e05572`, `#1FBF75`, `#e07a3a`. Six-plus rainbow accents on one page is
the "default palette" tell, and none of them are the app's actual urgency tokens —
the marketing preview shows urgency colors the product doesn't use.

### 1.8 — Parallel legacy palette (the reconciliation's open decision #1) · **HIGH**
`Landing.jsx:5–17`, `QuickStart.jsx:5–15`, `Scenario.jsx:5–16`, plus `Download.jsx`
gradients (`#0B1E2D → #0E2E40`, lines 119, 152).
All three pages carry a local `C = {...}` block: bg `#0B1F2A`, card `#112936`, accent
`#00C2D1` — the *pre-reconciliation* Copilot palette (still documented as "sourced from
App.jsx" in `my-video/src/tokens.ts`, which proves its provenance). The marketing teal
`#00C2D1` is a colder cyan than brand teal `#0ABFBC`; a visitor moving from the landing
page into the app experiences a subtle brand shift. The Instagram template explicitly
labels the `#111827`-family palette "the real Clinical Edge app colors exactly."

### 1.9 — Glassmorphism nav + hover-glow buttons · **MED**
`Landing.jsx:292` (nav blur 20px), `Landing.jsx:241–245` (`.l-btn-primary:hover`
lifts −1px and *doubles its teal glow* to `0 8px 30px rgba(0,194,209,0.3)`),
`QuickStart.jsx:74`, `Scenario.jsx:210` (nav blur 18px).
The glowing-button hover is a template tell. (Note: sticky blurred headers also exist
in the app shell — see 3.6 — where they're more defensible; the *glow* is the problem
here, not the blur.)

### 1.10 — `⌘ + Enter` hint chip and "Try:" pill chips · **LOW**
`QuickStart.jsx:246`, `QuickStart.jsx:189–209`
Fine functionally; the fully-rounded (`borderRadius: 20`) pill chips are the one
place marketing uses pills while the app uses rectangles — small inconsistency.

---

## 2. Copy & content tells (cross-page)

### 2.1 — "AI-powered" self-description · **MED**
`Privacy.jsx:97`, `Support.jsx:136`
"Clinical Edge Copilot is an AI-powered clinical reasoning support tool…" — accurate
in a legal/FAQ context, but "AI-powered" is the single most template-flagged phrase in
product copy. It can state the same fact plainly ("uses a large language model to…").

### 2.2 — Theatrical loading phases · **MED**
`App.jsx:59–64`
"Interpreting bedside concern..." → "Prioritizing assessments..." → "Building clinical
guidance..." → "Finalizing recommendations...". Fake-progress narration is a chatbot-app
tell; a clinical publication would show one quiet state, not a four-act play.

### 2.3 — Em-dash-heavy aphorism cadence · **LOW**
Throughout Landing/Scenario body copy ("Built for how nurses actually think — not just
what textbooks say."). Individually fine; density is the tell.

---

## 3. App shell & Copilot (`App.jsx`, `index.css`, `ClinicalEdgeHome.jsx`)

### 3.1 — Six-color rainbow section system · **HIGH**
`App.jsx:31–38`
Response sections are accent-coded: blue `#4da3ff`, red `#e05572`, green `#1FBF75`,
amber `#F2B94B` (×2), teal. Five hues across one response reads as "every card gets a
random accent" — the north star uses **one accent (teal) + one warm counterpoint
(gold)** and lets typography carry hierarchy. This is also where the app most visibly
diverges from the Instagram identity. (Clinical-safety note: red/amber/green here are
*section* colors, not urgency semantics — but they visually collide with the urgency
system, which IS red/amber/green. Two different meanings, same hues, same screen.)

### 3.2 — Blue+teal on the same surfaces with no rule · **MED**
`App.jsx:1054–1075` (offline notice is blue), section "What this could be" is blue,
SBAR "Situation" is blue — while everything interactive is teal. No discernible rule
for when blue vs teal applies. `--ce-blue` needs a defined role or deprecation.

### 3.3 — Icon-button toolbar with 5 colored glyph buttons · **MED**
`App.jsx:413–417`
Saved-case rows have ▲/↩/⎘/✎/× buttons each in a different color (gray, teal, teal,
amber `#F2B94B`, red `#E96B6B`). Text-glyph buttons in rainbow colors read as
prototype UI, not product UI. Also the only place `✎` emoji-glyph appears.

### 3.4 — Off-token gray soup in inline styles · **MED**
`App.jsx:236, 311, 331, 1047, 1151, 1164, 1181, 1219, 1236, 1284, 1312, 1463, 1523,
1634, 1748, 1768`; `ClinicalEdgeHome.jsx:105–107, 158`; `ReferenceHubModule.jsx:510,
688, 786, 1079`; `Download.jsx:218–380` (`#7B8494` ×8)
A dozen-plus one-off blue-grays (`#8A9BA8`, `#9AA8B2`, `#7A8D9A`, `#6A7D8A`, `#3D5166`,
`#4A6978`, `#3A5566`, `#5A7A8A`, `#6A8A9A`, `#556B7A`, `#8096A0`, `#9AABBA`…) all doing
the job of `--ce-text-muted`/`--ce-text-dim`/`--ce-text-light-sec`. Invisible
individually; collectively it's why the app feels slightly unfocused, and it's the
remaining hardcode debt the token reconciliation deliberately deferred (near-matches,
not exact matches).

### 3.5 — Body text color drift · **MED**
`index.css:14` sets body text `#E8E4DC`; `App.jsx:876` sets the shell to `#A8C1CC`;
tokens define `--ce-text-light: #F0EDE6` and `--ce-text-light-sec: #94A3B8`. Meanwhile
the Instagram north star uses `#A8C1CC` as its canonical "body on dark." Four candidate
"light body text" values, none authoritative. Needs one decision (see spec).

### 3.6 — Uniform blurred sticky header, subtly different per module · **MED**
Copilot `App.jsx:954–966`, Home `ClinicalEdgeHome.jsx:192–205`, Reference Hub
`ReferenceHubModule.jsx:299–300` share one recipe (gradient + `rgba(11,31,42,0.97)` +
blur 20px) — but ABG Lab (`abg-lab.css:16–28`) uses `--ce-navy-header` with **back
link on the left and no logo**, Rhythm Lab restyles it again, and marketing navs
(1.9) are another variant. Five back-navigation patterns: "← All tools" right-aligned
(Copilot/ICU/RefHub), "← All tools" left-aligned (ABG), "← Back" left (QuickStart/
Scenario), logo-only (Download), none (Home). One app, five headers.

### 3.7 — Urgency palette duplicated as JS object · **MED**
`App.jsx:46–52`
`URGENCY_STYLES` re-declares every `--ce-urgency-*` token value as string literals.
Values currently match tokens.css exactly, but nothing enforces it — the reconciliation
audit already flagged this as silent-desync risk. (This is why the urgency tokens show
zero `var()` consumption.)

### 3.8 — Blinking streaming cursor + pulsing loader bars · **LOW**
`App.jsx:295–350, 931–938`
Equalizer-bars loader and blinking block cursor are chat-app conventions. Defensible
for a streaming interface; keep only if quieted (the four-phase narration in 2.2 is
the bigger problem).

---

## 4. Module-vs-module inconsistency

### 4.1 — Every module reinvents card radius/padding · **MED**
Radius census: inline JSX uses 1, 3, 5, 6, 7, 8, 10, 11, 12, 14, 16, 18, 20, 100;
CSS files use 2–10, 20 + tokens. `--ce-r-sm/md/lg/pill` exist and are consumed ~28
times total while raw values appear 150+ times. Marketing cards are 14–20px, app
cards 6–10px, ICU Drips 8–12px. No intentional scale — just entropy.

### 4.2 — ICU Drips purple challenge system (open decision #2) · **HIGH**
`icu-drips.css:1572, 2233–2234, 2291–2293, 2311, 2355, 2466–2478, 2494`
`#8B5CF6`/`#7c4de6` (Tailwind violet-500) skins the entire Shift Challenge feature:
progress bar, option hover, primary button (white-on-purple — the only such button in
the app), eyebrows, and the home-row arrow. It's the strongest "different app inside
the app" moment and the most template-colored element in the product. Also used for
one "pearl" row label (`:1572`) unrelated to challenges.

### 4.3 — ICU Drips has its own text/color subsystem beyond the accents · **MED**
`icu-drips.css` carries `#0a8c8a`/`#089e9b` teal-deeps (now reconciled), local reds
(`#D97C7C`, `#b05050`, `#C84444`), golds (`#8A6A22` shared with Privacy/Support),
pale-teal surfaces (`#F0F7F7` ×4, `#0B2E2E`), and one-offs (`#BFCFDA`, `#E8F0F4`,
`#FFF8EE`, `#8096A0`, `#C09030`, `#8B7EC0`). The 8-category `--id-cat-accent` system
(css:22–54) is **semantic** — it encodes pharmacological family consistently across
hero cards, drip rows, and family blocks — but it was never ratified as tokens, and
2 of its 8 hues (`#7B7FC4` periwinkle, `#5B8AB0` steel) sit close to the challenge
purple and `--ce-blue`, muddying all three.

### 4.4 — Rhythm Lab local warm-surface fork · **LOW**
`rhythm-lab.css:21–22`
`--surface-warm: #F0EDE6` / `--surface-warm-deep: #E8E3D8` — intentionally deferred
("until the Phase 2 warm-surface unification" per its own comment), and `#F0EDE6`
collides by value with `--ce-text-light`. Needs the deferred decision made.

### 4.5 — Rhythm Lab quiz verdict colors vs ICU Drips quiz verdict colors · **MED**
`rhythm-lab.css:2887, 2892, 3306` uses `#2D7A56`/`#B94040` for correct/incorrect;
`icu-drips.css` practice/challenge feedback uses `--ce-teal-deep` (correct) and
`#C84444`-family (incorrect). Same interaction, two color languages. Both differ from
the urgency tokens that already encode "good/bad" on warm surfaces
(`--ce-urgency-low: #0F766E`, `--ce-urgency-high: #8E2F2F`).

### 4.6 — ABG Lab full-width teal-flood primary button · **MED**
`abg-lab.css` (Interpret ABG button, visible in render)
The only place in the app where teal is used as a large flood fill rather than an
accent. Every other primary action is a compact filled button. Violates the implied
"teal is an accent, never a flood" rule the north star follows.

### 4.7 — ABG pearl icon `✦` · **LOW**
`AbgLabModule.jsx:112` — the one decorative sparkle-adjacent glyph in the product.
Given "✨-adjacent" is the top AI tell, replace with the mono `PEARL` eyebrow
convention ICU Drips already uses.

### 4.8 — Reference Hub local gold subsystem · **LOW**
`ReferenceHubModule.jsx:448–1044` (`#9A7020`, `#7A5A10`, `#8A6010`, `#4A3800`,
`#B07020`, `#C08030`), `reference-hub.css:321` (`#5A3D08`)
Six-plus hand-mixed dark golds doing the job of `--ce-gold`/a single "gold-on-warm"
token. Same pattern as the teal-deep drift the reconciliation just collapsed.

---

## 5. Clinical-credibility flags (nurse-audience trust)

### 5.1 — Marketing urgency colors ≠ product urgency colors · **HIGH**
(Same finding as 1.7, elevated for the trust angle.) The landing page teaches
"HIGH = `#fca5a5` on `rgba(239,68,68,…)`" — the shipped product renders HIGH as
desaturated clinical `#8E2F2F`/`#B45454`. Inconsistent urgency signaling *in a tool
about urgency awareness* is a real credibility hit for a clinical audience.

### 5.2 — Rainbow sections dilute urgency salience · **MED**
(Consequence of 3.1.) When every response card carries a saturated accent, the one
signal that must dominate — the urgency badge — competes with decoration. Clinical
rule in CLAUDE.md: don't overcall urgency. The visual system currently overcalls
*everything*.

### 5.3 — What's already right (protect these) · —
For calibration, the strongest anti-template surfaces, to be treated as the internal
benchmark: **Home hub** (`ClinicalEdgeHome.jsx` — editorial list, no cards, restrained
hover), **Rhythm Lab** split-panel index (mono eyebrows, urgency chips, warm/dark
split), **ICU Drips** drip cards (plain-language clinical voice, mono effect chips,
category eyebrows), **ClinicalTrustPanel** (quiet disclosure, correct a11y), and the
consistent **IBM Plex Mono uppercase eyebrow** convention everywhere. The system to
spec is essentially "make everything behave like these."

---

## Summary counts

| Severity | Count | Heaviest files |
|---|---|---|
| HIGH | 9 | Landing.jsx (6), App.jsx (1), icu-drips.css (1), cross-page (1) |
| MED | 13 | App.jsx, module CSS, marketing pages |
| LOW | 6 | scattered |

Root causes, in order: (1) marketing pages were built on the legacy palette with a
stock AI-SaaS layout language; (2) the app never wrote down accent rules, so every
module invented one; (3) inline styles let one-off grays and radii accumulate
unchecked.
