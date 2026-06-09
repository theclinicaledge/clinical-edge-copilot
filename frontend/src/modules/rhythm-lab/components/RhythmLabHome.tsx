import { useState } from 'react';
import type { Rhythm } from '../data/rhythms';
import { RHYTHMS, RHYTHM_ALIASES } from '../data/rhythms';
import { RhythmCard } from './RhythmCard';
import { RhythmStrip } from './RhythmStrip';
import { FoundationsSection } from './FoundationsSection';
import { PearlsSection } from './PearlsSection';
import { getRecentRhythms, getFavorites, getStreakText } from '../utils/localProgress';

interface RhythmLabHomeProps {
  rhythms: Rhythm[];
  onSelect: (rhythm: Rhythm) => void;
  onCompare: () => void;
  onPractice: () => void;
  onSprint: () => void;
  onConfusables: () => void;
}

// Normalise a search string: lowercase, hyphens → spaces, collapse whitespace.
// Lets queries like "v-tach", "a-fib", "mobitz-2" hit the right rhythm.
function norm(s: string): string {
  return s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
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

export function RhythmLabHome({ rhythms, onSelect, onCompare, onPractice, onSprint, onConfusables }: RhythmLabHomeProps) {
  const [query, setQuery] = useState('');

  // Progress data — read once on mount (home remounts on every return from detail/practice/compare)
  const recentIds   = getRecentRhythms();
  const favoriteIds = getFavorites();
  const streakText  = getStreakText();

  const recentRhythms   = recentIds.map(id => RHYTHMS.find(r => r.id === id)).filter((r): r is Rhythm => r != null);
  const favoriteRhythms = favoriteIds.map(id => RHYTHMS.find(r => r.id === id)).filter((r): r is Rhythm => r != null);

  const q = norm(query);
  const filtered = q
    ? rhythms.filter(r => {
        const aliases = RHYTHM_ALIASES[r.id] ?? [];
        return (
          norm(r.name).includes(q) ||
          norm(r.shortName).includes(q) ||
          aliases.some(a => norm(a).includes(q))
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
          <div className="home-hero-strip" aria-hidden="true">
            <RhythmStrip rhythmId="nsr" preview />
          </div>
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

        <FoundationsSection />
        <PearlsSection />

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
            <button className="action-btn action-btn--teal" onClick={onConfusables}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 4h4M7 4h4M2 6.5h4M7 6.5h4M2 9h4M7 9h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <line x1="5.5" y1="1" x2="5.5" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
              </svg>
              Confusables
            </button>
            <button className="action-btn action-btn--gold" onClick={onSprint}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <line x1="6.5" y1="3.5" x2="6.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="6.5" y1="6.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              Sprint
            </button>
            <button className="action-btn action-btn--gold" onClick={onPractice}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect x="0.5" y="1.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <line x1="0.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Practice
            </button>
            <button className="action-btn action-btn--teal" onClick={onCompare}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <rect x="7.5" y="0.5" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </svg>
              Compare
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
