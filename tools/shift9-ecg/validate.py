"""Measure every SHIFT-009 ECG illustration twice: from the generated signal, and from the rendered PNG.

Usage (from the repo root):
  python tools/shift9-ecg/validate.py                 # current assets -> validation-report.json/.md
  python tools/shift9-ecg/validate.py --legacy DIR    # the v0.7/v0.8 images in DIR, pixels only (before/after)

Automated measurement is a consistency check. It is not specialist ECG validation.
"""
import argparse
import hashlib
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import ecg_model as em  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
ASSETS = os.path.join(ROOT, 'frontend', 'src', 'modules', 'the-shift', 'shift9', 'assets')


def r3(x):
    return None if x is None or (isinstance(x, float) and np.isnan(x)) else round(float(x), 3)


# ----------------------------------------------------------------------------- pixel trace extraction

def ink_mask(png):
    a = np.asarray(Image.open(png).convert('RGB')).astype(int)
    return (a[..., 0] < 110) & (a[..., 1] < 110) & (a[..., 2] < 110)


def trace(mask, box, x_range, y_range, band=None, cols=None):
    """Per-column trace from ink pixels inside the axes box. Returns time (s), centre value (mV),
    top value (mV, for R peaks) and run height (px). `band` limits rows to a mV range."""
    left, top, right, bottom = box
    px_s = (right - left) / (x_range[1] - x_range[0])
    px_mv = (bottom - top) / (y_range[1] - y_range[0])
    def row_of(mv):
        return top + (y_range[1] - mv) * px_mv
    r0, r1 = int(np.ceil(top)), int(np.floor(bottom))
    if band:
        r0, r1 = max(r0, int(row_of(band[1]))), min(r1, int(row_of(band[0])))
    c0, c1 = int(np.ceil(left)), int(np.floor(right))
    if cols:
        c0, c1 = max(c0, int(left + (cols[0] - x_range[0]) * px_s)), min(c1, int(left + (cols[1] - x_range[0]) * px_s))
    ts, mid, hi, run = [], [], [], []
    for c in range(c0, c1):
        rows = np.nonzero(mask[r0:r1, c])[0]
        if rows.size == 0:
            continue
        rows = rows + r0
        ts.append(x_range[0] + (c + 0.5 - left) / px_s)
        mid.append(y_range[1] - (np.median(rows) + 0.5 - top) / px_mv)
        hi.append(y_range[1] - (rows.min() + 0.5 - top) / px_mv)
        run.append(rows.max() - rows.min())
    return np.array(ts), np.array(mid), np.array(hi), np.array(run), px_s, px_mv


def pixel_qt(ts, mid, hi):
    """R peaks, 6-second count and median QT from a pixel trace (same tangent method as the signal)."""
    fs = 1.0 / np.median(np.diff(ts))
    tt = np.arange(ts[0], ts[-1], 1.0 / em.FS)
    yy = np.interp(tt, ts, mid)
    yt = np.interp(tt, ts, hi)
    idx = em.detect_r(tt, yt)
    beats = []
    for k in range(1, len(idx) - 1):
        try:
            beats.append(em.measure_beat(tt, yy, idx[k], idx[k + 1]))
        except (ValueError, IndexError):
            pass
    qtv = [b['qt'] for b in beats if not np.isnan(b['qt'])]
    qt = float(np.median(qtv)) if qtv else None
    rr = np.diff(tt[idx])
    return {'r_count_6s': int(np.sum((tt[idx] >= 0) & (tt[idx] < 6.0))), 'qt_s': r3(qt), 'rr_mean_s': r3(rr.mean()) if rr.size else None,
            'st60_mV': r3(np.median([b['st60'] for b in beats])) if beats else None, 'trace_fs': r3(fs)}


# ----------------------------------------------------------------------------- signal-level measurement

def beats_of(t, y, r_idx):
    out = []
    for k in range(1, len(r_idx) - 1):
        out.append(em.measure_beat(t, y, r_idx[k], r_idx[k + 1]))
    return out


def med(beats, key):
    vals = [b[key] for b in beats if b[key] is not None and not np.isnan(b[key])]
    return float(np.median(vals)) if vals else np.nan


def qtc_report(qt, rr):
    return {k: r3(v) for k, v in em.qtc_all(qt, rr).items()}


