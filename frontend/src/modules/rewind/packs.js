import { ASSIGNMENTS, CALLS, INFORMATION, REWINDS, VERSION } from '../med-surg-track/content.js';

const source = (title, url, scope) => ({ title, url, scope });
const sources = {
  rhythm: source('AHA: Adult tachyarrhythmia with a pulse, 2025', 'https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-ACLS-Tachycardia-250514.pdf', 'Clinical assessment and signs of instability. This practice does not teach medication or electrical treatment.'),
  artifact: source('Knight et al.: ECG artifact mimicking ventricular tachycardia', 'https://pubmed.ncbi.nlm.nih.gov/10528037/', 'Reported consequences of mistaking artifact for ventricular tachycardia; not a rule for dismissing alarms.'),
  reconcile: source('AHRQ MATCH: Medication reconciliation process', 'https://www.ahrq.gov/patient-safety/settings/hospital/match/chapter-3.html', 'Resolve discrepancies and communicate a consistent medication plan at transitions.'),
  teach: source('AHRQ: Teach-back, Tool 5', 'https://www.ahrq.gov/health-literacy/improve/precautions/tool5.html', 'Check understanding in the patient’s own words; explain differently and check again when needed.'),
  ask: source('NIMH: Five action steps', 'https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide', 'Direct questions, listening and connection to support. Not a substitute for hospital assessment.'),
  safety: source('NIMH: Adult inpatient brief suicide safety assessment', 'https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials/adult-inpatient/adult-inpatient-brief-suicide-safety-assessment-guide', 'Current suicidal thoughts require urgent evaluation and the patient must not be left alone. Formal assessment and disposition belong to qualified clinicians under local policy.'),
};
const option = (id, title, label, feedback) => ({ id, title, label, feedback });
const variation = (id, title, history, facts, question, options, focus, rationale, references, alternatives) => ({ id, title, history, facts, question, options, focus, rationale, sources: references, alternatives });

const monitor = [
  variation('monitor-motion', 'During the morning wash',
    'Return to the first alarm in Room 22. In this version you are already at the bedside while the patient washes his face. Use these observations rather than the original alarm outcome.',
    ['The monitor briefly labels a noisy segment “V-tach, 180.”', 'He is alert, speaking comfortably and denies new symptoms. Palpated pulse is regular at 82/min; BP 126/74.', 'The noisy signal follows arm movement. When his arm rests, a regular narrow-complex tracing at 82 returns. One electrode edge is lifting.'],
    'What is the best next step with the information you have?',
    [option('ignore', 'Silence the alarm and leave the equipment as it is', 'Revisit', 'The signal problem is still unresolved. A comfortable patient does not make unreliable monitoring acceptable.'),
      option('verify', 'Check electrode contact and leads, then confirm the tracing and reassess him', 'Accepted', 'This addresses the observed signal problem while keeping the patient assessment central.'),
      option('diagnose', 'Report confirmed ventricular tachycardia from the alarm label alone', 'Revisit', 'The label conflicts with the pulse and the movement-linked tracing. Report observations and uncertainty, not a confirmed rhythm from the label.')],
    'Verify the signal and the patient', 'The pulse and tracing disagree during movement. These findings support investigating artifact, not declaring every similar alarm harmless. Continue assessment if the discrepancy persists or the patient changes.', [sources.artifact],
    'Ask a colleague for help checking the signal when needed. New symptoms or an uncertain persistent rhythm require prompt clinical reassessment and escalation appropriate to the findings.'),
  variation('monitor-change', 'A different bedside picture',
    'Return to Room 24 after the irregular-rate alert. This is a complete alternative assessment, not the original assessment.',
    ['The irregular narrow-complex rhythm is sustained at about 158/min; palpated pulse is rapid and irregular.', 'BP is 82/50 compared with 128/74 earlier. He is newly confused, clammy and says he feels faint.', 'He is breathing and has a pulse. You are with him; a colleague can summon help.'],
    'Which response best fits this change?',
    [option('ecg-first', 'Finish obtaining a 12-lead before contacting anyone', 'Unsafe', 'An ECG can help, but completing it first would delay help for the current deterioration.'),
      option('later', 'Document the rate and recheck after the next round', 'Unsafe', 'The new symptoms and low BP need attention now.'),
      option('help', 'Stay with him and summon urgent bedside help through the unit’s response process', 'Accepted', 'Escalate while assessing and supporting him within your role and local protocol. Share the BP change, mental status and rhythm observations.')],
    'The assessment changes the urgency', 'Hypotension and new confusion with sustained tachycardia are concerning signs of instability. Assessment and urgent help proceed together; naming the exact rhythm must not delay that response.', [sources.rhythm],
    'The appropriate provider and rapid-response pathway depend on the hospital. This scenario does not select a drug, dose or cardioversion setting.'),
  variation('monitor-stable', 'The alert stays on',
    'Return to Room 24 with a different set of findings. The new irregular rhythm persists, but the original symptoms and BP drop are absent.',
    ['Repeat tracing remains irregular and narrow-complex at 118–126/min; pulse is irregular.', 'He is alert, warm and comfortable, without chest discomfort, dyspnea or dizziness. BP 128/76 is unchanged.', 'There is no documented history of this rhythm and no provider assessment of this new change yet.'],
    'What should you do next?',
    [option('report', 'Continue assessment and monitoring, and promptly report the new rhythm for evaluation', 'Accepted', 'The new sustained change still needs review, even though these observations do not show the instability in the other version.'),
      option('dismiss', 'Treat the new rhythm as artifact because he feels well', 'Revisit', 'Feeling well does not establish artifact. The pulse and repeated tracing support a real change that needs evaluation.'),
      option('independent', 'Choose a rate-control medicine yourself based on the monitor rate', 'Unsafe', 'A monitor rate does not authorize an independent treatment choice.')],
    'Stable observations still need follow-up', 'Continue monitoring and obtain further rhythm evaluation through the unit’s process. The absence of the other version’s deterioration changes the immediate response; it does not remove the need to report a new sustained rhythm.', [sources.rhythm],
    'A 12-lead and clinical review help clarify the rhythm. Escalate sooner if symptoms or hemodynamic changes develop; local criteria may require an earlier response.'),
];

