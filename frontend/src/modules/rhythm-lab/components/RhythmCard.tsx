import { URGENCY_COLORS } from '../data/rhythms';
import type { Rhythm } from '../data/rhythms';
import { RhythmStrip } from './RhythmStrip';

interface RhythmCardProps {
  rhythm: Rhythm;
  onClick: () => void;
}

export function RhythmCard({ rhythm, onClick }: RhythmCardProps) {
  const urgencyColor = URGENCY_COLORS[rhythm.urgency];

  return (
    <button
      className="rhythm-item"
      style={{ borderLeftColor: urgencyColor }}
      onClick={onClick}
      aria-label={`Open ${rhythm.name}`}
    >
      <div className="rhythm-item__inner">
        <div className="rhythm-item__top">
          <span className="rhythm-item__abbrev">{rhythm.shortName}</span>
          <span className="rhythm-item__name">{rhythm.name}</span>
          <span className="rhythm-item__urgency" style={{ color: urgencyColor }}>
            {rhythm.urgencyLabel}
          </span>
        </div>

        <div className="rhythm-item__strip-wrap">
          <div className="rhythm-preview-strip-fade">
            <RhythmStrip rhythmId={rhythm.id} preview />
          </div>
        </div>

        <p className="rhythm-item__cue">{rhythm.recognitionCues[0]}</p>
        <span className="rhythm-item__rate">{rhythm.rate}</span>
      </div>
    </button>
  );
}
