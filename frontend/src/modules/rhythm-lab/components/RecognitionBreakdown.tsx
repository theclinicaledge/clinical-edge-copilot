import type { Rhythm, RecognitionBreakdown as BreakdownData, BreakdownRow } from '../data/rhythms';

/** Generate a fallback breakdown from existing rhythm fields for rhythms without custom data. */
function buildFallback(r: Rhythm): BreakdownData {
  // Infer PR relationship from context
  const hasNoP = /absent|no.*p wave|no identifiable/i.test(r.pWave);
  const isWide  = /wide|≥ 0\.12|>= 0\.12/i.test(r.qrs);

  const prFinding = hasNoP
    ? 'No measurable PR interval — P waves absent'
    : isWide
      ? 'No consistent PR relationship — ventricular origin'
      : 'Assess PR interval on the strip (normal 0.12–0.20 sec)';

  const prWhy = hasNoP
    ? 'Without organized atrial activity there is no P-to-QRS relationship to measure.'
    : isWide
      ? 'The ventricles are activating independently of any supraventricular impulse.'
      : 'A prolonged or changing PR points toward AV block. A short PR suggests an ectopic or junctional origin.';

  return {
    rate: {
      finding: r.rate,
      whyItMatters: 'Compare to the patient\'s baseline. A rate outside the expected range — or a new change — is the first prompt to look more closely at the strip.',
    },
    regularity: {
      finding: r.regularity,
      whyItMatters: 'Regularity tells you whether the pacemaker is firing consistently. Irregularity always warrants further inspection of P waves and RR intervals.',
    },
    pWaves: {
      finding: r.pWave,
      whyItMatters: 'P wave presence, shape, and relationship to the QRS reveal where the rhythm is originating. Absent or abnormal P waves are the first sign of non-sinus activity.',
    },
    prRelationship: { finding: prFinding, whyItMatters: prWhy },
    qrsWidth: {
      finding: r.qrs,
      whyItMatters: isWide
        ? 'Wide QRS indicates ventricular origin or aberrant conduction — either finding warrants closer evaluation and provider awareness.'
        : 'Narrow QRS confirms the ventricles are activating through the normal His-Purkinje system — the problem, if any, is upstream.',
    },
    firstClue: r.recognitionCues[0] ?? 'Compare this strip carefully to the patient\'s baseline.',
  };
}

const ROWS: Array<{ key: keyof Omit<BreakdownData, 'firstClue'>; label: string }> = [
  { key: 'rate',           label: 'Rate' },
  { key: 'regularity',    label: 'Regularity' },
  { key: 'pWaves',        label: 'P Waves' },
  { key: 'prRelationship', label: 'PR / P–QRS' },
  { key: 'qrsWidth',      label: 'QRS Width' },
];

export function RecognitionBreakdown({ rhythm }: { rhythm: Rhythm }) {
  const data = rhythm.breakdown ?? buildFallback(rhythm);

  return (
    <div className="warm-panel">
      <p className="warm-panel__heading">Recognition breakdown</p>
      <div className="breakdown-rows">
        {ROWS.map(({ key, label }) => {
          const row = data[key] as BreakdownRow;
          return (
            <div key={key} className="breakdown-row">
              <span className="breakdown-row__label">{label}</span>
              <div className="breakdown-row__content">
                <p className="breakdown-row__finding">{row.finding}</p>
                <p className="breakdown-row__why">{row.whyItMatters}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="breakdown-first-clue">
        <p className="breakdown-first-clue__label">First clue</p>
        <p className="breakdown-first-clue__text">{data.firstClue}</p>
      </div>
    </div>
  );
}