def p_template(t, y, r_idx, beats=None):
    """Ensemble average of the 230 to 50 ms window before each R peak. A real P wave survives
    averaging; fibrillatory waves, which aren't locked to the QRS, cancel out. Beats whose window
    would reach back into the previous T wave are left out."""
    wins = []
    ends = {r_idx[k + 1]: b['t_end'] for k, b in enumerate(beats or [])}
    for n, i in enumerate(r_idx):
        a, b = i - int(0.23 * em.FS), i - int(0.05 * em.FS)
        prev = r_idx[n - 1] if n else None
        if a < 0 or (prev is not None and (prev not in ends or np.isnan(ends[prev]) or t[a] < ends[prev] + 0.02)):
            continue
        w = y[a:b] - np.median(y[i - int(0.072 * em.FS): i - int(0.052 * em.FS)])
        wins.append(w)
    if len(wins) < 2:
        return float('nan'), float('nan'), len(wins)
    wins = np.array(wins)
    avg = wins.mean(axis=0)
    corr = np.corrcoef(wins) if len(wins) > 2 else np.ones((1, 1))
    off = corr[~np.eye(len(corr), dtype=bool)]
    return float(np.max(avg)), float(np.mean(off)) if off.size else 1.0, len(wins)


def fwave_spectrum(components):
    t = np.arange(0, 6, 1 / em.FS)
    y = np.zeros_like(t)
    for fr, ph, a, mod in components:
        y += a * (0.65 + 0.35 * np.sin(2 * np.pi * mod * t + ph)) * np.sin(2 * np.pi * fr * t + ph + 0.9 * np.sin(2 * np.pi * 0.35 * t))
    spec = np.abs(np.fft.rfft(y * np.hanning(y.size))) ** 2
    freqs = np.fft.rfftfreq(y.size, 1 / em.FS)
    band = (freqs > 1) & (freqs < 20)
    k = np.argmax(spec * band)
    near = band & (np.abs(freqs - freqs[k]) <= 0.3)
    # autocorrelation at one dominant period: flutter (a regular sawtooth) stays near 1.0
    lag = int(round(em.FS / freqs[k]))
    ac = float(np.corrcoef(y[:-lag], y[lag:])[0, 1])
    lags = range(int(0.5 * em.FS), int(1.5 * em.FS))
    ac_far = max(abs(float(np.corrcoef(y[:-L_], y[L_:])[0, 1])) for L_ in lags)
    return {'dominant_hz': r3(freqs[k]), 'dominant_per_min': r3(freqs[k] * 60), 'peak_power_share': r3(spec[near].sum() / spec[band].sum()),
            'autocorr_one_period': r3(ac), 'max_autocorr_0_5_to_1_5_s': r3(ac_far), 'peak_to_peak_mV': r3(y.max() - y.min())}


def strip_report(name, rec, sig, png):
    y = sig[name].astype(float) / 1e4
    t = sig[name + ':t0'][0] + np.arange(y.size) / em.FS
    rep = {'file': name, 'kind': rec['kind'], 'rhythm': rec['rhythm']}
    if rec['rhythm'].startswith('sinus under artifact'):
        clean = t < 3.3
        idx = em.detect_r(t[clean], y[clean])
        flat = y[t >= 3.35]
        rep.update({'beats_before_leads_off': int(len(idx)), 'flat_after_s': rec['leads_off_from_s'], 'flat_sd_mV': r3(flat.std()), 'flat_max_abs_mV': r3(np.abs(flat).max())})
        rr = np.diff(t[idx])
        rep['rr_before_off_s'] = [r3(v) for v in rr]
    else:
        idx = em.detect_r(t, y)
        rr = np.diff(t[idx])
        beats = beats_of(t, y, idx)
        pairs = [(b['qt'], t[idx[k + 1]] - t[idx[k]]) for k, b in enumerate(beats) if not np.isnan(b['qt'])]
        qts = [q for q, _ in pairs]
        qtc = {k: r3(np.median([em.qtc_all(q, r)[k] for q, r in pairs])) for k in ('bazett', 'fridericia', 'framingham', 'hodges')}
        rep['qt_measurable_beats'] = f'{len(pairs)} of {len(beats)}'
        p_max, p_corr, p_n = p_template(t, y, idx, beats)
        rep.update({
            'qrs_in_6s': int(np.sum((t[idx] >= 0) & (t[idx] < 6.0))), 'hr_from_rr': r3(60 / rr.mean()), 'rr_min_s': r3(rr.min()), 'rr_max_s': r3(rr.max()),
            'rr_cv': r3(rr.std() / rr.mean()), 'pr_s': r3(med(beats, 'pr')), 'qrs_s': r3(med(beats, 'qrs')), 'qt_s': r3(np.median(qts)),
            'qtc_s': qtc, 'st60_mV': r3(med(beats, 'st60')), 't_amp_mV': r3(med(beats, 't_amp')),
            'p_template_max_mV': r3(p_max), 'p_beat_to_beat_corr': r3(p_corr), 'p_template_beats': p_n,
        })
        if rec['rhythm'] == 'atrial fibrillation':
            rep['pr_s'] = None  # no P waves, so no PR interval
            close = np.abs(np.diff(rr)) / rr[:-1] < 0.04
            rep['three_similar_rr_in_a_row'] = bool(np.any(close[:-1] & close[1:]))
            rep['fwave'] = fwave_spectrum(rec['fwave_components'])
            # Residual T at each next R: the largest T-wave value under a following QRS, as a share of the T amplitude.
            r_times = np.array(rec['r_times_s'])
            qt_model, _ = em.qt_series(r_times, float(np.mean(np.diff(r_times))))
            share = []
            for k in range(len(r_times) - 1):
                tp = em.QRS_ONSET + qt_model[k] - 2 * em.T_FALL_SD
                dt = r_times[k + 1] - r_times[k] - tp
                share.append(np.exp(-0.5 * (dt / em.T_FALL_SD) ** 2) if dt > 0 else 1.0)
            rep['max_t_share_under_next_qrs'] = r3(max(share))
    # Pixel check: the PNG's ink trace against the signal.
    mask = ink_mask(png)
    ts, mid, hi, run, px_s, px_mv = trace(mask, rec['axes_px'], rec['x_range_s'], rec['y_range_mV'])
    if rec['rhythm'].startswith('sinus under artifact'):
        overlay = (ts > 3.7) & (ts < 5.4)  # LEADS OFF box sits over the trace area; its ink colour is excluded, but skip it anyway
        ts, mid, hi, run = ts[~overlay], mid[~overlay], hi[~overlay], run[~overlay]
    ref = np.interp(ts, t, y)
    smooth = run < 0.06 * px_mv  # skip steep QRS columns, where a vertical line has no single value
    rep['pixel'] = {'columns': int(ts.size), 'rms_error_mV': r3(np.sqrt(np.mean((mid[smooth] - ref[smooth]) ** 2))),
                    'px_per_mm_x': r3(px_s / 25), 'px_per_mm_y': r3(px_mv / 10)}
    if not rec['rhythm'].startswith('sinus under artifact'):
        rep['pixel'].update(pixel_qt(ts, mid, hi))
    return rep


