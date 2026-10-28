// Read-only presentation of the existing Shift 5 state. No progression or grading.
import { calls, reasons, coverageOptions, looseEnds, jordanDirections, hold416 } from './data.js';
import { CALLS } from './rules.js';

export const personNames = { you: 'You', jordan: 'Jordan', priya: 'Priya', hold: 'Sam · message only' };
export function bedsideFindings(state) {
  const time = state.d3?.submitted?.v5Step === 'ii' ? '0735' : '0733';
  return [
    { id: 'skin', label: 'Skin', finding: 'Cool and clammy.' },
    { id: 'dressing', label: 'Dressing', finding: 'Bright red drainage, now well past the 0600 pen outline.' },
    { id: 'vitals', label: 'Current vitals', finding: `${time}: HR 118, BP 92/58, RR 22, SpO2 95% on room air.` },
    { id: 'trend', label: 'Full trend', finding: `0430/0600/0700/0730/${time}: HR 84/86/88/112/118; systolic BP 132/130/128/98/92.` },
  ];
}
export function roomPresentation(state, room, draftOrder = []) {
  const stage = state.stage;
  const order = state.d1?.order || draftOrder;
  const correctedDispatch = !!state.d2?.bridges.length;
  const submitted = state.d2?.submitted.assignments[room];
  const assignments = correctedDispatch ? { '410': 'jordan', '412': 'you', '416': 'hold' } : state.d2?.submitted.assignments;
  const owner = assignments?.[room];
  const correction = stage >= 2 && correctedDispatch && CALLS.includes(room) ? `Submitted: ${personNames[submitted]}. Board follows the safer continuation.` : '';
  if (stage === 0) return { status: 'Report ready', owner: 'Your assignment', task: 'Open night report', correction: '' };
  if (stage === 1) return { status: order.includes(room) ? `Visit ${order.indexOf(room) + 1}` : 'On assignment', owner: state.d1 ? 'Your saved plan' : 'Your draft', task: order.includes(room) ? (state.d1 ? 'Planned stop' : 'Tap again to remove') : 'Tap to add to round', correction: '', position: order.indexOf(room) + 1 };
  if (stage === 2 && !state.d2) return { status: CALLS.includes(room) ? 'Call light' : 'Quiet', owner: !CALLS.includes(room) ? 'Your assignment' : state.d2Draft.assignments[room] ? `Draft · ${personNames[state.d2Draft.assignments[room]]}` : 'Not assigned', task: CALLS.includes(room) ? 'Not sent' : 'No call light', correction: '' };
  if (room === '414') return { status: stage >= 6 ? 'Team at bedside' : stage >= 4 ? 'Change reported' : 'Quiet', owner: stage >= 5 || stage === 4 && state.d3 ? 'You · RN' : 'Your assignment', task: stage >= 6 ? 'Reassessment + reporting remain yours' : stage >= 4 ? 'RN response' : 'Night report available', correction: state.d3?.bridges.length ? 'Coverage follows the safer continuation.' : '' };
  if (stage <= 3) return { status: owner === 'hold' ? 'Message sent' : 'Assigned', owner: personNames[owner] || 'Your assignment', task: room === '412' ? stage === 3 ? owner === 'priya' ? 'Handback at 0730; recheck due 0742' : 'Recheck due 0742' : 'Respond to symptoms' : room === '410' ? 'Bathroom assistance' : owner === 'hold' ? 'Teaching still pending' : 'RN teaching', correction };
  if (stage === 4 && !state.d3) return { status: 'Coverage needed', owner: 'Not yet accepted', task: room === '412' ? 'Recheck due 0742' : 'Named RN needed', correction: '' };
  if (stage >= 6) return { status: state.coverageAcknowledged ? 'Dee to 0830' : 'Coverage expired', owner: state.coverageAcknowledged ? 'Dee · RN' : 'Extension not accepted', task: room === '412' ? 'Glucose follow-up' : room === '416' ? 'Teaching follow-up' : 'Room coverage', correction: state.d5.coverage?.bridges.length ? 'Extension follows a safer-path correction.' : '' };
  const option = state.d3?.storyOption;
  return { status: 'Coverage to 0800', owner: room === '412' && option === 'B' ? 'Priya → Dee · RN' : 'Dee · RN', task: room === '412' ? option === 'B' ? 'Priya to 0745; named handback to Dee' : option === 'C' ? 'Jordan: value; Dee: RN reassessment' : 'Recheck + RN reassessment' : 'Accepted room coverage', correction: state.d3?.bridges.length ? 'Submitted plan corrected; safer continuation shown.' : '' };
}

