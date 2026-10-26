"""Render every SHIFT-009 ECG illustration and write manifest.json.

Usage (from the repo root):  python tools/shift9-ecg/generate.py
Writes PNGs to frontend/src/modules/the-shift/shift9/assets/ and tools/shift9-ecg/manifest.json.
Deterministic: fixed seeds, so the same library versions reproduce the same images.
"""
import hashlib
import json
import os
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import ecg_model as em  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
# SHIFT9_ECG_OUT redirects all output (images, manifest, signals) for trial runs.
TRIAL = os.environ.get('SHIFT9_ECG_OUT')
OUT = TRIAL or os.path.join(ROOT, 'frontend', 'src', 'modules', 'the-shift', 'shift9', 'assets')
MANIFEST = os.path.join(TRIAL or os.path.dirname(__file__), 'manifest.json')
PINK_MINOR, PINK_MAJOR, INK = '#f6c9cf', '#e88a96', '#1a1a1a'
NOTE = 'Illustration for teaching. Not a patient recording. Clinical review pending.'
STRIP_DPI, TWELVE_DPI, VIEW_DPI = 300, 200, 400
manifest = {'generator': 'tools/shift9-ecg/generate.py', 'qtc_target_s': em.QTC_TARGET,
            'qt_formula': 'Framingham (Sagie 1992): QT = QTc - 0.154 x (1 - RR), per beat from the preceding R-R',
            'paper': {'mm_per_s': 25, 'mm_per_mV': 10}, 'versions': {'numpy': np.__version__, 'matplotlib': matplotlib.__version__}, 'assets': {}}


def paper(ax, x0, x1, y0, y1):
    ax.set_xlim(x0, x1)
    ax.set_ylim(y0, y1)
    for x in np.arange(np.floor(x0 / 0.04) * 0.04, x1 + 1e-9, 0.04):
        major = abs(x / 0.2 - round(x / 0.2)) < 1e-6
        ax.axvline(x, color=PINK_MAJOR if major else PINK_MINOR, lw=0.8 if major else 0.4, zorder=0)
    for y in np.arange(np.floor(y0 * 10) / 10, y1 + 1e-9, 0.1):
        major = abs(y / 0.5 - round(y / 0.5)) < 1e-6
        ax.axhline(y, color=PINK_MAJOR if major else PINK_MINOR, lw=0.8 if major else 0.4, zorder=0)
    ax.axis('off')


def bbox_px(fig, ax):
    """Axes box in image pixels, origin top-left: [left, top, right, bottom]."""
    fig.canvas.draw()
    b = ax.get_window_extent()
    h = fig.get_size_inches()[1] * fig.dpi
    return [float(b.x0), float(h - b.y1), float(b.x1), float(h - b.y0)]


def save(fig, name, record):
    path = os.path.join(OUT, name)
    fig.savefig(path, facecolor='white')
    plt.close(fig)
    with open(path, 'rb') as f:
        data = f.read()
    record['sha256'] = hashlib.sha256(data).hexdigest()
    record['bytes'] = len(data)
    manifest['assets'][name] = record


def cal(ax, x, base):
    ax.plot([x, x + 0.04, x + 0.04, x + 0.24, x + 0.24, x + 0.28], [base, base, base + 1, base + 1, base, base], color=INK, lw=0.9, zorder=4)


# ----------------------------------------------------------------------------- rhythm strips

STRIP_SIGNALS = {}


def strip(name, t, y, title, sub, record, lo=-0.8, hi=1.6, overlay=None):
    # Stored as int16 in units of 0.1 microvolt (far below anything measurable), with the start time.
    STRIP_SIGNALS[name] = np.round(y * 1e4).astype(np.int16)
    STRIP_SIGNALS[name + ':t0'] = np.array([t[0]])
    dur = round(t[-1] - t[0] + 1 / em.FS, 6)
    # True paper scale: 1 mm is the same size across and up, so grid boxes are square (v0.8 images were
    # 1.27x taller than wide, which exaggerated every amplitude).
    mm_w, mm_h, pad = dur * 25, (hi - lo) * 10, 8.0
    k = 1.15
    fig = plt.figure(figsize=(mm_w / 25.4 * k, (mm_h + 2 * pad) / 25.4 * k), dpi=STRIP_DPI)
    ax = fig.add_axes([0, pad / (mm_h + 2 * pad), 1, mm_h / (mm_h + 2 * pad)])
    paper(ax, 0, dur, lo, hi)
    ax.plot(t, y, color=INK, lw=1.1, zorder=3)
    if overlay:
        overlay(ax)
    top_y, bot_y = 1 - 0.5 * pad / (mm_h + 2 * pad), 0.5 * pad / (mm_h + 2 * pad)
    fig.text(0.008, top_y, title, fontsize=9, weight='bold', color=INK, va='center')
    fig.text(0.992, top_y, sub, fontsize=8, color=INK, va='center', ha='right')
    fig.text(0.008, bot_y, '25 mm/s  10 mm/mV  6-second strip', fontsize=7, color='#555', va='center')
    fig.text(0.992, bot_y, NOTE, fontsize=7, color='#555', va='center', ha='right')
    record.update({'kind': 'strip', 'title': title, 'label': sub, 'dpi': STRIP_DPI,
                   'axes_px': bbox_px(fig, ax), 'x_range_s': [0, dur], 'y_range_mV': [lo, hi]})
    save(fig, name, record)


