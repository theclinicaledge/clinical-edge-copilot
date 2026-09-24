import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Fresh browser storage so saved-case/prefill state cannot leak between tests.
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('home hub loads and shows module navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Clinical Edge' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start with Copilot' })).toBeVisible();
  await expect(page.getByText('Copilot', { exact: true })).toBeVisible();
  await expect(page.getByText('Rhythm Lab', { exact: true })).toBeVisible();
  await expect(page.getByText('ICU Drips', { exact: true })).toBeVisible();
  await expect(page.getByText('Reference Hub', { exact: true })).toBeVisible();
  await expect(page.getByText('ABG & Oxygenation Lab', { exact: true })).toBeVisible();
  await expect(page.getByText('Brain Sheets', { exact: true })).toBeVisible();
});

test('copilot starts with the adaptive What Changed snapshot', async ({ page }) => {
  await page.goto('/copilot');
  await expect(page.getByRole('heading', { name: 'What changed?' })).toBeVisible();
  await expect(page.getByText("Select what you're noticing. You don't need to know what's causing it.")).toBeVisible();
  await expect(page.getByRole('button', { name: /BP \/ perfusion/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toHaveCount(0);
});

test('snapshot supports multi-select, adaptive fields, removal, and progressive disclosure', async ({ page }) => {
  await page.goto('/copilot');
  const perfusion = page.getByRole('button', { name: /BP \/ perfusion/ });
  const breathing = page.getByRole('button', { name: /^Breathing/ });
  await perfusion.click();
  await breathing.click();
  await expect(perfusion).toHaveAttribute('aria-pressed', 'true');
  await expect(breathing).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('MAP previous')).toBeVisible();
  await expect(page.getByLabel('SpO2 current')).toBeVisible();
  await page.getByRole('button', { name: /Labs Relevant/ }).click();
  await expect(page.getByLabel('Lactate current')).toBeVisible();
  await breathing.click();
  await expect(page.getByLabel('SpO2 current')).toHaveCount(0);
  await expect(page.getByLabel('MAP previous')).toBeVisible();
});

test('BP perfusion builder reveals contextual modules and preserves structured trends', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: 'Urgency Level: MODERATE\n\n**Priorities**\n### 1 · Perfusion trend\nRelevance: Important\nObserved:\n- A perfusion change was reported\nInterpretation: The cause is not established.\nAssess now:\n- Focused reassessment\n\n**Assess first**\n- Focused reassessment\n\n**Possible patterns**\n- Several contributors remain possible\n\n**Missing information**\n- Current trend\n\n**Monitor and trend**\n- Direction of change\n\n**Escalation triggers**\n- Worsening status\n\n**SBAR-ready summary**\nA change was reported.\n\n**Teach me why**\nTrends add context.' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: /BP \/ perfusion/ }).click();
  await expect(page.getByLabel('Blood pressure previous')).toBeVisible();
  await expect(page.getByLabel('Urine output current')).toBeVisible();
  await expect(page.getByRole('button', { name: /Hemodynamics/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'CTICU' }).click();
  await expect(page.getByRole('button', { name: /Hemodynamics/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Drains \/ bleeding/ })).toBeVisible();
  await page.getByLabel('Blood pressure previous').fill('118/72');
  await page.getByLabel('Blood pressure current').fill('86/48');
  await expect(page.getByRole('alert')).toContainText('Do not wait to finish this Snapshot');
  await page.getByRole('button', { name: /Hemodynamics/ }).click();
  await page.getByLabel('CI previous').fill('2.4');
  await page.getByLabel('CI current').fill('1.8');
  await page.getByRole('button', { name: /^Drips/ }).click();
  await page.getByRole('button', { name: '+ Add drip' }).click();
  await page.getByLabel('Medication').fill('Norepinephrine');
  await page.getByLabel('Current dose').fill('0.08');
  await page.getByLabel('Unit').fill('mcg/kg/min');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review')).toContainText('CI: previous 2.4 -> current 1.8 L/min/m2');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('BP: previous 118/72 -> current 86/48 mmHg');
  expect(submittedQuestion).toContain('BP: previous 118/72 -> current 86/48 mmHg');
  expect(submittedQuestion).toContain('CI: previous 2.4 -> current 1.8 L/min/m2');
  expect(submittedQuestion).toContain('medication=Norepinephrine');
  expect(submittedQuestion).toContain('currentDose=0.08');
  expect(submittedQuestion).toContain('unit=mcg/kg/min');
});

