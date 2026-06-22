// ─── Pexels stock footage downloader ─────────────────────────────────────────
// API docs: https://www.pexels.com/api/documentation/

import fs   from "fs";
import path from "path";
import { log, warn, info, C } from "./utils.mjs";

const PEXELS_API = "https://api.pexels.com/videos/search";

// Minimum resolution to accept — we want HD footage
const MIN_WIDTH  = 1280;
const MIN_HEIGHT = 720;

// ─── Fetch video results from Pexels for a search query ───────────────────────
async function searchPexels(query, perPage = 5) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const url = new URL(PEXELS_API);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "portrait"); // vertical for TikTok/Reels

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) {
    warn(`Pexels search failed for "${query}" — ${res.status}`);
    return null;
  }

  return res.json();
}

// ─── Pick best video file from Pexels video_files array ───────────────────────
function pickBestFile(videoFiles) {
  // Prefer HD portrait files
  const portrait = videoFiles.filter(
    f => f.width >= MIN_WIDTH || f.height >= MIN_HEIGHT
  );
  const pool = portrait.length > 0 ? portrait : videoFiles;

  // Sort by file size descending (proxy for quality)
  return pool.sort((a, b) => (b.file_type === "video/mp4" ? 1 : 0) - (a.file_type === "video/mp4" ? 1 : 0))[0];
}

// ─── Download a single video file ─────────────────────────────────────────────
async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

// ─── Download footage for a list of queries ───────────────────────────────────
// Returns array of { query, localPath, pexelsId, photographer } objects
export async function downloadFootage(queries, footageDir) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    warn("PEXELS_API_KEY not set — skipping footage download.");
    warn("Add it to my-video/.env to enable automatic footage downloads.");
    warn("Get your free key at: https://www.pexels.com/api/");
    return [];
  }

  fs.mkdirSync(footageDir, { recursive: true });

  const results = [];
  const seen = new Set(); // avoid downloading the same video twice

  for (const query of queries) {
    info(`Searching Pexels for "${query}"...`);

    let data;
    try {
      data = await searchPexels(query, 8);
    } catch (err) {
      warn(`Pexels search error for "${query}": ${err.message}`);
      continue;
    }

    if (!data?.videos?.length) {
      warn(`No Pexels results for "${query}"`);
      continue;
    }

    // Try videos until we find one we haven't downloaded yet
    let downloaded = false;
    for (const video of data.videos) {
      if (seen.has(video.id)) continue;

      const file = pickBestFile(video.video_files ?? []);
      if (!file?.link) continue;

      const ext      = file.file_type === "video/mp4" ? "mp4" : "mp4";
      const safeName = query.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `${safeName}-${video.id}.${ext}`;
      const destPath = path.join(footageDir, filename);

      // Skip if already downloaded (re-run safety)
      if (fs.existsSync(destPath)) {
        info(`Already downloaded: ${filename}`);
        seen.add(video.id);
        results.push({
          query,
          localPath: destPath,
          filename,
          pexelsId: video.id,
          photographer: video.user?.name ?? "Unknown",
          width: file.width,
          height: file.height,
        });
        downloaded = true;
        break;
      }

      try {
        log("↓", C.teal, `Downloading "${filename}" (${file.width}×${file.height})...`);
        const bytes = await downloadFile(file.link, destPath);
        const mb = (bytes / 1024 / 1024).toFixed(1);
        log("✓", C.green, `Saved ${filename} (${mb} MB) — © ${video.user?.name ?? "Pexels"}`);

        seen.add(video.id);
        results.push({
          query,
          localPath: destPath,
          filename,
          pexelsId: video.id,
          photographer: video.user?.name ?? "Unknown",
          width: file.width,
          height: file.height,
        });
        downloaded = true;
        break;
      } catch (err) {
        warn(`Failed to download video ${video.id}: ${err.message}`);
      }
    }

    if (!downloaded) {
      warn(`Could not download footage for "${query}"`);
    }
  }

  return results;
}

// ─── Write a footage credits file ─────────────────────────────────────────────
export function writeCredits(footageResults, creditsPath) {
  if (!footageResults.length) return;

  const lines = [
    "# Stock Footage Credits",
    "# All footage sourced from Pexels (pexels.com) — free for commercial use",
    "",
    ...footageResults.map(r =>
      `- ${r.filename}\n  Search: "${r.query}" | Pexels ID: ${r.pexelsId} | © ${r.photographer}`
    ),
    "",
    "Pexels License: https://www.pexels.com/license/",
  ];

  fs.writeFileSync(creditsPath, lines.join("\n"));
}
