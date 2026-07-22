import SheetFrame from '../components/SheetFrame.jsx';
import '../brain-sheets-print.css';

// Med-Surg · 4 Patient — brain-sheet-spec.md §3.1, revised around shift
// prioritization and handoff readiness rather than a head-to-toe charting
// grid. Each quadrant answers: why is this patient here, what am I
// watching for, what matters today, what's still pending, and what does
// the next nurse need to know. Systems get a compact snapshot, not the
// centerpiece. The bottom band is a whole-assignment glance, not an SBAR
// letter grid.

const CLINICAL_CONCERNS = ['Airway / O₂', 'Hemodynamics', 'Neuro', 'Safety', 'Other'];

function PatientQuadrant({ n }) {
  return (
    <div className="bs-quadrant">
      <div className="bs-quadrant-identity">
        <div className="bs-quadrant-num" aria-label={`Patient ${n}`}>{n}</div>
        <div className="bs-pt-label-box" style={{ width: '108pt', flexShrink: 0 }}>
          <span className="bs-pt-label-box-text">PT LABEL / STICKER</span>
        </div>
        <div className="bs-quadrant-id-fields">
          <div className="bs-field">
            <span className="bs-field-label">Room / Bed</span>
            <span className="bs-blank-line bs-line-lg" />
          </div>
          <div className="bs-field">
            <span className="bs-field-label">Code Status</span>
            <span className="bs-blank-line bs-line-lg" />
          </div>
          <div className="bs-field">
            <span className="bs-field-label">Dx</span>
            <span className="bs-blank-line bs-line-lg" />
          </div>
          <div className="bs-field">
            <span className="bs-field-label">Allergies</span>
            <span className="bs-blank-line bs-line-lg" />
          </div>
        </div>
      </div>

      <div className="bs-quadrant-inline-fields">
        <span className="bs-field">
          <span className="bs-checkbox" />
          <span className="bs-field-label">Isolation</span>
        </span>
        <span className="bs-field bs-shift-priority">
          <span className="bs-field-label">Shift Priority</span>
          <span className="bs-blank-line" />
        </span>
      </div>

      <div className="bs-quadrant-paired-callouts">
        <div className="bs-quadrant-callout">
          <span className="bs-quadrant-callout-label">Why Here</span>
          <span className="bs-blank-line bs-line-lg" />
        </div>
        <div className="bs-quadrant-callout">
          <span className="bs-quadrant-callout-label">Watch For</span>
          <span className="bs-blank-line bs-line-lg" />
        </div>
      </div>

      <div>
        <div className="bs-quadrant-callout-label">Today's Priorities</div>
        <div className="bs-priorities">
          {[1, 2, 3].map((i) => (
            <div className="bs-priority-row" key={i}>
              <span className="bs-checkbox" />
              <span className="bs-blank-line" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="bs-quadrant-section-label">Clinical Concerns</div>
        <div className="bs-quadrant-systems">
          {CLINICAL_CONCERNS.map((s) => (
            <div className="bs-quadrant-system-row" key={s}>
              <span className="bs-field-label">{s}</span>
              <span className="bs-blank-line" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="bs-quadrant-section-label">Meds / Timed Tasks</div>
        <div className="bs-meds-strip">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="bs-meds-cell" key={i}>
              <span className="bs-blank-line" />
              <span className="bs-blank-line" />
              <span className="bs-checkbox" />
            </div>
          ))}
        </div>
        <div className="bs-quadrant-tasks">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="bs-task-row" key={i}>
              <span className="bs-blank-line bs-time-blank" />
              <span className="bs-blank-line" />
              <span className="bs-checkbox" />
            </div>
          ))}
        </div>
      </div>

      <div className="bs-quadrant-stacked">
        <span className="bs-quadrant-callout-label">Pending</span>
        <span className="bs-blank-line bs-line-lg" />
        <span className="bs-blank-line bs-line-lg" />
      </div>

      <div className="bs-quadrant-stacked">
        <span className="bs-quadrant-callout-label">Next Shift</span>
        <span className="bs-blank-line bs-line-lg" />
        <span className="bs-blank-line bs-line-lg" />
        <span className="bs-blank-line bs-line-lg" />
      </div>
    </div>
  );
}

// ── Bottom band: Shift At A Glance ──────────────────────────────────────────
// A whole-assignment scan, not a full written SBAR. Deliberately does not
// repeat Why Here / Next Shift — those already live in the quadrants above;
// this band is Priority / Watch For / First Thing Next Shift only, one line
// each.

function GlanceColumn({ n }) {
  return (
    <div className="bs-handoff-summary-col">
      <div className="bs-handoff-summary-num">{n}</div>
      <div className="bs-handoff-summary-field">
        <span className="bs-field-label">Priority</span>
        <span className="bs-blank-line" />
      </div>
      <div className="bs-handoff-summary-field">
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
      <div className="bs-glance-legend">Handoff-Ready Summary</div>
      <div className="bs-handoff-summary">
        {[1, 2, 3, 4].map((n) => <GlanceColumn key={n} n={n} />)}
      </div>
    </div>
  );
}

export default function MedSurg4() {
  return (
    <SheetFrame title="Med-Surg · 4 Patient" handoff={<ShiftAtAGlance />}>
      <div className="bs-quadrant-grid">
        <PatientQuadrant n={1} />
        <PatientQuadrant n={2} />
        <PatientQuadrant n={3} />
        <PatientQuadrant n={4} />
      </div>
    </SheetFrame>
  );
}
