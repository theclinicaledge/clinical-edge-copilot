// ─── Brain Sheets — static PDF generation ───────────────────────────────────
// Developer-invoked (not part of `npm run build`): generates a clean,
// vector-text, one-page PDF for each approved production Brain Sheet, using
// Playwright's Chromium to render the SAME production React component the
// screen preview and browser print path use — no separately hand-coded PDF
// layout, no screenshots-as-pages.
//
// Run: npm run generate:brain-sheets
//
// WHEN TO RE-RUN — the generated PDF is a static asset, not derived at
// request time, so it drifts unless refreshed by hand:
//   - whenever a sheet's component (frontend/src/modules/brain-sheets/sheets/*)
//     changes structure or content
//   - whenever brain-sheets-print.css changes (spacing, sizes, footer, page
//     setup — anything under the "the printable sheet system" banner)
//   - before any release where a Brain Sheet's printed output changed
//
// Output: frontend/public/brain-sheets/pdfs/<file>.pdf — a normal public
// asset, served at /brain-sheets/pdfs/<file>.pdf, linked by the Download PDF
// button in BrainSheetsModule.jsx (data/templates.jsx `pdfPath`).
//
// How it stays clean: navigates to `?pdf=1` on the template's detail route
// (see `isPdfGenerationMode()` in BrainSheetsModule.jsx), which renders
// ONLY the production `Sheet` component — no header, no metadata, no
// action buttons, no app chrome at all. `body.bs-print-scope` is then
// applied directly (see note below) so the sheet's own print-time CSS
// (brain-sheets-print.css `@media print`) takes over sizing/positioning
// exactly as it would for a real browser print. `page.pdf()` is Chromium's
// real print pipeline — output is vector text and vector hairlines, not a
// rasterized screenshot.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// One entry per approved production PDF. Add to this list only when a new
// template's Sheet component and print layout are both approved — do not
// generate PDFs ahead of an approved production sheet.
//
// `metadata` is written into the PDF's document properties post-generation
// (page.pdf() has no API for Author/Subject/Creator, and Title would
// otherwise fall back to the app's global document.title) — see
// setPdfMetadata() below.
const SHEETS = [
  {
    id: 'medsurg-4pt',
    filename: 'clinical-edge-medsurg-4-patient-brain-sheet.pdf',
    metadata: {
      title: 'Med-Surg 4 Patient Brain Sheet',
      author: 'Clinical Edge',
      subject: 'Printable nurse shift-organization brain sheet',
      creator: 'Clinical Edge',
    },
  },
];

async function setPdfMetadata(filePath, metadata) {
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes);
  doc.setTitle(metadata.title);
  doc.setAuthor(metadata.author);
  doc.setSubject(metadata.subject);
  doc.setCreator(metadata.creator);
  fs.writeFileSync(filePath, await doc.save());
}

async function main() {
  const vite = await createServer({
    root,
    server: { port: 0, strictPort: false },
    logLevel: 'warn',
  });
  await vite.listen();
  const address = vite.httpServer.address();
  const baseUrl = `http://localhost:${address.port}`;

  const browser = await chromium.launch();
  const outDir = path.join(root, 'public', 'brain-sheets', 'pdfs');
  fs.mkdirSync(outDir, { recursive: true });

  for (const sheet of SHEETS) {
    const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
    const url = `${baseUrl}/brain-sheets/${sheet.id}?pdf=1`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    // page.pdf() uses Chromium's CDP print pipeline directly and does not
    // dispatch beforeprint/afterprint (proven during B2 development — see
    // brain-sheets-print.css's scoping comment), so `body.bs-print-scope`
    // is applied explicitly here rather than relying on that lifecycle.
    // This is the same technique used to verify the print CSS throughout
    // this module's development — not a workaround specific to this script.
    await page.evaluate(() => document.body.classList.add('bs-print-scope'));

    const outPath = path.join(outDir, sheet.filename);
    await page.pdf({
      path: outPath,
      format: 'Letter',
      landscape: false,
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: { top: '0in', bottom: '0in', left: '0in', right: '0in' },
    });

    await page.close();

    if (sheet.metadata) {
      await setPdfMetadata(outPath, sheet.metadata);
    }

    console.log(`✓ Generated public/brain-sheets/pdfs/${sheet.filename}`);
  }

  await browser.close();
  await vite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
