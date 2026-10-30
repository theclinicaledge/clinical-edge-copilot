import { useEffect, useRef } from 'react';
import { shiftOpened, shiftProgress } from '../../productAnalytics.js';

// Numeric presentation milestones only. Never read or transmit learner answers.
export function useReleasedShiftAnalytics(id, version, stage, finalStage, decision = false, enabled = true) {
  const previous = useRef(null);
  useEffect(() => {
    if (!enabled || window.location.pathname !== `/learn/shifts/${id}` || !Number.isInteger(stage) || stage < 0) return;
    const current = { stage, decision };
    shiftProgress(id, version, previous.current, current, finalStage);
    if (!previous.current) shiftOpened(id, version, stage);
    previous.current = current;
  }, [id, version, stage, finalStage, decision, enabled]);
}
