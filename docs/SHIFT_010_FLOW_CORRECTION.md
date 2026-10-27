# Shift 10 deliberate gameplay flow correction

Release candidate on fix/shift10-deliberate-flow, based on production revision 399c3ee401548ad2220a841c7bca6632c1a798a4. The founder reports all 18 updated release browser tests passed on his Mac and explicitly authorizes the targeted PR, merge and deployment. Final identifiers are recorded in the release handoff.

## Root cause and interaction audit

Confirmed functional display bug: the previous progress indicator selected Assuming care whenever a provider call existed or had occurred. Calling Dr. Lin during assessment therefore appeared to advance the major phase even though the clinical phase remained bedside. The new indicator follows only deliberate saved navigation.

No Orders/Rooms/Chart, clarification, assessment, flag, nursing or team-contact action was found to advance the underlying clinical phase. That distinction is now tested. The previous apparent jumps also came from explicit scrollIntoView calls that moved the main page to records, question areas, answers, assessment panels and team controls. Those page jumps are removed.

Design problems: both broad clinical phases contained several long cards and duplicate navigation; receiving-room preparation was shown under a still-active report, while End report & receive Ruth combined two major moments. Assessment required selecting an area and then a second, often similarly named action. Investigation, nursing work and completion controls were scattered throughout the same page.

## Corrected progression

1. ED report: six authored segments. Only Continue ED report advances a segment. Ask Dana, records and team contacts leave the segment and moment unchanged.
2. Preparation: explicit Finish report / Prepare for arrival enters this scene after segment six. Optional investigations remain available. Only Receive Ruth triggers the original authored arrival transition and freezes the room path.
3. Receiving assessment: all eight authored assessment actions are available directly in flexible order. Findings open under the selected action without focusing/scrolling another page section. Nursing responsibilities are a separate optional panel. Calling a provider does not change the step. Finish receiving assessment deliberately opens assuming care; no assessment checklist is required.
4. Assuming care: provider call/callback, actual-information charting and review are visible together. Returning to assessment is an explicit back action. Provider requests remain visible in the current moment. Review your shift invokes the unchanged closing prompts; only the existing explicit final-close action enters debrief. Learners can proceed with unknowns or unresolved concerns.
5. Review: existing personalized feedback, evidence, original/prompted attribution, event history and Replay preserved.

The five-step indicator is informational, not another navigation menu. One scene and one progression footer replace the former main-page navigation stacks. A single optional-work toolbar opens the existing native dialog for records/rooms, Dana, unit team or nursing actions. Its Close panel header remains accessible while scrolling. One modal is reused, including phone interactions; no new rendering or package dependency.

## Focus, scrolling and persistence

- Opening/closing optional work does not call scrollIntoView or focus a main-page section. Native dialog content receives focus; closing restores the original control with preventScroll. Resumed calls without an original opener return focus to the scene heading.
- Only an explicit major-moment change focuses the new scene heading. Provider-question changes focus/scroll inside the modal only. Individual record tabs, answers, assessments and nursing actions do not change main-page focus.
- Navigation is stored as an optional navigation field alongside the unchanged clinical event envelope at the same existing attempt key. The clinical engine ignores this extra field. Navigation never creates clinical events, discovery credit, prompts, flags or completed actions.
- Legacy saves are replayed by the original engine and assigned a compatible view, without inserting earlier preparation/assessment actions. Active calls restore; new saves retain the exact deliberate moment. Optional panels close on refresh while clinical discoveries remain saved.
- Existing original/prompted labeling, callbacks, named owners, future plans versus completed actions and incidental room outcomes remain controlled by the untouched clinical engine.

## Clinical integrity

Unchanged SHA-256:
- content.js: 0ae53d808bb0bb89c1f8c34b84f8fdaa334bd5d8119fc4cc2a89d5cdf2b377ee
- state.js: d290970b56daed6b244c25eb5753aac1105e7b95ffb3792fae874f50f0d024d7

