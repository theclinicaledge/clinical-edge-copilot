import SheetFrame from '../components/SheetFrame.jsx';
import '../brain-sheets-print.css';

// ICU · Systems-Based Single Patient — brain-sheet-spec.md §3.3, the
// systems-based format ICU preceptors teach. One patient, one full page:
// identity up top, then the fields a nurse re-checks all shift (why here,
// watch for, priorities, pending, next shift), then the six systems bands
// that are this sheet's spine, then the working detail (lines, drips, vent,
// labs), then an hourly I/O rail, then a compact Shift Handoff recap at the
// bottom (Why Here / Watch For / Pending / Next Shift again, deliberately
// short here — the detail already lives above; this is the quick-glance
// version for report). No isolated SBAR letters anywhere on this sheet.

const SYSTEMS = [
  { label: 'Neuro', micro: ['LOC', 'Pupils', 'Sedation / Pain'] },
  { label: 'CV', micro: ['Rhythm', 'MAP Goal', 'Perfusion'] },
  { label: 'Resp', micro: ['O₂ / Airway', 'Lung Sounds', 'Secretions'] },
  { label: 'GI / GU', micro: ['Diet / Feeds', 'Bowel', 'Urine / Output'] },
  { label: 'Skin / Mobility', micro: ['Wounds', 'Turn / Mobility', 'Precautions'] },
  { label: 'ID / Lines', micro: ['Temp / Cultures', 'Access', 'Drains'] },
];

const LABS = ['WBC', 'HGB', 'PLT', 'Na', 'K', 'Mg', 'Cr', 'Glucose', 'Lactate', 'ABG'];

const VENT_FIELDS = ['Mode', 'FiO₂', 'PEEP', 'Rate', 'TV'];

function IdentityRow() {
  return (
    <div className="bs-icu-identity">
      <div className="bs-pt-label-box" style={{ width: '104pt', flexShrink: 0 }}>
        <span className="bs-pt-label-box-text">PT LABEL / STICKER</span>
      </div>
      <span className="bs-field">
        <span className="bs-field-label">Room / Bed</span>
        <span className="bs-blank-line" />
      </span>
      <span className="bs-field">
        <span className="bs-field-label">Code Status</span>
        <span className="bs-blank-line" />
      </span>
      <span className="bs-field">
        <span className="bs-field-label">Dx</span>
        <span className="bs-blank-line" />
      </span>
      <span className="bs-field">
        <span className="bs-field-label">Allergies</span>
        <span className="bs-blank-line" />
      </span>
      <span className="bs-field" style={{ flex: '0 0 auto' }}>
        <span className="bs-checkbox" />
        <span className="bs-field-label">Isolation</span>
      </span>
      <span className="bs-field" style={{ flex: '0 0 auto' }}>
        <span className="bs-field-label">Shift Priority</span>
        <span className="bs-blank-line" style={{ width: '40pt', flex: '0 0 auto' }} />
      </span>
    </div>
  );
}

function StackedCallout({ label, lines }) {
  return (
    <div className="bs-icu-stacked-callout">
      <span className="bs-icu-callout-label">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <span className="bs-blank-line" key={i} />
      ))}
    </div>
  );
}

function TopFocus() {
  return (
    <div className="bs-icu-top">
      <div className="bs-icu-top-grid">
        <StackedCallout label="Why Here" lines={2} />
        <StackedCallout label="Watch For" lines={2} />
      </div>
      <div>
        <div className="bs-eyebrow">Today's Priorities</div>
        <div className="bs-priorities">
          {[1, 2, 3, 4].map((i) => (
            <div className="bs-priority-row" key={i}>
              <span className="bs-checkbox" />
              <span className="bs-blank-line" />
            </div>
          ))}
        </div>
      </div>
      <div className="bs-icu-top-grid">
        <StackedCallout label="Pending" lines={2} />
        <StackedCallout label="Next Shift" lines={3} />
      </div>
    </div>
  );
}

function SystemBand({ label, micro }) {
  return (
    <div className="bs-systems-band">
      <div className="bs-eyebrow">{label}</div>
      {micro.map((m) => (
        <div className="bs-field" key={m}>
          <span className="bs-field-label">{m}</span>
          <span className="bs-blank-line" />
        </div>
      ))}
    </div>
  );
}

