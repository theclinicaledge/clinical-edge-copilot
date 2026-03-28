# Clinical Edge — Instagram Carousel Templates

5 reusable slides at 1080×1350 (Instagram portrait format).

## Files

```
carousel/
  index.html    ← All 5 slides, preview + edit here
  export.js     ← Puppeteer script to export PNGs
  exports/      ← Created on first export run
  README.md
```

## Preview locally

Open `index.html` directly in any browser:
```
open carousel/index.html
```
All 5 slides stack vertically. Use browser zoom to fit your screen.

## Editing slide content

Every editable text block is marked with a comment:
```html
<!-- ✏️ EDITABLE: Description -->
Your text here
```
Search for `✏️ EDITABLE` to jump to every swappable piece of copy.

**Do not edit** the structural HTML or CSS — only the text inside marked blocks.

## Export to PNG (Puppeteer method — best quality)

```bash
cd carousel
npm install puppeteer   # one-time setup
node export.js
```

Exports to `carousel/exports/` at 2160×2700 (2× retina — Instagram loves this).

## Export via browser screenshot (manual method)

1. Open `index.html` in Chrome
2. Open DevTools → Toggle Device Toolbar (⌘⇧M)
3. Set a custom device: **1080 × 1350**
4. Zoom: 100%
5. Right-click each slide element → **Capture node screenshot**
   - Or use DevTools console: `document.getElementById('slide-1').scrollIntoView()`
   - Then: DevTools → More tools → Rendering → Capture screenshot

## Creating a new carousel post

1. Duplicate `index.html` → rename it (e.g. `post-02-sepsis.html`)
2. Find every `✏️ EDITABLE` comment and update the copy
3. Export the 5 slides as PNGs
4. Upload to Instagram as a carousel (5 images)

## Slide layout guide

| Slide | Purpose | Key elements |
|-------|---------|-------------|
| 01 Cover | Hook + topic | Big headline, overline, swipe prompt |
| 02 Problem | Why this matters | Problem framing, insight cards, pull quote |
| 03 Education | Main content | Numbered steps, section labels |
| 04 Scenario | Real example | Input scenario + AI response cards |
| 05 CTA | Convert | Takeaways, CTA button, handle |