test('BP perfusion builder supports explicit unknown and not-assessed states', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: /BP \/ perfusion/ }).click();
  const mapField = page.locator('fieldset.snapshot-trend').filter({ has: page.locator('legend', { hasText: /^MAP/ }) });
  await mapField.getByRole('button', { name: 'Unknown' }).click();
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review')).toContainText('MAP: Unknown');
  await expect(page.locator('.snapshot-review')).not.toContainText('Mental-status change:');
});

test('Something feels off exposes a general deterioration snapshot and accepts incomplete trends', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: /Something feels off/ }).click();
  await expect(page.getByLabel('BP current')).toBeVisible();
  await expect(page.getByLabel('Heart rate current')).toBeVisible();
  await expect(page.getByText('Mental status', { exact: true })).toBeVisible();
  await page.getByLabel('MAP current').fill('61');
  await expect(page.getByLabel('MAP previous')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeEnabled();
  await expect(page.getByText(/Automated checks are limited/)).toBeVisible();
});

test('optional Vitals exposes measurements not already surfaced by the selected signal', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: /Pain \/ other/ }).click();
  await page.getByRole('button', { name: 'Vitals', exact: true }).click();
  await expect(page.getByLabel('BP previous')).toBeVisible();
  await expect(page.getByLabel('SpO2 current')).toBeVisible();
});

test('Copilot distinguishes provider configuration failure from a network error', async ({ page }) => {
  await page.route('**/api/copilot', async (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: true, code: 'provider_not_configured', message: 'The AI service is not configured for this local environment. Add the required backend API key and restart the server.' }),
  }));
  await page.goto('/copilot');
  await page.getByRole('button', { name: /Pain \/ other/ }).click();
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByText(/AI service is not configured for this local environment/)).toBeVisible();
  await expect(page.getByText(/Connection issue/)).toHaveCount(0);
});

