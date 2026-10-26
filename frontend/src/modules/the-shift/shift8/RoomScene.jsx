import { useState } from 'react';
import { SimulationState } from './SimulationFrame.jsx';

export default function RoomScene({ response }) {
  const [closer, setCloser] = useState(false);
  const clear = Boolean(response);
  return <figure className="s8-room">
    {clear && <h3 className="s8-safety-result-heading" tabIndex={-1}>Marcus is clear</h3>}
    <SimulationState label="Bedside safety" className="s8-safety-state">
      <dl><div className={`s8-safety-priority ${clear ? 'is-clear' : ''}`}><dt>Defibrillator</dt><dd><strong>{clear ? 'Contact cleared · Shock 2 delivered by Priya at 03:30' : 'Charged · Everyone-clear call at 03:29'}</strong></dd><dt>Marcus</dt><dd><strong>{clear ? 'Hand withdrawn · Clear of Harold' : 'Hand touching Harold’s arm'}</strong></dd></div><div className="s8-safety-support"><dt>Priya</dt><dd>Designated manual defibrillator operator</dd><dt>Dr. Tran</dt><dd>{clear ? 'Compressions resumed after shock 2' : 'Clear'}</dd></div></dl>
      <p id="s8-room-description" className="s8-visually-hidden">{clear ? 'Marcus has withdrawn his hand and is clear of Harold. Priya delivered shock 2 at 03:30 after clearance. Dr. Tran resumed compressions.' : "Harold is in bed. Marcus, just relieved, still has his hand on Harold's arm. At 03:29 the defibrillator is charged and everyone has been asked to clear. Priya is the operator. Dr. Tran has stepped clear."}</p>
    </SimulationState>
    {clear ? <figcaption role="status">Marcus is now clear. {['stop', 'leader'].includes(response.id) ? 'Your spoken warning reached the team.' : 'Priya noticed the contact and held the shock; this was her intervention, not yours.'}</figcaption> : <>
      <button type="button" aria-label={closer ? 'Close bedside detail' : "Inspect Marcus's hand on Harold's arm"} aria-expanded={closer} onClick={() => setCloser(!closer)}>{closer ? 'Close bedside detail' : 'Look closer at the bedside'}</button>
      {closer && <figcaption>Marcus’s hand is still touching Harold’s arm. Looking closer does not warn the team. Choose your response below.</figcaption>}
    </>}
  </figure>;
}
