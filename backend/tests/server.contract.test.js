const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ANTHROPIC_API_KEY ||= "test-key";

const {
  buildOperationalLogEntry,
  CLINICAL_RELIABILITY_CONTRACT,
  containsPHI,
  SHIFT_BRAIN_RESPONSE_CONTRACT,
  TEACH_ME_DOMAINS,
  TEACH_ME_QUESTION_TYPES,
  validateTeachMeLesson,
  buildTeachMeFallback,
  classifyProviderError,
} = require("../server");

test("identifier guard catches supported structural identifiers", () => {
  assert.equal(containsPHI("MRN 1234567 with hypotension"), "MRN");
  assert.equal(containsPHI("DOB 01/15/1985"), "DOB");
  assert.equal(containsPHI("call 310-555-1212"), "phone");
  assert.equal(containsPHI("nurse@example.com"), "email");
  assert.equal(containsPHI("post-op patient with BP 88/50"), null);
});

test("operational logs discard all clinical and response content", () => {
  const entry = buildOperationalLogEntry({
    timestamp: "2026-09-20T12:00:00.000Z",
    route: "DEEP_SYSTEM_PROMPT",
    mode: "deep",
    category: "deterioration",
    word_count: 14,
    input_length: 92,
    urgency: "MODERATE",
    status: "success",
    response_length: 842,
    duration_ms: 1200,
    possible_failure: false,
    input: "Patient Name has BP 88/50",
    question: "Patient Name has BP 88/50",
    input_redacted: "Patient Name has BP 88/50",
    input_normalized: "patient name has bp 88/50",
    response_preview: "What stands out...",
    response: "full response",
  });

  assert.deepEqual(Object.keys(entry), [
    "timestamp", "route", "mode", "category", "word_count", "input_length",
    "urgency", "status", "response_length", "duration_ms", "possible_failure",
  ]);
  assert.equal(JSON.stringify(entry).includes("Patient Name"), false);
  assert.equal(JSON.stringify(entry).includes("What stands out"), false);
  assert.equal(JSON.stringify(entry).includes("88/50"), false);
});

test("operational logs retain non-content Priority Map resolution metadata", () => {
  const entry = buildOperationalLogEntry({
    timestamp: "2026-09-24T12:00:00.000Z",
    route: "DEEP_SYSTEM_PROMPT",
    mode: "deep",
    category: "oxygen",
    word_count: 165,
    input_length: 1057,
    urgency: "HIGH",
    status: "fallback",
    response_length: 2600,
    duration_ms: 1000,
    possible_failure: false,
    priority_map_original_status: "rejected",
    priority_map_repair_status: "rejected",
    priority_map_display_resolution: "fallback",
    request_id: "request-test-1",
    provider_duration_ms: 40000,
    provider_status: "timeout",
    validation_duration_ms: 0,
    validation_status: "not_started",
    repair_attempted: false,
    repair_status: "not_attempted",
    repair_duration_ms: 0,
    timeout_layer: "provider",
    client_disconnected: false,
    original_response: "clinical text must not be retained",
  });
  assert.equal(entry.priority_map_original_status, "rejected");
  assert.equal(entry.priority_map_repair_status, "rejected");
  assert.equal(entry.priority_map_display_resolution, "fallback");
  assert.equal(entry.request_id, "request-test-1");
  assert.equal(entry.provider_status, "timeout");
  assert.equal(entry.timeout_layer, "provider");
  assert.equal(entry.client_disconnected, false);
  assert.equal(JSON.stringify(entry).includes("clinical text"), false);
});

test("operational logs retain privacy-safe SBAR provenance without clinical content", () => {
  const entry = buildOperationalLogEntry({
    timestamp: "2026-09-29T12:00:00.000Z",
    route: "SBAR",
    endpoint: "/api/sbar",
    status: "fallback",
    request_id: "sbar-request-1",
    total_duration_ms: 8001,
    provider_duration_ms: 8000,
    provider_status: "timeout",
    validation_duration_ms: 0,
    validation_status: "not_started",
    repair_attempted: false,
    repair_status: "not_available",
    repair_duration_ms: 0,
    display_resolution: "fallback",
    rejection_reason_codes: ["provider_timeout"],
    timeout_layer: "provider",
    client_disconnected: false,
    question: "BP 86/48 and urine output 20 mL",
    response: "SITUATION: clinical content",
  });
  assert.equal(entry.endpoint, "/api/sbar");
  assert.equal(entry.display_resolution, "fallback");
  assert.deepEqual(entry.rejection_reason_codes, ["provider_timeout"]);
  assert.equal(JSON.stringify(entry).includes("86/48"), false);
  assert.equal(JSON.stringify(entry).includes("clinical content"), false);
});

