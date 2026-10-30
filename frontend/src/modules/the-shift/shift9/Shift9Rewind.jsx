import { useEffect, useState } from 'react';
import RewindPlayer from '../../rewind/RewindPlayer.jsx';
import StripFigure from '../components/StripFigure.jsx';
import { REWIND, SOURCES, STRIPS, title } from './data.js';
import { REWIND_KEY, readRewind, updateRewind, rewindAttempt } from './rewindStore.js';

const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
const sources = REWIND.sources.map(number => ({ title: SOURCES[number].citation, url: SOURCES[number].url, scope: `Supports: ${SOURCES[number].supports}` }));
const versions = REWIND.variations.map(variation => ({ ...variation, history: REWIND.history, sources }));
// The Rewind strip is only shown before the choice, so it reads the objective description (v0.8).
const figure = variation => {
  const strip = STRIPS[variation.strip];
  return <StripFigure src={strip.src} alt={strip.altBefore ?? strip.alt} caption={strip.caption} />;
};

export default function Shift9Rewind() {
  const [record, setRecord] = useState(() => readRewind(storage));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = event => { if (event.key === REWIND_KEY || event.key === null) { setOpen(false); setRecord(readRewind(storage)); } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const update = edit => setRecord(updateRewind(record, edit, storage));
  const tried = new Set(record.value?.attempts.map(a => a.variation)).size;
  return <div className="mst-standalone s6-rewind">
    <section className="mst-rewind-invite" aria-label="Optional Rewind practice"><div><p className="mst-eyebrow">{REWIND.title}</p><h2>What if the patient’s situation changed?</h2><p>{REWIND.intro}</p><p>Try one situation or all three. Your original Shift responses stay unchanged.</p><small>{tried} of 3 situations tried</small></div>
      {record.status !== 'blocked' && <button className="mst-primary" onClick={() => setOpen(true)}>{tried === versions.length ? 'Review Rewind' : tried ? 'Continue Rewind' : 'Explore Rewind'} →</button>}
    </section>
    {record.status === 'blocked' && <p role="status">Saved Rewind practice could not be read or belongs to another version. It has not been replaced. Your Shift responses are unchanged.</p>}
    {record.status === 'unavailable' && <p role="status">Device storage is unavailable. Practice stays in this open page only and may be lost when you leave or refresh.</p>}
    {open && record.value && <RewindPlayer versions={versions} title={title} takeaway={REWIND.teaching} review="Founder, independent clinical and psych specialty review reported by the founder. ECG images reviewed by the founder." rewind={record.value} figure={figure}
      close={() => setOpen(false)} onSelect={selected => update(value => { value.selected = selected; })}
      onSubmit={(variation, call) => { const attempt = rewindAttempt(variation, call); if (attempt) update(value => { value.attempts.push(attempt); }); }}
      onContinue={() => {}} continueLabel="Return to shift debrief"
      saveNotice={record.status === 'unavailable' ? 'Practice stays in this open page only. Device storage is unavailable.' : undefined} />}
  </div>;
}
