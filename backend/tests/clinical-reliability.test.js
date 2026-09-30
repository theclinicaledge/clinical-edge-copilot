const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ANTHROPIC_API_KEY ||= "test-key";

const {
  CLINICAL_RELIABILITY_CONTRACT,
  evaluateReliabilityFixture,
  hasCertaintyOverstatement,
  hasAcidBaseReliabilityViolation,
  hasUnsupportedCausalAttribution,
  unsupportedClinicalNumericClaims,
  hasUnsupportedDiagnosticCertainty,
  excludesUnresolvedAlternative,
  assessNeurologicPattern,
  comparisonSemantics,
  temporalGroundingSummary,
  hasTemporalGroundingViolation,
  hasUnchangedValueTrendViolation,
  assessPerfusionPattern,
  assessRhythmHemodynamicPattern,
  assessDeterministicUrgency,
  hasPresentPromptEscalation,
  validateUrgencyConsistency,
  validatePriorityMapReliability,
  buildPriorityMapFallback,
  buildTeachMeFallback,
  resolvePriorityMap,
  runPriorityMapWithBudget,
  sanitizeSbarText,
  groundSbarTemporalFidelity,
  validateSbarReliability,
  buildSbarFallback,
  runSbarWithBudget,
  highUrgencyRecommendationIsAligned,
  lessonGroundingText,
  sourceSupportsTrend,
  SBAR_SYSTEM_PROMPT,
  SHIFT_BRAIN_RESPONSE_CONTRACT,
  TEACH_ME_RELIABILITY_PROMPT,
  unsupportedNumericThresholds,
  unsupportedTrendClaims,
  unsupportedMeasurementTrendClaims,
  hasUnsupportedEstablishedTrendClaim,
} = require("../server");

const GOLD_SOURCE = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
What changed: BP / perfusion
Care setting: CTICU
Clinical context: Post-op, Cardiac
Reported clinical data:
- MAP: previous 74 -> current 61 mmHg
- Heart rate: previous 88 -> current 104 bpm
- Urine output: previous 60–75 -> current 20 mL/hr
- CI: previous 2.4 -> current 1.7 L/min/m2
- SVR: previous 1050 -> current 1620 dynes-sec/cm5
- CVP: previous 9 -> current 4 mmHg
- Lactate: previous 1.8 -> current 3.1 mmol/L
- Hemoglobin: previous 10.2 -> current 9.4 g/dL
- Drains / bleeding: type=mediastinal drain, currentOutput=40 mL
Treat omitted fields as unknown. Do not infer normal findings.`;

const GROUNDED_PRIORITY_MAP = `Urgency Level: HIGH

**Priorities**
### 1 · Worsening perfusion
Relevance: High priority
Observed:
- MAP fell from 74 to 61 mmHg
- CI fell from 2.4 to 1.7 L/min/m2 while SVR rose from 1050 to 1620 dynes-sec/cm5
- Current mediastinal drain output was reported as 40 mL
Interpretation: These changes may reflect a low-output, high-resistance state with worsening perfusion; the cause is not established.
Assess now:
- Current perfusion and postoperative assessment

**Assess first**
- Focused hemodynamic and perfusion reassessment

**Possible patterns**
- Pump dysfunction may contribute to the low-output physiology.
- Bleeding or reduced preload could remain possible given the falling filling pressure and hemoglobin.
- Tamponade remains a postoperative consideration; however, the falling CVP is not the typical pattern, so waveform quality, exam, and imaging would help discriminate it from other causes.

**Missing information**
- Drain-output time basis and prior output

**Monitor and trend**
- Future drain output should be compared with a time basis rather than inferred from the current 40 mL measurement.

**Escalation triggers**
- The existing perfusion decline supports prompt team evaluation now.
- Further perfusion decline would increase concern.

**SBAR-ready summary**
The reported hemodynamics show worsening perfusion with uncertain cause.

