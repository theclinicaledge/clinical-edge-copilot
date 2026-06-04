import { useState } from 'react';
import { CONFUSABLE_PAIRS } from '../data/compareRhythms';
import type { ConfusablePair } from '../data/compareRhythms';

interface CompareRhythmsViewProps {
  onBack: () => void;
}

function SideCard({ side, letter }: { side: ConfusablePair['a']; letter: 'A' | 'B' }) {
  return (
    <div className={`crv-side crv-side--${letter.toLowerCase()}`}>
      <div className="crv-side__header">
        <span className="crv-side__letter">{letter}</span>
        <div className="crv-side__titles">
          <span className="crv-side__short">{side.short}</span>
          <span className="crv-side__name">{side.name}</span>
        </div>
      </div>

      <div className="crv-rows">
        <div className="crv-row">
          <span className="crv-row__label">Visual clue</span>
          <p className="crv-row__value">{side.visualClue}</p>
        </div>
        <div className="crv-row">
          <span className="crv-row__label">Regularity</span>
          <p className="crv-row__value">{side.regularity}</p>
        </div>
        <div className="crv-row">
          <span className="crv-row__label">P waves</span>
          <p className="crv-row__value">{side.pWaveStory}</p>
        </div>
        <div className="crv-row">
          <span className="crv-row__label">QRS width</span>
          <p className="crv-row__value">{side.qrsWidth}</p>
        </div>
      </div>
    </div>
  );
}

export function CompareRhythmsView({ onBack }: CompareRhythmsViewProps) {
  const [activeId, setActiveId] = useState(CONFUSABLE_PAIRS[0].id);
  const pair = CONFUSABLE_PAIRS.find(p => p.id === activeId)!;

  return (
    <div className="crv-page">

      {/* Nav */}
      <div className="practice-nav">
        <button className="detail-back" onClick={onBack}>← All Rhythms</button>
        <div className="practice-nav__right">
          <span className="compare-nav__badge">Confusables</span>
        </div>
      </div>

      {/* Pair selector */}
      <div className="crv-selector-wrap">
        <p className="crv-selector-eyebrow">Commonly confused pairs</p>
        <div className="crv-selector-list">
          {CONFUSABLE_PAIRS.map(p => (
            <button
              key={p.id}
              className={`crv-selector-btn${p.id === activeId ? ' crv-selector-btn--active' : ''}`}
              onClick={() => setActiveId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison cards */}
      <div className="crv-cards">
        <SideCard side={pair.a} letter="A" />
        <div className="crv-divider" aria-hidden="true">
          <span className="crv-divider__vs">vs</span>
        </div>
        <SideCard side={pair.b} letter="B" />
      </div>

      {/* Pearl + mistake */}
      <div className="crv-bottom">
        <div className="crv-pearl">
          <span className="crv-pearl__label">Recognition Pearl</span>
          <p className="crv-pearl__text">{pair.recognitionPearl}</p>
        </div>
        <div className="crv-mistake">
          <span className="crv-mistake__label">Most common mistake</span>
          <p className="crv-mistake__text">{pair.commonMistake}</p>
        </div>
      </div>

    </div>
  );
}
