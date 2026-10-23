export const VERSION = '1.0.0';
export const KEY = 'ce-shift7-missing-time-v1';
export const stages = ['Arrival', 'First response', 'Find the story', 'At the bedside', 'Handoff', 'Reflection'];
export const findings = 'Left facial droop, left arm drift when both arms are raised, slurred speech; alert.';
export const protocol = 'Harbor General activates Code Stroke for new focal neurological deficits when last known well is within 24 hours or not yet known. Assessment and history gathering run alongside activation: airway, breathing and circulation; glucose; focused neurological assessment and vital signs; monitoring; and IV access per protocol. Keep oral intake on hold until a trained clinician completes the swallow screen and clears intake under local protocol. This is a fictional activation rule, not a universal treatment window.';
export const actions = [
  { id: 'activate', title: 'Activate Code Stroke', detail: 'Use Harbor General’s protocol.' },
  { id: 'glucose', title: 'Check point-of-care glucose', detail: 'Obtain a current bedside value.' },
  { id: 'assess', title: 'Assess and monitor', detail: 'Airway, breathing, circulation, neuro check, vitals and monitoring.' },
  { id: 'npo', title: 'Keep nothing by mouth', detail: 'Until a swallow screen is passed.' },
  { id: 'iv', title: 'Arrange IV access', detail: 'Per the facility protocol.' },
  { id: 'wait', title: 'Clarify the exact time first', detail: 'Wait to activate until the history is complete.' },
  { id: 'rest', title: 'Let him rest', detail: 'Recheck the findings in 30 minutes.' },
];
export const people = [
  { id: 'ems', name: 'EMS', role: 'The arrival report', initials: 'EMS', intro: '“We have him down as onset 0715.”' },
  { id: 'linda', name: 'Linda', role: 'His wife', initials: 'LH', intro: '“He was fine last night. I don’t understand.”' },
  { id: 'walter', name: 'Walter', role: 'Your patient', initials: 'WH', intro: '“My arm’s just asleep. I’m fine.”' },
];
export const questions = [
  { id: 'ems-time', person: 'ems', q: 'Is 0715 when it started, or when he was found?', a: 'That’s when his wife found him. We didn’t ask when he was last normal.', card: 'ems-time', essential: true },
  { id: 'ems-scene', person: 'ems', q: 'What did you see on scene?', a: 'Slurred speech, left arm weakness, alert. Glucose 142 at 0731.' },
  { id: 'bedtime', person: 'linda', q: 'When did you last see him acting completely normal?', a: 'Last night. We watched the news, and he went to bed at 10:30. He was fine, talking, joking.', card: 'bedtime', essential: true },
  { id: 'overnight', person: 'linda', parent: 'bedtime', q: 'Did you talk with him at all overnight?', a: 'Around three he got up for the bathroom. On his way back we talked for a minute or two. I asked if he was okay. He said, “Yeah, just the bathroom, go back to sleep.” Clear as anything. He got back into bed on his own; I felt him climb in. The lamp was off, so I couldn’t see his face, and I didn’t watch him walk.', card: 'overnight' },
  { id: 'discovery', person: 'linda', q: 'When did you first notice something was wrong?', a: 'At 7:15. I came down and the coffee was spilled. He was talking funny and couldn’t lift his left arm.', card: 'discovery', essential: true },
  { id: 'machine', person: 'linda', q: 'Do you know when he got up this morning?', a: 'The coffee maker app says it started at 6:05. He always makes the coffee.', card: 'machine' },
  { id: 'previous', person: 'linda', q: 'Has he had anything like this before?', a: 'No, never.' },
  { id: 'dinner', person: 'linda', q: 'What did he have for dinner?', a: 'Chicken and rice.' },
  { id: 'morning', person: 'walter', q: 'What’s the last time you felt completely normal?', a: 'This morning. I made the coffee around six. Felt fine.', card: 'morning', essential: true },
  { id: 'hands', person: 'walter', parent: 'morning', q: 'What do you mean by fine? Could you use both hands and talk normally?', a: 'I held the mug in my left hand and poured with my right. I didn’t notice any trouble then. I hadn’t spoken to anyone; Linda was asleep.', card: 'morning' },
  { id: 'arm', person: 'walter', parent: 'morning', q: 'When did your arm start feeling like this?', a: 'After I sat down with the coffee, I guess. Maybe six-thirty? I thought I’d slept on it.', card: 'arm' },
];
export const categories = ['Reported baseline or function', 'Symptoms noticed', 'Activity record', 'Unresolved timing'];
export const evidence = [
  { id: 'bedtime', time: '22:30', when: 'Last night', source: 'Linda · saw and talked', category: categories[0], limit: 'Anything after bedtime', alternatives: ['Whether he spoke at bedtime', 'His reported bedtime'], note: 'This establishes Linda’s baseline report at bedtime, not the hours that followed.' },
  { id: 'overnight', time: '≈03:00', when: 'Overnight', source: 'Linda · heard and felt', category: categories[0], limit: 'His face or arm strength', alternatives: ['Whether she heard him speak', 'Whether they had a conversation'], note: 'The conversation is real baseline evidence. Report it with the limits of what Linda could assess.' },
  { id: 'morning', time: '≈06:00', when: 'This morning', source: 'Walter · his own account', category: categories[0], limit: 'Whether his speech was normal', alternatives: ['What he remembers doing', 'His own account of feeling fine'], note: 'His account is evidence. Clarification adds detail; it is not a reason to dismiss him.' },
  { id: 'machine', time: '06:05', when: 'This morning', source: 'App time · reported by Linda', category: categories[2], limit: 'Who started it or how he was', alternatives: ['The reported machine start time', 'What Linda reports the app recorded'], note: 'This record describes the appliance. In this case it does not establish who used it or their baseline.' },
  { id: 'arm', time: '≈06:30', when: 'This morning', source: 'Walter · estimated time', category: categories[1], limit: 'An exact onset time', alternatives: ['His estimated noticing time', 'Which symptom he noticed'], note: 'Walter estimates noticing his arm symptoms around 0630. Report that estimate without making it exact.' },
  { id: 'ems-time', time: '07:15', when: 'EMS clarification', source: 'EMS · relaying Linda’s discovery', category: categories[1], limit: 'When symptoms began', alternatives: ['What EMS meant by 0715', 'The reported discovery time'], note: 'EMS clarified that its “onset” label referred to discovery. Keep EMS as the source of this clarification.' },
  { id: 'discovery', time: '07:15', when: 'This morning', source: 'Linda · saw and heard', category: categories[1], limit: 'When symptoms began', alternatives: ['When Linda found symptoms', 'What Linda saw and heard'], note: '0715 is when Linda found him with symptoms, not an established onset time.' },
];
export const sources = [
 { id: 'nursing', title: 'Ashcraft et al. Care of the Patient With Acute Ischemic Stroke: Prehospital and Acute Phase (AHA, 2021)', url: 'https://doi.org/10.1161/STR.0000000000000356', scope: 'Last known well versus discovery; patient and witness history; concurrent assessment and contact information. See Delivery: EMS Field Assessment and Tables 6–7.', limitation: 'Supports the nursing principles. The people, dialogue, timestamps and actions in this case are fictional.' },
 { id: 'guideline', title: 'Prabhakaran et al. Guideline for the Early Management of Patients With Acute Ischemic Stroke (AHA/ASA, 2026)', url: 'https://doi.org/10.1161/STR.0000000000000513', scope: 'Sections 2.7, 4.5, 4.6 and 5.2: rapid team evaluation, glucose assessment, uncertain-onset evaluation and swallowing precautions.', limitation: 'Treatment eligibility belongs to the evaluating team. This focused exercise does not teach treatment selection or reproduce a complete stroke pathway.' },
];
export const rewinds = [
 { id: 'breakfast', title: 'Breakfast together', kicker: 'A different morning', time: '07:58', story: 'Linda ate breakfast with Walter from 0640 to 0650. He spoke normally and used both hands while buttering toast. She went upstairs at 0650 and found him with symptoms at 0715. EMS called 0715 “onset.”', options: [
 ['onset', 'Onset 0715.', '0715 remains discovery, not established onset.'],
 ['baseline', 'Last seen normal at 0650, per Linda; found with symptoms at 0715.', 'The newer witness account changes the baseline report. Keep the source and discovery time distinct.'],
 ['bedtime', 'Last confirmed normal was bedtime.', 'Linda provided a more recent baseline account at breakfast.'],
 ], correct: 'baseline' },
 { id: 'camera', title: 'The doorbell camera', kicker: 'A different source', time: '07:58', story: 'Linda saw Walter normal at 2230 and slept until finding symptoms at 0715. Walter reports no conversation since bedtime. A video shows him walking to the curb at 0630 and back at 0632. It has no sound; his face and arm function cannot be assessed from the image.', options: [
 ['video', 'Last known well 0630, confirmed by video.', 'The recording shows activity, with limits. It cannot establish the functions that are not visible or audible.'],
 ['omit', 'Leave out the video because it isn’t a witness.', 'The recording is still evidence. Report what it shows with its limits.'],
 ['qualified', 'Report 2230 per Linda, the video and its limits, and discovery at 0715; onset remains uncertain.', 'You included the record without overstating what it establishes.'],
 ], correct: 'qualified' },
 { id: 'neighbor', title: 'Found by a neighbor', kicker: 'A different time window', time: '09:35', story: 'Walter was home alone. A neighbor spoke with him at 1900 last night and reports he was completely normal. The neighbor found symptoms at 0900; Walter arrives at 0935. Harbor General activates Code Stroke for new focal deficits when last known well is within 24 hours or not yet known.', options: [
 ['activate', 'Activate per protocol. Report 1900 per neighbor, discovery 0900 and uncertain onset.', 'The facility response still applies. Report the history; treatment eligibility belongs with the evaluating team.'],
 ['late', 'Do not activate; it is probably too late.', 'The fictional facility protocol calls for activation. Do not decide treatment eligibility from this time history alone.'],
 ['label', 'Activate and report onset 0900.', 'Activation fits the protocol. 0900 is discovery, so the time label needs correction.'],
 ], correct: 'activate' },
];
