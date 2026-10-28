// Presentation geometry only. Clinical decisions remain in rules.js.
export const METRICS = [
  { key: 'hr', label: 'Heart rate', unit: 'beats/min', min: 60, max: 140 },
  { key: 'sys', label: 'Systolic BP', unit: 'mmHg', min: 80, max: 180 },
  { key: 'rr', label: 'Respiratory rate', unit: 'breaths/min', min: 8, max: 32 },
];
export function elapsedMinutes(time) {
  const clock = time.replace(/^y/, '');
  return Number(clock.slice(0, 2)) * 60 + Number(clock.slice(2)) + (time.startsWith('y') ? 0 : 1440) - 1200;
}
export function trendPoint(reading, metric, width) {
  return { x: 34 + elapsedMinutes(reading.time) / 1390 * (width - 48), y: 8 + (metric.max - reading[metric.key]) / (metric.max - metric.min) * 44 };
}
export const baselineChange = (reading, baseline, key) => reading ? `${reading[key] > baseline[key] ? '+' : ''}${reading[key] - baseline[key]}` : null;
