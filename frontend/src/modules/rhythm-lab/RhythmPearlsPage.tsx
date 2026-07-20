import { RhythmLabPageShell } from './components/RhythmLabPageShell';
import { PearlsSection } from './components/PearlsSection';

interface RhythmPearlsPageProps {
  navigate: (path: string) => void;
}

export default function RhythmPearlsPage({ navigate }: RhythmPearlsPageProps) {
  return (
    <RhythmLabPageShell
      title="Recognition Pearls"
      subtitle="Explore all high-yield rhythm recognition tips."
      analyticsEvent="rhythm_pearls_opened"
      navigate={navigate}
    >
      <div className="home-layout">
        <div className="home-left">
          <PearlsSection />
        </div>
      </div>
    </RhythmLabPageShell>
  );
}
