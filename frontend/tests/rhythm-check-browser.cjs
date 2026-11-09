const assert = require('node:assert/strict');

const closeEnough = (actual, expected, tolerance) => Math.abs(actual - expected) <= tolerance + 1e-9;

async function verifyRhythmCheck(browser, width, baseURL = 'http://127.0.0.1:5196', variant = 0) {
  const mobile = width < 500;
  const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
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
      const isRC04 = example.id === 'RC-04';
      const offset = index === 2 || example.id === 'RC-06' || (isRC04 && [1, 2, 4].includes(variant)) ? 0.30 : 0;
      const zoom = ['Fit', '2×', '3×'][index % 3];
      await page.getByRole('button', { name: zoom, exact: true }).press('Enter');
      await page.waitForFunction(value => document.querySelector('.rc-plot').style.width === value, `${100 * (index % 3 + 1)}%`);
      for (const [interval, measurement] of example.measurements.entries()) {
        if (interval > 0) await page.getByRole('button', { name: new RegExp(`^Interval ${interval + 1} ·`) }).press('Enter');
        for (const [marker, endpoint] of measurement.span.entries()) {
          const slider = page.getByRole('slider', { name: new RegExp(`Marker ${marker ? 'B' : 'A'} time`) });
          if (index === 0 && !mobile) {
            await slider.focus();
            for (let step = 0; step < Math.round(endpoint * 100); step++) await page.keyboard.press('ArrowRight');
          } else await tapTime(endpoint + offset);
          const actual = Number(await slider.inputValue());
          assert.ok(closeEnough(actual, endpoint + offset, 0.02), `${example.id} interval ${interval} marker ${marker} at ${width}px: ${actual} vs ${endpoint + offset}`);
        }
        const value = Number.parseFloat(await page.locator('.rc-measurement strong').innerText());
        assert.ok(closeEnough(value, measurement.span[1] - measurement.span[0], 0.03));
      }
      assert.ok(await submit.isDisabled());
      const choice = index === 1 ? 'uncertain' : isRC04 && answerPair >= 2 ? 'sinus' : example.answer;
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
      assert.ok(await submit.isEnabled());
      await submit.press('Enter');
      assert.ok(await page.locator('#rc-result-title').evaluate(element => document.activeElement === element));
      assert.equal(await page.locator('.rc-result .rc-eyebrow').innerText(), choice !== example.answer ? 'REVIEW THE DECIDING EVIDENCE' : 'INTERPRETATION MATCHES');
      const result = await page.locator('.rc-result').innerText();
      assert.ok(result.includes(offset ? 'Recheck marker placement' : 'Markers match'));
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
          assert.ok(markers.every((x, i) => closeEnough(x * 6 / 800, example.measurements[interval].span[i] + offset, 0.02)));
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
        await page.getByRole('button', { name: 'Hide evidence overlay' }).press('Enter');
        assert.equal(await page.locator('.rc-evidence').count(), 0);
        await page.getByRole('button', { name: 'Show evidence overlay' }).press('Enter');
        assert.equal(await page.locator('.rc-evidence').count(), 1);
      }
      await page.getByRole('button', { name: index === 7 ? 'Finish Rhythm Check' : 'Next case', exact: true }).press('Enter');
    }
    await page.getByRole('heading', { name: 'Rhythm Check complete' }).waitFor();
    await page.getByRole('button', { name: 'Start again' }).press('Enter');
    assert.equal(await page.locator('.rc-case-id').innerText(), 'RC-01');
    assert.equal(await page.locator('.rc-evidence').count(), 0);
    assert.equal(errors.length, 0, errors.join('\n'));
    assert.equal(apiRequests.length, 0);
    return { width, variant, cases: examples.length, zoomLevels: [1, 2, 3], touch: mobile, pageErrors: errors.length, apiRequests: apiRequests.length };
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