DUR = 6.0
SINUS = dict(p=0.12, q=-0.05, r=1.0, s=-0.18, tw=0.28)


def sinus_strip(name, hr, seed, title, sub, params=None, extra=None):
    rng = np.random.default_rng(seed)
    r = em.regular_r(DUR, hr, rng)
    p = dict(SINUS, **(params or {}))
    t, y = em.render(DUR, r, p, 60 / hr, rng=rng)
    strip(name, t, y, title, sub, dict({'rhythm': 'sinus', 'hr': hr, 'r_times_s': [round(v, 4) for v in r],
                                       'beat_params': p, 'seed': seed}, **(extra or {})))


sinus_strip('rm21_1430_sinus84.png', 84, 21, 'Room 21  |  Lead II  |  1430', 'Sinus rhythm  |  HR 84')
sinus_strip('rm22_1430_sinus88.png', 88, 22, 'Room 22  |  Lead II  |  1430', 'Sinus rhythm  |  HR 88  |  ST at baseline', dict(s=-0.16))
sinus_strip('rm22_1508_sinus94_ste.png', 94, 23, 'Room 22  |  Lead II  |  1508', 'HR 94',
            dict(q=-0.07, r=0.92, s=-0.08, tw=0.40, st=0.15), {'st_intended_mV': 0.15})

# Room 21, 1505: sinus beats under motion artifact for about 3 seconds, then LEADS OFF (flat line).
rng = np.random.default_rng(15)
r = [v for v in em.regular_r(DUR, 96, rng, fit=False) if v < 2.9]
t, y = em.render(DUR, r, SINUS, 60 / 96, rng=rng, noise=0.008)
art = (t > 0.6) & (t < 3.3)
y[art] += 0.16 * np.sin(2 * np.pi * 1.7 * t[art]) + rng.normal(0, 0.05, art.sum())
burst = (t > 1.9) & (t < 2.3)
y[burst] += rng.normal(0, 0.12, burst.sum())
off = t >= 3.3
y[off] = rng.normal(0, 0.002, off.sum())


def leads_off(ax):
    ax.add_patch(plt.Rectangle((3.75, 0.85), 1.6, 0.42, color='#fff7d6', ec='#b8860b', lw=1.2, zorder=4))
    ax.text(4.55, 1.06, 'LEADS OFF', ha='center', va='center', fontsize=11, weight='bold', color='#8a5a00', zorder=5)


strip('rm21_1505_artifact_leadsoff.png', t, y, 'Room 21  |  Lead II  |  1505', 'Central monitor',
      {'rhythm': 'sinus under artifact, then leads off', 'hr': 96, 'r_times_s': [round(v, 4) for v in r], 'artifact_s': [0.6, 3.3],
       'leads_off_from_s': 3.3, 'beat_params': SINUS, 'seed': 15}, overlay=leads_off)

# Room 23: AF at different rates. No P waves, fibrillatory baseline, irregularly irregular R-R.
AF = dict(p_on=False, p=0.0, q=-0.04, r=0.95, s=-0.15, tw=0.22)
for name, n, title, sub, seed in [
    ('rm23_1430_afib110.png', 11, 'Room 23  |  Lead II  |  1430', 'Atrial fibrillation  |  HR about 110  (11 QRS in 6 s, x 10)', 31),
    ('rm23_1535_afib110_rewindA.png', 11, 'Room 23  |  Lead II  |  1535', 'HR about 110  (11 QRS in 6 s, x 10)', 32),
    ('rm23_rewindB_afib150.png', 15, 'Room 23  |  Lead II  |  1535  |  Version B', 'HR about 150  (15 QRS in 6 s, x 10)', 33),
    ('rm23_rewindC_afib130.png', 13, 'Room 23  |  Lead II  |  1535  |  Version C', 'HR about 130  (13 QRS in 6 s, x 10)', 34),
]:
    rng = np.random.default_rng(seed)
    r = em.afib_r(n, rng)
    f, comps = em.fibrillatory(rng)
    t, y = em.render(DUR, r, AF, float(np.mean(np.diff(r))), rng=rng, fwave=f)
    strip(name, t, y, title, sub, {'rhythm': 'atrial fibrillation', 'qrs_in_6s': n, 'hr': n * 10, 'r_times_s': [round(v, 4) for v in r],
                                   'beat_params': AF, 'fwave_components': [[round(c, 4) for c in comp] for comp in comps], 'seed': seed})

