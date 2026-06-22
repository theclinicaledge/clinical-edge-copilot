import fs   from "fs";
import path  from "path";
import { fileURLToPath } from "url";

// ─── Resolve __dirname in ESM ─���─────────────────────��─────────────────────────
export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");

// ─── Load .env from my-video root ────────────────────────────────────────────
export function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}

// ─── topic → kebab slug ───────────────────────────────────────���──────────────
export function toSlug(topic) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Ensure directory exists ───────────────────────────��──────────────────────
export function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ─── Terminal colours ─────────────────────────────────────────────────────────
export const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  teal:   "\x1b[36m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  white:  "\x1b[37m",
};

export function log(icon, color, msg) {
  console.log(`${color}${icon}  ${msg}${C.reset}`);
}

export function step(n, total, msg) {
  console.log(`\n${C.teal}${C.bold}[${n}/${total}]${C.reset} ${C.white}${msg}${C.reset}`);
}

export function success(msg) { log("✓", C.green, msg); }
export function warn(msg)    { log("⚠", C.yellow, msg); }
export function fail(msg)    { log("✗", C.red, msg); }
export function info(msg)    { log("→", C.dim, msg); }
