# Screens Reference

## Layout
- Max content width: `680px`, centered
- Single-page app (no routes except `/#/landing`)
- Body padding-bottom: `calc(80px + env(safe-area-inset-bottom))`

---

## Screen 1 — Home (idle, no result)

### Header (sticky)
- Position: sticky top, z-index 50
- Background: `rgba(11,31,42,0.97)` + blur(20px)
- Border-bottom: `1px solid rgba(255,255,255,0.05)`
- Padding: safe-area-inset-top aware
- Contents: [CE logo mark 30×30] [Wordmark col: "Clinical Edge" / "Copilot"] [→ Beta badge] [Learn more link]

### Hero
- textAlign: center, marginBottom: 26px (desktop) / 18px (mobile)
- H1 → bridge line → subline (subline hidden on mobile)

### Preview Strip (desktop only, hidden ≤768px)
- Scrollable horizontal pill row
- Fused to top of input card (no bottom radius, no border-bottom)
- Label + 4 pills

### Input Card
- Background: `#112936`, border-radius: 14px (bottom corners desktop; all corners mobile)
- Contains: textarea (3 rows) + bottom toolbar [hotkey hint | submit button]
- marginBottom: 14px

### Below Card
- Helper line: `Just describe the scenario in your own words.`
- Privacy notice (warning box) — amber tones

### Recent Cases (conditional — shown if history exists)
- Section label: `Recent Cases` (mono uppercase)
- Chip row (max 3 on mobile via CSS)

### Saved Cases (conditional — shown if savedCases.length > 0)
- Section label: `Saved Cases (N)` (mono uppercase)
- List of `SavedCaseRow` components

### Try This
- Section label: `Try this:` (mono uppercase)
- 6 example chips (max 3 on mobile)
- marginBottom: 36px

### Footer Disclaimer
- marginTop: 48px, borderTop
- Mono font, dim color `#3A5566`

---

## Screen 2 — Home (loading / streaming)

All Home (idle) elements visible above result area, plus:

### Loading State
- 4 animated vertical bars (barPulse animation, color `#00C2D1`)
- Rotating phase message below bars (IBM Plex Mono, `#7F99A5`)

### Streaming State
- Same loading indicator
- `StreamPreview` component: raw text preview with blinking cursor (`#00C2D1`)
- maxHeight: 320px, scrollable

---

## Screen 3 — Home (result displayed)

Same header + input area above, result block below:

### Trust Cue Bar
- Amber icon + message: `Structured clinical reasoning support — always confirm with your assessment and provider guidance`

### Urgency Badge
- Inline-flex pill, color-coded by HIGH / MODERATE / LOW

### Urgent Warning (conditional — HIGH urgency)
- Red-toned box, left accent border, bold text

### Section Cards (ordered)
1. What this could be — blue accent
2. What concerns me most — red accent
3. What I'd assess next — green accent
4. What I'd do right now — amber accent
5. Closing — cyan left-border italic line only

Each card: label (9px mono uppercase, accent color) + body (14px, `#A8C1CC`, 1.75 line-height, `›` bullets)

### Action Bar
- [+ Save Case] [Copy Response]
- borderTop, flexWrap

### Continue Thinking Panel
- Cyan-tinted bordered box
- Label: `Continue Thinking` (9px mono uppercase)
- Textarea + `Continue →` button

---

## Mobile Overrides (≤768px)
- Preview strip: hidden
- Input card: full border-radius (14px all corners)
- Privacy notice: softer amber (reduced opacity)
- Main container: `padding: 28px 16px 0`
- Hero: `margin-bottom: 18px`
- H1: `margin-bottom: 10px`
- Bridge line: 15px, line-height 1.35, max-width 320px, margin-bottom 6px
- Subline: hidden
- Chips (recent + try): max 3 visible, nth-child(n+4) hidden

---

## PWA / Install
- Display: standalone
- Orientation: portrait-primary
- Theme color: `#0B1F2A`
- Background color: `#0B1F2A`
