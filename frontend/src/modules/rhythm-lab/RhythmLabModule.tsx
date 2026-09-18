import { useEffect } from 'react';
import { trackEvent } from '../../analytics';
import './rhythm-lab.css';
import { RhythmLabHome } from './components/RhythmLabHome';
import ModuleHeader from '../../components/ModuleHeader.jsx';

interface RhythmLabModuleProps {
  onGoHome: () => void;
  navigate: (path: string) => void;
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

        <ModuleHeader moduleName="Rhythm Lab" onGoHome={onGoHome} maxWidth="1280px" />

        <div className="app-body ce-page-enter">
          <RhythmLabHome navigate={navigate} />
        </div>

      </div>
    </div>
  );
}
