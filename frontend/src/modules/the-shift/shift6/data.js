// SHIFT-006 v0.4, "The Stable Number". Learner-facing text follows the v0.3 scenario spec, with the
// v0.4 clinical review changes (stronger vital sign trend, no pulse pressure, reworded aspirin chip).
// No independent clinical sign-off yet. Registered only behind the preview gate in feature.js.
// Room 14 vitals live in one table per dataset; every screen derives its values from them.

export const SCENARIO_ID = 'SHIFT-006';
export const VERSION = '0.4';
export const title = 'The Stable Number';

// Keyed by spec source number so a citation can be swapped without touching learner-facing text.
// Spec sources 1 and 6 (OpenStax) were removed; the remaining numbers are unchanged. Source 7 replaces
// Source 1 for debrief bullet 2.
export const SOURCES = {
  2: { citation: 'Hooper N, Armstrong TJ. Hemorrhagic Shock. StatPearls; updated 26 Sep 2022.', url: 'https://www.ncbi.nlm.nih.gov/books/NBK470382/', supports: 'D2, D3, Rewind, debrief bullets 1 and 3' },
  3: { citation: 'Upper Gastrointestinal Bleeding (editor Copelin EL). StatPearls Point-of-Care; updated 17 Aug 2024.', url: 'https://www.statpearls.com/point-of-care/30795', supports: 'D3, D4, Rewind' },
  4: { citation: 'UC Davis PSNet Editorial Team. Rapid Response Systems. AHRQ PSNet; last reviewed 2024.', url: 'https://psnet.ahrq.gov/primer/rapid-response-systems', supports: 'D1, D4' },
  5: { citation: 'Institute for Healthcare Improvement. SBAR Tool: Situation-Background-Assessment-Recommendation.', url: 'https://www.ihi.org/library/tools/sbar-tool-situation-background-assessment-recommendation', supports: 'D5' },
  7: { citation: 'Killeen RB, Kaur A, Afzal M. Acute Anemia. StatPearls; updated 26 Feb 2025.', url: 'https://www.ncbi.nlm.nih.gov/books/NBK537232/', supports: 'debrief bullet 2' },
};

const reading = (time, label, hr, sys, dia, rr, spo2, temp, note) => ({ time, label, hr, sys, dia, rr, spo2, temp, note });

// Main Room 14 table: main script and Rewind A and C. Three phases: stable through 0800, a break at
// 1200 that keeps building through 1600 while each value stays near normal, then a clear slide by 1910.
export const ROOM14_VITALS = [
  reading('y2000', 'Yesterday 2000', 78, 152, 78, 16, 97, '37.0', 'Admission baseline'),
  reading('0800', 'Today 0800', 80, 150, 80, 16, 97, '36.9', ''),
  reading('1200', 'Today 1200', 94, 134, 82, 18, 97, '37.0', '"A little tired"'),
  reading('1600', 'Today 1600', 100, 124, 84, 20, 96, '37.0', '"Anxious about discharge"'),
  reading('1910', 'Today 1910', 116, 108, 80, 24, 96, '37.1', 'Taken by the learner'),
];

// Rewind B flowsheet (Part E). Variation B uses this table everywhere.
export const REWIND_B_VITALS = [
  reading('y2000', 'Yesterday 2000', 78, 152, 78, 16, 97, '37.0', 'Admission baseline'),
  reading('0800', 'Today 0800', 80, 150, 80, 16, 97, '36.9', ''),
  reading('1200', 'Today 1200', 90, 150, 80, 18, 97, '37.0', 'After walking laps'),
  reading('1600', 'Today 1600', 98, 146, 78, 18, 96, '37.0', 'After walking laps'),
  reading('1910', 'Today 1910', 80, 148, 80, 16, 96, '37.1', 'At rest'),
];

// Rewind C differs from the main table only at 1910.
export const REWIND_C_1910 = { hr: 96, sys: 134, dia: 82, rr: 18 };

export const LABS = { drawn: '0500', hgb: '12.1', admissionHgb: '12.4', bun: '16', creatinine: '0.9' };

export const bp = v => `${v.sys}/${v.dia}`;
export const at = (table, time) => table.find(v => v.time === time);
export const baseline = table => table[0];

export const FLOWSHEET_ROWS = [
  { key: 'hr', label: 'HR', value: v => String(v.hr) },
  { key: 'bp', label: 'BP', value: bp },
  { key: 'rr', label: 'RR', value: v => String(v.rr) },
  { key: 'spo2', label: 'SpO2', value: v => `${v.spo2}% RA` },
  { key: 'temp', label: 'Temp', value: v => v.temp },
  { key: 'note', label: 'Note', value: v => v.note },
];

