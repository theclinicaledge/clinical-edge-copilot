#!/bin/bash
# ─── Clinical Edge Copilot — App Store Screenshot Renderer ────────────────────
#
# Renders all 5 App Store slides as PNG at 1284×2778 (iPhone 15 Pro Max).
# Real app screenshots are loaded via staticFile() from public/screenshots/.
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

# ── Pre-flight: verify screenshot assets exist ─────────────────────────────────
SHOTS_DIR="public/screenshots"
REQUIRED=("home.png" "urgency.png" "assessments.png" "actions.png" "sbar.png")
MISSING=0

echo ""
echo "Checking screenshot assets..."
for f in "${REQUIRED[@]}"; do
  if [[ -f "$SHOTS_DIR/$f" ]]; then
    echo "  ✓  $SHOTS_DIR/$f"
  else
    echo "  ✗  MISSING: $SHOTS_DIR/$f"
    MISSING=1
  fi
done

if [[ $MISSING -eq 1 ]]; then
  echo ""
  echo "ERROR: One or more screenshot files are missing."
  echo "Place your real app screenshots in public/screenshots/ with the filenames above."
  echo "See public/screenshots/PLACE_SCREENSHOTS_HERE.md for details."
  echo ""
  exit 1
fi

# ── Create output directory ────────────────────────────────────────────────────
mkdir -p out/app-store

echo ""
echo "Rendering App Store screenshots at 1284×2778..."
echo ""

# ── Render each slide ─────────────────────────────────────────────────────────
# Note: stderr is NOT suppressed so errors are visible.
render_slide() {
  local COMP_ID=$1
  local OUTPUT=$2
  local LABEL=$3

  echo "  Rendering $LABEL..."
  if npx remotion still "$COMP_ID" "$OUTPUT" --image-format=png; then
    echo "  ✓  $LABEL → $OUTPUT"
  else
    echo ""
    echo "  ✗  FAILED: $LABEL"
    echo "  Run  npx remotion still $COMP_ID  manually to see the full error."
    exit 1
  fi
  echo ""
}

render_slide "AppStoreShot1" "out/app-store/shot-01.png" "Slide 1 — Think clearly before you call"
render_slide "AppStoreShot2" "out/app-store/shot-02.png" "Slide 2 — Know what you're dealing with"
render_slide "AppStoreShot3" "out/app-store/shot-03.png" "Slide 3 — Know what to assess next"
render_slide "AppStoreShot4" "out/app-store/shot-04.png" "Slide 4 — Know when and how to escalate"
render_slide "AppStoreShot5" "out/app-store/shot-05.png" "Slide 5 — SBAR ready in seconds"

echo "Done. Screenshots saved to:  my-video/out/app-store/"
echo ""
ls -lh out/app-store/*.png 2>/dev/null || true
