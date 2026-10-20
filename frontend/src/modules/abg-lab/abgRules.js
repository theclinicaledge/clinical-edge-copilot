/** Deterministic educational patterns. No AI, network, or patient-data storage.
 * Direction-based teaching: Merck Manual, Acid-Base Disorders.
 * Direction alone does not establish adequate compensation or a diagnosis.
 */
const NORMAL = {
  pH: { lo: 7.35, hi: 7.45 },
  paco2: { lo: 35, hi: 45 },
  hco3: { lo: 22, hi: 26 },
};
const blank = v => v == null || String(v).trim() === '';
const fmt = v => Number(v.toFixed(1));
const status = (v, bounds) => v < bounds.lo ? 'low' : v > bounds.hi ? 'high' : 'normal';

export function normalizeFio2(value) {
  if (blank(value)) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return NaN;
  if (n >= 0.21 && n <= 1) return n;
  if (n >= 21 && n <= 100) return n / 100;
  return NaN;
}

export function validateABGInput(f) {
  for (const [key, lo, hi, label] of [
    ['pH', 6.5, 8, 'pH (6.5–8.0)'],
    ['paco2', 5, 150, 'PaCO₂ (5–150 mmHg)'],
    ['hco3', 1, 60, 'HCO₃ (1–60 mEq/L)'],
  ]) {
    const v = Number(f[key]);
    if (blank(f[key]) || !Number.isFinite(v) || v < lo || v > hi) return `Enter a valid ${label}.`;
  }
  if (!blank(f.pao2) && (!Number.isFinite(Number(f.pao2)) || Number(f.pao2) < 0 || Number(f.pao2) > 700)) {
    return 'Enter a valid PaO₂ (0–700 mmHg), or leave blank.';
  }
  if (!blank(f.fio2) && !Number.isFinite(normalizeFio2(f.fio2))) {
    return 'Enter FiO₂ as a decimal (0.21–1.0) or percentage (21–100), or leave blank.';
  }
  return null;
}

function primaryDisorder(ph, co2s, hco3s) {
  if (ph === 'acidemia') {
    if (co2s === 'high' && hco3s === 'low') return 'Mixed: respiratory + metabolic acidosis';
    if (co2s === 'high') return 'Respiratory acidosis';
    if (hco3s === 'low') return 'Metabolic acidosis';
    return 'Acidemia · pattern unclear';
  }
  if (ph === 'alkalemia') {
    if (co2s === 'low' && hco3s === 'high') return 'Mixed: respiratory + metabolic alkalosis';
    if (co2s === 'low') return 'Respiratory alkalosis';
    if (hco3s === 'high') return 'Metabolic alkalosis';
    return 'Alkalemia · pattern unclear';
  }
  if (co2s !== 'normal' || hco3s !== 'normal') return 'Compensated or mixed pattern possible';
  return 'Values within reference ranges';
}

function compensationCheck(disorder, paco2, hco3, co2s, hco3s) {
  const note = 'Direction alone cannot confirm adequate compensation or rule out a mixed disorder. Timing, trends, and the full clinical picture still matter.';
  if (disorder.startsWith('Mixed')) return {
    kind: 'mixed', answer: 'same',
    summary: `CO₂ and bicarbonate both push pH ${disorder.includes('acidosis') ? 'down' : 'up'}. Both contribute to the pattern rather than balancing each other.`,
    note: 'Compensation works against the primary pH change. Two changes that push pH the same way suggest more than one primary process.',
  };
  if (disorder.startsWith('Respiratory') || disorder.startsWith('Metabolic')) {
    const respiratory = disorder.startsWith('Respiratory');
    const label = respiratory ? 'HCO₃' : 'PaCO₂';
    const measured = respiratory ? hco3 : paco2;
    const state = respiratory ? hco3s : co2s;
    const reference = respiratory ? '22–26 mEq/L' : '35–45 mmHg';
    const units = respiratory ? 'mEq/L' : 'mmHg';
    const effect = respiratory ? state === 'high' ? 'up' : 'down' : state === 'high' ? 'down' : 'up';
    return {
      kind: 'direction', answer: state === 'normal' ? 'in-range' : 'opposing',
      summary: state === 'normal'
        ? `${label} ${measured} ${units} is within its reference range (${reference}). No out-of-range change in this value is visible in this snapshot.`
        : `${label} ${measured} ${units} is ${state}. This pushes pH ${effect}, opposing the primary pH change. A compensatory response is possible.`,
      note,
    };
  }
  return {
    kind: 'context', answer: 'context',
    summary: disorder === 'Values within reference ranges'
      ? 'All three values are in range. There is no obvious acid-side or alkaline-side pattern in this snapshot.'
      : disorder === 'Compensated or mixed pattern possible'
        ? 'The pH is in range, but CO₂ or bicarbonate is not. Compensation or a mixed process may explain this; pH alone cannot tell them apart.'
        : 'Neither value clearly explains the pH direction using these reference ranges. Recheck the values and review the clinical context.',
    note: 'A reference-range pH does not exclude an acid-base disorder. Baseline values, trends, and additional labs may change the interpretation.',
  };
}

