import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { extractRapidCapture } from "../../src/components/rapidCaptureExtractor.js";

const directory = dirname(fileURLToPath(import.meta.url));
const defaultInputsPath = join(directory, "inputs.json");
const answerKeyPath = join(directory, "answer-key.json");
const checkOnly = process.argv[2] === "--check";
const outputPath = checkOnly ? null : resolve(process.argv[2] || join(directory, "baseline-v1.json"));
const keyOverridePath = process.argv[3] ? resolve(process.argv[3]) : null;
const inputsPath = process.argv[4] ? resolve(process.argv[4]) : defaultInputsPath;

if (outputPath && existsSync(outputPath)) {
  throw new Error(`Refusing to overwrite preserved validation output: ${outputPath}`);
}

const inputs = JSON.parse(readFileSync(inputsPath, "utf8"));
let answerKey = JSON.parse(readFileSync(answerKeyPath, "utf8"));
if (keyOverridePath) {
  const override = JSON.parse(readFileSync(keyOverridePath, "utf8"));
  if (Array.isArray(override.cases)) {
    answerKey = override;
  } else {
    for (const [id, patch] of Object.entries(override.patches || {})) {
      const entry = answerKey.cases.find((candidate) => candidate.id === id);
      if (!entry) throw new Error(`Answer-key patch references unknown case: ${id}`);
      entry.expectedClaims = entry.expectedClaims.filter((claim) => !(patch.remove || []).includes(claim));
      entry.expectedClaims.push(...(patch.add || []));
    }
    answerKey.answerKeyVersion = override.answerKeyVersion;
  }
}
const expectedById = new Map(answerKey.cases.map((entry) => [entry.id, entry]));
const extractorPath = join(directory, "../../src/components/rapidCaptureExtractor.js");
const extractorSource = readFileSync(extractorPath, "utf8");

