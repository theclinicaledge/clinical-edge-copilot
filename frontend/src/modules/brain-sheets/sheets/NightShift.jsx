import SheetFrame from '../components/SheetFrame.jsx';
import { Checks, Field, PaperIdentity, Ruled } from '../components/SheetPrimitives.jsx';
import '../brain-sheets-print.css';

const HOURS = ['1900', '2000', '2100', '2200', '2300', '0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0730'];

function DayHandoff() {
  return <div className="bs-night-columns bs-night-handoff">{[1, 2, 3, 4].map(number => <section key={number}>
    <div className="bs-eyebrow">Patient {number} / day shift</div>
    <Ruled label="Follow-up / due" lines={2} />
    <Field label="Watch for" /><Field label="Who to notify" />
    <Field label="Handoff accepted" />
  </section>)}</div>;
}

export default function NightShift() {
  return <SheetFrame title="Night Shift / 4 Patient" className="bs-complete bs-night" handoff={<DayHandoff />}>
    <div className="bs-night-columns">{[1, 2, 3, 4].map(number => <section className="bs-night-patient" key={number}>
      <PaperIdentity number={number} compact />
      <Field label="Dx" /><Ruled label="Why here / priority" lines={2} />
    </section>)}</div>
    <div className="bs-paper-prompt">Overnight task and reassessment organizer. Use actual due times from active orders and local policy.</div>
    <table className="bs-night-timeline">
      <caption>Timed tasks / reassessments / follow-up</caption>
      <thead><tr><th scope="col">Time</th>{[1, 2, 3, 4].map(number => <th scope="col" key={number}>Patient {number}</th>)}</tr></thead>
      <tbody>{HOURS.map(hour => <tr key={hour}><th scope="row">{hour}</th>{[1, 2, 3, 4].map(number => <td key={number}><span className="bs-night-writing" /></td>)}</tr>)}</tbody>
    </table>
    <div className="bs-night-checks"><div><div className="bs-eyebrow">Chart review</div><Checks labels={['Orders', 'MAR', 'Labs ordered', 'Consents']} /></div>
      <div><div className="bs-eyebrow">AM preparation / as applicable</div><Checks labels={['Labs drawn', 'Weights', 'I/O totaled', 'Handoff ready']} /></div>
    </div>
    <div className="bs-paper-prompt">New concerns need assessment and communication when they arise. Day-shift follow-up is for appropriate ongoing or non-urgent work.</div>
  </SheetFrame>;
}
