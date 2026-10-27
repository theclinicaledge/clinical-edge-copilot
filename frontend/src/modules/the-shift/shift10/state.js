import { VERSION, KEY, questions, assessments, chart, paths, concerns, nursing, ownership, owners } from './content.js';

// Append-only, actor-attributed events are the canonical attempt. Reload replays
// the same validated transitions, rather than trusting a mutable saved score.
export const fresh = () => ({ version: VERSION, phase: 'intro', segment: 0, tab: null, opened: [], asked: [], assessed: [], actions: [], flags: {}, raised: [], path: null, preArrival: null, prompt: null, prompts: [], call: null, calls: [], events: [], finished: false });
const unique = (a, x) => a.includes(x) ? a : [...a, x];
export const room = s => paths[s.path || pathFor(s.raised)].room;
export const pathFor = raised => raised.includes('telemetry') ? (raised.includes('isolation') ? 'A' : 'B') : (raised.includes('isolation') ? 'C' : 'D');
export const observed = s => s.assessed.includes('orientation') || s.assessed.includes('attention');
const label = (s, type, id, actor = 'You, receiving RN') => ({ type, id, actor, phase: s.phase, prompted: !!s.prompt, prompt: s.prompt });
const validId = (items, id) => items.some(item => item.id === id);

export function responses(s, index) {
  const a = id => s.assessed.includes(id);
  const o = id => s.opened.includes(id);
  const list = [];
  const add = (id, text) => list.push({ id, text });
  if (index === 0) {
    if (a('orientation')) add('orientation', 'She knows her name and the hospital, cannot give the date, and asks why she is here.');
    if (a('attention')) add('attention', 'She loses the thread of conversation and repeats “Why am I here?” about 90 seconds later.');
    if (a('recheck')) add('recheck', 'I rechecked her attention before calling. The finding was the same.');
    if (o('triage')) add('triage', 'Triage documented alert and oriented.');
  }
  if (index === 1) {
    if (a('daughter')) add('daughter', 'Adaeze says she does the crossword every morning and this is not her usual self.');
    if (o('triage')) add('triage', 'The triage note says alert and oriented. That is the charted ED observation, not her usual baseline.');
    if (s.asked.includes('baseline')) add('dana-baseline', 'Dana reported that her daughter said this was not like her. I have not substituted that for my own conversation with Adaeze.');
  }
  if (index === 2) {
    if (a('vitals')) add('vitals', 'Arrival: BP 120/70, HR 86, RR 18, temp 98.6°F, SpO₂ 96% on room air.');
    if (a('wristband')) add('wristband', 'Wristband and chart match.');
    if (a('iv')) add('iv', 'Dry lips. IV site clean.');
    if (a('gait')) add('gait', 'Unsteady when standing; needs a firm hand.');
    add('room', `She is in ${room(s)}, ${paths[s.path].private ? 'a private room' : 'a semi-private room'}, ${paths[s.path].monitoring ? 'with telemetry capability' : 'without telemetry capability'}.`);
    if (s.actions.includes('precautions')) add('precautions', 'I set up contact precautions signage and supplies.');
  }
  if (index === 3) {
    if (a('needs')) add('needs', 'She needs the bathroom now, has cramping and asks for something for it.');
    if (o('meds')) add('meds', 'The ED medication record has a pain medication entry at 1340. The provider will decide about anything further.');
    else if (s.segment >= 4) add('ed-pain', "She got something in the ED. I don't know when from the record.");
    if (o('stool')) add('stool', 'The chart lists a stool test sent at 1210, still pending.');
    else if (s.asked.includes('pending')) add('dana-stool', 'Dana said the stool sample went down at 1210 and was not back.');
  }
  return list;
}
export function responseText(s, index, ids) {
  if (ids.includes('unknown')) return index === 0 ? "I haven't checked her closely yet." : "I don't know yet.";
  return responses(s, index).filter(r => ids.includes(r.id)).map(r => r.text).join(' ');
}

