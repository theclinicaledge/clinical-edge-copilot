import SheetFrame from '../components/SheetFrame.jsx';
import { Checks, Field, Ruled } from '../components/SheetPrimitives.jsx';
import '../brain-sheets-print.css';

function Encounter({ number }) {
  return <section className="bs-ed-encounter" aria-label={`Encounter ${number}`}>
    <div className="bs-ed-identity">
      <strong className="bs-paper-number">{number}</strong>
      <Field label="Bed" /><Field label="PT LABEL" /><Field label="Arrived" />
      <Field label="Allergies" /><Field label="Code Status" />
    </div>
    <div className="bs-paper-pair"><Field label="Chief complaint" /><Field label="Priority / watch for" /></div>
    <div className="bs-ed-rechecks" aria-label="Timed reassessments and responses">
      {[1, 2, 3].map(index => <div className="bs-ed-recheck" key={index}>
        <Field label="Recheck time" /><Ruled lines={2} />
      </div>)}
    </div>
    <div className="bs-ed-pending"><span className="bs-eyebrow">Pending</span><Checks labels={['Labs', 'Imaging', 'Consult', 'Meds']} /><Field label="Due / follow-up" /></div>
    <div className="bs-paper-pair"><Field label="Disposition / time" /><Field label="Still pending" /></div>
    <div className="bs-ed-handoff"><Field label="Handoff / receiving nurse" /><Field label="Time / accepted" /></div>
  </section>;
}

export default function EdRapid() {
  return <SheetFrame title="ED / Rapid Assessment" className="bs-complete bs-ed" handoff={<div className="bs-paper-prompt">Recheck lines: assessment / response. Pending boxes flag follow-up, not completed care. Disposition: admit / discharge / transfer / observation, per plan.</div>}>
    <div className="bs-ed-list">{[1, 2, 3, 4, 5].map(number => <Encounter key={number} number={number} />)}</div>
  </SheetFrame>;
}
