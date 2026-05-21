const W = 800;
const B = 65; // baseline y within viewBox 0 0 800 100

function r(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Shared PQRST template ─────────────────────────────────────────────────
// Proportional positions ensure the same morphology at any cycle width.
// P amplitude: 14px (~25% of R), R amplitude: 56px, T amplitude: 20px.
// T wave is asymmetric: gradual rise (60% of T span), faster fall (40%).
function pqrst(sx: number, cw: number): string {
  const b = B;
  return [
    // Flat TP segment tail / lead-in
    `L ${r(sx + cw * 0.12)},${b}`,
    // P wave — smooth dome, slightly narrowed for crisp appearance
    `C ${r(sx + cw * 0.14)},${b} ${r(sx + cw * 0.18)},${r(b - 14)} ${r(sx + cw * 0.21)},${r(b - 14)}`,
    `C ${r(sx + cw * 0.24)},${r(b - 14)} ${r(sx + cw * 0.28)},${b} ${r(sx + cw * 0.31)},${b}`,
    // PR segment (isoelectric)
    `L ${r(sx + cw * 0.38)},${b}`,
    // Q dip
    `L ${r(sx + cw * 0.40)},${r(b + 5)}`,
    // R spike — taller for better P:QRS ratio visibility
    `L ${r(sx + cw * 0.43)},${r(b - 56)}`,
    // S dip
    `L ${r(sx + cw * 0.46)},${r(b + 10)}`,
    // J-point return to baseline
    `C ${r(sx + cw * 0.49)},${r(b + 10)} ${r(sx + cw * 0.53)},${b} ${r(sx + cw * 0.57)},${b}`,
    // ST segment
    `L ${r(sx + cw * 0.62)},${b}`,
    // T wave — asymmetric: peak shifted right, slow rise then faster fall
    `C ${r(sx + cw * 0.65)},${b} ${r(sx + cw * 0.71)},${r(b - 20)} ${r(sx + cw * 0.76)},${r(b - 20)}`,
    `C ${r(sx + cw * 0.79)},${r(b - 20)} ${r(sx + cw * 0.84)},${b} ${r(sx + cw * 0.88)},${b}`,
  ].join(' ');
}

function repeatedPQRST(cycleWidth: number): string {
  let path = `M 0,${B}`;
  for (let x = 0; x + cycleWidth <= W; x += cycleWidth) {
    path += ' ' + pqrst(x, cycleWidth);
  }
  return path + ` L ${W},${B}`;
}

// ─── Atrial Fibrillation ───────────────────────────────────────────────────
// Deterministic fibrillatory baseline. Amplitude/width are intentionally
// non-uniform: most segments ±4–6px, but scattered near-flat stretches
// (±1–2px, wider widths) simulate the occasional calmer fibrillatory periods
// seen on real strips. 30-entry pattern delays visible repetition.
const FIB_PATTERN: [number, number][] = [
  [6, -5], [5,  4], [7, -6], [4,  1], [6, -3], [5,  5], [8, -1], [4,  6],
  [7, -5], [11, 1], [5, -4], [4,  6], [6, -2], [5,  5], [7, -6], [4,  1],
  [5, -3], [6,  6], [4, -1], [7,  4], [6, -5], [12, 2], [4, -6], [5,  4],
  [7, -1], [5,  5], [4, -6], [6,  3], [5, -5], [10, 1],
];

function afibBaseline(startX: number, endX: number): string {
  const b = B;
  let path = '';
  let x = startX;
  let i = 0;
  while (x < endX) {
    const [w, amp] = FIB_PATTERN[i % FIB_PATTERN.length];
    const nx = Math.min(x + w, endX);
    path += ` Q ${r(x + (nx - x) / 2)},${r(b + amp)} ${r(nx)},${b}`;
    x = nx;
    i++;
  }
  return path;
}

// Narrow QRS + T wave without P wave (used in AFib and AFlutter)
function narrowQRS(sx: number): string {
  const b = B;
  return [
    `L ${r(sx + 2)},${r(b + 4)}`,
    `L ${r(sx + 5)},${r(b - 52)}`,
    `L ${r(sx + 9)},${r(b + 9)}`,
    `C ${r(sx + 12)},${r(b + 9)} ${r(sx + 15)},${b} ${r(sx + 18)},${b}`,
    // ST
    `L ${r(sx + 24)},${b}`,
    // T wave — asymmetric, peak shifted right
    `C ${r(sx + 27)},${b} ${r(sx + 33)},${r(b - 14)} ${r(sx + 37)},${r(b - 14)}`,
    `C ${r(sx + 40)},${r(b - 14)} ${r(sx + 44)},${b} ${r(sx + 46)},${b}`,
  ].join(' ');
}

function buildAFib(): string {
  // Exaggerated RR irregularity — "irregularly irregular"
  // Gaps: 90, 62, 148, 88, 162, 94 — extreme variation emphasizes the pattern
  const QRS_X = [28, 118, 180, 328, 416, 578, 672];
  const QRS_SPAN = 46;

  let path = `M 0,${B}`;
  let cur = 0;

  for (const qx of QRS_X) {
    if (qx > cur) path += afibBaseline(cur, qx);
    path += ' ' + narrowQRS(qx);
    cur = qx + QRS_SPAN;
  }

  if (cur < W) path += afibBaseline(cur, W);
  return path;
}

// ─── Atrial Flutter ────────────────────────────────────────────────────────
// 4:1 conduction: 3 sawtooth flutter waves between each conducted QRS.
// Flutter waves use pure L commands — linear ramp up then near-vertical drop —
// to produce the sharp "picket-fence" appearance, not sinusoidal rounding.
function buildAFlutter(): string {
  const b = B;
  const fw = 22;          // flutter wave width
  const parts: string[] = [`M 0,${b}`];
  let x = 0;
  let fc = 0;

  while (x < W) {
    if (fc % 4 === 0) {
      if (x + 48 > W) break;
      // Narrow QRS on conduction beat — sharp angular complex
      parts.push(
        `L ${r(x + 2)},${r(b + 5)}`,
        `L ${r(x + 5)},${r(b - 50)}`,
        `L ${r(x + 9)},${r(b + 9)}`,
        `C ${r(x + 12)},${r(b + 9)} ${r(x + 15)},${b} ${r(x + 19)},${b}`,
        // Short ST, then immediately slope into next flutter wave — no distinct T
        `L ${r(x + 43)},${b}`,
      );
      x += 43;
    } else {
      if (x + fw > W) break;
      // True sawtooth: slow linear ascent → near-vertical sharp drop
      // All L commands — no bezier rounding
      parts.push(
        `L ${r(x + fw * 0.76)},${r(b - 19)}`,  // gradual linear rise to peak
        `L ${r(x + fw)},${b}`,                   // sharp near-vertical drop to baseline
      );
      x += fw;
    }
    fc++;
  }

  parts.push(`L ${W},${b}`);
  return parts.join(' ');
}

// ─── Ventricular Tachycardia ───────────────────────────────────────────────
// Wide bizarre QRS cycling through 3 morphology variants (A → B → C → A …).
// All variants share: broad complex (~76px of 88px), slurred C-bezier upstroke,
// shoulder notch, two-step staircase descent (irregular angles, no flat plateau),
// abrupt plunge past baseline, deep nadir, slow return. Beat-to-beat differences
// in peak height (±4px), notch depth (±4px), staircase steps, and nadir depth (±3px)
// produce subtle organic variation while keeping the rhythm clearly regular and fast.
function buildVTach(): string {
  const b = B;
  const cw = 88;

  type Shape = (x: number) => string[];
  const shapes: Shape[] = [
    // A — reference: moderate peak, mid-depth notch, balanced staircase
    (x) => [
      `L ${r(x + 5)},${b}`,
      `C ${r(x + 9)},${b} ${r(x + 16)},${r(b - 28)} ${r(x + 22)},${r(b - 18)}`,
      `L ${r(x + 27)},${r(b - 8)}`,
      `L ${r(x + 36)},${r(b - 60)}`,
      `L ${r(x + 42)},${r(b - 51)}`,   // staircase step 1 — wider, shallower
      `L ${r(x + 47)},${r(b - 40)}`,   // staircase step 2 — narrower, steeper
      `L ${r(x + 52)},${r(b + 5)}`,    // near-vertical plunge
      `L ${r(x + 58)},${r(b + 21)}`,
      `C ${r(x + 63)},${r(b + 21)} ${r(x + 74)},${b} ${r(x + 81)},${b}`,
      `L ${r(x + cw)},${b}`,
    ],
    // B — taller sharper peak, shallower notch, steeper first staircase step
    (x) => [
      `L ${r(x + 6)},${b}`,
      `C ${r(x + 10)},${b} ${r(x + 17)},${r(b - 25)} ${r(x + 23)},${r(b - 15)}`,
      `L ${r(x + 28)},${r(b - 5)}`,
      `L ${r(x + 37)},${r(b - 64)}`,
      `L ${r(x + 42)},${r(b - 54)}`,   // step 1 — steep drop
      `L ${r(x + 48)},${r(b - 43)}`,   // step 2 — moderate
      `L ${r(x + 53)},${r(b + 4)}`,
      `L ${r(x + 59)},${r(b + 23)}`,
      `C ${r(x + 64)},${r(b + 23)} ${r(x + 75)},${b} ${r(x + 82)},${b}`,
      `L ${r(x + cw)},${b}`,
    ],
    // C — broader slurred upstroke, deeper notch, more abrupt plunge, shallower nadir
    (x) => [
      `L ${r(x + 4)},${b}`,
      `C ${r(x + 8)},${b} ${r(x + 15)},${r(b - 31)} ${r(x + 21)},${r(b - 23)}`,
      `L ${r(x + 26)},${r(b - 12)}`,
      `L ${r(x + 35)},${r(b - 58)}`,
      `L ${r(x + 40)},${r(b - 50)}`,   // step 1 — moderate
      `L ${r(x + 46)},${r(b - 37)}`,   // step 2 — steeper angle than A
      `L ${r(x + 51)},${r(b + 6)}`,    // most abrupt plunge of three
      `L ${r(x + 57)},${r(b + 19)}`,
      `C ${r(x + 62)},${r(b + 19)} ${r(x + 73)},${b} ${r(x + 79)},${b}`,
      `L ${r(x + cw)},${b}`,
    ],
  ];

  const parts: string[] = [`M 0,${b}`];
  let i = 0;
  for (let x = 0; x + cw <= W; x += cw) {
    parts.push(...shapes[i % shapes.length](x));
    i++;
  }
  return parts.join(' ');
}

// ─── Premature Atrial Contraction ─────────────────────────────────────
// 2 normal sinus beats, 1 PAC (early, smaller ectopic P wave, narrow QRS),
// non-compensatory pause, then 3 normal beats resume.
// Ectopic P is 8px tall vs 14px for sinus — same proportional template,
// height reduced to suggest non-sinus atrial origin.
function buildPAC(): string {
  const b = B;
  const px = 265; // PAC sx — arrives ~15px before expected 3rd beat at 280
  const cw = 100; // shortened cycle (early beat)

  const pacBeat = [
    `L ${r(px + cw * 0.12)},${b}`,
    // Ectopic P dome — shallower than sinus (8px vs 14px)
    `C ${r(px + cw * 0.14)},${b} ${r(px + cw * 0.18)},${r(b - 8)} ${r(px + cw * 0.21)},${r(b - 8)}`,
    `C ${r(px + cw * 0.24)},${r(b - 8)} ${r(px + cw * 0.28)},${b} ${r(px + cw * 0.31)},${b}`,
    `L ${r(px + cw * 0.38)},${b}`,
    `L ${r(px + cw * 0.40)},${r(b + 5)}`,
    `L ${r(px + cw * 0.43)},${r(b - 56)}`,
    `L ${r(px + cw * 0.46)},${r(b + 10)}`,
    `C ${r(px + cw * 0.49)},${r(b + 10)} ${r(px + cw * 0.53)},${b} ${r(px + cw * 0.57)},${b}`,
    `L ${r(px + cw * 0.62)},${b}`,
    `C ${r(px + cw * 0.65)},${b} ${r(px + cw * 0.71)},${r(b - 20)} ${r(px + cw * 0.76)},${r(b - 20)}`,
    `C ${r(px + cw * 0.79)},${r(b - 20)} ${r(px + cw * 0.84)},${b} ${r(px + cw * 0.88)},${b}`,
  ].join(' ');

  let path = `M 0,${b}`;
  path += ' ' + pqrst(0, 140);   // beat 1 — normal sinus
  path += ' ' + pqrst(140, 140); // beat 2 — normal sinus
  path += ' ' + pacBeat;         // PAC — early, ectopic P, narrow QRS
  // Non-compensatory: next sinus beat fires ~1 cycle after PAC (sinus reset)
  // vs compensatory which would place next beat at 420 (beat2 + 2×140)
  path += ' ' + pqrst(405, 140);
  path += ' ' + pqrst(545, 140);
  path += ` L ${W},${b}`;
  return path;
}

// ─── Premature Ventricular Contraction ────────────────────────────────
// 2 normal sinus beats, 1 early wide bizarre PVC (no P, ventricular origin),
// full compensatory pause, then 3 normal beats resume.
// Compensatory: distance from pre-PVC R to post-PVC R = 2 normal RR intervals.
function buildPVC(): string {
  const b = B;
  const vx = 265; // PVC onset — early (expected beat 3 at 280)

  const pvcBeat = [
    // No P wave — brief flat lead-in only
    `L ${r(vx + 8)},${b}`,
    // Slurred broad initial upstroke (slow-onset, ventricular origin)
    `C ${r(vx + 12)},${b} ${r(vx + 18)},${r(b - 18)} ${r(vx + 22)},${r(b - 12)}`,
    // Near-baseline notch before spike (bizarre morphology)
    `L ${r(vx + 26)},${r(b + 3)}`,
    // Tall spike
    `L ${r(vx + 33)},${r(b - 62)}`,
    // Two-step descent
    `L ${r(vx + 40)},${r(b - 44)}`,
    `L ${r(vx + 46)},${r(b + 15)}`,
    // Deep nadir
    `L ${r(vx + 52)},${r(b + 22)}`,
    // Slow return — discordant T-wave territory blends into return
    `C ${r(vx + 58)},${r(b + 22)} ${r(vx + 68)},${b} ${r(vx + 76)},${b}`,
  ].join(' ');

  let path = `M 0,${b}`;
  path += ' ' + pqrst(0, 140);   // beat 1 — normal sinus
  path += ' ' + pqrst(140, 140); // beat 2 — normal sinus
  path += ' ' + pvcBeat;         // PVC — wide, bizarre, no P
  // Compensatory: beat2_R(~200) to post-PVC_R(~480) = 280 = 2×140
  path += ' ' + pqrst(420, 140);
  path += ' ' + pqrst(560, 140);
  path += ` L ${W},${b}`;
  return path;
}

// ─── Supraventricular Tachycardia ─────────────────────────────────────
// Fast regular narrow-complex tachycardia. P waves absent or buried in
// preceding T wave — no distinct upright P visible before each QRS.
// cw=62 produces ~12 full beats in 800px, clearly faster than sinus tachycardia.
function buildSVT(): string {
  const b = B;
  const cw = 62;

  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      // No visible P wave — brief flat lead-in only
      `L ${r(x + cw * 0.06)},${b}`,
      // Q dip
      `L ${r(x + cw * 0.10)},${r(b + 5)}`,
      // R spike — narrow
      `L ${r(x + cw * 0.17)},${r(b - 52)}`,
      // S dip
      `L ${r(x + cw * 0.23)},${r(b + 8)}`,
      // J-point return
      `C ${r(x + cw * 0.27)},${r(b + 8)} ${r(x + cw * 0.33)},${b} ${r(x + cw * 0.39)},${b}`,
      // T wave — compressed, fills space to next beat
      `C ${r(x + cw * 0.44)},${b} ${r(x + cw * 0.61)},${r(b - 16)} ${r(x + cw * 0.70)},${r(b - 16)}`,
      `C ${r(x + cw * 0.76)},${r(b - 16)} ${r(x + cw * 0.88)},${b} ${r(x + cw * 0.94)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// ─── First-Degree AV Block ────────────────────────────────────────────
// Same rate and morphology as NSR (cw=140). Every P conducts. PR segment
// extended to 28px flat vs ~10px in pqrst — the defining visual feature.
function buildFirstDegreeAVB(): string {
  const b = B;
  const cw = 140;

  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + cw * 0.10)},${b}`,
      // P wave — same morphology as normal sinus
      `C ${r(x + cw * 0.12)},${b} ${r(x + cw * 0.16)},${r(b - 14)} ${r(x + cw * 0.19)},${r(b - 14)}`,
      `C ${r(x + cw * 0.22)},${r(b - 14)} ${r(x + cw * 0.26)},${b} ${r(x + cw * 0.29)},${b}`,
      // Extended PR segment — ~28px vs ~10px in normal sinus
      `L ${r(x + cw * 0.49)},${b}`,
      // Narrow QRS — normal ventricular morphology
      `L ${r(x + cw * 0.51)},${r(b + 5)}`,
      `L ${r(x + cw * 0.54)},${r(b - 56)}`,
      `L ${r(x + cw * 0.57)},${r(b + 10)}`,
      `C ${r(x + cw * 0.60)},${r(b + 10)} ${r(x + cw * 0.64)},${b} ${r(x + cw * 0.68)},${b}`,
      // ST segment
      `L ${r(x + cw * 0.72)},${b}`,
      // T wave
      `C ${r(x + cw * 0.75)},${b} ${r(x + cw * 0.81)},${r(b - 20)} ${r(x + cw * 0.85)},${r(b - 20)}`,
      `C ${r(x + cw * 0.88)},${r(b - 20)} ${r(x + cw * 0.93)},${b} ${r(x + cw * 0.96)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// ─── Wenckebach helpers ────────────────────────────────────────────────

// wBeat: one conducted beat at sx with PR interval pr (pixels).
// P wave spans px 3–19; PR flat from 19 to pr; QRS+T span ~46px from QRS onset.
function wBeat(sx: number, pr: number): string {
  const b = B;
  const qx = sx + pr;
  return [
    `L ${r(sx + 3)},${b}`,
    `C ${r(sx + 5)},${b} ${r(sx + 9)},${r(b - 14)} ${r(sx + 11)},${r(b - 14)}`,
    `C ${r(sx + 14)},${r(b - 14)} ${r(sx + 17)},${b} ${r(sx + 19)},${b}`,
    `L ${r(qx)},${b}`,
    `L ${r(qx + 2)},${r(b + 5)}`,
    `L ${r(qx + 5)},${r(b - 56)}`,
    `L ${r(qx + 9)},${r(b + 10)}`,
    `C ${r(qx + 12)},${r(b + 10)} ${r(qx + 16)},${b} ${r(qx + 20)},${b}`,
    `L ${r(qx + 24)},${b}`,
    `C ${r(qx + 27)},${b} ${r(qx + 32)},${r(b - 18)} ${r(qx + 36)},${r(b - 18)}`,
    `C ${r(qx + 39)},${r(b - 18)} ${r(qx + 43)},${b} ${r(qx + 46)},${b}`,
  ].join(' ');
}

// wDroppedP: P wave only at sx — no QRS follows (the dropped beat).
function wDroppedP(sx: number): string {
  const b = B;
  return [
    `L ${r(sx + 3)},${b}`,
    `C ${r(sx + 5)},${b} ${r(sx + 9)},${r(b - 14)} ${r(sx + 11)},${r(b - 14)}`,
    `C ${r(sx + 14)},${r(b - 14)} ${r(sx + 17)},${b} ${r(sx + 19)},${b}`,
  ].join(' ');
}

// ─── Second-Degree AV Block — Mobitz I / Wenckebach ───────────────────
// 4:3 conduction: P-P = 112px (regular atrial rate).
// PR progressively lengthens (30→44→58px) across 3 beats before the dropped P.
// Two complete groups fit in 800px showing the repeating grouped pattern.
// PR flat segments: 11px → 25px → 39px (progressive lengthening visible).
function buildWenckebach(): string {
  const b = B;
  let path = `M 0,${b}`;

  // Group 1
  path += ' ' + wBeat(0, 30);
  path += ' ' + wBeat(112, 44);
  path += ' ' + wBeat(224, 58);
  path += ' ' + wDroppedP(336); // T3 ends at 328; P4 at 336 — 8px gap

  // Group 2 — 96px pause from P4 end (355) to P5 beat start (~451)
  path += ' ' + wBeat(448, 30);
  path += ' ' + wBeat(560, 44);
  path += ' ' + wBeat(672, 58);

  path += ` L ${W},${b}`;
  return path;
}

// ─── Second-Degree AV Block — Mobitz II ───────────────────────────────
// 3:2 conduction. P-P = 120px (regular atrial rate ~75 bpm).
// PR is CONSTANT at 28px before every conducted beat — no progressive lengthening.
// This is the teaching contrast with Wenckebach: sudden, unexpected QRS drop
// with an identical PR before and after the dropped beat.
function buildMobitzII(): string {
  const b = B;
  let path = `M 0,${b}`;

  // Group 1: two conducted beats then a dropped P
  path += ' ' + wBeat(0, 28);
  path += ' ' + wBeat(120, 28);
  path += ' ' + wDroppedP(240);

  // Group 2: two conducted beats then a dropped P — strip ends on the pause
  path += ' ' + wBeat(360, 28);
  path += ' ' + wBeat(480, 28);
  path += ' ' + wDroppedP(600);

  path += ` L ${W},${b}`;
  return path;
}

// ─── Third-Degree AV Block / Complete Heart Block ─────────────────────
// Atria and ventricles beat independently. Regular P waves (pp=95px) march
// through at their own rate; slow wide ventricular escape beats appear at
// manually tuned positions. Events are processed in x-sorted order —
// when a P and QRS overlap, QRS takes priority (P buried in complex).
// Result: variable apparent PR, multiple P waves between each QRS pair.
function escapeQRS(vx: number): string {
  const b = B;
  return [
    `L ${r(vx + 5)},${b}`,
    `C ${r(vx + 8)},${b} ${r(vx + 14)},${r(b - 16)} ${r(vx + 18)},${r(b - 10)}`,
    `L ${r(vx + 23)},${r(b + 2)}`,
    `L ${r(vx + 30)},${r(b - 52)}`,
    `L ${r(vx + 37)},${r(b - 40)}`,
    `L ${r(vx + 43)},${r(b + 12)}`,
    `L ${r(vx + 48)},${r(b + 18)}`,
    `C ${r(vx + 54)},${r(b + 18)} ${r(vx + 62)},${b} ${r(vx + 65)},${b}`,
  ].join(' ');
}

function buildCompleteHeartBlock(): string {
  const b = B;

  // P wave positions (pp=95): 0, 95, 190, 285, 380, 475, 570, 665, 760
  // Escape QRS positions (manually tuned, ~265px apart): 35, 305, 570
  // When V and P share x=570, V takes priority (QRS draws first, P is buried).
  type Ev = { x: number; kind: 'P' | 'V' };
  const events: Ev[] = [
    { x: 0,   kind: 'P' },
    { x: 35,  kind: 'V' },
    { x: 95,  kind: 'P' },
    { x: 190, kind: 'P' },
    { x: 285, kind: 'P' },
    { x: 305, kind: 'V' },
    { x: 380, kind: 'P' },
    { x: 475, kind: 'P' },
    { x: 570, kind: 'V' }, // V before P when same x — P gets buried
    { x: 570, kind: 'P' },
    { x: 665, kind: 'P' },
    { x: 760, kind: 'P' },
  ];

  let path = `M 0,${b}`;
  let cur = 0;

  for (const ev of events) {
    if (ev.x < cur) continue; // skip events whose space is already drawn
    if (ev.kind === 'V') {
      path += ' ' + escapeQRS(ev.x);
      cur = ev.x + 65;
    } else {
      path += ' ' + wDroppedP(ev.x);
      cur = ev.x + 19;
    }
  }

  path += ` L ${W},${b}`;
  return path;
}

// ─── Idioventricular Rhythm Family ────────────────────────────────────
// Wide bizarre ventricular QRS — impulse originates below the bundle of His.
// ivrBeat: 115px span (slower/broader). Used for IVR and ventricular escape.
// aivrBeat: 88px span. Used for AIVR to fit the faster cycle cleanly.
// Both share: slurred broad upstroke, mid-upstroke notch, tall spike,
// two-step descent, deep nadir, slow discordant return.
function ivrBeat(sx: number): string {
  const b = B;
  return [
    `L ${r(sx + 20)},${b}`,
    `C ${r(sx + 25)},${b} ${r(sx + 34)},${r(b - 18)} ${r(sx + 40)},${r(b - 10)}`,
    `L ${r(sx + 46)},${r(b + 3)}`,
    `L ${r(sx + 55)},${r(b - 54)}`,
    `L ${r(sx + 62)},${r(b - 40)}`,
    `L ${r(sx + 68)},${r(b + 10)}`,
    `L ${r(sx + 74)},${r(b + 20)}`,
    `C ${r(sx + 81)},${r(b + 20)} ${r(sx + 100)},${b} ${r(sx + 115)},${b}`,
  ].join(' ');
}

function buildIdioventricular(): string {
  // Rate ~40 bpm (cw=250). 3 beats; complex (95px) leaves ~155px flat per cycle.
  const cw = 250;
  let path = `M 0,${B}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += ' ' + ivrBeat(x);
  }
  return path + ` L ${W},${B}`;
}

