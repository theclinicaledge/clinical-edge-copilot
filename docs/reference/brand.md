# Brand Reference

## App Identity
- **Name:** Clinical Edge Copilot
- **Short name:** Copilot
- **Tagline (header):** Clinical Edge / Copilot
- **Badge:** BETA
- **Description:** AI-powered clinical reasoning support for bedside nurses

## Logo Mark
SVG paths, fill `#00C2D1`, viewBox `0 0 225 200`:
```
M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z
M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z
M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z
M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z
```
- Logo size in header: 30×30px
- aria-label: `Clinical Edge`

## Colors
| Token | Value | Use |
|---|---|---|
| Background | `#0B1F2A` | App background, header, manifest |
| Body bg (CSS) | `#060d1a` | index.css body |
| Surface | `#112936` | Input card |
| Brand cyan | `#00C2D1` | Primary accent, logo, CTA button bg |
| Brand cyan hover | `#19D3E0` | Submit button hover |
| Teal badge | `#4FD1C5` | Beta badge |
| Text primary | `#F8FBFC` | Input text, headings |
| Text body | `#A8C1CC` | Section card body text |
| Text muted | `#7F99A5` | Labels, secondary |
| Text dim | `#3A5566` | Hotkey hint, footer |
| Text placeholder | `#2E4A5C` | Textarea placeholder |

## Urgency Colors
| Level | Text | Background | Border |
|---|---|---|---|
| HIGH | `#fca5a5` | `rgba(239,68,68,0.12)` | `rgba(239,68,68,0.4)` |
| MODERATE | `#fcd34d` | `rgba(245,158,11,0.12)` | `rgba(245,158,11,0.4)` |
| LOW | `#86efac` | `rgba(34,197,94,0.10)` | `rgba(34,197,94,0.35)` |

## Section Card Accent Colors
| Section | Accent | Background |
|---|---|---|
| What this could be | `#4da3ff` | `rgba(77,163,255,0.06)` |
| What concerns me most | `#e05572` | `rgba(224,85,114,0.06)` |
| What I'd assess next | `#1FBF75` | `rgba(31,191,117,0.06)` |
| What I'd do right now | `#F2B94B` | `rgba(242,185,75,0.06)` |
| Closing | `#00C2D1` | — (left border only) |

## Typography
| Role | Font | Weight | Notes |
|---|---|---|---|
| Body / UI | Inter, -apple-system, BlinkMacSystemFont, sans-serif | 400–700 | Primary font |
| Mono labels | IBM Plex Mono, Courier New, monospace | 400–500 | Section labels, badges, footer |
| Hero h1 | Inter | 700 | clamp(22px,5vw,34px), letter-spacing -0.03em |
| Wordmark | Inter | 700 | 15px, letter-spacing -0.3px |
| Sub-wordmark | IBM Plex Mono | 500 | 10px, uppercase, letter-spacing 0.7px |

## Background Gradient
```css
radial-gradient(circle at top center,
  rgba(0,194,209,0.08) 0%,
  rgba(0,194,209,0.03) 22%,
  rgba(11,31,42,0) 52%
),
linear-gradient(to bottom,
  rgba(255,255,255,0.02) 0%,
  rgba(255,255,255,0) 18%,
  rgba(0,0,0,0.10) 100%
),
#0B1F2A
```

## Border / Surface
- Card border: `1px solid rgba(255,255,255,0.09)`
- Card radius: 14px (corners), 11px (section cards)
- Section left border: 3px solid accent
- Divider: `1px solid rgba(255,255,255,0.07)`
