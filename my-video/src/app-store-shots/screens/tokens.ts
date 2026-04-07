// ─── Mock Screen Design Tokens ────────────────────────────────────────────────
//
// Scale reference: iPhone 15 Pro Max viewport = 430 CSS px → 1290px canvas
// Every app CSS value × S = canvas pixels
//
export const S = 3;

export const C = {
  // Backgrounds
  bgApp:   "#0B1F2A",
  bgCard:  "#0F2232",
  bgCard2: "rgba(20,48,66,0.99)",

  // Text
  textPrimary: "#F8FBFC",
  textBody:    "#A8C1CC",
  textMuted:   "#7F99A5",
  textDim:     "#4A6978",
  textHint:    "#3A5566",

  // Accent
  teal:        "#00C2D1",
  tealFaint:   "rgba(0,194,209,0.06)",
  tealBorder:  "rgba(0,194,209,0.18)",

  // Borders
  border:      "rgba(255,255,255,0.09)",
  borderFaint: "rgba(255,255,255,0.055)",
  borderDim:   "rgba(255,255,255,0.07)",

  // Section cards
  blue:    "#4da3ff",    bgBlue:    "rgba(77,163,255,0.06)",
  red:     "#e05572",    bgRed:     "rgba(224,85,114,0.06)",
  green:   "#1FBF75",    bgGreen:   "rgba(31,191,117,0.06)",
  yellow:  "#F2B94B",    bgYellow:  "rgba(242,185,75,0.06)",

  // Urgency
  urgHigh:       "#fca5a5",
  urgHighBg:     "rgba(239,68,68,0.10)",
  urgHighBorder: "rgba(239,68,68,0.38)",

  // Warning (amber)
  amber:       "#F59E0B",
  amberBg:     "rgba(245,158,11,0.08)",
  amberBorder: "rgba(245,158,11,0.32)",
  amberText:   "#E9BA4B",
};

// Font stacks — system fonts render as SF Pro on macOS (where rendering runs)
export const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';
export const MONO = '"IBM Plex Mono", "SF Mono", "Courier New", monospace';
