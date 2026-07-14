# Clinical Edge — Motion & Interaction System

Companion to `design-system.md` (colors, type, spacing, components). This spec adds
the motion layer. It changes NO color decisions — every §1.2 accent role, §1.3
mapping, and ratified rule in design-system.md stands. Where this spec amends a
design-system.md rule, the amendment is called out explicitly and wins.

**Ratified decisions (2026-07-14):**
1. **CSS-only.** No animation libraries, no View Transitions API. All motion is CSS
   transitions/keyframes on the existing tokens.css utilities. Consequence: page
   transitions are **enter-only** — the outgoing page cuts, the incoming page
   animates in. This is intentional and permanent until re-ratified.
2. **Scroll-triggered reveals: Landing only.** Clinical modules render everything
   instantly. A nurse opening Levophed at 3am gets information, not choreography.
3. **Press feedback everywhere** — subtle scale/translate on `:active` for all
   interactive elements. **This amends design-system.md §4.2** ("Active: none") —
   Primary/Secondary buttons now get the §3 press treatment.

**Tone:** motion is confident and brief. It confirms — it never performs. If a
transition would be noticed by someone watching over your shoulder, it's too much.

---

## 1. Timing & easing standard

The complete set. Nothing outside it, ever — the motion equivalent of the
{4, 8, 12, 999} radius scale. All already exist in tokens.css:

| Token | Value | Use |
|---|---|---|
| `--ce-dur-fast` | 120ms | Hover states, color/border/shadow changes, focus rings |
| `--ce-dur-base` | 160ms | Section/card entrances, accordion expand, toggle slides |
| `--ce-dur-slow` | 220ms | Page-level entrance only |
| (press) | 60–80ms | `:active` states only — hardcoded in the utility, not a token |
| `--ce-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | ALL entrances, hovers, expands — the house curve |
| `--ce-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Continuous position changes only (toggle knob, tab indicator) |

Stagger step: **50ms**, max 5 children (the existing `.ce-stagger-children`
ladder). Lists longer than 5: children 6+ enter with child 5 (no delay past 200ms).

Rules:
- No `ease`, `linear`, `ease-in`, or hand-rolled beziers. `ease-in` starts are
  banned everywhere — motion in this product decelerates, it never winds up.
- No duration outside the four values above. If 160ms feels wrong, the animation is
  wrong, not the duration.
- `transition: all` is banned — enumerate properties (App.jsx:885's
  `button { transition: all }` gets fixed by the Copilot task block, §9).

---

## 2. Hover states — by element type

Hover always changes ≥2 channels (never color alone — that's the "click-click page"
tell), always at `--ce-dur-fast` / `--ce-ease-out`, always `cursor: pointer` on the
whole hit area.

| Element | Hover treatment |
|---|---|
| **Tappable card, warm surface** (drip cards, rhythm index rows-as-cards, saved cases) | `.ce-card-lift`: `translateY(-1px)` + shadow `0 3px 14px rgba(0,0,0,0.09)`. Border may step to `rgba(10,191,188,0.22)`. |
| **Tappable card, dark surface** (home-hub tools, hero cards) | `.ce-interactive-card`: `translateY(-1px)` + `--ce-shadow-float`. Optional border-color step. |
| **Primary/gold button** | Fill → `--ce-teal-deep` / `--ce-gold-deep` (per §4.2) + `translateY(-1px)`. No shadow change, no glow. |
| **Secondary/ghost button** | Border `--ce-line-*` → `rgba(10,191,188,0.30)` + text → `--ce-teal` (dark) / `--ce-teal-deep` (warm). No transform. |
| **Nav item / back link / text link** | Color → teal + underline `text-decoration-color` fades in (`text-underline-offset: 3px`). No transform — text never moves. |
| **List row** (reference tables, notebook rows) | Background tints `rgba(10,191,188,0.04)` + left padding does NOT change (no indent-on-hover). No transform on rows — rows are furniture, not cards. |
| **Chip / filter pill** | Border + text step toward teal; background `rgba(10,191,188,0.06)`. No transform. |
| **Badge (urgency, category)** | **No hover state.** Badges are labels, not controls. If a badge is clickable, it's a chip — restyle it as one. |
| **Icon button** (copy, note, delete) | Color per §6.2 (teal; delete → `--ce-urgency-high-dark`) + background tints `rgba(10,191,188,0.06)`. |

