CLINICAL EDGE · MED-SURG CLINICAL PRIVATE PILOT
October 18, 2026 · Content 0.1.0 · Mapping draft-1 · Schema 1

LOCAL PREVIEW
http://127.0.0.1:5190/learn/med-surg

Start from this checkout's frontend directory:
  npm ci
  VITE_SHIFT_ENABLED=true VITE_MED_SURG_TRACK_PREVIEW=true npm run dev -- --host 127.0.0.1 --port 5190 --strictPort

This is a localhost-only reviewer build. It is not a remote deployment or an
access-controlled hosting service. Keep the local feature flag out of public
release until reviewed. The flag defaults off. No deployment configuration,
environment file or App Store submission has been changed.

REVIEW MATERIAL
  review.html              Human-readable packet, including exact source appendix
  content-packet.json      Full cases, response combinations, snapshots and hashes
  educator-guide.txt       Short formative-use / record-interpretation guide
  validation.txt           Test results, limitations and physical-iPhone checklist

Open review.html directly, or serve this directory on localhost for convenient
browser reading. Packet generation from runtime content:
  cd frontend
  node scripts/export-med-surg-review.mjs

CHECKS
From frontend, with the preview running on 5190:
  npm run lint
  node --test tests/med-surg-track.test.mjs
  node --test tests/*.test.mjs
  ./node_modules/.bin/playwright test -c track-playwright.config.ts med-surg-track.spec.ts
  ./node_modules/.bin/playwright test -c track-playwright.config.ts
  VITE_SHIFT_ENABLED=true VITE_MED_SURG_TRACK_PREVIEW=true npm run build
From backend:
  npm test

Review validation.txt for known baseline suite failures; the full historical
suite is not entirely green. Build/test success is not clinical validation.

BRANCH AND PRESERVATION
Isolated branch feat/med-surg-track-pilot from remote main
aa5368bfe64c907c97773d0a93bc7fa335f71661. Current remote checked again on this
task; the old research snapshot was not used as the implementation baseline.
The primary checkout's unrelated local changes and the separate prior Replay
pilot were inspected and left intact. No commits, push, merge, production deploy,
App Store action or contact were performed.

CONTENT AND EVIDENCE LIMITS
New content, interpretations and response rules await founder and independent
clinical review. A1's existing teaching order means its mapped choices are
assisted. A2 coverage choices are limited proxies. Comparisons disclose missing,
assisted or different-format evidence. Earlier source approval is not approval
of these uses. All decisions and grading are deterministic authored content.

PRIVACY
Local key ce-med-surg-track-private is separate from standalone Shift and Replay.
No new account, database, AI call, third party or learning-data collection exists.
No analytics is emitted from the private track, including lifecycle events:
the requested examples are not currently in the existing allowlist, so the
pilot does not expand it. Existing consent/withdrawal controls remain intact.
Autocapture and session recording are absent. Export/clear are learner-controlled.
