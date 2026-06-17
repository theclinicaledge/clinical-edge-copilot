/**
 * ABG & Oxygenation Lab — deterministic rules engine (v1)
 * No AI, no API calls. Pure clinical pattern logic.
 */

const NORMAL = {
  pH:    { lo: 7.35, hi: 7.45 },
  paco2: { lo: 35,   hi: 45   },
  hco3:  { lo: 22,   hi: 26   },
};

function phStatus(pH) {
  if (pH < NORMAL.pH.lo) return 'acidemia';
  if (pH > NORMAL.pH.hi) return 'alkalemia';
  return 'near-normal';
}

function paco2Status(v) {
  if (v > NORMAL.paco2.hi) return 'high';
  if (v < NORMAL.paco2.lo) return 'low';
  return 'normal';
}

function hco3Status(v) {
  if (v > NORMAL.hco3.hi) return 'high';
  if (v < NORMAL.hco3.lo) return 'low';
  return 'normal';
}

function primaryDisorder(ph, co2s, hco3s) {
  if (ph === 'acidemia') {
    if (co2s === 'high' && hco3s !== 'low') return 'Respiratory acidosis';
    if (hco3s === 'low' && co2s !== 'high') return 'Metabolic acidosis';
    if (co2s === 'high' && hco3s === 'low') return 'Mixed: respiratory + metabolic acidosis';
    return 'Acidemia — pattern unclear';
  }
  if (ph === 'alkalemia') {
    if (co2s === 'low' && hco3s !== 'high') return 'Respiratory alkalosis';
    if (hco3s === 'high' && co2s !== 'low') return 'Metabolic alkalosis';
    if (co2s === 'low' && hco3s === 'high') return 'Mixed: respiratory + metabolic alkalosis';
    return 'Alkalemia — pattern unclear';
  }
  // near-normal pH
  if (co2s !== 'normal' || hco3s !== 'normal') return 'Compensated or mixed pattern likely';
  return 'Within normal limits';
}

function compensationNote(disorder, co2s, hco3s) {
  if (disorder.startsWith('Mixed') || disorder === 'Within normal limits') return null;
  if (disorder.includes('Respiratory acidosis')) {
    return hco3s === 'high'
      ? 'Metabolic compensation appears present (HCO₃ elevated).'
      : 'Metabolic compensation is not obvious.';
  }
  if (disorder.includes('Metabolic acidosis')) {
    return co2s === 'low'
      ? 'Respiratory compensation appears present (PaCO₂ low).'
      : 'Respiratory compensation is not obvious.';
  }
  if (disorder.includes('Respiratory alkalosis')) {
    return hco3s === 'low'
      ? 'Metabolic compensation appears present (HCO₃ reduced).'
      : 'Metabolic compensation is not obvious.';
  }
  if (disorder.includes('Metabolic alkalosis')) {
    return co2s === 'high'
      ? 'Respiratory compensation appears present (PaCO₂ elevated).'
      : 'Respiratory compensation is not obvious.';
  }
  if (disorder === 'Compensated or mixed pattern likely') {
    return 'Possible mixed or compensated pattern — both CO₂ and HCO₃ are abnormal with near-normal pH.';
  }
  return null;
}

function buildSteps(pH, paco2, hco3, phStat, co2s, hco3s) {
  const steps = [];

  if (phStat === 'acidemia')      steps.push(`pH ${pH} is low → acidemia`);
  else if (phStat === 'alkalemia') steps.push(`pH ${pH} is high → alkalemia`);
  else                             steps.push(`pH ${pH} is near-normal`);

  if (co2s === 'high')   steps.push(`PaCO₂ ${paco2} mmHg is elevated → respiratory acid direction`);
  else if (co2s === 'low') steps.push(`PaCO₂ ${paco2} mmHg is low → respiratory alkaline direction`);
  else                    steps.push(`PaCO₂ ${paco2} mmHg is within normal range`);

  if (hco3s === 'high')  steps.push(`HCO₃ ${hco3} mEq/L is elevated → metabolic alkaline signal`);
  else if (hco3s === 'low') steps.push(`HCO₃ ${hco3} mEq/L is low → metabolic acid signal`);
  else                    steps.push(`HCO₃ ${hco3} mEq/L is within normal range`);

  return steps;
}

