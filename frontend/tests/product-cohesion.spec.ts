import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';

// Keep PDF failure/fallback checks under Playwright's network interception.
test.use({ serviceWorkers: 'block' });

const templates = [
  ['medsurg-4pt', 'clinical-edge-medsurg-4-patient-brain-sheet.pdf'],
  ['medsurg-6pt', 'clinical-edge-medsurg-6-patient-brain-sheet.pdf'],
  ['icu-systems', 'clinical-edge-icu-systems-brain-sheet.pdf'],
  ['telemetry', 'clinical-edge-telemetry-stepdown-brain-sheet.pdf'],
  ['ed-rapid', 'clinical-edge-ed-rapid-brain-sheet.pdf'],
  ['night-shift', 'clinical-edge-night-shift-brain-sheet.pdf'],
  ['new-grad', 'clinical-edge-new-grad-brain-sheet.pdf'],
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', () => { throw new Error('No clinical requests allowed in cohesion checks'); });
});

for (const [id, filename] of templates) {
  test(`${id} has a working one-page PDF and print action`, async ({ page }) => {
    await page.goto(`/brain-sheets/${id}`);
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download PDF', exact: true }).click();
    const result = await download;
    expect(result.suggestedFilename()).toBe(filename);
    const bytes = await readFile((await result.path())!);
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 612, height: 792 });
    await page.evaluate(() => {
      window.print = () => document.body.setAttribute('data-print-invoked', 'true');
    });
    await page.getByRole('button', { name: 'Print / Save PDF', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-print-invoked', 'true');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.bs-sheet')).toBeVisible();
    await expect(page.locator('.ce-workspace-nav')).not.toBeVisible();
  });
}

test.describe('mobile PDF access without replacing the workspace', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('unsupported file sharing exposes the actual PDF link, not a page loop', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'canShare', { value: () => false, configurable: true });
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('unavailable'); } }, configurable: true });
    });
    for (const [id, filename] of templates) {
      await page.goto(`/brain-sheets/${id}`);
      const origin = await page.evaluate(() => performance.timeOrigin);
      await page.getByRole('button', { name: 'Copy PDF Link', exact: true }).click();
      await expect(page.locator('.bs-copy-fallback-url')).toHaveText(`https://theclinicaledge.org/brain-sheets/pdfs/${filename}`);
      await expect(page.getByRole('link', { name: 'Open in Safari' })).toHaveCount(0);
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(origin);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });

  test('supported sharing uses the PDF, while a failed fetch gives a usable fallback', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
      Object.defineProperty(navigator, 'share', { value: async ({ files }: { files: File[] }) => {
        document.body.dataset.sharedPdf = `${files[0].name}:${files[0].type}:${files[0].size}`;
      }, configurable: true });
    });
    await page.goto('/brain-sheets/medsurg-4pt');
    await page.getByRole('button', { name: 'Save / Share PDF' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-shared-pdf', /brain-sheet.pdf:application\/pdf:[1-9]\d*/);
    await page.route('**/brain-sheets/pdfs/**', route => route.fulfill({ status: 404, contentType: 'text/html', body: 'Not found' }));
    await page.goto('/brain-sheets/telemetry');
    await page.getByRole('button', { name: 'Save / Share PDF' }).click();
    await expect(page.getByText('PDF sharing did not complete.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy PDF Link' })).toBeVisible();
    await expect(page.locator('body')).not.toHaveAttribute('data-shared-pdf');
  });
});

for (const width of [390, 768, 1440]) {
  test(`reference readability and keyboard access at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/reference-hub');
    await page.getByLabel('Search references').fill('mean arterial');
    const ref = page.getByRole('button', { name: 'Mean Arterial Pressure (MAP)', exact: true });
    expect(await ref.locator('.rh-ref-range').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
    expect(await ref.locator('.rh-ref-cat').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
    await ref.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Mean Arterial Pressure (MAP)' })).toBeVisible();
    expect(await page.locator('.rh-detail-field-body').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    expect(await page.locator('.rh-detail-field-label').first().evaluate(el => getComputedStyle(el).color)).toBe('rgb(82, 97, 116)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'All references', exact: true }).click();
    await page.getByRole('button', { name: 'More tools' }).click();
    await page.getByRole('dialog').getByRole('link', { name: /^Brain Sheets/ }).click();
    const sheet = page.getByRole('link', { name: 'Med-Surg · 4 Patient', exact: true });
    await sheet.focus(); await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/brain-sheets\/medsurg-4pt$/);
  });
}
