import { useState } from 'react';
import { RHYTHMS } from '../data/rhythms';
import { RhythmStrip } from './RhythmStrip';
import { getPearlForRhythm } from '../data/phase1';

interface TwoQuestionSprintProps {
  onBack: () => void;
}

type RateAnswer = 'fast' | 'normal' | 'slow' | null;
type RegAnswer  = 'regular' | 'irregular' | null;

function pickRhythm(excludeId?: string) {
  const pool = excludeId ? RHYTHMS.filter(r => r.id !== excludeId) : RHYTHMS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function TwoQuestionSprint({ onBack }: TwoQuestionSprintProps) {
  const [rhythm,   setRhythm]   = useState(() => pickRhythm());
  const [rateAns,  setRateAns]  = useState<RateAnswer>(null);
  const [regAns,   setRegAns]   = useState<RegAnswer>(null);
  const [revealed, setRevealed] = useState(false);

  const pearl = getPearlForRhythm(rhythm.id);

  function next() {
    setRhythm(r => pickRhythm(r.id));
    setRateAns(null);
    setRegAns(null);
    setRevealed(false);
  }

  const bothAnswered = rateAns !== null && regAns !== null;

  return (
    <div className="sprint-page">
      <div className="practice-nav">
        <button className="detail-back" onClick={onBack}>← All Rhythms</button>
        <div className="practice-nav__right">
          <span className="compare-nav__badge">Two-Question Sprint</span>
        </div>
      </div>

      <div className="detail-strip-area">
        <RhythmStrip key={rhythm.id} rhythmId={rhythm.id} />
        <div className="detail-strip-meta">
          <span className="detail-strip-label">
            {revealed ? `${rhythm.shortName} — ${rhythm.name}` : '? — Identity hidden'}
          </span>
          <span className="detail-strip-annotation">Lead II simulation · 25 mm/s</span>
        </div>
      </div>

      <div className="practice-panel">
        {!revealed ? (
          <div className="sprint-questions">
            <p className="practice-eyebrow">Sprint</p>
            <p className="practice-identify__prompt">Two questions only</p>

            <div className="sprint-q-block">
              <p className="sprint-q-label">Fast, normal, or slow?</p>
              <div className="sprint-options">
                {(['slow', 'normal', 'fast'] as RateAnswer[]).map(opt => (
                  <button
                    key={opt!}
                    className={`sprint-option${rateAns === opt ? ' sprint-option--selected' : ''}`}
                    onClick={() => setRateAns(opt)}
                  >
                    {opt!.charAt(0).toUpperCase() + opt!.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sprint-q-block">
              <p className="sprint-q-label">Regular or irregular?</p>
              <div className="sprint-options">
                {(['regular', 'irregular'] as RegAnswer[]).map(opt => (
                  <button
                    key={opt!}
                    className={`sprint-option${regAns === opt ? ' sprint-option--selected' : ''}`}
                    onClick={() => setRegAns(opt)}
                  >
                    {opt!.charAt(0).toUpperCase() + opt!.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {bothAnswered && (
              <button
                className="practice-reveal-btn"
                style={{ marginTop: 20 }}
                onClick={() => setRevealed(true)}
              >
                Reveal rhythm
              </button>
            )}
          </div>
        ) : (
          <div className="sprint-reveal">
            <div className="practice-answer__header">
              <span className="practice-answer__abbrev">{rhythm.shortName}</span>
              <span className="practice-answer__name">{rhythm.name}</span>
            </div>

            <div className="sprint-data">
              <div className="practice-data-row">
                <span className="practice-data-label">Rate</span>
                <span className="practice-data-value">{rhythm.rate}</span>
              </div>
              <div className="practice-data-row">
                <span className="practice-data-label">Regularity</span>
                <span className="practice-data-value">{rhythm.regularity}</span>
              </div>
            </div>

            <div className="sprint-pearl">
              <span className="sprint-pearl__label">Pearl</span>
              <p className="sprint-pearl__text">{pearl.text}</p>
            </div>

            <button className="practice-next-btn" onClick={next}>
              Next strip →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