No findings, dialogue answers, orders, policies, medication content, room consequences, provider response logic or educational conclusions were rewritten. SVG artwork is unchanged; area-selection controls around it were replaced by direct assessment actions. Prior clinical approval remains founder-reported and no new evidence verification/signature is claimed. No source-level clinical contradiction was identified.

## Verification

- Shift 10 clinical and navigation state tests: 28 passed (19 original, 9 new). All A–D paths; investigation invariance; explicit boundaries; callbacks; unresolved optional work; exact save/replay; active and legacy sessions.
- All frontend Node tests: 170 passed, 0 failed, one existing skip.
- Backend tests: 934 passed, 0 failed.
- Full frontend ESLint passed; final affected-code lint passed after focus refinements.
- Rendered-content checks passed: correct scene headings, preparation/arrival boundary, hidden records, four room paths, unknown call and unchanged debrief detail.
- Standalone preview and production-enabled build passed, including sitemap generation and 9/9 prerenders.
- Whitespace check passed.
- Browser suite: founder reports all 18 updated release cases passed locally on his Mac. Work did not execute Chromium. Reuses the existing release suite with new direct-assessment/modal navigation, active-call refresh, explicit preparation, saved communication, keyboard focus and 375/390 px scroll-restoration cases. Existing four-path, callbacks, records, debrief, Replay, desktop/mobile screenshots and app-shell regressions remain covered by the prepared suite.

Work still has no exposed browser/computer-use tool and its known Chromium launch is blocked by macOS MachPort error 1100. No repeated launch or sandbox troubleshooting was attempted. The founder’s new 18-test pass applies to this correction. The local .last-run.json visible to Work still has the older run timestamp, so this report records the new browser result as founder-reported rather than claiming an independently captured fresh log. Every source/preview file matches the frozen correction snapshot, and all 32 production assets were reproduced byte-for-byte from the final source against the current dist. Physical iPhone/VoiceOver testing of the correction remains unperformed by this agent.

## Exact files changed

- frontend/src/modules/the-shift/shift10/Shift10.jsx
- frontend/src/modules/the-shift/shift10/shift10.css
- frontend/src/modules/the-shift/shift10/flow.js (new navigation adapter)
- frontend/tests/shift10-flow.test.mjs (new focused state tests)
- frontend/tests/shift10-private.spec.ts
- frontend/tests/shift10-release.spec.ts
- frontend/scripts/shift10-render-entry.jsx
- frontend/scripts/verify-shift10-render.mjs
- private-preview/shift10.html (same standalone preview regenerated)
- docs/SHIFT_010_FLOW_CORRECTION.md (this report)

No other Shift or shared production source was modified. Logs and candidate checksums are in verification/flow-*. Source/preview snapshot: verification/flow-candidate.json.

## Authorized release and rollback

The founder’s 18/18 local browser verification resolves the correction browser gate. Fresh release checks repeated: 170 frontend passes with one existing skip, 934 backend passes, full frontend lint and production-enabled build/sitemap/9 prerenders passed. No application source changed after candidate correspondence was verified. Candidate hashes and asset reproduction are recorded in SHIFT_010_FLOW_TESTED_CANDIDATE.json.

Use the established PR, remote checks, merge and automatic Vercel Git deployment process. Preserve all production flags and existing settings. Post-deployment verification must distinguish HTTP and exact deployed-asset/engine checks from a live interactive browser replay, which remains unavailable in Work.

Frozen successful pre-correction rollback reference, verified from GitHub deployment/status records:
- Git revision: 399c3ee401548ad2220a841c7bca6632c1a798a4
- Vercel deployment: APdzkY7v6z7XgWMWFcHxqSx9oTXY
- GitHub Production deployment: 7371766426
- Artifact: https://clinical-edge-copilot-a8m7k08nd-theclinicaledges-projects.vercel.app

If the correction fails post-deploy checks, restore/promote that known-good artifact and revert the correction PR through a separate reviewed change. Do not reset shared history or clear saved attempts. The extra navigation field is ignored by the original clinical event reader, preserving rollback compatibility.
