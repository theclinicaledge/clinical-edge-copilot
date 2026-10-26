"""Signal model and measurements for the SHIFT-009 ECG illustrations.

Constructed teaching illustrations, not patient recordings. Units: seconds and millivolts.
Paper: 25 mm/s and 10 mm/mV, so 1 mm = 0.04 s horizontally and 0.1 mV vertically.

Why this file exists (remediation Part 2): the original generator placed the T wave at a fixed
0.26 s after every R peak whatever the heart rate, so every tracing had a QT of about 410 ms and
the QTc rose as the rate rose (about 485 to 515 ms by Bazett on the sinus strips). Here each
beat's QT is computed from its preceding R-R interval with the Framingham (Sagie) linear
formula, QT = QTc_target - 0.154 x (1 - RR), and the T wave is drawn so that its tangent-method
end lands exactly on that QT. Measurements below re-derive every interval from the signal itself.
"""
import numpy as np

FS = 1000  # samples per second

# Beat timing relative to the R peak (s). QRS onset is where the q wave starts; the J point is
# where the s wave returns to the ST level. These give PR about 160 ms and QRS about 80 ms.
P_PEAK, P_SD = -0.152, 0.021
Q_T, Q_SD = -0.022, 0.006
R_SD = 0.009
S_T, S_SD = 0.024, 0.007
QRS_ONSET = -0.040
J_POINT = 0.042
T_FALL_SD = 0.040   # T downslope width; the tangent at its steepest point meets baseline 2 SD past the peak
T_RISE_SD = 0.070   # T upslope is slower than the downslope, as in normal repolarization
T_RISE_POW = 3.0    # sharper-tailed upslope, so the ST segment stays flat instead of drifting into the T wave
# Model target. Measured QT runs about 20 ms shorter than the model's (onset is detected after the small q wave starts),
# so 0.425 gives measured QTc of about 0.40 s: normal, and not a teaching finding.
QTC_TARGET = 0.425


def framingham_qt(rr, qtc=QTC_TARGET):
    """QT (s) for a preceding R-R interval (s): QTc = QT + 0.154 (1 - RR)  (Sagie 1992)."""
    return qtc - 0.154 * (1.0 - rr)


def qtc_all(qt, rr):
    """QTc by four standard formulas, all in seconds."""
    return {
        'bazett': qt / np.sqrt(rr),
        'fridericia': qt / np.cbrt(rr),
        'framingham': qt + 0.154 * (1.0 - rr),
        'hodges': qt + 0.00175 * (60.0 / rr - 60.0),
    }


def g(t, mu, sd, amp):
    return amp * np.exp(-0.5 * ((t - mu) / sd) ** 2)


def sig(x):
    return 1.0 / (1.0 + np.exp(-x))


def beat(t, qt, p=0.12, q=-0.05, r=1.0, s=-0.18, tw=0.28, st=0.0, p_on=True,
         q_dt=0.0, r_dt=0.0, s_dt=0.0, t_rise=T_RISE_SD, t_fall=T_FALL_SD, t_rise_pow=None):
    """One P-QRS-T complex. `t` is time relative to this beat's R peak; `qt` is this beat's QT (s).
    `*_dt` shift a lead's q, r or s timing (used to give the 12-lead its own QRS shape per lead)."""
    y = np.zeros_like(t)
    if p_on:
        y += g(t, P_PEAK, P_SD, p)
    y += g(t, Q_T + q_dt, Q_SD, q) + g(t, r_dt, R_SD, r) + g(t, S_T + s_dt, S_SD, s)
    t_end = QRS_ONSET + qt
    t_peak = t_end - 2.0 * t_fall
    if tw:
        x = t - t_peak
        # With an ST shift the upslope stays Gaussian, so the shifted ST segment curves into the T wave
        # (injury pattern) instead of forming a flat shelf with a notch.
        pw = t_rise_pow if t_rise_pow is not None else (2.0 if st else T_RISE_POW)
        rise = np.exp(-0.5 * np.abs(x / t_rise) ** pw)
        fall = np.exp(-0.5 * (x / t_fall) ** 2)  # Gaussian downslope: its tangent meets baseline exactly 2 SD past the peak
        y += tw * np.where(x < 0, rise, fall)
    if st:
        # ST shift from the J point that carries into the T wave and resolves with it.
        y += st * sig((t - J_POINT) / 0.004) * (1.0 - sig((t - (t_peak + 0.5 * t_fall)) / (0.35 * t_fall)))
    return y


