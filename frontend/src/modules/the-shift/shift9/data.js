// SHIFT-009 v0.7, "The Quiet Complaint". Learner-facing text follows the v0.7 scenario spec word for word.
// Review status Draft: founder review, independent clinical sign-off and psych specialty review are not recorded.
// Each patient's vitals live in one table, and each strip lives in one table with the screens it belongs to,
// so screens derive their values instead of repeating them.

export const SCENARIO_ID = 'SHIFT-009';
export const VERSION = '0.7';
export const title = 'The Quiet Complaint';

// Keyed by spec source number so a citation can be swapped without touching learner-facing text.
export const SOURCES = {
  1: { citation: 'Rout P, editor. Inferior Myocardial Infarction. StatPearls Point-of-Care; updated 7 Nov 2025.', url: 'https://www.statpearls.com/point-of-care/23500', type: 'Peer-reviewed review', supports: 'D1, D2, D3, Debrief bullets 1 and 2' },
  2: { citation: 'Akbar H, Sharma S. Acute ST-Segment Elevation Myocardial Infarction (STEMI). StatPearls; updated 6 Oct 2024.', url: 'https://www.ncbi.nlm.nih.gov/books/NBK532281/', type: 'Peer-reviewed review', supports: 'D2, D3, Debrief bullet 2' },
  3: { citation: 'Gulati M, Levy PD, Mukherjee D, et al. 2021 AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR Guideline for the Evaluation and Diagnosis of Chest Pain. J Am Coll Cardiol. 2021. Opened via ACC Ten Points to Remember.', url: 'https://acc.org/latest-in-cardiology/ten-points-to-remember/2021/10/27/14/06/2021-guideline-for-chest-pain-gl_chestpain', type: 'Guideline (2021), via ACC summary', supports: 'D1, D2, Debrief bullet 1' },
  4: { citation: 'Mehta LS, Beckie TM, DeVon HA, et al. Acute Myocardial Infarction in Women: A Scientific Statement From the AHA. Circulation. 2016. Opened via ACC Ten Points to Remember.', url: 'https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2016/01/26/15/08/Acute-Myocardial-Infarction-in-Women', type: 'Scientific statement (2016), via ACC summary', supports: 'D2, Debrief bullet 1' },
  5: { citation: 'Sandau KE, Funk M, Auerbach A, et al. Update to Practice Standards for Electrocardiographic Monitoring in Hospital Settings: A Scientific Statement From the AHA. Circulation. 2017. Opened via ACC Ten Points to Remember.', url: 'https://acc.org/latest-in-cardiology/ten-points-to-remember/2017/10/04/12/26/update-to-practice-standards-for-electrocardiographic-monitoring', type: 'Scientific statement (2017), via ACC summary', supports: 'D2, D5' },
  6: { citation: 'Drew BJ, Harris P, Zègre-Hemsey JK, et al. Insights into the Problem of Alarm Fatigue with Physiologic Monitor Devices. PLoS One. 2014;9(10):e110274.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4206416', type: 'Peer-reviewed study', supports: 'D1, Debrief bullet 3' },
  7: { citation: 'American Nurses Association, National Council of State Boards of Nursing. National Guidelines for Nursing Delegation. Effective 1 Apr 2019.', url: 'https://www.nursingworld.org/globalassets/practiceandpolicy/nursing-excellence/ana-position-statements/nursing-practice/ana-ncsbn-joint-statement-on-delegation.pdf', type: 'Professional society', supports: 'D1' },
  8: { citation: 'Richmond JS, Berlin JS, Fishkind AB, et al. Verbal De-escalation of the Agitated Patient: Consensus Statement of the AAEP Project BETA De-escalation Workgroup. West J Emerg Med. 2012;13(1):17-25.', url: 'https://www.health.mn.gov/facilities/patientsafety/preventionofviolence/docs/verbdeescalagitatedpatientarticle.pdf', type: 'Peer-reviewed consensus', supports: 'D1, D4' },
  9: { citation: 'Nordstrom K, Zun LS, Wilson MP, et al. Medical Evaluation and Triage of the Agitated Patient: Consensus Statement of the AAEP Project BETA Medical Evaluation Workgroup. West J Emerg Med. 2012;13(1):3-10.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3298208', type: 'Peer-reviewed consensus', supports: 'D4' },
  10: { citation: 'Holder S, Amin P. Atrial Fibrillation: Common Questions and Answers About Diagnosis and Treatment. Am Fam Physician. 2024;109(5):398-404.', url: 'https://www.aafp.org/afp/2024/0500/atrial-fibrillation', type: 'Peer-reviewed review', supports: 'D5, Rewind' },
  11: { citation: 'Mitchell LB. Atrial Fibrillation. Merck Manual Professional Version; fully reviewed Sep 2024, peer reviewed by Howlett JG.', url: 'https://www.merckmanuals.com/professional/cardiovascular-disorders/arrhythmias-and-conduction-disorders/atrial-fibrillation', type: 'Professional reference', supports: 'D5, Rewind, rhythm notes' },
  12: { citation: 'American Heart Association. Adult Tachyarrhythmia With a Pulse Algorithm. 2025 Guidelines for CPR and ECC.', url: 'https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Tachyarrhythmia-LngDscrp-250726-Ed.pdf?sc_lang=en', type: 'Guideline (2025)', supports: 'D5, Rewind B' },
  13: { citation: 'UC Davis PSNet Editorial Team. Rapid Response Systems. AHRQ PSNet; last reviewed 2024.', url: 'https://psnet.ahrq.gov/primer/rapid-response-systems', type: 'Government source', supports: 'D2' },
  14: { citation: "Rao SV, O'Donoghue ML, Ruel M, et al. 2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes. J Am Coll Cardiol. 2025. doi:10.1016/j.jacc.2024.11.009. Opened via a hosted copy (sections 1 to 4.3).", url: 'https://www.hendrickhealth.org/documents/content/2025-ACC-AHA-Guideline-for-Management-of-ACS.pdf', type: 'Guideline (2025)', supports: 'D2, D3, Debrief bullet 1' },
  15: { citation: 'Barstow C, Shahan B, Roberts M. Evaluating Medical Decision-Making Capacity in Practice. Am Fam Physician. 2018;98(1):40-46.', url: 'https://www.aafp.org/afp/2018/0701/p40.html', type: 'Peer-reviewed review (free access)', supports: 'D4 capacity panel' },
  16: { citation: "Sorrentino R. Performing capacity evaluations: what's expected from your consult. Current Psychiatry. 2014;13(1):41-44.", url: 'https://cdn.mdedge.com/files/s3fs-public/Document/September-2017/041_0114CP_Sorrentino_FINAL.pdf', type: 'Peer-reviewed clinical review (free access)', supports: 'D4 capacity panel' },
};

