export const VERSION = '0.4';
export const STORAGE_KEY = 'ce_shift_005_v04';
export const ROOMS = ['410', '412', '414', '416'];
export const CALLS = ['410', '412', '416'];
export const DESTINATIONS = ['you', 'jordan', 'priya', 'hold'];
export const SEVERITY = ['Unsafe', 'Outside role', 'Revisit', 'Accepted with a note', 'Accepted'];

export function primaryReason(reasons) {
  return SEVERITY.find(reason => reasons.includes(reason)) || 'Accepted';
}
export function needsBridge(reasons) {
  return reasons.some(reason => ['Unsafe', 'Outside role', 'Revisit'].includes(reason));
}
export function fresh() {
  return {
    version: VERSION, stage: 0, selectedRoom: null,
    d1: null, d2Draft: { assignments: {}, jordanDirection: null, hold416: null }, d2: null,
    room412Seen: [], d3: null,
    d4: { phase: 0, revealed: [], helpDraft: [], help: null, reportDraft: [], report: null, checkback: null },
    d5: {}, coverageAcknowledged: false, tomorrow: null,
  };
}

export function canSubmitDispatch(draft) {
  const assigned = CALLS.every(room => DESTINATIONS.includes(draft.assignments[room]));
  if (!assigned) return false;
  const staff = ['you', 'jordan', 'priya'];
  if (staff.some(person => CALLS.filter(room => draft.assignments[room] === person).length > 1)) return false;
  if (draft.assignments['410'] === 'jordan' && !['A', 'B'].includes(draft.jordanDirection)) return false;
  if (draft.assignments['416'] === 'hold' && !['A', 'B'].includes(draft.hold416)) return false;
  return true;
}

const PLAN_KEYS = {
  'you:jordan:hold:A:A': 'V1',
  'you:jordan:priya:A:-': 'V2',
  'priya:jordan:you:A:-': 'V3',
  'you:priya:hold:-:A': 'V4',
  'priya:you:hold:-:A': 'V5',
};
export function dispatchPlan(draft) {
  const a = draft.assignments;
  return PLAN_KEYS[[a['412'], a['410'], a['416'], a['410'] === 'jordan' ? draft.jordanDirection : '-', a['416'] === 'hold' ? draft.hold416 : '-'].join(':')] || null;
}
export function evaluateDispatch(draft) {
  if (!canSubmitDispatch(draft)) throw new Error('Incomplete dispatch');
  const a = draft.assignments;
  const reasons = {
    '410': a['410'] === 'hold' ? ['Revisit'] : a['410'] === 'jordan' ? [draft.jordanDirection === 'A' ? 'Accepted' : 'Revisit'] : ['Accepted with a note'],
    '412': a['412'] === 'jordan' ? ['Outside role', 'Unsafe'] : a['412'] === 'hold' ? ['Unsafe'] : ['Accepted'],
    '416': a['416'] === 'jordan' ? ['Outside role'] : a['416'] === 'hold' ? [draft.hold416 === 'A' ? 'Accepted' : 'Revisit'] : ['Accepted'],
  };
  const plan = dispatchPlan(draft);
  const bridges = plan ? [] : [{ decision: 'D2', original: structuredClone(draft), story: 'V1', text: "Taking the safer approach: you go to 412, Jordan helps Ms. Alvarez, and Sam tells Ms. Whitfield you'll be in by about 0750." }];
  return { submitted: structuredClone(draft), reasons, plan, storyPlan: plan || 'V1', bridges };
}

export function evaluateCoverage(option, v5Step = null) {
  if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(option)) throw new Error('Unknown coverage option');
  const reasons = { A: ['Accepted'], B: ['Accepted'], C: ['Accepted'], D: ['Revisit'], E: ['Unsafe'], F: ['Outside role', 'Unsafe'] }[option];
  const v5Reasons = v5Step ? ['i', 'ii', 'iii'].includes(v5Step) ? [v5Step === 'iii' ? 'Unsafe' : 'Accepted'] : null : null;
  if (v5Step && !v5Reasons) throw new Error('Unknown V5 step');
  const bridge = needsBridge(reasons) || (v5Reasons && needsBridge(v5Reasons));
  return { submitted: { option, v5Step }, reasons, v5Reasons, storyOption: bridge ? 'A' : option,
    bridges: bridge ? [{ decision: 'D3', original: { option, v5Step }, story: 'A', text: `Taking the safer approach: Dee takes 412 and watches 410 and 416 while you go to 414${v5Step === 'iii' ? ', and Jordan stays with Ms. Alvarez' : ''}.` }] : [] };
}

