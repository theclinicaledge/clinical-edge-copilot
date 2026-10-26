import { useEffect, useState } from 'react';
import { codeTime } from './engine.js';

export default function OpeningSequence({ events }) {
  const [playing, setPlaying] = useState(false), [index, setIndex] = useState(-1);
  useEffect(() => {
    if (!playing || index >= events.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setIndex(i => i + 1), 1800);
    return () => clearTimeout(timer);
  }, [playing, index, events.length]);
  const active = playing && index < events.length;
  return <><ol className="s8-log s8-opening-record">{events.map((e, i) => <li key={i} aria-current={active && i === index ? 'step' : undefined}><time>{codeTime(e.time)}</time><div><strong>{e.actor}{e.prompted ? ' · Prompted' : ''}</strong><p>{e.text}</p></div></li>)}</ol>
    <button type="button" onClick={() => { if (active) setPlaying(false); else { setIndex(0); setPlaying(true); } }}>{active ? 'Pause playback' : 'Replay sequence'}</button>
    <small className="s8-muted">All events remain visible. Playback is optional and does not change your choices or scenario time.</small></>;
}