def twelve_leads(sigs):
    L = {k: sigs[k].astype(float) / 1e4 for k in sigs.files}
    L['II'] = L['I'] + L['III']
    L['aVR'] = -(L['I'] + L['II']) / 2
    L['aVL'] = L['I'] - L['II'] / 2
    L['aVF'] = L['II'] - L['I'] / 2
    return np.arange(L['I'].size) / em.FS, L


def twelve_report(name, rec, png, sigs):
    t, L = twelve_leads(sigs)
    rep = {'file': name, 'kind': rec['kind'], 'view': rec['view']}
    if rec['kind'] == 'twelve-lead':
        ident = bool(np.allclose(L['II'], L['I'] + L['III'])) and bool(np.allclose(L['aVR'] + L['aVL'] + L['aVF'], 0, atol=1e-9))
        idx = em.detect_r(t, L['II'])
        rr = np.diff(t[idx])
        per = {}
        for ld in ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']:
            b = beats_of(t, L[ld], idx)
            seg = [L[ld][i - 60: i + 60] for i in idx[1:-1]]
            p2p = float(np.median([s.max() - s.min() for s in seg]))
            per[ld] = {'st60_mm': r3(med(b, 'st60') * 10), 'qrs_p2p_mV': r3(p2p)}
        qrs_net = {ld: float(np.median([L[ld][i - 45: i + 45].sum() / em.FS for i in idx[1:-1]])) for ld in ('I', 'aVF')}
        axis = float(np.degrees(np.arctan2(qrs_net['aVF'], qrs_net['I'])))
        bII = beats_of(t, L['II'], idx)
        pairs = [(b['qt'], t[idx[k + 1]] - t[idx[k]]) for k, b in enumerate(bII) if not np.isnan(b['qt'])]
        qts = [q for q, _ in pairs]
        rep.update({'derived_lead_identities_hold': ident, 'hr_from_rr': r3(60 / rr.mean()), 'qrs_in_10s': int(np.sum(t[idx] < 10)),
                    'per_lead': per, 'frontal_axis_deg': r3(axis), 'qt_II_s': r3(np.median(qts)),
                    'qtc_II_s': {k: r3(np.median([em.qtc_all(q, r)[k] for q, r in pairs])) for k in ('bazett', 'fridericia', 'framingham', 'hodges')},
                    'pr_II_s': r3(med(bII, 'pr')), 'qrs_II_s': r3(med(bII, 'qrs'))})
    # Pixel check, segment by segment: the trace in each labeled segment must match its own lead best.
    mask = ink_mask(png)
    seg_checks = []
    for s in rec['segments']:
        xoff = s.get('x_offset_s', 0.0)
        cols = (s['t0'] + xoff + 0.02, s['t1'] + xoff - 0.02)
        if 'label_x_s' in s:
            cols = (max(cols[0], s['label_x_s'][1] + 0.02), cols[1]) if s['label_x_s'][0] <= cols[0] + 0.4 else cols
        row = rec['segments'][1]['base_mV'] - rec['segments'][0]['base_mV'] if rec['kind'] != 'twelve-lead' else 3.0
        half = abs(row) / 2 if rec['kind'] != 'twelve-lead' else 1.5
        ts, mid, hi, run, px_s, px_mv = trace(mask, rec['axes_px'], rec['x_range_s'], rec['y_range_mV'], band=(s['base_mV'] - half + 0.02, s['base_mV'] + half - 0.02), cols=cols)
        smooth = run < 0.06 * px_mv
        tt = ts - xoff
        best, scores = None, {}
        for ld, y in L.items():
            ref = np.interp(tt, t, y) + s['base_mV']
            scores[ld] = float(np.sqrt(np.mean((mid[smooth] - ref[smooth]) ** 2)))
        best = min(scores, key=scores.get)
        seg_checks.append({'lead': s['lead'], 'best_match': best, 'rms_error_mV': r3(scores[s['lead']]), 'columns': int(ts.size)})
    rep['pixel'] = {'segments': seg_checks, 'all_segments_match_their_label': all(c['best_match'] == c['lead'] or
                    (c['lead'] == 'II' and c['best_match'] == 'II') for c in seg_checks),
                    'px_per_mm_x': r3(px_s / 25), 'px_per_mm_y': r3(px_mv / 10)}
    # Calibration pulse: ink height at the pulse's flat top, in mV.
    left, top, right, bottom = rec['axes_px']
    x_cal = (0.02 + 0.14) if rec['kind'] == 'twelve-lead' else (-0.42 + 0.14)
    c = int(left + (x_cal - rec['x_range_s'][0]) * px_s)
    base0 = rec['segments'][0]['base_mV']
    rows = np.nonzero(mask[int(top):int(bottom), c])[0] + int(top)
    top_mv = rec['y_range_mV'][1] - (rows.min() - top) / px_mv
    rep['pixel']['calibration_pulse_mV'] = r3(top_mv - base0)
    return rep