function LinesAccessTable() {
  return (
    <table className="bs-table">
      <thead>
        <tr>
          <th>Line</th>
          <th>Site</th>
          <th>Day</th>
          <th>Dressing ✓</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4].map((n) => (
          <tr key={n}>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td style={{ textAlign: 'center' }}><span className="bs-checkbox" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DripsTable() {
  return (
    <table className="bs-table">
      <thead>
        <tr>
          <th>Drip Name</th>
          <th>Titrating? ✓</th>
          <th>Verified ✓</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <tr key={n}>
            <td>&nbsp;</td>
            <td style={{ textAlign: 'center' }}><span className="bs-checkbox" /></td>
            <td style={{ textAlign: 'center' }}><span className="bs-checkbox" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VentSettings() {
  return (
    <div className="bs-icu-vent-row">
      {VENT_FIELDS.map((l) => (
        <span className="bs-field" key={l}>
          <span className="bs-field-label">{l}</span>
          <span className="bs-blank-line" />
        </span>
      ))}
    </div>
  );
}

function LabsGrid() {
  return (
    <div className="bs-icu-labs-grid">
      {LABS.map((l) => (
        <div className="bs-icu-lab-row" key={l}>
          <span className="bs-field-label">{l}</span>
          <span className="bs-blank-line" />
          <span className="bs-icu-trend">↑&nbsp;&nbsp;→&nbsp;&nbsp;↓</span>
        </div>
      ))}
    </div>
  );
}

function IoRail() {
  return (
    <div className="bs-icu-io-rail">
      {Array.from({ length: 12 }, (_, i) => (
        <div className="bs-icu-io-tick" key={i}>
          <div className="bs-field">
            <span className="bs-field-label">Hr</span>
            <span className="bs-blank-line" />
          </div>
          <div className="bs-field">
            <span className="bs-field-label">In</span>
            <span className="bs-blank-line" />
          </div>
          <div className="bs-field">
            <span className="bs-field-label">Out</span>
            <span className="bs-blank-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shift Handoff — the sheet's handoff region (SheetFrame `handoff` slot).
// A two-column x two-row recap, each prompt getting 2 ruled lines (same
// StackedCallout pattern the top clinical-focus area uses) — still shorter
// than the top-of-page working notes (2/2/4/2/3 lines there), so this stays
// the quick-glance recap for report, not a duplicate of them. No SBAR
// letters; "SBAR-Aligned" is a small legend only, not a formal four-part
// block.
function ShiftHandoff() {
  return (
    <div>
      <div className="bs-eyebrow" style={{ marginBottom: '1pt' }}>Shift Handoff</div>
      <div className="bs-glance-legend">SBAR-Aligned</div>
      <div className="bs-icu-handoff-grid">
        <StackedCallout label="Why Here" lines={2} />
        <StackedCallout label="Watch For" lines={2} />
        <StackedCallout label="Pending" lines={2} />
        <StackedCallout label="Next Shift" lines={2} />
      </div>
    </div>
  );
}

export default function IcuSystems() {
  return (
    <SheetFrame title="ICU · Systems-Based Single Patient" handoff={<ShiftHandoff />}>
      <IdentityRow />
      <TopFocus />
      <div>
        <div className="bs-eyebrow" style={{ marginBottom: '2pt' }}>Systems</div>
        <div className="bs-systems-grid">
          {SYSTEMS.map((s) => <SystemBand key={s.label} label={s.label} micro={s.micro} />)}
        </div>
      </div>
      <div className="bs-icu-secondary-grid">
        <div className="bs-icu-secondary-col">
          <div className="bs-eyebrow">Lines &amp; Access</div>
          <LinesAccessTable />
          <div className="bs-eyebrow" style={{ marginTop: '3pt' }}>Labs &amp; Trends</div>
          <LabsGrid />
        </div>
        <div className="bs-icu-secondary-col">
          <div className="bs-eyebrow">Vent Settings</div>
          <VentSettings />
          <div className="bs-eyebrow" style={{ marginTop: '3pt' }}>Drips</div>
          <DripsTable />
        </div>
      </div>
      <div>
        <div className="bs-eyebrow" style={{ marginBottom: '2pt' }}>Hourly Intake / Output</div>
        <IoRail />
      </div>
    </SheetFrame>
  );
}