const discharge = [
  variation('discharge-conflict', 'The ride is waiting',
    'Return to the discharge review for the patient recovering from a heart failure flare and a recent GI bleed. In this version the blood-thinner instructions remain unresolved.',
    ['The medication list says to stop the blood thinner; the patient instructions say to continue it.', 'No prescriber clarification or corrected document is available.', 'He feels well and his daughter’s ride is outside. There are no new symptoms in this version.'],
    'How should you handle the conflicting instructions?',
    [option('choose-stop', 'Tell him to follow the stop instruction because of the recent bleed', 'Unsafe', 'That would choose the treatment plan without resolving the conflict. The earlier bleed alone does not settle the intended discharge order.'),
      option('clarify', 'Contact the discharging prescriber and reconcile the instructions before completing discharge', 'Accepted', 'Clarify intent through the authorized process; involve pharmacy and update the patient and team about the delay.'),
      option('later', 'Send both documents home and let the outpatient team sort it out', 'Unsafe', 'The patient would still have contradictory instructions to act on.')],
    'A clear plan before teaching', 'A waiting ride does not resolve a medication discrepancy. The goal is one confirmed plan, not assuming either stopping or continuing is automatically correct.', [sources.reconcile],
    'Pharmacy can help investigate and reconcile the documents. Follow local roles for order clarification and correction; do not independently choose the disputed treatment.'),
  variation('discharge-repeat', 'Two names at home',
    'Return to teaching after the prescriber has clarified the plan and all discharge documents now agree. There is no remaining order conflict in this version.',
    ['The reconciled list explicitly states that the new furosemide prescription replaces the home Lasix bottle.', 'During show-me, he places both bottles into his morning plan and calls them different medicines.', 'His daughter asks you to explain again. They have time to review the instructions.'],
    'What is the most useful next step?',
    [option('note-only', 'Write a reminder on the sheet and finish without another check', 'Revisit', 'A written note alone does not show whether the misunderstanding has changed.'),
      option('both', 'Accept both bottles because both names appear in the history', 'Unsafe', 'The confirmed plan says the new prescription replaces the home bottle; accepting both would contradict it.'),
      option('reteach', 'Explain the two names using the confirmed list, then repeat the show-me', 'Accepted', 'Use a different explanation and ask him to demonstrate his plan again. Include his daughter with his agreement.')],
    'Teach-back reveals what to clarify', 'The order is already reconciled; the problem is how he plans to use it at home. Re-explain the replacement and verify understanding without blame.', [sources.teach, sources.reconcile],
    'If the label or replacement instruction is unclear, ask pharmacy or the prescriber. Do not invent a new medication schedule or change the confirmed plan.'),
  variation('discharge-understood', 'Show me tomorrow',
    'Return to the same discharge after clarification and teaching. This version includes a successful demonstration.',
    ['The prescriber-confirmed list and patient instructions agree.', 'Using the bottles and written plan, he correctly shows what he will take, identifies the replaced bottle and explains the changes in his own words.', 'He and his daughter know the follow-up arrangements and whom to contact with questions. No other discharge concern is identified.'],
    'What is the appropriate next step?',
    [option('complete', 'Document what he demonstrated and complete the remaining discharge checks', 'Accepted', 'Understanding has been demonstrated. Confirm the remaining local requirements and provide the agreed written plan.'),
      option('memory', 'Repeat the entire lesson until he recites it without looking at the sheet', 'Revisit', 'The aim is understanding and using the plan, not memorizing it without support.'),
      option('replace', 'Substitute a generic medication handout for the individualized plan', 'Revisit', 'A general handout does not replace the reconciled instructions he just demonstrated.')],
    'Recognize when the teaching worked', 'He explained and demonstrated the plan, rather than merely agreeing. Record the check and move forward when the other discharge requirements are met.', [sources.teach],
    'Address any new question or discrepancy before leaving. Written instructions can support teach-back; using them is not a failure.'),
];