def qt_series(r_times, rr_first):
    """Per-beat QT from each beat's preceding R-R (the first beat uses `rr_first`)."""
    rr_prev = np.diff(np.concatenate([[r_times[0] - rr_first], r_times]))
    return framingham_qt(rr_prev), rr_prev


def render(duration, r_times, params, rr_first, noise=0.004, wander=0.012, rng=None, fwave=None, t0=0.0):
    t = np.arange(t0, t0 + duration, 1.0 / FS)
    y = np.zeros_like(t)
    qts, _ = qt_series(np.asarray(r_times), rr_first)
    for rt, qt in zip(r_times, qts):
        m = (t > rt - 0.30) & (t < rt + 0.60)
        y[m] += beat(t[m] - rt, qt, **params)
    if fwave is not None:
        y += fwave(t)
    if rng is not None:
        y += rng.normal(0, noise, t.size)
        y += wander * np.sin(2 * np.pi * 0.15 * t + rng.uniform(0, 6))
    return t, y


def regular_r(duration, hr, rng, jitter=0.006, count=None, fit=True):
    """Sinus R peaks. The first beat's phase is chosen so the 6-second count equals round(HR / 10),
    the closest the 6-second method can get to the rate."""
    rr = 60.0 / hr
    if not fit:
        times, x = [], 0.35
        while x < duration - 0.25:
            times.append(x)
            x += rr + rng.normal(0, jitter)
        return times
    want = count if count is not None else int(round(hr / 10.0))
    for start in np.arange(0.15, rr + 0.15, 0.005):
        times, x = [], start
        while x < duration - 0.25:
            times.append(x)
            x += rr + rng.normal(0, jitter)
        if sum(0 <= v < 6.0 for v in times) == want and times[-1] < 5.85:
            return times
    raise ValueError('no phase gives the wanted 6-second count')


def afib_r(n, rng, span=(0.25, 5.75), rr_min=0.30, tries=20000):
    """`n` R peaks inside `span`, irregularly irregular: no run of three similar intervals,
    a coefficient of variation of at least 0.15, and no interval under `rr_min` (AV-node limit),
    so no QRS lands on the peak of the previous T wave."""
    total = span[1] - span[0]
    for _ in range(tries):
        w = rng.uniform(0.55, 1.45, n - 1)
        rr = w / w.sum() * total
        if rr.min() < rr_min:
            continue
        if rr.std() / rr.mean() < 0.15:
            continue
        close = np.abs(np.diff(rr)) / rr[:-1] < 0.04
        if np.any(close[:-1] & close[1:]):
            continue
        qts, _ = qt_series(span[0] + np.concatenate([[0], np.cumsum(rr)]), rr.mean())
        t_peak_rel = QRS_ONSET + qts[:-1] - 2 * T_FALL_SD
        if np.any(rr < t_peak_rel + 1.7 * T_FALL_SD):  # next R sits on less than 25% of the T wave
            continue
        return list(span[0] + np.concatenate([[0], np.cumsum(rr)]))
    raise ValueError('no AF sequence met the constraints')


