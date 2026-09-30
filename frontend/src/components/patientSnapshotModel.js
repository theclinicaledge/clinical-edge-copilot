const SIGNAL_LABELS = {
  off: "Something feels off", perfusion: "BP / perfusion", breathing: "Breathing",
  heart: "Heart / rhythm", neuro: "Neuro", urine: "Urine output", bleeding: "Bleeding",
  labs: "Labs / glucose", pain: "Pain / other",
};

const FIELD_LABELS = {
  mental: "Mental status", urineState: "Urine output", perfusionState: "Perfusion", perfusionFindings: "Perfusion",
  wob: "Work of breathing", bleedingState: "Bleeding concern", loc: "Level of consciousness",
  focal: "Focal neurologic change", chestPain: "Chest discomfort", foley: "Foley",
  respFindings: "Respiratory findings", rhythm: "Rhythm change", glucose: "Glucose",
  fluidContext: "Fluid context", bleedingSource: "Source / type", drainage: "Drainage / output trend",
  hgb: "Hgb / Hct trend", labName: "Lab or glucose", labEarlier: "Lab earlier",
  labNow: "Lab now", painDetail: "Pain or other change",
  timeframe: "Timeframe of change", urineTimeframe: "Urine-output timeframe", overallConcern: "Brief overall concern",
  mentalDetail: "Mental status detail", skinTemperature: "Skin temperature",
  capillaryRefill: "Capillary refill", pulses: "Pulses", mottling: "Mottling", extremities: "Extremity findings",
  otherPerfusion: "Other perfusion assessment", otherHemodynamic: "Other advanced measurement",
  urineAmount: "Urine output amount", urineIntervalValue: "Urine output interval",
  urineIntervalUnit: "Urine output interval unit", urineRate: "Urine output documented rate",
};

const TREND_FIELDS = {
  bp: ["BP", "mmHg"], map: ["MAP", "mmHg"], hr: ["Heart rate", "bpm"],
  rr: ["Respiratory rate", "/min"], spo2: ["SpO₂", "%"], oxygen: ["Oxygen support", ""],
  temp: ["Temperature", "°C"], urine: ["Urine output", "mL/hr"], cvp: ["CVP", "mmHg"],
  co: ["CO", "L/min"], ci: ["CI", "L/min/m2"], svr: ["SVR", "dynes-sec/cm5"],
  pap: ["PAP systolic / diastolic", "mmHg"], paSystolic: ["PA systolic", "mmHg"],
  paDiastolic: ["PA diastolic", "mmHg"], paMean: ["PA mean", "mmHg"], svo2: ["SvO2 / ScvO2", "%"],
  lactate: ["Lactate", "mmol/L"], hemoglobin: ["Hemoglobin", "g/dL"], hematocrit: ["Hematocrit", "%"],
  creatinine: ["Creatinine", "mg/dL"], potassium: ["Potassium", "mmol/L"],
};

const SECTION_LABELS = {
  vitals: "Vitals", assessment: "Assessment", labs: "Labs", support: "Meds & support",
  devices: "Devices", advanced: "Advanced",
  perfusionAssessment: "Perfusion assessment", hemodynamics: "Hemodynamics", perfusionLabs: "Labs",
  drips: "Drips", interventions: "Fluids / interventions", drains: "Drains / bleeding",
};

function hasStructuredValue(value) {
  if (Array.isArray(value)) return value.some(hasStructuredValue);
  if (value && typeof value === "object") return Object.values(value).some(hasStructuredValue);
  return value !== "" && value !== null && value !== undefined;
}

function formatModuleValue(value) {
  if (Array.isArray(value)) {
    const populated = value.filter(hasStructuredValue);
    if (populated.every((item) => typeof item !== "object" || item === null)) {
      return populated.map(String).join(", ");
    }
    return populated.map((item, index) => `${index + 1}) ${formatModuleValue(item)}`).join(" | ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, detail]) => hasStructuredValue(detail))
      .map(([key, detail]) => `${key}=${formatModuleValue(detail)}`)
      .join(", ");
  }
  return String(value);
}

export function serializePatientSnapshot(snapshot) {
  const lines = [
    "PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION",
    `What changed: ${snapshot.signals.map((id) => SIGNAL_LABELS[id]).filter(Boolean).join(", ")}`,
  ];
  if (snapshot.setting) lines.push(`Care setting: ${snapshot.setting}`);
  if (snapshot.contexts.length) lines.push(`Clinical context: ${snapshot.contexts.join(", ")}`);

  const reported = [];
  const urineKeys = new Set(["urineAmount", "urineIntervalValue", "urineIntervalUnit", "urineRate", "urineState"]);
  const trendStateKeys = new Set(Object.keys(TREND_FIELDS).map((key) => `${key}State`));
  Object.entries(snapshot.values).forEach(([key, value]) => {
    if (!value || urineKeys.has(key) || key.endsWith("Earlier") || key.endsWith("Now") || trendStateKeys.has(key) || TREND_FIELDS[key]) return;
    const rendered = Array.isArray(value) ? value.join(", ") : value;
    reported.push(`${FIELD_LABELS[key] || key}: ${rendered}`);
  });
  const urineAmount = snapshot.values.urineAmount;
  const urineIntervalValue = snapshot.values.urineIntervalValue;
  const urineIntervalUnit = snapshot.values.urineIntervalUnit;
  const urineRate = snapshot.values.urineRate;
  const urineState = snapshot.values.urineState;
  if (urineAmount) {
    const interval = urineIntervalValue ? ` over ${urineIntervalValue} ${urineIntervalUnit || "hour"}${String(urineIntervalValue) === "1" ? "" : "s"}` : " (interval not entered)";
    reported.push(`Urine output: amount ${urineAmount} mL${interval}`);
  } else if (urineRate) {
    reported.push(`Urine output: documented rate ${urineRate} mL/hr`);
  } else if (urineState) {
    reported.push(`Urine output: qualitative ${urineState}`);
  }
  Object.entries(TREND_FIELDS).forEach(([key, [label, unit]]) => {
    const earlier = snapshot.values[`${key}Earlier`];
    const now = snapshot.values[`${key}Now`];
    const state = snapshot.values[`${key}State`];
    const hasUnitOverride = Object.prototype.hasOwnProperty.call(snapshot.units || {}, key);
    const groundedUnit = hasUnitOverride ? snapshot.units[key] : unit;
    if (earlier || now) reported.push(`${label}: previous ${earlier || "unknown"} -> current ${now || "unknown"}${groundedUnit ? ` ${groundedUnit}` : hasUnitOverride ? " (unit not supplied)" : ""}`);
    else if (state) reported.push(`${label}: ${state}`);
  });
  Object.entries(snapshot.optional).forEach(([section, values]) => {
    const populated = Object.entries(values || {}).filter(([, value]) => hasStructuredValue(value));
    if (populated.length) reported.push(`${SECTION_LABELS[section] || section}: ${populated.map(([key, value]) => `${key}=${formatModuleValue(value)}`).join("; ")}`);
  });
  if (reported.length) lines.push("Reported clinical data:", ...reported.map((line) => `- ${line}`));
  if (snapshot.notes.trim()) lines.push(`Additional user-reported context: ${snapshot.notes.trim()}`);
  lines.push("Treat omitted fields as unknown. Do not infer normal findings.");
  return lines.join("\n");
}
