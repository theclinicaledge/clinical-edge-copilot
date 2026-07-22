# Clinical Edge — Brain Sheet Library Spec

Feature spec for the Brain Sheet Library module. Written to be executed one task
block at a time by an implementing model **without further judgment calls** — where a
choice existed, it has been made here.

Ratified product decisions (signed off 2026-07-21; preserved through revision):
1. **Template set: the 7 templates in §3.**
2. **Placement: new top-level module at `/brain-sheets`** (not a Reference Hub section).
3. **Print branding: discreet one-line footer** (wordmark + URL, caption type, grayscale-safe).
4. **`template_downloaded` is reserved for the Download PDF action only** (revised — semantics in §8; not the Print / Save PDF button).
5. **Print-stylesheet output remains universal; approved templates may additionally ship a generated static PDF** (revised — see §5, §7).
6. **No in-app patient-data entry, storage, transmission, or backend involvement.**

Implementation decisions ratified in the 2026-07-21 spec review (workers do not revisit):
- A. Code-status label is **`CODE STATUS`** — one blank field, no printed option list (§3.0.3).
- B. `night-shift` is a **4-patient** overnight organization sheet (§3.6).
- C. Handoff regions are **template-specific** per the §3.0.2 matrix, not one universal strip.
- D. `SheetFrame` owns no patient-identity element; identity areas belong to each sheet (§3.0.1).

`design-system.md` governs every visual decision in this module; this spec only adds
the print layer and the module's content. Where the two could conflict, design-system.md wins.

---

## 1. What this is (and is not)

A **premium template library of nurse brain sheets** — the shift-organization sheets
every bedside nurse rebuilds by hand or hunts down as free printable PDFs. Nurses
browse the library, preview a template, and print it (or save it as a PDF from the
print dialog). They fill it out **on paper**, exactly as they do today.

**This is a document generator, never a data store.** The constitutional privacy rule:

> **No patient-specific information is ever entered, stored, transmitted, or rendered
> in the app. The app renders blank labels and documentation fields only.**

Precisely what that means:

- The Clinical Edge module and every template it initially produces are **blank**.
  All fill areas are blank rules or empty checkboxes; nothing is pre-filled and no
  patient example — fictional or real — appears anywhere in the module.
- **A blank template contains no patient-specific information.**
- Once someone writes on the printed sheet, or edits a saved PDF outside Clinical
  Edge, that **external copy may contain PHI and must be handled under facility
  policy**. Clinical Edge does not receive, process, inspect, or store that
  information.
- The module contains **no `<input>`, `<textarea>`, `<select>`, or contenteditable
  element** of any kind. There is nothing to type into. The only interactive
  controls are navigation, Download PDF (templates with a generated PDF only —
  §5), Print / Save PDF, and Copy Link.
- **No dosing content anywhere on any template** (consistent with the app-wide
  dosing-free guardrail, design-system.md §7.2). Drip areas provide *space for*
  drip names and titration check columns — the template never prints a drug name,
  dose, rate, range, concentration, or administration time.
- **No `localStorage` or `sessionStorage`** use in this module in v1 (no recents,
  no favorites — see §9). No network calls of any kind from this module.

Printed-field label rules (constitutional for every template):
- Patient identity comes from the facility's own label: templates provide a
  **`PT LABEL / STICKER`** box or a **`PT LABEL`** blank area (§3.0.1). We never
  print prompts for `Name`, `MRN`, or `DOB` as separate fields.
- `ROOM / BED` blanks are **operational locators, not patient identification** —
  every panel that has a `ROOM / BED` blank also has a `PT LABEL` area, so the
  sheet never implies a room number alone identifies a patient.
- Every sheet's footer prints: **"Once filled in, this sheet contains PHI — discard
  per facility policy."** This sentence is verbatim and appears on all 7 templates.

---

## 2. Placement & information architecture

**New top-level module** — `frontend/src/modules/brain-sheets/` — with a card in the
home-hub module registry. Rationale (ratified): Reference Hub is lookup content;
this is a document-artifact library with a browse → preview → print interaction
model, and shareability requires each template to have its own clean deep-linkable
URL with its own SEO entry.

**Repository assumptions are conditional.** File and structure names used in this
spec — `main.jsx` routing, `ClinicalEdgeHome.jsx` `MODULES` / `MODULE_OPEN_EVENTS`,
`analytics.ts` `trackEvent`, `routeSeo.js` — are **expected locations, verified by
B0 (§10) before any implementation**. Implementation follows whatever structure B0
actually finds; workers never restructure routing, analytics, SEO, or unrelated
registries to match this spec's naming.

### 2.1 Routes

| Route | Page |
|---|---|
| `/brain-sheets` | Library index: intro + 7 template cards |
| `/brain-sheets/:templateId` | Template page: pearls rail + full-sheet preview + Print + Copy Link |

Routing follows the existing pattern found in B0 (expected: `getPage()` string
switch in `main.jsx`; detail route parses the id from `pathname` the way
`/blog/:slug` does). Unknown `:templateId` renders the library index.

