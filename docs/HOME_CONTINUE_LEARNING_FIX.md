# Home Continue Learning and Shift Library correction

## Release candidate status

The founder's final local run of `npx playwright test --config home-continue-playwright.config.ts` passed all 17 tests in 44.6 seconds. The on-disk `verification/home-continue-browser/.last-run.json` records `passed` with an empty failed-test list. This supersedes the pending local rerun below. Product source and built assets remain identical to the original candidate fingerprints; only the corrected browser test and this report differ from that handoff.

Work browser inspection separately exercised the exact built entry `index-qhBQP1di.js`, responsive library geometry at 375/390/768/1440px, all nine scenario entries, Show more focus, Home with zero/one/two unfinished saves, View all filtering, saved resumption across reload and the empty debrief view. This inspection is distinct from the founder's automated 17-test run. Physical iPhone and VoiceOver testing remain unperformed.

Publication is blocked in this session: shell GitHub access fails DNS resolution, and the available GitHub browser session is signed out. The public repository page reports current main `41fe8da3392c0fa72d8eae2983fe070073b92de5` (PR #52), newer than this candidate's tested base `be50a6477362772a4ed67538e6748c3872c2217e`. No merge compatibility or deployment parity with that newer main is claimed. A release must fetch and compare current main, resolve any integration issues and verify the resulting candidate before merging. No PR, merge or production deployment has occurred for this change. The baseline deployment below is historical, not a freshly verified current rollback target.

## Release-test failure investigation (latest)

The founder ran the 17-test suite locally: 7 passed, 10 failed. The generated error contexts and trace.zip files under `verification/home-continue-browser/` were inspected. The corrections below are test-only; production components, styles, scenario content, artwork, destinations and saved-record handling are unchanged.

- Nine focus failures: each trace records a pointer click on Home followed by programmatic `featured.focus()`, then an immediate computed-outline read. Programmatic focus after pointer input does not establish keyboard modality for `:focus-visible`. Existing Home styles define a 2px solid teal keyboard outline. The test now focuses View all as an anchor, presses Shift+Tab to reach the adjacent featured Resume link with an actual keyboard action, asserts that Resume is focused, and retains the solid-outline check with additional 2px-width and nontransparent-color assertions. No focus CSS was relaxed or removed. Actual rendering of the corrected keyboard sequence remains subject to the final local browser run.
- One View all failure: the error context shows `Opening The Shift...`; its trace reads `.shift-library-card .shift-primary` immediately after the click. `evaluateAll` returns an empty array without waiting for the lazy-loaded library. The same selector already returns the expected saved links in the nine parameterized cases before their later focus failures. The test now waits for the saved-view URL, the Unfinished selector value and exactly six Resume links before asserting the unchanged ordered list of all six destinations. This fixes test synchronization, not a missing-save or selector bug.

Checks after correction: 10/10 focused state/render tests passed; frontend lint passed; Shift-enabled production build passed with 9/9 prerenders; suite discovery listed all 17 tests. Vite emitted sandbox WebSocket-listen warnings during SSR tests/prerendering, but both commands exited successfully. Browser access to the previously supplied local preview returned connection refused. No server or Chromium launch was retried, and no corrected browser-test pass is claimed. Previous traces are preserved.

Final local verification (the config starts its own Vite server; port 5211 must be free):

```bash
cd "/Users/mohamed/.codex/.chatgpt-projects/g-p-69bc2820e5a881918b0d69f64d74e292/outputs/clinical-edge-shift10-private/repository/frontend"
npx playwright test --config home-continue-playwright.config.ts
```

No PR, merge or deployment is authorized until the required tests pass. The source/document fingerprint in `verification/home-tested-candidate.json` predates these test/report corrections; the product source and build fingerprints remain unchanged.

## Original implementation handoff (historical; latest gate above)

- Branch: `fix/home-continue-learning`.
- Base/current production revision: `be50a6477362772a4ed67538e6748c3872c2217e` (PR #50).
- Current production deployment and future rollback baseline: `JA5QJZpCBqKEaHBmDwafnc3T1sPk`.
- This candidate is local and uncommitted. No new PR, merge or deployment performed.
- Browser interaction/layout verification is the outstanding release gate. Work exposes no connected browser/computer-use tool. The previously established Chromium MachPort permission failure was not retried.
- Live `https://theclinicaledge.org/learn/shifts` returned HTTP 200 and entry `/assets/index-_z2Ip8_5.js`, matching the known current production release. HTTP is not visual verification.
- Final local source/build fingerprints: `verification/home-tested-candidate.json`.

## Findings and changes

### Home

The previous Continue Learning component mapped every `Continue: ...` registry label into a full-size card. There was no count limit or activity sort. ClinicalEdgeHome has no other unbounded saved-attempt list; its remaining sections are static learning and reference links.

Home now shows one prominent Resume card and a View all link with the unfinished count. View all opens `/learn/shifts?saved=1`, using the existing illustrated library rather than a second home progress list. Home remains constant in size with dozens of saved experiences.

The first version considered a bounded disclosure. After the coordinated library review, that approach was replaced before release with direct access to the library. There is only one final implementation.

### Honest activity and completion

Existing scenario readers and progressLabel remain authoritative. Only Shift 7's main save has a reliable wall-clock activity field, `updated`, written on interactions. Other main Shift formats have stages, event order or fictional times but no comparable activity date. Separate Rewind activity dates are not treated as main-attempt dates.

Valid activity dates sort first, newest first. Undated saves retain deterministic registry/library order. Invalid, nonnumeric, nonpositive and future dates are undated. The unfinished library view explains this limitation. The featured card never claims to know recency among undated saves.

There are no save writes, migrations, new timestamps or percentage calculations. Existing unfinished/debrief classification is preserved. Completed/debrief-reached attempts are available through the library's Debriefs view, with Review debrief rather than Resume. An existing library display bug mapped every non-new/non-debrief label to In progress, including Saved progress unavailable. Unavailable records now retain that honest label and use Open shift; they are excluded from the unfinished view. Their data and recovery behavior are unchanged.

### Library navigation

- Show control selects All shifts, Unfinished or Debriefs within the existing route. Query parameters support direct entry and browser history; no new route/dashboard.
- Existing setting filters, six-card pagination and scenario destinations remain.
- Unfinished view uses the same activity ordering as Home. No duplicate top Resume banner in that view.
- Empty saved/debrief views explain how to return to All shifts.
- Existing Show more inserted new cards before the focused button, allowing keyboard users to tab past them. It now focuses the first newly revealed card title after the explicit Show more action.
- Touch-sized native selector uses 16px text and a 44px minimum height.
- Card title, artwork pointer entry and primary action still go to the same existing scenario route. Existing scenario/library return links are unchanged.

### Illustrations and layout

The current source uses a shared fixed-height image frame and object-fit: cover. The portrait-proportioned Discharge Puzzle (560x420) and Shift 10 door (420x300) therefore lose bottom content in wide card frames. At a 356x164 mobile frame, the Discharge image scales to approximately 356x267; the source's 20% vertical positioning cuts off much of the lower bottles. The Shift 10 image similarly loses its door base. This is source geometry, not a new browser observation.

An archived desktop screenshot from an earlier six-Shift build visibly confirms clipped discharge bottles and the Shift badge covering the Home list artwork label. It does not verify the latest nine-card library. Archived references inspected:

- `outputs/clinical-edge-med-surg-track-pilot/repository/artifacts/library-visuals/1440-library.png`
- `outputs/clinical-edge-med-surg-track-pilot/repository/artifacts/library-visuals/390-library.png`

Changes are scoped:

- Contain and center only Discharge Puzzle and Shift 10 images inside the existing frame, retaining the full image bounds and original artwork.
- Move Shift number badges from the image overlay to a wrapping metadata row beside the existing status. Illustrations no longer compete with the badge for the same pixels.
- Allow long title/description/status text to wrap within cards without horizontal overflow.
- Preserve all SVG/image files, individual artwork identities, waveform data and aspect ratio, frame heights, grid breakpoints, card colors, clinical premises, gameplay and primary actions.

Intentionally unchanged: the other card compositions, including the existing shared assignment artwork used by Code Blue; illustration detail/text inside the SVGs; card artwork identities; scenario-level navigation. Current nine-card visual balance, typography under actual font loading, iPhone WebView behavior and VoiceOver still need rendered verification. No speculative artwork redesign was made.

## Checks executed

- Frontend: **180 passed, 1 existing skip, 0 failed**.
- Includes **10 focused data/render tests** for 0/1/6/25 saves, one prominent card, View all destination, actual saved-record formats, deterministic date fallback, completion/status exclusion, six actual saved Shift formats, read-only compatibility, existing Shift 10 navigation, library status filters, illustrations/destinations and empty/unavailable states.
- Backend regression suite: **934 passed, 0 failed**. Backend source unchanged.
- Full frontend lint passed.
- `VITE_SHIFT_ENABLED=true npm run build` passed, including sitemap generation and **9/9 prerenders**. Existing large-chunk advisory remains.
- `git diff --check` passed.
- Only library presentation/integration files changed under the scenario module: `ShiftExperience.jsx` and `app.css`. No scenario component, engine, metadata, content, progress reader, save writer or artwork changed.
- Combined Playwright suite parsed/listed: **17 tests**. **Not run in a browser here.**
- No new screenshots or physical iPhone/VoiceOver verification claimed.

## Required local browser check

```bash
cd "/Users/mohamed/.codex/.chatgpt-projects/g-p-69bc2820e5a881918b0d69f64d74e292/outputs/clinical-edge-shift10-private/repository/frontend"
npx playwright test --config home-continue-playwright.config.ts
```

The config starts its own Shift-enabled Vite server at `http://127.0.0.1:5211`. No manual server or production setting change is needed. It covers:

- Home with no/invalid/completed saves and 1/6/25 unfinished saves.
- 375/390px mobile and desktop compactness, View all, every saved destination, storage preservation, reload and Home return.
- All nine real library cards at 375, 390, 768 and 1440px, including image loading, moved badges, image fit, text/action separation, button alignment and touch sizes, monitor waveform geometry, horizontal overflow and individual card screenshots.
- Entry and library return for every scenario, Show more focus, keyboard Resume, enlarged mobile text and dock clearance.

The 25-save case uses synthetic entries only in its isolated test page; it creates no production content or saved records. Browser screenshots will be written to `verification/home-continue-*.png` and `verification/library-review/`, and browser output to `verification/home-continue-browser/`. No after screenshots exist yet in Work.

Once the browser suite passes against the unchanged fingerprinted candidate, continue one focused PR and the established Vercel Git release process. Preserve the current production revision/deployment as rollback. No new PR's protected-branch review gate has been inspected or bypassed.

## Exact source/document files changed or created

1. `frontend/src/components/ContinueLearning.jsx`: one featured Resume card plus shared-library View all link.
2. `frontend/src/components/continueLearning.js`: new read-only activity projection and status classification.
3. `frontend/src/styles/workspace-navigation.css`: scoped View all/focus styles.
4. `frontend/src/modules/the-shift/ShiftExperience.jsx`: saved/debrief filtering, consistent resume ordering, honest unavailable status, badge placement and pagination focus.
5. `frontend/src/modules/the-shift/app.css`: two targeted image-fit rules, wrapping metadata and copy, native filter presentation.
6. `frontend/tests/continue-learning.test.mjs`: new projection and saved-record compatibility tests.
7. `frontend/tests/continue-learning-render.test.mjs`: new home and library rendered-markup tests.
8. `frontend/tests/home-continue.spec.ts`: current home, saved-library and scaling browser tests.
9. `frontend/tests/shift-library-visuals.spec.ts`: updates stale six-card expectations and covers all current cards and widths.
10. `frontend/home-continue-playwright.config.ts`: combined focused browser suite.
11. `docs/HOME_CONTINUE_LEARNING_FIX.md`: this report and release gate.

Generated local artifacts: `verification/home-tested-candidate.json`, `verification/home-frontend-tests.log`, `verification/home-backend-tests.log`, `verification/home-lint.log`, `verification/home-build.log`, `verification/home-browser-test-list.log`. Standard build output regenerated, not hand-edited or staged.
