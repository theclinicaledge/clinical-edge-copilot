// Clinical source: founder-approved Authoring Draft v0.2, 2026-10-27.
// Dialogue and findings are fictional authored content. No generated clinical text.
export const VERSION = '0.2-private.1';
export const KEY = 'ce-private-shift10-v02-attempt';
export const report = [
  "Ruth Okonkwo, 76, three days of weakness and loose stools, up for observation. No known allergies, full code.",
  "Hypertension, a little kidney trouble. Vitals stable all afternoon.",
  "She's on IV fluids. Labs look okay, nothing critical.",
  "No isolation. Regular floor bed, 418B.",
  "A little confused at times, fall risk, needs help to the bathroom. She's had pain medication, she's comfortable.",
  "Daughter's with her. Dr. Lin has the orders in. Any questions?",
];
export const questions = [
  { id: 'pending', q: 'Any tests still pending?', a: 'Stool sample went down at 1210. Not back.' },
  { id: 'isolation', q: 'Why no isolation?', a: "It wasn't flagged. She's continent, so nobody brought it up." },
  { id: 'telemetry', q: 'Is telemetry ordered?', a: 'Dr. Lin ordered it, I think. Check the orders.' },
  { id: 'baseline', q: 'How confused? What is her baseline?', a: "Forgot the date, repeated herself once. Daughter says it isn't like her. Triage charted alert and oriented." },
  { id: 'pain', q: 'When was the pain medication given?', a: 'Earlier this afternoon.' },
  { id: 'pain-time', parent: 'pain', q: 'Can you give me the time?', a: '1340, I think.' },
  { id: 'mobility', q: 'Continence and mobility?', a: 'Continent. Steady with a hand, uses the bathroom a lot.' },
  { id: 'other', q: 'Anything else available?', a: "I don't have that." },
];
export const orders = ['Telemetry', 'IV fluids', 'Fall precautions', 'Diet as tolerated', 'PRN pain medication per order', 'Labs in the morning'];
export const chart = [
  { id: 'triage', title: 'Triage note', text: 'Alert and oriented.' },
  { id: 'stool', title: 'Lab list', text: 'Stool test sent 1210. Pending.' },
  { id: 'meds', title: 'ED medication record', text: 'Pain medication entry at 1340. No further medication decision is made in this scene.' },
];
export const rooms = [
  { id: '418B', type: 'Semi-private', monitor: false, ready: 'Assigned · ready now' },
  { id: '422', type: 'Private', monitor: true, ready: 'Ready about 1430' },
  { id: '410', type: 'Private', monitor: false, ready: 'Ready now' },
];
export const paths = {
  A: { room: '422', reply: "422 when it's clean. I'll have EVS push.", feedback: 'Both room gaps were raised before she arrived. The stool result and isolation question still need follow-up.', monitoring: true, private: true },
  B: { room: '422', reply: "422 has telemetry. I'll move you.", feedback: "Your bed change worked for a reason you didn't choose. The room is private, but you never raised isolation. Had 422 been shared, the outcome would differ.", monitoring: true, private: true },
  C: { room: '410', reply: "410's open, private.", feedback: 'Isolation was raised. The monitoring order was not met. Nobody noticed unless you did.', monitoring: false, private: true },
  D: { room: '418B', reply: null, feedback: 'The report said no isolation. The chart said a test was pending. Both were available. In the shared room, a loose stool on the way to the bathroom exposed Mr. Bell. That exposure is not undone.', monitoring: false, private: false },
};
export const assessments = [
  { id: 'wristband', zone: 'Identity', title: 'Check wristband', detail: 'Compare with the fictional chart', finding: 'Wristband matches the name and date of birth in the fictional chart.' },
  { id: 'vitals', zone: 'Observations', title: 'Take vital signs', detail: 'Obtain your own receiving observations', finding: 'BP 120/70 · HR 86 · RR 18 · Temp 98.6°F · SpO₂ 96% on room air.' },
  { id: 'orientation', zone: 'Ruth', title: 'Talk with Ruth', detail: 'Where are you? What day is it? Why did you come?', finding: 'Knows her name and that she is in the hospital. Cannot give the date. “Why am I here?”' },
  { id: 'attention', zone: 'Ruth', title: 'Stay in conversation', detail: 'Give a short, simple task and watch her attention', finding: 'Starts answering, loses the thread. About 90 seconds later: “Why am I here?” again. Her attention drifts.' },
  { id: 'daughter', zone: 'Adaeze', title: 'Ask Adaeze', detail: 'What is her mother usually like?', finding: '“She does the crossword every morning. This isn’t her.”' },
  { id: 'iv', zone: 'At the bedside', title: 'Look at mouth, skin and IV', detail: 'Focused inspection', finding: 'Dry lips. IV site clean. Dry lips are narrative context, not a diagnostic hydration finding.' },
  { id: 'gait', zone: 'At the bedside', title: 'Watch her stand', detail: 'Stay with her as she stands', finding: 'Unsteady. Needs a firm hand.' },
  { id: 'needs', zone: 'Ruth', title: 'Ask what she needs', detail: 'Hear her immediate concern', finding: 'Needs the bathroom now. Cramping. Asks for something for it.' },
];
export const nursing = [
  { id: 'bathroom', text: 'Assist her to the bathroom' },
  { id: 'close', text: 'Stay close or arrange someone to stay close' },
  { id: 'falls', text: 'Put fall precautions in place' },
  { id: 'orient', text: 'Re-orient her and keep Adaeze at the bedside' },
  { id: 'precautions', text: 'Set up contact precautions signage and supplies' },
  { id: 'recheck', text: 'Recheck attention and call back' },
];
export const concerns = { telemetry: 'Monitoring and room', isolation: 'Isolation and placement', confusion: 'Possible mental-status change', pain: 'ED pain entry and time' };
export const ownership = [
  { id: 'stool', text: 'Follow the pending stool result' },
  { id: 'isolation', text: 'Clarify the isolation decision' },
  { id: 'pain', text: 'Review the ED pain record with the orders' },
  { id: 'baseline', text: 'Establish whether the confusion is new' },
  { id: 'bed', text: 'Resolve the monitoring / bed concern' },
  { id: 'recheck', text: 'Recheck attention and communicate findings' },
];
export const owners = ['You, receiving RN', 'Dr. Lin', 'Marisol', 'Infection prevention'];
export const policy = [
  'C-1 · New diarrhea with a pending stool test: private room and contact precautions until resulted or cleared by infection prevention.',
  'C-2 · A telemetry order requires a telemetry-capable room.',
  'C-3 · Marisol, the charge nurse, assigns beds. Dr. Lin does not.',
  'C-4 · Infection prevention can be reached by phone.',
  'C-5 · Room 422 is cleaned and released about 1430.',
];
export const callQuestions = ["What's changed, and what's she like right now?", "What's her usual?", "What have you checked, and where's she at?", 'Anything else I should know? Pain, bowels, the lab?', "What are you doing until I see her, and what's still open?"];
export const leads = [
  ['confusion', "I'm concerned about her confusion."],
  ['bed', "I'm calling about her bed and isolation."],
  ['admission', "I'm calling about a new admission."],
];
export const sources = [
  { id: 'S10-C01–04', title: 'Joint Commission · Sentinel Event Alert 58 (2017)', url: 'https://digitalassets.jointcommission.org/api/public/content/a05e74ef89484e2084b6511189b73a99?v=279f39cc', note: 'Incomplete information can impair handoffs. The alert supports discussion and receiver synthesis; this scene is not a validated I-PASS intervention. C01–03 supported; C04 partly supported in the authoring record.' },
  { id: 'S10-C05', title: 'CDC · Isolation guideline, Appendix A, Table 2', url: 'https://www.cdc.gov/infection-control/hcp/isolation-precautions/appendix-a-table-2.html', note: 'The diarrhea row concerns likely infectious diarrhea in incontinent or diapered patients. It does not by itself establish a rule for continent Ruth. Partly supported in the authoring record.' },
  { id: 'S10-C06–07', title: 'CDC · C. diff prevention in acute care', url: 'https://www.cdc.gov/c-diff/hcp/clinical-guidance/index.html', note: 'Guidance covers suspected or confirmed CDI and symptomatic isolation during evaluation, with receiving-unit communication. Ruth is not diagnosed with CDI. Mercy Point C-1 is a separate fictional rule. C06 partly supported and C07 supported in the authoring record; current page displays May 13, 2026.' },
  { id: 'S10-C08–09', title: 'Jaqua, Nguyen & Chin · American Family Physician (2023)', url: 'https://www.aafp.org/afp/2023/0900/delirium-older-persons', note: 'Changes in attention and cognition merit assessment. Family can supply baseline information; pain, infection and dehydration are possible contributors, not diagnoses assigned here. This article does not establish this fictional notification pathway. C08 supported; C09 partly supported in the authoring record.' },
];
