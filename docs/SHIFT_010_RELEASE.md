# Shift 10 v0.2 release candidate

## State

Local release branch: release/shift10-transfer-v02.
Integration baseline: 3b321919e492b1902a9c679784b3783a71b80633 (GitHub main fetched October 27, 2026).
Release authorized by founder after local production-enabled build and 15/15 browser checks. Original local checkout unchanged. Commit/PR/deployment identifiers are recorded in the final release handoff.

## Tested candidate correspondence

The approved standalone candidate SHA-256 remains 32d492f5748f33b85dc76a42e3a46a1fe07d1370eba613b33c83134b226a97df.
After integration, the founder ran the production-enabled build and release-specific Playwright suite on his Mac: 15 passed, 0 failed, 49.0 seconds. The local release suite .last-run.json is passed with no failed tests, dated October 27, 2026 at 15:10:46 Pacific. Counts and duration are founder-reported; the local file independently records status.
A write-free production-enabled build from the current source exactly reproduced all 32 generated assets from that tested dist directory, including the Shift 10 renderer, shared app shell and styles. No application source changed after this check.
The 15 browser cases cover all four room paths, report interruption, unknown answers, callback, workspace navigation, keyboard focus, saved progress, debrief, library integration and the existing eight public routes at desktop/mobile layouts.

## Integration

Public route candidate: /learn/shifts/transfer-not-ready.
Library entry is numbered 10 and appears through the existing Show more/filter navigation.
Existing room paths, gameplay and save key/event format are unchanged. The existing eight public scenarios remain registered in their original order. Existing draft gates are unchanged.
Shift 10 disables scenario analytics through the existing metadata convention; no new analytics collection or network service.
Public rendering replaces preview-only labels with Fictional case, public release review wording and v0.2. Private rendering defaults are retained. No clinical response, conclusion or decision was changed. Existing door SVG reused for the library cover.

Protected hashes remain unchanged:
- content.js: 0ae53d808bb0bb89c1f8c34b84f8fdaa334bd5d8119fc4cc2a89d5cdf2b377ee
- state.js: d290970b56daed6b244c25eb5753aac1105e7b95ffb3792fae874f50f0d024d7

Approval is founder-reported following independent clinical review of v0.2. No signed reviewer record or blanket evidence verification is claimed. Existing evidence limitations, fictional Mercy Point policies and previously recorded implementation interpretations remain unchanged.

## Available checks

- Frontend Node tests: 161 passed, 0 failed, 1 existing skip. Includes 19 Shift 10 state tests and 3 new integration checks for routing, preserved registration, progress labels, storage attribution and analytics boundaries.
- Full frontend ESLint: passed.
- Production-enabled VITE_SHIFT_ENABLED=true npm run build: passed on the founder’s Mac, including sitemap generation and 9/9 prerendered routes. All 32 generated assets reproduced exactly from current source. The existing large-chunk warning is non-blocking.
- Backend npm test: 934 passed, 0 failed, 0 skipped.
- Diff whitespace check: passed.
- Existing route-list regression assertion updated to include the newly authorized public route; no assertion removed.
- Private checkout dependency packages still point to the original installed versions. Cache directories now live inside this checkout so normal build temporary writes do not target the original repository. No package or lockfile changes.

## Browser gate and limitations

The initial Work browser launch was blocked before page load by macOS MachPort permission error 1100. The founder’s subsequent local release-specific 15/15 pass resolves the local browser gate for this exact source. No failed gameplay assertion was suppressed or skipped.
The release tests disable analytics and block external requests during synthetic gameplay. No AI requests are submitted. Physical-device/VoiceOver testing has not been performed. Post-deployment HTTP and asset-parity checks are distinct from a live browser replay; report their scope accurately.

## Release and rollback

Use the existing GitHub PR, remote check, merge and automatic Vercel Git-deployment workflow. Do not modify production environment variables, build configuration, authentication, analytics, other Shifts or existing saved attempts. No new release authorization is needed; the founder explicitly authorized commit, PR, merge and deployment after the required checks pass.

Frozen pre-release rollback target, verified from successful GitHub deployment/status records:
- Git revision: 3b321919e492b1902a9c679784b3783a71b80633
- Vercel deployment: EPsV7H6XxX7Duv3d3fssMcV5PiPN
- GitHub production deployment: 7346442596 (success)
- Artifact URL: https://clinical-edge-copilot-lphkcard0-theclinicaledges-projects.vercel.app
- Production alias: https://theclinicaledge.org

If the approved release fails post-deployment verification, restore/promote that known-good artifact through the established Vercel process, then revert the Shift 10 integration through a separate PR. Do not reset shared history or clear saved attempts. Existing previews/older app caches may persist until reload.
