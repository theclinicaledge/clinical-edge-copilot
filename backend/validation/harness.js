const fs = require("node:fs");
const path = require("node:path");
const {
  assessDeterministicUrgency,
  buildPriorityMapFallback,
  buildTeachMeFallback,
  validatePriorityMapReliability,
  hasUnsupportedDiagnosticCertainty,
  hasUnsupportedCausalAttribution,
  hasTemporalGroundingViolation,
  hasUnchangedValueTrendViolation,
  unsupportedClinicalNumericClaims,
  hasPresentPromptEscalation,
  lessonGroundingText,
} = require("../server");
const { FAILURE_TAXONOMY } = require("./failure-taxonomy");
const { validateCaseDefinition, validateAnswerKey, validateHistory } = require("./schema");

const ROOT = __dirname;
const STATUS = Object.freeze({ PASS: "PASS", FAIL: "FAIL", NOT_APPLICABLE: "NOT_APPLICABLE" });
const URGENCY_RANK = { LOW: 0, MODERATE: 1, HIGH: 2 };
const CAPABILITY_COMPONENT = Object.freeze({
  observation_vs_inference: "priority_map",
  trend_fidelity: "trend_fidelity",
  unchanged_semantics: "trend_fidelity",
  threshold_grounding: "treatment_safety",
  uncertainty: "uncertainty_calibration",
  causality: "uncertainty_calibration",
  acid_base_timing: "priority_map",
  urgency_convergence: "urgency_consistency",
  focal_neurologic_recognition: "priority_map",
  temporal_grounding: "temporal_grounding",
  perfusion_integration: "priority_map",
  current_escalation: "urgency_consistency",
  rhythm_tolerance: "priority_map",
  treatment_boundary: "treatment_safety",
  serialization: "snapshot_serialization",
  teach_me_grounding: "teach_me",
  sbar_grounding: "sbar",
});

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadCase(caseFile) {
  const casePath = path.resolve(caseFile);
  const definition = validateCaseDefinition(readJson(casePath));
  const base = path.dirname(casePath);
  const snapshot = fs.readFileSync(path.resolve(base, definition.snapshotFile), "utf8");
  const answerKey = validateAnswerKey(readJson(path.resolve(base, definition.answerKeyFile)));
  const history = validateHistory(readJson(path.resolve(base, definition.historyFile)));
  if (answerKey.caseId !== definition.id || history.caseId !== definition.id) throw new Error(`${definition.id}: linked case IDs do not match`);
  if (!/explicitly synthetic/i.test(snapshot)) throw new Error(`${definition.id}: Snapshot must be marked explicitly synthetic`);
  return { definition, snapshot, answerKey, history, casePath };
}

function generationInput(loaded) {
  return Object.freeze({ snapshot: loaded.snapshot });
}

function component(status, failureCodes = [], details = []) {
  return { status, failureCodes: [...new Set(failureCodes)], details };
}

function evaluateConcepts(text, concepts, failureCode) {
  const missing = (concepts || []).filter((concept) => !new RegExp(concept.pattern, "i").test(text));
  return missing.length ? component(STATUS.FAIL, [failureCode], missing.map((item) => `Missing concept: ${item.label}`)) : component(STATUS.PASS);
}