**Teach me why**
Rising SVR can reflect compensation during falling cardiac output, but it does not establish the etiology.`;

test("single-value trend protection distinguishes current measurements from trends", () => {
  assert.deepEqual(unsupportedTrendClaims(GOLD_SOURCE, "Drain output is trending down.", ["drain output"]), ["drain output"]);
  assert.deepEqual(unsupportedTrendClaims(GOLD_SOURCE, "Current mediastinal drain output was reported as 40 mL.", ["drain output"]), []);
  assert.deepEqual(unsupportedTrendClaims(GOLD_SOURCE, "MAP fell from 74 to 61 mmHg.", ["MAP"]), []);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /single current measurement is only a current measurement/i);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /atypical filling-pressure direction must be acknowledged/i);
  assert.match(require("../server").SHIFT_BRAIN_RESPONSE_CONTRACT, /Do not invent universal numeric thresholds/i);
});

test("observed findings remain separate from inferred etiologies", () => {
  const result = evaluateReliabilityFixture({
    source: GOLD_SOURCE,
    priorityMap: GROUNDED_PRIORITY_MAP,
    trendTerms: ["drain output"],
    inferredTerms: ["tamponade", "pump dysfunction", "hypovolemia"],
  });
  assert.deepEqual(result.observedInferenceTerms, []);
  assert.deepEqual(result.unsupportedPriorityTrends, []);
});

test("possible contributors are qualified and conflicting evidence is explicit", () => {
  const result = evaluateReliabilityFixture({ source: GOLD_SOURCE, priorityMap: GROUNDED_PRIORITY_MAP });
  assert.equal(result.contributorsQualified, true);
  assert.equal(result.priorityCertaintyOverstatement, false);
  assert.match(GROUNDED_PRIORITY_MAP, /however, the falling CVP is not the typical pattern/i);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /additional information that would help discriminate/i);
});

test("HIGH urgency SBAR requires prompt evaluation without treatment prescription", () => {
  assert.equal(highUrgencyRecommendationIsAligned("I'm concerned about the worsening hemodynamics and would like you to evaluate the patient now."), true);
  assert.equal(highUrgencyRecommendationIsAligned("I'd like you to evaluate the patient in a timely way."), false);
  assert.equal(highUrgencyRecommendationIsAligned("Wanted to get your input before moving forward."), false);
  assert.equal(highUrgencyRecommendationIsAligned("Please start a fluid bolus now."), false);
  assert.match(SBAR_SYSTEM_PROMPT, /HIGH: Clearly request prompt evaluation or escalation/i);
  assert.match(SBAR_SYSTEM_PROMPT, /Do not invent sex, gender, pronouns, postoperative timing/i);
});

test("Teach Me inherits evidence, uncertainty, and trend constraints", () => {
  const groundedLesson = "Rising SVR can represent compensatory vasoconstriction during falling cardiac output. The pattern does not establish the cause. Current drain output was reported as 40 mL.";
  const result = evaluateReliabilityFixture({ source: GOLD_SOURCE, lessonText: groundedLesson, trendTerms: ["drain output"] });
  assert.deepEqual(result.unsupportedLessonTrends, []);
  assert.equal(result.lessonCertaintyOverstatement, false);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /Snapshot is the source of truth/i);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /do not inherit the error/i);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /Prefer a well-supported physiologic or trend principle/i);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /Avoid "classic signs"/i);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /A false magic number is still unsafe teaching content even when it is a distractor/i);
});

test("Teach Me grounding evaluates correct teaching content, not incorrect distractors", () => {
  const lesson = {
    conceptLabel: "Compensatory vasoconstriction",
    question: {
      stem: "What does rising SVR mean when cardiac output falls?",
      choices: [
        { id: "a", label: "It may reflect compensation for falling output." },
        { id: "b", label: "It confirms tamponade." },
        { id: "c", label: "It proves distributive shock." },
      ],
      correctChoiceId: "a",
      explanation: "The same response can occur with several low-output contributors.",
    },
    scenarioConnection: "The supplied CI and SVR trends fit a compensatory pattern without establishing the cause.",
    application: null,
  };
  const grounding = lessonGroundingText(lesson);
  assert.doesNotMatch(grounding, /confirms tamponade|proves distributive/i);
  assert.equal(hasCertaintyOverstatement(grounding), false);
  assert.deepEqual(unsupportedNumericThresholds("Current MAP: 61 mmHg", JSON.stringify(lesson)), []);
});

test("Teach Me numeric grounding includes incorrect distractors", () => {
  const lesson = {
    question: {
      stem: "What matters most?",
      choices: [
        { id: "a", label: "The supported trajectory." },
        { id: "b", label: "Escalate if MAP falls below 60 mmHg." },
        { id: "c", label: "An unsupported diagnosis." },
      ],
      correctChoiceId: "a",
      explanation: "Trajectory and context matter.",
    },
  };
  assert.deepEqual(unsupportedNumericThresholds("Current MAP: 61 mmHg", JSON.stringify(lesson)), [60]);
});

test("unsupported model-generated numeric escalation thresholds are rejected", () => {
  const source = "- Lactate: previous 1.8 -> current 3.1 mmol/L";
  assert.deepEqual(unsupportedNumericThresholds(source, "Escalate if lactate rises above 4 mmol/L."), [4]);
  assert.deepEqual(unsupportedNumericThresholds(source, "Lactate increased from 1.8 to 3.1 mmol/L."), []);
  assert.deepEqual(unsupportedNumericThresholds(source, "Continued lactate rise alongside worsening perfusion would increase concern."), []);
});

test("an explicitly supplied target may be referenced as supplied context", () => {
  const source = "Ordered MAP goal: 65 mmHg";
  assert.deepEqual(unsupportedNumericThresholds(source, "Provider awareness may be appropriate while MAP remains below the ordered goal of 65 mmHg."), []);
  assert.deepEqual(unsupportedNumericThresholds("Current MAP: 65 mmHg", "Escalate if MAP falls below 65 mmHg."), [65]);
});

test("Priority Map, Teach Me, and SBAR share the numeric-grounding contract", () => {
  assert.match(SHIFT_BRAIN_RESPONSE_CONTRACT, /Never introduce a new numeric decision threshold/i);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /Never introduce a new numeric decision threshold/i);
  assert.match(SBAR_SYSTEM_PROMPT, /Never introduce a new numeric decision threshold/i);
});

test("short-timescale ABG changes cannot be labeled new renal compensation", () => {
  const source = "Timeframe of change: Over 2 hours\n- pH: previous 7.36 -> current 7.29\n- PaCO2: previous 48 -> current 60 mmHg\n- HCO3: previous 26 -> current 28 mEq/L";
  assert.equal(hasAcidBaseReliabilityViolation(source, "The bicarbonate rise reflects early renal compensation."), true);
  assert.equal(hasAcidBaseReliabilityViolation(source, "The rising PaCO2 with falling pH supports worsening respiratory acidemia. The modest bicarbonate change does not establish its mechanism."), false);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /Never explain a bicarbonate change over hours as newly developed renal compensation/i);
});

test("unknown chronicity remains unknown", () => {
  const source = "Current pH 7.29, PaCO2 60 mmHg, HCO3 28 mEq/L. Baseline is unavailable.";
  assert.equal(hasAcidBaseReliabilityViolation(source, "This is chronic respiratory acidosis."), true);
  assert.equal(hasAcidBaseReliabilityViolation("Known chronic respiratory acidosis at baseline.", "This is chronic respiratory acidosis."), false);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /Chronicity requires adequate historical or baseline information/i);
});

test("plausible contributors remain qualified when causation is not established", () => {
  const source = "PaCO2 rose and the patient is newly drowsy. Medication exposure is unknown.";
  assert.equal(hasUnsupportedCausalAttribution(source, "Hypercapnia caused the drowsiness."), true);
  assert.equal(hasUnsupportedCausalAttribution(source, "Worsening hypercapnia may be contributing to the drowsiness, while medication exposure and other causes remain unknown."), false);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /Do not convert correlation or physiologic plausibility into causation/i);
});

test("Teach Me inherits acid-base timescale and causality protections", () => {
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /renal compensation, which develops on a substantially slower timescale/i);
  assert.match(TEACH_ME_RELIABILITY_PROMPT, /Do not convert correlation or physiologic plausibility into causation/i);
  assert.match(SBAR_SYSTEM_PROMPT, /Never explain a bicarbonate change over hours/i);
});

const RESPIRATORY_SOURCE = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
Reported clinical data:
- Mental status: Changed
- Work of breathing: Increased
- Respiratory rate: previous 18 -> current 30 /min
- Oxygen support: previous 2 L/min nasal cannula -> current 6 L/min nasal cannula
- Labs: selected=ABG / VBG; detail=Earlier ABG: pH 7.36, PaCO2 48 mmHg, HCO3 26 mEq/L. Current ABG: pH 7.29, PaCO2 60 mmHg, HCO3 28 mEq/L.
Additional user-reported context: Timeframe approximately 2 hours. More drowsy than earlier. Medication and sedation exposure unknown.`;

const NEUROLOGIC_SOURCE = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
What changed: Something feels off, Neuro
Care setting: PCU / Step-down
Clinical context: Neurologic
Reported clinical data:
- Mental status: Changed
- Focal neurologic change: Present
- Glucose: 112 mg/dL
- BP: previous 138/76 -> current 178/94 mmHg
- Heart rate: previous 82 -> current 88 bpm
- SpO2: previous 97 -> current 97 %
- Oxygen support: previous Room air -> current Room air
- Temperature: previous unknown -> current 36.9 C
Additional user-reported context: Change recognized within approximately the last 30 minutes; exact symptom onset and last known well are unknown. Earlier: awake, oriented, interacting normally; speech clear; face symmetric; moved all extremities without reported focal weakness. Now: confused with difficulty answering orientation questions; new slurred speech; new left facial asymmetry; new left arm weakness compared with the right; new headache reported, with no severity score supplied. No seizure was witnessed. No fall was reported. Sedative or opioid administration information is unavailable. Anticoagulant or antiplatelet status is unknown. No imaging results are available.
Treat omitted fields as unknown. Do not infer normal findings.`;

const SYSTEMIC_PERFUSION_SOURCE = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
What changed: Something feels off, BP / perfusion, Neuro, Labs / glucose
Care setting: PCU / Step-down
Clinical context: Infection / sepsis concern
Reported clinical data:
- Timeframe of change: Approximately 4 hours
- Urine-output timeframe: Recent monitoring period
- Mental status: Changed
- Lab or glucose: WBC
- BP: previous 118/68 -> current 92/54 mmHg
- MAP: previous 85 -> current 67 mmHg
- Heart rate: previous 88 -> current 112 bpm
- Respiratory rate: previous 18 -> current 26 /min
- SpO2: previous 96 -> current 95 %
- Oxygen support: previous Room air -> current Room air
- Temperature: previous 37.2 C -> current 38.6 C
- Urine output: previous 50-60 -> current 20 mL/hr
- Lactate: previous 1.7 -> current 3.2 mmol/L
- Creatinine: previous 0.9 -> current 1.4 mg/dL
Additional user-reported context: Earlier: awake and oriented with warm extremities. Current: more confused than earlier, answers slowly but remains arousable; extremities cool with capillary refill approximately 4 seconds. Lactate earlier 1.7 mmol/L and current 3.2 mmol/L. Current WBC 18.4 x10^3/uL; no earlier WBC is available. Creatinine earlier 0.9 mg/dL and current 1.4 mg/dL. New productive cough is reported. No chest pain or active bleeding is reported. No current vasopressor or inotrope support is reported. No culture or imaging results are available. No confirmed infectious source is available. Medication administration history relevant to the current deterioration is incomplete.
Treat omitted fields as unknown. Do not infer normal findings.`;

