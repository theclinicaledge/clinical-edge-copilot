import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const completed = ['ed-rapid', 'night-shift', 'new-grad'];

test('the library exposes all seven completed sheets', async ({ page }) => {
  await page.goto('/brain-sheets');
  for (const id of ['medsurg-4pt', 'medsurg-6pt', 'icu-systems', 'telemetry', ...completed]) {
    await expect(page.locator(`a[href="/brain-sheets/${id}"]`)).toHaveCount(1);
  }
});

for (const id of completed) {
  test(`${id}: normal browser printing and PDF generation stay on one Letter page`, async ({ page }) => {
    for (const suffix of ['', '?pdf=1']) {
      await page.goto(`/brain-sheets/${id}${suffix}`);
      await expect(page.locator('.bs-sheet-footer')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.bs-print-root input, .bs-print-root textarea, .bs-print-root [contenteditable]')).toHaveCount(0);
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      await page.emulateMedia({ media: 'print' });
      const pdf = await PDFDocument.load(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
      expect(pdf.getPageCount()).toBe(1);
      expect(pdf.getPage(0).getSize()).toEqual({ width: 612, height: 792 });
      // One page alone can hide overflow. Labels and ruled blanks must also
      // fit inside the 0.4-inch printable page content.
      expect(await page.locator('.bs-sheet').evaluate(sheet => {
        const box = sheet.getBoundingClientRect();
        return [...sheet.querySelectorAll('*')].every(el => {
          const r = el.getBoundingClientRect();
          return r.left >= box.left - 1 && r.right <= box.right + 1 && r.top >= box.top - 1 && r.bottom <= box.top + 10.2 * 96 + 1;
        });
      })).toBe(true);
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test(`${id}: compact and enlarged previews keep the whole sheet visible`, async ({ page }) => {
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/brain-sheets/${id}`);
      await expect(page.locator('.bs-sheet')).toBeVisible();
      const assertUnclipped = async () => {
        expect(await page.locator('.bs-print-root').evaluate(root => {
          const box = root.getBoundingClientRect();
          return [...root.querySelectorAll('*')].every(el => {
            const r = el.getBoundingClientRect();
            return r.left >= box.left - 1 && r.right <= box.right + 1 && r.top >= box.top - 1 && r.bottom <= box.bottom + 1;
          });
        })).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      };
      await assertUnclipped();
      await page.getByRole('button', { name: /View a larger preview/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await assertUnclipped();
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
  });
}
