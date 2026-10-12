# Public educational Ask integration

Release baseline: 5416c8ea39e8e32fd7d52a145c9ebe22e5ea8b32 (PR 6 merged; PR 5 retained). Release preparation authorizes a branch/commit/PR only, not merge, production deployment, activation or provider calls.

## Implemented

The existing conversational modules are selectively imported. Current main's provider client is still metered by PR 6; the new endpoint uses the same admit/release hook, device header, IP backstop and daily budget. No second counting store. A source-free answer remains explicitly unverified; qualified review remains pending. Admission, generation and safety-review instructions are unchanged.

Production educational activation requires NODE_ENV=production, ASK_SAFETY_CONTAINMENT=true, and ASK_PUBLIC_BETA_ENABLED=true. Default OFF; no invitation mechanism. Frontend uses VITE_ASK_PUBLIC_BETA_ENABLED=true and VITE_API_BASE_URL=https://clinical-edge-copilot.onrender.com. Production frontend permits only this HTTPS API for beta. Server requires first-party HTTPS/origin and opaque consent v4. No Snapshot or client-supplied history/follow-up flag is accepted.

Supported ABG requests use the existing deterministic engine before counting/provider access. The beta does not offer its optional generative ABG explanation button; deterministic teaching is preserved. Other legacy tools/routes remain unchanged and contained.

Feedback is an email action containing only request ID and a concern-category prompt; it does not attach chat content, consent receipts or device IDs. Local UI preview: http://127.0.0.1:5192/ask. Its backend on 3032 intentionally has no provider credential; it is not a live-model demo.

## Approved counting policy

Founder approved counting every conversational turn, including follow-ups. A reset or client flag cannot exempt a submission. No existing legacy free-follow-up rule was changed and no second quota system was added. Consent responses expose the merged guard's configured device allowance; the UI explains sharing, Pacific-midnight reset and refund/network rules.

Server errors refund both counters. Safety refusals refund the device but retain the IP backstop, including conversational admission refusal (403); token usage is still metered. PR 6 counters are process-local and reset on restart; they are not a hard global monetary ceiling. Founder has confirmed prepaid Anthropic credits, auto-reload OFF, monthly $50 cap and alerts as the approved financial safeguards. Account configuration was not independently inspected; production must use that configured workspace/key. No database provisioned.

## Approved disclosure correction implemented

Founder approved the necessary correction. AIConsentGate and Privacy now disclose admission/generation/review, up-to-ten-minute volatile history, withdrawal/expiry/restart, general/fictional educational use and no individualized/emergency care. Global consent version is 3 so prior version-2 users are asked again. The separate server conversation consent remains v4. Vendor retention, Save Case, device-ID disclosure and optional analytics remain separate. Terms are unchanged. No clinical approval is claimed.

## Validation

Prior integration: backend 909/909 and default-OFF frontend 219 passed/2 skipped. Final correction: backend 915/915; focused consent/Terms/privacy/ABG/Snapshot/quota/containment UI 67/67; dedicated beta UI 3/3 at 390/768/1440; lint PASS; production build/prerender 9/9; diff check PASS. Every-turn/shared-hook refund and mocked provider 429/400/402 failures are covered, with no retries or later stages on failure. Logs are recorded in /private/tmp/ce-final-beta-*.txt. All mocked/deterministic; software results do not establish clinical accuracy. Admission/generation/reviewer instructions and all 127 parked files remain preserved.

## Release procedure (not executed)

1. Disclosures and per-turn counting are now founder-approved. Verify provider account settings and exact release diff; record live Vercel/Render deployment IDs and rollback SHA. Re-fetch main and stop on unexpected divergence.
2. With founder commit/push/deploy authorization, commit only this allowlisted package, push once. Deploy backend with ASK_PUBLIC_BETA_ENABLED=false and ASK_SAFETY_CONTAINMENT=true. Deploy compatible frontend initially with VITE_ASK_PUBLIC_BETA_ENABLED=false.
3. Verify exact revisions, health, secure CORS/device/authorization headers, independent tools and legacy restrictions with no provider calls. Keep production LOCAL_CONVERSATIONAL_PREVIEW unset/false. Preserve existing signing/hosting configuration.
4. Once approved, enable ASK_PUBLIC_BETA_ENABLED=true on Render (restart required when routes were registered OFF) and release frontend built with VITE_ASK_PUBLIC_BETA_ENABLED=true. Verify global consent v3 is renewed, server consent v4 works, no-invites UI, matched disclosures, kill switch and quota controls. Retain NODE_ENV=production and LOCAL_CONVERSATIONAL_PREVIEW unset/false. Frontend production API is exactly https://clinical-edge-copilot.onrender.com. A real model production smoke requires separate authorization.

