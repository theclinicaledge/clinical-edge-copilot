// Fixed v1 Brain Sheet registry — brain-sheet-spec.md §2.4 and §3.
// Template `id`s are the analytics contract (spec §8) and are permanent —
// never rename, add, or remove an id outside a spec revision.
//
// Each fixed template has a production Sheet and matching static PDF.
// Keep render/download guards so an incomplete future entry cannot expose
// a broken action. Regenerate PDFs with scripts/generate-brain-sheets-pdf.mjs.

import MedSurg4 from '../sheets/MedSurg4.jsx';
import MedSurg6 from '../sheets/MedSurg6.jsx';
import IcuSystems from '../sheets/IcuSystems.jsx';
import TelemetryStepdown from '../sheets/TelemetryStepdown.jsx';
import EdRapid from '../sheets/EdRapid.jsx';
import NightShift from '../sheets/NightShift.jsx';
import NewGrad from '../sheets/NewGrad.jsx';

export const TEMPLATES = [
  {
    id: 'medsurg-4pt',
    title: 'Med-Surg · 4 Patient',
    audience: 'For a typical med-surg assignment of four patients.',
    meta: '1 PAGE · 4 PATIENTS',
    pearls: [],
    Sheet: MedSurg4,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-medsurg-4-patient-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-medsurg-4-patient-brain-sheet.pdf',
    pdfTitle: 'Med-Surg 4 Patient Brain Sheet',
  },
  {
    id: 'medsurg-6pt',
    title: 'Med-Surg · 6 Patient',
    audience: 'For high-ratio assignments of five to six patients.',
    meta: '1 PAGE · 6 PATIENTS',
    pearls: [],
    Sheet: MedSurg6,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-medsurg-6-patient-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-medsurg-6-patient-brain-sheet.pdf',
    pdfTitle: 'Med-Surg 6 Patient Brain Sheet',
  },
  {
    id: 'icu-systems',
    title: 'ICU · Systems-Based Single Patient',
    audience: 'For one ICU patient, organized by body system.',
    meta: '1 PAGE · 1 PATIENT',
    pearls: [],
    Sheet: IcuSystems,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-icu-systems-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-icu-systems-brain-sheet.pdf',
    pdfTitle: 'ICU Systems Brain Sheet',
  },
  {
    id: 'telemetry',
    title: 'Telemetry / Stepdown',
    audience: 'For telemetry and stepdown, two patients per page.',
    meta: '1 PAGE · 2 PATIENTS',
    pearls: [],
    Sheet: TelemetryStepdown,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-telemetry-stepdown-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-telemetry-stepdown-brain-sheet.pdf',
    pdfTitle: 'Telemetry Stepdown Brain Sheet',
  },
  {
    id: 'ed-rapid',
    title: 'ED / Rapid Assessment',
    audience: 'For ED nurses tracking five encounters at once.',
    meta: '1 PAGE · 5 ENCOUNTERS',
    pearls: [],
    Sheet: EdRapid,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-ed-rapid-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-ed-rapid-brain-sheet.pdf',
    pdfTitle: 'ED Rapid Assessment Brain Sheet',
  },
  {
    id: 'night-shift',
    title: 'Night Shift · 4 Patient',
    audience: 'For a typical overnight assignment of four patients.',
    meta: '1 PAGE · 4 PATIENTS',
    pearls: [],
    Sheet: NightShift,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-night-shift-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-night-shift-brain-sheet.pdf',
    pdfTitle: 'Night Shift 4 Patient Brain Sheet',
  },
  {
    id: 'new-grad',
    title: 'New Grad / Student Clinical',
    audience: 'For students and new grads building the reasoning habit.',
    meta: '1 PAGE · 1 PATIENT',
    pearls: [],
    Sheet: NewGrad,
    pdfPath: '/brain-sheets/pdfs/clinical-edge-new-grad-brain-sheet.pdf',
    pdfFilename: 'clinical-edge-new-grad-brain-sheet.pdf',
    pdfTitle: 'New Grad Student Clinical Brain Sheet',
  },
];

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}
