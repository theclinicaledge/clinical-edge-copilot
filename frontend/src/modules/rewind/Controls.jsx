import { useId } from 'react';
import { CALLS, INFORMATION } from '../med-surg-track/content.js';
export function Steps({ current, labels }) {
  return <ol className="mst-steps" aria-label="Your progress">{labels.map((label, i) => <li key={label} aria-current={i === current ? 'step' : undefined} className={i < current ? 'is-done' : ''}><span aria-hidden="true">{i < current ? '✓' : i + 1}</span>{label}</li>)}</ol>;
}
export function CallControl({ call, setCall, information, setInformation, legend = 'Your next step', options = CALLS, informationRequired = true, hideLegend = false }) {
  const group = useId();
  return <fieldset className="mst-call-control"><legend className={hideLegend ? 'mst-sr-only' : undefined}>{legend}</legend>{options.map((item, index) => <label key={item.id} className={call === item.id ? 'is-selected' : ''}><input type="radio" name={group} value={item.id} checked={call === item.id} onChange={() => setCall(item.id)} /><span className="mst-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</span></label>)}{informationRequired && call === 'information' && <label className="mst-information"><strong>Which information?</strong><select value={information || ''} onChange={event => setInformation(event.target.value)}><option value="">Choose an assessment</option>{INFORMATION.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>}</fieldset>;
}
