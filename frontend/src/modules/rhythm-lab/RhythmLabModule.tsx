import { useState, useEffect } from 'react';
import './rhythm-lab.css';
import { RHYTHMS } from './data/rhythms';
import type { Rhythm } from './data/rhythms';
import { RhythmLabHome } from './components/RhythmLabHome';
import { RhythmDetail } from './components/RhythmDetail';
import { CompareMode } from './components/CompareMode';
import { PracticeMode } from './components/PracticeMode';
import { TwoQuestionSprint } from './components/TwoQuestionSprint';
import { CompareRhythmsView } from './components/CompareRhythmsView';
import { addRecentRhythm } from './utils/localProgress';

type View = 'home' | 'detail' | 'compare' | 'practice' | 'sprint' | 'confusables';

interface RhythmLabModuleProps {
  onGoHome: () => void;
}

function CELogo() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="#0ABFBC"
      aria-label="Clinical Edge"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

export default function RhythmLabModule({ onGoHome }: RhythmLabModuleProps) {
  // Screenshot capture: ?screenshot=compare or ?screenshot=practice
  // starts the module in that view without affecting normal navigation.
  const [view, setView] = useState<View>(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const s  = sp.get('screenshot');
      if (s === 'compare')  return 'compare';
      if (s === 'practice') return 'practice';
    } catch {}
    return 'home';
  });
  const [selected, setSelected] = useState<Rhythm | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view, selected]);

  function handleSelect(rhythm: Rhythm) {
    addRecentRhythm(rhythm.id);
    setSelected(rhythm);
    setView('detail');
  }

  function handleBack() {
    setSelected(null);
    setView('home');
  }

  return (
    <div className="rhythm-lab-root">
      <div className="app-shell">

        <header className="site-header">
          <div className="site-header__inner">
            <CELogo />
            <span className="site-header__brand">Clinical Edge</span>
            <span className="site-header__sep" aria-hidden="true">/</span>
            <span className="site-header__module">Rhythm Lab</span>
            <button
              onClick={onGoHome}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#0ABFBC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4A6978'; }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#4A6978',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.03em',
                padding: '4px 0',
                lineHeight: 1,
                transition: 'color 0.15s',
              }}
            >
              ← All tools
            </button>
          </div>
        </header>

        <div className="app-body">
          {view === 'detail' && selected ? (
            <RhythmDetail rhythm={selected} onBack={handleBack} />
          ) : view === 'compare' ? (
            <CompareMode onBack={handleBack} />
          ) : view === 'practice' ? (
            <PracticeMode onBack={handleBack} />
          ) : view === 'sprint' ? (
            <TwoQuestionSprint onBack={handleBack} />
          ) : view === 'confusables' ? (
            <CompareRhythmsView onBack={handleBack} />
          ) : (
            <RhythmLabHome
              rhythms={RHYTHMS}
              onSelect={handleSelect}
              onCompare={() => setView('compare')}
              onPractice={() => setView('practice')}
              onSprint={() => setView('sprint')}
              onConfusables={() => setView('confusables')}
            />
          )}
        </div>

      </div>
    </div>
  );
}