## Emergency shutdown

An environment change alone does not instantly update an already-running process. For immediate educational-only stop, use Render's shell/process tooling to identify the running node server PID and send `kill -USR2 <PID>` to EACH active backend instance. The handler latches educational Ask disabled, deletes consent sessions and aborts pending work; it does not stop the whole backend or turn off legacy containment. Verify blocked beta requests and unchanged backend health. If process access is unavailable, suspend the backend as the last-resort stop (temporary backend-tool outage). Never restore unrestricted generation.

Operator access was verified read-only on 2026-10-12: Render clinical-edge-copilot-v2 is Live at 5416c8e; Web Shell for instance 5qjhd is connected. `ps -eo pid,comm` identified Node PID 55; `kill -0 55` returned signal_permission_ok. Signal zero does not interrupt the process. No SIGUSR2 was sent to production. Do not hardcode PID 55 for future deployments: select the current instance and identify its current Node PID. The educational SIGUSR2 handler is local candidate code, not yet deployed; only use it after verifying that release is live. If unavailable, Settings -> Suspend Service is the emergency alternative (stop all backend work), then deploy the beta-OFF configuration before resuming. Do not rely on rolling environment redeploy alone for immediate stop.

Then set ASK_PUBLIC_BETA_ENABLED=false, keep ASK_SAFETY_CONTAINMENT=true, restart/redeploy OFF, and publish frontend beta OFF as needed. Signal latch cannot be reset by HTTP. Recovery requires an explicitly authorized restart/activation. If rollback is needed, restore recorded known-good deployments or a history-preserving revert; maintain containment throughout.

## Remaining work

MUST VERIFY BEFORE PUBLIC ACTIVATION: deployed release identity, beta flags OFF during deployment, existing legacy containment ON, renewed consent, health/CORS and operator access on the deployed instances. Founder has confirmed the provider spending safeguards; this is not an independent account audit. Render operator/signal permission is verified; the candidate handler is tested locally, not executed in production. No custom spending database, new clinical evaluation or infrastructure is required by the founder's approved strategy.

CAN IMPROVE AFTER LAUNCH: feedback triage and non-content usage monitoring. No new feature roadmap.

## Release allowlist

- backend/server.js
- backend/ask-conversation.js
- backend/ask-education-coverage.js
- backend/ask-output-safety.js
- backend/tests/ask-conversation.test.js
- backend/tests/ask-educational-delivery.test.js
- backend/tests/ask-general-education.test.js
- backend/tests/ask-review-contract.test.js
- frontend/src/AskClinicalEdge.jsx
- frontend/src/Privacy.jsx
- frontend/src/components/AIConsentGate.jsx
- frontend/src/consent.js
- frontend/tests/ask-public-beta.spec.ts
- frontend/tests/consent.spec.ts
- frontend/tests/fixtures/consented-storage.json
- frontend/tests/smoke.spec.ts
- docs/ask-public-beta-integration.md

No environment files, evaluation captures, screenshots, generated reports, native changes, parked experiments or dependency changes are in the allowlist. The only clinical teaching content imported is the accepted conversational candidate's bounded optional evidence registry; no unrelated Priority Map/P2 candidate is included.

## Settings for deployment with beta disabled

Render: NODE_ENV=production; ASK_SAFETY_CONTAINMENT=true; ASK_PUBLIC_BETA_ENABLED=false; LOCAL_CONVERSATIONAL_PREVIEW unset/false. Preserve the existing ANTHROPIC_API_KEY, TRUST_PROXY_HOPS and daily guard settings. PR 6 defaults remain AI_DAILY_BUDGET_USD=5, FREE_DAILY_QUESTIONS=3, FREE_DAILY_QUESTIONS_PER_IP=50, AI_INPUT_USD_PER_MTOK=3, AI_OUTPUT_USD_PER_MTOK=15 unless the founder-approved existing values differ. Do not overwrite existing configuration merely to restate defaults.

Vercel production build: VITE_ASK_PUBLIC_BETA_ENABLED=false; VITE_LOCAL_CONVERSATIONAL_PREVIEW unset/false; VITE_API_BASE_URL=https://clinical-edge-copilot.onrender.com. No frontend provider credential. Preserve existing domains, production main branch, build configuration and analytics settings. Build-time flags require a new frontend build to change. Nothing in release preparation applies these settings automatically.
