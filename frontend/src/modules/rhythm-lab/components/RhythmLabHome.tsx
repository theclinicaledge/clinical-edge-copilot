import { useState } from 'react';
import type { Rhythm } from '../data/rhythms';
import { RHYTHMS, RHYTHM_ALIASES } from '../data/rhythms';
import { RhythmCard } from './RhythmCard';
import { getRecentRhythms, getFavorites, getStreakText } from '../utils/localProgress';

interface RhythmLabHomeProps {
  rhythms: Rhythm[];
  onSelect: (rhythm: Rhythm) => void;
  onCompare: () => void;
  onPractice: () => void;
}

const TEACHING_POINTS = [
  {
    title: 'Start with pattern',
    body: 'Rate, regularity, and wave morphology together tell the clinical story. Look at the whole strip before fixating on one feature.',
  },
  {
    title: 'Context is everything',
    body: 'The same rhythm means different things in different patients. Symptoms and hemodynamics guide the response, not the strip alone.',
  },
  {
    title: 'Strip and patient together',
    body: 'The monitor is one data point. Always combine what you see on the strip with what you observe at the bedside.',
  },
];

export function RhythmLabHome({ rhythms, onSelect, onCompare, onPractice }: RhythmLabHomeProps) {
  const [query, setQuery] = useState('');

  // Progress data — read once on mount (home remounts on every return from detail/practice/compare)
  const recentIds   = getRecentRhythms();
  const favoriteIds = getFavorites();
  const streakText  = getStreakText();

  const recentRhythms   = recentIds.map(id => RHYTHMS.find(r => r.id === id)).filter((r): r is Rhythm => r != null);
  const favoriteRhythms = favoriteIds.map(id => RHYTHMS.find(r => r.id === id)).filter((r): r is Rhythm => r != null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rhythms.filter(r => {
        const aliases = RHYTHM_ALIASES[r.id] ?? [];
        return (
          r.name.toLowerCase().includes(q) ||
          r.shortName.toLowerCase().includes(q) ||
          aliases.some(a => a.includes(q))
        );
      })
    : rhythms;

  return (
    <div className="home-layout">
      <div className="home-left">
        <div className="home-brand">
          <p className="home-brand__eyebrow">The Clinical Edge</p>
          <h1 className="home-brand__title">Rhythm Lab</h1>
          <p className="home-brand__desc">
            Learn to recognize common cardiac rhythms the way they appear at the bedside —
            strip pattern, clinical context, and what matters for patient care.
          </p>
        </div>

        <div className="teaching-panel">
          <p className="teaching-panel__eyebrow">How to use this module</p>
          <p className="teaching-panel__title">Three principles of rhythm recognition</p>
          <div className="teaching-panel__points">
            {TEACHING_POINTS.map((pt, i) => (
              <div key={pt.title} className="teaching-point">
                <span className="teaching-point__num">0{i + 1}</span>
                <div className="teaching-point__body">
                  <strong>{pt.title}</strong>
                  <p>{pt.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {favoriteRhythms.length > 0 && (
          <div className="progress-panel">
            <p className="progress-panel__heading">Saved rhythms</p>
            {favoriteRhythms.map(r => (
              <button
                key={r.id}
                className="progress-rhythm-row"
                onClick={() => onSelect(r)}
              >
                <span className="progress-rhythm-row__abbrev">{r.shortName}</span>
                <span className="progress-rhythm-row__name">{r.name}</span>
              </button>
            ))}
          </div>
        )}

        {streakText && (
          <p className="progress-streak">{streakText}</p>
        )}
      </div>

      <div className="home-right">
        <div className="home-right__header">
          <p className="home-right__label">
            {q
              ? `${filtered.length} of ${rhythms.length} rhythms`
              : `${rhythms.length} core rhythms — select to explore`}
          </p>
          <div className="home-right__actions">
          <button className="practice-mode-btn" onClick={onPractice}>
            <span className="practice-mode-btn__main">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect x="0.5" y="1.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <line x1="0.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Practice
            </span>
            <span className="practice-mode-btn__sub">strip recognition</span>
          </button>
          <button className="compare-mode-btn" onClick={onCompare}>
            <span className="compare-mode-btn__main">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <rect x="7.5" y="0.5" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </svg>
              Compare rhythms
            </span>
            <span className="compare-mode-btn__sub">side-by-side recognition</span>
          </button>
          </div>
        </div>
        {recentRhythms.length > 0 && (
          <div className="progress-recent">
            <p className="progress-recent__label">Recently viewed</p>
            <div className="progress-recent__list">
              {recentRhythms.map(r => (
                <button
                  key={r.id}
                  className="progress-recent-chip"
                  onClick={() => onSelect(r)}
                  title={r.name}
                >
                  {r.shortName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rhythm-index-bar">
          <span className="rhythm-index-bar__label">Rhythm Index</span>
          <input
            className="rhythm-index-bar__input"
            type="search"
            placeholder="Search rhythms or abbreviations"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Filter rhythms"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="rhythm-list">
          {filtered.length > 0
            ? filtered.map((rhythm) => (
                <RhythmCard
                  key={rhythm.id}
                  rhythm={rhythm}
                  onClick={() => onSelect(rhythm)}
                />
              ))
            : (
                <p className="rhythm-index-no-results">No matching rhythms.</p>
              )
          }
        </div>
      </div>
    </div>
  );
}
