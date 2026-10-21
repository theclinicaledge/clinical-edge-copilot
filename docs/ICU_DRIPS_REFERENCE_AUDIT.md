# ICU Drips reference and usability audit

Date: 2026-10-20. Scope: 23 medication entries, 115 hemodynamic cells, 12 comparisons, 10 practice questions, 5 shift challenges, 15 rotating pearls, 7 library pearls, and 5 foundation notes. The 23 new mechanism checks and action/effect/watch summaries were also checked against the same references.

This is an implementation and source-reference audit, not independent clinician or pharmacist validation. No clinician review date or validation result was added. `docs/CLINICAL_VALIDATION_REGISTRY.md` remains unchanged. Bedside decisions remain governed by the active order, exact product labeling, pharmacy, and institutional protocol.

## Method and limits

Read every authored entry and the comparison/practice/pearl text, then cross-checked mechanisms, expected patterns, important warnings, monitoring rationale, route/formulation distinctions, and claims about duration. Used product-specific DailyMed prescribing information plus topic-specific society guidance. All 24 linked labels (23 drips and the SQ enoxaparin comparator) were opened. Some journal-hosted full texts/DOIs returned access errors; their indexed primary-source passages and accessible society summaries/product labels were used for the applicable distinctions. Source links may still be subject to publisher access restrictions.

Use-context examples include off-label specialist practice. They are not a complete indication or contraindication list, a therapy-selection algorithm, or an administration guide. No doses, titration steps, replacement orders, hold/start instructions, or patient-specific advice were added. Hemodynamic arrows are qualitative patterns, not measured potency comparisons or predictions for an individual patient. CO and CI retain matching directions. A neutral arrow does not exclude adverse effects.

## Medication coverage and primary labeling

