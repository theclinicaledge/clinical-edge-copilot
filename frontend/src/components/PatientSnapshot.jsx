import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { serializePatientSnapshot } from "./patientSnapshotModel";
import { PERFUSION_CORE_FIELDS, PERFUSION_MODULES, QUICK_CAPTURE_FIELDS } from "./patientSnapshotSchema";
import { clearExtractionItem, extractRapidCapture, formatExtractionItem, setSnapshotPath } from "./rapidCaptureExtractor";
import "./patient-snapshot.css";

const SIGNALS = [
  ["off", "Something feels off", "A change you cannot yet classify"],
  ["perfusion", "BP / perfusion", "Pressure, MAP, or circulation"],
  ["breathing", "Breathing", "Oxygenation or respiratory effort"],
  ["heart", "Heart / rhythm", "Rate, rhythm, or cardiac change"],
  ["neuro", "Neuro", "Mental status or neurologic change"],
  ["urine", "Urine output", "Meaningful output change"],
  ["bleeding", "Bleeding", "Known or suspected blood loss"],
  ["labs", "Labs / glucose", "A changing lab or glucose"],
  ["pain", "Pain / other", "Pain or another change"],
];

const CARE_SETTINGS = ["Med-Surg", "PCU / Step-down", "ICU", "CTICU", "ED / Other"];
const CONTEXTS = ["Post-op", "Cardiac", "Respiratory", "Infection / sepsis concern", "Neurologic", "Renal", "Other"];

const FIELD_DEFS = {
  bp: { label: "BP", unit: "mmHg", trend: true, placeholder: "88/50" },
  map: { label: "MAP", unit: "mmHg", trend: true, placeholder: "61" },
  hr: { label: "Heart rate", unit: "bpm", trend: true, placeholder: "112" },
  rr: { label: "Respiratory rate", unit: "/min", trend: true, placeholder: "26" },
  spo2: { label: "SpO₂", unit: "%", trend: true, placeholder: "91" },
  oxygen: { label: "Oxygen support", unit: "", trend: true, placeholder: "2 L NC" },
  temp: { label: "Temperature", unit: "°C", trend: true, placeholder: "38.2" },
};

const SIGNAL_FIELDS = {
  off: ["bp", "map", "hr", "rr", "spo2", "oxygen", "temp", "mental", "urineState", "perfusionState", "wob"],
  perfusion: [],
  breathing: ["spo2", "oxygen", "rr", "wob", "mental", "respFindings"],
  heart: ["hr", "rhythm", "bp", "map", "perfusionState", "chestPain"],
  neuro: ["mental", "loc", "focal", "bp", "map", "glucose", "spo2"],
  urine: ["urineState", "bp", "map", "perfusionState", "fluidContext", "foley"],
  bleeding: ["bleedingSource", "drainage", "bp", "map", "hr", "perfusionState", "hgb"],
  labs: ["labName", "labEarlier", "labNow"],
  pain: ["painDetail"],
};

const SELECT_FIELDS = {
  mental: ["Mental status", ["Baseline", "Changed"]],
  urineState: ["Urine output", ["Stable", "Decreasing", "Minimal / none"]],
  perfusionState: ["Perfusion", ["No obvious change", "Cool / clammy", "Weak pulses", "Delayed capillary refill", "Other"]],
  wob: ["Work of breathing", ["No obvious change", "Increased", "Markedly increased"]],
  bleedingState: ["Bleeding concern", ["None observed", "Possible", "Known"]],
  loc: ["Level of consciousness", ["Baseline", "More drowsy", "Difficult to arouse"]],
  focal: ["Focal neurologic change", ["None observed", "Possible", "Present"]],
  chestPain: ["Chest discomfort", ["None reported", "Present", "Unable to assess"]],
  foley: ["Foley", ["Not present", "Present"]],
};

const TEXT_FIELDS = {
  respFindings: ["Respiratory findings", "Breath sounds, cough, secretions"],
  rhythm: ["Rhythm change", "What changed or what the monitor shows"],
  glucose: ["Glucose", "Current value if known"],
  fluidContext: ["Fluid context", "Intake, losses, edema, recent fluids"],
  bleedingSource: ["Source / type", "If known"],
  drainage: ["Drainage / output trend", "Earlier to now, if known"],
  hgb: ["Hgb / Hct trend", "Earlier to now, if known"],
  labName: ["Lab or glucose", "Potassium, lactate, glucose..."],
  labEarlier: ["Earlier", "Optional"],
  labNow: ["Now", "Optional"],
  painDetail: ["Pain or other change", "What changed?"],
};

const OPTIONAL_SECTIONS = [
  ["vitals", "Vitals"], ["assessment", "Assessment"], ["labs", "Labs"],
  ["support", "Meds & support"], ["devices", "Devices"], ["advanced", "Advanced"],
];

const LABS = ["Hgb / Hct", "WBC", "Lactate", "Glucose", "Potassium", "Magnesium", "Sodium", "Creatinine", "BUN", "ABG / VBG", "Troponin"];
const SUPPORT = ["Oxygen support", "Vasoactive / inotropic support", "Sedation", "Insulin", "Other support"];
const DEVICES = ["Arterial line", "Central line", "Foley", "Chest tube / drain", "Pacemaker", "Mechanical ventilation", "Invasive hemodynamic monitoring", "Dialysis / CRRT"];

const EMPTY = { signals: ["off"], setting: "", contexts: [], values: {}, optional: {}, units: {}, notes: "" };
const SIGNAL_LABELS = Object.fromEntries(SIGNALS.map(([id, label]) => [id, label]));
const REVIEW_FIELD_DEFS = Object.fromEntries([
  ...Object.entries(FIELD_DEFS).map(([id, definition]) => [id, { id, type: "trend", ...definition }]),
  ...PERFUSION_CORE_FIELDS.map((definition) => [definition.id, definition]),
  ...PERFUSION_MODULES.flatMap((module) => module.fields.filter((field) => field.type !== "repeatable").map((field) => [field.id, field])),
]);
const REVIEW_VALUE_LABELS = {
  ...Object.fromEntries(Object.entries(SELECT_FIELDS).map(([id, [label]]) => [id, label])),
  ...Object.fromEntries(Object.entries(TEXT_FIELDS).map(([id, [label]]) => [id, label])),
  perfusionFindings: "Perfusion",
};
const REVIEW_MODULES = Object.fromEntries(PERFUSION_MODULES.map((module) => [module.id, module]));
const REVIEW_OPTIONAL_LABELS = { vitals: "Vitals", assessment: "Assessment", labs: "Labs", support: "Meds & support", devices: "Devices", advanced: "Advanced / ICU" };

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function countStructuredDetails(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + (countStructuredDetails(item) ? 1 : 0), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((sum, item) => sum + countStructuredDetails(item), 0);
  return value !== "" && value !== null && value !== undefined ? 1 : 0;
}

function formatReviewValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value);
}

function formatRepeatableReview(definition, items) {
  return (items || []).filter((item) => countStructuredDetails(item)).map((item, index) => ({
    label: `${definition.itemLabel} ${index + 1}`,
    value: definition.fields.filter((field) => item[field.id]).map((field) => `${field.label}: ${item[field.id]}`).join(" · "),
  }));
}

function buildSnapshotReview(snapshot) {
  const findings = [];
  const trends = [];
  const unchanged = [];
  const states = [];
  const additional = [];
  const handled = new Set();

  Object.entries(REVIEW_FIELD_DEFS).forEach(([id, definition]) => {
    if (definition.type !== "trend") return;
    const earlier = snapshot.values[`${id}Earlier`];
    const now = snapshot.values[`${id}Now`];
    const state = snapshot.values[`${id}State`];
    const effectiveUnit = Object.prototype.hasOwnProperty.call(snapshot.units || {}, id) ? snapshot.units[id] : definition.unit;
    const unit = effectiveUnit ? ` ${effectiveUnit}` : "";
    if (earlier && now && String(earlier).trim() === String(now).trim()) unchanged.push({ label: definition.label, value: `${now}${unit}` });
    else if (earlier && now) trends.push({ label: definition.label, value: `Earlier ${earlier}${unit} → Now ${now}${unit}` });
    else if (now) findings.push({ label: definition.label, value: `Now ${now}${unit}` });
    else if (earlier) findings.push({ label: definition.label, value: `Earlier ${earlier}${unit}; now not entered` });
    else if (state) states.push({ label: definition.label, value: state });
    handled.add(`${id}Earlier`);
    handled.add(`${id}Now`);
    handled.add(`${id}State`);
  });

  const urineAmount = snapshot.values.urineAmount;
  const urineIntervalValue = snapshot.values.urineIntervalValue;
  const urineIntervalUnit = snapshot.values.urineIntervalUnit || "hour";
  const urineRate = snapshot.values.urineRate;
  const urineState = snapshot.values.urineState;
  if (urineAmount) findings.push({ label: "Urine output", value: `${urineAmount} mL${urineIntervalValue ? ` over ${urineIntervalValue} ${urineIntervalUnit}${String(urineIntervalValue) === "1" ? "" : "s"}` : " · interval not entered"}` });
  else if (urineRate) findings.push({ label: "Urine output", value: `${urineRate} mL/hr · documented rate` });
  else if (["Unknown", "Not assessed"].includes(urineState)) states.push({ label: "Urine output", value: urineState });
  else if (urineState) findings.push({ label: "Urine output", value: urineState });
  ["urineAmount", "urineIntervalValue", "urineIntervalUnit", "urineRate", "urineState"].forEach((key) => handled.add(key));

  Object.entries(snapshot.values || {}).forEach(([id, value]) => {
    if (!value || handled.has(id)) return;
    findings.push({ label: REVIEW_VALUE_LABELS[id] || REVIEW_FIELD_DEFS[id]?.label || id, value: String(value) });
  });

  Object.entries(snapshot.optional || {}).forEach(([sectionId, data]) => {
    if (!data || !countStructuredDetails(data)) return;
    const module = REVIEW_MODULES[sectionId];
    if (module) {
      module.fields.forEach((definition) => {
        const value = data[definition.id];
        if (!countStructuredDetails(value)) return;
        if (definition.type === "repeatable") additional.push(...formatRepeatableReview(definition, value).map((row) => ({ ...row, group: module.label })));
        else additional.push({ group: module.label, label: definition.label, value: formatReviewValue(value) });
      });
      return;
    }
    if (data.selected?.length) additional.push({ group: REVIEW_OPTIONAL_LABELS[sectionId] || sectionId, label: "Selected", value: data.selected.join(", ") });
    if (data.detail) additional.push({ group: REVIEW_OPTIONAL_LABELS[sectionId] || sectionId, label: "Context", value: data.detail });
  });

  return {
    signals: snapshot.signals.map((id) => SIGNAL_LABELS[id]).filter(Boolean),
    context: [snapshot.setting && { label: "Care setting", value: snapshot.setting }, snapshot.contexts?.length && { label: "Clinical context", value: snapshot.contexts.join(", ") }].filter(Boolean),
    findings,
    trends,
    unchanged,
    states,
    additional,
    notes: snapshot.notes?.trim() || "",
  };
}