export const FLOWSHEET_SR = {
  main: 'Vital signs for Room 14 from yesterday 2000 to 1910 today. Heart rate rises from 78 to 116. Blood pressure falls from 152 over 78 to 108 over 80. Respiratory rate rises from 16 to 24.',
  b: 'Vital signs for Room 14 from yesterday 2000 to 1910 today. Heart rate rises to 90 and 98 after walking at 1200 and 1600, then returns to 80 at rest. Blood pressure stays between 146 and 152 systolic all day. Respiratory rate stays between 16 and 18.',
};

const room14At1600 = at(ROOM14_VITALS, '1600');

export const assignment = {
  time: '1900',
  intro: 'Night shift, 1900 to 2030, six decisions. All patients, names and places are fictional.',
  patients: [
    { room: '12', name: 'Ana Ruiz, 58', summary: 'Ana Ruiz, 58, post-op day 1 after laparoscopic gallbladder removal', report: '"Easy one. Pain 3 out of 10, walking the halls, wants to shower."', vitals: 'HR 76, BP 124/76, RR 16, SpO2 98% RA' },
    { room: '14', name: 'Dale Hartwell, 71', summary: 'Dale Hartwell, 71, day 2 for left lower leg cellulitis. History of hypertension and knee arthritis. Takes daily aspirin, an over-the-counter anti-inflammatory for his knee, and an iron supplement at home.', report: `"Leg looks way better, probably home tomorrow. His heart rate's been creeping up, but I think he's anxious about discharge and his knee hurts. Hgb was stable this morning, ${LABS.hgb}."`, vitals: `HR ${room14At1600.hr}, BP ${bp(room14At1600)}, RR ${room14At1600.rr}, SpO2 ${room14At1600.spo2}% RA, T ${room14At1600.temp}` },
    { room: '16', name: 'June Pak, 66', summary: 'June Pak, 66, day 3 for COPD exacerbation, on 2 L nasal cannula', report: `"Sats hang around 90. Her provider's goal is 88 to 92, so she's right where she should be."`, vitals: 'HR 88, BP 132/78, RR 18, SpO2 90% on 2 L' },
  ],
};

export const d1 = {
  time: '1905', scene: 'The hallway is quiet. No call lights.',
  prompt: 'Three patients, a quiet hallway. Who do you see first?',
  choices: [
    { id: '14', text: 'Room 14, Mr. Hartwell', result: 'Correct', feedback: 'His is the only report that describes a change over time. "Creeping up" is a trend, and trends get your first look.' },
    { id: 'flowsheets', text: 'Pull up all three flowsheets before moving', result: 'Close', feedback: 'Quick and reasonable. Report already pointed you to the one patient who is changing, though, so go see him and read his trend there.' },
    { id: '16', text: 'Room 16, Mrs. Pak', result: 'Not first', feedback: 'An SpO2 of 90% sits inside the goal her provider set. Stable at goal can wait a few minutes.' },
    { id: '12', text: 'Room 12, Ms. Ruiz', result: 'Not first', feedback: 'Comfortable, walking, asking to shower. Nothing new to chase.' },
  ],
  teaching: 'A change over time outranks a stable number that only looks off.',
  concepts: ['trend-vs-snapshot', 'reassurance-trap'], sources: [4],
};

const room14At1910 = at(ROOM14_VITALS, '1910');

export const d2 = {
  time: '1910',
  scene: `You take his vitals: HR ${room14At1910.hr}, BP ${bp(room14At1910)}, RR ${room14At1910.rr}, SpO2 ${room14At1910.spo2}%, T ${room14At1910.temp}. He says he feels fine, just tired.`,
  prompt: 'Tap the time his pattern started to change.',
  choices: [
    { id: '1200', result: 'Correct', feedback: 'His heart rate jumped 14 beats and his systolic fell 16 points from 0800. Every check since has moved the same direction, and his breathing has sped up too.' },
    { id: '1600', result: 'Close', feedback: 'This is where it got hard to miss. It started one check earlier, at 1200.' },
    { id: '1910', result: 'Not best', feedback: "By now it's obvious. The trend has been building for seven hours." },
    { id: '0800', result: 'No', feedback: '0800 is close to his admission baseline. Nothing had changed yet.' },
  ],
  teaching: 'Normal range is not his normal. He runs about 150 systolic, so 108 is a 44-point drop.',
  concepts: ['trend-vs-snapshot', 'own-baseline'], sources: [2],
};

