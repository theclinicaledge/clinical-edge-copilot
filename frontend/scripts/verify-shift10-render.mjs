import { build } from 'vite';
import react from '@vitejs/plugin-react';
import assert from 'node:assert/strict';
import { writeFile, rm } from 'node:fs/promises';
import { fresh, transition as step } from '../src/modules/the-shift/shift10/state.js';
const result = await build({ configFile: false, plugins: [react()], build: { ssr: 'scripts/shift10-render-entry.jsx', write: false, minify: false } });
const chunks = result.output.filter(x => x.type === 'chunk');
assert.equal(chunks.length, 1);
const temp = new URL('./.shift10-render-temporary.mjs', import.meta.url);
await writeFile(temp, chunks[0].code);
try {
  const { render } = await import(temp.href);
  const intro = render(fresh()); assert.ok(intro.includes('Answer Dana')); assert.ok(intro.includes('4 West charge RN')); assert.ok(intro.includes('s10-art-handoff'));
  let report = step(fresh(), { type: 'start' });
  let html = render(report); assert.ok(html.includes('How this works')); assert.ok(html.indexOf('s10-action-nav') < html.indexOf('class="s10-report"')); assert.ok(html.includes('Back to Dana')); assert.ok(!html.includes('No concerns kept yet. You can keep a finding from the workspace or bedside. Telemetry')); assert.ok(!html.includes('1340')); assert.ok(!html.includes('Stool test sent 1210'));
  report = step(report, { type: 'tab', id: 'Chart' }); html = render(report); assert.ok(html.includes('ED medication record')); assert.ok(!html.includes('1340'));
  report = step(report, { type: 'chart', id: 'meds' }); html = render(report); assert.ok(html.includes('1340'));
  for (const [path, topics] of [['A', ['telemetry', 'isolation']], ['B', ['telemetry']], ['C', ['isolation']], ['D', []]]) {
    let s = step(fresh(), { type: 'start' });
    if (topics.length) s = step(s, { type: 'charge', topics });
    for (let i = 0; i < 5; i++) s = step(s, { type: 'go-on' });
    s = step(s, { type: 'arrive' }); html = render(s);
    assert.ok(html.includes('Ruth is here.')); assert.ok(html.includes('Nursing actions')); assert.ok(html.includes('Ruth’s daughter')); assert.ok(html.includes('Back to bedside')); assert.ok(html.includes('At the bedside'));
    assert.equal(html.includes('Mr. Bell is exposed.'), path === 'D');
    s = step(s, { type: 'call-start', id: 'admission' }); html = render(s); assert.ok(html.includes('I haven&#x27;t checked her closely yet.'));
    s = step(s, { type: 'call-answer', ids: ['unknown'] }); s = step(s, { type: 'finish' }); html = render(s);
    assert.ok(html.includes(`Room path ${path}`));
    assert.ok(html.indexOf('Why your choices mattered') < html.indexOf('Seen, recognized, communicated.'));
    assert.ok(html.indexOf('Why your choices mattered') < html.indexOf('Thirty minutes later'));
    assert.ok(html.includes('Chronological event history'));
  }
  console.log('SSR content checks passed: intro, withheld records, all four bedside paths, unknown call, debrief. This does not test browser interaction or layout.');
} finally { await rm(temp, { force: true }); }
