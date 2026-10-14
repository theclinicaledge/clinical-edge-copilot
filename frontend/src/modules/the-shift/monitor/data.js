// Revised for release review; original approved script and every wording change are preserved in the review packet.
export const rooms = [
  { id: '20', title: 'Telemetry observation', age: '54-year-old', rate: '76', strip: 'A', rhythm: 'Sinus rhythm 76 with an occasional single PVC', report: '54-year-old admitted overnight after fainting at home. On telemetry for observation. "A few single PVCs overnight, no symptoms. Labs normal."' },
  { id: '22', title: 'Chest pain workup', age: '61-year-old', rate: '80', strip: 'B', rhythm: 'Sinus rhythm 80', report: '61-year-old admitted for a chest pain workup. Troponins negative twice. Stress test planned this morning. Up to the bathroom on his own.' },
  { id: '24', title: 'Post-op hip replacement', age: '72-year-old', rate: '84', strip: 'C', rhythm: 'Sinus rhythm 84', report: '72-year-old, post-op day 2 after a hip replacement. Sinus rhythm in the 80s overnight. BP 132/78 at 0600. Morning labs: potassium 3.3, magnesium 1.6; provider aware, replacement ordered. Needs help to stand.' },
];
export const scenes = [
  ['0700', 'Report', 'The Monitor Alarm'], ['0845', 'Respond', 'The station lights up.'],
  ['0846', 'Investigate', 'Look beyond the alarm.'], ['0850', 'Compare', 'A quieter change.'],
  ['0852', 'Assess', 'How urgent is it?'], ['0855', 'Act', 'Your first 3 actions'],
  ['0858', 'Communicate', 'Build the call.'], ['0915', 'Debrief', 'Morning challenge complete'],
];
export const alarmChoices = [
  { id: 'bedside', text: 'Go to Room 22 now and check him: responsiveness, breathing, pulse', result: 'Correct', feedback: "Every high-priority alarm gets the patient checked first. It takes seconds to know if he's awake with a pulse." },
  { id: 'silence', text: 'Silence the alarm and watch the strip from the station for a minute', result: 'No', feedback: "If this is real, a minute matters. The monitor can't tell you if he has a pulse; he can." },
  { id: 'assume', text: "It's probably artifact; he walks around a lot", result: 'No', feedback: 'Assuming artifact is how real arrests get missed. Prove it at the bedside.' },
  { id: 'code', text: 'Call a code from the station without looking', result: 'Not first', feedback: "If you find him unresponsive without a pulse, call immediately. Getting to him first tells you which emergency you have." },
];
export const alarmExplanations = [
  { id: 'artifact', text: 'Movement artifact', result: 'Correct', feedback: 'In this constructed case, movement artifact best fits the combined clues: noise tracks brushing, native QRS complexes continue through it, and the simultaneous pulse is regular at 80. Comfort or rhythm resolution alone would not exclude a genuine arrhythmia.' },
  { id: 'vt', text: 'Ventricular tachycardia', result: 'No', feedback: 'A person can be awake during VT, and true VT can terminate spontaneously. Here, the simultaneous regular pulse, native QRS complexes through the noise and movement correlation favor artifact. Assess the patient and compare stored strips and available leads; no single clue is a universal rule.' },
  { id: 'vf', text: 'Ventricular fibrillation', result: 'No', feedback: "V-fib produces no effective pulse. He's talking to you." },
  { id: 'lead', text: 'A lead came off', result: 'Close', feedback: 'Loose leads cause noise or flat lines too, so check the electrodes. But this noise follows his arm movement.' },
];
export const monitorChoices = [
  { id: '24', text: 'Room 24', result: 'Correct', feedback: 'A new rhythm and a fast rate. Quiet advisories after a loud false alarm are exactly what gets missed.' },
  { id: '20', text: 'Room 20', result: 'Not now', feedback: 'Isolated single PVCs, unchanged from overnight, no symptoms. Keep monitoring and report per routine.' },
  { id: '22', text: 'Room 22', result: 'Not now', feedback: 'Back in sinus rhythm. You already handled it.' },
];
export const rhythmSteps = [
  ['regularity', 'Regularity', 'Irregularly irregular: no pattern to the R-to-R spacing'],
  ['p', 'P waves', 'None clearly seen; a wavy, uneven baseline instead'],
  ['qrs', 'QRS', 'Narrow'], ['rate', 'Rate', 'About 138'],
];
export const rhythmChoices = [
  { id: 'af', text: 'Atrial fibrillation with a rapid ventricular response', result: 'Correct', feedback: 'Irregularly irregular, no clear P waves, narrow QRS: atrial fibrillation. A rate over 100 means a rapid ventricular response.' },
  { id: 'sinus', text: 'Sinus tachycardia', result: 'No', feedback: 'Sinus tachycardia is regular, with a P wave before every QRS. Compare with his 0700 strip.' },
  { id: 'flutter', text: 'Atrial flutter', result: 'No', feedback: "Flutter shows sawtooth flutter waves. It's often regular, but with variable conduction the ventricular rhythm can be irregular too. No sawtooth waves here points to AF." },
  { id: 'svt', text: 'SVT', result: 'No', feedback: 'The most common SVTs are fast and regular, and this rhythm has no pattern at all. SVT is a broad group, though; AF itself is a supraventricular rhythm, so the precise name here is atrial fibrillation.' },
  { id: 'noise', text: 'More artifact', result: 'No', feedback: 'This illustration has irregular R-R intervals and no distinct P waves, rather than native sinus complexes marching through noise. Artifact need not follow visible movement. Correlate the rhythm with the patient, other available leads and a 12-lead ECG; a pulse alone cannot identify AF.' },
];
export const findings = [
  { id: 'symptoms', label: 'What he tells you', text: '"My heart\'s pounding. I got dizzy when I sat up for breakfast."', tier: 'essential' },
  { id: 'mental', label: 'Mental status', text: 'Alert and oriented, answers clearly', tier: 'reassuring' },
  { id: 'pulse', label: 'Pulse', text: 'Apical pulse 138 and irregular; radial pulse 118 (a pulse deficit)', tier: 'essential' },
  { id: 'bp', label: 'Blood pressure', text: 'BP 104/62 (0600: 132/78)', tier: 'essential' },
  { id: 'resp', label: 'Respirations & saturation', text: 'RR 20, SpO2 95% on room air', tier: 'other' },
  { id: 'breath', label: 'Breathing', text: 'Mild shortness of breath when talking', tier: 'supporting' },
  { id: 'pain', label: 'Chest discomfort', text: 'No chest pain', tier: 'reassuring' },
  { id: 'skin', label: 'Skin', text: 'Skin warm and dry', tier: 'reassuring' },
  { id: 'labs', label: 'From report / electrolytes', text: 'potassium 3.3, magnesium 1.6', tier: 'supporting' },
  { id: 'postop', label: 'From report / procedure', text: 'post-op day 2 after a hip replacement', tier: 'supporting' },
  { id: 'fall', label: 'From report / mobility', text: 'Needs help to stand.', tier: 'supporting' },
];
export const actions = [
  { id: 'notify', text: "Notify the provider now; activate rapid response if he meets your facility's criteria or gets worse (chest pain, confusion, a further BP drop)", result: 'Required', feedback: "New AF with a fast rate and a falling BP needs a provider's evaluation now. You can always escalate further without permission." },
  { id: 'stay', text: 'Stay with him and keep him in bed with fall precautions', result: 'Good', feedback: "He's dizzy, post-op and needs help to stand." },
  { id: 'recheck', text: 'Recheck vitals, including a manual BP, and watch for worsening symptoms', result: 'Good', feedback: 'Trends matter more than one number.' },
  { id: 'ecg', text: "Get a 12-lead ECG per your unit's protocol or a provider order", result: 'Good', feedback: 'A 12-lead confirms the rhythm and gives the provider more information.' },
  { id: 'walk', text: 'Help him walk to the bathroom first, then call', result: 'No', feedback: 'Dizzy plus post-op hip plus a falling BP is a fall waiting to happen.' },
  { id: 'wait', text: 'Wait for the next scheduled vitals at 1000', result: 'No', feedback: 'Waiting is how a soft BP becomes a low one.' },
  { id: 'silence', text: 'Silence the "irregular HR" advisory since he\'s awake and talking', result: 'No', feedback: 'Awake and talking is good news, not a reason to stop monitoring.' },
];
export const chips = [
  { id: 'rhythm', section: 'S', text: 'New AF on the monitor, rate about 138, since about 0850', tier: 'essential', why: "The change you're calling about" },
  { id: 'bp', section: 'A', text: 'BP 104/62, was 132/78 at 0600', tier: 'essential', why: 'Shows a meaningful drop from his baseline' },
  { id: 'symptoms', section: 'A', text: 'Dizzy on sitting up, mildly short of breath', tier: 'essential', why: 'Symptoms make it urgent' },
  { id: 'mental', section: 'A', text: 'Alert, oriented, no chest pain', tier: 'supporting', why: 'Helps the provider judge stability' },
  { id: 'labs', section: 'B', text: 'Potassium 3.3, magnesium 1.6 this morning', tier: 'supporting', why: 'A possible contributing factor' },
  { id: 'postop', section: 'B', text: 'Post-op day 2, hip replacement', tier: 'supporting', why: 'Context for new AF' },
  { id: 'ecg', section: 'A', text: '12-lead ECG done or in progress', tier: 'supporting', why: "Tells the provider what's available" },
  { id: 'food', section: 'B', text: 'Ate half his breakfast', tier: 'unneeded', why: 'True, but not relevant to this call' },
  { id: 'alarm', section: 'B', text: "Room 22's artifact alarm", tier: 'unneeded', why: 'A different patient, already resolved' },
];
export const recommendations = [
  { id: 'evaluate', text: '"I need you to evaluate him now. What would you like for his heart rate and blood pressure, and do you want his electrolytes rechecked?"', result: 'Correct', feedback: 'A clear request with a time frame, and it leaves treatment decisions to the provider.' },
  { id: 'rush', text: '"Just letting you know, no rush."', result: 'No', feedback: 'Undersells a falling BP with a new fast rhythm.' },
  { id: 'treat', text: '"Can I give him something to slow his heart rate?"', result: 'Not best', feedback: 'Jumps to a treatment before the provider has the full picture. Ask for an evaluation first.' },
];
export const script = {
  intro: 'Good morning. You have 3 telemetry patients. Their monitors are on the central station behind you.',
  bedside: 'Room 22 is sitting on the edge of the bed, brushing his teeth hard. "Morning! Is something wrong?" His radial pulse is regular at 80. Skin warm, no distress.',
  closer: 'narrow QRS complexes marching through the noise at a regular rate of about 80',
  movement: 'wide, chaotic deflections while his arm moves',
  artifactTeaching: 'Good habits after artifact: check electrode contact and placement, document it per unit policy, and never turn alarms off or widen their limits just to stop repeats.',
  essentialFeedback: "A new fast rhythm, a BP well below his baseline, and symptoms together make this concerning. The fast AF may be contributing, but other causes, like post-op bleeding or low fluid volume, are possible, so he needs a provider's evaluation.",
  supportingFeedback: 'Low potassium and magnesium can make rhythm problems more likely, and new AF can develop after surgery, especially in older adults.',
  reassuringOriginal: "These say he's still perfusing his brain and heart. They don't make the situation non-urgent.",
  reassuringFeedback: 'Alertness, absence of chest pain, and warm, dry skin are reassuring observations, but they do not establish adequate cardiac perfusion or exclude clinically significant deterioration.',
  physiology: 'Rapid rates shorten filling time, and AF removes coordinated atrial contraction. These can reduce ventricular filling and stroke volume, especially when filling is already impaired. The effect varies; the rhythm alone does not establish the cause of this patient\'s BP change.',
  outcome: [ ['0905', 'The provider evaluates Room 24. The 12-lead confirms atrial fibrillation with a rapid ventricular response, and treatment and closer monitoring begin.'], ['0915', 'Room 22 leaves for his stress test. Room 20 is unchanged.'] ],
  takeaways: ['Check the patient behind the alarm, then correlate the pulse, symptoms and available ECG leads or stored strips. A comfortable patient or a rhythm that stops does not prove artifact.', "The rhythm tells you what. The patient's perfusion tells you how urgent."],
  checks: ["Does the noise start and stop with movement, and do the patient's pulse and condition fit what the monitor shows?", 'Can you see normal QRS complexes continuing through the noise?'],
  reading: "Is it regular? Are there P waves? Is the QRS narrow or wide? What's the rate?",
  ask: 'Why does new atrial fibrillation with a fast rate lower blood pressure?',
  share: "The loud alarm was fake. The quiet one wasn't. Could you tell? theclinicaledge.org",
};
export const references = [
  ['af', '2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation, JACC', 'AF ECG criteria, visual confirmation and clinical context; not validation of the constructed strip'],
  ['artifact', 'Knight BP et al. Clinical Consequences of Electrocardiographic Artifact Mimicking Ventricular Tachycardia. NEJM 1999;341:1270-1274', 'Harm from mistaking artifact for VT; not a universal bedside artifact test'],
  ['artifact-case', 'Mascitelli L, Pezzetta F. Case Report: Differentiating Artifact from True Ventricular Tachycardia. American Family Physician 2006;74:921', 'Movement correlation and native QRS complexes during toothbrushing artifact; no source figure reproduced'],
  ['monitoring', 'Sandau KE et al. Update to Practice Standards for Electrocardiographic Monitoring in Hospital Settings. AHA scientific statement, Circulation 2017', 'Monitoring, alarm management and staff education; individual actions remain subject to local policy'],
  ['nursing', 'Merck Manual Professional: Atrial Fibrillation', 'Clinical presentation and hemodynamic effects of AF; not a source for every non-AF distractor or this fictional management plan'],
  ['rrt', 'AHRQ PSNet. Rapid Response Systems (primer)', 'Calling criteria and that any staff member may call (Screen 6)'],
];
export const links = { library: '/rhythm-lab/library', practice: '/rhythm-lab/practice', references: '/reference-hub', ask: '/ask', selector: '/prototypes/the-shift/scenarios.html' };