// The nine delivered illustrations, unchanged. `screens` is the Part E mapping, plus D1 for the Room 22 and 23
// starting strips (founder request, 24 Oct 2026: show all three patients' strips on D1); `alt` is the Part E
// screen-reader text. `caption` carries only room, lead and time, so decision screens never name a rhythm.
const asset = file => new URL(`./assets/${file}`, import.meta.url).href;
export const STRIPS = {
  'rm21-1430': { file: 'rm21_1430_sinus84.png', src: asset('rm21_1430_sinus84.png'), room: '21', time: '1430', rate: 84, caption: 'Room 21, lead II, 1430', screens: ['assignment'],
    alt: 'Room 21, lead II, 1430. Regular rhythm at 84 with a P wave before every QRS. Sinus rhythm.' },
  'rm21-1505': { file: 'rm21_1505_artifact_leadsoff.png', src: asset('rm21_1505_artifact_leadsoff.png'), room: '21', time: '1505', rate: null, caption: 'Room 21, lead II, 1505', screens: ['d1'],
    alt: 'Room 21, lead II, 1505. Regular beats under heavy wavy artifact for about three seconds, then a flat line with a LEADS OFF message. The monitor has lost the signal. This is not asystole.' },
  'rm22-1430': { file: 'rm22_1430_sinus88.png', src: asset('rm22_1430_sinus88.png'), room: '22', time: '1430', rate: 88, caption: 'Room 22, lead II, 1430', screens: ['assignment', 'd1', 'd2'],
    alt: 'Room 22, lead II, 1430. Sinus rhythm at 88. The ST segment sits on the baseline.' },
  'rm22-1508': { file: 'rm22_1508_sinus94_ste.png', src: asset('rm22_1508_sinus94_ste.png'), room: '22', time: '1508', rate: 94, caption: 'Room 22, lead II, 1508', screens: ['d2'],
    alt: 'Room 22, lead II, 1508. Sinus rhythm at 94. The ST segment is raised about 2 millimeters and runs into a tall T wave.' },
  'rm22-1513-12lead': { file: 'rm22_1513_12lead_inferior_stemi.png', src: asset('rm22_1513_12lead_inferior_stemi.png'), room: '22', time: '1513', rate: 94, caption: 'Room 22, 12-lead ECG, 1513', screens: ['d3'], twelveLead: true,
    alt: 'Room 22, 12-lead ECG, 1513. Sinus rhythm at 94. ST elevation of about 2 to 3 millimeters in leads II, III and aVF. ST depression in leads I and aVL. The chest leads show no ST elevation.' },
  'rm23-1430': { file: 'rm23_1430_afib110.png', src: asset('rm23_1430_afib110.png'), room: '23', time: '1430', rate: 110, caption: 'Room 23, lead II, 1430', screens: ['assignment', 'd1'],
    alt: 'Room 23, lead II, 1430. Irregularly irregular rhythm with no P waves and a wavy baseline. 11 QRS complexes in 6 seconds, about 110. Atrial fibrillation.' },
  'rm23-1535-a': { file: 'rm23_1535_afib110_rewindA.png', src: asset('rm23_1535_afib110_rewindA.png'), room: '23', time: '1535', rate: 110, caption: 'Room 23, lead II, 1535', screens: ['d5', 'rewind-a'],
    alt: 'Room 23, lead II, 1535. Irregularly irregular rhythm with no P waves. 11 QRS complexes in 6 seconds, about 110.' },
  'rm23-1535-b': { file: 'rm23_rewindB_afib150.png', src: asset('rm23_rewindB_afib150.png'), room: '23', time: '1535', rate: 150, caption: 'Room 23, lead II, 1535', screens: ['rewind-b'],
    alt: 'Room 23, lead II, 1535, Rewind B. Irregularly irregular rhythm with no P waves. 15 QRS complexes in 6 seconds, about 150.' },
  'rm23-1535-c': { file: 'rm23_rewindC_afib130.png', src: asset('rm23_rewindC_afib130.png'), room: '23', time: '1535', rate: 130, caption: 'Room 23, lead II, 1535', screens: ['rewind-c'],
    alt: 'Room 23, lead II, 1535, Rewind C. Irregularly irregular rhythm with no P waves. 13 QRS complexes in 6 seconds, about 130.' },
};
export const stripsFor = screen => Object.entries(STRIPS).filter(([, strip]) => strip.screens.includes(screen)).map(([id]) => id);