| Entry | Audit result / focused clarification | Primary label |
| --- | --- | --- |
| Norepinephrine | Scoped first-line language to septic shock; clarified reflex HR slowing and variable output rather than a guaranteed cardiac-output benefit. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=39cda6c6-3857-4028-80cf-aef135f8c7e6) |
| Vasostrict (vasopressin) | Separated absence of beta stimulation from possible bradycardia or lower output; included sodium/water changes around withdrawal. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b97e5c3e-ca28-4ffa-80af-6c5bdbadaf10) |
| Phenylephrine | Removed reassuring dismissal of new bradycardia and a blanket preferred-agent claim; linked afterload and reflex slowing to possible lower output. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f2096e12-cbeb-4084-9132-17c7ef46b7b9) |
| Epinephrine | Separated continuous-infusion context from arrest/initial anaphylaxis administration; added beta-2 lactate context without dismissing hypoperfusion. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1e8ebac1-5b32-47f9-a930-86a98a24dccc) |
| Dobutamine | Retained output-versus-pressure teaching while making clear that lower MAP can still compromise perfusion. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9794e9d0-c8b7-4d18-8cd1-15cc4f2a9a55) |
| Milrinone | Distinguished prompt onset from slower clearance; removed advice to delay reassessment and highlighted renal function throughout therapy. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b3c936b3-5c86-4d87-9544-e94e95d0245f) |
| Diprivan (propofol) | Clarified prolonged-infusion recovery, respiratory/BP/HR risks, and separate pain assessment with CPOT/BPS when appropriate. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d1ae9e26-ffd6-43df-bbd6-869cdede6afe) |
| Precedex (dexmedetomidine) | Qualified respiratory preservation and arousability; removed a fabricated gradual-only/30-minute bradycardia window and added abrupt bradycardia/withdrawal context. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9eb336de-5fa5-4b46-b40b-a7ca5a0864bd) |
| Midazolam | Retained accumulation teaching without explaining away unexpected failure to arouse; clarified lack of analgesia and important flumazenil risks. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d9305142-417d-4d8c-9a23-f9a1b6771cac) |
| Fentanyl citrate | Clarified that an analgesic can also sedate; removed blanket neutral hemodynamic arrows and reliable quick-offset language. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1ed25b2c-334e-4021-ada1-3396f07630dc) |
| Ketalar (ketamine) | Removed guaranteed hemodynamic-stability framing; included catecholamine-depleted cardiac depression and continuing airway/respiratory risks. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=14e8f864-8b8a-4e7e-8439-e510d3107063) |
| Amiodarone IV | Distinguished terminal elimination from a fixed duration of clinical effect; exposure-dependent persistence, electrolyte/QTc context, AF conversion context, and infusion-versus-arrest distinction. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8969aad3-0219-e67f-e053-2995a90aac5a) |
| Diltiazem IV | Qualified AF/flutter rate-versus-rhythm teaching, acknowledged AV-node-dependent SVT termination, clarified PR measurement limits during AF, and strengthened LV dysfunction/pre-excitation warnings. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=41d75325-d935-ba54-e063-6394a90aade2) |
| Brevibloc (esmolol) | Qualified rapid offset and recovery; retained conduction, output, perfusion, and bronchospasm awareness. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9c593cdb-cdfe-4492-8862-9b05116aa25e) |
| Cardene IV (nicardipine) | Removed wait-before-reassessment/adjustment language; explained evolving response, reflex HR, variable output, advanced aortic stenosis, and formulation-specific line restrictions. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a3e33add-0d09-423a-9109-42e5ba7148d5) |
| Sodium nitroprusside | Separated early cyanide toxicity from thiocyanate accumulation/renal risk; removed universal tubing-cover and central-line claims and an unqualified aortic-dissection use example. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=820eadcb-1230-4b17-a652-e69b52b3c12f) |
| Nitroglycerin in dextrose (IV) | Removed non-IV Nitro-Bid branding, universally benign headache wording, and guaranteed gradual BP response; specified PDE-5/riociguat interactions and preload context. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=457a026c-ebce-4701-9deb-2d7652759a99) |
| Furosemide injection | Retained electrolyte/renal/hearing monitoring; added net balance, congestion findings, and hypochloremic metabolic alkalosis context. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8e0bac29-5a8b-4d4e-93b3-2e21eb3b0650) |
| Bumetanide injection | Retained shared loop-diuretic physiology without implying identical milligram potency; added balance/alkalosis context and qualified allergy wording. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9058fc52-f3f6-4d7f-b2a0-b1e2c714b133) |
| Heparin sodium | Corrected the inverted clot-dissolution sentence; separated therapeutic infusion from usual prophylaxis route, anticoagulation assays from complication assessment, and added hemoglobin/platelet/potassium context. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6be171fb-c85f-4336-a88d-b4d97bb0fe03) |
| Argatroban | Removed infusion-stop instructions and the claim that stopping is the only bleeding-care option; added INR overlap, hepatic persistence, and context-specific aPTT/ACT. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=79eec27d-ac63-4996-8b1a-c2cd52ad2b2c) |
| Bivalirudin | Replaced HIT-safe wording with non-heparin option; retained mixed elimination and renal risk without infusion-stop instructions. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e574d04f-67b4-4a84-9d66-8c2d54f95120) |
| Humulin R (regular insulin) | Separated glucose and potassium trends rather than lockstep movement; added ketogenesis, DKA acid-base/ketone recovery, nutrition interruption, and renal clearance context. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=81199e55-ade9-46de-a5a3-c0415acee403) |
| Enoxaparin (SQ comparison) | Comparison-only SQ medication. Preserved partial protamine reversibility and renal considerations; lower HIT risk does not make it a non-heparin acute-HIT option. | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5e7568a6-cf8a-4de2-86ba-b94c8ab4c806) |

## Cross-cutting teaching and comparison corrections