### 2.2 Module accent

**Teal** (`--ce-teal` / `--ce-teal-deep`) — the default brand accent. Pearls use
**gold** eyebrows per design-system.md §1.2 (gold = pearls/practice). No new colors,
no category accents. One accent per region per the one-accent rule.

### 2.3 File layout

```
frontend/src/modules/brain-sheets/
  BrainSheetsModule.jsx      // index + detail pages, routing off templateId prop
  brain-sheets.css           // screen styles (dark navy chrome, standard module recipe)
  brain-sheets-print.css     // the print layer (§5) — the ONLY file with @media print
  data/templates.jsx         // TEMPLATES registry: metadata + pearls + sheet component per id
  sheets/                    // one file per template, e.g. MedSurg4.jsx, IcuSystems.jsx …
  components/SheetFrame.jsx  // shared frame per §3.0.1: title, DATE/SHIFT, content,
                             // configured handoff region, footer
```

### 2.4 Template IDs (fixed — these are the analytics IDs, never rename)

`medsurg-4pt` · `medsurg-6pt` · `icu-systems` · `telemetry` · `ed-rapid` ·
`night-shift` · `new-grad`

---

## 3. The v1 template set (7 templates)

### 3.0 Shared conventions (implemented once, consumed by every sheet)

#### 3.0.1 SheetFrame ownership vs. sheet ownership

`SheetFrame` owns **only**:
- Page title (Inter 700),
- `DATE` and `SHIFT` blanks,
- the main children/content area,
- the **configured handoff region** (§3.0.2 — passed as an explicit variant
  selection or a rendered handoff child; SheetFrame never renders a default),
- the shared branded privacy footer (§5.3).

`SheetFrame` does **NOT** place any patient-identity element. **Each sheet owns its
patient or encounter identity areas:**

- **Single-patient sheets** (`icu-systems`, `new-grad`): one `PT LABEL / STICKER`
  box placed top-right as the first element of the sheet's content area, alongside
  the sheet's identity strip (per-template composition below).
- **Multi-patient / multi-encounter sheets**: a compact blank identity area inside
  **every** patient or encounter panel. Never separate printed prompts for name,
  MRN, or DOB. Use a `PT LABEL / STICKER` box where physical space permits; where
  a sticker-sized box cannot fit, use neutral operational blanks (`ROOM / BED`)
  **plus** a `PT LABEL` blank area (a ruled blank, not a box). Room number alone is
  never implied to be sufficient identification (§1). The exact identity
  composition for each template is specified in §3.1–§3.7 — workers do not choose.

#### 3.0.2 Handoff region matrix (template-specific — no universal SBAR strip)

Where a four-part block appears, labels and ordering are exactly `SITUATION ·
BACKGROUND · ASSESSMENT · RECOMMENDATION` (mono eyebrow labels), matching the
Copilot SBAR feature. Compact variants preserve the alignment without sacrificing
writing space:

| Template | Handoff region |
|---|---|
| `medsurg-4pt` | One shared handoff band divided into **four numbered mini-SBAR columns** (one per patient) |
| `medsurg-6pt` | Per-band **`NEXT SHIFT`** line (paired with `PENDING`) — no SBAR reminder key. Whole-assignment handoff instead surfaces in a six-column **`SHIFT AT A GLANCE`** band (`PRIORITY` / `WATCH FOR` / `FIRST THING NEXT SHIFT` per patient), the same revised convention as `medsurg-4pt` |
| `icu-systems` | One **full-width four-part SBAR strip** |
| `telemetry` | One **compact SBAR block per patient half** |
| `ed-rapid` | Per-encounter **`DISPOSITION / PENDING / HANDOFF`** area (no four-part block) |
| `night-shift` | One compact next-shift handoff area per patient — this **is** the per-patient `DAY-SHIFT FOLLOW-UP` area of §3.6 (one region, not two) |
| `new-grad` | **Expanded half-band SBAR** with teaching prompts (§3.7) |

#### 3.0.3 Code status

