// Development-only visual fixture. No localStorage, analytics or production route.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/tokens.css';
import '../src/index.css';
import RewindPlayer from '../src/modules/rewind/RewindPlayer.jsx';
import { PACKS } from '../src/modules/rewind/packs.js';
import { freshPractice, practiceAttempt } from '../src/modules/rewind/standaloneStore.js';
export default function Review() {
  const [id, setId] = useState('conversation');
  const [record, setRecord] = useState(freshPractice('conversation'));
  const [open, setOpen] = useState(false);
  const pack = PACKS[id];
  return <main className="mst-root" style={{ padding: 32 }}><h1>Rewind UI review</h1><p>Fictional test session. Nothing is stored or sent.</p><label>Pack <select style={{ maxWidth: '100%' }} value={id} onChange={e => { setId(e.target.value); setRecord(freshPractice(e.target.value)); }}>{Object.entries(PACKS).map(([key, p]) => <option key={key} value={key}>{p.title}</option>)}</select></label><p>{record.attempts.length} test attempts</p><button onClick={() => setOpen(true)}>Open test Rewind</button>{open && <RewindPlayer versions={pack.variations} title={pack.title} takeaway={pack.takeaway} review={pack.review} rewind={record} close={() => setOpen(false)} onSelect={selected => setRecord(r => ({ ...r, selected }))} onSubmit={(variation, call, info) => setRecord(r => ({ ...r, attempts: [...r.attempts, practiceAttempt(id, variation, call, info)] }))} onContinue={() => setOpen(false)} continueLabel="Return to test overview" saveNotice="Fictional visual test. Responses last only in this open page." />}</main>;
}
createRoot(document.getElementById('root')).render(<Review />);
