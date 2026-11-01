// Existing synthetic presentation text from ask-mobile-presentation.spec.ts.
// These are UI fixtures, not model results or clinically reviewed teaching.
const respiratory = 'Oxygen saturation describes hemoglobin oxygenation, not carbon dioxide clearance. Supplemental oxygen can preserve saturation despite inadequate ventilation.\n\nAssess respiratory effort and mental status alongside available carbon dioxide measurements; no single oxygen saturation establishes adequate ventilation.';
export const readingQuestion = 'Why can oxygen saturation look normal while ventilation is inadequate?';
export const readingAnswer = {
  requestId: 'synthetic-reading-1', contextMode: 'general', answer: respiratory,
  details: [
    { heading: 'Why it matters', text: respiratory },
    { heading: 'What changes interpretation', text: 'Recognition time may differ from onset. Missing history, exposures, examinations, comparisons and measurements remain unknown, never normal or absent.' },
    { heading: 'At the bedside', text: '- Assess respiratory effort and mental status alongside available carbon dioxide measurements; no single oxygen saturation establishes adequate ventilation.\n- Clarify baseline and recognition timing; focused neurologic findings, available glucose and medication/ventilation context can separate possibilities. Several contributors may coexist.' },
  ],
  evidence: { status: 'not_independently_source_verified', requiresVerification: true, sources: [] },
};
export const shortAnswer = { requestId: 'synthetic-reading-2', contextMode: 'general', answer: 'The follow-up uses the preceding educational explanation.', details: [], evidence: { status: 'not_independently_source_verified', requiresVerification: true, sources: [] } };

// Safety sentence reused verbatim from ASK_PROMPT. Source metadata is the
// existing synthetic UI fixture from ask-clinical-edge.spec.ts, not a citation.
export const safetyAnswer = { ...readingAnswer, details: [
  ...readingAnswer.details.slice(0, 2),
  { heading: 'Safety', text: 'Acute deterioration warrants timely bedside assessment and local escalation, not reassurance or waiting for the assistant.' },
], evidence: { status: 'scope_limited', requiresVerification: true, sources: [{ id: 'safe', title: 'Safe reference', publisher: 'Reference publisher', url: 'https://example.org/reference' }] } };
export const limitedAnswer = { ...safetyAnswer, evidence: { status: 'scope_limited', requiresVerification: true, sources: [] } };