function scoreOutputs(loaded, generated) {
  const { snapshot, answerKey } = loaded;
  const priority = String(generated.priorityMap || "");
  const lesson = generated.teachMe || null;
  const lessonText = lesson ? [lessonGroundingText(lesson), lesson.keyIdea, lesson.whyItMatters, lesson.scenarioConnection].filter(Boolean).join("\n") : "";
  const urgency = priority.match(/^Urgency Level:\s*(LOW|MODERATE|HIGH)/m)?.[1] || null;
  const reliabilityIssues = priority ? validatePriorityMapReliability(snapshot, priority) : ["malformed_output"];
  const priorityConcepts = evaluateConcepts(priority, answerKey.requiredConcepts, "priority_integration_failure");
  const priorityFailures = [...reliabilityIssues, ...priorityConcepts.failureCodes].map((code) => ({
    certainty_overstatement: "unsupported_diagnostic_certainty",
    unsupported_numeric_claim: "unsupported_numeric_threshold",
    temporal_grounding: "temporal_grounding_error",
    unchanged_value_as_trend: "unchanged_as_change",
    urgency_escalation_conflict: "current_future_escalation_error",
    malformed_output: "malformed_output_schema",
  }[code] || code));
  if (!answerKey.urgency.allowed.includes(urgency)) {
    const expected = Math.min(...answerKey.urgency.allowed.map((item) => URGENCY_RANK[item]));
    priorityFailures.push(urgency && URGENCY_RANK[urgency] > expected ? "urgency_over_triage" : "urgency_under_triage");
  }
  const prohibited = [...(answerKey.prohibitedClaims || []), ...(answerKey.prohibitedTreatments || [])]
    .filter((rule) => new RegExp(rule.pattern, "i").test(priority));
  if (prohibited.length) priorityFailures.push(prohibited.some((item) => item.kind === "treatment") ? "unsupported_treatment" : "unsupported_diagnostic_certainty");

  const components = {
    snapshot_serialization: component(snapshot.includes("Treat omitted fields as unknown") ? STATUS.PASS : STATUS.FAIL, snapshot.includes("Treat omitted fields as unknown") ? [] : ["serialization_failure"]),
    priority_map: component(priorityFailures.length ? STATUS.FAIL : STATUS.PASS, priorityFailures, priorityConcepts.details),
    urgency_consistency: component(answerKey.urgency.allowed.includes(urgency) ? STATUS.PASS : STATUS.FAIL, answerKey.urgency.allowed.includes(urgency) ? [] : ["urgency_under_triage"]),
    temporal_grounding: component(hasTemporalGroundingViolation(snapshot, `${priority}\n${lessonText}`) ? STATUS.FAIL : STATUS.PASS, hasTemporalGroundingViolation(snapshot, `${priority}\n${lessonText}`) ? ["temporal_grounding_error"] : []),
    trend_fidelity: component(hasUnchangedValueTrendViolation(snapshot, `${priority}\n${lessonText}`) ? STATUS.FAIL : STATUS.PASS, hasUnchangedValueTrendViolation(snapshot, `${priority}\n${lessonText}`) ? ["unchanged_as_change"] : []),
    uncertainty_calibration: component(hasUnsupportedDiagnosticCertainty(`${priority}\n${lessonText}`) || hasUnsupportedCausalAttribution(snapshot, `${priority}\n${lessonText}`) ? STATUS.FAIL : STATUS.PASS, hasUnsupportedDiagnosticCertainty(`${priority}\n${lessonText}`) ? ["unsupported_diagnostic_certainty"] : hasUnsupportedCausalAttribution(snapshot, `${priority}\n${lessonText}`) ? ["association_as_causation"] : []),
    treatment_safety: component(prohibited.some((item) => item.kind === "treatment") ? STATUS.FAIL : STATUS.PASS, prohibited.some((item) => item.kind === "treatment") ? ["unsupported_treatment"] : []),
    teach_me: lesson ? evaluateConcepts(lessonText, answerKey.teachMe?.requiredConcepts || [], "teach_me_grounding_failure") : component(STATUS.NOT_APPLICABLE),
    sbar: generated.sbar ? evaluateConcepts(JSON.stringify(generated.sbar), answerKey.sbar?.requiredConcepts || [], "sbar_grounding_failure") : component(STATUS.NOT_APPLICABLE),
    timing_provenance: component(generated.provenance ? STATUS.PASS : STATUS.FAIL, generated.provenance ? [] : ["malformed_output_schema"]),
  };
  if (urgency === "HIGH" && !hasPresentPromptEscalation(priority)) components.urgency_consistency = component(STATUS.FAIL, ["current_future_escalation_error"]);
  if (unsupportedClinicalNumericClaims(snapshot, `${priority}\n${lessonText}`).length) components.treatment_safety = component(STATUS.FAIL, ["unsupported_numeric_threshold"]);

  const requiredFailures = Object.entries(answerKey.components)
    .filter(([name, rule]) => rule.required && components[name]?.status !== STATUS.PASS)
    .map(([name]) => name);
  const failureCodes = [...new Set(Object.values(components).flatMap((item) => item.failureCodes))];
  return { status: requiredFailures.length ? STATUS.FAIL : STATUS.PASS, components, requiredFailures, failureCodes, urgency };
}

