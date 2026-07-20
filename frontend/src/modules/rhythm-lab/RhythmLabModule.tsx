import { useEffect } from 'react';
import { trackEvent } from '../../analytics';
import './rhythm-lab.css';
import { RhythmLabHome } from './components/RhythmLabHome';

interface RhythmLabModuleProps {
  onGoHome: () => void;
  navigate: (path: string) => void;
}

function CELogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="var(--ce-teal)"
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

export default function RhythmLabModule({ onGoHome, navigate }: RhythmLabModuleProps) {
  // Track module opened once on mount
  useEffect(() => {
    trackEvent('rhythm_lab_opened', { route: '/rhythm-lab' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="rhythm-lab-root">
      <div className="app-shell">

        <header className="site-header">
          <div className="site-header__inner">
            <a
              className="site-header__brand-link"
              href="/"
              onClick={e => { e.preventDefault(); onGoHome(); }}
              aria-label="Clinical Edge — all tools"
            >
              <CELogo />
              <div className="site-header__brand-block">
                <span className="site-header__brand">Clinical Edge</span>
                <span className="site-header__module">Rhythm Lab</span>
              </div>
            </a>
            <button className="ce-back-link" onClick={onGoHome}>
              ← All tools
            </button>
          </div>
        </header>

        <div className="app-body ce-page-enter">
          <RhythmLabHome navigate={navigate} />
        </div>

      </div>
    </div>
  );
}