Non-interactive elements get NO hover response of any kind. A card that isn't
clickable must not lift — hover affordance is a promise.

---

## 3. Press / active states (amends design-system.md §4.2)

Every interactive element gives 60–80ms tactile press feedback via the existing
`.ce-pressable` pattern or equivalent inline:

| Element | `:active` treatment |
|---|---|
| Buttons (all variants) | `scale(0.98)`, 60ms. Fill also steps (Primary: stays `--ce-teal-deep`). |
| Cards | `translateY(0) scale(0.998)` (from hover's -1px), 60ms — the existing `.ce-interactive-card:active`. |
| Chips, icon buttons | `scale(0.97)` + `opacity 0.85`, 60ms — the existing `.ce-pressable`. |
| Text links, nav | No transform (text never moves); color deepens one step. |

The press must release at the same speed (60ms) — sticky press states read as lag.

---

## 4. Focus states

Already canonical in tokens.css — ratifying, not changing:
`:focus-visible` = `outline: 2px solid var(--ce-teal); outline-offset: 2–3px`,
`:focus:not(:focus-visible)` = none. Applies to every interactive element with no
exceptions. Focus outlines appear instantly (no transition) — keyboard users get
zero latency. Form fields additionally step their border to teal at `--ce-dur-fast`.

---

## 5. Transitions — page, section, detail

**Route change (module → module, hub → module):** incoming page root gets
`.ce-page-enter` (slide-up 8px + fade, `--ce-dur-slow`). Outgoing page cuts —
no exit animation (CSS-only ruling). One animation per navigation: if the page
root animates, its sections don't ALSO animate (no cascading double-entrance).

**Within-page section reveal (tab switch, mode switch, quiz next-question):**
`.ce-section-enter` (slide-up, `--ce-dur-base`) on the swapped region only.

**List → detail (drip card → drip detail, rhythm index → rhythm page):** detail
page enters with `.ce-page-enter`; the detail page's hero card may additionally
use `.ce-card-enter` + the stagger ladder for its first ≤5 content sections.
This is the ONE sanctioned double-layer entrance, because list→detail is the
app's most important navigation and deserves a beat of orientation.

**Lists:** first render of a card list uses `.ce-stagger-children` +
`.ce-card-enter` (fade only — staggered slide-up on 20 cards reads as a wave
gimmick). Re-renders from filtering/searching do NOT re-animate — animation fires
on navigation, not on state change. Filter changes swap content instantly.

**Copilot response sections:** the nine section cards enter with
`.ce-card-enter` + stagger as they parse in. Streaming text itself is never
animated beyond the existing cursor (design-system.md §4.7 stands).

---

## 6. Micro-interactions

- **Accordions** ("Watch out", "Signals to escalate", ClinicalTrustPanel, saved-case
  expand): animate `grid-template-rows: 0fr → 1fr` (or measured max-height) at
  `--ce-dur-base` / `--ce-ease-out`, with the chevron rotating 180° in the same
  duration. Content inside does not separately fade — the reveal IS the animation.
  Collapse at the same speed. Never bounce past open.
- **Toggles/checkboxes**: knob/check translates with `--ce-ease-in-out` at
  `--ce-dur-fast`; track color crossfades in parallel. No spring overshoot.
- **Form focus**: border → teal + label (if floating) moves at `--ce-dur-fast`.
  Placeholder never animates.
- **Save/copy confirmations**: color/token rules per design-system.md §1.2 stand
  untouched. Motion: the swapped glyph/label (`⎘→✓`, `Save→Saved`) enters with a
  single `ce-fade-in` at `--ce-dur-fast`. No scale-pop, no checkmark draw-on, no
  confetti physics. Reverting (copy, ~1.5–2s) fades back the same way.
- **Copilot "thinking" state**: the LOADING_MESSAGE line + indicator may use ONE
  quiet looped animation while the request is genuinely pending (§5-of-design-system
  exemption): an opacity breathe between 0.5 and 1.0 over ~1.6s, `--ce-ease-in-out`.
  No spinners-plus-message, no progress theater, no shimmer.
- **Quiz verdicts** (ICU Drips, Rhythm Lab practice): verdict color/border applies
  via `--ce-dur-fast` transition; the verdict label enters with `ce-fade-in`. The
  card does not shake on wrong answers — error-shake is banned (§8).

---

## 7. Loading states

The app has exactly one async surface: the Copilot request. Everything else is
local data and must render synchronously — **skeleton screens are banned
app-wide.** A skeleton on local data is fake latency: it tells the user something
is loading when nothing is. That's the "cheap" tell, not the absence of one.

- Copilot pending: LOADING_MESSAGE + breathe (§6). That's the entire loading system.
- If a future feature adds real network latency >300ms, the pattern is: content
  area holds layout (no collapse/jump), LOADING_MESSAGE-style single line, then
  `.ce-section-enter` on arrival. Still no skeletons, still no spinners.
- Never show any loading treatment for operations under 300ms — flashing a loader
  for 80ms reads worse than nothing.

---

## 8. Depth & layering

Depth comes from exactly three channels — shadow step, 1px lift, and scrim — never
from blur, glow, or gradient.

- **Elevation ladder** (uses only the three ratified shadows):
  resting card = `--ce-shadow-card` → hovered/raised = `--ce-shadow-float` →
  singular hero = `--ce-shadow-hero`. An element moving up the ladder pairs the
  shadow step with `translateY(-1px)`, transitioned together at `--ce-dur-fast`.
  Shadows stay neutral black (design-system.md §3) — an accent-colored shadow is a
  glow, and glows are dead.
- **Z-index scale** (complete set): content `0` · sticky header `10` · dropdown /
  popover `20` · modal scrim + modal `30` · toast `40`. Nothing else; no z-index
  arms races (`9999` is a code smell to fix on sight).
- **Modal/overlay entrance**: scrim fades in (`ce-fade-in`, `--ce-dur-fast`,
  `rgba(0,0,0,0.5)` flat — no backdrop-filter/glassmorphism); panel uses
  `.ce-section-enter`. Exit: scrim + panel fade out at `--ce-dur-fast` (opacity
  transition on a `[data-closing]` state — cheap CSS exit, sanctioned for overlays
  only since the page underneath persists).
- **"Focused" treatment** (e.g., active compare card, selected rhythm): border
  steps to `rgba(10,191,188,0.30)` + `--ce-shadow-float`. Never scale-up, never
  dim-the-siblings.

---

## 9. Scroll behavior

- **Sticky headers**: module headers may stick. Treatment: flat `--ce-navy-900`
  (dark) at full opacity + `border-bottom: 1px solid var(--ce-line-dark)`. No
  backdrop blur (audit.md 1.9 stands), no shrink-on-scroll, no opacity ramps
  tied to scroll position.
- **Scroll-triggered reveals — Landing.jsx only**: below-fold sections may enter
  once via IntersectionObserver adding a class that triggers `.ce-section-enter`
  (threshold ~0.15, `once: true` semantics — never re-animate on re-scroll). Max
  one reveal per section, no per-child stagger below the fold, first viewport
  renders instantly with the page entrance. Every clinical module renders its full
  page immediately — a reference tool never makes information wait for scroll.
- **No parallax. No scroll-linked transforms. No scroll progress bars.** Anywhere,
  including Landing.
- **Anchor/jump scrolling** (e.g., back-to-top, section index links):
  `scroll-behavior: smooth` is acceptable; it's user-initiated. Respect
  reduced-motion (the existing tokens.css block already forces `auto`).

---

## 10. Banned motion patterns

The animation equivalents of audit.md's AI-template tells. Grep-able, reviewable,
non-negotiable:

1. Spring/bounce physics anywhere — no overshoot, no `cubic-bezier` with values
   outside [0,1] ranges, no "playful" settle.
2. Infinite ambient animation: float, pulse, glow, shimmer, gradient-shift,
   breathing cards. (Sole exemption: the Copilot pending breathe + streaming
   cursor, §6/§7 — active-request states only.)
3. Uniform generic fade: everything entering with the same ~300ms `ease` fade —
   the "template that animates" tell. Entrances follow §5's hierarchy or don't
   animate.
4. Hover that only changes color (see §2 — two channels minimum) and hover on
   non-interactive elements.
5. Skeleton screens (§7) and spinner theater — spinners layered on messages,
   fake progress bars.
6. Error shake / attention wobble on validation and wrong quiz answers.
7. Parallax, scroll-jacking, scroll-linked animation, animated scroll progress.
8. Staggered slide-up cascades on long lists (>5) or on filter re-renders.
9. Typewriter effects on headings/copy. (Real streaming API text is not an effect.)
10. `transition: all`, durations outside §1, `ease-in` starts.
11. Layout-shifting motion: nothing may animate `width`/`height`/`top`/`left` of
    in-flow content except accordions (§6). Transforms and opacity only.
12. backdrop-filter of any kind (glassmorphism stays dead, per audit.md).

---

## 11. Reduced motion

The existing `prefers-reduced-motion` blocks in tokens.css are load-bearing and
protected (design-system.md §7.9). Every NEW animation this spec introduces must
be covered by them (or added to them): entrances collapse to instant appearance,
the Copilot breathe becomes a static line, smooth scroll becomes `auto`,
hover lifts may keep color/shadow but drop transforms. No exceptions — this is an
accessibility contract, not a preference.

---

## 12. Per-module execution order

Same worker discipline as design-system.md §6: one module per task, judgment calls
flagged, build must pass, nothing outside the assigned module.

1. **§12.1 tokens.css motion utilities audit ⚙** — confirm the §1 set is complete;
   add any missing utility (e.g., accordion grid-rows helper, `[data-closing]`
   overlay fade); extend the reduced-motion block to cover them. No new tokens.
2. **§12.2 Copilot ★ (highest priority)** — input focus treatment; Ask button
   hover/press per §2/§3; LOADING_MESSAGE breathe; response section stagger-in;
   save/copy confirmation fades; saved-case row hovers + accordion expand; kill
   `transition: all` (App.jsx:885).
3. **§12.3 ICU Drips ★** — list→detail entrance (the §5 sanctioned double-layer);
   drip-card hover/press; accordion treatment for "Watch out"/"Signals to
   escalate"; filter chips (instant re-render, no re-animation); quiz verdict
   transitions; sticky header conformance.
4. **§12.4 Rhythm Lab ★** — practice-mode interactions: answer press states,
   verdict transitions, next-question section swap; compare-mode focused-card
   treatment (§8); index→rhythm detail entrance.
5. **§12.5 Reference Hub + ABG Lab** — row hovers, table interactions, ABG
   interpret flow section swap.
6. **§12.6 Small pages** (Home hub, Privacy, Support, Download) — page entrances,
   card hovers. Mostly `.ce-*` class application.
7. **§12.7 Landing** — scroll reveals per §9 (the only module that gets them),
   hero entrance, button/card hovers per §2.

---

## 13. DO NOT TOUCH (inherited + motion-specific)

Everything in design-system.md §7, plus:
- The reduced-motion blocks (extend only, never weaken).
- `trackEvent` timing — never delay an analytics call to wait for an animation.
- Focus-visible outlines — never replace with an animated alternative.
- The streaming/parser contract — section stagger must key off parsed sections
  arriving, never buffer or delay content to make the stagger prettier. Content
  first, choreography second, always.
