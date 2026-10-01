import { extractRapidCapture, formatExtractionItem } from './rapidCaptureExtractor.js';
import { serializePatientSnapshot } from './patientSnapshotModel.js';

const read = (snapshot, path) => path.split('.').reduce((value, key) => value?.[key], snapshot);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Uncertain timing, corrections, negation and causal claims cannot silently merge.
export function extractReassessment(narrative, previous) {
  if (!narrative.trim() || narrative.length > 3000) throw new Error('invalid_update');
  const rows = [], needsReview = [];
  if (/\b(?:sorry|actually|correction)\b/i.test(narrative)) return { rows: [], needsReview: [{ id: 'correction', text: narrative, reason: 'Self-revision requires a clean verified update; no competing values were merged.' }] };
  const clauses = narrative.split(/(?<=[.!?])\s+|,\s*(?=(?:BP|HR|RR|urine|still|oxygen|chest tube)\b)/i).filter((part) => part.trim());
  for (const [index, raw] of clauses.entries()) {
    const text = raw.trim();
    const review = (reason) => needsReview.push({ id: `review-${index}`, text, reason });
    const unknown = text.match(/^(BP|HR|RR) (unknown|not reassessed)[.!]?$/i);
    if (unknown) {
      const id = unknown[1].toLowerCase();
      const value = unknown[2].toLowerCase() === 'unknown' ? 'Unknown' : 'Not assessed';
      rows.push({ id: `row-${index}`, label: unknown[1].toUpperCase(), kind: 'unknown', value, paths: [`values.${id}State`], patch: { values: { [`${id}State`]: value } } }); continue;
    }
    if (/\b(?:sorry|actually|correction|maybe|yesterday|earlier|since \d|noticed|recognized|onset|after|because|responded|improving|not|no|stopped|unclear)\b|\bat\s+\d{1,2}:\d{2}\b|\bat\s+\d{3,4}\b/i.test(text)) {
      review('Clarify timing, correction, negation or cause before merging.'); continue;
    }
    if (/^still drowsy[.!]?$/i.test(text)) {
      rows.push({ id: `row-${index}`, label: 'Mental status', kind: /drowsy/i.test(previous.values?.loc || previous.values?.mental || '') ? 'unchanged' : 'current', value: 'Drowsy', paths: ['values.loc'], patch: { values: { loc: 'Drowsy' } } }); continue;
    }
    if (/^hands (?:are )?warmer now[.!]?$/i.test(text)) {
      rows.push({ id: `row-${index}`, label: 'Skin temperature', kind: 'current', value: 'Hands warmer now (reported)', paths: ['values.skinTemperature'], patch: { values: { skinTemperature: 'Hands warmer now (reported)' } } }); continue;
    }
    const drip = text.match(/^norepinephrine(?: dose)?(?: increased to| now| at)\s+(\d+(?:\.\d+)?)\s*(mcg\/kg\/min|mcg\/min)[.!]?$/i);
    const oxygen = text.match(/^oxygen(?: support)? (?:unchanged|still)(?: at| on) ((?:\d+(?:\.\d+)?\s*L(?:\s+(?:NC|nasal cannula))?)|room air)[.!]?$/i);
    if (oxygen) {
      const current = oxygen[1];
      if (previous.values?.oxygenNow && !same(previous.values.oxygenNow, current)) { review('Unchanged oxygen conflicts with the last verified support.'); continue; }
      rows.push({ id: `row-${index}`, label: 'Oxygen support', kind: 'unchanged', value: current, currentPath: 'values.oxygenNow', current, old: previous.values?.oxygenNow, paths: ['values.oxygenNow'], patch: { values: { oxygenNow: current }, signals: ['breathing'] } }); continue;
    }
    if (drip) {
      const value = { medication: 'Norepinephrine', currentDose: drip[1], unit: drip[2] };
      if (/increased to/i.test(text)) value.direction = 'Increased (reported)';
      rows.push({ id: `row-${index}`, label: 'Norepinephrine', kind: 'current', value: `${drip[1]} ${drip[2]}`, paths: ['optional.drips'], patch: { optional: { drips: { items: [value] } } } }); continue;
    }
    const normalized = text.replace(/\b(BP|HR|RR)\s+now\s+/gi, '$1 ').replace(/^urine\s+(\d+(?:\.\d+)?)\s*mL\s+this hour/i, '$1 mL urine this hour');
    if (/^norepinephrine(?: is)? running(?:[,;]? dose unknown)?[.!]?$/i.test(text)) {
      rows.push({ id: `row-${index}`, label: 'Norepinephrine', kind: 'current', value: 'Running · dose unknown', paths: ['optional.drips'], patch: { optional: { drips: { items: [{ medication: 'Norepinephrine' }] } } } }); continue;
    }
    if (/\b(?:norepinephrine|norepi|levo)\b/i.test(text)) { review('Verify medication, dose and units explicitly before merging.'); continue; }
    const extraction = extractRapidCapture(normalized);
    if (extraction.needsReview.length || !extraction.items.length) { review('Not confidently mapped. Edit or omit from the current assessment.'); continue; }
    for (const definition of extraction.items) {
      const duplicate = rows.some((row) => row.paths.some((path) => definition.clearPaths.includes(path)));
      if (duplicate) {
        for (let i = rows.length - 1; i >= 0; i--) if (rows[i].paths.some((path) => definition.clearPaths.includes(path))) rows.splice(i, 1);
        review('Multiple values for a finding require clarification; none were merged.'); continue;
      }
      const currentPath = definition.clearPaths.find((path) => path.endsWith('Now'));
      const current = currentPath && read(extraction.snapshot, currentPath);
      const old = currentPath && read(previous, currentPath);
      const unchanged = /\b(?:unchanged|still|stable)\b/i.test(text);
      if (unchanged && old && !same(old, current)) { review('Unchanged conflicts with the last verified value.'); continue; }
      rows.push({ id: `row-${index}-${definition.id}`, label: definition.label, value: formatExtractionItem(definition, extraction.snapshot), kind: ['urine', 'chest-tube'].includes(definition.id) ? 'interval' : unchanged ? 'unchanged' : 'current', paths: definition.clearPaths, currentPath, current, old, patch: extraction.snapshot });
    }
  }
  return { rows, needsReview };
}

