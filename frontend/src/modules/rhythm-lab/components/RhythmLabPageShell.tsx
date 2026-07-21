import { useEffect, type ReactNode } from 'react';
import { trackEvent } from '../../../analytics';
import type { AnalyticsPayload } from '../../../analytics';
import '../rhythm-lab.css';

interface RhythmLabPageShellProps {
  title: string;
  subtitle?: string;
  analyticsEvent: string;
  analyticsPayload?: AnalyticsPayload;
  navigate: (path: string) => void;
  children: ReactNode;
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

/**
 * Shared shell for the five dedicated Rhythm Lab pages (Library, Practice,
 * Compare, Pearls, Sprint). Provides the header, a persistent "Rhythm Lab"
 * back control, a compact page identity block, and one mount-time
 * analytics call — the single source of truth for that pattern so it
 * isn't repeated five times.
 */
export function RhythmLabPageShell({
  title,
  subtitle,
  analyticsEvent,
  analyticsPayload,
  navigate,
  children,
}: RhythmLabPageShellProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    trackEvent(analyticsEvent, { route: window.location.pathname, ...analyticsPayload });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  function goToRhythmLab(e: React.MouseEvent) {
    e.preventDefault();
    navigate('/rhythm-lab');
  }

  function goHome(e: React.MouseEvent) {
    e.preventDefault();
    navigate('/');
  }

  return (
    <div className="rhythm-lab-root">
      <div className="app-shell">

        <header className="site-header">
          <div className="site-header__inner">
            <a
              className="site-header__brand-link"
              href="/"
              onClick={goHome}
              aria-label="Clinical Edge — all tools"
            >
              <CELogo />
              <span className="site-header__brand">Clinical Edge</span>
            </a>
            <span className="site-header__sep" aria-hidden="true">/</span>
            <span className="site-header__module">Rhythm Lab</span>
            <button className="ce-back-link" onClick={goHome}>
              ← All tools
            </button>
          </div>
        </header>

        <div className="rhythm-back-float">
          <a
            className="rhythm-back-float__btn"
            href="/rhythm-lab"
            onClick={goToRhythmLab}
            aria-label="Back to Rhythm Lab"
          >
            <span aria-hidden="true">←</span>
            <span className="rhythm-back-float__label">Rhythm Lab</span>
          </a>
        </div>

        <div className="app-body ce-page-enter">
          <div className="page-identity">
            <p className="page-identity__eyebrow">Rhythm Lab</p>
            <h1 className="page-identity__title">{title}</h1>
            {subtitle && <p className="page-identity__subtitle">{subtitle}</p>}
          </div>

          {children}
        </div>

      </div>
    </div>
  );
}