// One vitals table per patient. `hr` is a number; `hrText` keeps the spec's wording where it says "about".
const vitals = (time, hr, sys, dia, rr, spo2, o2, hrText) => ({ time, hr, sys, dia, rr, spo2, o2, hrText: hrText ?? String(hr) });
export const VITALS = {
  21: [vitals('1430', 84, 138, 86, 16, 98, 'RA')],
  22: [vitals('1430', 88, 132, 74, 18, 95, 'on 2 L'), vitals('1508', 94, 106, 62, 22, 93, 'on 2 L')],
  23: [vitals('1430', 110, 128, 76, 16, 97, 'RA', 'about 110'), vitals('1530', 110, 126, 78, 16, 97, 'RA')],
};
export const ROOM22_GLUCOSE = { time: '1500', value: 164 };
export const bp = v => `${v.sys}/${v.dia}`;
export const vitalsAt = (room, time) => VITALS[room].find(v => v.time === time);
export const vitalsLine = v => `HR ${v.hrText}, BP ${bp(v)}, RR ${v.rr}, SpO2 ${v.spo2}% ${v.o2}`;
const r22then = vitalsAt(22, '1430'), r22now = vitalsAt(22, '1508'), r23at1530 = vitalsAt(23, '1530');

export const team = 'You (RN). Tess, charge nurse (RN). Marco, CNA. Lena, monitor tech. The rapid response team, plus the behavioral response team and security per your hospital\'s policy.';

export const assignment = {
  time: '1500',
  intro: 'Afternoon shift, 1500 to 1600, telemetry unit, five decisions. All patients, staff, names and places are fictional.',
  rhythmNotes: 'Sinus rhythm has a P wave before every QRS and regular spacing. AFib typically has irregularly irregular spacing without distinct P waves. Fibrillatory waves may be visible along the baseline, but they aren\'t always clear in every lead. To estimate an irregular rate, count the QRS complexes in 6 seconds and multiply by 10.',
  patients: [
    { room: '21', name: 'Curtis Reed, 52', strip: 'rm21-1430', rhythm: 'Sinus rhythm.',
      summary: 'Curtis Reed, 52, day 2 of a syncope workup after he fainted at a bus stop. History of schizophrenia. Stopped his antipsychotic two weeks ago.',
      report: '"He\'s been suspicious all day, keeps asking who watches the monitor. Quiet, though, and his vitals are fine."' },
    { room: '22', name: 'Dolores Vega, 76', strip: 'rm22-1430', rhythm: 'Sinus rhythm, ST at baseline.',
      summary: 'Dolores Vega, 76, day 2 for a heart failure flare. Type 2 diabetes and hypertension. On 2 L nasal cannula.',
      report: '"She\'s doing better, breathing\'s easier. Had some reflux after lunch and the antacid helped. Bath at 1400, so her leads got moved around."' },
    { room: '23', name: 'Ray Lindqvist, 68', strip: 'rm23-1430', rhythm: 'Atrial fibrillation.',
      summary: 'Ray Lindqvist, 68, admitted this morning for palpitations. New AFib found at 0800.',
      report: '"AFib\'s been 100s to 110s all day, no symptoms. Provider knows. Rate-control plan is in, recheck at 1600. Call if he stays above 130."' },
  ].map(patient => ({ ...patient, vitals: `${vitalsLine(vitalsAt(patient.room, '1430'))}. ${patient.rhythm}` })),
};

// D1 tokens and targets. Rules follow the spec table; `when` reads a placement { you, tess, marco }.
export const TOKENS = [
  { id: 'you', label: 'You', role: 'RN' },
  { id: 'tess', label: 'Tess (charge RN)', role: 'RN' },
  { id: 'marco', label: 'Marco (CNA)', role: 'CNA' },
];
export const TARGETS = [
  { id: '21', label: 'Room 21' },
  { id: '22', label: 'Room 22' },
  { id: '23', label: 'Room 23' },
  { id: 'station', label: 'Stay at the station' },
];

