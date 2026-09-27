import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { serializePatientSnapshot } from "./patientSnapshotModel";
import { PERFUSION_CORE_FIELDS, PERFUSION_MODULES, perfusionModulesFor } from "./patientSnapshotSchema";
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
  spo2: { label: "SpO2", unit: "%", trend: true, placeholder: "91" },
  oxygen: { label: "Oxygen support", unit: "", trend: true, placeholder: "2 L NC" },
  temp: { label: "Temperature", unit: "", trend: true, placeholder: "38.2 C" },
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

const EMPTY = { signals: [], setting: "", contexts: [], values: {}, optional: {}, notes: "" };
const SIGNAL_LABELS = Object.fromEntries(SIGNALS.map(([id, label]) => [id, label]));
const REVIEW_FIELD_DEFS = Object.fromEntries([
  ...Object.entries(FIELD_DEFS).map(([id, definition]) => [id, { id, ...definition }]),
  ...PERFUSION_CORE_FIELDS.map((definition) => [definition.id, definition]),
  ...PERFUSION_MODULES.flatMap((module) => module.fields.filter((field) => field.type !== "repeatable").map((field) => [field.id, field])),
]);
const REVIEW_VALUE_LABELS = {
  ...Object.fromEntries(Object.entries(SELECT_FIELDS).map(([id, [label]]) => [id, label])),
  ...Object.fromEntries(Object.entries(TEXT_FIELDS).map(([id, [label]]) => [id, label])),
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
  const states = [];
  const additional = [];
  const handled = new Set();

  Object.entries(REVIEW_FIELD_DEFS).forEach(([id, definition]) => {
    if (definition.type !== "trend") return;
    const earlier = snapshot.values[`${id}Earlier`];
    const now = snapshot.values[`${id}Now`];
    const state = snapshot.values[`${id}State`];
    const unit = definition.unit ? ` ${definition.unit}` : "";
    if (earlier && now) trends.push({ label: definition.label, value: `Earlier ${earlier}${unit} → Now ${now}${unit}` });
    else if (now) findings.push({ label: definition.label, value: `Now ${now}${unit}` });
    else if (earlier) findings.push({ label: definition.label, value: `Earlier ${earlier}${unit}; now not entered` });
    else if (state) states.push({ label: definition.label, value: state });
    handled.add(`${id}Earlier`);
    handled.add(`${id}Now`);
    handled.add(`${id}State`);
  });

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
    ["Unknown / not assessed", review.states],
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

function ChoiceField({ id, label, options, value, onChange }) {
  const renderedOptions = [...new Set(options.filter((option) => !["Unknown", "Not assessed"].includes(option)))];
  return <fieldset className="snapshot-field snapshot-choice-field">
    <legend>{label}</legend>
    <div className="snapshot-choice-row">{renderedOptions.map((option) => <button type="button" key={option} aria-pressed={value === option} onClick={() => onChange(id, value === option ? "" : option)}>{option}</button>)}</div>
    <label className="snapshot-field-state snapshot-choice-state"><span>If unavailable</span><select aria-label={`${label} state`} value={["Unknown", "Not assessed"].includes(value) ? value : ""} onChange={(e) => onChange(id, e.target.value)}><option value="">No explicit state</option><option value="Unknown">Unknown</option><option value="Not assessed">Not assessed</option></select></label>
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
  const detailCount = countStructuredDetails(data);
  return <section className="snapshot-optional-section">
    <button type="button" className="snapshot-disclosure" aria-expanded={open} onClick={onToggle}><span><strong>{module.label}</strong><small>{detailCount ? "Added · open to review or edit" : module.description}</small></span><span aria-hidden="true">{open ? "−" : "+"}</span></button>
    {open && <div className="snapshot-module-grid">{module.fields.map((field) => <SchemaField key={field.id} moduleId={module.id} definition={field} values={values} onValueChange={onValueChange} moduleData={data} onModuleChange={onModuleChange} />)}</div>}
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

export default function PatientSnapshot({ initialNotes = "", disabled, isOnline, onBuild }) {
  const [snapshot, setSnapshot] = useState(() => ({ ...EMPTY, notes: initialNotes }));
  const [openSections, setOpenSections] = useState([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const fieldIds = useMemo(() => [...new Set(snapshot.signals.flatMap((id) => SIGNAL_FIELDS[id] || []))], [snapshot.signals]);
  const displayedFieldIds = useMemo(() => snapshot.signals.includes("perfusion") ? fieldIds.filter((id) => !PERFUSION_CORE_FIELDS.some((field) => field.id === id)) : fieldIds, [fieldIds, snapshot.signals]);
  const populatedCount = useMemo(() => Object.values(snapshot.values).filter(Boolean).length + Object.values(snapshot.optional).reduce((sum, section) => sum + Object.values(section || {}).filter((value) => Array.isArray(value) ? value.length : value).length, 0) + (snapshot.notes.trim() ? 1 : 0), [snapshot]);
  const canBuild = snapshot.signals.length > 0 && !disabled && isOnline;
  const perfusionModules = useMemo(() => perfusionModulesFor(snapshot), [snapshot]);
  const reviewRef = useRef(null);
  const highRisk = useMemo(() => {
    const systolic = Number.parseFloat((snapshot.values.bpNow || "").split("/")[0]);
    const map = Number.parseFloat(snapshot.values.mapNow);
    return (Number.isFinite(systolic) && systolic < 90) || (Number.isFinite(map) && map < 65) || snapshot.values.mental === "Changed" || snapshot.values.perfusionState === "Mottling";
  }, [snapshot.values]);

  useEffect(() => { trackEvent("shift_brain_what_changed_viewed"); }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const selectSignal = (id) => {
    const next = toggle(snapshot.signals, id);
    setSnapshot((current) => ({ ...current, signals: next }));
    trackEvent("shift_brain_signal_toggled", { signal_category: id, selected: next.includes(id), signal_count: next.length });
    if (id === "off" && next.includes(id)) trackEvent("shift_brain_something_off_selected");
    if (next.length > 1) trackEvent("shift_brain_multiple_signals_selected", { signal_count: next.length });
  };
  const updateValue = (key, value) => setSnapshot((current) => ({ ...current, values: { ...current.values, [key]: value } }));
  const updateOptional = (id, value) => setSnapshot((current) => ({ ...current, optional: { ...current.optional, [id]: value } }));
  const updateModule = (moduleId, key, value) => setSnapshot((current) => ({ ...current, optional: { ...current.optional, [moduleId]: { ...(current.optional[moduleId] || {}), [key]: value } } }));
  const toggleSection = (id) => {
    const opening = !openSections.includes(id);
    setOpenSections((current) => isMobile && opening ? [id] : toggle(current, id));
    if (opening) trackEvent(id === "advanced" ? "shift_brain_advanced_opened" : "shift_brain_optional_section_opened", { section: id });
  };
  const build = () => {
    if (!canBuild) return;
    const serialized = serializePatientSnapshot(snapshot);
    trackEvent("shift_brain_priority_map_requested", {
      care_setting: snapshot.setting || "not_selected",
      signal_count: snapshot.signals.length,
      populated_field_count: populatedCount,
      free_text_used: Boolean(snapshot.notes.trim()),
      advanced_used: Boolean(snapshot.optional.advanced && Object.keys(snapshot.optional.advanced).length),
    });
    onBuild(serialized, snapshot);
  };

  return <div className="patient-snapshot">
    <header className="snapshot-intro">
      <span>Shift Brain</span>
      <h1>What changed?</h1>
      <p>Select what you&apos;re noticing. You don&apos;t need to know what&apos;s causing it.</p>
    </header>

    {snapshot.signals.length === 0 ? (
      <div className="snapshot-signal-grid" aria-label="Clinical changes">{SIGNALS.map(([id, label, detail]) => <button type="button" key={id} aria-pressed="false" onClick={() => selectSignal(id)}><strong>{label}</strong><span>{detail}</span></button>)}</div>
    ) : (
      <div className="snapshot-change-selection" aria-label="Clinical changes">
        <div className="snapshot-selected-signals">{SIGNALS.filter(([id]) => snapshot.signals.includes(id)).map(([id, label]) => <button type="button" key={id} aria-pressed="true" onClick={() => selectSignal(id)}><strong>{label}</strong><span>Selected · remove</span></button>)}</div>
        <details className="snapshot-more-signals"><summary>Add another change</summary><div className="snapshot-signal-grid snapshot-signal-grid--more">{SIGNALS.filter(([id]) => !snapshot.signals.includes(id)).map(([id, label, detail]) => <button type="button" key={id} aria-pressed="false" onClick={() => selectSignal(id)}><strong>{label}</strong><span>{detail}</span></button>)}</div></details>
      </div>
    )}

    {snapshot.signals.length > 0 && <div className="snapshot-workspace ce-section-enter">
      <nav className="snapshot-phase-strip" aria-label="Snapshot progress"><span className="is-complete">Change</span><span className="is-current">Key findings</span><span>Add detail</span><span>Review</span></nav>
      <div className="snapshot-section-heading"><span>Start here · Key findings</span><p>Add the measurements and observations that define the change. Blank fields remain omitted.</p></div>

      <div className="snapshot-adaptive-fields snapshot-core">
        {snapshot.signals.includes("perfusion") && PERFUSION_CORE_FIELDS.map((field) => <SchemaField key={field.id} definition={field} values={snapshot.values} onValueChange={updateValue} moduleData={{}} onModuleChange={updateModule} />)}
        {displayedFieldIds.map((id) => FIELD_DEFS[id] ? <TrendField key={id} id={id} definition={FIELD_DEFS[id]} values={snapshot.values} onChange={updateValue} /> : SELECT_FIELDS[id] ? <ChoiceField key={id} id={id} label={SELECT_FIELDS[id][0]} options={SELECT_FIELDS[id][1]} value={snapshot.values[id] || ""} onChange={updateValue} /> : <label className="snapshot-field snapshot-text-field" key={id}>{TEXT_FIELDS[id]?.[0] || id}<input value={snapshot.values[id] || ""} onChange={(e) => updateValue(id, e.target.value)} placeholder={TEXT_FIELDS[id]?.[1] || "Optional"} /></label>)}
      </div>

      <div className="snapshot-context-row">
        <fieldset className="snapshot-context"><legend>Care setting <span>Optional context</span></legend><div className="snapshot-choice-row">{CARE_SETTINGS.map((setting) => <button type="button" key={setting} aria-pressed={snapshot.setting === setting} onClick={() => setSnapshot((current) => ({ ...current, setting: current.setting === setting ? "" : setting }))}>{setting}</button>)}</div></fieldset>
        <fieldset className="snapshot-context"><legend>Clinical context <span>Optional</span></legend><div className="snapshot-choice-row">{CONTEXTS.map((context) => <button type="button" key={context} aria-pressed={snapshot.contexts.includes(context)} onClick={() => setSnapshot((current) => ({ ...current, contexts: toggle(current.contexts, context) }))}>{context}</button>)}</div></fieldset>
      </div>

      {highRisk && <div className="snapshot-escalation" role="alert"><strong>Do not wait to finish this Snapshot.</strong><span>If the current presentation requires urgent attention, follow local escalation procedures now. You can continue adding context while help is being activated.</span></div>}

      <div className="snapshot-additional"><div className="snapshot-section-heading snapshot-section-heading--small"><span>Add detail if useful</span><p>Open only what helps explain the change. Optional depth should not delay escalation.</p></div>{snapshot.signals.includes("perfusion") ? perfusionModules.map((module) => <ClinicalModule key={module.id} module={module} open={openSections.includes(module.id)} onToggle={() => toggleSection(module.id)} data={snapshot.optional[module.id] || {}} values={snapshot.values} onValueChange={updateValue} onModuleChange={updateModule} />) : OPTIONAL_SECTIONS.map(([id, label]) => <OptionalSection key={id} id={id} label={label} open={openSections.includes(id)} onToggle={() => toggleSection(id)} data={snapshot.optional[id] || {}} onChange={updateOptional} vitalIds={Object.keys(FIELD_DEFS).filter((fieldId) => !fieldIds.includes(fieldId))} values={snapshot.values} onValueChange={updateValue} />)}</div>

      <label className="snapshot-notes">Relevant context not captured above<span>Optional. Use only for context the structured fields did not capture. Do not include identifying information.</span><textarea maxLength={600} rows={3} value={snapshot.notes} onChange={(e) => setSnapshot((current) => ({ ...current, notes: e.target.value }))} placeholder="Add a brief relevant detail" /></label>
      <div className="snapshot-privacy" role="note"><strong>No patient identifiers.</strong><span>Leave out names, initials, room numbers, DOB, MRNs, contact details, addresses, and exact dates. Automated checks are limited and do not establish that text is de-identified or HIPAA-safe.</span></div>
      <details ref={reviewRef} className="snapshot-review"><summary>Review Snapshot before building</summary><div className="snapshot-review-inner"><SemanticSnapshotReview snapshot={snapshot} /><button type="button" className="snapshot-edit" onClick={() => { reviewRef.current.open = false; document.querySelector(".snapshot-core")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Edit Snapshot</button></div></details>
      <div className="snapshot-submit"><div><strong>Enough to start</strong><span>Add only what is relevant; missing information can stay missing.</span></div><button type="button" disabled={!canBuild} onClick={build}>{disabled ? "Organizing clinical signals…" : "Build my Priority Map →"}</button></div>
    </div>}
  </div>;
}