const notRelevant = 'Good news, and none of it explains his new findings.';
export const d3 = {
  time: '1912', scene: 'Mr. Hartwell in bed, his daughter Renee in the chair.',
  prompt: 'Select the findings that matter most right now.',
  cues: [
    { id: 'skin', label: 'Skin', text: 'pale, hands cool, capillary refill about 3 seconds.', tier: 'Essential', feedback: 'His body is pulling blood away from the skin to protect his core.' },
    { id: 'standing', label: 'Standing', text: '"I got woozy walking to the bathroom around 1830. Had to sit down on the lid."', tier: 'Essential', feedback: "Lightheadedness on standing can mean he's lost enough volume to drop his pressure when upright." },
    { id: 'stool', label: 'Stool', text: '"Went this afternoon. Black and sticky, smelled awful. Figured it was the iron."', tier: 'Essential', feedback: 'Concerning for melena, a sign of upper GI bleeding. The team still needs to confirm it.' },
    { id: 'renee', label: 'Renee', text: `"His stool is always dark. He's been on iron for months."`, tier: 'Supporting', feedback: "Iron can darken stool, and that makes this harder to sort out. It doesn't explain his worsening vitals, near-faint and cool hands, so possible bleeding still needs urgent evaluation." },
    { id: 'abdomen', label: 'Abdomen', text: 'soft, mild ache in the upper belly he calls "hunger pains." No nausea.', tier: 'Supporting', feedback: 'Fits, but is too vague to lean on alone.' },
    { id: 'meds', label: 'Home meds (from the chart)', text: 'daily aspirin, over-the-counter anti-inflammatory most days, iron.', tier: 'Supporting', feedback: 'The aspirin and the anti-inflammatory both raise the risk of an upper GI bleed.' },
    { id: 'mental', label: 'Mental status', text: `alert and oriented, a little slow to answer, says he's "wiped out."`, tier: 'Supporting', feedback: 'Worth tracking. Watch for any further change in mental status.' },
    { id: 'leg', label: 'Left leg', text: 'redness well inside the marked border, less swollen.', tier: 'Not relevant', feedback: notRelevant },
    { id: 'labs', label: 'Morning labs', text: `Hgb ${LABS.hgb}, BUN ${LABS.bun}, creatinine ${LABS.creatinine}. Drawn at ${LABS.drawn}.`, tier: 'Supporting', feedback: `The "stable" Hgb was drawn seven hours before his trend began. It can't speak for now.` },
    { id: 'knee', label: 'Knee pain', text: '4 out of 10, same as yesterday.', tier: 'Not relevant', feedback: notRelevant },
    { id: 'iv', label: 'IV site', text: 'clean and dry.', tier: 'Not relevant', feedback: notRelevant },
  ],
  teaching: 'Before a lab reassures you, check when it was drawn.',
  concepts: ['suspected-upper-gi-bleed', 'reassurance-trap'], sources: [3, 2],
};

export const d4 = {
  time: '1915', prompt: "What's your call?",
  choices: [
    { id: 'escalate', text: "Escalate now: provider to the bedside or rapid response, per your hospital's policy", result: 'Correct', feedback: "Stool concerning for melena, a near-faint, cool hands, and seven hours of rising heart rate, falling blood pressure and faster breathing add up to possible acute blood loss. That needs bedside assessment now, even with a systolic above 90. You don't need to be sure it's a bleed to call. Either route earns full credit if it gets someone there quickly." },
    { id: 'notify', text: 'Notify the provider (non-urgent): page and keep rounding', result: 'No', feedback: "A page that waits in a queue doesn't match these findings." },
    { id: 'hgb', text: 'Get specific information: wait for a repeat hemoglobin before calling', result: 'No (unsafe)', feedback: 'Hgb can look normal early in a GI bleed. Waiting on a lab delays help for a patient already showing signs.' },
    { id: 'orthostatic', text: 'Get specific information: check orthostatic vitals first', result: 'No (unsafe)', feedback: 'Unsafe as your next step. He nearly fainted standing an hour ago, so standing him now risks a fall and delays help. Orthostatics can be fine for a stable patient done safely, just not here and not before the call.' },
    { id: 'continue', text: 'Continue and reassess at the next vitals check', result: 'No (unsafe)', feedback: 'His trend has worsened at every check for seven hours.' },
  ],
  teaching: "Even when a patient doesn't meet your hospital's automatic rapid response thresholds, a concerning pattern and your clinical judgment can justify escalation.",
  whileHelp: "Stay with him and keep him in bed. Recheck his vitals, mental status and perfusion. Make sure his IV is working. Get ready for any ordered tests per your hospital's policy. None of this comes before the call.",
  concepts: ['escalation-level', 'reassurance-trap'], sources: [4, 3],
};

