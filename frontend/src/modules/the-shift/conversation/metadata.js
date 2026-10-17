import { CONTENT_VERSION, title, script, scenes, sources } from './data.js';
import { read, KEY } from './progress.js';
export const conversationEntry = {
  id: 'conversation', scenarioId: 'SHIFT-004', contentVersion: CONTENT_VERSION, originalVersion: '0.2', number: '04', title,
  private: false, specialty: 'Psychiatric-mental health', difficulty: 'Foundations', duration: '5 to 6 minutes',
  description: 'A quiet room. A few ordinary words. A conversation worth staying for.',
  learnerLevels: ['Student', 'New grad'], estimatedMinutes: 6, decisionCount: 5,
  coreLesson: 'Notice the quiet warning signs, ask about suicide directly, never leave the patient alone, and never promise to keep it secret',
  objectives: ['Use an open-ended, therapeutic response instead of reassurance or closing the conversation.', 'Recognize verbal and behavioral warning signs of suicide in a medical patient.', 'Ask directly and non-judgmentally about suicidal thoughts.', 'Take immediate safety actions: stay, call for help, remove means per policy, notify the provider.', 'Respond to a request for secrecy honestly and with care.'],
  concepts: ['therapeutic-communication', 'suicide-warning-signs', 'asking-directly', 'patient-safety-observation', 'means-safety', 'confidentiality-limits'],
  interactions: ['progressive-dialogue', 'verbal-cue-selection', 'therapeutic-response', 'action-zones'],
  judgmentSteps: [{ decision: 'D1', steps: ['Generate solutions'] }, { decision: 'D2', steps: ['Recognize cues'] }, { decision: 'D3', steps: ['Analyze cues', 'Take action'] }, { decision: 'D4', steps: ['Take action'] }, { decision: 'D5', steps: ['Evaluate', 'Communicate'] }],
  review: { status: 'Nurse approval of this scenario and its references is reported by the founder. Reviewer identity and specialty credentials were not supplied.', independentStatus: 'Founder-reported nurse approval', reviewer: null, reviewDate: null, approvedVersion: CONTENT_VERSION },
  signOffs: { founder: { name: 'Mohamed', credentials: null, date: null, version: '0.4', notes: 'Founder explicitly authorizes public v0.4 release on October 16, 2026 Pacific after reporting nurse review of every step and relevant references.' }, specialty: { name: null, credentials: null, date: null, version: null, notes: 'Founder reports nurse approval for publication of v0.4. Reviewer identity, specialty qualification and actual review date were not supplied; no independent specialty verification claimed.' } },
  specialtyReviewerNeeded: true, sources,
  assetRecords: [{ id: 'quiet-room', origin: 'Original SVG construction', rights: 'No copied photograph or published figure', clinicalReview: 'Nurse scenario-package approval reported by founder', alternative: 'Calm abstract hospital room, framed photograph and patient silhouette' }],
  scriptModule: '../conversation/data.js', renderer: '../conversation/Conversation.jsx', progress: '../conversation/progress.js',
  storageKey: KEY, readProgress: read, finalStage: 6, stageTitle: state => scenes[state.stage][1],
  get askQuestion() { return script.ask; },
  get askQuestions() { return { responses: script.practice }; },
  recommendations: [
    { id: 'ask', title: 'Prepare an educational question', detail: 'Ask availability for this topic is unverified. No automatic submission.', path: '/ask' },
    { id: 'responses', title: 'Explore therapeutic responses', detail: 'Optional Ask handoff. Normal consent, safety checks and limits apply.', path: '/ask?topic=responses' },
  ],
  templateExceptions: ['Founder authorizes public v0.4 release following reported nurse review. Reviewer identity and psychiatric specialty qualification were not supplied.', 'No public scoring or competency claim.', 'Original choices remain immutable after feedback; v0.4 safer-path bridges and conditional ending are labelled.', 'Ask auto-prefill/guaranteed acceptance not implemented. No matching Reference Hub entry exists.', 'v0.4 uses eight cards with the authored Accepted, Revisit and Unsafe groups; no order within groups.', 'Earlier v0.2/v0.3 progress remains a read-only version-labelled record under its existing key. New v0.4 plays use a separate key without inferring answers to the split card.'],
};
