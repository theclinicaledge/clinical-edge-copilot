import SheetFrame from '../components/SheetFrame.jsx';
import '../brain-sheets-print.css';

// Med-Surg · 6 Patient — brain-sheet-spec.md §3.2, high-ratio assignment
// sheet. At five-to-six patients the sheet is a task list first, not an
// assessment record: each band leads with a compact identity/context row,
// then the fields a nurse actually re-checks through the shift (why here,
// watch for, today's priorities, clinical concerns), then the shift's
// centerpiece — an hourly task-organization rail — then pending/next-shift
// for handoff. Six equal-height bands stacked vertically, not a compressed
// four-quadrant grid: at this ratio the sheet reads top-to-bottom as a rapid
// assignment scan, not a per-patient chart.

const CLINICAL_CONCERNS = ['Airway / O₂', 'Hemodynamics', 'Neuro', 'Safety', 'Other'];

const HOURS = ['0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900'];

function PatientBand({ n }) {
  return (
    <div className="bs-band">
      <div className="bs-band-identity">
        <div className="bs-band-num" aria-label={`Patient ${n}`}>{n}</div>
        <span className="bs-field">
          <span className="bs-field-label">Room / Bed</span>
          <span className="bs-blank-line" />
        </span>
        <span className="bs-field">
          <span className="bs-field-label">PT Label</span>
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
        <span className="bs-field bs-band-priority-field">
          <span className="bs-checkbox" />
          <span className="bs-field-label">Isolation</span>
        </span>
        <span className="bs-field bs-band-priority-field">
          <span className="bs-field-label">Shift Priority</span>
          <span className="bs-blank-line" />
        </span>
      </div>

      <div className="bs-band-paired">
        <div className="bs-band-callout">
          <span className="bs-band-callout-label">Why Here</span>
          <span className="bs-blank-line" />
        </div>
        <div className="bs-band-callout">
          <span className="bs-band-callout-label">Watch For</span>
          <span className="bs-blank-line" />
        </div>
      </div>

      <div className="bs-band-mid-row">
        <div>
          <div className="bs-band-label">Today's Priorities</div>
          <div className="bs-band-priorities">
            {[1, 2].map((i) => (
              <div className="bs-band-priority-row" key={i}>
                <span className="bs-checkbox" />
                <span className="bs-blank-line" />
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div className="bs-band-label">Clinical Concerns</div>
          <div className="bs-band-concerns-row">
            {CLINICAL_CONCERNS.map((c) => (
              <span className="bs-field" key={c}>
                <span className="bs-field-label">{c}</span>
                <span className="bs-blank-line" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bs-band-rail-row">
        <div className="bs-hour-rail">
          {HOURS.map((h) => (
            <div className="bs-hour-tick" key={h}>
              <span className="bs-hour-tick-label">{h}</span>
              <span className="bs-checkbox" />
            </div>
          ))}
        </div>
        <span className="bs-field bs-band-task-line">
          <span className="bs-field-label">Task</span>
          <span className="bs-blank-line" />
        </span>
      </div>

      <div className="bs-band-paired">
        <div className="bs-band-callout">
          <span className="bs-band-callout-label">Pending</span>
          <span className="bs-blank-line" />
        </div>
        <div className="bs-band-callout">
          <span className="bs-band-callout-label">Next Shift</span>
          <span className="bs-blank-line" />
        </div>
      </div>
    </div>
  );
}

// ── Bottom band: Shift At A Glance ──────────────────────────────────────────
// Same convention as Med-Surg 4's glance band (Priority / Watch For / First
// Thing Next Shift, no isolated SBAR letters) extended to six columns. Every
// field is stacked (label above its blank line) rather than side-by-side —
// at six columns per row there isn't width for an inline label without
// crowding the line unwritable, so all three fields use the pattern Med-Surg
// 4 only needed for its longest label.

function GlanceColumn({ n }) {
  return (
    <div className="bs-handoff-summary-col">
      <div className="bs-handoff-summary-num">{n}</div>
      <div className="bs-handoff-summary-field bs-handoff-summary-field-stacked">
        <span className="bs-field-label">Priority</span>
        <span className="bs-blank-line" />
      </div>
      <div className="bs-handoff-summary-field bs-handoff-summary-field-stacked">
        <span className="bs-field-label">Watch For</span>
        <span className="bs-blank-line" />
      </div>
      <div className="bs-handoff-summary-field bs-handoff-summary-field-stacked">
        <span className="bs-field-label">First Thing Next Shift</span>
        <span className="bs-blank-line" />
      </div>
    </div>
  );
}

function ShiftAtAGlance() {
  return (
    <div>
      <div className="bs-eyebrow" style={{ marginBottom: '1pt' }}>Shift At A Glance</div>
      <div className="bs-glance-legend">High-Ratio Assignment Summary</div>
      <div className="bs-glance-grid-6">
        {[1, 2, 3, 4, 5, 6].map((n) => <GlanceColumn key={n} n={n} />)}
      </div>
    </div>
  );
}

export default function MedSurg6() {
  return (
    <SheetFrame title="Med-Surg · 6 Patient" handoff={<ShiftAtAGlance />}>
      <div className="bs-band-list">
        {[1, 2, 3, 4, 5, 6].map((n) => <PatientBand key={n} n={n} />)}
      </div>
    </SheetFrame>
  );
}
