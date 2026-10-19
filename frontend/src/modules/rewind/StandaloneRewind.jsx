import { useEffect, useState } from 'react';
import { PACKS } from './packs.js';
import RewindPlayer from './RewindPlayer.jsx';
import { practiceAttempt, practiceKey, readPractice, updatePractice } from './standaloneStore.js';

// Access storage through methods so denied localStorage access also reaches the fallback.
const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
export default function StandaloneRewind({ id, navigate }) {
  const pack = PACKS[id];
  const [record, setRecord] = useState(() => readPractice(id, storage));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = event => { if (event.key === practiceKey(id) || event.key === null) { setOpen(false); setRecord(readPractice(id, storage)); } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [id]);
  const update = edit => setRecord(updatePractice(id, record, edit, storage));
  const tried = new Set(record.value?.attempts.map(a => a.variation)).size;
  return <div className="mst-standalone">
    <section className="mst-rewind-invite" aria-label="Optional Rewind practice"><div><p className="mst-eyebrow">Try the decision in a different situation</p><h2>What if the patient’s situation changed?</h2><p>Rewind brings you back to this moment with different findings. Choose what you would do, then see why your response might stay the same or change.</p><p>Try one situation or all three. Your original Shift responses stay unchanged.</p><small>{tried} of 3 situations tried{pack.legacy ? ' · Separate from Med-Surg track practice' : ''}</small></div>
      {record.status !== 'blocked' && <button className="mst-primary" onClick={() => setOpen(true)}>{tried === pack.variations.length ? 'Review Rewind' : tried ? 'Continue Rewind' : 'Explore Rewind'} →</button>}
    </section>
    {record.status === 'blocked' && <p role="status">Saved Rewind practice could not be read or belongs to another version. It has not been replaced. Your Shift responses are unchanged.</p>}
    {record.status === 'unavailable' && <p role="status">Device storage is unavailable. Practice stays in this open page only and may be lost when you leave or refresh.</p>}
    {open && record.value && <RewindPlayer versions={pack.variations} title={pack.title} takeaway={pack.takeaway} review={pack.review} rewind={record.value} close={() => setOpen(false)} onSelect={selected => update(value => { value.selected = selected; })} onSubmit={(variation, call, information) => { const attempt = practiceAttempt(id, variation, call, information); if (attempt) update(value => { value.attempts.push(attempt); }); }} onContinue={() => navigate('/learn/shifts')} continueLabel="Return to Shift Library" saveNotice={record.status === 'unavailable' ? 'Practice stays in this open page only. Device storage is unavailable.' : undefined} />}
  </div>;
}
