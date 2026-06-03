// ─── Clinical Edge design tokens ─────────────────────────────────────────────
// Sourced directly from frontend/src/App.jsx (current Copilot module)
// Last verified: June 2026
//
// IMPORTANT: The current app has two distinct surfaces:
//   1. Dark header  — #111827 / rgba(11,31,42,0.97)
//   2. Warm workspace — #E7E1D6 (main content area)
//   3. White output cards — #FFFFFF on warm background

export const T = {
  // ── App structure ─────────────────────────────────────────────────────────
  pageBg:       "#111827",              // body background
  headerBg:     "rgba(11,31,42,0.97)",  // sticky header
  workspaceBg:  "#E7E1D6",             // warm workspace (main content)

  // ── Dark cards (input, saved cases — sit on warm workspace) ───────────────
  darkCard:          "#1E2A3A",
  darkCardBorder:    "rgba(240,237,230,0.10)",
  darkCardBorder2:   "#2D3B4E",

  // ── Light cards (section output — white on warm background) ───────────────
  lightCard:         "#FFFFFF",
  lightCardBorder:   "#D6D0C4",
  lightCardText:     "#1E2A3A",

  // ── Accent (CE logo, submit btn, teal elements) ───────────────────────────
  accent:        "#0ABFBC",
  accentDim:     "rgba(10,191,188,0.08)",
  accentBorder:  "rgba(10,191,188,0.25)",
  accentFocus:   "#0ABFBC",             // input border on focus

  // ── Text on dark surfaces ─────────────────────────────────────────────────
  textPrimary:    "#F8FBFC",
  textInput:      "#F0EDE6",            // textarea text on dark card
  textSecondary:  "#A8C1CC",
  textMuted:      "#7F99A5",
  textSubtle:     "#526174",            // also used on warm workspace

  // ── Urgency — on warm light surface (from URGENCY_STYLES in App.jsx) ──────
  urgHighText:    "#8E2F2F",
  urgHighBg:      "rgba(190,70,70,0.10)",
  urgHighBorder:  "#B45454",
  urgHighDark:    "#f4a4a4",            // for dark-surface urgency dots

  // ── Section colors (from SECTIONS array in App.jsx) ───────────────────────
  sectionBlue:    "#4da3ff",   // What this could be
  sectionRed:     "#e05572",   // Possible concerns
  sectionGreen:   "#1FBF75",   // What to assess next
  sectionAmber:   "#F2B94B",   // What to consider next
  closingAccent:  "#0ABFBC",   // Closing section

  // ── Fonts (from App.jsx @import) ──────────────────────────────────────────
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};
