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