const RHYTHM_HEMODYNAMIC_SOURCE = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
What changed: Something feels off, BP / perfusion, Heart / rhythm, Pain / other
Care setting: PCU / Step-down
Reported clinical data:
- Timeframe of change: Change recognized over approximately 20 minutes; exact rhythm onset unknown
- Rhythm change: Earlier sinus rhythm; current new irregular rhythm reported on bedside monitoring; exact rhythm not confirmed
- Mental status: At baseline
- Chest discomfort: None reported
- Pain or other change: Palpitations and lightheadedness
- BP: previous 124/70 -> current 88/54 mmHg
- MAP: previous 88 -> current 65 mmHg
- Heart rate: previous 82 -> current 148 bpm
- Respiratory rate: previous 18 -> current 22 /min
- SpO2: previous 97 -> current 96 %
- Oxygen support: previous Room air -> current Room air
- Temperature: previous unknown -> current 36.8 C
- Potassium: previous unknown -> current 3.4 mmol/L
- Labs: otherLabs=1) name=Magnesium, current=1.8, unit=mg/dL
Additional user-reported context: Earlier: awake and oriented. Current: awake, reports feeling lightheaded, and answers appropriately. Current extremities are cool; no earlier peripheral-perfusion comparison is available. Current potassium is 3.4 mEq/L and current magnesium is 1.8 mg/dL; no earlier potassium or magnesium is available. No syncope or chest pain is reported. Exact rhythm onset is unknown. No 12-lead ECG interpretation is available. Medication administration relevant to the rhythm change is unknown. Baseline cardiac rhythm history is unavailable. No pacemaker or device information is supplied. No treatment has been supplied.
Treat omitted fields as unknown. Do not infer normal findings.`;

test("Priority Map validator rejects the preserved Gold Case 2 language failures", () => {
  const unsafe = `### 1 · Worsening hypercapnic respiratory failure
Interpretation: CO2 accumulation caused the drowsiness. This is not sedation.
**Teach me why**
Meaningful renal compensation takes 3 to 5 days.`;
  assert.deepEqual(validatePriorityMapReliability(RESPIRATORY_SOURCE, unsafe).sort(), [
    "excluded_alternative",
    "unsupported_causality",
    "unsupported_diagnostic_certainty",
    "unsupported_numeric_claim",
  ]);
  assert.equal(hasUnsupportedDiagnosticCertainty("Worsening hypercapnic respiratory failure"), true);
  assert.equal(excludesUnresolvedAlternative(RESPIRATORY_SOURCE, "This is not sedation."), true);
  assert.equal(hasUnsupportedCausalAttribution(RESPIRATORY_SOURCE, "Increasing CO2 directly impairs mentation."), true);
  assert.equal(hasUnsupportedCausalAttribution(RESPIRATORY_SOURCE, "CO2 acts as a direct CNS depressant, and hypercapnia impairs mentation."), true);
  assert.deepEqual(unsupportedClinicalNumericClaims(RESPIRATORY_SOURCE, "Renal compensation takes 3 to 5 days."), ["timeline:3 to 5 days"]);
});

test("Priority Map validator accepts calibrated ventilation and causality language", () => {
  const safe = `### 1 · Worsening ventilation with respiratory acidemia
Interpretation: The combination raises concern for worsening ventilatory function. Hypercapnia may be contributing to the drowsiness.
**Missing information**
- Medication/sedation exposure and neurologic or metabolic contributors remain important to clarify.`;
  assert.deepEqual(validatePriorityMapReliability(RESPIRATORY_SOURCE, safe), []);
});

test("converging respiratory deterioration is HIGH without a case-specific trigger", () => {
  const assessment = assessDeterministicUrgency(RESPIRATORY_SOURCE);
  assert.equal(assessment.urgency, "HIGH");
  assert.equal(assessment.convergingDeterioration, true);
  assert.deepEqual(assessment.signals.sort(), [
    "increased_oxygen_support",
    "increased_work_of_breathing",
    "mental_status_deterioration",
    "worsening_respiratory_acidemia",
  ]);

  const fallback = buildPriorityMapFallback(RESPIRATORY_SOURCE, "Urgency Level: MODERATE");
  assert.match(fallback, /^Urgency Level: HIGH/m);
  assert.deepEqual(validateUrgencyConsistency(RESPIRATORY_SOURCE, fallback), []);
});

test("mild isolated respiratory data is not promoted to HIGH", () => {
  const source = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
Reported clinical data:
- Mild cough
- Respiratory rate: current 20 /min
- Oxygen support: room air`;
  assert.notEqual(assessDeterministicUrgency(source).urgency, "HIGH");
  assert.doesNotMatch(buildPriorityMapFallback(source), /^Urgency Level: HIGH/m);
});

test("sparse data is not promoted to HIGH", () => {
  const source = "PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\n- General concern reported";
  assert.equal(assessDeterministicUrgency(source).urgency, "LOW");
  assert.doesNotMatch(buildPriorityMapFallback(source), /^Urgency Level: HIGH/m);
});

test("non-respiratory converging deterioration is HIGH", () => {
  const assessment = assessDeterministicUrgency(GOLD_SOURCE);
  assert.equal(assessment.urgency, "HIGH");
  assert.equal(assessment.convergingDeterioration, true);
  assert.ok(assessment.signals.includes("converging_perfusion_trends"));
  assert.match(buildPriorityMapFallback(GOLD_SOURCE), /^Urgency Level: HIGH/m);
});

test("Gold Case 4 fallback integrates systemic perfusion and end-organ deterioration", () => {
  const pattern = assessPerfusionPattern(SYSTEMIC_PERFUSION_SOURCE);
  assert.equal(pattern.convergingSystemicPerfusion, true);
  assert.deepEqual(pattern.domains, {
    hemodynamic: true,
    peripheral: true,
    renal: true,
    metabolic: true,
    neurologic: true,
    systemicStress: true,
  });

  const assessment = assessDeterministicUrgency(SYSTEMIC_PERFUSION_SOURCE);
  const fallback = buildPriorityMapFallback(SYSTEMIC_PERFUSION_SOURCE);
  assert.equal(assessment.urgency, "HIGH");
  assert.match(fallback, /^Urgency Level: HIGH/m);
  assert.match(fallback, /Worsening systemic perfusion with end-organ warning signs/);
  assert.match(fallback, /BP: previous 118\/68 -> current 92\/54 mmHg/);
  assert.match(fallback, /MAP: previous 85 -> current 67 mmHg/);
  assert.match(fallback, /Heart rate: previous 88 -> current 112 bpm/);
  assert.match(fallback, /cool extremities and delayed capillary refill/i);
  assert.match(fallback, /Urine output: previous 50-60 -> current 20 mL\/hr/);
  assert.match(fallback, /Lactate: previous 1\.7 -> current 3\.2 mmol\/L/);
  assert.match(fallback, /Creatinine: previous 0\.9 -> current 1\.4 mg\/dL/);
  assert.match(fallback, /mental status is reported as changed/i);
  assert.match(fallback, /infectious process a possible contributor/i);
  assert.match(fallback, /do not establish sepsis, septic shock, pneumonia/i);
  assert.match(fallback, /Current WBC is reported as 18\.4 x10\^3\/uL; no direction is inferred/i);
  assert.match(fallback, /Oxygen support remained unchanged/i);
  assert.match(fallback, /supports prompt team awareness and bedside evaluation now/i);
  assert.match(fallback, /not required before escalation/i);
  assert.doesNotMatch(fallback, /\bWBC\b[^.\n]*(?:rising|increasing|increased|worsening)/i);
  assert.doesNotMatch(fallback, /\b(?:start|give|administer|bolus|titrate)\b/i);
  assert.deepEqual(validatePriorityMapReliability(SYSTEMIC_PERFUSION_SOURCE, fallback), []);
});

