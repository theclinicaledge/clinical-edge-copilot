// Blank printed marks only. These helpers never render editable controls.
export function Field({ label }) {
  return <span className="bs-field"><span className="bs-field-label">{label}</span><span className="bs-blank-line" /></span>;
}

export function Ruled({ label, lines = 2, prompt }) {
  return <div className="bs-ruled">{label && <div className="bs-eyebrow">{label}</div>}{prompt && <div className="bs-paper-prompt">{prompt}</div>}{Array.from({ length: lines }, (_, index) => <span className="bs-blank-line" key={index} />)}</div>;
}

export function Checks({ labels }) {
  return <div className="bs-paper-checks">{labels.map(label => <span className="bs-field" key={label}><span className="bs-checkbox" /><span className="bs-field-label">{label}</span></span>)}</div>;
}

export function PaperIdentity({ number, compact = false }) {
  return <div className={`bs-paper-identity${compact ? ' bs-paper-identity--compact' : ''}`}>
    {number && <strong className="bs-paper-number">{number}</strong>}
    <div className="bs-paper-label"><span className="bs-field-label">PT LABEL{compact ? '' : ' / STICKER'}</span>{compact && <span className="bs-blank-line" />}</div>
    <Field label="Room / Bed" />
    <Field label="Code Status" />
    <Field label="Allergies" />
  </div>;
}
