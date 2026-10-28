import { useEffect, useReducer } from 'react';
import { SHIFTS, progressLabel } from '../modules/the-shift/integrated/registry.js';
import { shiftPath } from '../modules/the-shift/routing.js';
import { resumableExperiences } from './continueLearning.js';

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
  const unfinished = resumableExperiences(SHIFTS, progressLabel);
  return <ContinueLearningList unfinished={unfinished} onNavigate={onNavigate} />;
}

export function ContinueLearningList({ unfinished, onNavigate }) {
  if (!unfinished.length) return null;
  const navigate = event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(event.currentTarget.getAttribute('href'));
  };
  const resume = ({ item, label }) => <li key={item.id}>
      <a href={shiftPath(item.id)} onClick={navigate} aria-label={`Continue ${item.title}: ${label.slice(10)}`}>
        <span className="ce-home-resume-learning__number" aria-hidden="true">{item.number}</span>
        <span className="ce-home-resume-learning__copy"><strong>{item.title}</strong><small>{label.slice(10)}</small></span>
        <span className="ce-home-resume-learning__action" aria-hidden="true">Resume <span>&#8594;</span></span>
      </a>
    </li>;

  return <section className="ce-home-resume-learning" aria-labelledby="continue-learning-title">
    <header><h2 id="continue-learning-title">Continue learning</h2><span>Saved on this device</span></header>
    <ul className="ce-home-resume-learning__featured">{resume(unfinished[0])}</ul>
    <a className="ce-home-resume-learning__view-all" href="/learn/shifts?saved=1" onClick={navigate}>View all <span>({unfinished.length} unfinished)</span><span aria-hidden="true">&#8594;</span></a>
  </section>;
}
