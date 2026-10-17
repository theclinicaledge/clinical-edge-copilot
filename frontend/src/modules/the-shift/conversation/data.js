// SHIFT-004 v0.4: approved private script and per-placement feedback table.
// Psychiatric-mental health review remains pending.
export const CONTENT_VERSION = '0.4';
export const title = 'The Conversation That Changes Everything';
export const scenes = [['2100', 'Report'], ['2115', 'Open the door'], ['2120', 'Listen closely'], ['2125', 'Ask directly'], ['2127', 'Stay & connect'], ['2130', 'Be honest'], ['2230', 'Reflect']];
export const patients = [
  { room: '16', setting: '71-year-old, pneumonia, improving', report: 'Asleep. Due for vitals at 0000.', status: 'Stable' },
  { room: '18', setting: '62-year-old, admitted 3 days ago with a diabetic foot infection. Today the surgeon told him he needs a below-knee amputation. His wife died last year.', report: "Really quiet since the surgeon came by. Didn't touch dinner. I think he's just processing.", status: 'Stable vitals' },
  { room: '20', setting: '48-year-old, cellulitis, on IV antibiotics', report: "Pump's been fussy all day.", status: 'Stable' },
];
export const opening = [
  { id: 'presence', text: "Today was a big day. I've got some time. Would you like to tell me about it?", result: 'Correct', feedback: 'Open-ended, and it offers your presence. It gives him room to talk.' },
  { id: 'reassure', text: "Don't worry, the surgery will go great and you'll feel better soon.", result: 'No', feedback: "False reassurance. It shuts the door on whatever he's actually feeling." },
  { id: 'leave', text: 'Okay, great. Call me if you need anything.', result: 'No', feedback: 'You accepted "everything\'s sorted out" at face value and left. That phrase deserved a second look.' },
  { id: 'dinner', text: "Why didn't you eat your dinner?", result: 'Not best', feedback: '"Why" questions can feel like criticism. Start with how he\'s doing.' },
];
export const cues = [
  { id: 'loss', text: "That's my wife, Elena. A year ago this week.", tier: 'Supporting', feedback: 'A recent major loss and an anniversary both raise concern.' },
  { id: 'affairs', text: 'I called my son today. Told him where the will is, and the passwords.', tier: 'Supporting', feedback: 'Putting affairs in order, especially suddenly, can be a warning sign.' },
  { id: 'burden', text: "Without my leg I'd just be a burden to him. He's got his own kids.", tier: 'Essential', feedback: 'Feeling like a burden to others is a recognized warning sign.' },
  { id: 'food', text: "The food here's terrible, by the way.", tier: 'Not a warning sign', feedback: 'No penalty. An ordinary complaint.' },
  { id: 'watch', action: 'He takes off his watch and holds it out.', text: "Here. You've been kind. I won't need this.", tier: 'Essential', feedback: 'Giving away possessions is a classic warning sign.' },
];
export const asking = [
  { id: 'direct', text: "Sometimes when people go through this much, they think about ending their life. Are you thinking about killing yourself?", result: 'Correct', feedback: "Direct, calm and non-judgmental. Asking directly does not put the idea in someone's head; it often brings relief." },
  { id: 'judgment', text: "You're not thinking about doing anything stupid, are you?", result: 'No', feedback: 'Judgmental, and worded to get a "no." He\'s unlikely to tell you the truth.' },
  { id: 'report', text: "I'll let the doctor know you're feeling down tonight.", result: 'Not best', feedback: "Reporting matters, but you'd be passing along a guess. Ask first, so you know what you're reporting." },
  { id: 'change', text: "Let's talk about the surgery plan instead. That might help.", result: 'No', feedback: 'Changing the subject tells him this topic is off-limits.' },
];
export const zones = [
  { id: 'first', title: 'Immediate response', detail: 'Stay with the patient and summon help.' },
  { id: 'together', title: 'Safety actions and assessment', detail: 'Precautions, access to means and further assessment. These can happen at the same time as the immediate response.' },
  { id: 'then', title: 'Ongoing care and documentation', detail: 'Keep supporting him, share what you learn and document, without delaying safety.' },
  { id: 'not-now', title: 'Not now', detail: 'Actions to avoid right now.' },
];
export const actions = [
  { id: 'stay', text: 'Stay with him. Use the call light or your phone to get help without leaving the room', placements: [
    { groups: ['first'], status: 'Accepted', feedback: 'He just disclosed suicidal thoughts and possible access to means. He should not be alone, even for a minute.' },
    { groups: ['together', 'then'], status: 'Revisit', feedback: 'Staying and calling for help comes first. Everything else builds on it.' },
    { groups: ['not-now'], status: 'Unsafe', feedback: "Staying with him and calling for help is the one step that can't wait." },
  ] },
  { id: 'notify', text: "Notify the provider now and start your facility's suicide precautions (for example, continuous observation)", placements: [
    { groups: ['first', 'together'], status: 'Accepted', feedback: 'Escalation happens now, not after a full assessment.' },
    { groups: ['then'], status: 'Revisit', feedback: 'This belongs with the first actions, not after support and charting. Escalation happens now.' },
    { groups: ['not-now'], status: 'Unsafe', feedback: "Notifying the provider and starting precautions can't wait. Escalation happens now, while you stay with him." },
  ] },
  { id: 'means', text: 'Ask where the saved pills are, and remove them and other hazards per policy', placements: [
    { groups: ['first', 'together'], status: 'Accepted', feedback: "Reducing access to means saves lives. Follow your facility's process." },
    { groups: ['then'], status: 'Revisit', feedback: 'Addressing the saved pills is part of keeping him safe now, not a later task.' },
    { groups: ['not-now'], status: 'Unsafe', feedback: "Reducing access to means saves lives. Address the saved pills now, following your facility's process." },
  ] },
  { id: 'assess', text: 'Gently ask more: is he thinking of acting on it, how, and when?', placements: [
    { groups: ['first', 'together'], status: 'Accepted', feedback: 'Further assessment helps the team, but it never delays getting help or keeping him safe.' },
    { groups: ['then', 'not-now'], status: 'Revisit', feedback: 'Asking more helps the team understand his risk now. It happens alongside getting help, never instead of it.' },
  ] },
  { id: 'talk', text: 'Keep talking with him', placements: [
    { groups: ['first', 'together', 'then'], status: 'Accepted', feedback: 'Stay connected. Supportive conversation continues the whole time.' },
    { groups: ['not-now'], status: 'Revisit', feedback: 'Stay connected. Talking with him continues throughout, even while help arrives.' },
  ] },
  { id: 'document', text: 'Document what he said, in his own words', placements: [
    { groups: ['then'], status: 'Accepted', feedback: 'Exact quotes help the team assess risk.' },
    { groups: ['first', 'together'], status: 'Revisit', feedback: 'Document soon, but not while it competes with keeping him safe.' },
    { groups: ['not-now'], status: 'Revisit', feedback: "Don't skip documenting. His exact words help the team assess risk." },
  ] },
  { id: 'charge', text: 'Step out to find the charge nurse', placements: [
    { groups: ['not-now'], status: 'Accepted', feedback: 'Leaving him alone is the one thing not to do. Call for help instead.' },
    { groups: ['first', 'together', 'then'], status: 'Unsafe', feedback: 'Leaving him alone is the one thing not to do. Call for help instead.' },
  ] },
  { id: 'pump', text: "Go silence Room 20's pump first", placements: [
    { groups: ['not-now'], status: 'Accepted', feedback: "A beeping pump can wait or go to a colleague. He can't." },
    { groups: ['first', 'together', 'then'], status: 'Unsafe', feedback: "A beeping pump can wait or go to a colleague. He can't." },
  ] },
];
// Fixed authored order, intentionally not grouped by the expected zone.
export const actionOrder = ['notify', 'charge', 'document', 'stay', 'pump', 'talk', 'assess', 'means'];
export const confidentiality = [
  { id: 'honest', text: "I can't keep this between us, because your safety matters to me. I'm going to stay right here while we get you more support.", result: 'Correct', feedback: 'Honest about the limits of confidentiality, warm, and you stay. Trust survives honesty better than a broken promise.' },
  { id: 'secret', text: 'Okay. It stays between us.', result: 'No (unsafe)', feedback: "You can't keep this promise, and keeping it could cost his life." },
  { id: 'required', text: "I'm required to report this.", result: 'Not best', feedback: 'True, but it sounds like a rule, not care. Lead with why: his safety.' },
  { id: 'promise', text: "Nobody's going to lock you up. Don't worry.", result: 'No', feedback: "False reassurance. You don't know the plan yet, and he'll remember the promise." },
];
export const script = {
  actionGuidance: 'These groups describe priorities, not a strict order. In real care, many of these happen at once. There is no required order within a group.',
  actionReview: 'These groups describe priorities, not a strict order. Safety actions and assessment can overlap with the immediate response. There is no required order within a group.',
  bridges: {
    opening: 'Taking the safer approach: you sit down and ask about his day.',
    asking: 'Taking the safer approach: you ask him directly.',
    actions: 'Taking the safer approach: you stay with him, help comes to you, and safety actions begin.',
    confidentiality: "Taking the safer approach: you're honest that you can't keep this secret, and you stay.",
  },
  ending: { direct: 'Because you asked and stayed:', guided: 'The safer path, as reviewed above:', limitation: 'This outcome follows the safer responses, not every choice you made. Your review below shows where to focus.' },
  actionReflections: ["After a disclosure like this, don't leave the patient alone. Stay and get help to come to you.", "Getting help, starting precautions and addressing the saved pills can't wait. They happen now, while you stay with him.", "You kept him safe and didn't leave him alone. A few placements are worth another look below.", 'You stayed with him and got help to come to you.'],
  assessmentNote: "After a patient shares suicidal thoughts, hospitals use an evidence-based process to assess risk, often built around a validated tool such as the ASQ or C-SSRS. Follow your facility's process. A tool supports the team's assessment; it never replaces staying with the patient and getting help now.",
  notice: 'This Shift includes a conversation about suicide. If this topic is hard for you right now, you can skip it. Support is available either way.',
  bedside: "You go in for your first check. He's sitting up with the lights low, holding a framed photo. He smiles politely.",
  firstLine: "Don't worry about me tonight. I've got everything sorted out.",
  cueTeaching: "Each line alone could sound normal. Together, after hard news, they form a pattern. A calm, polite manner doesn't rule out risk. Listen to what he says and does.",
  reveal: "Yeah. I've thought about it. It'd be easier for everyone. I've been saving some of my pills.",
  request: "Please don't tell anyone. I don't want to be locked up somewhere.",
  outcome: [
    ['2140', 'A sitter is at his bedside, the pills are secured, and the provider is evaluating him, with a psychiatry consult requested.'],
    ['2150', "A colleague fixed Room 20's pump."],
    ['2230', "Before you leave his room, he says: 'Nobody's asked me that before. Thank you for asking.'"],
  ],
  takeaways: ['Listen for the quiet warning signs: being a burden, giving things away, putting affairs in order, a recent loss.', "If you're worried, ask directly. Then stay."],
  why: ['People in crisis often don\'t say "I\'m suicidal." They say things that sound ordinary, which is why recognizing patterns matters.', 'Asking directly about suicide does not increase risk, and many people feel relief that someone asked.', 'Reducing access to means and keeping the person safe and observed are among the most effective immediate actions.'],
  ask: 'Why does asking directly about suicide help instead of harm?',
  practice: 'What are examples of therapeutic vs. non-therapeutic responses in nursing?',
  support: "Scenarios like this can bring up hard feelings, especially if you've lived something similar. If you or someone you know is struggling, you can call or text 988 (Suicide and Crisis Lifeline, US) any time. If someone is in immediate danger, call 911.",
  share: 'He said everything was sorted out. Would you have asked? theclinicaledge.org',
};
export const reflections = [
  ['The opening', 'You opened the door instead of closing it.', "'Everything's sorted out' deserved a second look."],
  ['The words underneath', 'You heard the burden statement and the gift of his watch.', 'Feeling like a burden and giving things away are warning signs, even when someone seems calm.'],
  ['The direct question', 'You asked directly.', "Asking directly doesn't plant the idea; it opens the door."],
  ['Keeping him safe', 'You stayed with him and got help to come to you.', 'Revisit the placements below. Stay, get help to come to you, and start safety actions now.'],
  ['The request', "You were honest about what you couldn't keep secret, and you stayed.", 'Never promise secrecy about safety.'],
];
export const sources = [
  { id: 'warning', title: 'NIMH: Warning Signs of Suicide', url: 'https://www.nimh.nih.gov/health/publications/warning-signs-of-suicide', scope: 'D2: burden statements, giving away possessions, putting affairs in order.', limitation: 'Warning signs are not a diagnosis. Anniversary-specific applicability and cue tiers need specialty review.' },
  { id: 'steps', title: 'NIMH: 5 Action Steps to Help Someone Having Thoughts of Suicide', url: 'https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide', scope: 'D3 and D4: asking directly, connection and means safety.', limitation: 'Public guidance, not a hospital observation policy or an individualized risk assessment.' },
  { id: 'dazzi', title: 'Dazzi et al. (2014): Does asking about suicide and related behaviours induce suicidal ideation?', url: 'https://pubmed.ncbi.nlm.nih.gov/24998511/', scope: 'D3: evidence concerning asking about suicide.', limitation: 'PubMed citation/abstract checked; not independent review of this scripted dialogue.' },
  { id: 'joint', title: 'The Joint Commission: 2026 Hospital National Performance Goals, NPG.08.01.01', url: 'https://digitalassets.jointcommission.org/api/public/content/9ca80055182b4274842a5780a94f2c82?v=149a13a9', scope: 'D4 and Good to know: hospital suicide precautions, validated screening and evidence-based assessment. EPs 3 to 7 also apply to patients expressing suicidal ideation during care.', limitation: 'ASQ and C-SSRS are examples in the scenario, not named tools endorsed by this standard. Screening versus assessment, tool examples, local scope and the accepted-groups table need psychiatric-mental health review.' },
  { id: 'support', title: 'NY Office of Mental Health: 988 Suicide and Crisis Lifeline', url: 'https://omh.ny.gov/omhweb/crisis/988.html', scope: 'US support resources.', limitation: 'US-specific. Ask Clinical Edge is not a crisis service.' },
  { id: 'communication', title: 'OpenStax: Therapeutic Communication and Relationships, section 3.1', url: 'https://openstax.org/books/psychiatric-mental-health/pages/3-1-therapeutic-communication-and-relationships', scope: 'D1, D3 and D5: communication and therapeutic boundaries.', limitation: 'Link only; no textbook figures copied. Exact confidentiality rationale and wording require specialty review.' },
];
export const sourceIds = { opening: ['communication'], cues: ['warning'], asking: ['steps', 'dazzi', 'communication'], actions: ['steps', 'joint'], confidentiality: ['communication', 'joint'] };
