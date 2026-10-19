const STEPS = [
  {
    title: 'Rate',
    body: 'Count beats in 6 seconds and multiply by 10, or for regular rhythms, divide 300 by large boxes between R peaks. Under 60 is slow. Over 100 is fast.',
  },
  {
    title: 'Regularity',
    body: 'Are the RR intervals consistent? Tap them out · a steady beat is regular. If you cannot find a pattern, it is irregular. Irregular rhythms demand closer inspection.',
  },
  {
    title: 'P waves',
    body: 'Is there a P wave before each QRS? Upright and uniform with one P per QRS at a consistent PR interval means sinus origin. Hidden P waves and AV dissociation need a longer strip or another lead before assigning the origin.',
  },
  {
    title: 'QRS width',
    body: 'Narrow (under 3 small boxes) suggests the impulse traveled normally through the ventricles · supraventricular origin. Wide (3 or more small boxes) may reflect ventricular origin, conduction delay, pacing, or metabolic toxicity.',
  },
  {
    title: 'P–QRS relationship',
    body: 'Does every P wave produce a QRS? Measure PR from P onset to QRS onset: a fixed PR can be prolonged (> 0.20 s), and some P waves may still be blocked. A variable or absent relationship is the finding that changes the diagnosis.',
  },
];

const QUICK_REF = [
  { tag: 'NSR',     desc: 'Regular · P before every QRS · rate 60–100 · narrow QRS' },
  { tag: 'Sinus Arrhy', desc: 'Same as NSR · irregular RR with breathing · identical P wave every beat' },
  { tag: 'MAT',         desc: 'Fast irregular · ≥3 P-wave shapes · variable PR · narrow QRS · not AFib' },
  { tag: 'PEA',         desc: 'Organized rhythm on monitor · patient has NO pulse · cardiac arrest' },
  { tag: 'Brady',   desc: 'Same as NSR · rate below 60 · more flat baseline between beats' },
  { tag: 'S-Tachy', desc: 'Same as NSR · rate above 100 · P may hide in the T wave' },
  { tag: 'A-Fib',   desc: 'Usually irregularly irregular · no organized P waves · fibrillatory activity may be subtle' },
  { tag: 'Flutter', desc: 'F-waves often ~300/min · fixed or variable AV conduction · ventricular rate varies' },
  { tag: 'V-Tach',  desc: 'Wide bizarre QRS · fast · regular · correlate with patient immediately' },
  { tag: 'PAC',        desc: 'Early ectopic P · usually narrow QRS · can be aberrant or blocked' },
  { tag: 'PVC',        desc: 'Premature wide QRS · no conducting P · compensatory pause common' },
  { tag: 'Jxn',       desc: 'Slow 40–60 · usually narrow QRS · retrograde P before, within, or after QRS' },
  { tag: 'Accel Jxn', desc: 'Rate 60–100 · usually narrow QRS · retrograde or hidden P' },
  { tag: 'Jxn Tachy', desc: '>100 bpm · usually narrow QRS · retrograde/hidden P · rates overlap reentrant SVT' },
  { tag: 'SVT',        desc: 'Regular tachycardia · usually narrow QRS · P may be hidden · abrupt onset favors reentry' },
  { tag: 'HyperK-T',    desc: 'Narrow-based symmetric T · height is nonspecific · ECG cannot grade potassium' },
  { tag: 'HyperK-QRS',  desc: 'Flat P or absent · wide slurred QRS · peaked T merging · conduction failing' },
  { tag: 'HyperK-Sine', desc: 'No P/QRS/T · smooth sinusoidal wave · pre-arrest · correlate with patient now' },
  { tag: 'RBBB',    desc: 'QRS ≥0.12 s · V1 terminal R′, often inverted T · broad S in I/V6 · confirm 12-lead' },
  { tag: 'LBBB',    desc: 'QRS ≥0.12 s · lateral broad/notched R · discordant ST-T · assess symptoms and 12-lead' },
  { tag: '1° AVB',  desc: 'Regular · prolonged constant PR · every P conducts · no drops' },
  { tag: 'Mobitz I', desc: 'Progressive PR lengthening · dropped QRS · grouped beats' },
  { tag: 'Mobitz II', desc: 'Constant PR · sudden QRS drop · no warning · high-risk' },
  { tag: '3° AVB',   desc: 'Independent atrial and ventricular clocks · slow escape · apparent PR varies' },
  { tag: 'IVR',      desc: 'Very slow 20–40 · wide bizarre QRS · no P-QRS relation · ventricular pacemaker' },
  { tag: 'AIVR',     desc: 'Wide QRS · about 50–110 · may overlap slow VT · clinical context matters' },
  { tag: 'V-Escape', desc: 'Late wide beat after pause · ventricle rescues rhythm · opposite of PVC' },
  { tag: 'TdP',      desc: 'Twisting amplitude · polymorphic VT · QT prolongation context · pulseless possible' },
  { tag: 'VFib',     desc: 'Chaotic high-amplitude · no QRS · pulseless · cardiac arrest' },
  { tag: 'Fine VFib',desc: 'Low-amplitude chaotic · nearly flat but active · confirm vs asystole in 2 leads' },
  { tag: 'Asystole', desc: 'Near-flatline · no electrical activity · confirm 2 leads · loose lead rule-out' },
  { tag: 'A-Paced',      desc: 'Spike before every P wave · narrow QRS · normal conduction to ventricles' },
  { tag: 'V-Paced',      desc: 'Spike before wide QRS · atrial activity may be independent · discordant T' },
  { tag: 'AV-Paced',     desc: 'Two spikes per beat · first before P · second before wide QRS · dual-chamber' },
  { tag: 'Fail Capture', desc: 'Spike present but no QRS follows · flatline after spike · myocardium did not respond' },
  { tag: 'Fail Sense',   desc: 'Spike fires right after native beat · pacemaker competing · spike-on-T risk' },
];

export function RecognitionSidebar() {
  return (
    <>
      <p className="sidebar-title">Strip Reading Guide</p>

      <div className="sidebar-section">
        <p className="sidebar-heading">5 reading steps</p>
        <div className="reading-steps">
          {STEPS.map((step, i) => (
            <div key={step.title} className="reading-step">
              <span className="reading-step__num">{i + 1}</span>
              <div className="reading-step__body">
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">Quick keys</p>
        <div className="quick-ref">
          {QUICK_REF.map((row) => (
            <div key={row.tag} className="quick-ref-row">
              <span className="quick-ref-tag">{row.tag}</span>
              <span className="quick-ref-desc">{row.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
