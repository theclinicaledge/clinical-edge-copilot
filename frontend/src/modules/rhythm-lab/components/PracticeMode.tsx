import { useState, useEffect, useRef } from 'react';
import { RHYTHMS, PRACTICE_CATEGORIES, URGENCY_COLORS } from '../data/rhythms';
import { RhythmStrip } from './RhythmStrip';
import {
  recordPracticeDay,
  addRecentRhythm,
  saveLastPracticeCat,
  getLastPracticeCat,
} from '../utils/localProgress';
import { getPearlForRhythm } from '../data/phase1';

interface PracticeModeProps {
  onBack: () => void;
}

const FRAMEWORK = [
  { label: 'Rate',        hint: 'What is the ventricular rate?' },
  { label: 'Regularity',  hint: 'Regular, irregular, or grouped?' },
  { label: 'P waves',     hint: 'Present? Morphology? One before each QRS?' },
  { label: 'PR interval', hint: 'Fixed, changing, or absent?' },
  { label: 'QRS width',   hint: 'Narrow (< 0.12 s) or wide (≥ 0.12 s)?' },
];

export function PracticeMode({ onBack }: PracticeModeProps) {
  const [catKey,     setCatKey]     = useState(() => getLastPracticeCat() ?? 'all');
  const [catIdx,     setCatIdx]     = useState(() => Math.floor(Math.random() * RHYTHMS.length));
  const [revealed,   setRevealed]   = useState(false);
  const [cluesShown, setCluesShown] = useState(0); // 0 = none, 1 = first, 2 = both

  // Derive filtered rhythm list for the active category
  const category   = PRACTICE_CATEGORIES.find(c => c.key === catKey)!;
  const catRhythms = category.ids
    .map(id => RHYTHMS.find(r => r.id === id))
    .filter((r): r is NonNullable<typeof r> => r != null);

  const safeIdx    = catIdx % catRhythms.length;
  const rhythm     = catRhythms[safeIdx];
  const urgencyColor = URGENCY_COLORS[rhythm.urgency];

  // Record today as a practice day on first mount
  const didRecordDay = useRef(false);
  useEffect(() => {
    if (!didRecordDay.current) {
      didRecordDay.current = true;
      recordPracticeDay();
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [catIdx, catKey]);

  function handleCategoryChange(newKey: string) {
    setCatKey(newKey);
    saveLastPracticeCat(newKey);
    setCatIdx(0);
    setRevealed(false);
    setCluesShown(0);
  }

  function next() {
    setCatIdx(i => (i + 1) % catRhythms.length);
    setRevealed(false);
    setCluesShown(0);
  }

  return (
    <div className="practice-page">

      {/* Nav */}
      <div className="practice-nav">
        <button className="detail-back" onClick={onBack}>← All Rhythms</button>
        <div className="practice-nav__right">
          <span className="compare-nav__badge">Practice Mode</span>
          <span className="practice-nav__counter">{safeIdx + 1} / {catRhythms.length}</span>
        </div>
      </div>

      {/* Category selector */}
      <div className="practice-cat-bar">
        <span className="practice-cat-label">Category</span>
        <select
          className="practice-cat-select"
          value={catKey}
          onChange={e => handleCategoryChange(e.target.value)}
          aria-label="Practice category"
        >
          {PRACTICE_CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>
              {c.label} — {c.ids.length}
            </option>
          ))}
        </select>
      </div>

      {/* Strip — key remounts on each new rhythm, replaying the reveal animation */}
      <div className="detail-strip-area">
        <RhythmStrip key={`${catKey}-${safeIdx}`} rhythmId={rhythm.id} />
        <div className="detail-strip-meta">
          <span className="detail-strip-label">
            {revealed ? `${rhythm.shortName} — Recognition strip` : '? — Identity hidden'}
          </span>
          <span className="detail-strip-annotation">Lead II simulation · 25 mm/s</span>
        </div>
      </div>

      {/* Teaching panel */}
      <div className="practice-panel">
        {!revealed ? (

          /* ── Pre-reveal ────────────────────────────────────── */
          <div className="practice-identify">
            <div className="practice-identify__top">
              <p className="practice-eyebrow">Practice Strip</p>
              <p className="practice-identify__prompt">Identify the rhythm</p>
              <p className="practice-identify__hint">
                Assess rate, regularity, P waves, and QRS width before revealing.
              </p>
            </div>

            {/* Progressive clues */}
            {cluesShown > 0 && (
              <div className="practice-clues">
                <div className="practice-clue-block">
                  <span className="practice-clue-tag">Clue 1</span>
                  <p className="practice-clue-text">{rhythm.recognitionCues[0]}</p>
                </div>
                {cluesShown >= 2 && (
                  <div className="practice-clue-block">
                    <span className="practice-clue-tag">Clue 2</span>
                    <p className="practice-clue-text">{rhythm.recognitionCues[1]}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action button — advances through clue states then reveals */}
            <div className="practice-identify__action">
              {cluesShown === 0 && (
                <button className="practice-clue-btn practice-clue-btn--primary" onClick={() => setCluesShown(1)}>
                  Show first clue
                </button>
              )}
              {cluesShown === 1 && (
                <button className="practice-clue-btn" onClick={() => setCluesShown(2)}>
                  Show another clue
                </button>
              )}
              {cluesShown >= 2 && (
                <button className="practice-reveal-btn" onClick={() => { addRecentRhythm(rhythm.id); setRevealed(true); }}>
                  Reveal rhythm
                </button>
              )}
            </div>

            <div className="practice-framework">
              <p className="practice-framework__heading">Systematic approach</p>
              {FRAMEWORK.map(({ label, hint }) => (
                <div key={label} className="practice-framework__row">
                  <span className="practice-framework__label">{label}</span>
                  <span className="practice-framework__hint">{hint}</span>
                </div>
              ))}
            </div>
          </div>

        ) : (

          /* ── Post-reveal ────────────────────────────────────── */
          <div className="practice-answer">
            <div className="practice-answer__header">
              <span className="practice-answer__abbrev">{rhythm.shortName}</span>
              <span className="practice-answer__name">{rhythm.name}</span>
              <span className="practice-answer__urgency" style={{ color: urgencyColor }}>
                {rhythm.urgencyLabel}
              </span>
            </div>

            <div className="practice-answer__body">
              <div className="practice-clinical-data">
                {[
                  { label: 'Rate',       value: rhythm.rate },
                  { label: 'Regularity', value: rhythm.regularity },
                  { label: 'P wave',     value: rhythm.pWave },
                  { label: 'QRS',        value: rhythm.qrs },
                ].map(({ label, value }) => (
                  <div key={label} className="practice-data-row">
                    <span className="practice-data-label">{label}</span>
                    <span className="practice-data-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="practice-cues-section">
                <p className="practice-cues-label">Key recognition clues</p>
                <div className="practice-cues">
                  {rhythm.recognitionCues.slice(0, 3).map((cue, i) => (
                    <div key={i} className="practice-cue">
                      <span className="practice-cue__num">{i + 1}</span>
                      <span className="practice-cue__text">{cue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sprint-pearl practice-pearl">
              <span className="sprint-pearl__label">Pearl</span>
              <p className="sprint-pearl__text">{getPearlForRhythm(rhythm.id).text}</p>
            </div>

            <div className="practice-answer__footer">
              <p className="practice-answer__notice">
                {rhythm.nursesNotice.split('.')[0]}.
              </p>
              <button className="practice-next-btn" onClick={next}>
                Next strip →
              </button>
            </div>
          </div>

        )}
      </div>

    </div>
  );
}
