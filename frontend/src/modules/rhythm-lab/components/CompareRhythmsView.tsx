import { useState } from 'react';
import { trackEvent } from '../../../analytics';
import { CONFUSABLE_PAIRS } from '../data/compareRhythms';
import type { ConfusablePair } from '../data/compareRhythms';

interface CompareRhythmsViewProps {
  onBack: () => void;
}

/** Returns text up to (and including) the first period-terminated sentence. */
function firstSentence(text: string): string {
  const idx = text.indexOf('. ');
  return idx !== -1 ? text.slice(0, idx + 1) : text;
}

function QuickMatrix({ pair }: { pair: ConfusablePair }) {
  const rows = [
    { label: 'Pattern',       a: pair.a.regularity,                    b: pair.b.regularity },
    { label: 'P waves',       a: firstSentence(pair.a.pWaveStory),     b: firstSentence(pair.b.pWaveStory) },
    { label: 'QRS',           a: pair.a.qrsWidth,                      b: pair.b.qrsWidth },
    { label: 'Key tell',      a: pair.keyDistinction.a,                b: pair.keyDistinction.b },
  ];

  return (
    <div className="crv-matrix">
      <p className="crv-matrix__heading">Quick difference</p>

      {/* ≥500px — 3-col side-by-side grid */}
      <div className="crv-matrix__grid">
        <div className="crv-matrix__header-row">
          <div className="crv-matrix__corner" />
          <div className="crv-matrix__col-head crv-matrix__col-head--a">{pair.a.short}</div>
          <div className="crv-matrix__col-head crv-matrix__col-head--b">{pair.b.short}</div>
        </div>
        {rows.map(({ label, a, b }) => (
          <div key={label} className="crv-matrix__row">
            <div className="crv-matrix__row-label">{label}</div>
            <div className="crv-matrix__cell crv-matrix__cell--a">{a}</div>
            <div className="crv-matrix__cell crv-matrix__cell--b">{b}</div>
          </div>
        ))}
      </div>

      {/* <500px — feature-row stacking (label / A: value / B: value) */}
      <div className="crv-matrix__stack">
        {rows.map(({ label, a, b }) => (
          <div key={label} className="crv-matrix__stack-row">
            <span className="crv-matrix__stack-label">{label}</span>
            <div className="crv-matrix__stack-vals">
              <div className="crv-matrix__stack-val crv-matrix__stack-val--a">
                <span className="crv-matrix__stack-side-tag">A</span>
                <span className="crv-matrix__stack-val-text">{a}</span>
              </div>
              <div className="crv-matrix__stack-val crv-matrix__stack-val--b">
                <span className="crv-matrix__stack-side-tag">B</span>
                <span className="crv-matrix__stack-val-text">{b}</span>
              </div>
            </div>
          </div>
        ))}
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
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const pair = CONFUSABLE_PAIRS.find(p => p.id === activeId)!;

  // Reset breakdown collapse when pair changes; track selection (not initial mount)
  function handlePairChange(id: string) {
    trackEvent('rhythm_confusable_pair_selected', { pair_id: id });
    setActiveId(id);
    setBreakdownOpen(false);
  }

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
              onClick={() => handlePairChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1 — Quick difference matrix */}
      <QuickMatrix pair={pair} />

      {/* 2 — Pearl + mistake */}
      <div className="crv-callouts">
        <div className="crv-pearl">
          <span className="crv-pearl__label">Recognition Pearl</span>
          <p className="crv-pearl__text">{pair.recognitionPearl}</p>
        </div>
        <div className="crv-mistake">
          <span className="crv-mistake__label">Most common mistake</span>
          <p className="crv-mistake__text">{pair.commonMistake}</p>
        </div>
      </div>

      {/* 3 — Full breakdown toggle + A/B cards */}
      <div className="crv-breakdown-section">
        <button
          className="crv-breakdown-toggle"
          onClick={() => {
            if (!breakdownOpen) trackEvent('rhythm_confusable_breakdown_opened', { pair_id: activeId });
            setBreakdownOpen(v => !v);
          }}
          aria-expanded={breakdownOpen}
        >
          <span className="crv-breakdown-toggle__label">
            {breakdownOpen ? 'Hide complete comparison' : 'See complete comparison'}
          </span>
          <span className="crv-breakdown-toggle__chevron" aria-hidden="true">›</span>
        </button>

        {breakdownOpen && (
          <div className="crv-cards">
            <SideCard side={pair.a} letter="A" />
            <div className="crv-divider" aria-hidden="true">
              <span className="crv-divider__vs">vs</span>
            </div>
            <SideCard side={pair.b} letter="B" />
          </div>
        )}
      </div>

    </div>
  );
}
