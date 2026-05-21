# App Screen Assets — Clinical Edge Copilot Carousel

Drop real app screenshots here to replace the hand-coded UI placeholders in `post-58.html`.

## Screenshot → Slide Mapping

| File name              | Used in slide | Description                                      |
|------------------------|---------------|--------------------------------------------------|
| `screen-home.png`      | Slide 1       | App home / query input screen                   |
| `screen-results.png`   | Slide 2       | Full results page — urgency badge + sections     |
| `screen-warning.png`   | Slide 3       | Warning card + urgency detail (rose/red scheme)  |
| `screen-sections.png`  | Slide 4       | Section cards expanded (blue, rose, green, amber)|
| `screen-sbar.png`      | Slide 5       | SBAR handoff draft — dark card                  |
| `screen-followup.png`  | Slide 6       | Follow-up / "Anything change?" input card       |
| `screen-notebook.png`  | Slide 7       | Saved cases / notebook view (optional)          |

## How to integrate

1. Add the screenshot file to this folder.
2. Open `post-58.html` and find the `<!-- SCREENSHOT PLACEHOLDER -->` comment for the relevant slide.
3. Replace the hand-coded `<div class="ra-scroll">…</div>` block with:

```html
<img src="carousel-assets/app-screens/screen-XXXX.png"
     style="width:100%; height:100%; object-fit:cover; object-position:top;"
     alt="Clinical Edge Copilot app screenshot" />
```

4. Re-export via `npm run export`.

## Notes
- Screenshots should be taken at 3× on an iPhone 15 Pro or similar (393 pt wide → 1179 px wide at 3×).
- Crop to just the screen content (exclude device frame — the HTML provides its own frame).
- PNG preferred for sharpness; JPEG acceptable if file size is a concern.
- Keep the hand-coded placeholders in the HTML as a fallback — wrap screenshot in a conditional comment if desired.
