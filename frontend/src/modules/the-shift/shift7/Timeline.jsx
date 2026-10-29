import { categories } from './data.js';
import { discovered, transcript } from './rules.js';

// Keep stored values stable so an existing attempt retains its original choices.
const labels = {
  [categories[0]]: 'Usual function reported',
  [categories[1]]: 'Symptoms noticed or found',
  [categories[2]]: 'Activity recorded by a device',
  [categories[3]]: 'Unresolved timing (previous choice)',
};
export default function Timeline({ p, update, review = false, onReturn = null, returnName = null }) {
  const cards = discovered(p);
  return <section className="s7-timeline" aria-label={review ? 'Evidence and original classifications' : 'Your evidence timeline'}>
    <header><div><span className="s7-eyebrow">The evidence</span><h2>Your timeline</h2></div><span>{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span></header>
    {!review && onReturn && <button type="button" className="s7-evidence-return" onClick={onReturn}>Return to conversation with {returnName}</button>}
    {!review && <div className="s7-timeline-guide">
      <p><strong>What does each account tell you?</strong> Choose the kind of information, then what it cannot tell you. Your answers are reviewed after handoff.</p>
      <details><summary>What do the three choices mean?</summary><dl>
        <dt>Usual function reported</dt><dd>Someone describes how the patient was speaking, moving or feeling. This can be the patient’s own account.</dd>
        <dt>Symptoms noticed or found</dt><dd>The patient noticed a problem, or someone else found symptoms. This does not necessarily tell you when they began.</dd>
        <dt>Activity recorded by a device</dt><dd>A device logged an event. Decide what that event tells you about the person, if anything.</dd>
      </dl></details>
    </div>}
    {!cards.length && <div className="s7-empty"><span aria-hidden="true">⌁</span><h3>The story starts with a question.</h3><p>Talk with EMS, Linda or Walter. Their answers become evidence cards here, with the source attached.</p></div>}
    <ol>{cards.map((card, i) => {
      const complete = p.classifications[card.id] && p.limits[card.id];
      const correct = p.classifications[card.id] === card.category && p.limits[card.id] === card.limit;
      return <li key={card.id} className="s7-evidence" id={!review ? `s7-evidence-${card.id}` : undefined} data-s7-evidence={!review ? card.id : undefined} tabIndex={!review ? -1 : undefined} aria-label={!review ? `${card.time} · ${card.source}` : undefined}><div className="s7-time"><time>{card.time}</time><small>{card.when}</small></div><div className="s7-evidence-body">
        <span className="s7-source">{card.source}</span><p>“{transcript(p, card)}”</p>
        {review ? <div className="s7-evidence-review">
          <p><strong>Your choice:</strong> {labels[p.classifications[card.id]] || 'Not answered'}</p>
          <p><strong>Your limit:</strong> {p.limits[card.id] || 'Not answered'}</p>
          <p><strong>{!complete ? 'Not completed' : correct ? 'Supported' : 'Review this card'}:</strong> {card.note}</p>
          <p><strong>Supported answer:</strong> {labels[card.category]}.</p><p><strong>It cannot tell you:</strong> {card.limit}.</p>
        </div> : <div className="s7-card-fields">
          <label>1. What kind of information is this?<select aria-label={`${card.time} ${card.id} classification`} value={p.classifications[card.id] || ''} onChange={e => update({ classifications: { ...p.classifications, [card.id]: e.target.value } })}>
            <option value="">Choose what this tells you</option>{categories.slice(0, 3).map(c => <option key={c} value={c}>{labels[c]}</option>)}
            {p.classifications[card.id] === categories[3] && <option value={categories[3]}>{labels[categories[3]]}</option>}
          </select>{p.classifications[card.id] && <span className="s7-selected-text" aria-hidden="true">Selected: {labels[p.classifications[card.id]]}</span>}</label>
          <label>2. What can’t this account tell you?<select aria-label={`${card.time} ${card.id} limit`} value={p.limits[card.id] || ''} onChange={e => update({ limits: { ...p.limits, [card.id]: e.target.value } })}>
            <option value="">Choose what remains unknown</option>{(i % 2 ? [card.limit, ...card.alternatives] : [...card.alternatives, card.limit]).map(c => <option key={c}>{c}</option>)}
          </select>{p.limits[card.id] && <span className="s7-selected-text" aria-hidden="true">Selected: {p.limits[card.id]}</span>}</label>
        </div>}
      </div></li>;
    })}</ol>
    <div className="s7-unknown"><span aria-hidden="true">?</span><div><strong>Exact symptom onset</strong><p>{review && p.asked.includes('arm') ? 'Walter estimates noticing symptoms around 0630. Report that estimate; it does not establish an exact onset.' : 'Keep this separate from when symptoms were noticed or found. An uncertain onset does not mean the history has no value.'}</p></div></div>
  </section>;
}
