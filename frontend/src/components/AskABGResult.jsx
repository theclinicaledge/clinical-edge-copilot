export default function AskABGResult({ result }) {
  if (result.status !== 'verified') return <section className="ce-ask-abg" aria-label="ABG clarification">
    <h3>Clarify this sample</h3><p>{result.summary}</p>
    <ul>{result.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
  </section>;
  return <section className="ce-ask-abg" aria-label="Rule-based ABG interpretation">
    <h3>ABG interpretation</h3><p>{result.summary}</p>
    <dl className="ce-ask-abg-reported"><div><dt>Reported pH</dt><dd>{result.reported.values.pH}</dd></div>
      <div><dt>Reported PaCO2</dt><dd>{result.reported.values.paCO2} {result.reported.units.paCO2}</dd></div>
      <div><dt>Reported HCO3</dt><dd>{result.reported.values.hco3} {result.reported.units.hco3}</dd></div></dl>
    {result.calculated.map((item, i) => <section className="ce-ask-abg-comparison" key={i}>
      <h4>{item.label}</h4><p><strong>{item.expectedRange[0]}–{item.expectedRange[1]} {item.unit}</strong></p>
      <p>Reported {item.measured} {item.unit}: {item.comparison === 'outside_linear_model' ? 'outside the supported linear comparison' : `${item.comparison} the approximate expected interval`}.</p>
      <p className="ce-ask-abg-formula">Calculated: {item.formula}</p>
      {item.compensationCeiling && <p>Source-described compensation ceiling: approximately {item.compensationCeiling} {item.unit}, not a target.</p>}
    </section>)}
    {result.interpretive.additionalPatterns.map((point, i) => <p key={i}>{point}</p>)}
    <details className="ce-ask-abg-limits"><summary>What changes the interpretation</summary>
      <ul>{result.limitations.map((point, i) => <li key={i}>{point}</li>)}</ul></details>
  </section>;
}
