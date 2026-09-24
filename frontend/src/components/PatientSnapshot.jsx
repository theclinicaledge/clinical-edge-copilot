import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "../analytics";
import { serializePatientSnapshot } from "./patientSnapshotModel";
import { PERFUSION_CORE_FIELDS, perfusionModulesFor } from "./patientSnapshotSchema";
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
  mental: ["Mental status", ["Baseline", "Changed", "Not assessed"]],
  urineState: ["Urine output", ["Stable", "Decreasing", "Minimal / none", "Not assessed"]],
  perfusionState: ["Perfusion", ["No obvious change", "Cool / clammy", "Weak pulses", "Delayed capillary refill", "Other", "Not assessed"]],
  wob: ["Work of breathing", ["No obvious change", "Increased", "Markedly increased", "Not assessed"]],
  bleedingState: ["Bleeding concern", ["None observed", "Possible", "Known", "Not assessed"]],
  loc: ["Level of consciousness", ["Baseline", "More drowsy", "Difficult to arouse", "Not assessed"]],
  focal: ["Focal neurologic change", ["None observed", "Possible", "Present", "Not assessed"]],
  chestPain: ["Chest discomfort", ["None reported", "Present", "Unable to assess", "Not assessed"]],
  foley: ["Foley", ["Not present", "Present", "Unknown"]],
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

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function TrendField({ id, definition, values, onChange }) {
  return <fieldset className="snapshot-field snapshot-trend">
    <legend>{definition.label} {definition.unit && <span>{definition.unit}</span>}</legend>
    <label><span>Previous</span><input aria-label={`${definition.label} previous`} value={values[`${id}Earlier`] || ""} onChange={(e) => onChange(`${id}Earlier`, e.target.value)} placeholder="Optional" /></label>
    <span className="snapshot-arrow" aria-hidden="true">→</span>
    <label><span>Current</span><input aria-label={`${definition.label} current`} value={values[`${id}Now`] || ""} onChange={(e) => onChange(`${id}Now`, e.target.value)} placeholder={definition.placeholder || "Optional"} /></label>
    <div className="snapshot-field-state"><button type="button" aria-pressed={values[`${id}State`] === "Unknown"} onClick={() => onChange(`${id}State`, values[`${id}State`] === "Unknown" ? "" : "Unknown")}>Unknown</button><button type="button" aria-pressed={values[`${id}State`] === "Not assessed"} onClick={() => onChange(`${id}State`, values[`${id}State`] === "Not assessed" ? "" : "Not assessed")}>Not assessed</button></div>
  </fieldset>;
}

