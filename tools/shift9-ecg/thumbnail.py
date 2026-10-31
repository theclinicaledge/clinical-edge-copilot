"""Library thumbnail for Shift 09 ("The Loud Distraction"): a centered central telemetry monitor with three rooms.

Usage (from the repo root): python tools/shift9-ecg/thumbnail.py
Writes frontend/src/modules/the-shift/shift9/poster.svg (720 x 360, the poster size other Shifts use).

Room 21 is loud (artifact, then LEADS OFF under a gold alarm), Room 22 is quiet (a calm-looking sinus trace),
Room 23 is irregular (AF spacing, no P waves). The monitor is centered on the card (30 Oct 2026: the call light beside
it was removed). The traces come from ecg_model.py, simplified
for small sizes. Room 22's ST lift is kept subtle so the card doesn't announce the scenario's twist.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import ecg_model as em  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'frontend', 'src', 'modules', 'the-shift', 'shift9', 'poster.svg')
X0, X1 = 118, 528          # trace area inside the screen
SPAN = 3.2                 # seconds shown per channel
MV = 24                    # pixels per millivolt


def rdp(points, eps):
    """Ramer-Douglas-Peucker simplification: keeps the waveform shape with far fewer points."""
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    ab = b - a
    norm = np.hypot(*ab) or 1.0
    rel = points - a
    d = np.abs(ab[0] * rel[:, 1] - ab[1] * rel[:, 0]) / norm
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(points[:i + 1], eps)[:-1], rdp(points[i:], eps)])
    return np.vstack([a, b])


def path(t, y, baseline):
    pts = np.column_stack([X0 + (t - t[0]) / SPAN * (X1 - X0), baseline - y * MV])
    pts = rdp(pts, 0.35)
    return 'M' + ' L'.join(f'{x:.1f} {v:.1f}' for x, v in pts)


rng = np.random.default_rng(9)
# Room 21: sinus beats under motion artifact, then the signal stops (LEADS OFF), as on the D1 strip.
r = [v for v in em.regular_r(SPAN + 1, 96, rng, fit=False)]
t, y = em.render(SPAN, r, dict(p=0.12, q=-0.05, r=1.0, s=-0.18, tw=0.28), 0.625, rng=rng, noise=0.006, wander=0.0)
art = (t > 0.35) & (t < 1.45)
y[art] += 0.14 * np.sin(2 * np.pi * 2.1 * t[art]) + rng.normal(0, 0.04, art.sum())
y[t >= 1.45] = 0.0
room21 = path(t, y, 128)
# Room 22: sinus 88 with only a slight ST lift (simplified; not a diagnostic tracing).
r = em.regular_r(6.0, 88, rng)
t, y = em.render(SPAN, r, dict(p=0.12, q=-0.05, r=1.0, s=-0.16, tw=0.30, st=0.06), 60 / 88, rng=rng, noise=0.004, wander=0.0)
room22 = path(t, y, 196)
# Room 23: AF, irregular R-R and a fibrillatory baseline, no P waves.
r = em.afib_r(11, rng)
f, _ = em.fibrillatory(rng, amp=0.02)
t, y = em.render(SPAN, r, dict(p_on=False, p=0.0, q=-0.04, r=0.95, s=-0.15, tw=0.22), float(np.mean(np.diff(r))), rng=rng, fwave=f, noise=0.004, wander=0.0)
room23 = path(t, y, 264)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360" role="img" aria-labelledby="title desc">
  <title id="title">A telemetry central monitor</title>
  <desc id="desc">Original fictional illustration. A central monitor shows three rooms: Room 21 has wavy artifact, then a flat line under a gold LEADS OFF alarm; Room 22 shows a calm-looking regular trace; Room 23 shows an irregular trace. Not a patient recording.</desc>
  <rect width="720" height="360" fill="#e8e3d8"/>
  <path d="M0 330H720" stroke="#d6d0c4" stroke-width="2"/>
  <g transform="translate(62 0)">
  <rect x="44" y="40" width="508" height="276" rx="16" fill="#cfc8ba"/>
  <rect x="44" y="32" width="508" height="276" rx="16" fill="#0b1f2a"/>
  <rect x="58" y="70" width="480" height="226" rx="8" fill="#10303d"/>
  <text x="62" y="58" font-family="'IBM Plex Mono', Menlo, monospace" font-size="13" font-weight="600" letter-spacing="1.5" fill="#a8c1cc">CENTRAL MONITOR / TELEMETRY</text>
  <circle cx="530" cy="53" r="6" fill="#0abfbc"/>
  <g stroke="#1d4553" stroke-width="1.5"><path d="M58 158H538M58 226H538M104 70V296"/></g>
  <g font-family="'IBM Plex Mono', Menlo, monospace" font-size="22" font-weight="700" fill="#f0ede6" text-anchor="middle">
    <text x="81" y="122">21</text><text x="81" y="200">22</text><text x="81" y="268">23</text>
  </g>
  <path d="{room21}" fill="none" stroke="#7f99a5" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="{room22}" fill="none" stroke="#0abfbc" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="{room23}" fill="none" stroke="#0abfbc" stroke-opacity=".75" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
  <rect x="330" y="84" width="128" height="30" rx="6" fill="#d4a84b"/>
  <text x="394" y="105" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="1" fill="#0b1f2a" text-anchor="middle">LEADS OFF</text>
  <g fill="none" stroke="#d4a84b" stroke-width="4" stroke-linecap="round">
    <path d="M474 89Q482 99 474 109"/><path d="M488 82Q501 99 488 116"/><path d="M502 75Q520 99 502 123"/>
  </g>
  </g>
</svg>
'''
with open(OUT, 'w') as fh:
    fh.write(svg)
print('wrote', os.path.relpath(OUT, ROOT), len(svg.encode()), 'bytes')