export const d5 = {
  time: '1916', scene: 'The rapid response nurse picks up.',
  prompt: 'Build your SBAR, then pick your recommendation.',
  sections: ['S', 'B', 'A', 'R'],
  chips: [
    { id: 'situation', section: 'S', tier: 'Essential', text: `"Dale Hartwell, 71, Room 14. HR ${room14At1910.hr}, BP ${bp(room14At1910)}. Reports black, sticky stool this afternoon and nearly fainted at 1830."`, feedback: 'Leads with the problem.' },
    { id: 'background', section: 'B', tier: 'Essential', text: '"Day 2 for left leg cellulitis. Hypertensive, usually runs 150s systolic."', feedback: 'Gives the baseline that makes 108 meaningful.' },
    { id: 'home-meds', section: 'B', tier: 'Supporting', text: '"Takes daily aspirin and an over-the-counter anti-inflammatory at home."', feedback: 'Bleeding risk the team will want.' },
    { id: 'assessment', section: 'A', tier: 'Essential', text: `"His heart rate has climbed and his blood pressure has dropped at every check since noon. I'm worried about an acute GI bleed with possible developing hypovolemia. Infection from his leg also needs considering."`, feedback: 'States the trend and your leading concern, and keeps other causes open.' },
    { id: 'lab-timing', section: 'A', tier: 'Supporting', text: `"This morning's Hgb was drawn at ${LABS.drawn}, before the change started."`, feedback: 'Heads off the "Hgb was stable" reply.' },
    { id: 'leg', section: 'B', tier: 'Not relevant', text: '"Leg redness is well inside the border."', feedback: "True, and not why you're calling." },
    { id: 'anxious', section: 'A', tier: 'Not relevant', text: `"He's probably anxious about discharge."`, feedback: "That's the explanation your findings just ruled out." },
    { id: 'aspirin', section: 'R', tier: 'Supporting', text: '"Can you review his aspirin and anti-inflammatory orders when you assess him?"', feedback: "A fair request. Whether any medication changes is the provider's decision, based on why he takes it. It comes after getting him seen." },
  ],
  recommendations: [
    { id: 'bedside', text: `"I need someone at the bedside now. Can we get labs drawn while you're on the way?"`, result: 'Correct', feedback: 'Clear request, clear timeline.' },
    { id: 'orders', text: '"Can you put in some orders when you get a chance?"', result: 'No', feedback: 'Vague, with no urgency.' },
    { id: 'watch', text: '"Should I just keep watching him?"', result: 'No', feedback: "Hands the decision back without saying what you found." },
  ],
  concepts: ['sbar', 'escalation-level'], sources: [5],
};

export const d6 = {
  time: '1935', prompt: "What's your call?",
  scene: [
    "The rapid response team is with Mr. Hartwell. Room 16's light is on.",
    'Mrs. Pak walked to the bathroom 5 minutes ago. SpO2 88% on 2 L, RR 22, talking in full sentences. "Just winded from the walk. This happens every time."',
    'After 3 minutes of rest and pursed-lip breathing: SpO2 90%, RR 18, HR 88.',
  ],
  choices: [
    { id: 'reassess', text: 'Continue and reassess', result: 'Correct', feedback: 'She had a brief change with exertion, then returned to her prescribed target and her report after rest, with no new distress. Keep assessing, and recheck for symptoms that come back or persist.' },
    { id: 'recheck', text: 'Get specific information: recheck in 15 minutes and ask about breathlessness', result: 'Correct', feedback: "Also a sound plan. It's continuing and reassessing, done deliberately." },
    { id: 'notify', text: 'Notify the provider (non-urgent)', result: 'Not best', feedback: "A brief dip with exertion that recovered to goal isn't new. Mention it at the next routine update if your unit does." },
    { id: 'escalate', text: 'Escalate now', result: 'Not best', feedback: 'After rest, her findings match her own baseline and goal. Escalation is for sustained change.' },
  ],
  teaching: 'Same rule, other direction. She matches her own normal, so the plan stands.',
  concepts: ['trend-vs-snapshot', 'escalation-level'], sources: [],
};

