/**
 * Clinical Edge Copilot — mobile screenshot capture for Remotion video.
 * Port 5178 = Clinical Edge Copilot (clinical-edge-copilot-fixed/frontend)
 *
 * Captures at iPhone 14 Pro dimensions:
 *   viewport: 390×844, deviceScaleFactor: 3, isMobile: true
 *   → saves as 1170×2532 PNG (3x physical pixels)
 *
 * Also keeps the wide 1080px versions for other scenes.
 */

import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, "../public/screenshots");
const BASE = "http://localhost:5178";

// iPhone 14 Pro Safari user agent
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
  "Version/17.0 Mobile/15E148 Safari/604.1";

async function shot(page, name, clip) {
  const opts = { path: `${OUT}/${name}`, type: "png" };
  if (clip) opts.clip = clip;
  await page.screenshot(opts);
  const { width, height } = page.viewportSize() ?? {};
  console.log(`✓ ${name}  (viewport ${width}×${height})`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // ── MOBILE 390×844 @ 3x — for the phone-frame insert ──────────────────
  {
    const ctx = await browser.newContext({
      viewport:          { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile:          true,
      hasTouch:          true,
      userAgent:         IPHONE_UA,
    });

    // M1: Empty Copilot input
    {
      const p = await ctx.newPage();
      await p.goto(`${BASE}/copilot`, { waitUntil: "networkidle" });
      await p.waitForTimeout(700);
      await shot(p, "mobile-copilot-empty.png");
      await p.close();
    }

    // M2: Full response page (pre-baked, no API call)
    {
      const p = await ctx.newPage();
      await p.goto(`${BASE}/copilot?screenshot=response`, { waitUntil: "networkidle" });
      await p.waitForSelector("text=What this could be", { timeout: 6000 }).catch(() => {});
      await p.waitForTimeout(800);
      await shot(p, "mobile-copilot-response.png");
      await p.close();
    }

    // M3: Response — cards area only (skip hero/input, start from first card)
    //     On 390px mobile, first card starts around y=430.
    //     We want to show the output cards at a larger crop.
    {
      const p = await ctx.newPage();
      await p.goto(`${BASE}/copilot?screenshot=response`, { waitUntil: "networkidle" });
      await p.waitForSelector("text=What this could be", { timeout: 6000 }).catch(() => {});
      await p.waitForTimeout(800);
      // Clip: show from top of first output card to bottom of page
      await shot(p, "mobile-copilot-cards.png", { x: 0, y: 390, width: 390, height: 454 });
      await p.close();
    }

    await ctx.close();
  }

  // ── WIDE 1080px — kept for background/hook scene use ──────────────────
  {
    // Wide empty — used for background layers
    const p = await browser.newPage();
    await p.setViewportSize({ width: 1080, height: 1920 });
    await p.goto(`${BASE}/copilot`, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await shot(p, "wide-copilot-empty.png");

    await p.goto(`${BASE}/copilot?screenshot=response`, { waitUntil: "networkidle" });
    await p.waitForSelector("text=What this could be", { timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(800);
    await shot(p, "wide-copilot-response.png");
    await p.close();
  }

  await browser.close();
  console.log("\nDone — screenshots in public/screenshots/");
  console.log("Mobile screenshots (1170×2532 @ 3x):");
  console.log("  mobile-copilot-empty.png");
  console.log("  mobile-copilot-response.png");
  console.log("  mobile-copilot-cards.png");
}

main().catch(e => { console.error(e); process.exit(1); });