export const d1 = {
  time: '1505', title: 'Three at once',
  board: [
    ['Room 21', 'the monitor shows LEADS OFF. From the hall you hear Curtis yelling, "Get this thing off me! It\'s sending my thoughts out!"'],
    ['Room 22', 'her call light is on. Dolores, over the intercom: "Could someone bring me something for my indigestion?"'],
    ['Lena, the monitor tech, calls', '"Hey, 22\'s ST in lead II is higher than this morning. Probably her leads after the bath, but I wanted you to know."'],
    ['Room 23', 'AFib 104 to 116 on the monitor, no alarms.'],
    ['Staff', 'Tess is at the station. Marco is finishing a bed change.'],
  ],
  strip: 'rm21-1505',
  // All three patients' strips, by room. Rooms 22 and 23 show their 1430 starting strips; only Room 21 has a 1505 strip.
  strips: ['rm21-1505', 'rm22-1430', 'rm23-1430'],
  lookCloser: 'Sinus beats march right through the wavy artifact, then the signal stops. LEADS OFF means the monitor can\'t see him. It isn\'t asystole, but it does mean he isn\'t being monitored right now. He\'s yelling, so he\'s awake and breathing. Someone needs eyes on him now, and his leads back on or another way to watch him as soon as it\'s safe.',
  prompt: 'Place yourself, Tess and Marco. Then submit.',
  rules: [
    { id: 'rn22', text: 'An RN (you or Tess) goes to Room 22 now', result: 'Correct',
      feedback: 'New "indigestion" with an ST change must be evaluated as possible cardiac ischemia. Either RN can take her, as long as she\'s assessed now and escalated fast. You know her baseline; Tess is often better placed to lead the behavioral response. Decide together.' },
    { id: 'noRn22', text: 'No RN goes to Room 22 (Marco brings an antacid, or both RNs go to 21)', result: 'No (unsafe)',
      feedback: 'A CNA can\'t assess a new cardiac symptom, and an antacid could delay evaluation of a possible ACS. Room 22 needs an RN now.' },
    { id: 'rn21', text: 'The other RN goes to Room 21 and calls the behavioral team per policy', result: 'Correct',
      feedback: 'A frightened, agitated patient needs an experienced lead. His leads are off, so that RN also watches how he looks and breathes, and calls the provider about the lost monitoring.' },
    { id: 'marcoAlone21', text: 'Marco goes to Room 21 alone', result: 'No',
      feedback: 'Don\'t send a CNA alone into a room with an agitated patient. An RN or the behavioral team leads, and Marco backs them up.' },
    { id: 'marco23', text: 'Marco takes vitals on Room 23', result: 'Correct',
      feedback: 'Ray is stable with a plan, so his vitals are a good CNA task.' },
    { id: 'marcoBackup21', text: 'Marco backs up the RN at Room 21', result: 'Correct',
      feedback: 'Also sound, if Marco gives non-confrontational help under RN direction, like staying by the door or getting more help. He doesn\'t assess or talk Curtis down himself. Ray is stable, and his vitals can wait a few minutes.' },
    { id: 'noOne21', text: 'No one goes to Room 21', result: 'No',
      feedback: 'His leads are off, so the monitor can\'t watch him for you. Someone needs eyes on him.' },
  ],
  scoring: 'Full credit for one RN in Room 22, the other RN in Room 21, and Marco in Room 23 or backing up at 21. It doesn\'t matter which RN takes which room. No credit if no RN reaches Room 22, if Marco is alone in 21, or if no one goes to 21.',
  fullCredit: 'Full credit for one RN in Room 22, the other RN in Room 21, and Marco in Room 23 or backing up at 21. It doesn\'t matter which RN takes which room.',
  next: {
    heading: 'What happens next',
    paths: { a: 'Path A: you in 22, Tess in 21', b: 'Path B: Tess in 22, you in 21' },
    rows: [
      ['1506', 'Tess calls the provider: Curtis is off telemetry. Interim plan: an RN keeps him in line of sight and reassesses him often until monitoring is back.', 'You call the provider with the same message and the same interim plan.'],
      ['1507', 'The behavioral response nurse arrives at Room 21 to join Tess.', 'The behavioral response nurse arrives and takes over watching Curtis from the doorway. You hand off what you\'ve seen.'],
      ['1508', 'You\'re at Dolores\'s bedside.', 'Tess: "She\'s your patient. Come look at this." You join her in Room 22. Tess goes back to Room 21 once Joy, the rapid response nurse, arrives at 1513.'],
    ],
    after: 'From D2 on, both paths play the same scenes. Room 21 never goes unwatched.',
  },
  teaching: 'The loudest room isn\'t always the sickest. A quiet call light with an ST change outranks a patient who is yelling.',
  concepts: ['prioritize-by-findings', 'delegation'],
  sources: [
    [6, 'in one ICU study, 88.8% of sampled arrhythmia alarms were false positives, from causes including algorithms, patient rhythms and occasional electrode problems'],
    [7, 'delegate only stable, predictable care; assessment and clinical reasoning stay with the RN'],
    [8, 'agitation is a team effort'],
    [1, 'heart attack symptoms can include nausea and upper abdominal discomfort'],
    [3, 'heart attack symptoms can include nausea and upper abdominal discomfort'],
  ],
};