test("perfusion convergence is not a count of abnormal or infection-related fields", () => {
  const feverAndWbc = [
    "Reported clinical data:",
    "- Temperature: current 38.6 C",
    "- WBC: current 18.4 x10^3/uL",
    "- BP: current 118/68 mmHg",
  ].join("\n");
  const mildBpChange = "- BP: previous 118/68 -> current 112/66 mmHg";
  const stableAbnormalities = [
    "- BP: previous 92/54 -> current 92/54 mmHg",
    "- Heart rate: previous 112 -> current 112 bpm",
    "- Lactate: previous 3.2 -> current 3.2 mmol/L",
    "- Creatinine: previous 1.4 -> current 1.4 mg/dL",
  ].join("\n");
  const noninfectiousConvergence = [
    "Reported clinical data:",
    "- MAP: previous 82 -> current 68 mmHg",
    "- Heart rate: previous 84 -> current 110 bpm",
    "- Urine output: previous 55 -> current 22 mL/hr",
    "- Lactate: previous 1.5 -> current 2.9 mmol/L",
    "Additional user-reported context: Extremities are now cool with delayed capillary refill. No fever or infectious concern is reported.",
  ].join("\n");

  assert.equal(assessPerfusionPattern(feverAndWbc).convergingSystemicPerfusion, false);
  assert.notEqual(assessDeterministicUrgency(feverAndWbc).urgency, "HIGH");
  assert.equal(assessPerfusionPattern(mildBpChange).convergingSystemicPerfusion, false);
  assert.notEqual(assessDeterministicUrgency(mildBpChange).urgency, "HIGH");
  assert.equal(assessPerfusionPattern(stableAbnormalities).convergingSystemicPerfusion, false);
  assert.notEqual(assessDeterministicUrgency(stableAbnormalities).urgency, "HIGH");
  assert.equal(assessPerfusionPattern(noninfectiousConvergence).convergingSystemicPerfusion, true);
  assert.equal(assessDeterministicUrgency(noninfectiousConvergence).urgency, "HIGH");
  assert.match(buildPriorityMapFallback(noninfectiousConvergence), /Worsening systemic perfusion with end-organ warning signs/);
});

test("converging current bedside perfusion findings are recognized without inventing trends", () => {
  const bedsideConvergence = [
    "PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION",
    "What changed: Something feels off, BP / perfusion, Heart / rhythm, Breathing, Neuro, Urine output, Pain / other",
    "Reported clinical data:",
    "- Level of consciousness: More drowsy",
    "- Chest discomfort: Present",
    "- Perfusion: Cool / clammy",
    "- Urine output: amount 20 mL over 1 hour",
    "- BP: previous unknown -> current 88/50 mmHg",
    "- Heart rate: previous unknown -> current 112 bpm",
    "- SpO₂: previous unknown -> current 94 %",
    "- Oxygen support: previous unknown -> current 2 L",
    "- Temperature: previous unknown -> current 38.2 °C",
    "Treat omitted fields as unknown. Do not infer normal findings.",
  ].join("\n");
  const incompletePattern = bedsideConvergence.replace("- Chest discomfort: Present\n", "");
  const reassuringPattern = bedsideConvergence
    .replace("- Level of consciousness: More drowsy", "- Level of consciousness: At baseline")
    .replace("- Chest discomfort: Present", "- Chest discomfort: None reported")
    .replace("- Perfusion: Cool / clammy", "- Perfusion: No obvious change");

  const pattern = assessPerfusionPattern(bedsideConvergence);
  const assessment = assessDeterministicUrgency(bedsideConvergence);
  const fallback = buildPriorityMapFallback(bedsideConvergence);
  const lesson = buildTeachMeFallback(fallback, bedsideConvergence, "provider_timeout");

  assert.equal(pattern.convergingBedsidePerfusionConcern, true);
  assert.equal(pattern.convergingSystemicPerfusion, false);
  assert.equal(assessment.urgency, "HIGH");
  assert.ok(assessment.signals.includes("converging_bedside_perfusion_findings"));
  assert.match(fallback, /Converging circulation and bedside warning signs/);
  assert.match(fallback, /Urine output: amount 20 mL over 1 hour/);
  assert.match(fallback, /supports prompt team awareness and bedside evaluation now/i);
  assert.match(fallback, /not required before escalation/i);
  assert.doesNotMatch(fallback, /blood pressure (?:fell|dropped)|heart rate (?:rose|increased)|urine output (?:fell|decreased)/i);
  assert.deepEqual(validatePriorityMapReliability(bedsideConvergence, fallback), []);
  assert.equal(lesson.conceptId, "bedside-perfusion-convergence");
  assert.match(lesson.scenarioConnection, /increased drowsiness, chest discomfort, and cool or clammy peripheral findings/i);

  assert.equal(assessPerfusionPattern(incompletePattern).convergingBedsidePerfusionConcern, false);
  assert.notEqual(assessDeterministicUrgency(incompletePattern).urgency, "HIGH");
  assert.equal(assessPerfusionPattern(reassuringPattern).convergingBedsidePerfusionConcern, false);
  assert.notEqual(assessDeterministicUrgency(reassuringPattern).urgency, "HIGH");
});

test("HIGH urgency requires present-tense escalation when deterioration already exists", () => {
  const futureOnly = "Urgency Level: HIGH\nRelevance: High priority\nFurther deterioration should prompt urgent evaluation.";
  const currentAndFuture = "Urgency Level: HIGH\nThe existing pattern supports prompt bedside evaluation now. Further deterioration would increase concern.";
  assert.equal(hasPresentPromptEscalation(futureOnly), false);
  assert.equal(hasPresentPromptEscalation(currentAndFuture), true);
  assert.deepEqual(validateUrgencyConsistency(SYSTEMIC_PERFUSION_SOURCE, futureOnly), ["urgency_escalation_conflict"]);
  assert.deepEqual(validateUrgencyConsistency(SYSTEMIC_PERFUSION_SOURCE, currentAndFuture), []);
});

