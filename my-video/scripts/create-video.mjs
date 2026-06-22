#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  Clinical Edge — Automated Video Pipeline
//  Usage:  node scripts/create-video.mjs "Complete Heart Block"
//  Or:     npm run create-video -- "Complete Heart Block"
// ─────────────────────────────────────────────────────────────────────────────

import fs   from "fs";
import path from "path";

import { loadEnv, toSlug, mkdirp, ROOT, step, success, warn, fail, info, C } from "./lib/utils.mjs";
import { generateScript }                 from "./lib/generate-script.mjs";
import { downloadFootage, writeCredits }  from "./lib/pexels.mjs";
import { renderVideo }                    from "./lib/render.mjs";
import { writeCaptionFile }               from "./lib/captions.mjs";
import { runQualityCheck, printQualityReport } from "./lib/quality-check.mjs";

// ─── Load environment variables first ────────────────────────────────────────
loadEnv();

// ─── Parse CLI arguments ──────────────────────────────────────────────────────
const args  = process.argv.slice(2);
const topic = args[0];
const flags = {
  skipFootage: args.includes("--skip-footage"),
  skipRender:  args.includes("--skip-render"),
  forceRegen:  args.includes("--force"),
};

if (!topic) {
  console.error(`
${C.red}${C.bold}Error: topic is required.${C.reset}

Usage:
  node scripts/create-video.mjs "Complete Heart Block"
  node scripts/create-video.mjs "Septic Shock" --skip-footage
  node scripts/create-video.mjs "A-Fib with RVR" --force

Flags:
  --skip-footage   Skip Pexels download (use existing footage or none)
  --skip-render    Generate script + footage only, do not render
  --force          Regenerate script even if one already exists
`);
  process.exit(1);
}

// ─── Setup output paths ───────────────────────────────────────────────────────
const slug        = toSlug(topic);
const outDir      = path.join(ROOT, "out", slug);
const assetsDir   = path.join(outDir, "assets");
const footageDir  = path.join(ROOT, "public", "footage", slug);
const scriptPath  = path.join(outDir, "script.json");
const videoPath   = path.join(outDir, "video.mp4");
const captionPath = path.join(outDir, "caption.txt");
const creditsPath = path.join(assetsDir, "footage-credits.txt");

mkdirp(outDir);
mkdirp(assetsDir);
mkdirp(footageDir);

// ─── Banner ───────────────────────────────────────────────────────────────────
console.log(`
${C.teal}${C.bold}╔══════════════════════════════════════════════════════════╗
║          Clinical Edge — Video Pipeline                  ║
╚══════════════════════════════════════════════════════════╝${C.reset}

  Topic  : ${C.white}${C.bold}${topic}${C.reset}
  Slug   : ${C.dim}${slug}${C.reset}
  Output : ${C.dim}${outDir}${C.reset}
`);

const TOTAL_STEPS = flags.skipRender ? 4 : 5;
let script;
let footageResults = [];

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 1 — Generate or load video script
// ─────────────────────────────────────────────────────────────────────────────
step(1, TOTAL_STEPS, "Generating video script via Claude...");