- Compared all 12 existing pairs. Removed drug-selection wording around hypertensive urgency, unsupported relative HR/pressure rankings, a pure-alpha-only explanation for reflex slowing, and direct infusion-stop commands. Specified IV heparin versus SQ enoxaparin and supplied both labels in its sources disclosure.
- Reconciled all practice/challenge/pearl text with the entry corrections, including amiodarone persistence, dexmedetomidine bradycardia, separate glucose/potassium assessment, and continuing vital-sign assessment during anticoagulation.
- Replaced double-arrow magnitude rankings with single qualitative arrows. Added plain-language metric cues and an accessible direction label. CI is explicitly cardiac output divided by body surface area.
- Replaced repetitive mental-model prose with a compact Action → Effect → Watch sequence in the same card. Added one two-choice reasoning question to each existing mechanism disclosure, with explanatory feedback and retry. No new navigation, tabs, large toggles, data entry, or network service.
- Closed reference disclosures now hide/inert their contents, preventing hidden answer buttons from receiving keyboard focus. Removed padding that allowed text to peek through a collapsed row.
- Fixed an existing practice-completion analytics count that counted a correct final answer twice. Displayed scoring stays consistent with the actual answers; no new event or payload field was added. The new local mechanism answers are not tracked or persisted.

## Additional primary guidance

- [Surviving Sepsis Campaign: Adult Guidelines (2026)](https://sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines) (Society of Critical Care Medicine): Septic-shock vasopressor and perfusion context; not guidance for every cause of shock.
- [PADIS Guidelines (2018)](https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-prevention-and-management-of-pa) (Society of Critical Care Medicine): Pain assessment, sedation, delirium, and ICU monitoring context.
- [PADIS Focused Update (2025)](https://www.sccm.org/clinical-resources/guidelines/guidelines/focused-update-padis-guideline) (Society of Critical Care Medicine): Updated adult ICU sedation and delirium evidence; complements the 2018 guideline.
- [Adult Advanced Life Support (2025)](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support/) (American Heart Association): Rhythm and resuscitation context. Arrest administration differs from a continuous-infusion reference.
- [Atrial Fibrillation Guideline (2023)](https://www.jacc.org/doi/10.1016/j.jacc.2023.08.017) (ACC / AHA / ACCP / HRS): AF rate/rhythm distinctions, systolic-function limitations, and pre-excitation safety.
- [Heparin-Induced Thrombocytopenia Guideline (2018)](https://www.hematology.org/education/clinicians/guidelines-and-quality-care/clinical-practice-guidelines/venous-thromboembolism-guidelines/heparin-induced-thrombocytopenia) (American Society of Hematology): HIT recognition and non-heparin anticoagulant context. Includes uses beyond individual product labeling.
- [Diabetes Care in the Hospital (2026)](https://doi.org/10.2337/dc26-s016) (American Diabetes Association): Hospital glucose monitoring, nutrition context, and hyperglycemic crises.
- [Hyperglycemic Crises in Adults: Consensus Report (2024)](https://diabetesjournals.org/care/article/47/8/1257/156808/Hyperglycemic-Crises-in-Adults-With-Diabetes-A) (ADA / EASD / JBDS / AACE / DTS): DKA/HHS physiology and monitoring, including ketone and acid-base recovery.
- [High-Alert Medications in Acute Care (2024)](https://www.ismp.org/system/files/resources/2024-01/ISMP_HighAlert_AcuteCare_List_010924_MS5760.pdf) (Institute for Safe Medication Practices): High-alert medication classes and safeguards adapted to institutional policy.

## Verification

- Frontend lint passed.
- Production build passed; all 9 public routes prerendered.
- All 934 backend regression tests passed.
- All 13 ICU-specific tests passed. These include all 23 entries and 12 comparisons at 320×640, 390×844, 768×1024, and 1280×800, both answer paths and retry, keyboard navigation, source coverage, scoring, no horizontal page overflow, and final-content clearance with a simulated 34px safe area.
- All 18 existing relevant scrolling/dock regressions passed, including Learn-to-Drips navigation, all expanded medication sections, practice results, challenges, comparisons, pearls, and related ICU brain-sheet routes.
- Browser review confirmed the compact desktop and phone presentation. No navigation-bar file changed.
- `git diff --check` passed. Checks were completed on the isolated `codex/icu-drips-review` branch; original-checkout drafts were not modified. Release status is recorded in Git and the deployment history.

Automated checks verify software behavior and content regressions, not clinical validity.