test("Gold Case 5 integrates rhythm change with hemodynamic intolerance", () => {
  const pattern = assessRhythmHemodynamicPattern(RHYTHM_HEMODYNAMIC_SOURCE);
  const assessment = assessDeterministicUrgency(RHYTHM_HEMODYNAMIC_SOURCE);
  const fallback = buildPriorityMapFallback(RHYTHM_HEMODYNAMIC_SOURCE);
  assert.equal(pattern.convergingHemodynamicIntolerance, true);
  assert.equal(pattern.findings.rhythmChange, true);
  assert.equal(pattern.findings.exactRhythmUnconfirmed, true);
  assert.equal(pattern.findings.peripheralPerfusionChange, true);
  assert.equal(pattern.hemodynamicDeterioration, true);
  assert.equal(pattern.toleranceDomains, 2);
  assert.equal(assessment.urgency, "HIGH");
  assert.ok(assessment.signals.includes("rhythm_hemodynamic_intolerance"));
  assert.match(fallback, /^Urgency Level: HIGH/m);
  assert.match(fallback, /New rhythm and rate change with hemodynamic intolerance/);
  assert.match(fallback, /Heart rate: previous 82 -> current 148 bpm/);
  assert.match(fallback, /BP: previous 124\/70 -> current 88\/54 mmHg/);
  assert.match(fallback, /MAP: previous 88 -> current 65 mmHg/);
  assert.match(fallback, /lightheadedness|lightheaded/i);
  assert.match(fallback, /cool extremities/i);
  assert.match(fallback, /exact rhythm.*not established|exact rhythm.*not confirmed/i);
  assert.match(fallback, /recognized over approximately 20 minutes/i);
  assert.match(fallback, /exact rhythm onset is unknown/i);
  assert.match(fallback, /supports prompt team awareness and bedside evaluation now/i);
  assert.match(fallback, /not required before escalation/i);
  assert.match(fallback, /current potassium and magnesium are single measurements/i);
  assert.match(fallback, /Oxygen support remained room air/i);
  assert.doesNotMatch(fallback, /\b(?:atrial fibrillation|atrial flutter|supraventricular tachycardia|ventricular tachycardia)\b(?![^.\n]*(?:not established|possible|possibility))/i);
  assert.doesNotMatch(fallback, /\b(?:start|give|administer|cardiovert|replace|bolus|titrate)\b/i);
  assert.deepEqual(validatePriorityMapReliability(RHYTHM_HEMODYNAMIC_SOURCE, fallback), []);
});

test("rapid rhythm without intolerance does not enter the high-concern pathway", () => {
  const stable = [
    "Reported clinical data:",
    "- Rhythm change: Earlier sinus rhythm; current new rapid rhythm reported on bedside monitoring; exact rhythm not confirmed",
    "- Heart rate: previous 82 -> current 132 bpm",
    "- BP: previous 124/70 -> current 124/70 mmHg",
    "- MAP: previous 88 -> current 88 mmHg",
    "- Mental status: At baseline",
    "- Oxygen support: previous Room air -> current Room air",
    "Additional user-reported context: No lightheadedness, syncope, chest pain, dyspnea, or peripheral-perfusion change is reported.",
  ].join("\n");
  assert.equal(assessRhythmHemodynamicPattern(stable).convergingHemodynamicIntolerance, false);
  assert.notEqual(assessDeterministicUrgency(stable).urgency, "HIGH");
  assert.doesNotMatch(buildPriorityMapFallback(stable), /hemodynamic intolerance/i);
});

test("monitor irregularity remains an observation rather than a rhythm diagnosis", () => {
  assert.equal(hasUnsupportedDiagnosticCertainty("The monitor confirms atrial fibrillation."), true);
  assert.equal(hasUnsupportedDiagnosticCertainty("Atrial fibrillation is possible, but the exact rhythm is not established."), false);
  const fallback = buildPriorityMapFallback(RHYTHM_HEMODYNAMIC_SOURCE);
  assert.match(fallback, /Clarify the rhythm.*rather than assigning a diagnosis/i);
});

test("current-only electrolytes stay single values and do not become causes", () => {
  const fallback = buildPriorityMapFallback(RHYTHM_HEMODYNAMIC_SOURCE);
  assert.equal(sourceSupportsTrend(RHYTHM_HEMODYNAMIC_SOURCE, "Potassium"), false);
  assert.equal(sourceSupportsTrend(RHYTHM_HEMODYNAMIC_SOURCE, "Magnesium"), false);
  assert.deepEqual(unsupportedTrendClaims(RHYTHM_HEMODYNAMIC_SOURCE, "Potassium is falling and magnesium is decreasing.", ["Potassium", "Magnesium"]), ["Potassium", "Magnesium"]);
  assert.doesNotMatch(fallback, /(?:potassium|magnesium)[^.\n]*(?:caused|causing|due to)/i);
  assert.deepEqual(unsupportedClinicalNumericClaims(RHYTHM_HEMODYNAMIC_SOURCE, fallback), []);
});

test("rhythm Teach Me fallback is encounter-specific and uncertainty-aware", () => {
  const lesson = buildTeachMeFallback("", RHYTHM_HEMODYNAMIC_SOURCE, "unsupported_trend");
  const text = [lesson.keyIdea, lesson.whyItMatters, lesson.scenarioConnection].join("\n");
  assert.equal(lesson.domain, "rhythm-recognition");
  assert.match(text, /how the patient is tolerating it|physiologic impact/i);
  assert.match(text, /bedside monitor.*without establishing the exact rhythm diagnosis/i);
  assert.match(text, /falling BP and MAP, lightheadedness, palpitations, and cool extremities/i);
  assert.match(text, /SpO2 does not negate circulatory concern/i);
  assert.match(text, /potassium and magnesium values remain unestablished/i);
  assert.doesNotMatch(text, /\b(?:cardioversion|adenosine|amiodarone|replace potassium|replace magnesium)\b/i);
});

test("Gold Case 5 unsupported-trend rejection correctly protects unsupplied output direction", () => {
  assert.equal(
    hasUnsupportedEstablishedTrendClaim(RHYTHM_HEMODYNAMIC_SOURCE, "Falling cardiac output explains why the rhythm is poorly tolerated.", ["drain", "chest tube", "output"]),
    true,
  );
  assert.equal(
    hasUnsupportedEstablishedTrendClaim(RHYTHM_HEMODYNAMIC_SOURCE, "The supplied BP and MAP are falling while the exact rhythm remains unknown.", ["drain", "chest tube", "output"]),
    false,
  );
});

test("recognition over time remains distinct from exact rhythm onset", () => {
  const summary = temporalGroundingSummary(RHYTHM_HEMODYNAMIC_SOURCE);
  assert.match(summary, /recognized over approximately 20 minutes/i);
  assert.match(summary, /exact rhythm onset is unknown/i);
  assert.equal(hasTemporalGroundingViolation(RHYTHM_HEMODYNAMIC_SOURCE, "The arrhythmia started 20 minutes ago."), true);
  assert.equal(hasTemporalGroundingViolation(RHYTHM_HEMODYNAMIC_SOURCE, "The change was recognized over approximately 20 minutes; exact rhythm onset is unknown."), false);
});

test("urgency, priority relevance, and escalation language must agree", () => {
  assert.deepEqual(
    validateUrgencyConsistency(RESPIRATORY_SOURCE, "Urgency Level: MODERATE\nRelevance: High priority\nPrompt bedside evaluation is appropriate."),
    ["urgency_underclassified", "urgency_priority_conflict"],
  );
  assert.deepEqual(
    validateUrgencyConsistency("- General concern reported", "Urgency Level: HIGH\nContinue routine monitoring."),
    ["urgency_overclassified", "urgency_escalation_conflict"],
  );
  assert.deepEqual(
    validateUrgencyConsistency("- General concern reported", "Urgency Level: LOW\nSeek immediate evaluation."),
    ["urgency_escalation_conflict"],
  );
});

test("converging focal neurologic deterioration is HIGH without diagnosing etiology", () => {
  const pattern = assessNeurologicPattern(NEUROLOGIC_SOURCE);
  assert.equal(pattern.convergingFocalDeterioration, true);
  assert.equal(assessDeterministicUrgency(NEUROLOGIC_SOURCE).urgency, "HIGH");

  const fallback = buildPriorityMapFallback(NEUROLOGIC_SOURCE);
  assert.match(fallback, /^Urgency Level: HIGH/m);
  assert.match(fallback, /Acute focal neurologic deterioration/);
  assert.match(fallback, /new focal or unilateral motor weakness/i);
  assert.match(fallback, /new facial asymmetry/i);
  assert.match(fallback, /new speech or language change/i);
  assert.match(fallback, /new confusion or mental-status change/i);
  assert.match(fallback, /etiology is not established/i);
  assert.match(fallback, /supports prompt team awareness and bedside evaluation/i);
  assert.doesNotMatch(fallback, /Urgency Level: MODERATE|diagnostic of|confirmed stroke|give aspirin|administer thrombolytic/i);
  assert.deepEqual(validatePriorityMapReliability(NEUROLOGIC_SOURCE, fallback), []);
});