async function runCase(loaded, options = {}) {
  const mode = options.mode || "deterministic";
  const input = generationInput(loaded);
  let generated;
  if (mode === "deterministic") {
    generated = {
      priorityMap: buildPriorityMapFallback(input.snapshot),
      teachMe: buildTeachMeFallback("", input.snapshot, "deterministic_validation"),
      sbar: null,
      provenance: { displayed: "deterministic_fallback", reasonCodes: ["deterministic_mode"], repairAttempted: false },
    };
  } else if (mode === "live-provider") {
    if (options.authorized !== true) throw new Error("Live-provider mode requires explicit authorization");
    if (typeof options.generateLive !== "function") throw new Error("Live-provider mode requires a production-equivalent live adapter");
    generated = await options.generateLive(input);
  } else {
    throw new Error(`Unsupported validation mode: ${mode}`);
  }
  const scoring = scoreOutputs(loaded, generated);
  return { caseId: loaded.definition.id, title: loaded.definition.title, domain: loaded.definition.clinicalDomain, version: loaded.definition.version, mode, cohort: loaded.definition.cohort, capabilityTags: loaded.definition.capabilityTags, lockState: loaded.definition.lockState, historicalRealProviderStatus: loaded.definition.historicalRealProviderStatus, ...scoring, provenance: generated.provenance };
}

function appendHistory(existing, event) {
  validateHistory(existing);
  if (existing.events.some((item) => item.id === event.id)) throw new Error(`History event already exists: ${event.id}`);
  return { ...existing, events: [...existing.events, event] };
}

function listCaseFiles() {
  return fs.readdirSync(path.join(ROOT, "cases")).filter((name) => name.endsWith(".case.json")).sort().map((name) => path.join(ROOT, "cases", name));
}

function summarize(results) {
  const countBy = (field) => results.reduce((acc, result) => { const key = result[field]; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const capability = {};
  const failures = {};
  const provenance = {};
  for (const result of results) {
    result.capabilityTags.forEach((tag) => {
      capability[tag] ||= { cases: 0, passed: 0, failed: 0, notApplicable: 0 };
      capability[tag].cases += 1;
      const status = result.components[CAPABILITY_COMPONENT[tag]]?.status || result.status;
      if (status === STATUS.PASS) capability[tag].passed += 1;
      else if (status === STATUS.FAIL) capability[tag].failed += 1;
      else capability[tag].notApplicable += 1;
    });
    result.failureCodes.forEach((code) => { failures[code] = (failures[code] || 0) + 1; });
    const key = result.provenance?.displayed || "unknown"; provenance[key] = (provenance[key] || 0) + 1;
  }
  return { totalCases: results.length, passed: results.filter((item) => item.status === STATUS.PASS).length, failed: results.filter((item) => item.status === STATUS.FAIL).length, byMode: countBy("mode"), byDomain: countBy("domain"), byCapability: capability, failureCodeCounts: failures, provenanceDistribution: provenance, locked: results.filter((item) => item.lockState === "LOCKED").length, notLocked: results.filter((item) => item.lockState !== "LOCKED").length, requiringLiveProviderValidation: results.filter((item) => item.historicalRealProviderStatus !== "REAL_PROVIDER_PASS").map((item) => item.caseId) };
}

module.exports = { ROOT, STATUS, FAILURE_TAXONOMY, loadCase, generationInput, scoreOutputs, runCase, appendHistory, listCaseFiles, summarize };
