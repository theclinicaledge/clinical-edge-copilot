import SheetFrame from '../components/SheetFrame.jsx';
import '../brain-sheets-print.css';

// Telemetry / Stepdown — two patients per page. This sheet keeps the
// Med-Surg reasoning spine (why here, watch for, priorities, pending,
// next shift) but gives telemetry-specific real estate to rhythm, events,
// oxygenation, trends, and timed reassessments.

const CONCERNS = ['Rhythm', 'O2 / Airway', 'BP / Perfusion', 'Neuro', 'Safety'];
const HOURS = ['0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900'];
const LABS = ['K', 'Mg', 'Cr', 'Hgb', 'Trop', 'BNP'];

function IdentityRow({ n }) {
  return (
    <div className="bs-tele-identity">
      <div className="bs-tele-num" aria-label={`Patient ${n}`}>{n}</div>
      <div className="bs-pt-label-box" style={{ width: '112pt', flexShrink: 0 }}>
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
      <span className="bs-field bs-tele-tight">
        <span className="bs-checkbox" />
        <span className="bs-field-label">Isolation</span>
      </span>
    </div>
  );
}

function CalloutPair() {
  return (
    <div className="bs-tele-callout-grid">
      <div className="bs-tele-callout">
        <span className="bs-tele-callout-label">Why Here</span>
        <span className="bs-blank-line bs-line-lg" />
      </div>
      <div className="bs-tele-callout">
        <span className="bs-tele-callout-label">Watch For</span>
        <span className="bs-blank-line bs-line-lg" />
      </div>
    </div>
  );
}

function RhythmBlock() {
  return (
    <div className="bs-tele-rhythm-block">
      <div className="bs-tele-rhythm-top">
        <span className="bs-field">
          <span className="bs-field-label">Baseline Rhythm</span>
          <span className="bs-blank-line" />
        </span>
        <span className="bs-field">
          <span className="bs-field-label">Rate</span>
          <span className="bs-blank-line" />
        </span>
        <span className="bs-field">
          <span className="bs-field-label">QTc</span>
          <span className="bs-blank-line" />
        </span>
      </div>
      <div className="bs-tele-strip">
        <span className="bs-field-label">Rhythm / Events</span>
        <span className="bs-tele-strip-line" />
        <span className="bs-tele-strip-line" />
      </div>
      <div className="bs-tele-checkbox-grid">
        {['Chest Pain', 'Palpitations', 'Dizziness', 'SOB', 'Pacer / ICD', 'Tele Notified'].map((label) => (
          <span className="bs-field" key={label}>
            <span className="bs-checkbox" />
            <span className="bs-field-label">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TrendGrid() {
  return (
    <div className="bs-tele-trend-grid">
      <div>
        <div className="bs-eyebrow">Vitals / Response</div>
        {['BP Trend', 'HR Trend', 'O2 / Device', 'Activity Tolerance'].map((label) => (
          <div className="bs-field" key={label}>
            <span className="bs-field-label">{label}</span>
            <span className="bs-blank-line" />
          </div>
        ))}
      </div>
      <div>
        <div className="bs-eyebrow">Labs / Electrolytes</div>
        <div className="bs-tele-lab-grid">
          {LABS.map((label) => (
            <div className="bs-tele-lab-row" key={label}>
              <span className="bs-field-label">{label}</span>
              <span className="bs-blank-line" />
              <span className="bs-tele-trend">up / same / down</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrioritiesAndConcerns() {
  return (
    <div className="bs-tele-mid-grid">
      <div>
        <div className="bs-eyebrow">Today's Priorities</div>
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
        <div className="bs-eyebrow">Clinical Concerns</div>
        <div className="bs-tele-concerns">
          {CONCERNS.map((label) => (
            <div className="bs-tele-concern-row" key={label}>
              <span className="bs-field-label">{label}</span>
              <span className="bs-blank-line" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskRail() {
  return (
    <div>
      <div className="bs-eyebrow">Timed Tasks / Reassessments</div>
      <div className="bs-tele-hour-rail">
        {HOURS.map((h) => (
          <div className="bs-tele-hour-tick" key={h}>
            <span className="bs-hour-tick-label">{h}</span>
            <span className="bs-checkbox" />
          </div>
        ))}
      </div>
      <div className="bs-tele-task-lines">
        {[1, 2, 3].map((i) => (
          <div className="bs-task-row" key={i}>
            <span className="bs-blank-line bs-time-blank" />
            <span className="bs-blank-line" />
            <span className="bs-checkbox" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingHandoff() {
  return (
    <div className="bs-tele-callout-grid">
      <div className="bs-tele-stacked">
        <span className="bs-tele-callout-label">Pending</span>
        <span className="bs-blank-line bs-line-lg" />
        <span className="bs-blank-line bs-line-lg" />
      </div>
      <div className="bs-tele-stacked">
        <span className="bs-tele-callout-label">Next Shift</span>
        <span className="bs-blank-line bs-line-lg" />
        <span className="bs-blank-line bs-line-lg" />
      </div>
    </div>
  );
}

function PatientPanel({ n }) {
  return (
    <section className="bs-tele-panel">
      <IdentityRow n={n} />
      <CalloutPair />
      <RhythmBlock />
      <TrendGrid />
      <PrioritiesAndConcerns />
      <TaskRail />
      <PendingHandoff />
    </section>
  );
}

function HandoffColumn({ n }) {
  return (
    <div className="bs-handoff-summary-col">
      <div className="bs-handoff-summary-num">{n}</div>
      <div className="bs-handoff-summary-field bs-handoff-summary-field-stacked">
        <span className="bs-field-label">Rhythm / Watch For</span>
        <span className="bs-blank-line" />
      </div>
      <div className="bs-handoff-summary-field bs-handoff-summary-field-stacked">
        <span className="bs-field-label">Pending</span>
        <span className="bs-blank-line" />
      </div>
      <div className="bs-handoff-summary-field bs-handoff-summary-field-stacked">
        <span className="bs-field-label">First Thing Next Shift</span>
        <span className="bs-blank-line" />
      </div>
    </div>
  );
}

function ShiftHandoff() {
  return (
    <div>
      <div className="bs-eyebrow" style={{ marginBottom: '1pt' }}>Shift Handoff</div>
      <div className="bs-glance-legend">Telemetry-Focused Summary</div>
      <div className="bs-tele-handoff-grid">
        {[1, 2].map((n) => <HandoffColumn key={n} n={n} />)}
      </div>
    </div>
  );
}

export default function TelemetryStepdown() {
  return (
    <SheetFrame title="Telemetry / Stepdown" handoff={<ShiftHandoff />}>
      <div className="bs-tele-grid">
        <PatientPanel n={1} />
        <PatientPanel n={2} />
      </div>
    </SheetFrame>
  );
}
