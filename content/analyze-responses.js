// Clinical Edge Copilot — Response Log Analyzer
// Usage: node content/analyze-responses.js [--last N] [--date YYYY-MM-DD]
//
// Reads backend/logs/responses.jsonl and prints a structured product-learning
// summary across 8 sections:
//
//   1. Overview (totals, success/error, date range)
//   2. Route distribution
//   3. Mode distribution
//   4. Category distribution
//   5. Input length distribution
//   6. Urgency distribution
//   7. Top repeated inputs + likely misrouted short queries
//   8. Daily breakdown
//   9. Fix-priority suggestions

"use strict";

const fs       = require("fs");
const path     = require("path");
const readline = require("readline");

const LOG_FILE = path.join(__dirname, "../backend/logs/responses.jsonl");

// ── CLI flags ─────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const lastIdx  = args.indexOf("--last");
const lastN    = lastIdx !== -1 ? parseInt(args[lastIdx + 1], 10) : null;
const dateIdx  = args.indexOf("--date");
const filterDate = dateIdx !== -1 ? args[dateIdx + 1] : null; // "YYYY-MM-DD"

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(n, total) {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function bar(n, total, width = 20) {
  const filled = Math.round((n / total) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function sortedDesc(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function hr(char = "─", width = 70) {
  return char.repeat(width);
}

function header(title) {
  const pad = Math.floor((68 - title.length) / 2);
  return `\n${"─".repeat(70)}\n${" ".repeat(pad)}${title}\n${"─".repeat(70)}`;
}

// ── Load entries ──────────────────────────────────────────────────────────────
async function loadEntries() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error("No log file found at:", LOG_FILE);
    process.exit(1);
  }

  const entries = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(LOG_FILE),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }

  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function analyze() {
  let entries = await loadEntries();

  if (entries.length === 0) {
    console.log("No log entries found.");
    return;
  }

  // Apply --date filter
  if (filterDate) {
    entries = entries.filter((e) => e.timestamp && e.timestamp.startsWith(filterDate));
    if (entries.length === 0) {
      console.log(`No entries found for date: ${filterDate}`);
      return;
    }
  }

  // Apply --last N filter (most recent N)
  if (lastN && lastN > 0) {
    entries = entries.slice(-lastN);
  }

  const total   = entries.length;
  const success = entries.filter((e) => e.status === "success");
  const errors  = entries.filter((e) => e.status === "error");

  const timestamps  = entries.map((e) => e.timestamp).filter(Boolean).sort();
  const firstSeen   = timestamps[0]?.slice(0, 16).replace("T", " ") ?? "—";
  const lastSeen    = timestamps[timestamps.length - 1]?.slice(0, 16).replace("T", " ") ?? "—";

  console.log(header("Clinical Edge Copilot — Log Analysis"));
  console.log(`  File:        ${LOG_FILE}`);
  if (filterDate) console.log(`  Date filter: ${filterDate}`);
  if (lastN)      console.log(`  Showing:     last ${lastN} entries`);

  // ── 1. OVERVIEW ──────────────────────────────────────────────────────────
  console.log(header("1 · Overview"));
  console.log(`  Total entries  : ${total}`);
  console.log(`  Success        : ${success.length}  (${pct(success.length, total)})`);
  console.log(`  Errors         : ${errors.length}  (${pct(errors.length, total)})`);
  console.log(`  First entry    : ${firstSeen}`);
  console.log(`  Last entry     : ${lastSeen}`);

  // ── 2. ROUTE DISTRIBUTION ────────────────────────────────────────────────
  console.log(header("2 · Route Distribution"));
  const byRoute = {};
  for (const e of entries) byRoute[e.route || "unknown"] = (byRoute[e.route || "unknown"] || 0) + 1;
  for (const [route, count] of sortedDesc(byRoute)) {
    console.log(`  ${bar(count, total)}  ${count.toString().padStart(4)}  ${pct(count, total).padStart(4)}  ${route}`);
  }

  // ── 3. MODE DISTRIBUTION ─────────────────────────────────────────────────
  console.log(header("3 · Mode Distribution"));
  const byMode = {};
  for (const e of entries) {
    const m = e.mode || "unknown";
    byMode[m] = (byMode[m] || 0) + 1;
  }
  for (const [mode, count] of sortedDesc(byMode)) {
    console.log(`  ${bar(count, total)}  ${count.toString().padStart(4)}  ${pct(count, total).padStart(4)}  ${mode}`);
  }

  // ── 4. CATEGORY DISTRIBUTION ─────────────────────────────────────────────
  console.log(header("4 · Category Distribution"));
  const byCat = {};
  for (const e of entries) {
    const c = e.category || "unknown";
    byCat[c] = (byCat[c] || 0) + 1;
  }
  for (const [cat, count] of sortedDesc(byCat)) {
    console.log(`  ${bar(count, total)}  ${count.toString().padStart(4)}  ${pct(count, total).padStart(4)}  ${cat}`);
  }

  // ── 5. INPUT LENGTH DISTRIBUTION ─────────────────────────────────────────
  console.log(header("5 · Input Length Distribution  (word_count)"));
  const buckets = { "1–5": 0, "6–15": 0, "16–30": 0, "31–60": 0, "61+": 0 };
  for (const e of entries) {
    const wc = e.word_count ?? (e.input_redacted || "").split(/\s+/).length;
    if      (wc <= 5)  buckets["1–5"]++;
    else if (wc <= 15) buckets["6–15"]++;
    else if (wc <= 30) buckets["16–30"]++;
    else if (wc <= 60) buckets["31–60"]++;
    else               buckets["61+"]++;
  }
  for (const [label, count] of Object.entries(buckets)) {
    console.log(`  ${bar(count, total)}  ${count.toString().padStart(4)}  ${pct(count, total).padStart(4)}  ${label} words`);
  }

  // Median word count
  const wcs = entries
    .map((e) => e.word_count ?? (e.input_redacted || "").split(/\s+/).length)
    .sort((a, b) => a - b);
  const median = wcs[Math.floor(wcs.length / 2)];
  const avg    = Math.round(wcs.reduce((s, v) => s + v, 0) / wcs.length);
  console.log(`\n  Avg: ${avg} words  |  Median: ${median} words`);

  // ── 6. URGENCY DISTRIBUTION ──────────────────────────────────────────────
  console.log(header("6 · Urgency Distribution  (successful responses only)"));
  const byUrgency = {};
  for (const e of success) {
    const u = e.urgency || "null/unknown";
    byUrgency[u] = (byUrgency[u] || 0) + 1;
  }
  const totalSuccess = success.length || 1;
  for (const [urgency, count] of sortedDesc(byUrgency)) {
    console.log(`  ${bar(count, totalSuccess)}  ${count.toString().padStart(4)}  ${pct(count, totalSuccess).padStart(4)}  ${urgency}`);
  }

  // ── 7. TOP REPEATED INPUTS & LIKELY MISROUTED SHORT QUERIES ──────────────
  console.log(header("7 · Top Repeated Inputs"));
  const inputFreq = {};
  for (const e of entries) {
    const key = (e.input_normalized || e.input_redacted || "").toLowerCase().trim();
    if (key) inputFreq[key] = (inputFreq[key] || 0) + 1;
  }
  const repeated = sortedDesc(inputFreq).filter(([, c]) => c > 1).slice(0, 15);
  if (repeated.length > 0) {
    for (const [input, count] of repeated) {
      const preview = input.length > 80 ? input.slice(0, 80) + "…" : input;
      console.log(`  [×${count}] ${preview}`);
    }
  } else {
    console.log("  No repeated inputs found yet.");
  }

  // Likely misrouted: short queries (≤4 words) that landed on CLINICAL_REASONING
  console.log(`\n  ── Likely misrouted short queries (≤4 words → CLINICAL route) ──`);
  const misrouted = entries.filter((e) => {
    const wc = e.word_count ?? (e.input_redacted || "").split(/\s+/).length;
    return wc <= 4 && e.route && e.route.includes("CLINICAL");
  });
  if (misrouted.length > 0) {
    for (const e of misrouted.slice(0, 10)) {
      const preview = (e.input_normalized || e.input_redacted || "").slice(0, 70);
      console.log(`  [${e.timestamp?.slice(0,10) ?? "?"}]  "${preview}"`);
    }
  } else {
    console.log("  None found — routing looks healthy for short inputs.");
  }

  // ── 8. DAILY BREAKDOWN ───────────────────────────────────────────────────
  console.log(header("8 · Daily Breakdown  (last 14 days)"));
  const byDay = {};
  for (const e of entries) {
    const day = e.timestamp?.slice(0, 10) ?? "unknown";
    if (!byDay[day]) byDay[day] = { total: 0, success: 0, error: 0, highUrgency: 0 };
    byDay[day].total++;
    if (e.status === "success") byDay[day].success++;
    if (e.status === "error")   byDay[day].error++;
    if (e.urgency === "HIGH")   byDay[day].highUrgency++;
  }
  const recentDays = Object.keys(byDay).sort().slice(-14);
  if (recentDays.length === 0) {
    console.log("  No timestamped entries found.");
  } else {
    const maxDay = Math.max(...recentDays.map((d) => byDay[d].total));
    for (const day of recentDays) {
      const d = byDay[day];
      const b = bar(d.total, maxDay, 16);
      const hi = d.highUrgency > 0 ? `  ⚠ HIGH×${d.highUrgency}` : "";
      const er = d.error > 0 ? `  err×${d.error}` : "";
      console.log(`  ${day}  ${b}  ${d.total.toString().padStart(3)} reqs${hi}${er}`);
    }
  }

  // ── 9. FIX-PRIORITY SUGGESTIONS ──────────────────────────────────────────
  console.log(header("9 · Fix-Priority Suggestions"));

  const suggestions = [];

  // High error rate
  const errorRate = errors.length / total;
  if (errorRate > 0.05)
    suggestions.push(`⚠  Error rate is ${pct(errors.length, total)} — investigate Anthropic API failures`);

  // High proportion of "unknown" category
  const unknownCount = (byCat["unknown"] || 0) + (byCat["general"] || 0);
  if (unknownCount / total > 0.3)
    suggestions.push(`⚠  ${pct(unknownCount, total)} of inputs landed in general/unknown — review inferCategory() patterns`);

  // High proportion of QUICK_KNOWLEDGE but in "deep" mode
  const deepKnowledge = entries.filter(
    (e) => e.mode === "deep" && e.route && e.route.includes("KNOWLEDGE")
  ).length;
  if (deepKnowledge > 3)
    suggestions.push(`⚠  ${deepKnowledge} deep-mode requests routed to QUICK_KNOWLEDGE — check detectPrompt() deep-mode guard`);

  // Misrouted short queries
  if (misrouted.length > 0)
    suggestions.push(`⚠  ${misrouted.length} short queries (≤4 words) hit CLINICAL route — add patterns to isNursePracticalQuestion()`);

  // Repeated inputs (possible UX friction)
  if (repeated.length >= 5)
    suggestions.push(`ℹ  ${repeated.length} inputs repeated >1× — consider adding top repeats to example chips`);

  // Many entries with no mode field (pre-upgrade logs)
  const noMode = entries.filter((e) => !e.mode).length;
  if (noMode > 0)
    suggestions.push(`ℹ  ${noMode} entries missing 'mode' field — these are pre-upgrade log entries`);

  if (suggestions.length === 0) {
    console.log("  ✓  No immediate issues detected.");
  } else {
    for (const s of suggestions) console.log(`  ${s}`);
  }

  console.log(`\n${hr()}\n`);
}

analyze().catch((err) => {
  console.error("Analysis failed:", err.message);
  process.exit(1);
});
