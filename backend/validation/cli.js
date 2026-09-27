#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { loadCase, runCase, listCaseFiles, summarize } = require("./harness");
const { renderMarkdown } = require("./report");

function parseArgs(argv) {
  const options = { mode: "deterministic", report: false, caseId: null, authorized: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--report") options.report = true;
    else if (arg === "--case") options.caseId = argv[++index];
    else if (arg === "--mode") options.mode = argv[++index];
    else if (arg === "--authorize-live-provider") options.authorized = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.mode === "live-provider") {
    if (!options.authorized) throw new Error("Live-provider mode requires --authorize-live-provider");
    throw new Error("No live adapter was configured. Use the harness API with an explicitly authorized production-equivalent adapter.");
  }
  const available = listCaseFiles();
  const selected = options.caseId ? available.filter((file) => path.basename(file) === `${options.caseId}.case.json`) : available;
  if (!selected.length) throw new Error(`No validation case found${options.caseId ? ` for ${options.caseId}` : ""}`);
  const results = [];
  for (const file of selected) results.push(await runCase(loadCase(file), { mode: options.mode }));
  const summary = summarize(results);
  const payload = { generatedAt: new Date().toISOString(), summary, results };
  if (options.report) {
    const directory = path.join(__dirname, "reports");
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "latest.json"), `${JSON.stringify(payload, null, 2)}\n`);
    fs.writeFileSync(path.join(directory, "latest.md"), renderMarkdown(results, summary));
  }
  console.log(JSON.stringify(payload, null, 2));
  if (summary.failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Clinical validation failed: ${error.message}`);
  process.exitCode = 1;
});