test("isolated nonspecific neurologic complaints do not automatically become HIGH", () => {
  const headache = "Reported clinical data:\n- Headache: mild and chronic\n- Mental status: Baseline";
  const fatigue = "Reported clinical data:\n- Vague fatigue\n- Focal neurologic change: None observed";
  assert.notEqual(assessDeterministicUrgency(headache).urgency, "HIGH");
  assert.notEqual(assessDeterministicUrgency(fatigue).urgency, "HIGH");
  assert.equal(assessNeurologicPattern(headache).convergingFocalDeterioration, false);
  assert.equal(assessNeurologicPattern(fatigue).convergingFocalDeterioration, false);
});

test("recognition time remains distinct from symptom onset and unknown last known well", () => {
  assert.equal(
    temporalGroundingSummary(NEUROLOGIC_SOURCE),
    "The change was recognized within approximately the last 30 minutes. Exact symptom onset and last known well are unknown.",
  );
  assert.equal(hasTemporalGroundingViolation(
    NEUROLOGIC_SOURCE,
    "Within the last thirty minutes things shifted and the deficits developed.",
  ), true);
  assert.equal(hasTemporalGroundingViolation(
    NEUROLOGIC_SOURCE,
    "Within the last thirty minutes things have shifted.",
  ), true);
  assert.equal(hasTemporalGroundingViolation(
    NEUROLOGIC_SOURCE,
    "The change was recognized within approximately the last 30 minutes; exact onset and last known well are unknown.",
  ), false);
});

test("equal comparisons remain unchanged and do not become trends", () => {
  const semantics = comparisonSemantics(NEUROLOGIC_SOURCE);
  assert.equal(semantics.find((item) => item.label === "SpO2").status, "unchanged");
  assert.equal(semantics.find((item) => item.label === "Oxygen support").status, "unchanged");
  assert.equal(semantics.find((item) => item.label === "Heart rate").status, "changed");
  assert.equal(hasUnchangedValueTrendViolation(NEUROLOGIC_SOURCE, "SpO2 and oxygen support changed."), true);
  assert.equal(hasUnchangedValueTrendViolation(NEUROLOGIC_SOURCE, "SpO2 remained 97% and oxygen support remained room air."), false);

  const nonSpo2 = "- Heart rate: previous 82 -> current 82 bpm";
  assert.equal(comparisonSemantics(nonSpo2)[0].status, "unchanged");
  assert.equal(hasUnchangedValueTrendViolation(nonSpo2, "Heart rate increased."), true);
  assert.equal(sourceSupportsTrend("- Heart rate: current 82 bpm", "Heart rate"), false);
});

test("neurologic Teach Me fallback is encounter-specific and grounded", () => {
  const lesson = buildTeachMeFallback("", NEUROLOGIC_SOURCE, "unsupported_causality");
  const text = [lesson.keyIdea, lesson.whyItMatters, lesson.scenarioConnection].join("\n");
  assert.equal(lesson.domain, "neurologic");
  assert.match(text, /new focal deficit changes the meaning of altered mental status/i);
  assert.match(text, /etiology is not established|do not establish the cause/i);
  assert.match(text, /recognized within approximately the last 30 minutes/i);
  assert.match(text, /exact symptom onset and last known well are unknown/i);
  assert.doesNotMatch(text, /SpO2.*changes|oxygen support.*changes|treatment window|thrombolytic/i);
});

test("SBAR temporal grounding corrects recognition-as-onset wording", () => {
  const grounded = groundSbarTemporalFidelity(NEUROLOGIC_SOURCE, {
    situation: "Calling about new neurologic findings.",
    background: "The patient was awake and oriented — within the last thirty minutes things have shifted.",
    assessment: "Now confused with focal weakness and slurred speech.",
    recommendation: "I'd like you to evaluate the patient now.",
  });
  const text = Object.values(grounded).join(" ");
  assert.match(grounded.background, /recognized within approximately the last 30 minutes/i);
  assert.match(grounded.background, /exact symptom onset and last known well are unknown/i);
  assert.doesNotMatch(grounded.background, /things shifted|symptoms began|deficits developed/i);
  assert.equal(hasTemporalGroundingViolation(NEUROLOGIC_SOURCE, text), false);
});

test("Priority Map validator rejects unapproved numeric thresholds and timelines", () => {
  assert.deepEqual(unsupportedClinicalNumericClaims(RESPIRATORY_SOURCE, "Escalate if PaCO2 rises above 65 mmHg."), ["threshold:65"]);
  assert.deepEqual(unsupportedClinicalNumericClaims(RESPIRATORY_SOURCE, "Reassess in 30 minutes."), ["timeline:30 minutes"]);
  assert.deepEqual(unsupportedClinicalNumericClaims(RESPIRATORY_SOURCE, "Reassess in 15 minutes."), ["timeline:15 minutes"]);
  assert.deepEqual(unsupportedClinicalNumericClaims(RESPIRATORY_SOURCE, "The changes occurred over approximately 2 hours."), []);
});

test("Priority Map performs one bounded repair and validates the repaired result", async () => {
  let attempts = 0;
  const result = await resolvePriorityMap({
    source: RESPIRATORY_SOURCE,
    initialOutput: "Hypercapnia caused the drowsiness.",
    repair: async (issues) => {
      attempts += 1;
      assert.deepEqual(issues, ["unsupported_causality"]);
      return "### 1 · Worsening ventilation with respiratory acidemia\nInterpretation: Hypercapnia may be contributing to drowsiness, while medication, neurologic, and metabolic contributors remain unresolved.";
    },
  });
  assert.equal(attempts, 1);
  assert.equal(result.status, "repaired");
  assert.deepEqual(validatePriorityMapReliability(RESPIRATORY_SOURCE, result.output), []);
});

test("Priority Map returns a grounded fallback when its one repair remains invalid", async () => {
  let attempts = 0;
  const result = await resolvePriorityMap({
    source: RESPIRATORY_SOURCE,
    initialOutput: "Worsening hypercapnic respiratory failure caused the drowsiness.",
    repair: async () => {
      attempts += 1;
      return "The drowsiness is due to hypercapnic respiratory failure.";
    },
  });
  assert.equal(attempts, 1);
  assert.equal(result.status, "fallback");
  assert.equal(result.output, buildPriorityMapFallback(RESPIRATORY_SOURCE, result.output));
  assert.deepEqual(validatePriorityMapReliability(RESPIRATORY_SOURCE, result.output), []);
  assert.match(result.output, /Worsening ventilation with respiratory acidemia/);
  assert.match(result.output, /Hypercapnia may be contributing to the new drowsiness/i);
  assert.match(result.output, /medication or sedation exposure/i);
  assert.match(result.output, /neurologic and metabolic contributors, fatigue/i);
  assert.doesNotMatch(result.output, /hypercapnic respiratory failure|caused the drowsiness/i);
});