# ----------------------------------------------------------------------------- legacy (before) images

def legacy_report(d):
    """Pixel-only measurements of the v0.7/v0.8 images, using the geometry of the old scripts."""
    out = {}
    for name in sorted(os.listdir(d)):
        if not name.endswith('.png') or 'leadsoff' in name:
            continue
        w, h = Image.open(os.path.join(d, name)).size
        mask = ink_mask(os.path.join(d, name))
        if '12lead' in name:
            box = [0, h - 0.93 * h, w, h - 0.07 * h]
            ts, mid, hi, run, px_s, px_mv = trace(mask, box, (0, 10), (0, 12), band=(0.02, 2.98), cols=(1.3, 9.9))
            res = pixel_qt(ts, mid - 1.5, hi - 1.5)
            res.pop('r_count_6s')
        else:
            box = [0, h - 0.88 * h, w, h - 0.12 * h]
            ts, mid, hi, run, px_s, px_mv = trace(mask, box, (0, 6), (-0.8, 1.6))
            res = pixel_qt(ts, mid, hi)
        if res['qt_s'] and res['rr_mean_s']:
            res['qtc_s'] = qtc_report(res['qt_s'], res['rr_mean_s'])
        out[name] = res
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--legacy')
    ap.add_argument('--assets', default=ASSETS)
    ap.add_argument('--dir', default=HERE, help='folder with manifest.json and the signal files')
    args = ap.parse_args()
    if args.legacy:
        print(json.dumps(legacy_report(args.legacy), indent=1))
        return
    with open(os.path.join(args.dir, 'manifest.json')) as f:
        manifest = json.load(f)
    sig = np.load(os.path.join(args.dir, 'strip_signals.npz'))
    twelve = np.load(os.path.join(args.dir, 'twelve_lead_signals.npz'))
    report = {'note': 'Automated consistency measurements. Not specialist ECG validation.', 'assets': {}}
    for name, rec in sorted(manifest['assets'].items()):
        png = os.path.join(args.assets, name)
        with open(png, 'rb') as f:
            sha = hashlib.sha256(f.read()).hexdigest()
        rep = strip_report(name, rec, sig, png) if rec['kind'] == 'strip' else twelve_report(name, rec, png, twelve)
        rep['sha256_matches_manifest'] = sha == rec['sha256']
        report['assets'][name] = rep
    with open(os.path.join(args.dir, 'validation-report.json'), 'w') as f:
        json.dump(report, f, indent=1, sort_keys=True)
    print(json.dumps(report, indent=1, sort_keys=True))


if __name__ == '__main__':
    main()
