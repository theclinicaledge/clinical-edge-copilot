import { useState, useCallback } from 'react';
import { trackEvent } from '../../../analytics';
import { RHYTHMS } from '../data/rhythms';
import { RhythmStrip } from './RhythmStrip';
import { getPearlForRhythm } from '../data/phase1';

interface TwoQuestionSprintProps {
  onBack: () => void;
}

type RateAnswer = 'slow' | 'normal' | 'fast';
type RegAnswer  = 'regular' | 'irregular';

const SPRINT_LENGTH = 5;

function getRhythmRateCategory(rate: string): RateAnswer {
  const r = rate.toLowerCase();
  if (r.includes('> 100') || r.includes('>100') || r.includes('150') || r.includes('200') || r.includes('tachycardia') || r.includes('fast')) return 'fast';
  if (r.includes('< 60') || r.includes('<60') || r.includes('40') || r.includes('bradycardia') || r.includes('slow')) return 'slow';
  return 'normal';
}

function getRhythmRegCategory(regularity: string): RegAnswer {
  const r = regularity.toLowerCase();
  if (r.includes('irregular')) return 'irregular';
  return 'regular';
}

function buildDeck(): typeof RHYTHMS {
  const shuffled = [...RHYTHMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SPRINT_LENGTH);
}

export function TwoQuestionSprint({ onBack }: TwoQuestionSprintProps) {
  const [deck,     setDeck]     = useState(() => buildDeck());
  const [cardIdx,  setCardIdx]  = useState(0);
  const [rateAns,  setRateAns]  = useState<RateAnswer | null>(null);
  const [regAns,   setRegAns]   = useState<RegAnswer  | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done,     setDone]     = useState(false);

  const rhythm = deck[cardIdx];
  const pearl  = getPearlForRhythm(rhythm.id);
  const correctRate = getRhythmRateCategory(rhythm.rate);
  const correctReg  = getRhythmRegCategory(rhythm.regularity);
  const bothAnswered = rateAns !== null && regAns !== null;

  const handleReveal = useCallback(() => {
    trackEvent('rhythm_sprint_reveal', {
      rhythm_id:        rhythm.id,
      selected_rate:    rateAns ?? 'none',
      selected_regular: regAns === 'regular',
    });
    setRevealed(true);
  }, [rhythm.id, rateAns, regAns]);

  function next() {
    if (cardIdx + 1 >= SPRINT_LENGTH) {
      setDone(true);
    } else {
      setCardIdx(i => i + 1);
      setRateAns(null);
      setRegAns(null);
      setRevealed(false);
    }
  }

  function restart() {
    setDeck(buildDeck());
    setCardIdx(0);
    setRateAns(null);
    setRegAns(null);
    setRevealed(false);
    setDone(false);
  }

  if (done) {
    return (
      <div className="sprint-page">
        <div className="practice-nav">
          <button className="detail-back" onClick={onBack}>← All Rhythms</button>
          <div className="practice-nav__right">
            <span className="compare-nav__badge">Sprint</span>
          </div>
        </div>
        <div className="sprint-done">
          <p className="sprint-done__eyebrow">Sprint complete</p>
          <p className="sprint-done__title">{SPRINT_LENGTH} strips reviewed</p>
          <p className="sprint-done__sub">Rate and regularity are the first two questions on every strip you see.</p>
          <div className="sprint-done__actions">
            <button className="practice-reveal-btn" onClick={restart}>Run another sprint</button>
            <button className="detail-back" onClick={onBack}>← Back to rhythms</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sprint-page">

      {/* Nav */}
      <div className="practice-nav">
        <button className="detail-back" onClick={onBack}>← All Rhythms</button>
        <div className="practice-nav__right">
          <span className="compare-nav__badge">Sprint</span>
          <span className="practice-nav__counter">{cardIdx + 1} / {SPRINT_LENGTH}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sprint-progress-bar" aria-label={`Strip ${cardIdx + 1} of ${SPRINT_LENGTH}`}>
        {Array.from({ length: SPRINT_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`sprint-progress-pip${i < cardIdx ? ' sprint-progress-pip--done' : i === cardIdx ? ' sprint-progress-pip--active' : ''}`}
          />
        ))}
      </div>

      {/* Strip */}
      <div className="detail-strip-area sprint-strip-area">
        <RhythmStrip key={`${cardIdx}-${rhythm.id}`} rhythmId={rhythm.id} />
        <div className="detail-strip-meta">
          <span className="detail-strip-label">
            {revealed ? `${rhythm.shortName} — ${rhythm.name}` : '? — Identify the rhythm'}
          </span>
          <span className="detail-strip-annotation">Lead II simulation · 25 mm/s</span>
        </div>
      </div>

      {/* Panel */}
      <div className="sprint-panel">
        {!revealed ? (
          <div key={`q-${cardIdx}`} className="sprint-questions ce-section-enter">

            <div className="sprint-q-block">
              <p className="sprint-q-label">Rate?</p>
              <div className="sprint-options">
                {(['slow', 'normal', 'fast'] as RateAnswer[]).map(opt => (
                  <button
                    key={opt}
                    className={`sprint-option${rateAns === opt ? ' sprint-option--selected' : ''}`}
                    onClick={() => setRateAns(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sprint-q-block">
              <p className="sprint-q-label">Regular or irregular?</p>
              <div className="sprint-options">
                {(['regular', 'irregular'] as RegAnswer[]).map(opt => (
                  <button
                    key={opt}
                    className={`sprint-option${regAns === opt ? ' sprint-option--selected' : ''}`}
                    onClick={() => setRegAns(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {bothAnswered && (
              <button className="sprint-reveal-btn" onClick={handleReveal}>
                Reveal →
              </button>
            )}
          </div>
        ) : (
          <div key={`r-${cardIdx}`} className="sprint-reveal ce-section-enter">
            <div className="sprint-reveal__header">
              <div className="sprint-reveal__identity">
                <span className="practice-answer__abbrev">{rhythm.shortName}</span>
                <span className="practice-answer__name">{rhythm.name}</span>
              </div>
              <div className="sprint-reveal__checks">
                <span className={`sprint-check ce-fade-in${rateAns === correctRate ? ' sprint-check--correct' : ' sprint-check--wrong'}`}>
                  {rateAns === correctRate ? '✓' : '✗'} Rate: {correctRate}
                </span>
                <span className={`sprint-check ce-fade-in${regAns === correctReg ? ' sprint-check--correct' : ' sprint-check--wrong'}`}>
                  {regAns === correctReg ? '✓' : '✗'} {correctReg.charAt(0).toUpperCase() + correctReg.slice(1)}
                </span>
              </div>
            </div>

            <div className="sprint-reveal__data">
              <div className="sprint-data-row">
                <span className="sprint-data-label">Rate</span>
                <span className="sprint-data-value">{rhythm.rate}</span>
              </div>
              <div className="sprint-data-row">
                <span className="sprint-data-label">Regularity</span>
                <span className="sprint-data-value">{rhythm.regularity}</span>
              </div>
            </div>

            <div className="sprint-pearl">
              <span className="sprint-pearl__label">Pearl</span>
              <p className="sprint-pearl__text">{pearl.text}</p>
            </div>

            <button className="sprint-next-btn" onClick={next}>
              {cardIdx + 1 < SPRINT_LENGTH ? 'Next strip →' : 'Finish sprint →'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
