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
  validatePriorityMapReliability,
  buildPriorityMapFallback,
  buildTeachMeFallback,
  resolvePriorityMap,
  sanitizeSbarText,
  highUrgencyRecommendationIsAligned,
  lessonGroundingText,
  SBAR_SYSTEM_PROMPT,
  SHIFT_BRAIN_RESPONSE_CONTRACT,
  TEACH_ME_RELIABILITY_PROMPT,
  unsupportedNumericThresholds,
  unsupportedTrendClaims,
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
- Further perfusion decline commonly prompts urgent team evaluation.

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
