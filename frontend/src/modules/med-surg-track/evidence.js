import { CHANGED, CONCERNS, FINDINGS } from './content.js';
import { scenario } from '../the-shift/scenario.js';
import { coverageOptions, helpOptions } from '../the-shift/shift5/data.js';
import { primaryReason } from '../the-shift/shift5/rules.js';
export const COMPONENTS = ['C1', 'C2', 'C3'];
const bad = label => ['Unsafe', 'Outside role', 'Revisit'].includes(label);
export const accepted = label => ['Accepted', 'Accepted with a note'].includes(label);
const specs = {
  a1: { C1: ['cues'], C2: ['action'], C3: ['action', 'sbar'] },
  a2: { C1: ['d3'], C2: ['d3'], C3: ['help', 'report'] },
  a3: { C1: ['findings'], C2: ['concern'], C3: ['call'] },
};
export function mappedRecord(assignment, key, value, before = {}) {
  let label = 'Accepted', components = [], description = '', why = '', assistance = [];
  if (assignment === 'a1') {
    if (before.answers?.priority && before.answers.priority !== '12') assistance.push('Earlier priority safer path');
    if (key === 'cues') {
      if (before.answers?.priority !== undefined) assistance.push('Priority feedback identified the alertness cue before cue selection');
      components = ['C1']; label = ['consciousness', 'breathing'].every(id => value.includes(id)) ? 'Accepted' : 'Revisit';
      description = 'Selected ' + value.map(id => scenario.cues.find(c => c.id === id)?.label || id).join(', ');
      why = 'Reduced alertness and slow, shallow breathing are the two essential cues in the existing case.';
    }
    if (key === 'action') {
      components = ['C2', 'C3']; label = value === 'escalate' ? 'Accepted' : value === 'stop' ? 'Unsafe' : 'Revisit';
      description = scenario.actions.find(c => c.id === value)?.text || value;
      why = scenario.actions.find(c => c.id === value)?.feedback || '';
      if (Array.isArray(before.answers?.cues)) assistance.push('Cue teaching shown before this action');
    }
    if (key === 'sbar') {
      components = ['C3']; label = value === 'a' ? 'Accepted' : 'Revisit'; description = `Used SBAR ${value.toUpperCase()}`;
      why = scenario.sbars.find(c => c.id === value)?.feedback || '';
      assistance.push('Cue teaching and scripted response-team continuation before SBAR');
    }
  }
  if (assignment === 'a2') {
    if (before.d2?.bridges?.length) assistance.push('D2 safer-path bridge');
    if (key === 'd3') {
      components = ['C1', 'C2']; label = primaryReason([...value.reasons, ...(value.v5Reasons || [])]);
      description = coverageOptions.find(c => c.id === value.submitted.option)?.text || '';
      why = coverageOptions.find(c => c.id === value.submitted.option)?.feedback || '';
    }
    if (['help', 'report'].includes(key)) {
      if (before.d3?.bridges?.length) assistance.push('D3 safer-path bridge');
      components = ['C3']; label = primaryReason(value.reasons);
      description = key === 'help' ? value.submitted.map(id => helpOptions.find(c => c.id === id)?.label || id).join('; ') : value.line;
      why = key === 'help' ? 'The symptomatic HR and BP trend supports bedside help without waiting for rounds or another delayed check.' : 'The report should include the trend and any required findings the learner actually revealed.';
      if (key === 'report' && before.d4?.help?.bridges?.length) assistance.push('D4 help safer-path bridge');
    }
  }
  return { key, value: structuredClone(value), label, components, description, why, assistance };
}
export function a3Records(response) {
  const selected = response.findings || [];
  const changes = selected.filter(id => CHANGED.includes(id));
  const c1 = changes.length >= 2 ? 'Accepted' : 'Revisit';
  let plausible = false;
  if (response.concern === 'acute') plausible = changes.length >= 2;
  if (response.concern === 'infection') plausible = changes.length >= 2 && (selected.includes('temperature') || (selected.includes('confusion') && selected.some(id => ['hr', 'rr', 'bp'].includes(id))));
  if (response.concern === 'dehydration') plausible = selected.includes('hr') && selected.includes('bp');
  if (['medication', 'glucose'].includes(response.concern)) plausible = selected.includes('confusion') && selected.some(id => ['hr', 'rr', 'bp'].includes(id));
  return [
    { key: 'findings', value: selected, components: ['C1'], label: c1, description: 'Linked ' + selected.map(id => FINDINGS.find(([f]) => f === id)?.[1] || id).join(', '), why: 'At least two of new confusion, HR, RR, BP and temperature must be linked to the earlier picture.', assistance: [] },
    { key: 'concern', value: response.concern, components: ['C2'], label: plausible ? 'Accepted' : 'Revisit', description: CONCERNS.find(([id]) => id === response.concern)?.[1] || response.concern, why: ['tired', 'none'].includes(response.concern) ? 'New or worsening confusion warrants assessment for an acute cause. Infection and sepsis are possibilities, but confusion alone does not establish either diagnosis.' : 'Keep an acute explanation open and connect it to the selected observations. A tentative cause is not a diagnosis; missing exposure or glucose information still needs checking.', assistance: [] },
  ];
}
export function callRecord(call, information) {
  return { key: 'call', value: { call, information }, components: ['C3'], label: call === 'escalate' ? 'Accepted' : call === 'reassess' ? 'Unsafe' : 'Revisit', description: ({ reassess: 'Continue and reassess', information: 'Get specific information', notify: 'Notify the provider through the non-urgent process', escalate: 'Request urgent bedside evaluation now' })[call], why: 'The new confusion with HR, BP, RR and temperature changes needs bedside evaluation now. Continue assessment while getting the appropriate help through the hospital process.', assistance: [] };
}
export function componentEvidence(assignment, run, component) {
  return (specs[assignment][component] || []).map(key => run?.decisions[key]).filter(Boolean);
}
export function componentState(assignment, run, component) {
  const entries = componentEvidence(assignment, run, component);
  const expected = specs[assignment][component].length;
  if (entries.some(e => e.independent && bad(e.label))) return 'needs-review';
  if (entries.length === expected && entries.every(e => e.independent && accepted(e.label))) return 'supported';
  return 'not-observed';
}
export function feedbackFor(assignment, run) {
  const entries = Object.values(run?.decisions || {}).filter(e => e.components?.length && e.independent);
  const candidates = entries.filter(e => bad(e.label)).flatMap(e => e.components.map(component => ({ e, component })));
  candidates.sort((a, b) => (a.e.label === 'Unsafe' ? 0 : 1) - (b.e.label === 'Unsafe' ? 0 : 1) || ['C3', 'C1', 'C2'].indexOf(a.component) - ['C3', 'C1', 'C2'].indexOf(b.component));
  if (candidates.length) {
    const { e, component } = candidates[0];
    return { kind: 'practice', heading: 'Worth practicing', component, decision: e.key, text: `One decision to look at: ${e.description}. ${e.why}`, takeaway: ({ C1: 'Compare the current findings with the earlier picture.', C2: 'Check whether a reassuring explanation fits all the findings.', C3: 'Match the response and the timing to the whole picture.' })[component] };
  }
  if (!entries.length) return null;
  if (COMPONENTS.every(c => componentState(assignment, run, c) === 'supported') && entries.every(e => e.label === 'Accepted')) {
    return { kind: 'strong', heading: 'Strong', text: assignment === 'a2' ? 'You arranged coverage to respond to the reported change, requested help and led the report with the observed trend.' : 'You linked the changes, kept an acute cause in mind and requested urgent bedside evaluation.', takeaway: 'Keep matching your next step to the whole current picture.' };
  }
  const positives = entries.filter(e => accepted(e.label));
  if (!positives.length) return null;
  const text = assignment === 'a1' && positives.some(e => e.key === 'cues') ? 'You selected reduced alertness and slow, shallow breathing as important cues. Later decisions followed the case’s cue teaching.' : positives.some(e => e.key === 'help') ? 'You requested provider or rapid-response help. Other parts of this response were not all observed independently.' : positives.some(e => e.key === 'd3') ? 'You arranged a response to the reported change. This choice does not show how you independently interpreted every finding.' : 'Your recorded response included supported observations. There is not enough independent evidence for all three parts.';
  return { kind: 'observed', heading: 'What we saw', text, takeaway: 'Use what you noticed to explain your next step.' };
}
export function comparison(state) {
  const current = state.assignments.a3?.runs[0];
  if (!current?.decisions.concern || !current.decisions.findings) return null;
  const priorId = ['a2', 'a1'].find(id => state.assignments[id]?.card?.kind === 'practice') || 'a2';
  const prior = state.assignments[priorId], component = prior?.card?.component || 'C3';
  const earlier = componentEvidence(priorId, prior?.runs[0], component);
  // For C3 compare the help action; A3 does not separately measure a spoken SBAR.
  const reportFocus = component === 'C3' && prior?.card?.decision === 'report';
  const left = reportFocus ? earlier.filter(e => e.key === 'report') : component === 'C3' ? earlier.filter(e => ['help', 'action'].includes(e.key)) : earlier;
  const right = componentEvidence('a3', current, component);
  const usable = left.length && right.length && [...left, ...right].every(e => e.independent);
  let text = 'An independent comparison is not available for this component. Earlier assistance or missing evidence prevents a change claim.';
  let outcome = 'insufficient';
  if (usable) {
    const before = left.every(e => accepted(e.label)), after = right.every(e => accepted(e.label));
    if (reportFocus) { outcome = 'different-format'; text = 'The earlier difficulty concerned what was included in the spoken report. This handoff response does not independently test a spoken report, so it cannot establish improvement in that part of communication.'; }
    else if (priorId === 'a2' && ['C1', 'C2'].includes(component)) { outcome = 'different-format'; text = 'The earlier coverage choice and the current linked reasoning are different kinds of evidence. Both are shown here; they do not establish improvement in noticing or resisting reassurance.'; }
    else if (!before && after) { outcome = 'improvement'; text = 'The earlier first response needed review; this first response is supported for the same component. That is an improvement in these recorded choices, not proof of clinical competence or an effect caused by CE.'; }
    else if (before && after) { outcome = 'consistency'; text = 'Both first responses are supported for this component. These choices show consistency here, not clinical competence.'; }
    else if (!before && !after) { outcome = 'continued-difficulty'; text = 'This component needs review in both first responses. The current response does not support a claim of improvement.'; }
    else { outcome = 'current-needs-review'; text = 'The earlier first response was supported; this response needs review. The record does not show consistent accepted choices.'; }
  }
  return { priorId, component, outcome, text, left, right, prompted: prior?.card?.kind === 'practice', practiceTried: (prior?.rewind?.attempts.length || 0) > 0 };
}