test("timed Priority Map pipeline accepts an original response within budget", async () => {
  const result = await runPriorityMapWithBudget({
    source: GOLD_SOURCE,
    generateOriginal: async () => GROUNDED_PRIORITY_MAP,
  });
  assert.equal(result.status, "validated");
  assert.equal(result.timing.provider_status, "success");
  assert.equal(result.timing.validation_status, "accepted");
  assert.equal(result.timing.repair_attempted, false);
});

test("timed Priority Map pipeline repairs one invalid response within budget", async () => {
  let repairs = 0;
  const result = await runPriorityMapWithBudget({
    source: GOLD_SOURCE,
    generateOriginal: async () => "Escalate if MAP falls below 55 mmHg.",
    repair: async () => {
      repairs += 1;
      return GROUNDED_PRIORITY_MAP;
    },
  });
  assert.equal(result.status, "repaired");
  assert.equal(repairs, 1);
  assert.equal(result.timing.repair_status, "accepted");
});

test("timed Priority Map pipeline skips repair when return reserve would be consumed", async () => {
  let clock = 0;
  let repairs = 0;
  const result = await runPriorityMapWithBudget({
    source: GOLD_SOURCE,
    now: () => clock,
    totalBudgetMs: 100,
    returnReserveMs: 20,
    minRepairBudgetMs: 15,
    generateOriginal: async () => {
      clock = 70;
      return "Escalate if MAP falls below 55 mmHg.";
    },
    repair: async () => { repairs += 1; return GROUNDED_PRIORITY_MAP; },
  });
  assert.equal(result.status, "fallback");
  assert.equal(repairs, 0);
  assert.equal(result.timing.repair_status, "skipped_insufficient_budget");
  assert.equal(result.timing.timeout_layer, "total_budget");
});

test("timed Priority Map pipeline returns fallback on provider stage timeout", async () => {
  const startedAt = Date.now();
  const result = await runPriorityMapWithBudget({
    source: GOLD_SOURCE,
    originalBudgetMs: 10,
    generateOriginal: async () => new Promise(() => {}),
  });
  assert.equal(result.status, "fallback");
  assert.equal(result.timing.provider_status, "timeout");
  assert.equal(result.timing.timeout_layer, "provider");
  assert.ok(Date.now() - startedAt < 500);
});

test("client disconnect aborts one provider operation without repair or duplicate work", async () => {
  const controller = new AbortController();
  let providerCalls = 0;
  let repairCalls = 0;
  const pending = runPriorityMapWithBudget({
    source: GOLD_SOURCE,
    signal: controller.signal,
    generateOriginal: async () => {
      providerCalls += 1;
      return new Promise(() => {});
    },
    repair: async () => { repairCalls += 1; return GROUNDED_PRIORITY_MAP; },
  });
  controller.abort();
  const result = await pending;
  assert.equal(result.status, "fallback");
  assert.equal(result.timing.timeout_layer, "client_disconnect");
  assert.equal(providerCalls, 1);
  assert.equal(repairCalls, 0);
});

test("respiratory Teach Me fallback explains ventilation and acidemia without overclaiming", () => {
  const lesson = buildTeachMeFallback("", RESPIRATORY_SOURCE, "acid_base_reliability");
  const text = [lesson.keyIdea, lesson.whyItMatters, lesson.scenarioConnection].join("\n");
  assert.equal(lesson.domain, "respiratory-oxygenation");
  assert.match(text, /Tachypnea does not guarantee effective ventilation/i);
  assert.match(text, /PaCO2 rises while pH falls/i);
  assert.match(text, /Hypercapnia may be contributing to the drowsiness/i);
  assert.match(text, /should not automatically be labeled new renal compensation/i);
  assert.match(text, /measurement or sample variation/i);
  assert.deepEqual(validatePriorityMapReliability(RESPIRATORY_SOURCE, text), []);
});

test("SBAR sanitizer preserves a natural urgent assessment request", () => {
  assert.equal(
    sanitizeSbarText("I'm concerned and I need you to come assess the patient now."),
    "I'm concerned and I'd like you to come assess the patient now.",
  );
  assert.doesNotMatch(sanitizeSbarText("and I need you to come assess"), /and Wanted/i);
});

const FIRST_RUN_SNAPSHOT = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
Reported clinical data:
- BP: previous 108/64 -> current 86/48 mmHg
- MAP: previous unknown -> current 61 mmHg
- Heart rate: previous 92 -> current 118 bpm
- Urine output: amount 20 mL over 1 hour
- Lactate: previous 2.0 -> current 4.1 (unit not supplied)
- Drips: items=1) medication=Norepinephrine
- Drains / bleeding: items=1) type=Chest tube, currentOutput=35 mL, outputTimeframe=most recent hour
Treat omitted fields as unknown. Do not infer normal findings.`;

const CONTROLLED_RERUN_SNAPSHOT = `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION
What changed: Something feels off, BP / perfusion, Heart / rhythm, Breathing, Neuro, Urine output, Labs / glucose, Bleeding
Reported clinical data:
- Level of consciousness: More drowsy
- Perfusion: Cool / clammy, Delayed capillary refill
- Urine output: amount 20 mL over 1 hour
- BP: previous 108/64 -> current 86/48 mmHg
- MAP: previous unknown -> current 61 mmHg
- Heart rate: previous 92 -> current 118 bpm
- Respiratory rate: previous unknown -> current 27 /min
- SpO2: previous 95 -> current 92 %
- Oxygen support: previous 2 L nasal cannula -> current 4 L nasal cannula (unit not supplied)
- CVP: previous 8 -> current 5 (unit not supplied)
- CI: previous 2.3 -> current 1.8 (unit not supplied)
- Lactate: previous 2.0 -> current 4.1 (unit not supplied)
- Creatinine: previous 1.1 -> current 1.6 (unit not supplied)
- Drips: items=1) medication=Norepinephrine
- Drains / bleeding: items=1) type=Chest tube, currentOutput=35 mL, outputTimeframe=most recent hour
Treat omitted fields as unknown. Do not infer normal findings.`;

test("Priority Map validator rejects a directional urine claim from one interval", () => {
  const output = GROUNDED_PRIORITY_MAP.replace(
    "The reported hemodynamics show worsening perfusion with uncertain cause.",
    "The reported hemodynamics show worsening perfusion with falling urine output.",
  );
  assert.ok(unsupportedMeasurementTrendClaims(CONTROLLED_RERUN_SNAPSHOT, output).includes("Urine output"));
  assert.ok(validatePriorityMapReliability(CONTROLLED_RERUN_SNAPSHOT, output).includes("unsupported_measurement_trend"));
});

test("Priority Map fallback preserves one urine interval without inventing direction", () => {
  const fallback = buildPriorityMapFallback(CONTROLLED_RERUN_SNAPSHOT);
  assert.match(fallback, /Urine output: amount 20 mL over 1 hour/i);
  assert.match(fallback, /rising creatinine/i);
  assert.match(fallback, /single interval measurement and does not establish direction/i);
  assert.doesNotMatch(fallback, /(?:falling|decreasing|declining|worsening) urine output/i);
  assert.deepEqual(validatePriorityMapReliability(CONTROLLED_RERUN_SNAPSHOT, fallback), []);
});

test("Priority Map semantics retain a supplied urine trend", () => {
  const source = CONTROLLED_RERUN_SNAPSHOT.replace(
    "Urine output: amount 20 mL over 1 hour",
    "Urine output: previous 55 -> current 20 mL/hr",
  );
  const fallback = buildPriorityMapFallback(source);
  assert.match(fallback, /falling urine output/i);
  assert.equal(unsupportedMeasurementTrendClaims(source, fallback).includes("Urine output"), false);
});

test("Priority Map semantics allow an explicitly supplied qualitative urine direction", () => {
  const source = `${CONTROLLED_RERUN_SNAPSHOT}\n- Urine output: decreasing over the observed interval`;
  const candidate = GROUNDED_PRIORITY_MAP.replace(
    "The reported hemodynamics show worsening perfusion with uncertain cause.",
    "The reported hemodynamics include decreasing urine output with uncertain cause.",
  );
  assert.equal(sourceSupportsTrend(source, /\b(?:urine output|UOP|urine)\b/i), true);
  assert.equal(unsupportedMeasurementTrendClaims(source, candidate).includes("Urine output"), false);
});

function sbarRaw({ background = "Urine output was 20 mL over the last hour.", assessment = "BP fell from 108/64 to 86/48 and lactate rose from 2.0 to 4.1." } = {}) {
  return `SITUATION: I'm calling about concerning current findings.
