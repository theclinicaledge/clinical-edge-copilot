import { useId, useRef } from 'react';
import './strip-figure.css';

// A delivered ECG illustration shown as is, with the same Expand dialog pattern as the Monitor
// Alarm strips. The image keeps its own on-image label; `alt` is the screen-reader text and
// `caption` carries only what the image already shows (room, lead, time).
export default function StripFigure({ src, alt, caption, wide = false, children }) {
  const dialog = useRef(null), scroll = useRef(null), opener = useRef(null);
  const id = useId();
  const close = () => { dialog.current?.close(); opener.current?.focus({ preventScroll: true }); };
  return <figure className={`strip-figure ${wide ? 'is-wide' : ''}`}>
    <img src={src} alt={alt} />
    <figcaption><span>{caption}</span>
      <button ref={opener} type="button" className="strip-expand" onClick={() => dialog.current?.showModal()} aria-label={`Expand ${caption}`}><span aria-hidden="true">&#x2922;</span>Expand</button>
    </figcaption>
    {children}
    <dialog ref={dialog} className="strip-dialog" aria-labelledby={`${id}-heading`} onCancel={event => { event.preventDefault(); event.stopPropagation(); close(); }}>
      <div className="strip-dialog-heading"><div><span>EDUCATIONAL ILLUSTRATION</span><h2 id={`${id}-heading`}>{caption}</h2></div><button type="button" onClick={close} aria-label={`Close expanded ${caption}`}>&times;</button></div>
      <div ref={scroll} tabIndex={0} role="region" aria-label={`Enlarged ${caption}, scroll horizontally`} className="strip-scroll"><img src={src} alt={alt} /></div>
      <div className="strip-pan"><button type="button" aria-label="View earlier part of tracing" onClick={() => scroll.current?.scrollBy({ left: -260, behavior: 'instant' })}>&larr;</button><span>Same image, enlarged</span><button type="button" aria-label="View later part of tracing" onClick={() => scroll.current?.scrollBy({ left: 260, behavior: 'instant' })}>&rarr;</button></div>
    </dialog>
  </figure>;
}
