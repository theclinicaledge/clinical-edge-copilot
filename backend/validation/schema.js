const VALID_MODES = new Set(["deterministic", "live-provider"]);
const VALID_COHORTS = new Set(["discovery", "regression", "holdout"]);
const VALID_COMPONENTS = new Set([
  "snapshot_serialization", "priority_map", "teach_me", "sbar", "urgency_consistency",
  "temporal_grounding", "trend_fidelity", "uncertainty_calibration", "treatment_safety",
  "timing_provenance",
]);

function assertString(value, path) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${path} must be a non-empty string`);
}

function validateCaseDefinition(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("case must be an object");
  ["id", "title", "clinicalDomain", "careSetting", "difficulty", "version", "cohort", "snapshotFile", "answerKeyFile", "historyFile"]
    .forEach((key) => assertString(value[key], `case.${key}`));
  if (!VALID_COHORTS.has(value.cohort)) throw new Error(`case.cohort must be one of: ${[...VALID_COHORTS].join(", ")}`);
  if (!Array.isArray(value.capabilityTags) || value.capabilityTags.length === 0) throw new Error("case.capabilityTags must be a non-empty array");
  value.capabilityTags.forEach((tag, index) => assertString(tag, `case.capabilityTags[${index}]`));
  return value;
}

function validateAnswerKey(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("answer key must be an object");
  assertString(value.caseId, "answerKey.caseId");
  if (!value.urgency || !Array.isArray(value.urgency.allowed) || value.urgency.allowed.length === 0) throw new Error("answerKey.urgency.allowed must be a non-empty array");
  if (!value.components || typeof value.components !== "object") throw new Error("answerKey.components must be an object");
  for (const [name, requirement] of Object.entries(value.components)) {
    if (!VALID_COMPONENTS.has(name)) throw new Error(`unknown component: ${name}`);
    if (!requirement || typeof requirement.required !== "boolean") throw new Error(`answerKey.components.${name}.required must be boolean`);
  }
  for (const field of ["requiredConcepts", "acceptableUncertainty", "prohibitedClaims", "prohibitedTrends", "prohibitedThresholds", "prohibitedTreatments", "requiredMissingInformation", "requiredEscalationCharacteristics"]) {
    if (value[field] !== undefined && !Array.isArray(value[field])) throw new Error(`answerKey.${field} must be an array`);
  }
  return value;
}

function validateHistory(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.events)) throw new Error("history.events must be an array");
  assertString(value.caseId, "history.caseId");
  value.events.forEach((event, index) => {
    assertString(event.id, `history.events[${index}].id`);
    assertString(event.recordedAt, `history.events[${index}].recordedAt`);
    if (!VALID_MODES.has(event.mode)) throw new Error(`history.events[${index}].mode is invalid`);
    assertString(event.status, `history.events[${index}].status`);
  });
  return value;
}

module.exports = { VALID_MODES, VALID_COHORTS, VALID_COMPONENTS, validateCaseDefinition, validateAnswerKey, validateHistory };
