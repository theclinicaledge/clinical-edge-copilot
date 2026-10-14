// SHIFT-003 v0.3 release corrections; v0.2 remains preserved in the private prototype.
export const scenes = [['1300', 'Assignment'], ['1305', 'Start'], ['1310', 'Compare'], ['1320', 'Clarify'], ['1340', 'Teach-back'], ['1345', 'Discover'], ['1400', 'Reflect']];
export const patients = [
  { room: '31', setting: '78-year-old, admitted 4 days ago for a heart failure flare. Takes apixaban for atrial fibrillation. On day 2, a small upper GI bleed was found on endoscopy.', report: 'Discharge today. Breathing back to baseline. His daughter is coming at 1330 with his home pill bottles.', status: 'Ready for discharge' },
  { room: '32', setting: '66-year-old, post-op day 1 after knee replacement', report: 'Pain controlled, walking with PT at 1400.', status: 'Stable' },
];
export const startChoices = [
  { id: 'compare', text: 'Compare the discharge medication list with his home list and the discharge instructions before teaching', result: 'Correct', feedback: "Reconciliation comes before teaching. If the papers disagree, you'd be teaching the wrong plan." },
  { id: 'print', text: 'Print the instructions and start teaching now to save time', result: 'No', feedback: 'at 1325 he asks, "So I restart my blood thinner tonight, like the paper says?" Something doesn\'t add up.', consequence: true },
  { id: 'ride', text: 'Take out his IV and call the family about the ride first', result: 'Not first', feedback: "Useful tasks, and others can help with them. Medication reconciliation is a team job shared with prescribers and pharmacists, but checking the discharge plan and raising discrepancies before you teach is your part, and it comes first." },
  { id: 'promise', text: 'Tell the charge nurse 1330 is fine', result: 'No', feedback: "Don't commit to a time before you know the discharge is safe." },
];
export const documents = [
  { id: 'home', label: 'Home list', title: 'Home medication list', byline: 'Admission', lines: [
    ['home-lasix', 'Lasix (water pill), every morning', 'names'],
    ['home-apixaban', 'apixaban (blood thinner), twice a day', 'context'],
    ['home-metoprolol', 'metoprolol (heart), twice a day', 'timing'],
    ['home-atorvastatin', 'atorvastatin (cholesterol), at bedtime', 'unchanged'],
  ] },
  { id: 'provider', label: 'Discharge list', title: 'Discharge medication list', byline: 'Provider', lines: [
    ['new-furosemide', 'furosemide (water pill), every morning. Changed: new prescription sent to pharmacy; replaces home Lasix', 'names'],
    ['stop-apixaban', 'Stop taking: apixaban (blood thinner); hold until GI reassesses at follow-up (see plan)', 'conflict'],
    ['new-metoprolol', 'metoprolol, with breakfast and dinner', 'timing'],
    ['new-atorvastatin', 'atorvastatin, at bedtime', 'unchanged'],
    ['new-pantoprazole', 'New: pantoprazole (stomach protection)', 'expected'],
  ] },
  { id: 'instructions', label: 'Instructions', title: 'Discharge instructions', byline: 'Patient copy', lines: [
    ['resume-all', '"Resume all your home medications unless told otherwise."', 'conflict'],
    ['continue-thinner', '"Continue your blood thinner as before."', 'conflict'],
    ['gi-visit', '"Follow up with GI in 1 to 2 weeks." Appointment: Not scheduled', 'followup'],
  ] },
];
export const actions = [
  { id: 'provider', text: 'Contact the discharging provider: the medication list says stop the blood thinner, the instructions say continue. Ask which is correct and for corrected instructions', result: 'Required', feedback: 'Order conflicts go to the prescriber. You found it; they decide it.' },
  { id: 'charge', text: 'Tell the charge nurse discharge is on hold until the conflict is clarified, with a realistic time', result: 'Good', feedback: 'Clear communication keeps patient flow moving without cutting a safety corner.' },
  { id: 'pharmacist', text: 'Ask the pharmacist to review the discharge reconciliation', result: 'Good', feedback: 'Many facilities use pharmacist discharge review. It adds a second set of eyes, but the prescriber still corrects the order.' },
  { id: 'cross-out', text: 'Cross out "continue your blood thinner" on the instructions yourself', result: 'No', feedback: 'Do not independently resolve this treatment conflict by choosing which direction is correct. Clarify the intended plan with the prescriber, then reconcile the documents through your facility\'s authorized process. Nurses can participate in documentation correction within that process.' },
  { id: 'discharge', text: 'Discharge on time and tell him to ask the GI doctor', result: 'No, unsafe', feedback: 'He could follow conflicting instructions before the intended plan is clear. Restarting and continued interruption both have potential harms after a GI bleed. The scenario does not establish ongoing bleeding; it establishes an unresolved medication conflict.', consequence: true },
  { id: 'stop', text: "Tell him to stop his blood thinner now, before you've clarified", result: 'No', feedback: 'Choosing to stop is still choosing a treatment plan before the conflict is resolved. Neither stopping nor restarting is automatically the safer answer. Clarify the plan and ensure the patient receives one consistent set of instructions.' },
];
export const teachChoices = [
  { id: 'show', text: '"Using the bottles you brought, can you show me what you\'ll take tomorrow morning?"', result: 'Correct', feedback: '"Show me" with his real bottles tests what he\'ll actually do, not just what he remembers.' },
  { id: 'own-words', text: '"Tell me in your own words what changed with your blood thinner."', result: 'Close', feedback: 'Good teach-back for that one change. The show-me version also checks every bottle.' },
  { id: 'questions', text: '"Do you have any questions?"', result: 'No', feedback: 'A yes/no question. Most people say "no" whether or not they understand.' },
  { id: 'leading', text: '"You understand the blood thinner is stopped, right?"', result: 'No', feedback: 'A leading question. It invites "yes" and tests nothing.' },
];
export const fixChoices = [
  { id: 'confirm', text: "Confirm on the reconciled discharge list that the new furosemide replaces his home Lasix (it says so), and check with the pharmacist or prescriber if anything is unclear. Then explain that Lasix and furosemide are the same medicine, set the old bottle aside with him and his daughter per your facility's policy, and repeat the show-me until he gets it right", result: 'Correct', feedback: 'The list already said the new prescription replaces Lasix. Teach-back revealed his intention to take both despite that instruction. Re-explain and check understanding again.' },
  { id: 'both', text: 'Tell him to take both, since the provider ordered the new one', result: 'No, unsafe', feedback: 'Lasix and furosemide contain the same medicine. Taking both could exceed the intended amount and cause excessive fluid or electrolyte loss, low blood pressure and dizziness. Strengths and amounts are not supplied, so an exact doubling cannot be calculated.' },
  { id: 'write', text: 'Write "same medicine" on his sheet and finish the discharge', result: 'Not best', feedback: "Helpful, but you haven't confirmed he understands. Re-check with teach-back." },
  { id: 'change', text: 'Call the provider to change the prescription', result: 'Not best', feedback: 'The reconciled list states that one prescription replaces the other; this discovery does not itself establish a need for a new prescription. Confirm any uncertainty with the pharmacist or prescriber and address the demonstrated misunderstanding through teach-back.' },
];
export const script = {
  charge: 'ED is holding a patient for 31. Can they be out by 1330?',
  note: 'Apixaban (for atrial fibrillation) held after a small upper GI bleed on endoscopy. Cardiology and GI discussed: hold for now; GI to reassess restarting at the follow-up visit, weighing bleeding risk against stroke risk for this patient. Plan documented in the discharge summary.',
  conflict: 'Two documents give opposite directions on a high-risk medication, right after a bleed. This must be clarified before discharge.',
  followup: 'This fictional plan calls for reassessment at follow-up, not an automatic restart. Confirm the timing, responsible clinician and instructions for a delayed appointment before discharge. Real restart decisions balance recurrent bleeding and thromboembolic risk individually.',
  names: 'Same medicine, brand vs. generic. Not a document error, but a teaching risk; remember it for later.',
  expected: "it's explained by the GI bleed.", timing: 'same plan, different wording.',
  provider: 'Good catch. The blood thinner stays stopped until GI sees him. The instructions pulled his home list automatically. A corrected copy is printing, and GI is booked for next Tuesday.',
  planLimit: 'This is the fictional treating team\'s plan, not a general rule to hold anticoagulation until an outpatient GI visit. Whether and when to restart requires individualized bleeding and stroke-risk review. The nurse verifies a consistent documented plan and follow-up arrangements rather than selecting the treatment.',
  chargeReply: 'Thanks, bed control updated.',
  patient: "I'll take my Lasix like always, and this new water pill they gave me.", daughter: "So that's two water pills now?",
  recheck: 'He holds up the new bottle: "One water pill, this one. No blood thinner until the stomach doctor says. If I throw up blood, have black or tarry stools, see blood in my stool, or feel faint or very dizzy, I go to the emergency room or call 911. If I\'m not sure about any pill, I call the pharmacy or the doctor\'s office before I take it." His daughter writes it down.',
  outcome: [['1355', 'Room 31 goes home with corrected instructions, a GI appointment, and one water pill.'], ['1400', 'Room 32 walks with PT.'], ['1405', 'The ED patient arrives in Room 31.']],
  takeaways: ["Reconcile the papers, then check the person. Either step alone can miss a dangerous error.", "Don't ask 'Any questions?' Ask them to show you."],
  why: ['Discrepancies between discharge documents, such as omissions, duplications and wrong instructions, are a known risk at care transitions. A generic line like "resume all home medications" can contradict a medication held during the stay.', 'Brand and generic names for the same drug look like two different medicines to many patients, so duplication at home is a known risk.', "People often say they understand when they don't. Teach-back, especially \"show me,\" reveals what they'll actually do."],
  ask: 'Why are blood thinners often held after a GI bleed, and who decides when to restart?',
  askNames: 'Why do brand and generic drug names confuse patients, and how can nurses prevent duplication?',
  share: "The paperwork got fixed. The pill bottles didn't. Could you catch both? theclinicaledge.org",
};
export const reflections = [
  ['Reconciliation', 'You checked the paperwork before teaching.', 'Reconciliation was not your first selected action.'],
  ['The conflict', 'You found the blood thinner conflict.', 'The stop vs. continue conflict on the blood thinner was the key finding.'],
  ['Team communication', 'You included the prescriber and a second appropriate team action.', 'Review your selected actions: the conflict needs prescriber clarification before discharge.'],
  ['Teach-back', 'You used a show-me question with his real bottles.', "Yes/no and leading questions don't test understanding."],
  ['The bottles', 'You checked the replacement plan and repeated teach-back.', 'Lasix and furosemide are the same medicine. Their combined amount is unknown; duplication can exceed the intended prescription.'],
];
export function reflectionText(index, answers, recognized) {
  if (recognized) return reflections[index][1];
  if (index === 0) return {
    print: 'You chose to begin teaching before comparing the papers. The fictional consequence showed the risk of teaching conflicting instructions.',
    ride: 'You prioritized IV removal and the ride. Reconciliation still needed to come before teaching.',
    promise: 'You committed to 1330 before checking the plan. Confirm the discharge is ready before promising a time.',
  }[answers.start] || reflections[index][2];
  if (index === 3) return {
    'own-words': 'You used open-ended teach-back about the blood thinner. That is useful; the show-me question would also examine his bottle-by-bottle plan.',
    questions: 'You asked whether he had questions. That does not demonstrate how he will use the medicines.',
    leading: 'You asked a leading confirmation question. An explanation in his own words or a demonstration gives more information.',
  }[answers.teach] || reflections[index][2];
  return reflections[index][2];
}
export const sources = [
  { id: 'reconciliation', title: 'AHRQ PSNet: Medication Reconciliation', type: 'Government patient-safety resource', url: 'https://psnet.ahrq.gov/primer/medication-reconciliation', scope: 'D1-D3 and debrief: comparing regimens at transitions and identifying discrepancies.', limitation: 'Publisher search record available; direct page returned 403. Script update date not independently confirmed. Does not verify this fictional discharge plan.' },
  { id: 'teachback', title: 'AHRQ: Use the Teach-Back Method, Tool 5 (3rd edition)', type: 'Government toolkit', url: 'https://www.ahrq.gov/health-literacy/improve/precautions/tool5.html', scope: 'D4-D5: own-word explanations, show-me, avoiding yes/no questions, and checking again.', limitation: 'Current page checked, reviewed April 2024. Supports the teaching method, not a claim that every patient behaves this way. The script also cites a 2010 UNC copy not supplied or verified here.' },
  { id: 'discrepancies', title: 'AHRQ: Medication Discrepancies and Potential Adverse Drug Events During Transfer of Care from Hospital to Home', type: 'Government research report', url: 'https://www.ahrq.gov/patient-safety/reports/liability/neumiller.html', scope: 'D2 and debrief: brand/generic confusion, conflicting information and inaccurate discharge instructions.', limitation: 'The report lists discrepancy categories. It does not establish doses, this patient\'s medication plan or all adverse-effect wording in D5.' },
  { id: 'match', title: 'AHRQ: MATCH Toolkit, Introduction', type: 'Government toolkit', url: 'https://www.ahrq.gov/patient-safety/settings/hospital/match/intro.html', scope: 'D1 and D3: reconciliation process and team roles.', limitation: 'Responsibilities are locally defined; not a universal legal nursing-scope rule.' },
  { id: 'anticoagulants', title: 'Martin et al. (2023): Management of Gastrointestinal Bleeding and Resumption of Oral Anticoagulant Therapy in Patients with Atrial Fibrillation', type: 'Peer-reviewed review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10329066/', scope: 'Day 2 note: individualized balancing of bleeding and thromboembolic risk, multidisciplinary decisions.', limitation: 'Supports individualized review, NOT a universal hold until outpatient GI visits. The fictional hold duration, next-Tuesday plan and emergency counseling need qualified review.' },
  { id: 'furosemide', title: 'DailyMed: LASIX (furosemide) tablet prescribing information', type: 'Official drug labeling', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2c9b4d8f-0770-482d-a9e6-9c616a440b1a', scope: 'D5: brand/generic identity and risks of excessive diuresis and electrolyte loss.', limitation: 'No dose is supplied or inferred for the scenario. Labeling supports general risks, not an individualized prescription or exact dose multiplication.' },
].map((source, index) => ({ ...source, number: index + 1, applicabilityReviewed: false, openedAndCheckedBy: null }));
