import { VERSION, TILES, CHOICES, SUMMARY, HANDOFF, REPLAY, REWIND } from './data.js';

export const KEYS = { main: 'ce-private-shift8-main-v0.8.1', replay: 'ce-private-shift8-priya-v0.8.1', rewind: 'ce-private-shift8-rewind-v0.6' };
export const LEGACY_KEYS = { main: 'ce-private-shift8-main-v0.7', replay: 'ce-private-shift8-priya-v0.7' };
export const codeTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
export const clockTime = seconds => `${String(14 + Math.floor((12 * 60 + seconds) / 3600)).padStart(2, '0')}:${String(12 + Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
export const accepted = label => label.startsWith('Accepted');
export function validSequence(sequence) {
  return Array.isArray(sequence) && sequence.length <= 4 && new Set(sequence).size === sequence.length && sequence.every(id => TILES.some(t => t.id === id)) && !(sequence.includes('check') && sequence.includes('feel')) && !(sequence.includes('compress') && sequence.includes('wait'));
}

// Compute every opening event from tile durations, preserving order and authorship.
export function opening(sequence, endChoice = null) {
  if (!validSequence(sequence) || ![null, 'compress', 'wait'].includes(endChoice)) throw new Error('Invalid opening');
  const events = [], reasons = [];
  let time = 2, checked = false, cpr = null, activation = null, shout = false;
  const waiting = sequence.includes('wait') || endChoice === 'wait';
  const emit = (text, actor = 'You', prompted = false, at = time) => events.push({ time: at, text, actor, prompted });
  const flag = (label, text) => reasons.push({ label, text });
  const check = prompted => { time += 10; checked = true; emit('Breathing and pulse checked together. No definite pulse.', 'You', prompted); };
  for (const tile of sequence) {
    if (tile === 'shout') { time += 1; shout = true; emit(cpr === null ? 'Shout for help.' : 'Shout while compressing; no pause.'); }
    if (tile === 'press') {
      if (cpr !== null) { emit('Compressions paused to press Code Blue.'); flag('Revisit', 'Compressions paused while you pressed the button. Calling first avoids the pause.'); }
      time += 2; activation = time; emit('Code Blue activated.');
      if (cpr !== null) emit('Compressions resume.');
    }
    if (['check', 'feel'].includes(tile)) {
      if (checked) emit('Already done (prompted).'); else check(false);
      if (tile === 'feel') { emit("It's been 10 seconds. You still can't feel a definite pulse."); flag('Revisit', "Gasping isn't effective breathing, and the pulse check takes no more than 10 seconds."); }
    }
    if (tile === 'compress') {
      if (!checked) { emit('Check breathing and pulse first.', 'You', true); check(true); flag('Revisit', 'The breathing and pulse check was prompted before compressions.'); }
      cpr = time; emit('Bed flattened. Compressions start.');
    }
    if (tile === 'wait') emit('Waiting for the cart. No compressions yet.');
  }
  const needsEndChoice = !sequence.includes('compress') && !sequence.includes('wait') && !endChoice;
  if (!sequence.includes('compress') && !sequence.includes('wait')) {
    if (!checked) { emit('Check breathing and pulse first.', 'You', true); check(true); flag('Revisit', 'The breathing and pulse check was prompted.'); }
    emit('No definite pulse. What now?', 'You', true);
    if (endChoice === 'compress') { cpr = time; emit('Compressions start.', 'You', true); flag('Revisit', 'With no definite pulse, compressions start right away. The start was prompted.'); }
  }
  if (waiting) {
    flag('Unsafe', 'Compressions start without waiting for equipment.');
    if (!checked) { emit('Priya checks breathing and pulse from 00:30 to 00:40. No definite pulse.', 'Priya', false, 40); flag('Revisit', 'Priya performed the breathing and pulse check, not you.'); }
    cpr = checked ? 30 : 40;
    emit('Priya starts compressions.', 'Priya', false, cpr);
  }
  const path = activation !== null ? 'A' : shout ? 'B' : 'C';
  if (path === 'B') flag('Revisit', "People nearby heard you, but the code team didn't.");
  if (path === 'C') flag('Unsafe', 'No one knows you need help. Luis asks Priya to check the room.');
  if (activation === null && !needsEndChoice) emit('Code Blue activated.', waiting ? 'You' : 'Priya', waiting, waiting ? 33 : 35);
  const label = reasons.some(r => r.label === 'Unsafe') ? 'Unsafe' : reasons.length ? 'Revisit' : sequence[0] === 'check' || !shout ? 'Accepted alternative' : 'Accepted';
  return { sequence: [...sequence], events: events.sort((a, b) => a.time - b.time), reasons, path, waiting, cpr, cprActor: waiting ? 'Priya' : 'You', activation: activation ?? (waiting ? 33 : 35), label, needsEndChoice };
}
export const fresh = () => ({ version: VERSION, stage: 'report', drafts: {}, answers: {}, opening: null, openingCursor: 0, endChoice: null, staffing: null, feedback: null, corrections: {}, review: false });
export function variables(state) {
  const early = state.opening?.path !== 'B' && state.opening?.path !== 'C';
  return { team: early ? 150 : 180, airway: early ? 160 : 190, request: early ? 180 : 215, acknowledged: early ? 185 : 220, family: early ? 190 : 225, medication: early ? 220 : 230, given: early ? 230 : 240, pageDone: early ? 225 : 260, rescuePage: early ? 280 : 300, rescueDone: early ? 310 : 330, clock: early ? '1415' : '1416' };
}
export const fill = (text, state) => text.replaceAll('{clock}', variables(state).clock);
export const last = (state, key) => state.answers[key]?.at(-1);
export function stageList(state) {
  const late = state.opening?.path && state.opening.path !== 'A';
  return ['report', 'assess', 'opening', 'playback', 'priya', ...(state.staffing === 'S1' ? ['marcus'] : ['away']), 'cart', 'analysis', 'clearance', 'restartCPR', 'mask', 'summary', 'leader', ...(late ? ['time', 'charge', 'safety', 'page'] : ['page', 'time', 'charge', 'safety']), 'medication', 'given', 'rosc', 'transport', 'handoff', 'missing', 'synthesis', 'correction', 'transfer', 'debrief'];
}
export function now(state) {
  // The opening is displayed as one completed sequence, not individual clicks.
  if (state.stage === 'playback') return Math.max(2, ...(state.opening?.events || []).map(event => event.time));
  const v = variables(state);
  const times = { report: 0, assess: 0, opening: 2, playback: state.opening?.events[state.openingCursor]?.time ?? 2, priya: state.opening?.waiting ? Math.max(30, state.opening.cpr, state.opening.activation) : state.opening?.path !== 'A' ? 35 : 30, marcus: 50, away: 50, cart: 70, analysis: state.feedback ? 82 : 80, clearance: state.feedback ? 85 : 84, restartCPR: 85, mask: 85, summary: v.team, leader: v.team, page: state.feedback && ['named', 'beth'].includes(last(state, 'page')?.id) ? v.acknowledged : v.request, time: 195, charge: 205, safety: state.feedback ? 210 : 209, medication: v.medication, given: v.given, rosc: 335, transport: 370, handoff: 420, missing: 420, synthesis: 420, correction: 420, transfer: 420, debrief: 450 };
  return times[state.stage] ?? 0;
}
export function choices(state) {
  if (state.stage === 'priya' && state.opening.waiting) return CHOICES.priyaWait;
  if (state.stage === 'analysis' && state.staffing !== 'S1') return CHOICES.analysisAway;
  return CHOICES[state.stage] || [];
}
export function credit(state, key, item) {
  if (!item) return '';
  const isGood = accepted(item.label);
  if (key === 'assess') return isGood ? 'You' : 'You (prompted)';
  if (key === 'priya' && item.id === 'vague') return 'No acknowledgment';
  if (key === 'priya' && item.id === 'stay') return 'You fetch cart (prompted by Priya)';
  if (key === 'marcus' && !isGood) return 'Awaiting prompted assignment';
  if (key === 'analysis') return isGood ? 'You transitioned; Marcus compresses; Priya operates' : 'You stopped after Priya’s prompt; Marcus compresses';
  if (key === 'clearance') return isGood ? 'You checked and answered clear; Priya shocks' : 'You answered without checking; Priya corrected clearance and shocks';
  if (key === 'safety') return isGood ? 'You warned; Priya held and delivered the shock after clearance' : 'Priya noticed, held and cleared contact before shocking';
  if (key === 'restartCPR') return isGood ? 'You requested; Marcus performed' : 'Priya requested; Marcus performed';
  if (key === 'mask') return item.id === 'hold' ? 'You and Priya' : 'Priya';
  if (key === 'leader') return isGood ? 'You and Dr. Okafor' : 'Dr. Okafor';
  if (key === 'page') return item.id === 'grace' ? 'Family inquiry only' : isGood ? 'You requested; Beth pages' : 'Dr. Okafor requests; Beth pages';
  if (key === 'time') return isGood ? 'You' : 'Dr. Tran';
  if (key === 'medication') return isGood ? 'You clarify; Jordan gives on order' : item.id === 'record' ? 'Jordan clarifies; you correct the record (prompted)' : 'Jordan clarifies';
  return 'You';
}
export function submitChoice(state, id) {
  if (state.feedback) return state;
  const o = choices(state).find(c => c.id === id);
  if (!o) return state;
  const next = structuredClone(state), key = state.stage;
  const attempts = next.answers[key] ?? [];
  const a = { ...o, prompted: attempts.length > 0, actor: credit(state, key, o) };
  attempts.push(a); next.answers[key] = attempts;
  const retry = (key === 'priya' && id === 'vague') || (key === 'marcus' && id === 'family') || (key === 'page' && id === 'grace') || (key === 'mask' && id === 'decline' && attempts.length < 2);
  if (key === 'priya' && id !== 'vague') next.staffing = state.opening.waiting ? 'S3' : id === 'cart' ? 'S1' : 'S2';
  next.feedback = { ...a, retry };
  delete next.drafts[key];
  return next;
}
export function goNext(state) {
  const n = structuredClone(state);
  if (['analysis', 'clearance'].includes(n.stage) && !n.feedback) return n;
  if (n.feedback?.retry) { n.feedback = null; return n; }
  const list = stageList(n);
  n.stage = list[list.indexOf(n.stage) + 1] || 'debrief';
  n.feedback = null;
  if (n.stage === 'missing' && !missingEssentials(n).length) n.stage = 'synthesis';
  if (n.stage === 'correction' && !remainingErrors(n).length) n.stage = 'transfer';
  return n;
}
export function submitSummary(state, ids) {
  if (state.answers.summary || ids.length > 5 || ids.some(id => !SUMMARY.some(c => c.id === id))) return state;
  const n = structuredClone(state);
  n.answers.summary = [...ids];
  n.feedback = { label: ids.includes('unknown') || SUMMARY.some(c => c.required && !ids.includes(c.id)) ? 'Revisit' : 'Accepted', text: 'Your original summary is recorded separately from the team’s additions.' };
  return n;
}
export function missingEssentials(s) { return HANDOFF.filter(h => !s.answers.handoff?.[h.id] || s.answers.handoff[h.id] === 'skip'); }
export function handoffErrors(s) {
  return [
    { id: 'dose', wrong: 'Two doses of epinephrine', owner: 'Jordan', correction: `Jordan gave one dose at ${variables(s).clock}.` },
    { id: 'stable', wrong: 'Stable since 1417', owner: 'Sam', correction: "He's not stable. He still needs breathing support." },
    ...HANDOFF.filter(h => s.answers.handoff?.[h.id] === 'bad').map(h => ({ id: h.id, wrong: h.bad, owner: h.owner, correction: fill(h.correction, s) })),
  ];
}
export function remainingErrors(s) { return handoffErrors(s).filter(e => !s.answers.synthesis?.includes(e.id)); }
export function finalCorrections(s) {
  return handoffErrors(s).map(e => ({ ...e, actor: s.answers.synthesis?.includes(e.id) ? 'You' : s.corrections.synthesis?.includes(e.id) ? 'You (prompted)' : e.owner }));
}
export function synthesisLabel(s) {
  const total = handoffErrors(s).length, count = s.answers.synthesis?.length || 0;
  return count === total ? 'Accepted' : count === 0 ? 'Unsafe' : 'Revisit (partly corrected)';
}
export function board(s) {
  if (s.stage === 'away') return [];
  const t = now(s), v = variables(s);
  const maskHeld = last(s, 'mask')?.id === 'hold', maskDeclined = last(s, 'mask')?.id === 'decline' && s.answers.mask?.length >= 2;
  const transitioning = t >= 80 && t < 85;
  const rows = [{ name: 'You', role: 'Primary RN', task: t < 30 ? 'First responder' : t < 85 ? transitioning ? t < 84 ? 'Compressor transition / Priya operates' : 'Confirming clearance / Priya operates' : (s.staffing === 'S1' || !s.staffing && !s.opening?.waiting ? 'Compressions' : s.staffing ? 'Cart, monitor power and pads' : 'Available / Priya on compressions') : t < v.airway ? maskDeclined ? 'Standing by at cart' : maskHeld ? 'Mask seal' : 'Mask role requested / awaiting response' : 'Recorder' }];
  if (t >= 30) rows.push({ name: 'Priya', role: 'ACLS-credentialed RN', task: t < 70 ? s.staffing === 'S1' ? 'Cart requested / acknowledged' : s.staffing || s.opening?.waiting ? 'Compressions' : 'Arrived / awaiting request' : t < 85 ? t < 80 ? s.staffing === 'S1' ? 'Pads / manual monitor' : 'Compressions until rhythm check' : t < 82 ? 'Manual operator / rhythm assessment' : t < 84 ? 'Manual operator / charging while Marcus compresses' : 'Manual operator / charged, checking clearance' : t < v.airway ? maskDeclined ? 'One-person bag-mask' : maskHeld ? 'Bag' : 'Requests mask support' : t < 370 ? 'Defibrillator / monitor' : '12-lead completed' });
  if (t >= 50) rows.push({ name: 'Marcus', role: 'PCA', task: t < 85 ? t >= 84 ? 'Clear for shock' : t >= 82 ? 'Compressions during charging' : t >= 80 ? 'Moving into compressor position / rhythm-check pause' : s.staffing === 'S1' && last(s, 'marcus')?.id !== 'board' ? 'Arrived with backboard / awaiting assignment' : 'Backboard / ready to relieve' : t < 205 ? 'Compressions' : 'Relieved' });
  if (t >= v.team) {
    rows.push({ name: 'Dr. Okafor', role: 'ICU physician', task: t >= 370 ? 'Leader / callback owner / transport' : 'Code team leader' }, { name: 'Jordan', role: 'ICU RN', task: t < v.airway ? 'Arriving' : t < v.given ? 'IV checked / medication on order' : `Medication given ${codeTime(v.given)}` }, { name: 'Sam + Dev', role: 'RT + trained PCA', task: t < v.airway ? 'Airway handover pending' : t < 335 ? 'Bag-mask 30 to 2' : 'Rescue breaths / transport' }, { name: 'Dr. Tran', role: 'Resident', task: t < 205 ? 'Next compressor' : t < 209 ? 'Compressions during charging' : t < 210 ? 'Clear for shock' : t < 335 ? 'Compressions' : 'Compressions stopped' }, { name: 'Beth', role: 'Charge RN', task: t < v.request ? 'Room flow / other patients' : t < v.family ? 'Family call acknowledged' : t < 360 ? 'Family call completed' : 'With Grace in family room' });
    if (t >= v.request) {
      const assigned = ['named', 'beth'].includes(last(s, 'page')?.id);
      const done = assigned ? v.pageDone : v.rescueDone;
      rows.push({ name: 'Cardiology page', role: 'Task', task: t >= done ? 'Completed by Beth / callback pending' : assigned && t >= v.acknowledged ? 'Beth acknowledged / pending completion' : !assigned && t >= v.rescuePage ? 'Dr. Okafor assigned Beth / acknowledged' : 'Requested, no one acknowledged' });
    }
  }
  if (t >= 420) rows.push({ name: 'Rosa', role: 'ICU RN', task: s.stage === 'transfer' || s.stage === 'debrief' ? 'Handoff accepted: I have him' : 'Receiving handoff' });
  return rows;
}
export function record(s) {
  const v = variables(s), t = s.stage === 'away' ? 40 : now(s), assigned = ['named', 'beth'].includes(last(s, 'page')?.id);
  return [
    ...(s.opening?.events || []),
    { time: 50, text: 'Marcus assigned backboard and next compressions.', actor: s.staffing === 'S1' ? s.answers.marcus?.[0]?.id === 'board' ? 'You' : 'You (prompted)' : 'Priya' },
    { time: 70, text: 'Cart arrives; monitor powered on and pads applied.', actor: s.staffing === 'S1' ? 'Priya' : 'You' },
    { time: 80, text: 'Scripted rhythm assessment: Shockable rhythm. Brief rhythm-check pause.', actor: 'Priya' },
    ...['analysis', 'clearance', 'safety'].flatMap(key => (s.answers[key] || []).flatMap((answer, index) => [
      { time: key === 'analysis' ? 80 : key === 'clearance' ? 84 : 209, text: `${index ? 'Prompted response' : 'Original response'}: ${answer.text} [${answer.label}]. Action credit: ${answer.actor}.`, actor: 'You', prompted: answer.prompted },
      ...(!accepted(answer.label) ? [{ time: key === 'analysis' ? 82 : key === 'clearance' ? 85 : 210, text: answer.feedback, actor: 'Priya / guided correction' }] : []),
    ])),
    { time: 82, text: 'Charging. Marcus continues compressions.', actor: 'Priya / Marcus' },
    { time: 84, text: 'Charged. Everyone clear.', actor: 'Priya' },
    { time: 85, text: 'Shock 1; Marcus restarts compressions.', actor: 'Priya (shock) / Marcus (compressions)' },
    { time: v.team, text: 'Code team arrives; Dr. Okafor takes leadership.', actor: 'Dr. Okafor' },
    { time: v.airway, text: 'Sam and Dev take bag-mask; you assigned recorder. Jordan: IV flushes.', actor: 'Team' },
    { time: 205, text: 'Rhythm check; Dr. Tran replaces Marcus. Dr. Okafor: Still shockable. Priya, charge. Dr. Tran compresses during charging.', actor: 'Team' },
    { time: 209, text: 'Everyone clear. Marcus still has a hand on Harold’s arm.', actor: 'Dr. Okafor / bedside observation' },
    { time: 210, text: 'Shock 2 after contact cleared; Dr. Tran restarts compressions.', actor: 'Priya, on order / Dr. Tran' },
    { time: v.request, text: 'Family call acknowledged: "I am calling her now." Cardiology page initially unowned.', actor: 'Beth / Dr. Okafor' },
    { time: assigned ? v.acknowledged : v.rescuePage, text: assigned ? 'Cardiology page acknowledged: "Paging cardiology now."' : 'Dr. Okafor notices the unowned page and asks Beth; Beth accepts.', actor: assigned ? 'Beth, following your request' : 'Dr. Okafor / Beth' },
    { time: v.family, text: 'Reached Grace; she is coming upstairs.', actor: 'Beth' },
    { time: assigned ? v.pageDone : v.rescueDone, text: 'Cardiology paged; callback pending.', actor: 'Beth' },
    { time: v.given, text: `One dose of epinephrine given after full order, read-back and IV check; acknowledged.${s.answers.recordedEvent ? ' You recorded the completed event.' : ''}`, actor: 'Jordan' },
    { time: 330, text: 'Organized rhythm. Dr. Okafor checks for a pulse.', actor: 'Dr. Okafor' },
    { time: 335, text: 'Pulse returns. Compressions stop. No response to voice; rescue breaths, one every 6 seconds.', actor: 'Dr. Okafor / Sam' },
    { time: 345, text: 'HR 112; BP 96/60; SpO2 94%. 12-lead requested. Fictional educational values.', actor: 'Dr. Okafor' },
    { time: 360, text: 'Grace is with Beth in family room.', actor: 'Beth' },
    { time: 370, text: '12-lead done; callback to Dr. Okafor; Sam and Dev accept transport airway.', actor: 'Team' },
  ].filter(e => e.time <= t && !(e.time === 50 && s.staffing === 'S1' && last(s, 'marcus')?.id !== 'board')).sort((a, b) => a.time - b.time);
}
export function validState(s) {
  if (!s || s.version !== VERSION || !s.answers || !s.drafts || !s.corrections || typeof s.answers !== 'object' || typeof s.drafts !== 'object' || typeof s.corrections !== 'object' || !stageList(s).includes(s.stage)) return false;
  if (!['report', 'assess', 'opening'].includes(s.stage) && !s.opening) return false;
  if (!Number.isInteger(s.openingCursor) || s.openingCursor < 0 || s.opening && s.openingCursor >= s.opening.events?.length) return false;
  if (s.opening && (!validSequence(s.opening.sequence) || JSON.stringify(opening(s.opening.sequence, s.endChoice)) !== JSON.stringify(s.opening))) return false;
  for (const [key, attempts] of Object.entries(s.answers)) {
    if (key === 'recordedEvent') {
      if (!attempts || attempts.actor !== 'Jordan' || attempts.time !== variables(s).given || typeof attempts.prompted !== 'boolean') return false;
      continue;
    }
    if (['summary', 'handoff', 'synthesis'].includes(key)) continue;
    const allowed = key === 'priya' ? [...CHOICES.priya, ...CHOICES.priyaWait] : key === 'analysis' ? [...CHOICES.analysis, ...CHOICES.analysisAway] : CHOICES[key];
    if (!allowed || !Array.isArray(attempts) || !attempts.every(a => allowed.some(o => o.id === a.id && o.label === a.label))) return false;
  }
  if (s.answers.summary && (!Array.isArray(s.answers.summary) || s.answers.summary.length > 5 || s.answers.summary.some(id => !SUMMARY.some(c => c.id === id)))) return false;
  if (s.answers.handoff && Object.entries(s.answers.handoff).some(([id, v]) => !HANDOFF.some(h => h.id === id) || !['good', 'bad', 'skip'].includes(v))) return false;
  for (const list of [s.answers.synthesis, s.corrections.synthesis]) if (list && (!Array.isArray(list) || list.some(id => !handoffErrors(s).some(e => e.id === id)))) return false;
  if (['missing', 'synthesis', 'correction', 'transfer', 'debrief'].includes(s.stage) && !s.answers.handoff) return false;
  return true;
}
export function readStore(storage, mode) {
  try {
    const raw = storage.getItem(KEYS[mode]);
    if (!raw) return { value: mode === 'main' ? fresh() : { version: mode === 'rewind' ? '0.6' : VERSION, index: 0, answers: {}, drafts: {} }, status: 'saved' };
    const s = JSON.parse(raw);
    const data = mode === 'replay' ? REPLAY : REWIND;
    const valid = mode === 'main' ? validState(s) : s.version === (mode === 'rewind' ? '0.6' : VERSION) && Number.isInteger(s.index) && s.index >= 0 && s.index <= data.length && s.answers && s.drafts && Object.entries(s.answers).every(([id, a]) => data.some(d => d.id === id && d.options.some(o => o.id === a.id)));
    return { value: valid ? s : null, status: valid ? 'saved' : 'blocked' };
  } catch (e) { return { value: e instanceof SyntaxError ? null : mode === 'main' ? fresh() : { version: mode === 'rewind' ? '0.6' : VERSION, index: 0, answers: {}, drafts: {} }, status: e instanceof SyntaxError ? 'blocked' : 'unavailable' }; }
}
