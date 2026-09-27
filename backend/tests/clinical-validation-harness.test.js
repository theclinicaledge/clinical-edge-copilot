const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ANTHROPIC_API_KEY ||= "test-key";

const {
  FAILURE_TAXONOMY,
  STATUS,
  appendHistory,
  generationInput,
  listCaseFiles,
  loadCase,
  runCase,
  scoreOutputs,
  summarize,
} = require("../validation/harness");
const { validateCaseDefinition } = require("../validation/schema");

test("case generation receives only the synthetic Snapshot, never the answer key", () => {
  const loaded = loadCase(listCaseFiles()[0]);
  assert.deepEqual(Object.keys(generationInput(loaded)), ["snapshot"]);
  assert.equal(generationInput(loaded).snapshot, loaded.snapshot);
  assert.equal(JSON.stringify(generationInput(loaded)).includes("requiredConcepts"), false);
});

test("deterministic mode cannot call a supplied live provider adapter", async () => {
  const loaded = loadCase(listCaseFiles()[0]);
  let calls = 0;
  const result = await runCase(loaded, { mode: "deterministic", generateLive: async () => { calls += 1; } });
  assert.equal(calls, 0);
  assert.equal(result.mode, "deterministic");
  assert.equal(result.provenance.displayed, "deterministic_fallback");
});

test("live-provider mode requires deliberate authorization and an adapter", async () => {
  const loaded = loadCase(listCaseFiles()[0]);
  await assert.rejects(runCase(loaded, { mode: "live-provider" }), /explicit authorization/);
  await assert.rejects(runCase(loaded, { mode: "live-provider", authorized: true }), /live adapter/);
});

test("history updates append and never replace an existing event", () => {
  const existing = { caseId: "example", events: [{ id: "first", recordedAt: "2026-09-27T00:00:00Z", mode: "deterministic", status: "PASS" }] };
  const next = appendHistory(existing, { id: "second", recordedAt: "2026-09-27T00:01:00Z", mode: "live-provider", status: "FAIL" });
  assert.deepEqual(next.events.map((event) => event.id), ["first", "second"]);
  assert.deepEqual(existing.events.map((event) => event.id), ["first"]);
  assert.throws(() => appendHistory(next, next.events[0]), /already exists/);
});

test("required component failures fail the overall case with a stable code", () => {
  const loaded = loadCase(listCaseFiles()[0]);
  const altered = {
    ...loaded,
    answerKey: {
      ...loaded.answerKey,
      requiredConcepts: [{ label: "deliberately absent", pattern: "never-present-concept" }],
    },
  };
  const scored = scoreOutputs(altered, { priorityMap: "Urgency Level: HIGH\nThe existing pattern supports prompt evaluation now.", teachMe: null, sbar: null, provenance: { displayed: "deterministic_fallback" } });
  assert.equal(scored.status, STATUS.FAIL);
  assert.ok(scored.requiredFailures.includes("priority_map"));
  assert.ok(scored.failureCodes.includes("priority_integration_failure"));
  assert.equal(FAILURE_TAXONOMY.priority_integration_failure, "The output did not integrate the required clinical pattern.");
});

test("schema parsing rejects malformed cases clearly", () => {
  assert.throws(() => validateCaseDefinition({ id: "bad" }), /case.title must be a non-empty string/);
  assert.throws(() => validateCaseDefinition({ id: "bad", title: "Bad", clinicalDomain: "x", careSetting: "x", difficulty: "x", version: "1", cohort: "unknown", snapshotFile: "x", answerKeyFile: "x", historyFile: "x", capabilityTags: ["x"] }), /case.cohort must be one of/);
});

test("all migrated Gold Cases pass deterministic regression without changing history", async () => {
  const loaded = listCaseFiles().map(loadCase);
  const before = loaded.map((item) => JSON.stringify(item.history));
  const results = await Promise.all(loaded.map((item) => runCase(item)));
  assert.equal(results.length, 5);
  assert.ok(results.every((result) => result.status === STATUS.PASS));
  assert.deepEqual(loaded.map((item) => JSON.stringify(item.history)), before);
  assert.deepEqual(results.map((result) => result.historicalRealProviderStatus), ["REAL_PROVIDER_PASS", "REAL_PROVIDER_FAIL", "REAL_PROVIDER_FAIL", "REAL_PROVIDER_FAIL", "REAL_PROVIDER_FAIL"]);
});

test("report summary totals, domains, provenance, and lock state are correct", async () => {
  const results = await Promise.all(listCaseFiles().map((file) => runCase(loadCase(file))));
  const summary = summarize(results);
  assert.equal(summary.totalCases, 5);
  assert.equal(summary.passed, 5);
  assert.equal(summary.failed, 0);
  assert.equal(summary.byMode.deterministic, 5);
  assert.equal(summary.provenanceDistribution.deterministic_fallback, 5);
  assert.equal(summary.locked, 1);
  assert.equal(summary.notLocked, 4);
  assert.deepEqual(summary.byCapability.sbar_grounding, { cases: 3, passed: 0, failed: 0, notApplicable: 3 });
  assert.deepEqual(summary.requiringLiveProviderValidation, ["gold-02", "gold-03", "gold-04", "gold-05"]);
});