# ----------------------------------------------------------------------------- 12-lead (Room 22, 1513)
HR = 94
W = 10.0
rng = np.random.default_rng(11)
rr = 60 / HR
r_all, x = [], 0.45
while x < W - 0.3:
    r_all.append(x)
    x += rr + rng.normal(0, 0.004)
t = np.arange(0, W, 1 / em.FS)


def lead(params):
    _, y = em.render(W, r_all, params, rr, rng=rng, wander=0.0)
    return y


# Independent leads I and III; II and the augmented leads are derived (Einthoven, Goldberger).
LIMB = {
    'I': dict(p=0.06, q=-0.05, r=0.78, s=-0.22, tw=-0.03, st=-0.10),
    'III': dict(p=0.07, q=-0.05, r=0.46, s=-0.06, tw=0.46, st=0.25),  # same QRS timing as I, so derived leads aren't notched
}
L = {k: lead(v) for k, v in LIMB.items()}
L['II'] = L['I'] + L['III']
L['aVR'] = -(L['I'] + L['II']) / 2
L['aVL'] = L['I'] - L['II'] / 2
L['aVF'] = L['II'] - L['I'] / 2
PREC = {
    'V1': dict(p=0.05, q=0.0, r=0.20, s=-0.92, tw=0.06),
    'V2': dict(p=0.06, q=0.0, r=0.40, s=-1.20, tw=0.40, st=0.05, t_rise_pow=3.0),  # normal slight J elevation, not injury
    'V3': dict(p=0.06, q=0.0, r=0.80, s=-0.70, tw=0.40, st=0.03, t_rise_pow=3.0),
    'V4': dict(p=0.07, q=-0.04, r=1.20, s=-0.40, tw=0.36),
    'V5': dict(p=0.07, q=-0.05, r=1.30, s=-0.20, tw=0.30),
    'V6': dict(p=0.07, q=-0.05, r=1.00, s=-0.10, tw=0.25),
}
for k, v in PREC.items():
    L[k] = lead(v)