export function confirmReassessment(previous, extraction, observedAfterPrevious) {
  const snapshot = { signals: ['off'], setting: previous.setting, contexts: [...previous.contexts], values: {}, optional: {}, units: {}, notes: '' };
  const delta = extraction.rows.map((row) => {
    const next = { ...row };
    if (row.currentPath) {
      const id = row.currentPath.split('.')[1].replace(/Now$/, '');
      snapshot.values[`${id}Now`] = row.current;
      const earlier = observedAfterPrevious && row.old ? row.old : read(row.patch, row.currentPath.replace(/Now$/, 'Earlier'));
      if (earlier) {
        snapshot.values[`${id}Earlier`] = earlier;
        next.kind = same(earlier, row.current) ? row.kind === 'unchanged' ? 'unchanged' : 'same' : 'changed';
        next.value = next.kind === 'changed' ? `${earlier} → ${row.current}` : String(row.current);
      } else if (row.kind === 'unchanged' && row.current) snapshot.values[`${id}Earlier`] = row.current;
      if (Object.hasOwn(row.patch.units || {}, id)) snapshot.units[id] = row.patch.units[id];
    } else {
      for (const path of row.paths) {
        const [section, key] = path.split('.');
        if (section === 'values') snapshot.values[key] = structuredClone(read(row.patch, path));
        else if (section === 'optional') snapshot.optional[key] = structuredClone(row.patch.optional[key]);
      }
    }
    snapshot.signals = [...new Set([...snapshot.signals, ...(row.patch.signals || [])])];
    return { id: next.id, label: next.label, kind: next.kind, value: next.value };
  });
  const unchanged = delta.filter((row) => row.kind === 'unchanged').map((row) => row.label);
  if (unchanged.length) snapshot.notes = `Explicitly unchanged on reassessment: ${unchanged.join(', ')}.`;
  return { snapshot, serializedSnapshot: serializePatientSnapshot(snapshot), previous: structuredClone(previous), delta, observedAfterPrevious };
}
