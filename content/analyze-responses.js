// Clinical Edge Copilot — Response Log Analyzer
// Usage: node content/analyze-responses.js
//
// Reads backend/logs/responses.jsonl and prints a human-readable summary
// of total entries, route distribution, urgency counts, success/error
// status, and top repeated inputs.

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const LOG_FILE = path.join(__dirname, "../backend/logs/responses.jsonl");

async function analyze() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log("No log file found at:", LOG_FILE);
    return;
  }

  const entries = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(LOG_FILE),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        entries.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }
  }

  if (entries.length === 0) {
    console.log("No entries found.");
    return;
  }

  console.log("\n── Clinical Edge Copilot — Response Log Analysis ──────────────────");
  console.log(`Total entries: ${entries.length}`);

  // By route
  const byRoute = {};
  for (const e of entries) {
    const r = e.route || "unknown";
    byRoute[r] = (byRoute[r] || 0) + 1;
  }
  console.log("\nBy route:");
  for (const [route, count] of Object.entries(byRoute)) {
    console.log(`  ${route}: ${count}`);
  }

  // By urgency
  const byUrgency = {};
  for (const e of entries) {
    const u = e.urgency || "null";
    byUrgency[u] = (byUrgency[u] || 0) + 1;
  }
  console.log("\nBy urgency:");
  for (const [urgency, count] of Object.entries(byUrgency)) {
    console.log(`  ${urgency}: ${count}`);
  }

  // Success vs error
  const success = entries.filter((e) => e.status === "success").length;
  const errors  = entries.filter((e) => e.status === "error").length;
  console.log("\nStatus:");
  console.log(`  success: ${success}`);
  console.log(`  error:   ${errors}`);

  // Top repeated inputs (simple frequency match on input_redacted)
  const inputFreq = {};
  for (const e of entries) {
    if (e.input_redacted) {
      const key = e.input_redacted.toLowerCase().trim();
      inputFreq[key] = (inputFreq[key] || 0) + 1;
    }
  }
  const repeated = Object.entries(inputFreq)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (repeated.length > 0) {
    console.log("\nTop repeated inputs:");
    for (const [input, count] of repeated) {
      const preview = input.length > 80 ? input.slice(0, 80) + "..." : input;
      console.log(`  [x${count}] ${preview}`);
    }
  } else {
    console.log("\nNo repeated inputs found.");
  }

  console.log("\n────────────────────────────────────────────────────────────────────\n");
}

analyze().catch((err) => {
  console.error("Analysis failed:", err.message);
});