export const d2 = {
  time: '1508', title: 'Room 22 then and now',
  scene: 'Dolores is sitting up, pale and a little sweaty, with a hand on her upper belly. "It\'s just my indigestion again. The antacid worked at lunch." Her 1430 and 1508 lead II strips sit side by side.',
  strips: ['rm22-1430', 'rm22-1508'],
  steps: [
    ['rate', 'Rate and rhythm', `Sinus, ${r22then.hr}`, `Sinus, ${r22now.hr}`],
    ['st', 'ST segment, lead II', 'At baseline', 'Raised about 2 mm'],
    ['electrodes', 'Electrodes', 'Moved during the 1400 bath', 'You check: all in the right spots'],
    ['bp', 'BP', bp(r22then), bp(r22now)],
    ['rrspo2', 'RR, SpO2', `${r22then.rr}, ${r22then.spo2}% ${r22then.o2}`, `${r22now.rr}, ${r22now.spo2}% ${r22now.o2}`],
    ['symptoms', 'Symptoms', 'None', 'Upper belly burning since about 1440, nausea, sweating, "more tired than this morning." Denies chest pain.'],
    ['glucose', 'Glucose', 'Not checked', `${ROOM22_GLUCOSE.value} at ${ROOM22_GLUCOSE.time}, so low blood sugar doesn't explain the sweating`],
  ],
  prompt: 'What\'s your call?',
  choices: [
    { id: 'escalate', text: 'Escalate now: get a stat 12-lead and call rapid response, or your hospital\'s chest pain or STEMI response, per policy', result: 'Correct',
      feedback: `New ST elevation, a ${r22then.sys - r22now.sys}-point drop in systolic pressure, sweating and nausea in a 76-year-old with diabetes add up to a possible heart attack. Don't wait for her to call it chest pain.` },
    { id: 'ecg-first', text: 'Get specific information: stat 12-lead first, then call based on what it shows', result: 'Close',
      feedback: 'The 12-lead is right, and it\'s fast. With her pressure down and new symptoms, though, call while it\'s being done, not after.' },
    { id: 'page', text: 'Notify the provider (non-urgent): page with her symptoms', result: 'No',
      feedback: 'A page that waits in a queue doesn\'t match these findings.' },
    { id: 'antacid', text: 'Give the antacid she asked for and recheck in 30 minutes', result: 'No (unsafe)',
      feedback: 'Treating this as reflux could delay evaluation of a possible ACS. Her electrodes are in the right spots, which makes lead placement a less likely explanation. The 12-lead will tell you more.' },
    { id: 'watch', text: 'Ask Lena to keep watching and call if it gets worse', result: 'No (unsafe)',
      feedback: 'She\'s already worse than at 1430. Watching longer isn\'t a plan.' },
  ],
  teaching: 'Chest discomfort is common in heart attacks for women and men, but ischemia can also show up as upper abdominal discomfort, nausea, sweating or fatigue, sometimes without chest pain.',
  concepts: ['anginal-equivalents', 'prioritize-by-findings'],
  sources: [
    [1, 'nausea, epigastric pain and fatigue; atypical symptoms more common in women, older adults and people with diabetes'],
    [3, 'symptoms can sit in the upper abdomen or jaw; women more often have nausea and shortness of breath'],
    [4, 'women more often report associated symptoms'],
    [2, 'acquire and read the 12-lead within 10 minutes'],
    [14, 'acquire and read the 12-lead within 10 minutes'],
    [5, 'electrode placement matters'],
    [13, 'staff concern alone is enough to call rapid response'],
  ],
};

export const d3 = {
  time: '1513', title: 'Read the 12-lead',
  scene: 'Joy, the rapid response nurse, walks in as the 12-lead prints.',
  strip: 'rm22-1513-12lead',
  prompt: 'What does this 12-lead show, and what\'s next?',
  choices: [
    { id: 'inferior', text: 'ST elevation in II, III and aVF, with ST depression in I and aVL. Start your hospital\'s STEMI escalation pathway and stay with her.', result: 'Correct',
      feedback: 'II, III and aVF look at the bottom (inferior wall) of the heart. ST elevation in two or more neighboring leads, with mirror-image depression in I and aVL, is a STEMI pattern. You don\'t diagnose it. You recognize it and get the team moving.' },
    { id: 'anterior', text: 'ST elevation in V1 to V4. Start the STEMI escalation pathway.', result: 'Close',
      feedback: 'Safe action, wrong leads. The elevation is in II, III and aVF, and V1 to V4 don\'t show diagnostic ST elevation. Look again at which leads sit together.' },
    { id: 'repeat', text: 'ST elevation in II, III and aVF. Notify the provider and repeat the 12-lead in 30 minutes.', result: 'No (unsafe)',
      feedback: 'A STEMI is time-critical. Repeating the ECG later delays the team.' },
    { id: 'placement', text: 'No acute changes. Probably lead placement after her bath.', result: 'No (unsafe)',
      feedback: 'Correct electrode positions make lead placement less likely, and the 12-lead shows a pattern across neighboring leads, not one odd lead.' },
  ],
  whileTeamWorks: 'Stay with her and keep her in bed. Keep her on the monitor and recheck her vitals and how she feels. Make sure her IV works and the crash cart is close, per policy. Give Joy a quick SBAR: her baseline at 1430, the change at 1508, and the 12-lead. Hand Rooms 21 and 23 to Tess while you stay.',
  teachingNote: 'With a suspected inferior STEMI, the team may ask for right-sided leads, such as V4R, to check for right ventricular involvement. Who records them varies, so follow your hospital\'s process.',
  teaching: 'Find the leads that match. ST elevation in II, III and aVF points to the inferior wall.',
  concepts: ['stemi-recognition'],
  sources: [
    [2, 'ST elevation at the J point in 2 contiguous leads, above 0.1 mV outside V2 and V3; ECG immediately and read within 10 minutes; door-to-balloon goal under 90 minutes'],
    [1, 'reciprocal ST depression in I and aVL with inferior MI'],
    [14, 'in-hospital ECG within 10 minutes; right-sided leads when inferior STEMI is a concern'],
  ],
};

