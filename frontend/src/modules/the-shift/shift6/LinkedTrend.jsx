import { useEffect, useId, useRef, useState } from 'react';
import Flowsheet from './Flowsheet.jsx';
import { METRICS, trendPoint, baselineChange } from './trendGeometry.js';
import './linked-trend.css';

export default function LinkedTrend({ children, ...props }) {
  const { columns, selected, selectable, onSelect, disabled } = props;
  const root = useRef(null);
  const plots = useRef(null);
  const [width, setWidth] = useState(640);
  const hint = useId();
  const chosen = columns.find(column => column.time === selected);
  const baseline = columns[0];
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(plots.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const scroll = root.current?.querySelector('.trend-scroll');
    const cell = scroll?.querySelector('thead .is-selected');
    if (!cell) return;
    const bounds = scroll.getBoundingClientRect(), target = cell.getBoundingClientRect();
    // Keep the chosen column visible without scrolling the page or moving keyboard focus.
    if (target.right > bounds.right) scroll.scrollLeft += target.right - bounds.right;
    if (target.left < bounds.left + 70) scroll.scrollLeft -= bounds.left + 70 - target.left;
  }, [selected]);
  const pickOnPlot = event => {
    if (disabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * width;
    const nearest = columns.reduce((best, column) => Math.abs(trendPoint(column, METRICS[0], width).x - x) < Math.abs(trendPoint(best, METRICS[0], width).x - x) ? column : best);
    if (selectable.includes(nearest.time)) onSelect(nearest.time);
  };
  return <section className="s6-linked" ref={root} aria-label="Linked trends and admission baseline">
    <p id={hint} className="s6-linked-hint">Choose a time below or tap a plotted observation. Your selection links all three trends and the full flowsheet. Confirm when ready.</p>
    <div className="s6-linked-times" role="group" aria-label="Observation times" aria-describedby={hint}>
      {columns.map(column => <div key={column.time}>
        {selectable.includes(column.time) ? <button type="button" aria-label={`Select ${column.label} on trends`} aria-pressed={selected === column.time} disabled={disabled} onClick={() => onSelect(column.time)}><span>Today</span><strong>{column.time.slice(0, 2)}:{column.time.slice(2)}</strong></button>
          : <div className="s6-linked-baseline"><span>Yesterday</span><strong>20:00</strong><small>Admission</small></div>}
      </div>)}
    </div>
    <div className="s6-linked-legend"><span><i />Admission baseline</span><span><i />Selected time</span></div>
    <div ref={plots} className="s6-linked-plots">
      {METRICS.map(metric => {
        const base = trendPoint(baseline, metric, width);
        return <div className="s6-linked-metric" key={metric.key} data-metric={metric.key}>
          <h3>{metric.label} <small>{metric.unit}</small></h3>
          <dl><div><dt>Admission</dt><dd>{baseline[metric.key]}</dd></div><div><dt>{chosen ? chosen.label : 'Chosen time'}</dt><dd>{chosen ? chosen[metric.key] : 'Not selected'}</dd></div><div><dt>Change</dt><dd>{baselineChange(chosen, baseline, metric.key) ?? 'Not selected'}</dd></div></dl>
          <svg viewBox={`0 0 ${width} 64`} role="img" aria-label={`${metric.label} over recorded time. Values and selection controls are available in the flowsheet.`} onClick={pickOnPlot}>
            {[metric.min, metric.max].map(value => <g key={value}><text x="0" y={value === metric.max ? 12 : 55}>{value}</text><line className="s6-linked-grid" x1="34" x2={width - 14} y1={value === metric.max ? 8 : 52} y2={value === metric.max ? 8 : 52} /></g>)}
            <line className="s6-linked-base-line" x1="34" x2={width - 14} y1={base.y} y2={base.y} />
            <polyline className="s6-linked-line" points={columns.map(column => { const p = trendPoint(column, metric, width); return `${p.x},${p.y}`; }).join(' ')} />
            {chosen && <line className="s6-linked-selection" x1={trendPoint(chosen, metric, width).x} x2={trendPoint(chosen, metric, width).x} y1="0" y2="62" />}
            {columns.map(column => { const p = trendPoint(column, metric, width); return <g key={column.time} data-time={column.time} data-elapsed-x={p.x} aria-hidden="true"><circle className={`s6-linked-dot${selected === column.time ? ' is-selected' : ''}`} cx={p.x} cy={p.y} r={selected === column.time ? 5 : 3.5} /><circle className="s6-linked-hit" cx={p.x} cy={p.y} r="14" /></g>; })}
          </svg>
        </div>;
      })}
      <svg className="s6-linked-axis" viewBox={`0 0 ${width} 39`} aria-hidden="true">
        {columns.map((column, index) => <text key={column.time} x={trendPoint(column, METRICS[0], width).x} y={index % 2 ? 12 : 29} textAnchor={index === 0 ? 'start' : index === 4 ? 'end' : 'middle'}>{index === 0 ? 'Yesterday 20:00' : `${column.time.slice(0, 2)}:${column.time.slice(2)}`}</text>)}
      </svg>
    </div>
    <p className="s6-linked-note">Time spacing follows elapsed time. Lines connect recorded observations, not measurements between checks. Change is relative to admission, not a clinical interpretation.</p>
    {children}
    <Flowsheet {...props} />
  </section>;
}
