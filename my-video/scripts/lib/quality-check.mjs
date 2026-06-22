// ─── Clinical Edge Video Quality Checker ─────────────────────────────────────
// Runs after script generation to catch common issues before rendering.

import { C } from "./utils.mjs";

// ─── Banned phrases — Clinical Edge never says these ─────────────────────────
const BANNED_PHRASES = [
  "code-level",
  "call a code",
  "call 911",
  "they're going to die",
  "per protocol",
  "per facility policy",
  "as per",
  "textbook presentation",
  "textbook symptoms",
  "clinicaledge.co",      // wrong handle format
  "@clinicaledge.co",     // wrong handle
  "clinical edge co",     // wrong handle
];

// ─── Run all checks and return results ───────────────────────────────────────
export function runQualityCheck(script) {
  const checks = [];

  // 1. Handle
  const handleOk = script.ctaHandle === "@clinicaledgeco";
  checks.push({
    label: "Handle",
    pass: handleOk,
    value: script.ctaHandle,
    fix: handleOk ? null : `should be @clinicaledgeco, got "${script.ctaHandle}"`,
  });

  // 2. Footage assigned
  const hasFootage = Array.isArray(script.footageFiles) && script.footageFiles.length > 0;
  checks.push({
    label: "Footage",
    pass: hasFootage,
    value: hasFootage ? `${script.footageFiles.length} clip(s)` : "none",
    fix: hasFootage ? null : "No footage files — run without --skip-footage first",
  });

  // 3. Hook length
  const hookWords = script.hookLine?.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length ?? 99;
  const hookOk = hookWords <= 10;
  checks.push({
    label: "Hook length",
    pass: hookOk,
    value: `${hookWords} words`,
    fix: hookOk ? null : `Hook is ${hookWords} words — aim for 8 or fewer`,
  });

  // 4. Hook lines
  const hookLines = (script.hookLine ?? "").split("\n").length;
  const hookLinesOk = hookLines <= 2;
  checks.push({
    label: "Hook lines",
    pass: hookLinesOk,
    value: `${hookLines} line(s)`,
    fix: hookLinesOk ? null : "Hook has more than 2 lines — reduce",
  });

  // 5. Card label length
  const cardLabelWords = (script.breakdownCards ?? []).map(c =>
    c.label?.split(/\s+/).filter(Boolean).length ?? 0
  );
  const cardsLabelOk = cardLabelWords.every(n => n <= 6);
  checks.push({
    label: "Card labels",
    pass: cardsLabelOk,
    value: `max ${Math.max(0, ...cardLabelWords)} words`,
    fix: cardsLabelOk ? null : "Some card labels are too long — aim for 5 words max",
  });

  // 6. Card detail length
  const cardDetailWords = (script.breakdownCards ?? []).map(c =>
    c.detail?.split(/\s+/).filter(Boolean).length ?? 0
  );
  const cardsDetailOk = cardDetailWords.every(n => n <= 8);
  checks.push({
    label: "Card details",
    pass: cardsDetailOk,
    value: `max ${Math.max(0, ...cardDetailWords)} words`,
    fix: cardsDetailOk ? null : "Some card details are too long — aim for 6 words max",
  });

  // 7. Action count
  const actionCount = (script.nursingActions ?? []).length;
  const actionsOk = actionCount >= 3 && actionCount <= 6;
  checks.push({
    label: "Action count",
    pass: actionsOk,
    value: `${actionCount} actions`,
    fix: actionsOk ? null : `${actionCount} actions — should be 3-6`,
  });

  // 8. Banned phrases — scan all text fields
  const allText = [
    script.hookLine,
    script.breakdownTitle,
    ...(script.breakdownCards ?? []).map(c => `${c.label} ${c.detail}`),
    script.nursingTitle,
    ...(script.nursingActions ?? []),
    script.closingLine,
    script.tiktokCaption,
    script.instagramCaption,
    script.ctaHandle,
  ].join(" ").toLowerCase();

  const foundBanned = BANNED_PHRASES.filter(p => allText.includes(p.toLowerCase()));
  const bannedOk = foundBanned.length === 0;
  checks.push({
    label: "Voice / language",
    pass: bannedOk,
    value: bannedOk ? "clean" : `banned: "${foundBanned.join('", "')}"`,
    fix: bannedOk ? null : `Remove or replace: ${foundBanned.map(p => `"${p}"`).join(", ")}`,
  });

  // 9. Closing line — should be 1-2 sentences
  const closingParts = (script.closingLine ?? "").split("\n").filter(Boolean).length;
  const closingOk = closingParts >= 1 && closingParts <= 2;
  checks.push({
    label: "Closing line",
    pass: closingOk,
    value: `${closingParts} part(s)`,
    fix: closingOk ? null : "Closing line should be 1-2 sentences separated by \\n",
  });

  // 10. Urgency set
  const urgencyOk = ["HIGH", "MODERATE", "LOW"].includes(script.urgency);
  checks.push({
    label: "Urgency",
    pass: urgencyOk,
    value: script.urgency ?? "missing",
    fix: urgencyOk ? null : `Invalid urgency: "${script.urgency}"`,
  });

  return checks;
}

// ─── Print check results ──────────────────────────────────────────────────────
export function printQualityReport(script, checks) {
  const divider = "─".repeat(56);
  const allPass = checks.every(c => c.pass);
  const warnings = checks.filter(c => !c.pass);

  console.log(`
${C.teal}${divider}
  QUALITY CHECK — ${script.topic}
${divider}${C.reset}
`);

  for (const check of checks) {
    const icon   = check.pass ? `${C.green}✓${C.reset}` : `${C.yellow}⚠${C.reset}`;
    const label  = check.label.padEnd(16);
    const value  = check.pass
      ? `${C.dim}${check.value}${C.reset}`
      : `${C.yellow}${check.value}${C.reset}`;
    console.log(`  ${icon} ${C.bold}${label}${C.reset} ${value}`);
  }

  console.log(`\n${C.teal}${divider}${C.reset}`);

  if (allPass) {
    console.log(`  ${C.green}${C.bold}ALL CHECKS PASSED ✓${C.reset}\n`);
  } else {
    console.log(`  ${C.yellow}${C.bold}${warnings.length} WARNING(S):${C.reset}`);
    for (const w of warnings) {
      console.log(`  ${C.yellow}→ ${w.fix}${C.reset}`);
    }
    console.log();
  }

  return allPass;
}
