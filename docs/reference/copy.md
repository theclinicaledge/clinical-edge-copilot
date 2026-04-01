# Copy Reference

## Header
- Wordmark line 1: `Clinical Edge`
- Wordmark line 2: `Copilot`
- Badge: `Beta`
- Nav link: `Learn more`

## Hero
- H1: `Clinical reasoning support. Built for nurses.`
- Bridge line: `Describe the situation. Copilot helps you think it through.`
- Subline (desktop only, hidden mobile): `For real-world questions and practice scenarios. Not a diagnosis.`

## Input Card
- Textarea placeholder: `Patient more lethargic, HR climbing, unsure what to make of it...`
- Hotkey hint: `⌘ + Enter`
- Submit button (idle): `Ask Copilot`
- Submit button (active): `Analyzing...`
- Helper line (below card): `Just describe the scenario in your own words.`

## Privacy Notice
> Do not enter names, MRNs, dates of birth, SSNs, phone numbers, or any patient identifiers. Describe the clinical situation only.

## Preview Strip (desktop)
- Label: `You'll get:`
- Pills: `What this could be` · `What matters most` · `What to assess next` · `What to do right now`

## Section Labels (used in response cards)
- `What this could be`
- `What concerns me most`
- `What I'd assess next`
- `What I'd do right now`
- `Closing`

## Urgency Badge
- Format: `Urgency: HIGH` / `Urgency: MODERATE` / `Urgency: LOW`

## Response Trust Cue
> Structured clinical reasoning support — always confirm with your assessment and provider guidance

## Action Bar
- Save button (idle): `+ Save Case`
- Save button (confirmed): `✓ Case Saved`
- Copy button: `Copy Response`

## Continue Thinking Section
- Label: `Continue Thinking`
- Textarea placeholder: `Add an update — new vitals, lab result, or change in status...`
- Submit button: `Continue →`

## Section Labels (chip groups)
- Recent queries label: `Recent Cases`
- Examples label: `Try this:`
- Saved cases label: `Saved Cases`

## Loading Phases (rotating messages)
1. `Interpreting bedside concern...`
2. `Prioritizing assessments...`
3. `Building clinical guidance...`
4. `Finalizing recommendations...`

## Error States
- Connection: `Connection issue — please try again.`
- HTTP error fallback: `Something went wrong. Please try again.`
- Error prefix badge: `ERR`

## Footer Disclaimer
> Your clinical judgment comes first — use this to organize thinking, not replace decision-making.
> Clinical Edge Copilot does not replace institutional protocols, provider orders, or your assessment.
> Always escalate per your facility's policies.

## Example Queries (chips — "Try this:")
1. `BP dropped to 88/50, HR 122, was stable 20 min ago`
2. `Patient on HFNC suddenly desatting to 84%`
3. `Potassium 2.9, patient on a Lasix drip`
4. `Chest tube stopped bubbling and tidaling`
5. `Patient suddenly confused, new onset agitation`
6. `Heparin drip PTT came back at 140`

## Starter Templates
| Label | Prompt |
|---|---|
| Rapid deterioration | `Patient was stable earlier and is now declining: BP down, HR up, concern for acute deterioration` |
| Abnormal lab | `Abnormal lab result: [lab value], patient context: [diagnosis / meds / symptoms]` |
| Medication / drip | `Question about medication or drip: [med/drip], current issue: [lab / vitals / symptoms]` |
| Respiratory | `Respiratory concern: oxygen requirement changed, work of breathing, saturation, device settings` |
| Neuro change | `New neuro change: confusion, lethargy, agitation, speech change, or new focal concern` |
| Chest tube / device | `Device concern: chest tube, line, drain, Foley, feeding tube, or monitor issue` |
| Behavior / agitation | `Behavior or agitation concern: sudden confusion, restlessness, pulling lines, or change from baseline` |
| Post-op concern | `Post-op concern: pain, sedation, respiratory change, bleeding, vitals, or delayed recovery` |

## Saved Case Row (notebook)
- Mode label (quick): `Quick`
- Mode label (deep): `Clinical`
- Timestamp format: `Mar 31 · 02:45 PM`
