#!/bin/bash
# ─── Clinical Edge Copilot — App Store Screenshot Renderer ────────────────────
#
# Renders all 5 App Store slides as PNG at 1284×2778 (iPhone 15 Pro Max).
# All screens are code-driven — no external files required.
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

# ── Create output directory ────────────────────────────────────────────────────
mkdir -p out/app-store

echo ""
echo "Rendering App Store screenshots at 1284×2778..."
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
