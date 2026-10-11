import { useState } from 'react';
import { PEARLS } from '../data/phase1';

const PREVIEW_COUNT = 5;

export function PearlsSection({ initiallyExpanded = false }: { initiallyExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const visible = expanded ? PEARLS : PEARLS.slice(0, PREVIEW_COUNT);

  return (
    <div className="pearls-section">
      <p className="pearls-section__eyebrow">Recognition Pearls</p>
      <p className="pearls-section__heading">What experienced eyes notice</p>
      <div className="pearls-list">
        {visible.map((pearl, i) => (
          <div key={pearl.id} className="pearl-item">
            <span className="pearl-item__num">{String(i + 1).padStart(2, '0')}</span>
            <span className="pearl-item__text">{pearl.text}</span>
          </div>
        ))}
      </div>
      <button
        className="pearls-expand-btn"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        {expanded
          ? `Show fewer`
          : `View all ${PEARLS.length} pearls ↓`}
      </button>
    </div>
  );
}
