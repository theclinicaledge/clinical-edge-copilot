import { VERSION, KEY, actions, questions, evidence, findings, rewinds } from './data.js';
export function fresh() { return { version: VERSION, stage: 0, answers: {}, asked: [], classifications: {}, limits: {}, actionDraft: [], handoffDraft: [], handoff: null, water: null, waterDraft: null, contact: null, contactDraft: null, rewinds: {}, updated: 0 }; }
const ids = (value, allowed) => Array.isArray(value) ? [...new Set(value.filter(v => allowed.includes(v)))] : [];
export function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (!p || ![VERSION, '0.2-preview.1'].includes(p.version) || !Number.isInteger(p.stage) || p.stage < 0 || p.stage > 5) return fresh();
    const clean = { ...fresh(), stage: p.stage, asked: ids(p.asked, questions.map(q => q.id)), actionDraft: ids(p.actionDraft, actions.map(a => a.id)), updated: Number(p.updated) || 0 };
    clean.asked = clean.asked.filter(id => { const q = questions.find(q => q.id === id); return !q.parent || clean.asked.includes(q.parent); });
    const opening = ids(p.answers?.opening, actions.map(a => a.id));
    clean.answers = opening.length ? { opening } : {};
    clean.classifications = Object.fromEntries(discovered(clean).filter(e => ['Reported baseline or function', 'Symptoms noticed', 'Activity record', 'Unresolved timing'].includes(p.classifications?.[e.id])).map(e => [e.id, p.classifications[e.id]]));
    clean.limits = Object.fromEntries(discovered(clean).filter(e => [e.limit, ...e.alternatives].includes(p.limits?.[e.id])).map(e => [e.id, p.limits[e.id]]));
    clean.water = ['hold', 'sip'].includes(p.water) ? p.water : null;
    clean.contact = ['phone', 'nearby', 'leave'].includes(p.contact) ? p.contact : null;
    clean.waterDraft = ['hold', 'sip'].includes(p.waterDraft) ? p.waterDraft : null;
    clean.contactDraft = ['phone', 'nearby', 'leave'].includes(p.contactDraft) ? p.contactDraft : null;
    const allowed = handoffChips(clean).map(c => c.id);
    clean.handoffDraft = ids(p.handoffDraft, allowed);
    clean.handoff = Array.isArray(p.handoff) ? ids(p.handoff, allowed) : null;
    clean.rewinds = Object.fromEntries(rewinds.filter(r => r.options.some(o => o[0] === p.rewinds?.[r.id])).map(r => [r.id, p.rewinds[r.id]]));
    // A malformed save must never skip a required response or invent an action.
    if (clean.stage >= 2 && !clean.answers.opening) clean.stage = 1;
    if (clean.stage >= 4 && (!clean.water || !clean.contact)) clean.stage = 3;
    if (clean.stage === 5 && !clean.handoff) clean.stage = 4;
    return clean;
  } catch { return fresh(); }
}
export const discovered = p => evidence.filter(e => questions.some(q => q.card === e.id && p.asked.includes(q.id)));
export const transcript = (p, card) => questions.filter(q => q.card === card.id && p.asked.includes(q.id)).map(q => q.a).join(' ');
export function events(p) {
 const a = p.answers.opening;
 if (!a) return [];
 const result = [{ id: 'activation', time: a.includes('activate') ? '07:59' : '08:00', actor: a.includes('activate') ? 'You' : 'Ana Reyes, charge nurse', text: 'Code Stroke activated' }];
 if (a.includes('assess')) result.push({ id: 'assess', time: '08:00', actor: 'You', text: 'Airway, breathing, circulation and neurological assessment, vitals and monitoring initiated' });
 if (a.includes('glucose')) result.push({ id: 'glucose', time: '08:01', actor: 'You', text: 'Glucose 138 mg/dL' });
 if (a.includes('iv')) result.push({ id: 'iv', time: '08:01', actor: 'You', text: 'IV access arranged per protocol' });
 if (a.includes('npo')) result.push({ id: 'npo-initial', time: '08:00', actor: 'You', text: 'Nothing by mouth pending swallow screen' });
 if (p.water === 'hold') result.push({ id: 'npo', time: '08:03', actor: 'You', text: 'Water withheld pending swallow screen' });
 if (p.water === 'sip') result.push({ id: 'npo-corrected', time: '08:03', actor: 'Ana Reyes, charge nurse', text: 'Stops water before it is given; maintains nothing by mouth pending swallow screen' });
 if (p.contact === 'phone') result.push({ id: 'contact', time: '08:03', actor: 'You', text: 'Linda’s cell number confirmed in the fictional chart' });
 if (p.contact === 'nearby') result.push({ id: 'contact', time: '08:03', actor: 'Linda, after your request', text: 'Agrees to wait nearby after moving the car' });
 return result.sort((a, b) => a.time.localeCompare(b.time));
}
export function handoffChips(p) {
 const has = id => p.asked.includes(id);
 const chips = [{ id: 'observed', area: 'Observed', text: findings }, { id: 'asleep', area: 'Reported', text: 'Walter describes his arm as “asleep.”' }];
 const add = (id, text, area = 'Reported') => chips.push({ id, text, area });
 if (has('bedtime')) add('bedtime', 'Linda saw him normal at bedtime, 2230.');
 if (has('overnight')) add('overnight', 'About 0300, Linda heard clear speech during a short conversation and felt him climb into bed. She could not assess his face or arm.');
 if (has('morning')) {
  add('morning', has('hands') ? 'Walter reports normal function about 0600: mug in his left hand, pouring with his right. He had not spoken to anyone.' : 'Walter reports feeling fine making coffee about 0600.');
  add('qualified', 'Last known well approximately 0600, per patient; timing needs clarification.');
  chips.push({ id: 'certain', area: 'Reported', text: 'Last known well 0600.', error: 'Give the source and uncertainty: approximately, per patient.' });
 }
 if (has('arm')) add('arm', 'Walter estimates first noticing his arm symptoms about 0630.');
 if (has('machine')) add('machine', 'Linda reports the coffee maker app logged a 0605 start.');
 if (has('discovery')) add('discovery', 'Linda found him with symptoms at 0715.');
 else if (has('ems-time')) add('ems-time', 'EMS clarified that 0715 was Linda’s discovery time.');
 if (!['bedtime', 'overnight', 'morning'].some(has)) add('no-baseline', 'Last known well not established from the history obtained.', 'Unknown');
 add('unknown', 'Exact onset remains uncertain.', 'Unknown');
 if (has('hands')) add('speech', 'Speech at approximately 0600 was not established; he reports he had not spoken to anyone.', 'Unknown');
 chips.push({ id: 'onset', area: 'Reported', text: 'Onset 0715.', error: has('discovery') || has('ems-time') ? '0715 is discovery, not an established onset.' : 'The radio report used “onset.” You have not clarified what that time represents.' });
 events(p).filter(e => !['npo-initial', 'assess', 'iv'].includes(e.id) || (e.id === 'npo-initial' && !p.water)).forEach(e => add(e.id, `${e.text}. ${e.time}, ${e.actor}.`, 'Actions'));
 return chips;
}
export function handoffResult(p) {
 const selected = p.handoff || [];
 const chips = handoffChips(p);
 const missing = [];
 const require = (ok, text) => { if (!ok) missing.push(text); };
 require(selected.includes('observed'), 'Include the bedside findings.');
 if (p.asked.includes('morning')) require(selected.includes('morning') || selected.includes('qualified'), 'Include Walter’s approximately 0600 report with its source.');
 else if (p.asked.includes('overnight')) require(selected.includes('overnight'), 'Include Linda’s overnight account with its limits.');
 else if (p.asked.includes('bedtime')) require(selected.includes('bedtime'), 'Include Linda’s bedtime baseline report.');
 else require(selected.includes('no-baseline'), 'State that last known well was not established from the history obtained.');
 if (p.asked.includes('arm')) require(selected.includes('arm'), 'Include Walter’s estimated symptom-noticing time.');
 if (p.asked.includes('discovery')) require(selected.includes('discovery'), 'Include Linda’s discovery report.');
 else if (p.asked.includes('ems-time')) require(selected.includes('ems-time'), 'Include the discovery clarification from EMS.');
 require(selected.includes('unknown'), 'Communicate that exact onset remains uncertain.');
 const errors = chips.filter(c => selected.includes(c.id) && c.error).map(c => c.error);
 return { accepted: !missing.length && !errors.length, missing, errors };
}
export const historyGaps = p => questions.filter(q => q.essential && !p.asked.includes(q.id));
export function openingResult(p) {
 const a = p.answers.opening || [];
 return a.includes('activate') && !a.some(id => ['wait', 'rest'].includes(id));
}

export function openingGaps(p) {
 const selected = p.answers.opening || [];
 return [
  ['glucose', 'A current glucose check can identify a glucose-related mimic. It runs alongside the response; a reassuring value does not rule out stroke.'],
  ['assess', 'Assess airway, breathing and circulation, and continue focused neurological assessment, vital signs and monitoring while the team responds.'],
  ['npo', 'Keep oral intake on hold until a trained clinician screens swallowing and clears intake under the facility protocol.'],
  ['iv', 'Arrange IV access per protocol while the team evaluates.'],
 ].filter(([id]) => !selected.includes(id)).map(([, text]) => text);
}
