import { useState } from 'react';
import './deliberate-choice.css';

export default function DeliberateChoice({ items, answer, onConfirm, label, communication = false }) {
  const [draft, setDraft] = useState(null);
  const selected = answer ?? draft;
  const choice = items.find(item => item.id === selected);
  const locked = answer !== undefined;
  return <section className="shift-deliberate" aria-label={label}>
    <fieldset disabled={locked}>
      <legend>{communication ? 'Compare the messages. Choose the strongest SBAR.' : 'Choose your next action.'}</legend>
      {items.map((item, index) => <label key={item.id} className={`shift-deliberate-option ${selected === item.id ? 'is-selected' : ''}`}>
        <input type="radio" name={label} checked={selected === item.id} onChange={() => setDraft(item.id)} />
        <span><strong>{communication ? `SBAR ${item.id.toUpperCase()}` : `Option ${index + 1}`}</strong>
          {item.parts ? item.parts.map(([letter, text]) => <span className="shift-deliberate-part" key={letter}><b>{letter}</b><span>{text}</span></span>) : <span>{item.text}</span>}
        </span>
      </label>)}
    </fieldset>
    <div className="shift-deliberate-confirm">
      <p role="status">{locked ? 'Your original choice is saved.' : choice ? `${communication ? 'SBAR' : 'Option'} ${communication ? choice.id.toUpperCase() : items.indexOf(choice) + 1} selected. Confirm when ready.` : 'No choice selected.'}</p>
      {!locked && <button className="shift-primary" disabled={!choice} onClick={() => onConfirm(choice.id)}>{communication ? 'Confirm my SBAR' : 'Confirm my action'} <span aria-hidden="true">&#8594;</span></button>}
    </div>
  </section>;
}