export function helpReasons(choices) {
  if (choices.includes('recheck') || choices.includes('rounds')) return ['Unsafe'];
  if (choices.includes('provider') || choices.includes('rapid')) return ['Accepted'];
  return ['Revisit'];
}
export function reportChips(revealed) {
  return [
    { id: 'trend', text: revealed.includes('vitals') ? 'HR 88 to 118 and BP 128/74 to 92/58' : 'HR 88 to 112 and BP 128/74 to 98/60 since 0700', required: true },
    ...(revealed.includes('dressing') ? [{ id: 'dressing', text: 'Bright red drainage spreading past the 0600 outline', required: true }] : []),
    { id: 'symptoms', text: revealed.includes('skin') ? 'Pale, anxious, feels faint; cool and clammy' : 'Pale, anxious, feels faint' },
    { id: 'surgery', text: 'Surgery ended at 0300' },
    { id: 'saturation', text: 'SpO2 96% at 0700' },
  ];
}
export function buildReport(selected, revealed) {
  const chips = reportChips(revealed);
  const selectedChips = chips.filter(chip => selected.includes(chip.id));
  return ["I'm concerned about postoperative deterioration.", ...(selected.includes('dressing') && revealed.includes('dressing') ? ["I'm also concerned about possible bleeding."] : []), ...selectedChips.map(chip => chip.text + '.'), 'I need you to see him now.'].join(' ');
}
export function evaluateReport(selected, revealed) {
  const available = reportChips(revealed);
  if (selected.length > 3 || selected.some(id => !available.some(chip => chip.id === id))) throw new Error('Invalid report chips');
  const missed = available.filter(chip => chip.required && !selected.includes(chip.id)).map(chip => chip.id);
  const saferIds = [...new Set([...selected, ...missed])];
  return { submitted: [...selected], revealed: [...revealed], reasons: missed.length ? ['Revisit'] : ['Accepted'], missed,
    line: buildReport(selected, revealed), saferLine: missed.length ? buildReport(saferIds, revealed) : null,
    bridges: missed.length ? [{ decision: 'D4 report', original: [...selected], story: saferIds, text: 'Taking the safer approach: lead with the observed findings you had available.' }] : [] };
}

export function evaluateD5(card, choice) {
  if (!['412', '414', 'coverage', '416', 'jordan'].includes(card) || !['accepted', 'other'].includes(choice)) throw new Error('Invalid loose end');
  const reasons = choice === 'accepted' ? ['Accepted'] : [card === '416' ? 'Outside role' : 'Revisit'];
  return { submitted: choice, reasons, storyChoice: 'accepted', bridges: choice === 'accepted' ? [] : [{ decision: `D5 ${card}`, original: choice, story: 'accepted', text: `Taking the safer approach: ${card} receives the accepted follow-up action.` }] };
}

export function allReasons(state) {
  return [
    ...Object.values(state.d2?.reasons || {}).flat(),
    ...(state.d3?.reasons || []), ...(state.d3?.v5Reasons || []),
    ...(state.d4.help?.reasons || []), ...(state.d4.report?.reasons || []), ...(state.d4.checkback?.reasons || []),
    ...Object.values(state.d5 || {}).flatMap(item => item.reasons),
  ];
}
export function ending(state) {
  const reasons = allReasons(state);
  if (reasons.some(r => r === 'Unsafe' || r === 'Outside role')) return 'C';
  if (reasons.includes('Revisit')) return 'B';
  return 'A';
}
export function canFinish(state) {
  return ['412', '414', 'coverage', '416', 'jordan'].every(card => !!state.d5[card]) && state.coverageAcknowledged;
}
export function dismissTeachingClaim(state) {
  return !['V2', 'V3'].includes(state.d2?.storyPlan);
}
