import { bedsideRecord } from './bedsideRecord.js';
import './bedside-findings.css';

export default function BedsideFindings({ progress }) {
  const findings = bedsideRecord(progress);
  const marked = findings.filter(finding => finding.marked).length;
  return <details className="s1-bedside-record" open>
    <summary><span className="s1-bedside-title">Bedside findings</span>{' '}<span className="s1-bedside-count">{findings.length} revealed · {marked} marked by you</span></summary>
    <p className="s1-bedside-source">Room 12 · Your bedside observations</p>
    {findings.length ? <div className="s1-bedside-scroll" role="region" aria-label="Revealed bedside findings" tabIndex={findings.length > 3 ? 0 : undefined}>
      <ul>{findings.map(finding => <li key={finding.id} data-finding-id={finding.id}>
        <div><strong>{finding.label}</strong>{' '}<span className="s1-bedside-mark">{finding.marked ? 'Marked by you' : 'Not marked by you'}</span></div>
        <p>{finding.text}</p>
      </li>)}</ul>
    </div> : <p className="s1-bedside-empty">No bedside findings were revealed in this attempt.</p>}
  </details>;
}
