import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { REWIND } from '../src/modules/the-shift/shift6/data.js';
import { readRewind, updateRewind, rewindAttempt, REWIND_KEY } from '../src/modules/the-shift/shift6/rewindStore.js';

let server, History;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } });
  History = (await server.ssrLoadModule('/src/modules/the-shift/shift6/Shift6ResponseHistory.jsx')).default;
});
after(async () => { await server?.close(); });
const c = REWIND.variations.find(v => v.id === 'c');
const render = attempts => renderToStaticMarkup(createElement(History, { variation: c, attempts }));

test('no additional history UI for zero or one attempt', () => {
  assert.equal(render([]), '');
  assert.equal(render([rewindAttempt('c', 'notify')]), '');
});

test('first and latest follow stored order, not timestamps, and exclude other situations', () => {
  const attempts = [rewindAttempt('c', 'reassess'), rewindAttempt('b', 'reassess'), rewindAttempt('c', 'escalate'), rewindAttempt('c', 'notify')];
  attempts[0].at = attempts[3].at + 1; // Clock changes must not reorder recorded submissions.
  const before = structuredClone(attempts);
  const html = render(attempts);
  assert.ok(html.indexOf('First response (attempt 1)') < html.indexOf('Latest response (attempt 3)'));
  assert.ok(html.indexOf(c.options[3].title) < html.indexOf(c.options[0].title));
  assert.ok(!html.includes(c.options[1].title));
  assert.match(html, /after earlier feedback was available/);
  assert.match(html, /does not show whether that feedback was read/);
  assert.match(html, /current option wording/);
  assert.match(html, /guided practice responses/);
  assert.doesNotMatch(html, /mastery|competenc|improved|independent learning/);
  assert.deepEqual(attempts, before);
});

test('repeated identical choices still show first and latest without implying improvement', () => {
  const html = render([rewindAttempt('c', 'notify'), rewindAttempt('c', 'notify')]);
  assert.equal(html.split(c.options[0].title).length - 1, 2);
  assert.match(html, /Latest response \(attempt 2\)/);
});

test('all C decisions retain their labels and explanations through save, reload and append', () => {
  const entries = new Map([['original-shift', 'untouched'], ['other-rewind', 'untouched']]);
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  let record = readRewind(storage);
  const labels = { notify: 'Correct', escalate: 'Close', recheck: 'Close', reassess: 'No' };
  for (const option of c.options) {
    record = updateRewind(record, value => { value.selected = 'c'; value.attempts.push(rewindAttempt('c', option.id)); }, storage);
    assert.deepEqual(readRewind(storage), record);
    const latest = record.value.attempts.at(-1);
    assert.equal(latest.call, option.id);
    assert.equal(latest.label, labels[option.id]);
    assert.equal(latest.why, option.feedback);
    assert.equal(latest.guided, true);
  }
  const saved = storage.getItem(REWIND_KEY);
  const html = render(readRewind(storage).value.attempts);
  assert.match(html, /First response \(attempt 1\)/);
  assert.match(html, /Latest response \(attempt 4\)/);
  assert.equal(storage.getItem(REWIND_KEY), saved);
  assert.equal(storage.getItem('original-shift'), 'untouched');
  assert.equal(storage.getItem('other-rewind'), 'untouched');
});

test('incompatible saved records are preserved', () => {
  const bytes = '{"schema":99}';
  const storage = { getItem: () => bytes, setItem: () => assert.fail('must not overwrite') };
  assert.equal(readRewind(storage).status, 'blocked');
});
