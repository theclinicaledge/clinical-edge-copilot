import SheetFrame, { SbarFourPart } from './SheetFrame.jsx';
import '../brain-sheets-print.css';

// ══════════════════════════════════════════════════════════════════════════
// NON-PRODUCTION — B2 geometry prototype only.
//
// This component exists solely to stress-test SheetFrame + the print layer
// at maximum expected density (brain-sheet-spec.md §10, B2). It is not a
// real template, is never registered in data/templates.jsx, and is removed
// once production sheets (B3–B5) replace it as the pattern reference
// (verified in B9). Do not add this file's building blocks to sheets/.
//
// Structure (corrected after visual review): the page demonstrates ONE
// full-width four-part SBAR strip as its real handoff region — the same
// weight a production sheet would use — plus a compact, clearly bounded
// "handoff variant test matrix" proving the other four structural forms
// hold their grid/column shape at reduced scale. It does not stack five
// full handoff sections; that produced an unrealistic, oversized page.
// ══════════════════════════════════════════════════════════════════════════

const SYSTEMS = ['NEURO', 'CV', 'RESP', 'GI/GU', 'SKIN/MOBILITY', 'ID/LINES'];

function SystemsBand({ label }) {
  return (
    <div className="bs-systems-band">
      <div className="bs-eyebrow">{label}</div>
      <span className="bs-blank-line" />
      <span className="bs-blank-line" />
    </div>
  );
}

function HourRail12() {
  const hours = Array.from({ length: 12 }, (_, i) => `${String((i + 7) % 24).padStart(2, '0')}00`);
  return (
    <div className="bs-hour-rail">
      {hours.map((h) => (
        <div className="bs-hour-tick" key={h}>
          <span className="bs-hour-tick-label">{h}</span>
          <span className="bs-checkbox" />
        </div>
      ))}
    </div>
  );
}

// ── Compact matrix cells — geometry samples, not production content ────────

