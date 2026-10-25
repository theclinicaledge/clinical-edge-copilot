import './therapeutic-response.css';

// Therapeutic response: pick what to say first. Each option carries a catalog tier (best,
// acceptable, harmful) and its result label. Tiers stay hidden until the response is confirmed,
// then every option shows its tier so the learner can compare the responses.
const TIERS = { best: 'Best', acceptable: 'Acceptable', harmful: 'Harmful' };

export default function TherapeuticResponse({ items, answer, selected, onChoose, label }) {
  const current = answer ?? selected;
  return <div className="shift-choices therapeutic-response" role="group" aria-label={label}>{items.map(item =>
    <button key={item.id} type="button" aria-pressed={current === item.id} className={`shift-choice ${current === item.id ? 'is-selected' : ''}`} disabled={answer !== undefined} onClick={() => onChoose(item.id)}>
      <span>{item.text}{answer !== undefined && <span className={`therapeutic-tier is-${item.tier}`}>{TIERS[item.tier]} / {item.result}</span>}</span>
      <span className="shift-choice-end" aria-hidden="true">{current === item.id ? '✓' : '→'}</span>
    </button>
  )}</div>;
}
