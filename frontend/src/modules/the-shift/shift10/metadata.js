import { KEY, sources } from './content.js';
import { read } from './state.js';

// Public metadata only. Preserve the tested event format and existing attempt key.
export const shift10Entry = {
  id: 'transfer-not-ready', scenarioId: 'SHIFT-010', contentVersion: '0.2', number: '10',
  title: "The Transfer That Isn't Ready", specialty: 'Med-Surg', difficulty: 'Clinical reasoning',
  duration: '10 to 11 minutes', analytics: true,
  description: 'Receive an ED report, prepare the room and take over care when Ruth arrives.',
  objectives: ['Clarify an incoming report and review available records.', 'Assess the arriving patient and obtain baseline information.', 'Communicate discovered findings and name follow-up ownership.'],
  interactions: ['interruptible-report', 'record-review', 'room-preparation', 'receiving-assessment', 'provider-call', 'debrief'],
  review: {
    status: 'Founder reports independent clinical review and approval of Authoring Draft v0.2. Public release authorized by founder.',
    reviewer: null, reviewDate: null, approvedVersion: '0.2',
    sourceVerification: 'Approval is founder-reported. No signed reviewer record or independent verification of every evidence row is claimed. The authoring evidence limitations remain visible. Mercy Point policies are fictional facility-specific rules.',
  },
  sources: sources.map(source => ({ ...source, scope: source.note, limitation: source.note })),
  recommendations: [], storageKey: KEY, readProgress: read, finalStage: 'debrief',
  stageTitle: state => ({ intro: 'ED report', report: 'ED report', bedside: 'Receiving care', debrief: 'Debrief' })[state.phase],
  progressLabel: state => state.phase === 'debrief' ? 'Debrief reached' : state.phase === 'intro' ? 'Not started' : `Continue: ${state.phase === 'report' ? 'ED report' : 'Receiving care'}`,
  image: '../shift10/poster.svg', imageAlt: 'Original illustration of the receiving-unit door from Shift 10.',
};