// Therapeutic response tiers (best, acceptable, harmful) mapped onto the spec's result labels.
export const d4 = {
  time: '1525', title: 'Room 21',
  scene: [
    'The STEMI team is with Dolores, getting her ready for the cath lab. An RN or the behavioral response nurse has kept eyes on Curtis since 1505, and the provider has known he\'s off telemetry since 1506. Tess is at the doorway with the behavioral response nurse. Security waits nearby, out of his direct line of sight, per policy.',
    'Curtis is pacing by the window with the monitor box in his hand and the leads hanging. He isn\'t threatening anyone, and both he and staff have a clear path to the door. From the doorway, Tess reports he\'s pink, breathing easily, steady on his feet and talking in full sentences. Tess: "He\'s asking for his nurse."',
  ],
  quote: 'Curtis: "That box sends my thoughts to the government. I know you\'re all in on it."',
  prompt: 'You stand two arm\'s lengths away, near the open door. You\'re the only one talking. What do you say first?',
  choices: [
    { id: 'choice', tier: 'best', text: '"It sounds like that box is scaring you. Do you want to set it on the table while we talk? Then we\'ll decide together what to do about the monitor."', result: 'Correct',
      feedback: 'You respond to the fear without contradicting him, and a real choice gives him back some control. He\'s off the monitor, so this starts the plan; it doesn\'t finish it.' },
    { id: 'explain', tier: 'acceptable', text: '"Curtis, I\'m your nurse. That sounds really frightening. The monitor sends information about your heart rhythm to the healthcare team so we can respond if something changes. Can we sit down and talk about what would help?"', result: 'Correct',
      feedback: 'Also sound. A short, truthful explanation, said once without arguing, can help. The choice response is the preferred example because it\'s less likely to sound like a correction to someone with persecutory beliefs.' },
    { id: 'argue', tier: 'harmful', text: '"Nobody can read your thoughts. That\'s your illness talking. Put it back on."', result: 'No',
      feedback: 'Arguing with a delusion and giving orders usually makes things worse.' },
    { id: 'agree', tier: 'harmful', text: '"Okay, I\'ll make sure the government can\'t hear anything."', result: 'No',
      feedback: 'Agreeing with the delusion isn\'t honest and can reinforce it. You can accept that he\'s having the experience without saying it\'s true.' },
    { id: 'threat', tier: 'harmful', text: '"If you don\'t put it back on, security will hold you down."', result: 'No (unsafe)',
      feedback: 'Threats raise agitation and put him and staff at risk. Restraint is a last resort that needs clear clinical and legal justification under your hospital\'s policy. Restoring telemetry alone doesn\'t justify it, and it\'s never a bargaining chip.' },
  ],
  scoring: 'Either calm, nonconfrontational response earns full credit. The choice response is the preferred example.',
  rightAway: {
    heading: 'Right away, while de-escalation continues',
    intro: 'He\'s a syncope patient with no monitoring, so the safety plan can\'t wait for him to calm down. Watching him is not the same as telemetry: an observer can\'t catch an arrhythmia. Treat the gap as an ongoing risk, and keep reassessing until he\'s back on the monitor.',
    items: [
      'Keep a staff member watching him in person, within line of sight, until monitoring is back. Tell him why, and revisit the plan with him as he calms.',
      'Every few minutes, check his color, breathing and alertness from where you stand.',
      'Update the provider, who has known since 1506, and confirm the plan to get him back on the monitor or use another form of monitoring per policy. If he still declines, report it as a refusal.',
      'Get vitals and a glucose as soon as he allows it.',
      'Think medical as well as psychiatric. New or different agitation can come from low blood sugar or low oxygen, even in someone with schizophrenia. Then ask about a psychiatry consult per policy.',
    ],
  },
  capacity: {
    heading: 'Capacity and the right to refuse',
    intro: 'Curtis can say no to telemetry. Schizophrenia, active delusions and stopping his medication don\'t by themselves mean he can\'t make this decision. Presume he has capacity unless an assessment shows otherwise.',
    items: [
      ['Decision-specific:', 'His fear is about the monitor itself, so the question is narrow. Can he understand the risk of going without telemetry during a syncope workup, appreciate that it applies to him, weigh it, and tell you his choice?'],
      ['Your part:', 'Explain the risk once, calmly, without arguing: "The monitor watches for heart rhythm changes that could explain your fainting. Without it, we could miss one." Listen to his answer and document what he says.'],
      ['Notify the provider', 'of the refusal. If decision-making capacity is uncertain, notify the treating provider for assessment. Psychiatry may be consulted when indicated, according to facility policy.'],
      ['If he has capacity and still refuses,', 'respect his decision. Work with him and the provider on an alternative safety plan he agrees to, such as observation, reassessment and standing offers to reconnect.'],
      ['No coercion or restraint just to restore telemetry.', 'That needs clear clinical and legal justification under your hospital\'s policy.'],
    ],
  },
  teaching: 'Don\'t argue with a delusion and don\'t agree with it. Respond to the feeling, keep it short, and offer a choice.',
  concepts: ['verbal-deescalation'],
  sources: [
    [8, 'two arm\'s lengths, a clear exit, one person talks, be concise, agree or agree to disagree, offer choices, restraint as a last resort'],
    [9, 'agitation can come from a medical cause; suspect one when a known psychiatric illness presents differently'],
    [15, 'capacity is decision-specific; understand, appreciate, reason, communicate; a refusal is honored when those are present; the treating physician makes the determination'],
    [16, 'adults are presumed to have capacity; a mental disorder doesn\'t by itself make a person incapable; decisions should be free of coercion'],
  ],
};

