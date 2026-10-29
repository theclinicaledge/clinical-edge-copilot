import { scenario } from '../scenario.js';

// Read-only projection of the existing discovery and first-choice record.
// Deliberately omit tiers, feedback and any undiscovered labels or values.
export function bedsideRecord(progress) {
  const revealed = new Set(Array.isArray(progress.revealed) ? progress.revealed : []);
  const marked = new Set(Array.isArray(progress.answers?.cues) ? progress.answers.cues : Array.isArray(progress.selected) ? progress.selected : []);
  return scenario.cues.filter(cue => revealed.has(cue.id)).map(cue => ({ id: cue.id, label: cue.label, text: cue.text, marked: marked.has(cue.id) }));
}
