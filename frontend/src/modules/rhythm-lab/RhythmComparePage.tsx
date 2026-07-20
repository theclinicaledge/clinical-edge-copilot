import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { RhythmLabPageShell } from './components/RhythmLabPageShell';
import { CompareMode } from './components/CompareMode';
import { CompareRhythmsView } from './components/CompareRhythmsView';

interface RhythmComparePageProps {
  navigate: (path: string) => void;
}

type Tab = 'compare' | 'confusables';

export default function RhythmComparePage({ navigate }: RhythmComparePageProps) {
  const [tab, setTab] = useState<Tab>('compare');
  const onBack = () => navigate('/rhythm-lab');

  function selectConfusables() {
    if (tab !== 'confusables') trackEvent('rhythm_confusables_opened');
    setTab('confusables');
  }

  return (
    <RhythmLabPageShell
      title="Compare Rhythms & Confusables"
      subtitle="Review commonly confused rhythms side by side."
      analyticsEvent="rhythm_compare_opened"
      navigate={navigate}
    >
      <div className="compare-tabs" role="tablist" aria-label="Compare Rhythms sections">
        <button
          role="tab"
          id="rl-tab-compare"
          aria-selected={tab === 'compare'}
          aria-controls="rl-panel-compare"
          className={`compare-tab${tab === 'compare' ? ' compare-tab--active' : ''}`}
          onClick={() => setTab('compare')}
        >
          Compare
        </button>
        <button
          role="tab"
          id="rl-tab-confusables"
          aria-selected={tab === 'confusables'}
          aria-controls="rl-panel-confusables"
          className={`compare-tab${tab === 'confusables' ? ' compare-tab--active' : ''}`}
          onClick={selectConfusables}
        >
          Confusables
        </button>
      </div>

      {/* Both panels stay mounted — switching tabs preserves each tool's
          selection state instead of resetting it. */}
      <div role="tabpanel" id="rl-panel-compare" aria-labelledby="rl-tab-compare" hidden={tab !== 'compare'}>
        <CompareMode onBack={onBack} />
      </div>
      <div role="tabpanel" id="rl-panel-confusables" aria-labelledby="rl-tab-confusables" hidden={tab !== 'confusables'}>
        <CompareRhythmsView onBack={onBack} />
      </div>
    </RhythmLabPageShell>
  );
}
