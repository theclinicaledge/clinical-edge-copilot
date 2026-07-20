import { RhythmLabPageShell } from './components/RhythmLabPageShell';
import { TwoQuestionSprint } from './components/TwoQuestionSprint';

interface RhythmSprintPageProps {
  navigate: (path: string) => void;
}

export default function RhythmSprintPage({ navigate }: RhythmSprintPageProps) {
  return (
    <RhythmLabPageShell
      title="Sprint"
      subtitle="Build speed with rapid rhythm identification."
      analyticsEvent="rhythm_sprint_opened"
      navigate={navigate}
    >
      <TwoQuestionSprint onBack={() => navigate('/rhythm-lab')} />
    </RhythmLabPageShell>
  );
}
