# Clinical Edge Video Workflow

Automated pipeline for generating TikTok/Reels nursing education videos using Remotion, Claude, and Pexels stock footage.

---

## 1. How to create a new video

```bash
cd my-video
npm run create-video -- "Your Topic Here"
```

Examples:

```bash
npm run create-video -- "Complete Heart Block"
npm run create-video -- "Hyperkalemia ECG Changes"
npm run create-video -- "Septic Shock"
npm run create-video -- "A-Fib with RVR"
npm run create-video -- "DKA"
```

The pipeline runs 5 steps automatically:
1. Generate video script via Claude (or load existing `script.json`)
2. Run quality check (handle, footage, voice, text density)
3. Download Pexels stock footage
4. Write `caption.txt` (TikTok + Instagram captions + hashtags)
5. Render MP4 via Remotion

---

## 2. Where outputs are saved

Every topic gets its own folder under `out/`:

```
out/<slug>/
  video.mp4              ← rendered 1080×1920 MP4, 20 seconds
  script.json            ← generated video script (edit and re-render anytime)
  caption.txt            ← TikTok caption, Instagram caption, hashtags
  assets/
    footage-manifest.json    ← Pexels clip metadata + attribution
    footage-credits.txt      ← legal credits for stock footage

public/footage/<slug>/
  <query>-<pexels-id>.mp4   ← downloaded Pexels clips (gitignored)
```

---

## 3. How to preview in Remotion Studio

```bash
cd my-video
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Select `VideoTemplate` from the left sidebar to preview the generic template. All other named compositions (CompleteHeartBlockVideo, RhythmLabPatternVideo, etc.) are also listed.

To preview with a specific topic's script:

```bash
# Render to studio preview by passing props manually — or just check out/slug/video.mp4
open out/complete-heart-block/video.mp4
```

---

## 4. How to force regenerate the script

By default the pipeline skips Claude if a `script.json` already exists for that topic. Use `--force` to regenerate:

```bash
npm run create-video -- "Complete Heart Block" --force
```

To regenerate script but skip footage re-download (footage already exists):

```bash
npm run create-video -- "Complete Heart Block" --force --skip-footage
```

To re-render only (script and footage already exist — fastest):

```bash
npm run create-video -- "Complete Heart Block" --skip-footage
```

Available flags:

| Flag | Effect |
|---|---|
| `--force` | Regenerate script via Claude even if `script.json` exists |
| `--skip-footage` | Skip Pexels download — use existing clips or none |
| `--skip-render` | Stop after captions — do not render MP4 |

---

## 5. How to troubleshoot missing footage

**Symptom:** Quality check shows `⚠ Footage — none` and the video renders with a dark background instead of stock footage.

**Cause:** The Pexels download was skipped or failed, so `footageFiles` was never written into `script.json`.

**Fix:**

```bash
# Re-run without --skip-footage to trigger the download
npm run create-video -- "Your Topic" --skip-render

# Once footage downloads successfully, render
npm run create-video -- "Your Topic" --skip-footage
```

**If Pexels download fails mid-run:**

1. Check that `PEXELS_API_KEY` is set in `my-video/.env`
2. Verify the key is valid at [pexels.com/api](https://www.pexels.com/api/)
3. Check `out/<slug>/assets/footage-manifest.json` — if it exists, footage was already downloaded and `--skip-footage` is safe to use

**If you want to use your own footage:**

Manually add file paths to `script.json`:

```json
"footageFiles": [
  "footage/your-topic/clip1.mp4",
  "footage/your-topic/clip2.mp4",
  "footage/your-topic/clip3.mp4"
]
```

Place the clips in `public/footage/your-topic/`, then run with `--skip-footage`.

---

## 6. ⚠ Never commit `.env`

The `.env` file contains your API keys and **must never be committed to git**.

```
my-video/.env        ← GITIGNORED — never commit this
```

It is already listed in `.gitignore`. Verify with:

```bash
git check-ignore -v my-video/.env
```

If you need to share the required variables with a collaborator, share `.env.example` instead — it has the variable names with no values filled in.

Required variables:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...   # console.anthropic.com/settings/api-keys
PEXELS_API_KEY=...                   # pexels.com/api (free, instant approval)
```
