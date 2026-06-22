// ─── Remotion render wrapper ──────────────────────────────────────────────────

import { spawn }  from "child_process";
import fs         from "fs";
import path       from "path";
import { ROOT, log, C } from "./utils.mjs";

// ─── Render VideoTemplate with a given script JSON ───────────────────────────
export function renderVideo(script, outputPath) {
  return new Promise((resolve, reject) => {
    // Write props to a temp file — avoids shell quoting issues with long JSON
    const propsPath = path.join(ROOT, "out", script.slug, "_props.json");
    fs.mkdirSync(path.dirname(propsPath), { recursive: true });
    fs.writeFileSync(propsPath, JSON.stringify(script, null, 2));

    const args = [
      "remotion", "render",
      "VideoTemplate",
      outputPath,
      `--props=${propsPath}`,
      "--codec=h264",
      "--log=error",          // quiet — only show errors
    ];

    log("▶", C.teal, `Rendering ${path.basename(outputPath)}...`);
    log("→", C.dim, `Props: ${propsPath}`);

    const proc = spawn("npx", args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    let stderr = "";
    proc.stdout.on("data", d => {
      const line = d.toString().trim();
      if (line) process.stdout.write(`  ${C.dim}${line}${C.reset}\n`);
    });
    proc.stderr.on("data", d => {
      const line = d.toString().trim();
      stderr += line + "\n";
      // Only print lines that look like real errors (not Remotion progress dots)
      if (line && !line.startsWith("Rendering") && !line.match(/^\d+\/\d+/)) {
        process.stderr.write(`  ${C.yellow}${line}${C.reset}\n`);
      }
    });

    proc.on("close", code => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`Remotion render exited with code ${code}.\n${stderr.slice(0, 800)}`));
      }
    });

    proc.on("error", err => {
      reject(new Error(`Failed to start Remotion render: ${err.message}`));
    });
  });
}
