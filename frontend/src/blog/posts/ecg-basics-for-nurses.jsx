import { ResponsiveTable, Callout, ChecklistBox, RhythmCard, FaqList, TableOfContents } from "../components.jsx";

const TOC_ITEMS = [
  { id: "before-the-strip", label: "Before the strip: is the patient stable?" },
  { id: "ecg-paper", label: "Understand ECG paper" },
  { id: "step-1-heart-rate", label: "Step 1: Heart rate" },
  { id: "step-2-regularity", label: "Step 2: Regularity" },
  { id: "step-3-p-waves", label: "Step 3: P waves" },
  { id: "step-4-pr-interval", label: "Step 4: PR interval" },
  { id: "step-5-qrs", label: "Step 5: QRS complex" },
  { id: "five-steps-together", label: "Put the five steps together" },
  { id: "five-rhythms", label: "Five rhythms to recognize" },
  { id: "common-intervals", label: "Common ECG intervals" },
  { id: "beginner-mistakes", label: "Common beginner mistakes" },
  { id: "practice-strip", label: "Practice strip walkthrough" },
  { id: "cheat-sheet", label: "Quick ECG cheat sheet" },
  { id: "key-takeaway", label: "Key takeaway" },
  { id: "faq", label: "Frequently asked questions" },
  { id: "references", label: "References" },
];

const PAPER_DIAGRAM_CELL = 18;

function PaperGrid({ cols, rows, highlightCols, highlightRows }) {
  const cell = PAPER_DIAGRAM_CELL;
  const w = cell * cols;
  const h = cell * rows;
  const lines = [];
  for (let c = 0; c <= cols; c++) {
    lines.push(
      <line key={`v${c}`} x1={c * cell} y1={0} x2={c * cell} y2={h}
        stroke={c % 5 === 0 ? "#c99a9a" : "#e8caca"} strokeWidth={c % 5 === 0 ? 1.3 : 0.6} />
    );
  }
  for (let r = 0; r <= rows; r++) {
    lines.push(
      <line key={`h${r}`} x1={0} y1={r * cell} x2={w} y2={r * cell}
        stroke={r % 5 === 0 ? "#c99a9a" : "#e8caca"} strokeWidth={r % 5 === 0 ? 1.3 : 0.6} />
    );
  }
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#FFFDF8" />
      {lines}
      <rect x={0} y={0} width={highlightCols * cell} height={highlightRows * cell} fill="none" stroke="#0A8F8D" strokeWidth={2} />
    </g>
  );
}

function EcgPaperDiagram() {
  return (
    <figure className="ce-diagram">
      <svg viewBox="0 0 460 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ecg-paper-diagram-title">
        <title id="ecg-paper-diagram-title">Diagram of ECG paper: one small box and one large box, with timing labels</title>
        <g transform="translate(10,10)">
          <PaperGrid cols={5} rows={5} highlightCols={1} highlightRows={1} />
          <text x={45} y={112} textAnchor="middle" fontSize="11" fill="#526174" fontFamily="Inter, sans-serif">1 small box = 0.04 sec</text>
        </g>
        <g transform="translate(190,10)">
          <PaperGrid cols={12} rows={5} highlightCols={5} highlightRows={5} />
          <text x={108} y={112} textAnchor="middle" fontSize="11" fill="#526174" fontFamily="Inter, sans-serif">1 large box (5 small) = 0.20 sec</text>
        </g>
      </svg>
      <figcaption>Simplified diagram, not to scale. Timing assumes standard 25 mm/second paper speed.</figcaption>
    </figure>
  );
}