export function shiftUpdate(state) {
  if (state.stage === 7) return { label: 'After your shift', text: 'Your original choices and the story continuation are kept separate below.' };
  if (state.coverageAcknowledged) return { label: 'Dee accepted coverage', text: '410, 412 and 416 through 0830. You remain with 414.' };
  if (state.stage === 6) return { label: 'The coverage window ended', text: 'An extension is not accepted until you hear Dee’s reply.' };
  if (state.d4.checkback) return { label: state.d4.checkback.bridges.length ? 'Check-back corrected' : 'Plan confirmed', text: state.d4.checkback.bridges.length ? 'Your original reply is retained; the story uses the separate repeat-back.' : 'You repeated the responder’s plan and heard it confirmed.' };
  if (state.d4.report) return { label: 'Your report was sent', text: state.d4.report.missed.length ? 'Some available findings were omitted. Your report and the safer report remain separate.' : 'Your selected observations are in the report.' };
  if (state.d4.help) return { label: state.d4.help.bridges.length ? 'Help call corrected' : 'Help requested', text: 'Keep assessing while help comes. Opened findings remain in your shift notes.' };
  if (state.stage === 5) return { label: 'You are at Room 414', text: 'Your coverage plan stays visible while you assess and call.' };
  if (state.stage === 4 && state.d3) return { label: state.d3.bridges.length ? 'Safer coverage continuation' : 'Coverage accepted', text: state.d3.bridges.length ? 'Your submitted plan is preserved. The board labels the separate story continuation.' : 'The named staff acknowledgment is below. Coverage ends at 0800.' };
  if (state.stage === 4) return { label: 'Priorities changed', text: 'Jordan reported the change in 414. The other rooms still need named coverage.' };
  if (state.stage === 3) return { label: 'Parallel work', text: ['V3', 'V5'].includes(state.d2.storyPlan) ? 'Priya’s report returns 412 to you at 0730.' : 'You are with 412; the recheck stays due at 0742.' };
  if (state.d2) return { label: state.d2.bridges.length ? 'Assignments need a safer continuation' : 'Assignments sent', text: state.d2.bridges.length ? 'The board distinguishes what you submitted from the safer story.' : 'The room tiles now show who is responding. A message from Sam is not nursing coverage.' };
  if (state.stage === 2) return { label: 'Three calls, one plan', text: 'Selections appear on the board as drafts. Nothing is sent until you send assignments.' };
  if (state.d1) return { label: 'Your round is set', text: state.d1.order.join(' → ') + '. The next calls may change that plan.' };
  return null;
}

export function discoveredInformation(state) {
  const items = [];
  const owner412 = ['V3', 'V5'].includes(state.d2?.storyPlan) ? 'Priya · 0728 report' : 'You · bedside';
  if (state.stage >= 3 && state.d2 && !['V3', 'V5'].includes(state.d2.storyPlan)) {
    const findings = { bedside: 'Hands trembling. Alert, answers clearly, able to swallow. “I just feel off.”', meter: '0724 glucose: 62 mg/dL.', whiteboard: 'Breakfast tray around 0745.' };
    for (const id of state.room412Seen) items.push({ id: '412-' + id, room: '412', source: owner412, text: findings[id], status: 'Discovered' });
  }
  if (state.stage >= 3) items.push({ id: '412-handback', room: '412', source: owner412.startsWith('Priya') ? owner412 : 'Story · 0729 handoff', text: 'Glucose 62 mg/dL; alert and able to swallow. Protocol started at 0727; recheck due 0742. Symptoms easing, still a little shaky. Alert.', status: 'Story handoff' });
  if (state.stage >= 4) items.push({ id: '414-jordan', room: '414', source: 'Jordan · 0730 report', text: 'HR 112, BP 98/60, RR 20; lightheaded. At 0700: HR 88, BP 128/74.', status: 'Received report' });
  for (const f of bedsideFindings(state).filter(f => state.d4.revealed.includes(f.id))) items.push({ ...f, room: '414', source: 'You · bedside', text: f.finding, status: !state.d4.report ? 'Discovered; report not sent' : f.id === 'dressing' ? state.d4.report.submitted.includes('dressing') ? 'Included in your report' : 'Not included in your report' : f.id === 'skin' ? state.d4.report.submitted.includes('symptoms') ? 'Included in your report' : 'Not included in your report' : f.id === 'vitals' ? state.d4.report.submitted.includes('trend') ? 'Included in your report' : 'Not included in your report' : state.d4.report.submitted.includes('trend') ? 'Vital-sign change reported; full trend not quoted' : 'Not included in your report' });
  return items;
}
export function reviewPresentation(state) {
  if (state.stage !== 7) return null;
  return {
    order: state.d1.order.join(' → '), reason: reasons.find(r => r.id === state.d1.reason)?.label,
    dispatch: CALLS.map(room => ({ room, owner: personNames[state.d2.submitted.assignments[room]], detail: room === '410' && state.d2.submitted.assignments[room] === 'jordan' ? jordanDirections[state.d2.submitted.jordanDirection] : room === '416' && state.d2.submitted.assignments[room] === 'hold' ? hold416[state.d2.submitted.hold416] : calls[room] })),
    coverage: coverageOptions.find(o => o.id === state.d3.submitted.option),
    coverageStory: coverageOptions.find(o => o.id === state.d3.storyOption),
    corrections: [...state.d2.bridges, ...state.d3.bridges, ...state.d4.help.bridges, ...state.d4.report.bridges, ...state.d4.checkback.bridges, ...Object.values(state.d5).flatMap(result => result.bridges)],
    loops: looseEnds.map(card => ({ id: card.id, title: card.title, corrected: !!state.d5[card.id]?.bridges.length })),
  };
}
