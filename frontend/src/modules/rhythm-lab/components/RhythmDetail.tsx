import { useState } from 'react';
import { URGENCY_COLORS, URGENCY_CONTEXT } from '../data/rhythms';
import type { Rhythm } from '../data/rhythms';
import { RhythmStrip } from './RhythmStrip';
import { RecognitionSidebar } from './RecognitionSidebar';
import { RecognitionBreakdown } from './RecognitionBreakdown';
import { CaliperOverlay } from './CaliperOverlay';
import { isFavorite, toggleFavorite } from '../utils/localProgress';
import { getPearlForRhythm } from '../data/phase1';

interface RhythmDetailProps {
  rhythm: Rhythm;
  onBack: () => void;
}

export function RhythmDetail({ rhythm, onBack }: RhythmDetailProps) {
  const urgencyColor   = URGENCY_COLORS[rhythm.urgency];
  const urgencyContext = URGENCY_CONTEXT[rhythm.urgency];
  const [caliperOn, setCaliperOn] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isFavorite(rhythm.id));
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const pearl = getPearlForRhythm(rhythm.id);

  return (
    <div className="detail-page">

      <div className="detail-nav">
        <button className="detail-back" onClick={onBack} aria-label="Back to rhythm list">
          ← All rhythms
        </button>
        <div className="detail-header">
          <span className="detail-abbrev">{rhythm.shortName}</span>
          <span className="detail-name">{rhythm.name}</span>
        </div>
        <span
          className="detail-urgency-tag"
          style={{
            color: urgencyColor,
            borderColor: urgencyColor + '60',
            backgroundColor: urgencyColor + '16',
          }}
        >
          {rhythm.urgencyLabel}
        </span>
        <button
          className={`bookmark-btn${bookmarked ? ' bookmark-btn--active' : ''}`}
          onClick={() => setBookmarked(toggleFavorite(rhythm.id))}
          aria-label={bookmarked ? 'Remove from saved rhythms' : 'Save rhythm'}
          title={bookmarked ? 'Remove from saved' : 'Save rhythm'}
        >
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none" aria-hidden="true">
            <path
              d="M1 1.5C1 1.22 1.22 1 1.5 1h8C9.78 1 10 1.22 10 1.5v9.16a.5.5 0 0 1-.78.42L5.5 8.6 1.78 11.08A.5.5 0 0 1 1 10.66V1.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </svg>
          {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="detail-strip-area">
        <div className="detail-strip-wrap">
          <RhythmStrip rhythmId={rhythm.id} />
          {caliperOn && <CaliperOverlay />}
        </div>
        <div className="detail-strip-meta">
          <span className="detail-strip-label">{rhythm.shortName} — Recognition strip</span>
          <div className="detail-strip-meta__right">
            <span className="detail-strip-annotation">Lead II simulation · 25 mm/s</span>
            <button
              className={`caliper-btn${caliperOn ? ' caliper-btn--on' : ''}`}
              onClick={() => setCaliperOn(v => !v)}
              aria-label="Toggle calipers"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <line x1="2" y1="1" x2="2" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="9" y1="1" x2="9" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              Calipers
            </button>
          </div>
        </div>
        {caliperOn && (
          <p className="caliper-hint">
            At 25 mm/s: 1 small box = 0.04s · 1 large box = 0.20s
          </p>
        )}
      </div>

      <div className="detail-tagline-bar">
        <p className="detail-tagline">{rhythm.tagline}</p>
      </div>

      <div className="detail-content">
        <div className="detail-main">

          <div className="warm-panel">
            <p className="warm-panel__heading">Recognition snapshot</p>
            <div className="recog-cues">
              {rhythm.recognitionCues.map((cue, i) => (
                <div key={i} className="recog-cue">
                  <span className="recog-cue__num">{i + 1}</span>
                  <span className="recog-cue__text">{cue}</span>
                </div>
              ))}
            </div>
            <div className="clinical-table">
              <div className="clinical-row">
                <span className="clinical-label">Rate</span>
                <span className="clinical-value">{rhythm.rate}</span>
              </div>
              <div className="clinical-row">
                <span className="clinical-label">Regularity</span>
                <span className="clinical-value">{rhythm.regularity}</span>
              </div>
              <div className="clinical-row">
                <span className="clinical-label">P Wave</span>
                <span className="clinical-value">{rhythm.pWave}</span>
              </div>
              <div className="clinical-row">
                <span className="clinical-label">QRS</span>
                <span className="clinical-value">{rhythm.qrs}</span>
              </div>
            </div>
          </div>

          <div className="breakdown-collapsible">
            <button
              className="breakdown-toggle"
              onClick={() => setBreakdownOpen(v => !v)}
              aria-expanded={breakdownOpen}
            >
              <span className="breakdown-toggle__title">Strip Reading Guide</span>
              <span className="breakdown-toggle__chevron" aria-hidden="true">
                {breakdownOpen ? '▲' : '▼'}
              </span>
            </button>
            {breakdownOpen && <RecognitionBreakdown rhythm={rhythm} />}
          </div>

          <div className="bedside-editorial">
            <p className="bedside-editorial__heading">Bedside perspective</p>
            <div className="bedside-item">
              <p className="bedside-item__label">What nurses notice first</p>
              <p className="bedside-item__text">{rhythm.nursesNotice}</p>
            </div>
            <div className="bedside-item">
              <p className="bedside-item__label">Common confusion</p>
              <p className="bedside-item__text">{rhythm.confusedWith}</p>
            </div>
            <div className="bedside-item">
              <p className="bedside-item__label">Bedside relevance</p>
              <p className="bedside-item__text">{rhythm.bedsideRelevance}</p>
            </div>
            <div className="bedside-item">
              <p className="bedside-item__label">When it becomes more urgent</p>
              <p className="bedside-item__text">{rhythm.whenMoreUrgent}</p>
            </div>
          </div>

          <div
            className="urgency-callout"
            style={{ borderLeftColor: urgencyColor }}
          >
            <p className="urgency-callout__label" style={{ color: urgencyColor }}>
              {rhythm.urgencyLabel} — Bedside context
            </p>
            <p className="urgency-callout__text">{urgencyContext}</p>
          </div>

        </div>

        <aside className="detail-sidebar">
          <RecognitionSidebar />
        </aside>
      </div>

      <div className="detail-pearl">
        <span className="detail-pearl__label">Recognition Pearl</span>
        <p className="detail-pearl__text">{pearl.text}</p>
      </div>

      <div className="disclaimer">
        <p>
          Educational reference only. Not a diagnostic tool. Always interpret rhythm findings
          in full clinical context with provider guidance and local protocol.
        </p>
      </div>

    </div>
  );
}
