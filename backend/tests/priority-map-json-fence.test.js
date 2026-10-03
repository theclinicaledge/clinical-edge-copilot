const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeReasoning, parseReasoning, buildEvidence, validateReasoning, composePriorityMap } = require('../priority-map-intelligence');
const { validatePriorityMapReliability, validatePriorityMapContract, runPriorityMapWithBudget, buildOperationalLogEntry } = require('../server');
const { reasoningDiagnostics } = require('../priority-map-diagnostics');
const source = '- Mental-status change reported\n- Fever reported\nOmitted information remains unknown.';
const evidence = buildEvidence(source, 'MODERATE');
const base = {
  synthesis: 'Reported findings may have several contributors; the cause remains unknown.',
  possible_contributors: [],
  clarify_now: [{ assessment: 'Clarify baseline and examination.', why_it_matters: 'Context may distinguish contributors.' }],
  reassessment_or_escalation: ['Consider bedside reassessment and team communication under local protocol.'],
};
const raw = JSON.stringify(base);
const fence = text => `\`\`\`json\n${text}\n\`\`\``;
const validate = (_, text) => validateReasoning(source, text, evidence, validatePriorityMapReliability);

test('single complete JSON object fence preserves every value and passes normal validation', () => {
  for (const wrapped of [fence(raw), ` \n${fence(JSON.stringify(base, null, 2))}\n `, fence(raw).replaceAll('\n', '\r\n')]) {
    assert.deepEqual(parseReasoning(wrapped), base);
    assert.deepEqual(validate(source, wrapped), []);
  }
  const exact = { ...base, synthesis: '  Reported findings  may remain uncertain.  ' };
  assert.deepEqual(normalizeReasoning(fence(JSON.stringify(exact))).value, exact);
});

for (const [name, wrapped] of [
  ['preamble', `Here is JSON\n${fence(raw)}`],
  ['suffix', `${fence(raw)}\nExplanation`],
  ['two fences', `${fence(raw)}\n${fence(raw)}`],
  ['two objects', fence(`${raw}\n${raw}`)],
  ['malformed', fence('{"synthesis":}')],
  ['incomplete JSON', fence(raw.slice(0, -1))],
  ['missing closing fence', `\`\`\`json\n${raw}`],
  ['array root', fence(`[${raw}]`)],
  ['null root', fence('null')],
  ['string root', fence(JSON.stringify(raw))],
  ['number root', fence('1')],
  ['boolean root', fence('true')],
  ['bare fence', `\`\`\`\n${raw}\n\`\`\``],
  ['other language', `\`\`\`javascript\n${raw}\n\`\`\``],
  ['extra info', `\`\`\`json extra\n${raw}\n\`\`\``],
  ['inline fence', `\`\`\`json ${raw}\`\`\``],
  ['nested fence content', fence(JSON.stringify({ ...base, synthesis: 'Unknown ``` content.' }))],
  ['over raw ceiling', fence(' '.repeat(12000) + raw)],
]) test(`fence normalization rejects ${name}`, () => {
  assert.equal(parseReasoning(wrapped), null);
  assert.deepEqual(validate(source, wrapped), ['invalid_reasoning_schema']);
});

test('unwrapped object must still satisfy exact schema and length limits', () => {
  for (const value of [{}, { ...base, extra: 'unknown' }, { ...base, synthesis: 'x'.repeat(601) }, { ...base, clarify_now: [] }]) {
    assert.deepEqual(validate(source, fence(JSON.stringify(value))), ['invalid_reasoning_schema']);
  }
});

test('fences cannot bypass diagnosis, causality, numeric, negative or treatment safety', () => {
  for (const synthesis of ['This may be sepsis.', 'An infectious process is causing the change; context remains unknown.', 'No prior history is present; cause remains unknown.', 'Reported pressure is 123; cause remains unknown.', 'Administer antibiotics; cause remains unknown.']) {
    const text = JSON.stringify({ ...base, synthesis });
    const plain = validate(source, text);
    assert.ok(plain.length > 0);
    assert.deepEqual(validate(source, fence(text)), plain);
  }
});

test('normal provider resolution validates fenced original without repair or content logging', async () => {
  let repairCalls = 0;
  const completeValidation = (_, text) => {
    const issues = validate(source, text);
    if (issues.length) return issues;
    const composed = composePriorityMap(evidence, parseReasoning(text));
    return [...validatePriorityMapContract(composed), ...validatePriorityMapReliability(source, composed)];
  };
  const result = await runPriorityMapWithBudget({ source, generateOriginal: async () => fence(raw), repair: async () => { repairCalls++; return raw; }, validateOutput: completeValidation,
    diagnoseOutput: (_, text, codes) => reasoningDiagnostics(source, text, evidence, validatePriorityMapReliability, codes) });
  assert.equal(result.status, 'validated');
  assert.equal(result.output, fence(raw));
  assert.equal(repairCalls, 0);
  const logged = JSON.stringify(buildOperationalLogEntry({ ...result.timing, response: raw, snapshot: source }));
  assert.ok(!logged.includes(source));
  assert.ok(!logged.includes(base.synthesis));
  assert.equal(result.timing.original_validation.accepted, true);
});
