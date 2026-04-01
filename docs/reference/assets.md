# Assets Reference

## Logo / Brand Mark

| File | Description |
|---|---|
| `frontend/public/logo.svg` | Canonical CE mark — viewBox `0 0 225 200`, fill `#00C2D1`, bg `#0B1F2A` |
| `frontend/public/logo-padded.svg` | Padded square master for icons — 1024×1024, logo at 75% width, 12.5% h-padding, 16.7% v-padding |

## Favicon

| File | Size |
|---|---|
| `frontend/public/favicon.ico` | Multi-size ICO (16×16 embedded) |
| `frontend/public/favicon.png` | 32×32 PNG |
| `frontend/public/favicon-16x16.png` | 16×16 PNG |
| `frontend/public/favicon-32x32.png` | 32×32 PNG |

## App Icons

| File | Size | Use |
|---|---|---|
| `frontend/public/apple-touch-icon.png` | 180×180 | iOS home screen |
| `frontend/public/apple-touch-icon-v2.png` | 180×180 | iOS (alt/versioned) |
| `frontend/public/android-chrome-192x192.png` | 192×192 | Android / PWA |
| `frontend/public/android-chrome-512x512.png` | 512×512 | Android / PWA splash |
| `frontend/public/icon-192.png` | 192×192 | PWA (alias) |
| `frontend/public/icon-512.png` | 512×512 | PWA (alias) |

## Other SVG

| File | Description |
|---|---|
| `frontend/public/icons.svg` | UI icon sprite |

## PWA Manifest
- `frontend/public/manifest.json`
- Icons declared: `android-chrome-192x192.png`, `android-chrome-512x512.png`
- Purpose: `any maskable`

## index.html Meta Tags
```html
<meta name="theme-color" content="#0B1F2A" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="msapplication-TileColor" content="#0B1F2A" />
```

## Fonts (loaded via Google Fonts CDN)
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap
```

## Source Images
| File | Use |
|---|---|
| `frontend/src/assets/hero.png` | Hero/reference image (desktop) |
