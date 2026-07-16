// ─── Clinical Edge Blog — shared content components ────────────────────────
// Reused across article bodies so tables, callouts, checklists, and worked
// examples stay visually consistent without re-implementing markup per post.

export function ResponsiveTable({ caption, headers, rows }) {
  return (
    <div className="ce-table-wrap">
      <table className="ce-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                j === 0
                  ? <th key={j} scope="row" style={{ fontWeight: 600, color: "var(--ce-text-dark)", background: "transparent" }}>{cell}</th>
                  : <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Callout({ title, tone = "info", children }) {
  return (
    <div className={"ce-callout" + (tone === "safety" ? " ce-callout--safety" : "")}>
      {title && <div className="ce-callout-eyebrow">{title}</div>}
      {children}
    </div>
  );
}

export function ChecklistBox({ items }) {
  return (
    <ol className="ce-checklist">
      {items.map((item, i) => (
        <li key={i}>
          <span className="ce-checklist-num" aria-hidden="true">{i + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function ExampleCard({ number, label, values, interpretation, situations, assessNext }) {
  return (
    <div className="ce-example-card">
      <h3 className="ce-example-eyebrow">Example {number} · {label}</h3>
      <ResponsiveTable
        headers={["pH", "PaCO₂", "HCO₃⁻", "PaO₂", "SaO₂"]}
        rows={[[values.ph, values.paco2, values.hco3, values.pao2, values.sao2]]}
      />
      <p><strong>Interpretation:</strong> {interpretation}</p>
      <p><strong>Possible clinical situations:</strong></p>
      <ul>
        {situations.map((s) => <li key={s}>{s}</li>)}
      </ul>
      <p><strong>What the nurse may want to assess next:</strong></p>
      <ul>
        {assessNext.map((a) => <li key={a}>{a}</li>)}
      </ul>
    </div>
  );
}

export function FaqList({ items }) {
  return (
    <dl className="ce-faq">
      {items.map(({ q, a }) => (
        <div key={q}>
          <dt>{q}</dt>
          <dd>{a}</dd>
        </div>
      ))}
    </dl>
  );
}