export const finalScreen = 'Night challenge complete.';

// Rewind set: Decision 4 replayed three ways.
const rewindFacts = (table, at1910, stool, standing, skin) => {
  const start = at(table, '1600');
  return [
    `Starting vitals (1600): HR ${start.hr}, BP ${bp(start)}`,
    `1910: HR ${at1910.hr}${at1910.atRest ? ' at rest' : ''}, BP ${bp(at1910)}, RR ${at1910.rr}`,
    `Stool: ${stool}`, `Standing: ${standing}`, `Skin: ${skin}`,
    `${d3.cues.find(c => c.id === 'meds').label}: ${d3.cues.find(c => c.id === 'meds').text}`,
    `${d3.cues.find(c => c.id === 'labs').label}: ${d3.cues.find(c => c.id === 'labs').text}`,
  ];
};
const option = (id, title, label, feedback) => ({ id, title, label, feedback });
export const REWIND = {
  version: VERSION,
  intro: 'The Rewind replays Decision 4 with different findings, and the correct call differs each time: Escalate now, Continue and reassess, then Notify the provider. History, home meds and the 0500 labs stay the same in all three.',
  teaching: `Same patient, same "stable" Hgb, three different calls. The findings set the urgency, not the reassuring explanation. And a partial improvement doesn't settle a concern that's still unexplained.`,
  sources: [2, 3, 4],
  variations: [
    { id: 'a', title: 'A: Urgent', flowsheet: 'main', history: `Day nurse's comment: "Creeping up, probably anxious"`,
      facts: rewindFacts(ROOM14_VITALS, room14At1910, 'Black, sticky, foul, this afternoon', 'Nearly fainted at 1830', 'Pale, cool, refill about 3 seconds'),
      question: d4.prompt, focus: 'Correct call: Escalate now',
      options: d4.choices.map(c => option(c.id, c.text, c.result, c.feedback)) },
    { id: 'b', title: 'B: Reassurance holds', flowsheet: 'b', history: `Day nurse's comment: "His HR goes up every time he walks laps with PT, at noon and again before 1600. His pressure's been fine all day."`,
      facts: rewindFacts(REWIND_B_VITALS, { ...at(REWIND_B_VITALS, '1910'), atRest: true }, 'Dark, formed, not sticky. Same since starting iron months ago, and he agrees with Renee.', 'No dizziness', 'Warm, pink'),
      question: d4.prompt, focus: 'Correct call: Continue and reassess',
      options: [
        option('reassess', 'Continue and reassess', 'Correct', "At rest he's back to his own baseline. His pressure held all day, and his heart rate rose only after walking. The activity explanation fits every reading."),
        option('stool', 'Get specific information: ask him to call you before flushing his next stool so you can look', 'Correct', "Cheap and useful. One stool won't settle the question by itself, so keep following his vitals too."),
        option('notify', 'Notify the provider (non-urgent)', 'Close', 'Fine to mention at the next routine update. Nothing here needs a call now.'),
        option('escalate', 'Escalate now', 'Not best', 'His findings match his baseline. Escalation is for change, and his changes have an explanation the recheck supports.'),
      ] },
    { id: 'c', title: 'C: In between', flowsheet: 'main-before-1910', history: `Day nurse's comment: "Creeping up, probably anxious"`,
      facts: rewindFacts(ROOM14_VITALS, REWIND_C_1910, "One dark stool at 1500, already flushed. He can't describe it.", 'Lightheaded once at 1700, passed; none now', 'Warm, pink'),
      question: d4.prompt, focus: 'Correct call: Notify the provider (non-urgent, now, not at end of shift)',
      options: [
        option('notify', 'Notify the provider (non-urgent): call now with the day\'s trend, the dark stool and the lightheaded spell, ask whether they want labs, and recheck vitals in 30 minutes', 'Correct', 'His 1910 numbers are a little better than at 1600, but still well off his baseline. With the earlier slide, an unexplained dark stool and a lightheaded spell, the provider needs to know tonight, and you have a plan to catch any worsening.'),
        option('escalate', 'Escalate now', 'Close', "Not wrong if your concern is high. He doesn't have the near-faint, cool skin and ongoing slide of Variation A."),
        option('recheck', 'Get specific information: recheck in 30 minutes and look at the next stool, then decide', 'Close', 'Useful, but the earlier slide and the unexplained stool already earn a call. Do both.'),
        option('reassess', 'Continue and reassess', 'No', "Partial improvement isn't resolution. His heart rate and pressure are still off his baseline, and the dark stool is unexplained."),
      ] },
  ],
};