function ReviewRows({ rows }) {
  if (!rows.length) return null;
  return <dl>{rows.map((row, index) => <div key={`${row.group || "row"}-${row.label}-${index}`}>{row.group && <small>{row.group}</small>}<dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>;
}

function SemanticSnapshotReview({ snapshot, compact = false }) {
  const review = useMemo(() => buildSnapshotReview(snapshot), [snapshot]);
  const groups = [
    ["Current findings", review.findings],
    ["Earlier → Now", review.trends],
    ["Unchanged", review.unchanged],
    ["Explicit states", review.states],
    ["Additional detail", review.additional],
  ];
  return <div className={`snapshot-review-content${compact ? " snapshot-review-content--compact" : ""}`}>
    <section><h3>What changed</h3><p>{review.signals.join(" · ") || "No change selected"}</p></section>
    {review.context.length > 0 && <section><h3>Context</h3><ReviewRows rows={review.context} /></section>}
    {groups.map(([heading, rows]) => rows.length > 0 && <section key={heading}><h3>{heading}</h3><ReviewRows rows={rows} /></section>)}
    {review.notes && <section><h3>Additional context</h3><p>{review.notes}</p></section>}
  </div>;
}

export function SubmittedSnapshotSummary({ snapshot, serializedSnapshot, state }) {
  if (!snapshot || !serializedSnapshot) return null;
  const signalLabels = snapshot.signals.map((id) => SIGNAL_LABELS[id]).filter(Boolean);
  return <section className={`submitted-snapshot submitted-snapshot--${state}`} aria-label="Submitted Snapshot">
    <div className="submitted-snapshot__status">
      <span aria-hidden="true">✓</span>
      <div><small>Snapshot submitted</small><strong>{signalLabels.join(" · ") || "Clinical change"}</strong></div>
    </div>
    <div className="submitted-snapshot__meta">
      {snapshot.setting && <span>{snapshot.setting}</span>}
      <span>Ready for review</span>
    </div>
    <details className="submitted-snapshot__details">
      <summary>View submitted Snapshot</summary>
      <SemanticSnapshotReview snapshot={snapshot} compact />
    </details>
  </section>;
}

function TrendField({ id, definition, values, onChange }) {
  return <fieldset className="snapshot-field snapshot-trend">
    <legend>{definition.label} {definition.unit && <span>{definition.unit}</span>}</legend>
    <label><span>Earlier</span><input aria-label={`${definition.label} previous`} value={values[`${id}Earlier`] || ""} onChange={(e) => onChange(`${id}Earlier`, e.target.value)} placeholder="Optional" /></label>
    <span className="snapshot-arrow" aria-hidden="true">→</span>
    <label><span>Now</span><input aria-label={`${definition.label} current`} value={values[`${id}Now`] || ""} onChange={(e) => onChange(`${id}Now`, e.target.value)} placeholder={definition.placeholder || "Optional"} /></label>
    <label className="snapshot-field-state"><span>If unavailable</span><select aria-label={`${definition.label} state`} value={values[`${id}State`] || ""} onChange={(e) => onChange(`${id}State`, e.target.value)}><option value="">No explicit state</option><option value="Unknown">Unknown</option><option value="Not assessed">Not assessed</option></select></label>
  </fieldset>;
}

function QuickTrendField({ definition, values, onChange, onActivate }) {
  const id = definition.id;
  const earlier = values[`${id}Earlier`] || "";
  const current = values[`${id}Now`] || "";
  const state = values[`${id}State`] || "";
  const [showEarlier, setShowEarlier] = useState(Boolean(earlier));
  const updateMeasurement = (key, value) => {
    onActivate(definition.signal);
    onChange(key, value);
    if (value && state) onChange(`${id}State`, "");
  };
  const updateState = (value) => {
    onActivate(definition.signal);
    onChange(`${id}State`, value);
    if (value) {
      onChange(`${id}Earlier`, "");
      onChange(`${id}Now`, "");
      setShowEarlier(false);
    }
  };
  return <fieldset className="quick-measurement">
    <legend>{definition.shortLabel || definition.label}<span>{definition.unit}</span></legend>
    <div className="quick-measurement__current">
      <input aria-label={`${definition.label} current`} inputMode={definition.inputMode || "decimal"} value={current} onChange={(event) => updateMeasurement(`${id}Now`, event.target.value)} placeholder={definition.placeholder} />
      {!showEarlier && <button type="button" onClick={() => setShowEarlier(true)}>+ Earlier</button>}
      <select aria-label={`${definition.label} state`} value={state} onChange={(event) => updateState(event.target.value)}><option value="">State</option><option value="Unknown">Unknown</option><option value="Not assessed">Not assessed</option></select>
    </div>
    {showEarlier && <div className="quick-measurement__earlier"><label>Earlier<input aria-label={`${definition.label} previous`} inputMode={definition.inputMode || "decimal"} value={earlier} onChange={(event) => updateMeasurement(`${id}Earlier`, event.target.value)} placeholder="Optional" /></label><button type="button" aria-label={`Remove ${definition.label} earlier value`} onClick={() => { onChange(`${id}Earlier`, ""); setShowEarlier(false); }}>×</button></div>}
  </fieldset>;
}

function UrineOutputField({ values, onChange, onActivate }) {
  const inferredMode = values.urineRate ? "rate" : values.urineState ? "qualitative" : "amount";
  const [mode, setMode] = useState(inferredMode);
  const setValue = (key, value) => { onActivate("urine"); onChange(key, value); };
  const chooseMode = (next) => {
    setMode(next);
    if (next !== "amount") ["urineAmount", "urineIntervalValue", "urineIntervalUnit"].forEach((key) => onChange(key, ""));
    if (next !== "rate") onChange("urineRate", "");
    if (next !== "qualitative") onChange("urineState", "");
  };
  return <fieldset className="quick-clinical-field urine-output-field">
    <legend>Urine output</legend>
    <p className="urine-output-guidance">For an amount, enter both what was measured and the collection period.</p>
    <div className="snapshot-segmented" aria-label="Urine output entry type">
      <button type="button" aria-pressed={mode === "amount"} onClick={() => chooseMode("amount")}>Amount</button>
      <button type="button" aria-pressed={mode === "rate"} onClick={() => chooseMode("rate")}>Rate</button>
      <button type="button" aria-pressed={mode === "qualitative"} onClick={() => chooseMode("qualitative")}>Status</button>
    </div>
    {mode === "amount" && <><div className="urine-amount-row"><label>Amount<input aria-label="Urine output amount" inputMode="numeric" value={values.urineAmount || ""} onChange={(event) => setValue("urineAmount", event.target.value)} placeholder="20" /><small>mL</small></label><span>over</span><label>Collection period<input aria-label="Urine output interval" inputMode="decimal" value={values.urineIntervalValue || ""} onChange={(event) => setValue("urineIntervalValue", event.target.value)} placeholder="1" /></label><select aria-label="Urine output interval unit" value={values.urineIntervalUnit || "hour"} onChange={(event) => setValue("urineIntervalUnit", event.target.value)}><option value="hour">hour</option><option value="minute">min</option></select></div>{values.urineAmount && !values.urineIntervalValue && <p className="urine-interval-prompt" role="status">Add the collection period, for example 1 hour.</p>}</>}
    {mode === "rate" && <label className="urine-rate-row">Documented rate<span><input aria-label="Urine output documented rate" inputMode="decimal" value={values.urineRate || ""} onChange={(event) => setValue("urineRate", event.target.value)} placeholder="20" /> mL/hr</span></label>}
    {mode === "qualitative" && <div className="snapshot-choice-row">{["Decreasing", "Minimal", "None"].map((option) => <button type="button" key={option} aria-pressed={values.urineState === option} onClick={() => setValue("urineState", values.urineState === option ? "" : option)}>{option}</button>)}</div>}
    <label className="snapshot-field-state snapshot-choice-state"><span>If unavailable</span><select aria-label="Urine output state" value={["Unknown", "Not assessed"].includes(values.urineState) ? values.urineState : ""} onChange={(event) => { chooseMode("qualitative"); setValue("urineState", event.target.value); }}><option value="">No explicit state</option><option value="Unknown">Unknown</option><option value="Not assessed">Not assessed</option></select></label>
  </fieldset>;
}

function ChoiceField({ id, label, options, value, onChange }) {
  const renderedOptions = [...new Set(options.filter((option) => !["Unknown", "Not assessed"].includes(option)))];
  return <fieldset className="snapshot-field snapshot-choice-field">
    <legend>{label}</legend>
    <div className="snapshot-choice-row">{renderedOptions.map((option) => <button type="button" key={option} aria-pressed={value === option} onClick={() => onChange(id, value === option ? "" : option)}>{option}</button>)}</div>
    <label className="snapshot-field-state snapshot-choice-state"><span>If unavailable</span><select aria-label={`${label} state`} value={["Unknown", "Not assessed"].includes(value) ? value : ""} onChange={(e) => onChange(id, e.target.value)}><option value="">No explicit state</option><option value="Unknown">Unknown</option><option value="Not assessed">Not assessed</option></select></label>
  </fieldset>;
}

function MultiChoiceField({ id, label, options, values, onChange }) {
  const selected = Array.isArray(values) ? values : values ? [values] : [];
  const unavailable = selected.find((value) => ["Unknown", "Not assessed"].includes(value)) || "";
  const choose = (option) => onChange(id, toggle(selected.filter((value) => !["Unknown", "Not assessed"].includes(value)), option));
  return <fieldset className="snapshot-field snapshot-choice-field">
    <legend>{label}<span> Select all that apply</span></legend>
    <div className="snapshot-choice-row">{options.map((option) => <button type="button" key={option} aria-pressed={selected.includes(option)} onClick={() => choose(option)}>{option}</button>)}</div>
    <label className="snapshot-field-state snapshot-choice-state"><span>If unavailable</span><select aria-label={`${label} state`} value={unavailable} onChange={(event) => onChange(id, event.target.value ? [event.target.value] : [])}><option value="">No explicit state</option><option value="Unknown">Unknown</option><option value="Not assessed">Not assessed</option></select></label>
  </fieldset>;
}

function TextField({ id, definition, values, onChange }) {
  return <label className="snapshot-field snapshot-text-field">{definition.label}{definition.unit && <span>{definition.unit}</span>}<input value={values[id] || ""} onChange={(e) => onChange(id, e.target.value)} placeholder={definition.placeholder || "Optional"} /></label>;
}

function RepeatableField({ moduleId, definition, items, onChange }) {
  const update = (index, key, value) => onChange(moduleId, definition.id, items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const add = () => onChange(moduleId, definition.id, [...items, {}]);
  const remove = (index) => onChange(moduleId, definition.id, items.filter((_, itemIndex) => itemIndex !== index));
  return <div className="snapshot-repeatable">
    {items.map((item, index) => <fieldset key={index}><legend>{definition.itemLabel} {index + 1}</legend><div className="snapshot-repeatable-grid">{definition.fields.map((field) => <label key={field.id}>{field.label}<input value={item[field.id] || ""} onChange={(e) => update(index, field.id, e.target.value)} placeholder={field.placeholder || "Optional"} /></label>)}</div><button type="button" className="snapshot-remove-row" onClick={() => remove(index)}>Remove {definition.itemLabel.toLowerCase()}</button></fieldset>)}
    <button type="button" className="snapshot-add-row" onClick={add}>+ Add {definition.itemLabel.toLowerCase()}</button>
  </div>;
}

function SchemaField({ moduleId, definition, values, onValueChange, moduleData, onModuleChange }) {
  if (definition.type === "trend") return <TrendField id={definition.id} definition={definition} values={values} onChange={onValueChange} />;
  if (definition.type === "choice") return <ChoiceField id={definition.id} label={definition.label} options={definition.options} value={values[definition.id] || ""} onChange={onValueChange} />;
  if (definition.type === "repeatable") return <RepeatableField moduleId={moduleId} definition={definition} items={moduleData[definition.id] || []} onChange={onModuleChange} />;
  return <TextField id={definition.id} definition={definition} values={values} onChange={onValueChange} />;
}

function ClinicalModule({ module, open, onToggle, data, values, onValueChange, onModuleChange }) {
  const trendDetailCount = module.fields.filter((field) => field.type === "trend").reduce((count, field) => count + [values[`${field.id}Earlier`], values[`${field.id}Now`], values[`${field.id}State`]].filter(Boolean).length, 0);
  const detailCount = countStructuredDetails(data) + trendDetailCount;
  const summaryParts = [];
  module.fields.forEach((field) => {
    if (field.type === "trend") {
      const earlier = values[`${field.id}Earlier`];
      const now = values[`${field.id}Now`];
      if (earlier || now) summaryParts.push(`${field.label} ${earlier && now ? `${earlier} → ${now}` : now || earlier}`);
    } else if (field.type === "repeatable") {
      (data[field.id] || []).filter((entry) => countStructuredDetails(entry)).forEach((entry) => summaryParts.push(entry.medication || entry.type || entry.name || field.label));
    }
  });
  const summary = summaryParts.slice(0, 3).join(" • ");
  return <section className="snapshot-optional-section">
    <button type="button" className="snapshot-disclosure" aria-expanded={open} onClick={onToggle}><span><strong>{module.label}</strong><small>{detailCount ? summary || "Added · open to review or edit" : module.description}</small></span><span aria-hidden="true">{open ? "−" : detailCount ? "Edit" : "+"}</span></button>
    {open && <div className="snapshot-module-grid">{module.fields.map((field) => <SchemaField key={field.id} moduleId={module.id} definition={field} values={values} onValueChange={onValueChange} moduleData={data} onModuleChange={onModuleChange} />)}</div>}
  </section>;
}

function RapidConfirmation({ extraction, snapshot, editingItem, onEdit, onUpdate, onDelete, onResolve, onManualEdit, onBack, onConfirm }) {
  return <section className="rapid-confirmation" aria-labelledby="rapid-confirmation-title">
    <header><span>Structured draft</span><h2 id="rapid-confirmation-title">I captured</h2><p>Verify the reported details. Nothing is sent for clinical reasoning until you confirm.</p></header>
    <div className="rapid-confirmation__list" aria-label="Captured findings">
      {extraction.items.map((entry) => <article key={entry.id}>
        <div><strong>{entry.label}</strong><span>{formatExtractionItem(entry, snapshot)}</span></div>
        <div className="rapid-confirmation__actions"><button type="button" onClick={() => onEdit(editingItem === entry.id ? null : entry.id)}>{editingItem === entry.id ? "Done" : "Edit"}</button><button type="button" onClick={() => onDelete(entry)}>Delete</button></div>
        {editingItem === entry.id && <div className="rapid-confirmation__editor">{entry.fields.map((field) => <label key={field.path}>{field.label}<input value={field.type === "list" ? (field.path.split(".").reduce((value, key) => value?.[key], snapshot) || []).join(", ") : field.path.split(".").reduce((value, key) => value?.[key], snapshot) || ""} onChange={(event) => onUpdate(field.path, field.type === "list" ? event.target.value.split(",").map((value) => value.trim()).filter(Boolean) : event.target.value)} /></label>)}</div>}
      </article>)}
    </div>
    {extraction.needsReview.length > 0 && <section className="rapid-needs-review" aria-labelledby="needs-review-title"><h3 id="needs-review-title">Needs review</h3><p>These words were not mapped because doing so would require interpretation.</p>{extraction.needsReview.map((entry) => <article key={entry.id}><span>{entry.text}</span><div><button type="button" onClick={() => onResolve(entry, "context")}>Keep as context</button><button type="button" onClick={() => onResolve(entry, "dismiss")}>Dismiss</button></div></article>)}</section>}
    <div className="rapid-confirmation__footer"><button type="button" onClick={onBack}>Back to narrative</button><button type="button" onClick={onManualEdit}>Add missing finding</button><button type="button" className="rapid-confirm" disabled={extraction.needsReview.length > 0} onClick={onConfirm}>Confirm Snapshot</button></div>
  </section>;
}

function OptionalSection({ id, label, open, onToggle, data, onChange, vitalIds, values, onValueChange }) {
  const toggleValue = (key, value) => onChange(id, { ...data, [key]: toggle(data[key] || [], value) });
  return <section className="snapshot-optional-section">
    <button type="button" className="snapshot-disclosure" aria-expanded={open} onClick={onToggle}><span>{label}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button>
    {open && <div className="snapshot-optional-body">
      {id === "vitals" && <>{vitalIds.length ? vitalIds.map((vitalId) => <TrendField key={vitalId} id={vitalId} definition={FIELD_DEFS[vitalId]} values={values} onChange={onValueChange} />) : <p>Relevant vital trends are already shown in your adaptive Snapshot.</p>}</>}
      {id === "assessment" && <label>Additional assessment<input value={data.detail || ""} onChange={(e) => onChange(id, { ...data, detail: e.target.value })} placeholder="Focused bedside finding" /></label>}
      {id === "labs" && <><div className="snapshot-token-grid">{LABS.map((item) => <button type="button" key={item} aria-pressed={(data.selected || []).includes(item)} onClick={() => toggleValue("selected", item)}>{item}</button>)}</div><label>Values or trend<input value={data.detail || ""} onChange={(e) => onChange(id, { ...data, detail: e.target.value })} placeholder="Only the values you know" /></label></>}
      {id === "support" && <><div className="snapshot-token-grid">{SUPPORT.map((item) => <button type="button" key={item} aria-pressed={(data.selected || []).includes(item)} onClick={() => toggleValue("selected", item)}>{item}</button>)}</div><label>Relevant context<input value={data.detail || ""} onChange={(e) => onChange(id, { ...data, detail: e.target.value })} placeholder="Support and recent change" /></label></>}
      {id === "devices" && <><div className="snapshot-token-grid">{DEVICES.map((item) => <button type="button" key={item} aria-pressed={(data.selected || []).includes(item)} onClick={() => toggleValue("selected", item)}>{item}</button>)}</div>{(data.selected || []).length > 0 && <label>Relevant device context<input value={data.detail || ""} onChange={(e) => onChange(id, { ...data, detail: e.target.value })} placeholder="Output or change, if relevant" /></label>}</>}
      {id === "advanced" && <><p>Focused context only. Shift Brain will not recommend device-setting changes.</p><div className="snapshot-token-grid">{["CI / CO", "CVP", "SVR", "PA pressures", "SvO2 / ScvO2", "Ventilation", "Drain output", "CRRT", "Pacing"].map((item) => <button type="button" key={item} aria-pressed={(data.selected || []).includes(item)} onClick={() => toggleValue("selected", item)}>{item}</button>)}</div><label>Known values or trend<input value={data.detail || ""} onChange={(e) => onChange(id, { ...data, detail: e.target.value })} placeholder="Only what is relevant" /></label></>}
    </div>}
  </section>;
}

function createInitialSnapshot(initialSnapshot, initialNotes) {
  if (!initialSnapshot) return { ...EMPTY, signals: [...EMPTY.signals], contexts: [], values: {}, optional: {}, notes: initialNotes };
  return {
    ...EMPTY,
    ...initialSnapshot,
    signals: [...(initialSnapshot.signals || EMPTY.signals)],
    contexts: [...(initialSnapshot.contexts || [])],
    values: { ...(initialSnapshot.values || {}) },
    optional: Object.fromEntries(Object.entries(initialSnapshot.optional || {}).map(([key, value]) => [key, structuredClone(value)])),
    units: { ...(initialSnapshot.units || {}) },
    notes: initialSnapshot.notes || "",
  };
}

function findingsForSnapshot(snapshot) {
  const findings = Object.keys(snapshot?.optional || {}).filter((id) => countStructuredDetails(snapshot.optional[id]));
  PERFUSION_MODULES.forEach((module) => {
    const hasTrend = module.fields.some((field) => field.type === "trend" && [snapshot?.values?.[`${field.id}Earlier`], snapshot?.values?.[`${field.id}Now`], snapshot?.values?.[`${field.id}State`]].some(Boolean));
    if (hasTrend && !findings.includes(module.id)) findings.push(module.id);
  });
  if (snapshot?.values?.rhythm && !findings.includes("rhythm")) findings.push("rhythm");
  return findings;
}

export default function PatientSnapshot({ initialNotes = "", initialSnapshot = null, initialCaptureMode = "manual", disabled, isOnline, onBuild, onDraftActivity }) {
  const restoredFindings = findingsForSnapshot(initialSnapshot);
  const [snapshot, setSnapshot] = useState(() => createInitialSnapshot(initialSnapshot, initialNotes));
  const [openSections, setOpenSections] = useState(restoredFindings);
  const [addedFindings, setAddedFindings] = useState(restoredFindings);
  const [findingSheetOpen, setFindingSheetOpen] = useState(false);
  const [findingSearch, setFindingSearch] = useState("");
  const [captureMode, setCaptureMode] = useState(initialSnapshot ? "manual" : initialCaptureMode);
  const [narrative, setNarrative] = useState("");
  const [extraction, setExtraction] = useState(null);
  const [rapidStage, setRapidStage] = useState("entry");
  const [editingExtractionItem, setEditingExtractionItem] = useState(null);
  const [extractionError, setExtractionError] = useState("");
  const reviewRef = useRef(null);
  const notesRef = useRef(null);
  const extractionActiveRef = useRef(false);

  const populatedCount = useMemo(() => Object.values(snapshot.values).filter(Boolean).length
    + Object.values(snapshot.optional).reduce((sum, section) => sum + countStructuredDetails(section), 0)
    + (snapshot.notes.trim() ? 1 : 0), [snapshot]);
  const rapidConfirmed = !extraction || rapidStage === "confirmed";
  useEffect(() => { onDraftActivity?.(populatedCount > 0 || narrative.trim().length > 0); }, [populatedCount, narrative, onDraftActivity]);
  const canBuild = populatedCount > 0 && !disabled && isOnline && rapidConfirmed;
  const highRisk = useMemo(() => {
    const systolic = Number.parseFloat((snapshot.values.bpNow || "").split("/")[0]);
    const map = Number.parseFloat(snapshot.values.mapNow);
    return (Number.isFinite(systolic) && systolic < 90) || (Number.isFinite(map) && map < 65)
      || ["Changed", "More drowsy", "Difficult to arouse"].includes(snapshot.values.mental)
      || ["More drowsy", "Difficult to arouse"].includes(snapshot.values.loc)
      || snapshot.values.perfusionState === "Mottling"
      || (snapshot.values.perfusionFindings || []).includes("Mottling");
  }, [snapshot.values]);

  useEffect(() => { trackEvent("shift_brain_what_changed_viewed"); }, []);

  const activateSignal = (id) => setSnapshot((current) => current.signals.includes(id)
    ? current
    : { ...current, signals: [...current.signals, id] });
  const updateValue = (key, value, signal) => {
    if (signal) activateSignal(signal);
    setSnapshot((current) => ({ ...current, values: { ...current.values, [key]: value } }));
  };
  const updateModule = (moduleId, key, value) => setSnapshot((current) => ({ ...current, optional: { ...current.optional, [moduleId]: { ...(current.optional[moduleId] || {}), [key]: value } } }));
  const toggleSection = (id) => setOpenSections((current) => toggle(current, id));

  const applyExtractedSnapshot = (result) => {
    setSnapshot(result.snapshot);
    const findings = findingsForSnapshot(result.snapshot);
    setAddedFindings(findings);
    setOpenSections([]);
    setExtraction(result);
    setRapidStage("review");
    setEditingExtractionItem(null);
  };
  const extractNarrative = () => {
    if (!narrative.trim() || disabled || extractionActiveRef.current) return;
    extractionActiveRef.current = true;
    setExtractionError("");
    try {
      const result = extractRapidCapture(narrative);
      applyExtractedSnapshot(result);
      trackEvent("shift_brain_rapid_capture_extracted", { captured_count: result.items.length, needs_review_count: result.needsReview.length });
    } catch {
      extractionActiveRef.current = false;
      setExtractionError("We could not structure that description. Your text is still here. Retry or enter findings manually.");
      trackEvent("shift_brain_rapid_capture_failed", { reason: "contract_error" });
    }
  };
  const updateExtractedPath = (path, value) => setSnapshot((current) => setSnapshotPath(current, path, value));
  const deleteExtractedItem = (entry) => {
    setSnapshot((current) => clearExtractionItem(current, entry));
    setExtraction((current) => ({ ...current, items: current.items.filter((itemEntry) => itemEntry.id !== entry.id) }));
  };
  const resolveReviewItem = (entry, action) => {
    if (action === "context") setSnapshot((current) => ({ ...current, notes: [current.notes, entry.text].filter(Boolean).join(" ") }));
    setExtraction((current) => ({ ...current, needsReview: current.needsReview.filter((reviewEntry) => reviewEntry.id !== entry.id) }));
  };

  const findingOptions = [
    ["respiratory", "Respiratory details", "Oxygen support and work of breathing", "breathing", "quick-respiratory-heading"],
    ["neurologic", "Neurologic details", "Mental status and neurologic findings", "neuro", "quick-neuro-heading"],
    ["rhythm", "Rhythm", "Rate, rhythm, or monitor change", "heart"],
    ["drains", "Bleeding / drains", "Output, appearance, or suspected blood loss", "bleeding"],
    ["perfusionLabs", "Labs", "Relevant result or direction of change", "labs"],
    ["hemodynamics", "Hemodynamics", "Advanced measurements when available", "perfusion"],
    ["drips", "Drips", "Current support and recent changes", "perfusion"],
    ["interventions", "Interventions", "What was given and observed response", "perfusion"],
    ["other", "Other context", "A relevant finding not captured above", "off"],
  ];
  const addFinding = (id, signal, targetId) => {
    activateSignal(signal);
    if (!targetId) setAddedFindings((current) => current.includes(id) ? current : [...current, id]);
    if (!targetId && id !== "rhythm" && id !== "other") setOpenSections((current) => current.includes(id) ? current : [...current, id]);
    setFindingSheetOpen(false);
    setFindingSearch("");
    requestAnimationFrame(() => {
      if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (id === "other") notesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else document.getElementById(`snapshot-finding-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const build = () => {
    if (!canBuild) return;
    const serialized = serializePatientSnapshot(snapshot);
    trackEvent("shift_brain_priority_map_requested", {
      care_setting: snapshot.setting || "not_selected",
      signal_count: snapshot.signals.length,
      populated_field_count: populatedCount,
      free_text_used: Boolean(snapshot.notes.trim()),
      advanced_used: addedFindings.length > 0,
    });
    onBuild(serialized, snapshot);
  };

  const oxygenDefinition = { id: "oxygen", label: "Oxygen support", shortLabel: "O₂ support", unit: "", placeholder: "2 L NC", inputMode: "text", signal: "breathing" };
  const moduleById = Object.fromEntries(PERFUSION_MODULES.map((module) => [module.id, module]));
  const filteredFindingOptions = findingOptions.filter(([, label, detail]) => `${label} ${detail}`.toLowerCase().includes(findingSearch.trim().toLowerCase()));

  return <div className="patient-snapshot patient-snapshot--quick">
    <header className="snapshot-intro">
      <span>Shift Brain</span>
      <h1>What do you know right now?</h1>
      <p>Enter what you have in any order. Skip anything you do not know.</p>
    </header>

    <div className="snapshot-entry-mode" aria-label="Snapshot entry method">
      <button type="button" aria-pressed={captureMode === "rapid"} onClick={() => { setCaptureMode("rapid"); if (extraction && rapidStage === "manual-edit") setRapidStage("review"); }}>Describe what&apos;s happening</button>
      <button type="button" aria-pressed={captureMode === "manual"} onClick={() => setCaptureMode("manual")}>Enter findings manually</button>
    </div>

    {captureMode === "rapid" && rapidStage === "entry" && <section className="rapid-capture-entry ce-section-enter" aria-labelledby="rapid-capture-title">
      <div><span>Rapid capture</span><h2 id="rapid-capture-title">Describe what&apos;s happening</h2><p>Type or use your phone&apos;s dictation. Clinical Edge will organize only what you report into a Snapshot for you to review.</p></div>
      <label>Nurse narrative<textarea aria-label="Nurse narrative" rows={8} value={narrative} onChange={(event) => setNarrative(event.target.value)} placeholder="Describe the current findings, earlier values, support, labs, and timing you know." /></label>
      <div className="snapshot-privacy" role="note"><strong>No patient identifiers.</strong><span>Leave out names, initials, room numbers, DOB, MRNs, contact details, addresses, and exact dates. Identifier checks are limited and do not establish that text is de-identified or HIPAA-safe.</span></div>
      {extractionError && <div className="rapid-capture-error" role="alert">{extractionError}</div>}
      <div className="rapid-capture-entry__actions"><button type="button" onClick={() => setCaptureMode("manual")}>Use manual capture</button><button type="button" className="rapid-extract" disabled={!narrative.trim() || disabled} onClick={extractNarrative}>Structure my Snapshot</button></div>
      <p className="rapid-capture-boundary">Extraction organizes reported information only. It does not diagnose, interpret, or fill in missing details.</p>
    </section>}

    {captureMode === "rapid" && rapidStage === "review" && extraction && <RapidConfirmation extraction={extraction} snapshot={snapshot} editingItem={editingExtractionItem} onEdit={setEditingExtractionItem} onUpdate={updateExtractedPath} onDelete={deleteExtractedItem} onResolve={resolveReviewItem} onManualEdit={() => { setCaptureMode("manual"); setRapidStage("manual-edit"); }} onBack={() => { extractionActiveRef.current = false; setRapidStage("entry"); }} onConfirm={() => { setRapidStage("confirmed"); trackEvent("shift_brain_rapid_capture_confirmed", { captured_count: extraction.items.length }); }} />}

    {captureMode === "rapid" && rapidStage === "confirmed" && <section className="rapid-confirmed ce-section-enter" aria-labelledby="rapid-confirmed-title"><header><span>Confirmed Snapshot</span><h2 id="rapid-confirmed-title">Ready for Priority Map</h2><p>These are the reported details you confirmed.</p></header><SemanticSnapshotReview snapshot={snapshot} /><div className="rapid-confirmed__actions"><button type="button" onClick={() => { setRapidStage("review"); setEditingExtractionItem(null); }}>Edit confirmed details</button><button type="button" disabled={!canBuild} onClick={build}>Build my Priority Map →</button></div></section>}

    {captureMode === "manual" && <div className="snapshot-workspace ce-section-enter">
      {extraction && rapidStage === "manual-edit" && <div className="rapid-manual-banner" role="status"><div><strong>Editing extracted Snapshot</strong><span>Changes stay in this draft. Return to confirmation before building.</span></div><button type="button" onClick={() => { setCaptureMode("rapid"); setRapidStage("review"); }}>Return to confirmation</button></div>}
      <nav className="snapshot-phase-strip" aria-label="Snapshot progress"><span className="is-current">Capture</span><span>Add detail</span><span>Review</span></nav>
      <section className="quick-capture-section" aria-labelledby="quick-vitals-heading">
        <div className="quick-section-heading"><div><span>Start here</span><h2 id="quick-vitals-heading">Vitals</h2></div><small>Current values first</small></div>
        <div className="quick-vitals-grid">{QUICK_CAPTURE_FIELDS.map((definition) => <QuickTrendField key={definition.id} definition={definition} values={snapshot.values} onChange={updateValue} onActivate={activateSignal} />)}</div>
      </section>

      <section className="quick-capture-section" aria-labelledby="quick-neuro-heading">
        <div className="quick-section-heading"><h2 id="quick-neuro-heading">Neuro / mental status</h2></div>
        <ChoiceField id="loc" label="Current mental status" options={["At baseline", "More drowsy", "Difficult to arouse", "Other change"]} value={snapshot.values.loc || ""} onChange={(key, value) => updateValue(key, value, "neuro")} />
      </section>

      <section className="quick-capture-section" aria-labelledby="quick-pain-heading">
        <div className="quick-section-heading"><h2 id="quick-pain-heading">Pain / symptoms</h2></div>
        <ChoiceField id="chestPain" label="Chest discomfort" options={["None reported", "Present", "Unable to assess"]} value={snapshot.values.chestPain || ""} onChange={(key, value) => updateValue(key, value, "pain")} />
        <label className="snapshot-field snapshot-text-field">Other symptom<input aria-label="Other symptom" value={snapshot.values.painDetail || ""} onChange={(event) => updateValue("painDetail", event.target.value, "pain")} placeholder="Pain or another new symptom" /></label>
      </section>

      <section className="quick-capture-section" aria-labelledby="quick-respiratory-heading">
        <div className="quick-section-heading"><h2 id="quick-respiratory-heading">Oxygen / respiratory</h2></div>
        <QuickTrendField definition={oxygenDefinition} values={snapshot.values} onChange={updateValue} onActivate={activateSignal} />
        <ChoiceField id="wob" label="Work of breathing" options={["No obvious change", "Increased", "Markedly increased"]} value={snapshot.values.wob || ""} onChange={(key, value) => updateValue(key, value, "breathing")} />
      </section>

      <section className="quick-capture-section" aria-labelledby="quick-urine-heading">
        <div className="quick-section-heading"><h2 id="quick-urine-heading">Output</h2></div>
        <UrineOutputField values={snapshot.values} onChange={updateValue} onActivate={activateSignal} />
      </section>

      <section className="quick-capture-section" aria-labelledby="quick-perfusion-heading">
        <div className="quick-section-heading"><h2 id="quick-perfusion-heading">Perfusion</h2></div>
        <MultiChoiceField id="perfusionFindings" label="Extremities / circulation" options={["Cool / clammy", "Weak pulses", "Delayed capillary refill", "Mottling", "Other"]} values={snapshot.values.perfusionFindings || (snapshot.values.perfusionState ? [snapshot.values.perfusionState] : [])} onChange={(key, value) => updateValue(key, value, "perfusion")} />
      </section>

      {highRisk && <div className="snapshot-escalation" role="alert"><strong>Do not wait to finish this Snapshot.</strong><span>If the current presentation requires urgent attention, follow local escalation procedures now. You can continue adding context while help is being activated.</span></div>}

      {addedFindings.length > 0 && <section className="snapshot-additional snapshot-added-findings" aria-label="Added findings">
        <div className="snapshot-section-heading snapshot-section-heading--small"><span>Added findings</span><p>Only the details you chose are open.</p></div>
        {addedFindings.includes("rhythm") && <div id="snapshot-finding-rhythm" className="snapshot-added-simple"><label className="snapshot-field snapshot-text-field">Rhythm / monitor finding<input aria-label="Rhythm" value={snapshot.values.rhythm || ""} onChange={(event) => updateValue("rhythm", event.target.value, "heart")} placeholder="What changed or what the monitor shows" /></label></div>}
        {addedFindings.filter((id) => moduleById[id]).map((id) => <div id={`snapshot-finding-${id}`} key={id}><ClinicalModule module={moduleById[id]} open={openSections.includes(id)} onToggle={() => toggleSection(id)} data={snapshot.optional[id] || {}} values={snapshot.values} onValueChange={updateValue} onModuleChange={updateModule} /></div>)}
      </section>}

      <details className="snapshot-context-details"><summary>Care setting and clinical context <span>Optional</span></summary><div className="snapshot-context-row"><fieldset className="snapshot-context"><legend>Care setting</legend><div className="snapshot-choice-row">{CARE_SETTINGS.map((setting) => <button type="button" key={setting} aria-pressed={snapshot.setting === setting} onClick={() => setSnapshot((current) => ({ ...current, setting: current.setting === setting ? "" : setting }))}>{setting}</button>)}</div></fieldset><fieldset className="snapshot-context"><legend>Clinical context</legend><div className="snapshot-choice-row">{CONTEXTS.map((context) => <button type="button" key={context} aria-pressed={snapshot.contexts.includes(context)} onClick={() => setSnapshot((current) => ({ ...current, contexts: toggle(current.contexts, context) }))}>{context}</button>)}</div></fieldset></div></details>

      <label ref={notesRef} className="snapshot-notes">Other relevant context<span>Optional. Use only for context the structured fields did not capture. Do not include identifying information.</span><textarea maxLength={600} rows={3} value={snapshot.notes} onChange={(event) => setSnapshot((current) => ({ ...current, notes: event.target.value }))} placeholder="Add a brief relevant detail" /></label>
      <div className="snapshot-privacy" role="note"><strong>No patient identifiers.</strong><span>Leave out names, initials, room numbers, DOB, MRNs, contact details, addresses, and exact dates. Automated checks are limited and do not establish that text is de-identified or HIPAA-safe.</span></div>
      <details ref={reviewRef} className="snapshot-review"><summary>Review Snapshot before building</summary><div className="snapshot-review-inner"><SemanticSnapshotReview snapshot={snapshot} /><button type="button" className="snapshot-edit" onClick={() => { reviewRef.current.open = false; document.querySelector(".quick-capture-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Edit Snapshot</button></div></details>
      <div className="snapshot-submit"><div><strong>{populatedCount ? `Enough to start · ${populatedCount} details added` : "Add what you know"}</strong><span>Missing information can stay missing.</span></div><button type="button" disabled={!canBuild} onClick={build}>{disabled ? "Organizing clinical signals…" : "Build my Priority Map →"}</button></div>
    </div>}

    {captureMode === "manual" && <button type="button" className="snapshot-add-finding" aria-expanded={findingSheetOpen} onClick={() => setFindingSheetOpen(true)}><span aria-hidden="true">+</span> Add finding</button>}
    {captureMode === "manual" && findingSheetOpen && <div className="snapshot-sheet-backdrop" role="presentation" onClick={() => setFindingSheetOpen(false)}><section className="snapshot-finding-sheet" role="dialog" aria-modal="true" aria-labelledby="add-finding-title" onClick={(event) => event.stopPropagation()}><div className="snapshot-sheet-handle" aria-hidden="true" /><header><div><small>Shift Brain</small><h2 id="add-finding-title">Add a finding</h2></div><button type="button" aria-label="Close add finding" onClick={() => setFindingSheetOpen(false)}>×</button></header><p>Search the findings already supported by Shift Brain.</p><label className="snapshot-finding-search">Find a field<input type="search" value={findingSearch} onChange={(event) => setFindingSearch(event.target.value)} placeholder="Labs, drips, respiratory…" /></label><div className="snapshot-finding-options">{filteredFindingOptions.map(([id, label, detail, signal, targetId]) => <button type="button" key={id} onClick={() => addFinding(id, signal, targetId)}><strong>{label}</strong><span>{detail}</span><b aria-hidden="true">+</b></button>)}</div>{filteredFindingOptions.length === 0 && <p className="snapshot-finding-empty">No matching supported finding.</p>}</section></div>}
  </div>;
}
