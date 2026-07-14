import { useState, useEffect, useRef } from 'react';
import { RHYTHMS } from '../data/rhythms';
import type { Rhythm } from '../data/rhythms';
import { COMPARISONS } from '../data/comparisons';
import { RhythmStrip } from './RhythmStrip';
import { addRecentCompare, getRecentCompares } from '../utils/localProgress';
import type { ComparePair } from '../utils/localProgress';

interface CompareModeProps {
  onBack: () => void;
}

const URGENCY_COLOR: Record<string, string> = {
  stable:   '#4E7C70',
  monitor:  'var(--ce-gold)',
  urgent:   '#D97706',
  critical: '#DC2626',
};

export function CompareMode({ onBack }: CompareModeProps) {
  const [idA, setIdA] = useState('mobitz_i');
  const [idB, setIdB] = useState('mobitz_ii');
  const [recentCompares, setRecentCompares] = useState<ComparePair[]>(() => getRecentCompares());

  // Record compare pair on user interaction (skip first render — don't persist defaults)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    addRecentCompare(idA, idB);
    setRecentCompares(getRecentCompares());
  }, [idA, idB]);

  const rhythmA = RHYTHMS.find(r => r.id === idA)!;
  const rhythmB = RHYTHMS.find(r => r.id === idB)!;

  const preset = COMPARISONS.find(
    p => (p.a.id === idA && p.b.id === idB) || (p.a.id === idB && p.b.id === idA)
  );

  return (
    <div className="compare-page">
      {/* Nav bar */}
      <div className="compare-nav">
        <button className="detail-back" onClick={onBack}>← All Rhythms</button>
        <div className="compare-nav__right">
          <span className="compare-nav__badge">Recognition tool</span>
        </div>
      </div>

      {/* Header: title + selectors + presets */}
      <div className="compare-header">
        <div className="compare-header__top">
          <div className="compare-header__text">
            <p className="compare-header__title">Compare Rhythms</p>
            <p className="compare-header__sub">
              Place two strips side by side to see what actually separates them.
            </p>
          </div>
          <div className="compare-selectors">
            <div className="compare-selector-group">
              <label className="compare-selector-label" htmlFor="cmp-rhythm-a">Rhythm A</label>
              <select
                id="cmp-rhythm-a"
                className="compare-select"
                value={idA}
                onChange={e => setIdA(e.target.value)}
              >
                {RHYTHMS.map(r => (
                  <option key={r.id} value={r.id}>{r.shortName} — {r.name}</option>
                ))}
              </select>
            </div>
            <span className="compare-vs" aria-hidden="true">vs</span>
            <div className="compare-selector-group">
              <label className="compare-selector-label" htmlFor="cmp-rhythm-b">Rhythm B</label>
              <select
                id="cmp-rhythm-b"
                className="compare-select"
                value={idB}
                onChange={e => setIdB(e.target.value)}
              >
                {RHYTHMS.map(r => (
                  <option key={r.id} value={r.id}>{r.shortName} — {r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="compare-presets">
          {recentCompares.length > 0 && (
            <div className="compare-recent">
              <p className="compare-recent__label">Recently compared</p>
              <div className="compare-recent__list">
                {recentCompares.map((pair, i) => {
                  const rA = RHYTHMS.find(r => r.id === pair.aId);
                  const rB = RHYTHMS.find(r => r.id === pair.bId);
                  if (!rA || !rB) return null;
                  const active = (idA === pair.aId && idB === pair.bId) ||
                                 (idA === pair.bId && idB === pair.aId);
                  return (
                    <button
                      key={i}
                      className={`compare-recent-chip${active ? ' compare-recent-chip--active' : ''}`}
                      onClick={() => { setIdA(pair.aId); setIdB(pair.bId); }}
                    >
                      {rA.shortName}<span className="compare-recent-chip__sep">/</span>{rB.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <p className="compare-presets__label">Common comparisons</p>
          <div className="compare-presets__list">
            {COMPARISONS.map(p => {
              const active =
                (idA === p.a.id && idB === p.b.id) ||
                (idA === p.b.id && idB === p.a.id);
              return (
                <button
                  key={p.id}
                  className={`compare-preset-row${active ? ' compare-preset-row--active' : ''}`}
                  onClick={() => { setIdA(p.a.id); setIdB(p.b.id); }}
                >
                  {p.a.short}
                  <span className="compare-preset-row__sep">/</span>
                  {p.b.short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main body */}
      <div className="compare-body">
        {/* Two strips side by side */}
        <div className="compare-strips">
          <StripCard rhythm={rhythmA} />
          <StripCard rhythm={rhythmB} />
        </div>

        {/* Analysis — preset copy or generic fallback */}
        <div className="compare-analysis">
          {preset ? (
            <>
              <div className="compare-diffs-panel">
                <p className="compare-panel-heading">Key differences</p>
                <ul className="compare-diffs">
                  {preset.keyDiffs.map((d, i) => (
                    <li key={i} className="compare-diff-item">
                      <span className="compare-diff-item__num">{i + 1}</span>
                      <span className="compare-diff-item__text">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="compare-notes-panel">
                <div className="compare-note">
                  <p className="compare-note__label">What nurses notice first</p>
                  <p className="compare-note__text">{preset.nursesNotice}</p>
                </div>
                <div className="compare-note compare-note--teaching">
                  <p className="compare-note__label">Teaching note</p>
                  <p className="compare-note__text">{preset.teachingNote}</p>
                </div>
              </div>
            </>
          ) : (
            <GenericComparison a={rhythmA} b={rhythmB} />
          )}
        </div>

        <p className="compare-disclaimer">
          Educational tool only — not for clinical decision-making.
        </p>
      </div>
    </div>
  );
}

function StripCard({ rhythm }: { rhythm: Rhythm }) {
  const color = URGENCY_COLOR[rhythm.urgency] ?? 'var(--ce-text-light-sec)';
  return (
    <div className="compare-strip-card">
      <div className="compare-strip-card__header">
        <span className="compare-strip-card__short">{rhythm.shortName}</span>
        <span className="compare-strip-card__name">{rhythm.name}</span>
        <span className="compare-strip-card__urgency" style={{ color }}>
          {rhythm.urgencyLabel}
        </span>
      </div>
      <div className="compare-strip-card__strip">
        <RhythmStrip rhythmId={rhythm.id} />
      </div>
    </div>
  );
}

function GenericComparison({ a, b }: { a: Rhythm; b: Rhythm }) {
  const rows: Array<{ label: string; valA: string; valB: string }> = [
    { label: 'Rate',        valA: a.rate,               valB: b.rate },
    { label: 'Regularity',  valA: a.regularity,         valB: b.regularity },
    { label: 'P wave',      valA: a.pWave,              valB: b.pWave },
    { label: 'QRS',         valA: a.qrs,                valB: b.qrs },
    { label: 'First clue',  valA: a.recognitionCues[0], valB: b.recognitionCues[0] },
  ];

  return (
    <div className="compare-generic">
      <div className="compare-generic__heading-bar">
        <p className="compare-panel-heading">Side-by-side reference</p>
        <div className="compare-generic__col-labels">
          <span className="compare-generic__col-label">{a.shortName}</span>
          <span className="compare-generic__col-label">{b.shortName}</span>
        </div>
      </div>
      <div className="compare-generic__table">
        {rows.map(row => (
          <div key={row.label} className="compare-generic__row">
            <span className="compare-generic__row-label">{row.label}</span>
            <span className="compare-generic__row-val">{row.valA}</span>
            <span className="compare-generic__row-val">{row.valB}</span>
          </div>
        ))}
      </div>
      <div className="compare-generic__confusion">
        <div className="compare-note">
          <p className="compare-note__label">{a.shortName} — Common confusion</p>
          <p className="compare-note__text">{a.confusedWith}</p>
        </div>
        <div className="compare-note compare-note--teaching">
          <p className="compare-note__label">{b.shortName} — Common confusion</p>
          <p className="compare-note__text">{b.confusedWith}</p>
        </div>
      </div>
    </div>
  );
}