function oxygenNote(pao2, fio2Raw) {
  if (pao2 == null && fio2Raw == null) return null;

  const result = {};

  if (pao2 != null) {
    if (pao2 < 60)        result.pao2Label = 'Low oxygenation (PaO₂ < 60 mmHg)';
    else if (pao2 < 80)   result.pao2Label = 'Mildly reduced oxygenation (PaO₂ 60–79 mmHg)';
    else if (pao2 <= 100) result.pao2Label = 'PaO₂ within typical room-air range (80–100 mmHg)';
    else                  result.pao2Label = `PaO₂ ${pao2} mmHg — above typical room-air range; interpret with FiO₂ context`;
  }

  if (pao2 != null && fio2Raw != null) {
    let fio2 = parseFloat(fio2Raw);
    if (fio2 > 1) fio2 = fio2 / 100; // normalize 40 → 0.40
    const pf = Math.round(pao2 / fio2);
    result.pf = pf;
    result.fio2Display = `${Math.round(fio2 * 100)}%`;
    if (pf >= 300)      result.pfLabel = 'Generally preserved oxygenation';
    else if (pf >= 200) result.pfLabel = 'Reduced oxygenation';
    else if (pf >= 100) result.pfLabel = 'Significantly reduced oxygenation';
    else                result.pfLabel = 'Severely reduced oxygenation';
  }

  return result;
}

const PEARLS = {
  'Respiratory acidosis':    'Start with pH, then ask whether CO₂ or HCO₃ explains the direction.',
  'Metabolic acidosis':      'A low HCO₃ in the setting of acidemia points to metabolic loss or gain of acid. Oxygenation and ventilation are separate stories.',
  'Respiratory alkalosis':   'A low PaCO₂ with alkalemia often reflects hyperventilation. Ask what is driving the breathing pattern.',
  'Metabolic alkalosis':     'Elevated HCO₃ with alkalemia is common after vomiting, NG suction, or excess bicarbonate. Chloride story matters here.',
  'Mixed: respiratory + metabolic acidosis': 'Both CO₂ and HCO₃ are pushing in the acid direction. This is a complex picture — consider ventilatory and metabolic contributors together.',
  'Mixed: respiratory + metabolic alkalosis': 'Both CO₂ and HCO₃ are pushing alkaline. Consider iatrogenic causes and clinical context carefully.',
  'Compensated or mixed pattern likely': 'A normal pH with abnormal CO₂ and HCO₃ usually means the body is balancing something — or two opposing disorders are present.',
  'Within normal limits': 'Values are all within normal range. No acid-base disturbance is identified from these numbers.',
  'Acidemia — pattern unclear': 'Start with pH, then ask whether CO₂ or HCO₃ explains the direction.',
  'Alkalemia — pattern unclear': 'Start with pH, then ask whether CO₂ or HCO₃ explains the direction.',
};

export function interpretABG({ pH, paco2, hco3, pao2, fio2 }) {
  const phStat = phStatus(pH);
  const co2s   = paco2Status(paco2);
  const hco3s  = hco3Status(hco3);
  const disorder = primaryDisorder(phStat, co2s, hco3s);
  const compensation = compensationNote(disorder, co2s, hco3s);
  const steps = buildSteps(pH, paco2, hco3, phStat, co2s, hco3s);
  const oxygenation = oxygenNote(pao2 !== '' ? parseFloat(pao2) : null, fio2 !== '' ? fio2 : null);
  const pearl = PEARLS[disorder] ?? 'Start with pH, then ask whether CO₂ or HCO₃ explains the direction.';

  return {
    phStatus:     phStat,
    disorder,
    compensation,
    steps,
    oxygenation,
    pearl,
  };
}
