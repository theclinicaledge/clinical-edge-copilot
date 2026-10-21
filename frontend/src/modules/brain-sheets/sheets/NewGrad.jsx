import SheetFrame from '../components/SheetFrame.jsx';
import { Field, PaperIdentity, Ruled } from '../components/SheetPrimitives.jsx';
import '../brain-sheets-print.css';

const SYSTEMS = [
  ['Neuro', 'What differs from baseline alertness, movement, or comfort?'],
  ['CV / perfusion', 'How do pulse, pressure, skin, and symptoms fit together?'],
  ['Respiratory', 'What do rate, effort, breath sounds, and oxygen support show?'],
  ['GI / GU', 'What changed in intake, output, elimination, or tolerance?'],
  ['Skin / mobility', 'What support, precautions, or skin concerns need follow-up?'],
  ['Infection / access', 'What changed at access sites, wounds, or in temperature?'],
];
const SBAR = [
  ['Situation', 'What is happening now? What is your concern?'],
  ['Background', 'Which history or recent events matter to this concern?'],
  ['Assessment', 'What did you observe? What changed from baseline?'],
  ['Recommendation', 'What review or clarification are you requesting, and when?'],
];

function TeachingHandoff() {
  return <div><div className="bs-eyebrow">SBAR / practice a focused handoff</div><div className="bs-newgrad-sbar">{SBAR.map(([label, prompt]) => <Ruled key={label} label={label} prompt={prompt} lines={3} />)}</div></div>;
}

export default function NewGrad() {
  return <SheetFrame title="New Grad / Student Clinical" className="bs-complete bs-newgrad" handoff={<TeachingHandoff />}>
    <PaperIdentity /><Field label="Dx / relevant history" />
    <div className="bs-paper-pair"><Ruled label="Why is this patient here?" prompt="Connect the main problem with the findings you see." lines={3} /><Ruled label="What is the plan?" prompt="Active plan, expected outcomes, and questions for your RN / preceptor." lines={3} /></div>
    <div className="bs-paper-pair"><Ruled label="Today's priorities" lines={2} /><Ruled label="Watch for / discuss with RN" lines={2} /></div>
    <div className="bs-newgrad-systems" aria-label="System findings and changes">{SYSTEMS.map(([label, prompt]) => <section key={label}><div><div className="bs-eyebrow">{label}</div><div className="bs-paper-prompt">{prompt}</div></div><Ruled lines={2} /></section>)}</div>
    <div><div className="bs-eyebrow">Reassessment / close the loop</div>
      <table className="bs-newgrad-recheck"><thead><tr>{['Time', 'Change / response', 'RN / team informed', 'Pending / next review'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{[1, 2].map(number => <tr key={number}>{[1, 2, 3, 4].map(cell => <td key={cell}>&nbsp;</td>)}</tr>)}</tbody></table>
    </div>
    <Ruled label="General topics to review" prompt="Record general learning topics only. Do not copy patient identifiers or case-specific details." lines={3} />
    <div className="bs-paper-prompt">Learning and organization aid. Follow the active care plan, supervising RN / preceptor guidance, and local policy.</div>
  </SheetFrame>;
}
