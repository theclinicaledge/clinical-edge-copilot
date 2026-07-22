import { useEffect } from 'react';
import '../brain-sheets-print.css';

// SheetFrame — brain-sheet-spec.md §3.0.1, §5.3, B2.
//
// Ownership (exact — do not add to this list):
//   - page title
//   - blank DATE / SHIFT lines
//   - the main content area (children)
//   - an explicitly supplied handoff region (no default — see `handoff` below)
//   - the shared branded privacy footer
//
// SheetFrame never renders a patient-identity element, a default SBAR strip,
// clinical content, or any input/editable control. Identity areas and
// handoff content are owned by each sheet and passed in.

const SBAR_PARTS = [
  { key: 'situation', label: 'SITUATION' },
  { key: 'background', label: 'BACKGROUND' },
  { key: 'assessment', label: 'ASSESSMENT' },
  { key: 'recommendation', label: 'RECOMMENDATION' },
];

// ── Handoff variants (§3.0.2) — explicit selections a sheet may compose
// into its `handoff` node. These are the only structural forms whose exact
// four-part labels/ordering are constitutional; any other handoff content
// (a NEXT SHIFT line, a DISPOSITION/PENDING/HANDOFF block, etc.) is
// sheet-specific and passed as plain markup instead of one of these. ──────

export function SbarFourPart() {
  return (
    <div className="bs-sbar-strip">
      {SBAR_PARTS.map((p) => (
        <div className="bs-sbar-strip-col" key={p.key}>
          <div className="bs-eyebrow">{p.label}</div>
          <span className="bs-blank-line" />
          <span className="bs-blank-line" />
        </div>
      ))}
    </div>
  );
}

export function SbarMiniColumns({ count = 4 }) {
  return (
    <div className="bs-sbar-mini" style={{ '--bs-mini-count': count }}>
      {Array.from({ length: count }, (_, i) => (
        <div className="bs-sbar-mini-col" key={i}>
          <div className="bs-sbar-mini-num">{i + 1}</div>
          {SBAR_PARTS.map((p) => (
            <div className="bs-sbar-mini-row" key={p.key}>
              <span className="bs-sbar-mini-letter">{p.label[0]}</span>
              <span className="bs-blank-line" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SbarHalfBand({ prompts }) {
  return (
    <div className="bs-sbar-halfband">
      {SBAR_PARTS.map((p) => (
        <div className="bs-sbar-halfband-col" key={p.key}>
          <div className="bs-eyebrow">{p.label}</div>
          {prompts?.[p.key] && (
            <div className="bs-sbar-halfband-prompt">{prompts[p.key]}</div>
          )}
          <span className="bs-blank-line" />
          <span className="bs-blank-line" />
          <span className="bs-blank-line" />
        </div>
      ))}
    </div>
  );
}

// ── The frame itself ─────────────────────────────────────────────────────

export default function SheetFrame({ title, handoff, children, className }) {
  if (import.meta.env.DEV && !handoff) {
    // Not thrown — a missing handoff must never crash a sheet — but every
    // production sheet must pass one explicitly. SheetFrame has no default.
    // eslint-disable-next-line no-console
    console.warn(`SheetFrame "${title}": no handoff region supplied.`);
  }

  // Print scoping is driven by an explicit `body` class, not a CSS
  // relational selector (`:has()`). `:has()`-based print scoping proved
  // unreliable across print rendering paths in testing — behavior differed
  // between programmatic PDF generation and the browser's native print
  // preview. A class toggled deterministically is reliable in every
  // context and every browser. See brain-sheets-print.css for the rule
  // this class drives — it hides only elements explicitly marked
  // `.bs-screen-only` and named ancestor wrappers (`.bs-page`,
  // `.bs-content`), and never touches `display` on anything inside
  // `.bs-print-root`.
  //
  // The class is added only for the actual print operation (`beforeprint`
  // → `afterprint`), not for SheetFrame's entire mounted lifetime — there
  // is no browser requirement to hold it longer, and scoping it tightly
  // means it can never be observed active outside a real print/print-
  // preview pass, on this page or (via unmount cleanup) any other.
  useEffect(() => {
    const activate = () => document.body.classList.add('bs-print-scope');
    const deactivate = () => document.body.classList.remove('bs-print-scope');
    window.addEventListener('beforeprint', activate);
    window.addEventListener('afterprint', deactivate);
    return () => {
      window.removeEventListener('beforeprint', activate);
      window.removeEventListener('afterprint', deactivate);
      deactivate(); // safety fallback — never leave the class stuck on unmount
    };
  }, []);

  return (
    <div className={className ? `bs-print-root ${className}` : 'bs-print-root'}>
      <div className="bs-sheet">
        <div className="bs-sheet-header">
          <div className="bs-sheet-title">{title}</div>
          <div className="bs-sheet-datefields">
            <span className="bs-df">
              <span className="bs-df-label">Date</span>
              <span className="bs-blank-line" />
            </span>
            <span className="bs-df">
              <span className="bs-df-label">Shift</span>
              <span className="bs-blank-line" />
            </span>
          </div>
        </div>

        <div className="bs-sheet-content">{children}</div>

        {handoff && <div className="bs-sheet-handoff">{handoff}</div>}

        <div className="bs-sheet-footer">
          <span className="bs-footer-brand">CLINICAL EDGE · theclinicaledge.org/brain-sheets</span>
          <span className="bs-footer-phi">Once filled in, this sheet contains PHI — discard per facility policy.</span>
        </div>
      </div>
    </div>
  );
}