One blank field labeled **`CODE STATUS`** (ratified — chosen over
`CODE / GOALS OF CARE` for fit in compact identity strips and consistency with the
app's plain clinical register). **No printed list of code-status options anywhere**
— never `FULL / DNR / DNI` or any other predefined choices; facilities differ and
the blank is the nurse's to fill. Same label on every template that carries it.

#### 3.0.4 Fill-area anatomy

All fill areas are blank rules (0.5pt hairlines) or empty checkboxes (`--ce-r-sm`
squares). Nothing is pre-filled; no example content ever.

### 3.1 `medsurg-4pt` — Med-Surg · 4 Patient

The classic workhorse: one letter page, quartered, one patient per quadrant.
Per quadrant:
- **Identity strip**: `PT LABEL / STICKER` box (sticker-sized; it fits at quarter
  page) + `ROOM / BED` blank, `DX` blank, `CODE STATUS` blank (§3.0.3), `ALLERGY`
  blank, `ISOLATION` checkbox.
- **Systems mini-grid**: Neuro · CV · Resp · GI/GU · Skin — one ruled line each.
  (Why: med-surg assessment notes are one-liners per system; a full band per system
  belongs to the ICU sheet.)
- **Meds / tasks strip** (exact structure — no worker judgment): **six compact
  columns**; each column is a blank **`TIME`** line above a blank task/medication
  notation area, with a **checkbox beneath each column**. No drug names, doses,
  rates, concentrations, or default administration times are printed — the nurse
  labels the times at the start of shift.
- **Timed tasks**: 5 checkbox rows with time blank + task blank.
- **Handoff**: shared four-column mini-SBAR band per §3.0.2.

### 3.2 `medsurg-6pt` — Med-Surg · 6 Patient (high-ratio) (revised — matches implementation)

Six horizontal bands, one patient each, stacked vertically — not a compressed
four-quadrant grid. At a 5–6 patient ratio the sheet is a task list first, not an
assessment record: each band leads with a compact identity/context row, then the
fields a nurse re-checks through the shift, then the shift's centerpiece — an
hourly task-organization rail — then pending/next-shift for handoff. Per band:
- **Identity**: `ROOM / BED` blank + `PT LABEL` blank area (ruled — a sticker box
  does not fit a sixth-page band) + `CODE STATUS` blank + `DX` blank +
  `ALLERGIES` blank (matches the Med-Surg 4 safety convention: every identity
  strip with a `DX` blank also carries `ALLERGIES`) + `ISOLATION` checkbox +
  blank `SHIFT PRIORITY`.
- **Why Here / Watch For**: paired one-line row, same convention as Med-Surg 4.
- **Today's Priorities**: exactly two checkbox-and-line rows.
- **Clinical Concerns**: the same five compact labels as Med-Surg 4 (`AIRWAY /
  O₂` · `HEMODYNAMICS` · `NEURO` · `SAFETY` · `OTHER`), packed into one compact
  row rather than a two-column grid — the six-patient ratio calls for
  shorthand, not a full systems grid.
- **Task-organization rail**: hour ticks **0700–1900** across, a checkbox
  beneath each tick, plus one general `TASK` line. Generic hourly organization
  for tasks and follow-ups; **it is a task-organization rail, not a medication
  schedule**, and prints no medication-related content.
- **Pending / Next Shift**: paired one-line row.
- **Handoff**: no per-band SBAR reminder key — see the revised §3.0.2 row and
  the whole-assignment `SHIFT AT A GLANCE` band below.

**Shift At A Glance** (whole-assignment summary, six columns): legend
**`HIGH-RATIO ASSIGNMENT SUMMARY`**; one cell per patient with `PRIORITY` /
`WATCH FOR` / `FIRST THING NEXT SHIFT` (label stacked above its own blank line
at six-column width) — the same revised convention as Med-Surg 4's glance
band, no isolated SBAR letters.

**Static PDF**: `medsurg-6pt` has a generated static PDF
(`clinical-edge-medsurg-6-patient-brain-sheet.pdf`), produced the same way as
Med-Surg 4 — see §5.

No night-hour variant of this sheet in v1 (§9).

### 3.3 `icu-systems` — ICU · Systems-Based Single Patient

Full page, one patient — the systems-based format ICU preceptors teach.
- **Identity** (top of content area): `PT LABEL / STICKER` box top-right +
  `ROOM / BED`, `DX`, `CODE STATUS`, `ALLERGY` blanks, `ISOLATION` checkbox.
- **Systems bands** (the page spine): NEURO · CV · RESP · GI/GU · SKIN/MOBILITY ·
  ID/LINES — each a labeled band with 2–3 ruled lines and 2–3 convention micro-labels
  inside (e.g. CV band prints small `RHYTHM`, `MAP GOAL`, `ACCESS` sub-blanks).
- **Lines & access block**: table of 4 rows — `LINE / SITE / DAY / DRESSING ✓`.
- **Drips block**: 6 rows — `DRIP NAME (blank) / TITRATING? ✓ / VERIFIED ✓`.
  **No dose, rate, or range column exists.** The blank is for the nurse's pen.
- **Vent strip**: `MODE · FiO₂ · PEEP · RATE · TV` labeled blanks (settings the nurse
  copies from the vent — labels are parameter names, which are not dosing content).
- **Labs grid**: two columns of common-lab label + blank + trend-arrow cell (`↑ → ↓`
  circle-one glyphs); labels only, no reference ranges (ranges live in Reference Hub).
- **Hourly I/O rail**: 12 hour ticks with `IN / OUT` micro-columns.
- **Handoff**: full-width four-part SBAR strip per §3.0.2.

### 3.4 `telemetry` — Telemetry / Stepdown

Half-page per patient, 2-up. Per half:
- **Identity strip**: `PT LABEL / STICKER` box (fits at half page) + `ROOM / BED`,
  `DX`, `CODE STATUS` blanks + cardiac history one-liner blank.
- **Rhythm box**: `RATE / RHYTHM / ECTOPY` blanks × two timestamped columns
  (`START OF SHIFT` / `RECHECK`) — tele culture is trend-the-rhythm, so the sheet
  builds the recheck in.
- **Electrolyte mini-grid**: `K · Mg · Ca` label + value blank + trend arrow.
- **Activity / orders strip**: checkboxes `BEDREST · UP W/ ASSIST · AD LIB` + blank.
- **Tele-alarm log**: 3 rows of `TIME / ALARM / ACTION ✓`.
- **Handoff**: compact SBAR block per patient half, per §3.0.2.

### 3.5 `ed-rapid` — ED / Rapid Assessment

Row-based, 5 encounter rows (ED nurses turn over spaces, not rooms). Per row:
- **Identity / arrival strip**: `BED` blank + `PT LABEL` blank area (ruled; a
  sticker box does not fit a fifth-page row) + `CC` (chief complaint, not
  diagnosis — ED convention) + `ARRIVED` time blank.
- **Re-assessment boxes**: three small timed boxes (`TIME` + one-line note) — the
  ED documentation rhythm is timed re-checks, not head-to-toe.
- **Pending checklist**: `LABS ✓ IMAGING ✓ CONSULT ✓ MEDS ✓` + blank.
- **Handoff**: per-encounter `DISPOSITION / PENDING / HANDOFF` area per §3.0.2 —
  dispo circle-one (`ADMIT / DC / TRANSFER / OBS`) + time blank + one handoff line.

### 3.6 `night-shift` — Night Shift · 4 Patient

An overnight **organization sheet for a typical multi-patient bedside assignment**
(not an ICU single-patient sheet). Library meta: `1 PAGE · 4 PATIENTS`. Structure:
- **Four patient columns**, each with a compact identity strip: `ROOM / BED` blank +
  `PT LABEL` blank area + `DX` blank + `CODE STATUS` blank.
- **Shared overnight timeline `1900–0730`**: one vertical hour rail down the left
  spine; the four patient columns align to it, giving each patient per-hour space
  for timed tasks, reassessments, labs, intake/output totals, and morning
  preparation.
- **Per patient**: a compact **`DAY-SHIFT FOLLOW-UP`** area (this is also the
  template's handoff region per §3.0.2) and a compact
  **`ESCALATION TRIGGERS / WHO TO NOTIFY`** line.
- **Shared chart-check area**: `ORDERS ✓ MAR ✓ LABS ORDERED ✓ CONSENTS ✓`.
- **Shared AM-preparation checklist**: labs drawn, weights, I/O totaled, handoff
  ready — checkboxes + blanks.

### 3.7 `new-grad` — New Grad / Student Clinical

Full page, one patient — the scaffolded teaching variant. Same bones as §3.3 but:
- **Identity**: `PT LABEL / STICKER` box top-right + `ROOM / BED`, `DX`,
  `CODE STATUS`, `ALLERGY` blanks (per §3.0.1 single-patient rule).
- Each systems band prints a **micro-prompt** in caption type, e.g. NEURO: *"What
  would make you re-assess this system before your next scheduled check?"* — the
  prompts teach the reasoning habit, in our editorial voice.
- **Patho corner**: `WHY IS THIS PATIENT HERE?` box (3 ruled lines) + `WHAT'S THE
  PLAN?` box — the clinical-instructor questions.
- **`GENERAL TOPICS TO REVIEW`**: 3 ruled rows, with this caption printed verbatim
  beneath the label: *"Record general learning topics only. Do not copy patient
  identifiers or case-specific details."*
- **Handoff**: the largest SBAR region of any sheet — an expanded **half-band**
  with one caption teaching prompt per letter (e.g. S: *"One sentence. What's
  happening right now?"*), per §3.0.2.
- No drips block, no vent strip (students report those, they don't own them).

---

## 4. On-screen pages

Standard module recipe throughout — design-system.md §4.1 header (logo + wordmark +
`BRAIN SHEETS` eyebrow + "← All tools"), dark navy chrome, warm cards.

### 4.1 Library index (`/brain-sheets`)

- Eyebrow `BRAIN SHEET LIBRARY` + H1 + one lead paragraph stating the stance
  plainly: blank templates, print and fill on paper, nothing entered or stored here.
  (No "PHI-free!" marketing language — state it as a fact, per the copy voice rules.)
- 7 template cards as an **editorial list** (home-hub pattern — NOT a grid of ≥3
  identical accent cards, banned pattern §5.8): title, one-line "who it's for,"
  mono meta line (`1 PAGE · 4 PATIENTS` etc.), rendered as `.ce-interactive-card`s.
- One info banner (design-system §4.5, `--ce-blue`) restating: templates here are
  blank; once printed and filled in, the paper copy is handled under facility policy.

### 4.2 Template page (`/brain-sheets/:templateId`)

Two-column on desktop (stacked on mobile):
- **Left rail**: template title + description, the **pearls list** (§6.1), and the
  actions. Templates with a generated static PDF (§5) show **Download PDF**
  (primary), **Print / Save PDF** (secondary), **Copy Link** (secondary, §7).
  Templates without one show Print / Save PDF (primary) and Copy Link (secondary),
  unchanged. Directly beneath the Print action, this screen-only note in caption
  type (never printed): **"For best results: Letter, Portrait, 100% scale, browser
  headers and footers off."**
- **Right**: the **sheet preview** — the actual sheet component rendered on a white
  `--ce-warm-card`-bordered surface at a scaled-down size (CSS `transform: scale()`
  in a fixed-aspect container; the same DOM prints at full size). The preview is the
  product shot; it must look exactly like what comes out of the printer.
- `template_viewed` fires once on mount of a **valid** template-detail page (§8).

---

## 5. Output mechanism — print stylesheet, plus approved static PDFs (ratified, revised)

`window.print()` + `@media print` CSS remains the universal mechanism for every
template — every browser's print dialog includes Save-as-PDF, so this mechanism
alone yields both paper and file for any template in the library.

**Approved templates may additionally ship a pre-generated static PDF** (revises
the original "no static PDF assets" decision). A static PDF is never a separately
hand-built layout: `frontend/scripts/generate-brain-sheets-pdf.mjs` renders the
exact same production `Sheet` component and the exact same
`brain-sheets-print.css` print rules used by the in-app preview and the Print /
Save PDF path, via a headless-Chromium print pass, and writes the result to
`frontend/public/brain-sheets/pdfs/`. This is a developer-invoked build step
(`npm run generate:brain-sheets`), not a request-time or backend operation — no
PDF-generation library ships in the app bundle, no backend involvement.

**Currently `medsurg-4pt` is the only template with a generated static PDF.**
Adding one for another template is a per-template decision, not automatic — it
requires adding the template to the `SHEETS` list in the generation script and
to the `TEMPLATES` registry's `pdfPath`/`pdfFilename` fields.

### 5.1 Page setup and the one-page standard

- `@page { size: letter portrait; margin: 0.4in; }` — content designed to a
  7.7 × 10.2 in live area.
- **The one-page standard (exact wording): "Each template is designed to render as
  one US Letter portrait page at 100% browser print scale with browser-generated
  headers and footers disabled."** Browser print settings remain under the user's
  control; Clinical Edge cannot confirm whether the user completed printing or
  saving. **A4 is not a supported or verified v1 layout** (§9).
- `@media print`: hide everything except the sheet (`body * { visibility … }` scoping
  or a `.bs-print-root` pattern — implementer's choice, but scoped entirely inside
  `brain-sheets-print.css`); the sheet un-scales to 100%.
- The print CSS ships **only** in the brain-sheets module (imported by
  `BrainSheetsModule.jsx`) so no other module's print behavior changes. B0 verifies
  no global print CSS already exists that would interact with it.

### 5.2 Ink & grayscale rules (constitutional)

- **Ink-friendly**: paper-white background; zero filled areas darker than a 0.06
  alpha tint; no floods, no dark bands. Section headers are hairline-ruled type,
  not filled bars.
- **Grayscale-safe**: no meaning carried by color alone. Accents on print are
  limited to the teal footer wordmark — it must remain legible when rendered gray
  (hierarchy comes from type weight and the mono eyebrows, per the system's own rules).
- Typography on the sheet: Inter + IBM Plex Mono exactly per design-system §2 —
  eyebrows are the signature on paper too (mono, uppercase, 0.12em). Minimum
  printed type size 7pt (captions), field labels 8pt, section eyebrows 8pt.
- Hairlines: 0.5pt `--ce-warm-line`-equivalent gray. Checkboxes: 10–11pt squares,
  `--ce-r-sm` radius.

### 5.3 The shared footer (SheetFrame, prints on all 7)

One caption-type line, ≤ 4mm tall, hairline rule above:
`CLINICAL EDGE · theclinicaledge.org/brain-sheets` (left) ·
`Once filled in, this sheet contains PHI — discard per facility policy.` (right).
Wordmark text in teal on screen, prints acceptably gray; everything else
`--ce-text-muted`. No logo SVG on print in v1 (keeps ink cost near zero).

---

## 6. The differentiator layer

What a Gumroad PDF can't do:

### 6.1 Pearls — "how experienced nurses use this"

Each template carries **3–5 pearls** in `data/templates.jsx`: one short paragraph
each, our editorial voice (plain, confident, no exclamation marks, no emoji), each
tied to a *specific section of that sheet*. Gold mono eyebrow (`PEARL` +
section name), per the gold-accent role.

**Editorial safety rules for all pearl copy:** pearls may explain prioritization,
clustering appropriate care, preparing morning work, and making deferred non-urgent
items visible at handoff. Pearls must **never** suggest delaying assessment,
treatment, escalation, or ordered care for sleep or convenience — and never state
doses, orders, or diagnostic instructions.

Approved examples of the register (these three are approved copy — include them):

- (icu-systems, labs grid) "Mark the direction before writing the value. At
  handoff, a visible trend communicates more than an isolated result and helps the
  next nurse see what is changing."
- (medsurg-4pt, meds/tasks strip) "Label every TIME column at the start of shift,
  even the ones you expect to leave empty — an unlabeled column reads as 'nothing
  due' when it might mean 'never planned.'"
- (night-shift, DAY-SHIFT FOLLOW-UP) "A deferred item is only safe when it is
  visible. When a non-urgent task appropriately moves to day shift, write it in
  the follow-up box the moment you decide — that line is what keeps 'later' from
  becoming 'never.'"

Pearls render **on-screen in the left rail** (ratified: screen-only; the printed
margins stay clean for the nurse's own pen).

### 6.2 SBAR alignment

Wherever a four-part handoff block appears (§3.0.2), it uses the exact four labels
and ordering of the Copilot SBAR feature (Situation / Background / Assessment /
Recommendation). Compact variants (`ed-rapid`, `night-shift`) keep
the alignment through the shared reminder key or region naming without consuming
per-patient writing space. `medsurg-6pt` no longer participates in this pattern —
like `medsurg-4pt`, it dropped SBAR letters entirely in favor of the
`SHIFT AT A GLANCE` convention (§3.2). The template page's left rail includes one cross-link
under the pearls: "Practice building the handoff itself → Copilot's SBAR generator"
linking to `/copilot`. That's the full extent of the integration in v1 — no data
flows anywhere (there is no data).

### 6.3 The brand artifact standard

A coworker seeing a printed sheet should ask "where'd you get that." Concretely:
the sheet must look designed — token typography, disciplined hairline geometry,
the mono-eyebrow signature — and carry the §5.3 footer so the question has an
answer. This is the acquisition loop; treat sheet layout polish as a feature
requirement, not decoration.

---

## 7. Shareability

- **The share unit is the URL**: `/brain-sheets/:templateId` is clean, stable, and
  works logged-out (there are no logins).
- **Copy Link — exact behavior (no worker judgment):**
  1. Attempt to write the absolute canonical template URL via
     `navigator.clipboard.writeText`.
  2. On success: standard confirmation state (design-system §1.2:
     `Copy Link → Copied`, teal step + glyph swap) for ~1.5 s, then revert.
  3. On failure, or when the Clipboard API is unavailable: reveal a compact
     **non-editable text element** containing the absolute URL, with the
     instruction `Press and hold to copy` on touch devices, otherwise
     `Select and copy this link`.
  4. The fallback is **not** an `<input>` or `<textarea>` (the §1 prohibition holds).
  5. Copy Link fires **no analytics event** — share reach shows up as
     `template_viewed` on the receiving end, which is the number that matters.
- **The printed sheet is the offline share**: the §5.3 footer URL is how paper
  converts to visits.
- **The file share has two paths.** For every template, the print dialog's
  Save-as-PDF (Print / Save PDF) produces a file with zero extra build surface.
  For templates with a generated static PDF (currently `medsurg-4pt` only — §5),
  **Download PDF is the primary file-share action** — a direct link to the
  pre-generated file, no print dialog involved.
- Each template gets an SEO-registry entry (expected: `routeSeo.js`; verify in B0.
  Title pattern: "«Template name» Brain Sheet — Free Printable | Clinical Edge")
  plus one for the index — printable brain sheets are a high-volume search category
  and every template page is a landing page.

---

## 8. Analytics contract (complete — nothing else may be added)

Two events, through the existing analytics helper (expected:
`frontend/src/analytics.ts` `trackEvent`; B0 verifies file, signature, and payload
shape), payloads restricted to the fixed IDs of §2.4:

| Event | Semantics | Payload |
|---|---|---|
| `template_viewed` | Fires **once on mount of a valid template-detail page**. Not on the index, not on unknown-id fallback, not on preview re-renders. | `{ template_id }` |
| `template_downloaded` | A **download-intent event, reserved for the Download PDF action only** (§4.2, §5) — never the Print / Save PDF button. Fires immediately on explicit click of Download PDF, on **every** click, including repeated clicks. It is **not evidence the file finished downloading** (the browser gives no reliable signal). Never fired automatically on mount, preview render, keyboard navigation, or for Print / Save PDF or Copy Link. **Not yet wired as of this revision** — see `BrainSheetsModule.jsx`; wiring is B9 scope. | `{ template_id }` |

Plus the pre-existing home-hub `module_opened` convention when the card is clicked
(expected: handled by the existing `MODULE_OPEN_EVENTS` map — add a `brainsheets`
key there if B0 confirms that mechanism; this is registry conformance, not a new
event class). **No other events**: no copy-link event, no scroll/preview events,
no per-section events. Never any free text in payloads.

---

## 9. v1 non-goals (explicitly not built)

1. **No customization builder** — no picking sections, reordering, or per-unit tweaks.
   The 7 curated templates ARE the product; curation is the value.
2. **No accounts, no auth** (consistent with app-wide "not built yet").
3. **No saved state of any kind** — no `localStorage`, no `sessionStorage`, no
   favorites, no recents.
4. **No in-app filling** — no form fields ever, per §1. This is permanent product
   stance, not deferred scope.
5. **No PDF-generation library in the app bundle and no backend/request-time PDF
   generation.** Approved templates may ship a **developer-generated, build-time
   static PDF** (§5) — narrower than the original "no static PDF assets" stance,
   which the Download PDF decision revised.
6. **No landscape variants. A4 is not a supported or verified v1 layout** —
   letter portrait only.
7. **No additional specialties or shift variants** (L&D, peds, psych, charge-nurse
   assignment sheet, night-hour med-surg-6pt rail) — candidate v1.1 additions,
   decided by `template_viewed` distribution.
8. **No backend involvement** — zero new endpoints, zero network calls from the
   module (backend is locked per CLAUDE.md).

---

## 10. Worker-sized task blocks

Execution model identical to design-system.md §6: each block is self-contained,
executed by one worker in one pass, no cross-block judgment calls. ⚙ mechanical /
★ visible. **Verify each block**: `cd frontend && npm run build` passes, plus the
block's own check.

### 10.1 The module safety check (run in every production sheet block and B9)

Repository-appropriate searches over `frontend/src/modules/brain-sheets/` that
cover JSX variations and capitalization (e.g. case-insensitive grep), confirming
the module contains **none** of:

`<input` · `<textarea` · `<select` · `contenteditable` · `localStorage` ·
`sessionStorage` · `fetch(` · `axios` · any new backend call · any hardcoded
fictional or real patient example (names, ages-with-conditions, room-plus-story
scenarios — the module's only prose is UI copy and pearls).

Example (adapt to what B0 finds available):
`grep -riE '<(input|textarea|select)|contenteditable|localstorage|sessionstorage|fetch\(|axios' frontend/src/modules/brain-sheets/`

These checks are a floor, **not a substitute for visual and code review**.

### B0 — Repository convention audit ⚙ (read-only; changes NO files)

Inspect and report, before any implementation:
- Actual frontend root and build entry.
- Current routing implementation (expected: `main.jsx` `getPage()` switch).
- Existing module registry shape (expected: `ClinicalEdgeHome.jsx` `MODULES`).
- Existing module-open analytics mapping (expected: `MODULE_OPEN_EVENTS`).
- Exact analytics helper file, function signature, and accepted payload shape
  (expected: `analytics.ts` `trackEvent(eventName, payload)`).
- Current SEO registry implementation (expected: `routeSeo.js`).
- Design-system token names this module needs (warm surfaces, text, hairlines,
  radii, type scale).
- Any existing global or module-level print CSS (expected: none).
- Existing reusable clipboard and confirmation-state patterns (expected: Copilot's
  Save Case / SBAR copy patterns).
- Whether Chrome and Safari are genuinely available in the execution environment
  for print-preview verification.

**B0 finding (confirmed 2026-07-21):** the execution host is a genuine macOS
machine with both Google Chrome and Safari installed. **Every visual print check
in B2 and the production sheet blocks (B3–B5) must be performed in both Chrome and
Safari, locally, by the implementing worker** — there is no fallback to routing
verification to Mohamed.

Output: a short findings report. Implementation blocks follow the found structures
exactly; **no restructuring of routing, analytics, SEO, or unrelated registries.**

### B1 — Module scaffold ⚙

Create `frontend/src/modules/brain-sheets/` with `BrainSheetsModule.jsx` (index +
detail shell off a `templateId` prop), `brain-sheets.css` (§4.1 header recipe, dark
chrome), and `data/templates.jsx` exporting the `TEMPLATES` registry: the 7 entries
of §2.4 with `id`, `title`, `audience` line, `meta` line, `pearls: []`.

**Safe-registry behavior (exact):** template entries omit the `Sheet` field (or set
it to `null`) until production sheet blocks fill them in. The detail placeholder
renders the template's metadata plus a neutral placeholder region and **never
attempts to render a missing sheet component** (explicit `Sheet ? <Sheet/> :
<placeholder/>` guard). Unknown template IDs render the library index. **No
temporary runtime errors are acceptable at any commit in this block.**

Wire routing, the home-hub card (key `brainsheets`, path `/brain-sheets`, status
`active`), the module-open mapping, and SEO entries — all following the structures
B0 found, not this spec's expected names. **Check**: both routes render for all 7
ids and for an unknown id; home card navigates; build passes.

### B2 — SheetFrame + print layer ★ (the pattern-setter)

`components/SheetFrame.jsx` per §3.0.1 ownership: title, `DATE`/`SHIFT` blanks,
content area, **configured handoff region** (accepts an explicit variant selection
or a rendered handoff child per §3.0.2 — no default), §5.3 footer with both
verbatim strings. **No patient-identity element in the frame.**
`brain-sheets-print.css`: §5.1 page setup, §5.2 ink/grayscale rules, print-scoping
so ONLY the sheet prints; screen preview scaling per §4.2.

**The B2 demo is a maximum-density prototype, not a simple sheet.** Build one
non-production prototype sheet that exercises, on a single page: single-patient
identity placement (PT LABEL/STICKER box) AND multi-patient identity placement
(compact `ROOM / BED` + `PT LABEL` panels); multiple systems bands; a compact
table; a 12-hour timeline; **all** §3.0.2 handoff variants (full strip, mini-SBAR
columns, `NEXT SHIFT` line + reminder key, `DISPOSITION / PENDING / HANDOFF`,
half-band); the shared footer; the minimum permitted type size (7pt); and the
maximum expected ruled-line density. The prototype exists only to validate
geometry and is **removed when production sheets replace it**.

**B2 approval must confirm** (per the §5.1 standard — Letter portrait, 100% scale,
browser headers/footers off): one US Letter portrait page; no clipped content; no
blank second page; footer visible; hairlines printable; grayscale hierarchy
understandable. **Do not begin production sheet blocks until B2 receives visual
approval.**

### B3 — Med-Surg pair ★

`sheets/MedSurg4.jsx` per §3.1 and `sheets/MedSurg6.jsx` per §3.2, registered in
`TEMPLATES`. This block establishes the **reusable multi-patient layout conventions
and class naming** that B4/B5 consume. **Check**: each renders one page per the
§5.1 standard; every §3.1/§3.2 element present; §10.1 safety check clean.
**Pause after B3 for a visual consistency review** before B4/B5 start.

### B4 — ICU + New Grad pair ★

`sheets/IcuSystems.jsx` per §3.3 and `sheets/NewGrad.jsx` per §3.7 (shared
systems-band construction; build the band as a small local component used by both).
New Grad micro-prompts, the `GENERAL TOPICS TO REVIEW` caption (§3.7, verbatim),
and SBAR half-band prompts copied verbatim from this spec. **Check**: one page each
per the §5.1 standard; drips block has NO dose column; §10.1 safety check clean.

### B5 — Telemetry + ED + Night Shift ★

`sheets/Telemetry.jsx` (§3.4), `sheets/EdRapid.jsx` (§3.5),
`sheets/NightShift.jsx` (§3.6 — four patient columns, shared 1900–0730 rail,
per-patient `DAY-SHIFT FOLLOW-UP` and `ESCALATION TRIGGERS / WHO TO NOTIFY`,
shared chart-check and AM-prep areas). Uses B3's multi-patient conventions.
**Check**: one page each per the §5.1 standard; §10.1 safety check clean.

### B6 — Library index ★

Replace the B1 index placeholder with §4.1: index header and stance copy, the
seven-item editorial list, the info banner, responsive behavior, navigation into
valid detail pages. **Check**: against design-system.md §4/§5 banned patterns;
all 7 cards navigate correctly.

### B7 — Template detail page + actions ★

Replace the B1 detail shell with §4.2: left editorial rail, pearls rendering shell
(empty until B8), preview scaling, the Print action with the screen-only print
note (§4.2, verbatim), Copy Link success **and** failure behavior per §7,
responsive stacking. No analytics wiring in this block unless the architecture B0
found requires wiring simultaneously; final analytics verification remains in B9.
**Check**: preview matches print output visually; Copy Link fallback verified with
clipboard API disabled; §10.1 safety check clean (the Copy Link fallback must not
introduce an input element).

### B8 — Pearls content ⚙ (copy task)

Write 3–5 pearls per template into `data/templates.jsx` in the §6.1 register and
under the §6.1 editorial safety rules (the three §6.1 examples are approved copy —
include them). Add the §6.2 SBAR cross-link under the pearls rail. **Check**:
Mohamed reviews all pearl copy before this block merges.

### B9 — Analytics + final verification ⚙

Wire `template_viewed` and `template_downloaded` exactly per §8 semantics; add
nothing else. Full pass: build; print every template **in both Chrome and Safari,
locally**, confirming one page each per the §5.1 standard;
`grep -rE '#[0-9a-fA-F]{3,8}'` on all module files returns only
design-system §1.6-legal values; §10.1 safety check across the whole module; every
`trackEvent` call in the module matches the §8 table exactly; B2 prototype removed.

### Execution order (revised — do not parallelize sheet blocks initially)

B0 → B1 → B2 → **visual approval pause** → B3 (Med-Surg pair) → **visual
consistency review** → B4 and B5 (may run in parallel, using the approved B2/B3
conventions) → B6 → B7 → B8 (pearls/content) → **copy approval pause** → B9
(analytics/final verification).

---

## 11. DO NOT TOUCH (inherited + module-specific)

1. Everything in design-system.md §7 (backend, parser, analytics conventions,
   localStorage keys, PWA/deploy config, logo SVG).
2. No changes to any other module's CSS — the print layer is scoped to this module.
3. The verbatim strings: both §5.3 footer strings, the §3.7 `GENERAL TOPICS TO
   REVIEW` caption, the §4.2 screen-only print note, and the pearl copy once
   approved (B8).
4. The template IDs (§2.4) — they are the analytics contract.
5. B0 is read-only — it changes no files.