function MatrixMiniSbarCell() {
  return (
    <div className="bs-handoff-matrix-cell">
      <div className="bs-handoff-matrix-cell-label">Mini-SBAR columns (4)</div>
      <div className="bs-matrix-mini-grid">
        {[1, 2, 3, 4].map((n) => (
          <div className="bs-matrix-mini-col" key={n}>
            <span className="bs-sbar-mini-num">{n}</span>
            <span className="bs-matrix-tick" />
            <span className="bs-matrix-tick" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixNextShiftCell() {
  return (
    <div className="bs-handoff-matrix-cell">
      <div className="bs-handoff-matrix-cell-label">Next Shift line</div>
      <div className="bs-matrix-row">
        <span className="bs-field-label">Next Shift</span>
        <span className="bs-matrix-tick" style={{ flex: 1 }} />
      </div>
      <div className="bs-sbar-key">
        <span>S</span><span>B</span><span>A</span><span>R</span>
      </div>
    </div>
  );
}

function MatrixDispositionCell() {
  return (
    <div className="bs-handoff-matrix-cell">
      <div className="bs-handoff-matrix-cell-label">Disposition / Pending / Handoff</div>
      <div className="bs-matrix-row" style={{ flexWrap: 'wrap', gap: '4pt' }}>
        <span className="bs-field-label">Admit</span>
        <span className="bs-field-label">DC</span>
        <span className="bs-field-label">Transfer</span>
        <span className="bs-field-label">Obs</span>
      </div>
      <span className="bs-matrix-tick" />
    </div>
  );
}

function MatrixHalfBandCell() {
  const letters = ['S', 'B', 'A', 'R'];
  return (
    <div className="bs-handoff-matrix-cell">
      <div className="bs-handoff-matrix-cell-label">Expanded teaching SBAR</div>
      <div className="bs-matrix-mini-grid">
        {letters.map((l) => (
          <div className="bs-matrix-mini-col" key={l}>
            <span className="bs-sbar-mini-letter">{l}</span>
            <span className="bs-matrix-tick" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SheetFramePrototypeB2({ onBack, onGoHome }) {
  return (
    <div className="bs-page">
      <div style={{ borderBottom: '1px solid var(--ce-line-dark)', background: 'var(--ce-navy-header)', padding: '14px 20px' }} className="bs-screen-only">
        <button className="ce-back-link" onClick={onBack}>← Brain Sheets</button>
        {' '}
        <button className="ce-back-link" onClick={onGoHome} style={{ marginLeft: 16 }}>← All tools</button>
      </div>

      <div className="bs-content bs-screen-only">
        <div className="bs-eyebrow">B2 Review — Not Product UI</div>
        <h1 className="bs-h1" style={{ fontSize: 22 }}>SheetFrame geometry prototype</h1>
        <p className="bs-lead" style={{ fontSize: 13 }}>
          Non-production stress test of the shared frame and print layer.
          Removed once B3–B5 register real sheet components.
        </p>
        <p style={{ fontFamily: 'var(--ce-font-mono)', fontSize: 11, color: 'var(--ce-text-dim)', marginBottom: 16 }}>
          For best results: Letter, Portrait, 100% scale, browser headers and footers off.
        </p>
        {/* TEMPORARY review-only trigger — not analytics-wired, not the
            production Print / Save PDF action. Removed/replaced in B7. */}
        <button
          onClick={() => window.print()}
          style={{
            marginBottom: 20,
            padding: '8px 16px',
            fontFamily: 'var(--ce-font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ce-text-dark)',
            background: 'var(--ce-gold)',
            border: 'none',
            borderRadius: 'var(--ce-r-sm)',
            cursor: 'pointer',
          }}
        >
          [B2 TEMP] Open Print Preview
        </button>
      </div>

      <div className="bs-content" style={{ paddingTop: 0 }}>
        <SheetFrame title="B2 Geometry Prototype — Not a Real Template" handoff={<SbarFourPart />}>
          <div className="bs-screen-only bs-proto-marker" style={{
            position: 'absolute', top: 4, left: 4, right: 4, zIndex: 5,
            background: 'rgba(212,168,75,0.16)', border: '1px solid var(--ce-gold)',
            color: 'var(--ce-gold-deep)', fontFamily: 'var(--ce-font-mono)',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            textAlign: 'center', padding: '3px 6px', borderRadius: 'var(--ce-r-sm)',
          }}>
            B2 NON-PRODUCTION GEOMETRY PROTOTYPE
          </div>

          {/* Identity zone: single-patient PT LABEL/STICKER box + multi-patient strips */}
          <div style={{ display: 'flex', gap: '8pt' }}>
            <div className="bs-pt-label-box" style={{ width: '110pt', flexShrink: 0 }}>
              <span className="bs-pt-label-box-text">PT LABEL / STICKER</span>
            </div>
            <div className="bs-identity-strip" style={{ flex: 1 }}>
              <div className="bs-field"><span className="bs-field-label">Room / Bed</span><span className="bs-blank-line" /></div>
              <div className="bs-field"><span className="bs-field-label">PT Label</span><span className="bs-blank-line" /></div>
              <div className="bs-field"><span className="bs-field-label">Code Status</span><span className="bs-blank-line" /></div>
            </div>
            <div className="bs-identity-strip" style={{ flex: 1 }}>
              <div className="bs-field"><span className="bs-field-label">Room / Bed</span><span className="bs-blank-line" /></div>
              <div className="bs-field"><span className="bs-field-label">PT Label</span><span className="bs-blank-line" /></div>
              <div className="bs-field"><span className="bs-field-label">Code Status</span><span className="bs-blank-line" /></div>
            </div>
          </div>

          {/* Six systems bands, two columns */}
          <div className="bs-systems-grid">
            {SYSTEMS.map((s) => <SystemsBand key={s} label={s} />)}
          </div>

          {/* Compact four-row table */}
          <table className="bs-table">
            <thead>
              <tr><th>Line</th><th>Site</th><th>Day</th><th>Dressing</th></tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((n) => (
                <tr key={n}>
                  <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                  <td><span className="bs-checkbox" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 12-hour timeline */}
          <div>
            <div className="bs-eyebrow" style={{ marginBottom: '2pt' }}>12-Hour Rail</div>
            <HourRail12 />
          </div>

          {/* Checkbox geometry row */}
          <div className="bs-checkbox-row">
            <span className="bs-field"><span className="bs-checkbox" /><span className="bs-field-label">Orders</span></span>
            <span className="bs-field"><span className="bs-checkbox" /><span className="bs-field-label">MAR</span></span>
            <span className="bs-field"><span className="bs-checkbox" /><span className="bs-field-label">Labs Ordered</span></span>
            <span className="bs-field"><span className="bs-checkbox" /><span className="bs-field-label">Consents</span></span>
          </div>

          {/* Maximum ruled-line density + minimum permitted type size (7pt) */}
          <div>
            <div className="bs-eyebrow" style={{ marginBottom: '2pt' }}>
              Max-density ruled lines <span style={{ fontSize: '7pt', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(this caption is set at the 7pt minimum)</span>
            </div>
            <div className="bs-dense-lines">
              {Array.from({ length: 6 }, (_, i) => <span className="bs-blank-line" key={i} />)}
            </div>
          </div>

          {/* Compact handoff-variant test matrix: proves the remaining four
              structural forms hold their grid shape at reduced scale. The
              fifth form (full-width four-part SBAR strip) is already the
              page's real handoff region above/below, at production size. */}
          <div className="bs-handoff-matrix">
            <div className="bs-eyebrow">Handoff Variant Test Matrix — geometry only, not full sections</div>
            <div className="bs-handoff-matrix-grid">
              <MatrixMiniSbarCell />
              <MatrixNextShiftCell />
              <MatrixDispositionCell />
              <MatrixHalfBandCell />
            </div>
          </div>
        </SheetFrame>
      </div>
    </div>
  );
}