assert np.allclose(L['II'], L['I'] + L['III'])
assert np.allclose(L['aVR'] + L['aVL'] + L['aVF'], 0, atol=1e-9)
ORDER = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']
# Only the independent leads are stored (int16, 0.1 microvolt units); validate.py derives the rest.
np.savez_compressed(os.path.join(TRIAL or os.path.dirname(__file__), 'twelve_lead_signals.npz'),
                    **{k: np.round(L[k] * 1e4).astype(np.int16) for k in ['I', 'III', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']})

twelve = {'rhythm': 'sinus', 'hr': HR, 'r_times_s': [round(v, 4) for v in r_all], 'limb_params': LIMB, 'precordial_params': PREC,
          'derivation': 'II = I + III; aVR = -(I + II)/2; aVL = I - II/2; aVF = II - I/2', 'seed': 11, 'signals': 'tools/shift9-ecg/twelve_lead_signals.npz'}

row_h, H = 3.0, 12.0
fig = plt.figure(figsize=(W * 25 / 25.4, (H * 10 + 18) / 25.4), dpi=TWELVE_DPI)
ax = fig.add_axes([0, 8 / (H * 10 + 18), 1, H * 10 / (H * 10 + 18)])  # square grid: 120 mm of paper in 120 mm of axes
paper(ax, 0, W, 0, H)
layout = [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']]
segments = []
for ri, row in enumerate(layout):
    base = H - row_h * (ri + 0.5)
    cal(ax, 0.02, base)
    for ci, name in enumerate(row):
        t0, t1 = ci * 2.5, (ci + 1) * 2.5
        m = (t >= max(t0, 0.32 if ci == 0 else t0)) & (t < t1)
        ax.plot(t[m], L[name][m] + base, color=INK, lw=0.9, zorder=3)
        lx = t0 + (0.34 if ci == 0 else 0.06)
        ax.text(lx, base + 1.05, name, fontsize=9, weight='bold', color=INK, zorder=5)
        if ci > 0:
            ax.plot([t0, t0], [base - 0.25, base + 0.25], color=INK, lw=0.9, zorder=3)
        segments.append({'lead': name, 't0': max(t0, 0.32 if ci == 0 else t0), 't1': t1, 'base_mV': base, 'label_x_s': [lx, lx + 0.32]})
base = row_h * 0.5
cal(ax, 0.02, base)
m = t >= 0.32
ax.plot(t[m], L['II'][m] + base, color=INK, lw=0.9, zorder=3)
ax.text(0.34, base + 1.05, 'II (rhythm)', fontsize=9, weight='bold', color=INK, zorder=5)
segments.append({'lead': 'II', 't0': 0.32, 't1': W, 'base_mV': base, 'label_x_s': [0.34, 1.2], 'rhythm_strip': True})
fig.text(0.006, 1 - 5 / (H * 10 + 18), 'Room 22  |  12-lead ECG  |  1513', fontsize=10, weight='bold', color=INK, va='center')
fig.text(0.994, 1 - 5 / (H * 10 + 18), f'HR {HR}', fontsize=9, color=INK, va='center', ha='right')
fig.text(0.006, 4 / (H * 10 + 18), '25 mm/s  10 mm/mV  |  1 mV calibration pulse at the start of each row', fontsize=7, color='#555', va='center')
fig.text(0.994, 4 / (H * 10 + 18), NOTE, fontsize=7, color='#555', va='center', ha='right')
save(fig, 'rm22_1513_12lead_inferior_stemi.png', dict(twelve, kind='twelve-lead', view='12-lead', dpi=TWELVE_DPI, axes_px=bbox_px(fig, ax),
                                                     x_range_s=[0, W], y_range_mV=[0, H], segments=segments))


# Focused views of the same signals for phones: six simultaneous rows over the same 2.5 seconds,
# each with its own label and 1 mV calibration pulse. Lead order is the standard one, so the view
# doesn't point at any group of leads.
def view(name, leads, row_mv, lo_frac, subtitle):
    tw0 = round(r_all[2] - 0.25, 3)
    span = 2.5
    gutter = 0.5
    rows = len(leads)
    Hh = rows * row_mv
    mm_w = (span + gutter) * 25
    mm_h = Hh * 10
    head, foot = 9.0, 8.0
    fig = plt.figure(figsize=(mm_w / 25.4, (mm_h + head + foot) / 25.4), dpi=VIEW_DPI)
    ax = fig.add_axes([0, foot / (mm_h + head + foot), 1, mm_h / (mm_h + head + foot)])
    paper(ax, -gutter, span, 0, Hh)
    m = (t >= tw0) & (t < tw0 + span)
    segs = []
    for i, ld in enumerate(leads):
        base = Hh - row_mv * (i + 1) + row_mv * lo_frac
        cal(ax, -0.42, base)
        ax.text(-0.46, base + row_mv * (1 - lo_frac) - 0.28, ld, fontsize=8, weight='bold', color=INK, zorder=5)
        ax.plot(t[m] - tw0, L[ld][m] + base, color=INK, lw=0.8, zorder=3)
        segs.append({'lead': ld, 't0': tw0, 't1': tw0 + span, 'x_offset_s': -tw0, 'base_mV': base})
    fig.text(0.02, 1 - (head * 0.35) / (mm_h + head + foot), 'Room 22  |  12-lead ECG  |  1513', fontsize=6.5, weight='bold', color=INK, va='center')
    fig.text(0.02, 1 - (head * 0.78) / (mm_h + head + foot), subtitle, fontsize=5.5, color=INK, va='center')
    fig.text(0.02, (foot * 0.68) / (mm_h + head + foot), '25 mm/s  10 mm/mV  |  1 mV calibration pulse on each row', fontsize=4.6, color='#555', va='center')
    fig.text(0.02, (foot * 0.28) / (mm_h + head + foot), NOTE, fontsize=4.6, color='#555', va='center')
    save(fig, name, dict(kind='twelve-lead-view', view=name, leads=leads, dpi=VIEW_DPI, axes_px=bbox_px(fig, ax), x_range_s=[-gutter, span],
                         y_range_mV=[0, Hh], window_s=[tw0, tw0 + span], segments=segs, signals=twelve['signals']))


view('rm22_1513_12lead_limb.png', ['I', 'II', 'III', 'aVR', 'aVL', 'aVF'], 2.2, 0.38, 'Limb leads  |  all six over the same 2.5 seconds  |  HR 94')
view('rm22_1513_12lead_chest.png', ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'], 2.8, 0.5, 'Chest leads  |  all six over the same 2.5 seconds  |  HR 94')

np.savez_compressed(os.path.join(TRIAL or os.path.dirname(__file__), 'strip_signals.npz'), **STRIP_SIGNALS)
with open(MANIFEST, 'w') as f:
    json.dump(manifest, f, indent=1, sort_keys=True)
print('wrote', len(manifest['assets']), 'assets and', os.path.relpath(MANIFEST, ROOT))
