import { useState } from 'react';
import { CONFUSABLE_PAIRS } from '../data/compareRhythms';
import type { ConfusablePair, RhythmSide } from '../data/compareRhythms';

interface CompareRhythmsViewProps {
  onBack: () => void;
}

const MATRIX_ROWS: Array<{ label: string; key: keyof RhythmSide }> = [
  { label: 'Visual clue',  key: 'visualClue' },
  { label: 'Regularity',  key: 'regularity' },
  { label: 'P waves',     key: 'pWaveStory' },
  { label: 'QRS width',   key: 'qrsWidth' },
];

const MATRIX_SIDES = [
  { which: 'a' as const },
  { which: 'b' as const },
] as const;

function QuickMatrix({ pair }: { pair: ConfusablePair }) {
  return (
    <div className="crv-matrix">
      <p className="crv-matrix__heading">Quick difference</p>

      {/* ≥500px — 3-column side-by-side grid */}
      <div className="crv-matrix__grid">
        <div className="crv-matrix__header-row">
          <div className="crv-matrix__corner" />
          <div className="crv-matrix__col-head crv-matrix__col-head--a">{pair.a.short}</div>
          <div className="crv-matrix__col-head crv-matrix__col-head--b">{pair.b.short}</div>
        </div>
        {MATRIX_ROWS.map(({ label, key }) => (
          <div key={key} className="crv-matrix__row">
            <div className="crv-matrix__row-label">{label}</div>
            <div className="crv-matrix__cell crv-matrix__cell--a">{pair.a[key]}</div>
            <div className="crv-matrix__cell crv-matrix__cell--b">{pair.b[key]}</div>
          </div>
        ))}
      </div>

      {/* <500px — stacked A then B cards */}
      <div className="crv-matrix__stack">
        {MATRIX_SIDES.map(({ which }) => {
          const side = pair[which];
          return (
            <div key={which} className={`crv-matrix__stack-side crv-matrix__stack-side--${which}`}>
              <p className={`crv-matrix__stack-head crv-matrix__stack-head--${which}`}>{side.short}</p>
              {MATRIX_ROWS.map(({ label, key }) => (
                <div key={key} className="crv-matrix__stack-row">
                  <span className="crv-matrix__stack-label">{label}</span>
                  <span className="crv-matrix__stack-value">{side[key]}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
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

      {/* Quick difference matrix */}
      <QuickMatrix pair={pair} />

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
