const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { containmentGate } = require('../safety-containment');
const { app, buildOperationalLogEntry } = require('../server');

const cases = [
  { question: 'How much insulin should I give my patient?', mode: 'quick' },
  { question: 'Should I increase norepinephrine right now?', mode: 'deep' },
  { question: 'Which treatment should I choose?', mode: 'exam' },
  { question: 'Fictional case: choose a dose.', mode: 'knowledge' },
  { question: 'Explain insulin physiology.' },
  { question: 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nBP: 85/55', mode: 'quick' },
  { question: 'Fictional case: give insulin.', isFollowUp: true },
  { question: 'Explain the case.', learningRequest: true, priorityMapResponse: 'Unreviewed prior text.' },
  { question: 'Fictional case: give insulin.', reassessmentRequest: 'true' },
];
test('middleware denies all generative modes before downstream code and emits only metadata', () => {
  const before = process.env.ASK_SAFETY_CONTAINMENT;
  process.env.ASK_SAFETY_CONTAINMENT = 'true';
  try {
    for (const body of cases) for (const route of ['COPILOT', 'SBAR']) {
      const logs = [];
      let code, response;
      containmentGate(route, entry => logs.push(buildOperationalLogEntry(entry)))({ body }, {
        status(value) { code = value; return this; }, json(value) { response = value; },
      }, () => { throw new Error('restricted request reached downstream provider path'); });
      assert.equal(code, 503); assert.equal(response.code, 'clinical_generation_restricted');
      assert.equal(logs[0].containment_active, true); assert.equal(logs[0].provider_status, 'not_called');
      const logged = JSON.stringify(logs);
      assert.ok(!logged.includes(body.question));
      assert.ok(!logged.includes('Unreviewed prior text'));
    }
  } finally {
    if (before === undefined) delete process.env.ASK_SAFETY_CONTAINMENT;
    else process.env.ASK_SAFETY_CONTAINMENT = before;
  }
});
test('actual API routes restrict generation and retain deterministic reassessment', async () => {
  const before = process.env.ASK_SAFETY_CONTAINMENT;
  process.env.ASK_SAFETY_CONTAINMENT = 'true';
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (route, body) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    for (const body of cases) {
      const response = await send('/api/copilot', body);
      assert.equal(response.status, 503);
      assert.equal((await response.json()).code, 'clinical_generation_restricted');
    }
    const blocked = await send('/api/sbar', { question: 'Fictional case: choose insulin.', copilotResponse: 'Unreviewed recommendation.' });
    assert.equal(blocked.status, 503);
    for (const { question } of cases) {
      const ask = await send('/api/ask', { question, contextMode: 'general' });
      assert.equal(ask.status, 503);
      assert.equal((await ask.json()).error.code, 'ask_temporarily_restricted');
    }
    const gas = await send('/api/ask', { question: 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L.', contextMode: 'general' });
    assert.equal(gas.status, 200);
    assert.equal((await gas.json()).abg.status, 'verified');
    const { serializePatientSnapshot } = await import('../../frontend/src/components/patientSnapshotModel.js');
    const question = serializePatientSnapshot({ signals: [], setting: 'ICU', contexts: [], values: { bpNow: '108/64', hrNow: '80' }, optional: {}, units: {}, notes: '' });
    for (const learningRequest of [false, true]) {
      const deterministic = await send('/api/copilot', { question, reassessmentRequest: true, learningRequest });
      assert.equal(deterministic.status, 200);
      if (learningRequest) assert.ok((await deterministic.json()).lesson);
      else assert.match(await deterministic.text(), /"resolution":"deterministic"/);
    }
    const sbar = await send('/api/sbar', { question, copilotResponse: 'Urgency Level: LOW', reassessmentRequest: true, previousAssessment: question });
    assert.equal(sbar.status, 200); assert.ok((await sbar.json()).sbar);
    const invalid = await send('/api/copilot', { question: 'Fictional case: give insulin.', reassessmentRequest: true });
    assert.equal(invalid.status, 400);
    assert.equal((await fetch(base + '/health')).status, 200);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    if (before === undefined) delete process.env.ASK_SAFETY_CONTAINMENT;
    else process.env.ASK_SAFETY_CONTAINMENT = before;
  }
});
test('rollback is explicit and the new log field cannot carry clinical text', () => {
  const previous = process.env.ASK_SAFETY_CONTAINMENT;
  delete process.env.ASK_SAFETY_CONTAINMENT;
  try {
    let continued = false;
    containmentGate('COPILOT', () => { throw new Error('no restricted log when disabled'); })({}, {}, () => { continued = true; });
    assert.equal(continued, true);
    assert.equal(buildOperationalLogEntry({ containment_active: 'Patient-specific text' }).containment_active, undefined);
  } finally {
    if (previous !== undefined) process.env.ASK_SAFETY_CONTAINMENT = previous;
  }
});
test('deterministic allow paths must return before provider access', () => {
  const source = fs.readFileSync(require.resolve('../server'), 'utf8');
  const copilot = source.slice(source.indexOf('app.post("/api/copilot"'), source.indexOf('app.post("/api/sbar"'));
  assert.ok(copilot.indexOf('if (reassessmentRequest === true)') < copilot.indexOf('if (!client)'));
  assert.match(copilot, /return res.end\(`data:/);
  const sbar = source.slice(source.indexOf('app.post("/api/sbar"'));
  assert.ok(sbar.indexOf('if (reassessmentRequest === true)') < sbar.indexOf('if (!client)'));
  assert.match(sbar, /return res.json\(\{ sbar \}\)/);
});
