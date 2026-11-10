const assert = require('node:assert/strict');

const closeEnough = (actual, expected, tolerance) => Math.abs(actual - expected) <= tolerance + 1e-9;

async function verifyRhythmCheck(browser, width, baseURL = 'http://127.0.0.1:5196', variant = 0, height = width < 500 ? 844 : 1000) {
  const mobile = width < 500;
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
  const errors = [];
  const apiRequests = [];
  try {
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/')) apiRequests.push(url.pathname);
      if (url.origin === baseURL && !url.pathname.startsWith('/api/')) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${baseURL}/rhythm-lab`);
    await page.getByRole('link', { name: /Rhythm Check/ }).press('Enter');
    await page.getByRole('heading', { name: 'Rhythm Check', exact: true }).waitFor();
    const examples = await page.evaluate(async () => {
      const { RHYTHM_CHECK_CASES } = await import('/src/modules/rhythm-lab/rhythm-check/cases.ts');
      return RHYTHM_CHECK_CASES.map(({ id, answer, guided, measurements, beats, prPattern }) => ({ id, answer, guided, measurements, beats, prPattern }));
    });

    const isStickyDesktop = width >= 1040 && height >= 780;
    const stripVisible = () => page.locator('.rc-scroll').evaluate(element => {
      const rect = element.getBoundingClientRect();
      const header = document.querySelector('.ce-module-header').getBoundingClientRect();
      const dock = document.querySelector('.ce-tool-dock')?.getBoundingClientRect();
      return rect.top >= header.bottom && rect.bottom <= (dock?.height ? dock.top : innerHeight);
    });

    async function tapTime(seconds) {
      await page.locator('.rc-scroll').evaluate((element, time) => {
        element.scrollIntoView({ block: 'center', behavior: 'instant' });
        element.scrollLeft = time / 6 * element.scrollWidth - element.clientWidth / 2;
      }, seconds);
      const point = await page.locator('.rc-plot svg').evaluate((element, time) => {
        const position = new DOMPoint(time * 800 / 6, 55).matrixTransform(element.getScreenCTM());
        return { x: position.x, y: position.y };
      }, seconds);
      if (mobile) await page.touchscreen.tap(point.x, point.y);
      else await page.mouse.click(point.x, point.y);
    }

    for (const [index, example] of examples.entries()) {
      assert.equal(await page.locator('.rc-case-id').innerText(), example.id);
      assert.equal(await page.locator('.rc-evidence').count(), 0);
      assert.equal(await page.locator('.rc-guide').count(), example.guided ? 1 : 0);
      const submit = page.getByRole('button', { name: 'Submit interpretation' });
      assert.ok(await submit.isDisabled());
      const answerPair = variant % 4;
      const isFounderExample = example.id === 'RC-02' && variant === 0;
      const isCrossBeatExample = example.id === 'RC-02' && variant === 1;
      const durationMissOnly = example.id === 'RC-01' && !mobile && variant === 0;
      const sameDurationOtherBeat = example.id === 'RC-05';
      const placedSpans = [];
      const isRC04 = example.id === 'RC-04';
      const offset = example.id === 'RC-06' ? 0.04
        : index === 2 || (isRC04 && [1, 2, 4].includes(variant)) ? 0.30 : 0;
      const zoom = ['Fit', '2×', '3×'][index % 3];
      await page.getByRole('button', { name: zoom, exact: true }).press('Enter');
      await page.waitForFunction(value => document.querySelector('.rc-plot').style.width === value, `${100 * (index % 3 + 1)}%`);
      for (const [interval, measurement] of example.measurements.entries()) {
        if (interval > 0) await page.getByRole('button', { name: new RegExp(`^Interval ${interval + 1} ·`) }).press('Enter');
        const placedSpan = durationMissOnly ? [0.30, 0.50]
          : sameDurationOtherBeat && interval === 2 ? example.measurements[0].span
          : isFounderExample ? [0.76, 1.82] : isCrossBeatExample ? [0.43, 1.68] : measurement.span.map(endpoint => endpoint + offset);
        placedSpans.push(placedSpan);
        for (const [marker, endpoint] of placedSpan.entries()) {
          const slider = page.getByRole('slider', { name: new RegExp(`Marker ${marker ? 'B' : 'A'} time`) });
          if (index === 0 && !mobile) {
            await slider.focus();
            for (let step = 0; step < Math.round(endpoint * 100); step++) await page.keyboard.press('ArrowRight');
          } else await tapTime(endpoint);
          const actual = Number(await slider.inputValue());
          assert.ok(closeEnough(actual, endpoint, 0.02), `${example.id} interval ${interval} marker ${marker} at ${width}px: ${actual} vs ${endpoint}`);
        }
        const value = Number.parseFloat(await page.locator('.rc-measurement strong').innerText());
        assert.ok(closeEnough(value, placedSpan[1] - placedSpan[0], 0.03));
      }
      assert.ok(await submit.isDisabled());
      const choice = index === 1 && !isFounderExample ? 'uncertain' : isRC04 && answerPair >= 2 ? 'sinus' : example.answer;
      await page.locator(`input[name=interpretation][value=${choice}]`).focus();
      await page.keyboard.press('Space');
      const localization = answerPair % 2 === 0 ? 'No' : 'Yes';
      if (isRC04) {
        const interpretation = page.getByRole('group', { name: 'Which rhythm better fits this strip: sinus bradycardia or junctional rhythm?' });
        assert.equal(await interpretation.getByRole('radio').count(), 2);
        const question = page.getByRole('group', { name: 'Can this Lead II strip establish the exact pacemaker origin?' });
        assert.ok(await submit.isDisabled());
        const radio = question.getByRole('radio', { name: localization, exact: true });
        if (mobile) await radio.tap();
        else await radio.press('Space');
      }
      let observation = example.prPattern;
      if (example.prPattern && variant % 2 === 0) {
        observation = example.id === 'RC-07' ? 'unclear' : example.prPattern === 'constant' ? 'progression' : 'constant';
      }
      if (example.prPattern) {
        assert.ok(await submit.isDisabled());
        const group = page.getByRole('group', { name: 'How does PR behave around the pause?' });
        assert.equal(await group.getByRole('radio').count(), 3);
        assert.equal(await group.getByRole('radio', { name: 'The first, pre-pause and post-pause PR intervals are the same.', exact: true }).count(), 1);
        assert.equal(await group.getByRole('radio', { name: 'I cannot tell', exact: true }).count(), 1);
        await page.locator(`input[name=pr-observation][value=${observation}]`).press('Space');
      }
      const rateInput = page.getByLabel('Ventricular rate (bpm)');
      const hasRate = ['RC-02', 'RC-08'].includes(example.id);
      assert.equal(await rateInput.count(), Number(hasRate));
      if (hasRate) {
        assert.ok(await submit.isDisabled());
        assert.equal(await page.getByRole('heading', { name: 'Ventricular rate and spacing' }).count(), 0);
        await page.getByRole('button', { name: 'Fit', exact: true }).press('Enter');
        await rateInput.evaluate(element => element.scrollIntoView({ block: 'center' }));
        const countAndEnterVisible = () => rateInput.evaluate(element => {
          const strip = document.querySelector('.rc-scroll').getBoundingClientRect();
          const input = element.getBoundingClientRect();
          const dock = document.querySelector('.ce-tool-dock')?.getBoundingClientRect();
          const header = document.querySelector('.ce-module-header')?.getBoundingClientRect();
          const top = header && header.bottom > 0 ? header.bottom : 0;
          const bottom = dock && dock.height ? Math.min(innerHeight, dock.top) : innerHeight;
          return strip.top >= top && strip.bottom <= bottom && input.top >= top && input.bottom <= bottom;
        });
        if (mobile || isStickyDesktop) assert.ok(await countAndEnterVisible(), 'Fit strip and rate input must be visible together');
        if (mobile) await rateInput.tap();
        else await rateInput.focus();
        if (mobile || isStickyDesktop) assert.ok(await countAndEnterVisible(), 'Fit strip and rate input must stay visible after focus');
        assert.equal(await rateInput.getAttribute('inputmode'), 'numeric');
        if (process.env.RHYTHM_SCREENSHOTS && example.id === 'RC-02') {
          await page.screenshot({ path: process.env.RHYTHM_SCREENSHOTS + '/rate-beside-ecg.png' });
        }
        await rateInput.pressSequentially(variant === 1 ? '90' : example.id === 'RC-02' ? '50' : '60');
        await rateInput.press(mobile ? 'Enter' : 'Escape');
        assert.ok(await rateInput.evaluate(element => document.activeElement !== element));
        assert.equal(await page.locator('.rc-result').count(), 0, 'Dismissing the keyboard must not submit');
        if (example.id === 'RC-08') {
          assert.ok(await submit.isDisabled());
          await page.getByRole('radio', { name: variant === 1 ? 'Evenly spaced' : 'Unevenly spaced', exact: true }).press('Space');
        }
      }
      for (const control of [page.locator('.rc-scroll'), page.getByRole('slider', { name: /Marker A time/ }), page.locator('input[name=interpretation]').first(), submit]) {
        await control.evaluate(element => element.scrollIntoView({ block: 'center' }));
        assert.ok(await control.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const dock = document.querySelector('.ce-tool-dock')?.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= (dock && dock.height ? Math.min(innerHeight, dock.top) : innerHeight);
        }), 'Exercise controls must scroll fully above the dock');
      }
      assert.ok(await submit.isEnabled());
      await submit.evaluate(element => element.scrollIntoView({ block: 'center' }));
      if (isStickyDesktop) assert.ok(await stripVisible(), 'ECG stays visible while answering');
      if (process.env.RHYTHM_SCREENSHOTS && width === 1440 && example.id === 'RC-08') {
        await page.screenshot({ path: process.env.RHYTHM_SCREENSHOTS + '/desktop-questions.png' });
      }
      await submit.press('Enter');
      assert.ok(await page.locator('#rc-result-title').evaluate(element => document.activeElement === element));
      assert.equal(await page.locator('.rc-result .rc-status').innerText(), choice !== example.answer ? 'Review the deciding evidence' : 'Interpretation matches');
      assert.equal(await page.getByRole('heading', { name: 'Clinical observation', exact: true }).count(),
        example.prPattern || example.id === 'RC-04' ? 1 : 0);
      await page.getByText('Why this rhythm fits', { exact: true }).press('Enter');
      if (isStickyDesktop) assert.ok(await stripVisible(), 'ECG stays visible while inspecting feedback');
      if (process.env.RHYTHM_SCREENSHOTS && width === 1440 && example.id === 'RC-08') {
        await page.screenshot({ path: process.env.RHYTHM_SCREENSHOTS + '/desktop-feedback.png' });
      }
      const result = await page.locator('.rc-result').innerText();
      if (hasRate) {
        assert.ok(result.includes(variant === 1 ? 'Recheck the QRS count' : 'Estimate matches'));
        if (example.id === 'RC-08') {
          assert.ok(result.includes(variant === 1 ? 'Recheck the spacing' : 'Spacing matches'));
          assert.ok(result.includes('atrial estimate of 70 bpm'));
        }
        if (process.env.RHYTHM_SCREENSHOTS && example.id === 'RC-02') {
          await page.getByRole('heading', { name: 'Ventricular rate and spacing' }).evaluate(element => element.scrollIntoView({ block: 'center' }));
          await page.screenshot({ path: process.env.RHYTHM_SCREENSHOTS + '/rate-feedback.png' });
        }
      }
      for (const item of [page.locator('.rc-scroll'), page.locator('.rc-result .rc-feedback-card').first()]) {
        await item.evaluate(element => element.scrollIntoView({ block: 'center' }));
        assert.ok(await item.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const dock = document.querySelector('.ce-tool-dock')?.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= (dock && dock.height ? Math.min(innerHeight, dock.top) : innerHeight);
        }), 'ECG and feedback must scroll fully above the dock');
      }
      const measurementReview = page.getByRole('region', { name: 'Selected interval comparison' });
      const measurementText = await measurementReview.innerText();
      const missedLandmarks = offset || isFounderExample || isCrossBeatExample || sameDurationOtherBeat;
      const missedDuration = durationMissOnly || isFounderExample || isCrossBeatExample;
      assert.ok(measurementText.includes(missedDuration ? 'Duration outside tolerance' : 'Duration matches'));
      assert.ok(measurementText.includes(missedLandmarks ? 'Check the target endpoints' : 'Target endpoints match'));
      if (durationMissOnly) assert.ok(measurementText.includes('Both markers are near the requested onsets'));
      if (sameDurationOtherBeat) assert.ok(measurementText.includes('expected types of onsets on beat 1'));
      if (isCrossBeatExample) {
        assert.ok((await measurementReview.innerText()).includes('A and B are near onsets on different beats (1 and 2).'));
      }
      if (isFounderExample) {
        await measurementReview.getByText('Marker details', { exact: true }).press('Enter');
        const comparison = await measurementReview.innerText();
        for (const phrase of ['1.06 s', '0.12 s', '0.94 s longer', '0.33 s after the target QRS onset', '1.27 s after the target atrial onset', 'Away from a marked atrial or QRS onset', 'At least one marker is near a different onset than the target.', 'Near beat 2 atrial onset']) {
          assert.ok(comparison.includes(phrase), phrase);
        }
        const original = await page.locator('.rc-learner-marker line').evaluateAll(nodes => nodes.map(node => node.getAttribute('x1')));
        await page.getByRole('button', { name: 'Find my markers' }).press('Enter');
        const myPosition = await page.locator('.rc-scroll').evaluate(pane => pane.scrollLeft);
        await page.getByRole('button', { name: 'Find reference' }).press('Enter');
        assert.ok(await page.locator('.rc-scroll').evaluate(pane => pane.scrollLeft) <= myPosition);
        assert.deepEqual(await page.locator('.rc-learner-marker line').evaluateAll(nodes => nodes.map(node => node.getAttribute('x1'))), original);
      }
      if (isRC04) {
        assert.ok(result.includes(`Localization ${localization === 'No' ? 'matches' : 'needs review'} · Your answer: ${localization}. Reference answer: No.`));
        assert.ok(result.includes('0.38 s, and the QRS begins at 0.49 s, an interval of 0.11 s'));
        assert.ok(result.includes('An ectopic atrial rhythm'));
      }
      if (example.prPattern) {
        assert.ok(result.includes(observation === example.prPattern ? 'PR observation matches' : 'PR observation needs review'));
        for (const interval of [0, 2, 0]) {
          await page.getByRole('button', { name: new RegExp(`^Interval ${interval + 1} ·`) }).press('Enter');
          const lines = await page.locator('.rc-reference-marker').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('x1'))));
          assert.ok(lines.every((x, i) => closeEnough(x, example.measurements[interval].span[i] * 800 / 6, 1e-6)));
          const markers = await page.locator('.rc-learner-marker line').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('x1'))));
          assert.equal(markers.length, 2);
          assert.ok(markers.every((x, i) => closeEnough(x * 6 / 800, placedSpans[interval][i], 0.02)));
        }
        if (example.id === 'RC-08') {
          if (observation === 'progression') assert.ok(result.includes('PR observation needs review · Lengthens before the pause, then shortens'));
          assert.ok(result.includes('Reference pattern · The first, pre-pause and post-pause PR intervals are the same.'));
          for (const phrase of ['2.58 s', '0.80 s', '0.20 s', 'Mobitz II pattern', 'narrow QRS does not determine', 'classic Wenckebach']) assert.ok(result.includes(phrase));
          assert.ok(closeEnough(await page.locator('.rc-ventricular').first().getAttribute('width'), 0.08 * 800 / 6, 1e-6));
          const dropped = await page.locator('.rc-dropped').getAttribute('d');
          assert.ok(closeEnough(Number(dropped.split(' ')[1]), 2.58 * 800 / 6, 1e-6));
        }
      }
      const atrial = await page.locator('.rc-atrial').evaluateAll(elements => elements.map(element => Number(element.getAttribute('x'))));
      assert.equal(atrial.length, example.beats.length);
      assert.ok(atrial.every((x, i) => closeEnough(x, example.beats[i].p * 800 / 6, 1e-6)));
      const qrs = await page.locator('.rc-ventricular').evaluateAll(elements => elements.map(element => Number(element.getAttribute('x'))));
      const conducted = example.beats.flatMap(beat => beat.q === null ? [] : [beat.q]);
      assert.equal(qrs.length, conducted.length);
      assert.ok(qrs.every((x, i) => closeEnough(x, conducted[i] * 800 / 6, 1e-6)));
      assert.equal(await page.locator('.rc-dropped').count(), example.beats.filter(beat => beat.q === null).length);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (index === 0) {
        await page.getByRole('button', { name: '3×', exact: true }).press('Enter');
        const pan = page.getByRole('slider', { name: 'Pan full strip' });
        await pan.press('End');
        await page.waitForFunction(() => {
          const pane = document.querySelector('.rc-scroll');
          return Math.abs(pane.scrollWidth - pane.clientWidth - pane.scrollLeft) <= 1;
        });
        await page.getByRole('button', { name: '2×', exact: true }).press('Enter');
        assert.ok(await page.locator('.rc-scroll').evaluate(pane => pane.scrollLeft > 0));
        await page.getByRole('button', { name: 'Hide evidence overlay' }).press('Enter');
        assert.equal(await page.locator('.rc-evidence').count(), 0);
        await page.getByRole('button', { name: 'Show evidence overlay' }).press('Enter');
        assert.equal(await page.locator('.rc-evidence').count(), 1);
      }
      const next = page.getByRole('button', { name: index === 7 ? 'Finish Rhythm Check' : 'Next case', exact: true });
      await next.evaluate(element => element.scrollIntoView({ block: 'center' }));
      assert.ok(await next.evaluate(button => {
        const { x, y, width, height } = button.getBoundingClientRect();
        const dock = document.querySelector('.ce-tool-dock')?.getBoundingClientRect();
        const bottom = dock && dock.height ? Math.min(innerHeight, dock.top) : innerHeight;
        return y >= 0 && y + height <= bottom && button.contains(document.elementFromPoint(x + width / 2, y + height / 2));
      }), 'The dock must not cover the next action');
      await next.press('Enter');
    }
    await page.getByRole('heading', { name: 'Rhythm Check complete' }).waitFor();
    await page.getByRole('button', { name: 'Start again' }).press('Enter');
    assert.equal(await page.locator('.rc-case-id').innerText(), 'RC-01');
    assert.equal(await page.locator('.rc-evidence').count(), 0);
    assert.equal(errors.length, 0, errors.join('\n'));
    assert.equal(apiRequests.length, 0);
    return { width, height, variant, cases: examples.length, zoomLevels: [1, 2, 3], touch: mobile, pageErrors: errors.length, apiRequests: apiRequests.length };
  } finally {
    await context.close();
  }
}

async function run() {
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    console.log(await verifyRhythmCheck(browser, Number(process.argv[2] ?? 1440), process.env.RHYTHM_CHECK_BASE_URL, Number(process.argv[3] ?? 0)));
  } finally {
    await browser.close();
  }
}

module.exports = { verifyRhythmCheck };

if (require.main === module) run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
