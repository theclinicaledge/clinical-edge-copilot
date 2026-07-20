import { RhythmStrip } from './RhythmStrip';
import { FoundationsSection } from './FoundationsSection';
import { getStreakText } from '../utils/localProgress';

interface RhythmLabHomeProps {
  navigate: (path: string) => void;
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

interface ExploreCard {
  key: string;
  path: string;
  title: string;
  desc: string;
  accent: 'teal' | 'gold';
  icon: React.ReactNode;
}

const EXPLORE_CARDS: ExploreCard[] = [
  {
    key: 'pearls',
    path: '/rhythm-lab/pearls',
    title: 'Recognition Pearls',
    desc: 'Explore all high-yield rhythm recognition tips.',
    accent: 'gold',
    icon: (
      <svg width="15" height="15" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M6.5 1 L8 5 L12 6.5 L8 8 L6.5 12 L5 8 L1 6.5 L5 5 Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'library',
    path: '/rhythm-lab/library',
    title: 'Rhythm Library',
    desc: 'Browse all 36 rhythms, ECG strips, and recognition details.',
    accent: 'teal',
    icon: (
      <svg width="15" height="15" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <rect x="0.5" y="1" width="12" height="3.2" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="0.5" y="5.4" width="12" height="3.2" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="0.5" y="9.8" width="12" height="3.2" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
      </svg>
    ),
  },
  {
    key: 'compare',
    path: '/rhythm-lab/compare',
    title: 'Compare Rhythms & Confusables',
    desc: 'Review commonly confused rhythms side by side.',
    accent: 'teal',
    icon: (
      <svg width="15" height="15" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <rect x="0.5" y="0.5" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="7.5" y="0.5" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    key: 'practice',
    path: '/rhythm-lab/practice',
    title: 'Practice',
    desc: 'Test rhythm recognition with guided practice.',
    accent: 'gold',
    icon: (
      <svg width="15" height="15" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <rect x="0.5" y="1.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="0.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: 'sprint',
    path: '/rhythm-lab/sprint',
    title: 'Sprint',
    desc: 'Build speed with rapid rhythm identification.',
    accent: 'gold',
    icon: (
      <svg width="15" height="15" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="6.5" y1="3.5" x2="6.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="6.5" y1="6.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function RhythmLabHome({ navigate }: RhythmLabHomeProps) {
  const streakText = getStreakText();

  function goTo(path: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(path);
    };
  }

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

        <div className="explore-hub">
          <p className="explore-hub__eyebrow">Get started</p>
          <p className="explore-hub__title">Explore Rhythm Lab</p>
          <div className="explore-list">
            {EXPLORE_CARDS.map(card => (
              <a
                key={card.key}
                className="explore-row"
                href={card.path}
                onClick={goTo(card.path)}
                style={{ borderLeftColor: card.accent === 'teal' ? 'var(--ce-teal-deep)' : 'var(--accent-gold)' }}
              >
                <span
                  className="explore-row__icon"
                  style={{ color: card.accent === 'teal' ? 'var(--ce-teal-deep)' : 'var(--accent-gold)' }}
                >
                  {card.icon}
                </span>
                <span className="explore-row__body">
                  <span className="explore-row__title">{card.title}</span>
                  <span className="explore-row__desc">{card.desc}</span>
                </span>
                <svg className="explore-row__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        {streakText && (
          <p className="progress-streak">{streakText}</p>
        )}
      </div>
    </div>
  );
}