test('reasoning workspace renders the contract and retains only explicitly saved cases', async ({ page }) => {
  const response = `Urgency Level: MODERATE

**Priorities**
### 1 · Perfusion concern
Relevance: High priority
Observed:
- Blood pressure fell from 118/72 to 88/50
- Heart rate is 122
Interpretation: This pattern may reflect impaired perfusion; the cause is not established.
Assess now:
- Current appearance, perfusion, mentation, and full vital-sign trend

### 2 · Possible volume loss
Relevance: Needs clarification
Observed:
- The patient is postoperative
Interpretation: Volume loss could contribute, but bleeding and intake/output context are missing.
Assess now:
- Bleeding findings and urine-output trend

**Assess first**
- Current appearance, perfusion, mentation, and full vital-sign trend

**Possible patterns**
- This may fit evolving volume loss or another low-preload pattern

**Missing information**
- Urine output, bleeding assessment, hemoglobin trend, and recent intake

**Monitor and trend**
- Further pressure decline or worsening perfusion would increase concern

**Escalation triggers**
- Worsening hemodynamics or mentation commonly prompt earlier team awareness

**SBAR-ready summary**
The patient has a reported blood-pressure decline with a rising heart rate. The cause remains uncertain from the available information.

**Teach me why**
Lower circulating volume can reduce preload and cardiac output while sympathetic compensation raises heart rate.`;

  const lesson = {
    active: true,
    domain: 'hemodynamics-perfusion',
    conceptId: 'perfusion-trend',
    conceptLabel: 'Reading a perfusion trend',
    questionType: 'trend-interpretation',
    question: {
      stem: 'Which change carries the most weight in this situation?',
      choices: [{ id: 'a', label: 'The falling blood-pressure trend' }, { id: 'b', label: 'The postoperative label alone' }, { id: 'c', label: 'A single temperature value' }],
      correctChoiceId: 'a',
      explanation: 'A falling pressure paired with a rising heart rate can increase concern for impaired perfusion. The trend does not establish the cause.',
    },
    scenarioConnection: 'Here, the reported pressure decline and rising heart rate make the direction of change more useful than either value alone.',
    application: {
      stem: 'Which information would best help clarify the contributor?',
      choices: [{ id: 'a', label: 'Bleeding and intake/output context' }, { id: 'b', label: 'Room number' }, { id: 'c', label: 'The date alone' }],
      correctChoiceId: 'a',
      explanation: 'Bleeding findings and intake/output add clinically relevant context without proving a diagnosis.',
    },
    tags: ['Hemodynamics', 'Perfusion', 'Trend interpretation'],
  };
  await page.route('**/api/copilot', async (route) => {
    const body = await route.request().postDataJSON();
    if (body.learningRequest) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ text: response })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
    });
  });

  await page.goto('/copilot');
  await page.getByRole('button', { name: /BP \/ perfusion/ }).click();
  await page.getByRole('button', { name: 'Post-op' }).click();
  await page.getByLabel('Blood pressure previous').fill('118/72');
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByLabel('Heart rate current').fill('122');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();

  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Perfusion concern' })).toBeVisible();
  await expect(page.getByText('Observed / reported', { exact: true })).toBeVisible();
  await expect(page.getByText('Clinical interpretation', { exact: true })).toBeVisible();
  await expect(page.getByText('Blood pressure fell from 118/72 to 88/50')).toBeVisible();
  await expect(page.getByText('Heart rate is 122')).toBeVisible();
  await expect(page.getByText('This pattern may reflect impaired perfusion; the cause is not established.')).toBeVisible();
  await expect(page.getByText('Assess now', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Possible contributors/ })).toBeVisible();
  await expect(page.getByText('This may fit evolving volume loss or another low-preload pattern')).toHaveCount(0);
  await page.getByRole('button', { name: /Possible contributors/ }).click();
  await expect(page.getByText('This may fit evolving volume loss or another low-preload pattern')).toBeVisible();
  await expect(page.getByRole('button', { name: /Teach me why/ })).toBeVisible();
  await expect(page.getByText(/Lower circulating volume can reduce preload/)).toHaveCount(0);
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText('Which change carries the most weight in this situation?')).toBeVisible();
  await expect(page.getByText(/A falling pressure paired/)).toHaveCount(0);
  await page.getByRole('radio', { name: /The falling blood-pressure trend/ }).click();
  await page.getByRole('button', { name: 'Commit answer' }).click();
  await expect(page.getByText('Correct', { exact: true })).toBeVisible();
  await expect(page.getByText(/A falling pressure paired/)).toBeVisible();
  await expect(page.getByText('In this situation', { exact: true })).toBeVisible();
  await expect(page.getByText('Which information would best help clarify the contributor?')).toBeVisible();
  await page.getByRole('radio', { name: /Bleeding and intake\/output context/ }).click();
  await page.getByRole('button', { name: 'Commit answer' }).click();
  await expect(page.getByText('Lesson complete', { exact: true })).toBeVisible();
  await expect(page.getByText('Hemodynamics', { exact: true })).toBeVisible();

  const beforeSave = await page.evaluate(() => ({
    recent: localStorage.getItem('clinical_edge_history'),
    saved: localStorage.getItem('clinical_edge_saved_cases'),
    draft: sessionStorage.getItem('cec_draft'),
  }));
  expect(beforeSave).toEqual({ recent: null, saved: null, draft: null });

  await page.getByRole('button', { name: '+ Save Case' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('clinical_edge_saved_cases') || '[]'));
  expect(saved).toHaveLength(1);
  expect(saved[0].question).toContain('PATIENT SNAPSHOT');
  expect(saved[0].question).toContain('BP: previous 118/72 -> current 88/50');
  expect(saved[0].rawText).toContain('Priorities');
});

