import { useEffect, useReducer } from 'react';
import { SHIFTS, progressLabel } from '../modules/the-shift/integrated/registry.js';
import { shiftPath } from '../modules/the-shift/routing.js';

export default function ContinueLearning({ onNavigate }) {
  const [, refresh] = useReducer(value => value + 1, 0);
  useEffect(() => {
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const unfinished = SHIFTS.map(item => ({ item, label: progressLabel(item) }))
    .filter(({ label }) => label.startsWith('Continue: '));
  if (!unfinished.length) return null;

  return <section className="ce-home-resume-learning" aria-labelledby="continue-learning-title">
    <header><h2 id="continue-learning-title">Continue learning</h2><span>Saved on this device</span></header>
    <ul>{unfinished.map(({ item, label }) => <li key={item.id}>
      <a href={shiftPath(item.id)} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onNavigate(shiftPath(item.id));
      }} aria-label={`Continue ${item.title}: ${label.slice(10)}`}>
        <span className="ce-home-resume-learning__number" aria-hidden="true">{item.number}</span>
        <span className="ce-home-resume-learning__copy"><strong>{item.title}</strong><small>{label.slice(10)}</small></span>
        <span className="ce-home-resume-learning__action" aria-hidden="true">Resume <span>&#8594;</span></span>
      </a>
    </li>)}</ul>
  </section>;
}