function normalize(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function addClaim(claims, path, value) {
  if (value === undefined || value === null || value === "") return;
  claims.push(`${path}=${normalize(value)}`);
}

function canonicalClaims(snapshot) {
  const claims = [];
  const values = snapshot.values || {};

  for (const [key, value] of Object.entries(values)) {
    if (key === "loc") {
      addClaim(claims, "values.mental", "Changed");
      addClaim(claims, "values.mentalDetail", value);
      continue;
    }
    if (key === "perfusionFindings") {
      for (const finding of value || []) {
        if (finding === "Cool / clammy") addClaim(claims, "values.skinTemperature", "Cool");
        else if (finding === "Delayed capillary refill") addClaim(claims, "values.capillaryRefill", "Delayed");
        else addClaim(claims, "values.perfusionFindings[]", finding);
      }
      continue;
    }
    addClaim(claims, `values.${key}`, Array.isArray(value) ? value.join("|") : value);
  }

  for (const [key, value] of Object.entries(snapshot.units || {})) {
    if (!["lactate", "creatinine", "potassium", "cvp", "ci", "co", "svr", "svo2"].includes(key)) continue;
    addClaim(claims, `units.${key}`, value || "unspecified");
  }

  for (const [moduleId, moduleValue] of Object.entries(snapshot.optional || {})) {
    for (const [listId, list] of Object.entries(moduleValue || {})) {
      if (!Array.isArray(list)) continue;
      list.forEach((entry, index) => {
        for (const [key, value] of Object.entries(entry || {})) {
          addClaim(claims, `optional.${moduleId}.${listId}[${index}].${key}`, value);
        }
      });
    }
  }

  return [...new Set(claims)].sort();
}

function intersection(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
}

const results = [];
for (const testCase of inputs.cases) {
  const expected = expectedById.get(testCase.id);
  if (!expected) throw new Error(`Missing answer key for ${testCase.id}`);
  const started = performance.now();
  const extraction = extractRapidCapture(testCase.narrative);
  const latencyMs = performance.now() - started;
  const actualClaims = canonicalClaims(extraction.snapshot);
  const truePositives = intersection(actualClaims, expected.expectedClaims);
  const falsePositives = difference(actualClaims, expected.expectedClaims);
  const falseNegatives = difference(expected.expectedClaims, actualClaims);
  const actualNeedsReview = extraction.status === "needs_review";
  const expectedTemporal = expected.temporalClaims || [];
  const matchedTemporal = intersection(actualClaims, expectedTemporal);
  const unexpectedTemporal = falsePositives.filter((claim) => /Earlier=|Now=|previous|current|Timeframe|Interval|direction=/i.test(claim));
  const findings = [];

  falsePositives.forEach((claim) => findings.push({ severity: "P0", type: "unsupported_structured_claim", claim }));
  falseNegatives.forEach((claim) => findings.push({ severity: "P1", type: "supported_claim_missed", claim }));
  if (expected.expectedNeedsReview && !actualNeedsReview) findings.push({ severity: "P1", type: "ambiguity_not_routed_to_review" });
  if (!expected.expectedNeedsReview && actualNeedsReview) findings.push({ severity: "P2", type: "unnecessary_needs_review" });

  results.push({
    id: testCase.id,
    domain: testCase.domain,
    narrative: testCase.narrative,
    expected: {
      claims: expected.expectedClaims,
      needsReview: expected.expectedNeedsReview,
      temporalClaims: expectedTemporal,
      risk: expected.risk || null,
    },
    actual: {
      claims: actualClaims,
      needsReview: actualNeedsReview,
      rawExtraction: extraction,
    },
    scoring: {
      truePositives,
      falsePositives,
      falseNegatives,
      matchedTemporal,
      unexpectedTemporal,
      findings,
    },
    latencyMs,
  });
}

const totals = results.reduce((sum, entry) => {
  sum.truePositives += entry.scoring.truePositives.length;
  sum.falsePositives += entry.scoring.falsePositives.length;
  sum.falseNegatives += entry.scoring.falseNegatives.length;
  sum.expectedTemporal += entry.expected.temporalClaims.length;
  sum.matchedTemporal += entry.scoring.matchedTemporal.length;
  sum.unexpectedTemporal += entry.scoring.unexpectedTemporal.length;
  sum.needsReviewCorrect += Number(entry.expected.needsReview === entry.actual.needsReview);
  sum.ambiguousCases += Number(entry.expected.needsReview);
  sum.ambiguousRouted += Number(entry.expected.needsReview && entry.actual.needsReview);
  for (const finding of entry.scoring.findings) sum.severity[finding.severity] += 1;
  return sum;
}, {
  truePositives: 0,
  falsePositives: 0,
  falseNegatives: 0,
  expectedTemporal: 0,
  matchedTemporal: 0,
  unexpectedTemporal: 0,
  needsReviewCorrect: 0,
  ambiguousCases: 0,
  ambiguousRouted: 0,
  severity: { P0: 0, P1: 0, P2: 0 },
});

const latencies = results.map((entry) => entry.latencyMs);
const actualClaimCount = totals.truePositives + totals.falsePositives;
const expectedClaimCount = totals.truePositives + totals.falseNegatives;
const report = {
  validation: "Rapid Capture Validation Corpus v1",
  generatedAt: new Date().toISOString(),
  corpusVersion: inputs.corpusVersion,
  answerKeyVersion: answerKey.answerKeyVersion,
  caseCount: results.length,
  syntheticOnly: inputs.syntheticOnly,
  extractorRevision: {
    gitHead: execFileSync("git", ["rev-parse", "HEAD"], { cwd: join(directory, "../../.."), encoding: "utf8" }).trim(),
    sha256: createHash("sha256").update(extractorSource).digest("hex"),
    path: "frontend/src/components/rapidCaptureExtractor.js",
  },
  aggregate: {
    ...totals,
    precision: actualClaimCount ? totals.truePositives / actualClaimCount : 1,
    recall: expectedClaimCount ? totals.truePositives / expectedClaimCount : 1,
    unsafeFalsePositiveRatePerStructuredClaim: actualClaimCount ? totals.falsePositives / actualClaimCount : 0,
    casesWithUnsafeFalsePositive: results.filter((entry) => entry.scoring.falsePositives.length).length,
    needsReviewAccuracy: totals.needsReviewCorrect / results.length,
    ambiguousRoutingAccuracy: totals.ambiguousCases ? totals.ambiguousRouted / totals.ambiguousCases : 1,
    temporalFidelity: totals.expectedTemporal ? totals.matchedTemporal / totals.expectedTemporal : 1,
  },
  latencyMs: {
    min: Math.min(...latencies),
    median: percentile(latencies, 0.5),
    p95: percentile(latencies, 0.95),
    max: Math.max(...latencies),
    mean: latencies.reduce((sum, value) => sum + value, 0) / latencies.length,
  },
  results,
};

if (outputPath) writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify({ outputPath, aggregate: report.aggregate, latencyMs: report.latencyMs }, null, 2));
if (checkOnly) {
  const passes = report.aggregate.severity.P0 === 0
    && report.aggregate.falsePositives === 0
    && report.aggregate.precision >= 0.99
    && report.aggregate.recall >= 0.9
    && report.aggregate.ambiguousRoutingAccuracy >= 0.95
    && report.aggregate.temporalFidelity >= 0.9;
  if (!passes) process.exitCode = 1;
}
