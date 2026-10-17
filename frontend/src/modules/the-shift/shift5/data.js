export const patients = [
  { room: '410', name: 'Ruth Alvarez', age: 74, label: 'Post-op knee', report: 'Post-op day 1, right total knee replacement. Up with a walker and one assist. High fall risk. Pain 3/10 at 0600.' },
  { room: '412', name: 'James Okafor', age: 58, label: 'Glucose due', report: 'Type 2 diabetes, day 2 for left leg cellulitis. 0600 glucose 78 mg/dL. Ate very little at dinner. Breakfast tray around 0745. Next glucose check due before breakfast.' },
  { room: '414', name: 'Leon Park', age: 66, label: 'Recent surgery', report: 'Open bowel surgery ended at 0300; arrived from PACU at 0430. 0700: HR 88, BP 128/74, RR 16, SpO2 96% on room air. Small spot on the abdominal dressing, outlined at 0600.' },
  { room: '416', name: 'Dana Whitfield', age: 39, label: 'Discharge', report: 'Admitted for a kidney infection, now feeling well. Discharge today; teaching not done yet. Ride expected around 0900.' },
];
export const staff = [
  { id: 'you', name: 'You', role: 'RN', early: 'Free at 0720', late: 'Go to 414 after coverage is arranged' },
  { id: 'jordan', name: 'Jordan', role: 'Nursing assistant', early: 'Finishing vitals; checked off for bedside glucose values', late: 'Reports 414 change at 0730, then free' },
  { id: 'priya', name: 'Priya', role: 'Charge RN', early: "Admission isn't here until 0730; can take one call", late: 'One short task to 0745; can still make staffing calls' },
  { id: 'dee', name: 'Dee', role: 'Buddy RN, rooms 418–422', early: 'Busy with her own rooms', late: 'Can watch rooms and take one patient task to 0800' },
  { id: 'sam', name: 'Sam', role: 'Unit secretary', early: 'Answers call lights by intercom', late: 'Relays messages, not nursing coverage' },
];
export const policy = 'A nursing assistant who is checked off may get a bedside glucose value and must report it to the RN right away. The RN reassesses the patient, interprets the result and decides next steps under the hypoglycemia protocol. Vital signs on a patient whose condition is changing are taken by the RN. Real rules depend on state law, competence and hospital policy.';
export const reasons = [
  { id: 'change', label: 'Most potential to change soon' },
  { id: 'due', label: 'Something time-sensitive is due' },
  { id: 'safety', label: 'Highest safety risk if left alone' },
  { id: 'quick', label: 'Quickest to finish' },
];
export function d1Feedback(room, reason) {
  if (reason === 'change') return room === '414' ? 'Reasonable. His surgery was recent, so a change is a real concern.' : "Good principle. 414's recent surgery is one reason a nurse might see him early; your room may have its own reasons.";
  if (reason === 'due') return room === '412' ? 'Reasonable. His glucose was low-normal, he ate little, and a check is due before breakfast.' : room === '416' ? 'Defensible. Starting teaching early avoids a rushed discharge. Make sure rooms that could change are seen early too.' : 'Fair. 412 and 416 are the rooms with something due soon.';
  if (reason === 'safety') return room === '410' ? 'Defensible. Her fall risk is real, and an early round can prevent her getting up alone.' : "Fair. 410 is the classic fall risk; 414's recent surgery and 412's low-normal glucose are other kinds of risk.";
  return 'Quick wins can help flow, but a first stop is usually chosen by who might change, not by speed.';
}
export const calls = {
  '410': 'I need to use the bathroom. Now, please.',
  '412': "I feel shaky and jittery. Something's off.",
  '416': 'My ride got here early. Can I go home?',
};
export const jordanDirections = {
  A: "She's a high fall risk. Use her walker, stay with her the whole time, leave her with the call light in reach and the bed low, and tell me right away if she's dizzy or in more pain.",
  B: 'Can you help 410 to the bathroom?',
};
export const hold416 = {
  A: "Your nurse knows your ride is here. They'll be in for your discharge teaching by about 0750.",
  B: 'Your nurse will be there soon.',
};
export const dispatchFeedback = {
  '412': {
    you: 'A nurse responds to the new symptoms now.', priya: 'Priya offered one call, accepted 412 and will hand him back at 0730.',
    jordan: "Jordan may collect a glucose value under this unit's policy, but cannot independently assess or decide what to do for a symptomatic patient. No nurse was sent to 412.",
    hold: 'A symptomatic patient is waiting without a nurse. Send a qualified nurse now.',
  },
  '410': {
    you: 'You can help her. Jordan could also assist with clear directions and follow-up.',
    priya: 'Priya can take this call, though Jordan could assist with clear directions and follow-up.',
    jordanA: 'Jordan has specific fall-safety directions and knows what change to report.',
    jordanB: 'Name her fall risk, how to assist her and what to report back.',
    hold: 'The message discourages getting up alone, but a high-fall-risk patient still waits for help.',
  },
  '416': {
    you: 'A nurse can start her discharge teaching.', priya: 'Priya can start teaching within her offered window if the papers are ready and tell you where she stopped.',
    jordan: 'Jordan can reinforce completed teaching, not provide discharge teaching.',
    holdA: 'She has a specific update and a realistic next check-in.', holdB: 'A vague promise leaves her unsure when a nurse will return.',
  },
};
export function dispatchText(room, draft) {
  const person = draft.assignments[room];
  const extra = room === '410' && person === 'jordan' ? draft.jordanDirection : room === '416' && person === 'hold' ? draft.hold416 : '';
  return dispatchFeedback[room][person + (extra || '')] || dispatchFeedback[room][person];
}
export const dispatchAcknowledgement = {
  '412': { priya: "On my way to 412. I'll call you with what I find; I have to hand him back at 0730." },
  '410': { priya: "I'll help her to the bathroom." },
  '416': { priya: "I'll start her teaching if her papers are ready and tell you where I got to." },
};
export const coverageOptions = [
  { id: 'A', text: "Dee, 414's pressure is dropping and I'm going now. Can you take 412: get his 0742 recheck, reassess him and act on it under the protocol? And watch 410 and 416 until 0800.", ack: "Got it. 412 at 0742, and I'm watching 410 and 416 until 0800.", feedback: 'A nurse who is free has accepted 412 and your other rooms out loud.' },
  { id: 'B', text: "Priya, can you take 412's 0742 recheck and reassessment as your short task? Dee, can you watch 410 and 416 until 0800?", ack: "Priya: Yes, that's my one task. I'll call you with the result. Dee: Watching 410 and 416 until 0800. When Priya finishes at 0745, I can take 412 through 0800 if she hands him over to me.", feedback: "Two nurses, each within what they offered. Priya's task ends at 0745; 412 still needs Dee's explicit handback." },
  { id: 'C', text: "Jordan, get 412's glucose at 0742 and give the number straight to Dee. Dee, can you see him with that number, act under the protocol, and watch 410 and 416?", ack: "Jordan: 0742, number to Dee. Dee: Got it. I'll go see him with Jordan's number, and watch 410 and 416 until 0800.", feedback: "Jordan collects the number. A named nurse who has accepted the job reassesses him and decides what's next." },
  { id: 'D', text: "Jordan, get 412's glucose at 0742 and call me with the number.", ack: 'Jordan: Will do.', feedback: "Jordan can collect the number, but he's still shaky and you'll be busy with 414. Name a nurse who can see him and act on it, and ask someone to watch your other rooms." },
  { id: 'E', text: 'Finish what you are doing first, then go to 414.', feedback: "A rising heart rate and falling pressure after surgery shouldn't wait. Hand off what you're doing and go." },
  { id: 'F', text: "Jordan, can you check 414's dressing and tell me if it looks bad?", feedback: "Assessing what the dressing and the patient's change mean is a nursing responsibility. A qualified nurse must respond to 414's deterioration without waiting for Jordan's judgment." },
];
export const v5Steps = [
  { id: 'i', text: 'Call Jordan to take over with her before you leave.', feedback: "Jordan: Coming now. I'll stay with her." },
  { id: 'ii', text: 'Help her back to bed first: walker, call light in reach, bed low. Then go.', feedback: 'About two minutes. She is back in bed before you leave.' },
  { id: 'iii', text: "Tell her to pull the cord when she's done, and go.", feedback: 'A high fall risk patient left alone in the bathroom may try to get up by herself.' },
];
export const helpOptions = [
  { id: 'provider', label: 'Call the surgical provider' }, { id: 'rapid', label: 'Call rapid response', note: 'Any staff member with significant concern can call' },
  { id: 'priya', label: 'Message Priya', note: "She can't leave her admission" },
  { id: 'recheck', label: 'Reinforce the dressing and recheck vitals in 15 minutes first' },
  { id: 'rounds', label: "Wait for the surgeon's 0800 rounds" },
];
export function helpFeedback(selected) {
  if (selected.includes('recheck')) return "You don't need another number. This trend and how he looks are enough to call now.";
  if (selected.includes('rounds')) return "That's 27 minutes for this trend. Call now.";
  if (selected.includes('provider') && selected.includes('rapid')) return 'Bedside help and the team who can act.' + (selected.includes('priya') ? ' Keeping the charge nurse informed is good teamwork.' : '');
  if (selected.includes('provider')) return 'The surgical team needs to know now.' + (selected.includes('priya') ? ' Keeping the charge nurse informed is good teamwork.' : '');
  if (selected.includes('rapid')) return "Right when you're seriously concerned; it brings help fast. Make sure the surgical team hears too, per your hospital's process." + (selected.includes('priya') ? ' Keeping the charge nurse informed is good teamwork.' : '');
  return "Priya should know, but she can't come to the bedside now. Call the provider or rapid response about this deterioration.";
}
export const looseEnds = [
  { id: '412', title: '412 / Mr. Okafor', accepted: "Check in on him when you can, and make sure the treating team knows about this morning's low so they can review his plan under your protocol.", acceptedFeedback: 'The recheck and reassessment are known, and the low is handed to the treating team for plan review.', other: "He's back up. Nothing more needed.", otherFeedback: "A normal recheck isn't the end. The team should know about the low so they can decide whether his plan needs to change." },
  { id: '414', title: '414 / Your role', accepted: 'Stay with his care: carry out new orders as they come, keep reassessing and report how he responds.', acceptedFeedback: 'The team is here, and you remain responsible for reassessment and reporting.', other: 'The team has it now. Head back to your other rooms.', otherFeedback: "He's still your patient. Reassessing and reporting stay with you." },
  { id: 'coverage', title: 'Coverage / 410, 412, 416', accepted: "Dee, can you continue covering 410, 412 and 416 through 0830 while I stay with 414? Please call if anything changes. I'll let Priya know.", acceptedFeedback: 'Dee named the rooms and end time, accepted out loud, and Priya knows. Coverage is confirmed through 0830.', other: "They're stable. Let coverage end.", otherFeedback: "Coverage ends at 0800. Stable patients still need a nurse watching. Get a named nurse's acceptance before treating the loop as closed." },
  { id: '416', title: '416 / Ms. Whitfield', accepted: 'Ask the confirmed covering nurse to update her with a realistic time, and finish her teaching as soon as a nurse is free.', acceptedFeedback: 'She gets an updated expectation; teaching remains an RN task.', other: 'Ask Jordan to go over her discharge papers so she can leave.', otherFeedback: "Teaching needs a nurse. Jordan can reinforce teaching but can't provide it." },
  { id: 'jordan', title: 'Jordan / delegated work', accepted: "Thank Jordan for flagging 414 fast. Tell her you'll take 414's vitals yourself while he's changing, and to tell you right away about any change in your other patients.", acceptedFeedback: "Jordan's report is acknowledged; a changing patient's vitals stay with the RN under this unit's policy.", other: "Ask Jordan to keep doing 414's vitals every 15 minutes.", otherFeedback: "Under this unit's policy, vitals on a patient whose condition is changing stay with the RN." },
];
export const references = [
  ['NCSBN / ANA National Guidelines for Nursing Delegation', 'https://www.ncsbn.org/public-files/NGND-PosPaper_06.pdf', 'Role, competence, acceptance, directions and follow-up; does not authorize specific local tasks.'],
  ['NIDDK Low Blood Glucose', 'https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia', 'General low-glucose information, not a hospital protocol.'],
  ['AHRQ Rapid Response Systems', 'https://psnet.ahrq.gov/primer/rapid-response-systems', 'General principles; facility criteria vary.'],
  ['AHRQ TeamSTEPPS Check-Back', 'https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/checkback.html', 'Closed-loop communication principle.'],
];
