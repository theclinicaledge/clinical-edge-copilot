import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import "./teach-me.css";

function durationBucket(startedAt) {
  const seconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  if (seconds < 30) return "under_30s";
  if (seconds < 75) return "30_to_74s";
  return "75s_plus";
}

function Question({ data, submitted, selected, onSelect, onSubmit, label }) {
  const correct = submitted && selected === data.correctChoiceId;
  return <section className="teach-question">
    <span className="teach-eyebrow">{label}</span>
    <h3>{data.stem}</h3>
    <div className="teach-choices" role="radiogroup" aria-label={label}>
      {data.choices.map((choice) => {
        const isSelected = selected === choice.id;
        const isCorrect = submitted && choice.id === data.correctChoiceId;
        return <button type="button" role="radio" aria-checked={isSelected} disabled={submitted} className={`${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""}`} key={choice.id} onClick={() => onSelect(choice.id)}><span>{choice.id.toUpperCase()}</span>{choice.label}</button>;
      })}
    </div>
    {!submitted && <button type="button" className="teach-commit" disabled={!selected} onClick={onSubmit}>Commit answer</button>}
    {submitted && <div className={`teach-feedback ${correct ? "is-correct" : "is-not-quite"}`}><span className="teach-eyebrow">Explanation</span><strong>{correct ? "Correct" : "Not quite"}</strong><p>{data.explanation}</p></div>}
  </section>;
}

export default function TeachMePanel({ onLoad, onClose }) {
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [applySelected, setApplySelected] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);
  const completedRef = useRef(false);
  const startedAtRef = useRef(0);
  const abandonTimerRef = useRef(null);

  useEffect(() => {
    let active = true;
    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    if (abandonTimerRef.current) {
      clearTimeout(abandonTimerRef.current);
      abandonTimerRef.current = null;
    }
    onLoad().then((nextLesson) => {
      if (!active) return;
      setLesson(nextLesson);
      setLoading(false);
      if (nextLesson?.active) trackEvent("teach_me_quick_check_shown", { domain: nextLesson.domain, concept_id: nextLesson.conceptId, question_type: nextLesson.questionType });
      else trackEvent("teach_me_fallback_viewed", { domain: nextLesson?.domain || "unknown", concept_id: nextLesson?.conceptId || "unknown" });
    }).catch(() => { if (active) { setError(true); setLoading(false); } });
    return () => {
      active = false;
      abandonTimerRef.current = setTimeout(() => {
        if (!completedRef.current) {
          trackEvent("teach_me_abandoned", { completion: false, duration_bucket: durationBucket(startedAt) });
        }
      }, 0);
    };
  }, [onLoad]);

  const submitPrimary = () => {
    if (!selected || submitted) return;
    const correct = selected === lesson.question.correctChoiceId;
    setSubmitted(true);
    trackEvent("teach_me_quick_check_answered", { domain: lesson.domain, concept_id: lesson.conceptId, question_type: lesson.questionType, correct });
    trackEvent("teach_me_explanation_viewed", { domain: lesson.domain, concept_id: lesson.conceptId });
    if (lesson.application) trackEvent("teach_me_apply_shown", { domain: lesson.domain, concept_id: lesson.conceptId });
  };

  const submitApply = () => {
    if (!applySelected || applySubmitted) return;
    const correct = applySelected === lesson.application.correctChoiceId;
    setApplySubmitted(true);
    trackEvent("teach_me_apply_answered", { domain: lesson.domain, concept_id: lesson.conceptId, correct });
  };

  const complete = () => {
    completedRef.current = true;
    trackEvent("teach_me_completed", { domain: lesson.domain, concept_id: lesson.conceptId, question_type: lesson.questionType || "fallback", completion: true, duration_bucket: durationBucket(startedAtRef.current) });
    onClose();
  };

  if (loading) return <div className="teach-panel teach-loading" aria-live="polite"><span>Teach Me</span><strong>Preparing a quick teaching check…</strong></div>;
  if (error || !lesson) return <div className="teach-panel"><span className="teach-eyebrow">Teach Me</span><h3>Learning check unavailable</h3><p className="teach-muted">The Priority Map remains available. Try opening Teach Me again in a moment.</p><button type="button" className="teach-return" onClick={onClose}>Return to Priority Map</button></div>;
  if (!lesson.active) return <div className="teach-panel teach-fallback">
    <span className="teach-eyebrow">Key idea</span><h3>{lesson.conceptLabel}</h3><p>{lesson.keyIdea}</p>
    <h4>Why it matters</h4><p>{lesson.whyItMatters}</p><h4>In this situation</h4><p>{lesson.scenarioConnection}</p>
    <div className="teach-tags">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    <button type="button" className="teach-return" onClick={complete}>Concept reviewed · Return to Priority Map</button>
  </div>;

  const completeReady = submitted && (!lesson.application || applySubmitted);
  return <div className="teach-panel">
    <header className="teach-header"><div><span className="teach-eyebrow">Teach Me</span><h2>{lesson.conceptLabel}</h2></div><button type="button" onClick={onClose} aria-label="Return to Priority Map">×</button></header>
    <Question label="Quick check" data={lesson.question} selected={selected} submitted={submitted} onSelect={setSelected} onSubmit={submitPrimary} />
    {submitted && <section className="teach-scenario"><span className="teach-eyebrow">In this situation</span><p>{lesson.scenarioConnection}</p></section>}
    {submitted && lesson.application && <Question label="Apply it" data={lesson.application} selected={applySelected} submitted={applySubmitted} onSelect={setApplySelected} onSubmit={submitApply} />}
    {completeReady && <section className="teach-complete"><span className="teach-eyebrow">Concept reviewed</span><h3>{lesson.conceptLabel}</h3><div className="teach-tags">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button type="button" className="teach-return" onClick={complete}>Return to Priority Map</button></section>}
  </div>;
}