test('Priority Map allows one priority and never renders more than three', async ({ page }) => {
  const responseWith = (count: number) => `Urgency Level: LOW\n\n**Priorities**\n${Array.from({ length: count }, (_, index) => `### ${index + 1} · Priority ${index + 1}\nRelevance: ${index ? 'Needs clarification' : 'Important'}\nObserved:\n- Reported signal ${index + 1}\nInterpretation: This may represent a clinically relevant change.\nAssess now:\n- Focused reassessment ${index + 1}`).join('\n\n')}\n\n**Assess first**\n- Focused reassessment\n\n**Possible patterns**\n- This pattern may have several contributors\n\n**Missing information**\n- Current focused assessment\n\n**Monitor and trend**\n- Watch the reported signal direction\n\n**Escalation triggers**\n- Worsening clinical status may prompt team awareness\n\n**SBAR-ready summary**\nA reported change is present.\n\n**Teach me why**\nTrends can add context.`;
  let count = 1;
  await page.route('**/api/copilot', async (route) => route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: responseWith(count) })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` }));

  const submit = async () => {
    await page.goto('/copilot');
    await page.getByRole('button', { name: /Pain \/ other/ }).click();
    await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  };
  await submit();
  await expect(page.getByRole('heading', { name: 'Priority 1' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Priority 2' })).toHaveCount(0);

  count = 4;
  await submit();
  await expect(page.getByText('3 · Priority 3', { exact: true })).toBeVisible();
  await expect(page.getByText('4 · Priority 4', { exact: true })).toHaveCount(0);
});

test('Teach Me locks an incorrect answer and keeps clinical content out of analytics', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug = [];
    const original = console.debug;
    console.debug = (...args) => { (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args); original(...args); };
  });
  const response = `Urgency Level: MODERATE\n\n**Priorities**\n### 1 · Perfusion trend\nRelevance: Important\nObserved:\n- MAP fell to 61\nInterpretation: This may reflect worsening perfusion.\nAssess now:\n- Reassess perfusion\n\n**Assess first**\n- Reassess perfusion\n\n**Possible patterns**\n- This may fit a low-flow pattern\n\n**Missing information**\n- Mental status\n\n**Monitor and trend**\n- Watch MAP direction\n\n**Escalation triggers**\n- Worsening perfusion may prompt team awareness\n\n**SBAR-ready summary**\nA perfusion change is reported.\n\n**Teach me why**\nTrends can reveal deterioration.`;
  const lesson = { active: true, domain: 'hemodynamics-perfusion', conceptId: 'map-trend', conceptLabel: 'Reading MAP trends', questionType: 'trend-interpretation', question: { stem: 'What matters most about MAP 61?', choices: [{ id: 'a', label: 'Its direction over time' }, { id: 'b', label: 'The number in isolation' }, { id: 'c', label: 'The room location' }], correctChoiceId: 'a', explanation: 'Direction over time adds context. One value does not establish a diagnosis.' }, scenarioConnection: 'The reported MAP of 61 is more useful when compared with the earlier trend.', application: null, tags: ['Hemodynamics', 'Trend interpretation'] };
  await page.route('**/api/copilot', async (route) => {
    const body = await route.request().postDataJSON();
    if (body.learningRequest) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson }) });
    return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: response })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: /BP \/ perfusion/ }).click();
  await page.getByLabel('MAP current').fill('61');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await page.getByRole('button', { name: /Teach me why/ }).click();
  const wrong = page.getByRole('radio', { name: /The number in isolation/ });
  await wrong.click();
  await page.getByRole('button', { name: 'Commit answer' }).click();
  await expect(page.getByText('Not quite', { exact: true })).toBeVisible();
  await expect(wrong).toBeDisabled();
  await expect(page.getByText('Lesson complete', { exact: true })).toBeVisible();
  const analytics = await page.evaluate(() => JSON.stringify((window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug));
  expect(analytics).not.toContain('MAP 61');
  expect(analytics).not.toContain('The number in isolation');
  expect(analytics).not.toContain('Direction over time adds context');
  await page.getByText('Return to Priority Map', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
});

