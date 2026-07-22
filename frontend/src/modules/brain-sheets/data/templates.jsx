// Fixed v1 Brain Sheet registry — brain-sheet-spec.md §2.4 and §3.
// Template `id`s are the analytics contract (spec §8) and are permanent —
// never rename, add, or remove an id outside a spec revision.
//
// `Sheet` is omitted until a template's production sheet component exists
// (registered per-template across B3–B5); callers must never assume
// `.Sheet` exists and must guard every render.
//
// `pdfPath`/`pdfFilename` are likewise omitted until a template has a
// pre-generated static PDF (currently medsurg-4pt only — see
// scripts/generate-brain-sheets-pdf.mjs). Callers must guard on `pdfPath`
// before rendering a Download PDF action.

import MedSurg4 from '../sheets/MedSurg4.jsx';
import MedSurg6 from '../sheets/MedSurg6.jsx';

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
  },
  {
    id: 'telemetry',
    title: 'Telemetry / Stepdown',
    audience: 'For telemetry and stepdown, two patients per page.',
    meta: '1 PAGE · 2 PATIENTS',
    pearls: [],
  },
  {
    id: 'ed-rapid',
    title: 'ED / Rapid Assessment',
    audience: 'For ED nurses tracking five encounters at once.',
    meta: '1 PAGE · 5 ENCOUNTERS',
    pearls: [],
  },
  {
    id: 'night-shift',
    title: 'Night Shift · 4 Patient',
    audience: 'For a typical overnight assignment of four patients.',
    meta: '1 PAGE · 4 PATIENTS',
    pearls: [],
  },
  {
    id: 'new-grad',
    title: 'New Grad / Student Clinical',
    audience: 'For students and new grads building the reasoning habit.',
    meta: '1 PAGE · 1 PATIENT',
    pearls: [],
  },
];

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}