const conversation = [
  variation('conversation-words', 'A different opening',
    'Return to the evening conversation with the adult patient facing amputation after a foot infection. In this version he has not disclosed suicidal thoughts or a plan.',
    ['He says, “I do not know how my son will manage with me like this.”', 'He is quiet and looks away. No direct question about suicide has been asked yet.', 'You have time to stay and listen. A statement about being a burden needs exploration, not an assumption about his intent.'],
    'Which response best opens a clear conversation?',
    [option('reassure', '“Your son will manage. Try not to think about it.”', 'Revisit', 'That reassurance moves away from what he is trying to express.'),
      option('direct', '“You sound worried about being a burden. Are you thinking about killing yourself?”', 'Accepted', 'Acknowledge his concern and ask plainly, calmly and without judgment. Listen to the answer and follow the unit’s assessment process.'),
      option('assume', 'Document suicidal intent without asking him what he means', 'Revisit', 'The concerning statement needs assessment; it does not establish intent on its own.')],
    'Ask instead of assuming', 'Direct questions give the patient room to describe what is happening. They do not replace a fuller assessment or determine risk by themselves.', [sources.ask],
    'If he discloses current suicidal thoughts, stay with him and obtain urgent help through the unit process. Do not delay that response to finish a checklist.'),
  variation('conversation-stay', 'No plan described',
    'Return to the bedside after asking directly. In this version he describes thoughts of suicide now but has not described a plan.',
    ['He says, “Yes, I am thinking about killing myself right now.”', 'When asked about a plan, he says, “I have not worked that out.” Access to possible means has not yet been assessed.', 'He remains calm and cooperative. Another room’s pump begins beeping; you can call a colleague from here.'],
    'Which immediate response fits these facts?',
    [option('leave', 'Check the other room first because he has no described plan', 'Unsafe', 'No described plan does not make current suicidal thoughts safe to leave unattended.'),
      option('promise', 'Ask for a promise not to act and use that as the safety plan', 'Unsafe', 'A promise is not a substitute for assessment, observation or support.'),
      option('stay', 'Stay with him, call for help from the room and initiate the unit’s safety response', 'Accepted', 'Arrange urgent evaluation and safety measures under local policy. Further assessment happens alongside help, not before it.')],
    'Current thoughts need immediate support', 'Being calm and having no stated plan do not cancel the current disclosure. Keep him accompanied while the team arranges urgent evaluation.', [sources.safety],
    'Ask a colleague to handle the other task. Qualified clinicians determine the observation and assessment plan through hospital policy; this practice does not assign a risk score.'),
  variation('conversation-trust', 'Keep it between us',
    'Return to the conversation after he has disclosed current suicidal thoughts. You are staying with him and calling for help. He asks you not to tell the care team.',
    ['He says, “Please do not tell anyone. I trusted you.”', 'The urgent safety concern has not been resolved.', 'You can explain what happens next while remaining with him. You cannot promise a particular evaluation outcome.'],
    'What would you say?',
    [option('honest', '“Thank you for trusting me. I need to involve the team to help keep you safe, and I will stay with you.”', 'Accepted', 'This explains the necessary next step without abandoning the relationship or promising secrecy.'),
      option('secret', '“I will keep it between us if you promise you will be okay.”', 'Unsafe', 'That promise would obstruct the help needed for the current disclosure.'),
      option('guarantee', '“I can promise you will not need any additional observation.”', 'Revisit', 'You do not know the team’s assessment or safety plan yet.')],
    'Be clear and stay connected', 'Explain the involvement of the care team as part of helping him stay safe. Warmth and honesty can accompany urgent action.', [sources.ask, sources.safety],
    'Share relevant information with the appropriate care team under policy. Continue listening; do not bargain away assessment or make promises about disposition.'),
];

export const PACKS = {
  ...Object.fromEntries(ASSIGNMENTS.map(a => [a.id, { title: a.title, version: VERSION, variations: REWINDS[a.id], legacy: true }])),
  'monitor-alarm': { title: 'The Monitor Alarm', version: '1.0.0-draft', variations: monitor, review: 'New Rewind content: source-checked draft, awaiting clinical review.', takeaway: 'Check the patient, the signal and the trend together. A monitor label alone does not decide the response.' },
  'discharge-puzzle': { title: 'The Discharge Puzzle', version: '1.0.0-draft', variations: discharge, review: 'New Rewind content: source-checked draft, awaiting clinical review.', takeaway: 'First establish one clear plan. Then check how the patient will use it. Re-teach when needed and recognize demonstrated understanding.' },
  conversation: { title: 'The Conversation That Changes Everything', version: '1.0.0-draft', variations: conversation, review: 'New Rewind content: source-checked draft, awaiting mental-health clinical review.', takeaway: 'Ask clearly, listen without judgment and act on what is disclosed. Supportive conversation continues while help is arranged.' },
};
export const optionsFor = v => v.options || CALLS;
export const needsInformation = (v, call) => !v.options && call === 'information';
export const validResponse = (v, call, info) => optionsFor(v).some(o => o.id === call) && (!needsInformation(v, call) || INFORMATION.some(([key]) => key === info));
