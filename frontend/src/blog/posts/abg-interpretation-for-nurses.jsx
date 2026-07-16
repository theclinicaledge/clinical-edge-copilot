import { ResponsiveTable, Callout, ChecklistBox, ExampleCard, FaqList } from "../components.jsx";

export default function AbgInterpretationForNurses() {
  return (
    <>
      <p>
        An ABG puts five values in front of you at once, and it usually shows up at a bad time — a
        patient who looks a little different than they did an hour ago, a respiratory therapist
        waiting for your read, or a provider on the phone asking what you're seeing. It's easy to
        stare at the numbers and freeze, especially when the pH looks fine but something about the
        patient still feels off.
      </p>
      <p>
        The good news is that ABG interpretation isn't really about memorizing dozens of scenarios.
        It's about running the same short sequence every time: pH, then PaCO₂, then HCO₃⁻, then
        putting them together, then checking for compensation, then looking at oxygenation
        separately. Once that order becomes automatic, most ABGs stop feeling like a puzzle and
        start feeling like a checklist. If you want a place to practice this workflow with
        deterministic feedback, <a href="/abg-lab">ABG Lab</a> walks through the same six steps
        interactively.
      </p>
      <p>
        This guide builds that sequence from the ground up, then applies it to four realistic
        bedside scenarios. As with any lab value, an ABG is one piece of the picture — it should
        always be interpreted alongside the patient in front of you, the trend over time, and your
        facility's protocols.
      </p>

      <h2>Quick reference: normal ABG values</h2>
      <p>
        Keep these ranges in view while you work through the steps below. Reference ranges can vary
        slightly by lab, and some patients (chronic lung disease, high altitude, pregnancy) run at a
        different baseline than the textbook range — always compare a new ABG to the patient's own
        prior values when they're available.
      </p>
      <ResponsiveTable
        headers={["Value", "Normal range"]}
        rows={[
          ["pH", "7.35 – 7.45"],
          ["PaCO₂", "35 – 45 mmHg"],
          ["HCO₃⁻", "22 – 26 mEq/L"],
          ["PaO₂", "≈ 80 – 100 mmHg"],
          ["SaO₂", "≈ 95 – 100%"],
        ]}
      />

      <h2>Step 1: Look at the pH</h2>
      <p>
        Start here, every time. The pH tells you whether the patient is acidemic, alkalemic, or
        within normal range:
      </p>
      <ul>
        <li><strong>Below 7.35</strong> — acidemia</li>
        <li><strong>Above 7.45</strong> — alkalemia</li>
        <li><strong>7.35 – 7.45</strong> — normal range</li>
      </ul>
      <p>
        The catch: a normal pH doesn't automatically mean a normal ABG. If both PaCO₂ and HCO₃⁻ are
        abnormal but pushing pH in opposite directions, the body may have compensated its way back
        into range. You won't catch that if you stop at the pH — which is exactly why the next steps
        matter.
      </p>

      <h2>Step 2: Look at PaCO₂ — the respiratory piece</h2>
      <p>
        PaCO₂ reflects how effectively the lungs are clearing carbon dioxide, and it can change in
        minutes, which is what makes it the "respiratory" number.
      </p>
      <ul>
        <li><strong>High PaCO₂ (&gt; 45)</strong> — CO₂ is being retained, pushing the patient toward respiratory acidosis</li>
        <li><strong>Low PaCO₂ (&lt; 35)</strong> — CO₂ is being blown off, pushing the patient toward respiratory alkalosis</li>
      </ul>
      <p>
        In plain terms: slow, shallow, or ineffective breathing lets CO₂ build up. Fast, deep
        breathing clears it out. Anything that changes rate, depth, or effort of ventilation can move
        this number.
      </p>

      <h2>Step 3: Look at HCO₃⁻ — the metabolic piece</h2>
      <p>
        Bicarbonate is managed by the kidneys over hours to days, which makes it the "metabolic"
        number — it moves slowly compared to PaCO₂.
      </p>
      <ul>
        <li><strong>Low HCO₃⁻ (&lt; 22)</strong> — pushes the patient toward metabolic acidosis</li>
        <li><strong>High HCO₃⁻ (&gt; 26)</strong> — pushes the patient toward metabolic alkalosis</li>
      </ul>
      <p>
        Because the kidneys work slowly, a shifted HCO₃⁻ often signals something that's been building
        for a while, or the kidneys' attempt to compensate for a respiratory problem.
      </p>

      <h2>Step 4: Determine the primary disorder</h2>
      <p>
        Now connect the three numbers. Ask: which value — PaCO₂ or HCO₃⁻ — moved in the{" "}
        <em>same direction</em> as the pH disturbance? That's your primary disorder. Whichever value
        moved in the opposite direction is the body attempting to compensate.
      </p>
      <ResponsiveTable
        headers={["Disorder", "pH", "PaCO₂", "HCO₃⁻"]}
        rows={[
          ["Respiratory acidosis", "↓", "↑ (primary)", "normal or ↑ (compensating)"],
          ["Respiratory alkalosis", "↑", "↓ (primary)", "normal or ↓ (compensating)"],
          ["Metabolic acidosis", "↓", "normal or ↓ (compensating)", "↓ (primary)"],
          ["Metabolic alkalosis", "↑", "normal or ↑ (compensating)", "↑ (primary)"],
        ]}
      />

      <h2>Step 5: Assess compensation</h2>
      <p>
        Once you've named the primary disorder, check what the other system is doing:
      </p>
      <ul>
        <li><strong>Uncompensated</strong> — the primary value is abnormal, the other value is still within normal range</li>
        <li><strong>Partially compensated</strong> — pH is still abnormal, but the compensating value has started shifting in the right direction</li>
        <li><strong>Fully compensated</strong> — pH has been brought back into 7.35–7.45, even though both PaCO₂ and HCO₃⁻ are abnormal</li>
      </ul>
      <p>
        This is the step that catches the "normal pH that isn't actually normal." A fully compensated
        ABG can look reassuring at a glance while both underlying values are clearly off — which is
        why Step 1 alone is never enough. You don't need Winter's formula or expected-compensation
        math to function safely at the bedside; recognizing whether pH normalized despite abnormal
        CO₂ and HCO₃⁻ is enough to flag that something is going on and worth discussing with the
        team.
      </p>

      <h2>Step 6: Assess oxygenation</h2>
      <p>
        Oxygenation is a separate question from acid-base status — don't let a normal PaO₂ distract
        from an acid-base problem, and don't let acid-base numbers distract from an oxygenation
        problem. PaO₂ and SaO₂ only mean something in context:
      </p>
      <ul>
        <li>What supplemental oxygen or FiO₂ is the patient currently on?</li>
        <li>If they're vented, what are the current settings?</li>
        <li>What does the continuous pulse oximetry trend look like, not just the one-time SpO₂?</li>
        <li>How does the patient actually look — color, work of breathing, use of accessory muscles?</li>
        <li>How is perfusion — could a poor waveform be affecting the SpO₂ reading itself?</li>
        <li>What's the overall clinical trajectory over the last several hours?</li>
      </ul>
      <p>
        A PaO₂ of 90 on room air and a PaO₂ of 90 on 6L of oxygen tell two very different stories. If
        you want a fast bedside reference for oxygen devices, ventilator basics, and related
        parameters, <a href="/reference-hub">Reference Hub</a> is built for exactly that kind of
        lookup.
      </p>

      <h2>Four worked ABG examples</h2>
      <p>
        These are educational examples meant to illustrate the six-step process, not a substitute
        for assessing an actual patient. Real cases require full clinical context, trends, and
        facility protocol.
      </p>

      <ExampleCard
        number={1}
        label="Respiratory acidosis"
        values={{ ph: "7.28", paco2: "58 mmHg", hco3: "24 mEq/L", pao2: "68 mmHg", sao2: "90% (room air)" }}
        interpretation="pH is acidic. PaCO₂ is high and moving in the same direction as the pH — respiratory acidosis. HCO₃⁻ is still within normal range, so this is uncompensated. Oxygenation is also impaired."
        situations={[
          "Opioid- or sedative-related hypoventilation",
          "COPD exacerbation",
          "Neuromuscular weakness affecting ventilation",
          "Airway obstruction or severe fatigue from work of breathing",
        ]}
        assessNext={[
          "Level of consciousness and sedation score",
          "Respiratory rate, depth, and pattern",
          "Timing of recent opioid or sedative administration",
          "Breath sounds and accessory muscle use",
          "Trend compared with the prior ABG, and prompt escalation per facility protocol if worsening",
        ]}
      />

      <ExampleCard
        number={2}
        label="Respiratory alkalosis"
        values={{ ph: "7.49", paco2: "29 mmHg", hco3: "23 mEq/L", pao2: "92 mmHg", sao2: "97% (2L NC)" }}
        interpretation="pH is alkalotic. PaCO₂ is low and moving in the same direction — respiratory alkalosis. HCO₃⁻ is normal, so this is uncompensated."
        situations={[
          "Pain, anxiety, or fear driving tachypnea",
          "Early compensatory tachypnea before other signs of sepsis appear",
          "Fever",
          "Pregnancy-related physiologic changes in ventilation",
        ]}
        assessNext={[
          "Pain score and anxiety level",
          "Respiratory rate and pattern over time",
          "Temperature trend and any new signs of infection",
          "Any subtle change in mentation or vital sign trend worth reporting",
        ]}
      />

      <ExampleCard
        number={3}
        label="Metabolic acidosis"
        values={{ ph: "7.29", paco2: "30 mmHg", hco3: "15 mEq/L", pao2: "95 mmHg", sao2: "97% (room air)" }}
        interpretation="pH is acidic. HCO₃⁻ is low and moving in the same direction — metabolic acidosis. PaCO₂ is also low, moving in the direction that would compensate, but pH hasn't normalized — this is a partially compensated metabolic acidosis, likely driven by a respiratory response (faster, deeper breathing to blow off CO₂)."
        situations={[
          "Diabetic ketoacidosis",
          "Sepsis with lactic acidosis",
          "Renal impairment",
          "Significant diarrhea with bicarbonate losses",
        ]}
        assessNext={[
          "Fingerstick glucose and ketones if DKA is suspected",
          "Most recent lactate and trend",
          "Urine output and hydration status",
          "Mental status changes",
          "Escalating promptly per findings, orders, and facility protocol",
        ]}
      />

      <ExampleCard
        number={4}
        label="Metabolic alkalosis"
        values={{ ph: "7.48", paco2: "46 mmHg", hco3: "31 mEq/L", pao2: "88 mmHg", sao2: "96% (3L NC)" }}
        interpretation="pH is alkalotic. HCO₃⁻ is high and moving in the same direction — metabolic alkalosis. PaCO₂ is mildly elevated, moving in the compensating direction, but pH remains abnormal — partially compensated metabolic alkalosis."
        situations={[
          "Prolonged vomiting or NG tube suctioning",
          "Diuretic therapy",
          "Hypokalemia",
          "Volume contraction",
        ]}
        assessNext={[
          "Emesis or NG output volume and character",
          "Recent diuretic dosing and timing",
          "Most recent potassium level",
          "Volume status — intake/output trend, weight",
          "Escalating per findings and facility protocol",
        ]}
      />

      <p>
        Several of these situations — particularly severe acidosis or the electrolyte shifts that
        often accompany it — can also produce ECG changes worth tracking on the monitor. If strip
        interpretation isn't second nature yet, <a href="/rhythm-lab">Rhythm Lab</a> covers a
        systematic approach to reading rhythms. And if the patient is on sedation or a vasoactive
        infusion, understanding what that drip does to respiratory drive and perfusion is part of
        reading the full picture — <a href="/icu-drips">ICU Drips</a> has bedside monitoring context
        for common critical care infusions.
      </p>

      <h2>Common ABG interpretation mistakes</h2>
      <ul>
        <li>Looking at oxygenation before acid-base status, instead of after</li>
        <li>Forgetting to check whether — and how much — supplemental oxygen the patient is on</li>
        <li>Assuming a normal pH means the entire ABG is normal</li>
        <li>Interpreting the numbers without looking at the patient</li>
        <li>Mixing up which direction respiratory versus metabolic disorders push the values</li>
        <li>Reading one ABG in isolation instead of comparing it to the trend</li>
        <li>Treating a single ABG value as a diagnosis rather than a piece of the clinical picture</li>
      </ul>

      <h2>A simple bedside checklist</h2>
      <ChecklistBox
        items={[
          "Is the pH acidic, alkalotic, or normal?",
          "Does PaCO₂ explain the pH?",
          "Does HCO₃⁻ explain the pH?",
          "Is compensation present — partial or full?",
          "How is the patient oxygenating, and on what device or setting?",
          "What does the patient actually look like right now?",
          "What changed from the previous ABG?",
          "Does this require prompt escalation?",
        ]}
      />

      <h2>Frequently asked questions</h2>
      <FaqList
        items={[
          {
            q: "What is the easiest way to remember ABG interpretation?",
            a: "Run the same order every time: pH, then PaCO₂, then HCO₃⁻, then match the primary disorder, then check compensation, then assess oxygenation separately. Consistency matters more than any mnemonic.",
          },
          {
            q: "Can an ABG have a normal pH and still be abnormal?",
            a: "Yes. If PaCO₂ and HCO₃⁻ are both abnormal but push pH in opposite directions, the ABG can be fully compensated — pH looks normal, but the underlying problem is still there.",
          },
          {
            q: "What is the difference between an ABG and a VBG?",
            a: "An ABG samples arterial blood and gives a reliable read on oxygenation as well as acid-base status. A VBG samples venous blood — it can approximate pH and CO₂ trends but is not reliable for oxygenation. Facility protocol determines which is appropriate for a given situation.",
          },
          {
            q: "Does a low PaO₂ always mean the patient needs more oxygen?",
            a: "Not automatically. A low PaO₂ has to be interpreted alongside current FiO₂ or oxygen device, the SpO₂ trend, work of breathing, and how the patient looks. Any change in oxygen therapy follows orders and facility protocol.",
          },
          {
            q: "How often should ABGs be repeated?",
            a: "It depends on the clinical situation, provider orders, recent interventions, and facility protocol — there's no single fixed interval. A worsening trend or a significant clinical change is usually what prompts a repeat.",
          },
          {
            q: "What does compensation mean?",
            a: "Compensation is the body's attempt to normalize pH by adjusting the system that isn't primarily affected — the kidneys respond to a respiratory problem, or the lungs respond to a metabolic one. It can be absent, partial, or full.",
          },
        ]}
      />

      <Callout title="Safety note" tone="safety">
        <p>
          This article is educational and intended to support clinical reasoning, not replace it. It
          is not a substitute for facility protocol, provider guidance, or your own clinical
          judgment. Always interpret ABG values alongside the full patient assessment and trend over
          time, and escalate per your facility's policies when something doesn't add up.
        </p>
      </Callout>
    </>
  );
}
