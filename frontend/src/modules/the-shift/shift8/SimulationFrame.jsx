import { useState } from 'react';

export function SimulationState({ label, children, className = '' }) {
  return <section className={`s8-state-panel ${className}`} aria-label={label}><div className="s8-state-label">{label}</div>{children}</section>;
}

// A presentation shell: callers supply all scenario content and state summaries.
export default function SimulationFrame({ patient, time, timeLabel, status, reference, views = [], defaultView, contextKey, children }) {
  const [selection, setSelection] = useState({ key: contextKey, view: defaultView });
  const selected = selection.key === contextKey ? selection.view : defaultView;
  const active = views.find(view => view.id === selected) || views[0];
  return <div className="s8-simulation" data-view={active?.id || 'review'}>
    <header className="s8-sim-orientation"><div><span>{patient.location}</span><strong>{patient.name} <small>{patient.detail}</small></strong></div><div><b>{time}</b><span>{timeLabel}</span></div></header>
    {views.length > 1 && <nav className="s8-view-switch" aria-label="Simulation views">{views.map(view => <button key={view.id} type="button" aria-pressed={active.id === view.id} aria-controls="s8-view-content" onClick={() => setSelection({ key: contextKey, view: view.id })}>{view.label}</button>)}</nav>}
    {status}
    {active?.id !== 'chart' && reference}
    <div className="s8-sim-stage">
      {active && <section id="s8-view-content" aria-label={`${active.label} view`} className="s8-view-content">{views.map(view => <div key={view.id} hidden={view.id !== active.id}>{view.content}</div>)}</section>}
      <div className="s8-current-task">{children}</div>
    </div>
  </div>;
}
