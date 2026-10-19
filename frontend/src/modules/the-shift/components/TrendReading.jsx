import { useId } from 'react';
import './trend-reading.css';

// Trend reading: a flowsheet the learner reads across time. Selectable time columns are
// buttons in the column headers, so keyboard and screen-reader users pick a time the same
// way a tap on any cell in that column does. Without onSelect it renders read-only.
export default function TrendReading({ caption, description, columns, rows, selectable = [], selected = null, onSelect = null, disabled = false, highlight = null }) {
  const descriptionId = useId();
  const interactive = Boolean(onSelect);
  const canPick = id => interactive && !disabled && selectable.includes(id);
  const state = id => [selected === id ? 'is-selected' : '', highlight === id ? 'is-highlighted' : ''].join(' ').trim();
  return <figure className="trend-reading">
    <p id={descriptionId} className="trend-sr-only">{description}</p>
    <div className="trend-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table aria-describedby={descriptionId}>
        <caption className="trend-sr-only">{caption}</caption>
        <thead><tr>
          <th scope="col" className="trend-corner">Time</th>
          {columns.map(column => <th scope="col" key={column.time} className={state(column.time)}>
            {interactive && selectable.includes(column.time)
              ? <button type="button" className="trend-time" aria-pressed={selected === column.time} disabled={disabled} onClick={() => onSelect(column.time)}>{column.label}</button>
              : <span className="trend-time is-static">{column.label}</span>}
          </th>)}
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.key} className={row.emphasis ? 'is-emphasis' : ''}>
          <th scope="row">{row.label}</th>
          {columns.map(column => <td key={column.time} className={`${state(column.time)}${canPick(column.time) ? ' is-pickable' : ''}`.trim()} onClick={canPick(column.time) ? () => onSelect(column.time) : undefined}>{row.value(column)}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </figure>;
}