def fibrillatory(rng, amp=0.025):
    """Fibrillatory baseline: several components at 6 to 8.5 Hz (360 to 510 per minute) with drifting
    phase and amplitude, so it never forms the regular sawtooth of flutter."""
    comps = [(rng.uniform(6.0, 8.5), rng.uniform(0, 2 * np.pi), amp * rng.uniform(0.6, 1.0), rng.uniform(0.2, 0.5)) for _ in range(5)]

    def f(t):
        y = np.zeros_like(t)
        for fr, ph, a, mod in comps:
            y += a * (0.65 + 0.35 * np.sin(2 * np.pi * mod * t + ph)) * np.sin(2 * np.pi * fr * t + ph + 0.9 * np.sin(2 * np.pi * 0.35 * t))
        return y
    return f, comps


# ---------------------------------------------------------------- measurements (signal level)

def detect_r(t, y, min_rr=0.25, frac=0.5):
    """R peaks by amplitude threshold on the high-passed signal, independent of the model's R times."""
    k = int(0.15 * FS)
    base = np.convolve(y, np.ones(k) / k, mode='same')
    hp = y - base
    thr = frac * np.percentile(hp, 99.5)
    peaks, last = [], -1e9
    for i in range(1, len(hp) - 1):
        if hp[i] > thr and hp[i] >= hp[i - 1] and hp[i] >= hp[i + 1] and t[i] - last >= min_rr:
            peaks.append(i)
            last = t[i]
    return np.array(peaks)


def measure_beat(t, y, i_r, i_next=None):
    """Intervals and levels for the beat whose R peak is at index i_r (all in s and mV)."""
    def at(sec):
        return int(round(sec * FS))
    base_win = y[i_r + at(-0.072): i_r + at(-0.052)]
    base = float(np.median(base_win))
    yy = y - base
    # QRS onset: walking back from R, the first point within 0.02 mV of baseline after the q wave.
    i = i_r
    while i > i_r + at(-0.08) and not (abs(yy[i]) < 0.02 and abs(yy[i] - yy[i - 3]) < 0.01):
        i -= 1
    onset = t[i]
    # J point: after the s trough, where the slope flattens below 1.5 mV/s.
    s_idx = i_r + int(np.argmin(yy[i_r: i_r + at(0.05)]))
    j = s_idx
    while j < i_r + at(0.09) and abs(yy[j + 2] - yy[j]) / (2 / FS) > 1.5:
        j += 1
    j_time = t[j]
    st60 = float(yy[min(len(yy) - 1, j + at(0.06))])
    # T wave: largest deflection from J+0.06 to the earlier of R+0.55 or the next QRS.
    lo = j + at(0.06)
    hi = i_r + at(0.55) if i_next is None else min(i_r + at(0.55), i_next - at(0.05))
    seg = yy[lo:hi]
    k = int(np.argmax(np.abs(seg)))
    t_peak_i = lo + k
    sign = np.sign(seg[k]) or 1.0
    # Tangent method: steepest return toward baseline after the peak, extended to the baseline.
    # If the peak sits at the end of the window (the next QRS arrives first), QT can't be measured.
    t_end = np.nan
    if hi - t_peak_i > at(0.02):
        d = np.gradient(yy[t_peak_i:hi]) * FS * sign
        m = int(np.argmin(d)) + t_peak_i
        slope = np.gradient(yy)[m] * FS
        if slope != 0 and m < hi - 2:
            t_end = t[m] - yy[m] / slope
    # P wave: largest deflection in the window before QRS onset.
    pw = yy[i_r + at(-0.26): i - at(0.01)]
    p_amp = float(pw.max()) if pw.size else 0.0
    p_on = np.nan
    if p_amp > 0.05:
        pk = i_r + at(-0.26) + int(np.argmax(pw))
        a = pk
        while a > pk - at(0.08) and yy[a] > 0.1 * p_amp:
            a -= 1
        p_on = t[a]
    return {'onset': onset, 'j': j_time, 'qrs': j_time - onset, 'st60': st60, 't_end': t_end,
            'qt': t_end - onset, 't_amp': float(seg[k]), 'p_amp': p_amp, 'pr': onset - p_on if p_amp > 0.05 else np.nan,
            'baseline': base}
