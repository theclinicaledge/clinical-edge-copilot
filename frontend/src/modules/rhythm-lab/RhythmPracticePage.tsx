import { RhythmLabPageShell } from './components/RhythmLabPageShell';
import { PracticeMode } from './components/PracticeMode';

interface RhythmPracticePageProps {
  navigate: (path: string) => void;
}

export default function RhythmPracticePage({ navigate }: RhythmPracticePageProps) {
  return (
    <RhythmLabPageShell
      title="Practice"
      subtitle="Test rhythm recognition with guided practice."
      analyticsEvent="rhythm_practice_opened"
      navigate={navigate}
    >
      <PracticeMode onBack={() => navigate('/rhythm-lab')} />
    </RhythmLabPageShell>
  );
}