function ChoiceField({ id, label, options, value, onChange }) {
  return <fieldset className="snapshot-field snapshot-choice-field">
    <legend>{label}</legend>
    <div className="snapshot-choice-row">{[...options, "Unknown", "Not assessed"].map((option) => <button type="button" key={option} aria-pressed={value === option} onClick={() => onChange(id, value === option ? "" : option)}>{option}</button>)}</div>
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
  return <section className="snapshot-optional-section">
    <button type="button" className="snapshot-disclosure" aria-expanded={open} onClick={onToggle}><span><strong>{module.label}</strong><small>{module.description}</small></span><span aria-hidden="true">{open ? "−" : "+"}</span></button>
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
  const fieldIds = useMemo(() => [...new Set(snapshot.signals.flatMap((id) => SIGNAL_FIELDS[id] || []))], [snapshot.signals]);
  const displayedFieldIds = useMemo(() => snapshot.signals.includes("perfusion") ? fieldIds.filter((id) => !PERFUSION_CORE_FIELDS.some((field) => field.id === id)) : fieldIds, [fieldIds, snapshot.signals]);
  const populatedCount = useMemo(() => Object.values(snapshot.values).filter(Boolean).length + Object.values(snapshot.optional).reduce((sum, section) => sum + Object.values(section || {}).filter((value) => Array.isArray(value) ? value.length : value).length, 0) + (snapshot.notes.trim() ? 1 : 0), [snapshot]);
  const canBuild = snapshot.signals.length > 0 && !disabled && isOnline;
  const perfusionModules = useMemo(() => perfusionModulesFor(snapshot), [snapshot]);
  const serializedReview = useMemo(() => serializePatientSnapshot(snapshot), [snapshot]);
  const highRisk = useMemo(() => {
    const systolic = Number.parseFloat((snapshot.values.bpNow || "").split("/")[0]);
    const map = Number.parseFloat(snapshot.values.mapNow);
    return (Number.isFinite(systolic) && systolic < 90) || (Number.isFinite(map) && map < 65) || snapshot.values.mental === "Changed" || snapshot.values.perfusionState === "Mottling";
  }, [snapshot.values]);

  useEffect(() => { trackEvent("shift_brain_what_changed_viewed"); }, []);

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
    setOpenSections((current) => toggle(current, id));
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

    <div className="snapshot-signal-grid" aria-label="Clinical changes">{SIGNALS.map(([id, label, detail]) => <button type="button" key={id} aria-pressed={snapshot.signals.includes(id)} onClick={() => selectSignal(id)}><strong>{label}</strong><span>{detail}</span></button>)}</div>

    {snapshot.signals.length > 0 && <div className="snapshot-workspace ce-section-enter">
      <div className="snapshot-section-heading"><span>Patient snapshot</span><p>Only add what you know. Blank fields stay unknown.</p></div>
      <fieldset className="snapshot-context"><legend>Care setting</legend><div className="snapshot-choice-row">{CARE_SETTINGS.map((setting) => <button type="button" key={setting} aria-pressed={snapshot.setting === setting} onClick={() => setSnapshot((current) => ({ ...current, setting: current.setting === setting ? "" : setting }))}>{setting}</button>)}</div></fieldset>
      <fieldset className="snapshot-context"><legend>Clinical context <span>Optional</span></legend><div className="snapshot-choice-row">{CONTEXTS.map((context) => <button type="button" key={context} aria-pressed={snapshot.contexts.includes(context)} onClick={() => setSnapshot((current) => ({ ...current, contexts: toggle(current.contexts, context) }))}>{context}</button>)}</div></fieldset>

      <div className="snapshot-adaptive-fields">
        {snapshot.signals.includes("perfusion") && PERFUSION_CORE_FIELDS.map((field) => <SchemaField key={field.id} definition={field} values={snapshot.values} onValueChange={updateValue} moduleData={{}} onModuleChange={updateModule} />)}
        {displayedFieldIds.map((id) => FIELD_DEFS[id] ? <TrendField key={id} id={id} definition={FIELD_DEFS[id]} values={snapshot.values} onChange={updateValue} /> : SELECT_FIELDS[id] ? <ChoiceField key={id} id={id} label={SELECT_FIELDS[id][0]} options={SELECT_FIELDS[id][1]} value={snapshot.values[id] || ""} onChange={updateValue} /> : <label className="snapshot-field snapshot-text-field" key={id}>{TEXT_FIELDS[id]?.[0] || id}<input value={snapshot.values[id] || ""} onChange={(e) => updateValue(id, e.target.value)} placeholder={TEXT_FIELDS[id]?.[1] || "Optional"} /></label>)}
      </div>

      {highRisk && <div className="snapshot-escalation" role="alert"><strong>Do not wait to finish this Snapshot.</strong><span>If the current presentation requires urgent attention, follow local escalation procedures now. You can continue adding context while help is being activated.</span></div>}

      <div className="snapshot-additional"><div className="snapshot-section-heading snapshot-section-heading--small"><span>Add what you know</span><p>Open only what is relevant. These fields are optional and should not delay escalation.</p></div>{snapshot.signals.includes("perfusion") ? perfusionModules.map((module) => <ClinicalModule key={module.id} module={module} open={openSections.includes(module.id)} onToggle={() => toggleSection(module.id)} data={snapshot.optional[module.id] || {}} values={snapshot.values} onValueChange={updateValue} onModuleChange={updateModule} />) : OPTIONAL_SECTIONS.map(([id, label]) => <OptionalSection key={id} id={id} label={label} open={openSections.includes(id)} onToggle={() => toggleSection(id)} data={snapshot.optional[id] || {}} onChange={updateOptional} vitalIds={Object.keys(FIELD_DEFS).filter((fieldId) => !fieldIds.includes(fieldId))} values={snapshot.values} onValueChange={updateValue} />)}</div>

      <label className="snapshot-notes">Anything important we missed?<span>Optional. Do not include identifying information.</span><textarea maxLength={600} rows={3} value={snapshot.notes} onChange={(e) => setSnapshot((current) => ({ ...current, notes: e.target.value }))} placeholder="Add only relevant clinical context" /></label>
      <div className="snapshot-privacy" role="note"><strong>No patient identifiers.</strong><span>Leave out names, initials, room numbers, DOB, MRNs, contact details, addresses, and exact dates. Automated checks are limited and do not establish that text is de-identified or HIPAA-safe.</span></div>
      <details className="snapshot-review"><summary>Review Snapshot before building</summary><pre>{serializedReview}</pre></details>
      <div className="snapshot-submit"><div><strong>Enough to start</strong><span>{snapshot.signals.length} change{snapshot.signals.length === 1 ? "" : "s"} selected · {populatedCount} clinical detail{populatedCount === 1 ? "" : "s"} added</span></div><button type="button" disabled={!canBuild} onClick={build}>{disabled ? "Organizing clinical signals…" : "Build my Priority Map →"}</button></div>
    </div>}
  </div>;
}