function oxygenNote(pao2, fio2) {
  if (pao2 == null && fio2 == null) return null;
  const result = { pao2, fio2, pf: null };
  if (pao2 != null) {
    result.pao2Label = pao2 < 60 ? 'Below 60 mmHg'
      : pao2 < 80 ? 'Below the typical adult room-air range'
      : pao2 <= 100 ? 'In the typical adult room-air range (80–100 mmHg)'
      : 'Above the typical adult room-air range';
  }
  if (pao2 != null && fio2 != null) {
    result.pf = Math.round(pao2 / fio2);
    result.fio2Display = `${fmt(fio2 * 100)}%`;
    result.formula = `${fmt(fio2 * 100)}% = ${fio2}. ${pao2} ÷ ${fio2} = ${result.pf}`;
    result.pfLabel = result.pf > 300 ? 'P/F above 300' : result.pf > 200 ? 'P/F over 200 through 300'
      : result.pf > 100 ? 'P/F over 100 through 200' : 'P/F 100 or below';
    result.note = 'P/F describes oxygenation relative to inspired oxygen. It does not diagnose ARDS by itself; oxygen delivery, imaging, timing, and clinical context matter.';
  } else {
    result.note = pao2 == null ? 'Add PaO₂ to assess oxygenation. FiO₂ alone cannot produce a P/F ratio.'
      : 'FiO₂ was not entered, so P/F is not calculated. Room air is not assumed. Age, altitude, and oxygen support affect the PaO₂ interpretation.';
  }
  return result;
}

const PEARLS = {
  'Respiratory acidosis': 'Higher CO₂ pushes pH down. A raised bicarbonate may be a response; timing changes the expected amount.',
  'Metabolic acidosis': 'Low bicarbonate pushes pH down. A lower CO₂ pushes back in the other direction; that is a clue to a possible response, not proof that it is adequate.',
  'Respiratory alkalosis': 'Lower CO₂ pushes pH up. The bicarbonate response takes time, so history helps explain the pattern.',
  'Metabolic alkalosis': 'Higher bicarbonate pushes pH up. A higher CO₂ pushes back down; the direction is a clue, not a complete compensation assessment.',
  'Compensated or mixed pattern possible': 'A pH inside the reference range does not make abnormal CO₂ or bicarbonate disappear.',
};

export function interpretABG(input) {
  const error = validateABGInput(input);
  if (error) throw new RangeError(error);
  const pH = Number(input.pH), paco2 = Number(input.paco2), hco3 = Number(input.hco3);
  const pao2 = blank(input.pao2) ? null : Number(input.pao2);
  const fio2 = normalizeFio2(input.fio2);
  const phStat = pH < 7.35 ? 'acidemia' : pH > 7.45 ? 'alkalemia' : 'near-normal';
  const co2s = status(paco2, NORMAL.paco2), hco3s = status(hco3, NORMAL.hco3);
  const disorder = primaryDisorder(phStat, co2s, hco3s);
  const check = compensationCheck(disorder, paco2, hco3, co2s, hco3s);
  const steps = [
    `pH ${pH}: ${phStat === 'near-normal' ? 'inside the 7.35–7.45 reference range' : phStat}.`,
    `PaCO₂ ${paco2} mmHg: ${co2s === 'normal' ? 'in range (35–45)' : co2s === 'high' ? 'high, pushing pH down' : 'low, pushing pH up'}.`,
    `HCO₃ ${hco3} mEq/L: ${hco3s === 'normal' ? 'in range (22–26)' : hco3s === 'low' ? 'low, pushing pH down' : 'high, pushing pH up'}.`,
  ];
  const contributors = phStat === 'acidemia' ? [co2s === 'high', hco3s === 'low']
    : phStat === 'alkalemia' ? [co2s === 'low', hco3s === 'high'] : [false, false];
  return {
    values: { pH, paco2, hco3 }, phStatus: phStat, disorder,
    compensation: check.summary, compensationCheck: check, steps,
    driver: contributors[0] && contributors[1] ? 'both' : contributors[0] ? 'co2' : contributors[1] ? 'hco3' : 'neither',
    oxygenation: oxygenNote(pao2, fio2),
    pearl: PEARLS[disorder] ?? 'Match the pH direction with both values, then look at how the other value affects pH. A label is only the start of the interpretation.',
  };
}