function PracticeStripDiagram() {
  const cycle = "M0,60 L9,60 L12,53 L15,60 L21,60 L25,42 L28,82 L32,50 L37,60 L48,60 L55,44 L64,60 L118,60";
  const cellW = 24;
  const cols = 20;
  const rows = 6;
  const width = cellW * cols;
  const height = cellW * rows;
  const gridLines = [];
  for (let c = 0; c <= cols; c++) {
    gridLines.push(
      <line key={`v${c}`} x1={c * cellW} y1={0} x2={c * cellW} y2={height}
        stroke={c % 5 === 0 ? "#c99a9a" : "#e8caca"} strokeWidth={c % 5 === 0 ? 1.1 : 0.5} />
    );
  }
  for (let r = 0; r <= rows; r++) {
    gridLines.push(
      <line key={`h${r}`} x1={0} y1={r * cellW} x2={width} y2={r * cellW}
        stroke={r % 5 === 0 ? "#c99a9a" : "#e8caca"} strokeWidth={r % 5 === 0 ? 1.1 : 0.5} />
    );
  }
  return (
    <figure className="ce-diagram">
      <svg viewBox={`0 0 ${width} ${height + 20}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="practice-strip-title">
        <title id="practice-strip-title">Simplified normal sinus rhythm waveform used in the practice walkthrough</title>
        <rect x={0} y={0} width={width} height={height} fill="#FFFDF8" />
        {gridLines}
        <g transform="translate(6,30)">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={cycle} transform={`translate(${i * 118},0)`} fill="none" stroke="#8E2F2F" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </g>
      </svg>
      <figcaption>Simplified educational example, not an actual patient tracing. Regular rhythm, one P wave before each QRS, narrow QRS.</figcaption>
    </figure>
  );
}

export default function EcgBasicsForNurses() {
  return (
    <>
      <p>
        A rhythm strip has a way of looking like noise until you know what order to look at it in. New
        nurses (and plenty of experienced ones starting on telemetry for the first time) often try to
        recognize a rhythm by its overall shape, the way you'd recognize a face. That works once you've
        seen a few thousand strips. Before that, it's slow and it's easy to miss something.
      </p>
      <p>
        The more reliable approach is to ask the same five questions in the same order every time: how
        fast, how regular, what do the P waves look like, how long is the PR interval, and how wide is
        the QRS. Once that sequence is automatic, most common rhythms sort themselves out without you
        having to guess.
      </p>
      <p>
        One thing to hold onto before any of that: the monitor shows you electrical activity, not the
        patient. Rhythm interpretation and bedside assessment happen together. A strip that looks
        abnormal on a patient who's talking to you comfortably is a different situation than the same
        strip on a patient who is pale, diaphoretic, and confused.
      </p>

      <TableOfContents items={TOC_ITEMS} />

      <h2 id="before-the-strip">Before the Strip: Is the Patient Stable?</h2>
      <p>
        Look at the patient before you get absorbed in the rhythm. A monitor number or an alarm should
        prompt an assessment, not a conclusion. Things that raise concern regardless of what the strip
        ends up showing:
      </p>
      <ul>
        <li>Hypotension</li>
        <li>Altered mental status</li>
        <li>Signs of shock, such as poor perfusion or cool, mottled skin</li>
        <li>Ischemic chest discomfort</li>
        <li>Acute heart failure symptoms, like sudden shortness of breath or new jugular venous distention</li>
        <li>Syncope or severe respiratory distress</li>
      </ul>
      <p>
        It's also worth ruling out the boring explanation first. Artifact from patient movement, a loose
        lead, dried-out or poorly placed electrodes, and even the patient brushing their teeth can all
        produce a strip that looks dramatic and means nothing. Before treating a rhythm as real, confirm
        the leads are attached correctly and, if anything is in doubt, check a manual pulse and blood
        pressure against what the monitor is telling you. Beyond that kind of verification, what you do
        next depends on the patient's condition, current orders, your emergency protocols, and facility
        policy.
      </p>

      <h2 id="ecg-paper">Understand ECG Paper</h2>
      <p>
        ECG paper is a grid, and the grid is a timer. At the standard paper speed of 25 mm per second:
      </p>
      <ul>
        <li>One small box equals 0.04 seconds</li>
        <li>One large box (five small boxes) equals 0.20 seconds</li>
        <li>Five large boxes equal 1 second</li>
        <li>Thirty large boxes equal 6 seconds</li>
      </ul>
      <EcgPaperDiagram />
      <p>
        Everything in the next five steps, rate, intervals, QRS width, comes back to counting these
        boxes.
      </p>

      <h2 id="step-1-heart-rate">Step 1: Determine the Heart Rate</h2>
      <p>
        A normal adult resting sinus rate is generally 60 to 100 beats per minute. Below 60 is
        bradycardia. Above 100 is tachycardia. Whether a given rate actually matters depends on the
        patient, their baseline, and what's driving it, not just which side of 60 or 100 it falls on.
      </p>

      <h3 id="six-second-method">Six-second method</h3>
      <p>
        Count the QRS complexes in a six-second strip (30 large boxes) and multiply by 10. This method
        is fast and works for irregular rhythms, but it's an estimate rather than an exact number.
      </p>

      <h3 id="300-method">300 method</h3>
      <p>
        For a regular rhythm, find an R wave sitting on a large box line, then count the large boxes to
        the next R wave and divide 300 by that number. Most people memorize the sequence instead of
        doing the division each time:
      </p>
      <ResponsiveTable
        headers={["Large boxes between R waves", "1", "2", "3", "4", "5", "6"]}
        rows={[["Rate (bpm)", "300", "150", "100", "75", "60", "50"]]}
      />
      <p>
        This method is quick, but it only works cleanly on a regular rhythm. For anything irregular,
        the six-second method or a timed strip is more reliable.
      </p>

      <h2 id="step-2-regularity">Step 2: Determine Whether the Rhythm Is Regular</h2>
      <p>
        Compare the space between consecutive R waves across the strip. A rhythm can be:
      </p>
      <ul>
        <li><strong>Regular</strong>: the R-to-R intervals stay essentially the same throughout</li>
        <li><strong>Regularly irregular</strong>: there's a repeating pattern to the variation, such as grouped beats</li>
        <li><strong>Irregularly irregular</strong>: there's no predictable pattern at all</li>
      </ul>
      <p>
        Atrial fibrillation is the classic irregularly irregular rhythm, but it isn't the only rhythm
        that can look irregular. Regularity tells you where to look next, not the final answer.
      </p>

      <h2 id="step-3-p-waves">Step 3: Examine the P Waves</h2>
      <p>Ask four questions:</p>
      <ul>
        <li>Are P waves present at all?</li>
        <li>Do they look similar to one another?</li>
        <li>Is there one P wave before every QRS?</li>
        <li>Is every P wave followed by a QRS?</li>
      </ul>
      <p>
        The P wave represents atrial depolarization, the electrical signal spreading through the atria
        just before they contract. Absent P waves, P waves that vary in shape, or P waves that don't
        line up consistently with the QRS can point toward a nonsinus rhythm or a conduction problem.
        No single feature makes the diagnosis on its own though. The P wave is one piece you carry into
        the next two steps.
      </p>

      <h2 id="step-4-pr-interval">Step 4: Measure the PR Interval</h2>
      <p>
        The commonly taught normal adult PR interval is <strong>0.12 to 0.20 seconds</strong>. Measure
        from the start of the P wave to the start of the QRS complex.
      </p>
      <ul>
        <li>In a normal sinus rhythm, the PR interval stays consistent from beat to beat</li>
        <li>A prolonged PR interval can suggest a delay somewhere in AV conduction</li>
        <li>A short PR interval can suggest pre-excitation or a rhythm originating near the AV junction</li>
        <li>A PR interval that changes or progressively lengthens is also a meaningful clue</li>
      </ul>
      <p>
        A full breakdown of AV block patterns is beyond what a beginner needs on the first pass. For now,
        knowing the normal range and recognizing when something looks off is enough to flag it for
        closer review and, when appropriate, escalation.
      </p>

      <h2 id="step-5-qrs">Step 5: Measure the QRS Complex</h2>
      <p>
        A normal, narrow QRS is generally <strong>less than 0.12 seconds</strong>. A QRS duration of
        0.12 seconds or greater is considered wide.
      </p>
      <p>
        A wide QRS means ventricular depolarization is happening outside the normal, fast conduction
        pathway. Possible reasons include a bundle branch block, a rhythm originating in the
        ventricles, a paced rhythm, certain medication effects, or a metabolic abnormality such as a
        significant electrolyte disturbance. Not every wide, fast rhythm is ventricular tachycardia,
        but a regular wide-complex tachycardia should be treated with real caution and escalated
        promptly rather than assumed to be something benign.
      </p>

      <h2 id="five-steps-together">Put the Five Steps Together</h2>
      <Callout title="The five-step sequence">
        <ol style={{ margin: "0 0 10px", paddingLeft: 20 }}>
          <li>Rate</li>
          <li>Regularity</li>
          <li>P waves</li>
          <li>PR interval</li>
          <li>QRS width</li>
        </ol>
        <p style={{ marginBottom: 0 }}>
          Then, always: compare the strip with the patient's symptoms, vital signs, baseline rhythm,
          medications, electrolytes, and overall clinical condition.
        </p>
      </Callout>
      <p>Save or screenshot this worksheet-style version for the bedside:</p>
      <ChecklistBox
        items={[
          "Rate: count it (six-second method or the 300 method)",
          "Regularity: regular, regularly irregular, or irregularly irregular?",
          "P waves: present, consistent, one before every QRS?",
          "PR interval: 0.12 to 0.20 seconds, and is it consistent?",
          "QRS: narrow (under 0.12 sec) or wide (0.12 sec or more)?",
          "Patient: stable or unstable, and what changed since the last check?",
        ]}
      />

      <h2 id="five-rhythms">Five Rhythms Every Beginner Should Recognize</h2>
      <p>
        These summaries describe typical presentations to build recognition. Real strips vary, and a
        rhythm should always be read alongside the patient in front of you.
      </p>

      <RhythmCard
        name="Normal sinus rhythm"
        rate="60–100"
        regularity="Regular"
        pWaves="Upright, consistent, one before every QRS"
        prInterval="Consistent, 0.12–0.20 sec"
        qrs="Narrow"
        whyItMatters="This is the reference point every other rhythm gets compared against."
        clinicalNote="Exact P-wave shape depends on which lead you're viewing. A sinus rhythm just means the sinus node is setting the pace with normal conduction to the ventricles."
      />
      <RhythmCard
        name="Sinus bradycardia"
        rate="Under 60"
        regularity="Regular"
        pWaves="Normal sinus P waves"
        prInterval="Normal"
        qrs="Narrow"
        whyItMatters="A slow sinus rhythm isn't automatically a problem, but it can be depending on context and how the patient is tolerating it."
        clinicalNote="Possible contexts include sleep, athletic conditioning, certain medications, inferior myocardial ischemia, hypothermia, and underlying conduction disease. Symptoms and perfusion drive urgency, not the number alone."
      />
      <RhythmCard
        name="Sinus tachycardia"
        rate="Over 100"
        regularity="Regular"
        pWaves="Normal sinus P waves"
        prInterval="Normal"
        qrs="Narrow"
        whyItMatters="Sinus tachycardia is usually the heart responding to something else going on in the body."
        clinicalNote="Common causes include pain, fever, hypovolemia, anxiety, hypoxemia, infection, anemia, pulmonary embolism, and medication effects. The underlying cause is what needs assessment, not just the rate on the monitor."
      />
      <RhythmCard
        name="Atrial fibrillation"
        rate="Variable"
        regularity="Irregularly irregular"
        pWaves="No consistent, organized P waves"
        prInterval="Not measurable"
        qrs="Usually narrow, unless another conduction issue is present"
        whyItMatters="Atrial fibrillation is the most common sustained arrhythmia and carries a real stroke risk because blood can pool and clot in the quivering atria."
        clinicalNote="Rate control, rhythm strategy, and anticoagulation decisions are individualized and made by the care team based on the full clinical picture, not from the strip alone."
      />
      <RhythmCard
        name="Ventricular tachycardia"
        rate="Usually fast"
        regularity="Usually regular"
        pWaves="Often absent or dissociated from the QRS"
        prInterval="Not measurable"
        qrs="Wide"
        whyItMatters="A regular, wide-complex tachycardia should be assumed to be ventricular tachycardia until proven otherwise."
        clinicalNote="Assess the patient immediately, check for a pulse, and determine stability. This is a rhythm that gets escalated fast, following your emergency protocols rather than a delayed workup."
      />

      <h2 id="common-intervals">Common ECG Intervals</h2>
      <ResponsiveTable
        headers={["Measurement", "Commonly taught adult reference"]}
        rows={[
          ["PR interval", "0.12 to 0.20 sec"],
          ["QRS duration", "Less than 0.12 sec"],
          ["One small box", "0.04 sec"],
          ["One large box", "0.20 sec"],
        ]}
      />
      <p>
        QT and QTc are intentionally left out of this table. Interpreting a QTc depends on heart rate,
        which correction formula is used, sex, medications, electrolytes, and the broader clinical
        picture, so a single universal cutoff isn't something a beginner article can responsibly hand
        you as a rule of thumb. Treat QTc as a value your facility's reference tools and provider
        interpret in context, not one flat number to memorize here.
      </p>

      <h2 id="beginner-mistakes">Common Beginner Mistakes</h2>
      <ul>
        <li>Looking at the monitor before assessing the patient</li>
        <li>Trusting an alarm without checking the patient and the leads first</li>
        <li>Identifying a rhythm from one feature alone, like rate or regularity by itself</li>
        <li>Forgetting to compare the current strip with the patient's baseline rhythm</li>
        <li>Ignoring medications and electrolytes that could explain what you're seeing</li>
        <li>Calling every fast, narrow rhythm SVT without looking closer</li>
        <li>Calling every wide rhythm ventricular tachycardia without considering other causes</li>
        <li>Treating monitor rhythm interpretation as the same thing as a full 12-lead ECG interpretation</li>
      </ul>
      <p>
        A telemetry strip tells you about rhythm. It's a single view of electrical activity and it does
        not replace a diagnostic 12-lead ECG when one is clinically indicated.
      </p>

      <h2 id="practice-strip">Practice Strip Walkthrough</h2>
      <p>Here's one worked example using the five steps:</p>
      <ul>
        <li>Rate: approximately 84</li>
        <li>Regularity: regular R-to-R intervals</li>
        <li>P waves: one consistent, upright P wave before each QRS</li>
        <li>PR interval: 0.16 seconds</li>
        <li>QRS duration: 0.08 seconds</li>
      </ul>
      <PracticeStripDiagram />
      <p>
        Rate is within normal limits, the rhythm is regular, every QRS has a matching P wave in front of
        it, the PR interval falls inside 0.12 to 0.20 seconds, and the QRS is narrow. That combination
        is a normal sinus rhythm.
      </p>

      <h2 id="cheat-sheet">Quick ECG Cheat Sheet</h2>
      <Callout title="Save this">
        <p style={{ marginBottom: 6 }}><strong>RATE</strong>: How fast?</p>
        <p style={{ marginBottom: 6 }}><strong>RHYTHM</strong>: Regular or irregular?</p>
        <p style={{ marginBottom: 6 }}><strong>P WAVES</strong>: Present and consistent?</p>
        <p style={{ marginBottom: 6 }}><strong>PR</strong>: 0.12 to 0.20 seconds?</p>
        <p style={{ marginBottom: 6 }}><strong>QRS</strong>: Narrow or wide?</p>
        <p style={{ marginBottom: 0 }}><strong>PATIENT</strong>: Stable or unstable? What changed?</p>
      </Callout>

      <h2 id="key-takeaway">Key Takeaway</h2>
      <p>
        Don't start by memorizing dozens of rhythm names. Start by asking the same questions in the same
        order, every time, and relating what the strip shows back to the patient it came from. The
        rhythm names come easier once that habit is in place.
      </p>
      <Callout title="Educational disclaimer" tone="safety">
        <p>
          This article is for education and review. ECG findings must be interpreted within the full
          clinical context and according to your professional scope, patient-specific orders, emergency
          protocols, and facility policy.
        </p>
      </Callout>

      <p>
        For a similar step-by-step approach to lab interpretation, see the{" "}
        <a href="/blog/abg-interpretation-for-nurses">ABG interpretation guide</a>. To practice rhythm
        recognition interactively, <a href="/rhythm-lab">Rhythm Lab</a> walks through strips in the same
        systematic way. And if you want to think through how a rhythm finding fits into the bigger
        clinical picture, <a href="/copilot">Copilot</a> can help you reason through the situation
        before you escalate.
      </p>

      <h2 id="faq">Frequently Asked Questions</h2>
      <FaqList
        items={[
          {
            q: "What is the easiest way to read an ECG strip?",
            a: "Use the same five questions every time: rate, regularity, P waves, PR interval, and QRS width. Then compare what you find against the patient's symptoms and baseline.",
          },
          {
            q: "What are the normal PR and QRS intervals?",
            a: "The commonly taught normal PR interval is 0.12 to 0.20 seconds. A normal QRS is generally less than 0.12 seconds; 0.12 seconds or more is considered wide.",
          },
          {
            q: "How do nurses calculate heart rate on a six-second strip?",
            a: "Count the QRS complexes across a six-second strip (30 large boxes) and multiply by 10. It's an estimate, but it works for both regular and irregular rhythms.",
          },
          {
            q: "What makes a rhythm sinus?",
            a: "A sinus rhythm originates from the sinus node: a consistent, upright P wave before every QRS, a stable PR interval, and a rate that can be normal, slow, or fast depending on the sinus rate itself.",
          },
          {
            q: "What is the difference between an ECG strip and a 12-lead ECG?",
            a: "A telemetry strip typically shows one or two leads continuously and is useful for monitoring rhythm over time. A 12-lead ECG captures the heart from twelve different angles and is used for full diagnostic evaluation, including things a single-lead strip can't assess.",
          },
        ]}
      />

      <h2 id="references">References</h2>
      <p style={{ fontSize: 13.5, color: "var(--ce-text-muted)" }}>
        Clinical statements in this article were checked against the following sources at the time of
        writing:
      </p>
      <ul style={{ fontSize: 13.5, color: "var(--ce-text-muted)" }}>
        <li>American Heart Association. <a href="https://www.heart.org/en/health-topics/atrial-fibrillation/what-is-atrial-fibrillation-afib-or-af">What Is Atrial Fibrillation?</a></li>
        <li>American Heart Association. <a href="https://shopcpr.heart.org/acls-prep-ecg">ACLS Prep: ECG</a></li>
        <li>Life in the Fast Lane (LITFL). <a href="https://litfl.com/pr-interval-ecg-library/">PR Interval</a></li>
        <li>Life in the Fast Lane (LITFL). <a href="https://litfl.com/ecg-rate-interpretation/">ECG Rate Interpretation</a></li>
        <li>StatPearls, NCBI Bookshelf, National Library of Medicine. <a href="https://www.ncbi.nlm.nih.gov/books/NBK551635/">P Wave</a></li>
        <li>National Center for Biotechnology Information (PMC). <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6488762/">The Wide Complex Tachycardia Formula: Derivation and Validation Data</a></li>
      </ul>
    </>
  );
}