if (!flags.forceRegen && fs.existsSync(scriptPath)) {
  info(`Existing script found at ${scriptPath} — loading it.`);
  info(`Run with --force to regenerate.`);
  script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  success(`Loaded script: "${script.topic}"`);
} else {
  try {
    script = await generateScript(topic);

    // Ensure slug matches what we computed (in case Claude generates a different one)
    script.slug = slug;

    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
    success(`Script saved → ${scriptPath}`);

    // Print a brief preview
    console.log(`
  ${C.dim}Hook    : ${C.white}${script.hookLine.replace(/\n/g, " | ")}${C.reset}
  ${C.dim}Urgency : ${C.white}${script.urgency}${C.reset}
  ${C.dim}ECG     : ${C.white}${script.ecgType}${C.reset}
  ${C.dim}Cards   : ${C.white}${script.breakdownCards?.map(c => c.label).join(" · ")}${C.reset}
`);
  } catch (err) {
    fail(`Script generation failed: ${err.message}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 2 — Quality check
// ─────────────────────────────────────────────────────────────────────────────
step(2, TOTAL_STEPS, "Running quality check...");
{
  const checks = runQualityCheck(script);
  printQualityReport(script, checks);
  // Quality warnings are non-blocking — pipeline continues, but issues are visible
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 3 — Download Pexels footage
// ─────────────────────────────────────────────────────────────────────────────
step(3, TOTAL_STEPS, "Downloading stock footage from Pexels...");

// If script already has footageFiles (loaded from disk), use them
if (!script.footageFiles) {
  // Try loading from existing manifest
  const manifestPath = path.join(assetsDir, "footage-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    script.footageFiles = manifest.map(r => `footage/${slug}/${r.filename}`);
    info(`Loaded ${script.footageFiles.length} footage file(s) from existing manifest.`);
  }
}

if (flags.skipFootage) {
  warn("--skip-footage flag set — skipping Pexels download.");
} else {
  const queries = script.footageQueries ?? ["hospital nurse", "medical monitor"];
  info(`Search queries: ${queries.join(", ")}`);

  try {
    footageResults = await downloadFootage(queries, footageDir);

    if (footageResults.length > 0) {
      success(`Downloaded ${footageResults.length} footage clip(s) → ${footageDir}`);
      writeCredits(footageResults, creditsPath);

      // Inject footage paths (relative to public/) into the script so
      // VideoTemplate can reference them via staticFile()
      script.footageFiles = footageResults.map(r =>
        `footage/${slug}/${r.filename}`
      );
      // Persist the updated script with footageFiles included
      fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

      // Also copy a footage manifest to assets/
      const manifest = footageResults.map(r => ({
        query: r.query,
        filename: r.filename,
        path: r.localPath,
        pexelsId: r.pexelsId,
        photographer: r.photographer,
        resolution: `${r.width}×${r.height}`,
        remoteSourcePath: path.relative(ROOT, r.localPath).replace(/\\/g, "/"),
      }));
      fs.writeFileSync(
        path.join(assetsDir, "footage-manifest.json"),
        JSON.stringify(manifest, null, 2)
      );
    } else {
      warn("No footage downloaded (check PEXELS_API_KEY or try --skip-footage).");
    }
  } catch (err) {
    warn(`Footage download error: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 4 — Generate captions
// ─────────────────────────────────────────────────────────────────────────────
step(4, TOTAL_STEPS, "Writing captions...");

try {
  writeCaptionFile(script, captionPath, footageResults);
  success(`Captions saved → ${captionPath}`);
} catch (err) {
  warn(`Caption write error: ${err.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 5 — Render video
// ─────────────────────────────────────────────────────────────────────────────
if (!flags.skipRender) {
  step(5, TOTAL_STEPS, "Rendering Remotion composition...");
  try {
    await renderVideo(script, videoPath);
    success(`Video rendered → ${videoPath}`);
  } catch (err) {
    fail(`Render failed: ${err.message}`);
    console.log(`\n${C.yellow}You can re-run with --skip-footage --skip-render to debug.${C.reset}`);
    console.log(`${C.yellow}Or open Remotion Studio: npm run start${C.reset}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  DONE — Print summary table
// ─────────────────────────────────────────────────────────────────────────────
const divider = "─".repeat(58);
console.log(`
${C.teal}${C.bold}
╔══════════════════════════════════════════════════════════╗
║                    Pipeline Complete ✓                   ║
╚══════════════════════════════════════════════════════════╝${C.reset}

  ${C.bold}Topic    ${C.reset} ${script.topic}
  ${C.bold}Urgency  ${C.reset} ${script.urgency}

  ${C.teal}${divider}${C.reset}
  ${C.bold}Output files:${C.reset}
`);

const files = [
  { label: "MP4 video",  path: videoPath,   skip: flags.skipRender },
  { label: "Script JSON", path: scriptPath  },
  { label: "Captions",   path: captionPath  },
  { label: "Assets dir", path: assetsDir    },
  { label: "Footage dir", path: footageDir  },
];

for (const f of files) {
  if (f.skip) continue;
  const exists = fs.existsSync(f.path);
  const icon   = exists ? `${C.green}✓${C.reset}` : `${C.yellow}–${C.reset}`;
  const rel    = path.relative(ROOT, f.path);
  console.log(`  ${icon} ${C.bold}${f.label.padEnd(12)}${C.reset} ${C.dim}${rel}${C.reset}`);
}

console.log(`
  ${C.teal}${divider}${C.reset}
  ${C.bold}TikTok caption:${C.reset}
  ${C.dim}${script.tiktokCaption}${C.reset}

  ${C.bold}To create another video:${C.reset}
  ${C.teal}npm run create-video -- "Your Topic Here"${C.reset}

  ${C.bold}To preview in Remotion Studio:${C.reset}
  ${C.teal}npm run start${C.reset}
`);
