// Stored array order is the submission order, including attempts with equal timestamps.
// Feedback availability follows the existing Check response flow; reading is not recorded.
export default function Shift6ResponseHistory({ variation, attempts }) {
  const history = attempts.filter(attempt => attempt.variation === variation.id);
  if (history.length < 2) return null;
  const title = attempt => variation.options.find(option => option.id === attempt.call)?.title || 'Response unavailable';
  return <section aria-label="Response history">
    <p><strong>First response (attempt 1):</strong> {title(history[0])}</p>
    <p><strong>Latest response (attempt {history.length}):</strong> {title(history.at(-1))}</p>
    <p className="mst-device">The latest response came after earlier feedback was available. This record does not show whether that feedback was read. Responses use current option wording. These are guided practice responses.</p>
  </section>;
}
