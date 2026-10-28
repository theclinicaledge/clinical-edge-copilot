import { dispatchAcknowledgement, looseEnds } from './data.js';
import { discoveredInformation, reviewPresentation, shiftUpdate, roomPresentation } from './gameplay.js';

export function ShiftReceipt({ state }) {
  const update = shiftUpdate(state);
  if (!update) return null;
  return <div className="s5-receipt" role="status" aria-live="polite" aria-atomic="true"><div key={update.label}><span className="s5-receipt-mark" aria-hidden="true">↳</span><div><strong>{update.label}</strong><p>{update.text}</p></div></div></div>;
}

export function ShiftNotes({ state }) {
  const items = discoveredInformation(state);
  if (!items.length) return null;
  return <details className="s5-notes"><summary>Your shift notes <span>{items.length} received</span></summary><p className="s5-small">Findings stay available. Opening a finding does not mean you communicated it.</p><ol>{items.map(item => <li key={item.id}><span className="s5-note-source">{item.room} / {item.source}</span><p>{item.text}</p><small>{item.status}</small></li>)}</ol></details>;
}

export function DispatchAcknowledgement({ state, room }) {
  if (!state.d2 || state.d2.bridges.length) return null;
  const who = state.d2.submitted.assignments[room];
  const quote = dispatchAcknowledgement[room]?.[who];
  const jordan = room === '410' && who === 'jordan' && state.d2.submitted.jordanDirection === 'A';
  if (!quote && !jordan) return null;
  return <blockquote className="s5-ack"><span className="s5-ack-avatar" aria-hidden="true">{jordan ? 'J' : 'P'}</span><div><cite>{jordan ? 'Jordan' : 'Priya'} / assignment acknowledged</cite><p>“{quote || "410, with her walker. I'll stay with her and report back."}”</p></div></blockquote>;
}

export function AfterShiftReview({ state }) {
  const review = reviewPresentation(state);
  if (!review) return null;
  const report = state.d4.report;
  return <section className="s5-aftershift" aria-labelledby="s5-aftershift-title"><div className="s5-review-heading"><span className="s5-eyebrow">YOUR DECISIONS / THEIR CONSEQUENCES</span><h2 id="s5-aftershift-title">Your morning, in three moments</h2><p>No score. Your choices stay separate from corrections and team actions.</p></div>
    <ol className="s5-review-moments"><li><span className="s5-moment-number" aria-hidden="true">01</span><div><h3>You planned a round. Then the calls changed it.</h3><p className="s5-review-route">{review.order}</p><p><strong>Your reason:</strong> {review.reason}. This first plan was exploratory, not scored.</p><div className="s5-review-assignments">{review.dispatch.map(item => <span key={item.room}><strong>{item.room}</strong> → {item.owner}</span>)}</div><p>{state.d2.bridges.length ? 'Those were your submitted assignments. The story continued with a separate safer dispatch.' : `Your dispatch sent ${review.dispatch.find(item => item.room === '412').owner} to 412 while the other calls were assigned or given a message.`}</p>{state.d2.bridges.map((bridge, i) => <p className="s5-bridge" key={i}>{bridge.text}</p>)}</div></li>
    <li><span className="s5-moment-number" aria-hidden="true">02</span><div><h3>Your response to the change in 414.</h3><details><summary>Your original coverage message</summary><p>{review.coverage.text}</p></details><p>{review.coverage.feedback}</p>{state.d3.bridges.map((bridge, i) => <p className="s5-bridge" key={i}>{bridge.text}</p>)}<p className="s5-team-consequence"><strong>{state.d3.bridges.length ? 'Safer story continuation' : 'Team response'}:</strong> {review.coverageStory.ack}</p>{state.d3.submitted.v5Step && <p>Room 410 handoff choice remains in your full shift report below.</p>}</div></li>
    <li><span className="s5-moment-number" aria-hidden="true">03</span><div><h3>You chose what the responder heard.</h3><blockquote className="s5-original-report"><cite>Your original report</cite><p>{report.line}</p></blockquote><p><strong>Opened at the bedside:</strong> {state.d4.revealed.length ? state.d4.revealed.map(id => ({ skin: 'skin', dressing: 'dressing', vitals: 'current vitals', trend: 'full trend' })[id]).join(', ') : 'No optional findings'}.</p><p>{report.missed.length ? `Available but omitted: ${report.missed.map(id => id === 'trend' ? 'vital-sign change' : 'spreading drainage').join(', ')}.` : 'You included the required findings available for this report.'}</p>{report.saferLine && <details className="s5-review-correction"><summary>Separate safer-path report</summary><p>{report.saferLine}</p></details>}<p>{state.d4.checkback.submitted === 'repeat' ? 'You repeated the plan; the responder confirmed it.' : 'Your original reply was “Okay, thanks.” The story used a separate repeat-back correction.'}</p></div></li></ol>
    <div className="s5-review-loops"><h3>Your follow-up choices and corrections</h3><ul>{review.loops.map(loop => <li key={loop.id}><strong>{looseEnds.find(card => card.id === loop.id).title}</strong><span>{loop.corrected ? 'Safer-path correction' : 'Your follow-up'}</span></li>)}</ul><p>{state.coverageAcknowledged ? 'Dee explicitly accepted coverage through 0830. That acceptance is a team action.' : 'No coverage extension was accepted.'}</p></div>
    <p className="s5-small">{review.corrections.length ? 'Corrections were used in this story. Your original decisions remain in the full report.' : 'No safer-path corrections were used.'} Completion is not proof of clinical competence.</p>
  </section>;
}

export function ResponsibilityStrip({ state }) {
  if (state.stage < 2 || state.stage >= 7) return null;
  return <aside className="s5-responsibility-strip" aria-label="Current responsibility summary">{['410','412','414','416'].map(room => { const view = roomPresentation(state, room); return <div key={room}><strong>{room}</strong><span>{view.owner}</span></div>; })}</aside>;
}
