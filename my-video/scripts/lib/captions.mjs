// ─── Caption formatter ────────────────────────────────────────────────────────

import fs from "fs";

// ─── Build caption.txt content ────────────────────────────────────────────────
export function buildCaptionFile(script, footageCredits = []) {
  const hashtags = (script.hashtags ?? []).join(" ");

  const sections = [
    banner("CLINICAL EDGE — VIDEO CAPTIONS"),
    field("Topic",   script.topic),
    field("Slug",    script.slug),
    field("Urgency", script.urgency),
    "",
    banner("TIKTOK CAPTION"),
    script.tiktokCaption,
    "",
    hashtags,
    "",
    banner("INSTAGRAM CAPTION"),
    script.instagramCaption,
    "",
    hashtags,
    "",
    banner("HASHTAGS (copy-paste)"),
    hashtags,
    "",
    banner("HOOK LINE (for caption hook)"),
    script.hookLine.replace(/\n/g, " "),
    "",
    banner("CLOSING LINE (for caption or caption thread)"),
    script.closingLine,
  ];

  if (footageCredits.length > 0) {
    sections.push("");
    sections.push(banner("STOCK FOOTAGE CREDITS"));
    sections.push("All footage from Pexels (pexels.com) — free for commercial use");
    for (const f of footageCredits) {
      sections.push(`  ${f.filename} — © ${f.photographer} (ID: ${f.pexelsId})`);
    }
    sections.push("License: https://www.pexels.com/license/");
  }

  return sections.join("\n");
}

export function writeCaptionFile(script, captionPath, footageCredits = []) {
  const content = buildCaptionFile(script, footageCredits);
  fs.writeFileSync(captionPath, content, "utf-8");
  return content;
}

function banner(text) {
  const line = "─".repeat(60);
  return `\n${line}\n  ${text}\n${line}`;
}

function field(label, value) {
  return `  ${label.padEnd(10)} ${value}`;
}