export const d5 = {
  time: '1535', title: 'Room 23',
  // Shown only when Marco was placed at Room 21 in D1 (package build note).
  marcoMoved: 'Once the behavioral team had Room 21 covered, Tess sent Marco to Room 23.',
  vitalsLead: 'He reports Room 23\'s vitals from 1530:',
  vitalsLeadAlone: 'Marco reports Room 23\'s vitals from 1530:',
  vitals: `${vitalsLine(r23at1530)}.`,
  scene: 'Marco collects the vitals; reading the rhythm and reassessing Ray stay with you. Ray: "Still a little fluttery, same as this morning. No chest pain. Breathing\'s fine." Lena, the monitor tech: "23\'s been 104 to 118 all day." The plan on screen: rate control in progress, recheck at 1600, call the provider if he stays above 130.',
  strip: 'rm23-1535-a',
  prompt: 'Read his strip. What\'s your call?',
  choices: [
    { id: 'reassess', text: 'Continue and reassess', result: 'Correct',
      feedback: 'Irregularly irregular, no P waves, rate about 110 (11 QRS in 6 seconds). His pressure is normal, and he has no chest pain, shortness of breath or confusion. He remains stable, with no new findings that call for a change from the current plan.' },
    { id: 'ask', text: 'Get specific information: ask about dizziness, chest pain and shortness of breath, and confirm the 1600 recheck with Marco', result: 'Correct',
      feedback: 'Also a sound plan. It\'s continuing and reassessing, done deliberately.' },
    { id: 'notify', text: 'Notify the provider (non-urgent)', result: 'Not best',
      feedback: 'The provider already knows, and nothing has changed. Save the call for a change, like a rate above 130.' },
    { id: 'escalate', text: 'Escalate now', result: 'Not best',
      feedback: 'He\'s stable and unchanged. Escalation is for change or signs of instability.' },
  ],
  teaching: 'Stable AFib with a plan stays on the plan. Watch for what would make it unstable: low BP, new confusion, chest pain, signs of shock or acute heart failure.',
  concepts: ['stable-vs-unstable-afib'],
  sources: [
    [11, 'no P waves, fibrillatory waves, irregularly irregular R-R intervals'],
    [10, 'many patients with AFib have no symptoms; most stable patients start with rate control'],
    [12, 'signs that a fast rhythm is causing instability'],
    [5, 'new-onset AFib belongs on continuous monitoring'],
  ],
};

export const finalScreen = 'Afternoon challenge complete.';

const option = (id, title, label, feedback) => ({ id, title, label, feedback });
const rewindFacts = (strip, trend, bpText, looks, mental) => [`Strip: ${strip}`, `Lena's trend: ${trend}`, `BP: ${bpText}`, `How he looks and feels: ${looks}`, `Mental status: ${mental}`];
export const REWIND = {
  version: VERSION,
  title: 'The Room 23 call, three ways',
  intro: 'The Rewind replays Decision 5 with the same patient in three different clinical states, and the correct call changes each time: Continue and reassess, Escalate now, then Notify the provider. His history, the 0800 AFib, and the provider\'s plan (recheck at 1600, call if he stays above 130) stay the same in all three.',
  history: 'His history, the 0800 AFib, and the provider\'s plan (recheck at 1600, call if he stays above 130) stay the same in all three.',
  teaching: 'Same rhythm, three calls. Stability and the provider\'s plan set the urgency, not the rhythm\'s name.',
  sources: [12, 10, 11],
  variations: [
    { id: 'a', title: 'A: Stable (main script)', strip: 'rm23-1535-a', focus: 'Correct call: Continue and reassess',
      facts: rewindFacts('AFib, about 110', '104 to 118 all day', bp(r23at1530), '"Fluttery, same as this morning"', 'Alert, oriented'),
      question: d5.prompt, options: d5.choices.map(c => option(c.id, c.text, c.result, c.feedback)) },
    { id: 'b', title: 'B: Unstable', strip: 'rm23-1535-b', focus: 'Correct call: Escalate now',
      facts: rewindFacts('AFib, about 150', 'Jumped to the 140s and 150s 10 minutes ago', '84/50', 'Pale, clammy, dizzy. "My chest feels tight."', 'Slow to answer'),
      question: d5.prompt,
      options: [
        option('escalate', 'Escalate now: call rapid response and stay with him', 'Correct', 'AFib with a rapid ventricular response near 150, with low BP, chest tightness and slowed thinking, means he\'s hemodynamically unstable. The team will sort out the cause. He needs them at the bedside now.'),
        option('notify', 'Notify the provider (non-urgent)', 'No', 'A page in a queue doesn\'t match instability.'),
        option('recheck', 'Get specific information: repeat his BP in 15 minutes, then decide', 'No (unsafe)', 'Waiting delays care for a patient who is already unstable.'),
        option('reassess', 'Continue and reassess', 'No (unsafe)', 'His findings changed, so the old plan no longer fits.'),
      ] },
    { id: 'c', title: 'C: In between', strip: 'rm23-1535-c', focus: 'Correct call: Notify the provider, now',
      facts: [...rewindFacts('AFib, about 130', '132 to 138, sustained for the last 20 minutes', '124/76', 'Fluttery. No chest pain, dizziness or shortness of breath.', 'Alert, oriented'),
        'Rate note: The 6-second count on the C strip (13 QRS, about 130) is only an estimate. The monitor\'s 20-minute trend is what shows he has stayed above 130.'],
      question: d5.prompt,
      options: [
        option('notify', 'Notify the provider: call now with his rate trend, BP and symptoms, since he\'s past the "call if above 130" line', 'Correct', 'His monitor trend has stayed above 130 for 20 minutes, so he\'s past the line the provider set, even though he\'s stable. Making that call is part of the plan.'),
        option('recheck', 'Get specific information: recheck his rate in 15 minutes, then call if he\'s still high', 'Close', 'Not unreasonable, but he\'s already been above 130 for 20 minutes. Call now, and recheck too.'),
        option('escalate', 'Escalate now', 'Not best', 'His pressure is normal and he has no signs of instability. Rapid response isn\'t needed yet.'),
        option('reassess', 'Continue and reassess', 'No', 'He crossed the provider\'s call parameter. Staying quiet breaks the plan.'),
      ] },
  ],
};