BACKGROUND: ${background}
ASSESSMENT: ${assessment}
RECOMMENDATION: I'd like you to evaluate the patient now.`;
}

test("SBAR rejects directional claims for current and interval-only measurements", () => {
  const urineIssues = validateSbarReliability(FIRST_RUN_SNAPSHOT, {
    situation: "I'm calling about concerning findings.",
    background: "Urine output is down to 20 mL over the last hour.",
    assessment: "Chest tube output decreased to 35 mL during the most recent hour.",
    recommendation: "I'd like you to evaluate the patient now.",
  });
  assert.ok(urineIssues.includes("unsupported_trend:urine_output"));
  assert.ok(urineIssues.includes("unsupported_trend:drains___bleeding"));
});

test("SBAR permits directional language for supported BP and lactate comparisons", () => {
  assert.deepEqual(validateSbarReliability(FIRST_RUN_SNAPSHOT, {
    situation: "I'm calling about concerning current findings.",
    background: "Urine output was 20 mL over the last hour.",
    assessment: "BP fell from 108/64 to 86/48 and lactate increased from 2.0 to 4.1.",
    recommendation: "I'd like you to evaluate the patient now.",
  }), []);
});

test("SBAR rejects recognition-as-onset and unsupported global rapidity", () => {
  const source = `${FIRST_RUN_SNAPSHOT}\n- Change was recognized within 30 minutes\n- Exact symptom onset is unknown`;
  const issues = validateSbarReliability(source, {
    situation: "The patient is rapidly deteriorating.",
    background: "Symptoms started 30 minutes ago.",
    assessment: "The current findings are concerning.",
    recommendation: "I'd like you to evaluate the patient now.",
  });
  assert.ok(issues.includes("unsupported_global_rapidity"));
  assert.ok(issues.includes("recognition_as_onset"));
});

test("SBAR allows explicitly supplied rapidity", () => {
  const source = `${FIRST_RUN_SNAPSHOT}\n- Overall change: rapidly worsening`;
  assert.deepEqual(validateSbarReliability(source, {
    situation: "The patient is rapidly worsening.",
    background: "Urine output was 20 mL over the last hour.",
    assessment: "BP fell from 108/64 to 86/48.",
    recommendation: "I'd like you to evaluate the patient now.",
  }), []);
});

test("invalid provider SBAR resolves to a safe deterministic S/B/A/R fallback", async () => {
  const result = await runSbarWithBudget({
    source: FIRST_RUN_SNAPSHOT,
    urgency: "HIGH",
    generateOriginal: async () => sbarRaw({ background: "Urine output is down to 20 mL.", assessment: "The patient is quickly deteriorating." }),
  });
  assert.equal(result.status, "fallback");
  assert.ok(result.issues.includes("unsupported_trend:urine_output"));
  assert.ok(result.issues.includes("unsupported_global_rapidity"));
  assert.deepEqual(Object.keys(result.sbar), ["situation", "background", "assessment", "recommendation"]);
  const text = Object.values(result.sbar).join(" ");
  assert.doesNotMatch(text, /\b(?:start|give|administer|bolus|titrate)\b/i);
  assert.match(result.sbar.recommendation, /evaluate the patient now/i);
});

test("valid provider SBAR is accepted within its stage budget", async () => {
  const result = await runSbarWithBudget({
    source: FIRST_RUN_SNAPSHOT,
    urgency: "HIGH",
    generateOriginal: async () => sbarRaw(),
  });
  assert.equal(result.status, "original");
  assert.equal(result.timing.provider_status, "success");
  assert.equal(result.timing.validation_status, "accepted");
});

test("slow SBAR provider returns deterministic fallback within the product budget", async () => {
  const startedAt = Date.now();
  const result = await runSbarWithBudget({
    source: FIRST_RUN_SNAPSHOT,
    urgency: "HIGH",
    providerBudgetMs: 10,
    generateOriginal: async () => new Promise(() => {}),
  });
  assert.equal(result.status, "fallback");
  assert.equal(result.timing.provider_status, "timeout");
  assert.equal(result.timing.timeout_layer, "provider");
  assert.ok(Date.now() - startedAt < 500);
});

test("SBAR client disconnect aborts one operation without duplicate work", async () => {
  const controller = new AbortController();
  let providerCalls = 0;
  const pending = runSbarWithBudget({
    source: FIRST_RUN_SNAPSHOT,
    urgency: "HIGH",
    signal: controller.signal,
    generateOriginal: async () => {
      providerCalls += 1;
      return new Promise(() => {});
    },
  });
  controller.abort();
  const result = await pending;
  assert.equal(result.status, "fallback");
  assert.equal(result.timing.timeout_layer, "client_disconnect");
  assert.equal(providerCalls, 1);
});

test("SBAR rejects treatment prescriptions", () => {
  const issues = validateSbarReliability(FIRST_RUN_SNAPSHOT, {
    situation: "I'm calling about concerning findings.",
    background: "Norepinephrine is running, but the dose was not supplied.",
    assessment: "BP fell from 108/64 to 86/48.",
    recommendation: "Increase the norepinephrine infusion now.",
  });
  assert.ok(issues.includes("treatment_prescription"));
});

test("deterministic SBAR fallback preserves interval and comparison semantics", () => {
  const fallback = buildSbarFallback(FIRST_RUN_SNAPSHOT, "HIGH");
  const text = Object.values(fallback).join(" ");
  assert.match(text, /BP changed from 108\/64 to 86\/48 mmHg/i);
  assert.match(text, /urine output was 20 mL over 1 hour/i);
  assert.doesNotMatch(text, /urine output (?:fell|dropped|decreased|is down)/i);
  assert.deepEqual(validateSbarReliability(FIRST_RUN_SNAPSHOT, fallback), []);
});

test("deterministic SBAR fallback preserves controlled-rerun drips, drains, and intervals", () => {
  const fallback = buildSbarFallback(CONTROLLED_RERUN_SNAPSHOT, "HIGH");
  const text = Object.values(fallback).join(" ");
  assert.match(fallback.background, /Norepinephrine was running; the dose was not supplied/i);
  assert.match(fallback.background, /Chest tube output was 35 mL during the most recent hour/i);
  assert.match(fallback.assessment, /urine output was 20 mL over 1 hour/i);
  assert.match(fallback.assessment, /CI changed from 2\.3 to 1\.8/i);
  assert.match(fallback.assessment, /Lactate changed from 2\.0 to 4\.1/i);
  assert.match(fallback.assessment, /Creatinine changed from 1\.1 to 1\.6/i);
  assert.doesNotMatch(text, /(?:falling|decreasing|declining|down to) (?:urine|chest tube)/i);
  assert.ok(text.split(/\s+/).length < 180);
  assert.deepEqual(validateSbarReliability(CONTROLLED_RERUN_SNAPSHOT, fallback), []);
});
