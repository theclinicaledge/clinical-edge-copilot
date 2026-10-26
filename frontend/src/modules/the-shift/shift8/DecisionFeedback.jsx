import { SOURCES } from './data.js';
import { reasoning } from './feedbackReason.js';

const mappings = {
  assess: ['S8', 'S14'], opening: ['S2', 'S8'], priya: ['S4', 'S5', 'S2'], marcus: ['S4', 'S5'],
  analysis: ['S12', 'S11'], clearance: ['S11'], restartCPR: ['S2', 'S3', 'S12'], mask: ['S2'],
  leader: ['S4'], page: ['S4', 'S5'], time: ['S4', 'S3', 'S12'], safety: ['S9', 'S11'],
  medication: ['S4', 'S5', 'S3'], summary: ['S4'], handoff: ['S7'], synthesis: ['S5', 'S7'], correction: ['S5', 'S7'],
  request: ['S5'], rhythm: ['S12', 'S11'], clear: ['S11'], duplicate: ['S4', 'S5'], relief: ['S4', 'S12'], complete: ['S5'],
  rewind: ['S4', 'S5', 'S3'],
};

export function FeedbackEvidence({ moment }) {
  const ids = mappings[moment] || [];
  const missingManualSources = ['S11', 'S13'].filter(id => !SOURCES.find(([key]) => key === id)?.[2]);
  return <>{moment === 'assess' && <p className="s8-muted">Claim 24 maps to S8 for this case’s initial assessment. Claim 25 has indirect support only; its scenario-policy rationale remains a documentation gap.</p>}<details className="s8-feedback-evidence"><summary>Sources & review status</summary><p>Existing evidence mapping, not verification of every feedback sentence. Roles and Mercy Point policy are fictional. The founder reports confidential educator approval; no signed record or formal validation is claimed.</p><ul>{ids.map(id => { const source = SOURCES.find(([key]) => key === id); return <li key={id}>{source?.[2] ? <a href={source[2]} target="_blank" rel="noreferrer">{id}: {source[1]}</a> : `${id}: source link missing; review required.`}</li>; })}</ul>{ids.some(id => ['S11', 'S13'].includes(id)) && missingManualSources.length > 0 && <p>Source links missing: {missingManualSources.join(', ')}. Review required.</p>}{['medication','rewind'].includes(moment) && <p>Exception E-1 is founder-authorized for this reviewed Shift 8 v0.8.1 dialogue only. Approval is founder-attested and confidential, not signed or independently documented.</p>}</details></>;
}

export function DecisionWhy({ moment, answer, includeReason = true }) {
  return <>{includeReason && <p className="s8-visible-reason"><strong>Why: </strong>{reasoning(moment, answer)}</p>}{answer.actor && <p className="s8-action-credit">{answer.prompted ? 'Prompted correction · ' : ''}Action credit: {answer.actor}</p>}<FeedbackEvidence moment={moment} /></>;
}
