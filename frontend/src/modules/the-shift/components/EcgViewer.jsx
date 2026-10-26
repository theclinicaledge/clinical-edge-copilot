import { useEffect, useId, useRef, useState } from 'react';
import './ecg-viewer.css';

// A 12-lead viewer that works on a phone. One recording, several views (the full 12-lead and focused
// views of the same signals), each zoomable with horizontal panning only, so related leads can be
// compared without scrolling two ways. Zooming scales the whole image, so calibration and the square
// paper grid are preserved. Views are named by lead system, never by finding.
const ZOOMS = [1, 1.5, 2, 3];
const label = zoom => zoom === 1 ? 'Fit' : `${zoom * 100}%`;

function Viewer({ views, view, setView, zoom, setZoom, idBase, large = false }) {
  const scroll = useRef(null);
  const current = views.find(v => v.id === view) || views[0];
  const tabs = useRef([]);
  useEffect(() => { scroll.current?.scrollTo({ left: 0 }); }, [view]);
  function onKey(event, index) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + views.length) % views.length;
    setView(views[next].id);
    tabs.current[next]?.focus();
  }
  const at = ZOOMS.indexOf(zoom);
  return <>
    <div className="ecg-viewer-bar">
      {views.length > 1 && <div className="ecg-viewer-tabs" role="tablist" aria-label="ECG view">{views.map((v, index) =>
        <button key={v.id} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`${idBase}-tab-${v.id}`} aria-selected={v.id === current.id}
          aria-controls={`${idBase}-panel`} tabIndex={v.id === current.id ? 0 : -1} onClick={() => setView(v.id)} onKeyDown={event => onKey(event, index)}>{v.label}</button>)}</div>}
      <div className="ecg-viewer-zoom" role="group" aria-label="Zoom">
        <button type="button" onClick={() => setZoom(ZOOMS[Math.max(0, at - 1)])} disabled={at <= 0} aria-label="Zoom out">&minus;</button>
        <span aria-live="polite">{label(zoom)}</span>
        <button type="button" onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, at + 1)])} disabled={at >= ZOOMS.length - 1} aria-label="Zoom in">+</button>
      </div>
    </div>
    <div id={`${idBase}-panel`} role={views.length > 1 ? 'tabpanel' : undefined} aria-labelledby={views.length > 1 ? `${idBase}-tab-${current.id}` : undefined}>
      <div ref={scroll} className={`ecg-viewer-scroll ${large ? 'is-large' : ''} ${zoom > 1 ? 'is-zoomed' : ''}`} tabIndex={0} role="region"
        aria-label={zoom > 1 ? `${current.caption}, zoomed to ${label(zoom)}. Scroll sideways to see the rest.` : current.caption}>
        <img src={current.src} alt={current.alt} width={current.width} height={current.height} style={{ width: `${zoom * 100}%` }} draggable={false} />
      </div>
    </div>
  </>;
}

export default function EcgViewer({ views, caption, hint }) {
  const idBase = useId().replace(/:/g, '');
  const [view, setView] = useState(views[0].id);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const opener = useRef(null);
  // The full-screen copy only exists while open, so the page never carries a hidden duplicate image.
  useEffect(() => { if (open && !dialog.current?.open) dialog.current?.showModal(); }, [open]);
  const close = () => { dialog.current?.close(); setOpen(false); opener.current?.focus({ preventScroll: true }); };
  const shared = { views, view, setView, zoom, setZoom };
  return <figure className="ecg-viewer">
    <Viewer {...shared} idBase={`${idBase}-inline`} />
    <figcaption>
      <span>{caption}<small>25 mm/s, 10 mm/mV. Zoom keeps the paper scale.</small></span>
      <button ref={opener} type="button" className="ecg-viewer-expand" onClick={() => setOpen(true)} aria-label={`Open ${caption} full screen`}><span aria-hidden="true">&#x2922;</span>Full screen</button>
    </figcaption>
    {hint && <p className="ecg-viewer-hint">{hint}</p>}
    <dialog ref={dialog} className="ecg-viewer-dialog" aria-labelledby={`${idBase}-dialog-title`} onCancel={event => { event.preventDefault(); close(); }}>
      <div className="ecg-viewer-dialog-heading"><div><span>EDUCATIONAL ILLUSTRATION</span><h2 id={`${idBase}-dialog-title`}>{caption}</h2></div>
        <button type="button" onClick={close} aria-label={`Close full screen ${caption}`}>&times;</button></div>
      {open && <Viewer {...shared} idBase={`${idBase}-dialog`} large />}
    </dialog>
  </figure>;
}

// Two strips in one scroller: they zoom and pan together, so the same part of each beat lines up.
// Opens at 200% on phones, where a 6-second strip at full width is too small to compare ST segments.
const phone = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 600px)').matches;
export function CompareStrips({ strips, label: groupLabel }) {
  const [zoom, setZoom] = useState(() => phone() ? 2 : 1);
  const at = ZOOMS.indexOf(zoom);
  return <figure className="ecg-compare" aria-label={groupLabel}>
    <div className="ecg-viewer-bar">
      <span className="ecg-compare-title">{groupLabel}</span>
      <div className="ecg-viewer-zoom" role="group" aria-label="Zoom both strips">
        <button type="button" onClick={() => setZoom(ZOOMS[Math.max(0, at - 1)])} disabled={at <= 0} aria-label="Zoom out both strips">&minus;</button>
        <span aria-live="polite">{label(zoom)}</span>
        <button type="button" onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, at + 1)])} disabled={at >= ZOOMS.length - 1} aria-label="Zoom in both strips">+</button>
      </div>
    </div>
    <div className={`ecg-viewer-scroll ecg-compare-scroll ${zoom > 1 ? 'is-zoomed' : ''}`} tabIndex={0} role="region"
      aria-label={zoom > 1 ? `Both strips, zoomed to ${label(zoom)}. Scroll sideways; the strips move together.` : 'Both strips'}>
      {strips.map(strip => <div key={strip.src} className="ecg-compare-row" style={{ width: `${zoom * 100}%` }}>
        <span className="ecg-compare-label"><time>{strip.time}</time> {strip.tag}</span>
        <img src={strip.src} alt={strip.alt} width={strip.width} height={strip.height} draggable={false} />
      </div>)}
    </div>
    <figcaption><span>25 mm/s, 10 mm/mV. Both strips use the same scale and zoom together.</span></figcaption>
  </figure>;
}