test("Shift Brain contract has the exact ordered reasoning sections", () => {
  const headers = [...SHIFT_BRAIN_RESPONSE_CONTRACT.matchAll(/^\*\*(.+)\*\*$/gm)]
    .map((match) => match[1]);

  assert.deepEqual(headers, [
    "Priorities",
    "Assess first",
    "Possible patterns",
    "Missing information",
    "Monitor and trend",
    "Escalation triggers",
    "SBAR-ready summary",
    "Teach me why",
  ]);
  assert.match(SHIFT_BRAIN_RESPONSE_CONTRACT, /possibilities rather than diagnoses/i);
  assert.match(SHIFT_BRAIN_RESPONSE_CONTRACT, /Observed.*user-reported observations/is);
  assert.match(SHIFT_BRAIN_RESPONSE_CONTRACT, /never more than three/i);
  assert.match(SHIFT_BRAIN_RESPONSE_CONTRACT, /For sparse input, use one priority labeled "Limited information"/i);
  assert.match(SHIFT_BRAIN_RESPONSE_CONTRACT, /If supplied measurements conflict, surface the inconsistency/i);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /OBSERVE -> TREND -> INTERPRET -> DIFFERENTIATE -> DISCRIMINATE -> PRIORITIZE -> ESCALATE -> TEACH/);
  assert.match(CLINICAL_RELIABILITY_CONTRACT, /Never turn it into "rising," "falling," "increasing," "decreasing," "improving," "worsening," or "trending" language/);
});

test("structured snapshots are treated as reported observations with unknowns preserved", () => {
  const source = require("node:fs").readFileSync(require.resolve("../server"), "utf8");
  assert.match(source, /PATIENT SNAPSHOT — USER-REPORTED \/ OBSERVED INFORMATION/);
  assert.match(source, /Treat "unknown" and omitted fields as missing information, never as normal/);
});

test("Teach Me accepts one valid structured learning objective", () => {
  const lesson = {
    domain: "hemodynamics-perfusion",
    conceptId: "map-and-organ-perfusion",
    conceptLabel: "MAP and organ perfusion",
    questionType: "trend-interpretation",
    question: {
      stem: "Which trend carries the most weight?",
      choices: [{ id: "a", label: "A falling MAP" }, { id: "b", label: "One stable value" }, { id: "c", label: "An unchanged temperature" }],
      correctChoiceId: "a",
      explanation: "A falling trend can indicate worsening perfusion context. It does not establish the cause.",
    },
    scenarioConnection: "The reported MAP trend may increase concern, while missing assessment data limits interpretation.",
    application: null,
    tags: ["Hemodynamics", "Trend interpretation"],
  };
  assert.deepEqual(validateTeachMeLesson(lesson), lesson);
  assert.ok(TEACH_ME_DOMAINS.includes(lesson.domain));
  assert.ok(TEACH_ME_QUESTION_TYPES.includes(lesson.questionType));
});

test("Teach Me rejects invalid answer contracts and supports explanation fallback", () => {
  const invalid = {
    domain: "hemodynamics-perfusion", conceptId: "map-trend", conceptLabel: "MAP trend",
    questionType: "trend-interpretation",
    question: { stem: "What matters?", choices: [{ id: "a", label: "Trend" }, { id: "b", label: "Single value" }, { id: "c", label: "Neither" }], correctChoiceId: "z", explanation: "The trend matters." },
    scenarioConnection: "The trend may matter in this encounter.", application: null, tags: ["Trends"],
  };
  assert.equal(validateTeachMeLesson(invalid), null);
  const fallback = buildTeachMeFallback("**Teach me why**\nA trend can reveal a developing change.\n\n---\n\n*For educational support only.*", "- MAP: previous 74 -> current 61 mmHg", "invalid_schema");
  assert.equal(fallback.active, false);
  assert.match(fallback.keyIdea, /previous-to-current comparisons/i);
  assert.doesNotMatch(fallback.keyIdea, /---|For educational/);
  assert.match(fallback.scenarioConnection, /MAP/i);
  assert.equal(fallback.fallbackReason, "invalid_schema");
});

test("Teach Me safety contract bans prescriptive treatment and device changes", () => {
  const source = require("node:fs").readFileSync(require.resolve("../server"), "utf8");
  assert.match(source, /Do not provide medication dosing, titration, treatment orders, device-setting changes, or autonomous diagnosis/);
  assert.match(source, /Pattern recognition is not diagnosis/);
});

test("provider failures are classified without exposing credentials", () => {
  assert.deepEqual(classifyProviderError({ status: 401, message: "authentication failed" }), {
    code: "provider_configuration",
    message: "The AI service is not configured correctly. Please contact support.",
  });
  assert.equal(classifyProviderError({ status: 429 }).code, "provider_rate_limit");
  assert.equal(classifyProviderError({ name: "APIConnectionTimeoutError" }).code, "provider_timeout");
  assert.equal(classifyProviderError({ status: 500 }).code, "provider_error");
});

test("local CORS allowlist includes both localhost forms used by Vite", () => {
  const source = require("node:fs").readFileSync(require.resolve("../server"), "utf8");
  assert.match(source, /http:\/\/localhost:5173/);
  assert.match(source, /http:\/\/127\.0\.0\.1:5173/);
});
