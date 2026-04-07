#!/bin/bash
# ─── Clinical Edge Copilot — App Store Screenshot Renderer ────────────────────
#
# Renders all 5 App Store slides as PNG at 1290×2796 (iPhone 15 Pro Max).
#
# Before running:
#   Place source screenshots in public/screenshots/ — see PLACE_SCREENSHOTS_HERE.md
#
# Usage:
#   cd my-video
#   ./render-app-store-shots.sh
#
# Output:
#   out/app-store/shot-01.png  through  shot-05.png

set -e

# Always run from the my-video directory
cd "$(dirname "$0")"

# ── Pre-flight: check screenshots are present ──────────────────────────────────
REQUIRED=(
  "public/screenshots/screen-01-home-input.jpg"
  "public/screenshots/screen-02-urgency-high.jpg"
  "public/screenshots/screen-03-response-actions.jpg"
  "public/screenshots/screen-04-quick-questions.jpg"
  "public/screenshots/screen-05-sbar.jpg"
)

MISSING=0
for f in "${REQUIRED[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  ✗ Missing: $f"
    MISSING=1
  fi
done

if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "Add the missing screenshots to public/screenshots/ and try again."
  echo "See public/screenshots/PLACE_SCREENSHOTS_HERE.md for which screenshot goes in each file."
  exit 1
fi

# ── Create output directory ────────────────────────────────────────────────────
mkdir -p out/app-store

echo ""
echo "Rendering App Store screenshots at 1290×2796..."
echo ""

# ── Render each slide ──────────────────────────────────────────────────────────
render_slide() {
  local COMP_ID=$1
  local OUTPUT=$2
  local LABEL=$3

  npx remotion still "$COMP_ID" "$OUTPUT" --image-format=png 2>/dev/null \
    && echo "  ✓ $LABEL → $OUTPUT" \
    || { echo "  ✗ Failed: $LABEL"; exit 1; }
}

render_slide "AppStoreShot1" "out/app-store/shot-01.png" "Slide 1 — Clinical support that thinks like a nurse"
render_slide "AppStoreShot2" "out/app-store/shot-02.png" "Slide 2 — When something doesn't feel right"
render_slide "AppStoreShot3" "out/app-store/shot-03.png" "Slide 3 — Think before you call"
render_slide "AppStoreShot4" "out/app-store/shot-04.png" "Slide 4 — Quick questions. Real answers."
render_slide "AppStoreShot5" "out/app-store/shot-05.png" "Slide 5 — Built for real shift thinking"

echo ""
echo "Done. Find your screenshots in:  my-video/out/app-store/"
echo ""
ls -lh out/app-store/*.png 2>/dev/null || true