function aivrBeat(sx: number): string {
  const b = B;
  return [
    `L ${r(sx + 8)},${b}`,
    `C ${r(sx + 13)},${b} ${r(sx + 21)},${r(b - 22)} ${r(sx + 27)},${r(b - 14)}`,
    `L ${r(sx + 33)},${r(b + 2)}`,
    `L ${r(sx + 42)},${r(b - 58)}`,
    `L ${r(sx + 48)},${r(b - 46)}`,
    `L ${r(sx + 54)},${r(b + 8)}`,
    `L ${r(sx + 60)},${r(b + 18)}`,
    `C ${r(sx + 67)},${r(b + 18)} ${r(sx + 80)},${b} ${r(sx + 88)},${b}`,
  ].join(' ');
}

function buildAIVR(): string {
  // Rate ~55 bpm (cw=130). 6 beats; wide complex (80px) with ~50px flat gaps.
  const cw = 130;
  let path = `M 0,${B}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += ' ' + aivrBeat(x);
  }
  return path + ` L ${W},${B}`;
}

function buildVentricularEscape(): string {
  // 2 normal sinus beats → long pause (~270px flat) → one late ventricular
  // escape beat. The escape arrives after the sinus node fails — a rescue
  // beat from the ventricle's inherent pacemaker.
  let path = `M 0,${B}`;
  path += ' ' + pqrst(0, 140);   // NSR beat 1
  path += ' ' + pqrst(140, 140); // NSR beat 2
  path += ` L 530,${B}`;         // long sinus pause (from ~263 to 530)
  path += ' ' + ivrBeat(530);    // ventricular escape at 530, ends at 645
  return path + ` L ${W},${B}`;
}

// ─── Emergency Ventricular Rhythms ────────────────────────────────────

// Torsades de Pointes: polymorphic VTach with twisting amplitude envelope.
// 11-beat amplitude ramp: full positive → near-zero (tiny flat beat) → full negative
// → partial recovery, creating the classic sinusoidal twist around the baseline.
// Near-zero beats (|a|=0.10–0.15) produce ≤9px complexes — the unmistakable
// zero-crossing that visually anchors the twist. Asymmetric clamping keeps
// negative spikes within the viewBox (y ≤ 96).
function buildTorsades(): string {
  const b = B;
  const cw = 70; // slightly tighter so 11 beats fill ~770px with a clear lead-out
  const amps = [1.0, 0.80, 0.45, 0.10, -0.15, -0.55, -0.90, -1.0, -0.80, -0.45, 0.10];
  let path = `M 0,${b}`;
  let i = 0;
  for (let x = 0; x + cw <= W && i < amps.length; x += cw, i++) {
    const a = amps[i];
    // Positive: spike rises above baseline up to 58px; negative: falls below, clamped
    const spikeY = a >= 0 ? r(b - 58 * a) : r(Math.min(b + 36 * (-a), 96));
    const step1Y = a >= 0 ? r(b - 44 * a) : r(Math.min(b + 27 * (-a), 95));
    path += [
      `L ${r(x + 5)},${b}`,
      // Slurred upstroke — scales with amplitude (near-zero beats barely move)
      `C ${r(x + 9)},${b} ${r(x + 14)},${r(b - 22 * a)} ${r(x + 20)},${r(b - 14 * a)}`,
      // Q-like notch (inverts for negative beats)
      `L ${r(x + 25)},${r(b + 4 * a)}`,
      // Main spike
      `L ${r(x + 34)},${spikeY}`,
      // Two-step descent
      `L ${r(x + 40)},${step1Y}`,
      `L ${r(x + 45)},${r(b + 8 * a)}`,
      // Nadir / overshoot
      `L ${r(x + 50)},${r(b + 20 * a)}`,
      // Return to baseline
      `C ${r(x + 55)},${r(b + 20 * a)} ${r(x + 64)},${b} ${r(x + 70)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// Generic chaotic baseline builder — used for coarse and fine VFib.
// Each entry in pattern is [segmentWidth, amplitude] (amplitude relative to baseline).
function chaosLine(pattern: [number, number][], startX: number, endX: number): string {
  let seg = '';
  let x = startX;
  let i = 0;
  while (x < endX) {
    const [w, amp] = pattern[i % pattern.length];
    const nx = Math.min(x + w, endX);
    seg += ` Q ${r(x + (nx - x) / 2)},${r(B + amp)} ${r(nx)},${B}`;
    x = nx;
    i++;
  }
  return seg;
}


// Fine VFib: low amplitude oscillations (±3–5px) — clearly active, not flat.
const FINE_VFIB: [number, number][] = [
  [9, -4], [7, 3], [11, -5], [8, 4], [12, -3], [6, 5], [10, -4],
  [8, 3], [9, -5], [7, 4], [11, -3], [8, 5], [10, -4], [7, 3],
  [9, -5], [6, 4], [11, -3], [8, 5], [10, -4], [7, 3],
];

function buildCoarseVFib(): string {
  const b = B;
  // Each entry: [width, ctrlAmp, cxFrac]
  //   width   — segment x-span in px (total = 800)
  //   ctrlAmp — control-point y offset from baseline: negative = above (peak), positive = below (trough)
  //             Q-bezier midpoint rule: visual amplitude ≈ ctrlAmp / 2 from baseline, so ctrlAmp
  //             must be ~2× the desired visual excursion. ctrlY clamped to 5–95 for viewbox safety.
  //   cxFrac  — control-point x as fraction of segment [0.1–0.9]
  //             0.2 = steep left-side rise / long right-side fall (left-heavy spike)
  //             0.8 = long left-side rise / steep right-side fall (right-heavy spike)
  //             0.5 = symmetric dome
  //   Same-sign adjacent pairs (peak→peak or trough→trough) break strict ±-alternation.
  const segs: [number, number, number][] = [
    // fast spikes — short, high ctrl, skewed shapes
    [7,  -52, 0.3], [9,  -36, 0.7], [11, +28, 0.5], [6,  -48, 0.4], [8,  -28, 0.6],
    // wide gentle swing then resume medium
    [20, +24, 0.5], [17, -20, 0.6],
    [9,  +30, 0.3], [12, -44, 0.5], [8,  +26, 0.7],
    // irregular cluster: same-side pairs and shape variety
    [6,  -54, 0.2], [14, -30, 0.5], [10, +28, 0.4], [7,  +22, 0.6], [16, -38, 0.7],
    [8,  -50, 0.3], [12, +26, 0.5], [9,  -24, 0.5], [19, -16, 0.4], [11, +30, 0.6],
    // chaotic mid-strip
    [7,  -46, 0.4], [13, +24, 0.7], [8,  -52, 0.2], [6,  +28, 0.5], [18, -22, 0.5],
    [9,  -40, 0.8], [10, +26, 0.4], [7,  +20, 0.3], [15, -34, 0.6], [12, +28, 0.5],
    // same-side run then wide flat
    [8,  -48, 0.3], [11, -30, 0.5], [9,  +30, 0.6], [6,  -54, 0.4], [16, +20, 0.5],
    [7,  +28, 0.7], [13, -38, 0.3], [8,  +24, 0.5], [20, -18, 0.6], [10, -42, 0.4],
    // second half — different rhythm of same-side pairs
    [7,  +26, 0.5], [12, -44, 0.2], [9,  -28, 0.7], [8,  +30, 0.4], [6,  -50, 0.5],
    [14, +22, 0.6], [10, -36, 0.3], [7,  -46, 0.5], [17, +24, 0.7], [11, -20, 0.4],
    // third quarter
    [9,  +28, 0.5], [6,  -52, 0.3], [8,  +26, 0.6], [13, -40, 0.4], [7,  -26, 0.7],
    [18, +20, 0.5], [9,  -48, 0.3], [6,  +30, 0.5], [14, -32, 0.6], [11, +22, 0.4],
    // final quarter
    [8,  -44, 0.5], [10, -30, 0.3], [7,  +26, 0.6], [12, -50, 0.4], [9,  +28, 0.5],
    [6,  +20, 0.7], [16, -36, 0.4], [8,  -48, 0.6], [13, +24, 0.5], [11, -22, 0.3],
    // tail — 66px remaining (7+9+6+14+8+10+12)
    [7,  +28, 0.5], [9,  -46, 0.3], [6,  -30, 0.6], [14, +22, 0.5],
    [8,  +28, 0.4], [10, -40, 0.5], [12, +24, 0.7],
  ];
  let path = `M 0,${b}`;
  let x = 0;
  for (const [w, ctrlAmp, cxFrac] of segs) {
    if (x >= W) break;
    const nx = Math.min(x + w, W);
    const ctrlX = r(x + (nx - x) * cxFrac);
    const ctrlY = r(Math.max(5, Math.min(95, b + ctrlAmp)));
    path += ` Q ${ctrlX},${ctrlY} ${r(nx)},${b}`;
    x = nx;
  }
  return path + (x < W ? ` L ${W},${b}` : '');
}

function buildFineVFib(): string {
  return `M 0,${B}` + chaosLine(FINE_VFIB, 0, W);
}

// Asystole: near-flat baseline with only 6 scattered 1px micro-artifacts.
// Realistic monitor appearance — no dramatic noise, but not a perfect flatline.
function buildAsystole(): string {
  const b = B;
  return [
    `M 0,${b}`,
    `L 55,${b}`,  `Q 59,${r(b - 1)} 63,${b}`,
    `L 145,${b}`, `Q 149,${r(b + 1)} 155,${b}`,
    `L 270,${b}`, `Q 274,${r(b - 1)} 279,${b}`,
    `L 395,${b}`, `Q 399,${r(b + 1)} 404,${b}`,
    `L 515,${b}`, `Q 519,${r(b - 1)} 524,${b}`,
    `L 638,${b}`, `Q 642,${r(b + 1)} 647,${b}`,
    `L 800,${b}`,
  ].join(' ');
}

// ─── Junctional Rhythm Family ─────────────────────────────────────────
// Key visual identity: long flat baseline (20% of cycle) before a narrow QRS
// with NO preceding upright P wave, followed by an inverted retrograde P dome
// sitting clearly in the ST segment. The extended isoelectric pre-QRS stretch
// is the primary cue that separates junctional from sinus — in sinus there is
// always an upright P filling that space.
//
// Retrograde P: 13px below baseline, wider bezier dome (spans ~19% of cycle).
// Amplitude chosen to be clearly visible without being cartoonish — slightly
// smaller than the 14px sinus P above baseline, but direction (below) is the
// unambiguous junctional marker.
//
// The same proportional template scales naturally across all three rates;
// only cw changes.
function junctionalBeat(sx: number, cw: number): string {
  const b = B;
  return [
    // Long flat baseline — definitively no upright P wave before QRS
    `L ${r(sx + cw * 0.20)},${b}`,
    // Narrow QRS
    `L ${r(sx + cw * 0.23)},${r(b + 5)}`,          // Q dip
    `L ${r(sx + cw * 0.29)},${r(b - 52)}`,         // R spike
    `L ${r(sx + cw * 0.34)},${r(b + 8)}`,          // S dip
    `C ${r(sx + cw * 0.38)},${r(b + 8)} ${r(sx + cw * 0.43)},${b} ${r(sx + cw * 0.47)},${b}`,
    // ST segment — short flat bridge to retrograde P
    `L ${r(sx + cw * 0.50)},${b}`,
    // Retrograde P — inverted dome, 13px below baseline, clearly visible
    `C ${r(sx + cw * 0.52)},${b} ${r(sx + cw * 0.57)},${r(b + 13)} ${r(sx + cw * 0.61)},${r(b + 13)}`,
    `C ${r(sx + cw * 0.65)},${r(b + 13)} ${r(sx + cw * 0.70)},${b} ${r(sx + cw * 0.71)},${b}`,
    // T wave — upright, follows retrograde P
    `C ${r(sx + cw * 0.74)},${b} ${r(sx + cw * 0.82)},${r(b - 14)} ${r(sx + cw * 0.87)},${r(b - 14)}`,
    `C ${r(sx + cw * 0.90)},${r(b - 14)} ${r(sx + cw * 0.96)},${b} ${r(sx + cw * 0.98)},${b}`,
  ].join(' ');
}

// Slow junctional variant — used only by buildJunctionalRhythm (cw=170).
// Differs from junctionalBeat in two ways:
//   1. Pre-QRS segment has a faint 2px undulation instead of a clean flat line —
//      suggests buried/indistinct atrial activity, breaking the TP-segment look
//      that makes the slow rate visually identical to sinus bradycardia.
//   2. Retrograde P reduced to 8px (from 13px) and made slightly asymmetric —
//      less like a tidy inverted sinus P, more like partially buried retrograde
//      conduction. Still visible on careful inspection (clinically correct).
function junctionalBeatSlow(sx: number, cw: number): string {
  const b = B;
  return [
    // Faint pre-QRS undulation — buried/indistinct atrial suggestion
    `C ${r(sx + cw * 0.05)},${b} ${r(sx + cw * 0.09)},${r(b + 2)} ${r(sx + cw * 0.12)},${r(b + 2)}`,
    `C ${r(sx + cw * 0.15)},${r(b + 2)} ${r(sx + cw * 0.18)},${b} ${r(sx + cw * 0.20)},${b}`,
    // Narrow QRS — identical to junctionalBeat
    `L ${r(sx + cw * 0.23)},${r(b + 5)}`,
    `L ${r(sx + cw * 0.29)},${r(b - 52)}`,
    `L ${r(sx + cw * 0.34)},${r(b + 8)}`,
    `C ${r(sx + cw * 0.38)},${r(b + 8)} ${r(sx + cw * 0.43)},${b} ${r(sx + cw * 0.47)},${b}`,
    // ST
    `L ${r(sx + cw * 0.51)},${b}`,
    // Retrograde P — 8px, asymmetric (quicker descent than rise = less sinus-like)
    `C ${r(sx + cw * 0.53)},${b} ${r(sx + cw * 0.58)},${r(b + 8)} ${r(sx + cw * 0.62)},${r(b + 8)}`,
    `C ${r(sx + cw * 0.64)},${r(b + 8)} ${r(sx + cw * 0.68)},${b} ${r(sx + cw * 0.70)},${b}`,
    // T wave
    `C ${r(sx + cw * 0.74)},${b} ${r(sx + cw * 0.82)},${r(b - 14)} ${r(sx + cw * 0.87)},${r(b - 14)}`,
    `C ${r(sx + cw * 0.90)},${r(b - 14)} ${r(sx + cw * 0.96)},${b} ${r(sx + cw * 0.98)},${b}`,
  ].join(' ');
}

function buildJunctionalRhythm(): string {
  // Rate ~47 bpm (cw=170). 4 full beats visible; clearly slow.
  let path = `M 0,${B}`;
  for (let x = 0; x + 170 <= W; x += 170) {
    path += ' ' + junctionalBeatSlow(x, 170);
  }
  return path + ` L ${W},${B}`;
}

function buildAcceleratedJunctional(): string {
  // Rate ~71 bpm (cw=105). 7 full beats — looks nearly normal-speed.
  // Retrograde P still clearly visible in ST before T wave.
  let path = `M 0,${B}`;
  for (let x = 0; x + 105 <= W; x += 105) {
    path += ' ' + junctionalBeat(x, 105);
  }
  return path + ` L ${W},${B}`;
}

function buildJunctionalTachy(): string {
  // Rate ~107 bpm (cw=75). 10 full beats — clearly fast, but distinctly
  // slower than SVT (cw=62). Retrograde P still present — visible after QRS.
  let path = `M 0,${B}`;
  for (let x = 0; x + 75 <= W; x += 75) {
    path += ' ' + junctionalBeat(x, 75);
  }
  return path + ` L ${W},${B}`;
}

// ─── Sinus Arrhythmia ─────────────────────────────────────────────────────
// Six beats with progressively widening then narrowing cycle widths, simulating
// one respiratory cycle. Identical P-QRS-T morphology every beat — only the
// spacing changes. R-R variation spans ~40px (100→140→110) to clearly show
// the pattern in the strip without looking grossly abnormal.
function buildSinusArrhythmia(): string {
  let path = `M 0,${B}`;
  // Expiratory slowing then inspiratory speeding: cw 100→115→130→140→125→110
  const beats: [number, number][] = [
    [0,   100],
    [100, 115],
    [215, 130],
    [345, 140],
    [485, 125],
    [610, 110],
  ];
  for (const [sx, cw] of beats) {
    path += ' ' + pqrst(sx, cw);
  }
  return path + ` L ${W},${B}`;
}

// ─── Multifocal Atrial Tachycardia ───────────────────────────────────────
// Eleven narrow-complex beats with three cycling P-wave morphologies and
// irregular RR intervals. Three P types:
//   A — upright dome (sinus-like, tallest)
//   B — shorter narrower dome (different atrial focus)
//   C — biphasic (initial positive then brief negative deflection)
// Variable PR intervals across types reflect different conduction paths.
function buildMAT(): string {
  const b = B;

  const qrst = (qx: number): string => [
    `L ${r(qx + 2)},${r(b + 4)}`,
    `L ${r(qx + 5)},${r(b - 48)}`,
    `L ${r(qx + 9)},${r(b + 8)}`,
    `C ${r(qx + 12)},${r(b + 8)} ${r(qx + 15)},${b} ${r(qx + 18)},${b}`,
    `L ${r(qx + 22)},${b}`,
    `C ${r(qx + 25)},${b} ${r(qx + 31)},${r(b - 13)} ${r(qx + 35)},${r(b - 13)}`,
    `C ${r(qx + 38)},${r(b - 13)} ${r(qx + 43)},${b} ${r(qx + 45)},${b}`,
  ].join(' ');

  const pA = (sx: number, h: number): string => [
    `L ${r(sx + 2)},${b}`,
    `C ${r(sx + 4)},${b} ${r(sx + 8)},${r(b - h)} ${r(sx + 11)},${r(b - h)}`,
    `C ${r(sx + 14)},${r(b - h)} ${r(sx + 18)},${b} ${r(sx + 20)},${b}`,
  ].join(' ');

  const pB = (sx: number, h: number): string => [
    `L ${r(sx + 2)},${b}`,
    `C ${r(sx + 4)},${b} ${r(sx + 7)},${r(b - h)} ${r(sx + 9)},${r(b - h)}`,
    `C ${r(sx + 11)},${r(b - h)} ${r(sx + 14)},${b} ${r(sx + 16)},${b}`,
  ].join(' ');

  const pC = (sx: number, h: number): string => [
    `L ${r(sx + 2)},${b}`,
    `C ${r(sx + 4)},${b} ${r(sx + 7)},${r(b - h)} ${r(sx + 10)},${r(b - h)}`,
    `C ${r(sx + 12)},${r(b - h)} ${r(sx + 15)},${b} ${r(sx + 17)},${b}`,
    `C ${r(sx + 18)},${b} ${r(sx + 20)},${r(b + 4)} ${r(sx + 21)},${r(b + 4)}`,
    `C ${r(sx + 22)},${r(b + 4)} ${r(sx + 23)},${b} ${r(sx + 24)},${b}`,
  ].join(' ');

  // [sx, pType, pHeight, pr]
  const beats: [number, 'a'|'b'|'c', number, number][] = [
    [0,   'a', 11, 25],
    [70,  'b',  7, 19],
    [130, 'c',  9, 27],
    [208, 'a', 12, 24],
    [272, 'b',  7, 20],
    [348, 'c',  8, 28],
    [425, 'a', 11, 23],
    [488, 'b',  7, 19],
    [558, 'c',  9, 26],
    [630, 'a', 11, 25],
    [700, 'b',  7, 20],
  ];

  let path = `M 0,${b}`;
  for (const [sx, type, h, pr] of beats) {
    const qx = sx + pr;
    if (type === 'a') path += ' ' + pA(sx, h);
    else if (type === 'b') path += ' ' + pB(sx, h);
    else path += ' ' + pC(sx, h);
    path += ` L ${r(qx)},${b}`;
    path += ' ' + qrst(qx);
  }
  return path + ` L ${W},${b}`;
}

// ─── Pulseless Electrical Activity ───────────────────────────────────────
// PEA is deliberately NOT a bizarre-looking waveform — it can be any organized
// rhythm. This strip uses a regular slightly-slow sinus pattern (cw=160, ~75bpm)
// so it looks reassuringly normal on the monitor. The teaching point lives
// entirely in the clinical content: organized electrical activity ≠ mechanical
// contraction. The monitor says one thing; the patient tells you another.
function buildPEA(): string {
  return repeatedPQRST(160);
}

// ─── Hyperkalemia Progression ─────────────────────────────────────────────
// Three sequential stages of worsening hyperkalemia, each visually distinct.
//
// Stage 1 — Peaked T waves (K+ ~5.5–6.5): normal P/QRS, but T wave is
// disproportionately tall and narrow — a symmetric tent, not the usual
// asymmetric dome. T amplitude roughly doubles normal (38px vs 20px).
//
// Stage 2 — QRS Widening (K+ ~6.5–7.5): P wave diminished (atrial standstill
// begins), QRS broadens with slurred components, T wave stays peaked but starts
// merging with the QRS tail. Isoelectric segments shorten.
//
// Stage 3 — Sine Wave (K+ >7.5): all discrete landmarks dissolve. No P, no
// identifiable QRS or T — one continuous smooth sinusoidal wave cycling above
// and below baseline. Pure C-bezier arcs connect beats without flat segments,
// recreating the pre-arrest "sine wave" appearance.
function buildHyperkalemiaT(): string {
  const b = B;
  const cw = 140;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + cw * 0.10)},${b}`,
      // P wave — slightly smaller (early K+ effect on atrial conduction)
      `C ${r(x + cw * 0.12)},${b} ${r(x + cw * 0.16)},${r(b - 10)} ${r(x + cw * 0.19)},${r(b - 10)}`,
      `C ${r(x + cw * 0.22)},${r(b - 10)} ${r(x + cw * 0.26)},${b} ${r(x + cw * 0.29)},${b}`,
      // PR segment
      `L ${r(x + cw * 0.37)},${b}`,
      // QRS — normal width and morphology
      `L ${r(x + cw * 0.39)},${r(b + 5)}`,
      `L ${r(x + cw * 0.43)},${r(b - 52)}`,
      `L ${r(x + cw * 0.46)},${r(b + 8)}`,
      `C ${r(x + cw * 0.49)},${r(b + 8)} ${r(x + cw * 0.53)},${b} ${r(x + cw * 0.56)},${b}`,
      // Short ST
      `L ${r(x + cw * 0.57)},${b}`,
      // PEAKED T — tall (38px), narrow, symmetric tent shape
      `C ${r(x + cw * 0.59)},${b} ${r(x + cw * 0.62)},${r(b - 38)} ${r(x + cw * 0.64)},${r(b - 38)}`,
      `C ${r(x + cw * 0.66)},${r(b - 38)} ${r(x + cw * 0.69)},${b} ${r(x + cw * 0.71)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

function buildHyperkalemiaQRS(): string {
  const b = B;
  const cw = 140;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + cw * 0.10)},${b}`,
      // P wave — barely a bump (atrial standstill encroaching)
      `C ${r(x + cw * 0.12)},${b} ${r(x + cw * 0.16)},${r(b - 4)} ${r(x + cw * 0.19)},${r(b - 4)}`,
      `C ${r(x + cw * 0.21)},${r(b - 4)} ${r(x + cw * 0.25)},${b} ${r(x + cw * 0.28)},${b}`,
      // Very short PR
      `L ${r(x + cw * 0.32)},${b}`,
      // Wide slurred QRS: broad C upstroke (conduction failing — spans 0.32→0.57)
      `C ${r(x + cw * 0.34)},${b} ${r(x + cw * 0.41)},${r(b - 36)} ${r(x + cw * 0.46)},${r(b - 48)}`,
      // S descent that just returns to baseline — no dip below (no flat ST after)
      `C ${r(x + cw * 0.51)},${r(b - 48)} ${r(x + cw * 0.56)},${b} ${r(x + cw * 0.57)},${b}`,
      // Peaked T flows immediately from the QRS return — no isoelectric gap
      `C ${r(x + cw * 0.59)},${b} ${r(x + cw * 0.63)},${r(b - 34)} ${r(x + cw * 0.66)},${r(b - 34)}`,
      `C ${r(x + cw * 0.69)},${r(b - 34)} ${r(x + cw * 0.75)},${b} ${r(x + cw * 0.79)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

function buildHyperkalemiaSine(): string {
  const b = B;
  const cw = 160; // slow ominous rate — conduction system deteriorating
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      // No P, no discrete QRS, no discrete T — pure continuous sinusoidal arc.
      // Rising limb (merged QRS+T): smooth broad ascent above baseline
      `C ${r(x + cw * 0.02)},${b} ${r(x + cw * 0.16)},${r(b - 48)} ${r(x + cw * 0.27)},${r(b - 48)}`,
      // Peak — broad rounded apex (no sharp R spike)
      `C ${r(x + cw * 0.37)},${r(b - 48)} ${r(x + cw * 0.46)},${r(b + 2)} ${r(x + cw * 0.50)},${r(b + 2)}`,
      // Falling below baseline (merged S/ST territory)
      `C ${r(x + cw * 0.53)},${r(b + 2)} ${r(x + cw * 0.60)},${r(b + 22)} ${r(x + cw * 0.65)},${r(b + 22)}`,
      // Nadir and return — smooth arc back to baseline
      `C ${r(x + cw * 0.70)},${r(b + 22)} ${r(x + cw * 0.87)},${b} ${r(x + cw * 0.96)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// ─── Bundle Branch Blocks ─────────────────────────────────────────────────
// Both are regular sinus rhythms (cw=140, ~71 bpm) with normal P waves and
// PR intervals. The QRS alone is abnormal — wide and morphologically distinct.
//
// RBBB (Lead II): normal initial forces → broad S wave dipping well below
// baseline → terminal secondary R′ deflection — the "rabbit ear" impression.
// T wave remains upright (concordant with main QRS deflection).
//
// LBBB (Lead II): no initial Q wave → slow slurred upstroke → broad notched
// monophasic R peak (bifid top) → broad slurred descent with no S below
// baseline → inverted discordant T wave.
//
// The two are visually opposite in their terminal QRS forces and T direction,
// making side-by-side comparison an effective teaching tool.
function buildRBBB(): string {
  const b = B;
  const cw = 140;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + cw * 0.10)},${b}`,
      // P wave — normal sinus dome
      `C ${r(x + cw * 0.12)},${b} ${r(x + cw * 0.16)},${r(b - 14)} ${r(x + cw * 0.19)},${r(b - 14)}`,
      `C ${r(x + cw * 0.22)},${r(b - 14)} ${r(x + cw * 0.26)},${b} ${r(x + cw * 0.29)},${b}`,
      // PR segment
      `L ${r(x + cw * 0.37)},${b}`,
      // Q dip
      `L ${r(x + cw * 0.39)},${r(b + 5)}`,
      // R spike
      `L ${r(x + cw * 0.43)},${r(b - 52)}`,
      // Descent to broad S — deep below baseline (RBBB terminal conduction delay)
      `L ${r(x + cw * 0.47)},${r(b + 18)}`,
      // Broad S plateau — flat L commands, stays clearly below baseline (~14px wide)
      `L ${r(x + cw * 0.57)},${r(b + 16)}`,
      // Angular rise toward R′ — L commands (sharp, not smooth)
      `L ${r(x + cw * 0.61)},${r(b + 4)}`,
      `L ${r(x + cw * 0.65)},${r(b - 28)}`,  // R′ peak — prominent terminal deflection
      // R′ descent back to baseline
      `C ${r(x + cw * 0.68)},${r(b - 28)} ${r(x + cw * 0.73)},${b} ${r(x + cw * 0.76)},${b}`,
      // T wave — upright, concordant
      `C ${r(x + cw * 0.79)},${b} ${r(x + cw * 0.85)},${r(b - 18)} ${r(x + cw * 0.89)},${r(b - 18)}`,
      `C ${r(x + cw * 0.92)},${r(b - 18)} ${r(x + cw * 0.97)},${b} ${r(x + cw * 0.99)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

function buildLBBB(): string {
  const b = B;
  const cw = 140;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + cw * 0.10)},${b}`,
      // P wave — normal sinus dome
      `C ${r(x + cw * 0.12)},${b} ${r(x + cw * 0.16)},${r(b - 14)} ${r(x + cw * 0.19)},${r(b - 14)}`,
      `C ${r(x + cw * 0.22)},${r(b - 14)} ${r(x + cw * 0.26)},${b} ${r(x + cw * 0.29)},${b}`,
      // PR segment
      `L ${r(x + cw * 0.38)},${b}`,
      // NO Q dip — LBBB obliterates septal Q
      // Broad slurred upstroke (C bezier — slow initial rise, wide)
      `C ${r(x + cw * 0.40)},${b} ${r(x + cw * 0.47)},${r(b - 36)} ${r(x + cw * 0.51)},${r(b - 52)}`,
      // Notched bifid peak — characteristic LBBB "M" shape
      `L ${r(x + cw * 0.53)},${r(b - 46)}`,  // brief notch dip
      `L ${r(x + cw * 0.56)},${r(b - 54)}`,  // second peak (fractionally higher)
      // Broad descent: angular L step then curve — breaks the sine-wave silhouette
      `L ${r(x + cw * 0.61)},${r(b - 22)}`,  // angular step partway down
      `C ${r(x + cw * 0.64)},${r(b - 22)} ${r(x + cw * 0.70)},${b} ${r(x + cw * 0.75)},${b}`,
      // Wider ST segment — visible flat isoelectric gap before T
      `L ${r(x + cw * 0.80)},${b}`,
      // Inverted T wave — discordant, reduced amplitude (not dramatic)
      `C ${r(x + cw * 0.83)},${b} ${r(x + cw * 0.88)},${r(b + 10)} ${r(x + cw * 0.91)},${r(b + 10)}`,
      `C ${r(x + cw * 0.94)},${r(b + 10)} ${r(x + cw * 0.97)},${b} ${r(x + cw * 0.99)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// ─── Pacemaker Rhythms ────────────────────────────────────────────────────
// A pacing spike is a near-vertical 2px-wide, 16px-tall sharp deflection —
// the signature artifact of an electrical pacing impulse on ECG paper.
// Pure L commands (no bezier): angular, not rounded.

// Wide bizarre paced QRS starting at absolute sx (LBBB morphology — slow slurred
// upstroke from ventricular origin, tall R, two-step staircase descent, deep nadir).
// Span: ~90px.
function pacedWideQRS(sx: number): string {
  const b = B;
  return [
    `C ${r(sx + 6)},${b} ${r(sx + 15)},${r(b - 20)} ${r(sx + 21)},${r(b - 12)}`,
    `L ${r(sx + 27)},${r(b - 60)}`,
    `L ${r(sx + 33)},${r(b - 47)}`,
    `L ${r(sx + 39)},${r(b + 10)}`,
    `L ${r(sx + 45)},${r(b + 20)}`,
    `C ${r(sx + 52)},${r(b + 20)} ${r(sx + 68)},${b} ${r(sx + 80)},${b}`,
  ].join(' ');
}

// Atrial Paced Rhythm — every beat: atrial spike → paced P dome → PR segment
// → narrow QRS → upright T wave. cw=115 (~78 bpm).
// Distinguishing feature: sharp spike just before each upright P wave.
function buildAtrialPaced(): string {
  const b = B;
  const cw = 115;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + 4)},${b}`,
      // Atrial pacing spike — sharp 2px-wide 16px-tall vertical artifact
      `L ${r(x + 5)},${r(b - 16)}`, `L ${r(x + 6)},${b}`,
      // Paced P wave — slightly narrower than sinus, still upright dome
      `C ${r(x + 8)},${b} ${r(x + 12)},${r(b - 11)} ${r(x + 15)},${r(b - 11)}`,
      `C ${r(x + 18)},${r(b - 11)} ${r(x + 22)},${b} ${r(x + 24)},${b}`,
      // PR segment (normal conduction to ventricles)
      `L ${r(x + 34)},${b}`,
      // Narrow QRS — ventricular conduction intact
      `L ${r(x + 36)},${r(b + 5)}`,
      `L ${r(x + 40)},${r(b - 52)}`,
      `L ${r(x + 44)},${r(b + 9)}`,
      `C ${r(x + 47)},${r(b + 9)} ${r(x + 51)},${b} ${r(x + 55)},${b}`,
      // ST segment
      `L ${r(x + 61)},${b}`,
      // T wave — upright, asymmetric
      `C ${r(x + 64)},${b} ${r(x + 71)},${r(b - 17)} ${r(x + 77)},${r(b - 17)}`,
      `C ${r(x + 81)},${r(b - 17)} ${r(x + 87)},${b} ${r(x + 91)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// Ventricular Paced Rhythm — every beat: ventricular spike → wide LBBB-like
// QRS → discordant inverted T. cw=115 (~78 bpm). No P wave visible.
// Distinguishing feature: spike before each wide bizarre beat, no upright P.
function buildVentricularPaced(): string {
  const b = B;
  const cw = 115;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + 9)},${b}`,
      // Ventricular pacing spike
      `L ${r(x + 10)},${r(b - 16)}`, `L ${r(x + 11)},${b}`,
      // Wide LBBB-like QRS: slurred broad upstroke, tall monophasic R, staircase descent
      `C ${r(x + 17)},${b} ${r(x + 26)},${r(b - 20)} ${r(x + 32)},${r(b - 12)}`,
      `L ${r(x + 38)},${r(b - 60)}`,
      `L ${r(x + 44)},${r(b - 47)}`,
      `L ${r(x + 50)},${r(b + 10)}`,
      `L ${r(x + 56)},${r(b + 20)}`,
      `C ${r(x + 63)},${r(b + 20)} ${r(x + 79)},${b} ${r(x + 91)},${b}`,
      // Discordant T — small inverted dome (opposite direction to paced QRS)
      `C ${r(x + 94)},${b} ${r(x + 100)},${r(b + 9)} ${r(x + 104)},${r(b + 9)}`,
      `C ${r(x + 107)},${r(b + 9)} ${r(x + 113)},${b} ${r(x + 114)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// AV Sequential Paced Rhythm — every beat has TWO spikes: an atrial spike
// (before paced P wave) and a ventricular spike (before wide paced QRS).
// cw=125 (~72 bpm). Both chambers are paced — used when AV node is unreliable.
function buildAVSequentialPaced(): string {
  const b = B;
  const cw = 125;
  let path = `M 0,${b}`;
  for (let x = 0; x + cw <= W; x += cw) {
    path += [
      `L ${r(x + 4)},${b}`,
      // Atrial spike
      `L ${r(x + 5)},${r(b - 16)}`, `L ${r(x + 6)},${b}`,
      // Paced P wave (upright, narrow)
      `C ${r(x + 8)},${b} ${r(x + 12)},${r(b - 11)} ${r(x + 15)},${r(b - 11)}`,
      `C ${r(x + 18)},${r(b - 11)} ${r(x + 22)},${b} ${r(x + 24)},${b}`,
      // Short AV delay (programmed interval)
      `L ${r(x + 30)},${b}`,
      // Ventricular spike
      `L ${r(x + 31)},${r(b - 16)}`, `L ${r(x + 32)},${b}`,
      // Wide LBBB-like QRS
      `C ${r(x + 38)},${b} ${r(x + 48)},${r(b - 20)} ${r(x + 54)},${r(b - 12)}`,
      `L ${r(x + 60)},${r(b - 60)}`,
      `L ${r(x + 66)},${r(b - 47)}`,
      `L ${r(x + 72)},${r(b + 10)}`,
      `L ${r(x + 78)},${r(b + 20)}`,
      `C ${r(x + 85)},${r(b + 20)} ${r(x + 101)},${b} ${r(x + 111)},${b}`,
      // Discordant T
      `C ${r(x + 113)},${b} ${r(x + 119)},${r(b + 8)} ${r(x + 122)},${r(b + 8)}`,
      `C ${r(x + 123)},${r(b + 8)} ${r(x + 125)},${b} ${r(x + 125)},${b}`,
    ].join(' ');
  }
  return path + ` L ${W},${b}`;
}

// Pacemaker Failure to Capture — spikes fire on schedule but some produce
// no depolarization: just a spike artifact then flatline.
// Pattern: 2 captures → 3 failures → 2 captures. cw=115.
// Key teaching: spike present but QRS absent — the stimulus did not depolarize
// the myocardium (lead dislodgement, fibrosis at electrode tip, high threshold).
function buildPacemakerFailureCapture(): string {
  const b = B;

  const capturedBeat = (sx: number): string => [
    `L ${r(sx + 9)},${b}`,
    `L ${r(sx + 10)},${r(b - 16)}`, `L ${r(sx + 11)},${b}`,
    `C ${r(sx + 17)},${b} ${r(sx + 26)},${r(b - 20)} ${r(sx + 32)},${r(b - 12)}`,
    `L ${r(sx + 38)},${r(b - 60)}`,
    `L ${r(sx + 44)},${r(b - 47)}`,
    `L ${r(sx + 50)},${r(b + 10)}`,
    `L ${r(sx + 56)},${r(b + 20)}`,
    `C ${r(sx + 63)},${r(b + 20)} ${r(sx + 79)},${b} ${r(sx + 113)},${b}`,
  ].join(' ');

  const failedBeat = (sx: number): string => [
    `L ${r(sx + 9)},${b}`,
    `L ${r(sx + 10)},${r(b - 16)}`, `L ${r(sx + 11)},${b}`,
    `L ${r(sx + 115)},${b}`, // flat baseline — no depolarization follows spike
  ].join(' ');

  let path = `M 0,${b}`;
  path += capturedBeat(0);
  path += capturedBeat(115);
  path += failedBeat(230);
  path += failedBeat(345);
  path += failedBeat(460);
  path += capturedBeat(575);
  path += capturedBeat(690);  // ends at 803 → trimmed
  return path + ` L ${W},${b}`;
}

// Pacemaker Failure to Sense — pacemaker does not detect native QRS complexes
// and fires on its own timer regardless, producing spikes right after native beats.
// Pattern: 2 native sinus beats → inappropriate spike+paced beat → 1 native beat
// → another inappropriate spike+paced beat → 1 native beat.
// Key teaching: spike appears immediately after a native QRS (pacemaker should
// have been inhibited by the native beat, but wasn't — it failed to sense it).
function buildPacemakerFailureSense(): string {
  const b = B;
  let path = `M 0,${b}`;

  // Native sinus beat 1: sx=0, cw=140 — T wave ends at ~123
  path += ' ' + pqrst(0, 140);
  // Native sinus beat 2: sx=140, cw=140 — T wave ends at ~263
  path += ' ' + pqrst(140, 140);

  // Pacemaker failed to sense beat 2; fires at its timer — spike at 267
  path += ` L 267,${b} L 268,${r(b - 16)} L 269,${b}`;
  // Paced wide beat starting at 269
  path += [
    `C ${r(275)},${b} ${r(284)},${r(b - 20)} ${r(290)},${r(b - 12)}`,
    `L ${r(296)},${r(b - 60)}`,
    `L ${r(302)},${r(b - 47)}`,
    `L ${r(308)},${r(b + 10)}`,
    `L ${r(314)},${r(b + 20)}`,
    `C ${r(321)},${r(b + 20)} ${r(337)},${b} ${r(349)},${b}`,
  ].join(' ');

  // Native beat 3: sx=400, cw=140 — T wave ends at ~523
  path += ` L 400,${b}`;
  path += ' ' + pqrst(400, 140);

  // Pacemaker fires again at 529 (right after T wave of beat 3)
  path += ` L 529,${b} L 530,${r(b - 16)} L 531,${b}`;
  // Another paced wide beat
  path += [
    `C ${r(537)},${b} ${r(546)},${r(b - 20)} ${r(552)},${r(b - 12)}`,
    `L ${r(558)},${r(b - 60)}`,
    `L ${r(564)},${r(b - 47)}`,
    `L ${r(570)},${r(b + 10)}`,
    `L ${r(576)},${r(b + 20)}`,
    `C ${r(583)},${r(b + 20)} ${r(599)},${b} ${r(611)},${b}`,
  ].join(' ');

  // Native beat 4: sx=660, cw=140 — ends at ~783
  path += ` L 660,${b}`;
  path += ' ' + pqrst(660, 140);

  return path + ` L ${W},${b}`;
}

export const WAVEFORMS: Record<string, string> = {
  nsr:                  repeatedPQRST(140),
  sinus_bradycardia:    repeatedPQRST(200),
  sinus_tachycardia:    repeatedPQRST(87),
  afib:                 buildAFib(),
  aflutter:             buildAFlutter(),
  vtach:                buildVTach(),
  pac:                  buildPAC(),
  pvc:                  buildPVC(),
  svt:                  buildSVT(),
  first_degree_avb:     buildFirstDegreeAVB(),
  mobitz_i:             buildWenckebach(),
  mobitz_ii:              buildMobitzII(),
  complete_heart_block:   buildCompleteHeartBlock(),
  junctional_rhythm:      buildJunctionalRhythm(),
  accelerated_junctional: buildAcceleratedJunctional(),
  junctional_tachycardia: buildJunctionalTachy(),
  idioventricular:        buildIdioventricular(),
  aivr:                   buildAIVR(),
  ventricular_escape:     buildVentricularEscape(),
  torsades:               buildTorsades(),
  vfib_coarse:            buildCoarseVFib(),
  vfib_fine:              buildFineVFib(),
  asystole:               buildAsystole(),
  sinus_arrhythmia:               buildSinusArrhythmia(),
  mat:                            buildMAT(),
  pea:                            buildPEA(),
  hyperkalemia_t:                 buildHyperkalemiaT(),
  hyperkalemia_qrs:               buildHyperkalemiaQRS(),
  hyperkalemia_sine:              buildHyperkalemiaSine(),
  rbbb:                           buildRBBB(),
  lbbb:                           buildLBBB(),
  atrial_paced:                   buildAtrialPaced(),
  ventricular_paced:              buildVentricularPaced(),
  av_sequential_paced:            buildAVSequentialPaced(),
  pacemaker_failure_capture:      buildPacemakerFailureCapture(),
  pacemaker_failure_sense:        buildPacemakerFailureSense(),
};