test('Teach Me gracefully renders the structured explanation fallback', async ({ page }) => {
  await page.route('**/api/copilot', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson: { active: false, domain: 'postoperative-assessment', conceptId: 'postoperative-trends', conceptLabel: 'Postoperative trends', keyIdea: 'A developing trend can matter before one value becomes severely abnormal.', whyItMatters: 'Trend context supports focused reassessment without establishing a diagnosis.', scenarioConnection: 'The reported heart-rate rise and new fatigue are changes to compare with the earlier baseline.', tags: ['Postoperative assessment', 'Trend interpretation'] } }) }));
  await page.goto('/copilot?screenshot=response');
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText('Key idea', { exact: true })).toBeVisible();
  await expect(page.getByText(/developing trend can matter/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Lesson complete/ })).toBeVisible();
});

test('snapshot values stay out of analytics and the structured handoff preserves unknowns', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug = [];
    const original = console.debug;
    console.debug = (...args) => {
      (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args);
      original(...args);
    };
  });
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: '**What stands out**\n- Reported change' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: /BP \/ perfusion/ }).click();
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByPlaceholder('Add only relevant clinical context').fill('looks pale');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('BP: previous unknown -> current 88/50');
  expect(submittedQuestion).toContain('Additional user-reported context: looks pale');
  const analytics = await page.evaluate(() => JSON.stringify((window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug));
  expect(analytics).not.toContain('88/50');
  expect(analytics).not.toContain('looks pale');
});

test('snapshot serialization preserves string selections and nested structured values', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: '**What stands out**\n- Reported change' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: /Breathing/ }).click();
  await page.getByRole('button', { name: 'Labs', exact: true }).click();
  await page.getByRole('button', { name: 'ABG / VBG', exact: true }).click();
  await page.getByLabel('Values or trend').fill('earlier pH 7.36, PaCO2 48; current pH 7.29, PaCO2 60');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('selected=ABG / VBG');
  expect(submittedQuestion).not.toContain('0=A');
});

test('rhythm lab route loads', async ({ page }) => {
  await page.goto('/rhythm-lab');
  await expect(page.getByRole('heading', { name: 'Rhythm Lab' })).toBeVisible();
});

test('icu drips route loads', async ({ page }) => {
  await page.goto('/icu-drips');
  await expect(page.getByRole('heading', { name: 'ICU Drips' })).toBeVisible();
});

test('reference hub search accepts input and displays matching content', async ({ page }) => {
  await page.goto('/reference-hub');
  const search = page.getByPlaceholder('Search references…');
  await search.fill('lactate');
  await expect(page.getByText('Serum Lactate')).toBeVisible();
});

test('reference hub aliases match new entries', async ({ page }) => {
  await page.goto('/reference-hub');
  const search = page.getByPlaceholder('Search references…');

  await search.fill('iCa');
  await expect(page.getByText('Serum Calcium', { exact: true })).toBeVisible();

  await search.fill('Mg');
  await expect(page.getByText('Serum Magnesium', { exact: true })).toBeVisible();

  await search.fill('PERRLA');
  await expect(page.getByText('Pupil Assessment (PERRLA)', { exact: true })).toBeVisible();

  await search.fill('Glasgow');
  await expect(page.getByText('Glasgow Coma Scale (GCS)', { exact: true })).toBeVisible();

  await search.fill('pleur-evac');
  await expect(page.getByText('Chest Tube / Pleural Drainage System', { exact: true })).toBeVisible();

  await search.fill('PICC');
  await expect(page.getByText('PICC Line / Midline Catheter', { exact: true })).toBeVisible();

  await search.fill('JP drain');
  await expect(page.getByText('Wound Drains (JP / Hemovac)', { exact: true })).toBeVisible();

  await search.fill('trach');
  await expect(page.getByText('Tracheostomy Care Basics', { exact: true })).toBeVisible();

  await search.fill('CAM-ICU');
  await expect(page.getByText('CAM-ICU (Delirium Screening)', { exact: true })).toBeVisible();

  await search.fill('NH3');
  await expect(page.getByText('Serum Ammonia', { exact: true })).toBeVisible();
});

