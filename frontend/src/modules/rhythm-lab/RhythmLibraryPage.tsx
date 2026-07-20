import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { RHYTHMS, RHYTHM_ALIASES } from './data/rhythms';
import type { Rhythm } from './data/rhythms';
import { RhythmLabPageShell } from './components/RhythmLabPageShell';
import { RhythmCard } from './components/RhythmCard';
import { RhythmDetail } from './components/RhythmDetail';
import { addRecentRhythm, getRecentRhythms, getFavorites } from './utils/localProgress';

interface RhythmLibraryPageProps {
  navigate: (path: string) => void;
}

// Normalise a search string: lowercase, hyphens → spaces, collapse whitespace.
// Lets queries like "v-tach", "a-fib", "mobitz-2" hit the right rhythm.
function norm(s: string): string {
  return s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function RhythmLibraryPage({ navigate }: RhythmLibraryPageProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Rhythm | null>(null);

  const recentIds   = getRecentRhythms();
  const favoriteIds = getFavorites();
  const recentRhythms   = recentIds.map(id => RHYTHMS.find(r => r.id === id)).filter((r): r is Rhythm => r != null);
  const favoriteRhythms = favoriteIds.map(id => RHYTHMS.find(r => r.id === id)).filter((r): r is Rhythm => r != null);

  const q = norm(query);
  const filtered = q
    ? RHYTHMS.filter(r => {
        const aliases = RHYTHM_ALIASES[r.id] ?? [];
        return (
          norm(r.name).includes(q) ||
          norm(r.shortName).includes(q) ||
          aliases.some(a => norm(a).includes(q))
        );
      })
    : RHYTHMS;

  function handleSelect(rhythm: Rhythm) {
    addRecentRhythm(rhythm.id);
    trackEvent('rhythm_selected', { rhythm_id: rhythm.id, urgency: rhythm.urgency });
    setSelected(rhythm);
  }

  return (
    <RhythmLabPageShell
      title="Rhythm Library"
      subtitle="Browse all 36 rhythms, ECG strips, and recognition details."
      analyticsEvent="rhythm_library_opened"
      navigate={navigate}
    >
      {selected ? (
        <RhythmDetail rhythm={selected} onBack={() => setSelected(null)} />
      ) : (
        <div className="home-layout">
          {favoriteRhythms.length > 0 && (
            <div className="home-left">
              <div className="progress-panel">
                <p className="progress-panel__heading">Saved rhythms</p>
                {favoriteRhythms.map(r => (
                  <button
                    key={r.id}
                    className="progress-rhythm-row"
                    onClick={() => handleSelect(r)}
                  >
                    <span className="progress-rhythm-row__abbrev">{r.shortName}</span>
                    <span className="progress-rhythm-row__name">{r.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="home-right">
            <div className="home-right__header">
              <p className="home-right__label">
                {q
                  ? `${filtered.length} of ${RHYTHMS.length} rhythms`
                  : `${RHYTHMS.length} core rhythms — select to explore`}
              </p>
            </div>

            {recentRhythms.length > 0 && (
              <div className="progress-recent">
                <p className="progress-recent__label">Recently viewed</p>
                <div className="progress-recent__list">
                  {recentRhythms.map(r => (
                    <button
                      key={r.id}
                      className="progress-recent-chip"
                      onClick={() => handleSelect(r)}
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
                      onClick={() => handleSelect(rhythm)}
                    />
                  ))
                : (
                    <p className="rhythm-index-no-results">No matching rhythms.</p>
                  )
              }
            </div>
          </div>
        </div>
      )}
    </RhythmLabPageShell>
  );
}
