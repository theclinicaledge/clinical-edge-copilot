import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fresh, sanitize, actionReview, reviewResults, reviewText, save, read, KEY, LEGACY_KEY, readLegacy, hasUnsafeActions, usesSaferEnding } from '../src/modules/the-shift/conversation/progress.js';
import { CONTENT_VERSION, actions, cues, opening, asking, confidentiality, script, zones } from '../src/modules/the-shift/conversation/data.js';
import { CONVERSATION_ENABLED } from '../src/modules/the-shift/conversation/private.js';
import { SHIFT_IDS, shiftRoute } from '../src/modules/the-shift/routing.js';
const correct = () => ({ opening: 'presence', cues: ['burden', 'watch'], asking: 'direct', actions: { stay: 'first', notify: 'together', means: 'together', assess: 'together', talk: 'first', document: 'then', charge: 'not-now', pump: 'not-now' }, confidentiality: 'honest' });
test('first-choice feedback is not replaced by guided continuation', () => {
  for (const [index, key, choices] of [[0, 'opening', opening], [2, 'asking', asking], [4, 'confidentiality', confidentiality]]) {
    for (const choice of choices) {
      const answers = { ...correct(), [key]: choice.id };
      assert.equal(reviewResults(answers)[index], choice.result === 'Correct');
      assert.equal(reviewText(index, answers).startsWith('You '), choice.result === 'Correct');
    }
  }
});
test('both essential verbal cues required; all supporting and ordinary lines are unpenalized', () => {
  assert.equal(reviewResults({ cues: ['burden'] })[1], false);
  assert.equal(reviewResults({ cues: ['watch'] })[1], false);
  assert.equal(reviewResults({ cues: ['burden', 'watch'] })[1], true);
  assert.equal(reviewResults({ cues: cues.map(item => item.id) })[1], true);
});
test('all 32 placements exactly implement the authored Accepted, Revisit and Unsafe matrix', () => {
  const matrix = { stay: ['Accepted', 'Revisit', 'Revisit', 'Unsafe'], notify: ['Accepted', 'Accepted', 'Revisit', 'Unsafe'], means: ['Accepted', 'Accepted', 'Revisit', 'Unsafe'], assess: ['Accepted', 'Accepted', 'Revisit', 'Revisit'], talk: ['Accepted', 'Accepted', 'Accepted', 'Revisit'], document: ['Revisit', 'Revisit', 'Accepted', 'Revisit'], charge: ['Unsafe', 'Unsafe', 'Unsafe', 'Accepted'], pump: ['Unsafe', 'Unsafe', 'Unsafe', 'Accepted'] };
  assert.equal(actions.length, 8);
  for (const action of actions) for (const [index, zone] of zones.entries()) {
    assert.equal(action.placements.filter(rule => rule.groups.includes(zone.id)).length, 1);
    assert.equal(actionReview({ [action.id]: zone.id }).find(item => item.id === action.id).status, matrix[action.id][index], `${action.id}/${zone.id}`);
  }
});
test('all 24 accepted concurrent combinations and reversed placement order remain accepted', () => {
  let count = 0;
  for (const notify of ['first', 'together']) for (const means of ['first', 'together']) for (const assess of ['first', 'together']) for (const talk of ['first', 'together', 'then']) {
    const answers = { ...correct(), actions: { ...correct().actions, notify, means, assess, talk } };
    assert.ok(reviewResults(answers).every(Boolean));
    assert.equal(hasUnsafeActions(answers.actions), false);
    assert.equal(reviewText(3, answers), script.actionReflections[3]);
    assert.ok(actionReview(Object.fromEntries(Object.entries(answers.actions).reverse())).every(item => item.status === 'Accepted'));
    count++;
  }
  assert.equal(count, 24);
});
test('specific delayed, omitted and unsafe feedback is selected, not generic advice', () => {
  const feedback = (id, zone) => actionReview({ [id]: zone }).find(item => item.id === id).feedback;
  assert.equal(feedback('notify', 'then'), 'This belongs with the first actions, not after support and charting. Escalation happens now.');
  assert.equal(feedback('notify', 'not-now'), "Notifying the provider and starting precautions can't wait. Escalation happens now, while you stay with him.");
  assert.equal(feedback('means', 'not-now'), "Reducing access to means saves lives. Address the saved pills now, following your facility's process.");
  assert.equal(feedback('document', 'first'), 'Document soon, but not while it competes with keeping him safe.');
  assert.equal(feedback('document', 'not-now'), "Don't skip documenting. His exact words help the team assess risk.");
  assert.equal(feedback('talk', 'not-now'), 'Stay connected. Talking with him continues throughout, even while help arrives.');
  assert.equal(feedback('charge', 'then'), 'Leaving him alone is the one thing not to do. Call for help instead.');
});
test('D4 first-matching reflection priority is trap, omitted safety, revisit, all accepted', () => {
  const reflect = changes => reviewText(3, { ...correct(), actions: { ...correct().actions, ...changes } });
  assert.equal(reflect({ pump: 'first', notify: 'not-now', document: 'first' }), script.actionReflections[0]);
  for (const id of ['stay', 'notify', 'means']) assert.equal(reflect({ [id]: 'not-now', talk: 'not-now' }), script.actionReflections[1]);
  for (const [id, group] of [['stay', 'then'], ['notify', 'then'], ['means', 'then'], ['assess', 'not-now'], ['talk', 'not-now'], ['document', 'first']]) assert.equal(reflect({ [id]: group }), script.actionReflections[2]);
  assert.equal(reflect({}), script.actionReflections[3]);
  assert.equal(actionReview({ stay: 'invalid' })[0].status, 'Revisit');
  assert.equal(reviewResults({})[3], false);
});
test('authored ending condition never credits a wrong dialogue choice or unsafe placement', () => {
  for (const opener of opening) for (const question of asking) for (const response of confidentiality) for (const unsafe of [false, true]) {
    const answers = { ...correct(), opening: opener.id, asking: question.id, confidentiality: response.id, actions: { ...correct().actions, ...(unsafe ? { pump: 'first' } : {}) } };
    assert.equal(usesSaferEnding(answers), opener.id !== 'presence' || question.id !== 'direct' || response.id !== 'honest' || unsafe);
  }
  assert.equal(usesSaferEnding({ ...correct(), cues: [] }), false, 'D2 needs no bridge under the authored rule');
  assert.equal(usesSaferEnding({ ...correct(), actions: {} }), true);
});
test('v0.4 new plays keep v0.2/v0.3 records byte-unchanged and do not invent split-card choices', () => {
  const previous = globalThis.localStorage;
  try {
    for (const version of ['0.2', '0.3']) {
      const { talk: _talk, ...oldActions } = correct().actions;
      const original = JSON.stringify({ version: '0.2', actionContentVersion: version, notice: true, stage: 6, revealed: 5, answers: { ...correct(), actions: oldActions }, tomorrow: 'Maybe' });
      const store = new Map([[LEGACY_KEY, original]]);
      globalThis.localStorage = { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) };
      assert.equal(readLegacy().version, version);
      assert.deepEqual(readLegacy().answers.actions, oldActions);
      assert.equal('talk' in readLegacy().answers.actions, false);
      assert.equal(readLegacy().tomorrow, 'Maybe');
      assert.deepEqual(read(), fresh());
      assert.equal(fresh().version, '0.4');
      save({ ...fresh(), notice: true, stage: 6, revealed: 5, answers: correct() });
      assert.equal(read().stage, 6);
      save(fresh());
      assert.equal(store.get(LEGACY_KEY), original);
    }
  } finally { globalThis.localStorage = previous; }
});
test('partial legacy placements remain a labelled record, not a completed new decision', () => {
  const previous = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: key => key === LEGACY_KEY ? JSON.stringify({ version: '0.2', actionContentVersion: '0.3', stage: 4, placements: { document: 'then', malicious: 'first' }, selected: ['burden', 'free text'], answers: { opening: 'presence' } }) : null };
    const record = readLegacy();
    assert.deepEqual(record.placements, { document: 'then' });
    assert.deepEqual(record.selected, ['burden']);
    assert.equal(record.answers.actions, undefined);
    assert.deepEqual(read().answers, {});
  } finally { globalThis.localStorage = previous; }
});
test('saved progress is bounded, versioned and contains only predefined choices', () => {
  assert.deepEqual(sanitize({ version: 'unknown', stage: 6 }), fresh());
  const value = sanitize({ ...fresh(), notice: true, stage: 6, answers: correct(), revealed: 5, selected: ['burden', 'injected text'], placements: { ...correct().actions, other: 'first' }, patientText: 'not allowed' });
  assert.equal(value.stage, 6);
  assert.deepEqual(value.selected, ['burden']);
  assert.equal('patientText' in value, false);
  assert.equal('other' in value.placements, false);
  assert.equal(sanitize({ ...fresh(), stage: 6 }).stage, 0);
  assert.equal(sanitize({ ...fresh(), notice: true, stage: 6 }).stage, 1);
});
test('unrevealed and unsubmitted stages cannot be resumed as completed', () => {
  const value = sanitize({ ...fresh(), notice: true, stage: 6, answers: correct(), revealed: 2 });
  assert.equal(value.stage, 2);
  assert.equal(value.answers.cues, undefined);
  assert.equal(sanitize({ ...fresh(), notice: true, stage: 6, revealed: 5, answers: { ...correct(), actions: { stay: 'first' } } }).stage, 4);
});
test('storage failures leave a safe in-memory fallback', () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.deepEqual(read(), fresh());
  assert.equal(save(fresh()), false);
  globalThis.localStorage = previous;
  assert.equal(KEY, 'ce-private-shift-conversation-v04');
});
test('authorized public scenario has direct and handoff routes', () => {
  assert.equal(CONVERSATION_ENABLED, true);
  assert.deepEqual(SHIFT_IDS, ['drowsy-patient', 'monitor-alarm', 'discharge-puzzle', 'conversation']);
  assert.deepEqual(shiftRoute('/learn/shifts/conversation'), { kind: 'scenario', id: 'conversation' });
  assert.deepEqual(shiftRoute('/learn/shifts/conversation/ask'), { kind: 'handoff', id: 'conversation' });
});
test('every new clinical string and feedback comes from the supplied v0.4 script', () => {
  const original = readFileSync(new URL('./fixtures/shift-conversation-v04.txt', import.meta.url), 'utf8');
  const normalize = text => text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  const source = normalize(original);
  for (const text of [...opening, ...asking, ...confidentiality].flatMap(item => [item.text, item.feedback])) assert.ok(source.includes(normalize(text)), text);
  for (const text of actions.flatMap(item => [item.text, ...item.placements.map(rule => rule.feedback)])) assert.ok(source.includes(normalize(text)), text);
  for (const text of [script.notice, script.firstLine, script.reveal, script.request, script.share, script.support, ...script.takeaways, ...script.why, script.actionGuidance, script.actionReview, script.assessmentNote, ...Object.values(script.bridges), ...Object.values(script.ending), ...script.actionReflections, ...zones.map(zone => zone.detail)]) assert.ok(source.includes(normalize(text)), text);
  assert.equal(JSON.stringify({ script, actions, opening, asking, confidentiality }).includes('\\\\'), false, 'No literal escape characters in authored strings');
  assert.equal(CONTENT_VERSION, '0.4');
});
test('live scenarios, Ask, backend, consent, privacy, tools and feature settings are byte-unchanged', () => {
  const protectedPaths = ['src/modules/the-shift/Shift.jsx', 'src/modules/the-shift/scenario.js', 'src/modules/the-shift/progress.js', 'src/modules/the-shift/monitor', 'src/modules/the-shift/discharge', 'src/modules/the-shift/integrated/authoring.js', 'src/modules/AskClinicalEdge.jsx', 'src/consent.js', 'src/Privacy.jsx', 'src/main.jsx', 'src/shiftFeature.js', 'src/modules/rhythm-lab', 'src/modules/abg-lab', 'src/modules/reference-hub', '../backend'];
  assert.equal(execFileSync('git', ['diff', '335591c2304400755385944eef8a5656eeb81ead', '--', ...protectedPaths], { encoding: 'utf8', cwd: new URL('../', import.meta.url) }), '');
});
