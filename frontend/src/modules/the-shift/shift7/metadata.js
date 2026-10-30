import { VERSION, KEY, stages, sources } from './data.js';
import { read } from './rules.js';
export const shift7Entry = {
 id: 'missing-time', scenarioId: 'SHIFT-007', contentVersion: VERSION, number: '07', title: 'The Missing Time',
 specialty: 'ED', difficulty: 'Clinical reasoning', duration: '5 to 7 minutes', analytics: true,
 description: 'One report. Three perspectives. Build the story behind a time that sounds certain.',
 objectives: ['Start the appropriate response while gathering history.', 'Separate reported baseline, symptoms noticed and activity records.', 'Hand off evidence with its source and uncertainty.'],
 review: { status: 'Founder reports review by himself and a nurse colleague. Release authorized by founder.', sourceVerification: 'Teaching claims checked against the listed sources. References support the principles, not the fictional case details.', reviewer: 'Mohamed Laayouni, RN, and nurse colleague (name not supplied)', reviewDate: null, approvedVersion: VERSION, reportedOn: '2026-10-23' },
 sources, recommendations: [], storageKey: KEY, readProgress: read, finalStage: 5, stageTitle: p => stages[p.stage],
 progressLabel: p => p.stage === 5 ? 'Debrief reached' : p.stage > 0 ? `Continue: ${stages[p.stage]}` : 'Not started',
};
