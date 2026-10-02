import { test, expect } from '@playwright/test';
import { parsePriorities } from '../src/components/priorityMapModel.js';

test('composed Priority Map retains all deterministic evidence and separates interpretation', () => {
  const observations = ['BP: previous 108/64 -> current 86/48 mmHg', 'Heart rate: previous 92 -> current 118 bpm', 'Urine output: 20 mL over the last hour', 'Chest tube output: 35 mL during the most recent hour', 'Norepinephrine dose: unknown'];
  const output = `### 1 · Findings in context\nRelevance: High priority\nObserved:\n${observations.map(text => `- ${text}`).join('\n')}\nInterpretation: These findings may reflect impaired perfusion; contributors remain unresolved.\nAssess now:\n- Baseline and focused examination`;
  const [priority] = parsePriorities(output);
  expect(priority.observed).toEqual(observations);
  expect(priority.interpretation).toContain('may reflect');
  expect(priority.observed.join(' ')).not.toContain('impaired perfusion');
});

test('current-only evidence remains current-only in the presentation model', () => {
  const [priority] = parsePriorities('### 1 · Findings in context\nRelevance: Important\nObserved:\n- BP: current 170 mmHg\n- Fever reported\nInterpretation: Baseline remains unknown.\nAssess now:\n- Clarify baseline');
  expect(priority.observed).toEqual(['BP: current 170 mmHg', 'Fever reported']);
  expect(priority.interpretation).not.toMatch(/changes from earlier|worsening/);
});
