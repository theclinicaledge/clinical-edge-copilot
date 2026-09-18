import { useEffect, type ReactNode } from 'react';
import { trackEvent } from '../../../analytics';
import type { AnalyticsPayload } from '../../../analytics';
import '../rhythm-lab.css';
import ModuleHeader from '../../../components/ModuleHeader.jsx';

interface RhythmLabPageShellProps {
  title: string;
  subtitle?: string;
  analyticsEvent: string;
  analyticsPayload?: AnalyticsPayload;
  navigate: (path: string) => void;
  children: ReactNode;
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

  return (
    <div className="rhythm-lab-root">
      <div className="app-shell">

        <ModuleHeader
          moduleName="Rhythm Lab"
          onGoHome={() => navigate('/')}
          onBack={() => navigate('/rhythm-lab')}
          backLabel="Rhythm Lab"
          maxWidth="1280px"
        />

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
