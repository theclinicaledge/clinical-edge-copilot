import { useEffect, useState } from 'react';
import RewindPlayer from '../../rewind/RewindPlayer.jsx';
import TrendReading from './Flowsheet.jsx';
import { REWIND, SOURCES, ROOM14_VITALS, REWIND_B_VITALS, FLOWSHEET_ROWS, FLOWSHEET_SR, title } from './data.js';
import { REWIND_KEY, readRewind, updateRewind, rewindAttempt } from './rewindStore.js';

const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
const sources = REWIND.sources.map(number => ({ title: SOURCES[number].citation, url: SOURCES[number].url, scope: `Supports: ${SOURCES[number].supports}` }));
const versions = REWIND.variations.map(variation => ({ ...variation, sources }));

// Variation C differs from the main table at 1910, so its flowsheet stops at 1600 and its
// 1910 reading is listed with the other findings. The description follows the Part E pattern.
const beforeEvening = ROOM14_VITALS.filter(v => v.time !== '1910');
const describe = table => {
  const first = table[0], last = table.at(-1);
  return `Vital signs for Room 14 from yesterday 2000 to ${last.time} today. Heart rate rises from ${first.hr} to ${last.hr}. Blood pressure falls from ${first.sys} over ${first.dia} to ${last.sys} over ${last.dia}. Respiratory rate rises from ${first.rr} to ${last.rr}.`;
};
const FLOWSHEETS = {
  main: { columns: ROOM14_VITALS, description: FLOWSHEET_SR.main },
  b: { columns: REWIND_B_VITALS, description: FLOWSHEET_SR.b },
  'main-before-1910': { columns: beforeEvening, description: describe(beforeEvening) },
};
const figure = variation => {
  const sheet = FLOWSHEETS[variation.flowsheet];
  return <TrendReading caption={`Room 14 flowsheet, ${variation.title}`} description={sheet.description} columns={sheet.columns} rows={FLOWSHEET_ROWS} />;
};

export default function Shift6Rewind() {
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
    <section className="mst-rewind-invite" aria-label="Optional Rewind practice"><div><p className="mst-eyebrow">Try the decision in a different situation</p><h2>What if the patient’s situation changed?</h2><p>{REWIND.intro}</p><p>Try one situation or all three. Your original Shift responses stay unchanged.</p><small>{tried} of 3 situations tried</small></div>
      {record.status !== 'blocked' && <button className="mst-primary" onClick={() => setOpen(true)}>{tried === versions.length ? 'Review Rewind' : tried ? 'Continue Rewind' : 'Explore Rewind'} →</button>}
    </section>
    {record.status === 'blocked' && <p role="status">Saved Rewind practice could not be read or belongs to another version. It has not been replaced. Your Shift responses are unchanged.</p>}
    {record.status === 'unavailable' && <p role="status">Device storage is unavailable. Practice stays in this open page only and may be lost when you leave or refresh.</p>}
    {open && record.value && <RewindPlayer versions={versions} title={title} takeaway={REWIND.teaching} review="Scenario review is founder-reported. Separate Rewind review scope was not supplied." rewind={record.value} figure={figure}
      close={() => setOpen(false)} onSelect={selected => update(value => { value.selected = selected; })}
      onSubmit={(variation, call) => { const attempt = rewindAttempt(variation, call); if (attempt) update(value => { value.attempts.push(attempt); }); }}
      onContinue={() => {}} continueLabel="Return to shift debrief"
      saveNotice={record.status === 'unavailable' ? 'Practice stays in this open page only. Device storage is unavailable.' : undefined} />}
  </div>;
}