export const debrief = {
  outcome: [
    [['1514', 'The hospital\'s STEMI pathway is started.'], ['1540', 'Dolores leaves for the cath lab with the STEMI team.']],
    [['1540', 'Curtis sits down with you and the behavioral response nurse and agrees to put the monitor back on, after about 35 minutes off telemetry. The provider orders a psychiatry consult.']],
    [['1600', 'Ray\'s recheck shows his rate settling into the 90s. He\'s still in AFib, on his plan.']],
  ],
  review: {
    d1: { correct: 'You got an RN to the quiet room with the ST change and sent the right teammate to the loud one.', missed: 'Room 22 needed an RN first. Curtis\'s yelling meant he was breathing. Dolores\'s ST change meant her heart might not be getting enough blood.', concept: 'prioritize-by-findings, delegation' },
    d2: { correct: 'You saw her \'indigestion\' for what it was: a new ST change, a lower BP, sweating and nausea.', missed: 'Upper belly burning, nausea and sweating with a new ST change and a lower BP point to her heart, not her stomach.', concept: 'anginal-equivalents' },
    d3: { correct: 'You found the elevation in II, III and aVF and got the team moving.', missed: 'Look for ST elevation in leads that sit together. II, III and aVF did, and that called for the STEMI response now.', concept: 'stemi-recognition' },
    d4: { correct: 'You calmed Curtis without arguing, agreeing or threatening, and left the decision about the monitor with him.', missed: 'With a delusion, respond to the feeling, keep it short and offer a choice. Arguing or threatening raises the risk.', concept: 'verbal-deescalation' },
    d5: { correct: 'You kept Ray on his plan because nothing had changed.', missed: 'Ray was stable and unchanged with a plan in place. Escalation is for change or instability.', concept: 'stable-vs-unstable-afib' },
  },
  takeaways: [
    'The loudest room is not always the sickest: go where the findings point, and send the right teammate to the rest.',
    'Chest discomfort is common in heart attacks for women and men, but a heart attack can also feel like indigestion, especially in women, older adults and people with diabetes.',
  ],
  why: [
    ['Chest pain is still the most common heart attack symptom, including in women, but it isn\'t always there. Symptoms can sit in the upper abdomen or jaw, and women more often have nausea and shortness of breath with it', [1, 3, 4, 14]],
    ['ST elevation in neighboring leads marks injury in the wall those leads face. II, III and aVF face the inferior wall, and I and aVL often show mirror-image depression', [1, 2]],
    ['In one ICU study, 88.8% of sampled arrhythmia alarms were false positives. Causes included monitoring algorithms, patient rhythms and occasional electrode problems. Alarms still require appropriate assessment. A leads-off alert indicates loss of monitoring, not confirmed asystole', [6]],
  ],
  // Go further. Rhythm Lab buttons stay hidden: no ST elevation entry exists, and the AFib entry has no direct link.
  rhythmLab: [
    { id: 'st', title: 'ST elevation, explained', concept: 'stemi-recognition', verified: false },
    { id: 'afib', title: 'AFib: stable or unstable?', concept: 'stable-vs-unstable-afib', verified: false },
  ],
  ask: 'Why can a heart attack feel like indigestion?',
  share: 'The loudest room on the unit wasn\'t the sickest one.',
  tomorrow: 'Want another shift tomorrow?',
};

export const card = {
  coreLesson: 'The loudest room is not always the sickest: go where the findings point, and send the right teammate to the rest.',
  objectives: [
    'Prioritize three telemetry patients by their findings, not by noise or alarm volume.',
    'Assign the charge nurse and CNA within their roles while you take the patient who needs an RN most.',
    'Recognize that a heart attack can feel like indigestion, nausea or fatigue, sometimes without chest pain, even though chest discomfort stays common in both women and men.',
    'Identify ST elevation in the inferior leads and escalate without delay.',
    'Tell a leads-off alarm from a rhythm, and keep the plan for stable AFib.',
  ],
  concepts: ['prioritize-by-findings', 'delegation', 'anginal-equivalents', 'stemi-recognition', 'verbal-deescalation', 'stable-vs-unstable-afib'],
  judgmentSteps: [
    { decision: 'D1', steps: ['Prioritize hypotheses', 'Take action'] }, { decision: 'D2', steps: ['Recognize cues'] },
    { decision: 'D3', steps: ['Analyze cues', 'Take action'] }, { decision: 'D4', steps: ['Take action'] },
    { decision: 'D5', steps: ['Evaluate outcomes'] },
  ],
  twist: 'The loud room has a man who is talking, breathing and pulling off his leads. The quiet call light, which the monitor tech blames on lead placement after a bath, is an inferior STEMI.',
  specialty: 'Telemetry', learnerLevel: 'Student and new grad', estimatedTime: '6 minutes', decisionCount: 5,
  reviewStatus: 'Draft', contentReviewDate: 'Pending',
  specialtyReview: 'psych specialty review required',
};

// Open review items (not learner-facing). Part F.
export const OPEN_ITEMS = [
  'Founder review, independent clinical review and psych specialty review (Room 21 and D4) are not recorded.',
  'All nine ECG images are constructed illustrations and need a clinical check of morphology before release.',
  'Sources 3, 4 and 5 were opened through ACC summaries; claims need checking against the full text.',
  'The two Rhythm Lab Go further buttons are hidden until verified entries exist.',
  'D1 placements the rules table does not cover earn no credit and continue on a labeled guided path (Path B only if Tess alone took Room 22), as decided by Mohamed on 24 Oct 2026. No storyline was added.',
  'D5 Marco line build note added in the package; Mohamed to confirm.',
  'Founder changes to v0.7 text on 24 Oct 2026, before review: D1 shows all three patients\' strips (Room 21 at 1505, Rooms 22 and 23 at their 1430 starting strips), and Lena is introduced as the monitor tech on D1 and D5.',
];
