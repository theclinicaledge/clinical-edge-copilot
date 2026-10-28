// Read-only home projection. Scenario readers remain the authority on progress.
export function learningStatus(label) {
  if (label === 'Not started') return 'new';
  if (label === 'Debrief reached') return 'finished';
  return label.startsWith('Continue: ') ? 'active' : 'unavailable';
}

export function resumableExperiences(items, labelFor, now = Date.now()) {
  return items.map((item, index) => {
    const label = labelFor(item);
    // Only this scenario currently records wall-clock activity in its main save.
    // Event order, fictional clinical times and storage order are not dates.
    const updated = item.id === 'missing-time' ? item.readProgress().updated : null;
    const activity = Number.isFinite(updated) && updated > 0 && updated <= now ? updated : null;
    return { item, label, activity, index };
  }).filter(({ label }) => learningStatus(label) === 'active')
    .sort((a, b) => (b.activity ?? 0) - (a.activity ?? 0) || a.index - b.index);
}