test('opening a second-batch reference detail view works', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByPlaceholder('Search references…').fill('trach');
  await page.getByRole('button', { name: 'Tracheostomy Care Basics' }).click();
  await expect(page.getByRole('heading', { name: 'Tracheostomy Care Basics' })).toBeVisible();
  await expect(page.getByText('A patient-specific airway plan is most useful when the team knows where it is and what equipment is available before an emergency occurs.')).toBeVisible();
});

test('neuro assessment category appears and filters to the new entries', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByRole('button', { name: 'Neuro Assessment' }).click();
  await expect(page.getByText('Glasgow Coma Scale (GCS)', { exact: true })).toBeVisible();
  await expect(page.getByText('Pupil Assessment (PERRLA)', { exact: true })).toBeVisible();
});

test('opening a new reference detail view works', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByPlaceholder('Search references…').fill('Serum Calcium');
  await page.getByRole('button', { name: 'Serum Calcium' }).click();
  await expect(page.getByRole('heading', { name: 'Serum Calcium' })).toBeVisible();
  await expect(page.getByText('When albumin or acid-base status is abnormal, total and ionized calcium may tell different stories.')).toBeVisible();
});

test('abg lab example can be selected and interpreted', async ({ page }) => {
  await page.goto('/abg-lab');
  await page.getByRole('button', { name: 'Respiratory acidosis' }).click();
  await expect(page.getByText('Pattern Summary')).toBeVisible();
  await expect(page.getByText('How I Read It')).toBeVisible();
});

test('brain sheets library and production detail route load', async ({ page }) => {
  await page.goto('/brain-sheets');
  await expect(page.getByRole('heading', { name: 'Blank, printable shift-organization sheets.' })).toBeVisible();
  await expect(page.getByText('Med-Surg · 4 Patient')).toBeVisible();

  await page.goto('/brain-sheets/medsurg-4pt');
  await expect(page.getByRole('heading', { name: 'Med-Surg · 4 Patient' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible();
  await expect(page.getByLabel('View a larger preview of Med-Surg · 4 Patient')).toBeVisible();

  await page.goto('/brain-sheets/telemetry');
  await expect(page.getByRole('heading', { name: 'Telemetry / Stepdown' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible();
  await expect(page.getByLabel('View a larger preview of Telemetry / Stepdown')).toBeVisible();
});

test('quickstart option can be selected and completed', async ({ page }) => {
  await page.goto('/quickstart');
  const textarea = page.getByPlaceholder('e.g. BP dropping post-op and patient looks pale, HR climbing...');
  await page.getByRole('button', { name: 'BP dropping post-op' }).click();
  await expect(textarea).toHaveValue('BP dropping post-op');

  await page.getByRole('button', { name: 'Start thinking it through →' }).click();
  await page.waitForURL('**/copilot');
  await page.getByRole('button', { name: /BP \/ perfusion/ }).click();
  await expect(page.getByPlaceholder('Add only relevant clinical context')).toHaveValue('BP dropping post-op');
});

test('scenario advances from the first step to the next step', async ({ page }) => {
  await page.goto('/scenario');
  await page.getByRole('button', { name: 'Think it through →' }).click();
  await expect(page.getByRole('heading', { name: 'What are you thinking?' })).toBeVisible();
});

test('privacy page loads', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
});

test('support page loads', async ({ page }) => {
  await page.goto('/support');
  await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
});

test('download page loads', async ({ page }) => {
  await page.goto('/download');
  await expect(page.getByRole('heading', { name: 'Clinical tools built for real nursing workflows.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download on the App Store' }).first()).toBeVisible();
});
