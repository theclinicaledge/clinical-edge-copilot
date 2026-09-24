export const PERFUSION_CORE_FIELDS = [
  { id: "bp", type: "trend", label: "Blood pressure", unit: "mmHg", placeholder: "88/50" },
  { id: "map", type: "trend", label: "MAP", unit: "mmHg", placeholder: "61" },
  { id: "hr", type: "trend", label: "Heart rate", unit: "bpm", placeholder: "112" },
  { id: "rhythm", type: "text", label: "Rhythm", placeholder: "Sinus rhythm, AF, paced..." },
  { id: "mental", type: "choice", label: "Mental-status change", options: ["At baseline", "Changed", "Unable to assess"] },
  { id: "perfusionState", type: "choice", label: "Perfusion findings", options: ["Warm / dry", "Cool / clammy", "Weak pulses", "Delayed capillary refill", "Mottling", "Other"] },
  { id: "urine", type: "trend", label: "Urine output", unit: "mL/hr", placeholder: "25" },
  { id: "timeframe", type: "text", label: "Timeframe of change", placeholder: "Over 2 hours" },
];

export const PERFUSION_MODULES = [
  {
    id: "perfusionAssessment", label: "Perfusion assessment", description: "Focused bedside findings",
    fields: [
      { id: "mentalDetail", type: "text", label: "Mental status", placeholder: "Baseline and current finding" },
      { id: "skinTemperature", type: "choice", label: "Skin temperature", options: ["Warm", "Cool", "Cold", "Uneven"] },
      { id: "capillaryRefill", type: "text", label: "Capillary refill", unit: "seconds", placeholder: "3" },
      { id: "pulses", type: "text", label: "Pulses", placeholder: "Strength and location" },
      { id: "mottling", type: "choice", label: "Mottling", options: ["Not observed", "Present", "Worsening"] },
      { id: "extremities", type: "text", label: "Extremity findings", placeholder: "Color, temperature, symmetry" },
      { id: "otherPerfusion", type: "text", label: "Other assessment detail", placeholder: "Other relevant finding" },
    ],
  },
  {
    id: "hemodynamics", label: "Hemodynamics", description: "Advanced measurements when available",
    fields: [
      { id: "cvp", type: "trend", label: "CVP", unit: "mmHg" },
      { id: "co", type: "trend", label: "CO", unit: "L/min" },
      { id: "ci", type: "trend", label: "CI", unit: "L/min/m2" },
      { id: "svr", type: "trend", label: "SVR", unit: "dynes-sec/cm5" },
      { id: "pap", type: "trend", label: "PAP systolic / diastolic", unit: "mmHg" },
      { id: "paMean", type: "trend", label: "PA mean", unit: "mmHg" },
      { id: "svo2", type: "trend", label: "SvO2 / ScvO2", unit: "%" },
      { id: "otherHemodynamic", type: "text", label: "Other advanced measurement", placeholder: "Measurement, value, and unit" },
    ],
  },
  {
    id: "perfusionLabs", label: "Labs", description: "Relevant results and direction of change",
    fields: [
      { id: "lactate", type: "trend", label: "Lactate", unit: "mmol/L" },
      { id: "hemoglobin", type: "trend", label: "Hemoglobin", unit: "g/dL" },
      { id: "hematocrit", type: "trend", label: "Hematocrit", unit: "%" },
      { id: "creatinine", type: "trend", label: "Creatinine", unit: "mg/dL" },
      { id: "potassium", type: "trend", label: "Potassium", unit: "mmol/L" },
      { id: "otherLabs", type: "repeatable", label: "Other relevant lab", itemLabel: "Lab", fields: [
        { id: "name", label: "Lab name", placeholder: "Troponin" }, { id: "previous", label: "Previous" },
        { id: "current", label: "Current" }, { id: "unit", label: "Unit" },
      ] },
    ],
  },
  {
    id: "drips", label: "Drips", description: "Current support and recent changes",
    fields: [{ id: "items", type: "repeatable", label: "Drip", itemLabel: "Drip", fields: [
      { id: "medication", label: "Medication", placeholder: "Norepinephrine" }, { id: "currentDose", label: "Current dose" },
      { id: "unit", label: "Unit", placeholder: "mcg/kg/min" }, { id: "previousDose", label: "Previous dose" },
      { id: "direction", label: "Direction", placeholder: "Increased / decreased" }, { id: "time", label: "Time of change" },
      { id: "response", label: "Response", placeholder: "Observed response" },
    ] }],
  },
  {
    id: "interventions", label: "Fluids / interventions", description: "What was given and the observed response",
    fields: [{ id: "items", type: "repeatable", label: "Intervention", itemLabel: "Intervention", fields: [
      { id: "type", label: "Type", placeholder: "Fluid bolus" }, { id: "amount", label: "Amount", placeholder: "250 mL" },
      { id: "time", label: "Time given" }, { id: "response", label: "Clinical response" },
    ] }],
  },
  {
    id: "drains", label: "Drains / bleeding", description: "Output, appearance, and bleeding concerns",
    fields: [{ id: "items", type: "repeatable", label: "Drain", itemLabel: "Drain", fields: [
      { id: "type", label: "Drain type", placeholder: "Mediastinal chest tube" }, { id: "currentOutput", label: "Current output", placeholder: "mL/hr" },
      { id: "previousOutput", label: "Previous output / trend" }, { id: "appearance", label: "Appearance" },
      { id: "patency", label: "Patency concern" }, { id: "bleeding", label: "Suspected bleeding" },
    ] }],
  },
];

export function perfusionModulesFor(snapshot) {
  if (!snapshot.signals.includes("perfusion")) return [];
  const intensive = ["ICU", "CTICU"].includes(snapshot.setting);
  const postoperative = snapshot.contexts.includes("Post-op");
  return PERFUSION_MODULES.filter((module) => {
    if (module.id === "hemodynamics") return intensive;
    if (module.id === "drains") return intensive || postoperative;
    return true;
  });
}
