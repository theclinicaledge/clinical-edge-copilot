import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { resumableExperiences } from '../src/components/continueLearning.js';
test('Home hydration markup stays identical with and without browser-local saves', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  const previous = globalThis.localStorage;
  const memory = new Map();
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: () => assert.fail('Home must not write saves') };
  try {
    const { default: ContinueLearning } = await server.ssrLoadModule('/src/components/ContinueLearning.jsx');
    const render = () => renderToString(createElement(ContinueLearning, { onNavigate() {} }));
    const initial = render();
    memory.set('ce-private-shift-drowsy-r2', JSON.stringify({ version: 1, stage: 1, answers: {} }));
    assert.equal(render(), initial, 'local saves must not change the hydration render');
    assert.equal(initial, '', 'no placeholder or loading screen');
  } finally { globalThis.localStorage = previous; await server.close(); }
});
test('rendered home stays one card for 0, 1, 6 and 25 saves, with View all pointing to the shared library', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { ContinueLearningList } = await server.ssrLoadModule('/src/components/ContinueLearning.jsx');
    for (const count of [0, 1, 6, 25]) {
      const items = Array.from({ length: count }, (_, index) => ({ id: `saved-${index}`, title: `Saved experience ${index}`, number: String(index), progress: 'Continue: Report' }));
      const unfinished = resumableExperiences(items, item => item.progress);
      const html = renderToStaticMarkup(createElement(ContinueLearningList, { unfinished, onNavigate() {} }));
      if (!count) { assert.equal(html, ''); continue; }
      assert.equal((html.match(/<li>/g) || []).length, 1);
      assert.equal((html.match(/<a /g) || []).length, 2);
      assert.ok(html.includes(`(${count} unfinished)`));
      assert.ok(html.includes('href="/learn/shifts/saved-0"'));
      assert.ok(html.includes('href="/learn/shifts?saved=1"'));
      assert.ok(!html.includes('<details'), 'no competing progress list on home');
      assert.ok(!html.includes('%'), 'no invented percentages');
    }
  } finally { await server.close(); }
});

test('library rendered status filters retain scenario links, artwork and unavailable-save honesty', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  const previous = globalThis.localStorage;
  const memory = new Map();
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: () => assert.fail('library must not write saves') };
  try {
    const { Library } = await server.ssrLoadModule('/src/modules/the-shift/ShiftExperience.jsx');
    const { SHIFTS } = await server.ssrLoadModule('/src/modules/the-shift/integrated/registry.js');
    const { fresh, transition, savePayload } = await server.ssrLoadModule('/src/modules/the-shift/shift10/state.js');
    const seven = SHIFTS.find(item => item.id === 'missing-time');
    const ten = SHIFTS.find(item => item.id === 'transfer-not-ready');
    const eight = SHIFTS.find(item => item.id === 'code-blue');
    memory.set(ten.storageKey, savePayload(transition(fresh(), { type: 'start' })));
    memory.set(seven.storageKey, JSON.stringify({ version: seven.contentVersion, stage: 5, updated: 100, answers: { opening: ['activate'] }, water: 'hold', contact: 'phone', handoff: [] }));
    memory.set(eight.storageKey, '{broken');
    const snapshot = [...memory];
    const render = progressView => renderToStaticMarkup(createElement(Library, { progressView, navigate() {} }));
    const all = render('all');
    assert.equal((all.match(/class="shift-library-card"/g) || []).length, 6, 'library keeps existing six-card pagination');
    const unfinished = render('unfinished');
    assert.equal((unfinished.match(/class="shift-library-card"/g) || []).length, 1);
    assert.ok(unfinished.includes('data-shift-id="transfer-not-ready"'));
    assert.ok(unfinished.includes('Continue shift'));
    assert.ok(!unfinished.includes('shift-library-resume"'), 'no duplicated resume list in filtered view');
    assert.ok(unfinished.includes('shift10/poster.svg'));
    const debriefs = render('debriefs');
    assert.equal((debriefs.match(/class="shift-library-card"/g) || []).length, 1);
    assert.ok(debriefs.includes('data-shift-id="missing-time"'));
    assert.ok(debriefs.includes('Review debrief'));
    assert.deepEqual([...memory], snapshot);
    memory.clear();
    assert.ok(render('unfinished').includes('No unfinished shifts saved'));
    assert.ok(render('debriefs').includes('No debriefs saved'));
    // Bring the unavailable record into the first six without changing its reader.
    const index = SHIFTS.indexOf(eight);
    SHIFTS.splice(index, 1); SHIFTS.unshift(eight);
    memory.set(eight.storageKey, '{broken');
    const unavailable = render('all');
    assert.ok(unavailable.includes('shift-library-status--unavailable'));
    assert.ok(unavailable.includes('Open shift'));
    assert.ok(render('unfinished').includes('No unfinished shifts saved'));
    SHIFTS.shift(); SHIFTS.splice(index, 0, eight);
  } finally { globalThis.localStorage = previous; await server.close(); }
});
