import { useEffect, useState } from "react";
import { trackEvent } from "../analytics";
import TeachMePanel from "./TeachMePanel.jsx";
import "./priority-map.css";

function plain(text = "") {
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
}

function bullets(content = "") {
  return content.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => line.replace(/^[-•*›]\s+/, ""));
}

function ActionSection({ title, eyebrow, content, category }) {
  const items = bullets(content);
  if (!items.length) return null;
  return <section className="priority-action-section" onClick={() => trackEvent("priority_map_section_engaged", { section: category })}>
    <span>{eyebrow}</span><h3>{title}</h3>
    <ul>{items.map((item, index) => <li key={index}>{plain(item)}</li>)}</ul>
  </section>;
}

function Relevance({ value }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("high") ? "high" : normalized.includes("clarification") ? "clarify" : "important";
  return <span className={`priority-relevance priority-relevance--${tone}`}>{value}</span>;
}

export default function PriorityMap({ result, onRequestTeachMe, variant = "primary" }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [teachOpen, setTeachOpen] = useState(false);
  const priorities = result.priorities.slice(0, 3);
  const primary = priorities[0];
  const getSection = (title) => result.sections.find((section) => section.title === title)?.content || "";

  useEffect(() => {
    trackEvent("priority_map_viewed", { urgency: result.urgencyLevel || "unknown", priority_count: priorities.length });
  }, [priorities.length, result.urgencyLevel]);

  if (!primary) return null;
  const isClarification = variant === "clarification";
  return <div className={`priority-map${isClarification ? " priority-map--clarification" : ""}`}>
    <header className="priority-map__header">
      <div><span>{isClarification ? "Focused follow-up" : "Priority Map"}</span><h2>{isClarification ? "Clarification" : "What matters first"}</h2></div>
      <div className={`priority-map__urgency priority-map__urgency--${(result.urgencyLevel || "low").toLowerCase()}`}><span aria-hidden="true" />Urgency: {result.urgencyLevel || "Not classified"}</div>
    </header>

    {result.urgent && <div className="priority-map__urgent">{plain(result.urgent)}</div>}

    <article className="priority-primary">
      <div className="priority-primary__title"><span>{primary.rank}</span><div><h3>{plain(primary.label)}</h3><Relevance value={primary.relevance} /></div></div>
      {primary.observed.length > 0 && <div className="priority-observed"><span>Reported / observed</span><small>From the Snapshot you entered</small><ul>{primary.observed.map((item, index) => <li key={index}>{plain(item)}</li>)}</ul></div>}
      {primary.interpretation && <div className="priority-interpretation"><span>Clinical Edge interpretation</span><small>Reasoning, not a confirmed diagnosis</small><p>{plain(primary.interpretation)}</p></div>}
      {primary.assessNow.length > 0 && <div className="priority-assess"><span>Assess now</span><ul>{primary.assessNow.map((item, index) => <li key={index}>{plain(item)}</li>)}</ul></div>}
    </article>

    {priorities.length > 1 && <section className="priority-secondary">
      <span className="priority-map__eyebrow">Additional priorities</span>
      {priorities.slice(1).map((priority) => <details key={priority.rank} onToggle={(event) => { if (event.currentTarget.open) trackEvent("priority_map_secondary_priority_viewed", { rank: priority.rank }); }}>
        <summary><span><strong>{priority.rank} · {plain(priority.label)}</strong><small>View supporting reasoning</small></span><Relevance value={priority.relevance} /></summary>
        <div className="priority-secondary__content">
          {priority.observed.length > 0 && <div><span>Reported / observed</span>{priority.observed.map((item, index) => <small key={index}>{plain(item)}</small>)}</div>}
          {priority.interpretation && <p><strong>Interpretation</strong>{plain(priority.interpretation)}</p>}
          {priority.assessNow.length > 0 && <div><span>Assess now</span>{priority.assessNow.map((item, index) => <small key={index}>{plain(item)}</small>)}</div>}
        </div>
      </details>)}
    </section>}

    <div className="priority-action-grid">
      <ActionSection eyebrow="Direction" title="Watch & trend" category="watch_trend" content={getSection("Monitor and trend")} />
      <ActionSection eyebrow="Clarify" title="Helpful to clarify" category="missing_information" content={getSection("Missing information")} />
      <ActionSection eyebrow="Escalate" title="Escalation cues" category="escalation_cues" content={getSection("Escalation triggers")} />
    </div>

    <section className="priority-reasoning">
      <button type="button" aria-expanded={reasoningOpen} onClick={() => { setReasoningOpen((value) => !value); trackEvent("priority_map_section_engaged", { section: "possible_patterns" }); }}><span><small>Reasoning</small>Possible contributors</span><span aria-hidden="true">{reasoningOpen ? "−" : "+"}</span></button>
      {reasoningOpen && <div><p className="priority-uncertainty">These are possibilities, not diagnoses. Additional assessment helps distinguish among them.</p><ul>{bullets(getSection("Possible patterns")).map((item, index) => <li key={index}>{plain(item)}</li>)}</ul></div>}
    </section>

    {!isClarification && <section className="priority-learning">
      <button type="button" aria-expanded={teachOpen} onClick={() => {
        if (!teachOpen) trackEvent("teach_me_opened");
        setTeachOpen(!teachOpen);
      }}><span><small>Learn from this Priority Map</small><strong>Teach me why</strong><em>Understand why this pattern matters.</em></span><span aria-hidden="true">{teachOpen ? "−" : "+"}</span></button>
      {teachOpen && <TeachMePanel onLoad={onRequestTeachMe} onClose={() => setTeachOpen(false)} />}
    </section>}
  </div>;
}