export const debrief = {
  outcome: [
    ['1922', 'The rapid response nurse and the hospitalist reach Room 14. You give your SBAR at the bedside.'],
    ['1950', 'His repeat hemoglobin comes back lower than the morning value. The team plans a GI evaluation.'],
    ['2030', 'He moves to a step-down bed for closer monitoring. Mrs. Pak stays at her goal. Ms. Ruiz showers and goes to sleep.'],
  ],
  review: {
    d1: { correct: 'You went to the patient who was changing.', missed: `Room 14 needed you first. 'Creeping up' was a trend.`, concept: 'trend-vs-snapshot' },
    d2: { correct: 'You found where his pattern turned, at 1200.', missed: 'His change started at 1200. Compare each check with his own baseline.', concept: 'own-baseline' },
    d3: { correct: 'You caught the stool, the near-faint and the cool skin.', missed: 'Stool concerning for melena, woozy on standing and cool skin were the findings that mattered.', concept: 'suspected-upper-gi-bleed' },
    d4: { correct: 'You escalated without waiting for a lab.', missed: 'His findings needed someone at the bedside now. A repeat Hgb can wait for the team.', concept: 'escalation-level' },
    d5: { correct: 'Your call led with the trend and asked for what you needed.', missed: 'Lead with the trend, give his baseline, and ask for someone at the bedside.', concept: 'sbar' },
    d6: { correct: 'You recognized a brief exertional change, confirmed she recovered to her prescribed target, and kept monitoring.', missed: "Mrs. Pak's dip was brief, and she recovered to her prescribed target at rest. Escalation is for sustained change.", concept: 'escalation-level' },
  },
  takeaways: [
    'A reassuring number from earlier cannot explain away the trend in front of you.',
    'Compare him with his own normal, and check when a lab was drawn before you let it reassure you.',
  ],
  why: [
    ['Early in blood loss, the body speeds up the heart and tightens the vessels. Heart rate climbs and breathing quickens, while blood pressure can still look acceptable on paper.', 2],
    ['In sudden blood loss, hemoglobin can look normal at first because red cells and plasma are lost together. The drop shows up later as fluid shifts back into the blood.', 7],
    ['Someone who usually runs high can be functionally hypotensive at a systolic that looks normal.', 2],
  ],
  ask: 'Why can hemoglobin look normal early in a GI bleed?',
  share: "His numbers looked fine. His trend didn't.",
  tomorrow: 'Want another shift tomorrow?',
};

export const card = {
  coreLesson: 'A reassuring number from earlier cannot explain away the trend in front of you.',
  objectives: [
    "Compare vital signs with the patient's own baseline, not only with normal ranges.",
    'Recognize a rising heart rate, falling blood pressure from his own baseline and quickening breathing as early signs of blood loss.',
    'Check when a reassuring lab was drawn before using it to explain a new change.',
    'Match the escalation level to the findings, without waiting for diagnostic certainty, and keep the plan when nothing has changed.',
    'Give an SBAR that states the trend and makes a clear request.',
  ],
  concepts: ['trend-vs-snapshot', 'own-baseline', 'suspected-upper-gi-bleed', 'reassurance-trap', 'escalation-level', 'sbar'],
  judgmentSteps: [
    { decision: 'D1', steps: ['Prioritize hypotheses'] }, { decision: 'D2', steps: ['Recognize cues'] },
    { decision: 'D3', steps: ['Recognize cues', 'Analyze cues'] }, { decision: 'D4', steps: ['Take action'] },
    { decision: 'D5', steps: ['Take action'] }, { decision: 'D6', steps: ['Evaluate outcomes'] },
  ],
  twist: `The "stable" hemoglobin was drawn at 0500, seven hours before the trend began, and his "normal" BP of 108 systolic is 44 points below his own baseline.`,
  specialty: 'Med-Surg', learnerLevel: 'Student and new grad', estimatedTime: '6 minutes', decisionCount: 6,
  reviewStatus: 'Clinical sign-off not yet recorded', contentReviewDate: 'Pending',
};

// Open content-validation items (not learner-facing).
export const OPEN_ITEMS = [
  'Founder review and independent clinical sign-off have not been recorded. Shift 06 stays behind the preview flag until they are.',
  'D6 (Room 16) has no source since OpenStax Source 6 was removed.',
  'Estimated time is 6 minutes. If playtesting runs long, D1 may be cut later.',
];