export function transition(s, action) {
  if (s.call && !['call-answer', 'call-close'].includes(action.type)) return s;
  let n = s;
  let event;
  const { type, id } = action;
  if (type === 'start' && s.phase === 'intro') { n = { ...s, phase: 'report' }; event = label(s, type, '1405'); }
  if (type === 'tab' && ['Orders', 'Rooms', 'Chart', 'Policies'].includes(id) && ['report', 'bedside'].includes(s.phase)) {
    n = { ...s, tab: id, opened: unique(s.opened, id) }; event = label(s, type, id);
  }
  if (type === 'chart' && validId(chart, id) && s.tab === 'Chart' && ['report', 'bedside'].includes(s.phase)) {
    n = { ...s, opened: unique(s.opened, id) }; event = label(s, type, id);
  }
  if (type === 'go-on' && s.phase === 'report' && s.segment < 5) { n = { ...s, segment: s.segment + 1 }; event = label(s, type, String(s.segment + 1), 'Dana, ED RN'); }
  if (type === 'ask' && s.phase === 'report' && questions.some(q => q.id === id && (!q.parent || s.asked.includes(q.parent)))) {
    n = { ...s, asked: unique(s.asked, id) }; event = label(s, type, id);
  }
  if (type === 'flag' && concerns[id] && ['report', 'bedside'].includes(s.phase) && !s.flags[id]) {
    const allowed = id === 'confusion' ? observed(s) : id === 'pain' ? s.opened.includes('meds') : id === 'telemetry' ? s.opened.includes('Orders') && s.opened.includes('Rooms') : (s.opened.includes('stool') || s.asked.includes('pending'));
    if (allowed) { n = { ...s, flags: { ...s.flags, [id]: label(s, type, id) } }; event = label(s, type, id); }
  }
  if (type === 'charge' && s.phase === 'report' && Array.isArray(action.topics) && action.topics.every(x => ['telemetry', 'isolation'].includes(x))) {
    const raised = [...new Set([...s.raised, ...action.topics])];
    const flags = { ...s.flags };
    raised.forEach(x => { if (!flags[x]) flags[x] = label(s, type, x); });
    n = { ...s, raised, flags }; event = { ...label(s, type, pathFor(raised)), topics: raised, response: { actor: 'Marisol, charge nurse', text: paths[pathFor(raised)].reply, room: paths[pathFor(raised)].room } };
  }
  if (type === 'pre-provider' && s.phase === 'report') { event = label(s, type, 'telemetry'); }
  if (type === 'arrive' && s.phase === 'report' && s.segment === 5) {
    n = { ...s, phase: 'bedside', tab: null, path: pathFor(s.raised), preArrival: { opened: [...s.opened], asked: [...s.asked], raised: [...s.raised] } }; event = label(s, type, pathFor(s.raised), 'Authored arrival');
  }
  if (type === 'assess' && s.phase === 'bedside' && validId(assessments, id)) {
    n = { ...s, assessed: unique(s.assessed, id) }; event = label(s, type, id);
  }
  if (type === 'reobserve' && s.phase === 'bedside' && s.assessed.includes('attention') && !s.assessed.includes('recheck')) {
    n = { ...s, assessed: unique(s.assessed, 'recheck') }; event = { ...label(s, type, 'recheck'), reason: 'A second observation before I report.' };
  }
  if (type === 'nursing' && id !== 'recheck' && s.phase === 'bedside' && validId(nursing, id) && (id !== 'precautions' || paths[s.path].private)) {
    n = { ...s, actions: unique(s.actions, id) }; event = label(s, type, id);
  }
  if (type === 'contact' && s.phase === 'bedside' && ['charge-confusion', 'charge-room', 'charge-exposure', 'infection'].includes(id)) {
    event = label(s, type, id);
  }
  if (type === 'document' && s.phase === 'bedside') { event = label(s, type, 'findings'); }
  if (type === 'prompt' && ['chart', 'report', 'adaeze'].includes(id) && s.phase === 'bedside' && !s.prompts.includes(id)) {
    const justified = id === 'adaeze' ? !s.calls.some(c => c.complete) : Object.keys(s.flags).length === 0;
    if (justified) { n = { ...s, prompt: id, prompts: unique(s.prompts, id) }; event = label(s, type, id, id === 'adaeze' ? 'Adaeze' : 'Standardized reflection prompt'); }
  }
  if (type === 'call-start' && s.phase === 'bedside' && !s.call && s.calls.length < 2 && ['confusion', 'bed', 'admission'].includes(id)) {
    const flags = { ...s.flags };
    if (id === 'confusion' && observed(s) && !flags.confusion) flags.confusion = label(s, 'call-start', 'confusion');
    n = { ...s, flags, call: { number: s.calls.length + 1, index: 0, lead: id, prompted: !!s.prompt, prompt: s.prompt, answers: [], plans: [], owners: {}, needs: [], complete: false } }; event = label(s, type, id);
  }
  if (type === 'call-answer' && s.call && s.call.index < 4 && Array.isArray(action.ids) && action.ids.length) {
    const allowed = responses(s, s.call.index).map(r => r.id);
    const chosen = [...new Set(action.ids)];
    if (chosen.every(x => allowed.includes(x) || x === 'unknown') && !(chosen.includes('unknown') && chosen.length > 1)) {
      const answer = { index: s.call.index, ids: chosen, text: responseText(s, s.call.index, chosen), prompted: !!s.prompt };
      const needs = [...s.call.needs];
      if (s.call.index === 0 && !chosen.some(x => ['orientation', 'attention'].includes(x))) needs.push('assessment');
      if (s.call.index === 1 && !chosen.includes('daughter')) needs.push('baseline');
      if (s.call.index === 3 && !chosen.includes('meds')) needs.push('record');
      const call = { ...s.call, index: s.call.index + 1, answers: [...s.call.answers, answer], needs: [...new Set(needs)] };
      // Return to the bedside at the authored request, rather than forcing the
      // learner through questions the provider has not yet asked. One callback.
      const returnReason = s.call.index === 0 && needs.includes('assessment') ? 'assessment' : s.calls.length === 0 && s.call.index === 1 && !chosen.includes('daughter') ? 'baseline' : s.calls.length === 0 && s.call.index === 3 && !chosen.includes('meds') ? 'record' : null;
      n = returnReason ? { ...s, call: null, calls: [...s.calls, { ...call, returned: returnReason }] } : { ...s, call };
      const requested = s.call.index === 0 && needs.includes('assessment') ? 'provider-assessment' : s.call.index === 1 && !chosen.includes('daughter') ? 'provider-baseline' : s.call.index === 3 && !chosen.includes('meds') ? 'provider-record' : null;
      if (requested) n = { ...n, prompt: requested, prompts: unique(n.prompts, requested) };
      event = { ...label(s, type, String(answer.index)), answer };
    }
  }
  if (type === 'call-close' && s.call?.index === 4 && Array.isArray(action.plans) && action.plans.every(x => validId(nursing, x)) && action.owners && Object.entries(action.owners).every(([k, v]) => validId(ownership, k) && owners.includes(v))) {
    const call = { ...s.call, plans: [...new Set(action.plans)], owners: { ...action.owners }, complete: true };
    n = { ...s, call: null, calls: [...s.calls, call] }; event = { ...label(s, type, String(call.number)), plans: call.plans, owners: call.owners };
  }
  if (type === 'finish' && s.phase === 'bedside' && !s.call) {
    n = { ...s, phase: 'debrief', finished: true }; event = label(s, type, 'close');
  }
  if (!event) return s;
  return { ...n, events: [...s.events, { ...event, seq: s.events.length + 1, action: JSON.parse(JSON.stringify(action)) }] };
}
export function restore(raw) {
  if (raw?.version !== VERSION || !Array.isArray(raw.events) || raw.events.length > 2000) return fresh();
  let s = fresh();
  try {
    for (const entry of raw.events) {
      if (!entry?.action || typeof entry.action.type !== 'string') return fresh();
      const next = transition(s, entry.action);
      if (next === s) return fresh();
      s = next;
    }
    return s;
  } catch { return fresh(); }
}
export function read() { try { return restore(JSON.parse(localStorage.getItem(KEY))); } catch { return fresh(); } }
export const savePayload = s => JSON.stringify({ version: VERSION, events: s.events.map(e => ({ action: e.action })) });
export const reportedIds = s => [...new Set(s.calls.flatMap(c => c.answers.flatMap(a => a.ids)))];
export function discoveries(s, key) {
  const relevant = e => key === 'confusion' ? e.type === 'assess' && ['orientation', 'attention', 'daughter'].includes(e.id) || e.type === 'reobserve' : key === 'pain' ? (e.type === 'chart' && e.id === 'meds') || (e.type === 'ask' && ['pain', 'pain-time'].includes(e.id)) : key === 'telemetry' ? e.type === 'tab' && ['Orders', 'Rooms'].includes(e.id) : (e.type === 'chart' && e.id === 'stool') || (e.type === 'ask' && ['pending', 'isolation'].includes(e.id)) || (e.type === 'tab' && e.id === 'Policies');
  const seen = new Set();
  return s.events.filter(relevant).filter(e => { const k = `${e.type}:${e.id}`; if (seen.has(k)) return false; seen.add(k); return true; }).map(e => ({ ...e, text: ({ orientation: 'Ruth: orientation assessed', attention: 'Ruth: attention observed', daughter: 'Adaeze: baseline obtained', recheck: 'Attention rechecked', meds: 'ED medication record opened', pain: 'Dana asked about pain medication', 'pain-time': 'Dana supplied an uncertain time; not record verification', Orders: 'Orders opened', Rooms: 'Room capabilities opened', stool: 'Pending stool result opened', pending: 'Dana asked about pending tests', isolation: 'Dana asked why no isolation', Policies: 'Fictional facility policies opened' })[e.id] }));
}
export function later(s) {
  const completed = s.calls.filter(c => c.complete);
  if (!s.calls.length) return 'Dr. Lin first heard about her confusion from Adaeze at the desk.';
  if (!completed.length) return ({ baseline: 'Dr. Lin asked you to ask Adaeze and call back. The call remained incomplete.', record: 'Dr. Lin asked you to verify the ED pain record. The call remained incomplete.' })[s.calls.at(-1).returned] || 'Dr. Lin asked you to go back and assess her, then call him. The call remained incomplete.';
  const ids = reportedIds(s);
  const last = completed.at(-1);
  if (ids.some(x => ['attention', 'orientation'].includes(x)) && ids.includes('daughter') && ids.includes('meds') && ['stool', 'isolation', 'pain', 'recheck', ...(!paths[s.path].monitoring ? ['bed'] : [])].every(x => last.owners[x])) {
    return "Dr. Lin saw Ms. Okonkwo and went over her orders. Adaeze stayed. You rechecked her and called back with what you saw." + (s.calls.length > 1 ? ' You called twice.' : '');
  }
  if (!ids.includes('daughter') && !ids.includes('meds')) return 'Dr. Lin came and asked about her usual self and the pain entry. Adaeze answered the first. Nobody had the second.';
  // Do not claim the ED entry was unknown when it was already reported. The
  // draft's generic incomplete-call card cannot truthfully cover every mixture.
  return 'Dr. Lin came. Some information or follow-up ownership remained unresolved in your call.';
}
export function feedback(s) {
  const result = [];
  const first = s.calls[0];
  if (first && !first.answers.some(a => a.index === 1 && a.ids.includes('daughter')) && s.calls.length > 1) result.push('You raised a possible change early. Dr. Lin asked what was usual and you did not yet know. Calling first was defensible. You also had to call twice.');
  const daughter = s.events.find(e => e.type === 'assess' && e.id === 'daughter');
  const call = s.events.find(e => e.type === 'call-start');
  if (daughter && call && daughter.seq < call.seq) result.push('You had the baseline before you called. That preparation can complete the call. The cost was time before Dr. Lin heard.');
  const recheck = s.events.find(e => e.type === 'reobserve');
  if (recheck && call && recheck.seq < call.seq) result.push('A second observation can steady a finding. The cost is that Dr. Lin hears later. Your stated reason: a second observation before reporting.');
  if (s.prompts.includes('adaeze')) result.push('A finding that stays in the room is not communicated. Adaeze had to ask whether the doctor knew.');
  if (s.calls.some(c => c.answers.some(a => a.ids.includes('unknown')))) result.push('“I don’t know yet” was accurate and let Dr. Lin ask for what he needed. It would have been wrong to guess.');
  if (reportedIds(s).includes('meds')) result.push('You gave him the time from the record, not from memory of the report.');
  if (s.calls.some(c => c.owners.recheck === owners[0])) result.push('A named owner with a defined next step makes the report usable. Your stated plan is recorded separately from completed actions.');
  return result;
}
